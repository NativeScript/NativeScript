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
				// TODO: Should we handle the case when a custom application type is provided and the user has not explicitly initialized the application module?
				const clazz = java.lang.Class.forName('android.app.ActivityThread');
				if (clazz) {
					const method = clazz.getMethod('currentApplication', null);
					if (method) {
						nativeApp = method.invoke(null, null);
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

export function getRootView() {
	return rootView;
}

export function setRootView(view: any) {
	rootView = view;
}

let _appInBackground: boolean = false;
export function isAppInBackground() {
	return _appInBackground;
}
export function setAppInBackground(value: boolean) {
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
