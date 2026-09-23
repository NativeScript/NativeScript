
/**
 * @since 8.0
 */
declare class PKPushCredentials extends NSObject {

	static alloc(): PKPushCredentials; // inherited from NSObject

	static new(): PKPushCredentials; // inherited from NSObject

	readonly token: NSData;

	readonly type: string;
}

/**
 * @since 8.0
 */
declare class PKPushPayload extends NSObject {

	static alloc(): PKPushPayload; // inherited from NSObject

	static new(): PKPushPayload; // inherited from NSObject

	readonly dictionaryPayload: NSDictionary<any, any>;

	readonly type: string;
}

/**
 * @since 8.0
 */
declare class PKPushRegistry extends NSObject {

	static alloc(): PKPushRegistry; // inherited from NSObject

	static new(): PKPushRegistry; // inherited from NSObject

	delegate: PKPushRegistryDelegate | null;

	desiredPushTypes: NSSet<string> | null;

	constructor(o: { queue: NSObject & OS_dispatch_queue | null; });

	initWithQueue(queue: NSObject & OS_dispatch_queue | null): this;

	pushTokenForType(type: string): NSData | null;
}

interface PKPushRegistryDelegate extends NSObjectProtocol {

	pushRegistryDidInvalidatePushTokenForType?(registry: PKPushRegistry, type: string): void;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	pushRegistryDidReceiveIncomingPushWithPayloadForType?(registry: PKPushRegistry, payload: PKPushPayload, type: string): void;

	/**
	 * @since 11.0
	 */
	pushRegistryDidReceiveIncomingPushWithPayloadForTypeWithCompletionHandler?(registry: PKPushRegistry, payload: PKPushPayload, type: string, completion: () => void): void;

	/**
	 * @since 26.4
	 */
	pushRegistryDidReceiveIncomingVoIPPushWithPayloadMetadataWithCompletionHandler?(registry: PKPushRegistry, payload: PKPushPayload, metadata: PKVoIPPushMetadata, completion: () => void): void;

	pushRegistryDidUpdatePushCredentialsForType(registry: PKPushRegistry, pushCredentials: PKPushCredentials, type: string): void;
}
declare var PKPushRegistryDelegate: {

	prototype: PKPushRegistryDelegate;
};

/**
 * @since 9.0
 * @deprecated 13.0
 */
declare var PKPushTypeComplication: string;

/**
 * @since 11.0
 */
declare var PKPushTypeFileProvider: string;

/**
 * @since 9.0
 */
declare var PKPushTypeVoIP: string;

/**
 * @since 26.4
 */
declare class PKVoIPPushMetadata extends NSObject {

	static alloc(): PKVoIPPushMetadata; // inherited from NSObject

	static new(): PKVoIPPushMetadata; // inherited from NSObject

	readonly mustReport: boolean;
}
