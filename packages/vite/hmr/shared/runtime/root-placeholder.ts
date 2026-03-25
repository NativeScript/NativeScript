// Root placeholder installer used during dev HMR until HTTP ESM loads.
//
// Architecture:
//   1. Install a launchEvent handler that provides a placeholder Frame/Page
//   2. Call Application.run() to start the iOS lifecycle (required or app terminates)
//   3. Inside the handler (after root is set), patch Application.run so subsequent
//      calls (from the real app module) become Application.resetRootView()
//
// This means the app's entry (e.g., index.ts) can call Application.run({ create })
// exactly as it would in production — the patch intercepts it and does a clean
// root replacement instead of fighting the already-running lifecycle.

export function installRootPlaceholder(verbose?: boolean) {
	const g: any = globalThis as any;
	if (g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__']) return;
	g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'] = true;
	try {
		const getCore = (name: string): any => {
			try {
				const reg = g.__nsVendorRegistry;
				const req = reg?.get ? g.__nsVendorRequire || g.__nsRequire || g.require : g.__nsRequire || g.require;
				let mod: any = null;
				if (reg && reg.has('@nativescript/core')) mod = reg.get('@nativescript/core');
				else if (typeof req === 'function') {
					try {
						mod = req('@nativescript/core');
					} catch {}
				}
				const ns = (mod && (mod.default ?? mod)) || mod;
				if (name === 'Application' && ns && (ns.Application || ns)) return ns.Application || ns;
				if (ns && ns[name]) return ns[name];
			} catch {}
			try {
				const nr = g.__nativeRequire;
				if (typeof nr === 'function') {
					try {
						const mod = nr('@nativescript/core', '/');
						const ns = (mod && (mod.default ?? mod)) || mod;
						if (name === 'Application' && ns && (ns.Application || ns)) return ns.Application || ns;
						if (ns && ns[name]) return ns[name];
					} catch {}
				}
			} catch {}
			return undefined;
		};
		const Application = getCore('Application');
		const Frame = getCore('Frame');
		const Page = getCore('Page');
		const Label = getCore('Label');
		if (!Application || !Frame || !Page || !Label) {
			try {
				console.warn('[ns-entry] (early) core classes unavailable for placeholder');
			} catch {}
		}

		let handlerFired = false;

		// launchEvent handler: provides a placeholder root, then patches Application.run
		const __ns_launch_handler = (args?: any) => {
			try {
				const prev = args?.root;
				if (verbose) console.info('[ns-entry] (early) launchEvent fired; existing root:', !!prev);
				if (!prev && Frame && Page && Label) {
					const page = new Page();
					page.actionBarHidden = true;
					const label = new Label();
					label.text = 'Starting NativeScript + Vite dev server…';
					label.textAlignment = 'center';
					label.padding = 12;
					page.content = label;
					const frame = new Frame();
					frame.navigate({ create: () => page, clearHistory: true, animated: false });
					try {
						(frame as any).__ns_dev_placeholder = true;
						(page as any).__ns_dev_placeholder = true;
						g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'] = frame;
					} catch {}
					if (args) args.root = frame;
					if (verbose) console.info('[ns-entry] (early) temporary root provided via launch args');
				}
			} catch (e) {
				try {
					console.error('[ns-entry] (early) temp root error', e);
				} catch {}
			}

			// After the root is set, patch Application.run for the app module.
			// NOTE: Do NOT remove this handler — iOS fires launchEvent multiple
			// times (multi-window/scene). The handler is idempotent (only sets
			// root when none exists), so it's safe to keep attached.
			if (!handlerFired) {
				handlerFired = true;

				// Patch Application.run() → resetRootView() for subsequent calls.
				// The app lifecycle is now running — a second run() is undefined
				// behavior, but resetRootView() is the documented API for
				// replacing the root of a running app.
				try {
					if (Application && typeof (Application as any).run === 'function') {
						const _originalRun = (Application as any).run.bind(Application);
						g['__NS_DEV_ORIGINAL_APP_RUN__'] = _originalRun;
						(Application as any).run = function __ns_dev_patched_run(entry?: any) {
							if (verbose) console.info('[ns-entry] (patched) Application.run() intercepted');
							try {
								// Clean up: remove launchEvent handler and placeholder references
								try {
									if (Application && (Application as any).off) {
										(Application as any).off((Application as any).launchEvent, __ns_launch_handler);
									}
								} catch {}
								try {
									delete g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'];
								} catch {}
								try {
									delete g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'];
								} catch {}

								// Clear _rootView so setWindowContent won't call
								// _onRootViewReset on the placeholder.
								try {
									(Application as any)._rootView = null;
								} catch {}

								// Key insight: Frame.navigate() is called during render(),
								// which happens inside entry.create(). If the Frame isn't
								// in the native view hierarchy when navigate runs, the
								// UINavigationController push doesn't display.
								//
								// Solution: get the dominative document (which is a singleton
								// ContentView), set it as root FIRST (empty), then call
								// entry.create() which renders into the now-attached document.
								// This way Frame.onLoaded() fires after it's in the window.
								try {
									// Import the dominative document singleton.
									// The app's create() does: render(App, document.body); return document;
									// We need that same document reference.
									const domModule =
										g.__nsVendorRegistry?.get?.('dominative') ||
										(typeof require === 'function'
											? (() => {
													try {
														return require('dominative');
													} catch {
														return null;
													}
												})()
											: null);
									const doc = domModule?.document;

									if (doc && typeof (Application as any).resetRootView === 'function') {
										// Set the empty document as root.
										// This attaches the native view hierarchy to the window.
										if (verbose) console.info('[ns-entry] (patched) setting empty document as root');
										(Application as any).resetRootView({ create: () => doc });

										// Call the app's create() which renders into
										// the now-attached document. Frame.navigate() will work
										// because the Frame's UINavigationController is already
										// in the window's view hierarchy.
										if (verbose) console.info('[ns-entry] (patched) calling entry.create() to render app');
										if (entry && typeof entry.create === 'function') {
											const result = entry.create();
											if (verbose) console.info('[ns-entry] (patched) entry.create() returned', result ? typeof result : 'falsy', result?.constructor?.name || '');
										}
										if (verbose) console.info('[ns-entry] (patched) app render complete');
									} else {
										// Fallback: no dominative document accessible, use standard resetRootView
										if (verbose) console.warn('[ns-entry] (patched) dominative document not found, falling back to standard resetRootView');
										if (typeof (Application as any).resetRootView === 'function') {
											(Application as any).resetRootView(entry);
										}
									}
								} catch (e2: any) {
									console.warn('[ns-entry] (patched) two-phase boot failed:', e2?.message || e2);
									try {
										console.warn('[ns-entry] (patched) two-phase stack:', e2?.stack || '(no stack)');
									} catch {}
									// Fallback: skip two-phase, use direct resetRootView.
									// We must still attempt the fallback so the app can render.
									try {
										if (typeof (Application as any).resetRootView === 'function') {
											if (verbose) console.info('[ns-entry] (patched) fallback: resetRootView(entry)');
											(Application as any).resetRootView(entry);
											if (verbose) console.info('[ns-entry] (patched) fallback: resetRootView complete');
										}
									} catch (e3: any) {
										console.error('[ns-entry] (patched) fallback also failed:', e3?.message || e3);
										try {
											console.error('[ns-entry] (patched) fallback stack:', e3?.stack || '(no stack)');
										} catch {}
									}
								}
							} catch (e) {
								try {
									console.warn('[ns-entry] (patched) Application.run() error:', e);
								} catch {}
							}
						};
					}
				} catch {}
			}
		};

		try {
			if (Application && (Application as any).on) {
				(Application as any).on((Application as any).launchEvent, __ns_launch_handler);
			}
		} catch {}

		// Start the native app lifecycle with the placeholder root.
		// iOS requires a root view controller immediately or terminates.
		// The launchEvent fires during this call (via didFinishLaunchingWithOptions),
		// which triggers __ns_launch_handler to set the root and patch Application.run.
		try {
			if (Application && typeof (Application as any).run === 'function') {
				if (verbose) console.info('[ns-entry] (early) calling Application.run() for placeholder');
				(Application as any).run();
			}
		} catch (e) {
			try {
				if (verbose) console.warn('[ns-entry] (early) Application.run() placeholder error', e);
			} catch {}
		}
	} catch (e) {
		try {
			console.error('[ns-entry] (early) failed to install placeholder', e);
		} catch {}
	}
}
