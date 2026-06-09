import { assertNsDevSessionDescriptor, readNsRuntimeDevHostApi, type NsDevSessionDescriptor, type NsRuntimeDevHostApi } from './browser-runtime-contract.js';
import { ensureHmrDevOverlayRuntimeInstalled, setHmrBootStage } from './dev-overlay.js';
import { formatBootTimeline, publishBootTrace, type BootTrace } from './boot-timeline.js';
import { applyMonotonicBootProgress, clearBootProgressState, computeBootImportProgress, formatBootImportDetail } from './boot-progress.js';

function describeError(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

// Cold-boot kickstart prefetch — always-on.
//
// `__nsKickstartHmrPrefetch(seedUrl)` runs a 16-way parallel BFS over
// the entry URL's static-import closure and pre-fills the iOS loader's
// `g_prefetchCache` before V8's synchronous `ResolveModuleCallback`
// walks the graph. With the cache primed, each `HttpFetchText` resolves
// in microseconds instead of round-tripping HTTP, collapsing the walk
// from sequential ~13 ms × ~2,000 fetches to a single parallel wave.
//
// The iOS runtime's `KickstartRunSync` pumps the JS-thread CFRunLoop in
// 50 ms slices during the wait so the placeholder heartbeat keeps
// ticking; the bar climbs smoothly across the kickstart instead of
// freezing. Measured ~4 s wall-clock win on a ~2,200-module Angular
// cold boot. Soft-fail when the runtime doesn't expose
// `__nsKickstartHmrPrefetch` (V8 just falls back to sequential walk).
type KickstartResult = { ok: boolean; fetched: number; ms: number } | null;

function runColdBootKickstart(entryUrl: string, verbose?: boolean): KickstartResult {
	if (!entryUrl || typeof entryUrl !== 'string') return null;
	const g: any = globalThis as any;
	const fn = g.__nsKickstartHmrPrefetch;
	if (typeof fn !== 'function') {
		if (verbose) {
			console.info('[ns-entry] cold-boot kickstart unavailable (older runtime); falling back to sequential V8 walk');
		}
		return null;
	}
	try {
		const t0 = Date.now();
		const result = fn(entryUrl, { maxConcurrent: 16, timeoutMs: 30000 });
		const elapsed = Date.now() - t0;
		const fetched = Number(result?.fetched || 0);
		const ms = Number(result?.ms || elapsed);
		const ok = !!result?.ok;
		if (verbose) {
			console.info(`[ns-entry] cold-boot kickstart ${ok ? 'drained' : 'timed-out/partial'} fetched=${fetched} ms=${ms} (wall=${elapsed}ms)`);
		}
		return { ok, fetched, ms };
	} catch (kickErr) {
		if (verbose) {
			console.warn('[ns-entry] cold-boot kickstart threw; continuing with V8 sync walk', kickErr);
		}
		return null;
	}
}

// Cold-boot module-load progress heartbeat.
//
// `__nsStartDevSession` synchronously walks the entry's module graph
// over HTTP. The iOS runtime's `MaybePumpJSThreadDuringBoot`
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
// snippet doesn't fire (deliberate carve-out in `rewriteNsMImportPathForHmr`).
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
			const g: any = globalThis as any;
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
		const origin = (globalThis as any).__NS_HTTP_ORIGIN__;
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

function isNativeRuntimeConfigDelegationEnabled() {
	try {
		return (globalThis as any).__NS_EXPERIMENTAL_NATIVE_RUNTIME_CONFIG_URL__ === true;
	} catch {
		return false;
	}
}

async function configureRuntimeImportMap(runtimeConfigUrl: string, runtimeApi: NsRuntimeDevHostApi, verbose?: boolean) {
	if (typeof runtimeApi.configureRuntime !== 'function') {
		if (verbose) {
			console.info('[ns-entry] runtime configure hook unavailable; skipping import map bootstrap');
		}
		return;
	}

	// Both the entry-runtime and session-bootstrap can call this; gate
	// on `__NS_IMPORT_MAP_CONFIGURED__` so the first writer wins and
	// subsequent calls short-circuit (saves one extra fetch per boot).
	const g = globalThis as any;
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

	runtimeApi.configureRuntime({
		importMap: config.importMap,
		volatilePatterns: Array.isArray(config.volatilePatterns) ? config.volatilePatterns : [],
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
	if (session.runtimeConfigUrl && runtimeApi.supportsRuntimeConfigUrl && isNativeRuntimeConfigDelegationEnabled()) {
		if (verbose) {
			console.info('[ns-entry] runtime config delegated to native session start', {
				runtimeConfigUrl: session.runtimeConfigUrl,
			});
		}
		return;
	}

	await configureRuntimeImportMap(getRuntimeConfigUrl(session), runtimeApi, verbose);
}

export async function startBrowserRuntimeSession(defaultSessionUrl: string, verbose?: boolean) {
	ensureHmrDevOverlayRuntimeInstalled(verbose);
	const sessionUrl = getSessionUrl(defaultSessionUrl);
	setHmrBootStage('probing-origin', {
		detail: sessionUrl,
	});

	if (verbose) {
		console.info('[ns-entry] starting browser runtime session', { sessionUrl });
	}

	// Boot timeline for the native `__nsStartDevSession` path.
	// `entry-runtime.ts` carries its own log for the http-bootloader
	// fallback used when the native API isn't available.
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
		if (typeof runtimeApi.startDevSession !== 'function') {
			throw new Error('__nsStartDevSession is unavailable in the NativeScript runtime');
		}

		const tImap = Date.now();
		const alreadyConfigured = (globalThis as any).__NS_IMPORT_MAP_CONFIGURED__ === true;
		await prepareRuntimeForSession(session, runtimeApi, verbose);
		// Skip the import-map segment when an earlier stage already did
		// the work (dedup path returns instantly with no I/O).
		if (!alreadyConfigured) {
			trace.importMap = { ok: true, ms: Date.now() - tImap };
		}

		setHmrBootStage('loading-entry-runtime', {
			detail: session.clientUrl,
		});

		setHmrBootStage('importing-main', {
			detail: session.entryUrl,
		});
		if (verbose) {
			console.info('[ns-entry] invoking __nsStartDevSession', {
				sessionId: session.sessionId,
				clientUrl: session.clientUrl,
				entryUrl: session.entryUrl,
			});
		}
		// Reset boot-progress globals so a re-bootstrapped session
		// (`__reboot_ng_modules__`, dev-server restart) starts a fresh
		// ratchet, then stamp the time origin both the snippet and the
		// heartbeat share for elapsed-ms math.
		clearBootProgressState();
		const tNative = Date.now();
		try {
			(globalThis as any).__NS_HMR_BOOT_IMPORT_STARTED_AT__ = tNative;
		} catch {}
		const stopBootImportHeartbeat = startBootImportHeartbeat(tNative, verbose);
		try {
			// Stamp the kickstart detail only when the runtime will
			// actually run the prefetch, otherwise the placeholder would
			// flash a misleading line on older runtimes.
			if (typeof (globalThis as any).__nsKickstartHmrPrefetch === 'function') {
				setHmrBootStage('importing-main', {
					detail: `prefetching transitive imports for ${session.entryUrl}…`,
				});
			}
			const kickstartResult = runColdBootKickstart(session.entryUrl, verbose);
			if (kickstartResult) {
				trace.kickstart = { ok: kickstartResult.ok, ms: kickstartResult.ms, meta: { fetched: kickstartResult.fetched } };
			}
			await runtimeApi.startDevSession(session);
		} finally {
			stopBootImportHeartbeat();
		}
		trace.native = { ok: true, ms: Date.now() - tNative };
		setHmrBootStage('waiting-for-app', {
			detail: 'The deterministic NativeScript dev session is active. Waiting for the real app root to replace the boot placeholder.',
		});
		try {
			const restorePlaceholder = (globalThis as any).__NS_DEV_RESTORE_PLACEHOLDER__;
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
