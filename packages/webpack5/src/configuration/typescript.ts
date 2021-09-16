import Config from 'webpack-chain';

import { getEntryDirPath, getEntryPath } from '../helpers/platform';
import { addVirtualEntry } from '../helpers/virtualModules';
import { chainedSetAddAfter } from '../helpers/chain';
import { env as _env, IWebpackEnv } from '../index';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);
	const entryPath = getEntryPath();
	const filterRE = '/\\.(xml|js|(?<!\\.d\\.)ts|s?css)$/';
	const virtualEntryPath = addVirtualEntry(
		config,
		'typescript',
		`
		// VIRTUAL ENTRY START
		require('@nativescript/core/bundle-entry-points')
		const context = require.context("~/", /* deep: */ true, /* filter: */ ${filterRE});
		global.registerWebpackModules(context);
		// VIRTUAL ENTRY END
	`
	);

	chainedSetAddAfter(
		config.entry('bundle'),
		'@nativescript/core/globals/index.js',
		virtualEntryPath
	);

	// set up core HMR
	config.module
		.rule('hmr-core')
		.test(/\.(js|ts)$/)
		.exclude.add(/node_modules/)
		.add(entryPath)
		.end()
		.use('nativescript-hot-loader')
		.loader('nativescript-hot-loader')
		.options({
			appPath: getEntryDirPath(),
		});

	return config;
}
