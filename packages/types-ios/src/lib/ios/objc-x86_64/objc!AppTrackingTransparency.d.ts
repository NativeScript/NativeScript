
declare class ATTrackingManager extends NSObject {

	static alloc(): ATTrackingManager; // inherited from NSObject

	static new(): ATTrackingManager; // inherited from NSObject

	static requestTrackingAuthorizationWithCompletionHandler(completion: (p1: ATTrackingManagerAuthorizationStatus) => void): void;

	static readonly trackingAuthorizationStatus: ATTrackingManagerAuthorizationStatus;
}

declare const enum ATTrackingManagerAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare var AppTrackingTransparencyVersionNumber: number;

declare var AppTrackingTransparencyVersionString: interop.Reference<number>;
