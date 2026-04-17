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
		const ActivityIndicator = getCore('ActivityIndicator');
		if (!Application || !Frame || !Page || !Label) {
			if (verbose) console.warn('[ns-placeholder] core classes unavailable');
			return;
		}

		let handlerFired = false;

		// launchEvent handler: provides a placeholder root, then patches Application.run
		const __ns_launch_handler = (args?: any) => {
			try {
				const prev = args?.root;
				if (!prev && Frame && Page && Label) {
					const StackLayout = getCore('StackLayout');
					const page = new Page();
					page.actionBarHidden = true;

					const titleLabel = new Label();
					titleLabel.text = 'Starting NativeScript + Vite dev server…';
					titleLabel.textAlignment = 'center';
					titleLabel.textWrap = true;
					titleLabel.fontSize = 20;

					const statusLabel = new Label();
					statusLabel.text = 'Preparing the HTTP HMR bootstrap (4%)';
					statusLabel.textAlignment = 'center';
					statusLabel.textWrap = true;
					statusLabel.fontSize = 14;
					statusLabel.marginTop = 12;

					const activityIndicator = ActivityIndicator
						? (() => {
								const indicator = new ActivityIndicator();
								indicator.busy = true;
								indicator.marginTop = 16;
								indicator.width = 28;
								indicator.height = 28;
								indicator.horizontalAlignment = 'center';
								return indicator;
							})()
						: null;

					if (StackLayout) {
						const root = new StackLayout();
						root.padding = 24;
						root.verticalAlignment = 'middle';
						root.horizontalAlignment = 'center';
						root.addChild(titleLabel);
						root.addChild(statusLabel);
						if (activityIndicator) {
							root.addChild(activityIndicator);
						}
						page.content = root;
					} else {
						// Fallback: just show the title label centered
						titleLabel.verticalAlignment = 'middle';
						titleLabel.horizontalAlignment = 'center';
						titleLabel.width = 280;
						titleLabel.padding = 12;
						page.content = titleLabel;
					}

					// Store refs so the overlay API can update the status label
					g['__NS_DEV_BOOT_STATUS_LABEL__'] = statusLabel;
					g['__NS_DEV_BOOT_ACTIVITY_INDICATOR__'] = activityIndicator;

					const frame = new Frame();
					frame.navigate({ create: () => page, clearHistory: true, animated: false });
					try {
						(frame as any).__ns_dev_placeholder = true;
						(page as any).__ns_dev_placeholder = true;
						g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'] = frame;
					} catch {}
					if (args) args.root = frame;
				}
			} catch (e) {
				console.error('[ns-placeholder] root error', e);
			}

			if (!handlerFired) {
				handlerFired = true;

				// Patch Application.run() → resetRootView() for subsequent calls.
				// The app lifecycle is now running — a second run() is undefined
				// behavior, but resetRootView() is the documented API for
				// replacing the root of a running app.
				//
				// Patch on ALL possible references. The vendor-registry Application,
				// globalThis.Application, and the prototype may be different objects.
				try {
					if (Application && typeof (Application as any).run === 'function') {
						const _originalRun = (Application as any).run.bind(Application);
						g['__NS_DEV_ORIGINAL_APP_RUN__'] = _originalRun;
						const __ns_dev_patched_run = function __ns_dev_patched_run(entry?: any) {
							try {
								// Clean up: remove launchEvent handler and placeholder references
								try {
									if (Application && (Application as any).off) {
										(Application as any).off((Application as any).launchEvent, __ns_launch_handler);
									}
								} catch {}
								delete g['__NS_DEV_PLACEHOLDER_ROOT_VIEW__'];
								delete g['__NS_DEV_PLACEHOLDER_ROOT_EARLY__'];

								// When entry is undefined/null, the calling framework (e.g. Angular)
								// manages root views itself via launch events and resetRootView().
								// Don't attempt resetRootView(undefined) which throws "Main entry is missing".
								if (!entry) {
									if (verbose) console.info('[ns-placeholder] patched run() called with no entry; framework manages root view');
									return;
								}

								const isModuleNameEntry = entry && entry.moduleName && !entry.create;
								if (isModuleNameEntry) {
									if (typeof (Application as any).resetRootView === 'function') {
										(Application as any).resetRootView(entry);
									}
								} else {
									// Framework path: two-phase boot with dominative document
									(Application as any)._rootView = null;

									try {
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
											(Application as any).resetRootView({ create: () => doc });
											if (entry && typeof entry.create === 'function') {
												entry.create();
											}
										} else {
											if (typeof (Application as any).resetRootView === 'function') {
												(Application as any).resetRootView(entry);
											}
										}
									} catch (e2: any) {
										if (verbose) console.warn('[ns-placeholder] two-phase boot failed:', e2?.message || e2);
										try {
											if (typeof (Application as any).resetRootView === 'function') {
												(Application as any).resetRootView(entry);
											}
										} catch {}
									}
								}
							} catch (e) {
								console.warn('[ns-placeholder] patched run() error:', e);
							}
						};
						(Application as any).run = __ns_dev_patched_run;
						if (g.Application && g.Application !== Application) {
							g.Application.run = __ns_dev_patched_run;
						}
						try {
							const proto = Object.getPrototypeOf(Application);
							if (proto && typeof proto.run === 'function' && proto.run !== __ns_dev_patched_run) {
								proto.run = __ns_dev_patched_run;
							}
						} catch {}
					}
				} catch {}
			}
		};

		try {
			if (Application && (Application as any).on) {
				(Application as any).on((Application as any).launchEvent, __ns_launch_handler);
			}
		} catch {}

		// Determine boot path
		try {
			if (Application && typeof (Application as any).run === 'function') {
				const nativeApp = (Application as any).nativeApp;
				const iosNativeApp = (Application as any).ios?.nativeApp;
				if (nativeApp || iosNativeApp) {
					// App already running (v9 runtime) — skip Application.run() to avoid
					// runAsEmbeddedApp's modal presentViewController.
					try {
						__ns_launch_handler();
					} catch {}
				} else {
					(Application as any).run();
				}
			}
		} catch (e) {
			console.warn('[ns-placeholder] boot error', e);
		}
	} catch (e) {
		console.error('[ns-placeholder] install failed', e);
	}
}
