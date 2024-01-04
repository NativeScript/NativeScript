const webpack = require("@nativescript/webpack");

module.exports = (env) => {
	webpack.init(env);

	webpack.chainWebpack(config => {
		config.plugin('DefinePlugin').tap(args => {
			Object.assign(args[0], {
				__CI__: !!process.env.CI,
			})

			return args
		  })
	})

	const config = webpack.resolveConfig();
	Object.assign(config.resolve.alias, {
		'@nativescript/core': '@akylas/nativescript'
	})
	return config;
};


