import { afterEach, describe, expect, it, vi } from 'vitest';

import { solidServerStrategy } from './strategy.js';

const SOLID_REFRESH_ID = '/node_modules/@solid-refresh/dist/solid-refresh.mjs';

// A representative slice of the vendored `@solid-refresh` runtime carrying each
// of the four fragments the NativeScript patch keys off of, so the golden
// assertions below exercise every replacement branch.
const SOLID_REFRESH_SRC = ['function shouldWarnAndDecline() {', '  return DEV && hot;', '}', 'function createProxy(s, name) {', '  if (!s || $DEVCOMP in s) {', '    return s;', '  }', "  setComponentProperty(HMRComp, 'name', refreshName);", '  return new Proxy(HMRComp, {', '    get(_, property) {', "      if (property === 'location' || property === 'name') {", '        return source()[property];', '      }', '      return source()[property];', '    },', '  });', '}', 'function $$refreshESM(module, hot) {', '  hot.data[SOLID_REFRESH] = hot.data[SOLID_REFRESH] || registry;', '}'].join('\n');

describe('solidServerStrategy.transformNodeModule (@solid-refresh patch)', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('leaves modules that are not @solid-refresh untouched', () => {
		const code = 'export const x = 1;\n';
		expect(solidServerStrategy.transformNodeModule!(code, '/node_modules/lodash/index.js')).toBe(code);
	});

	it('is a no-op when the patch sentinel is already present', () => {
		const code = '/* __ns_solid_refresh_patched__ */\nexport const x = 1;\n';
		expect(solidServerStrategy.transformNodeModule!(code, SOLID_REFRESH_ID)).toBe(code);
	});

	it('applies all four NativeScript HMR patches to the @solid-refresh runtime', () => {
		const out = solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID);

		expect(out).not.toBe(SOLID_REFRESH_SRC);
		// Patch 1: shouldWarnAndDecline forced false + sentinel inserted.
		expect(out).toContain('/* __ns_solid_refresh_patched__ */');
		expect(out).toContain('function shouldWarnAndDecline() { return false; /* NS HMR: always allow refresh */ }');
		// Patch 2: createProxy forced down the createMemo path.
		expect(out).toContain('if (true) { /* NS HMR: always use createMemo for reactive HMR updates */');
		// Patch 2b: escape-hatch resolver exposed on HMRComp + short-circuited in the get handler.
		expect(out).toContain('HMRComp.__$ns_resolveSource = function() { return source(); };');
		expect(out).toContain("if (property === '__$ns_resolveSource') { return HMRComp.__$ns_resolveSource; }");
		// Patch 3: inline patchRegistry call (with verbose-gated diagnostics).
		expect(out).toContain("var __nsRefreshVerbose = (typeof globalThis !== 'undefined') && !!globalThis.__NS_ENV_VERBOSE__;");
		expect(out).toContain('var __nsShouldInvalidate = patchRegistry(hot.data[SOLID_REFRESH], registry);');
		// The original marker the inline block keys off of is preserved.
		expect(out).toContain('hot.data[SOLID_REFRESH] = hot.data[SOLID_REFRESH] || registry;');
	});

	it('is idempotent — a second pass detects the sentinel and returns the code unchanged', () => {
		const once = solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID);
		const twice = solidServerStrategy.transformNodeModule!(once, SOLID_REFRESH_ID);
		expect(twice).toBe(once);
	});

	it('emits server-side diagnostics only when verbose is set', () => {
		const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

		solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID, false);
		expect(spy).not.toHaveBeenCalled();

		solidServerStrategy.transformNodeModule!(SOLID_REFRESH_SRC, SOLID_REFRESH_ID, true);
		expect(spy).toHaveBeenCalledWith('[hmr-ws][solid] @solid-refresh patch check:', expect.objectContaining({ spec: SOLID_REFRESH_ID, alreadyPatched: false }));
	});
});
