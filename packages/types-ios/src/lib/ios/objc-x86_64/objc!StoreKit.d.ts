
declare class SKAdNetwork extends NSObject {

	static alloc(): SKAdNetwork; // inherited from NSObject

	static new(): SKAdNetwork; // inherited from NSObject

	static registerAppForAdNetworkAttribution(): void;
}

declare class SKArcadeService extends NSObject {

	static alloc(): SKArcadeService; // inherited from NSObject

	static arcadeSubscriptionStatusWithNonceResultHandler(nonce: number, resultHandler: (p1: NSData, p2: number, p3: NSData, p4: number, p5: NSError) => void): void;

	static new(): SKArcadeService; // inherited from NSObject

	static registerArcadeAppWithRandomFromLibRandomFromLibLengthResultHandler(randomFromLib: NSData, randomFromLibLength: number, resultHandler: (p1: NSData, p2: number, p3: NSData, p4: number, p5: NSError) => void): void;

	static repairArcadeApp(): void;
}

declare const enum SKCloudServiceAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Restricted = 2,

	Authorized = 3
}

declare var SKCloudServiceCapabilitiesDidChangeNotification: string;

declare const enum SKCloudServiceCapability {

	None = 0,

	MusicCatalogPlayback = 1,

	MusicCatalogSubscriptionEligible = 2,

	AddToCloudMusicLibrary = 256
}

declare class SKCloudServiceController extends NSObject {

	static alloc(): SKCloudServiceController; // inherited from NSObject

	static authorizationStatus(): SKCloudServiceAuthorizationStatus;

	static new(): SKCloudServiceController; // inherited from NSObject

	static requestAuthorization(handler: (p1: SKCloudServiceAuthorizationStatus) => void): void;

	requestCapabilitiesWithCompletionHandler(completionHandler: (p1: SKCloudServiceCapability, p2: NSError) => void): void;

	requestPersonalizationTokenForClientTokenWithCompletionHandler(clientToken: string, completionHandler: (p1: string, p2: NSError) => void): void;

	requestStorefrontCountryCodeWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;

	requestStorefrontIdentifierWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;

	requestUserTokenForDeveloperTokenCompletionHandler(developerToken: string, completionHandler: (p1: string, p2: NSError) => void): void;
}

declare var SKCloudServiceSetupActionSubscribe: string;

declare var SKCloudServiceSetupMessageIdentifierAddMusic: string;

declare var SKCloudServiceSetupMessageIdentifierConnect: string;

declare var SKCloudServiceSetupMessageIdentifierJoin: string;

declare var SKCloudServiceSetupMessageIdentifierPlayMusic: string;

declare var SKCloudServiceSetupOptionsActionKey: string;

declare var SKCloudServiceSetupOptionsAffiliateTokenKey: string;

declare var SKCloudServiceSetupOptionsCampaignTokenKey: string;

declare var SKCloudServiceSetupOptionsITunesItemIdentifierKey: string;

declare var SKCloudServiceSetupOptionsMessageIdentifierKey: string;

declare class SKCloudServiceSetupViewController extends UIViewController {

	static alloc(): SKCloudServiceSetupViewController; // inherited from NSObject

	static new(): SKCloudServiceSetupViewController; // inherited from NSObject

	delegate: SKCloudServiceSetupViewControllerDelegate;

	loadWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: boolean, p2: NSError) => void): void;
}

interface SKCloudServiceSetupViewControllerDelegate extends NSObjectProtocol {

	cloudServiceSetupViewControllerDidDismiss?(cloudServiceSetupViewController: SKCloudServiceSetupViewController): void;
}
declare var SKCloudServiceSetupViewControllerDelegate: {

	prototype: SKCloudServiceSetupViewControllerDelegate;
};

declare class SKDownload extends NSObject {

	static alloc(): SKDownload; // inherited from NSObject

	static new(): SKDownload; // inherited from NSObject

	readonly contentIdentifier: string;

	readonly contentLength: number;

	readonly contentURL: NSURL;

	readonly contentVersion: string;

	readonly downloadState: SKDownloadState;

	readonly error: NSError;

	readonly expectedContentLength: number;

	readonly progress: number;

	readonly state: SKDownloadState;

	readonly timeRemaining: number;

	readonly transaction: SKPaymentTransaction;
}

declare const enum SKDownloadState {

	Waiting = 0,

	Active = 1,

	Paused = 2,

	Finished = 3,

	Failed = 4,

	Cancelled = 5
}

declare var SKDownloadTimeRemainingUnknown: number;

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

	InvalidOfferPrice = 14
}

declare var SKErrorDomain: string;

declare class SKMutablePayment extends SKPayment {

	static alloc(): SKMutablePayment; // inherited from NSObject

	static new(): SKMutablePayment; // inherited from NSObject

	static paymentWithProduct(product: SKProduct): SKMutablePayment; // inherited from SKPayment

	applicationUsername: string;

	paymentDiscount: SKPaymentDiscount;

	productIdentifier: string;

	quantity: number;

	requestData: NSData;

	simulatesAskToBuyInSandbox: boolean;
}

declare class SKPayment extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): SKPayment; // inherited from NSObject

	static new(): SKPayment; // inherited from NSObject

	static paymentWithProduct(product: SKProduct): SKPayment;

	static paymentWithProductIdentifier(identifier: string): any;

	readonly applicationUsername: string;

	readonly paymentDiscount: SKPaymentDiscount;

	readonly productIdentifier: string;

	readonly quantity: number;

	readonly requestData: NSData;

	readonly simulatesAskToBuyInSandbox: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

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

declare class SKPaymentQueue extends NSObject {

	static alloc(): SKPaymentQueue; // inherited from NSObject

	static canMakePayments(): boolean;

	static defaultQueue(): SKPaymentQueue;

	static new(): SKPaymentQueue; // inherited from NSObject

	delegate: SKPaymentQueueDelegate;

	readonly storefront: SKStorefront;

	readonly transactions: NSArray<SKPaymentTransaction>;

	addPayment(payment: SKPayment): void;

	addTransactionObserver(observer: SKPaymentTransactionObserver): void;

	cancelDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;

	finishTransaction(transaction: SKPaymentTransaction): void;

	pauseDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;

	removeTransactionObserver(observer: SKPaymentTransactionObserver): void;

	restoreCompletedTransactions(): void;

	restoreCompletedTransactionsWithApplicationUsername(username: string): void;

	resumeDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;

	startDownloads(downloads: NSArray<SKDownload> | SKDownload[]): void;
}

interface SKPaymentQueueDelegate extends NSObjectProtocol {

	paymentQueueShouldContinueTransactionInStorefront?(paymentQueue: SKPaymentQueue, transaction: SKPaymentTransaction, newStorefront: SKStorefront): boolean;
}
declare var SKPaymentQueueDelegate: {

	prototype: SKPaymentQueueDelegate;
};

declare class SKPaymentTransaction extends NSObject {

	static alloc(): SKPaymentTransaction; // inherited from NSObject

	static new(): SKPaymentTransaction; // inherited from NSObject

	readonly downloads: NSArray<SKDownload>;

	readonly error: NSError;

	readonly originalTransaction: SKPaymentTransaction;

	readonly payment: SKPayment;

	readonly transactionDate: Date;

	readonly transactionIdentifier: string;

	readonly transactionReceipt: NSData;

	readonly transactionState: SKPaymentTransactionState;
}

interface SKPaymentTransactionObserver extends NSObjectProtocol {

	paymentQueueDidChangeStorefront?(queue: SKPaymentQueue): void;

	paymentQueueRemovedTransactions?(queue: SKPaymentQueue, transactions: NSArray<SKPaymentTransaction> | SKPaymentTransaction[]): void;

	paymentQueueRestoreCompletedTransactionsFailedWithError?(queue: SKPaymentQueue, error: NSError): void;

	paymentQueueRestoreCompletedTransactionsFinished?(queue: SKPaymentQueue): void;

	paymentQueueShouldAddStorePaymentForProduct?(queue: SKPaymentQueue, payment: SKPayment, product: SKProduct): boolean;

	paymentQueueUpdatedDownloads?(queue: SKPaymentQueue, downloads: NSArray<SKDownload> | SKDownload[]): void;

	paymentQueueUpdatedTransactions(queue: SKPaymentQueue, transactions: NSArray<SKPaymentTransaction> | SKPaymentTransaction[]): void;
}
declare var SKPaymentTransactionObserver: {

	prototype: SKPaymentTransactionObserver;
};

declare const enum SKPaymentTransactionState {

	Purchasing = 0,

	Purchased = 1,

	Failed = 2,

	Restored = 3,

	Deferred = 4
}

declare class SKProduct extends NSObject {

	static alloc(): SKProduct; // inherited from NSObject

	static new(): SKProduct; // inherited from NSObject

	readonly contentVersion: string;

	readonly discounts: NSArray<SKProductDiscount>;

	readonly downloadContentLengths: NSArray<number>;

	readonly downloadContentVersion: string;

	readonly introductoryPrice: SKProductDiscount;

	readonly isDownloadable: boolean;

	readonly localizedDescription: string;

	readonly localizedTitle: string;

	readonly price: NSDecimalNumber;

	readonly priceLocale: NSLocale;

	readonly productIdentifier: string;

	readonly subscriptionGroupIdentifier: string;

	readonly subscriptionPeriod: SKProductSubscriptionPeriod;
}

declare class SKProductDiscount extends NSObject {

	static alloc(): SKProductDiscount; // inherited from NSObject

	static new(): SKProductDiscount; // inherited from NSObject

	readonly identifier: string;

	readonly numberOfPeriods: number;

	readonly paymentMode: SKProductDiscountPaymentMode;

	readonly price: NSDecimalNumber;

	readonly priceLocale: NSLocale;

	readonly subscriptionPeriod: SKProductSubscriptionPeriod;

	readonly type: SKProductDiscountType;
}

declare const enum SKProductDiscountPaymentMode {

	PayAsYouGo = 0,

	PayUpFront = 1,

	FreeTrial = 2
}

declare const enum SKProductDiscountType {

	Introductory = 0,

	Subscription = 1
}

declare const enum SKProductPeriodUnit {

	Day = 0,

	Week = 1,

	Month = 2,

	Year = 3
}

declare class SKProductStorePromotionController extends NSObject {

	static alloc(): SKProductStorePromotionController; // inherited from NSObject

	static defaultController(): SKProductStorePromotionController;

	static new(): SKProductStorePromotionController; // inherited from NSObject

	fetchStorePromotionOrderWithCompletionHandler(completionHandler: (p1: NSArray<SKProduct>, p2: NSError) => void): void;

	fetchStorePromotionVisibilityForProductCompletionHandler(product: SKProduct, completionHandler: (p1: SKProductStorePromotionVisibility, p2: NSError) => void): void;

	updateStorePromotionOrderCompletionHandler(storePromotionOrder: NSArray<SKProduct> | SKProduct[], completionHandler: (p1: NSError) => void): void;

	updateStorePromotionVisibilityForProductCompletionHandler(promotionVisibility: SKProductStorePromotionVisibility, product: SKProduct, completionHandler: (p1: NSError) => void): void;
}

declare const enum SKProductStorePromotionVisibility {

	Default = 0,

	Show = 1,

	Hide = 2
}

declare class SKProductSubscriptionPeriod extends NSObject {

	static alloc(): SKProductSubscriptionPeriod; // inherited from NSObject

	static new(): SKProductSubscriptionPeriod; // inherited from NSObject

	readonly numberOfUnits: number;

	readonly unit: SKProductPeriodUnit;
}

declare class SKProductsRequest extends SKRequest {

	static alloc(): SKProductsRequest; // inherited from NSObject

	static new(): SKProductsRequest; // inherited from NSObject

	delegate: SKProductsRequestDelegate;

	constructor(o: { productIdentifiers: NSSet<string>; });

	initWithProductIdentifiers(productIdentifiers: NSSet<string>): this;
}

interface SKProductsRequestDelegate extends SKRequestDelegate {

	productsRequestDidReceiveResponse(request: SKProductsRequest, response: SKProductsResponse): void;
}
declare var SKProductsRequestDelegate: {

	prototype: SKProductsRequestDelegate;
};

declare class SKProductsResponse extends NSObject {

	static alloc(): SKProductsResponse; // inherited from NSObject

	static new(): SKProductsResponse; // inherited from NSObject

	readonly invalidProductIdentifiers: NSArray<string>;

	readonly products: NSArray<SKProduct>;
}

declare var SKReceiptPropertyIsExpired: string;

declare var SKReceiptPropertyIsRevoked: string;

declare var SKReceiptPropertyIsVolumePurchase: string;

declare class SKReceiptRefreshRequest extends SKRequest {

	static alloc(): SKReceiptRefreshRequest; // inherited from NSObject

	static new(): SKReceiptRefreshRequest; // inherited from NSObject

	readonly receiptProperties: NSDictionary<string, any>;

	constructor(o: { receiptProperties: NSDictionary<string, any>; });

	initWithReceiptProperties(properties: NSDictionary<string, any>): this;
}

declare class SKRequest extends NSObject {

	static alloc(): SKRequest; // inherited from NSObject

	static new(): SKRequest; // inherited from NSObject

	delegate: SKRequestDelegate;

	cancel(): void;

	start(): void;
}

interface SKRequestDelegate extends NSObjectProtocol {

	requestDidFailWithError?(request: SKRequest, error: NSError): void;

	requestDidFinish?(request: SKRequest): void;
}
declare var SKRequestDelegate: {

	prototype: SKRequestDelegate;
};

declare var SKStoreProductParameterAdNetworkAttributionSignature: string;

declare var SKStoreProductParameterAdNetworkCampaignIdentifier: string;

declare var SKStoreProductParameterAdNetworkIdentifier: string;

declare var SKStoreProductParameterAdNetworkNonce: string;

declare var SKStoreProductParameterAdNetworkTimestamp: string;

declare var SKStoreProductParameterAdvertisingPartnerToken: string;

declare var SKStoreProductParameterAffiliateToken: string;

declare var SKStoreProductParameterCampaignToken: string;

declare var SKStoreProductParameterITunesItemIdentifier: string;

declare var SKStoreProductParameterProductIdentifier: string;

declare var SKStoreProductParameterProviderToken: string;

declare class SKStoreProductViewController extends UIViewController {

	static alloc(): SKStoreProductViewController; // inherited from NSObject

	static new(): SKStoreProductViewController; // inherited from NSObject

	delegate: SKStoreProductViewControllerDelegate;

	loadProductWithParametersCompletionBlock(parameters: NSDictionary<string, any>, block: (p1: boolean, p2: NSError) => void): void;
}

interface SKStoreProductViewControllerDelegate extends NSObjectProtocol {

	productViewControllerDidFinish?(viewController: SKStoreProductViewController): void;
}
declare var SKStoreProductViewControllerDelegate: {

	prototype: SKStoreProductViewControllerDelegate;
};

declare class SKStoreReviewController extends NSObject {

	static alloc(): SKStoreReviewController; // inherited from NSObject

	static new(): SKStoreReviewController; // inherited from NSObject

	static requestReview(): void;
}

declare class SKStorefront extends NSObject {

	static alloc(): SKStorefront; // inherited from NSObject

	static new(): SKStorefront; // inherited from NSObject

	readonly countryCode: string;

	readonly identifier: string;
}

declare var SKStorefrontCountryCodeDidChangeNotification: string;

declare var SKStorefrontIdentifierDidChangeNotification: string;

declare function SKTerminateForInvalidReceipt(): void;
