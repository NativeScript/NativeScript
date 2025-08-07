import './globals';

import './debugger/webinspector-network';
import './debugger/webinspector-dom';
import './debugger/webinspector-css';
// require('./debugger/webinspector-network');
// require('./debugger/webinspector-dom');
// require('./debugger/webinspector-css');

/**
 * Source map remapping for stack traces for the runtime in-flight error displays
 * Currently this is very slow. Need to find much faster way to remap stack traces.
 * NOTE: This likely should not be in core because errors can happen on boot before core is fully loaded. Ideally the runtime should provide this in full but unsure.
 */
import { File, knownFolders } from './file-system';
import { SourceMapConsumer } from 'source-map-js';

// note: webpack config can by default use 'source-map' files with runtimes v9+
// helps avoid having to decode the inline base64 source maps
// currently same performance on inline vs file source maps so file source maps may just be cleaner
const usingSourceMapFiles = true;
let loadedSourceMaps: Map<string, any>;
let consumerCache: Map<string, any>;

function getConsumer(mapPath: string, sourceMap: any): SourceMapConsumer {
	if (!consumerCache) {
		consumerCache = new Map();
	}
	let c = consumerCache.get(mapPath);
	if (!c) {
		// parse once
		c = new SourceMapConsumer(sourceMap);
		consumerCache.set(mapPath, c);
	}
	return c;
}

function loadAndExtractMap(mapPath: string) {
	// check cache first
	if (!loadedSourceMaps) {
		loadedSourceMaps = new Map();
	}
	let mapText = loadedSourceMaps.get(mapPath);
	// Note: not sure if separate source map files or inline is better
	// need to test build times one way or other with webpack, vite and rspack
	// but this handles either way
	if (mapText) {
		return mapText; // already loaded
	} else {
		if (File.exists(mapPath)) {
			const contents = File.fromPath(mapPath).readTextSync();
			if (usingSourceMapFiles) {
				mapText = contents;
			} else {
				// parse out the inline base64
				const match = contents.match(/\/\/[#@] sourceMappingURL=data:application\/json[^,]+,(.+)$/);
				const base64 = match[1];
				const binary = atob(base64);
				// this is the raw text of the source map
				// seems to work without doing the decodeURIComponent trick
				mapText = binary;
				// // escape each char code into %XX and let decodeURIComponent build the UTF-8 string
				// mapText = decodeURIComponent(
				//   binary
				//     .split('')
				//     .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
				//     .join('')
				// );
			}
		} else {
			// no source maps
			return { source: null, line: 0, column: 0 };
		}
	}
	loadedSourceMaps.set(mapPath, mapText); // cache it
	return mapText;
}

function remapFrame(file: string, line: number, column: number) {
	/**
	 * webpack config can use source map files or inline.
	 * To use source map files, run with `--env.sourceMap=source-map`.
	 * @nativescript/webpack 5.1 enables `source-map` files by default when using runtimes v9+.
	 */

	const appPath = knownFolders.currentApp().path;
	let sourceMapFileExt = '';
	if (usingSourceMapFiles) {
		sourceMapFileExt = '.map';
	}
	const mapPath = `${appPath}/${file.replace('file:///app/', '')}${sourceMapFileExt}`;

	// 3) hand it to the consumer
	const sourceMap = loadAndExtractMap(mapPath);
	const consumer = getConsumer(mapPath, sourceMap);
	return consumer.originalPositionFor({ line, column });
}

function remapStack(raw: string): string {
	const lines = raw.split('\n');
	const out = lines.map((line) => {
		const m = /\((.+):(\d+):(\d+)\)/.exec(line);
		if (!m) return line;
		const [_, file, l, c] = m;
		const orig = remapFrame(file, +l, +c);
		if (!orig.source) return line;
		return line.replace(/\(.+\)/, `(${orig.source}:${orig.line}:${orig.column})`);
	});
	return out.join('\n');
}

/**
 * Added in 9.0 runtimes.
 * Allows the runtime to remap stack traces before displaying them in the in-flight error screens.
 */
(global as any).__ns_remapStack = (rawStack: string) => {
	console.log('Remapping stack trace...');
	return remapStack(rawStack);
};
/**
 * End of source map remapping for stack traces
 */
