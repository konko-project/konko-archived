'use strict';

/**
 * Paths and/or file patterns for static files
 *
 * @module Konko/Global/Configurations/Statics
 */
module.exports = {
  build: {
    root: 'build',
    static: 'build',
    js: 'build/javascripts',
    css: 'build/css',
  },
  dist: {
    root: 'dist',
    static: 'dist/client',
    js: 'dist/client/javascripts',
    css: 'dist/client/css',
  },
  shared: {
    root: 'static',
    libs: {
      root: 'static/libs',
    },
    favicons: {
      root: 'static/favicons',
    },
    uploads: {
      root: 'static/uploads',
      users: 'static/uploads/users',
      attachments: 'static/uploads/attachments',
    },
    styles: {
      root: 'static/styles',
      core: {
        root: 'static/styles/core',
        images: 'static/styles/core/images',
      },
      konko: {
        root: 'static/styles/konko',
        views: 'static/styles/konko/views',
        images: 'static/styles/konko/images',
      },
    },
  },
  required: [
    'static/uploads',
    'static/uploads/users',
    'static/uploads/attachments',
  ],
};
