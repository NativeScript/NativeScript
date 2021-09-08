
declare class NIConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NIConfiguration; // inherited from NSObject

	static new(): NIConfiguration; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class NIDiscoveryToken extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NIDiscoveryToken; // inherited from NSObject

	static new(): NIDiscoveryToken; // inherited from NSObject

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

	UserDidNotAllow = -5884
}

declare var NIErrorDomain: string;

declare class NINearbyAccessoryConfiguration extends NIConfiguration {

	static alloc(): NINearbyAccessoryConfiguration; // inherited from NSObject

	static new(): NINearbyAccessoryConfiguration; // inherited from NSObject

	readonly accessoryDiscoveryToken: NIDiscoveryToken;

	constructor(o: { data: NSData; });

	initWithDataError(data: NSData): this;
}

declare class NINearbyObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): NINearbyObject; // inherited from NSObject

	static new(): NINearbyObject; // inherited from NSObject

	readonly direction: interop.Reference<number>;

	readonly discoveryToken: NIDiscoveryToken;

	readonly distance: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var NINearbyObjectDirectionNotAvailable: interop.Reference<number>;

declare var NINearbyObjectDistanceNotAvailable: number;

declare const enum NINearbyObjectRemovalReason {

	Timeout = 0,

	PeerEnded = 1
}

declare class NINearbyPeerConfiguration extends NIConfiguration {

	static alloc(): NINearbyPeerConfiguration; // inherited from NSObject

	static new(): NINearbyPeerConfiguration; // inherited from NSObject

	readonly peerDiscoveryToken: NIDiscoveryToken;

	constructor(o: { peerToken: NIDiscoveryToken; });

	initWithPeerToken(peerToken: NIDiscoveryToken): this;
}

declare class NISession extends NSObject {

	static alloc(): NISession; // inherited from NSObject

	static new(): NISession; // inherited from NSObject

	readonly configuration: NIConfiguration;

	delegate: NISessionDelegate;

	delegateQueue: NSObject;

	readonly discoveryToken: NIDiscoveryToken;

	static readonly supported: boolean;

	invalidate(): void;

	pause(): void;

	runWithConfiguration(configuration: NIConfiguration): void;
}

interface NISessionDelegate extends NSObjectProtocol {

	sessionDidGenerateShareableConfigurationDataForObject?(session: NISession, shareableConfigurationData: NSData, object: NINearbyObject): void;

	sessionDidInvalidateWithError?(session: NISession, error: NSError): void;

	sessionDidRemoveNearbyObjectsWithReason?(session: NISession, nearbyObjects: NSArray<NINearbyObject> | NINearbyObject[], reason: NINearbyObjectRemovalReason): void;

	sessionDidUpdateNearbyObjects?(session: NISession, nearbyObjects: NSArray<NINearbyObject> | NINearbyObject[]): void;

	sessionSuspensionEnded?(session: NISession): void;

	sessionWasSuspended?(session: NISession): void;
}
declare var NISessionDelegate: {

	prototype: NISessionDelegate;
};
