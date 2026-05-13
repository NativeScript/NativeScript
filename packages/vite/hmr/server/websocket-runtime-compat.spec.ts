import { describe, expect, it } from 'vitest';

import { buildNsEntryWrapper, buildNsRtBridgeModule } from './websocket-runtime-compat.js';

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
