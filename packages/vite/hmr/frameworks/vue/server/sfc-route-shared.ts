import { createRequire } from 'node:module';
import * as path from 'path';

import traverse from '@babel/traverse';

import { vueSfcCompiler } from './compiler.js';
import { normalizeCssForDevice } from '../../../server/css-device-module.js';
import type { FrameworkServerStrategy } from '../../../server/framework-strategy.js';

/**
 * Plugin-closure dependencies the SFC route handlers need. The pure transform
 * functions (`cleanCode`, `processCodeForDevice`, `rewriteImports`) and the
 * device-origin resolver (`getServerOrigin`) are imported directly (from
 * `websocket-device-transform.ts` / `server-origin.ts`); only genuine plugin
 * state is injected here.
 */
export interface RegisterSfcHandlersOptions {
	verbose: boolean;
	appVirtualWithSlash: string;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	getStrategy(): FrameworkServerStrategy;
}

// Babel/Vue-compiler singletons shared by the SFC route modules (serve + assemble).
// Extracted verbatim from the former websocket-sfc.ts module scope so the routes
// resolve the exact same instances they did when they lived in one file.
export const babelTraverse: any = (traverse as any)?.default || (traverse as any);
export const { parse, compileTemplate, compileScript, compileStyleAsync } = vueSfcCompiler;

// Resolve the style preprocessor (`sass`, …) from the APP's node_modules (the
// package the build uses), not the framework's. Cached per root.
const projectRequireCache = new Map<string, NodeRequire>();
function getProjectRequire(projectRoot: string): NodeRequire {
	let req = projectRequireCache.get(projectRoot);
	if (!req) {
		req = createRequire(path.join(projectRoot, 'package.json'));
		projectRequireCache.set(projectRoot, req);
	}
	return req;
}

/**
 * Compile an SFC descriptor's `<style>` blocks to one CSS string for the device
 * (`scss`/`sass` via the app's `sass`; plain CSS passes through).
 *
 * Emitted UNSCOPED — the HMR template compile doesn't stamp `data-v-*` ids, so
 * scoped selectors wouldn't match; NS components use uniquely-prefixed classes,
 * so global application is equivalent. Returns `''` if there are no styles or
 * every block fails (callers degrade gracefully).
 */
export async function compileSfcStylesToCss(descriptor: any, filename: string, projectRoot: string, verbose = false): Promise<string> {
	const styles: any[] = descriptor?.styles || [];
	if (!styles.length) return '';
	const out: string[] = [];
	for (const style of styles) {
		const lang = String(style?.lang || '').toLowerCase();
		const source = style?.content || '';
		if (!source.trim()) continue;
		if (!lang || lang === 'css') {
			out.push(source);
			continue;
		}
		try {
			const projectRequire = getProjectRequire(projectRoot);
			const res: any = await (compileStyleAsync as any)({
				source,
				filename,
				// `id` is required by the API but unused when `scoped` is false.
				id: 'data-v-nshmr',
				scoped: false,
				preprocessLang: lang,
				preprocessCustomRequire: (id: string) => projectRequire(id),
			});
			if (res?.errors?.length && verbose) {
				console.warn(
					'[sfc-asm][style] preprocess errors',
					filename,
					res.errors.map((e: any) => e?.message || String(e)),
				);
			}
			if (res?.code) out.push(res.code);
		} catch (e: any) {
			if (verbose) console.warn('[sfc-asm][style] compile failed', filename, e?.message || String(e));
		}
	}
	// Normalize for the device CSS engine (strip BOM / @charset).
	return normalizeCssForDevice(out.join('\n'));
}

export const pluginTransformTypescript: any = (() => {
	const requireFromHere = createRequire(import.meta.url);
	const loaded = requireFromHere('@babel/plugin-transform-typescript');
	return loaded?.default || loaded;
})();

/**
 * Canonicalize app-source `/ns/m/` imports inside a served Vue SFC artifact
 * (assembler module or `/ns/sfc` variant): strip any `__ns_hmr__/<tag>/`
 * segment (stale cached device code) so every import lands on the STABLE
 * `/ns/m/<app-path>` URL.
 *
 * Why canonical (not versioned): module identity IS the URL. Freshness for
 * changed deps comes from explicit eviction — `__NS_DEV__.invalidateModules` drops
 * the canonical key from V8's registry AND arms the runtime's bust-next-fetch
 * nonce, so the artifact's re-import re-fetches current content. Emitting a
 * versioned URL would mint a NEW module identity per save (the runtime no
 * longer collapses tags), splitting module state.
 *
 * Vendor (`node_modules`) paths pass through untouched (they're already
 * stable and never tagged).
 */
export function canonicalizeNsMAppImports(code: string): string {
	if (!code) return code;
	const canonicalSpec = (_match: string, prefix: string, origin: string, rest: string, suffix: string): string => {
		return `${prefix}${origin}/ns/m/${rest}${suffix}`;
	};
	// `from "/ns/m/..."` (covers import/export-from), stripping any existing tag
	code = code.replace(/(from\s+["'])((?:https?:\/\/[^"']+)?)\/ns\/m\/(?:__ns_hmr__\/[^/"']+\/)?([^"']*)(["'])/g, canonicalSpec);
	// side-effect `import "/ns/m/..."`
	code = code.replace(/(import\s+["'])((?:https?:\/\/[^"']+)?)\/ns\/m\/(?:__ns_hmr__\/[^/"']+\/)?([^"']*)(["'])/g, canonicalSpec);
	// dynamic `import("/ns/m/...")`
	code = code.replace(/(import\(\s*["'])((?:https?:\/\/[^"']+)?)\/ns\/m\/(?:__ns_hmr__\/[^/"']+\/)?([^"']*)(["']\s*\))/g, canonicalSpec);
	return code;
}
