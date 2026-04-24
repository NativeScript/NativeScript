import { describe, expect, it } from 'vitest';
import { buildDefaultExportFooter, buildShapeInstallHeader, hasExistingDefaultExport, hasNamespaceReExport, rewriteNamespaceReExportsForShape } from './ns-core-cjs-shape.js';

describe('ns-core-cjs-shape', () => {
	describe('buildShapeInstallHeader', () => {
		it('produces a string that installs __NS_CJS_SHAPE__ globally', () => {
			const header = buildShapeInstallHeader();
			expect(header).toContain('__NS_CJS_SHAPE__');
			expect(header).toContain('__NS_CJS_SHAPE_CACHE__');
			expect(header).toContain('WeakMap');
		});

		it('emits idempotent install (reuses existing function when already set)', () => {
			const header = buildShapeInstallHeader();
			// The conditional pattern we emit uses `||` style cache reuse and
			// a `typeof ... !== 'function'` guard for the installer itself.
			expect(header).toMatch(/typeof globalThis\.__NS_CJS_SHAPE__ !== 'function'/);
			expect(header).toMatch(/__NS_CJS_SHAPE_CACHE__ \|\| \(globalThis\.__NS_CJS_SHAPE_CACHE__/);
		});

		it('wraps install in try/catch to avoid breaking module eval on unexpected errors', () => {
			const header = buildShapeInstallHeader();
			expect(header).toMatch(/^\/\*[\s\S]*?\*\/[\s\S]*try \{/);
			expect(header).toMatch(/\} catch \(e\) \{[\s\S]*console\.warn[\s\S]*\}/);
		});

		it('shape function is recursive on null-proto namespaces', () => {
			const header = buildShapeInstallHeader();
			// Recursion surfaces as a call to __nsShape(obj[k]) in the
			// per-property loop body.
			expect(header).toContain('__nsShape(obj[k])');
		});

		it('shape function respects Object.prototype inheritors (passes them through)', () => {
			const header = buildShapeInstallHeader();
			// The early-return guard: if the object has a non-null prototype
			// AND is not an ESM Module, return as-is.
			expect(header).toMatch(/if \(proto !== null && !isNsModule\) return obj;/);
		});

		it('evaluates to a working runtime: shape wraps null-proto to plain object', () => {
			const header = buildShapeInstallHeader();
			const g: any = {};
			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			new Function('globalThis', header)(g);

			expect(typeof g.__NS_CJS_SHAPE__).toBe('function');

			const rawNs = Object.create(null);
			rawNs[Symbol.toStringTag] = 'Module';
			rawNs.mainThreadify = () => 'ok';
			rawNs.other = 123;

			const shaped = g.__NS_CJS_SHAPE__(rawNs);
			expect(Object.getPrototypeOf(shaped)).toBe(Object.prototype);
			expect(typeof shaped.hasOwnProperty).toBe('function');
			expect(shaped.hasOwnProperty('mainThreadify')).toBe(true);
			expect(shaped.other).toBe(123);
		});

		it('evaluates to a working runtime: shape is identity-preserving', () => {
			const header = buildShapeInstallHeader();
			const g: any = {};
			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			new Function('globalThis', header)(g);

			const rawNs = Object.create(null);
			rawNs[Symbol.toStringTag] = 'Module';
			rawNs.a = 1;

			const s1 = g.__NS_CJS_SHAPE__(rawNs);
			const s2 = g.__NS_CJS_SHAPE__(rawNs);
			expect(s1).toBe(s2);

			// Mutations stick across lookups — this is what zone.js needs.
			s1.mutated = 'yes';
			expect(g.__NS_CJS_SHAPE__(rawNs).mutated).toBe('yes');
		});

		it('evaluates to a working runtime: shape is recursive on nested namespaces', () => {
			const header = buildShapeInstallHeader();
			const g: any = {};
			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			new Function('globalThis', header)(g);

			const inner = Object.create(null);
			inner[Symbol.toStringTag] = 'Module';
			inner.nested = 'deep';

			const outer = Object.create(null);
			outer[Symbol.toStringTag] = 'Module';
			outer.Inner = inner;

			const shaped = g.__NS_CJS_SHAPE__(outer);
			expect(Object.getPrototypeOf(shaped)).toBe(Object.prototype);
			expect(Object.getPrototypeOf(shaped.Inner)).toBe(Object.prototype);
			expect(shaped.Inner.nested).toBe('deep');
		});

		it('evaluates to a working runtime: passes through regular objects unchanged', () => {
			const header = buildShapeInstallHeader();
			const g: any = {};
			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			new Function('globalThis', header)(g);

			const plain = { foo: 'bar' };
			const klass = new (class Foo {
				bar = 1;
			})();
			expect(g.__NS_CJS_SHAPE__(plain)).toBe(plain);
			expect(g.__NS_CJS_SHAPE__(klass)).toBe(klass);
			expect(g.__NS_CJS_SHAPE__(null)).toBe(null);
			expect(g.__NS_CJS_SHAPE__(42)).toBe(42);
			expect(g.__NS_CJS_SHAPE__('str')).toBe('str');
		});

		it('evaluates to a working runtime: cycles do not cause infinite recursion', () => {
			const header = buildShapeInstallHeader();
			const g: any = {};
			// eslint-disable-next-line @typescript-eslint/no-implied-eval
			new Function('globalThis', header)(g);

			const a = Object.create(null);
			a[Symbol.toStringTag] = 'Module';
			const b = Object.create(null);
			b[Symbol.toStringTag] = 'Module';
			a.b = b;
			b.a = a;

			const shapedA = g.__NS_CJS_SHAPE__(a);
			expect(Object.getPrototypeOf(shapedA)).toBe(Object.prototype);
			expect(Object.getPrototypeOf(shapedA.b)).toBe(Object.prototype);
			expect(shapedA.b.a).toBe(shapedA);
		});
	});

	describe('hasNamespaceReExport', () => {
		it('detects the ES2020 `export * as` form', () => {
			expect(hasNamespaceReExport(`export * as Utils from './utils';`)).toBe(true);
			expect(hasNamespaceReExport(`export * as Http from "./http";`)).toBe(true);
		});

		it('returns false for plain star re-exports (no alias)', () => {
			expect(hasNamespaceReExport(`export * from './application';`)).toBe(false);
		});

		it('returns false for named re-exports', () => {
			expect(hasNamespaceReExport(`export { Color } from './color';`)).toBe(false);
		});

		it('returns false for plain imports', () => {
			expect(hasNamespaceReExport(`import * as Utils from './utils';`)).toBe(false);
		});
	});

	describe('rewriteNamespaceReExportsForShape', () => {
		it('rewrites ES2020 `export * as X from "Y"` to shaped const export', () => {
			const input = `export * as Utils from './utils';`;
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toContain(`import * as __ns_re_Utils__ from './utils'`);
			expect(out).toContain(`export const Utils =`);
			expect(out).toContain(`(__ns_re_Utils__)`);
		});

		it('handles multiple re-exports in one source', () => {
			const input = [`export * as ApplicationSettings from './application-settings';`, `export * as Connectivity from './connectivity';`, `export * as Http from './http';`, `export * as Utils from './utils';`].join('\n');
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toContain(`__ns_re_ApplicationSettings__`);
			expect(out).toContain(`__ns_re_Connectivity__`);
			expect(out).toContain(`__ns_re_Http__`);
			expect(out).toContain(`__ns_re_Utils__`);
			expect(out).toContain(`export const ApplicationSettings =`);
			expect(out).toContain(`export const Utils =`);
		});

		it('handles double quotes and single quotes equally', () => {
			const inputDouble = `export * as Utils from "./utils";`;
			const outDouble = rewriteNamespaceReExportsForShape(inputDouble);
			expect(outDouble).toContain(`import * as __ns_re_Utils__ from "./utils"`);

			const inputSingle = `export * as Utils from './utils';`;
			const outSingle = rewriteNamespaceReExportsForShape(inputSingle);
			expect(outSingle).toContain(`import * as __ns_re_Utils__ from './utils'`);
		});

		it('preserves plain star re-exports unchanged', () => {
			const input = [`export * from './application';`, `export * from './core-types';`, `export * from './ui';`].join('\n');
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toBe(input);
		});

		it('preserves named re-exports unchanged', () => {
			const input = [`export { Color } from './color';`, `export { ObservableArray, ChangeType } from './data/observable-array';`].join('\n');
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toBe(input);
		});

		it('handles esbuild-transpiled form: import * as _x / export { _x as X }', () => {
			const input = [`import * as _utils from './utils';`, `export { _utils as Utils };`].join('\n');
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toContain(`import * as _utils from './utils'`);
			expect(out).toContain(`export const Utils =`);
			expect(out).toContain(`(_utils)`);
		});

		it('does NOT transform lowercase export aliases (user-level re-exports)', () => {
			const input = `export { _internal as myHelper };`;
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toBe(input);
		});

		it('does NOT transform non-underscore local names (avoids breaking user-level re-exports)', () => {
			const input = `export { internal as Public };`;
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toBe(input);
		});

		it('emits a shape expression that falls back to identity when globalThis.__NS_CJS_SHAPE__ is missing', () => {
			const input = `export * as Utils from './utils';`;
			const out = rewriteNamespaceReExportsForShape(input);
			// The fallback ternary makes the transform safe even when the
			// shape header has not been installed yet.
			expect(out).toMatch(/typeof globalThis\.__NS_CJS_SHAPE__ === 'function'/);
			expect(out).toMatch(/function \(x\) \{ return x; \}/);
		});

		it('preserves surrounding whitespace and line structure', () => {
			const input = [`// comment`, `export * as Utils from './utils';`, `const other = 1;`].join('\n');
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toMatch(/^\/\/ comment\n/);
			expect(out).toContain(`const other = 1;`);
		});

		it('integration: snippet with both forms gets both transformed', () => {
			// Vite may emit a mix of ES2020 and esbuild-transpiled forms
			// depending on plugins in the pipeline.
			const input = [`export * as Utils from './utils';`, `import * as _connectivity from './connectivity';`, `export { _connectivity as Connectivity };`].join('\n');
			const out = rewriteNamespaceReExportsForShape(input);
			expect(out).toContain(`__ns_re_Utils__`);
			expect(out).toContain(`export const Utils =`);
			expect(out).toContain(`export const Connectivity =`);
			expect(out).toContain(`(_connectivity)`);
		});

		it('integration: rewriting @nativescript/core/index.js snippet matches all namespace exports', () => {
			// Realistic snippet matching the actual core index.js.
			const input = [`import './globals';`, `export * from './application';`, `export { getNativeApp, setNativeApp } from './application/helpers-common';`, `export * as ApplicationSettings from './application-settings';`, `export { Color } from './color';`, `export * as Connectivity from './connectivity';`, `export * from './core-types';`, `export * as Http from './http';`, `export * from './trace';`, `export * as Utils from './utils';`, `export * from './ui';`].join('\n');
			const out = rewriteNamespaceReExportsForShape(input);

			// Namespaced re-exports ARE transformed.
			for (const name of ['ApplicationSettings', 'Connectivity', 'Http', 'Utils']) {
				expect(out).toContain(`import * as __ns_re_${name}__ from`);
				expect(out).toContain(`export const ${name} =`);
			}

			// Plain star re-exports are NOT transformed.
			expect(out).toContain(`export * from './application';`);
			expect(out).toContain(`export * from './core-types';`);
			expect(out).toContain(`export * from './trace';`);
			expect(out).toContain(`export * from './ui';`);

			// Named re-exports are NOT transformed.
			expect(out).toContain(`export { getNativeApp, setNativeApp } from './application/helpers-common';`);
			expect(out).toContain(`export { Color } from './color';`);

			// Side-effect imports preserved.
			expect(out).toContain(`import './globals';`);
		});
	});

	describe('hasExistingDefaultExport', () => {
		it('detects `export default <expression>` form', () => {
			expect(hasExistingDefaultExport(`export default something;`)).toBe(true);
			expect(hasExistingDefaultExport(`export default { a: 1 };`)).toBe(true);
			expect(hasExistingDefaultExport(`export default 42;`)).toBe(true);
		});

		it('detects `export default function` and `export default class` forms', () => {
			expect(hasExistingDefaultExport(`export default function foo() {}`)).toBe(true);
			expect(hasExistingDefaultExport(`export default async function foo() {}`)).toBe(true);
			expect(hasExistingDefaultExport(`export default class Foo {}`)).toBe(true);
		});

		it('detects `export { X as default }` form', () => {
			expect(hasExistingDefaultExport(`export { foo as default };`)).toBe(true);
			expect(hasExistingDefaultExport(`export { foo, bar as default };`)).toBe(true);
			expect(hasExistingDefaultExport(`export { default as default };`)).toBe(true);
		});

		it('detects `export { default }` shorthand', () => {
			expect(hasExistingDefaultExport(`export { default };`)).toBe(true);
			expect(hasExistingDefaultExport(`export { default, named };`)).toBe(true);
		});

		it('detects `export { default } from "other-module"` re-export', () => {
			expect(hasExistingDefaultExport(`export { default } from './other';`)).toBe(true);
			expect(hasExistingDefaultExport(`export { default as Foo } from './other';`)).toBe(true);
		});

		it('returns false for modules with no default export', () => {
			expect(hasExistingDefaultExport(`export const x = 1;`)).toBe(false);
			expect(hasExistingDefaultExport(`export function foo() {}`)).toBe(false);
			expect(hasExistingDefaultExport(`export class Foo {}`)).toBe(false);
			expect(hasExistingDefaultExport(`export { a, b };`)).toBe(false);
			expect(hasExistingDefaultExport(`export * from './other';`)).toBe(false);
			expect(hasExistingDefaultExport(`export * as X from './other';`)).toBe(false);
		});

		it('does not false-positive on the string "default" in non-export contexts', () => {
			expect(hasExistingDefaultExport(`const x = { default: 1 };`)).toBe(false);
			expect(hasExistingDefaultExport(`function defaultBehavior() {}`)).toBe(false);
			expect(hasExistingDefaultExport(`const defaultValue = 42;`)).toBe(false);
			// Destructuring that merely uses the name 'default' as a property
			// is fine — no export keyword in sight.
			expect(hasExistingDefaultExport(`const { default: d } = obj;`)).toBe(false);
		});

		it('known limitation: comments containing `export default` are treated as a default export', () => {
			// We use a lightweight regex rather than a full parser. If a
			// module has a comment like `// export default disabled`, we
			// pessimistically treat it as having a default and skip the
			// footer. For `@nativescript/core/index.js` this would be a
			// regression risk, but the file never contains such a comment.
			// Mirroring the behavior of `hasModuleDefaultExport` in
			// websocket-core-bridge.ts. If this ever causes a real
			// production failure, upgrade both helpers to strip comments
			// before matching.
			expect(hasExistingDefaultExport(`// export default disabled`)).toBe(true);
		});

		it('handles empty and malformed input gracefully', () => {
			expect(hasExistingDefaultExport('')).toBe(false);
			expect(hasExistingDefaultExport(null as any)).toBe(false);
			expect(hasExistingDefaultExport(undefined as any)).toBe(false);
			expect(hasExistingDefaultExport(123 as any)).toBe(false);
		});

		it('detects default export among multiple exports (regression: realistic module shapes)', () => {
			const code = [`export const a = 1;`, `export function b() {}`, `export { c };`, `export default class Foo {}`].join('\n');
			expect(hasExistingDefaultExport(code)).toBe(true);
		});
	});

	describe('buildDefaultExportFooter', () => {
		it('emits the default-export bridge for a module with no default', () => {
			const input = [`export const x = 1;`, `export function foo() {}`, `export { bar };`].join('\n');
			const out = buildDefaultExportFooter(input);
			expect(out).toContain(`export default __ns_core_self_ns__;`);
			// Inline comment marker makes it easy to grep in served responses.
			expect(out).toContain('Invariant D: default export bridge');
		});

		it('returns empty string when the module already has a default export', () => {
			const input = [`export const x = 1;`, `export default class Foo {}`].join('\n');
			expect(buildDefaultExportFooter(input)).toBe('');
		});

		it('returns empty string for `export { X as default }` form', () => {
			const input = [`const X = 1;`, `export { X as default };`].join('\n');
			expect(buildDefaultExportFooter(input)).toBe('');
		});

		it('emits for an @nativescript/core-shaped index module', () => {
			const input = [`import './globals';`, `export * from './application';`, `export * as Utils from './utils';`, `export { Color } from './color';`].join('\n');
			const out = buildDefaultExportFooter(input);
			expect(out).toContain(`export default __ns_core_self_ns__;`);
		});

		it('does NOT emit for a deep subpath that legitimately has its own default', () => {
			const input = [`export class Frame { }`, `export default Frame;`].join('\n');
			expect(buildDefaultExportFooter(input)).toBe('');
		});

		it('emits exactly ONE default-export statement (critical for ESM spec)', () => {
			const input = `export const x = 1;`;
			const out = buildDefaultExportFooter(input);
			const matches = out.match(/\bexport\s+default\b/g) || [];
			expect(matches.length).toBe(1);
		});

		it('handles empty input gracefully', () => {
			// An empty module has no default, so the footer should emit.
			// This matters because a degenerate core response (e.g. file
			// couldn't be read) should still produce valid ESM — better
			// to fail fast on a mis-serve than to swallow it silently.
			expect(buildDefaultExportFooter('')).toContain('export default __ns_core_self_ns__;');
		});

		it('references __ns_core_self_ns__ — the exact binding name the /ns/core handler emits for self-import', () => {
			const out = buildDefaultExportFooter('export const x = 1;');
			// This is a regression guard: if someone renames the self-import
			// binding without updating the footer, the ESM linker will fail
			// with "undefined is not a reference". Fail at unit-test time
			// rather than at app boot.
			expect(out).toMatch(/\bexport\s+default\s+__ns_core_self_ns__\b/);
		});

		it('integration: output is syntactically valid when appended to a named-export module', () => {
			const input = [`export const a = 1;`, `export const b = 2;`].join('\n');
			const footer = buildDefaultExportFooter(input);
			const combined = [input, footer].join('\n');
			// Parses without SyntaxError. We use new Function with 'use strict'
			// to validate top-level module-level syntax — a degenerate check
			// that still catches the most common mistakes (double default,
			// unbalanced braces, orphaned tokens).
			expect(() => {
				// Convert the ESM syntax to something Function can accept:
				// strip the ESM-only keywords for structural syntax check.
				const asScript = combined
					.replace(/^\s*export\s+default\s+/gm, 'var __default__ = ')
					.replace(/^\s*export\s+const\s+/gm, 'const ')
					.replace(/^\s*export\s+function\s+/gm, 'function ')
					.replace(/^\s*export\s+class\s+/gm, 'class ')
					.replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, '');
				// eslint-disable-next-line @typescript-eslint/no-implied-eval
				new Function(asScript);
			}).not.toThrow();
		});
	});
});
