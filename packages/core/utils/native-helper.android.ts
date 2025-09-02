import { platformCheck } from './platform-check';

// importing this helper as a separate file avoids "android" symbol clash with the global android object
import { resources, collections, getWindow, getApplication, getCurrentActivity, getApplicationContext, getResources, getPackageName, getInputMethodManager, showSoftInput, dismissSoftInput, setStatusBarColor, setNavigationBarColor, setDarkModeHandler } from './native-helper-for-android';
export { dataSerialize, dataDeserialize } from './native-helper-for-android';

export { getWindow } from './native-helper-for-android';

export const android = {
	resources,
	collections,
	getApplication,
	getCurrentActivity,
	getApplicationContext,
	getWindow,
	getResources,
	getPackageName,
	getInputMethodManager,
	showSoftInput,
	dismissSoftInput,
	setStatusBarColor,
	setNavigationBarColor,
	setDarkModeHandler,
};

/**
 * @deprecated Use `Utils.android` instead.
 */
export const ad = android;

// these don't exist on Android.Stub them to empty functions.
export const iOSNativeHelper = platformCheck('Utils.iOSNativeHelper');
export const ios = platformCheck('Utils.ios');
