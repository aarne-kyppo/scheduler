module.exports = function(grunt){
  grunt.initConfig({
    compress: {
      main: {
        options: {
          archive: 'scheduler.tgz',
          pretty: true,
        },
        files: [
          {
            src: [
              'public/**/*',
              'routes/**/*',
              'tests/**/*',
              'views/**/*',
              './app.js',
              './bower.json',
              './package.json',
              './reader.js',
              './time_edit-reader.js',
            ],
          },
        ],
      }
    },
    jshint: {
      all: ['public/**/*.js',],
    },
    sass: {
      dist: {
        options: {
          sourcemap: 'none',
        },
        files: [{
          expand: true,
          cwd: 'public/stylesheets/',
          src: ['*.sass',],
          dest: 'public/stylesheets/',
          ext: '.css',
        },]
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default',['jshint','sass','compress']);
}
