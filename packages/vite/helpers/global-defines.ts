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
		// The dev server drops it: served modules get their own require (hmr/server/module-require.ts).
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
