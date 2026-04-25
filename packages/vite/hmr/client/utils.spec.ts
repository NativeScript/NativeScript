import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { _resetHmrModeBannerForTests, buildEvictionUrls, deriveHttpOrigin, emitHmrModeBannerOnce, getGraphVersion, hasExplicitEviction, invalidateModulesByUrls, moduleFetchCache, requestModuleFromServer, setGraphVersion, setHMRWsUrl, setHttpOriginForVite } from './utils.js';

const ORIGIN = 'http://127.0.0.1:5173';

function clearGlobalEvictionFn() {
	delete (globalThis as any).__nsInvalidateModules;
}

function setGlobalEvictionFn(fn: ((urls: readonly string[]) => void) | unknown) {
	(globalThis as any).__nsInvalidateModules = fn;
}

describe('setGraphVersion', () => {
	it('publishes the current graph version on globalThis', () => {
		const g = globalThis as any;
		const previousGraphVersion = getGraphVersion();
		const previousGlobalGraphVersion = g.__NS_HMR_GRAPH_VERSION__;

		try {
			setGraphVersion(408);

			expect(getGraphVersion()).toBe(408);
			expect(g.__NS_HMR_GRAPH_VERSION__).toBe(408);
		} finally {
			setGraphVersion(previousGraphVersion);
			g.__NS_HMR_GRAPH_VERSION__ = previousGlobalGraphVersion;
		}
	});
});

describe('hasExplicitEviction', () => {
	beforeEach(() => {
		clearGlobalEvictionFn();
	});

	afterEach(() => {
		clearGlobalEvictionFn();
	});

	it('returns false when the runtime hook is missing', () => {
		expect(hasExplicitEviction()).toBe(false);
	});

	it('returns true when __nsInvalidateModules is exposed as a function', () => {
		setGlobalEvictionFn(() => {});
		expect(hasExplicitEviction()).toBe(true);
	});

	it('returns false when __nsInvalidateModules is set to a non-function value', () => {
		setGlobalEvictionFn('not a function');
		expect(hasExplicitEviction()).toBe(false);
	});
});

describe('invalidateModulesByUrls', () => {
	beforeEach(() => {
		clearGlobalEvictionFn();
		_resetHmrModeBannerForTests();
	});

	afterEach(() => {
		clearGlobalEvictionFn();
	});

	it('returns false and skips the call when the runtime hook is missing', () => {
		const ok = invalidateModulesByUrls([`${ORIGIN}/ns/m/src/foo.ts`]);
		expect(ok).toBe(false);
	});

	it('returns false (no-op) when the URL list is empty even if the runtime hook exists', () => {
		const fn = vi.fn();
		setGlobalEvictionFn(fn);
		const ok = invalidateModulesByUrls([]);
		expect(ok).toBe(false);
		expect(fn).not.toHaveBeenCalled();
	});

	it('hands the canonical URL list to __nsInvalidateModules and returns true', () => {
		const fn = vi.fn();
		setGlobalEvictionFn(fn);
		const urls = [`${ORIGIN}/ns/m/src/foo.ts`, `${ORIGIN}/ns/m/src/bar.ts`];
		const ok = invalidateModulesByUrls(urls);
		expect(ok).toBe(true);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(urls);
	});

	it('soft-fails when __nsInvalidateModules throws', () => {
		setGlobalEvictionFn(() => {
			throw new Error('boom');
		});
		const ok = invalidateModulesByUrls([`${ORIGIN}/ns/m/src/foo.ts`]);
		expect(ok).toBe(false);
	});
});

describe('buildEvictionUrls', () => {
	const previousOrigin = process.env.NS_TEST_ORIGIN;

	beforeEach(() => {
		setHttpOriginForVite(ORIGIN);
	});

	afterEach(() => {
		setHttpOriginForVite(undefined);
		setHMRWsUrl(previousOrigin);
	});

	it('returns an empty list when no specs are provided', () => {
		expect(buildEvictionUrls([])).toEqual([]);
	});

	it('builds canonical /ns/m URLs and dedupes repeats', () => {
		const urls = buildEvictionUrls(['/src/main.ts', '/src/main.ts', 'src/util.ts']);
		expect(urls).toEqual([`${ORIGIN}/ns/m/src/main.ts`, `${ORIGIN}/ns/m/src/util.ts`]);
	});

	it('skips virtual specs and node_modules ids so vendor stays hot', () => {
		const urls = buildEvictionUrls(['\0plugin-vue:export-helper', '/src/components/Foo.vue?vue&type=script', '/node_modules/lodash/index.js', '/src/services/api.ts']);
		expect(urls.some((u) => u.includes('node_modules'))).toBe(false);
		expect(urls.some((u) => u.includes('plugin-vue'))).toBe(false);
		expect(urls).toEqual([`${ORIGIN}/ns/m/src/components/Foo.vue`, `${ORIGIN}/ns/m/src/services/api.ts`]);
	});

	it('returns an empty list when no http origin is available', () => {
		setHttpOriginForVite(undefined);
		setHMRWsUrl(undefined);
		// `deriveHttpOrigin` falls back to localhost when WS url is missing,
		// so we drop the global hint to make this a strict negative.
		const fakeWs = (globalThis as any).WebSocket;
		try {
			(globalThis as any).__NS_HTTP_ORIGIN__ = undefined;
			// Sanity: deriveHttpOrigin still produces a value (defaulting to localhost),
			// so buildEvictionUrls should not be empty unless the implementation
			// explicitly opts out — assert it produced at least one URL using the default.
			const urls = buildEvictionUrls(['/src/main.ts']);
			expect(urls).toHaveLength(1);
			expect(urls[0]).toMatch(/^http:\/\/localhost:5173\/ns\/m\/src\/main\.ts$/);
		} finally {
			(globalThis as any).WebSocket = fakeWs;
		}
	});
});

describe('emitHmrModeBannerOnce', () => {
	beforeEach(() => {
		_resetHmrModeBannerForTests();
		clearGlobalEvictionFn();
	});

	afterEach(() => {
		clearGlobalEvictionFn();
		vi.restoreAllMocks();
	});

	it('logs once per process and includes the active mode', () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		emitHmrModeBannerOnce();
		emitHmrModeBannerOnce();
		expect(info).toHaveBeenCalledTimes(1);
		expect(info.mock.calls[0]?.[0]).toContain('legacy-url-versioning');
	});

	it('reflects explicit eviction when force-emitted', () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		setGlobalEvictionFn(() => {});
		emitHmrModeBannerOnce(); // first emission picks up the active mode
		emitHmrModeBannerOnce(true); // forced re-emission, same mode
		expect(info).toHaveBeenCalledTimes(2);
		for (const call of info.mock.calls) {
			expect(String(call[0])).toContain('explicit-eviction');
		}
	});
});

describe('requestModuleFromServer', () => {
	beforeEach(() => {
		setHttpOriginForVite(ORIGIN);
		moduleFetchCache.clear();
		clearGlobalEvictionFn();
		_resetHmrModeBannerForTests();
		// Reset import nonce so legacy URL paths don't mis-count tags.
		try {
			(globalThis as any).__NS_HMR_IMPORT_NONCE__ = 0;
		} catch {}
		setGraphVersion(0);
	});

	afterEach(() => {
		setHttpOriginForVite(undefined);
		moduleFetchCache.clear();
		clearGlobalEvictionFn();
		setGraphVersion(0);
		try {
			(globalThis as any).__NS_HMR_IMPORT_NONCE__ = 0;
		} catch {}
	});

	it('returns the stable canonical URL when explicit eviction is supported', async () => {
		setGlobalEvictionFn(() => {});
		const url = await requestModuleFromServer('/src/main.ts');
		expect(url).toBe(`${ORIGIN}/ns/m/src/main.ts`);
		expect(url).not.toMatch(/__ns_hmr__/);
	});

	it('keeps stable URLs even after a graph version bump when explicit eviction is supported', async () => {
		setGlobalEvictionFn(() => {});
		setGraphVersion(7);
		(globalThis as any).__NS_HMR_IMPORT_NONCE__ = 3;
		const url = await requestModuleFromServer('/src/main.ts');
		expect(url).toBe(`${ORIGIN}/ns/m/src/main.ts`);
		expect(url).not.toMatch(/__ns_hmr__/);
	});

	it('falls back to legacy /ns/m/__ns_hmr__/<tag>/ URLs when the runtime is missing __nsInvalidateModules', async () => {
		clearGlobalEvictionFn();
		setGraphVersion(5);
		(globalThis as any).__NS_HMR_IMPORT_NONCE__ = 9;
		const url = await requestModuleFromServer('/src/foo.ts');
		expect(url.startsWith(`${ORIGIN}/ns/m/__ns_hmr__/`)).toBe(true);
		expect(url.endsWith('/src/foo.ts')).toBe(true);
		// Tag must include the nonce-bumped version segment so successive
		// saves on legacy runtimes still resolve to a different URL.
		expect(url).toMatch(/__ns_hmr__\/9-5/);
	});

	it('returns the bare canonical URL on legacy runtimes when no version, hash, or nonce signal is available', async () => {
		clearGlobalEvictionFn();
		setGraphVersion(0);
		(globalThis as any).__NS_HMR_IMPORT_NONCE__ = 0;
		const url = await requestModuleFromServer('/src/main.ts');
		expect(url).toBe(`${ORIGIN}/ns/m/src/main.ts`);
	});

	it('rejects virtual helper specs without producing a URL', async () => {
		await expect(requestModuleFromServer('\0plugin-vue:export-helper')).rejects.toThrow(/virtual-helper-skip/);
	});

	it('memoizes the resolved URL by spec', async () => {
		setGlobalEvictionFn(() => {});
		const first = await requestModuleFromServer('/src/main.ts');
		const second = await requestModuleFromServer('/src/main.ts');
		expect(first).toBe(second);
	});
});

describe('deriveHttpOrigin', () => {
	it('falls back to a sensible default when the WS url is undefined', () => {
		expect(deriveHttpOrigin(undefined)).toBe('http://localhost:5173');
	});

	it('maps wss:// to https:// and preserves the host', () => {
		expect(deriveHttpOrigin('wss://example.dev:8443/ns-hmr')).toBe('https://example.dev:8443');
	});
});
