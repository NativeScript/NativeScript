import Config from 'webpack-chain';
import { IWebpackEnv } from './index';

// todo: add base configuration that's shared across all flavors
export default function (env: IWebpackEnv): Config {
	const config = new Config();
	config.entry('');
	return config;
}
