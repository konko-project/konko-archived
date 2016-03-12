'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Profile = mongoose.model('Profile');

let p;

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
        expect(profile.avatar).to.be('style/core/images/users/default.png');
        expect(profile.banner).to.be(null);
        expect(profile.tagline).to.be(undefined);
        expect(profile.gender).to.be('None');
        expect(profile.tokenLive).to.be('24h');
        profile.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        console.log(err);
        done();
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
});
