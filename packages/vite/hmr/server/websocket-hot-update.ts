import type { HmrContext } from 'vite';
import type { WebSocketServer } from 'ws';
import * as path from 'path';
import { createHash } from 'crypto';
import * as PAT from './constants.js';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import type { HmrModuleGraph } from './hmr-module-graph.js';
import type { SharedTransformRequestRunner } from './shared-transform-request.js';
import { isRuntimeGraphExcludedPath } from './runtime-graph-filter.js';
import { isWithinHmrScope } from '../../helpers/hmr-scope.js';
import { canonicalizeTransformRequestCacheKey, collectAngularEvictionUrls, collectAngularHotUpdateRoots, collectAngularTransformCacheInvalidationUrls, collectAngularTransitiveImportersForInvalidation, collectGraphUpdateModulesForHotUpdate, shouldInvalidateAngularTransitiveImporters, shouldSuppressDefaultViteHotUpdate, type HotUpdateGraphModuleLike, type TransitiveImporterModuleLike } from '../frameworks/angular/server/websocket-angular-hot-update.js';
import { getAppCssState } from '../../helpers/app-css-state.js';
import { collectCssHotUpdatePaths } from './websocket-css-hot-update.js';
import { classifyHmrUpdateKind, formatHmrUpdateSummary } from './perf-instrumentation.js';
import { createHmrPendingMessage } from './websocket-hmr-pending.js';
import type { AngularUpdateMessage, CssUpdateItem, CssUpdatesMessage, VueSfcRegistryUpdateMessage } from '../shared/protocol.js';
import { isCoreGlobalsReference, isNativeScriptCoreModule, isNativeScriptPluginModule, resolveVendorFromCandidate } from './websocket-module-specifiers.js';
import { cleanCode, collectImportDependencies, processSfcCode, rewriteImports } from './websocket-device-transform.js';
import { getServerOrigin } from './server-origin.js';
import { isSameAngularModuleRel, type BootstrapRootComponent } from '../frameworks/angular/server/angular-root-component.js';

/**
 * Dependencies injected into {@link handleNsHotUpdate}. These hold per-server
 * instance state (`wss`, `moduleGraph`, the file maps, `sharedTransformRequest`)
 * or are plugin-closure accessors; the pure transform helpers (`cleanCode`,
 * `rewriteImports`, `processSfcCode`, `collectImportDependencies`) are imported
 * directly from `websocket-device-transform.ts` (as is `getServerOrigin` from
 * `server-origin.ts` — spy via the module in tests).
 */
export interface NsHotUpdateContext {
	wss: WebSocketServer | null;
	moduleGraph: HmrModuleGraph;
	strategy: FrameworkServerStrategy;
	verbose: boolean;
	sfcFileMap: Map<string, string>;
	depFileMap: Map<string, string>;
	sharedTransformRequest: SharedTransformRequestRunner;
	getHmrSourceRootsCached: () => string[];
	getBootstrapEntryRelPath: () => string;
	isSocketClientOpen: (client: { readyState?: number; OPEN?: number } | null | undefined) => boolean;
	getHmrSocketRole: (client: { __nsHmrClientRole?: string } | null | undefined) => string;
	shouldRemapImport: (spec: string) => boolean;
	rememberAngularReloadSuppression: (root: string, file: string, ttlMs?: number) => void;
	/**
	 * Resolves the Angular bootstrap (root) component, or `null` when it
	 * can't be statically determined. Used to force root-component template
	 * edits through the reboot path instead of Analog's in-place update,
	 * which is destructive for the root view (see {@link BootstrapRootComponent}).
	 */
	getRootComponentIdentity: () => BootstrapRootComponent | null;
	getGraphInitialPopulationPromise: () => Promise<void> | null;
	appRootDir: string;
}

/** Result of {@link handleNsHotUpdate} / a strategy's `handleHotUpdate` — the modules array Vite propagates to the next plugin, or nothing. */
type NsHotUpdateResult = HmrContext['modules'] | void;

/** Always-on per-update timing + diagnostics, mutated in place across the prologue and the framework tail. */
interface HmrUpdateMetrics {
	file: string;
	kind: string;
	t0: number;
	tAfterAwait: number;
	tAfterFramework: number;
	tEnd: number;
	invalidated: number;
	recipients: number;
	narrowed: boolean | undefined;
	emitted: boolean;
}

/** Per-invocation locals computed by {@link runHotUpdatePrologue} and consumed by the per-flavor tail. */
interface HotUpdatePrologueState {
	root: string;
	updateRel: string;
	metrics: HmrUpdateMetrics;
	emitSummary: () => void;
}

/**
 * Shared, framework-agnostic prologue for {@link handleNsHotUpdate}: scope
 * gating, update-metrics setup, the `ns:hmr-pending` broadcast, awaiting the
 * initial graph population, the common module-graph upsert, CSS hot-update +
 * Tailwind content-CSS broadcast, and the project-scope filter. Returns `null`
 * when one of those steps fully handles the change (every such path resolves to
 * Vite's `undefined` result, so the caller just returns), otherwise the
 * per-invocation {@link HotUpdatePrologueState} (`root`, `updateRel`, the live
 * `metrics` object, the idempotent `emitSummary`) the per-flavor tail consumes.
 * Behaviour-preserving extraction (P2-A3 Step 0) — the body below is an in-place move.
 */
async function runHotUpdatePrologue(ctx: HmrContext, deps: NsHotUpdateContext): Promise<HotUpdatePrologueState | null> {
	const { wss, moduleGraph, strategy, verbose, getHmrSourceRootsCached, isSocketClientOpen } = deps;
	const APP_ROOT_DIR = deps.appRootDir;
	const graphInitialPopulationPromise = deps.getGraphInitialPopulationPromise();
	const { file, server } = ctx;
	if (!wss) {
		return null;
	}
	if (isRuntimeGraphExcludedPath(file)) {
		return null;
	}
	// Authoritative "what triggers HMR" gate, applied before the pending
	// overlay broadcast below: react only to files inside the app source
	// dir (`appPath`) or a tsconfig-configured shared library.
	if (!isWithinHmrScope(file, getHmrSourceRootsCached())) {
		if (verbose) {
			console.log(`[ns-hmr][server] ignored change (outside HMR source scope): ${file}`);
		}
		return null;
	}
	// Always-on update timing. Captures the four phases (await,
	// framework, broadcast, total) plus invalidated module count
	// and recipient count. Emitted at the end of this function via
	// `emitHmrUpdateSummary()`. Single line, always-on so a
	// 6-second `.ts` save is immediately visible without flipping
	// verbose.
	const updateRoot = server.config.root || process.cwd();
	const updateRel = (() => {
		try {
			return '/' + path.posix.normalize(path.relative(updateRoot, file)).split(path.sep).join('/');
		} catch {
			return file;
		}
	})();
	const updateMetrics = {
		file: updateRel,
		kind: classifyHmrUpdateKind(file),
		t0: Date.now(),
		tAfterAwait: 0,
		tAfterFramework: 0,
		tEnd: 0,
		invalidated: 0,
		recipients: 0,
		// Narrowing diagnostic — populated by the angular branch when
		// the changed file is `.ts`, otherwise remains undefined and is
		// omitted from the summary line entirely.
		narrowed: undefined as boolean | undefined,
		emitted: false,
	};

	// Broadcast a "pending" notification at the very start of
	// handleHotUpdate so the client can show the HMR-applying
	// overlay BEFORE we spend time on graph updates / transforms /
	// dependency analysis (typically 7–200ms on a warm cache).
	// Without this, the overlay only appears at `ns:angular-update`
	// broadcast time and the user perceives a "delayed" reaction
	// to their save.
	//
	// Fire-and-forget: a failed pending broadcast must never
	// hold up the actual update. The client treats receipt of
	// `ns:angular-update` (or `ns:css-updates`) as authoritative;
	// the pending message is purely a UX hint.
	try {
		const pendingPayload = JSON.stringify(
			createHmrPendingMessage({
				origin: getServerOrigin(server),
				path: updateMetrics.file,
				kind: updateMetrics.kind,
				timestamp: updateMetrics.t0,
			}),
		);
		wss.clients.forEach((client) => {
			if (isSocketClientOpen(client)) {
				try {
					client.send(pendingPayload);
				} catch {}
			}
		});
	} catch {}
	const emitHmrUpdateSummary = () => {
		if (updateMetrics.emitted) return;
		updateMetrics.emitted = true;
		updateMetrics.tEnd = Date.now();
		try {
			const awaitMs = (updateMetrics.tAfterAwait || updateMetrics.t0) - updateMetrics.t0;
			const frameworkMs = (updateMetrics.tAfterFramework || updateMetrics.tAfterAwait || updateMetrics.t0) - (updateMetrics.tAfterAwait || updateMetrics.t0);
			const broadcastMs = updateMetrics.tEnd - (updateMetrics.tAfterFramework || updateMetrics.tAfterAwait || updateMetrics.t0);
			const totalMs = updateMetrics.tEnd - updateMetrics.t0;
			console.info(
				formatHmrUpdateSummary({
					file: updateMetrics.file,
					kind: updateMetrics.kind,
					awaitMs,
					frameworkMs,
					broadcastMs,
					totalMs,
					invalidated: updateMetrics.invalidated,
					recipients: updateMetrics.recipients,
					narrowed: updateMetrics.narrowed,
				}),
			);
		} catch {}
	};
	// The first /ns/m request kicks off populateInitialGraph in the
	// background. If an HMR update races in before that walk
	// completes, we'd lose transitive-importer data. Await
	// completion here so the delta computation below always sees a
	// populated graph.
	if (graphInitialPopulationPromise) {
		try {
			await graphInitialPopulationPromise;
		} catch {}
	}
	updateMetrics.tAfterAwait = Date.now();
	// Graph update for this file change (wrapped to avoid aborting rest of handler)
	try {
		const skipAngularHtmlGraphUpdate = strategy.flavor === 'angular' && /\.(html|htm)$/i.test(file);
		if (!skipAngularHtmlGraphUpdate) {
			const graphTargets = collectGraphUpdateModulesForHotUpdate({
				file,
				flavor: strategy.flavor,
				modules: ctx.modules,
				getModuleById: (id) => server.moduleGraph.getModuleById(id) as HotUpdateGraphModuleLike | undefined,
				verbose,
			});
			for (const mod of graphTargets) {
				if (!mod?.id) continue;
				try {
					const deps = Array.from(mod.importedModules || [])
						.map((m) => (m.id || '').replace(/\?.*$/, ''))
						.filter(Boolean);
					const transformed = await server.transformRequest(mod.id);
					const code = transformed?.code || '';
					moduleGraph.upsert((mod.id || '').replace(/\?.*$/, ''), code, deps, {
						emitDeltaOnInsert: true,
						// Defer the delta broadcast until AFTER the framework
						// hot-update handler has had a chance to invalidate the
						// shared transform-request cache + Vite's moduleGraph
						// for the changed file and its transitive importers.
						// Otherwise the client races: it receives the delta
						// (eviction + re-import via tagged URL) before the
						// server has purged its caches, and the re-import is
						// served from cache → V8 evaluates the previous save's
						// transformed code → patchRegistry runs against an
						// unchanged source → the visible page is "one save
						// behind". Angular has always taken this path; Solid
						// needs the same contract because Solid HMR depends
						// on the client re-fetching the just-changed module
						// to drive `solid-refresh.patchRegistry`.
						broadcastDelta: strategy.flavor !== 'angular' && strategy.flavor !== 'solid',
					});
				} catch (error) {
					if (verbose) console.warn('[hmr-ws][v2] failed graph update target', mod.id, error);
				}
			}
		}
	} catch (e) {
		if (verbose) console.warn('[hmr-ws][v2] failed graph update', e);
	}

	const root = server.config.root || process.cwd();

	// CSS hot-update — handled BEFORE the project-scope filter
	// because workspace `@import` deps live outside `<root>/`.
	// The helper maps in-scope edits to their own path and
	// out-of-scope edits to `app.css` (Vite re-runs PostCSS
	// through the `@import` chain on the next fetch).
	if (file.endsWith('.css')) {
		const cssPaths = collectCssHotUpdatePaths({
			file,
			root,
			appRootDir: APP_ROOT_DIR,
			appEntryCss: path.resolve(root, APP_ROOT_DIR, 'app.css'),
		});
		if (cssPaths.length > 0) {
			updateMetrics.tAfterFramework = Date.now();
			try {
				const origin = getServerOrigin(server);
				const timestamp = Date.now();
				const msg: CssUpdatesMessage = {
					type: 'ns:css-updates',
					origin,
					updates: cssPaths.map(
						(cssPath): CssUpdateItem => ({
							type: 'css-update',
							path: cssPath,
							acceptedPath: cssPath,
							timestamp,
						}),
					),
				};

				wss.clients.forEach((client) => {
					if (isSocketClientOpen(client)) {
						client.send(JSON.stringify(msg));
						updateMetrics.recipients += 1;
					}
				});
			} catch (error) {
				console.warn('[hmr-ws] CSS update failed:', error);
			}
			if (verbose) console.log(`[hmr-ws] Hot update for: ${file} → broadcast CSS paths: ${cssPaths.join(', ')}`);
			emitHmrUpdateSummary();
			return null;
		}
		// CSS without a broadcast target (no appEntryCss
		// configured) — fall through to the scope filter.
	}

	const srcDir = `${root}/src`;
	const coreDir = `${root}/core`;
	const appDir = `${root}/${APP_ROOT_DIR}`;
	const normalizedFile = file.split(path.sep).join('/');
	const inSrcOrCore = normalizedFile.includes(srcDir) || normalizedFile.includes(coreDir);
	const inApp = normalizedFile.includes(appDir);
	const shouldIgnore = !(inSrcOrCore || inApp);
	if (shouldIgnore) return null;
	if (verbose) console.log(`[hmr-ws] Hot update for: ${file}`);

	// Tailwind / content-scanning CSS broadcast for non-CSS edits.
	//
	// Background: when a `.html` template or `.ts` file scanned
	// by Tailwind's `content` config gets a brand-new utility
	// class (e.g. `pt-6` that was never used in the codebase
	// before), the booted CSS bundle doesn't contain a rule for
	// it. The Angular template HMR swaps the markup, the view
	// re-renders, the class lookup misses, and the layout
	// regresses to its default.
	//
	// In a "normal" Vite setup, the `vite:css` plugin consumes
	// each PostCSS `dependency` message via `addWatchFile`, and
	// `vite:css-analysis` later registers each watched file as
	// an importer of the CSS module. A content-file edit then
	// invalidates the CSS module through the moduleGraph and
	// `ctx.modules`/`mod.importers` would surface it.
	//
	// NS HMR breaks that chain: `app.css` is loaded via a
	// virtual module (`virtual:ns-app-css`) whose `load` hook
	// calls `preprocessCSS(...)` and emits a JS module — the
	// CSS itself is never a moduleGraph node, so the importer
	// chain never forms. `ctx.modules` for the html edit only
	// contains the html-as-Angular-template module with the
	// component `.ts` as its importer.
	//
	// To bridge that gap, `mainEntryPlugin` stores the set of
	// `preprocessCSS` deps for `app.css` on the server as
	// `__nsAppCssDeps` (refreshed when `app.css` /
	// `tailwind.config.*` change, or when files are added /
	// removed). If the changed file is in that set, we
	// broadcast a `ns:css-updates` for `app.css` so the device
	// fetches fresh CSS through `?direct=1` and Vite re-runs
	// PostCSS+Tailwind — picking up the new utility class.
	//
	// This MUST run before the framework branches because
	// several of them return early (notably the Angular HTML
	// live-reload path), and the broadcast must land alongside
	// the framework's own template-update payload.
	if (!file.endsWith('.css')) {
		try {
			const appCssState = getAppCssState(server);
			const deps = appCssState?.deps;
			const appCssPath = appCssState?.path;
			if (deps && appCssPath) {
				const normalizedFile = path.resolve(file).replace(/\\/g, '/');
				if (deps.has(normalizedFile)) {
					const rootPosix = root.replace(/\\/g, '/').replace(/\/$/, '');
					const relRaw = path.posix.normalize(path.posix.relative(rootPosix, appCssPath));
					const appCssRel = relRaw && relRaw !== '.' && !relRaw.startsWith('..') ? (relRaw.startsWith('/') ? relRaw : `/${relRaw}`) : null;
					if (appCssRel) {
						const origin = getServerOrigin(server);
						const timestamp = Date.now();
						const msg: CssUpdatesMessage = {
							type: 'ns:css-updates',
							origin,
							updates: [
								{
									type: 'css-update',
									path: appCssRel,
									acceptedPath: appCssRel,
									timestamp,
								},
							],
						};
						wss.clients.forEach((client) => {
							if (isSocketClientOpen(client)) {
								try {
									client.send(JSON.stringify(msg));
									updateMetrics.recipients += 1;
								} catch {}
							}
						});
						if (verbose) console.info(`[ns-hmr][server] Tailwind/PostCSS content-file edit (${path.basename(file)}) broadcast ${appCssRel}`);
					}
				}
			}
		} catch (error) {
			console.warn('[hmr-ws] CSS content-source broadcast failed:', error);
		}
	}

	return { root, updateRel, metrics: updateMetrics, emitSummary: emitHmrUpdateSummary };
}

/**
 * The NativeScript `handleHotUpdate` hook. Runs the shared
 * {@link runHotUpdatePrologue}; unless it already handled the change, dispatches
 * to the per-flavor tail below. As each flavor migrates to
 * {@link FrameworkServerStrategy.handleHotUpdate} (P2-A3) its inline branch is
 * removed; until then the inline tails are the documented default. Re-binds the
 * prologue's per-invocation locals + the injected deps to their original
 * closure-local names so the tails are a faithful, behaviour-preserving move.
 */
export async function handleNsHotUpdate(ctx: HmrContext, deps: NsHotUpdateContext): Promise<NsHotUpdateResult> {
	const state = await runHotUpdatePrologue(ctx, deps);
	if (!state) return;
	const { root, updateRel, metrics: updateMetrics, emitSummary: emitHmrUpdateSummary } = state;
	const { strategy, verbose, wss, moduleGraph, sfcFileMap, depFileMap, sharedTransformRequest, getBootstrapEntryRelPath, isSocketClientOpen, getHmrSocketRole, shouldRemapImport, rememberAngularReloadSuppression, getRootComponentIdentity } = deps;
	const { file, server } = ctx;

	// Framework-specific hot update handling
	if (strategy.flavor === 'angular') {
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
		// transform pipeline re-runs on next request), (b) the shared
		// transform-request cache, and (c) the runtime eviction set
		// we broadcast in `ns:angular-update`. Consolidating this
		// removes a redundant graph walk and guarantees the three
		// consumers see the exact same set of importers (otherwise a
		// late module-graph mutation between calls could leave an
		// asymmetric narrowed/broad mix).
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
		// The fix: ALWAYS compute the transitive importer closure
		// for runtime eviction. Only skip Vite's
		// `moduleGraph.invalidate` + transform-cache purge when
		// `angularNeedsTransitive` is false — those are the genuine
		// narrowing wins (saves re-transform work on the server).
		// The eviction set always includes importers so V8 re-fetches
		// and re-binds them.
		if (verbose) {
			console.info(`[ns-hmr][server] angularNeedsTransitive=${angularNeedsTransitive} (file=${path.basename(file)})`);
		}

		let transitiveImporters: TransitiveImporterModuleLike[] = [];
		try {
			transitiveImporters = collectAngularTransitiveImportersForInvalidation({
				modules: angularTransitiveInvalidationRoots,
				isExcluded: (id) => id.includes('/node_modules/'),
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
				// Surfacing this log unconditionally lets the user
				// immediately confirm whether narrowing fired for a
				// given `.ts` edit (the summary line below still
				// emits `narrowed=yes`/`no`, but having both makes
				// the decision easier to spot in noisy logs and lets
				// the user diff scenarios without flipping
				// `NS_HMR_VERBOSE=true`).
				//
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

		try {
			// Purge shared transform cache for the changed file +
			// hot-update roots unconditionally (their transform
			// output IS different now). Transitive importers are
			// only purged when narrowing decides their output may
			// have changed; otherwise their cached transforms are
			// still valid (compiled JS is identical even though the
			// runtime must re-evaluate them to refresh ESM bindings).
			const transformCacheInvalidationUrls = new Set(
				collectAngularTransformCacheInvalidationUrls({
					file,
					isTs,
					hotUpdateRoots: angularHotUpdateRoots,
					transitiveImporters: angularNeedsTransitive ? transitiveImporters : [],
					projectRoot: server.config.root || process.cwd(),
				}),
			);
			if (transformCacheInvalidationUrls.size) {
				sharedTransformRequest.invalidateMany(transformCacheInvalidationUrls);
				if (verbose) {
					console.log('[hmr-ws][angular] purged shared transform cache entries:', transformCacheInvalidationUrls.size);
				}
			}
		} catch (error) {
			if (verbose) console.warn('[hmr-ws][angular] shared transform cache purge failed', error);
		}
		updateMetrics.tAfterFramework = Date.now();
		try {
			const root = server.config.root || process.cwd();
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			rememberAngularReloadSuppression(root, file);
			const origin = getServerOrigin(server);
			const bootstrapEntryRel = getBootstrapEntryRelPath();

			// Stable URL + Explicit Invalidation:
			//
			// `evictPaths` is the canonical list of `/ns/m/<rel>` URLs
			// the runtime must drop from `g_moduleRegistry` before
			// re-importing `importerEntry`. Older versions of the
			// server signaled invalidation by bumping a global
			// `graphVersion` counter and embedding it in every URL —
			// but V8 keys the module registry by full URL, so a v1 →
			// v2 bump effectively flushed the entire dependency
			// graph from the cache and forced the runtime to
			// re-fetch + re-eval every transitively-imported module
			// on each save (~3s HMR cycles, dominated by Vite's
			// single-threaded transform pipeline). The new model:
			//
			//   1. URLs are stable: `/ns/m/<rel>` everywhere, no `vN`.
			//   2. The server walks the inverse-dependency closure and
			//      sends only the modules that actually need to be
			//      re-evaluated (typically O(1) for component edits,
			//      or the changed file + entry for narrowed edits).
			//   3. The client calls `__nsInvalidateModules(evictPaths)`
			//      and re-imports `importerEntry`, which causes V8 to
			//      refetch ONLY those modules. Everything else stays
			//      hot in the registry.
			//
			// Invariants enforced by `collectAngularEvictionUrls`:
			//   - Always includes the changed file (so the new source
			//     is fetched).
			//   - Always includes `importerEntry` (so re-import
			//     re-evaluates).
			//   - Excludes node_modules (vendor packages are stable).
			//   - Excludes virtual / runtime-graph-excluded ids.
			//   - Origin-prefixed: `http://host:port/ns/m/<rel>`.
			let evictPaths: string[] = [];
			try {
				evictPaths = collectAngularEvictionUrls({
					file,
					hotUpdateRoots: angularHotUpdateRoots,
					transitiveImporters,
					projectRoot: root,
					origin,
					bootstrapEntry: bootstrapEntryRel,
				});
			} catch (error) {
				if (verbose) {
					console.warn('[ns-hmr][server] eviction set computation failed', error);
				}
			}

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
				evictPaths,
				importerEntry: bootstrapEntryRel,
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
	}

	// TypeScript flavor: emit generic graph delta for app XML/TS/style changes
	if (strategy.flavor === 'typescript') {
		updateMetrics.tAfterFramework = Date.now();
		try {
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			if (verbose) console.log('[hmr-ws][ts] app file hot update', { file, rel });
			// Treat the changed file itself as a graph module with no deps. We only
			// care that its hash/identity changes so the client sees a delta and can
			// perform a TS root reset. Code is not used for execution here.
			moduleGraph.upsert(rel, '', [], { emitDeltaOnInsert: true });
		} catch (e) {
			if (verbose) console.warn('[hmr-ws][ts] failed to emit delta for', file, e);
		}
		emitHmrUpdateSummary();
		return;
	}

	// Solid flavor: emit graph delta for app TSX/TS/JSX file changes.
	// The common graph-update block above (moduleGraph lookup) may have
	// already emitted a delta if the file was in Vite's module graph.
	// This handler ensures a delta is emitted even if the module wasn't
	// found (e.g. new file, or moduleGraph mismatch), and provides
	// Solid-specific logging. The client-side processQueue handles
	// propagation from non-component .ts files to .tsx component boundaries.
	if (strategy.flavor === 'solid') {
		const isSolidFile = /\.(tsx?|jsx?)$/i.test(file);
		if (!isSolidFile) return;
		updateMetrics.tAfterFramework = Date.now();
		try {
			const rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
			if (verbose) console.log('[hmr-ws][solid] app file hot update', { file, rel });
			// If the common block already upserted (hash changed), this will
			// detect unchanged hash and no-op. If the common block missed it
			// (module not in Vite's graph), this forces the delta emission.
			const normalizedId = moduleGraph.normalizeGraphId(rel);
			const existing = moduleGraph.get(normalizedId);
			if (!existing) {
				// Module not in graph yet — force upsert with timestamp-based
				// hash so the client sees a change.
				moduleGraph.upsert(rel, `/* solid-hmr ${Date.now()} */`, [], { emitDeltaOnInsert: true });
			}
			// Log what we're sending so devs can trace the flow on the server side.
			if (verbose) {
				const gm = moduleGraph.get(normalizedId);
				console.log('[hmr-ws][solid] delta module', { id: gm?.id, hash: gm?.hash });
			}
			// Purge the shared transform-request cache AND Vite's own
			// moduleGraph transformResult cache for the changed file
			// AND every transitive importer.
			//
			// Why this matters for Solid HMR specifically:
			//  - The HMR client evicts V8's module cache for the
			//    canonical /ns/m/<path> URL and re-imports the module.
			//  - The dev server resolves /ns/m/* by calling
			//    `sharedTransformRequest(...)`, which has a 60s TTL on
			//    transform results to amortize cost across HMR
			//    cycles. The shared cache wraps `server.transformRequest`,
			//    which itself caches the compiled output on each
			//    `ModuleNode.transformResult`. Both layers must be
			//    invalidated, or the re-import resolves to whatever
			//    the previous save populated.
			//  - Without invalidation at *both* layers, the second
			//    save of a file within the cache window returns the
			//    FIRST save's transform — V8 evaluates stale code,
			//    `solid-refresh.patchRegistry` runs against an
			//    unchanged source body, and the visible page picks
			//    up the previous save's edit instead of the current
			//    one (the "one-save-behind" symptom users reported).
			//
			// Critically, transitive importers must also be invalidated
			// because TanStack file-based routing (and similar frameworks)
			// use route files that statically import their components.
			// When `home.tsx` changes, `routes/index.tsx`'s transform
			// output references the imported home module identity. Even
			// though the route file's source bytes did not change, its
			// *resolved* import target has — and its cached transform
			// might still encode the previous resolution. Forcing a
			// fresh transform of the importer guarantees the route
			// file's `import Home from ...` re-resolves against the
			// freshly evaluated home module on V8 side.
			//
			// The Angular path performs the equivalent purge via
			// `collectAngularTransformCacheInvalidationUrls` /
			// `sharedTransformRequest.invalidateMany`. We replicate
			// that contract for Solid here. The transitive walk is
			// bounded the same way (max depth 16, node_modules /
			// virtual ids excluded) so vendor packages stay hot.
			try {
				const projectRoot = server.config.root || process.cwd();
				const cacheInvalidationUrls = new Set<string>();
				const addCacheKey = (rawId: string | null | undefined) => {
					const id = String(rawId || '');
					if (!id) return;
					const cacheKey = canonicalizeTransformRequestCacheKey(id, projectRoot);
					cacheInvalidationUrls.add(cacheKey);
					const noQuery = cacheKey.replace(/\?.*$/, '');
					const stripped = noQuery.replace(/\.(?:[mc]?[jt]sx?)$/i, '');
					if (stripped !== noQuery) {
						cacheInvalidationUrls.add(stripped);
					}
				};
				addCacheKey(file);
				const rootModules = server.moduleGraph.getModulesByFile?.(file);
				const transitiveImporters = collectAngularTransitiveImportersForInvalidation({
					modules: rootModules ? Array.from(rootModules) : [],
					isExcluded: (id) => id.includes('/node_modules/') || isRuntimeGraphExcludedPath(id),
					maxDepth: 16,
				});
				// Invalidate Vite's moduleGraph for the changed file +
				// every transitive importer so `server.transformRequest`
				// re-runs the transform pipeline instead of returning
				// the cached `ModuleNode.transformResult`. We call
				// `onFileChange` (Vite's authoritative file-changed
				// signal — walks all module variants including `?v=`,
				// `?import`, `?t=`) AND per-module `invalidateModule`
				// for transitive importers (which onFileChange
				// doesn't reach).
				try {
					server.moduleGraph.onFileChange(file);
				} catch {}
				if (rootModules) {
					for (const mod of rootModules) {
						try {
							server.moduleGraph.invalidateModule(mod);
						} catch {}
					}
				}
				for (const mod of transitiveImporters) {
					addCacheKey(mod?.id);
					try {
						server.moduleGraph.invalidateModule(mod as any);
					} catch {}
				}
				if (cacheInvalidationUrls.size && sharedTransformRequest) {
					sharedTransformRequest.invalidateMany(cacheInvalidationUrls);
					if (verbose) {
						console.log('[hmr-ws][solid] purged shared transform cache entries:', cacheInvalidationUrls.size, 'transitiveImporters=', transitiveImporters.length);
					}
				}
				// Sledgehammer: nuke EVERY entry in sharedTransformRequest's
				// result cache. The targeted `invalidateMany` above only
				// clears keys we know about. The `/ns/m/` handler iterates
				// a long list of candidate extensions (`.ts`, `.js`, `.tsx`,
				// `.jsx`, `.mjs`, `.mts`, `.cts`, `.vue`, `index.*`) and
				// EACH candidate is a separate cache key. If a previous
				// serve populated cache for `/src/components/home.js` (via
				// extension fallback that resolves to `home.tsx`), our
				// targeted invalidate misses it and iOS HITs the stale
				// entry — serving the previous save's transformed code.
				try {
					sharedTransformRequest.clear();
				} catch {}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] transform cache invalidation failed', e);
			}
			// Re-run the transform AFTER all caches are invalidated, then
			// re-upsert the graph so the broadcast hash matches the freshly-
			// transformed content. The common upsert block above ran
			// `server.transformRequest` BEFORE invalidation — at that
			// moment Vite's auto-invalidate hadn't fired yet (it runs after
			// `plugin.handleHotUpdate`), so the result it cached was the
			// previous save's. Without this re-transform, the broadcast
			// carries a stale hash and iOS evaluates the previous save's
			// bytes ("one save behind").
			//
			// We pre-populate the cache for every extension variant Vite's
			// /ns/m/ handler might try, so the first request from iOS hits
			// fresh data regardless of which candidate it resolves first.
			try {
				const ext = file.match(/\.(?:[mc]?[jt]sx?)$/i)?.[0] || '';
				const baseSpec = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');
				const baseNoExt = ext ? baseSpec.replace(/\.(?:[mc]?[jt]sx?)$/i, '') : baseSpec;
				const candidates = Array.from(new Set([baseSpec, baseNoExt, baseNoExt + '.ts', baseNoExt + '.tsx', baseNoExt + '.js', baseNoExt + '.jsx', baseNoExt + '.mjs', baseNoExt + '.mts', baseNoExt + '.cts', file]));
				let freshCode = '';
				for (const cand of candidates) {
					try {
						const fresh = await sharedTransformRequest(cand, 30000);
						if (fresh?.code && !freshCode) freshCode = fresh.code;
					} catch {}
				}
				if (freshCode) {
					const existingGm = moduleGraph.get(normalizedId);
					const existingDeps = existingGm?.deps || [];
					moduleGraph.upsert(normalizedId, freshCode, existingDeps as string[], {
						broadcastDelta: false,
					});
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] post-invalidation re-transform failed', e);
			}
			// Broadcast the (now-fresh) delta. Suppressing this in the
			// common upsert block (`broadcastDelta: strategy.flavor
			// !== 'solid'`) and emitting it here ensures the client's
			// eviction + re-import doesn't race the server's cache
			// invalidation.
			try {
				const gm = moduleGraph.get(normalizedId);
				if (gm) {
					moduleGraph.emitDelta([gm], []);
					if (verbose) {
						console.log('[hmr-ws][solid] broadcast delta after cache invalidation', { id: gm.id, hash: gm.hash });
					}
				}
			} catch (e) {
				if (verbose) console.warn('[hmr-ws][solid] post-invalidation broadcast failed', e);
			}
		} catch (e) {
			if (verbose) console.warn('[hmr-ws][solid] failed to handle hot update for', file, e);
		}
		emitHmrUpdateSummary();
		return;
	}

	// Handle .vue file updates
	if (!file.endsWith('.vue')) {
		if (verbose) console.log('[hmr-ws] Not a .vue file, skipping');
		return;
	}

	if (verbose) console.log('[hmr-ws] Processing .vue file update...');

	try {
		const root = server.config.root || process.cwd();
		let rel = '/' + path.posix.normalize(path.relative(root, file)).split(path.sep).join('/');

		// Transform the .vue file
		const transformed = await server.transformRequest(rel);
		if (!transformed?.code) return;

		let code = transformed.code;

		// Clean and process
		code = cleanCode(code, strategy);

		// Process dependencies
		const visitedPaths = new Set<string>();
		const importerDir = path.posix.dirname(rel);

		// Collect dependencies from this file
		const deps = new Set<string>();
		const collectDeps = (pattern: RegExp) => {
			let match: RegExpExecArray | null;
			while ((match = pattern.exec(code)) !== null) {
				const spec = match[2];
				if (!spec || PAT.VUE_FILE_PATTERN.test(spec) || !shouldRemapImport(spec)) {
					continue;
				}

				let key: string;
				if (spec.startsWith('/')) {
					key = spec;
				} else if (spec.startsWith('./') || spec.startsWith('../')) {
					key = path.posix.normalize(path.posix.join(importerDir, spec));
					if (!key.startsWith('/')) key = '/' + key;
				} else {
					continue;
				}

				key = key.replace(PAT.QUERY_PATTERN, '');
				deps.add(key);
			}
		};

		collectDeps(PAT.IMPORT_PATTERN_1);
		collectDeps(PAT.IMPORT_PATTERN_2);
		collectDeps(PAT.EXPORT_PATTERN);
		collectDeps(PAT.IMPORT_PATTERN_3);

		// CRITICAL: Collect .vue file imports separately
		// Use matchAll() to avoid regex state issues
		const vueDeps = new Set<string>();
		const vueImportMatches = [...code.matchAll(PAT.IMPORT_PATTERN_1), ...code.matchAll(PAT.VUE_FILE_IMPORT)];

		for (const match of vueImportMatches) {
			const spec = match[2];
			if (!spec || !PAT.VUE_FILE_PATTERN.test(spec)) {
				continue;
			}

			let key: string;
			if (spec.startsWith('/')) {
				key = spec.replace(PAT.QUERY_PATTERN, '');
			} else if (spec.startsWith('./') || spec.startsWith('../')) {
				key = path.posix.normalize(path.posix.join(importerDir, spec.replace(PAT.QUERY_PATTERN, '')));
				if (!key.startsWith('/')) key = '/' + key;
			} else {
				continue;
			}

			// Ensure this .vue file is registered in sfcFileMap
			if (!sfcFileMap.has(key)) {
				const hash = createHash('md5').update(key).digest('hex').slice(0, 8);
				sfcFileMap.set(key, `sfc-${hash}.mjs`);
				if (verbose) {
					console.log(`[hmr-ws] Registered .vue import: ${key} → sfc-${hash}.mjs`);
				}
			}

			// Add to vueDeps for separate processing
			vueDeps.add(key);
		}

		// Process .vue dependencies (they stay as sfc-*.mjs imports)
		for (const vueDep of vueDeps) {
			await strategy.processFile({
				filePath: vueDep,
				server,
				sfcFileMap,
				depFileMap,
				visitedPaths,
				wss,
				verbose,
				helpers: {
					cleanCode: (code: string) => cleanCode(code, strategy),
					collectImportDependencies,
					isCoreGlobalsReference,
					isNativeScriptCoreModule,
					isNativeScriptPluginModule,
					resolveVendorFromCandidate,
					createHash: (value: string) => createHash('md5').update(value).digest('hex'),
				},
			});
		}

		// Process with consistent SFC processor (removes non-.vue imports)
		code = processSfcCode(code);

		// Rewrite ONLY .vue imports (everything else is now inlined)
		const projectRoot = server.config.root || process.cwd();
		code = rewriteImports(code, rel, sfcFileMap, depFileMap, projectRoot, verbose, undefined);
		moduleGraph.upsert(rel, code, [...deps, ...vueDeps]);

		// Add HMR runtime prelude (CRITICAL for runtime)
		const hmrPrelude = `
// Embedded HMR Runtime for NativeScript runtime
const createHotContext = (id) => ({
  on: (event, handler) => {
    if (!globalThis.__NS_HMR_HANDLERS__) globalThis.__NS_HMR_HANDLERS__ = new Map();
    if (!globalThis.__NS_HMR_HANDLERS__.has(id)) globalThis.__NS_HMR_HANDLERS__.set(id, []);
    globalThis.__NS_HMR_HANDLERS__.get(id).push({ event, handler });
  },
  accept: (handler) => {
    if (!globalThis.__NS_HMR_ACCEPTS__) globalThis.__NS_HMR_ACCEPTS__ = new Map();
    globalThis.__NS_HMR_ACCEPTS__.set(id, handler);
  }
});

if (typeof import.meta === 'undefined') {
  globalThis.importMeta = { hot: null };
} else if (!import.meta.hot) {
  import.meta.hot = null;
}

const __vite__createHotContext = createHotContext;

if (typeof __VUE_HMR_RUNTIME__ === 'undefined') {
  globalThis.__VUE_HMR_RUNTIME__ = {
    createRecord: () => true,
    reload: () => {},
    rerender: () => {},
  };
}

// Install a lightweight guard to capture require('http(s)://...') attempts with stack traces
(() => {
  try {
    const g = globalThis;
    if (g.__NS_REQUIRE_GUARD_INSTALLED__) return;
	const makeGuard = (orig, label) => function () {
      try {
        const spec = arguments[0];
        if (typeof spec === 'string' && /^(?:https?:)\/\//.test(spec)) {
          const err = new Error('[ns-hmr][require-guard] require of URL: ' + spec + ' via ' + label);
          const stack = err.stack || '';
          console.error(err.message + '\n' + stack);
          try { g.__NS_REQUIRE_GUARD_LAST__ = { spec, stack, label, ts: Date.now() }; } catch {}
        }
      } catch {}
      return orig.apply(this, arguments);
    };
    if (typeof g.require === 'function' && !g.require.__NS_REQ_GUARDED__) {
      const orig = g.require; g.require = makeGuard(orig, 'require'); g.require.__NS_REQ_GUARDED__ = true;
    }
    if (typeof g.__nsRequire === 'function' && !g.__nsRequire.__NS_REQ_GUARDED__) {
      const orig = g.__nsRequire; g.__nsRequire = makeGuard(orig, '__nsRequire'); g.__nsRequire.__NS_REQ_GUARDED__ = true;
    }
    g.__NS_REQUIRE_GUARD_INSTALLED__ = true;
  } catch {}
})();
`;

		code = hmrPrelude + '\n' + code;

		// Update SFC registry
		const hash = createHash('md5').update(rel).digest('hex').slice(0, 8);
		const fileName = sfcFileMap.get(rel) || `sfc-${hash}.mjs`;
		sfcFileMap.set(rel, fileName);

		const ts = Date.now();

		// FIRST: Send mapping-only registry update (no code)
		const registryUpdateMsg: VueSfcRegistryUpdateMessage = {
			type: 'ns:vue-sfc-registry-update',
			path: rel,
			fileName,
			ts,
			version: moduleGraph.version,
		};

		wss.clients.forEach((client) => {
			if (isSocketClientOpen(client)) {
				client.send(JSON.stringify(registryUpdateMsg));
			}
		});

		// HTTP-only mode: the device loads SFC artifacts and their dependencies via
		// HTTP endpoints on demand, so the WS channel stays metadata-only (just the
		// registry update above). No code-push, dependency harvest, or legacy dynamic
		// module message is emitted here.
	} catch (error) {
		console.warn('[hmr-ws] HMR update failed:', error);
		console.error(error);
	}

	// Vue path emits update summary at the end of the function so
	// every framework branch gets exactly one log line. Idempotent
	// — if any branch already emitted, this is a no-op.
	emitHmrUpdateSummary();
	// CRITICAL: Return empty array to prevent Vite's default HMR
	return [];
}
