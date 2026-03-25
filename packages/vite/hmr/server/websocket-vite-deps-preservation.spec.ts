import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { __test_processCodeForDevice as processCodeForDevice } from './websocket.js';
import { registerVendorManifest, clearVendorManifest } from '../shared/vendor/registry.js';

/**
 * Tests for Vite pre-bundled deps (.vite/deps/) import handling in processCodeForDevice.
 *
 * THE BUG: When preserveVendorImports=true, processCodeForDevice was stripping ALL
 * .vite/deps/ imports unconditionally (lines 1208-1219). But ensureNativeScriptModuleBindings
 * (which would have converted them to __nsVendorRequire calls) was SKIPPED because
 * preserveVendorImports=true. Result: vendor imports like getRouteApi from
 * @tanstack/solid-router were completely removed → ReferenceError on device.
 *
 * THE FIX: When preserveVendorImports=true, vendor .vite/deps/ imports are rewritten
 * to bare specifiers (e.g., "@tanstack/solid-router") instead of being stripped.
 * Non-vendor .vite/deps/ imports are still stripped.
 */

function createTestManifest(modules: Record<string, { id?: string; exports?: Record<string, boolean> }>, aliases?: Record<string, string>) {
	const mods: Record<string, { id: string; exports: Record<string, boolean> }> = {};
	for (const [key, val] of Object.entries(modules)) {
		mods[key] = { id: val.id ?? key, exports: val.exports ?? { '*': true } };
	}
	return {
		version: 1,
		createdAt: new Date().toISOString(),
		hash: 'test-hash',
		modules: mods,
		aliases: aliases ?? {},
	};
}

describe('processCodeForDevice — .vite/deps/ vendor import preservation', () => {
	beforeEach(() => {
		registerVendorManifest(
			createTestManifest({
				'solid-js': {},
				'@tanstack/solid-router': {},
				'@tanstack/router-core': {},
				'@nativescript-community/solid-js': {},
				pinia: {},
			}),
		);
	});

	afterEach(() => {
		clearVendorManifest();
	});

	// Helper: run with preserveVendorImports=true
	function run(code: string) {
		return processCodeForDevice(code, false, true);
	}

	// Helper: run with preserveVendorImports=false (default)
	function runDefault(code: string) {
		return processCodeForDevice(code, false, false);
	}

	describe('preserveVendorImports=true: vendor .vite/deps/ → bare specifiers', () => {
		it('rewrites named vendor import from .vite/deps/ to bare specifier', () => {
			const input = `import { getRouteApi } from "/node_modules/.vite/deps/@tanstack_solid-router.js?v=abc123";\nconst route = getRouteApi("/posts");`;
			const out = run(input);
			// Must NOT strip the import — must rewrite to bare specifier
			expect(out).toContain('getRouteApi');
			expect(out).toMatch(/import\s+\{[^}]*getRouteApi[^}]*\}\s+from\s+["']@tanstack\/solid-router["']/);
			// Must NOT have the .vite/deps/ path
			expect(out).not.toMatch(/\.vite\/deps\//);
		});

		it('rewrites unscoped vendor import from .vite/deps/', () => {
			const input = `import { createSignal } from "/node_modules/.vite/deps/solid-js.js?v=abc";\nexport const s = createSignal(0);`;
			const out = run(input);
			expect(out).toMatch(/import\s+\{[^}]*createSignal[^}]*\}\s+from\s+["']solid-js["']/);
			expect(out).not.toMatch(/\.vite\/deps\//);
		});

		it('rewrites pinia vendor import from .vite/deps/', () => {
			const input = `import { defineStore } from "/node_modules/.vite/deps/pinia.js?v=xyz";\nexport const useStore = defineStore('main', () => ({}));`;
			const out = run(input);
			expect(out).toMatch(/import\s+\{[^}]*defineStore[^}]*\}\s+from\s+["']pinia["']/);
		});

		it('rewrites side-effect only vendor import from .vite/deps/', () => {
			const input = `import "/node_modules/.vite/deps/solid-js.js?v=abc";\nexport const x = 1;`;
			const out = run(input);
			expect(out).toMatch(/import\s+["']solid-js["']/);
			expect(out).not.toMatch(/\.vite\/deps\//);
		});

		it('strips non-vendor .vite/deps/ imports', () => {
			const input = `import { foo } from "/node_modules/.vite/deps/unknown-pkg.js?v=abc";\nexport const x = foo;`;
			const out = run(input);
			// Non-vendor should still be stripped
			expect(out).not.toMatch(/unknown-pkg/);
			expect(out).not.toMatch(/\.vite\/deps\//);
		});

		it('handles multiple imports: vendor rewritten, non-vendor stripped', () => {
			const input = [`import { createSignal } from "/node_modules/.vite/deps/solid-js.js?v=abc";`, `import { foo } from "/node_modules/.vite/deps/unknown-lib.js?v=def";`, `import { getRouteApi } from "/node_modules/.vite/deps/@tanstack_solid-router.js?v=ghi";`, `export const route = getRouteApi("/posts");`, `export const s = createSignal(0);`].join('\n');
			const out = run(input);
			// Vendor imports rewritten to bare specifiers
			expect(out).toMatch(/from\s+["']solid-js["']/);
			expect(out).toMatch(/from\s+["']@tanstack\/solid-router["']/);
			// Non-vendor stripped
			expect(out).not.toMatch(/unknown-lib/);
			// No .vite/deps/ paths remain
			expect(out).not.toMatch(/\.vite\/deps\//);
		});
	});

	describe('preserveVendorImports=false: all .vite/deps/ imports stripped', () => {
		it('strips vendor .vite/deps/ imports (ensureNativeScriptModuleBindings handles them)', () => {
			const input = `import { getRouteApi } from "/node_modules/.vite/deps/@tanstack_solid-router.js?v=abc";\nconst route = getRouteApi("/posts");`;
			const out = runDefault(input);
			// With preserveVendorImports=false, .vite/deps/ imports are stripped
			// because ensureNativeScriptModuleBindings already converted them to __nsVendorRequire
			expect(out).not.toMatch(/\.vite\/deps\//);
		});
	});
});

// ---------------------------------------------------------------------------
// Regression: the exact scenario that caused ReferenceError: getRouteApi is not defined
// ---------------------------------------------------------------------------
describe('regression: getRouteApi ReferenceError from stripped .vite/deps/ import', () => {
	beforeEach(() => {
		registerVendorManifest(
			createTestManifest({
				'@tanstack/solid-router': { exports: { createRootRoute: true, getRouteApi: true } },
			}),
		);
	});

	afterEach(() => {
		clearVendorManifest();
	});

	it('getRouteApi binding survives processCodeForDevice with preserveVendorImports=true', () => {
		// This is the EXACT code pattern from the user's post-list.tsx after Vite transform:
		// Vite rewrites @tanstack/solid-router to .vite/deps/@tanstack_solid-router.js
		const viteTransformed = [`import { getRouteApi } from "/node_modules/.vite/deps/@tanstack_solid-router.js?v=abc123";`, `import { createSignal } from "/node_modules/.vite/deps/solid-js.js?v=def456";`, `const PostList = () => { /* JSX */ };`, `const route = getRouteApi("/posts");`, `export default PostList;`].join('\n');

		const out = processCodeForDevice(viteTransformed, false, true);

		// getRouteApi must be importable — either the import is preserved or rewritten
		expect(out).toContain('getRouteApi');
		// Must have an import statement that brings getRouteApi into scope
		expect(out).toMatch(/import\s+\{[^}]*getRouteApi/);
		// The import source must be a bare specifier (for import map resolution)
		expect(out).toMatch(/from\s+["']@tanstack\/solid-router["']/);
	});
});

// ---------------------------------------------------------------------------
// Regression: @nativescript/tanstack-router/solid subpath collapsed to root
// Vite flattens it to @nativescript_tanstack-router_solid.js, the prefix
// matcher was greedily matching @nativescript_tanstack-router_ and returning
// the ROOT vendor module, which doesn't export Link.
// ---------------------------------------------------------------------------
describe('regression: @nativescript/tanstack-router/solid subpath not collapsed to root', () => {
	beforeEach(() => {
		registerVendorManifest(
			createTestManifest({
				'@nativescript/tanstack-router': { exports: { createNativeScriptHistory: true } },
				'@tanstack/solid-router': { exports: { createRootRoute: true } },
			}),
		);
	});

	afterEach(() => {
		clearVendorManifest();
	});

	it('rewrites @nativescript_tanstack-router_solid.js to @nativescript/tanstack-router/solid (not root)', () => {
		const input = [`import { Link, createNativeScriptRouter } from "/node_modules/.vite/deps/@nativescript_tanstack-router_solid.js?v=abc123";`, `const App = () => Link;`].join('\n');

		const out = processCodeForDevice(input, false, true);

		// Must rewrite to the SUBPATH specifier, not the root
		expect(out).toMatch(/from\s+["']@nativescript\/tanstack-router\/solid["']/);
		// Must NOT resolve to the root (which doesn't export Link)
		expect(out).not.toMatch(/from\s+["']@nativescript\/tanstack-router["']\s*;/);
		// Must preserve the named imports
		expect(out).toContain('Link');
		expect(out).toContain('createNativeScriptRouter');
		// No .vite/deps/ paths remain
		expect(out).not.toMatch(/\.vite\/deps\//);
	});
});
