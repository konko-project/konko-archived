'use strict';

/**
 * Paths and/or file patterns for client side codes
 * with different versions (source, dev-build, and final distribution)
 *
 * @module Konko/Global/Configurations/Client
 */
module.exports = {
  src: {
    paths: {
      root: 'src/client',
      js: 'src/client',
      less: 'src/stylesheets/less',
    },
    js: [
      'src/client/**/*.js',
    ],
    less: [
      'src/stylesheets/**/*.less',
    ],
  },
  build: {
    paths: {
      root: 'build/client',
      js: 'build/client/javascripts',
      css: 'build/client/css',
    },
    js: [
      'build/client/javascripts/**/*.js',
    ],
    css: [
      'build/client/css/**/*.css',
    ],
  },
  dist: {
    paths: {
      root: 'dist/client',
      js: 'dist/client/javascripts',
    },
    js: [
      'dist/client/javascripts/**/*.min.js',
    ],
    css: [
      'dist/client/css/**/*.min.css',
    ],
  },
};
