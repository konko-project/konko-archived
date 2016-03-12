'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Panel = mongoose.model('Panel');
const Category = mongoose.model('Category');

let p1;
let p2;
let p3;
let panel;
let nameTooShort;
let nameTooLong;
let descriptionTooLong;

describe('Panel Model Tests:', () => {
  before(() => {
    p1 = {
      name: 'Panel 1',
      order: 0,
      description: 'Test panel 1',
    };
    p2 = {
      name: 'Panel 2',
      order: 0,
      description: 'Test panel 2',
    };
    p3 = {
      name: 'Panel 3',
      order: 1,
      description: 'Test panel 3',
    };
    nameTooShort = {
      name: 'T',
      order: 1,
      description: 'Test panel 1',
    };
    nameTooLong = {
      name: 'TestTestTestTest',
      order: 1,
      description: 'Test panel 1',
    };
    descriptionTooLong = {
      name: 'Panel 4',
      order: 1,
      description: 'T'.repeat(101),
    };
    Panel.schema.path('name', {
      type: String,
      unique: true,
      required: '{PATH} is required',
      minlength: 5,
      maxlength: 10,
    });
    Panel.schema.path('description', {
      type: String,
      minlength: 0,
      maxlength: 100,
    });
  });

  describe('Testing create a panel', () => {
    it('should contain no panel', done => {
      Panel.find().then(panels => {
        expect(panels).to.be.empty();
        done();
      });
    });
    it('should allow create panel when name and description are within limits', done => {
      Panel.create(p1).then(_p1 => {
        _p1.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create panel when name is too short', done => {
      Panel.create(nameTooShort).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create panel when name is too long', done => {
      Panel.create(nameTooLong).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create panel when description is too long', done => {
      Panel.create(descriptionTooLong).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create two different panels', done => {
      Panel.create(p1).then(_p1 => {
        Panel.create(p2).then(_p2 => {
          _p2.remove().then(() => {
            _p1.remove().then(() => done()).catch(err => {
              expect(err).to.be.empty();
              done();
            });
          });
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should not allow create panel with same name', done => {
      Panel.create(p1).then(_p1 => {
        Panel.create(p1).catch(err => {
          expect(err).not.to.be.empty();
          _p1.remove().then(() => done()).catch(err => {
            expect(err).to.be.empty();
            done();
          });
        });
      });
    });
    it('should not allow create panel without name', done => {
      let p4 = Object.assign({}, p1);
      p4.name = '';
      Panel.create(p4).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create panel only with name', done => {
      let p4 = { name: 'name only' };
      Panel.create(p4).then(_p4 => {
        _p4.remove().then(() => done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create panel as child of a category', done => {
      let c1 = { name: 'cate one' };
      Category.create(c1).then(_c1 => {
        Panel.create(p1).then(_p1 => {
          _p1.category = _c1;
          _p1.save().then(_p1 => {
            _c1.panels.push(_p1);
            _c1.save().then(_c1 => {
              _c1.remove().then(() => {
                _p1.remove().then(() => done());
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
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create panel as child of a panel', done => {
      Panel.create(p1).then(_p1 => {
        Panel.create(p2).then(_p2 => {
          _p2.parent = _p1;
          _p2.save().then(_p2 => {
            _p1.children.push(_p2);
            _p1.save().then(_p1 => {
              _p1.remove().then(() => {
                _p2.remove().then(() => done()).catch(err => {
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
  });
  describe('Testing panel modification', () => {
    beforeEach(done => {
      Panel.create(p1).then(_p1 => {
        panel = _p1;
        done();
      });
    });
    afterEach(done => {
      Panel.remove().then(done());
    });
    it('should allow modify a panel name', done => {
      panel.name = 'panel 234';
      panel.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow modify a panel description', done => {
      panel.description = 'panel'.repeat(3);
      panel.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow modify a panel order', done => {
      panel.order = 5;
      panel.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing Panel#addtopic', () => {
    it('should increment topic number by 1', done => {
      Panel.create(p1).then(_p1 => {
        _p1.addtopic().then(_p1 => {
          expect(_p1.topics).to.be(1);
          _p1.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });

  describe('Testing Panel#addComment', () => {
    it('should increment comment number by 1', done => {
      Panel.create(p2).then(_p2 => {
        _p2.addComment().then(_p2 => {
          expect(_p2.comments).to.be(1);
          _p2.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
});
