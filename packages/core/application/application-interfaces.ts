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
	ios?: any;
	android?: any;
	eventName: string;
	object: any;
}

export interface LaunchEventData extends ApplicationEventData {
	root?: View;
	savedInstanceState?: any /* android.os.Bundle */;
}

export interface OrientationChangedEventData extends ApplicationEventData {
	newValue: 'portrait' | 'landscape' | 'unknown';
}

export interface SystemAppearanceChangedEventData extends ApplicationEventData {
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

export interface CssChangedEventData extends EventData {
	cssFile?: string;
	cssText?: string;
}

export interface AndroidActivityEventData {
	activity: any /* androidx.appcompat.app.AppCompatActivity */;
	eventName: string;
	object: any;
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

export interface LoadAppCSSEventData extends EventData {
	cssFile: string;
}
