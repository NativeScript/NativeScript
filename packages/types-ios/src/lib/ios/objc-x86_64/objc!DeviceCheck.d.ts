
declare class DCAppAttestService extends NSObject {

	static alloc(): DCAppAttestService; // inherited from NSObject

	static new(): DCAppAttestService; // inherited from NSObject

	readonly supported: boolean;

	static readonly sharedService: DCAppAttestService;

	attestKeyClientDataHashCompletionHandler(keyId: string, clientDataHash: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	generateAssertionClientDataHashCompletionHandler(keyId: string, clientDataHash: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	generateKeyWithCompletionHandler(completionHandler: (p1: string, p2: NSError) => void): void;
}

declare class DCDevice extends NSObject {

	static alloc(): DCDevice; // inherited from NSObject

	static new(): DCDevice; // inherited from NSObject

	readonly supported: boolean;

	static readonly currentDevice: DCDevice;

	generateTokenWithCompletionHandler(completion: (p1: NSData, p2: NSError) => void): void;
}

declare const enum DCError {

	UnknownSystemFailure = 0,

	FeatureUnsupported = 1,

	InvalidInput = 2,

	InvalidKey = 3,

	ServerUnavailable = 4
}

declare var DCErrorDomain: string;
