import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockExistsSync = vi.fn();
const mockReaddirSync = vi.fn();

vi.mock('fs', () => ({
	existsSync: (...args: unknown[]) => mockExistsSync(...args),
	readdirSync: (...args: unknown[]) => mockReaddirSync(...args),
	readFileSync: vi.fn(),
}));

vi.mock('../shared/vendor/registry.js', () => ({
	getVendorManifest: vi.fn(() => null),
	listVendorModules: vi.fn(() => []),
}));

vi.mock('../../helpers/project.js', () => ({
	getProjectRootPath: vi.fn(() => '/workspace/app'),
}));

import { generateImportMap } from './import-map.js';

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
		const { imports } = generateImportMap({ origin: 'http://localhost:5173', flavor: 'solid' });

		expect(imports['solid-js']).toBe('http://localhost:5173/ns/m/node_modules/solid-js/dist/dev.js');
		// Trailing-slash prefix must still resolve subpaths via HTTP so
		// `solid-js/store`, `solid-js/jsx-runtime`, etc. don't accidentally
		// pick up the bare-specifier override.
		expect(imports['solid-js/']).toBe('http://localhost:5173/ns/m/node_modules/solid-js/');
	});

	it('does not regress the Vue framework entries', () => {
		// Vue does not hit the duplicate-instance problem (the vue runtime
		// is bundled in vendor and HTTP-served code does not re-import it
		// directly). Belt-and-suspenders: pin the entries so a future refactor
		// of `addFrameworkEntries` can't silently flip Vue onto the Solid
		// dedupe path.
		const { imports } = generateImportMap({ origin: 'http://localhost:5173', flavor: 'vue' });

		expect(imports['vue']).toBe('ns-vendor://vue');
		expect(imports['nativescript-vue']).toBe('ns-vendor://nativescript-vue');
	});
});
