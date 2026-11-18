// Spike: load an app's vite.config.* through Vite's own config loader (as
// `vite serve --config` does under the CLI) and try one transform.
//
// Usage (from the app dir): node --preserve-symlinks <repo>/tools/vite-server-env-spike/config-load.mjs <url>

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const url = process.argv[2] || '/node_modules/@angular/common/fesm2022/common.mjs';
process.argv.push('--', '--env.ios', '--env.hmr');
process.env.NS_HMR_PORT = process.env.NS_HMR_PORT || '5198';

const vitePath = createRequire(path.join(process.cwd(), 'package.json')).resolve('vite');
const { createServer } = await import(vitePath);
const configFile = ['vite.config.mts', 'vite.config.ts', 'vite.config.js'].find((f) => fs.existsSync(f));
const server = await createServer({ configFile, mode: 'development' });
console.log('vite from:', vitePath);
try {
	const r = await server.transformRequest(url);
	console.log('transform ok', r?.code?.length);
} catch (e) {
	console.log('transform error:', String(e?.message || e).slice(0, 220));
}
await server.close();
process.exit(0);
