import Config from 'webpack-chain';

import { getProjectFilePath, getProjectRootPath } from '../helpers/project';
import { getPlatformName } from '../helpers/platform';
import { env as _env, IWebpackEnv } from '../index';
import { error } from '../helpers/log';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const platform = getPlatformName();
	const mode = env.production ? 'production' : 'development';
	const production = mode === 'production';

	// resolve .svelte files
	// the order is reversed because we are using prepend!
	config.resolve.extensions.prepend('.svelte').prepend(`.${platform}.svelte`);
	// add a rule for .svelte files
	config.module
		.rule('svelte')
		.test(/\.svelte$/)
		.exclude.add(/node_modules/)
		.end()
		.use('svelte-loader-hot')
		.loader('svelte-loader-hot')
		.tap((options) => {
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

	return config;
}

function getSvelteConfigPreprocessor(): any {
	const config = getSvelteConfig();

	return config?.preprocess;
}

interface ISvelteConfig {
	preprocess: any
}

function getSvelteConfig(): ISvelteConfig | undefined {
	try {
		return require(
			getProjectFilePath('svelte.config.js')
		) as ISvelteConfig;
	} catch (err) {
		error('Could not find svelte.config.js.', err);
	}
}
