import { getProjectAppPath, getProjectAppVirtualPath } from './utils.js';

const APP_ROOT_DIR = getProjectAppPath();
const APP_ROOT_VIRTUAL = getProjectAppVirtualPath();

/**
 * alpha.62 follow-up — opt-out flag for the HMR-applying progress
 * overlay introduced in Round-eleven.3.
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
	return {
		// Define platform flags for runtime checks
		__ANDROID__: JSON.stringify(opts.platform === 'android'),
		__IOS__: JSON.stringify(opts.platform === 'ios'),
		__VISIONOS__: JSON.stringify(opts.platform === 'visionos'),
		__APPLE__: JSON.stringify(opts.platform === 'ios' || opts.platform === 'visionos'),
		__DEV__: JSON.stringify(opts.targetMode === 'development'),
		__COMMONJS__: false,
		__NS_WEBPACK__: false,
		__NS_ENV_VERBOSE__: JSON.stringify(opts.verbose),
		__NS_TARGET_FLAVOR__: JSON.stringify(opts.flavor),
		// whether to show the HMR in-progress overlay.
		__NS_HMR_PROGRESS_OVERLAY_ENABLED__: JSON.stringify(isHmrProgressOverlayEnabled()),
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
