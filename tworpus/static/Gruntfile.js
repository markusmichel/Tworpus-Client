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
                    'dist/js/tworpus.min.js': '<%= concat.dist.dest %>'
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
