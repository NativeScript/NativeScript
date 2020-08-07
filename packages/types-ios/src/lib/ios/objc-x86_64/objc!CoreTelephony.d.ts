
declare class CTCall extends NSObject {

	static alloc(): CTCall; // inherited from NSObject

	static new(): CTCall; // inherited from NSObject

	readonly callID: string;

	readonly callState: string;
}

declare class CTCallCenter extends NSObject {

	static alloc(): CTCallCenter; // inherited from NSObject

	static new(): CTCallCenter; // inherited from NSObject

	callEventHandler: (p1: CTCall) => void;

	readonly currentCalls: NSSet<CTCall>;
}

declare var CTCallStateConnected: string;

declare var CTCallStateDialing: string;

declare var CTCallStateDisconnected: string;

declare var CTCallStateIncoming: string;

declare class CTCarrier extends NSObject {

	static alloc(): CTCarrier; // inherited from NSObject

	static new(): CTCarrier; // inherited from NSObject

	readonly allowsVOIP: boolean;

	readonly carrierName: string;

	readonly isoCountryCode: string;

	readonly mobileCountryCode: string;

	readonly mobileNetworkCode: string;
}

declare class CTCellularData extends NSObject {

	static alloc(): CTCellularData; // inherited from NSObject

	static new(): CTCellularData; // inherited from NSObject

	cellularDataRestrictionDidUpdateNotifier: (p1: CTCellularDataRestrictedState) => void;

	readonly restrictedState: CTCellularDataRestrictedState;
}

declare const enum CTCellularDataRestrictedState {

	kCTCellularDataRestrictedStateUnknown = 0,

	kCTCellularDataRestricted = 1,

	kCTCellularDataNotRestricted = 2
}

declare class CTCellularPlanProvisioning extends NSObject {

	static alloc(): CTCellularPlanProvisioning; // inherited from NSObject

	static new(): CTCellularPlanProvisioning; // inherited from NSObject

	addPlanWithCompletionHandler(request: CTCellularPlanProvisioningRequest, completionHandler: (p1: CTCellularPlanProvisioningAddPlanResult) => void): void;

	supportsCellularPlan(): boolean;
}

declare const enum CTCellularPlanProvisioningAddPlanResult {

	Unknown = 0,

	Fail = 1,

	Success = 2
}

declare class CTCellularPlanProvisioningRequest extends NSObject implements NSSecureCoding {

	static alloc(): CTCellularPlanProvisioningRequest; // inherited from NSObject

	static new(): CTCellularPlanProvisioningRequest; // inherited from NSObject

	EID: string;

	ICCID: string;

	OID: string;

	address: string;

	confirmationCode: string;

	matchingID: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

interface CTError {
	domain: number;
	error: number;
}
declare var CTError: interop.StructType<CTError>;

declare var CTRadioAccessTechnologyCDMA1x: string;

declare var CTRadioAccessTechnologyCDMAEVDORev0: string;

declare var CTRadioAccessTechnologyCDMAEVDORevA: string;

declare var CTRadioAccessTechnologyCDMAEVDORevB: string;

declare var CTRadioAccessTechnologyDidChangeNotification: string;

declare var CTRadioAccessTechnologyEdge: string;

declare var CTRadioAccessTechnologyGPRS: string;

declare var CTRadioAccessTechnologyHSDPA: string;

declare var CTRadioAccessTechnologyHSUPA: string;

declare var CTRadioAccessTechnologyLTE: string;

declare var CTRadioAccessTechnologyWCDMA: string;

declare var CTRadioAccessTechnologyeHRPD: string;

declare var CTServiceRadioAccessTechnologyDidChangeNotification: string;

declare class CTSubscriber extends NSObject {

	static alloc(): CTSubscriber; // inherited from NSObject

	static new(): CTSubscriber; // inherited from NSObject

	readonly carrierToken: NSData;

	delegate: CTSubscriberDelegate;

	readonly identifier: string;
}

interface CTSubscriberDelegate {

	subscriberTokenRefreshed(subscriber: CTSubscriber): void;
}
declare var CTSubscriberDelegate: {

	prototype: CTSubscriberDelegate;
};

declare class CTSubscriberInfo extends NSObject {

	static alloc(): CTSubscriberInfo; // inherited from NSObject

	static new(): CTSubscriberInfo; // inherited from NSObject

	static subscriber(): CTSubscriber;

	static subscribers(): NSArray<CTSubscriber>;
}

declare var CTSubscriberTokenRefreshed: string;

declare class CTTelephonyNetworkInfo extends NSObject {

	static alloc(): CTTelephonyNetworkInfo; // inherited from NSObject

	static new(): CTTelephonyNetworkInfo; // inherited from NSObject

	readonly currentRadioAccessTechnology: string;

	readonly dataServiceIdentifier: string;

	delegate: CTTelephonyNetworkInfoDelegate;

	readonly serviceCurrentRadioAccessTechnology: NSDictionary<string, string>;

	readonly serviceSubscriberCellularProviders: NSDictionary<string, CTCarrier>;

	serviceSubscriberCellularProvidersDidUpdateNotifier: (p1: string) => void;

	readonly subscriberCellularProvider: CTCarrier;

	subscriberCellularProviderDidUpdateNotifier: (p1: CTCarrier) => void;
}

interface CTTelephonyNetworkInfoDelegate extends NSObjectProtocol {

	dataServiceIdentifierDidChange?(identifier: string): void;
}
declare var CTTelephonyNetworkInfoDelegate: {

	prototype: CTTelephonyNetworkInfoDelegate;
};

declare const kCTErrorDomainMach: number;

declare const kCTErrorDomainNoError: number;

declare const kCTErrorDomainPOSIX: number;
