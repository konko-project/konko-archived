'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Profile = mongoose.model('Profile');

let p;
let profile;

describe('Profile Model Tests:', () => {
  before(done => {
    Profile.schema.path('username', {
      type: String,
      unique: true,
      required: '{PATH} is required',
      minlength: 3,
      maxlength: 15,
    });
    Profile.schema.path('tagline', {
      type: String,
      minlength: 0,
      maxlength: 20,
      default: null,
    });
    p = {
      username: 'user',
      dob: new Date(),
    };
    done();
  });
  describe('Testing create a profile', () => {
    it('should has no profile', done => {
      Profile.find().then(profiles => {
        expect(profiles).to.be.empty();
        done();
      });
    });
    it('should allow create a new profile', done => {
      Profile.create(p).then(profile => {
        expect(profile.username).to.be(p.username);
        expect(profile.dob).to.be(p.dob);
        expect(profile.avatar).to.be(null);
        expect(profile.banner).to.be(null);
        expect(profile.tagline).to.be(null);
        expect(profile.gender).to.be('None');
        expect(profile.tokenLive).to.be('24h');
        profile.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done(err);
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done(err);
      });
    });
    it('should not allow create a profile with username already exist', done => {
      Profile.create(p).then(profile => {
        Profile.create(p).catch(err => {
          expect(err).not.to.be.empty();
          profile.remove().then(done());
        });
      });
    });
    it('should not allow create a profile without username', done => {
      Profile.create({ username: '' }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
  });
  describe('Testing Profile#generateProfileImages', () => {
    beforeEach(done => {
      Profile.create(p).then(_p => {
        profile = _p;
        done();
      });
    });
    afterEach(done => {
      Profile.remove().then(done());
    });
    it('should generate both avatar and banner images', done => {
      expect(profile.banner).to.be(null);
      expect(profile.avatar).to.be(null);
      profile.generateProfileImages(profile.username).then(profile => {
        expect(profile.banner).not.to.be(null);
        expect(profile.avatar).not.to.be(null);
        done();
      });
    });
  });
  describe('Testing Profile#online', () => {
    beforeEach(done => {
      Profile.create(p).then(_p => {
        profile = _p;
        done();
      });
    });
    afterEach(done => {
      Profile.remove().then(done());
    });
    it('should update last online time', done => {
      let current = profile.lastOnline;
      profile.online().then(profile => {
        expect(current).not.to.be(profile.lastOnline);
        done();
      });
    });
  });
});
