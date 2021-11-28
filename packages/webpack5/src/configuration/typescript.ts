import Config from 'webpack-chain';

import { getEntryDirPath, getEntryPath } from '../helpers/platform';
import { addVirtualEntry } from '../helpers/virtualModules';
import { chainedSetAddAfter } from '../helpers/chain';
import { env as _env, IWebpackEnv } from '../index';
import { ContextExclusionPlugin } from 'webpack';
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

	// exclude files starting with _ from require.context
	config
		.plugin(`ContextExclusionPlugin|exclude_files`)
		.use(ContextExclusionPlugin, [/\b_.+\./]);

	chainedSetAddAfter(
		config.entry('bundle'),
		'@nativescript/core/globals/index.js',
		virtualEntryPath
	);

	config.when(env.hmr, (config) => {
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
	});

	return config;
}
