import { describe, expect, it } from 'vitest';

import { buildNsEntryWrapper, buildNsRtBridgeModule, discoverNsvBridgeExports, __nsvBaselineExports } from './websocket-runtime-compat.js';

describe('websocket runtime compat builders', () => {
	it('targets the canonical, unversioned /ns/core URL so vendor `require` and the rt bridge share one module realm', () => {
		// The /ns/rt bridge dynamically imports `@nativescript/core` so its
		// fast-path can hand a fully-initialised core module to NativeScript-Vue
		// without waiting for an installer's `require()` to round-trip through
		// the vendor registry. iOS's HTTP-ESM loader keys module records by
		// REQUEST URL, so any divergence between this bridge's URL and the
		// `/ns/core` URL produced by `buildCoreUrlPath` / the runtime import
		// map's bare `@nativescript/core` mapping evaluated the bridge's source
		// twice — once per URL — yielding two independent `Frame` / `Page` /
		// `View` classes and silently breaking `Application.resetRootView`'s
		// internal `instanceof` checks. The canonical, unversioned form keeps
		// every consumer on the same module record.
		const code = buildNsRtBridgeModule('42', '// guard\n');
		expect(code).toContain('// guard');
		expect(code).toContain('import(__origin + "/ns/core")');
		expect(code).not.toMatch(/\/ns\/core\/\d+/);
		expect(code).toContain("console.log('[ns-rt] evaluated'");
	});

	it('ignores the rtVer argument so callers cannot accidentally re-introduce the realm split', () => {
		// The bridge intentionally keeps the `rtVer` parameter in its signature
		// for back-compat with the server's URL-tagged dispatcher
		// (`/ns/rt/<ver>` is the request the device asks for), but the value
		// must never reach the inner core import. This regression guard locks
		// that contract across multiple version values, including ones that
		// would tempt a future refactor to "use this for cache busting".
		for (const v of ['0', '1', '42', '99999']) {
			const code = buildNsRtBridgeModule(v, '');
			expect(code).toContain('import(__origin + "/ns/core")');
			expect(code).not.toContain(`/ns/core/${v}`);
		}
	});

	it('gates the [ns-rt] evaluated marker behind __NS_ENV_VERBOSE__ so it is silent by default', () => {
		const code = buildNsRtBridgeModule('42', '// guard\n');
		expect(code).toContain("if (globalThis.__NS_ENV_VERBOSE__) console.log('[ns-rt] evaluated'");
	});

	// Single-realm contract: every name the underlying package publishes must
	// flow through the bridge. The old hand-curated list caused
	// `createNativeView is not a function` once Home.vue's onTabViewLoaded
	// reached for an export the author didn't list. The discovery-driven
	// emitter now forwards ANY name (validated to be a JS identifier) under
	// one consistent constant-binding shape so symbol identity is preserved
	// for Vue's Symbol markers AND callable for function exports.
	it('emits every discovered vendor export as a constant binding off __ensure()', () => {
		const code = buildNsRtBridgeModule({
			rtVer: '42',
			requireGuardSnippet: '',
			vendorExports: ['createNativeView', 'someBrandNewHelper', 'ELEMENT_REF', 'Fragment'],
		});
		// Constant binding shape — preserves identity for Symbols (Fragment, ELEMENT_REF)
		// and works transparently for function exports.
		expect(code).toContain('export const createNativeView = (__ensure().createNativeView);');
		expect(code).toContain('export const someBrandNewHelper = (__ensure().someBrandNewHelper);');
		expect(code).toContain('export const ELEMENT_REF = (__ensure().ELEMENT_REF);');
		expect(code).toContain('export const Fragment = (__ensure().Fragment);');
		// The default-export object must list them too so `import nsv from 'nativescript-vue'; nsv.X` works.
		expect(code).toMatch(/export default \{[^}]*\bsomeBrandNewHelper\b[^}]*\};/);
	});

	it('falls back to the curated baseline when no vendor exports are supplied (legacy callers)', () => {
		const code = buildNsRtBridgeModule('42', '// guard\n');
		// Baseline names are always present.
		for (const name of __nsvBaselineExports) expect(code).toContain(`export const ${name} = (__ensure().${name});`);
		// Guard prologue still applied.
		expect(code).toMatch(/^\/\/ guard\n/);
	});

	// Override contract: HMR-routed nav helpers (and the `vite__injectQuery`
	// polyfill) MUST NOT be re-emitted as plain passthroughs. The bridge
	// supplies bespoke implementations that route through
	// `globalThis.__nsNavigateUsingApp` — a stray passthrough would shadow
	// the override and break navigation after every HMR boot.
	it('never emits passthroughs for HMR-overridden names, even if discovery returns them', () => {
		const code = buildNsRtBridgeModule({
			rtVer: '0',
			requireGuardSnippet: '',
			vendorExports: ['$navigateTo', '$navigateBack', '$showModal', 'vite__injectQuery', 'createApp'],
		});
		// No `export const $navigateTo = (__ensure().$navigateTo);` passthrough.
		expect(code).not.toMatch(/export const \$navigateTo = \(__ensure\(\)\.\$navigateTo\);/);
		expect(code).not.toMatch(/export const \$navigateBack = \(__ensure\(\)\.\$navigateBack\);/);
		expect(code).not.toMatch(/export const \$showModal = \(__ensure\(\)\.\$showModal\);/);
		expect(code).not.toMatch(/export const vite__injectQuery = \(__ensure\(\)\.vite__injectQuery\);/);
		// But the HMR-routed shims ARE present (their bodies reference __nsNavigateUsingApp).
		expect(code).toContain('__nsNavigateUsingApp');
		// And ordinary exports are still emitted from the same input.
		expect(code).toContain('export const createApp = (__ensure().createApp);');
	});

	it('filters non-identifier names (e.g. property strings with hyphens) from the auto-emitted exports', () => {
		const code = buildNsRtBridgeModule({
			rtVer: '0',
			requireGuardSnippet: '',
			vendorExports: ['valid', 'has-hyphen', '123starts-with-digit', '$ok', 'with.dot', 'OK_OK'],
		});
		expect(code).toContain('export const valid = (__ensure().valid);');
		expect(code).toContain('export const $ok = (__ensure().$ok);');
		expect(code).toContain('export const OK_OK = (__ensure().OK_OK);');
		expect(code).not.toContain('has-hyphen');
		expect(code).not.toContain('123starts-with-digit');
		expect(code).not.toContain('with.dot');
	});

	it('discoverNsvBridgeExports returns at least the baseline even when the package cannot be resolved', () => {
		// Pointing discovery at an empty directory simulates a project that
		// doesn't have `nativescript-vue` installed (test environment). The
		// baseline floor still protects the bridge.
		const names = discoverNsvBridgeExports('/tmp/__no_such_project__');
		for (const baseline of __nsvBaselineExports) expect(names.has(baseline)).toBe(true);
	});

	it('builds the /ns/entry wrapper around entry-runtime fetch/eval', () => {
		const code = buildNsEntryWrapper({
			origin: 'http://localhost:1234',
			mainEntry: '/app/main.ts',
			ver: '19',
			verbose: true,
			requireGuardSnippet: '// guard\n',
		});

		expect(code).toContain('// [ns-entry][v19] wrapper');
		expect(code).toContain("const __entryRtUrl = '/ns/entry-rt?v=' + String(__ns_graph_ver);");
		expect(code).toContain('await startEntry({ origin, main, ver: __ns_graph_ver, verbose: !!__VERBOSE__ });');
		expect(code).toContain('//# sourceURL=http://localhost:1234/ns/entry');
	});
});
