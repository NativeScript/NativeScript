var tsconfig = require('./tsconfig.json');
var shelljs = require("shelljs");
var path = require("path");

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

    var fs=require("fs");
    var pathModule=require("path");

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
            return shelljs.test('-d', pathModule.join(dir, subDir));
        });
    };

    var getApps = function() {
        var allApps = getSubDirs(localCfg.srcAppsDir);
        if (grunt.option('test-app-only')) {
            allApps = allApps.filter(function(appName) {
                return appName === 'tests';
            });
        }
        return allApps;
    };

    var localCfg = {
        srcDir: ".",
        srcAppsDir: "./apps",
        srcAppsTests: "./apps/tests",
        packageJsonFilePath: "./package.json",
        outDir: "./bin/dist",
        outArticlesDir: "./bin/dist/articles",
        outModulesDir: tsconfig.compilerOptions.outDir || "./bin/dist/modules",
        outAppsDir: "./bin/dist/apps",
        outTsAppsDir: "./bin/dist/ts-apps",
        outApiRefDir: "./bin/dist/apiref"
    };

    var nodeTestEnv = JSON.parse(JSON.stringify(process.env));
    nodeTestEnv.NODE_PATH = localCfg.outModulesDir;

    localCfg.nodeTestsDir = pathModule.join(localCfg.outModulesDir, 'node-tests');


    localCfg.mainPackageContent = grunt.file.readJSON(localCfg.packageJsonFilePath);
    localCfg.packageVersion = getPackageVersion(localCfg.packageJsonFilePath);
    localCfg.commitSHA = getCommitSha();
    localCfg.typeScriptSrc = tsconfig.filesGlob;
    localCfg.defaultExcludes = localCfg.typeScriptSrc.filter(function(item) { return /^!/.test(item); });
    localCfg.typeScriptSrcForTsLint = localCfg.typeScriptSrc.concat([
            "!ios.d.ts",
            "!android17.d.ts",
            "!libjs.d.ts"
    ]);
    localCfg.srcTsdFiles = [
        "**/*.d.ts",
        "!apps/**",
        "!node-tests/**",
        "!org.nativescript.widgets.d.ts",
        "!android17.d.ts",
        "!**/*.android.d.ts",
        "!ios.d.ts",
        "!**/*.ios.d.ts"
    ].concat(localCfg.defaultExcludes);

    var tsOptions = tsconfig.compilerOptions;
    tsOptions.fast = 'never';
    tsOptions.removeComments = !grunt.option('leavecomments') || '';
    tsOptions.compiler = "node_modules/typescript/bin/tsc";
    tsOptions.failOnTypeErrors = true;
    tsOptions.outDir = localCfg.outModulesDir;
    var removeCommentsArgument = tsOptions.removeComments ? " --removeComments" : "";
    tsOptions.additionalFlags = "--outDir " + localCfg.outModulesDir + removeCommentsArgument;

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
                cwd: localCfg.outModulesDir
            },
            nodeTests: {
                src: localCfg.nodeTestsDir,
            },
            builtModules: {
                src: localCfg.outModulesDir
            },
            externalModules: {
                expand: true,
                src: '<%= grunt.option("path") %>/node_modules/tns-core-modules/**/*',
                options: {
                    force: true
                },
            },
            readyAppFiles: {
                src: [localCfg.outModulesDir + "/apps/**"]
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
                    "js-libs/**/*.js",
                    "fetch/**/*.js",
                    "css/**/*.js",
                    "css-value/**/*.js",
                ],
                dest: localCfg.outModulesDir,
                cwd: localCfg.srcDir
            },
            articleMDs: {
                expand: true,
                src: [ "**/*.md" ],
                dest: localCfg.outArticlesDir,
                cwd: localCfg.srcAppsTests
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
                dest: localCfg.outModulesDir + "/",
                expand: true,
                options: {
                    process: filterTypeScriptFiles
                }
            },
            modulesPackageDef: {
                expand: true,
                src: localCfg.packageJsonFilePath,
                dest: localCfg.outModulesDir + "/",
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
                cwd: localCfg.outModulesDir,
                dest: "<%= grunt.option('path') %>/node_modules/tns-core-modules/",
            }
        },
        ts: {
            build: {
                tsconfig: {
                    tsconfig: 'tsconfig.json',
                    passThrough: true,
                },
                outDir: localCfg.outModulesDir,
                dest: localCfg.outModulesDir,
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
                        'js-libs/easysax/**/*.ts',
                        'module.d.ts',
                        'xml/**/*.ts',
                        'node-tests/**/*.ts',
                        'es-collections.d.ts',
                    ],
                outDir: localCfg.outModulesDir,
                dest: localCfg.outModulesDir,
                options: tsOptions
            },
            buildDts: {
                src: [
                    '**/*.d.ts',
                    '!org.nativescript.widgets.d.ts',
                    '!**/*.android.d.ts',
                    '!node_modules/**/*',
                    '!bin/**/*',
                    '!apps/**/*',
                    '!android17.d.ts',
                    '!ios.d.ts',
                ],
                outDir: localCfg.outModulesDir,
                dest: localCfg.outModulesDir,
                options: tsOptions
            },
            testCombinedDts: {
                src: [
                    pathModule.join(localCfg.outModulesDir, 'tns-core-modules.d.ts'),
                ],
                outDir: localCfg.outModulesDir,
                dest: localCfg.outModulesDir,
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
                cwd: localCfg.outModulesDir + "/"
            },
            packApp: {
                cmd: "npm pack",
                cwd: "__dummy__"
            },
            mochaNode: {
                cmd: "grunt simplemocha:node"
            },
            injectArticleSnippets: {
                cmd: "node node_modules/markdown-snippet-injector/index.js --root=<%= localCfg.srcAppsTests %> --docsroot=<%= localCfg.outArticlesDir %>"
            }
        },
        multidest: {
            copyLicenseFiles: {
                tasks: ["copy:appLicense"],
                dest: function() {
                    var apps = getApps();
                    var targetDirs = [];
                    apps.forEach(function(item){
                        targetDirs.push(pathModule.join(localCfg.outAppsDir, item));
                        targetDirs.push(pathModule.join(localCfg.outTsAppsDir, item));
                    });
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
                NODE_PATH: localCfg.outModulesDir,
            }
        },
        typedoc: {
            build: {
                options: {
                    // 'flag:undefined' will set flags without options.
                    "module": 'commonjs',
                    "target": 'es5',
                    "out": '<%= grunt.option("out") || localCfg.outApiRefDir %>',
                    "theme": '<%= grunt.option("theme") || "default" %>',
                    //"json": './dist/doc.json',
                    "name": 'NativeScript',
                    "includeDeclarations": undefined,
                    //"excludeExternals": undefined,
                    //"externalPattern": './declarations.d.ts',
                    "mode": "file",
                    //"readme": "source/README.md",
                    //"entryPoint": '"a-module"'
                    // verbose: undefined
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

    var cloneTasks = function(originalTasks, taskNameSuffix) {
        var clonedTasks = [];
        for(var i=0; i<originalTasks.length; i++) {
            var originalTask = originalTasks[i];

            var taskCfg = grunt.util._.clone(grunt.config(originalTask.name));
            var taskName = grunt.util._.clone(originalTask.name);
            taskName[1] = taskName[1] + "_" + taskNameSuffix;

            originalTask.specializeCfg(taskCfg, taskNameSuffix);

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
        var combinedDtsPath = pathModule.join(outDir, outFile);
        grunt.file.write(combinedDtsPath, dtsLines.join('\n'));
    }
    function generateModulesDts(outDir) {
        var angularConflicts = ['module.d.ts']
        var angularExcludes = angularConflicts.map(function(file) {
            return '!' + file;
        })
        var nonES6Files = [
            'es-collections.d.ts',
            'es6-promise.d.ts',
            'es6.d.ts',
            'weakmap.d.ts',
        ];
        var es6Excludes = nonES6Files.map(function(file) {
            return '!' + file;
        })
        var dtsFiles = grunt.file.expand({cwd: outDir}, [
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
            "!tns-core-modules.d.ts",
            "!tns-core-modules.es6.d.ts",
            "!tns-core-modules.base.d.ts",
        ].concat(localCfg.defaultExcludes).concat(es6Excludes).concat(angularExcludes));
        dtsFiles.sort();

        writeDtsFile(dtsFiles, outDir, 'tns-core-modules.base.d.ts');
        var es6Files = angularConflicts.concat(['tns-core-modules.base.d.ts']);
        writeDtsFile(es6Files, outDir, 'tns-core-modules.es6.d.ts');
        var allFiles = angularConflicts.concat(nonES6Files).concat(['tns-core-modules.base.d.ts']);
        writeDtsFile(allFiles, outDir, 'tns-core-modules.d.ts');
    };

    grunt.registerTask("processEachApp", function(outAppsDir, pkgAppNameSuffix){
        var allApps = getApps();
        if (grunt.option('test-app-only')) {
            allApps = allApps.filter(function(appName) {
                return appName === 'tests';
            });
        }
        var tasks = [
            {
                name: ["copy", "appPackageDef"],
                specializeCfg: function (cfg, currentAppName) {
                    outAppDir = pathModule.join(outAppsDir, currentAppName);
                    var pkgFilePath = pathModule.join(outAppDir, "package.json");
                    cfg.src = pkgFilePath;
                    cfg.dest = outAppDir;
                    cfg.appName = currentAppName + (pkgAppNameSuffix || "");
                }
            },
            {
                name: ["exec", "packApp"],
                specializeCfg: function(cfg, currentAppName) {
                    cfg.cwd = pathModule.join(outAppsDir, currentAppName);
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
            "copy:readyAppFiles",
            "clean:readyAppFiles"
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
            "copy:readyTsAppFiles"
    ]);
    grunt.registerTask("herdArticles", function() {
        var moveSinglesUp = function(dir) {
            var objs = fs.readdirSync(dir);
            for (var i=0; i<objs.length; i++) {
                var obj = objs[i];
                var fullPath = pathModule.join(dir, obj);
                if (objs.length == 1) {
                    var parentDir = pathModule.dirname(dir);
                    var newPath = pathModule.join(parentDir, obj);
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

    grunt.registerTask("generate-tns-core-modules-dev-dts", generateModulesDts.bind(null, "."));
    grunt.registerTask("generate-tns-core-modules-dts", generateModulesDts.bind(null, localCfg.outModulesDir));
    //aliasing pack-modules for backwards compatibility
    grunt.registerTask("pack-modules", [
        "compile-modules",
        "node-tests",
        "exec:packModules"
    ]);
    grunt.registerTask("pack-apps", [
        "processEachApp:" + localCfg.outAppsDir
    ]);
    grunt.registerTask("pack-ts-apps", [
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
        "copy:modulesPackageDef",
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
