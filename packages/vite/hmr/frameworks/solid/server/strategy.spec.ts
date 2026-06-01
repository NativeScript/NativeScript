import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { solidServerStrategy } from './strategy.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';

// solidServerStrategy.handleHotUpdate owns `prologue + its tail`. Mock the shared
// prologue so the handler tests isolate the migrated Solid tail without the full
// HMR pipeline; the prologue itself is covered by websocket-hot-update.spec.ts.
vi.mock('../../../server/websocket-hot-update.js', () => ({
	runHotUpdatePrologue: vi.fn(),
}));

const SOLID_REFRESH_ID = '/node_modules/@solid-refresh/dist/solid-refresh.mjs';

// A representative slice of the vendored `@solid-refresh` runtime carrying each
// of the four fragments the NativeScript patch keys off of, so the golden
// assertions below exercise every replacement branch.
const SOLID_REFRESH_SRC = ['function shouldWarnAndDecline() {', '  return DEV && hot;', '}', 'function createProxy(s, name) {', '  if (!s || $DEVCOMP in s) {', '    return s;', '  }', "  setComponentProperty(HMRComp, 'name', refreshName);", '  return new Proxy(HMRComp, {', '    get(_, property) {', "      if (property === 'location' || property === 'name') {", '        return source()[property];', '      }', '      return source()[property];', '    },', '  });', '}', 'function $$refreshESM(module, hot) {', '  hot.data[SOLID_REFRESH] = hot.data[SOLID_REFRESH] || registry;', '}'].join('\n');

describe('solidServerStrategy.transformNodeModule (@solid-refresh patch)', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('leaves modules that are not @solid-refresh untouched', () => {
		const code = 'export const x = 1;\n';
		expect(solidServerStrategy.transformNodeModule!(code, '/node_modules/lodash/index.js')).toBe(code);
	});

	it('is a no-op when the patch sentinel is already present', () => {
		const code = '/* __ns_solid_refresh_patched__ */\nexport const x = 1;\n';
		expect(solidServerStrategy.transformNodeModule!(code, SOLID_REFRESH_ID)).toBe(code);
	});

	it('applies all four NativeScript HMR patches to the @solid-refresh runtime', () => {
		const out = solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID);

		expect(out).not.toBe(SOLID_REFRESH_SRC);
		// Patch 1: shouldWarnAndDecline forced false + sentinel inserted.
		expect(out).toContain('/* __ns_solid_refresh_patched__ */');
		expect(out).toContain('function shouldWarnAndDecline() { return false; /* NS HMR: always allow refresh */ }');
		// Patch 2: createProxy forced down the createMemo path.
		expect(out).toContain('if (true) { /* NS HMR: always use createMemo for reactive HMR updates */');
		// Patch 2b: escape-hatch resolver exposed on HMRComp + short-circuited in the get handler.
		expect(out).toContain('HMRComp.__$ns_resolveSource = function() { return source(); };');
		expect(out).toContain("if (property === '__$ns_resolveSource') { return HMRComp.__$ns_resolveSource; }");
		// Patch 3: inline patchRegistry call (with verbose-gated diagnostics).
		expect(out).toContain("var __nsRefreshVerbose = (typeof globalThis !== 'undefined') && !!globalThis.__NS_ENV_VERBOSE__;");
		expect(out).toContain('var __nsShouldInvalidate = patchRegistry(hot.data[SOLID_REFRESH], registry);');
		// The original marker the inline block keys off of is preserved.
		expect(out).toContain('hot.data[SOLID_REFRESH] = hot.data[SOLID_REFRESH] || registry;');
	});

	it('is idempotent — a second pass detects the sentinel and returns the code unchanged', () => {
		const once = solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID);
		const twice = solidServerStrategy.transformNodeModule!(once, SOLID_REFRESH_ID);
		expect(twice).toBe(once);
	});

	it('emits server-side diagnostics only when verbose is set', () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

		solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID, false);
		expect(spy).not.toHaveBeenCalled();

		solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID, true);
		expect(spy).toHaveBeenCalledWith('[hmr-ws][solid] @solid-refresh patch check:', expect.objectContaining({ spec: SOLID_REFRESH_ID, alreadyPatched: false }));
	});
});

describe('solidServerStrategy.importMapEntries (P2-A5)', () => {
	it('pins solid-js to the canonical HTTP dev.js URL so vendor + HTTP imports dedupe', () => {
		expect(solidServerStrategy.importMapEntries!('http://localhost:5173')).toEqual({
			'solid-js': 'http://localhost:5173/ns/m/node_modules/solid-js/dist/dev.js',
		});
	});

	it('derives the URL from the passed origin', () => {
		expect(solidServerStrategy.importMapEntries!('http://device.local:9000')['solid-js']).toBe('http://device.local:9000/ns/m/node_modules/solid-js/dist/dev.js');
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
		const sharedTransformRequest: any = vi.fn(async () => ({ code: 'fresh-transform' }));
		sharedTransformRequest.invalidateMany = vi.fn();
		sharedTransformRequest.clear = vi.fn();
		return { moduleGraph, verbose: false, sharedTransformRequest } as any;
	}

	function makeServer() {
		return {
			config: { root: '/proj' },
			moduleGraph: {
				getModulesByFile: vi.fn(() => undefined),
				onFileChange: vi.fn(),
				invalidateModule: vi.fn(),
			},
		} as any;
	}

	it('busts transform caches and broadcasts a fresh delta for an in-scope Solid file', async () => {
		const emitSummary = vi.fn();
		const metrics = { tAfterFramework: 0 };
		vi.mocked(runHotUpdatePrologue).mockResolvedValue({
			root: '/proj',
			updateRel: '/src/components/home.tsx',
			metrics: metrics as any,
			emitSummary,
		} as any);

		const deps = makeDeps();
		const ctx = { file: '/proj/src/components/home.tsx', server: makeServer() } as any;
		await solidServerStrategy.handleHotUpdate!(ctx, deps);

		expect(runHotUpdatePrologue).toHaveBeenCalledWith(ctx, deps);
		// Sledgehammer purge of the shared transform cache, then a single broadcast
		// of the now-fresh delta (deferred from the prologue's common block).
		expect(deps.sharedTransformRequest.clear).toHaveBeenCalledTimes(1);
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
		await solidServerStrategy.handleHotUpdate!({ file: '/proj/src/components/home.tsx', server: makeServer() } as any, deps);
		expect(deps.sharedTransformRequest.clear).not.toHaveBeenCalled();
		expect(deps.moduleGraph.emitDelta).not.toHaveBeenCalled();
	});
});
