export enum messages {
	compilationComplete = 'Webpack compilation complete.',
	startWatching = 'Webpack compilation complete. Watching for file changes.',
	changeDetected = 'File change detected. Starting incremental webpack compilation...',
}

/**
 * This little plugin will report the webpack state through the console.
 * So the {N} CLI can get some idea when compilation completes.
 */
export class WatchStateLoggerPlugin {
	isRunningWatching: boolean;
	apply(compiler) {
		const plugin = this;
		compiler.hooks.watchRun.tapAsync('WatchStateLoggerPlugin', function (compiler, callback) {
			plugin.isRunningWatching = true;
			if (plugin.isRunningWatching) {
				console.log(messages.changeDetected);
			}
			process.send && process.send(messages.changeDetected, (error) => null);
			callback();
		});
		compiler.hooks.afterEmit.tapAsync('WatchStateLoggerPlugin', function (compilation, callback) {
			callback();

			if (plugin.isRunningWatching) {
				console.log(messages.startWatching);
			} else {
				console.log(messages.compilationComplete);
			}

			const emittedFiles = Object.keys(compilation.assets).filter((assetKey) => compilation.assets[assetKey].emitted);

			const chunkFiles = getChunkFiles(compilation);
			process.send && process.send(messages.compilationComplete, (error) => null);
			// Send emitted files so they can be LiveSynced if need be
			process.send && process.send({ emittedFiles, chunkFiles, hash: compilation.hash }, (error) => null);
		});
	}
}

function getChunkFiles(compilation) {
	const chunkFiles = [];
	try {
		compilation.chunks.forEach((chunk) => {
			chunk.files.forEach((file) => {
				if (file.indexOf('hot-update') === -1) {
					chunkFiles.push(file);
				}
			});
		});
	} catch (e) {
		console.log('Warning: Unable to find chunk files.');
	}

	return chunkFiles;
}
