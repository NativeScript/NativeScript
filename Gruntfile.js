module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    clean: {
      build: ["build"]
    },
    exec: {
      npm_pack: {
        cmd: 'npm pack ./package',
        cwd: 'build/'
      },
	  gradle: 'gradle build'
    },
    copy: {
      package: {
        files: [
          { expand: true, src: 'package.json', dest: 'build/package' },
		  { expand: true, cwd: 'widgets/build/outputs/aar', src: 'widgets-release.aar', dest: 'build/package/platforms/android' }
        ]
      }
    },
    mkdir: {
      build: {
        options: {
          create: ["build/package"]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');

  // Default task(s).
  grunt.registerTask('default', [
    'clean:build',
    'mkdir:build',
	'exec:gradle',
    'copy:package',
    'exec:npm_pack'
  ]);
};
