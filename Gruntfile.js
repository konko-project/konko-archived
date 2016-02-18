'use strict';

module.exports = grunt => {
    // Grunt configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /** grunt-bower-concat **/
        bower_concat: {
            all: {
                dest: '',
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
            }
        },
        /** grunt-eslint **/
        eslint: {

        },
        /** grunt-express-server **/
        express: {
            option: {
                harmony: true
            }
        },
        /** grunt-contrib-jshint **/
        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true,
                node: true
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
            }
        },
        /** grunt-contrib-watch **/
        watch: {

        }
    });

    require('load-grunt-tasks')(grunt);

    /** Default mode **/
    grunt.registerTask('default', []);
    /** Development mode **/
    grunt.registerTask('dev', []);
    /** Production mode **/
    grunt.registerTask('prod', []);
};
