
declare const enum LAAccessControlOperation {

	CreateItem = 0,

	UseItem = 1,

	CreateKey = 2,

	UseKeySign = 3
}

declare class LAContext extends NSObject {

	static alloc(): LAContext; // inherited from NSObject

	static new(): LAContext; // inherited from NSObject

	/* readonly */ evaluatedPolicyDomainState: NSData;

	localizedFallbackTitle: string;

	maxBiometryFailures: number;

	touchIDAuthenticationAllowableReuseDuration: number;

	constructor(); // inherited from NSObject

	canEvaluatePolicyError(policy: LAPolicy): boolean;

	evaluateAccessControlOperationLocalizedReasonReply(accessControl: any, operation: LAAccessControlOperation, localizedReason: string, reply: (p1: boolean, p2: NSError) => void): void;

	evaluatePolicyLocalizedReasonReply(policy: LAPolicy, localizedReason: string, reply: (p1: boolean, p2: NSError) => void): void;

	invalidate(): void;

	isCredentialSet(type: LACredentialType): boolean;

	self(): LAContext; // inherited from NSObjectProtocol

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

	InvalidContext = -10
}

declare var LAErrorDomain: string;

declare const enum LAPolicy {

	DeviceOwnerAuthenticationWithBiometrics = 1,

	DeviceOwnerAuthentication = 2
}

declare var LATouchIDAuthenticationMaximumAllowableReuseDuration: number;
