import CopyWebpackPlugin from 'copy-webpack-plugin';
import { relative, resolve } from 'path';
import Config from 'webpack-chain';

import { getProjectRootPath } from './project';
import { getEntryDirPath } from './platform';
import { env } from '..';

/**
 * @internal
 */
export let copyRules = new Set([]);

/**
 * Utility to add new copy rules. Accepts a glob. For example
 *  - **\/*.html - copy all .html files found in any sub dir.
 *  - myFolder/* - copy all files from myFolder
 *
 * The path is relative to the folder of the entry file
 * (specified in the main field of the package.json)
 *
 * @param {string} glob
 */
export function addCopyRule(glob: string) {
	copyRules.add(glob);
}

/**
 * Utility to remove a copy rule. The glob should be the exact glob
 * to remove. For example
 *  - fonts/** - to remove the default copy rule for fonts
 *
 * @param {string} glob
 */
export function removeCopyRule(glob: string) {
	copyRules.delete(glob);
}

/**
 * @internal
 */
export function applyCopyRules(config: Config) {
	const entryDir = getEntryDirPath();
	// todo: handle empty appResourcesPath?
	// (the CLI should always pass the path - maybe not required)
	const appResourcesFullPath = resolve(
		getProjectRootPath(),
		env.appResourcesPath
	);

	const globOptions = {
		dot: false,
		ignore: [
			// ignore everything in App_Resources (regardless where they are located)
			`${relative(entryDir, appResourcesFullPath)}/**`,
		],
	};

	config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [
		{
			patterns: Array.from(copyRules).map((glob) => ({
				from: glob,
				context: entryDir,
				noErrorOnMissing: true,
				globOptions,
			})),
		},
	]);
}
