// Spike: validate the thin device mode server-side.
// Boots an app's real flavor config, then walks the module graph the device
// would load (session entry, HMR bootstrap, import map) through /ns/v.
//
// Usage (from the repo root):
//   node tools/vite-server-env-spike/thin-crawl.mjs --app tools/vite-server-env-spike/apps/ng --flavor angular
// Output: tools/vite-server-env-spike/out/thin-crawl-<app>.json + summary on stdout.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const spikeDir = import.meta.dirname;
const repoRoot = path.resolve(spikeDir, '../..');
const args = process.argv.slice(2);
const take = (name, dflt) => {
	const i = args.indexOf(name);
	return i >= 0 ? args.splice(i, 2)[1] : dflt;
};
const appRoot = path.resolve(repoRoot, take('--app', 'apps/toolbox'));
const flavor = take('--flavor', 'typescript');
const platform = take('--platform', 'ios');

process.chdir(appRoot);
process.argv.push('--', `--env.${platform}`, '--env.hmr');
process.env.NS_HMR_PORT = process.env.NS_HMR_PORT || '5199';

const { createServer } = await import('vite');
const { init, parse } = await import('es-module-lexer');
const mod = await import(pathToFileURL(path.join(appRoot, `node_modules/@nativescript/vite/configuration/${flavor}.js`)).href);
const config = await mod[`${flavor}Config`]({ mode: 'development' });
const server = await createServer({ ...config, root: appRoot, configFile: false });
await server.listen();
await init;
const local = `http://localhost:${server.config.server.port}`;

const session = await (await fetch(`${local}/__ns_dev__/session`)).json();
const runtimeConfig = await (await fetch(`${local}/ns/import-map.json`)).json();
const importMap = runtimeConfig.importMap.imports || {};
const deviceOrigin = new URL(session.entryUrl).origin;
const toLocal = (u) => u.replace(deviceOrigin, local);

const seeds = [
	{ url: session.entryUrl, from: 'session.entryUrl' },
	{ url: `${deviceOrigin}/__ns_dev__/client`, from: 'session.clientUrl' },
];
// The bootstrap imports some modules via variables (`import(clientUrl)`), which the lexer cannot follow.
const bootstrapCode = await (await fetch(`${local}/__ns_dev__/client`)).text();
for (const m of bootstrapCode.matchAll(/"(https?:\/\/[^"]+\/ns\/v\/[^"]+)"/g)) seeds.push({ url: m[1], from: 'bootstrap-string' });

const seen = new Map();
const leaks = [];
const bareMissing = new Map();
const bareUsed = new Map();
const cjsLike = [];
const queue = [...seeds];
const fileOf = (u) => {
	const p = new URL(u).pathname;
	if (!p.startsWith('/ns/v/')) return null;
	const vite = decodeURIComponent(p.slice('/ns/v'.length));
	if (vite.startsWith('/@fs/')) return vite.slice('/@fs'.length);
	if (vite.startsWith('/@id/')) return `virtual:${vite}`;
	if (vite === '/@vite/client') return 'shim:/@vite/client';
	return path.join(appRoot, vite);
};
const identity = (u) => {
	const x = new URL(u);
	for (const p of ['t', 'v', 'import']) x.searchParams.delete(p);
	return `${x.pathname}${x.search}`;
};

while (queue.length) {
	const { url, from } = queue.shift();
	const key = identity(url);
	if (seen.has(key)) continue;
	const entry = { from, status: 0, bytes: 0 };
	seen.set(key, entry);
	let body = '';
	try {
		const res = await fetch(toLocal(url));
		entry.status = res.status;
		body = await res.text();
		entry.bytes = body.length;
	} catch (e) {
		entry.status = -1;
		entry.error = String(e?.message || e);
		continue;
	}
	if (entry.status !== 200) {
		entry.error = body.slice(0, 300);
		continue;
	}
	const cjsHits = body.match(/(^|[^.\w$'"])(module\.exports|exports\.[A-Za-z_$][\w$]*\s*=|typeof module\b|typeof exports\b)/gm);
	if (cjsHits && !body.includes('__cjs_mod')) {
		cjsLike.push({ key, hits: [...new Set(cjsHits.map((h) => h.trim()))].slice(0, 3) });
	}
	let imports = [];
	try {
		imports = parse(body)[0];
	} catch (e) {
		entry.parseError = String(e?.message || e);
	}
	for (const imp of imports) {
		const spec = imp.n;
		if (!spec || imp.d === -2) continue;
		let target = null;
		if (/^https?:\/\//.test(spec)) target = spec;
		else if (spec.startsWith('./') || spec.startsWith('../')) target = new URL(spec, url).href;
		else if (spec.startsWith('/')) target = new URL(spec, url).href;
		else if (/^[a-z][a-z0-9+.-]*:/i.test(spec))
			continue; // ns:, node: builtins
		else if (importMap[spec]) {
			target = importMap[spec];
			if (!bareUsed.has(spec)) bareUsed.set(spec, key);
		} else {
			if (!bareMissing.has(spec)) bareMissing.set(spec, key);
			continue;
		}
		const p = new URL(target).pathname;
		if (!p.startsWith('/ns/v/') && p !== '/@nativescript/vendor.mjs') leaks.push({ spec: target, from: key });
		queue.push({ url: target, from: key });
	}
}

const byFile = new Map();
for (const [key] of seen) {
	const file = fileOf(`${local}${key}`);
	if (!file) continue;
	let real = file;
	try {
		real = fs.realpathSync(file);
	} catch {}
	if (!byFile.has(real)) byFile.set(real, []);
	byFile.get(real).push(key);
}
const dupes = [...byFile].filter(([, keys]) => keys.length > 1).map(([file, keys]) => ({ file, keys }));
const failed = [...seen].filter(([, e]) => e.status !== 200).map(([url, e]) => ({ url, status: e.status, from: e.from, error: e.error }));
const report = {
	entryUrl: session.entryUrl,
	importMapEntries: Object.keys(importMap).length,
	modules: seen.size,
	totalBytes: [...seen.values()].reduce((n, e) => n + e.bytes, 0),
	failed,
	leaks: leaks.slice(0, 40),
	leakCount: leaks.length,
	bareMissing: Object.fromEntries(bareMissing),
	bareUsed: Object.fromEntries(bareUsed),
	cjsLike,
	dupes,
	urls: [...seen.keys()],
};
fs.mkdirSync(path.join(spikeDir, 'out'), { recursive: true });
fs.writeFileSync(path.join(spikeDir, 'out', `thin-crawl-${path.basename(appRoot)}.json`), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, urls: undefined, failed: failed.slice(0, 8), leaks: leaks.slice(0, 8), dupes: dupes.slice(0, 5) }, null, 2));
await server.close();
process.exit(0);
