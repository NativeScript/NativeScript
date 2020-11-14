import Config from 'webpack-chain';
import { IWebpackEnv, WebpackPlatform } from './index';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { getDistPath } from '../helpers/projectHelpers';

// todo: add base configuration that's shared across all flavors
export default function (env: IWebpackEnv): Config {
	const config = new Config();
	const distPath = getDistPath(env);

	// inspector_modules
	config.when(shouldIncludeInspectorModules(env), (config) => {
		config.entry('inspector_modules').add('tns_modules/@nativescript/core/inspector_modules').end();
	});

	config.entry('bundle').add('todo/main').end();

	// base aliases
	config.resolve.alias.set('~/package.json', 'package.json').set('~', '<TODO>appFullPath').set('@', '<TODO>appFullPath');

	// resolve symlinks
	config.resolve.symlinks(true);

	// items to clean
	config.plugin('clean').use(CleanWebpackPlugin, [
		{
			cleanOnceBeforeBuildPatterns: [`${distPath}/**/*`],
			verbose: true,
		},
	]);

	return config;
}

function shouldIncludeInspectorModules(env: IWebpackEnv): boolean {
	const platform = determinePlatformFromEnv(env);
	// todo: check if core modules are external
	// todo: check if we are testing
	return platform === WebpackPlatform.ios;
}

function determinePlatformFromEnv(env: IWebpackEnv): WebpackPlatform {
	if (env?.android) {
		return WebpackPlatform.android;
	}

	if (env?.ios) {
		return WebpackPlatform.ios;
	}

	throw new Error('You need to provide a target platform!');
}
