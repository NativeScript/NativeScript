import { mergeConfig, type UserConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'node:fs';
import angular from '@analogjs/vite-plugin-angular';
import { angularHmrPayloadRulesPlugins } from '../hmr/frameworks/angular/server/hmr-payload-rules-plugin.js';
import { angularUnlinkedPartialsGuardPlugin } from './angular/unlinked-partials-guard.js';
import { stripJsComments } from './angular/strip-js-comments.js';
import { tsFallbackTransformPlugin } from './angular/ts-fallback-transform.js';
import { baseConfig } from './base.js';
import { getCliFlags } from '../helpers/cli-flags.js';
import { getMonorepoWorkspaceRoot } from '../helpers/project.js';
import { resolveRelativeToImportMeta } from '../helpers/import-meta-path.js';
import { resolveVerboseFlag } from '../helpers/logging.js';

const cliFlags = getCliFlags()!;
const isDevEnv = process.env.NODE_ENV !== 'production';
const hmrActive = isDevEnv && !!cliFlags.hmr;

/**
 * In-place component HMR opt-out (`NS_VITE_ANGULAR_LIVE_RELOAD=0`).
 *
 * Off means no in-place updates: every Angular edit becomes Vite's full
 * reload. `0`, `false`, `off` and `no` (case-insensitive) turn it off;
 * anything else, including unset, keeps it on. Read once at module load.
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

function createAngularPlugins(opts: { fileReplacements?: AngularFileReplacement[]; workspaceRoot?: string }): Plugin[] {
	const verbose = resolveVerboseFlag();
	const assetToComponents = new Map<string, Set<string>>();
	const componentToAssets = new Map<string, Set<string>>();
	const pendingComponentInvalidations = new Set<string>();
	const analogWorkspaceRoot = opts.workspaceRoot ?? getMonorepoWorkspaceRoot(process.cwd()) ?? process.cwd();

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

	return [
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
		...angular({
			experimental: {
				// The compilation API leaves app components as raw decorators in `vite build`.
				useAngularCompilationAPI: false,
			},
			// `liveReload` turns on Angular's in-place component HMR: compiled
			// components listen for `angular:component-update` and fetch their new
			// metadata from Analog's `/@ng/component?c=` middleware, which matches
			// `req.url.includes('/@ng/component')`, so any device URL prefix still
			// reaches it. `ns-angular-hmr-rules` turns the updates Angular can't
			// apply in place into full reloads.
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
			workspaceRoot: analogWorkspaceRoot,
		}),
		...(hmrAngularLiveReload ? angularHmrPayloadRulesPlugins({ workspaceRoot: analogWorkspaceRoot }) : []),
		// Analog turns off Vite's TypeScript transform; this strips files outside the Angular program.
		...(hmrActive ? [tsFallbackTransformPlugin({ verbose })] : []),
		angularUnlinkedPartialsGuardPlugin(),
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
		fileReplacements,
		workspaceRoot,
	});
	// Angular browser animations are never used in NativeScript; the stub alias below is unconditional.
	const disableAnimations = true;

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
		plugins,
		resolve: {
			alias: angularAliases,
			// Add 'es2015' condition so RxJS resolves to dist/esm (modern ESM) rather
			// than dist/esm5 via the 'default' condition. This avoids the esm5 module
			// explosion and OOM while respecting the package's exports field in Vite 8.
			conditions: ['es2015'],
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
