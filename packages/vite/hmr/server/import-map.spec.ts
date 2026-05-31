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

import { generateImportMap } from './import-map.js';
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

	it('never routes @nativescript/core through ns-vendor:// even when listed as a vendor entry', () => {
		// Regression: when the Android-specific vendor candidate
		// `@nativescript/core/ui/frame/activity.android` ended up in the
		// `ns-vendor://` import-map block, vendor.mjs's externalized import
		// of the same specifier tried to resolve through a wrapper that
		// looked the entry up in `__nsVendorRegistry` BEFORE
		// `__nsBrowserRuntimeEnsureVendorBootstrap()` had a chance to
		// populate it (the bootstrap is invoked from the clientUrl module
		// body, AFTER `import vendor.mjs` finishes linking). Result: every
		// Android HMR cold boot died with
		// `Error: Vendor module not found in registry: @nativescript/core/ui/frame/activity.android`.
		// Routing core (and any core subpath) through the HTTP bridge
		// sidesteps the chicken-and-egg entirely — the bridge serves the
		// platform-specific source via `${origin}/ns/core/...` and the
		// runtime never has to consult the vendor registry for core.
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
		expect(imports['rxjs']).toBe('ns-vendor://rxjs');
	});

	it('does not regress the Vue framework entries', () => {
		// Vue does not hit the duplicate-instance problem (the vue runtime
		// is bundled in vendor and HTTP-served code does not re-import it
		// directly). Belt-and-suspenders: pin the entries so a future refactor
		// of `addFrameworkEntries` can't silently flip Vue onto the Solid
		// dedupe path.
		const { imports } = generateImportMap({
			origin: 'http://localhost:5173',
			flavor: 'vue',
			strategy: strategyWithImportMapEntries(() => ({ 'nativescript-vue': `ns-vendor://nativescript-vue`, vue: `ns-vendor://vue` })),
		});

		expect(imports['vue']).toBe('ns-vendor://vue');
		expect(imports['nativescript-vue']).toBe('ns-vendor://nativescript-vue');
	});
});
