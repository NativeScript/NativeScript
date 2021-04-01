import { env } from '../index';
import { error, warnOnce } from './log';

function getCLILib() {
	if (!env.nativescriptLibPath) {
		warnOnce(
			'getCLILib',
			`
			Cannot find NativeScript CLI path. Make sure --env.nativescriptLibPath is passed
		`
		);
		return false;
	}

	return require(env.nativescriptLibPath);
}

/**
 * Utility to get a value from the nativescript.config.ts file.
 *
 * @param {string} key The key to get from the config. Supports dot-notation.
 * @param defaultValue The fallback value if the key is not set in the config.
 */
export function getValue<T = any>(key: string, defaultValue?: any): T {
	const lib = getCLILib();

	if (!lib) {
		return defaultValue;
	}

	return (lib.projectConfigService as {
		getValue(key: string, defaultValue?: any): T;
	}).getValue(key, defaultValue);
}
