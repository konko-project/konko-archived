/*jshint expr: true*/
'use strict';

import path from 'path';
import expect from 'expect.js';
import request from 'supertest';

const SECRETS = require(path.resolve('./configurations/secrets'));
const SERVER = require(path.resolve('./configurations/server'));
const app = require(path.resolve(SERVER.build.paths.root, 'configs/app')).default;
const utils = require(path.resolve(SERVER.build.paths.root, 'configs/utils')).default;

describe('Server Configuration Tests:', () => {
  let _app;
  let agent;
  before(done => {
    _app = app(path.resolve(SERVER.build.paths.root));
    agent = request(_app);
    done();
  });
  describe('Testing cookie secrets configuration', () => {
    it('should warn if using default cookie secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validCookieSecret(SECRETS.cookieSecret, false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should warn if using empty cookie secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validCookieSecret('', false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should warn if using null cookie secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validCookieSecret(null, false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should warn if using undefined cookie secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validCookieSecret(undefined, false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if using custom cookie secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validCookieSecret('mocha secret', false)).to.be.true;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if using default cookie secret in development mode.', () => {
      process.env.NODE_ENV = 'development';
      expect(utils.validCookieSecret(SECRETS.cookieSecret, false)).to.be.true;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if using default cookie secret in test mode.', () => {
      expect(utils.validCookieSecret(SECRETS.cookieSecret, false)).to.be.true;
    });
  });

  describe('Testing JWT secrets configuration', () => {
    it('should warn if using default jwt secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validJwtSecret(SECRETS.jwtSecret, false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should warn if using empty jwt secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validJwtSecret('', false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should warn if using null jwt secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validJwtSecret(null, false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should warn if using undefined jwt secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validJwtSecret(undefined, false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if using custom jwt secret in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.validJwtSecret('mocha secret', false)).to.be.true;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if using default jwt secret in development mode.', () => {
      process.env.NODE_ENV = 'development';
      expect(utils.validJwtSecret(SECRETS.jwtSecret, false)).to.be.true;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if using default jwt secret in test mode.', () => {
      expect(utils.validJwtSecret(SECRETS.jwtSecret, false)).to.be.true;
    });
  });

  describe('Testing Express-Mailer configuration', () => {
    it('should warn if Express-Mailer config file is missing in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.hasExpressMailerConfiguration(path.join(SERVER.dist.paths.root, 'configs', '*.js'), false)).to.be.false;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if Express-Mailer config file is missing in development mode.', () => {
      process.env.NODE_ENV = 'development';
      expect(utils.hasExpressMailerConfiguration(path.join(SERVER.build.paths.root, 'configs', '*.js'), false)).to.be.true;
      process.env.NODE_ENV = 'test';
    });
    it('should not warn if Express-Mailer config file is missing in test mode.', () => {
      expect(utils.hasExpressMailerConfiguration(path.join(SERVER.build.paths.root, 'configs', '*.js'), false)).to.be.true;
    });
    it('should not warn if Express-Mailer config file exists in production mode.', () => {
      process.env.NODE_ENV = 'production';
      expect(utils.hasExpressMailerConfiguration(path.join(SERVER.build.paths.root, 'configs', '*.js'), false)).to.be.true;
      process.env.NODE_ENV = 'test';
    });
  });

  describe('Testing CSRF configuration', () => {
    it('should return CSRF in cookies', done => {
      agent.get('/')
        .expect(res => {
          let headers = res.header['set-cookie'].join('');
          expect(headers).to.match(/\_csrf/);
          expect(headers).to.match(/csrfToken/);
        })
        .end(done);
    });
    it('should return 200 when CSRF is not set in header on GET', done => {
      agent.get('/').expect(200, done);
    });
    it('should return 403 when CSRF is not set in header on POST', done => {
      agent.post('/').expect(403, done);
    });
    it('should return 403 when CSRF is not set in header on PUT', done => {
      agent.put('/').expect(403, done);
    });
    it('should return 403 when CSRF is not set in header on DELETE', done => {
      agent.del('/').expect(403, done);
    });
  });
});
