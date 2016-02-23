'use strict';

import mongoose from 'mongoose';
import glob from 'glob';
import path from 'path';

const URI_PROD = 'mongodb://localhost/konko';
const URI_DEV = 'mongodb://localhost/konko-dev';
const URL_TEST = 'mongodb://localhost/konko-test';

/**
 * A class that handling mongoose
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Database
 */
export default class Database {

  /**
   * @constructs
   */
  constructor() {}

  /**
   * Glob and require all data models's path with given path pattern.
   *
   * @param {Object} server - Module that contains server side paths.
   * @param {Database~optionalCallback} callback - An optional callback.
   * @static
   */
  static loadModels(server, callback) {
    let env = process.env.NODE_ENV;
    server.models.forEach(pattern => {
      let root = env === 'production' ? server.dist.paths.root :
                 env === 'development' ? server.build.paths.root :
                 env === 'test' ? server.build.paths.root : '';
      glob.sync(path.join(root, pattern)).forEach(path => {
        require(path.replace(root, '..').replace('.js', ''));
      });
    });
    if (callback) {
      callback();
    }
  }

  /**
   * Make connection to MongoDB via mongoose based on current express
   * environment.
   *
   * @param {Database~databaseCallback} callback - A callback that handles a
   *        connected database.
   * @static
   */
  static connect(callback) {
    let env = process.env.NODE_ENV;
    let uri = env === 'production' ? URI_PROD :
              env === 'development' ? URI_DEV :
              env === 'test' ? URL_TEST : '';

    // connect to mongoDB
    let database = mongoose.connect(uri, err => {
      if (err) {
        console.error('Error when connecting to MongoDB...');
        console.log(err);
      } else {
        if (callback) {
          callback(database);
        }
      }
    });
  }

  /**
   * Disconnect from MongoDB via mongoose.
   *
   * @param {Database~errorCallback} callback - A callback that handles error.
   * @static
   */
  static disconnect(callback) {
    mongoose.disconnect(err => {
      console.info('Disconnected from MongoDB');
      callback(err);
    });
  }
}

/**
 * Optional callback to run if has one.
 *
 * @callback Database~optionalCallback
 */

/**
 * Callback that handles a connected database.
 *
 * @callback Database~databaseCallback
 * @param {Object} database - A connected database.
 */

/**
 * Callback that handles error from database disconnection.
 *
 * @callback Database~errorCallback
 * @param error - Error when disconnecting from database.
 */
