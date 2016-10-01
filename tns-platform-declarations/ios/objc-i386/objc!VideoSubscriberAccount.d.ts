
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

	readonly authenticationExpirationDate: Date;

	readonly verificationData: NSData;
}

declare class VSAccountMetadataRequest extends NSObject {

	static alloc(): VSAccountMetadataRequest; // inherited from NSObject

	static new(): VSAccountMetadataRequest; // inherited from NSObject

	attributeNames: NSArray<string>;

	channelIdentifier: string;

	forceAuthentication: boolean;

	includeAccountProviderIdentifier: boolean;

	includeAuthenticationExpirationDate: boolean;

	interruptionAllowed: boolean;

	localizedVideoTitle: string;

	supportedAccountProviderIdentifiers: NSArray<string>;

	verificationToken: string;
}

declare var VSCheckAccessOptionPrompt: string;

declare const enum VSErrorCode {

	AccessNotGranted = 0,

	UnsupportedProvider = 1,

	UserCancelled = 2,

	ServiceTemporarilyUnavailable = 3,

	ProviderRejected = 4,

	InvalidVerificationToken = 5
}

declare var VSErrorDomain: string;

declare var VSErrorInfoKeySAMLResponse: string;

declare var VSErrorInfoKeySAMLResponseStatus: string;

declare var VSErrorInfoKeyUnsupportedProviderIdentifier: string;
