// VIRTUAL ENTRY START
require('@nativescript/core/bundle-entry-points')

import { readdirSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

console.log('__COMMONJS__:', __COMMONJS__);

// const context = require.context("~/", /* deep: */ true, /* filter: */ /\.(xml|js|(?<!\.d\.)ts|s?css)$/);

// const modules = import.meta.glob(
//   // adjust the pattern to your layout:
//   "/src/**/*.@(xml|js|ts|scss|css)"
//   // { eager: true }  // uncomment to import immediately
// );
console.log('typeof import.meta.glob:', typeof import.meta.glob);
if (typeof import.meta.glob !== 'undefined') {
	// Vite environment
	const modules = import.meta.glob(
		// adjust the pattern to your layout:
		'~/**/*.@(xml|js|ts|scss|css)',
		{ eager: true }, // uncomment to import immediately
	);
	global.registerBundlerModules(modules);
} else {
	const require = createRequire(import.meta.url);
	const root = fileURLToPath(new URL('./src', import.meta.url));

	/**
	 * Recursively walk `dir`, collecting all files whose extension is in `exts`,
	 * ignoring any `*.d.ts` files.
	 */
	function collectFilesSync(
		dir,
		exts = ['.xml', '.js', '.ts', '.css', '.scss'],
	) {
		let results = [];
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const full = join(dir, entry.name);

			if (entry.isDirectory()) {
				results = results.concat(collectFilesSync(full, exts));
			} else {
				// skip declaration files
				if (entry.name.endsWith('.d.ts')) continue;
				// filter by extension
				if (exts.includes(extname(entry.name))) {
					results.push(full);
				}
			}
		}
		return results;
	}

	/**
	 * Synchronously load every matching module under `./src`,
	 * keyed by its path relative to `root`.
	 */
	function loadContextSync() {
		const files = collectFilesSync(root);
		const context = {};

		for (const fullPath of files) {
			// make the key look like fast‑glob’s relative paths
			const relPath = relative(root, fullPath).replace(/\\/g, '/');
			// require() each module
			context[relPath] = require(fullPath);
		}

		return context;
	}
	const context = loadContextSync();

	global.registerBundlerModules(context);
}
// VIRTUAL ENTRY END
