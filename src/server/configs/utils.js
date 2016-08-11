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
   * Patch JSON with angular prefix to prevent JSON Vulnerability
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback} Call next middleware.
   * @static
   */
  static patchJSON(req, res, next) {
    const sjson = obj => {
      const prefix = ')]}\',\n';
      return res.send(prefix + JSON.stringify(obj));
    };
    res.sjson = process.env.NODE_ENV !== 'test' ? sjson : res.json;
    return next();
  }

  /**
   * Declare content language in header for every response
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback} Call next middleware.
   * @static
   */
  static setLanguage(req, res, next) {
    const Core = mongoose.model('Core');
    Core.findOne().then(core => {
      if (core) {
        res.set('Content-Language', core.global.language);
      } else {
        res.set('Content-Language', 'en-us');
      }
      return next();
    }).catch(err => next(err));
  }

  /**
   * Checks if the site is shut by Admin.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback} Call next middleware.
   * @static
   */
  static public(req, res, next) {
    if (process.env.NODE_ENV !== 'production') {
      return next();
    }
    if (!req.payload || req.payload.permission === 'admin' || req.url.match('/api/v1/core')) {
      return next();
    }
    const Core = mongoose.model('Core');
    Core.findOne().then(core => {
      if (core && !core.basic.public) {
        return res.status(503).sjson({ message: 'Site is down.' });
      }
      return next();
    }).catch(err => next(err));
  }

  /**
   * Helper to record X-Rate-Limit-* in production mode.
   *
   * @param {Object} req - HTTP request.
   * @param {Object} res - HTTP response.
   * @param {nextCallback} next - A callback to run.
   * @returns {nextCallback} Call next middleware.
   * @static
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
    // console.log(req.ip, req.ips);
    // console.log(req.connection.remoteAddress);
    // console.log(ip);
    RateLimit.findOneAndUpdate({ ip: ip }, { $inc: { hits: 1 } }, { upsert: false })
      .exec().then(rateLimit => {
        if (!rateLimit) {
          RateLimit.create({ ip: ip }).then(rateLimit => {
            let reset = 10 * 60 * 1000 - (new Date().getTime() - rateLimit.createdAt.getTime());
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
          let reset = 10 * 60 * 1000 - (new Date().getTime() - rateLimit.createdAt.getTime());
          res.set('X-Rate-Limit-Limit', 600);
          res.set('X-Rate-Limit-Remaining', 600 - rateLimit.hits);
          res.set('X-Rate-Limit-Reset', reset);
          req.rateLimit = rateLimit;
          if (rateLimit.hits > 600) {
            return res.status(429).sjson({ message: 'Too Many Requests' });
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
   * @static
   */
  static quering(req, res, next) {
    req._fields = '';
    req._sort = null;
    if (req.query && req.query.sort) {
      req._sort = {};
      for (let s of req.query.sort) {
        if (s.charAt(0) === '-') {
          req._sort[s.substr(1)] = -1;
        } else {
          req._sort[s] = 1;
        }
      }
    }
    if (req.query && req.query.fields) {
      req._fields = req.query.fields.split(',').join(' ');
    }
    return next();
  }

  /**
   * Validate a cookie secret if a default one, custom one, or null
   *
   * @param {String} secret - Cookie secret.
   * @param {Boolean} log - Indicates should log to console or not.
   * @returns {Boolean} true if cookie is valid, false otherwise.
   * @static
   */
  static validCookieSecret(secret, log) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    } else if (secret === 'DEFAULTCOOKIE') {
      if (log) {
        console.warn('* Default cookie secret is in used!');
        console.warn('* It\'s recommended to modify your default cookie secret before running Konko in production mode.');
        console.warn('* You can modify the cookie secret in configuration/secrets.js in the root directory of Konko.');
      }

      return false;
    } else if (!secret) {
      if (log) {
        console.warn('* Cookie secret is empty or undefined!');
        console.warn('* It\'s recommended to use cookie secret to run Konko in production mode.');
        console.warn('* You can set cookie secret in configuration/secrets.js in the root directory of Konko using node module exports.');
        console.warn('  - Please use \'cookieSecret\' as key.');
        console.warn('  - Please refer to other configurations for constructing a node module.');
        console.warn('  - Please set cookie secret to be something other than \'DEFAULTCOOKIE\'');
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
   * @static
   */
  static validJwtSecret(secret, log) {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    } else if (secret === 'DEFAULTJWT') {
      if (log) {
        console.warn('* Default jwt secret is in used!');
        console.warn('* It\'s recommended to modify your default JWT secret before running Konko in production mode.');
        console.warn('* You can modify the cookie secret in configuration/secrets.js in the root directory of Konko.');
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
   * Update an object with new value if has one.
   *
   * @param {Object} data - An object that stores the new values.
   * @param {Object} obj - The original object.
   * @param {Array} props - An array of object properties that need to be updated.
   * @static
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
