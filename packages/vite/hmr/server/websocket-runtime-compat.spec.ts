import { describe, expect, it } from 'vitest';

import { buildNsEntryWrapper, buildNsRtBridgeModule } from './websocket-runtime-compat.js';

describe('websocket runtime compat builders', () => {
	it('builds the /ns/rt bridge with versioned core imports', () => {
		const code = buildNsRtBridgeModule('42', '// guard\n');
		expect(code).toContain('// guard');
		expect(code).toContain('/ns/core/42');
		expect(code).toContain("console.log('[ns-rt] evaluated'");
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
