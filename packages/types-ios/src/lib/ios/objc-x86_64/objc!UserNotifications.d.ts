
/**
 * @since 10.0
 */
declare const enum UNAlertStyle {

	None = 0,

	Banner = 1,

	Alert = 2
}

/**
 * @since 10.0
 */
declare var UNAuthorizationOptionNone: UNAuthorizationOptions;

/**
 * @since 10.0
 */
declare const enum UNAuthorizationOptions {

	Badge = 1,

	Sound = 2,

	Alert = 4,

	CarPlay = 8,

	CriticalAlert = 16,

	ProvidesAppNotificationSettings = 32,

	Provisional = 64,

	Announcement = 128,

	TimeSensitive = 256
}

/**
 * @since 10.0
 */
declare const enum UNAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Authorized = 2,

	Provisional = 3,

	Ephemeral = 4
}

/**
 * @since 10.0
 */
declare class UNCalendarNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNCalendarNotificationTrigger; // inherited from NSObject

	static new(): UNCalendarNotificationTrigger; // inherited from NSObject

	static triggerWithDateMatchingComponentsRepeats(dateComponents: NSDateComponents, repeats: boolean): UNCalendarNotificationTrigger;

	readonly dateComponents: NSDateComponents;

	nextTriggerDate(): Date;
}

/**
 * @since 10.0
 */
declare const enum UNErrorCode {

	NotificationsNotAllowed = 1,

	AttachmentInvalidURL = 100,

	AttachmentUnrecognizedType = 101,

	AttachmentInvalidFileSize = 102,

	AttachmentNotInDataStore = 103,

	AttachmentMoveIntoDataStoreFailed = 104,

	AttachmentCorrupt = 105,

	NotificationInvalidNoDate = 1400,

	NotificationInvalidNoContent = 1401,

	ContentProvidingObjectNotAllowed = 1500,

	ContentProvidingInvalid = 1501,

	BadgeInputInvalid = 1600
}

/**
 * @since 10.0
 */
declare var UNErrorDomain: string;

/**
 * @since 10.0
 */
declare class UNLocationNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNLocationNotificationTrigger; // inherited from NSObject

	static new(): UNLocationNotificationTrigger; // inherited from NSObject

	static triggerWithRegionRepeats(region: CLRegion, repeats: boolean): UNLocationNotificationTrigger;

	readonly region: CLRegion;
}

/**
 * @since 10.0
 */
declare class UNMutableNotificationContent extends UNNotificationContent {

	static alloc(): UNMutableNotificationContent; // inherited from NSObject

	static new(): UNMutableNotificationContent; // inherited from NSObject

	attachments: NSArray<UNNotificationAttachment>;

	badge: number;

	body: string;

	categoryIdentifier: string;

	/**
	 * @since 16.0
	 */
	filterCriteria: string;

	/**
	 * @since 15.0
	 */
	interruptionLevel: UNNotificationInterruptionLevel;

	launchImageName: string;

	/**
	 * @since 15.0
	 */
	relevanceScore: number;

	sound: UNNotificationSound;

	subtitle: string;

	/**
	 * @since 12.0
	 * @deprecated 15.0
	 */
	summaryArgument: string;

	/**
	 * @since 12.0
	 * @deprecated 15.0
	 */
	summaryArgumentCount: number;

	/**
	 * @since 13.0
	 */
	targetContentIdentifier: string;

	threadIdentifier: string;

	title: string;

	userInfo: NSDictionary<any, any>;
}

/**
 * @since 10.0
 */
declare class UNNotification extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotification; // inherited from NSObject

	static new(): UNNotification; // inherited from NSObject

	readonly date: Date;

	readonly request: UNNotificationRequest;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class UNNotificationAction extends NSObject implements NSCopying, NSSecureCoding {

	static actionWithIdentifierTitleOptions(identifier: string, title: string, options: UNNotificationActionOptions): UNNotificationAction;

	/**
	 * @since 15.0
	 */
	static actionWithIdentifierTitleOptionsIcon(identifier: string, title: string, options: UNNotificationActionOptions, icon: UNNotificationActionIcon): UNNotificationAction;

	static alloc(): UNNotificationAction; // inherited from NSObject

	static new(): UNNotificationAction; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly icon: UNNotificationActionIcon;

	readonly identifier: string;

	readonly options: UNNotificationActionOptions;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
declare class UNNotificationActionIcon extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationActionIcon; // inherited from NSObject

	static iconWithSystemImageName(systemImageName: string): UNNotificationActionIcon;

	static iconWithTemplateImageName(templateImageName: string): UNNotificationActionIcon;

	static new(): UNNotificationActionIcon; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare var UNNotificationActionOptionNone: UNNotificationActionOptions;

/**
 * @since 10.0
 */
declare const enum UNNotificationActionOptions {

	AuthenticationRequired = 1,

	Destructive = 2,

	Foreground = 4
}

/**
 * @since 10.0
 */
declare class UNNotificationAttachment extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationAttachment; // inherited from NSObject

	static attachmentWithIdentifierURLOptionsError(identifier: string, URL: NSURL, options: NSDictionary<any, any>): UNNotificationAttachment;

	static new(): UNNotificationAttachment; // inherited from NSObject

	readonly URL: NSURL;

	readonly identifier: string;

	readonly type: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare var UNNotificationAttachmentOptionsThumbnailClippingRectKey: string;

/**
 * @since 10.0
 */
declare var UNNotificationAttachmentOptionsThumbnailHiddenKey: string;

/**
 * @since 10.0
 */
declare var UNNotificationAttachmentOptionsThumbnailTimeKey: string;

/**
 * @since 10.0
 */
declare var UNNotificationAttachmentOptionsTypeHintKey: string;

/**
 * @since 18.0
 */
declare class UNNotificationAttributedMessageContext extends NSObject implements UNNotificationContentProviding {

	static alloc(): UNNotificationAttributedMessageContext; // inherited from NSObject

	static contextWithSendMessageIntentAttributedContent(sendMessageIntent: INSendMessageIntent, attributedContent: NSAttributedString): UNNotificationAttributedMessageContext;

	static new(): UNNotificationAttributedMessageContext; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 10.0
 */
declare class UNNotificationCategory extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationCategory; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static categoryWithIdentifierActionsIntentIdentifiersHiddenPreviewsBodyPlaceholderCategorySummaryFormatOptions(identifier: string, actions: NSArray<UNNotificationAction> | UNNotificationAction[], intentIdentifiers: NSArray<string> | string[], hiddenPreviewsBodyPlaceholder: string, categorySummaryFormat: string, options: UNNotificationCategoryOptions): UNNotificationCategory;

	/**
	 * @since 11.0
	 */
	static categoryWithIdentifierActionsIntentIdentifiersHiddenPreviewsBodyPlaceholderOptions(identifier: string, actions: NSArray<UNNotificationAction> | UNNotificationAction[], intentIdentifiers: NSArray<string> | string[], hiddenPreviewsBodyPlaceholder: string, options: UNNotificationCategoryOptions): UNNotificationCategory;

	static categoryWithIdentifierActionsIntentIdentifiersOptions(identifier: string, actions: NSArray<UNNotificationAction> | UNNotificationAction[], intentIdentifiers: NSArray<string> | string[], options: UNNotificationCategoryOptions): UNNotificationCategory;

	static new(): UNNotificationCategory; // inherited from NSObject

	readonly actions: NSArray<UNNotificationAction>;

	/**
	 * @since 12.0
	 */
	readonly categorySummaryFormat: string;

	/**
	 * @since 11.0
	 */
	readonly hiddenPreviewsBodyPlaceholder: string;

	readonly identifier: string;

	readonly intentIdentifiers: NSArray<string>;

	readonly options: UNNotificationCategoryOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare var UNNotificationCategoryOptionNone: UNNotificationCategoryOptions;

/**
 * @since 10.0
 */
declare const enum UNNotificationCategoryOptions {

	CustomDismissAction = 1,

	AllowInCarPlay = 2,

	HiddenPreviewsShowTitle = 4,

	HiddenPreviewsShowSubtitle = 8,

	AllowAnnouncement = 16
}

/**
 * @since 10.0
 */
declare class UNNotificationContent extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): UNNotificationContent; // inherited from NSObject

	static new(): UNNotificationContent; // inherited from NSObject

	readonly attachments: NSArray<UNNotificationAttachment>;

	readonly badge: number;

	readonly body: string;

	readonly categoryIdentifier: string;

	/**
	 * @since 16.0
	 */
	readonly filterCriteria: string;

	/**
	 * @since 15.0
	 */
	readonly interruptionLevel: UNNotificationInterruptionLevel;

	readonly launchImageName: string;

	/**
	 * @since 15.0
	 */
	readonly relevanceScore: number;

	readonly sound: UNNotificationSound;

	readonly subtitle: string;

	/**
	 * @since 12.0
	 * @deprecated 15.0
	 */
	readonly summaryArgument: string;

	/**
	 * @since 12.0
	 * @deprecated 15.0
	 */
	readonly summaryArgumentCount: number;

	/**
	 * @since 13.0
	 */
	readonly targetContentIdentifier: string;

	readonly threadIdentifier: string;

	readonly title: string;

	readonly userInfo: NSDictionary<any, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 15.0
	 */
	contentByUpdatingWithProviderError(provider: UNNotificationContentProviding): UNNotificationContent;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.0
 */
interface UNNotificationContentProviding extends NSObjectProtocol {
}
declare var UNNotificationContentProviding: {

	prototype: UNNotificationContentProviding;
};

/**
 * @since 10.0
 */
declare var UNNotificationDefaultActionIdentifier: string;

/**
 * @since 10.0
 */
declare var UNNotificationDismissActionIdentifier: string;

/**
 * @since 15.0
 */
declare const enum UNNotificationInterruptionLevel {

	Passive = 0,

	Active = 1,

	TimeSensitive = 2,

	Critical = 3
}

/**
 * @since 10.0
 */
declare var UNNotificationPresentationOptionNone: UNNotificationPresentationOptions;

/**
 * @since 10.0
 */
declare const enum UNNotificationPresentationOptions {

	Badge = 1,

	Sound = 2,

	Alert = 4,

	List = 8,

	Banner = 16
}

/**
 * @since 10.0
 */
declare class UNNotificationRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationRequest; // inherited from NSObject

	static new(): UNNotificationRequest; // inherited from NSObject

	static requestWithIdentifierContentTrigger(identifier: string, content: UNNotificationContent, trigger: UNNotificationTrigger): UNNotificationRequest;

	readonly content: UNNotificationContent;

	readonly identifier: string;

	readonly trigger: UNNotificationTrigger;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class UNNotificationResponse extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationResponse; // inherited from NSObject

	static new(): UNNotificationResponse; // inherited from NSObject

	readonly actionIdentifier: string;

	readonly notification: UNNotification;

	/**
	 * @since 13.0
	 */
	readonly targetScene: UIScene;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class UNNotificationServiceExtension extends NSObject {

	static alloc(): UNNotificationServiceExtension; // inherited from NSObject

	static new(): UNNotificationServiceExtension; // inherited from NSObject

	didReceiveNotificationRequestWithContentHandler(request: UNNotificationRequest, contentHandler: (p1: UNNotificationContent) => void): void;

	serviceExtensionTimeWillExpire(): void;
}

/**
 * @since 10.0
 */
declare const enum UNNotificationSetting {

	NotSupported = 0,

	Disabled = 1,

	Enabled = 2
}

/**
 * @since 10.0
 */
declare class UNNotificationSettings extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationSettings; // inherited from NSObject

	static new(): UNNotificationSettings; // inherited from NSObject

	readonly alertSetting: UNNotificationSetting;

	readonly alertStyle: UNAlertStyle;

	/**
	 * @since 13.0
	 */
	readonly announcementSetting: UNNotificationSetting;

	readonly authorizationStatus: UNAuthorizationStatus;

	readonly badgeSetting: UNNotificationSetting;

	readonly carPlaySetting: UNNotificationSetting;

	/**
	 * @since 12.0
	 */
	readonly criticalAlertSetting: UNNotificationSetting;

	/**
	 * @since 15.0
	 */
	readonly directMessagesSetting: UNNotificationSetting;

	readonly lockScreenSetting: UNNotificationSetting;

	readonly notificationCenterSetting: UNNotificationSetting;

	/**
	 * @since 12.0
	 */
	readonly providesAppNotificationSettings: boolean;

	/**
	 * @since 15.0
	 */
	readonly scheduledDeliverySetting: UNNotificationSetting;

	/**
	 * @since 11.0
	 */
	readonly showPreviewsSetting: UNShowPreviewsSetting;

	readonly soundSetting: UNNotificationSetting;

	/**
	 * @since 15.0
	 */
	readonly timeSensitiveSetting: UNNotificationSetting;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class UNNotificationSound extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationSound; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	static criticalSoundNamed(name: string): UNNotificationSound;

	/**
	 * @since 12.0
	 */
	static criticalSoundNamedWithAudioVolume(name: string, volume: number): UNNotificationSound;

	/**
	 * @since 12.0
	 */
	static defaultCriticalSoundWithAudioVolume(volume: number): UNNotificationSound;

	static new(): UNNotificationSound; // inherited from NSObject

	/**
	 * @since 15.2
	 */
	static ringtoneSoundNamed(name: string): UNNotificationSound;

	static soundNamed(name: string): UNNotificationSound;

	/**
	 * @since 12.0
	 */
	static readonly defaultCriticalSound: UNNotificationSound;

	/**
	 * @since 15.2
	 */
	static readonly defaultRingtoneSound: UNNotificationSound;

	static readonly defaultSound: UNNotificationSound;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class UNNotificationTrigger extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): UNNotificationTrigger; // inherited from NSObject

	static new(): UNNotificationTrigger; // inherited from NSObject

	readonly repeats: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class UNPushNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNPushNotificationTrigger; // inherited from NSObject

	static new(): UNPushNotificationTrigger; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare const enum UNShowPreviewsSetting {

	Always = 0,

	WhenAuthenticated = 1,

	Never = 2
}

/**
 * @since 10.0
 */
declare class UNTextInputNotificationAction extends UNNotificationAction {

	static actionWithIdentifierTitleOptions(identifier: string, title: string, options: UNNotificationActionOptions): UNTextInputNotificationAction; // inherited from UNNotificationAction

	/**
	 * @since 15.0
	 */
	static actionWithIdentifierTitleOptionsIcon(identifier: string, title: string, options: UNNotificationActionOptions, icon: UNNotificationActionIcon): UNTextInputNotificationAction; // inherited from UNNotificationAction

	/**
	 * @since 15.0
	 */
	static actionWithIdentifierTitleOptionsIconTextInputButtonTitleTextInputPlaceholder(identifier: string, title: string, options: UNNotificationActionOptions, icon: UNNotificationActionIcon, textInputButtonTitle: string, textInputPlaceholder: string): UNTextInputNotificationAction;

	static actionWithIdentifierTitleOptionsTextInputButtonTitleTextInputPlaceholder(identifier: string, title: string, options: UNNotificationActionOptions, textInputButtonTitle: string, textInputPlaceholder: string): UNTextInputNotificationAction;

	static alloc(): UNTextInputNotificationAction; // inherited from NSObject

	static new(): UNTextInputNotificationAction; // inherited from NSObject

	readonly textInputButtonTitle: string;

	readonly textInputPlaceholder: string;
}

/**
 * @since 10.0
 */
declare class UNTextInputNotificationResponse extends UNNotificationResponse {

	static alloc(): UNTextInputNotificationResponse; // inherited from NSObject

	static new(): UNTextInputNotificationResponse; // inherited from NSObject

	readonly userText: string;
}

/**
 * @since 10.0
 */
declare class UNTimeIntervalNotificationTrigger extends UNNotificationTrigger {

	static alloc(): UNTimeIntervalNotificationTrigger; // inherited from NSObject

	static new(): UNTimeIntervalNotificationTrigger; // inherited from NSObject

	static triggerWithTimeIntervalRepeats(timeInterval: number, repeats: boolean): UNTimeIntervalNotificationTrigger;

	readonly timeInterval: number;

	nextTriggerDate(): Date;
}

/**
 * @since 10.0
 */
declare class UNUserNotificationCenter extends NSObject {

	static alloc(): UNUserNotificationCenter; // inherited from NSObject

	static currentNotificationCenter(): UNUserNotificationCenter;

	static new(): UNUserNotificationCenter; // inherited from NSObject

	delegate: UNUserNotificationCenterDelegate;

	readonly supportsContentExtensions: boolean;

	addNotificationRequestWithCompletionHandler(request: UNNotificationRequest, completionHandler: (p1: NSError) => void): void;

	getDeliveredNotificationsWithCompletionHandler(completionHandler: (p1: NSArray<UNNotification>) => void): void;

	getNotificationCategoriesWithCompletionHandler(completionHandler: (p1: NSSet<UNNotificationCategory>) => void): void;

	getNotificationSettingsWithCompletionHandler(completionHandler: (p1: UNNotificationSettings) => void): void;

	getPendingNotificationRequestsWithCompletionHandler(completionHandler: (p1: NSArray<UNNotificationRequest>) => void): void;

	removeAllDeliveredNotifications(): void;

	removeAllPendingNotificationRequests(): void;

	removeDeliveredNotificationsWithIdentifiers(identifiers: NSArray<string> | string[]): void;

	removePendingNotificationRequestsWithIdentifiers(identifiers: NSArray<string> | string[]): void;

	requestAuthorizationWithOptionsCompletionHandler(options: UNAuthorizationOptions, completionHandler: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	setBadgeCountWithCompletionHandler(newBadgeCount: number, completionHandler: (p1: NSError) => void): void;

	setNotificationCategories(categories: NSSet<UNNotificationCategory>): void;
}

/**
 * @since 10.0
 */
interface UNUserNotificationCenterDelegate extends NSObjectProtocol {

	/**
	 * @since 10.0
	 */
	userNotificationCenterDidReceiveNotificationResponseWithCompletionHandler?(center: UNUserNotificationCenter, response: UNNotificationResponse, completionHandler: () => void): void;

	/**
	 * @since 12.0
	 */
	userNotificationCenterOpenSettingsForNotification?(center: UNUserNotificationCenter, notification: UNNotification): void;

	/**
	 * @since 10.0
	 */
	userNotificationCenterWillPresentNotificationWithCompletionHandler?(center: UNUserNotificationCenter, notification: UNNotification, completionHandler: (p1: UNNotificationPresentationOptions) => void): void;
}
declare var UNUserNotificationCenterDelegate: {

	prototype: UNUserNotificationCenterDelegate;
};
