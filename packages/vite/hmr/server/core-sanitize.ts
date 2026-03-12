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
		// Normalize any concatenated imports on the same line to start on a new line
		// e.g. `...;import x from` -> `...;\nimport x from`
		out = out.replace(/;\s*import\s+/g, ';\nimport ');
		// Case 1: inline literal followed by another import on SAME line
		// Example: "@nativescript/core/index.js";import { x } from "...";
		out = out.replace(/(["']@nativescript\/core([^"']*)["'];)(\s*import\s+)/g, (_m, _lit: string, sub: string, after: string) => {
			const qp = String(sub || '')
				.trim()
				.replace(/^\//, '');
			const url = qp ? `/ns/core?p=${qp}` : '/ns/core';
			return `import "${url}";${after}`;
		});

		// Case 2: standalone literal on its own line (not a JSON key) — must be end-of-line
		// Guard with EOL so we don't rewrite JSON keys like "@nativescript/core": "alpha"
		const reLine = /(^|\n)([\t ]*)["']@nativescript\/core([^"']*)["']\s*;?\s*(?=$|\n)/g;
		out = out.replace(reLine, (_full, prefix: string, indent: string, sub: string) => {
			const qp = String(sub || '')
				.trim()
				.replace(/^\//, '');
			const url = qp ? `/ns/core?p=${qp}` : '/ns/core';
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
		const toQp = (sub: string) => {
			const s = String(sub || '')
				.split('?')[0]
				.trim()
				.replace(/^\//, '');
			return s ? `?p=${s}` : '';
		};
		// Static: import ... from "...@nativescript/core[/sub]..."
		out = out.replace(/from\s+["'][^"']*@nativescript[\/_-]core([^"']*)["']/g, (_m, sub: string) => `from "/ns/core${toQp(sub)}"`);
		// Side-effect: import "...@nativescript/core[/sub]..."
		out = out.replace(/(^|\n)\s*import\s+["'][^"']*@nativescript[\/_-]core([^"']*)["'];?/gm, (full, pfx: string, sub: string) => `${pfx}import "/ns/core${toQp(sub)}";`);
		// Dynamic: import("...@nativescript/core[/sub]...")
		out = out.replace(/import\(\s*["'][^"']*@nativescript[\/_-]core([^"']*)["']\s*\)/g, (_m, sub: string) => `import("/ns/core${toQp(sub)}")`);
		// Repair glitch where a previous pass split/merged lines into: "from import '/ns/core...'"
		// Normalize to a valid specifier: "from '/ns/core...'"
		out = out.replace(/from\s+import\s+["']((?:https?:\/\/[^"']+)?\/ns\/core(?:\/[0-9]+)?(?:\?p=[^"']+)?)['"]/g, (_m, url: string) => `from "${url}"`);
		return out;
	} catch {
		return code;
	}
}
