'use strict';

import expect from 'expect.js';
import mongoose from 'mongoose';
const Core = mongoose.model('Core');

let c1;
let c2;
let core;

describe('Core Model Test:', () => {
  before(() => {
    c1 = { basic: { title: 'test core one' } };
    c2 = { basic: { title: '' } };
  });

  describe('Testing create a Core', () => {
    it('should contain no Core', done => {
      Core.find().then(cores => {
        expect(cores).to.be.empty();
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow create core with basic.title', done => {
      Core.create(c1).then(c => {
        expect(c.basic.title).to.be(c1.basic.title);
        c.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow create core without basic.title', done => {
      Core.create(c2).then(c => {
        expect(c).to.be.empty();
        done();
      }).catch(err => {
        expect(err).not.to.be.empty();
        Core.remove().then(done()).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      });
    });
    it('should not allow create cores with same basic.title', done => {
      Core.create(c1).then(c => {
        Core.create(c1).then(c => {
          expect(c).to.be.empty();
          done();
        }).catch(err => {
          expect(err).not.to.be.empty();
          Core.remove().then(done()).catch(err => {
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
  describe('Testing core modification - Basic', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow update title with new title', done => {
      core.basic.title = 'new title';
      core.save().then(c => {
        expect(c.basic.title).to.be('new title');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow update title with empty title', done => {
      core.basic.title = '';
      core.save().then(c => {
        expect(c).to.be.empty();
        done();
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow update other fields with new data', done => {
      core.basic.description = 'new description';
      core.basic.keywords = 'new keywords';
      core.basic.logo = 'new logo';
      core.basic.public = false;
      core.save().then(c => {
        expect(c.basic.title).to.be(c1.basic.title);
        expect(c.basic.description).to.be('new description');
        expect(c.basic.keywords).to.be('new keywords');
        expect(c.basic.logo).to.be('new logo');
        expect(c.basic.public).to.be(false);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow update other fields with empty data', done => {
      core.basic.description = '';
      core.basic.keywords = '';
      core.basic.logo = '';
      core.save().then(c => {
        expect(c.basic.title).to.be(c1.basic.title);
        expect(c.basic.description).to.be('');
        expect(c.basic.keywords).to.be('');
        expect(c.basic.logo).to.be('');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing core modification - Admin', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow update email with new email', done => {
      core.admin.email = 'test@test.com';
      core.save().then(c => {
        expect(c.admin.email).to.be('test@test.com');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing core modification - Global', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow update language with new data', done => {
      core.global.language = 'zh-cn';
      core.save().then(c => {
        expect(c.global.language).to.be('zh-cn');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow add new nav to navbar with data', done => {
      core.global.navbar.navs.push({
        name: 'nav',
        url: 'url',
        order: 233,
      });
      core.save().then(({ global: { navbar: { navs: [nav, ...rest] } } }) => {
        expect(nav.name).to.be('nav');
        expect(nav.url).to.be('url');
        expect(nav.order).to.be(233);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow add new nav to navbar without data', done => {
      core.global.navbar.navs.push({
        name: '',
        url: '',
        order: 233,
      });
      core.save().then(c => {
        expect(c).to.be.empty();
        done();
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow add new style with data', done => {
      core.global.styles.push({
        name: 'style',
        root: 'root',
      });
      core.save().then(({ global: { styles: [style, ...rest] } }) => {
        expect(style.name).to.be('style');
        expect(style.root).to.be('root');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow add new nav to navbar without data', done => {
      core.global.styles.push({
        name: '',
        root: '',
      });
      core.save().then(c => {
        expect(c).to.be.empty();
        done();
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
  });
  describe('Testing core modification - mailer', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow change method to SENDMAIL', done => {
      core.mailer.method = 'sendmail';
      core.save().then(c => {
        expect(c.mailer.method).to.be('sendmail');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow change method to SMTP', done => {
      core.mailer.method = 'smtp';
      core.save().then(c => {
        expect(c.mailer.method).to.be('smtp');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow change method to SES', done => {
      core.mailer.method = 'ses';
      core.save().then(c => {
        expect(c.mailer.method).to.be('ses');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should not allow change method to something other than SENDMAIL, SMTP and SES', done => {
      core.mailer.method = 'something';
      core.save().then(c => {
        expect(c).to.be.empty();
        done();
      }).catch(err => {
        expect(err).not.to.be.empty();
        done();
      });
    });
    it('should allow update other fields with new data', done => {
      core.mailer.from = 'from';
      core.mailer.host = 'host';
      core.mailer.secure = false;
      core.mailer.port = 233;
      core.mailer.user = 'user';
      core.mailer.password = 'password';
      core.mailer.ses_keyId ='ses_keyId';
      core.mailer.ses_secret ='ses_secret';
      core.save().then(({ mailer }) => {
        expect(mailer.method).to.be('sendmail');
        expect(mailer.from).to.be('from');
        expect(mailer.host).to.be('host');
        expect(mailer.secure).to.be(false);
        expect(mailer.port).to.be(233);
        expect(mailer.user).to.be('user');
        expect(mailer.password).to.be('password');
        expect(mailer.ses_keyId).to.be('ses_keyId');
        expect(mailer.ses_secret).to.be('ses_secret');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow update other fields with empty data', done => {
      core.mailer.from = '';
      core.mailer.host = '';
      core.mailer.user = '';
      core.mailer.password = '';
      core.mailer.ses_keyId ='';
      core.mailer.ses_secret ='';
      core.save().then(({ mailer }) => {
        expect(mailer.method).to.be('sendmail');
        expect(mailer.from).to.be('');
        expect(mailer.host).to.be('');
        expect(mailer.user).to.be('');
        expect(mailer.password).to.be('');
        expect(mailer.ses_keyId).to.be('');
        expect(mailer.ses_secret).to.be('');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing core modification - Registration', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow update fields with new data', done => {
      core.registration = {
        public: false,
        message: 'message',
        email: {
          verification: false,
          verificationSubject: 'subject',
          ttl: 233,
          welcome: false,
          welcomeMessage: 'welcomeMessage',
        },
        password: {
          resetEmailSubject: 'reset',
          regex: 'regex',
          title: 'title',
          min: 0,
          max: 233,
          capital: false,
          lower: false,
          digit: false,
          special: false,
        },
        blacklist: [],
      };
      core.save().then(({ registration, registration: { email, password } }) => {
        registration.public.to.be(false);
        registration.message.to.be('message');
        email.verification.to.be(false);
        email.verificationSubject.to.be('subject');
        email.ttl.to.be(233);
        email.welcome.to.be(false);
        email.welcomeMessage.to.be('welcomeMessage');
        password.resetEmailSubject.to.be('reset');
        password.regex.to.be('regex');
        password.title.to.be('title');
        password.min.to.be(0);
        password.max.to.be(233);
        password.capital.to.be(false);
        password.lower.to.be(false);
        password.digit.to.be(false);
        password.special.to.be(false);
        registration.blacklist.to.be.empty();
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow add new string to blacklist', done => {
      core.registration.blacklist.push('blacklist');
      core.save().then(({ registration: { blacklist: [string, ...rest] } }) => {
        expect(string).to.be('blacklist');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing core modification - Profile', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow update fields with new data', done => {
      core.profile = {
        username: {
          min: 0,
          max: 233,
          forbidden: [],
        },
        avatar: {
          upload: false,
          limit: 2333,
        },
        banner: {
          upload: false,
          limit: 2333,
        },
        tagline: {
          min: 1,
          max: 233,
        },
      };
      core.save().then(({ profile: { username, avatar, banner, tagline } }) => {
        expect(username.min).to.be(0);
        expect(username.max).to.be(233);
        expect(username.forbidden).to.be.empty();
        expect(avatar.upload).to.be(false);
        expect(avatar.limit).to.be(2333);
        expect(banner.upload).to.be(false);
        expect(banner.limit).to.be(2333);
        expect(tagline.min).to.be(1);
        expect(tagline.max).to.be(233);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow add new string to username.forbidden', done => {
      core.profile.username.forbidden.push('forbidden');
      core.save().then(({ profile: { username: { forbidden: [string, ...rest] } } }) => {
        expect(string).to.be('forbidden');
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing core modification - Panel', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow update fields with new data', done => {
      core.panel = {
        panel: {
          name: {
            min: 0,
            max: 233,
          },
          description: {
            min: 1,
            max: 233,
          },
        },
        category: {
          name: {
            min: 0,
            max: 233,
          },
        },
      };
      core.save().then(({ panel: { panel, category } }) => {
        expect(panel.name.min).to.be(0);
        expect(panel.name.max).to.be(233);
        expect(panel.description.min).to.be(1);
        expect(panel.description.max).to.be(233);
        expect(category.name.min).to.be(0);
        expect(category.name.max).to.be(233);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing core modification - Post', () => {
    beforeEach(done => {
      Core.create(c1).then(c => {
        core = c;
        done();
      });
    });
    afterEach(done => {
      Core.remove().then(done());
    });
    it('should allow update fields with new data', done => {
      core.post = {
        topic: {
          title: {
            min: 0,
            max: 233,
          },
          content: {
            min: 0,
            max: 233,
          },
          lastReplyLength: 0,
        },
        comment: {
          content: {
            min: 0,
            max: 23333,
          },
          short: {
            max: 233,
          },
        },
      };
      core.save().then(({ post: { topic, comment } }) => {
        expect(topic.title.min).to.be(0);
        expect(topic.title.max).to.be(233);
        expect(topic.content.min).to.be(0);
        expect(topic.content.max).to.be(233);
        expect(topic.lastReplyLength).to.be(0);
        expect(comment.content.min).to.be(0);
        expect(comment.content.max).to.be(23333);
        expect(comment.short.max).to.be(233);
        done();
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
});
