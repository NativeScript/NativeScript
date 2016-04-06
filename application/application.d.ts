/**
 * Contains the application abstraction with all related methods.
 */
declare module "application" {
    import cssSelector = require("ui/styling/css-selector");
    import observable = require("data/observable");
    import frame = require("ui/frame");
    import {View} from "ui/core/view";
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
     * String value used when hooking to orientationChanged event.
     */
    export var orientationChangedEvent: string;

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
     * Event data containing information for launch event.
     */
    export interface LaunchEventData extends ApplicationEventData {        
        /**
         * The root view for this Window on iOS or Activity for Android.
         * If not set a new Frame will be created as a root view in order to maintain backwards compatibility.
         */
        root?: View;
    }

    /**
     * Event data containing information for orientation changed event.
     */
    export interface OrientationChangedEventData extends ApplicationEventData {
        /**
         * New orientation value.
         */
        newValue: string;
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
     * The main navigation entry to be used when loading the main Page.
     */
    export var mainEntry: frame.NavigationEntry;

	/**
	 * An application level static resources.
	 */
    export var resources: any;

    /**
     * The application level css file name (starting from the application root). Used to set css across all pages.
     * Css will be applied for every page and page css will be applied after.
     */
    export var cssFile: string;

    //@private
    export var appSelectors: Array<cssSelector.CssSelector>;
    export var additionalSelectors: Array<cssSelector.CssSelector>;
    /**
     * Cached css selectors created from the content of the css file.
     */
    export var cssSelectors: Array<cssSelector.CssSelector>;
    export var cssSelectorVersion: number;
    export var keyframes: any;
    export function parseCss(cssText: string, cssFileName?: string): Array<cssSelector.CssSelector>;
    export function mergeCssSelectors(module: any): void;
    //@endprivate

    export function addCss(cssText: string): void;

    /**
     * Loads css file and parses to a css syntax tree.
     * @param cssFile Optional parameter to point to an arbitrary css file. If not specified, the cssFile property is used.
     */
    export function loadCss(cssFile?: string): Array<cssSelector.CssSelector>;

    /**
     * Call this method to start the application. Important: All code after this method call will not be executed!
     */
    export function start(entry?: frame.NavigationEntry);

    /**
     * The main entry point event. This method is expected to use the root frame to navigate to the main application page.
     */
    export function onLaunch(context?: any): void;

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
     * Shortcut alias to the removeEventListener method.
     * @param eventNames - String corresponding to events (e.g. "onLaunch").
     * @param callback - Callback function which will be removed.
     * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
     */
    export function off(eventNames: string, callback?: any, thisArg?: any);

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
    export function on(event: "launch", callback: (args: LaunchEventData) => void, thisArg?: any);

    /**
     * This event is raised when the Application is suspended.
     */
    export function on(event: "suspend", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when the Application is resumed after it has been suspended.
     */
    export function on(event: "resume", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when the Application is about to exitEvent.
     */
    export function on(event: "exit", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when there is low memory on the target device.
     */
    export function on(event: "lowMemory", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised when an uncaught error occurs while the application is running.
     */
    export function on(event: "uncaughtError", callback: (args: ApplicationEventData) => void, thisArg?: any);

    /**
     * This event is raised the orientation of the current device has changed.
     */
    export function on(event: "orientationChanged", callback: (args: OrientationChangedEventData) => void, thisArg?: any);

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
        activity: any /* android.app.Activity */;

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
        bundle: any /* android.os.Bundle */;
    }

    /**
     * Data for the Android activity onRequestPermissions callback
     */
    export interface AndroidActivityRequestPermissionsEventData extends AndroidActivityEventData {
        /**
         * The request code.
         */
        requestCode: number,

        /**
         * The Permissions
         */
        permissions: Array<String>,

        /**
         * The Granted.
         */
        grantResults: Array<Number>
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

    /**
     * The abstraction of an Android-specific application object.
     */
    export class AndroidApplication extends observable.Observable {
        /**
         * The [android Application](http://developer.android.com/reference/android/app/Application.html) object instance provided to the init of the module.
         */
        nativeApp: any /* android.app.Application */;

        /**
         * The application's [android Context](http://developer.android.com/reference/android/content/Context.html) object instance.
         */
        context: any /* android.content.Context */;

        /**
         * The currently active (loaded) [android Activity](http://developer.android.com/reference/android/app/Activity.html). This property is automatically updated upon Activity events.
         */
        foregroundActivity: any /* android.app.Activity */;

        /**
         * The currently active (loaded) Context. This is typically the top-level Activity that is just created.
         */
        currentContext: any /* android.content.Context */;

        /**
         * The main (start) Activity for the application.
         */
        startActivity: any /* android.app.Activity */;

        /**
         * The name of the application package.
         */
        packageName: string;

        /**
         * True if the application is not running (suspended), false otherwise.
         */
        paused: boolean;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the [onActivityCreated method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityCreated: (activity: any /* android.app.Activity */, bundle: any /* android.os.Bundle */) => void;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the [onActivityDestroyed method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityDestroyed: (activity: any /* android.app.Activity */) => void;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the [onActivityDestroyed method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityStarted: (activity: any /* android.app.Activity */) => void;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the [onActivityPaused method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityPaused: (activity: any /* android.app.Activity */) => void;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the [onActivityResumed method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityResumed: (activity: any /* android.app.Activity */) => void;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the [onActivityStopped method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onActivityStopped: (activity: any /* android.app.Activity */) => void;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the [onActivitySaveInstanceState method](http://developer.android.com/reference/android/app/Application.ActivityLifecycleCallbacks.html).
         */
        onSaveActivityState: (activity: any /* android.app.Activity */, bundle: any /* android.os.Bundle */) => void;

        /**
         * [Deprecated. Please use the respective event instead.] Direct handler of the onActivityResult method.
         */
        onActivityResult: (requestCode: number, resultCode: number, data: any /* android.content.Intent */) => void;
            
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

        /**
         * This event is raised on the back button is pressed in an android application.
         */
        on(event: "activityRequestPermissions", callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any);

        /**
         * String value used when hooking to activityCreated event.
         */
        public static activityCreatedEvent: string;

        /**
         * String value used when hooking to activityDestroyed event.
         */
        public static activityDestroyedEvent: string;

        /**
         * String value used when hooking to activityStarted event.
         */
        public static activityStartedEvent: string;

        /**
         * String value used when hooking to activityPaused event.
         */
        public static activityPausedEvent: string;

        /**
         * String value used when hooking to activityResumed event.
         */
        public static activityResumedEvent: string;

        /**
         * String value used when hooking to activityStopped event.
         */
        public static activityStoppedEvent: string;

        /**
         * String value used when hooking to saveActivityState event.
         */
        public static saveActivityStateEvent: string;

        /**
         * String value used when hooking to activityResult event.
         */
        public static activityResultEvent: string;

        /**
         * String value used when hooking to activityBackPressed event.
         */
        public static activityBackPressedEvent: string;

        /**
         * Register a BroadcastReceiver to be run in the main activity thread. The receiver will be called with any broadcast Intent that matches filter, in the main application thread. 
         * For more information, please visit 'http://developer.android.com/reference/android/content/Context.html#registerReceiver%28android.content.BroadcastReceiver,%20android.content.IntentFilter%29'
         * @param intentFilter A string containing the intent filter.
         * @param onReceiveCallback A callback function that will be called each time the receiver receives a broadcast.
         */
        registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: any /* android.content.Context */, intent: any /* android.content.Intent */) => void): void;

        /**
         * Unregister a previously registered BroadcastReceiver. 
         * For more information, please visit 'http://developer.android.com/reference/android/content/Context.html#unregisterReceiver(android.content.BroadcastReceiver)'
         * @param intentFilter A string containing the intent filter with which the receiver was originally registered.
         */
        unregisterBroadcastReceiver(intentFilter: string): void;
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
        rootController: any /* UIViewController */;

        /**
         * The [UIApplication](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html).
         */
        nativeApp: any /* UIApplication */;

        /**
         * The [UIApplicationDelegate](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/index.html) class.
         */
        delegate: any /* typeof UIApplicationDelegate */;

        /**
         * Adds an observer to the default notification center for the specified notification.
         * For more information, please visit 'https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSNotificationCenter_Class/#//apple_ref/occ/instm/NSNotificationCenter/addObserver:selector:name:object:'
         * @param notificationName A string containing the name of the notification.
         * @param onReceiveCallback A callback function that will be called each time the observer receives a notification.
         */
        addNotificationObserver(notificationName: string, onReceiveCallback: (notification: any /* NSNotification */) => void): any;

        /**
         * Removes the observer for the specified notification from the default notification center.
         * For more information, please visit 'https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSNotificationCenter_Class/#//apple_ref/occ/instm/NSNotificationCenter/addObserver:selector:name:object:'
         * @param observer The observer that was returned from the addNotificationObserver method.
         * @param notificationName A string containing the name of the notification.
         * @param onReceiveCallback A callback function that will be called each time the observer receives a notification.
         */
        removeNotificationObserver(observer: any, notificationName: string): void;
    }
}
