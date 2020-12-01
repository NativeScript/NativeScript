import { resolve, basename, dirname } from 'path';

import { env, Platform } from '../index';
import { error } from './log';

export function getProjectRootPath(): string {
	// todo: find actual path?

	return process.cwd();
	//__dirname
}

export function getAbsoluteDistPath() {
	return resolve(getProjectRootPath(), getDistPath());
}

export function getEntryPath() {
	const packageJson = getPackageJson();

	return resolve(getProjectRootPath(), packageJson.main);
}

export function getEntryDirPath() {
	return dirname(getEntryPath());
}

export function getDistPath() {
	if (env.ios) {
		const appName = basename(getProjectRootPath());
		return `platforms/ios/${appName}/app`;
	}

	if (env.android) {
		return `platforms/android/app/src/main/assets/app`;
	}

	// todo: additional platforms
	// perhaps we could combine platform specifics into "plugins"
	// 3rd party platforms would be treated the same
}

export function getPlatform(): Platform {
	if (env?.android) {
		return 'android';
	}

	if (env?.ios) {
		return 'ios';
	}

	error('You need to provide a target platform!');
}

interface IPackageJson {
	main?: string;
	dependencies?: {
		[name: string]: string;
	};
	devDependencies?: {
		[name: string]: string;
	};
	// todo: add additional fields as we require them
}

export function getPackageJson() {
	const packageJsonPath = resolve(getProjectRootPath(), 'package.json');

	return require(packageJsonPath) as IPackageJson;
}
