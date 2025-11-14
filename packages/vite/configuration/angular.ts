import { mergeConfig, type UserConfig, type Plugin } from 'vite';
import path from 'path';
import { createRequire } from 'node:module';
import angular from '@analogjs/vite-plugin-angular';
import { angularLinkerVitePlugin, angularLinkerVitePluginPost } from '../helpers/angular-linker.js';
import { baseConfig } from './base.js';

// Rollup-level linker to guarantee Angular libraries are linked when included in the bundle graph.
function angularRollupLinker(projectRoot?: string): Plugin {
	let babel: any = null;
	let createLinker: any = null;
	const FILTER = /node_modules\/(?:@angular|@nativescript\/angular)\/.*\.[mc]?js$/;

	async function ensureDeps() {
		if (babel && createLinker) return;
		try {
			const req = createRequire((projectRoot ? projectRoot + '/package.json' : import.meta.url) as any);
			const babelPath = req.resolve('@babel/core');

			const linkerPath = req.resolve('@angular/compiler-cli/linker/babel');
			babel = await import(babelPath);
			const linkerMod: any = await import(linkerPath);
			createLinker = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin;
		} catch {
			try {
				babel = await import('@babel/core');
			} catch {}
			try {
				const linkerMod: any = await import('@angular/compiler-cli/linker/babel');
				createLinker = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin;
			} catch {}
		}
	}

	return {
		name: 'ns-angular-linker-rollup',
		enforce: 'pre',
		apply: 'build',
		async load(id) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			const cleanId = id.split('?', 1)[0];
			if (!FILTER.test(cleanId)) return null;
			try {
				await ensureDeps();
				if (!babel || !createLinker) return null;
				const fs = await import('node:fs/promises');
				const code = await fs.readFile(cleanId, 'utf8');
				const forceLink = cleanId.includes('/node_modules/@nativescript/angular/') && cleanId.includes('polyfills');
				if (!code) return null;
				if (!forceLink && code.indexOf('\u0275\u0275ngDeclare') === -1 && code.indexOf('ɵɵngDeclare') === -1 && code.indexOf('ngDeclare') === -1) return null;
				const plugin = createLinker({ sourceMapping: false });
				if (debug) {
					try {
						console.log('[ns-angular-linker][rollup-load] linking', cleanId);
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
					return { code: result.code, map: null } as any;
				}
			} catch {}
			return null;
		},
		async transform(code, id) {
			const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';
			const cleanId = id.split('?', 1)[0];
			if (!FILTER.test(cleanId)) return null;
			const forceLink = cleanId.includes('/node_modules/@nativescript/angular/') && cleanId.includes('polyfills');
			if (!code) return null;
			if (!forceLink && code.indexOf('\u0275\u0275ngDeclare') === -1 && code.indexOf('ɵɵngDeclare') === -1 && code.indexOf('ngDeclare') === -1) return null;
			await ensureDeps();
			if (!babel || !createLinker) return null;
			try {
				const plugin = createLinker({ sourceMapping: false });
				if (debug) {
					try {
						console.log('[ns-angular-linker][rollup] linking', cleanId);
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
			} catch {}
			return null;
		},
	};
}

const plugins = [
	// Allow external html template changes to trigger hot reload: Make .ts files depend on their .html templates
	{
		name: 'angular-template-deps',
		transform(code, id) {
			// For .ts files that reference templateUrl, add the .html file as a dependency
			if (id.endsWith('.ts') && code.includes('templateUrl')) {
				const templateUrlMatch = code.match(/templateUrl:\s*['"]\.\/(.*?\.html)['"]/);
				if (templateUrlMatch) {
					const htmlPath = path.resolve(path.dirname(id), templateUrlMatch[1]);
					// Add the HTML file as a dependency so Vite watches it
					this.addWatchFile(htmlPath);
				}
			}
			return null;
		},
	},
	// Transform Angular partial declarations in node_modules to avoid runtime JIT
	// Pass the project root so linker deps resolve from the app, not the plugin package.
	angularLinkerVitePlugin(process.cwd()),
	// Simplify: rely on Vite pre plugin (load/transform) for linking; Rollup safety net disabled unless re-enabled later
	// angularRollupLinker(process.cwd()),
	angular({
		liveReload: false, // Disable live reload in favor of HMR
	}),
	// Post-phase linker to catch any declarations introduced after other transforms (including project code)
	angularLinkerVitePluginPost(process.cwd()),
	// Enforce: fully disable dependency optimization during serve to avoid rxjs esm5 crawling and OOM
	{
		name: 'ns-disable-optimize-deps',
		enforce: 'post',
		apply: 'serve',
		config(userConfig) {
			const od = (userConfig as any)?.optimizeDeps || {};
			const prevExclude: string[] = Array.isArray(od.exclude) ? od.exclude : [];
			const exclude = new Set<string>(prevExclude);
			['@nativescript/core', 'rxjs', '@valor/nativescript-websockets', 'set-value', 'react', 'react-reconciler', 'react-nativescript'].forEach((x) => exclude.add(x));
			return {
				optimizeDeps: {
					noDiscovery: true,
					entries: [],
					include: [],
					exclude: Array.from(exclude),
					esbuildOptions: {
						...(od.esbuildOptions || {}),
						plugins: [],
					},
				},
			} as any;
		},
	},
];

export const angularConfig = ({ mode }): UserConfig => {
	const disableAnimations = true;
	//process.env.NS_DISABLE_NG_ANIMATIONS === "1" ||
	//process.env.NS_DISABLE_NG_ANIMATIONS === "true";

	// Post-link emitted chunks to catch any remaining partial declarations that slipped through
	// due to plugin order or external transforms.
	const postLinker = {
		name: 'ns-angular-linker-post',
		apply: 'build' as const,
		enforce: 'post' as const,
		async generateBundle(_options, bundle) {
			function containsRealNgDeclare(src: string): boolean {
				// scan while skipping strings and comments; detect ɵɵngDeclare outside them
				let inStr = false,
					strCh = '',
					esc = false,
					inBlk = false,
					inLine = false;
				for (let i = 0; i < src.length; i++) {
					const ch = src[i];
					const next = src[i + 1];
					if (inLine) {
						if (ch === '\n') inLine = false;
						continue;
					}
					if (inBlk) {
						if (ch === '*' && next === '/') {
							inBlk = false;
							i++;
						}
						continue;
					}
					if (inStr) {
						if (esc) {
							esc = false;
							continue;
						}
						if (ch === '\\') {
							esc = true;
							continue;
						}
						if (ch === strCh) {
							inStr = false;
							strCh = '';
						}
						continue;
					}
					if (ch === '/' && next === '/') {
						inLine = true;
						i++;
						continue;
					}
					if (ch === '/' && next === '*') {
						inBlk = true;
						i++;
						continue;
					}
					if (ch === '"' || ch === "'" || ch === '`') {
						inStr = true;
						strCh = ch;
						continue;
					}
					// fast path for ɵ + call-like ngDeclare pattern (e.g., ɵɵngDeclareDirective(...))
					if (ch === 'ɵ' && next === 'ɵ' && src.startsWith('ɵɵngDeclare', i)) {
						let j = i + 'ɵɵngDeclare'.length;
						// consume identifier tail (e.g., ClassMetadata, Directive, Component, Factory, Injectable, etc.)
						while (j < src.length) {
							const cj = src.charCodeAt(j);
							// [A-Za-z0-9_$]
							if ((cj >= 65 && cj <= 90) || (cj >= 97 && cj <= 122) || (cj >= 48 && cj <= 57) || cj === 95 || cj === 36) j++;
							else break;
						}
						// skip whitespace
						while (j < src.length && /\s/.test(src[j])) j++;
						if (src[j] === '(') return true; // it's a call site
					}
				}
				return false;
			}
			// Lazy load linker deps to avoid hard coupling
			let babel: any = null;
			let createLinker: any = null;
			try {
				babel = await import('@babel/core');
				const linkerMod: any = await import('@angular/compiler-cli/linker/babel');
				createLinker = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin;
			} catch {
				return; // no linker available
			}
			if (!babel || !createLinker) return;
			const plugin = createLinker({ sourceMapping: false });
			const strict = process.env.NS_STRICT_NG_LINK === '1' || process.env.NS_STRICT_NG_LINK === 'true';
			const enforceStrict = process.env.NS_STRICT_NG_LINK_ENFORCE === '1' || process.env.NS_STRICT_NG_LINK_ENFORCE === 'true';
			const debug = process.env.VITE_DEBUG_LOGS === '1' || process.env.VITE_DEBUG_LOGS === 'true';
			const unlinked: string[] = [];
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (!fileName.endsWith('.mjs') && !fileName.endsWith('.js')) continue;
				if (chunk && (chunk as any).type === 'chunk') {
					const code = (chunk as any).code as string;
					if (!code) continue;
					try {
						const res = await (babel as any).transformAsync(code, {
							filename: fileName,
							configFile: false,
							babelrc: false,
							sourceMaps: false,
							compact: false,
							plugins: [plugin],
						});
						if (res?.code && res.code !== code) {
							(chunk as any).code = res.code;
							if (debug) {
								try {
									console.log('[ns-angular-linker][post] linked', fileName);
								} catch {}
							}
						} else if (strict) {
							// Only flag if we still detect actual Ivy partial declarations (ɵɵngDeclare*) outside strings/comments
							if (containsRealNgDeclare(code)) {
								unlinked.push(fileName);
							}
						}
					} catch {
						// best effort; keep original code
						if (strict) unlinked.push(fileName);
					}
				}
			}
			if (strict && unlinked.length) {
				// Provide extra diagnostics: list a few module ids from bundle to locate offending sources
				const details: string[] = [];
				for (const fname of unlinked) {
					const chunk: any = (bundle as any)[fname];
					const modIds = chunk?.modules
						? Object.keys(chunk.modules)
								.filter((m) => /node_modules\/(?:@angular|@nativescript\/angular)\//.test(m))
								.slice(0, 8)
						: [];
					// Add a small code excerpt around the first occurrence for easier inspection
					let snippet = '';
					try {
						const code = (chunk as any).code as string;
						const idx = code.indexOf('ɵɵngDeclare');
						if (idx !== -1) {
							const start = Math.max(0, idx - 80);
							const end = Math.min(code.length, idx + 80);
							snippet = `\n    snippet: ${code.slice(start, end).replace(/\n/g, ' ')}`;
						}
					} catch {}
					details.push(` - ${fname}${modIds.length ? `\n    from: ${modIds.join('\n           ')}` : ''}${snippet}`);
				}
				const message = `Angular linker strict mode: found unlinked partial declarations in emitted chunks: \n` + details.join('\n') + `\nSet NS_STRICT_NG_LINK=0 to disable this check. Set NS_STRICT_NG_LINK_ENFORCE=1 to make this a hard error.`;
				if (enforceStrict) {
					throw new Error(message);
				} else {
					try {
						console.warn(`[ns-angular-linker-post] ${message}`);
					} catch {}
				}
			}
		},
	};

	// Safety net: transform each rendered chunk to link any remaining ɵɵngDeclare* call sites
	const renderChunkLinker = {
		name: 'ns-angular-linker-render',
		apply: 'build' as const,
		enforce: 'post' as const,
		async renderChunk(code: string, chunk: any) {
			try {
				if (!code) return null;
				// quick guard: look for real ɵɵngDeclare call outside strings/comments
				const hasReal = (() => {
					let inStr = false,
						strCh = '',
						esc = false,
						inBlk = false,
						inLine = false;
					for (let i = 0; i < code.length; i++) {
						const ch = code[i],
							n = code[i + 1];
						if (inLine) {
							if (ch === '\n') inLine = false;
							continue;
						}
						if (inBlk) {
							if (ch === '*' && n === '/') {
								inBlk = false;
								i++;
							}
							continue;
						}
						if (inStr) {
							if (esc) {
								esc = false;
								continue;
							}
							if (ch === '\\') {
								esc = true;
								continue;
							}
							if (ch === strCh) {
								inStr = false;
								strCh = '';
							}
							continue;
						}
						if (ch === '/' && n === '/') {
							inLine = true;
							i++;
							continue;
						}
						if (ch === '/' && n === '*') {
							inBlk = true;
							i++;
							continue;
						}
						if (ch === '"' || ch === "'" || ch === '`') {
							inStr = true;
							strCh = ch;
							continue;
						}
						if (ch === 'ɵ' && n === 'ɵ' && code.startsWith('ɵɵngDeclare', i)) {
							let j = i + 'ɵɵngDeclare'.length;
							while (j < code.length) {
								const cj = code.charCodeAt(j);
								if ((cj >= 65 && cj <= 90) || (cj >= 97 && cj <= 122) || (cj >= 48 && cj <= 57) || cj === 95 || cj === 36) j++;
								else break;
							}
							while (j < code.length && /\s/.test(code[j])) j++;
							if (code[j] === '(') return true;
						}
					}
					return false;
				})();
				if (!hasReal) return null;
				const babel: any = await import('@babel/core');
				const linkerMod: any = await import('@angular/compiler-cli/linker/babel');
				const createLinker = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin;
				if (!babel || !createLinker) return null;
				const plugin = createLinker({ sourceMapping: false });
				const result = await (babel as any).transformAsync(code, {
					filename: chunk.fileName || chunk.name || 'chunk.mjs',
					configFile: false,
					babelrc: false,
					sourceMaps: false,
					compact: false,
					plugins: [plugin],
				});
				if (result?.code && result.code !== code) {
					return { code: result.code, map: null };
				}
			} catch {}
			return null;
		},
	};

	const enableRollupLinker = process.env.NS_ENABLE_ROLLUP_LINKER === '1' || process.env.NS_ENABLE_ROLLUP_LINKER === 'true';

	return mergeConfig(baseConfig({ mode }), {
		plugins: [...plugins, ...(enableRollupLinker ? [angularRollupLinker(process.cwd())] : []), renderChunkLinker, postLinker],
		// Always alias fesm2022 deep imports to package root so vendor bridge can externalize properly
		resolve: {
			alias: [
				// Map Angular deep ESM paths to bare package ids
				{ find: /^@angular\/([^/]+)\/fesm2022\/.*\.mjs$/, replacement: '@angular/$1' },
				{ find: /^@nativescript\/angular\/fesm2022\/.*\.mjs$/, replacement: '@nativescript/angular' },
				// Prefer modern RxJS builds; avoid esm5 which explodes module count and memory
				{ find: /^rxjs\/dist\/esm5\/(.*)$/, replacement: 'rxjs/dist/esm2015/$1' },
				{ find: /^rxjs\/operators$/, replacement: 'rxjs/dist/esm2015/operators/index.js' },
				{ find: /^rxjs$/, replacement: 'rxjs/dist/esm2015/index.js' },
				// Existing optional animations shims
			],
		},
		...(disableAnimations && {
			resolve: {
				alias: [
					{
						find: /^@angular\/animations(\/.+)?$/, // match subpaths too
						replacement: new URL('../shims/angular-animations-stub.js', import.meta.url).pathname,
					},
					{
						find: /^@angular\/platform-browser\/animations(\/.+)?$/,
						replacement: new URL('../shims/angular-animations-stub.js', import.meta.url).pathname,
					},
				],
			},
		}),
		// Disable dependency optimization entirely for NativeScript Angular HMR.
		// Vite 5.1+: use noDiscovery with an empty include list (disabled was removed).
		// The HTTP loader + vendor bridge manage dependencies; pre-bundling can OOM.
		optimizeDeps: {
			noDiscovery: true,
			include: [],
			entries: [],
			exclude: ['@nativescript/core', 'rxjs'],
			esbuildOptions: { plugins: [] },
		},
	});
};
