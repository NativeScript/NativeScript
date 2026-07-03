import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The Vue SFC pathway uses the SAME freshness protocol as /ns/m modules:
// canonical (unversioned) URLs + explicit eviction via __NS_DEV__.invalidateModules
// before re-import. These tests pin the artifact URL set and the
// evict-before-import ordering in loadSfcComponent.

const safeDynImportMock = vi.hoisted(() => vi.fn(async (_spec: string) => ({ default: { name: 'FreshComponent', render() {} } })));

vi.mock('../../../client/utils.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('../../../client/utils.js')>();
	return {
		...actual,
		getHttpOriginForVite: () => 'http://localhost:5173',
		safeDynImport: safeDynImportMock,
	};
});

import { buildSfcEvictionUrls, loadSfcComponent } from './index.js';

const g: any = globalThis;
// On-device this is a compile-time define; seed it for the bare test env.
g.__NS_ENV_VERBOSE__ = false;

describe('buildSfcEvictionUrls', () => {
	it('returns the full canonical artifact URL set for an SFC path (no version segments)', () => {
		const urls = buildSfcEvictionUrls('/src/components/Home.vue');
		expect(urls).toEqual(['http://localhost:5173/ns/asm?path=%2Fsrc%2Fcomponents%2FHome.vue', 'http://localhost:5173/ns/asm?path=%2Fsrc%2Fcomponents%2FHome.vue&mode=inline', 'http://localhost:5173/ns/sfc/src/components/Home.vue?vue&type=script', 'http://localhost:5173/ns/sfc/src/components/Home.vue?vue&type=template', 'http://localhost:5173/ns/sfc/src/components/Home.vue']);
		for (const url of urls) {
			expect(url).not.toMatch(/\/ns\/(?:sfc|asm)\/\d+/);
		}
	});

	it('strips queries and normalizes a missing leading slash', () => {
		const urls = buildSfcEvictionUrls('src/App.vue?vue&type=script');
		expect(urls[0]).toBe('http://localhost:5173/ns/asm?path=%2Fsrc%2FApp.vue');
		expect(urls).toContain('http://localhost:5173/ns/sfc/src/App.vue');
	});
});

describe('loadSfcComponent eviction protocol', () => {
	let invalidator: ReturnType<typeof vi.fn>;
	let previousInvalidator: any;

	beforeEach(() => {
		safeDynImportMock.mockClear();
		invalidator = vi.fn(() => true);
		g.__NS_DEV__ ??= {};
		previousInvalidator = g.__NS_DEV__.invalidateModules;
		g.__NS_DEV__.invalidateModules = invalidator;
	});

	afterEach(() => {
		if (previousInvalidator === undefined) delete g.__NS_DEV__.invalidateModules;
		else g.__NS_DEV__.invalidateModules = previousInvalidator;
	});

	it('evicts the SFC artifact URL set BEFORE importing, and imports canonical URLs', async () => {
		const comp = await loadSfcComponent('/src/components/Home.vue', 'spec');
		expect(comp).toBeTruthy();

		// Eviction ran once with the full artifact set…
		expect(invalidator).toHaveBeenCalledTimes(1);
		const evicted: string[] = invalidator.mock.calls[0][0];
		expect(evicted).toEqual(buildSfcEvictionUrls('/src/components/Home.vue'));

		// …strictly before the first import.
		expect(invalidator.mock.invocationCallOrder[0]).toBeLessThan(safeDynImportMock.mock.invocationCallOrder[0]);

		// The assembler-first import uses the canonical (unversioned) URL.
		expect(safeDynImportMock).toHaveBeenCalledWith('http://localhost:5173/ns/asm?path=%2Fsrc%2Fcomponents%2FHome.vue');
	});

	it('still re-imports the canonical URL when the runtime lacks the eviction primitive', async () => {
		delete g.__NS_DEV__.invalidateModules;
		const comp = await loadSfcComponent('/src/components/Home.vue', 'spec');
		expect(comp).toBeTruthy();
		expect(safeDynImportMock).toHaveBeenCalledWith('http://localhost:5173/ns/asm?path=%2Fsrc%2Fcomponents%2FHome.vue');
	});

	it('survives the eviction primitive throwing without breaking the load', async () => {
		g.__NS_DEV__.invalidateModules = vi.fn(() => {
			throw new Error('boom');
		});
		const comp = await loadSfcComponent('/src/components/Home.vue', 'spec');
		expect(comp).toBeTruthy();
		expect(safeDynImportMock).toHaveBeenCalledWith('http://localhost:5173/ns/asm?path=%2Fsrc%2Fcomponents%2FHome.vue');
	});
});
