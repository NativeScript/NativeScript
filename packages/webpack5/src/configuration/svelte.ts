import Config from 'webpack-chain';

import { getProjectFilePath } from '../helpers/project';
import { hasDependency } from '../helpers/dependencies';
import { getPlatformName } from '../helpers/platform';
import { env as _env, IWebpackEnv } from '../index';
import { error } from '../helpers/log';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const platform = getPlatformName();
	const mode = env.production ? 'production' : 'development';
	const production = mode === 'production';

	// target('node') is the default but causes svelte-loader to detect it as a "server" render, disabling HMR
	// electron-main sneaks us past the target == 'node' check and gets us HMR
	config.target('electron-main');

	// turns out this isn't enough now. svelte uses "node" of which "electron-main" is a subset in its export map forcing imports
	// for 'svelte' to 'ssr.mjs'. We define an alias here to force it back.
	config.resolve.alias.set('svelte$', 'svelte/internal');

	// svelte-hmr still references tns-core-modules, so we shim it here for compat.
	config.resolve.alias.set('tns-core-modules', '@nativescript/core');

	// resolve .svelte files
	// the order is reversed because we are using prepend!
	config.resolve.extensions.prepend('.svelte').prepend(`.${platform}.svelte`);

	// add worker support to .svelte files (new Worker('./path'))
	config.module.rule('workers').test(/\.(js|ts|svelte)$/);

	// add a rule for .svelte files
	if (hasDependency('svelte-loader')) {
		// configure using svelte-loader
		config.module
			.rule('svelte')
			.test(/\.svelte$/)
			.exclude.add(/node_modules/)
			.end()
			.use('svelte-loader')
			.loader('svelte-loader')
			.tap((options) => {
				const svelteConfig = getSvelteConfig();
				return {
					...options,
					compilerOptions: {
						...svelteConfig?.compilerOptions,
						dev: !production,
					},
					preprocess: svelteConfig?.preprocess,
					hotReload: !production,
					hotOptions: {
						injectCss: false,
						native: true,
					},
				};
			});
	} else {
		// fallback for projects still using svelte-loader-hot
		config.module
			.rule('svelte')
			.test(/\.svelte$/)
			.exclude.add(/node_modules/)
			.end()
			.use('svelte-loader-hot')
			.loader('svelte-loader-hot')
			.tap((options) => {
				const svelteConfig = getSvelteConfig();
				return {
					...options,
					dev: !production,
					preprocess: getSvelteConfigPreprocessor(),
					hotReload: !production,
					hotOptions: {
						injectCss: false,
						native: true,
					},
					// Suppress A11y warnings
					onwarn(warning, warn) {
						if (!/A11y:/.test(warning.message)) {
							warn(warning);
						}
					},
				};
			});
	}

	// todo: re-visit later, disabling by default now
	// config.plugin('DefinePlugin').tap((args) => {
	// 	args[0] = merge(args[0], {
	// 		__UI_USE_EXTERNAL_RENDERER__: true,
	// 	});

	// 	return args;
	// });

	return config;
}

function getSvelteConfigPreprocessor(): any {
	const config = getSvelteConfig();

	return config?.preprocess;
}

interface ISvelteConfig {
	preprocess: any;
	compilerOptions: any;
}

function getSvelteConfig(): ISvelteConfig | undefined {
	try {
		return require(getProjectFilePath('svelte.config.js')) as ISvelteConfig;
	} catch (err) {
		error('Could not find svelte.config.js.', err);
	}
}
