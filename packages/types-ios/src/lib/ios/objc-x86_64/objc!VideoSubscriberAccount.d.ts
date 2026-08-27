
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

	delegate: VSAccountManagerDelegate | null;

	checkAccessStatusWithOptionsCompletionHandler(options: NSDictionary<string, any>, completionHandler: (p1: VSAccountAccessStatus, p2: NSError | null) => void): void;

	enqueueAccountMetadataRequestCompletionHandler(request: VSAccountMetadataRequest, completionHandler: (p1: VSAccountMetadata | null, p2: NSError | null) => void): VSAccountManagerResult;
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

	readonly SAMLAttributeQueryResponse: string | null;

	readonly accountProviderIdentifier: string | null;

	/**
	 * @since 10.2
	 */
	readonly accountProviderResponse: VSAccountProviderResponse | null;

	readonly authenticationExpirationDate: Date | null;

	readonly verificationData: NSData | null;
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
	accountProviderAuthenticationToken: string | null;

	/**
	 * @since 14.2
	 */
	applicationAccountProviders: NSArray<VSAccountApplicationProvider> | null;

	attributeNames: NSArray<string>;

	channelIdentifier: string | null;

	/**
	 * @since 11.0
	 */
	featuredAccountProviderIdentifiers: NSArray<string>;

	forceAuthentication: boolean;

	includeAccountProviderIdentifier: boolean;

	includeAuthenticationExpirationDate: boolean;

	interruptionAllowed: boolean;

	localizedVideoTitle: string | null;

	supportedAccountProviderIdentifiers: NSArray<string>;

	/**
	 * @since 10.2
	 */
	supportedAuthenticationSchemes: NSArray<string>;

	verificationToken: string | null;
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

	readonly body: string | null;

	readonly status: string | null;
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
 * @since 26.0
 */
declare const enum VSAutoSignInAuthorization {

	NotDetermined = 0,

	Granted = 1,

	Denied = 2
}

/**
 * @since 26.0
 */
declare class VSAutoSignInToken extends NSObject implements NSSecureCoding {

	static alloc(): VSAutoSignInToken; // inherited from NSObject

	static new(): VSAutoSignInToken; // inherited from NSObject

	readonly authorization: VSAutoSignInAuthorization;

	readonly value: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 26.0
 */
declare class VSAutoSignInTokenUpdateContext extends NSObject {

	static alloc(): VSAutoSignInTokenUpdateContext; // inherited from NSObject

	static new(): VSAutoSignInTokenUpdateContext; // inherited from NSObject

	readonly authorization: VSAutoSignInAuthorization;
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
	billingIdentifier: string | null;

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

	setCurrentSubscription(currentSubscription: VSSubscription | null): void;
}

/**
 * @since 16.4
 */
declare class VSUserAccount extends NSObject {

	static alloc(): VSUserAccount; // inherited from NSObject

	static new(): VSUserAccount; // inherited from NSObject

	accountProviderIdentifier: string | null;

	accountType: VSUserAccountType;

	/**
	 * @since 17.4
	 */
	appleSubscription: VSAppleSubscription | null;

	authenticationData: string | null;

	billingIdentifier: string | null;

	readonly deviceCategory: VSOriginatingDeviceCategory;

	readonly fromCurrentDevice: boolean;

	identifier: string | null;

	requiresSystemTrust: boolean;

	signedOut: boolean;

	subscriptionBillingCycleEndDate: Date | null;

	tierIdentifiers: NSArray<string> | null;

	updateURL: NSURL | null;

	constructor(o: { accountType: VSUserAccountType; updateURL: NSURL | null; });

	initWithAccountTypeUpdateURL(accountType: VSUserAccountType, url: NSURL | null): this;
}

/**
 * @since 16.4
 */
declare class VSUserAccountManager extends NSObject {

	static alloc(): VSUserAccountManager; // inherited from NSObject

	static new(): VSUserAccountManager; // inherited from NSObject

	static readonly sharedUserAccountManager: VSUserAccountManager;

	/**
	 * @since 26.0
	 */
	deleteAutoSignInTokenWithCompletionHandler(completion: (p1: NSError | null) => void): void;

	/**
	 * @since 26.0
	 */
	queryAutoSignInTokenWithCompletionHandler(completion: (p1: VSAutoSignInToken | null, p2: NSError | null) => void): void;

	queryUserAccountsWithOptionsCompletion(options: VSUserAccountQueryOptions, completion: (p1: NSArray<VSUserAccount> | null, p2: NSError | null) => void): void;

	/**
	 * @since 26.0
	 */
	requestAutoSignInAuthorizationWithCompletionHandler(completion: (p1: VSAutoSignInTokenUpdateContext | null, p2: NSError | null) => void): void;

	/**
	 * @since 26.0
	 */
	updateAutoSignInTokenUpdateContextCompletionHandler(autoSignInToken: string, context: VSAutoSignInTokenUpdateContext, completion: (p1: NSError | null) => void): void;

	updateUserAccountCompletion(account: VSUserAccount, completion: (p1: NSError | null) => void | null): void;
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
