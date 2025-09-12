// stubs to avoid bundler warnings
export const updateContentDescription = (view: any /* View */, forceUpdate?: boolean): string | null => null;
export function applyContentDescription(view: any /* View */, forceUpdate?: boolean) {
	return null;
}
export const androidRegisteredReceivers = undefined;
export const androidPendingReceiverRegistrations = undefined;
export function androidRegisterBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void, flags = 2): void {}
export function androidUnregisterBroadcastReceiver(intentFilter: string): void {}
export function androidGetCurrentActivity() {}
export function androidGetForegroundActivity() {}
export function androidSetForegroundActivity(activity: androidx.appcompat.app.AppCompatActivity): void {}
export function androidGetStartActivity() {}
export function androidSetStartActivity(activity: androidx.appcompat.app.AppCompatActivity): void {}

@NativeClass
class NotificationObserver extends NSObject {
	private _onReceiveCallback: (notification: NSNotification) => void;

	public static initWithCallback(onReceiveCallback: (notification: NSNotification) => void): NotificationObserver {
		const observer = <NotificationObserver>super.new();
		observer._onReceiveCallback = onReceiveCallback;

		return observer;
	}

	public onReceive(notification: NSNotification): void {
		this._onReceiveCallback(notification);
	}

	public static ObjCExposedMethods = {
		onReceive: { returns: interop.types.void, params: [NSNotification] },
	};
}

export const iosNotificationObservers: NotificationObserver[] = [];
export function iosAddNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void) {
	const observer = NotificationObserver.initWithCallback(onReceiveCallback);
	NSNotificationCenter.defaultCenter.addObserverSelectorNameObject(observer, 'onReceive', notificationName, null);
	iosNotificationObservers.push(observer);

	return observer;
}

export function iosRemoveNotificationObserver(observer: NotificationObserver, notificationName: string) {
	// TODO: test if this finds the right observer instance match everytime
	// after circular dependencies are resolved
	const index = iosNotificationObservers.indexOf(observer);
	if (index >= 0) {
		iosNotificationObservers.splice(index, 1);
		NSNotificationCenter.defaultCenter.removeObserverNameObject(observer, notificationName, null);
	}
}

export function setupAccessibleView(view: any /* any */): void {
	const uiView = view.nativeViewProtected as UIView;
	if (!uiView) {
		return;
	}

	/**
	 * We need to map back from the UIView to the NativeScript View.
	 *
	 * We do that by setting the uiView's tag to the View's domId.
	 * This way we can do reverse lookup.
	 */
	uiView.tag = view._domId;
}
