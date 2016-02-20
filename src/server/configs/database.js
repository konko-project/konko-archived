'use strict';

import mongoose from 'mongoose';
import glob from 'glob';
import path from 'path';

const uri_pord = 'mongodb://localhost/konko';
const uri_dev = 'mongodb://localhost/konko-dev';
const uri_test = 'mongodb://localhost/konko-test';

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
  constructor() {

  }

  /**
   * Glob and require all data models's path with given path pattern.
   *
   * @param {Object} server - Module that contains server side paths.
   * @param {Database~optionalCallback} callback - An optional callback.
   * @static
   */
  static loadModels(server, callback) {
    server.models.forEach(pattern => {
      glob.sync(path.join(server.paths.dist, pattern)).forEach(path => {
        require(path.replace(server.paths.dist, '..').replace('.js', ''));
      });
    });
    if (callback) {
        callback();
    }
  }

  /**
   * Make connection to MongoDB via mongoose based on current express environment.
   *
   * @param {Object} app - An express application.
   * @param {Database~databaseCallback} callback - A callback that handles a connected database.
   * @static
   */
  static connect(app, callback) {
    let env = app.get('env');
    let uri = env === 'production' ? uri_pord :
              env === 'development' ? uri_dev :
              env === 'test' ? uri_test : '';

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
