'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Preference = mongoose.model('Preference');

describe('Preference Model Tests:', () => {
  describe('Testing create a preference', () => {
    it('should has no preference', done => {
      Preference.find().then(preferences => {
        expect(preferences).to.be.empty();
        done();
      });
    });
    it('should allow create a preference without any body', done => {
      Preference.create({}).then(preference => {
        expect(preference.topicListLimit).to.be(20);
        expect(preference.commentListLimit).to.be(30);
        expect(preference.sideBarBackground).to.be(false);
        preference.remove().then(done());
      });
    });
  });
});
