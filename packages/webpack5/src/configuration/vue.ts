import base from './base';
import Config from 'webpack-chain';
import { VueLoaderPlugin } from 'vue-loader';
import { IWebpackEnv } from './index';

// todo: add base configuration for vue
export default function (env: IWebpackEnv): Config {
	const config = base(env);

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
		.tap((options) => {
			return {
				...options,
				appendTsSuffixTo: [/\.vue$/],
			};
		});

	// add VueLoaderPlugin
	config.plugin('vue-plugin').use(VueLoaderPlugin);

	// add an alias for vue, since some plugins may try to import it
	config.resolve.alias.set('vue', 'nativescript-vue');

	return config;
}
