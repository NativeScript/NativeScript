import { describe, expect, it } from 'vitest';

import { buildNsRtBridgeModule, discoverNsvBridgeExports } from './ns-rt-bridge.js';

describe('/ns/rt bridge builder', () => {
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
		const code = buildNsRtBridgeModule({ rtVer: '42', requireGuardSnippet: '// guard\n', vendorExports: [] });
		expect(code).toContain('// guard');
		expect(code).toContain('import(__origin + "/ns/core")');
		expect(code).not.toMatch(/\/ns\/core\/\d+/);
		expect(code).toContain("console.log('[ns-rt] evaluated'");
	});

	it('ignores the rtVer argument so callers cannot accidentally re-introduce the realm split', () => {
		// The bridge keeps `rtVer` in its options shape for the server's URL-
		// tagged dispatcher (`/ns/rt/<ver>` is the request the device asks for),
		// but the value must never reach the inner core import. Lock that
		// across multiple version values, including ones that would tempt a
		// future refactor to "use this for cache busting".
		for (const v of ['0', '1', '42', '99999']) {
			const code = buildNsRtBridgeModule({ rtVer: v, requireGuardSnippet: '', vendorExports: [] });
			expect(code).toContain('import(__origin + "/ns/core")');
			expect(code).not.toContain(`/ns/core/${v}`);
		}
	});

	it('gates the [ns-rt] evaluated marker behind __NS_ENV_VERBOSE__ so it is silent by default', () => {
		const code = buildNsRtBridgeModule({ rtVer: '42', requireGuardSnippet: '// guard\n', vendorExports: [] });
		expect(code).toContain("if (globalThis.__NS_ENV_VERBOSE__) console.log('[ns-rt] evaluated'");
	});

	// Single-realm contract: every name the underlying package publishes must
	// flow through the bridge. The old hand-curated list caused
	// `createNativeView is not a function` once Home.vue's onTabViewLoaded
	// reached for an export the author didn't list. The discovery-driven
	// emitter forwards ANY name (validated to be a JS identifier) under one
	// consistent constant-binding shape so symbol identity is preserved for
	// Vue's Symbol markers AND callable for function exports.
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

	// No baseline floor: when discovery returns nothing, the bridge emits zero
	// passthroughs. The misconfiguration must surface at the call site rather
	// than being masked by a curated fallback that pretends a smaller `nativescript-vue`
	// surface is intact.
	it('emits zero passthroughs when given no vendor exports', () => {
		const code = buildNsRtBridgeModule({ rtVer: '0', requireGuardSnippet: '', vendorExports: [] });
		// Bridge body is present (preamble, shims, default export) but no `export const X = (__ensure().X);` lines.
		expect(code).not.toMatch(/^export const (?!__realm)\w+ = \(__ensure\(\)\.\w+\);$/m);
		// HMR shims are always emitted regardless of discovery.
		expect(code).toContain('__nsNavigateUsingApp');
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

	it('discoverNsvBridgeExports returns an empty set when nativescript-vue is not resolvable from the project root', () => {
		// No baseline fallback: discovery is the single source of truth. Pointing
		// at an empty directory simulates a misconfigured project, which the
		// caller must surface rather than silently degrade.
		const names = discoverNsvBridgeExports('/tmp/__no_such_project__');
		expect(names.size).toBe(0);
	});
});
