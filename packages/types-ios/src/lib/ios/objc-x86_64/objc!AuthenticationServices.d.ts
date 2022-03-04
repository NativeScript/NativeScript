
declare class ASAccountAuthenticationModificationController extends NSObject {

	static alloc(): ASAccountAuthenticationModificationController; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationController; // inherited from NSObject

	delegate: ASAccountAuthenticationModificationControllerDelegate;

	presentationContextProvider: ASAccountAuthenticationModificationControllerPresentationContextProviding;

	performRequest(request: ASAccountAuthenticationModificationRequest): void;
}

interface ASAccountAuthenticationModificationControllerDelegate extends NSObjectProtocol {

	accountAuthenticationModificationControllerDidFailRequestWithError?(controller: ASAccountAuthenticationModificationController, request: ASAccountAuthenticationModificationRequest, error: NSError): void;

	accountAuthenticationModificationControllerDidSuccessfullyCompleteRequestWithUserInfo?(controller: ASAccountAuthenticationModificationController, request: ASAccountAuthenticationModificationRequest, userInfo: NSDictionary<any, any>): void;
}
declare var ASAccountAuthenticationModificationControllerDelegate: {

	prototype: ASAccountAuthenticationModificationControllerDelegate;
};

interface ASAccountAuthenticationModificationControllerPresentationContextProviding extends NSObjectProtocol {

	presentationAnchorForAccountAuthenticationModificationController(controller: ASAccountAuthenticationModificationController): UIWindow;
}
declare var ASAccountAuthenticationModificationControllerPresentationContextProviding: {

	prototype: ASAccountAuthenticationModificationControllerPresentationContextProviding;
};

declare class ASAccountAuthenticationModificationExtensionContext extends NSExtensionContext {

	static alloc(): ASAccountAuthenticationModificationExtensionContext; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationExtensionContext; // inherited from NSObject

	completeChangePasswordRequestWithUpdatedCredentialUserInfo(updatedCredential: ASPasswordCredential, userInfo: NSDictionary<any, any>): void;

	completeUpgradeToSignInWithAppleWithUserInfo(userInfo: NSDictionary<any, any>): void;

	getSignInWithAppleUpgradeAuthorizationWithStateNonceCompletionHandler(state: string, nonce: string, completionHandler: (p1: ASAuthorizationAppleIDCredential, p2: NSError) => void): void;
}

declare class ASAccountAuthenticationModificationReplacePasswordWithSignInWithAppleRequest extends ASAccountAuthenticationModificationRequest {

	static alloc(): ASAccountAuthenticationModificationReplacePasswordWithSignInWithAppleRequest; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationReplacePasswordWithSignInWithAppleRequest; // inherited from NSObject

	readonly serviceIdentifier: ASCredentialServiceIdentifier;

	readonly user: string;

	readonly userInfo: NSDictionary<any, any>;

	constructor(o: { user: string; serviceIdentifier: ASCredentialServiceIdentifier; userInfo: NSDictionary<any, any>; });

	initWithUserServiceIdentifierUserInfo(user: string, serviceIdentifier: ASCredentialServiceIdentifier, userInfo: NSDictionary<any, any>): this;
}

declare class ASAccountAuthenticationModificationRequest extends NSObject {

	static alloc(): ASAccountAuthenticationModificationRequest; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationRequest; // inherited from NSObject
}

declare class ASAccountAuthenticationModificationUpgradePasswordToStrongPasswordRequest extends ASAccountAuthenticationModificationRequest {

	static alloc(): ASAccountAuthenticationModificationUpgradePasswordToStrongPasswordRequest; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationUpgradePasswordToStrongPasswordRequest; // inherited from NSObject

	readonly serviceIdentifier: ASCredentialServiceIdentifier;

	readonly user: string;

	readonly userInfo: NSDictionary<any, any>;

	constructor(o: { user: string; serviceIdentifier: ASCredentialServiceIdentifier; userInfo: NSDictionary<any, any>; });

	initWithUserServiceIdentifierUserInfo(user: string, serviceIdentifier: ASCredentialServiceIdentifier, userInfo: NSDictionary<any, any>): this;
}

declare class ASAccountAuthenticationModificationViewController extends UIViewController {

	static alloc(): ASAccountAuthenticationModificationViewController; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationViewController; // inherited from NSObject

	readonly extensionContext: ASAccountAuthenticationModificationExtensionContext;

	cancelRequest(): void;

	changePasswordWithoutUserInteractionForServiceIdentifierExistingCredentialNewPasswordUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, newPassword: string, userInfo: NSDictionary<any, any>): void;

	convertAccountToSignInWithAppleWithoutUserInteractionForServiceIdentifierExistingCredentialUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, userInfo: NSDictionary<any, any>): void;

	prepareInterfaceToChangePasswordForServiceIdentifierExistingCredentialNewPasswordUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, newPassword: string, userInfo: NSDictionary<any, any>): void;

	prepareInterfaceToConvertAccountToSignInWithAppleForServiceIdentifierExistingCredentialUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, userInfo: NSDictionary<any, any>): void;
}

declare class ASAuthorization extends NSObject {

	static alloc(): ASAuthorization; // inherited from NSObject

	static new(): ASAuthorization; // inherited from NSObject

	readonly credential: ASAuthorizationCredential;

	readonly provider: ASAuthorizationProvider;
}

declare function ASAuthorizationAllSupportedPublicKeyCredentialDescriptorTransports(): NSArray<string>;

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

	Failed = 1004,

	NotInteractive = 1005
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

declare class ASAuthorizationPlatformPublicKeyCredentialAssertion extends NSObject implements ASAuthorizationPublicKeyCredentialAssertion {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialAssertion; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialAssertion; // inherited from NSObject

	readonly credentialID: NSData; // inherited from ASPublicKeyCredential

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly rawAuthenticatorData: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertion

	readonly rawClientDataJSON: NSData; // inherited from ASPublicKeyCredential

	readonly signature: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertion

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly userID: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertion

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

declare class ASAuthorizationPlatformPublicKeyCredentialAssertionRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialAssertionRequest {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialAssertionRequest; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialAssertionRequest; // inherited from NSObject

	allowedCredentials: NSArray<ASAuthorizationPublicKeyCredentialDescriptor>; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	relyingPartyIdentifier: string; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userVerificationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

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

declare class ASAuthorizationPlatformPublicKeyCredentialDescriptor extends NSObject implements ASAuthorizationPublicKeyCredentialDescriptor {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialDescriptor; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialDescriptor; // inherited from NSObject

	credentialID: NSData; // inherited from ASAuthorizationPublicKeyCredentialDescriptor

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { credentialID: NSData; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCredentialID(credentialID: NSData): this;

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

declare class ASAuthorizationPlatformPublicKeyCredentialProvider extends NSObject implements ASAuthorizationProvider {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialProvider; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialProvider; // inherited from NSObject

	readonly relyingPartyIdentifier: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { relyingPartyIdentifier: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	createCredentialAssertionRequestWithChallenge(challenge: NSData): ASAuthorizationPlatformPublicKeyCredentialAssertionRequest;

	createCredentialRegistrationRequestWithChallengeNameUserID(challenge: NSData, name: string, userID: NSData): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest;

	initWithRelyingPartyIdentifier(relyingPartyIdentifier: string): this;

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

declare class ASAuthorizationPlatformPublicKeyCredentialRegistration extends NSObject implements ASAuthorizationPublicKeyCredentialRegistration {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialRegistration; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialRegistration; // inherited from NSObject

	readonly credentialID: NSData; // inherited from ASPublicKeyCredential

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly rawAttestationObject: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistration

	readonly rawClientDataJSON: NSData; // inherited from ASPublicKeyCredential

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

declare class ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialRegistrationRequest {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	attestationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	displayName: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	name: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly relyingPartyIdentifier: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userID: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	userVerificationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

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

interface ASAuthorizationProvider extends NSObjectProtocol {
}
declare var ASAuthorizationProvider: {

	prototype: ASAuthorizationProvider;
};

declare var ASAuthorizationProviderAuthorizationOperationConfigurationRemoved: string;

declare class ASAuthorizationProviderExtensionAuthorizationRequest extends NSObject {

	static alloc(): ASAuthorizationProviderExtensionAuthorizationRequest; // inherited from NSObject

	static new(): ASAuthorizationProviderExtensionAuthorizationRequest; // inherited from NSObject

	readonly authorizationOptions: NSDictionary<any, any>;

	readonly callerBundleIdentifier: string;

	readonly callerManaged: boolean;

	readonly callerTeamIdentifier: string;

	readonly extensionData: NSDictionary<any, any>;

	readonly httpBody: NSData;

	readonly httpHeaders: NSDictionary<string, string>;

	readonly localizedCallerDisplayName: string;

	readonly realm: string;

	readonly requestedOperation: string;

	readonly url: NSURL;

	readonly userInterfaceEnabled: boolean;

	cancel(): void;

	complete(): void;

	completeWithAuthorizationResult(authorizationResult: ASAuthorizationProviderExtensionAuthorizationResult): void;

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

declare class ASAuthorizationProviderExtensionAuthorizationResult extends NSObject {

	static alloc(): ASAuthorizationProviderExtensionAuthorizationResult; // inherited from NSObject

	static new(): ASAuthorizationProviderExtensionAuthorizationResult; // inherited from NSObject

	httpAuthorizationHeaders: NSDictionary<string, string>;

	httpBody: NSData;

	httpResponse: NSHTTPURLResponse;

	privateKeys: NSArray<any>;

	constructor(o: { HTTPAuthorizationHeaders: NSDictionary<string, string>; });

	constructor(o: { HTTPResponse: NSHTTPURLResponse; httpBody: NSData; });

	initWithHTTPAuthorizationHeaders(httpAuthorizationHeaders: NSDictionary<string, string>): this;

	initWithHTTPResponseHttpBody(httpResponse: NSHTTPURLResponse, httpBody: NSData): this;
}

interface ASAuthorizationPublicKeyCredentialAssertion extends ASPublicKeyCredential {

	rawAuthenticatorData: NSData;

	signature: NSData;

	userID: NSData;
}
declare var ASAuthorizationPublicKeyCredentialAssertion: {

	prototype: ASAuthorizationPublicKeyCredentialAssertion;
};

interface ASAuthorizationPublicKeyCredentialAssertionRequest extends NSCopying, NSObjectProtocol, NSSecureCoding {

	allowedCredentials: NSArray<ASAuthorizationPublicKeyCredentialDescriptor>;

	challenge: NSData;

	relyingPartyIdentifier: string;

	userVerificationPreference: string;
}
declare var ASAuthorizationPublicKeyCredentialAssertionRequest: {

	prototype: ASAuthorizationPublicKeyCredentialAssertionRequest;
};

declare var ASAuthorizationPublicKeyCredentialAttestationKindDirect: string;

declare var ASAuthorizationPublicKeyCredentialAttestationKindEnterprise: string;

declare var ASAuthorizationPublicKeyCredentialAttestationKindIndirect: string;

declare var ASAuthorizationPublicKeyCredentialAttestationKindNone: string;

interface ASAuthorizationPublicKeyCredentialDescriptor extends NSCopying, NSObjectProtocol, NSSecureCoding {

	credentialID: NSData;
}
declare var ASAuthorizationPublicKeyCredentialDescriptor: {

	prototype: ASAuthorizationPublicKeyCredentialDescriptor;
};

declare class ASAuthorizationPublicKeyCredentialParameters extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASAuthorizationPublicKeyCredentialParameters; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialParameters; // inherited from NSObject

	readonly algorithm: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { algorithm: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAlgorithm(algorithm: number): this;

	initWithCoder(coder: NSCoder): this;
}

interface ASAuthorizationPublicKeyCredentialRegistration extends ASPublicKeyCredential {

	rawAttestationObject: NSData;
}
declare var ASAuthorizationPublicKeyCredentialRegistration: {

	prototype: ASAuthorizationPublicKeyCredentialRegistration;
};

interface ASAuthorizationPublicKeyCredentialRegistrationRequest extends NSCopying, NSObjectProtocol, NSSecureCoding {

	attestationPreference: string;

	challenge: NSData;

	displayName: string;

	name: string;

	relyingPartyIdentifier: string;

	userID: NSData;

	userVerificationPreference: string;
}
declare var ASAuthorizationPublicKeyCredentialRegistrationRequest: {

	prototype: ASAuthorizationPublicKeyCredentialRegistrationRequest;
};

declare var ASAuthorizationPublicKeyCredentialResidentKeyPreferenceDiscouraged: string;

declare var ASAuthorizationPublicKeyCredentialResidentKeyPreferencePreferred: string;

declare var ASAuthorizationPublicKeyCredentialResidentKeyPreferenceRequired: string;

declare var ASAuthorizationPublicKeyCredentialUserVerificationPreferenceDiscouraged: string;

declare var ASAuthorizationPublicKeyCredentialUserVerificationPreferencePreferred: string;

declare var ASAuthorizationPublicKeyCredentialUserVerificationPreferenceRequired: string;

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

declare class ASAuthorizationSecurityKeyPublicKeyCredentialAssertion extends NSObject implements ASAuthorizationPublicKeyCredentialAssertion {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertion; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertion; // inherited from NSObject

	readonly credentialID: NSData; // inherited from ASPublicKeyCredential

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly rawAuthenticatorData: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertion

	readonly rawClientDataJSON: NSData; // inherited from ASPublicKeyCredential

	readonly signature: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertion

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly userID: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertion

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

declare class ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialAssertionRequest {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest; // inherited from NSObject

	allowedCredentials: NSArray<ASAuthorizationPublicKeyCredentialDescriptor>; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	relyingPartyIdentifier: string; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userVerificationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

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

declare class ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor extends NSObject implements ASAuthorizationPublicKeyCredentialDescriptor {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor; // inherited from NSObject

	transports: NSArray<string>;

	credentialID: NSData; // inherited from ASAuthorizationPublicKeyCredentialDescriptor

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { credentialID: NSData; transports: NSArray<string> | string[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCredentialIDTransports(credentialID: NSData, allowedTransports: NSArray<string> | string[]): this;

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

declare var ASAuthorizationSecurityKeyPublicKeyCredentialDescriptorTransportBluetooth: string;

declare var ASAuthorizationSecurityKeyPublicKeyCredentialDescriptorTransportNFC: string;

declare var ASAuthorizationSecurityKeyPublicKeyCredentialDescriptorTransportUSB: string;

declare class ASAuthorizationSecurityKeyPublicKeyCredentialProvider extends NSObject implements ASAuthorizationProvider {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialProvider; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialProvider; // inherited from NSObject

	readonly relyingPartyIdentifier: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { relyingPartyIdentifier: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	createCredentialAssertionRequestWithChallenge(challenge: NSData): ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest;

	createCredentialRegistrationRequestWithChallengeDisplayNameNameUserID(challenge: NSData, displayName: string, name: string, userID: NSData): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest;

	initWithRelyingPartyIdentifier(relyingPartyIdentifier: string): this;

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

declare class ASAuthorizationSecurityKeyPublicKeyCredentialRegistration extends NSObject implements ASAuthorizationPublicKeyCredentialRegistration {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistration; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistration; // inherited from NSObject

	readonly credentialID: NSData; // inherited from ASPublicKeyCredential

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly rawAttestationObject: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistration

	readonly rawClientDataJSON: NSData; // inherited from ASPublicKeyCredential

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

declare class ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialRegistrationRequest {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	credentialParameters: NSArray<ASAuthorizationPublicKeyCredentialParameters>;

	excludedCredentials: NSArray<ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor>;

	residentKeyPreference: string;

	attestationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	displayName: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	name: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly relyingPartyIdentifier: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userID: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	userVerificationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

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

declare class ASAuthorizationSingleSignOnCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASAuthorizationSingleSignOnCredential; // inherited from NSObject

	static new(): ASAuthorizationSingleSignOnCredential; // inherited from NSObject

	readonly accessToken: NSData;

	readonly authenticatedResponse: NSHTTPURLResponse;

	readonly authorizedScopes: NSArray<string>;

	readonly identityToken: NSData;

	readonly privateKeys: NSArray<any>;

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

	userInterfaceEnabled: boolean;
}

declare var ASCOSEAlgorithmIdentifierES256: number;

declare var ASCOSEEllipticCurveIdentifierP256: number;

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

declare var ASExtensionLocalizedFailureReasonErrorKey: string;

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

interface ASPublicKeyCredential extends ASAuthorizationCredential {

	credentialID: NSData;

	rawClientDataJSON: NSData;
}
declare var ASPublicKeyCredential: {

	prototype: ASPublicKeyCredential;
};

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

	readonly canStart: boolean;

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
