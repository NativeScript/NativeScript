const { resolve, join  } = require("path");

const webpack = require("webpack");
const nsWebpack = require("nativescript-dev-webpack");
const nativescriptTarget = require("nativescript-dev-webpack/nativescript-target");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { NativeScriptWorkerPlugin } = require("nativescript-worker-loader/NativeScriptWorkerPlugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");

module.exports = env => {
    const platform = env && (env.android && "android" || env.ios && "ios");
    if (!platform) {
        throw new Error("You need to provide a target platform!");
    }
    const platforms = ["ios", "android"];
    const { snapshot, uglify, report } = env;

    const config = {
        context: resolve("./app"),
        target: nativescriptTarget,
        entry: {
            bundle: `./${nsWebpack.getEntryModule()}`,
            vendor: "./vendor"
        },
        output: {
            pathinfo: true,
            // Default destination inside platforms/<platform>/...
            path: resolve(nsWebpack.getAppPath(platform)),
            libraryTarget: "commonjs2",
            filename: "[name].js",
        },
        resolve: {
            extensions: [".ts", ".js", ".scss", ".css"],
            // Resolve {N} system modules from tns-core-modules
            modules: [
                "node_modules/tns-core-modules",
                "node_modules",
            ],
            alias: {
                '~': resolve("./app")
            },
            // don't resolve symlinks to symlinked modules
            symlinks: false
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
        },
        module: {
            rules: [
                { test: /\.(html|xml)$/, use: "raw-loader" },

                {
                    test: /\.css$/,
                    use: { loader: "css-loader", options: { minimize: false, url: false } }
                },

                {
                    test: /\.scss$/,
                    use: [
                        { loader: "css-loader", options: { minimize: false, url: false } },
                        "sass-loader"
                    ]
                },

                { test: /\.ts$/, use: "awesome-typescript-loader" }
            ]
        },
        plugins: [
            // Vendor libs go to the vendor.js chunk
            new webpack.optimize.CommonsChunkPlugin({
                name: ["vendor"],
            }),
            // Define useful constants like TNS_WEBPACK
            new webpack.DefinePlugin({
                "global.TNS_WEBPACK": "true",
            }),
            // Copy assets to out dir. Add your own globs as needed.
            new CopyWebpackPlugin([
                { from: "App_Resources/**" },
                { from: "fonts/**" },
                { from: "**/*.jpg" },
                { from: "**/*.png" },
                { from: "**/*.xml" },
            ]),
            // Generate a bundle starter script and activate it in package.json
            new nsWebpack.GenerateBundleStarterPlugin([
                "./vendor",
                "./bundle",
            ]),
            // Support for web workers since v3.2
            new NativeScriptWorkerPlugin(),
            new nsWebpack.PlatformFSPlugin({
                platform,
                platforms,
                // ignore: ["App_Resources"]
            }),
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
            reportFilename: join(__dirname, "report", `report.html`),
            statsFilename: join(__dirname, "report", `stats.json`),
        }));
    }
    if (snapshot) {
        config.plugins.push(new nsWebpack.NativeScriptSnapshotPlugin({
            chunk: "vendor",
            projectRoot: __dirname,
            webpackConfig: config,
            targetArchs: ["arm", "arm64", "ia32"],
            tnsJavaClassesOptions: { packages: ["tns-core-modules" ] },
            useLibs: false
        }));
    }
    if (uglify) {
        config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));

        // Work around an Android issue by setting compress = false
        const compress = platform !== "android";
        config.plugins.push(new UglifyJsPlugin({
            uglifyOptions: {
                mangle: { reserved: nsWebpack.uglifyMangleExcludes },
                compress,
            }
        }));
    }
    return config;
};
