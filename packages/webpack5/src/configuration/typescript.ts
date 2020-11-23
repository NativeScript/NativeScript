import Config from 'webpack-chain';

import { IWebpackEnv } from '../index';
import base from './base';

// todo: add base configuration for core
export default function (config: Config, env: IWebpackEnv): Config {
	base(config, env);

	return config;
}
