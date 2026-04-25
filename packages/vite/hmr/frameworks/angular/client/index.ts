declare const __NS_ENV_VERBOSE__: boolean | undefined;
declare const __NS_APP_ROOT_VIRTUAL__: string | undefined;
declare const __NS_HMR_PROGRESS_OVERLAY_ENABLED__: boolean | undefined;
declare const __NS_HMR_KICKSTART_MAX_URLS__: number | undefined;

type GetCoreFn = (name: string) => any;

// HMR-applying progress overlay.
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

// Opt-out flag for the apply-progress overlay (default: enabled).
// Driven by `NS_VITE_PROGRESS_OVERLAY=0` (or `false`/`off`/`no`) on the
// dev server; baked into the bundle via
// `__NS_HMR_PROGRESS_OVERLAY_ENABLED__` at build time. We collapse the
// build-time constant into a runtime boolean once so each call-site is
// a single property check rather than a try/typeof. Tests that re-run
// the angular client (via vitest) see `undefined` and default to
// enabled — matching the production dev-server experience.
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

// Safe accessor for the build-time `__NS_ENV_VERBOSE__` constant.
//
// Vite replaces `__NS_ENV_VERBOSE__` at build time via `define`. In
// unit tests (vitest, plain ts-node, etc.) the identifier is
// undeclared at runtime, so a bare reference throws ReferenceError —
// `typeof` is the only safe way to probe it. We collapse the
// build-time constant into a runtime boolean once at module load and
// then short-circuit on `verbose` arguments at every call-site.
//
// Always order `verbose && envVerbose` so the runtime flag
// short-circuits the build-time constant; that prevents reference
// errors in test environments where the `define` substitution does
// not run.
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

// HMR cycle serialization mutex.
//
// A back-to-back save (e.g., the user holds Cmd+S, or `runOnSave`
// saves a file twice during one tick) could overlap two HMR cycles:
// the first cycle's `import(entry)` would still be resolving when the
// second cycle's `__nsInvalidateModules` ran, leaving the registry in
// a half-evicted state and producing flaky "module already evaluated"
// errors.
//
// Each `handleAngularHotUpdateMessage` call publishes a promise to
// `inFlightHmrCycle` and awaits the previous publication before
// starting its own evict + import. The previous-cycle promise resolves
// regardless of success or failure (we always run `resolveCycle()` in
// `finally`), so a stuck cycle can't deadlock the queue. The mutex is
// intentionally process-wide and resets naturally on cold-boot or
// websocket reconnect (both blow away the JS realm).
let inFlightHmrCycle: Promise<void> | null = null;

// Explicit module eviction.
//
// `__nsInvalidateModules` is a runtime-installed global that takes an
// array of canonical /ns/m/<rel> URLs and removes each one from V8's
// module registry (`g_moduleRegistry`). The runtime canonicalizer
// strips legacy `__ns_hmr__/<tag>/` and `__ns_boot__/b1/` segments
// before lookup, so the same URL evicts every cache entry historically
// created for that module — even if a stale tagged URL is still around.
//
// Soft-fails on older runtimes that don't expose the function. In that
// case we fall through to the legacy URL-versioning path and emit a
// one-time warning so the user knows the eviction protocol is
// unavailable.
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

// Parallel module-source prefetch for the HMR re-import.
//
// Why this exists. After `__nsInvalidateModules(evictPaths)` the
// V8 cache (`g_moduleRegistry`) no longer holds the changed file
// or any of its transitive importers. The next `import(entry)` will
// walk the dep graph through V8's *synchronous*
// `ResolveModuleCallback`, which means each evicted module enters
// `LoadHttpModuleForUrl` → `HttpFetchText` → network fetch, one at
// a time. With ~131 importers (a constants edit reaches that
// quickly in a real Angular app) and ~10ms per round-tripped fetch
// over keep-alive, that's a ~1.3s sequential floor inside `refresh`.
//
// V8 10.3.x does not expose an async resolve callback for static
// imports, so we cannot parallelize the walk itself. What we *can*
// do is pre-fill the loader's `g_prefetchCache` BEFORE V8 starts
// walking. `__nsKickstartHmrPrefetch(urls)` does exactly that — it
// runs an N-way parallel HTTP wave (default 16-way), blocks the
// JS thread until the wave drains, and stores every body in the
// cache. When V8 then walks, every `HttpFetchText` is a memory
// read instead of a network round trip. The walk's wall time
// collapses to the slowest *single* fetch in the wave.
//
// Why we pass `evictPaths` directly (not just the entry seed). The
// dev server's `collectAngularEvictionUrls` already computed the
// inverse-dep closure of the changed file. Re-discovering it via
// the runtime's BFS-from-seed mode would (a) re-fetch modules V8
// still has compiled, and (b) add one round trip per graph level.
// Passing the array form takes the explicit list, fans it out in
// one wave, and skips the recursion.
//
// Soft-fail behavior:
// - Older runtime (no `__nsKickstartHmrPrefetch`)  → no-op, V8 falls
//   back to per-module `HttpFetchText`.
// - Older runtime (string-only `__nsKickstartHmrPrefetch`)  → array
//   arg is rejected by the runtime; we still log no-op and proceed.
// - Kickstart timeout                              → partial
//   pre-fill; V8 fetches the rest synchronously.
// - Synchronous throw                              → guarded; cycle
//   continues without speedup.
//
// All four paths preserve correctness — kickstart is a pure
// performance optimization and never changes which modules are
// evaluated.
type KickstartResult = { ok: boolean; fetched: number; ms: number };

// Eviction-set size cap for the kickstart.
//
// `__NS_HMR_KICKSTART_MAX_URLS__` is a build-time literal injected
// by `helpers/global-defines.ts` (default 32). It is a pure
// performance gate: the kickstart never affects correctness, so
// skipping it for large fan-out edits simply reverts the runtime to
// sequential `HttpFetchText`. See the doc comment on
// `resolveHmrKickstartMaxUrls` (in global-defines.ts) for the
// rationale and the empirical numbers behind the default.
//
// The constant is read once at module load (the same pattern used
// for `overlayEnabled`) so each call site is a single inequality
// check rather than a try/typeof. Tests that re-import this module
// see `undefined` and fall back to the default.
const KICKSTART_DEFAULT_MAX_URLS = 32;
const kickstartMaxUrls: number = (() => {
	try {
		const raw = __NS_HMR_KICKSTART_MAX_URLS__;
		if (typeof raw !== 'number') return KICKSTART_DEFAULT_MAX_URLS;
		if (!Number.isFinite(raw)) return Number.POSITIVE_INFINITY;
		if (raw < 0) return KICKSTART_DEFAULT_MAX_URLS;
		return Math.floor(raw);
	} catch {
		return KICKSTART_DEFAULT_MAX_URLS;
	}
})();

// Decide whether to run the kickstart for a given eviction set.
// Exported for unit testing — callers in this module use the inline
// `evictPaths.length` comparison below for a slightly cheaper
// hot-path.
//
// Semantics:
// - `0` urls   → no work to do; skip (returns false).
// - `urls.length <= cap` → kickstart eligible (returns true).
// - `urls.length > cap`  → skip kickstart (returns false). V8 falls
//   back to per-module synchronous fetches inside its module walk.
// - `cap === 0`           → kickstart disabled regardless of size.
// - `cap === Infinity`    → kickstart always eligible (no cap).
export function shouldRunKickstart(urlCount: number, maxUrls: number = kickstartMaxUrls): boolean {
	if (!Number.isFinite(urlCount) || urlCount <= 0) return false;
	if (!Number.isFinite(maxUrls)) return maxUrls > 0;
	if (maxUrls <= 0) return false;
	return urlCount <= maxUrls;
}

function kickstartHmrPrefetch(urls: readonly string[], verbose: boolean): KickstartResult | null {
	if (!urls || !urls.length) return null;
	const g: any = globalThis;
	const fn = g.__nsKickstartHmrPrefetch;
	if (typeof fn !== 'function') {
		if (verbose && envVerbose) {
			try {
				console.info(`[hmr-angular] runtime missing __nsKickstartHmrPrefetch; serial fetches will be used. urls=${urls.length}`);
			} catch {}
		}
		return null;
	}
	try {
		// Concurrency cap of 16 matches the runtime's documented
		// default for the kickstart BFS. Timeout at 10s tracks the
		// runtime's `HttpFetchText` retry envelope so we don't
		// hold the JS thread forever on a stalled dev server.
		const result = fn.call(null, urls.slice(), { maxConcurrent: 16, timeoutMs: 10000 });
		if (result && typeof result === 'object') {
			const ok = !!result.ok;
			const fetched = typeof result.fetched === 'number' ? result.fetched : 0;
			const ms = typeof result.ms === 'number' ? result.ms : 0;
			return { ok, fetched, ms };
		}
		return null;
	} catch (error) {
		if (verbose && envVerbose) {
			try {
				console.warn('[hmr-angular] __nsKickstartHmrPrefetch threw', (error as any)?.message || error);
			} catch {}
		}
		return null;
	}
}

function getAngularBootstrapEntryCandidates(msg: any): string[] {
	const root = typeof __NS_APP_ROOT_VIRTUAL__ === 'string' && __NS_APP_ROOT_VIRTUAL__ ? __NS_APP_ROOT_VIRTUAL__ : '/src';
	// Server announces the canonical bootstrap entry as
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

	// Explicit eviction set takes precedence over URL versioning. The
	// server walks the inverse-dep closure of the changed file
	// (collectAngularEvictionUrls) and emits canonical /ns/m/<rel> URLs
	// in `evictPaths`. We hand the list to the runtime before
	// re-importing the entry; the runtime drops those entries from
	// `g_moduleRegistry` so V8's subsequent `import(entry)` walks the
	// dep graph and re-fetches ONLY those modules. Everything else stays
	// hot in the cache.
	const evictPaths = Array.isArray(msg?.evictPaths) ? (msg.evictPaths as unknown[]).filter((u): u is string => typeof u === 'string' && /^https?:\/\//.test(u)) : [];

	// Drive the apply-progress overlay through the 'evicting' frame
	// *before* the runtime invalidate call so the user sees the count
	// even on the cheapest stage. Eviction count also doubles as a
	// useful debug breadcrumb in the overlay's detail line — large
	// counts (e.g. constants edits → 100+ importers) explain why a
	// cycle takes longer than an HTML edit.
	setUpdateOverlayStage('evicting', {
		detail: evictPaths.length ? `Invalidating ${evictPaths.length} module${evictPaths.length === 1 ? '' : 's'}` : 'Invalidating module cache',
	});

	const evicted = invalidateModules(evictPaths, options.verbose);

	if (options.verbose && envVerbose) {
		try {
			console.info(`[ns-hmr][angular] evict count=${evictPaths.length} ok=${evicted ? 'yes' : 'no'}`);
		} catch {}
	}

	// Parallel HTTP prefetch for the freshly-evicted modules.
	//
	// Order matters here: the kickstart MUST run after the eviction so
	// that it actually re-populates `g_prefetchCache` for the modules
	// V8 will ask for. If we kickstarted before the eviction, every URL
	// would skip on the "already cached" check (the walk consumes
	// destructively but the prior non-evicted modules sit in V8's
	// `g_moduleRegistry`, not the prefetch cache).
	//
	// We only kickstart when the eviction succeeded, because the
	// fallback path (legacy URL-versioning, see `useStableUrls = evicted`
	// below) doesn't go through canonical /ns/m URLs and the runtime
	// would not match its prefetch cache lookups against the version-
	// prefixed forms V8 will end up requesting. Better to skip the
	// optimization than risk a confusing partial cache hit.
	//
	// `shouldRunKickstart` gates large eviction sets out of the
	// parallel wave. A `.ts` file with deep inverse-dep fan-in
	// (constants files, design-system enums) can produce a
	// 200–300-URL closure that overwhelms Vite's single-threaded
	// transform pipeline. The kickstart fan-out then makes the cycle
	// 5–8× slower than letting V8 fetch sequentially as it walks the
	// real forward path. The cap (default 32, override with
	// `NS_VITE_KICKSTART_MAX_URLS`) keeps component-shaped closures
	// (typically 5–30 URLs) on the fast path. Correctness is
	// unaffected — V8's per-module synchronous fetch is the same fall-
	// back code path the runtime has always used.
	if (evicted && evictPaths.length > 0) {
		if (shouldRunKickstart(evictPaths.length)) {
			const result = kickstartHmrPrefetch(evictPaths, options.verbose);
			if (options.verbose && envVerbose && result) {
				try {
					console.info(`[ns-hmr][angular] kickstart urls=${evictPaths.length} fetched=${result.fetched} ok=${result.ok ? 'yes' : 'no'} ms=${result.ms}`);
				} catch {}
			}
		} else if (options.verbose && envVerbose) {
			try {
				console.info(`[ns-hmr][angular] kickstart skipped urls=${evictPaths.length} cap=${Number.isFinite(kickstartMaxUrls) ? kickstartMaxUrls : 'Infinity'} (eviction set too large; falling back to sequential fetch)`);
			} catch {}
		}
	}

	// URL strategy:
	//
	// * `evicted=true`  → modern runtime accepted the eviction; we
	//   re-import the entry under its STABLE canonical URL. V8's
	//   registry no longer holds the evicted modules so the import
	//   triggers fresh fetches for them; the rest of the graph is a
	//   cache hit.
	// * `evicted=false` → either we have no eviction set (older server)
	//   or the runtime lacks `__nsInvalidateModules` (older runtime).
	//   Fall back to the legacy `__ns_hmr__/v<version>/` URL pattern so
	//   V8 sees a fresh URL and re-fetches the entry. The runtime
	//   canonicalizer collapses the path back to the stable key, which
	//   keeps cache identity consistent across saves.
	const versionRaw = typeof msg?.version === 'number' ? msg.version : 0;
	const useStableUrls = evicted;

	let lastError: unknown;

	// 'reimporting' is the entry point for the long tail of an HMR
	// cycle: V8 walks the freshly-evicted graph and the iOS runtime
	// re-fetches each node from the dev server. We announce the stage
	// once, before the loop, so the user sees a progress jump even when
	// the import resolves on the first candidate (the common case).
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

	// Cycle mutex. See `inFlightHmrCycle` for why this is necessary. We
	// publish `thisCycle` *before* awaiting the previous one so a third
	// concurrent message sees the latest in-flight, not the stale
	// previous. This serializes N concurrent updates into a single FIFO
	// chain.
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
			// 'rebooting' marks the long tail of the cycle: NgZone
			// teardown, module re-instantiation, and resetRootView.
			// The detail line shows refresh-so-far ms so a user can
			// already see if the slow phase is re-import or reboot.
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
			// 'complete' surfaces the wall-clock total so a user gets a
			// single-glance confirmation matching the [ns-hmr][angular]
			// log line in the terminal. The overlay auto-hides shortly
			// after.
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
