import { assertNsDevSessionDescriptor, readNsRuntimeDevHostApi, type NsDevSessionDescriptor, type NsRuntimeDevHostApi } from './browser-runtime-contract.js';
import { ensureHmrDevOverlayRuntimeInstalled, setHmrBootStage } from './dev-overlay.js';
import { formatBootTimeline, publishBootTrace, type BootTrace } from './boot-timeline.js';
import { applyMonotonicBootProgress, clearBootProgressState, computeBootImportProgress, formatBootImportDetail } from './boot-progress.js';
import { getGlobalScope } from './global-scope.js';
import { installWorkerConstructorTracking } from './worker-tracking.js';

function describeError(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

// Cold-boot module-load progress heartbeat.
//
// The entry `import()` synchronously walks the module graph over HTTP.
// The iOS runtime's `MaybePumpJSThreadDuringBoot`
// (`HMRSupport.mm`) gives the JS-thread CFRunLoop a 1 ms slice between
// fetches so this 250 ms `setInterval` can fire and repaint the bar.
//
// Reads the snippet-written `__NS_HMR_BOOT_MODULE_COUNT__` /
// `__NS_HMR_BOOT_LAST_MODULE__` globals plus elapsed wall-clock since
// `__NS_HMR_BOOT_IMPORT_STARTED_AT__`, runs them through
// `computeBootImportProgress` + `applyMonotonicBootProgress` (so the
// bar never goes backwards when count temporarily wins over time), and
// re-asserts `'importing-main'` so only the progress + detail change.
// The wall-clock fallback covers long node_modules stretches where the
// snippet doesn't fire (the /ns/m route only injects it into app modules,
// never node_modules/library modules).
//
// Stopped in the caller's `finally` so it never races past
// `'waiting-for-app'` or stomps an `'error'` frame.
function startBootImportHeartbeat(startedAt: number, verbose?: boolean): () => void {
	let timer: ReturnType<typeof setInterval> | null = null;
	let stopped = false;
	try {
		timer = setInterval(() => {
			if (stopped) {
				return;
			}
			const g: any = getGlobalScope();
			if (g.__NS_HMR_BOOT_COMPLETE__) {
				return;
			}
			try {
				const count = Number(g.__NS_HMR_BOOT_MODULE_COUNT__ || 0);
				const lastModule = typeof g.__NS_HMR_BOOT_LAST_MODULE__ === 'string' ? g.__NS_HMR_BOOT_LAST_MODULE__ : '';
				const elapsedMs = Math.max(0, Date.now() - startedAt);
				const progress = applyMonotonicBootProgress(computeBootImportProgress({ count, elapsedMs }));
				const detail = formatBootImportDetail({ count, lastModule });
				setHmrBootStage('importing-main', { detail, progress });
			} catch (heartbeatErr) {
				if (verbose) {
					console.warn('[ns-entry] boot-progress heartbeat tick failed', heartbeatErr);
				}
			}
		}, 250);
	} catch (intervalErr) {
		if (verbose) {
			console.warn('[ns-entry] boot-progress heartbeat unavailable (setInterval threw)', intervalErr);
		}
		return () => {};
	}
	return () => {
		stopped = true;
		if (timer) {
			try {
				clearInterval(timer);
			} catch {}
			timer = null;
		}
	};
}

function getSessionUrl(defaultSessionUrl: string) {
	try {
		const origin = getGlobalScope().__NS_HTTP_ORIGIN__;
		if (typeof origin === 'string' && /^https?:\/\//.test(origin)) {
			return `${origin.replace(/\/$/, '')}/__ns_dev__/session`;
		}
	} catch {}

	return defaultSessionUrl;
}

function getRuntimeConfigUrl(session: NsDevSessionDescriptor) {
	if (typeof session.runtimeConfigUrl === 'string' && session.runtimeConfigUrl) {
		return session.runtimeConfigUrl;
	}

	return `${session.origin.replace(/\/$/, '')}/ns/import-map.json`;
}

async function configureLoaderImportMap(runtimeConfigUrl: string, runtimeApi: NsRuntimeDevHostApi, verbose?: boolean) {
	let configureLoader = runtimeApi.configureLoader;
	if (typeof configureLoader !== 'function') {
		// The caller may have captured a stale/empty API snapshot (e.g. a
		// test stub, or a capture taken before the realm was fully set up).
		// Re-resolve `ns:module` fresh — a stale `{}` snapshot must not
		// decide the fate of the whole dev session.
		configureLoader = readNsRuntimeDevHostApi(getGlobalScope()).configureLoader;
	}
	if (typeof configureLoader !== 'function') {
		// NOT verbose-gated on purpose. Without the import map, every bare
		// specifier in served modules (e.g. `@nativescript/core` inside the
		// vendor view) is unresolvable and the dev session degrades into an
		// undebuggable stall. Surface the contract violation loudly with the
		// remediation, then continue so file-based flows still work.
		console.error('[ns-entry] ns:module configureLoader is unavailable — the import map cannot be installed and bare-specifier imports WILL fail. Update @nativescript/ios to a runtime that provides the ns:module builtin module.');
		setHmrBootStage('configuring-import-map', {
			detail: 'runtime configure hook unavailable — import map skipped (bare imports will fail)',
		});
		return;
	}

	// Both the entry-runtime and session-bootstrap can call this; gate
	// on `__NS_IMPORT_MAP_CONFIGURED__` so the first writer wins and
	// subsequent calls short-circuit (saves one extra fetch per boot).
	const g = getGlobalScope();
	if (g.__NS_IMPORT_MAP_CONFIGURED__ === true) {
		if (verbose) {
			console.info('[ns-entry] import map already configured by an earlier boot stage; skipping fetch', {
				importMapUrl: runtimeConfigUrl,
			});
		}
		return;
	}

	setHmrBootStage('configuring-import-map', {
		detail: runtimeConfigUrl,
	});

	const response = await fetch(runtimeConfigUrl);
	if (!response.ok) {
		throw new Error(`NativeScript import map fetch failed: ${response.status}`);
	}

	const config = await response.json();
	if (!config || typeof config !== 'object' || !config.importMap || typeof config.importMap !== 'object') {
		throw new Error('Invalid NativeScript import map payload');
	}

	configureLoader({
		importMap: config.importMap,
		volatilePatterns: Array.isArray(config.volatilePatterns) ? config.volatilePatterns : [],
		// The canonicalization vocabulary (which query params are cache
		// busters, which path prefixes are dev endpoints, which paths keep
		// their query verbatim) is server policy — pass it through so the
		// runtime carries no URL vocabulary of its own. Runtimes that predate
		// the field ignore it.
		...(config.canonicalization && typeof config.canonicalization === 'object' ? { canonicalization: config.canonicalization } : {}),
	});
	try {
		g.__NS_IMPORT_MAP_CONFIGURED__ = true;
	} catch {}

	if (verbose) {
		console.info('[ns-entry] import map configured', {
			entries: Object.keys(config.importMap?.imports || {}).length,
			importMapUrl: runtimeConfigUrl,
		});
	}
}

async function prepareRuntimeForSession(session: NsDevSessionDescriptor, runtimeApi: NsRuntimeDevHostApi, verbose?: boolean) {
	await configureLoaderImportMap(getRuntimeConfigUrl(session), runtimeApi, verbose);
}

// Dynamic import with an overridable seam: hosts/tests can install
// `__NS_HMR_IMPORT__` (also used by the HMR clients) to observe or stub
// the module loads; otherwise this is a plain dynamic `import()` through
// the runtime's HTTP ESM loader.
function importModule(url: string): Promise<unknown> {
	const g: any = getGlobalScope();
	if (typeof g.__NS_HMR_IMPORT__ === 'function') {
		return g.__NS_HMR_IMPORT__(url);
	}
	return import(/* @vite-ignore */ url);
}

// Session globals — plain JS policy; the native runtime writes none of
// these.
function applyDevSessionGlobals(session: NsDevSessionDescriptor) {
	const g: any = getGlobalScope();
	try {
		g.__NS_HTTP_ORIGIN__ = session.origin;
	} catch {}
	try {
		g.__NS_HMR_WS_URL__ = session.wsUrl;
	} catch {}
	try {
		g.__NS_DEV_ENTRY_URL__ = session.entryUrl;
	} catch {}
	try {
		g.__NS_DEV_SESSION__ = { sessionId: session.sessionId, origin: session.origin, entryUrl: session.entryUrl, clientUrl: session.clientUrl, wsUrl: session.wsUrl, platform: session.platform };
	} catch {}
}

export async function startBrowserRuntimeSession(defaultSessionUrl: string, verbose?: boolean) {
	ensureHmrDevOverlayRuntimeInstalled(verbose);
	// Track every `Worker` construction from here on. Must run before the
	// dev client and the app entry graph evaluate so no spawn — framework,
	// app, or vendor — escapes the session-wide tracked set the HMR client
	// sweeps before framework reboots. Worker teardown is fully userland;
	// the runtime exposes no native member for it.
	installWorkerConstructorTracking(getGlobalScope(), { verbose });
	const sessionUrl = getSessionUrl(defaultSessionUrl);
	setHmrBootStage('probing-origin', {
		detail: sessionUrl,
	});

	if (verbose) {
		console.info('[ns-entry] starting browser runtime session', { sessionUrl });
	}

	// Boot timeline for the JS-orchestrated dev-session boot.
	// `entry-runtime.ts` carries its own log for the http-bootloader
	// fallback path.
	const trace: BootTrace = { t0: Date.now() };

	try {
		const tSession = Date.now();
		const response = await fetch(sessionUrl);
		if (!response.ok) {
			throw new Error(`NativeScript dev session fetch failed: ${response.status}`);
		}

		const session = (await response.json()) as NsDevSessionDescriptor;
		assertNsDevSessionDescriptor(session);
		trace.session = { ok: true, ms: Date.now() - tSession, meta: { sessionId: session.sessionId } };

		if (verbose) {
			console.info('[ns-entry] browser runtime session descriptor received', {
				sessionId: session.sessionId,
				origin: session.origin,
				clientUrl: session.clientUrl,
				entryUrl: session.entryUrl,
				wsUrl: session.wsUrl,
			});
		}

		const runtimeApi = readNsRuntimeDevHostApi(globalThis);

		const tImap = Date.now();
		const alreadyConfigured = getGlobalScope().__NS_IMPORT_MAP_CONFIGURED__ === true;
		await prepareRuntimeForSession(session, runtimeApi, verbose);
		// Skip the import-map segment when an earlier stage already did
		// the work (dedup path returns instantly with no I/O).
		if (!alreadyConfigured) {
			trace.importMap = { ok: true, ms: Date.now() - tImap };
		}

		// Session globals + arm the cold-boot gate (runloop pump between
		// synchronous fetches). `setDevBootComplete(false)` is a no-op on
		// a fresh realm but matters for re-bootstrapped sessions.
		applyDevSessionGlobals(session);
		try {
			runtimeApi.setDevBootComplete?.(false);
		} catch {}

		setHmrBootStage('loading-entry-runtime', {
			detail: session.clientUrl,
		});

		setHmrBootStage('importing-main', {
			detail: session.entryUrl,
		});
		// Reset boot-progress globals so a re-bootstrapped session
		// (`__reboot_ng_modules__`, dev-server restart) starts a fresh
		// ratchet, then stamp the time origin both the snippet and the
		// heartbeat share for elapsed-ms math.
		clearBootProgressState();
		const tBoot = Date.now();
		try {
			getGlobalScope().__NS_HMR_BOOT_IMPORT_STARTED_AT__ = tBoot;
		} catch {}
		const stopBootImportHeartbeat = startBootImportHeartbeat(tBoot, verbose);
		try {
			// No prewarm/seeding phase: the runtime's async module-graph walk
			// discovers and fetches the transitive closure itself (concurrent
			// NSURLSession fetches overlapped with on-device compile), which
			// measured faster than any server-computed closure/archive seeding.
			// JS boot orchestration: dev client first (installs the hot
			// registry + fallback socket), then the app entry graph.
			if (verbose) {
				console.info('[ns-entry] importing dev client + entry', {
					clientUrl: session.clientUrl,
					entryUrl: session.entryUrl,
				});
			}
			await importModule(session.clientUrl);
			// Deterministic point for the client's launch-notification bridge:
			// core is loaded (the boot placeholder uses Application) and the
			// app entry has NOT evaluated yet — app code registering
			// launch-time observers (UIApplicationDidFinishLaunchingNotification
			// gates around SDK init are common) is guaranteed to hit the
			// wrapped addNotificationObserver and get the missed one-shot
			// notification replayed. The client's own module-eval attempt can
			// lose this race (the vendor registry it resolves core through is
			// only populated by the client bootstrap).
			try {
				const installLaunchBridge = (getGlobalScope() as any).__NS_DEV_INSTALL_LAUNCH_BRIDGE__;
				if (typeof installLaunchBridge === 'function') {
					// Pass the /ns/core realm's Application explicitly — that is
					// the instance app code gets (its @nativescript/core imports
					// rewrite to the /ns/core bridge). The client's own lookup
					// prefers the vendor-registry realm, which can be a DIFFERENT
					// Application whose wrapped `.ios` the app never touches.
					let coreApplication: unknown;
					try {
						const coreNs: any = await importModule(new URL('/ns/core', session.origin).toString());
						coreApplication = (coreNs?.default ?? coreNs)?.Application ?? coreNs?.Application;
					} catch {}
					installLaunchBridge(coreApplication);
				}
			} catch {}
			await importModule(session.entryUrl);
		} finally {
			stopBootImportHeartbeat();
		}
		trace.entry = { ok: true, ms: Date.now() - tBoot };
		setHmrBootStage('waiting-for-app', {
			detail: 'The deterministic NativeScript dev session is active. Waiting for the real app root to replace the boot placeholder.',
		});
		try {
			const restorePlaceholder = getGlobalScope().__NS_DEV_RESTORE_PLACEHOLDER__;
			if (typeof restorePlaceholder === 'function') {
				restorePlaceholder('session-active');
			}
		} catch {}
		if (verbose) {
			console.info('[ns-entry] browser runtime session active; waiting for real app root commit', {
				sessionId: session.sessionId,
				origin: session.origin,
				clientUrl: session.clientUrl,
				entryUrl: session.entryUrl,
			});
		}
	} catch (error) {
		trace.error = { message: describeError(error) };
		setHmrBootStage('error', {
			detail: describeError(error),
		});
		if (verbose) {
			console.error('[ns-entry] browser runtime session failed', error instanceof Error && error.stack ? error.stack : error);
		}
		throw error;
	} finally {
		trace.t1 = Date.now();
		publishBootTrace(trace);
		// Trace is always stashed on `globalThis.__NS_BOOT_TRACE__` for
		// on-demand inspection; the human-readable line is verbose-only
		// so the dev console stays quiet by default.
		if (verbose) {
			console.info(formatBootTimeline(trace));
		}
	}
}
