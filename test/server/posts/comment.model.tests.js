'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Comment = mongoose.model('Comment');
const Topic = mongoose.model('Topic');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');

let user;
let topic;
let comment;
let _comment;
let contentTooShort;
let contentTooLong;

describe('Comment Model Tests:', () => {
  before(done => {
    Comment.schema.path('content', {
      type: String,
      unique: true,
      required: '{PATH} is required',
      minlength: 10,
      maxlength: 10000,
    });
    comment = {
      content: 'c'.repeat(100),
    };
    contentTooShort = {
      content: 'content',
    };
    contentTooLong = {
      content: 'c'.repeat(10001),
    };
    done();
  });
  describe('Testing create a comment', () => {
    it('should has no comment', done => {
      Comment.find().then(comments => {
        expect(comments).to.be.empty();
        done();
      });
    });
    it('should allow create comment when content is within limits', done => {
      Comment.create(comment).then(comment => {
        comment.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create topic when content is too short', done => {
      Comment.create(contentTooShort).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create topic when content is too long', done => {
      Comment.create(contentTooLong).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create two different comments with different content', done => {
      let c2 = Object.assign({}, comment);
      c2.content = 't'.repeat(123);
      Comment.create(comment).then(c1 => {
        Comment.create(c2).then(c2 => {
          c2.remove().then(() => {
            c1.remove().then(done());
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
    it('should allow create two comments with same content', done => {
      Comment.create(comment).then(c1 => {
        Comment.create(comment).then(c2 => {
          c2.remove().then(c1.remove().then(done()));
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should not allow create comment without content', done => {
      let c2 = Object.assign({}, comment);
      c2.content = '';
      Comment.create(c2).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
  });
  describe('Testing Comment modification', () => {
    before(done => {
      Topic.create({ title: 'Test Topic', content: 't'.repeat(100) }).then(t => {
        topic = t;
      });
      Profile.create({ username: 'test user' }).then(p => {
        User.create({ email: 'test@test.com', profile: p }).then(u => {
          user = u;
          done();
        });
      });
    });
    beforeEach(done => {
      Comment.create(comment).then(comment => {
        _comment = comment;
        done();
      });
    });
    afterEach(done => {
      Comment.remove().then(done());
    });
    after(done => {
      Topic.remove().then(User.remove().then(Profile.remove().then(done())));
    });
    it('should allow modify a comment content', done => {
      _comment.content = 'T'.repeat(233);
      _comment.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow persist information on update', done => {
      _comment.updated.by = user.profile.username;
      _comment.updated.date = new Date();
      _comment.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow assign topic to a author', done => {
      _comment.author = user;
      _comment.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow assign topic to a topic', done => {
      _comment.topic = topic;
      _comment.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Tesing Comment#like', () => {
    it('should allow like a comment', done => {
      let uid = '98237987628340923';
      Comment.create(comment).then(comment => {
        comment.like(uid).then(comment => {
          expect(comment.likes).to.have.length(1);
          expect(comment.likes[0]).to.be(uid);
          comment.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
  describe('Tesing Comment#unlike', () => {
    it('should allow un-like a comment', done => {
      let uid = '98237987628340923';
      Comment.create(comment).then(comment => {
        comment.like(uid).then(comment => {
          expect(comment.likes).to.have.length(1);
          expect(comment.likes[0]).to.be(uid);
          comment.unlike(uid).then(comment => {
            expect(comment.likes).to.have.length(0);
            comment.remove().then(done());
          });
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
});
