// Types
import { EventData, Observable } from '../data/observable';
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

export interface ApplicationEventData<T extends Observable = Observable> extends EventData<T> {
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

export interface LaunchEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	/**
	 * The value stored into didFinishLaunchingWithOptions notification's
	 * userInfo under 'UIApplicationLaunchOptionsLocalNotificationKey';
	 * otherwise, null.
	 */
	ios: unknown;
	root?: View | null;
	savedInstanceState?: any /* android.os.Bundle */;
}

export interface OrientationChangedEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	android: any /* globalAndroid.app.Application */;
	newValue: 'portrait' | 'landscape' | 'unknown';
}

export interface SystemAppearanceChangedEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	android: any /* globalAndroid.app.Application */;
	newValue: 'light' | 'dark';
}

export interface UnhandledErrorEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	ios?: NativeScriptError;
	android?: NativeScriptError;
	error: NativeScriptError;
}

export interface DiscardedErrorEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	error: NativeScriptError;
}

export interface CssChangedEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	cssFile?: string;
	cssText?: string;
}

export interface AndroidActivityEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	/**
	 * The activity.
	 * androidx.appcompat.app.AppCompatActivity
	 */
	activity: any;

	/**
	 * The name of the event.
	 */
	eventName: string;

	/**
	 * The instance that has raised the event.
	 * AndroidApplication
	 */
	object: T;
}

export interface AndroidActivityBundleEventData<T extends Observable = Observable> extends AndroidActivityEventData<T> {
	bundle: any /* android.os.Bundle */;
}

export interface AndroidActivityRequestPermissionsEventData<T extends Observable = Observable> extends AndroidActivityEventData<T> {
	requestCode: number;
	permissions: Array<string>;
	grantResults: Array<number>;
}

export interface AndroidActivityResultEventData<T extends Observable = Observable> extends AndroidActivityEventData<T> {
	requestCode: number;
	resultCode: number;
	intent: any /* android.content.Intent */;
}

export interface AndroidActivityNewIntentEventData<T extends Observable = Observable> extends AndroidActivityEventData<T> {
	intent: any /* android.content.Intent */;
}

export interface AndroidActivityBackPressedEventData<T extends Observable = Observable> extends AndroidActivityEventData<T> {
	cancel: boolean;
}

/**
 * @deprecated
 */
export interface RootViewControllerImpl {
	contentController: any;
}

export interface LoadAppCSSEventData<T extends Observable = Observable> extends ApplicationEventData<T> {
	cssFile: string;
}
