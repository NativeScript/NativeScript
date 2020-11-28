import VirtualModulesPlugin from 'webpack-virtual-modules';
import Config from 'webpack-chain';

import { getEntryPath } from '../helpers/project';
import { IWebpackEnv } from '../index';
import base from './base';
import dedent from 'ts-dedent';

// todo: add base configuration for core with javascript
export default function (config: Config, env: IWebpackEnv): Config {
	base(config, env);

	const virtualEntryPath = getEntryPath() + '.virtual.js';

	config.entry('bundle').add(virtualEntryPath);

	// Add a virtual entry module
	config.plugin('VirtualModulesPlugin').use(VirtualModulesPlugin, [
		{
			[virtualEntryPath]: dedent`
			require('@nativescript/core/bundle-entry-points')

			const context = require.context("./", /* deep: */ true);
			global.registerWebpackModules(context);
		`,
		},
	]);

	// set up xml
	config.module
		.rule('xml')
		.test(/\.xml$/)
		.use('xml-namespace-loader')
		.loader('xml-namespace-loader');

	return config;
}
