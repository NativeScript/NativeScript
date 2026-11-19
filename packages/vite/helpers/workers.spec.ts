import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import { neutralizeWorkerImportMeta, toModuleWorkerUrl, workerHmrUrlPlugin } from './workers.js';
import { NS_DEV_EXPR } from '../hmr/shared/runtime/dev-globals.js';
import { NS_BEFORE_RERUN_EVENT, NS_UPDATE_RERUN_EVENT } from '../hmr/shared/protocol.js';
import { HMRClient, HMRContext } from '../hmr/client/hmr-client.js';
import { nsRerunPlugin } from '../hmr/server/update-gate.js';

// Fixed POSIX paths standing in for an Nx workspace layout, so the assertions
// don't depend on the machine running them.
const PROJECT_ROOT = '/abs/workspace/apps/console';

describe('toModuleWorkerUrl', () => {
	it('asks for a module worker, whatever type Vite inferred', () => {
		expect(toModuleWorkerUrl('/src/workers/light.worker.ts?worker_file&type=classic')).toBe('/src/workers/light.worker.ts?worker_file&type=module');
		expect(toModuleWorkerUrl('/src/foo.worker.ts?worker_file&type=module')).toBe('/src/foo.worker.ts?worker_file&type=module');
		expect(toModuleWorkerUrl('/src/foo.worker.ts?worker_file&type=ignore')).toBe('/src/foo.worker.ts?worker_file&type=module');
		expect(toModuleWorkerUrl('/src/foo.worker.ts?worker_file')).toBe('/src/foo.worker.ts?worker_file&type=module');
	});

	it('keeps /@fs/ paths and other query params', () => {
		expect(toModuleWorkerUrl('/@fs/abs/workspace/libs/utils/src/index.worker.ts?worker_file&type=classic')).toBe('/@fs/abs/workspace/libs/utils/src/index.worker.ts?worker_file&type=module');
		expect(toModuleWorkerUrl('/src/foo.worker.ts?something=1&worker_file&type=classic')).toBe('/src/foo.worker.ts?worker_file&type=module&something=1');
	});

	it('refuses URLs that are not root-relative Vite worker URLs', () => {
		expect(toModuleWorkerUrl('/src/assets/foo.png?import')).toBeNull();
		expect(toModuleWorkerUrl('/src/foo.ts')).toBeNull();
		expect(toModuleWorkerUrl('/src/foo.ts?worker_file_x=1')).toBeNull();
		expect(toModuleWorkerUrl('foo.worker.ts?worker_file')).toBeNull();
		expect(toModuleWorkerUrl('')).toBeNull();
		expect(toModuleWorkerUrl(undefined as any)).toBeNull();
	});
});

function callTransform(plugin: ReturnType<typeof workerHmrUrlPlugin>, code: string, id: string) {
	const transform = (plugin as any).transform as (code: string, id: string) => any;
	return transform.call({}, code, id);
}

const viteWorker = (url: string, quote = '"') => `new Worker(new URL(/* @vite-ignore */${quote}${url}${quote}, ${quote === '`' ? '``' : quote + quote} + import.meta.url))`;

describe('workerHmrUrlPlugin (transform)', () => {
	it("rewrites Vite's dev worker shape to the module worker URL on the dev origin", () => {
		const input = `export function create() {\n  return ${viteWorker('/src/workers/light.worker.ts?worker_file&type=classic')};\n}`;
		const result = callTransform(workerHmrUrlPlugin(), input, path.join(PROJECT_ROOT, 'src/workers/index.ts'));

		expect(result.code).toContain(`__nsHmrTrackWorker(new Worker((${NS_DEV_EXPR}.httpOrigin || "").replace(/\\/+$/, "") + "/src/workers/light.worker.ts?worker_file&type=module"))`);
		expect(result.code).not.toContain('new URL(');
		expect(result.code).not.toContain('import.meta.url');
		expect(result.map).toBeNull();
	});

	it('keeps the options argument', () => {
		const input = `${viteWorker('/src/foo.worker.ts?worker_file&type=classic').slice(0, -1)}, { name: 'foo' });`;
		const result = callTransform(workerHmrUrlPlugin(), input, path.join(PROJECT_ROOT, 'src/index.ts'));
		expect(result.code).toContain(`"/src/foo.worker.ts?worker_file&type=module", { name: 'foo' }))`);
	});

	it('accepts every quote style Vite may emit', () => {
		for (const quote of ["'", '"', '`']) {
			const result = callTransform(workerHmrUrlPlugin(), viteWorker('/src/foo.worker.ts?worker_file&type=classic', quote), path.join(PROJECT_ROOT, 'src/index.ts'));
			expect(result?.code, `quote ${quote}`).toContain('"/src/foo.worker.ts?worker_file&type=module"');
		}
	});

	it('rewrites every worker of a module and injects one owner helper', () => {
		const input = [`export const a = ${viteWorker('/src/a.worker.ts?worker_file&type=classic')};`, `export const b = ${viteWorker('/@fs/elsewhere/b.worker.ts?worker_file&type=classic')};`].join('\n');
		const result = callTransform(workerHmrUrlPlugin(), input, path.join(PROJECT_ROOT, 'src/index.ts'));

		expect(result.code.match(/__nsHmrTrackWorker\(new Worker\(/g)).toHaveLength(2);
		expect(result.code.match(/const __nsHmrTrackWorker = /g)).toHaveLength(1);
		expect(result.code.indexOf('const __nsHmrTrackWorker = ')).toBe(0);
		expect(result.code).toContain('"/@fs/elsewhere/b.worker.ts?worker_file&type=module"');
	});

	it("terminates the module's workers when it re-runs or is pruned, and leaves its dispose slot alone", async () => {
		const { code } = callTransform(workerHmrUrlPlugin(), `function spawn() { return ${viteWorker('/src/foo.worker.ts?worker_file&type=classic')}; }`, path.join(PROJECT_ROOT, 'src/spawner.ts'));
		class FakeWorker {
			terminated = 0;
			terminate() {
				this.terminated++;
			}
		}
		const client = new HMRClient({ error() {}, debug() {} });
		const hot = new HMRContext(client, '/src/spawner.ts');
		const spawn: () => FakeWorker = new Function('hot', 'Worker', `${code.replaceAll('import.meta.hot', 'hot')}\nreturn spawn;`)(hot, FakeWorker);

		const first = spawn();
		await client.notifyOwnerListeners(NS_BEFORE_RERUN_EVENT, {}, ['/src/other.ts']);
		expect(first.terminated).toBe(0);
		await client.notifyOwnerListeners(NS_BEFORE_RERUN_EVENT, {}, ['/src/spawner.ts']);
		expect(first.terminated).toBe(1);

		const second = spawn();
		await client.prunePaths(['/src/spawner.ts']);
		expect(second.terminated).toBe(1);
		expect(first.terminated).toBe(1);
		expect(client.disposeMap.has('/src/spawner.ts')).toBe(false);
	});

	it('leaves modules without a Vite worker URL alone', () => {
		const plugin = workerHmrUrlPlugin();
		expect(callTransform(plugin, 'export const x = 1;', path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
		expect(callTransform(plugin, "new Worker(new URL('./worker', import.meta.url));", path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
		expect(callTransform(plugin, 'const u = new URL("./asset", import.meta.url); new WorkerSubclass();', path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
		expect(callTransform(plugin, viteWorker('/src/asset.png?import'), path.join(PROJECT_ROOT, 'src/foo.ts'))).toBeNull();
	});

	it('skips node_modules and pre-bundled deps', () => {
		const plugin = workerHmrUrlPlugin();
		const code = viteWorker('/src/foo.worker.ts?worker_file&type=classic');
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, 'node_modules/some-pkg/dist/index.js'))).toBeNull();
		expect(callTransform(plugin, code, path.join(PROJECT_ROOT, '.vite/deps/foo.js'))).toBeNull();
	});
});

// spawner → (URL string) worker; worker → shared, only; main → spawner, shared.
// `main` self-accepts, standing in for the app entry boundary.
describe('worker graph in a real Vite dev server', () => {
	let root: string;
	let server: ViteDevServer | undefined;
	let sent: any[];

	const files: Record<string, string> = {
		'package.json': JSON.stringify({ main: 'main.js' }),
		'main.js': "import { spawn } from './spawner.js';\nimport { shared } from './shared.js';\nexport const app = [spawn, shared];\nif (import.meta.hot) import.meta.hot.accept();\n",
		'spawner.js': "export function spawn() {\n\treturn new Worker(new URL('./worker.js', import.meta.url));\n}\n",
		'worker.js': "import { shared } from './shared.js';\nimport { only } from './only.js';\nself.onmessage = () => postMessage([shared, only, __SPEC_DEFINE__]);\n",
		'shared.js': "export const shared = 'shared';\n",
		'only.js': "export const only = 'only';\n",
	};
	const WORKER_URL = '/worker.js?worker_file&type=module';

	async function start() {
		root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-worker-graph-')));
		for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(root, name), content);
		sent = [];
		const capture: Plugin = {
			name: 'capture-sends',
			configureServer(s) {
				const original = s.ws.send.bind(s.ws) as (...args: any[]) => void;
				(s.ws as any).send = (...args: any[]) => {
					sent.push(typeof args[0] === 'string' ? { type: 'custom', event: args[0], data: args[1] } : args[0]);
					return original(...args);
				};
			},
		};
		server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			define: { __SPEC_DEFINE__: '"defined"' },
			optimizeDeps: { noDiscovery: true, include: [] },
			server: { middlewareMode: true, ws: false, watch: null },
			// `capture` first, so its wrapper sees what the update gate sends.
			plugins: [capture, nsRerunPlugin(), workerHmrUrlPlugin()],
		});
		const client = server.environments.client;
		const transformed: Record<string, string> = {};
		for (const url of ['/main.js', '/spawner.js', '/shared.js', WORKER_URL, '/only.js']) {
			transformed[url] = (await client.transformRequest(url))!.code;
		}
		return transformed;
	}

	async function edit(name: string) {
		const file = path.join(root, name);
		fs.writeFileSync(file, fs.readFileSync(file, 'utf8') + '// edited\n');
		server!.watcher.emit('change', file);
		const isUpdate = (p: any) => p?.type === 'update' || p?.type === 'full-reload';
		await expect.poll(() => sent.some(isUpdate), { timeout: 5000 }).toBe(true);
		return sent.find(isUpdate);
	}

	afterEach(async () => {
		await server?.close();
		server = undefined;
		fs.rmSync(root, { recursive: true, force: true });
	});

	it('serves the spawner with a hot context and no graph edge to the worker', async () => {
		const code = (await start())['/spawner.js'];

		expect(code).toContain(`+ ${JSON.stringify(WORKER_URL)}))`);
		expect(code).toContain('__vite__createHotContext("/spawner.js")');
		const spawner = server!.environments.client.moduleGraph.getModuleById(path.join(root, 'spawner.js'))!;
		expect([...spawner.importedModules].map((m) => m.url)).toEqual([]);
	});

	it('imports /@vite/env first in the worker entry, so the worker realm gets the defines', async () => {
		const code = (await start())[WORKER_URL];

		// Import analysis rewrites `/@vite/env` to Vite's env module file.
		const firstImport = /import\s+(?:[^'"]*from\s+)?["']([^"']+)["']/.exec(code)![1];
		expect(firstImport).toMatch(/^\/@fs\/.*\/vite\/dist\/client\/env\.mjs$/);
		expect(code).not.toContain('importScripts');
		expect(code).not.toContain('/@vite/client');
		const env = (await server!.environments.client.transformRequest(firstImport))!.code;
		expect(env).toContain('__SPEC_DEFINE__');
	});

	it('restarts the app on an edit to the worker entry', async () => {
		await start();
		expect((await edit('worker.js')).type).toBe('full-reload');
	});

	it('restarts the app on an edit to a module only the worker imports', async () => {
		await start();
		expect((await edit('only.js')).type).toBe('full-reload');
	});

	it('restarts the app on an edit to a module the worker shares with an accepted main-realm graph', async () => {
		await start();
		expect((await edit('shared.js')).type).toBe('full-reload');
	});

	it('re-runs the spawner in place on an edit to it, so its workers get `nativescript:beforeRerun`', async () => {
		await start();
		const payload = await edit('spawner.js');
		expect(payload.type).toBe('update');
		expect(payload.updates.map((u: any) => u.acceptedPath)).toEqual(['/main.js']);
		const rerun = sent.find((p) => p?.event === NS_UPDATE_RERUN_EVENT);
		expect(rerun.data.rerun).toContain('/spawner.js');
	});
});

// tsFallbackTransformPlugin + angularWorkerUrlPreservePlugin specs moved with
// their plugins to hmr/frameworks/angular/build/.

// --- neutralizeWorkerImportMeta -----------------------------------------
//
// Worker chunks are classic scripts; any code-level `import.meta` token is a
// compile-time SyntaxError on device ("Cannot compile script"). The transform
// must remove every member-access form while leaving string-literal
// occurrences (acorn error messages etc.) untouched. The vm.Script assertions
// mirror the exact compile gate the NS worker bootstrap applies.
describe('neutralizeWorkerImportMeta', () => {
	it('returns null for modules without import.meta (no-op fast path)', () => {
		expect(neutralizeWorkerImportMeta('export const a = 1;')).toBeNull();
	});

	it('substitutes .url and .dirname with static worker-safe values', () => {
		const out = neutralizeWorkerImportMeta('const u = import.meta.url; const d = import.meta.dirname;');
		expect(out?.code).toBe('const u = "file:///app/"; const d = "";');
	});

	it('neutralizes bracket member access (the @nativescript/angular hmr view-cache pattern)', () => {
		const input = ['function readImportMetaHot() { try { return import.meta["hot"]; } catch { return undefined; } }', "if (import.meta['webpackHot']) { import.meta['webpackHot'].decline(); }"].join('\n');
		const out = neutralizeWorkerImportMeta(input);
		expect(out?.code).not.toContain('import.meta');
		expect(out?.code).toContain('return (undefined);');
		expect(out?.code).toContain('if ((undefined))');
	});

	it('neutralizes dot member access beyond .url/.dirname (.hot, .env, ...)', () => {
		const out = neutralizeWorkerImportMeta('const h = import.meta.hot; const e = import.meta.env;');
		expect(out?.code).toBe('const h = (undefined); const e = (undefined);');
	});

	it('leaves bare import.meta inside string literals untouched', () => {
		// acorn's parser error messages — rewriting these corrupts library data,
		// and strings cannot break classic-script compilation.
		const input = 'this.raise(pos, "Cannot use \'import.meta\' outside a module");';
		const out = neutralizeWorkerImportMeta(input);
		expect(out?.code).toBe(input);
	});

	it('never adds or removes lines (line-level source mappings stay valid)', () => {
		const input = ['const a = import.meta.url;', 'const b = import.meta["hot"];', 'const c = import.meta.env;'].join('\n');
		const out = neutralizeWorkerImportMeta(input);
		expect(out?.code.split('\n')).toHaveLength(3);
	});

	it('produces classic-script-compilable output from a realistic hmr-helper module', async () => {
		const vm = await import('node:vm');
		const input = ['function readImportMetaHot() {', '	try {', '		return import.meta["hot"];', '	} catch {', '		return undefined;', '	}', '}', 'function hasImportMetaHot() {', '	try {', '		return !!import.meta["hot"];', '	} catch {', '		return false;', '	}', '}', 'if (import.meta["webpackHot"]) {', '	import.meta["webpackHot"].decline();', '}', 'const base = import.meta.url;'].join('\n');
		// Before: compiling as a classic script must fail — this is the exact
		// failure mode the transform exists to prevent.
		expect(() => new vm.Script(input)).toThrow(/import\.meta/);
		const out = neutralizeWorkerImportMeta(input);
		expect(() => new vm.Script(out!.code)).not.toThrow();
	});
});
