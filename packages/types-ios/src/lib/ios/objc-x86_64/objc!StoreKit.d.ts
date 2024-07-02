
/**
 * @since 15.4
 */
declare const enum SKANError {

	ImpressionMissingRequiredValue = 0,

	Unsupported = 1,

	AdNetworkIdMissing = 2,

	MismatchedSourceAppId = 3,

	ImpressionNotFound = 4,

	InvalidCampaignId = 5,

	InvalidConversionValue = 6,

	InvalidSourceAppId = 7,

	InvalidAdvertisedAppId = 8,

	InvalidVersion = 9,

	Unknown = 10,

	ImpressionTooShort = 11
}

/**
 * @since 15.4
 */
declare var SKANErrorDomain: string;

/**
 * @since 14.5
 */
declare class SKAdImpression extends NSObject {

	static alloc(): SKAdImpression; // inherited from NSObject

	static new(): SKAdImpression; // inherited from NSObject

	adCampaignIdentifier: number;

	adDescription: string;

	adImpressionIdentifier: string;

	adNetworkIdentifier: string;

	adPurchaserName: string;

	adType: string;

	advertisedAppStoreItemIdentifier: number;

	signature: string;

	sourceAppStoreItemIdentifier: number;

	/**
	 * @since 16.1
	 */
	sourceIdentifier: number;

	timestamp: number;

	version: string;

	/**
	 * @since 16.0
	 */
	constructor(o: { sourceAppStoreItemIdentifier: number; advertisedAppStoreItemIdentifier: number; adNetworkIdentifier: string; adCampaignIdentifier: number; adImpressionIdentifier: string; timestamp: number; signature: string; version: string; });

	/**
	 * @since 16.0
	 */
	initWithSourceAppStoreItemIdentifierAdvertisedAppStoreItemIdentifierAdNetworkIdentifierAdCampaignIdentifierAdImpressionIdentifierTimestampSignatureVersion(sourceAppStoreItemIdentifier: number, advertisedAppStoreItemIdentifier: number, adNetworkIdentifier: string, adCampaignIdentifier: number, adImpressionIdentifier: string, timestamp: number, signature: string, version: string): this;
}

/**
 * @since 11.3
 */
declare class SKAdNetwork extends NSObject {

	static alloc(): SKAdNetwork; // inherited from NSObject

	/**
	 * @since 14.5
	 */
	static endImpressionCompletionHandler(impression: SKAdImpression, completion: (p1: NSError) => void): void;

	static new(): SKAdNetwork; // inherited from NSObject

	/**
	 * @since 11.3
	 * @deprecated 15.4
	 */
	static registerAppForAdNetworkAttribution(): void;

	/**
	 * @since 14.5
	 */
	static startImpressionCompletionHandler(impression: SKAdImpression, completion: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 * @deprecated 15.4
	 */
	static updateConversionValue(conversionValue: number): void;

	/**
	 * @since 16.1
	 */
	static updatePostbackConversionValueCoarseValueCompletionHandler(fineValue: number, coarseValue: string, completion: (p1: NSError) => void): void;

	/**
	 * @since 16.1
	 */
	static updatePostbackConversionValueCoarseValueLockWindowCompletionHandler(fineValue: number, coarseValue: string, lockWindow: boolean, completion: (p1: NSError) => void): void;

	/**
	 * @since 15.4
	 */
	static updatePostbackConversionValueCompletionHandler(conversionValue: number, completion: (p1: NSError) => void): void;
}

/**
 * @since 16.1
 */
declare var SKAdNetworkCoarseConversionValueHigh: string;

/**
 * @since 16.1
 */
declare var SKAdNetworkCoarseConversionValueLow: string;

/**
 * @since 16.1
 */
declare var SKAdNetworkCoarseConversionValueMedium: string;

/**
 * @since 13.0
 */
declare class SKArcadeService extends NSObject {

	static alloc(): SKArcadeService; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static arcadeSubscriptionStatusWithNonceResultHandler(nonce: number, resultHandler: (p1: NSData, p2: number, p3: NSData, p4: number, p5: NSError) => void): void;

	static new(): SKArcadeService; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static registerArcadeAppWithRandomFromLibRandomFromLibLengthResultHandler(randomFromLib: NSData, randomFromLibLength: number, resultHandler: (p1: NSData, p2: number, p3: NSData, p4: number, p5: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	static repairArcadeApp(): void;
}

/**
 * @since 9.3
 * @deprecated 18.0
 */
declare const enum SKCloudServiceAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Restricted = 2,

	Authorized = 3
}

/**
 * @since 9.3
 * @deprecated 18.0
 */
declare var SKCloudServiceCapabilitiesDidChangeNotification: string;

/**
 * @since 9.3
 * @deprecated 18.0
 */
declare const enum SKCloudServiceCapability {

	None = 0,

	MusicCatalogPlayback = 1,

	MusicCatalogSubscriptionEligible = 2,

	AddToCloudMusicLibrary = 256
}

/**
 * @since 9.3
 * @deprecated 18.0
 */
declare class SKCloudServiceController extends NSObject {

	static alloc(): SKCloudServiceController; // inherited from NSObject

	/**
	 * @since 9.3
	 * @deprecated 18.0
	 */
	static authorizationStatus(): SKCloudServiceAuthorizationStatus;

	static new(): SKCloudServiceController; // inherited from NSObject

	/**
	 * @since 9.3
	 * @deprecated 18.0
	 */
	static requestAuthorization(completionHandler: (p1: SKCloudServiceAuthorizationStatus) => void): void;

	/**
	 * @since 9.3
	 * @deprecated 18.0
	 */
	requestCapabilitiesWithCompletionHandler(completionHandler: (p1: SKCloudServiceCapability, p2: NSError) => void): void;

	/**
	 * @since 10.3
	 * @deprecated 11.0
	 */
	requestPersonalizationTokenForClientTokenWithCompletionHandler(clientToken: string, completionHandler: (p1: string, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	requestStorefrontCountryCodeWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;

	/**
	 * @since 9.3
	 * @deprecated 18.0
	 */
	requestStorefrontIdentifierWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	requestUserTokenForDeveloperTokenCompletionHandler(developerToken: string, completionHandler: (p1: string, p2: NSError) => void): void;
}

/**
 * @since 10.1
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupActionSubscribe: string;

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupMessageIdentifierAddMusic: string;

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupMessageIdentifierConnect: string;

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupMessageIdentifierJoin: string;

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupMessageIdentifierPlayMusic: string;

/**
 * @since 10.1
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupOptionsActionKey: string;

/**
 * @since 10.3
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupOptionsAffiliateTokenKey: string;

/**
 * @since 10.3
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupOptionsCampaignTokenKey: string;

/**
 * @since 10.1
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupOptionsITunesItemIdentifierKey: string;

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare var SKCloudServiceSetupOptionsMessageIdentifierKey: string;

/**
 * @since 10.1
 * @deprecated 18.0
 */
declare class SKCloudServiceSetupViewController extends UIViewController {

	static alloc(): SKCloudServiceSetupViewController; // inherited from NSObject

	static new(): SKCloudServiceSetupViewController; // inherited from NSObject

	delegate: SKCloudServiceSetupViewControllerDelegate;

	loadWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 10.1
 * @deprecated 18.0
 */
interface SKCloudServiceSetupViewControllerDelegate extends NSObjectProtocol {

	cloudServiceSetupViewControllerDidDismiss?(cloudServiceSetupViewController: SKCloudServiceSetupViewController): void;
}
declare var SKCloudServiceSetupViewControllerDelegate: {

	prototype: SKCloudServiceSetupViewControllerDelegate;
};

/**
 * @since 6.0
 * @deprecated 16.0
 */
declare class SKDownload extends NSObject {

	static alloc(): SKDownload; // inherited from NSObject

	static new(): SKDownload; // inherited from NSObject

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly contentIdentifier: string;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	readonly contentLength: number;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly contentURL: NSURL;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly contentVersion: string;

	/**
	 * @since 6.0
	 * @deprecated 12.0
	 */
	readonly downloadState: SKDownloadState;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly error: NSError;

	/**
	 * @since 13.0
	 * @deprecated 16.0
	 */
	readonly expectedContentLength: number;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly progress: number;

	/**
	 * @since 12.0
	 * @deprecated 16.0
	 */
	readonly state: SKDownloadState;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly timeRemaining: number;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly transaction: SKPaymentTransaction;
}

/**
 * @since 6.0
 * @deprecated 16.0
 */
declare const enum SKDownloadState {

	Waiting = 0,

	Active = 1,

	Paused = 2,

	Finished = 3,

	Failed = 4,

	Cancelled = 5
}

/**
 * @since 6.0
 * @deprecated 16.0
 */
declare var SKDownloadTimeRemainingUnknown: number;

/**
 * @since 3.0
 */
declare const enum SKErrorCode {

	Unknown = 0,

	ClientInvalid = 1,

	PaymentCancelled = 2,

	PaymentInvalid = 3,

	PaymentNotAllowed = 4,

	StoreProductNotAvailable = 5,

	CloudServicePermissionDenied = 6,

	CloudServiceNetworkConnectionFailed = 7,

	CloudServiceRevoked = 8,

	PrivacyAcknowledgementRequired = 9,

	UnauthorizedRequestData = 10,

	InvalidOfferIdentifier = 11,

	InvalidSignature = 12,

	MissingOfferParams = 13,

	InvalidOfferPrice = 14,

	OverlayCancelled = 15,

	OverlayInvalidConfiguration = 16,

	OverlayTimeout = 17,

	IneligibleForOffer = 18,

	UnsupportedPlatform = 19,

	OverlayPresentedInBackgroundScene = 20
}

/**
 * @since 3.0
 */
declare var SKErrorDomain: string;

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKMutablePayment extends SKPayment {

	static alloc(): SKMutablePayment; // inherited from NSObject

	static new(): SKMutablePayment; // inherited from NSObject

	static paymentWithProduct(product: SKProduct): SKMutablePayment; // inherited from SKPayment

	/**
	 * @since 7.0
	 * @deprecated 18.0
	 */
	applicationUsername: string;

	/**
	 * @since 12.2
	 * @deprecated 18.0
	 */
	paymentDiscount: SKPaymentDiscount;

	productIdentifier: string;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	quantity: number;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	requestData: NSData;

	/**
	 * @since 8.3
	 * @deprecated 18.0
	 */
	simulatesAskToBuyInSandbox: boolean;
}

/**
 * @since 14.0
 */
declare class SKOverlay extends NSObject {

	static alloc(): SKOverlay; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static dismissOverlayInScene(scene: UIWindowScene): void;

	static new(): SKOverlay; // inherited from NSObject

	readonly configuration: SKOverlayConfiguration;

	delegate: SKOverlayDelegate;

	constructor(o: { configuration: SKOverlayConfiguration; });

	initWithConfiguration(configuration: SKOverlayConfiguration): this;

	/**
	 * @since 14.0
	 */
	presentInScene(scene: UIWindowScene): void;
}

/**
 * @since 14.0
 */
declare class SKOverlayAppClipConfiguration extends SKOverlayConfiguration {

	static alloc(): SKOverlayAppClipConfiguration; // inherited from NSObject

	static new(): SKOverlayAppClipConfiguration; // inherited from NSObject

	campaignToken: string;

	/**
	 * @since 15.0
	 */
	customProductPageIdentifier: string;

	/**
	 * @since 15.0
	 */
	latestReleaseID: string;

	position: SKOverlayPosition;

	providerToken: string;

	constructor(o: { position: SKOverlayPosition; });

	additionalValueForKey(key: string): any;

	initWithPosition(position: SKOverlayPosition): this;

	setAdditionalValueForKey(value: any, key: string): void;
}

/**
 * @since 14.0
 */
declare class SKOverlayAppConfiguration extends SKOverlayConfiguration {

	static alloc(): SKOverlayAppConfiguration; // inherited from NSObject

	static new(): SKOverlayAppConfiguration; // inherited from NSObject

	appIdentifier: string;

	campaignToken: string;

	/**
	 * @since 15.0
	 */
	customProductPageIdentifier: string;

	/**
	 * @since 15.0
	 */
	latestReleaseID: string;

	position: SKOverlayPosition;

	providerToken: string;

	userDismissible: boolean;

	constructor(o: { appIdentifier: string; position: SKOverlayPosition; });

	additionalValueForKey(key: string): any;

	initWithAppIdentifierPosition(appIdentifier: string, position: SKOverlayPosition): this;

	/**
	 * @since 16.0
	 */
	setAdImpression(impression: SKAdImpression): void;

	setAdditionalValueForKey(value: any, key: string): void;
}

/**
 * @since 14.0
 */
declare class SKOverlayConfiguration extends NSObject {

	static alloc(): SKOverlayConfiguration; // inherited from NSObject

	static new(): SKOverlayConfiguration; // inherited from NSObject
}

/**
 * @since 14.0
 */
interface SKOverlayDelegate extends NSObjectProtocol {

	storeOverlayDidFailToLoadWithError?(overlay: SKOverlay, error: NSError): void;

	storeOverlayDidFinishDismissal?(overlay: SKOverlay, transitionContext: SKOverlayTransitionContext): void;

	storeOverlayDidFinishPresentation?(overlay: SKOverlay, transitionContext: SKOverlayTransitionContext): void;

	storeOverlayWillStartDismissal?(overlay: SKOverlay, transitionContext: SKOverlayTransitionContext): void;

	storeOverlayWillStartPresentation?(overlay: SKOverlay, transitionContext: SKOverlayTransitionContext): void;
}
declare var SKOverlayDelegate: {

	prototype: SKOverlayDelegate;
};

/**
 * @since 14.0
 */
declare const enum SKOverlayPosition {

	Bottom = 0,

	BottomRaised = 1
}

/**
 * @since 14.0
 */
declare class SKOverlayTransitionContext extends NSObject {

	static alloc(): SKOverlayTransitionContext; // inherited from NSObject

	static new(): SKOverlayTransitionContext; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly endFrame: CGRect;

	/**
	 * @since 14.0
	 */
	readonly startFrame: CGRect;

	/**
	 * @since 14.0
	 */
	addAnimationBlock(block: () => void): void;
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKPayment extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): SKPayment; // inherited from NSObject

	static new(): SKPayment; // inherited from NSObject

	static paymentWithProduct(product: SKProduct): SKPayment;

	/**
	 * @since 3.0
	 * @deprecated 5.0
	 */
	static paymentWithProductIdentifier(identifier: string): any;

	/**
	 * @since 7.0
	 * @deprecated 18.0
	 */
	readonly applicationUsername: string;

	/**
	 * @since 12.2
	 * @deprecated 18.0
	 */
	readonly paymentDiscount: SKPaymentDiscount;

	readonly productIdentifier: string;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly quantity: number;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly requestData: NSData;

	/**
	 * @since 8.3
	 * @deprecated 18.0
	 */
	readonly simulatesAskToBuyInSandbox: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 12.2
 * @deprecated 18.0
 */
declare class SKPaymentDiscount extends NSObject {

	static alloc(): SKPaymentDiscount; // inherited from NSObject

	static new(): SKPaymentDiscount; // inherited from NSObject

	readonly identifier: string;

	readonly keyIdentifier: string;

	readonly nonce: NSUUID;

	readonly signature: string;

	readonly timestamp: number;

	constructor(o: { identifier: string; keyIdentifier: string; nonce: NSUUID; signature: string; timestamp: number; });

	initWithIdentifierKeyIdentifierNonceSignatureTimestamp(identifier: string, keyIdentifier: string, nonce: NSUUID, signature: string, timestamp: number): this;
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKPaymentQueue extends NSObject {

	static alloc(): SKPaymentQueue; // inherited from NSObject

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	static canMakePayments(): boolean;

	static defaultQueue(): SKPaymentQueue;

	static new(): SKPaymentQueue; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	delegate: SKPaymentQueueDelegate;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	readonly storefront: SKStorefront;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	readonly transactionObservers: NSArray<SKPaymentTransactionObserver>;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly transactions: NSArray<SKPaymentTransaction>;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	addPayment(payment: SKPayment): void;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	addTransactionObserver(observer: SKPaymentTransactionObserver): void;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	cancelDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	finishTransaction(transaction: SKPaymentTransaction): void;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	pauseDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	presentCodeRedemptionSheet(): void;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	removeTransactionObserver(observer: SKPaymentTransactionObserver): void;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	restoreCompletedTransactions(): void;

	/**
	 * @since 7.0
	 * @deprecated 18.0
	 */
	restoreCompletedTransactionsWithApplicationUsername(username: string): void;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	resumeDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;

	/**
	 * @since 13.4
	 * @deprecated 18.0
	 */
	showPriceConsentIfNeeded(): void;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	startDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;
}

/**
 * @since 13.0
 * @deprecated 18.0
 */
interface SKPaymentQueueDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	paymentQueueShouldContinueTransactionInStorefront?(paymentQueue: SKPaymentQueue, transaction: SKPaymentTransaction, newStorefront: SKStorefront): boolean;

	/**
	 * @since 13.4
	 * @deprecated 18.0
	 */
	paymentQueueShouldShowPriceConsent?(paymentQueue: SKPaymentQueue): boolean;
}
declare var SKPaymentQueueDelegate: {

	prototype: SKPaymentQueueDelegate;
};

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKPaymentTransaction extends NSObject {

	static alloc(): SKPaymentTransaction; // inherited from NSObject

	static new(): SKPaymentTransaction; // inherited from NSObject

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly downloads: NSArray<SKDownload>;

	readonly error: NSError;

	readonly originalTransaction: SKPaymentTransaction;

	readonly payment: SKPayment;

	readonly transactionDate: Date;

	readonly transactionIdentifier: string;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	readonly transactionReceipt: NSData;

	readonly transactionState: SKPaymentTransactionState;
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
interface SKPaymentTransactionObserver extends NSObjectProtocol {

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	paymentQueueDidChangeStorefront?(queue: SKPaymentQueue): void;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	paymentQueueDidRevokeEntitlementsForProductIdentifiers?(queue: SKPaymentQueue, productIdentifiers: NSArray<string> | string[]): void;

	paymentQueueRemovedTransactions?(queue: SKPaymentQueue, transactions: NSArray<SKPaymentTransaction> | SKPaymentTransaction[]): void;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	paymentQueueRestoreCompletedTransactionsFailedWithError?(queue: SKPaymentQueue, error: NSError): void;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	paymentQueueRestoreCompletedTransactionsFinished?(queue: SKPaymentQueue): void;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	paymentQueueShouldAddStorePaymentForProduct?(queue: SKPaymentQueue, payment: SKPayment, product: SKProduct): boolean;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	paymentQueueUpdatedDownloads?(queue: SKPaymentQueue, downloads: NSArray<SKDownload> | SKDownload[]): void;

	paymentQueueUpdatedTransactions(queue: SKPaymentQueue, transactions: NSArray<SKPaymentTransaction> | SKPaymentTransaction[]): void;
}
declare var SKPaymentTransactionObserver: {

	prototype: SKPaymentTransactionObserver;
};

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare const enum SKPaymentTransactionState {

	Purchasing = 0,

	Purchased = 1,

	Failed = 2,

	Restored = 3,

	Deferred = 4
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKProduct extends NSObject {

	static alloc(): SKProduct; // inherited from NSObject

	static new(): SKProduct; // inherited from NSObject

	readonly contentVersion: string;

	/**
	 * @since 12.2
	 * @deprecated 18.0
	 */
	readonly discounts: NSArray<SKProductDiscount>;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly downloadContentLengths: NSArray<number>;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly downloadContentVersion: string;

	/**
	 * @since 11.2
	 * @deprecated 18.0
	 */
	readonly introductoryPrice: SKProductDiscount;

	/**
	 * @since 6.0
	 * @deprecated 16.0
	 */
	readonly isDownloadable: boolean;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	readonly isFamilyShareable: boolean;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly localizedDescription: string;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly localizedTitle: string;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly price: NSDecimalNumber;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly priceLocale: NSLocale;

	/**
	 * @since 3.0
	 * @deprecated 18.0
	 */
	readonly productIdentifier: string;

	/**
	 * @since 12.0
	 * @deprecated 18.0
	 */
	readonly subscriptionGroupIdentifier: string;

	/**
	 * @since 11.2
	 * @deprecated 18.0
	 */
	readonly subscriptionPeriod: SKProductSubscriptionPeriod;
}

/**
 * @since 11.2
 * @deprecated 18.0
 */
declare class SKProductDiscount extends NSObject {

	static alloc(): SKProductDiscount; // inherited from NSObject

	static new(): SKProductDiscount; // inherited from NSObject

	/**
	 * @since 12.2
	 * @deprecated 18.0
	 */
	readonly identifier: string;

	/**
	 * @since 11.2
	 * @deprecated 18.0
	 */
	readonly numberOfPeriods: number;

	/**
	 * @since 11.2
	 * @deprecated 18.0
	 */
	readonly paymentMode: SKProductDiscountPaymentMode;

	/**
	 * @since 11.2
	 * @deprecated 18.0
	 */
	readonly price: NSDecimalNumber;

	/**
	 * @since 11.2
	 * @deprecated 18.0
	 */
	readonly priceLocale: NSLocale;

	/**
	 * @since 11.2
	 * @deprecated 18.0
	 */
	readonly subscriptionPeriod: SKProductSubscriptionPeriod;

	/**
	 * @since 12.2
	 * @deprecated 18.0
	 */
	readonly type: SKProductDiscountType;
}

/**
 * @since 11.2
 * @deprecated 18.0
 */
declare const enum SKProductDiscountPaymentMode {

	PayAsYouGo = 0,

	PayUpFront = 1,

	FreeTrial = 2
}

/**
 * @since 12.2
 * @deprecated 18.0
 */
declare const enum SKProductDiscountType {

	Introductory = 0,

	Subscription = 1
}

/**
 * @since 11.2
 * @deprecated 18.0
 */
declare const enum SKProductPeriodUnit {

	Day = 0,

	Week = 1,

	Month = 2,

	Year = 3
}

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare class SKProductStorePromotionController extends NSObject {

	static alloc(): SKProductStorePromotionController; // inherited from NSObject

	static defaultController(): SKProductStorePromotionController;

	static new(): SKProductStorePromotionController; // inherited from NSObject

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	fetchStorePromotionOrderWithCompletionHandler(completionHandler: (p1: NSArray<SKProduct>, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	fetchStorePromotionVisibilityForProductCompletionHandler(product: SKProduct, completionHandler: (p1: SKProductStorePromotionVisibility, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	updateStorePromotionOrderCompletionHandler(promotionOrder: NSArray<SKProduct> | SKProduct[], completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	updateStorePromotionVisibilityForProductCompletionHandler(promotionVisibility: SKProductStorePromotionVisibility, product: SKProduct, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare const enum SKProductStorePromotionVisibility {

	Default = 0,

	Show = 1,

	Hide = 2
}

/**
 * @since 11.2
 * @deprecated 18.0
 */
declare class SKProductSubscriptionPeriod extends NSObject {

	static alloc(): SKProductSubscriptionPeriod; // inherited from NSObject

	static new(): SKProductSubscriptionPeriod; // inherited from NSObject

	readonly numberOfUnits: number;

	readonly unit: SKProductPeriodUnit;
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKProductsRequest extends SKRequest {

	static alloc(): SKProductsRequest; // inherited from NSObject

	static new(): SKProductsRequest; // inherited from NSObject

	delegate: SKProductsRequestDelegate;

	constructor(o: { productIdentifiers: NSSet<string>; });

	initWithProductIdentifiers(productIdentifiers: NSSet<string>): this;
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
interface SKProductsRequestDelegate extends SKRequestDelegate {

	productsRequestDidReceiveResponse(request: SKProductsRequest, response: SKProductsResponse): void;
}
declare var SKProductsRequestDelegate: {

	prototype: SKProductsRequestDelegate;
};

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKProductsResponse extends NSObject {

	static alloc(): SKProductsResponse; // inherited from NSObject

	static new(): SKProductsResponse; // inherited from NSObject

	readonly invalidProductIdentifiers: NSArray<string>;

	readonly products: NSArray<SKProduct>;
}

/**
 * @since 7.0
 * @deprecated 18.0
 */
declare var SKReceiptPropertyIsExpired: string;

/**
 * @since 7.0
 * @deprecated 18.0
 */
declare var SKReceiptPropertyIsRevoked: string;

/**
 * @since 7.0
 * @deprecated 18.0
 */
declare var SKReceiptPropertyIsVolumePurchase: string;

/**
 * @since 7.0
 * @deprecated 18.0
 */
declare class SKReceiptRefreshRequest extends SKRequest {

	static alloc(): SKReceiptRefreshRequest; // inherited from NSObject

	static new(): SKReceiptRefreshRequest; // inherited from NSObject

	readonly receiptProperties: NSDictionary<string, any>;

	constructor(o: { receiptProperties: NSDictionary<string, any>; });

	initWithReceiptProperties(properties: NSDictionary<string, any>): this;
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
declare class SKRequest extends NSObject {

	static alloc(): SKRequest; // inherited from NSObject

	static new(): SKRequest; // inherited from NSObject

	delegate: SKRequestDelegate;

	cancel(): void;

	start(): void;
}

/**
 * @since 3.0
 * @deprecated 18.0
 */
interface SKRequestDelegate extends NSObjectProtocol {

	requestDidFailWithError?(request: SKRequest, error: NSError): void;

	requestDidFinish?(request: SKRequest): void;
}
declare var SKRequestDelegate: {

	prototype: SKRequestDelegate;
};

/**
 * @since 11.3
 */
declare var SKStoreProductParameterAdNetworkAttributionSignature: string;

/**
 * @since 11.3
 */
declare var SKStoreProductParameterAdNetworkCampaignIdentifier: string;

/**
 * @since 11.3
 */
declare var SKStoreProductParameterAdNetworkIdentifier: string;

/**
 * @since 11.3
 */
declare var SKStoreProductParameterAdNetworkNonce: string;

/**
 * @since 14.0
 */
declare var SKStoreProductParameterAdNetworkSourceAppStoreIdentifier: string;

/**
 * @since 16.1
 */
declare var SKStoreProductParameterAdNetworkSourceIdentifier: string;

/**
 * @since 11.3
 */
declare var SKStoreProductParameterAdNetworkTimestamp: string;

/**
 * @since 14.0
 */
declare var SKStoreProductParameterAdNetworkVersion: string;

/**
 * @since 9.3
 */
declare var SKStoreProductParameterAdvertisingPartnerToken: string;

/**
 * @since 8.0
 */
declare var SKStoreProductParameterAffiliateToken: string;

/**
 * @since 8.0
 */
declare var SKStoreProductParameterCampaignToken: string;

/**
 * @since 15.0
 */
declare var SKStoreProductParameterCustomProductPageIdentifier: string;

/**
 * @since 6.0
 */
declare var SKStoreProductParameterITunesItemIdentifier: string;

/**
 * @since 11.0
 */
declare var SKStoreProductParameterProductIdentifier: string;

/**
 * @since 8.3
 */
declare var SKStoreProductParameterProviderToken: string;

/**
 * @since 6.0
 */
declare class SKStoreProductViewController extends UIViewController {

	static alloc(): SKStoreProductViewController; // inherited from NSObject

	static new(): SKStoreProductViewController; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	delegate: SKStoreProductViewControllerDelegate;

	/**
	 * @since 6.0
	 */
	loadProductWithParametersCompletionBlock(parameters: NSDictionary<string, any>, block: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	loadProductWithParametersImpressionCompletionBlock(parameters: NSDictionary<string, any>, impression: SKAdImpression, block: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 6.0
 */
interface SKStoreProductViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 6.0
	 */
	productViewControllerDidFinish?(viewController: SKStoreProductViewController): void;
}
declare var SKStoreProductViewControllerDelegate: {

	prototype: SKStoreProductViewControllerDelegate;
};

/**
 * @since 10.3
 * @deprecated 18.0
 */
declare class SKStoreReviewController extends NSObject {

	static alloc(): SKStoreReviewController; // inherited from NSObject

	static new(): SKStoreReviewController; // inherited from NSObject

	/**
	 * @since 10.3
	 * @deprecated 14.0
	 */
	static requestReview(): void;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	static requestReviewInScene(windowScene: UIWindowScene): void;
}

/**
 * @since 13.0
 * @deprecated 18.0
 */
declare class SKStorefront extends NSObject {

	static alloc(): SKStorefront; // inherited from NSObject

	static new(): SKStorefront; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	readonly countryCode: string;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	readonly identifier: string;
}

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare var SKStorefrontCountryCodeDidChangeNotification: string;

/**
 * @since 9.3
 * @deprecated 18.0
 */
declare var SKStorefrontIdentifierDidChangeNotification: string;

/**
 * @since 7.1
 */
declare function SKTerminateForInvalidReceipt(): void;
