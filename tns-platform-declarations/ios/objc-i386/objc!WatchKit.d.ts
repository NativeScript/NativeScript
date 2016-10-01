
declare var UIUserNotificationActionResponseTypedTextKey: string;

declare class WKAccessibilityImageRegion extends NSObject {

	static alloc(): WKAccessibilityImageRegion; // inherited from NSObject

	static new(): WKAccessibilityImageRegion; // inherited from NSObject

	frame: CGRect;

	label: string;
}

interface WKImageAnimatable extends NSObjectProtocol {

	startAnimating(): void;

	startAnimatingWithImagesInRangeDurationRepeatCount(imageRange: NSRange, duration: number, repeatCount: number): void;

	stopAnimating(): void;
}
declare var WKImageAnimatable: {

	prototype: WKImageAnimatable;
};

declare class WKInterfaceButton extends WKInterfaceObject {

	static alloc(): WKInterfaceButton; // inherited from NSObject

	static new(): WKInterfaceButton; // inherited from NSObject

	setAttributedTitle(attributedTitle: NSAttributedString): void;

	setBackgroundColor(color: UIColor): void;

	setBackgroundImage(image: UIImage): void;

	setBackgroundImageData(imageData: NSData): void;

	setBackgroundImageNamed(imageName: string): void;

	setEnabled(enabled: boolean): void;

	setTitle(title: string): void;
}

declare class WKInterfaceController extends NSObject {

	static alloc(): WKInterfaceController; // inherited from NSObject

	static new(): WKInterfaceController; // inherited from NSObject

	static openParentApplicationReply(userInfo: NSDictionary<any, any>, reply: (p1: NSDictionary<any, any>, p2: NSError) => void): boolean;

	static reloadRootControllersWithNamesContexts(names: NSArray<string>, contexts: NSArray<any>): void;

	readonly contentFrame: CGRect;

	addMenuItemWithImageNamedTitleAction(imageName: string, title: string, action: string): void;

	addMenuItemWithImageTitleAction(image: UIImage, title: string, action: string): void;

	addMenuItemWithItemIconTitleAction(itemIcon: WKMenuItemIcon, title: string, action: string): void;

	awakeWithContext(context: any): void;

	becomeCurrentPage(): void;

	clearAllMenuItems(): void;

	contextForSegueWithIdentifier(segueIdentifier: string): any;

	contextForSegueWithIdentifierInTableRowIndex(segueIdentifier: string, table: WKInterfaceTable, rowIndex: number): any;

	contextsForSegueWithIdentifier(segueIdentifier: string): NSArray<any>;

	contextsForSegueWithIdentifierInTableRowIndex(segueIdentifier: string, table: WKInterfaceTable, rowIndex: number): NSArray<any>;

	didDeactivate(): void;

	dismissController(): void;

	dismissTextInputController(): void;

	handleActionWithIdentifierForLocalNotification(identifier: string, localNotification: UILocalNotification): void;

	handleActionWithIdentifierForNotification(identifier: string, notification: UNNotification): void;

	handleActionWithIdentifierForRemoteNotification(identifier: string, remoteNotification: NSDictionary<any, any>): void;

	handleUserActivity(userInfo: NSDictionary<any, any>): void;

	invalidateUserActivity(): void;

	popController(): void;

	popToRootController(): void;

	presentControllerWithNameContext(name: string, context: any): void;

	presentControllerWithNamesContexts(names: NSArray<string>, contexts: NSArray<any>): void;

	presentTextInputControllerWithSuggestionsAllowedInputModeCompletion(suggestions: NSArray<string>, inputMode: WKTextInputMode, completion: (p1: NSArray<any>) => void): void;

	presentTextInputControllerWithSuggestionsForLanguageAllowedInputModeCompletion(suggestionsHandler: (p1: string) => NSArray<any>, inputMode: WKTextInputMode, completion: (p1: NSArray<any>) => void): void;

	pushControllerWithNameContext(name: string, context: any): void;

	setTitle(title: string): void;

	tableDidSelectRowAtIndex(table: WKInterfaceTable, rowIndex: number): void;

	updateUserActivityUserInfoWebpageURL(type: string, userInfo: NSDictionary<any, any>, webpageURL: NSURL): void;

	willActivate(): void;
}

declare class WKInterfaceDate extends WKInterfaceObject {

	static alloc(): WKInterfaceDate; // inherited from NSObject

	static new(): WKInterfaceDate; // inherited from NSObject

	setCalendar(calendar: NSCalendar): void;

	setTextColor(color: UIColor): void;

	setTimeZone(timeZone: NSTimeZone): void;
}

declare class WKInterfaceDevice extends NSObject {

	static alloc(): WKInterfaceDevice; // inherited from NSObject

	static currentDevice(): WKInterfaceDevice;

	static new(): WKInterfaceDevice; // inherited from NSObject

	readonly cachedImages: NSDictionary<string, number>;

	readonly localizedModel: string;

	readonly model: string;

	readonly name: string;

	readonly preferredContentSizeCategory: string;

	readonly screenBounds: CGRect;

	readonly screenScale: number;

	readonly systemName: string;

	readonly systemVersion: string;

	addCachedImageName(image: UIImage, name: string): boolean;

	addCachedImageWithDataName(imageData: NSData, name: string): boolean;

	removeAllCachedImages(): void;

	removeCachedImageWithName(name: string): void;
}

declare class WKInterfaceGroup extends WKInterfaceObject implements WKImageAnimatable {

	static alloc(): WKInterfaceGroup; // inherited from NSObject

	static new(): WKInterfaceGroup; // inherited from NSObject

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

	setBackgroundColor(color: UIColor): void;

	setBackgroundImage(image: UIImage): void;

	setBackgroundImageData(imageData: NSData): void;

	setBackgroundImageNamed(imageName: string): void;

	setCornerRadius(cornerRadius: number): void;

	startAnimating(): void;

	startAnimatingWithImagesInRangeDurationRepeatCount(imageRange: NSRange, duration: number, repeatCount: number): void;

	stopAnimating(): void;
}

declare class WKInterfaceImage extends WKInterfaceObject implements WKImageAnimatable {

	static alloc(): WKInterfaceImage; // inherited from NSObject

	static new(): WKInterfaceImage; // inherited from NSObject

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

	setImage(image: UIImage): void;

	setImageData(imageData: NSData): void;

	setImageNamed(imageName: string): void;

	setTintColor(tintColor: UIColor): void;

	startAnimating(): void;

	startAnimatingWithImagesInRangeDurationRepeatCount(imageRange: NSRange, duration: number, repeatCount: number): void;

	stopAnimating(): void;
}

declare class WKInterfaceLabel extends WKInterfaceObject {

	static alloc(): WKInterfaceLabel; // inherited from NSObject

	static new(): WKInterfaceLabel; // inherited from NSObject

	setAttributedText(attributedText: NSAttributedString): void;

	setText(text: string): void;

	setTextColor(color: UIColor): void;
}

declare class WKInterfaceMap extends WKInterfaceObject {

	static alloc(): WKInterfaceMap; // inherited from NSObject

	static new(): WKInterfaceMap; // inherited from NSObject

	addAnnotationWithImageCenterOffset(location: CLLocationCoordinate2D, image: UIImage, offset: CGPoint): void;

	addAnnotationWithImageNamedCenterOffset(location: CLLocationCoordinate2D, name: string, offset: CGPoint): void;

	addAnnotationWithPinColor(location: CLLocationCoordinate2D, pinColor: WKInterfaceMapPinColor): void;

	removeAllAnnotations(): void;

	setRegion(coordinateRegion: MKCoordinateRegion): void;

	setVisibleMapRect(mapRect: MKMapRect): void;
}

declare const enum WKInterfaceMapPinColor {

	Red = 0,

	Green = 1,

	Purple = 2
}

declare class WKInterfaceObject extends NSObject {

	static alloc(): WKInterfaceObject; // inherited from NSObject

	static new(): WKInterfaceObject; // inherited from NSObject

	readonly interfaceProperty: string;

	setAccessibilityHint(accessibilityHint: string): void;

	setAccessibilityIdentifier(accessibilityIdentifier: string): void;

	setAccessibilityImageRegions(accessibilityImageRegions: NSArray<WKAccessibilityImageRegion>): void;

	setAccessibilityLabel(accessibilityLabel: string): void;

	setAccessibilityTraits(accessibilityTraits: number): void;

	setAccessibilityValue(accessibilityValue: string): void;

	setAlpha(alpha: number): void;

	setHeight(height: number): void;

	setHidden(hidden: boolean): void;

	setIsAccessibilityElement(isAccessibilityElement: boolean): void;

	setWidth(width: number): void;
}

declare class WKInterfaceSeparator extends WKInterfaceObject {

	static alloc(): WKInterfaceSeparator; // inherited from NSObject

	static new(): WKInterfaceSeparator; // inherited from NSObject

	setColor(color: UIColor): void;
}

declare class WKInterfaceSlider extends WKInterfaceObject {

	static alloc(): WKInterfaceSlider; // inherited from NSObject

	static new(): WKInterfaceSlider; // inherited from NSObject

	setColor(color: UIColor): void;

	setEnabled(enabled: boolean): void;

	setNumberOfSteps(numberOfSteps: number): void;

	setValue(value: number): void;
}

declare class WKInterfaceSwitch extends WKInterfaceObject {

	static alloc(): WKInterfaceSwitch; // inherited from NSObject

	static new(): WKInterfaceSwitch; // inherited from NSObject

	setAttributedTitle(attributedTitle: NSAttributedString): void;

	setColor(color: UIColor): void;

	setEnabled(enabled: boolean): void;

	setOn(on: boolean): void;

	setTitle(title: string): void;
}

declare class WKInterfaceTable extends WKInterfaceObject {

	static alloc(): WKInterfaceTable; // inherited from NSObject

	static new(): WKInterfaceTable; // inherited from NSObject

	readonly numberOfRows: number;

	insertRowsAtIndexesWithRowType(rows: NSIndexSet, rowType: string): void;

	removeRowsAtIndexes(rows: NSIndexSet): void;

	rowControllerAtIndex(index: number): any;

	scrollToRowAtIndex(index: number): void;

	setNumberOfRowsWithRowType(numberOfRows: number, rowType: string): void;

	setRowTypes(rowTypes: NSArray<string>): void;
}

declare class WKInterfaceTimer extends WKInterfaceObject {

	static alloc(): WKInterfaceTimer; // inherited from NSObject

	static new(): WKInterfaceTimer; // inherited from NSObject

	setDate(date: Date): void;

	setTextColor(color: UIColor): void;

	start(): void;

	stop(): void;
}

declare const enum WKMenuItemIcon {

	Accept = 0,

	Add = 1,

	Block = 2,

	Decline = 3,

	Info = 4,

	Maybe = 5,

	More = 6,

	Mute = 7,

	Pause = 8,

	Play = 9,

	Repeat = 10,

	Resume = 11,

	Share = 12,

	Shuffle = 13,

	Speaker = 14,

	Trash = 15
}

declare const enum WKTextInputMode {

	Plain = 0,

	AllowEmoji = 1,

	AllowAnimatedEmoji = 2
}

declare class WKUserNotificationInterfaceController extends WKInterfaceController {

	static alloc(): WKUserNotificationInterfaceController; // inherited from NSObject

	static new(): WKUserNotificationInterfaceController; // inherited from NSObject

	didReceiveLocalNotificationWithCompletion(localNotification: UILocalNotification, completionHandler: (p1: WKUserNotificationInterfaceType) => void): void;

	didReceiveNotificationWithCompletion(notification: UNNotification, completionHandler: (p1: WKUserNotificationInterfaceType) => void): void;

	didReceiveRemoteNotificationWithCompletion(remoteNotification: NSDictionary<any, any>, completionHandler: (p1: WKUserNotificationInterfaceType) => void): void;
}

declare const enum WKUserNotificationInterfaceType {

	Default = 0,

	Custom = 1
}

declare const enum WatchKitErrorCode {

	UnknownError = 1,

	ApplicationDelegateWatchKitRequestReplyNotCalledError = 2,

	InvalidArgumentError = 3,

	MediaPlayerError = 4,

	DownloadError = 5,

	RecordingFailedError = 6
}

declare var WatchKitErrorDomain: string;
