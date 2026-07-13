import type { Plugin } from 'vite';
import { runAngularLinker } from './shared-linker.js';
import { containsRealNgDeclare } from './util.js';
import { recordLinkerHit } from './linker-stats.js';

function normalizeAngularLinkerId(id: string): string {
	return id.split('?', 1)[0].replace(/\\/g, '/');
}

function isDebug(): boolean {
	return process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
}

/**
 * Vite plugin to run the Angular linker (Babel) over partial-compiled Angular
 * libraries inside node_modules (e.g. @angular/*, @nativescript/angular),
 * converting ɵɵngDeclare* calls to ɵɵdefine* so the runtime doesn't need JIT.
 */
export function angularLinkerVitePlugin(projectRoot?: string): Plugin {
	// Base filter: Angular framework libraries + NativeScript Angular + its polyfills bundle.
	const FILTER = /node_modules\/(?:@angular|@nativescript\/angular)\/.*\.[mc]?js$|nativescript-angular-polyfills\.mjs$/;
	// Extended filter: ANY node_modules .js/.mjs file — catches Angular ecosystem
	// packages (ngrx, etc.) carrying ɵɵngDeclare* partials. Vite 8 watch rebuilds
	// may skip chunk-level linker fallbacks for cached chunks, so link at transform.
	const NODE_MODULES_FILTER = /node_modules\/.*\.[mc]?js$/;
	// NS_STRICT_NG_LINK_ALL=1 aggressively links any JS/ESM file with a real
	// ɵɵngDeclare* call site so no partials survive into the device bundle.
	const strictAll = process.env.NS_STRICT_NG_LINK_ALL === '1' || process.env.NS_STRICT_NG_LINK_ALL === 'true';

	return {
		name: 'ns-angular-linker-vite',
		enforce: 'pre',
		async load(id) {
			const cleanId = normalizeAngularLinkerId(id);
			if (!strictAll && !FILTER.test(cleanId)) {
				if (!NODE_MODULES_FILTER.test(cleanId)) return null;
				try {
					const fs = await import('node:fs/promises');
					const peek = await fs.readFile(cleanId, 'utf8');
					if (!peek || !containsRealNgDeclare(peek)) return null;
				} catch {
					return null;
				}
			}
			try {
				const fs = await import('node:fs/promises');
				const code = await fs.readFile(cleanId, 'utf8');
				if (!code) return null;
				if (strictAll && !FILTER.test(cleanId) && !containsRealNgDeclare(code)) return null;
				const linked = await runAngularLinker(code, { filename: cleanId, projectRoot });
				if (linked) {
					recordLinkerHit('vite-load');
					if (isDebug()) console.log('[ns-angular-linker][vite-load] linked', cleanId);
					return { code: linked, map: null } as any;
				}
			} catch {}
			return null;
		},
		async transform(code, id) {
			const cleanId = normalizeAngularLinkerId(id);
			if (!strictAll && !FILTER.test(cleanId)) {
				if (!NODE_MODULES_FILTER.test(cleanId) || !code || !containsRealNgDeclare(code)) return null;
			}
			if (!code) return null;
			if (strictAll && !FILTER.test(cleanId) && !containsRealNgDeclare(code)) return null;
			try {
				const linked = await runAngularLinker(code, { filename: cleanId, projectRoot, freshPlugin: true });
				if (linked) {
					recordLinkerHit('vite');
					if (isDebug()) console.log('[ns-angular-linker][vite] linked', cleanId);
					return { code: linked, map: null };
				}
			} catch {}
			return null;
		},
	};
}

/**
 * Post-phase linker: catches any ɵɵngDeclare* introduced by downstream
 * transforms (e.g. optimizer) including project source, after other plugins run.
 */
export function angularLinkerVitePluginPost(projectRoot?: string): Plugin {
	return {
		name: 'ns-angular-linker-vite-post',
		enforce: 'post',
		async transform(code, id) {
			if (!/\.(m?js)(\?|$)/.test(id)) return null;
			if (!code || !containsRealNgDeclare(code)) return null;
			try {
				const filename = id.split('?', 1)[0];
				const linked = await runAngularLinker(code, { filename, projectRoot });
				if (linked) {
					recordLinkerHit('vite-post');
					if (isDebug()) console.log('[ns-angular-linker][vite-post] linked', filename);
					return { code: linked, map: null };
				}
			} catch {}
			return null;
		},
	};
}
