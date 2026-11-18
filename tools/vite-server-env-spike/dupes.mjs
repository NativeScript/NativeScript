// Spike: find files the device would evaluate more than once because the dev
// server hands out several URLs for them. Walks the module graph from what
// the device actually loads (bundle.mjs imports, session entry, HMR client,
// import map) against a running `ns run` / `vite serve` dev server.
//
// Usage (from the repo root):
//   node tools/vite-server-env-spike/dupes.mjs --app tools/vite-server-env-spike/apps/ng [--origin http://localhost:5173] [--platform ios]
// Output: tools/vite-server-env-spike/out/dupes-<app>.json + a summary on stdout.

import fs from 'node:fs';
import path from 'node:path';

const spikeDir = import.meta.dirname;
const repoRoot = path.resolve(spikeDir, '../..');
const args = process.argv.slice(2);
const opt = (name, dflt) => {
	const i = args.indexOf(name);
	return i >= 0 ? args[i + 1] : dflt;
};
const appRoot = path.resolve(repoRoot, opt('--app', 'apps/toolbox'));
const origin = opt('--origin', 'http://localhost:5173');
const platform = opt('--platform', 'ios');
const maxModules = Number(opt('--max', '4000'));

const { init, parse } = await import('es-module-lexer');
await init;

const readJson = async (url) => (await fetch(url)).json();
const importMapPayload = await readJson(`${origin}/ns/import-map.json`);
const importMap = importMapPayload.importMap?.imports || importMapPayload.imports || {};
const stripParams = new Set(importMapPayload.canonicalization?.stripParams || ['t', 'v', 'import']);

// Device identity: path + query minus cache-buster params; host is irrelevant
// here because every served URL points at the same dev server.
function canonical(urlString) {
	const u = new URL(urlString);
	for (const p of [...u.searchParams.keys()]) if (stripParams.has(p)) u.searchParams.delete(p);
	u.hash = '';
	return `${u.pathname}${u.search}`;
}

function resolveBare(spec) {
	if (importMap[spec]) return importMap[spec];
	let best = null;
	for (const key of Object.keys(importMap)) {
		if (key.endsWith('/') && spec.startsWith(key) && (!best || key.length > best.length)) best = key;
	}
	return best ? importMap[best] + spec.slice(best.length) : null;
}

function resolveSpec(spec, parentUrl) {
	if (/^[a-z][a-z0-9+.-]*:/i.test(spec)) return /^https?:/i.test(spec) ? spec : null; // ns:, node:, etc. are runtime builtins
	if (spec.startsWith('/') || spec.startsWith('./') || spec.startsWith('../')) return new URL(spec, parentUrl).href;
	return resolveBare(spec);
}

const corePkgDir = fs.realpathSync(path.join(appRoot, 'node_modules/@nativescript/core'));
const workspaceRoot = repoRoot;
const fileCandidates = (base) => [`${base}.${platform}.js`, `${base}.js`, `${base}.${platform}.ts`, `${base}.ts`, `${base}/index.${platform}.js`, `${base}/index.js`, `${base}/index.${platform}.ts`, `${base}/index.ts`, base];
const firstFile = (cands) => cands.find((c) => fs.existsSync(c) && fs.statSync(c).isFile());

/** Map a canonical device URL to the file it serves, mirroring each route's rule. */
function fileFor(canon) {
	const p = decodeURIComponent(canon.split('?')[0]);
	let base = null;
	if (p === '/ns/core' || p.startsWith('/ns/core/')) {
		const sub = p.replace(/^\/ns\/core\/?/, '').replace(/^\d+\//, '');
		base = path.join(corePkgDir, sub || 'index');
	} else if (p.startsWith('/ns/m/@fs/')) {
		base = p.slice('/ns/m/@fs'.length);
	} else if (p.startsWith('/@fs/')) {
		base = p.slice('/@fs'.length);
	} else if (p.startsWith('/ns/m/')) {
		const rel = p.slice('/ns/m/'.length);
		for (const root of [appRoot, workspaceRoot]) {
			const hit = firstFile(fileCandidates(path.join(root, rel)));
			if (hit) return fs.realpathSync(hit);
		}
		return null;
	} else if (p.startsWith('/node_modules/') || p.startsWith('/src/')) {
		base = path.join(appRoot, p);
	} else {
		return null;
	}
	const hit = firstFile(fileCandidates(base));
	return hit ? fs.realpathSync(hit) : null;
}

const bundlePath = [path.join(appRoot, `.ns-vite-build/${platform}/bundle.mjs`), path.join(appRoot, '.ns-vite-build/bundle.mjs')].find((p) => fs.existsSync(p));
const seeds = [];
if (bundlePath) {
	const code = fs.readFileSync(bundlePath, 'utf8');
	for (const imp of parse(code)[0]) if (imp.n && /^https?:/.test(imp.n)) seeds.push({ url: imp.n, from: 'bundle.mjs' });
}
const session = await readJson(`${origin}/__ns_dev__/session`).catch(() => null);
if (session?.entryUrl) seeds.push({ url: session.entryUrl, from: 'session.entryUrl' });
seeds.push({ url: `${origin}/__ns_dev__/client`, from: 'session.clientUrl' });
if (args.includes('--seed-import-map')) {
	for (const [k, v] of Object.entries(importMap)) if (!k.endsWith('/')) seeds.push({ url: v, from: `import-map:${k}` });
}

const seen = new Map(); // canonical url -> { from, status, file }
const queue = [...seeds];
let fetched = 0;
while (queue.length && fetched < maxModules) {
	const { url, from } = queue.shift();
	let canon;
	try {
		canon = canonical(url);
	} catch {
		continue;
	}
	if (seen.has(canon)) continue;
	const entry = { from, status: 0, file: fileFor(canon) };
	seen.set(canon, entry);
	let body = '';
	try {
		const res = await fetch(new URL(canon, origin));
		entry.status = res.status;
		body = await res.text();
	} catch (e) {
		entry.status = -1;
		continue;
	}
	fetched++;
	if (entry.status !== 200) continue;
	const specs = new Set();
	try {
		for (const imp of parse(body)[0]) if (imp.n) specs.add(imp.n);
	} catch {
		for (const m of body.matchAll(/(?:from|import)\s*["']([^"']+)["']/g)) specs.add(m[1]);
	}
	for (const m of body.matchAll(/__ns_import\(\s*["']([^"']+)["']\s*\)/g)) specs.add(m[1]);
	const base = new URL(canon, origin).href;
	for (const s of specs) {
		const r = resolveSpec(s, base);
		if (r) queue.push({ url: r, from: canon });
	}
}

const byFile = new Map();
for (const [canon, e] of seen) {
	if (!e.file || e.status !== 200) continue;
	if (!byFile.has(e.file)) byFile.set(e.file, []);
	byFile.get(e.file).push({ url: canon, from: e.from });
}
const dupes = [...byFile].filter(([, urls]) => urls.length > 1).map(([file, urls]) => ({ file: path.relative(repoRoot, file), urls }));
const shape = (u) =>
	u
		.replace(/^\/ns\/core(\/|$).*/, '/ns/core/<sub>')
		.replace(/^\/ns\/m\/@fs\/.*/, '/ns/m/@fs/<abs>')
		.replace(/^\/ns\/m\/(?!@fs).*/, '/ns/m/<rel>');
const shapes = {};
for (const d of dupes) {
	const key = d.urls
		.map((u) => shape(u.url))
		.sort()
		.join(' + ');
	shapes[key] = (shapes[key] || 0) + 1;
}
const failed = [...seen].filter(([, e]) => e.status !== 200).map(([url, e]) => ({ url, status: e.status, from: e.from }));
const report = { origin, modulesFetched: fetched, uniqueUrls: seen.size, filesWithMultipleUrls: dupes.length, shapes, failed: failed.slice(0, 30), dupes };
const outFile = path.join(spikeDir, 'out', `dupes-${path.basename(appRoot)}.json`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, dupes: dupes.slice(0, 5), failed: failed.slice(0, 10) }, null, 2));
