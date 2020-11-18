import base from './base';
import { IWebpackEnv } from '@nativescript/webpack';
import Config from 'webpack-chain';

export default function (config: Config, env: IWebpackEnv): Config {
	base(config, env);

	return config;
}
