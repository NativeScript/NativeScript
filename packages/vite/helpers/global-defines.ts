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
 * Canonical runtime define VALUES, shared by every emitter:
 *   1. Vite `define` substitution — `getGlobalDefines` below
 *   2. the bundle entry's `virtual:ns-defines-seed` module — main-entry.ts
 *
 * Both MUST agree, or the bundle seed and the substituted code disagree on
 * platform flags. Add new defines HERE.
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
 * The COMPLETE set of globals the bundle entry's defines-seed module must
 * plant. Superset of {@link getRuntimeDefineValues}: also carries every
 * `__NS_*__` value that raw-served runtime files consume. Vite's `define`
 * substitution never reaches those files (the HMR client and framework
 * clients are served raw from node_modules/dist), so any define they read
 * MUST also exist on globalThis or its build-time fallback silently wins —
 * which is how `NS_VITE_PROGRESS_OVERLAY=0`
 * historically never reached the device, and how '/src'-defaulted app roots
 * broke 'app/'-rooted projects. Rule: add a define consumed by client code →
 * add it HERE, and read it with a `globalThis` fallback at the consumer.
 */
export function getRuntimeSeedValues(opts: { platform?: string; isDevMode: boolean; verbose: boolean; flavor: string; isCI?: boolean }): Record<string, unknown> {
	const values = getRuntimeDefineValues(opts);
	return {
		...values,
		// Legacy runtime globals (`global.isIOS` / `global.isAndroid`): the
		// bundle build text-substitutes these member expressions via `define`
		// (see getGlobalDefines), but raw-served HMR modules never get that
		// substitution — app code branching on `global.isIOS` falls into its
		// Android path on iOS. Seed the real globals so member-access reads
		// behave identically under HMR. globalThis-only on purpose: a module-scope
		// binding would collide with `import { isIOS } from '@nativescript/core'`.
		isAndroid: values.__ANDROID__,
		isIOS: values.__APPLE__,
		// Runtime flavor for the raw-served HMR client's TARGET_FLAVOR resolution.
		__NS_TARGET_FLAVOR__: opts.flavor,
		// App-root virtual path — every served-id → moduleName mapping (frame
		// navigation targets, modal re-present matching) depends on this.
		__NS_APP_ROOT_DIR__: APP_ROOT_DIR,
		__NS_APP_ROOT_VIRTUAL__: APP_ROOT_VIRTUAL,
		// HMR-applying overlay opt-out (NS_VITE_PROGRESS_OVERLAY=0).
		__NS_HMR_PROGRESS_OVERLAY_ENABLED__: isHmrProgressOverlayEnabled(),
		__CI__: !!opts.isCI,
	};
}

/**
 * Unconditional `globalThis.<key> = <value>;` statements — the bundle entry's
 * defines-seed module body (evaluates as a leaf before any sibling import).
 * Accepts the full seed map; `Infinity` is serialized explicitly because
 * `JSON.stringify(Infinity)` is the string "null".
 */
export function buildGlobalSeedStatements(values: Record<string, unknown>): string[] {
	return Object.entries(values).map(([key, value]) => `globalThis.${key} = ${typeof value === 'number' && !Number.isFinite(value) ? 'Infinity' : JSON.stringify(value)};`);
}

// ── User-configured `__FOO__` defines ─────────────────────────────────────────
// An app may add its own `__FOO__`-style entries to Vite `config.define`
// (e.g. `__NS_NATIVE_OVERRIDES__`). The dev deps bundle is built by esbuild,
// outside Vite's define substitution, so it needs them handed over explicitly.
// Captured from the resolved config in `configResolved`.
const USER_DEFINE_IDENTIFIER_RE = /^__[A-Za-z0-9_]+__$/;
let userDefineEntries: Array<[string, string]> = [];

/**
 * Record the app's `__FOO__`-style `define` entries from the resolved Vite
 * config. Only bare `__FOO__` identifiers are kept. Vite `define` VALUES are
 * JS-expression strings (e.g. `"true"`), so they pass through verbatim; a
 * non-string value is JSON-encoded defensively.
 */
export function setUserDefineEntries(define: Record<string, unknown> | undefined): void {
	const entries: Array<[string, string]> = [];
	if (define) {
		for (const [key, value] of Object.entries(define)) {
			if (!USER_DEFINE_IDENTIFIER_RE.test(key)) continue;
			entries.push([key, typeof value === 'string' ? value : JSON.stringify(value)]);
		}
	}
	userDefineEntries = entries;
}

/** The captured `__FOO__` define entries as `[key, expression]` pairs (see setUserDefineEntries). */
export function getUserDefineEntries(): ReadonlyArray<[string, string]> {
	return userDefineEntries;
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
		// webpack exposes `__non_webpack_require__` (its APIPlugin) as the native,
		// non-bundler require. Some NativeScript plugins (e.g. @nativescript/firebase-core's
		// Android config reader) reference it unguarded. Map it to the runtime's
		// global require so those plugins work under Vite/Rolldown too. Raw
		// expression (NOT JSON.stringified) so it substitutes as code, not a string.
		__non_webpack_require__: 'globalThis.require',
		__NS_ENV_VERBOSE__: JSON.stringify(values.__NS_ENV_VERBOSE__),
		__NS_TARGET_FLAVOR__: JSON.stringify(opts.flavor),
		// whether to show the HMR in-progress overlay.
		__NS_HMR_PROGRESS_OVERLAY_ENABLED__: JSON.stringify(isHmrProgressOverlayEnabled()),
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
