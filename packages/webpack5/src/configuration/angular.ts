import Config from 'webpack-chain';

import { IWebpackEnv } from '../index';
import base from './base';

export default function (config: Config, env: IWebpackEnv): Config {
	base(config, env);

	return config;
}
