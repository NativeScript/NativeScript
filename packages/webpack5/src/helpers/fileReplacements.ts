import { resolve } from 'path';

import { env as _env, IWebpackEnv } from '../index';
import { addCopyRule } from './copyRules';
import { getProjectRootPath } from './project';

interface IReplacementMap {
	[_replace: string]: /* _with */ string;
}

/**
 * @internal
 */
export function getFileReplacementsFromEnv(
	env: IWebpackEnv = _env
): IReplacementMap {
	const fileReplacements: IReplacementMap = {};

	const entries: string[] = (() => {
		if (Array.isArray(env.replace)) {
			return env.replace;
		}

		if (typeof env.replace === 'string') {
			return [env.replace];
		}

		return [];
	})();

	entries.forEach((replaceEntry) => {
		replaceEntry.split(/,\s*/).forEach((r: string) => {
			let [_replace, _with] = r.split(':');

			if (!_replace || !_with) {
				return;
			}

			// make sure to resolve replacements to a full path
			// relative to the project root
			_replace = resolve(getProjectRootPath(), _replace);
			_with = resolve(getProjectRootPath(), _with);

			fileReplacements[_replace] = _with;
		});
	});

	return fileReplacements;
}

export function applyFileReplacements(
	config,
	fileReplacements: IReplacementMap = getFileReplacementsFromEnv()
) {
	Object.entries(fileReplacements).forEach(([_replace, _with]) => {
		// in case we are replacing source files - we'll use aliases
		if (_replace.match(/\.(ts|js)$/)) {
			return config.resolve.alias.set(_replace, _with);
		}

		// otherwise we will override the replaced file with the replacement
		addCopyRule({
			from: _with, // copy the replacement file
			to: _replace, // to the original "to-be-replaced" file
			force: true,
		});
	});
}
