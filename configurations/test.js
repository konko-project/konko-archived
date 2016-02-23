'use strict';

/**
 * Paths and/or file patterns for tests
 *
 * @module Konko/Global/Configurations/Test
 */
module.exports = {
  server: {
    js: [
      'test/server/**/*.js',
    ],
  },
  client: {
    js: [
      'test/client/**/*.js',
    ],
  },
  outputs: {
    root: 'test/outputs',
    mocha: 'test/outputs/mocha.out',
  },
};
