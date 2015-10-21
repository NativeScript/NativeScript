module.exports = {

    run: function(grunt) {
        var pathModule = require("path");

        //Construct and validate the arguments
        var args = {
            platform: grunt.option("platform")
        };

        (function validateInput(){
            if (!(/^(Android|iOS)$/).test(args.platform)) { throw new Error("Invalid target platform specified! Use --platform=Android|iOS"); }
        }());

        var localCfg = {
            tnsPath: "tns",
            emulatorProcessIdentifier:".*emulator64-x86",
            emuAvdName:"Api19",
            androidRuntimePath:"/Users/erjan/tns-android.tgz",
            outfile:"./TestRunResult.txt",
            androidRuntimePath: "/Users/erjan/tns-android.tgz",
            androidFrameworkArgument: " --frameworkPath=/Users/erjan/tns-android.tgz",

            workingDir:".testsapprun",
            testsAppName:"TestsApp",
            applicationDir: pathModule.join(".testsapprun", "TestsApp"),
            appDir: pathModule.join(".testsapprun", "TestsApp", "app"),
            pathToApk:"./platforms/android/build/outputs/apk/TestsApp-debug.apk",
            deployedAppName:"org.nativescript.TestsApp",
            mainActivityName:"com.tns.NativeScriptActivity",
            pathToCompiledTests: "bin/dist/apps/tests",

            platform: args.platform
        }

        grunt.initConfig({
            clean: {
                workingDir: {
                    src: localCfg.workingDir
                },
                originalAppDir: {
                    src: [
                            localCfg.appDir + "/*",
                            "!" + pathModule.join(localCfg.appDir, "App_Resources") + ""
                         ]
                }
            },
            mkdir: {
                workingDir: {
                    options: {
                        create: [localCfg.workingDir],
                        mode: 0700
                    }
                }
            },
            copy: {
                testsAppToRunDir: {
                    src: "**/*.*",
                    dest: localCfg.appDir,
                    cwd: localCfg.pathToCompiledTests,
                    expand: true
                },
                addAndroidPermissions: {
                    src: "AndroidManifest.xml",
                    dest: localCfg.applicationDir + "/platforms/android/src/main/",
                    cwd: localCfg.applicationDir + "/platforms/android/src/main",
                    expand: true,
                    options: {
                        process: function(content, srcPath) {
                            var newContent = content;

                            var internetPermissionFinder = /((\s*)<uses-permission[^>]*android\.permission\.INTERNET[^>]*>)/;

                            if (!/uses-permission[^>]*android\.permission\.ACCESS_NETWORK_STATE/.test(content)) {
                                newContent = newContent.replace(internetPermissionFinder, "$1$2<uses-permission android:name=\"android.permission.ACCESS_NETWORK_STATE\"/>");
                            }
                            if (!/uses-permission[^>]*android\.permission\.ACCESS_FINE_LOCATION/.test(content)) {
                                newContent = newContent.replace(internetPermissionFinder, "$1$2<uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>");
                            }
                            return newContent;
                        }
                    }
                }
            },
            exec: {
                killAndroidEmulator: {
                    cmd: "pkill '" + localCfg.emulatorProcessIdentifier + "'",
                    exitCode: [0, 1]
                },
                startAndroidEmulator: {
                    cmd: "emulator -avd " + localCfg.emuAvdName + " -no-audio -no-window &",
                    stdout: true
                },
                createApp: {
                    cmd: localCfg.tnsPath + " create " + localCfg.testsAppName,
                    cwd: localCfg.workingDir
                },
                addAndroidPlatform: {
                    cmd: "tns platform add android " + localCfg.androidFrameworkArgument,
                    cwd: localCfg.applicationDir
                },
                buildAndroidApp: {
                    cmd: "tns build android",
                    cwd: localCfg.applicationDir
                },
                restartAdb: {
                    cmd: "adb kill-server && adb start-server"
                },
                uninstallExistingAndroidApp: {
                    cmd: "adb uninstall " + localCfg.deployedAppName
                },
                installNewAndroidApp: {
                    cmd: "adb install " + localCfg.pathToApk,
                    cwd: localCfg.applicationDir
                },
                startAndroidApp: {
                    cmd: "adb shell am start -n " + localCfg.deployedAppName + "/" + localCfg.mainActivityName
                }
            },
            shell: {
                collectAndroidLog: {
                    command: "./expect.exp " + localCfg.outfile,
                    options: {
                        execOptions: {
                            maxBuffer: Infinity
                        }
                    }
                }
            }
        });

        grunt.loadNpmTasks("grunt-shell");
        grunt.loadNpmTasks("grunt-exec");
        grunt.loadNpmTasks("grunt-mkdir");
        grunt.loadNpmTasks("grunt-contrib-clean");
        grunt.loadNpmTasks("grunt-contrib-copy");

        var getPlatformSpecificTask = function(templatedTaskName) {
            return templatedTaskName.replace(/\{platform\}/, localCfg.platform);
        }

        grunt.registerTask("doPostPlatformAdd", [
                "exec:restartAdb"
                ]);

        grunt.registerTask("testsapp", [
                "clean:workingDir",
                "mkdir:workingDir",
                getPlatformSpecificTask("exec:kill{platform}Emulator"),
                getPlatformSpecificTask("exec:start{platform}Emulator"),

                "exec:createApp",
                "clean:originalAppDir",
                "copy:testsAppToRunDir",

                getPlatformSpecificTask("exec:add{platform}Platform"),
                getPlatformSpecificTask("copy:add{platform}Permissions"),
                getPlatformSpecificTask("exec:build{platform}App"),
                "doPostPlatformAdd",

                getPlatformSpecificTask("exec:uninstallExisting{platform}App"),
                getPlatformSpecificTask("exec:installNew{platform}App"),
                getPlatformSpecificTask("exec:start{platform}App"),
                getPlatformSpecificTask("shell:collect{platform}Log"),

                getPlatformSpecificTask("exec:kill{platform}Emulator"),
                "clean:workingDir"
        ]);
    }
}
