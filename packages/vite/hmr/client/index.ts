/**
 * Robust HMR client for NativeScript.
 *
 * Avoid importing from '@nativescript/core' and other framework modules here to prevent creating a second module realm via HTTP ESM.
 * Always resolve core classes and Application from the vendor realm or globalThis at runtime.
 * The HMR client is evaluated via HTTP ESM on device; static imports would create secondary instances.
 */

import { setHMRWsUrl, getHMRWsUrl, pendingModuleFetches, deriveHttpOrigin, setHttpOriginForVite, moduleFetchCache, requestModuleFromServer, getHttpOriginForVite, normalizeSpec, hmrMetrics, graph, setGraphVersion, getGraphVersion, getCurrentApp, getRootFrame, setCurrentApp, setRootFrame, getCore, hasExplicitEviction, invalidateModulesByUrls, buildEvictionUrls, emitHmrModeBannerOnce, ENV_VERBOSE } from './utils.js';
import { applyCssText, handleCssUpdates } from './css-handler.js';
import { buildCssApplyingDetail, buildCssAppliedDetail } from './css-update-overlay.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';
import { markDevBootComplete } from '../shared/runtime/boot-complete.js';
import { getNsHotRegistry } from './hot-context.js';

const VERBOSE = ENV_VERBOSE;

function resolveTargetFlavor(): string | undefined {
	try {
		if (typeof __NS_TARGET_FLAVOR__ !== 'undefined' && __NS_TARGET_FLAVOR__) {
			return __NS_TARGET_FLAVOR__;
		}
	} catch {}
	try {
		const g: any = getGlobalScope();
		if (typeof g.__NS_TARGET_FLAVOR__ === 'string' && g.__NS_TARGET_FLAVOR__) {
			return g.__NS_TARGET_FLAVOR__;
		}
		if (typeof g.__NS_HMR_BROWSER_RUNTIME_TARGET_FLAVOR__ === 'string' && g.__NS_HMR_BROWSER_RUNTIME_TARGET_FLAVOR__) {
			return g.__NS_HMR_BROWSER_RUNTIME_TARGET_FLAVOR__;
		}
		if (typeof g.__reboot_ng_modules__ === 'function') {
			return 'angular';
		}
		if (g.__VUE_HMR_RUNTIME__ || g.__NS_HMR_VUE_SFC_REGISTRY__) {
			return 'vue';
		}
	} catch {}
	return undefined;
}

const TARGET_FLAVOR = resolveTargetFlavor();

// React reuses the generic TypeScript HMR path on BOTH server and client: it has
// no Fast Refresh, so a module edit drives a plain module reload / root reset
// (the React tree re-renders), exactly like the `typescript` flavor. The server
// strategy is `{ ...typescriptServerStrategy, flavor: 'react' }`; this mirrors that
// on the client so the `typescript`-gated update branches also run for React
// (otherwise a React edit is received but never applied — the overlay sticks).
const TS_LIKE_FLAVOR = TARGET_FLAVOR === 'typescript' || TARGET_FLAVOR === 'react';

try {
	if (TARGET_FLAVOR && !globalThis.__NS_TARGET_FLAVOR__) {
		globalThis.__NS_TARGET_FLAVOR__ = TARGET_FLAVOR;
	}
} catch {}

// Define substitution does NOT reach this file (served raw from node_modules),
// so prefer the globalThis seed planted by the entry's defines-seed module —
// the '/src' literal is a last-resort default and is WRONG for 'app/'-rooted
// projects.
const APP_ROOT_VIRTUAL = (typeof __NS_APP_ROOT_VIRTUAL__ === 'string' && __NS_APP_ROOT_VIRTUAL__) || (typeof getGlobalScope().__NS_APP_ROOT_VIRTUAL__ === 'string' && getGlobalScope().__NS_APP_ROOT_VIRTUAL__) || '/src';
const APP_VIRTUAL_WITH_SLASH = APP_ROOT_VIRTUAL.endsWith('/') ? APP_ROOT_VIRTUAL : `${APP_ROOT_VIRTUAL}/`;
const APP_MAIN_ENTRY_SPEC = `${APP_VIRTUAL_WITH_SLASH}app.ts`;

// Policy: by default, let the app's own main entry mount initially; HMR client handles updates/remounts only.
// Flip this to true via global __NS_HMR_ALLOW_INITIAL_MOUNT__ if you need the client to perform the first mount.
const ALLOW_INITIAL_MOUNT: boolean = !!globalThis.__NS_HMR_ALLOW_INITIAL_MOUNT__;

// Ensure core aliases are present on globalThis early so that /ns/rt exports resolve to functions
// before any SFCs are evaluated during HTTP-only dev boot.
function ensureCoreAliasesOnGlobalThis() {
	const g = globalThis;
	try {
		const F = getCore('Frame') || g.Frame;
		const A = getCore('Application') || g.Application;
		const P = getCore('Page') || g.Page;
		// Publish to globalThis if missing
		try {
			if (F && !g.Frame) g.Frame = F;
		} catch {}
		try {
			if (A && (!g.Application || typeof g.Application.run !== 'function' || typeof g.Application.on !== 'function' || typeof g.Application.resetRootView !== 'function')) {
				g.Application = A;
			}
		} catch {}
		try {
			if (P && !g.Page) g.Page = P;
		} catch {}
	} catch {}
}
// Apply once on module evaluation
ensureCoreAliasesOnGlobalThis();

// Install the device CSS applier. CSS-bearing modules (a Vue SFC `<style>` via
// `/ns/asm`, an imported `.css` via `/ns/m`) call `__NS_REGISTER_CSS__(tag, css)`,
// or queue in `__NS_PENDING_CSS__` if they ran first; the drain below covers that.
// Routes through the shared `applyCssText` (tagged remove+add + root restyle),
// the same path app.css and live `.css` edits use.
function installCssRegister(): void {
	const g: any = getGlobalScope();
	if (typeof g.__NS_REGISTER_CSS__ === 'function') {
		return;
	}
	const apply = (tag: string, cssText: string) => {
		if (typeof cssText !== 'string' || !cssText.length) {
			return;
		}
		try {
			applyCssText(cssText, tag);
		} catch (cssErr: any) {
			if (VERBOSE) console.warn('[ns-hmr] CSS register/apply failed for', tag, cssErr?.message || cssErr);
		}
	};
	g.__NS_REGISTER_CSS__ = apply;
	try {
		const pending = g.__NS_PENDING_CSS__;
		if (pending && typeof pending === 'object') {
			for (const tag of Object.keys(pending)) {
				apply(tag, pending[tag]);
			}
			g.__NS_PENDING_CSS__ = null;
		}
	} catch {}
}
installCssRegister();

type HmrConnectionOverlayStage = 'connecting' | 'reconnecting' | 'synchronizing' | 'offline';

function getHmrOverlayApi(): any {
	try {
		return globalThis.__NS_HMR_DEV_OVERLAY__ || null;
	} catch {}
	return null;
}

function setConnectionOverlayStage(stage: HmrConnectionOverlayStage, detail?: string) {
	try {
		const api = getHmrOverlayApi();
		if (api && typeof api.setConnectionStage === 'function') {
			api.setConnectionStage(stage, { detail });
		}
	} catch {}
}

function hideConnectionOverlay() {
	try {
		const api = getHmrOverlayApi();
		if (api && typeof api.hide === 'function') {
			api.hide('healthy');
		}
	} catch {}
}

// Update-stage overlay driver for the generic processQueue path
// (Solid + TypeScript flavors). The Angular client drives the overlay
// itself via `frameworks/angular/client/index.ts` because Angular HMR
// goes through `handleAngularHotUpdateMessage` instead of processQueue.
// For Solid the `ns:hmr-pending` handler shows 'received', then this
// helper walks through 'evicting' → 'reimporting' → 'complete' so the
// applying overlay actually finishes and auto-hides.
//
// Soft-fails (no-op) when the overlay was never installed.
type HmrUpdateOverlayStage = 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete';
function setUpdateOverlayStage(stage: HmrUpdateOverlayStage, info?: { detail?: string; progress?: number | null }) {
	try {
		const api = getHmrOverlayApi();
		if (api && typeof api.setUpdateStage === 'function') {
			api.setUpdateStage(stage, info);
		}
	} catch {}
}

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

try {
	const g: any = getGlobalScope();
	g.__ns_solid_hmr_subscribe = nsSolidHmrSubscribe;
	// Eagerly create the listener set so the global exists at module load time.
	getNsSolidHmrListenerSet();
	if (VERBOSE) console.log('[hmr][solid] HMR client loaded. global set=', typeof g.__ns_solid_hmr_subscribe, 'listenerSet=', typeof g.__ns_solid_hmr_listener_set);
} catch (err) {
	console.warn('[hmr][solid] could not install global __ns_solid_hmr_subscribe', err);
}

// Eagerly drive the HMR-applying overlay's 'received' frame as soon
// as the server emits `ns:hmr-pending`, BEFORE the framework-specific
// (`ns:angular-update` / `ns:css-updates`) payload arrives. The
// flavor-specific handler later walks through 'evicting' →
// 'reimporting' → 'rebooting' → 'complete'. Calling 'received' twice
// in the same cycle is safe: the overlay preserves
// `updateCycleStartedAt` when a 'received' frame replaces an existing
// 'received' frame so the minimum-visible window is still timed
// against the FIRST frame.
//
// Soft-fails when the overlay isn't installed (production builds,
// vitest, etc.) or when the user opted out via
// `__NS_HMR_PROGRESS_OVERLAY_ENABLED__ === false`.
import { applyHmrPendingFrame } from './hmr-pending-overlay.js';

function setHmrPendingOverlay(filePath: string) {
	applyHmrPendingFrame(filePath, { getOverlay: getHmrOverlayApi });
}

let connectionOverlayTimer: any = null;
let connectionOverlayVisible = false;
let hasOpenedHmrSocket = false;
let awaitingHealthyHmrMessage = false;
let pendingConnectionOverlayStage: HmrConnectionOverlayStage = 'connecting';
let pendingConnectionOverlayDetail = '';
// The stage currently PAINTED on screen (set only when we actually show
// the overlay, not when we merely schedule it). Used to suppress the
// sub-perceptible offline↔reconnecting flicker during the reconnect
// retry loop — see the deferral in `connectHmr`/`tryNext`.
let shownConnectionOverlayStage: HmrConnectionOverlayStage | null = null;

// While the terminal 'offline' frame is showing, a fresh reconnect
// attempt that is refused near-instantly (the norm when the dev server
// is down — especially on the Android emulator, where connection-refused
// returns in ~1ms) would flip the overlay to 'reconnecting' and straight
// back to 'offline', producing a jarring 1-frame flicker. We defer the
// 'reconnecting' frame by this much so an instant failure (→ back to
// 'offline') or a success (→ 'synchronizing') cancels it before it ever
// paints; only a genuinely in-flight attempt surfaces 'reconnecting'.
// On iOS real connect attempts exceed this threshold, so the behaviour
// there is unchanged.
const RECONNECTING_OVER_OFFLINE_DELAY_MS = 500;

function clearConnectionOverlayTimer() {
	if (connectionOverlayTimer) {
		clearTimeout(connectionOverlayTimer);
		connectionOverlayTimer = null;
	}
}

function showConnectionOverlayNow(stage: HmrConnectionOverlayStage, detail?: string) {
	// Painting a stage now supersedes any scheduled (deferred) stage, so
	// cancel the pending timer — otherwise a deferred 'reconnecting' could
	// fire moments after we settle back on 'offline' and revive the flicker.
	clearConnectionOverlayTimer();
	pendingConnectionOverlayStage = stage;
	pendingConnectionOverlayDetail = detail || '';
	connectionOverlayVisible = true;
	shownConnectionOverlayStage = stage;
	setConnectionOverlayStage(stage, detail);
}

function scheduleConnectionOverlay(stage: HmrConnectionOverlayStage, detail?: string, delayMs = 1200) {
	pendingConnectionOverlayStage = stage;
	pendingConnectionOverlayDetail = detail || '';
	clearConnectionOverlayTimer();
	connectionOverlayTimer = setTimeout(() => {
		showConnectionOverlayNow(pendingConnectionOverlayStage, pendingConnectionOverlayDetail);
	}, delayMs);
}

function updateConnectionOverlay(stage: HmrConnectionOverlayStage, detail?: string) {
	pendingConnectionOverlayStage = stage;
	pendingConnectionOverlayDetail = detail || '';
	if (connectionOverlayVisible) {
		showConnectionOverlayNow(stage, detail);
	}
}

function markHmrConnectionHealthy() {
	awaitingHealthyHmrMessage = false;
	clearConnectionOverlayTimer();
	shownConnectionOverlayStage = null;
	if (connectionOverlayVisible) {
		connectionOverlayVisible = false;
		hideConnectionOverlay();
	}
}

/**
 * Flavor hooks
 *
 * The shared client talks to frameworks only through the client-strategy seam
 * (`framework-client-strategy.ts`). The strategy is loaded by ONE dynamic
 * per-flavor `import()` so a device only ever fetches its OWN framework's client
 * module — a Vue app never fetches the Angular client, and vice versa. Solid and
 * TypeScript have no client module, so `CLIENT_STRATEGY` stays `undefined` and
 * the shared paths below run exactly as before.
 *
 * The load is async (one HTTP-ESM fetch on device), so `CLIENT_STRATEGY_READY`
 * is awaited at the top of `handleHmrMessage` before any message is processed —
 * every strategy call site downstream of message processing therefore observes a
 * fully-installed strategy. `install()` itself is best-effort (idempotent dev
 * shims) and not boot-critical, so resolving it slightly after module load is
 * safe.
 */
import type { FrameworkClientStrategy } from './framework-client-strategy.js';

let CLIENT_STRATEGY: FrameworkClientStrategy | undefined;
const CLIENT_STRATEGY_READY: Promise<void> =
	TARGET_FLAVOR === 'vue' || TARGET_FLAVOR === 'angular'
		? import(`../frameworks/${TARGET_FLAVOR}/client/strategy.js`)
				.then((mod: any) => {
					CLIENT_STRATEGY = mod && mod[`${TARGET_FLAVOR}ClientStrategy`];
					if (VERBOSE) console.log('[hmr-client] client strategy loaded for flavor:', TARGET_FLAVOR);
					CLIENT_STRATEGY?.install();
				})
				.catch((err) => {
					console.warn('[hmr-client] failed to load client strategy for', TARGET_FLAVOR, err);
				})
		: Promise.resolve();

// Track whether we've mounted an initial app root yet in HTTP-only boot
let initialMounted = !!globalThis.__NS_HMR_BOOT_COMPLETE__;
// Prevent duplicate initial-mount scheduling across rapid full-graph broadcasts and re-evaluations
let initialMounting = !!globalThis.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__;
// Track whether the first full-graph has been received. Before the full-graph,
// delta messages are just the server discovering modules during initial boot —
// NOT actual code changes. Re-imports must be gated behind this flag.
let hasReceivedFullGraph = false;
// TypeScript flavor: track registry modules and inferred main id
let tsModuleSet: Set<string> | null = null;
let tsMainId: string | null = null;
const changedQueue: any[] = [];
let processingQueue = false;
let processingPromise: Promise<void> | null = null;

// Detect whether the early placeholder root is still active on screen
function isPlaceholderActive(): boolean {
	try {
		const g: any = getGlobalScope();
		if (g.__NS_DEV_PLACEHOLDER_ROOT_VIEW__) return true;
		if (g.__NS_DEV_PLACEHOLDER_ROOT_EARLY__) return true;
	} catch {}
	return false;
}

// Navigation queue removed: we navigate immediately or throw with a clear error
// Robust navigation fallback: create a sub-app and mount it on a new Page, then navigate there.
// __nsNavigateWithSubApp removed: no navigation fallbacks are used
function applyFullGraph(payload: any) {
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
					// Flavor-specific rescue handling
					if (TS_LIKE_FLAVOR) {
						// For TS apps, perform a one-time resetRootView to the conventional
						// app root module. This mimics what Application.run would do and
						// replaces the placeholder with the real UI without trying to
						// treat app.ts as a component.
						try {
							const App = getCore('Application') || g.Application;
							if (App && typeof App.resetRootView === 'function') {
								if (VERBOSE) console.log('[hmr][init] TS flavor: performing rescue resetRootView to moduleName=app-root');
								initialMounting = true;
								try {
									g.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = true;
								} catch {}
								App.resetRootView({ moduleName: 'app-root' } as any);
								initialMounted = true;
								markDevBootComplete();
								if (VERBOSE) console.log('[hmr][init] TS rescue resetRootView complete');
							} else if (VERBOSE) {
								console.warn('[hmr][init] TS flavor: Application.resetRootView unavailable; cannot perform rescue');
							}
						} catch (e) {
							console.warn('[hmr][init] TS rescue resetRootView failed', e);
						} finally {
							initialMounting = false;
							try {
								g.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = false;
							} catch {}
						}
						return;
					}
					const candidate = CLIENT_STRATEGY?.selectMountCandidate?.({ graph, appMainEntrySpec: APP_MAIN_ENTRY_SPEC }) ?? null;
					if (!candidate) return;
					initialMounting = true;
					try {
						g.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = true;
					} catch {}
					(async () => {
						try {
							let comp: any = null;
							if (CLIENT_STRATEGY?.loadComponentForMount) {
								comp = await CLIENT_STRATEGY.loadComponentForMount(candidate!, 'initial_mount_rescue');
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
	// On first full graph, if we have not mounted yet, attempt an initial mount
	// by choosing a likely root component for the active flavor and performing a resetRootView with it.
	try {
		// Short-circuit if boot is complete or an initial mount is already underway (across realms/evals)
		const bootDone = !!globalThis.__NS_HMR_BOOT_COMPLETE__;
		const bootInProgress = !!globalThis.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ || initialMounting;
		// Only allow initial mount when explicitly enabled. Rely on the app's own main entry start() for the first mount
		// to avoid double-mount races that can cause duplicate navigation logs.
		if (ALLOW_INITIAL_MOUNT && !initialMounted && !bootDone && !bootInProgress && !getCurrentApp() && !getRootFrame()) {
			if (TS_LIKE_FLAVOR) {
				// For TS flavor, do not perform client-driven initial mount; rely on Application.run.
				return;
			}
			const candidate: string | null = CLIENT_STRATEGY?.selectMountCandidate?.({ graph, appMainEntrySpec: APP_MAIN_ENTRY_SPEC }) ?? null;
			if (candidate) {
				// Mark initial-mount in progress (both module-local and global) BEFORE scheduling async work
				initialMounting = true;
				try {
					globalThis.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = true;
				} catch {}
				(async () => {
					try {
						if (VERBOSE) console.log('[hmr][init] mounting initial root from', candidate, 'flavor=', TARGET_FLAVOR);
						// Android-only: avoid racing entry-runtime reset and Activity bring-up
						try {
							const g: any = getGlobalScope();
							const App = getCore('Application') || g.Application;
							const isAndroid = !!(App && (App as any).android !== undefined);
							if (isAndroid) {
								const ready = async (ms = 8000, step = 60) => {
									const start = Date.now();
									const ok = () => {
										try {
											const a = (App as any).android;
											const act = a && (a.foregroundActivity || a.startActivity);
											const inProg = !!g.__NS_DEV_RESET_IN_PROGRESS__;
											return !!act && !inProg;
										} catch {
											return false;
										}
									};
									while (Date.now() - start < ms) {
										if (ok()) return true;
										await new Promise((r) => setTimeout(r, step));
									}
									return ok();
								};
								const ok = await ready(8000, 60);
								if (!ok && VERBOSE) console.warn('[hmr][init] proceeding without explicit boot-ready signal (timeout)');
							}
						} catch {}
						let comp: any = null;
						if (TS_LIKE_FLAVOR) {
							try {
								const url = await requestModuleFromServer(candidate!);
								const mod: any = await import(/* @vite-ignore */ url);
								comp = mod && (mod.default || mod);
							} catch (e) {
								if (VERBOSE) console.warn('[hmr][init] TS initial mount failed to import', candidate, e);
							}
						} else if (CLIENT_STRATEGY?.loadComponentForMount) {
							comp = await CLIENT_STRATEGY.loadComponentForMount(candidate!, 'initial_mount');
						}
						if (comp) {
							const ok = await performResetRoot(comp);
							if (ok) {
								initialMounted = true;
								markDevBootComplete();
								if (VERBOSE) console.log('[hmr][init] initial mount complete');
							} else if (VERBOSE) {
								console.warn('[hmr][init] initial mount did not verify; will rely on subsequent retries');
							}
						} else if (VERBOSE) {
							console.warn('[hmr][init] failed to load initial component from', candidate);
						}
					} catch (e) {
						console.warn('[hmr][init] initial mount error', e);
					} finally {
						// Clear in-progress flag regardless of outcome to allow future retries if needed
						initialMounting = false;
						try {
							globalThis.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = false;
						} catch {}
					}
				})();
			} else if (VERBOSE) {
				console.warn('[hmr][init] no component found in graph to mount initially for flavor', TARGET_FLAVOR);
			}
		}
	} catch {}
}

function applyDelta(payload: any) {
	// If versions are out of sync, request a full graph resync, but still
	// opportunistically queue the changed ids so the client can react once
	// the resync arrives. This is especially important for simple TS flavors
	// where we only need a signal that "something changed" to trigger a
	// resetRootView-driven hot update.
	const currentVersion = getGraphVersion();
	const versionMatches = payload.baseVersion === currentVersion;
	if (!versionMatches) {
		if (VERBOSE) console.warn('[hmr][graph] version mismatch requesting resync', payload.baseVersion, currentVersion);
		try {
			hmrSocket?.send(JSON.stringify({ type: 'ns:hmr-resync-request' }));
		} catch {}
	}
	if (versionMatches) {
		setGraphVersion(payload.newVersion);
	}

	const changed = payload.changed || [];
	CLIENT_STRATEGY?.recordPayloadChanges?.(changed, getGraphVersion());

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
			// We now rely on SFC registry update events to trigger root resets for .vue files directly
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

// Deterministic navigation using the current Vue app instance rather than vendor-held rootApp.
function __nsNavigateUsingApp(comp: any, opts: any = {}) {
	const g = getGlobalScope();
	CLIENT_STRATEGY?.beforeNavigateBuild?.();
	const AppFactory = g.createApp;
	const RootCtor = g.NSVRoot;
	if (typeof AppFactory !== 'function' || typeof RootCtor !== 'function') {
		throw new Error('Vue runtime not initialized');
	}
	try {
		const top = (g.Frame && g.Frame.topmost && g.Frame.topmost()) || null;
		const ctor = top && top.constructor && top.constructor.name;
		if (VERBOSE)
			console.log('[app-nav] begin', {
				hmrRealm: g.__NS_HMR_REALM__ || 'unknown',
				rtRealm: g.__NS_RT_REALM__ || 'unknown',
				topCtor: ctor,
				hasTop: !!top,
			});
	} catch {}
	// Build a fresh Page each time the factory is invoked to avoid reusing a Page instance
	// across fragment recreations (Android) or multiple frame attachments.
	const buildTarget = () => {
		const existingApp = getCurrentApp();
		const baseProvides = (existingApp && existingApp._context && existingApp._context.provides) || {};
		// Forward `opts.props` as Vue's rootProps so `$navigateTo(Comp, { props: { … } })`
		// reaches the destination component. nativescript-vue's stock `$navigateTo`
		// does the same via `createNativeView(target, options?.props, …)` →
		// `renderer.createApp(component, props)`. Dropping props here would surface
		// at the destination as `[Vue warn]: Missing required prop` and any
		// required-prop component would render with `undefined` bindings.
		const app = AppFactory(normalizeComponent(comp, comp && (comp.__name || comp.name)), opts && (opts as any).props);
		CLIENT_STRATEGY?.onNavAppCreated?.(app);
		try {
			const registry: Map<string, any> | undefined = g.__nsVendorRegistry;
			const req: any = registry?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
			let rh: any = null;
			if (registry && registry.has('nativescript-vue/dist/runtimeHelpers')) rh = registry.get('nativescript-vue/dist/runtimeHelpers');
			if (!rh && typeof req === 'function') {
				try {
					rh = req('nativescript-vue/dist/runtimeHelpers');
				} catch {}
			}
			const setRootApp = rh && (rh.setRootApp || rh.default?.setRootApp);
			if (typeof setRootApp === 'function') setRootApp(app);
		} catch {}
		try {
			const ctx = app?._context;
			if (ctx) {
				const prov = (ctx.provides ||= {});
				Object.getOwnPropertyNames(baseProvides).forEach((k) => {
					if (!Object.prototype.hasOwnProperty.call(prov, k)) prov[k] = baseProvides[k];
				});
				Object.getOwnPropertySymbols(baseProvides).forEach((s) => {
					if (!Object.prototype.hasOwnProperty.call(prov, s)) prov[s] = (baseProvides as any)[s];
				});
			}
		} catch {}
		const root = new RootCtor();
		const vm = typeof (app as any).runWithContext === 'function' ? (app as any).runWithContext(() => (app as any).mount(root) as any) : ((app as any).mount(root) as any);
		setCurrentApp(app);
		const el = vm?.$el;
		const nativeView = el?.nativeView;
		if (!nativeView) throw new Error('navigation mount did not yield a nativeView');
		const P = getCore('Page');
		const ctorName = String(nativeView?.constructor?.name || '').replace(/^_+/, '');
		if (ctorName === 'Page' || /^Page(\$\d+)?$/.test(ctorName)) {
			return nativeView;
		}
		if (typeof P === 'function') {
			const pg = new (P as any)();
			(pg as any).content = nativeView;
			// Hide default ActionBar for wrapped views to avoid double bars
			try {
				(pg as any).actionBarHidden = true;
			} catch {}
			return pg;
		}
		return nativeView; // fallback
	};
	let frame = opts && (opts as any).frame ? (opts as any).frame : getRootFrame();
	if (!frame) {
		const F = getCore('Frame');
		frame = F && typeof F.topmost === 'function' ? (F.topmost() as any) : null;
	}
	if (!frame) {
		const GApp = getCore('Application') || (g as any).Application;
		const F = getCore('Frame');
		if (typeof GApp?.resetRootView === 'function' && typeof F === 'function') {
			GApp.resetRootView({
				create: () => {
					const fr = new (F as any)();
					const navEntry = {
						create: () => buildTarget(),
						clearHistory: true,
						animated: false,
					} as any;
					try {
						(fr as any).navigate(navEntry);
					} catch {}
					setRootFrame(fr);
					return fr;
				},
			} as any);
			return undefined;
		}
		throw new Error('Application.resetRootView unavailable');
	}
	const navEntry = { create: () => buildTarget(), ...(opts || {}) } as any;
	(frame as any).navigate(navEntry);
	return undefined;
}

// Expose deterministic app navigation globally so /ns/rt can guarantee single-path navigation
try {
	globalThis.__nsNavigateUsingApp = __nsNavigateUsingApp;
} catch {}

// ── Open-modal tracking for XML-flavor HMR ──────────────────────────────────
// The typescript flavor's queue closes + re-presents a modal whose XML or
// code-behind changed, instead of wrongly navigating the top frame to the
// modal's page (or worse, resetting the root and losing the modal).
//
// Source of truth is core's live modal stack — `_moduleName` (set by the
// Builder on every createViewFromEntry view) and `_modalOptions` (stored by
// newer cores' `_showNativeModalView`). The View.prototype.showModal wrap
// below is a LEGACY FALLBACK for cores that don't store `_modalOptions` yet;
// delete it (and `openModalRecords`) once the minimum supported core does.
type OpenModalRecord = { moduleName: string; options: any; parent: any; modal: any };
const openModalRecords: OpenModalRecord[] = [];
let modalTrackingInstalled = false;

/**
 * Map a served/graph module id (e.g. `/app/modal-page.xml`) to its app-root
 * relative path (`modal-page.xml`). Single mapping point — the raw-asset
 * re-registration, page-navigation targets, and modal matching all derive
 * from this; keep them in sync by construction.
 */
function toAppRelativePath(id: string): string | null {
	try {
		const spec = normalizeSpec(id);
		const appVirtual = APP_VIRTUAL_WITH_SLASH.replace(/^\//, '');
		let relPath = spec.startsWith('/') ? spec.slice(1) : spec;
		if (relPath.startsWith(appVirtual)) relPath = relPath.slice(appVirtual.length);
		return relPath || null;
	} catch {
		return null;
	}
}

/** App-root relative module name (no extension) for page-shaped files, else null. */
function toAppModuleName(id: string): string | null {
	const relPath = toAppRelativePath(id);
	if (!relPath || !/\.(xml|ts|js)$/i.test(relPath)) return null;
	return relPath.replace(/\.(xml|ts|js)$/i, '');
}

function ensureModalTracking(): void {
	if (modalTrackingInstalled) return;
	try {
		const View: any = getCore('View') || getGlobalScope().View;
		const proto = View?.prototype;
		if (!proto || typeof proto.showModal !== 'function') return;
		const orig = proto.showModal;
		if (orig.__nsHmrModalTracked) {
			modalTrackingInstalled = true;
			return;
		}
		const wrapped = function (this: any, ...args: any[]) {
			const result = orig.apply(this, args);
			try {
				if (typeof args[0] === 'string' && result) {
					// Mirror core's getModalOptions arg shapes: (moduleName, options)
					// or the deprecated positional form.
					const options = args.length === 2 && args[1] && typeof args[1] === 'object' ? args[1] : { context: args[1], closeCallback: args[2], fullscreen: args[3], animated: args[4], stretched: args[5] };
					const moduleName = String(args[0])
						.replace(/^\.\//, '')
						.replace(/\.(xml|ts|js)$/i, '');
					openModalRecords.push({ moduleName, options, parent: this, modal: result });
					if (VERBOSE) console.log('[hmr][modal] tracked open modal', moduleName);
				}
			} catch {}
			return result;
		};
		(wrapped as any).__nsHmrModalTracked = true;
		proto.showModal = wrapped;
		modalTrackingInstalled = true;
	} catch (e) {
		if (VERBOSE) console.warn('[hmr][modal] tracking install failed', e);
	}
}

/**
 * Enumerate the modals that are currently presented AND were opened by module
 * name, with everything needed to re-present them.
 *
 * Source of truth is core's live modal stack (`_getRootModalViews()`):
 *   - `modal._moduleName` — set by the Builder on every createViewFromEntry
 *     view (longstanding, used by livesync), so available on any core.
 *   - `modal._modalOptions` — the original ShowModalOptions, stored by core's
 *     `_showNativeModalView` (newer cores). For older cores the showModal
 *     wrap's records (see ensureModalTracking) fill the gap.
 *   - `modal._modalParent` — the presenting view.
 * Stale wrap records are pruned against the live stack while we're here.
 */
function getOpenStringModuleModals(): OpenModalRecord[] {
	const out: OpenModalRecord[] = [];
	try {
		const App: any = getCore('Application');
		const root = App?.getRootView?.() || (App as any)?._rootView;
		const stack: any[] = root?._getRootModalViews?.() || [];
		// Prune wrap records whose modal is gone (keeps the fallback list small).
		for (let i = openModalRecords.length - 1; i >= 0; i--) {
			if (!stack.includes(openModalRecords[i].modal)) {
				openModalRecords.splice(i, 1);
			}
		}
		for (const modal of stack) {
			const record = openModalRecords.find((r) => r.modal === modal);
			const rawModuleName = typeof modal?._moduleName === 'string' && modal._moduleName ? modal._moduleName : record?.moduleName;
			const parent = modal?._modalParent || record?.parent;
			const options = modal?._modalOptions || record?.options;
			if (!rawModuleName || !parent) continue;
			const moduleName = String(rawModuleName)
				.replace(/^\.\//, '')
				.replace(/\.(xml|ts|js)$/i, '');
			out.push({ moduleName, options, parent, modal });
		}
	} catch (e) {
		if (VERBOSE) console.warn('[hmr][modal] open-modal enumeration failed', e);
	}
	return out;
}

/**
 * Close and re-present an open modal so it rebuilds from the freshly
 * re-registered XML/code-behind. Core clears the modal stack synchronously on
 * close but the NATIVE dismissal completes asynchronously; iOS refuses a
 * present while a dismissal is in flight. Newer cores fire `closedModally` on
 * the modal at exactly that completion point — preferred signal. Older cores
 * fall back to polling `isLoaded` (flipped by `_tearDownUI` in the same
 * completion callback).
 */
async function reshowOpenModal(record: OpenModalRecord): Promise<void> {
	const { parent, modal, moduleName, options } = record;
	await new Promise<void>((resolve) => {
		let settled = false;
		const finish = () => {
			if (!settled) {
				settled = true;
				resolve();
			}
		};
		let eventArmed = false;
		try {
			if (typeof modal.once === 'function') {
				modal.once('closedModally', finish);
				eventArmed = true;
			}
		} catch {}
		// Poll fallback (also the safety net if the event never fires —
		// e.g. an interactive-dismiss cancellation).
		const deadline = Date.now() + 2000;
		const poll = () => {
			if (settled) return;
			let stillLoaded = false;
			try {
				stillLoaded = !!modal.isLoaded;
			} catch {}
			if ((!eventArmed && !stillLoaded) || Date.now() > deadline) {
				finish();
				return;
			}
			setTimeout(poll, 50);
		};
		setTimeout(poll, 50);
		try {
			modal.closeModal();
		} catch (e) {
			if (VERBOSE) console.warn('[hmr][modal] close failed for', moduleName, e);
			finish();
		}
	});
	// One settle beat so the platform finishes releasing the presentation
	// before the new present begins.
	await new Promise((resolve) => setTimeout(resolve, 100));
	try {
		parent.showModal(moduleName, { ...(options || {}), animated: false });
		if (VERBOSE) console.log('[hmr][modal] re-presented', moduleName);
	} catch (e) {
		console.warn('[hmr][modal] re-present failed for', moduleName, e);
	}
}

async function processQueue(): Promise<void> {
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

			// Track wall-clock so the 'complete' frame can show a meaningful
			// total. Only the Solid + TypeScript flavors drive the overlay
			// from here; Angular has its own flow inside
			// `frameworks/angular/client/index.ts`.
			const tQueueStart = Date.now();
			const driveSolidOverlay = TARGET_FLAVOR === 'solid';

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
			if (driveSolidOverlay) {
				setUpdateOverlayStage('evicting', {
					detail: drained.length === 1 ? `Invalidating ${drained[0]}` : `Invalidating ${drained.length} modules`,
				});
			}
			const evictUrls = buildEvictionUrls(drained);
			const evicted = invalidateModulesByUrls(evictUrls);
			if (VERBOSE) console.log(`[hmr][queue] eviction count=${evictUrls.length} ok=${evicted}`);

			// Evaluate changed modules best-effort; failures shouldn't completely break HMR.
			if (driveSolidOverlay) {
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
					// TS/XML flavor: refresh the bundler module registry with the fresh
					// exports so Builder.createViewFromEntry / loadModule('<page>')
					// resolves the NEW code-behind (tap handlers, page events) instead
					// of the stale module captured in the boot bundle. Without this,
					// XML re-renders pick up new markup but keep old behavior.
					if (TS_LIKE_FLAVOR && mod && /\.(ts|js)$/i.test(id)) {
						try {
							const g: any = getGlobalScope();
							const moduleName = toAppModuleName(id);
							if (moduleName && typeof g.registerModule === 'function') {
								g.registerModule(moduleName, () => mod);
								g.registerModule('./' + moduleName, () => mod);
								if (VERBOSE) console.log('[hmr][queue] re-registered code-behind', moduleName);
							}
						} catch (e) {
							if (VERBOSE) console.warn('[hmr][queue] code-behind re-register failed for', id, e);
						}
					}
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
			// After evaluating the batch, perform flavor-specific UI refresh.
			switch (TARGET_FLAVOR) {
				case 'vue':
					// graph + performResetRoot + getOverlay let the Vue strategy
					// propagate non-SFC dep changes to the nearest `.vue` boundary
					// and remount it (see `propagateDepChangeToSfcBoundary`).
					await CLIENT_STRATEGY?.refreshAfterBatch?.(drained, { setUpdateOverlayStage, startedAt: tQueueStart, graph, performResetRoot, getOverlay: getHmrOverlayApi });
					break;
				case 'react': {
					// React has no Fast Refresh, and (like Solid) mounts a dominative
					// document root via `startReactApp` rather than an `app-root`
					// module — so the TypeScript `resetRootView({moduleName:'app-root'})`
					// path doesn't apply. The changed modules were already re-imported
					// into the device cache above; the per-page remount is driven by the
					// app's `__NS_HMR_ON_UPDATE__` hook (see
					// `@nativescript/tanstack-router/react`'s `subscribeReactHmrRemount`),
					// which fires right after this queue drains. Here we only mark the
					// overlay complete so it doesn't stick at 'received' (5%).
					setUpdateOverlayStage('complete', {
						detail: `Total ${Math.max(0, Date.now() - tQueueStart)}ms`,
					});
					break;
				}
				case 'solid': {
					// Boundaries discovered in this HMR cycle (tsx files reachable
					// via the reverse import graph from any changed file, plus route
					// files reachable from any tsx start point). Declared at the top
					// of the case block so the emit step below can include the
					// complete set in the listener event — framework integrations
					// use it to map route boundaries → fresh component references.
					const boundaries = new Set<string>();
					// FULL reverse-import chain from every changed file up to the app
					// entry (all importers, transitively — not just tsx ones). Emitted
					// as `ev.ancestors` so app-level remount helpers can evict the
					// whole chain: re-importing only the root would resolve cached
					// intermediates and hand the fresh root a stale subtree.
					const ancestors = new Set<string>();
					// Solid .tsx components are self-accepting via solid-refresh's inline
					// patchRegistry — re-importing them is sufficient. For non-component
					// .ts utility modules, we must propagate up the import graph to find
					// the .tsx/.jsx component boundaries and re-import those so their
					// solid-refresh proxies pick up the new dependency values.
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
						const ROUTE_FILE_RE = /\/src\/routes\/.+\.(tsx|jsx)$/i;
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
					// Notify any framework integrations (e.g.
					// `@nativescript/tanstack-router`) that a Solid HMR
					// cycle has completed. They use this signal to perform
					// framework-specific UI refresh (e.g. remount the active
					// router page) when solid-refresh's own reactive
					// propagation does not reach the visible tree under
					// the current renderer/context configuration.
					//
					// Boundaries include both the directly-changed tsx files
					// AND every tsx ancestor reachable via the reverse import
					// graph (route files in particular). The framework
					// listener uses the route-file boundaries to look up the
					// freshly-patched `route.options.component` and pass it
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
					// Tell the overlay the cycle is done. solid-refresh's
					// inline patchRegistry has already flushed the new
					// component bodies into the live tree (the `case
					// 'solid'` block above re-imports each .tsx
					// boundary), so by the time we get here the user is
					// already looking at the new render. The 'complete'
					// frame surfaces the wall-clock total and triggers
					// the overlay's auto-hide.
					setUpdateOverlayStage('complete', {
						detail: `Total ${Math.max(0, Date.now() - tQueueStart)}ms`,
					});
					break;
				}
				case 'typescript': {
					// For TS apps, always reset back to the conventional app root.
					// This preserves the shell (Frame, ActionBar, etc.) that the app's
					// own bootstrapping wires up via `Application.run`.
					try {
						const g: any = getGlobalScope();
						const App = getCore('Application') || g.Application;
						if (!App || typeof App.resetRootView !== 'function') {
							if (VERBOSE) console.warn('[hmr][queue] TS flavor: Application.resetRootView unavailable; skipping UI refresh');
							break;
						}
						// Re-fetch changed XML/CSS files and update the bundled module registry
						// so Builder.createViewFromEntry picks up fresh content.
						const rawAssetIds = drained.filter((id) => /\.(xml|css|scss|sass|less)$/i.test(id));
						if (rawAssetIds.length && typeof g.registerModule === 'function') {
							const origin = getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
							if (origin) {
								for (const id of rawAssetIds) {
									try {
										const spec = normalizeSpec(id);
										// Fetch the raw file content directly from Vite's dev server.
										// Use the project-relative path which Vite serves as static files.
										const fetchUrl = origin + (spec.startsWith('/') ? spec : '/' + spec);
										if (VERBOSE) console.log('[hmr][queue] fetching raw asset', { id, fetchUrl });
										const resp = await fetch(fetchUrl);
										if (resp.ok) {
											const rawContent = await resp.text();
											// Register under all nickname variants the module registry uses.
											// The bundler context registers XML as e.g., './main-page.xml' and 'main-page.xml'
											const relPath = toAppRelativePath(id);
											if (!relPath) continue;
											const nicknames = ['./' + relPath, relPath];
											// Also add without extension for CSS
											const extIdx = relPath.lastIndexOf('.');
											if (extIdx > 0) {
												const baseName = relPath.slice(0, extIdx);
												if (!relPath.endsWith('.xml')) nicknames.push(baseName, './' + baseName);
											}
											for (const name of nicknames) {
												if (VERBOSE) console.log('[hmr][queue] re-registering module', name);
												g.registerModule(name, () => rawContent);
											}
										} else if (VERBOSE) {
											console.warn('[hmr][queue] raw asset fetch failed', id, resp.status);
										}
									} catch (e) {
										if (VERBOSE) console.warn('[hmr][queue] raw asset refresh failed for', id, e);
									}
								}
							}
						}
						// Modal-aware refresh: pages currently PRESENTED AS MODALS must be
						// closed + re-presented in place — navigating the top frame to a
						// modal's page would push it as a frame page, and resetRootView
						// would dismiss the modal entirely. State comes from core's live
						// modal stack (_moduleName/_modalOptions/_modalParent); the
						// showModal wrap only backfills options on older cores.
						ensureModalTracking();
						const openModals = getOpenStringModuleModals();
						const changedModuleNames = new Set(drained.map(toAppModuleName).filter(Boolean));
						const modalsToReshow = openModals.filter((record) => changedModuleNames.has(record.moduleName));
						const reshowModuleNames = new Set(modalsToReshow.map((record) => record.moduleName));

						// Determine if we can navigate in-place to a changed page
						// instead of resetting all the way back to app-root.
						// This keeps the user on the page they're editing for faster iteration.
						const changedXmlPages = drained
							.filter((id) => /\.xml$/i.test(id))
							.map((id) => toAppModuleName(id))
							.filter((m) => m && m !== 'app-root' && !reshowModuleNames.has(m));

						// Resolve the topmost Frame from the bundled realm.
						// Frame.topmost() relies on an internal frameStack array, so we must
						// call it on the bundled-realm class. Multiple strategies to find it:
						const FrameClass = getCore('Frame') || g.Frame;
						let topFrame: any = null;
						// 1) Try the vendor-realm static topmost()
						try {
							topFrame = FrameClass?.topmost?.();
						} catch {}
						// 2) Try getting the root view from Application — if it's a Frame, use it
						if (!topFrame) {
							try {
								const rootView = App.getRootView?.() || (App as any)._rootView;
								if (rootView) {
									// rootView could be a Frame itself, or contain a Frame
									const isFrame = rootView.constructor?.name === 'Frame' || rootView.navigate;
									if (isFrame) {
										topFrame = rootView;
									} else if (rootView.getChildAt) {
										// Walk direct children looking for a Frame
										for (let i = 0; i < (rootView.getChildrenCount?.() || 0); i++) {
											const child = rootView.getChildAt(i);
											if (child?.constructor?.name === 'Frame' || child?.navigate) {
												topFrame = child;
												break;
											}
										}
									}
								}
							} catch {}
						}
						if (VERBOSE) console.log('[hmr][queue] TS: changedXmlPages=', changedXmlPages, 'topFrame=', !!topFrame, 'modalsToReshow=', modalsToReshow.length);
						if (changedXmlPages.length > 0 && topFrame) {
							// Navigate the current frame to the changed page directly.
							// Use the last changed XML page (most specific).
							const moduleName = changedXmlPages[changedXmlPages.length - 1];
							if (VERBOSE) console.log('[hmr][queue] TS: navigating in-place to', moduleName);
							try {
								topFrame.navigate({ moduleName, clearHistory: false, animated: false });
							} catch (navErr) {
								console.warn('[hmr][queue] TS flavor: in-place navigate failed, falling back to resetRootView', navErr);
								App.resetRootView({ moduleName: 'app-root' } as any);
							}
						} else if (modalsToReshow.length === 0) {
							// No frame page to refresh and no open modal owns the change —
							// fall back to a full root reset. (Skipped when an open modal is
							// being re-presented below: resetRootView would dismiss it.)
							if (VERBOSE) console.log('[hmr][queue] TS flavor: resetRootView(app-root) after changes');
							App.resetRootView({ moduleName: 'app-root' } as any);
						}
						// Re-present any open modals whose XML/code-behind changed. The
						// modules were already re-registered above (raw XML assets + fresh
						// code-behind exports), so the re-presented modal rebuilds from
						// the new content while the page beneath it stays put.
						for (const record of modalsToReshow) {
							await reshowOpenModal(record);
						}
					} catch (e) {
						console.warn('[hmr][queue] TS flavor: resetRootView(app-root) failed', e);
					}
					// Tell the overlay the cycle is done — same as the solid path
					// above. Without this the applying overlay sticks at
					// 'received' (5%) forever even though the in-place navigate /
					// resetRootView already applied the update.
					setUpdateOverlayStage('complete', {
						detail: `Total ${Math.max(0, Date.now() - tQueueStart)}ms`,
					});
					break;
				}
			}
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
let hmrSocket: WebSocket | null = null;
// Single reconnect timer. Overlapping close/timeout events used to each schedule
// their own `setTimeout(connectHmr, …)`, stacking multiple pending reconnects
// that could spawn (and leak) duplicate sockets/listeners. Route all reconnect
// scheduling through here so only one is ever pending.
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleReconnect(delayMs: number) {
	if (reconnectTimer) clearTimeout(reconnectTimer);
	reconnectTimer = setTimeout(() => {
		reconnectTimer = null;
		connectHmr();
	}, delayMs);
}
// Track server-announced batches for each version so we can import in-order client-side
const txnClientBatches: Map<number, string[]> = new Map();

// Public hook for NativeScript runtime to call from ImportModuleDynamicallyCallback later.
globalThis.__nsHmrRequestModule = async function (spec: string): Promise<string> {
	let normalized = normalizeSpec(spec);
	// Remove extension for transform lookup variants (server will try .ts/.js/.mjs)
	normalized = normalized.replace(/\.(ts|js|tsx|jsx|mjs)$/i, '');
	if (!normalized.startsWith('/')) normalized = '/' + normalized;
	if (normalized === '@') {
		// Soft-handle instead of throwing to avoid breaking evaluation paths: return a safe empty module stub.
		try {
			const err = new Error('[hmr-fetch] anomalous @ spec');
			const stack = (err as any).stack || '';
			hmrMetrics.invalidAtSpec = (hmrMetrics.invalidAtSpec || 0) + 1;
			console.warn('[hmr-fetch] refusing to fetch bare @ spec; returning stub; original=', spec, 'stack=\n' + stack);
		} catch {}
		return '/__invalid_at__.mjs';
	}
	const url = await requestModuleFromServer(normalized);
	return url;
};

function connectHmr() {
	if (hmrSocket?.readyState === WebSocket.OPEN) return;
	if (hmrSocket?.readyState === WebSocket.CONNECTING) {
		if (VERBOSE) console.log('[hmr-client] Already connecting to HMR WebSocket, skipping');
		return;
	}
	// A reconnect fired (or a manual connect raced one) — cancel any other pending
	// reconnect so we don't end up with overlapping connect attempts.
	if (reconnectTimer) {
		clearTimeout(reconnectTimer);
		reconnectTimer = null;
	}
	try {
		globalThis.__NS_HMR_CLIENT_SOCKET_READY__ = false;
	} catch {}
	const overlayStage: HmrConnectionOverlayStage = hasOpenedHmrSocket ? 'reconnecting' : 'connecting';
	const baseUrl = getHMRWsUrl() || 'ws://localhost:5173/ns-hmr';
	const buildCandidates = (url: string): string[] => {
		const candidates: string[] = [];
		try {
			const u = new URL(url);
			const proto = u.protocol === 'wss:' ? ['wss'] : ['ws'];
			const defaultPort = u.port || '5173';

			// Build ordered host candidates with preference to the active HTTP origin
			const orderedHosts: Array<{ host: string; port?: string }> = [];
			try {
				const g: any = getGlobalScope();
				const httpOrigin: string | undefined = g && typeof g.__NS_HTTP_ORIGIN__ === 'string' ? g.__NS_HTTP_ORIGIN__ : undefined;
				if (httpOrigin) {
					try {
						const ho = new URL(httpOrigin);
						orderedHosts.push({
							host: ho.hostname,
							port: ho.port || defaultPort,
						});
					} catch {}
				}
			} catch {}

			// From provided URL
			orderedHosts.push({ host: u.hostname, port: defaultPort });
			// Explicit override
			try {
				const h = globalThis.__NS_HMR_HOST;
				if (h) orderedHosts.push({ host: String(h), port: defaultPort });
			} catch {}
			// Common fallbacks
			orderedHosts.push({ host: '10.0.2.2', port: defaultPort });
			orderedHosts.push({ host: 'localhost', port: defaultPort });

			const seen = new Set<string>();
			for (const p of proto) {
				for (const { host, port } of orderedHosts) {
					const key = `${host}:${port}`;
					if (seen.has(key)) continue;
					seen.add(key);
					const cand = `${p}://${host}:${port}${u.pathname || '/ns-hmr'}${u.search || ''}`;
					candidates.push(cand);
				}
			}
		} catch {
			candidates.push(url);
		}
		// Deduplicate while preserving order
		const seen = new Set<string>();
		return candidates.filter((c) => (seen.has(c) ? false : (seen.add(c), true)));
	};

	const candidates = buildCandidates(baseUrl);
	let idx = 0;

	const tryNext = () => {
		if (idx >= candidates.length) {
			showConnectionOverlayNow('offline', 'Waiting for the Vite websocket to come back.');
			console.warn('[hmr-client] All WS candidates failed:', candidates.join(', '));
			scheduleReconnect(1500);
			return;
		}
		const url = candidates[idx++];
		const connectionDetail = `${overlayStage === 'reconnecting' ? 'Retrying' : 'Opening'} ${url}`;
		if (overlayStage === 'reconnecting' && shownConnectionOverlayStage === 'offline') {
			// Don't flip the visible 'offline' frame to 'reconnecting' for an
			// attempt that may fail instantly — defer it so only a genuinely
			// in-flight attempt surfaces. The deferred show is cancelled by
			// showConnectionOverlayNow (offline re-show / synchronizing) the
			// moment this attempt resolves. Keeps 'offline' stable instead of
			// flickering once per retry. (Checking the PAINTED stage, not the
			// pending one, so every candidate in the loop keeps deferring.)
			scheduleConnectionOverlay(overlayStage, connectionDetail, RECONNECTING_OVER_OFFLINE_DELAY_MS);
		} else if (connectionOverlayVisible) {
			updateConnectionOverlay(overlayStage, connectionDetail);
		} else {
			scheduleConnectionOverlay(overlayStage, connectionDetail);
		}
		try {
			if (VERBOSE) console.log('[hmr-client] Connecting to HMR WebSocket:', url);
			const sock = new WebSocket(url);
			hmrSocket = sock;
			setHttpOriginForVite(deriveHttpOrigin(url));

			let opened = false;
			const timeout = setTimeout(() => {
				if (!opened && sock.readyState !== WebSocket.OPEN) {
					try {
						sock.close();
					} catch {}
					if (VERBOSE) console.warn('[hmr-client] WS connect timeout, trying next…');
					tryNext();
				}
			}, 3500);

			sock.onopen = () => {
				opened = true;
				clearTimeout(timeout);
				clearConnectionOverlayTimer();
				hasOpenedHmrSocket = true;
				awaitingHealthyHmrMessage = true;
				try {
					globalThis.__NS_HMR_CLIENT_SOCKET_READY__ = true;
				} catch {}
				// Wire the JS hot registry's server channel to this socket so
				// `import.meta.hot.send(event, data)` reaches Vite plugins as
				// `{ type: 'custom', event, data }` (Vite wire protocol).
				try {
					getNsHotRegistry().setSendToServer((event: string, data?: unknown) => {
						try {
							if (sock.readyState === WebSocket.OPEN) {
								sock.send(JSON.stringify({ type: 'custom', event, data }));
							}
						} catch {}
					});
				} catch {}
				if (connectionOverlayVisible) {
					showConnectionOverlayNow('synchronizing', 'Connected. Synchronizing the HMR graph.');
				}
				if (VERBOSE) console.log('[hmr-client] Connected to HMR WebSocket');
				// Print the active module reload mode once on first
				// successful connect so the user can correlate HMR latency
				// with runtime capability without grepping for protocol
				// details. The banner is verbose-gated.
				try {
					emitHmrModeBannerOnce();
				} catch {}
			};
			sock.onmessage = handleHmrMessage;
			sock.onerror = (error: any) => {
				clearTimeout(timeout);
				console.warn('[hmr-client] WebSocket error:', (error && (error.message || error)) || error);
			};
			sock.onclose = (ev: any) => {
				clearTimeout(timeout);
				try {
					globalThis.__NS_HMR_CLIENT_SOCKET_READY__ = false;
				} catch {}
				if (!opened) {
					// immediate failure during connect → try another candidate
					if (VERBOSE) console.warn('[hmr-client] WS close before open (code', ev?.code, '), trying next…');
					tryNext();
				} else {
					if (VERBOSE) console.log('[hmr-client] WebSocket closed (code', ev?.code, '), will reconnect…');
					scheduleConnectionOverlay('reconnecting', 'The websocket closed. Waiting to reconnect.', 700);
					// try to reconnect with full candidate list again
					scheduleReconnect(1000);
				}
			};
		} catch (e) {
			console.warn('[hmr-client] Failed to connect WebSocket', e);
			tryNext();
		}
	};

	tryNext();
}

async function handleHmrMessage(ev: any) {
	let msg: any;
	try {
		msg = JSON.parse((ev as any).data);
	} catch {
		return;
	}

	if (awaitingHealthyHmrMessage && msg) {
		markHmrConnectionHealthy();
	}

	if (VERBOSE && msg?.type) {
		console.log('[hmr-client] received message', msg.type);
	}

	// Notify optional app-level hook after an HMR batch is applied.
	function notifyAppHmrUpdate(kind: 'full-graph' | 'delta', changedIds: string[] | undefined) {
		try {
			const hook = globalThis.__NS_HMR_ON_UPDATE__;
			if (typeof hook === 'function') {
				hook({ type: kind, version: getGraphVersion(), changedIds: changedIds || [], raw: msg });
			}
		} catch {}
	}

	if (msg) {
		// `ns:hmr-pending` is a fire-and-forget UX hint emitted by the
		// server at the START of handleHotUpdate. We drive the
		// HMR-applying overlay's 'received' frame here (synchronously),
		// well before the authoritative payload (`ns:angular-update` /
		// `ns:css-updates`) lands. Skip running any other handlers —
		// the pending message has no module payload and intentionally
		// does not bump the graph version.
		if (msg.type === 'ns:hmr-pending' && typeof msg.path === 'string') {
			setHmrPendingOverlay(msg.path);
			return;
		}
		// The per-flavor client strategy is loaded by a dynamic import(); make
		// sure it has resolved (and `install()` has run) before any handler that
		// delegates through it. After the first message this is an already-settled
		// promise (microtask only); for Solid/TypeScript it is `Promise.resolve()`.
		await CLIENT_STRATEGY_READY;
		if (msg.type === 'ns:hmr-full-graph') {
			// Bump a monotonic nonce so HTTP ESM imports can always be cache-busted per update.
			try {
				const g: any = getGlobalScope();
				g.__NS_HMR_IMPORT_NONCE__ = (typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
			} catch {}
			// Capture previous graph snapshot so we can infer which modules changed.
			const prevGraph = new Map(graph);
			setGraphVersion(Number(msg.version || getGraphVersion() || 0));
			applyFullGraph(msg);
			hasReceivedFullGraph = true;

			// Gate: On first boot, the entry-runtime handles all initial module loading
			// (with the import map already configured). Don't re-import here — the graph
			// is stored above for future HMR delta comparisons, but modules are already
			// loaded correctly via the entry-runtime boot sequence.
			//
			// Two cases to catch:
			// 1. Boot still in progress (__NS_HMR_BOOT_COMPLETE__ is false)
			// 2. Boot already finished but this is the FIRST full-graph (prevGraph was
			//    empty). The WebSocket often connects after entry-runtime finishes, so
			//    boot is "complete" but we still shouldn't re-import — all modules were
			//    just loaded fresh. Only re-import on subsequent full-graphs (reconnect
			//    scenarios) where prevGraph already has entries.
			if (!globalThis.__NS_HMR_BOOT_COMPLETE__) {
				if (VERBOSE) console.info('[hmr][full-graph] skipping initial re-import (boot in progress)');
				const fullIds = Array.isArray(msg.modules) ? msg.modules.map((m: any) => m?.id).filter(Boolean) : [];
				notifyAppHmrUpdate('full-graph', fullIds);
				return;
			}
			if (prevGraph.size === 0) {
				if (VERBOSE) console.info('[hmr][full-graph] skipping re-import on first graph after boot (modules already fresh)');
				const fullIds = Array.isArray(msg.modules) ? msg.modules.map((m: any) => m?.id).filter(Boolean) : [];
				notifyAppHmrUpdate('full-graph', fullIds);
				return;
			}

			// Reconnect / resync case — re-import changed modules as normal.
			// In some cases (e.g. server chooses full-graph resync / page reload), we won't
			// receive a delta queue to re-import changed TS modules. Without re-import,
			// HTTP ESM caching means module bodies (and side effects) won't re-run.
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

			const fullIds = Array.isArray(msg.modules) ? msg.modules.map((m: any) => m?.id).filter(Boolean) : [];
			notifyAppHmrUpdate('full-graph', fullIds);
			return;
		}
		if (msg.type === 'ns:ts-module-registry') {
			try {
				const mods: string[] = Array.isArray(msg.modules) ? msg.modules.filter((m: any) => typeof m === 'string') : [];
				if (mods.length) {
					if (!tsModuleSet) tsModuleSet = new Set<string>();
					mods.forEach((m) => tsModuleSet!.add(m));
					// Prefer explicit app main entry if present, else first module
					if (mods.includes(APP_MAIN_ENTRY_SPEC)) {
						tsMainId = APP_MAIN_ENTRY_SPEC;
					} else if (!tsMainId) {
						tsMainId = mods[0];
					}
					if (VERBOSE)
						console.log('[hmr-client][ts-registry] registered TS modules', {
							count: tsModuleSet.size,
							mainId: tsMainId,
						});
				}
			} catch (e) {
				if (VERBOSE) console.warn('[hmr-client][ts-registry] failed to record', e);
			}
			return;
		}
		if (msg.type === 'ns:hmr-delta') {
			// Bump a monotonic nonce so HTTP ESM imports can always be cache-busted per update.
			try {
				const g: any = getGlobalScope();
				g.__NS_HMR_IMPORT_NONCE__ = (typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
			} catch {}
			try {
				const ids = Array.isArray(msg.changed) ? msg.changed.map((c: any) => c?.id).filter(Boolean) : [];
				if (ids.length) txnClientBatches.set(getGraphVersion(), ids);
			} catch {}
			applyDelta(msg);
			// Ensure queued module re-imports complete before notifying app hooks.
			// Otherwise app-level handlers can run against stale module bodies due to HTTP ESM caching.
			try {
				await processQueue();
			} catch {}

			const deltaIds = Array.isArray(msg.changed) ? msg.changed.map((c: any) => c?.id).filter(Boolean) : [];
			notifyAppHmrUpdate('delta', deltaIds);
			return;
		} else {
			// Vite custom-event dispatch.
			//
			// `server.ws.send('event-name', payload)` from any Vite plugin lands
			// on the wire as `{ type: 'custom', event: 'event-name', data: payload }`.
			// On the web, Vite's stock client owns a `customListenersMap` that
			// fires every `import.meta.hot.on('event-name', cb)` callback. We
			// don't run Vite's stock client on device — the JS hot registry
			// (`hot-context.ts`, installed by the bootstrap before the entry
			// graph) owns the listener registry populated by user code +
			// compiled Angular components via `import.meta.hot.on`.
			// Forwarding `type: 'custom'` here is the only thing standing
			// between server-emitted events and the listeners they were
			// meant for.
			//
			// `angular:component-update` is the canonical example. Analog's
			// plugin sends it on `.html` / component-style edits; the
			// compiled component `.mjs` registered a listener that
			// dynamic-imports `/@ng/component?c=<id>&t=<ts>` and calls
			// `ɵɵreplaceMetadata` on the live class — swapping the template
			// definition AND walking live `LView`s to recreate matching views
			// in-place. The page stays mounted and only the changed bits
			// re-render. We MUST `return` after dispatch so the reboot path
			// (`handleAngularHotUpdateMessage` → `__reboot_ng_modules__`)
			// never runs for these updates — that's the whole point of the
			// component-replacement pipeline.
			//
			// All other custom events are forwarded but NOT short-circuited
			// (Vite spec: custom events are additive — they don't replace
			// any framework-specific handling). The reboot path falls through
			// for `ns:angular-update` (the legacy/`.ts`-edit broadcast) and
			// for any framework not yet using the in-place replacement path.
			if (msg.type === 'custom' && typeof msg.event === 'string') {
				// Dispatch every Vite "custom" event through the JS hot
				// registry so `import.meta.hot.on(event, cb)` callbacks fire
				// on the device. Critical contract: this is the ONLY route by
				// which Analog's `angular:component-update` reaches the
				// compiled component's `(d) => d.id === id && Component_HmrLoad(...)`
				// listener — without it, server-side broadcasts log green
				// (`(client) hmr update`) while the device sees nothing happen.
				//
				// Diagnostic policy: listener exceptions log loud (compiled
				// HmrLoad fetch/parse error). Successful dispatches are silent.
				try {
					getNsHotRegistry().dispatchHotEvent(msg.event, msg.data);
				} catch (err) {
					console.warn('[hmr-client][custom] dispatch threw for', msg.event, err);
				}
				if (msg.event === 'angular:component-update') {
					if (VERBOSE) console.log('[hmr-client][custom] dispatched angular:component-update — skipping reboot path');
					// Walk the apply-progress overlay through its
					// remaining stages for the in-place template-swap
					// path. The full reboot path
					// (`handleAngularHotUpdateMessage`) drives the
					// overlay itself ('received' → 'evicting' →
					// 'reimporting' → 'rebooting' → 'complete'); the
					// in-place path bypasses that handler entirely
					// because the work happens inside Angular's
					// `ɵɵreplaceMetadata` after the runtime forwards the
					// `angular:component-update` event to the compiled
					// component's listener. Without this update the
					// overlay would freeze at 5% ('received') even
					// though the visual swap completes a few frames
					// later — exactly the "Preparing update (5%)" stuck
					// frame we have been chasing.
					//
					// We transition straight to 'reimporting' to
					// communicate that metadata is being fetched (the
					// runtime listener fires `__ns_import('/@ng/component?c=...&t=...')`),
					// then schedule 'complete' on the next macrotask so
					// the auto-hide timer kicks in. The actual
					// template swap is fire-and-forget from this point;
					// the user sees the overlay close at the same time
					// as Angular re-renders the bound text/structure.
					try {
						const filePath = typeof (msg.data as any)?.id === 'string' ? decodeURIComponent((msg.data as any).id).split('@')[0] : undefined;
						const detail = filePath ? `Applying template update to ${filePath}` : 'Applying template update';
						setUpdateOverlayStage('reimporting', { detail });
						setTimeout(() => {
							try {
								setUpdateOverlayStage('complete', { detail: filePath ? `Updated ${filePath}` : 'Update applied' });
							} catch {}
						}, 16);
					} catch {}
					return;
				}
			}
			if (msg.type === 'ns:angular-update' && typeof msg.version === 'number') {
				setGraphVersion(Number(msg.version || getGraphVersion() || 0));
			}
			if (CLIENT_STRATEGY?.handleHotUpdateMessage && (await CLIENT_STRATEGY.handleHotUpdateMessage(msg, { getCore, verbose: VERBOSE, performResetRoot, getOverlay: getHmrOverlayApi }))) {
				return;
			}
		}
	}
	// On-demand module fetch response (Option A)
	if (msg.type === 'ns:module-response' && typeof msg.requestId === 'number') {
		const pending = pendingModuleFetches.get(msg.requestId);
		if (pending) {
			pendingModuleFetches.delete(msg.requestId);
			if (msg.error) {
				if (VERBOSE) console.warn('[hmr-fetch] error', msg.error, 'spec=', pending.spec, 'id=', msg.requestId);
				pending.reject(new Error(`[hmr-fetch] ${msg.error} for ${pending.spec}`));
			} else {
				try {
					const origin = getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
					if (!origin) throw new Error('no-http-origin');
					const url = origin + '/ns/m' + (String(pending.spec).startsWith('/') ? pending.spec : '/' + pending.spec);
					moduleFetchCache.set(pending.spec, url);
					if (VERBOSE) console.log('[hmr-fetch] resolved via URL', pending.spec, '->', url, 'id=', msg.requestId);
					pending.resolve(url);
				} catch (e) {
					pending.reject(e);
				}
			}
		}
		return;
	}
	if (msg.type === 'ns:css-updates' && Array.isArray(msg.updates)) {
		// Drive the HMR-applying overlay past the 'received' (5%) frame
		// that `ns:hmr-pending` set earlier in the cycle. Without this
		// the overlay sticks at "Preparing update" forever for CSS-only
		// edits because `handleCssUpdates` is a leaf — there's no
		// downstream module-evaluation path that would hit the queue's
		// 'complete' transition.
		const cssCount = msg.updates.length;
		try {
			setUpdateOverlayStage('reimporting', { detail: buildCssApplyingDetail(cssCount) });
		} catch {}
		try {
			const origin = msg.origin || getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
			await handleCssUpdates(msg.updates, origin);
			try {
				setUpdateOverlayStage('complete', { detail: buildCssAppliedDetail(cssCount) });
			} catch {}
			return;
		} catch (e) {
			console.warn('[hmr-client] CSS updates handling failed:', e);
			try {
				setUpdateOverlayStage('complete', { detail: 'CSS update failed' });
			} catch {}
			return;
		}
	}
	if (msg.type === 'ns:vue-sfc-registry') {
		CLIENT_STRATEGY?.handleSfcRegistry?.(msg);
		return;
	}
	if (msg.type === 'ns:vue-sfc-registry-update') {
		if (typeof msg.version === 'number') setGraphVersion(msg.version);
		// `ns:hmr-pending` already set the overlay to 'received' (5%). The Vue
		// strategy walks 'evicting' → 'reimporting' → 'rebooting' → 'complete'
		// around the SFC load + reset so the toast always lands on 'complete'
		// (or a failure detail) and the auto-hide timer can dismiss it.
		await CLIENT_STRATEGY?.handleSfcRegistryUpdate?.(msg, getGraphVersion(), { getCore, verbose: VERBOSE, performResetRoot, getOverlay: getHmrOverlayApi });
		return;
	}
}

function normalizeComponent(input: any, nameHint?: string): any {
	try {
		if (!input) return null;
		// Unwrap module namespace with default
		if (input && typeof input === 'object' && 'default' in input) {
			const d = (input as any).default;
			if (d) return normalizeComponent(d, nameHint);
		}
		// If already a component-like object with render/setup/template, return as-is
		if (typeof input === 'object' && (input.render || input.setup || input.template || input.__isVue)) {
			return input;
		}
		// If provided a render function, wrap with defineComponent
		if (typeof input === 'function') {
			CLIENT_STRATEGY?.beforeNavigateBuild?.();
			const comp = getGlobalScope().defineComponent
				? getGlobalScope().defineComponent({
						name: nameHint || input.name || 'AnonymousSFC',
						render: input,
					})
				: { name: nameHint || input.name || 'AnonymousSFC', render: input };
			return comp;
		}
		// If object has a render function property
		if ((input as any)?.render && typeof (input as any).render === 'function') {
			CLIENT_STRATEGY?.beforeNavigateBuild?.();
			const comp = getGlobalScope().defineComponent
				? getGlobalScope().defineComponent({
						name: nameHint || (input as any).name || 'AnonymousSFC',
						render: (input as any).render,
					})
				: {
						name: nameHint || (input as any).name || 'AnonymousSFC',
						render: (input as any).render,
					};
			return comp;
		}
	} catch {}
	return input;
}

async function performResetRoot(newComponent: any): Promise<boolean> {
	const tStart = Date.now();
	// Guard against re-entrant or rapid successive resets
	try {
		globalThis.__NS_DEV_RESET_IN_PROGRESS__ = true;
	} catch {}
	try {
		ensureCoreAliasesOnGlobalThis();
	} catch {}
	if (VERBOSE) {
		console.log('[hmr-client] Single-path: replace current root Page');
		console.log('[hmr-client] Component details:', {
			componentName: (newComponent as any)?.__name,
			componentFile: (newComponent as any)?.__file,
			hasRender: !!(newComponent as any)?.render,
			hasSetup: !!(newComponent as any)?.setup,
			componentKeys: Object.keys(newComponent || {}),
		});
	}

	// Factory that mounts the component and returns a Page (from core aggregator realm)
	type RootFactory = { readonly kind: 'page' | 'frame'; create: () => any };
	function createRootFactory(): RootFactory {
		let rootKind: 'page' | 'frame' = 'page';
		let cachedRoot: any = undefined;
		const state = {
			getRootKind: () => rootKind,
			setRootKind: (k: 'page' | 'frame') => {
				rootKind = k;
			},
			getCachedRoot: () => cachedRoot,
			setCachedRoot: (r: any) => {
				cachedRoot = r;
			},
		};
		const factory: RootFactory = {
			get kind() {
				return rootKind;
			},
			create: () => {
				if (cachedRoot) return cachedRoot;
				try {
					if (CLIENT_STRATEGY?.createRoot) {
						cachedRoot = CLIENT_STRATEGY.createRoot(newComponent, state);
					} else if (TS_LIKE_FLAVOR) {
						// For TS flavor, treat the component as a factory or direct NS view.
						let root: any = null;
						try {
							if (typeof newComponent === 'function') {
								root = newComponent();
							} else {
								root = newComponent;
							}
						} catch (e) {
							console.warn('[hmr-client][ts] root factory invocation failed', e);
						}
						cachedRoot = root || {};
						// Heuristic: if the root "looks" like a Frame, prefer frame semantics
						try {
							const name = String(cachedRoot?.constructor?.name || '').replace(/^_+/, '');
							if (/^Frame(\$\d+)?$/.test(name)) {
								rootKind = 'frame';
							}
						} catch {}
					}
					return cachedRoot;
				} catch (e) {
					console.warn('[hmr-client] createRootFactory failed', e);
					if (VERBOSE) console.warn('[hmr-client] [createRoot] stack', (e as any)?.stack);
					const GPage: any = getCore('Page');
					rootKind = 'page';
					cachedRoot = GPage ? new GPage() : ({} as any);
					return cachedRoot;
				}
			},
		} as RootFactory;
		return factory;
	}

	// Android readiness before any root changes
	const App = getCore('Application') || getGlobalScope().Application;
	const isAndroid = !!(App && (App as any).android !== undefined);
	if (isAndroid) {
		const isReady = () => {
			try {
				const a: any = (App as any).android;
				const act = a && (a.foregroundActivity || a.startActivity);
				return !!act;
			} catch {
				return false;
			}
		};
		const waitFor = async (pred: () => boolean, ms = 6000, step = 60) => {
			const start = Date.now();
			while (Date.now() - start < ms) {
				if (pred()) return true;
				await new Promise((r) => setTimeout(r, step));
			}
			return pred();
		};
		const withEvents = async (ms = 6000) => {
			try {
				const a: any = (App as any).android;
				if (!a || typeof a.on !== 'function' || typeof a.off !== 'function') {
					if (VERBOSE) console.log('[hmr-client] [android] events API not available; polling');
					return await waitFor(isReady, ms, 60);
				}
				if (isReady()) {
					if (VERBOSE) console.log('[hmr-client] [android] activity already ready');
					return true;
				}
				return await new Promise<boolean>((resolve) => {
					let done = false;
					const tWait = Date.now();
					const finish = (ok: boolean) => {
						if (done) return;
						done = true;
						try {
							a.off(a.activityStartedEvent || 'activityStarted', onAny);
							a.off(a.activityResumedEvent || 'activityResumed', onAny);
						} catch {}
						if (VERBOSE)
							console.log('[hmr-client] [android] readiness result', {
								ok,
								elapsedMs: Date.now() - tWait,
							});
						resolve(ok);
					};
					const onAny = (evt?: any) => {
						if (VERBOSE)
							console.log('[hmr-client] [android] activity event', {
								type: evt?.eventName || 'unknown',
							});
						if (isReady()) finish(true);
					};
					try {
						a.on(a.activityStartedEvent || 'activityStarted', onAny);
						a.on(a.activityResumedEvent || 'activityResumed', onAny);
						if (VERBOSE) console.log('[hmr-client] [android] waiting for activity events…');
					} catch {
						return resolve(waitFor(isReady, ms, 60));
					}
					setTimeout(() => finish(isReady()), ms);
				});
			} catch {
				return await waitFor(isReady, ms, 60);
			}
		};
		const ok = await withEvents(6000);
		if (!ok && VERBOSE) console.warn('[hmr-client] [android] activity not ready; proceeding with best-effort');
	}

	// Create the new root first to determine whether it is a Page or a Frame
	const rootFactory = createRootFactory();
	const preparedRoot = rootFactory.create();
	const isFrameRoot = (() => {
		try {
			const name = String(preparedRoot?.constructor?.name || '').replace(/^_+/, '');
			return /^Frame(\$\d+)?$/.test(name);
		} catch {
			return false;
		}
	})();
	// Prefer resetRootView on initial boot (placeholder present) or on iOS to avoid early createRootView races
	let hadPlaceholder = false;
	let isIOS = false;
	try {
		hadPlaceholder = !!globalThis.__NS_DEV_PLACEHOLDER_ROOT_EARLY__;
	} catch {}
	try {
		const AppAny: any = getCore('Application') || getGlobalScope().Application;
		isIOS = !!(AppAny && (AppAny as any).ios !== undefined);
	} catch {}
	// Preferred policy:
	// - If this is the very first mount (placeholder present), or if the new root is a Frame,
	//   perform a full root replacement via resetRootView so we never couple with the placeholder.
	// - Otherwise (subsequent HMR updates with an authoritative Frame already in place), re-use the
	//   current app Frame and navigate to the new Page. This avoids a brief flash that can occur
	//   when swapping the entire root view on Android. The placeholder is never involved here.
	const gAnyForPolicy: any = getGlobalScope();
	const placeholderFrame = (() => {
		try {
			return gAnyForPolicy.__NS_DEV_PLACEHOLDER_ROOT_VIEW__ || null;
		} catch {
			return null;
		}
	})();
	let existingAppFrame: any = null;
	try {
		existingAppFrame = getRootFrame() || (getCore('Frame') as any)?.topmost?.() || null;
	} catch {}
	const isAuthoritativeFrame = !!existingAppFrame && existingAppFrame !== placeholderFrame;
	// Vue: skip the in-place navigate path. After `app.mount(NSVRoot)` in getRootForVue the
	// new Page already has a parent (the freshly-constructed NSVRoot), so an attempt to navigate
	// the existing app Frame to that same Page completes silently without ever rebinding the
	// page to the Frame — the screen keeps showing the previous render. resetRootView with a
	// fresh Frame correctly reparents the Page and is the proven path that produces visible
	// in-place updates for SFC HMR cycles. Non-Vue flavors keep the legacy navigate fast path.
	const allowNavigateFastPath = CLIENT_STRATEGY?.allowNavigateFastPath ?? true;
	if (allowNavigateFastPath && !hadPlaceholder && !isFrameRoot && isAuthoritativeFrame && typeof (existingAppFrame as any).navigate === 'function') {
		try {
			const navEntry = {
				create: () => preparedRoot,
				clearHistory: true,
				animated: false,
			} as any;
			(existingAppFrame as any).navigate(navEntry);
			setRootFrame(existingAppFrame);
			return true;
		} catch (e) {
			console.warn('[hmr-client] authoritative navigate fallback to resetRootView due to error', e);
		}
	}
	if (VERBOSE) console.log('[hmr-client] full root replacement via resetRootView (placeholder will be discarded)', { isFrameRoot, isIOS, hadPlaceholder });

	// Fallback or preferred path: resetRootView with a creator that builds a fresh Frame and navigates to the new Page
	try {
		const App2 = getCore('Application') || getGlobalScope().Application;
		if (!App2 || typeof App2.resetRootView !== 'function') {
			console.warn('[hmr-client] Application.resetRootView unavailable');
			return false;
		}
		// iOS-specific: if the cached window was left in an invalid state (boolean false), clear it so
		// setWindowContent can recreate a proper UIWindow. This can occur in rare early-boot races.
		try {
			const isIos = !!(App2 && (App2 as any).ios !== undefined);
			if (isIos) {
				let win: any = undefined;
				try {
					win = (App2 as any).window;
				} catch {}
				if (win === false) {
					if (VERBOSE) console.warn('[hmr-client] iOS Application.window is boolean false; attempting to clear cached window');
					try {
						const g: any = getGlobalScope();
						const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
						const req: any = reg?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
						let helpers: any = null;
						// Try vendor registry first
						if (reg && reg.has('@nativescript/core/application/helpers-common')) {
							helpers = reg.get('@nativescript/core/application/helpers-common');
						}
						// Fallback to device require
						if (!helpers && typeof req === 'function') {
							try {
								helpers = req('@nativescript/core/application/helpers-common');
							} catch {}
						}
						const setter = helpers && (helpers.setiOSWindow || helpers.default?.setiOSWindow);
						if (typeof setter === 'function') {
							try {
								setter(undefined as any);
								if (VERBOSE) console.log('[hmr-client] cleared cached iOS window via helpers-common');
							} catch {}
						}
					} catch {}
				}
			}
		} catch {}
		// Use the previously created preparedRoot
		const entry = {
			create: () => {
				if (!isFrameRoot) {
					const F = getCore('Frame');
					const fr = new (F as any)();
					if (VERBOSE)
						console.log('[hmr-client] resetRootView:create new Frame', {
							type: fr?.constructor?.name,
						});
					const navEntry = {
						create: () => preparedRoot,
						clearHistory: true,
						animated: false,
					} as any;
					try {
						(fr as any).navigate(navEntry);
					} catch (e) {
						console.warn('[hmr-client] resetRootView:create navigate failed', e);
					}
					setRootFrame(fr);
					return fr;
				} else {
					const fr = preparedRoot;
					setRootFrame(fr);
					return fr;
				}
			},
		} as any;
		// Always use an entry with a create() function to avoid cross‑realm instanceof checks on Android.
		App2.resetRootView(entry as any);
		// After authoritative reset, it's safe to detach the early placeholder launch handler
		try {
			const restore = globalThis.__NS_DEV_RESTORE_PLACEHOLDER__;
			if (typeof restore === 'function') {
				restore();
			}
		} catch {}
		return true;
	} catch (e) {
		console.warn('[hmr-client] resetRootView failed', e);
		try {
			if (VERBOSE) console.warn('[hmr-client] resetRootView stack', (e as any)?.stack);
		} catch {}
		return false;
	} finally {
		try {
			globalThis.__NS_DEV_RESET_IN_PROGRESS__ = false;
		} catch {}
	}
}

export function initHmrClient(opts?: { wsUrl?: string }) {
	if (opts?.wsUrl) {
		setHMRWsUrl(opts.wsUrl);
	}
	if (VERBOSE) console.log('[hmr-client] Initializing HMR client', getHMRWsUrl() ? `(ws: ${getHMRWsUrl()})` : '');
	// Prevent duplicate client initialization across re-evaluations
	const g = globalThis;
	if (g.__NS_HMR_CLIENT_ACTIVE__) {
		if (VERBOSE) console.log('[hmr-client] HMR client already active; skipping duplicate init');
		return;
	}
	g.__NS_HMR_CLIENT_ACTIVE__ = true;
	ensureCoreAliasesOnGlobalThis();
	// XML flavor: record string-module modals from the moment the client is up
	// so an already-open modal can be re-presented when its files change.
	// Installed at init (not first-update time) because the wrap can only
	// observe showModal calls made AFTER it lands. Retried briefly because
	// getCore('View') may not resolve until the vendor realm finishes booting.
	if (TS_LIKE_FLAVOR) {
		const tryInstallModalTracking = (attempts: number) => {
			ensureModalTracking();
			if (!modalTrackingInstalled && attempts > 0) {
				setTimeout(() => tryInstallModalTracking(attempts - 1), 250);
			}
		};
		tryInstallModalTracking(40);
	}
	// Defer WebSocket connection until boot completes to avoid native V8 crashes
	// caused by concurrent WebSocket message handling + HTTP fetch during early startup.
	// The WebSocket is only needed for HMR updates, not the initial boot sequence.
	if (g.__NS_HMR_BOOT_COMPLETE__) {
		connectHmr();
	} else {
		const waitForBoot = () => {
			if (globalThis.__NS_HMR_BOOT_COMPLETE__) {
				if (VERBOSE) console.log('[hmr-client] boot complete, connecting HMR WebSocket');
				connectHmr();
			} else {
				setTimeout(waitForBoot, 100);
			}
		};
		if (VERBOSE) console.log('[hmr-client] deferring WebSocket connection until boot completes');
		setTimeout(waitForBoot, 100);
	}
	// Best-effort: install back wrapper even before first remount; original root may be captured later.
	// Deferred until the dynamically-imported strategy resolves.
	void CLIENT_STRATEGY_READY.then(() => CLIENT_STRATEGY?.installBackWrapper?.(performResetRoot, getCore));
}
export default function startViteHMR(opts?: { wsUrl?: string }) {
	if (VERBOSE) console.log('[hmr-client] Starting HMR client', opts);
	initHmrClient(opts);
}
