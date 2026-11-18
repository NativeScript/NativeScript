import { beforeEach, describe, expect, it, vi } from 'vitest';

import { solidServerStrategy } from './strategy.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';

// solidServerStrategy.handleHotUpdate owns `prologue + its tail`. Mock the shared
// prologue so the handler tests isolate the migrated Solid tail without the full
// HMR pipeline; the prologue itself is covered by websocket-hot-update.spec.ts.
vi.mock('../../../server/websocket-hot-update.js', () => ({
	runHotUpdatePrologue: vi.fn(),
}));

describe('solidServerStrategy.importMapSpecifiers', () => {
	it('adds solid-js to the device import map', () => {
		expect(solidServerStrategy.importMapSpecifiers!()).toEqual(['solid-js']);
	});
});

describe('solidServerStrategy.handleHotUpdate', () => {
	beforeEach(() => {
		vi.mocked(runHotUpdatePrologue).mockReset();
	});

	function makeDeps() {
		const moduleGraph = {
			normalizeGraphId: vi.fn((rel: string) => rel),
			get: vi.fn(() => ({ id: '/src/components/home.tsx', hash: 'h1', deps: [] })),
			upsert: vi.fn(),
			emitDelta: vi.fn(),
		};
		return { moduleGraph, verbose: false } as any;
	}

	function makeServer() {
		return {
			config: { root: '/proj' },
			transformRequest: vi.fn(async () => ({ code: 'fresh-transform' })),
			moduleGraph: {
				getModulesByFile: vi.fn(() => undefined),
				onFileChange: vi.fn(),
				invalidateModule: vi.fn(),
			},
		} as any;
	}

	it('invalidates the Vite module graph, re-transforms, and broadcasts a fresh delta for an in-scope Solid file', async () => {
		const emitSummary = vi.fn();
		const metrics = { tAfterFramework: 0 };
		vi.mocked(runHotUpdatePrologue).mockResolvedValue({
			root: '/proj',
			updateRel: '/src/components/home.tsx',
			metrics: metrics as any,
			emitSummary,
		} as any);

		const deps = makeDeps();
		const server = makeServer();
		const ctx = { file: '/proj/src/components/home.tsx', server } as any;
		await solidServerStrategy.handleHotUpdate!(ctx, deps);

		expect(runHotUpdatePrologue).toHaveBeenCalledWith(ctx, deps);
		// Vite module-graph invalidation, a fresh transform re-upserted without
		// broadcasting, then a single broadcast of the now-fresh delta (deferred
		// from the prologue's common block).
		expect(server.moduleGraph.onFileChange).toHaveBeenCalledWith('/proj/src/components/home.tsx');
		expect(server.transformRequest).toHaveBeenCalledWith('/src/components/home.tsx');
		expect(deps.moduleGraph.upsert).toHaveBeenCalledWith('/src/components/home.tsx', 'fresh-transform', [], { broadcastDelta: false });
		expect(deps.moduleGraph.emitDelta).toHaveBeenCalledTimes(1);
		expect(deps.moduleGraph.emitDelta).toHaveBeenCalledWith([{ id: '/src/components/home.tsx', hash: 'h1', deps: [] }], []);
		expect(emitSummary).toHaveBeenCalledTimes(1);
		expect(metrics.tAfterFramework).toBeGreaterThan(0);
	});

	it('ignores non-Solid files (returns before touching metrics or emitting a summary)', async () => {
		const emitSummary = vi.fn();
		const metrics = { tAfterFramework: 0 };
		vi.mocked(runHotUpdatePrologue).mockResolvedValue({
			root: '/proj',
			updateRel: '/src/app.css',
			metrics: metrics as any,
			emitSummary,
		} as any);

		const deps = makeDeps();
		await solidServerStrategy.handleHotUpdate!({ file: '/proj/src/app.css', server: makeServer() } as any, deps);

		expect(deps.moduleGraph.emitDelta).not.toHaveBeenCalled();
		expect(emitSummary).not.toHaveBeenCalled();
		expect(metrics.tAfterFramework).toBe(0);
	});

	it('is a no-op when the prologue fully handled the change (null)', async () => {
		vi.mocked(runHotUpdatePrologue).mockResolvedValue(null as any);
		const deps = makeDeps();
		const server = makeServer();
		await solidServerStrategy.handleHotUpdate!({ file: '/proj/src/components/home.tsx', server } as any, deps);
		expect(server.moduleGraph.onFileChange).not.toHaveBeenCalled();
		expect(deps.moduleGraph.emitDelta).not.toHaveBeenCalled();
	});
});
