import { describe, it, expect } from 'vitest';
import { synthesizeDefaultExport, isDeepCoreSubpath, normalizeAnyCoreSpecToBridge, rewriteSpecifiersForDevice } from './core-sanitize';

// ─── rewriteSpecifiersForDevice ────────────────────────────────────────────────
// Tests use REAL Vite output captured from the live dev server.

const ORIGIN = 'http://localhost:5173';
const VER = 0;

describe('rewriteSpecifiersForDevice', () => {
	it('rewrites core named import specifier to bridge URL', () => {
		const input = 'import { Observable } from "/node_modules/@nativescript/core/data/observable/index.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('import { Observable } from "/ns/core/0?p=data/observable/index.js";');
	});

	it('rewrites core namespace import specifier', () => {
		const input = 'import * as types from "/node_modules/@nativescript/core/utils/types.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('import * as types from "/ns/core/0?p=utils/types.js";');
	});

	it('rewrites core named re-export specifier', () => {
		const input = 'export { booleanConverter } from "/node_modules/@nativescript/core/ui/core/view-base/utils.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('export { booleanConverter } from "/ns/core/0?p=ui/core/view-base/utils.js";');
	});

	it('rewrites core star re-export specifier', () => {
		const input = 'export * from "/node_modules/@nativescript/core/accessibility/accessibility-common.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe('export * from "/ns/core/0?p=accessibility/accessibility-common.js";');
	});

	it('does NOT mangle code structure — preserves newlines before exports (the styling-profile.js bug)', () => {
		// This is the EXACT Vite output that the old pipeline broke
		const input = ['// This file exists to break cycles caused by importing profiling into style-scope.ts.', '// Only put the @profile decorator and related logic here.', 'export { profile } from "/node_modules/@nativescript/core/profiling/index.js";'].join('\n');
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		// The export MUST be on its own line, NOT concatenated with the comment
		const lines = out.split('\n');
		expect(lines[2]).toMatch(/^export \{ profile \}/);
		expect(out).toContain('export { profile } from "/ns/core/0?p=profiling/index.js"');
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

	it('leaves already-bridge URLs unchanged', () => {
		const input = 'import { X } from "/ns/core/0?p=data/observable/index.js";';
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);
		expect(out).toBe(input);
	});

	it('handles a real module with mixed import patterns (view-base)', () => {
		const input = ['import { Trace } from "/node_modules/@nativescript/core/ui/styling/styling-shared.js";', 'import { Property } from "/node_modules/@nativescript/core/ui/core/properties/index.js";', 'import { profile } from "/node_modules/@nativescript/core/profiling/index.js";', 'export { booleanConverter } from "/node_modules/@nativescript/core/ui/core/view-base/utils.js";', 'export function getAncestor(view, criterion) {', 'export class ViewBase extends Observable {'].join('\n');
		const out = rewriteSpecifiersForDevice(input, ORIGIN, VER);

		// All core specifiers rewritten to bridge
		expect(out).toContain('from "/ns/core/0?p=ui/styling/styling-shared.js"');
		expect(out).toContain('from "/ns/core/0?p=ui/core/properties/index.js"');
		expect(out).toContain('from "/ns/core/0?p=profiling/index.js"');
		expect(out).toContain('from "/ns/core/0?p=ui/core/view-base/utils.js"');

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
		expect(out).toContain('import("/ns/core/0?p=profiling/index.js")');
	});

	it('preserves version in output URL', () => {
		const out = rewriteSpecifiersForDevice('import { X } from "/node_modules/@nativescript/core/foo.js";', ORIGIN, 42);
		expect(out).toContain('/ns/core/42?p=foo.js');
	});
});

// ─── isDeepCoreSubpath ─────────────────────────────────────────────────────────

describe('isDeepCoreSubpath', () => {
	// Deep subpaths: ?p= value contains '/' → real ESM modules, skip destructuring
	it('returns true for deep subpath with nested path', () => {
		expect(isDeepCoreSubpath('/ns/core?p=data/observable-array/index.js')).toBe(true);
	});

	it('returns true for versioned deep subpath', () => {
		expect(isDeepCoreSubpath('/ns/core/0?p=ui/core/view-base/index.js')).toBe(true);
	});

	it('returns true for HTTP origin deep subpath', () => {
		expect(isDeepCoreSubpath('http://localhost:5173/ns/core/0?p=ui/core/view-base/index.js')).toBe(true);
	});

	it('returns true for two-segment deep subpath', () => {
		expect(isDeepCoreSubpath('/ns/core?p=data/observable')).toBe(true);
	});

	// Shallow subpaths: ?p= value has NO '/' → proxy bridge, must destructure
	it('returns false for shallow subpath (index.js)', () => {
		expect(isDeepCoreSubpath('/ns/core?p=index.js')).toBe(false);
	});

	it('returns false for shallow subpath (globals)', () => {
		expect(isDeepCoreSubpath('/ns/core?p=globals')).toBe(false);
	});

	// No subpath: main bridge, must destructure
	it('returns false for main bridge (no query)', () => {
		expect(isDeepCoreSubpath('/ns/core')).toBe(false);
	});

	it('returns false for versioned main bridge', () => {
		expect(isDeepCoreSubpath('/ns/core/0')).toBe(false);
	});

	it('returns false for HTTP origin main bridge', () => {
		expect(isDeepCoreSubpath('http://localhost:5173/ns/core')).toBe(false);
	});

	// Edge cases
	it('returns false for empty string', () => {
		expect(isDeepCoreSubpath('')).toBe(false);
	});

	it('returns false for unrelated URL', () => {
		expect(isDeepCoreSubpath('/ns/m/node_modules/rxjs/index.js')).toBe(false);
	});

	it('handles ?p= with hash fragment', () => {
		expect(isDeepCoreSubpath('/ns/core?p=ui/core/view#L10')).toBe(true);
	});
});

// ─── Deep subpath skip: simulated ensureDestructureCoreImports behavior ────────
// These tests simulate the regex + isDeepCoreSubpath logic to verify correctness
// without needing to export the internal function.

describe('deep subpath skip in core named-import destructuring', () => {
	// Simulate the core of ensureDestructureCoreImports
	function simulateDestructureRewrite(code: string): string {
		let result = code;
		let counter = 0;
		const re = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
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

	it('rewrites named import from shallow subpath', () => {
		const input = 'import { isAndroid } from "/ns/core?p=index.js";';
		const out = simulateDestructureRewrite(input);
		expect(out).toContain('import __ns_core_ns_re from');
		expect(out).toContain('const { isAndroid }');
	});

	it('SKIPS named import from deep subpath (preserves named import)', () => {
		const input = 'import { ObservableArray } from "/ns/core?p=data/observable-array/index.js";';
		const out = simulateDestructureRewrite(input);
		// Should be unchanged — deep subpath has real named exports
		expect(out).toBe(input);
	});

	it('SKIPS versioned deep subpath', () => {
		const input = 'import { View } from "/ns/core/0?p=ui/core/view-base/index.js";';
		const out = simulateDestructureRewrite(input);
		expect(out).toBe(input);
	});

	it('SKIPS HTTP origin deep subpath', () => {
		const input = 'import { booleanConverter } from "http://localhost:5173/ns/core/0?p=ui/core/view-base/utils.js";';
		const out = simulateDestructureRewrite(input);
		expect(out).toBe(input);
	});

	it('handles mixed shallow and deep subpaths in same file', () => {
		const input = ['import { Frame } from "/ns/core";', 'import { View } from "/ns/core?p=ui/core/view-base/index.js";', 'import { isAndroid } from "/ns/core?p=index.js";'].join('\n');
		const out = simulateDestructureRewrite(input);

		// Main bridge import: SHOULD be rewritten
		expect(out).toContain('import __ns_core_ns_re from "/ns/core"');
		expect(out).toContain('const { Frame } = __ns_core_ns_re');

		// Deep subpath: should NOT be rewritten
		expect(out).toContain('import { View } from "/ns/core?p=ui/core/view-base/index.js"');

		// Shallow subpath: SHOULD be rewritten
		expect(out).toContain('const { isAndroid }');
	});

	it('is idempotent — applying twice produces identical output', () => {
		const input = ['import { Frame } from "/ns/core";', 'import { View } from "/ns/core?p=ui/core/view-base/index.js";'].join('\n');
		const pass1 = simulateDestructureRewrite(input);
		const pass2 = simulateDestructureRewrite(pass1);
		expect(pass1).toBe(pass2);
	});

	it('multiple deep subpath imports all preserved', () => {
		const input = ['import { Observable } from "/ns/core?p=data/observable/index.js";', 'import { ObservableArray } from "/ns/core?p=data/observable-array/index.js";', 'import { View } from "/ns/core?p=ui/core/view-base/index.js";'].join('\n');
		const out = simulateDestructureRewrite(input);
		// All three should be preserved as-is
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
		const re = /(^|\n)\s*import\s*\{([^}]+)\}\s*from\s*["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[\d]+)?(?:\?p=[^"']+)?)['"];?\s*/gm;
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

	it('bare deep subpath → bridge URL + named import preserved', () => {
		const input = 'import { ObservableArray } from "@nativescript/core/data/observable-array";';
		const out = pipeline(input);
		// Should be converted to bridge URL but NOT destructured
		expect(out).toContain('/ns/core?p=data/observable-array');
		expect(out).toContain('import { ObservableArray }');
		expect(out).not.toContain('const { ObservableArray }');
	});

	it('resolved node_modules path → bridge URL + named import preserved', () => {
		const input = 'import { View } from "/node_modules/@nativescript/core/ui/core/view-base/index.js";';
		const out = pipeline(input);
		expect(out).toContain('/ns/core?p=ui/core/view-base/index.js');
		expect(out).toContain('import { View }');
		expect(out).not.toContain('const { View }');
	});

	it('mixed: main entry destructured + deep subpath preserved', () => {
		const input = ['import { Application } from "@nativescript/core";', 'import { View } from "@nativescript/core/ui/core/view-base";'].join('\n');
		const out = pipeline(input);

		// Main entry should be destructured
		expect(out).toContain('const { Application }');

		// Deep subpath should keep named import
		expect(out).toContain('import { View } from "/ns/core?p=ui/core/view-base"');
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
