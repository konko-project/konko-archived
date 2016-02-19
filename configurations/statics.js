'use strict';

module.exports = {
  build: {
    root: 'build',
    static: 'build/static'
  },
  dist: {
    root: 'dist',
    static: 'dist/static'
  },
  shared: {
    uploads: {
      root: 'dist/uploads',
      users: 'dist/uploads/users',
      attachments: 'dist/uploads/attachments'
    },
    styles: {
      root: 'dist/styles',
      core: {
        root: 'dist/styles/core',
        images: 'dist/styles/core/images'
      },
      konko: {
        root: 'dist/styles/konko',
        views: 'dist/styles/konko/views',
        images: 'dist/styles/konko/images'
      }
    }
  }
};
