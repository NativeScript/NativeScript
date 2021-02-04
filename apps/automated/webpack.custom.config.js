const webpackConfig = require('./webpack.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
	env = env || {};
	const baseConfig = webpackConfig(env);

	baseConfig.plugins.push(new CopyWebpackPlugin([
		{ from: { glob: 'ui/web-view/*.html', dot: false } }
	]))

	return baseConfig;
};
