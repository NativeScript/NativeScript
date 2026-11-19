// Spike: validate the thin device mode server-side.
// Boots an app's real flavor config, then loads what the device would load
// (client bootstrap, its HMR client, session entry, import-map targets) by
// plain Vite URLs, resolving every import the way the iOS runtime does
// (see device-resolve.mjs).
//
// Usage (from the repo root):
//   node tools/vite-server-env-spike/thin-crawl.mjs --app tools/vite-server-env-spike/apps/ng --flavor angular [--platform ios] [--bundle <bundle.mjs>]
// --bundle  also load the absolute URLs baked into a built HMR bundle.mjs (the core externals)
// Output: tools/vite-server-env-spike/out/thin-crawl-<app>.json + summary on stdout; exits 1 on any failure.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { FAILURE_KINDS, isHttpUrl, loadableStatus, resolveDeviceImport } from './device-resolve.mjs';

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
const bundleArg = take('--bundle', '');
const bundleFile = bundleArg ? path.resolve(bundleArg) : null;

process.chdir(appRoot);
process.argv.splice(2);
process.argv.push('--', `--env.${platform}`, '--env.hmr');
process.env.NS_HMR_PORT = process.env.NS_HMR_PORT || '5199';

// The flavor config's plugins run on the vite copy next to @nativescript/vite.
const nsViteDir = path.join(appRoot, 'node_modules/@nativescript/vite');
const viteReq = createRequire(path.join(nsViteDir, 'package.json'));
const { createServer } = await import(pathToFileURL(viteReq.resolve('vite')).href);
const { init, parse } = await import(pathToFileURL(viteReq.resolve('es-module-lexer')).href);
const mod = await import(pathToFileURL(path.join(nsViteDir, `configuration/${flavor}.js`)).href);
const config = await mod[`${flavor}Config`]({ mode: 'development' });
const server = await createServer({ ...config, root: appRoot, configFile: false, mode: 'development' });
await server.listen();
await init;
const local = `http://localhost:${server.config.server.port}`;
const graph = server.environments.client.moduleGraph;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const session = await (await fetch(`${local}/__ns_dev__/session`)).json();
const deviceOrigin = new URL(session.entryUrl).origin;
const sessionFailures = [];
for (const key of ['entryUrl', 'clientUrl', 'runtimeConfigUrl']) {
	const v = session[key];
	if (typeof v !== 'string' || !isHttpUrl(v)) sessionFailures.push({ key, value: v, error: 'not an absolute http(s) URL' });
	else if (new URL(v).origin !== deviceOrigin) sessionFailures.push({ key, value: v, error: `origin differs from entryUrl's ${deviceOrigin}` });
	else if (new URL(v).pathname.startsWith('/ns/')) sessionFailures.push({ key, value: v, error: 'legacy /ns/ route' });
}
const toLocal = (url) => {
	const u = new URL(url);
	return u.origin === deviceOrigin ? `${local}${u.pathname}${u.search}` : null;
};

const mapUrl = session.runtimeConfigUrl;
const runtimeConfig = await (await fetch(toLocal(mapUrl))).json();
const importMap = runtimeConfig.importMap ?? {};

const bootstrapCode = await (await fetch(toLocal(session.clientUrl))).text();
const hmrClientMatch = bootstrapCode.match(/const __nsHmrClientUrl = ("(?:[^"\\]|\\.)*")/);
const hmrClientUrl = hmrClientMatch ? JSON.parse(hmrClientMatch[1]) : null;
if (!hmrClientUrl) sessionFailures.push({ key: '__nsHmrClientUrl', error: 'not found in the client bootstrap' });

const queue = [{ url: session.clientUrl, from: 'session.clientUrl' }, ...(hmrClientUrl ? [{ url: hmrClientUrl, from: 'bootstrap.__nsHmrClientUrl' }] : []), { url: session.entryUrl, from: 'session.entryUrl' }];
// Loaded after what the app reaches, so the per-prefix counts can separate the two.
const mapSeeds = [];
for (const [spec, target] of Object.entries(importMap.imports ?? {})) mapSeeds.push({ url: new URL(target, mapUrl).href, from: `importMap.imports[${spec}]` });
for (const [scope, entries] of Object.entries(importMap.scopes ?? {})) {
	for (const [spec, target] of Object.entries(entries)) mapSeeds.push({ url: new URL(target, mapUrl).href, from: `importMap.scopes[${scope}][${spec}]` });
}
const bundle = bundleFile ? { file: bundleFile, urls: [], originMismatch: [] } : null;
if (bundle) {
	const code = fs.readFileSync(bundleFile, 'utf8');
	for (const m of new Set([...code.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)].map((m) => m[1]))) {
		const u = new URL(m);
		// The bundle also bakes in the bare origin and unrelated URLs; only module URLs are loaded.
		if (!/^\/(node_modules|src|@fs|@id|@vite|__ns_dev__)\//.test(u.pathname)) continue;
		if (u.origin !== deviceOrigin) bundle.originMismatch.push(m);
		bundle.urls.push(m);
		queue.push({ url: `${deviceOrigin}${u.pathname}${u.search}`, from: 'bundle.mjs' });
	}
}

const PREFIXES = ['/node_modules/.vite/', '/node_modules/', '/src/', '/@fs/', '/@id/', '/@vite/', '/__ns_dev__/'];
const prefixOf = (pathname) => PREFIXES.find((p) => pathname.startsWith(p))?.replace(/\/$/, '') ?? 'other';

const fetched = new Map();
const bodies = new Map();
const failures = { fetch: [], foreignOrigin: [], dynamicNotAbsolute: [], bareMissing: [], nonPlain: [] };
const nonLiteralDynamic = [];
const builtins = new Map();
const bareUsed = new Map();
const cjsLike = [];

let deviceReached = null;
for (;;) {
	if (!queue.length) {
		if (deviceReached) break;
		deviceReached = new Set(fetched.keys());
		queue.push(...mapSeeds);
		continue;
	}
	const { url, from } = queue.shift();
	const href = new URL(url).href.replace(/#.*$/, '');
	if (fetched.has(href)) continue;
	const entry = { from, status: 0, bytes: 0 };
	fetched.set(href, entry);
	const { pathname } = new URL(href);
	entry.prefix = prefixOf(pathname);
	if (pathname.startsWith('/ns/') || pathname.startsWith('/@nativescript/')) failures.nonPlain.push({ url: href, from });
	const target = toLocal(href);
	if (!target) {
		entry.status = -2;
		failures.foreignOrigin.push({ url: href, from });
		continue;
	}
	let body = '';
	try {
		const res = await fetch(target);
		entry.status = res.status;
		entry.contentType = res.headers.get('content-type');
		body = await res.text();
		entry.bytes = body.length;
	} catch (e) {
		entry.status = -1;
		entry.error = String(e?.message || e);
		failures.fetch.push({ url: href, from, status: -1, error: entry.error });
		continue;
	}
	if (!loadableStatus(entry.status)) {
		entry.error = body.slice(0, 300);
		failures.fetch.push({ url: href, from, status: entry.status, error: entry.error });
		continue;
	}
	bodies.set(href, body);
	const cjsHits = body.match(/(^|[^.\w$'"])(module\.exports|exports\.[A-Za-z_$][\w$]*\s*=|typeof module\b|typeof exports\b)/gm);
	if (cjsHits && !body.includes('__cjs_mod')) cjsLike.push({ url: href, hits: [...new Set(cjsHits.map((h) => h.trim()))].slice(0, 3) });
	let imports = [];
	try {
		imports = parse(body)[0];
	} catch (e) {
		entry.parseError = String(e?.message || e);
	}
	for (const imp of imports) {
		const r = resolveDeviceImport(imp, href, importMap, mapUrl);
		if (!r) continue;
		if (r.kind === 'non-literal') nonLiteralDynamic.push({ from: href, expr: body.slice(imp.s, imp.e).slice(0, 120) });
		else if (r.kind === 'builtin') builtins.has(r.spec) || builtins.set(r.spec, href);
		else if (r.kind === 'bare-missing') failures.bareMissing.push({ spec: r.spec, from: href, dynamic: imp.d > -1 });
		else if (r.kind === 'dynamic-not-absolute') failures.dynamicNotAbsolute.push({ spec: r.spec, from: href });
		else {
			if (r.bare && !bareUsed.has(r.spec)) bareUsed.set(r.spec, href);
			queue.push({ url: r.url, from: href });
		}
		if (FAILURE_KINDS.has(r.kind)) entry.failedImports = (entry.failedImports ?? 0) + 1;
	}
}

// Vite pre-transforms a served module's imports after responding, so wait for the graph to stop growing.
async function quiescentGraphSize() {
	let last = -1;
	for (let i = 0; i < 40; i++) {
		const n = graph.urlToModuleMap.size;
		if (n === last) return n;
		last = n;
		await sleep(300);
	}
	return graph.urlToModuleMap.size;
}

// A re-fetch after `invalidateModules` appends `__ns_dev_nonce`; the server must strip it before Vite sees the URL.
const nonce = [];
{
	// The second candidate exercises the `&` form; after a reboot the device re-fetches `?t=` URLs.
	const withQuery = [...bodies.keys()].find((u) => new URL(u).search && !new URL(u).pathname.startsWith('/__ns_dev__/')) ?? `${session.entryUrl}?t=1`;
	const candidates = [session.entryUrl, withQuery];
	for (const url of candidates) {
		const plain = await (await fetch(toLocal(url))).text();
		const before = await quiescentGraphSize();
		const nonceUrl = `${url}${new URL(url).search ? '&' : '?'}__ns_dev_nonce=1-1`;
		const res = await fetch(toLocal(nonceUrl));
		const body = await res.text();
		const after = await quiescentGraphSize();
		const sameBody = body === plain;
		nonce.push({ url: nonceUrl, status: res.status, sameBody, graphSizeBefore: before, graphSizeAfter: after, ok: loadableStatus(res.status) && sameBody && before === after });
	}
}

const strip = (search, names) => {
	const q = new URLSearchParams(search);
	for (const n of names) q.delete(n);
	const s = q.toString();
	return s ? `?${s}` : '';
};
const real = (file) => {
	try {
		return fs.realpathSync(file);
	} catch {
		return file;
	}
};
const thinClientFile = path.join(nsViteDir, 'hmr/client/thin-vite-client.js');
// Every module identity a device URL evaluates as; two URLs sharing one evaluate the same code twice.
async function identitiesOf(href) {
	const u = new URL(href);
	const ids = new Set();
	if (u.pathname === '/@vite/client' && fs.existsSync(thinClientFile)) ids.add(`file:${real(thinClientFile)}`);
	if (u.pathname.startsWith('/__ns_dev__/')) {
		ids.add(`ns-dev:${u.pathname}${strip(u.search, ['t', 'v', 'import'])}`);
		return ids;
	}
	const key = `${u.pathname}${strip(u.search, ['t', 'import'])}`;
	let m = graph.urlToModuleMap.get(key);
	if (!m) {
		try {
			m = await graph.getModuleByUrl(key);
		} catch {}
	}
	if (m?.file) {
		const q = m.id?.includes('?') ? m.id.slice(m.id.indexOf('?')) : '';
		ids.add(`file:${real(m.file)}${q}`);
		return ids;
	}
	const rest = strip(u.search, ['t', 'v', 'import']);
	const p = decodeURIComponent(u.pathname);
	if (p.startsWith('/@fs/')) ids.add(`file:${real(p.slice('/@fs'.length))}${rest}`);
	else if (p.startsWith('/@id/')) ids.add(`virtual:${p.slice('/@id/'.length).replace(/^__x00__/, '\0')}${rest}`);
	else if (fs.existsSync(path.join(appRoot, p))) ids.add(`file:${real(path.join(appRoot, p))}${rest}`);
	else ids.add(`url:${p}${rest}`);
	return ids;
}
const byIdentity = new Map();
for (const href of bodies.keys()) {
	for (const id of await identitiesOf(href)) {
		if (!byIdentity.has(id)) byIdentity.set(id, new Set());
		byIdentity.get(id).add(href);
	}
}
const dupeGroups = new Map();
for (const [identity, urls] of byIdentity) {
	if (urls.size < 2) continue;
	const k = [...urls].sort().join('\n');
	if (!dupeGroups.has(k)) dupeGroups.set(k, { identity, urls: [...urls].sort() });
}
const duplicates = [...dupeGroups.values()];

const countByPrefix = (urls) => {
	const out = {};
	for (const u of urls) out[fetched.get(u).prefix] = (out[fetched.get(u).prefix] ?? 0) + 1;
	return out;
};
const requestsByPrefix = { device: countByPrefix(deviceReached), all: countByPrefix(fetched.keys()) };
const emptyBodies = [...bodies].filter(([, b]) => b.length === 0).map(([u]) => u);
const failureCount = sessionFailures.length + Object.values(failures).reduce((n, list) => n + list.length, 0) + nonce.filter((n) => !n.ok).length + (bundle?.originMismatch.length ?? 0);

const report = {
	app: path.basename(appRoot),
	flavor,
	platform,
	deviceOrigin,
	session: { entryUrl: session.entryUrl, clientUrl: session.clientUrl, runtimeConfigUrl: session.runtimeConfigUrl, hmrClientUrl },
	importMapEntries: Object.keys(importMap.imports ?? {}).length,
	importMapScopes: Object.keys(importMap.scopes ?? {}).length,
	importMap: importMap.imports,
	volatilePatterns: runtimeConfig.volatilePatterns,
	canonicalization: runtimeConfig.canonicalization,
	modules: fetched.size,
	deviceModules: deviceReached.size,
	deviceBytes: [...deviceReached].reduce((n, u) => n + fetched.get(u).bytes, 0),
	totalBytes: [...fetched.values()].reduce((n, e) => n + e.bytes, 0),
	requestsByPrefix,
	failureCount,
	sessionFailures,
	failures,
	nonce,
	duplicateCount: duplicates.length,
	duplicates,
	emptyBodies: { count: emptyBodies.length, urls: emptyBodies },
	nonLiteralDynamic,
	builtins: Object.fromEntries(builtins),
	bareUsed: Object.fromEntries(bareUsed),
	cjsLike,
	bundle,
	bootstrapSha1: crypto.createHash('sha1').update(bootstrapCode).digest('hex'),
	urls: Object.fromEntries([...fetched].map(([u, e]) => [u, { from: e.from, status: e.status, bytes: e.bytes, contentType: e.contentType }])),
};
fs.mkdirSync(path.join(spikeDir, 'out'), { recursive: true });
const outFile = path.join(spikeDir, 'out', `thin-crawl-${report.app}.json`);
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

const top = (list, n = 8) => list.slice(0, n).map((x) => `      ${JSON.stringify(x)}`);
const lines = [
	`thin-crawl ${report.app} (${flavor}/${platform}) origin=${deviceOrigin}`,
	`  entry ${session.entryUrl}`,
	`  hmr client ${hmrClientUrl}`,
	`  modules reached by the app ${report.deviceModules} (${(report.deviceBytes / 1024).toFixed(0)} KiB); with every import-map target ${report.modules} (${(report.totalBytes / 1024).toFixed(0)} KiB); import map ${report.importMapEntries} entries`,
	...Object.entries(requestsByPrefix).map(
		([k, counts]) =>
			`  requests (${k}) ${Object.entries(counts)
				.map(([p, n]) => `${p}=${n}`)
				.join(' ')}`,
	),
	`  empty 200 bodies ${emptyBodies.length}`,
	`  non-literal dynamic imports ${nonLiteralDynamic.length} (listed, not followed)`,
	`  session failures ${sessionFailures.length}`,
	...top(sessionFailures),
];
for (const [k, list] of Object.entries(failures)) lines.push(`  ${k} ${list.length}`, ...top(list));
lines.push(`  nonce ${nonce.map((n) => `${n.ok ? 'ok' : 'FAIL'} status=${n.status} sameBody=${n.sameBody} graph ${n.graphSizeBefore}->${n.graphSizeAfter} ${n.url}`).join('; ') || 'NOT RUN'}`);
lines.push(`  duplicate modules ${duplicates.length}`, ...top(duplicates, 5));
if (bundle) lines.push(`  bundle.mjs ${bundle.urls.length} URLs, origin mismatches ${bundle.originMismatch.length}`, ...top(bundle.originMismatch));
const ok = failureCount === 0 && duplicates.length === 0 && nonce.length > 0;
lines.push(`${ok ? 'PASS' : 'FAIL'} failures=${failureCount} duplicates=${duplicates.length} → ${path.relative(repoRoot, outFile)}`);
console.log(lines.join('\n'));
await server.close();
process.exit(ok ? 0 : 1);
