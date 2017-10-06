
declare class PKPushCredentials extends NSObject {

	static alloc(): PKPushCredentials; // inherited from NSObject

	static new(): PKPushCredentials; // inherited from NSObject

	readonly token: NSData;

	readonly type: string;
}

declare class PKPushPayload extends NSObject {

	static alloc(): PKPushPayload; // inherited from NSObject

	static new(): PKPushPayload; // inherited from NSObject

	readonly dictionaryPayload: NSDictionary<any, any>;

	readonly type: string;
}

declare class PKPushRegistry extends NSObject {

	static alloc(): PKPushRegistry; // inherited from NSObject

	static new(): PKPushRegistry; // inherited from NSObject

	delegate: PKPushRegistryDelegate;

	desiredPushTypes: NSSet<string>;

	constructor(o: { queue: NSObject; });

	initWithQueue(queue: NSObject): this;

	pushTokenForType(type: string): NSData;
}

interface PKPushRegistryDelegate extends NSObjectProtocol {

	pushRegistryDidInvalidatePushTokenForType?(registry: PKPushRegistry, type: string): void;

	pushRegistryDidReceiveIncomingPushWithPayloadForType?(registry: PKPushRegistry, payload: PKPushPayload, type: string): void;

	pushRegistryDidReceiveIncomingPushWithPayloadForTypeWithCompletionHandler?(registry: PKPushRegistry, payload: PKPushPayload, type: string, completion: () => void): void;

	pushRegistryDidUpdatePushCredentialsForType(registry: PKPushRegistry, pushCredentials: PKPushCredentials, type: string): void;
}
declare var PKPushRegistryDelegate: {

	prototype: PKPushRegistryDelegate;
};

declare var PKPushTypeComplication: string;

declare var PKPushTypeFileProvider: string;

declare var PKPushTypeVoIP: string;
