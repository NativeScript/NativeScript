
declare class CPActionSheetTemplate extends CPTemplate {

	static alloc(): CPActionSheetTemplate; // inherited from NSObject

	static new(): CPActionSheetTemplate; // inherited from NSObject

	readonly actions: NSArray<CPAlertAction>;

	readonly message: string;

	readonly title: string;

	constructor(o: { title: string; message: string; actions: NSArray<CPAlertAction> | CPAlertAction[]; });

	initWithTitleMessageActions(title: string, message: string, actions: NSArray<CPAlertAction> | CPAlertAction[]): this;
}

declare class CPAlertAction extends NSObject implements NSSecureCoding {

	static alloc(): CPAlertAction; // inherited from NSObject

	static new(): CPAlertAction; // inherited from NSObject

	readonly handler: (p1: CPAlertAction) => void;

	readonly style: CPAlertActionStyle;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; style: CPAlertActionStyle; handler: (p1: CPAlertAction) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleStyleHandler(title: string, style: CPAlertActionStyle, handler: (p1: CPAlertAction) => void): this;
}

declare const enum CPAlertActionStyle {

	Default = 0,

	Cancel = 1,

	Destructive = 2
}

declare class CPAlertTemplate extends CPTemplate {

	static alloc(): CPAlertTemplate; // inherited from NSObject

	static new(): CPAlertTemplate; // inherited from NSObject

	readonly actions: NSArray<CPAlertAction>;

	readonly titleVariants: NSArray<string>;

	static readonly maximumActionCount: number;

	constructor(o: { titleVariants: NSArray<string> | string[]; actions: NSArray<CPAlertAction> | CPAlertAction[]; });

	initWithTitleVariantsActions(titleVariants: NSArray<string> | string[], actions: NSArray<CPAlertAction> | CPAlertAction[]): this;
}

interface CPApplicationDelegate extends UIApplicationDelegate {

	applicationDidConnectCarInterfaceControllerToWindow(application: UIApplication, interfaceController: CPInterfaceController, window: CPWindow): void;

	applicationDidDisconnectCarInterfaceControllerFromWindow(application: UIApplication, interfaceController: CPInterfaceController, window: CPWindow): void;

	applicationDidSelectManeuver?(application: UIApplication, maneuver: CPManeuver): void;

	applicationDidSelectNavigationAlert?(application: UIApplication, navigationAlert: CPNavigationAlert): void;
}
declare var CPApplicationDelegate: {

	prototype: CPApplicationDelegate;
};

declare const enum CPAssistantCellActionType {

	PlayMedia = 0,

	StartCall = 1
}

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

declare const enum CPAssistantCellPosition {

	Top = 0,

	Bottom = 1
}

declare const enum CPAssistantCellVisibility {

	Off = 0,

	WhileLimitedUIActive = 1,

	Always = 2
}

declare class CPBarButton extends NSObject implements NSSecureCoding {

	static alloc(): CPBarButton; // inherited from NSObject

	static new(): CPBarButton; // inherited from NSObject

	buttonStyle: CPBarButtonStyle;

	readonly buttonType: CPBarButtonType;

	enabled: boolean;

	image: UIImage;

	title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { image: UIImage; handler: (p1: CPBarButton) => void; });

	constructor(o: { title: string; handler: (p1: CPBarButton) => void; });

	constructor(o: { type: CPBarButtonType; handler: (p1: CPBarButton) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithImageHandler(image: UIImage, handler: (p1: CPBarButton) => void): this;

	initWithTitleHandler(title: string, handler: (p1: CPBarButton) => void): this;

	initWithTypeHandler(type: CPBarButtonType, handler: (p1: CPBarButton) => void): this;
}

interface CPBarButtonProviding extends NSObjectProtocol {

	backButton: CPBarButton;

	leadingNavigationBarButtons: NSArray<CPBarButton>;

	trailingNavigationBarButtons: NSArray<CPBarButton>;
}
declare var CPBarButtonProviding: {

	prototype: CPBarButtonProviding;
};

declare const enum CPBarButtonStyle {

	None = 0,

	Rounded = 1
}

declare const enum CPBarButtonType {

	Text = 0,

	Image = 1
}

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

declare class CPContactCallButton extends CPButton {

	static alloc(): CPContactCallButton; // inherited from NSObject

	static new(): CPContactCallButton; // inherited from NSObject

	constructor(o: { handler: (p1: CPButton) => void; });

	initWithHandler(handler: (p1: CPButton) => void): this;
}

declare class CPContactDirectionsButton extends CPButton {

	static alloc(): CPContactDirectionsButton; // inherited from NSObject

	static new(): CPContactDirectionsButton; // inherited from NSObject

	constructor(o: { handler: (p1: CPButton) => void; });

	initWithHandler(handler: (p1: CPButton) => void): this;
}

declare class CPContactMessageButton extends CPButton {

	static alloc(): CPContactMessageButton; // inherited from NSObject

	static new(): CPContactMessageButton; // inherited from NSObject

	readonly phoneOrEmail: string;

	constructor(o: { phoneOrEmail: string; });

	initWithPhoneOrEmail(phoneOrEmail: string): this;
}

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

declare const enum CPContentStyle {

	Light = 1,

	Dark = 2
}

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

declare class CPDashboardController extends NSObject {

	static alloc(): CPDashboardController; // inherited from NSObject

	static new(): CPDashboardController; // inherited from NSObject

	shortcutButtons: NSArray<CPDashboardButton>;
}

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

	updateGridButtons(gridButtons: NSArray<CPGridButton> | CPGridButton[]): void;

	updateTitle(title: string): void;
}

declare var CPGridTemplateMaximumItems: number;

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

declare class CPInformationRatingItem extends CPInformationItem {

	static alloc(): CPInformationRatingItem; // inherited from NSObject

	static new(): CPInformationRatingItem; // inherited from NSObject

	readonly maximumRating: number;

	readonly rating: number;

	constructor(o: { rating: number; maximumRating: number; title: string; detail: string; });

	initWithRatingMaximumRatingTitleDetail(rating: number, maximumRating: number, title: string, detail: string): this;
}

declare class CPInformationTemplate extends CPTemplate {

	static alloc(): CPInformationTemplate; // inherited from NSObject

	static new(): CPInformationTemplate; // inherited from NSObject

	actions: NSArray<CPTextButton>;

	items: NSArray<CPInformationItem>;

	readonly layout: CPInformationTemplateLayout;

	title: string;

	constructor(o: { title: string; layout: CPInformationTemplateLayout; items: NSArray<CPInformationItem> | CPInformationItem[]; actions: NSArray<CPTextButton> | CPTextButton[]; });

	initWithTitleLayoutItemsActions(title: string, layout: CPInformationTemplateLayout, items: NSArray<CPInformationItem> | CPInformationItem[], actions: NSArray<CPTextButton> | CPTextButton[]): this;
}

declare const enum CPInformationTemplateLayout {

	Leading = 0,

	TwoColumn = 1
}

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

declare const enum CPInstrumentClusterSetting {

	Unspecified = 0,

	Enabled = 1,

	Disabled = 2,

	UserPreference = 3
}

declare class CPInterfaceController extends NSObject {

	static alloc(): CPInterfaceController; // inherited from NSObject

	static new(): CPInterfaceController; // inherited from NSObject

	readonly carTraitCollection: UITraitCollection;

	delegate: CPInterfaceControllerDelegate;

	prefersDarkUserInterfaceStyle: boolean;

	readonly presentedTemplate: CPTemplate;

	readonly rootTemplate: CPTemplate;

	readonly templates: NSArray<CPTemplate>;

	readonly topTemplate: CPTemplate;

	dismissTemplateAnimated(animated: boolean): void;

	dismissTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	popTemplateAnimated(animated: boolean): void;

	popTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	popToRootTemplateAnimated(animated: boolean): void;

	popToRootTemplateAnimatedCompletion(animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	popToTemplateAnimated(targetTemplate: CPTemplate, animated: boolean): void;

	popToTemplateAnimatedCompletion(targetTemplate: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	presentTemplateAnimated(templateToPresent: CPTemplate, animated: boolean): void;

	presentTemplateAnimatedCompletion(templateToPresent: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	pushTemplateAnimated(templateToPush: CPTemplate, animated: boolean): void;

	pushTemplateAnimatedCompletion(templateToPush: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	setRootTemplateAnimated(rootTemplate: CPTemplate, animated: boolean): void;

	setRootTemplateAnimatedCompletion(rootTemplate: CPTemplate, animated: boolean, completion: (p1: boolean, p2: NSError) => void): void;
}

interface CPInterfaceControllerDelegate extends NSObjectProtocol {

	templateDidAppearAnimated?(aTemplate: CPTemplate, animated: boolean): void;

	templateDidDisappearAnimated?(aTemplate: CPTemplate, animated: boolean): void;

	templateWillAppearAnimated?(aTemplate: CPTemplate, animated: boolean): void;

	templateWillDisappearAnimated?(aTemplate: CPTemplate, animated: boolean): void;
}
declare var CPInterfaceControllerDelegate: {

	prototype: CPInterfaceControllerDelegate;
};

declare const enum CPLimitableUserInterface {

	Keyboard = 1,

	Lists = 2
}

declare class CPListImageRowItem extends NSObject implements CPSelectableListItem {

	static alloc(): CPListImageRowItem; // inherited from NSObject

	static new(): CPListImageRowItem; // inherited from NSObject

	readonly gridImages: NSArray<UIImage>;

	listImageRowHandler: (p1: CPListImageRowItem, p2: number, p3: () => void) => void;

	text: string;

	static readonly maximumImageSize: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	enabled: boolean; // inherited from CPListTemplateItem

	handler: (p1: CPSelectableListItem, p2: () => void) => void; // inherited from CPSelectableListItem

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userInfo: any; // inherited from CPListTemplateItem

	readonly  // inherited from NSObjectProtocol

	constructor(o: { text: string; images: NSArray<UIImage> | UIImage[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTextImages(text: string, images: NSArray<UIImage> | UIImage[]): this;

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

declare class CPListItem extends NSObject implements CPSelectableListItem {

	static alloc(): CPListItem; // inherited from NSObject

	static new(): CPListItem; // inherited from NSObject

	readonly accessoryImage: UIImage;

	accessoryType: CPListItemAccessoryType;

	readonly detailText: string;

	explicitContent: boolean;

	readonly image: UIImage;

	playbackProgress: number;

	playing: boolean;

	playingIndicatorLocation: CPListItemPlayingIndicatorLocation;

	readonly showsDisclosureIndicator: boolean;

	showsExplicitLabel: boolean;

	static readonly maximumImageSize: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

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

	constructor(o: { text: string; detailText: string; image: UIImage; accessoryImage: UIImage; accessoryType: CPListItemAccessoryType; });

	constructor(o: { text: string; detailText: string; image: UIImage; showsDisclosureIndicator: boolean; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTextDetailText(text: string, detailText: string): this;

	initWithTextDetailTextImage(text: string, detailText: string, image: UIImage): this;

	initWithTextDetailTextImageAccessoryImageAccessoryType(text: string, detailText: string, image: UIImage, accessoryImage: UIImage, accessoryType: CPListItemAccessoryType): this;

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

	setAccessoryImage(accessoryImage: UIImage): void;

	setDetailText(detailText: string): void;

	setImage(image: UIImage): void;

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

declare class CPListSection extends NSObject implements NSSecureCoding {

	static alloc(): CPListSection; // inherited from NSObject

	static new(): CPListSection; // inherited from NSObject

	readonly header: string;

	readonly headerButton: CPButton;

	headerImage: UIImage;

	readonly headerSubtitle: string;

	readonly items: NSArray<CPListTemplateItem>;

	readonly sectionIndexTitle: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; });

	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; header: string; headerSubtitle: string; headerImage: UIImage; headerButton: CPButton; sectionIndexTitle: string; });

	constructor(o: { items: NSArray<CPListTemplateItem> | CPListTemplateItem[]; header: string; sectionIndexTitle: string; });

	encodeWithCoder(coder: NSCoder): void;

	indexOfItem(item: CPListTemplateItem): number;

	initWithCoder(coder: NSCoder): this;

	initWithItems(items: NSArray<CPListTemplateItem> | CPListTemplateItem[]): this;

	initWithItemsHeaderHeaderSubtitleHeaderImageHeaderButtonSectionIndexTitle(items: NSArray<CPListTemplateItem> | CPListTemplateItem[], header: string, headerSubtitle: string, headerImage: UIImage, headerButton: CPButton, sectionIndexTitle: string): this;

	initWithItemsHeaderSectionIndexTitle(items: NSArray<CPListTemplateItem> | CPListTemplateItem[], header: string, sectionIndexTitle: string): this;

	itemAtIndex(index: number): CPListTemplateItem;
}

declare class CPListTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPListTemplate; // inherited from NSObject

	static new(): CPListTemplate; // inherited from NSObject

	assistantCellConfiguration: CPAssistantCellConfiguration;

	delegate: CPListTemplateDelegate;

	emptyViewSubtitleVariants: NSArray<string>;

	emptyViewTitleVariants: NSArray<string>;

	readonly itemCount: number;

	readonly sectionCount: number;

	readonly sections: NSArray<CPListSection>;

	readonly title: string;

	static readonly maximumItemCount: number;

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

	constructor(o: { title: string; sections: NSArray<CPListSection> | CPListSection[]; assistantCellConfiguration: CPAssistantCellConfiguration; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	indexPathForItem(item: CPListTemplateItem): NSIndexPath;

	initWithTitleSections(title: string, sections: NSArray<CPListSection> | CPListSection[]): this;

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

interface CPListTemplateDelegate extends NSObjectProtocol {

	listTemplateDidSelectListItemCompletionHandler(listTemplate: CPListTemplate, item: CPListItem, completionHandler: () => void): void;
}
declare var CPListTemplateDelegate: {

	prototype: CPListTemplateDelegate;
};

interface CPListTemplateItem extends NSObjectProtocol {

	enabled: boolean;

	text: string;

	userInfo: any;
}
declare var CPListTemplateItem: {

	prototype: CPListTemplateItem;
};

declare class CPManeuver extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPManeuver; // inherited from NSObject

	static new(): CPManeuver; // inherited from NSObject

	attributedInstructionVariants: NSArray<NSAttributedString>;

	cardBackgroundColor: UIColor;

	dashboardAttributedInstructionVariants: NSArray<NSAttributedString>;

	dashboardInstructionVariants: NSArray<string>;

	dashboardJunctionImage: UIImage;

	dashboardSymbolImage: UIImage;

	initialTravelEstimates: CPTravelEstimates;

	instructionVariants: NSArray<string>;

	junctionImage: UIImage;

	notificationAttributedInstructionVariants: NSArray<NSAttributedString>;

	notificationInstructionVariants: NSArray<string>;

	notificationSymbolImage: UIImage;

	symbolImage: UIImage;

	symbolSet: CPImageSet;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CPManeuverDisplayStyle {

	Default = 0,

	LeadingSymbol = 1,

	TrailingSymbol = 2,

	SymbolOnly = 3,

	InstructionOnly = 4
}

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

	showTripPreviewsSelectedTripTextConfiguration(tripPreviews: NSArray<CPTrip> | CPTrip[], selectedTrip: CPTrip, textConfiguration: CPTripPreviewTextConfiguration): void;

	showTripPreviewsTextConfiguration(tripPreviews: NSArray<CPTrip> | CPTrip[], textConfiguration: CPTripPreviewTextConfiguration): void;

	startNavigationSessionForTrip(trip: CPTrip): CPNavigationSession;

	updateTravelEstimatesForTrip(estimates: CPTravelEstimates, trip: CPTrip): void;

	updateTravelEstimatesForTripWithTimeRemainingColor(estimates: CPTravelEstimates, trip: CPTrip, timeRemainingColor: CPTimeRemainingColor): void;
}

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

declare class CPMessageListItemLeadingConfiguration extends NSObject {

	static alloc(): CPMessageListItemLeadingConfiguration; // inherited from NSObject

	static new(): CPMessageListItemLeadingConfiguration; // inherited from NSObject

	readonly leadingImage: UIImage;

	readonly leadingItem: CPMessageLeadingItem;

	readonly unread: boolean;

	constructor(o: { leadingItem: CPMessageLeadingItem; leadingImage: UIImage; unread: boolean; });

	initWithLeadingItemLeadingImageUnread(leadingItem: CPMessageLeadingItem, leadingImage: UIImage, unread: boolean): this;
}

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

	constructor(o: { titleVariants: NSArray<string> | string[]; subtitleVariants: NSArray<string> | string[]; imageSet: CPImageSet; primaryAction: CPAlertAction; secondaryAction: CPAlertAction; duration: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleVariantsSubtitleVariantsImagePrimaryActionSecondaryActionDuration(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[], image: UIImage, primaryAction: CPAlertAction, secondaryAction: CPAlertAction, duration: number): this;

	initWithTitleVariantsSubtitleVariantsImageSetPrimaryActionSecondaryActionDuration(titleVariants: NSArray<string> | string[], subtitleVariants: NSArray<string> | string[], imageSet: CPImageSet, primaryAction: CPAlertAction, secondaryAction: CPAlertAction, duration: number): this;

	updateTitleVariantsSubtitleVariants(newTitleVariants: NSArray<string> | string[], newSubtitleVariants: NSArray<string> | string[]): void;
}

declare const enum CPNavigationAlertDismissalContext {

	Timeout = 0,

	UserDismissed = 1,

	SystemDismissed = 2
}

declare var CPNavigationAlertMinimumDuration: number;

declare class CPNavigationSession extends NSObject {

	static alloc(): CPNavigationSession; // inherited from NSObject

	static new(): CPNavigationSession; // inherited from NSObject

	readonly trip: CPTrip;

	upcomingManeuvers: NSArray<CPManeuver>;

	cancelTrip(): void;

	finishTrip(): void;

	pauseTripForReasonDescription(reason: CPTripPauseReason, description: string): void;

	pauseTripForReasonDescriptionTurnCardColor(reason: CPTripPauseReason, description: string, turnCardColor: UIColor): void;

	updateTravelEstimatesForManeuver(estimates: CPTravelEstimates, maneuver: CPManeuver): void;
}

declare class CPNowPlayingAddToLibraryButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingAddToLibraryButton; // inherited from NSObject

	static new(): CPNowPlayingAddToLibraryButton; // inherited from NSObject
}

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

declare class CPNowPlayingImageButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingImageButton; // inherited from NSObject

	static new(): CPNowPlayingImageButton; // inherited from NSObject

	readonly image: UIImage;

	constructor(o: { image: UIImage; handler: (p1: CPNowPlayingButton) => void; });

	initWithImageHandler(image: UIImage, handler: (p1: CPNowPlayingButton) => void): this;
}

declare class CPNowPlayingMoreButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingMoreButton; // inherited from NSObject

	static new(): CPNowPlayingMoreButton; // inherited from NSObject
}

declare class CPNowPlayingPlaybackRateButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingPlaybackRateButton; // inherited from NSObject

	static new(): CPNowPlayingPlaybackRateButton; // inherited from NSObject
}

declare class CPNowPlayingRepeatButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingRepeatButton; // inherited from NSObject

	static new(): CPNowPlayingRepeatButton; // inherited from NSObject
}

declare class CPNowPlayingShuffleButton extends CPNowPlayingButton {

	static alloc(): CPNowPlayingShuffleButton; // inherited from NSObject

	static new(): CPNowPlayingShuffleButton; // inherited from NSObject
}

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

interface CPNowPlayingTemplateObserver extends NSObjectProtocol {

	nowPlayingTemplateAlbumArtistButtonTapped?(nowPlayingTemplate: CPNowPlayingTemplate): void;

	nowPlayingTemplateUpNextButtonTapped?(nowPlayingTemplate: CPNowPlayingTemplate): void;
}
declare var CPNowPlayingTemplateObserver: {

	prototype: CPNowPlayingTemplateObserver;
};

declare const enum CPPanDirection {

	None = 0,

	Left = 1,

	Right = 2,

	Up = 4,

	Down = 8
}

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

	subtitle: string;

	summary: string;

	title: string;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { location: MKMapItem; title: string; subtitle: string; summary: string; detailTitle: string; detailSubtitle: string; detailSummary: string; pinImage: UIImage; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocationTitleSubtitleSummaryDetailTitleDetailSubtitleDetailSummaryPinImage(location: MKMapItem, title: string, subtitle: string, summary: string, detailTitle: string, detailSubtitle: string, detailSummary: string, pinImage: UIImage): this;
}

declare class CPPointOfInterestTemplate extends CPTemplate {

	static alloc(): CPPointOfInterestTemplate; // inherited from NSObject

	static new(): CPPointOfInterestTemplate; // inherited from NSObject

	pointOfInterestDelegate: CPPointOfInterestTemplateDelegate;

	readonly pointsOfInterest: NSArray<CPPointOfInterest>;

	selectedIndex: number;

	title: string;

	constructor(o: { title: string; pointsOfInterest: NSArray<CPPointOfInterest> | CPPointOfInterest[]; selectedIndex: number; });

	initWithTitlePointsOfInterestSelectedIndex(title: string, pointsOfInterest: NSArray<CPPointOfInterest> | CPPointOfInterest[], selectedIndex: number): this;

	setPointsOfInterestSelectedIndex(pointsOfInterest: NSArray<CPPointOfInterest> | CPPointOfInterest[], selectedIndex: number): void;
}

interface CPPointOfInterestTemplateDelegate extends NSObjectProtocol {

	pointOfInterestTemplateDidChangeMapRegion(pointOfInterestTemplate: CPPointOfInterestTemplate, region: MKCoordinateRegion): void;

	pointOfInterestTemplateDidSelectPointOfInterest?(pointOfInterestTemplate: CPPointOfInterestTemplate, pointOfInterest: CPPointOfInterest): void;
}
declare var CPPointOfInterestTemplateDelegate: {

	prototype: CPPointOfInterestTemplateDelegate;
};

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

declare class CPSearchTemplate extends CPTemplate {

	static alloc(): CPSearchTemplate; // inherited from NSObject

	static new(): CPSearchTemplate; // inherited from NSObject

	delegate: CPSearchTemplateDelegate;
}

interface CPSearchTemplateDelegate extends NSObjectProtocol {

	searchTemplateSearchButtonPressed?(searchTemplate: CPSearchTemplate): void;

	searchTemplateSelectedResultCompletionHandler(searchTemplate: CPSearchTemplate, item: CPListItem, completionHandler: () => void): void;

	searchTemplateUpdatedSearchTextCompletionHandler(searchTemplate: CPSearchTemplate, searchText: string, completionHandler: (p1: NSArray<CPListItem>) => void): void;
}
declare var CPSearchTemplateDelegate: {

	prototype: CPSearchTemplateDelegate;
};

interface CPSelectableListItem extends CPListTemplateItem {

	handler: (p1: CPSelectableListItem, p2: () => void) => void;
}
declare var CPSelectableListItem: {

	prototype: CPSelectableListItem;
};

declare class CPSessionConfiguration extends NSObject {

	static alloc(): CPSessionConfiguration; // inherited from NSObject

	static new(): CPSessionConfiguration; // inherited from NSObject

	readonly contentStyle: CPContentStyle;

	delegate: CPSessionConfigurationDelegate;

	readonly limitedUserInterfaces: CPLimitableUserInterface;

	constructor(o: { delegate: CPSessionConfigurationDelegate; });

	initWithDelegate(delegate: CPSessionConfigurationDelegate): this;
}

interface CPSessionConfigurationDelegate extends NSObjectProtocol {

	sessionConfigurationContentStyleChanged?(sessionConfiguration: CPSessionConfiguration, contentStyle: CPContentStyle): void;

	sessionConfigurationLimitedUserInterfacesChanged?(sessionConfiguration: CPSessionConfiguration, limitedUserInterfaces: CPLimitableUserInterface): void;
}
declare var CPSessionConfigurationDelegate: {

	prototype: CPSessionConfigurationDelegate;
};

declare class CPTabBarTemplate extends CPTemplate {

	static alloc(): CPTabBarTemplate; // inherited from NSObject

	static new(): CPTabBarTemplate; // inherited from NSObject

	delegate: CPTabBarTemplateDelegate;

	readonly selectedTemplate: CPTemplate;

	readonly templates: NSArray<CPTemplate>;

	static readonly maximumTabCount: number;

	constructor(o: { templates: NSArray<CPTemplate> | CPTemplate[]; });

	initWithTemplates(templates: NSArray<CPTemplate> | CPTemplate[]): this;

	updateTemplates(newTemplates: NSArray<CPTemplate> | CPTemplate[]): void;
}

interface CPTabBarTemplateDelegate extends NSObjectProtocol {

	tabBarTemplateDidSelectTemplate(tabBarTemplate: CPTabBarTemplate, selectedTemplate: CPTemplate): void;
}
declare var CPTabBarTemplateDelegate: {

	prototype: CPTabBarTemplateDelegate;
};

declare class CPTemplate extends NSObject implements NSSecureCoding {

	static alloc(): CPTemplate; // inherited from NSObject

	static new(): CPTemplate; // inherited from NSObject

	showsTabBadge: boolean;

	tabImage: UIImage;

	tabSystemItem: UITabBarSystemItem;

	tabTitle: string;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class CPTemplateApplicationDashboardScene extends UIScene {

	static alloc(): CPTemplateApplicationDashboardScene; // inherited from NSObject

	static new(): CPTemplateApplicationDashboardScene; // inherited from NSObject

	readonly dashboardController: CPDashboardController;

	readonly dashboardWindow: UIWindow;

	delegate: CPTemplateApplicationDashboardSceneDelegate;
}

interface CPTemplateApplicationDashboardSceneDelegate extends UISceneDelegate {

	templateApplicationDashboardSceneDidConnectDashboardControllerToWindow?(templateApplicationDashboardScene: CPTemplateApplicationDashboardScene, dashboardController: CPDashboardController, window: UIWindow): void;

	templateApplicationDashboardSceneDidDisconnectDashboardControllerFromWindow?(templateApplicationDashboardScene: CPTemplateApplicationDashboardScene, dashboardController: CPDashboardController, window: UIWindow): void;
}
declare var CPTemplateApplicationDashboardSceneDelegate: {

	prototype: CPTemplateApplicationDashboardSceneDelegate;
};

declare var CPTemplateApplicationDashboardSceneSessionRoleApplication: string;

declare class CPTemplateApplicationInstrumentClusterScene extends UIScene {

	static alloc(): CPTemplateApplicationInstrumentClusterScene; // inherited from NSObject

	static new(): CPTemplateApplicationInstrumentClusterScene; // inherited from NSObject

	readonly contentStyle: UIUserInterfaceStyle;

	delegate: CPTemplateApplicationInstrumentClusterSceneDelegate;

	readonly instrumentClusterController: CPInstrumentClusterController;
}

interface CPTemplateApplicationInstrumentClusterSceneDelegate extends UISceneDelegate {

	contentStyleDidChange?(contentStyle: UIUserInterfaceStyle): void;

	templateApplicationInstrumentClusterSceneDidConnectInstrumentClusterController?(templateApplicationInstrumentClusterScene: CPTemplateApplicationInstrumentClusterScene, instrumentClusterController: CPInstrumentClusterController): void;

	templateApplicationInstrumentClusterSceneDidDisconnectInstrumentClusterController?(templateApplicationInstrumentClusterScene: CPTemplateApplicationInstrumentClusterScene, instrumentClusterController: CPInstrumentClusterController): void;
}
declare var CPTemplateApplicationInstrumentClusterSceneDelegate: {

	prototype: CPTemplateApplicationInstrumentClusterSceneDelegate;
};

declare var CPTemplateApplicationInstrumentClusterSceneSessionRoleApplication: string;

declare class CPTemplateApplicationScene extends UIScene {

	static alloc(): CPTemplateApplicationScene; // inherited from NSObject

	static new(): CPTemplateApplicationScene; // inherited from NSObject

	readonly carWindow: CPWindow;

	readonly contentStyle: UIUserInterfaceStyle;

	delegate: CPTemplateApplicationSceneDelegate;

	readonly interfaceController: CPInterfaceController;
}

interface CPTemplateApplicationSceneDelegate extends UISceneDelegate {

	contentStyleDidChange?(contentStyle: UIUserInterfaceStyle): void;

	templateApplicationSceneDidConnectInterfaceController?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController): void;

	templateApplicationSceneDidConnectInterfaceControllerToWindow?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController, window: CPWindow): void;

	templateApplicationSceneDidDisconnectInterfaceController?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController): void;

	templateApplicationSceneDidDisconnectInterfaceControllerFromWindow?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController, window: CPWindow): void;

	templateApplicationSceneDidSelectManeuver?(templateApplicationScene: CPTemplateApplicationScene, maneuver: CPManeuver): void;

	templateApplicationSceneDidSelectNavigationAlert?(templateApplicationScene: CPTemplateApplicationScene, navigationAlert: CPNavigationAlert): void;
}
declare var CPTemplateApplicationSceneDelegate: {

	prototype: CPTemplateApplicationSceneDelegate;
};

declare var CPTemplateApplicationSceneSessionRoleApplication: string;

declare class CPTextButton extends NSObject {

	static alloc(): CPTextButton; // inherited from NSObject

	static new(): CPTextButton; // inherited from NSObject

	textStyle: CPTextButtonStyle;

	title: string;

	constructor(o: { title: string; textStyle: CPTextButtonStyle; handler: (p1: CPTextButton) => void; });

	initWithTitleTextStyleHandler(title: string, textStyle: CPTextButtonStyle, handler: (p1: CPTextButton) => void): this;
}

declare const enum CPTextButtonStyle {

	Normal = 0,

	Cancel = 1,

	Confirm = 2
}

declare const enum CPTimeRemainingColor {

	Default = 0,

	Green = 1,

	Orange = 2,

	Red = 3
}

declare class CPTravelEstimates extends NSObject implements NSSecureCoding {

	static alloc(): CPTravelEstimates; // inherited from NSObject

	static new(): CPTravelEstimates; // inherited from NSObject

	readonly distanceRemaining: NSMeasurement<NSUnitLength>;

	readonly timeRemaining: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { distanceRemaining: NSMeasurement<NSUnitLength>; timeRemaining: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDistanceRemainingTimeRemaining(distance: NSMeasurement<NSUnitLength>, time: number): this;
}

declare class CPTrip extends NSObject implements NSSecureCoding {

	static alloc(): CPTrip; // inherited from NSObject

	static new(): CPTrip; // inherited from NSObject

	readonly destination: MKMapItem;

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

declare const enum CPTripEstimateStyle {

	Light = 0,

	Dark = 1
}

declare const enum CPTripPauseReason {

	Arrived = 1,

	Loading = 2,

	Locating = 3,

	Rerouting = 4,

	ProceedToRoute = 5
}

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

declare class CPVoiceControlTemplate extends CPTemplate {

	static alloc(): CPVoiceControlTemplate; // inherited from NSObject

	static new(): CPVoiceControlTemplate; // inherited from NSObject

	readonly activeStateIdentifier: string;

	readonly voiceControlStates: NSArray<CPVoiceControlState>;

	constructor(o: { voiceControlStates: NSArray<CPVoiceControlState> | CPVoiceControlState[]; });

	activateVoiceControlStateWithIdentifier(identifier: string): void;

	initWithVoiceControlStates(voiceControlStates: NSArray<CPVoiceControlState> | CPVoiceControlState[]): this;
}

declare class CPWindow extends UIWindow {

	static alloc(): CPWindow; // inherited from NSObject

	static appearance(): CPWindow; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): CPWindow; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): CPWindow; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CPWindow; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): CPWindow; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): CPWindow; // inherited from UIAppearance

	static new(): CPWindow; // inherited from NSObject

	readonly mapButtonSafeAreaLayoutGuide: UILayoutGuide;

	templateApplicationScene: CPTemplateApplicationScene;
}

declare var CarPlayErrorDomain: string;
