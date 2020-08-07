
declare const enum LAAccessControlOperation {

	CreateItem = 0,

	UseItem = 1,

	CreateKey = 2,

	UseKeySign = 3,

	UseKeyDecrypt = 4,

	UseKeyKeyExchange = 5
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

	ApplicationPassword = 0
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

	WatchNotAvailable = -11
}

declare var LAErrorDomain: string;

declare const enum LAPolicy {

	DeviceOwnerAuthenticationWithBiometrics = 1,

	DeviceOwnerAuthentication = 2,

	DeviceOwnerAuthenticationWithWatch = 3,

	DeviceOwnerAuthenticationWithBiometricsOrWatch = 4
}

declare var LATouchIDAuthenticationMaximumAllowableReuseDuration: number;
