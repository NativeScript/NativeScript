
declare const enum ADAdType {

	Banner = 0,

	MediumRectangle = 1
}

declare var ADBannerContentSizeIdentifier320x50: string;

declare var ADBannerContentSizeIdentifier480x32: string;

declare var ADBannerContentSizeIdentifierLandscape: string;

declare var ADBannerContentSizeIdentifierPortrait: string;

declare class ADBannerView extends UIView {

	static appearance(): ADBannerView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): ADBannerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ADBannerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject>): ADBannerView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ADBannerView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject>): ADBannerView; // inherited from UIAppearance

	static sizeFromBannerContentSizeIdentifier(contentSizeIdentifier: string): CGSize;

	/* readonly */ adType: ADAdType;

	advertisingSection: string;

	/* readonly */ bannerLoaded: boolean;

	/* readonly */ bannerViewActionInProgress: boolean;

	currentContentSizeIdentifier: string;

	delegate: ADBannerViewDelegate;

	requiredContentSizeIdentifiers: NSSet<any>;

	constructor(o: { adType: ADAdType; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { frame: CGRect; }); // inherited from UIView

	cancelBannerViewAction(): void;

	self(): ADBannerView; // inherited from NSObjectProtocol
}

interface ADBannerViewDelegate extends NSObjectProtocol {

	bannerViewActionDidFinish?(banner: ADBannerView): void;

	bannerViewActionShouldBeginWillLeaveApplication?(banner: ADBannerView, willLeave: boolean): boolean;

	bannerViewDidFailToReceiveAdWithError?(banner: ADBannerView, error: NSError): void;

	bannerViewDidLoadAd?(banner: ADBannerView): void;

	bannerViewWillLoadAd?(banner: ADBannerView): void;
}
declare var ADBannerViewDelegate: {

	prototype: ADBannerViewDelegate;
};

declare class ADClient extends NSObject {

	static alloc(): ADClient; // inherited from NSObject

	static new(): ADClient; // inherited from NSObject

	static sharedClient(): ADClient;

	constructor(); // inherited from NSObject

	addClientToSegmentsReplaceExisting(segmentIdentifiers: NSArray<any>, replaceExisting: boolean): void;

	determineAppInstallationAttributionWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	lookupAdConversionDetails(completionHandler: (p1: Date, p2: Date) => void): void;

	requestAttributionDetailsWithBlock(completionHandler: (p1: NSDictionary<any, any>, p2: NSError) => void): void;

	self(): ADClient; // inherited from NSObjectProtocol
}

declare const enum ADClientError {

	Unknown = 0,

	LimitAdTracking = 1
}

declare var ADClientErrorDomain: string;

declare const enum ADError {

	Unknown = 0,

	ServerFailure = 1,

	LoadingThrottled = 2,

	InventoryUnavailable = 3,

	ConfigurationError = 4,

	BannerVisibleWithoutContent = 5,

	ApplicationInactive = 6,

	AdUnloaded = 7,

	AssetLoadFailure = 8
}

declare var ADErrorDomain: string;

declare class ADInterstitialAd extends NSObject {

	static alloc(): ADInterstitialAd; // inherited from NSObject

	static new(): ADInterstitialAd; // inherited from NSObject

	/* readonly */ actionInProgress: boolean;

	delegate: ADInterstitialAdDelegate;

	/* readonly */ loaded: boolean;

	constructor(); // inherited from NSObject

	cancelAction(): void;

	presentFromViewController(viewController: UIViewController): void;

	presentInView(containerView: UIView): boolean;

	self(): ADInterstitialAd; // inherited from NSObjectProtocol
}

interface ADInterstitialAdDelegate extends NSObjectProtocol {

	interstitialAdActionDidFinish?(interstitialAd: ADInterstitialAd): void;

	interstitialAdActionShouldBeginWillLeaveApplication?(interstitialAd: ADInterstitialAd, willLeave: boolean): boolean;

	interstitialAdDidFailWithError(interstitialAd: ADInterstitialAd, error: NSError): void;

	interstitialAdDidLoad?(interstitialAd: ADInterstitialAd): void;

	interstitialAdDidUnload(interstitialAd: ADInterstitialAd): void;

	interstitialAdWillLoad?(interstitialAd: ADInterstitialAd): void;
}
declare var ADInterstitialAdDelegate: {

	prototype: ADInterstitialAdDelegate;
};

declare const enum ADInterstitialPresentationPolicy {

	None = 0,

	Automatic = 1,

	Manual = 2
}
