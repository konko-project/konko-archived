'use strict';

import glob from 'glob';
import path from 'path';

/**
 * Glob and require all routes.
 *
 * @author C Killua
 * @module Konko/Server/Configurations/Routes
 * @param {Object} app - Express app.
 * @param {Object} server - Object contains all server side path/files.
 */
export default (app, server) => {
  server.routes.forEach(pattern => {
    glob.sync(path.join(server.paths.dist, pattern)).forEach(path => {
      require(path.replace(server.paths.dist, '..').replace('.js', '')).default(app);
    });
  });
};
