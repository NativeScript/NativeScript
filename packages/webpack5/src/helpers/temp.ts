import { existsSync } from 'fs';
import { getPackageJson } from './project';
import { resolve } from 'path';

// todo: get rid of these or reduce them to their simplest form
// no need to do magical string replacements, loops etc...

/**
 * Function to ensure the app directory exists
 *
 * @param appDirectory
 */
function verifyEntryModuleDirectory(appDirectory: string) {
	if (!appDirectory) {
		throw new Error('Path to app directory is not specified. Unable to find entry module.');
	}

	if (!existsSync(appDirectory)) {
		throw new Error(`The specified path to app directory ${appDirectory} does not exist. Unable to find entry module.`);
	}
}

function getPackageJsonEntry() {
	const packageJsonSource = getPackageJson();
	const entry = packageJsonSource.main;

	if (!entry) {
		throw new Error(`package.json must contain a 'main' attribute!`);
	}

	return entry.replace(/\.js$/i, '');
}

export function getEntryModule(appDirectory: string, platform: 'android' | 'ios') {
	verifyEntryModuleDirectory(appDirectory);

	const entry = getPackageJsonEntry();

	const tsEntryPath = resolve(appDirectory, `${entry}.ts`);
	const jsEntryPath = resolve(appDirectory, `${entry}.js`);
	let entryExists = existsSync(tsEntryPath) || existsSync(jsEntryPath);
	if (!entryExists && platform) {
		const platformTsEntryPath = resolve(appDirectory, `${entry}.${platform}.ts`);
		const platformJsEntryPath = resolve(appDirectory, `${entry}.${platform}.js`);
		entryExists = existsSync(platformTsEntryPath) || existsSync(platformJsEntryPath);
	}

	if (!entryExists) {
		throw new Error(`The entry module ${entry} specified in ` + `${appDirectory}/package.json doesn't exist!`);
	}

	return entry;
}
