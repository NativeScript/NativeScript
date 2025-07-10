/**
 * Keep this helper file slim to avoid circular dependencies.
 * Used to define helper functions and variables that are shared between Android and iOS
 * without introducing platform-specific code directly.
 * It should not import platform-specific modules directly.
 */
let nativeApp: UIApplication | android.app.Application;

/**
 * Get the current application instance.
 * @returns current application instance, UIApplication on iOS or android.app.Application on Android.
 */
export function getNativeApp() {
	return nativeApp;
}

/**
 * This is called internally to set the native application instance.
 * You typically do not need to call this directly.
 * However, it's exposed for special case purposes, such as custom application initialization.
 * @param app The native application instance to set.
 * This should be called once during application startup to set the native app instance.
 */
export function setNativeApp(app: UIApplication | android.app.Application) {
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
