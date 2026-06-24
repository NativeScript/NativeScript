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
	getGraphVersion(): number;
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
 * Version app-source `/ns/m/` imports inside a served Vue SFC artifact
 * (assembler module or `/ns/sfc` variant) to `/ns/m/__ns_hmr__/v<ver>/...`.
 *
 * Why: SFC artifacts are re-fetched per graph version (`/ns/asm/<ver>`,
 * `/ns/sfc/<ver>/...`), but their non-`.vue` dep imports were rewritten to
 * STABLE `/ns/m/<app-path>` URLs. On runtimes without `__nsInvalidateModules`
 * (or URL canonicalization), V8's HTTP module cache keys on the exact URL, so
 * a remounted SFC linked against the dep instance cached by the PREVIOUS save
 * — the on-screen value stayed one save behind. Versioning the import makes
 * each artifact pull the current dep content: legacy runtimes see a brand-new
 * URL (fresh fetch), modern runtimes canonicalize the tag away and hit the
 * explicitly-evicted (refreshed) canonical key. The server already collapses
 * any `__ns_hmr__/<tag>/` segment when serving (`rewriteNsMImportPathForHmr`).
 *
 * Vendor (`node_modules`) and boot-tagged paths are left untouched — their
 * module identity must stay stable across versions.
 */
export function ensureVersionedNsMAppImports(code: string, ver: number): string {
	if (!code || !Number.isFinite(ver)) return code;
	const versionSpec = (match: string, prefix: string, origin: string, rest: string, suffix: string): string => {
		if (rest.startsWith('node_modules/') || rest.startsWith('__ns_boot__/')) return match;
		return `${prefix}${origin}/ns/m/__ns_hmr__/v${ver}/${rest}${suffix}`;
	};
	// `from "/ns/m/..."` (covers import/export-from), normalizing any existing tag
	code = code.replace(/(from\s+["'])((?:https?:\/\/[^"']+)?)\/ns\/m\/(?:__ns_hmr__\/[^/"']+\/)?([^"']*)(["'])/g, versionSpec);
	// side-effect `import "/ns/m/..."`
	code = code.replace(/(import\s+["'])((?:https?:\/\/[^"']+)?)\/ns\/m\/(?:__ns_hmr__\/[^/"']+\/)?([^"']*)(["'])/g, versionSpec);
	// dynamic `import("/ns/m/...")`
	code = code.replace(/(import\(\s*["'])((?:https?:\/\/[^"']+)?)\/ns\/m\/(?:__ns_hmr__\/[^/"']+\/)?([^"']*)(["']\s*\))/g, versionSpec);
	return code;
}
