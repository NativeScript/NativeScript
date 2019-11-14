const { join, relative, resolve, sep, dirname } = require("path");

const webpack = require("webpack");
const nsWebpack = require("nativescript-dev-webpack");
const nativescriptTarget = require("nativescript-dev-webpack/nativescript-target");
const { nsReplaceBootstrap } = require("nativescript-dev-webpack/transformers/ns-replace-bootstrap");
const { nsReplaceLazyLoader } = require("nativescript-dev-webpack/transformers/ns-replace-lazy-loader");
const { nsSupportHmrNg } = require("nativescript-dev-webpack/transformers/ns-support-hmr-ng");
const { getMainModulePath } = require("nativescript-dev-webpack/utils/ast-utils");
const { getNoEmitOnErrorFromTSConfig } = require("nativescript-dev-webpack/utils/tsconfig-utils");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { NativeScriptWorkerPlugin } = require("nativescript-worker-loader/NativeScriptWorkerPlugin");
const TerserPlugin = require("terser-webpack-plugin");
const { getAngularCompilerPlugin } = require("nativescript-dev-webpack/plugins/NativeScriptAngularCompilerPlugin");
const hashSalt = Date.now().toString();

module.exports = env => {
    // Add your custom Activities, Services and other Android app components here.
    const appComponents = [
        "tns-core-modules/ui/frame",
        "tns-core-modules/ui/frame/activity",
    ];

    const platform = env && (env.android && "android" || env.ios && "ios");
    if (!platform) {
        throw new Error("You need to provide a target platform!");
    }

    const AngularCompilerPlugin = getAngularCompilerPlugin(platform);
    const projectRoot = __dirname;

    // Default destination inside platforms/<platform>/...
    const dist = resolve(projectRoot, nsWebpack.getAppPath(platform, projectRoot));

    const {
        // The 'appPath' and 'appResourcesPath' values are fetched from
        // the nsconfig.json configuration file.
        appPath = "src",
        appResourcesPath = "App_Resources",

        // You can provide the following flags when running 'tns run android|ios'
        aot, // --env.aot
        snapshot, // --env.snapshot,
        production, // --env.production
        uglify, // --env.uglify
        report, // --env.report
        sourceMap, // --env.sourceMap
        hiddenSourceMap, // --env.hiddenSourceMap
        hmr, // --env.hmr,
        unitTesting, // --env.unitTesting
        verbose, // --env.verbose
        snapshotInDocker, // --env.snapshotInDocker
        skipSnapshotTools, // --env.skipSnapshotTools
        compileSnapshot // --env.compileSnapshot
    } = env;

    const useLibs = compileSnapshot;
    const isAnySourceMapEnabled = !!sourceMap || !!hiddenSourceMap;
    const externals = nsWebpack.getConvertedExternals(env.externals);
    const appFullPath = resolve(projectRoot, appPath);
    const appResourcesFullPath = resolve(projectRoot, appResourcesPath);
    const tsConfigName = "tsconfig.tns.json";
    const entryModule = `${nsWebpack.getEntryModule(appFullPath, platform)}.ts`;
    const entryPath = `.${sep}${entryModule}`;
    const entries = { bundle: entryPath };
    const areCoreModulesExternal = Array.isArray(env.externals) && env.externals.some(e => e.indexOf("tns-core-modules") > -1);
    if (platform === "ios" && !areCoreModulesExternal) {
        entries["tns_modules/tns-core-modules/inspector_modules"] = "inspector_modules";
    };

    const ngCompilerTransformers = [];
    const additionalLazyModuleResources = [];
    if (aot) {
        ngCompilerTransformers.push(nsReplaceBootstrap);
    }

    if (hmr) {
        ngCompilerTransformers.push(nsSupportHmrNg);
    }

    // when "@angular/core" is external, it's not included in the bundles. In this way, it will be used
    // directly from node_modules and the Angular modules loader won't be able to resolve the lazy routes
    // fixes https://github.com/NativeScript/nativescript-cli/issues/4024
    if (env.externals && env.externals.indexOf("@angular/core") > -1) {
        const appModuleRelativePath = getMainModulePath(resolve(appFullPath, entryModule), tsConfigName);
        if (appModuleRelativePath) {
            const appModuleFolderPath = dirname(resolve(appFullPath, appModuleRelativePath));
            // include the lazy loader inside app module
            ngCompilerTransformers.push(nsReplaceLazyLoader);
            // include the new lazy loader path in the allowed ones
            additionalLazyModuleResources.push(appModuleFolderPath);
        }
    }

    const ngCompilerPlugin = new AngularCompilerPlugin({
        hostReplacementPaths: nsWebpack.getResolver([platform, "tns"]),
        platformTransformers: ngCompilerTransformers.map(t => t(() => ngCompilerPlugin, resolve(appFullPath, entryModule), projectRoot)),
        mainPath: join(appFullPath, entryModule),
        tsConfigPath: join(__dirname, tsConfigName),
        skipCodeGeneration: !aot,
        sourceMap: !!isAnySourceMapEnabled,
        additionalLazyModuleResources: additionalLazyModuleResources
    });

    let sourceMapFilename = nsWebpack.getSourceMapFilename(hiddenSourceMap, __dirname, dist);

    const itemsToClean = [`${dist}/**/*`];
    if (platform === "android") {
        itemsToClean.push(`${join(projectRoot, "platforms", "android", "app", "src", "main", "assets", "snapshots")}`);
        itemsToClean.push(`${join(projectRoot, "platforms", "android", "app", "build", "configurations", "nativescript-android-snapshot")}`);
    }

    const noEmitOnErrorFromTSConfig = getNoEmitOnErrorFromTSConfig(join(projectRoot, tsConfigName));

    nsWebpack.processAppComponents(appComponents, platform);
    const config = {
        mode: production ? "production" : "development",
        context: appFullPath,
        externals,
        watchOptions: {
            ignored: [
                appResourcesFullPath,
                // Don't watch hidden files
                "**/.*",
            ]
        },
        target: nativescriptTarget,
        entry: entries,
        output: {
            pathinfo: false,
            path: dist,
            sourceMapFilename,
            libraryTarget: "commonjs2",
            filename: "[name].js",
            globalObject: "global",
            hashSalt
        },
        resolve: {
            extensions: [".ts", ".js", ".scss", ".css"],
            // Resolve {N} system modules from tns-core-modules
            modules: [
                resolve(__dirname, "node_modules/tns-core-modules"),
                resolve(__dirname, "node_modules"),
                "node_modules/tns-core-modules",
                "node_modules",
            ],
            alias: {
                '~': appFullPath
            },
            symlinks: true
        },
        resolveLoader: {
            symlinks: false
        },
        node: {
            // Disable node shims that conflict with NativeScript
            "http": false,
            "timers": false,
            "setImmediate": false,
            "fs": "empty",
            "__dirname": false,
        },
        devtool: hiddenSourceMap ? "hidden-source-map" : (sourceMap ? "inline-source-map" : "none"),
        optimization: {
            runtimeChunk: "single",
            noEmitOnErrors: noEmitOnErrorFromTSConfig,
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        name: "vendor",
                        chunks: "all",
                        test: (module, chunks) => {
                            const moduleName = module.nameForCondition ? module.nameForCondition() : '';
                            return /[\\/]node_modules[\\/]/.test(moduleName) ||
                                appComponents.some(comp => comp === moduleName);
                        },
                        enforce: true,
                    },
                }
            },
            minimize: !!uglify,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    cache: true,
                    sourceMap: isAnySourceMapEnabled,
                    terserOptions: {
                        output: {
                            comments: false,
                            semicolons: !isAnySourceMapEnabled
                        },
                        compress: {
                            // The Android SBG has problems parsing the output
                            // when these options are enabled
                            'collapse_vars': platform !== "android",
                            sequences: platform !== "android",
                        }
                    }
                })
            ],
        },
        module: {
            rules: [
                {
                    include: join(appFullPath, entryPath),
                    use: [
                        // Require all Android app components
                        platform === "android" && {
                            loader: "nativescript-dev-webpack/android-app-components-loader",
                            options: { modules: appComponents }
                        },

                        {
                            loader: "nativescript-dev-webpack/bundle-config-loader",
                            options: {
                                angular: true,
                                loadCss: !snapshot, // load the application css if in debug mode
                                unitTesting,
                                appFullPath,
                                projectRoot,
                                ignoredFiles: nsWebpack.getUserDefinedEntries(entries, platform)
                            }
                        },
                    ].filter(loader => !!loader)
                },

                { test: /\.html$|\.xml$/, use: "raw-loader" },

                {
                    test: /[\/|\\]app\.css$/,
                    use: [
                        "nativescript-dev-webpack/style-hot-loader",
                        {
                            loader: "nativescript-dev-webpack/css2json-loader",
                            options: { useForImports: true }
                        }
                    ]
                },
                {
                    test: /[\/|\\]app\.scss$/,
                    use: [
                        "nativescript-dev-webpack/style-hot-loader",
                        {
                            loader: "nativescript-dev-webpack/css2json-loader",
                            options: { useForImports: true }
                        },
                        "sass-loader"
                    ]
                },

                // Angular components reference css files and their imports using raw-loader
                { test: /\.css$/, exclude: /[\/|\\]app\.css$/, use: "raw-loader" },
                { test: /\.scss$/, exclude: /[\/|\\]app\.scss$/, use: ["raw-loader", "resolve-url-loader", "sass-loader"] },

                {
                    test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                    use: [
                        "nativescript-dev-webpack/moduleid-compat-loader",
                        "nativescript-dev-webpack/lazy-ngmodule-hot-loader",
                        "@ngtools/webpack",
                    ]
                },

                // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
                // Removing this will cause deprecation warnings to appear.
                {
                    test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
                    parser: { system: true },
                },
            ],
        },
        plugins: [
            // Define useful constants like TNS_WEBPACK
            new webpack.DefinePlugin({
                "global.TNS_WEBPACK": "true",
                "process": "global.process",
            }),
            // Remove all files from the out dir.
            new CleanWebpackPlugin(itemsToClean, { verbose: !!verbose }),
            // Copy assets to out dir. Add your own globs as needed.
            new CopyWebpackPlugin([
                { from: { glob: "fonts/**" } },
                { from: { glob: "**/*.jpg" } },
                { from: { glob: "**/*.png" } },
            ], { ignore: [`${relative(appPath, appResourcesFullPath)}/**`] }),
            new nsWebpack.GenerateNativeScriptEntryPointsPlugin("bundle"),
            // For instructions on how to set up workers with webpack
            // check out https://github.com/nativescript/worker-loader
            new NativeScriptWorkerPlugin(),
            ngCompilerPlugin,
            // Does IPC communication with the {N} CLI to notify events when running in watch mode.
            new nsWebpack.WatchStateLoggerPlugin(),
        ],
    };

    if (report) {
        // Generate report files for bundles content
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            generateStatsFile: true,
            reportFilename: resolve(projectRoot, "report", `report.html`),
            statsFilename: resolve(projectRoot, "report", `stats.json`),
        }));
    }

    if (snapshot) {
        config.plugins.push(new nsWebpack.NativeScriptSnapshotPlugin({
            chunk: "vendor",
            angular: true,
            requireModules: [
                "reflect-metadata",
                "@angular/platform-browser",
                "@angular/core",
                "@angular/common",
                "@angular/router",
                "nativescript-angular/platform-static",
                "nativescript-angular/router",
            ],
            projectRoot,
            webpackConfig: config,
            snapshotInDocker,
            skipSnapshotTools,
            useLibs
        }));
    }

    if (hmr) {
        config.plugins.push(new webpack.HotModuleReplacementPlugin());
    }

    return config;
};
