'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Panel = mongoose.model('Panel');
const Topic = mongoose.model('Topic');
const Comment = mongoose.model('Comment');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Core = mongoose.model('Core');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let agent;
let c1;
let c2;
let comment;
let t1;
let topic;
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
    c1 = {
      content: 'T'.repeat(233),
      author: author,
      topic: topic,
    };
    c2 = {
      content: 'A'.repeat(233),
    };
    Comment.create(c1).then(c1 => {
      comment = c1;
      done();
    });
  });
  afterEach(done => {
    Comment.remove().then(done());
  });
};

describe('Comment CRUD Test:', () => {
  before(done => {
    t1 = {
      title: 'Topic 2',
      content: 'A'.repeat(233),
    };
    Core.create({ basic: { title: 'Test' } }).catch(err => {
      expect(err).to.be.empty();
      return done();
    });
    Panel.create({ name: 'Panel One', description: 'Panel One' }).then(panel => {
      t1.panel = panel;
      Topic.create(t1).then(t => topic = t).catch(err => {
        expect(err).to.be.empty();
        return done();
      });
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
    let _app = app(path.resolve(SERVER.build.paths.root));
    agent = request.agent(_app);
    let admin = new User({ email: 'admin@test.com', permission: 'admin' });
    let user = new User({ email: 'user@test.com', permission: 'user' });
    let banned = new User({ email: 'banned@test.com', permission: 'banned' });
    let guest = new User({ email: 'guest@test.com', permission: 'guest' });
    admin.profile = new Profile({ username: 'admin' });
    user.profile = new Profile({ username: 'user' });
    banned.profile = new Profile({ username: 'banned' });
    guest.profile = new Profile({ username: 'guest' });
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
    Profile.remove().then(User.remove().then(Core.remove().then(Topic.remove().then(Panel.remove().then(done())))));
  });
  describe('Testing POST', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(adminHeader)
        .set('Authorization', '')
        .send(c2)
        .expect(401, done);
    });
    it('should allow to comment a topic when user is an Admin', done => {
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(adminHeader)
        .send(c2)
        .expect(201)
        .expect(({ res: { body: { _id, content, topic: _t } } }) => {
          expect(content).to.be(c2.content);
          Topic.findById(_t._id).then(topic => expect(topic.comments).to.contain(_id));
        })
        .end(done);
    });
    it('should allow to comment a topic when user is an User', done => {
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(userHeader)
        .send(c2)
        .expect(201)
        .expect(({ res: { body: { content, topic: _t } } }) => {
          expect(content).to.be(c2.content);
          expect(_t._id).to.be(topic._id.toString());
        })
        .end(done);
    });
    it('should response 401 when user is Banned', done => {
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(bannedHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 401 when Guest', done => {
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(guestHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.post(`/api/v1/topics/${new Topic(t1)._id}/comments`)
        .set(adminHeader)
        .send(c2)
        .expect(404, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.post('/api/v1/topics/12345/comments')
        .set(adminHeader)
        .send(c2)
        .expect(400, done);
    });
    it('should response 404 when topic id is missing', done => {
      agent.post('/api/v1/topics//comments')
        .set(adminHeader)
        .send(c2)
        .expect(404, done);
    });
    it('should allow comments have same content', done => {
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(adminHeader)
        .send(c1)
        .expect(201)
        .expect(({ res: { body: { content } } }) => expect(content).to.be(c1.content))
        .end(done);
    });
    it('should allow comments have different content', done => {
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(adminHeader)
        .send(c2)
        .expect(201)
        .expect(({ res: { body: { content } } }) => expect(content).to.be(c2.content))
        .end(done);
    });
    it('should response 500 when comment content is too short', done => {
      c1.content = 't';
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(adminHeader)
        .send(c1)
        .expect(500, done);
    });
    it('should response 500 when comment content is too long', done => {
      c1.content = 't'.repeat(10001);
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(adminHeader)
        .send(c1)
        .expect(500, done);
    });
    it('should response 400 when comment content is empty', done => {
      c1.content = '';
      agent.post(`/api/v1/topics/${topic._id}/comments`)
        .set(userHeader)
        .send(c1)
        .expect(400, done);
    });
  });
  describe('Testing GET', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments`).expect(401, done);
    });
    it('should response all comments in topic when user is an Admin', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ content }, ...rest] } }) => {
          expect(body).to.have.length(1);
          expect(content).to.be(c1.content);
        })
        .end(done);
    });
    it('should response all comments in topic when user is an User', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ content }, ...rest] } }) => {
          expect(body).to.have.length(1);
          expect(content).to.be(c1.content);
        })
        .end(done);
    });
    it('should response 401 when quering comments from topic when user is Banned', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when quering comments from topic when Guest', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.get(`/api/v1/topics/${new Topic(t1)._id}/comments`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.get('/api/v1/topics/12345/comments')
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when topic id is missing', done => {
      agent.get('/api/v1/topics//comments')
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 401 when JWT is missing in header when request 1 comment', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments/${comment._id}`).expect(401, done);
    });
    it('should response a comment with given its id when user is an Admin', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: { content, topic: _t } } }) => {
          expect(content).to.be(c1.content);
          expect(_t._id).to.be(topic._id.toString());
        })
        .end(done);
    });
    it('should response a comment with given its id when user is an User', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body: { content, topic: _t } } }) => {
          expect(content).to.be(c1.content);
          expect(_t._id).to.be(topic._id.toString());
        })
        .end(done);
    });
    it('should response 401 when user is banned', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when Guest', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 400 when comment id is invalid', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments/12345`).set(adminHeader).expect(400, done);
    });
    it('should response 404 when comment is not exist in database', done => {
      agent.get(`/api/v1/topics/${topic._id}/comments/${new Comment(c2)._id}`).set(adminHeader).expect(404, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.get(`/api/v1/topics/12345/comments/${comment._id}`).set(adminHeader).expect(400, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.get(`/api/v1/topics/${new Topic(t1)._id}/comments/${comment._id}`).set(adminHeader).expect(404, done);
    });
    it('should response 404 when topic id is missing', done => {
      agent.get(`/api/v1/topics//comments/${comment._id}`).set(adminHeader).expect(404, done);
    });
  });
  describe('Testing PUT', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .send(c2).expect(401, done);
    });
    it('should allow update a comment when user is an Admin', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(200)
        .expect(({ res: { body: { content } } }) => expect(content).to.be(c2.content))
        .end(done);
    });
    it('should allow update a comment when user is the Author', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(authorHeader)
        .send(c2)
        .expect(200)
        .expect(({ res: { body: { content } } }) => expect(content).to.be(c2.content))
        .end(done);
    });
    it('should response 401 when user is the Author but banned', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(bannedAuthorHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 401 when user is an User other than Author', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(userHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user other than Author', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(bannedHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 401 when Guest', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(guestHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 404 when comment id is missing', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/`)
        .set(adminHeader)
        .send(c2)
        .expect(404, done);
    });
    it('should response 404 when topic id is missing', done => {
      agent.put(`/api/v1/topics//comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(404, done);
    });
    it('should response 400 when comment id is invalid', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/12345`)
        .set(adminHeader)
        .send(c2)
        .expect(400, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.put(`/api/v1/topics/12345/comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(400, done);
    });
    it('should response 404 when comment is not exist in database', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${new Comment(c2)._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(404, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.put(`/api/v1/topics/${new Topic(t1)._id}/comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(404, done);
    });
    it('should response 400 when comment content is empty', done => {
      c2.content = '';
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(400, done);
    });
    it('should response 500 when comment content is too short', done => {
      c2.content = 't';
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(500, done);
    });
    it('should response 500 when comment content is too long', done => {
      c2.content = 't'.repeat(10001);
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(500, done);
    });
    it('should allow update a comment with valid data', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(200)
        .expect(({ res: { body: { content } } }) => expect(content).to.be(c2.content))
        .end(done);
    });
  });
  describe('Testing DELETE', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow delete a comment when user is an Admin', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(res => {
          Comment.findOne(comment).then(comment => expect(comment).to.be.empty());
          Topic.findOne(topic).then(topic => expect(topic.comments).to.be.empty());
        })
        .end(done);
    });
    it('should response 401 when user is the Author', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(authorHeader)
        .expect(401, done);
    });
    it('should response 401 when user is the Author but banned', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(bannedAuthorHeader)
        .expect(401, done);
    });
    it('should response 401 when user is an User other than Author', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user other than Author', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when Guest', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 404 when comment id is missing', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 404 when topic id is missing', done => {
      agent.del(`/api/v1/topics//comments/${comment._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 400 when comment id is invalid', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/12345`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 400 when topic id is invalid', done => {
      agent.del(`/api/v1/topics/12345/comments/${comment._id}`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when comment is not exist in database', done => {
      agent.del(`/api/v1/topics/${topic._id}/comments/${new Comment(c2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 404 when topic is not exist in database', done => {
      agent.del(`/api/v1/topics/${new Topic(t1)._id}/comments/${comment._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
  });
  describe('Testing like a comment', () => {
    each();
    it('should response 401 when JWT is missing in header when like', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow an Admin likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .expect(204, done);
    });
    it('should allow an User likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(userHeader)
        .expect(204, done);
    });
    it('should response 401 when a Banned user likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 403 when a user likes a comment again', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .expect(204)
        .end((err, res) => {
          if (err) {
            expect(err).to.be.empty();
            return done(err);
          }
          agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
            .set(adminHeader)
            .expect(403, done);
        });
    });
  });
  describe('Testing un-like a comment', () => {
    each();
    it('should response 401 when JWT is missing in header when un-like', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
            .set(adminHeader)
            .set('Authorization', '')
            .expect(401, done);
        });
    });
    it('should allow an Admin un-likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
            .set(adminHeader)
            .expect(204, done);
        });
    });
    it('should allow an User un-likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(userHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
            .set(userHeader)
            .expect(204, done);
        });
    });
    it('should response 401 when a Banned user un-likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
            .set(bannedHeader)
            .expect(401, done);
        });
    });
    it('should response 401 when a Guest un-likes a comment', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .end((err, res) => {
          agent.del(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
            .set(guestHeader)
            .expect(401, done);
        });
    });
    it('should response 204 when a user did not like the comment at first', done => {
      agent.put(`/api/v1/topics/${topic._id}/comments/${comment._id}/like`)
        .set(adminHeader)
        .expect(204, done);
    });
  });
});
