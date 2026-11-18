import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import * as path from 'path';
import os from 'os';

// vueServerStrategy.handleHotUpdate owns `prologue + its tail`. Mock the shared
// prologue so the handler tests isolate the Vue tail; the prologue itself is
// covered by websocket-hot-update.spec.ts.
vi.mock('../../../server/websocket-hot-update.js', () => ({
	runHotUpdatePrologue: vi.fn(),
}));

import { purgeVueTransformCachesForHotUpdate, vueServerStrategy } from './strategy.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import type { FrameworkRegistryContext } from '../../../server/framework-strategy.js';

const sfcName = (rel: string) => `sfc-${createHash('md5').update(rel).digest('hex').slice(0, 8)}.mjs`;

describe('vueServerStrategy', () => {
	it('matches Vue modules', () => {
		expect(vueServerStrategy.flavor).toBe('vue');
		expect(vueServerStrategy.matchesFile('/src/App.vue')).toBe(true);
		expect(vueServerStrategy.matchesFile('/src/main.ts')).toBe(false);
	});

	it('builds and broadcasts an SFC registry from the .vue files on disk', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'vue-strategy-'));
		try {
			mkdirSync(path.join(tmpRoot, 'components'), { recursive: true });
			writeFileSync(path.join(tmpRoot, 'App.vue'), '<template></template>');
			writeFileSync(path.join(tmpRoot, 'components', 'Child.vue'), '<template></template>');

			const sfcFileMap = new Map<string, string>();
			const sent: any[] = [];
			const client = { OPEN: 1, readyState: 1, send: vi.fn((msg: string) => sent.push(JSON.parse(msg))) };
			const wss = { clients: new Set([client]) } as unknown as FrameworkRegistryContext['wss'];
			const server = { config: { root: tmpRoot }, transformRequest: vi.fn() } as unknown as FrameworkRegistryContext['server'];

			await vueServerStrategy.buildRegistry({ server, sfcFileMap, wss, verbose: false });

			expect(server.transformRequest).not.toHaveBeenCalled();
			expect(client.send).toHaveBeenCalledTimes(1);
			expect(sent[0].type).toBe('ns:vue-sfc-registry');
			expect(sent[0].entries.map((e: any) => e.path).sort()).toEqual(['/App.vue', '/components/Child.vue']);
			expect(sfcFileMap.get('/App.vue')).toBe(sfcName('/App.vue'));
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});

	it('adds nativescript-vue + vue to the import map (order preserved)', () => {
		expect(vueServerStrategy.importMapSpecifiers!()).toEqual(['nativescript-vue', 'vue']);
	});

	it('supplies no volatilePatterns', () => {
		expect(vueServerStrategy.volatilePatterns).toBeUndefined();
	});
});

describe('vueServerStrategy.handleHotUpdate', () => {
	beforeEach(() => {
		vi.mocked(runHotUpdatePrologue).mockReset();
	});

	function makeDeps() {
		const client = { readyState: 1, OPEN: 1, send: vi.fn() };
		const deps = {
			strategy: vueServerStrategy,
			verbose: false,
			wss: { clients: new Set([client]) },
			moduleGraph: { version: 7, upsert: vi.fn() },
			sfcFileMap: new Map<string, string>(),
			isSocketClientOpen: (c: any) => !!c && c.readyState === 1,
		} as any;
		return { deps, client };
	}

	function makeServer() {
		return { config: { root: '/proj' }, transformRequest: vi.fn() } as any;
	}

	function prologueState(updateRel: string, emitSummary = vi.fn()) {
		return { root: '/proj', updateRel, metrics: { tAfterFramework: 0 } as any, emitSummary } as any;
	}

	it('broadcasts a metadata-only registry update for a changed .vue SFC', async () => {
		const emitSummary = vi.fn();
		vi.mocked(runHotUpdatePrologue).mockResolvedValue(prologueState('/app/Home.vue', emitSummary));

		const { deps, client } = makeDeps();
		const ctx = { file: '/proj/app/Home.vue', server: makeServer() } as any;
		const result = await vueServerStrategy.handleHotUpdate!(ctx, deps);

		expect(runHotUpdatePrologue).toHaveBeenCalledWith(ctx, deps);
		expect(deps.sfcFileMap.get('/app/Home.vue')).toBe(sfcName('/app/Home.vue'));
		expect(client.send).toHaveBeenCalledTimes(1);
		expect(JSON.parse(client.send.mock.calls[0][0])).toMatchObject({
			type: 'ns:vue-sfc-registry-update',
			path: '/app/Home.vue',
			fileName: sfcName('/app/Home.vue'),
			version: 7,
		});
		expect(emitSummary).toHaveBeenCalledTimes(1);
		// An empty array makes Vite skip its own default HMR for the SFC.
		expect(result).toEqual([]);
	});

	it('ignores non-.vue files', async () => {
		const emitSummary = vi.fn();
		vi.mocked(runHotUpdatePrologue).mockResolvedValue(prologueState('/app/styles.ts', emitSummary));

		const { deps, client } = makeDeps();
		await vueServerStrategy.handleHotUpdate!({ file: '/proj/app/styles.ts', server: makeServer() } as any, deps);

		expect(client.send).not.toHaveBeenCalled();
		expect(emitSummary).not.toHaveBeenCalled();
	});

	it('is a no-op when the prologue fully handled the change (null)', async () => {
		vi.mocked(runHotUpdatePrologue).mockResolvedValue(null as any);
		const { deps, client } = makeDeps();
		await vueServerStrategy.handleHotUpdate!({ file: '/proj/app/Home.vue', server: makeServer() } as any, deps);

		expect(client.send).not.toHaveBeenCalled();
	});
});

describe('purgeVueTransformCachesForHotUpdate', () => {
	function makeGraph(importers: Array<{ id: string; importers?: any[] }> = []) {
		const rootModule = { id: '/src/test2.ts', file: '/proj/src/test2.ts', importers };
		const moduleGraph = {
			getModulesByFile: vi.fn(() => new Set([rootModule])),
			onFileChange: vi.fn(),
			invalidateModule: vi.fn(),
		};
		return { rootModule, moduleGraph };
	}

	it('invalidates the changed .ts dep and its SFC importer in the Vite module graph', () => {
		const homeImporter = { id: '/src/components/Home.vue', importers: [] };
		const { rootModule, moduleGraph } = makeGraph([homeImporter]);

		purgeVueTransformCachesForHotUpdate({
			file: '/proj/src/test2.ts',
			server: { config: { root: '/proj' }, moduleGraph },
		});

		expect(moduleGraph.onFileChange).toHaveBeenCalledWith('/proj/src/test2.ts');
		expect(moduleGraph.invalidateModule).toHaveBeenCalledWith(rootModule);
		expect(moduleGraph.invalidateModule).toHaveBeenCalledWith(homeImporter);
	});

	it('excludes node_modules importers from the transitive invalidation', () => {
		const vendorImporter = { id: '/proj/node_modules/some-lib/index.js', importers: [] };
		const { moduleGraph } = makeGraph([vendorImporter]);

		purgeVueTransformCachesForHotUpdate({
			file: '/proj/src/test2.ts',
			server: { config: { root: '/proj' }, moduleGraph },
		});

		expect(moduleGraph.invalidateModule).not.toHaveBeenCalledWith(vendorImporter);
	});
});
