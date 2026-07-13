/**
 * Update pipeline — graph state + the evict-then-reimport queue.
 *
 * Owns the client's view of the module graph (full-graph / delta application)
 * and the changed-module queue that turns a delta into fresh module bodies on
 * device. The ordering inside `processQueue` is load-bearing: explicit
 * eviction MUST complete before re-import, or V8's module registry serves the
 * stale cached module and the drain becomes a silent no-op.
 */

import { graph, setGraphVersion, getGraphVersion, normalizeSpec, moduleFetchCache, requestModuleFromServer, invalidateModulesByUrls, buildEvictionUrls, ENV_VERBOSE, getCore } from './utils.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';
import { markDevBootComplete } from '../shared/runtime/boot-complete.js';
import { getOverlayApi as getHmrOverlayApi, setUpdateStage as setUpdateOverlayStage } from './overlay-driver.js';
import { getClientStrategy, TS_LIKE_FLAVOR, APP_MAIN_ENTRY_SPEC } from './strategy-loader.js';
import { sendHmrMessage } from './ws-transport.js';
import { performResetRoot } from './root-reset.js';

const VERBOSE = ENV_VERBOSE;

// Track whether we've mounted an initial app root yet in HTTP-only boot
let initialMounted = !!globalThis.__NS_HMR_BOOT_COMPLETE__;
// Prevent duplicate initial-mount scheduling across rapid full-graph broadcasts and re-evaluations
let initialMounting = !!globalThis.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__;
// Track whether the first full-graph has been received. Before the full-graph,
// delta messages are just the server discovering modules during initial boot —
// NOT actual code changes. Re-imports must be gated behind this flag.
let hasReceivedFullGraph = false;
const changedQueue: any[] = [];
let processingQueue = false;
let processingPromise: Promise<void> | null = null;

export function hasReceivedFirstFullGraph(): boolean {
	return hasReceivedFullGraph;
}

export function markFullGraphReceived(): void {
	hasReceivedFullGraph = true;
}

// Detect whether the early placeholder root is still active on screen
function isPlaceholderActive(): boolean {
	try {
		const g: any = getGlobalScope();
		if (g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__) return true;
		if (g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__) return true;
	} catch {}
	return false;
}

export function applyFullGraph(payload: any) {
	if (typeof payload.version !== 'number' || !Array.isArray(payload.modules)) return;
	graph.clear();
	payload.modules.forEach((m: any) => {
		if (m && m.id) graph.set(m.id, { id: m.id, deps: m.deps || [], hash: m.hash || '' });
	});
	setGraphVersion(payload.version);
	if (VERBOSE) console.log('[hmr][graph] full graph applied version', getGraphVersion(), 'modules=', graph.size);
	// Guarded initial mount rescue: if app hasn't replaced the placeholder shortly after graph arrives,
	// perform a one-time mount. This waits briefly to let the app's main entry start() run first to avoid double mounts.
	// TypeScript flavor: skip the rescue entirely. The HTTP boot will load main.ts which
	// calls Application.run() (patched to resetRootView) — the rescue is redundant and
	// causes a double-mount race (rescue fires at 450ms, then main.ts fires ~1s later,
	// causing a visual flash and leaving the app in an inconsistent state).
	try {
		const g: any = getGlobalScope();
		const bootDone = !!g.__NS_HMR_BOOT_COMPLETE__;
		if (!bootDone && !initialMounted && !initialMounting && !g.__NS_HMR_RESCUE_SCHEDULED__ && !TS_LIKE_FLAVOR) {
			// simple snapshot helpers
			const getTopmost = () => {
				try {
					const F = getCore('Frame') || g.Frame;
					return F?.topmost?.() || null;
				} catch {
					return null;
				}
			};
			const isPlaceholderView = (v: any) => {
				try {
					if (!v) return false;
					if (v === (g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__ || null)) return true;
					return !!(v as any).__ns_dev_placeholder;
				} catch {
					return false;
				}
			};
			const hasRealRoot = () => {
				try {
					const fr = getTopmost();
					if (!fr) return false;
					if (isPlaceholderView(fr)) return false;
					const pg = (fr as any).currentPage || (fr as any)._currentEntry?.resolvedPage;
					if (!pg) return false;
					if (isPlaceholderView(pg)) return false;
					return true;
				} catch {
					return false;
				}
			};
			try {
				g.__NS_HMR_RESCUE_SCHEDULED__ = true;
			} catch {}
			setTimeout(() => {
				try {
					if (g.__NS_HMR_BOOT_COMPLETE__) return; // app already mounted
					if (hasRealRoot()) {
						markDevBootComplete();
						if (VERBOSE) console.log('[hmr][init] detected real root after delay; skipping client initial mount');
						// Detach placeholder handler if still present
						try {
							const restore = g.__NS_DEV_RESTORE_PLACEHOLDER__;
							if (typeof restore === 'function') restore();
						} catch {}
						return;
					}
					// If placeholder still active and no real root, try a one-time gentle initial mount.
					// Vue: prefer SFCs; TypeScript: import the app main TS module and let performResetRoot handle it once.
					const placeholderActive = isPlaceholderActive();
					if (!placeholderActive) return;
					if (VERBOSE) console.log('[hmr][init] placeholder persists after delay; evaluating rescue policy');
					const strategy = getClientStrategy();
					const candidate = strategy?.selectMountCandidate?.({ graph, appMainEntrySpec: APP_MAIN_ENTRY_SPEC }) ?? null;
					if (!candidate) return;
					initialMounting = true;
					try {
						g.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = true;
					} catch {}
					(async () => {
						try {
							let comp: any = null;
							if (strategy?.loadComponentForMount) {
								comp = await strategy.loadComponentForMount(candidate!);
							}

							if (!comp) return;
							const ok = await performResetRoot(comp);
							if (ok) {
								initialMounted = true;
								markDevBootComplete();
								if (VERBOSE) console.log('[hmr][init] initial mount (rescue) complete');
							}
						} catch (e) {
							console.warn('[hmr][init] initial mount (rescue) error', e);
						} finally {
							initialMounting = false;
							try {
								g.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = false;
							} catch {}
						}
					})();
				} catch {}
			}, 450);
		}
	} catch {}
}

export function applyDelta(payload: any) {
	// If versions are out of sync, request a full graph resync, but still
	// opportunistically queue the changed ids so the client can react once
	// the resync arrives. This is especially important for simple TS flavors
	// where we only need a signal that "something changed" to trigger a
	// resetRootView-driven hot update.
	const currentVersion = getGraphVersion();
	const versionMatches = payload.baseVersion === currentVersion;
	if (!versionMatches) {
		if (VERBOSE) console.warn('[hmr][graph] version mismatch requesting resync', payload.baseVersion, currentVersion);
		sendHmrMessage({ type: 'ns:hmr-resync-request' });
	}
	if (versionMatches) {
		setGraphVersion(payload.newVersion);
	}

	const changed = payload.changed || [];
	getClientStrategy()?.recordPayloadChanges?.(changed, getGraphVersion());

	(payload.changed || []).forEach((m: any) => {
		if (!m || !m.id) return;
		// Always update the local graph view with the announced module metadata
		graph.set(m.id, { id: m.id, deps: m.deps || [], hash: m.hash || '' });
	});
	(payload.removed || []).forEach((r: string) => {
		graph.delete(r);
	});
	if (VERBOSE) console.log('[hmr][graph] delta applied newVersion', getGraphVersion(), 'changed=', (payload.changed || []).length, 'removed=', (payload.removed || []).length, 'baseVersion=', payload.baseVersion);
	// Queue evaluation of changed modules (placeholder pipeline)
	if (payload.changed?.length) {
		// Gate: Before the first full-graph is received, delta messages are the server
		// discovering modules during initial boot — NOT actual code changes. The entry-runtime
		// already loaded all modules; re-importing them would cause duplicate Application.run(),
		// router initialization, and modal conflicts. Only queue re-imports after the first
		// full-graph confirms the graph is synced and subsequent deltas are real changes.
		if (!hasReceivedFullGraph) {
			if (VERBOSE) console.log('[hmr][delta] skipping re-import queue (initial graph build, no full-graph yet)');
			return;
		}
		// HARD SUPPRESS: the very first delta (baseVersion 0) commonly includes the app main entry which is already evaluated during bootstrap.
		// Importing it again with a cache-bust often produces a spurious module-not-found (timestamp param treated as distinct file).
		const isInitial = payload.baseVersion === 0;
		// Filter out virtual helper ids (e.g. '\0plugin-vue:export-helper') which we do not evaluate directly
		const realIds = payload.changed.map((c: any) => c.id).filter((id: string) => !/^\0|^\/\0|plugin-vue:export-helper/.test(id));
		// Proactively prefetch core/src deps for any changed .vue SFCs (before registry update triggers reset)
		try {
			for (const entry of payload.changed || []) {
				if (!entry || !/\.vue$/i.test(entry.id)) continue;
				const deps: string[] = Array.isArray(entry.deps) ? entry.deps : [];
				const prefetchTargets = deps.filter((d) => /^\//.test(d) && !/node_modules/.test(d) && !/\.vue$/i.test(d));
				if (prefetchTargets.length && VERBOSE) console.log('[hmr][prefetch] SFC deps', entry.id, '->', prefetchTargets);
				for (const dep of prefetchTargets) {
					const norm = normalizeSpec(dep);
					// Skip if we already wrote it (basic heuristic: moduleFetchCache has it or path exists in Documents/_ns_hmr)
					if (moduleFetchCache.has(norm)) continue;
					// Fire and forget; ensure rejection does not break HMR pipeline
					requestModuleFromServer(norm).catch(() => {});
				}
			}
		} catch (e) {
			if (VERBOSE) console.warn('[hmr][prefetch] failed', e);
		}
		const isAppMainEntryId = (value: string) => value.endsWith(APP_MAIN_ENTRY_SPEC);
		for (const id of realIds) {
			// SFC registry update events trigger root resets for .vue files directly
			if (/\.vue$/i.test(id)) {
				if (VERBOSE) console.log('[hmr][delta] skipping queue for .vue id; will handle on registry update', id);
				continue;
			}
			if (isInitial && isAppMainEntryId(id)) {
				if (VERBOSE) console.log(`[hmr][delta] suppressing initial ${APP_MAIN_ENTRY_SPEC} evaluation`);
				continue;
			}
			if (isAppMainEntryId(id)) {
				try {
					const exists = getGlobalScope().require?.(id) || globalThis.__nsGetModuleExports?.(id);
					if (!exists && VERBOSE) console.log(`[hmr][delta] skipping unresolved ${APP_MAIN_ENTRY_SPEC} change`);
					if (!exists) continue;
				} catch {
					/* ignore */
				}
			}
			changedQueue.push(id);
		}
		if (changedQueue.length) processQueue();
	}
}

export async function processQueue(): Promise<void> {
	if (!globalThis.__NS_HMR_BOOT_COMPLETE__) {
		if (VERBOSE) console.log('[hmr][gate] deferring HMR eval until boot complete');
		setTimeout(() => {
			try {
				processQueue();
			} catch {}
		}, 150);
		return Promise.resolve();
	}
	if (processingQueue) return processingPromise || Promise.resolve();
	processingQueue = true;
	processingPromise = (async () => {
		try {
			// Simple deterministic drain of the queue. We currently focus on TS flavor
			// by re-importing changed modules (to refresh their HTTP ESM copies) and
			// then performing a root reset so the UI reflects the new code.
			const seen = new Set<string>();
			const drained: string[] = [];
			while (changedQueue.length) {
				const id = changedQueue.shift();
				if (!id || typeof id !== 'string') continue;
				if (seen.has(id)) continue;
				seen.add(id);
				drained.push(id);
			}
			if (!drained.length) return;
			if (VERBOSE) console.log('[hmr][queue] processing changed ids', drained);

			const strategy = getClientStrategy();
			// Track wall-clock so the 'complete' frame can show a meaningful
			// total. Only strategies that opt in (Solid) drive the overlay's
			// evicting/reimporting frames from here; Angular has its own flow
			// inside `frameworks/angular/client/index.ts`.
			const tQueueStart = Date.now();
			const driveQueueOverlay = strategy?.drivesQueueOverlayStages === true;

			// Explicit eviction step.
			//
			// Without explicit eviction the upcoming `import(url)` would
			// resolve via V8's `g_moduleRegistry` and return the cached
			// stale module — making the queue drain a silent no-op for
			// every save after the first. Eviction also arms the runtime's
			// bust-next-fetch nonce so the re-fetch defeats OS-level HTTP
			// caches; the re-import below then uses the STABLE canonical
			// URL (module identity IS the URL). node_modules and virtual
			// specs are filtered out by `buildEvictionUrls` so vendor
			// modules stay hot.
			if (driveQueueOverlay) {
				setUpdateOverlayStage('evicting', {
					detail: drained.length === 1 ? `Invalidating ${drained[0]}` : `Invalidating ${drained.length} modules`,
				});
			}
			const evictUrls = buildEvictionUrls(drained);
			const evicted = invalidateModulesByUrls(evictUrls);
			if (VERBOSE) console.log(`[hmr][queue] eviction count=${evictUrls.length} ok=${evicted}`);

			// Evaluate changed modules best-effort; failures shouldn't completely break HMR.
			if (driveQueueOverlay) {
				setUpdateOverlayStage('reimporting', {
					detail: drained.length === 1 ? `Re-importing ${drained[0]}` : `Re-importing ${drained.length} modules`,
				});
			}
			let reimportFailures = 0;
			for (const id of drained) {
				try {
					const spec = normalizeSpec(id);
					const url = await requestModuleFromServer(spec);
					if (!url) continue;
					if (VERBOSE) console.log('[hmr][queue] re-import', { id, spec, url });
					const mod: any = await import(/* @vite-ignore */ url);
					// TS/React: refresh the bundler module registry with the fresh
					// exports (see typescriptClientStrategy.afterModuleReimport).
					strategy?.afterModuleReimport?.(id, mod);
				} catch (e) {
					// Never silent: a failed re-import means the device may keep
					// running the previous module body, so always surface it (not
					// verbose-gated) — otherwise the overlay reports success while
					// the app runs stale code.
					reimportFailures++;
					console.warn('[hmr][queue] re-import FAILED for', id, '-', (e as any)?.message ?? e);
				}
			}
			if (reimportFailures > 0) {
				console.warn(`[hmr][queue] ${reimportFailures}/${drained.length} module(s) failed to re-import; the applied update may be incomplete.`);
			}
			// After evaluating the batch, perform the flavor-specific UI refresh
			// through the strategy seam: Vue propagates non-SFC dep changes to the
			// nearest `.vue` boundary and remounts it; Solid re-imports component
			// boundaries + patches TanStack routes and emits its completion hook;
			// TypeScript re-registers raw assets and navigates/re-presents modals;
			// React only completes the overlay. `graph`/`performResetRoot`/
			// `getOverlay` are the shared capabilities those strategies need.
			await strategy?.refreshAfterBatch?.(drained, { setUpdateOverlayStage, startedAt: tQueueStart, graph, performResetRoot, getOverlay: getHmrOverlayApi });
		} finally {
			processingQueue = false;
			processingPromise = null;
			// If a delta arrived mid-cycle (pushed onto changedQueue while
			// processingQueue was still true, so its processQueue() call early-
			// returned), re-drain — otherwise that save is stranded until the next
			// delta. Deferred via setTimeout to avoid synchronous re-entrancy as
			// this promise settles.
			if (changedQueue.length) {
				setTimeout(() => {
					try {
						processQueue();
					} catch {}
				}, 0);
			}
		}
	})();
	return processingPromise;
}

/**
 * Full-graph resync fallback: the server chose to broadcast a fresh graph
 * instead of a delta (reconnect, version drift). Infer which modules changed
 * by hash-diffing against the previous snapshot and evict + re-import them —
 * same V8-cache pitfall as `processQueue`, same eviction-first ordering.
 * Without re-import, HTTP ESM caching means module bodies (and side effects)
 * won't re-run.
 */
export async function reimportInferredFullGraphChanges(prevGraph: Map<string, { id: string; deps: string[]; hash: string }>): Promise<void> {
	try {
		const inferredChanged: string[] = [];
		try {
			for (const [id, next] of graph.entries()) {
				const prev = prevGraph.get(id);
				if (!prev || prev.hash !== next.hash) inferredChanged.push(id);
			}
			// Removed modules are also "changed" but we don't import them.
		} catch {}
		// Best-effort: only re-import real source modules (avoid .vue registry pipeline and virtual ids)
		const toReimport = inferredChanged.filter((id) => {
			if (!id || typeof id !== 'string') return false;
			if (/^\0|^\/\0/.test(id)) return false;
			if (/plugin-vue:export-helper/.test(id)) return false;
			if (/\.vue$/i.test(id)) return false;
			if (id.endsWith(APP_MAIN_ENTRY_SPEC)) return false;
			return true;
		});
		if (toReimport.length && VERBOSE) console.log('[hmr][full-graph] inferred changed modules; re-importing', toReimport);
		// Evict the inferred changed set before re-importing.
		// See `processQueue` for the architectural rationale; the
		// full-graph code path is the resync fallback (server chose
		// not to send a delta) and shares the same V8 cache pitfall.
		const fgEvictUrls = buildEvictionUrls(toReimport);
		const fgEvicted = invalidateModulesByUrls(fgEvictUrls);
		if (VERBOSE) console.log(`[hmr][full-graph] eviction count=${fgEvictUrls.length} ok=${fgEvicted}`);
		for (const id of toReimport) {
			try {
				const spec = normalizeSpec(id);
				const url = await requestModuleFromServer(spec);
				if (!url) continue;
				if (VERBOSE) console.log('[hmr][full-graph] re-import', { id, spec, url });
				await import(/* @vite-ignore */ url);
			} catch (e) {
				if (VERBOSE) console.warn('[hmr][full-graph] re-import failed for', id, e);
			}
		}
	} catch {}
}
