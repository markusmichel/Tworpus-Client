module.exports = function (grunt) {
    'use strict';

    var fs = require('fs');
    var path = require('path');


    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

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

        watch: {
            less: {
                files: 'less/*.less',
                tasks: 'less'
            }
        },

        copy: {
            fonts: {
                expand: true,
                src: 'bower_components/bootstrap/fonts/*',
                dest: 'dist/fonts/',
                flatten: true
            }
        }
    });

    // JS distribution task.
    grunt.registerTask('dist-js', ['concat', 'uglify']);

    // CSS distribution task.
    grunt.registerTask('dist-css', ['less', 'cssmin', 'csscomb', 'usebanner']);

    // Full distribution task.
    grunt.registerTask('dist', ['clean', 'dist-css', 'copy:fonts', 'dist-js', 'dist-docs']);

    // Default task.
    grunt.registerTask('default', ['less', 'copy:fonts']);

    // Task for updating the npm packages used by the Travis build.
    grunt.registerTask('update-shrinkwrap', ['exec:npmUpdate', 'exec:npmShrinkWrap', '_update-shrinkwrap']);
    grunt.registerTask('_update-shrinkwrap', function () {
        updateShrinkwrap.call(this, grunt);
    });
};
