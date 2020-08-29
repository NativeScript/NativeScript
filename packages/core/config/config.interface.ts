interface IConfigPlaform {
	/**
	 * App's bundle id
	 */
	id?: string;
	/**
	 * Discard any uncaught JS exceptions
	 * This can be very useful in production environments when you don't want your app to just crash if a developer forgot to guard against an unexpected JS level exception.
	 */
	discardUncaughtJsExceptions?: boolean;
}

interface IConfigIOS extends IConfigPlaform {}

interface IConfigAndroid extends IConfigPlaform {
	v8Flags?: string;

	codeCache?: boolean;

	heapSnapshotScript?: string;

	'snapshot.blob'?: string;

	profilerOutputDir?: string;

	gcThrottleTime?: number;

	profiling?: string;

	markingMode?: string;

	handleTimeZoneChanges?: boolean;

	maxLogcatObjectSize?: number;

	forceLog?: boolean;

	memoryCheckInterval?: number;

	freeMemoryRatio?: number;

	suppressCallJSMethodExceptions?: boolean;

	enableLineBreakpoints?: boolean;

	enableMultithreadedJavascript?: boolean;
}

export interface NativeScriptConfig {
	/**
	 * App's bundle id
	 * Used for both iOS and Android if they use the same bundle id. You can override per platform in the respective platform specific configurations.
	 */
	id?: string;
	/**
	 * App's main entry file
	 */
	main?: string;
	appPath?: string;
	/**
	 * App_Resources path
	 * This is often at the root or inside `src` or `app` directory however can be anywhere.
	 */
	appResourcesPath?: string;
	shared?: boolean;
	previewAppSchema?: string;
	overridePods?: string;
	/**
	 * Custom webpack config path
	 * The default is `webpack.config.js` in the root however you can use a custom name and place elsewhere.
	 */
	webpackConfigPath?: string;
	/**
	 * iOS specific configurations
	 * Various iOS specific configurations including iOS runtime flags.
	 */
	ios?: IConfigIOS;
	/**
	 * Android specific configurations
	 * Various Android specific configurations including Android runtime flags.
	 */
	android?: IConfigAndroid;
}
