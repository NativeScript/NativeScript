// Spike: boot the Angular fixture's dev server in-process, warm Vite's module
// graph the way the device does (crawl the session entry's plain Vite URLs,
// resolving imports like the iOS runtime, see device-resolve.mjs), apply a
// fixed set of edits, and print every HMR payload Vite would send to browsers:
//   raw  = what plugins/Vite hand to `server.ws.send` / `environments.client.hot.send`
//   wire = what a client on Vite's HMR WebSocket (`vite-hmr` + token) receives
// After an `angular:component-update` the probe fetches the metadata module and
// its external styles exactly like the device renderer does, so later CSS edits
// see the same Vite graph state as on a device.
//
// Usage (from anywhere):
//   node --preserve-symlinks tools/vite-server-env-spike/payload-probe.mjs [--compilation-api] [--keep-ns-strategy] [--only a,b,c]
// --compilation-api   Analog `experimental.useAngularCompilationAPI: true` (default: Analog default mode)
// --no-ipc            run without a parent IPC channel (default: a stubbed `process.send`, as under the CLI)
// --keep-ns-strategy  keep the `nativescript-hmr-websocket` plugin if the installed package still has one
// --fresh-plugins     the (r4)-(r7) restarts build new plugin instances, as reloading vite.config.mts does

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { FAILURE_KINDS, isHttpUrl, loadableStatus, resolveDeviceImport } from './device-resolve.mjs';

const spikeDir = import.meta.dirname;
const args = process.argv.slice(2);
const flag = (name) => {
	const i = args.indexOf(name);
	if (i < 0) return false;
	args.splice(i, 1);
	return true;
};
const take = (name, dflt) => {
	const i = args.indexOf(name);
	return i >= 0 ? args.splice(i, 2)[1] : dflt;
};
const compilationApi = flag('--compilation-api');
const keepNsStrategy = flag('--keep-ns-strategy');
const noIpc = flag('--no-ipc');
const noNsRules = flag('--no-ns-rules');
const freshPlugins = flag('--fresh-plugins');
const only = take('--only', '')
	.split(',')
	.map((s) => s.trim())
	.filter(Boolean);
const appRoot = path.resolve(spikeDir, take('--app', 'apps/ng'));

process.chdir(appRoot);
process.argv.splice(2);
process.argv.push('--', '--env.ios', '--env.hmr');
process.env.NS_HMR_PORT = process.env.NS_HMR_PORT || '5196';

// What the CLI would receive over IPC. Installed before the config loads:
// `@nativescript/vite` captures `process.send` when its modules evaluate.
const ipcMessages = [];
if (!noIpc) {
	process.send = (message) => {
		ipcMessages.push(message);
		return true;
	};
}

const appReq = createRequire(path.join(appRoot, 'package.json'));
const nsViteDir = path.join(appRoot, 'node_modules/@nativescript/vite');
const viteReq = createRequire(path.join(nsViteDir, 'package.json'));
const vite = await import(pathToFileURL(viteReq.resolve('vite')).href);
const { init, parse } = await import(pathToFileURL(viteReq.resolve('es-module-lexer')).href);

// ---- fixture edits ---------------------------------------------------------
const P = (rel) => path.join(appRoot, rel);
const originals = new Map();
const created = [];
function save(rel) {
	if (!originals.has(rel)) originals.set(rel, fs.readFileSync(P(rel), 'utf8'));
}
function write(rel, text) {
	save(rel);
	fs.writeFileSync(P(rel), text);
}
function replaceIn(rel, from, to) {
	const cur = fs.readFileSync(P(rel), 'utf8');
	if (!cur.includes(from)) throw new Error(`${rel}: '${from}' not found`);
	write(rel, cur.replace(from, to));
}
// Best effort per file: something else may have removed a created file's directory meanwhile.
function restore() {
	const files = [...originals];
	originals.clear();
	for (const [rel, text] of files) {
		try {
			fs.writeFileSync(P(rel), text);
		} catch (e) {
			if (!created.some((c) => rel === c || rel.startsWith(`${c}/`))) console.warn(`restore: could not rewrite ${rel}: ${e?.message || e}`);
		}
	}
	for (const rel of created.splice(0).reverse()) fs.rmSync(P(rel), { recursive: true, force: true });
}
process.on('exit', restore);
for (const [signal, code] of [
	['SIGINT', 130],
	['SIGTERM', 143],
]) {
	process.on(signal, () => {
		restore();
		process.exit(code);
	});
}

const INLINE_DIR = 'src/app/probe-inline';
const INLINE_TS = `${INLINE_DIR}/probe-inline.component.ts`;
fs.mkdirSync(P(INLINE_DIR), { recursive: true });
created.push(INLINE_DIR);
fs.writeFileSync(
	P(INLINE_TS),
	`import { Component, NO_ERRORS_SCHEMA, signal } from '@angular/core';

@Component({
	selector: 'ProbeInline',
	template: \`<Label [text]="'Inline: ' + count()" class="inline"></Label>\`,
	styles: [\`.inline { color: red; }\`],
	schemas: [NO_ERRORS_SCHEMA],
})
export class ProbeInlineComponent {
	readonly count = signal(0);
}
`,
);
const SERVICE_TS = 'src/app/probe.service.ts';
fs.writeFileSync(P(SERVICE_TS), `export class ProbeService {\n\tgreeting() {\n\t\treturn 'hello';\n\t}\n}\n`);
created.push(SERVICE_TS);
replaceIn('src/app/app.routes.ts', `export const routes: Routes = [`, `export { ProbeService } from './probe.service';\nexport const PROBE_MARKER = 'a';\n\nexport const routes: Routes = [\n\t{ path: 'probe-inline', loadComponent: () => import('./probe-inline/probe-inline.component').then((m) => m.ProbeInlineComponent) },`);

const EDITS = [
	{ key: 'a', label: '(a) external home.component.html text', file: 'src/app/home/home.component.html', from: `'Hot taps: '`, to: `'Hot taps!: '` },
	{ key: 'a2', label: '(a) external home.component.html text #2', file: 'src/app/home/home.component.html', from: `'Hot taps!: '`, to: `'Hot taps!!: '` },
	{ key: 'b1', label: '(b) home.component.css color #1', file: 'src/app/home/home.component.css', from: 'color: red;', to: 'color: blue;' },
	{ key: 'b2', label: '(b) home.component.css color #2', file: 'src/app/home/home.component.css', from: 'color: blue;', to: 'color: green;' },
	{ key: 'c', label: '(c) class body home.component.ts signal(0)->signal(10)', file: 'src/app/home/home.component.ts', from: 'signal(0)', to: 'signal(10)' },
	{ key: 'd1', label: '(d) inline styles in component .ts', file: INLINE_TS, from: '.inline { color: red; }', to: '.inline { color: blue; }' },
	{ key: 'd2', label: '(d) inline template in component .ts', file: INLINE_TS, from: `'Inline: '`, to: `'Inline!: '` },
	{ key: 'e', label: '(e) non-component .ts (app.routes.ts)', file: 'src/app/app.routes.ts', from: `PROBE_MARKER = 'a'`, to: `PROBE_MARKER = 'b'` },
	{ key: 's', label: '(s) service class body (probe.service.ts)', file: SERVICE_TS, from: `'hello'`, to: `'hello again'` },
	{ key: 'f', label: '(f) root app.component.html', file: 'src/app/app.component.html', from: '<GridLayout>', to: '<GridLayout class="probe">' },
	{ key: 'g', label: '(g) global app.css', file: 'src/app.css', append: '\n.probe-global { color: red; }\n' },
	{ key: 'i', label: '(i) device sends angular:invalidate', send: { type: 'custom', event: 'angular:invalidate', data: { id: 'probe', message: 'probe: replaceMetadata threw' } } },
	{ key: 'e1a', label: '(e1) syntax error in home.component.ts', file: 'src/app/home/home.component.ts', from: '(n) => n + 1);', to: '(n) => n + 1;', expect: { error: true, update: false } },
	{ key: 'e1b', label: '(e1) fix the syntax error', file: 'src/app/home/home.component.ts', from: '(n) => n + 1;', to: '(n) => n + 1);', expect: { error: false, reboot: 1, rerunIncludes: '/src/app/home/home.component.ts' } },
	{ key: 'e2a', label: '(e2) template compile error in home.component.html', file: 'src/app/home/home.component.html', from: `+ count()"`, to: `+ count("`, expect: { error: true, update: false, inPlace: false } },
	{ key: 'e2b', label: '(e2) fix the template', file: 'src/app/home/home.component.html', from: `+ count("`, to: `+ count()"`, expect: { error: false, reboot: 0, inPlace: true } },
	{ key: 'e3a', label: '(e3) service throws at evaluation', file: SERVICE_TS, from: 'export class ProbeService {', to: "throw new Error('probe: evaluation failed');\nexport class ProbeService {", expect: { error: false, reboot: 1, rerunIncludes: `/${SERVICE_TS}` } },
	{ key: 'e3b', label: '(e3) fix the service', file: SERVICE_TS, from: "throw new Error('probe: evaluation failed');\nexport class ProbeService {", to: 'export class ProbeService {', expect: { error: false, reboot: 1 } },
	{ key: 'e4a', label: '(e4) reconnect without edits', reconnect: true, expect: { update: false, rerun: false } },
	// After (e3)'s non-component .ts edits Analog has dropped its class names, so
	// this template edit reboots instead of applying in place; run alone it applies in place.
	{ key: 'e4b', label: '(e4) template edit while connected', file: 'src/app/home/home.component.html', from: `+ count()"`, to: `+ count() + '?'"`, expect: { error: false, update: true } },
	{ key: 'e4c', label: '(e4) css edit applied in place', file: 'src/app/home/home.component.css', append: '\n.probe-e4 { color: red; }\n', expect: { reboot: 0 } },
	{ key: 'e4d', label: '(e4) reconnect after delivered edits', reconnect: true, expect: { update: false, rerun: false } },
	{ key: 'e4e', label: '(e4) edit while the device is offline, then reconnect', offlineEdit: { file: 'src/app/home/home.component.html', from: `+ count() + '?'"`, to: `+ count() + '!'"` }, expect: { error: false, reboot: 1, rerunIncludes: '/src/app/home/home.component.ts' } },
	{ key: 'e4f', label: '(e4) reconnect after the catch-up', reconnect: true, expect: { update: false, rerun: false } },
	{ key: 'r1', label: '(r1) edit inside node_modules/@nativescript/core', coreEdit: true },
	{ key: 'r2', label: '(r2) server.restart(), then the device reconnects', serverRestart: true },
	{ key: 'r3', label: '(r3) device sends ns:restart', send: { type: 'custom', event: 'ns:restart', data: { reason: 'probe: hot.decline() in /src/app/x.ts' } } },
	// A config edit restarts Vite, the CLI restarts the app, and the template is saved while it boots.
	// Passes when the last home.component.ts the device fetched (after the catch-up reboot, if one came) has the new template.
	// In (r5) main.ts and app.routes.ts were served before the save, which re-stamps them, so a catch-up reboot is allowed.
	{ key: 'r4', label: '(r4) server.restart(), template saved before the app boots', bootRace: 'before-crawl', expect: { fresh: true, reboot: 0 } },
	{ key: 'r5', label: '(r5) server.restart(), template saved mid-boot before home.component.ts is fetched', bootRace: 'before-home', expect: { fresh: true } },
	{ key: 'r6', label: '(r6) server.restart(), template saved mid-boot after home.component.ts is fetched', bootRace: 'after-home', expect: { fresh: true, reboot: 1 } },
	// The component's styles count as fresh when inlined in it or served from the external stylesheet it names.
	{ key: 'r7', label: '(r7) server.restart(), stylesheet saved mid-boot before home.component.ts is fetched', bootRace: 'before-home', stylesheet: true, expect: { fresh: true } },
	// home.component.ts gains a static import of a helper, then the helper is edited. The device re-imports
	// the entry, so the app.routes.ts it gets must lazy-load home.component.ts by an absolute URL carrying
	// home.component.ts's new `?t=`; anything else re-runs a stale home.component.ts or fails to load it.
	{ key: 'r8', label: '(r8) helper imported by the lazy home.component.ts edited: app.routes.ts lazy import re-stamped', stampProbe: true, expect: { stamped: true } },
].filter((e) => !only.length || only.includes(e.key) || only.includes(e.key[0]));

// ---- server ----------------------------------------------------------------
let server;
// Set before a restart that should resolve new plugin instances.
let rebuildPlugins = false;
try {
	const { angularConfig } = await import(pathToFileURL(path.join(nsViteDir, 'configuration/angular.js')).href);
	const config = angularConfig({ mode: 'development' });
	const nsPlugins = (cfg) => {
		let list = cfg.plugins.flat(Infinity).filter(Boolean);
		if (!keepNsStrategy) list = list.filter((p) => p.name !== 'nativescript-hmr-websocket');
		if (noNsRules) list = list.filter((p) => !String(p.name).startsWith('ns-angular-hmr-rules'));
		return list;
	};
	let plugins = nsPlugins(config);
	if (compilationApi) {
		const angular = (await import(pathToFileURL(appReq.resolve('@analogjs/vite-plugin-angular')).href)).default;
		const analogNames = new Set(
			angular({})
				.flat(Infinity)
				.filter(Boolean)
				.map((p) => p.name),
		);
		const at = plugins.findIndex((p) => analogNames.has(p.name));
		const replacement = angular({
			experimental: { useAngularCompilationAPI: true },
			liveReload: true,
			externalRuntimeStyles: false,
			tsconfig: P('tsconfig.json'),
			fileReplacements: [],
			workspaceRoot: appRoot,
		})
			.flat(Infinity)
			.filter(Boolean);
		plugins = plugins.filter((p) => !analogNames.has(p.name));
		plugins.splice(at, 0, ...replacement);
	}
	const inline = { ...config, plugins, root: appRoot, configFile: false, mode: 'development', logLevel: 'warn' };
	if (freshPlugins) {
		if (compilationApi) throw new Error('--fresh-plugins supports the default Analog mode only');
		// Vite's restart re-resolves `server.config.inlineConfig`, this object.
		Object.defineProperty(inline, 'plugins', {
			enumerable: true,
			get() {
				if (rebuildPlugins) {
					rebuildPlugins = false;
					plugins = nsPlugins(angularConfig({ mode: 'development' }));
				}
				return plugins;
			},
		});
	}
	server = await vite.createServer(inline);
	await server.listen();
} catch (e) {
	restore();
	throw e;
}

const port = server.config.server.port;
const local = `http://localhost:${port}`;
const log = [];
const short = (v, n = 220) => {
	const s = typeof v === 'string' ? v : JSON.stringify(v);
	return s.length > n ? s.slice(0, n) + '…' : s;
};
const summarize = (payload) => {
	if (!payload || typeof payload !== 'object') return short(payload);
	switch (payload.type) {
		case 'custom':
			return `custom:${payload.event} ${short(payload.data ?? '')}`;
		case 'update':
			return `update ${short(payload.updates.map((u) => ({ type: u.type, path: u.path, acceptedPath: u.acceptedPath, isWithinCircularImport: u.isWithinCircularImport || undefined })))}`;
		case 'full-reload':
			return `full-reload ${short({ path: payload.path, triggeredBy: payload.triggeredBy })}`;
		case 'prune':
			return `prune ${short(payload.paths)}`;
		case 'error':
			return `error ${short(payload.err?.message)} ${short(payload.err?.stack, 600)}`;
		default:
			return short(payload);
	}
};
const hook = (target, tag) => {
	if (!target || target.__probeHooked) return;
	target.__probeHooked = true;
	const orig = target.send.bind(target);
	target.send = (...a) => {
		const payload = typeof a[0] === 'string' ? { type: 'custom', event: a[0], data: a[1] } : a[0];
		log.push({ via: `raw:${tag}`, text: summarize(payload), payload, at: Date.now() });
		return orig(...a);
	};
};
hook(server.ws, 'server.ws');
if (server.environments?.client?.hot && server.environments.client.hot !== server.ws) hook(server.environments.client.hot, 'client.hot');

// Device-equivalent socket. The session descriptor names it (`wsUrl` with the
// token, `wsProtocol`) when the installed package has one; otherwise build
// Vite's HMR endpoint from the resolved config.
const session = await (await fetch(`${local}/__ns_dev__/session`)).json();
const deviceOrigin = new URL(session.entryUrl).origin;
const ENTRY_PATH = new URL(session.entryUrl).pathname;
const toLocal = (u) => u.replace(deviceOrigin, local);
let mapUrl;
let importMap = {};
async function loadImportMap(current) {
	mapUrl = current.runtimeConfigUrl;
	importMap = (await (await fetch(toLocal(mapUrl))).json()).importMap ?? {};
}
await loadImportMap(session);
// Opens the device-equivalent socket from the session descriptor; `reuseUrl`
// reconnects with an earlier URL, as the device does after a disconnect.
let socketUrl;
async function openSocket(reuseUrl) {
	const current = await (await fetch(`${local}/__ns_dev__/session`)).json();
	const hmrPath = path.posix.join(server.config.base || '/', typeof server.config.server.ws === 'object' && server.config.server.ws?.path ? server.config.server.ws.path : '');
	const fromSession = typeof current.wsProtocol === 'string';
	const url = reuseUrl ?? (fromSession ? current.wsUrl.replace(/^wss?:\/\/[^/]+/, `ws://localhost:${port}`) : `ws://localhost:${port}${hmrPath}?token=${encodeURIComponent(server.config.webSocketToken)}`);
	socketUrl = url;
	console.log(`socket: ${reuseUrl ? `reusing ${url.replace(/token=[^&]+/, 'token=…')} from before; ` : ''}${fromSession ? `session.wsUrl=${current.wsUrl.replace(/token=[^&]+/, 'token=…')} protocol=${current.wsProtocol}` : 'built from config'}`);
	const socket = new WebSocket(url, fromSession ? current.wsProtocol : 'vite-hmr');
	socket.addEventListener('message', (ev) => {
		let payload;
		try {
			payload = JSON.parse(String(ev.data));
		} catch {
			payload = String(ev.data);
		}
		log.push({ via: 'wire', text: summarize(payload), payload, at: Date.now() });
		if (payload?.type === 'custom' && payload.event === 'angular:component-update') void emulateComponentUpdate(payload.data);
	});
	await new Promise((resolve, reject) => {
		socket.addEventListener('open', resolve, { once: true });
		socket.addEventListener('error', () => reject(new Error(`could not open ${url}`)), { once: true });
	});
	return socket;
}
let ws = await openSocket();

// ---- warm the graph like the device ------------------------------------------
await init;
const seen = new Set();
// Imports the device could not load: non-2xx, dynamic literals that are not absolute, unmapped bare specifiers.
const crawlFailures = new Set();
function crawlFailure(text) {
	if (crawlFailures.has(text)) return;
	crawlFailures.add(text);
	console.warn(`  crawl FAIL ${text}`);
}
// `bodies` collects what was served per Vite URL pathname; `beforeFetch` runs before each module request.
async function crawl(url, opts = {}) {
	const key = new URL(url).pathname + new URL(url).search;
	if (seen.has(key)) return;
	seen.add(key);
	await opts.beforeFetch?.(url);
	const res = await fetch(toLocal(url));
	const body = await res.text();
	opts.bodies?.set(new URL(url).pathname, body);
	if (!loadableStatus(res.status)) {
		crawlFailure(`${res.status} ${key}`);
		return;
	}
	let imports = [];
	try {
		imports = parse(body)[0];
	} catch {
		return;
	}
	for (const imp of imports) {
		const r = resolveDeviceImport(imp, url, importMap, mapUrl);
		if (!r) continue;
		if (FAILURE_KINDS.has(r.kind)) crawlFailure(`${r.kind} '${r.spec}' in ${key}`);
		if (!r.url) continue;
		const target = new URL(r.url);
		if (target.origin !== deviceOrigin) crawlFailure(`foreign origin '${r.url}' in ${key}`);
		// App modules only: node_modules never import app code, so they add no importer edges.
		else if (target.pathname.startsWith('/src/')) await crawl(r.url, opts);
	}
}
await crawl(session.entryUrl);
{
	const home = await (await fetch(`${local}/src/app/home/home.component.ts`)).text();
	console.log(`home.component.ts compiled with HMR listener: ${home.includes('angular:component-update')}`);
	const lib = await (await fetch(`${local}/node_modules/@nativescript/angular/fesm2022/nativescript-angular.mjs`)).text();
	console.log(`@nativescript/angular prelude: ${lib.slice(0, 200).replace(/\n/g, ' ')}`);
}
// The renderer fetches each component's external styles once Angular hands them out (round 8/9).
const STYLE_FEATURE_RE = /ExternalStylesFeature\(\s*\[([^\]]*)\]/g;
async function emulateComponentUpdate(data) {
	try {
		const id = decodeURIComponent(data.id);
		const file = id.split('@')[0];
		const ownerUrl = `${deviceOrigin}/${file.replace(/^\/+/, '')}`;
		const metaUrl = new URL(`./@ng/component?c=${encodeURIComponent(data.id)}&t=${encodeURIComponent(data.timestamp)}`, ownerUrl).href;
		const res = await fetch(toLocal(metaUrl));
		const code = await res.text();
		const styles = [];
		for (const m of code.matchAll(STYLE_FEATURE_RE)) for (const s of m[1].matchAll(/["'`]([^"'`]+)["'`]/g)) styles.push(s[1]);
		const styleResults = [];
		for (const s of styles) {
			// Angular's ExternalStylesFeature appends the runtime component id and encapsulation.
			const r = await fetch(`${local}/${s.replace(/^\/+/, '')}?ngcomp=ng-cprobe&e=0`, { headers: { Accept: 'text/css' } });
			styleResults.push(`${s} -> ${r.status} ${(await r.text()).length}b`);
		}
		log.push({ via: 'device', text: `fetched ${new URL(metaUrl).pathname}?c=… (${res.status}, ${code.length}b) externalStyles=[${styleResults.join(', ')}]` });
	} catch (e) {
		log.push({ via: 'device', text: `component-update emulation failed: ${e?.message || e}` });
	}
}

async function servesMarker(componentCode, marker) {
	if (!componentCode) return false;
	if (componentCode.includes(marker)) return true;
	for (const m of componentCode.matchAll(STYLE_FEATURE_RE)) {
		for (const s of m[1].matchAll(/["'`]([^"'`]+)["'`]/g)) {
			const r = await fetch(`${local}/${s[1].replace(/^\/+/, '')}?ngcomp=ng-cprobe&e=0`, { headers: { Accept: 'text/css' } });
			if ((await r.text()).includes(marker)) return true;
		}
	}
	return false;
}

// Every compiled component runs `<Class>_HmrLoad(Date.now())` when its module
// evaluates, so a reloaded app fetches `/@ng/component` for each component at boot.
const BOOT_COMPONENTS = [
	['src/app/app.component.ts', 'AppComponent'],
	['src/app/home/home.component.ts', 'HomeComponent'],
];
async function bootMetadataFetches() {
	const out = [];
	for (const [file, cls] of BOOT_COMPONENTS) {
		const ownerUrl = `${deviceOrigin}/${file}`;
		const url = new URL(`./@ng/component?c=${encodeURIComponent(`${file}@${cls}`)}&t=${Date.now()}`, ownerUrl).href;
		const res = await fetch(toLocal(url));
		const body = await res.text();
		out.push({ via: 'device', text: `boot fetch ${cls} metadata: ${res.status} ${body.length}b ${/replaceMetadata|_UpdateMetadata|function/.test(body) ? '(REAL update payload)' : `(${JSON.stringify(body.slice(0, 40))})`}` });
	}
	return out;
}

const HOME_TS = 'src/app/home/home.component.ts';
const STAMP_TS = 'src/app/home/probe-stamp.ts';
const ROUTES_PATH = '/src/app/app.routes.ts';
// Follows the entry the device re-imports to app.routes.ts and checks its lazy import of home.component.ts.
async function checkLazyStamp(rebootTs, stampBefore) {
	const mainUrl = rebootTs ? `${session.entryUrl}?t=${rebootTs}` : session.entryUrl;
	const mainRes = await fetch(toLocal(mainUrl));
	const mainBody = await mainRes.text();
	if (!loadableStatus(mainRes.status)) return { ok: false, text: `${mainUrl} -> ${mainRes.status}` };
	const routes = parse(mainBody)[0]
		.map((imp) => resolveDeviceImport(imp, mainUrl, importMap, mapUrl))
		.find((r) => r?.kind === 'static' && new URL(r.url).pathname === ROUTES_PATH);
	if (!routes) return { ok: false, text: `${new URL(mainUrl).pathname}${new URL(mainUrl).search} has no static import of ${ROUTES_PATH}` };
	const routesRes = await fetch(toLocal(routes.url));
	const routesBody = await routesRes.text();
	if (!loadableStatus(routesRes.status)) return { ok: false, text: `${routes.url} -> ${routesRes.status}` };
	const lazy = parse(routesBody)[0].find((imp) => imp.d > -1 && imp.n && new URL(imp.n, routes.url).pathname === `/${HOME_TS}`);
	if (!lazy) return { ok: false, text: `${routes.spec} has no literal dynamic import of /${HOME_TS}` };
	const stamp = server.environments.client.moduleGraph.getModuleById(P(HOME_TS))?.lastHMRTimestamp ?? 0;
	const absolute = isHttpUrl(lazy.n) && new URL(lazy.n).origin === deviceOrigin;
	const t = new URL(lazy.n, routes.url).searchParams.get('t');
	const ok = absolute && stamp > stampBefore && t === String(stamp);
	return {
		ok,
		text: `entry ${rebootTs ? `?t=${rebootTs}` : '(no reboot)'} imports ${routes.spec}, which lazy-loads ${JSON.stringify(lazy.n)}: ${absolute ? 'absolute' : 'NOT absolute'}, t=${t}; ${HOME_TS} lastHMRTimestamp=${stamp} (before the edit ${stampBefore})`,
	};
}

// Vite never watches `node_modules`, so the probe reports the edit the way a
// watched path (a workspace-linked package under `/@fs/`) would reach Vite.
async function editCoreFile() {
	const coreFile = 'node_modules/@nativescript/core/index.js';
	await fetch(`${local}/${coreFile}`);
	write(coreFile, fs.readFileSync(P(coreFile), 'utf8') + '\n// probe edit\n');
	server.watcher.emit('change', P(coreFile));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function settle() {
	await sleep(1500);
	let last = -1;
	for (let i = 0; i < 20 && log.length !== last; i++) {
		last = log.length;
		await sleep(1200);
	}
}
await settle();
log.length = 0;

const results = [];
const checks = [];
try {
	for (const edit of EDITS) {
		if (edit.send) ws.send(JSON.stringify(edit.send));
		else if (edit.coreEdit) await editCoreFile();
		else if (edit.reconnect) {
			ws.close();
			await sleep(300);
			log.length = 0;
			ws = await openSocket(socketUrl);
		} else if (edit.offlineEdit) {
			ws.close();
			await sleep(300);
			replaceIn(edit.offlineEdit.file, edit.offlineEdit.from, edit.offlineEdit.to);
			await settle();
			log.length = 0;
			ws = await openSocket(socketUrl);
		} else if (edit.serverRestart) {
			await server.restart();
			hook(server.ws, 'server.ws');
			ws.close();
			const after = await (await fetch(`${local}/__ns_dev__/session`)).json();
			const tokenOf = (u) => new URL(u).searchParams.get('token');
			log.push({ via: 'device', text: `token after restart ${tokenOf(after.wsUrl) === tokenOf(socketUrl) ? 'unchanged' : 'CHANGED'}; reconnecting with the URL from before` });
			ws = await openSocket(socketUrl);
		} else if (edit.bootRace) {
			ws.close();
			rebuildPlugins = freshPlugins;
			await server.restart();
			if (freshPlugins) log.push({ via: 'device', text: `restart resolved ${rebuildPlugins ? 'the SAME' : 'new'} plugin instances`, at: Date.now() });
			hook(server.ws, 'server.ws');
			const homeUrl = '/src/app/home/home.component.ts';
			const marker = edit.stylesheet ? `probe-${edit.key}` : `taps ${edit.key}`;
			const templateFile = edit.stylesheet ? 'src/app/home/home.component.css' : 'src/app/home/home.component.html';
			const graphState = () => {
				const g = server.environments.client.moduleGraph;
				const nodes = [...(g.getModulesByFile(P(templateFile)) ?? [])];
				const home = g.getModuleById(P(homeUrl.slice(1)));
				return `graph: ${templateFile} nodes=${nodes.length} importers=[${nodes.flatMap((n) => [...n.importers].map((i) => i.url)).join(',')}]; ${homeUrl} node=${home ? `yes transformed=${!!home.transformResult}` : 'no'}`;
			};
			const saveTemplate = async () => {
				const seenByWatcher = new Promise((resolve) => {
					const onChange = (file) => file === P(templateFile) && (server.watcher.off('change', onChange), resolve(true));
					server.watcher.on('change', onChange);
					setTimeout(() => (server.watcher.off('change', onChange), resolve(false)), 3000);
				});
				log.push({ via: 'device', text: `template saved ('${marker}'); ${graphState()}`, at: Date.now() });
				if (edit.stylesheet) write(templateFile, fs.readFileSync(P(templateFile), 'utf8') + `\n.${marker} { color: red; }\n`);
				else replaceIn(templateFile, 'taps', marker);
				if (!(await seenByWatcher)) log.push({ via: 'device', text: 'WATCHER MISSED THE SAVE', at: Date.now() });
				await settle();
			};
			// The new watcher needs its initial scan before it reports changes.
			await settle();
			if (edit.bootRace === 'before-crawl') await saveTemplate();
			const boot = await (await fetch(`${local}/__ns_dev__/session`)).json();
			await loadImportMap(boot);
			const bodies = new Map();
			seen.clear();
			await crawl(boot.entryUrl, {
				bodies,
				beforeFetch: async (url) => {
					if (edit.bootRace === 'before-home' && new URL(url).pathname === homeUrl) await saveTemplate();
				},
			});
			if (edit.bootRace === 'after-home') await saveTemplate();
			edit.homeUrl = homeUrl;
			edit.marker = marker;
			edit.fresh = await servesMarker(bodies.get(homeUrl), marker);
			log.push({ via: 'device', text: `booted (${bodies.size} app modules): ${homeUrl} ${!bodies.has(homeUrl) ? 'never fetched' : edit.fresh ? 'has the new template' : 'has the OLD template'}`, at: Date.now() });
			ws = await openSocket();
		} else if (edit.stampProbe) {
			created.push(STAMP_TS);
			fs.writeFileSync(P(STAMP_TS), `export const PROBE_STAMP = 'a';\n`);
			write(HOME_TS, `import './probe-stamp';\n${fs.readFileSync(P(HOME_TS), 'utf8')}`);
			await settle();
			log.length = 0;
			ipcMessages.length = 0;
			// The device picks up the new import the next time it loads home.component.ts.
			seen.clear();
			await crawl(session.entryUrl);
			const g = server.environments.client.moduleGraph;
			const helper = g.getModuleById(P(STAMP_TS));
			edit.stampBefore = g.getModuleById(P(HOME_TS))?.lastHMRTimestamp ?? 0;
			log.push({ via: 'device', text: `${STAMP_TS} in graph: ${helper ? `importers=[${[...helper.importers].map((i) => i.url).join(',')}]` : 'NO'}; ${HOME_TS} lastHMRTimestamp=${edit.stampBefore}`, at: Date.now() });
			replaceIn(STAMP_TS, `'a'`, `'b'`);
		} else if (edit.append) write(edit.file, fs.readFileSync(P(edit.file), 'utf8') + edit.append);
		else replaceIn(edit.file, edit.from, edit.to);
		const editedAt = Date.now();
		await settle();
		if (process.env.PROBE_TRANSFORM_CHECK) {
			for (const rel of process.env.PROBE_TRANSFORM_CHECK.split(',')) {
				const mod = server.environments.client.moduleGraph.getModuleById(P(rel));
				if (mod) server.environments.client.moduleGraph.invalidateModule(mod);
				try {
					const r = await server.environments.client.transformRequest(`/${rel}`);
					log.push({ via: 'check', text: `${rel} transform ok (${r?.code?.length}b)` });
					if (process.env.PROBE_DUMP) fs.writeFileSync(`${process.env.PROBE_DUMP}-${edit.key}.js`, r?.code ?? '');
				} catch (err) {
					log.push({ via: 'check', text: `${rel} transform FAILED: ${String(err?.message).slice(0, 200)} plugin=${err?.plugin} id=${err?.id} loc=${JSON.stringify(err?.loc)}` });
				}
			}
		}
		const entries = log.splice(0);
		// A device re-imports the entry on a soft reboot, which re-transforms the changed chain.
		const reboot = entries.find((e) => e.via === 'wire' && e.payload?.type === 'update' && e.payload.updates.some((u) => u.type === 'js-update' && u.path === ENTRY_PATH));
		if (reboot) {
			const ts = reboot.payload.updates[0].timestamp;
			seen.clear();
			const bodies = new Map();
			await crawl(`${session.entryUrl}?t=${ts}`, { bodies });
			if (edit.bootRace && bodies.has(edit.homeUrl)) {
				edit.fresh = await servesMarker(bodies.get(edit.homeUrl), edit.marker);
				entries.push({ via: 'device', text: `catch-up re-fetched ${edit.homeUrl}: ${edit.fresh ? 'has the new template' : 'has the OLD template'}` });
			}
			await settle();
			log.length = 0;
			entries.push(...(await bootMetadataFetches()));
		}
		if (edit.stampProbe) {
			const check = await checkLazyStamp(reboot?.payload.updates[0].timestamp, edit.stampBefore).catch((e) => ({ ok: false, text: `stamp check failed: ${e?.message || e}` }));
			edit.stamped = check.ok;
			entries.push({ via: 'device', text: check.text });
		}
		entries.push(...ipcMessages.splice(0).map((message) => ({ via: 'ipc', text: short(message), payload: message })));
		results.push({ edit, entries });
		console.log(`\n--- ${edit.label}`);
		if (!entries.length) console.log('    (nothing sent)');
		for (const e of entries) console.log(`    ${e.via.padEnd(16)} ${e.at && typeof editedAt === 'number' ? `+${e.at - editedAt}ms `.padEnd(9) : ''}${e.text}`);
		// The compile check runs between the update reaching `server.ws.send` and the wire.
		const rawUpdate = entries.find((e) => e.via.startsWith('raw:') && e.payload?.type === 'update');
		const gated = rawUpdate && entries.find((e) => e.via === 'wire' && e.at >= rawUpdate.at && (e.payload?.type === 'error' || e.payload?.type === 'update' || e.payload?.event === 'ns:rerun'));
		if (gated) console.log(`    gate             ${gated.at - rawUpdate.at}ms from server.ws.send to the wire`);
		if (edit.expect) {
			const wire = entries.filter((e) => e.via === 'wire').map((e) => e.payload);
			const reboots = wire.filter((p) => p?.type === 'update' && p.updates.some((u) => u.path === ENTRY_PATH));
			const rerun = wire.find((p) => p?.type === 'custom' && p.event === 'ns:rerun');
			const facts = {
				error: wire.some((p) => p?.type === 'error'),
				update: wire.some((p) => p?.type === 'update'),
				rerun: !!rerun,
				reboot: reboots.length,
				inPlace: wire.some((p) => p?.type === 'custom' && p.event === 'angular:component-update'),
				rerunIncludes: rerun?.data?.rerun ?? [],
				fresh: edit.fresh,
				stamped: edit.stamped,
			};
			const failures = Object.entries(edit.expect).filter(([k, v]) => (k === 'rerunIncludes' ? !facts.rerunIncludes.includes(v) : facts[k] !== v));
			const verdict = failures.length ? `FAIL ${failures.map(([k, v]) => `${k}: expected ${JSON.stringify(v)}, got ${JSON.stringify(facts[k])}`).join('; ')}` : 'ok';
			checks.push({ key: edit.key, verdict });
			console.log(`    expect           ${verdict}`);
			if (edit.bootRace) console.log(`    verdict          ${verdict === 'ok' ? 'PASS' : 'FAIL'}: last served home.component.ts ${edit.fresh ? 'has the new template' : 'has the OLD template'}, ${reboots.length} catch-up reboot(s)${rerun ? ` (rerun ${JSON.stringify(facts.rerunIncludes)})` : ''}`);
		}
	}
} finally {
	restore();
	ws.close();
	await server.close();
}

const mode = compilationApi ? 'compilation-api' : 'default';
fs.mkdirSync(path.join(spikeDir, 'out'), { recursive: true });
const outFile = path.join(spikeDir, 'out', `payload-probe-${mode}.json`);
fs.writeFileSync(
	outFile,
	JSON.stringify(
		results.map((r) => ({ edit: r.edit.label, entries: r.entries.map(({ via, text }) => ({ via, text })) })),
		null,
		2,
	),
);
console.log(`\nmode=${mode} wrote ${path.relative(process.cwd(), outFile)}`);
if (checks.length) {
	const failed = checks.filter((c) => c.verdict !== 'ok').map((c) => c.key);
	console.log(`expectations: ${checks.length - failed.length}/${checks.length} ok${failed.length ? ` (failed: ${failed.join(', ')})` : ''}`);
}
console.log(`crawl: ${crawlFailures.size} imports the device could not load${crawlFailures.size ? `\n${[...crawlFailures].map((f) => `    ${f}`).join('\n')}` : ''}`);
process.exit(0);
