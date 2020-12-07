import { dirname, resolve } from 'path';

import { getPackageJson, getProjectRootPath } from './project';
import { error } from './log';
import { env } from '../';

import AndroidPlatform from '../platforms/android';
import iOSPlatform from '../platforms/ios';

export interface INativeScriptPlatform {
	getEntryPath?(): string;

	getDistPath?(): string;
}

export type Platform = Extract<keyof typeof platforms, string>;

const platforms: {
	[name: string]: INativeScriptPlatform;
} = {
	android: AndroidPlatform,
	ios: iOSPlatform,
};

export function addPlatform(name: string, platform: INativeScriptPlatform) {
	console.log('adding platform', name, platform);
	platforms[name] = platform;
}

export function getPlatform(): INativeScriptPlatform {
	return platforms[getPlatformName()];
}

export function getPlatformName(): Platform {
	if (env?.android) {
		return 'android';
	}

	if (env?.ios) {
		return 'ios';
	}

	// support custom platforms
	if (env?.platform) {
		if (platforms[env.platform]) {
			return env.platform;
		}

		throw error(`
			Invalid platform: ${env.platform}

			Valid platforms: ${Object.keys(platforms).join(', ')}
		`);
	}

	throw error(`
		You need to provide a target platform!

		Available platforms: ${Object.keys(platforms).join(', ')}

		Use --env=platform=<platform> or --env=android, --env=ios to specify the target platform.
	`);
}

export function getEntryPath() {
	const platform = getPlatform();

	// use platform specific entry path
	if (platform.getEntryPath) {
		return platform.getEntryPath();
	}

	// fallback to main field in package.json
	const packageJson = getPackageJson();

	return resolve(getProjectRootPath(), packageJson.main);
}

export function getEntryDirPath() {
	return dirname(getEntryPath());
}

export function getDistPath() {
	const platform = getPlatform();

	// use platform specific entry path
	if (platform.getDistPath) {
		return platform.getDistPath();
	}

	// fallback to a generic platforms/<platform>/dist folder
	return `platforms/${getPlatformName()}/dist`;
}

export function getAbsoluteDistPath() {
	return resolve(getProjectRootPath(), getDistPath());
}
