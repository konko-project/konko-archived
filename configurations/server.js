'use strict';

/**
 * Paths and/or file patterns for server side codes
 *
 * @module Konko/Global/Configurations/Server
 */
module.exports = {
  src: {
    paths: {
      root: 'src/server',
      js: 'src/server',
    },
    js: [
      'src/server/**/*.js',
    ],
  },
  build: {
    paths: {
      root: 'build/server',
      js: 'build/server',
    },
    js: [
      'build/server/**/*.js',
    ],
  },
  dist: {
    paths: {
      root: 'dist/server',
      js: 'dist/server',
    },
    js: [
      'dist/server/**/*.js',
    ],
  },
  models: [
    'modules/*/models/**/*.js',
  ],
  routes: [
    'modules/*/routes/**/*.js',
  ],
};
