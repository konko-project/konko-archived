'use strict';

import glob from 'glob';

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
      obj[prop] = data[prop] || obj[prop];
    }
  }
}
