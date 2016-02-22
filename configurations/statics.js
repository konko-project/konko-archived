'use strict';

/**
 * Paths and/or file patterns for static files
 *
 * @module Konko/Global/Configurations/Statics
 */
module.exports = {
  build: {
    root: 'build',
    static: 'build/client',
    js: 'build/client/javascripts',
    css: 'build/client/css',
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
      js: 'static/libs/vendors.js',
      css: 'static/libs/vendors.css',
      minjs: 'static/libs/vendors.min.js',
      mincss: 'static/libs/vendors.min.css',
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
