
declare const enum VSAccountAccessStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Granted = 3
}

declare class VSAccountManager extends NSObject {

	static alloc(): VSAccountManager; // inherited from NSObject

	static new(): VSAccountManager; // inherited from NSObject

	delegate: VSAccountManagerDelegate;

	checkAccessStatusWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: VSAccountAccessStatus, p2: NSError) => void): void;

	enqueueAccountMetadataRequestCompletionHandler(request: VSAccountMetadataRequest, completionHandler: (p1: VSAccountMetadata, p2: NSError) => void): VSAccountManagerResult;
}

interface VSAccountManagerDelegate extends NSObjectProtocol {

	accountManagerDismissViewController(accountManager: VSAccountManager, viewController: UIViewController): void;

	accountManagerPresentViewController(accountManager: VSAccountManager, viewController: UIViewController): void;

	accountManagerShouldAuthenticateAccountProviderWithIdentifier?(accountManager: VSAccountManager, accountProviderIdentifier: string): boolean;
}
declare var VSAccountManagerDelegate: {

	prototype: VSAccountManagerDelegate;
};

declare class VSAccountManagerResult extends NSObject {

	static alloc(): VSAccountManagerResult; // inherited from NSObject

	static new(): VSAccountManagerResult; // inherited from NSObject

	cancel(): void;
}

declare class VSAccountMetadata extends NSObject {

	static alloc(): VSAccountMetadata; // inherited from NSObject

	static new(): VSAccountMetadata; // inherited from NSObject

	readonly SAMLAttributeQueryResponse: string;

	readonly accountProviderIdentifier: string;

	readonly accountProviderResponse: VSAccountProviderResponse;

	readonly authenticationExpirationDate: Date;

	readonly verificationData: NSData;
}

declare class VSAccountMetadataRequest extends NSObject {

	static alloc(): VSAccountMetadataRequest; // inherited from NSObject

	static new(): VSAccountMetadataRequest; // inherited from NSObject

	accountProviderAuthenticationToken: string;

	attributeNames: NSArray<string>;

	channelIdentifier: string;

	featuredAccountProviderIdentifiers: NSArray<string>;

	forceAuthentication: boolean;

	includeAccountProviderIdentifier: boolean;

	includeAuthenticationExpirationDate: boolean;

	interruptionAllowed: boolean;

	localizedVideoTitle: string;

	supportedAccountProviderIdentifiers: NSArray<string>;

	supportedAuthenticationSchemes: NSArray<string>;

	verificationToken: string;
}

declare var VSAccountProviderAuthenticationSchemeAPI: string;

declare var VSAccountProviderAuthenticationSchemeSAML: string;

declare class VSAccountProviderResponse extends NSObject {

	static alloc(): VSAccountProviderResponse; // inherited from NSObject

	static new(): VSAccountProviderResponse; // inherited from NSObject

	readonly authenticationScheme: string;

	readonly body: string;

	readonly status: string;
}

declare var VSCheckAccessOptionPrompt: string;

declare const enum VSErrorCode {

	AccessNotGranted = 0,

	UnsupportedProvider = 1,

	UserCancelled = 2,

	ServiceTemporarilyUnavailable = 3,

	ProviderRejected = 4,

	InvalidVerificationToken = 5,

	Rejected = 6
}

declare var VSErrorDomain: string;

declare var VSErrorInfoKeyAccountProviderResponse: string;

declare var VSErrorInfoKeySAMLResponse: string;

declare var VSErrorInfoKeySAMLResponseStatus: string;

declare var VSErrorInfoKeyUnsupportedProviderIdentifier: string;

declare var VSOpenTVProviderSettingsURLString: string;

declare class VSSubscription extends NSObject {

	static alloc(): VSSubscription; // inherited from NSObject

	static new(): VSSubscription; // inherited from NSObject

	accessLevel: VSSubscriptionAccessLevel;

	billingIdentifier: string;

	expirationDate: Date;

	tierIdentifiers: NSArray<string>;
}

declare const enum VSSubscriptionAccessLevel {

	Unknown = 0,

	FreeWithAccount = 1,

	Paid = 2
}

declare class VSSubscriptionRegistrationCenter extends NSObject {

	static alloc(): VSSubscriptionRegistrationCenter; // inherited from NSObject

	static defaultSubscriptionRegistrationCenter(): VSSubscriptionRegistrationCenter;

	static new(): VSSubscriptionRegistrationCenter; // inherited from NSObject

	setCurrentSubscription(currentSubscription: VSSubscription): void;
}
