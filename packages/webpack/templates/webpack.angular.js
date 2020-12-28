const { join, relative, resolve, sep, dirname } = require('path');
const fs = require('fs');

const webpack = require('webpack');
const nsWebpack = require('@nativescript/webpack');
const nativescriptTarget = require('@nativescript/webpack/nativescript-target');
const {
  nsSupportHmrNg
} = require('@nativescript/webpack/transformers/ns-support-hmr-ng');
const { nsTransformNativeClassesNg } = require("@nativescript/webpack/transformers/ns-transform-native-classes-ng");
const {
  parseWorkspaceConfig, hasConfigurations
} = require('@nativescript/webpack/helpers/angular-config-parser');
const {
  getMainModulePath
} = require('@nativescript/webpack/utils/ast-utils');
const { getNoEmitOnErrorFromTSConfig, getCompilerOptionsFromTSConfig } = require("@nativescript/webpack/utils/tsconfig-utils");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const {
  NativeScriptWorkerPlugin
} = require('nativescript-worker-loader/NativeScriptWorkerPlugin');
const TerserPlugin = require('terser-webpack-plugin');
const {
  getAngularCompilerPlugin
} = require('@nativescript/webpack/plugins/NativeScriptAngularCompilerPlugin');
const hashSalt = Date.now().toString();

module.exports = env => {
  // Add your custom Activities, Services and other Android app components here.
  const appComponents = [
    "@nativescript/core/ui/frame", "@nativescript/core/ui/frame/activity"
  ];

  const platform = env && ((env.android && 'android') || (env.ios && 'ios'));
  if (!platform) {
    throw new Error('You need to provide a target platform!');
  }

  const AngularCompilerPlugin = getAngularCompilerPlugin(platform);
  const projectRoot = __dirname;

  // Default destination inside platforms/<platform>/...
  const dist = resolve(
    projectRoot,
    nsWebpack.getAppPath(platform, projectRoot)
  );

  const {
    // The 'appPath' and 'appResourcesPath' values are fetched from
    // the nsconfig.json configuration file
    // when bundling with `tns run android|ios --bundle`.
    appPath = 'src',
    appResourcesPath = 'App_Resources',

    // You can provide the following flags when running 'tns run android|ios'
    snapshot, // --env.snapshot,
    production, // --env.production
    configuration, // --env.configuration (consistent with angular cli usage)
    projectName, // --env.projectName (drive configuration through angular projects)
    uglify, // --env.uglify
    report, // --env.report
    sourceMap, // --env.sourceMap
    hiddenSourceMap, // --env.hiddenSourceMap
    hmr, // --env.hmr,
    unitTesting, // --env.unitTesting
    testing, // --env.testing
    verbose, // --env.verbose
    ci, // --env.ci
    snapshotInDocker, // --env.snapshotInDocker
    skipSnapshotTools, // --env.skipSnapshotTools
    compileSnapshot // --env.compileSnapshot
  } = env;

  const { fileReplacements, copyReplacements } = parseWorkspaceConfig(platform, configuration, projectName);

  const useLibs = compileSnapshot;
  const isAnySourceMapEnabled = !!sourceMap || !!hiddenSourceMap;
  const externals = nsWebpack.getConvertedExternals(env.externals);
  const appFullPath = resolve(projectRoot, appPath);
  const appResourcesFullPath = resolve(projectRoot, appResourcesPath);
  let tsConfigName = 'tsconfig.json';
  let tsConfigPath = resolve(projectRoot, tsConfigName);
  const tsConfigTnsName = 'tsconfig.tns.json';
  const tsConfigTnsPath = resolve(projectRoot, tsConfigTnsName);
  if (fs.existsSync(tsConfigTnsPath)) {
    // support shared angular app configurations 
    tsConfigName = tsConfigTnsName;
    tsConfigPath = tsConfigTnsPath;
  }
  const tsConfigEnvName = 'tsconfig.env.json';
  const tsConfigEnvPath = resolve(projectRoot, tsConfigEnvName);
  if (hasConfigurations(configuration) && fs.existsSync(tsConfigEnvPath)) {
    // when configurations are used, switch to environments supported config
    tsConfigName = tsConfigEnvName;
    tsConfigPath = tsConfigEnvPath;
  }
  const entryModule = `${nsWebpack.getEntryModule(appFullPath, platform)}.ts`;
  const entryPath = `.${sep}${entryModule}`;
  const entries = { bundle: entryPath };
  const areCoreModulesExternal =
    Array.isArray(env.externals) &&
    env.externals.some(e => e.indexOf('@nativescript') > -1);
  if (platform === 'ios' && !areCoreModulesExternal && !testing) {
    entries['tns_modules/@nativescript/core/inspector_modules'] =
      'inspector_modules';
  }

  const compilerOptions = getCompilerOptionsFromTSConfig(tsConfigPath);
  nsWebpack.processTsPathsForScopedModules({ compilerOptions });
  nsWebpack.processTsPathsForScopedAngular({ compilerOptions });

  const ngCompilerTransformers = [nsTransformNativeClassesNg];
  const additionalLazyModuleResources = [];

  const copyIgnore = { ignore: [`${relative(appPath, appResourcesFullPath)}/**`] };
  const copyTargets = [
    { from: { glob: 'assets/**', dot: false } },
    { from: { glob: 'fonts/**', dot: false } },
    ...copyReplacements,
  ];

  if (!production) {
    // for development purposes only
    // for example, include mock json folder
    // copyTargets.push({ from: 'tools/mockdata', to: 'assets/mockdata' });

    if (hmr) {
      ngCompilerTransformers.push(nsSupportHmrNg);
    }
  }

  // when "@angular/core" is external, it's not included in the bundles. In this way, it will be used
  // directly from node_modules and the Angular modules loader won't be able to resolve the lazy routes
  // fixes https://github.com/NativeScript/nativescript-cli/issues/4024
  if (env.externals && env.externals.indexOf('@angular/core') > -1) {
    const appModuleRelativePath = getMainModulePath(
      resolve(appFullPath, entryModule),
      tsConfigName
    );
    if (appModuleRelativePath) {
      const appModuleFolderPath = dirname(
        resolve(appFullPath, appModuleRelativePath)
      );
      // include the new lazy loader path in the allowed ones
      additionalLazyModuleResources.push(appModuleFolderPath);
    }
  }

  const ngCompilerPlugin = new AngularCompilerPlugin({
    hostReplacementPaths: nsWebpack.getResolver([platform, 'tns']),
    platformTransformers: ngCompilerTransformers.map(t =>
      t(() => ngCompilerPlugin, resolve(appFullPath, entryModule), projectRoot)
    ),
    mainPath: join(appFullPath, entryModule),
    tsConfigPath,
    skipCodeGeneration: false,
    sourceMap: !!isAnySourceMapEnabled,
    additionalLazyModuleResources: additionalLazyModuleResources,
    compilerOptions: { paths: compilerOptions.paths }
  });

  let sourceMapFilename = nsWebpack.getSourceMapFilename(
    hiddenSourceMap,
    __dirname,
    dist
  );

  const itemsToClean = [`${dist}/**/*`];
  if (platform === 'android') {
    itemsToClean.push(
      `${join(
        projectRoot,
        'platforms',
        'android',
        'app',
        'src',
        'main',
        'assets',
        'snapshots'
      )}`
    );
    itemsToClean.push(
      `${join(
        projectRoot,
        'platforms',
        'android',
        'app',
        'build',
        'configurations',
        'nativescript-android-snapshot'
      )}`
    );
  }

  const noEmitOnErrorFromTSConfig = getNoEmitOnErrorFromTSConfig(tsConfigName);

  nsWebpack.processAppComponents(appComponents, platform);
  const config = {
    mode: production ? 'production' : 'development',
    context: appFullPath,
    externals,
    watchOptions: {
      ignored: [
        appResourcesFullPath,
        // Don't watch hidden files
        '**/.*'
      ]
    },
    target: nativescriptTarget,
    entry: entries,
    output: {
      pathinfo: false,
      path: dist,
      sourceMapFilename,
      libraryTarget: 'commonjs2',
      filename: '[name].js',
      globalObject: 'global',
      hashSalt
    },
    resolve: {
      extensions: ['.ts', '.js', '.scss', '.css'],
      // Resolve {N} system modules from @nativescript/core
      modules: [
        resolve(__dirname, 'node_modules/@nativescript/core'),
        resolve(__dirname, 'node_modules'),
        'node_modules/@nativescript/core',
        'node_modules'
      ],
      alias: {
        '~/package.json': resolve(projectRoot, 'package.json'),
        '~': appFullPath,
        "tns-core-modules": "@nativescript/core",
        "nativescript-angular": "@nativescript/angular",
        ...fileReplacements
      },
      symlinks: true
    },
    resolveLoader: {
      symlinks: false
    },
    node: {
      // Disable node shims that conflict with NativeScript
      http: false,
      timers: false,
      setImmediate: false,
      fs: 'empty',
      __dirname: false
    },
    devtool: hiddenSourceMap
      ? 'hidden-source-map'
      : sourceMap
      ? 'inline-source-map'
      : 'none',
    optimization: {
      runtimeChunk: 'single',
      noEmitOnErrors: noEmitOnErrorFromTSConfig,
      splitChunks: {
        cacheGroups: {
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: (module, chunks) => {
              const moduleName = module.nameForCondition
                ? module.nameForCondition()
                : '';
              return (
                /[\\/]node_modules[\\/]/.test(moduleName) ||
                appComponents.some(comp => comp === moduleName)
              );
            },
            enforce: true
          }
        }
      },
      minimize: !!uglify,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          cache: !ci,
          sourceMap: isAnySourceMapEnabled,
          terserOptions: {
            output: {
              comments: false,
              semicolons: !isAnySourceMapEnabled
            },
            compress: {
              // The Android SBG has problems parsing the output
              // when these options are enabled
              collapse_vars: platform !== 'android',
              sequences: platform !== 'android',
              // custom
              drop_console: true,
              drop_debugger: true,
              ecma: 6,
              keep_infinity: platform === 'android', // for Chrome/V8
              reduce_funcs: platform !== 'android', // for Chrome/V8
              global_defs: {
                __UGLIFIED__: true
              }
            },
            // custom
            ecma: 6,
            safari10: platform !== 'android'
          }
        })
      ]
    },
    module: {
      rules: [
        {
          include: join(appFullPath, entryPath),
          use: [
            // Require all Android app components
            platform === 'android' && {
              loader: '@nativescript/webpack/helpers/android-app-components-loader',
              options: { modules: appComponents }
            },

            {
              loader: '@nativescript/webpack/bundle-config-loader',
              options: {
                angular: true,
                loadCss: !snapshot, // load the application css if in debug mode
                unitTesting,
                appFullPath,
                projectRoot,
                ignoredFiles: nsWebpack.getUserDefinedEntries(entries, platform)
              }
            }
          ].filter(loader => !!loader)
        },

        { test: /\.html$|\.xml$/, use: 'raw-loader' },

        {
          test: /[\/|\\]app\.css$/,
          use: [
              '@nativescript/webpack/helpers/style-hot-loader',
              {
                  loader: "@nativescript/webpack/helpers/css2json-loader",
                  options: { useForImports: true }
              },
          ],
        },
        {
          test: /[\/|\\]app\.scss$/,
          use: [
              '@nativescript/webpack/helpers/style-hot-loader',
              {
                  loader: "@nativescript/webpack/helpers/css2json-loader",
                  options: { useForImports: true }
              },
              'sass-loader',
          ],
        },

        // Angular components reference css files and their imports using raw-loader
        { test: /\.css$/, exclude: /[\/|\\]app\.css$/, use: 'raw-loader' },
        {
          test: /\.scss$/,
          exclude: /[\/|\\]app\.scss$/,
          use: ['raw-loader', 'resolve-url-loader', 'sass-loader']
        },

        {
          test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
          use: [
            '@nativescript/webpack/helpers/moduleid-compat-loader',
            '@nativescript/webpack/helpers/lazy-ngmodule-hot-loader',
            '@ngtools/webpack'
          ]
        },

        // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
        // Removing this will cause deprecation warnings to appear.
        {
          test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
          parser: { system: true }
        }
      ]
    },
    plugins: [
      // Define useful constants like TNS_WEBPACK
      new webpack.DefinePlugin({
        'global.TNS_WEBPACK': 'true',
        'global.isAndroid': platform === 'android',
        'global.isIOS': platform === 'ios',
        process: 'global.process'
      }),
      // Remove all files from the out dir.
      new CleanWebpackPlugin({ 
        cleanOnceBeforeBuildPatterns: itemsToClean,
        verbose: !!verbose
      }),
      // Copy assets
      new CopyWebpackPlugin([
        ...copyTargets,
        { from: { glob: '**/*.jpg', dot: false } },
        { from: { glob: '**/*.png', dot: false } },
      ], copyIgnore),
      new nsWebpack.GenerateNativeScriptEntryPointsPlugin('bundle'),
      // For instructions on how to set up workers with webpack
      // check out https://github.com/nativescript/worker-loader
      new NativeScriptWorkerPlugin(),
      ngCompilerPlugin,
      // Does IPC communication with the {N} CLI to notify events when running in watch mode.
      new nsWebpack.WatchStateLoggerPlugin()
    ]
  };

  if (report) {
    // Generate report files for bundles content
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        generateStatsFile: true,
        reportFilename: resolve(projectRoot, 'report', `report.html`),
        statsFilename: resolve(projectRoot, 'report', `stats.json`)
      })
    );
  }

  if (snapshot) {
    config.plugins.push(
      new nsWebpack.NativeScriptSnapshotPlugin({
        chunk: 'vendor',
        angular: true,
        requireModules: [
          'reflect-metadata',
          '@angular/platform-browser',
          '@angular/core',
          '@angular/common',
          '@angular/router',
          '@nativescript/angular'
        ],
        projectRoot,
        webpackConfig: config,
        snapshotInDocker,
        skipSnapshotTools,
        useLibs
      })
    );
  }

  if (!production && hmr) {
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return config;
};