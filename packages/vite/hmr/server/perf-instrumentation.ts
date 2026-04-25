// Server-side perf instrumentation helpers.
//
// All exports are pure so they can be unit-tested without spinning up
// Vite. The websocket middleware wires them in with its own logger.
//
// The three primitives are:
//   1. `formatServerStartupBanner` — the always-on banner that prints
//      on dev server startup so the user can confirm which build is
//      live and which perf knobs are active.
//   2. `createColdBootRequestCounter` — a richer counter that tracks
//      the first burst of NativeScript dev routes (`/ns/m/**`, `/ns/rt/**`,
//      `/ns/core/**`, `/__ns_boot__/**`, `/ns/import-map.json`,
//      `/@nativescript/vendor.mjs`). Emits a rolling + final summary so
//      cold-boot traffic is visible without flipping verbose mode.
//   3. `formatPopulateInitialGraphSummary` — the single line we print
//      when `populateInitialGraph` finishes. Includes module count and
//      duration so it's trivial to spot regressions.

export type ServerStartupBannerInput = {
	version: string;
	transformConcurrency: number;
	transformCacheMs: number;
	lazyInitialGraph: boolean;
	graphVersion: number;
};

// Single-line, human-scannable banner. We avoid pretty-printing (no
// boxes/colors) so it plays well with piped logs and the Vite custom
// logger. Format:
//   [hmr-ws] @nativescript/vite@<version> — transformConcurrency=8 transformCacheMs=60000ms lazyInitialGraph=on graphVersion=1
export function formatServerStartupBanner(input: ServerStartupBannerInput): string {
	const parts = [`transformConcurrency=${Math.max(1, Math.floor(input.transformConcurrency))}`, `transformCacheMs=${Math.max(0, Math.floor(input.transformCacheMs))}ms`, `lazyInitialGraph=${input.lazyInitialGraph ? 'on' : 'off'}`, `graphVersion=${Math.max(0, Math.floor(input.graphVersion))}`];
	return `[hmr-ws] @nativescript/vite@${input.version} — ${parts.join(' ')}`;
}

/**
 * Classify a URL path into a coarse route category. Any pathname that
 * doesn't match a known NativeScript dev route is reported as `other`;
 * callers are expected to filter their own irrelevant routes before
 * calling `record()`.
 */
export function classifyBootRoute(pathname: string): BootRouteCategory {
	if (!pathname || typeof pathname !== 'string') return 'other';
	if (pathname === '/ns/import-map.json') return 'ns/import-map';
	if (pathname === '/@nativescript/vendor.mjs' || pathname.startsWith('/@nativescript/')) return 'ns/vendor';
	if (pathname.startsWith('/ns/m/')) return 'ns/m';
	if (pathname.startsWith('/ns/rt/')) return 'ns/rt';
	if (pathname.startsWith('/ns/core/')) return 'ns/core';
	if (pathname.startsWith('/__ns_boot__/')) return 'ns/boot';
	if (pathname.startsWith('/__ns_hmr__/')) return 'ns/hmr';
	if (pathname.startsWith('/ns/')) return 'ns/other';
	return 'other';
}

export type BootRouteCategory = 'ns/m' | 'ns/rt' | 'ns/core' | 'ns/vendor' | 'ns/import-map' | 'ns/boot' | 'ns/hmr' | 'ns/other' | 'other';

export type ColdBootRequestCounter = {
	record: (url: string) => RecordHandle;
	finalize: () => void;
	getState: () => ColdBootCounterState;
};

export type RecordHandle = {
	finish: () => void;
};

export type ColdBootCounterState = {
	active: boolean;
	count: number;
	inFlight: number;
	maxConcurrent: number;
	startedAt: number | null;
	firstRequestUrl: string | null;
	perRoute: Partial<Record<BootRouteCategory, number>>;
};

export type ColdBootCounterOptions = {
	/**
	 * Emit a rolling summary every N requests (default 100). Lower the
	 * threshold in tests to keep them snappy. Set to 0 to disable rolling
	 * summaries; a final summary still fires from `finalize()`.
	 */
	summaryEvery?: number;
	/**
	 * Cold-boot window closes when no new requests arrive within this
	 * idle window (default 5000ms). The HMR edit loop reuses the same
	 * handler, but it never bursts as heavily as cold boot. Raise this
	 * via `NS_VITE_HMR_BOOT_TRACE_IDLE_MS` when profiling a slow boot
	 * so inter-wave pauses don't close the counter prematurely.
	 */
	idleWindowMs?: number;
	/** Defaults to `Date.now`; tests inject a deterministic clock. */
	now?: () => number;
	/** Defaults to `setTimeout`; tests can inject a fake timer. */
	setTimer?: (handler: () => void, ms: number) => unknown;
	/** Defaults to `clearTimeout`; tests can inject a fake timer. */
	clearTimer?: (handle: unknown) => void;
	/** Logger called for every summary line (rolling + final). */
	log: (line: string) => void;
};

// Factory for the cold-boot counter. Encapsulates all state in a closure
// so the websocket module doesn't have to track timers itself, and so
// this is trivially testable with a fake clock.
export function createColdBootRequestCounter(options: ColdBootCounterOptions): ColdBootRequestCounter {
	const summaryEvery = Math.max(0, Math.floor(options.summaryEvery ?? 100));
	const idleWindowMs = Math.max(100, Math.floor(options.idleWindowMs ?? 5000));
	const now = options.now ?? (() => Date.now());
	const setTimer = options.setTimer ?? ((handler, ms) => setTimeout(handler, ms));
	const clearTimer = options.clearTimer ?? ((handle) => clearTimeout(handle as any));

	let active = true;
	let count = 0;
	let inFlight = 0;
	let maxConcurrent = 0;
	let startedAt: number | null = null;
	let firstRequestUrl: string | null = null;
	let idleTimer: unknown = null;
	const perRoute: Partial<Record<BootRouteCategory, number>> = {};

	const formatPerRoute = (): string => {
		const entries = Object.entries(perRoute) as Array<[BootRouteCategory, number]>;
		if (entries.length === 0) return '';
		entries.sort((a, b) => b[1] - a[1]);
		return entries.map(([k, v]) => `${k}=${v}`).join(',');
	};

	const fireFinal = () => {
		if (!active) return;
		active = false;
		// `startedAt` is set the first time `record()` fires. Use an explicit
		// null check — `startedAt` can be 0 on deterministic test clocks and
		// `startedAt ? ... : 0` would mis-treat that as "never started".
		const ms = startedAt !== null ? now() - startedAt : 0;
		const routes = formatPerRoute();
		const routesPart = routes ? ` routes=${routes}` : '';
		options.log(`[hmr-ws][cold-boot] window closed modules=${count} ms=${ms} maxConcurrent=${maxConcurrent}${routesPart}`);
	};

	const scheduleIdleClose = () => {
		if (idleTimer !== null) clearTimer(idleTimer);
		idleTimer = setTimer(() => {
			idleTimer = null;
			fireFinal();
		}, idleWindowMs);
	};

	return {
		record(url: string): RecordHandle {
			if (!active) {
				return { finish: () => {} };
			}
			count += 1;
			inFlight += 1;
			if (inFlight > maxConcurrent) maxConcurrent = inFlight;
			if (startedAt === null) {
				startedAt = now();
				firstRequestUrl = url;
			}
			const route = classifyBootRoute(url);
			perRoute[route] = (perRoute[route] ?? 0) + 1;
			if (summaryEvery > 0 && count % summaryEvery === 0) {
				// Same `startedAt === 0` consideration as in fireFinal().
				const ms = startedAt !== null ? now() - startedAt : 0;
				options.log(`[hmr-ws][cold-boot] progress modules=${count} ms=${ms} inFlight=${inFlight} maxConcurrent=${maxConcurrent}`);
			}
			scheduleIdleClose();
			let finished = false;
			return {
				finish() {
					if (finished) return;
					finished = true;
					if (inFlight > 0) inFlight -= 1;
				},
			};
		},
		finalize() {
			if (idleTimer !== null) {
				clearTimer(idleTimer);
				idleTimer = null;
			}
			fireFinal();
		},
		getState() {
			return { active, count, inFlight, maxConcurrent, startedAt, firstRequestUrl, perRoute: { ...perRoute } };
		},
	};
}

export type PopulateInitialGraphSummary = {
	moduleCount: number;
	durationMs: number;
	graphVersion: number;
	bumpedVersion: boolean;
};

// Summary line for `populateInitialGraph`. Stable shape so CI greps or
// external dashboards can pick it up without fragile regexes.
export function formatPopulateInitialGraphSummary(input: PopulateInitialGraphSummary): string {
	return `[hmr-ws][populate] modules=${Math.max(0, Math.floor(input.moduleCount))} ms=${Math.max(0, Math.floor(input.durationMs))} graphVersion=${Math.max(0, Math.floor(input.graphVersion))} bumpedVersion=${input.bumpedVersion ? 'yes' : 'no'}`;
}

export type HmrUpdateKind = 'ts' | 'html' | 'css' | 'vue' | 'tsx' | 'jsx' | 'js' | 'mjs' | 'unknown';

/**
 * Classify a file's HMR update kind by extension. Used by the server-side
 * update summary so a quick log line tells us which pipeline ran. Returns
 * `'unknown'` for anything that doesn't match a known dev-time extension —
 * the caller decides whether to log it or skip it entirely.
 */
export function classifyHmrUpdateKind(file: string): HmrUpdateKind {
	if (!file || typeof file !== 'string') return 'unknown';
	const lower = file.toLowerCase();
	if (lower.endsWith('.ts')) return 'ts';
	if (lower.endsWith('.tsx')) return 'tsx';
	if (lower.endsWith('.jsx')) return 'jsx';
	if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
	if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.sass') || lower.endsWith('.less')) return 'css';
	if (lower.endsWith('.vue')) return 'vue';
	if (lower.endsWith('.mjs')) return 'mjs';
	if (lower.endsWith('.js')) return 'js';
	return 'unknown';
}

export type HmrUpdateSummary = {
	/** Project-relative or absolute path of the file that triggered HMR. */
	file: string;
	/** File classification. */
	kind: HmrUpdateKind;
	/** Time spent waiting for `populateInitialGraph` to complete (ms). */
	awaitMs: number;
	/** Time spent in framework-specific work (graph updates, invalidation). */
	frameworkMs: number;
	/** Time spent broadcasting the WebSocket message. */
	broadcastMs: number;
	/** End-to-end handler time. */
	totalMs: number;
	/** Number of modules invalidated by the update. */
	invalidated: number;
	/** Number of HMR clients the message was sent to. */
	recipients: number;
	/**
	 * Angular-only narrowing decision: whether transitive-importer
	 * invalidation was narrowed because the changed file lacks Angular
	 * semantic decorators (`@Component`/`@Directive`/`@Pipe`/`@Injectable`/
	 * `@NgModule`). `true` means narrow (importers preserved, ESM live
	 * bindings carry the change). `false` means broad (importers also
	 * invalidated). `null`/`undefined` means the field is not applicable
	 * to this update (e.g. CSS, non-Angular flavor) and the field is
	 * omitted from the summary line entirely.
	 */
	narrowed?: boolean | null;
};

/**
 * Single-line summary for the server side of an HMR update. Always-on so
 * a 6-second `.ts` save is immediately visible without flipping verbose.
 * Format:
 *   [hmr-ws][update] kind=ts file=/src/foo.ts await=12ms framework=180ms broadcast=2ms total=194ms invalidated=23 recipients=1
 *
 * For Angular `.ts` updates, `narrowed=yes|no` is appended so the
 * narrowing decision is immediately visible without flipping verbose:
 *   [hmr-ws][update] kind=ts file=/src/app/foo.constants.ts ... invalidated=1 recipients=1 narrowed=yes
 *   [hmr-ws][update] kind=ts file=/src/app/foo.component.ts ... invalidated=132 recipients=1 narrowed=no
 */
export function formatHmrUpdateSummary(input: HmrUpdateSummary): string {
	const parts = [`kind=${input.kind || 'unknown'}`, `file=${input.file || '<unknown>'}`, `await=${Math.max(0, Math.floor(input.awaitMs))}ms`, `framework=${Math.max(0, Math.floor(input.frameworkMs))}ms`, `broadcast=${Math.max(0, Math.floor(input.broadcastMs))}ms`, `total=${Math.max(0, Math.floor(input.totalMs))}ms`, `invalidated=${Math.max(0, Math.floor(input.invalidated))}`, `recipients=${Math.max(0, Math.floor(input.recipients))}`];
	if (input.narrowed === true) {
		parts.push('narrowed=yes');
	} else if (input.narrowed === false) {
		parts.push('narrowed=no');
	}
	return `[hmr-ws][update] ${parts.join(' ')}`;
}
