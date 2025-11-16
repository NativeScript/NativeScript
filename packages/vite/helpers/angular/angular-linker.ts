import type { Plugin } from 'vite';
import { createRequire } from 'node:module';
import { ensureSharedAngularLinker } from './shared-linker.js';
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
	}

	// Base filter: Angular framework libraries + NativeScript Angular + its polyfills bundle.
	const FILTER = /node_modules\/(?:@angular|@nativescript\/angular)\/.*\.[mc]?js$|nativescript-angular-polyfills\.mjs$/;
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
			// In non-strict mode we only ever touch Angular framework libraries.
			if (!strictAll && !FILTER.test(cleanId)) return null;
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
			// Same policy as load(): in strictAll we allow any file that actually
			// contains a real ngDeclare call; otherwise we restrict to framework libs.
			if (!strictAll && !FILTER.test(cleanId)) return null;
			if (!code) return null;
			if (strictAll && !FILTER.test(cleanId) && !containsRealNgDeclare(code)) return null;
			await ensureDeps();
			if (!babel || !createLinker) return null;
			try {
				const plugin = createLinker({ sourceMapping: false });
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
	const req = createRequire(projectRoot ? projectRoot + '/package.json' : import.meta.url);
	let babel: typeof import('@babel/core') | null = null;
	let createLinker: any = null;

	async function ensureDeps() {
		if (babel && createLinker) return;
		try {
			const babelPath = req.resolve('@babel/core');
			const linkerPath = req.resolve('@angular/compiler-cli/linker/babel');
			babel = (await import(babelPath)) as any;
			const linkerMod = await import(linkerPath);
			createLinker = (linkerMod as any).createLinkerPlugin || (linkerMod as any).createEs2015LinkerPlugin || null;
		} catch {
			try {
				babel = (await import('@babel/core')) as any;
			} catch {}
			try {
				const linkerMod = await import('@angular/compiler-cli/linker/babel');
				createLinker = (linkerMod as any).createLinkerPlugin || (linkerMod as any).createEs2015LinkerPlugin || null;
			} catch {}
		}
	}

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
