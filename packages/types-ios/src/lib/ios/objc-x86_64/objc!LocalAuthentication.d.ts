
declare const enum LAAccessControlOperation {

	CreateItem = 0,

	UseItem = 1,

	CreateKey = 2,

	UseKeySign = 3,

	UseKeyDecrypt = 4,

	UseKeyKeyExchange = 5
}

declare class LAAuthenticationRequirement extends NSObject {

	static alloc(): LAAuthenticationRequirement; // inherited from NSObject

	static biometryRequirementWithFallback(fallback: LABiometryFallbackRequirement): LAAuthenticationRequirement;

	static new(): LAAuthenticationRequirement; // inherited from NSObject

	static readonly biometryCurrentSetRequirement: LAAuthenticationRequirement;

	static readonly biometryRequirement: LAAuthenticationRequirement;

	static readonly defaultRequirement: LAAuthenticationRequirement;
}

declare class LABiometryFallbackRequirement extends NSObject {

	static alloc(): LABiometryFallbackRequirement; // inherited from NSObject

	static new(): LABiometryFallbackRequirement; // inherited from NSObject

	static readonly defaultRequirement: LABiometryFallbackRequirement;

	static readonly devicePasscodeRequirement: LABiometryFallbackRequirement;
}

declare const enum LABiometryType {

	TypeNone = 0,

	None = 0,

	TypeTouchID = 1,

	TypeFaceID = 2
}

declare class LAContext extends NSObject {

	static alloc(): LAContext; // inherited from NSObject

	static new(): LAContext; // inherited from NSObject

	readonly biometryType: LABiometryType;

	readonly evaluatedPolicyDomainState: NSData;

	interactionNotAllowed: boolean;

	localizedCancelTitle: string;

	localizedFallbackTitle: string;

	localizedReason: string;

	maxBiometryFailures: number;

	touchIDAuthenticationAllowableReuseDuration: number;

	canEvaluatePolicyError(policy: LAPolicy): boolean;

	evaluateAccessControlOperationLocalizedReasonReply(accessControl: any, operation: LAAccessControlOperation, localizedReason: string, reply: (p1: boolean, p2: NSError) => void): void;

	evaluatePolicyLocalizedReasonReply(policy: LAPolicy, localizedReason: string, reply: (p1: boolean, p2: NSError) => void): void;

	invalidate(): void;

	isCredentialSet(type: LACredentialType): boolean;

	setCredentialType(credential: NSData, type: LACredentialType): boolean;
}

declare const enum LACredentialType {

	ApplicationPassword = 0,

	SmartCardPIN = -3
}

declare const enum LAError {

	AuthenticationFailed = -1,

	UserCancel = -2,

	UserFallback = -3,

	SystemCancel = -4,

	PasscodeNotSet = -5,

	TouchIDNotAvailable = -6,

	TouchIDNotEnrolled = -7,

	TouchIDLockout = -8,

	AppCancel = -9,

	InvalidContext = -10,

	BiometryNotAvailable = -6,

	BiometryNotEnrolled = -7,

	BiometryLockout = -8,

	NotInteractive = -1004,

	WatchNotAvailable = -11,

	BiometryNotPaired = -12,

	BiometryDisconnected = -13,

	InvalidDimensions = -14
}

declare var LAErrorDomain: string;

declare class LAPersistedRight extends LARight {

	static alloc(): LAPersistedRight; // inherited from NSObject

	static new(): LAPersistedRight; // inherited from NSObject

	readonly key: LAPrivateKey;

	readonly secret: LASecret;
}

declare const enum LAPolicy {

	DeviceOwnerAuthenticationWithBiometrics = 1,

	DeviceOwnerAuthentication = 2,

	DeviceOwnerAuthenticationWithWatch = 3,

	DeviceOwnerAuthenticationWithBiometricsOrWatch = 4,

	DeviceOwnerAuthenticationWithWristDetection = 5
}

declare class LAPrivateKey extends NSObject {

	static alloc(): LAPrivateKey; // inherited from NSObject

	static new(): LAPrivateKey; // inherited from NSObject

	readonly publicKey: LAPublicKey;

	canDecryptUsingSecKeyAlgorithm(algorithm: any): boolean;

	canExchangeKeysUsingSecKeyAlgorithm(algorithm: any): boolean;

	canSignUsingSecKeyAlgorithm(algorithm: any): boolean;

	decryptDataSecKeyAlgorithmCompletion(data: NSData, algorithm: any, handler: (p1: NSData, p2: NSError) => void): void;

	exchangeKeysWithPublicKeySecKeyAlgorithmSecKeyParametersCompletion(publicKey: NSData, algorithm: any, parameters: NSDictionary<any, any>, handler: (p1: NSData, p2: NSError) => void): void;

	signDataSecKeyAlgorithmCompletion(data: NSData, algorithm: any, handler: (p1: NSData, p2: NSError) => void): void;
}

declare class LAPublicKey extends NSObject {

	static alloc(): LAPublicKey; // inherited from NSObject

	static new(): LAPublicKey; // inherited from NSObject

	canEncryptUsingSecKeyAlgorithm(algorithm: any): boolean;

	canVerifyUsingSecKeyAlgorithm(algorithm: any): boolean;

	encryptDataSecKeyAlgorithmCompletion(data: NSData, algorithm: any, handler: (p1: NSData, p2: NSError) => void): void;

	exportBytesWithCompletion(handler: (p1: NSData, p2: NSError) => void): void;

	verifyDataSignatureSecKeyAlgorithmCompletion(signedData: NSData, signature: NSData, algorithm: any, handler: (p1: NSError) => void): void;
}

declare class LARight extends NSObject {

	static alloc(): LARight; // inherited from NSObject

	static new(): LARight; // inherited from NSObject

	readonly state: LARightState;

	tag: number;

	constructor(o: { requirement: LAAuthenticationRequirement; });

	authorizeWithLocalizedReasonCompletion(localizedReason: string, handler: (p1: NSError) => void): void;

	authorizeWithLocalizedReasonInPresentationContextCompletion(localizedReason: string, presentationContext: UIWindow, handler: (p1: NSError) => void): void;

	checkCanAuthorizeWithCompletion(handler: (p1: NSError) => void): void;

	deauthorizeWithCompletion(handler: () => void): void;

	initWithRequirement(requirement: LAAuthenticationRequirement): this;
}

declare const enum LARightState {

	Unknown = 0,

	Authorizing = 1,

	Authorized = 2,

	NotAuthorized = 3
}

declare class LARightStore extends NSObject {

	static alloc(): LARightStore; // inherited from NSObject

	static new(): LARightStore; // inherited from NSObject

	static readonly sharedStore: LARightStore;

	removeAllRightsWithCompletion(handler: (p1: NSError) => void): void;

	removeRightCompletion(right: LAPersistedRight, handler: (p1: NSError) => void): void;

	removeRightForIdentifierCompletion(identifier: string, handler: (p1: NSError) => void): void;

	rightForIdentifierCompletion(identifier: string, handler: (p1: LAPersistedRight, p2: NSError) => void): void;

	saveRightIdentifierCompletion(right: LARight, identifier: string, handler: (p1: LAPersistedRight, p2: NSError) => void): void;

	saveRightIdentifierSecretCompletion(right: LARight, identifier: string, secret: NSData, handler: (p1: LAPersistedRight, p2: NSError) => void): void;
}

declare class LASecret extends NSObject {

	static alloc(): LASecret; // inherited from NSObject

	static new(): LASecret; // inherited from NSObject

	loadDataWithCompletion(handler: (p1: NSData, p2: NSError) => void): void;
}

declare var LATouchIDAuthenticationMaximumAllowableReuseDuration: number;
