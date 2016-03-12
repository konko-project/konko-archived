'use strict';

import glob from 'glob';
import mongoose from 'mongoose';

/**
 * Konko server utilities.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Utilities
 */
export default class Utilities {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Helper to record X-Rate-Limit-* in production mode.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback} Call next middleware.
   */
  static throttle(req, res, next) {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }

    const RateLimit = mongoose.model('RateLimit');
    let ip = req.headers['x-forwarded-for'] ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.connection.socket.remoteAddress;
    console.log(req.ip, req.ips);
    console.log(req.connection.remoteAddress);
    console.log(ip);
    RateLimit.findOneAndUpdate({ ip: ip }, { $inc: { hits: 1 } }, { upsert: false })
      .exec().then(rateLimit => {
        if (!rateLimit) {
          RateLimit.create({ ip: ip }).then(rateLimit => {
            let reset = 10 * 60 * 1000 - (new Date().getTime() - rateLimit.expiresAt.getTime());
            res.set('X-Rate-Limit-Limit', 600);
            res.set('X-Rate-Limit-Remaining', 600 - rateLimit.hits);
            res.set('X-Rate-Limit-Reset', reset);
            req.rateLimit = rateLimit;
            return next();
          }).catch(err => {
            res.statusCode = 500;
            return next(err);
          });
        } else {
          let reset = 10 * 60 * 1000 - (new Date().getTime() - rateLimit.expiresAt.getTime());
          res.set('X-Rate-Limit-Limit', 600);
          res.set('X-Rate-Limit-Remaining', 600 - rateLimit.hits);
          res.set('X-Rate-Limit-Reset', reset);
          req.rateLimit = rateLimit;
          if (rateLimit.hits > 600) {
            return res.status(429).json({ message: 'Too Many Requests' });
          } else {
            return next();
          }
        }
      }).catch(err => {
        res.statusCode = 500;
        return next(err);
      });
  }

  /**
   * Helper to process quering string
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback} Call next middleware.
   */
  static quering(req, res, next) {
    req._fields = '';
    req._sort = {};
    if (req.query && req.query.sort) {
      for (let s of req.query.sort) {
        if (s.charAt(0) === '-') {
          req._sort[s.substr(1)] = -1;
        } else {
          req._sort[s] = 1;
        }
      }
    }
    if (req.query && req.query.fields) {
      req._fields = req.query.fields.replace(',', ' ');
    }
    return next();
  }

  /**
   * Validate a cookie secret if a default one, custom one, or null
   *
   * @param {String} secret - Cookie secret.
   * @param {Boolean} log - Indicates should log to console or not.
   * @returns {Boolean} true if cookie is valid, false otherwise.
   */
  static validCookieSecret(secret, log) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    } else if (secret === 'DEFAULTCOOKIE') {
      if (log) {
        console.log('* Default cookie secret is in used!');
        console.log('* It\'s recommended to modify your default cookie secret before running Konko in production mode.');
        console.log('* You can modify the cookie secret in configuration/secrets.js in the root directory of Konko.');
      }

      return false;
    } else if (!secret) {
      if (log) {
        console.log('* Cookie secret is empty or undefined!');
        console.log('* It\'s recommended to use cookie secret to run Konko in production mode.');
        console.log('* You can set cookie secret in configuration/secrets.js in the root directory of Konko using node module exports.');
        console.log('  - Please use \'cookieSecret\' as key.');
        console.log('  - Please refer to other configurations for constructing a node module.');
        console.log('  - Please set cookie secret to be something other than \'DEFAULTCOOKIE\'');
      }

      return false;
    } else {
      return true;
    }
  }

  /**
   * Validate a jwt secret if a default one, custom one, or null
   *
   * @param {String} secret - JWT secret.
   * @param {Boolean} log - Indicates should log to console or not.
   * @returns {Boolean} true if cookie is valid, false otherwise.
   */
  static validJwtSecret(secret, log) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    } else if (secret === 'DEFAULTJWT') {
      if (log) {
        console.log('* Default jwt secret is in used!');
        console.log('* It\'s recommended to modify your default JWT secret before running Konko in production mode.');
        console.log('* You can modify the cookie secret in configuration/secrets.js in the root directory of Konko.');
      }

      return false;
    } else if (!secret) {
      if (log) {
        console.error('* JWT secret is empty or undefined!');
        console.error('* JWT secret is required for Konko.');
        console.error('* Please set the jwt secret in configuration/secrets.js in the root directory of Konko using node module exports.');
        console.error('  - Please use \'jwtSecret\' as key.');
        console.error('  - Please refer to other configurations for constructing a node module.');
        console.error('  - Please set jwt secret to be something other than \'DEFAULTJWT\'');
      }

      return false;
    } else {
      return true;
    }
  }

  /**
   * Validate if exist a configuration for Express-Mailer.
   *
   * @param {String} path - Path where is the config file located.
   * @param {Boolean} log - Indicates should log to console or not.
   * @returns {Boolean} true if has a config file, false otherwise.
   */
  static hasExpressMailerConfiguration(path, log) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }

    glob.sync(path).forEach(file => {
      if (file.match(/mailer/gi)) {
        return true;
      }
    });
    if (log) {
      console.error('! Express-Mailer configuration is missing.');
      console.error('! Konko will be running without any email functionality.');
    }

    return false;
  }

  /**
   * Update an object with new value if has one.
   *
   * @param {Object} data - An object that stores the new values.
   * @param {Object} obj - The original object.
   * @param {Array} props - An array of object properties that need to be updated.
   */
  static partialUpdate(data, obj, ...props) {
    for (let prop of props) {
      if(data.hasOwnProperty(prop)) {
        obj[prop] = data[prop];
      }
    }
  }
}

/**
 * Callback that calls next middleware.
 *
 * @callback nextCallback
 * @param {Object} error - Error, if has any.
 */
