
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

declare class CPBarButton extends NSObject implements NSSecureCoding {

	static alloc(): CPBarButton; // inherited from NSObject

	static new(): CPBarButton; // inherited from NSObject

	readonly buttonType: CPBarButtonType;

	enabled: boolean;

	image: UIImage;

	title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { type: CPBarButtonType; handler: (p1: CPBarButton) => void; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

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

declare const enum CPBarButtonType {

	Text = 0,

	Image = 1
}

declare const enum CPContentStyle {

	Light = 1,

	Dark = 2
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
}

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

declare class CPInterfaceController extends NSObject {

	static alloc(): CPInterfaceController; // inherited from NSObject

	static new(): CPInterfaceController; // inherited from NSObject

	delegate: CPInterfaceControllerDelegate;

	prefersDarkUserInterfaceStyle: boolean;

	readonly presentedTemplate: CPTemplate;

	readonly rootTemplate: CPTemplate;

	readonly templates: NSArray<CPTemplate>;

	readonly topTemplate: CPTemplate;

	dismissTemplateAnimated(animated: boolean): void;

	popTemplateAnimated(animated: boolean): void;

	popToRootTemplateAnimated(animated: boolean): void;

	popToTemplateAnimated(targetTemplate: CPTemplate, animated: boolean): void;

	presentTemplateAnimated(templateToPresent: CPTemplate, animated: boolean): void;

	pushTemplateAnimated(templateToPush: CPTemplate, animated: boolean): void;

	setRootTemplateAnimated(rootTemplate: CPTemplate, animated: boolean): void;
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

declare class CPListItem extends NSObject implements NSSecureCoding {

	static alloc(): CPListItem; // inherited from NSObject

	static new(): CPListItem; // inherited from NSObject

	readonly detailText: string;

	readonly image: UIImage;

	readonly showsDisclosureIndicator: boolean;

	readonly text: string;

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { text: string; detailText: string; });

	constructor(o: { text: string; detailText: string; image: UIImage; });

	constructor(o: { text: string; detailText: string; image: UIImage; showsDisclosureIndicator: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTextDetailText(text: string, detailText: string): this;

	initWithTextDetailTextImage(text: string, detailText: string, image: UIImage): this;

	initWithTextDetailTextImageShowsDisclosureIndicator(text: string, detailText: string, image: UIImage, showsDisclosureIndicator: boolean): this;
}

declare class CPListSection extends NSObject implements NSSecureCoding {

	static alloc(): CPListSection; // inherited from NSObject

	static new(): CPListSection; // inherited from NSObject

	readonly header: string;

	readonly items: NSArray<CPListItem>;

	readonly sectionIndexTitle: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { items: NSArray<CPListItem> | CPListItem[]; });

	constructor(o: { items: NSArray<CPListItem> | CPListItem[]; header: string; sectionIndexTitle: string; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItems(items: NSArray<CPListItem> | CPListItem[]): this;

	initWithItemsHeaderSectionIndexTitle(items: NSArray<CPListItem> | CPListItem[], header: string, sectionIndexTitle: string): this;
}

declare class CPListTemplate extends CPTemplate implements CPBarButtonProviding {

	static alloc(): CPListTemplate; // inherited from NSObject

	static new(): CPListTemplate; // inherited from NSObject

	delegate: CPListTemplateDelegate;

	readonly sections: NSArray<CPListSection>;

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

	constructor(o: { title: string; sections: NSArray<CPListSection> | CPListSection[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithTitleSections(title: string, sections: NSArray<CPListSection> | CPListSection[]): this;

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

declare class CPManeuver extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CPManeuver; // inherited from NSObject

	static new(): CPManeuver; // inherited from NSObject

	attributedInstructionVariants: NSArray<NSAttributedString>;

	initialTravelEstimates: CPTravelEstimates;

	instructionVariants: NSArray<string>;

	junctionImage: UIImage;

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

declare var CPMaximumListItemImageSize: CGSize;

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

	updateTravelEstimatesForManeuver(estimates: CPTravelEstimates, maneuver: CPManeuver): void;
}

declare const enum CPPanDirection {

	None = 0,

	Left = 1,

	Right = 2,

	Up = 4,

	Down = 8
}

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

declare class CPTemplate extends NSObject implements NSSecureCoding {

	static alloc(): CPTemplate; // inherited from NSObject

	static new(): CPTemplate; // inherited from NSObject

	userInfo: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class CPTemplateApplicationScene extends UIScene {

	static alloc(): CPTemplateApplicationScene; // inherited from NSObject

	static new(): CPTemplateApplicationScene; // inherited from NSObject

	readonly carWindow: CPWindow;

	delegate: CPTemplateApplicationSceneDelegate;

	readonly interfaceController: CPInterfaceController;
}

interface CPTemplateApplicationSceneDelegate extends UISceneDelegate {

	templateApplicationSceneDidConnectInterfaceControllerToWindow?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController, window: CPWindow): void;

	templateApplicationSceneDidDisconnectInterfaceControllerFromWindow?(templateApplicationScene: CPTemplateApplicationScene, interfaceController: CPInterfaceController, window: CPWindow): void;

	templateApplicationSceneDidSelectManeuver?(templateApplicationScene: CPTemplateApplicationScene, maneuver: CPManeuver): void;

	templateApplicationSceneDidSelectNavigationAlert?(templateApplicationScene: CPTemplateApplicationScene, navigationAlert: CPNavigationAlert): void;
}
declare var CPTemplateApplicationSceneDelegate: {

	prototype: CPTemplateApplicationSceneDelegate;
};

declare var CPTemplateApplicationSceneSessionRoleApplication: string;

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
