import { mergeConfig, type UserConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import angular from '@analogjs/vite-plugin-angular';
import { angularLinkerVitePlugin, angularLinkerVitePluginPost } from '../helpers/angular/angular-linker.js';
import { synthesizeMissingInjectableFactories } from '../helpers/angular/synthesize-injectable-factories.js';
import { ensureSharedAngularLinker, resolveAngularFileSystem } from '../helpers/angular/shared-linker.js';
import { inlineDecoratorComponentTemplates } from '../helpers/angular/inline-decorator-component-templates.js';
import { synthesizeDecoratorCtorParameters } from '../helpers/angular/synthesize-decorator-ctor-parameters.js';
import { containsRealNgDeclare } from '../helpers/angular/util.js';
import { baseConfig } from './base.js';
import { getCliFlags } from '../helpers/cli-flags.js';
import { resolveRelativeToImportMeta } from '../helpers/import-meta-path.js';

// Lazily import the Angular linker factory function. Used by chunk-level linkers
// to create FRESH plugin instances per invocation (avoiding stale state in watch mode).
let _cachedLinkerFactory: any = null;
async function importLinkerFactory(): Promise<any> {
	if (_cachedLinkerFactory) return _cachedLinkerFactory;
	const req = createRequire(process.cwd() + '/package.json');
	try {
		const linkerPath = req.resolve('@angular/compiler-cli/linker/babel');
		const linkerMod: any = await import(linkerPath);
		_cachedLinkerFactory = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin || null;
	} catch {
		try {
			const linkerMod: any = await import('@angular/compiler-cli/linker/babel');
			_cachedLinkerFactory = linkerMod.createLinkerPlugin || linkerMod.createEs2015LinkerPlugin || null;
		} catch {}
	}
	return _cachedLinkerFactory;
}

// Rollup-level linker to guarantee Angular libraries are linked when included in the bundle graph.
function angularRollupLinker(projectRoot?: string): Plugin {
	let babel: any = null;
	let createLinker: any = null;
	let angularFileSystem: any = null;
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
		if (!angularFileSystem) {
			angularFileSystem = await resolveAngularFileSystem(projectRoot);
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
				const plugin = createLinker({ sourceMapping: false, fileSystem: angularFileSystem });
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
				const plugin = createLinker({ sourceMapping: false, fileSystem: angularFileSystem });
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

const cliFlags = getCliFlags();
const isDevEnv = process.env.NODE_ENV !== 'production';
const hmrActive = isDevEnv && !!cliFlags.hmr;

const projectRoot = process.cwd();
const tsConfigAppPath = path.resolve(projectRoot, 'tsconfig.app.json');
const tsConfigPath = path.resolve(projectRoot, 'tsconfig.json');
let tsConfig = tsConfigAppPath;
if (!fs.existsSync(tsConfigAppPath) && fs.existsSync(tsConfigPath)) {
	tsConfig = tsConfigPath;
}

function createAngularPlugins(): Plugin[] {
	return [
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
		...angular({
			liveReload: false, // Disable live reload in favor of HMR
			tsconfig: tsConfig,
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
						rolldownOptions: {
							...(od.rolldownOptions || {}),
							plugins: [],
						},
					},
				} as any;
			},
			configResolved(resolved) {
				const resolvedConfig = resolved as any;
				const deps = (resolvedConfig.optimizeDeps ||= {} as any);
				deps.noDiscovery = true;
				deps.entries = [];
				deps.include = [];
				const exclude = new Set<string>(Array.isArray(deps.exclude) ? deps.exclude : []);
				['@nativescript/core', 'rxjs', '@valor/nativescript-websockets', 'set-value', 'react', 'react-reconciler', 'react-nativescript'].forEach((x) => exclude.add(x));
				deps.exclude = Array.from(exclude);
				const rolldownOptions = (deps.rolldownOptions ||= {});
				rolldownOptions.plugins = [];
			},
		},
	];
}

export const angularConfig = ({ mode }): UserConfig => {
	const plugins = createAngularPlugins();
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
			function isNsAngularPolyfillsChunk(chunk: any): boolean {
				if (!chunk || !(chunk as any).modules) return false;
				return Object.keys((chunk as any).modules).some((m) => m.includes('node_modules/@nativescript/angular/fesm2022/nativescript-angular-polyfills.mjs'));
			}
			const { babel } = await ensureSharedAngularLinker(process.cwd());
			if (!babel) return;
			const fileSystem = await resolveAngularFileSystem(process.cwd());
			const linkerFactory = await importLinkerFactory();
			if (!linkerFactory) return;
			const strict = process.env.NS_STRICT_NG_LINK === '1' || process.env.NS_STRICT_NG_LINK === 'true';
			const enforceStrict = process.env.NS_STRICT_NG_LINK_ENFORCE === '1' || process.env.NS_STRICT_NG_LINK_ENFORCE === 'true';
			const debug = process.env.VITE_DEBUG_LOGS === '1' || process.env.VITE_DEBUG_LOGS === 'true';
			const unlinked: string[] = [];
			const vendorInjectExport = (() => {
				const vendorChunk = Object.entries(bundle).find(([name, value]) => value && (value as any).type === 'chunk' && /(^|\/)vendor\.mjs$/.test(name));
				const vendorCode = vendorChunk ? ((vendorChunk[1] as any).code as string | undefined) : undefined;
				return vendorCode?.match(/\binject as ([A-Za-z_$][\w$]*)/)?.[1];
			})();
			for (const [fileName, chunk] of Object.entries(bundle)) {
				if (!fileName.endsWith('.mjs') && !fileName.endsWith('.js')) continue;
				if (chunk && (chunk as any).type === 'chunk') {
					const code = (chunk as any).code as string;
					if (!code) continue;
					const isNsPolyfills = isNsAngularPolyfillsChunk(chunk);
					try {
						// Create a FRESH linker plugin per chunk — the linker may have
						// internal state that becomes stale across watch-mode rebuild cycles.
						const freshPlugin = linkerFactory({ sourceMapping: false, fileSystem } as any);
						const res = await (babel as any).transformAsync(code, {
							filename: fileName,
							configFile: false,
							babelrc: false,
							sourceMaps: false,
							compact: false,
							plugins: [freshPlugin],
						});
						const linkedCode = res?.code && res.code !== code ? res.code : code;
						const codeWithInjectables = synthesizeMissingInjectableFactories(linkedCode, {
							vendorInjectExport,
						});
						const codeWithCtorParameters = synthesizeDecoratorCtorParameters(codeWithInjectables);
						const finalCode = inlineDecoratorComponentTemplates(codeWithCtorParameters, {
							projectRoot: process.cwd(),
						});
						if (finalCode !== code) {
							(chunk as any).code = finalCode;
							if (debug) {
								try {
									console.log('[ns-angular-linker][post] linked', fileName, isNsPolyfills ? '(polyfills)' : '');
								} catch {}
							}
						}
						if (strict && !isNsPolyfills && containsRealNgDeclare(finalCode)) {
							unlinked.push(fileName);
						}
					} catch (e: any) {
						console.warn(`[ns-angular-linker][post] linking FAILED for ${fileName}:`, e?.message || e);
						if (strict) unlinked.push(fileName);
					}
				}
			}
			if (strict && unlinked.length) {
				const details: string[] = [];
				for (const fname of unlinked) {
					const chunk: any = (bundle as any)[fname];
					const modIds = chunk?.modules
						? Object.keys(chunk.modules)
								.filter((m) => /node_modules\/(?:@angular|@nativescript\/angular)\//.test(m))
								.slice(0, 8)
						: [];
					const isOnlyPolyfills = modIds.length > 0 && modIds.every((m) => m.includes('node_modules/@nativescript/angular/fesm2022/nativescript-angular-polyfills.mjs'));
					if (isOnlyPolyfills) continue;
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
				if (!details.length) return;
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

	// Safety net: transform each rendered chunk to link any remaining ɵɵngDeclare* call sites.
	// IMPORTANT: create a FRESH linker plugin per invocation — the shared instance may have
	// stale internal state from a prior build cycle, causing silent failures in watch-mode rebuilds.
	const renderChunkLinker = {
		name: 'ns-angular-linker-render',
		apply: 'build' as const,
		enforce: 'post' as const,
		async renderChunk(code: string, chunk: any) {
			if (!code) return null;
			if (!containsRealNgDeclare(code)) return null;
			const filename = chunk.fileName || chunk.name || 'chunk.mjs';
			const debug = process.env.VITE_DEBUG_LOGS === '1' || process.env.VITE_DEBUG_LOGS === 'true';
			try {
				const { babel } = await ensureSharedAngularLinker(process.cwd());
				if (!babel) return null;
				const fileSystem = await resolveAngularFileSystem(process.cwd());
				// Fresh plugin per chunk — avoids stale linker state across watch-mode rebuilds
				const freshPlugin = (await importLinkerFactory())?.({ sourceMapping: false, fileSystem } as any);
				if (!freshPlugin) return null;
				const runLink = async (input: string) => {
					const result = await (babel as any).transformAsync(input, {
						filename,
						configFile: false,
						babelrc: false,
						sourceMaps: false,
						compact: false,
						plugins: [freshPlugin],
					});
					return result?.code ?? input;
				};
				let transformed = await runLink(code);
				if (containsRealNgDeclare(transformed)) {
					transformed = await runLink(transformed);
				}
				if (transformed !== code) {
					if (debug) {
						try {
							console.log('[ns-angular-linker][render] linked', filename);
						} catch {}
					}
					return { code: transformed, map: null };
				}
			} catch (e: any) {
				console.warn(`[ns-angular-linker][render] linking FAILED for ${filename}:`, e?.message || e);
			}
			return null;
		},
	};

	const enableRollupLinker = process.env.NS_ENABLE_ROLLUP_LINKER === '1' || process.env.NS_ENABLE_ROLLUP_LINKER === 'true' || hmrActive;

	// Build a single merged alias array to avoid property override conflicts.
	// Previously the disableAnimations spread added a second `resolve` key
	// that silently clobbered the fesm2022 and RxJS aliases.
	const angularAliases: { find: RegExp; replacement: string }[] = [
		// Map Angular deep ESM paths to bare package ids
		{ find: /^@angular\/([^/]+)\/fesm2022\/.*\.mjs$/, replacement: '@angular/$1' },
		{ find: /^@nativescript\/angular\/fesm2022\/.*\.mjs$/, replacement: '@nativescript/angular' },
		// RxJS esm5 → esm redirects removed: Vite 8 enforces the rxjs `exports` field,
		// blocking deep path aliases. Instead, the `es2015` resolve condition is added
		// below so rxjs resolves to its modern ESM builds via the exports map.
	];
	if (disableAnimations) {
		angularAliases.push(
			{
				find: /^@angular\/animations(\/.+)?$/, // match subpaths too
				replacement: resolveRelativeToImportMeta(import.meta.url, '../shims/angular-animations-stub.js'),
			},
			{
				find: /^@angular\/platform-browser\/animations(\/.+)?$/,
				replacement: resolveRelativeToImportMeta(import.meta.url, '../shims/angular-animations-stub.js'),
			},
		);
	}

	return mergeConfig(baseConfig({ mode, flavor: 'angular' }), {
		plugins: [...plugins, ...(enableRollupLinker ? [angularRollupLinker(process.cwd())] : []), renderChunkLinker, postLinker],
		resolve: {
			alias: angularAliases,
			// Add 'es2015' condition so RxJS resolves to dist/esm (modern ESM) rather
			// than dist/esm5 via the 'default' condition. This avoids the esm5 module
			// explosion and OOM while respecting the package's exports field in Vite 8.
			conditions: ['es2015'],
		},
		// Disable dependency optimization entirely for NativeScript Angular HMR.
		// Vite 5.1+: use noDiscovery with an empty include list (disabled was removed).
		// The HTTP loader + vendor bridge manage dependencies; pre-bundling can OOM.
		optimizeDeps: {
			noDiscovery: true,
			include: [],
			entries: [],
			exclude: ['@nativescript/core', 'rxjs'],
			rolldownOptions: { plugins: [] },
		},
	});
};
