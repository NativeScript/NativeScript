import { merge } from 'webpack-merge';
import Config from 'webpack-chain';

import { getPlatformName } from '../helpers/platform';
import { env as _env, IWebpackEnv } from '../index';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const platform = getPlatformName();
	const mode = env.production ? 'production' : 'development';
	const production = mode === 'production';

	// todo: use env
	let isAnySourceMapEnabled = true;

	config.resolve.extensions.prepend('.tsx').prepend(`.${platform}.tsx`);
	config.resolve.alias.set('react-dom', 'react-nativescript');

	config.module
		.rule('ts')
		.test([...config.module.rule('ts').get('test'), /\.tsx$/]);

	config.plugin('DefinePlugin').tap((args) => {
		args[0] = merge(args[0], {
			/** For various libraries in the React ecosystem. */
			__TEST__: false,
			// todo: re-visit later, disabling by default now
			// __UI_USE_EXTERNAL_RENDERER__: true,
			/**
			 * Primarily for React Fast Refresh plugin, but technically the allowHmrInProduction option could be used instead.
			 * Worth including anyway, as there are plenty of Node libraries that use this flag.
			 */
			'process.env.NODE_ENV': JSON.stringify(mode),
		});

		return args;
	});

	// todo: env flag to forceEnable?
	config.when(env.hmr && !production, (config) => {
		config.module
			.rule('ts')
			.use('babel-loader|react-refresh')
			.loader('babel-loader')
			.before('ts-loader')
			.options({
				sourceMaps: isAnySourceMapEnabled ? 'inline' : false,
				babelrc: false,
				plugins: ['react-refresh/babel'],
			});

		config
			.plugin('ReactRefreshPlugin')
			.use(require('@pmmmwh/react-refresh-webpack-plugin'), [
				{
					/**
					 * Maybe one day we'll implement an Error Overlay, but the work involved is too daunting for now.
					 * @see https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/79#issuecomment-644324557
					 */
					overlay: false,
					/**
					 * If you (temporarily) want to enable HMR on a production build:
					 *   1) Set `forceEnable` to `true`
					 *   2) Remove the `!production` condition on `tsxRule` to ensure that babel-loader gets used.
					 */
					forceEnable: false,
				},
			]);
	});

	return config;
}
