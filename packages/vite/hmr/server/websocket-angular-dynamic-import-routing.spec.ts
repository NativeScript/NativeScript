import { describe, expect, it } from 'vitest';

import { rewriteImports } from './websocket.js';

describe('rewriteImports Angular dynamic app imports', () => {
	it('rewrites relative dynamic app imports through the runtime HMR helper', () => {
		const input = `const loadLogin = () => import('./components/login/login.component');\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain('const __nsDynamicHmrImport =');
		expect(output).toContain('__nsDynamicHmrImport("/ns/m/src/app/components/login/login.component")');
		expect(output).not.toContain('import("/ns/m/src/app/components/login/login.component")');
	});

	// alpha.59 — Stable URL + Explicit Invalidation.
	//
	// The previous helper synthesized `/ns/m/__ns_hmr__/<tag>/<rest>`
	// URLs from `__NS_HMR_GRAPH_VERSION__`/`__NS_HMR_IMPORT_NONCE__`.
	// That tag flowed into V8's `g_moduleRegistry` cache key — so a
	// `graphVersion` bump on every save effectively flushed the entire
	// cached graph. The new helper has none of that: it only adds the
	// boot prefix during cold boot, never synthesizes a version tag.
	// See HMR_STABLE_URL_INVALIDATION_PLAN.md.
	it('emits a tag-free dynamic-import helper for app modules', () => {
		const input = `const loadSignup = () => import('./components/signup/signup.component');\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		// Helper is installed.
		expect(output).toContain('const __nsDynamicHmrImport =');
		// Boot prefix is still preserved when the importer itself is in
		// the boot context (drives boot-progress instrumentation).
		expect(output).toContain("import.meta.url.includes('/__ns_boot__/b1/')");
		expect(output).toContain("__nsm + '/__ns_boot__/b1' + spec.slice(__nsm.length)");
		// node_modules paths bypass the prefix logic.
		expect(output).toContain("spec.startsWith(__nsm + '/node_modules/')");

		// CRITICAL invariants — the helper must NOT synthesize legacy
		// version tags. These regressions were the root cause of pre-
		// alpha.59 V8 cache-key thrash:
		expect(output).not.toMatch(/encodeURIComponent\(tag\)/);
		expect(output).not.toMatch(/__NS_HMR_GRAPH_VERSION__/);
		expect(output).not.toMatch(/__NS_HMR_IMPORT_NONCE__/);
		expect(output).not.toContain('__ns_hmr__');
		expect(output).not.toContain('importerTag');
	});

	it('keeps static app imports on the standard HTTP path', () => {
		const input = `import { HKFeature } from '/src/app/common/constants/feature.enum.ts';\n`;
		const output = rewriteImports(input, '/src/app/app.routes.ts', new Map(), new Map(), '/', false, undefined, 'http://localhost:5173', true);

		expect(output).toContain('/ns/m/src/app/common/constants/feature.enum');
		expect(output).not.toContain('__nsDynamicHmrImport');
	});
});
