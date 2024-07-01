
/**
 * @since 7.1
 * @deprecated 14.5
 */
declare class ADClient extends NSObject {

	static alloc(): ADClient; // inherited from NSObject

	static new(): ADClient; // inherited from NSObject

	/**
	 * @since 7.1
	 * @deprecated 14.5
	 */
	static sharedClient(): ADClient;

	/**
	 * @since 9.0
	 * @deprecated 14.5
	 */
	requestAttributionDetailsWithBlock(completionHandler: (p1: NSDictionary<string, NSObject>, p2: NSError) => void): void;
}

/**
 * @since 7.1
 * @deprecated 15.0
 */
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

/**
 * @since 7.1
 * @deprecated 15.0
 */
declare var ADClientErrorDomain: string;
