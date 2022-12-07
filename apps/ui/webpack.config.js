const webpack = require("@nativescript/webpack");
const { ContextExclusionPlugin } = require('webpack')

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

	return webpack.resolveConfig();
};


