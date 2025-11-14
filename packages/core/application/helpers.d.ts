/**
 * Android: Update the content description for views
 */
export const updateContentDescription: (view: any /* View */, forceUpdate?: boolean) => string | null;
export function applyContentDescription(view: any /* View */, forceUpdate?: boolean);
/* Android app-wide helpers */
export const androidRegisteredReceivers: { [key: string]: android.content.BroadcastReceiver };
export const androidPendingReceiverRegistrations: Array<(context: android.content.Context) => void>;
export function androidRegisterBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void, flags = 2): void;
export function androidUnregisterBroadcastReceiver(intentFilter: string): void;
export function androidGetCurrentActivity(): androidx.appcompat.app.AppCompatActivity;
export function androidGetForegroundActivity(): androidx.appcompat.app.AppCompatActivity;
export function androidSetForegroundActivity(activity: androidx.appcompat.app.AppCompatActivity): void;
export function androidGetStartActivity(): androidx.appcompat.app.AppCompatActivity;
export function androidSetStartActivity(activity: androidx.appcompat.app.AppCompatActivity): void;

/* iOS app-wide helpers */
export const iosNotificationObservers: NotificationObserver[];
class NotificationObserver extends NSObject {}
export function iosAddNotificationObserver(notificationName: string, onReceiveCallback: (notification: NSNotification) => void): NotificationObserver;
export function iosRemoveNotificationObserver(observer: NotificationObserver, notificationName: string): void;
