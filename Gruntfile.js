'use strict';

const _ = require('lodash');
const path = require('path');
const TEST = require('./configurations/test');
const BOWER = require('./configurations/bower');
const SERVER = require('./configurations/server');
const CLIENT = require('./configurations/client');
const STATICS = require('./configurations/statics');
const ENV = require('./configurations/environment');

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
            cwd: SERVER.src.paths.js,
            src: ['**/*.js'],
            dest: SERVER.build.paths.js,
          },
        ],
      },
    },
    /** grunt-bower-concat **/
    bower_concat: {
      all: {
        dest: {
          js: STATICS.shared.libs.js,
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
            cwd: CLIENT.src.paths.js,
            src: ['**/*.js'],
            dest: CLIENT.build.paths.js,
          },
        ],
      },
    },
    /** grunt-contrib-clean **/
    clean: {
      server: [SERVER.build.paths.root],
      client: [CLIENT.build.paths.root],
      vendor: [STATICS.shared.libs.root],
      buildJS: [CLIENT.build.paths.js],
      buildCSS: [CLIENT.build.paths.css],
      test: [TEST.outputs.root],
    },
    /** grunt-contrib-csslint **/
    csslint: {
      options: {
        csslintrc: '.csslintrc',
      },
      build: {
        src: CLIENT.build.css,
      },
    },
    /** grunt-contrib-cssmin **/
    cssmin: {
      bower: {
        options: {
          sourceMap: false,
          advanced: true,
        },
        src: BOWER.css,
        dest: STATICS.shared.libs.mincss,
      },
    },
    /** grunt-eslint **/
    eslint: {
      options: {
        format: 'visualstudio',
      },
      server: {
        src: SERVER.src.js,
      },
      client: {
        src: CLIENT.src.js,
      },
      test: {
        src: _.union(TEST.server.js, TEST.client.js),
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
          node_env: 'development',
          script: SERVER.build.paths.root + '/bootstrap.js',
          background: true,
        },
      },
    },
    /** grunt-contrib-jshint **/
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true,
        mocha: true,
        node: true,
      },
      server: {
        src: SERVER.src.js,
      },
      client: {
        src: CLIENT.src.js,
      },
      test: {
        src: _.union(TEST.server.js, TEST.client.js),
      },
    },
    /** grunt-contrib-less **/
    less: {
      build: {
        files: [
          {
            expand: true,
            cwd: CLIENT.src.paths.less,
            src: ['*/**/*.less', '!globals/**/*.less'],
            dest: CLIENT.build.paths.css,
            ext: '.css',
          },
        ],
      },
      dist: {

      },
    },
    /* grunt-mocha-test */
    mochaTest: {
      test: {
        options: {
          require: 'babel-core/register',
          reporter: 'spec',
          timeout: 10000,
          captureFile: TEST.outputs.mocha,
        },
        src: TEST.server.js,
      },
    },
    /** grunt-ng-annotate **/
    ngAnnotate: {
      build: {
        files: [
          {
            expand: true,
            cwd: CLIENT.build.paths.js,
            src: ['**/*.js'],
            dest: CLIENT.build.paths.js,
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
        src: STATICS.shared.libs.js,
        dest: STATICS.shared.libs.minjs,
      },
    },
    /** grunt-contrib-watch **/
    watch: {
      options: {
        livereload: true,
      },
      express: {
        files: _.union(ENV.grunt, ENV.configs, SERVER.src.js, CLIENT.src.js, CLIENT.src.less),
        tasks: ['server'],
        options: {
          spawn: false,
        },
      },
      serverScripts: {
        files: SERVER.src.js,
        tasks: ['build:server'],
      },
      clientScripts: {
        files: CLIENT.src.js,
        tasks: ['clean:buildJS', 'lint:script', 'babelify:build'],
      },
      less: {
        files: CLIENT.src.less,
        tasks: ['clean:buildCSS', 'lint:less'],
      },
    },
  });

  require('load-grunt-tasks')(grunt);

  grunt.task.registerTask('mkdir:upload', 'Make upload directories.', () => {
    const done = grunt.task.current.async();
    STATICS.required.forEach(_path => {
      grunt.file.mkdir(path.join(__dirname, _path));
    });
    done();
  });

  grunt.task.registerTask('server', 'Start the correct server environment.', env => {
    const done = grunt.task.current.async();
    if (env && env !== undefined) {
      global.e = env;
    }

    grunt.task.run('express:' + global.e);
    done();
  });

  grunt.task.registerTask('test-server', 'Start the test server.', () => {
    const done = grunt.task.current.async();
    process.env.NODE_ENV = 'test';
    const Server = require(path.resolve(SERVER.build.paths.root, 'configs', 'server')).default;
    const server = new Server(path.resolve(SERVER.build.paths.root));
    server.start(done);
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

  grunt.registerTask('lint:test', ['jshint:test', 'eslint:test']);
  grunt.registerTask('test:server', [
    'build:server',
    'lint:test',
    'test-server',
    'mochaTest',
  ]);

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
  /** Test mode **/
  grunt.registerTask('test', [
    'clean:test',
    'build:server',
    'build:client',
    'mkdir:upload',
    'test-server',
    'mochaTest',
  ]);
};
