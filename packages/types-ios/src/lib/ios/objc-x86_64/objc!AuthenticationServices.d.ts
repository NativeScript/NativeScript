
/**
 * @since 14.0
 */
declare class ASAccountAuthenticationModificationController extends NSObject {

	static alloc(): ASAccountAuthenticationModificationController; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationController; // inherited from NSObject

	delegate: ASAccountAuthenticationModificationControllerDelegate | null;

	presentationContextProvider: ASAccountAuthenticationModificationControllerPresentationContextProviding | null;

	performRequest(request: ASAccountAuthenticationModificationRequest): void;
}

/**
 * @since 14.0
 */
interface ASAccountAuthenticationModificationControllerDelegate extends NSObjectProtocol {

	accountAuthenticationModificationControllerDidFailRequestWithError?(controller: ASAccountAuthenticationModificationController, request: ASAccountAuthenticationModificationRequest, error: NSError): void;

	accountAuthenticationModificationControllerDidSuccessfullyCompleteRequestWithUserInfo?(controller: ASAccountAuthenticationModificationController, request: ASAccountAuthenticationModificationRequest, userInfo: NSDictionary<any, any> | null): void;
}
declare var ASAccountAuthenticationModificationControllerDelegate: {

	prototype: ASAccountAuthenticationModificationControllerDelegate;
};

/**
 * @since 14.0
 */
interface ASAccountAuthenticationModificationControllerPresentationContextProviding extends NSObjectProtocol {

	presentationAnchorForAccountAuthenticationModificationController(controller: ASAccountAuthenticationModificationController): UIWindow;
}
declare var ASAccountAuthenticationModificationControllerPresentationContextProviding: {

	prototype: ASAccountAuthenticationModificationControllerPresentationContextProviding;
};

/**
 * @since 14.0
 */
declare class ASAccountAuthenticationModificationExtensionContext extends NSExtensionContext {

	static alloc(): ASAccountAuthenticationModificationExtensionContext; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationExtensionContext; // inherited from NSObject

	completeChangePasswordRequestWithUpdatedCredentialUserInfo(updatedCredential: ASPasswordCredential, userInfo: NSDictionary<any, any> | null): void;

	completeUpgradeToSignInWithAppleWithUserInfo(userInfo: NSDictionary<any, any> | null): void;

	getSignInWithAppleUpgradeAuthorizationWithStateNonceCompletionHandler(state: string | null, nonce: string | null, completionHandler: (p1: ASAuthorizationAppleIDCredential | null, p2: NSError | null) => void): void;
}

/**
 * @since 14.0
 */
declare class ASAccountAuthenticationModificationReplacePasswordWithSignInWithAppleRequest extends ASAccountAuthenticationModificationRequest {

	static alloc(): ASAccountAuthenticationModificationReplacePasswordWithSignInWithAppleRequest; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationReplacePasswordWithSignInWithAppleRequest; // inherited from NSObject

	readonly serviceIdentifier: ASCredentialServiceIdentifier;

	readonly user: string;

	readonly userInfo: NSDictionary<any, any> | null;

	constructor(o: { user: string; serviceIdentifier: ASCredentialServiceIdentifier; userInfo: NSDictionary<any, any> | null; });

	initWithUserServiceIdentifierUserInfo(user: string, serviceIdentifier: ASCredentialServiceIdentifier, userInfo: NSDictionary<any, any> | null): this;
}

/**
 * @since 14.0
 */
declare class ASAccountAuthenticationModificationRequest extends NSObject {

	static alloc(): ASAccountAuthenticationModificationRequest; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationRequest; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class ASAccountAuthenticationModificationUpgradePasswordToStrongPasswordRequest extends ASAccountAuthenticationModificationRequest {

	static alloc(): ASAccountAuthenticationModificationUpgradePasswordToStrongPasswordRequest; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationUpgradePasswordToStrongPasswordRequest; // inherited from NSObject

	readonly serviceIdentifier: ASCredentialServiceIdentifier;

	readonly user: string;

	readonly userInfo: NSDictionary<any, any> | null;

	constructor(o: { user: string; serviceIdentifier: ASCredentialServiceIdentifier; userInfo: NSDictionary<any, any> | null; });

	initWithUserServiceIdentifierUserInfo(user: string, serviceIdentifier: ASCredentialServiceIdentifier, userInfo: NSDictionary<any, any> | null): this;
}

/**
 * @since 14.0
 */
declare class ASAccountAuthenticationModificationViewController extends UIViewController {

	static alloc(): ASAccountAuthenticationModificationViewController; // inherited from NSObject

	static new(): ASAccountAuthenticationModificationViewController; // inherited from NSObject

	readonly extensionContext: ASAccountAuthenticationModificationExtensionContext;

	cancelRequest(): void;

	changePasswordWithoutUserInteractionForServiceIdentifierExistingCredentialNewPasswordUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, newPassword: string, userInfo: NSDictionary<any, any> | null): void;

	convertAccountToSignInWithAppleWithoutUserInteractionForServiceIdentifierExistingCredentialUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, userInfo: NSDictionary<any, any> | null): void;

	prepareInterfaceToChangePasswordForServiceIdentifierExistingCredentialNewPasswordUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, newPassword: string, userInfo: NSDictionary<any, any> | null): void;

	prepareInterfaceToConvertAccountToSignInWithAppleForServiceIdentifierExistingCredentialUserInfo(serviceIdentifier: ASCredentialServiceIdentifier, existingCredential: ASPasswordCredential, userInfo: NSDictionary<any, any> | null): void;
}

/**
 * @since 13.0
 */
declare class ASAuthorization extends NSObject {

	static alloc(): ASAuthorization; // inherited from NSObject

	static new(): ASAuthorization; // inherited from NSObject

	readonly credential: ASAuthorizationCredential;

	readonly provider: ASAuthorizationProvider;
}

/**
 * @since 15.0
 */
declare function ASAuthorizationAllSupportedPublicKeyCredentialDescriptorTransports(): NSArray<string>;

/**
 * @since 13.0
 */
declare class ASAuthorizationAppleIDButton extends UIControl {

	static alloc(): ASAuthorizationAppleIDButton; // inherited from NSObject

	static appearance(): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject | null): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject | null): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): ASAuthorizationAppleIDButton; // inherited from UIAppearance

	static buttonWithTypeStyle(type: ASAuthorizationAppleIDButtonType, style: ASAuthorizationAppleIDButtonStyle): ASAuthorizationAppleIDButton;

	static new(): ASAuthorizationAppleIDButton; // inherited from NSObject

	cornerRadius: number;

	constructor(o: { authorizationButtonType: ASAuthorizationAppleIDButtonType; authorizationButtonStyle: ASAuthorizationAppleIDButtonStyle; });

	initWithAuthorizationButtonTypeAuthorizationButtonStyle(type: ASAuthorizationAppleIDButtonType, style: ASAuthorizationAppleIDButtonStyle): this;
}

/**
 * @since 13.0
 */
declare const enum ASAuthorizationAppleIDButtonStyle {

	White = 0,

	WhiteOutline = 1,

	Black = 2
}

/**
 * @since 13.0
 */
declare const enum ASAuthorizationAppleIDButtonType {

	SignIn = 0,

	Continue = 1,

	SignUp = 2,

	Default = 0
}

/**
 * @since 13.0
 */
declare class ASAuthorizationAppleIDCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASAuthorizationAppleIDCredential; // inherited from NSObject

	static new(): ASAuthorizationAppleIDCredential; // inherited from NSObject

	readonly authorizationCode: NSData | null;

	readonly authorizedScopes: NSArray<string>;

	readonly email: string | null;

	readonly fullName: NSPersonNameComponents | null;

	readonly identityToken: NSData | null;

	readonly realUserStatus: ASUserDetectionStatus;

	readonly state: string | null;

	readonly user: string;

	/**
	 * @since 17.0
	 */
	readonly userAgeRange: ASUserAgeRange;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 13.0
 */
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

	getCredentialStateForUserIDCompletion(userID: string, completion: (p1: ASAuthorizationAppleIDProviderCredentialState, p2: NSError | null) => void): void;

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

/**
 * @since 13.0
 */
declare var ASAuthorizationAppleIDProviderCredentialRevokedNotification: string;

/**
 * @since 13.0
 */
declare const enum ASAuthorizationAppleIDProviderCredentialState {

	Revoked = 0,

	Authorized = 1,

	NotFound = 2,

	Transferred = 3
}

/**
 * @since 13.0
 */
declare class ASAuthorizationAppleIDRequest extends ASAuthorizationOpenIDRequest {

	static alloc(): ASAuthorizationAppleIDRequest; // inherited from NSObject

	static new(): ASAuthorizationAppleIDRequest; // inherited from NSObject

	user: string | null;
}

/**
 * @since 13.0
 */
declare class ASAuthorizationController extends NSObject {

	static alloc(): ASAuthorizationController; // inherited from NSObject

	static new(): ASAuthorizationController; // inherited from NSObject

	readonly authorizationRequests: NSArray<ASAuthorizationRequest>;

	delegate: ASAuthorizationControllerDelegate | null;

	presentationContextProvider: ASAuthorizationControllerPresentationContextProviding | null;

	constructor(o: { authorizationRequests: NSArray<ASAuthorizationRequest> | ASAuthorizationRequest[]; });

	/**
	 * @since 16.0
	 */
	cancel(): void;

	initWithAuthorizationRequests(authorizationRequests: NSArray<ASAuthorizationRequest> | ASAuthorizationRequest[]): this;

	/**
	 * @since 16.0
	 */
	performAutoFillAssistedRequests(): void;

	performRequests(): void;

	/**
	 * @since 16.0
	 */
	performRequestsWithOptions(options: ASAuthorizationControllerRequestOptions): void;
}

/**
 * @since 13.0
 */
interface ASAuthorizationControllerDelegate extends NSObjectProtocol {

	authorizationControllerDidCompleteWithAuthorization?(controller: ASAuthorizationController, authorization: ASAuthorization): void;

	authorizationControllerDidCompleteWithError?(controller: ASAuthorizationController, error: NSError): void;
}
declare var ASAuthorizationControllerDelegate: {

	prototype: ASAuthorizationControllerDelegate;
};

/**
 * @since 13.0
 */
interface ASAuthorizationControllerPresentationContextProviding extends NSObjectProtocol {

	presentationAnchorForAuthorizationController(controller: ASAuthorizationController): UIWindow;
}
declare var ASAuthorizationControllerPresentationContextProviding: {

	prototype: ASAuthorizationControllerPresentationContextProviding;
};

/**
 * @since 16.0
 */
declare const enum ASAuthorizationControllerRequestOptions {

	PreferImmediatelyAvailableCredentials = 1
}

/**
 * @since 13.0
 */
interface ASAuthorizationCredential extends NSCopying, NSObjectProtocol, NSSecureCoding {
}
declare var ASAuthorizationCredential: {

	prototype: ASAuthorizationCredential;
};

/**
 * @since 13.0
 */
declare const enum ASAuthorizationError {

	Unknown = 1000,

	Canceled = 1001,

	InvalidResponse = 1002,

	NotHandled = 1003,

	Failed = 1004,

	NotInteractive = 1005,

	MatchedExcludedCredential = 1006,

	CredentialImport = 1007,

	CredentialExport = 1008,

	PreferSignInWithApple = 1009,

	DeviceNotConfiguredForPasskeyCreation = 1010
}

/**
 * @since 13.0
 */
declare var ASAuthorizationErrorDomain: string;

/**
 * @since 13.0
 */
declare class ASAuthorizationOpenIDRequest extends ASAuthorizationRequest {

	static alloc(): ASAuthorizationOpenIDRequest; // inherited from NSObject

	static new(): ASAuthorizationOpenIDRequest; // inherited from NSObject

	nonce: string | null;

	requestedOperation: string;

	requestedScopes: NSArray<string> | null;

	state: string | null;
}

/**
 * @since 13.0
 */
declare var ASAuthorizationOperationImplicit: string;

/**
 * @since 13.0
 */
declare var ASAuthorizationOperationLogin: string;

/**
 * @since 13.0
 */
declare var ASAuthorizationOperationLogout: string;

/**
 * @since 13.0
 */
declare var ASAuthorizationOperationRefresh: string;

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare class ASAuthorizationPasswordRequest extends ASAuthorizationRequest {

	static alloc(): ASAuthorizationPasswordRequest; // inherited from NSObject

	static new(): ASAuthorizationPasswordRequest; // inherited from NSObject
}

/**
 * @since 15.0
 */
declare class ASAuthorizationPlatformPublicKeyCredentialAssertion extends NSObject implements ASAuthorizationPublicKeyCredentialAssertion {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialAssertion; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialAssertion; // inherited from NSObject

	/**
	 * @since 16.6
	 */
	readonly attachment: ASAuthorizationPublicKeyCredentialAttachment;

	/**
	 * @since 17.0
	 */
	readonly largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobAssertionOutput | null;

	/**
	 * @since 18.0
	 */
	readonly prf: ASAuthorizationPublicKeyCredentialPRFAssertionOutput | null;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
declare class ASAuthorizationPlatformPublicKeyCredentialAssertionRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialAssertionRequest, ASAuthorizationWebBrowserPlatformPublicKeyCredentialAssertionRequest {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialAssertionRequest; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialAssertionRequest; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobAssertionInput | null;

	/**
	 * @since 18.0
	 */
	prf: ASAuthorizationPublicKeyCredentialPRFAssertionInput | null;

	allowedCredentials: NSArray<ASAuthorizationPublicKeyCredentialDescriptor>; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	readonly clientData: ASPublicKeyCredentialClientData | null; // inherited from ASAuthorizationWebBrowserPlatformPublicKeyCredentialAssertionRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	relyingPartyIdentifier: string; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	shouldShowHybridTransport: boolean; // inherited from ASAuthorizationWebBrowserPlatformPublicKeyCredentialAssertionRequest

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	userVerificationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
declare class ASAuthorizationPlatformPublicKeyCredentialProvider extends NSObject implements ASAuthorizationProvider, ASAuthorizationWebBrowserPlatformPublicKeyCredentialProvider {

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

	createCredentialAssertionRequestWithClientData(clientData: ASPublicKeyCredentialClientData): ASAuthorizationPlatformPublicKeyCredentialAssertionRequest;

	createCredentialRegistrationRequestWithChallengeNameUserID(challenge: NSData, name: string, userID: NSData): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest;

	/**
	 * @since 18.0
	 */
	createCredentialRegistrationRequestWithChallengeNameUserIDRequestStyle(challenge: NSData, name: string, userID: NSData, requestStyle: ASAuthorizationPlatformPublicKeyCredentialRegistrationRequestStyle): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest;

	createCredentialRegistrationRequestWithClientDataNameUserID(clientData: ASPublicKeyCredentialClientData, name: string, userID: NSData): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest;

	/**
	 * @since 18.0
	 */
	createCredentialRegistrationRequestWithClientDataNameUserIDRequestStyle(clientData: ASPublicKeyCredentialClientData, name: string, userID: NSData, requestStyle: ASAuthorizationPlatformPublicKeyCredentialRegistrationRequestStyle): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest;

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

/**
 * @since 15.0
 */
declare class ASAuthorizationPlatformPublicKeyCredentialRegistration extends NSObject implements ASAuthorizationPublicKeyCredentialRegistration {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialRegistration; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialRegistration; // inherited from NSObject

	/**
	 * @since 16.6
	 */
	readonly attachment: ASAuthorizationPublicKeyCredentialAttachment;

	/**
	 * @since 17.0
	 */
	readonly largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobRegistrationOutput | null;

	/**
	 * @since 18.0
	 */
	readonly prf: ASAuthorizationPublicKeyCredentialPRFRegistrationOutput | null;

	readonly credentialID: NSData; // inherited from ASPublicKeyCredential

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly rawAttestationObject: NSData | null; // inherited from ASAuthorizationPublicKeyCredentialRegistration

	readonly rawClientDataJSON: NSData; // inherited from ASPublicKeyCredential

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
declare class ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialRegistrationRequest, ASAuthorizationWebBrowserPlatformPublicKeyCredentialRegistrationRequest {

	static alloc(): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	static new(): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobRegistrationInput | null;

	/**
	 * @since 18.0
	 */
	prf: ASAuthorizationPublicKeyCredentialPRFRegistrationInput | null;

	/**
	 * @since 18.0
	 */
	requestStyle: ASAuthorizationPlatformPublicKeyCredentialRegistrationRequestStyle;

	attestationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly clientData: ASPublicKeyCredentialClientData | null; // inherited from ASAuthorizationWebBrowserPlatformPublicKeyCredentialRegistrationRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	displayName: string | null; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	excludedCredentials: NSArray<ASAuthorizationPlatformPublicKeyCredentialDescriptor> | null; // inherited from ASAuthorizationWebBrowserPlatformPublicKeyCredentialRegistrationRequest

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 18.0
 */
declare const enum ASAuthorizationPlatformPublicKeyCredentialRegistrationRequestStyle {

	Standard = 0,

	Conditional = 1
}

/**
 * @since 13.0
 */
interface ASAuthorizationProvider extends NSObjectProtocol {
}
declare var ASAuthorizationProvider: {

	prototype: ASAuthorizationProvider;
};

/**
 * @since 14.0
 */
declare var ASAuthorizationProviderAuthorizationOperationConfigurationRemoved: string;

/**
 * @since 16.0
 */
declare var ASAuthorizationProviderAuthorizationOperationDirectRequest: string;

/**
 * @since 13.0
 */
declare class ASAuthorizationProviderExtensionAuthorizationRequest extends NSObject {

	static alloc(): ASAuthorizationProviderExtensionAuthorizationRequest; // inherited from NSObject

	static new(): ASAuthorizationProviderExtensionAuthorizationRequest; // inherited from NSObject

	readonly authorizationOptions: NSDictionary<any, any>;

	readonly callerBundleIdentifier: string;

	/**
	 * @since 14.0
	 */
	readonly callerManaged: boolean;

	/**
	 * @since 14.0
	 */
	readonly callerTeamIdentifier: string;

	readonly extensionData: NSDictionary<any, any>;

	readonly httpBody: NSData;

	readonly httpHeaders: NSDictionary<string, string>;

	/**
	 * @since 14.0
	 */
	readonly localizedCallerDisplayName: string;

	readonly realm: string;

	readonly requestedOperation: string;

	readonly url: NSURL;

	/**
	 * @since 15.4
	 */
	readonly userInterfaceEnabled: boolean;

	cancel(): void;

	complete(): void;

	/**
	 * @since 15.0
	 */
	completeWithAuthorizationResult(authorizationResult: ASAuthorizationProviderExtensionAuthorizationResult): void;

	completeWithError(error: NSError): void;

	completeWithHTTPAuthorizationHeaders(httpAuthorizationHeaders: NSDictionary<string, string>): void;

	completeWithHTTPResponseHttpBody(httpResponse: NSHTTPURLResponse, httpBody: NSData | null): void;

	doNotHandle(): void;

	presentAuthorizationViewControllerWithCompletion(completion: (p1: boolean, p2: NSError | null) => void): void;
}

/**
 * @since 13.0
 */
interface ASAuthorizationProviderExtensionAuthorizationRequestHandler extends NSObjectProtocol {

	beginAuthorizationWithRequest(request: ASAuthorizationProviderExtensionAuthorizationRequest): void;

	cancelAuthorizationWithRequest?(request: ASAuthorizationProviderExtensionAuthorizationRequest): void;
}
declare var ASAuthorizationProviderExtensionAuthorizationRequestHandler: {

	prototype: ASAuthorizationProviderExtensionAuthorizationRequestHandler;
};

/**
 * @since 15.0
 */
declare class ASAuthorizationProviderExtensionAuthorizationResult extends NSObject {

	static alloc(): ASAuthorizationProviderExtensionAuthorizationResult; // inherited from NSObject

	static new(): ASAuthorizationProviderExtensionAuthorizationResult; // inherited from NSObject

	httpAuthorizationHeaders: NSDictionary<string, string> | null;

	httpBody: NSData | null;

	httpResponse: NSHTTPURLResponse | null;

	privateKeys: NSArray<any>;

	constructor(o: { HTTPAuthorizationHeaders: NSDictionary<string, string>; });

	constructor(o: { HTTPResponse: NSHTTPURLResponse; httpBody: NSData | null; });

	initWithHTTPAuthorizationHeaders(httpAuthorizationHeaders: NSDictionary<string, string>): this;

	initWithHTTPResponseHttpBody(httpResponse: NSHTTPURLResponse, httpBody: NSData | null): this;
}

/**
 * @since 15.0
 */
interface ASAuthorizationPublicKeyCredentialAssertion extends ASPublicKeyCredential {

	rawAuthenticatorData: NSData;

	signature: NSData;

	userID: NSData;
}
declare var ASAuthorizationPublicKeyCredentialAssertion: {

	prototype: ASAuthorizationPublicKeyCredentialAssertion;
};

/**
 * @since 15.0
 */
interface ASAuthorizationPublicKeyCredentialAssertionRequest extends NSCopying, NSObjectProtocol, NSSecureCoding {

	allowedCredentials: NSArray<ASAuthorizationPublicKeyCredentialDescriptor>;

	challenge: NSData;

	relyingPartyIdentifier: string;

	userVerificationPreference: string;
}
declare var ASAuthorizationPublicKeyCredentialAssertionRequest: {

	prototype: ASAuthorizationPublicKeyCredentialAssertionRequest;
};

declare const enum ASAuthorizationPublicKeyCredentialAttachment {

	Platform = 0,

	CrossPlatform = 1
}

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialAttestationKindDirect: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialAttestationKindEnterprise: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialAttestationKindIndirect: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialAttestationKindNone: string;

/**
 * @since 15.0
 */
interface ASAuthorizationPublicKeyCredentialDescriptor extends NSCopying, NSObjectProtocol, NSSecureCoding {

	credentialID: NSData;
}
declare var ASAuthorizationPublicKeyCredentialDescriptor: {

	prototype: ASAuthorizationPublicKeyCredentialDescriptor;
};

/**
 * @since 17.0
 */
declare class ASAuthorizationPublicKeyCredentialLargeBlobAssertionInput extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialLargeBlobAssertionInput; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialLargeBlobAssertionInput; // inherited from NSObject

	dataToWrite: NSData | null;

	readonly operation: ASAuthorizationPublicKeyCredentialLargeBlobAssertionOperation;

	constructor(o: { operation: ASAuthorizationPublicKeyCredentialLargeBlobAssertionOperation; });

	initWithOperation(operation: ASAuthorizationPublicKeyCredentialLargeBlobAssertionOperation): this;
}

/**
 * @since 17.0
 */
declare const enum ASAuthorizationPublicKeyCredentialLargeBlobAssertionOperation {

	Read = 0,

	Write = 1
}

/**
 * @since 17.0
 */
declare class ASAuthorizationPublicKeyCredentialLargeBlobAssertionOutput extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialLargeBlobAssertionOutput; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialLargeBlobAssertionOutput; // inherited from NSObject

	readonly didWrite: boolean;

	readonly readData: NSData | null;
}

/**
 * @since 17.0
 */
declare class ASAuthorizationPublicKeyCredentialLargeBlobRegistrationInput extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialLargeBlobRegistrationInput; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialLargeBlobRegistrationInput; // inherited from NSObject

	supportRequirement: ASAuthorizationPublicKeyCredentialLargeBlobSupportRequirement;

	constructor(o: { supportRequirement: ASAuthorizationPublicKeyCredentialLargeBlobSupportRequirement; });

	initWithSupportRequirement(requirement: ASAuthorizationPublicKeyCredentialLargeBlobSupportRequirement): this;
}

/**
 * @since 17.0
 */
declare class ASAuthorizationPublicKeyCredentialLargeBlobRegistrationOutput extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASAuthorizationPublicKeyCredentialLargeBlobRegistrationOutput; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialLargeBlobRegistrationOutput; // inherited from NSObject

	readonly isSupported: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare const enum ASAuthorizationPublicKeyCredentialLargeBlobSupportRequirement {

	Required = 0,

	Preferred = 1
}

/**
 * @since 18.0
 */
declare class ASAuthorizationPublicKeyCredentialPRFAssertionInput extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialPRFAssertionInput; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialPRFAssertionInput; // inherited from NSObject

	readonly inputValues: ASAuthorizationPublicKeyCredentialPRFAssertionInputValues | null;

	readonly perCredentialInputValues: NSDictionary<NSData, ASAuthorizationPublicKeyCredentialPRFAssertionInputValues> | null;

	constructor(o: { inputValues: ASAuthorizationPublicKeyCredentialPRFAssertionInputValues | null; perCredentialInputValues: NSDictionary<NSData, ASAuthorizationPublicKeyCredentialPRFAssertionInputValues> | null; });

	initWithInputValuesPerCredentialInputValues(inputValues: ASAuthorizationPublicKeyCredentialPRFAssertionInputValues | null, perCredentialInputValues: NSDictionary<NSData, ASAuthorizationPublicKeyCredentialPRFAssertionInputValues> | null): this;
}

/**
 * @since 18.0
 */
declare class ASAuthorizationPublicKeyCredentialPRFAssertionInputValues extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialPRFAssertionInputValues; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialPRFAssertionInputValues; // inherited from NSObject

	readonly saltInput1: NSData;

	readonly saltInput2: NSData | null;

	constructor(o: { saltInput1: NSData; saltInput2: NSData | null; });

	initWithSaltInput1SaltInput2(saltInput1: NSData, saltInput2: NSData | null): this;
}

/**
 * @since 18.0
 */
declare class ASAuthorizationPublicKeyCredentialPRFAssertionOutput extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialPRFAssertionOutput; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialPRFAssertionOutput; // inherited from NSObject

	readonly first: NSData;

	readonly second: NSData | null;
}

/**
 * @since 18.0
 */
declare class ASAuthorizationPublicKeyCredentialPRFRegistrationInput extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialPRFRegistrationInput; // inherited from NSObject

	static checkForSupport(): ASAuthorizationPublicKeyCredentialPRFRegistrationInput;

	static new(): ASAuthorizationPublicKeyCredentialPRFRegistrationInput; // inherited from NSObject

	readonly inputValues: ASAuthorizationPublicKeyCredentialPRFAssertionInputValues | null;

	readonly shouldCheckForSupport: boolean;

	constructor(o: { inputValues: ASAuthorizationPublicKeyCredentialPRFAssertionInputValues | null; });

	initWithInputValues(inputValues: ASAuthorizationPublicKeyCredentialPRFAssertionInputValues | null): this;
}

/**
 * @since 18.0
 */
declare class ASAuthorizationPublicKeyCredentialPRFRegistrationOutput extends NSObject {

	static alloc(): ASAuthorizationPublicKeyCredentialPRFRegistrationOutput; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialPRFRegistrationOutput; // inherited from NSObject

	readonly first: NSData | null;

	readonly isSupported: boolean;

	readonly second: NSData | null;
}

/**
 * @since 15.0
 */
declare class ASAuthorizationPublicKeyCredentialParameters extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASAuthorizationPublicKeyCredentialParameters; // inherited from NSObject

	static new(): ASAuthorizationPublicKeyCredentialParameters; // inherited from NSObject

	readonly algorithm: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { algorithm: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAlgorithm(algorithm: number): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
interface ASAuthorizationPublicKeyCredentialRegistration extends ASPublicKeyCredential {

	rawAttestationObject: NSData | null;
}
declare var ASAuthorizationPublicKeyCredentialRegistration: {

	prototype: ASAuthorizationPublicKeyCredentialRegistration;
};

/**
 * @since 15.0
 */
interface ASAuthorizationPublicKeyCredentialRegistrationRequest extends NSCopying, NSObjectProtocol, NSSecureCoding {

	attestationPreference: string;

	challenge: NSData;

	displayName: string | null;

	name: string;

	relyingPartyIdentifier: string;

	userID: NSData;

	userVerificationPreference: string;
}
declare var ASAuthorizationPublicKeyCredentialRegistrationRequest: {

	prototype: ASAuthorizationPublicKeyCredentialRegistrationRequest;
};

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialResidentKeyPreferenceDiscouraged: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialResidentKeyPreferencePreferred: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialResidentKeyPreferenceRequired: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialUserVerificationPreferenceDiscouraged: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialUserVerificationPreferencePreferred: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationPublicKeyCredentialUserVerificationPreferenceRequired: string;

/**
 * @since 13.0
 */
declare class ASAuthorizationRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASAuthorizationRequest; // inherited from NSObject

	static new(): ASAuthorizationRequest; // inherited from NSObject

	readonly provider: ASAuthorizationProvider;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare var ASAuthorizationScopeEmail: string;

/**
 * @since 13.0
 */
declare var ASAuthorizationScopeFullName: string;

/**
 * @since 15.0
 */
declare class ASAuthorizationSecurityKeyPublicKeyCredentialAssertion extends NSObject implements ASAuthorizationPublicKeyCredentialAssertion {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertion; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertion; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	readonly appID: boolean;

	/**
	 * @since 26.4
	 */
	readonly prf: ASAuthorizationPublicKeyCredentialPRFAssertionOutput | null;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
declare class ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialAssertionRequest, ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialAssertionRequest {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest; // inherited from NSObject

	/**
	 * @since 17.5
	 */
	appID: string | null;

	/**
	 * @since 26.4
	 */
	prf: ASAuthorizationPublicKeyCredentialPRFAssertionInput | null;

	allowedCredentials: NSArray<ASAuthorizationPublicKeyCredentialDescriptor>; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialAssertionRequest

	readonly clientData: ASPublicKeyCredentialClientData | null; // inherited from ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialAssertionRequest

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
declare var ASAuthorizationSecurityKeyPublicKeyCredentialDescriptorTransportBluetooth: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationSecurityKeyPublicKeyCredentialDescriptorTransportNFC: string;

/**
 * @since 15.0
 */
declare var ASAuthorizationSecurityKeyPublicKeyCredentialDescriptorTransportUSB: string;

/**
 * @since 15.0
 */
declare class ASAuthorizationSecurityKeyPublicKeyCredentialProvider extends NSObject implements ASAuthorizationProvider, ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialProvider {

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

	createCredentialAssertionRequestWithClientData(clientData: ASPublicKeyCredentialClientData): ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest;

	createCredentialRegistrationRequestWithChallengeDisplayNameNameUserID(challenge: NSData, displayName: string, name: string, userID: NSData): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest;

	createCredentialRegistrationRequestWithClientDataDisplayNameNameUserID(clientData: ASPublicKeyCredentialClientData, displayName: string, name: string, userID: NSData): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest;

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

/**
 * @since 15.0
 */
declare class ASAuthorizationSecurityKeyPublicKeyCredentialRegistration extends NSObject implements ASAuthorizationPublicKeyCredentialRegistration {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistration; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistration; // inherited from NSObject

	/**
	 * @since 26.4
	 */
	readonly prf: ASAuthorizationPublicKeyCredentialPRFRegistrationOutput | null;

	/**
	 * @since 17.5
	 */
	readonly transports: NSArray<string>;

	readonly credentialID: NSData; // inherited from ASPublicKeyCredential

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly rawAttestationObject: NSData | null; // inherited from ASAuthorizationPublicKeyCredentialRegistration

	readonly rawClientDataJSON: NSData; // inherited from ASPublicKeyCredential

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 15.0
 */
declare class ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest extends ASAuthorizationRequest implements ASAuthorizationPublicKeyCredentialRegistrationRequest, ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialRegistrationRequest {

	static alloc(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	static new(): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest; // inherited from NSObject

	credentialParameters: NSArray<ASAuthorizationPublicKeyCredentialParameters>;

	excludedCredentials: NSArray<ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor>;

	/**
	 * @since 26.4
	 */
	prf: ASAuthorizationPublicKeyCredentialPRFRegistrationInput | null;

	residentKeyPreference: string;

	attestationPreference: string; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	challenge: NSData; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

	readonly clientData: ASPublicKeyCredentialClientData | null; // inherited from ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialRegistrationRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	displayName: string | null; // inherited from ASAuthorizationPublicKeyCredentialRegistrationRequest

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 13.0
 */
declare class ASAuthorizationSingleSignOnCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASAuthorizationSingleSignOnCredential; // inherited from NSObject

	static new(): ASAuthorizationSingleSignOnCredential; // inherited from NSObject

	readonly accessToken: NSData | null;

	readonly authenticatedResponse: NSHTTPURLResponse | null;

	readonly authorizedScopes: NSArray<string>;

	readonly identityToken: NSData | null;

	/**
	 * @since 15.0
	 */
	readonly privateKeys: NSArray<any>;

	readonly state: string | null;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare class ASAuthorizationSingleSignOnRequest extends ASAuthorizationOpenIDRequest {

	static alloc(): ASAuthorizationSingleSignOnRequest; // inherited from NSObject

	static new(): ASAuthorizationSingleSignOnRequest; // inherited from NSObject

	authorizationOptions: NSArray<NSURLQueryItem>;

	/**
	 * @since 15.0
	 */
	userInterfaceEnabled: boolean;
}

/**
 * @since 17.4
 */
declare class ASAuthorizationWebBrowserPlatformPublicKeyCredential extends NSObject {

	static alloc(): ASAuthorizationWebBrowserPlatformPublicKeyCredential; // inherited from NSObject

	static new(): ASAuthorizationWebBrowserPlatformPublicKeyCredential; // inherited from NSObject

	readonly credentialID: NSData;

	/**
	 * @since 17.4
	 */
	readonly customTitle: string | null;

	readonly name: string;

	readonly providerName: string;

	readonly relyingParty: string;

	readonly userHandle: NSData;
}

/**
 * @since 17.4
 */
interface ASAuthorizationWebBrowserPlatformPublicKeyCredentialAssertionRequest {

	clientData: ASPublicKeyCredentialClientData | null;

	shouldShowHybridTransport: boolean;
}
declare var ASAuthorizationWebBrowserPlatformPublicKeyCredentialAssertionRequest: {

	prototype: ASAuthorizationWebBrowserPlatformPublicKeyCredentialAssertionRequest;
};

/**
 * @since 17.4
 */
interface ASAuthorizationWebBrowserPlatformPublicKeyCredentialProvider {

	createCredentialAssertionRequestWithClientData(clientData: ASPublicKeyCredentialClientData): ASAuthorizationPlatformPublicKeyCredentialAssertionRequest;

	createCredentialRegistrationRequestWithClientDataNameUserID(clientData: ASPublicKeyCredentialClientData, name: string, userID: NSData): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest;

	/**
	 * @since 18.0
	 */
	createCredentialRegistrationRequestWithClientDataNameUserIDRequestStyle(clientData: ASPublicKeyCredentialClientData, name: string, userID: NSData, requestStyle: ASAuthorizationPlatformPublicKeyCredentialRegistrationRequestStyle): ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest;
}
declare var ASAuthorizationWebBrowserPlatformPublicKeyCredentialProvider: {

	prototype: ASAuthorizationWebBrowserPlatformPublicKeyCredentialProvider;
};

/**
 * @since 17.4
 */
interface ASAuthorizationWebBrowserPlatformPublicKeyCredentialRegistrationRequest {

	clientData: ASPublicKeyCredentialClientData | null;

	excludedCredentials: NSArray<ASAuthorizationPlatformPublicKeyCredentialDescriptor> | null;
}
declare var ASAuthorizationWebBrowserPlatformPublicKeyCredentialRegistrationRequest: {

	prototype: ASAuthorizationWebBrowserPlatformPublicKeyCredentialRegistrationRequest;
};

/**
 * @since 17.4
 */
declare class ASAuthorizationWebBrowserPublicKeyCredentialManager extends NSObject {

	static alloc(): ASAuthorizationWebBrowserPublicKeyCredentialManager; // inherited from NSObject

	static new(): ASAuthorizationWebBrowserPublicKeyCredentialManager; // inherited from NSObject

	readonly authorizationStateForPlatformCredentials: ASAuthorizationWebBrowserPublicKeyCredentialManagerAuthorizationState;

	/**
	 * @since 26.2
	 */
	static readonly isDeviceConfiguredForPasskeys: boolean;

	platformCredentialsForRelyingPartyCompletionHandler(relyingParty: string, completionHandler: (p1: NSArray<ASAuthorizationWebBrowserPlatformPublicKeyCredential>) => void): void;

	requestAuthorizationForPublicKeyCredentials(completionHandler: (p1: ASAuthorizationWebBrowserPublicKeyCredentialManagerAuthorizationState) => void): void;
}

declare const enum ASAuthorizationWebBrowserPublicKeyCredentialManagerAuthorizationState {

	Authorized = 0,

	Denied = 1,

	NotDetermined = 2
}

/**
 * @since 17.4
 */
interface ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialAssertionRequest {

	clientData: ASPublicKeyCredentialClientData | null;
}
declare var ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialAssertionRequest: {

	prototype: ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialAssertionRequest;
};

/**
 * @since 17.4
 */
interface ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialProvider {

	createCredentialAssertionRequestWithClientData(clientData: ASPublicKeyCredentialClientData): ASAuthorizationSecurityKeyPublicKeyCredentialAssertionRequest;

	createCredentialRegistrationRequestWithClientDataDisplayNameNameUserID(clientData: ASPublicKeyCredentialClientData, displayName: string, name: string, userID: NSData): ASAuthorizationSecurityKeyPublicKeyCredentialRegistrationRequest;
}
declare var ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialProvider: {

	prototype: ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialProvider;
};

/**
 * @since 17.4
 */
interface ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialRegistrationRequest {

	clientData: ASPublicKeyCredentialClientData | null;
}
declare var ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialRegistrationRequest: {

	prototype: ASAuthorizationWebBrowserSecurityKeyPublicKeyCredentialRegistrationRequest;
};

/**
 * @since 15.0
 */
declare var ASCOSEAlgorithmIdentifierES256: number;

/**
 * @since 15.0
 */
declare var ASCOSEEllipticCurveIdentifierP256: number;

/**
 * @since 17.0
 */
interface ASCredentialIdentity extends NSObjectProtocol {

	rank: number;

	recordIdentifier: string | null;

	serviceIdentifier: ASCredentialServiceIdentifier;

	user: string;
}
declare var ASCredentialIdentity: {

	prototype: ASCredentialIdentity;
};

/**
 * @since 12.0
 */
declare class ASCredentialIdentityStore extends NSObject {

	static alloc(): ASCredentialIdentityStore; // inherited from NSObject

	static new(): ASCredentialIdentityStore; // inherited from NSObject

	static readonly sharedStore: ASCredentialIdentityStore;

	/**
	 * @since 17.4
	 */
	getCredentialIdentitiesForServiceCredentialIdentityTypesCompletionHandler(serviceIdentifier: ASCredentialServiceIdentifier | null, credentialIdentityTypes: ASCredentialIdentityTypes, completionHandler: (p1: NSArray<ASCredentialIdentity>) => void): void;

	getCredentialIdentityStoreStateWithCompletion(completion: (p1: ASCredentialIdentityStoreState) => void): void;

	removeAllCredentialIdentitiesWithCompletion(completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 17.0
	 */
	removeCredentialIdentitiesCompletion(credentialIdentities: NSArray<ASPasswordCredentialIdentity> | ASPasswordCredentialIdentity[], completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 17.0
	 */
	removeCredentialIdentityEntriesCompletion(credentialIdentities: NSArray<ASCredentialIdentity> | ASCredentialIdentity[], completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 17.0
	 */
	replaceCredentialIdentitiesWithIdentitiesCompletion(newCredentialIdentities: NSArray<ASPasswordCredentialIdentity> | ASPasswordCredentialIdentity[], completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 17.0
	 */
	replaceCredentialIdentityEntriesCompletion(newCredentialIdentities: NSArray<ASCredentialIdentity> | ASCredentialIdentity[], completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 12.0
	 * @deprecated 17.0
	 */
	saveCredentialIdentitiesCompletion(credentialIdentities: NSArray<ASPasswordCredentialIdentity> | ASPasswordCredentialIdentity[], completion: (p1: boolean, p2: NSError | null) => void | null): void;

	/**
	 * @since 17.0
	 */
	saveCredentialIdentityEntriesCompletion(credentialIdentities: NSArray<ASCredentialIdentity> | ASCredentialIdentity[], completion: (p1: boolean, p2: NSError | null) => void | null): void;
}

/**
 * @since 12.0
 */
declare const enum ASCredentialIdentityStoreErrorCode {

	InternalError = 0,

	StoreDisabled = 1,

	StoreBusy = 2
}

/**
 * @since 12.0
 */
declare var ASCredentialIdentityStoreErrorDomain: string;

/**
 * @since 12.0
 */
declare class ASCredentialIdentityStoreState extends NSObject {

	static alloc(): ASCredentialIdentityStoreState; // inherited from NSObject

	static new(): ASCredentialIdentityStoreState; // inherited from NSObject

	readonly enabled: boolean;

	readonly supportsIncrementalUpdates: boolean;
}

/**
 * @since 17.4
 */
declare const enum ASCredentialIdentityTypes {

	All = 0,

	Password = 1,

	Passkey = 2,

	OneTimeCode = 4
}

/**
 * @since 12.0
 */
declare class ASCredentialProviderExtensionContext extends NSExtensionContext {

	static alloc(): ASCredentialProviderExtensionContext; // inherited from NSObject

	static new(): ASCredentialProviderExtensionContext; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	completeAssertionRequestWithSelectedPasskeyCredentialCompletionHandler(credential: ASPasskeyAssertionCredential, completionHandler: (p1: boolean) => void | null): void;

	completeExtensionConfigurationRequest(): void;

	/**
	 * @since 26.2
	 */
	completeGeneratePasswordRequestWithResultsCompletionHandler(results: NSArray<ASGeneratedPassword> | ASGeneratedPassword[], completionHandler: (p1: boolean) => void | null): void;

	/**
	 * @since 18.0
	 */
	completeOneTimeCodeRequestWithSelectedCredentialCompletionHandler(credential: ASOneTimeCodeCredential, completionHandler: (p1: boolean) => void | null): void;

	/**
	 * @since 17.0
	 */
	completeRegistrationRequestWithSelectedPasskeyCredentialCompletionHandler(credential: ASPasskeyRegistrationCredential, completionHandler: (p1: boolean) => void | null): void;

	completeRequestWithSelectedCredentialCompletionHandler(credential: ASPasswordCredential, completionHandler: (p1: boolean) => void | null): void;

	/**
	 * @since 18.0
	 */
	completeRequestWithTextToInsertCompletionHandler(text: string, completionHandler: (p1: boolean) => void | null): void;

	/**
	 * @since 26.2
	 */
	completeSavePasswordRequestWithCompletionHandler(completionHandler: (p1: boolean) => void | null): void;
}

/**
 * @since 12.0
 */
declare class ASCredentialProviderViewController extends UIViewController {

	static alloc(): ASCredentialProviderViewController; // inherited from NSObject

	static new(): ASCredentialProviderViewController; // inherited from NSObject

	readonly extensionContext: ASCredentialProviderExtensionContext;

	/**
	 * @since 26.2
	 */
	performGeneratePasswordsRequestWithoutUserInteraction(generatePasswordsRequest: ASGeneratePasswordsRequest): void;

	/**
	 * @since 18.0
	 */
	performPasskeyRegistrationWithoutUserInteractionIfPossible(registrationRequest: ASPasskeyCredentialRequest): void;

	/**
	 * @since 26.2
	 */
	performSavePasswordRequestWithoutUserInteractionIfPossible(savePasswordRequest: ASSavePasswordRequest): void;

	prepareCredentialListForServiceIdentifiers(serviceIdentifiers: NSArray<ASCredentialServiceIdentifier> | ASCredentialServiceIdentifier[]): void;

	/**
	 * @since 17.0
	 */
	prepareCredentialListForServiceIdentifiersRequestParameters(serviceIdentifiers: NSArray<ASCredentialServiceIdentifier> | ASCredentialServiceIdentifier[], requestParameters: ASPasskeyCredentialRequestParameters): void;

	prepareInterfaceForExtensionConfiguration(): void;

	/**
	 * @since 26.2
	 */
	prepareInterfaceForGeneratePasswordsRequest(generatePasswordsRequest: ASGeneratePasswordsRequest): void;

	/**
	 * @since 17.0
	 */
	prepareInterfaceForPasskeyRegistration(registrationRequest: ASCredentialRequest): void;

	/**
	 * @since 26.2
	 */
	prepareInterfaceForSavePasswordRequest(savePasswordRequest: ASSavePasswordRequest): void;

	/**
	 * @since 18.0
	 */
	prepareInterfaceForUserChoosingTextToInsert(): void;

	/**
	 * @since 12.0
	 * @deprecated 17.0
	 */
	prepareInterfaceToProvideCredentialForIdentity(credentialIdentity: ASPasswordCredentialIdentity): void;

	/**
	 * @since 17.0
	 */
	prepareInterfaceToProvideCredentialForRequest(credentialRequest: ASCredentialRequest): void;

	/**
	 * @since 18.0
	 */
	prepareOneTimeCodeCredentialListForServiceIdentifiers(serviceIdentifiers: NSArray<ASCredentialServiceIdentifier> | ASCredentialServiceIdentifier[]): void;

	/**
	 * @since 12.0
	 * @deprecated 17.0
	 */
	provideCredentialWithoutUserInteractionForIdentity(credentialIdentity: ASPasswordCredentialIdentity): void;

	/**
	 * @since 17.0
	 */
	provideCredentialWithoutUserInteractionForRequest(credentialRequest: ASCredentialRequest): void;

	reportAllAcceptedPublicKeyCredentialsForRelyingPartyUserHandleAcceptedCredentialIDs(relyingParty: string, userHandle: NSData, acceptedCredentialIDs: NSArray<NSData> | NSData[]): void;

	reportPublicKeyCredentialUpdateForRelyingPartyUserHandleNewName(relyingParty: string, userHandle: NSData, newName: string): void;

	reportUnknownPublicKeyCredentialForRelyingPartyCredentialID(relyingParty: string, credentialID: NSData): void;

	reportUnusedPasswordCredentialForDomainUserName(domain: string, userName: string): void;
}

/**
 * @since 17.0
 */
interface ASCredentialRequest extends NSCopying, NSObjectProtocol, NSSecureCoding {

	credentialIdentity: ASCredentialIdentity;

	type: ASCredentialRequestType;
}
declare var ASCredentialRequest: {

	prototype: ASCredentialRequest;
};

/**
 * @since 17.0
 */
declare const enum ASCredentialRequestType {

	Password = 0,

	PasskeyAssertion = 1,

	PasskeyRegistration = 2,

	OneTimeCode = 3
}

/**
 * @since 12.0
 */
declare class ASCredentialServiceIdentifier extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASCredentialServiceIdentifier; // inherited from NSObject

	static new(): ASCredentialServiceIdentifier; // inherited from NSObject

	/**
	 * @since 26.2
	 */
	readonly displayName: string | null;

	readonly identifier: string;

	readonly type: ASCredentialServiceIdentifierType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; type: ASCredentialServiceIdentifierType; });

	/**
	 * @since 26.2
	 */
	constructor(o: { identifier: string; type: ASCredentialServiceIdentifierType; displayName: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierType(identifier: string, type: ASCredentialServiceIdentifierType): this;

	/**
	 * @since 26.2
	 */
	initWithIdentifierTypeDisplayName(identifier: string, type: ASCredentialServiceIdentifierType, displayName: string): this;
}

/**
 * @since 12.0
 */
declare const enum ASCredentialServiceIdentifierType {

	Domain = 0,

	URL = 1,

	App = 2
}

/**
 * @since 12.0
 */
declare const enum ASExtensionErrorCode {

	Failed = 0,

	UserCanceled = 1,

	UserInteractionRequired = 100,

	CredentialIdentityNotFound = 101,

	MatchedExcludedCredential = 102
}

/**
 * @since 12.0
 */
declare var ASExtensionErrorDomain: string;

/**
 * @since 14.0
 */
declare var ASExtensionLocalizedFailureReasonErrorKey: string;

/**
 * @since 26.2
 */
declare class ASGeneratePasswordsRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASGeneratePasswordsRequest; // inherited from NSObject

	static new(): ASGeneratePasswordsRequest; // inherited from NSObject

	readonly confirmPasswordFieldPasswordRules: string | null;

	readonly passwordFieldPasswordRules: string | null;

	readonly passwordRulesFromQuirks: string | null;

	readonly serviceIdentifier: ASCredentialServiceIdentifier;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; passwordFieldPasswordRules: string | null; confirmPasswordFieldPasswordRules: string | null; passwordRulesFromQuirks: string | null; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithServiceIdentifierPasswordFieldPasswordRulesConfirmPasswordFieldPasswordRulesPasswordRulesFromQuirks(serviceIdentifier: ASCredentialServiceIdentifier, passwordFieldPasswordRules: string | null, confirmPasswordFieldPasswordRules: string | null, passwordRulesFromQuirks: string | null): this;
}

/**
 * @since 26.2
 */
declare class ASGeneratedPassword extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASGeneratedPassword; // inherited from NSObject

	static new(): ASGeneratedPassword; // inherited from NSObject

	readonly kind: string;

	readonly localizedName: string;

	readonly value: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { kind: string; value: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithKindValue(kind: string, value: string): this;
}

/**
 * @since 26.2
 */
declare var ASGeneratedPasswordKindAlphanumeric: string;

/**
 * @since 26.2
 */
declare var ASGeneratedPasswordKindPassphrase: string;

/**
 * @since 26.2
 */
declare var ASGeneratedPasswordKindStrong: string;

/**
 * @since 18.0
 */
declare class ASOneTimeCodeCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASOneTimeCodeCredential; // inherited from NSObject

	static credentialWithCode(code: string): ASOneTimeCodeCredential;

	static new(): ASOneTimeCodeCredential; // inherited from NSObject

	readonly code: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { code: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCode(code: string): this;

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

/**
 * @since 18.0
 */
declare class ASOneTimeCodeCredentialIdentity extends NSObject implements ASCredentialIdentity, NSCopying, NSSecureCoding {

	static alloc(): ASOneTimeCodeCredentialIdentity; // inherited from NSObject

	static new(): ASOneTimeCodeCredentialIdentity; // inherited from NSObject

	readonly label: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	rank: number; // inherited from ASCredentialIdentity

	readonly recordIdentifier: string | null; // inherited from ASCredentialIdentity

	readonly serviceIdentifier: ASCredentialServiceIdentifier; // inherited from ASCredentialIdentity

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly user: string; // inherited from ASCredentialIdentity

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; label: string; recordIdentifier: string | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithServiceIdentifierLabelRecordIdentifier(serviceIdentifier: ASCredentialServiceIdentifier, label: string, recordIdentifier: string | null): this;

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

/**
 * @since 18.0
 */
declare class ASOneTimeCodeCredentialRequest extends NSObject implements ASCredentialRequest {

	static alloc(): ASOneTimeCodeCredentialRequest; // inherited from NSObject

	static new(): ASOneTimeCodeCredentialRequest; // inherited from NSObject

	readonly credentialIdentity: ASCredentialIdentity; // inherited from ASCredentialRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly type: ASCredentialRequestType; // inherited from ASCredentialRequest

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { credentialIdentity: ASOneTimeCodeCredentialIdentity; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCredentialIdentity(credentialIdentity: ASOneTimeCodeCredentialIdentity): this;

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

/**
 * @since 17.0
 */
declare class ASPasskeyAssertionCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASPasskeyAssertionCredential; // inherited from NSObject

	static credentialWithUserHandleRelyingPartySignatureClientDataHashAuthenticatorDataCredentialID(userHandle: NSData, relyingParty: string, signature: NSData, clientDataHash: NSData, authenticatorData: NSData, credentialID: NSData): ASPasskeyAssertionCredential;

	static new(): ASPasskeyAssertionCredential; // inherited from NSObject

	readonly authenticatorData: NSData;

	readonly clientDataHash: NSData;

	readonly credentialID: NSData;

	/**
	 * @since 18.0
	 */
	extensionOutput: ASPasskeyAssertionCredentialExtensionOutput | null;

	readonly relyingParty: string;

	readonly signature: NSData;

	readonly userHandle: NSData;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { userHandle: NSData; relyingParty: string; signature: NSData; clientDataHash: NSData; authenticatorData: NSData; credentialID: NSData; });

	/**
	 * @since 18.0
	 */
	constructor(o: { userHandle: NSData; relyingParty: string; signature: NSData; clientDataHash: NSData; authenticatorData: NSData; credentialID: NSData; extensionOutput: ASPasskeyAssertionCredentialExtensionOutput | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithUserHandleRelyingPartySignatureClientDataHashAuthenticatorDataCredentialID(userHandle: NSData, relyingParty: string, signature: NSData, clientDataHash: NSData, authenticatorData: NSData, credentialID: NSData): this;

	/**
	 * @since 18.0
	 */
	initWithUserHandleRelyingPartySignatureClientDataHashAuthenticatorDataCredentialIDExtensionOutput(userHandle: NSData, relyingParty: string, signature: NSData, clientDataHash: NSData, authenticatorData: NSData, credentialID: NSData, extensionOutput: ASPasskeyAssertionCredentialExtensionOutput | null): this;

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

/**
 * @since 18.0
 */
declare class ASPasskeyAssertionCredentialExtensionInput extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASPasskeyAssertionCredentialExtensionInput; // inherited from NSObject

	static new(): ASPasskeyAssertionCredentialExtensionInput; // inherited from NSObject

	readonly largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobAssertionInput | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class ASPasskeyAssertionCredentialExtensionOutput extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASPasskeyAssertionCredentialExtensionOutput; // inherited from NSObject

	static new(): ASPasskeyAssertionCredentialExtensionOutput; // inherited from NSObject

	readonly largeBlobAssertionOutput: ASAuthorizationPublicKeyCredentialLargeBlobAssertionOutput | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { largeBlobOutput: ASAuthorizationPublicKeyCredentialLargeBlobAssertionOutput | null; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLargeBlobOutput(largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobAssertionOutput | null): this;
}

/**
 * @since 17.0
 */
declare class ASPasskeyCredentialIdentity extends NSObject implements ASCredentialIdentity, NSCopying, NSSecureCoding {

	static alloc(): ASPasskeyCredentialIdentity; // inherited from NSObject

	static identityWithRelyingPartyIdentifierUserNameCredentialIDUserHandleRecordIdentifier(relyingPartyIdentifier: string, userName: string, credentialID: NSData, userHandle: NSData, recordIdentifier: string | null): ASPasskeyCredentialIdentity;

	static new(): ASPasskeyCredentialIdentity; // inherited from NSObject

	readonly credentialID: NSData;

	readonly relyingPartyIdentifier: string;

	readonly userHandle: NSData;

	readonly userName: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	rank: number; // inherited from ASCredentialIdentity

	readonly recordIdentifier: string | null; // inherited from ASCredentialIdentity

	readonly serviceIdentifier: ASCredentialServiceIdentifier; // inherited from ASCredentialIdentity

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly user: string; // inherited from ASCredentialIdentity

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { relyingPartyIdentifier: string; userName: string; credentialID: NSData; userHandle: NSData; recordIdentifier: string | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRelyingPartyIdentifierUserNameCredentialIDUserHandleRecordIdentifier(relyingPartyIdentifier: string, userName: string, credentialID: NSData, userHandle: NSData, recordIdentifier: string | null): this;

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

/**
 * @since 17.0
 */
declare class ASPasskeyCredentialRequest extends NSObject implements ASCredentialRequest {

	static alloc(): ASPasskeyCredentialRequest; // inherited from NSObject

	static new(): ASPasskeyCredentialRequest; // inherited from NSObject

	static requestWithCredentialIdentityClientDataHashUserVerificationPreferenceSupportedAlgorithms(credentialIdentity: ASPasskeyCredentialIdentity, clientDataHash: NSData, userVerificationPreference: string, supportedAlgorithms: NSArray<number> | number[]): ASPasskeyCredentialRequest;

	/**
	 * @since 18.0
	 */
	readonly assertionExtensionInput: ASPasskeyAssertionCredentialExtensionInput | null;

	readonly clientDataHash: NSData;

	/**
	 * @since 18.0
	 */
	readonly excludedCredentials: NSArray<ASAuthorizationPlatformPublicKeyCredentialDescriptor> | null;

	/**
	 * @since 18.0
	 */
	readonly registrationExtensionInput: ASPasskeyRegistrationCredentialExtensionInput | null;

	readonly supportedAlgorithms: NSArray<number>;

	userVerificationPreference: string;

	readonly credentialIdentity: ASCredentialIdentity; // inherited from ASCredentialRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly type: ASCredentialRequestType; // inherited from ASCredentialRequest

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { credentialIdentity: ASPasskeyCredentialIdentity; clientDataHash: NSData; userVerificationPreference: string; supportedAlgorithms: NSArray<number> | number[]; });

	/**
	 * @since 18.0
	 */
	constructor(o: { credentialIdentity: ASPasskeyCredentialIdentity; clientDataHash: NSData; userVerificationPreference: string; supportedAlgorithms: NSArray<number> | number[]; assertionExtensionInput: ASPasskeyAssertionCredentialExtensionInput | null; });

	/**
	 * @since 18.0
	 */
	constructor(o: { credentialIdentity: ASPasskeyCredentialIdentity; clientDataHash: NSData; userVerificationPreference: string; supportedAlgorithms: NSArray<number> | number[]; registrationExtensionInput: ASPasskeyRegistrationCredentialExtensionInput | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCredentialIdentityClientDataHashUserVerificationPreferenceSupportedAlgorithms(credentialIdentity: ASPasskeyCredentialIdentity, clientDataHash: NSData, userVerificationPreference: string, supportedAlgorithms: NSArray<number> | number[]): this;

	/**
	 * @since 18.0
	 */
	initWithCredentialIdentityClientDataHashUserVerificationPreferenceSupportedAlgorithmsAssertionExtensionInput(credentialIdentity: ASPasskeyCredentialIdentity, clientDataHash: NSData, userVerificationPreference: string, supportedAlgorithms: NSArray<number> | number[], assertionExtensionInput: ASPasskeyAssertionCredentialExtensionInput | null): this;

	/**
	 * @since 18.0
	 */
	initWithCredentialIdentityClientDataHashUserVerificationPreferenceSupportedAlgorithmsRegistrationExtensionInput(credentialIdentity: ASPasskeyCredentialIdentity, clientDataHash: NSData, userVerificationPreference: string, supportedAlgorithms: NSArray<number> | number[], registrationExtensionInput: ASPasskeyRegistrationCredentialExtensionInput | null): this;

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

/**
 * @since 17.0
 */
declare class ASPasskeyCredentialRequestParameters extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASPasskeyCredentialRequestParameters; // inherited from NSObject

	static new(): ASPasskeyCredentialRequestParameters; // inherited from NSObject

	readonly allowedCredentials: NSArray<NSData>;

	readonly clientDataHash: NSData;

	/**
	 * @since 18.0
	 */
	readonly extensionInput: ASPasskeyAssertionCredentialExtensionInput | null;

	readonly relyingPartyIdentifier: string;

	readonly userVerificationPreference: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class ASPasskeyRegistrationCredential extends NSObject implements ASAuthorizationCredential {

	static alloc(): ASPasskeyRegistrationCredential; // inherited from NSObject

	static credentialWithRelyingPartyClientDataHashCredentialIDAttestationObject(relyingParty: string, clientDataHash: NSData, credentialID: NSData, attestationObject: NSData): ASPasskeyRegistrationCredential;

	static new(): ASPasskeyRegistrationCredential; // inherited from NSObject

	readonly attestationObject: NSData;

	readonly clientDataHash: NSData;

	readonly credentialID: NSData;

	/**
	 * @since 18.0
	 */
	extensionOutput: ASPasskeyRegistrationCredentialExtensionOutput | null;

	readonly relyingParty: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { relyingParty: string; clientDataHash: NSData; credentialID: NSData; attestationObject: NSData; });

	/**
	 * @since 18.0
	 */
	constructor(o: { relyingParty: string; clientDataHash: NSData; credentialID: NSData; attestationObject: NSData; extensionOutput: ASPasskeyRegistrationCredentialExtensionOutput | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRelyingPartyClientDataHashCredentialIDAttestationObject(relyingParty: string, clientDataHash: NSData, credentialID: NSData, attestationObject: NSData): this;

	/**
	 * @since 18.0
	 */
	initWithRelyingPartyClientDataHashCredentialIDAttestationObjectExtensionOutput(relyingParty: string, clientDataHash: NSData, credentialID: NSData, attestationObject: NSData, extensionOutput: ASPasskeyRegistrationCredentialExtensionOutput | null): this;

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

/**
 * @since 18.0
 */
declare class ASPasskeyRegistrationCredentialExtensionInput extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASPasskeyRegistrationCredentialExtensionInput; // inherited from NSObject

	static new(): ASPasskeyRegistrationCredentialExtensionInput; // inherited from NSObject

	readonly largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobRegistrationInput | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class ASPasskeyRegistrationCredentialExtensionOutput extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASPasskeyRegistrationCredentialExtensionOutput; // inherited from NSObject

	static new(): ASPasskeyRegistrationCredentialExtensionOutput; // inherited from NSObject

	readonly largeBlobRegistrationOutput: ASAuthorizationPublicKeyCredentialLargeBlobRegistrationOutput | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { largeBlobOutput: ASAuthorizationPublicKeyCredentialLargeBlobRegistrationOutput | null; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLargeBlobOutput(largeBlob: ASAuthorizationPublicKeyCredentialLargeBlobRegistrationOutput | null): this;
}

/**
 * @since 12.0
 */
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

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

/**
 * @since 12.0
 */
declare class ASPasswordCredentialIdentity extends NSObject implements ASCredentialIdentity, NSCopying, NSSecureCoding {

	static alloc(): ASPasswordCredentialIdentity; // inherited from NSObject

	static identityWithServiceIdentifierUserRecordIdentifier(serviceIdentifier: ASCredentialServiceIdentifier, user: string, recordIdentifier: string | null): ASPasswordCredentialIdentity;

	static new(): ASPasswordCredentialIdentity; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	rank: number; // inherited from ASCredentialIdentity

	readonly recordIdentifier: string | null; // inherited from ASCredentialIdentity

	readonly serviceIdentifier: ASCredentialServiceIdentifier; // inherited from ASCredentialIdentity

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly user: string; // inherited from ASCredentialIdentity

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; user: string; recordIdentifier: string | null; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithServiceIdentifierUserRecordIdentifier(serviceIdentifier: ASCredentialServiceIdentifier, user: string, recordIdentifier: string | null): this;

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

/**
 * @since 17.0
 */
declare class ASPasswordCredentialRequest extends NSObject implements ASCredentialRequest {

	static alloc(): ASPasswordCredentialRequest; // inherited from NSObject

	static new(): ASPasswordCredentialRequest; // inherited from NSObject

	static requestWithCredentialIdentity(credentialIdentity: ASPasswordCredentialIdentity): ASPasswordCredentialRequest;

	readonly credentialIdentity: ASCredentialIdentity; // inherited from ASCredentialRequest

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly type: ASCredentialRequestType; // inherited from ASCredentialRequest

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { credentialIdentity: ASPasswordCredentialIdentity; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithCredentialIdentity(credentialIdentity: ASPasswordCredentialIdentity): this;

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

/**
 * @since 15.0
 */
interface ASPublicKeyCredential extends ASAuthorizationCredential {

	credentialID: NSData;

	rawClientDataJSON: NSData;
}
declare var ASPublicKeyCredential: {

	prototype: ASPublicKeyCredential;
};

/**
 * @since 17.4
 */
declare class ASPublicKeyCredentialClientData extends NSObject {

	static alloc(): ASPublicKeyCredentialClientData; // inherited from NSObject

	static new(): ASPublicKeyCredentialClientData; // inherited from NSObject

	challenge: NSData;

	crossOrigin: ASPublicKeyCredentialClientDataCrossOriginValue;

	origin: string;

	topOrigin: string | null;

	constructor(o: { challenge: NSData; origin: string; });

	initWithChallengeOrigin(challenge: NSData, origin: string): this;
}

declare const enum ASPublicKeyCredentialClientDataCrossOriginValue {

	NotSet = 0,

	CrossOrigin = 1,

	SameOriginWithAncestors = 2
}

/**
 * @since 26.2
 */
declare class ASSavePasswordRequest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): ASSavePasswordRequest; // inherited from NSObject

	static new(): ASSavePasswordRequest; // inherited from NSObject

	readonly credential: ASPasswordCredential;

	readonly event: ASSavePasswordRequestEvent;

	readonly passwordKind: string | null;

	readonly serviceIdentifier: ASCredentialServiceIdentifier;

	readonly sessionID: string;

	readonly title: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; credential: ASPasswordCredential; sessionID: string; event: ASSavePasswordRequestEvent; });

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; credential: ASPasswordCredential; sessionID: string; event: ASSavePasswordRequestEvent; passwordKind: string | null; });

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; credential: ASPasswordCredential; title: string | null; sessionID: string; event: ASSavePasswordRequestEvent; });

	constructor(o: { serviceIdentifier: ASCredentialServiceIdentifier; credential: ASPasswordCredential; title: string | null; sessionID: string; event: ASSavePasswordRequestEvent; passwordKind: string | null; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithServiceIdentifierCredentialSessionIDEvent(serviceIdentifier: ASCredentialServiceIdentifier, credential: ASPasswordCredential, sessionID: string, event: ASSavePasswordRequestEvent): this;

	initWithServiceIdentifierCredentialSessionIDEventPasswordKind(serviceIdentifier: ASCredentialServiceIdentifier, credential: ASPasswordCredential, sessionID: string, event: ASSavePasswordRequestEvent, passwordKind: string | null): this;

	initWithServiceIdentifierCredentialTitleSessionIDEvent(serviceIdentifier: ASCredentialServiceIdentifier, credential: ASPasswordCredential, title: string | null, sessionID: string, event: ASSavePasswordRequestEvent): this;

	initWithServiceIdentifierCredentialTitleSessionIDEventPasswordKind(serviceIdentifier: ASCredentialServiceIdentifier, credential: ASPasswordCredential, title: string | null, sessionID: string, event: ASSavePasswordRequestEvent, passwordKind: string | null): this;
}

/**
 * @since 26.2
 */
declare const enum ASSavePasswordRequestEvent {

	UserInitiated = 0,

	FormDidDisappear = 1,

	GeneratedPasswordFilled = 2
}

/**
 * @since 17.0
 */
declare class ASSettingsHelper extends NSObject {

	static alloc(): ASSettingsHelper; // inherited from NSObject

	static new(): ASSettingsHelper; // inherited from NSObject

	static openCredentialProviderAppSettingsWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	static openVerificationCodeAppSettingsWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 18.0
	 */
	static requestToTurnOnCredentialProviderExtensionWithCompletionHandler(completionHandler: (p1: boolean) => void): void;
}

/**
 * @since 17.0
 */
declare const enum ASUserAgeRange {

	Unknown = 0,

	Child = 1,

	NotChild = 2
}

declare const enum ASUserDetectionStatus {

	Unsupported = 0,

	Unknown = 1,

	LikelyReal = 2
}

/**
 * @since 13.0
 */
interface ASWebAuthenticationPresentationContextProviding extends NSObjectProtocol {

	presentationAnchorForWebAuthenticationSession(session: ASWebAuthenticationSession): UIWindow;
}
declare var ASWebAuthenticationPresentationContextProviding: {

	prototype: ASWebAuthenticationPresentationContextProviding;
};

/**
 * @since 12.0
 */
declare class ASWebAuthenticationSession extends NSObject {

	static alloc(): ASWebAuthenticationSession; // inherited from NSObject

	static new(): ASWebAuthenticationSession; // inherited from NSObject

	/**
	 * @since 17.4
	 */
	additionalHeaderFields: NSDictionary<string, string> | null;

	/**
	 * @since 13.4
	 */
	readonly canStart: boolean;

	/**
	 * @since 13.0
	 */
	prefersEphemeralWebBrowserSession: boolean;

	/**
	 * @since 13.0
	 */
	presentationContextProvider: ASWebAuthenticationPresentationContextProviding | null;

	/**
	 * @since 17.4
	 */
	constructor(o: { URL: NSURL; callback: ASWebAuthenticationSessionCallback; completionHandler: (p1: NSURL | null, p2: NSError | null) => void; });

	/**
	 * @since 12.0
	 * @deprecated 100000
	 */
	constructor(o: { URL: NSURL; callbackURLScheme: string | null; completionHandler: (p1: NSURL | null, p2: NSError | null) => void; });

	cancel(): void;

	/**
	 * @since 17.4
	 */
	initWithURLCallbackCompletionHandler(URL: NSURL, callback: ASWebAuthenticationSessionCallback, completionHandler: (p1: NSURL | null, p2: NSError | null) => void): this;

	/**
	 * @since 12.0
	 * @deprecated 100000
	 */
	initWithURLCallbackURLSchemeCompletionHandler(URL: NSURL, callbackURLScheme: string | null, completionHandler: (p1: NSURL | null, p2: NSError | null) => void): this;

	start(): boolean;
}

/**
 * @since 17.4
 */
declare class ASWebAuthenticationSessionCallback extends NSObject {

	static alloc(): ASWebAuthenticationSessionCallback; // inherited from NSObject

	static callbackWithCustomScheme(customScheme: string): ASWebAuthenticationSessionCallback;

	static callbackWithHTTPSHostPath(host: string, path: string): ASWebAuthenticationSessionCallback;

	static new(): ASWebAuthenticationSessionCallback; // inherited from NSObject

	matchesURL(url: NSURL): boolean;
}

/**
 * @since 12.0
 */
declare const enum ASWebAuthenticationSessionErrorCode {

	CanceledLogin = 1,

	PresentationContextNotProvided = 2,

	PresentationContextInvalid = 3
}

/**
 * @since 12.0
 */
declare var ASWebAuthenticationSessionErrorDomain: string;
