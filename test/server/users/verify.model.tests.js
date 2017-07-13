'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const User = mongoose.model('User');
const VerificationToken = mongoose.model('VerificationToken');

let user;
let token;

describe('VerificationToken Model Tests:', () => {
  before(done => {
    User.create({ email: 'user@test.com' }).then(u => user = u);
    done();
  });
  after(done => {
    User.remove().then(done());
  });
  describe('Testing create a verfication token', () => {
    it('should has no token', done => {
      VerificationToken.find().then(tokens => {
        expect(tokens).to.be.empty();
        done();
      });
    });
    it('should allow create a verfication token', done => {
      VerificationToken.create({ user: user }).then(v => {
        expect(v.user).to.be.eql(user);
        v.remove().then(done());
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create a verfication token without user', done => {
      VerificationToken.create({}).catch(err => {
        expect(err).to.not.be.empty();
        done();
      });
    });
  });
  describe('Testing VerificationToken#generateToken', done => {
    after(done => {
      User.remove().then(VerificationToken.remove().then(done()));
    });
    it('should allow generate a uuid token', done => {
      VerificationToken.create({ user: user }).then(token => {
        expect(token.token).not.to.be(null);
        expect(token.token).not.to.be(undefined);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
});
