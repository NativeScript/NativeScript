import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { normalizeSpecifier, resolveVendorSpecifier, registerVendorManifest, clearVendorManifest, isVendorSpecifier, getVendorManifest, listVendorModules } from './registry.js';

// ---------------------------------------------------------------------------
// Minimal manifest fixture — mirrors the shape from manifest.ts
// ---------------------------------------------------------------------------
function createTestManifest(modules: Record<string, { id?: string; exports?: Record<string, boolean> }>, aliases?: Record<string, string>) {
	const mods: Record<string, { id: string; exports: Record<string, boolean> }> = {};
	for (const [key, val] of Object.entries(modules)) {
		mods[key] = { id: val.id ?? key, exports: val.exports ?? {} };
	}
	return {
		version: 1,
		createdAt: new Date().toISOString(),
		hash: 'test-hash',
		modules: mods,
		aliases: aliases ?? {},
	};
}

// ---------------------------------------------------------------------------
// normalizeSpecifier — pure function, no manifest needed
// ---------------------------------------------------------------------------
describe('normalizeSpecifier', () => {
	describe('/node_modules/ paths → bare package name', () => {
		it('solid-js with deep subpath', () => {
			expect(normalizeSpecifier('/node_modules/solid-js/dist/dev.js')).toBe('solid-js');
		});

		it('solid-js with query string (Vite cache-bust)', () => {
			expect(normalizeSpecifier('/node_modules/solid-js/dist/dev.js?v=57e43d24')).toBe('solid-js');
		});

		it('solid-js/web subpath', () => {
			expect(normalizeSpecifier('/node_modules/solid-js/web/dist/dev.js?v=abc')).toBe('solid-js');
		});

		it('scoped @tanstack/solid-router', () => {
			expect(normalizeSpecifier('/node_modules/@tanstack/solid-router/dist/esm/index.js')).toBe('@tanstack/solid-router');
		});

		it('scoped @tanstack/router-core with query', () => {
			expect(normalizeSpecifier('/node_modules/@tanstack/router-core/dist/index.js?v=abc123')).toBe('@tanstack/router-core');
		});

		it('scoped @nativescript-community/solid-js', () => {
			expect(normalizeSpecifier('/node_modules/@nativescript-community/solid-js/dist/index.js')).toBe('@nativescript-community/solid-js');
		});

		it('package at node_modules root (no subpath)', () => {
			expect(normalizeSpecifier('/node_modules/solid-js')).toBe('solid-js');
		});

		it('nested node_modules (hoisted) uses lastIndexOf', () => {
			expect(normalizeSpecifier('/node_modules/foo/node_modules/solid-js/dist/dev.js')).toBe('solid-js');
		});

		it('deeply nested scoped package', () => {
			expect(normalizeSpecifier('/a/b/node_modules/@tanstack/history/dist/index.js')).toBe('@tanstack/history');
		});
	});

	describe('.vite/deps/ pre-bundled paths', () => {
		it('unscoped: solid-js.js → solid-js', () => {
			expect(normalizeSpecifier('.vite/deps/solid-js.js')).toBe('solid-js');
		});

		it('scoped: @tanstack_solid-router.js → @tanstack/solid-router', () => {
			expect(normalizeSpecifier('.vite/deps/@tanstack_solid-router.js')).toBe('@tanstack/solid-router');
		});

		it('without .js extension', () => {
			expect(normalizeSpecifier('.vite/deps/solid-js')).toBe('solid-js');
		});

		it('with chunk suffix: solid-js_web.js → solid-js_web', () => {
			// Vite sometimes creates chunk files like solid-js_web.js for subpath exports
			expect(normalizeSpecifier('.vite/deps/solid-js_web.js')).toBe('solid-js_web');
		});
	});

	describe('bare specifiers with subpaths (post /node_modules/ stripping)', () => {
		// This was the critical bug: normalizeNodeModulesSpecifier strips
		// /node_modules/ yielding "solid-js/dist/dev.js", then resolveVendorFromCandidate
		// calls normalizeSpecifier which must reduce to "solid-js".
		it('solid-js/dist/dev.js → solid-js', () => {
			expect(normalizeSpecifier('solid-js/dist/dev.js')).toBe('solid-js');
		});

		it('solid-js/web → solid-js', () => {
			expect(normalizeSpecifier('solid-js/web')).toBe('solid-js');
		});

		it('solid-js/store → solid-js', () => {
			expect(normalizeSpecifier('solid-js/store')).toBe('solid-js');
		});

		it('@tanstack/solid-router/dist/index.js → @tanstack/solid-router', () => {
			expect(normalizeSpecifier('@tanstack/solid-router/dist/index.js')).toBe('@tanstack/solid-router');
		});

		it('@nativescript-community/solid-js/dist/index.js → @nativescript-community/solid-js', () => {
			expect(normalizeSpecifier('@nativescript-community/solid-js/dist/index.js')).toBe('@nativescript-community/solid-js');
		});
	});

	describe('already-bare package names (identity)', () => {
		it('solid-js → solid-js', () => {
			expect(normalizeSpecifier('solid-js')).toBe('solid-js');
		});

		it('@tanstack/solid-router → @tanstack/solid-router', () => {
			expect(normalizeSpecifier('@tanstack/solid-router')).toBe('@tanstack/solid-router');
		});

		it('dominative → dominative', () => {
			expect(normalizeSpecifier('dominative')).toBe('dominative');
		});
	});

	describe('query/hash stripping', () => {
		it('strips ?v= cache-bust query', () => {
			expect(normalizeSpecifier('solid-js?v=abc')).toBe('solid-js');
		});

		it('strips #hash', () => {
			expect(normalizeSpecifier('solid-js#exports')).toBe('solid-js');
		});

		it('strips complex query', () => {
			expect(normalizeSpecifier('solid-js?v=abc&t=123')).toBe('solid-js');
		});
	});

	describe('leading slash', () => {
		it('strips leading /', () => {
			expect(normalizeSpecifier('/solid-js')).toBe('solid-js');
		});
	});
});

// ---------------------------------------------------------------------------
// resolveVendorSpecifier — requires manifest to be registered
// ---------------------------------------------------------------------------
describe('resolveVendorSpecifier (with manifest)', () => {
	beforeEach(() => {
		registerVendorManifest(
			createTestManifest(
				{
					'solid-js': { exports: { createSignal: true, $DEVCOMP: true } },
					'@tanstack/solid-router': { exports: { createRootRoute: true, createRoute: true } },
					'@tanstack/router-core': { exports: { createRouter: true } },
					'@tanstack/history': {},
					'@nativescript-community/solid-js': { exports: { render: true } },
					dominative: {},
					pinia: { exports: { defineStore: true } },
				},
				{ 'solid-js/web': 'solid-js' },
			),
		);
	});

	afterEach(() => {
		clearVendorManifest();
	});

	// --- Exact bare package names ---
	it('resolves bare package name directly', () => {
		expect(resolveVendorSpecifier('solid-js')).toBe('solid-js');
	});

	it('resolves scoped package directly', () => {
		expect(resolveVendorSpecifier('@tanstack/solid-router')).toBe('@tanstack/solid-router');
	});

	// --- File/dist subpaths (should resolve to root) ---
	it('resolves Vite-rewritten /node_modules/ path to package name', () => {
		expect(resolveVendorSpecifier('/node_modules/solid-js/dist/dev.js?v=57e43d24')).toBe('solid-js');
	});

	it('resolves scoped Vite-rewritten path', () => {
		expect(resolveVendorSpecifier('/node_modules/@tanstack/solid-router/dist/esm/index.js?v=abc')).toBe('@tanstack/solid-router');
	});

	it('resolves already-stripped dist subpath', () => {
		expect(resolveVendorSpecifier('solid-js/dist/dev.js')).toBe('solid-js');
	});

	it('resolves scoped dist subpath', () => {
		expect(resolveVendorSpecifier('@tanstack/solid-router/dist/index.js')).toBe('@tanstack/solid-router');
	});

	it('resolves src/ subpath', () => {
		expect(resolveVendorSpecifier('pinia/src/index.js')).toBe('pinia');
	});

	it('resolves lib/ subpath', () => {
		expect(resolveVendorSpecifier('pinia/lib/esm/index.mjs')).toBe('pinia');
	});

	it('resolves esm/ subpath', () => {
		expect(resolveVendorSpecifier('solid-js/esm/index.js')).toBe('solid-js');
	});

	// --- Aliased entry-point subpaths (should resolve via alias) ---
	it('resolves via alias (solid-js/web → solid-js)', () => {
		expect(resolveVendorSpecifier('solid-js/web')).toBe('solid-js');
	});

	// --- Entry-point subpaths WITHOUT alias (must NOT resolve to root) ---
	// These are separate package entry points with different exports.
	// Resolving them to the root would give the wrong module on device.
	it('does NOT resolve solid-js/store to solid-js (separate entry point)', () => {
		expect(resolveVendorSpecifier('solid-js/store')).toBeNull();
	});

	it('does NOT resolve solid-js/html to solid-js (separate entry point)', () => {
		expect(resolveVendorSpecifier('solid-js/html')).toBeNull();
	});

	it('does NOT resolve solid-js/h to solid-js (separate entry point)', () => {
		expect(resolveVendorSpecifier('solid-js/h')).toBeNull();
	});

	it('does NOT resolve @tanstack/solid-router/client to root (separate entry point)', () => {
		expect(resolveVendorSpecifier('@tanstack/solid-router/client')).toBeNull();
	});

	it('does NOT resolve @nativescript-community/solid-js/dom to root (separate entry point)', () => {
		expect(resolveVendorSpecifier('@nativescript-community/solid-js/dom')).toBeNull();
	});

	// --- Dist subpath from entry-point subpath (should resolve to root) ---
	// solid-js/store/dist/store.js → the file is INSIDE solid-js, but the entry
	// point is "store" which is separate. The dist/ makes it look like a file path
	// but the entry point is still /store. Let's verify the intent:
	// normalizeSpecifier strips to "solid-js" which is in manifest.
	// The subpath is "store/dist/store.js" — the first segment is "store", not "dist".
	// So this should NOT resolve to solid-js root.
	it('does NOT resolve solid-js/store/dist/store.js to solid-js (entry point with dist)', () => {
		expect(resolveVendorSpecifier('solid-js/store/dist/store.js')).toBeNull();
	});

	// --- Unknown packages ---
	it('returns null for unknown package', () => {
		expect(resolveVendorSpecifier('unknown-package')).toBeNull();
	});

	it('returns null for unknown scoped package', () => {
		expect(resolveVendorSpecifier('@unknown/package')).toBeNull();
	});

	it('returns null for @nativescript/core (handled separately)', () => {
		expect(resolveVendorSpecifier('@nativescript/core')).toBeNull();
	});
});

describe('resolveVendorSpecifier (without manifest)', () => {
	beforeEach(() => {
		clearVendorManifest();
	});

	it('returns null for any specifier when no manifest loaded', () => {
		expect(resolveVendorSpecifier('solid-js')).toBeNull();
		expect(resolveVendorSpecifier('@tanstack/solid-router')).toBeNull();
	});
});

// ---------------------------------------------------------------------------
// isVendorSpecifier — convenience wrapper
// ---------------------------------------------------------------------------
describe('isVendorSpecifier (with manifest)', () => {
	beforeEach(() => {
		registerVendorManifest(createTestManifest({ 'solid-js': {}, pinia: {} }));
	});

	afterEach(() => {
		clearVendorManifest();
	});

	it('true for vendor package', () => {
		expect(isVendorSpecifier('solid-js')).toBe(true);
	});

	it('true for Vite-rewritten vendor path', () => {
		expect(isVendorSpecifier('/node_modules/solid-js/dist/dev.js?v=abc')).toBe(true);
	});

	it('false for non-vendor package', () => {
		expect(isVendorSpecifier('unknown-pkg')).toBe(false);
	});

	it('false for null/undefined', () => {
		expect(isVendorSpecifier(null)).toBe(false);
		expect(isVendorSpecifier(undefined)).toBe(false);
		expect(isVendorSpecifier('')).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// Manifest lifecycle
// ---------------------------------------------------------------------------
describe('manifest registration lifecycle', () => {
	afterEach(() => {
		clearVendorManifest();
	});

	it('starts with no manifest', () => {
		clearVendorManifest();
		expect(getVendorManifest()).toBeNull();
		expect(listVendorModules()).toEqual([]);
	});

	it('registers and retrieves manifest', () => {
		const manifest = createTestManifest({ 'solid-js': {}, pinia: {} });
		registerVendorManifest(manifest);
		expect(getVendorManifest()).toBe(manifest);
		expect(listVendorModules()).toContain('solid-js');
		expect(listVendorModules()).toContain('pinia');
	});

	it('clears manifest', () => {
		registerVendorManifest(createTestManifest({ 'solid-js': {} }));
		clearVendorManifest();
		expect(getVendorManifest()).toBeNull();
		expect(resolveVendorSpecifier('solid-js')).toBeNull();
	});
});
