// Early alias installer for @nativescript/core plus Android init resilience.
// Runs on device in the virtual entry context.

declare const android: any;

export function installCoreAliasesEarly(verbose?: boolean) {
	try {
		const g: any = globalThis as any;
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

		for (const n of ['Application', 'Frame', 'Page']) {
			try {
				const val = getCore(n);
				const existing = g[n];
				const needs = !existing || (n === 'Frame' && typeof existing?.topmost !== 'function') || (n === 'Application' && !existing) || (n === 'Page' && !existing);
				if (val && needs) {
					g[n] = val;
					if (verbose) {
						try {
							console.info('[ns-entry] core alias (early)', n);
						} catch {}
					}
				}
			} catch {}
		}
		if (verbose) {
			try {
				console.info('[ns-entry] core alias status (early)', {
					has: { Frame: !!g.Frame, Application: !!g.Application, Page: !!g.Page },
					methods: { FrameTopmost: typeof g.Frame?.topmost === 'function', AppResetRoot: typeof g.Application?.resetRootView === 'function' },
				});
			} catch {}
		}

		// Android-only resilience: patch AndroidApplication.init
		try {
			if (g['__NS_DEV_PATCHED_ANDROID_INIT__']) return;
			if (!(g.__ANDROID__ || typeof android !== 'undefined')) return;
			const App = g.Application;
			if (!App) return;
			const proto = Object.getPrototypeOf(App);
			if (!proto) return;
			const orig = proto.init;
			if (typeof orig !== 'function') return;
			const telemetryEnabled = !!g['__NS_DEV_TELEMETRY__'] || !!verbose;
			function __ns_getTelemetry() {
				if (!telemetryEnabled) return null as any;
				try {
					if (!g['__NS_TELEMETRY__']) {
						g['__NS_TELEMETRY__'] = {};
					}
					const root = g['__NS_TELEMETRY__'];
					if (!root.androidInit) {
						root.androidInit = { calls: 0, fallbackSuccess: 0, nullDefers: 0, duplicates: 0, resolvedBy: { nativeScriptApp: 0, applicationHolder: 0, activityThread: 0 } };
					}
					return root.androidInit;
				} catch {
					return null as any;
				}
			}
			function __ns_tryResolveAndroidApp() {
				try {
					if (g.com?.tns?.NativeScriptApplication?.getInstance) {
						const inst = g.com.tns.NativeScriptApplication.getInstance();
						if (inst) {
							try {
								const t = __ns_getTelemetry();
								if (t) t.resolvedBy.nativeScriptApp++;
							} catch {}
							return inst;
						}
					}
				} catch {}
				try {
					if (g.com?.tns?.embedding?.ApplicationHolder?.getInstance) {
						const inst = g.com.tns.embedding.ApplicationHolder.getInstance();
						if (inst) {
							try {
								const t = __ns_getTelemetry();
								if (t) t.resolvedBy.applicationHolder++;
							} catch {}
							return inst;
						}
					}
				} catch {}
				try {
					const clazz = g.java?.lang?.Class?.forName && g.java.lang.Class.forName('android.app.ActivityThread');
					if (clazz) {
						const method = clazz.getMethod('currentApplication', null);
						if (method) {
							const inst = method.invoke(null, null);
							if (inst) {
								try {
									const t = __ns_getTelemetry();
									if (t) t.resolvedBy.activityThread++;
								} catch {}
								return inst;
							}
						}
					}
				} catch {}
				return undefined;
			}
			proto.init = function __ns_safe_android_init(nativeApp: any) {
				try {
					try {
						__ns_getTelemetry() && __ns_getTelemetry().calls++;
					} catch {}
					let appArg = nativeApp;
					if (!appArg) appArg = __ns_tryResolveAndroidApp();
					if (!appArg) {
						try {
							__ns_getTelemetry() && __ns_getTelemetry().nullDefers++;
						} catch {}
						if (verbose) {
							try {
								console.warn('[ns-entry][android] Application.init called with null and resolution failed; deferring.');
							} catch {}
						}
						return;
					}
					if (!nativeApp) {
						try {
							__ns_getTelemetry() && __ns_getTelemetry().fallbackSuccess++;
						} catch {}
					}
					return orig.call(this, appArg);
				} catch (e: any) {
					const msg = (e && (e.message || e)) + '';
					if (msg && msg.indexOf('already initialized') !== -1) {
						try {
							__ns_getTelemetry() && __ns_getTelemetry().duplicates++;
						} catch {}
						if (verbose) {
							try {
								console.info('[ns-entry][android] Application.init already initialized; continuing.');
							} catch {}
						}
						return;
					}
					throw e;
				}
			};
			try {
				g['__NS_DEV_PATCHED_ANDROID_INIT__'] = true;
			} catch {}
			if (verbose) {
				try {
					console.info('[ns-entry] AndroidApplication.init patched for resilience');
				} catch {}
			}
		} catch {}

		// Android-only: wrap Application.resetRootView to defer until Activity is ready during early HTTP boot
		try {
			const App: any = g.Application;
			if (App && (g.__ANDROID__ || typeof android !== 'undefined')) {
				const proto = Object.getPrototypeOf(App);
				const origReset = (App && App.resetRootView) || (proto && proto.resetRootView);
				if (typeof origReset === 'function' && !g['__NS_DEV_PATCHED_RESET_ROOT__']) {
					const isReady = () => {
						try {
							const a: any = App.android;
							return !!(a && (a.foregroundActivity || a.startActivity));
						} catch {
							return false;
						}
					};
					const once = (fn: () => void, timeoutMs = 6000) => {
						try {
							const a: any = App.android;
							if (!a || typeof a.on !== 'function' || typeof a.off !== 'function') {
								// Fallback polling if events API not ready
								const start = Date.now();
								const tick = () => {
									if (isReady() || Date.now() - start > timeoutMs) return fn();
									setTimeout(tick, 60);
								};
								return tick();
							}
							let done = false;
							const finish = () => {
								if (done) return;
								done = true;
								try {
									a.off(a.activityStartedEvent || 'activityStarted', onAny);
									a.off(a.activityResumedEvent || 'activityResumed', onAny);
								} catch {}
								fn();
							};
							const onAny = () => {
								if (isReady()) finish();
							};
							a.on(a.activityStartedEvent || 'activityStarted', onAny);
							a.on(a.activityResumedEvent || 'activityResumed', onAny);
							setTimeout(finish, timeoutMs);
						} catch {
							fn();
						}
					};
					const patched = function __ns_safe_resetRootView(this: any, entry: any) {
						if (!isReady()) {
							if (verbose) {
								try {
									console.info('[ns-entry][android] deferring resetRootView until activity is ready');
								} catch {}
							}
							return once(() => {
								try {
									origReset.call(this, entry);
									try {
										const restore = g['__NS_DEV_RESTORE_PLACEHOLDER__'];
										if (typeof restore === 'function') restore();
									} catch {}
								} catch (e) {
									try {
										console.error('[ns-entry][android] deferred resetRootView failed', e);
									} catch {}
									throw e;
								}
							});
						}
						try {
							const res = origReset.call(this, entry);
							try {
								const restore = g['__NS_DEV_RESTORE_PLACEHOLDER__'];
								if (typeof restore === 'function') restore();
							} catch {}
							return res;
						} catch (e) {
							throw e;
						}
					} as any;
					try {
						App.resetRootView = patched;
					} catch {}
					try {
						if (proto && typeof proto === 'object') (proto as any).resetRootView = patched;
					} catch {}
					try {
						g['__NS_DEV_PATCHED_RESET_ROOT__'] = true;
					} catch {}
					if (verbose) {
						try {
							console.info('[ns-entry] Application.resetRootView patched for early-boot readiness');
						} catch {}
					}
				}
			}
		} catch {}
	} catch {}
}
