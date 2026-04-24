import { describe, it, expect } from 'vitest';
import { synthesizeDefaultExport, isDeepCoreSubpath, normalizeAnyCoreSpecToBridge, rewriteSpecifiersForDevice } from './core-sanitize';

// ─── rewriteSpecifiersForDevice ────────────────────────────────────────────────
// Tests use REAL Vite output captured from the live dev server.
//
// All @nativescript/core specifiers are rewritten to the CANONICAL
// `/ns/core/<sub>` path form (no version, no `?p=`, no `.js` tail). See
// HMR_CORE_REALM_DETERMINISTIC_PLAN.md — Invariant A requires byte-
// identical URLs across every emitter; the legacy versioned / query-param
// form has been deleted.

const ORIGIN = 'http://localhost:5173';
const VER = 0;

describe('rewriteSpecifiersForDevice', () => {
	it('rewrites core named import specifier to bridge URL', () => {
		const input = 'import { Observable } from "/node_modules/@nativescript/core/data/observable/index.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('import { Observable } from "/ns/core/data/observable";');
	});

	it('rewrites core namespace import specifier', () => {
		const input = 'import * as types from "/node_modules/@nativescript/core/utils/types.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('import * as types from "/ns/core/utils/types";');
	});

	it('rewrites core named re-export specifier', () => {
		const input = 'export { booleanConverter } from "/node_modules/@nativescript/core/ui/core/view-base/utils.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('export { booleanConverter } from "/ns/core/ui/core/view-base/utils";');
	});

	it('rewrites core star re-export specifier', () => {
		const input = 'export * from "/node_modules/@nativescript/core/accessibility/accessibility-common.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('export * from "/ns/core/accessibility/accessibility-common";');
	});

	it('does NOT mangle code structure — preserves newlines before exports (the styling-profile.js bug)', () => {
		// This is the EXACT Vite output that the old pipeline broke
		const input = ['// This file exists to break cycles caused by importing profiling into style-scope.ts.', '// Only put the @profile decorator and related logic here.', 'export { profile } from "/node_modules/@nativescript/core/profiling/index.js";'].join('\n');
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		// The export MUST be on its own line, NOT concatenated with the comment
		const lines = out.split('\n');
		expect(lines[2]).toMatch(/^export \{ profile \}/);
		expect(out).toContain('export { profile } from "/ns/core/profiling"');
	});

	it('rewrites non-core node_modules to HTTP URLs', () => {
		const input = 'import { something } from "/node_modules/rxjs/dist/esm/index.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe(`import { something } from "${ORIGIN}/ns/m/node_modules/rxjs/dist/esm/index.js";`);
	});

	it('does NOT touch export class/function declarations (no specifier)', () => {
		const input = 'export class ObservableArray extends Observable {';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe(input);
	});

	it('leaves already-canonical bridge URLs unchanged', () => {
		const input = 'import { X } from "/ns/core/data/observable";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe(input);
	});

	it('handles a real module with mixed import patterns (view-base)', () => {
		const input = ['import { Trace } from "/node_modules/@nativescript/core/ui/styling/styling-shared.js";', 'import { Property } from "/node_modules/@nativescript/core/ui/core/properties/index.js";', 'import { profile } from "/node_modules/@nativescript/core/profiling/index.js";', 'export { booleanConverter } from "/node_modules/@nativescript/core/ui/core/view-base/utils.js";', 'export function getAncestor(view, criterion) {', 'export class ViewBase extends Observable {'].join('\n');
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);

		// All core specifiers rewritten to bridge
		expect(out).toContain('from "/ns/core/ui/styling/styling-shared"');
		expect(out).toContain('from "/ns/core/ui/core/properties"');
		expect(out).toContain('from "/ns/core/profiling"');
		expect(out).toContain('from "/ns/core/ui/core/view-base/utils"');

		// Declarations untouched
		expect(out).toContain('export function getAncestor');
		expect(out).toContain('export class ViewBase');

		// Named imports preserved (NOT converted to default + destructure)
		expect(out).toContain('import { Trace }');
		expect(out).toContain('import { Property }');
		expect(out).toContain('export { booleanConverter }');
	});

	it('handles dynamic imports', () => {
		const input = 'const mod = await import("/node_modules/@nativescript/core/profiling/index.js");';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toContain('import("/ns/core/profiling")');
	});

	it('does NOT include a version segment in the output URL', () => {
		// Invariant A: versioning was deleted. The rewrite emits the
		// canonical `/ns/core/<sub>` form regardless of the `ver` argument.
		// Any legacy caller passing a non-zero ver receives an unversioned
		// URL so iOS's HTTP ESM cache sees one identity per logical module.
		const out = rewriteSpecifiersForDevice('import { X } from "/node_modules/@nativescript/core/foo.js";', ORIGIN, 42);
		expect(out).toContain('/ns/core/foo');
		expect(out).not.toMatch(/\/ns\/core\/\d+/);
		expect(out).not.toContain('?p=');
	});

	it('rewrites the package main entry file to the main core bridge URL', () => {
		const out = rewriteSpecifiersForDevice('import { AbsoluteLayout } from "/node_modules/@nativescript/core/index.js";', ORIGIN, 42);
		expect(out).toBe('import { AbsoluteLayout } from "/ns/core";');
	});
});

// ─── isDeepCoreSubpath ─────────────────────────────────────────────────────────

describe('isDeepCoreSubpath', () => {
	// Canonical path form is the authoritative shape. Both forms must be
	// supported for back-compat with legacy call sites that still carry
	// a `?p=` query URL.
	it('returns true for canonical deep subpath with nested path', () => {
		expect(isDeepCoreSubpath('/ns/core/data/observable-array')).toBe(true);
	});

	it('returns true for legacy ?p= deep subpath (back-compat)', () => {
		expect(isDeepCoreSubpath('/ns/core?p=data/observable-array/index.js')).toBe(true);
	});

	it('returns true for legacy versioned deep subpath (back-compat)', () => {
		expect(isDeepCoreSubpath('/ns/core/0?p=ui/core/view-base/index.js')).toBe(true);
	});

	it('returns true for HTTP origin deep subpath', () => {
		expect(isDeepCoreSubpath('http://localhost:5173/ns/core/ui/core/view-base')).toBe(true);
	});

	it('returns true for two-segment deep subpath', () => {
		expect(isDeepCoreSubpath('/ns/core/data/observable')).toBe(true);
	});

	it('returns false for package main entry alias (legacy ?p=index.js)', () => {
		expect(isDeepCoreSubpath('/ns/core?p=index.js')).toBe(false);
	});

	it('returns true for shallow subpath (globals)', () => {
		expect(isDeepCoreSubpath('/ns/core/globals')).toBe(true);
	});

	it('returns false for main bridge (no query, no sub)', () => {
		expect(isDeepCoreSubpath('/ns/core')).toBe(false);
	});

	it('returns false for HTTP origin main bridge', () => {
		expect(isDeepCoreSubpath('http://localhost:5173/ns/core')).toBe(false);
	});

	it('returns false for empty string', () => {
		expect(isDeepCoreSubpath('')).toBe(false);
	});

	it('returns false for unrelated URL', () => {
		expect(isDeepCoreSubpath('/ns/m/node_modules/rxjs/index.js')).toBe(false);
	});

	it('handles legacy ?p= with hash fragment', () => {
		expect(isDeepCoreSubpath('/ns/core?p=ui/core/view#L10')).toBe(true);
	});
});

// ─── Deep subpath skip: simulated ensureDestructureCoreImports behavior ────────
// These tests simulate the regex + isDeepCoreSubpath logic to verify correctness
// without needing to export the internal function.

describe('deep subpath skip in core named-import destructuring', () => {
	// Simulate the core of ensureDestructureCoreImports. The regex
	// accepts both the canonical path form (/ns/core/<sub>) and the
	// legacy query form (/ns/core?p=<sub>) so older fixtures and
	// emitters still round-trip correctly during the migration window.
	function simulateDestructureRewrite(code: string): string {
		let result = code;
		let counter = 0;
		const re = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"'?#]*)?(?:\?p=[^"']+)?)['"];?\s*/gm;
		result = result.replace(re, (_full, pfx: string, specList: string, src: string) => {
			if (isDeepCoreSubpath(src)) return _full;
			const tmp = `__ns_core_ns_re${counter > 0 ? `_${counter}` : ''}`;
			counter++;
			return `${pfx}import ${tmp} from ${JSON.stringify(src)};\nconst { ${specList.trim()} } = ${tmp};\n`;
		});
		return result;
	}

	it('rewrites named import from main bridge to default + destructure', () => {
		const input = 'import { Frame } from "/ns/core";';
		const out = simulateDestructureRewrite(input);
		expect(out).toContain('import __ns_core_ns_re from "/ns/core"');
		expect(out).toContain('const { Frame } = __ns_core_ns_re');
		expect(out).not.toContain('import { Frame }');
	});

	it('rewrites named import from legacy package main entry alias to default + destructure', () => {
		const input = 'import { isAndroid } from "/ns/core?p=index.js";';
		const out = simulateDestructureRewrite(input);
		expect(out).toContain('import __ns_core_ns_re from "/ns/core?p=index.js"');
		expect(out).toContain('const { isAndroid } = __ns_core_ns_re');
	});

	it('SKIPS named import from canonical deep subpath (preserves named import)', () => {
		const input = 'import { ObservableArray } from "/ns/core/data/observable-array";';
		const out = simulateDestructureRewrite(input);
		expect(out).toBe(input);
	});

	it('SKIPS legacy ?p= deep subpath (back-compat)', () => {
		const input = 'import { View } from "/ns/core?p=ui/core/view-base/index.js";';
		const out = simulateDestructureRewrite(input);
		expect(out).toBe(input);
	});

	it('SKIPS HTTP origin deep subpath', () => {
		const input = 'import { booleanConverter } from "http://localhost:5173/ns/core/ui/core/view-base/utils";';
		const out = simulateDestructureRewrite(input);
		expect(out).toBe(input);
	});

	it('handles mixed shallow and deep subpaths in same file', () => {
		const input = ['import { Frame } from "/ns/core";', 'import { View } from "/ns/core/ui/core/view-base";', 'import { isAndroid } from "/ns/core?p=index.js";'].join('\n');
		const out = simulateDestructureRewrite(input);

		// Main bridge import: SHOULD be rewritten
		expect(out).toContain('import __ns_core_ns_re from "/ns/core"');
		expect(out).toContain('const { Frame } = __ns_core_ns_re');

		// Deep subpath: should NOT be rewritten
		expect(out).toContain('import { View } from "/ns/core/ui/core/view-base"');

		// Legacy package main entry alias: SHOULD be rewritten like the main bridge
		expect(out).toContain('const { isAndroid } = __ns_core_ns_re_1');
	});

	it('is idempotent — applying twice produces identical output', () => {
		const input = ['import { Frame } from "/ns/core";', 'import { View } from "/ns/core/ui/core/view-base";'].join('\n');
		const pass1 = simulateDestructureRewrite(input);
		const pass2 = simulateDestructureRewrite(pass1);
		expect(pass1).toBe(pass2);
	});

	it('multiple deep subpath imports all preserved', () => {
		const input = ['import { Observable } from "/ns/core/data/observable";', 'import { ObservableArray } from "/ns/core/data/observable-array";', 'import { View } from "/ns/core/ui/core/view-base";'].join('\n');
		const out = simulateDestructureRewrite(input);
		expect(out).toBe(input);
	});
});

// ─── normalizeAnyCoreSpecToBridge + deep subpath interaction ───────────────────

describe('normalizeAnyCoreSpecToBridge → deep subpath skip pipeline', () => {
	function pipeline(code: string): string {
		// Step 1: Normalize @nativescript/core to /ns/core bridge URLs
		let result = normalizeAnyCoreSpecToBridge(code);
		// Step 2: Simulate destructure pass (with deep subpath skip)
		let counter = 0;
		const re = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"'?#]*)?(?:\?p=[^"']+)?)['"];?\s*/gm;
		result = result.replace(re, (_full, pfx: string, specList: string, src: string) => {
			if (isDeepCoreSubpath(src)) return _full;
			const tmp = `__ns_core_${counter++}`;
			return `${pfx}import ${tmp} from ${JSON.stringify(src)};\nconst { ${specList.trim()} } = ${tmp};\n`;
		});
		return result;
	}

	it('bare @nativescript/core → bridge + destructure', () => {
		const input = 'import { Frame } from "@nativescript/core";';
		const out = pipeline(input);
		expect(out).toContain('import __ns_core_0 from "/ns/core"');
		expect(out).toContain('const { Frame } = __ns_core_0');
	});

	it('bare @nativescript/core/index.js → main bridge + destructure', () => {
		const input = 'import { AbsoluteLayout } from "@nativescript/core/index.js";';
		const out = pipeline(input);
		expect(out).toContain('import __ns_core_0 from "/ns/core"');
		expect(out).toContain('const { AbsoluteLayout } = __ns_core_0');
		expect(out).not.toContain('/ns/core?p=index.js');
		expect(out).not.toContain('/ns/core/index');
	});

	it('bare deep subpath → canonical bridge URL + named import preserved', () => {
		const input = 'import { ObservableArray } from "@nativescript/core/data/observable-array";';
		const out = pipeline(input);
		expect(out).toContain('/ns/core/data/observable-array');
		expect(out).toContain('import { ObservableArray }');
		expect(out).not.toContain('const { ObservableArray }');
	});

	it('resolved node_modules path → canonical bridge URL + named import preserved', () => {
		const input = 'import { View } from "/node_modules/@nativescript/core/ui/core/view-base/index.js";';
		const out = pipeline(input);
		expect(out).toContain('/ns/core/ui/core/view-base');
		expect(out).toContain('import { View }');
		expect(out).not.toContain('const { View }');
	});

	it('mixed: main entry destructured + deep subpath preserved', () => {
		const input = ['import { Application } from "@nativescript/core";', 'import { View } from "@nativescript/core/ui/core/view-base";'].join('\n');
		const out = pipeline(input);

		expect(out).toContain('const { Application }');
		expect(out).toContain('import { View } from "/ns/core/ui/core/view-base"');
	});

	it('pipeline is idempotent on output', () => {
		const input = ['import { Application } from "@nativescript/core";', 'import { View } from "@nativescript/core/ui/core/view-base";'].join('\n');
		const pass1 = pipeline(input);
		const pass2 = pipeline(pass1);
		expect(pass1).toBe(pass2);
	});
});

// ─── synthesizeDefaultExport (kept as utility) ────────────────────────────────

describe('synthesizeDefaultExport', () => {
	it('synthesizes default for export class declarations', () => {
		const input = ['import { Observable } from "../observable";', 'export class ChangeType { }', 'export class ObservableArray extends Observable { }'].join('\n');
		const out = synthesizeDefaultExport(input);
		expect(out).toContain('export { __ns_default_export as default }');
		expect(out).toMatch(/var __ns_default_export = \{[^}]*ChangeType[^}]*ObservableArray[^}]*\}/);
	});

	it('synthesizes default for export function and const', () => {
		const input = ['export function fromObject(source) { return source; }', 'export const CHANGE = "change";'].join('\n');
		const out = synthesizeDefaultExport(input);
		expect(out).toContain('export { __ns_default_export as default }');
		expect(out).toContain('fromObject');
		expect(out).toContain('CHANGE');
	});

	it('synthesizes default for named re-exports', () => {
		const input = 'export { AbsoluteLayout } from "/path/absolute-layout.js";';
		const out = synthesizeDefaultExport(input);
		expect(out).toContain('import { AbsoluteLayout }');
		expect(out).toContain('export { __ns_default_export as default }');
	});

	it('synthesizes default for star re-exports', () => {
		const input = 'export * from "/path/accessibility-common.js";';
		const out = synthesizeDefaultExport(input);
		expect(out).toContain('import * as __ns_star_0');
		expect(out).toContain('...__ns_star_0');
	});

	it('returns unchanged if already has export default', () => {
		const input = 'export class Foo { }\nexport default Foo;';
		expect(synthesizeDefaultExport(input)).toBe(input);
	});

	it('returns unchanged if has CJS exports', () => {
		const input = 'module.exports = { a: 1 };';
		expect(synthesizeDefaultExport(input)).toBe(input);
	});

	it('returns unchanged for side-effect-only module', () => {
		const input = 'import "./polyfill.js";\nconsole.log("loaded");';
		expect(synthesizeDefaultExport(input)).toBe(input);
	});

	it('deduplicates exports with the same name', () => {
		const input = 'export class Foo { }\nexport { Foo };';
		const out = synthesizeDefaultExport(input);
		const obj = out.match(/var __ns_default_export = \{([^}]*)\}/)?.[1] || '';
		expect((obj.match(/\bFoo\b/g) || []).length).toBe(1);
	});
});
