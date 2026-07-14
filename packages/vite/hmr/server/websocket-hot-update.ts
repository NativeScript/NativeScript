import type { HmrContext } from 'vite';
import type { WebSocketServer } from 'ws';
import * as path from 'path';
import type { FrameworkServerStrategy } from './framework-strategy.js';
import type { HmrModuleGraph } from './hmr-module-graph.js';
import type { SharedTransformRequestRunner } from './shared-transform-request.js';
import { isRuntimeGraphExcludedPath } from './runtime-graph-filter.js';
import { isWithinHmrScope } from '../../helpers/hmr-scope.js';
import { collectGraphUpdateModulesForHotUpdate, type HotUpdateGraphModuleLike } from '../frameworks/angular/server/websocket-angular-hot-update.js';
import { getAppCssState } from '../../helpers/app-css-state.js';
import { classifyHmrUpdateKind, formatHmrUpdateSummary } from './perf-instrumentation.js';
import { createHmrPendingMessage } from './websocket-hmr-pending.js';
import type { CssUpdateItem } from '../shared/protocol.js';
import { appCssRootRelPath, buildCssUpdateItem, buildCssUpdatesMessage } from './css-update-message.js';
import { processContentCssUpdate } from './content-css-update.js';
import { getServerOrigin } from './server-origin.js';
import type { BootstrapRootComponent } from '../frameworks/angular/server/angular-root-component.js';

/**
 * Dependencies injected into each strategy's `handleHotUpdate` (and the shared
 * {@link runHotUpdatePrologue} it runs first). These hold per-server instance
 * state (`wss`, `moduleGraph`, the file maps, `sharedTransformRequest`) or are
 * plugin-closure accessors. Pure transform helpers (`cleanCode`,
 * `rewriteImports`, `processSfcCode`, `collectImportDependencies`) are NOT on the
 * context — the strategies that need them import them directly from
 * `websocket-device-transform.ts`. `getServerOrigin` is likewise imported
 * directly here from `server-origin.ts` (spy via the module in tests).
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

/** Always-on per-update timing + diagnostics, mutated in place across the prologue and the framework tail. */
export interface HmrUpdateMetrics {
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
export interface HotUpdatePrologueState {
	root: string;
	updateRel: string;
	metrics: HmrUpdateMetrics;
	emitSummary: () => void;
	/** App CSS output changed during an Angular TS edit; attach it to the reboot message. */
	deferredCssUpdates?: CssUpdateItem[];
}

/**
 * Shared, framework-agnostic prologue for every strategy's `handleHotUpdate`:
 * scope gating, update-metrics setup, the `ns:hmr-pending` broadcast, awaiting the
 * initial graph population, the common module-graph upsert, CSS hot-update +
 * Tailwind content-CSS broadcast, and the project-scope filter. Returns `null`
 * when one of those steps fully handles the change (every such path resolves to
 * Vite's `undefined` result, so the caller just returns), otherwise the
 * per-invocation {@link HotUpdatePrologueState} (`root`, `updateRel`, the live
 * `metrics` object, the idempotent `emitSummary`) the per-flavor tail consumes.
 * Exported so per-flavor strategies can own `prologue + their tail`.
 */
export async function runHotUpdatePrologue(ctx: HmrContext, deps: NsHotUpdateContext): Promise<HotUpdatePrologueState | null> {
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
		// Angular HTML templates opt out via `skipDefaultGraphUpdate` — their tail
		// re-queries the graph and drives the in-place swap / reboot itself.
		const skipDefaultGraphUpdate = strategy.skipDefaultGraphUpdate?.(file) ?? false;
		if (!skipDefaultGraphUpdate) {
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
						broadcastDelta: !strategy.deferDeltaBroadcast,
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
	let deferredCssUpdates: CssUpdateItem[] | undefined;

	// CSS hot-update — handled BEFORE the project-scope filter because
	// workspace deps (component `styleUrls`, `@import` partials) live outside
	// `<root>/`. We distinguish two kinds of style edit and apply each
	// correctly on the device — this is the fix for the regression where
	// component `styleUrls` edits were misrouted to a global `app.css` refresh
	// and silently did nothing:
	//
	//   • GLOBAL stylesheet — the app entry CSS itself OR one of its `@import`
	//     deps (tracked via `getAppCssState().deps`). Broadcast the app entry
	//     CSS path so Vite re-runs PostCSS through the `@import` chain; the
	//     device replaces the boot-time `app.css`-tagged selectors.
	//
	//   • COMPONENT style (`styleUrls`, including workspace-library
	//     components). Broadcast the style file's OWN path under a per-file
	//     tag. The device fetches that component's CSS and replaces just that
	//     file's selectors (`addTaggedAdditionalCSS` keyed by the file path),
	//     re-styling the live view without a reboot or `ɵɵreplaceMetadata`
	//     swap. `app.css` is never involved — it does not contain the
	//     component's inlined styles. Using a per-file tag (instead of the
	//     shared `app.css` tag) avoids clobbering the global stylesheet.
	if (file.endsWith('.css')) {
		const fileAbs = path.resolve(file).replace(/\\/g, '/');
		const appCssState = getAppCssState(server);
		const appEntryCssAbs = (appCssState?.path || path.resolve(root, APP_ROOT_DIR, 'app.css')).replace(/\\/g, '/');
		const isGlobalStyle = fileAbs === appEntryCssAbs || !!appCssState?.deps?.has(fileAbs);

		// Component-scoped style edit the framework applies in place itself
		// (Angular + Analog liveReload → `angular:component-update`). Suppress
		// the `ns:css-updates` broadcast: it can't win the emulated-scoping
		// specificity battle anyway, AND the device's `?direct=1` fetch would
		// create the css `?direct` module that stops the framework from
		// re-emitting its component-update on subsequent edits. The framework's
		// own `handleHotUpdate` (a separate plugin) drives the update.
		if (!isGlobalStyle && strategy.ownsComponentStyleHmr?.(server)) {
			updateMetrics.tAfterFramework = Date.now();
			if (verbose) console.log(`[hmr-ws] component style edit ${file} → left to framework component-update (no css broadcast)`);
			emitHmrUpdateSummary();
			return null;
		}

		const toRootRel = (absOrFile: string) => '/' + path.posix.normalize(path.relative(root, absOrFile)).split(path.sep).join('/');
		// GLOBAL → app entry CSS path (default `app.css` tag on the client),
		// through the guarded canonical helper. COMPONENT → the style file's
		// OWN path (may legitimately escape the root for workspace libs).
		const broadcastPath = isGlobalStyle ? appCssRootRelPath(root, appEntryCssAbs) : toRootRel(file);
		const tag = isGlobalStyle ? undefined : broadcastPath;

		updateMetrics.tAfterFramework = Date.now();
		if (!broadcastPath) {
			if (verbose) console.warn(`[hmr-ws] global app.css path escapes the project root; skipped CSS broadcast for ${file}`);
			emitHmrUpdateSummary();
			return null;
		}
		try {
			const msg = buildCssUpdatesMessage(server, [buildCssUpdateItem(broadcastPath, { tag })]);
			wss.clients.forEach((client) => {
				if (isSocketClientOpen(client)) {
					client.send(JSON.stringify(msg));
					updateMetrics.recipients += 1;
				}
			});
		} catch (error) {
			console.warn('[hmr-ws] CSS update failed:', error);
		}
		if (verbose) console.log(`[hmr-ws] Hot update for: ${file} → broadcast CSS ${broadcastPath} (${isGlobalStyle ? 'global app.css' : `component, tag=${tag}`})`);
		emitHmrUpdateSummary();
		return null;
	}

	// No second project-scope filter here. The authoritative allowlist is the
	// `isWithinHmrScope` gate at the top of this prologue — app source dir plus
	// tsconfig-configured shared-library roots. An older, narrower re-filter at
	// this point (project-root `src`/`core`/app-dir substring checks) silently
	// dropped workspace-library files: their `.ts`/`.html` edits never reached
	// the framework tails, so a monorepo lib component's class edit could only
	// flow through Analog's in-place `ɵɵreplaceMetadata` path — which reuses
	// the live instance and can NEVER apply class-body changes — while the
	// Angular reboot broadcast (`ns:angular-update`) that actually delivers
	// them never fired. The visible symptom: editing a lib component's class
	// (e.g. converting inputs to signals) appears to hot-update but the running
	// instance keeps the old shape, and the next template edit that uses the
	// new shape throws (`ctx.x is not a function`) on every subsequent save.
	if (verbose) console.log(`[hmr-ws] Hot update for: ${file}`);

	// Tailwind / content-scanning CSS routing for non-CSS edits — see
	// `processContentCssUpdate` for the full background. This MUST run before
	// the framework branches because several of them return early (notably the
	// Angular HTML live-reload path), and the broadcast must land alongside
	// the framework's own template-update payload.
	if (!file.endsWith('.css')) {
		const contentCss = await processContentCssUpdate({
			server,
			file,
			root,
			wss,
			isSocketClientOpen,
			deferToFrameworkUpdate: strategy.defersContentCssToFrameworkUpdate?.(file) ?? false,
			verbose,
		});
		deferredCssUpdates = contentCss.deferredCssUpdates;
		updateMetrics.recipients += contentCss.recipients;
	}

	return { root, updateRel, metrics: updateMetrics, emitSummary: emitHmrUpdateSummary, deferredCssUpdates };
}
