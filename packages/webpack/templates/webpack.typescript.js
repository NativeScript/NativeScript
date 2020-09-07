const { join, relative, resolve, sep } = require("path");
const fs = require('fs');

const webpack = require("webpack");
const nsWebpack = require("@nativescript/webpack");
const nativescriptTarget = require("@nativescript/webpack/nativescript-target");
const { getNoEmitOnErrorFromTSConfig } = require("@nativescript/webpack/utils/tsconfig-utils");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { NativeScriptWorkerPlugin } = require("nativescript-worker-loader/NativeScriptWorkerPlugin");
const TerserPlugin = require("terser-webpack-plugin");
const hashSalt = Date.now().toString();

module.exports = env => {
    // Add your custom Activities, Services and other Android app components here.
    const appComponents = env.appComponents || [];
    appComponents.push(...[
        "@nativescript/core/ui/frame",
        "@nativescript/core/ui/frame/activity",
    ]);

    const platform = env && (env.android && "android" || env.ios && "ios" || env.platform);
    if (!platform) {
        throw new Error("You need to provide a target platform!");
    }

    const platforms = ["ios", "android"];
    const projectRoot = __dirname;

    if (env.platform) {
        platforms.push(env.platform);
    }

    // Default destination inside platforms/<platform>/...
    const dist = resolve(projectRoot, nsWebpack.getAppPath(platform, projectRoot));

    const {
        // The 'appPath' and 'appResourcesPath' values are fetched from
        // the nsconfig.json configuration file.
        appPath = "src",
        appResourcesPath = "App_Resources",

        // You can provide the following flags when running 'tns run android|ios'
        snapshot, // --env.snapshot
        production, // --env.production
        uglify, // --env.uglify
        report, // --env.report
        sourceMap, // --env.sourceMap
        hiddenSourceMap, // --env.hiddenSourceMap
        hmr, // --env.hmr,
        unitTesting, // --env.unitTesting,
        testing, // --env.testing
        verbose, // --env.verbose
        snapshotInDocker, // --env.snapshotInDocker
        skipSnapshotTools, // --env.skipSnapshotTools
        compileSnapshot // --env.compileSnapshot
    } = env;

    const useLibs = compileSnapshot;
    const isAnySourceMapEnabled = !!sourceMap || !!hiddenSourceMap;
    const externals = nsWebpack.getConvertedExternals(env.externals);

    let appFullPath = resolve(projectRoot, appPath);
    if (!fs.existsSync(appFullPath)) {
      // some apps use 'app' directory
      appFullPath = resolve(projectRoot, 'app');
    }
    const hasRootLevelScopedModules = nsWebpack.hasRootLevelScopedModules({ projectDir: projectRoot });
    let coreModulesPackageName = "tns-core-modules";
    const alias = env.alias || {};
    alias['~/package.json'] = resolve(projectRoot, 'package.json');
    alias['~'] = appFullPath;

    if (hasRootLevelScopedModules) {
        coreModulesPackageName = "@nativescript/core";
        alias["tns-core-modules"] = coreModulesPackageName;
    }
    const appResourcesFullPath = resolve(projectRoot, appResourcesPath);

    const copyIgnore = { ignore: [`${relative(appPath, appResourcesFullPath)}/**`] };

    const entryModule = nsWebpack.getEntryModule(appFullPath, platform);
    const entryPath = `.${sep}${entryModule}.ts`;
    const entries = env.entries || {};
    entries.bundle = entryPath;

    const tsConfigPath = resolve(projectRoot, "tsconfig.json");

    const areCoreModulesExternal = Array.isArray(env.externals) && env.externals.some(e => e.indexOf("@nativescript") > -1);
    if (platform === "ios" && !areCoreModulesExternal && !testing) {
        entries["tns_modules/@nativescript/core/inspector_modules"] = "inspector_modules";
    };

    let sourceMapFilename = nsWebpack.getSourceMapFilename(hiddenSourceMap, __dirname, dist);

    const itemsToClean = [`${dist}/**/*`];
    if (platform === "android") {
        itemsToClean.push(`${join(projectRoot, "platforms", "android", "app", "src", "main", "assets", "snapshots")}`);
        itemsToClean.push(`${join(projectRoot, "platforms", "android", "app", "build", "configurations", "nativescript-android-snapshot")}`);
    }

    const noEmitOnErrorFromTSConfig = getNoEmitOnErrorFromTSConfig(tsConfigPath);

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
            // Resolve {N} system modules from @nativescript/core
            modules: [
                resolve(__dirname, `node_modules/${coreModulesPackageName}`),
                resolve(__dirname, "node_modules"),
                `node_modules/${coreModulesPackageName}`,
                "node_modules",
            ],
            alias,
            // resolve symlinks to symlinked modules
            symlinks: true
        },
        resolveLoader: {
            // don't resolve symlinks to symlinked loaders
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
                            loader: "@nativescript/webpack/helpers/android-app-components-loader",
                            options: { modules: appComponents }
                        },

                        {
                            loader: "@nativescript/webpack/bundle-config-loader",
                            options: {
                                loadCss: !snapshot, // load the application css if in debug mode
                                unitTesting,
                                appFullPath,
                                projectRoot,
                                ignoredFiles: nsWebpack.getUserDefinedEntries(entries, platform)
                            }
                        },
                    ].filter(loader => !!loader)
                },

                {
                    test: /\.(ts|css|scss|html|xml)$/,
                    use: "@nativescript/webpack/hmr/hot-loader"
                },

                { test: /\.(html|xml)$/, use: "@nativescript/webpack/helpers/xml-namespace-loader" },

                {
                    test: /\.css$/,
                    use: "@nativescript/webpack/helpers/css2json-loader"
                },

                {
                    test: /\.scss$/,
                    use: [
                        "@nativescript/webpack/helpers/css2json-loader",
                        "sass-loader"
                    ]
                },

                {
                    test: /\.ts$/,
                    use: {
                        loader: "ts-loader",
                        options: {
                            configFile: tsConfigPath,
                            // https://github.com/TypeStrong/ts-loader/blob/ea2fcf925ec158d0a536d1e766adfec6567f5fb4/README.md#faster-builds
                            // https://github.com/TypeStrong/ts-loader/blob/ea2fcf925ec158d0a536d1e766adfec6567f5fb4/README.md#hot-module-replacement
                            transpileOnly: true,
                            allowTsInNodeModules: true,
                            compilerOptions: {
                                sourceMap: isAnySourceMapEnabled,
                                declaration: false
                            },
                            getCustomTransformers: (program) => ({
                                before: [
                                    require("@nativescript/webpack/transformers/ns-transform-native-classes").default
                                ]
                            })
                        },
                    }
                },
            ]
        },
        plugins: [
            // Define useful constants like TNS_WEBPACK
            new webpack.DefinePlugin({
                "global.TNS_WEBPACK": "true",
                "global.isAndroid": platform === 'android',
                "global.isIOS": platform === 'ios',
                "process": "global.process",
            }),
            // Remove all files from the out dir.
            new CleanWebpackPlugin({ 
              cleanOnceBeforeBuildPatterns: itemsToClean,
              verbose: !!verbose
            }),
            // Copy assets
            new CopyWebpackPlugin({
              patterns: [
                { from: 'assets/**', noErrorOnMissing: true, globOptions: { dot: false, ...copyIgnore } },
                { from: 'fonts/**', noErrorOnMissing: true, globOptions: { dot: false, ...copyIgnore } },
                { from: '**/*.jpg', noErrorOnMissing: true, globOptions: { dot: false, ...copyIgnore } },
                { from: '**/*.png', noErrorOnMissing: true, globOptions: { dot: false, ...copyIgnore } },
              ],
            }),
            new nsWebpack.GenerateNativeScriptEntryPointsPlugin("bundle"),
            // For instructions on how to set up workers with webpack
            // check out https://github.com/nativescript/worker-loader
            new NativeScriptWorkerPlugin(),
            new nsWebpack.PlatformFSPlugin({
                platform,
                platforms,
            }),
            // Does IPC communication with the {N} CLI to notify events when running in watch mode.
            new nsWebpack.WatchStateLoggerPlugin(),
            // https://github.com/TypeStrong/ts-loader/blob/ea2fcf925ec158d0a536d1e766adfec6567f5fb4/README.md#faster-builds
            // https://github.com/TypeStrong/ts-loader/blob/ea2fcf925ec158d0a536d1e766adfec6567f5fb4/README.md#hot-module-replacement
            new ForkTsCheckerWebpackPlugin({
              async: false,
              typescript: {
                configFile: tsConfigPath,
                memoryLimit: 4096,
                diagnosticOptions: {
                  syntactic: true,
                  semantic: true
                }
              }
            })
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
            requireModules: [
                "@nativescript/core/bundle-entry-points",
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
