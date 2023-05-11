import { ApplicationCommon } from './application-common';

export * from './application-common';
export * from './application-interfaces';

export const Application: ApplicationCommon;

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
