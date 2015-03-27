module.exports = function(grunt) {
    var fs=require("fs");
    var pathModule=require("path");

    var filterTypeScriptFiles = function(content, srcPath) {
        var matchRule = /^.*@private/ig;
        if (matchRule.test(content))
        {
            return false;
        }
        var processed = content;
        processed = processed.replace(/\/\/[\/\s]*@private((.|\s)*?)\/\/[\/\s]*@endprivate/gm, "");
        return processed;
    };

    var updatePackageDef = function(content, update)
    {
        var contentAsObject = JSON.parse(content);
        update(contentAsObject);
        return JSON.stringify(contentAsObject, null, "\t");
    }

    var updateModulesPackageDef = function(content, srcPath) {
        return updatePackageDef(content, function(contentAsObject) {
            contentAsObject.version = localCfg.packageVersion;
        });
    };

    var updateAppPackageDef = function(content, srcPath) {
        var currentAppName = grunt.task.current.data.appName;
        return updatePackageDef(content, function(contentAsObject) {
            contentAsObject.version = localCfg.packageVersion;
            contentAsObject.name = "tns-samples-" + currentAppName;
            contentAsObject.description = "Nativescript " + currentAppName + " sample application";
            contentAsObject.license = "BSD";
        });
    };

    var updateDefinitionsPackageDef = function(content, srcPath) {
        return updatePackageDef(content, function(contentAsObject) {
            contentAsObject.version = localCfg.packageVersion;
            contentAsObject.name = "tns-definitions";
            contentAsObject.description = "NativeScript Module definitions";
            contentAsObject.license = "Apache-2.0";
        });
    }

    var getPackageVersion = function(packageFilePath) {
        packageContent = grunt.file.readJSON(packageFilePath);
        var buildVersion = process.env.PACKAGE_VERSION;
        if (!buildVersion) {
            return packageContent.version;
        }
        return packageContent.version + "-" + buildVersion;
    };

    var processAppFile = function(content, srcPath) {
        return content;
    };

    var getSubDirs = function(dir) {
        var allObjects = fs.readdirSync(dir);
        var allDirs = [];
        for (var i=0; i<allObjects.length; i++)
        {
            var currentObjName = allObjects[i];
            var currentObjPath = pathModule.join(dir, currentObjName);
            var stats = fs.statSync(currentObjPath);
            if (stats.isDirectory())
            {
                allDirs.push({name: currentObjName, path: currentObjPath});
            }
        }
        return allDirs;
    }

    var localCfg = {
        srcDir: ".",
        srcAppsDir: "./apps",
        packageJsonFilePath: "./package.json",
        outDir: "./bin/dist",
        outModulesDir: "./bin/dist/modules",
        outAppsDir: "./bin/dist/apps",
        outTsAppsDir: "./bin/dist/ts-apps",
        outDefinitionsDir: "./bin/dist/definitions",

        excludedModules: [
            "!./ui/slide-out/**/*.*"
        ]
    };
    localCfg.packageVersion = getPackageVersion(localCfg.packageJsonFilePath);
    localCfg.defaultExcludes = [
            "!" + localCfg.outDir + "/**/*.*",
            "!./node_modules/**/*.*",
            "!./bin/**/*.*",
            "!./build/**/*.*",
            "!./Deploy/**/*.*",
            "!./obj/**/*.*",
            "!./out/**/*.*",
            "!./.*/**/*.*"
        ];
    localCfg.typeScriptSrc = [
            "./**/*.ts"
        ].concat(localCfg.defaultExcludes).concat(localCfg.excludedModules);
    localCfg.typeScriptSrcForTsLint = localCfg.typeScriptSrc.concat([
        "!./ios.d.ts",
        "!./android17.d.ts",
        "!./libjs.d.ts"
    ]);

    grunt.initConfig({
        localCfg : localCfg,
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: {
                src: [localCfg.outDir]
            },
            typeScriptLeftovers: {
                expand: true,
                src: [
                    "./.baseDir.*",
                    "./_references.js",
                    "./**/*.map"
                ],
                cwd: localCfg.outModulesDir
            },
            readyAppFiles: {
                src: [localCfg.outModulesDir + "/apps/**"]
            }
        },
        copy: {
            jsLibs: {
                expand: true,
                src: [
                    "./js-libs/**/*.js",
                ],
                dest: "<%= localCfg.outModulesDir %>/",
                cwd: localCfg.srcDir
            },
            license: {
                expand: true,
                src: [
                    "./LICENSE",
                ],
                dest: "<%= localCfg.outModulesDir %>/",
                cwd: localCfg.srcDir
            },
            appLicense: {
                expand: true,
                src: ["./LICENSE"],
                cwd: localCfg.srcAppsDir,
                dest: "__dummy__"
            },
            definitionFiles: {
                src: [
                    localCfg.srcDir + "/**/*.d.ts",
                    //Exclude the d.ts files in the apps folder - these are part of the apps and are already packed there!
                    "!" + localCfg.srcDir + "/apps/**"
                ].concat(localCfg.defaultExcludes).concat(localCfg.excludedModules),
                dest: localCfg.outDefinitionsDir + "/",
                options: {
                    process: filterTypeScriptFiles
                }
            },
            modulesPackageDef: {
                src: localCfg.packageJsonFilePath,
                dest: localCfg.outModulesDir + "/",
                options: {
                    process: updateModulesPackageDef
                }
            },
            definitionsPackageDef: {
                src: localCfg.packageJsonFilePath,
                dest: localCfg.outDefinitionsDir + "/",
                options: {
                    process: updateDefinitionsPackageDef
                }
            },
            appPackageDef: {
                expand: true,
                flatten: true,
                src: "__app_package_json",
                dest:  "__dummy__",
                options: {
                    process: updateAppPackageDef
                }
            },
            childPackageFiles: {
                src: [
                    localCfg.srcDir + "/**/package.json",
                    "!./package.json",
                    "!./Deploy/**/*.*",
                    "!./bin/**/*.*",
                    "!./Tests/**/*.*",
                    "!" + localCfg.outDir + "/**/*.*"
                ].concat(localCfg.excludedModules),
                dest: localCfg.outModulesDir + "/"
            },
            rawAppsFiles: {
                expand: true,
                src: [
                    "**/*.*",
                    "**/*",
                    "!**/*.map",
                    "!**/*.ts"
                ],
                dest: localCfg.outAppsDir,
                cwd: localCfg.srcAppsDir,
                dot: true
            },
            readyAppFiles: {
                expand: true,
                src: ["./**/*.*"],
                dest: localCfg.outAppsDir + "/",
                cwd: localCfg.outModulesDir + "/apps/",
                options: {
                    process: processAppFile
                }
            },
            readyTsAppFiles: {
                expand: true,
                src: ["./**/*.*", "!./**/*.map"],
                dest: localCfg.outTsAppsDir + "/",
                cwd: localCfg.srcAppsDir
            },
            readyPackages: {
                expand: true,
                src: ["./**/*.tgz"],
                dest: localCfg.outDir + "/",
                cwd: localCfg.outDir,
                flatten: true
            }
        },
        ts: {
            build: {
                src: localCfg.typeScriptSrc,
                outDir: [localCfg.outModulesDir],
                options: {
                    module: "commonjs",
                    target: "es5",
                    sourceMap: false,
                    declaration: false,
                    removeComments: "<%= !grunt.option('leavecomments') || '' %>",
                    compiler: "node_modules/typescript/bin/tsc"
                }
            }
        },
        tslint: {
            build: {
                files: {
                    src: localCfg.typeScriptSrcForTsLint
                },
                options: {
                    configuration: grunt.file.readJSON("./build/tslint.json")
                }
            }
        },
        exec: {
            packModules: {
                cmd: "npm pack",
                cwd: localCfg.outModulesDir + "/"
            },
            packDefinitions: {
                cmd: "npm pack",
                cwd: localCfg.outDefinitionsDir + "/"
            },
            packApp: {
                cmd: "npm pack",
                cwd: "__dummy__"
            }
        },
        multidest: {
            copyLicenseFiles: {
                tasks: ["copy:appLicense"],
                dest: function() {
                    var apps = getSubDirs(localCfg.srcAppsDir);
                    var targetDirs = [];
                    apps.forEach(function(item){
                        targetDirs.push(pathModule.join(localCfg.outAppsDir, item.name));
                        targetDirs.push(pathModule.join(localCfg.outTsAppsDir, item.name));
                    });
                    return targetDirs;
                }()
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks("grunt-multi-dest");

    var cloneTasks = function(originalTasks, taskNameSuffix)
    {
        var clonedTasks = [];
        for(var i=0; i<originalTasks.length; i++)
        {
            var originalTask = originalTasks[i];

            var taskCfg = grunt.util._.clone(grunt.config(originalTask.name));
            var taskName = grunt.util._.clone(originalTask.name);
            taskName[1] = taskName[1] + "_" + taskNameSuffix;

            originalTask.specializeCfg(taskCfg, taskNameSuffix);

            clonedTasks.push({name: taskName, cfg: taskCfg});
        }
        return clonedTasks;
    }

    var enqueueTasks = function(tasks) {
        for (var i=0; i<tasks.length; i++) {
            var task = tasks[i];
            grunt.config(task.name, task.cfg);
            grunt.task.run(task.name.join(":"));
        }
    }

    grunt.registerTask("processEachApp", function(outAppsDir, pkgAppNameSuffix){
        var allapps = getSubDirs(localCfg.srcAppsDir);
        var tasks = [
            {
                name: ["copy", "appPackageDef"],
                specializeCfg: function (cfg, currentAppName) {
                    outAppDir = pathModule.join(outAppsDir, currentAppName);
                    var pkgFilePath = pathModule.join(outAppDir, "package.json");
                    cfg.src = pkgFilePath;
                    cfg.dest = outAppDir;
                    cfg.appName = currentApp.name + (pkgAppNameSuffix || "");
                }
            },
            {
                name: ["exec", "packApp"],
                specializeCfg: function(cfg, currentAppName) {
                    cfg.cwd = pathModule.join(outAppsDir, currentAppName);
                }
            }
        ];

        for (var j=0; j<allapps.length; j++)
        {
            var currentApp = allapps[j];
            var clonedTasks = cloneTasks(tasks, currentApp.name);

            enqueueTasks(clonedTasks);
        }
    });

    grunt.registerTask("tests", [
        "default"
    ]);

    grunt.registerTask("collect-apps-raw-files", [
        "copy:rawAppsFiles",
        "multidest:copyLicenseFiles"
    ]);

    // Does nothing to avoid copying the same files twice. Instead,
    //  the distribute-definition-files tasks copies the d.ts files
    //  from the source root directly to the output folder.
    grunt.registerTask("collect-definitions-raw-files", []);

    grunt.registerTask("collect-modules-raw-files", [
        "copy:jsLibs",
        "copy:license"
    ]);

    grunt.registerTask("compile-ts", [
        "ts:build",
        "clean:typeScriptLeftovers",
        "copy:childPackageFiles"
    ]);
    grunt.registerTask("distribute-apps-files", [
        "copy:readyAppFiles",
        "clean:readyAppFiles"
    ]);
    grunt.registerTask("distribute-ts-apps-files", [
        "copy:readyTsAppFiles"
    ]);
    grunt.registerTask("distribute-definition-files", [
        "copy:definitionFiles"
    ]);
    grunt.registerTask("pack-modules", [
        "copy:modulesPackageDef",
        "exec:packModules"
    ]);
    grunt.registerTask("pack-apps", [
        "processEachApp:" + localCfg.outAppsDir
    ]);
    grunt.registerTask("pack-ts-apps", [
        "processEachApp:" + localCfg.outTsAppsDir + ":-ts"
    ]);
    grunt.registerTask("pack-definitions", [
        "copy:definitionsPackageDef",
        "exec:packDefinitions"
    ]);
    grunt.registerTask("get-ready-packages", [
        "copy:readyPackages"
    ]);

    grunt.registerTask("default", ((typeof(grunt.option('runtslint')) != "undefined" && !grunt.option('runtslint')) ? [] : ["tslint:build"]).concat([
        "clean:build",

        "collect-apps-raw-files",
        "collect-definitions-raw-files",
        "collect-modules-raw-files",

        "compile-ts",
        "distribute-apps-files",
        "distribute-ts-apps-files",
        "distribute-definition-files",

        "pack-modules",
        "pack-apps",
        "pack-ts-apps",
        "pack-definitions",
        "get-ready-packages"
    ]));
};
