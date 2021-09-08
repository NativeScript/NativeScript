
declare class ADClient extends NSObject {

	static alloc(): ADClient; // inherited from NSObject

	static new(): ADClient; // inherited from NSObject

	static sharedClient(): ADClient;

	addClientToSegmentsReplaceExisting(segmentIdentifiers: NSArray<string> | string[], replaceExisting: boolean): void;

	requestAttributionDetailsWithBlock(completionHandler: (p1: NSDictionary<string, NSObject>, p2: NSError) => void): void;
}

declare const enum ADClientError {

	Unknown = 0,

	TrackingRestrictedOrDenied = 1,

	LimitAdTracking = 1,

	MissingData = 2,

	CorruptResponse = 3,

	RequestClientError = 4,

	RequestServerError = 5,

	RequestNetworkError = 6,

	UnsupportedPlatform = 7
}

declare var ADClientErrorDomain: string;
