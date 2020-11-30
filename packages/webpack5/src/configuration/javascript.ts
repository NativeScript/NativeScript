import VirtualModulesPlugin from 'webpack-virtual-modules';
import { ContextExclusionPlugin } from 'webpack';
import Config from 'webpack-chain';
import dedent from 'ts-dedent';
import { join } from 'path';

import { env as _env, IWebpackEnv } from '../index';
import { getEntryDirPath } from '../helpers/project';
import base from './base';

export default function (config: Config, env: IWebpackEnv = _env): Config {
	base(config, env);

	const virtualEntryPath = join(getEntryDirPath(), '__virtual_entry__.js');
	const filterRE = '/.(xml|js|s?css)$/';

	config.entry('bundle').add(virtualEntryPath);

	config
		.plugin('ContextExclusionPluginPlugin')
		.use(ContextExclusionPlugin, [/__virtual_entry__\.js$/]);

	// Add a virtual entry module that will register all modules into
	// the nativescript module loader/handler
	config.plugin('VirtualModulesPlugin').use(VirtualModulesPlugin, [
		{
			[virtualEntryPath]: dedent`
				require('@nativescript/core/bundle-entry-points')
				const context = require.context("~/", /* deep: */ true, /* filter: */ ${filterRE});
				global.registerWebpackModules(context);
			`,
		},
	]);

	config.resolve.extensions.add('.xml');

	// set up xml
	config.module
		.rule('xml')
		.test(/\.xml$/)
		.use('xml-namespace-loader')
		.loader('xml-namespace-loader');

	return config;
}
