'use strict';

/**
 * Paths and/or file patterns for server side codes
 *
 * @module Konko/Global/Configurations/Server
 */
module.exports = {
  paths: {
    src: 'src/server',
    dist: 'dist/server',
    views: 'dist/views',
  },
  js: [
    'src/server/**/*.js',
  ],
  models: [
    'modules/*/models/**/*.js',
  ],
  routes: [
    'modules/*/routes/**/*.js',
  ],
};
