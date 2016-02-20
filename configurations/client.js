'use strict';

/**
 * Paths and/or file patterns for client side codes
 * with different versions (source, dev-build, and final distribution)
 *
 * @module Konko/Global/Configurations/Client
 */
module.exports = {
  src: {
    path: [
      'src/client',
    ],
    js: [
      'src/client/**/*.js',
    ],
    less: [
      'src/client/**/*.less',
    ],
  },
  build: {
    path: [
      'build',
    ],
    js: [
      'build/javascripts/**/*.js',
    ],
    css: [
      'build/css/**/*.css',
    ],
  },
  dist: {
    path: [
      'dist/client',
    ],
    js: [
      'dist/client/javascripts/**/*.min.js',
    ],
    css: [
      'dist/client/css/**/*.min.css',
    ],
  },
};
