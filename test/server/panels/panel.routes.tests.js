'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Category = mongoose.model('Category');
const Panel = mongoose.model('Panel');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Core = mongoose.model('Core');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let agent;
let panel;
let category;
let p1;
let p2;
let adminHeader;
let userHeader;
let bannedHeader;
let guestHeader;

const each = () => {
  beforeEach(done => {
    p1 = {
      name: 'Panel 1',
      order: 0,
      description: 'Test panel 1',
    };
    p2 = {
      name: 'Panel 2',
      order: 5,
      description: 'Test panel 2',
    };
    Category.create({ name: 'Category 1', order: '2' }).then(c => {
      Panel.create(p1).then(_p1 => {
        _p1.category = c;
        _p1.save().then(_p1 => {
          c.panels.push(_p1);
          c.save().then(c => {
            category = c;
            panel = _p1;
            done();
          });
        });
      });
    }).catch(err => {
      expect(err).to.be.empty();
      return done();
    });
  });
  afterEach(done => {
    Panel.remove().then(Category.remove().then(done()));
  });
};

describe('Panel CRUD Test:', () => {
  before(done => {
    Core.create({ basic: { title: 'Test' } }).catch(err => {
      expect(err).to.be.empty();
      return done();
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
      done();
    });
  });
  after(done => {
    Core.remove().then(done());
  });
  describe('Testing POST', () => {
    each();
    it('should response 401 when user is an User', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(userHeader)
        .send(p2)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(bannedHeader)
        .send(p2)
        .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(guestHeader)
        .send(p2)
        .expect(401, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .send(p2)
        .expect(401, done);
    });
    it('should response 400 when parent id is invalid', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/12345`)
        .set(adminHeader)
        .send(p2)
        .expect(400, done);
    });
    it('should response 404 when parent is not exist in database', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/${new Panel(p2)._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(404, done);
    });
    it('should allow create panel under a parent with valid id', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(201)
        .expect(({ res: { body: { name, order, description, parent } } }) => {
          expect(name).to.be(p2.name);
          expect(order).to.be(p2.order);
          expect(description).to.be(p2.description);
          expect(parent._id).to.be(panel._id.toString());
        })
        .end(done);
    });
    it('should response 500 when panel is already existed', done => {
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p1)
        .expect(500, done);
    });
    it('should response 500 when panel name is too short', done => {
      p1.name = 't';
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p1)
        .expect(500, done);
    });
    it('should response 500 when panel name is too long', done => {
      p1.name = 't'.repeat(61);
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p1)
        .expect(500, done);
    });
    it('should response 500 when panel description is too long', done => {
      p1.description = 't'.repeat(201);
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p1)
        .expect(500, done);
    });
    it('should response 400 when panel name is missing', done => {
      p1.name = '';
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p1)
        .expect(400, done);
    });
    it('should allow create panel when only panel name exists', done => {
      p1 = { name: 'mocha test' };
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p1)
        .expect(201)
        .expect(res => expect(res.body.name).to.be(p1.name))
        .end(done);
    });
  });
  describe('Testing GET', () => {
    each();
    it('should response 401 when JWT is missing in header when quering', done => {
      agent.get(`/api/v1/categories/${category._id}/panels`).expect(401, done);
    });
    it('should response all panels when user is an Admin', done => {
      agent.get(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, name, description, category }, ...rest] } }) => {
          expect(body.length).to.be(1);
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response all panels when user is an User', done => {
      agent.get(`/api/v1/categories/${category._id}/panels`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, name, description, category }, ...rest] } }) => {
          expect(body.length).to.be(1);
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response all panels when user is a Banned user', done => {
      agent.get(`/api/v1/categories/${category._id}/panels`)
        .set(bannedHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, name, description, category }, ...rest] } }) => {
          expect(body.length).to.be(1);
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response all panels when user is a Guest', done => {
      agent.get(`/api/v1/categories/${category._id}/panels`)
        .set(guestHeader)
        .expect(200)
        .expect(({ res: { body, body: [{ _id, name, description, category }, ...rest] } }) => {
          expect(body.length).to.be(1);
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/${panel._id}`).expect(401, done);
    });
    it('should response a panel with given its id when user is an Admin', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: { _id, name, description, category } } }) => {
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response a panel with given its id when user is an User', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body: { _id, name, description, category } } }) => {
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response a panel with given its id when user is a Banned user', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(bannedHeader)
        .expect(200)
        .expect(({ res: { body: { _id, name, description, category } } }) => {
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response a panel with given its id when user is a Guest', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(guestHeader)
        .expect(200)
        .expect(({ res: { body: { _id, name, description, category } } }) => {
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.be(panel.description);
          expect(category).to.be(panel.category._id.toString());
        })
        .end(done);
    });
    it('should response 400 when panel id is invalid', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/12345`).set(adminHeader).expect(400, done);
    });
    it('should response 404 when panel is not exist in database', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/${new Panel(p2)._id}`).set(adminHeader).expect(404, done);
    });
    it('should response a panel with given its id and selected fields', done => {
      agent.get(`/api/v1/categories/${category._id}/panels/${panel._id}?fields=_id,name`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res, res: { body: { _id, name, description, category } } }) => {
          expect(_id).to.be(panel._id.toString());
          expect(name).to.be(panel.name);
          expect(description).to.not.be.ok();
          expect(category).to.not.be.ok();
        })
        .end(done);
    });
  });
  describe('Testing PUT', () => {
    each();
    it('should response 401 when user is an User', done => {
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(userHeader)
        .send(p2)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(bannedHeader)
        .send(p2)
        .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(guestHeader)
        .send(p2)
        .expect(401, done);
    });
    it('should response 404 when panel id is missing', done => {
      agent.put(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p2)
        .expect(404, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .send(p2)
        .expect(401, done);
    });
    it('should response 400 when panel id is invalid', done => {
      agent.put(`/api/v1/categories/${category._id}/panels/12345`)
        .set(adminHeader)
        .send(p2)
        .expect(400, done);
    });
    it('should response 404 when panel is not exist in database', done => {
      agent.put(`/api/v1/categories/${category._id}/panels/${new Panel(p2)._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(404, done);
    });
    it('should response 400 when panel name is empty', done => {
      p2.name = '';
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(400, done);
    });
    it('should response 500 when panel name is too short', done => {
      p2.name = 'this';
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(500, done);
    });
    it('should response 500 when panel name is too long', done => {
      p2.name = 't'.repeat(61);
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(500, done);
    });
    it('should allow update a panel when panel description is empty', done => {
      p2.description = '';
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(200)
        .expect(({ res: { body: { name, order, description } } }) => {
          expect(name).to.be(p2.name);
          expect(order).to.be(p2.order);
          expect(description).to.be(p2.description);
        })
        .end(done);
    });
    it('should response 500 when panel description is too long', done => {
      p2.description = 't'.repeat(201);
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(500, done);
    });
    it('should allow update a panel with valid data', done => {
      agent.put(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p2)
        .expect(200)
        .expect(({ res: { body: { name, order, description } } }) => {
          expect(name).to.be(p2.name);
          expect(order).to.be(p2.order);
          expect(description).to.be(p2.description);
        })
        .end(done);
    });
  });
  describe('Testing DELETE', () => {
    each();
    it('should response 401 when user is an User', done => {
      agent.del(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.del(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.del(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 404 when panel id is missing', done => {
      agent.del(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.del(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should response 400 when panel id is invalid', done => {
      agent.del(`/api/v1/categories/${category._id}/panels/12345`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when panel is not exist in database', done => {
      agent.del(`/api/v1/categories/${category._id}/panels/${new Panel(p2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should allow delete a panel that has no child', done => {
      agent.del(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(res => {
          Category.findById(category._id).then(category => expect(category.panels).to.be.empty());
          Panel.findById(panel._id).then(panel => expect(panel).to.be.empty());
        })
        .end(done);
    });
    it('should allow delete a panel that has child', done => {
      p1.name = 'mocha test 123456';
      agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
        .set(adminHeader)
        .send(p1)
        .expect(201)
        .expect(({ res: { body: { parent } } }) => {
          Panel.findOne(parent).then(parent => expect(parent.children).to.have.length(1));
        })
        .end((err, res) => {
          if (err) {
            expect(err).to.be.empty();
            return done(err);
          }

          agent.del(`/api/v1/categories/${category._id}/panels/${panel._id}`)
            .set(adminHeader)
            .expect(200)
            .expect(res => {
              Panel.find({ parent: panel }).then(panels => expect(panels).to.be.empty());
              Panel.findById(panel._id).then(panel => expect(panel).to.be.empty());
            })
            .end(done);
        });
    });
  });
});
