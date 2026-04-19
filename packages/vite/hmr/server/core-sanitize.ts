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
 * This helper safely maps those literals to:
 *   import "/ns/core?p=index.js";
 * or, without subpath:
 *   import "/ns/core";
 */
export function normalizeStrayCoreStringLiterals(code: string): string {
	if (!code || typeof code !== 'string') return code;
	try {
		let out = code;
		const toCoreBridgeUrl = (sub: string) => {
			const normalized = String(sub || '')
				.trim()
				.replace(/^\//, '');
			if (!normalized || normalized === 'index' || normalized === 'index.js') {
				return '/ns/core';
			}
			return `/ns/core?p=${normalized}`;
		};
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
 *   import { A, B } from\nimport "/ns/core?p=index.js";
 * becomes
 *   import { A, B } from "/ns/core?p=index.js";
 */
export function fixDanglingCoreFrom(code: string): string {
	if (!code || typeof code !== 'string') return code;
	try {
		// Also normalize any concatenated imports before processing
		code = code.replace(/;\s*import\s+/g, ';\nimport ');

		// Multi-line form: import { ...\n  ...\n} from\nimport "<core-url>";[tail]
		// Merge into: import { ... } from "<core-url>";\n[tail]
		code = code.replace(/(^|\n|;)\s*import\s*\{([\s\S]*?)\}\s*from\s*\n\s*import\s+["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/\d+)?(?:\?p=[^"']+)?)["'];?(.*)/g, (_m, pre: string, named: string, url: string, tail: string) => {
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
				// Support when the next line starts with the core import followed by another ';import ...'
				// Capture the core import URL and any trailing content after it (another import concatenated)
				const m2 = /^\s*import\s+["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/\d+)?(?:\?p=[^"']+)?)["'];?(.*)$/.exec(next);
				if (m2) {
					const url = m2[1];
					const tail = m2[2] || '';
					out.push(ln + ' ' + `"${url}";`);
					// If there is a tail like ';import { ... } from "..."', normalize it onto a new line
					const tailNorm = tail.replace(/^\s*;?\s*/, '');
					if (tailNorm.trim().length > 0) {
						out.push(tailNorm);
					}
					i++; // consume the next line
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
 * Fallback: normalize ANY import spec that references '@nativescript/core' (including
 * absolute/relative or resolved forms like '/node_modules/@nativescript/core/index.js?v=...')
 * into the unified '/ns/core' bridge before fast-fail assertions.
 */
export function normalizeAnyCoreSpecToBridge(code: string): string {
	if (!code || typeof code !== 'string') return code;
	try {
		let out = code;
		const toCoreBridgeUrl = (sub: string) => {
			const s = String(sub || '')
				.split('?')[0]
				.trim()
				.replace(/^\//, '');
			if (!s || s === 'index' || s === 'index.js') {
				return '/ns/core';
			}
			return `/ns/core?p=${s}`;
		};
		// Static: import ... from "...@nativescript/core[/sub]..."
		out = out.replace(/from\s+["'][^"']*@nativescript[\/_-]core([^"']*)["']/g, (_m, sub: string) => `from "${toCoreBridgeUrl(sub)}"`);
		// Side-effect: import "...@nativescript/core[/sub]..."
		out = out.replace(/(^|\n)\s*import\s+["'][^"']*@nativescript[\/_-]core([^"']*)["'];?/gm, (full, pfx: string, sub: string) => `${pfx}import "${toCoreBridgeUrl(sub)}";`);
		// Dynamic: import("...@nativescript/core[/sub]...")
		out = out.replace(/import\(\s*["'][^"']*@nativescript[\/_-]core([^"']*)["']\s*\)/g, (_m, sub: string) => `import("${toCoreBridgeUrl(sub)}")`);
		// Repair glitch where a previous pass split/merged lines into: "from import '/ns/core...'"
		// Normalize to a valid specifier: "from '/ns/core...'"
		out = out.replace(/from\s+import\s+["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[0-9]+)?(?:\?p=[^"']+)?)['"]/g, (_m, url: string) => `from "${url}"`);
		return out;
	} catch {
		return code;
	}
}

/**
 * Rewrite a single import/export specifier for device consumption.
 *
 * Converts Vite-resolved root-relative paths to URLs the device can fetch:
 *   /node_modules/@nativescript/core/x/y  →  /ns/core/{ver}?p=x/y
 *   /node_modules/other-pkg/x.js          →  {origin}/ns/m/node_modules/other-pkg/x.js
 *   /src/app/foo.ts                       →  {origin}/ns/m/src/app/foo.ts
 *   already /ns/... or http://...         →  unchanged
 */
function rewriteSpec(spec: string, origin: string, ver: number): string {
	// Strip Vite cache-busting query params for bridge URLs
	const cleanSpec = spec.split('?')[0];

	// @nativescript/core anywhere in the path → core bridge
	const coreIdx = cleanSpec.indexOf('@nativescript/core');
	if (coreIdx !== -1) {
		const after = cleanSpec.substring(coreIdx + '@nativescript/core'.length);
		const sub = after.replace(/^\//, '').trim();
		if (!sub || sub === 'index' || sub === 'index.js') {
			return `/ns/core/${ver}`;
		}
		return `/ns/core/${ver}?p=${sub}`;
	}

	// Already a bridge, vendor, or HTTP URL → leave unchanged
	if (spec.startsWith('/ns/') || spec.startsWith('http://') || spec.startsWith('https://') || spec.startsWith('ns-vendor://')) {
		return spec;
	}

	// Root-relative paths → HTTP URL through /ns/m/ handler
	if (spec.startsWith('/')) {
		return `${origin}/ns/m${spec}`;
	}

	return spec;
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
 */
export function rewriteSpecifiersForDevice(code: string, origin: string, ver: number): string {
	if (!code) return code;
	let result = code;

	// Pattern 1: from "specifier" — covers all static import/export forms
	//   import { X } from "spec"
	//   import X from "spec"
	//   import * as X from "spec"
	//   export { X } from "spec"
	//   export * from "spec"
	result = result.replace(/(from\s*)(["'])([^"']+)\2/g, (_m, pre: string, q: string, spec: string) => {
		return `${pre}${q}${rewriteSpec(spec, origin, ver)}${q}`;
	});

	// Pattern 2: import("specifier") — dynamic imports
	result = result.replace(/(import\s*\(\s*)(["'])([^"']+)\2(\s*\))/g, (_m, pre: string, q: string, spec: string, post: string) => {
		return `${pre}${q}${rewriteSpec(spec, origin, ver)}${q}${post}`;
	});

	// Pattern 3: import "specifier" — side-effect imports (no from clause)
	// Anchored after line start, newline, or semicolon to avoid false matches
	result = result.replace(/([;\n]\s*import\s+)(["'])([^"']+)\2/g, (_m, pre: string, q: string, spec: string) => {
		// Skip if it looks like an identifier rather than a path
		if (!/[/.@]/.test(spec)) return _m;
		return `${pre}${q}${rewriteSpec(spec, origin, ver)}${q}`;
	});

	return result;
}

/**
 * Determine whether a `/ns/core` bridge URL points to a real subpath module.
 *
 * Any `/ns/core?p=...` module now serves real ESM content with real named
 * exports via Vite's transform pipeline, except for package-main aliases like
 * `/ns/core?p=index.js`, which should be treated like the main `/ns/core`
 * bridge and destructured from its default export.
 * The main proxy bridge (`/ns/core`) still only exports a default Proxy and
 * requires named imports to be destructured from it.
 *
 * This check is used in all named-import-to-default destructuring passes to
 * skip rewriting for real subpath modules — they have named exports that work
 * natively without conversion.
 */
export function isDeepCoreSubpath(url: string): boolean {
	const match = url.match(/\?p=([^&'"#]+)/);
	if (!match) return false;
	const sub = String(match[1] || '').replace(/^\/+/, '');
	if (!sub || sub === 'index' || sub === 'index.js') {
		return false;
	}
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
