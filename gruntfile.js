var tsconfig = require('./tsconfig.json');
var shelljs = require("shelljs");
var path = require("path");
var fs=require("fs");

module.exports = function(grunt) {
    if (grunt.option('profile')) {
        grunt.log.writeln('Profiling all grunt tasks...');
        require('time-grunt')(grunt);
    }

    if (grunt.cli.tasks.indexOf("testsapp") >= 0 || grunt.cli.tasks.indexOf("buildOnlyTestsApp")>= 0 || grunt.cli.tasks.indexOf("runOnlyTestsApp")>= 0) {
        var tsTester = require("./build/run-testsapp.grunt.js");
        tsTester.run(grunt);
        return;
    }

    var tsLintOption = grunt.option('runtslint');
    var skipTsLint = tsLintOption == 'false' || tsLintOption == false;
    if (tsLintOption == null) {
        skipTsLint = false;
    }

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
    };

    var updateModulesPackageDef = function(content, srcPath) {
        console.log("Patch: " + srcPath);
        return updatePackageDef(content, function(contentAsObject) {
            contentAsObject.version = localCfg.packageVersion;
            if (localCfg.commitSHA) {
                contentAsObject.repository.url += "/commit/" + localCfg.commitSHA;
            }
        });
    };

    var updateAppPackageDef = function(content, srcPath) {
        var currentAppName = grunt.task.current.data.appName;
        return updatePackageDef(content, function(contentAsObject) {
            contentAsObject.version = localCfg.packageVersion;
            contentAsObject.author = "Telerik <support@telerik.com>";
            var specificKeywords = ["telerik", "mobile", "nativescript", "{N}", "tns", "appbuilder"];
            if (currentAppName.indexOf("template-") === 0) {
                var templateName = currentAppName.substring("template-".length);
                contentAsObject.name = "tns-" + currentAppName;
                contentAsObject.description = "Nativescript " + templateName + " project template";
                specificKeywords.push("template");
            }
            else {
                contentAsObject.name = "tns-samples-" + currentAppName;
                contentAsObject.description = "Nativescript " + currentAppName + " sample application";
                specificKeywords.push("sample");
            }
            contentAsObject.license = "BSD";
            addKeywords(contentAsObject, specificKeywords);

            if (!contentAsObject.repository) {
                contentAsObject.repository = {};
            }
            if (!contentAsObject.repository.url) {
                contentAsObject.repository.url = localCfg.mainPackageContent.repository.url;
            }
            if (localCfg.commitSHA) {
                contentAsObject.repository.url += "/commit/" + localCfg.commitSHA;
            }
        });
    };

    var addKeywords = function(packageObject, newKeywords) {
        if (!packageObject.keywords) {
            packageObject.keywords = newKeywords;
            return;
        }

        if (typeof(packageObject.keywords) == "string") {
            packageObject.keywords = packageObject.keywords.split(" ");
        }
        packageObject.keywords = packageObject.keywords.concat(newKeywords);
    };

    var getCommitSha = function() {
        if (process.env.GIT_COMMIT) {
            return process.env.GIT_COMMIT;
        }
        return "";
    };

    var assignGitSHA = function(err, stdout, stderr, cb) {
        if (!localCfg.commitSHA) {
            localCfg.commitSHA = stdout.replace("\n", "");
        }
        cb();
    };

    var getPackageVersion = function() {
        var buildVersion = process.env.PACKAGE_VERSION;
        if (!buildVersion) {
            return localCfg.mainPackageContent.version;
        }
        return localCfg.mainPackageContent.version + "-" + buildVersion;
    };

    var processAppFile = function(content, srcPath) {
        return content;
    };

    var getSubDirs = function(dir) {
        return shelljs.ls(dir).filter(function (subDir) {
            return shelljs.test('-d', path.join(dir, subDir));
        });
    };

    var getApps = function() {
        var allApps = getSubDirs(localCfg.srcAppsDir);
        if (grunt.option('test-app-only')) {
            allApps = allApps.filter(function(app) {
                return app === 'tests';
            });
        }
        return allApps;
    };

    var outDir = tsconfig.compilerOptions.outDir || "./bin/dist";
    var localCfg = {
        srcDir: ".",
        srcAppsDir: "./apps",
        srcAppsTestsDir: "./tests/app",
        srcTnsCoreModules: "./tns-core-modules",
        packageJsonFilePath: "./tns-core-modules/package.json",
        outArticlesDir: "./bin/dist/articles",
        outDir: outDir,
        outTnsCoreModules: path.join(outDir, "tns-core-modules"),
        outAppsDir: "./bin/dist/apps",
        outAppsTestsDir: "./bin/dist/tests/app",
        outTsAppsTestsDir: "./bin/dist/ts-tests/app",
        outTsAppsDir: "./bin/dist/ts-apps/app",
        outApiRefDir: "./bin/dist/apiref"
    };

    var nodeTestEnv = JSON.parse(JSON.stringify(process.env));
    nodeTestEnv.NODE_PATH = localCfg.outTnsCoreModules;

    localCfg.nodeTestsDir = path.join(localCfg.outDir, 'node-tests');

    localCfg.mainPackageContent = grunt.file.readJSON(localCfg.packageJsonFilePath);
    localCfg.packageVersion = getPackageVersion(localCfg.packageJsonFilePath);
    localCfg.commitSHA = getCommitSha();
    localCfg.typeScriptSrc = tsconfig.filesGlob;
    localCfg.defaultExcludes = localCfg.typeScriptSrc.filter(function(item) { return /^!/.test(item); });
    localCfg.typeScriptSrcForTsLint = localCfg.typeScriptSrc.concat([
        "!tns-core-modules/ios.d.ts",
        "!tns-core-modules/android17.d.ts",
        "!tns-core-modules/libjs.d.ts",
        "!tests/node_modules/"
    ]);
    localCfg.srcTsdFiles = [
        "**/*.d.ts",
        "!apps/**",
        "!tests/**",
        "!node-tests/**",
        "!tns-core-modules/org.nativescript.widgets.d.ts",
        "!tns-core-modules/android17.d.ts",
        "!**/*.android.d.ts",
        "!tns-core-modules/ios.d.ts",
        "!**/*.ios.d.ts"
    ].concat(localCfg.defaultExcludes);

    var tsOptions = tsconfig.compilerOptions;
    tsOptions.fast = 'never';
    tsOptions.removeComments = !grunt.option('leavecomments') || '';
    tsOptions.compiler = "node_modules/typescript/bin/tsc";
    tsOptions.failOnTypeErrors = true;
    tsOptions.outDir = localCfg.outDir;
    var removeCommentsArgument = tsOptions.removeComments ? " --removeComments" : "";
    tsOptions.additionalFlags = "--outDir " + localCfg.outDir + removeCommentsArgument;

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
                    ".baseDir.*",
                    "_references.js",
                    "**/*.map"
                ],
                cwd: localCfg.outDir
            },
            nodeTests: {
                src: localCfg.nodeTestsDir,
            },
            builtModules: {
                src: localCfg.outDir
            },
            externalModules: {
                expand: true,
                src: '<%= grunt.option("path") %>/node_modules/tns-core-modules/**/*',
                options: {
                    force: true
                },
            },
            articles: {
                src: [ localCfg.outArticlesDir ]
            },
            "apiref": {
                src: [ localCfg.outApiRefDir ]
            }
        },
        copy: {
            jsLibs: {
                expand: true,
                src: [
                    "tns-core-modules/js-libs/**/*.js",
                    "tns-core-modules/fetch/**/*.js",
                    "tns-core-modules/css/**/*.js",
                    "tns-core-modules/css-value/**/*.js",
                ],
                dest: localCfg.outDir,
                cwd: localCfg.srcDir
            },
            articleMDs: {
                expand: true,
                src: [ "**/*.md" ],
                dest: localCfg.outArticlesDir,
                cwd: localCfg.srcAppsTestsDir
            },
            license: {
                expand: true,
                src: [
                    "./LICENSE",
                ],
                dest: localCfg.outTnsCoreModules,
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
                    "**/*.d.ts",
                    //Exclude the d.ts files in the apps folder - these are part of the apps and are already packed there!
                    "!apps/**",
                    "!ts-apps/**",
                    "!node-tests/**",
                    "!org.nativescript.widgets.d.ts",
                    "!android17.d.ts",
                    "!**/*.android.d.ts",
                    "!ios.d.ts",
                    "!**/*.ios.d.ts",
                ].concat(localCfg.defaultExcludes),
                dest: localCfg.outDir + "/",
                expand: true,
                options: {
                    process: filterTypeScriptFiles
                }
            },
            modulesPackageDef: {
                expand: true,
                src: path.basename(localCfg.packageJsonFilePath),
                cwd: path.dirname(localCfg.packageJsonFilePath),
                dest: localCfg.outTnsCoreModules + "/",
                options: {
                    process: updateModulesPackageDef
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
                expand: true,
                src: [
                    "**/package.json",
                    "!package.json",
                    "!Deploy/**/*.*",
                    "!bin/**/*.*",
                    "!Tests/**/*.*",
                    "!node_modules/**/*.*",
                    "!" + localCfg.outDir + "/**/*.*"
                ],
                dest: localCfg.outDir + "/"
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
            rawTestsFiles: {
                expand: true,
                src: [
                    "**/*.*",
                    "**/*",
                    "!**/*.map",
                    "!**/*.ts"
                ],
                dest: localCfg.outAppsTestsDir,
                cwd: localCfg.srcAppsTestsDir,
                dot: true
            },
            readyAppFiles: {
                expand: true,
                src: ["./**/*.*"],
                dest: localCfg.outAppsDir + "/",
                cwd: localCfg.outDir + "/apps/",
                // WARNING: Why not insert BOMs in .png files?
                // options: {
                //     process: processAppFile
                // }
            },
            readyTsAppFiles: {
                expand: true,
                src: ["./**/*.*", "!./**/*.map"],
                dest: localCfg.outTsAppsDir + "/",
                cwd: localCfg.srcAppsDir
            },
            readyTsAppsTestsFiles: {
                expand: true,
                src: ["./**/*.*", "!./**/*.map"],
                dest: localCfg.outTsAppsTestsDir + "/",
                cwd: localCfg.srcAppsTestsDir
            },
            readyPackages: {
                expand: true,
                src: ["./**/*.tgz"],
                dest: localCfg.outDir + "/",
                cwd: localCfg.outDir,
                flatten: true
            },
            builtModules: {
                expand: true,
                src: [
                    '**/*',
                    '!*.md',
                    '!apps/**/*',
                    '!node_modules/**/*',
                    '!node-tests/**/*',
                ],
                cwd: localCfg.outDir,
                dest: "<%= grunt.option('path') %>/node_modules/tns-core-modules/",
            }
        },
        ts: {
            build: {
                tsconfig: {
                    tsconfig: 'tsconfig.json',
                    passThrough: true,
                },
                outDir: localCfg.outDir,
                dest: localCfg.outDir,
                options: tsOptions
            },
            "build-inplace": {
                tsconfig: {
                    tsconfig: 'tsconfig.json',
                    passThrough: true,
                },
                options: {
                    additionalFlags: "--sourceMap"
                }
            },
            buildNodeTests: {
                src: [
                    'tns-core-modules/js-libs/easysax/**/*.ts',
                    'tns-core-modules/module.d.ts',
                    'tns-core-modules/xml/**/*.ts',
                    'tns-core-modules/es-collections.d.ts',
                    'node-tests/**/*.ts',
                ],
                outDir: localCfg.outDir,
                dest: localCfg.outDir,
                options: tsOptions
            },
            buildDts: {
                src: [
                    '**/*.d.ts',
                    '!org.nativescript.widgets.d.ts',
                    '!**/*.android.d.ts',
                    '!node_modules/**/*',
                    '!tests/node_modules/**/*.*',
                    '!bin/**/*',
                    '!apps/**/*',
                    '!android17.d.ts',
                    '!ios.d.ts',
                ],
                outDir: localCfg.outDir,
                dest: localCfg.outDir,
                options: tsOptions
            },
            testCombinedDts: {
                src: [
                    path.join(localCfg.outTnsCoreModules, 'tns-core-modules.d.ts'),
                ],
                outDir: localCfg.outDir,
                dest: localCfg.outDir,
                options: tsOptions
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
                cwd: localCfg.outTnsCoreModules + "/"
            },
            packApp: {
                cmd: "npm pack",
                cwd: "__dummy__"
            },
            mochaNode: {
                cmd: "grunt simplemocha:node"
            },
            injectArticleSnippets: {
                cmd: "node node_modules/markdown-snippet-injector/index.js --root=<%= localCfg.srcAppsTestsDir %> --docsroot=<%= localCfg.outArticlesDir %>"
            }
        },
        multidest: {
            copyLicenseFiles: {
                tasks: ["copy:appLicense"],
                dest: function() {
                    var apps = getApps();
                    var targetDirs = [];
                    apps.forEach(function(item){
                        targetDirs.push(path.join(localCfg.outAppsDir, item));
                        targetDirs.push(path.join(localCfg.outTsAppsDir, item));
                    });
                    targetDirs.push(localCfg.outAppsTestsDir);
                    targetDirs.push(localCfg.outTsAppsTestsDir);
                    return targetDirs;
                }()
            }
        },
        shell: {
            getGitSHA: {
                command: "git rev-parse HEAD",
                options: {
                    callback: assignGitSHA
                }
            },
        },
        simplemocha: {
            node: {
                src: localCfg.nodeTestsDir + '/**/*.js'
            }
        },
        env: {
            nodeTests: {
                NODE_PATH: nodeTestEnv.NODE_PATH,
            }
        },
        typedoc: {
            build: {
                options: {
                    "module": 'commonjs',
                    "target": 'es5',
                    "out": '<%= grunt.option("out") || localCfg.outApiRefDir %>',
                    "theme": '<%= grunt.option("theme") || "default" %>',
                    "name": 'NativeScript',
                    "includeDeclarations": undefined,
                    "experimentalDecorators": undefined,
                    "mode": "file"
                },
                src: localCfg.srcTsdFiles
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks("grunt-multi-dest");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-simple-mocha");
    grunt.loadNpmTasks('grunt-typedoc');

    var cloneTasks = function(originalTasks, app) {
        var clonedTasks = [];
        for(var i=0; i<originalTasks.length; i++) {
            var originalTask = originalTasks[i];

            var taskCfg = grunt.util._.clone(grunt.config(originalTask.name));
            var taskName = grunt.util._.clone(originalTask.name);
            taskName[1] = taskName[1] + "_" + app;

            originalTask.specializeCfg(taskCfg, app);

            clonedTasks.push({name: taskName, cfg: taskCfg});
        }
        return clonedTasks;
    };

    var enqueueTasks = function(tasks) {
        for (var i=0; i<tasks.length; i++) {
            var task = tasks[i];
            grunt.config(task.name, task.cfg);
            grunt.task.run(task.name.join(":"));
        }
    };
    function writeDtsFile(dtsFiles, outDir, outFile) {
        var dtsLines = dtsFiles.map(function(dtsFile) {
            return '/// <reference path="' + dtsFile + '" />';
        });
        var combinedDtsPath = path.join(outDir, outFile);
        grunt.file.write(combinedDtsPath, dtsLines.join('\n'));
    }
    function generateModulesDts(outDir, srcDir) {
        var angularConflicts = ['module.d.ts'];
        var angularExcludes = angularConflicts.map(function(file) {
            return '!' + file;
        });
        var nonES6Files = [
            'es-collections.d.ts',
            'es6-promise.d.ts',
            'es6.d.ts',
            'weakmap.d.ts',
        ];
        var es6Excludes = nonES6Files.map(function(file) {
            return '!' + file;
        });
        var dtsFiles = grunt.file.expand({cwd: srcDir }, [
            "**/*.d.ts",
            //Exclude the d.ts files in the apps folder - these are part of the apps and are already packed there!
            "!apps/**",
            "!tests/**",
            "!ts-apps/**",
            "!node-tests/**",
            "!org.nativescript.widgets.d.ts",
            "!android17.d.ts",
            "!**/*.android.d.ts",
            "!ios.d.ts",
            "!**/*.ios.d.ts",
            "!tns-core-modules.d.ts",
            "!tns-core-modules.es6.d.ts",
            "!tns-core-modules.base.d.ts"
        ].concat(localCfg.defaultExcludes).concat(es6Excludes).concat(angularExcludes));
        dtsFiles.sort();

        writeDtsFile(dtsFiles, outDir, 'tns-core-modules/tns-core-modules.base.d.ts');
        var es6Files = angularConflicts.concat(['tns-core-modules.base.d.ts']);
        writeDtsFile(es6Files, outDir, 'tns-core-modules/tns-core-modules.es6.d.ts');
        var allFiles = angularConflicts.concat(nonES6Files).concat(['tns-core-modules.base.d.ts']);
        writeDtsFile(allFiles, outDir, 'tns-core-modules/tns-core-modules.d.ts');
    }

    grunt.registerTask("processTestsApp", function(outTestsAppDir, pkgAppNameSuffix) {
        var tasks = [
            {
                name: ["copy", "appPackageDef"],
                specializeCfg: function (cfg, app) {
                    cfg.src = path.join(outTestsAppDir, "package.json");
                    cfg.dest = outTestsAppDir;
                    cfg.appName = "tests" + (pkgAppNameSuffix || "");
                }
            },
            {
                name: ["exec", "packApp"],
                specializeCfg: function(cfg, app) {
                    cfg.cwd = outTestsAppDir;
                }
            }
        ];
        var clonedTasks = cloneTasks(tasks, "tests");
        enqueueTasks(clonedTasks);
    });

    grunt.registerTask("processEachApp", function(outAppsDir, pkgAppNameSuffix){
        var allApps = getApps();
        var tasks = [
            {
                name: ["copy", "appPackageDef"],
                specializeCfg: function (cfg, app) {
                    outAppDir = path.join(outAppsDir, app);
                    var pkgFilePath = path.join(outAppDir, "package.json");
                    cfg.src = pkgFilePath;
                    cfg.dest = outAppDir;
                    cfg.appName = app + (pkgAppNameSuffix || "");
                }
            },
            {
                name: ["exec", "packApp"],
                specializeCfg: function(cfg, app) {
                    cfg.cwd = path.join(outAppsDir, app);
                }
            }
        ];

        allApps.forEach(function (currentApp) {
            var clonedTasks = cloneTasks(tasks, currentApp);
            enqueueTasks(clonedTasks);
        });
    });

    grunt.registerTask("tests", [
        "default"
    ]);

    grunt.registerTask("collect-apps-raw-files", [
        "copy:rawAppsFiles",
        "copy:rawTestsFiles",
        "multidest:copyLicenseFiles"
    ]);

    grunt.registerTask("collect-modules-raw-files", [
        "copy:jsLibs",
        "copy:license"
    ]);

    grunt.registerTask("compile-dts", ["ts:buildDts"]);

    grunt.registerTask("compile-ts", [
        "compile-dts",
        "ts:build",
        "clean:typeScriptLeftovers",
        "copy:childPackageFiles"
    ]);
    grunt.registerTask("check-external-app", function() {
        var appPath = grunt.option('path');
        if (!appPath) {
            grunt.fail.fatal("External app option required. Pass the --path option.");
        }
        if (!grunt.file.exists(appPath)) {
            grunt.fail.fatal("External application path does not exist: " + appPath);
        }
    });
    grunt.registerTask("update-external-app", [
        "check-external-app",
        "clean:builtModules",
        "compile-modules",
        "clean:externalModules",
        "copy:builtModules"
    ]);
    grunt.registerTask("distribute-apps-files", [
            "copy:readyAppFiles"
    ]);
    grunt.registerTask("check-packagejson-boms", function() {
        function hasBOM(filepath) {
            var buf = grunt.file.read(filepath, { encoding: null });
            return (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF);
        }
        var packageDescriptors = grunt.file.expand({}, [
            '**/package.json',
            '!node_modules/**'
        ]);
        var errors = packageDescriptors.map(function(packagePath) {
            if (hasBOM(packagePath)) {
                return "File " + packagePath + " contains a UTF-8 BOM.";
            } else {
                return null;
            }
        }).filter(function(errorMessage) { return !!errorMessage; });
        if (errors.length > 0)
            grunt.fail.fatal("\n" + errors.join("\n"));
    });
    grunt.registerTask("distribute-ts-apps-files", [
            "copy:readyTsAppFiles",
            "copy:readyTsAppsTestsFiles"
    ]);
    grunt.registerTask("herdArticles", function() {
        var moveSinglesUp = function(dir) {
            var objs = fs.readdirSync(dir);
            for (var i=0; i<objs.length; i++) {
                var obj = objs[i];
                var fullPath = path.join(dir, obj);
                if (objs.length == 1) {
                    var parentDir = path.dirname(dir);
                    var newPath = path.join(parentDir, obj);
                    fs.renameSync(fullPath, newPath);
                    fs.rmdirSync(dir);
                } else {
                    var objStat = fs.statSync(fullPath);
                    if (objStat.isDirectory()) {
                        moveSinglesUp(fullPath);
                    }
                }
            }
        };

        moveSinglesUp(localCfg.outArticlesDir);
    });

    grunt.registerTask("generate-tns-core-modules-dev-dts", generateModulesDts.bind(null, ".", localCfg.srcTnsCoreModules));
    grunt.registerTask("generate-tns-core-modules-dts", generateModulesDts.bind(null, localCfg.outDir, localCfg.outTnsCoreModules));
    //aliasing pack-modules for backwards compatibility
    grunt.registerTask("pack-modules", [
        "compile-modules",
        "node-tests",
        "copy:modulesPackageDef",
        "exec:packModules"
    ]);
    grunt.registerTask("pack-apps", [
        "processTestsApp:" + localCfg.outAppsTestsDir,
        "processEachApp:" + localCfg.outAppsDir
    ]);
    grunt.registerTask("pack-ts-apps", [
        "processTestsApp:" + localCfg.outTsAppsTestsDir + ":-ts",
        "processEachApp:" + localCfg.outTsAppsDir + ":-ts"
    ]);
    grunt.registerTask("get-ready-packages", [
        "copy:readyPackages"
    ]);

    grunt.registerTask("default", (skipTsLint ? [] : ["tslint:build"]).concat([
        "build-all",

        "pack-apps",
        "pack-ts-apps",
        "get-ready-packages"
    ]));

    grunt.registerTask("compile-modules", [
        "clean:build",
        "shell:getGitSHA",
        "check-packagejson-boms",
        "compile-ts",
        "collect-modules-raw-files",
        "copy:definitionFiles",
        "copy:jsLibs",
        "generate-tns-core-modules-dts",
        "ts:testCombinedDts",
    ]);

    //alias just-build for backwards compatibility
    grunt.registerTask("just-build", ["build-all"]);

    grunt.registerTask("build-all", [
        "pack-modules",

        "collect-apps-raw-files",
        "distribute-apps-files",
        "distribute-ts-apps-files",
    ]);

    grunt.registerTask("node-tests", [
        "clean:nodeTests",
        "ts:buildNodeTests",
        "copy:childPackageFiles",
        "copy:jsLibs",
        "env:nodeTests",
        "exec:mochaNode", //spawn a new process to use the new NODE_PATH
    ]);

    grunt.registerTask("inplace", [
        "ts:build-inplace",
        "generate-tns-core-modules-dev-dts"
    ]);

    grunt.registerTask("apiref", [
        "clean:apiref",
        "typedoc:build"
    ]);

    grunt.registerTask("articles", [
        "clean:articles",
        "copy:articleMDs",
        "exec:injectArticleSnippets",
        "herdArticles"
    ]);

    grunt.registerTask("docs", [
        "apiref",
        "articles"
    ]);
};
