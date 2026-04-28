import { getProjectAppPath, getProjectAppVirtualPath } from './utils.js';

const APP_ROOT_DIR = getProjectAppPath();
const APP_ROOT_VIRTUAL = getProjectAppVirtualPath();

/**
 * Opt-out flag for the HMR-applying progress overlay.
 *
 * Default: enabled. Set `NS_VITE_PROGRESS_OVERLAY=0` (or `false`) in
 * the environment to suppress the overlay if a developer finds it
 * distracting. We accept the same falsy spellings webpack-era tooling
 * used (`0`, `false`, `off`, `no`) and treat anything else as
 * enabled-by-default; this avoids surprising users who pass quoted
 * truthy strings ("1", "true").
 */
export function isHmrProgressOverlayEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
	const raw = (env.NS_VITE_PROGRESS_OVERLAY ?? '').toString().trim().toLowerCase();
	if (!raw) return true;
	return !['0', 'false', 'off', 'no'].includes(raw);
}

/**
 * Kickstart-eligibility threshold for the parallel HMR prefetch
 * (`__nsKickstartHmrPrefetch`).
 *
 * Why a threshold exists. The kickstart fetches the SERVER-computed
 * inverse-dep closure (`evictPaths`) in parallel before V8 starts
 * its module walk, which is a clean win when the closure size is
 * close to what V8 will actually re-evaluate on the next import. For
 * a typical Angular component edit (`*.component.ts` / `.html`) the
 * closure contains ~5–30 modules and almost all of them sit on the
 * live forward path from the entry, so fan-out beats sequential
 * `HttpFetchText` calls by 3–5×.
 *
 * The picture inverts for `.ts` files with deep inverse-dep fan-in
 * (constants files, design-system enums, shared utilities). The
 * server faithfully reports the entire inverse closure (often
 * 100–300 importers), but V8's forward walk on re-import only
 * re-evaluates the ~20–30 modules that sit on the currently-rendered
 * route's path. The kickstart's parallel wave then over-fetches the
 * other ~70–270 importers — and Vite's single-threaded transform
 * pipeline cannot keep up with 16-way concurrent demand, so each
 * fetch's tail latency balloons. Net result: a "should-be-200ms"
 * HMR cycle becomes 6+ seconds.
 *
 * The threshold short-circuits the kickstart when `evictPaths.length`
 * exceeds the configured cap. The HMR cycle still completes
 * correctly — V8 falls back to per-module synchronous fetches.
 *
 * Default: 32. Empirically chosen so component-shaped closures
 * (typically 5–30) keep the kickstart speed-up while wide-fan-in
 * leaf edits (typically 100+) skip it. Override with
 * `NS_VITE_KICKSTART_MAX_URLS=N` (any non-negative integer) — `0`
 * disables the kickstart entirely; `Infinity` removes the cap.
 */
export const HMR_KICKSTART_DEFAULT_MAX_URLS = 32;

export function resolveHmrKickstartMaxUrls(env: NodeJS.ProcessEnv = process.env): number {
	const raw = (env.NS_VITE_KICKSTART_MAX_URLS ?? '').toString().trim();
	if (!raw) return HMR_KICKSTART_DEFAULT_MAX_URLS;
	const lower = raw.toLowerCase();
	if (lower === 'infinity' || lower === 'unlimited' || lower === 'none') {
		return Number.POSITIVE_INFINITY;
	}
	const parsed = Number(raw);
	if (!Number.isFinite(parsed) || parsed < 0) {
		return HMR_KICKSTART_DEFAULT_MAX_URLS;
	}
	return Math.floor(parsed);
}

export function getGlobalDefines(opts: { platform: string; targetMode: string; verbose: boolean; flavor: string; isCI?: boolean }) {
	return {
		// Define platform flags for runtime checks
		__ANDROID__: JSON.stringify(opts.platform === 'android'),
		__IOS__: JSON.stringify(opts.platform === 'ios'),
		__VISIONOS__: JSON.stringify(opts.platform === 'visionos'),
		__APPLE__: JSON.stringify(opts.platform === 'ios' || opts.platform === 'visionos'),
		'global.isAndroid': JSON.stringify(opts.platform === 'android'),
		'global.isIOS': JSON.stringify(opts.platform === 'ios' || opts.platform === 'visionos'),
		__DEV__: JSON.stringify(opts.targetMode === 'development'),
		__COMMONJS__: false,
		__NS_WEBPACK__: false,
		__NS_ENV_VERBOSE__: JSON.stringify(opts.verbose),
		__NS_TARGET_FLAVOR__: JSON.stringify(opts.flavor),
		// whether to show the HMR in-progress overlay.
		__NS_HMR_PROGRESS_OVERLAY_ENABLED__: JSON.stringify(isHmrProgressOverlayEnabled()),
		// Eviction-set size cap for the parallel HMR kickstart.
		// `JSON.stringify(Number.POSITIVE_INFINITY)` is the string
		// "null", so we serialize Infinity ourselves to keep the
		// build-time literal readable in source maps.
		__NS_HMR_KICKSTART_MAX_URLS__: ((): string => {
			const n = resolveHmrKickstartMaxUrls();
			return Number.isFinite(n) ? String(n) : 'Infinity';
		})(),
		__CSS_PARSER__: JSON.stringify('css-tree'),
		__UI_USE_XML_PARSER__: true,
		__UI_USE_EXTERNAL_RENDERER__: false,
		// various ecosystems use this global (react for example)
		__TEST__: false,
		// determine if running in CI environment
		__CI__: JSON.stringify(!!opts.isCI),
		__NS_APP_ROOT_DIR__: JSON.stringify(APP_ROOT_DIR),
		__NS_APP_ROOT_VIRTUAL__: JSON.stringify(APP_ROOT_VIRTUAL),
		// Critical for various integrations (e.g. Vue only includes hmr runtime on this condition)
		'process.env.NODE_ENV': JSON.stringify(opts.targetMode === 'development' ? 'development' : 'production'),
	};
}
