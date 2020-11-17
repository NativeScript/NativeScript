import base from './base';
import { IWebpackEnv } from '@nativescript/webpack';
import Config from 'webpack-chain';
import { merge } from 'webpack-merge';

// todo: add base configuration for react
export default function (env: IWebpackEnv): Config {
	const config = base(env);

	// todo: use env
	let isAnySourceMapEnabled = true;
	let production = false;

	config.resolve.extensions.prepend('.tsx');
	config.resolve.alias.set('react-dom', 'react-nativescript');

	config.module
		.rule('ts')
		.test([...config.module.rule('ts').get('test'), /\.tsx$/])
		.use('react-hmr')
		.loader('babel-loader')
		.before('ts-loader')
		.options({
			sourceMaps: isAnySourceMapEnabled ? 'inline' : false,
			babelrc: false,
			plugins: ['react-refresh/babel'],
		});

	config.plugin('DefinePlugin').tap((args) => {
		args[0] = merge(args[0], {
			/** For various libraries in the React ecosystem. */
			__DEV__: production ? 'false' : 'true',
			__TEST__: 'false',
			/**
			 * Primarily for React Fast Refresh plugin, but technically the allowHmrInProduction option could be used instead.
			 * Worth including anyway, as there are plenty of Node libraries that use this flag.
			 */
			'process.env.NODE_ENV': JSON.stringify(production ? 'production' : 'development'),
		});

		return args;
	});

	// todo: conditional + env flag to forceEnable?
	config.plugin('ReactRefreshWebpackPlugin').use(function ReactRefreshWebpackPlugin() {}, [
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

	return config;
}
