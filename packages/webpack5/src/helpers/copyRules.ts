import CopyWebpackPlugin from 'copy-webpack-plugin';
import { relative, resolve } from 'path';
import { env } from '..';
import { getEntryDirPath } from './platform';
import { getProjectRootPath } from './project';

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

	const context = getEntryDirPath();
	const projectRoot = getProjectRootPath();
	const appResourcesFullPath = resolve(projectRoot, env.appResourcesPath);
	const globOptions = { dot: false, ignore: [`**/${relative(context, appResourcesFullPath)}/**`] };
	config.plugin('CopyWebpackPlugin').use(CopyWebpackPlugin, [
		{
			patterns: Array.from(copyRules).map((glob) => ({
				from: glob,
				context,
				noErrorOnMissing: true,
				globOptions,
			})),
		},
	]);
}
