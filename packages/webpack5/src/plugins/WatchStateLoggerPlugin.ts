import webpack from 'webpack';

const id = 'WatchStateLoggerPlugin';

export enum messages {
	compilationComplete = 'Webpack compilation complete.',
	startWatching = 'Webpack compilation complete. Watching for file changes.',
	changeDetected = 'File change detected. Starting incremental webpack compilation...',
}

/**
 * This little plugin will report the webpack state through the console.
 * So the {N} CLI can get some idea when compilation completes.
 * @deprecated todo: remove soon
 */
export class WatchStateLoggerPlugin {
	isRunningWatching: boolean;

	apply(compiler) {
		const plugin = this;

		compiler.hooks.watchRun.tapAsync(id, function (compiler, callback) {
			plugin.isRunningWatching = true;

			if (plugin.isRunningWatching) {
				console.log(messages.changeDetected);
			}

			notify(messages.changeDetected);

			callback();
		});

		compiler.hooks.afterEmit.tapAsync(id, function (compilation, callback) {
			callback();

			if (plugin.isRunningWatching) {
				console.log(messages.startWatching);
			} else {
				console.log(messages.compilationComplete);
			}

			const emittedFiles = Array.from(compilation.emittedAssets);
			const chunkFiles = getChunkFiles(compilation);

			notify(messages.compilationComplete);

			// Send emitted files so they can be LiveSynced if need be
			notify({ emittedFiles, chunkFiles, hash: compilation.hash });
		});
	}
}

function getChunkFiles(compilation: webpack.Compilation) {
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

function notify(message: any) {
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
