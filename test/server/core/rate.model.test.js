'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const RateLimit = mongoose.model('RateLimit');

let r1;
let r2;
let r3;
let rate;

describe('Core Model Test:', () => {
  before(() => {
    r1 = { ip: '233.233.233.233' };
    r2 = { ip: '' };
    r3 = { ip: '23.23.23.23' };
  });

  describe('Testing create a RateLimit', () => {
    it('should contain no RateLimit', done => {
      RateLimit.find().then(rates => {
        expect(rates).to.be.empty();
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create RateLimit with ip', done => {
      RateLimit.create(r1).then(r => {
        expect(r.ip).to.be(r1.ip);
        r.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create RateLimit without ip', done => {
      RateLimit.create(r2).then(r => {
        expect(r).to.be.empty();
        done();
      }).catch(err => {
        expect(err).not.to.be.empty();
        RateLimit.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should allow create RateLimit with different ip', done => {
      RateLimit.create(r1).then(r => {
        expect(r.ip).to.be(r1.ip);
        RateLimit.create(r3).then(r => {
          expect(r.ip).to.be(r3.ip);
          RateLimit.remove().then(done()).catch(err => {
            expect(err).to.be.empty();
            done();
          });
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create RateLimit with same ip', done => {
      RateLimit.create(r1).then(r => {
        expect(r.ip).to.be(r1.ip);
        RateLimit.create(r1).then(r => {
          expect(r.ip).to.be(r1.ip);
          RateLimit.remove().then(done()).catch(err => {
            expect(err).to.be.empty();
            done();
          });
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing RateLimit modification', () => {
    beforeEach(done => {
      RateLimit.create(r1).then(r => {
        rate = r;
        done();
      });
    });
    afterEach(done => {
      RateLimit.remove().then(done());
    });
    it('should allow update hits', done => {
      rate.hits = 233;
      rate.save().then(r => {
        expect(r.hits).to.be(233);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
});
