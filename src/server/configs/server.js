'use strict';

import app from './app';
import db from './database';
import debug from 'debug';
import http from 'http';
import path from 'path';

const DEBUG = debug('konko:server');
const SERVER = require(path.resolve('configurations/server'));

/**
 * Server configuration.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Server
 */
export default class Server {

  /**
   * @constructs
   *
   * @param {String} dirname - directory where the bootstrap file is located.
   */
  constructor(dirname) {
    this.database = new db(SERVER);
    this.port = this.normalizePort(process.env.PORT || '3000');
    this.app = app(dirname);
    this.app.set(this.port);
    this.server = {};
  }

  /**
   * Initialize database.
   *
   */
  initDB() {
    db.loadModels(SERVER);
    db.connect();
  }

  /**
   * Fire up the express server.
   *
   * @param {Server~Callback} cb - A callback to run.
   */
  start(cb) {
    const _this = this;
    this.database.connect(process.env.NODE_ENV).then(info => {
      this.server = http.createServer(this.app).listen(_this.port, () => {
        console.log('Express server listening on port ' + _this.port);
        console.log('Environment:\t' + _this.app.get('env'));
        console.log(`Databse name: ${info.name}`);
        console.log(`Databse host: ${info.host}`);
        console.log(`Databse port: ${info.port}`);
        console.log(`Databse admin: ${info.user}`);
        console.log(`Databse version: ${info.version}`);
        if (cb) {
          cb();
        }

        /**
         * Event listener for HTTP server "listening" event.
         *
         */
        const onListening = () => {
          let addr = this.server.address();
          let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
          DEBUG('Listening on ' + bind);
        };

        /**
         * Event listener for HTTP server "error" event.
         *
         * @param error - HTTP server error
         */
        const onError = error => {
          if (error.syscall !== 'listen') {
            throw error;
          }

          let bind = typeof port === 'string' ? 'Pipe ' + this.port : 'Port ' + this.port;

          // handle specific listen errors with friendly messages
          switch (error.code) {
            case 'EACCES':
              console.error(bind + ' requires elevated privileges');
              process.exit(1);
              break;
            case 'EADDRINUSE':
              console.error(bind + ' is already in use');
              process.exit(1);
              break;
            default:
              throw error;
          }
        };

        this.server.on('error', onError);
        this.server.on('listening', onListening);
      });
    });
  }

  /**
   * Normalize a port into a number, string, or false.
   *
   * @param val - A port could a number or string.
   * @returns {Number|String|Boolean} Normalized port.
   */
  normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }
}

/**
 * Callback that runs after express server is started.
 *
 * @callback Server~Callback
 */
