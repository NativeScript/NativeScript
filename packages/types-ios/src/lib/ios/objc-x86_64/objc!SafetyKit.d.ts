
declare const enum SAAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Authorized = 2
}

/**
 * @since 16.0
 */
interface SACrashDetectionDelegate extends NSObjectProtocol {

	crashDetectionManagerDidDetectEvent?(crashDetectionManager: SACrashDetectionManager, event: SACrashDetectionEvent): void;
}
declare var SACrashDetectionDelegate: {

	prototype: SACrashDetectionDelegate;
};

/**
 * @since 16.0
 */
declare class SACrashDetectionEvent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SACrashDetectionEvent; // inherited from NSObject

	static new(): SACrashDetectionEvent; // inherited from NSObject

	readonly date: Date;

	readonly location: CLLocation;

	readonly response: SACrashDetectionEventResponse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare const enum SACrashDetectionEventResponse {

	Attempted = 0,

	Disabled = 1
}

/**
 * @since 16.0
 */
declare class SACrashDetectionManager extends NSObject {

	static alloc(): SACrashDetectionManager; // inherited from NSObject

	static new(): SACrashDetectionManager; // inherited from NSObject

	readonly authorizationStatus: SAAuthorizationStatus;

	delegate: SACrashDetectionDelegate;

	static readonly available: boolean;

	requestAuthorizationWithCompletionHandler(handler: (p1: SAAuthorizationStatus, p2: NSError) => void): void;
}

/**
 * @since 16.0
 */
interface SAEmergencyResponseDelegate extends NSObjectProtocol {

	emergencyResponseManagerDidUpdateVoiceCallStatus?(emergencyResponseManager: SAEmergencyResponseManager, voiceCallStatus: SAEmergencyResponseManagerVoiceCallStatus): void;
}
declare var SAEmergencyResponseDelegate: {

	prototype: SAEmergencyResponseDelegate;
};

/**
 * @since 16.0
 */
declare class SAEmergencyResponseManager extends NSObject {

	static alloc(): SAEmergencyResponseManager; // inherited from NSObject

	static new(): SAEmergencyResponseManager; // inherited from NSObject

	delegate: SAEmergencyResponseDelegate;

	dialVoiceCallToPhoneNumberCompletionHandler(phoneNumber: string, handler: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 16.0
 */
declare const enum SAEmergencyResponseManagerVoiceCallStatus {

	Dialing = 0,

	Active = 1,

	Disconnected = 2,

	Failed = 3
}

/**
 * @since 16.0
 */
declare const enum SAErrorCode {

	NotAuthorized = 1,

	NotAllowed = 2,

	InvalidArgument = 3,

	OperationFailed = 4
}

/**
 * @since 16.0
 */
declare var SAErrorDomain: string;
