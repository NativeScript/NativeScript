import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { BOOT_ARCHIVE_PATH } from '../shared/runtime/boot-archive-format.js';
import { resolvePlatform } from '../../helpers/cli-flags.js';
import { getProjectFlavor } from '../../helpers/flavor.js';

// Cold-boot request recording.
//
// The graph-walk boot closure (`populateInitialGraph` → `buildBootClosureUrls`)
// only covers app-source modules under `src/`, but a real cold boot also
// fetches hundreds of `/ns/m/node_modules/...` bodies (deep ESM packages like
// rxjs) one-by-one inside V8's synchronous module walk. This recorder captures
// the EXACT prefetchable URL set served during a boot window so the next boot
// (`/__ns_dev__/boot-closure` and `/__ns_dev__/boot-archive`) can prewarm all
// of it up front.
//
// Lifecycle: a recording session opens when the device fetches one of the
// boot-signal endpoints (`/__ns_dev__/session|boot-closure|boot-archive` —
// each is requested exactly once per boot by the session bootstrap), collects
// every successfully-served prefetchable request, and closes after an idle
// window. Closed sessions replace the previous recording and persist to
// `node_modules/.ns-vite/boot-closure-<platform>-<flavor>.json` so a fresh
// dev-server start benefits too.
//
// Self-healing: only 2xx responses are recorded, so deleted modules (404s)
// drop out on the next boot. Stale-but-servable entries are harmless — the
// prewarm cache tolerates unused bodies and the kickstart tolerates misses.

export const BOOT_RECORDING_VERSION = 1;

/** Endpoints whose request marks the start of a device boot. */
export const BOOT_SIGNAL_PATHS: ReadonlySet<string> = new Set(['/__ns_dev__/session', '/__ns_dev__/boot-closure', BOOT_ARCHIVE_PATH]);

// Mirrors the native runtime's `LooksLikeJsSourceUrl` filter: the kickstart
// prewarm (and `seedModuleBodies`) skip non-JS resource types, so recording
// them would only bloat the closure.
const NON_JS_EXT_RE = /\.(css|scss|sass|less|json|html|htm|png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf|eot|mp3|mp4|webm|wav|map)$/i;

// Volatile cache-buster query param (`?t=169…` / `&t=169…`). URLs carrying it
// are freshly minted per request (Vite HMR timestamps, the Angular
// `@ng/component?c=…&t=…` refresh route), so a recorded copy can never be a
// byte-exact prewarm-cache hit on the next boot — recording them only grows
// the closure by one dead variant per boot.
const VOLATILE_T_PARAM_RE = /[?&]t=\d+(?:&|$)/;

/**
 * True when a request path is served through the device module loader and is
 * therefore worth prefetching on the next boot. Matches the URL spaces the
 * HTTP ESM loader fetches: `/ns/m/**`, the `/ns/rt` + `/ns/core` bridges, the
 * core and deps bundles, Vue SFC artifacts, the served vendor bundle, and the
 * dev client bootstrap.
 */
export function isPrefetchableBootPath(pathWithSearch: string): boolean {
	if (!pathWithSearch || !pathWithSearch.startsWith('/')) return false;
	if (VOLATILE_T_PARAM_RE.test(pathWithSearch)) return false;
	const pathname = pathWithSearch.split('?')[0];
	if (NON_JS_EXT_RE.test(pathname)) return false;
	if (pathname === '/ns/import-map.json') return false;
	if (pathname.startsWith('/ns/m/')) return true;
	if (pathname === '/ns/rt' || pathname.startsWith('/ns/rt/')) return true;
	if (pathname === '/ns/core' || pathname.startsWith('/ns/core/')) return true;
	if (pathname === '/ns/core-bundle.mjs') return true;
	if (pathname === '/ns/deps-bundle.mjs') return true;
	if (pathname.startsWith('/ns/sfc/') || pathname.startsWith('/ns/asm/')) return true;
	if (pathname === '/@nativescript/vendor.mjs') return true;
	if (pathname === '/__ns_dev__/client') return true;
	return false;
}

export function getBootRecordingFilePath(projectRoot: string, platform: string, flavor: string): string {
	return path.join(projectRoot, 'node_modules', '.ns-vite', `boot-closure-${platform}-${flavor}.json`);
}

/** Load a persisted recording; null when absent, invalid, or mismatched. */
export function loadPersistedBootRecording(projectRoot: string, platform: string, flavor: string): string[] | null {
	try {
		const file = getBootRecordingFilePath(projectRoot, platform, flavor);
		if (!existsSync(file)) return null;
		const parsed = JSON.parse(readFileSync(file, 'utf-8'));
		if (!parsed || parsed.version !== BOOT_RECORDING_VERSION) return null;
		if (parsed.platform !== platform || parsed.flavor !== flavor) return null;
		// Re-apply the prefetchability filter on load so recordings written by
		// an older filter (or hand-edited files) shed dead entries.
		const paths = Array.isArray(parsed.paths) ? parsed.paths.filter((p: unknown): p is string => typeof p === 'string' && isPrefetchableBootPath(p)) : [];
		return paths.length ? paths : null;
	} catch {
		return null;
	}
}

export type BootRecorderOptions = {
	platform: string;
	flavor: string;
	projectRoot: string;
	/** Recording window closes after this many ms without boot requests (default 5000). */
	idleWindowMs?: number;
	/** Windows with fewer recorded entries are discarded as non-boots (default 5). */
	minEntries?: number;
	/** Hard cap on the recorded list (default 5000). */
	maxEntries?: number;
	/** Disable disk persistence (tests). */
	persist?: boolean;
	now?: () => number;
	setTimer?: (handler: () => void, ms: number) => unknown;
	clearTimer?: (handle: unknown) => void;
	log?: (line: string) => void;
};

export type BootRecorder = {
	/**
	 * Feed a request path (pathname + search). Boot-signal paths open a new
	 * recording session and return null. Prefetchable paths inside an active
	 * session return a finish callback the caller must invoke with the
	 * response status code; only 2xx completions are recorded.
	 */
	noteRequest(pathWithSearch: string): ((statusCode: number) => void) | null;
	/**
	 * Record paths served out-of-band. The boot archive delivers bodies in
	 * one payload (its loopback self-fetches are excluded from organic
	 * recording), so the archive route feeds its served paths here; device
	 * straggler fetches are still recorded organically on top.
	 */
	seedActiveSession(paths: readonly string[]): void;
	/** Most recent completed (or persisted) recording; null when none. */
	getRecordedPaths(): string[] | null;
	/** Force-close the active session (idle close path; exposed for tests). */
	closeActiveSession(): void;
};

export function createBootRecorder(options: BootRecorderOptions): BootRecorder {
	const idleWindowMs = Math.max(500, Math.floor(options.idleWindowMs ?? 5000));
	const minEntries = Math.max(1, Math.floor(options.minEntries ?? 5));
	const maxEntries = Math.max(minEntries, Math.floor(options.maxEntries ?? 5000));
	const persist = options.persist !== false;
	const now = options.now ?? (() => Date.now());
	const setTimer = options.setTimer ?? ((handler: () => void, ms: number) => setTimeout(handler, ms));
	const clearTimer = options.clearTimer ?? ((handle: unknown) => clearTimeout(handle as any));
	const log = options.log ?? (() => {});

	let best: string[] | null = persist ? loadPersistedBootRecording(options.projectRoot, options.platform, options.flavor) : null;
	let session: { order: string[]; seen: Set<string>; startedAt: number } | null = null;
	let idleTimer: unknown = null;

	const persistBest = () => {
		if (!persist || !best) return;
		try {
			const file = getBootRecordingFilePath(options.projectRoot, options.platform, options.flavor);
			mkdirSync(path.dirname(file), { recursive: true });
			writeFileSync(
				file,
				JSON.stringify({
					version: BOOT_RECORDING_VERSION,
					platform: options.platform,
					flavor: options.flavor,
					recordedAt: now(),
					paths: best,
				}),
			);
		} catch (error: any) {
			log(`[hmr-ws][boot-record] persist failed: ${error?.message || error}`);
		}
	};

	const closeSession = () => {
		if (idleTimer !== null) {
			clearTimer(idleTimer);
			idleTimer = null;
		}
		if (!session) return;
		const finished = session;
		session = null;
		if (finished.order.length < minEntries) {
			log(`[hmr-ws][boot-record] discarded window with ${finished.order.length} entries (< ${minEntries})`);
			return;
		}
		best = finished.order.slice(0, maxEntries);
		persistBest();
		log(`[hmr-ws][boot-record] captured ${best.length} boot urls in ${Math.max(0, now() - finished.startedAt)}ms`);
	};

	const armIdle = () => {
		if (idleTimer !== null) clearTimer(idleTimer);
		idleTimer = setTimer(() => {
			idleTimer = null;
			closeSession();
		}, idleWindowMs);
	};

	const openSession = () => {
		closeSession();
		session = { order: [], seen: new Set(), startedAt: now() };
		armIdle();
	};

	const record = (pathWithSearch: string) => {
		if (!session || session.order.length >= maxEntries) return;
		if (session.seen.has(pathWithSearch)) return;
		session.seen.add(pathWithSearch);
		session.order.push(pathWithSearch);
	};

	return {
		noteRequest(pathWithSearch: string) {
			const pathname = pathWithSearch.split('?')[0];
			if (BOOT_SIGNAL_PATHS.has(pathname)) {
				openSession();
				return null;
			}
			if (!session) return null;
			if (!isPrefetchableBootPath(pathWithSearch)) return null;
			armIdle();
			let done = false;
			return (statusCode: number) => {
				if (done) return;
				done = true;
				if (!session) return;
				if (!(statusCode >= 200 && statusCode < 300)) return;
				record(pathWithSearch);
				armIdle();
			};
		},
		seedActiveSession(paths: readonly string[]) {
			if (!paths?.length) return;
			if (!session) openSession();
			for (const p of paths) {
				if (typeof p === 'string' && isPrefetchableBootPath(p)) record(p);
			}
			armIdle();
		},
		getRecordedPaths() {
			return best ? best.slice() : null;
		},
		closeActiveSession() {
			closeSession();
		},
	};
}

/**
 * Standard dev-server construction: resolves platform/flavor from the
 * project, honors `NS_VITE_HMR_DISABLE_BOOT_RECORDING` (returns null) and
 * `NS_VITE_HMR_BOOT_RECORD_IDLE_MS`.
 */
export function createBootRecorderFromEnv(projectRoot: string, log?: (line: string) => void): BootRecorder | null {
	const disabled = process.env.NS_VITE_HMR_DISABLE_BOOT_RECORDING === '1' || process.env.NS_VITE_HMR_DISABLE_BOOT_RECORDING === 'true';
	if (disabled) return null;
	const configuredIdleMs = Number.parseInt(process.env.NS_VITE_HMR_BOOT_RECORD_IDLE_MS || '', 10);
	return createBootRecorder({
		platform: resolvePlatform() || 'ios',
		flavor: getProjectFlavor(),
		projectRoot,
		idleWindowMs: Number.isFinite(configuredIdleMs) && configuredIdleMs > 0 ? configuredIdleMs : undefined,
		log,
	});
}
