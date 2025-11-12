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
