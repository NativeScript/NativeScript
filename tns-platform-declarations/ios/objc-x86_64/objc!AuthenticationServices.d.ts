
declare class ASCredentialIdentityStore extends NSObject {

	static alloc(): ASCredentialIdentityStore; // inherited from NSObject

	static new(): ASCredentialIdentityStore; // inherited from NSObject

	static readonly sharedStore: ASCredentialIdentityStore;

	getCredentialIdentityStoreStateWithCompletion(completion: (p1: ASCredentialIdentityStoreState) => void): void;

	removeAllCredentialIdentitiesWithCompletion(completion: (p1: boolean, p2: NSError) => void): void;

	removeCredentialIdentitiesCompletion(credentialIdentities: NSArray<ASPasswordCredentialIdentity> | ASPasswordCredentialIdentity[], completion: (p1: boolean, p2: NSError) => void): void;

	replaceCredentialIdentitiesWithIdentitiesCompletion(newCredentialIdentities: NSArray<ASPasswordCredentialIdentity> | ASPasswordCredentialIdentity[], completion: (p1: boolean, p2: NSError) => void): void;

	saveCredentialIdentitiesCompletion(credentialIdentities: NSArray<ASPasswordCredentialIdentity> | ASPasswordCredentialIdentity[], completion: (p1: boolean, p2: NSError) => void): void;
}

declare const enum ASCredentialIdentityStoreErrorCode {

	InternalError = 0,

	StoreDisabled = 1,

	StoreBusy = 2
}

declare var ASCredentialIdentityStoreErrorDomain: string;

declare class ASCredentialIdentityStoreState extends NSObject {

	static alloc(): ASCredentialIdentityStoreState; // inherited from NSObject

	static new(): ASCredentialIdentityStoreState; // inherited from NSObject

	readonly enabled: boolean;

	readonly supportsIncrementalUpdates: boolean;
}

declare class ASCredentialProviderExtensionContext extends NSExtensionContext {

	static alloc(): ASCredentialProviderExtensionContext; // inherited from NSObject

	static new(): ASCredentialProviderExtensionContext; // inherited from NSObject

	completeExtensionConfigurationRequest(): void;

	completeRequestWithSelectedCredentialCompletionHandler(credential: ASPasswordCredential, completionHandler: (p1: boolean) => void): void;
}

declare class ASCredentialProviderViewController extends UIViewController {

	static alloc(): ASCredentialProviderViewController; // inherited from NSObject

	static new(): ASCredentialProviderViewController; // inherited from NSObject

	readonly extensionContext: ASCredentialProviderExtensionContext;

	prepareCredentialListForServiceIdentifiers(serviceIdentifiers: NSArray<ASCredentialServiceIdentifier> | ASCredentialServiceIdentifier[]): void;

	prepareInterfaceForExtensionConfiguration(): void;

	prepareInterfaceToProvideCredentialForIdentity(credentialIdentity: ASPasswordCredentialIdentity): void;

	provideCredentialWithoutUserInteractionForIdentity(credentialIdentity: ASPasswordCredentialIdentity): void;
}

declare class ASCredentialServiceIdentifier extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASCredentialServiceIdentifier; // inherited from NSObject

	static new(): ASCredentialServiceIdentifier; // inherited from NSObject

	readonly identifier: string;

	readonly type: ASCredentialServiceIdentifierType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; type: ASCredentialServiceIdentifierType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithIdentifierType(identifier: string, type: ASCredentialServiceIdentifierType): this;
}

declare const enum ASCredentialServiceIdentifierType {

	Domain = 0,

	URL = 1
}

declare const enum ASExtensionErrorCode {

	Failed = 0,

	UserCanceled = 1,

	UserInteractionRequired = 100,

	CredentialIdentityNotFound = 101
}

declare var ASExtensionErrorDomain: string;

declare class ASPasswordCredential extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASPasswordCredential; // inherited from NSObject

	static credentialWithUserPassword(user: string, password: string): ASPasswordCredential;

	static new(): ASPasswordCredential; // inherited from NSObject

	readonly password: string;

	readonly user: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { user: string; password: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithUserPassword(user: string, password: string): this;
}

declare class ASPasswordCredentialIdentity extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASPasswordCredentialIdentity; // inherited from NSObject

	static identityWithServiceIdentifierUserRecordIdentifier(serviceIdentifier: ASCredentialServiceIdentifier, user: string, recordIdentifier: string): ASPasswordCredentialIdentity;

	static new(): ASPasswordCredentialIdentity; // inherited from NSObject

	rank: number;

	readonly recordIdentifier: string;

	readonly serviceIdentifier: ASCredentialServiceIdentifier;

	readonly user: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; user: string; recordIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithServiceIdentifierUserRecordIdentifier(serviceIdentifier: ASCredentialServiceIdentifier, user: string, recordIdentifier: string): this;
}

declare class ASWebAuthenticationSession extends NSObject {

	static alloc(): ASWebAuthenticationSession; // inherited from NSObject

	static new(): ASWebAuthenticationSession; // inherited from NSObject

	constructor(o: { URL: NSURL; callbackURLScheme: string; completionHandler: (p1: NSURL, p2: NSError) => void; });

	cancel(): void;

	initWithURLCallbackURLSchemeCompletionHandler(URL: NSURL, callbackURLScheme: string, completionHandler: (p1: NSURL, p2: NSError) => void): this;

	start(): boolean;
}

declare const enum ASWebAuthenticationSessionErrorCode {

	CanceledLogin = 1
}

declare var ASWebAuthenticationSessionErrorDomain: string;
