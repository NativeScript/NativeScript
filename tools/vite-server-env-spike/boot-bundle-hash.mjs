// Spike: build the fixture's HMR boot bundle twice, as the CLI's `vite build`
// does under `--env.hmr`, and compare `bundle.mjs` hashes. The CLI is told
// about a rebuild only when that hash changes, so it must be stable.
//
// Usage: node --preserve-symlinks tools/vite-server-env-spike/boot-bundle-hash.mjs [--app apps/ng]

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const spikeDir = import.meta.dirname;
const args = process.argv.slice(2);
const appIdx = args.indexOf('--app');
const appRoot = path.resolve(spikeDir, appIdx >= 0 ? args[appIdx + 1] : 'apps/ng');
process.chdir(appRoot);
process.argv.splice(2);
process.argv.push('--', '--env.ios', '--env.hmr');

const nsViteDir = path.join(appRoot, 'node_modules/@nativescript/vite');
const vite = await import(pathToFileURL(path.join(nsViteDir, 'node_modules/vite/dist/node/index.js')).href);
const configFile = ['vite.config.mts', 'vite.config.ts', 'vite.config.js'].find((f) => fs.existsSync(f));

// Read the emitted chunk instead of the output folder, which the config owns.
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ns-boot-bundle-'));
process.env.NS_VITE_DIST_DIR = outDir;
const hashes = [];
for (let i = 0; i < 2; i++) {
	let code;
	const capture = {
		name: 'boot-bundle-hash',
		enforce: 'post',
		generateBundle(_options, bundle) {
			code = bundle['bundle.mjs']?.code;
		},
	};
	// The NativeScript dev config builds in watch mode: `build` returns the watcher.
	const watcher = await vite.build({ configFile, mode: 'development', logLevel: 'error', plugins: [capture] });
	if (watcher && typeof watcher.on === 'function') {
		await new Promise((resolve, reject) =>
			watcher.on('event', (event) => {
				if (event.code === 'END') resolve();
				if (event.code === 'ERROR') reject(event.error);
			}),
		);
		await watcher.close();
	}
	if (code == null) throw new Error('the build emitted no bundle.mjs');
	hashes.push(crypto.createHash('sha1').update(code).digest('hex'));
}
fs.rmSync(outDir, { recursive: true, force: true });
console.log(`bundle.mjs sha1: ${hashes.join(' ')} → ${hashes[0] === hashes[1] ? 'stable' : 'CHANGES BETWEEN IDENTICAL BUILDS'}`);
process.exit(0);
