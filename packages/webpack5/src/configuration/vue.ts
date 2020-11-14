import base from './base';
import Config from 'webpack-chain';

// todo: add base configuration for vue
export default function (env) {
	const config = new Config().merge(base(env));

	// todo: we may want to use webpack-chain internally
	// to avoid "trying to read property x of undefined" type of issues
	/*
		config.module.rules.push({
			test: /.vue$/,
			use: [],
		});
	*/

	return {};
}
