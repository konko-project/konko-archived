'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Slide = mongoose.model('Slide');

let s1;

describe('Slide Model Test:', () => {
  before(() => {
    s1 = {
      title: 'Slide One',
      description: 'description',
      image: 'image_url',
      url: 'link_url',
      alt: 'image_alt',
      order: '0',
    };
  });

  describe('Testing create a Slide', () => {
    it('should contain no Slide', done => {
      Slide.find().then(slides => {
        expect(slides).to.be.empty();
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create Slide with required data', done => {
      Slide.create(s1).then(s => {
        expect(s.title).to.be(s1.title);
        expect(s.description).to.be(s1.description);
        expect(s.image).to.be(s1.image);
        expect(s.url).to.be(s1.url);
        expect(s.alt).to.be(s1.alt);
        expect(s.order).to.be(s1.order);
        s.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should now allow create Slide without title', done => {
      let s2 = Object.assign({}, s1);
      s2.title = '';
      Slide.create(s2).then(s => {
        expect(s).to.be.empty();
        s.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should now allow create Slide without image', done => {
      let s2 = Object.assign({}, s1);
      s2.image = '';
      Slide.create(s2).then(s => {
        expect(s).to.be.empty();
        s.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should now allow create Slide without url', done => {
      let s2 = Object.assign({}, s1);
      s2.url = '';
      Slide.create(s2).then(s => {
        expect(s).to.be.empty();
        s.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create same Slide again', done => {
      Slide.create(s1).then(s => {
        Slide.create(s1).then(s => {
          expect(s.title).to.be(s1.title);
          expect(s.description).to.be(s1.description);
          expect(s.image).to.be(s1.image);
          expect(s.url).to.be(s1.url);
          expect(s.alt).to.be(s1.alt);
          expect(s.order).to.be(s1.order);
          Slide.remove().then(done()).catch(err => {
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
