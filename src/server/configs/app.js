'use strict';

import express from 'express';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import path from 'path';
import csrf from 'csurf';
import passport from 'passport';
import compression from 'compression';
import validator from 'express-validator';
import jwt from 'express-jwt';

import statics from './statics';
import _passport from './passport';
import routes from './routes';
import error from './error';
import multer from './multer';
import utils from './utils';

/**
 * Create and init a new express application
 *
 * @author C Killua
 * @module Konko/Server/Configurations/App
 * @param {string} dirname The current working directory of caller
 * @returns {Object} An express app
 */
export default dirname => {
  // new express app
  const app = express();

  // define working directories
  app.cwd = dirname;
  app.pwd = path.resolve(dirname, '..', '..');

  // configurations constant
  const CLIENT = require(path.join(app.pwd, 'configurations', 'client'));
  const SERVER = require(path.join(app.pwd, 'configurations', 'server'));
  const SECRETS = require(path.join(app.pwd, 'configurations', 'secrets'));
  const STATICS = require(path.join(app.pwd, 'configurations', 'statics'));

  // express/app setup
  app.use(favicon(path.join(STATICS.shared.root, 'favicon.ico')));
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  utils.validCookieSecret(SECRETS.cookieSecret, true);
  app.use(cookieParser(SECRETS.cookieSecret));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(validator());
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use(compression({
    filter: (req, res) => {
      return /json|text|xml|javascript|css|font|svg/.test(res.getHeader('Content-Type'));
    },

    level: 9,
  }));
  app.enable('trust proxy');

  // setup static directories
  statics(app, STATICS, CLIENT);

  // view engine setup
  app.set('views', path.join(app.pwd, STATICS.shared.root));
  app.set('view engine', 'jade');

  // multer
  app.multer = multer;

  // JWT
  utils.validJwtSecret(SECRETS.jwtSecret, true);
  app.set('secret', SECRETS.jwtSecret);

  // passport setup
  _passport();

  // CSRF
  app.use(csrf({ cookie: true }));
  app.use((req, res, next) => {
    res.cookie('csrfToken', req.csrfToken());
    return next();
  });

  // declare content language
  app.use(utils.setLanguage);

  // check site publicity
  app.use(jwt({
    secret: app.get('secret'),
    credentialsRequired: false,
    userProperty: 'payload',
  }), utils.public);

  // set routes
  app.use(utils.quering);
  routes(app, SERVER);

  // error handler
  error(app);

  return app;
};
