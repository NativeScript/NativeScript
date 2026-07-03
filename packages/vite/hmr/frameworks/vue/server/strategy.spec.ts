import { beforeEach, describe, it, expect, vi } from 'vitest';
import { createHash } from 'crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import * as path from 'path';
import os from 'os';

vi.mock('../../../helpers/vendor-rewrite.js', () => {
	return {
		rewriteVendorVueSpec: vi.fn((code: string, origin: string, version: number) => `rewritten(${version})::${code}`),
	};
});

// vueServerStrategy.handleHotUpdate owns `prologue + its tail`. Mock the shared
// prologue so the handler tests isolate the migrated Vue SFC tail without the
// full HMR pipeline; the prologue itself is covered by websocket-hot-update.spec.ts.
vi.mock('../../../server/websocket-hot-update.js', () => ({
	runHotUpdatePrologue: vi.fn(),
}));

import { rewriteVendorVueSpec } from '../../../helpers/vendor-rewrite.js';
import { purgeVueTransformCachesForHotUpdate, vueServerStrategy } from './strategy.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import { getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkRouteContext } from '../../../server/framework-strategy.js';

type ProcessHelpers = NonNullable<FrameworkProcessFileContext['helpers']>;
type RegistryHelpers = NonNullable<FrameworkRegistryContext['helpers']>;

const mockedRewriteVendor = vi.mocked(rewriteVendorVueSpec);

const APP_ENTRY = getProjectAppVirtualPath('App.vue');
const APP_ENTRY_WITH_QUERY = `${APP_ENTRY}?vue&type=script&lang.ts`;
const CHILD_ENTRY = getProjectAppVirtualPath('Child.vue');

describe('vueServerStrategy', () => {
	it('matches and cleans Vue modules', () => {
		expect(vueServerStrategy.flavor).toBe('vue');
		expect(vueServerStrategy.matchesFile(APP_ENTRY)).toBe(true);
		expect(vueServerStrategy.matchesFile(APP_ENTRY_WITH_QUERY)).toBe(true);

		const dirty = `
import "./App.vue?type=style&lang.css";
import helper from "__vite-plugin-vue_export-helper";
import virtual from "/@id/__generated";
const keep = 1;
`;
		const cleaned = vueServerStrategy.preClean(dirty);
		expect(cleaned).not.toContain('type=style');
		expect(cleaned).not.toContain('__vite-plugin-vue_export_helper');
		expect(cleaned).not.toContain('/@id/');
		expect(cleaned).toContain('const keep = 1');
	});

	it('rewrites framework imports and strips HMR noise', () => {
		const raw = `
import { createApp } from "vue";
import { something } from "nativescript-vue/runtime";
if (__VUE_HMR_RUNTIME__) {
  __VUE_HMR_RUNTIME__.reload();
} else {
  __VUE_HMR_RUNTIME__.rerender();
}
const __hmrId = "foo";
export default {};
`;
		const rewritten = vueServerStrategy.rewriteFrameworkImports(raw);
		expect(rewritten).toContain('/@nativescript/vendor.mjs');

		const post = vueServerStrategy.postClean(rewritten);
		expect(post).not.toContain('__VUE_HMR_RUNTIME__.reload');
		expect(post).not.toContain('__VUE_HMR_RUNTIME__.rerender');
		expect(post).not.toMatch(/__hmrId/);
	});

	it('canonicalizes SFC imports (strips versioned segments, keeps URLs stable)', () => {
		const code = `
import View from "/ns/sfc/components/View.vue";
const lazy = import("http://localhost:5173/ns/sfc/42/components/Other.vue");
`;
		const canonical = vueServerStrategy.canonicalizeFrameworkImports!(code, 'http://localhost:5173');
		// Already-canonical imports pass through unchanged; versioned
		// forms collapse — SFC module identity IS the URL, and freshness is
		// eviction-driven (a versioned URL would mint a second module realm).
		expect(canonical).toContain('from "/ns/sfc/components/View.vue"');
		expect(canonical).toContain('import("/ns/sfc/components/Other.vue")');
		expect(canonical).not.toMatch(/\/ns\/sfc\/\d+\//);
	});

	it('delegates vendor rewrite to helper', () => {
		mockedRewriteVendor.mockClear();
		const input = "import { createApp } from 'vue';";
		expect(vueServerStrategy.rewriteVendorSpec).toBeDefined();
		const result = vueServerStrategy.rewriteVendorSpec!(input, 'http://localhost:5173', 7);
		expect(mockedRewriteVendor).toHaveBeenCalledWith(input, 'http://localhost:5173', 7);
		expect(result).toBe(`rewritten(7)::${input}`);
	});

	it('registers nested Vue dependencies during processFile', async () => {
		const server = {
			transformRequest: vi.fn(async () => ({ code: 'export default {};' })),
		} as unknown as FrameworkProcessFileContext['server'];

		const basePath = APP_ENTRY;
		const childPath = CHILD_ENTRY;
		const sfcFileMap = new Map<string, string>([[basePath, 'sfc-root.mjs']]);
		const depFileMap = new Map<string, string>();
		const visitedPaths = new Set<string>();
		const helpers: ProcessHelpers = {
			cleanCode: (code) => code,
			collectImportDependencies: (_: string, importer: string): Set<string> => (importer === basePath ? new Set<string>([childPath]) : new Set<string>()),
			isCoreGlobalsReference: () => false,
			isNativeScriptCoreModule: () => false,
			isNativeScriptPluginModule: () => false,
			resolveVendorFromCandidate: () => null,
			createHash: (value) => createHash('md5').update(value).digest('hex'),
		};

		await vueServerStrategy.processFile({
			filePath: basePath,
			server,
			sfcFileMap,
			depFileMap,
			visitedPaths,
			wss: {} as any,
			verbose: false,
			helpers,
		});

		const expectedHash = createHash('md5').update(childPath).digest('hex').slice(0, 8);
		expect(sfcFileMap.get(childPath)).toBe(`sfc-${expectedHash}.mjs`);
		expect(server.transformRequest).toHaveBeenCalledWith(childPath);
		expect(visitedPaths.has(childPath)).toBe(true);
	});

	it('builds and broadcasts an SFC registry', async () => {
		const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'vue-strategy-'));
		try {
			const appPath = path.join(tmpRoot, 'App.vue');
			const childDir = path.join(tmpRoot, 'components');
			mkdirSync(childDir, { recursive: true });
			const childPath = path.join(childDir, 'Child.vue');
			writeFileSync(appPath, '<template></template>');
			writeFileSync(childPath, '<template></template>');

			const sfcFileMap = new Map<string, string>();
			const depFileMap = new Map<string, string>();
			const sent: any[] = [];
			const client = {
				OPEN: 1,
				readyState: 1,
				send: vi.fn((msg: string) => sent.push(JSON.parse(msg))),
			};
			const wss = {
				clients: new Set([client]),
			} as unknown as FrameworkRegistryContext['wss'];

			const server = {
				config: { root: tmpRoot },
				transformRequest: vi.fn(async (id: string) => {
					if (id.endsWith('App.vue')) {
						return {
							code: 'import Child from "./components/Child.vue"; export default {};',
						};
					}
					if (id.endsWith('Child.vue')) {
						return { code: 'export default {};' };
					}
					return { code: '' };
				}),
			} as unknown as FrameworkRegistryContext['server'];

			const collectDeps = vi.fn((_: string, importer: string): Set<string> => (importer.endsWith('App.vue') ? new Set<string>(['/components/Child.vue']) : new Set<string>()));

			const helpers: RegistryHelpers = {
				cleanCode: (code) => code,
				collectImportDependencies: collectDeps,
				isCoreGlobalsReference: () => false,
				isNativeScriptCoreModule: () => false,
				isNativeScriptPluginModule: () => false,
				resolveVendorFromCandidate: () => null,
				createHash: (value) => createHash('md5').update(value).digest('hex'),
				processSfcCode: vi.fn((code: string) => code),
				rewriteImports: vi.fn((_code, _importerPath, _sfcFileMap, _depFileMap, _projectRoot, _verbose, _outputDirOverrideRel) => 'rewritten'),
			};

			await vueServerStrategy.buildRegistry({
				server,
				sfcFileMap,
				depFileMap,
				wss,
				verbose: false,
				helpers,
			});

			expect(server.transformRequest).toHaveBeenCalledWith('/App.vue');
			expect(server.transformRequest).toHaveBeenCalledWith('/components/Child.vue');
			expect(helpers.processSfcCode).toHaveBeenCalled();
			expect(helpers.rewriteImports).toHaveBeenCalled();
			expect(client.send).toHaveBeenCalledTimes(1);

			const payload = sent[0];
			expect(payload.type).toBe('ns:vue-sfc-registry');
			expect(Array.isArray(payload.entries)).toBe(true);
			expect(payload.entries.length).toBeGreaterThanOrEqual(1);

			const expectedAppHash = createHash('md5').update('/App.vue').digest('hex').slice(0, 8);
			expect(sfcFileMap.get('/App.vue')).toBe(`sfc-${expectedAppHash}.mjs`);
		} finally {
			rmSync(tmpRoot, { recursive: true, force: true });
		}
	});

	// ── Vue's dev HTTP surface + device config ────────────────────────────
	it('registerRoutes mounts the three Vue SFC endpoints', () => {
		const handlers: Array<(...a: any[]) => unknown> = [];
		const server = { middlewares: { use: (fn: any) => handlers.push(fn) } } as unknown as FrameworkRouteContext['server'];

		expect(typeof vueServerStrategy.registerRoutes).toBe('function');
		vueServerStrategy.registerRoutes!({
			server,
			wss: null,
			verbose: false,
			appVirtualWithSlash: '/app/',
			sfcFileMap: new Map(),
			depFileMap: new Map(),
			getGraphVersion: () => 0,
			getStrategy: () => vueServerStrategy,
		});

		// registerSfcHandlers mounts exactly /ns/sfc, /ns/sfc-meta, /ns/asm.
		expect(handlers).toHaveLength(3);
	});

	it('importMapEntries pins nativescript-vue + vue to the vendor bundle (order preserved)', () => {
		const entries = vueServerStrategy.importMapEntries!('http://localhost:5173');
		expect(entries).toEqual({ 'nativescript-vue': 'ns-vendor://nativescript-vue', vue: 'ns-vendor://vue' });
		// Insertion order must stay stable so the served import-map JSON is
		// byte-identical.
		expect(Object.keys(entries)).toEqual(['nativescript-vue', 'vue']);
	});

	it('supplies no volatilePatterns — SFC freshness is eviction-driven', () => {
		expect(vueServerStrategy.volatilePatterns).toBeUndefined();
	});
});

describe('vueServerStrategy.handleHotUpdate', () => {
	beforeEach(() => {
		vi.mocked(runHotUpdatePrologue).mockReset();
	});

	function makeDeps() {
		const client = { readyState: 1, OPEN: 1, send: vi.fn() };
		const moduleGraph = { version: 7, upsert: vi.fn() };
		const deps = {
			strategy: vueServerStrategy,
			verbose: false,
			wss: { clients: new Set([client]) },
			moduleGraph,
			sfcFileMap: new Map<string, string>(),
			depFileMap: new Map<string, string>(),
			isSocketClientOpen: (c: any) => !!c && c.readyState === 1,
			shouldRemapImport: () => false,
		} as any;
		return { deps, client, moduleGraph };
	}

	function makeServer() {
		return {
			config: { root: '/proj' },
			transformRequest: vi.fn(async () => ({ code: 'const x = 1; export default {};' })),
		} as any;
	}

	it('re-transforms a changed .vue SFC, upserts the graph, and broadcasts a metadata-only registry update', async () => {
		const emitSummary = vi.fn();
		vi.mocked(runHotUpdatePrologue).mockResolvedValue({
			root: '/proj',
			updateRel: '/app/Home.vue',
			metrics: { tAfterFramework: 0 } as any,
			emitSummary,
		} as any);

		const { deps, client, moduleGraph } = makeDeps();
		const server = makeServer();
		const ctx = { file: '/proj/app/Home.vue', server } as any;

		const result = await vueServerStrategy.handleHotUpdate!(ctx, deps);

		expect(runHotUpdatePrologue).toHaveBeenCalledWith(ctx, deps);
		expect(server.transformRequest).toHaveBeenCalledWith('/app/Home.vue');
		expect(moduleGraph.upsert).toHaveBeenCalledTimes(1);
		expect(moduleGraph.upsert.mock.calls[0][0]).toBe('/app/Home.vue');

		// The SFC registers itself in the file map under the deterministic md5 name.
		const expectedFileName = `sfc-${createHash('md5').update('/app/Home.vue').digest('hex').slice(0, 8)}.mjs`;
		expect(deps.sfcFileMap.get('/app/Home.vue')).toBe(expectedFileName);

		// HTTP-only mode: exactly one metadata-only registry-update frame, no code push.
		expect(client.send).toHaveBeenCalledTimes(1);
		const payload = JSON.parse(client.send.mock.calls[0][0]);
		expect(payload).toMatchObject({
			type: 'ns:vue-sfc-registry-update',
			path: '/app/Home.vue',
			fileName: expectedFileName,
			version: 7,
		});

		expect(emitSummary).toHaveBeenCalledTimes(1);
		// Returns an empty array so Vite skips its own default HMR for the SFC.
		expect(result).toEqual([]);
	});

	it('ignores non-.vue files (returns before transforming, broadcasting, or emitting a summary)', async () => {
		const emitSummary = vi.fn();
		vi.mocked(runHotUpdatePrologue).mockResolvedValue({
			root: '/proj',
			updateRel: '/app/styles.ts',
			metrics: { tAfterFramework: 0 } as any,
			emitSummary,
		} as any);

		const { deps, client, moduleGraph } = makeDeps();
		const server = makeServer();
		await vueServerStrategy.handleHotUpdate!({ file: '/proj/app/styles.ts', server } as any, deps);

		expect(server.transformRequest).not.toHaveBeenCalled();
		expect(moduleGraph.upsert).not.toHaveBeenCalled();
		expect(client.send).not.toHaveBeenCalled();
		expect(emitSummary).not.toHaveBeenCalled();
	});

	it('is a no-op when the prologue fully handled the change (null)', async () => {
		vi.mocked(runHotUpdatePrologue).mockResolvedValue(null as any);
		const { deps, client, moduleGraph } = makeDeps();
		const server = makeServer();
		await vueServerStrategy.handleHotUpdate!({ file: '/proj/app/Home.vue', server } as any, deps);

		expect(server.transformRequest).not.toHaveBeenCalled();
		expect(moduleGraph.upsert).not.toHaveBeenCalled();
		expect(client.send).not.toHaveBeenCalled();
	});
});

describe('purgeVueTransformCachesForHotUpdate', () => {
	function makeCacheMocks(importers: Array<{ id: string; importers?: any[] }> = []) {
		const rootModule = { id: '/src/test2.ts', file: '/proj/src/test2.ts', importers };
		const moduleGraph = {
			getModulesByFile: vi.fn(() => new Set([rootModule])),
			onFileChange: vi.fn(),
			invalidateModule: vi.fn(),
		};
		const sharedTransformRequest = {
			invalidateMany: vi.fn(),
			clear: vi.fn(),
		};
		return { rootModule, moduleGraph, sharedTransformRequest };
	}

	it('purges shared transform cache + Vite module graph for a changed .ts dep (the test2.ts repro)', () => {
		const homeImporter = { id: '/src/components/Home.vue', importers: [] };
		const { moduleGraph, sharedTransformRequest } = makeCacheMocks([homeImporter]);

		purgeVueTransformCachesForHotUpdate({
			file: '/proj/src/test2.ts',
			server: { config: { root: '/proj' }, moduleGraph },
			sharedTransformRequest,
		});

		expect(moduleGraph.onFileChange).toHaveBeenCalledWith('/proj/src/test2.ts');
		expect(moduleGraph.invalidateModule).toHaveBeenCalled();
		expect(sharedTransformRequest.invalidateMany).toHaveBeenCalledTimes(1);
		const urls = Array.from(sharedTransformRequest.invalidateMany.mock.calls[0][0] as Set<string>);
		// Changed file: project-relative, with and without the script extension
		// (the /ns/m handler probes multiple extension candidates per spec).
		expect(urls).toContain('/src/test2.ts');
		expect(urls).toContain('/src/test2');
		// Transitive importer (the SFC boundary) is purged too.
		expect(urls).toContain('/src/components/Home.vue');
		// Sledgehammer to catch extension-fallback cache keys targeted purge misses.
		expect(sharedTransformRequest.clear).toHaveBeenCalledTimes(1);
	});

	it('soft-fails without a sharedTransformRequest runner', () => {
		const { moduleGraph } = makeCacheMocks();
		expect(() =>
			purgeVueTransformCachesForHotUpdate({
				file: '/proj/src/test2.ts',
				server: { config: { root: '/proj' }, moduleGraph },
				sharedTransformRequest: null,
			}),
		).not.toThrow();
		expect(moduleGraph.onFileChange).toHaveBeenCalled();
	});

	it('excludes node_modules importers from the transitive purge', () => {
		const vendorImporter = { id: '/proj/node_modules/some-lib/index.js', importers: [] };
		const { moduleGraph, sharedTransformRequest } = makeCacheMocks([vendorImporter]);

		purgeVueTransformCachesForHotUpdate({
			file: '/proj/src/test2.ts',
			server: { config: { root: '/proj' }, moduleGraph },
			sharedTransformRequest,
		});

		const urls = Array.from(sharedTransformRequest.invalidateMany.mock.calls[0][0] as Set<string>);
		expect(urls.some((u) => u.includes('node_modules'))).toBe(false);
	});
});
