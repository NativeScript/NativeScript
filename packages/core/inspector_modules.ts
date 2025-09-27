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
			console.error(`Failed to create SourceMapConsumer for ${mapPath}:`, error);
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
				console.error(`Failed to load source map ${mapPath}:`, error);
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
	 * @nativescript/webpack 5.1 enables `source-map` files by default when using runtimes v9+.
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
		console.error(`Failed to get original position for ${file}:${line}:${column}:`, error);
		return { source: null, line: 0, column: 0 };
	}
}

function remapStack(raw: string): string {
	const lines = raw.split('\n');
	const out = lines.map((line) => {
		const m = /\((.+):(\d+):(\d+)\)/.exec(line);
		if (!m) return line;

		try {
			const [_, file, l, c] = m;
			const orig = remapFrame(file, +l, +c);
			if (!orig.source) return line;
			return line.replace(/\(.+\)/, `(${orig.source}:${orig.line}:${orig.column})`);
		} catch (error) {
			console.error('Failed to remap stack frame:', line, error);
			return line; // return original line if remapping fails
		}
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
		console.error('Failed to remap stack trace, returning original:', error);
		return rawStack; // fallback to original stack trace
	}
};
/**
 * End of source map remapping for stack traces
 */
