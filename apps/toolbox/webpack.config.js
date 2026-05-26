const webpack = require("@nativescript/webpack");
const path = require("path");

module.exports = (env) => {
	webpack.init(env);

	webpack.chainWebpack(config => {
		config.plugin('DefinePlugin').tap(args => {
			Object.assign(args[0], {
				__CI__: !!process.env.CI,
			})

			return args
		  })

		// Stub Windows-unsupported packages
		if (env.windows) {
			config.resolve.alias.set('@nativescript/imagepicker', path.resolve(__dirname, 'src/stubs/imagepicker.js'));
		}
	})

	return webpack.resolveConfig();
};


