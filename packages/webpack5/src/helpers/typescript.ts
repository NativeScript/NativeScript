import { dirname } from 'path';
import { env } from '..';

import { warnOnce } from './log';

/**
 * @internal
 */
let typescript: typeof import('typescript');

/**
 * Helper used to import typescript.
 *
 * The reason this exists is that not all flavors use Typescript, and
 * in those cases just importing this helper will throw an exception.
 */
export function getTypescript(): typeof import('typescript') {
	if (typescript) {
		return typescript;
	}

	try {
		typescript = require('typescript');
		return typescript;
	} catch (err) {
		warnOnce(
			'typescript-missing',
			`TypeScript is not installed in this project, but a config is trying to use it.`,
			env.verbose
				? new Error().stack
				: 'Run with --env.verbose to log a stack trace to help debug this further.'
		);

		return {} as any;
	}
}

export function readTsConfig(path: string) {
	const { readConfigFile, parseJsonConfigFileContent, sys } = getTypescript();
	const f = readConfigFile(path, sys.readFile);

	const parsed = parseJsonConfigFileContent(
		f.config,
		{
			fileExists: sys.fileExists,
			readFile: sys.readFile,
			readDirectory: sys.readDirectory,
			useCaseSensitiveFileNames: true,
		},
		dirname(path)
	);

	return parsed;
}
