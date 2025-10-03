/**
 * Do not import other files here to avoid circular dependencies.
 * Used to define helper functions and variables that are shared between Android and iOS.
 * This file can declare cross platform types and use bundler platform checks.
 * For example, use `__ANDROID__` or `__APPLE__` to check the platform.
 */

/**
 * Application type. UIApplication on iOS or android.app.Application on Android.
 */
type NativeApp = UIApplication | android.app.Application;

let nativeApp: NativeApp;

declare namespace com {
	namespace tns {
		class NativeScriptApplication extends android.app.Application {
			static getInstance(): NativeScriptApplication;
		}

		namespace embedding {
			class ApplicationHolder {
				static getInstance(): android.app.Application;
			}
		}
	}
}

function isEmbedded(): boolean {
	if (__APPLE__) {
		return !!NativeScriptEmbedder.sharedInstance().delegate;
	} else {
		// @ts-ignore
		// Check if the Bootstrap class exists and has the isEmbeddedNativeScript property
		// This is a way to determine if the app is embedded in a host project.
		return org.nativescript?.Bootstrap?.isEmbeddedNativeScript;
	}
}

/**
 * Get the current application instance.
 * @returns current application instance, UIApplication on iOS or android.app.Application on Android.
 */
export function getNativeApp<T extends NativeApp>(): T {
	if (__ANDROID__) {
		if (!nativeApp) {
			// Try getting it from module - check whether application.android.init has been explicitly called
			// check whether the com.tns.NativeScriptApplication type exists
			if (com.tns.NativeScriptApplication) {
				nativeApp = com.tns.NativeScriptApplication.getInstance();
			}

			if (!nativeApp && isEmbedded()) {
				nativeApp = com.tns.embedding.ApplicationHolder.getInstance();
			}

			// the getInstance might return null if com.tns.NativeScriptApplication exists but is not the starting app type
			if (!nativeApp) {
				// Handle custom application type by getting current application through reflection
				// This is a fallback for cases where a custom application type is provided
				// and the user has not explicitly initialized the application module
				try {
					const clazz = java.lang.Class.forName('android.app.ActivityThread');
					if (clazz) {
						const method = clazz.getMethod('currentApplication', null);
						if (method) {
							nativeApp = method.invoke(null, null);
						}
					}
				} catch (error) {
					// Reflection failed, this is expected in some edge cases
					// The app should still function, but without native app reference
					if (__DEV__) {
						console.warn('Failed to retrieve native application instance via reflection:', error);
					}
				}
			}
		}
	}
	return nativeApp! as T;
}

/**
 * This is called internally to set the native application instance.
 * You typically do not need to call this directly.
 * However, it's exposed for special case purposes, such as custom application initialization.
 * @param app The native application instance to set.
 * This should be called once during application startup to set the native app instance.
 */
export function setNativeApp(app: NativeApp) {
	nativeApp = app;
}

let rootView: any;

/**
 * Get the current root view of the application.
 * @returns The current root view instance or undefined if not set.
 */
export function getRootView() {
	return rootView;
}

/**
 * Set the root view of the application.
 * This is typically called internally during application initialization.
 * @param view The root view instance to set.
 */
export function setRootView(view: any) {
	rootView = view;
}

let _appInBackground: boolean = false;

/**
 * Check if the application is currently in the background.
 * @returns true if the app is in background, false if in foreground.
 */
export function isAppInBackground(): boolean {
	return _appInBackground;
}

/**
 * Set the application background state.
 * This is typically called internally when the app enters/exits background.
 * @param value true if app is entering background, false if entering foreground.
 */
export function setAppInBackground(value: boolean): void {
	_appInBackground = value;
}

let _iosWindow: UIWindow;
export function getiOSWindow(): UIWindow {
	return _iosWindow;
}
export function setiOSWindow(value: UIWindow) {
	_iosWindow = value;
}

let _appMainEntry: any /* NavigationEntry */;

export function getAppMainEntry(): any /* NavigationEntry */ {
	return _appMainEntry;
}
export function setAppMainEntry(entry: any /* NavigationEntry */) {
	_appMainEntry = entry;
}

// Aids avoiding circular dependencies by allowing the application event listeners to be toggled
let _toggleApplicationEventListenersHandler: (toAdd: boolean, callback: (args: any) => void) => void;
export function toggleApplicationEventListeners(toAdd: boolean, callback: (args: any) => void) {
	if (_toggleApplicationEventListenersHandler) {
		_toggleApplicationEventListenersHandler(toAdd, callback);
	}
}
export function setToggleApplicationEventListenersCallback(callback: (toAdd: boolean, callback: (args: any) => void) => void) {
	_toggleApplicationEventListenersHandler = callback;
}

// Aids avoiding circular dependencies by allowing the application properties to be retrieved
type ApplicationPropertyValues = { orientation: 'portrait' | 'landscape' | 'unknown'; systemAppearance: 'dark' | 'light' | null };
let _applicationPropertiesCallback: () => ApplicationPropertyValues;
export function getApplicationProperties(): ApplicationPropertyValues {
	if (_applicationPropertiesCallback) {
		return _applicationPropertiesCallback();
	}
	return { orientation: 'unknown', systemAppearance: null };
}
export function setApplicationPropertiesCallback(callback: () => ApplicationPropertyValues) {
	_applicationPropertiesCallback = callback;
}

let _a11yUpdatePropertiesCallback: (view: any /* View */) => void;
export function setA11yUpdatePropertiesCallback(callback: (view: any /* View */) => void) {
	_a11yUpdatePropertiesCallback = callback;
}
export function updateA11yPropertiesCallback(view: any /* View */) {
	if (_a11yUpdatePropertiesCallback) {
		_a11yUpdatePropertiesCallback(view);
	}
}

/**
 * Internal Android app helpers
 */
let _imageFetcher: org.nativescript.widgets.image.Fetcher;
export function getImageFetcher(): org.nativescript.widgets.image.Fetcher {
	return _imageFetcher;
}
export function setImageFetcher(fetcher: org.nativescript.widgets.image.Fetcher) {
	_imageFetcher = fetcher;
}
export enum CacheMode {
	none,
	memory,
	diskAndMemory,
}

let _currentCacheMode: CacheMode;

export function initImageCache(context: android.content.Context, mode = CacheMode.diskAndMemory, memoryCacheSize = 0.25, diskCacheSize: number = 10 * 1024 * 1024): void {
	if (_currentCacheMode === mode) {
		return;
	}

	_currentCacheMode = mode;
	if (!getImageFetcher()) {
		setImageFetcher(org.nativescript.widgets.image.Fetcher.getInstance(context));
	} else {
		getImageFetcher().clearCache();
	}

	const params = new org.nativescript.widgets.image.Cache.CacheParams();
	params.memoryCacheEnabled = mode !== CacheMode.none;
	params.setMemCacheSizePercent(memoryCacheSize); // Set memory cache to % of app memory
	params.diskCacheEnabled = mode === CacheMode.diskAndMemory;
	params.diskCacheSize = diskCacheSize;
	const imageCache = org.nativescript.widgets.image.Cache.getInstance(params);
	getImageFetcher().addImageCache(imageCache);
	getImageFetcher().initCache();
}
