import { parse as babelParse } from '@babel/parser';
import type { File } from '@babel/types';
import { genCode } from '../../../helpers/babel.js';

export type ProcessCodeForDeviceFn = (code: string, isVitePreBundled: boolean) => string;

export interface ExtractTemplateRenderResult {
	helperBindings: string;
	renderDecl: string;
	inlineBlock?: string;
	ok: boolean;
}

/**
 * Factory that returns the Vue SFC processor with dependencies injected.
 */
export function createProcessSfcCode(processCodeForDevice: ProcessCodeForDeviceFn): (code: string) => string {
	return function processSfcCode(code: string): string {
		// DON'T remove imports here - let rewriteImports() and processCodeForDevice() handle them
		// This allows application imports to be rewritten to relative paths for dynamic loading

		// Process for device (inject globals, remove framework imports)
		let result = processCodeForDevice(code, false);

		// Add export helper function that ALL SFC files need
		result = `function _export_sfc(sfc, props) { if (props && Array.isArray(props)) { for (const [k, v] of props) { if (k === 'render') sfc.render = v; else sfc[k] = v; } } return sfc; }\n` + result;

		return result;
	};
}

// Minimal processing for SFC template variant only: avoid heavy sanitization to prevent
// mangling compiled render functions. Remove named Vue helper imports and bind
// underscore helpers from globalThis so the template can execute without importing 'vue'.
export function processTemplateVariantMinimal(code: string): string {
	let result = code;
	// Strip HMR hot context and helper import lines only; do NOT inject any alias prelude here.
	try {
		result = result.replace(/import\s+\{\s*createHotContext[^;]*;?import\.meta\.hot\s*=\s*__vite__createHotContext\([^)]*\);?/g, '');
	} catch {}
	// Rewrite Vue helper imports to /ns/rt so the template can execute without pulling 'vue'
	try {
		result = result.replace(/import\s+\{([^}]*)\}\s+from\s+["'](?:nativescript-vue|vue)[^"']*["'];?/g, (m, g1) => {
			const names = (g1 || '')
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean)
				.join(', ');
			return names ? `import { ${names} } from "/ns/rt";` : '';
		});
	} catch {}
	return result;
}

// Extract a safe render function declaration and helper bindings from a compiled
// template variant. Returns bindings + a declaration for `__ns_render` if found.
export function extractTemplateRender(code: string): ExtractTemplateRenderResult {
	const processed = processTemplateVariantMinimal(code || '');
	// Helper bindings (currently injected via processTemplateVariantMinimal with var/if guards)
	// We no longer attempt to re-extract them; pass through empty to avoid duplication.
	let bindingLines = '';

	const src = processed.replace(/^\s*import\s+[^\n]*$/gm, '');

	// Capture full top-level hoisted declarations emitted by the Vue compiler that
	// the render function references (e.g., const _hoisted_1 = {...}). Avoid pulling
	// _component_* or _directive_* so resolveComponent stays in render context.
	try {
		const ast = babelParse(src, {
			sourceType: 'module',
			plugins: ['typescript'] as any,
		}) as unknown as File;
		const hoistedNodes: any[] = [];
		const body: any[] = (ast as any).program?.body || [];
		for (const node of body) {
			if (node && node.type === 'VariableDeclaration') {
				const decls: any[] = node.declarations || [];
				for (const d of decls) {
					const id = d?.id;
					const name = id && id.type === 'Identifier' ? id.name : null;
					if (name && /^_hoisted_\d+/.test(name)) {
						hoistedNodes.push(node);
						break; // only add once per declaration statement
					}
				}
			}
		}
		if (hoistedNodes.length) {
			const codes = hoistedNodes.map((n) => genCode(n as any).code);
			bindingLines = codes.join('\n');
		}
	} catch {}

	interface RenderHit {
		kind: 'fn' | 'arrow';
		start: number;
		header: string;
		bodyStart: number;
	}

	const hits: RenderHit[] = [];

	// Locate function render declarations (export function render / function render)
	{
		const fnRe = /(?:^|\n)\s*(export\s+)?function\s+render\s*\(/g;
		let m: RegExpExecArray | null;
		while ((m = fnRe.exec(src))) {
			const idx = m.index + (m[0].startsWith('\n') ? 1 : 0);
			// find the opening brace following this match
			const parenStart = src.indexOf('(', fnRe.lastIndex - 1);
			if (parenStart === -1) continue;
			let depthP = 0;
			let i = parenStart;
			let bodyStart = -1;
			for (; i < src.length; i++) {
				const ch = src[i];
				if (ch === '(') depthP++;
				else if (ch === ')') {
					depthP--;
					if (depthP === 0) {
						// expect optional ws then {
						const braceIdx = src.indexOf('{', i + 1);
						if (braceIdx !== -1) {
							bodyStart = braceIdx;
						}
						break;
					}
				}
			}
			if (bodyStart !== -1) {
				hits.push({
					kind: 'fn',
					start: idx,
					header: src.slice(idx, bodyStart + 1),
					bodyStart: bodyStart + 1,
				});
			}
		}
	}
	// Locate const render = (...) => { ... }
	{
		const arrRe = /(?:^|\n)\s*(export\s+)?const\s+render\s*=\s*\([^)]*\)\s*=>\s*\{/g;
		let m: RegExpExecArray | null;
		while ((m = arrRe.exec(src))) {
			const idx = m.index + (m[0].startsWith('\n') ? 1 : 0);
			const braceIdx = src.indexOf('{', arrRe.lastIndex - 1);
			if (braceIdx !== -1)
				hits.push({
					kind: 'arrow',
					start: idx,
					header: src.slice(idx, braceIdx + 1),
					bodyStart: braceIdx + 1,
				});
		}
	}

	const scanBlock = (bodyStart: number): { end: number; body: string } | null => {
		let i = bodyStart;
		let depth = 1; // already consumed opening '{'
		let inS = false,
			inD = false,
			inT = false,
			inLC = false,
			inBC = false;
		for (; i < src.length; i++) {
			const ch = src[i];
			const next = src[i + 1];
			if (inLC) {
				if (ch === '\n') inLC = false;
				continue;
			}
			if (inBC) {
				if (ch === '*' && next === '/') {
					inBC = false;
					i++;
				}
				continue;
			}
			if (inS) {
				if (ch === '\\') {
					i++;
					continue;
				}
				if (ch === "'") inS = false;
				continue;
			}
			if (inD) {
				if (ch === '\\') {
					i++;
					continue;
				}
				if (ch === '"') inD = false;
				continue;
			}
			if (inT) {
				if (ch === '\\') {
					i++;
					continue;
				}
				if (ch === '`') inT = false;
				continue;
			}
			if (ch === '/' && next === '/') {
				inLC = true;
				i++;
				continue;
			}
			if (ch === '/' && next === '*') {
				inBC = true;
				i++;
				continue;
			}
			if (ch === "'") {
				inS = true;
				continue;
			}
			if (ch === '"') {
				inD = true;
				continue;
			}
			if (ch === '`') {
				inT = true;
				continue;
			}
			if (ch === '{') depth++;
			else if (ch === '}') {
				depth--;
				if (depth === 0) {
					return { end: i, body: src.slice(bodyStart, i) };
				}
			}
		}
		return null;
	};

	for (const h of hits) {
		const scanned = scanBlock(h.bodyStart);
		if (!scanned) continue;
		const snippet = h.header + scanned.body + '}';
		// Rename to __ns_render
		let renderDecl = '';
		if (h.kind === 'fn') {
			renderDecl = snippet.replace(/function\s+render\s*\(/, 'function __ns_render(').replace(/export\s+function\s+__ns_render/, 'function __ns_render');
		} else {
			// arrow
			renderDecl = snippet.replace(/const\s+render\s*=\s*/, 'const __ns_render = ');
		}
		// Quick integrity check: ensure ternaries not truncated ( '?' implies matching ':' )
		if (/\?/.test(renderDecl)) {
			const qm = (renderDecl.match(/\?/g) || []).length;
			const cm = (renderDecl.match(/:/g) || []).length;
			if (cm < qm) {
				renderDecl += `\n/* [extract-warning] potential truncated ternary: ?=${qm} : counted=${cm} */`;
			}
		}
		return { helperBindings: bindingLines, renderDecl, ok: true };
	}

	// Fallback legacy path (very rare now): expose entire processed module, rewriting render->__ns_render.
	try {
		let body = src;
		body = body.replace(/\bexport\s+function\s+render\s*\(/g, 'function __ns_render(');
		body = body.replace(/\bfunction\s+render\s*\(/g, 'function __ns_render(');
		body = body.replace(/\bexport\s+(?:const|let|var)\s+render\s*=\s*/g, 'const __ns_render = ');
		body = body.replace(/(^|\n)\s*(?:const|let|var)\s+render\s*=\s*/g, '$1const __ns_render = ');
		if (/__ns_render/.test(body)) {
			return {
				helperBindings: bindingLines,
				renderDecl: '',
				inlineBlock: body,
				ok: true,
			};
		}
	} catch {}
	return { helperBindings: bindingLines, renderDecl: '', ok: false };
}

// Build a safe inline template block that preserves hoisted constants and converts exported render to __ns_render.
// This is more robust than trying to splice out just the render function because it guarantees all
// _hoisted_* declarations compiled by Vue remain available for the render body.
export function buildInlineTemplateBlock(compiled: string): string | undefined {
	if (!compiled || typeof compiled !== 'string') return undefined;
	try {
		// Start with minimal processing: drop helper imports and inject underscore aliases.
		let code = processTemplateVariantMinimal(compiled);
		// Remove any residual import lines defensively (e.g., HMR helpers)
		code = code.replace(/^\s*import\s+[^\n]*$/gm, '');
		// Normalize the render export shapes → __ns_render
		code = code.replace(/(^|\n)\s*export\s+function\s+render\s*\(/g, '$1function __ns_render(');
		code = code.replace(/(^|\n)\s*export\s+(?:const|let|var)\s+render\s*=/g, '$1const __ns_render =');
		// Also handle non-exported const/let render declarations (rare) to avoid duplicate identifiers
		code = code.replace(/(^|\n)\s*(?:const|let|var)\s+render\s*=/g, '$1const __ns_render =');
		// Drop any named export blocks that re-export render
		code = code.replace(/(^|\n)\s*export\s*\{[^}]*\}\s*;?/g, '$1');
		// Sanity: ensure we now have a __ns_render present if original had a render
		if (/__ns_render\s*=|function\s+__ns_render\s*\(/.test(code)) {
			return code;
		}
	} catch {}
	return undefined;
}
