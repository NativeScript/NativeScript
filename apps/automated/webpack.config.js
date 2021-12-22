const webpack = require("@nativescript/webpack");

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
	})

	return webpack.resolveConfig();
};


