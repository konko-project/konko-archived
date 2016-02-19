'use strict';

module.exports = {
  src: {
    path: [
      'src/client'
    ],
    js: [
      'src/client/**/*.js'
    ],
    less: [
      'src/client/**/*.less'
    ]
  },
  build: {
    path: [
      'build'
    ],
    js: [
      'build/javascripts/**/*.js'
    ],
    css: [
      'build/css/**/*.css'
    ]
  },
  dist: {
    path: [
      'dist/client'
    ],
    js: [
      'dist/client/javascripts/**/*.min.js'
    ],
    css: [
      'dist/client/css/**/*.min.css'
    ]
  }
};
