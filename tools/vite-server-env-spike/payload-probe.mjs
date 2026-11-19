// Spike: boot the Angular fixture's dev server in-process, warm Vite's module
// graph the way the device does (crawl /ns/v from the session entry), apply a
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
// --keep-ns-strategy  keep the `nativescript-hmr-websocket` plugin if the installed package still has one

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

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
const only = take('--only', '')
	.split(',')
	.map((s) => s.trim())
	.filter(Boolean);
const appRoot = path.resolve(spikeDir, take('--app', 'apps/ng'));

process.chdir(appRoot);
process.argv.splice(2);
process.argv.push('--', '--env.ios', '--env.hmr');
process.env.NS_HMR_PORT = process.env.NS_HMR_PORT || '5196';

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
function restore() {
	for (const [rel, text] of originals) fs.writeFileSync(P(rel), text);
	for (const rel of created.reverse()) fs.rmSync(P(rel), { recursive: true, force: true });
}
process.on('SIGINT', () => {
	restore();
	process.exit(130);
});

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
replaceIn('src/app/app.routes.ts', `export const routes: Routes = [`, `export const PROBE_MARKER = 'a';\n\nexport const routes: Routes = [\n\t{ path: 'probe-inline', loadComponent: () => import('./probe-inline/probe-inline.component').then((m) => m.ProbeInlineComponent) },`);

const EDITS = [
	{ key: 'a', label: '(a) external home.component.html text', file: 'src/app/home/home.component.html', from: `'Hot taps: '`, to: `'Hot taps!: '` },
	{ key: 'a2', label: '(a) external home.component.html text #2', file: 'src/app/home/home.component.html', from: `'Hot taps!: '`, to: `'Hot taps!!: '` },
	{ key: 'b1', label: '(b) home.component.css color #1', file: 'src/app/home/home.component.css', from: 'color: red;', to: 'color: blue;' },
	{ key: 'b2', label: '(b) home.component.css color #2', file: 'src/app/home/home.component.css', from: 'color: blue;', to: 'color: green;' },
	{ key: 'c', label: '(c) class body home.component.ts signal(0)->signal(10)', file: 'src/app/home/home.component.ts', from: 'signal(0)', to: 'signal(10)' },
	{ key: 'd1', label: '(d) inline styles in component .ts', file: INLINE_TS, from: '.inline { color: red; }', to: '.inline { color: blue; }' },
	{ key: 'd2', label: '(d) inline template in component .ts', file: INLINE_TS, from: `'Inline: '`, to: `'Inline!: '` },
	{ key: 'e', label: '(e) non-component .ts (app.routes.ts)', file: 'src/app/app.routes.ts', from: `PROBE_MARKER = 'a'`, to: `PROBE_MARKER = 'b'` },
	{ key: 'f', label: '(f) root app.component.html', file: 'src/app/app.component.html', from: '<GridLayout>', to: '<GridLayout class="probe">' },
	{ key: 'g', label: '(g) global app.css', file: 'src/app.css', append: '\n.probe-global { color: red; }\n' },
	{ key: 'i', label: '(i) device sends angular:invalidate', send: { type: 'custom', event: 'angular:invalidate', data: { id: 'probe', message: 'probe: replaceMetadata threw' } } },
].filter((e) => !only.length || only.includes(e.key) || only.includes(e.key[0]));

// ---- server ----------------------------------------------------------------
let server;
try {
	const { angularConfig } = await import(pathToFileURL(path.join(nsViteDir, 'configuration/angular.js')).href);
	const config = angularConfig({ mode: 'development' });
	let plugins = config.plugins.flat(Infinity).filter(Boolean);
	if (!keepNsStrategy) plugins = plugins.filter((p) => p.name !== 'nativescript-hmr-websocket');
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
	server = await vite.createServer({ ...config, plugins, root: appRoot, configFile: false, mode: 'development', logLevel: 'warn' });
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
			return `error ${short(payload.err?.message)}`;
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
		log.push({ via: `raw:${tag}`, text: summarize(payload), payload });
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
const toLocal = (u) => u.replace(deviceOrigin, local);
const hmrPath = path.posix.join(server.config.base || '/', typeof server.config.server.ws === 'object' && server.config.server.ws?.path ? server.config.server.ws.path : '');
const fromSession = typeof session.wsProtocol === 'string';
const wsUrl = fromSession ? session.wsUrl.replace(/^wss?:\/\/[^/]+/, `ws://localhost:${port}`) : `ws://localhost:${port}${hmrPath}?token=${encodeURIComponent(server.config.webSocketToken)}`;
console.log(`socket: ${fromSession ? `session.wsUrl=${session.wsUrl.replace(/token=[^&]+/, 'token=…')} protocol=${session.wsProtocol}` : 'built from config'}`);
const ws = new WebSocket(wsUrl, fromSession ? session.wsProtocol : 'vite-hmr');
ws.addEventListener('message', (ev) => {
	let payload;
	try {
		payload = JSON.parse(String(ev.data));
	} catch {
		payload = String(ev.data);
	}
	log.push({ via: 'wire', text: summarize(payload), payload });
	if (payload?.type === 'custom' && payload.event === 'angular:component-update') void emulateComponentUpdate(payload.data);
});
await new Promise((resolve, reject) => {
	ws.addEventListener('open', resolve, { once: true });
	ws.addEventListener('error', () => reject(new Error(`could not open ${wsUrl}`)), { once: true });
});

// ---- warm the graph like the device ------------------------------------------
await init;
const seen = new Set();
async function crawl(url) {
	const key = new URL(url).pathname + new URL(url).search;
	if (seen.has(key)) return;
	seen.add(key);
	const res = await fetch(toLocal(url));
	const body = await res.text();
	if (res.status !== 200) {
		console.warn(`  crawl ${res.status} ${key}`);
		return;
	}
	let imports = [];
	try {
		imports = parse(body)[0];
	} catch {
		return;
	}
	for (const imp of imports) {
		const spec = imp.n;
		if (!spec || !/^https?:\/\//.test(spec)) continue;
		const p = new URL(spec).pathname;
		// App modules only: node_modules never import app code, so they add no importer edges.
		if (p.startsWith('/ns/v/src/')) await crawl(spec);
	}
}
await crawl(session.entryUrl);
{
	const home = await (await fetch(`${local}/ns/v/src/app/home/home.component.ts`)).text();
	console.log(`home.component.ts compiled with HMR listener: ${home.includes('angular:component-update')}`);
	const lib = await (await fetch(`${local}/ns/v/node_modules/@nativescript/angular/fesm2022/nativescript-angular.mjs`)).text();
	console.log(`@nativescript/angular prelude: ${lib.slice(0, 200).replace(/\n/g, ' ')}`);
}
// The renderer fetches each component's external styles once Angular hands them out (round 8/9).
const STYLE_FEATURE_RE = /ExternalStylesFeature\(\s*\[([^\]]*)\]/g;
async function emulateComponentUpdate(data) {
	try {
		const id = decodeURIComponent(data.id);
		const file = id.split('@')[0];
		const ownerUrl = `${deviceOrigin}/ns/v/${file.replace(/^\/+/, '')}`;
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

// Every compiled component runs `<Class>_HmrLoad(Date.now())` when its module
// evaluates, so a reloaded app fetches `/@ng/component` for each component at boot.
const BOOT_COMPONENTS = [
	['src/app/app.component.ts', 'AppComponent'],
	['src/app/home/home.component.ts', 'HomeComponent'],
];
async function bootMetadataFetches() {
	const out = [];
	for (const [file, cls] of BOOT_COMPONENTS) {
		const ownerUrl = `${deviceOrigin}/ns/v/${file}`;
		const url = new URL(`./@ng/component?c=${encodeURIComponent(`${file}@${cls}`)}&t=${Date.now()}`, ownerUrl).href;
		const res = await fetch(toLocal(url));
		const body = await res.text();
		out.push({ via: 'device', text: `boot fetch ${cls} metadata: ${res.status} ${body.length}b ${/replaceMetadata|_UpdateMetadata|function/.test(body) ? '(REAL update payload)' : `(${JSON.stringify(body.slice(0, 40))})`}` });
	}
	return out;
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
try {
	for (const edit of EDITS) {
		if (edit.send) ws.send(JSON.stringify(edit.send));
		else if (edit.append) write(edit.file, fs.readFileSync(P(edit.file), 'utf8') + edit.append);
		else replaceIn(edit.file, edit.from, edit.to);
		await settle();
		const entries = log.splice(0);
		// A device re-imports the entry after a full reload, which re-transforms the graph.
		if (entries.some((e) => e.via === 'wire' && e.payload?.type === 'full-reload')) {
			seen.clear();
			await crawl(session.entryUrl);
			await settle();
			log.length = 0;
			entries.push(...(await bootMetadataFetches()));
		}
		results.push({ edit, entries });
		console.log(`\n--- ${edit.label}`);
		if (!entries.length) console.log('    (nothing sent)');
		for (const e of entries) console.log(`    ${e.via.padEnd(16)} ${e.text}`);
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
process.exit(0);
