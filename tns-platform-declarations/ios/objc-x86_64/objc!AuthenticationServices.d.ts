
declare class ASAuthorization extends NSObject {

	static alloc(): ASAuthorization; // inherited from NSObject

	static new(): ASAuthorization; // inherited from NSObject

	readonly credential: ASAuthorizationCredential;

	readonly provider: ASAuthorizationProvider;
}

declare class ASAuthorizationAppleIDButton extends UIControl {

	static alloc(): ASAuthorizationAppleIDButton; // inherited from NSObject

	static appearance(): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	static buttonWithTypeStyle(type: ASAuthorizationAppleIDButtonType, style: ASAuthorizationAppleIDButtonStyle): ASAuthorizationAppleIDButton;

	static new(): ASAuthorizationAppleIDButton; // inherited from NSObject

	cornerRadius: number;

	constructor(o: { authorizationButtonType: ASAuthorizationAppleIDButtonType; authorizationButtonStyle: ASAuthorizationAppleIDButtonStyle; });

	initWithAuthorizationButtonTypeAuthorizationButtonStyle(type: ASAuthorizationAppleIDButtonType, style: ASAuthorizationAppleIDButtonStyle): this;
}

declare const enum ASAuthorizationAppleIDButtonStyle {

	White = 0,

	WhiteOutline = 1,

	Black = 2
}

declare const enum ASAuthorizationAppleIDButtonType {

	SignIn = 0,

	Continue = 1,

	SignUp = 2,

	Default = 0
}

declare class ASAuthorizationAppleIDCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASAuthorizationAppleIDCredential; // inherited from NSObject

	static new(): ASAuthorizationAppleIDCredential; // inherited from NSObject

	readonly authorizationCode: NSData;

	readonly authorizedScopes: NSArray<string>;

	readonly email: string;

	readonly fullName: NSPersonNameComponents;

	readonly identityToken: NSData;

	readonly realUserStatus: ASUserDetectionStatus;

	readonly state: string;

	readonly user: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class ASAuthorizationAppleIDProvider extends NSObject implements ASAuthorizationProvider {

	static alloc(): ASAuthorizationAppleIDProvider; // inherited from NSObject

	static new(): ASAuthorizationAppleIDProvider; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	createRequest(): ASAuthorizationAppleIDRequest;

	getCredentialStateForUserIDCompletion(userID: string, completion: (p1: ASAuthorizationAppleIDProviderCredentialState, p2: NSError) => void): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare var ASAuthorizationAppleIDProviderCredentialRevokedNotification: string;

declare const enum ASAuthorizationAppleIDProviderCredentialState {

	Revoked = 0,

	Authorized = 1,

	NotFound = 2,

	Transferred = 3
}

declare class ASAuthorizationAppleIDRequest extends ASAuthorizationOpenIDRequest {

	static alloc(): ASAuthorizationAppleIDRequest; // inherited from NSObject

	static new(): ASAuthorizationAppleIDRequest; // inherited from NSObject

	user: string;
}

declare class ASAuthorizationController extends NSObject {

	static alloc(): ASAuthorizationController; // inherited from NSObject

	static new(): ASAuthorizationController; // inherited from NSObject

	readonly authorizationRequests: NSArray<ASAuthorizationRequest>;

	delegate: ASAuthorizationControllerDelegate;

	presentationContextProvider: ASAuthorizationControllerPresentationContextProviding;

	constructor(o: { authorizationRequests: NSArray<ASAuthorizationRequest> | ASAuthorizationRequest[]; });

	initWithAuthorizationRequests(authorizationRequests: NSArray<ASAuthorizationRequest> | ASAuthorizationRequest[]): this;

	performRequests(): void;
}

interface ASAuthorizationControllerDelegate extends NSObjectProtocol {

	authorizationControllerDidCompleteWithAuthorization?(controller: ASAuthorizationController, authorization: ASAuthorization): void;

	authorizationControllerDidCompleteWithError?(controller: ASAuthorizationController, error: NSError): void;
}
declare var ASAuthorizationControllerDelegate: {

	prototype: ASAuthorizationControllerDelegate;
};

interface ASAuthorizationControllerPresentationContextProviding extends NSObjectProtocol {

	presentationAnchorForAuthorizationController(controller: ASAuthorizationController): UIWindow;
}
declare var ASAuthorizationControllerPresentationContextProviding: {

	prototype: ASAuthorizationControllerPresentationContextProviding;
};

interface ASAuthorizationCredential extends NSCopying, NSObjectProtocol, NSSecureCoding {
}
declare var ASAuthorizationCredential: {

	prototype: ASAuthorizationCredential;
};

declare const enum ASAuthorizationError {

	Unknown = 1000,

	Canceled = 1001,

	InvalidResponse = 1002,

	NotHandled = 1003,

	Failed = 1004
}

declare var ASAuthorizationErrorDomain: string;

declare class ASAuthorizationOpenIDRequest extends ASAuthorizationRequest {

	static alloc(): ASAuthorizationOpenIDRequest; // inherited from NSObject

	static new(): ASAuthorizationOpenIDRequest; // inherited from NSObject

	nonce: string;

	requestedOperation: string;

	requestedScopes: NSArray<string>;

	state: string;
}

declare var ASAuthorizationOperationImplicit: string;

declare var ASAuthorizationOperationLogin: string;

declare var ASAuthorizationOperationLogout: string;

declare var ASAuthorizationOperationRefresh: string;

declare class ASAuthorizationPasswordProvider extends NSObject implements ASAuthorizationProvider {

	static alloc(): ASAuthorizationPasswordProvider; // inherited from NSObject

	static new(): ASAuthorizationPasswordProvider; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	createRequest(): ASAuthorizationPasswordRequest;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class ASAuthorizationPasswordRequest extends ASAuthorizationRequest {

	static alloc(): ASAuthorizationPasswordRequest; // inherited from NSObject

	static new(): ASAuthorizationPasswordRequest; // inherited from NSObject
}

interface ASAuthorizationProvider extends NSObjectProtocol {
}
declare var ASAuthorizationProvider: {

	prototype: ASAuthorizationProvider;
};

declare class ASAuthorizationProviderExtensionAuthorizationRequest extends NSObject {

	static alloc(): ASAuthorizationProviderExtensionAuthorizationRequest; // inherited from NSObject

	static new(): ASAuthorizationProviderExtensionAuthorizationRequest; // inherited from NSObject

	readonly authorizationOptions: NSDictionary<any, any>;

	readonly callerBundleIdentifier: string;

	readonly extensionData: NSDictionary<any, any>;

	readonly httpBody: NSData;

	readonly httpHeaders: NSDictionary<string, string>;

	readonly realm: string;

	readonly requestedOperation: string;

	readonly url: NSURL;

	cancel(): void;

	complete(): void;

	completeWithError(error: NSError): void;

	completeWithHTTPAuthorizationHeaders(httpAuthorizationHeaders: NSDictionary<string, string>): void;

	completeWithHTTPResponseHttpBody(httpResponse: NSHTTPURLResponse, httpBody: NSData): void;

	doNotHandle(): void;

	presentAuthorizationViewControllerWithCompletion(completion: (p1: boolean, p2: NSError) => void): void;
}

interface ASAuthorizationProviderExtensionAuthorizationRequestHandler extends NSObjectProtocol {

	beginAuthorizationWithRequest(request: ASAuthorizationProviderExtensionAuthorizationRequest): void;

	cancelAuthorizationWithRequest?(request: ASAuthorizationProviderExtensionAuthorizationRequest): void;
}
declare var ASAuthorizationProviderExtensionAuthorizationRequestHandler: {

	prototype: ASAuthorizationProviderExtensionAuthorizationRequestHandler;
};

declare class ASAuthorizationRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASAuthorizationRequest; // inherited from NSObject

	static new(): ASAuthorizationRequest; // inherited from NSObject

	readonly provider: ASAuthorizationProvider;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var ASAuthorizationScopeEmail: string;

declare var ASAuthorizationScopeFullName: string;

declare class ASAuthorizationSingleSignOnCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASAuthorizationSingleSignOnCredential; // inherited from NSObject

	static new(): ASAuthorizationSingleSignOnCredential; // inherited from NSObject

	readonly accessToken: NSData;

	readonly authenticatedResponse: NSHTTPURLResponse;

	readonly authorizedScopes: NSArray<string>;

	readonly identityToken: NSData;

	readonly state: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class ASAuthorizationSingleSignOnProvider extends NSObject implements ASAuthorizationProvider {

	static alloc(): ASAuthorizationSingleSignOnProvider; // inherited from NSObject

	static authorizationProviderWithIdentityProviderURL(url: NSURL): ASAuthorizationSingleSignOnProvider;

	static new(): ASAuthorizationSingleSignOnProvider; // inherited from NSObject

	readonly canPerformAuthorization: boolean;

	readonly url: NSURL;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	createRequest(): ASAuthorizationSingleSignOnRequest;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

declare class ASAuthorizationSingleSignOnRequest extends ASAuthorizationOpenIDRequest {

	static alloc(): ASAuthorizationSingleSignOnRequest; // inherited from NSObject

	static new(): ASAuthorizationSingleSignOnRequest; // inherited from NSObject

	authorizationOptions: NSArray<NSURLQueryItem>;
}

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

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

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

declare class ASPasswordCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASPasswordCredential; // inherited from NSObject

	static credentialWithUserPassword(user: string, password: string): ASPasswordCredential;

	static new(): ASPasswordCredential; // inherited from NSObject

	readonly password: string;

	readonly user: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { user: string; password: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithUserPassword(user: string, password: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
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

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithServiceIdentifierUserRecordIdentifier(serviceIdentifier: ASCredentialServiceIdentifier, user: string, recordIdentifier: string): this;
}

declare const enum ASUserDetectionStatus {

	Unsupported = 0,

	Unknown = 1,

	LikelyReal = 2
}

interface ASWebAuthenticationPresentationContextProviding extends NSObjectProtocol {

	presentationAnchorForWebAuthenticationSession(session: ASWebAuthenticationSession): UIWindow;
}
declare var ASWebAuthenticationPresentationContextProviding: {

	prototype: ASWebAuthenticationPresentationContextProviding;
};

declare class ASWebAuthenticationSession extends NSObject {

	static alloc(): ASWebAuthenticationSession; // inherited from NSObject

	static new(): ASWebAuthenticationSession; // inherited from NSObject

	prefersEphemeralWebBrowserSession: boolean;

	presentationContextProvider: ASWebAuthenticationPresentationContextProviding;

	constructor(o: { URL: NSURL; callbackURLScheme: string; completionHandler: (p1: NSURL, p2: NSError) => void; });

	cancel(): void;

	initWithURLCallbackURLSchemeCompletionHandler(URL: NSURL, callbackURLScheme: string, completionHandler: (p1: NSURL, p2: NSError) => void): this;

	start(): boolean;
}

declare const enum ASWebAuthenticationSessionErrorCode {

	CanceledLogin = 1,

	PresentationContextNotProvided = 2,

	PresentationContextInvalid = 3
}

declare var ASWebAuthenticationSessionErrorDomain: string;
