import { resolve, dirname } from 'path';

import { getPlatform } from '../platforms';

export function getProjectRootPath(): string {
	return process.cwd();
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

	// fallback to a generic dist folder
	return 'dist';
}

export function getAbsoluteDistPath() {
	return resolve(getProjectRootPath(), getDistPath());
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
