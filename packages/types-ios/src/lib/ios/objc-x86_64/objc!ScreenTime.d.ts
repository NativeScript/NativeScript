
declare class STScreenTimeConfiguration extends NSObject {

	static alloc(): STScreenTimeConfiguration; // inherited from NSObject

	static new(): STScreenTimeConfiguration; // inherited from NSObject

	readonly enforcesChildRestrictions: boolean;
}

declare class STScreenTimeConfigurationObserver extends NSObject {

	static alloc(): STScreenTimeConfigurationObserver; // inherited from NSObject

	static new(): STScreenTimeConfigurationObserver; // inherited from NSObject

	readonly configuration: STScreenTimeConfiguration;

	constructor(o: { updateQueue: NSObject; });

	initWithUpdateQueue(updateQueue: NSObject): this;

	startObserving(): void;

	stopObserving(): void;
}

declare class STWebHistory extends NSObject {

	static alloc(): STWebHistory; // inherited from NSObject

	static new(): STWebHistory; // inherited from NSObject

	constructor(o: { bundleIdentifier: string; });

	deleteAllHistory(): void;

	deleteHistoryDuringInterval(interval: NSDateInterval): void;

	deleteHistoryForURL(url: NSURL): void;

	initWithBundleIdentifierError(bundleIdentifier: string): this;
}

declare class STWebpageController extends UIViewController {

	static alloc(): STWebpageController; // inherited from NSObject

	static new(): STWebpageController; // inherited from NSObject

	URL: NSURL;

	readonly URLIsBlocked: boolean;

	URLIsPictureInPicture: boolean;

	URLIsPlayingVideo: boolean;

	suppressUsageRecording: boolean;

	setBundleIdentifierError(bundleIdentifier: string): boolean;
}
