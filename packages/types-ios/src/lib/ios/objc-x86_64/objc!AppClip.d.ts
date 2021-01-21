
declare class APActivationPayload extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): APActivationPayload; // inherited from NSObject

	static new(): APActivationPayload; // inherited from NSObject

	readonly URL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	confirmAcquiredInRegionCompletionHandler(region: CLRegion, completionHandler: (p1: boolean, p2: NSError) => void): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum APActivationPayloadErrorCode {

	Disallowed = 1,

	DoesNotMatch = 2
}

declare var APActivationPayloadErrorDomain: string;
