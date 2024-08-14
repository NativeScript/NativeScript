import { warnOnce } from './log';
import { env } from '../index';

interface IPartialProjectConfigService {
	readConfig(projectDir?: string): Record<string, any>;
	getValue<T = any>(key: string, defaultValue?: any): T;
}

function getCLILib() {
	if (!env.nativescriptLibPath) {
		if (typeof env.nativescriptLibPath !== 'boolean') {
			warnOnce(
				'getCLILib',
				`
				Cannot find NativeScript CLI path. Make sure --env.nativescriptLibPath is passed
				`
			);
		}
		return false;
	}

	if (typeof env.nativescriptLibPath === 'boolean') {
		return false;
	}

	return require(env.nativescriptLibPath as string);
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

	if (key === '.') {
		return (
			lib.projectConfigService as IPartialProjectConfigService
		).readConfig() as T;
	}

	return (lib.projectConfigService as IPartialProjectConfigService).getValue(
		key,
		defaultValue
	);
}

/**
 * Utility to get a value from multiple keys in the nativescript.config.ts file, until one is found, or return a default value.
 *
 * @param keys a list of keys to try to get the value from
 * @param defaultValue The fallback value if none of the keys are set in the config.
 * @returns
 */
export function getValueFallbacks<T = any>(
	keys: string[],
	defaultValue?: any
): T {
	for (const key of keys) {
		const value = getValue<T>(key);
		if (value) {
			return value;
		}
	}

	return defaultValue;
}
