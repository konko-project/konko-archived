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
   *
   * @param {String} server - directory where the server file is located.
   */
  constructor(server) {
    this.server = server;
    this.loadModels();
    this.info = {};

    mongoose.Promise = global.Promise;
  }

  /**
   * Glob and require all data models's path with given path pattern.
   *
   */
  loadModels() {
    let env = process.env.NODE_ENV;
    this.server.models.forEach(pattern => {
      let root = env === 'production'   ? this.server.dist.paths.root :
                 env === 'development'  ? this.server.build.paths.root :
                 env === 'test'         ? this.server.build.paths.root : '';
      glob.sync(path.join(root, pattern)).forEach(path => {
        require(path.replace(root, '..').replace('.js', ''));
      });
    });
  }

  /**
   * Make connection to MongoDB via mongoose based on current express
   * environment.
   *
   * @param {String} env - Node environment
   * @returns {Promise} connection information
   */
  connect(env) {
    let uri = process.env.MONGODB_URI ? process.env.MONGODB_URI :
              env === 'production'    ? URI_PROD :
              env === 'development'   ? URI_DEV :
              env === 'test'          ? URL_TEST : '';

    return new Promise((resolve, reject) => {
      let database = mongoose.connect(uri, { useMongoClient: true }).then(conn => {
        let admin = new mongoose.mongo.Admin(mongoose.connection.db);
        admin.buildInfo((err, info) => {
          this.info = {
            name: conn.name,
            host: conn.host,
            port: conn.port,
            admin: conn.user,
            version: info.version,
          };
          resolve(this.info);
        });
      }).catch(error => {
        console.error('Error when connecting to MongoDB...');
        console.error(error);
        reject(error);
      });
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
 * Callback that handles error from database disconnection.
 *
 * @callback Database~errorCallback
 * @param error - Error when disconnecting from database.
 */
