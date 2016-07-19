
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

	AddToCloudMusicLibrary = 256
}

declare class SKCloudServiceController extends NSObject {

	static alloc(): SKCloudServiceController; // inherited from NSObject

	static authorizationStatus(): SKCloudServiceAuthorizationStatus;

	static new(): SKCloudServiceController; // inherited from NSObject

	static requestAuthorization(handler: (p1: SKCloudServiceAuthorizationStatus) => void): void;

	constructor(); // inherited from NSObject

	requestCapabilitiesWithCompletionHandler(completionHandler: (p1: SKCloudServiceCapability, p2: NSError) => void): void;

	requestStorefrontIdentifierWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;

	self(): SKCloudServiceController; // inherited from NSObjectProtocol
}

declare class SKDownload extends NSObject {

	static alloc(): SKDownload; // inherited from NSObject

	static new(): SKDownload; // inherited from NSObject

	/* readonly */ contentIdentifier: string;

	/* readonly */ contentLength: number;

	/* readonly */ contentURL: NSURL;

	/* readonly */ contentVersion: string;

	/* readonly */ downloadState: SKDownloadState;

	/* readonly */ error: NSError;

	/* readonly */ progress: number;

	/* readonly */ timeRemaining: number;

	/* readonly */ transaction: SKPaymentTransaction;

	constructor(); // inherited from NSObject

	self(): SKDownload; // inherited from NSObjectProtocol
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

	CloudServiceNetworkConnectionFailed = 7
}

declare var SKErrorDomain: string;

declare class SKMutablePayment extends SKPayment {

	static paymentWithProduct(product: SKProduct): SKMutablePayment; // inherited from SKPayment

	applicationUsername: string;

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

	/* readonly */ applicationUsername: string;

	/* readonly */ productIdentifier: string;

	/* readonly */ quantity: number;

	/* readonly */ requestData: NSData;

	/* readonly */ simulatesAskToBuyInSandbox: boolean;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	mutableCopyWithZone(zone: interop.Pointer): any; // inherited from NSMutableCopying

	self(): SKPayment; // inherited from NSObjectProtocol
}

declare class SKPaymentQueue extends NSObject {

	static alloc(): SKPaymentQueue; // inherited from NSObject

	static canMakePayments(): boolean;

	static defaultQueue(): SKPaymentQueue;

	static new(): SKPaymentQueue; // inherited from NSObject

	/* readonly */ transactions: NSArray<SKPaymentTransaction>;

	constructor(); // inherited from NSObject

	addPayment(payment: SKPayment): void;

	addTransactionObserver(observer: SKPaymentTransactionObserver): void;

	cancelDownloads(downloads: NSArray<SKDownload>): void;

	finishTransaction(transaction: SKPaymentTransaction): void;

	pauseDownloads(downloads: NSArray<SKDownload>): void;

	removeTransactionObserver(observer: SKPaymentTransactionObserver): void;

	restoreCompletedTransactions(): void;

	restoreCompletedTransactionsWithApplicationUsername(username: string): void;

	resumeDownloads(downloads: NSArray<SKDownload>): void;

	self(): SKPaymentQueue; // inherited from NSObjectProtocol

	startDownloads(downloads: NSArray<SKDownload>): void;
}

declare class SKPaymentTransaction extends NSObject {

	static alloc(): SKPaymentTransaction; // inherited from NSObject

	static new(): SKPaymentTransaction; // inherited from NSObject

	/* readonly */ downloads: NSArray<SKDownload>;

	/* readonly */ error: NSError;

	/* readonly */ originalTransaction: SKPaymentTransaction;

	/* readonly */ payment: SKPayment;

	/* readonly */ transactionDate: Date;

	/* readonly */ transactionIdentifier: string;

	/* readonly */ transactionReceipt: NSData;

	/* readonly */ transactionState: SKPaymentTransactionState;

	constructor(); // inherited from NSObject

	self(): SKPaymentTransaction; // inherited from NSObjectProtocol
}

interface SKPaymentTransactionObserver extends NSObjectProtocol {

	paymentQueueRemovedTransactions?(queue: SKPaymentQueue, transactions: NSArray<SKPaymentTransaction>): void;

	paymentQueueRestoreCompletedTransactionsFailedWithError?(queue: SKPaymentQueue, error: NSError): void;

	paymentQueueRestoreCompletedTransactionsFinished?(queue: SKPaymentQueue): void;

	paymentQueueUpdatedDownloads?(queue: SKPaymentQueue, downloads: NSArray<SKDownload>): void;

	paymentQueueUpdatedTransactions(queue: SKPaymentQueue, transactions: NSArray<SKPaymentTransaction>): void;
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

	/* readonly */ downloadContentLengths: NSArray<number>;

	/* readonly */ downloadContentVersion: string;

	/* readonly */ downloadable: boolean;

	/* readonly */ localizedDescription: string;

	/* readonly */ localizedTitle: string;

	/* readonly */ price: NSDecimalNumber;

	/* readonly */ priceLocale: NSLocale;

	/* readonly */ productIdentifier: string;

	constructor(); // inherited from NSObject

	self(): SKProduct; // inherited from NSObjectProtocol
}

declare class SKProductsRequest extends SKRequest {

	delegate: any; /*SKProductsRequestDelegate */

	constructor(o: { productIdentifiers: NSSet<string>; });
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

	/* readonly */ invalidProductIdentifiers: NSArray<string>;

	/* readonly */ products: NSArray<SKProduct>;

	constructor(); // inherited from NSObject

	self(): SKProductsResponse; // inherited from NSObjectProtocol
}

declare var SKReceiptPropertyIsExpired: string;

declare var SKReceiptPropertyIsRevoked: string;

declare var SKReceiptPropertyIsVolumePurchase: string;

declare class SKReceiptRefreshRequest extends SKRequest {

	/* readonly */ receiptProperties: NSDictionary<string, any>;

	constructor(o: { receiptProperties: NSDictionary<string, any>; });
}

declare class SKRequest extends NSObject {

	static alloc(): SKRequest; // inherited from NSObject

	static new(): SKRequest; // inherited from NSObject

	delegate: SKRequestDelegate;

	constructor(); // inherited from NSObject

	cancel(): void;

	self(): SKRequest; // inherited from NSObjectProtocol

	start(): void;
}

interface SKRequestDelegate extends NSObjectProtocol {

	requestDidFailWithError?(request: SKRequest, error: NSError): void;

	requestDidFinish?(request: SKRequest): void;
}
declare var SKRequestDelegate: {

	prototype: SKRequestDelegate;
};

declare var SKStoreProductParameterAdvertisingPartnerToken: string;

declare var SKStoreProductParameterAffiliateToken: string;

declare var SKStoreProductParameterCampaignToken: string;

declare var SKStoreProductParameterITunesItemIdentifier: string;

declare var SKStoreProductParameterProviderToken: string;

declare class SKStoreProductViewController extends UIViewController {

	delegate: SKStoreProductViewControllerDelegate;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	loadProductWithParametersCompletionBlock(parameters: NSDictionary<string, any>, block: (p1: boolean, p2: NSError) => void): void;

	self(): SKStoreProductViewController; // inherited from NSObjectProtocol
}

interface SKStoreProductViewControllerDelegate extends NSObjectProtocol {

	productViewControllerDidFinish?(viewController: SKStoreProductViewController): void;
}
declare var SKStoreProductViewControllerDelegate: {

	prototype: SKStoreProductViewControllerDelegate;
};

declare var SKStorefrontIdentifierDidChangeNotification: string;

declare function SKTerminateForInvalidReceipt(): void;
