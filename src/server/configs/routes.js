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
  let env = app.get('env');
  let index = '';
  server.routes.forEach(pattern => {
    let root = env === 'production' ? server.dist.paths.root :
               env === 'development' ? server.build.paths.root :
               env === 'test' ? server.build.paths.root : '';
    glob.sync(path.join(root, pattern)).forEach(path => {
      if (path.match(/index/gi)) {
        index = path.match(/index/gi) ? path.replace(root, '..').replace('.js', '') : '';
      } else {
        require(path.replace(root, '..').replace('.js', '')).default(app);
      }
    });
  });
  require(index).default(app);
};
