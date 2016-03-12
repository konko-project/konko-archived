'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Topic = mongoose.model('Topic');
const Comment = mongoose.model('Comment');
const Panel = mongoose.model('Panel');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Core = mongoose.model('Core');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let agent;
let t1;
let t2;
let topic;
let p1;
let panel;
let author;
let bannedAuthor;
let adminHeader;
let userHeader;
let bannedHeader;
let guestHeader;
let authorHeader;
let bannedAuthorHeader;

const each = () => {
  beforeEach(done => {
    t1 = {
      title: 'Topic 1',
      content: 'T'.repeat(233),
      author: author,
      panel: panel,
    };
    t2 = {
      title: 'Topic 2',
      content: 'A'.repeat(233),
    };
    Topic.create(t1).then(t1 => {
      topic = t1;
      done();
    });
  });
  afterEach(done => {
    Topic.remove().then(done());
  });
};

describe('Topic CRUD Test:', () => {
  before(done => {
    p1 = {
      name: 'Panel 1',
    };
    Core.create({ basic: { title: 'Test' } }).catch(err => {
      expect(err).to.be.empty();
      return done();
    });
    Panel.create(p1).then(p => panel = p).catch(err => {
      expect(err).to.be.empty();
      return done();
    });
    Profile.create({ username: 'author' }).then(profile => {
      User.create({ email: 'author@test.com', permission: 'user', profile: profile }).then(u => author = u).catch(err => {
        expect(err).to.be.empty();
        return done();
      });
    });
    Profile.create({ username: 'b_author' }).then(profile => {
      User.create({ email: 'b_author@test.com', permission: 'banned', profile: profile }).then(u => bannedAuthor = u).catch(err => {
        expect(err).to.be.empty();
        return done();
      });
    });
    let admin;
    let user;
    let banned;
    let guest;
    Profile.create({ username: 'admin' }).then(profile => {
      User.create({ email: 'admin@test.com', permission: 'admin', profile: profile }).then(u => admin = u).catch(err => {
        expect(err).to.be.empty();
        return done();
      });
    });
    Profile.create({ username: 'user' }).then(profile => {
      User.create({ email: 'user@test.com', permission: 'user', profile: profile }).then(u => user = u).catch(err => {
        expect(err).to.be.empty();
        return done();
      });
    });
    Profile.create({ username: 'banned' }).then(profile => {
      User.create({ email: 'banned@test.com', permission: 'banned', profile: profile }).then(u => banned = u).catch(err => {
        expect(err).to.be.empty();
        return done();
      });
    });
    Profile.create({ username: 'guest' }).then(profile => {
      User.create({ email: 'guest@test.com', permission: 'guest', profile: profile }).then(u => guest = u).catch(err => {
        expect(err).to.be.empty();
        return done();
      });
    });
    let _app = app(path.resolve(SERVER.build.paths.root));
    agent = request.agent(_app);
    agent.get('/').end((err, res) => {
      let csrfToken = /csrfToken=(.*?)(?=\;)/.exec(res.header['set-cookie'].join(''))[1];
      adminHeader = {
        Authorization: `Bearer ${admin.generateJWT(_app)}`,
        'x-csrf-token': csrfToken,
      };
      userHeader = {
        Authorization: `Bearer ${user.generateJWT(_app)}`,
        'x-csrf-token': csrfToken,
      };
      bannedHeader = {
        Authorization: `Bearer ${banned.generateJWT(_app)}`,
        'x-csrf-token': csrfToken,
      };
      guestHeader = {
        Authorization: `Bearer ${guest.generateJWT(_app)}`,
        'x-csrf-token': csrfToken,
      };
      authorHeader = {
        Authorization: `Bearer ${author.generateJWT(_app)}`,
        'x-csrf-token': csrfToken,
      };
      bannedAuthorHeader = {
        Authorization: `Bearer ${bannedAuthor.generateJWT(_app)}`,
        'x-csrf-token': csrfToken,
      };
      done();
    });
  });
  after(done => {
    Profile.remove().then(User.remove().then(Core.remove().then(Panel.remove().then(done()))));
  });
  describe('Testing POST', () => {
    each();
    it('should response 401 when user is a Banned user', done => {
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(bannedHeader)
        .send(t2)
        .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(guestHeader)
        .send(t2)
        .expect(401, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .set('Authorization', '')
        .send(t2)
        .expect(401, done);
    });
    it('should response 400 when panel id is missing in query', done => {
      agent.post('/api/v1/topics')
        .set(userHeader)
        .send(t2)
        .expect(400, done);
    });
    it('should response 500 when panel id is invalid', done => {
      agent.post('/api/v1/topics?panelId=123456')
        .set(userHeader)
        .send(t2)
        .expect(500, done);
    });
    it('should response 404 when panel is not exist in database', done => {
      agent.post(`/api/v1/topics?panelId=${new Panel(p1)._id}`)
        .set(userHeader)
        .send(t2)
        .expect(404, done);
    });
    it('should allow create topic when panel id is valid and user is an User', done => {
      let p = panel;
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t2)
        .expect(201)
        .expect(({ res: { body: { title, content, panel } } }) => {
          expect(title).to.be(t2.title);
          expect(content).to.be(t2.content);
          expect(panel._id).to.be(p._id.toString());
        })
        .end(done);
    });
    it('should allow create topic when panel id is valid and user is an Admin', done => {
      let p = panel;
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(201)
        .expect(({ res: { body: { title, content, panel } } }) => {
          expect(title).to.be(t2.title);
          expect(content).to.be(t2.content);
          expect(panel._id).to.be(p._id.toString());
        })
        .end(done);
    });
    it('should allow create topic that has same title but different content', done => {
      t1.content = 'b'.repeat(123);
      let p = panel;
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(201)
        .expect(({ res: { body: { title, content, panel } } }) => {
          expect(title).to.be(t1.title);
          expect(content).to.be(t1.content);
          expect(panel._id).to.be(p._id.toString());
        })
        .end(done);
    });
    it('should response 500 when topic has same content', done => {
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(500, done);
    });
    it('should response 500 when topic title is too short', done => {
      t1.name = 't';
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(500, done);
    });
    it('should response 500 when topic title is too long', done => {
      t1.name = 't'.repeat(200);
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(500, done);
    });
    it('should response 500 when topic content is too short', done => {
      t1.content = 't';
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(500, done);
    });
    it('should response 500 when topic content is too long', done => {
      t1.content = 't'.repeat(10001);
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(500, done);
    });
    it('should response 400 when topic title is empty', done => {
      t1.title = '';
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(400, done);
    });
    it('should response 400 when topic content is empty', done => {
      t1.content = '';
      agent.post(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .send(t1)
        .expect(400, done);
    });
  });
  describe('Testing GET', () => {
    each();
    it('should response 401 when JWT is missing in header when quering from panel', done => {
      agent.get(`/api/v1/topics?panelId=${panel._id}`).expect(401, done);
    });
    it('should response 401 when JWT is missing in header when quering from user', done => {
      agent.get(`/api/v1/topics?userId=${author._id}`).expect(401, done);
    });
    it('should response 400 when missing quering argument', done => {
      agent.get('/api/v1/topics').set(adminHeader).expect(400, done);
    });
    it('should response all topics of a panel when user is an Admin', done => {
      agent.get(`/api/v1/topics?panelId=${panel._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, title, author }, ...rest] } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(author._id).to.be(topic.author._id.toString());
        })
        .end(done);
    });
    it('should response all topics of a panel when user is an User', done => {
      agent.get(`/api/v1/topics?panelId=${panel._id}`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, title, author }, ...rest] } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(author._id).to.be(topic.author._id.toString());
        })
        .end(done);
    });
    it('should response all topics of a panel when user is Banned', done => {
      agent.get(`/api/v1/topics?panelId=${panel._id}`)
        .set(bannedHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, title, author }, ...rest] } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(author._id).to.be(topic.author._id.toString());
        })
        .end(done);
    });
    it('should response 401 when quering from panel when user is an Guest', done => {
      agent.get(`/api/v1/topics?panelId=${panel._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response all topics of a user when user is an Admin', done => {
      agent.get(`/api/v1/topics?userId=${author._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, title, content, author, panel }, ...rest] } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(content).to.be(topic.content);
          expect(author._id).to.be(topic.author._id.toString());
          expect(panel._id).to.be(topic.panel._id.toString());
        })
        .end(done);
    });
    it('should response all topics of a user when user is an User', done => {
      agent.get(`/api/v1/topics?userId=${author._id}`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, title, content, author, panel }, ...rest] } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(content).to.be(topic.content);
          expect(author._id).to.be(topic.author._id.toString());
          expect(panel._id).to.be(topic.panel._id.toString());
        })
        .end(done);
    });
    it('should response all topics of a user when user is an Banned', done => {
      agent.get(`/api/v1/topics?userId=${author._id}`)
        .set(bannedHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, title, content, author, panel }, ...rest] } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(content).to.be(topic.content);
          expect(author._id).to.be(topic.author._id.toString());
          expect(panel._id).to.be(topic.panel._id.toString());
        })
        .end(done);
    });
    it('should response 401 when quering from user when user is an Guest', done => {
      agent.get(`/api/v1/topics?userId=${author._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 401 when JWT is missing in header when request 1 topic', done => {
      agent.get(`/api/v1/topics/${topic._id}`).expect(401, done);
    });
    it('should response a topic with given its id when user is an Admin', done => {
      agent.get(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: { _id, title, content, author, panel } } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(content).to.be(topic.content);
          expect(author._id).to.be(topic.author._id.toString());
          expect(panel._id).to.be(topic.panel._id.toString());
        })
        .end(done);
    });
    it('should response a topic with given its id when user is an User', done => {
      agent.get(`/api/v1/topics/${topic._id}`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body: { _id, title, content, author, panel } } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(title).to.be(topic.title);
          expect(content).to.be(topic.content);
          expect(author._id).to.be(topic.author._id.toString());
          expect(panel._id).to.be(topic.panel._id.toString());
        })
        .end(done);
    });
    it('should response 401 when a Banned user try to read a topic', done => {
      agent.get(`/api/v1/topics/${topic._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest try to read a topic', done => {
      agent.get(`/api/v1/topics/${topic._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.get('/api/v1/topics/12345').set(adminHeader).expect(400, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.get(`/api/v1/topics/${new Topic(t2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response a topic with given its id and selected fields', done => {
      agent.get(`/api/v1/topics/${topic._id}?fields=_id,content`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: { _id, content } } }) => {
          expect(_id).to.be(topic._id.toString());
          expect(content).to.be(topic.content);
        })
        .end(done);
    });
  });
  describe('Testing PUT', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
      .set(adminHeader)
      .set('Authorization', '')
      .send(t2).expect(401, done);
    });
    it('should allow update a topic when user is an Admin', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(200)
        .expect(({ res: { body: { title, content } } }) => {
          expect(title).to.be(t2.title);
          expect(content).to.be(t2.content);
        })
        .end(done);
    });
    it('should allow update a topic when user is the Author', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(authorHeader)
        .send(t2)
        .expect(200)
        .expect(({ res: { body: { title, content } } }) => {
          expect(title).to.be(t2.title);
          expect(content).to.be(t2.content);
        })
        .end(done);
    });
    it('should response 401 when user is the Author but banned', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(bannedAuthorHeader)
        .send(t2)
        .expect(401, done);
    });
    it('should response 401 when user is an User other than Author', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(userHeader)
        .send(t2)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user other than Author', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(bannedHeader)
        .send(t2)
        .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(guestHeader)
        .send(t2)
        .expect(401, done);
    });
    it('should response 404 when topic id is missing', done => {
      agent.put('/api/v1/topics')
        .set(adminHeader)
        .send(t2)
        .expect(404, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.put('/api/v1/topics/12345')
        .set(adminHeader)
        .send(t2)
        .expect(400, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.put(`/api/v1/topics/${new Topic(t2)._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(404, done);
    });
    it('should response 400 when topic title is empty', done => {
      t2.title = '';
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(400, done);
    });
    it('should response 500 when topic title is too short', done => {
      t2.title = 't';
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(500, done);
    });
    it('should response 500 when topic title is too long', done => {
      t2.title = 't'.repeat(200);
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(500, done);
    });
    it('should response 400 when topic content is empty', done => {
      t2.content = '';
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(400, done);
    });
    it('should response 500 when topic content is too short', done => {
      t2.content = 't';
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(500, done);
    });
    it('should response 500 when topic content is too long', done => {
      t2.content = 't'.repeat(20000);
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(500, done);
    });
    it('should allow update a topic with valid data', done => {
      agent.put(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .send(t2)
        .expect(200)
        .expect(({ res: { body: { title, content } } }) => {
          expect(title).to.be(t2.title);
          expect(content).to.be(t2.content);
        })
        .end(done);
    });
  });
  describe('Testing DELETE', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow delete a topic when user is an Admin', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(res => Topic.findOne(topic).then(topic => expect(topic).to.be.empty()))
        .end(done);
    });
    it('should response 401 when user is the Author', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(authorHeader)
        .expect(401, done);
    });
    it('should response 401 when user is the Author but banned', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(bannedAuthorHeader)
        .expect(401, done);
    });
    it('should response 401 when user is an User other than author', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user other than author', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 404 when topic id is missing', done => {
      agent.del('/api/v1/topics')
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.del('/api/v1/topics/12345')
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.del(`/api/v1/topics/${new Topic(t2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should allow delete a topic with no comment', done => {
      agent.del(`/api/v1/topics/${topic._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(res => Topic.findOne(topic).then(topic => expect(topic).to.be.empty()))
        .end(done);
    });
    it('should allow delete a topic with comment', done => {
      Comment.create({ content: 't'.repeat(100) }).then(comment => {
        comment.topic = topic;
        comment.save().then(comment => {
          topic.comments.push(comment);
          topic.save().then(topic => {
            agent.del(`/api/v1/topics/${topic._id}`)
              .set(adminHeader)
              .expect(200)
              .expect(res => {
                Topic.findOne(topic).then(topic => expect(topic).to.be.empty());
                Comment.find({ topic: topic }).then(comments => expect(comments).to.be.empty());
              })
              .end((err, res) => {
                if (err) {
                  expect(err).to.be.empty();
                  return done(err);
                }
                Comment.remove().then(done());
              });
          });
        });
      });
    });
  });
  describe('Testing like a topic', () => {
    each();
    it('should response 401 when JWT is missing in header when like', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow a topic being liked by an Admin', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .expect(204, done);
    });
    it('should allow a topic being liked by an User', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(userHeader)
        .expect(204, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 403 when a topic is already liked by a user', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .expect(204)
        .end((err, res) => {
          if (err) {
            expect(err).to.be.empty();
            return done(err);
          }
          agent.put(`/api/v1/topics/${topic._id}/like`)
            .set(adminHeader)
            .expect(403, done);
        });
    });
  });
  describe('Testing un-like a topic', () => {
    each();
    it('should response 401 when JWT is missing in header when un-like', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/like`)
            .set(adminHeader)
            .set('Authorization', '')
            .expect(401, done);
        });
    });
    it('should allow unlike a topic by an Admin', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/like`)
            .set(adminHeader)
            .expect(204, done);
        });
    });
    it('should allow unlike a topic by an User', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/like`)
            .set(userHeader)
            .expect(204, done);
        });
    });
    it('should response 401 when user is a Banned user', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/like`)
            .set(bannedHeader)
            .expect(401, done);
        });
    });
    it('should response 401 when a Guest', done => {
      agent.put(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/like`)
            .set(guestHeader)
            .expect(401, done);
        });
    });
    it('should response 204 when user did not like the topic at first', done => {
      agent.del(`/api/v1/topics/${topic._id}/like`)
        .set(adminHeader)
        .expect(204, done);
    });
  });
  describe('Testing bookmark a topic', () => {
    each();
    it('should response 401 when JWT is missing in header when bookmark', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow bookmark a topic by an Admin', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .expect(204, done);
    });
    it('should allow bookmark a topic by an User', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(userHeader)
        .expect(204, done);
    });
    it('should response 401 when user is a Banned', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 403 when a topic is already bookmarked by a user', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.put(`/api/v1/topics/${topic._id}/bookmark`)
            .set(adminHeader)
            .expect(403, done);
        });
    });
  });
  describe('Testing if topic is bookmarked', () => {
    each();
    it('should response 401 when JWT is missing in header when bookmark', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.get(`/api/v1/topics/${topic._id}/bookmark`)
            .set(adminHeader)
            .set('Authorization', '')
            .expect(401, done);
        });
    });
    it('should response 204 when Admin bookmarked this topic', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.get(`/api/v1/topics/${topic._id}/bookmark`)
            .set(adminHeader)
            .expect(204, done);
        });
    });
    it('should response 204 when User bookmarked this topic', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(userHeader)
        .end((err, res) => {
          agent.get(`/api/v1/topics/${topic._id}/bookmark`)
            .set(userHeader)
            .expect(204, done);
        });
    });
    it('should response 401 when user is Banned', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.get(`/api/v1/topics/${topic._id}/bookmark`)
            .set(bannedHeader)
            .expect(401, done);
        });
    });
    it('should response 401 when Guest', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.get(`/api/v1/topics/${topic._id}/bookmark`)
            .set(guestHeader)
            .expect(401, done);
        });
    });
    it('should response 404 when user not bookmark this topic', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.get(`/api/v1/topics/${topic._id}/bookmark`)
            .set(userHeader)
            .expect(404, done);
        });
    });
  });
  describe('Testing un-bookmark a topic', () => {
    each();
    it('should response 401 when JWT is missing in header when un-bookmark', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/bookmark`)
            .set(adminHeader)
            .set('Authorization', '')
            .expect(401, done);
        });
    });
    it('should allow un-bookmark a topic by an Admin', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/bookmark`)
            .set(adminHeader)
            .expect(204, done);
        });
    });
    it('should allow un-bookmark a topic by an User', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(userHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/bookmark`)
            .set(userHeader)
            .expect(204, done);
        });
    });
    it('should response 401 when user is Banned', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/bookmark`)
            .set(bannedHeader)
            .expect(401, done);
        });
    });
    it('should response 401 when Guest', done => {
      agent.put(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/bookmark`)
            .set(guestHeader)
            .expect(401, done);
        });
    });
    it('should response 204 when user did not bookmark the topic at first', done => {
      agent.del(`/api/v1/topics/${topic._id}/bookmark`)
        .set(adminHeader)
        .expect(204, done);
    });
  });
});
