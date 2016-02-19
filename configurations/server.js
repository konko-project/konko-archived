'use strict';

module.exports = {
  paths: {
    src: 'src/server',
    dist: 'dist/server',
    views: 'dist/views'
  },
  js: [
    'src/server/**/*.js'
  ],
  models: [
    'modules/*/models/**/*.js'
  ],
  routes: [
    'modules/*/routes/**/*.js'
  ]
};
