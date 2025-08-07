
/**
 * @since 14.0
 */
declare class STScreenTimeConfiguration extends NSObject {

	static alloc(): STScreenTimeConfiguration; // inherited from NSObject

	static new(): STScreenTimeConfiguration; // inherited from NSObject

	readonly enforcesChildRestrictions: boolean;
}

/**
 * @since 14.0
 */
declare class STScreenTimeConfigurationObserver extends NSObject {

	static alloc(): STScreenTimeConfigurationObserver; // inherited from NSObject

	static new(): STScreenTimeConfigurationObserver; // inherited from NSObject

	readonly configuration: STScreenTimeConfiguration;

	constructor(o: { updateQueue: NSObject & OS_dispatch_queue; });

	initWithUpdateQueue(updateQueue: NSObject & OS_dispatch_queue): this;

	startObserving(): void;

	stopObserving(): void;
}

/**
 * @since 14.0
 */
declare class STWebHistory extends NSObject {

	static alloc(): STWebHistory; // inherited from NSObject

	static new(): STWebHistory; // inherited from NSObject

	constructor(o: { bundleIdentifier: string; });

	/**
	 * @since 18.4
	 */
	constructor(o: { bundleIdentifier: string; profileIdentifier: string; });

	/**
	 * @since 18.4
	 */
	constructor(o: { profileIdentifier: string; });

	deleteAllHistory(): void;

	deleteHistoryDuringInterval(interval: NSDateInterval): void;

	deleteHistoryForURL(url: NSURL): void;

	/**
	 * @since 18.4
	 */
	fetchAllHistoryWithCompletionHandler(completionHandler: (p1: NSSet<NSURL>, p2: NSError) => void): void;

	/**
	 * @since 18.4
	 */
	fetchHistoryDuringIntervalCompletionHandler(interval: NSDateInterval, completionHandler: (p1: NSSet<NSURL>, p2: NSError) => void): void;

	initWithBundleIdentifierError(bundleIdentifier: string): this;

	/**
	 * @since 18.4
	 */
	initWithBundleIdentifierProfileIdentifierError(bundleIdentifier: string, profileIdentifier: string): this;

	/**
	 * @since 18.4
	 */
	initWithProfileIdentifier(profileIdentifier: string): this;
}

/**
 * @since 14.0
 */
declare class STWebpageController extends UIViewController {

	static alloc(): STWebpageController; // inherited from NSObject

	static new(): STWebpageController; // inherited from NSObject

	URL: NSURL;

	readonly URLIsBlocked: boolean;

	URLIsPictureInPicture: boolean;

	URLIsPlayingVideo: boolean;

	/**
	 * @since 18.4
	 */
	profileIdentifier: string;

	suppressUsageRecording: boolean;

	setBundleIdentifierError(bundleIdentifier: string): boolean;
}
