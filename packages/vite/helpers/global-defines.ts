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
	const isAndroid = opts.platform === 'android';
	const isApple = opts.platform === 'ios' || opts.platform === 'visionos';
	return {
		// Define platform flags for runtime checks
		__ANDROID__: JSON.stringify(isAndroid),
		__IOS__: JSON.stringify(opts.platform === 'ios'),
		__VISIONOS__: JSON.stringify(opts.platform === 'visionos'),
		__APPLE__: JSON.stringify(isApple),
		'global.isAndroid': JSON.stringify(isAndroid),
		'global.isIOS': JSON.stringify(isApple),
		__DEV__: JSON.stringify(opts.targetMode === 'development'),
		__COMMONJS__: false,
		__NS_WEBPACK__: false,
		// webpack exposes `__non_webpack_require__` (its APIPlugin) as the native,
		// non-bundler require. Some NativeScript plugins (e.g. @nativescript/firebase-core's
		// Android config reader) reference it unguarded. Map it to the runtime's
		// global require so those plugins work under Vite/Rolldown too. Raw
		// expression (NOT JSON.stringified) so it substitutes as code, not a string.
		__non_webpack_require__: 'globalThis.require',
		__NS_ENV_VERBOSE__: JSON.stringify(!!opts.verbose),
		// whether to show the HMR in-progress overlay.
		__NS_HMR_PROGRESS_OVERLAY_ENABLED__: JSON.stringify(isHmrProgressOverlayEnabled()),
		__CSS_PARSER__: JSON.stringify('css-tree'),
		__UI_USE_XML_PARSER__: true,
		__UI_USE_EXTERNAL_RENDERER__: false,
		// various ecosystems use this global (react for example)
		__TEST__: false,
		// determine if running in CI environment
		__CI__: JSON.stringify(!!opts.isCI),
		// Critical for various integrations (e.g. Vue only includes hmr runtime on this condition)
		'process.env.NODE_ENV': JSON.stringify(opts.targetMode === 'development' ? 'development' : 'production'),
	};
}
