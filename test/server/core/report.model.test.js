'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const User = mongoose.model('User');
const Report = mongoose.model('Report');

let r1;
let user;

describe('Report Model Test:', () => {
  before(() => {
    user = new User({ email: 'user@test.com' });
    r1 = {
      iid: '123456',
      type: 'topic',
      url: '/t/123456',
      reason: 'reason',
      reporter: user,
    };
  });

  describe('Testing create a Report', () => {
    it('should contain no Report', done => {
      Report.find().then(reports => {
        expect(reports).to.be.empty();
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create Report with needed data', done => {
      Report.create(r1).then(r => {
        expect(r.iid).to.be(r1.iid);
        expect(r.type).to.be(r1.type);
        expect(r.url).to.be(r1.url);
        expect(r.reason).to.be(r1.reason);
        expect(r.reporter).to.be(r1.reporter);
        r.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create Report without iid', done => {
      let r2 = Object.assign({}, r1);
      r2.iid = '';
      Report.create(r2).then(r => {
        expect(r).to.be.empty();
        r.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create Report without type', done => {
      let r2 = Object.assign({}, r1);
      r2.type = '';
      Report.create(r2).then(r => {
        expect(r).to.be.empty();
        r.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create Report without url', done => {
      let r2 = Object.assign({}, r1);
      r2.url = '';
      Report.create(r2).then(r => {
        expect(r).to.be.empty();
        r.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create Report without reason', done => {
      let r2 = Object.assign({}, r1);
      r2.reason = '';
      Report.create(r2).then(r => {
        expect(r).to.be.empty();
        r.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create same Report', done => {
      Report.create(r1).then(r => {
        expect(r.iid).to.be(r1.iid);
        expect(r.type).to.be(r1.type);
        expect(r.url).to.be(r1.url);
        expect(r.reason).to.be(r1.reason);
        expect(r.reporter).to.be(r1.reporter);
        Report.create(r1).then(r => {
          expect(r.iid).to.be(r1.iid);
          expect(r.type).to.be(r1.type);
          expect(r.url).to.be(r1.url);
          expect(r.reason).to.be(r1.reason);
          expect(r.reporter).to.be(r1.reporter);
          Report.remove().then(done()).catch(err => {
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
  describe('Testing Report#processed', () => {
    it('should set done to true', done => {
      Report.create(r1).then(r => {
        expect(r.done).to.be(false);
        r.processed().then(r => {
          expect(r.done).to.be(true);
          r.remove().then(done()).catch(err => {
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
});
