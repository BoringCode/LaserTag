module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
     pkg: grunt.file.readJSON('package.json'),
     uglify: {
        options: {
           banner: '/*! <%= pkg.name %> JS Build v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
           compress: {
              drop_console: true
           }
        },
        build: {
           src: './web/public/js/<%= pkg.name %>.js',
           dest: './web/public/js/<%= pkg.name %>.js'
        },
        extras: {
           src: './web/public/js/dependencies.js',
           dest: './web/public/js/dependencies.js'
        }
     },
     concat: {
        options: {
           separator: '\n\n',
        },
        basic: {
           src: [
           './web/src/js/intro.js',
           './web/src/js/main.js',
           './web/src/js/factories/*.js',
           './web/src/js/filters/*.js',
           './web/src/js/directives/*.js',
           './web/src/js/controllers/*.js',
           './web/src/js/outro.js',
           ],
           dest: './web/public/js/<%= pkg.name %>.js'
        },
        dependencies: {
           src: [
           './web/src/js/dependencies/angular.js',
           './web/src/js/dependencies/jquery.min.js',
           './web/src/js/dependencies/*.js',
           ],
           dest: './web/public/js/dependencies.js'
        }
     },
     watch: {
      files: ['./web/src/**'],
       tasks: ['dev'],
       options: {
          livereload: true
       }
    }
  });

   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-concat');

   // Default task(s).
   grunt.registerTask('default', ['dev', 'watch']);
   grunt.registerTask('dev', ['concat']);
   grunt.registerTask('build', ['concat', 'uglify']);
};
