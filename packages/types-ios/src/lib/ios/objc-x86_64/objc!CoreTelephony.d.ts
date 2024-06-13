
/**
 * @since 4.0
 */
declare class CTCall extends NSObject {

	static alloc(): CTCall; // inherited from NSObject

	static new(): CTCall; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	readonly callID: string;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	readonly callState: string;
}

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare class CTCallCenter extends NSObject {

	static alloc(): CTCallCenter; // inherited from NSObject

	static new(): CTCallCenter; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	callEventHandler: (p1: CTCall) => void;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	readonly currentCalls: NSSet<CTCall>;
}

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var CTCallStateConnected: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var CTCallStateDialing: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var CTCallStateDisconnected: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare var CTCallStateIncoming: string;

/**
 * @since 4.0
 * @deprecated 16.0
 */
declare class CTCarrier extends NSObject {

	static alloc(): CTCarrier; // inherited from NSObject

	static new(): CTCarrier; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 16.0
	 */
	readonly allowsVOIP: boolean;

	/**
	 * @since 4.0
	 * @deprecated 16.0
	 */
	readonly carrierName: string;

	/**
	 * @since 4.0
	 * @deprecated 16.0
	 */
	readonly isoCountryCode: string;

	/**
	 * @since 4.0
	 * @deprecated 16.0
	 */
	readonly mobileCountryCode: string;

	/**
	 * @since 4.0
	 * @deprecated 16.0
	 */
	readonly mobileNetworkCode: string;
}

/**
 * @since 9.0
 */
declare class CTCellularData extends NSObject {

	static alloc(): CTCellularData; // inherited from NSObject

	static new(): CTCellularData; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	cellularDataRestrictionDidUpdateNotifier: (p1: CTCellularDataRestrictedState) => void;

	/**
	 * @since 9.0
	 */
	readonly restrictedState: CTCellularDataRestrictedState;
}

declare const enum CTCellularDataRestrictedState {

	kCTCellularDataRestrictedStateUnknown = 0,

	kCTCellularDataRestricted = 1,

	kCTCellularDataNotRestricted = 2
}

/**
 * @since 12.0
 */
declare class CTCellularPlanProvisioning extends NSObject {

	static alloc(): CTCellularPlanProvisioning; // inherited from NSObject

	static new(): CTCellularPlanProvisioning; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly supportsEmbeddedSIM: boolean;

	/**
	 * @since 12.0
	 */
	addPlanWithCompletionHandler(request: CTCellularPlanProvisioningRequest, completionHandler: (p1: CTCellularPlanProvisioningAddPlanResult) => void): void;

	/**
	 * @since 12.0
	 */
	supportsCellularPlan(): boolean;
}

/**
 * @since 12.0
 */
declare const enum CTCellularPlanProvisioningAddPlanResult {

	Unknown = 0,

	Fail = 1,

	Success = 2,

	Cancel = 3
}

/**
 * @since 12.0
 */
declare class CTCellularPlanProvisioningRequest extends NSObject implements NSSecureCoding {

	static alloc(): CTCellularPlanProvisioningRequest; // inherited from NSObject

	static new(): CTCellularPlanProvisioningRequest; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	EID: string;

	/**
	 * @since 12.0
	 */
	ICCID: string;

	/**
	 * @since 12.0
	 */
	OID: string;

	/**
	 * @since 12.0
	 */
	address: string;

	/**
	 * @since 12.0
	 */
	confirmationCode: string;

	/**
	 * @since 12.0
	 */
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

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyCDMA1x: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyCDMAEVDORev0: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyCDMAEVDORevA: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyCDMAEVDORevB: string;

/**
 * @since 7.0
 * @deprecated 12.0
 */
declare var CTRadioAccessTechnologyDidChangeNotification: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyEdge: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyGPRS: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyHSDPA: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyHSUPA: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyLTE: string;

/**
 * @since 14.1
 */
declare var CTRadioAccessTechnologyNR: string;

/**
 * @since 14.1
 */
declare var CTRadioAccessTechnologyNRNSA: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyWCDMA: string;

/**
 * @since 7.0
 */
declare var CTRadioAccessTechnologyeHRPD: string;

/**
 * @since 12.0
 */
declare var CTServiceRadioAccessTechnologyDidChangeNotification: string;

/**
 * @since 7.0
 */
declare class CTSubscriber extends NSObject {

	static alloc(): CTSubscriber; // inherited from NSObject

	static new(): CTSubscriber; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	readonly SIMInserted: boolean;

	/**
	 * @since 7.0
	 */
	readonly carrierToken: NSData;

	/**
	 * @since 12.1
	 */
	delegate: CTSubscriberDelegate;

	/**
	 * @since 12.1
	 */
	readonly identifier: string;

	/**
	 * @since 6.0
	 */
	refreshCarrierToken(): boolean;
}

/**
 * @since 12.1
 */
interface CTSubscriberDelegate {

	subscriberTokenRefreshed(subscriber: CTSubscriber): void;
}
declare var CTSubscriberDelegate: {

	prototype: CTSubscriberDelegate;
};

/**
 * @since 6.0
 */
declare class CTSubscriberInfo extends NSObject {

	static alloc(): CTSubscriberInfo; // inherited from NSObject

	static new(): CTSubscriberInfo; // inherited from NSObject

	/**
	 * @since 6.0
	 * @deprecated 12.1
	 */
	static subscriber(): CTSubscriber;

	/**
	 * @since 12.1
	 */
	static subscribers(): NSArray<CTSubscriber>;
}

/**
 * @since 7.0
 * @deprecated 12.1
 */
declare var CTSubscriberTokenRefreshed: string;

/**
 * @since 4.0
 */
declare class CTTelephonyNetworkInfo extends NSObject {

	static alloc(): CTTelephonyNetworkInfo; // inherited from NSObject

	static new(): CTTelephonyNetworkInfo; // inherited from NSObject

	/**
	 * @since 7.0
	 * @deprecated 12.0
	 */
	readonly currentRadioAccessTechnology: string;

	/**
	 * @since 13.0
	 */
	readonly dataServiceIdentifier: string;

	/**
	 * @since 13.0
	 */
	delegate: CTTelephonyNetworkInfoDelegate;

	/**
	 * @since 12.0
	 */
	readonly serviceCurrentRadioAccessTechnology: NSDictionary<string, string>;

	/**
	 * @since 12.0
	 * @deprecated 16.0
	 */
	readonly serviceSubscriberCellularProviders: NSDictionary<string, CTCarrier>;

	/**
	 * @since 12.0
	 * @deprecated 16.0
	 */
	serviceSubscriberCellularProvidersDidUpdateNotifier: (p1: string) => void;

	/**
	 * @since 4.0
	 * @deprecated 12.0
	 */
	readonly subscriberCellularProvider: CTCarrier;

	/**
	 * @since 4.0
	 * @deprecated 12.0
	 */
	subscriberCellularProviderDidUpdateNotifier: (p1: CTCarrier) => void;
}

/**
 * @since 13.0
 */
interface CTTelephonyNetworkInfoDelegate extends NSObjectProtocol {

	dataServiceIdentifierDidChange?(identifier: string): void;
}
declare var CTTelephonyNetworkInfoDelegate: {

	prototype: CTTelephonyNetworkInfoDelegate;
};

declare const kCTErrorDomainMach: number;

declare const kCTErrorDomainNoError: number;

declare const kCTErrorDomainPOSIX: number;
