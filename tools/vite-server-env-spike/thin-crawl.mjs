// Spike: validate the thin device mode server-side.
// Boots an app's real flavor config, then loads what the device would load
// (client bootstrap, its HMR client, session entry, import-map targets) by
// plain Vite URLs, resolving every import the way the iOS runtime does
// (see device-resolve.mjs).
//
// Usage (from the repo root):
//   node tools/vite-server-env-spike/thin-crawl.mjs --app tools/vite-server-env-spike/apps/ng --flavor angular [--platform ios] [--bundle <bundle.mjs>] [--allow-dup-instances]
// --bundle  also load the absolute URLs baked into a built HMR bundle.mjs (the dev boot module and
//   everything it imports) and the bare specifiers it leaves to the import map, and fail on any core URL
//   baked there; without it, core identity vs bundle.mjs is unchecked
// --optimize-include a,b  add these to the flavor config's optimizeDeps.include (forces a dep optimizer)
// --allow-dup-instances  report source files evaluated in more than one instance (inlined in a
//   bundle and also served, or inlined in two bundles) as a warning instead of a failure
// --vite-config  boot from the app's own vite.config.* (as the CLI does) instead of the bare flavor config
// --seed <path>  (repeatable) also load this Vite URL after the import-map targets, e.g. a page
//   module the app only reaches by navigation
// Output: tools/vite-server-env-spike/out/thin-crawl-<app>.json + summary on stdout; exits 1 on any failure.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { FAILURE_KINDS, isHttpUrl, loadableStatus, resolveDeviceImport } from './device-resolve.mjs';
import { classifyDepRequires, isKnownUncalledGlobalRequire, isStrictGlobalRequireShadow, REQUIRE_TOKEN_RE, scanRequires } from './require-scan.mjs';

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
const optimizeInclude = take('--optimize-include', '').split(',').filter(Boolean);
const useAppViteConfig = args.includes('--vite-config');
const allowDupInstances = args.includes('--allow-dup-instances');
const extraSeeds = [];
for (let i; (i = args.indexOf('--seed')) >= 0;) extraSeeds.push(args.splice(i, 2)[1]);
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
let server;
if (useAppViteConfig) {
	const configFile = ['vite.config.mts', 'vite.config.ts', 'vite.config.js', 'vite.config.mjs'].map((f) => path.join(appRoot, f)).find((f) => fs.existsSync(f));
	if (!configFile) throw new Error(`--vite-config: no vite.config.* in ${appRoot}`);
	server = await createServer({ root: appRoot, configFile, mode: 'development' });
} else {
	const mod = await import(pathToFileURL(path.join(nsViteDir, `configuration/${flavor}.js`)).href);
	const config = await mod[`${flavor}Config`]({ mode: 'development' });
	// As an app's own `optimizeDeps.include`, which nsOptimizeDepsPolicyPlugin keeps.
	if (optimizeInclude.length) config.optimizeDeps = { ...config.optimizeDeps, include: [...(config.optimizeDeps?.include ?? []), ...optimizeInclude] };
	server = await createServer({ ...config, root: appRoot, configFile: false, mode: 'development' });
}
await server.listen();
const optimizerState = () => {
	const md = server.environments.client.depsOptimizer?.metadata;
	let diskBrowserHash = null;
	try {
		diskBrowserHash = JSON.parse(fs.readFileSync(path.join(server.config.cacheDir, 'deps/_metadata.json'), 'utf8')).browserHash;
	} catch {}
	return { browserHash: md?.browserHash ?? null, hash: md?.hash ?? null, optimized: md ? Object.keys(md.optimized).length : null, discovered: md ? Object.keys(md.discovered ?? {}).length : null, diskBrowserHash };
};
const optimizerAtStart = optimizerState();
// Deps the request path registers (import analysis, the import map's resolver) beyond what the scan found;
// the scan itself adds its deps without going through registerMissingImport. `phase` says which request did.
const depsOptimizerRef = server.environments.client.depsOptimizer;
const registeredMissing = [];
let crawlPhase = 'startup';
if (depsOptimizerRef?.registerMissingImport) {
	const register = depsOptimizerRef.registerMissingImport.bind(depsOptimizerRef);
	depsOptimizerRef.registerMissingImport = (id, resolved) => {
		const md = depsOptimizerRef.metadata;
		const known = !!(md.optimized[id] || md.chunks?.[id] || md.discovered[id]);
		if (!known) registeredMissing.push({ id, resolved, phase: crawlPhase });
		return register(id, resolved);
	};
}
let optimizerAfterScan = null;
const scanDone = Promise.resolve(depsOptimizerRef?.scanProcessing).then(() => {
	optimizerAfterScan = optimizerState();
});
// No device is connected, so a payload sent here would otherwise vanish; a re-optimization shows up as `full-reload`.
const hotSent = [];
const channels = new Map();
for (const [name, ch] of [
	['ws', server.ws],
	['environments.client.hot', server.environments.client.hot],
]) {
	if (ch?.send && !channels.has(ch)) channels.set(ch, name);
}
for (const [ch, name] of channels) {
	const send = ch.send.bind(ch);
	ch.send = (...a) => {
		const p = typeof a[0] === 'string' ? { type: 'custom', event: a[0] } : a[0];
		hotSent.push({ channel: name, type: p?.type, event: p?.event, path: p?.path, triggeredBy: p?.triggeredBy });
		return send(...a);
	};
}
await init;
const local = `http://localhost:${server.config.server.port}`;
const graph = server.environments.client.moduleGraph;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The session descriptor and the loader config are served as modules (`export default {…};`).
const fetchModuleJson = async (url) => JSON.parse((await (await fetch(url)).text()).replace(/^export default /, '').replace(/;\s*$/, ''));
const session = await fetchModuleJson(`${local}/__ns_dev__/session.mjs`);
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
crawlPhase = 'import-map (start)';
const runtimeConfig = await fetchModuleJson(toLocal(mapUrl));
crawlPhase = 'crawl';
const importMap = runtimeConfig.importMap ?? {};

// The client bootstrap is served through Vite; its dynamic import of the HMR client is absolute on the wire.
const bootstrapCode = await (await fetch(toLocal(session.clientUrl))).text();
const hmrClientMatch = bootstrapCode.match(/import\((["'])(https?:\/\/[^"']+\/hmr\/client\/index\.[jt]s(?:\?[^"']*)?)\1\)/);
const hmrClientUrl = hmrClientMatch ? hmrClientMatch[2] : null;
if (!hmrClientUrl) sessionFailures.push({ key: 'hmrClient', error: 'no absolute dynamic import of hmr/client/index in the client bootstrap' });

const queue = [{ url: session.clientUrl, from: 'session.clientUrl' }, ...(hmrClientUrl ? [{ url: hmrClientUrl, from: 'bootstrap.hmrClient' }] : []), { url: session.entryUrl, from: 'session.entryUrl' }];
// Loaded after what the app reaches, so the per-prefix counts can separate the two.
const mapSeeds = [];
for (const [spec, target] of Object.entries(importMap.imports ?? {})) mapSeeds.push({ url: new URL(target, mapUrl).href, from: `importMap.imports[${spec}]` });
for (const [scope, entries] of Object.entries(importMap.scopes ?? {})) {
	for (const [spec, target] of Object.entries(entries)) mapSeeds.push({ url: new URL(target, mapUrl).href, from: `importMap.scopes[${scope}][${spec}]` });
}
for (const seed of extraSeeds) mapSeeds.push({ url: new URL(seed, deviceOrigin).href, from: `--seed ${seed}` });
const bundle = bundleFile ? { file: bundleFile, urls: [], coreUrls: [], originMismatch: [], bareSpecifiers: [], bareMissing: [], localImports: 0, nonLiteralDynamic: [] } : null;
let bundleCode = '';
if (bundle) {
	bundleCode = fs.readFileSync(bundleFile, 'utf8');
	for (const m of new Set([...bundleCode.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)].map((m) => m[1]))) {
		const u = new URL(m);
		// The bundle also bakes in the bare origin and unrelated URLs; only module URLs are loaded.
		if (!/^\/(node_modules|src|@fs|@id|@vite|__ns_dev__)\//.test(u.pathname)) continue;
		if (u.origin !== deviceOrigin) bundle.originMismatch.push(m);
		bundle.urls.push(m);
		// bundle.mjs is built before the dev server knows the optimizer's hash: a core URL baked there
		// can't match the one import analysis writes.
		if (/\/@nativescript\/core\/|\/packages\/core\//.test(u.pathname)) bundle.coreUrls.push(m);
		queue.push({ url: `${deviceOrigin}${u.pathname}${u.search}`, from: 'bundle.mjs' });
	}
	// bundle.mjs is evaluated from the app's files on device, so a relative import stays local and
	// a bare one goes through the import map.
	const bundleImporter = 'file:///app/bundle.mjs';
	let imps = [];
	try {
		imps = parse(bundleCode)[0];
	} catch (e) {
		bundle.parseError = String(e?.message || e);
	}
	for (const imp of imps) {
		const r = resolveDeviceImport(imp, bundleImporter, importMap, mapUrl);
		if (!r) continue;
		if (r.kind === 'non-literal') bundle.nonLiteralDynamic.push(bundleCode.slice(imp.s, imp.e).slice(0, 120));
		else if (r.kind === 'bare-missing') bundle.bareMissing.push(r.spec);
		else if (r.url && !isHttpUrl(r.url)) bundle.localImports++;
		else if (r.bare) {
			bundle.bareSpecifiers.push({ spec: r.spec, url: r.url, dynamic: imp.d > -1 });
			queue.push({ url: r.url, from: `bundle.mjs bare ${r.spec}` });
		}
	}
}

const PREFIXES = ['/node_modules/.vite/', '/node_modules/', '/src/', '/app/', '/@fs/', '/@id/', '/@vite/', '/__ns_dev__/'];
const prefixOf = (pathname) => PREFIXES.find((p) => pathname.startsWith(p))?.replace(/\/$/, '') ?? 'other';

const fetched = new Map();
const bodies = new Map();
const failures = { fetch: [], foreignOrigin: [], dynamicNotAbsolute: [], bareMissing: [], nonPlain: [] };
const nonLiteralDynamic = [];
const builtins = new Map();
const bareUsed = new Map();
const cjsLike = [];
const requesters = new Map();

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
	if (!requesters.has(href)) requesters.set(href, new Set());
	requesters.get(href).add(from);
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
		const buf = Buffer.from(await res.arrayBuffer());
		body = buf.toString('utf8');
		// `bytes` stays UTF-16 code units so it compares with earlier runs; `responseBytes` is the body size.
		entry.bytes = body.length;
		entry.responseBytes = buf.length;
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
			(entry.imports ??= []).push(new URL(r.url).href.replace(/#.*$/, ''));
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
const identitiesByUrl = new Map();
for (const href of bodies.keys()) {
	const ids = await identitiesOf(href);
	identitiesByUrl.set(href, ids);
	for (const id of ids) {
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
const identityDuplicates = [...dupeGroups.values()];

// What the device would really load: the closure of the session, bundle.mjs and --seed roots.
// Import-map targets are seeded only to exercise them; one that nothing imports stays hypothetical.
const isRootRequest = (from) => from.startsWith('session.') || from.startsWith('bootstrap.') || from.startsWith('bundle.mjs') || from.startsWith('--seed ');
const loaded = new Set();
{
	const stack = [...requesters].filter(([, froms]) => [...froms].some(isRootRequest)).map(([href]) => href);
	while (stack.length) {
		const href = stack.pop();
		if (loaded.has(href) || !fetched.has(href)) continue;
		loaded.add(href);
		stack.push(...(fetched.get(href).imports ?? []));
	}
}

// A worker runs in its own isolate with its own module registry: the closure of a `?worker_file`
// seed is a realm of its own. A group whose URLs are each loaded in a different realm only
// evaluates once per realm, as expected; any realm loading two of them still fails.
const realmsByUrl = new Map();
{
	const isWorkerSeed = (from) => from.startsWith('--seed ') && new URL(from.slice('--seed '.length), deviceOrigin).searchParams.has('worker_file');
	for (const [root, froms] of requesters) {
		const rootFroms = [...froms].filter(isRootRequest);
		if (!rootFroms.length) continue;
		const realm = rootFroms.every(isWorkerSeed) ? `worker ${root}` : 'main';
		const stack = [root];
		while (stack.length) {
			const href = stack.pop();
			if (!fetched.has(href)) continue;
			if (!realmsByUrl.has(href)) realmsByUrl.set(href, new Set());
			if (realmsByUrl.get(href).has(realm)) continue;
			realmsByUrl.get(href).add(realm);
			stack.push(...(fetched.get(href).imports ?? []));
		}
	}
}
const crossRealmOnly = (urls) => {
	const seenRealms = new Set();
	for (const u of urls) {
		const realms = realmsByUrl.get(u);
		if (!realms) return false;
		for (const r of realms) {
			if (seenRealms.has(r)) return false;
			seenRealms.add(r);
		}
	}
	return urls.length > 1;
};
const crossRealm = [];
const duplicates = identityDuplicates.filter((d) => (crossRealmOnly(d.urls) ? (crossRealm.push({ check: 'duplicate modules', identity: d.identity, urls: d.urls.map((u) => ({ url: u, realms: [...realmsByUrl.get(u)] })) }), false) : true));

// One real file under two URL strings evaluates twice on device (the runtime keys modules by URL).
// Only `t` (HMR stamp), `v` (optimizer browserHash) and `import` (explicit-import marker) pick an
// instance of the same module; any other query (`?vue&type=…`, `?worker`, `?raw`, `?url`, `?inline`,
// `?direct`) names a different module by design and stays part of the key. Excluded by design:
// non-script files (CSS and assets: their `?import`/`?direct` variants are separate Vite modules
// whose JS wrapper is not the file), `/@ng/component?c=` (volatile virtual) and other virtual ids
// (no file), and `/__ns_dev__/` endpoints (not module responses).
const INSTANCE_PARAMS = ['t', 'v', 'import'];
const SCRIPT_FILE = /\.(?:[cm]?[jt]sx?|vue|svelte)$/;
const sameFileGroups = new Map();
const sameFileExcluded = { nonScript: 0, virtual: 0 };
for (const [href, ids] of identitiesByUrl) {
	const u = new URL(href);
	if (u.pathname.startsWith('/__ns_dev__/') || u.pathname.startsWith('/@ng/component')) continue;
	const fileId = [...ids].find((id) => id.startsWith('file:'));
	if (!fileId) {
		sameFileExcluded.virtual++;
		continue;
	}
	const file = fileId.slice('file:'.length).replace(/\?.*$/, '');
	if (!SCRIPT_FILE.test(file)) {
		sameFileExcluded.nonScript++;
		continue;
	}
	const key = `${file}${strip(u.search, INSTANCE_PARAMS)}`;
	if (!sameFileGroups.has(key)) sameFileGroups.set(key, new Set());
	sameFileGroups.get(key).add(href);
}
const sameFileTwoUrls = [];
for (const [key, urls] of sameFileGroups) {
	if (urls.size < 2) continue;
	const loadedUrls = [...urls].filter((u) => loaded.has(u)).sort();
	if (crossRealmOnly([...urls])) {
		crossRealm.push({ check: 'same file under 2+ URL strings', identity: key, urls: [...urls].sort().map((u) => ({ url: u, realms: [...realmsByUrl.get(u)] })) });
		continue;
	}
	const deviceUrls = [...urls].filter((u) => deviceReached.has(u));
	sameFileTwoUrls.push({
		file: key,
		severity: loadedUrls.length > 1 ? 'fail' : 'warn',
		scope: deviceUrls.length > 1 ? 'device' : loadedUrls.length > 1 ? 'loaded' : 'all',
		urls: [...urls].sort().map((u) => ({ url: u, loaded: loaded.has(u), requestedBy: [...(requesters.get(u) ?? [])].sort().slice(0, 4) })),
	});
}
sameFileTwoUrls.sort((a, b) => (a.severity === b.severity ? a.file.localeCompare(b.file) : a.severity === 'fail' ? -1 : 1));
const sameFileFailures = sameFileTwoUrls.filter((d) => d.severity === 'fail').length;

// Duplicate instances: a source file inlined in a bundle evaluates once per bundle URL it is
// in, and once more per URL it is served at individually. URL-level identities can't see that.
const NS_BUNDLE_PATHS = new Set(['/__ns_dev__/deps-bundle.mjs', '/__ns_dev__/vendor.mjs']);
// The `stdin.sourcefile` names of deps-bundle.ts and the fallback vendor build (vendor/manifest.ts).
const ESBUILD_STDIN_NAMES = new Set(['ns-deps-bundle-entry.ts', 'ns-deps-bundle-discovery.ts', 'ns-vendor-entry.ts']);
const clientEnv = server.environments.client;
const isOptimizedDep = (pathname) => clientEnv.depsOptimizer?.isOptimizedDepUrl(pathname) ?? pathname.startsWith('/node_modules/.vite/');
// Same mapping Vite's transform middleware uses to read an optimized dep's .map from disk.
const diskPathOf = (pathname) => {
	const p = decodeURIComponent(pathname);
	return p.startsWith('/@fs/') ? p.slice('/@fs'.length) : path.resolve(server.config.root, p.slice(1));
};
const isFile = (p) => {
	try {
		return fs.statSync(p).isFile();
	} catch {
		return false;
	}
};
// Sorts one bundle input spec into `into.files` (an existing file, by real path), `into.virtual` or `into.unresolved`.
const collect = (into, base, spec) => {
	// Rolldown prints a virtual id's NUL as the two characters `\0`; esbuild prints a stdin input by its `sourcefile` name.
	if (spec.startsWith('\0') || spec.startsWith('\\0') || /^[\w-]+:/.test(spec) || ESBUILD_STDIN_NAMES.has(spec)) return into.virtual.add(spec);
	const p = path.resolve(base, spec);
	if (isFile(p)) into.files.add(real(p));
	else into.unresolved.add(spec);
};
const newSet = () => ({ files: new Set(), virtual: new Set(), unresolved: new Set() });
const bundles = [];
for (const [href, body] of bodies) {
	const { pathname } = new URL(href);
	let kind = null;
	if (NS_BUNDLE_PATHS.has(pathname)) kind = 'ns-deps';
	else if (isOptimizedDep(pathname) && /\.m?js$/.test(pathname)) kind = 'vite-deps';
	if (!kind) continue;
	const b = { url: href, kind, file: kind === 'vite-deps' ? real(diskPathOf(pathname)) : null, deviceReached: deviceReached.has(href) };
	let inputs = null;
	if (kind === 'ns-deps') {
		// esbuild (deps-bundle.ts: absWorkingDir = project root, not minified) prints a column-0
		// `// <path relative to absWorkingDir>` before each module; indented `//` lines are code comments.
		b.source = 'esbuild region comments';
		inputs = newSet();
		for (const m of body.matchAll(/^\/\/ (\S+)$/gm)) collect(inputs, server.config.root, m[1]);
		// A module wrapped in __esm/__commonJS evaluates only when first required; the rest evaluate with the bundle.
		const marks = [...body.matchAll(/^\/\/ (\S+)$/gm)];
		b.lazy = marks
			.filter((m, i) => /^var [\w$]+ = __(?:esm|commonJS)\(/m.test(body.slice(m.index, marks[i + 1]?.index ?? body.length)))
			.map((m) => path.resolve(server.config.root, m[1]))
			.filter(isFile)
			.map(real);
	} else {
		// Rolldown writes the map next to the output; `sources` resolve against the map file's directory,
		// independent of the optimizer's cwd. `//#region` comments (relative to its cwd) are the cross-check.
		const smu = body.match(/\/\/# sourceMappingURL=(\S+)\s*$/);
		// Vite serves an optimized dep with its map inlined; the map Rolldown wrote sits next to the file on disk.
		const diskMap = b.file && isFile(`${b.file}.map`) ? `${b.file}.map` : null;
		if (diskMap) {
			try {
				const map = JSON.parse(fs.readFileSync(diskMap, 'utf8'));
				inputs = newSet();
				for (const s of map.sources ?? []) collect(inputs, path.resolve(path.dirname(diskMap), map.sourceRoot ?? ''), s);
				b.source = 'sourcemap (disk)';
				b.map = diskMap;
			} catch (e) {
				b.mapError = String(e?.message || e);
			}
		} else if (smu && !smu[1].startsWith('data:')) {
			const mapHref = new URL(smu[1], href).href;
			try {
				const map = await (await fetch(toLocal(mapHref))).json();
				const mapDir = path.dirname(diskPathOf(new URL(mapHref).pathname));
				inputs = newSet();
				for (const s of map.sources ?? []) collect(inputs, path.resolve(mapDir, map.sourceRoot ?? ''), s);
				b.source = 'sourcemap';
				b.map = mapHref;
			} catch (e) {
				b.mapError = String(e?.message || e);
			}
		}
		const regions = newSet();
		// Rolldown marks each module `//#region <path>` (older) or `// <path>` at column 0 (newer).
		for (const m of body.matchAll(/^\/\/(?:#region)? ((?:\.\.?\/|node_modules\/|\/)\S+)$/gm)) collect(regions, server.config.root, m[1]);
		if (!inputs) {
			b.source = 'rolldown region comments';
			inputs = regions;
		} else {
			// A map-only source is expected (a module that emitted no code of its own); a region-only one is not.
			const mapOnly = [...inputs.files].filter((f) => !regions.files.has(f));
			const regionOnly = [...regions.files].filter((f) => !inputs.files.has(f));
			if (mapOnly.length) b.mapOnlySources = mapOnly;
			if (regionOnly.length || regions.unresolved.size) b.regionMismatch = { regionOnly, unresolved: [...regions.unresolved] };
		}
	}
	b.files = [...inputs.files];
	b.virtual = [...inputs.virtual];
	b.unresolved = [...inputs.unresolved];
	bundles.push(b);
}
const fileOfIdentity = (id) => (id.startsWith('file:') ? id.slice('file:'.length).replace(/\?.*$/, '') : null);
const bundleUrls = new Set(bundles.map((b) => b.url));
const servedAs = new Map();
for (const [href, ids] of identitiesByUrl) {
	if (bundleUrls.has(href)) continue;
	for (const id of ids) {
		const file = fileOfIdentity(id);
		if (!file) continue;
		if (!servedAs.has(file)) servedAs.set(file, new Set());
		servedAs.get(file).add(href);
	}
}
const inlinedIn = new Map();
for (const b of bundles) {
	for (const file of b.files) {
		if (!inlinedIn.has(file)) inlinedIn.set(file, new Set());
		inlinedIn.get(file).add(b.url);
	}
}
const pkgByDir = new Map();
function packageOf(file) {
	const seen = [];
	let dir = path.dirname(file);
	let found = null;
	for (;;) {
		if (pkgByDir.has(dir)) {
			found = pkgByDir.get(dir);
			break;
		}
		seen.push(dir);
		try {
			const pj = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
			// Nested `{"type":"module"}` package.json files carry no name; keep walking up.
			if (pj.name && pj.version) {
				found = { name: pj.name, version: pj.version, root: dir };
				break;
			}
		} catch {}
		const up = path.dirname(dir);
		if (up === dir) break;
		dir = up;
	}
	for (const d of seen) pkgByDir.set(d, found);
	return found;
}
const pkgLabel = (file) => {
	const p = packageOf(file);
	return p ? `${p.name}@${p.version}` : null;
};
const scopeOf = (urlSets) => (urlSets.every((urls) => [...urls].some((u) => deviceReached.has(u))) ? 'device' : 'all');
const bundleFileOf = new Map(bundles.map((b) => [b.url, b.file ?? new URL(b.url).pathname]));
const inlinedAndServed = [];
const inlinedInSeveralBundles = [];
for (const [file, inBundles] of inlinedIn) {
	const served = servedAs.get(file);
	if (served) inlinedAndServed.push({ file, package: pkgLabel(file), scope: scopeOf([inBundles, served]), inlinedIn: [...inBundles].sort(), servedAs: [...served].sort() });
	if (inBundles.size > 1) {
		const sameBundleFile = new Set([...inBundles].map((u) => bundleFileOf.get(u))).size === 1;
		const deviceBundles = [...inBundles].filter((u) => deviceReached.has(u));
		inlinedInSeveralBundles.push({ file, package: pkgLabel(file), scope: deviceBundles.length > 1 ? 'device' : 'all', sameBundleFile, inlinedIn: [...inBundles].sort() });
	}
}
const pkgCopies = new Map();
for (const file of new Set([...inlinedIn.keys(), ...servedAs.keys()])) {
	const p = packageOf(file);
	if (!p) continue;
	const k = `${p.name}@${p.version}`;
	if (!pkgCopies.has(k)) pkgCopies.set(k, new Set());
	pkgCopies.get(k).add(p.root);
}
const packageCopies = [...pkgCopies].filter(([, roots]) => roots.size > 1).map(([pkg, roots]) => ({ package: pkg, roots: [...roots].sort() }));
const duplicateInstances = [];
for (const file of [...new Set([...inlinedAndServed, ...inlinedInSeveralBundles].map((d) => d.file))].sort()) {
	const a = inlinedAndServed.find((d) => d.file === file);
	const b = inlinedInSeveralBundles.find((d) => d.file === file);
	duplicateInstances.push({ file, package: pkgLabel(file), scope: a?.scope === 'device' || b?.scope === 'device' ? 'device' : 'all', inlinedIn: [...inlinedIn.get(file)].sort(), servedAs: [...(servedAs.get(file) ?? [])].sort() });
}
const dupInstanceCount = duplicateInstances.length;
const instances = {
	bundles: bundles.map(({ files, ...b }) => ({ ...b, fileCount: files.length, files: files.sort() })),
	inlinedFiles: inlinedIn.size,
	servedFiles: servedAs.size,
	duplicateInstanceCount: dupInstanceCount,
	duplicateInstances,
	inlinedAndServed,
	inlinedInSeveralBundles,
	packageCopies,
};

const countByPrefix = (urls) => {
	const out = {};
	for (const u of urls) out[fetched.get(u).prefix] = (out[fetched.get(u).prefix] ?? 0) + 1;
	return out;
};
const requestsByPrefix = { device: countByPrefix(deviceReached), all: countByPrefix(fetched.keys()) };
// Only URLs that got an HTTP response count as requests (foreign-origin ones were never sent).
const tally = (urls) => {
	const out = { requests: 0, bytes: 0, byPrefix: {} };
	for (const u of urls) {
		const e = fetched.get(u);
		if (e.status <= 0) continue;
		const t = (out.byPrefix[e.prefix] ??= { requests: 0, bytes: 0 });
		t.requests++;
		t.bytes += e.responseBytes ?? 0;
		out.requests++;
		out.bytes += e.responseBytes ?? 0;
	}
	return out;
};
const totals = { device: tally(deviceReached), all: tally(fetched.keys()) };
const readText = (file) => {
	try {
		return fs.readFileSync(file, 'utf8');
	} catch {
		return '';
	}
};
const CJS_TOKENS = /(^|[^.\w$'"])(module\.exports|exports\.[A-Za-z_$][\w$]*|require\s*\()/m;
const hasNoModuleSyntax = (code) => {
	try {
		// `export {}` has module syntax but no import or export entries.
		const [imps, exps, , hasModuleSyntax] = parse(code);
		return hasModuleSyntax === undefined ? imps.length === 0 && exps.length === 0 : !hasModuleSyntax;
	} catch {
		return false;
	}
};
const isCjsSource = (code) => hasNoModuleSyntax(code) && CJS_TOKENS.test(code);

// A raw npm file the device evaluates as ESM: CommonJS there has no `module`/`exports`/`require` to bind to.
const cjsServedRaw = [];
for (const [href, body] of bodies) {
	const { pathname } = new URL(href);
	const e = fetched.get(href);
	const raw = (pathname.startsWith('/node_modules/') && !pathname.startsWith('/node_modules/.vite/')) || (pathname.startsWith('/@fs/') && pathname.includes('/node_modules/'));
	if (!raw || !/javascript/.test(e.contentType ?? '') || !isCjsSource(body)) continue;
	cjsServedRaw.push({ url: href, from: e.from, deviceReached: deviceReached.has(href), tokens: [...new Set((body.match(new RegExp(CJS_TOKENS.source, 'gm')) ?? []).map((t) => t.replace(/^[^\w$]/, '').trim()))].slice(0, 4) });
}
const cjsServedRawDevice = cjsServedRaw.filter((c) => c.deviceReached).length;

const nsDepsCoverage = bundles
	.filter((b) => b.kind === 'ns-deps' && b.files.length)
	.map((b) => {
		const rows = b.files.map((file) => {
			const code = readText(file);
			return { file, package: pkgLabel(file), cjs: isCjsSource(code), nativeClass: /\bNativeClass\b/.test(code), platformSuffixed: /\.(ios|android|visionos)\.[cm]?[jt]sx?$/.test(file), lazy: b.lazy?.includes(file) ?? false };
		});
		const pkgs = (pred) => [...new Set(rows.filter(pred).map((r) => r.package))].sort();
		return {
			url: b.url,
			files: rows.length,
			cjs: rows.filter((r) => r.cjs).length,
			nativeClass: rows.filter((r) => r.nativeClass).length,
			platformSuffixed: rows.filter((r) => r.platformSuffixed).length,
			lazy: rows.filter((r) => r.lazy).length,
			packages: pkgs(() => true),
			cjsPackages: pkgs((r) => r.cjs),
			nativeClassPackages: pkgs((r) => r.nativeClass),
			platformSuffixedPackages: pkgs((r) => r.platformSuffixed),
			rows,
		};
	});

// The device's native `require` reaches @nativescript/core only through bundle.mjs's registry shim, never npm over HTTP.
// Bundlers rename a `createRequire(import.meta.url)` result (`require$2`) or call it inline, so those
// callees count too; a relative spec there resolves against the module's HTTP URL, so it is kept.
const escapeRe = (s) => s.replace(/[$.]/g, '\\$&');
const requireCallers = new Map();
const noteRequires = (code, where) => {
	const aliases = [...code.matchAll(/(?:var|let|const)\s+([\w$]+)\s*=\s*(?:[\w$]+\.)?createRequire\s*\(/g)].map((m) => m[1]);
	const callee = ['require', ...aliases].map(escapeRe).join('|');
	const re = new RegExp(`(?:(?<![\\w$.])(${callee})|(createRequire\\s*\\([^()]*(?:\\([^()]*\\))?[^()]*\\)))\\s*\\(\\s*(['"\`])([^'"\`]+)\\3\\s*\\)`, 'g');
	for (const m of code.matchAll(re)) {
		const lineStart = code.lastIndexOf('\n', m.index) + 1;
		if (/\/\/|^\s*\*/.test(code.slice(lineStart, m.index))) continue;
		const viaCreateRequire = m[2] || aliases.includes(m[1]);
		const spec = m[4];
		if ((spec.startsWith('.') || spec.startsWith('/')) && !viaCreateRequire) continue;
		const key = viaCreateRequire ? `${spec} (createRequire)` : spec;
		if (!requireCallers.has(key)) requireCallers.set(key, new Set());
		requireCallers.get(key).add(where);
	}
};
for (const href of bodies.keys()) noteRequires(bodies.get(href), href);
for (const file of inlinedIn.keys()) noteRequires(readText(file), `inlined:${file}`);
if (bundleCode) noteRequires(bundleCode, 'bundle.mjs');
const requireBySpec = Object.fromEntries([...requireCallers].sort(([a], [b]) => a.localeCompare(b)).map(([spec, where]) => [spec, [...where].sort()]));

// Static require check (require-scan.mjs).
const optimizeDepsExclude = server.environments.client.config.optimizeDeps?.exclude ?? [];
const isExcludedSpec = (spec) => optimizeDepsExclude.some((name) => spec === name || spec.startsWith(`${name}/`));
const requireCheck = { servedModules: 0, servedFailures: [], servedMemberCalls: [], knownUncalledMemberCalls: [], parseErrors: [], depsDir: null, depFiles: 0, depFailures: [], depInternals: [] };
const noteDep = (where, scan) => {
	const { failures, internals } = classifyDepRequires(scan, isExcludedSpec);
	requireCheck.depFailures.push(...failures.map((f) => ({ where, ...f })));
	requireCheck.depInternals.push(...internals.map((f) => ({ where, ...f })));
};
for (const [href, body] of bodies) {
	if (!REQUIRE_TOKEN_RE.test(body)) continue;
	if (isOptimizedDep(new URL(href).pathname)) continue;
	const scan = scanRequires(body);
	if (scan.error) {
		requireCheck.parseErrors.push({ where: href, error: scan.error });
		continue;
	}
	requireCheck.servedModules++;
	for (const f of scan.free) requireCheck.servedFailures.push({ where: href, ...f });
	const pathname = new URL(href).pathname;
	if (!isStrictGlobalRequireShadow(pathname)) {
		for (const m of scan.memberCalls) (isKnownUncalledGlobalRequire(pathname, m) ? requireCheck.knownUncalledMemberCalls : requireCheck.servedMemberCalls).push({ where: href, ...m });
	}
}
{
	const depsDir = path.join(server.config.cacheDir, 'deps');
	if (fs.existsSync(depsDir)) {
		requireCheck.depsDir = depsDir;
		for (const f of fs.readdirSync(depsDir).filter((name) => name.endsWith('.js'))) {
			requireCheck.depFiles++;
			const code = fs.readFileSync(path.join(depsDir, f), 'utf8');
			if (!REQUIRE_TOKEN_RE.test(code)) continue;
			const scan = scanRequires(code);
			if (scan.error) requireCheck.parseErrors.push({ where: `deps/${f}`, error: scan.error });
			else noteDep(`deps/${f}`, scan);
		}
	}
}
const requireCheckFailures = requireCheck.servedFailures.length + requireCheck.servedMemberCalls.length + requireCheck.depFailures.length;

// NativeScript's V8 is built without ICU: a Unicode property escape under the `u`/`v` flag is a
// SyntaxError (at module compile time for a regex literal, at construction for a RegExp string).
const UNICODE_PROP = /\\{1,2}[pP]\{[^}\n]{0,40}\}?/g;
const unicodePropertyEscapes = [];
const scanUnicodeProps = (code, where, scope) => {
	const hits = [];
	for (const m of code.matchAll(UNICODE_PROP)) {
		const lineEnd = code.indexOf('\n', m.index);
		const tail = code.slice(m.index, lineEnd < 0 ? Math.min(code.length, m.index + 400) : Math.min(lineEnd, m.index + 400));
		// Heuristic: the first `/flags` closing a literal, or a `"flags"` second RegExp argument.
		const flags = tail.match(/[^\\]\/([dgimsuyv]+)\b/)?.[1] ?? tail.match(/['"`]\s*,\s*['"`]([dgimsuyv]+)['"`]/)?.[1] ?? null;
		hits.push({ snippet: code.slice(Math.max(0, m.index - 30), m.index + 50).replace(/\s+/g, ' '), flags, unicodeFlag: flags == null ? null : /[uv]/.test(flags) });
	}
	if (hits.length) unicodePropertyEscapes.push({ where, scope, count: hits.length, hits: hits.slice(0, 5) });
};
for (const [href, body] of bodies) scanUnicodeProps(body, href, deviceReached.has(href) ? 'device' : loaded.has(href) ? 'loaded' : 'all');
if (bundleCode) scanUnicodeProps(bundleCode, 'bundle.mjs', 'device');
for (const file of inlinedIn.keys()) scanUnicodeProps(readText(file), `inlined:${file}`, [...inlinedIn.get(file)].some((u) => deviceReached.has(u)) ? 'device' : 'all');

// Settle before the end snapshot: crawl imports can register missing deps whose optimizer run is
// debounced, and the end-of-crawl map fetch below resolves every key again.
async function settledOptimizerState() {
	let last = JSON.stringify(optimizerState());
	let stable = 0;
	for (let i = 0; i < 40 && stable < 3; i++) {
		await sleep(500);
		const now = JSON.stringify(optimizerState());
		stable = now === last ? stable + 1 : 0;
		last = now;
	}
	return JSON.parse(last);
}
await scanDone;
const optimizerAtEnd = await settledOptimizerState();
const hotSentDuringCrawl = hotSent.slice();
const fullReloads = hotSentDuringCrawl.filter((p) => p.type === 'full-reload');
const optimizer = {
	depsOptimizerPresent: !!server.environments.client.depsOptimizer,
	config: (({ noDiscovery, include, exclude, entries }) => ({ noDiscovery, include, exclude, entries }))(server.environments.client.config.optimizeDeps ?? {}),
	start: optimizerAtStart,
	afterScan: optimizerAfterScan,
	end: optimizerAtEnd,
	registeredMissing,
	changed: optimizerAtStart.browserHash !== optimizerAtEnd.browserHash || optimizerAtStart.hash !== optimizerAtEnd.hash,
	fullReloads,
	hotSent: hotSentDuringCrawl,
};

crawlPhase = 'import-map (end)';
const mapAtEnd = (await fetchModuleJson(toLocal(mapUrl))).importMap ?? {};
crawlPhase = 'done';
optimizer.endAfterMap = await settledOptimizerState();
const importMapDiff = [];
for (const k of new Set([...Object.keys(importMap.imports ?? {}), ...Object.keys(mapAtEnd.imports ?? {})])) {
	const a = importMap.imports?.[k];
	const b = mapAtEnd.imports?.[k];
	if (a !== b) importMapDiff.push({ spec: k, start: a ?? null, end: b ?? null });
}
if (JSON.stringify(importMap.scopes ?? {}) !== JSON.stringify(mapAtEnd.scopes ?? {})) importMapDiff.push({ scopes: true, start: importMap.scopes ?? null, end: mapAtEnd.scopes ?? null });

// Each map target vs the URL(s) import analysis wrote for the same module: an optimized dep's
// `/node_modules/.vite/deps/<file>?v=<browserHash>`, and every URL of the target's file (same
// by-design query) that served code or bundle.mjs requested. A difference is a second instance
// once the device loads both; the map target is loaded only when something imports the bare spec.
const optimizedMeta = server.environments.client.depsOptimizer?.metadata;
const sameFileKeyOf = (href) => {
	const fileId = [...(identitiesByUrl.get(href) ?? [])].find((id) => id.startsWith('file:'));
	return fileId ? `${fileId.slice('file:'.length).replace(/\?.*$/, '')}${strip(new URL(href).search, INSTANCE_PARAMS)}` : null;
};
const requestedByCode = (href) => [...(requesters.get(href) ?? [])].some((f) => !f.startsWith('importMap.'));
const importMapVsAnalysis = [];
for (const [spec, target] of Object.entries(importMap.imports ?? {})) {
	const t = new URL(target, mapUrl).href;
	const analysis = new Set();
	const info = optimizedMeta?.optimized?.[spec] ?? optimizedMeta?.discovered?.[spec];
	const expectedOptimized = info?.file ? `${deviceOrigin}/${path.relative(server.config.root, info.file).split(path.sep).join('/')}?v=${info.browserHash ?? optimizedMeta.browserHash}` : null;
	if (expectedOptimized) analysis.add(expectedOptimized);
	const key = sameFileKeyOf(t);
	if (key) for (const href of fetched.keys()) if (requestedByCode(href) && sameFileKeyOf(href) === key) analysis.add(href);
	const differing = [...analysis].filter((u) => u !== t).sort();
	const mapTargetLoaded = loaded.has(t);
	const otherLoaded = differing.filter((u) => loaded.has(u));
	const status = !differing.length ? (analysis.size ? 'ok' : 'unused') : mapTargetLoaded && otherLoaded.length ? 'fail' : 'warn';
	importMapVsAnalysis.push({ spec, status, mapTarget: t, mapTargetLoaded, mapTargetRequestedBy: [...(requesters.get(t) ?? [])].filter((f) => !f.startsWith('importMap.')).slice(0, 4), expectedOptimized, analysisUrls: [...analysis].sort(), differing });
}
const importMapVsAnalysisMismatch = importMapVsAnalysis.filter((x) => x.status === 'fail' || x.status === 'warn').length;
const importMapVsAnalysisFail = importMapVsAnalysis.filter((x) => x.status === 'fail').length;

const emptyBodies = [...bodies].filter(([, b]) => b.length === 0).map(([u]) => u);
const statusCounts = {};
for (const e of fetched.values()) statusCounts[e.status] = (statusCounts[e.status] ?? 0) + 1;
const nonOk = [...fetched].filter(([, e]) => e.status > 0 && !loadableStatus(e.status)).map(([url, e]) => ({ url, status: e.status }));
const failureCount = cjsServedRawDevice + sessionFailures.length + Object.values(failures).reduce((n, list) => n + list.length, 0) + nonce.filter((n) => !n.ok).length + (bundle?.originMismatch.length ?? 0) + (bundle?.bareMissing.length ?? 0) + (bundle?.coreUrls.length ?? 0);

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
	deviceUrls: [...deviceReached].sort().map((u) => [u.slice(deviceOrigin.length), fetched.get(u).bytes]),
	requestsByPrefix,
	totals,
	failureCount,
	statusCounts,
	nonOk,
	sessionFailures,
	failures,
	nonce,
	duplicateCount: duplicates.length,
	duplicates,
	crossRealm,
	loadedModules: loaded.size,
	sameFileTwoUrls: { failures: sameFileFailures, warnings: sameFileTwoUrls.length - sameFileFailures, excluded: sameFileExcluded, groups: sameFileTwoUrls },
	unicodePropertyEscapes: { files: unicodePropertyEscapes.length, unicodeFlagged: unicodePropertyEscapes.filter((u) => u.hits.some((h) => h.unicodeFlag !== false)).length, list: unicodePropertyEscapes },
	instances,
	cjsServedRaw: { count: cjsServedRaw.length, device: cjsServedRawDevice, list: cjsServedRaw },
	nsDepsCoverage,
	requireCallers: { specifiers: Object.keys(requireBySpec).length, bySpecifier: requireBySpec },
	requireCheck,
	importMapVsAnalysis: { mismatches: importMapVsAnalysisMismatch, failures: importMapVsAnalysisFail, entries: importMapVsAnalysis },
	importMapDiff,
	optimizer,
	emptyBodies: { count: emptyBodies.length, urls: emptyBodies },
	nonLiteralDynamic,
	builtins: Object.fromEntries(builtins),
	bareUsed: Object.fromEntries(bareUsed),
	cjsLike,
	bundle,
	bootstrapSha1: crypto.createHash('sha1').update(bootstrapCode).digest('hex'),
	urls: Object.fromEntries([...fetched].map(([u, e]) => [u, { from: e.from, status: e.status, bytes: e.bytes, responseBytes: e.responseBytes, contentType: e.contentType, imports: e.imports }])),
};
fs.mkdirSync(path.join(spikeDir, 'out'), { recursive: true });
const outFile = path.join(spikeDir, 'out', `thin-crawl-${report.app}.json`);
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

const kib = (n) => `${(n / 1024).toFixed(0)} KiB`;
const top = (list, n = 8) => list.slice(0, n).map((x) => `      ${JSON.stringify(x)}`);
const noBundleWarning = '!!! WARNING: --bundle not given: core identity vs bundle.mjs unchecked (bundle.mjs core externals and bare specifiers not loaded)';
const lines = [
	...(bundle ? [] : [noBundleWarning]),
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
	...Object.entries(totals).map(
		([k, t]) =>
			`  totals (${k}) ${t.requests} requests ${kib(t.bytes)}: ${Object.entries(t.byPrefix)
				.map(([p, x]) => `${p}=${x.requests}/${kib(x.bytes)}`)
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
{
	const relU = (u) => (u.startsWith(deviceOrigin) ? u.slice(deviceOrigin.length) : u);
	lines.push(`  cross-realm groups (one URL per isolate, not failures) ${crossRealm.length}`, ...crossRealm.map((c) => `      [${c.check}] ${c.urls.map((x) => `${relU(x.url)} (${x.realms.map((r) => (r === 'main' ? 'main' : `worker ${relU(r.slice('worker '.length))}`)).join(', ')})`).join(' | ')}`));
	lines.push(`  same file under 2+ URL strings: fail ${sameFileFailures} (both loaded), warn ${sameFileTwoUrls.length - sameFileFailures} (one only via an import-map seed); loaded modules ${loaded.size}; excluded non-script ${sameFileExcluded.nonScript}, virtual ${sameFileExcluded.virtual}`, ...sameFileTwoUrls.slice(0, 12).map((d) => `      [${d.severity}/${d.scope}] ${path.relative(repoRoot, d.file)}: ${d.urls.map((x) => `${relU(x.url)}${x.loaded ? '' : '(seed-only)'}`).join(' | ')}`));
}
if (bundle) lines.push(`  bundle.mjs ${bundle.urls.length} URLs, core URLs ${bundle.coreUrls.length}, origin mismatches ${bundle.originMismatch.length}; bare specifiers via import map ${bundle.bareSpecifiers.length}${bundle.bareSpecifiers.length ? ` [${bundle.bareSpecifiers.map((b) => b.spec).join(' ')}]` : ''}; bare missing from map ${bundle.bareMissing.length}${bundle.bareMissing.length ? ` [${bundle.bareMissing.join(' ')}]` : ''}; local imports ${bundle.localImports}; non-literal dynamic ${bundle.nonLiteralDynamic.length}`, ...top(bundle.originMismatch));
lines.push(
	`  bundles ${bundles.length} (${bundles.map((b) => `${new URL(b.url).pathname.split('/').pop()}${new URL(b.url).search}:${b.files.length}${b.deviceReached ? '' : '[seed-only]'}`).join(' ')})`,
	`  inlined source files ${inlinedIn.size}, individually served files ${servedAs.size}`,
	...bundles.filter((b) => b.mapError || b.regionMismatch || b.unresolved.length).map((b) => `      ${JSON.stringify({ url: b.url, mapError: b.mapError, regionMismatch: b.regionMismatch, unresolved: b.unresolved })}`),
	`  duplicate instances ${dupInstanceCount} files${dupInstanceCount && allowDupInstances ? ' (allowed)' : ''} (device ${duplicateInstances.filter((d) => d.scope === 'device').length}): inlined+served ${inlinedAndServed.length}, inlined in 2+ bundle URLs ${inlinedInSeveralBundles.length}`,
	...duplicateInstances.slice(0, 12).map((d) => `      [${d.scope}] ${path.relative(repoRoot, d.file)}: inlined in ${d.inlinedIn.map((u) => new URL(u).pathname + new URL(u).search).join(', ')}${d.servedAs.length ? `; served as ${d.servedAs.map((u) => new URL(u).pathname + new URL(u).search).join(', ')}` : ''}`),
	`  package copies (same name@version, different real paths) ${packageCopies.length}`,
	...top(packageCopies, 5),
);
const rel = (u) => (u.startsWith(deviceOrigin) ? u.slice(deviceOrigin.length) : u);
lines.push(
	`  cjs served raw ${cjsServedRaw.length} (device ${cjsServedRawDevice})`,
	...cjsServedRaw.slice(0, 8).map((c) => `      [${c.deviceReached ? 'device' : 'all'}] ${rel(c.url)} ${c.tokens.join(',')}`),
	...nsDepsCoverage.map((c) => `  ns deps bundle covers ${c.files} files (${c.lazy} lazy) in ${c.packages.length} packages: cjs ${c.cjs} [${c.cjsPackages.join(' ')}], NativeClass ${c.nativeClass} [${c.nativeClassPackages.join(' ')}], platform-suffixed ${c.platformSuffixed} [${c.platformSuffixedPackages.join(' ')}]`),
	`  runtime require() calls (bare specifiers, and any createRequire spec) ${Object.keys(requireBySpec).length}: ${Object.entries(requireBySpec)
		.map(([k, v]) => `${k}(${v.length})`)
		.join(' ')}`,
	`  static require check: served modules with require-like tokens ${requireCheck.servedModules}, free require/__require/__non_webpack_require__ ${requireCheck.servedFailures.length}; pre-bundles ${requireCheck.depFiles} files: requiring an excluded package ${requireCheck.depFailures.length}, other internals ${requireCheck.depInternals.length}${requireCheck.depInternals.length ? ` [${[...new Set(requireCheck.depInternals.map((d) => `${d.via} ${d.spec ?? '<non-literal>'}`))].join(', ')}]` : ''}; parse errors ${requireCheck.parseErrors.length}`,
	`  global-object require calls (globalThis/global/self.require): fail ${requireCheck.servedMemberCalls.length}, known-uncalled ${requireCheck.knownUncalledMemberCalls.length}${requireCheck.knownUncalledMemberCalls.length ? ' (core globals/index System.import)' : ''}`,
	...[...requireCheck.servedFailures, ...requireCheck.servedMemberCalls, ...requireCheck.depFailures].slice(0, 10).map((f) => `      [FAIL] ${rel(f.where)} ${f.via ?? `free ${f.name}${f.call ? '()' : ''}`} ${f.spec ?? '<non-literal>'}`),
	...requireCheck.parseErrors.slice(0, 5).map((e) => `      [parse] ${rel(e.where)}: ${e.error}`),
	`  import map vs import analysis (every key): fail ${importMapVsAnalysisFail} (map target and another URL both loaded), warn ${importMapVsAnalysisMismatch - importMapVsAnalysisFail}, ok ${importMapVsAnalysis.filter((x) => x.status === 'ok').length}, unused ${importMapVsAnalysis.filter((x) => x.status === 'unused').length} / ${importMapVsAnalysis.length}`,
	...importMapVsAnalysis.filter((x) => x.status === 'fail' || x.status === 'warn').map((x) => `      [${x.status}] ${x.spec}: map ${rel(x.mapTarget)}${x.mapTargetLoaded ? ' (loaded)' : ' (seed-only)'} vs analysis ${x.differing.map(rel).join(', ')}`),
	`  unicode property escapes (\\p{ / \\P{; throws on device under u/v) ${unicodePropertyEscapes.length} sources (u/v-flagged or unknown ${report.unicodePropertyEscapes.unicodeFlagged})`,
	...unicodePropertyEscapes.slice(0, 10).map((u) => `      [${u.scope}] ${rel(u.where).replace(repoRoot + '/', '')} x${u.count} flags=${[...new Set(u.hits.map((h) => h.flags ?? '?'))].join(',')} ${JSON.stringify(u.hits[0].snippet)}`),
	`  import map changed during crawl ${importMapDiff.length}`,
	...top(importMapDiff, 5),
	`  optimizer present ${optimizer.depsOptimizerPresent} (noDiscovery=${optimizer.config.noDiscovery} include=${JSON.stringify(optimizer.config.include)}); browserHash ${optimizerAtStart.browserHash} -> ${optimizerAtEnd.browserHash}${optimizer.changed ? ' CHANGED' : ''}; optimized ${optimizerAtStart.optimized} -> ${optimizerAtEnd.optimized}, discovered ${optimizerAtStart.discovered} -> ${optimizerAtEnd.discovered}; full-reloads sent ${fullReloads.length}; hot payloads ${hotSentDuringCrawl.length}`,
	`  optimizer after scan: discovered ${optimizerAfterScan?.discovered ?? null}, browserHash ${optimizerAfterScan?.browserHash ?? null}; after end-of-crawl map: browserHash ${optimizer.endAfterMap.browserHash}, optimized ${optimizer.endAfterMap.optimized}, discovered ${optimizer.endAfterMap.discovered}`,
	`  deps registered by requests beyond the scan ${registeredMissing.length}${registeredMissing.length ? `: ${registeredMissing.map((r) => `${r.id} [${r.phase}]`).join(', ')}` : ''}`,
	`  responses by status ${Object.entries(statusCounts)
		.map(([s, n]) => `${s}=${n}`)
		.join(' ')}; non-2xx ${nonOk.length}${
		nonOk.length
			? ` (${nonOk
					.slice(0, 5)
					.map((e) => `${e.status} ${rel(e.url)}`)
					.join(', ')})`
			: ''
	}`,
);
// Vue: Vite's client-inject substitutes `process.env.NODE_ENV` in served modules (no other define),
// which selects runtime-core's dev branch that registers `__VUE_HMR_RUNTIME__`; the entry boundary
// imports the Vue reboot module.
let vueRuntimeOk = true;
if (flavor === 'vue') {
	// Served on its own, or inlined into an optimized dep (where Rolldown folds the dev guard away).
	const runtimeCoreFile = /\/@vue\/runtime-core\/dist\/runtime-core\.esm-bundler\.js$/;
	const servedRuntimeCore = [...bodies].filter(([u]) => runtimeCoreFile.test(new URL(u).pathname));
	const runtimeCore = servedRuntimeCore.length ? servedRuntimeCore : bundles.filter((b) => b.files.some((f) => runtimeCoreFile.test(f))).map((b) => [b.url, bodies.get(b.url) ?? '']);
	const body = runtimeCore[0]?.[1] ?? '';
	const at = body.indexOf('getGlobalThis().__VUE_HMR_RUNTIME__ = {');
	const guard = at >= 0 ? body.slice(Math.max(0, body.lastIndexOf('\n', at - 2) - 60), at).trim() : '';
	const devBranch = at >= 0 && !body.includes('process.env.NODE_ENV') && (/"development"\s*!==\s*"production"|\(true\)|!!true/.test(guard) || (!servedRuntimeCore.length && !/\bif\s*\(/.test(guard)));
	const rebootLoaded = [...deviceReached].some((u) => new URL(u).pathname.endsWith('/@nativescript/vite/hmr/frameworks/vue/client/reboot.js'));
	vueRuntimeOk = runtimeCore.length === 1 && devBranch && rebootLoaded;
	report.vue = { runtimeCoreUrls: runtimeCore.map(([u]) => u), hmrRuntimeGuard: guard, devBranch, rebootLoaded };
	fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
	lines.push(`  vue: runtime-core URLs ${runtimeCore.length}; __VUE_HMR_RUNTIME__ guard ${JSON.stringify(guard)} → dev branch ${devBranch}; reboot module loaded ${rebootLoaded} → ${vueRuntimeOk ? 'ok' : 'FAIL'}`);
}
// A cold start that re-optimizes (new deps, browserHash change, full reload) strands the device on stale URLs.
const optimizerStable = !optimizer.depsOptimizerPresent || (!optimizer.changed && fullReloads.length === 0 && registeredMissing.length === 0);
const ok = optimizerStable && vueRuntimeOk && requireCheckFailures === 0 && failureCount === 0 && duplicates.length === 0 && sameFileFailures === 0 && importMapVsAnalysisFail === 0 && nonce.length > 0 && (allowDupInstances || dupInstanceCount === 0);
lines.push(`${ok ? 'PASS' : 'FAIL'} optimizerStable=${optimizerStable} requireCheck=${requireCheckFailures} failures=${failureCount} duplicates=${duplicates.length} sameFileTwoUrls=${sameFileFailures} importMapVsAnalysis=${importMapVsAnalysisFail} duplicateInstanceFiles=${dupInstanceCount}${allowDupInstances ? ' (allowed)' : ''} → ${path.relative(repoRoot, outFile)}`);
if (!bundle) lines.push(noBundleWarning);
console.log(lines.join('\n'));
await server.close();
process.exit(ok ? 0 : 1);
