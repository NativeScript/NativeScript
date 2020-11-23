import base from './base';
import { env as _env, IWebpackEnv } from '@nativescript/webpack';
import Config from 'webpack-chain';
import { getPlatform } from '../helpers/project';
import { merge } from 'webpack-merge';
import svelteNativePreprocessor from 'svelte-native-preprocessor';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const platform = getPlatform();
	const mode = env.production ? 'production' : 'development';
	const production = mode === 'production';

	// resolve .svelte files
	// the order is reversed because we are using prepend!
	config.resolve.extensions.prepend('.svelte').prepend(`.${platform}.svelte`);

	// add a rule for .svelte files
	config.module
		.rule('svelte')
		.test(/\.svelte$/)
		.use('svelte-loader-hot')
		.loader('svelte-loader-hot')
		.tap((options) => {
			return {
				...options,
				// todo: should be a compiler object
				// but we want it as an external dependency
				dev: production,
				preprocess: [svelteNativePreprocessor()],
				hotReload: production,
				hotOptions: {
					injectCss: false,
					native: true,
				},
			};
		})
		.end();

	// set up ts support in svelte files
	config.module
		.rule('ts')
		.use('ts-loader')
		.loader('ts-loader')
		.tap((options = {}) => {
			return merge(options, {
				appendTsSuffixTo: ['\\.svelte$'],
			});
		});

	// add an alias for svelte, since some plugins may try to import it
	config.resolve.alias.set('svelte', 'svelte-native');

	return config;
}
