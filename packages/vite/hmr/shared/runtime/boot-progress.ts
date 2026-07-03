import { getGlobalScope } from './global-scope.js';
// Pure helpers for the cold-boot "Importing the app entry" progress display.
//
// Pipeline:
//   * Server-side `buildBootProgressSnippet` is injected at the top of
//     every served app module and bumps the count / last-module globals
//     while `__NS_HMR_BOOT_COMPLETE__` is falsy (self-gating — the
//     snippet no-ops after boot; FULLY SYNCHRONOUS — see the snippet
//     doc for why top-level await must stay out of served modules).
//   * `startBrowserRuntimeSession` stamps the time origin
//     (`__NS_HMR_BOOT_IMPORT_STARTED_AT__`) right before the client +
//     entry dynamic-import walk.
//   * `startBootImportHeartbeat` reads both signals every 250 ms and
//     re-asserts `'importing-main'` so the bar climbs even across long
//     vendor stretches that don't tick the count axis. The iOS runtime's
//     `MaybePumpJSThreadDuringBoot` keeps the JS-thread CFRunLoop ticking
//     between synchronous fetches so the heartbeat's `setInterval` timer
//     can fire during the cold-boot module walk.
//
// Monotonic ratchet (`applyMonotonicBootProgress`,
// `__NS_HMR_BOOT_LAST_PROGRESS__`): each tick can never undercut the
// previous one, preventing visible stutter when the count axis briefly
// wins over the time axis.

/**
 * `'importing-main'` is the long HTTP-module-load phase (5–10s for a
 * real Angular app). The bar uses this range so the user sees ~62
 * percentage points of motion during the phase that actually takes
 * time, sandwiched between the cheap bootstrap stages
 * ('configuring-import-map' = 26) and the post-import wait
 * ('waiting-for-app' = 94 → 'app-root-committed' = 100).
 */
export const BOOT_IMPORT_PROGRESS_MIN = 30;
export const BOOT_IMPORT_PROGRESS_MAX = 92;

/** Ceiling guards against rounding into `'waiting-for-app'` (94). */
export const BOOT_IMPORT_PROGRESS_CEILING = 94;

const BOOT_IMPORT_PROGRESS_RANGE = BOOT_IMPORT_PROGRESS_MAX - BOOT_IMPORT_PROGRESS_MIN;

/**
 * Compute the percentage shown next to "Importing the app entry".
 *
 * Sum of two clamped contributions:
 *   * `progressFromCount` — `__NS_HMR_BOOT_MODULE_COUNT__` bumped by the
 *     boot snippet (1 unit per 2 modules, cap 40).
 *   * `progressFromTime` — elapsed wall-clock since
 *     `__NS_HMR_BOOT_IMPORT_STARTED_AT__` (1 unit per 250 ms, cap
 *     matches the full 62-point range so time alone can drive the bar
 *     30 → 92 if the count axis is starved).
 *
 * The count axis goes silent in long node_modules stretches and on
 * Vite's rewrite chains where the served import URL skips the
 * `__ns_boot__/b1` prefix; the time axis covers those gaps. Both
 * contributions are summed, clamped to the 62-point range, then
 * ceilinged so they cannot cross into 'waiting-for-app' (94+).
 *
 * Canonical values are pinned by `boot-progress.spec.ts`. The
 * server-side snippet does NOT mirror this math — it only writes the
 * counters; the heartbeat in `session-bootstrap.ts` is the sole caller.
 */
const BOOT_IMPORT_COUNT_CONTRIBUTION_MAX = 40;
const BOOT_IMPORT_TIME_CONTRIBUTION_MAX = 62;
const BOOT_IMPORT_COUNT_DIVISOR = 2;
const BOOT_IMPORT_TIME_TICK_MS = 250;

export function computeBootImportProgress(input: { count?: number; elapsedMs?: number }): number {
	// Coerce NaN / ±Infinity / negatives to 0 — `Math.max(0, NaN)` is NaN.
	const rawCount = Number(input?.count ?? 0);
	const rawElapsed = Number(input?.elapsedMs ?? 0);
	const count = Number.isFinite(rawCount) ? Math.max(0, rawCount) : 0;
	const elapsedMs = Number.isFinite(rawElapsed) ? Math.max(0, rawElapsed) : 0;
	const progressFromCount = Math.min(BOOT_IMPORT_COUNT_CONTRIBUTION_MAX, Math.floor(count / BOOT_IMPORT_COUNT_DIVISOR));
	const progressFromTime = Math.min(BOOT_IMPORT_TIME_CONTRIBUTION_MAX, Math.floor(elapsedMs / BOOT_IMPORT_TIME_TICK_MS));
	const combined = BOOT_IMPORT_PROGRESS_MIN + Math.min(BOOT_IMPORT_PROGRESS_RANGE, progressFromCount + progressFromTime);
	return Math.min(BOOT_IMPORT_PROGRESS_CEILING, combined);
}

/**
 * Render the second-line detail for the placeholder. Surfaces the
 * count + last-loaded module path once the snippet has fired, or a
 * generic "Loading the module graph…" line during the pre-snippet
 * window.
 *
 * No elapsed-ms readout: the primary line's percentage is the progress
 * signal, and the heartbeat's `elapsedMs` is wall-clock since the import
 * started — not a per-module timing — so surfacing it next to the
 * percentage read as a confusing, inaccurate duration.
 */
export function formatBootImportDetail(input: { count?: number; lastModule?: string }): string {
	const count = Math.max(0, Number(input?.count ?? 0));
	const lastModule = typeof input?.lastModule === 'string' ? input.lastModule : '';
	if (count > 0) {
		return lastModule ? `Evaluated ${count} modules\n${lastModule}` : `Evaluated ${count} modules`;
	}
	return 'Loading the module graph…';
}

/**
 * Ratchet a candidate boot-import progress value against the highest
 * value any consumer has emitted so far (stored on
 * `globalThis.__NS_HMR_BOOT_LAST_PROGRESS__`). Reset by
 * `clearBootProgressState` between sessions.
 */
export function applyMonotonicBootProgress(candidate: number): number {
	const g: any = getGlobalScope();
	const previousRaw = g.__NS_HMR_BOOT_LAST_PROGRESS__;
	const previous = typeof previousRaw === 'number' && Number.isFinite(previousRaw) ? previousRaw : 0;
	const next = Math.max(previous, Math.max(0, Number(candidate) || 0));
	try {
		g.__NS_HMR_BOOT_LAST_PROGRESS__ = next;
	} catch {}
	return next;
}

/**
 * Reset every boot-progress global so a re-bootstrapped session (e.g.
 * after `__reboot_ng_modules__`) starts a fresh ratchet rather than
 * inheriting the previous cycle's terminal values.
 */
export function clearBootProgressState(): void {
	const g: any = getGlobalScope();
	for (const key of [
		'__NS_HMR_BOOT_MODULE_COUNT__',
		'__NS_HMR_BOOT_LAST_MODULE__',
		'__NS_HMR_BOOT_LAST_PROGRESS__',
		'__NS_HMR_BOOT_LAST_PROGRESS_AT__',
		'__NS_HMR_BOOT_IMPORT_STARTED_AT__',
		// Defensive: an earlier snippet shape used this to throttle a
		// top-level await yield. Removed — top-level await in a boot-tagged
		// module trips the iOS 10s async-module deadline. Cleared in case a
		// stale boot left it behind.
		'__NS_HMR_BOOT_LAST_YIELD_AT__',
	]) {
		try {
			delete g[key];
		} catch {}
	}
}
