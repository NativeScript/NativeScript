import { Compiler } from '@rspack/core';
import { env } from '../';

const id = 'WatchStatePlugin';
const version = 1;

export enum messages {
	compilationComplete = 'Rspack compilation complete.',
	startWatching = 'Rspack compilation complete. Watching for file changes.',
	changeDetected = 'File change detected. Starting incremental rspack compilation...',
}

/**
 * This little plugin will report the webpack state through the console
 * and send status updates through IPC to the {N} CLI.
 */
export class WatchStatePlugin {
	apply(compiler: Compiler) {
		let isWatchMode = false;
		let prevAssets = [];

		compiler.hooks.watchRun.tapAsync(id, function (compiler, callback) {
			callback();

			if (isWatchMode) {
				env.stats && console.log(messages.changeDetected);

				if (env.verbose) {
					if (compiler.modifiedFiles) {
						Array.from(compiler.modifiedFiles).forEach((file) => {
							console.log(`[${id}][WatchTriggers] MODIFIED: ${file}`);
						});
					}

					if (compiler.removedFiles) {
						Array.from(compiler.removedFiles).forEach((file) => {
							console.log(`[${id}][WatchTriggers] REMOVED: ${file}`);
						});
					}
				}
			}
			isWatchMode = true;
		});

		compiler.hooks.afterEmit.tapAsync(id, function (compilation, callback) {
			callback();

			env.stats &&
				console.log(
					isWatchMode ? messages.startWatching : messages.compilationComplete,
				);

			const stats = compilation.getStats();
			if (stats.hasErrors()) {
				env.verbose && console.log(`[${id}] Warn: Compilation had errors!`);
			}

			// logic taken from CleanWebpackPlugin
			// const assets =
			// 	stats.toJson(
			// 		{
			// 			assets: true,
			// 		},
			// 		true
			// 	).assets || [];
			// const assetList = assets.map((asset) => asset.name);

			// const emittedAssets = Array.from(compilation.emittedAssets);

			const assetList = Object.keys(compilation.assets);
			const emittedAssets = Array.from(
				compilation.getAssets().map((asset) => asset.name),
			);

			if (!prevAssets.length && emittedAssets.length < assetList.length) {
				emittedAssets.push(...assetList);
			}

			const staleAssets = prevAssets.filter((asset) => {
				return assetList.includes(asset) === false;
			});

			// store assets for next compilation
			prevAssets = assetList.sort();

			notify({
				type: 'compilation',
				version,
				hash: compilation.hash,

				data: {
					emittedAssets,
					staleAssets,
				},
			});
		});
	}
}

function notify(message: any) {
	env.verbose && console.log(`[${id}] Notify: `, message);
	if (!process.send) {
		return;
	}

	process.send(message, (error) => {
		if (error) {
			console.error(`[${id}] Process Send Error: `, error);
		}

		return null;
	});
}
