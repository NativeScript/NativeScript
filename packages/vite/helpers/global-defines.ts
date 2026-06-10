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

/**
 * Canonical runtime define VALUES, shared by every emitter:
 *   1. Vite `define` substitution — `getGlobalDefines` below
 *   2. the bundle entry's `virtual:ns-defines-seed` module — main-entry.ts
 *   3. the dev server's per-module shim prelude + guarded platform seed —
 *      processCodeForDevice
 *
 * All three MUST agree. They used to be maintained by hand in three places,
 * and drift produced the HMR boot bug class where the bundle seed said
 * `__APPLE__ = true` while a served module's shim fell back to `false` and
 * ran Android code paths on iOS. Add new defines HERE, then thread them
 * through the builders below.
 */
export interface RuntimeDefineValues {
	__DEV__: boolean;
	__ANDROID__: boolean;
	__IOS__: boolean;
	__VISIONOS__: boolean;
	__APPLE__: boolean;
	__COMMONJS__: boolean;
	__NS_WEBPACK__: boolean;
	__NS_ENV_VERBOSE__: boolean;
	__UI_USE_XML_PARSER__: boolean;
	__UI_USE_EXTERNAL_RENDERER__: boolean;
	__CSS_PARSER__: string;
	__TEST__: boolean;
}

export function getRuntimeDefineValues(opts: { platform?: string; isDevMode: boolean; verbose: boolean }): RuntimeDefineValues {
	const platform = opts.platform || '';
	return {
		__DEV__: !!opts.isDevMode,
		__ANDROID__: platform === 'android',
		__IOS__: platform === 'ios',
		__VISIONOS__: platform === 'visionos',
		__APPLE__: platform === 'ios' || platform === 'visionos',
		__COMMONJS__: false,
		__NS_WEBPACK__: false,
		__NS_ENV_VERBOSE__: !!opts.verbose,
		__UI_USE_XML_PARSER__: true,
		__UI_USE_EXTERNAL_RENDERER__: false,
		__CSS_PARSER__: 'css-tree',
		__TEST__: false,
	};
}

/**
 * Unconditional `globalThis.<key> = <value>;` statements — the bundle entry's
 * defines-seed module body (evaluates as a leaf before any sibling import).
 */
export function buildDefineSeedStatements(values: RuntimeDefineValues): string[] {
	return Object.entries(values).map(([key, value]) => `globalThis.${key} = ${JSON.stringify(value)};`);
}

/**
 * Guarded seed for the dev server's per-module prelude. Under HMR the bundle's
 * externalized core URL imports evaluate BEFORE the bundle body (ESM: imports
 * run before the importer), so the unconditional seed above has NOT run when
 * the HTTP core graph instantiates. Whichever served module evaluates first
 * runs this and seeds globalThis with the correct platform; later modules and
 * the bundle seed see it already set and no-op.
 */
export function buildGuardedDefineSeedStatement(values: RuntimeDefineValues): string {
	return `if (globalThis.__IOS__ === undefined && globalThis.__ANDROID__ === undefined) { globalThis.__ANDROID__ = ${values.__ANDROID__}; globalThis.__IOS__ = ${values.__IOS__}; globalThis.__VISIONOS__ = ${values.__VISIONOS__}; globalThis.__APPLE__ = ${values.__APPLE__}; }\nif (globalThis.__DEV__ === undefined) { globalThis.__DEV__ = ${values.__DEV__}; }`;
}

/**
 * `const <key> = globalThis.<key> !== undefined ? globalThis.<key> : <canonical>;`
 * shim statements injected at the top of every HTTP-served module. The
 * fallbacks are the canonical values themselves, so a module snapshots correct
 * platform flags even if it evaluates before ANY seed has run.
 */
export function buildDefineShimStatements(values: RuntimeDefineValues): string[] {
	return Object.entries(values).map(([key, value]) => `const ${key} = globalThis.${key} !== undefined ? globalThis.${key} : ${JSON.stringify(value)};`);
}

export function getGlobalDefines(opts: { platform: string; targetMode: string; verbose: boolean; flavor: string; isCI?: boolean }) {
	const values = getRuntimeDefineValues({ platform: opts.platform, isDevMode: opts.targetMode === 'development', verbose: opts.verbose });
	return {
		// Define platform flags for runtime checks
		__ANDROID__: JSON.stringify(values.__ANDROID__),
		__IOS__: JSON.stringify(values.__IOS__),
		__VISIONOS__: JSON.stringify(values.__VISIONOS__),
		__APPLE__: JSON.stringify(values.__APPLE__),
		'global.isAndroid': JSON.stringify(values.__ANDROID__),
		'global.isIOS': JSON.stringify(values.__APPLE__),
		__DEV__: JSON.stringify(values.__DEV__),
		__COMMONJS__: values.__COMMONJS__,
		__NS_WEBPACK__: values.__NS_WEBPACK__,
		__NS_ENV_VERBOSE__: JSON.stringify(values.__NS_ENV_VERBOSE__),
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
		__CSS_PARSER__: JSON.stringify(values.__CSS_PARSER__),
		__UI_USE_XML_PARSER__: values.__UI_USE_XML_PARSER__,
		__UI_USE_EXTERNAL_RENDERER__: values.__UI_USE_EXTERNAL_RENDERER__,
		// various ecosystems use this global (react for example)
		__TEST__: values.__TEST__,
		// determine if running in CI environment
		__CI__: JSON.stringify(!!opts.isCI),
		__NS_APP_ROOT_DIR__: JSON.stringify(APP_ROOT_DIR),
		__NS_APP_ROOT_VIRTUAL__: JSON.stringify(APP_ROOT_VIRTUAL),
		// Critical for various integrations (e.g. Vue only includes hmr runtime on this condition)
		'process.env.NODE_ENV': JSON.stringify(opts.targetMode === 'development' ? 'development' : 'production'),
	};
}
