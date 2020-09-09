
declare const enum ADAdType {

	Banner = 0,

	MediumRectangle = 1
}

declare var ADBannerContentSizeIdentifier320x50: string;

declare var ADBannerContentSizeIdentifier480x32: string;

declare var ADBannerContentSizeIdentifierLandscape: string;

declare var ADBannerContentSizeIdentifierPortrait: string;

declare class ADBannerView extends UIView {

	static alloc(): ADBannerView; // inherited from NSObject

	static appearance(): ADBannerView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): ADBannerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ADBannerView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ADBannerView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ADBannerView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ADBannerView; // inherited from UIAppearance

	static new(): ADBannerView; // inherited from NSObject

	static sizeFromBannerContentSizeIdentifier(contentSizeIdentifier: string): CGSize;

	readonly adType: ADAdType;

	advertisingSection: string;

	readonly bannerLoaded: boolean;

	readonly bannerViewActionInProgress: boolean;

	currentContentSizeIdentifier: string;

	delegate: ADBannerViewDelegate;

	requiredContentSizeIdentifiers: NSSet<any>;

	constructor(o: { adType: ADAdType; });

	cancelBannerViewAction(): void;

	initWithAdType(type: ADAdType): this;
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

declare function ADClampedBannerSize(size: CGSize): CGSize;

declare class ADClient extends NSObject {

	static alloc(): ADClient; // inherited from NSObject

	static new(): ADClient; // inherited from NSObject

	static sharedClient(): ADClient;

	addClientToSegmentsReplaceExisting(segmentIdentifiers: NSArray<string> | string[], replaceExisting: boolean): void;

	determineAppInstallationAttributionWithCompletionHandler(completionHandler: (p1: boolean) => void): void;

	lookupAdConversionDetails(completionHandler: (p1: Date, p2: Date) => void): void;

	requestAttributionDetailsWithBlock(completionHandler: (p1: NSDictionary<string, NSObject>, p2: NSError) => void): void;
}

declare const enum ADClientError {

	Unknown = 0,

	LimitAdTracking = 1,

	MissingData = 2,

	CorruptResponse = 3
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

	AssetLoadFailure = 8,

	AdResponseValidateFailure = 9,

	AdAssetLoadPending = 10
}

declare var ADErrorDomain: string;

declare class ADInterstitialAd extends NSObject {

	static alloc(): ADInterstitialAd; // inherited from NSObject

	static new(): ADInterstitialAd; // inherited from NSObject

	readonly actionInProgress: boolean;

	delegate: ADInterstitialAdDelegate;

	readonly loaded: boolean;

	cancelAction(): void;

	presentFromViewController(viewController: UIViewController): void;

	presentInView(containerView: UIView): boolean;
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

declare class ADInterstitialAdPresentationViewController extends UIViewController {

	static alloc(): ADInterstitialAdPresentationViewController; // inherited from NSObject

	static new(): ADInterstitialAdPresentationViewController; // inherited from NSObject

	constructor(o: { forInterstitialAd: ADInterstitialAd; });

	initForInterstitialAd(interstitialAd: ADInterstitialAd): this;

	shouldTestVisibilityAtPoint(point: CGPoint): boolean;
}

declare const enum ADInterstitialPresentationPolicy {

	None = 0,

	Automatic = 1,

	Manual = 2
}
