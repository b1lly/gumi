module.exports = function( grunt ) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      build: {
        src: 'src/gumi.js',
        dest: 'dist/gumi.min.js'
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
        dest: 'dist/',
        ext: '.min.css'
      }
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['src/*'],
            dest: 'dist/',
            flatten: true
          },
          {
            expand: true,
            src: ['dist/*.min.*'],
            dest: 'example/',
            flatten: true
          }
        ]
      }
    },

    watch: {
      scripts: {
        files: ['src/*'],
        tasks: ['default'],
        options: {
          spawn: false,
        },
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default grunt
  grunt.registerTask('default', ['uglify', 'cssmin', 'copy']);
};
