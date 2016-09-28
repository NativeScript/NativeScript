
declare class ACAccount extends NSObject {

	static alloc(): ACAccount; // inherited from NSObject

	static new(): ACAccount; // inherited from NSObject

	accountDescription: string;

	accountType: ACAccountType;

	credential: ACAccountCredential;

	readonly identifier: string;

	readonly userFullName: string;

	username: string;

	constructor(o: { accountType: ACAccountType; });

	initWithAccountType(type: ACAccountType): this;
}

declare class ACAccountCredential extends NSObject {

	static alloc(): ACAccountCredential; // inherited from NSObject

	static new(): ACAccountCredential; // inherited from NSObject

	oauthToken: string;

	constructor(o: { OAuth2Token: string; refreshToken: string; expiryDate: Date; });

	constructor(o: { OAuthToken: string; tokenSecret: string; });

	initWithOAuth2TokenRefreshTokenExpiryDate(token: string, refreshToken: string, expiryDate: Date): this;

	initWithOAuthTokenTokenSecret(token: string, secret: string): this;
}

declare const enum ACAccountCredentialRenewResult {

	Renewed = 0,

	Rejected = 1,

	Failed = 2
}

declare class ACAccountStore extends NSObject {

	static alloc(): ACAccountStore; // inherited from NSObject

	static new(): ACAccountStore; // inherited from NSObject

	readonly accounts: NSArray<any>;

	accountTypeWithAccountTypeIdentifier(typeIdentifier: string): ACAccountType;

	accountWithIdentifier(identifier: string): ACAccount;

	accountsWithAccountType(accountType: ACAccountType): NSArray<any>;

	removeAccountWithCompletionHandler(account: ACAccount, completionHandler: (p1: boolean, p2: NSError) => void): void;

	renewCredentialsForAccountCompletion(account: ACAccount, completionHandler: (p1: ACAccountCredentialRenewResult, p2: NSError) => void): void;

	requestAccessToAccountsWithTypeOptionsCompletion(accountType: ACAccountType, options: NSDictionary<any, any>, completion: (p1: boolean, p2: NSError) => void): void;

	requestAccessToAccountsWithTypeWithCompletionHandler(accountType: ACAccountType, handler: (p1: boolean, p2: NSError) => void): void;

	saveAccountWithCompletionHandler(account: ACAccount, completionHandler: (p1: boolean, p2: NSError) => void): void;
}

declare var ACAccountStoreDidChangeNotification: string;

declare class ACAccountType extends NSObject {

	static alloc(): ACAccountType; // inherited from NSObject

	static new(): ACAccountType; // inherited from NSObject

	readonly accessGranted: boolean;

	readonly accountTypeDescription: string;

	readonly identifier: string;
}

declare var ACAccountTypeIdentifierFacebook: string;

declare var ACAccountTypeIdentifierSinaWeibo: string;

declare var ACAccountTypeIdentifierTencentWeibo: string;

declare var ACAccountTypeIdentifierTwitter: string;

declare const enum ACErrorCode {

	Unknown = 1,

	AccountMissingRequiredProperty = 2,

	AccountAuthenticationFailed = 3,

	AccountTypeInvalid = 4,

	AccountAlreadyExists = 5,

	AccountNotFound = 6,

	PermissionDenied = 7,

	AccessInfoInvalid = 8,

	ClientPermissionDenied = 9,

	AccessDeniedByProtectionPolicy = 10,

	CredentialNotFound = 11,

	FetchCredentialFailed = 12,

	StoreCredentialFailed = 13,

	RemoveCredentialFailed = 14,

	UpdatingNonexistentAccount = 15,

	InvalidClientBundleID = 16,

	DeniedByPlugin = 17,

	CoreDataSaveFailed = 18,

	FailedSerializingAccountInfo = 19,

	InvalidCommand = 20,

	MissingTransportMessageID = 21,

	CredentialItemNotFound = 22,

	CredentialItemNotExpired = 23
}

declare var ACErrorDomain: string;

declare var ACFacebookAppIdKey: string;

declare var ACFacebookAudienceEveryone: string;

declare var ACFacebookAudienceFriends: string;

declare var ACFacebookAudienceKey: string;

declare var ACFacebookAudienceOnlyMe: string;

declare var ACFacebookPermissionsKey: string;

declare var ACTencentWeiboAppIdKey: string;
