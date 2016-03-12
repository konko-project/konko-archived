'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Topic = mongoose.model('Topic');
const Panel = mongoose.model('Panel');
const Comment = mongoose.model('Comment');
const User = mongoose.model('User');
const Profile = mongoose.model('Profile');

let panel;
let user;
let topic;
let _topic;
let titleTooShort;
let titleTooLong;
let contentTooShort;
let contentTooLong;

describe('Topic Model Tests:', () => {
  before(done => {
    Topic.schema.path('title', {
      type: String,
      required: '{PATH} is required',
      minlength: 5,
      maxlength: 120,
    });
    Topic.schema.path('content', {
      type: String,
      unique: true,
      required: '{PATH} is required',
      minlength: 10,
      maxlength: 10000,
    });
    topic = {
      title: 'Topic 1',
      content: 'c'.repeat(100),
    };
    titleTooShort = {
      title: 'T',
      content: 'c'.repeat(100),
    };
    titleTooLong = {
      title: 'T'.repeat(121),
      content: 'c'.repeat(100),
    };
    contentTooShort = {
      title: 'Topic 1',
      content: 'content',
    };
    contentTooLong = {
      title: 'Topic 1',
      content: 'c'.repeat(10001),
    };
    done();
  });
  describe('Testing create a topic', () => {
    it('should has no topic', done => {
      Topic.find().then(topics => {
        expect(topics).to.be.empty();
        done();
      });
    });
    it('should allow create topic when title and content are within limits', done => {
      Topic.create(topic).then(topic => {
        topic.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create topic when title is too short', done => {
      Topic.create(titleTooShort).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create topic when title is too long', done => {
      Topic.create(titleTooLong).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create topic when content is too short', done => {
      Topic.create(contentTooShort).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create topic when content is too long', done => {
      Topic.create(contentTooLong).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow create two different topics with different title and content', done => {
      let topic2 = Object.assign({}, topic);
      topic2.title = 'Topic 2';
      topic2.content = 't'.repeat(100);
      Topic.create(topic).then(t1 => {
        Topic.create(topic2).then(t2 => {
          t2.remove().then(() => {
            t1.remove().then(done()).catch(err => {
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
    it('should allow create two different topics with same title but different content', done => {
      let topic2 = Object.assign({}, topic);
      topic2.content = 't'.repeat(100);
      Topic.create(topic).then(t1 => {
        Topic.create(topic2).then(t2 => {
          t2.remove().then(() => {
            t1.remove().then(done()).catch(err => {
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
    it('should not allow create topics that has same content', done => {
      Topic.create(topic).then(t1 => {
        Topic.create(topic).catch(err => {
          expect(err).not.to.be.empty();
          t1.remove().then(done());
        });
      });
    });
    it('should not allow create topic without title', done => {
      let topic2 = Object.assign({}, topic);
      topic2.title = '';
      Topic.create(topic2).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should not allow create topic without content', done => {
      let topic2 = Object.assign({}, topic);
      topic2.content = '';
      Topic.create(topic2).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
  });
  describe('Tesing topic modification', () => {
    before(done => {
      Panel.create({ name: 'Panel 1' }).then(p => {
        panel = p;
      });
      Profile.create({ username: 'test user' }).then(p => {
        User.create({ email: 'test@test.com', profile: p }).then(u => {
          user = u;
          done();
        });
      });
    });
    beforeEach(done => {
      Topic.create(topic).then(topic => {
        _topic = topic;
        done();
      });
    });
    afterEach(done => {
      Topic.remove().then(done());
    });
    after(done => {
      Panel.remove().then(User.remove().then(Profile.remove().then(done())));
    });
    it('should allow modify a topic title', done => {
      _topic.title = 'Topic 234';
      _topic.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow persist information on update', done => {
      _topic.updated.by = user.profile.username;
      _topic.updated.date = new Date();
      _topic.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow modify a topic content', done => {
      _topic.content = 'T'.repeat(233);
      _topic.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow add a comment', done => {
      Comment.create({ content: 'c'.repeat(100) }).then(comment => {
        _topic.comments.push(comment);
        _topic.save().then(() => {
          comment.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should allow persist last reply information', done => {
      Comment.create({ content: 'c'.repeat(100) }).then(comment => {
        _topic.lastReplies.push(comment);
        _topic.lastReplyDate = comment.date;
        _topic.save().then(() => {
          comment.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should allow assign topic to a author', done => {
      _topic.author = user;
      _topic.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow assign topic to a panel', done => {
      _topic.panel = panel;
      _topic.save().then(done()).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing Topic#view', () => {
    it('should increment view number by 1', done => {
      Topic.create(topic).then(topic => {
        topic.view().then(topic => {
          expect(topic.views).to.be(1);
          topic.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
  describe('Testing Topic#reply', () => {
    it('should increment reply number by 1', done => {
      Topic.create(topic).then(topic => {
        topic.reply().then(topic => {
          expect(topic.replies).to.be(1);
          topic.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
  describe('Tesing Topic#like', () => {
    it('should allow like a topic', done => {
      let uid = '98237987628340923';
      Topic.create(topic).then(topic => {
        topic.like(uid).then(topic => {
          expect(topic.likes).to.have.length(1);
          expect(topic.likes[0]).to.be(uid);
          topic.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
  describe('Tesing Topic#unlike', () => {
    it('should allow un-like a topic', done => {
      let uid = '98237987628340923';
      Topic.create(topic).then(topic => {
        topic.like(uid).then(topic => {
          expect(topic.likes).to.have.length(1);
          expect(topic.likes[0]).to.be(uid);
          topic.unlike(uid).then(topic => {
            expect(topic.likes).to.have.length(0);
            topic.remove().then(done());
          });
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
  describe('Tesing Topic#bookmark', () => {
    it('should allow bookmark a topic', done => {
      let uid = '98237987628340923';
      Topic.create(topic).then(topic => {
        topic.bookmark(uid).then(topic => {
          expect(topic.bookmarks).to.have.length(1);
          expect(topic.bookmarks[0]).to.be(uid);
          topic.remove().then(done());
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
  describe('Tesing Topic#unbookmark', () => {
    it('should allow un-bookmark a topic', done => {
      let uid = '98237987628340923';
      Topic.create(topic).then(topic => {
        topic.bookmark(uid).then(topic => {
          expect(topic.bookmarks).to.have.length(1);
          expect(topic.bookmarks[0]).to.be(uid);
          topic.unbookmark(uid).then(topic => {
            expect(topic.bookmarks).to.have.length(0);
            topic.remove().then(done());
          });
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
  });
});
