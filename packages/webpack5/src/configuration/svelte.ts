import Config from 'webpack-chain';

import { getProjectFilePath } from '../helpers/project';
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

	// svelte-hmr still references tns-core-modules, so we shim it here for compat.
	config.resolve.alias.set('tns-core-modules', '@nativescript/core');

	// resolve .svelte files
	// the order is reversed because we are using prepend!
	config.resolve.extensions.prepend('.svelte').prepend(`.${platform}.svelte`);

	// add worker support to .svelte files (new Worker('./path'))
	config.module.rule('workers').test(/\.(js|ts|svelte)$/);

	// add a rule for .svelte files
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

	return config;
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
