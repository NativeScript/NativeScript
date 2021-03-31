import { env } from '../index';
import { error } from './log';

function getCLILib() {
	if (!env.nativescriptLibPath) {
		throw error(`
			Cannot find NativeScript CLI path. Make sure --env.nativescriptLibPath is passed
		`);
	}

	return require(env.nativescriptLibPath);
}

/**
 * Utility to get a value from the nativescript.config.ts file.
 *
 * @param {string} key The key to get from the config. Supports dot-notation.
 */
export function getValue<T = any>(key: string, defaultValue?: any): T {
	const lib = getCLILib();

	return (lib.projectConfigService as {
		getValue(key: string, defaultValue?: any): T;
	}).getValue(key, defaultValue);
}
