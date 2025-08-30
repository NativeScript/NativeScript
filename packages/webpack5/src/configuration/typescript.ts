import Config from 'webpack-chain';

import { getEntryDirPath, getEntryPath } from '../helpers/platform';
import { chainedSetAddAfter } from '../helpers/chain';
import { env as _env, IWebpackEnv } from '../index';
import { ContextExclusionPlugin } from 'webpack';
import base from './base';
import path from 'path';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);
	const entryPath = getEntryPath();
	const virtualEntryPath = path.resolve(
		__dirname,
		// Note: this is possible if needed
		// at moment it's not but just leaving as note for futre
		// `../stubs/virtual-entry-typescript.${env.commonjs ? 'js' : 'mjs'}`,
		`../stubs/virtual-entry-typescript.js`,
	);

	// exclude files starting with _ from require.context
	config
		.plugin(`ContextExclusionPlugin|exclude_files`)
		.use(ContextExclusionPlugin, [/\b_.+\./]);

	chainedSetAddAfter(
		config.entry('bundle'),
		'@nativescript/core/globals/index',
		virtualEntryPath,
	);

	config.when(env.hmr, (config) => {
		// set up core HMR
		config.module
			.rule('hmr-core')
			.before('ts')
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
