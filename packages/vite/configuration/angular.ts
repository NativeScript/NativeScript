import { mergeConfig, type UserConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { angularLinkerVitePlugin, angularLinkerVitePluginPost } from '../hmr/frameworks/angular/build/angular-linker.js';
import { synthesizeMissingInjectableFactories } from '../hmr/frameworks/angular/build/synthesize-injectable-factories.js';
import { getAngularLinkerFactory, runAngularLinker } from '../hmr/frameworks/angular/build/shared-linker.js';
import { recordLinkerHit, reportLinkerLayerStats } from '../hmr/frameworks/angular/build/linker-stats.js';
import { inlineDecoratorComponentTemplates } from '../hmr/frameworks/angular/build/inline-decorator-component-templates.js';
import { appendComponentHmrRegistration, findComponentClassNames, INJECTION_MARKER as HMR_REGISTER_MARKER } from '../hmr/frameworks/angular/build/inject-component-hmr-registration.js';
import { injectAngularHmrViteIgnore } from '../hmr/frameworks/angular/build/inject-hmr-vite-ignore.js';
import { synthesizeDecoratorCtorParameters } from '../hmr/frameworks/angular/build/synthesize-decorator-ctor-parameters.js';
import { containsRealNgDeclare, stripJsComments } from '../hmr/frameworks/angular/build/util.js';
import { baseConfig } from './base.js';
import { getCliFlags } from '../helpers/cli-flags.js';
import { getMonorepoWorkspaceRoot } from '../helpers/project.js';
import { resolveRelativeToImportMeta } from '../helpers/import-meta-path.js';
import { resolveVerboseFlag } from '../helpers/logging.js';
import { NS_OPTIMIZE_DEPS_EXCLUDE } from '../helpers/optimize-deps.js';

function hasNgDeclarePartial(code: string): boolean {
	return code.indexOf('\u0275\u0275ngDeclare') !== -1 || code.indexOf('ɵɵngDeclare') !== -1 || code.indexOf('ngDeclare') !== -1;
}

// Rollup-level linker to guarantee Angular libraries are linked when included in the bundle graph.
function angularRollupLinker(projectRoot?: string): Plugin {
	const FILTER = /node_modules\/(?:@angular|@nativescript\/angular)\/.*\.[mc]?js$/;
	const debug = process.env.VITE_DEBUG_LOGS === 'true' || process.env.VITE_DEBUG_LOGS === '1';

	return {
		name: 'ns-angular-linker-rollup',
		enforce: 'pre',
		apply: 'build',
		async load(id) {
			const cleanId = normalizeAngularWatchPath(id);
			if (!FILTER.test(cleanId)) return null;
			try {
				const fs = await import('node:fs/promises');
				const code = await fs.readFile(cleanId, 'utf8');
				const forceLink = cleanId.includes('/node_modules/@nativescript/angular/') && cleanId.includes('polyfills');
				if (!code) return null;
				if (!forceLink && !hasNgDeclarePartial(code)) return null;
				const linked = await runAngularLinker(code, { filename: cleanId, projectRoot, freshPlugin: true });
				if (linked) {
					recordLinkerHit('rollup-load');
					if (debug) console.log('[ns-angular-linker][rollup-load] linked', cleanId);
					return { code: linked, map: null } as any;
				}
			} catch {}
			return null;
		},
		async transform(code, id) {
			const cleanId = normalizeAngularWatchPath(id);
			if (!FILTER.test(cleanId)) return null;
			const forceLink = cleanId.includes('/node_modules/@nativescript/angular/') && cleanId.includes('polyfills');
			if (!code) return null;
			if (!forceLink && !hasNgDeclarePartial(code)) return null;
			try {
				const linked = await runAngularLinker(code, { filename: cleanId, projectRoot, freshPlugin: true });
				if (linked) {
					recordLinkerHit('rollup');
					if (debug) console.log('[ns-angular-linker][rollup] linked', cleanId);
					return { code: linked, map: null };
				}
			} catch {}
			return null;
		},
	};
}

const cliFlags = getCliFlags()!;
const isDevEnv = process.env.NODE_ENV !== 'production';
const hmrActive = isDevEnv && !!cliFlags.hmr;

/**
 * Web-style template HMR opt-out (`NS_VITE_ANGULAR_LIVE_RELOAD=0`).
 *
 * With HMR active we default to the in-place template-replacement pipeline
 * (see the `liveReload` option below). If a project hits a regression
 * (broken styling, unresolved `?ngcomp=` imports), this env flag rolls back
 * to the legacy reboot pipeline without an upstream patch. `0`, `false`,
 * `off`, and `no` (case-insensitive) mean "off"; anything else — including
 * unset — keeps the new path on. Read once at module load, like `hmrActive`.
 */
const angularLiveReloadDisabledByEnv: boolean = (() => {
	const raw = process.env.NS_VITE_ANGULAR_LIVE_RELOAD;
	if (typeof raw !== 'string') return false;
	const v = raw.trim().toLowerCase();
	return v === '0' || v === 'false' || v === 'off' || v === 'no';
})();
const hmrAngularLiveReload = hmrActive && !angularLiveReloadDisabledByEnv;

const projectRoot = process.cwd();
const tsConfigAppPath = path.resolve(projectRoot, 'tsconfig.app.json');
const tsConfigPath = path.resolve(projectRoot, 'tsconfig.json');
let tsConfig = tsConfigAppPath;
if (!fs.existsSync(tsConfigAppPath) && fs.existsSync(tsConfigPath)) {
	tsConfig = tsConfigPath;
}

function normalizeAngularWatchPath(filePath: string): string {
	return filePath
		.split('?', 1)[0]
		.replace(/\\/g, '/')
		.replace(/^file:\/\//, '');
}

function normalizeAngularWatchKey(filePath: string): string {
	const normalizedPath = normalizeAngularWatchPath(filePath);
	const fileSystemPath = normalizedPath.startsWith('/@fs/') ? normalizedPath.slice('/@fs'.length) : normalizedPath;
	const normalizedProjectRoot = projectRoot.replace(/\\/g, '/').replace(/\/$/, '');

	if (normalizedProjectRoot && fileSystemPath.startsWith(normalizedProjectRoot)) {
		const relative = fileSystemPath.slice(normalizedProjectRoot.length);
		return relative.startsWith('/') ? relative : `/${relative}`;
	}

	return fileSystemPath;
}

function getAngularWatchKeys(filePath: string): string[] {
	const normalizedPath = normalizeAngularWatchPath(filePath);
	const keys = new Set<string>();
	keys.add(normalizedPath);
	keys.add(normalizeAngularWatchKey(normalizedPath));
	return Array.from(keys).filter(Boolean);
}

function resolveAngularWatchFilePath(filePath: string): string {
	const normalizedPath = normalizeAngularWatchPath(filePath);
	const fileSystemPath = normalizedPath.startsWith('/@fs/') ? normalizedPath.slice('/@fs'.length) : normalizedPath;

	if (path.isAbsolute(fileSystemPath) && fs.existsSync(fileSystemPath)) {
		return fileSystemPath;
	}

	if (fileSystemPath.startsWith('/')) {
		return path.resolve(projectRoot, `.${fileSystemPath}`);
	}

	return path.resolve(projectRoot, fileSystemPath);
}

function extractComponentAssetPaths(code: string, componentId: string): string[] {
	const componentPath = normalizeAngularWatchPath(componentId);
	const assetPaths = new Set<string>();
	const resolveAssetPath = (assetPath: string) => normalizeAngularWatchPath(path.resolve(path.dirname(componentPath), assetPath));

	// Blank out `//` and `/* */` comments before scanning. The regexes below
	// are intentionally simple (no JS parser) so they would otherwise match
	// commented-out `templateUrl` / `styleUrls` declarations and register
	// phantom asset deps via `addWatchFile`. In current Rolldown-Vite that
	// also enrolls them as `_addedImports`, which `vite:import-analysis`
	// then tries to resolve — surfacing as a misleading
	// `Failed to resolve import "<file>" from "<importer>". Does the file
	// exist?` pre-transform error if the file (predictably) doesn't exist.
	const scanCode = stripJsComments(code);

	const templateUrlMatch = scanCode.match(/templateUrl\s*:\s*['"](.+?\.(?:html|htm))['"]/);
	if (templateUrlMatch) {
		assetPaths.add(resolveAssetPath(templateUrlMatch[1]));
	}

	const styleUrlMatch = scanCode.match(/styleUrl\s*:\s*['"](.+?\.(?:css|less|sass|scss))['"]/);
	if (styleUrlMatch) {
		assetPaths.add(resolveAssetPath(styleUrlMatch[1]));
	}

	const styleUrlsMatch = scanCode.match(/styleUrls\s*:\s*\[([\s\S]*?)\]/m);
	if (styleUrlsMatch) {
		for (const match of styleUrlsMatch[1].matchAll(/['"](.+?\.(?:css|less|sass|scss))['"]/g)) {
			assetPaths.add(resolveAssetPath(match[1]));
		}
	}

	return Array.from(assetPaths);
}

/**
 * File replacement entry forwarded to `@analogjs/vite-plugin-angular`.
 * `replace` and `with` may be absolute paths or paths relative to
 * `workspaceRoot` (when supplied). The Analog plugin matches against the
 * resolved id with `endsWith(replace)`, so absolute paths Just Work in Nx
 * / pnpm / Rush layouts where the source tree may live above the project
 * root.
 */
export interface AngularFileReplacement {
	replace: string;
	with: string;
	ssr?: string;
}

function createAngularPlugins(opts: { useAngularCompilationAPI: boolean; fileReplacements?: AngularFileReplacement[]; workspaceRoot?: string }): Plugin[] {
	const verbose = resolveVerboseFlag();
	const assetToComponents = new Map<string, Set<string>>();
	const componentToAssets = new Map<string, Set<string>>();
	const pendingComponentInvalidations = new Set<string>();

	// Shared state between the `enforce: 'pre'` discovery plugin and the
	// `enforce: 'post'` injection plugin. Maps a clean (no-querystring)
	// .ts file id to the list of `@Component`-decorated class names found
	// in its RAW TypeScript source. The pre plugin populates this map;
	// the post plugin reads it to know which class names to register
	// against the compiled output. Cleared on each pre-plugin invocation
	// so renames or `@Component` removals don't leave stale entries.
	const componentsByCleanId = new Map<string, string[]>();

	const untrackComponentAssets = (componentPath: string) => {
		const previousAssets = componentToAssets.get(componentPath);
		if (!previousAssets) return;

		for (const assetPath of previousAssets) {
			const components = assetToComponents.get(assetPath);
			if (!components) continue;
			components.delete(componentPath);
			if (components.size === 0) {
				assetToComponents.delete(assetPath);
			}
		}

		componentToAssets.delete(componentPath);
	};

	const trackComponentAssets = (componentPath: string, assetPaths: string[]) => {
		untrackComponentAssets(componentPath);
		if (assetPaths.length === 0) return;

		const normalizedAssets = new Set(assetPaths.flatMap((assetPath) => getAngularWatchKeys(assetPath)));
		componentToAssets.set(componentPath, normalizedAssets);

		for (const assetPath of normalizedAssets) {
			const components = assetToComponents.get(assetPath) || new Set<string>();
			components.add(componentPath);
			assetToComponents.set(assetPath, components);
		}
	};

	const isCandidateComponentTs = (cleanId: string): boolean => {
		if (!cleanId.endsWith('.ts')) return false;
		if (cleanId.includes('/node_modules/')) return false;
		if (cleanId.endsWith('.d.ts')) return false;
		if (cleanId.endsWith('.spec.ts') || cleanId.endsWith('.test.ts')) return false;
		return true;
	};

	return [
		// HMR self-registration runs in two steps:
		//
		//   1. (this plugin, `enforce: 'pre'`) Record the names of
		//      `@Component`-decorated classes from the RAW TypeScript source
		//      into `componentsByCleanId` — discovery must happen pre-compile
		//      because the Analog plugin rewrites the textual decorator away.
		//   2. (`ns-component-hmr-register-post`, `enforce: 'post'`) Append the
		//      `__NS_HMR_REGISTER_COMPONENT__` calls to the COMPILED output.
		//
		// The split is mandatory: Analog's `transform` returns its own compiled
		// output (from its `outputFiles` cache), silently discarding any code
		// modification made earlier in the pipeline — appending in the pre
		// plugin leaves the HMR class registry empty.
		//
		// `apply: 'serve'` (registry hook is dev-only) but intentionally NOT
		// gated on `hmrActive`: the injected snippet self-guards on
		// `typeof globalThis.__NS_HMR_REGISTER_COMPONENT__ === 'function'`, and
		// gating the transform itself left `--no-hmr` users with an empty
		// registry.
		{
			name: 'ns-component-hmr-register',
			enforce: 'pre',
			apply: 'serve',
			transform(code, id) {
				const cleanId = normalizeAngularWatchPath(id);
				if (!isCandidateComponentTs(cleanId)) return null;

				const componentNames = findComponentClassNames(code);
				if (componentNames.length === 0) {
					// Drop any stale entry from a previous transform
					// pass; the file may have lost its `@Component`
					// decorator across a rename/refactor.
					componentsByCleanId.delete(cleanId);
					return null;
				}

				componentsByCleanId.set(cleanId, componentNames);

				if (verbose) {
					console.info(`[ns-hmr][ns-component-hmr-register] discovered ${componentNames.length} component(s) in ${cleanId} (${componentNames.join(', ')})`);
				}

				// Discovery only — never modify the raw TS source. Any
				// modification here is discarded by the Analog Angular
				// plugin downstream; the actual snippet append happens
				// in `ns-component-hmr-register-post`.
				return null;
			},
		},
		// Step 2: append the HMR registration snippet to the compiled output
		// (post-Analog), keyed by the names recorded in step 1.
		{
			name: 'ns-component-hmr-register-post',
			enforce: 'post',
			apply: 'serve',
			transform(code, id) {
				const cleanId = normalizeAngularWatchPath(id);
				if (!isCandidateComponentTs(cleanId)) return null;

				const componentNames = componentsByCleanId.get(cleanId);
				if (!componentNames || componentNames.length === 0) return null;

				// Idempotency: Vite may replay transforms on cached modules; the
				// marker guards against double-injection.
				if (code.includes(HMR_REGISTER_MARKER)) return null;

				const result = appendComponentHmrRegistration(code, componentNames);
				if (!result.code) return null;

				if (verbose) {
					console.info(`[ns-hmr][ns-component-hmr-register-post] appended registrations for ${result.componentNames.length} component(s) in ${cleanId} (${result.componentNames.join(', ')})`);
				}

				// map: null is fine for dev — the appended snippet sits after the
				// original body, so upstream line mappings stay valid.
				return { code: result.code, map: null };
			},
		},
		// Allow external html template changes to trigger hot reload: Make .ts files depend on their .html templates
		{
			name: 'angular-template-deps',
			enforce: 'pre',
			transform(code, id) {
				const componentPath = normalizeAngularWatchPath(id);
				const componentKey = normalizeAngularWatchKey(id);
				if (!componentKey.endsWith('.ts')) return null;

				const assetPaths = extractComponentAssetPaths(code, componentPath);
				trackComponentAssets(componentKey, assetPaths);

				for (const assetPath of assetPaths) {
					this.addWatchFile(assetPath);
				}
				// First fence of the HTML→TS invalidation pipeline: no [tracking]
				// log for a component means the watcher can never fire for it.
				if (verbose) {
					console.info(`[ns-hmr][angular-template-deps] [tracking] componentKey=${componentKey} assets=${assetPaths.length} (${assetPaths.slice(0, 4).join(', ')})`);
				}
				return null;
			},
			watchChange(id) {
				const changedPath = normalizeAngularWatchPath(id);
				const components = new Set<string>();
				for (const assetKey of getAngularWatchKeys(changedPath)) {
					for (const componentPath of assetToComponents.get(assetKey) || []) {
						components.add(componentPath);
					}
				}
				if (components?.size) {
					for (const componentPath of components) {
						pendingComponentInvalidations.add(componentPath);
					}
					if (verbose) {
						console.info(`[ns-hmr][angular-template-deps] watchChange [via assetToComponents] changed=${changedPath} → invalidating ${components.size} component(s):`, Array.from(components));
					}
					return;
				}

				if (/\.(html|htm)$/i.test(changedPath)) {
					const componentPath = changedPath.replace(/\.(html|htm)$/i, '.ts');
					const exists = fs.existsSync(resolveAngularWatchFilePath(componentPath));
					if (exists) {
						const componentKey = normalizeAngularWatchKey(componentPath);
						pendingComponentInvalidations.add(componentKey);
						if (verbose) {
							console.info(`[ns-hmr][angular-template-deps] watchChange [via fallback .html→.ts] changed=${changedPath} componentKey=${componentKey}`);
						}
					} else {
						// Truly anomalous: a watched template/style asset has no companion
						// `.ts` file, so we cannot route the edit through the Angular
						// HMR pipeline. Always-on warning so it surfaces in non-verbose
						// runs — silent fallback would hide a real wiring break.
						console.warn(`[ns-hmr][angular-template-deps] watchChange [no companion .ts found] changed=${changedPath} expectedTs=${componentPath}`);
					}
				}
			},
			shouldTransformCachedModule({ id }) {
				const componentPath = normalizeAngularWatchKey(id);
				if (!pendingComponentInvalidations.has(componentPath)) return null;

				pendingComponentInvalidations.delete(componentPath);
				if (verbose) {
					console.info(`[ns-hmr][angular-template-deps] shouldTransformCachedModule → re-transform componentKey=${componentPath}`);
				}
				return true;
			},
		},
		// Transform Angular partial declarations in node_modules to avoid runtime JIT
		// Pass the project root so linker deps resolve from the app, not the plugin package.
		angularLinkerVitePlugin(process.cwd()),
		// A Rollup-phase linker safety net (angularRollupLinker) is additionally
		// appended for HMR sessions — see `enableRollupLinker` below.
		...angular({
			experimental: {
				useAngularCompilationAPI: opts.useAngularCompilationAPI,
			},
			// `liveReload` enables Angular's web-style in-place template HMR:
			//   1. `_enableHmr = true` on the TS compiler — each compiled component
			//      `.mjs` emits `<ClassName>_HmrLoad` plus an
			//      `import.meta.hot.on('angular:component-update', ...)` listener.
			//   2. A `/@ng/component?c=<id>` middleware serving recompiled
			//      `_UpdateMetadata` sources on demand.
			//   3. `angular:component-update` broadcasts on `.html`/style edits so
			//      the runtime calls `ɵɵreplaceMetadata` on the live class — views
			//      recreate in-place with NO reboot and NO route navigation (the
			//      reboot path via `__reboot_ng_modules__` remains for `.ts` edits).
			//
			// Load-bearing interactions:
			//   - Analog's middleware matches `req.url.includes('/@ng/component')`
			//     (substring), so the `/ns/m/`-prefixed device fetch still hits it.
			//   - The device client (`hmr/client/protocol-dispatch.ts`) forwards
			//     `{ type: 'custom', event, data }` to `import.meta.hot.on`
			//     listeners and short-circuits before the reboot path for
			//     `angular:component-update`.
			//   - `hmr/server/websocket.ts` skips its own `ns:angular-update`
			//     broadcast for `.html`/component-style edits to avoid double-fire.
			//   - Rollback to reboot-only: set `NS_VITE_ANGULAR_LIVE_RELOAD=0`.
			liveReload: hmrAngularLiveReload,
			// NativeScript can't consume `externalRuntimeStyles` (runtime-loaded
			// `<hash>.css` URLs need a browser CSSOM/`<link>` pipeline), so keep
			// component styles inlined in the metadata's `styles: [...]` array.
			// Independent of `liveReload` — template HMR stays on. The option is
			// honored by our patched Analog plugin (upstream PR pending) and is a
			// no-op on stock releases; not yet in the published `PluginOptions`.
			// @ts-expect-error -- pending upstream Analog type publish
			externalRuntimeStyles: false,
			tsconfig: tsConfig,
			// Forward Angular-style file replacements (e.g. `environment.ts`
			// → `environment.stg.ts`) directly into the Analog plugin so the
			// Angular TypeScript host (which reads source files via its own
			// CompilerHost, bypassing Vite's load chain) sees the swap. This
			// is the same hook Angular CLI uses for `fileReplacements` in
			// `angular.json` build configurations.
			fileReplacements: opts.fileReplacements ?? [],
			// Component-HMR id alignment. Angular's compiler embeds each
			// component's HMR id relative to the TS compilation's base path —
			// in an Nx monorepo that's the WORKSPACE root (tsconfig.base.json's
			// baseUrl), not the app dir. Analog uses `workspaceRoot` both to
			// build the `angular:component-update` broadcast id
			// (`relative(workspaceRoot, file)`) and to resolve `/@ng/component?c=`
			// fetches back to absolute paths (`resolve(workspaceRoot, id)`).
			// Defaulting to `process.cwd()` (the app dir) makes the broadcast id
			// `src/...` while every compiled listener guards on
			// `apps/<app>/src/...` — `d.id === id` never matches, so template
			// edits dispatch cleanly but visually apply nothing. Default to the
			// monorepo root when one exists so all three id producers agree;
			// standalone apps (no monorepo root) keep the cwd behavior.
			workspaceRoot: opts.workspaceRoot ?? getMonorepoWorkspaceRoot(process.cwd()) ?? process.cwd(),
		}),
		// Post-phase linker to catch any declarations introduced after other transforms (including project code)
		angularLinkerVitePluginPost(process.cwd()),
		// Re-inject `/* @vite-ignore */` onto Angular's HMR initializer dynamic
		// imports. Angular emits `import(/* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL(...))`,
		// but the annotation gets stripped in the post-Angular pipeline
		// (empirically the linker's `compact: false` Babel pass) — Vite's static
		// analyzer then rewrites the call through its runtime resolver, which
		// throws `TypeError at ɵɵgetReplaceMetadataURL` on the iOS device.
		// `enforce: 'post'` sees the file after every comment-stripping
		// transform; `apply: 'serve'` because the initializer is `ngDevMode`-
		// gated and never runs in production. Idempotent.
		{
			name: 'ns-angular-hmr-vite-ignore',
			enforce: 'post',
			apply: 'serve',
			transform(code, id) {
				if (!hmrAngularLiveReload) return null;
				const cleanId = normalizeAngularWatchPath(id);
				if (!cleanId.endsWith('.ts') && !cleanId.endsWith('.mjs') && !cleanId.endsWith('.js')) return null;
				if (cleanId.includes('/node_modules/')) return null;
				const next = injectAngularHmrViteIgnore(code);
				if (next === code) return null;
				return { code: next, map: null };
			},
		},
		// Enforce: fully disable dependency optimization during serve to avoid rxjs esm5 crawling and OOM
		{
			name: 'ns-disable-optimize-deps',
			enforce: 'post',
			apply: 'serve',
			config(userConfig) {
				const od = (userConfig as any)?.optimizeDeps || {};
				const prevExclude: string[] = Array.isArray(od.exclude) ? od.exclude : [];
				const exclude = new Set<string>(prevExclude);
				[...NS_OPTIMIZE_DEPS_EXCLUDE, 'rxjs'].forEach((x) => exclude.add(x));
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
				[...NS_OPTIMIZE_DEPS_EXCLUDE, 'rxjs'].forEach((x) => exclude.add(x));
				deps.exclude = Array.from(exclude);
				const rolldownOptions = (deps.rolldownOptions ||= {});
				rolldownOptions.plugins = [];
			},
		},
	];
}

export const angularConfig = ({
	mode,
	fileReplacements,
	workspaceRoot,
}: {
	mode: string;
	/**
	 * Angular CLI–style file replacements (e.g. `environment.ts` →
	 * `environment.stg.ts`) forwarded to `@analogjs/vite-plugin-angular`'s
	 * `replaceFiles` plugin AND to the Angular TypeScript CompilerHost.
	 *
	 * Required for monorepo apps that need configuration-specific
	 * environment files: the Angular host reads source files via its own
	 * file-system layer, so a Vite `resolveId`/`load` plugin alone cannot
	 * swap a `.ts` file for `vite serve` / HMR — the host will still
	 * compile the original source from disk. Passing the list here ensures
	 * the host sees the replacement before TypeScript ever parses the
	 * file, matching how Angular CLI's `fileReplacements` works.
	 */
	fileReplacements?: AngularFileReplacement[];
	/**
	 * Workspace root used by `@analogjs/vite-plugin-angular` to resolve
	 * relative `fileReplacements` paths. Absolute paths bypass this.
	 * Defaults to `process.cwd()`.
	 */
	workspaceRoot?: string;
}): UserConfig => {
	const useSingleBundleDevOutput = mode === 'development' && !hmrActive;
	const plugins = createAngularPlugins({
		// Vite build --watch with the legacy Analog compilation path can regress
		// Angular app sources from Ivy output back to decorator emit on rebuild.
		// Restrict the newer compilation API to NativeScript's development no-HMR
		// flow, which is where the unstable rebuilds occur today.
		useAngularCompilationAPI: useSingleBundleDevOutput,
		fileReplacements,
		workspaceRoot,
	});
	// Angular browser animations are never used in NativeScript; the stub alias below is unconditional.
	const disableAnimations = true;

	// Post-link emitted chunks to catch any remaining partial declarations that slipped through
	// due to plugin order or external transforms.
	const applyAngularChunkPostProcessing = (code: string, options: { vendorInjectExport?: string } = {}) => {
		const codeWithInjectables = synthesizeMissingInjectableFactories(code, {
			vendorInjectExport: options.vendorInjectExport,
		});
		const codeWithCtorParameters = synthesizeDecoratorCtorParameters(codeWithInjectables);
		return inlineDecoratorComponentTemplates(codeWithCtorParameters, {
			projectRoot: process.cwd(),
		});
	};

	const postLinker = {
		name: 'ns-angular-linker-post',
		apply: 'build' as const,
		enforce: 'post' as const,
		async generateBundle(_options: any, bundle: any) {
			function isNsAngularPolyfillsModule(id: string): boolean {
				return normalizeAngularWatchPath(id).includes('node_modules/@nativescript/angular/fesm2022/nativescript-angular-polyfills.mjs');
			}
			function isNsAngularPolyfillsChunk(chunk: any): boolean {
				if (!chunk || !(chunk as any).modules) return false;
				return Object.keys((chunk as any).modules).some(isNsAngularPolyfillsModule);
			}
			const { babel, createLinker } = await getAngularLinkerFactory(process.cwd());
			if (!babel || !createLinker) return;
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
						// Fresh plugin per chunk — avoids stale linker state across watch-mode rebuilds.
						const linked = await runAngularLinker(code, { filename: fileName, projectRoot: process.cwd(), freshPlugin: true });
						const finalCode = applyAngularChunkPostProcessing(linked ?? code, { vendorInjectExport });
						if (finalCode !== code) {
							(chunk as any).code = finalCode;
							recordLinkerHit('post');
							if (debug) {
								console.log('[ns-angular-linker][post] linked', fileName, isNsPolyfills ? '(polyfills)' : '');
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
			// Evidence for pruning the stacked linker layers: print which of the
			// five layers actually linked anything this build. A layer that
			// reports 0 across the full flavor matrix is a candidate for removal.
			reportLinkerLayerStats();
			if (strict && unlinked.length) {
				const details: string[] = [];
				for (const fname of unlinked) {
					const chunk: any = (bundle as any)[fname];
					const modIds = chunk?.modules
						? Object.keys(chunk.modules)
								.filter((m) => /node_modules\/(?:@angular|@nativescript\/angular)\//.test(normalizeAngularWatchPath(m)))
								.slice(0, 8)
						: [];
					const isOnlyPolyfills = modIds.length > 0 && modIds.every(isNsAngularPolyfillsModule);
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
					console.warn(`[ns-angular-linker-post] ${message}`);
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
			const filename = chunk.fileName || chunk.name || 'chunk.mjs';
			const debug = process.env.VITE_DEBUG_LOGS === '1' || process.env.VITE_DEBUG_LOGS === 'true';
			try {
				let transformed = code;
				if (containsRealNgDeclare(code)) {
					const { babel, createLinker } = await getAngularLinkerFactory(process.cwd());
					if (!babel || !createLinker) return null;
					// Fresh plugin per pass — avoids stale linker state across watch-mode rebuilds.
					transformed = (await runAngularLinker(code, { filename, projectRoot: process.cwd(), freshPlugin: true })) ?? code;
					if (containsRealNgDeclare(transformed)) {
						transformed = (await runAngularLinker(transformed, { filename, projectRoot: process.cwd(), freshPlugin: true })) ?? transformed;
					}
				}

				transformed = applyAngularChunkPostProcessing(transformed);
				if (transformed !== code) {
					recordLinkerHit('render');
					if (debug) {
						console.log('[ns-angular-linker][render] linked', filename);
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

	// Single merged alias array — a second `resolve` key from a conditional
	// spread would silently clobber the fesm2022 and RxJS aliases.
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

	const config = mergeConfig(baseConfig({ mode, flavor: 'angular' }), {
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

	if (useSingleBundleDevOutput) {
		const build = (config.build ??= {}) as NonNullable<UserConfig['build']> as Record<string, any>;
		const rolldownOptions = (build.rolldownOptions ??= {}) as Record<string, any>;
		const outputConfigs = Array.isArray(rolldownOptions.output) ? rolldownOptions.output : [rolldownOptions.output ?? {}];

		for (const output of outputConfigs) {
			// Angular non-HMR reloads are more reliable when rebuilds keep a single boot bundle.
			// This avoids watch-time chunk alias/name drift that can leave the native app reloading into stale split points.
			delete output.manualChunks;
			delete output.chunkFileNames;
			output.codeSplitting = false;
		}

		rolldownOptions.output = Array.isArray(rolldownOptions.output) ? outputConfigs : outputConfigs[0];
	}

	return config;
};
