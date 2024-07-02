
/**
 * @since 9.0
 */
declare const enum LAAccessControlOperation {

	CreateItem = 0,

	UseItem = 1,

	CreateKey = 2,

	UseKeySign = 3,

	UseKeyDecrypt = 4,

	UseKeyKeyExchange = 5
}

/**
 * @since 16.0
 */
declare class LAAuthenticationRequirement extends NSObject {

	static alloc(): LAAuthenticationRequirement; // inherited from NSObject

	static biometryRequirementWithFallback(fallback: LABiometryFallbackRequirement): LAAuthenticationRequirement;

	static new(): LAAuthenticationRequirement; // inherited from NSObject

	static readonly biometryCurrentSetRequirement: LAAuthenticationRequirement;

	static readonly biometryRequirement: LAAuthenticationRequirement;

	static readonly defaultRequirement: LAAuthenticationRequirement;
}

/**
 * @since 16.0
 */
declare class LABiometryFallbackRequirement extends NSObject {

	static alloc(): LABiometryFallbackRequirement; // inherited from NSObject

	static new(): LABiometryFallbackRequirement; // inherited from NSObject

	static readonly defaultRequirement: LABiometryFallbackRequirement;

	static readonly devicePasscodeRequirement: LABiometryFallbackRequirement;
}

/**
 * @since 11.0
 */
declare const enum LABiometryType {

	TypeNone = 0,

	None = 0,

	TypeTouchID = 1,

	TypeFaceID = 2,

	TypeOpticID = 4
}

/**
 * @since 18.0
 */
declare const enum LACompanionType {

	Watch = 1,

	Mac = 2
}

/**
 * @since 8.0
 */
declare class LAContext extends NSObject {

	static alloc(): LAContext; // inherited from NSObject

	static new(): LAContext; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly biometryType: LABiometryType;

	/**
	 * @since 18.0
	 */
	readonly domainState: LADomainState;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	readonly evaluatedPolicyDomainState: NSData;

	/**
	 * @since 11.0
	 */
	interactionNotAllowed: boolean;

	/**
	 * @since 10.0
	 */
	localizedCancelTitle: string;

	/**
	 * @since 8.0
	 */
	localizedFallbackTitle: string;

	/**
	 * @since 11.0
	 */
	localizedReason: string;

	/**
	 * @since 8.3
	 * @deprecated 9.0
	 */
	maxBiometryFailures: number;

	/**
	 * @since 9.0
	 */
	touchIDAuthenticationAllowableReuseDuration: number;

	/**
	 * @since 8.0
	 */
	canEvaluatePolicyError(policy: LAPolicy): boolean;

	/**
	 * @since 9.0
	 */
	evaluateAccessControlOperationLocalizedReasonReply(accessControl: any, operation: LAAccessControlOperation, localizedReason: string, reply: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	evaluatePolicyLocalizedReasonReply(policy: LAPolicy, localizedReason: string, reply: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	invalidate(): void;

	/**
	 * @since 9.0
	 */
	isCredentialSet(type: LACredentialType): boolean;

	/**
	 * @since 9.0
	 */
	setCredentialType(credential: NSData, type: LACredentialType): boolean;
}

/**
 * @since 9.0
 */
declare const enum LACredentialType {

	ApplicationPassword = 0,

	SmartCardPIN = -3
}

/**
 * @since 18.0
 */
declare class LADomainState extends NSObject {

	static alloc(): LADomainState; // inherited from NSObject

	static new(): LADomainState; // inherited from NSObject

	readonly biometry: LADomainStateBiometry;

	/**
	 * @since 18.0
	 */
	readonly companion: LADomainStateCompanion;

	readonly stateHash: NSData;
}

/**
 * @since 18.0
 */
declare class LADomainStateBiometry extends NSObject {

	static alloc(): LADomainStateBiometry; // inherited from NSObject

	static new(): LADomainStateBiometry; // inherited from NSObject

	readonly biometryType: LABiometryType;

	readonly stateHash: NSData;
}

/**
 * @since 18.0
 */
declare class LADomainStateCompanion extends NSObject {

	static alloc(): LADomainStateCompanion; // inherited from NSObject

	static new(): LADomainStateCompanion; // inherited from NSObject

	readonly availableCompanionTypes: NSSet<number>;

	readonly stateHash: NSData;

	stateHashForCompanionType(companionType: LACompanionType): NSData;
}

/**
 * @since 18.0
 */
declare class LAEnvironment extends NSObject {

	static alloc(): LAEnvironment; // inherited from NSObject

	static new(): LAEnvironment; // inherited from NSObject

	readonly state: LAEnvironmentState;

	static readonly currentUser: LAEnvironment;

	addObserver(observer: LAEnvironmentObserver): void;

	removeObserver(observer: LAEnvironmentObserver): void;
}

/**
 * @since 18.0
 */
declare class LAEnvironmentMechanism extends NSObject {

	static alloc(): LAEnvironmentMechanism; // inherited from NSObject

	static new(): LAEnvironmentMechanism; // inherited from NSObject

	readonly iconSystemName: string;

	readonly isUsable: boolean;

	readonly localizedName: string;
}

/**
 * @since 18.0
 */
declare class LAEnvironmentMechanismBiometry extends LAEnvironmentMechanism {

	static alloc(): LAEnvironmentMechanismBiometry; // inherited from NSObject

	static new(): LAEnvironmentMechanismBiometry; // inherited from NSObject

	readonly biometryType: LABiometryType;

	readonly builtInSensorInaccessible: boolean;

	readonly isEnrolled: boolean;

	readonly isLockedOut: boolean;

	readonly stateHash: NSData;
}

/**
 * @since 18.0
 */
declare class LAEnvironmentMechanismCompanion extends LAEnvironmentMechanism {

	static alloc(): LAEnvironmentMechanismCompanion; // inherited from NSObject

	static new(): LAEnvironmentMechanismCompanion; // inherited from NSObject

	readonly stateHash: NSData;

	readonly type: LACompanionType;
}

/**
 * @since 18.0
 */
declare class LAEnvironmentMechanismUserPassword extends LAEnvironmentMechanism {

	static alloc(): LAEnvironmentMechanismUserPassword; // inherited from NSObject

	static new(): LAEnvironmentMechanismUserPassword; // inherited from NSObject

	readonly isSet: boolean;
}

/**
 * @since 18.0
 */
interface LAEnvironmentObserver extends NSObjectProtocol {

	environmentStateDidChangeFromOldState?(environment: LAEnvironment, oldState: LAEnvironmentState): void;
}
declare var LAEnvironmentObserver: {

	prototype: LAEnvironmentObserver;
};

/**
 * @since 18.0
 */
declare class LAEnvironmentState extends NSObject implements NSCopying {

	static alloc(): LAEnvironmentState; // inherited from NSObject

	static new(): LAEnvironmentState; // inherited from NSObject

	readonly allMechanisms: NSArray<LAEnvironmentMechanism>;

	readonly biometry: LAEnvironmentMechanismBiometry;

	/**
	 * @since 18.0
	 */
	readonly companions: NSArray<LAEnvironmentMechanismCompanion>;

	readonly userPassword: LAEnvironmentMechanismUserPassword;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
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

	CompanionNotAvailable = -11,

	BiometryNotPaired = -12,

	BiometryDisconnected = -13,

	InvalidDimensions = -14
}

/**
 * @since 8.3
 */
declare var LAErrorDomain: string;

/**
 * @since 16.0
 */
declare class LAPersistedRight extends LARight {

	static alloc(): LAPersistedRight; // inherited from NSObject

	static new(): LAPersistedRight; // inherited from NSObject

	readonly key: LAPrivateKey;

	readonly secret: LASecret;
}

/**
 * @since 8.0
 */
declare const enum LAPolicy {

	DeviceOwnerAuthenticationWithBiometrics = 1,

	DeviceOwnerAuthentication = 2,

	DeviceOwnerAuthenticationWithWatch = 3,

	DeviceOwnerAuthenticationWithCompanion = 3,

	DeviceOwnerAuthenticationWithBiometricsOrWatch = 4,

	DeviceOwnerAuthenticationWithBiometricsOrCompanion = 4,

	DeviceOwnerAuthenticationWithWristDetection = 5
}

/**
 * @since 16.0
 */
declare class LAPrivateKey extends NSObject {

	static alloc(): LAPrivateKey; // inherited from NSObject

	static new(): LAPrivateKey; // inherited from NSObject

	readonly publicKey: LAPublicKey;

	canDecryptUsingSecKeyAlgorithm(algorithm: string): boolean;

	canExchangeKeysUsingSecKeyAlgorithm(algorithm: string): boolean;

	canSignUsingSecKeyAlgorithm(algorithm: string): boolean;

	decryptDataSecKeyAlgorithmCompletion(data: NSData, algorithm: string, handler: (p1: NSData, p2: NSError) => void): void;

	exchangeKeysWithPublicKeySecKeyAlgorithmSecKeyParametersCompletion(publicKey: NSData, algorithm: string, parameters: NSDictionary<any, any>, handler: (p1: NSData, p2: NSError) => void): void;

	signDataSecKeyAlgorithmCompletion(data: NSData, algorithm: string, handler: (p1: NSData, p2: NSError) => void): void;
}

/**
 * @since 16.0
 */
declare class LAPublicKey extends NSObject {

	static alloc(): LAPublicKey; // inherited from NSObject

	static new(): LAPublicKey; // inherited from NSObject

	canEncryptUsingSecKeyAlgorithm(algorithm: string): boolean;

	canVerifyUsingSecKeyAlgorithm(algorithm: string): boolean;

	encryptDataSecKeyAlgorithmCompletion(data: NSData, algorithm: string, handler: (p1: NSData, p2: NSError) => void): void;

	exportBytesWithCompletion(handler: (p1: NSData, p2: NSError) => void): void;

	verifyDataSignatureSecKeyAlgorithmCompletion(signedData: NSData, signature: NSData, algorithm: string, handler: (p1: NSError) => void): void;
}

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
declare const enum LARightState {

	Unknown = 0,

	Authorizing = 1,

	Authorized = 2,

	NotAuthorized = 3
}

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
declare class LASecret extends NSObject {

	static alloc(): LASecret; // inherited from NSObject

	static new(): LASecret; // inherited from NSObject

	loadDataWithCompletion(handler: (p1: NSData, p2: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare var LATouchIDAuthenticationMaximumAllowableReuseDuration: number;
