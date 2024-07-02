
/**
 * @since 16.0
 */
declare class NIAlgorithmConvergence extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NIAlgorithmConvergence; // inherited from NSObject

	static new(): NIAlgorithmConvergence; // inherited from NSObject

	readonly reasons: NSArray<string>;

	readonly status: NIAlgorithmConvergenceStatus;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NIAlgorithmConvergenceStatus {

	Unknown = 0,

	NotConverged = 1,

	Converged = 2
}

/**
 * @since 16.0
 */
declare function NIAlgorithmConvergenceStatusReasonDescription(reason: string): string;

/**
 * @since 16.0
 */
declare var NIAlgorithmConvergenceStatusReasonInsufficientHorizontalSweep: string;

/**
 * @since 16.0
 */
declare var NIAlgorithmConvergenceStatusReasonInsufficientLighting: string;

/**
 * @since 16.0
 */
declare var NIAlgorithmConvergenceStatusReasonInsufficientMovement: string;

/**
 * @since 16.0
 */
declare var NIAlgorithmConvergenceStatusReasonInsufficientVerticalSweep: string;

/**
 * @since 14.0
 */
declare class NIConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NIConfiguration; // inherited from NSObject

	static new(): NIConfiguration; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
interface NIDeviceCapability {

	supportsCameraAssistance: boolean;

	supportsDirectionMeasurement: boolean;

	/**
	 * @since 17.0
	 */
	supportsExtendedDistanceMeasurement: boolean;

	supportsPreciseDistanceMeasurement: boolean;
}
declare var NIDeviceCapability: {

	prototype: NIDeviceCapability;
};

/**
 * @since 14.0
 */
declare class NIDiscoveryToken extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NIDiscoveryToken; // inherited from NSObject

	static new(): NIDiscoveryToken; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	readonly deviceCapabilities: NIDeviceCapability;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum NIErrorCode {

	UnsupportedPlatform = -5889,

	InvalidConfiguration = -5888,

	SessionFailed = -5887,

	ResourceUsageTimeout = -5886,

	ActiveSessionsLimitExceeded = -5885,

	UserDidNotAllow = -5884,

	InvalidARConfiguration = -5883,

	AccessoryPeerDeviceUnavailable = -5882,

	IncompatiblePeerDevice = -5881,

	ActiveExtendedDistanceSessionsLimitExceeded = -5880
}

/**
 * @since 14.0
 */
declare var NIErrorDomain: string;

/**
 * @since 15.0
 */
declare class NINearbyAccessoryConfiguration extends NIConfiguration {

	static alloc(): NINearbyAccessoryConfiguration; // inherited from NSObject

	static new(): NINearbyAccessoryConfiguration; // inherited from NSObject

	readonly accessoryDiscoveryToken: NIDiscoveryToken;

	/**
	 * @since 16.0
	 */
	cameraAssistanceEnabled: boolean;

	/**
	 * @since 16.0
	 */
	constructor(o: { accessoryData: NSData; bluetoothPeerIdentifier: NSUUID; });

	constructor(o: { data: NSData; });

	/**
	 * @since 16.0
	 */
	initWithAccessoryDataBluetoothPeerIdentifierError(accessoryData: NSData, identifier: NSUUID): this;

	initWithDataError(data: NSData): this;
}

/**
 * @since 14.0
 */
declare class NINearbyObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NINearbyObject; // inherited from NSObject

	static new(): NINearbyObject; // inherited from NSObject

	readonly direction: interop.Reference<number>;

	readonly discoveryToken: NIDiscoveryToken;

	readonly distance: number;

	/**
	 * @since 16.0
	 */
	readonly horizontalAngle: number;

	/**
	 * @since 16.0
	 */
	readonly verticalDirectionEstimate: NINearbyObjectVerticalDirectionEstimate;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare var NINearbyObjectAngleNotAvailable: number;

/**
 * @since 14.0
 */
declare var NINearbyObjectDirectionNotAvailable: interop.Reference<number>;

/**
 * @since 14.0
 */
declare var NINearbyObjectDistanceNotAvailable: number;

declare const enum NINearbyObjectRemovalReason {

	Timeout = 0,

	PeerEnded = 1
}

declare const enum NINearbyObjectVerticalDirectionEstimate {

	Unknown = 0,

	Same = 1,

	Above = 2,

	Below = 3,

	AboveOrBelow = 4
}

/**
 * @since 16.0
 */
declare var NINearbyObjectWorldTransformNotAvailable: simd_float4x4;

/**
 * @since 14.0
 */
declare class NINearbyPeerConfiguration extends NIConfiguration {

	static alloc(): NINearbyPeerConfiguration; // inherited from NSObject

	static new(): NINearbyPeerConfiguration; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	cameraAssistanceEnabled: boolean;

	/**
	 * @since 17.0
	 */
	extendedDistanceMeasurementEnabled: boolean;

	readonly peerDiscoveryToken: NIDiscoveryToken;

	constructor(o: { peerToken: NIDiscoveryToken; });

	initWithPeerToken(peerToken: NIDiscoveryToken): this;
}

/**
 * @since 14.0
 */
declare class NISession extends NSObject {

	static alloc(): NISession; // inherited from NSObject

	static new(): NISession; // inherited from NSObject

	readonly configuration: NIConfiguration;

	delegate: NISessionDelegate;

	delegateQueue: NSObject & OS_dispatch_queue;

	readonly discoveryToken: NIDiscoveryToken;

	/**
	 * @since 16.0
	 */
	static readonly deviceCapabilities: NIDeviceCapability;

	/**
	 * @since 14.0
	 * @deprecated 16.0
	 */
	static readonly supported: boolean;

	invalidate(): void;

	pause(): void;

	runWithConfiguration(configuration: NIConfiguration): void;

	/**
	 * @since 16.0
	 */
	setARSession(session: ARSession): void;

	/**
	 * @since 16.0
	 */
	worldTransformForObject(object: NINearbyObject): simd_float4x4;
}

/**
 * @since 14.0
 */
interface NISessionDelegate extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	sessionDidGenerateShareableConfigurationDataForObject?(session: NISession, shareableConfigurationData: NSData, object: NINearbyObject): void;

	sessionDidInvalidateWithError?(session: NISession, error: NSError): void;

	sessionDidRemoveNearbyObjectsWithReason?(session: NISession, nearbyObjects: NSArray<NINearbyObject> | NINearbyObject[], reason: NINearbyObjectRemovalReason): void;

	/**
	 * @since 16.0
	 */
	sessionDidStartRunning?(session: NISession): void;

	/**
	 * @since 16.0
	 */
	sessionDidUpdateAlgorithmConvergenceForObject?(session: NISession, convergence: NIAlgorithmConvergence, object: NINearbyObject): void;

	sessionDidUpdateNearbyObjects?(session: NISession, nearbyObjects: NSArray<NINearbyObject> | NINearbyObject[]): void;

	sessionSuspensionEnded?(session: NISession): void;

	sessionWasSuspended?(session: NISession): void;
}
declare var NISessionDelegate: {

	prototype: NISessionDelegate;
};
