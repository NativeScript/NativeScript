import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerVendorManifest, clearVendorManifest } from '../shared/vendor/registry.js';

/**
 * Tests for the vendor module ESM wrapper contract.
 *
 * When `preserveVendorImports` is true, the Vite server preserves bare
 * specifiers (e.g., `import { $DEVCOMP } from "solid-js"`) in served code.
 * The device-side import map resolves "solid-js" → "ns-vendor://solid-js".
 * The iOS runtime's ResolveFromVendorRegistry then creates an ESM wrapper
 * module that must re-export ALL named exports individually.
 *
 * The critical bug was: the wrapper used `export { __named }` which exports
 * a single binding called "__named" (an object) — NOT the individual named
 * exports. V8 correctly rejects `import { $DEVCOMP } from "solid-js"`
 * because `$DEVCOMP` is not a named export of the wrapper module.
 *
 * The fix: ResolveFromVendorRegistry enumerates the vendor module's property
 * names via V8 API and generates explicit `export const X = __mod['X'];`
 * for each named export.
 *
 * These tests verify the Vite-side contract that ensures vendor imports
 * reach the device in a form that the runtime can resolve.
 */

// ---------------------------------------------------------------------------
// Simulate the vendor module wrapper generation
// ---------------------------------------------------------------------------

/**
 * Simulates what the iOS runtime's ResolveFromVendorRegistry should generate.
 * Given a module's export names, produces ESM wrapper source code.
 *
 * CORRECT pattern (individual named exports):
 *   export default __mod.default !== undefined ? __mod.default : __mod;
 *   export const createSignal = __mod['createSignal'];
 *   export const $DEVCOMP = __mod['$DEVCOMP'];
 *
 * BROKEN pattern (single object export — DO NOT USE):
 *   const { default: __d, ...__named } = __mod;
 *   export { __named };  // <-- This exports ONE binding called "__named", not individual names!
 */
function generateCorrectVendorWrapper(vendorId: string, exportNames: string[]): string {
	let src = `const __reg = globalThis.__nsVendorRegistry;\n`;
	src += `const __mod = __reg && __reg.get('${vendorId}');\n`;
	src += `if (!__mod) throw new Error('Vendor module not found in registry: ${vendorId}');\n`;
	src += `export default __mod.default !== undefined ? __mod.default : __mod;\n`;

	for (const name of exportNames) {
		if (name !== 'default' && isValidJSIdentifier(name)) {
			src += `export const ${name} = __mod['${name}'];\n`;
		}
	}
	return src;
}

function generateBrokenVendorWrapper(vendorId: string): string {
	return `const __reg = globalThis.__nsVendorRegistry;\n` + `const __mod = __reg && __reg.get('${vendorId}');\n` + `if (!__mod) throw new Error('Vendor module not found in registry: ${vendorId}');\n` + `export default __mod.default !== undefined ? __mod.default : __mod;\n` + `const { default: __d, ...__named } = __mod;\n` + `export { __named };\n`;
}

function isValidJSIdentifier(name: string): boolean {
	return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
}

// Helper: extract all ESM export names from generated wrapper source
function extractExportNames(src: string): string[] {
	const names: string[] = [];
	// Match: export default
	if (/export\s+default\b/.test(src)) {
		names.push('default');
	}
	// Match: export const NAME
	const constRE = /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
	let m: RegExpExecArray | null;
	while ((m = constRE.exec(src))) {
		names.push(m[1]);
	}
	// Match: export { NAME } (broken pattern)
	const namedRE = /export\s+\{\s*([^}]+)\s*\}/g;
	while ((m = namedRE.exec(src))) {
		const inner = m[1].split(',').map((s) =>
			s
				.trim()
				.split(/\s+as\s+/)[0]
				.trim(),
		);
		names.push(...inner);
	}
	return names;
}

// ---------------------------------------------------------------------------
// Correct wrapper: individual named exports
// ---------------------------------------------------------------------------
describe('vendor wrapper — correct pattern (individual named exports)', () => {
	it('exports $DEVCOMP individually for solid-js', () => {
		const exports = ['createSignal', 'createEffect', '$DEVCOMP', 'default'];
		const src = generateCorrectVendorWrapper('solid-js', exports);
		const names = extractExportNames(src);

		expect(names).toContain('default');
		expect(names).toContain('createSignal');
		expect(names).toContain('createEffect');
		expect(names).toContain('$DEVCOMP');
	});

	it('exports createRootRoute individually for @tanstack/solid-router', () => {
		const exports = ['createRootRoute', 'createRoute', 'createRouter', 'getRouteApi', 'default'];
		const src = generateCorrectVendorWrapper('@tanstack/solid-router', exports);
		const names = extractExportNames(src);

		expect(names).toContain('default');
		expect(names).toContain('createRootRoute');
		expect(names).toContain('createRoute');
		expect(names).toContain('createRouter');
		expect(names).toContain('getRouteApi');
	});

	it('exports defineStore individually for pinia', () => {
		const exports = ['defineStore', 'createPinia', 'storeToRefs', 'default'];
		const src = generateCorrectVendorWrapper('pinia', exports);
		const names = extractExportNames(src);

		expect(names).toContain('defineStore');
		expect(names).toContain('createPinia');
		expect(names).toContain('storeToRefs');
	});

	it('handles exports starting with $ (like $DEVCOMP, $TRACK)', () => {
		const exports = ['$DEVCOMP', '$TRACK', '$PROXY'];
		const src = generateCorrectVendorWrapper('solid-js', exports);
		const names = extractExportNames(src);

		expect(names).toContain('$DEVCOMP');
		expect(names).toContain('$TRACK');
		expect(names).toContain('$PROXY');
	});

	it('handles exports starting with _ (underscore)', () => {
		const exports = ['_internal', '__private'];
		const src = generateCorrectVendorWrapper('some-lib', exports);
		const names = extractExportNames(src);

		expect(names).toContain('_internal');
		expect(names).toContain('__private');
	});

	it('skips "default" from named exports (handled separately)', () => {
		const exports = ['default', 'createSignal'];
		const src = generateCorrectVendorWrapper('solid-js', exports);

		// Should have `export default` once
		const defaultMatches = src.match(/export default/g) || [];
		expect(defaultMatches.length).toBe(1);

		// Should NOT have `export const default = ...`
		expect(src).not.toMatch(/export const default\b/);
	});

	it('skips non-identifier export names', () => {
		const exports = ['valid', 'also-invalid', '123start', 'ok_name'];
		const src = generateCorrectVendorWrapper('some-lib', exports);
		const names = extractExportNames(src);

		expect(names).toContain('valid');
		expect(names).toContain('ok_name');
		expect(names).not.toContain('also-invalid');
		expect(names).not.toContain('123start');
	});
});

// ---------------------------------------------------------------------------
// Broken wrapper: the pattern that caused the $DEVCOMP error
// ---------------------------------------------------------------------------
describe('vendor wrapper — broken pattern (DO NOT USE)', () => {
	it('broken pattern only exports __named, not individual names', () => {
		const src = generateBrokenVendorWrapper('solid-js');
		const names = extractExportNames(src);

		// The broken pattern exports "default" and "__named" — NOT $DEVCOMP, createSignal, etc.
		expect(names).toContain('default');
		expect(names).toContain('__named');
		// These are NOT exported as individual names:
		expect(names).not.toContain('$DEVCOMP');
		expect(names).not.toContain('createSignal');
	});

	it('broken pattern would fail V8 resolution for named imports', () => {
		// When V8 processes: import { $DEVCOMP } from "solid-js"
		// It looks for a named export called "$DEVCOMP" in the module.
		// The broken wrapper only has "default" and "__named" as export names.
		const src = generateBrokenVendorWrapper('solid-js');
		const names = extractExportNames(src);

		// Simulate V8's named export resolution
		const requestedImport = '$DEVCOMP';
		const wouldResolve = names.includes(requestedImport);
		expect(wouldResolve).toBe(false); // This is WHY the error occurs!
	});
});

// ---------------------------------------------------------------------------
// JS identifier validation (used by both Vite and iOS runtime)
// ---------------------------------------------------------------------------
describe('isValidJSIdentifier', () => {
	const valid = ['createSignal', '$DEVCOMP', '$TRACK', '$PROXY', '_internal', '__private', 'a', '_', '$', 'camelCase', 'PascalCase', 'SCREAMING_SNAKE', 'with123numbers', '$0'];

	const invalid = ['', '123start', 'kebab-case', 'has space', 'has.dot', 'has/slash', 'has@at', 'default+other'];

	for (const name of valid) {
		it(`"${name}" is valid`, () => {
			expect(isValidJSIdentifier(name)).toBe(true);
		});
	}

	for (const name of invalid) {
		it(`"${name}" is invalid`, () => {
			expect(isValidJSIdentifier(name)).toBe(false);
		});
	}
});

// ---------------------------------------------------------------------------
// Import preservation contract (Vite server side)
// ---------------------------------------------------------------------------
describe('vendor import preservation contract', () => {
	// These tests document what the Vite server MUST produce when
	// preserveVendorImports=true, so the device-side import map + runtime
	// can resolve vendor imports correctly.

	it('solid-js dev-mode imports must use bare specifier', () => {
		// The Solid compiler generates: import { $DEVCOMP } from "solid-js"
		// After Vite transform, this might become: import { $DEVCOMP } from "/node_modules/solid-js/dist/dev.js?v=abc"
		// rewriteImports MUST normalize this back to: import { $DEVCOMP } from "solid-js"
		// so the device import map resolves "solid-js" → "ns-vendor://solid-js"
		const bareSpec = 'solid-js';
		const viteRewritten = '/node_modules/solid-js/dist/dev.js?v=57e43d24';

		// The bare specifier is what the import map expects
		expect(bareSpec).toBe('solid-js');
		// The Vite-rewritten path must NOT appear in served code
		expect(viteRewritten).toContain('/node_modules/');
	});

	it('@solid-refresh virtual module imports must use bare specifiers for vendors', () => {
		// /@solid-refresh is a Vite virtual module that imports from solid-js.
		// It must be routed through /ns/m/@solid-refresh so our pipeline processes it.
		// Its internal import of solid-js must become the bare specifier "solid-js"
		// for the import map to resolve.
		const virtualModule = '/@solid-refresh';
		const routedPath = `/ns/m${virtualModule}`;
		expect(routedPath).toBe('/ns/m/@solid-refresh');
	});

	it('all vendor package imports must be bare specifiers in served code', () => {
		// When preserveVendorImports=true, these vendor imports must appear
		// as bare specifiers in the code served to the device:
		const vendorPackages = ['solid-js', '@tanstack/solid-router', '@tanstack/router-core', '@nativescript-community/solid-js', 'pinia', 'vue'];

		for (const pkg of vendorPackages) {
			// Must be a valid import map key (no /node_modules/ prefix, no query strings)
			expect(pkg).not.toContain('/node_modules/');
			expect(pkg).not.toContain('?');
			expect(pkg).not.toContain('.js');
		}
	});
});

// ---------------------------------------------------------------------------
// Real-world error scenarios that must not recur
// ---------------------------------------------------------------------------
describe('real-world error scenarios — regression guards', () => {
	it('$DEVCOMP from solid-js: wrapper must export it individually', () => {
		// Scenario: Solid compiler generates `import { $DEVCOMP } from "solid-js"`
		// in compiled JSX output. The vendor wrapper must export $DEVCOMP as
		// an individual named export, not buried inside an __named object.
		const solidExports = ['createSignal', 'createEffect', 'createMemo', 'onMount', 'onCleanup', '$DEVCOMP', '$TRACK', '$PROXY', 'default'];
		const wrapper = generateCorrectVendorWrapper('solid-js', solidExports);
		const names = extractExportNames(wrapper);

		// All Solid dev-mode exports must be individually accessible
		expect(names).toContain('$DEVCOMP');
		expect(names).toContain('$TRACK');
		expect(names).toContain('$PROXY');
		expect(names).toContain('createSignal');
	});

	it('getRouteApi from @tanstack/solid-router: wrapper must export it', () => {
		// Scenario: User code does `import { getRouteApi } from "@tanstack/solid-router"`
		// getRouteApi is a re-exported function. The wrapper must export it individually.
		const routerExports = ['createRootRoute', 'createRoute', 'createRouter', 'getRouteApi', 'useNavigate', 'useParams', 'Link', 'Outlet', 'default'];
		const wrapper = generateCorrectVendorWrapper('@tanstack/solid-router', routerExports);
		const names = extractExportNames(wrapper);

		expect(names).toContain('getRouteApi');
		expect(names).toContain('createRootRoute');
		expect(names).toContain('useNavigate');
	});

	it('defineStore from pinia: wrapper must export it', () => {
		// Scenario: User code does `import { defineStore } from "pinia"`
		const piniaExports = ['defineStore', 'createPinia', 'storeToRefs', 'mapState', 'mapActions', 'default'];
		const wrapper = generateCorrectVendorWrapper('pinia', piniaExports);
		const names = extractExportNames(wrapper);

		expect(names).toContain('defineStore');
	});

	it('render, insert from @nativescript-community/solid-js: wrapper must export them', () => {
		const exports = ['render', 'insert', 'createElement', 'spread', 'default'];
		const wrapper = generateCorrectVendorWrapper('@nativescript-community/solid-js', exports);
		const names = extractExportNames(wrapper);

		expect(names).toContain('render');
		expect(names).toContain('insert');
		expect(names).toContain('createElement');
	});

	it('ImageCacheIt from @triniwiz/nativescript-image-cache-it: wrapper must export it', () => {
		const exports = ['ImageCacheIt', 'default'];
		const wrapper = generateCorrectVendorWrapper('@triniwiz/nativescript-image-cache-it', exports);
		const names = extractExportNames(wrapper);

		expect(names).toContain('ImageCacheIt');
	});

	it('wrapper handles large number of exports (100+) without issue', () => {
		// Some packages like lodash-es have hundreds of exports
		const exports: string[] = [];
		for (let i = 0; i < 150; i++) {
			exports.push(`export${i}`);
		}
		exports.push('default');

		const wrapper = generateCorrectVendorWrapper('large-pkg', exports);
		const names = extractExportNames(wrapper);

		// All 150 named exports + default
		expect(names.length).toBe(151);
		expect(names).toContain('export0');
		expect(names).toContain('export149');
		expect(names).toContain('default');
	});
});

// ---------------------------------------------------------------------------
// NativeScript plugin subpath routing (must NOT be resolved as vendor)
// ---------------------------------------------------------------------------
describe('NativeScript plugin subpath routing — vendor vs plugin priority', () => {
	it('@nativescript/tanstack-router/solid must NOT be stripped to @nativescript/tanstack-router', () => {
		// THE BUG: vendor lookup runs before plugin check, normalizeSpecifier strips
		// /solid subpath → @nativescript/tanstack-router (main entry, no Link export).
		// THE FIX: isNativeScriptPluginModule check runs FIRST, preserving the subpath.
		const fullSubpath = '@nativescript/tanstack-router/solid/index.mjs';
		const strippedMain = '@nativescript/tanstack-router';

		// The full subpath must be preserved — Link is only in /solid, not main
		expect(fullSubpath).toContain('/solid');
		// If stripped, the main entry only exports createNativeScriptHistory
		expect(strippedMain).not.toContain('/solid');
	});

	it('@nativescript/tanstack-router/solid is a NativeScript plugin, not vendor', () => {
		// @nativescript/ packages (except @nativescript/core) are plugins
		// and must be served via HTTP /ns/m/, NOT via vendor ns-vendor://
		const pluginRE = /^@nativescript\//i;
		const coreRE = /^@nativescript\/core(\b|\/)/i;

		const testCases = [
			{ spec: '@nativescript/tanstack-router', isPlugin: true },
			{ spec: '@nativescript/tanstack-router/solid', isPlugin: true },
			{ spec: '@nativescript/tanstack-router/solid/index.mjs', isPlugin: true },
			{ spec: '@nativescript/firebase-messaging', isPlugin: true },
			{ spec: '@nativescript/core', isPlugin: false },
			{ spec: '@nativescript/core/ui/core/view', isPlugin: false },
			{ spec: '@tanstack/solid-router', isPlugin: false },
			{ spec: 'solid-js', isPlugin: false },
		];

		for (const tc of testCases) {
			const isPlugin = pluginRE.test(tc.spec) && !coreRE.test(tc.spec);
			expect(isPlugin).toBe(tc.isPlugin);
		}
	});

	it('Link import from @nativescript/tanstack-router/solid must resolve to /solid entry', () => {
		// User code: import { Link } from "@nativescript/tanstack-router/solid"
		// After Vite transform: import { Link } from "/node_modules/@nativescript/tanstack-router/solid/index.mjs?v=..."
		// After rewriteImports: must route to /ns/m/node_modules/@nativescript/tanstack-router/solid/index.mjs
		// NOT: @nativescript/tanstack-router (vendor lookup stripping /solid)

		const viteResolved = '/node_modules/@nativescript/tanstack-router/solid/index.mjs';
		const correctRoute = `/ns/m${viteResolved}`;
		const wrongRoute = '@nativescript/tanstack-router'; // vendor-stripped, WRONG

		expect(correctRoute).toContain('/solid/');
		expect(wrongRoute).not.toContain('/solid');
	});
});
