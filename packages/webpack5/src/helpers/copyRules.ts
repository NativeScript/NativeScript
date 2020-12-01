import CopyWebpackPlugin from 'copy-webpack-plugin';

import { getEntryDirPath } from './project';

/**
 * @internal
 */
export let copyRules = new Set([]);

export function addCopyRule(glob: string) {
	copyRules.add(glob);
}

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
