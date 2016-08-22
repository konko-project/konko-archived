'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Core = mongoose.model('Core');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');
const Report = mongoose.model('Report');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let agent;
let r1;
let r2;
let report;
let admin;
let user;
let banned;
let guest;
let adminHeader;
let userHeader;
let bannedHeader;
let guestHeader;

const each = () => {
  beforeEach(done => {
    r1 = {
      iid: '1111111111111',
      type: 'topic',
      url: 't/1111111111111',
      reason: 'no good',
    };
    r2 = {
      iid: '2222222222',
      type: 'comment',
      url: 't/1111111111111#2222222222',
      reason: 'no good good',
    };
    Report.create(r1).then(r => {
      report = r;
      done();
    });
  });
  afterEach(done => {
    Report.remove().then(done());
  });
};

describe('Report CRUD Test:', () => {
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
    admin = buildUser('admin');
    user = buildUser('user');
    banned = buildUser('banned');
    guest = buildUser('guest');

    admin.profile.save().then(user.profile.save().then(banned.profile.save().then(guest.profile.save().then(
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
      }))))
    ))));
  });
  after(done => {
    Preference.remove().then(Profile.remove().then(User.remove().then(Core.remove().then(done()))));
  });
  describe('Testing POST', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.post('/api/v1/reports')
        .set(adminHeader)
        .set('Authorization', '')
        .send(r2)
        .expect(401, done);
    });
    it('should allow Admin to create a Report', done => {
      agent.post('/api/v1/reports')
        .set(adminHeader)
        .send(r2)
        .expect(201)
        .expect(({ res: { body: { iid, type, url, reason, done, reporter } } }) => {
          expect(iid).to.be(r2.iid);
          expect(type).to.be(r2.type);
          expect(url).to.be(r2.url);
          expect(reason).to.be(r2.reason);
          expect(done).to.be(false);
          expect(reporter).to.be(admin._id.toString());
        }).end(done);
    });
    it('should allow User to create a Report', done => {
      agent.post('/api/v1/reports')
        .set(userHeader)
        .send(r2)
        .expect(201)
        .expect(({ res: { body: { iid, type, url, reason, done, reporter } } }) => {
          expect(iid).to.be(r2.iid);
          expect(type).to.be(r2.type);
          expect(url).to.be(r2.url);
          expect(reason).to.be(r2.reason);
          expect(done).to.be(false);
          expect(reporter).to.be(user._id.toString());
        }).end(done);
    });
    it('should allow Banned to create a Report', done => {
      agent.post('/api/v1/reports')
        .set(bannedHeader)
        .send(r2)
        .expect(201)
        .expect(({ res: { body: { iid, type, url, reason, done, reporter } } }) => {
          expect(iid).to.be(r2.iid);
          expect(type).to.be(r2.type);
          expect(url).to.be(r2.url);
          expect(reason).to.be(r2.reason);
          expect(done).to.be(false);
          expect(reporter).to.be(banned._id.toString());
        }).end(done);
    });
    it('should allow Guest to create a Report', done => {
      agent.post('/api/v1/reports')
        .set(guestHeader)
        .send(r2)
        .expect(201)
        .expect(({ res: { body: { iid, type, url, reason, done, reporter } } }) => {
          expect(iid).to.be(r2.iid);
          expect(type).to.be(r2.type);
          expect(url).to.be(r2.url);
          expect(reason).to.be(r2.reason);
          expect(done).to.be(false);
          expect(reporter).to.be(guest._id.toString());
        }).end(done);
    });
    it('should response 400 when iid is missing', done => {
      r2.iid = '';
      agent.post('/api/v1/reports')
        .set(adminHeader)
        .send(r2)
        .expect(400, done);
    });
    it('should response 400 when type is missing', done => {
      r2.type = '';
      agent.post('/api/v1/reports')
        .set(adminHeader)
        .send(r2)
        .expect(400, done);
    });
    it('should response 400 when url is missing', done => {
      r2.url = '';
      agent.post('/api/v1/reports')
        .set(adminHeader)
        .send(r2)
        .expect(400, done);
    });
    it('should response 400 when reason is missing', done => {
      r2.reason = '';
      agent.post('/api/v1/reports')
        .set(adminHeader)
        .send(r2)
        .expect(400, done);
    });
    it('should allow to create same Report', done => {
      agent.post('/api/v1/reports')
        .set(adminHeader)
        .send(r1)
        .expect(201, done);
    });
  });
  describe('Testing GET', () => {
    each();
    it('should response 401 when JWT is missing in header when quering Reports', done => {
      agent.get('/api/v1/reports')
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow Admin to query all unprocessed Reports', done => {
      agent.get('/api/v1/reports')
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body, body: [r, ...rest] } }) => {
          expect(body).to.have.length(1);
          expect(r.iid).to.be(report.iid);
          expect(r.url).to.be(report.url);
          expect(r.reason).to.be(report.reason);
          expect(r.type).to.be(report.type);
          expect(r.done).to.be(false);
        }).end(done);
    });
    it('should response 401 when User queries Reports', done => {
      agent.get('/api/v1/reports')
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when Banned User queries Reports', done => {
      agent.get('/api/v1/reports')
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when Guest queries Reports', done => {
      agent.get('/api/v1/reports')
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 401 when JWT is missing in header when quering a Report with its id', done => {
      agent.get(`/api/v1/reports/${report._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow Admin to query a Report with its id', done => {
      agent.get(`/api/v1/reports/${report._id}`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: { _id, iid, url, reason, type, done } } }) => {
          expect(_id).to.be(report._id.toString());
          expect(iid).to.be(report.iid);
          expect(url).to.be(report.url);
          expect(reason).to.be(report.reason);
          expect(type).to.be(report.type);
          expect(done).to.be(false);
        }).end(done);
    });
    it('should response 401 when User queries a Report with its id', done => {
      agent.get(`/api/v1/reports/${report._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when Banned User queries a Report with its id', done => {
      agent.get(`/api/v1/reports/${report._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when Guest queries a Report with its id', done => {
      agent.get(`/api/v1/reports/${report._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 400 when Report id is invalid', done => {
      agent.get('/api/v1/reports/12345')
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 404 when Report is not exist', done => {
      agent.get(`/api/v1/reports/${new Report(r2)._id}`)
        .set(adminHeader)
        .expect(404, done);
    });
  });
  describe('Testing PUT', () => {
    each();
    it('should response 401 when JWT is missing in header', done => {
      agent.put(`/api/v1/reports/${report._id}/done`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow Admin to process a Report', done => {
      agent.put(`/api/v1/reports/${report._id}/done`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: { done } } }) => {
          expect(done).to.be(true);
        }).end(done);
    });
    it('should response 401 when User try to process a Report', done => {
      agent.put(`/api/v1/reports/${report._id}/done`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when Banned User try to process a Report', done => {
      agent.put(`/api/v1/reports/${report._id}/done`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when Guest try to process a Report', done => {
      agent.put(`/api/v1/reports/${report._id}/done`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 400 when report id is invalid', done => {
      agent.put(`/api/v1/reports/${12345}/done`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 400 when report id is missing', done => {
      agent.put('/api/v1/reports//done')
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 404 when report is not exist', done => {
      agent.put(`/api/v1/reports/${new Report(r2)._id}/done`)
        .set(adminHeader)
        .expect(404, done);
    });
  });
  describe('Testing DELETE', () => {
    it('should response 404 because there should not be a DELETE method in Report\'s api', done => {
      agent.del('/api/v1/reports')
        .set(adminHeader)
        .expect(404, done);
    });
  });
});
