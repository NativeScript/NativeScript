import { ApplicationCommon } from './application-common';

export * from './application-common';
export * from './application-interfaces';

export const Application: ApplicationCommon;

export class AndroidApplication extends ApplicationCommon {
	/**
	 * @deprecated Use `Application.android.activityCreatedEvent` instead.
	 */
	static readonly activityCreatedEvent;
	/**
	 * @deprecated Use `Application.android.activityDestroyedEvent` instead.
	 */
	static readonly activityDestroyedEvent;
	/**
	 * @deprecated Use `Application.android.activityStartedEvent` instead.
	 */
	static readonly activityStartedEvent;
	/**
	 * @deprecated Use `Application.android.activityPausedEvent` instead.
	 */
	static readonly activityPausedEvent;
	/**
	 * @deprecated Use `Application.android.activityResumedEvent` instead.
	 */
	static readonly activityResumedEvent;
	/**
	 * @deprecated Use `Application.android.activityStoppedEvent` instead.
	 */
	static readonly activityStoppedEvent;
	/**
	 * @deprecated Use `Application.android.saveActivityStateEvent` instead.
	 */
	static readonly saveActivityStateEvent;
	/**
	 * @deprecated Use `Application.android.activityResultEvent` instead.
	 */
	static readonly activityResultEvent;
	/**
	 * @deprecated Use `Application.android.activityBackPressedEvent` instead.
	 */
	static readonly activityBackPressedEvent;
	/**
	 * @deprecated Use `Application.android.activityNewIntentEvent` instead.
	 */
	static readonly activityNewIntentEvent;
	/**
	 * @deprecated Use `Application.android.activityRequestPermissionsEvent` instead.
	 */
	static readonly activityRequestPermissionsEvent;

	readonly activityCreatedEvent;
	readonly activityDestroyedEvent;
	readonly activityStartedEvent;
	readonly activityPausedEvent;
	readonly activityResumedEvent;
	readonly activityStoppedEvent;
	readonly saveActivityStateEvent;
	readonly activityResultEvent;
	readonly activityBackPressedEvent;
	readonly activityNewIntentEvent;
	readonly activityRequestPermissionsEvent;

	getNativeApplication(): android.app.Application;

	init(nativeApp: android.app.Application): void;

	get nativeApp(): android.app.Application;
	get packageName(): string;
	get startActivity(): androidx.appcompat.app.AppCompatActivity;
	get foregroundActivity(): androidx.appcompat.app.AppCompatActivity;
	get context(): android.content.Context;

	registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void): void;
	unregisterBroadcastReceiver(intentFilter: string): void;

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
	get rootController(): UIViewController;
	get nativeApp(): UIApplication;
	get window(): UIWindow;

	get delegate(): UIApplicationDelegate;
	set delegate(value: UIApplicationDelegate | unknown);

	getNativeApplication(): UIApplication;

	addNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void): NotificationObserver;

	removeNotificationObserver(observer: any, notificationName: string);
}
