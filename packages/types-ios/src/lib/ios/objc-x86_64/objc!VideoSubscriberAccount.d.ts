
/**
 * @since 10.0
 */
declare const enum VSAccountAccessStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Granted = 3
}

/**
 * @since 14.2
 */
declare class VSAccountApplicationProvider extends NSObject {

	static alloc(): VSAccountApplicationProvider; // inherited from NSObject

	static new(): VSAccountApplicationProvider; // inherited from NSObject

	readonly identifier: string;

	readonly localizedDisplayName: string;

	constructor(o: { localizedDisplayName: string; identifier: string; });

	initWithLocalizedDisplayNameIdentifier(localizedDisplayName: string, identifier: string): this;
}

/**
 * @since 10.0
 */
declare class VSAccountManager extends NSObject {

	static alloc(): VSAccountManager; // inherited from NSObject

	static new(): VSAccountManager; // inherited from NSObject

	delegate: VSAccountManagerDelegate;

	checkAccessStatusWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: VSAccountAccessStatus, p2: NSError) => void): void;

	enqueueAccountMetadataRequestCompletionHandler(request: VSAccountMetadataRequest, completionHandler: (p1: VSAccountMetadata, p2: NSError) => void): VSAccountManagerResult;
}

/**
 * @since 10.0
 */
interface VSAccountManagerDelegate extends NSObjectProtocol {

	accountManagerDismissViewController(accountManager: VSAccountManager, viewController: UIViewController): void;

	accountManagerPresentViewController(accountManager: VSAccountManager, viewController: UIViewController): void;

	accountManagerShouldAuthenticateAccountProviderWithIdentifier?(accountManager: VSAccountManager, accountProviderIdentifier: string): boolean;
}
declare var VSAccountManagerDelegate: {

	prototype: VSAccountManagerDelegate;
};

/**
 * @since 10.0
 */
declare class VSAccountManagerResult extends NSObject {

	static alloc(): VSAccountManagerResult; // inherited from NSObject

	static new(): VSAccountManagerResult; // inherited from NSObject

	cancel(): void;
}

/**
 * @since 10.0
 */
declare class VSAccountMetadata extends NSObject {

	static alloc(): VSAccountMetadata; // inherited from NSObject

	static new(): VSAccountMetadata; // inherited from NSObject

	readonly SAMLAttributeQueryResponse: string;

	readonly accountProviderIdentifier: string;

	/**
	 * @since 10.2
	 */
	readonly accountProviderResponse: VSAccountProviderResponse;

	readonly authenticationExpirationDate: Date;

	readonly verificationData: NSData;
}

/**
 * @since 10.0
 */
declare class VSAccountMetadataRequest extends NSObject {

	static alloc(): VSAccountMetadataRequest; // inherited from NSObject

	static new(): VSAccountMetadataRequest; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	accountProviderAuthenticationToken: string;

	/**
	 * @since 14.2
	 */
	applicationAccountProviders: NSArray<VSAccountApplicationProvider>;

	attributeNames: NSArray<string>;

	channelIdentifier: string;

	/**
	 * @since 11.0
	 */
	featuredAccountProviderIdentifiers: NSArray<string>;

	forceAuthentication: boolean;

	includeAccountProviderIdentifier: boolean;

	includeAuthenticationExpirationDate: boolean;

	interruptionAllowed: boolean;

	localizedVideoTitle: string;

	supportedAccountProviderIdentifiers: NSArray<string>;

	/**
	 * @since 10.2
	 */
	supportedAuthenticationSchemes: NSArray<string>;

	verificationToken: string;
}

/**
 * @since 13.0
 */
declare var VSAccountProviderAuthenticationSchemeAPI: string;

/**
 * @since 10.2
 */
declare var VSAccountProviderAuthenticationSchemeSAML: string;

/**
 * @since 10.2
 */
declare class VSAccountProviderResponse extends NSObject {

	static alloc(): VSAccountProviderResponse; // inherited from NSObject

	static new(): VSAccountProviderResponse; // inherited from NSObject

	readonly authenticationScheme: string;

	readonly body: string;

	readonly status: string;
}

/**
 * @since 17.4
 */
declare class VSAppleSubscription extends NSObject {

	static alloc(): VSAppleSubscription; // inherited from NSObject

	static new(): VSAppleSubscription; // inherited from NSObject

	customerID: string;

	productCodes: NSArray<string>;

	constructor(o: { customerID: string; productCodes: NSArray<string> | string[]; });

	initWithCustomerIDProductCodes(customerID: string, productCodes: NSArray<string> | string[]): this;
}

/**
 * @since 10.0
 */
declare var VSCheckAccessOptionPrompt: string;

/**
 * @since 10.0
 */
declare const enum VSErrorCode {

	AccessNotGranted = 0,

	UnsupportedProvider = 1,

	UserCancelled = 2,

	ServiceTemporarilyUnavailable = 3,

	ProviderRejected = 4,

	InvalidVerificationToken = 5,

	Rejected = 6,

	Unsupported = 7
}

/**
 * @since 10.0
 */
declare var VSErrorDomain: string;

/**
 * @since 10.2
 */
declare var VSErrorInfoKeyAccountProviderResponse: string;

/**
 * @since 10.0
 */
declare var VSErrorInfoKeySAMLResponse: string;

/**
 * @since 10.0
 */
declare var VSErrorInfoKeySAMLResponseStatus: string;

/**
 * @since 10.2
 */
declare var VSErrorInfoKeyUnsupportedProviderIdentifier: string;

/**
 * @since 13.0
 */
declare var VSOpenTVProviderSettingsURLString: string;

/**
 * @since 16.4
 */
declare const enum VSOriginatingDeviceCategory {

	Mobile = 0,

	Other = 1
}

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare class VSSubscription extends NSObject {

	static alloc(): VSSubscription; // inherited from NSObject

	static new(): VSSubscription; // inherited from NSObject

	accessLevel: VSSubscriptionAccessLevel;

	/**
	 * @since 11.3
	 */
	billingIdentifier: string;

	expirationDate: Date;

	tierIdentifiers: NSArray<string>;
}

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare const enum VSSubscriptionAccessLevel {

	Unknown = 0,

	FreeWithAccount = 1,

	Paid = 2
}

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare class VSSubscriptionRegistrationCenter extends NSObject {

	static alloc(): VSSubscriptionRegistrationCenter; // inherited from NSObject

	static defaultSubscriptionRegistrationCenter(): VSSubscriptionRegistrationCenter;

	static new(): VSSubscriptionRegistrationCenter; // inherited from NSObject

	setCurrentSubscription(currentSubscription: VSSubscription): void;
}

/**
 * @since 16.4
 */
declare class VSUserAccount extends NSObject {

	static alloc(): VSUserAccount; // inherited from NSObject

	static new(): VSUserAccount; // inherited from NSObject

	accountProviderIdentifier: string;

	accountType: VSUserAccountType;

	/**
	 * @since 17.4
	 */
	appleSubscription: VSAppleSubscription;

	authenticationData: string;

	billingIdentifier: string;

	readonly deviceCategory: VSOriginatingDeviceCategory;

	readonly fromCurrentDevice: boolean;

	identifier: string;

	requiresSystemTrust: boolean;

	signedOut: boolean;

	subscriptionBillingCycleEndDate: Date;

	tierIdentifiers: NSArray<string>;

	updateURL: NSURL;

	constructor(o: { accountType: VSUserAccountType; updateURL: NSURL; });

	initWithAccountTypeUpdateURL(accountType: VSUserAccountType, url: NSURL): this;
}

/**
 * @since 16.4
 */
declare class VSUserAccountManager extends NSObject {

	static alloc(): VSUserAccountManager; // inherited from NSObject

	static new(): VSUserAccountManager; // inherited from NSObject

	static readonly sharedUserAccountManager: VSUserAccountManager;

	queryUserAccountsWithOptionsCompletion(options: VSUserAccountQueryOptions, completion: (p1: NSArray<VSUserAccount>, p2: NSError) => void): void;

	updateUserAccountCompletion(account: VSUserAccount, completion: (p1: NSError) => void): void;
}

/**
 * @since 16.4
 */
declare const enum VSUserAccountQueryOptions {

	None = 0,

	AllDevices = 1
}

/**
 * @since 16.4
 */
declare const enum VSUserAccountType {

	Free = 0,

	Paid = 1
}
