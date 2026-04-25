/**
 * CJS/ESM interop shape.
 *
 * PROBLEM
 * -------
 * ESM Module Namespace Objects (ECMA §9.4.6) have [[Prototype]] = null.
 * They do NOT inherit Object.prototype — no `hasOwnProperty`, no `toString`,
 * no `isPrototypeOf`. CJS consumers (most notably zone.js's `patchMethod`)
 * assume their require() result is a plain object that has those methods:
 *
 *     let proto = target;
 *     while (proto && !proto.hasOwnProperty(name)) // ← crashes on null-proto
 *       proto = Object.getPrototypeOf(proto);
 *
 * `@nativescript/core/index.js` re-exports several sub-modules as namespaces:
 *
 *     export * as Utils from './utils';
 *     export * as Http from './http';
 *     export * as Connectivity from './connectivity';
 *     export * as ApplicationSettings from './application-settings';
 *
 * When bundle.mjs does `import { Utils } from '@nativescript/core'`, `Utils`
 * binds to that null-proto sub-namespace. zone.js then does
 * `patchMethod(Utils, 'mainThreadify', …)` and crashes.
 *
 * WHY globalThis.require shims ALONE DON'T FIX THIS
 * -------------------------------------------------
 * ESM imports never pass through `globalThis.require`. They go through the
 * host's ESM linker (V8 on iOS). Shimming `require` only intercepts the CJS
 * path (vendor packages that use `require('@nativescript/core')`); direct
 * ESM imports of `Utils` still see the raw null-proto namespace.
 *
 * THE FIX
 * -------
 * Rewrite `export * as X from 'Y'` at the /ns/core bridge response level:
 *
 *     // before
 *     export * as Utils from './utils';
 *
 *     // after
 *     import * as __ns_re_Utils__ from './utils';
 *     export const Utils = __NS_CJS_SHAPE__(__ns_re_Utils__);
 *
 * Now `Utils` is a plain Object (inherits Object.prototype). Zone.js's
 * `patchMethod(Utils, ...)` succeeds. The shape function is recursive —
 * nested namespaces get the same treatment — and identity-preserving
 * (WeakMap-cached) so mutations stick across lookups.
 *
 * WHY THE SHAPE INSTALL MUST RUN IN MODULE BODY (NOT FOOTER)
 * ---------------------------------------------------------
 * `export const Utils = __NS_CJS_SHAPE__(__ns_re_Utils__)` is body code. It
 * executes during module evaluation, BEFORE the registration footer. So the
 * shape function must be installed as a body-level statement that runs
 * before the rewritten body — we can't rely on the footer's install.
 *
 * Each served /ns/core module independently installs the shape function via
 * an idempotent `|| (globalThis.__NS_CJS_SHAPE__ = ...)` assignment. The
 * first module to evaluate wins; subsequent evaluations are no-ops. This
 * also handles dependency-before-importer order (depth-first ESM eval):
 * `/ns/core/utils` evaluates before `/ns/core` main, so the shape helper
 * is in place whenever any body needs it.
 */

/**
 * Body-code statements that idempotently install `globalThis.__NS_CJS_SHAPE__`
 * and `globalThis.__NS_CJS_SHAPE_CACHE__`. Must execute BEFORE any transformed
 * `export const X = __NS_CJS_SHAPE__(...)` statement in the same module.
 *
 * Properties:
 *   - Recursive: traverses nested namespaces so `Utils.Something` is also
 *     a plain Object (if that sub-namespace is itself null-proto).
 *   - Identity-preserving: WeakMap keyed on the underlying ESM namespace.
 *     zone.js mutates its patch target; a fresh copy per call would lose
 *     mutations. Every lookup of the same namespace returns the same
 *     shaped object.
 *   - Cycle-safe: records the output in the cache BEFORE recursing into
 *     children. Handles `core ↔ platform` style cycles.
 *   - TDZ-safe: wraps each property read in try/catch. Some exports
 *     (Angular zone.js with early-access patterns) are still in their
 *     temporal dead zone when the namespace is first snapshotted. A thrown
 *     property read is skipped rather than failing the whole shape.
 */
export function buildShapeInstallHeader(): string {
	return [
		`/* Invariant D: CJS/ESM interop shape installer */`,
		`try { if (typeof globalThis !== 'undefined') {`,
		`  const __nsShapeCache = globalThis.__NS_CJS_SHAPE_CACHE__ || (globalThis.__NS_CJS_SHAPE_CACHE__ = new WeakMap());`,
		`  if (typeof globalThis.__NS_CJS_SHAPE__ !== 'function') {`,
		`    globalThis.__NS_CJS_SHAPE__ = function __nsShape(obj) {`,
		`      if (!obj || typeof obj !== 'object') return obj;`,
		`      let isNsModule = false;`,
		`      try { isNsModule = obj[Symbol.toStringTag] === 'Module'; } catch (e) {}`,
		`      const proto = Object.getPrototypeOf(obj);`,
		`      if (proto !== null && !isNsModule) return obj;`,
		`      if (__nsShapeCache.has(obj)) return __nsShapeCache.get(obj);`,
		`      const out = {};`,
		`      __nsShapeCache.set(obj, out);`,
		`      try {`,
		`        const keys = Object.keys(obj);`,
		`        for (let i = 0; i < keys.length; i++) {`,
		`          const k = keys[i];`,
		`          try { out[k] = __nsShape(obj[k]); } catch (e) { /* TDZ / unreadable */ }`,
		`        }`,
		`      } catch (e) {}`,
		`      return out;`,
		`    };`,
		`  }`,
		`} } catch (e) { try { console.warn('[ns-core] shape installer failed:', (e && e.message) || e); } catch {} }`,
	].join('\n');
}

/**
 * Rewrite namespace re-exports from CJS-incompatible ESM namespace form into
 * shape-aware const exports. Handles the two forms Vite/esbuild may emit:
 *
 *   (1) Original ES2020 syntax preserved unchanged:
 *       export * as X from 'Y';
 *
 *   (2) Transpiled form esbuild emits when targeting older ES:
 *       import * as _foo from 'Y';
 *       export { _foo as X };
 *
 * Both become:
 *   import * as __ns_re_X__ from 'Y';
 *   export const X = __NS_CJS_SHAPE__(__ns_re_X__);
 *
 * Notes on the transform:
 *   - The internal binding uses a derived name (`__ns_re_<X>__`) so
 *     collisions with user bindings are extremely unlikely. Core doesn't
 *     declare identifiers matching that shape.
 *   - `__NS_CJS_SHAPE__` is read from globalThis with a defensive fallback
 *     (identity function) in case installation failed or runs in an
 *     environment where it hasn't been initialized yet. This makes the
 *     transform safe to apply to modules that don't always go through the
 *     /ns/core handler's headers.
 *   - We do NOT shape `export *` (star re-exports without alias). Those
 *     spread individual named exports — they don't create a nested
 *     namespace and aren't affected by the null-proto issue.
 *   - We do NOT shape `export { x } from 'y'` forms. Those copy individual
 *     named exports directly; the consumer never sees the namespace.
 *
 * The regex is intentionally precise. It matches only the `export * as X from
 * 'Y'` syntactic form (and its transpiled equivalent) — no accidental matches
 * in string literals or comments because those can't start a top-level
 * statement with `export`.
 */
export function rewriteNamespaceReExportsForShape(code: string): string {
	const shapeExpr = `(typeof globalThis.__NS_CJS_SHAPE__ === 'function' ? globalThis.__NS_CJS_SHAPE__ : function (x) { return x; })`;

	// Form (1): export * as X from 'Y';  (ES2020 aggregate re-export)
	let out = code.replace(/(^|\n)(\s*)export\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+(['"`])([^'"`\n]+)\4\s*;?/g, (_match, prefix: string, indent: string, name: string, quote: string, spec: string) => {
		const internal = `__ns_re_${name}__`;
		return `${prefix}${indent}import * as ${internal} from ${quote}${spec}${quote};\n${indent}export const ${name} = ${shapeExpr}(${internal});`;
	});

	// Form (2): import * as _x from 'Y'; export { _x as X };
	// This pattern appears when esbuild targets older ES. We detect the pair
	// by matching the import and its paired export on the same or adjacent
	// lines. Rather than try to join two regex passes, we transform the
	// `export { _x as X }` branch by replacing the `_x` in the export with a
	// shape-wrapped const. Keeping the import intact is safe because the
	// local binding is still needed for the shape call.
	out = out.replace(/export\s*\{\s*([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)\s*\}\s*;?/g, (match, localName: string, exportName: string) => {
		// Only transform if the local name looks like an esbuild-generated
		// namespace binding (leading underscore) AND the export name is a
		// PascalCase identifier. This avoids touching user re-exports.
		if (!/^_/.test(localName)) return match;
		if (!/^[A-Z]/.test(exportName)) return match;
		return `export const ${exportName} = ${shapeExpr}(${localName});`;
	});

	return out;
}

/**
 * Convenience: returns true if the given code appears to contain at least one
 * namespace re-export that would benefit from the shape transform. Used to
 * skip the regex replace for modules that don't need it (keeps the response
 * identical for most submodules, which just have plain `export * from` or
 * named exports).
 */
export function hasNamespaceReExport(code: string): boolean {
	return /export\s+\*\s+as\s+[A-Za-z_$][\w$]*\s+from\s+['"`]/.test(code);
}

/**
 * Default-export bridge footer.
 *
 * BACKGROUND
 * ----------
 * Upstream consumer rewrites in the /ns/m handler convert
 * `import { X } from '@nativescript/core'` into
 * `import __ns_core_ns from '/ns/core'; const { X } = __ns_core_ns;`
 * — a DEFAULT import followed by destructuring. The inline comment on that
 * rewrite says explicitly: "This makes `import { Frame } from
 * '@nativescript/core'` work even if the bridge provides only a default
 * export."
 *
 * The original `@nativescript/core/index.js` has no `export default` — all
 * named exports. Without this footer, consumers of the transformed import
 * fail at ESM link time:
 *
 *     SyntaxError: The requested module '/ns/core/<ver>' does not
 *     provide an export named 'default'
 *
 * THE FIX
 * -------
 * Emit `export default __ns_core_self_ns__;` at the end of the served
 * module body. `__ns_core_self_ns__` is the namespace import the server
 * already emits at the top of every /ns/core response for self-
 * registration purposes. ESM spec guarantees a module re-entering itself
 * during evaluation returns the in-progress namespace — so no extra
 * evaluation occurs, and the default binding receives an object whose
 * properties are every named export of the same module.
 *
 * CONSUMER MATRIX AFTER THIS FIX
 * ------------------------------
 *   • `import X from '/ns/core'` (default)     → X = self namespace
 *   • `import * as X from '/ns/core'`          → X = self namespace + X.default = self
 *   • `import { X } from '/ns/core'` (named)   → individual named binding (untouched)
 *   • `const { X } = <default-import>`         → destructure from self namespace
 *   • `require('@nativescript/core')` (CJS)    → shaped self via registry
 *
 * SKIP CONDITIONS
 * ---------------
 * Returns empty string when the source already declares a default export
 * (some deep subpaths do — e.g. a file that does `export default MyClass`
 * would SyntaxError on a duplicate). The consumer rewrite is also gated
 * on `isDeepCoreSubpath`, so those paths don't normally hit the default-
 * import pattern anyway.
 *
 * WHY THE DEFAULT ISN'T SHAPED
 * ----------------------------
 * The default is the raw null-proto MNO. This is intentional:
 *
 *   1. All current default-import consumers either destructure or do
 *      property access. Neither requires Object.prototype in the chain.
 *   2. Shaping the default inside the module body would require calling
 *      __NS_CJS_SHAPE__ on a namespace whose own `default` slot is still
 *      being initialized — temporal dead zone hazard.
 *   3. CJS consumers that need `.hasOwnProperty` go through the registry
 *      (shaped at registration), not through the default import.
 *
 * If a future consumer surfaces that calls `.hasOwnProperty` on the
 * default, we can revisit. The current rule-of-least-surprise is:
 * shape at the CJS boundary, not at the ESM boundary.
 */
export function buildDefaultExportFooter(rewrittenCode: string): string {
	if (hasExistingDefaultExport(rewrittenCode)) return '';
	return ['/* Default-export bridge for /ns/core consumers */', 'export default __ns_core_self_ns__;'].join('\n');
}

/**
 * Detects whether a module body already declares a default export in any of
 * the syntactic forms the ESM spec allows. Mirrors the logic in
 * `websocket-core-bridge.ts:hasModuleDefaultExport` — kept here so the
 * default-export bridge helper is self-contained and unit-testable.
 *
 * Handles:
 *   - `export default <expr>;`
 *   - `export default function|class ...`
 *   - `export { x as default };`
 *   - `export { default };`        (implicit `default as default`)
 *   - `export { default as default };`
 *   - `export { foo, default };`
 */
export function hasExistingDefaultExport(code: string): boolean {
	if (!code || typeof code !== 'string') return false;
	if (/\bexport\s+default\b/.test(code)) return true;
	if (/\bexport\s*\{[^}]*\bdefault\b[^}]*\}/.test(code)) return true;
	return false;
}
