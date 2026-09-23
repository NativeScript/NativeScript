
/**
 * @since 12.0
 */
declare class CPActionSheetTemplate extends CPTemplate {

	static alloc(): CPActionSheetTemplate; // inherited from NSObject

	static new(): CPActionSheetTemplate; // inherited from NSObject

	readonly actions: NSArray<CPAlertAction>;

	readonly message: string | null;

	readonly title: string | null;

	constructor(o: { title: string | null; message: string | null; actions: NSArray<CPAlertAction> | CPAlertAction[]; });

	initWithTitleMessageActions(title: string | null, message: string | null, actions: NSArray<CPAlertAction> | CPAlertAction[]): this;
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
	readonly color: UIColor | null;

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

	image: UIImage | null;

	title: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 14.0
	 */
	constructor(o: { image: UIImage; handler: (p1: CPBarButton) => void | null; });

	/**
	 * @since 14.0
	 */
	constructor(o: { title: string; handler: (p1: CPBarButton) => void | null; });

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	constructor(o: { type: CPBarButtonType; handler: (p1: CPBarButton) => void | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 14.0
	 */
	initWithImageHandler(image: UIImage, handler: (p1: CPBarButton) => void | null): this;

	/**
	 * @since 14.0
	 */
	initWithTitleHandler(title: string, handler: (p1: CPBarButton) => void | null): this;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	initWithTypeHandler(type: CPBarButtonType, handler: (p1: CPBarButton) => void | null): this;
}

/**
 * @since 12.0
 */
interface CPBarButtonProviding extends NSObjectProtocol {

	backButton: CPBarButton | null;

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

	readonly image: UIImage | null;

	title: string | null;

	constructor(o: { image: UIImage; handler: (p1: CPButton) => void | null; });

	initWithImageHandler(image: UIImage, handler: (p1: CPButton) => void | null): this;
}

declare var CPButtonMaximumImageSize: CGSize;

/**
 * @since 14.0
 */
declare class CPContact extends NSObject implements NSSecureCoding {

	static alloc(): CPContact; // inherited from NSObject

	static new(): CPContact; // inherited from NSObject

	actions: NSArray<CPButton> | null;

	image: UIImage;

	informativeText: string | null;

	name: string;

	subtitle: string | null;

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

	constructor(o: { handler: (p1: CPButton) => void | null; });

	initWithHandler(handler: (p1: CPButton) => void | null): this;
}

/**
 * @since 14.0
 */
declare class CPContactDirectionsButton extends CPButton {

	static alloc(): CPContactDirectionsButton; // inherited from NSObject

	static new(): CPContactDirectionsButton; // inherited from NSObject

	constructor(o: { handler: (p1: CPButton) => void | null; });

	initWithHandler(handler: (p1: CPButton) => void | null): this;
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

	backButton: CPBarButton | null; // inherited from CPBarButtonProviding

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

	constructor(o: { titleVariants: NSArray<string> | string[]; subtitleVariants: NSArray<string> | string[]; image: UIImage; handler: (p1: CPDashboardButton) => void | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleVariantsSubtitleVariantsImageHandler(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[], image: UIImage, handler: (p1: CPDashboardButton) => void | null): this;
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

	/**
	 * @since 26.0
	 */
	readonly messageConfiguration: CPMessageGridItemConfiguration | null;

	readonly titleVariants: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { titleVariants: NSArray<string> | string[]; image: UIImage; handler: (p1: CPGridButton) => void | null; });

	/**
	 * @since 26.0
	 */
	constructor(o: { titleVariants: NSArray<string> | string[]; image: UIImage; messageConfiguration: CPMessageGridItemConfiguration | null; handler: (p1: CPGridButton) => void | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleVariantsImageHandler(titleVariants: NSArray<string> | string[], image: UIImage, handler: (p1: CPGridButton) => void | null): this;

	/**
	 * @since 26.0
	 */
	initWithTitleVariantsImageMessageConfigurationHandler(titleVariants: NSArray<string> | string[], image: UIImage, messageConfiguration: CPMessageGridItemConfiguration | null, handler: (p1: CPGridButton) => void | null): this;

	/**
	 * @since 26.0
	 */
	updateImage(image: UIImage): void;

	/**
	 * @since 26.0
	 */
	updateTitleVariants(titleVariants: NSArray<string> | string[]): void;
}

/**
 * @since 12.0
 */
declare class CPGridTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPGridTemplate; // inherited from NSObject

	static new(): CPGridTemplate; // inherited from NSObject

	readonly gridButtons: NSArray<CPGridButton>;

	readonly title: string;

	/**
	 * @since 26.0
	 */
	static readonly maximumGridButtonImageSize: CGSize;

	backButton: CPBarButton | null; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	constructor(o: { title: string | null; gridButtons: NSArray<CPGridButton> | CPGridButton[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTitleGridButtons(title: string | null, gridButtons: NSArray<CPGridButton> | CPGridButton[]): this;

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
 * @since 26.4
 */
declare class CPImageOverlay extends NSObject implements NSSecureCoding {

	static alloc(): CPImageOverlay; // inherited from NSObject

	static new(): CPImageOverlay; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	readonly alignment: CPImageOverlayAlignment;

	/**
	 * @since 26.4
	 */
	readonly backgroundColor: UIColor | null;

	/**
	 * @since 26.4
	 */
	readonly image: UIImage | null;

	/**
	 * @since 26.4
	 */
	readonly text: string | null;

	/**
	 * @since 26.4
	 */
	readonly textColor: UIColor | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 26.4
	 */
	constructor(o: { image: UIImage; alignment: CPImageOverlayAlignment; });

	/**
	 * @since 26.4
	 */
	constructor(o: { text: string; textColor: UIColor; backgroundColor: UIColor; alignment: CPImageOverlayAlignment; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 26.4
	 */
	initWithImageAlignment(image: UIImage, alignment: CPImageOverlayAlignment): this;

	/**
	 * @since 26.4
	 */
	initWithTextTextColorBackgroundColorAlignment(text: string, textColor: UIColor, backgroundColor: UIColor, alignment: CPImageOverlayAlignment): this;
}

declare const enum CPImageOverlayAlignment {

	Leading = 0,

	Center = 1,

	Trailing = 2
}

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

	readonly detail: string | null;

	readonly title: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string | null; detail: string | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleDetail(title: string | null, detail: string | null): this;
}

/**
 * @since 14.0
 */
declare class CPInformationRatingItem extends CPInformationItem {

	static alloc(): CPInformationRatingItem; // inherited from NSObject

	static new(): CPInformationRatingItem; // inherited from NSObject

	readonly maximumRating: number | null;

	readonly rating: number | null;

	constructor(o: { rating: number | null; maximumRating: number | null; title: string | null; detail: string | null; });

	initWithRatingMaximumRatingTitleDetail(rating: number | null, maximumRating: number | null, title: string | null, detail: string | null): this;
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

	backButton: CPBarButton | null; // inherited from CPBarButtonProviding

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

	delegate: CPInstrumentClusterControllerDelegate | null;

	inactiveDescriptionVariants: NSArray<string>;

	readonly instrumentClusterWindow: UIWindow | null;

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

	delegate: CPInterfaceControllerDelegate | null;

	/**
	 * @since 13.0
	 */
	prefersDarkUserInterfaceStyle: boolean;

	readonly presentedTemplate: CPTemplate | null;

	readonly rootTemplate: CPTemplate;

	readonly templates: NSArray<CPTemplate>;

	readonly topTemplate: CPTemplate | null;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	dismissTemplateAnimated(animated: boolean): void;

	/**
	 * @since 14.0
	 */
	dismissTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	popTemplateAnimated(animated: boolean): void;

	/**
	 * @since 14.0
	 */
	popTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	popToRootTemplateAnimated(animated: boolean): void;

	/**
	 * @since 14.0
	 */
	popToRootTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	popToTemplateAnimated(targetTemplate: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	popToTemplateAnimatedCompletion(targetTemplate: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	presentTemplateAnimated(templateToPresent: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	presentTemplateAnimatedCompletion(templateToPresent: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	pushTemplateAnimated(templateToPush: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	pushTemplateAnimatedCompletion(templateToPush: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	setRootTemplateAnimated(rootTemplate: CPTemplate, animated: boolean): void;

	/**
	 * @since 14.0
	 */
	setRootTemplateAnimatedCompletion(rootTemplate: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError | null) => void | null): void;
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
	readonly highlightedAngle: NSMeasurement<NSUnitAngle> | null;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

	/**
	 * @since 26.0
	 */
	readonly allowsMultipleLines: boolean;

	/**
	 * @since 26.0
	 */
	elements: NSArray<CPListImageRowItemElement>;

	/**
	 * @since 14.0
	 * @deprecated 26.0
	 */
	readonly gridImages: NSArray<UIImage>;

	/**
	 * @since 17.4
	 * @deprecated 26.0
	 */
	readonly imageTitles: NSArray<string>;

	listImageRowHandler: (p1: CPListImageRowItem, p2: number, p3: () => void) => void | null;

	text: string | null;

	/**
	 * @since 14.0
	 * @deprecated 26.0
	 */
	static readonly maximumImageSize: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	enabled: boolean; // inherited from CPListTemplateItem

	handler: (p1: CPSelectableListItem, p2: () => void) => void | null; // inherited from CPSelectableListItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userInfo: any | null; // inherited from CPListTemplateItem

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 26.0
	 */
	constructor(o: { text: string | null; cardElements: NSArray<CPListImageRowItemCardElement> | CPListImageRowItemCardElement[]; allowsMultipleLines: boolean; });

	/**
	 * @since 26.0
	 */
	constructor(o: { text: string | null; condensedElements: NSArray<CPListImageRowItemCondensedElement> | CPListImageRowItemCondensedElement[]; allowsMultipleLines: boolean; });

	/**
	 * @since 26.0
	 */
	constructor(o: { text: string | null; elements: NSArray<CPListImageRowItemRowElement> | CPListImageRowItemRowElement[]; allowsMultipleLines: boolean; });

	/**
	 * @since 26.0
	 */
	constructor(o: { text: string | null; gridElements: NSArray<CPListImageRowItemGridElement> | CPListImageRowItemGridElement[]; allowsMultipleLines: boolean; });

	/**
	 * @since 26.0
	 */
	constructor(o: { text: string | null; imageGridElements: NSArray<CPListImageRowItemImageGridElement> | CPListImageRowItemImageGridElement[]; allowsMultipleLines: boolean; });

	/**
	 * @since 14.0
	 * @deprecated 26.0
	 */
	constructor(o: { text: string; images: NSArray<UIImage> | UIImage[]; });

	/**
	 * @since 17.4
	 * @deprecated 26.0
	 */
	constructor(o: { text: string; images: NSArray<UIImage> | UIImage[]; imageTitles: NSArray<string> | string[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 26.0
	 */
	initWithTextCardElementsAllowsMultipleLines(text: string | null, elements: NSArray<CPListImageRowItemCardElement> | CPListImageRowItemCardElement[], allowsMultipleLines: boolean): this;

	/**
	 * @since 26.0
	 */
	initWithTextCondensedElementsAllowsMultipleLines(text: string | null, elements: NSArray<CPListImageRowItemCondensedElement> | CPListImageRowItemCondensedElement[], allowsMultipleLines: boolean): this;

	/**
	 * @since 26.0
	 */
	initWithTextElementsAllowsMultipleLines(text: string | null, elements: NSArray<CPListImageRowItemRowElement> | CPListImageRowItemRowElement[], allowsMultipleLines: boolean): this;

	/**
	 * @since 26.0
	 */
	initWithTextGridElementsAllowsMultipleLines(text: string | null, elements: NSArray<CPListImageRowItemGridElement> | CPListImageRowItemGridElement[], allowsMultipleLines: boolean): this;

	/**
	 * @since 26.0
	 */
	initWithTextImageGridElementsAllowsMultipleLines(text: string | null, elements: NSArray<CPListImageRowItemImageGridElement> | CPListImageRowItemImageGridElement[], allowsMultipleLines: boolean): this;

	/**
	 * @since 14.0
	 * @deprecated 26.0
	 */
	initWithTextImages(text: string, images: NSArray<UIImage> | UIImage[]): this;

	/**
	 * @since 17.4
	 * @deprecated 26.0
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

	/**
	 * @since 14.0
	 * @deprecated 26.0
	 */
	updateImages(gridImages: NSArray<UIImage> | UIImage[]): void;
}

/**
 * @since 26.0
 */
declare class CPListImageRowItemCardElement extends CPListImageRowItemElement implements NSSecureCoding {

	static alloc(): CPListImageRowItemCardElement; // inherited from NSObject

	static new(): CPListImageRowItemCardElement; // inherited from NSObject

	readonly showsImageFullHeight: boolean;

	subtitle: string | null;

	/**
	 * @since 26.4
	 */
	thumbnail: CPThumbnailImage | null;

	tintColor: UIColor | null;

	title: string;

	static readonly maximumFullHeightImageSize: CGSize;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { image: UIImage; showsImageFullHeight: boolean; title: string | null; subtitle: string | null; tintColor: UIColor | null; });

	/**
	 * @since 26.4
	 */
	constructor(o: { thumbnail: CPThumbnailImage; title: string | null; subtitle: string | null; tintColor: UIColor | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithImageShowsImageFullHeightTitleSubtitleTintColor(image: UIImage, showsImageFullHeight: boolean, title: string | null, subtitle: string | null, tintColor: UIColor | null): this;

	/**
	 * @since 26.4
	 */
	initWithThumbnailTitleSubtitleTintColor(thumbnail: CPThumbnailImage, title: string | null, subtitle: string | null, tintColor: UIColor | null): this;
}

/**
 * @since 26.0
 */
declare class CPListImageRowItemCondensedElement extends CPListImageRowItemElement {

	static alloc(): CPListImageRowItemCondensedElement; // inherited from NSObject

	static new(): CPListImageRowItemCondensedElement; // inherited from NSObject

	accessorySymbolName: string | null;

	readonly imageShape: CPListImageRowItemCondensedElementShape;

	subtitle: string | null;

	title: string;

	constructor(o: { image: UIImage; imageShape: CPListImageRowItemCondensedElementShape; title: string; subtitle: string | null; accessorySymbolName: string | null; });

	initWithImageImageShapeTitleSubtitleAccessorySymbolName(image: UIImage, imageShape: CPListImageRowItemCondensedElementShape, title: string, subtitle: string | null, accessorySymbolName: string | null): this;
}

declare const enum CPListImageRowItemCondensedElementShape {

	Circular = 0,

	RoundedRectangle = 1
}

/**
 * @since 26.0
 */
declare class CPListImageRowItemElement extends NSObject implements CPPlayableItem {

	static alloc(): CPListImageRowItemElement; // inherited from NSObject

	static new(): CPListImageRowItemElement; // inherited from NSObject

	enabled: boolean;

	image: UIImage;

	static readonly maximumImageSize: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 26.4
	 */
	playbackConfiguration: CPPlaybackConfiguration | null; // inherited from CPPlayableItem

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
 * @since 26.0
 */
declare class CPListImageRowItemGridElement extends CPListImageRowItemElement {

	static alloc(): CPListImageRowItemGridElement; // inherited from NSObject

	static new(): CPListImageRowItemGridElement; // inherited from NSObject

	constructor(o: { image: UIImage; });

	initWithImage(image: UIImage): this;
}

/**
 * @since 26.0
 */
declare class CPListImageRowItemImageGridElement extends CPListImageRowItemElement {

	static alloc(): CPListImageRowItemImageGridElement; // inherited from NSObject

	static new(): CPListImageRowItemImageGridElement; // inherited from NSObject

	accessorySymbolName: string | null;

	readonly imageShape: CPListImageRowItemImageGridElementShape;

	title: string;

	constructor(o: { image: UIImage; imageShape: CPListImageRowItemImageGridElementShape; title: string; accessorySymbolName: string | null; });

	initWithImageImageShapeTitleAccessorySymbolName(image: UIImage, imageShape: CPListImageRowItemImageGridElementShape, title: string, accessorySymbolName: string | null): this;
}

declare const enum CPListImageRowItemImageGridElementShape {

	Circular = 0,

	RoundedRectangle = 1
}

/**
 * @since 26.0
 */
declare class CPListImageRowItemRowElement extends CPListImageRowItemElement {

	static alloc(): CPListImageRowItemRowElement; // inherited from NSObject

	static new(): CPListImageRowItemRowElement; // inherited from NSObject

	subtitle: string | null;

	title: string | null;

	constructor(o: { image: UIImage; title: string | null; subtitle: string | null; });

	initWithImageTitleSubtitle(image: UIImage, title: string | null, subtitle: string | null): this;
}

/**
 * @since 12.0
 */
declare class CPListItem extends NSObject implements CPPlayableItem, CPSelectableListItem {

	static alloc(): CPListItem; // inherited from NSObject

	static new(): CPListItem; // inherited from NSObject

	readonly accessoryImage: UIImage | null;

	/**
	 * @since 14.0
	 */
	accessoryType: CPListItemAccessoryType;

	readonly detailText: string | null;

	/**
	 * @since 14.0
	 */
	explicitContent: boolean;

	readonly image: UIImage | null;

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

	handler: (p1: CPSelectableListItem, p2: () => void) => void | null; // inherited from CPSelectableListItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 26.4
	 */
	playbackConfiguration: CPPlaybackConfiguration | null; // inherited from CPPlayableItem

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly text: string | null; // inherited from CPListTemplateItem

	userInfo: any | null; // inherited from CPListTemplateItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { text: string | null; detailText: string | null; });

	constructor(o: { text: string | null; detailText: string | null; image: UIImage | null; });

	/**
	 * @since 14.0
	 */
	constructor(o: { text: string | null; detailText: string | null; image: UIImage | null; accessoryImage: UIImage | null; accessoryType: CPListItemAccessoryType; });

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	constructor(o: { text: string | null; detailText: string | null; image: UIImage | null; showsDisclosureIndicator: boolean; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTextDetailText(text: string | null, detailText: string | null): this;

	initWithTextDetailTextImage(text: string | null, detailText: string | null, image: UIImage | null): this;

	/**
	 * @since 14.0
	 */
	initWithTextDetailTextImageAccessoryImageAccessoryType(text: string | null, detailText: string | null, image: UIImage | null, accessoryImage: UIImage | null, accessoryType: CPListItemAccessoryType): this;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	initWithTextDetailTextImageShowsDisclosureIndicator(text: string | null, detailText: string | null, image: UIImage | null, showsDisclosureIndicator: boolean): this;

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
	setAccessoryImage(accessoryImage: UIImage | null): void;

	/**
	 * @since 14.0
	 */
	setDetailText(detailText: string | null): void;

	/**
	 * @since 14.0
	 */
	setImage(image: UIImage | null): void;

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

	readonly header: string | null;

	/**
	 * @since 15.0
	 */
	readonly headerButton: CPButton | null;

	/**
	 * @since 15.0
	 */
	headerImage: UIImage | null;

	/**
	 * @since 15.0
	 */
	readonly headerSubtitle: string | null;

	readonly items: NSArray<CPListTemplateItem>;

	readonly sectionIndexTitle: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; });

	/**
	 * @since 15.0
	 */
	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; header: string; headerSubtitle: string | null; headerImage: UIImage | null; headerButton: CPButton | null; sectionIndexTitle: string | null; });

	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; header: string | null; sectionIndexTitle: string | null; });

	encodeWithCoder(coder: NSCoder): void;

	indexOfItem(item: CPListTemplateItem): number;

	initWithCoder(coder: NSCoder): this;

	initWithItems(items: NSArray<CPListTemplateItem> | CPListTemplateItem[]): this;

	/**
	 * @since 15.0
	 */
	initWithItemsHeaderHeaderSubtitleHeaderImageHeaderButtonSectionIndexTitle(items: NSArray<CPListTemplateItem> | CPListTemplateItem[], header: string, headerSubtitle: string | null, headerImage: UIImage | null, headerButton: CPButton | null, sectionIndexTitle: string | null): this;

	initWithItemsHeaderSectionIndexTitle(items: NSArray<CPListTemplateItem> | CPListTemplateItem[], header: string | null, sectionIndexTitle: string | null): this;

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
	assistantCellConfiguration: CPAssistantCellConfiguration | null;

	/**
	 * @since 12.0
	 * @deprecated 14.0
	 */
	delegate: CPListTemplateDelegate | null;

	/**
	 * @since 14.0
	 */
	emptyViewSubtitleVariants: NSArray<string>;

	/**
	 * @since 14.0
	 */
	emptyViewTitleVariants: NSArray<string>;

	/**
	 * @since 26.0
	 */
	headerGridButtons: NSArray<CPGridButton> | null;

	/**
	 * @since 14.0
	 */
	readonly itemCount: number;

	/**
	 * @since 26.4
	 */
	listHeader: CPListTemplateDetailsHeader | null;

	/**
	 * @since 14.0
	 */
	readonly sectionCount: number;

	readonly sections: NSArray<CPListSection>;

	/**
	 * @since 18.4
	 */
	showsSpinnerWhileEmpty: boolean;

	readonly title: string | null;

	/**
	 * @since 26.0
	 */
	static readonly maximumGridButtonImageSize: CGSize;

	/**
	 * @since 26.0
	 */
	static readonly maximumHeaderGridButtonCount: number;

	/**
	 * @since 14.0
	 */
	static readonly maximumItemCount: number;

	/**
	 * @since 14.0
	 */
	static readonly maximumSectionCount: number;

	backButton: CPBarButton | null; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 26.4
	 */
	constructor(o: { title: string | null; listHeader: CPListTemplateDetailsHeader | null; sections: NSArray<CPListSection> | CPListSection[]; assistantCellConfiguration: CPAssistantCellConfiguration | null; });

	constructor(o: { title: string | null; sections: NSArray<CPListSection> | CPListSection[]; });

	/**
	 * @since 15.0
	 */
	constructor(o: { title: string | null; sections: NSArray<CPListSection> | CPListSection[]; assistantCellConfiguration: CPAssistantCellConfiguration | null; });

	/**
	 * @since 26.0
	 */
	constructor(o: { title: string | null; sections: NSArray<CPListSection> | CPListSection[]; assistantCellConfiguration: CPAssistantCellConfiguration | null; headerGridButtons: NSArray<CPGridButton> | CPGridButton[] | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 14.0
	 */
	indexPathForItem(item: CPListTemplateItem): NSIndexPath | null;

	/**
	 * @since 26.4
	 */
	initWithTitleListHeaderSectionsAssistantCellConfiguration(title: string | null, listHeader: CPListTemplateDetailsHeader | null, sections: NSArray<CPListSection> | CPListSection[], assistantCellConfiguration: CPAssistantCellConfiguration | null): this;

	initWithTitleSections(title: string | null, sections: NSArray<CPListSection> | CPListSection[]): this;

	/**
	 * @since 15.0
	 */
	initWithTitleSectionsAssistantCellConfiguration(title: string | null, sections: NSArray<CPListSection> | CPListSection[], assistantCellConfiguration: CPAssistantCellConfiguration | null): this;

	/**
	 * @since 26.0
	 */
	initWithTitleSectionsAssistantCellConfigurationHeaderGridButtons(title: string | null, sections: NSArray<CPListSection> | CPListSection[], assistantCellConfiguration: CPAssistantCellConfiguration | null, headerGridButtons: NSArray<CPGridButton> | CPGridButton[] | null): this;

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
 * @since 26.4
 */
declare class CPListTemplateDetailsHeader extends NSObject implements CPPlayableItem, NSSecureCoding {

	static alloc(): CPListTemplateDetailsHeader; // inherited from NSObject

	static new(): CPListTemplateDetailsHeader; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	actionButtons: NSArray<CPButton>;

	/**
	 * @since 26.4
	 */
	adaptiveBackgroundStyle: boolean;

	/**
	 * @since 26.4
	 */
	bodyVariants: NSArray<NSAttributedString>;

	/**
	 * @since 26.4
	 */
	subtitle: string | null;

	/**
	 * @since 26.4
	 */
	thumbnail: CPThumbnailImage;

	/**
	 * @since 26.4
	 */
	title: string | null;

	/**
	 * @since 26.4
	 */
	static readonly maximumActionButtonCount: number;

	/**
	 * @since 26.4
	 */
	static readonly maximumActionButtonSize: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 26.4
	 */
	playbackConfiguration: CPPlaybackConfiguration | null; // inherited from CPPlayableItem

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 26.4
	 */
	constructor(o: { thumbnail: CPThumbnailImage; title: string | null; subtitle: string | null; actionButtons: NSArray<CPButton> | CPButton[]; });

	/**
	 * @since 26.4
	 */
	constructor(o: { thumbnail: CPThumbnailImage; title: string | null; subtitle: string | null; bodyVariants: NSArray<NSAttributedString> | NSAttributedString[]; actionButtons: NSArray<CPButton> | CPButton[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 26.4
	 */
	initWithThumbnailTitleSubtitleActionButtons(thumbnail: CPThumbnailImage, title: string | null, subtitle: string | null, actionButton: NSArray<CPButton> | CPButton[]): this;

	/**
	 * @since 26.4
	 */
	initWithThumbnailTitleSubtitleBodyVariantsActionButtons(thumbnail: CPThumbnailImage, title: string | null, subtitle: string | null, bodyVariants: NSArray<NSAttributedString> | NSAttributedString[], actionButtons: NSArray<CPButton> | CPButton[]): this;

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
interface CPListTemplateItem extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	enabled: boolean;

	text: string | null;

	userInfo: any | null;
}
declare var CPListTemplateItem: {

	prototype: CPListTemplateItem;
};

interface CPLocationCoordinate3D {
	latitude: number;
	longitude: number;
	altitude: number;
}
declare var CPLocationCoordinate3D: interop.StructType<CPLocationCoordinate3D>;

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
	cardBackgroundColor: UIColor | null;

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
	dashboardJunctionImage: UIImage | null;

	/**
	 * @since 14.0
	 */
	dashboardSymbolImage: UIImage | null;

	/**
	 * @since 17.4
	 */
	highwayExitLabel: string;

	initialTravelEstimates: CPTravelEstimates | null;

	instructionVariants: NSArray<string>;

	/**
	 * @since 17.4
	 */
	junctionElementAngles: NSSet<NSMeasurement<NSUnitAngle>> | null;

	/**
	 * @since 17.4
	 */
	junctionExitAngle: NSMeasurement<NSUnitAngle> | null;

	junctionImage: UIImage | null;

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
	notificationSymbolImage: UIImage | null;

	/**
	 * @since 17.4
	 */
	roadFollowingManeuverVariants: NSArray<string> | null;

	symbolImage: UIImage | null;

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	symbolSet: CPImageSet | null;

	/**
	 * @since 17.4
	 */
	trafficSide: CPTrafficSide;

	userInfo: any | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

	focusedImage: UIImage | null;

	hidden: boolean;

	image: UIImage | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { handler: (p1: CPMapButton) => void | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHandler(handler: (p1: CPMapButton) => void | null): this;
}

/**
 * @since 12.0
 */
declare class CPMapTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPMapTemplate; // inherited from NSObject

	static new(): CPMapTemplate; // inherited from NSObject

	automaticallyHidesNavigationBar: boolean;

	readonly currentNavigationAlert: CPNavigationAlert | null;

	guidanceBackgroundColor: UIColor;

	hidesButtonsWithNavigationBar: boolean;

	mapButtons: NSArray<CPMapButton>;

	mapDelegate: CPMapTemplateDelegate | null;

	readonly panningInterfaceVisible: boolean;

	tripEstimateStyle: CPTripEstimateStyle;

	backButton: CPBarButton | null; // inherited from CPBarButtonProviding

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

	showRouteChoicesPreviewForTripTextConfiguration(tripPreview: CPTrip, textConfiguration: CPTripPreviewTextConfiguration | null): void;

	/**
	 * @since 14.0
	 */
	showTripPreviewsSelectedTripTextConfiguration(tripPreviews: NSArray<CPTrip> | CPTrip[], selectedTrip: CPTrip | null, textConfiguration: CPTripPreviewTextConfiguration | null): void;

	showTripPreviewsTextConfiguration(tripPreviews: NSArray<CPTrip> | CPTrip[], textConfiguration: CPTripPreviewTextConfiguration | null): void;

	startNavigationSessionForTrip(trip: CPTrip): CPNavigationSession;

	updateTravelEstimatesForTrip(estimates: CPTravelEstimates, trip: CPTrip): void;

	updateTravelEstimatesForTripWithTimeRemainingColor(estimates: CPTravelEstimates, trip: CPTrip, timeRemainingColor: CPTimeRemainingColor): void;
}

/**
 * @since 12.0
 */
interface CPMapTemplateDelegate extends NSObjectProtocol {

	mapTemplateDidBeginPanGesture?(mapTemplate: CPMapTemplate): void;

	/**
	 * @since 26.0
	 */
	mapTemplateDidBeginPitchGesture?(mapTemplate: CPMapTemplate): void;

	/**
	 * @since 26.0
	 */
	mapTemplateDidBeginRotationGesture?(mapTemplate: CPMapTemplate): void;

	/**
	 * @since 26.0
	 */
	mapTemplateDidBeginZoomGesture?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidCancelNavigation?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidDismissNavigationAlertDismissalContext?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert, dismissalContext: CPNavigationAlertDismissalContext): void;

	mapTemplateDidDismissPanningInterface?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidEndPanGestureWithVelocity?(mapTemplate: CPMapTemplate, velocity: CGPoint): void;

	/**
	 * @since 26.0
	 */
	mapTemplateDidEndZoomGestureWithVelocity?(mapTemplate: CPMapTemplate, velocity: number): void;

	/**
	 * @since 26.4
	 */
	mapTemplateDidFailToShareDestinationForTripError?(mapTemplate: CPMapTemplate, trip: CPTrip, error: NSError): void;

	/**
	 * @since 26.4
	 */
	mapTemplateDidReceiveRequestForDestination?(mapTemplate: CPMapTemplate, waypoint: CPNavigationWaypoint): void;

	/**
	 * @since 26.4
	 */
	mapTemplateDidReceiveUpdatedRouteSource?(mapTemplate: CPMapTemplate, routeSource: CPRouteSource): void;

	/**
	 * @since 26.4
	 */
	mapTemplateDidRequestToInsertWaypointIntoSegmentCompletion?(mapTemplate: CPMapTemplate, waypoint: CPNavigationWaypoint, segment: CPRouteSegment, completion: (p1: CPTravelEstimates) => void): void;

	/**
	 * @since 26.0
	 */
	mapTemplateDidRotateWithCenterRotationVelocity?(mapTemplate: CPMapTemplate, center: CGPoint, rotation: number, velocity: number): void;

	/**
	 * @since 26.4
	 */
	mapTemplateDidShareDestinationForTrip?(mapTemplate: CPMapTemplate, trip: CPTrip): void;

	mapTemplateDidShowNavigationAlert?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert): void;

	mapTemplateDidShowPanningInterface?(mapTemplate: CPMapTemplate): void;

	mapTemplateDidUpdatePanGestureWithTranslationVelocity?(mapTemplate: CPMapTemplate, translation: CGPoint, velocity: CGPoint): void;

	/**
	 * @since 26.0
	 */
	mapTemplateDidUpdateZoomGestureWithCenterScaleVelocity?(mapTemplate: CPMapTemplate, center: CGPoint, scale: number, velocity: number): void;

	mapTemplateDisplayStyleForManeuver?(mapTemplate: CPMapTemplate, maneuver: CPManeuver): CPManeuverDisplayStyle;

	/**
	 * @since 26.4
	 */
	mapTemplateMapTemplateWaypointAcceptedForSegment?(mapTemplate: CPMapTemplate, waypoint: CPNavigationWaypoint, accepted: boolean, segment: CPRouteSegment | null): void;

	mapTemplatePanBeganWithDirection?(mapTemplate: CPMapTemplate, direction: CPPanDirection): void;

	mapTemplatePanEndedWithDirection?(mapTemplate: CPMapTemplate, direction: CPPanDirection): void;

	mapTemplatePanWithDirection?(mapTemplate: CPMapTemplate, direction: CPPanDirection): void;

	/**
	 * @since 26.0
	 */
	mapTemplatePitchEndedWithCenter?(mapTemplate: CPMapTemplate, center: CGPoint): void;

	/**
	 * @since 26.0
	 */
	mapTemplatePitchWithCenter?(mapTemplate: CPMapTemplate, center: CGPoint): void;

	/**
	 * @since 26.0
	 */
	mapTemplateRotationDidEndWithVelocity?(mapTemplate: CPMapTemplate, velocity: number): void;

	mapTemplateSelectedPreviewForTripUsingRouteChoice?(mapTemplate: CPMapTemplate, trip: CPTrip, routeChoice: CPRouteChoice): void;

	/**
	 * @since 17.4
	 */
	mapTemplateShouldProvideNavigationMetadata?(mapTemplate: CPMapTemplate): boolean;

	/**
	 * @since 26.4
	 */
	mapTemplateShouldProvideRouteSharing?(mapTemplate: CPMapTemplate): boolean;

	mapTemplateShouldShowNotificationForManeuver?(mapTemplate: CPMapTemplate, maneuver: CPManeuver): boolean;

	mapTemplateShouldShowNotificationForNavigationAlert?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert): boolean;

	mapTemplateShouldUpdateNotificationForManeuverWithTravelEstimates?(mapTemplate: CPMapTemplate, maneuver: CPManeuver, travelEstimates: CPTravelEstimates): boolean;

	mapTemplateStartedTripUsingRouteChoice?(mapTemplate: CPMapTemplate, trip: CPTrip, routeChoice: CPRouteChoice): void;

	mapTemplateWillDismissNavigationAlertDismissalContext?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert, dismissalContext: CPNavigationAlertDismissalContext): void;

	mapTemplateWillDismissPanningInterface?(mapTemplate: CPMapTemplate): void;

	/**
	 * @since 26.4
	 */
	mapTemplateWillShareDestinationForTrip?(mapTemplate: CPMapTemplate, trip: CPTrip): void;

	mapTemplateWillShowNavigationAlert?(mapTemplate: CPMapTemplate, navigationAlert: CPNavigationAlert): void;
}
declare var CPMapTemplateDelegate: {

	prototype: CPMapTemplateDelegate;
};

/**
 * @since 26.4
 */
declare class CPMapTemplateWaypoint extends NSObject {

	static alloc(): CPMapTemplateWaypoint; // inherited from NSObject

	static new(): CPMapTemplateWaypoint; // inherited from NSObject

	travelEstimates: CPTravelEstimates;

	waypoint: CPNavigationWaypoint;

	constructor(o: { waypoint: CPNavigationWaypoint; travelEstimates: CPTravelEstimates; });

	initWithWaypointTravelEstimates(waypoint: CPNavigationWaypoint, travelEstimates: CPTravelEstimates): this;
}

declare var CPMaximumListSectionImageSize: CGSize;

declare var CPMaximumMessageItemImageSize: CGSize;

declare var CPMaximumMessageItemLeadingDetailTextImageSize: CGSize;

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

/**
 * @since 26.0
 */
declare class CPMessageGridItemConfiguration extends NSObject {

	static alloc(): CPMessageGridItemConfiguration; // inherited from NSObject

	static new(): CPMessageGridItemConfiguration; // inherited from NSObject

	readonly conversationIdentifier: string;

	unread: boolean;

	constructor(o: { conversationIdentifier: string; unread: boolean; });

	initWithConversationIdentifierUnread(conversationIdentifier: string, unread: boolean): this;
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

	conversationIdentifier: string | null;

	detailText: string | null;

	leadingConfiguration: CPMessageListItemLeadingConfiguration;

	/**
	 * @since 26.0
	 */
	leadingDetailTextImage: UIImage | null;

	phoneOrEmailAddress: string | null;

	text: string | null;

	trailingConfiguration: CPMessageListItemTrailingConfiguration | null;

	trailingText: string | null;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 15.0
	 */
	enabled: boolean; // inherited from CPListTemplateItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userInfo: any | null; // inherited from CPListTemplateItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { conversationIdentifier: string; text: string; leadingConfiguration: CPMessageListItemLeadingConfiguration; trailingConfiguration: CPMessageListItemTrailingConfiguration | null; detailText: string | null; trailingText: string | null; });

	constructor(o: { fullName: string; phoneOrEmailAddress: string; leadingConfiguration: CPMessageListItemLeadingConfiguration; trailingConfiguration: CPMessageListItemTrailingConfiguration | null; detailText: string | null; trailingText: string | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithConversationIdentifierTextLeadingConfigurationTrailingConfigurationDetailTextTrailingText(conversationIdentifier: string, text: string, leadingConfiguration: CPMessageListItemLeadingConfiguration, trailingConfiguration: CPMessageListItemTrailingConfiguration | null, detailText: string | null, trailingText: string | null): this;

	initWithFullNamePhoneOrEmailAddressLeadingConfigurationTrailingConfigurationDetailTextTrailingText(fullName: string, phoneOrEmailAddress: string, leadingConfiguration: CPMessageListItemLeadingConfiguration, trailingConfiguration: CPMessageListItemTrailingConfiguration | null, detailText: string | null, trailingText: string | null): this;

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

	readonly leadingImage: UIImage | null;

	readonly leadingItem: CPMessageLeadingItem;

	readonly unread: boolean;

	constructor(o: { leadingItem: CPMessageLeadingItem; leadingImage: UIImage | null; unread: boolean; });

	initWithLeadingItemLeadingImageUnread(leadingItem: CPMessageLeadingItem, leadingImage: UIImage | null, unread: boolean): this;
}

/**
 * @since 14.0
 */
declare class CPMessageListItemTrailingConfiguration extends NSObject {

	static alloc(): CPMessageListItemTrailingConfiguration; // inherited from NSObject

	static new(): CPMessageListItemTrailingConfiguration; // inherited from NSObject

	readonly trailingImage: UIImage | null;

	readonly trailingItem: CPMessageTrailingItem;

	constructor(o: { trailingItem: CPMessageTrailingItem; trailingImage: UIImage | null; });

	initWithTrailingItemTrailingImage(trailingItem: CPMessageTrailingItem, trailingImage: UIImage | null): this;
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

	readonly image: UIImage | null;

	readonly imageSet: CPImageSet | null;

	readonly primaryAction: CPAlertAction;

	readonly secondaryAction: CPAlertAction | null;

	readonly subtitleVariants: NSArray<string>;

	readonly titleVariants: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { titleVariants: NSArray<string> | string[]; subtitleVariants: NSArray<string> | string[] | null; image: UIImage | null; primaryAction: CPAlertAction; secondaryAction: CPAlertAction | null; duration: number; });

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	constructor(o: { titleVariants: NSArray<string> | string[]; subtitleVariants: NSArray<string> | string[] | null; imageSet: CPImageSet | null; primaryAction: CPAlertAction; secondaryAction: CPAlertAction | null; duration: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleVariantsSubtitleVariantsImagePrimaryActionSecondaryActionDuration(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[] | null, image: UIImage | null, primaryAction: CPAlertAction, secondaryAction: CPAlertAction | null, duration: number): this;

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	initWithTitleVariantsSubtitleVariantsImageSetPrimaryActionSecondaryActionDuration(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[] | null, imageSet: CPImageSet | null, primaryAction: CPAlertAction, secondaryAction: CPAlertAction | null, duration: number): this;

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

	/**
	 * @since 17.4
	 */
	currentLaneGuidance: CPLaneGuidance | null;

	/**
	 * @since 17.4
	 */
	currentRoadNameVariants: NSArray<string>;

	/**
	 * @since 26.4
	 */
	currentSegment: CPRouteSegment;

	/**
	 * @since 17.4
	 */
	maneuverState: CPManeuverState;

	/**
	 * @since 26.4
	 */
	readonly routeSegments: NSArray<CPRouteSegment>;

	readonly trip: CPTrip;

	upcomingManeuvers: NSArray<CPManeuver>;

	/**
	 * @since 17.4
	 */
	addLaneGuidances(laneGuidances: NSArray<CPLaneGuidance> | CPLaneGuidance[]): void;

	/**
	 * @since 17.4
	 */
	addManeuvers(maneuvers: NSArray<CPManeuver> | CPManeuver[]): void;

	/**
	 * @since 26.4
	 */
	addRouteSegments(routeSegments: NSArray<CPRouteSegment> | CPRouteSegment[]): void;

	cancelTrip(): void;

	finishTrip(): void;

	pauseTripForReasonDescription(reason: CPTripPauseReason, description: string | null): void;

	/**
	 * @since 15.4
	 */
	pauseTripForReasonDescriptionTurnCardColor(reason: CPTripPauseReason, description: string | null, turnCardColor: UIColor | null): void;

	/**
	 * @since 17.4
	 */
	resumeTripWithUpdatedRouteInformation(routeInformation: CPRouteInformation): void;

	/**
	 * @since 26.4
	 */
	resumeTripWithUpdatedRouteSegmentsCurrentSegmentRerouteReason(routeSegments: NSArray<CPRouteSegment> | CPRouteSegment[], currentSegment: CPRouteSegment, rerouteReason: CPRerouteReason): void;

	updateTravelEstimatesForManeuver(estimates: CPTravelEstimates, maneuver: CPManeuver): void;
}

/**
 * @since 26.4
 */
declare class CPNavigationWaypoint extends NSObject implements NSSecureCoding {

	static alloc(): CPNavigationWaypoint; // inherited from NSObject

	static new(): CPNavigationWaypoint; // inherited from NSObject

	readonly address: string | null;

	readonly centerPoint: CPLocationCoordinate3D;

	readonly entryPoints: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | null;

	readonly entryPointsCount: number;

	readonly locationThreshold: NSMeasurement<NSUnitLength> | null;

	readonly name: string | null;

	readonly timeZone: NSTimeZone | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { centerPoint: CPLocationCoordinate3D; locationThreshold: NSMeasurement<NSUnitLength> | null; name: string | null; address: string | null; entryPoints: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | ArrayBufferLike | ArrayBufferView; entryPointsCount: number; timeZone: NSTimeZone | null; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { mapItem: MKMapItem; locationThreshold: NSMeasurement<NSUnitLength> | null; entryPoints: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | ArrayBufferLike | ArrayBufferView; entryPointsCount: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCenterPointLocationThresholdNameAddressEntryPointsEntryPointsCountTimeZone(centerPoint: CPLocationCoordinate3D, locationThreshold: NSMeasurement<NSUnitLength> | null, name: string | null, address: string | null, entryPoints: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | ArrayBufferLike | ArrayBufferView, entryPointsCount: number, timeZone: NSTimeZone | null): this;

	initWithCoder(coder: NSCoder): this;

	initWithMapItemLocationThresholdEntryPointsEntryPointsCount(mapItem: MKMapItem, locationThreshold: NSMeasurement<NSUnitLength> | null, entryPoints: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | ArrayBufferLike | ArrayBufferView, entryPointsCount: number): this;
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

	constructor(o: { handler: (p1: CPNowPlayingButton) => void | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithHandler(handler: (p1: CPNowPlayingButton) => void | null): this;
}

declare var CPNowPlayingButtonMaximumImageSize: CGSize;

/**
 * @since 14.0
 */
declare class CPNowPlayingImageButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingImageButton; // inherited from NSObject

	static new(): CPNowPlayingImageButton; // inherited from NSObject

	readonly image: UIImage | null;

	constructor(o: { image: UIImage; handler: (p1: CPNowPlayingButton) => void | null; });

	initWithImageHandler(image: UIImage, handler: (p1: CPNowPlayingButton) => void | null): this;
}

/**
 * @since 18.4
 */
declare class CPNowPlayingMode extends NSObject implements NSSecureCoding {

	static alloc(): CPNowPlayingMode; // inherited from NSObject

	static new(): CPNowPlayingMode; // inherited from NSObject

	static readonly defaultNowPlayingMode: CPNowPlayingMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.4
 */
declare class CPNowPlayingModeSports extends CPNowPlayingMode implements NSSecureCoding {

	static alloc(): CPNowPlayingModeSports; // inherited from NSObject

	static new(): CPNowPlayingModeSports; // inherited from NSObject

	readonly backgroundArtwork: UIImage | null;

	readonly eventStatus: CPNowPlayingSportsEventStatus | null;

	readonly leftTeam: CPNowPlayingSportsTeam;

	readonly rightTeam: CPNowPlayingSportsTeam;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { leftTeam: CPNowPlayingSportsTeam; rightTeam: CPNowPlayingSportsTeam; eventStatus: CPNowPlayingSportsEventStatus | null; backgroundArtwork: UIImage | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLeftTeamRightTeamEventStatusBackgroundArtwork(leftTeam: CPNowPlayingSportsTeam, rightTeam: CPNowPlayingSportsTeam, eventStatus: CPNowPlayingSportsEventStatus | null, backgroundArtwork: UIImage | null): this;
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
 * @since 18.4
 */
declare class CPNowPlayingSportsClock extends NSObject implements NSSecureCoding {

	static alloc(): CPNowPlayingSportsClock; // inherited from NSObject

	static new(): CPNowPlayingSportsClock; // inherited from NSObject

	readonly countsUp: boolean;

	readonly paused: boolean;

	readonly timeValue: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { elapsedTime: number; paused: boolean; });

	constructor(o: { timeRemaining: number; paused: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithElapsedTimePaused(elapsedTime: number, paused: boolean): this;

	initWithTimeRemainingPaused(timeRemaining: number, paused: boolean): this;
}

/**
 * @since 18.4
 */
declare class CPNowPlayingSportsEventStatus extends NSObject implements NSSecureCoding {

	static alloc(): CPNowPlayingSportsEventStatus; // inherited from NSObject

	static new(): CPNowPlayingSportsEventStatus; // inherited from NSObject

	readonly eventClock: CPNowPlayingSportsClock | null;

	readonly eventStatusImage: UIImage | null;

	readonly eventStatusText: NSArray<string> | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { eventStatusText: NSArray<string> | string[] | null; eventStatusImage: UIImage | null; eventClock: CPNowPlayingSportsClock | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithEventStatusTextEventStatusImageEventClock(eventStatusText: NSArray<string> | string[] | null, eventStatusImage: UIImage | null, eventClock: CPNowPlayingSportsClock | null): this;
}

/**
 * @since 18.4
 */
declare class CPNowPlayingSportsTeam extends NSObject implements NSSecureCoding {

	static alloc(): CPNowPlayingSportsTeam; // inherited from NSObject

	static new(): CPNowPlayingSportsTeam; // inherited from NSObject

	readonly eventScore: string;

	readonly favorite: boolean;

	readonly logo: CPNowPlayingSportsTeamLogo;

	readonly name: string;

	readonly possessionIndicator: UIImage | null;

	readonly teamStandings: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; logo: CPNowPlayingSportsTeamLogo; teamStandings: string | null; eventScore: string; possessionIndicator: UIImage | null; favorite: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameLogoTeamStandingsEventScorePossessionIndicatorFavorite(name: string, logo: CPNowPlayingSportsTeamLogo, teamStandings: string | null, eventScore: string, possessionIndicator: UIImage | null, favorite: boolean): this;
}

/**
 * @since 18.4
 */
declare class CPNowPlayingSportsTeamLogo extends NSObject implements NSSecureCoding {

	static alloc(): CPNowPlayingSportsTeamLogo; // inherited from NSObject

	static new(): CPNowPlayingSportsTeamLogo; // inherited from NSObject

	readonly initials: string | null;

	readonly logo: UIImage | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { teamInitials: string; });

	constructor(o: { teamLogo: UIImage; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTeamInitials(teamInitials: string): this;

	initWithTeamLogo(teamLogo: UIImage): this;
}

/**
 * @since 14.0
 */
declare class CPNowPlayingTemplate extends CPTemplate {

	static alloc(): CPNowPlayingTemplate; // inherited from NSObject

	static new(): CPNowPlayingTemplate; // inherited from NSObject

	albumArtistButtonEnabled: boolean;

	readonly nowPlayingButtons: NSArray<CPNowPlayingButton>;

	/**
	 * @since 18.4
	 */
	nowPlayingMode: CPNowPlayingMode | null;

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
 * @since 26.4
 */
interface CPPlayableItem extends NSObjectProtocol {

	/**
	 * @since 26.4
	 */
	playbackConfiguration: CPPlaybackConfiguration | null;
}
declare var CPPlayableItem: {

	prototype: CPPlayableItem;
};

declare const enum CPPlaybackAction {

	None = 0,

	Play = 1,

	Pause = 2,

	Replay = 3
}

/**
 * @since 26.4
 */
declare class CPPlaybackConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPPlaybackConfiguration; // inherited from NSObject

	static new(): CPPlaybackConfiguration; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	readonly duration: CMTime;

	/**
	 * @since 26.4
	 */
	readonly elapsedTime: CMTime;

	/**
	 * @since 26.4
	 */
	readonly playbackAction: CPPlaybackAction;

	/**
	 * @since 26.4
	 */
	readonly preferredPresentation: CPPlaybackPresentation;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 26.4
	 */
	constructor(o: { preferredPresentation: CPPlaybackPresentation; playbackAction: CPPlaybackAction; elapsedTime: CMTime; duration: CMTime; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 26.4
	 */
	initWithPreferredPresentationPlaybackActionElapsedTimeDuration(preferredPresentation: CPPlaybackPresentation, playbackAction: CPPlaybackAction, elapsedTime: CMTime, duration: CMTime): this;
}

declare const enum CPPlaybackPresentation {

	None = 0,

	Audio = 1,

	Video = 2
}

/**
 * @since 14.0
 */
declare class CPPointOfInterest extends NSObject implements NSSecureCoding {

	static alloc(): CPPointOfInterest; // inherited from NSObject

	static new(): CPPointOfInterest; // inherited from NSObject

	detailSubtitle: string | null;

	detailSummary: string | null;

	detailTitle: string | null;

	location: MKMapItem;

	pinImage: UIImage | null;

	primaryButton: CPTextButton | null;

	secondaryButton: CPTextButton | null;

	/**
	 * @since 16.0
	 */
	selectedPinImage: UIImage | null;

	subtitle: string | null;

	summary: string | null;

	title: string;

	userInfo: any | null;

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

	constructor(o: { location: MKMapItem; title: string; subtitle: string | null; summary: string | null; detailTitle: string | null; detailSubtitle: string | null; detailSummary: string | null; pinImage: UIImage | null; });

	/**
	 * @since 16.0
	 */
	constructor(o: { location: MKMapItem; title: string; subtitle: string | null; summary: string | null; detailTitle: string | null; detailSubtitle: string | null; detailSummary: string | null; pinImage: UIImage | null; selectedPinImage: UIImage | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocationTitleSubtitleSummaryDetailTitleDetailSubtitleDetailSummaryPinImage(location: MKMapItem, title: string, subtitle: string | null, summary: string | null, detailTitle: string | null, detailSubtitle: string | null, detailSummary: string | null, pinImage: UIImage | null): this;

	/**
	 * @since 16.0
	 */
	initWithLocationTitleSubtitleSummaryDetailTitleDetailSubtitleDetailSummaryPinImageSelectedPinImage(location: MKMapItem, title: string, subtitle: string | null, summary: string | null, detailTitle: string | null, detailSubtitle: string | null, detailSummary: string | null, pinImage: UIImage | null, selectedPinImage: UIImage | null): this;
}

/**
 * @since 14.0
 */
declare class CPPointOfInterestTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPPointOfInterestTemplate; // inherited from NSObject

	static new(): CPPointOfInterestTemplate; // inherited from NSObject

	pointOfInterestDelegate: CPPointOfInterestTemplateDelegate | null;

	readonly pointsOfInterest: NSArray<CPPointOfInterest>;

	selectedIndex: number;

	title: string;

	backButton: CPBarButton | null; // inherited from CPBarButtonProviding

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

declare const enum CPRerouteReason {

	Unknown = 0,

	MissedTurn = 1,

	Offline = 2,

	AlternateRoute = 3,

	WaypointModified = 4,

	Mandated = 5
}

/**
 * @since 12.0
 */
declare class CPRouteChoice extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPRouteChoice; // inherited from NSObject

	static new(): CPRouteChoice; // inherited from NSObject

	readonly additionalInformationVariants: NSArray<string> | null;

	readonly selectionSummaryVariants: NSArray<string> | null;

	readonly summaryVariants: NSArray<string>;

	userInfo: any | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { summaryVariants: NSArray<string> | string[]; additionalInformationVariants: NSArray<string> | string[]; selectionSummaryVariants: NSArray<string> | string[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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
 * @since 26.4
 */
declare class CPRouteSegment extends NSObject implements NSCopying {

	static alloc(): CPRouteSegment; // inherited from NSObject

	static new(): CPRouteSegment; // inherited from NSObject

	readonly coordinates: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | null;

	readonly coordinatesCount: number;

	readonly currentLaneGuidance: CPLaneGuidance;

	readonly currentManeuvers: NSArray<CPManeuver>;

	readonly destination: CPNavigationWaypoint;

	readonly identifier: NSUUID;

	readonly laneGuidances: NSArray<CPLaneGuidance>;

	readonly maneuverTravelEstimates: CPTravelEstimates;

	readonly maneuvers: NSArray<CPManeuver>;

	readonly origin: CPNavigationWaypoint;

	readonly tripTravelEstimates: CPTravelEstimates;

	constructor(o: { origin: CPNavigationWaypoint; destination: CPNavigationWaypoint; maneuvers: NSArray<CPManeuver> | CPManeuver[]; laneGuidances: NSArray<CPLaneGuidance> | CPLaneGuidance[]; currentManeuvers: NSArray<CPManeuver> | CPManeuver[]; currentLaneGuidance: CPLaneGuidance; tripTravelEstimates: CPTravelEstimates; maneuverTravelEstimates: CPTravelEstimates; coordinates: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | ArrayBufferLike | ArrayBufferView; coordinatesCount: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	initWithOriginDestinationManeuversLaneGuidancesCurrentManeuversCurrentLaneGuidanceTripTravelEstimatesManeuverTravelEstimatesCoordinatesCoordinatesCount(origin: CPNavigationWaypoint, destination: CPNavigationWaypoint, maneuvers: NSArray<CPManeuver> | CPManeuver[], laneGuidances: NSArray<CPLaneGuidance> | CPLaneGuidance[], currentManeuvers: NSArray<CPManeuver> | CPManeuver[], currentLaneGuidance: CPLaneGuidance, tripTravelEstimates: CPTravelEstimates, maneuverTravelEstimates: CPTravelEstimates, coordinates: interop.Pointer | interop.Reference<CPLocationCoordinate3D> | ArrayBufferLike | ArrayBufferView, coordinatesCount: number): this;
}

declare const enum CPRouteSource {

	Inactive = 0,

	iOSUnchanged = 1,

	iOSRouteModified = 2,

	iOSRouteDestinationsModified = 3,

	iOSDestinationsOnly = 4,

	Vehicle = 5
}

/**
 * @since 12.0
 */
declare class CPSearchTemplate extends CPTemplate {

	static alloc(): CPSearchTemplate; // inherited from NSObject

	static new(): CPSearchTemplate; // inherited from NSObject

	delegate: CPSearchTemplateDelegate | null;
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

	handler: (p1: CPSelectableListItem, p2: () => void) => void | null;
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

	delegate: CPSessionConfigurationDelegate | null;

	readonly limitedUserInterfaces: CPLimitableUserInterface;

	/**
	 * @since 26.4
	 */
	readonly supportsVideoPlayback: boolean;

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
 * @since 26.4
 */
declare class CPSportsOverlay extends NSObject implements NSSecureCoding {

	static alloc(): CPSportsOverlay; // inherited from NSObject

	static new(): CPSportsOverlay; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	readonly eventStatus: CPNowPlayingSportsEventStatus | null;

	/**
	 * @since 26.4
	 */
	readonly leftTeam: CPNowPlayingSportsTeam;

	/**
	 * @since 26.4
	 */
	readonly rightTeam: CPNowPlayingSportsTeam;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 26.4
	 */
	constructor(o: { leftTeam: CPNowPlayingSportsTeam; rightTeam: CPNowPlayingSportsTeam; eventStatus: CPNowPlayingSportsEventStatus | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 26.4
	 */
	initWithLeftTeamRightTeamEventStatus(leftTeam: CPNowPlayingSportsTeam, rightTeam: CPNowPlayingSportsTeam, eventStatus: CPNowPlayingSportsEventStatus | null): this;
}

/**
 * @since 14.0
 */
declare class CPTabBarTemplate extends CPTemplate {

	static alloc(): CPTabBarTemplate; // inherited from NSObject

	static new(): CPTabBarTemplate; // inherited from NSObject

	delegate: CPTabBarTemplateDelegate | null;

	readonly selectedTemplate: CPTemplate | null;

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
	tabImage: UIImage | null;

	/**
	 * @since 14.0
	 */
	tabSystemItem: UITabBarSystemItem;

	/**
	 * @since 14.0
	 */
	tabTitle: string | null;

	userInfo: any | null;

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

	delegate: CPTemplateApplicationDashboardSceneDelegate | null;
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

	delegate: CPTemplateApplicationInstrumentClusterSceneDelegate | null;

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

	delegate: CPTemplateApplicationSceneDelegate | null;

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

	constructor(o: { title: string; textStyle: CPTextButtonStyle; handler: (p1: CPTextButton) => void | null; });

	initWithTitleTextStyleHandler(title: string, textStyle: CPTextButtonStyle, handler: (p1: CPTextButton) => void | null): this;
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
 * @since 26.4
 */
declare class CPThumbnailImage extends NSObject implements NSSecureCoding {

	static alloc(): CPThumbnailImage; // inherited from NSObject

	static new(): CPThumbnailImage; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	image: UIImage;

	/**
	 * @since 26.4
	 */
	imageOverlay: CPImageOverlay | null;

	/**
	 * @since 26.4
	 */
	sportsOverlay: CPSportsOverlay | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 26.4
	 */
	constructor(o: { image: UIImage; });

	/**
	 * @since 26.4
	 */
	constructor(o: { image: UIImage; imageOverlay: CPImageOverlay | null; sportsOverlay: CPSportsOverlay | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 26.4
	 */
	initWithImage(image: UIImage): this;

	/**
	 * @since 26.4
	 */
	initWithImageImageOverlaySportsOverlay(image: UIImage, imageOverlay: CPImageOverlay | null, sportsOverlay: CPSportsOverlay | null): this;
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

	/**
	 * @since 17.4
	 */
	readonly distanceRemainingToDisplay: NSMeasurement<NSUnitLength>;

	readonly timeRemaining: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 17.4
	 */
	constructor(o: { distanceRemaining: NSMeasurement<NSUnitLength>; distanceRemainingToDisplay: NSMeasurement<NSUnitLength>; timeRemaining: number; });

	constructor(o: { distanceRemaining: NSMeasurement<NSUnitLength>; timeRemaining: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 17.4
	 */
	initWithDistanceRemainingDistanceRemainingToDisplayTimeRemaining(distanceRemaining: NSMeasurement<NSUnitLength>, distanceRemainingToDisplay: NSMeasurement<NSUnitLength>, time: number): this;

	initWithDistanceRemainingTimeRemaining(distance: NSMeasurement<NSUnitLength>, time: number): this;
}

/**
 * @since 12.0
 */
declare class CPTrip extends NSObject implements NSSecureCoding {

	static alloc(): CPTrip; // inherited from NSObject

	static new(): CPTrip; // inherited from NSObject

	/**
	 * @since 12.0
	 * @deprecated 26.4
	 */
	readonly destination: MKMapItem;

	/**
	 * @since 17.4
	 */
	destinationNameVariants: NSArray<string> | null;

	/**
	 * @since 26.4
	 */
	readonly destinationWaypoint: CPNavigationWaypoint;

	/**
	 * @since 26.1
	 */
	hasShareableDestination: boolean;

	/**
	 * @since 12.0
	 * @deprecated 26.4
	 */
	readonly origin: MKMapItem;

	/**
	 * @since 26.4
	 */
	readonly originWaypoint: CPNavigationWaypoint;

	readonly routeChoices: NSArray<CPRouteChoice>;

	/**
	 * @since 26.4
	 */
	routeSegmentsAvailableForRegion: boolean;

	userInfo: any | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 12.0
	 * @deprecated 26.4
	 */
	constructor(o: { origin: MKMapItem; destination: MKMapItem; routeChoices: NSArray<CPRouteChoice> | CPRouteChoice[]; });

	/**
	 * @since 26.4
	 */
	constructor(o: { originWaypoint: CPNavigationWaypoint; destinationWaypoint: CPNavigationWaypoint; routeChoices: NSArray<CPRouteChoice> | CPRouteChoice[]; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 12.0
	 * @deprecated 26.4
	 */
	initWithOriginDestinationRouteChoices(origin: MKMapItem, destination: MKMapItem, routeChoices: NSArray<CPRouteChoice> | CPRouteChoice[]): this;

	/**
	 * @since 26.4
	 */
	initWithOriginWaypointDestinationWaypointRouteChoices(origin: CPNavigationWaypoint, destination: CPNavigationWaypoint, routeChoices: NSArray<CPRouteChoice> | CPRouteChoice[]): this;
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

	readonly additionalRoutesButtonTitle: string | null;

	readonly overviewButtonTitle: string | null;

	readonly startButtonTitle: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { startButtonTitle: string | null; additionalRoutesButtonTitle: string | null; overviewButtonTitle: string | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStartButtonTitleAdditionalRoutesButtonTitleOverviewButtonTitle(startButtonTitle: string | null, additionalRoutesButtonTitle: string | null, overviewButtonTitle: string | null): this;
}

/**
 * @since 12.0
 */
declare class CPVoiceControlState extends NSObject implements NSSecureCoding {

	static alloc(): CPVoiceControlState; // inherited from NSObject

	static new(): CPVoiceControlState; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	actionButtons: NSArray<CPButton>;

	readonly identifier: string;

	readonly image: UIImage | null;

	readonly repeats: boolean;

	readonly titleVariants: NSArray<string> | null;

	/**
	 * @since 26.4
	 */
	static readonly maximumActionButtonCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; titleVariants: NSArray<string> | string[] | null; image: UIImage | null; repeats: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierTitleVariantsImageRepeats(identifier: string, titleVariants: NSArray<string> | string[] | null, image: UIImage | null, repeats: boolean): this;
}

/**
 * @since 12.0
 */
declare class CPVoiceControlTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPVoiceControlTemplate; // inherited from NSObject

	static new(): CPVoiceControlTemplate; // inherited from NSObject

	readonly activeStateIdentifier: string | null;

	readonly voiceControlStates: NSArray<CPVoiceControlState>;

	backButton: CPBarButton | null; // inherited from CPBarButtonProviding

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	leadingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	trailingNavigationBarButtons: NSArray<CPBarButton>; // inherited from CPBarButtonProviding

	readonly  // inherited from NSObjectProtocol

	constructor(o: { voiceControlStates: NSArray<CPVoiceControlState> | CPVoiceControlState[]; });

	activateVoiceControlStateWithIdentifier(identifier: string): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithVoiceControlStates(voiceControlStates: NSArray<CPVoiceControlState> | CPVoiceControlState[]): this;

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
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject | null): CPWindow; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CPWindow; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject | null): CPWindow; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CPWindow; // inherited from UIAppearance

	static new(): CPWindow; // inherited from NSObject

	readonly mapButtonSafeAreaLayoutGuide: UILayoutGuide;

	templateApplicationScene: CPTemplateApplicationScene | null;
}

declare var CarPlayErrorDomain: string;

/**
 * @since 17.4
 */
declare function NSStringFromCPJunctionType(junctionType: CPJunctionType): string;

/**
 * @since 17.4
 */
declare function NSStringFromCPLaneStatus(laneStatus: CPLaneStatus): string;

/**
 * @since 17.4
 */
declare function NSStringFromCPManeuverType(maneuverType: CPManeuverType): string;

/**
 * @since 26.4
 */
declare function NSStringFromCPRerouteReason(reason: CPRerouteReason): string;

/**
 * @since 17.4
 */
declare function NSStringFromCPTrafficSide(trafficSide: CPTrafficSide): string;
