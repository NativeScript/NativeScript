import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./app-restart.js', () => ({ requestAppRestart: vi.fn() }));

import { registerFrameworkFlavor } from '../framework-flavors.js';
import { NS_UPDATE_RERUN_EVENT } from '../shared/protocol.js';
import { requestAppRestart } from './app-restart.js';
import { nsEntryBoundaryPlugin } from './entry-boundary.js';
import { ServedModules, servedTimestamp } from './served-modules.js';
import { collectCheckedUrls, collectRerunUrls, findMissedModules, getModuleEdits, nsRerunPlugin, sendCatchUp } from './update-gate.js';

describe('ServedModules', () => {
	it('records the stamps and the time each module was served', () => {
		const served = new ServedModules();
		served.record('/src/a.ts', 0, 100);
		served.record('/src/a.ts', 5, 200);
		expect(served.has('/src/a.ts', 0)).toBe(true);
		expect(served.has('/src/a.ts', 5)).toBe(true);
		expect(served.has('/src/a.ts', 6)).toBe(false);
		expect([...served.servedAt()]).toEqual([['/src/a.ts', 200]]);
	});

	it('reads the t stamp of a requested URL', () => {
		expect(servedTimestamp('/src/a.ts?import&t=1795060101009')).toBe(1795060101009);
		expect(servedTimestamp('/src/a.ts?t=12&lang.css')).toBe(12);
		expect(servedTimestamp('/src/a.ts')).toBe(0);
	});
});

type Node = { id: string | null; url: string; file: string; type: string; lastHMRTimestamp: number; importedModules: Set<Node>; importers: Set<Node> };
const node = (url: string, opts: Partial<Node> = {}): Node => ({ id: url, url, file: `/app${url}`, type: 'js', lastHMRTimestamp: 0, importedModules: new Set(), importers: new Set(), ...opts });
const graphOf = (...nodes: Node[]) => ({ urlToModuleMap: new Map(nodes.map((n) => [n.url, n])) });

describe('collectCheckedUrls', () => {
	it('adds the component that compiles an accepted template', () => {
		const component = node('/src/home.component.ts');
		const template = node('/src/home.component.html', { file: '/app/src/home.component.html', importers: new Set([component]) });
		expect(collectCheckedUrls(graphOf(component, template), [], ['/src/home.component.html'])).toEqual(['/src/home.component.ts']);
		expect(collectCheckedUrls(graphOf(component, template), ['/src/main.ts'], ['/src/main.ts'])).toEqual(['/src/main.ts']);
	});

	it('never lists a template as re-running: the device does not import it', () => {
		const template = node('/src/home.component.html', { file: '/app/src/home.component.html', lastHMRTimestamp: 7 });
		const component = node('/src/home.component.ts', { lastHMRTimestamp: 7, importedModules: new Set([template]) });
		const main = node('/src/main.ts', { importedModules: new Set([component]) });
		expect(collectRerunUrls(graphOf(main, component, template), [{ type: 'js-update', acceptedPath: '/src/main.ts', timestamp: 7 }], new ServedModules()).sort()).toEqual(['/src/home.component.ts', '/src/main.ts']);
		expect(collectRerunUrls(graphOf(main, component, template), [{ type: 'js-update', acceptedPath: '/src/home.component.html', timestamp: 7 }])).toEqual([]);
	});
});

describe('findMissedModules', () => {
	it('finds served modules whose file was edited after they were served, by a save that never reached a device', () => {
		const served = new ServedModules();
		for (const url of ['/src/main.ts', '/src/a.ts', '/src/b.ts']) served.record(url, 0, 1000);
		served.record('/src/c.ts', 0, 3000);
		const graph = graphOf(node('/src/main.ts'), node('/src/a.ts'), node('/src/b.ts'), node('/src/c.ts'));
		const edits = new Map([
			['/src/a.ts', 2000],
			['/src/b.ts', 1500],
			['/src/c.ts', 2000],
		]);
		// 1500 reached a connected device; 2000 didn't; c was fetched after the 2000 edit.
		expect(findMissedModules(graph, served, new Set([1500]), edits)).toEqual(['/src/a.ts']);
	});

	it('ignores importers Vite re-stamped for an edit below them', () => {
		const served = new ServedModules();
		const home = node('/src/home.component.ts', { lastHMRTimestamp: 2000 });
		const routes = node('/src/app.routes.ts', { lastHMRTimestamp: 2000, importedModules: new Set([home]) });
		const main = node('/src/main.ts', { lastHMRTimestamp: 2000, importedModules: new Set([routes]) });
		served.record('/src/main.ts', 0, 1000);
		served.record('/src/app.routes.ts', 0, 1000);
		// Saved mid-boot, before the component was fetched: the device already has the new code.
		served.record('/src/home.component.ts', 0, 2500);
		expect(findMissedModules(graphOf(main, routes, home), served, new Set(), new Map([['/src/home.component.ts', 2000]]))).toEqual([]);
	});

	it('counts an edit of a template compiled into a served component, also through a self-import', () => {
		const served = new ServedModules();
		const template = node('/src/home.component.html');
		const home = node('/src/home.component.ts', { importedModules: new Set([template]) });
		home.importedModules.add(home);
		served.record('/src/home.component.ts', 0, 1000);
		expect(findMissedModules(graphOf(home, template), served, new Set(), new Map([['/src/home.component.html', 2000]]))).toEqual(['/src/home.component.ts']);
		expect(findMissedModules(graphOf(home, template), served, new Set([2000]), new Map([['/src/home.component.html', 2000]]))).toEqual([]);
	});

	it('ignores an edit of a lazy module the device has not fetched yet', () => {
		const served = new ServedModules();
		const lazy = node('/src/lazy.component.ts');
		const routes = node('/src/app.routes.ts', { importedModules: new Set([lazy]) });
		served.record('/src/app.routes.ts', 0, 1000);
		expect(findMissedModules(graphOf(routes, lazy), served, new Set(), new Map([['/src/lazy.component.ts', 2000]]))).toEqual([]);
	});

	it('finds nothing on a normal boot', () => {
		const served = new ServedModules();
		served.record('/src/main.ts', 0, 1000);
		expect(findMissedModules(graphOf(node('/src/main.ts')), served, new Set(), new Map())).toEqual([]);
	});
});

const VIEW = "import { util } from './util.js';\nexport const view = [util];\nif (import.meta.hot) import.meta.hot.accept();\n";

// main → one → child1; main → child2; child1 → child2; main → three → four.
describe('compile gate and catch-up on a real Vite server', () => {
	let root: string;
	let server: ViteDevServer;
	let sent: any[];

	async function start(options: { gatedFlavor?: boolean | 'object'; boundary?: boolean; selfAccepting?: boolean } = {}) {
		const files: Record<string, string> = {
			'package.json': JSON.stringify({ main: 'main.js' }),
			'fw.js': 'export function dispose() {}\nexport function settled() {}\n',
			'main.js': options.selfAccepting ? "import { one } from './one.js';\nimport { child2 } from './child2.js';\nimport { three } from './three.js';\nimport { view } from './view.js';\nexport const app = [one, child2, three, view];\n" : "import { one } from './one.js';\nimport { child2 } from './child2.js';\nimport { three } from './three.js';\nexport const app = [one, child2, three];\n",
			// Like an SFC: accepts itself, so an edit of its util stops at it.
			...(options.selfAccepting ? { 'view.js': VIEW, 'util.js': "export const util = 'u1';\n" } : {}),
			'one.js': "import { child1 } from './child1.js';\nexport const one = [child1];\n",
			'child1.js': "import { child2 } from './child2.js';\nexport const child1 = ['a', child2];\n",
			'child2.js': "export const child2 = 'b';\n",
			'three.js': "import { four } from './four.js';\nexport const three = [four];\n",
			'four.js': "export const four = 'd';\n",
		};
		root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-update-gate-')));
		for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(root, name), content);
		const flavor = 'update-gate-spec';
		registerFrameworkFlavor({
			flavor,
			server: {
				flavor,
				...(options.boundary === false ? {} : { entryBoundary: { module: './fw.js', dispose: 'dispose', settled: 'settled' } }),
				verifyTransform: ({ code }) => (code.includes('UNCOMPILABLE') ? Object.assign(new Error('could not compile'), { plugin: 'spec-verifier' }) : undefined),
				gatedEvents: ['spec:in-place'],
			},
		});
		sent = [];
		const capture: Plugin = {
			name: 'capture-sends',
			configureServer(s) {
				// A connected device: errors aren't sent to an empty channel.
				Object.defineProperty(s.ws, 'clients', { value: new Set([{}]), configurable: true });
				const original = s.ws.send.bind(s.ws) as (...args: any[]) => void;
				(s.ws as any).send = (...args: any[]) => {
					sent.push(typeof args[0] === 'string' ? { type: 'custom', event: args[0], data: args[1] } : args[0]);
					return original(...args);
				};
			},
		};
		// Like Analog: an in-place event sent from the hook, before Vite's own update.
		const inPlace: Plugin = {
			name: 'spec-in-place',
			handleHotUpdate(ctx) {
				if (options.gatedFlavor === 'object') ctx.server.ws.send({ type: 'custom', event: 'spec:in-place', data: { file: ctx.file } });
				else if (options.gatedFlavor) ctx.server.ws.send('spec:in-place', { file: ctx.file });
			},
		};
		server = await createServer({
			root,
			configFile: false,
			logLevel: 'silent',
			appType: 'custom',
			optimizeDeps: { noDiscovery: true, include: [] },
			server: { middlewareMode: true, ws: false, watch: null },
			plugins: [capture, inPlace, nsRerunPlugin({ flavor }), nsEntryBoundaryPlugin({ flavor })!],
		});
		for (const name of Object.keys(files).filter((n) => n.endsWith('.js') && n !== 'fw.js')) {
			await server.environments.client.transformRequest(`/${name}`);
		}
	}

	async function edit(name: string, content: string) {
		sent.length = 0;
		const file = path.join(root, name);
		fs.writeFileSync(file, content);
		server.watcher.emit('change', file);
		await expect.poll(() => sent.some((p) => p?.type === 'update' || p?.type === 'error'), { timeout: 5000 }).toBe(true);
		await new Promise((r) => setTimeout(r, 50));
		return sent.map((p) => (p.type === 'custom' ? p.event : p.type));
	}

	afterEach(async () => {
		await server?.close();
		fs.rmSync(root, { recursive: true, force: true });
		vi.mocked(requestAppRestart).mockClear();
	});

	it('(e1) a module that fails to transform sends only Vite’s error payload; the fix sends the update re-running what changed since', async () => {
		await start();
		// Plain JS gets no parse beyond the import lexer; a failed import resolution is what throws here.
		expect(await edit('child1.js', "import { child2 } from './child2.js';\nimport { gone } from './gone.js';\nexport const child1 = ['a', child2, gone];\n")).toEqual(['error']);
		const error = sent[0];
		expect(error.err.id).toBe(path.join(root, 'child1.js'));
		expect(error.err.message).toMatch(/gone\.js/);
		expect(error.err.loc).toEqual(expect.objectContaining({ line: 2 }));

		expect(await edit('child1.js', "import { child2 } from './child2.js';\nexport const child1 = ['fixed', child2];\n")).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
		expect(sent[1].updates).toEqual([expect.objectContaining({ path: '/main.js' })]);
		expect([...sent[0].data.rerun].sort()).toEqual(['/child1.js', '/main.js', '/one.js']);
	});

	it('sends no error while no device is connected: Vite would replay it on the next connection, possibly stale', async () => {
		await start();
		(server.ws as any).clients.clear();
		const file = path.join(root, 'child1.js');
		fs.writeFileSync(file, "import { gone } from './gone.js';\nexport const child1 = [gone];\n");
		server.watcher.emit('change', file);
		await expect.poll(() => (server.environments.client.moduleGraph.getModuleById(file)?.lastHMRTimestamp ?? 0) > 0).toBe(true);
		await new Promise((r) => setTimeout(r, 300));
		expect(sent).toEqual([]);
	});

	it('announces every edit since the last update that passed, failed saves included', async () => {
		await start();
		expect(await edit('child1.js', "import { child2 } from './child2.js';\nimport { gone } from './gone.js';\nexport const child1 = ['a', child2, gone];\n")).toEqual(['error']);
		expect(await edit('four.js', "export const four = 'e';\n")).toEqual(['error']);
		expect(await edit('child1.js', "import { child2 } from './child2.js';\nexport const child1 = ['fixed', child2];\n")).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
		expect([...sent[0].data.changed].sort()).toEqual(['/child1.js', '/four.js']);
		expect([...sent[0].data.rerun].sort()).toEqual(['/child1.js', '/four.js', '/main.js', '/one.js', '/three.js']);
	});

	it('reboots through the entry for the first update that passes after withheld ones, covering their edits', async () => {
		await start({ selfAccepting: true });
		expect(await edit('view.js', VIEW.replace('[util]', "[util, 'UNCOMPILABLE']"))).toEqual(['error']);
		// Its update stops at the broken view, so it is withheld too.
		expect(await edit('util.js', "export const util = 'u2';\n")).toEqual(['error']);
		expect(await edit('view.js', VIEW)).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
		expect(sent[1].updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/main.js', acceptedPath: '/main.js', timestamp: sent[0].data.timestamp })]);
		expect([...sent[0].data.changed].sort()).toEqual(['/util.js', '/view.js']);
		expect([...sent[0].data.rerun].sort()).toEqual(['/main.js', '/util.js', '/view.js']);
		// The edited modules carry the reboot's stamp, so the entry imports new instances.
		for (const url of ['/main.js', '/view.js', '/util.js']) expect(server.environments.client.moduleGraph.urlToModuleMap.get(url)!.lastHMRTimestamp).toBe(sent[0].data.timestamp);

		// Back to normal updates once nothing is withheld.
		expect(await edit('util.js', "export const util = 'u3';\n")).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
		expect(sent[1].updates).toEqual([expect.objectContaining({ path: '/view.js', acceptedPath: '/view.js' })]);
	});

	it('(F1) fails a deleted module while it is still imported, and skips it once its importers drop it', async () => {
		await start();
		const removed = path.join(root, 'child1.js');
		sent.length = 0;
		fs.rmSync(removed);
		server.watcher.emit('unlink', removed);
		await expect.poll(() => sent.map((p) => (p.type === 'custom' ? p.event : p.type)), { timeout: 5000 }).toEqual(['error']);
		expect(sent[0].err.message).toMatch(/child1\.js/);
		// The walk still reaches child1 through one.js's edge from before this save.
		const dropped = await edit('one.js', "export const one = ['no child'];\n");
		expect(dropped).not.toContain('error');
		expect(dropped).toContain('update');
		expect(await edit('four.js', "export const four = 'e';\n")).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
	});

	it('drops gated in-place events of the update it replaces with a reboot', async () => {
		await start({ selfAccepting: true, gatedFlavor: true });
		expect(await edit('view.js', VIEW.replace('[util]', "[util, 'UNCOMPILABLE']"))).toEqual(['error']);
		expect(await edit('view.js', VIEW)).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
		await new Promise((r) => setTimeout(r, 250));
		expect(sent.map((p) => (p.type === 'custom' ? p.event : p.type))).toEqual([NS_UPDATE_RERUN_EVENT, 'update']);
	});

	it('restarts the app instead when the flavor has no entry boundary', async () => {
		await start({ selfAccepting: true, boundary: false });
		expect(await edit('view.js', VIEW.replace('[util]', "[util, 'UNCOMPILABLE']"))).toEqual(['error']);
		expect(await edit('util.js', "export const util = 'u2';\n")).toEqual(['error']);
		sent.length = 0;
		const file = path.join(root, 'view.js');
		fs.writeFileSync(file, VIEW);
		server.watcher.emit('change', file);
		await expect.poll(() => vi.mocked(requestAppRestart).mock.calls.length, { timeout: 5000 }).toBe(1);
		expect(vi.mocked(requestAppRestart).mock.calls[0][0]).toMatch(/^2 file\(s\) changed/);
		await new Promise((r) => setTimeout(r, 50));
		expect(sent).toEqual([]);
	});

	it.each([
		['string', true],
		['object', 'object'],
	] as const)('holds gated in-place events sent in %s form until the update passes, and drops them when it fails', async (_form, gatedFlavor) => {
		await start({ gatedFlavor });
		expect(await edit('child2.js', "export const child2 = 'c';\n")).toEqual(['spec:in-place', NS_UPDATE_RERUN_EVENT, 'update']);
		expect(await edit('child2.js', "export const child2 = 'UNCOMPILABLE';\n")).toEqual(['error']);
		expect(sent[0].err).toEqual(expect.objectContaining({ message: 'could not compile', plugin: 'spec-verifier' }));
	});

	it('catches a connecting device up with one entry reboot when it missed an update', async () => {
		await start();
		const served = new ServedModules();
		for (const url of ['/main.js', '/one.js', '/child1.js', '/child2.js', '/three.js', '/four.js']) served.record(url, 0, 1);
		// Edited while no device was connected: nothing was delivered.
		await edit('child1.js', "import { child2 } from './child2.js';\nexport const child1 = ['missed', child2];\n");
		const client = { send: vi.fn() };
		const graph = server.environments.client.moduleGraph as any;
		const strategy = (await import('../framework-flavors.js')).getFrameworkServerStrategy('update-gate-spec');
		const edits = getModuleEdits(server);
		expect(await sendCatchUp(server, client, { graph, served, delivered: new Set(), edits, strategy })).toBe('reboot');
		const [rerunEvent, rerunData] = client.send.mock.calls[0];
		expect(rerunEvent).toBe(NS_UPDATE_RERUN_EVENT);
		expect(rerunData.changed).toEqual(['/child1.js']);
		expect([...rerunData.rerun].sort()).toEqual(['/child1.js', '/main.js', '/one.js']);
		expect(client.send.mock.calls[1][0]).toEqual({ type: 'update', updates: [expect.objectContaining({ type: 'js-update', path: '/main.js', acceptedPath: '/main.js' })] });

		// Once the device has loaded the new instances, nothing is missed.
		for (const url of rerunData.rerun) served.record(url, graph.urlToModuleMap.get(url).lastHMRTimestamp);
		expect(await sendCatchUp(server, { send: vi.fn() }, { graph, served, delivered: new Set(), edits, strategy })).toBe('none');
	});

	it('requests a restart instead when the flavor has no entry boundary', async () => {
		await start({ boundary: false });
		const served = new ServedModules();
		served.record('/child2.js', 0, 1);
		const file = path.join(root, 'child2.js');
		fs.writeFileSync(file, "export const child2 = 'missed';\n");
		server.watcher.emit('change', file);
		await expect.poll(() => (server.environments.client.moduleGraph.getModuleById(file)?.lastHMRTimestamp ?? 0) > 0).toBe(true);
		const strategy = (await import('../framework-flavors.js')).getFrameworkServerStrategy('update-gate-spec');
		expect(await sendCatchUp(server, { send: vi.fn() }, { graph: server.environments.client.moduleGraph as any, served, delivered: new Set(), edits: getModuleEdits(server), strategy })).toBe('restart');
		expect(requestAppRestart).toHaveBeenCalledOnce();
	});
});
