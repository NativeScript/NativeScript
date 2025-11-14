/**
 * Robust HMR client for NativeScript.
 *
 * Avoid importing from '@nativescript/core' and other framework modules here to prevent creating a second module realm via HTTP ESM.
 * Always resolve core classes and Application from the vendor realm or globalThis at runtime.
 * The HMR client is evaluated via HTTP ESM on device; static imports would create secondary instances.
 */

import { setHMRWsUrl, getHMRWsUrl, pendingModuleFetches, deriveHttpOrigin, setHttpOriginForVite, moduleFetchCache, requestModuleFromServer, getHttpOriginForVite, normalizeSpec, hmrMetrics, graph, setGraphVersion, getGraphVersion, getCurrentApp, getRootFrame, setCurrentApp, setRootFrame, getCore, attachDiagnosticsToFrame, logUiSnapshot } from './utils.js';
import { handleCssUpdates } from './css-handler.js';

// satisfied by define replacement
declare const __NS_ENV_VERBOSE__: boolean | undefined;
const VERBOSE = typeof __NS_ENV_VERBOSE__ !== 'undefined' && __NS_ENV_VERBOSE__;
declare const __NS_TARGET_FLAVOR__: string | undefined;

// Policy: by default, let the app's own main entry mount initially; HMR client handles updates/remounts only.
// Flip this to true via global __NS_HMR_ALLOW_INITIAL_MOUNT__ if you need the client to perform the first mount.
const ALLOW_INITIAL_MOUNT: boolean = !!globalThis.__NS_HMR_ALLOW_INITIAL_MOUNT__;
// When verbose mode is enabled, also enable runtime nav diagnostics so /ns/rt logs are visible
try {
	if (VERBOSE) {
		globalThis.__NS_DEV_LOGS__ = true;
		globalThis.__NS_VERBOSE_RT_NAV__ = true;
	}
} catch {}

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
			if (A && !g.Application) g.Application = A;
		} catch {}
		try {
			if (P && !g.Page) g.Page = P;
		} catch {}
		// Optional diagnostics: compare with vendor realm if available
		if (VERBOSE) {
			let vF: any, vA: any, vP: any;
			try {
				const reg: Map<string, any> | undefined = g.__nsVendorRegistry;
				const vmod = reg?.get ? reg.get('@nativescript/core') : undefined;
				const vns = (vmod && (vmod.default || vmod)) || vmod;
				vF = vns?.Frame;
				vA = vns?.Application;
				vP = vns?.Page;
			} catch {}
			try {
				console.log('[hmr-client] core alias status', {
					globalHas: { Frame: !!F, Application: !!A, Page: !!P },
					globalMethods: {
						FrameTopmost: typeof F?.topmost === 'function',
						AppResetRoot: typeof A?.resetRootView === 'function',
					},
					sameRef: {
						Frame: F && vF ? F === vF : undefined,
						Application: A && vA ? A === vA : undefined,
						Page: P && vP ? P === vP : undefined,
					},
					ctorNames: {
						Frame: F?.name || F?.constructor?.name,
						Application: A?.name || A?.constructor?.name,
						Page: P?.name || P?.constructor?.name,
					},
				});
			} catch {}
		}
	} catch {}
}
// Apply once on module evaluation
ensureCoreAliasesOnGlobalThis();

// Install low-level diagnostics for navigation and root replacement to trace duplicates and state
installDeepDiagnostics();

/**
 * Flavor hooks
 */
import { installNsVueDevShims, ensureBackWrapperInstalled, getRootForVue, loadSfcComponent, ensureVueGlobals, ensurePiniaOnApp, addSfcMapping, recordVuePayloadChanges, handleVueSfcRegistry, handleVueSfcRegistryUpdate } from '../frameworks/vue/client/index.js';
switch (__NS_TARGET_FLAVOR__) {
	case 'vue':
		if (VERBOSE) {
			console.log('[hmr-client] installing nativescript-vue dev shims');
		}
		installNsVueDevShims();
		break;
	case 'angular':
		if (VERBOSE) {
			try {
				console.log('[hmr-client] Initializing Angular HMR shims');
			} catch {}
		}
		break;
}

// Global frame diagnostics: instrument Frame.navigate and Frame.topmost to detect
// navigation against non-authoritative frames across the app (helps gray-screen cases)
try {
	const g: any = globalThis as any;
	const F: any = getCore('Frame') || g.Frame;
	if (F && F.prototype && !g.__NS_DEV_GLOBAL_FRAME_PATCHED__) {
		const tag = (fr: any) => {
			try {
				if (!fr) return;
				if (!fr.__ns_tag) fr.__ns_tag = Math.random().toString(36).slice(2);
			} catch {}
		};
		const proto = F.prototype;
		const origNav = proto.navigate;
		if (typeof origNav === 'function') {
			proto.navigate = function __ns_diag_nav(entry: any) {
				try {
					tag(this);
					console.log('[diag][global][frame.navigate]', {
						tag: (this as any).__ns_tag,
						type: this?.constructor?.name,
						hasCreate: !!entry?.create,
						clearHistory: !!entry?.clearHistory,
						animated: !!entry?.animated,
					});
				} catch {}
				return origNav.apply(this, arguments as any);
			} as any;
		}
		const origTop = typeof F.topmost === 'function' ? F.topmost.bind(F) : null;
		if (origTop) {
			F.topmost = function __ns_diag_topmost() {
				const fr = origTop();
				try {
					tag(fr);
					console.log('[diag][global][Frame.topmost]', {
						tag: (fr as any)?.__ns_tag,
						type: (fr as any)?.constructor?.name,
					});
				} catch {}
				return fr;
			} as any;
		}
		try {
			g.__NS_DEV_GLOBAL_FRAME_PATCHED__ = true;
		} catch {}
	}
} catch {}

// --- Diagnostics helpers ----------------------------------------------------
function summarizeNavEntry(entry: any) {
	try {
		if (!entry) return { kind: 'empty' };
		if (typeof entry === 'string') return { kind: 'string', moduleName: entry };
		const hasCreate = typeof (entry as any).create === 'function';
		const moduleName = (entry as any).moduleName;
		const clearHistory = !!(entry as any).clearHistory;
		const animated = (entry as any).animated;
		const backstackVisible = (entry as any).backstackVisible;
		const contextKeys = Object.keys((entry as any).context || {});
		return {
			kind: 'entry',
			hasCreate,
			moduleName,
			clearHistory,
			animated,
			backstackVisible,
			contextKeys,
		};
	} catch {
		return { kind: 'unknown' };
	}
}

function classifyResetArg(arg: any) {
	try {
		const ctorName = String(arg?.constructor?.name || '').replace(/^_+/, '');
		const keys = Object.keys(arg || {});
		const hasCreate = typeof arg?.create === 'function';
		const hasModuleName = typeof arg?.moduleName === 'string';
		const isFrameLike = !!arg && (ctorName === 'Frame' || /^Frame(\$\d+)?$/.test(ctorName) || (typeof arg?.navigate === 'function' && typeof arg?.addChild === 'function'));
		const isPageLike = !!arg && (ctorName === 'Page' || /^Page(\$\d+)?$/.test(ctorName) || (typeof arg?.content !== 'undefined' && typeof arg?.addChild === 'function'));
		return {
			ctorName,
			keys,
			hasCreate,
			hasModuleName,
			isFrameLike,
			isPageLike,
		};
	} catch {
		return { ctorName: 'unknown' };
	}
}

function installDeepDiagnostics() {
	if (!VERBOSE) return;
	const g: any = globalThis as any;
	try {
		// Patch Frame.navigate to log calls and a short stack
		const F = getCore('Frame') || g.Frame;
		if (F?.prototype && !(F.prototype as any).__ns_diag_nav__) {
			const orig = F.prototype.navigate;
			if (typeof orig === 'function') {
				(F.prototype as any).__ns_diag_nav__ = true;
				// Simple duplicate navigation suppression in dev: if the same target is navigated twice within a short window, ignore the 2nd.
				F.prototype.navigate = function (...args: any[]) {
					try {
						const entry = args[0];
						const summary = summarizeNavEntry(entry);
						const stack = (new Error().stack || '').split('\n').slice(2, 8).join('\n');
						console.log('[diag][Frame.navigate]', {
							frameCtor: this?.constructor?.name,
							summary,
							stack,
						});
						try {
							const gAny: any = globalThis as any;
							const key = JSON.stringify({
								k: 'nav',
								m: summary.moduleName || '',
								c: !!summary.hasCreate,
								ch: !!summary.clearHistory,
								a: !!summary.animated,
							});
							const now = Date.now();
							const last = gAny.__NS_DIAG_LAST_NAV__;
							if (last && last.key === key && now - last.t < 300) {
								console.warn('[diag][Frame.navigate] duplicate nav suppressed (dev)', { withinMs: now - last.t, key });
								return; // suppress duplicate
							}
							gAny.__NS_DIAG_LAST_NAV__ = { key, t: now };
						} catch {}
					} catch {}
					return orig.apply(this, args as any);
				} as any;
			}
		}
	} catch {}
	try {
		// Wrap Application.resetRootView to log argument classification and stack
		const App = getCore('Application') || g.Application;
		const proto = App && Object.getPrototypeOf(App);
		const orig = (App && App.resetRootView) || (proto && proto.resetRootView);
		if (typeof orig === 'function' && !(g as any).__NS_DIAG_RESET_WRAPPED__) {
			const wrapped = function __ns_diag_resetRootView(this: any, entry: any) {
				try {
					const classification = classifyResetArg(entry);
					const stack = (new Error().stack || '').split('\n').slice(2, 8).join('\n');
					console.log('[diag][Application.resetRootView]', {
						classification,
						stack,
					});
				} catch {}
				return orig.call(this, entry);
			} as any;
			try {
				App.resetRootView = wrapped;
			} catch {}
			try {
				if (proto && typeof proto === 'object') (proto as any).resetRootView = wrapped;
			} catch {}
			try {
				(g as any).__NS_DIAG_RESET_WRAPPED__ = true;
			} catch {}
		}
	} catch {}
}

// Track whether we've mounted an initial app root yet in HTTP-only boot
let initialMounted = !!(globalThis as any).__NS_HMR_BOOT_COMPLETE__;
// Prevent duplicate initial-mount scheduling across rapid full-graph broadcasts and re-evaluations
let initialMounting = !!(globalThis as any).__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__;
const changedQueue: any[] = [];
let processingQueue = false;

// Detect whether the early placeholder root is still active on screen
function isPlaceholderActive(): boolean {
	try {
		const g: any = globalThis as any;
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
	// perform a one-time mount. This waits briefly to let /src/app.ts start() run first to avoid double mounts.
	try {
		const g: any = globalThis as any;
		const bootDone = !!g.__NS_HMR_BOOT_COMPLETE__;
		if (!bootDone && !initialMounted && !initialMounting && !g.__NS_HMR_RESCUE_SCHEDULED__) {
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
						try {
							g.__NS_HMR_BOOT_COMPLETE__ = true;
						} catch {}
						if (VERBOSE) console.log('[hmr][init] detected real root after delay; skipping client initial mount');
						// Detach placeholder handler if still present
						try {
							const restore = g.__NS_DEV_RESTORE_PLACEHOLDER__;
							if (typeof restore === 'function') restore();
						} catch {}
						return;
					}
					// If placeholder still active and no real root, try a one-time gentle initial mount
					const placeholderActive = isPlaceholderActive();
					if (!placeholderActive) return;
					if (VERBOSE) console.log('[hmr][init] placeholder persists after delay; performing one-time initial mount');
					// Prefer first .vue under /src/app.ts deps, else first .vue in graph
					let candidate: string | null = null;
					const appEntry = graph.get('/src/app.ts');
					if (appEntry && Array.isArray(appEntry.deps)) {
						const vueDep = appEntry.deps.find((d) => typeof d === 'string' && /\.vue$/i.test(d));
						if (vueDep) candidate = vueDep;
					}
					if (!candidate) {
						for (const id of graph.keys()) {
							if (/\.vue$/i.test(id)) {
								candidate = id;
								break;
							}
						}
					}
					if (!candidate) return;
					initialMounting = true;
					try {
						g.__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = true;
					} catch {}
					(async () => {
						try {
							let comp: any = null;
							switch (__NS_TARGET_FLAVOR__) {
								case 'vue':
									comp = await loadSfcComponent(candidate!, 'initial_mount_rescue');
									break;
							}

							if (!comp) return;
							const ok = await performResetRoot(comp);
							if (ok) {
								initialMounted = true;
								try {
									g.__NS_HMR_BOOT_COMPLETE__ = true;
								} catch {}
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
	// by choosing a likely Vue root component and performing a resetRootView with it.
	try {
		// Short-circuit if boot is complete or an initial mount is already underway (across realms/evals)
		const bootDone = !!(globalThis as any).__NS_HMR_BOOT_COMPLETE__;
		const bootInProgress = !!(globalThis as any).__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ || initialMounting;
		// Only allow initial mount when explicitly enabled. Rely on the app's own /src/app.ts start() for the first mount
		// to avoid double-mount races that can cause duplicate navigation logs.
		if (ALLOW_INITIAL_MOUNT && !initialMounted && !bootDone && !bootInProgress && !getCurrentApp() && !getRootFrame()) {
			// Prefer the first .vue dependency of /src/app.ts, else first .vue in graph
			let candidate: string | null = null;
			const appEntry = graph.get('/src/app.ts');
			if (appEntry && Array.isArray(appEntry.deps)) {
				const vueDep = appEntry.deps.find((d) => typeof d === 'string' && /\.vue$/i.test(d));
				if (vueDep) candidate = vueDep;
			}
			if (!candidate) {
				for (const id of graph.keys()) {
					if (/\.vue$/i.test(id)) {
						candidate = id;
						break;
					}
				}
			}
			if (candidate) {
				// Mark initial-mount in progress (both module-local and global) BEFORE scheduling async work
				initialMounting = true;
				try {
					(globalThis as any).__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = true;
				} catch {}
				(async () => {
					try {
						if (VERBOSE) console.log('[hmr][init] mounting initial Vue root from', candidate);
						// Android-only: avoid racing entry-runtime reset and Activity bring-up
						try {
							const g: any = globalThis as any;
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
						const comp = await loadSfcComponent(candidate!, 'initial_mount');
						if (comp) {
							const ok = await performResetRoot(comp);
							if (ok) {
								initialMounted = true;
								try {
									(globalThis as any).__NS_HMR_BOOT_COMPLETE__ = true;
								} catch {}
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
							(globalThis as any).__NS_HMR_INITIAL_MOUNT_IN_PROGRESS__ = false;
						} catch {}
					}
				})();
			} else if (VERBOSE) {
				console.warn('[hmr][init] no Vue component found in graph to mount initially');
			}
		}
	} catch {}
}
function applyDelta(payload: any) {
	if (payload.baseVersion !== getGraphVersion()) {
		if (VERBOSE) console.warn('[hmr][graph] version mismatch requesting resync', payload.baseVersion, getGraphVersion());
		// Request resync (simple ping) – server will resend full graph (protocol extension placeholder)
		hmrSocket?.send(JSON.stringify({ type: 'ns:hmr-resync-request' }));
		return;
	}
	setGraphVersion(payload.newVersion);

	const changed = payload.changed || [];
	switch (__NS_TARGET_FLAVOR__) {
		case 'vue':
			recordVuePayloadChanges(changed, getGraphVersion());
			break;
	}

	(payload.changed || []).forEach((m: any) => {
		if (m && m.id) graph.set(m.id, { id: m.id, deps: m.deps || [], hash: m.hash || '' });
	});
	(payload.removed || []).forEach((r: string) => {
		graph.delete(r);
	});
	if (VERBOSE) console.log('[hmr][graph] delta applied newVersion', getGraphVersion(), 'changed=', (payload.changed || []).length, 'removed=', (payload.removed || []).length);
	// Queue evaluation of changed modules (placeholder pipeline)
	if (payload.changed?.length) {
		// HARD SUPPRESS: the very first delta (baseVersion 0) commonly includes /src/app.ts which is already evaluated during bootstrap.
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
		for (const id of realIds) {
			// We now rely on SFC registry update events to trigger root resets for .vue files directly
			if (/\.vue$/i.test(id)) {
				if (VERBOSE) console.log('[hmr][delta] skipping queue for .vue id; will handle on registry update', id);
				continue;
			}
			if (isInitial && /\/src\/app\.ts$/.test(id)) {
				if (VERBOSE) console.log('[hmr][delta] suppressing initial /src/app.ts evaluation');
				continue;
			}
			if (/\/src\/app\.ts$/.test(id)) {
				try {
					const exists = (globalThis as any).require?.(id) || (globalThis as any).__nsGetModuleExports?.(id);
					if (!exists && VERBOSE) console.log('[hmr][delta] skipping unresolved /src/app.ts change');
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

// Deterministic navigation using the current Vue app instance rather than vendor-held rootApp
function __nsNavigateUsingApp(comp: any, opts: any = {}) {
	const g = globalThis as any;
	switch (__NS_TARGET_FLAVOR__) {
		case 'vue':
			ensureVueGlobals();
			break;
	}
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
		const app = AppFactory(normalizeComponent(comp, comp && (comp.__name || comp.name)));
		switch (__NS_TARGET_FLAVOR__) {
			case 'vue':
				ensurePiniaOnApp(app);
				break;
		}
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
					try {
						attachDiagnosticsToFrame(fr);
					} catch {}
					setRootFrame(fr);
					try {
						(getRootFrame() as any).__ns_tag ||= Math.random().toString(36).slice(2);
						console.log('[diag][root] ROOT_FRAME set (app-nav)', {
							tag: getRootFrame()?.__ns_tag,
							type: getRootFrame()?.constructor?.name,
						});
					} catch {}
					return fr;
				},
			} as any);
			return undefined;
		}
		throw new Error('Application.resetRootView unavailable');
	}
	try {
		attachDiagnosticsToFrame(frame);
	} catch {}
	const navEntry = { create: () => buildTarget(), ...(opts || {}) } as any;
	try {
		const summary = summarizeNavEntry(navEntry);
		if (VERBOSE) console.log('[app-nav] navigate entry', summary);
	} catch {}
	(frame as any).navigate(navEntry);
	try {
		const top2 = (g.Frame && g.Frame.topmost && g.Frame.topmost()) || null;
		const ctor2 = top2 && top2.constructor && top2.constructor.name;
		if (VERBOSE)
			console.log('[app-nav] after navigate', {
				topCtor: ctor2,
				hasTop: !!top2,
			});
	} catch {}
	return undefined;
}

// Expose deterministic app navigation globally so /ns/rt can guarantee single-path navigation
try {
	(globalThis as any).__nsNavigateUsingApp = __nsNavigateUsingApp;
} catch {}

async function processQueue() {
	if (!(globalThis as any).__NS_HMR_BOOT_COMPLETE__) {
		if (VERBOSE) console.log('[hmr][gate] deferring HMR eval until boot complete');
		setTimeout(() => {
			try {
				processQueue();
			} catch {}
		}, 150);
		return;
	}
	if (processingQueue) return;
	processingQueue = true;
	// ...existing code...
	processingQueue = false;
}
let hmrSocket: WebSocket | null = null;
// Track server-announced batches for each version so we can import in-order client-side
const txnClientBatches: Map<number, string[]> = new Map();

// Public hook for NativeScript runtime to call from ImportModuleDynamicallyCallback later.
(globalThis as any).__nsHmrRequestModule = async function (spec: string): Promise<string> {
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
		if (__NS_ENV_VERBOSE__) console.log('[hmr-client] Already connecting to HMR WebSocket, skipping');
		return;
	}
	const baseUrl = getHMRWsUrl() || 'ws://localhost:5173/ns-hmr';
	const buildCandidates = (url: string): string[] => {
		let candidates: string[] = [];
		try {
			const u = new URL(url);
			const proto = u.protocol === 'wss:' ? ['wss'] : ['ws'];
			const defaultPort = u.port || '5173';

			// Build ordered host candidates with preference to the active HTTP origin
			const orderedHosts: Array<{ host: string; port?: string }> = [];
			try {
				const g: any = globalThis as any;
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
				const h = (globalThis as any).__NS_HMR_HOST;
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
					const cand = `${p}://${host}:${port}${u.pathname || '/ns-hmr'}`;
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
			console.warn('[hmr-client] All WS candidates failed:', candidates.join(', '));
			return;
		}
		const url = candidates[idx++];
		try {
			if (__NS_ENV_VERBOSE__) console.log('[hmr-client] Connecting to HMR WebSocket:', url);
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
				VERBOSE && console.log('[hmr-client] Connected to HMR WebSocket');
			};
			sock.onmessage = handleHmrMessage;
			sock.onerror = (error: any) => {
				clearTimeout(timeout);
				console.warn('[hmr-client] WebSocket error:', (error && (error.message || error)) || error);
			};
			sock.onclose = (ev: any) => {
				clearTimeout(timeout);
				if (!opened) {
					// immediate failure during connect → try another candidate
					if (VERBOSE) console.warn('[hmr-client] WS close before open (code', ev?.code, '), trying next…');
					tryNext();
				} else {
					if (VERBOSE) console.log('[hmr-client] WebSocket closed (code', ev?.code, '), will reconnect…');
					// try to reconnect with full candidate list again
					setTimeout(connectHmr, 1000);
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
	if (VERBOSE) console.log('[hmr-client] msg', msg);
	if (msg) {
		if (msg.type === 'ns:hmr-full-graph') {
			setGraphVersion(Number(msg.version || getGraphVersion() || 0));
			applyFullGraph(msg);
			return;
		}
		if (msg.type === 'ns:hmr-delta') {
			setGraphVersion(Number(msg.newVersion || getGraphVersion() || 0));
			try {
				const ids = Array.isArray(msg.changed) ? msg.changed.map((c: any) => c?.id).filter(Boolean) : [];
				if (ids.length) txnClientBatches.set(getGraphVersion(), ids);
			} catch {}
			applyDelta(msg);
			return;
		} else if (msg.type === 'ns:angular-update') {
			try {
				if (VERBOSE) console.log('[hmr-client][angular] update', msg);
				// Minimal safe policy for Angular today: if the app provides a bootstrap
				// factory via globalThis.__NS_ANGULAR_BOOTSTRAP__, perform a full root
				// replacement. Otherwise, log a guidance message.
				const g: any = globalThis as any;
				const App = getCore('Application') || g.Application;
				const bootstrap = g.__NS_ANGULAR_BOOTSTRAP__;
				if (typeof App?.resetRootView === 'function' && typeof bootstrap === 'function') {
					if (VERBOSE) console.log('[hmr-client][angular] resetRootView via bootstrap factory');
					try {
						(g as any).__NS_DEV_RESET_IN_PROGRESS__ = true;
					} catch {}
					App.resetRootView({ create: () => bootstrap() });
					setTimeout(() => {
						try {
							(g as any).__NS_DEV_RESET_IN_PROGRESS__ = false;
						} catch {}
					}, 0);
					return;
				}
				if (VERBOSE) console.warn('[hmr-client][angular] No __NS_ANGULAR_BOOTSTRAP__ factory found; consider exposing one from main.ts');
			} catch (e) {
				try {
					console.warn('[hmr-client][angular] failed to handle update', e && (e.message || e));
				} catch {}
			}
			return;
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
		try {
			const origin = msg.origin || getHttpOriginForVite() || deriveHttpOrigin(getHMRWsUrl());
			await handleCssUpdates(msg.updates, origin);
			return;
		} catch (e) {
			console.warn('[hmr-client] CSS updates handling failed:', e);
			return;
		}
	}
	if (msg.type === 'ns:vue-sfc-registry') {
		handleVueSfcRegistry(msg);
		return;
	}
	if (msg.type === 'ns:vue-sfc-registry-update') {
		if (typeof msg.version === 'number') setGraphVersion(msg.version);
		const comp = await handleVueSfcRegistryUpdate(msg, getGraphVersion());
		if (comp) {
			await performResetRoot(comp);
		}
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
			ensureVueGlobals();
			const comp = (globalThis as any).defineComponent
				? (globalThis as any).defineComponent({
						name: nameHint || input.name || 'AnonymousSFC',
						render: input,
					})
				: { name: nameHint || input.name || 'AnonymousSFC', render: input };
			return comp;
		}
		// If object has a render function property
		if ((input as any)?.render && typeof (input as any).render === 'function') {
			ensureVueGlobals();
			const comp = (globalThis as any).defineComponent
				? (globalThis as any).defineComponent({
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
		(globalThis as any).__NS_DEV_RESET_IN_PROGRESS__ = true;
	} catch {}
	try {
		ensureCoreAliasesOnGlobalThis();
	} catch {}
	try {
		if (VERBOSE) logUiSnapshot('pre-performResetRoot');
	} catch {}
	if (VERBOSE) {
		try {
			const g: any = globalThis as any;
			const vF = getCore('Frame');
			console.log('[hmr-client] alias check before remount', {
				globalFrameHasTopmost: typeof g?.Frame?.topmost === 'function',
				vendorFrameHasTopmost: typeof vF?.topmost === 'function',
				sameFrameRef: vF === g?.Frame,
				appHasReset: typeof g?.Application?.resetRootView === 'function',
				pageIsCtor: typeof g?.Page === 'function',
			});
		} catch {}
	}
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
					switch (__NS_TARGET_FLAVOR__) {
						case 'vue':
							cachedRoot = getRootForVue(newComponent, state);
							break;
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
	const App = getCore('Application') || (globalThis as any).Application;
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
		hadPlaceholder = !!(globalThis as any).__NS_DEV_PLACEHOLDER_ROOT_EARLY__;
	} catch {}
	try {
		const AppAny: any = getCore('Application') || (globalThis as any).Application;
		isIOS = !!(AppAny && (AppAny as any).ios !== undefined);
	} catch {}
	// Preferred policy:
	// - If this is the very first mount (placeholder present), or if the new root is a Frame,
	//   perform a full root replacement via resetRootView so we never couple with the placeholder.
	// - Otherwise (subsequent HMR updates with an authoritative Frame already in place), re-use the
	//   current app Frame and navigate to the new Page. This avoids a brief flash that can occur
	//   when swapping the entire root view on Android. The placeholder is never involved here.
	const gAnyForPolicy: any = globalThis as any;
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
	if (!hadPlaceholder && !isFrameRoot && isAuthoritativeFrame && typeof (existingAppFrame as any).navigate === 'function') {
		try {
			if (VERBOSE) console.log('[hmr-client] navigating authoritative app Frame to new Page (no placeholder, smooth swap)');
			try {
				attachDiagnosticsToFrame(existingAppFrame);
			} catch {}
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
		const App2 = getCore('Application') || (globalThis as any).Application;
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
						const g: any = globalThis as any;
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
						if (VERBOSE) console.log('[hmr-client] resetRootView:create navigated Frame');
					} catch (e) {
						console.warn('[hmr-client] resetRootView:create navigate failed', e);
					}
					try {
						attachDiagnosticsToFrame(fr);
					} catch {}
					setRootFrame(fr);
					try {
						(getRootFrame() as any).__ns_tag ||= Math.random().toString(36).slice(2);
						console.log('[diag][root] ROOT_FRAME set (new)', {
							tag: getRootFrame()?.__ns_tag,
							type: getRootFrame()?.constructor?.name,
						});
					} catch {}
					return fr;
				} else {
					const fr = preparedRoot;
					if (VERBOSE) console.log('[hmr-client] resetRootView:create using provided Frame', { type: fr?.constructor?.name });
					try {
						attachDiagnosticsToFrame(fr);
					} catch {}
					setRootFrame(fr);
					try {
						(getRootFrame() as any).__ns_tag ||= Math.random().toString(36).slice(2);
						console.log('[diag][root] ROOT_FRAME set (provided)', {
							tag: getRootFrame()?.__ns_tag,
							type: getRootFrame()?.constructor?.name,
						});
					} catch {}
					return fr;
				}
			},
		} as any;
		if (VERBOSE) console.log('[hmr-client] invoking Application.resetRootView with entry (always)', { isFrameRoot, hadPlaceholder, isIOS });
		// Always use an entry with a create() function to avoid cross‑realm instanceof checks on Android.
		App2.resetRootView(entry as any);
		// After authoritative reset, it's safe to detach the early placeholder launch handler
		try {
			const restore = (globalThis as any).__NS_DEV_RESTORE_PLACEHOLDER__;
			if (typeof restore === 'function') {
				if (VERBOSE) console.log('[hmr-client] restoring: detach early placeholder launch handler');
				restore();
			}
		} catch {}
		if (VERBOSE) {
			logUiSnapshot('post-resetRootView');
			console.log('[hmr-client] performResetRoot completed', {
				elapsedMs: Date.now() - tStart,
			});
		}
		return true;
	} catch (e) {
		console.warn('[hmr-client] resetRootView failed', e);
		try {
			if (VERBOSE) console.warn('[hmr-client] resetRootView stack', (e as any)?.stack);
		} catch {}
		return false;
	} finally {
		try {
			(globalThis as any).__NS_DEV_RESET_IN_PROGRESS__ = false;
		} catch {}
	}
}

export function initHmrClient(opts?: { wsUrl?: string }) {
	if (opts?.wsUrl) {
		setHMRWsUrl(opts.wsUrl);
	}
	if (VERBOSE) console.log('[hmr-client] Initializing Vue HMR client', getHMRWsUrl() ? `(ws: ${getHMRWsUrl()})` : '');
	// Prevent duplicate client initialization across re-evaluations
	const g: any = globalThis as any;
	if (g.__NS_HMR_CLIENT_ACTIVE__) {
		if (VERBOSE) console.log('[hmr-client] HMR client already active; skipping duplicate init');
		return;
	}
	g.__NS_HMR_CLIENT_ACTIVE__ = true;
	ensureCoreAliasesOnGlobalThis();
	connectHmr();
	// Best-effort: install back wrapper even before first remount; original root may be captured later
	switch (__NS_TARGET_FLAVOR__) {
		case 'vue':
			ensureBackWrapperInstalled(performResetRoot, getCore);
			break;
	}
}
export default function startViteHMR(opts?: { wsUrl?: string }) {
	if (VERBOSE) console.log('[hmr-client] Starting HMR client', opts);
	initHmrClient(opts);
}
