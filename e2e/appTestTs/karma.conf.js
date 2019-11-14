module.exports = function (config) {
  const options = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],


    // list of files / patterns to load in the browser
    files: ['app/tests/**/*.ts'],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [],

    customLaunchers: {
      android: {
        base: 'NS',
        platform: 'android'
      },
      ios: {
        base: 'NS',
        platform: 'ios'
      },
      ios_simulator: {
        base: 'NS',
        platform: 'ios',
        arguments: ['--emulator']
      }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  };

  setWebpackPreprocessor(config, options);
  setWebpack(config, options);

  config.set(options);
}

function setWebpackPreprocessor(config, options) {
  if (config && config.bundle) {
    if (!options.preprocessors) {
      options.preprocessors = {};
    }

    options.files.forEach(file => {
      if (!options.preprocessors[file]) {
        options.preprocessors[file] = [];
      }
      options.preprocessors[file].push('webpack');
    });
  }
}

function setWebpack(config, options) {
  if (config && config.bundle) {
    const env = {};
    env[config.platform] = true;
    env.sourceMap = config.debugBrk;
    env.appPath = config.appPath;
    options.webpack = require('./webpack.config')(env);
    delete options.webpack.entry;
    delete options.webpack.output.libraryTarget;
    const invalidPluginsForUnitTesting = ["GenerateBundleStarterPlugin", "GenerateNativeScriptEntryPointsPlugin"];
    options.webpack.plugins = options.webpack.plugins.filter(p => !invalidPluginsForUnitTesting.includes(p.constructor.name));
  }
}
