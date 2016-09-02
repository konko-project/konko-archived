'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Category = mongoose.model('Category');
const Panel = mongoose.model('Panel');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');
const Core = mongoose.model('Core');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let agent;
let category;
let c1;
let c2;
let p1;
let adminHeader;
let userHeader;
let bannedHeader;
let guestHeader;

const each = () => {
  beforeEach(done => {
    c1 = {
      name: 'Category 1',
      order: 0,
    };
    c2 = {
      name: 'Category 2',
      order: 5,
    };
    p1 = {
      name: 'Test panel',
      order: 0,
      description: 'mocha test panel',
    };
    Category.create(c1).then(_c1 => {
      category = _c1;
      done();
    });
  });
  afterEach(done => {
    Category.remove().then(Panel.remove().then(done()));
  });
};

describe('Category CRUD Test:', () => {
  before(done => {
    const buildUser = (username, permission = username) => new User({
      email: `${username}@test.com`,
      permission: permission,
      profile: new Profile({ username: username }),
      preference: new Preference(),
    });
    Core.create({ basic: { title: 'Test' } }).catch(err => {
      expect(err).to.be.empty();
      return done();
    });

    let _app = app(path.resolve(SERVER.build.paths.root));
    agent = request.agent(_app);
    let admin = buildUser('admin');
    let user = buildUser('user');
    let banned = buildUser('banned');
    let guest = buildUser('guest');

    admin.save().then(user.save().then(banned.save().then(guest.save().then(u => {
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
    }))));
  });
  after(done => {
    Preference.remove().then(Profile.remove().then(User.remove().then(Core.remove().then(done()))));
  });
  describe('Testing POST', () => {
    each();
    it('should response 401 when user is an User', done => {
      agent.post('/api/v1/categories')
        .set(userHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.post('/api/v1/categories')
        .set(bannedHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.post('/api/v1/categories')
        .set(guestHeader)
        .send(c2)
        .expect(401, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.post('/api/v1/categories')
        .set(adminHeader)
        .set('Authorization', '')
        .send(c2)
        .expect(401, done);
    });
    it('should allow create category', done => {
      agent.post('/api/v1/categories')
        .set(adminHeader)
        .send(c2)
        .expect(201)
        .expect(({ res: { body: { name, order } } }) => {
          expect(name).to.be(c2.name);
          expect(order).to.be(c2.order);
        })
        .end(done);
    });
    it('should response 500 when category is already existed', done => {
      agent.post('/api/v1/categories')
        .set(adminHeader)
        .send(c1)
        .expect(500, done);
    });
    it('should response 500 when category name is too short', done => {
      Category.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: 5,
        maxlength: 60,
      });
      c1.name = 'this';
      agent.post('/api/v1/categories')
        .set(adminHeader)
        .send(c1)
        .expect(500, done);
    });
    it('should response 500 when category name is too long', done => {
      Category.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: 1,
        maxlength: 60,
      });
      c1.name = 't'.repeat(61);
      agent.post('/api/v1/categories')
        .set(adminHeader)
        .send(c1)
        .expect(500, done);
    });
    it('should response 400 when category name is missing', done => {
      c1.name = '';
      agent.post('/api/v1/categories')
        .set(adminHeader)
        .send(c1)
        .expect(400, done);
    });
    it('should allow create category when only category name exists', done => {
      c1 = { name: 'mocha test' };
      agent.post('/api/v1/categories')
        .set(adminHeader)
        .send(c1)
        .expect(201)
        .expect(({ res: { body: { name } } }) => {
          expect(name).to.be(c1.name);
        })
        .end(done);
    });
  });
  describe('Testing POST - panel under a category', () => {
    each();
    it('should response 401 when user is an User', done => {
      agent.post(`/api/v1/categories/${category._id}/panels`)
      .set(userHeader)
      .send(p1)
      .expect(401, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.post(`/api/v1/categories/${category._id}/panels`)
      .set(bannedHeader)
      .send(p1)
      .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.post(`/api/v1/categories/${category._id}/panels`)
      .set(guestHeader)
      .send(p1)
      .expect(401, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .set('Authorization', '')
        .send(p1)
        .expect(401, done);
    });
    it('should response 400 when category id is invalid', done => {
      agent.post('/api/v1/categories/12345/panels')
        .set(adminHeader)
        .send(p1)
        .expect(400, done);
    });
    it('should response 404 when category is not exist in database', done => {
      agent.post(`/api/v1/categories/${new Category(c2)._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(404, done);
    });
    it('should allow create a panel with a valid category id', done => {
      p1.name = 'mocha test';
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(201)
        .expect(({ res: { body: { name, order, description, category: _cate } } }) => {
          expect(name).to.be(p1.name);
          expect(order).to.be(p1.order);
          expect(description).to.be(p1.description);
          expect(_cate._id).to.be(category._id.toString());
        })
        .end(done);
    });
    it('should response 500 when panel is already existed', done => {
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(201)
        .end((err, res) => {
          if (err) {
            expect(err).to.be.empty();
            done(err);
          }

          agent.post(`/api/v1/categories/${category._id}/panels`)
            .set(adminHeader)
            .send(p1)
            .expect(500, done);
        });
    });
    it('should response 500 when panel name is too short', done => {
      Panel.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: 5,
        maxlength: 60,
      });
      p1.name = 't';
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(500, done);
    });
    it('should response 500 when panel name is too long', done => {
      Panel.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: 1,
        maxlength: 60,
      });
      p1.name = 't'.repeat(61);
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(500, done);
    });
    it('should response 500 when panel description is too long', done => {
      p1.description = 't'.repeat(201);
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(500, done);
    });
    it('should response 400 when panel name is missing', done => {
      p1.name = '';
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(400, done);
    });
    it('should allow create panel when only panel name exists', done => {
      p1 = { name: 'mocha testssss' };
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(201, done);
    });
  });
  describe('Testing GET', () => {
    each();
    it('should response 401 when JWT is missing in header when quering', done => {
      agent.get('/api/v1/categories').expect(401, done);
    });
    it('should response all categories when user is an Admin', done => {
      agent.get('/api/v1/categories')
      .set(adminHeader)
      .expect(200)
      .expect(({ res: { body, body: [c1, ...rest] } }) => {
        expect(body.length).to.be(1);
        expect(c1).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        }));
      })
      .end(done);
    });
    it('should response all categories when user is an User', done => {
      agent.get('/api/v1/categories')
      .set(userHeader)
      .expect(200)
      .expect(({ res: { body, body: [c1, ...rest] } }) => {
        expect(body.length).to.be(1);
        expect(c1).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        }));
      })
      .end(done);
    });
    it('should response all categories when user is a Banned user', done => {
      agent.get('/api/v1/categories')
      .set(bannedHeader)
      .expect(200)
      .expect(({ res: { body, body: [c1, ...rest] } }) => {
        expect(body.length).to.be(1);
        expect(c1).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        }));
      })
      .end(done);
    });
    it('should response all categories when user is a Guest', done => {
      agent.get('/api/v1/categories')
      .set(guestHeader)
      .expect(200)
      .expect(({ res: { body, body: [c1, ...rest] } }) => {
        expect(body.length).to.be(1);
        expect(c1).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        }));
      })
      .end(done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.get(`/api/v1/categories/${category._id}`).expect(401, done);
    });
    it('should response a category with given its id when user is an Admin', done => {
      agent.get(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body } }) => expect(body).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        })))
        .end(done);
    });
    it('should response a category with given its id when user is an User', done => {
      agent.get(`/api/v1/categories/${category._id}`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body } }) => expect(body).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        })))
        .end(done);
    });
    it('should response a category with given its id when user is a Banned user', done => {
      agent.get(`/api/v1/categories/${category._id}`)
        .set(bannedHeader)
        .expect(200)
        .expect(({ res: { body } }) => expect(body).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        })))
        .end(done);
    });
    it('should response a category with given its id when user is a guest', done => {
      agent.get(`/api/v1/categories/${category._id}`)
        .set(guestHeader)
        .expect(200)
        .expect(({ res: { body } }) => expect(body).to.eql(category.toObject({ transform: (doc, ret, options) => {
          ret._id = doc._id.toString();
        },
        })))
        .end(done);
    });
    it('should response 400 when category id is invalid', done => {
      agent.get('/api/v1/categories/12345').set(adminHeader).expect(400, done);
    });
    it('should response 404 when category is not exist in database', done => {
      agent.get(`/api/v1/categories/${new Category(c2)._id}`).set(adminHeader).expect(404, done);
    });
  });
  describe('Testing PUT', () => {
    each();
    it('should response 401 when user is an User', done => {
      agent.put(`/api/v1/categories/${category._id}`)
      .set(userHeader)
      .send(c2)
      .expect(401, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.put(`/api/v1/categories/${category._id}`)
      .set(bannedHeader)
      .send(c2)
      .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.put(`/api/v1/categories/${category._id}`)
      .set(guestHeader)
      .send(c2)
      .expect(401, done);
    });
    it('should response 404 when category id is missing', done => {
      agent.put('/api/v1/categories')
        .set(adminHeader)
        .send(c2)
        .expect(404, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.put(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .send(c2)
        .expect(401, done);
    });
    it('should response 400 when category id is invalid', done => {
      agent.put('/api/v1/categories/12345')
        .set(adminHeader)
        .send(c2)
        .expect(400, done);
    });
    it('should response 404 when category is not exist in database', done => {
      agent.put(`/api/v1/categories/${new Category(c2)._id}`)
      .set(adminHeader)
      .send(c2)
      .expect(404, done);
    });
    it('should response 400 when category name is empty', done => {
      c2.name = '';
      agent.put(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(400, done);
    });
    it('should response 500 when category name is too short', done => {
      Category.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: 5,
        maxlength: 60,
      });
      c2.name = 'this';
      agent.put(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(500, done);
    });
    it('should response 500 when category name is too long', done => {
      Category.schema.path('name', {
        type: String,
        unique: true,
        required: '{PATH} is required',
        minlength: 1,
        maxlength: 60,
      });
      c2.name = 't'.repeat(61);
      agent.put(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(500, done);
    });
    it('should allow update a category with valid data', done => {
      c2.name = 'Test 2';
      agent.put(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .send(c2)
        .expect(200)
        .expect(({ res: { body: { name, order } } }) => {
          expect(name).to.be(c2.name);
          expect(order).to.be(c2.order);
        })
        .end(done);
    });
  });
  describe('Testing DELETE', () => {
    each();
    it('should response 401 when user is an User', done => {
      agent.del(`/api/v1/categories/${category._id}`)
      .set(userHeader)
      .expect(401, done);
    });
    it('should response 401 when user is a Banned user', done => {
      agent.del(`/api/v1/categories/${category._id}`)
      .set(bannedHeader)
      .expect(401, done);
    });
    it('should response 401 when user is a Guest', done => {
      agent.del(`/api/v1/categories/${category._id}`)
      .set(guestHeader)
      .expect(401, done);
    });
    it('should response 404 when category id is missing', done => {
      agent.del('/api/v1/categories')
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 401 when JWT is missing in header', done => {
      agent.del(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should response 400 when category id is invalid', done => {
      agent.del('/api/v1/categories/12345')
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when category is not exist in database', done => {
      agent.del(`/api/v1/categories/${new Category(c2)._id}`)
      .set(adminHeader)
      .expect(404, done);
    });
    it('should allow delete a category that has no panel', done => {
      agent.del(`/api/v1/categories/${category._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(res => {
          Category.findOne(category).then(category => expect(category).to.be.empty());
        })
        .end(done);
    });
    it('should allow delete a category that has panel', done => {
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(201)
        .expect(({ res: { body: { _category } } }) => {
          Panel.find({ category: _category }).then(panels => expect(panels.length).to.be(1));
        })
        .end((err, res) => {
          if (err) {
            expect(err).to.be.empty();
            return done(err);
          }

          agent.del(`/api/v1/categories/${category._id}`)
            .set(adminHeader)
            .expect(200)
            .expect(res => {
              Category.findOne(category).then(category => expect(category).to.be.empty());
              Panel.find({ category: category }).then(panels => expect(panels).to.be.empty());
            })
            .end(done);
        });
    });
    it('should allow delete a category that has panel with sub-panel', done => {
      agent.post(`/api/v1/categories/${category._id}/panels`)
        .set(adminHeader)
        .send(p1)
        .expect(201)
        .end((err, { res: { body: panel } }) => {
          if (err) {
            expect(err).to.be.empty();
            return done(err);
          }

          p1.name = 'mocha test 12345';
          agent.post(`/api/v1/categories/${category._id}/panels/${panel._id}`)
            .set(adminHeader)
            .send(p1)
            .expect(201)
            .expect(({ res: { body: { _category } } }) => {
              Panel.findOne(panel).then(panel => expect(panel.children.length).to.be(1));
              Panel.find({ category: _category }).then(panels => expect(panels.length).to.be(2));
            })
            .end((err, res) => {
              if (err) {
                expect(err).to.be.empty();
                return done(err);
              }

              agent.del(`/api/v1/categories/${category._id}`)
                .set(adminHeader)
                .expect(200)
                .expect(res => {
                  Category.findOne(category).then(category => expect(category).to.be.empty());
                  Panel.find({ category: category }).then(panels => expect(panels).to.be.empty());
                })
                .end(done);
            });
        });
    });
  });
});
