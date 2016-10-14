var tsconfig = require('./tsconfig.json');
var shelljs = require("shelljs");
var path = require("path");
var fs = require("fs");

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

    // Custom Functions
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
        return updatePackageDef(content, function(contentAsObject) {
            contentAsObject.version = localCfg.packageVersion;
        });
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

    var writeDtsFile = function writeDtsFile(dtsFiles, outDir, outFile) {
        var dtsLines = dtsFiles.map(function(dtsFile) {
            return '/// <reference path="' + dtsFile + '" />';
        });
        var combinedDtsPath = path.join(outDir, outFile);
        grunt.file.write(combinedDtsPath, dtsLines.join('\n'));
    }
    
    var generateModulesDts = function generateModulesDts(outDir, srcDir) {
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
            "!node-tests/**",
            "!org.nativescript.widgets.d.ts",
            "!android17.d.ts",
            "!**/*.android.d.ts",
            "!ios/**",
            "!lib.core.d.ts",
            "!lib.dom.d.ts",
            "!**/*.ios.d.ts",
            "!tns-core-modules.d.ts",
            "!tns-core-modules.es6.d.ts",
            "!tns-core-modules.es2016.d.ts",
            "!tns-core-modules.base.d.ts",
            "!references.d.ts",
            "!webworker.es2016.d.ts"
        ].concat(localCfg.defaultExcludes).concat(es6Excludes).concat(angularExcludes));
        dtsFiles.sort();

        writeDtsFile(dtsFiles, outDir, 'tns-core-modules/tns-core-modules.base.d.ts');
        var es6Files = angularConflicts.concat(['tns-core-modules.base.d.ts']);
        writeDtsFile(es6Files, outDir, 'tns-core-modules/tns-core-modules.es6.d.ts');
        var allFiles = angularConflicts.concat(nonES6Files).concat(['tns-core-modules.base.d.ts']);
        writeDtsFile(allFiles, outDir, 'tns-core-modules/tns-core-modules.d.ts');
    }

    // Configure localCfg
    var outDir = tsconfig.compilerOptions.outDir || "./bin/dist";
    var srcDir = ".";
    var tnsCoreModulesDir = path.join(srcDir, "tns-core-modules");;
    var srcAppDirs = ["tests/app", "apps/app"]; //Don't move the tests folder from index 0!
    var localCfg = {
        srcDir: srcDir,
        srcTnsCoreModules: tnsCoreModulesDir,
        packageJsonFilePath: path.join(tnsCoreModulesDir, "package.json"),
        srcAppDirs: srcAppDirs,
        srcTestsDir: srcAppDirs[0],
        outDir: outDir,
        outTnsCoreModules: path.join(outDir, "tns-core-modules"),
        outArticlesDir: path.join(outDir, "articles"),
        outApiRefDir: path.join(outDir, "apiref"),
    };

    var copyAppsSrc = [];
    for (var i = 0; i < localCfg.srcAppDirs.length; i++) {
        copyAppsSrc.push(localCfg.srcAppDirs[i] + "/**/*");
        copyAppsSrc.push("!" + localCfg.srcAppDirs[i] + "/**/*.map");
        copyAppsSrc.push("!" + localCfg.srcAppDirs[i] + "/**/*.ts");
    }
    
    var nodeTestEnv = JSON.parse(JSON.stringify(process.env));
    nodeTestEnv.NODE_PATH = localCfg.outTnsCoreModules;
    localCfg.nodeTestsDir = path.join(localCfg.outDir, 'node-tests');
    localCfg.mainPackageContent = grunt.file.readJSON(localCfg.packageJsonFilePath);
    localCfg.packageVersion = getPackageVersion(localCfg.packageJsonFilePath);
    localCfg.commitSHA = getCommitSha();
    localCfg.typeScriptSrc = [
        "**/*.ts",
        "!**/node_modules/**/*.*",
        "!**/platforms/**/*.*",
        "!bin/**/*.*",
        "!build/**/*.*",
        "!Deploy/**/*.*",
        "!out/**/*.*",
        "!.*/**/*.*",
        "!obj/**/*.*"
    ];
    localCfg.defaultExcludes = localCfg.typeScriptSrc.filter(function(item) { return /^!/.test(item); });
    localCfg.typeScriptSrcForTsLint = localCfg.typeScriptSrc.concat([
        "!tns-core-modules/libjs.d.ts",
        "!tns-core-modules/lib.core.es6.d.ts",
        "!tns-core-modules/lib.dom.d.ts",
        "!tns-core-modules.es2016.d.ts",
        "!tns-platform-declarations/**/*"
    ]);
    localCfg.srcTsdFiles = [
        "tns-core-modules/**/*.d.ts",
        "!tns-core-modules/ios/**",
        "!**/org.nativescript.widgets.d.ts",
        "!**/android17.d.ts",
        "!**/*.android.d.ts",
        "!**/ios.d.ts",
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

    // Config
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
                cwd: localCfg.srcTestsDir
            },
            license: {
                expand: true,
                src: [
                    "./LICENSE",
                ],
                dest: localCfg.outTnsCoreModules,
                cwd: localCfg.srcDir
            },
            definitionFiles: {
                src: [
                    "**/*.d.ts",
                    //Exclude the d.ts files in the apps folder - these are part of the apps and are already packed there!
                    "!node-tests/**",
                    "!org.nativescript.widgets.d.ts",
                    "!android17.d.ts",
                    "!**/*.android.d.ts",
                    "!ios.d.ts",
                    "!**/*.ios.d.ts"
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
            childPackageFiles: {
                expand: true,
                src: [
                    "**/package.json",
                    "!package.json",
                    "!bin/**/*.*",
                    "!**/node_modules/**/*.*",
                    "!**/platforms/**/*.*",
                    "!" + localCfg.outDir + "/**/*.*"
                ],
                dest: localCfg.outDir + "/"
            },
            apps: {
                expand: true,
                src: copyAppsSrc,
                dest: localCfg.outDir,
                dot: true
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
            buildNodeTests: {
                src: [
                    'tns-core-modules/js-libs/easysax/**/*.ts',
                    'tns-core-modules/module.d.ts',
                    'tns-core-modules/xml/**/*.ts',
                    'tns-core-modules/lib.core.d.ts',
                    'tns-core-modules/lib.dom.d.ts',
                    'tns-core-modules/es-collections.d.ts',
                    'tns-core-modules/declarations.d.ts',
                    'tns-core-modules/es6-promise.d.ts',
                    'node-tests/**/*.ts'
                ],
                outDir: localCfg.outDir,
                dest: localCfg.outDir,
                options: tsOptions
            },
            buildDts: {
                src: [
                    'tns-core-modules/**/*.d.ts',
                    '!org.nativescript.widgets.d.ts',
                    '!**/*.android.d.ts',
                    '!**/node_modules/**/*',
                    '!**/platforms/**/*',
                    '!bin/**/*',
                    '!**/references.d.ts',
                    '!tns-core-modules/references.d.ts',
                    '!tns-core-modules/android17.d.ts',
                    '!tns-core-modules/ios/**/*',
                    '!tns-core-modules/org.nativescript.widgets.d.ts',
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
                options: Object.assign({}, tsOptions, { noLib: false })
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
            mochaNode: {
                cmd: "grunt simplemocha:node"
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
                    "theme": '<%= grunt.option("theme") || "./node_modules/nativescript-typedoc-theme" %>',
                    "name": 'NativeScript',
                    "includeDeclarations": undefined,
                    "experimentalDecorators": undefined,
                    "mode": "file",
                    "tsconfig": "tsconfig.typedoc.json"
                },
                src: "tns-core-modules/tns-core-modules.d.ts"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks("grunt-tslint");
    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-simple-mocha");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks('grunt-typedoc');

    // Register Tasks
    grunt.registerTask("collect-modules-raw-files", [
        "copy:jsLibs",
        "copy:license"
    ]);

    grunt.registerTask("compile-ts", [
        "ts:buildDts",
        "ts:build",
        "clean:typeScriptLeftovers",
        "copy:childPackageFiles"
    ]);

    function validatePackageJsons(fileValidator, errorFormatter) {
        var packageDescriptors = grunt.file.expand({}, [
            'tns-core-modules/**/package.json',
            '!tns-core-modules/node_modules/**/*'
        ]);
        var errors = packageDescriptors.map(function(packagePath) {
            if (fileValidator(packagePath)) {
                return errorFormatter(packagePath);
            } else {
                return null;
            }
        }).filter(function(errorMessage) { return !!errorMessage; });
        if (errors.length > 0)
            grunt.fail.fatal("\n" + errors.join("\n"));
    }

    grunt.registerTask("check-packagejson-boms", function() {
        validatePackageJsons(function (filepath) {
            var buf = grunt.file.read(filepath, { encoding: null });
            return (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF);
        }, function(filepath) {
                return "File " + filepath + " contains a UTF-8 BOM.";
        });
    });

    grunt.registerTask("check-packagejson-mains", function() {
        validatePackageJsons(function (filepath) {
            var packageData = grunt.file.readJSON(filepath);
            return /\.js/i.test(packageData.main || "");
        }, function(filepath) {
            return "File " + filepath + " contains a broken main setting.";
        });
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
    
    grunt.registerTask("compile-modules", [
        "clean:build",
        "shell:getGitSHA",
        "check-packagejson-boms",
        "check-packagejson-mains",
        "compile-ts",
        "collect-modules-raw-files",
        "copy:definitionFiles",
        "copy:jsLibs",
        "generate-tns-core-modules-dts",
        "ts:testCombinedDts",
    ]);

    grunt.registerTask("node-tests", [
        "clean:nodeTests",
        "ts:buildNodeTests",
        "copy:childPackageFiles",
        "copy:jsLibs",
        "env:nodeTests",
        "exec:mochaNode", //spawn a new process to use the new NODE_PATH
    ]);

    grunt.registerTask("apiref", [
        "clean:apiref",
        "typedoc:build"
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

    grunt.registerTask("articles", [
        "clean:articles",
        "copy:articleMDs",
        "herdArticles"
    ]);

    grunt.registerTask("docs", [
        "apiref",
        "articles"
    ]);

    //alias just-build for backwards compatibility
    grunt.registerTask("just-build", ["build-all"]);

    grunt.registerTask("build-all", [
        "pack-modules",
        "copy:apps",
    ]);

    grunt.registerTask("pack-apps", function(){
        localCfg.srcAppDirs.forEach(function(srcAppDir){
            var outAppDir = path.join(localCfg.outDir, srcAppDir);
            var packageJsonPath = path.join(outAppDir, "package.json");
            var content = fs.readFileSync(packageJsonPath, "utf8");
            var newContent = updateAppPackageDef(content);
            fs.writeFileSync(packageJsonPath, newContent);
            shelljs.exec("npm pack", {cwd: outAppDir});
        });
    });
    
    grunt.registerTask("get-ready-packages", ["copy:readyPackages"]);

    grunt.registerTask("default", (skipTsLint ? [] : ["tslint:build"]).concat([
        "build-all",
        "pack-apps",
        "get-ready-packages"
    ]));
};
