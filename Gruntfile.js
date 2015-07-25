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
    }
  });
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.registerTask('default',['compress',]);
}
