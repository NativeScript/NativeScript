import { assertNsDevSessionDescriptor, readNsRuntimeDevHostApi, type NsDevSessionDescriptor, type NsRuntimeDevHostApi } from './browser-runtime-contract.js';
import { ensureHmrDevOverlayRuntimeInstalled, setHmrBootStage } from './dev-overlay.js';
import { formatBootTimeline, type BootTrace } from './boot-timeline.js';
import { applyMonotonicBootProgress, BOOT_IMPORT_DETAIL, clearBootProgressState, computeBootImportProgress } from './boot-progress.js';
import { getGlobalScope } from './global-scope.js';
import { nsDev } from './dev-globals.js';
import { installWorkerConstructorTracking } from './worker-tracking.js';
import { restorePlaceholder } from './placeholder-hooks.js';

let importMapConfigured = false;

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
// Drives the bar from elapsed wall-clock time through
// `computeBootImportProgress` + `applyMonotonicBootProgress` and
// re-asserts `'importing-main'` so only the progress changes.
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
			if (nsDev().bootComplete) {
				return;
			}
			try {
				const progress = applyMonotonicBootProgress(computeBootImportProgress(Date.now() - startedAt));
				setHmrBootStage('importing-main', { detail: BOOT_IMPORT_DETAIL, progress });
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
		const origin = nsDev().httpOrigin;
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

	return `${session.origin.replace(/\/$/, '')}/__ns_dev__/import-map.json`;
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

	// The first configure wins; later calls short-circuit (saves one extra
	// fetch per boot).
	if (importMapConfigured) {
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
	importMapConfigured = true;

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
// `__NS_HMR_IMPORT__` to observe or stub the module loads; otherwise this is
// a plain dynamic `import()` through the runtime's HTTP ESM loader.
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
	nsDev().httpOrigin = session.origin;
}

export async function startBrowserRuntimeSession(defaultSessionUrl: string, verbose?: boolean) {
	ensureHmrDevOverlayRuntimeInstalled(verbose);
	// Track every `Worker` construction from here on. Must run before the
	// dev client and the app entry graph evaluate so no spawn — framework,
	// app, or vendor — escapes the session-wide tracked set the HMR client
	// sweeps during a full reload. Worker teardown is fully userland;
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
		const alreadyConfigured = importMapConfigured;
		await prepareRuntimeForSession(session, runtimeApi, verbose);
		// Skip the import-map segment when an earlier stage already did
		// the work (dedup path returns instantly with no I/O).
		if (!alreadyConfigured) {
			trace.importMap = { ok: true, ms: Date.now() - tImap };
		}

		// Session globals. `setDevBootComplete` only exists on runtimes that
		// still let the client arm their cold-boot gate; current runtimes derive
		// that window natively and expose no such member.
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
		// A re-bootstrapped session starts a fresh progress ratchet.
		clearBootProgressState();
		const tBoot = Date.now();
		const stopBootImportHeartbeat = startBootImportHeartbeat(tBoot, verbose);
		try {
			// No prewarm/seeding phase: the runtime's async module-graph walk
			// discovers and fetches the transitive closure itself (concurrent
			// NSURLSession fetches overlapped with on-device compile), which
			// measured faster than any server-computed closure/archive seeding.
			// The dev client bootstrap runs first: it installs what must
			// precede app code (launch-notification bridge, bundled app.css).
			if (verbose) {
				console.info('[ns-entry] importing dev client + entry', {
					clientUrl: session.clientUrl,
					entryUrl: session.entryUrl,
				});
			}
			await importModule(session.clientUrl);
			await importModule(session.entryUrl);
		} finally {
			stopBootImportHeartbeat();
		}
		trace.entry = { ok: true, ms: Date.now() - tBoot };
		setHmrBootStage('waiting-for-app', {
			detail: 'The deterministic NativeScript dev session is active. Waiting for the real app root to replace the boot placeholder.',
		});
		try {
			restorePlaceholder('session-active');
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
		if (verbose) {
			console.info(formatBootTimeline(trace));
		}
	}
}
