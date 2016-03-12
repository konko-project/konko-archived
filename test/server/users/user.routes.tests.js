'use strict';

import path from 'path';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const User = mongoose.model('User');
const Core = mongoose.model('Core');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');
const Topic = mongoose.model('Topic');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let _app;
let u1;
let owner;
let agent;
let adminHeader;
let userHeader;
let bannedHeader;
let guestHeader;
let ownerHeader;

describe('User CRUD Test:', () => {
  before(done => {
    Core.create({ basic: { title: 'Test' } }).catch(err => {
      expect(err).to.be.empty();
      return done();
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
    Preference.create({}).then(preference => {
      Profile.create({ username: 'owner' }).then(profile => {
        User.create({ email: 'owner@test.com', permission: 'user', profile: profile, preference: preference }).then(u => owner = u).catch(err => {
          expect(err).to.be.empty();
          return done();
        });
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
      ownerHeader = {
        Authorization: `Bearer ${owner.generateJWT(_app)}`,
        'x-csrf-token': csrfToken,
      };
      done();
    });
  });
  after(done => {
    Preference.remove().then(Profile.remove().then(User.remove().then(Core.remove().then(done()))));
  });
  describe('Testing POST', () => {
    it('should response 404 because there should not be a POST method in user\'s api', done => {
      agent.post('/api/v1/users')
        .set(adminHeader)
        .send({ email: 'user2@test.com' })
        .expect(404, done);
    });
  });
  describe('Testing GET', () => {
    it('should response 401 when JWT is missing in header when quering all users', done => {
      agent.get('/api/v1/users')
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should response all users if user is an Admin', done => {
      agent.get('/api/v1/users')
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body } }) => expect(body).to.have.length(5))
        .end(done);
    });
    it('should response 401 a User is quering all users', done => {
      agent.get('/api/v1/users')
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 a Banned user is quering all users', done => {
      agent.get('/api/v1/users')
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 a Guest is quering all users', done => {
      agent.get('/api/v1/users')
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 401 when JWT is missing in header when quering one user', done => {
      agent.get(`/api/v1/users/${owner._id}`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should response 401 when an Admin is quering a user', done => {
      agent.get(`/api/v1/users/${owner._id}`)
        .set(adminHeader)
        .expect(401, done);
    });
    it('should response 401 when an User is quering other user', done => {
      agent.get(`/api/v1/users/${owner._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when an Banned user is quering a user', done => {
      agent.get(`/api/v1/users/${owner._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest is quering a user', done => {
      agent.get(`/api/v1/users/${owner._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should allow an user quering themselves', done => {
      agent.get(`/api/v1/users/${owner._id}`)
        .set(ownerHeader)
        .expect(200)
        .expect(({ res: { body: { _id, email, permission, profile: { username } } } }) => {
          expect(_id).to.be(owner._id.toString());
          expect(email).to.be(owner.email);
          expect(permission).to.be(owner.permission);
          expect(username).to.be(owner.profile.username);
        })
        .end(done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.get(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}`)
        .set(ownerHeader)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.get(`/api/v1/users/${12345}`)
        .set(ownerHeader)
        .expect(400, done);
    });
    it('should response 401 when JWT is missing in header when quering user\'s profile', done => {
      agent.get(`/api/v1/users/${owner._id}/profile`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should response a user\'s profile when an Admin is quering a user\'s profile', done => {
      agent.get(`/api/v1/users/${owner._id}/profile`)
        .set(adminHeader)
        .expect(200)
        .expect(({ res: { body: { username } } }) => {
          expect(username).to.be(owner.profile.username);
        })
        .end(done);
    });
    it('should response a user\'s profile when an User is quering a user\'s profile', done => {
      agent.get(`/api/v1/users/${owner._id}/profile`)
        .set(userHeader)
        .expect(200)
        .expect(({ res: { body: { username } } }) => {
          expect(username).to.be(owner.profile.username);
        })
        .end(done);
    });
    it('should response 401 when an Banned user is quering a user\'s profile', done => {
      agent.get(`/api/v1/users/${owner._id}/profile`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest is quering a user\'s profile', done => {
      agent.get(`/api/v1/users/${owner._id}/profile`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.get(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/profile`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.get('/api/v1/users//profile')
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.get(`/api/v1/users/${12345}/profile`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 401 when JWT is missing in header when quering user\'s preference', done => {
      agent.get(`/api/v1/users/${owner._id}/preference`)
        .set(ownerHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should response 401 when an Admin is quering an user\'s preference', done => {
      agent.get(`/api/v1/users/${owner._id}/preference`)
        .set(adminHeader)
        .expect(401, done);
    });
    it('should response 401 when an User is quering other user\'s preference', done => {
      agent.get(`/api/v1/users/${owner._id}/preference`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when an Banned user is quering an user\'s preference', done => {
      agent.get(`/api/v1/users/${owner._id}/preference`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest is quering an user\'s preference', done => {
      agent.get(`/api/v1/users/${owner._id}/preference`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should allow an user quering their own preference', done => {
      agent.get(`/api/v1/users/${owner._id}/preference`)
        .set(ownerHeader)
        .expect(200, done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.get(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/preference`)
        .set(ownerHeader)
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.get('/api/v1/users//preference')
        .set(ownerHeader)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.get(`/api/v1/users/${12345}/preference`)
        .set(ownerHeader)
        .expect(400, done);
    });
    it('should response 401 when JWT is missing in header when quering user\'s bookmarks', done => {
      agent.get(`/api/v1/users/${owner._id}/bookmarks`)
        .set(ownerHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow an Admin quering a user\'s bookmarks', done => {
      agent.get(`/api/v1/users/${owner._id}/bookmarks`)
        .set(adminHeader)
        .expect(200, done);
    });
    it('should allow an User quering other user\'s bookmarks', done => {
      agent.get(`/api/v1/users/${owner._id}/bookmarks`)
        .set(userHeader)
        .expect(200, done);
    });
    it('should response 401 when an Banned user is quering a user\'s bookmarks', done => {
      agent.get(`/api/v1/users/${owner._id}/bookmarks`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest is quering a user\'s bookmarks', done => {
      agent.get(`/api/v1/users/${owner._id}/bookmarks`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.get(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/bookmarks`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.get('/api/v1/users//bookmarks')
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.get(`/api/v1/users/${12345}/bookmarks`)
        .set(adminHeader)
        .expect(400, done);
    });
    it('should response 401 when JWT is missing in header when quering user\'s permission', done => {
      agent.get(`/api/v1/users/${owner._id}/permission`)
        .set(adminHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should allow an Admin quering a user\'s permission', done => {
      agent.get(`/api/v1/users/${owner._id}/permission`)
        .set(adminHeader)
        .expect(200, done);
    });
    it('should allow an User quering other user\'s permission', done => {
      agent.get(`/api/v1/users/${owner._id}/permission`)
        .set(userHeader)
        .expect(200, done);
    });
    it('should allow an Banned is quering a user\'s permission', done => {
      agent.get(`/api/v1/users/${owner._id}/permission`)
        .set(bannedHeader)
        .expect(200, done);
    });
    it('should allow a Guest quering a user\'s permission', done => {
      agent.get(`/api/v1/users/${owner._id}/permission`)
        .set(guestHeader)
        .expect(200, done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.get(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/permission`)
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.get('/api/v1/users//permission')
        .set(adminHeader)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.get(`/api/v1/users/${12345}/permission`)
        .set(adminHeader)
        .expect(400, done);
    });
  });
  describe('Testing PUT', () => {
    let p;
    let pre;
    beforeEach(done => {
      p = {
        username: 'profile',
        gender: 'Male',
      };
      pre = {
        topicListLimit: 10,
        commentListLimit: 10,
      };
      done();
    });
    it('should response 401 when JWT is missing in header when updating an user\'s profile', done => {
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(ownerHeader)
        .set('Authorization', '')
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when an Admin is updating an user\'s profile', done => {
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(adminHeader)
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when an User is updating other user\'s profile', done => {
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(userHeader)
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when a Banned user is updating an user\'s profile', done => {
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(bannedHeader)
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when a Guest is updating an user\'s profile', done => {
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(guestHeader)
        .send(p)
        .expect(401, done);
    });
    it('should allow an user update their own profile', done => {
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(ownerHeader)
        .send(p)
        .expect(200)
        .expect(({ res: { body: { username, gender } } }) => {
          expect(username).to.be(p.username);
          expect(gender).to.be(p.gender);
        })
        .end(done);
    });
    it('should response 500 when update profile with empty username', done => {
      p.username = '';
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(ownerHeader)
        .send(p)
        .expect(500, done);
    });
    it('should response 500 when update profile when username is too short', done => {
      p.username = 'p';
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(ownerHeader)
        .send(p)
        .expect(500, done);
    });
    it('should response 500 when update profile when username is too long', done => {
      p.username = 'p'.repeat(100);
      agent.put(`/api/v1/users/${owner._id}/profile`)
        .set(ownerHeader)
        .send(p)
        .expect(500, done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.put(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/profile`)
        .set(ownerHeader)
        .send(p)
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.put('/api/v1/users//profile')
        .set(ownerHeader)
        .send(p)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.put(`/api/v1/users/${12345}/profile`)
        .set(ownerHeader)
        .send(p)
        .expect(400, done);
    });
    it('should response 401 when JWT is missing in header when updating an user\'s preference', done => {
      agent.put(`/api/v1/users/${owner._id}/preference`)
        .set(ownerHeader)
        .set('Authorization', '')
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when an Admin is updating an user\'s preference', done => {
      agent.put(`/api/v1/users/${owner._id}/preference`)
        .set(adminHeader)
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when an User is updating other user\'s preference', done => {
      agent.put(`/api/v1/users/${owner._id}/preference`)
        .set(userHeader)
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when a Banned user is updating an user\'s preference', done => {
      agent.put(`/api/v1/users/${owner._id}/preference`)
        .set(bannedHeader)
        .send(p)
        .expect(401, done);
    });
    it('should response 401 when a Guest is updating an user\'s preference', done => {
      agent.put(`/api/v1/users/${owner._id}/preference`)
        .set(guestHeader)
        .send(p)
        .expect(401, done);
    });
    it('should allow an user update their own preference', done => {
      agent.put(`/api/v1/users/${owner._id}/preference`)
        .set(ownerHeader)
        .send(pre)
        .expect(200)
        .expect(({ res: { body: { topicListLimit, commentListLimit } } }) => {
          expect(topicListLimit).to.be(pre.topicListLimit);
          expect(commentListLimit).to.be(pre.commentListLimit);
        })
        .end(done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.put(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/preference`)
        .set(ownerHeader)
        .send(p)
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.put('/api/v1/users//preference')
        .set(ownerHeader)
        .send(p)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.put(`/api/v1/users/${12345}/preference`)
        .set(ownerHeader)
        .send(p)
        .expect(400, done);
    });
    it('should response 401 when JWT is missing in header when updating an user\'s permission', done => {
      agent.put(`/api/v1/users/${owner._id}/permission`)
        .set(ownerHeader)
        .set('Authorization', '')
        .send(p)
        .expect(401, done);
    });
    it('should allow Admin to update an user\'s permission', done => {
      agent.put(`/api/v1/users/${owner._id}/permission`)
        .set(adminHeader)
        .send({ permission: 'admin' })
        .expect(204)
        .end((err, res) => {
          agent.put(`/api/v1/users/${owner._id}/permission`)
          .set(adminHeader)
          .send({ permission: 'user' })
          .expect(204, done);
        });
    });
    it('should response 401 when an User is updating other user\'s permission', done => {
      agent.put(`/api/v1/users/${owner._id}/permission`)
        .set(userHeader)
        .send({ permission: 'admin' })
        .expect(401, done);
    });
    it('should response 401 when a Banned user is updating an user\'s permission', done => {
      agent.put(`/api/v1/users/${owner._id}/permission`)
        .set(bannedHeader)
        .send({ permission: 'admin' })
        .expect(401, done);
    });
    it('should response 401 when a Guest is updating an user\'s permission', done => {
      agent.put(`/api/v1/users/${owner._id}/permission`)
        .set(guestHeader)
        .send({ permission: 'admin' })
        .expect(401, done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.put(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/permission`)
        .set(adminHeader)
        .send({ permission: 'admin' })
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.put('/api/v1/users//permission')
        .set(adminHeader)
        .send({ permission: 'admin' })
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.put(`/api/v1/users/${12345}/permission`)
        .set(adminHeader)
        .send({ permission: 'admin' })
        .expect(400, done);
    });
  });
  describe('Testing DELETE', () => {
    let topic;
    before(done => {
      Topic.create({ title: 'Topic', content: 'This is a topic.', author: owner }).then(t => {
        topic = t;
        agent.put(`/api/v1/topics/${topic._id}/bookmark`)
          .set(ownerHeader)
          .expect(204)
          .expect(res => User.findById(owner._id).then(u => expect(u.bookmarks).to.have.length(1)))
          .end(done);
      });
    });
    after(done => {
      Topic.remove().then(done());
    });
    it('should response 401 when JWT is missing in header when deleting a bookmark', done => {
      agent.del(`/api/v1/users/${owner._id}/bookmarks/${topic._id}`)
        .set(ownerHeader)
        .set('Authorization', '')
        .expect(401, done);
    });
    it('should response 401 when an Admin delete someone\'s bookmark', done => {
      agent.del(`/api/v1/users/${owner._id}/bookmarks/${topic._id}`)
        .set(adminHeader)
        .expect(401, done);
    });
    it('should response 401 when an User delete someone\'s bookmark', done => {
      agent.del(`/api/v1/users/${owner._id}/bookmarks/${topic._id}`)
        .set(userHeader)
        .expect(401, done);
    });
    it('should response 401 when a Banned user delete someone\'s bookmark', done => {
      agent.del(`/api/v1/users/${owner._id}/bookmarks/${topic._id}`)
        .set(bannedHeader)
        .expect(401, done);
    });
    it('should response 401 when a Guest delete someone\'s bookmark', done => {
      agent.del(`/api/v1/users/${owner._id}/bookmarks/${topic._id}`)
        .set(guestHeader)
        .expect(401, done);
    });
    it('should allow an user delete their own bookmark', done => {
      agent.del(`/api/v1/users/${owner._id}/bookmarks/${topic._id}`)
        .set(ownerHeader)
        .expect(204)
        .expect(res => User.findById(owner._id).then(u => expect(u.bookmarks).to.have.length(0)))
        .end(done);
    });
    it('should response 404 when user is not exist in database', done => {
      agent.del(`/api/v1/users/${new User({ email: 'user3@test.com' })._id}/bookmarks/${topic._id}`)
        .set(ownerHeader)
        .expect(404, done);
    });
    it('should response 404 when user id is missing', done => {
      agent.del(`/api/v1/users//bookmarks/${topic._id}`)
        .set(ownerHeader)
        .expect(404, done);
    });
    it('should response 400 when user id is invalid', done => {
      agent.del(`/api/v1/users/${12345}/bookmarks/${topic._id}`)
        .set(ownerHeader)
        .expect(400, done);
    });
  });
});
