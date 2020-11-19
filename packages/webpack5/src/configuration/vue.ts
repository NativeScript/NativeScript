import base from './base';
import Config from 'webpack-chain';
import { VueLoaderPlugin } from 'vue-loader';
import { env as _env, IWebpackEnv } from '../index';
import { merge } from 'webpack-merge';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	// resolve .vue files
	config.resolve.extensions.prepend('.vue');

	// add a rule for .vue files
	config.module
		.rule('vue')
		.test(/\.vue$/)
		.use('vue-loader')
		.loader('vue-loader')
		.tap((options) => {
			return {
				...options,
				compiler: 'nativescript-vue-template-compiler',
			};
		})
		.end();

	// set up ts support in vue files
	config.module
		.rule('ts')
		.use('ts-loader')
		.loader('ts-loader')
		.tap((options = {}) => {
			return merge(options, {
				appendTsSuffixTo: ['\\.vue$'],
			});
		});

	// add VueLoaderPlugin as the first plugin
	config
		.plugin('VueLoaderPlugin')
		// @ts-ignore
		.before(config.plugins.values()[0].name)
		.use(VueLoaderPlugin);

	// add an alias for vue, since some plugins may try to import it
	config.resolve.alias.set('vue', 'nativescript-vue');

	return config;
}
