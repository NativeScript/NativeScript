import CopyWebpackPlugin from 'copy-webpack-plugin';

import { getEntryDirPath } from './platform';

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
export function applyCopyRules(config) {
	config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [
		{
			patterns: Array.from(copyRules).map((glob) => ({
				from: glob,
				context: getEntryDirPath(),
				noErrorOnMissing: true,
				globOptions: {
					dot: false,
					// todo: ignore AppResources if inside app folder!
					// ignore: [``]
				},
			})),
		},
	]);
}
