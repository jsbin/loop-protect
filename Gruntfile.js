'use strict';


module.exports = function (grunt) {
  var config = {
    jshint: {
      options: {
        reporter: require('jshint-stylish'),
        jshintrc: true,
      },
      target: ['lib/loop-protect.js', 'test/*.test.js']
    },
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> | v<%= pkg.version %> | (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> | <%= pkg.licenses[0].url %> */\n',
        compress: {
          'global_defs': {
            DEBUG: false
          },
          'dead_code': true
        },
        report: 'gzip'
      },
      dist: {
        files: {
          'dist/loop-protect.min.js': 'lib/loop-protect.js'
        }
      }
    },
  };

  // Project configuration.
  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('dist', ['uglify']);
  grunt.registerTask('default', ['jshint']);

};
