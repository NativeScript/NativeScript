import { VueLoaderPlugin } from 'vue-loader';
import { merge } from 'webpack-merge';
import Config from 'webpack-chain';
import fs from 'fs';

import { hasDependency } from '../helpers/dependencies';
import { getPlatformName } from '../helpers/platform';
import { env as _env, IWebpackEnv } from '../index';
import { error } from '../helpers/log';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const platform = getPlatformName();

	// we need to patch VueLoader if we want to enable hmr
	if (env.hmr) {
		patchVueLoaderForHMR();
	}

	// resolve .vue files
	// the order is reversed because we are using prepend!
	config.resolve.extensions.prepend('.vue').prepend(`.${platform}.vue`);

	// add a rule for .vue files
	config.module
		.rule('vue')
		.test(/\.vue$/)
		.use('vue-loader')
		.loader('vue-loader')
		.tap((options) => {
			return {
				...options,
				compiler: getTemplateCompiler(),
			};
		});

	// apply vue stylePostLoader to inject component scope into the css
	// this would usually be automatic, however in NS we don't use the
	// css-loader, so VueLoader doesn't inject the rule at all.
	config.module
		.rule('css')
		.use('vue-css-loader')
		.after('css2json-loader')
		.loader('vue-loader/lib/loaders/stylePostLoader.js');

	config.module
		.rule('scss')
		.use('vue-css-loader')
		.after('css2json-loader')
		.loader('vue-loader/lib/loaders/stylePostLoader.js');

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

	config.when(hasDependency('typescript'), (config) => {
		config.plugin('ForkTsCheckerWebpackPlugin').tap((args) => {
			args[0] = merge(args[0], {
				typescript: {
					extensions: {
						vue: {
							enabled: true,
							compiler: 'nativescript-vue-template-compiler',
						},
					},
				},
			});
			return args;
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

	// todo: re-visit later, disabling by default now
	// config.plugin('DefinePlugin').tap((args) => {
	// 	args[0] = merge(args[0], {
	// 		__UI_USE_EXTERNAL_RENDERER__: true,
	// 	});

	// 	return args;
	// });

	return config;
}

/**
 * Patches source of vue-loader to set the isServer flag to false
 * so hmr gets enabled.
 */
function patchVueLoaderForHMR() {
	try {
		const vueLoaderPath = require.resolve('vue-loader/lib/index.js');
		const source = fs.readFileSync(vueLoaderPath).toString();
		const patchedSource = source.replace(
			/(isServer\s=\s)(target\s===\s'node')/g,
			'$1false;'
		);
		fs.writeFileSync(vueLoaderPath, patchedSource);
		delete require.cache[vueLoaderPath];
	} catch (err) {
		error('Failed to patch VueLoader - HMR may not work properly!');
	}
}

function getTemplateCompiler() {
	try {
		return require('nativescript-vue-template-compiler');
	} catch (err) {
		// ignore
	}
}
