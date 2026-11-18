import type { FrameworkProcessFileContext, FrameworkRegistryContext, FrameworkServerStrategy } from '../../../server/framework-strategy.js';
import type { NsHotUpdateContext } from '../../../server/websocket-hot-update.js';
import type { ViteDevServer } from 'vite';
import * as path from 'path';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { getMonorepoWorkspaceRoot } from '../../../../helpers/project.js';
import { getProjectAppPath, getProjectAppVirtualPath } from '../../../../helpers/utils.js';
import { isRuntimeGraphExcludedPath, matchesRuntimeGraphModuleId, shouldIncludeRuntimeGraphFile, shouldSkipRuntimeGraphDirectoryName } from '../../../server/runtime-graph-filter.js';
import { stripJsComments } from '../build/util.js';
import { runHotUpdatePrologue } from '../../../server/websocket-hot-update.js';
import { collectAngularHotUpdateRoots, shouldInvalidateAngularTransitiveImporters, shouldSuppressDefaultViteHotUpdate, type HotUpdateGraphModuleLike } from './websocket-angular-hot-update.js';
import { collectTransitiveImportersForInvalidation, type TransitiveImporterModuleLike } from '../../../server/transform-cache-invalidation.js';
import { getServerOrigin } from '../../../server/server-origin.js';
import { isSameAngularModuleRel } from './angular-root-component.js';
import type { AngularUpdateMessage } from '../../../shared/protocol.js';
import { thinDeviceUrl, thinEvictionUrls } from '../../../server/thin/thin-mode.js';

type GraphModuleRef = { id?: string | null; file?: string | null };

/**
 * What the device evicts and re-imports for an Angular reboot. The server owns
 * these URLs because only it knows the URL space the device loaded modules
 * under (`/ns/v<vite-url>`).
 */
function angularReloadTargets(options: { file: string; hotUpdateRoots: Iterable<GraphModuleRef>; transitiveImporters: Iterable<GraphModuleRef>; root: string; origin: string; bootstrapEntryRel: string | null }): Pick<AngularUpdateMessage, 'evictPaths' | 'entryUrl'> {
	const { file, root, origin, bootstrapEntryRel } = options;
	const files: Array<string | null | undefined> = [file];
	for (const mod of options.hotUpdateRoots) files.push(mod?.file ?? mod?.id);
	for (const mod of options.transitiveImporters) files.push(mod?.file ?? mod?.id);
	if (bootstrapEntryRel) files.push(path.join(root, bootstrapEntryRel));
	return {
		evictPaths: thinEvictionUrls(origin, root, files),
		...(bootstrapEntryRel ? { entryUrl: thinDeviceUrl(origin, bootstrapEntryRel) } : {}),
	};
}

// Angular server strategy for NativeScript HMR.
//
// Responsibilities:
// - Identify Angular app entry modules under /src.
// - Register external templates/styles with the watcher for live updates.
// - Drive the Angular reboot / in-place component update on hot updates.

const ANGULAR_APP_DIR = getProjectAppPath();
const ANGULAR_APP_VIRTUAL_WITH_SLASH = `${getProjectAppVirtualPath()}/`;
const ANGULAR_RUNTIME_FILE_PATTERN = /\.(ts|js|tsx|jsx|mjs)$/i;
const ANGULAR_STYLE_MODULE_PATTERN = /\.(?:css|scss|sass|less|styl)(?:\?|$)/i;

function isAngularTransitiveImporterExcluded(id: string): boolean {
	return id.includes('/node_modules/') || ANGULAR_STYLE_MODULE_PATTERN.test(id);
}

function findAngularEntryFiles(root: string): string[] {
	const srcDir = path.join(root, ANGULAR_APP_DIR);
	const results: string[] = [];

	function walk(dir: string) {
		let entries: string[] = [];
		try {
			entries = readdirSync(dir);
		} catch {
			return;
		}
		for (const name of entries) {
			if (name === 'node_modules' || name === '.ns-vite-build' || name === 'dist' || shouldSkipRuntimeGraphDirectoryName(name)) continue;
			const full = path.join(dir, name);
			let st: any;
			try {
				st = statSync(full);
			} catch {
				continue;
			}
			if (st.isDirectory()) {
				walk(full);
			} else if (st.isFile() && shouldIncludeRuntimeGraphFile(full, ANGULAR_RUNTIME_FILE_PATTERN)) {
				try {
					const code = readFileSync(full, 'utf8');
					// Heuristic: treat files that bootstrap Angular (platformNativeScript, bootstrapApplication, etc.)
					// as HMR-relevant roots.
					if (/bootstrapApplication\s*\(|platformNativeScript/i.test(code) || /@NgModule\s*\(/.test(code)) {
						const rel = '/' + path.relative(root, full).split(path.sep).join('/');
						results.push(rel);
					}
				} catch {}
			}
		}
	}

	walk(srcDir);
	return results;
}

// One failed `ɵɵreplaceMetadata` apply can fan out to several
// `angular:invalidate` sends for the same component (Angular sends one per
// failing LView walk, and stale hot listeners from earlier module
// evaluations can re-run the apply). Reboot once per component per window.
const recentAngularInvalidateReboots = new Map<string, number>();
const ANGULAR_INVALIDATE_REBOOT_DEDUPE_MS = 2000;

/**
 * Project-relative posix path for the `ns:angular-update` broadcast. Files
 * outside the vite root (workspace libs) fall back to the monorepo
 * workspace-relative form instead of a `/../../../libs/...` up-walk.
 */
function angularUpdateRelPath(file: string, root: string, workspaceRoot: string | null): string {
	const toPosixRel = (value: string) => '/' + path.posix.normalize(value.split(path.sep).join('/'));
	const rel = path.relative(root, file);
	if (!rel.startsWith('..')) {
		return toPosixRel(rel);
	}
	if (workspaceRoot) {
		const workspaceRel = path.relative(workspaceRoot, file);
		if (!workspaceRel.startsWith('..')) {
			return toPosixRel(workspaceRel);
		}
	}
	return toPosixRel(rel);
}

/**
 * Broadcast the Angular reboot path (`ns:angular-update` → device module
 * eviction → entry re-import → `__reboot_ng_modules__` with route replay)
 * for `file`, outside a Vite `handleHotUpdate` cycle.
 *
 * This is the recovery half of Angular's `angular:invalidate` contract:
 * Angular core sends that event (via `import.meta.hot.send`) when applying an
 * in-place `ɵɵreplaceMetadata` component update THROWS on the device — see
 * `executeWithInvalidateFallback` in @angular/core — and expects the dev
 * server to force a full reload, which is exactly what `@angular/build`'s
 * Vite server does on web. Without this, a single bad template apply (or a
 * template compiled against a newer class shape than the still-live instance)
 * wedges the view permanently: every subsequent in-place update re-applies
 * against the same stale runtime state and re-throws, so even "fixed" saves
 * never render. The reboot re-imports fresh module bodies (fresh component
 * class + template) and re-bootstraps, after which in-place updates apply
 * cleanly again.
 *
 * Mirrors the `.ts` tail of `handleHotUpdate` below, taking the conservative
 * always-transitive route: a failed apply means live runtime state is
 * suspect, and over-evicting is safe while under-evicting re-wedges.
 */
async function broadcastAngularReboot(file: string, server: ViteDevServer, deps: NsHotUpdateContext): Promise<void> {
	const { wss, moduleGraph, getBootstrapEntryRelPath, isSocketClientOpen, rememberAngularReloadSuppression, verbose } = deps;
	if (!wss) return;
	const root = server.config.root || process.cwd();
	const monorepoWorkspaceRoot = getMonorepoWorkspaceRoot(root);

	const hotUpdateRoots = collectAngularHotUpdateRoots({
		file,
		modules: [],
		getModuleById: (id) => server.moduleGraph.getModuleById(id) as HotUpdateGraphModuleLike | undefined,
		getModulesByFile: (targetFile) => (server.moduleGraph as any).getModulesByFile?.(targetFile) as Iterable<HotUpdateGraphModuleLike> | undefined,
	});
	for (const mod of hotUpdateRoots) {
		try {
			server.moduleGraph.invalidateModule(mod as any);
		} catch {}
	}

	let transitiveImporters: TransitiveImporterModuleLike[] = [];
	try {
		transitiveImporters = collectTransitiveImportersForInvalidation({
			modules: hotUpdateRoots as unknown as Iterable<TransitiveImporterModuleLike>,
			isExcluded: isAngularTransitiveImporterExcluded,
			maxDepth: 16,
		});
		for (const mod of transitiveImporters) {
			try {
				server.moduleGraph.invalidateModule(mod as any);
			} catch {}
		}
	} catch (error) {
		if (verbose) console.warn('[hmr-ws][angular] invalidate-reboot transitive importer collection failed', error);
	}

	try {
		const rel = angularUpdateRelPath(file, root, monorepoWorkspaceRoot);
		rememberAngularReloadSuppression(root, file);
		const origin = getServerOrigin(server);
		const bootstrapEntryRel = getBootstrapEntryRelPath();
		let targets: Pick<AngularUpdateMessage, 'evictPaths' | 'entryUrl'> = { evictPaths: [] };
		try {
			targets = angularReloadTargets({ file, hotUpdateRoots, transitiveImporters, root, origin, bootstrapEntryRel });
		} catch (error) {
			if (verbose) console.warn('[hmr-ws][angular] invalidate-reboot eviction set computation failed', error);
		}
		const msg: AngularUpdateMessage = {
			type: 'ns:angular-update',
			origin,
			path: rel,
			version: moduleGraph.version,
			timestamp: Date.now(),
			...targets,
			importerEntry: bootstrapEntryRel,
		};
		wss.clients.forEach((client) => {
			if (isSocketClientOpen(client)) {
				client.send(JSON.stringify(msg));
			}
		});
	} catch (error) {
		console.warn('[hmr-ws][angular] invalidate-reboot broadcast failed:', error);
	}
}

export const angularServerStrategy: FrameworkServerStrategy = {
	flavor: 'angular',
	matchesFile(id: string) {
		// Treat only application TS/JS as candidates for ordering/graph purposes
		return matchesRuntimeGraphModuleId(id, ANGULAR_APP_VIRTUAL_WITH_SLASH, ANGULAR_RUNTIME_FILE_PATTERN);
	},
	// Defer the prologue's common-block delta broadcast: the Angular HMR client
	// re-fetches the changed module, so the broadcast must come AFTER this
	// strategy's hot-update tail invalidates the Vite module graph — otherwise
	// the client's re-import races the server's invalidation and serves stale code.
	deferDeltaBroadcast: true,
	// Angular HTML templates skip the prologue's default module-graph delta
	// upsert: the tail below re-queries the graph and drives Analog's in-place
	// swap (or the NS reboot path) itself.
	skipDefaultGraphUpdate(file: string) {
		return /\.(html|htm)$/i.test(file);
	},
	// With Analog `liveReload` active, component `styleUrls` edits are applied
	// in place via `angular:component-update` → `ɵɵreplaceMetadata` →
	// `@nativescript/angular`'s renderer re-applying the component's scoped
	// styles. The prologue must NOT also broadcast `ns:css-updates` for them:
	// the device's `?direct=1` fetch would create the css `?direct` module that
	// makes Analog stop emitting `angular:component-update` on later edits (its
	// css branch then takes the NativeScript-inert Vite css-update path). The
	// presence of `analogjs-live-reload-plugin` is the clean signal that this
	// in-place pipeline is wired up (it only registers when `liveReload: true`).
	ownsComponentStyleHmr(server) {
		return ((server.config?.plugins as Array<{ name?: string }> | undefined) ?? []).some((plugin) => plugin?.name === 'analogjs-live-reload-plugin');
	},
	// A TS component edit already causes an Angular root reboot; carry any
	// Tailwind-generated app.css change inside that same `ns:angular-update`
	// message (see `deferredCssUpdates` in the prologue) so the device
	// serializes the CSS apply with the reboot instead of racing teardown.
	defersContentCssToFrameworkUpdate(file: string) {
		return file.endsWith('.ts');
	},
	// Device-reported failed in-place component update → reboot recovery.
	//
	// Angular core sends `angular:invalidate` (over `import.meta.hot.send`,
	// which the NS hot registry forwards to the `/ns-hmr` socket as
	// `{ type: 'custom', event, data }`) whenever an in-place
	// `ɵɵreplaceMetadata` apply throws — e.g. the swapped-in template
	// references class members the still-live component instance doesn't have
	// (metadata replacement reuses the instance by design, so class-body
	// changes never reach it). On the web `@angular/build` answers this with a
	// full page reload; the NS equivalent is the module-eviction reboot. The
	// payload id is the compiler-embedded component HMR id:
	// `encodeURIComponent('<workspace-relative-path>@<ClassName>')`, relative
	// to the TS compilation base (the monorepo workspace root when one exists
	// — see the `workspaceRoot` alignment note in configuration/angular.ts).
	async handleClientCustomEvent({ event, data, server }, deps) {
		if (event !== 'angular:invalidate') return;
		const payload = (data ?? {}) as { id?: unknown; message?: unknown };
		const rawId = typeof payload.id === 'string' ? payload.id : '';
		if (!rawId) return;
		let decoded = rawId;
		try {
			decoded = decodeURIComponent(rawId);
		} catch {}
		const rel = decoded.split('@')[0];
		if (!rel) return;
		const projectRoot = server.config.root || process.cwd();
		const workspaceRoot = getMonorepoWorkspaceRoot(process.cwd()) ?? projectRoot;
		const file = [path.resolve(workspaceRoot, rel), path.resolve(projectRoot, rel)].find((candidate) => existsSync(candidate));
		if (!file) {
			console.warn(`[hmr-ws][angular] angular:invalidate received for unresolvable component id ${decoded} — cannot trigger reboot recovery`);
			return;
		}
		const now = Date.now();
		const last = recentAngularInvalidateReboots.get(file) ?? 0;
		if (now - last < ANGULAR_INVALIDATE_REBOOT_DEDUPE_MS) return;
		recentAngularInvalidateReboots.set(file, now);
		// Always-on: this is an error-recovery path the user needs to see —
		// the device just failed to apply an in-place template swap.
		const firstLine = typeof payload.message === 'string' ? payload.message.split('\n')[0] : '';
		console.warn(`[hmr-ws][angular] device failed to apply in-place component update for ${rel}${firstLine ? ` (${firstLine})` : ''} — rebooting Angular with fresh modules to recover`);
		await broadcastAngularReboot(file, server, deps);
	},
	// Full Angular hot-update handler: shared prologue, then the Angular tail
	// (TS/HTML + root-component detection, hot-update-root + transitive-importer
	// invalidation, and the `ns:angular-update`
	// reboot broadcast). Reached directly from the WebSocket plugin's
	// handleHotUpdate hook.
	async handleHotUpdate(ctx, deps) {
		const state = await runHotUpdatePrologue(ctx, deps);
		if (!state) return;
		const { root, updateRel, metrics: updateMetrics, emitSummary: emitHmrUpdateSummary, deferredCssUpdates } = state;
		const { strategy, verbose, wss, moduleGraph, getBootstrapEntryRelPath, isSocketClientOpen, getHmrSocketRole, rememberAngularReloadSuppression, getRootComponentIdentity } = deps;
		const { file, server } = ctx;

		// For Angular, react to component TS or external template HTML changes under /src
		const isHtml = file.endsWith('.html');
		const isTs = file.endsWith('.ts');
		// Web-style template HMR opt-in: when the user enables Angular's
		// `liveReload` (Analog's flag, mirrored from `--hmr` in
		// `configuration/angular.ts`), `.html` edits are owned by
		// Analog's `handleHotUpdate` which sends
		// `server.ws.send('angular:component-update', { id, timestamp })`.
		// The runtime listener registered in each compiled component
		// `.mjs` then dynamic-imports `/@ng/component?c=<id>&t=<ts>` and
		// calls `ɵɵreplaceMetadata` on the live class — swapping the
		// template definition AND walking live `LView`s to recreate
		// matching views in-place. NO Angular reboot, NO route navigation.
		//
		// The NS reboot path (`ns:angular-update` → `__reboot_ng_modules__`)
		// must be SKIPPED for HTML edits when this is on; otherwise both
		// fire, the reboot wins, and we lose the in-place swap. The
		// reboot path stays intact for `.ts` edits — those genuinely
		// change module-level code (services, route configs, NgModule
		// providers) that Angular's `ɵɵreplaceMetadata` can't reach.
		//
		// We detect "live reload mode is on" by checking that the
		// `analogjs-live-reload-plugin` registered itself with the
		// dev server. That plugin only exists when `liveReload: true`
		// was passed to `angular()` in `configuration/angular.ts`,
		// which gates on `hmrActive`. So this check is a clean
		// boolean: true iff the in-place pipeline is wired up.
		const angularLiveReloadActive = ((server.config?.plugins as Array<{ name?: string }> | undefined) ?? []).some((plugin) => plugin?.name === 'analogjs-live-reload-plugin');
		// Root-component edits must NOT take Analog's in-place
		// `ɵɵreplaceMetadata` path: the root component hosts the
		// navigation `Frame` via `<page-router-outlet>`, and replacing
		// its metadata recreates the root view without re-navigating,
		// leaving a permanent white screen. We route the edit to the
		// reboot broadcast below instead (which re-bootstraps and
		// replays route state). The companion guard in the websocket
		// bridge drops the in-place `angular:component-update` event for
		// the root so the two paths don't race. `.ts` root edits already
		// fall through to the reboot path; this only re-routes `.html`.
		const rootComponent = getRootComponentIdentity();
		// `isSameAngularModuleRel` normalizes separators + leading slash internally,
		// so the raw project-relative path can be passed straight through.
		const isRootComponentEdit = !!rootComponent && isSameAngularModuleRel(rootComponent.moduleRel, path.relative(root, file));
		if (isHtml && angularLiveReloadActive && !isRootComponentEdit) {
			updateMetrics.tAfterFramework = Date.now();
			if (verbose) {
				const rel = '/' + path.relative(root, file).split(path.sep).join('/');
				console.info(`[ns-hmr][server] HTML edit handed off to Analog component-update path; skipping ns:angular-update broadcast (file=${rel})`);
			}
			// Re-query the moduleGraph for this file AFTER awaiting
			// `graphInitialPopulationPromise` (done at the top of
			// `handleHotUpdate`) and return the freshly-discovered
			// modules so they propagate to Analog's `handleHotUpdate`
			// in the same chain.
			//
			// Vite v8 builds the initial `mixedHmrContext.modules`
			// from `mixedModuleGraph.getModulesByFile(file)` BEFORE
			// any plugin runs. On the very first save after a cold
			// dev-server start, the moduleGraph for the changed
			// `.html` template has not yet been populated — that
			// population happens lazily via `populateInitialGraph`
			// → `transformRequest` → Analog's `transform` hook →
			// `addWatchFile(htmlFile)` → `vite:import-analysis`
			// consumes `_addedImports` and finally calls
			// `moduleGraph.updateModuleInfo` which registers the
			// `html → component.ts` importer relationship in
			// `fileToModulesMap`. All of that work races against the
			// file-watcher event for the `.html` edit, and the
			// watcher event almost always wins — so `ctx.modules`
			// arrives as `[]` even though the component is fully
			// compiled and ready to receive an in-place template
			// swap.
			//
			// Returning `undefined` here would propagate that empty
			// `ctx.modules` to the next plugin (Analog's handler),
			// which iterates with `ctx.modules.forEach(mod => mod
			// .importers.forEach(imp => …))` — a no-op when
			// `ctx.modules` is empty. Analog never broadcasts
			// `angular:component-update`, never marks anything
			// self-accepting, and Vite falls back to a `full-reload`
			// payload that the device runtime cannot honor (NS apps
			// don't have a browser-style page reload). The
			// user-visible symptom is exactly the "first save logs
			// `(client) page reload` and the simulator gets stuck
			// on the HMR-applying overlay forever" failure we hit
			// before this re-query was added.
			//
			// Since we already `await graphInitialPopulationPromise`
			// at the top of this function, by this point the
			// moduleGraph IS populated (every component file in
			// `src/` has been transformed and `addWatchFile` has
			// been consumed by `import-analysis`). A fresh
			// `getModulesByFile(file)` call now returns the template
			// module with the importing component's module in
			// `.importers`. Returning that array overwrites
			// `mixedHmrContext.modules` so Analog's handler — which
			// runs RIGHT AFTER us in the same chain — sees the
			// populated importer graph, identifies the component
			// class via `classNames.get(imp.id)`, and broadcasts
			// `angular:component-update` for `ɵɵreplaceMetadata`.
			//
			// We still skip the reboot path (`ns:angular-update`)
			// for HTML edits — control never reaches the
			// reboot-broadcast block below because of the `return`
			// here. The default-Vite-full-reload suppression is now
			// Analog's responsibility: it marks the changed module
			// self-accepting, which tells Vite the update is
			// handled and prevents the fallback.
			let resolvedModules: typeof ctx.modules = ctx.modules;
			try {
				const fresh = (server.moduleGraph as any)?.getModulesByFile?.(file) as Set<unknown> | undefined;
				if (fresh && fresh.size > 0) {
					resolvedModules = [...fresh] as typeof ctx.modules;
					if (verbose) {
						console.info(`[ns-hmr][server] re-queried modules after graph population: count=${resolvedModules.length} (was ${ctx.modules?.length ?? 0})`);
					}
				}
			} catch (refetchErr) {
				if (verbose) {
					console.warn('[ns-hmr][server] failed to re-query moduleGraph for html update', refetchErr);
				}
			}
			emitHmrUpdateSummary();
			return resolvedModules;
		}
		const angularHotUpdateRoots = collectAngularHotUpdateRoots({
			file,
			modules: ctx.modules,
			getModuleById: (id) => server.moduleGraph.getModuleById(id) as HotUpdateGraphModuleLike | undefined,
			getModulesByFile: (targetFile) => (server.moduleGraph as any).getModulesByFile?.(targetFile) as Iterable<HotUpdateGraphModuleLike> | undefined,
		});
		if (verbose) {
			console.info(
				`[ns-hmr][server] hot-update file=${file} isHtml=${isHtml} isTs=${isTs} ctxModules=${Array.from(ctx.modules || []).length} hotUpdateRoots=${angularHotUpdateRoots.length} (${angularHotUpdateRoots
					.map((m) => m?.id ?? '(none)')
					.slice(0, 8)
					.join(', ')}${angularHotUpdateRoots.length > 8 ? ', …' : ''})`,
			);
		}
		if (!(isHtml || isTs)) return;

		updateMetrics.invalidated += angularHotUpdateRoots.length;
		if (angularHotUpdateRoots.length) {
			for (const mod of angularHotUpdateRoots) {
				try {
					server.moduleGraph.invalidateModule(mod as any);
				} catch (invalidationError) {
					if (verbose) {
						console.warn('[hmr-ws][angular] hot-update root invalidation failed', mod?.id, invalidationError);
					}
				}
			}
			if (verbose) {
				console.log('[hmr-ws][angular] invalidated hot-update root modules:', angularHotUpdateRoots.length);
			}
		}

		const angularTransitiveInvalidationRoots = (angularHotUpdateRoots.length ? angularHotUpdateRoots : (ctx.modules as unknown as Iterable<TransitiveImporterModuleLike>)) as Iterable<TransitiveImporterModuleLike>;

		// Read the source for `.ts/.tsx/.js/.jsx` edits so
		// `shouldInvalidateAngularTransitiveImporters` can
		// distinguish leaf modules (constants/utils) from real
		// Angular files. If `ctx.read()` throws (file deleted, race
		// against the watcher), `angularChangedSource` stays
		// undefined and we fall back to the conservative "always
		// invalidate transitively" behavior.
		let angularChangedSource: string | undefined;
		if (isTs) {
			try {
				angularChangedSource = await ctx.read();
			} catch {
				angularChangedSource = undefined;
			}
		}

		const angularNeedsTransitive = shouldInvalidateAngularTransitiveImporters({
			flavor: strategy.flavor,
			file,
			source: angularChangedSource,
		});

		// Surface the narrowing decision on every `.ts` Angular hot
		// update (HTML routes always invalidate transitively and
		// aren't subject to narrowing, so we leave them as
		// `undefined` — the field is omitted from the summary line).
		// The boolean is the inverse of `angularNeedsTransitive`
		// because "needs transitive" is the broad (un-narrowed)
		// behavior.
		if (isTs) {
			updateMetrics.narrowed = !angularNeedsTransitive;
		}

		// Stable URL + Explicit Invalidation:
		//
		// Compute the transitive importer closure ONCE here and reuse
		// it for (a) `server.moduleGraph.invalidateModule` (so Vite's
		// transform pipeline re-runs on next request) and (b) the runtime
		// eviction set we broadcast in `ns:angular-update`. Both consumers
		// must see the exact same set of importers (otherwise a late
		// module-graph mutation between calls could leave an asymmetric
		// narrowed/broad mix).
		//
		// We separate Vite-transform narrowing from runtime eviction:
		// `angularNeedsTransitive` answers the question "does the
		// changed file's symbol shape change such that importers
		// must be re-transformed by Vite?". The runtime, however,
		// has a stricter requirement: ESM live bindings only refresh
		// if the importing module re-evaluates inside V8. A
		// constants file with no Angular decorator does NOT need a
		// Vite re-transform of its importers (their compiled JS is
		// identical), but its importers still hold stale bindings to
		// the OLD constants Module record. After eviction + re-import
		// of `main.ts`, V8 sees the cached importers, returns them
		// unchanged, and they continue to read the OLD values. The
		// user-visible symptom: HMR completes successfully, logs are
		// clean, but the simulator does not reflect the change.
		//
		// So ALWAYS compute the transitive importer closure for
		// runtime eviction. Only skip Vite's `moduleGraph.invalidate`
		// when `angularNeedsTransitive` is false — that is the genuine
		// narrowing win (saves re-transform work on the server).
		// The eviction set always includes importers so V8 re-fetches
		// and re-binds them.
		if (verbose) {
			console.info(`[ns-hmr][server] angularNeedsTransitive=${angularNeedsTransitive} (file=${path.basename(file)})`);
		}

		let transitiveImporters: TransitiveImporterModuleLike[] = [];
		try {
			transitiveImporters = collectTransitiveImportersForInvalidation({
				modules: angularTransitiveInvalidationRoots,
				isExcluded: isAngularTransitiveImporterExcluded,
				maxDepth: 16,
			});
			if (verbose) {
				console.info(
					`[ns-hmr][server] transitiveImporters count=${transitiveImporters.length} firstN=`,
					transitiveImporters.slice(0, 16).map((m) => m?.id ?? '(none)'),
				);
			}

			if (angularNeedsTransitive) {
				updateMetrics.invalidated += transitiveImporters.length;
				for (const mod of transitiveImporters) {
					try {
						server.moduleGraph.invalidateModule(mod as any);
					} catch (invalidationError) {
						if (verbose) {
							console.warn('[hmr-ws][angular] transitive importer invalidation failed', mod?.id, invalidationError);
						}
					}
				}
				if (verbose && transitiveImporters.length) {
					console.log('[hmr-ws][angular] invalidated transitive importers:', transitiveImporters.length);
				}
			} else if (isTs && typeof angularChangedSource === 'string') {
				// Narrowing means "skip Vite re-transform" (the
				// importers still get evicted from the V8 module
				// registry so live bindings refresh). The importer
				// count is appended so the distinction is visible.
				if (verbose && transitiveImporters.length) {
					console.log(`[hmr-ws][angular] narrowed transitive invalidation (no @Component/@Directive/@Pipe/@Injectable/@NgModule): ${updateRel} — Vite transform skipped, runtime eviction includes ${transitiveImporters.length} importer(s)`);
				}
			}
		} catch (error) {
			if (verbose) console.warn('[hmr-ws][angular] transitive importer collection failed', error);
		}

		updateMetrics.tAfterFramework = Date.now();
		try {
			const root = server.config.root || process.cwd();
			const monorepoWorkspaceRoot = getMonorepoWorkspaceRoot(root);
			const rel = angularUpdateRelPath(file, root, monorepoWorkspaceRoot);
			rememberAngularReloadSuppression(root, file);
			const origin = getServerOrigin(server);
			const bootstrapEntryRel = getBootstrapEntryRelPath();

			// `evictPaths` lists exactly the modules the runtime must drop
			// before re-importing `entryUrl` (changed file, hot-update roots,
			// transitive importers, bootstrap entry); every other module
			// stays live in the registry.
			let targets: Pick<AngularUpdateMessage, 'evictPaths' | 'entryUrl'> = { evictPaths: [] };
			try {
				targets = angularReloadTargets({ file, hotUpdateRoots: angularHotUpdateRoots, transitiveImporters, root, origin, bootstrapEntryRel });
			} catch (error) {
				if (verbose) {
					console.warn('[ns-hmr][server] eviction set computation failed', error);
				}
			}

			const { evictPaths } = targets;
			if (verbose) {
				try {
					const tsRel = rel.replace(/\.(html|htm)$/i, '.ts');
					const jsRel = rel.replace(/\.(html|htm)$/i, '.js');
					const containsRelatedTs = evictPaths.some((u) => u.endsWith(tsRel));
					const containsRelatedJs = evictPaths.some((u) => u.endsWith(jsRel));
					const sample = evictPaths.slice(0, 32);
					console.info(`[ns-hmr][server] evict-set count=${evictPaths.length} importerEntry=${bootstrapEntryRel ?? '(none)'} containsRelatedTs=${containsRelatedTs} containsRelatedJs=${containsRelatedJs} firstN=`, sample);
					if (evictPaths.length > sample.length) {
						console.info(`[ns-hmr][server] evict-set hidden=${evictPaths.length - sample.length} (showed first ${sample.length})`);
					}
				} catch {}
			}

			const msg: AngularUpdateMessage = {
				type: 'ns:angular-update',
				origin,
				path: rel,
				version: moduleGraph.version,
				timestamp: Date.now(),
				...targets,
				importerEntry: bootstrapEntryRel,
				...(deferredCssUpdates?.length ? { cssUpdates: deferredCssUpdates } : {}),
			};
			if (verbose) {
				console.log(
					'[hmr-ws][angular] broadcasting update',
					Array.from(wss.clients || []).map((client) => ({
						role: getHmrSocketRole(client as any),
						readyState: client.readyState,
						openState: (client as any).OPEN,
					})),
				);
			}
			wss.clients.forEach((client) => {
				if (isSocketClientOpen(client)) {
					client.send(JSON.stringify(msg));
					updateMetrics.recipients += 1;
				}
			});
		} catch (error) {
			console.warn('[hmr-ws][angular] update failed:', error);
		}
		emitHmrUpdateSummary();
		if (shouldSuppressDefaultViteHotUpdate({ flavor: strategy.flavor, file })) {
			return [];
		}
		return;
	},
	// Angular module freshness is eviction-driven (the client evicts changed
	// component/module URLs before re-import), with one exception: the
	// `/@ng/component?c=<id>&t=<ts>` metadata endpoint. Each save mints a new
	// `t`, so (a) the URL is volatile — the previous timestamped entry must
	// be evicted on re-import or the registry grows one stale entry per save
	// — and (b) its query must survive canonicalization verbatim, because
	// `t` IS the version discriminator: collapsing it would hand
	// `ɵɵreplaceMetadata` the boot-time metadata forever ("server logs hmr
	// update, screen never changes"). This vocabulary is policy owned here,
	// next to the route that defines it; the runtime just applies it.
	volatilePatterns() {
		return ['/@ng/component'];
	},
	preserveQueryPaths() {
		return ['/@ng/component'];
	},
	async processFile(ctx: FrameworkProcessFileContext) {
		const { filePath, server, verbose } = ctx;
		if (isRuntimeGraphExcludedPath(filePath)) return;
		try {
			const transformed = await server.transformRequest(filePath);
			if (!transformed?.code) return;
			if (verbose) {
				console.log(`[angular-hmr] processed ${filePath}`);
			}
		} catch (err) {
			if (verbose) {
				console.warn('[angular-hmr] processFile error for', filePath, err);
			}
		}
	},
	async buildRegistry(ctx: FrameworkRegistryContext) {
		const { server, verbose } = ctx;
		const root = server.config.root || process.cwd();
		const entries = findAngularEntryFiles(root);
		const templateFiles: string[] = [];
		const templateWatchDirs = new Set<string>();

		// Maintain existing behavior: watch external templates and styles referenced via templateUrl/styleUrls.
		function walkForTemplates(dir: string) {
			let list: string[] = [];
			try {
				list = readdirSync(dir);
			} catch {
				return;
			}
			for (const name of list) {
				if (name === 'node_modules' || name === '.ns-vite-build' || name === 'dist' || shouldSkipRuntimeGraphDirectoryName(name)) continue;
				const full = path.join(dir, name);
				let st: any;
				try {
					st = statSync(full);
				} catch {
					continue;
				}
				if (st.isDirectory()) {
					walkForTemplates(full);
				} else if (st.isFile() && shouldIncludeRuntimeGraphFile(full, /\.ts$/i)) {
					try {
						const rawCode = readFileSync(full, 'utf8');
						// Blank out `//` and `/* */` comments before regex
						// scanning so a commented-out `templateUrl` /
						// `styleUrls` line doesn't enroll the watcher (and
						// therefore the import graph) for a non-existent
						// asset. See note in
						// `extractComponentAssetPaths` for the failure
						// mode this avoids in current Rolldown-Vite.
						const code = stripJsComments(rawCode);
						if (/\@Component\s*\(/.test(code) && /templateUrl\s*:\s*["']\.\//.test(code)) {
							const m = code.match(/templateUrl\s*:\s*["']\.\/(.*?\.html)["']/);
							if (m && m[1]) {
								const htmlAbs = path.join(path.dirname(full), m[1]);
								templateFiles.push(htmlAbs);
							}
						}
						const styleArrayMatch = code.match(/styleUrls\s*:\s*\[([\s\S]*?)\]/);
						if (styleArrayMatch && styleArrayMatch[1]) {
							const entries = styleArrayMatch[1]
								.split(',')
								.map((s) => s.trim().replace(/^["'`]|["'`]$/g, ''))
								.filter((s) => s.startsWith('./') && (s.endsWith('.css') || s.endsWith('.scss')));
							for (const rel of entries) {
								const cssAbs = path.join(path.dirname(full), rel);
								templateFiles.push(cssAbs);
							}
						}
					} catch {}
				}
			}
		}

		walkForTemplates(path.join(root, ANGULAR_APP_DIR));
		try {
			for (const abs of templateFiles) {
				try {
					server.watcher.add(abs);
				} catch {}
				try {
					templateWatchDirs.add(path.dirname(abs));
				} catch {}
				if (verbose) {
					const rel = '/' + path.relative(root, abs).split(path.sep).join('/');
					console.log(`[angular-registry] watching template: ${rel}`);
				}
			}

			for (const dir of templateWatchDirs) {
				try {
					server.watcher.add(dir);
				} catch {}
			}
		} catch {}

		// Prime the Angular HMR roots through the Vite transform pipeline once.
		for (const rel of entries) {
			try {
				const transformed = await server.transformRequest(rel);
				if (!transformed?.code) continue;
				if (verbose) {
					console.log(`[angular-registry] primed entry: ${rel}`);
				}
			} catch (err) {
				if (verbose) {
					console.warn('[angular-registry] failed to prime entry', rel, err);
				}
			}
		}
	},
};
