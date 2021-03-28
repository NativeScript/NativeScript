import { IWebpackEnv } from '../index';
import { addCopyRule } from './copyRules';

interface IReplacementMap {
	[from: string]: string;
}

function getFileReplacementsFromEnv(env: IWebpackEnv): IReplacementMap | null {
	const fileReplacements: IReplacementMap = {};
	if (env.replace) {
		(Array.isArray(env.replace)
			? env.replace
			: typeof env.replace === 'string'
			? [env.replace]
			: []
		).forEach((replaceEntry) => {
			replaceEntry.split(',').map((r: string) => {
				const keyValue = r.split(':');
				fileReplacements[keyValue[0]] = keyValue[1];
			});
		});
	}
	return fileReplacements;
}

export function applyFileReplacements(config, env: IWebpackEnv) {
	const fileReplacements = getFileReplacementsFromEnv(env);

	Object.entries(fileReplacements).forEach(([_replace, _with]) => {
		// in case we are replacing source files - we'll use aliases
		if (_replace.match(/\.ts$/)) {
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
