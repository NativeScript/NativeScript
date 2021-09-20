const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpackConfig = require('./webpack.config');

module.exports = (env) => {
	env = env || {};
	const baseConfig = webpackConfig(env);

	baseConfig.plugins.push(new CopyWebpackPlugin([
		{ from: { glob: 'ui/web-view/*.html', dot: false } }
	]))

	baseConfig.plugins.push(new webpack.DefinePlugin({
		__CI__: !!process.env.CI,
		__UI_USE_XML_PARSER__: true,
		__UI_USE_EXTERNAL_RENDERER__: false,
		__CSS_PARSER__: JSON.stringify('css-tree')
	}))

	return baseConfig;
};
