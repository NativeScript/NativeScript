import { assertNsDevSessionDescriptor, readNsRuntimeDevHostApi, type NsDevSessionDescriptor, type NsRuntimeDevHostApi } from './browser-runtime-contract.js';
import { BOOT_ARCHIVE_PATH, parseBootArchiveText } from './boot-archive-format.js';
import { ensureHmrDevOverlayRuntimeInstalled, setHmrBootStage } from './dev-overlay.js';
import { formatBootTimeline, publishBootTrace, type BootTrace } from './boot-timeline.js';
import { applyMonotonicBootProgress, clearBootProgressState, computeBootImportProgress, formatBootImportDetail } from './boot-progress.js';
import { getGlobalScope } from './global-scope.js';

function describeError(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}

// Cold-boot kickstart prefetch — always-on, list mode.
//
// The dev server owns the module graph, so it computes the entry's
// transitive closure (`/__ns_dev__/boot-closure`) and the bootstrap
// hands the explicit URL list to `__NS_DEV__.kickstartPrefetch(urls)`. The
// runtime fetches the whole list in one parallel wave (16-way) and
// pre-fills the loader's body cache before V8's synchronous
// `ResolveModuleCallback` walks the graph; each `HttpFetchText`
// resolves in microseconds instead of round-tripping HTTP.
//
// The iOS runtime pumps the JS-thread CFRunLoop in 50 ms slices during
// the wave so the placeholder heartbeat keeps ticking. Both the
// closure fetch and the kickstart are soft-fail — a missing endpoint or
// a runtime without the primitive just falls back to V8's sequential walk.
type KickstartResult = { ok: boolean; fetched: number; ms: number } | null;

async function fetchBootClosureUrls(origin: string, verbose?: boolean): Promise<string[]> {
	try {
		const closureUrl = `${origin.replace(/\/$/, '')}/__ns_dev__/boot-closure`;
		const response = await fetch(closureUrl);
		if (!response.ok) {
			if (verbose) console.info(`[ns-entry] boot-closure fetch failed (${response.status}); kickstart will be skipped`);
			return [];
		}
		const payload = await response.json();
		const urls = Array.isArray(payload?.urls) ? payload.urls : [];
		return urls.filter((u: unknown): u is string => typeof u === 'string' && /^https?:\/\//.test(u));
	} catch (error) {
		if (verbose) console.info('[ns-entry] boot-closure fetch threw; kickstart will be skipped', error);
		return [];
	}
}

// Boot-archive seeding: download `/__ns_dev__/boot-archive` (NDJSON of
// `{url, body}` lines) and seed every body into the native prewarm cache in
// one `seedModuleBodies` call. Soft-fail everywhere: a missing endpoint, an
// empty archive, or a seed that stores nothing returns null and the caller
// falls back to the kickstart wave.
type ArchiveSeedResult = { ok: boolean; seeded: number; bytes: number; ms: number } | null;

async function runBootArchiveSeed(origin: string, runtimeApi: NsRuntimeDevHostApi, verbose?: boolean): Promise<ArchiveSeedResult> {
	if (typeof runtimeApi.seedModuleBodies !== 'function') return null;
	const t0 = Date.now();
	try {
		const archiveUrl = `${origin.replace(/\/$/, '')}${BOOT_ARCHIVE_PATH}`;
		const response = await fetch(archiveUrl);
		if (!response.ok) {
			if (verbose) console.info(`[ns-entry] boot-archive fetch failed (${response.status}); falling back to kickstart`);
			return null;
		}
		const text = await response.text();
		const entries = parseBootArchiveText(text);
		if (!entries.length) {
			if (verbose) console.info('[ns-entry] boot-archive empty; falling back to kickstart');
			return null;
		}
		const result = runtimeApi.seedModuleBodies(entries);
		const seeded = Number(result?.seeded || 0);
		const bytes = Number(result?.bytes || 0);
		if (!result?.ok || !seeded) {
			if (verbose) console.info('[ns-entry] boot-archive seed stored nothing; falling back to kickstart');
			return null;
		}
		const ms = Date.now() - t0;
		if (verbose) {
			console.info(`[ns-entry] boot archive seeded ${seeded} bodies (${(bytes / 1024).toFixed(0)}kb) in ${ms}ms`);
		}
		return { ok: true, seeded, bytes, ms };
	} catch (error) {
		if (verbose) console.info('[ns-entry] boot-archive seed threw; falling back to kickstart', error);
		return null;
	}
}

function runColdBootKickstart(urls: readonly string[], runtimeApi: NsRuntimeDevHostApi, verbose?: boolean): KickstartResult {
	if (!urls.length) return null;
	if (typeof runtimeApi.kickstartPrefetch !== 'function') {
		if (verbose) {
			console.info('[ns-entry] cold-boot kickstart unavailable (__NS_DEV__.kickstartPrefetch not exposed); falling back to sequential V8 walk');
		}
		return null;
	}
	try {
		const t0 = Date.now();
		const result = runtimeApi.kickstartPrefetch(urls.slice(), { maxConcurrent: 16, timeoutMs: 30000 });
		const elapsed = Date.now() - t0;
		const fetched = Number(result?.fetched || 0);
		const ms = Number(result?.ms || elapsed);
		const ok = !!result?.ok;
		if (verbose) {
			console.info(`[ns-entry] cold-boot kickstart ${ok ? 'drained' : 'timed-out/partial'} urls=${urls.length} fetched=${fetched} ms=${ms} (wall=${elapsed}ms)`);
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
	await configureRuntimeImportMap(getRuntimeConfigUrl(session), runtimeApi, verbose);
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
			// Prewarm the native module-body cache before V8 walks the graph.
			// Preferred: the batch boot archive (one streamed download seeded
			// via `seedModuleBodies`). Fallback: the server-computed boot
			// closure → one parallel kickstart wave. Stamp the stage detail
			// only when the runtime will actually do prewarm work, otherwise
			// the placeholder would flash a misleading line.
			if (typeof runtimeApi.seedModuleBodies === 'function' || typeof runtimeApi.kickstartPrefetch === 'function') {
				setHmrBootStage('importing-main', {
					detail: `prefetching transitive imports for ${session.entryUrl}…`,
				});
				const archiveResult = await runBootArchiveSeed(session.origin, runtimeApi, verbose);
				if (archiveResult) {
					trace.kickstart = { ok: archiveResult.ok, ms: archiveResult.ms, meta: { mode: 'archive', seeded: archiveResult.seeded, bytes: archiveResult.bytes } };
				} else if (typeof runtimeApi.kickstartPrefetch === 'function') {
					const closureUrls = await fetchBootClosureUrls(session.origin, verbose);
					const kickstartResult = runColdBootKickstart(closureUrls, runtimeApi, verbose);
					if (kickstartResult) {
						trace.kickstart = { ok: kickstartResult.ok, ms: kickstartResult.ms, meta: { mode: 'kickstart', fetched: kickstartResult.fetched } };
					}
				}
			}
			// JS boot orchestration: dev client first (installs the hot
			// registry + fallback socket), then the app entry graph.
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
