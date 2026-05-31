import { mergeConfig, type UserConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { angularLinkerVitePlugin, angularLinkerVitePluginPost } from '../hmr/frameworks/angular/build/angular-linker.js';
import { synthesizeMissingInjectableFactories } from '../hmr/frameworks/angular/build/synthesize-injectable-factories.js';
import { getAngularLinkerFactory, runAngularLinker } from '../hmr/frameworks/angular/build/shared-linker.js';
import { inlineDecoratorComponentTemplates } from '../hmr/frameworks/angular/build/inline-decorator-component-templates.js';
import { appendComponentHmrRegistration, findComponentClassNames, INJECTION_MARKER as HMR_REGISTER_MARKER } from '../hmr/frameworks/angular/build/inject-component-hmr-registration.js';
import { injectAngularHmrViteIgnore } from '../hmr/frameworks/angular/build/inject-hmr-vite-ignore.js';
import { synthesizeDecoratorCtorParameters } from '../hmr/frameworks/angular/build/synthesize-decorator-ctor-parameters.js';
import { containsRealNgDeclare, stripJsComments } from '../hmr/frameworks/angular/build/util.js';
import { baseConfig } from './base.js';
import { getCliFlags } from '../helpers/cli-flags.js';
import { resolveRelativeToImportMeta } from '../helpers/import-meta-path.js';
import { resolveVerboseFlag } from '../helpers/logging.js';

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
 * Web-style template HMR opt-out.
 *
 * When `hmrActive` is true we default to the in-place template-replacement
 * pipeline (`liveReload: true` on Analog → `_enableHmr: true` on the Angular
 * TS compiler → `angular:component-update` events served via the
 * `/@ng/component` middleware → `ɵɵreplaceMetadata` on the live class).
 * Setting `_enableHmr: true` also forces Analog to set
 * `externalRuntimeStyles: true`, changing how component styles are emitted
 * (URLs fetched lazily instead of inlined). On the web that's fine; for
 * NativeScript it's a new code path that touches the SCSS / Tailwind
 * pipeline and the iOS runtime's HTTP module loader.
 *
 * If a project hits a regression on day one (broken styling, unresolved
 * `?ngcomp=` imports, etc.) the user can roll back to the legacy reboot
 * pipeline without an upstream patch by setting the env flag. We honour
 * `0`, `false`, `off`, and `no` (case-insensitive) as "off" — anything
 * else (including unset) keeps the new path on.
 *
 * The flag is read once at module load, mirroring how `hmrActive` is
 * computed, so a project can flip it via `cross-env` in their dev script
 * and never look back.
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
		// HMR self-registration runs in two phases:
		//
		//   1. (this plugin, `enforce: 'pre'`) Walk the raw TypeScript
		//      source for each user `.ts` file and record the names of
		//      any `@Component`-decorated classes into the shared
		//      `componentsByCleanId` map. Discovery has to happen on the
		//      raw source because the Analog Angular plugin rewrites
		//      `@Component(...)` into static metadata calls and removes
		//      the textual decorator pattern.
		//
		//   2. (`ns-component-hmr-register-post`, `enforce: 'post'`)
		//      After the Analog Angular plugin has compiled the file,
		//      append the global `__NS_HMR_REGISTER_COMPONENT__`
		//      registration calls keyed by the names recorded in step 1.
		//
		// Why the two-phase split: the Analog Angular plugin's `transform`
		// returns its OWN regenerated compiled output (from its internal
		// `outputFiles` cache populated at `buildStart`), discarding any
		// code modifications applied earlier in the pipeline. We
		// previously appended the registration snippet here, in the pre
		// plugin, and the snippet was silently dropped — leaving the
		// HMR class registry empty and `getFreshComponentClass` returning
		// `found=false reason=no-registry` after every reboot.
		//
		// Placement notes that still apply:
		//   - `apply: 'serve'`: the registry runtime hook is dev-only;
		//     production builds never need self-registration.
		//   - Intentionally NOT gated on `hmrActive`. The injected
		//     snippet self-guards with
		//     `typeof globalThis.__NS_HMR_REGISTER_COMPONENT__ === 'function'`,
		//     so it's a no-op when the runtime hook isn't installed
		//     (e.g. `--no-hmr` users still serving modules through
		//     Vite). Gating the transform itself on `hmrActive` produced
		//     a silent failure mode where `--no-hmr` users got HMR
		//     machinery up but never got the registration calls
		//     injected, leaving the registry empty.
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
		// Phase 2: append the HMR registration snippet to the compiled
		// JS output produced by `@analogjs/vite-plugin-angular`. Runs
		// `enforce: 'post'` so we see the post-Angular code (where the
		// pre plugin's work would otherwise be discarded). Reads the
		// component names recorded by the pre plugin via
		// `componentsByCleanId`.
		{
			name: 'ns-component-hmr-register-post',
			enforce: 'post',
			apply: 'serve',
			transform(code, id) {
				const cleanId = normalizeAngularWatchPath(id);
				if (!isCandidateComponentTs(cleanId)) return null;

				const componentNames = componentsByCleanId.get(cleanId);
				if (!componentNames || componentNames.length === 0) return null;

				// Idempotency: the Vite cache may replay the transform
				// pipeline on cached modules. The marker comment is
				// inserted by `appendComponentHmrRegistration` and
				// guards against double-injection. We also defensively
				// short-circuit here so we don't have to allocate the
				// suffix string on every cached re-run.
				if (code.includes(HMR_REGISTER_MARKER)) return null;

				const result = appendComponentHmrRegistration(code, componentNames);
				if (!result.code) return null;

				if (verbose) {
					console.info(`[ns-hmr][ns-component-hmr-register-post] appended registrations for ${result.componentNames.length} component(s) in ${cleanId} (${result.componentNames.join(', ')})`);
				}

				// Returning `null` for the source map is acceptable for
				// dev: lines 1..N (the original compiled body) keep
				// the upstream Angular source map; the appended snippet
				// is invisible to debuggers but harmless. For
				// production-grade source maps a MagicString-based
				// pass-through could be used; not required for HMR.
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
				// Diagnostic: surface which .ts files we've registered
				// asset (template/styleUrls) dependencies for. This is
				// the first fence the HTML→TS invalidation pipeline must
				// pass — if we never see a [tracking] log for the
				// component we're editing, the watcher will never fire
				// and `pendingComponentInvalidations` stays empty.
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
		// Simplify: rely on Vite pre plugin (load/transform) for linking; Rollup safety net disabled unless re-enabled later
		// angularRollupLinker(process.cwd()),
		...angular({
			experimental: {
				useAngularCompilationAPI: opts.useAngularCompilationAPI,
			},
			// `liveReload` is Analog's flag for Angular's web-style template HMR
			// pipeline. When ON, Analog:
			//   1. Sets `_enableHmr = true` on the TS compiler so each compiled
			//      component `.mjs` emits `<ClassName>_HmrLoad` plus an
			//      `import.meta.hot.on('angular:component-update', ...)` listener.
			//   2. Registers a `/@ng/component?c=<id>` middleware that serves the
			//      recompiled template's `_UpdateMetadata` source on demand.
			//   3. In `handleHotUpdate` for `.html` / `.css` / `.scss` edits, sends
			//      `server.ws.send('angular:component-update', { id, timestamp })`
			//      so the runtime can call `ɵɵreplaceMetadata` on the live class —
			//      swapping the template definition AND walking live LViews to
			//      recreate matching views in-place. NO Angular reboot, NO route
			//      navigation.
			//
			// Previously this was `false` because the NativeScript HMR pipeline
			// rebuilt every save through `__reboot_ng_modules__`. That works but
			// has two big downsides on mobile: every save triggers a full app
			// reboot AND the captured route-history replay (see
			// `@nativescript/angular`'s `hmr-route-replay.ts`), which produces 2-3
			// re-navigations per save and re-instantiates the page component
			// multiple times. For pure template/style edits — the common case —
			// the web-style component-replacement path keeps the page mounted and
			// only swaps the changed bits.
			//
			// We only enable this when HMR itself is active (`hmrActive` already
			// gates on `--hmr` and `NODE_ENV !== 'production'`). With HMR off the
			// behaviour is unchanged: production builds and `--no-hmr` dev still
			// see `liveReload: false`, the compiler skips the HMR initializers,
			// and the middleware is not registered.
			//
			// Important interactions to be aware of:
			//   - When `_enableHmr` is true, Analog also sets
			//     `externalRuntimeStyles = true`, changing how component styles
			//     are emitted (URLs fetched at runtime instead of inlined). For
			//     NativeScript, the existing CSS pipeline expects inlined styles;
			//     `ns-component-hmr-style-overrides` (below) restores the
			//     pre-HMR style-emission strategy so Tailwind/global SCSS
			//     packaging keeps working.
			//   - The runtime dynamic-import resolves the metadata URL relative
			//     to `import.meta.url`, e.g. `http://host:port/ns/m/<componentDir>/@ng/component?c=...`.
			//     Analog's middleware uses `req.url.includes('/@ng/component')`
			//     (substring match), so the request still matches even with the
			//     `/ns/m/` prefix in the path.
			//   - The NS HMR client (`packages/vite/hmr/client/index.ts`)
			//     forwards Vite's standard `{ type: 'custom', event, data }`
			//     payloads to `import.meta.hot.on` listeners via
			//     `__NS_DISPATCH_HOT_EVENT__`, and short-circuits before the
			//     reboot path for `angular:component-update`.
			//   - The NS server-side hot-update handler in
			//     `packages/vite/hmr/server/websocket.ts` skips its own
			//     `ns:angular-update` broadcast for `.html` / component-style
			//     edits so we don't double-fire (the reboot path stays for `.ts`
			//     edits).
			//   - To roll back to the legacy reboot-only pipeline (e.g. while
			//     debugging an `externalRuntimeStyles` regression), set
			//     `NS_VITE_ANGULAR_LIVE_RELOAD=0` in the dev environment.
			//     `hmrAngularLiveReload` collapses both gates above.
			liveReload: hmrAngularLiveReload,
			// NativeScript can't consume Angular's `externalRuntimeStyles`
			// mode — that emits component styles as runtime-loaded
			// `<hash>.css` URL references which only a browser CSSOM/`<link>`
			// pipeline can resolve. We tell our patched Analog plugin (see
			// `patches/@analogjs+vite-plugin-angular+2.3.1.patch` in
			// downstream apps; upstream PR pending) to keep the legacy
			// behavior of inlining preprocessed CSS strings into the
			// component metadata's `styles: [...]` array, which the NS
			// renderer's CSS-bundle pipeline already knows how to apply.
			// The option is independent from `liveReload` (`_enableHmr`
			// still wires up `ɵɵreplaceMetadata` for in-place template
			// HMR) — we keep HMR ON, just opt out of the URL-style
			// emission. Note the option lands as a no-op on stock
			// Analog releases that haven't merged the patch; once
			// merged, this will switch the compiler off external styles
			// for NativeScript without affecting web builds.
			//
			// `@ts-expect-error` because the option is not yet in
			// `@analogjs/vite-plugin-angular`'s published `PluginOptions`
			// type. When the upstream PR (https://github.com/analogjs/analog)
			// adds it, this `@ts-expect-error` will itself become an
			// "unused suppression" error — that's the signal to remove
			// this comment AND the surrounding explanation, and bump
			// the Analog peer dep to the version that ships the type.
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
			workspaceRoot: opts.workspaceRoot ?? process.cwd(),
		}),
		// Post-phase linker to catch any declarations introduced after other transforms (including project code)
		angularLinkerVitePluginPost(process.cwd()),
		// Re-inject the `/* @vite-ignore */` annotation onto Angular's HMR
		// initializer dynamic imports.
		//
		// Angular's compiler emits each component's HMR loader as
		// `import(/* @vite-ignore */ i0.ɵɵgetReplaceMetadataURL(...))` so
		// Vite leaves the runtime-computed URL alone. The annotation goes
		// missing somewhere in the post-Angular pipeline (empirically the
		// linker's `compact: false` Babel pass loses it on some files),
		// causing Vite's static analyzer to flag the import and rewrite
		// the call site through its runtime resolver — which then throws
		// `TypeError at ɵɵgetReplaceMetadataURL` on the iOS device because
		// the resolver expects a statically known specifier.
		//
		// Running `enforce: 'post'` and `apply: 'serve'` here ensures we
		// see the file AFTER every other transform has had its chance to
		// strip comments, AND only in dev (the HMR initializer is gated
		// behind `ngDevMode` and never runs in a production build, so the
		// fix would be wasted work outside `serve`). The helper is
		// idempotent: if the annotation is already present, the file is
		// returned unchanged.
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
	const disableAnimations = true;
	//process.env.NS_DISABLE_NG_ANIMATIONS === "1" ||
	//process.env.NS_DISABLE_NG_ANIMATIONS === "true";

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
