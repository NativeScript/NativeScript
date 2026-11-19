import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';
import { registerFrameworkFlavor } from '../framework-flavors.js';
import { NS_UPDATE_RERUN_EVENT } from '../shared/protocol.js';
import { createEntryBoundaryCode, nsEntryBoundaryPlugin } from './entry-boundary.js';
import { nsRerunPlugin } from './update-gate.js';

describe('createEntryBoundaryCode', () => {
	it('makes the entry self-accepting and wires the framework teardown and settle signal', () => {
		const code = createEntryBoundaryCode({ module: '@nativescript/angular', dispose: 'prepareHmrReboot', settled: 'whenHmrRebootSettled' });
		expect(code).toContain(`import { registerEntryBoundary as __nsRegisterEntryBoundary } from '/@vite/client';`);
		expect(code).toContain(`import * as __nsFramework from "@nativescript/angular";`);
		// Vite's import analysis only detects the literal form.
		expect(code).toContain('import.meta.hot.accept();');
		expect(code).toContain(`import.meta.hot.dispose(() => (typeof __nsFramework["prepareHmrReboot"] === 'function' ? __nsFramework["prepareHmrReboot"]() : undefined));`);
		expect(code).toContain(`__nsRegisterEntryBoundary(() => (typeof __nsFramework["whenHmrRebootSettled"] === 'function'`);
	});

	it('is only built for a flavor that declares an entry boundary', () => {
		expect(nsEntryBoundaryPlugin({ flavor: 'typescript' })).toBeUndefined();
	});
});

// main → one → child1; main → child2; child1 → child2; main → three → four.
describe('soft reboot through the entry boundary', () => {
	let root: string;
	let server: ViteDevServer;
	let sent: any[];

	const SELF_ACCEPT = 'if (import.meta.hot) import.meta.hot.accept();\n';

	async function start(options: { child1SelfAccepts: boolean }) {
		const files: Record<string, string> = {
			'package.json': JSON.stringify({ main: 'main.js' }),
			'fw.js': 'export function dispose() {}\nexport function settled() {}\n',
			'main.js': "import { one } from './one.js';\nimport { child2 } from './child2.js';\nimport { three } from './three.js';\nexport const app = [one, child2, three];\n",
			'one.js': "import { child1 } from './child1.js';\nexport const one = [child1];\n",
			'child1.js': `import { child2 } from './child2.js';\nexport const child1 = ['a', child2];\n${options.child1SelfAccepts ? SELF_ACCEPT : ''}`,
			'child2.js': "export const child2 = 'b';\n",
			'three.js': "import { four } from './four.js';\nexport const three = [four];\n",
			'four.js': "export const four = 'd';\n",
		};
		root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ns-entry-boundary-')));
		for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(root, name), content);
		registerFrameworkFlavor({ flavor: 'entry-boundary-spec', server: { flavor: 'entry-boundary-spec', entryBoundary: { module: './fw.js', dispose: 'dispose', settled: 'settled' } } });
		sent = [];
		// Registered before the plugins under test, so its wrapper sees what they send.
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
			optimizeDeps: { noDiscovery: true, include: [] },
			server: { middlewareMode: true, ws: false, watch: null },
			plugins: [capture, nsRerunPlugin(), nsEntryBoundaryPlugin({ flavor: 'entry-boundary-spec' })!],
		});
		for (const name of Object.keys(files).filter((n) => n.endsWith('.js'))) {
			await server.environments.client.transformRequest(`/${name}`);
		}
	}

	async function edit(name: string) {
		const file = path.join(root, name);
		fs.writeFileSync(file, fs.readFileSync(file, 'utf8') + '// edited\n');
		server.watcher.emit('change', file);
		await expect.poll(() => sent.some((p) => p?.type === 'update'), { timeout: 5000 }).toBe(true);
		const rerunAt = sent.findIndex((p) => p?.event === NS_UPDATE_RERUN_EVENT);
		const updateAt = sent.findIndex((p) => p?.type === 'update');
		expect(rerunAt).toBeGreaterThanOrEqual(0);
		expect(rerunAt).toBeLessThan(updateAt);
		return { meta: sent[rerunAt].data, update: sent[updateAt] };
	}

	afterEach(async () => {
		await server?.close();
		fs.rmSync(root, { recursive: true, force: true });
	});

	it('makes the app entry self-accepting', async () => {
		await start({ child1SelfAccepts: false });
		expect(server.environments.client.moduleGraph.getModuleById(path.join(root, 'main.js'))?.isSelfAccepting).toBe(true);
		expect(server.environments.client.moduleGraph.getModuleById(path.join(root, 'one.js'))?.isSelfAccepting).toBe(false);
	});

	it('(a) child1 edited: one entry update, re-running main, one and child1 only', async () => {
		await start({ child1SelfAccepts: false });
		const { meta, update } = await edit('child1.js');
		expect(update.updates).toEqual([expect.objectContaining({ type: 'js-update', path: '/main.js', acceptedPath: '/main.js' })]);
		expect(meta.timestamp).toBe(update.updates[0].timestamp);
		expect(meta.changed).toEqual(['/child1.js']);
		expect([...meta.rerun].sort()).toEqual(['/child1.js', '/main.js', '/one.js']);
	});

	it('(b) child2 edited with child1 self-accepting: two boundaries, re-running child2, child1, one and main', async () => {
		await start({ child1SelfAccepts: true });
		const { meta, update } = await edit('child2.js');
		expect(update.updates.map((u: any) => u.path).sort()).toEqual(['/child1.js', '/main.js']);
		expect(meta.changed).toEqual(['/child2.js']);
		expect([...meta.rerun].sort()).toEqual(['/child1.js', '/child2.js', '/main.js', '/one.js']);
	});

	it('child1 edited while self-accepting: only child1 re-runs, though Vite also stamps its importers', async () => {
		await start({ child1SelfAccepts: true });
		const { meta, update } = await edit('child1.js');
		expect(update.updates).toEqual([expect.objectContaining({ path: '/child1.js', acceptedPath: '/child1.js' })]);
		expect(server.environments.client.moduleGraph.getModuleById(path.join(root, 'main.js'))?.lastHMRTimestamp).toBe(meta.timestamp);
		expect(meta.rerun).toEqual(['/child1.js']);
	});
});
