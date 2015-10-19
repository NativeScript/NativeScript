module.exports = {
    run: function(grunt) {

        var localCfg = {
            emulatorProcessIdentifier:".*emulator64-x86",
            emuAvdName:"Api19",
            androidRuntimePath:"/Users/erjan/tns-android.tgz",
            outfile:"./TestRunResult.txt",

            workingDir:".testsapprun",
            testsAppName:"TestsApp",
            pathToApk:"./platforms/android/build/outputs/apk/TestsApp-debug.apk",
            deployedAppName:"org.nativescript.$testsAppName",
            mainActivityName:"com.tns.NativeScriptActivity"
        }

        grunt.initConfig({
            clean: {
                workingDir: {
                    src: localCfg.workingDir
                }
            },
            mkdir: {
                workingDir: {
                    options: {
                        createi: [localCfg.workingDir],
                        mode: 0700
                    }
                }
            },
            exec: {
                killEmulator: {
                    cmd: "pkill '" + localCfg.emulatorProcessIdentifier + "'",
                    exitCode: [0, 1]
                },
                runTestsApp: {
                    cmd: "./runtestsapp.sh",
                    stdout: false
                }
            }
        });

//        grunt.loadNpmTasks("grunt-contrib-copy");
//        grunt.loadNpmTasks("grunt-tslint");
//        grunt.loadNpmTasks("grunt-multi-dest");
//        grunt.loadNpmTasks("grunt-shell");
//        grunt.loadNpmTasks("grunt-env");
//        grunt.loadNpmTasks("grunt-simple-mocha");
        grunt.loadNpmTasks("grunt-exec");
        grunt.loadNpmTasks("grunt-mkdir");
        grunt.loadNpmTasks("grunt-contrib-clean");

        grunt.registerTask("testsapp", [
                "clean:workingDir",
                "mkdir:workingDir",
                "exec:killEmulator",
//                "exec:runTestsApp",




                "exec:killEmulator",
                "clean:workingDir"
        ]);
    }
}
