import type { ApplicationCommon } from './application-common';
import type { EventData, Observable } from '../data/observable';
import type { View } from '../ui/core/view';

/**
 * An extended JavaScript Error which will have the nativeError property initialized in case the error is caused by executing platform-specific code.
 */
export interface NativeScriptError extends Error {
	/**
	 * Represents the native error object.
	 */
	nativeException?: any;
	/**
	 * The native stack trace.
	 */
	stackTrace?: string;
	/**
	 * Javascript portion of stack trace.
	 */
	stack?: string;
}

/**
 * Event data containing information for the application events.
 */
export interface ApplicationEventData {
	/**
	 * The name of the event.
	 */
	eventName: string;

	/**
	 * Gets the native iOS event arguments. Valid only when running on iOS.
	 */
	ios?: any; // iOSApplication;

	/**
	 * Gets the native Android event arguments. Valid only when running on Android.
	 */
	android?: any; // AndroidApplication;

	/**
	 * The instance that has raised the event.
	 */
	object: ApplicationCommon | Observable;
}

/**
 * Event data containing information for launch event.
 */
export interface LaunchEventData extends EventData<ApplicationCommon> {
	/**
	 * The root view for this Window on iOS or Activity for Android.
	 * If not set a new Frame will be created as a root view in order to maintain backwards compatibility.
	 * If explicitly set to null, there will be no root view.
	 */
	root?: View | null;

	savedInstanceState?: any /* android.os.Bundle */;

	android?: android.content.Intent;

	ios?: any /* UIApplicationLaunchOptions */;
}

/**
 * Event data containing information for orientation changed event.
 */
export interface OrientationChangedEventData extends ApplicationEventData {
	/**
	 * New orientation value.
	 */
	newValue: 'portrait' | 'landscape' | 'unknown';
}

/**
 * Event data containing information for system appearance changed event.
 */
export interface SystemAppearanceChangedEventData extends ApplicationEventData {
	/**
	 * New system appearance value.
	 */
	newValue: 'light' | 'dark';
	cancel: boolean;
}

/**
 * Event data containing information for font scale changed event.
 */
export interface FontScaleChangedEventData extends ApplicationEventData {
	/**
	 * New font scale value.
	 */
	newValue: number;
}

/**
 * Event data containing information about unhandled application errors.
 */
export interface UnhandledErrorEventData extends ApplicationEventData {
	ios?: NativeScriptError;
	android?: NativeScriptError;
	error: NativeScriptError;
}

/**
 * Event data containing information about discarded application errors.
 */
export interface DiscardedErrorEventData extends ApplicationEventData {
	error: NativeScriptError;
}

/**
 * Event data containing information about application css change.
 */
export interface CssChangedEventData extends ApplicationEventData {
	cssFile?: string;
	cssText?: string;
}

/**
 * Event data containing information about application css change.
 */
export interface InitRootViewEventData extends ApplicationEventData {
	rootView: View;
}

/**
 * Data for the Android activity events.
 */
export interface AndroidActivityEventData {
	/**
	 * The activity.
	 */
	activity: androidx.appcompat.app.AppCompatActivity;

	/**
	 * The name of the event.
	 */
	eventName: string;

	/**
	 * The instance that has raised the event.
	 */
	object: any;
}

/**
 * Data for the Android activity events with bundle.
 */
export interface AndroidActivityBundleEventData extends AndroidActivityEventData {
	/**
	 * The bundle.
	 */
	bundle: android.os.Bundle;
}

/**
 * Data for the Android activity onRequestPermissions callback
 */
export interface AndroidActivityRequestPermissionsEventData extends AndroidActivityEventData {
	/**
	 * The request code.
	 */
	requestCode: number;

	/**
	 * The Permissions.
	 */
	permissions: Array<string>;

	/**
	 * The Granted.
	 */
	grantResults: Array<number>;
}

/**
 * Data for the Android activity result event.
 */
export interface AndroidActivityResultEventData extends AndroidActivityEventData {
	/**
	 * The request code.
	 */
	requestCode: number;

	/**
	 * The result code.
	 */
	resultCode: number;

	/**
	 * The intent.
	 */
	intent: android.content.Intent;
}

/**
 * Data for the Android activity newIntent event.
 */
export interface AndroidActivityNewIntentEventData extends AndroidActivityEventData {
	/**
	 * The intent.
	 */
	intent: any /* android.content.Intent */;
}

/**
 * Data for the Android activity back pressed event.
 */
export interface AndroidActivityBackPressedEventData extends AndroidActivityEventData {
	/**
	 * In the event handler, set this value to true if you want to cancel the back navigation and do something else instead.
	 */
	cancel: boolean;
}

export interface LoadAppCSSEventData extends ApplicationEventData {
	cssFile: string;
}
