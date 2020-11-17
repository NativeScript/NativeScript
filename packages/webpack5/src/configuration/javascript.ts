import base from './base';
import { IWebpackEnv } from '@nativescript/webpack';
import Config from 'webpack-chain';

// todo: add base configuration for core with javascript
export default function (env: IWebpackEnv): Config {
	const config = base(env);

	// set up xml
	config.module
		.rule('xml')
		.test(/\.xml$/)
		.use('xml-loader')
		.loader('xml-loader');

	return config;
}
