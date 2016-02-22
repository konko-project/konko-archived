'use strict';

const _ = require('lodash');
const path = require('path');
const bower = require('./configurations/bower');
const server = require('./configurations/server');
const client = require('./configurations/client');
const statics = require('./configurations/statics');
const env = require('./configurations/environment');

module.exports = grunt => {
  // Grunt configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    /** grunt-babel **/
    babel: {
      options: {
        presets: ['babel-preset-es2015-node5', 'stage-0'],
      },
      server: {
        files: [
          {
            expand: true,
            cwd: server.src.paths.js,
            src: ['**/*.js'],
            dest: server.build.paths.js,
          },
        ],
      },
    },
    /** grunt-bower-concat **/
    bower_concat: {
      all: {
        dest: {
          js: statics.shared.libs.js,
        },
        dependencies: {
          bootstrap: 'tether',
        },
      },
    },
    /** grunt-browserify **/
    browserify: {
      options: {
        transform: [
          ['babelify', {
              presets: ['es2015', 'stage-0'],
            },
          ],
        ],
      },
      build: {
        files: [
          {
            expand: true,
            cwd: client.src.paths.js,
            src: ['**/*.js'],
            dest: client.build.paths.js,
          },
        ],
      },
    },
    /** grunt-contrib-clean **/
    clean: {
      server: [server.build.paths.root],
      client: [client.build.paths.root],
      vendor: [statics.shared.libs.root],
      buildJS: [client.build.paths.js],
      buildCSS: [client.build.paths.css],
    },
    /** grunt-contrib-csslint **/
    csslint: {
      options: {
        csslintrc: '.csslintrc',
      },
      build: {
        src: client.build.css,
      },
    },
    /** grunt-contrib-cssmin **/
    cssmin: {
      bower: {
        options: {
          sourceMap: false,
          advanced: true,
        },
        src: bower.css,
        dest: statics.shared.libs.mincss,
      },
    },
    /** grunt-eslint **/
    eslint: {
      options: {
        format: 'visualstudio',
      },
      server: {
        src: server.src.js,
      },
      client: {
        src: client.src.js,
      },
    },
    /** grunt-express-server **/
    express: {
      options: {
        harmony: true,
      },
      dev: {
        options: {
          debug: true,
          script: server.build.paths.root + '/server.js',
          NODE_ENV: 'development',
          background: true,
        },
      },
    },
    /** grunt-contrib-jshint **/
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true,
        node: true,
      },
      server: {
        src: server.src.js,
      },
      client: {
        src: client.src.js,
      },
    },
    /** grunt-contrib-less **/
    less: {
      build: {
        files: [
          {
            expand: true,
            cwd: client.src.paths.less,
            src: ['*/**/*.less', '!globals/**/*.less'],
            dest: client.build.paths.css,
            ext: '.css',
          },
        ],
      },
      dist: {

      },
    },
    /** grunt-ng-annotate **/
    ngAnnotate: {
      build: {
        files: [
          {
            expand: true,
            cwd: client.build.paths.js,
            src: ['**/*.js'],
            dest: client.build.paths.js,
          },
        ],
      },
    },
    /** grunt-contrib-uglify **/
    uglify: {
      options: {
        mangle: true,
        compress: true,
      },
      bower: {
        src: statics.shared.libs.js,
        dest: statics.shared.libs.minjs,
      },
    },
    /** grunt-contrib-watch **/
    watch: {
      options: {
        livereload: true,
      },
      express: {
        files: _.union(env.grunt, env.configs, server.src.js, client.src.js, client.src.less),
        tasks: ['server'],
        options: {
          spawn: false,
        },
      },
      serverScripts: {
        files: server.src.js,
        tasks: ['build:server'],
      },
      clientScripts: {
        files: client.src.js,
        tasks: ['clean:buildJS', 'lint:script', 'babelify:build'],
      },
      less: {
        files: client.src.less,
        tasks: ['clean:buildCSS', 'lint:less'],
      },
    },
  });

  require('load-grunt-tasks')(grunt);

  grunt.task.registerTask('mkdir:upload', 'Make upload directories.', () => {
    const done = grunt.task.current.async();
    statics.required.forEach(_path => {
      grunt.file.mkdir(path.join(__dirname, _path));
    });
    done();
  });

  grunt.task.registerTask('server', 'Start the correct server environment.', env => {
    if (env && env !== undefined) {
      global.e = env;
    }

    grunt.task.run('express:' + global.e);
  });

  grunt.registerTask('vendors', [
    'clean:vendor',
    'bower_concat',
    'uglify:bower',
    'cssmin:bower',
  ]);

  grunt.registerTask('babelify:build', [
    'browserify:build',
    'ngAnnotate:build',
  ]);
  grunt.registerTask('lint:less', ['less:build', 'csslint:build']);
  grunt.registerTask('lint:script', ['jshint:client', 'eslint:client']);
  grunt.registerTask('lint:client', ['lint:less', 'lint:script']);
  grunt.registerTask('build:client', [
    'clean:client',
    'lint:client',
    'babelify:build',
  ]);

  grunt.registerTask('lint:server', [
    'jshint:server',
    'eslint:server',
  ]);
  grunt.registerTask('build:server', [
    'clean:server',
    'lint:server',
    'babel:server',
  ]);

  grunt.registerTask('', []);

  /** Default mode **/
  grunt.registerTask('default', [
    'build:server',
    'build:client',
    'vendors',
    'mkdir:upload',
    'server:dev',
    'watch',
  ]);
  /** Development mode **/
  grunt.registerTask('dev', ['default']);
  /** Production mode **/
  grunt.registerTask('prod', []);
};
