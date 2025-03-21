import Config from 'rspack-chain';

import path from 'path';
import { chainedSetAddAfter } from '../helpers/chain';
import { getEntryDirPath, getEntryPath } from '../helpers/platform';
import { env as _env, IWebpackEnv } from '../index';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);
	const entryPath = getEntryPath();
	const virtualEntryPath = path.resolve(
		__dirname,
		'../stubs/virtual-entry-javascript',
	);

	// exclude files starting with _ from require.context
	/* config
		.plugin(`ContextExclusionPlugin|exclude_files`)
		.use(ContextExclusionPlugin, [/\b_.+\./]); */

	chainedSetAddAfter(
		config.entry('bundle'),
		'@nativescript/core/globals/index',
		virtualEntryPath,
	);

	config.when(env.hmr, (config) => {
		// set up core HMR
		config.module
			.rule('hmr-core')
			.before('js')
			.test(/\.js$/)
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
