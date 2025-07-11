import { platformCheck } from './platform-check';

// importing this helper as a separate file avoids "android" symbol clash with the global android object
import { resources, getApplication, getCurrentActivity, getApplicationContext, getWindow, getResources, getPackageName, getInputMethodManager, showSoftInput, dismissSoftInput } from './native-helper-for-android';

export const android = {
	resources,
	getApplication,
	getCurrentActivity,
	getApplicationContext,
	getWindow,
	getResources,
	getPackageName,
	getInputMethodManager,
	showSoftInput,
	dismissSoftInput,
};

/**
 * @deprecated Use `Utils.android` instead.
 */
export const ad = android;

// these don't exist on Android.Stub them to empty functions.
export const iOSNativeHelper = platformCheck('Utils.iOSNativeHelper');
export const ios = platformCheck('Utils.ios');
