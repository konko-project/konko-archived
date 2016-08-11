'use strict';

import path from 'path';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import expect from 'expect.js';
import mongoose from 'mongoose';
const Core  = mongoose.model('Core');
const User  = mongoose.model('User');
const Profile = mongoose.model('Profile');
const Preference = mongoose.model('Preference');
const VerificationToken = mongoose.model('VerificationToken');
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;

let _app;
let agent;
let header;

describe('Authentication CRUD Test:', () => {
  before(done => {
    Core.create({ basic: { title: 'Test' } });
    _app = app(path.resolve(SERVER.build.paths.root));
    agent = request.agent(_app);
    agent.get('/').end((err, res) => {
      let csrfToken = /csrfToken=(.*?)(?=\;)/.exec(res.header['set-cookie'].join(''))[1];
      header = {
        'x-csrf-token': csrfToken,
      };
      done();
    });
  });
  after(done => {
    VerificationToken.remove().then(Core.remove().then(Preference.remove().then(Profile.remove().then(User.remove().then(done())))));
  });
  describe('Testing POST', () => {
    it('should allow to register a new user', done => {
      agent.post('/api/v1/auth/register')
        .set(header)
        .send({ email: 'test@konko.test', password: '12345abcDEF!@$' })
        .expect(201)
        .end(done);
    });
    it('should response 400 when email is empty', done => {
      agent.post('/api/v1/auth/register')
        .set(header)
        .send({ email: '', password: '12345abcDEF!@$' })
        .expect(400, done);
    });
    it('should response 400 when password is empty', done => {
      agent.post('/api/v1/auth/register')
        .set(header)
        .send({ email: 'test@konko2.test', password: '' })
        .expect(400, done);
    });
    it('should response 400 when password does not match requirement', done => {
      agent.post('/api/v1/auth/register')
        .set(header)
        .send({ email: 'test@konko2.test', password: '12345' })
        .expect(400, done);
    });
    it('should allow to register an user with same username but different email', done => {
      agent.post('/api/v1/auth/register')
        .set(header)
        .send({ email: 'test@konko3.test', password: '12345abcDEF!@$' })
        .expect(201)
        .end(done);
    });
    it('should allow an user to login', done => {
      agent.post('/api/v1/auth/login')
        .set(header)
        .send({ email: 'test@konko.test', password: '12345abcDEF!@$' })
        .expect(200, done);
    });
    it('should response 400 when email is empty', done => {
      agent.post('/api/v1/auth/login')
        .set(header)
        .send({ email: '', password: '12345abcDEF!@$' })
        .expect(400, done);
    });
    it('should response 400 when password is empty', done => {
      agent.post('/api/v1/auth/login')
        .set(header)
        .send({ email: 'test@konko.test', password: '' })
        .expect(400, done);
    });
    it('should response 401 when password is incorrect', done => {
      agent.post('/api/v1/auth/login')
        .set(header)
        .send({ email: 'test@konko.test', password: '123' })
        .expect(401, done);
    });
    it('should response 401 when account not exist', done => {
      agent.post('/api/v1/auth/login')
        .set(header)
        .send({ email: 'test@konko2.test', password: '12345abcDEF!@$' })
        .expect(401)
        .end(done);
    });

    const reset = (user, done) => {
      agent.post('/api/v1/auth/reset')
        .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
        .send({ email: user.email })
        .expect(201).end((err, res) => {
          if (err) {
            return done(err);
          }
          VerificationToken.find(user).then(v => {
            agent.post('/api/v1/auth/reset')
              .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
              .send({ code: v.token })
              .expect(200).end((err, res) => {
                if (err) {
                  return done(err);
                }
                agent.post('/api/v1/auth/reset')
                  .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
                  .send({ pass: '!@$54321ABCdef', pass2: '!@$54321ABCdef' })
                  .expect(200, done);
              });
          }).catch(err => {
            expect(err).to.be.empty();
            return done();
          });
        });
    };
    it('should response 401 when JWT is missing in header when reset password', done => {
      agent.post('/api/v1/auth/reset')
        .set(header)
        .send({}).expect(401, done);
    });
    it('should allow Admin to reset password', done => {
      User.create({ email: 'admin@test.com', permission: 'admin' }).then(admin => {
        admin.setPassword('adminpassword').then(admin => {
          reset(admin, done);
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow User to reset password', done => {
      User.create({ email: 'user@test.com', permission: 'user' }).then(user => {
        reset(user, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should allow Banned User to reset password', done => {
      User.create({ email: 'banned@test.com', permission: 'banned' }).then(banned => {
        reset(banned, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 401 when Guest try to reset password', done => {
      User.create({ email: 'guest@test.com', permission: 'guest' }).then(guest => {
        agent.post('/api/v1/auth/reset')
          .set(header).set('Authorization', `Bearer ${guest.generateJWT(_app)}`)
          .send({}).expect(401, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 400 when email not provided', done => {
      User.create({ email: 'no-email@test.com', permission: 'user' }).then(user => {
        agent.post('/api/v1/auth/reset')
          .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
          .send({}).expect(404, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 404 when reset password for User that not exist', done => {
      User.create({ email: 'no-exist@test.com', permission: 'user' }).then(user => {
        agent.post('/api/v1/auth/reset')
          .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
          .send({ email: 'no-one@test.com' }).expect(404, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 404 when verification token is not found', done => {
      User.create({ email: 'not-found@test.com', permission: 'user' }).then(user => {
        agent.post('/api/v1/auth/reset')
          .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
          .send({ code: '123456789' }).expect(404, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 401 when verification token is not matched with requested email', done => {
      User.create({ email: 'wrong-token@test.com', permission: 'user' }).then(user => {
        VerificationToken.create({ user: user }).then(v => {
          agent.post('/api/v1/auth/reset')
            .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
            .send({ code: v.token, email: 'wrong-email@test.com' })
            .expect(401, done);
        }).catch(err => {
          expect(err).to.be.empty();
          done();
        });
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 400 when passwords not match', done => {
      User.create({ email: 'not-match@test.com', permission: 'user' }).then(user => {
        agent.post('/api/v1/auth/reset')
          .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
          .send({ email: 'not-match@test.com', pass: '123456', pass2: '654321' })
          .expect(400, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 401 when JWT is missing when confirming Admin', done => {
      agent.post('/api/v1/auth/confirm').set(header).send({}).expect(401, done);
    });
    it('should allow Admin to confirm its identity', done => {
      User.find({ email: 'admin@test.com' }).then(admin => {
        agent.post('/api/v1/auth/confirm')
          .set(header).set('Authorization', `Bearer ${admin.generateJWT(_app)}`)
          .send({ adminPass: 'adminpassword' }).expect(200, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 401 when User try to verify Admin identity', done => {
      User.find({ email: 'user@test.com' }).then(user => {
        agent.post('/api/v1/auth/confirm')
          .set(header).set('Authorization', `Bearer ${user.generateJWT(_app)}`)
          .send({ adminPass: 'adminpassword' }).expect(200, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 401 when Banned User try to verify Admin identity', done => {
      User.find({ email: 'banned@test.com' }).then(banned => {
        agent.post('/api/v1/auth/confirm')
          .set(header).set('Authorization', `Bearer ${banned.generateJWT(_app)}`)
          .send({ adminPass: 'adminpassword' }).expect(200, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 401 when Guest try to verify Admin identity', done => {
      User.find({ email: 'guest@test.com' }).then(guest => {
        agent.post('/api/v1/auth/confirm')
          .set(header).set('Authorization', `Bearer ${guest.generateJWT(_app)}`)
          .send({ adminPass: 'adminpassword' }).expect(200, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
    it('should response 401 when fail to verified Admin identity', done => {
      User.find({ email: 'admin@test.com' }).then(admin => {
        agent.post('/api/v1/auth/confirm')
          .set(header).set('Authorization', `Bearer ${admin.generateJWT(_app)}`)
          .send({ adminPass: 'wrondpassword' }).expect(401, done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
  describe('Testing GET', () => {
    it('should response back a Guest account when logout', done => {
      agent.get('/api/v1/auth/logout')
        .expect(200)
        .expect(({ res: { body: { token } } }) => {
          let { email, verified, permission } = jwt.decode(token);
          expect(verified).to.be(false);
          expect(permission).to.be('guest');
        }).end(done);
    });
    it('should response 401 when JWT is missing when sync', done => {
      agent.get('/api/v1/auth/sync').expect(401, done);
    });
    it('should response back current user\'s JWT when sync', done => {
      User.find({ email: 'admin@test.com' }).then(admin => {
        agent.get('/api/v1/auth/sync')
          .set('Authorization', `Bearer ${admin.generateJWT(_app)}`)
          .expect(200)
          .expect(({ res: { body: { token } } }) => {
            expect(token).to.be(admin.generateJWT(_app));
          }).end(done);
      }).catch(err => {
        expect(err).to.be.empty();
        done();
      });
    });
  });
});
