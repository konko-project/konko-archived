'use strict';

import path from 'path';
import expect from 'expect.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let u;
let user;

describe('User Model Tests:', () => {
  before(done => {
    u = {
      email: 'user@test.com',
    };
    done();
  });
  describe('Testing create a user', () => {
    it('should has no user', done => {
      User.find().then(users => {
        expect(users).to.be.empty();
        done();
      });
    });
    it('should allow create a new user', done => {
      User.create(u).then(user => {
        expect(user.email).to.be(u.email);
        expect(user.permission).to.be('user');
        expect(user.verified).to.be(false);
        User.remove().then(done());
      });
    });
    it('should not allow create a user that email has already existed', done => {
      User.create(u).then(_u => {
        User.create(u).catch(err => {
          expect(err).not.to.be.empty();
          _u.remove().then(done());
        });
      });
    });
    it('should not allow create a new user without email', done => {
      User.create({ email: '' }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
  });
  describe('Testing user model attributes', () => {
    beforeEach(done => {
      User.create(u).then(u => {
        user = u;
        done();
      });
    });
    afterEach(done => {
      User.remove().then(done());
    });
    it('should allow assign a Profile', done => {
      Profile.create({ username: 'user' }).then(profile => {
        user.profile = profile;
        user.save().then(user => profile.remove().then(done())).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should allow assign a Preference', done => {
      Preference.create({}).then(preference => {
        user.preference = preference;
        user.save().then(user => preference.remove().then(done())).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should allow set user to verified', done => {
      user.verified = true;
      user.save().then(user => {
        expect(user.verified).to.be(true);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow change user\'s permission to Admin', done => {
      user.permission = 'admin';
      user.save().then(user => {
        expect(user.permission).to.be('admin');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow change user\'s permission to Banned', done => {
      user.permission = 'banned';
      user.save().then(user => {
        expect(user.permission).to.be('banned');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow change user\'s permission to Guest', done => {
      user.permission = 'guest';
      user.save().then(user => {
        expect(user.permission).to.be('guest');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow change user\'s permission to something else', done => {
      user.permission = 'permission';
      user.save().catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
  });
  describe('Testing User#setPassword', () => {
    beforeEach(done => {
      User.create(u).then(u => {
        user = u;
        done();
      });
    });
    afterEach(done => {
      User.remove().then(done());
    });
    it('should allow hash a password', done => {
      let password = 'this is password';
      user.setPassword(password);
      expect(user.hash).not.to.be(password);
      expect(user.salt).to.not.be.empty();
      done();
    });
  });
  describe('Testing User#validPassword', () => {
    beforeEach(done => {
      let password = 'this is password';
      User.create(u).then(u => {
        u.setPassword(password);
        u.save().then(u => {
          user = u;
          done();
        });
      });
    });
    afterEach(done => {
      User.remove().then(done());
    });
    it('should validate a correct password to be true', done => {
      let result = user.validPassword('this is password');
      expect(result).to.be(true);
      done();
    });
    it('should validate a wrong password to be false', done => {
      let result = user.validPassword('this is wrong password');
      expect(result).to.be(false);
      done();
    });
  });
  describe('Testing User#login', () => {
    beforeEach(done => {
      Profile.create({ username: 'user' }).then(p => {
        User.create(u).then(u => {
          u.profile = p;
          u.save().then(u => {
            user = u;
            done();
          });
        });
      });
    });
    afterEach(done => {
      User.remove().then(Profile.remove().then(done()));
    });
    it('should update a last login time', done => {
      let current = user.profile.lastLogin;
      user.login().then(user => {
        expect(user.profile.lastLogin).not.to.be(current);
        done();
      });
    });
  });
  describe('Testing User#generateJWT', () => {
    beforeEach(done => {
      Profile.create({ username: 'user' }).then(p => {
        User.create(u).then(u => {
          u.profile = p;
          u.save().then(u => {
            user = u;
            done();
          });
        });
      });
    });
    afterEach(done => {
      User.remove().then(Profile.remove().then(done()));
    });
    it('should generate a JWT that contains user\'s basic information', done => {
      let _app = app(path.resolve(SERVER.build.paths.root));
      let token = user.generateJWT(_app);
      let decoded = jwt.verify(token, _app.get('secret'));
      expect(decoded._id).to.be(user._id.toString());
      expect(decoded.email).to.be(undefined);
      expect(decoded.joined).to.be(user.joined.toISOString());
      expect(decoded.permission).to.be(user.permission);
      expect(decoded.verified).to.be(user.verified);
      expect(decoded.profile.username).to.be(user.profile.username);
      done();
    });
  });
});
