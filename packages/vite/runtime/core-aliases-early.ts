import { getGlobalScope } from '../hmr/shared/runtime/global-scope.js';
// Early alias installer for @nativescript/core plus Android init resilience.
// Runs on device in the virtual entry context.

declare const android: any;
declare const __ANDROID__: boolean | undefined;

let androidInitPatched = false;

export function installCoreAliasesEarly(verbose?: boolean) {
	try {
		const g: any = getGlobalScope();
		type ResolvedModule = { value: any; via: string; moduleId: string };
		const resolveModule = (moduleIds: string[]): ResolvedModule | undefined => {
			for (const moduleId of moduleIds) {
				try {
					if (typeof g.moduleExists === 'function' && g.moduleExists(moduleId) && typeof g.loadModule === 'function') {
						const mod = g.loadModule(moduleId);
						if (mod) return { value: (mod.default ?? mod) || mod, via: 'loadModule', moduleId };
					}
				} catch {}
				try {
					const nr = g.__nativeRequire;
					if (typeof nr === 'function') {
						const mod = nr(moduleId, '/');
						if (mod) return { value: (mod.default ?? mod) || mod, via: '__nativeRequire', moduleId };
					}
				} catch {}
			}
			return undefined;
		};
		const getCore = (name: string): { value: any; source: string } => {
			if (name === 'Application' && g.Application && (typeof g.Application.run === 'function' || typeof g.Application.on === 'function' || typeof g.Application.resetRootView === 'function')) {
				return { value: g.Application, source: 'globalThis.Application' };
			}

			const pickApplicationApi = (candidate: any, source: string): { value: any; source: string } | null => {
				if (!candidate) return null;
				const candidates = [
					{ value: candidate, source },
					{ value: candidate.Application, source: `${source}#Application` },
					{ value: candidate.app, source: `${source}#app` },
					{ value: candidate.application, source: `${source}#application` },
				];
				for (const entry of candidates) {
					if (entry.value && (typeof entry.value.run === 'function' || typeof entry.value.on === 'function' || typeof entry.value.resetRootView === 'function')) {
						return entry;
					}
				}
				return null;
			};

			if (name === 'Application') {
				const applicationModule = resolveModule(['@nativescript/core/application']);
				const pickedFromAppModule = pickApplicationApi(applicationModule?.value, applicationModule ? `${applicationModule.via}:${applicationModule.moduleId}` : '@nativescript/core/application');
				if (pickedFromAppModule) return pickedFromAppModule;
			}

			const primary = resolveModule(['@nativescript/core']);
			if (name === 'Application' && primary?.value) {
				const pickedFromPrimary = pickApplicationApi(primary.value, `${primary.via}:${primary.moduleId}`);
				if (pickedFromPrimary) return pickedFromPrimary;
			}
			if (primary?.value && primary.value[name]) return { value: primary.value[name], source: `${primary.via}:${primary.moduleId}` };

			const ui = resolveModule(['@nativescript/core/ui']);
			if (ui?.value && ui.value[name]) return { value: ui.value[name], source: `${ui.via}:${ui.moduleId}` };

			return { value: undefined, source: 'unresolved' };
		};
		const resolutionStatus: Record<string, string> = {};

		for (const n of ['Application', 'Frame', 'Page']) {
			try {
				const resolved = getCore(n);
				const val = resolved.value;
				resolutionStatus[n] = resolved.source;
				const existing = g[n];
				const needs = !existing || (n === 'Frame' && typeof existing?.topmost !== 'function') || (n === 'Application' && (typeof existing?.run !== 'function' || typeof existing?.on !== 'function' || typeof existing?.resetRootView !== 'function')) || (n === 'Page' && !existing);
				if (val && needs) {
					g[n] = val;
					if (verbose) {
						console.info('[ns-entry] core alias (early)', n);
					}
				}
			} catch {}
		}
		if (verbose) {
			console.info('[ns-entry] core alias status (early)', {
				has: { Frame: !!g.Frame, Application: !!g.Application, Page: !!g.Page },
				resolution: resolutionStatus,
				moduleApis: {
					moduleExists: typeof g.moduleExists === 'function',
					loadModule: typeof g.loadModule === 'function',
					uiModuleRegistered: typeof g.moduleExists === 'function' ? !!g.moduleExists('@nativescript/core/ui') : false,
				},
				methods: { FrameTopmost: typeof g.Frame?.topmost === 'function', AppResetRoot: typeof g.Application?.resetRootView === 'function' },
			});
		}

		// Android-only resilience: patch AndroidApplication.init
		try {
			if (androidInitPatched) return;
			if (!((typeof __ANDROID__ !== 'undefined' && __ANDROID__) || typeof android !== 'undefined')) return;
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
							console.warn('[ns-entry][android] Application.init called with null and resolution failed; deferring.');
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
							console.info('[ns-entry][android] Application.init already initialized; continuing.');
						}
						return;
					}
					throw e;
				}
			};
			androidInitPatched = true;
			if (verbose) {
				console.info('[ns-entry] AndroidApplication.init patched for resilience');
			}
		} catch {}
	} catch {}
}
