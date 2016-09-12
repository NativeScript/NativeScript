
interface UNNotificationContentExtension extends NSObjectProtocol {

	mediaPlayPauseButtonFrame?: CGRect;

	mediaPlayPauseButtonTintColor?: UIColor;

	mediaPlayPauseButtonType?: UNNotificationContentExtensionMediaPlayPauseButtonType;

	didReceiveNotification(notification: UNNotification): void;

	didReceiveNotificationResponseCompletionHandler?(response: UNNotificationResponse, completion: (p1: UNNotificationContentExtensionResponseOption) => void): void;

	mediaPause?(): void;

	mediaPlay?(): void;
}
declare var UNNotificationContentExtension: {

	prototype: UNNotificationContentExtension;
};

declare const enum UNNotificationContentExtensionMediaPlayPauseButtonType {

	None = 0,

	Default = 1,

	Overlay = 2
}

declare const enum UNNotificationContentExtensionResponseOption {

	DoNotDismiss = 0,

	Dismiss = 1,

	DismissAndForwardAction = 2
}
