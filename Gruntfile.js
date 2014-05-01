module.exports = function( grunt ) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        src: 'src/grunt.js',
        dest: 'dist/grunt.min.js'
      },
      options: {
        compress: {
          hoist_funs: false,
          join_vars: false,
          loops: false,
          unused: false
        },
        beautify: {
          ascii_only: true
        }
      }
    },

    cssmin: {
      minify: {
        expand: true,
        cwd: 'src/',
        src: ['*.css', '!*.min.css'],
        dest: 'dist/css/',
        ext: '.min.css'
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['src/stylesheets/*'],
            dest: 'dist/',
            flatten: true
          },
          {
            expand: true,
            src: ['src/*.html'],
            dest: 'dist/',
            flatten: true
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default grunt
  grunt.registerTask('default', ['cssmin', 'uglify', 'copy']);
};
