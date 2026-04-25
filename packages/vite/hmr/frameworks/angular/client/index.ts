declare const __NS_ENV_VERBOSE__: boolean | undefined;
declare const __NS_APP_ROOT_VIRTUAL__: string | undefined;
declare const __NS_HMR_PROGRESS_OVERLAY_ENABLED__: boolean | undefined;

type GetCoreFn = (name: string) => any;

// Round-eleven.3 (alpha.62) — HMR-applying progress overlay.
//
// We route progress through `globalThis.__NS_HMR_DEV_OVERLAY__`
// instead of importing the overlay module directly. This mirrors how
// `client/index.ts` drives the connection overlay and is intentional:
// the angular client lives in the user-app realm; statically importing
// `dev-overlay.js` here would risk creating a second copy of the
// runtime state when bundlers can't dedupe across realms. Reading the
// stable global keeps a single source of truth and soft-fails (no-op)
// when the overlay was never installed (production, vitest, etc.).
type HmrUpdateOverlayStage = 'received' | 'evicting' | 'reimporting' | 'rebooting' | 'complete';

type HmrUpdateOverlayInfo = {
	detail?: string;
	progress?: number | null;
};

// alpha.62 follow-up — opt-out flag (default: enabled). Driven by
// `NS_VITE_PROGRESS_OVERLAY=0` (or `false`/`off`/`no`) on the dev
// server; baked into the bundle via `__NS_HMR_PROGRESS_OVERLAY_ENABLED__`
// at build time. We collapse the build-time constant into a runtime
// boolean once so each call-site is a single property check rather
// than a try/typeof. Tests that re-run the angular client (via vitest)
// see `undefined` and default to enabled — matching the production
// dev-server experience.
const overlayEnabled: boolean = (() => {
	try {
		return typeof __NS_HMR_PROGRESS_OVERLAY_ENABLED__ === 'boolean' ? __NS_HMR_PROGRESS_OVERLAY_ENABLED__ : true;
	} catch {
		return true;
	}
})();

function getHmrOverlayApi(): any {
	if (!overlayEnabled) return null;
	try {
		return (globalThis as any).__NS_HMR_DEV_OVERLAY__ || null;
	} catch {}
	return null;
}

function setUpdateOverlayStage(stage: HmrUpdateOverlayStage, info?: HmrUpdateOverlayInfo): void {
	if (!overlayEnabled) return;
	try {
		const api = getHmrOverlayApi();
		if (api && typeof api.setUpdateStage === 'function') {
			api.setUpdateStage(stage, info);
		}
	} catch {}
}

function hideUpdateOverlay(): void {
	if (!overlayEnabled) return;
	try {
		const api = getHmrOverlayApi();
		if (api && typeof api.hide === 'function') {
			api.hide('hmr-applied');
		}
	} catch {}
}

// alpha.59 — Safe accessor for the build-time `__NS_ENV_VERBOSE__`
// constant.
//
// Vite replaces `__NS_ENV_VERBOSE__` at build time via `define`. In
// unit tests (vitest, plain ts-node, etc.) the identifier is
// undeclared at runtime, so a bare reference throws ReferenceError —
// `typeof` is the only safe way to probe it. We collapse the
// build-time constant into a runtime boolean once at module load and
// then short-circuit on `verbose` arguments at every call-site.
//
// Pre-alpha.59 several call-sites wrote `if (__NS_ENV_VERBOSE__ &&
// options.verbose)`, which threw on the FIRST call into
// `refreshAngularBootstrapOptions` from a test. Always order
// `verbose && envVerbose` so the runtime flag short-circuits the
// build constant.
const envVerbose: boolean = (() => {
	try {
		return typeof __NS_ENV_VERBOSE__ === 'boolean' ? __NS_ENV_VERBOSE__ : false;
	} catch {
		return false;
	}
})();

export function installAngularHmrClientHooks(): void {
	const g: any = globalThis;
	if (g.__NS_ANGULAR_HMR_CLIENT_INSTALLED__) {
		return;
	}
	try {
		g.__NS_ANGULAR_HMR_CLIENT_INSTALLED__ = true;
		if (envVerbose) {
			console.log('[hmr-angular] client hooks installed');
		}
	} catch {}
}

interface AngularUpdateOptions {
	getCore: GetCoreFn;
	verbose: boolean;
}

// alpha.59 — HMR cycle serialization mutex.
//
// Pre-alpha.59 a back-to-back save (e.g., the user holds Cmd+S, or
// `runOnSave` saves a file twice during one tick) could overlap two
// HMR cycles: the first cycle's `import(entry)` would still be
// resolving when the second cycle's `__nsInvalidateModules` ran,
// leaving the registry in a half-evicted state and producing flaky
// "module already evaluated" errors.
//
// Each `handleAngularHotUpdateMessage` call now publishes a promise
// to `inFlightHmrCycle` and awaits the previous publication before
// starting its own evict + import. The previous-cycle promise resolves
// regardless of success or failure (we always run `resolveCycle()` in
// `finally`), so a stuck cycle can't deadlock the queue. The mutex is
// intentionally process-wide and resets naturally on cold-boot or
// websocket reconnect (both blow away the JS realm).
let inFlightHmrCycle: Promise<void> | null = null;

// alpha.59 — Explicit module eviction.
//
// `__nsInvalidateModules` is a runtime-installed global that takes an
// array of canonical /ns/m/<rel> URLs and removes each one from V8's
// module registry (`g_moduleRegistry`). The runtime canonicalizer
// (HMRSupport.mm) strips legacy `__ns_hmr__/<tag>/` and
// `__ns_boot__/b1/` segments before lookup, so the same URL evicts
// every cache entry historically created for that module — even if a
// pre-alpha.59 stale tagged URL is still around.
//
// Soft-fails on older runtimes (alpha.58 and earlier) that don't
// expose the function. In that case we fall through to the legacy
// URL-versioning path and emit a one-time warning so the user knows
// the eviction protocol is unavailable.
function invalidateModules(urls: readonly string[], verbose: boolean): boolean {
	if (!urls || !urls.length) return false;
	const g: any = globalThis;
	const fn = g.__nsInvalidateModules;
	if (typeof fn !== 'function') {
		if (verbose && envVerbose) {
			try {
				console.warn(`[hmr-angular] runtime missing __nsInvalidateModules; falling back to legacy URL versioning. evict=${urls.length}`);
			} catch {}
		}
		return false;
	}
	try {
		fn.call(null, urls);
		return true;
	} catch (error) {
		if (verbose && envVerbose) {
			try {
				console.warn('[hmr-angular] __nsInvalidateModules threw', (error as any)?.message || error);
			} catch {}
		}
		return false;
	}
}

function getAngularBootstrapEntryCandidates(msg: any): string[] {
	const root = typeof __NS_APP_ROOT_VIRTUAL__ === 'string' && __NS_APP_ROOT_VIRTUAL__ ? __NS_APP_ROOT_VIRTUAL__ : '/src';
	// alpha.59 — Server announces the canonical bootstrap entry as
	// `importerEntry`, computed from `package.json#main`. Fall back to
	// the legacy `entryCandidates` array (for older servers) and finally
	// to a hard-coded list. All candidates must be project-relative
	// posix paths (e.g. `/src/main.ts`) so they slot directly behind
	// `${origin}/ns/m`.
	const explicit = typeof msg?.importerEntry === 'string' && msg.importerEntry.startsWith('/') ? [msg.importerEntry as string] : [];
	const legacy = Array.isArray(msg?.entryCandidates) && msg.entryCandidates.length ? (msg.entryCandidates as unknown[]) : [];
	const fallback = [`${root}/main.ts`, `${root}/app.ts`];
	const merged = [...explicit, ...legacy, ...fallback];
	const seen = new Set<string>();
	const result: string[] = [];
	for (const candidate of merged) {
		if (typeof candidate !== 'string' || !candidate.startsWith('/')) continue;
		if (seen.has(candidate)) continue;
		seen.add(candidate);
		result.push(candidate);
	}
	return result;
}

async function importAngularBootstrapEntry(url: string): Promise<unknown> {
	const g: any = globalThis;
	if (typeof g.__NS_HMR_IMPORT__ === 'function') {
		return g.__NS_HMR_IMPORT__(url);
	}
	return import(/* @vite-ignore */ url);
}

export async function refreshAngularBootstrapOptions(msg: any, options: AngularUpdateOptions): Promise<void> {
	const g: any = globalThis;
	if (typeof g.__NS_UPDATE_ANGULAR_APP_OPTIONS__ !== 'function') {
		return;
	}

	const originSource = typeof msg?.origin === 'string' && /^https?:\/\//.test(msg.origin) ? msg.origin : g.__NS_HTTP_ORIGIN__;
	if (typeof originSource !== 'string' || !/^https?:\/\//.test(originSource)) {
		return;
	}

	const origin = originSource.replace(/\/$/, '');

	// alpha.59 — Explicit eviction set takes precedence over URL
	// versioning. The server walks the inverse-dep closure of the
	// changed file (collectAngularEvictionUrls) and emits canonical
	// /ns/m/<rel> URLs in `evictPaths`. We hand the list to the runtime
	// before re-importing the entry; the runtime drops those entries
	// from `g_moduleRegistry` so V8's subsequent `import(entry)` walks
	// the dep graph and re-fetches ONLY those modules. Everything else
	// stays hot in the cache (the dominant cost of a pre-alpha.59 HMR
	// cycle was V8 re-fetching the ENTIRE graph because the URL changed
	// for every node — see HMR_STABLE_URL_INVALIDATION_PLAN.md).
	const evictPaths = Array.isArray(msg?.evictPaths) ? (msg.evictPaths as unknown[]).filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u)) : [];

	// Round-eleven.3 — Drive the apply-progress overlay through the
	// 'evicting' frame *before* the runtime invalidate call so the
	// user sees the count even on the cheapest stage. Eviction count
	// also doubles as a useful debug breadcrumb in the overlay's
	// detail line — large counts (e.g. constants edits → 100+
	// importers) explain why a cycle takes longer than an HTML edit.
	setUpdateOverlayStage('evicting', {
		detail: evictPaths.length ? `Invalidating ${evictPaths.length} module${evictPaths.length === 1 ? '' : 's'}` : 'Invalidating module cache',
	});

	const evicted = invalidateModules(evictPaths, options.verbose);

	if (options.verbose && envVerbose) {
		try {
			console.info(`[ns-hmr][angular] evict count=${evictPaths.length} ok=${evicted ? 'yes' : 'no'}`);
		} catch {}
	}

	// URL strategy:
	//
	// * `evicted=true`  → alpha.59 runtime accepted the eviction; we
	//   re-import the entry under its STABLE canonical URL. V8's
	//   registry no longer holds the evicted modules so the import
	//   triggers fresh fetches for them; the rest of the graph is a
	//   cache hit.
	// * `evicted=false` → either we have no eviction set (older server)
	//   or the runtime lacks `__nsInvalidateModules` (older runtime).
	//   Fall back to the legacy `__ns_hmr__/v<version>/` URL pattern
	//   so V8 sees a fresh URL and re-fetches the entry. The runtime
	//   canonicalizer (alpha.59) collapses the path back to the stable
	//   key, which keeps cache identity consistent across saves.
	const versionRaw = typeof msg?.version === 'number' ? msg.version : 0;
	const useStableUrls = evicted;

	let lastError: unknown;

	// Round-eleven.3 — 'reimporting' is the entry point for the long
	// tail of an HMR cycle: V8 walks the freshly-evicted graph and
	// the iOS runtime re-fetches each node from the dev server. We
	// announce the stage once, before the loop, so the user sees a
	// progress jump even when the import resolves on the first
	// candidate (the common case).
	setUpdateOverlayStage('reimporting', {
		detail: 'Re-importing Angular bootstrap entry',
	});

	for (const entry of getAngularBootstrapEntryCandidates(msg)) {
		const url = useStableUrls ? `${origin}/ns/m${entry}` : versionRaw ? `${origin}/ns/m/__ns_hmr__/v${versionRaw}${entry}` : `${origin}/ns/m${entry}`;
		try {
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = true;
			await importAngularBootstrapEntry(url);
			return;
		} catch (error) {
			lastError = error;
		} finally {
			g.__NS_ANGULAR_HMR_REGISTER_ONLY__ = false;
		}
	}

	if (options.verbose && envVerbose && lastError) {
		try {
			console.warn('[hmr-angular] failed to refresh Angular bootstrap entry', (lastError as any)?.message || lastError);
		} catch {}
	}
}

export async function handleAngularHotUpdateMessage(msg: any, options: AngularUpdateOptions): Promise<boolean> {
	if (!msg || msg.type !== 'ns:angular-update') {
		return false;
	}

	// alpha.59 — Cycle mutex. See `inFlightHmrCycle` for why this is
	// necessary. We publish `thisCycle` *before* awaiting the previous
	// one so a third concurrent message sees the latest in-flight,
	// not the stale previous. This serializes N concurrent updates into
	// a single FIFO chain.
	const previousCycle = inFlightHmrCycle;
	let resolveCycle!: () => void;
	const thisCycle = new Promise<void>((resolve) => {
		resolveCycle = resolve;
	});
	inFlightHmrCycle = thisCycle;
	if (previousCycle) {
		try {
			await previousCycle;
		} catch {}
	}

	// Single-line log lands in iOS device console as `CONSOLE INFO` so the user can
	// correlate with the server's `[hmr-ws][update] ...` line and see
	// where the save's wall time actually goes (refresh vs. reboot).
	const t0 = Date.now();
	let tAfterRefresh = t0;
	let tEnd = t0;
	const filePath = typeof msg?.path === 'string' ? msg.path : '<unknown>';
	const emitTiming = (ok: boolean, errorMessage?: string) => {
		try {
			const refreshMs = Math.max(0, tAfterRefresh - t0);
			const rebootMs = Math.max(0, tEnd - tAfterRefresh);
			const totalMs = Math.max(0, tEnd - t0);
			const status = ok ? 'ok' : 'FAILED';
			const suffix = errorMessage ? ` error=${errorMessage}` : '';
			console.info(`[ns-hmr][angular] ${status} file=${filePath} refresh=${refreshMs}ms reboot=${rebootMs}ms total=${totalMs}ms${suffix}`);
		} catch {}
	};

	// Show the apply-progress overlay as soon as the
	// mutex unblocks us. Posting this *after* the awaited
	// previousCycle keeps each cycle's stages visually grouped in the
	// overlay (cycle-1 finishes its 'complete' before cycle-2's
	// 'received' overrides it).
	//
	// The detail line surfaces the changed file path so the user can
	// confirm at a glance which save the overlay is reflecting.
	const overlayDetail = filePath && filePath !== '<unknown>' ? `Updating ${filePath}` : 'Preparing update';
	setUpdateOverlayStage('received', { detail: overlayDetail });

	try {
		const g: any = globalThis;

		// Prefer __reboot_ng_modules__ — it properly disposes existing modules,
		// re-bootstraps Angular inside NgZone, and sets the root view internally.
		// __NS_ANGULAR_BOOTSTRAP__ is exposed as a secondary signal that the
		// Angular HMR system is ready, but __reboot_ng_modules__ is the
		// canonical reboot entry point.
		const reboot = g.__reboot_ng_modules__;
		if (typeof reboot === 'function') {
			if (options.verbose && envVerbose) {
				console.log('[hmr-angular] rebooting Angular modules via __reboot_ng_modules__');
			}
			await refreshAngularBootstrapOptions(msg, options);
			tAfterRefresh = Date.now();
			try {
				g.__NS_HMR_IMPORT_NONCE__ = (typeof g.__NS_HMR_IMPORT_NONCE__ === 'number' ? g.__NS_HMR_IMPORT_NONCE__ : 0) + 1;
			} catch {}
			try {
				g.__NS_DEV_RESET_IN_PROGRESS__ = true;
			} catch {}
			// Round-eleven.3 — 'rebooting' marks the long tail of the
			// cycle: NgZone teardown, module re-instantiation, and
			// resetRootView. The detail line shows refresh-so-far ms
			// so a user can already see if the slow phase is
			// re-import or reboot.
			setUpdateOverlayStage('rebooting', {
				detail: `Re-bootstrapping Angular (refresh ${Math.max(0, tAfterRefresh - t0)}ms)`,
			});
			try {
				reboot(true);
			} finally {
				try {
					g.__NS_DEV_RESET_IN_PROGRESS__ = false;
				} catch {}
			}
			tEnd = Date.now();
			emitTiming(true);
			// Round-eleven.3 — 'complete' surfaces the wall-clock
			// total so a user gets a single-glance confirmation
			// matching the [ns-hmr][angular] log line in the
			// terminal. The overlay auto-hides shortly after.
			setUpdateOverlayStage('complete', {
				detail: `Total ${Math.max(0, tEnd - t0)}ms`,
			});
			return true;
		}

		if (options.verbose && envVerbose) {
			console.warn('[hmr-angular] No Angular HMR handler found. Ensure runNativeScriptAngularApp() has been called.');
		}
		tEnd = Date.now();
		emitTiming(false, 'no-reboot-handler');
		// No reboot handler → we can't apply the update; hide the
		// overlay rather than leaving stale progress on screen.
		hideUpdateOverlay();
	} catch (error) {
		if (options.verbose) {
			try {
				console.warn('[hmr-angular] failed to handle update', (error && (error as any).message) || error);
			} catch {}
		}
		tEnd = Date.now();
		emitTiming(false, (error && (error as any).message) || String(error));
		// Errors → drop the overlay so the user isn't left looking
		// at indefinite progress; the underlying error is already
		// logged above (and surfaced via Vite's standard error
		// pipeline through the websocket).
		hideUpdateOverlay();
	} finally {
		try {
			resolveCycle();
		} catch {}
		if (inFlightHmrCycle === thisCycle) {
			inFlightHmrCycle = null;
		}
	}
	return true;
}
