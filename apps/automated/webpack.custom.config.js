const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpackConfig = require('./webpack.config');

module.exports = (env) => {
	env = env || {};
	const baseConfig = webpackConfig(env);

	baseConfig.plugins.push(new CopyWebpackPlugin({
		patterns: [
			{
				 from: 'ui/web-view/*.html',
				 globOptions: {
					 dot: false
				 }
			}
		]
	}))

	baseConfig.plugins.push(new webpack.DefinePlugin({
		__CI__: !!process.env.CI
	}))

	return baseConfig;
};
