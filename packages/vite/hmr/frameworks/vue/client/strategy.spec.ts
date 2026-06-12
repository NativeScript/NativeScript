import { describe, expect, it, vi } from 'vitest';
import type { FrameworkClientBatchContext } from '../../../client/framework-client-strategy.js';
import { propagateDepChangeToSfcBoundary, vueClientStrategy, type VueDepPropagationDeps } from './strategy.js';
import { recordVuePayloadChanges, sfcChangedInVersion } from './index.js';
import { driveVueSfcUpdateOverlay } from './vue-sfc-update-overlay.js';
import { findNearestSfcBoundaries, type DepGraphModuleLike } from './dep-propagation.js';

type GraphModule = DepGraphModuleLike & { hash: string };

function makeGraph(entries: Array<[string, string[]]>): Map<string, GraphModule> {
	return new Map(entries.map(([id, deps]) => [id, { id, deps, hash: '' }]));
}

// The repro shape from ns-vue-vite-8: Home.vue imports test2.ts.
const REPRO_GRAPH = makeGraph([
	['/src/app.ts', ['/src/components/Home.vue']],
	['/src/components/Home.vue', ['/src/test.ts', '/src/test2.ts', '/src/components/Details.vue']],
	['/src/components/Details.vue', []],
	['/src/test.ts', []],
	['/src/test2.ts', []],
]);

function makeDeps(overrides: Partial<VueDepPropagationDeps> = {}): VueDepPropagationDeps {
	return {
		findBoundaries: findNearestSfcBoundaries,
		loadComponent: vi.fn(async () => ({ name: 'FreshComponent' })),
		sfcChangedInVersion: () => false,
		getVersion: () => 42,
		driveOverlay: driveVueSfcUpdateOverlay,
		...overrides,
	};
}

function makeCtx(overrides: Partial<FrameworkClientBatchContext> = {}): FrameworkClientBatchContext {
	return {
		setUpdateOverlayStage: vi.fn(),
		startedAt: 0,
		graph: REPRO_GRAPH,
		performResetRoot: vi.fn(async () => true),
		getOverlay: () => null,
		...overrides,
	};
}

describe('propagateDepChangeToSfcBoundary', () => {
	it('remounts the nearest .vue boundary when a non-SFC dep changes (test2.ts → Home.vue)', async () => {
		const deps = makeDeps();
		const ctx = makeCtx();
		const propagated = await propagateDepChangeToSfcBoundary(['/src/test2.ts'], ctx, deps);
		expect(propagated).toBe(true);
		expect(deps.loadComponent).toHaveBeenCalledWith('/src/components/Home.vue', 'dep_update');
		expect(ctx.performResetRoot).toHaveBeenCalledWith({ name: 'FreshComponent' });
	});

	it('drives the overlay through reimporting → rebooting → complete during the remount', async () => {
		const stages: string[] = [];
		const overlay = {
			setUpdateStage: (stage: string) => {
				stages.push(stage);
			},
		};
		const ctx = makeCtx({ getOverlay: () => overlay });
		const propagated = await propagateDepChangeToSfcBoundary(['/src/test2.ts'], ctx, makeDeps());
		expect(propagated).toBe(true);
		expect(stages).toEqual(['evicting', 'reimporting', 'rebooting', 'complete']);
	});

	it('falls back when no .vue boundary imports the changed module', async () => {
		const ctx = makeCtx({ graph: makeGraph([['/src/app.ts', ['/src/util.ts']]]) });
		const deps = makeDeps();
		expect(await propagateDepChangeToSfcBoundary(['/src/util.ts'], ctx, deps)).toBe(false);
		expect(deps.loadComponent).not.toHaveBeenCalled();
		expect(ctx.performResetRoot).not.toHaveBeenCalled();
	});

	it('stands down for mixed batches whose delta also changed a .vue file', async () => {
		const ctx = makeCtx();
		const deps = makeDeps({ sfcChangedInVersion: (version) => version === 42 });
		expect(await propagateDepChangeToSfcBoundary(['/src/test2.ts'], ctx, deps)).toBe(false);
		expect(deps.loadComponent).not.toHaveBeenCalled();
	});

	it('falls back when the batch context lacks graph or performResetRoot', async () => {
		expect(await propagateDepChangeToSfcBoundary(['/src/test2.ts'], makeCtx({ graph: undefined }), makeDeps())).toBe(false);
		expect(await propagateDepChangeToSfcBoundary(['/src/test2.ts'], makeCtx({ performResetRoot: undefined }), makeDeps())).toBe(false);
	});

	it('falls back (without throwing) when the component load rejects', async () => {
		const ctx = makeCtx();
		const deps = makeDeps({
			loadComponent: vi.fn(async () => {
				throw new Error('asm fetch failed');
			}),
		});
		// driveVueSfcUpdateOverlay swallows load errors and still completes the
		// overlay, so propagation reports true (the cycle ran) but never resets.
		expect(await propagateDepChangeToSfcBoundary(['/src/test2.ts'], ctx, deps)).toBe(true);
		expect(ctx.performResetRoot).not.toHaveBeenCalled();
	});
});

describe('vueClientStrategy.refreshAfterBatch', () => {
	it('completes the overlay with the batch summary when no propagation context is available', async () => {
		const setUpdateOverlayStage = vi.fn();
		await vueClientStrategy.refreshAfterBatch!(['/src/util.ts'], { setUpdateOverlayStage, startedAt: Date.now() });
		expect(setUpdateOverlayStage).toHaveBeenCalledTimes(1);
		const [stage, info] = setUpdateOverlayStage.mock.calls[0];
		expect(stage).toBe('complete');
		expect(info.detail).toContain('/src/util.ts');
	});
});

describe('sfcChangedInVersion', () => {
	it('reports .vue changes only for the recorded delta version', () => {
		recordVuePayloadChanges([{ id: '/src/components/Other.vue' }], 7);
		expect(sfcChangedInVersion(7)).toBe(true);
		expect(sfcChangedInVersion(8)).toBe(false);
	});

	it('does not record non-vue changes', () => {
		recordVuePayloadChanges([{ id: '/src/test2.ts' }], 9);
		expect(sfcChangedInVersion(9)).toBe(false);
	});
});
