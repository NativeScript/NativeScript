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
            runtimeVersion: grunt.option("runtimeVersion"),
            showEmu: grunt.option("showEmu"),
            runAppOnly: grunt.option("runAppOnly"),
            pathToApp: grunt.option("pathToApp")
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

            if (args.runAppOnly && !args.pathToApp) {
                throw new Error("runAppOnly called, but no path to application specified. Please, add the path via the (--pathToApp=...) parameter.");
            }
        }());

        var localCfg = {
            tnsPath: args.tnsPath || "tns",
            emulatorProcessIdentifier: args.emulatorProcessIdentifier,
            modulesPath: args.modulesPath || "./bin/dist/tns-core-modules-" + modulesPackageConfig.version + ".tgz",
            emuAvdName: args.emuAvdName,
            outFile: args.outFile || "./TestRunResult.txt",
            frameworkArgument: args.runtimePath ? " --frameworkPath=" + args.runtimePath : "",
            runtimeVersionArgument: args.runtimeVersion ? "@" + args.runtimeVersion : "",
            showEmu: args.showEmu || false,
            runAppOnly: args.runAppOnly || false,

            workingDir:".testsapprun",
            testsAppName:"TestsApp",
            tnsCoreModulesSource: pathModule.resolve("./tns-core-modules"),
            applicationDir: pathModule.join(".testsapprun", "TestsApp"),
            appDir: pathModule.join(".testsapprun", "TestsApp", "app"),
            pathToApk: "./platforms/android/build/outputs/apk/TestsApp-debug.apk",
            pathToApp: "./platforms/ios/build/emulator/TestsApp.app",
            deployedAppName:"org.nativescript.TestsApp",
            mainActivityName:"com.tns.NativeScriptActivity",
            pathToCompiledTests: "bin/dist/tests/app",
            simulatorSysLog: pathModule.join(process.env.HOME, "Library/Logs/CoreSimulator", args.emuAvdName, "/system.log"),
            platform: args.platform
        }

        if (localCfg.runAppOnly) {
            localCfg.pathToApp = localCfg.pathToApk = args.pathToApp;
            localCfg.applicationDir = "./";
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
                },
                simulatorLog: {
                    src: localCfg.simulatorSysLog,
                    options: {
                        force: true
                    }
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
                    dest: localCfg.applicationDir + "/app/App_Resources/Android/",
                    cwd: localCfg.applicationDir + "/app/App_Resources/Android",
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
                },
                simulatorLog: {
                    src: localCfg.simulatorSysLog,
                    dest: localCfg.outFile
                }
            },
            exec: {
                killAndroidEmulator: {
                    cmd: "pkill '" + localCfg.emulatorProcessIdentifier + "'",
                    exitCode: [0, 1]
                },
                killiOSEmulator: {
                    cmd: "pkill Simulator",
                    exitCode: [0, 1]
                },
                createApp: {
                    cmd: localCfg.tnsPath + " create " + localCfg.testsAppName,
                    cwd: localCfg.workingDir
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
                startAndroidEmulator: {
                    cmd: "emulator -avd " + localCfg.emuAvdName + " -no-audio " + (args.showEmu ? "" : "-no-window") + "&"
                },
                startAndroidApp: {
                    cmd: "adb shell am start -n " + localCfg.deployedAppName + "/" + localCfg.mainActivityName
                },
                uninstallExistingiOSApp: {
                    cmd: "xcrun simctl uninstall " + localCfg.emuAvdName + " org.nativescript." + localCfg.testsAppName,
                    cwd: localCfg.applicationDir
                },
                installNewiOSApp: {
                    cmd: "xcrun simctl install " + localCfg.emuAvdName + " " + localCfg.pathToApp,
                    cwd: localCfg.applicationDir
                },
                startiOSApp: {
                    cmd: "xcrun simctl launch " + localCfg.emuAvdName + " org.nativescript." + localCfg.testsAppName
                },
                "npm-i-modules": {
                    cmd: "npm i " + pathModule.relative(localCfg.applicationDir, localCfg.modulesPath),
                    cwd: localCfg.applicationDir
                },
                "npm-i-widgets": {
                    // HACK: switch to @next when it gets switched to the 3.0 branch
                    cmd: "npm i tns-core-modules-widgets@rc",
                    cwd: localCfg.applicationDir
                }
            },
            shell: {
                collectAndroidLog: {
                    command: "./expect.exp " + "'adb logcat *:D' " + localCfg.outFile,
                    options: {
                        execOptions: {
                            maxBuffer: Infinity
                        }
                    }
                },
                waitiOSLogCompletion: {
                    command: "./expect.exp " + "'tail -f " + localCfg.simulatorSysLog + "' " + localCfg.outFile,
                    options: {
                        execOptions: {
                            maxBuffer: Infinity
                        }
                    }
                },
                startiOSSimulator: {
                    command: "xcrun instruments -w " + localCfg.emuAvdName,
                    options: {
                        failOnError: false
                    },
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
                addPlatform: {
                    command: "tns platform add " + localCfg.platform.toLowerCase() + localCfg.runtimeVersionArgument + " " + localCfg.frameworkArgument,
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

        var getPlatformSpecificTask = function(templatedTaskName) {
            return templatedTaskName.replace(/\{platform\}/, localCfg.platform);
        }

        grunt.registerTask("startEmulatorAndroid", [
            getPlatformSpecificTask("exec:startAndroidEmulator"),
        ]);

        grunt.registerTask("startEmulatoriOS", [
            getPlatformSpecificTask("shell:startiOSSimulator"),
        ]);

        grunt.registerTask("collectLogAndroid", [
            "shell:collectAndroidLog"
        ]);

        grunt.registerTask("collectLogiOS", [
            "shell:waitiOSLogCompletion",
            "copy:simulatorLog"
        ]);

        grunt.registerTask("doPreUninstallAppAndroid", [
            "exec:restartAdb"
        ]);

        grunt.registerTask("doPreUninstallAppiOS", [
            "clean:simulatorLog"
        ]);

        grunt.registerTask("cleanup", [
//            getPlatformSpecificTask("exec:kill{platform}Emulator"),
            "clean:workingDir"
        ]);

        grunt.registerTask("buildOnly", [
            "exec:createApp",
            "clean:originalAppDir",
            "copy:testsAppToRunDir",
            "clean:modules",
            "exec:npm-i-modules",
            "exec:npm-i-widgets",
            "copy:modulesToDir",
            "clean:tempExtractedModules",

            "shell:addPlatform",
            getPlatformSpecificTask("copy:add{platform}Permissions"),
            "shell:buildApp",
        ]);

        grunt.registerTask("buildTestsApp", [
            "cleanup",
            "mkdir:workingDir",
            "buildOnly"

        ]);
        grunt.registerTask("buildOnlyTestsApp", ["buildTestsApp"]);

        grunt.registerTask("runOnly", [
//            getPlatformSpecificTask("doPreUninstallApp{platform}"),

            getPlatformSpecificTask("exec:uninstallExisting{platform}App"),
            getPlatformSpecificTask("exec:installNew{platform}App"),
            getPlatformSpecificTask("exec:start{platform}App"),
            getPlatformSpecificTask("collectLog{platform}"),
        ]);

        grunt.registerTask("runApp", [
//            "cleanup",
//            getPlatformSpecificTask("startEmulator{platform}"),
            "runOnly",
            "cleanup"

        ]);

        grunt.registerTask("runOnlyTestsApp", ["runApp"]);


        var tasksToExecute = ["runApp"];
        if (!localCfg.runAppOnly) {
            tasksToExecute = [
                "cleanup",
                "mkdir:workingDir",
                getPlatformSpecificTask("startEmulator{platform}"),
                "buildOnly",
                "runOnly",
                "cleanup"
            ];
        }

        grunt.registerTask("testsapp", tasksToExecute);
    }
}
