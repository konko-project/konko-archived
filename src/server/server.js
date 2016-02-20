'use strict';

import app from './configs/app';
import debug from 'debug';
import http from 'http';

const APP = app(__dirname);
const DEBUG = debug('konko:server');

/**
 * Normalize a port into a number, string, or false.
 *
 * @param val - A port could a number or string.
 * @returns {Number|String|Boolean} Normalized port.
 */
const normalizePort = val => {
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
};

/**
 * Set express server port
 */
let port = normalizePort(process.env.PORT || '3000');
APP.set('port', port);

/**
 * Start express server
 */
let server = http.createServer(APP).listen(port, () => {
  console.log('Express server listening on port ' + port);
  console.log('Environment:\t' + APP.get('env'));
});

/**
 * Event listener for HTTP server "listening" event.
 *
 */
const onListening = () => {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
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

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

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

server.on('error', onError);
server.on('listening', onListening);
