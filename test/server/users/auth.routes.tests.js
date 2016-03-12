'use strict';

import path from 'path';
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

let agent;
let header;

describe('Authentication CRUD Test:', () => {
  before(done => {
    Core.create({ basic: { title: 'Test' } });
    let _app = app(path.resolve(SERVER.build.paths.root));
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
    it('should allow to register a user with same username of email', done => {
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
  });
});
