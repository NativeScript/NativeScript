// Types
import { EventData } from '../data/observable';
import { View } from '../ui/core/view';

/**
 * An extended JavaScript Error which will have the nativeError property initialized in case the error is caused by executing platform-specific code.
 */
export interface NativeScriptError extends Error {
	/**
	 * Represents the native error object.
	 */
	nativeError: any;
}

export interface ApplicationEventData extends EventData {
	/**
	 * UIApplication or undefined, unless otherwise specified. Prefer explicit
	 * properties where possible.
	 */
	ios?: any;
	/**
	 * androidx.appcompat.app.AppCompatActivity or undefined, unless otherwise
	 * specified. Prefer explicit properties where possible.
	 */
	android?: any;
	/**
	 * Careful with this messy type. A significant refactor is needed to make it
	 * strictly extend EventData['object'], which is an Observable. It's used in
	 * various ways:
	 * - By font-scale: the Application module, typeof import('.')
	 * - Within index.android.ts: AndroidApplication
	 * - Within index.ios.ts: iOSApplication
	 */
	object: any;
}

export interface LaunchEventData extends ApplicationEventData {
	/**
	 * The value stored into didFinishLaunchingWithOptions notification's
	 * userInfo under 'UIApplicationLaunchOptionsLocalNotificationKey';
	 * otherwise, null.
	 */
	ios: unknown;
	root?: View | null;
	savedInstanceState?: any /* android.os.Bundle */;
}

export interface OrientationChangedEventData extends ApplicationEventData {
	android: any /* globalAndroid.app.Application */;
	newValue: 'portrait' | 'landscape' | 'unknown';
}

export interface SystemAppearanceChangedEventData extends ApplicationEventData {
	android: any /* globalAndroid.app.Application */;
	newValue: 'light' | 'dark';
}

export interface UnhandledErrorEventData extends ApplicationEventData {
	ios?: NativeScriptError;
	android?: NativeScriptError;
	error: NativeScriptError;
}

export interface DiscardedErrorEventData extends ApplicationEventData {
	error: NativeScriptError;
}

export interface CssChangedEventData extends ApplicationEventData {
	cssFile?: string;
	cssText?: string;
}

export interface AndroidActivityEventData extends ApplicationEventData {
	activity: any /* androidx.appcompat.app.AppCompatActivity */;
	object: any /* AndroidApplication */;
}

export interface AndroidActivityBundleEventData extends AndroidActivityEventData {
	bundle: any /* android.os.Bundle */;
}

export interface AndroidActivityRequestPermissionsEventData extends AndroidActivityEventData {
	requestCode: number;
	permissions: Array<string>;
	grantResults: Array<number>;
}

export interface AndroidActivityResultEventData extends AndroidActivityEventData {
	requestCode: number;
	resultCode: number;
	intent: any /* android.content.Intent */;
}

export interface AndroidActivityNewIntentEventData extends AndroidActivityEventData {
	intent: any /* android.content.Intent */;
}

export interface AndroidActivityBackPressedEventData extends AndroidActivityEventData {
	cancel: boolean;
}

/**
 * @deprecated
 */
export interface RootViewControllerImpl {
	contentController: any;
}

export interface LoadAppCSSEventData extends ApplicationEventData {
	cssFile: string;
}
