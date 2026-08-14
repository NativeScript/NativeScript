import type { FrameworkClientBatchContext, FrameworkClientStrategy } from '../../../client/framework-client-strategy.js';
import { ENV_VERBOSE as VERBOSE, buildEvictionUrls, invalidateModulesByUrls, normalizeSpec, requestModuleFromServer } from '../../../client/utils.js';
import { getGlobalScope } from '../../../shared/runtime/global-scope.js';

// ── Solid HMR completion hooks ──────────────────────────────────────────────
//
// solid-refresh's inline `patchRegistry` correctly swaps the proxy's internal
// signal to point at each newly-evaluated component implementation. Tracing
// confirms the proxy's memo re-evaluates and produces the expected new view
// nodes after a `.tsx` edit.
//
// However, in the universal-renderer + nested-context configuration used by
// frameworks like `@nativescript/tanstack-router` (RouterContextProvider →
// SafeFragment → solid-js Provider's children helper → resolveChildren →
// ErrorBoundary memo → component memo), the page-level `createRenderEffect`
// inside `insertExpression` does NOT re-fire when the inner component memo
// updates. The subscription graph appears intact yet propagation stops short
// of the renderEffect that owns the visible page tree.
//
// Rather than ship a deep solid-js patch specific to one configuration, we
// expose a generic completion hook here. Framework integrations register a
// listener (see `@nativescript/tanstack-router`'s `NativeScriptRouterProvider`)
// that performs whatever framework-specific UI refresh is required — for
// the router that means remounting the active Page's Solid tree so the
// fresh component output reaches the screen.
//
// The hook is opt-in: if no framework registers a listener, behavior is
// unchanged and the existing best-effort solid-refresh path remains in
// charge.
type NsSolidHmrEvent = {
	kind: 'solid';
	changedFiles: string[];
	boundaries: string[];
	/**
	 * Every module reachable from a changed file via the REVERSE import graph
	 * (its importers, their importers, … up to the app entry). App-level
	 * integrations (`startSolidApp` in `@nativescript/vite/solid-bootstrap`)
	 * must evict this whole chain before re-importing the app root — module
	 * identity is the URL, so any cached intermediate (e.g. `home.tsx`
	 * importing a changed `listen-now.tsx`) would otherwise keep serving the
	 * stale child to the fresh root.
	 */
	ancestors: string[];
};
type NsSolidHmrListener = (ev: NsSolidHmrEvent) => void;

// Store the listener registry on globalThis (rather than in a module-private
// closure) because in NativeScript the HMR client module and the user app
// modules can resolve to different module instances depending on how the
// dev runtime loads them (HTTP client URL vs. the bundled vendor realm).
// A module-local Set would not be shared across instances; the global one
// is.
function getNsSolidHmrListenerSet(): Set<NsSolidHmrListener> {
	const g: any = getGlobalScope();
	let set = g.__ns_solid_hmr_listener_set as Set<NsSolidHmrListener> | undefined;
	if (!set) {
		set = new Set<NsSolidHmrListener>();
		g.__ns_solid_hmr_listener_set = set;
	}
	return set;
}

function nsSolidHmrSubscribe(fn: NsSolidHmrListener): () => void {
	const listeners = getNsSolidHmrListenerSet();
	listeners.add(fn);
	if (VERBOSE) console.log('[hmr][solid] subscribe — listeners=', listeners.size);
	return () => listeners.delete(fn);
}

function nsSolidHmrEmit(ev: NsSolidHmrEvent) {
	const listeners = getNsSolidHmrListenerSet();
	if (VERBOSE) console.log('[hmr][solid] emit listeners=', listeners.size, 'changedFiles=', ev.changedFiles);
	for (const fn of Array.from(listeners)) {
		try {
			fn(ev);
		} catch (err) {
			if (VERBOSE) console.warn('[hmr][solid] listener threw', err);
		}
	}
}

const ROUTE_FILE_RE = /\/src\/routes\/.+\.(tsx|jsx)$/i;

/**
 * Post-drain propagation + UI refresh for the Solid flavor.
 *
 * Solid .tsx components are self-accepting via solid-refresh's inline
 * patchRegistry — re-importing them is sufficient. For non-component .ts
 * utility modules, propagate up the import graph to the .tsx/.jsx component
 * boundaries and re-import those so their solid-refresh proxies pick up the
 * new dependency values. Route files (TanStack Router) additionally get their
 * live `route.options.component`/`loader` patched with the fresh exports.
 */
async function refreshSolidAfterBatch(drained: string[], ctx: FrameworkClientBatchContext): Promise<void> {
	const graph = ctx.graph ?? new Map();
	// Ids the shared queue already re-imported in this drain cycle.
	const seen = new Set(drained);
	// Boundaries discovered in this HMR cycle (tsx files reachable via the
	// reverse import graph from any changed file, plus route files reachable
	// from any tsx start point). Declared up front so the emit step below can
	// include the complete set in the listener event — framework integrations
	// use it to map route boundaries → fresh component references.
	const boundaries = new Set<string>();
	// FULL reverse-import chain from every changed file up to the app entry
	// (all importers, transitively — not just tsx ones). Emitted as
	// `ev.ancestors` so app-level remount helpers can evict the whole chain:
	// re-importing only the root would resolve cached intermediates and hand
	// the fresh root a stale subtree.
	const ancestors = new Set<string>();
	try {
		// Build reverse index: dep id → list of importer ids
		const reverseIndex = new Map<string, string[]>();
		for (const [id, mod] of graph) {
			for (const dep of mod.deps) {
				let arr = reverseIndex.get(dep);
				if (!arr) {
					arr = [];
					reverseIndex.set(dep, arr);
				}
				arr.push(id);
			}
		}
		// Pass 0: collect the FULL importer chain of every changed file
		// (BFS up the reverse graph, no filtering). This feeds
		// `ev.ancestors` for app-level remount helpers.
		for (const id of drained) {
			const queue = [id];
			while (queue.length) {
				const cur = queue.shift()!;
				const importers = reverseIndex.get(cur);
				if (!importers) continue;
				for (const imp of importers) {
					if (ancestors.has(imp)) continue;
					ancestors.add(imp);
					queue.push(imp);
				}
			}
		}
		// Pass 1: BFS from each non-tsx changed module up to tsx/jsx
		// boundaries. These get re-imported below so solid-refresh's
		// inline patchRegistry runs and (best-effort) swaps the proxy
		// signals for any components defined in those tsx boundaries.
		for (const id of drained) {
			if (/\.(tsx|jsx)$/i.test(id)) continue; // already self-accepting
			const visited = new Set<string>();
			const queue = [id];
			while (queue.length) {
				const cur = queue.shift()!;
				if (visited.has(cur)) continue;
				visited.add(cur);
				const importers = reverseIndex.get(cur);
				if (!importers) continue;
				for (const imp of importers) {
					if (/\.(tsx|jsx)$/i.test(imp)) {
						boundaries.add(imp);
					} else {
						queue.push(imp);
					}
				}
			}
		}
		// Pass 2: walk further from any tsx starting point (a tsx file
		// in `drained` OR a tsx boundary discovered in pass 1) to find
		// route files (`/src/routes/*.{tsx,jsx}`) that transitively
		// import them. Re-importing a route file refreshes its
		// `Route.options.component` to the freshly-imported reference
		// and the existing boundary loop below patches the live router
		// with that fresh reference.
		//
		// This is the key fix for "edit home.tsx → save → no visual
		// update": the old BFS skipped tsx files in `drained` (assuming
		// solid-refresh's in-place proxy patch was sufficient), but in
		// the universal-renderer + nested-context configuration that
		// patch does not always propagate to the visible page tree.
		// Adding the route file as a boundary lets us patch
		// `route.options.component` directly to a fresh module export,
		// which the framework subscriber then passes through to the
		// page remount — making the cycle robust to the proxy patch
		// silently failing.
		const tsxStarts = new Set<string>();
		for (const id of drained) {
			if (/\.(tsx|jsx)$/i.test(id)) tsxStarts.add(id);
		}
		for (const b of boundaries) tsxStarts.add(b);
		for (const start of tsxStarts) {
			const visited = new Set<string>();
			const queue = [start];
			while (queue.length) {
				const cur = queue.shift()!;
				if (visited.has(cur)) continue;
				visited.add(cur);
				if (cur !== start && ROUTE_FILE_RE.test(cur)) {
					boundaries.add(cur);
				}
				const importers = reverseIndex.get(cur);
				if (!importers) continue;
				for (const imp of importers) {
					queue.push(imp);
				}
			}
		}
		// Re-import each boundary so solid-refresh patchRegistry fires.
		// For route files (TanStack Router), capture the new Route export
		// and patch the router's existing route with the fresh loader.
		let routesPatchCount = 0;
		let discoveredRouter: any = null;
		// Discover router: try __ns_router global (set by createNativeScriptRouter),
		// then scan globalThis for any router-shaped object with routesById.
		const findRouter = (): any => {
			if (discoveredRouter) return discoveredRouter;
			const g = getGlobalScope();
			if (g.__ns_router?.routesById) return (discoveredRouter = g.__ns_router);
			// Fallback: scan common global keys for router
			for (const key of ['__ns_router', 'router', '__router']) {
				if (g[key]?.routesById && g[key]?.invalidate) return (discoveredRouter = g[key]);
			}
			return null;
		};
		// Convert boundary file path to TanStack Router fullPath.
		// e.g. /src/routes/posts.$postId.tsx → /posts/$postId
		const boundaryToFullPath = (bid: string): string | null => {
			const m = bid.match(/\/src\/routes\/(.+)\.(tsx|jsx|ts|js)$/i);
			if (!m) return null;
			let p = m[1];
			// Replace dots between segments with slashes (posts.$postId → posts/$postId)
			p = p.replace(/\./g, '/');
			// Handle index files
			if (p === 'index') return '/';
			if (p.endsWith('/index')) p = p.slice(0, -6);
			// Strip leading - (TanStack pathless layout convention)
			p = p.replace(/(^|\/)-([\w])/g, '$1$2');
			return '/' + p;
		};
		// Find existing route by fullPath (since new Route has no id yet).
		// The root route (`__root__`) shares fullPath '/' with the index
		// route, so prefer the non-root (leaf) match — otherwise editing
		// `index.tsx` would clobber the root layout's component instead of
		// the page's. @nativescript/tanstack-router's remount uses the same
		// preference so patch + read target the same route.
		const findRouteByFullPath = (router: any, fp: string): any => {
			if (!router?.routesById) return null;
			let rootMatch: any = null;
			for (const rid of Object.keys(router.routesById)) {
				const r = router.routesById[rid];
				if (r?.fullPath !== fp) continue;
				if (rid === '__root__') {
					rootMatch = rootMatch || r;
					continue;
				}
				return r;
			}
			return rootMatch;
		};
		// A changed route file is itself a boundary to re-import + patch — Pass 2
		// only adds OTHER route files that import a changed module, never the
		// changed route file itself. Without this, editing `about.tsx` while on
		// /about never refreshes the About component.
		for (const id of drained) {
			if (ROUTE_FILE_RE.test(id)) boundaries.add(id);
		}
		// Evict ONLY the boundary set (changed component + route files) — NOT the
		// router / route-tree / app chain. Keeping those cached preserves the live
		// router instance and the user's current route across the re-mount; fresh
		// route components reach the screen via the in-place `route.options.component`
		// patch below, not a router rebuild (which would reset to the initial route).
		const boundaryIds = Array.from(boundaries);
		const solidEvictUrls = buildEvictionUrls(boundaryIds);
		const solidEvicted = invalidateModulesByUrls(solidEvictUrls);
		if (VERBOSE) console.log(`[hmr][solid] eviction count=${solidEvictUrls.length} ok=${solidEvicted}`);
		for (const id of boundaries) {
			// Skip already-drained modules — EXCEPT route files. The main
			// drain loop above re-imports drained modules but does NOT patch
			// `route.options.component`; a changed ROUTE file (which is in
			// `drained`/`seen`) must still flow through this loop so its route
			// gets patched with the fresh component, otherwise the router's
			// per-page HMR remount re-renders the stale (one-edit-behind) one.
			if (seen.has(id) && !/\/src\/routes\/.+\.(?:tsx|jsx)$/i.test(id)) continue;
			// Skip the root layout (`__root`): it commonly imports a global
			// stylesheet (`./styles.css?url`) with no ESM `default` export on
			// device, so re-importing it throws and aborts the cycle. The root
			// layout rarely needs a component hot-swap anyway.
			if (/\/routes\/__root\.(?:tsx|jsx|ts|js)$/i.test(id)) continue;
			try {
				const spec = normalizeSpec(id);
				// Re-import the canonical URL. The boundary was evicted above
				// (`invalidateModulesByUrls(solidEvictUrls)`), which also armed
				// the runtime's bust-next-fetch nonce, so this import re-fetches
				// the just-saved transform rather than a cached one. This is what
				// `route.options.component` is patched from below, and what
				// @nativescript/tanstack-router's per-page HMR remount reads.
				const url = await requestModuleFromServer(spec);
				if (!url) continue;
				if (VERBOSE) console.log('[hmr][solid] propagated to boundary', { id, url });
				const mod: any = await import(/* @vite-ignore */ url);
				// Patch TanStack Router route options for any module
				// that exports a `Route`. We patch BOTH the component
				// and the loader (when present); components-only routes
				// were previously skipped because the gate required a
				// loader, which left their `options.component` pointing
				// at the stale module's exports after HMR.
				try {
					const newRoute = mod?.Route;
					if (newRoute?.options) {
						const router = findRouter();
						const fullPath = boundaryToFullPath(id);
						if (VERBOSE) console.log('[hmr][solid][diag] route patch attempt', { id, fullPath, hasRouter: !!router, hasLoader: !!newRoute.options.loader, hasComponent: !!newRoute.options.component });
						const existingRoute = fullPath && router ? findRouteByFullPath(router, fullPath) : null;
						if (existingRoute?.options) {
							if (newRoute.options.loader) existingRoute.options.loader = newRoute.options.loader;
							if (newRoute.options.component) existingRoute.options.component = newRoute.options.component;
							routesPatchCount++;
							if (VERBOSE) console.log('[hmr][solid] patched route', existingRoute.id, 'fullPath=', fullPath);
						} else if (VERBOSE) {
							console.log('[hmr][solid] no matching route for fullPath', fullPath);
						}
					}
				} catch (e) {
					if (VERBOSE) console.warn('[hmr][solid] route patch error', id, e);
				}
			} catch (e) {
				if (VERBOSE) console.warn('[hmr][solid] boundary re-import failed', id, e);
			}
		}
		// Route loaders were patched with fresh closures. The data is
		// correct in router.state.matches[].loaderData (confirmed via
		// diagnostics), but the currently visible page doesn't re-render
		// because the NativeScriptRouterProvider's Solid store flush only
		// fires through history.subscribe. TODO: find the right mechanism
		// to trigger a Solid reactive update for the active match stores.
		if (routesPatchCount > 0 && VERBOSE) {
			console.log('[hmr][solid] patched', routesPatchCount, 'route loaders (data correct in match state, pending UI refresh mechanism)');
		}
		if (VERBOSE) {
			if (boundaries.size) console.log('[hmr][solid] propagated non-component change to', boundaries.size, 'boundaries', Array.from(boundaries));
			console.log('[hmr][queue] Solid: modules re-imported; UI refresh is driven by the framework subscriber (router per-page remount or startSolidApp re-render)', drained);
		}
	} catch (e) {
		if (VERBOSE) console.warn('[hmr][solid] propagation failed', e);
	}
	// Notify any framework integrations (e.g. `@nativescript/tanstack-router`)
	// that a Solid HMR cycle has completed. They use this signal to perform
	// framework-specific UI refresh (e.g. remount the active router page) when
	// solid-refresh's own reactive propagation does not reach the visible tree
	// under the current renderer/context configuration.
	//
	// Boundaries include both the directly-changed tsx files AND every tsx
	// ancestor reachable via the reverse import graph (route files in
	// particular). The framework listener uses the route-file boundaries to
	// look up the freshly-patched `route.options.component` and pass it
	// through to the page remount.
	try {
		const tsxChangedInDrained = drained.filter((id) => /\.(tsx|jsx)$/i.test(id));
		const allBoundaries = Array.from(new Set([...tsxChangedInDrained, ...boundaries]));
		nsSolidHmrEmit({
			kind: 'solid',
			changedFiles: drained.slice(),
			boundaries: allBoundaries,
			ancestors: Array.from(ancestors),
		});
	} catch (err) {
		if (VERBOSE) console.warn('[hmr][solid] emit failed', err);
	}
	// Tell the overlay the cycle is done. solid-refresh's inline patchRegistry
	// has already flushed the new component bodies into the live tree (the
	// boundary loop above re-imports each .tsx boundary), so by the time we
	// get here the user is already looking at the new render. The 'complete'
	// frame surfaces the wall-clock total and triggers the overlay's auto-hide.
	ctx.setUpdateOverlayStage('complete', {
		detail: `Total ${Math.max(0, Date.now() - ctx.startedAt)}ms`,
	});
}

/**
 * Solid's on-device HMR behavior. Solid has no SFC registry or hot-update
 * message protocol — its whole client surface is the completion-hook global
 * (installed once here) plus the post-drain boundary propagation.
 */
export const solidClientStrategy: FrameworkClientStrategy = {
	flavor: 'solid',
	drivesQueueOverlayStages: true,

	install() {
		try {
			const g: any = getGlobalScope();
			g.__ns_solid_hmr_subscribe = nsSolidHmrSubscribe;
			// Eagerly create the listener set so the global exists at install time.
			getNsSolidHmrListenerSet();
			if (VERBOSE) console.log('[hmr][solid] HMR client loaded. global set=', typeof g.__ns_solid_hmr_subscribe, 'listenerSet=', typeof g.__ns_solid_hmr_listener_set);
		} catch (err) {
			console.warn('[hmr][solid] could not install global __ns_solid_hmr_subscribe', err);
		}
	},

	refreshAfterBatch(drained: string[], ctx: FrameworkClientBatchContext) {
		return refreshSolidAfterBatch(drained, ctx);
	},
};
