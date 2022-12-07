import type { InstrumentationMode } from '../profiling';

interface IConfigPlatform {
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

interface IConfigIOS extends IConfigPlatform {}

interface IConfigAndroid extends IConfigPlatform {
	/**
	 * These are the v8 runtime flags you can pass in, you must have "--expose_gc" as this is used in the runtime
	 */
	v8Flags?: string;

	/**
	 * Enable code cache by setting this to "true"
	 */
	codeCache?: boolean;

	/**
	 * Depreciated
	 * Do not change
	 */
	heapSnapshotScript?: string;

	/**
	 * Depreciated
	 * Do No change - File to use for Snapshots
	 */
	SnapshotFile?: string;

	/**
	 * Directory of profiler out put files
	 */
	profilerOutputDir?: string;

	/**
	 * How frequently in MS to automatically trigger a gc (0 = Disabled & Default)
	 * Docs: https://docs.nativescript.org/core-concepts/android-runtime/advanced-topics/memory-management
	 */
	gcThrottleTime?: number;

	/**
	 * "none" & "full" is supported, "full" is depreciated
	 * Default: none
	 */
	markingMode?: string;

	/**
	 * Allow time zone changes to notify app, default: false
	 */
	handleTimeZoneChanges?: boolean;

	/**
	 * Maximum size of a single output string; default: 1024
	 */
	maxLogcatObjectSize?: number;

	/**
	 * Enable logging in Release applications, default: false
	 */
	forceLog?: boolean;

	/**
	 * How frequently in ms that it does the freeMemoryRatio check
	 * Docs: https://docs.nativescript.org/core-concepts/android-runtime/advanced-topics/memory-management
	 */
	memoryCheckInterval?: number;

	/**
	 * Percentage of memory (0.0 to 1.0) before it forces a GC (default & disabled = 0)
	 * Paired with he memoryCheckInterval
	 * Docs: https://docs.nativescript.org/core-concepts/android-runtime/advanced-topics/memory-management
	 */
	freeMemoryRatio?: number;

	/**
	 * Used for Advanced debugging
	 */
	enableLineBreakpoints?: boolean;

	/**
	 * Enable the multithreaded JavaScript engine, this will probably break plugins...
	 * Default: false - disabled.
	 */
	enableMultithreadedJavascript?: boolean;
}

interface IConfigCLI {
	/**
	 * Set the package manager to use for this project.
	 * Defaults to the CLI set package manager, or `npm` if not set globally
	 */
	packageManager: 'yarn' | 'pnpm' | 'npm';

	/**
	 * Optional - Override the files or paths to clean when running the `ns clean` command
	 */
	pathsToClean?: string[];

	/**
	 * Optional - Additional files or paths to clean when running the `ns clean` command, the paths are appended to the default list of paths.
	 */
	additionalPathsToClean?: string[];
}

interface IConfigHook {
	// prettier-ignore
	/**
	 * Event name for when to run the hook.
	 * Possible event names are any of the following with the pattern
	 * `before-*` and `after-*`
	 *
	 *	* `buildAndroidPlugin` - Builds aar file for Android plugin, runs during prepareNativeApp
	 *	* `buildAndroid` - Builds Android app
	 *	* `buildIOS` - Builds iOS app
	 *	* `checkEnvironment` - Validate project env, runs during ns doctor, clean, and most build commands
	 *	* `checkForChanges` - Changes occurred during watch
	 *	* `install` - Application installed to device/emulator
	 *	* `prepare` - Compiles webpack and prepares native app in platforms folder
	 *	* `prepareNativeApp` - Preparing the actual native app, runs during prepare/watch hook
	 *	* `resolveCommand` - Resolves command and arguments, runs before all cli commands
	 *	* `watch` - Setup watchers for live sync, runs during prepare hook
	 *	* `watchPatterns` - Setup watch patterns, runs during watch hook
	 */
	type:
		| 'before-buildAndroidPlugin'	| 'after-buildAndroidPlugin'
		| 'before-buildAndroid'			| 'after-buildAndroid'
		| 'before-buildIOS'				| 'after-buildIOS'
		| 'before-checkEnvironment'		| 'after-checkEnvironment'
		| 'before-checkForChanges'		| 'after-checkForChanges'
		| 'before-install'				| 'after-install'
		| 'before-prepare'				| 'after-prepare'
		| 'before-prepareNativeApp'		| 'after-prepareNativeApp'
		| 'before-resolveCommand'		| 'after-resolveCommand'
		| 'before-watch'				| 'after-watch'
		| 'before-watchPatterns'		| 'after-watchPatterns';

	/**
	 * Path to the hook script file to run
	 */
	script: string;
}

export interface NativeScriptConfig {
	/**
	 * App's bundle id
	 * Used for both iOS and Android if they use the same bundle id. You can override per platform in the respective platform specific configurations.
	 */
	id?: string;
	/**
	 * App's main entry file - this setting overrides the value set in package.json
	 */
	main?: string;
	/**
	 * Path to the app source directory
	 * This is often the `src` or `app` directory however can be changed.
	 */
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
	/**
	 * Enable profiling for the application. Default: no profiling
	 * In most cases when profiling, you will want to use "timeline"
	 */
	profiling?: InstrumentationMode;
	/**
	 * Set the default CSS parser that NativeScript will use.
	 * Default: css-tree
	 */
	cssParser?: 'rework' | 'nativescript' | 'css-tree';

	/**
	 * Optionally specify a list of npm package names for which you would like the NativeScript CLI to ignore when attaching native dependencies to the build
	 */
	ignoredNativeDependencies?: string[];

	/**
	 * Set cli options
	 */
	cli?: IConfigCLI;

	/**
	 * Set project persistent hooks to run
	 */
	hooks?: IConfigHook[];
}
