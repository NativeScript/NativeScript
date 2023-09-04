import { ApplicationCommon } from './application-common';

export * from './application-common';
export * from './application-interfaces';

export const Application: ApplicationCommon;

export class AndroidApplication extends ApplicationCommon {
	/**
	 * @deprecated Use `Application.android.activityCreatedEvent` instead.
	 */
	static readonly activityCreatedEvent = 'activityCreated';
	/**
	 * @deprecated Use `Application.android.activityDestroyedEvent` instead.
	 */
	static readonly activityDestroyedEvent = 'activityDestroyed';
	/**
	 * @deprecated Use `Application.android.activityStartedEvent` instead.
	 */
	static readonly activityStartedEvent = 'activityStarted';
	/**
	 * @deprecated Use `Application.android.activityPausedEvent` instead.
	 */
	static readonly activityPausedEvent = 'activityPaused';
	/**
	 * @deprecated Use `Application.android.activityResumedEvent` instead.
	 */
	static readonly activityResumedEvent = 'activityResumed';
	/**
	 * @deprecated Use `Application.android.activityStoppedEvent` instead.
	 */
	static readonly activityStoppedEvent = 'activityStopped';
	/**
	 * @deprecated Use `Application.android.saveActivityStateEvent` instead.
	 */
	static readonly saveActivityStateEvent = 'saveActivityState';
	/**
	 * @deprecated Use `Application.android.activityResultEvent` instead.
	 */
	static readonly activityResultEvent = 'activityResult';
	/**
	 * @deprecated Use `Application.android.activityBackPressedEvent` instead.
	 */
	static readonly activityBackPressedEvent = 'activityBackPressed';
	/**
	 * @deprecated Use `Application.android.activityNewIntentEvent` instead.
	 */
	static readonly activityNewIntentEvent = 'activityNewIntent';
	/**
	 * @deprecated Use `Application.android.activityRequestPermissionsEvent` instead.
	 */
	static readonly activityRequestPermissionsEvent = 'activityRequestPermissions';

	readonly activityCreatedEvent = AndroidApplication.activityCreatedEvent;
	readonly activityDestroyedEvent = AndroidApplication.activityDestroyedEvent;
	readonly activityStartedEvent = AndroidApplication.activityStartedEvent;
	readonly activityPausedEvent = AndroidApplication.activityPausedEvent;
	readonly activityResumedEvent = AndroidApplication.activityResumedEvent;
	readonly activityStoppedEvent = AndroidApplication.activityStoppedEvent;
	readonly saveActivityStateEvent = AndroidApplication.saveActivityStateEvent;
	readonly activityResultEvent = AndroidApplication.activityResultEvent;
	readonly activityBackPressedEvent = AndroidApplication.activityBackPressedEvent;
	readonly activityNewIntentEvent = AndroidApplication.activityNewIntentEvent;
	readonly activityRequestPermissionsEvent = AndroidApplication.activityRequestPermissionsEvent;

	getNativeApplication(): android.app.Application;

	/**
	 * @internal
	 */
	init(nativeApp: android.app.Application): void;

	/**
	 * The [android Application](http://developer.android.com/reference/android/app/Application.html) object instance provided to the init of the module.
	 */
	get nativeApp(): android.app.Application;

	/**
	 * @deprecated Use `Utils.android.getPackageName()` instead.
	 */
	get packageName(): string;

	/**
	 * The main (start) Activity for the application.
	 */
	get startActivity(): androidx.appcompat.app.AppCompatActivity;

	/**
	 * The currently active (loaded) [android Activity](http://developer.android.com/reference/android/app/Activity.html).
	 *
	 * This property is automatically updated upon Activity events.
	 */
	get foregroundActivity(): androidx.appcompat.app.AppCompatActivity;

	/**
	 * @deprecated Use `Utils.android.getApplicationContext()` instead.
	 */
	get context(): android.content.Context;

	/**
	 * @deprecated Use `Application.inBackground` instead.
	 */
	get backgrounded(): boolean;

	/**
	 * @deprecated Use `Application.suspended` instead.
	 */
	get paused(): boolean;

	/**
	 * Register a BroadcastReceiver to be run in the main activity thread. The receiver will be called with any broadcast Intent that matches filter, in the main application thread.
	 * For more information, please visit 'http://developer.android.com/reference/android/content/Context.html#registerReceiver%28android.content.BroadcastReceiver,%20android.content.IntentFilter%29'
	 * @param intentFilter A string containing the intent filter.
	 * @param onReceiveCallback A callback function that will be called each time the receiver receives a broadcast.
	 */
	registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void): void;

	/**
	 * Unregister a previously registered BroadcastReceiver.
	 * For more information, please visit 'http://developer.android.com/reference/android/content/Context.html#unregisterReceiver(android.content.BroadcastReceiver)'
	 * @param intentFilter A string containing the intent filter with which the receiver was originally registered.
	 */
	unregisterBroadcastReceiver(intentFilter: string): void;

	/**
	 * Get a registered BroadcastReceiver, then you can get the result code of BroadcastReceiver in onReceiveCallback method.
	 * @param intentFilter A string containing the intent filter.
	 */
	getRegisteredBroadcastReceiver(intentFilter: string): android.content.BroadcastReceiver;

	on(event: 'activityCreated', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	on(event: 'activityDestroyed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityStarted', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityPaused', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityResumed', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'activityStopped', callback: (args: AndroidActivityEventData) => void, thisArg?: any): void;
	on(event: 'saveActivityState', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any): void;
	on(event: 'activityResult', callback: (args: AndroidActivityResultEventData) => void, thisArg?: any): void;
	on(event: 'activityBackPressed', callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any): void;
	on(event: 'activityNewIntent', callback: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any): void;
	on(event: 'activityRequestPermissions', callback: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any): void;
}

export class iOSApplication extends ApplicationCommon {
	/**
	 * The root view controller for the application.
	 */
	get rootController(): UIViewController;

	/**
	 * The [UIApplication](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html).
	 */
	get nativeApp(): UIApplication;

	/**
	 * The key window.
	 */
	get window(): UIWindow;

	/**
	 * The [UIApplicationDelegate](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/index.html) class.
	 */
	get delegate(): UIApplicationDelegate & { prototype: UIApplicationDelegate };

	/**
	 * Sets a custom [UIApplicationDelegate](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/index.html) class.
	 */
	set delegate(value: UIApplicationDelegate | unknown);

	/**
	 * Adds a delegate handler for the specified delegate method name. This method does not replace an existing handler,
	 * but rather adds the new handler to the existing chain of handlers.
	 * @param methodName The name of the delegate method to add a handler for.
	 * @param handler A function that will be called when the specified delegate method is called.
	 */
	addDelegateHandler<T extends keyof UIApplicationDelegate>(methodName: T, handler: (typeof UIApplicationDelegate.prototype)[T]): void;

	/**
	 * Adds an observer to the default notification center for the specified notification.
	 * For more information, please visit 'https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSNotificationCenter_Class/#//apple_ref/occ/instm/NSNotificationCenter/addObserver:selector:name:object:'
	 * @param notificationName A string containing the name of the notification.
	 * @param onReceiveCallback A callback function that will be called each time the observer receives a notification.
	 */
	addNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void): NotificationObserver;

	/**
	 * Removes the observer for the specified notification from the default notification center.
	 * For more information, please visit 'https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSNotificationCenter_Class/#//apple_ref/occ/instm/NSNotificationCenter/addObserver:selector:name:object:'
	 * @param observer The observer that was returned from the addNotificationObserver method.
	 * @param notificationName A string containing the name of the notification.
	 * @param onReceiveCallback A callback function that will be called each time the observer receives a notification.
	 */
	removeNotificationObserver(observer: any, notificationName: string);
}
