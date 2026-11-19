// Helpers for the cold-boot "Importing the app entry" progress display,
// driven by `startBootImportHeartbeat` in `session-bootstrap.ts`.
//
// Monotonic ratchet (`applyMonotonicBootProgress`): each tick can never
// undercut the previous one.

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

const BOOT_IMPORT_TIME_TICK_MS = 250;

/**
 * Compute the percentage shown next to "Importing the app entry" from the
 * elapsed wall-clock time since the entry import started: 1 point per
 * 250 ms across the full range, ceilinged so it cannot cross into
 * 'waiting-for-app' (94+).
 */
export function computeBootImportProgress(elapsedMs: number): number {
	// Coerce NaN / ±Infinity / negatives to 0 — `Math.max(0, NaN)` is NaN.
	const raw = Number(elapsedMs);
	const elapsed = Number.isFinite(raw) ? Math.max(0, raw) : 0;
	const combined = BOOT_IMPORT_PROGRESS_MIN + Math.min(BOOT_IMPORT_PROGRESS_RANGE, Math.floor(elapsed / BOOT_IMPORT_TIME_TICK_MS));
	return Math.min(BOOT_IMPORT_PROGRESS_CEILING, combined);
}

/** Second-line detail shown under "Importing the app entry". */
export const BOOT_IMPORT_DETAIL = 'Loading the module graph…';

let lastBootProgress = 0;

/**
 * Ratchet a candidate boot-import progress value against the highest
 * value any consumer has emitted so far. Reset by `clearBootProgressState`
 * between sessions.
 */
export function applyMonotonicBootProgress(candidate: number): number {
	lastBootProgress = Math.max(lastBootProgress, Math.max(0, Number(candidate) || 0));
	return lastBootProgress;
}

/** Reset the ratchet so a re-bootstrapped session starts from the floor. */
export function clearBootProgressState(): void {
	lastBootProgress = 0;
}
