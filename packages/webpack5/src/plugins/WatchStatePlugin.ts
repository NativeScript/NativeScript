const id = 'WatchStatePlugin';
const version = 1;

export enum messages {
	compilationComplete = 'Webpack compilation complete.',
	startWatching = 'Webpack compilation complete. Watching for file changes.',
	changeDetected = 'File change detected. Starting incremental webpack compilation...',
}

/**
 * This little plugin will report the webpack state through the console.
 * So the {N} CLI can get some idea when compilation completes.
 */
export class WatchStatePlugin {
	isRunningWatching: boolean;

	apply(compiler: any) {
		let isWatchMode = false;
		let prevAssets = [];

		compiler.hooks.watchRun.tapAsync(id, function (compiler, callback) {
			callback();

			isWatchMode = true;
			console.log(messages.changeDetected);
		});

		compiler.hooks.afterEmit.tapAsync(id, function (compilation, callback) {
			callback();

			console.log(
				isWatchMode ? messages.startWatching : messages.compilationComplete
			);

			// logic taken from CleanWebpackPlugin
			const assets =
				compilation.getStats().toJson(
					{
						assets: true,
					},
					true
				).assets || [];
			const assetList = assets.map((asset) => asset.name);

			const emittedAssets = Array.from(compilation.emittedAssets);
			const staleAssets = prevAssets.filter((asset) => {
				return assetList.includes(asset) === false;
			});

			// store assets for next compilation
			prevAssets = assetList.sort();

			notify({
				type: 'compilation',
				version,

				emittedAssets,
				staleAssets,
				hash: compilation.hash,
			});
		});
	}
}

function notify(message: any) {
	if (!process.send) {
		return;
	}

	console.log(`[${id}] Notify: `, message);
	process.send(message, (error) => {
		if (error) {
			console.error(`[${id}] Process Send Error: `, error);
		}

		return null;
	});
}
