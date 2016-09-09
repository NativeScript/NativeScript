
declare const enum UNAlertStyle {

	None = 0,

	Banner = 1,

	Alert = 2
}

declare var UNAuthorizationOptionNone: UNAuthorizationOptions;

declare const enum UNAuthorizationOptions {

	Badge = 1,

	Sound = 2,

	Alert = 4,

	CarPlay = 8
}

declare const enum UNAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Authorized = 2
}

declare class UNCalendarNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNCalendarNotificationTrigger; // inherited from NSObject

	static new(): UNCalendarNotificationTrigger; // inherited from NSObject

	static triggerWithDateMatchingComponentsRepeats(dateComponents: NSDateComponents, repeats: boolean): UNCalendarNotificationTrigger;

	/* readonly */ dateComponents: NSDateComponents;

	nextTriggerDate(): Date;
}

declare const enum UNErrorCode {

	NotificationsNotAllowed = 1,

	AttachmentInvalidURL = 100,

	AttachmentUnrecognizedType = 101,

	AttachmentInvalidFileSize = 102,

	AttachmentNotInDataStore = 103,

	AttachmentMoveIntoDataStoreFailed = 104,

	AttachmentCorrupt = 105,

	NotificationInvalidNoDate = 1400,

	NotificationInvalidNoContent = 1401
}

declare var UNErrorDomain: string;

declare class UNLocationNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNLocationNotificationTrigger; // inherited from NSObject

	static new(): UNLocationNotificationTrigger; // inherited from NSObject

	static triggerWithRegionRepeats(region: CLRegion, repeats: boolean): UNLocationNotificationTrigger;

	/* readonly */ region: CLRegion;
}

declare class UNMutableNotificationContent extends UNNotificationContent {

	static alloc(): UNMutableNotificationContent; // inherited from NSObject

	static new(): UNMutableNotificationContent; // inherited from NSObject

	attachments: NSArray<UNNotificationAttachment>;

	badge: number;

	body: string;

	categoryIdentifier: string;

	launchImageName: string;

	sound: UNNotificationSound;

	subtitle: string;

	threadIdentifier: string;

	title: string;

	userInfo: NSDictionary<any, any>;
}

declare class UNNotification extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotification; // inherited from NSObject

	static new(): UNNotification; // inherited from NSObject

	/* readonly */ date: Date;

	/* readonly */ request: UNNotificationRequest;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class UNNotificationAction extends NSObject implements NSCopying, NSSecureCoding {

	static actionWithIdentifierTitleOptions(identifier: string, title: string, options: UNNotificationActionOptions): UNNotificationAction;

	static alloc(): UNNotificationAction; // inherited from NSObject

	static new(): UNNotificationAction; // inherited from NSObject

	/* readonly */ identifier: string;

	/* readonly */ options: UNNotificationActionOptions;

	/* readonly */ title: string;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare var UNNotificationActionOptionNone: UNNotificationActionOptions;

declare const enum UNNotificationActionOptions {

	AuthenticationRequired = 1,

	Destructive = 2,

	Foreground = 4
}

declare class UNNotificationAttachment extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationAttachment; // inherited from NSObject

	static attachmentWithIdentifierURLOptionsError(identifier: string, URL: NSURL, options: NSDictionary<any, any>): UNNotificationAttachment;

	static new(): UNNotificationAttachment; // inherited from NSObject

	/* readonly */ URL: NSURL;

	/* readonly */ identifier: string;

	/* readonly */ type: string;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare var UNNotificationAttachmentOptionsThumbnailClippingRectKey: string;

declare var UNNotificationAttachmentOptionsThumbnailHiddenKey: string;

declare var UNNotificationAttachmentOptionsThumbnailTimeKey: string;

declare var UNNotificationAttachmentOptionsTypeHintKey: string;

declare class UNNotificationCategory extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationCategory; // inherited from NSObject

	static categoryWithIdentifierActionsIntentIdentifiersOptions(identifier: string, actions: NSArray<UNNotificationAction>, intentIdentifiers: NSArray<string>, options: UNNotificationCategoryOptions): UNNotificationCategory;

	static new(): UNNotificationCategory; // inherited from NSObject

	/* readonly */ actions: NSArray<UNNotificationAction>;

	/* readonly */ identifier: string;

	/* readonly */ intentIdentifiers: NSArray<string>;

	/* readonly */ options: UNNotificationCategoryOptions;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum UNNotificationCategoryOptions {

	None = 0,

	CustomDismissAction = 1,

	AllowInCarPlay = 2
}

declare class UNNotificationContent extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): UNNotificationContent; // inherited from NSObject

	static new(): UNNotificationContent; // inherited from NSObject

	/* readonly */ attachments: NSArray<UNNotificationAttachment>;

	/* readonly */ badge: number;

	/* readonly */ body: string;

	/* readonly */ categoryIdentifier: string;

	/* readonly */ launchImageName: string;

	/* readonly */ sound: UNNotificationSound;

	/* readonly */ subtitle: string;

	/* readonly */ threadIdentifier: string;

	/* readonly */ title: string;

	/* readonly */ userInfo: NSDictionary<any, any>;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var UNNotificationDefaultActionIdentifier: string;

declare var UNNotificationDismissActionIdentifier: string;

declare var UNNotificationPresentationOptionNone: UNNotificationPresentationOptions;

declare const enum UNNotificationPresentationOptions {

	Badge = 1,

	Sound = 2,

	Alert = 4
}

declare class UNNotificationRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationRequest; // inherited from NSObject

	static new(): UNNotificationRequest; // inherited from NSObject

	static requestWithIdentifierContentTrigger(identifier: string, content: UNNotificationContent, trigger: UNNotificationTrigger): UNNotificationRequest;

	/* readonly */ content: UNNotificationContent;

	/* readonly */ identifier: string;

	/* readonly */ trigger: UNNotificationTrigger;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class UNNotificationResponse extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationResponse; // inherited from NSObject

	static new(): UNNotificationResponse; // inherited from NSObject

	/* readonly */ actionIdentifier: string;

	/* readonly */ notification: UNNotification;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class UNNotificationServiceExtension extends NSObject {

	static alloc(): UNNotificationServiceExtension; // inherited from NSObject

	static new(): UNNotificationServiceExtension; // inherited from NSObject

	didReceiveNotificationRequestWithContentHandler(request: UNNotificationRequest, contentHandler: (p1: UNNotificationContent) => void): void;

	serviceExtensionTimeWillExpire(): void;
}

declare const enum UNNotificationSetting {

	NotSupported = 0,

	Disabled = 1,

	Enabled = 2
}

declare class UNNotificationSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationSettings; // inherited from NSObject

	static new(): UNNotificationSettings; // inherited from NSObject

	/* readonly */ alertSetting: UNNotificationSetting;

	/* readonly */ alertStyle: UNAlertStyle;

	/* readonly */ authorizationStatus: UNAuthorizationStatus;

	/* readonly */ badgeSetting: UNNotificationSetting;

	/* readonly */ carPlaySetting: UNNotificationSetting;

	/* readonly */ lockScreenSetting: UNNotificationSetting;

	/* readonly */ notificationCenterSetting: UNNotificationSetting;

	/* readonly */ soundSetting: UNNotificationSetting;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class UNNotificationSound extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationSound; // inherited from NSObject

	static defaultSound(): UNNotificationSound;

	static new(): UNNotificationSound; // inherited from NSObject

	static soundNamed(name: string): UNNotificationSound;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class UNNotificationTrigger extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationTrigger; // inherited from NSObject

	static new(): UNNotificationTrigger; // inherited from NSObject

	/* readonly */ repeats: boolean;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class UNPushNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNPushNotificationTrigger; // inherited from NSObject

	static new(): UNPushNotificationTrigger; // inherited from NSObject
}

declare class UNTextInputNotificationAction extends UNNotificationAction {

	static actionWithIdentifierTitleOptions(identifier: string, title: string, options: UNNotificationActionOptions): UNTextInputNotificationAction; // inherited from UNNotificationAction

	static actionWithIdentifierTitleOptionsTextInputButtonTitleTextInputPlaceholder(identifier: string, title: string, options: UNNotificationActionOptions, textInputButtonTitle: string, textInputPlaceholder: string): UNTextInputNotificationAction;

	static alloc(): UNTextInputNotificationAction; // inherited from NSObject

	static new(): UNTextInputNotificationAction; // inherited from NSObject

	/* readonly */ textInputButtonTitle: string;

	/* readonly */ textInputPlaceholder: string;
}

declare class UNTextInputNotificationResponse extends UNNotificationResponse {

	static alloc(): UNTextInputNotificationResponse; // inherited from NSObject

	static new(): UNTextInputNotificationResponse; // inherited from NSObject

	/* readonly */ userText: string;
}

declare class UNTimeIntervalNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNTimeIntervalNotificationTrigger; // inherited from NSObject

	static new(): UNTimeIntervalNotificationTrigger; // inherited from NSObject

	static triggerWithTimeIntervalRepeats(timeInterval: number, repeats: boolean): UNTimeIntervalNotificationTrigger;

	/* readonly */ timeInterval: number;

	nextTriggerDate(): Date;
}

declare class UNUserNotificationCenter extends NSObject {

	static alloc(): UNUserNotificationCenter; // inherited from NSObject

	static currentNotificationCenter(): UNUserNotificationCenter;

	static new(): UNUserNotificationCenter; // inherited from NSObject

	delegate: UNUserNotificationCenterDelegate;

	/* readonly */ supportsContentExtensions: boolean;

	addNotificationRequestWithCompletionHandler(request: UNNotificationRequest, completionHandler: (p1: NSError) => void): void;

	getDeliveredNotificationsWithCompletionHandler(completionHandler: (p1: NSArray<UNNotification>) => void): void;

	getNotificationCategoriesWithCompletionHandler(completionHandler: (p1: NSSet<UNNotificationCategory>) => void): void;

	getNotificationSettingsWithCompletionHandler(completionHandler: (p1: UNNotificationSettings) => void): void;

	getPendingNotificationRequestsWithCompletionHandler(completionHandler: (p1: NSArray<UNNotificationRequest>) => void): void;

	removeAllDeliveredNotifications(): void;

	removeAllPendingNotificationRequests(): void;

	removeDeliveredNotificationsWithIdentifiers(identifiers: NSArray<string>): void;

	removePendingNotificationRequestsWithIdentifiers(identifiers: NSArray<string>): void;

	requestAuthorizationWithOptionsCompletionHandler(options: UNAuthorizationOptions, completionHandler: (p1: boolean, p2: NSError) => void): void;

	setNotificationCategories(categories: NSSet<UNNotificationCategory>): void;
}

interface UNUserNotificationCenterDelegate extends NSObjectProtocol {

	userNotificationCenterDidReceiveNotificationResponseWithCompletionHandler?(center: UNUserNotificationCenter, response: UNNotificationResponse, completionHandler: () => void): void;

	userNotificationCenterWillPresentNotificationWithCompletionHandler?(center: UNUserNotificationCenter, notification: UNNotification, completionHandler: (p1: UNNotificationPresentationOptions) => void): void;
}
declare var UNUserNotificationCenterDelegate: {

	prototype: UNUserNotificationCenterDelegate;
};
