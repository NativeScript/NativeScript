import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();

vi.mock('fs', () => ({
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
	readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
	readFileSync: vi.fn(),
}));

const mockGetVendorManifest = vi.fn(() => null as unknown);
const mockListVendorModules = vi.fn(() => [] as string[]);

vi.mock('../shared/vendor/registry.js', () => ({
	getVendorManifest: (...args: unknown[]) => mockGetVendorManifest(...args),
	listVendorModules: (...args: unknown[]) => mockListVendorModules(...args),
}));

vi.mock('../../helpers/project.js', () => ({
	getProjectRootPath: vi.fn(() => '/workspace/app'),
}));

import { generateImportMap, getCanonicalization } from './import-map.js';
// Type-only (erased at emit): importing the concrete framework strategies here
// would pull the SFC/babel pipeline into this fs-mocked spec. The real hook
// outputs are golden-tested in the per-strategy specs; here we stub the hook to
// verify generateImportMap MERGES framework entries alongside vendor/core/
// discovered ones (ordering + conditional merge + trailing-slash coexistence).
import type { FrameworkServerStrategy } from './framework-strategy.js';

function strategyWithImportMapEntries(entries: (origin: string) => Record<string, string>): FrameworkServerStrategy {
	return { importMapEntries: entries } as unknown as FrameworkServerStrategy;
}

function dir(name: string) {
	return {
		name,
		isDirectory: () => true,
		isSymbolicLink: () => false,
	};
}

describe('generateImportMap', () => {
	beforeEach(() => {
		mockExistsSync.mockReturnValue(true);
		mockReaddirSync.mockImplementation((target: string) => {
			const normalized = String(target).replace(/\\/g, '/');
			if (normalized.endsWith('/node_modules')) {
				return [dir('@nativescript'), dir('@vitejs'), dir('vite'), dir('solid-js')];
			}
			if (normalized.endsWith('/node_modules/@nativescript')) {
				return [dir('vite')];
			}
			if (normalized.endsWith('/node_modules/@vitejs')) {
				return [dir('plugin-vue')];
			}
			return [];
		});
		mockGetVendorManifest.mockReturnValue(null);
		mockListVendorModules.mockReturnValue([]);
	});

	it('omits build-time package roots while keeping the NativeScript Vite runtime prefix', () => {
		const { imports } = generateImportMap({ origin: 'http://localhost:5173', flavor: 'angular' });

		expect(imports['@nativescript/vite']).toBeUndefined();
		expect(imports['@nativescript/vite/']).toBe('http://localhost:5173/ns/m/node_modules/@nativescript/vite/');
		expect(imports['vite']).toBeUndefined();
		expect(imports['vite/']).toBeUndefined();
		expect(imports['@vitejs/plugin-vue']).toBeUndefined();
		expect(imports['@vitejs/plugin-vue/']).toBeUndefined();
		expect(imports['solid-js']).toBe('http://localhost:5173/ns/m/node_modules/solid-js');
		expect(imports['solid-js/']).toBe('http://localhost:5173/ns/m/node_modules/solid-js/');
	});

	it('pins solid-js to the canonical dev.js URL for the Solid flavor so vendor + HTTP imports dedupe', () => {
		// Regression: without this, `@solid-refresh`'s rewritten
		// `import "http://.../solid-js/dist/dev.js"` and the vendor bundle's
		// `import 'solid-js'` (now externalized by `nsSolidJsExternalPlugin`)
		// would resolve to different module realms. The fallout is
		// observable as two device-side symptoms:
		//   1. `computations created outside a createRoot or render` warnings
		//      logged at boot (solid-refresh's HMRComp memo is created in the
		//      HTTP-side solid-js whose Owner is never set by the vendor-side
		//      render() createRoot)
		//   2. HMR toasts that don't reach the screen (patchRegistry ticks a
		//      signal on the HTTP-side realm; the page tree subscribes through
		//      the vendor-side realm).
		// The import-map entry below is the load-bearing piece — it has to
		// MATCH the URL produced by `rewriteImports` for the
		// vite-aliased absolute path (`/abs/.../node_modules/solid-js/dist/dev.js`
		// → `${origin}/ns/m/node_modules/solid-js/dist/dev.js`) so V8's ESM
		// loader dedupes the two import sites by URL.
		const { imports } = generateImportMap({
			origin: 'http://localhost:5173',
			flavor: 'solid',
			strategy: strategyWithImportMapEntries((origin) => ({ 'solid-js': `${origin}/ns/m/node_modules/solid-js/dist/dev.js` })),
		});

		expect(imports['solid-js']).toBe('http://localhost:5173/ns/m/node_modules/solid-js/dist/dev.js');
		// Trailing-slash prefix must still resolve subpaths via HTTP so
		// `solid-js/store`, `solid-js/jsx-runtime`, etc. don't accidentally
		// pick up the bare-specifier override.
		expect(imports['solid-js/']).toBe('http://localhost:5173/ns/m/node_modules/solid-js/');
	});

	it('never routes @nativescript/core through the vendor entries even when listed as one', () => {
		// Regression (from the ns-vendor:// era, still load-bearing): when the
		// Android-specific vendor candidate
		// `@nativescript/core/ui/frame/activity.android` ended up in the
		// vendor import-map block, core resolved into a second realm and
		// Android HMR cold boots died. Routing core (and any core subpath)
		// through the HTTP bridge keeps ONE core realm — the bridge serves
		// the platform-specific source via `${origin}/ns/core/...`.
		mockGetVendorManifest.mockReturnValue({
			version: 1,
			createdAt: new Date().toISOString(),
			hash: 'test-hash',
			modules: {},
			aliases: {
				'@nativescript/core/ui/frame/activity.android': '@nativescript/core/ui/frame/activity.android',
			},
		});
		mockListVendorModules.mockReturnValue(['@nativescript/core', '@nativescript/core/ui/frame/activity.android', '@nativescript/core/application', 'rxjs']);

		const { imports } = generateImportMap({ origin: 'http://localhost:5173', flavor: 'angular' });

		expect(imports['@nativescript/core']).toBe('http://localhost:5173/ns/core');
		expect(imports['@nativescript/core/']).toBe('http://localhost:5173/ns/core/');
		expect(imports['@nativescript/core/ui/frame/activity.android']).toBeUndefined();
		expect(imports['@nativescript/core/application']).toBeUndefined();
		expect(imports['rxjs']).toBe('http://localhost:5173/ns/m/node_modules/rxjs');
	});

	it('routes node: builtins to the dev-served shim endpoint', () => {
		// During a dev session these exact entries shadow the runtime's
		// baked-in `node:` polyfill branch, so the shim vocabulary lives on
		// the server (node-builtins-route.ts). Outside dev sessions the
		// native fallback still applies.
		const { imports } = generateImportMap({ origin: 'http://localhost:5173', flavor: 'angular' });

		expect(imports['node:url']).toBe('http://localhost:5173/ns/node/url');
		expect(imports['node:path']).toBe('http://localhost:5173/ns/node/path');
		// Bare names must NOT be shadowed — 'url'/'path' npm packages keep
		// their normal resolution.
		expect(imports['url']).toBeUndefined();
	});

	it('does not regress the Vue framework entries', () => {
		// Belt-and-suspenders: pin the entries so a future refactor of
		// `addFrameworkEntries` can't silently flip Vue onto the Solid
		// dedupe path.
		const { imports } = generateImportMap({
			origin: 'http://localhost:5173',
			flavor: 'vue',
			strategy: strategyWithImportMapEntries((origin) => ({ 'nativescript-vue': `${origin}/ns/m/node_modules/nativescript-vue`, vue: `${origin}/ns/m/node_modules/vue` })),
		});

		expect(imports['vue']).toBe('http://localhost:5173/ns/m/node_modules/vue');
		expect(imports['nativescript-vue']).toBe('http://localhost:5173/ns/m/node_modules/nativescript-vue');
	});
});

describe('vendor entries over HTTP deps shims', () => {
	beforeEach(() => {
		mockExistsSync.mockReturnValue(true);
		mockReaddirSync.mockImplementation((target: string) => {
			const normalized = String(target).replace(/\\/g, '/');
			if (normalized.endsWith('/node_modules')) {
				return [dir('rxjs'), dir('@ngx-translate'), dir('vue')];
			}
			if (normalized.endsWith('/node_modules/@ngx-translate')) {
				return [dir('core')];
			}
			return [];
		});
		mockGetVendorManifest.mockReturnValue(null);
		mockListVendorModules.mockReturnValue([]);
	});

	it('emits deps-bundle HTTP shim URLs for vendor roots and collapses aliases onto them', () => {
		mockGetVendorManifest.mockReturnValue({
			version: 1,
			createdAt: new Date().toISOString(),
			hash: 'test-hash',
			modules: {},
			aliases: { 'rxjs/operators': 'rxjs' },
		});
		mockListVendorModules.mockReturnValue(['rxjs', '@ngx-translate/core']);

		const { imports } = generateImportMap({
			origin: 'http://localhost:5173',
			flavor: 'vue',
		});

		expect(imports['rxjs']).toBe('http://localhost:5173/ns/m/node_modules/rxjs');
		expect(imports['@ngx-translate/core']).toBe('http://localhost:5173/ns/m/node_modules/@ngx-translate/core');
		// Alias collapses onto the canonical package root URL —
		// "many specifiers, one instance" via the single deps-bundle realm.
		expect(imports['rxjs/operators']).toBe('http://localhost:5173/ns/m/node_modules/rxjs');
		// Module identity is exclusively canonical HTTP URLs — no custom
		// scheme may appear anywhere in the map.
		expect(Object.values(imports).some((target) => !/^https?:\/\//.test(target))).toBe(false);
		// Untouched: core bridge + trailing-slash HTTP prefixes.
		expect(imports['@nativescript/core']).toBe('http://localhost:5173/ns/core');
		expect(imports['rxjs/']).toBe('http://localhost:5173/ns/m/node_modules/rxjs/');
	});
});

describe('getCanonicalization', () => {
	it('supplies the base vocabulary and merges the strategy preserve-query paths', () => {
		// This object is the runtime's ENTIRE canonicalization vocabulary —
		// the native side applies the mechanism (fragment strip, param drop,
		// sort) but carries no URL strings of its own. Renaming a dev route
		// or a cache-buster param means updating THIS function, never the
		// runtimes.
		expect(getCanonicalization()).toEqual({
			stripParams: ['t', 'v', 'import'],
			forPathPrefixes: ['/ns/', '/node_modules/.vite/', '/@id/', '/@fs/'],
			preserveQueryFor: [],
		});

		const strategy = { preserveQueryPaths: () => ['/@ng/component'] } as unknown as FrameworkServerStrategy;
		expect(getCanonicalization(strategy).preserveQueryFor).toEqual(['/@ng/component']);
	});
});
