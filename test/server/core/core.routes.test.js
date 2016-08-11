'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Core = mongoose.model('Core');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let _app;
let c1;
let c2;
let core;
let agent;
let adminHeader;
let userHeader;
let bannedHeader;
let guestHeader;

const each = () => {
  beforeEach(done => {
    c1 = {
      basic: { title: 'test' },
      admin: { email: 'admin@test.com' },
    };
    c2 = {
      basic: { title: 'test2' },
      admin: { email: 'admin2@test.com' },
    };
    Core.create(c1).then(c => {
      core = c;
      done();
    });
  });
  afterEach(done => {
    Core.remove().then(done());
  });
};

describe('Core CRUD Test:', () => {
  before(done => {
    const buildUser = (username, permission = username) => new User({
      email: `${username}@test.com`,
      permission: permission,
      profile: new Profile({ username: username }),
      preference: new Preference(),
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
    it('should allow to create Core with no Core exist and no JWT', done => {
      Core.remove().then(() => {
        agent.post('/api/v1/core')
          .set(adminHeader)
          .set('Authorization', '')
          .send(c1)
          .expect(201)
          .expect(({ res: { body: { basic: { title }, admin: { email } } } }) => {
            expect(title).to.be(c1.basic.title);
            expect(email).to.be(c1.admin.email);
          })
          .end(done);
      });
    });
    it('should response 403 when Core already existed', done => {
      agent.post('/api/v1/core')
        .set(adminHeader)
        .send(c1)
        .expect(403, done);
    });
    it('should response 400 when admin email is missing', done => {
      c1.admin.email = '';
      Core.remove().then(() => {
        agent.post('/api/v1/core')
          .set(adminHeader)
          .send(c1)
          .expect(400, done);
      });
    });
    it('should response 400 when admin email is invalid', done => {
      c1.admin.email = 'invalidemail';
      Core.remove().then(() => {
        agent.post('/api/v1/core')
          .set(adminHeader)
          .send(c1)
          .expect(400, done);
      });
    });
    it('should response 400 when site title is missing', done => {
      c1.basic.title = '';
      Core.remove().then(() => {
        agent.post('/api/v1/core')
          .set(adminHeader)
          .send(c1)
          .expect(400, done);
      });
    });
  });
  describe('Testing GET', () => {
    each();
    it('should response 401 when JWT is missing in header when quering basic Core', done => {
      agent.get('/api/v1/core').expect(401, done);
    });
    it('should allow Admin to query a basic Core', done => {
      agent.get('/api/v1/core')
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: _core } }) => {
          expect(_core.basic).not.to.be.empty();
        })
        .end(done);
    });
    it('should allow User to query a basic Core', done => {
      agent.get('/api/v1/core')
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body: _core } }) => {
          expect(_core.basic).not.to.be.empty();
        })
        .end(done);
    });
    it('should allow Banned User to query a basic Core', done => {
      agent.get('/api/v1/core')
        .set(bannedHeader)
        .expect(200)
        .expect(({ res: { body: _core } }) => {
          expect(_core.basic).not.to.be.empty();
        })
        .end(done);
    });
    it('should allow Guest to query a basic Core', done => {
      agent.get('/api/v1/core')
        .set(guestHeader)
        .expect(200)
        .expect(({ res: { body: _core } }) => {
          expect(_core.basic).not.to.be.empty();
        })
        .end(done);
    });
    it('should reponse a basic Core excludes Admin and Mailer information when quered', done => {
      agent.get('/api/v1/core')
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: core } }) => {
          expect(core.admin).to.be(undefined);
          expect(core.mailer).to.be(undefined);
        })
        .end(done);
    });
    it('should allow to query a Core with fields but excludes Admin and Mailer', done => {
      agent.get('/api/v1/core?fields=basic,admin,global,mailer,registration,profile,panel,post')
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: core } }) => {
          expect(core.basic).not.to.be.empty();
          expect(core.admin).to.be(undefined);
          expect(core.global).not.to.be.empty();
          expect(core.mailer).to.be(undefined);
          expect(core.registration).not.to.be.empty();
          expect(core.profile).not.to.be.empty();
          expect(core.panel).not.to.be.empty();
          expect(core.post).not.to.be.empty();
        })
        .end(done);
    });
    it('should response 401 when JWT is mssing in header when quering a Core with its id', done => {
      agent.get(`/api/v1/core/${core._id}`).expect(401, done);
    });
    it('should allow Admin to query a Core with its id', done => {
      agent.get(`/api/v1/core/${core._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: _core } }) => {
          expect(_core._id).to.be(core._id.toString());
        })
        .end(done);
    });
    it('should response 401 when User queries a Core with its id', done => {
      agent.get(`/api/v1/core/${core._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when Banned User queries a Core with its id', done => {
      agent.get(`/api/v1/core/${core._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when Guest queries a Core with its id', done => {
      agent.get(`/api/v1/core/${core._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 400 when Core id is invalid', done => {
      agent.get(`/api/v1/core/${12345}`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when Core is not exist in database', done => {
      agent.get(`/api/v1/core/${new Core(c2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
  });
  describe('Testing PUT', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.put(`/api/v1/core/${core._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .send(c2).expect(401, done);
    });
    it('should response 400 when no field specified', done => {
      agent.put(`/api/v1/core/${core._id}`)
        .set(adminHeader)
        .send(c2).expect(400, done);
    });
    it('should allow Admin to update a Core with fields', done => {
      agent.put(`/api/v1/core/${core._id}?fields=basic,admin`)
        .set(adminHeader)
        .send(c2)
        .expect(200)
        .expect(({ res: { body: { basic, admin } } }) => {
          expect(basic.title).to.be(c2.basic.title);
          expect(admin.email).to.be(c2.admin.email);
        }).end(done);
    });
    it('should response 401 when User updates a Core', done => {
      agent.put(`/api/v1/core/${core._id}?fields=basic,admin`)
        .set(userHeader)
        .send(c2).expect(401, done);
    });
    it('should response 401 when Banned updates a Core', done => {
      agent.put(`/api/v1/core/${core._id}?fields=basic,admin`)
        .set(bannedHeader)
        .send(c2).expect(401, done);
    });
    it('should response 401 when Guest updates a Core', done => {
      agent.put(`/api/v1/core/${core._id}?fields=basic,admin`)
        .set(guestHeader)
        .send(c2).expect(401, done);
    });
    it('should response 404 when Core id is missing', done => {
      agent.put('/api/v1/core/?fields=basic,admin')
        .set(adminHeader)
        .send(c2).expect(404, done);
    });
    it('should response 400 when Core id is invalid', done => {
      agent.put('/api/v1/core/12345?fields=basic,admin')
        .set(adminHeader)
        .send(c2).expect(400, done);
    });
    it('should response 404 when Core is not exist in database', done => {
      agent.put(`/api/v1/core/${new Core(c2)._id}?fields=basic,admin`)
        .set(adminHeader)
        .send(c2).expect(404, done);
    });
  });
  describe('Testing DELETE', () => {
    it('should response 404 because there should not be a DELETE method in Core\'s api', done => {
      agent.del('/api/v1/core')
        .set(adminHeader)
        .expect(404, done);
    });
  });
});
