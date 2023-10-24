const webpack = require("@nativescript/webpack");

const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = (env) => {
	webpack.init(env);

	webpack.Utils.addCopyRule('ui/web-view/*.html');

	webpack.chainWebpack(config => {
		config.plugin('DefinePlugin').tap(args => {
			Object.assign(args[0], {
				__CI__: !!process.env.CI,
			})

			return args
		  })

			config.plugin('CircularDependencyPlugin').use(CircularDependencyPlugin, [
				{
					// exclude detection of files based on a RegExp
					// exclude: /a\.js|node_modules/,
					// include specific files based on a RegExp
					// include: /application/,
					// add errors to webpack instead of warnings
					// failOnError: true,
					// allow import cycles that include an asyncronous import,
					// e.g. via import(/* webpackMode: "weak" */ './file.js')
					// allowAsyncCycles: false,
					// set the current working directory for displaying module paths
					// cwd: process.cwd(),
				}
			])
	})

	return webpack.resolveConfig();
};


