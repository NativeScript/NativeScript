import base from './base';

// todo: add base configuration for vue
export default function (env) {
	const config = base(env);

	// todo: we may want to use webpack-chain internally
	// to avoid "trying to read property x of undefined" type of issues
	config.module.rules.push({
		test: /.vue$/,
		use: [],
	});

	return {};
}
