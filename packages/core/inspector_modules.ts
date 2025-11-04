import './globals';
import './debugger/webinspector-network';
import './debugger/webinspector-dom';
import './debugger/webinspector-css';
import { File, knownFolders } from './file-system';
// import/destructure style helps commonjs/esm build issues
import * as sourceMapJs from 'source-map-js';
const { SourceMapConsumer } = sourceMapJs;

// note: bundlers can by default use 'source-map' files with runtimes v9+
// helps avoid having to decode the inline base64 source maps
const usingSourceMapFiles = true;
let loadedSourceMaps: Map<string, any>;
let consumerCache: Map<string, any>;

function getConsumer(mapPath: string, sourceMap: any) {
	if (!consumerCache) {
		consumerCache = new Map();
	}
	let c = consumerCache.get(mapPath);
	if (!c) {
		try {
			c = new SourceMapConsumer(sourceMap);
			consumerCache.set(mapPath, c);
		} catch (error) {
			// Keep quiet in production-like console; failures just fall back to original stack
			console.debug && console.debug(`SourceMapConsumer failed for ${mapPath}:`, error);
			return null;
		}
	}
	return c;
}

function loadAndExtractMap(mapPath: string) {
	// check cache first
	if (!loadedSourceMaps) {
		loadedSourceMaps = new Map();
	}
	let mapText = loadedSourceMaps.get(mapPath);
	if (mapText) {
		return mapText; // already loaded
	} else {
		if (File.exists(mapPath)) {
			try {
				const contents = File.fromPath(mapPath).readTextSync();

				// Note: we may want to do this, keeping for reference if needed in future.
				// Check size before processing (skip very large source maps)
				// const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit
				// if (contents.length > maxSizeBytes) {
				// 	console.warn(`Source map ${mapPath} is too large (${contents.length} bytes), skipping...`);
				// 	return null;
				// }

				if (usingSourceMapFiles) {
					mapText = contents;
				} else {
					// parse out the inline base64
					const match = contents.match(/\/\/[#@] sourceMappingURL=data:application\/json[^,]+,(.+)$/);
					if (!match) {
						console.warn(`Invalid source map format in ${mapPath}`);
						return null;
					}
					const base64 = match[1];
					const binary = atob(base64);
					// this is the raw text of the source map
					// seems to work without doing decodeURIComponent tricks
					mapText = binary;
				}
			} catch (error) {
				console.debug && console.debug(`Failed to load source map ${mapPath}:`, error);
				return null;
			}
		} else {
			// no source maps
			return null;
		}
	}
	loadedSourceMaps.set(mapPath, mapText); // cache it
	return mapText;
}

function remapFrame(file: string, line: number, column: number) {
	/**
	 * bundlers can use source map files or inline.
	 * To use source map files, run with `--env.sourceMap=source-map`.
	 * Notes:
	 * Starting with @nativescript/webpack 5.0.25, `source-map` files are used by default when using runtimes v9+.
	 */

	const appPath = knownFolders.currentApp().path;
	let sourceMapFileExt = '';
	if (usingSourceMapFiles) {
		sourceMapFileExt = '.map';
	}
	const mapPath = `${appPath}/${file.replace('file:///app/', '')}${sourceMapFileExt}`;

	const sourceMap = loadAndExtractMap(mapPath);

	if (!sourceMap) {
		return { source: null, line: 0, column: 0 };
	}

	const consumer = getConsumer(mapPath, sourceMap);
	if (!consumer) {
		return { source: null, line: 0, column: 0 };
	}

	try {
		return consumer.originalPositionFor({ line, column });
	} catch (error) {
		console.debug && console.debug(`Remap failed for ${file}:${line}:${column}:`, error);
		return { source: null, line: 0, column: 0 };
	}
}

function remapStack(raw: string): string {
	const lines = raw.split('\n');
	const out = lines.map((line) => {
		// 1) Parenthesized frame: at fn (file:...:L:C)
		let m = /\((.+):(\d+):(\d+)\)/.exec(line);
		if (m) {
			try {
				const [_, file, l, c] = m;
				const orig = remapFrame(file, +l, +c);
				if (!orig.source) return line;
				return line.replace(/\(.+\)/, `(${orig.source}:${orig.line}:${orig.column})`);
			} catch (error) {
				console.debug && console.debug('Remap failed for frame:', line, error);
				return line;
			}
		}

		// 2) Bare frame: at file:///app/vendor.js:L:C (no parentheses)
		const bare = /(\s+at\s+)([^\s()]+):(\d+):(\d+)/.exec(line);
		if (bare) {
			try {
				const [, prefix, file, l, c] = bare;
				const orig = remapFrame(file, +l, +c);
				if (!orig.source) return line;
				const replacement = `${prefix}${orig.source}:${orig.line}:${orig.column}`;
				return line.replace(bare[0], replacement);
			} catch (error) {
				console.debug && console.debug('Remap failed for bare frame:', line, error);
				return line;
			}
		}

		return line;
	});
	return out.join('\n');
}

/**
 * Added with 9.0 runtimes.
 * Allows the runtime to remap stack traces before displaying them via in-flight error screens.
 */
(global as any).__ns_remapStack = (rawStack: string) => {
	// console.log('Remapping stack trace...');
	try {
		return remapStack(rawStack);
	} catch (error) {
		console.debug && console.debug('Remap failed, returning original:', error);
		return rawStack; // fallback to original stack trace
	}
};
/**
 * End of source map remapping for stack traces
 */
