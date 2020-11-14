import { Configuration } from 'webpack';
import Config from 'webpack-chain';

// todo: add base configuration that's shared across all flavors
export default function (env): Configuration {
	const config = new Config()
	config.entry('')
	return {
		entry: {
			'bundle.js': 'bundle.js',
		},
	};
}
