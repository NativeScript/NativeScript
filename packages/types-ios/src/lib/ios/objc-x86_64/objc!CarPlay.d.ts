
/**
 * @since 12.0
 */
declare class CPActionSheetTemplate extends CPTemplate {

	static alloc(): CPActionSheetTemplate; // inherited from NSObject

	static new(): CPActionSheetTemplate; // inherited from NSObject

	readonly actions: NSArray<CPAlertAction>;

	readonly message: string;

	readonly title: string;

	constructor(o: { title: string; message: string; actions: NSArray<CPAlertAction> | CPAlertAction[]; });

	initWithTitleMessageActions(title: string, message: string, actions: NSArray<CPAlertAction> | CPAlertAction[]): this;
}

/**
 * @since 12.0
 */
declare class CPAlertAction extends NSObject implements NSSecureCoding {

	static alloc(): CPAlertAction; // inherited from NSObject

	static new(): CPAlertAction; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly color: UIColor;

	readonly handler: (p1: CPAlertAction) => void;

	readonly style: CPAlertActionStyle;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 16.0
	 */
	constructor(o: { title: string; color: UIColor; handler: (p1: CPAlertAction) => void; });

	constructor(o: { title: string; style: CPAlertActionStyle; handler: (p1: CPAlertAction) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 16.0
	 */
	initWithTitleColorHandler(title: string, color: UIColor, handler: (p1: CPAlertAction) => void): this;

	initWithTitleStyleHandler(title: string, style: CPAlertActionStyle, handler: (p1: CPAlertAction) => void): this;
}

/**
 * @since 12.0
 */
declare const enum CPAlertActionStyle {

	Default = 0,

	Cancel = 1,

	Destructive = 2
}

/**
 * @since 12.0
 */
declare class CPAlertTemplate extends CPTemplate {

	static alloc(): CPAlertTemplate; // inherited from NSObject

	static new(): CPAlertTemplate; // inherited from NSObject

	readonly actions: NSArray<CPAlertAction>;

	readonly titleVariants: NSArray<string>;

	/**
	 * @since 14.0
	 */
	static readonly maximumActionCount: number;

	constructor(o: { titleVariants: NSArray<string> | string[]; actions: NSArray<CPAlertAction> | CPAlertAction[]; });

	initWithTitleVariantsActions(titleVariants: NSArray<string> | string[], actions: NSArray<CPAlertAction> | CPAlertAction[]): this;
}

/**
 * @since 12.0
 * @deprecated 13.0
 */
interface CPApplicationDelegate extends UIApplicationDelegate {

	applicationDidConnectCarInterfaceControllerToWindow(application: UIApplication, interfaceController: CPInterfaceController, window: CPWindow): void;

	applicationDidDisconnectCarInterfaceControllerFromWindow(application: UIApplication, interfaceController: CPInterfaceController, window: CPWindow): void;

	applicationDidSelectManeuver?(application: UIApplication, maneuver: CPManeuver): void;

	applicationDidSelectNavigationAlert?(application: UIApplication, navigationAlert: CPNavigationAlert): void;
}
declare var CPApplicationDelegate: {

	prototype: CPApplicationDelegate;
};

/**
 * @since 15.0
 */
declare const enum CPAssistantCellActionType {

	PlayMedia = 0,

	StartCall = 1
}

/**
 * @since 15.0
 */
declare class CPAssistantCellConfiguration extends NSObject implements NSSecureCoding {

	static alloc(): CPAssistantCellConfiguration; // inherited from NSObject

	static new(): CPAssistantCellConfiguration; // inherited from NSObject

	readonly assistantAction: CPAssistantCellActionType;

	readonly position: CPAssistantCellPosition;

	readonly visibility: CPAssistantCellVisibility;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { position: CPAssistantCellPosition; visibility: CPAssistantCellVisibility; assistantAction: CPAssistantCellActionType; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPositionVisibilityAssistantAction(position: CPAssistantCellPosition, visibility: CPAssistantCellVisibility, assistantAction: CPAssistantCellActionType): this;
}

/**
 * @since 15.0
 */
declare const enum CPAssistantCellPosition {

	Top = 0,

	Bottom = 1
}

/**
 * @since 15.0
 */
declare const enum CPAssistantCellVisibility {

	Off = 0,

	WhileLimitedUIActive = 1,

	Always = 2
}

/**
 * @since 12.0
 */
declare class CPBarButton extends NSObject implements NSSecureCoding {

	static alloc(): CPBarButton; // inherited from NSObject

	static new(): CPBarButton; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	buttonStyle: CPBarButtonStyle;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	readonly buttonType: CPBarButtonType;

	enabled: boolean;

	image: UIImage;

	title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 14.0
	 */
	constructor(o: { image: UIImage; handler: (p1: CPBarButton) => void; });

	/**
	 * @since 14.0
	 */
	constructor(o: { title: string; handler: (p1: CPBarButton) => void; });

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	constructor(o: { type: CPBarButtonType; handler: (p1: CPBarButton) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 14.0
	 */
	initWithImageHandler(image: UIImage, handler: (p1: CPBarButton) => void): this;

	/**
	 * @since 14.0
	 */
	initWithTitleHandler(title: string, handler: (p1: CPBarButton) => void): this;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	initWithTypeHandler(type: CPBarButtonType, handler: (p1: CPBarButton) => void): this;
}

/**
 * @since 12.0
 */
interface CPBarButtonProviding extends NSObjectProtocol {

	backButton: CPBarButton;

	leadingNavigationBarButtons: NSArray<CPBarButton>;

	trailingNavigationBarButtons: NSArray<CPBarButton>;
}
declare var CPBarButtonProviding: {

	prototype: CPBarButtonProviding;
};

/**
 * @since 14.0
 */
declare const enum CPBarButtonStyle {

	None = 0,

	Rounded = 1
}

/**
 * @since 12.0
 */
declare const enum CPBarButtonType {

	Text = 0,

	Image = 1
}

/**
 * @since 14.0
 */
declare class CPButton extends NSObject {

	static alloc(): CPButton; // inherited from NSObject

	static new(): CPButton; // inherited from NSObject

	enabled: boolean;

	readonly image: UIImage;

	title: string;

	constructor(o: { image: UIImage; handler: (p1: CPButton) => void; });

	initWithImageHandler(image: UIImage, handler: (p1: CPButton) => void): this;
}

declare var CPButtonMaximumImageSize: CGSize;

/**
 * @since 14.0
 */
declare class CPContact extends NSObject implements NSSecureCoding {

	static alloc(): CPContact; // inherited from NSObject

	static new(): CPContact; // inherited from NSObject

	actions: NSArray<CPButton>;

	image: UIImage;

	informativeText: string;

	name: string;

	subtitle: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; image: UIImage; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameImage(name: string, image: UIImage): this;
}

/**
 * @since 14.0
 */
declare class CPContactCallButton extends CPButton {

	static alloc(): CPContactCallButton; // inherited from NSObject

	static new(): CPContactCallButton; // inherited from NSObject

	constructor(o: { handler: (p1: CPButton) => void; });

	initWithHandler(handler: (p1: CPButton) => void): this;
}

/**
 * @since 14.0
 */
declare class CPContactDirectionsButton extends CPButton {

	static alloc(): CPContactDirectionsButton; // inherited from NSObject

	static new(): CPContactDirectionsButton; // inherited from NSObject

	constructor(o: { handler: (p1: CPButton) => void; });

	initWithHandler(handler: (p1: CPButton) => void): this;
}

/**
 * @since 14.0
 */
declare class CPContactMessageButton extends CPButton {

	static alloc(): CPContactMessageButton; // inherited from NSObject

	static new(): CPContactMessageButton; // inherited from NSObject

	readonly phoneOrEmail: string;

	constructor(o: { phoneOrEmail: string; });

	initWithPhoneOrEmail(phoneOrEmail: string): this;
}

/**
 * @since 14.0
 */
declare class CPContactTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPContactTemplate; // inherited from NSObject

	static new(): CPContactTemplate; // inherited from NSObject

	contact: CPContact;

	backButton: CPBarButton; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	constructor(o: { contact: CPContact; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithContact(contact: CPContact): this;

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
 * @since 13.0
 */
declare const enum CPContentStyle {

	Light = 1,

	Dark = 2
}

/**
 * @since 13.4
 */
declare class CPDashboardButton extends NSObject implements NSSecureCoding {

	static alloc(): CPDashboardButton; // inherited from NSObject

	static new(): CPDashboardButton; // inherited from NSObject

	readonly image: UIImage;

	readonly subtitleVariants: NSArray<string>;

	readonly titleVariants: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { titleVariants: NSArray<string> | string[]; subtitleVariants: NSArray<string> | string[]; image: UIImage; handler: (p1: CPDashboardButton) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleVariantsSubtitleVariantsImageHandler(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[], image: UIImage, handler: (p1: CPDashboardButton) => void): this;
}

/**
 * @since 13.4
 */
declare class CPDashboardController extends NSObject {

	static alloc(): CPDashboardController; // inherited from NSObject

	static new(): CPDashboardController; // inherited from NSObject

	shortcutButtons: NSArray<CPDashboardButton>;
}

/**
 * @since 12.0
 */
declare class CPGridButton extends NSObject implements NSSecureCoding {

	static alloc(): CPGridButton; // inherited from NSObject

	static new(): CPGridButton; // inherited from NSObject

	enabled: boolean;

	readonly image: UIImage;

	readonly titleVariants: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { titleVariants: NSArray<string> | string[]; image: UIImage; handler: (p1: CPGridButton) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleVariantsImageHandler(titleVariants: NSArray<string> | string[], image: UIImage, handler: (p1: CPGridButton) => void): this;
}

/**
 * @since 12.0
 */
declare class CPGridTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPGridTemplate; // inherited from NSObject

	static new(): CPGridTemplate; // inherited from NSObject

	readonly gridButtons: NSArray<CPGridButton>;

	readonly title: string;

	backButton: CPBarButton; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	constructor(o: { title: string; gridButtons: NSArray<CPGridButton> | CPGridButton[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTitleGridButtons(title: string, gridButtons: NSArray<CPGridButton> | CPGridButton[]): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 15.0
	 */
	updateGridButtons(gridButtons: NSArray<CPGridButton> | CPGridButton[]): void;

	/**
	 * @since 15.0
	 */
	updateTitle(title: string): void;
}

/**
 * @since 15.0
 */
declare var CPGridTemplateMaximumItems: number;

/**
 * @since 12.0
 */
declare class CPImageSet extends NSObject implements NSSecureCoding {

	static alloc(): CPImageSet; // inherited from NSObject

	static new(): CPImageSet; // inherited from NSObject

	readonly darkContentImage: UIImage;

	readonly lightContentImage: UIImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { lightContentImage: UIImage; darkContentImage: UIImage; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLightContentImageDarkContentImage(lightImage: UIImage, darkImage: UIImage): this;
}

/**
 * @since 14.0
 */
declare class CPInformationItem extends NSObject implements NSSecureCoding {

	static alloc(): CPInformationItem; // inherited from NSObject

	static new(): CPInformationItem; // inherited from NSObject

	readonly detail: string;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; detail: string; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleDetail(title: string, detail: string): this;
}

/**
 * @since 14.0
 */
declare class CPInformationRatingItem extends CPInformationItem {

	static alloc(): CPInformationRatingItem; // inherited from NSObject

	static new(): CPInformationRatingItem; // inherited from NSObject

	readonly maximumRating: number;

	readonly rating: number;

	constructor(o: { rating: number; maximumRating: number; title: string; detail: string; });

	initWithRatingMaximumRatingTitleDetail(rating: number, maximumRating: number, title: string, detail: string): this;
}

/**
 * @since 14.0
 */
declare class CPInformationTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPInformationTemplate; // inherited from NSObject

	static new(): CPInformationTemplate; // inherited from NSObject

	actions: NSArray<CPTextButton>;

	items: NSArray<CPInformationItem>;

	readonly layout: CPInformationTemplateLayout;

	title: string;

	backButton: CPBarButton; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	constructor(o: { title: string; layout: CPInformationTemplateLayout; items: NSArray<CPInformationItem> | CPInformationItem[]; actions: NSArray<CPTextButton> | CPTextButton[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTitleLayoutItemsActions(title: string, layout: CPInformationTemplateLayout, items: NSArray<CPInformationItem> | CPInformationItem[], actions: NSArray<CPTextButton> | CPTextButton[]): this;

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
 * @since 14.0
 */
declare const enum CPInformationTemplateLayout {

	Leading = 0,

	TwoColumn = 1
}

/**
 * @since 15.4
 */
declare class CPInstrumentClusterController extends NSObject {

	static alloc(): CPInstrumentClusterController; // inherited from NSObject

	static new(): CPInstrumentClusterController; // inherited from NSObject

	attributedInactiveDescriptionVariants: NSArray<NSAttributedString>;

	readonly compassSetting: CPInstrumentClusterSetting;

	delegate: CPInstrumentClusterControllerDelegate;

	inactiveDescriptionVariants: NSArray<string>;

	readonly instrumentClusterWindow: UIWindow;

	readonly speedLimitSetting: CPInstrumentClusterSetting;
}

/**
 * @since 15.4
 */
interface CPInstrumentClusterControllerDelegate extends NSObjectProtocol {

	instrumentClusterControllerDidChangeCompassSetting?(instrumentClusterController: CPInstrumentClusterController, compassSetting: CPInstrumentClusterSetting): void;

	instrumentClusterControllerDidChangeSpeedLimitSetting?(instrumentClusterController: CPInstrumentClusterController, speedLimitSetting: CPInstrumentClusterSetting): void;

	instrumentClusterControllerDidConnectWindow(instrumentClusterWindow: UIWindow): void;

	instrumentClusterControllerDidDisconnectWindow(instrumentClusterWindow: UIWindow): void;

	instrumentClusterControllerDidZoomIn?(instrumentClusterController: CPInstrumentClusterController): void;

	instrumentClusterControllerDidZoomOut?(instrumentClusterController: CPInstrumentClusterController): void;
}
declare var CPInstrumentClusterControllerDelegate: {

	prototype: CPInstrumentClusterControllerDelegate;
};

/**
 * @since 15.4
 */
declare const enum CPInstrumentClusterSetting {

	Unspecified = 0,

	Enabled = 1,

	Disabled = 2,

	UserPreference = 3
}

/**
 * @since 12.0
 */
declare class CPInterfaceController extends NSObject {

	static alloc(): CPInterfaceController; // inherited from NSObject

	static new(): CPInterfaceController; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly carTraitCollection: UITraitCollection;

	delegate: CPInterfaceControllerDelegate;

	/**
	 * @since 13.0
	 */
	prefersDarkUserInterfaceStyle: boolean;

	readonly presentedTemplate: CPTemplate;

	readonly rootTemplate: CPTemplate;

	readonly templates: NSArray<CPTemplate>;

	readonly topTemplate: CPTemplate;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	dismissTemplateAnimated(animated: boolean): void;

	/**
	 * @since 14.0
	 */
	dismissTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	popTemplateAnimated(animated: boolean): void;

	/**
	 * @since 14.0
	 */
	popTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	popToRootTemplateAnimated(animated: boolean): void;

	/**
	 * @since 14.0
	 */
	popToRootTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	popToTemplateAnimated(targetTemplate: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	popToTemplateAnimatedCompletion(targetTemplate: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	presentTemplateAnimated(templateToPresent: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	presentTemplateAnimatedCompletion(templateToPresent: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	pushTemplateAnimated(templateToPush: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	pushTemplateAnimatedCompletion(templateToPush: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	setRootTemplateAnimated(rootTemplate: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	setRootTemplateAnimatedCompletion(rootTemplate: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 12.0
 */
interface CPInterfaceControllerDelegate extends NSObjectProtocol {

	templateDidAppearAnimated?(aTemplate: CPTemplate, animated: boolean): void;

	templateDidDisappearAnimated?(aTemplate: CPTemplate, animated: boolean): void;

	templateWillAppearAnimated?(aTemplate: CPTemplate, animated: boolean): void;

	templateWillDisappearAnimated?(aTemplate: CPTemplate, animated: boolean): void;
}
declare var CPInterfaceControllerDelegate: {

	prototype: CPInterfaceControllerDelegate;
};

/**
 * @since 17.4
 */
declare const enum CPJunctionType {

	Intersection = 0,

	Roundabout = 1
}

/**
 * @since 17.4
 */
declare class CPLane extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPLane; // inherited from NSObject

	static new(): CPLane; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	readonly angles: NSArray<NSMeasurement<NSUnitAngle>>;

	/**
	 * @since 18.0
	 */
	readonly highlightedAngle: NSMeasurement<NSUnitAngle>;

	/**
	 * @since 17.4
	 * @deprecated 18.0
	 */
	primaryAngle: NSMeasurement<NSUnitAngle>;

	/**
	 * @since 17.4
	 * @deprecated 18.0
	 */
	secondaryAngles: NSArray<NSMeasurement<NSUnitAngle>>;

	/**
	 * @since 17.4
	 */
	status: CPLaneStatus;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 18.0
	 */
	constructor(o: { angles: NSArray<NSMeasurement<NSUnitAngle>> | NSMeasurement<NSUnitAngle>[]; });

	/**
	 * @since 18.0
	 */
	constructor(o: { angles: NSArray<NSMeasurement<NSUnitAngle>> | NSMeasurement<NSUnitAngle>[]; highlightedAngle: NSMeasurement<NSUnitAngle>; isPreferred: boolean; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 18.0
	 */
	initWithAngles(angles: NSArray<NSMeasurement<NSUnitAngle>> | NSMeasurement<NSUnitAngle>[]): this;

	/**
	 * @since 18.0
	 */
	initWithAnglesHighlightedAngleIsPreferred(angles: NSArray<NSMeasurement<NSUnitAngle>> | NSMeasurement<NSUnitAngle>[], highlightedAngle: NSMeasurement<NSUnitAngle>, preferred: boolean): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 17.4
	 * @deprecated 18.0
	 */
	setStatus(status: CPLaneStatus): void;
}

/**
 * @since 17.4
 */
declare class CPLaneGuidance extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPLaneGuidance; // inherited from NSObject

	static new(): CPLaneGuidance; // inherited from NSObject

	/**
	 * @since 17.4
	 */
	instructionVariants: NSArray<string>;

	/**
	 * @since 17.4
	 */
	lanes: NSArray<CPLane>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.4
 */
declare const enum CPLaneStatus {

	NotGood = 0,

	Good = 1,

	Preferred = 2
}

/**
 * @since 12.0
 */
declare const enum CPLimitableUserInterface {

	Keyboard = 1,

	Lists = 2
}

/**
 * @since 14.0
 */
declare class CPListImageRowItem extends NSObject implements CPSelectableListItem {

	static alloc(): CPListImageRowItem; // inherited from NSObject

	static new(): CPListImageRowItem; // inherited from NSObject

	readonly gridImages: NSArray<UIImage>;

	/**
	 * @since 17.4
	 */
	imageTitles: NSArray<string>;

	listImageRowHandler: (p1: CPListImageRowItem, p2: number, p3: () => void) => void;

	text: string;

	static readonly maximumImageSize: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	enabled: boolean; // inherited from CPListTemplateItem

	handler: (p1: CPSelectableListItem, p2: () => void) => void; // inherited from CPSelectableListItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userInfo: any; // inherited from CPListTemplateItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { text: string; images: NSArray<UIImage> | UIImage[]; });

	/**
	 * @since 17.4
	 */
	constructor(o: { text: string; images: NSArray<UIImage> | UIImage[]; imageTitles: NSArray<string> | string[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTextImages(text: string, images: NSArray<UIImage> | UIImage[]): this;

	/**
	 * @since 17.4
	 */
	initWithTextImagesImageTitles(text: string, images: NSArray<UIImage> | UIImage[], imageTitles: NSArray<string> | string[]): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updateImages(gridImages: NSArray<UIImage> | UIImage[]): void;
}

/**
 * @since 12.0
 */
declare class CPListItem extends NSObject implements CPSelectableListItem {

	static alloc(): CPListItem; // inherited from NSObject

	static new(): CPListItem; // inherited from NSObject

	readonly accessoryImage: UIImage;

	/**
	 * @since 14.0
	 */
	accessoryType: CPListItemAccessoryType;

	readonly detailText: string;

	/**
	 * @since 14.0
	 */
	explicitContent: boolean;

	readonly image: UIImage;

	/**
	 * @since 14.0
	 */
	playbackProgress: number;

	/**
	 * @since 14.0
	 */
	playing: boolean;

	/**
	 * @since 14.0
	 */
	playingIndicatorLocation: CPListItemPlayingIndicatorLocation;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	readonly showsDisclosureIndicator: boolean;

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	showsExplicitLabel: boolean;

	/**
	 * @since 14.0
	 */
	static readonly maximumImageSize: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	enabled: boolean; // inherited from CPListTemplateItem

	handler: (p1: CPSelectableListItem, p2: () => void) => void; // inherited from CPSelectableListItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly text: string; // inherited from CPListTemplateItem

	userInfo: any; // inherited from CPListTemplateItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { text: string; detailText: string; });

	constructor(o: { text: string; detailText: string; image: UIImage; });

	/**
	 * @since 14.0
	 */
	constructor(o: { text: string; detailText: string; image: UIImage; accessoryImage: UIImage; accessoryType: CPListItemAccessoryType; });

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	constructor(o: { text: string; detailText: string; image: UIImage; showsDisclosureIndicator: boolean; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTextDetailText(text: string, detailText: string): this;

	initWithTextDetailTextImage(text: string, detailText: string, image: UIImage): this;

	/**
	 * @since 14.0
	 */
	initWithTextDetailTextImageAccessoryImageAccessoryType(text: string, detailText: string, image: UIImage, accessoryImage: UIImage, accessoryType: CPListItemAccessoryType): this;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	initWithTextDetailTextImageShowsDisclosureIndicator(text: string, detailText: string, image: UIImage, showsDisclosureIndicator: boolean): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	/**
	 * @since 14.0
	 */
	setAccessoryImage(accessoryImage: UIImage): void;

	/**
	 * @since 14.0
	 */
	setDetailText(detailText: string): void;

	/**
	 * @since 14.0
	 */
	setImage(image: UIImage): void;

	/**
	 * @since 14.0
	 */
	setText(text: string): void;
}

declare const enum CPListItemAccessoryType {

	None = 0,

	DisclosureIndicator = 1,

	Cloud = 2
}

declare const enum CPListItemPlayingIndicatorLocation {

	Leading = 0,

	Trailing = 1
}

/**
 * @since 12.0
 */
declare class CPListSection extends NSObject implements NSSecureCoding {

	static alloc(): CPListSection; // inherited from NSObject

	static new(): CPListSection; // inherited from NSObject

	readonly header: string;

	/**
	 * @since 15.0
	 */
	readonly headerButton: CPButton;

	/**
	 * @since 15.0
	 */
	headerImage: UIImage;

	/**
	 * @since 15.0
	 */
	readonly headerSubtitle: string;

	readonly items: NSArray<CPListTemplateItem>;

	readonly sectionIndexTitle: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; });

	/**
	 * @since 15.0
	 */
	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; header: string; headerSubtitle: string; headerImage: UIImage; headerButton: CPButton; sectionIndexTitle: string; });

	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; header: string; sectionIndexTitle: string; });

	encodeWithCoder(coder: NSCoder): void;

	indexOfItem(item: CPListTemplateItem): number;

	initWithCoder(coder: NSCoder): this;

	initWithItems(items: NSArray<CPListTemplateItem> | CPListTemplateItem[]): this;

	/**
	 * @since 15.0
	 */
	initWithItemsHeaderHeaderSubtitleHeaderImageHeaderButtonSectionIndexTitle(items: NSArray<CPListTemplateItem> | CPListTemplateItem[], header: string, headerSubtitle: string, headerImage: UIImage, headerButton: CPButton, sectionIndexTitle: string): this;

	initWithItemsHeaderSectionIndexTitle(items: NSArray<CPListTemplateItem> | CPListTemplateItem[], header: string, sectionIndexTitle: string): this;

	itemAtIndex(index: number): CPListTemplateItem;
}

/**
 * @since 12.0
 */
declare class CPListTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPListTemplate; // inherited from NSObject

	static new(): CPListTemplate; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	assistantCellConfiguration: CPAssistantCellConfiguration;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	delegate: CPListTemplateDelegate;

	/**
	 * @since 14.0
	 */
	emptyViewSubtitleVariants: NSArray<string>;

	/**
	 * @since 14.0
	 */
	emptyViewTitleVariants: NSArray<string>;

	/**
	 * @since 14.0
	 */
	readonly itemCount: number;

	/**
	 * @since 14.0
	 */
	readonly sectionCount: number;

	readonly sections: NSArray<CPListSection>;

	readonly title: string;

	/**
	 * @since 14.0
	 */
	static readonly maximumItemCount: number;

	/**
	 * @since 14.0
	 */
	static readonly maximumSectionCount: number;

	backButton: CPBarButton; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	constructor(o: { title: string; sections: NSArray<CPListSection> | CPListSection[]; });

	/**
	 * @since 15.0
	 */
	constructor(o: { title: string; sections: NSArray<CPListSection> | CPListSection[]; assistantCellConfiguration: CPAssistantCellConfiguration; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 14.0
	 */
	indexPathForItem(item: CPListTemplateItem): NSIndexPath;

	initWithTitleSections(title: string, sections: NSArray<CPListSection> | CPListSection[]): this;

	/**
	 * @since 15.0
	 */
	initWithTitleSectionsAssistantCellConfiguration(title: string, sections: NSArray<CPListSection> | CPListSection[], assistantCellConfiguration: CPAssistantCellConfiguration): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updateSections(sections: NSArray<CPListSection> | CPListSection[]): void;
}

/**
 * @since 12.0
 * @deprecated 14.0
 */
interface CPListTemplateDelegate extends NSObjectProtocol {

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	listTemplateDidSelectListItemCompletionHandler(listTemplate: CPListTemplate, item: CPListItem, completionHandler: () => void): void;
}
declare var CPListTemplateDelegate: {

	prototype: CPListTemplateDelegate;
};

/**
 * @since 14.0
 */
interface CPListTemplateItem extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	enabled: boolean;

	text: string;

	userInfo: any;
}
declare var CPListTemplateItem: {

	prototype: CPListTemplateItem;
};

/**
 * @since 12.0
 */
declare class CPManeuver extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPManeuver; // inherited from NSObject

	static new(): CPManeuver; // inherited from NSObject

	attributedInstructionVariants: NSArray<NSAttributedString>;

	/**
	 * @since 15.4
	 */
	cardBackgroundColor: UIColor;

	/**
	 * @since 14.0
	 */
	dashboardAttributedInstructionVariants: NSArray<NSAttributedString>;

	/**
	 * @since 14.0
	 */
	dashboardInstructionVariants: NSArray<string>;

	/**
	 * @since 14.0
	 */
	dashboardJunctionImage: UIImage;

	/**
	 * @since 14.0
	 */
	dashboardSymbolImage: UIImage;

	/**
	 * @since 17.4
	 */
	highwayExitLabel: string;

	initialTravelEstimates: CPTravelEstimates;

	instructionVariants: NSArray<string>;

	/**
	 * @since 17.4
	 */
	junctionElementAngles: NSSet<NSMeasurement<NSUnitAngle>>;

	/**
	 * @since 17.4
	 */
	junctionExitAngle: NSMeasurement<NSUnitAngle>;

	junctionImage: UIImage;

	/**
	 * @since 17.4
	 */
	junctionType: CPJunctionType;

	/**
	 * @since 17.4
	 */
	linkedLaneGuidance: CPLaneGuidance;

	/**
	 * @since 17.4
	 */
	maneuverType: CPManeuverType;

	/**
	 * @since 14.0
	 */
	notificationAttributedInstructionVariants: NSArray<NSAttributedString>;

	/**
	 * @since 14.0
	 */
	notificationInstructionVariants: NSArray<string>;

	/**
	 * @since 14.0
	 */
	notificationSymbolImage: UIImage;

	/**
	 * @since 17.4
	 */
	roadFollowingManeuverVariants: NSArray<string>;

	symbolImage: UIImage;

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	symbolSet: CPImageSet;

	/**
	 * @since 17.4
	 */
	trafficSide: CPTrafficSide;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare const enum CPManeuverDisplayStyle {

	Default = 0,

	LeadingSymbol = 1,

	TrailingSymbol = 2,

	SymbolOnly = 3,

	InstructionOnly = 4
}

/**
 * @since 17.4
 */
declare const enum CPManeuverState {

	Continue = 0,

	Initial = 1,

	Prepare = 2,

	Execute = 3
}

/**
 * @since 17.4
 */
declare const enum CPManeuverType {

	NoTurn = 0,

	LeftTurn = 1,

	RightTurn = 2,

	StraightAhead = 3,

	UTurn = 4,

	FollowRoad = 5,

	EnterRoundabout = 6,

	ExitRoundabout = 7,

	OffRamp = 8,

	OnRamp = 9,

	ArriveEndOfNavigation = 10,

	StartRoute = 11,

	ArriveAtDestination = 12,

	KeepLeft = 13,

	KeepRight = 14,

	Enter_Ferry = 15,

	ExitFerry = 16,

	ChangeFerry = 17,

	StartRouteWithUTurn = 18,

	UTurnAtRoundabout = 19,

	LeftTurnAtEnd = 20,

	RightTurnAtEnd = 21,

	HighwayOffRampLeft = 22,

	HighwayOffRampRight = 23,

	ArriveAtDestinationLeft = 24,

	ArriveAtDestinationRight = 25,

	UTurnWhenPossible = 26,

	ArriveEndOfDirections = 27,

	RoundaboutExit1 = 28,

	RoundaboutExit2 = 29,

	RoundaboutExit3 = 30,

	RoundaboutExit4 = 31,

	RoundaboutExit5 = 32,

	RoundaboutExit6 = 33,

	RoundaboutExit7 = 34,

	RoundaboutExit8 = 35,

	RoundaboutExit9 = 36,

	RoundaboutExit10 = 37,

	RoundaboutExit11 = 38,

	RoundaboutExit12 = 39,

	RoundaboutExit13 = 40,

	RoundaboutExit14 = 41,

	RoundaboutExit15 = 42,

	RoundaboutExit16 = 43,

	RoundaboutExit17 = 44,

	RoundaboutExit18 = 45,

	RoundaboutExit19 = 46,

	SharpLeftTurn = 47,

	SharpRightTurn = 48,

	SlightLeftTurn = 49,

	SlightRightTurn = 50,

	ChangeHighway = 51,

	ChangeHighwayLeft = 52,

	ChangeHighwayRight = 53
}

/**
 * @since 12.0
 */
declare class CPMapButton extends NSObject implements NSSecureCoding {

	static alloc(): CPMapButton; // inherited from NSObject

	static new(): CPMapButton; // inherited from NSObject

	enabled: boolean;

	focusedImage: UIImage;

	hidden: boolean;

	image: UIImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { handler: (p1: CPMapButton) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHandler(handler: (p1: CPMapButton) => void): this;
}

/**
 * @since 12.0
 */
declare class CPMapTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPMapTemplate; // inherited from NSObject

	static new(): CPMapTemplate; // inherited from NSObject

	automaticallyHidesNavigationBar: boolean;

	readonly currentNavigationAlert: CPNavigationAlert;

	guidanceBackgroundColor: UIColor;

	hidesButtonsWithNavigationBar: boolean;

	mapButtons: NSArray<CPMapButton>;

	mapDelegate: CPMapTemplateDelegate;

	readonly panningInterfaceVisible: boolean;

	tripEstimateStyle: CPTripEstimateStyle;

	backButton: CPBarButton; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	dismissNavigationAlertAnimatedCompletion(animated: boolean, completion: (p1: boolean) => void): void;

	dismissPanningInterfaceAnimated(animated: boolean): void;

	hideTripPreviews(): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	presentNavigationAlertAnimated(navigationAlert: CPNavigationAlert, animated: boolean): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	showPanningInterfaceAnimated(animated: boolean): void;

	showRouteChoicesPreviewForTripTextConfiguration(tripPreview: CPTrip, textConfiguration: CPTripPreviewTextConfiguration): void;

	/**
	 * @since 14.0
	 */
	showTripPreviewsSelectedTripTextConfiguration(tripPreviews: NSArray<CPTrip> | CPTrip[], selectedTrip: CPTrip, textConfiguration: CPTripPreviewTextConfiguration): void;

	showTripPreviewsTextConfiguration(tripPreviews: NSArray<CPTrip> | CPTrip[], textConfiguration: CPTripPreviewTextConfiguration): void;

	startNavigationSessionForTrip(trip: CPTrip): CPNavigationSession;

	updateTravelEstimatesForTrip(estimates: CPTravelEstimates, trip: CPTrip): void;

	updateTravelEstimatesForTripWithTimeRemainingColor(estimates: CPTravelEstimates, trip: CPTrip, timeRemainingColor: CPTimeRemainingColor): void;
}

/**
 * @since 12.0
 */
interface CPMapTemplateDelegate extends NSObjectProtocol {

	mapTemplateDidBeginPanGesture?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidCancelNavigation?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidDismissNavigationAlertDismissalContext?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert, dismissalContext: CPNavigationAlertDismissalContext): void;

	mapTemplateDidDismissPanningInterface?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidEndPanGestureWithVelocity?(mapTemplate: CPMapTemplate, velocity: CGPoint): void;

	mapTemplateDidShowNavigationAlert?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert): void;

	mapTemplateDidShowPanningInterface?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidUpdatePanGestureWithTranslationVelocity?(mapTemplate: CPMapTemplate, translation: CGPoint, velocity: CGPoint): void;

	mapTemplateDisplayStyleForManeuver?(mapTemplate: CPMapTemplate, maneuver: CPManeuver): CPManeuverDisplayStyle;

	mapTemplatePanBeganWithDirection?(mapTemplate: CPMapTemplate, direction: CPPanDirection): void;

	mapTemplatePanEndedWithDirection?(mapTemplate: CPMapTemplate, direction: CPPanDirection): void;

	mapTemplatePanWithDirection?(mapTemplate: CPMapTemplate, direction: CPPanDirection): void;

	mapTemplateSelectedPreviewForTripUsingRouteChoice?(mapTemplate: CPMapTemplate, trip: CPTrip, routeChoice: CPRouteChoice): void;

	mapTemplateShouldProvideNavigationMetadata?(mapTemplate: CPMapTemplate): boolean;

	mapTemplateShouldShowNotificationForManeuver?(mapTemplate: CPMapTemplate, maneuver: CPManeuver): boolean;

	mapTemplateShouldShowNotificationForNavigationAlert?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert): boolean;

	mapTemplateShouldUpdateNotificationForManeuverWithTravelEstimates?(mapTemplate: CPMapTemplate, maneuver: CPManeuver, travelEstimates: CPTravelEstimates): boolean;

	mapTemplateStartedTripUsingRouteChoice?(mapTemplate: CPMapTemplate, trip: CPTrip, routeChoice: CPRouteChoice): void;

	mapTemplateWillDismissNavigationAlertDismissalContext?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert, dismissalContext: CPNavigationAlertDismissalContext): void;

	mapTemplateWillDismissPanningInterface?(mapTemplate: CPMapTemplate): void;

	mapTemplateWillShowNavigationAlert?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert): void;
}
declare var CPMapTemplateDelegate: {

	prototype: CPMapTemplateDelegate;
};

declare var CPMaximumListSectionImageSize: CGSize;

declare var CPMaximumMessageItemImageSize: CGSize;

declare var CPMaximumNumberOfGridImages: number;

/**
 * @since 14.0
 */
declare class CPMessageComposeBarButton extends CPBarButton {

	static alloc(): CPMessageComposeBarButton; // inherited from NSObject

	static new(): CPMessageComposeBarButton; // inherited from NSObject

	constructor(o: { image: UIImage; });

	initWithImage(image: UIImage): this;
}

declare const enum CPMessageLeadingItem {

	None = 0,

	Pin = 1,

	Star = 2
}

/**
 * @since 14.0
 */
declare class CPMessageListItem extends NSObject implements CPListTemplateItem {

	static alloc(): CPMessageListItem; // inherited from NSObject

	static new(): CPMessageListItem; // inherited from NSObject

	conversationIdentifier: string;

	detailText: string;

	leadingConfiguration: CPMessageListItemLeadingConfiguration;

	phoneOrEmailAddress: string;

	text: string;

	trailingConfiguration: CPMessageListItemTrailingConfiguration;

	trailingText: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	enabled: boolean; // inherited from CPListTemplateItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userInfo: any; // inherited from CPListTemplateItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { conversationIdentifier: string; text: string; leadingConfiguration: CPMessageListItemLeadingConfiguration; trailingConfiguration: CPMessageListItemTrailingConfiguration; detailText: string; trailingText: string; });

	constructor(o: { fullName: string; phoneOrEmailAddress: string; leadingConfiguration: CPMessageListItemLeadingConfiguration; trailingConfiguration: CPMessageListItemTrailingConfiguration; detailText: string; trailingText: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithConversationIdentifierTextLeadingConfigurationTrailingConfigurationDetailTextTrailingText(conversationIdentifier: string, text: string, leadingConfiguration: CPMessageListItemLeadingConfiguration, trailingConfiguration: CPMessageListItemTrailingConfiguration, detailText: string, trailingText: string): this;

	initWithFullNamePhoneOrEmailAddressLeadingConfigurationTrailingConfigurationDetailTextTrailingText(fullName: string, phoneOrEmailAddress: string, leadingConfiguration: CPMessageListItemLeadingConfiguration, trailingConfiguration: CPMessageListItemTrailingConfiguration, detailText: string, trailingText: string): this;

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
 * @since 14.0
 */
declare class CPMessageListItemLeadingConfiguration extends NSObject {

	static alloc(): CPMessageListItemLeadingConfiguration; // inherited from NSObject

	static new(): CPMessageListItemLeadingConfiguration; // inherited from NSObject

	readonly leadingImage: UIImage;

	readonly leadingItem: CPMessageLeadingItem;

	readonly unread: boolean;

	constructor(o: { leadingItem: CPMessageLeadingItem; leadingImage: UIImage; unread: boolean; });

	initWithLeadingItemLeadingImageUnread(leadingItem: CPMessageLeadingItem, leadingImage: UIImage, unread: boolean): this;
}

/**
 * @since 14.0
 */
declare class CPMessageListItemTrailingConfiguration extends NSObject {

	static alloc(): CPMessageListItemTrailingConfiguration; // inherited from NSObject

	static new(): CPMessageListItemTrailingConfiguration; // inherited from NSObject

	readonly trailingImage: UIImage;

	readonly trailingItem: CPMessageTrailingItem;

	constructor(o: { trailingItem: CPMessageTrailingItem; trailingImage: UIImage; });

	initWithTrailingItemTrailingImage(trailingItem: CPMessageTrailingItem, trailingImage: UIImage): this;
}

declare const enum CPMessageTrailingItem {

	None = 0,

	Mute = 1
}

/**
 * @since 12.0
 */
declare class CPNavigationAlert extends NSObject implements NSSecureCoding {

	static alloc(): CPNavigationAlert; // inherited from NSObject

	static new(): CPNavigationAlert; // inherited from NSObject

	readonly duration: number;

	readonly image: UIImage;

	readonly imageSet: CPImageSet;

	readonly primaryAction: CPAlertAction;

	readonly secondaryAction: CPAlertAction;

	readonly subtitleVariants: NSArray<string>;

	readonly titleVariants: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { titleVariants: NSArray<string> | string[]; subtitleVariants: NSArray<string> | string[]; image: UIImage; primaryAction: CPAlertAction; secondaryAction: CPAlertAction; duration: number; });

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	constructor(o: { titleVariants: NSArray<string> | string[]; subtitleVariants: NSArray<string> | string[]; imageSet: CPImageSet; primaryAction: CPAlertAction; secondaryAction: CPAlertAction; duration: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleVariantsSubtitleVariantsImagePrimaryActionSecondaryActionDuration(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[], image: UIImage, primaryAction: CPAlertAction, secondaryAction: CPAlertAction, duration: number): this;

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	initWithTitleVariantsSubtitleVariantsImageSetPrimaryActionSecondaryActionDuration(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[], imageSet: CPImageSet, primaryAction: CPAlertAction, secondaryAction: CPAlertAction, duration: number): this;

	updateTitleVariantsSubtitleVariants(newTitleVariants: NSArray<string> | string[], newSubtitleVariants: NSArray<string> | string[]): void;
}

/**
 * @since 12.0
 */
declare const enum CPNavigationAlertDismissalContext {

	Timeout = 0,

	UserDismissed = 1,

	SystemDismissed = 2
}

declare var CPNavigationAlertMinimumDuration: number;

/**
 * @since 12.0
 */
declare class CPNavigationSession extends NSObject {

	static alloc(): CPNavigationSession; // inherited from NSObject

	static new(): CPNavigationSession; // inherited from NSObject

	currentLaneGuidance: CPLaneGuidance;

	currentRoadNameVariants: NSArray<string>;

	maneuverState: CPManeuverState;

	readonly trip: CPTrip;

	upcomingManeuvers: NSArray<CPManeuver>;

	addLaneGuidances(laneGuidances: NSArray<CPLaneGuidance> | CPLaneGuidance[]): void;

	addManeuvers(maneuvers: NSArray<CPManeuver> | CPManeuver[]): void;

	cancelTrip(): void;

	finishTrip(): void;

	pauseTripForReasonDescription(reason: CPTripPauseReason, description: string): void;

	/**
	 * @since 15.4
	 */
	pauseTripForReasonDescriptionTurnCardColor(reason: CPTripPauseReason, description: string, turnCardColor: UIColor): void;

	/**
	 * @since 17.4
	 */
	resumeTripWithUpdatedRouteInformation(routeInformation: CPRouteInformation): void;

	updateTravelEstimatesForManeuver(estimates: CPTravelEstimates, maneuver: CPManeuver): void;
}

/**
 * @since 14.0
 */
declare class CPNowPlayingAddToLibraryButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingAddToLibraryButton; // inherited from NSObject

	static new(): CPNowPlayingAddToLibraryButton; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class CPNowPlayingButton extends NSObject implements NSSecureCoding {

	static alloc(): CPNowPlayingButton; // inherited from NSObject

	static new(): CPNowPlayingButton; // inherited from NSObject

	enabled: boolean;

	selected: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { handler: (p1: CPNowPlayingButton) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHandler(handler: (p1: CPNowPlayingButton) => void): this;
}

declare var CPNowPlayingButtonMaximumImageSize: CGSize;

/**
 * @since 14.0
 */
declare class CPNowPlayingImageButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingImageButton; // inherited from NSObject

	static new(): CPNowPlayingImageButton; // inherited from NSObject

	readonly image: UIImage;

	constructor(o: { image: UIImage; handler: (p1: CPNowPlayingButton) => void; });

	initWithImageHandler(image: UIImage, handler: (p1: CPNowPlayingButton) => void): this;
}

/**
 * @since 14.0
 */
declare class CPNowPlayingMoreButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingMoreButton; // inherited from NSObject

	static new(): CPNowPlayingMoreButton; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class CPNowPlayingPlaybackRateButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingPlaybackRateButton; // inherited from NSObject

	static new(): CPNowPlayingPlaybackRateButton; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class CPNowPlayingRepeatButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingRepeatButton; // inherited from NSObject

	static new(): CPNowPlayingRepeatButton; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class CPNowPlayingShuffleButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingShuffleButton; // inherited from NSObject

	static new(): CPNowPlayingShuffleButton; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class CPNowPlayingTemplate extends CPTemplate {

	static alloc(): CPNowPlayingTemplate; // inherited from NSObject

	static new(): CPNowPlayingTemplate; // inherited from NSObject

	albumArtistButtonEnabled: boolean;

	readonly nowPlayingButtons: NSArray<CPNowPlayingButton>;

	upNextButtonEnabled: boolean;

	upNextTitle: string;

	static readonly sharedTemplate: CPNowPlayingTemplate;

	addObserver(observer: CPNowPlayingTemplateObserver): void;

	removeObserver(observer: CPNowPlayingTemplateObserver): void;

	updateNowPlayingButtons(nowPlayingButtons: NSArray<CPNowPlayingButton> | CPNowPlayingButton[]): void;
}

/**
 * @since 14.0
 */
interface CPNowPlayingTemplateObserver extends NSObjectProtocol {

	nowPlayingTemplateAlbumArtistButtonTapped?(nowPlayingTemplate: CPNowPlayingTemplate): void;

	nowPlayingTemplateUpNextButtonTapped?(nowPlayingTemplate: CPNowPlayingTemplate): void;
}
declare var CPNowPlayingTemplateObserver: {

	prototype: CPNowPlayingTemplateObserver;
};

/**
 * @since 12.0
 */
declare const enum CPPanDirection {

	None = 0,

	Left = 1,

	Right = 2,

	Up = 4,

	Down = 8
}

/**
 * @since 14.0
 */
declare class CPPointOfInterest extends NSObject implements NSSecureCoding {

	static alloc(): CPPointOfInterest; // inherited from NSObject

	static new(): CPPointOfInterest; // inherited from NSObject

	detailSubtitle: string;

	detailSummary: string;

	detailTitle: string;

	location: MKMapItem;

	pinImage: UIImage;

	primaryButton: CPTextButton;

	secondaryButton: CPTextButton;

	/**
	 * @since 16.0
	 */
	selectedPinImage: UIImage;

	subtitle: string;

	summary: string;

	title: string;

	userInfo: any;

	/**
	 * @since 16.0
	 */
	static readonly pinImageSize: CGSize;

	/**
	 * @since 16.0
	 */
	static readonly selectedPinImageSize: CGSize;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { location: MKMapItem; title: string; subtitle: string; summary: string; detailTitle: string; detailSubtitle: string; detailSummary: string; pinImage: UIImage; });

	/**
	 * @since 16.0
	 */
	constructor(o: { location: MKMapItem; title: string; subtitle: string; summary: string; detailTitle: string; detailSubtitle: string; detailSummary: string; pinImage: UIImage; selectedPinImage: UIImage; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocationTitleSubtitleSummaryDetailTitleDetailSubtitleDetailSummaryPinImage(location: MKMapItem, title: string, subtitle: string, summary: string, detailTitle: string, detailSubtitle: string, detailSummary: string, pinImage: UIImage): this;

	/**
	 * @since 16.0
	 */
	initWithLocationTitleSubtitleSummaryDetailTitleDetailSubtitleDetailSummaryPinImageSelectedPinImage(location: MKMapItem, title: string, subtitle: string, summary: string, detailTitle: string, detailSubtitle: string, detailSummary: string, pinImage: UIImage, selectedPinImage: UIImage): this;
}

/**
 * @since 14.0
 */
declare class CPPointOfInterestTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPPointOfInterestTemplate; // inherited from NSObject

	static new(): CPPointOfInterestTemplate; // inherited from NSObject

	pointOfInterestDelegate: CPPointOfInterestTemplateDelegate;

	readonly pointsOfInterest: NSArray<CPPointOfInterest>;

	selectedIndex: number;

	title: string;

	backButton: CPBarButton; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	constructor(o: { title: string; pointsOfInterest: NSArray<CPPointOfInterest> | CPPointOfInterest[]; selectedIndex: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTitlePointsOfInterestSelectedIndex(title: string, pointsOfInterest: NSArray<CPPointOfInterest> | CPPointOfInterest[], selectedIndex: number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setPointsOfInterestSelectedIndex(pointsOfInterest: NSArray<CPPointOfInterest> | CPPointOfInterest[], selectedIndex: number): void;
}

/**
 * @since 14.0
 */
interface CPPointOfInterestTemplateDelegate extends NSObjectProtocol {

	pointOfInterestTemplateDidChangeMapRegion(pointOfInterestTemplate: CPPointOfInterestTemplate, region: MKCoordinateRegion): void;

	pointOfInterestTemplateDidSelectPointOfInterest?(pointOfInterestTemplate: CPPointOfInterestTemplate, pointOfInterest: CPPointOfInterest): void;
}
declare var CPPointOfInterestTemplateDelegate: {

	prototype: CPPointOfInterestTemplateDelegate;
};

/**
 * @since 12.0
 */
declare class CPRouteChoice extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPRouteChoice; // inherited from NSObject

	static new(): CPRouteChoice; // inherited from NSObject

	readonly additionalInformationVariants: NSArray<string>;

	readonly selectionSummaryVariants: NSArray<string>;

	readonly summaryVariants: NSArray<string>;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { summaryVariants: NSArray<string> | string[]; additionalInformationVariants: NSArray<string> | string[]; selectionSummaryVariants: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSummaryVariantsAdditionalInformationVariantsSelectionSummaryVariants(summaryVariants: NSArray<string> | string[], additionalInformationVariants: NSArray<string> | string[], selectionSummaryVariants: NSArray<string> | string[]): this;
}

/**
 * @since 17.4
 */
declare class CPRouteInformation extends NSObject {

	static alloc(): CPRouteInformation; // inherited from NSObject

	static new(): CPRouteInformation; // inherited from NSObject

	/**
	 * @since 17.4
	 */
	readonly currentLaneGuidance: CPLaneGuidance;

	/**
	 * @since 17.4
	 */
	readonly currentManeuvers: NSArray<CPManeuver>;

	/**
	 * @since 17.4
	 */
	readonly laneGuidances: NSArray<CPLaneGuidance>;

	/**
	 * @since 17.4
	 */
	readonly maneuverTravelEstimates: CPTravelEstimates;

	/**
	 * @since 17.4
	 */
	readonly maneuvers: NSArray<CPManeuver>;

	/**
	 * @since 17.4
	 */
	readonly tripTravelEstimates: CPTravelEstimates;

	constructor(o: { maneuvers: NSArray<CPManeuver> | CPManeuver[]; laneGuidances: NSArray<CPLaneGuidance> | CPLaneGuidance[]; currentManeuvers: NSArray<CPManeuver> | CPManeuver[]; currentLaneGuidance: CPLaneGuidance; tripTravelEstimates: CPTravelEstimates; maneuverTravelEstimates: CPTravelEstimates; });

	initWithManeuversLaneGuidancesCurrentManeuversCurrentLaneGuidanceTripTravelEstimatesManeuverTravelEstimates(maneuvers: NSArray<CPManeuver> | CPManeuver[], laneGuidances: NSArray<CPLaneGuidance> | CPLaneGuidance[], currentManeuvers: NSArray<CPManeuver> | CPManeuver[], currentLaneGuidance: CPLaneGuidance, tripTravelEstimates: CPTravelEstimates, maneuverTravelEstimates: CPTravelEstimates): this;
}

/**
 * @since 12.0
 */
declare class CPSearchTemplate extends CPTemplate {

	static alloc(): CPSearchTemplate; // inherited from NSObject

	static new(): CPSearchTemplate; // inherited from NSObject

	delegate: CPSearchTemplateDelegate;
}

/**
 * @since 12.0
 */
interface CPSearchTemplateDelegate extends NSObjectProtocol {

	searchTemplateSearchButtonPressed?(searchTemplate: CPSearchTemplate): void;

	searchTemplateSelectedResultCompletionHandler(searchTemplate: CPSearchTemplate, item: CPListItem, completionHandler: () => void): void;

	searchTemplateUpdatedSearchTextCompletionHandler(searchTemplate: CPSearchTemplate, searchText: string, completionHandler: (p1: NSArray<CPListItem>) => void): void;
}
declare var CPSearchTemplateDelegate: {

	prototype: CPSearchTemplateDelegate;
};

/**
 * @since 14.0
 */
interface CPSelectableListItem extends CPListTemplateItem {

	handler: (p1: CPSelectableListItem, p2: () => void) => void;
}
declare var CPSelectableListItem: {

	prototype: CPSelectableListItem;
};

/**
 * @since 12.0
 */
declare class CPSessionConfiguration extends NSObject {

	static alloc(): CPSessionConfiguration; // inherited from NSObject

	static new(): CPSessionConfiguration; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly contentStyle: CPContentStyle;

	delegate: CPSessionConfigurationDelegate;

	readonly limitedUserInterfaces: CPLimitableUserInterface;

	constructor(o: { delegate: CPSessionConfigurationDelegate; });

	initWithDelegate(delegate: CPSessionConfigurationDelegate): this;
}

/**
 * @since 12.0
 */
interface CPSessionConfigurationDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	sessionConfigurationContentStyleChanged?(sessionConfiguration: CPSessionConfiguration, contentStyle: CPContentStyle): void;

	sessionConfigurationLimitedUserInterfacesChanged?(sessionConfiguration: CPSessionConfiguration, limitedUserInterfaces: CPLimitableUserInterface): void;
}
declare var CPSessionConfigurationDelegate: {

	prototype: CPSessionConfigurationDelegate;
};

/**
 * @since 14.0
 */
declare class CPTabBarTemplate extends CPTemplate {

	static alloc(): CPTabBarTemplate; // inherited from NSObject

	static new(): CPTabBarTemplate; // inherited from NSObject

	delegate: CPTabBarTemplateDelegate;

	readonly selectedTemplate: CPTemplate;

	readonly templates: NSArray<CPTemplate>;

	static readonly maximumTabCount: number;

	constructor(o: { templates: NSArray<CPTemplate> | CPTemplate[]; });

	initWithTemplates(templates: NSArray<CPTemplate> | CPTemplate[]): this;

	/**
	 * @since 17.0
	 */
	selectTemplate(newTemplate: CPTemplate): void;

	/**
	 * @since 17.0
	 */
	selectTemplateAtIndex(index: number): void;

	updateTemplates(newTemplates: NSArray<CPTemplate> | CPTemplate[]): void;
}

/**
 * @since 14.0
 */
interface CPTabBarTemplateDelegate extends NSObjectProtocol {

	tabBarTemplateDidSelectTemplate(tabBarTemplate: CPTabBarTemplate, selectedTemplate: CPTemplate): void;
}
declare var CPTabBarTemplateDelegate: {

	prototype: CPTabBarTemplateDelegate;
};

/**
 * @since 12.0
 */
declare class CPTemplate extends NSObject implements NSSecureCoding {

	static alloc(): CPTemplate; // inherited from NSObject

	static new(): CPTemplate; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	showsTabBadge: boolean;

	/**
	 * @since 14.0
	 */
	tabImage: UIImage;

	/**
	 * @since 14.0
	 */
	tabSystemItem: UITabBarSystemItem;

	/**
	 * @since 14.0
	 */
	tabTitle: string;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.4
 */
declare class CPTemplateApplicationDashboardScene extends UIScene {

	static alloc(): CPTemplateApplicationDashboardScene; // inherited from NSObject

	static new(): CPTemplateApplicationDashboardScene; // inherited from NSObject

	readonly dashboardController: CPDashboardController;

	readonly dashboardWindow: UIWindow;

	delegate: CPTemplateApplicationDashboardSceneDelegate;
}

/**
 * @since 13.4
 */
interface CPTemplateApplicationDashboardSceneDelegate extends UISceneDelegate {

	templateApplicationDashboardSceneDidConnectDashboardControllerToWindow?(templateApplicationDashboardScene: CPTemplateApplicationDashboardScene, dashboardController: CPDashboardController, window: UIWindow): void;

	templateApplicationDashboardSceneDidDisconnectDashboardControllerFromWindow?(templateApplicationDashboardScene: CPTemplateApplicationDashboardScene, dashboardController: CPDashboardController, window: UIWindow): void;
}
declare var CPTemplateApplicationDashboardSceneDelegate: {

	prototype: CPTemplateApplicationDashboardSceneDelegate;
};

/**
 * @since 13.4
 */
declare var CPTemplateApplicationDashboardSceneSessionRoleApplication: string;

/**
 * @since 15.4
 */
declare class CPTemplateApplicationInstrumentClusterScene extends UIScene {

	static alloc(): CPTemplateApplicationInstrumentClusterScene; // inherited from NSObject

	static new(): CPTemplateApplicationInstrumentClusterScene; // inherited from NSObject

	readonly contentStyle: UIUserInterfaceStyle;

	delegate: CPTemplateApplicationInstrumentClusterSceneDelegate;

	readonly instrumentClusterController: CPInstrumentClusterController;
}

/**
 * @since 15.4
 */
interface CPTemplateApplicationInstrumentClusterSceneDelegate extends UISceneDelegate {

	contentStyleDidChange?(contentStyle: UIUserInterfaceStyle): void;

	templateApplicationInstrumentClusterSceneDidConnectInstrumentClusterController?(templateApplicationInstrumentClusterScene: CPTemplateApplicationInstrumentClusterScene, instrumentClusterController: CPInstrumentClusterController): void;

	templateApplicationInstrumentClusterSceneDidDisconnectInstrumentClusterController?(templateApplicationInstrumentClusterScene: CPTemplateApplicationInstrumentClusterScene, instrumentClusterController: CPInstrumentClusterController): void;
}
declare var CPTemplateApplicationInstrumentClusterSceneDelegate: {

	prototype: CPTemplateApplicationInstrumentClusterSceneDelegate;
};

/**
 * @since 15.4
 */
declare var CPTemplateApplicationInstrumentClusterSceneSessionRoleApplication: string;

/**
 * @since 13.0
 */
declare class CPTemplateApplicationScene extends UIScene {

	static alloc(): CPTemplateApplicationScene; // inherited from NSObject

	static new(): CPTemplateApplicationScene; // inherited from NSObject

	readonly carWindow: CPWindow;

	/**
	 * @since 15.4
	 */
	readonly contentStyle: UIUserInterfaceStyle;

	delegate: CPTemplateApplicationSceneDelegate;

	readonly interfaceController: CPInterfaceController;
}

/**
 * @since 13.0
 */
interface CPTemplateApplicationSceneDelegate extends UISceneDelegate {

	/**
	 * @since 15.4
	 */
	contentStyleDidChange?(contentStyle: UIUserInterfaceStyle): void;

	/**
	 * @since 14.0
	 */
	templateApplicationSceneDidConnectInterfaceController?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController): void;

	templateApplicationSceneDidConnectInterfaceControllerToWindow?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController, window: CPWindow): void;

	/**
	 * @since 14.0
	 */
	templateApplicationSceneDidDisconnectInterfaceController?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController): void;

	templateApplicationSceneDidDisconnectInterfaceControllerFromWindow?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController, window: CPWindow): void;

	templateApplicationSceneDidSelectManeuver?(templateApplicationScene: CPTemplateApplicationScene, maneuver: CPManeuver): void;

	templateApplicationSceneDidSelectNavigationAlert?(templateApplicationScene: CPTemplateApplicationScene, navigationAlert: CPNavigationAlert): void;
}
declare var CPTemplateApplicationSceneDelegate: {

	prototype: CPTemplateApplicationSceneDelegate;
};

/**
 * @since 13.0
 */
declare var CPTemplateApplicationSceneSessionRoleApplication: string;

/**
 * @since 14.0
 */
declare class CPTextButton extends NSObject {

	static alloc(): CPTextButton; // inherited from NSObject

	static new(): CPTextButton; // inherited from NSObject

	textStyle: CPTextButtonStyle;

	title: string;

	constructor(o: { title: string; textStyle: CPTextButtonStyle; handler: (p1: CPTextButton) => void; });

	initWithTitleTextStyleHandler(title: string, textStyle: CPTextButtonStyle, handler: (p1: CPTextButton) => void): this;
}

/**
 * @since 14.0
 */
declare const enum CPTextButtonStyle {

	Normal = 0,

	Cancel = 1,

	Confirm = 2
}

/**
 * @since 12.0
 */
declare const enum CPTimeRemainingColor {

	Default = 0,

	Green = 1,

	Orange = 2,

	Red = 3
}

/**
 * @since 17.4
 */
declare const enum CPTrafficSide {

	Right = 0,

	Left = 1
}

/**
 * @since 12.0
 */
declare class CPTravelEstimates extends NSObject implements NSSecureCoding {

	static alloc(): CPTravelEstimates; // inherited from NSObject

	static new(): CPTravelEstimates; // inherited from NSObject

	readonly distanceRemaining: NSMeasurement<NSUnitLength>;

	readonly distanceRemainingToDisplay: NSMeasurement<NSUnitLength>;

	readonly timeRemaining: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { distanceRemaining: NSMeasurement<NSUnitLength>; distanceRemainingToDisplay: NSMeasurement<NSUnitLength>; timeRemaining: number; });

	constructor(o: { distanceRemaining: NSMeasurement<NSUnitLength>; timeRemaining: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDistanceRemainingDistanceRemainingToDisplayTimeRemaining(distanceRemaining: NSMeasurement<NSUnitLength>, distanceRemainingToDisplay: NSMeasurement<NSUnitLength>, time: number): this;

	initWithDistanceRemainingTimeRemaining(distance: NSMeasurement<NSUnitLength>, time: number): this;
}

/**
 * @since 12.0
 */
declare class CPTrip extends NSObject implements NSSecureCoding {

	static alloc(): CPTrip; // inherited from NSObject

	static new(): CPTrip; // inherited from NSObject

	readonly destination: MKMapItem;

	destinationNameVariants: NSArray<string>;

	readonly origin: MKMapItem;

	readonly routeChoices: NSArray<CPRouteChoice>;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { origin: MKMapItem; destination: MKMapItem; routeChoices: NSArray<CPRouteChoice> | CPRouteChoice[]; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithOriginDestinationRouteChoices(origin: MKMapItem, destination: MKMapItem, routeChoices: NSArray<CPRouteChoice> | CPRouteChoice[]): this;
}

/**
 * @since 12.0
 */
declare const enum CPTripEstimateStyle {

	Light = 0,

	Dark = 1
}

/**
 * @since 12.0
 */
declare const enum CPTripPauseReason {

	Arrived = 1,

	Loading = 2,

	Locating = 3,

	Rerouting = 4,

	ProceedToRoute = 5
}

/**
 * @since 12.0
 */
declare class CPTripPreviewTextConfiguration extends NSObject implements NSSecureCoding {

	static alloc(): CPTripPreviewTextConfiguration; // inherited from NSObject

	static new(): CPTripPreviewTextConfiguration; // inherited from NSObject

	readonly additionalRoutesButtonTitle: string;

	readonly overviewButtonTitle: string;

	readonly startButtonTitle: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { startButtonTitle: string; additionalRoutesButtonTitle: string; overviewButtonTitle: string; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStartButtonTitleAdditionalRoutesButtonTitleOverviewButtonTitle(startButtonTitle: string, additionalRoutesButtonTitle: string, overviewButtonTitle: string): this;
}

/**
 * @since 12.0
 */
declare class CPVoiceControlState extends NSObject implements NSSecureCoding {

	static alloc(): CPVoiceControlState; // inherited from NSObject

	static new(): CPVoiceControlState; // inherited from NSObject

	readonly identifier: string;

	readonly image: UIImage;

	readonly repeats: boolean;

	readonly titleVariants: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; titleVariants: NSArray<string> | string[]; image: UIImage; repeats: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierTitleVariantsImageRepeats(identifier: string, titleVariants: NSArray<string> | string[], image: UIImage, repeats: boolean): this;
}

/**
 * @since 12.0
 */
declare class CPVoiceControlTemplate extends CPTemplate {

	static alloc(): CPVoiceControlTemplate; // inherited from NSObject

	static new(): CPVoiceControlTemplate; // inherited from NSObject

	readonly activeStateIdentifier: string;

	readonly voiceControlStates: NSArray<CPVoiceControlState>;

	constructor(o: { voiceControlStates: NSArray<CPVoiceControlState> | CPVoiceControlState[]; });

	activateVoiceControlStateWithIdentifier(identifier: string): void;

	initWithVoiceControlStates(voiceControlStates: NSArray<CPVoiceControlState> | CPVoiceControlState[]): this;
}

/**
 * @since 12.0
 */
declare class CPWindow extends UIWindow {

	static alloc(): CPWindow; // inherited from NSObject

	static appearance(): CPWindow; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): CPWindow; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): CPWindow; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CPWindow; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): CPWindow; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CPWindow; // inherited from UIAppearance

	static new(): CPWindow; // inherited from NSObject

	readonly mapButtonSafeAreaLayoutGuide: UILayoutGuide;

	templateApplicationScene: CPTemplateApplicationScene;
}

declare var CarPlayErrorDomain: string;
