module.exports = function (grunt) {
    'use strict';

    var fs = require('fs');
    var path = require('path');


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-csscomb');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        less: {
            production: {
                files: {
                    'dist/css/<%= pkg.name %>.css': 'bootstrap.less'
                }
            }
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: 'dist/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/css/',
                ext: '.min.css'
            }
        },

        copy: {
            fonts: {
                expand: true,
                src: 'bower_components/bootstrap/fonts/*',
                dest: 'dist/fonts/',
                flatten: true
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'js/TworpusApp.js',
                    'js/**/*service.js',
                    'js/**/*.js'
                ],
                dest: 'dist/js/tworpus.js'
            },
            assets: {
                src: [
                    'bower_components/jquery/dist/jquery.min.js',
                    'bower_components/underscore/underscore.js',
                    'bower_components/bootstrap/dist/js/bootstrap.min.js',


                    'components/datepicker/js/moment-min.js',
                    'components/datepicker/js/pikaday.js',
                    'components/select2-3.4.5/select2.min.js',
                    'components/select2-3.4.5/select2_locale_de.js',
                    'components/pnotify-1.2.0/jquery.pnotify.min.js',
                    'components/slider/js/bootstrap-slider.js',
                    'components/d3/d3.min.js',
                    'bower_components/angular/angular.js',
                    'components/angular-route.js',
                    'components/angular-animate.js',
                    'bower_components/angular-cookies/angular-cookies.js',
                    'bower_components/angular-ui/build/angular-ui.js',
                    'bower_components/angular-ui/build/angular-ui-ieshiv.js',
                    'bower_components/angular-bootstrap/ui-bootstrap.js',
                    'components/angular-locale_de-de.js',
                    'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
                    'bower_components/angular-ui-select2/src/select2.js',

                    'components/joyride-master/js/jquery.joyride-2.1.js',
                    'components/joyride-master/js/modernizr.mq.js'
                ],
                dest: 'dist/js/assets.js'
            }
        },

        jshint: {
            all: [
                'Gruntfile.js',
                'js/**/*.js'
            ]
        },

        uglify: {
            all: {
                files: {
                    'dist/js/tworpus.min.js': '<%= concat.dist.dest %>',
                    'dist/js/assets.min.js': '<%= concat.assets.dest %>'
                }
            }
        },

        watch: {
            lessTest: {
                files: 'less/*.less',
                tasks: 'dist-css'
            }
        }
    });

    // JS distribution task.
    grunt.registerTask('dist-js', ['concat', 'uglify']);

    // CSS distribution task.
    grunt.registerTask('dist-css', ['less', 'cssmin']);

    // Full distribution task.
    grunt.registerTask('dist', ['dist-css', 'copy:fonts', 'dist-js']);

    // Default task.
    grunt.registerTask('default', ['less', 'copy:fonts', 'concat', 'uglify', 'jshint']);
};
