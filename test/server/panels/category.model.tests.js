'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Category = mongoose.model('Category');
const Panel = mongoose.model('Panel');

let c1;
let c2;
let c3;
let category;
let nameTooShort;
let nameTooLong;

describe('Category Model Test:', () => {
  before(() => {
    c1 = {
      name: 'Category 1',
      order: 0,
    };
    c2 = {
      name: 'Category 2',
      order: 0,
    };
    c3 = {
      name: 'Category 3',
      order: 1,
    };
    nameTooShort = {
      name: 'T',
      order: 1,
    };
    nameTooLong = {
      name: 'TestTestTestTest',
      order: 1,
    };
    Category.schema.path('name', {
      type: String,
      unique: true,
      required: '{PATH} is required',
      minlength: 5,
      maxlength: 10,
    });
  });

  describe('Testing create a category', () => {
    it('should contain no category', done => {
      Category.find().then(category => {
        expect(category.length).to.be(0);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create category when name is within minlength and maxlength', done => {
      Category.create(c1).then(_c1 => {
        _c1.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create category when name is too short', done => {
      Category.create(nameTooShort).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create category when name is too long', done => {
      Category.create(nameTooLong).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create two different categories', done => {
      Category.create(c1).then(_c1 => {
        Category.create(c2).then(_c2 => {
          _c2.remove().then(() => {
            _c1.remove().then(done()).catch(err => {
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
    it('should not allow create category with same name twice', done => {
      Category.create(c1).then(_c1 => {
        Category.create(c1).catch(err => {
          expect(err).not.to.be.empty();
          _c1.remove().then(done()).catch(err => {
            expect(err).to.be.empty();
            done();
          });
        });
      });
    });
    it('should not allow create category without name', done => {
      let c4 = Object.assign({}, c1);
      c4.name = '';
      Category.create(c4).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create category with name only', done => {
      let c4 = { name: 'mocha test' };
      Category.create(c4).then(_c4 => {
        _c4.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow add a panel', done => {
      let p1 = { name: 'mocha test' };
      Category.create(c1).then(_c1 => {
        Panel.create(p1).then(_p1 => {
          _c1.panels.push(_p1);
          _c1.save().then(_c1 => {
            _c1.remove().then(() => {
              _p1.remove().then(done()).catch(err => {
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
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
  describe('Testing category modification', () => {
    beforeEach(done => {
      Category.create(c1).then(_c1 => {
        category = _c1;
        done();
      });
    });
    afterEach(done => {
      Category.remove().then(done());
    });
    it('should allow modify a category name', done => {
      category.name = 'panel 234';
      category.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow modify a category order', done => {
      category.order = 9;
      category.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
});
