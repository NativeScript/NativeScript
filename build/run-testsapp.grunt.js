module.exports = {

    run: function(grunt) {
        var pathModule = require("path");

        var modulesPackageConfig = grunt.file.readJSON('package.json');

        //Construct and validate the arguments
        var args = {
            platform: grunt.option("platform"),
            modulesPath: grunt.option("modulesPath"),
            tnsPath: grunt.option("tnsPath"),
            emulatorProcessIdentifier: grunt.option("emuPId"),
            emuAvdName: grunt.option("avd"),
            outFile: grunt.option("logFilePath"),
            runtimePath: grunt.option("runtimePath"),
            showEmu: grunt.option("showEmu")
        };

        (function validateInput(){
            if (!(/^(Android|iOS)$/).test(args.platform)) {
                throw new Error("Invalid target platform specified! Use --platform=Android|iOS");
            }

            if (args.platform === "Android") {
                if (!args.emulatorProcessIdentifier) {
                    throw new Error("Please, specify an identifier of the emulator process so that it can be stopped (--emuPId=...). Too many emulators started might cause machine overload");
                }
                if (!args.emuAvdName) {
                    throw new Error("Please, specify the name of the AVD to start (--avd=...).");
                }
            }
        }());

        var localCfg = {
            tnsPath: args.tnsPath || "tns",
            emulatorProcessIdentifier: args.emulatorProcessIdentifier,
            modulesPath: args.modulesPath || "./bin/dist/tns-core-modules-" + modulesPackageConfig.version + ".tgz",
            emuAvdName: args.emuAvdName,
            outfile: args.outFile || "./TestRunResult.txt",
            frameworkArgument: args.runtimePath ? " --frameworkPath=" + args.runtimePath : "",
            showEmu: args.showEmu || false,

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
                },
                modules: {
                    src: pathModule.join(localCfg.applicationDir, "node_modules", "tns-core-modules")
                },
                tempExtractedModules: {
                    src: pathModule.join(localCfg.applicationDir, "node_modules", "package")
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
                modulesToDir: {
                    expand: true,
                    src:  "**/*.*",
                    cwd: pathModule.join(localCfg.applicationDir, "node_modules", "package"),
                    dest: pathModule.join(localCfg.applicationDir, "node_modules", "tns-core-modules")
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
                },
                addiOSPermissions: {
                    src: localCfg.testsAppName + "-Info.plist",
                    dest: pathModule.join(localCfg.applicationDir,"/platforms/ios/", localCfg.testsAppName) + "/",
                    cwd: pathModule.join(localCfg.applicationDir,"/platforms/ios/", localCfg.testsAppName),
                    expand: true,
                    options: {
                        process: function(content, srcPath) {
                            var newContent = content;

                            var lastDictLocator = /(<\/dict>\s*<\/plist>)$/gm;

                            if (!/NSAppTransportSecurity/.test(content)) {
                                newContent = newContent.replace(lastDictLocator, "<key>NSAppTransportSecurity</key>\n$1");
                            }
                            if (!/NSAllowsArbitraryLoads/.test(content)) {
                                newContent = newContent.replace(lastDictLocator, "<dict>\n<key>NSAllowsArbitraryLoads</key>\n<true/>\n</dict>\n$1");
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
                    cmd: "emulator -avd " + localCfg.emuAvdName + " -no-audio " + (args.showEmu ? "" : "-no-window") + "&",
                    stdout: true
                },
                createApp: {
                    cmd: localCfg.tnsPath + " create " + localCfg.testsAppName,
                    cwd: localCfg.workingDir
                },
                addPlatform: {
                    cmd: "tns platform add " + localCfg.platform.toLowerCase() + " " + localCfg.frameworkArgument,
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
            untar: {
                modules: {
                    src: localCfg.modulesPath,
                    dest: pathModule.join(localCfg.applicationDir, "node_modules")
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
                },
                buildApp: {
                    command: "tns build " + localCfg.platform.toLowerCase(),
                    options: {
                        execOptions: {
                            maxBuffer: Infinity,
                            cwd: localCfg.applicationDir
                        }
                    }
                },
            }
        });

        grunt.loadNpmTasks("grunt-shell");
        grunt.loadNpmTasks("grunt-exec");
        grunt.loadNpmTasks("grunt-mkdir");
        grunt.loadNpmTasks("grunt-contrib-clean");
        grunt.loadNpmTasks("grunt-contrib-copy");
        grunt.loadNpmTasks("grunt-untar");

        var getPlatformSpecificTask = function(templatedTaskName) {
            return templatedTaskName.replace(/\{platform\}/, localCfg.platform);
        }

        grunt.registerTask("doPostPlatformAddAndroid", [
                "exec:restartAdb"
                ]);
        grunt.registerTask("doPostPlatformAddiOS", [
                ]);

        grunt.registerTask("testsapp", [
                "clean:workingDir",
                "mkdir:workingDir",
//                getPlatformSpecificTask("exec:kill{platform}Emulator"),
//                getPlatformSpecificTask("exec:start{platform}Emulator"),

                "exec:createApp",
                "clean:originalAppDir",
                "copy:testsAppToRunDir",
                "clean:modules",
                "untar:modules",
                "copy:modulesToDir",
                "clean:tempExtractedModules",

                "exec:addPlatform",
                getPlatformSpecificTask("copy:add{platform}Permissions"),
                "shell:buildApp",
                getPlatformSpecificTask("doPostPlatformAdd{platform}"),

                getPlatformSpecificTask("exec:uninstallExisting{platform}App"),
                getPlatformSpecificTask("exec:installNew{platform}App"),
                getPlatformSpecificTask("exec:start{platform}App"),
                getPlatformSpecificTask("shell:collect{platform}Log"),

                getPlatformSpecificTask("exec:kill{platform}Emulator"),
                "clean:workingDir"
        ]);
    }
}
