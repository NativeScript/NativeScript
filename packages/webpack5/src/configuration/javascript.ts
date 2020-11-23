import Config from 'webpack-chain';

import { IWebpackEnv } from '../index';
import base from './base';

// todo: add base configuration for core with javascript
export default function (config: Config, env: IWebpackEnv): Config {
	base(config, env);

	// set up xml
	config.module
		.rule('xml')
		.test(/\.xml$/)
		.use('xml-loader')
		.loader('xml-loader');

	return config;
}
