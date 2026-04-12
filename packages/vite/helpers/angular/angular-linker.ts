import type { Plugin } from 'vite';
import { createRequire } from 'node:module';
import { ensureSharedAngularLinker, resolveAngularFileSystem } from './shared-linker.js';
import { containsRealNgDeclare } from './util.js';

/**
 * Vite plugin to run Angular linker (Babel) over partial-compiled Angular libraries
 * inside node_modules (e.g., @angular/*, @nativescript/angular).
 *
 * This converts ɵɵngDeclare* calls to ɵɵdefine* so runtime doesn't require the JIT compiler.
 */
export function angularLinkerVitePlugin(projectRoot?: string): Plugin {
	const req = createRequire(projectRoot ? projectRoot + '/package.json' : import.meta.url);
	let babel: typeof import('@babel/core') | null = null;
	let createLinker: any = null;
	let angularFileSystem: any = null;

	async function ensureDeps() {
		if (babel && createLinker) return;
		try {
			const babelPath = req.resolve('@babel/core');
			const linkerPath = req.resolve('@angular/compiler-cli/linker/babel');
			babel = (await import(babelPath)) as any;
			const linkerMod = await import(linkerPath);
			createLinker = (linkerMod as any).createLinkerPlugin || (linkerMod as any).createEs2015LinkerPlugin || null;
		} catch {
			// Fall back to hoisted resolution if necessary
			try {
				babel = (await import('@babel/core')) as any;
			} catch {}
			try {
				const linkerMod = await import('@angular/compiler-cli/linker/babel');
				createLinker = (linkerMod as any).createLinkerPlugin || (linkerMod as any).createEs2015LinkerPlugin || null;
			} catch {}
		}
		if (!angularFileSystem) {
			angularFileSystem = await resolveAngularFileSystem(projectRoot);
		}
	}

	// Base filter: Angular framework libraries + NativeScript Angular + its polyfills bundle.
	const FILTER = /node_modules\/(?:@angular|@nativescript\/angular)\/.*\.[mc]?js$|nativescript-angular-polyfills\.mjs$/;
	// Extended filter: ANY node_modules .js/.mjs file. Used to catch Angular
	// ecosystem packages (ngrx, etc.) that contain ɵɵngDeclare* partial
	// declarations. In Vite 8 watch-mode rebuilds, chunk-level linker fallbacks
	// may not re-run for cached chunks, so we must link at the transform level.
	const NODE_MODULES_FILTER = /node_modules\/.*\.[mc]?js$/;
	// When NS_STRICT_NG_LINK_ALL=1 we aggressively try to link **any** JS/ESM
	// file that contains a real ɵɵngDeclare* call site, not just node_modules.
	// This is primarily for NativeScript strict / HMR flows so that no partial
	// declarations survive into the device bundle and trigger the JIT runtime.
	const strictAll = process.env.NS_STRICT_NG_LINK_ALL === '1' || process.env.NS_STRICT_NG_LINK_ALL === 'true';

	return {
		name: 'ns-angular-linker-vite',
		enforce: 'pre',
		async load(id) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			const cleanId = id.split('?', 1)[0];
			// Always process Angular framework libraries. For other node_modules,
			// check if they contain ɵɵngDeclare* (catches @ngrx, etc.).
			if (!strictAll && !FILTER.test(cleanId)) {
				if (!NODE_MODULES_FILTER.test(cleanId)) return null;
				// For non-framework node_modules, peek at the file to see if it has partials
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
				// Under NS_STRICT_NG_LINK_ALL we will attempt to link **any** file
				// that actually contains a ɵɵngDeclare* call site.
				if (strictAll && !FILTER.test(cleanId) && !containsRealNgDeclare(code)) return null;
				const { babel, linkerPlugin } = await ensureSharedAngularLinker(projectRoot);
				if (!babel || !linkerPlugin) return null;
				if (debug) {
					try {
						console.log('[ns-angular-linker][vite-load] linking', cleanId);
					} catch {}
				}
				const result = await (babel as any).transformAsync(code, {
					filename: cleanId,
					configFile: false,
					babelrc: false,
					sourceMaps: false,
					compact: false,
					plugins: [linkerPlugin],
				});
				if (result?.code && result.code !== code) {
					return { code: result.code, map: null } as any;
				}
			} catch {}
			return null;
		},
		async transform(code, id) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			// Strip Vite/Rollup query strings before testing
			const cleanId = id.split('?', 1)[0];
			// Always process Angular framework libraries. For other node_modules,
			// only link if they contain ɵɵngDeclare* (catches @ngrx, etc.).
			if (!strictAll && !FILTER.test(cleanId)) {
				if (!NODE_MODULES_FILTER.test(cleanId) || !code || !containsRealNgDeclare(code)) return null;
			}
			if (!code) return null;
			if (strictAll && !FILTER.test(cleanId) && !containsRealNgDeclare(code)) return null;
			await ensureDeps();
			if (!babel || !createLinker) return null;
			try {
				const plugin = createLinker({ sourceMapping: false, fileSystem: angularFileSystem });
				if (debug) {
					try {
						console.log('[ns-angular-linker][vite] linking', cleanId);
					} catch {}
				}
				const result = await (babel as any).transformAsync(code, {
					filename: cleanId,
					configFile: false,
					babelrc: false,
					sourceMaps: false,
					compact: false,
					plugins: [plugin],
				});
				if (result?.code && result.code !== code) {
					return { code: result.code, map: null };
				}
			} catch {
				// Soft-fail; return original code
			}
			return null;
		},
	};
}

/**
 * Post-phase linker: catches any ɵɵngDeclare* introduced by downstream transforms (e.g., optimizer)
 * including in project source, after other plugins have run.
 */
export function angularLinkerVitePluginPost(projectRoot?: string): Plugin {
	return {
		name: 'ns-angular-linker-vite-post',
		enforce: 'post',
		async transform(code, id) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			// Only JS/ESM files
			if (!/\.(m?js)(\?|$)/.test(id)) return null;
			if (!code || !containsRealNgDeclare(code)) return null;
			const { babel, linkerPlugin } = await ensureSharedAngularLinker(projectRoot);
			if (!babel || !linkerPlugin) return null;
			try {
				if (debug) {
					try {
						console.log('[ns-angular-linker][vite-post] linking', id.split('?', 1)[0]);
					} catch {}
				}
				const result = await (babel as any).transformAsync(code, {
					filename: id.split('?', 1)[0],
					configFile: false,
					babelrc: false,
					sourceMaps: false,
					compact: false,
					plugins: [linkerPlugin],
				});
				if (result?.code && result.code !== code) {
					return { code: result.code, map: null };
				}
			} catch {}
			return null;
		},
	};
}
