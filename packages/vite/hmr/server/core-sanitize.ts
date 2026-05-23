import { buildCoreUrlPath } from '../../helpers/ns-core-url.js';

/**
 * Rewrites stray string-literal side-effect lines that reference @nativescript/core
 * into proper ESM import statements targeting the unified /ns/core bridge.
 *
 * Why: certain upstream transforms can accidentally turn a side-effect import like
 *   import '@nativescript/core/index.js'
 * into a naked string literal line:
 *   "@nativescript/core/index.js";
 * This trips the sanitizer's local-core-path detector and breaks HTTP ESM loading.
 *
 * This helper safely maps those literals to the canonical path form:
 *   import "/ns/core/<sub>";   // subpath form, no version, no ?p=
 * or, without subpath:
 *   import "/ns/core";
 */
export function normalizeStrayCoreStringLiterals(code: string): string {
	if (!code || typeof code !== 'string') return code;
	try {
		let out = code;
		const toCoreBridgeUrl = (sub: string) => buildCoreUrlPath(sub);
		// Normalize any concatenated imports on the same line to start on a new line
		// e.g. `...;import x from` -> `...;\nimport x from`
		out = out.replace(/;\s*import\s+/g, ';\nimport ');
		// Case 1: inline literal followed by another import on SAME line
		// Example: "@nativescript/core/index.js";import { x } from "...";
		out = out.replace(/(["']@nativescript\/core([^"']*)["'];)(\s*import\s+)/g, (_m, _lit: string, sub: string, after: string) => {
			const url = toCoreBridgeUrl(sub);
			return `import "${url}";${after}`;
		});

		// Case 2: standalone literal on its own line (not a JSON key) — must be end-of-line
		// Guard with EOL so we don't rewrite JSON keys like "@nativescript/core": "alpha"
		const reLine = /(^|\n)([\t ]*)["']@nativescript\/core([^"']*)["']\s*;?\s*(?=$|\n)/g;
		out = out.replace(reLine, (_full, prefix: string, indent: string, sub: string) => {
			const url = toCoreBridgeUrl(sub);
			return `${prefix}${indent}import "${url}";`;
		});

		return out;
	} catch {
		return code;
	}
}

/**
 * Merge a dangling "import { ... } from" that was split across lines with the
 * following side-effect import of the core bridge.
 *
 * Example:
 *   import { A, B } from\nimport "/ns/core/index";
 * becomes
 *   import { A, B } from "/ns/core/index";
 */
export function fixDanglingCoreFrom(code: string): string {
	if (!code || typeof code !== 'string') return code;
	try {
		code = code.replace(/;\s*import\s+/g, ';\nimport ');

		// Multi-line form: import { ...\n  ...\n} from\nimport "<core-url>";[tail]
		// Merge into: import { ... } from "<core-url>";\n[tail]
		code = code.replace(/(^|\n|;)\s*import\s*\{([\s\S]*?)\}\s*from\s*\n\s*import\s+["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']*)?)["'];?(.*)/g, (_m, pre: string, named: string, url: string, tail: string) => {
			const prefix = pre ? (String(pre).endsWith(';') ? String(pre) + '\n' : String(pre)) : '';
			const tailNorm = (tail || '').replace(/^\s*;?\s*/, '').trim();
			return prefix + `import {${named}} from "${url}";` + (tailNorm ? `\n${tailNorm}` : '');
		});
		const lines = code.split('\n');
		const out: string[] = [];
		for (let i = 0; i < lines.length; i++) {
			const ln = lines[i];
			const m = /^\s*import\s*\{[^}]+\}\s*from\s*$/.exec(ln);
			if (m && i + 1 < lines.length) {
				const next = lines[i + 1];
				const m2 = /^\s*import\s+["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']*)?)["'];?(.*)$/.exec(next);
				if (m2) {
					const url = m2[1];
					const tail = m2[2] || '';
					out.push(ln + ' ' + `"${url}";`);
					const tailNorm = tail.replace(/^\s*;?\s*/, '');
					if (tailNorm.trim().length > 0) {
						out.push(tailNorm);
					}
					i++;
					continue;
				}
			}
			out.push(ln);
		}
		return out.join('\n');
	} catch {
		return code;
	}
}

/**
 * Run the full "rescue any stray @nativescript/core references" pass over the
 * code in one call. This is the canonical entry point for NS-M served modules
 * (and any other consumer that wants the safety net). The three sub-passes
 * cover progressively rarer pipeline accidents:
 *
 *   1. `normalizeStrayCoreStringLiterals` — turns naked `"@nativescript/core/foo";`
 *      string literals (produced by some upstream transforms that bare-stringify
 *      side-effect imports) back into proper `import "/ns/core/foo";`.
 *   2. `fixDanglingCoreFrom` — merges multi-line accidents where a `from`
 *      clause got separated from its specifier across newlines.
 *   3. `normalizeAnyCoreSpecToBridge` — final regex sweep that catches any
 *      remaining `from "...@nativescript/core[/sub]..."` references that escaped
 *      both the AST normalizer and the import rewriter.
 *
 * The three sub-passes used to be open-coded at three different call sites in
 * `websocket.ts`/`websocket-ns-m-finalize.ts`. Centralising here ensures every
 * NS-M emitter applies the SAME safety net in the SAME order — drift between
 * those sites is the kind of thing that re-introduces the realm-split bug.
 *
 * Returns the (possibly) rewritten code; never throws.
 */
export function sanitizeStrayCoreReferences(code: string): string {
	if (!code || typeof code !== 'string') return code;
	let out = code;
	try {
		out = normalizeStrayCoreStringLiterals(out);
	} catch {}
	try {
		out = fixDanglingCoreFrom(out);
	} catch {}
	try {
		out = normalizeAnyCoreSpecToBridge(out);
	} catch {}
	return out;
}

/**
 * Fallback: normalize ANY import spec that references '@nativescript/core' (including
 * absolute/relative or resolved forms like '/node_modules/@nativescript/core/index.js?v=...')
 * into the unified '/ns/core' bridge before fast-fail assertions.
 */
export function normalizeAnyCoreSpecToBridge(code: string): string {
	if (!code || typeof code !== 'string') return code;
	try {
		let out = code;
		const toCoreBridgeUrl = (sub: string) => buildCoreUrlPath(sub);
		// Static: import ... from "...@nativescript/core[/sub]..."
		out = out.replace(/from\s+["'][^"']*@nativescript[\/_-]core([^"']*)["']/g, (_m, sub: string) => `from "${toCoreBridgeUrl(sub)}"`);
		// Side-effect: import "...@nativescript/core[/sub]..."
		out = out.replace(/(^|\n)\s*import\s+["'][^"']*@nativescript[\/_-]core([^"']*)["'];?/gm, (full, pfx: string, sub: string) => `${pfx}import "${toCoreBridgeUrl(sub)}";`);
		// Dynamic: import("...@nativescript/core[/sub]...")
		out = out.replace(/import\(\s*["'][^"']*@nativescript[\/_-]core([^"']*)["']\s*\)/g, (_m, sub: string) => `import("${toCoreBridgeUrl(sub)}")`);
		// Repair glitch where a previous pass split/merged lines into:
		// "from import '/ns/core...'". Normalize to a valid specifier:
		// "from '/ns/core...'".
		out = out.replace(/from\s+import\s+["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[^"']*)?)['"]/g, (_m, url: string) => `from "${url}"`);
		return out;
	} catch {
		return code;
	}
}

/**
 * Description of the URL the bridge is currently serving, used to resolve
 * relative import specifiers (`./x`, `../x`) into absolute `/ns/core/<sub>`
 * URLs.
 *
 * Why this exists: Vite's `vite:import-analysis` pass usually rewrites every
 * relative specifier to an absolute (`/@fs/...` or `/node_modules/...`) ID
 * before code reaches us, but for files under `node_modules` some transform
 * paths leave relatives untouched. When the device fetches such a module at
 * `http://host/ns/core/utils/layout-helper` (no trailing slash, no `/index`)
 * V8/iOS apply RFC 3986 URL resolution and treat `layout-helper` as the
 * *file*, so `./layout-helper-common` becomes
 * `http://host/ns/core/utils/layout-helper-common` — a sibling that does not
 * exist (the real file lives at `…/layout-helper/layout-helper-common`).
 *
 * Passing a `RelativeBase` lets `rewriteSpec` resolve these specifiers
 * server-side and emit canonical absolute `/ns/core/<resolved>` URLs, so the
 * device never has to guess. When omitted, `rewriteSpec` falls back to the
 * pre-existing behaviour of leaving relatives alone.
 */
export type RelativeBase = {
	/**
	 * Sub-path of the served module, without the leading `/ns/core/`. May be
	 * the empty string for the package main (`/ns/core` itself).
	 */
	sub: string;
	/**
	 * `true` when the served file is a directory-index (e.g.
	 * `…/utils/layout-helper/index.android.ts`); in that case `sub` already
	 * names the *directory*, and `./x` resolves to `<sub>/x`.
	 *
	 * `false` for plain file modules (e.g. `…/utils/native-helper.ts`); the
	 * resolution base is the parent directory of `sub`, so `./x` resolves to
	 * `<sub-parent>/x`.
	 */
	isDirectoryIndex: boolean;
};

/**
 * Detect whether a resolved module path is a directory-index file. Matches
 * `index.<platform?>.<ext>` shapes used across @nativescript/core (e.g.
 * `index.js`, `index.android.ts`, `index.ios.mjs`).
 */
export function isDirectoryIndexFilename(modulePath: string): boolean {
	if (!modulePath || typeof modulePath !== 'string') return false;
	const cleaned = modulePath.split(/[?#]/)[0];
	const base = cleaned.replace(/\\/g, '/').split('/').pop() || '';
	return /^index(?:\.(?:android|ios|visionos))?\.(?:m?[jt]s)$/i.test(base);
}

/**
 * Resolve a relative specifier (`./x`, `../x`) into a canonical
 * @nativescript/core sub-path, given the base described by `relBase`.
 *
 * `…/index.<platform>.<ext>` files mean `sub` IS the directory (so `./x` →
 * `<sub>/x`); plain files mean the resolution base is `sub`'s parent.
 *
 * Returned sub-path is sanitised by `buildCoreUrlPath`'s convention: trailing
 * `.(m)?(j|t)s` extensions are stripped so callers can directly emit
 * `/ns/core/<resolved>` without producing a non-canonical URL that the
 * bridge would 301-redirect later.
 */
export function resolveRelativeCoreSub(spec: string, relBase: RelativeBase): string | null {
	if (!spec || (!spec.startsWith('./') && !spec.startsWith('../'))) return null;
	const cleanSpec = spec.split(/[?#]/)[0];
	const stripExt = (s: string) => s.replace(/\.(?:m?[jt]s)$/i, '');
	const splitSeg = (s: string) => s.split('/').filter((p) => p.length > 0);
	const baseSub = String(relBase?.sub || '').replace(/^\/+|\/+$/g, '');
	const dirParts: string[] = relBase?.isDirectoryIndex ? splitSeg(baseSub) : splitSeg(baseSub).slice(0, -1);
	const relParts = cleanSpec.split('/');
	for (const part of relParts) {
		if (part === '' || part === '.') continue;
		if (part === '..') {
			if (dirParts.length === 0) return null;
			dirParts.pop();
			continue;
		}
		dirParts.push(part);
	}
	const joined = dirParts.join('/');
	return stripExt(joined);
}

/**
 * Rewrite a single import/export specifier for device consumption.
 *
 * Converts Vite-resolved root-relative paths to URLs the device can fetch:
 *   /node_modules/@nativescript/core/x/y  →  /ns/core/x/y   (canonical)
 *   /node_modules/other-pkg/x.js          →  {origin}/ns/m/node_modules/other-pkg/x.js
 *   /src/app/foo.ts                       →  {origin}/ns/m/src/app/foo.ts
 *   already /ns/... or http://...         →  unchanged
 *
 * When `relBase` is supplied AND `spec` is a relative path (`./x` or `../x`),
 * the relative specifier is resolved to an absolute `/ns/core/<resolved>`
 * URL using `resolveRelativeCoreSub`. Without `relBase`, relatives are
 * returned unchanged (legacy behaviour for non-core call sites).
 */
function rewriteSpec(spec: string, origin: string, ver: number, relBase?: RelativeBase): string {
	void ver;
	// Strip Vite cache-busting query params for bridge URLs
	const cleanSpec = spec.split('?')[0];

	// @nativescript/core anywhere in the path → core bridge.
	// Delegated to the ONE canonical URL generator to guarantee that
	// every emitter — this function, the ns-core-external-urls plugin,
	// main-entry's coreSpec, and the runtime import map — produces
	// byte-identical URLs for the same logical module. Mixed forms
	// (query `?p=`, versioned, `.js` suffix) would otherwise produce
	// distinct iOS HTTP ESM cache entries for the same file,
	// re-evaluating register() side effects and crashing on "Cannot
	// redefine property".
	const coreIdx = cleanSpec.indexOf('@nativescript/core');
	if (coreIdx !== -1) {
		const after = cleanSpec.substring(coreIdx + '@nativescript/core'.length);
		return buildCoreUrlPath(after);
	}

	// Already-canonicalised bridge URLs deserve a second look — a
	// `/ns/core/<sub>` URL with a stale platform suffix (`.ios`),
	// trailing `/index`, or `.js` extension would survive this pass
	// but be 301-redirected by the bridge handler at runtime, costing
	// an extra round-trip and risking double-evaluation if iOS caches
	// both spellings. Run any `/ns/core/...` (or full-origin variant)
	// back through `buildCoreUrlPath` so the rewriter is the
	// single point that produces canonical core URLs for the device.
	const coreBridgePathOnly = cleanSpec.match(/^\/ns\/core(?:\/[^?#]*)?$/);
	if (coreBridgePathOnly) {
		const sub = cleanSpec.replace(/^\/ns\/core\/?/, '');
		return buildCoreUrlPath(sub);
	}
	const coreBridgeWithOrigin = cleanSpec.match(/^https?:\/\/[^/]+\/ns\/core(?:\/[^?#]*)?$/);
	if (coreBridgeWithOrigin) {
		const sub = cleanSpec.replace(/^https?:\/\/[^/]+\/ns\/core\/?/, '');
		const canonicalPath = buildCoreUrlPath(sub);
		const originPrefix = cleanSpec.replace(/\/ns\/core(?:\/.*)?$/, '');
		return `${originPrefix}${canonicalPath}`;
	}

	// Already a bridge, vendor, or HTTP URL → leave unchanged
	if (spec.startsWith('/ns/') || spec.startsWith('http://') || spec.startsWith('https://') || spec.startsWith('ns-vendor://')) {
		return spec;
	}

	// Relative specifiers (`./x`, `../x`).
	//
	// Vite's import-analysis usually rewrites these to absolute IDs, but
	// for files under `node_modules` it sometimes leaves them in place.
	// When that happens AND the served URL has no trailing slash AND is
	// itself a directory-index file (e.g. `…/layout-helper/index.android.ts`
	// served at `/ns/core/utils/layout-helper`), V8's URL resolver treats
	// `layout-helper` as the file and points `./layout-helper-common` at the
	// non-existent sibling `/ns/core/utils/layout-helper-common`. Vite then
	// 500s with "Failed to load url … Does the file exist?" and the
	// dependent module never finishes evaluating.
	//
	// When `relBase` is supplied we resolve the specifier server-side and
	// emit a canonical absolute `/ns/core/<resolved>` URL so the device
	// cannot guess wrong. Falling back to the unchanged relative path
	// preserves legacy behaviour for callers that don't (yet) thread
	// `relBase` through.
	if (spec.startsWith('./') || spec.startsWith('../')) {
		if (relBase) {
			const resolvedSub = resolveRelativeCoreSub(spec, relBase);
			if (resolvedSub !== null) {
				return buildCoreUrlPath(resolvedSub);
			}
		}
		return spec;
	}

	// Root-relative paths → HTTP URL through /ns/m/ handler
	if (spec.startsWith('/')) {
		return `${origin}/ns/m${spec}`;
	}

	// Bare package specifier (e.g. `source-map-js/lib/source-map-generator.js`)
	// → HTTP URL through /ns/m/node_modules/ handler. Under HMR bundle-build,
	// @nativescript/core subpath modules served by this bridge (e.g.
	// /ns/core?p=inspector_modules) may reference other npm packages with bare
	// specifiers in their transformed output — specifically, the CommonJS
	// compat transformer for source-map-js rewrites `require('./lib/source-
	// map-generator')` into `import from 'source-map-js/lib/source-map-
	// generator.js'`, a bare specifier that iOS's ESM loader cannot resolve at
	// module-instantiation time (the runtime import map isn't installed yet).
	// Converting to /ns/m/node_modules/<spec> makes iOS fetch the package over
	// HTTP, which Vite serves through the same pipeline that already handles
	// every other node_modules subpath import in the app.
	return `${origin}/ns/m/node_modules/${spec}`;
}

/**
 * Minimal specifier rewriter for deep subpath core modules.
 *
 * Takes Vite's correctly-transformed ESM output and ONLY rewrites the
 * specifier strings inside import/export clauses. Does NOT:
 *   - Inject global defines
 *   - Run AST normalization
 *   - Convert named imports to default + destructure
 *   - Mangle newlines or code structure
 *
 * This replaces the heavy 5-pass pipeline (processCodeForDevice →
 * rewriteImports → deduplicateLinkerImports → CJS wrapping → etc.)
 * for deep subpath core modules where Vite already produces correct ESM.
 *
 * When `relBase` is supplied, relative specifiers (`./x`, `../x`) are
 * resolved server-side into canonical `/ns/core/<resolved>` URLs so the
 * device never has to guess where a directory-index file's siblings live.
 * See `RelativeBase` and `rewriteSpec` for the full rationale.
 */
export function rewriteSpecifiersForDevice(code: string, origin: string, ver: number, relBase?: RelativeBase): string {
	if (!code) return code;
	let result = code;

	// Pattern 1: from "specifier" — covers all static import/export forms
	//   import { X } from "spec"
	//   import X from "spec"
	//   import * as X from "spec"
	//   export { X } from "spec"
	//   export * from "spec"
	//
	// The lookbehind guard below ensures we only match `from` at the start of
	// its ESM-keyword context, not `from` appearing INSIDE a string literal
	// (e.g. `if (time === 'from') { … }` in @nativescript/core's
	// css-animation-parser). Without this guard the regex spans from the
	// `from` inside the string to the NEXT quote elsewhere in the file,
	// corrupting both tokens.
	result = result.replace(/(?<![a-zA-Z0-9_$'"`])(from\s+)(["'])([^"']+)\2/g, (_m, pre: string, q: string, spec: string) => {
		return `${pre}${q}${rewriteSpec(spec, origin, ver, relBase)}${q}`;
	});

	// Pattern 2: import("specifier") — dynamic imports
	result = result.replace(/(import\s*\(\s*)(["'])([^"']+)\2(\s*\))/g, (_m, pre: string, q: string, spec: string, post: string) => {
		return `${pre}${q}${rewriteSpec(spec, origin, ver, relBase)}${q}${post}`;
	});

	// Pattern 3: import "specifier" — side-effect imports (no from clause)
	// Anchored after start-of-string, newline, or semicolon to avoid false matches.
	// The `^` alternative is critical: when a transformed module's body begins
	// with a side-effect import (no preceding `;` or `\n`), the legacy
	// `[;\n]`-only anchor missed it and the URL leaked to the device unmodified.
	// Concrete failure mode: `/ns/core/inspector_modules` whose first body line
	// `import '/@fs/.../@nativescript/core/globals/index.js';` was served raw,
	// producing a `__DEV__ is not defined` ReferenceError in `platform-check.js`
	// because `/@fs/` URLs bypass the `/ns/core` bridge's define-injection.
	result = result.replace(/(^|[;\n])(\s*import\s+)(["'])([^"']+)\3/g, (_m, lead: string, pre: string, q: string, spec: string) => {
		// Skip if it looks like an identifier rather than a path
		if (!/[/.@]/.test(spec)) return _m;
		return `${lead}${pre}${q}${rewriteSpec(spec, origin, ver, relBase)}${q}`;
	});

	return result;
}

/**
 * Determine whether a `/ns/core` bridge URL points to a real subpath module.
 *
 * Any `/ns/core/<sub>` module now serves real ESM content with real named
 * exports via Vite's transform pipeline, except for package-main aliases like
 * `/ns/core/index`, which should be treated like the main `/ns/core`
 * bridge and destructured from its default export.
 * The main proxy bridge (`/ns/core`) still only exports a default Proxy and
 * requires named imports to be destructured from it.
 *
 * This check is used in all named-import-to-default destructuring passes to
 * skip rewriting for real subpath modules — they have named exports that work
 * natively without conversion.
 */
export function isDeepCoreSubpath(url: string): boolean {
	if (!url || typeof url !== 'string') return false;
	const path = url.match(/\/ns\/core\/([^?#]+)/);
	if (!path) return false;
	const sub = String(path[1] || '').replace(/^\/+|\/+$/g, '');
	if (!sub || sub === 'index' || sub === 'index.js') return false;
	return true;
}

/**
 * Synthesize a `default` export for an ESM module that only has named/star
 * exports. Utility function — not currently called from the core bridge
 * handler since `ensureDestructureCoreImports` now skips deep subpaths.
 *
 * Handles all three @nativescript/core patterns:
 *   1. Direct declarations: export class X, export function Y, export const Z
 *   2. Named re-exports:   export { A, B } from '/path'
 *   3. Star re-exports:    export * from '/path'
 *
 * Returns the code unchanged if it already has a default export or CJS exports.
 */
export function synthesizeDefaultExport(moduleCode: string): string {
	if (!moduleCode || typeof moduleCode !== 'string') return moduleCode;

	const hasExportDefault = /\bexport\s+default\b/.test(moduleCode) || /export\s*\{\s*default\s*(?:as\s*default)?\s*\}/.test(moduleCode);
	if (hasExportDefault) return moduleCode;

	const hasCjsExports = /\bmodule\s*\.\s*exports\b/.test(moduleCode) || /\bexports\s*\.\s*\w/.test(moduleCode);
	if (hasCjsExports) return moduleCode;

	try {
		const bindings: Array<[string, string]> = []; // [localName, exportedName]
		const extraImports: string[] = [];
		const starSpreads: string[] = [];
		let sIdx = 0;
		let m: RegExpExecArray | null;

		// export { A, b as B } [from 'src'] — handles both local and re-exports
		const reBraces = /\bexport\s*\{([^}]+)\}\s*(?:from\s*["']([^"']+)["'])?/g;
		while ((m = reBraces.exec(moduleCode)) !== null) {
			const specList = m[1];
			const fromSrc = m[2]; // undefined for local exports
			const specs = specList
				.split(',')
				.map((s: string) => s.trim())
				.filter(Boolean);
			for (const spec of specs) {
				const parts = spec.split(/\s+as\s+/);
				const srcName = parts[0].trim();
				const expName = parts.length > 1 ? parts[1].trim() : srcName;
				if (!expName || expName === 'default') continue;
				// For re-exports, the local name is the exported name (from the import we add below)
				// For local exports, the local name is srcName (already in scope)
				bindings.push(fromSrc ? [expName, expName] : [srcName, expName]);
			}
			if (fromSrc) {
				const importSpecs = specs
					.map((spec: string) => {
						const parts = spec.split(/\s+as\s+/);
						const srcName = parts[0].trim();
						const expName = parts.length > 1 ? parts[1].trim() : srcName;
						if (!expName || expName === 'default') return '';
						return parts.length > 1 ? `${srcName} as ${expName}` : expName;
					})
					.filter(Boolean);
				if (importSpecs.length) {
					extraImports.push(`import { ${importSpecs.join(', ')} } from ${JSON.stringify(fromSrc)};`);
				}
			}
		}

		// export const/let/var X
		const reDecl = /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g;
		while ((m = reDecl.exec(moduleCode)) !== null) {
			bindings.push([m[1], m[1]]);
		}

		// export [async] function[*]/class X
		const reFunc = /\bexport\s+(?:async\s+)?(?:function\s*\*?|class)\s+([A-Za-z_$][\w$]*)/g;
		while ((m = reFunc.exec(moduleCode)) !== null) {
			bindings.push([m[1], m[1]]);
		}

		// export * as X from 'src' (namespace re-export)
		const reStarAs = /\bexport\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s*["']([^"']+)["']/g;
		while ((m = reStarAs.exec(moduleCode)) !== null) {
			extraImports.push(`import * as ${m[1]} from ${JSON.stringify(m[2])};`);
			bindings.push([m[1], m[1]]);
		}

		// export * from 'src' (bare star re-export, NOT 'export * as')
		const reStarBare = /\bexport\s*\*\s*(?!as\s)from\s*["']([^"']+)["']/g;
		while ((m = reStarBare.exec(moduleCode)) !== null) {
			const v = `__ns_star_${sIdx++}`;
			extraImports.push(`import * as ${v} from ${JSON.stringify(m[1])};`);
			starSpreads.push(`...${v}`);
		}

		if (bindings.length > 0 || starSpreads.length > 0) {
			const entries: string[] = [...starSpreads];
			const seen = new Set<string>();
			for (const [local, exported] of bindings) {
				if (seen.has(exported)) continue;
				seen.add(exported);
				entries.push(local === exported ? exported : `${JSON.stringify(exported)}: ${local}`);
			}
			const prefix = extraImports.length ? extraImports.join('\n') + '\n' : '';
			return prefix + moduleCode + `\nvar __ns_default_export = { ${entries.join(', ')} };\nexport { __ns_default_export as default };\n`;
		}

		return moduleCode;
	} catch {
		return moduleCode;
	}
}
