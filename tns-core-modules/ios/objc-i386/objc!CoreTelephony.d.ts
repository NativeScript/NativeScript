
declare class CTCall extends NSObject {

	static alloc(): CTCall; // inherited from NSObject

	static new(): CTCall; // inherited from NSObject

	/* readonly */ callID: string;

	/* readonly */ callState: string;

	constructor(); // inherited from NSObject

	self(): CTCall; // inherited from NSObjectProtocol
}

declare class CTCallCenter extends NSObject {

	static alloc(): CTCallCenter; // inherited from NSObject

	static new(): CTCallCenter; // inherited from NSObject

	callEventHandler: (p1: CTCall) => void;

	/* readonly */ currentCalls: NSSet<CTCall>;

	constructor(); // inherited from NSObject

	self(): CTCallCenter; // inherited from NSObjectProtocol
}

declare var CTCallStateConnected: string;

declare var CTCallStateDialing: string;

declare var CTCallStateDisconnected: string;

declare var CTCallStateIncoming: string;

declare class CTCarrier extends NSObject {

	static alloc(): CTCarrier; // inherited from NSObject

	static new(): CTCarrier; // inherited from NSObject

	/* readonly */ allowsVOIP: boolean;

	/* readonly */ carrierName: string;

	/* readonly */ isoCountryCode: string;

	/* readonly */ mobileCountryCode: string;

	/* readonly */ mobileNetworkCode: string;

	constructor(); // inherited from NSObject

	self(): CTCarrier; // inherited from NSObjectProtocol
}

declare class CTCellularData extends NSObject {

	static alloc(): CTCellularData; // inherited from NSObject

	static new(): CTCellularData; // inherited from NSObject

	cellularDataRestrictionDidUpdateNotifier: (p1: CTCellularDataRestrictedState) => void;

	/* readonly */ restrictedState: CTCellularDataRestrictedState;

	constructor(); // inherited from NSObject

	self(): CTCellularData; // inherited from NSObjectProtocol
}

declare const enum CTCellularDataRestrictedState {

	kCTCellularDataRestrictedStateUnknown = 0,

	kCTCellularDataRestricted = 1,

	kCTCellularDataNotRestricted = 2
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

declare class CTSubscriber extends NSObject {

	static alloc(): CTSubscriber; // inherited from NSObject

	static new(): CTSubscriber; // inherited from NSObject

	/* readonly */ carrierToken: NSData;

	constructor(); // inherited from NSObject

	self(): CTSubscriber; // inherited from NSObjectProtocol
}

declare class CTSubscriberInfo extends NSObject {

	static alloc(): CTSubscriberInfo; // inherited from NSObject

	static new(): CTSubscriberInfo; // inherited from NSObject

	static subscriber(): CTSubscriber;

	constructor(); // inherited from NSObject

	self(): CTSubscriberInfo; // inherited from NSObjectProtocol
}

declare var CTSubscriberTokenRefreshed: string;

declare class CTTelephonyNetworkInfo extends NSObject {

	static alloc(): CTTelephonyNetworkInfo; // inherited from NSObject

	static new(): CTTelephonyNetworkInfo; // inherited from NSObject

	/* readonly */ currentRadioAccessTechnology: string;

	/* readonly */ subscriberCellularProvider: CTCarrier;

	subscriberCellularProviderDidUpdateNotifier: (p1: CTCarrier) => void;

	constructor(); // inherited from NSObject

	self(): CTTelephonyNetworkInfo; // inherited from NSObjectProtocol
}
