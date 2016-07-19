
declare class PKPushCredentials extends NSObject {

	static alloc(): PKPushCredentials; // inherited from NSObject

	static new(): PKPushCredentials; // inherited from NSObject

	/* readonly */ token: NSData;

	/* readonly */ type: string;

	constructor(); // inherited from NSObject

	self(): PKPushCredentials; // inherited from NSObjectProtocol
}

declare class PKPushPayload extends NSObject {

	static alloc(): PKPushPayload; // inherited from NSObject

	static new(): PKPushPayload; // inherited from NSObject

	/* readonly */ dictionaryPayload: NSDictionary<any, any>;

	/* readonly */ type: string;

	constructor(); // inherited from NSObject

	self(): PKPushPayload; // inherited from NSObjectProtocol
}

declare class PKPushRegistry extends NSObject {

	static alloc(): PKPushRegistry; // inherited from NSObject

	static new(): PKPushRegistry; // inherited from NSObject

	delegate: PKPushRegistryDelegate;

	desiredPushTypes: NSSet<any>;

	constructor(); // inherited from NSObject

	constructor(o: { queue: NSObject; });

	pushTokenForType(type: string): NSData;

	self(): PKPushRegistry; // inherited from NSObjectProtocol
}

interface PKPushRegistryDelegate extends NSObjectProtocol {

	pushRegistryDidInvalidatePushTokenForType?(registry: PKPushRegistry, type: string): void;

	pushRegistryDidReceiveIncomingPushWithPayloadForType(registry: PKPushRegistry, payload: PKPushPayload, type: string): void;

	pushRegistryDidUpdatePushCredentialsForType(registry: PKPushRegistry, credentials: PKPushCredentials, type: string): void;
}
declare var PKPushRegistryDelegate: {

	prototype: PKPushRegistryDelegate;
};

declare var PKPushTypeComplication: string;

declare var PKPushTypeVoIP: string;
