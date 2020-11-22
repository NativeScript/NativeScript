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

export function getValue<T = any>(key: string): T {
	const lib = getCLILib();

	return (lib.projectConfigService as { getValue(key: string): T }).getValue(
		key
	);
}
