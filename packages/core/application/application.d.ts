import { ApplicationCommon } from './application-common';

export * from './application-common';
export * from './application-interfaces';

export const Application: ApplicationCommon & ApplicationCommonEvents;

export interface ApplicationCommonEvents {
	/**
	 * This event is raised when application css is changed.
	 */
	on(
		event: 'cssChanged',
		callback: (args: CssChangedEventData) => void,
		thisArg?: any
	): void;

	/**
	 * Event raised then livesync operation is performed.
	 */
	on(
		event: 'livesync',
		callback: (args: ApplicationEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when application css is changed.
	 */
	on(
		event: 'cssChanged',
		callback: (args: CssChangedEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised on application launchEvent.
	 */
	on(event: 'launch', callback: (args: LaunchEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised after the application has performed most of its startup actions.
	 * Its intent is to be suitable for measuring app startup times.
	 * @experimental
	 */
	on(
		event: 'displayed',
		callback: (args: ApplicationEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when the Application is suspended.
	 */
	on(
		event: 'suspend',
		callback: (args: ApplicationEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when the Application is resumed after it has been suspended.
	 */
	on(
		event: 'resume',
		callback: (args: ApplicationEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when the Application is about to exit.
	 */
	on(event: 'exit', callback: (args: ApplicationEventData) => void, thisArg?: any): void;

	/**
	 * This event is raised when there is low memory on the target device.
	 */
	on(
		event: 'lowMemory',
		callback: (args: ApplicationEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when an uncaught error occurs while the application is running.
	 */
	on(
		event: 'uncaughtError',
		callback: (args: UnhandledErrorEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when an discarded error occurs while the application is running.
	 */
	on(
		event: 'discardedError',
		callback: (args: DiscardedErrorEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when the orientation of the application changes.
	 */
	on(
		event: 'orientationChanged',
		callback: (args: OrientationChangedEventData) => void,
		thisArg?: any
	): void;

	/**
	 * This event is raised when the operating system appearance changes
	 * between light and dark theme (for Android);
	 * between light and dark mode (for iOS) and vice versa.
	 */
	on(
		event: 'systemAppearanceChanged',
		callback: (args: SystemAppearanceChangedEventData) => void,
		thisArg?: any
	): void;

	on(
		event: 'fontScaleChanged',
		callback: (args: FontScaleChangedEventData) => void,
		thisArg?: any
	): void;
}

export interface AndroidApplication extends ApplicationCommon {
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

	registerBroadcastReceiver(
		intentFilter: string,
		onReceiveCallback: (
			context: android.content.Context,
			intent: android.content.Intent
		) => void
	): void;
	unregisterBroadcastReceiver(intentFilter: string): void;

	on(
		event: 'activityCreated',
		callback: (args: AndroidActivityBundleEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityDestroyed',
		callback: (args: AndroidActivityEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityStarted',
		callback: (args: AndroidActivityEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityPaused',
		callback: (args: AndroidActivityEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityResumed',
		callback: (args: AndroidActivityEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityStopped',
		callback: (args: AndroidActivityEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'saveActivityState',
		callback: (args: AndroidActivityBundleEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityResult',
		callback: (args: AndroidActivityResultEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityBackPressed',
		callback: (args: AndroidActivityBackPressedEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityNewIntent',
		callback: (args: AndroidActivityNewIntentEventData) => void,
		thisArg?: any
	): void;
	on(
		event: 'activityRequestPermissions',
		callback: (args: AndroidActivityRequestPermissionsEventData) => void,
		thisArg?: any
	): void;
}

export interface iOSApplication extends ApplicationCommon {
	get rootController(): UIViewController;
	get nativeApp(): UIApplication;
	get window(): UIWindow;

	get delegate(): UIApplicationDelegate;
	set delegate(value: UIApplicationDelegate | unknown);

	getNativeApplication(): UIApplication;

	addNotificationObserver(
		notificationName: string,
		onReceiveCallback: (notification: NSNotification) => void
	): NotificationObserver;

	removeNotificationObserver(observer: any, notificationName: string);
}
