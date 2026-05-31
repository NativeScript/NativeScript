import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleNsHotUpdate, type NsHotUpdateContext } from './websocket-hot-update.js';
import * as serverOriginModule from './server-origin.js';

let originSpy: ReturnType<typeof vi.spyOn>;

type FakeClient = { readyState: number; send: ReturnType<typeof vi.fn> };

/**
 * Build a fully-mocked {@link NsHotUpdateContext}. Every injected dependency is
 * a no-op spy with a sensible default so a single test can override just the
 * field it cares about. The post-broadcast graph/framework work is heavily
 * guarded by try/catch in the handler, so these stubs are enough to drive the
 * synchronous "pending broadcast" path without throwing.
 */
function makeDeps(overrides: Partial<NsHotUpdateContext> = {}) {
	const moduleGraph = {
		version: 1,
		size: 0,
		normalizeGraphId: (id: string) => id,
		get: () => undefined,
		getModuleById: () => undefined,
		getModulesByFile: () => [],
		upsert: vi.fn(),
		update: vi.fn(),
		emitDelta: vi.fn(),
		emitFullGraph: vi.fn(),
		invalidateMany: vi.fn(),
		invalidateModule: vi.fn(),
	};
	const base: NsHotUpdateContext = {
		wss: { clients: new Set<FakeClient>() } as any,
		moduleGraph: moduleGraph as any,
		strategy: { flavor: 'typescript' } as any,
		verbose: false,
		sfcFileMap: new Map(),
		depFileMap: new Map(),
		sharedTransformRequest: vi.fn(async () => ({ code: '' })) as any,
		processSfcCode: (code: string) => code,
		collectImportDependencies: () => new Set<string>(),
		rewriteImports: (code: string) => code,
		cleanCode: (code: string) => code,
		getHmrSourceRootsCached: () => ['/app/src'],
		getBootstrapEntryRelPath: () => '/app/src/main.ts',
		isSocketClientOpen: (client: any) => !!client && client.readyState === 1,
		getHmrSocketRole: () => 'device',
		shouldRemapImport: () => false,
		rememberAngularReloadSuppression: vi.fn(),
		getRootComponentIdentity: () => null,
		getGraphInitialPopulationPromise: vi.fn(() => null),
		appRootDir: 'app/src',
		appVirtualWithSlash: '/__NSDOC__/',
	};
	return { ...base, ...overrides };
}

function makeCtx(file: string, serverOverrides: Record<string, unknown> = {}) {
	return {
		file,
		server: {
			config: { root: '/proj', server: {} },
			transformRequest: vi.fn(async () => ({ code: '' })),
			...serverOverrides,
		},
		modules: [],
		read: async () => '',
		timestamp: Date.now(),
	} as any;
}

describe('handleNsHotUpdate', () => {
	// handleNsHotUpdate imports getServerOrigin directly; spy via the module (the
	// proven ESM seam — see server-origin-platform.spec.ts) to assert the
	// origin-baking path runs (or is skipped) and to bake a deterministic origin.
	beforeEach(() => {
		originSpy = vi.spyOn(serverOriginModule, 'getServerOrigin').mockReturnValue('http://test:5173');
	});
	afterEach(() => {
		originSpy.mockRestore();
	});

	it('is an async function', () => {
		expect(typeof handleNsHotUpdate).toBe('function');
		const deps = makeDeps();
		const result = handleNsHotUpdate(makeCtx('/app/src/foo.spec.ts'), deps);
		expect(typeof (result as Promise<unknown>).then).toBe('function');
	});

	it('returns early without broadcasting when wss is null', async () => {
		const deps = makeDeps({ wss: null });
		await handleNsHotUpdate(makeCtx('/app/src/foo.ts'), deps);
		expect(originSpy).not.toHaveBeenCalled();
	});

	it('ignores runtime-graph-excluded paths (e.g. *.spec.*) before any broadcast', async () => {
		const deps = makeDeps();
		await handleNsHotUpdate(makeCtx('/app/src/foo.spec.ts'), deps);
		expect(originSpy).not.toHaveBeenCalled();
	});

	it('ignores changes outside the HMR source scope', async () => {
		const deps = makeDeps({ getHmrSourceRootsCached: () => ['/app/src'] });
		await handleNsHotUpdate(makeCtx('/somewhere/else/foo.ts'), deps);
		expect(originSpy).not.toHaveBeenCalled();
	});

	it('logs the ignored-change reason when verbose and out of scope', async () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
		try {
			const deps = makeDeps({ verbose: true, getHmrSourceRootsCached: () => ['/app/src'] });
			await handleNsHotUpdate(makeCtx('/somewhere/else/foo.ts'), deps);
			expect(spy.mock.calls.some((c) => String(c[0]).includes('outside HMR source scope'))).toBe(true);
		} finally {
			spy.mockRestore();
		}
	});

	it('broadcasts an ns:hmr-pending message to open clients for in-scope changes', async () => {
		const openClient: FakeClient = { readyState: 1, send: vi.fn() };
		const closedClient: FakeClient = { readyState: 3, send: vi.fn() };
		const wss = { clients: new Set<FakeClient>([openClient, closedClient]) } as any;
		const populationPromise = vi.fn(() => null);
		const deps = makeDeps({ wss, getGraphInitialPopulationPromise: populationPromise });

		// The pending broadcast runs synchronously before the first `await`, so
		// the spies are populated immediately; we still settle the promise (the
		// deep graph/framework work is guarded and irrelevant to this contract).
		const pending = handleNsHotUpdate(makeCtx('/app/src/foo.ts'), deps);

		expect(populationPromise).toHaveBeenCalled();
		expect(originSpy).toHaveBeenCalledTimes(1);
		expect(openClient.send).toHaveBeenCalledTimes(1);
		expect(closedClient.send).not.toHaveBeenCalled();
		const payload = String(openClient.send.mock.calls[0][0]);
		expect(JSON.parse(payload)).toMatchObject({ type: 'ns:hmr-pending', origin: 'http://test:5173' });

		await pending.catch(() => {});
	});

	it('delegates to strategy.handleHotUpdate when the flavor owns the hook, skipping the inline path (P2-A3 seam)', async () => {
		const modules = [{ id: 'mod' }] as any;
		const handleHotUpdate = vi.fn(async () => modules);
		const ctx = makeCtx('/app/src/foo.ts');
		const deps = makeDeps({ strategy: { flavor: 'typescript', handleHotUpdate } as any });

		const result = await handleNsHotUpdate(ctx, deps);

		// The hook owns the whole handler: it is invoked with the live ctx + deps,
		// its result is propagated, and the dispatcher's inline prologue never runs
		// (no origin bake / pending broadcast happens out here).
		expect(handleHotUpdate).toHaveBeenCalledTimes(1);
		expect(handleHotUpdate).toHaveBeenCalledWith(ctx, deps);
		expect(result).toBe(modules);
		expect(originSpy).not.toHaveBeenCalled();
	});
});
