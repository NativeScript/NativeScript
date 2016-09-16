
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

	requestCapabilitiesWithCompletionHandler(completionHandler: (p1: SKCloudServiceCapability, p2: NSError) => void): void;

	requestStorefrontIdentifierWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;
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

	static alloc(): SKMutablePayment; // inherited from NSObject

	static new(): SKMutablePayment; // inherited from NSObject

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class SKPaymentQueue extends NSObject {

	static alloc(): SKPaymentQueue; // inherited from NSObject

	static canMakePayments(): boolean;

	static defaultQueue(): SKPaymentQueue;

	static new(): SKPaymentQueue; // inherited from NSObject

	/* readonly */ transactions: NSArray<SKPaymentTransaction>;

	addPayment(payment: SKPayment): void;

	addTransactionObserver(observer: SKPaymentTransactionObserver): void;

	cancelDownloads(downloads: NSArray<SKDownload>): void;

	finishTransaction(transaction: SKPaymentTransaction): void;

	pauseDownloads(downloads: NSArray<SKDownload>): void;

	removeTransactionObserver(observer: SKPaymentTransactionObserver): void;

	restoreCompletedTransactions(): void;

	restoreCompletedTransactionsWithApplicationUsername(username: string): void;

	resumeDownloads(downloads: NSArray<SKDownload>): void;

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

	/* readonly */ invalidProductIdentifiers: NSArray<string>;

	/* readonly */ products: NSArray<SKProduct>;
}

declare var SKReceiptPropertyIsExpired: string;

declare var SKReceiptPropertyIsRevoked: string;

declare var SKReceiptPropertyIsVolumePurchase: string;

declare class SKReceiptRefreshRequest extends SKRequest {

	static alloc(): SKReceiptRefreshRequest; // inherited from NSObject

	static new(): SKReceiptRefreshRequest; // inherited from NSObject

	/* readonly */ receiptProperties: NSDictionary<string, any>;

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

declare var SKStoreProductParameterAdvertisingPartnerToken: string;

declare var SKStoreProductParameterAffiliateToken: string;

declare var SKStoreProductParameterCampaignToken: string;

declare var SKStoreProductParameterITunesItemIdentifier: string;

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

declare var SKStorefrontIdentifierDidChangeNotification: string;

declare function SKTerminateForInvalidReceipt(): void;
