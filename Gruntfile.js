'use strict';

const _ = require('lodash');
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
        presets: ['babel-preset-es2015-node5', 'stage-0']
      },
      server: {
        files: [{
          expand: true,
          cwd: server.paths.src,
          src: ['**/*.js'],
          dest: server.paths.dist,
        }]
      }
    },
    /** grunt-bower-concat **/
    bower_concat: {
      all: {
        dest: {
          js: statics.shared.libs.root + '/vendors.js',
          css: statics.shared.libs.root + '/vendors.css'
        },
        dependencies: {
          'bootstrap' : 'tether'
        }
      }
    },
    /** grunt-browserify **/
    browserify: {
      options: {
        transform: [
          ['babelify', {
            'presets': ['es2015', 'stage-0']
          }]
        ]
      }
    },
    /** grunt-contrib-clean **/
    clean: {
      server: [server.paths.dist]
    },
    /** grunt-contrib-csslint **/
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      }
    },
    /** grunt-contrib-cssmin **/
    cssmin: {
      options: {
        sourceMap: true,
        advanced: false
      },
      bower: {
        src: statics.shared.libs.root + '/vendors.css',
        dest: statics.shared.libs.root + '/vendors.min.css'
      }
    },
    /** grunt-eslint **/
    eslint: {
      options: {
        format: 'visualstudio'
      },
      server: {
        src: _.union(server.js)
      }
    },
    /** grunt-express-server **/
    express: {
      options: {
        harmony: true
      },
      dev: {
        options: {
            debug: true,
            script: server.paths.dist + '/server.js',
            node_env: 'development',
            background: true
        }
      }
    },
    /** grunt-contrib-jshint **/
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true,
        node: true
      },
      server: {
        src: _.union(server.js)
      }
    },
    /** grunt-contrib-less **/
    less: {

    },
    /** grunt-ng-annotate **/
    ngAnnotate: {

    },
    /** grunt-contrib-uglify **/
    uglify: {
      options: {
        mangle: true,
        compress: true
      },
      bower: {
        src: statics.shared.libs.root + '/vendors.js',
        dest: statics.shared.libs.root + '/vendors.min.js'
      }
    },
    /** grunt-contrib-watch **/
    watch: {
      options: {
          livereload: true
      },
      express: {
        files: _.union(env.grunt, env.configs, server.js),
        tasks: ['server'],
        options: {
          spawn: false
        }
      },
      server_scripts: {
        files: _.union(server.js),
        tasks: ['build:server']
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.task.registerTask('server', 'Start the correct server environment.', env => {
      if (env && env !== undefined) {
          global.e = env;
      }
      grunt.task.run('express:' + global.e);
  });

  grunt.registerTask('vendors', ['bower_concat', 'uglify:bower', 'cssmin:bower']);

  grunt.registerTask('lint:server', ['jshint:server', 'eslint:server']);
  grunt.registerTask('build:server', ['clean:server', 'lint:server', 'babel:server']);

  grunt.registerTask('', []);

  /** Default mode **/
  grunt.registerTask('default', ['build:server', 'server:dev', 'watch']);
  /** Development mode **/
  grunt.registerTask('dev', ['default']);
  /** Production mode **/
  grunt.registerTask('prod', []);
};
