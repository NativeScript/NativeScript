/**
 * Contains the application abstraction with all related methods.
 */
declare module "application" {
    import cssSelector = require("ui/styling/css-selector");
    import observable = require("data/observable");

    /**
     * An extended JavaScript Error which will have the nativeError property initialized in case the error is caused by executing platform-specific code.
     */
    export interface NativeScriptError extends Error {
        /**
         * Represents the native error object.
         */
        nativeError: any;
    }

    /**
     * String value used when hooking to launch event.
     */
    export var launchEvent: string;

    /**
     * String value used when hooking to uncaughtError event.
     */
    export var uncaughtErrorEvent: string;

    /**
     * String value used when hooking to suspend event.
     */
    export var suspendEvent: string;

    /**
     * String value used when hooking to resume event.
     */
    export var resumeEvent: string;

    /**
     * String value used when hooking to exitevent.
     */
    export var exitEvent: string;

    /**
     * String value used when hooking to lowMemory event.
     */
    export var lowMemoryEvent: string;

    /**
     * Event data containing information for the application events.
     */
    export interface ApplicationEventData {
        /**
         * Gets the native iOS event arguments. Valid only when running on iOS.
         */
        ios?: any;

        /**
         * Gets the native Android event arguments. Valid only when running on Android.
         */
        android?: any;

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
     * The main page path (without the file extension) for the application starting from the application root. 
     * For example if you have page called "main.js" in a folder called "subFolder" and your root folder is "app" you can specify mainModule like this:
     * var application = require("application");
     * application.mainModule = "app/subFolder/main";
     * application.start();
     */
    export var mainModule: string;

	/**
	 * An application level static resources.
	 */
    export var resources: any;

    /**
     * The application level css file name (starting from the application root). Used to set css across all pages.
     * Css will be applied for every page and page css will be applied after.
     */
    export var cssFile: string;

    /**
     * Cached css selectors created from the content of the css file.
     */
    export var cssSelectorsCache: Array<cssSelector.CssSelector>;

    /**
     * Loads css file and parses to a css syntax tree.
     */
    export function loadCss(): void;

    /**
     * Call this method to start the application. Important: All code after this method call will not be executed!
     */
    export function start();

    /**
     * The main entry point event. This method is expected to use the root frame to navigate to the main application page.
     */
    export function onLaunch(context: any): void;

    /**
     * A callback to be used when an uncaught error occurs while the application is running.
     * The application will be shut down after this method returns.
     * Loading new UI at this point is erroneous and may lead to unpredictable results.
     * The method is intended to be used for crash reports and/or application restart. 
     */
    export function onUncaughtError(error: NativeScriptError): void;

    /**
     * This method will be called when the Application is suspended.
     */
    export function onSuspend();

    /**
     * This method will be called when the Application is resumed after it has been suspended.
     */
    export function onResume();

    /**
     * This method will be called when the Application is about to exitEvent.
     */
    export function onExit();

    /**
     * This method will be called when there is low memory on the target device.
     */
    export function onLowMemory();

    /**
     * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
     * @param eventNames - String corresponding to events (e.g. "onLaunch"). Optionally could be used more events separated by `,` (e.g. "onLaunch", "onSuspend"). 
     * @param callback - Callback function which will be executed when event is raised.
     * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
     */
    export function on(eventNames: string, callback: (data: any) => void, thisArg?: any);

    /**
     * Notifies all the registered listeners for the event provided in the data.eventName.
     * @param data The data associated with the event.
     */
    export function notify(data: any): void;

    /**
     * Checks whether a listener is registered for the specified event name.
     * @param eventName The name of the event to check for.
     */
    export function hasListeners(eventName: string): boolean;

    /**
     * This event is raised on application launchEvent.
     */
    export function on(event: "onLaunch", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when an uncaught error occurs while the application is running.
     */
    export function on(event: "onUncaughtError", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when the Application is suspended.
     */
    export function on(event: "onSuspend", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when the Application is resumed after it has been suspended.
     */
    export function on(event: "onResume", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when the Application is about to exitEvent.
     */
    export function on(event: "onExit", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when there is low memory on the target device.
     */
    export function on(event: "onLowMemory", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This is the Android-specific application object instance.
     * Encapsulates methods and properties specific to the Android platform.
     * Will be undefined when TargetOS is iOS.
     */
    export var android: AndroidApplication;

    /**
     * This is the iOS-specific application object instance.
     * Encapsulates methods and properties specific to the iOS platform.
     * Will be undefined when TargetOS is Android.
     */
    export var ios: iOSApplication;

    /**
     * Data for the Android activity events.
     */
    export interface AndroidActivityEventData {
        /**
         * The activity.
         */
        activity: android.app.Activity;

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
     * Data for the Android activity back pressed event.
     */
    export interface AndroidActivityBackPressedEventData extends AndroidActivityEventData {
        /**
         * In the event handler, set this value to true if you want to cancel the back navigation and do something else instead.
         */
        cancel: boolean;
    }

    /**
     * The abstraction of an Android-specific application object.
     */
    export class AndroidApplication extends observable.Observable {
        /**
         * The [android Application](http://developer.android.com/reference/android/app/Application.html) object instance provided to the init of the module.
         */
        nativeApp: android.app.Application;

        /**
         * The application's [android Context](http://developer.android.com/reference/android/content/Context.html) object instance.
         */
        context: android.content.Context;

        /**
         * The currently active (loaded) [android Activity](http://developer.android.com/reference/android/app/Activity.html). This property is automatically updated upon Activity events.
         */
        foregroundActivity: android.app.Activity;

        /**
         * The currently active (loaded) Context. This is typically the top-level Activity that is just created.
         */
        currentContext: android.content.Context;

        /**
         * The main (start) Activity for the application.
         */
        startActivity: android.app.Activity;

        /**
         * The name of the application package.
         */
        packageName: string;

        /**
         * This method is called by the JavaScript Bridge when navigation to a new activity is triggered.
         * @param intent - Native (android) intent used to create the activity.
         * Returns com.tns.NativeScriptActivity.extend implementation.
         */
        getActivity(intent: android.content.Intent): any;

        /**
         * Direct handler of the [onActivityCreated method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

        /**
         * Direct handler of the [onActivityDestroyed method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityDestroyed: (activity: android.app.Activity) => void;

        /**
         * Direct handler of the [onActivityDestroyed method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityStarted: (activity: android.app.Activity) => void;

        /**
         * Direct handler of the [onActivityPaused method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityPaused: (activity: android.app.Activity) => void;

        /**
         * Direct handler of the [onActivityResumed method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityResumed: (activity: android.app.Activity) => void;

        /**
         * Direct handler of the [onActivityStopped method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityStopped: (activity: android.app.Activity) => void;

        /**
         * Direct handler of the [onActivitySaveInstanceState method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

        /**
         * Direct handler of the onActivityResult method.
         */
        onActivityResult: (requestCode: number, resultCode: number, data: android.content.Intent) => void;
            
        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: AndroidActivityEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application ActivityCreated.
         */
        on(event: "activityCreated", callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application ActivityDestroyed.
         */
        on(event: "activityDestroyed", callback: (args: AndroidActivityEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application ActivityStarted.
         */
        on(event: "activityStarted", callback: (args: AndroidActivityEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application ActivityPaused.
         */
        on(event: "activityPaused", callback: (args: AndroidActivityEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application ActivityResumed.
         */
        on(event: "activityResumed", callback: (args: AndroidActivityEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application ActivityStopped.
         */
        on(event: "activityStopped", callback: (args: AndroidActivityEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application SaveActivityState.
         */
        on(event: "saveActivityState", callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any);

        /**
         * This event is raised on android application ActivityResult.
         */
        on(event: "activityResult", callback: (args: AndroidActivityResultEventData) => void, thisArg?: any);

        /**
         * This event is raised on the back button is pressed in an android application.
         */
        on(event: "activityBackPressed", callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any);
    }

    /* tslint:disable */
    /**
     * The abstraction of an iOS-specific application object.
     */
    export interface iOSApplication {
        /* tslint:enable */
        /**
         * The root view controller for the application.
         */
        rootController: UIViewController;

        /**
         * The [UIApplication](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html) object instance provided to the init of the module.
         */
        nativeApp: UIApplication;
    }
}