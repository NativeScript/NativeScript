/**
 * Root-view replacement — the "make the new code visible" half of an HMR cycle.
 *
 * `performResetRoot` swaps the app's root for a freshly-created component
 * (delegating construction to the flavor strategy's `createRoot`). Two paths:
 * an in-place `Frame.navigate` fast path for subsequent updates, and a full
 * `Application.resetRootView` for first mount / Frame roots / flavors that
 * opt out of the fast path.
 *
 * Realm rule applies here as everywhere in the client: core classes are
 * resolved through `getCore` / the vendor realm at call time, never via static
 * `@nativescript/core` imports.
 */

import { getRootFrame, setRootFrame, getCore, ENV_VERBOSE } from './utils.js';
import { getGlobalScope } from '../shared/runtime/global-scope.js';
import { resolveVendorModule } from '../shared/runtime/vendor-resolve.js';
import { getClientStrategy } from './strategy-loader.js';

const VERBOSE = ENV_VERBOSE;

// Ensure core aliases are present on globalThis early so that /ns/rt exports resolve to functions
// before any SFCs are evaluated during HTTP-only dev boot.
export function ensureCoreAliasesOnGlobalThis() {
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

export async function performResetRoot(newComponent: any): Promise<boolean> {
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
					const strategy = getClientStrategy();
					if (strategy?.createRoot) {
						// Vue mounts an app root; TypeScript/React treat the component
						// as a factory or direct NS view (and may flip rootKind to
						// 'frame' via `state`).
						cachedRoot = strategy.createRoot(newComponent, state);
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
	const allowNavigateFastPath = getClientStrategy()?.allowNavigateFastPath ?? true;
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
						const helpers: any = resolveVendorModule('@nativescript/core/application/helpers-common');
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
