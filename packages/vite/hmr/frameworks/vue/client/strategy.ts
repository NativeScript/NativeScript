import type { FrameworkClientStrategy, FrameworkClientMountContext, FrameworkClientBatchContext, FrameworkClientMessageContext } from '../../../client/framework-client-strategy.js';
import { ENV_VERBOSE as VERBOSE, getGraphVersion } from '../../../client/utils.js';
import { installNsVueDevShims, ensureBackWrapperInstalled, getRootForVue, loadSfcComponent, ensureVueGlobals, recordVuePayloadChanges, handleVueSfcRegistry, handleVueSfcRegistryUpdate, sfcArtifactMap, sfcChangedInVersion, tryInPlaceVueReload } from './index.js';
import { installVueNavigateUsingApp } from './navigate-app.js';
import { APPLIED_IN_PLACE, driveVueSfcUpdateOverlay } from './vue-sfc-update-overlay.js';
import { findNearestSfcBoundaries } from './dep-propagation.js';

const VUE_SFC_RE = /\.vue$/i;

/** Injectable seam so the propagation decision tree is unit testable. */
export interface VueDepPropagationDeps {
	findBoundaries: typeof findNearestSfcBoundaries;
	loadComponent: (targetVuePath: string) => Promise<any | null>;
	reloadInPlace: (component: any) => boolean;
	sfcChangedInVersion: (version: number) => boolean;
	getVersion: () => number;
	driveOverlay: typeof driveVueSfcUpdateOverlay;
}

const defaultPropagationDeps: VueDepPropagationDeps = {
	findBoundaries: findNearestSfcBoundaries,
	loadComponent: loadSfcComponent,
	reloadInPlace: (component) => tryInPlaceVueReload(component),
	sfcChangedInVersion,
	getVersion: getGraphVersion,
	driveOverlay: driveVueSfcUpdateOverlay,
};

/**
 * Non-SFC dependency propagation. When a plain `.ts`/`.js` module changes, the
 * shared queue evicts + re-imports it, but the live component instances still
 * hold bindings to the OLD module instance — nothing on the Vue side remounts
 * (the server only emits `ns:vue-sfc-registry-update` for `.vue` edits). Walk
 * the reverse import graph to every `.vue` boundary, re-assemble each one
 * (`loadSfcComponent` links the freshly re-imported deps) and reload its
 * mounted instances in place, as the registry-update path does. Boundaries
 * with no mounted instance are a no-op for Vue's HMR runtime, so only visible
 * components re-render and the app shell and navigation stay put. Without the
 * runtime, the nearest boundary is remounted as the root instead.
 *
 * Returns true when a propagation cycle ran (and drove the overlay to
 * 'complete' itself); false when the caller should fall through to the plain
 * overlay-complete frame (no boundary found, mixed batch handled by the
 * registry-update path, or missing context).
 */
export async function propagateDepChangeToSfcBoundary(drained: string[], ctx: FrameworkClientBatchContext, deps: VueDepPropagationDeps = defaultPropagationDeps): Promise<boolean> {
	try {
		if (!ctx.graph || typeof ctx.performResetRoot !== 'function') return false;
		if (deps.sfcChangedInVersion(deps.getVersion())) {
			if (VERBOSE) console.log('[hmr][vue][dep-propagation] .vue change in this delta; registry-update path owns the remount');
			return false;
		}
		const boundaries = deps.findBoundaries(drained, ctx.graph);
		if (!boundaries.length) return false;
		if (VERBOSE) console.log('[hmr][vue][dep-propagation] reloading SFC boundaries for dep change', { boundaries, drained });
		const performResetRoot = ctx.performResetRoot;
		await deps.driveOverlay(
			{
				filePath: boundaries[0],
				loadComponent: async () => {
					let reloaded = false;
					for (const target of boundaries) {
						const component = await deps.loadComponent(target);
						if (!component) continue;
						if (!deps.reloadInPlace(component)) {
							return reloaded ? APPLIED_IN_PLACE : component;
						}
						reloaded = true;
					}
					return reloaded ? APPLIED_IN_PLACE : null;
				},
				applyComponent: (component) => Promise.resolve(performResetRoot(component)),
			},
			{ getOverlay: ctx.getOverlay ?? (() => null) },
		);
		return true;
	} catch (e) {
		if (VERBOSE) console.warn('[hmr][vue][dep-propagation] failed; falling back to overlay-complete', e);
		return false;
	}
}

/**
 * Vue's on-device HMR behavior, surfaced as a `FrameworkClientStrategy` so the
 * shared client never references the Vue client module directly. Every method
 * delegates to the existing `vue/client` functions — no behavior change.
 */
export const vueClientStrategy: FrameworkClientStrategy = {
	flavor: 'vue',
	// resetRootView (not in-place navigate) is the proven path for SFC HMR.
	allowNavigateFastPath: false,

	install() {
		installNsVueDevShims();
		// Prime Vue globals (createApp/NSVRoot) eagerly the moment the dynamically
		// imported client strategy resolves, then expose the deterministic
		// app-driven navigator (`globalThis.__nsNavigateUsingApp`) the `/ns/rt`
		// bridge's `$navigateTo` routes through.
		ensureVueGlobals();
		installVueNavigateUsingApp();
	},

	installBackWrapper(performResetRoot, getCore) {
		ensureBackWrapperInstalled(performResetRoot, getCore);
	},

	selectMountCandidate(ctx: FrameworkClientMountContext): string | null {
		let candidate: string | null = null;
		const appEntry = ctx.graph.get(ctx.appMainEntrySpec);
		if (appEntry && Array.isArray(appEntry.deps)) {
			const vueDep = appEntry.deps.find((d) => typeof d === 'string' && VUE_SFC_RE.test(d));
			if (vueDep) candidate = vueDep;
		}
		if (!candidate) {
			for (const id of ctx.graph.keys()) {
				if (VUE_SFC_RE.test(id)) {
					candidate = id;
					break;
				}
			}
		}
		// Fallback: when the module graph is empty (Vite may not populate it before
		// the first full-graph broadcast), check the SFC artifact registry populated
		// from the ns:vue-sfc-registry message.
		if (!candidate && sfcArtifactMap.size > 0) {
			for (const id of sfcArtifactMap.keys()) {
				if (VUE_SFC_RE.test(id)) {
					candidate = id;
					break;
				}
			}
		}
		return candidate;
	},

	loadComponentForMount(candidate: string): Promise<any> {
		return loadSfcComponent(candidate);
	},

	createRoot(newComponent: any, state: any): any {
		return getRootForVue(newComponent, state);
	},

	recordPayloadChanges(changed: any[], graphVersion: number) {
		recordVuePayloadChanges(changed, graphVersion);
	},

	async refreshAfterBatch(drained: string[], ctx: FrameworkClientBatchContext) {
		// Non-SFC dep changed: re-importing the module alone leaves the mounted
		// component bound to the stale instance — propagate up the reverse import
		// graph and remount the nearest `.vue` boundary so the change is visible.
		// The propagation drives the overlay through its own complete frame.
		const propagated = await propagateDepChangeToSfcBoundary(drained, ctx);
		if (propagated) return;
		// Vue SFCs complete their own overlay via the registry-update path. When
		// no SFC boundary imports the changed dep (or a .vue change in the same
		// delta owns the remount), drive the closing frame here so the toast can
		// auto-hide.
		const elapsed = Math.max(0, Date.now() - ctx.startedAt);
		ctx.setUpdateOverlayStage('complete', {
			detail: drained.length === 1 ? `Updated ${drained[0]} in ${elapsed}ms` : `Updated ${drained.length} modules in ${elapsed}ms`,
		});
	},

	handleSfcRegistry(msg: any) {
		handleVueSfcRegistry(msg);
	},

	async handleSfcRegistryUpdate(msg: any, graphVersion: number, ctx: FrameworkClientMessageContext) {
		await driveVueSfcUpdateOverlay(
			{
				filePath: typeof msg.path === 'string' ? msg.path : undefined,
				loadComponent: () => handleVueSfcRegistryUpdate(msg, graphVersion),
				applyComponent: (component) => ctx.performResetRoot(component),
			},
			{ getOverlay: ctx.getOverlay },
		);
	},
};
