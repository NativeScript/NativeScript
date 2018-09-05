
declare class DCDevice extends NSObject {

	static alloc(): DCDevice; // inherited from NSObject

	static new(): DCDevice; // inherited from NSObject

	readonly supported: boolean;

	static readonly currentDevice: DCDevice;

	generateTokenWithCompletionHandler(completion: (p1: NSData, p2: NSError) => void): void;
}

declare const enum DCError {

	UnknownSystemFailure = 0,

	FeatureUnsupported = 1
}

declare var DCErrorDomain: string;
