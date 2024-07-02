
/**
 * @since 13.0
 */
declare class BGAppRefreshTask extends BGTask {

	static alloc(): BGAppRefreshTask; // inherited from NSObject

	static new(): BGAppRefreshTask; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare class BGAppRefreshTaskRequest extends BGTaskRequest {

	static alloc(): BGAppRefreshTaskRequest; // inherited from NSObject

	static new(): BGAppRefreshTaskRequest; // inherited from NSObject

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

/**
 * @since 17.0
 */
declare class BGHealthResearchTask extends BGProcessingTask {

	static alloc(): BGHealthResearchTask; // inherited from NSObject

	static new(): BGHealthResearchTask; // inherited from NSObject
}

/**
 * @since 17.0
 */
declare class BGHealthResearchTaskRequest extends BGProcessingTaskRequest {

	static alloc(): BGHealthResearchTaskRequest; // inherited from NSObject

	static new(): BGHealthResearchTaskRequest; // inherited from NSObject

	protectionTypeOfRequiredData: string;
}

/**
 * @since 13.0
 */
declare class BGProcessingTask extends BGTask {

	static alloc(): BGProcessingTask; // inherited from NSObject

	static new(): BGProcessingTask; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare class BGProcessingTaskRequest extends BGTaskRequest {

	static alloc(): BGProcessingTaskRequest; // inherited from NSObject

	static new(): BGProcessingTaskRequest; // inherited from NSObject

	requiresExternalPower: boolean;

	requiresNetworkConnectivity: boolean;

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

/**
 * @since 13.0
 */
declare class BGTask extends NSObject {

	static alloc(): BGTask; // inherited from NSObject

	static new(): BGTask; // inherited from NSObject

	expirationHandler: () => void;

	readonly identifier: string;

	setTaskCompletedWithSuccess(success: boolean): void;
}

/**
 * @since 13.0
 */
declare class BGTaskRequest extends NSObject implements NSCopying {

	static alloc(): BGTaskRequest; // inherited from NSObject

	static new(): BGTaskRequest; // inherited from NSObject

	earliestBeginDate: Date;

	readonly identifier: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class BGTaskScheduler extends NSObject {

	static alloc(): BGTaskScheduler; // inherited from NSObject

	static new(): BGTaskScheduler; // inherited from NSObject

	static readonly sharedScheduler: BGTaskScheduler;

	cancelAllTaskRequests(): void;

	cancelTaskRequestWithIdentifier(identifier: string): void;

	getPendingTaskRequestsWithCompletionHandler(completionHandler: (p1: NSArray<BGTaskRequest>) => void): void;

	registerForTaskWithIdentifierUsingQueueLaunchHandler(identifier: string, queue: NSObject & OS_dispatch_queue, launchHandler: (p1: BGTask) => void): boolean;

	submitTaskRequestError(taskRequest: BGTaskRequest): boolean;
}

/**
 * @since 13.0
 */
declare const enum BGTaskSchedulerErrorCode {

	Unavailable = 1,

	TooManyPendingTaskRequests = 2,

	NotPermitted = 3
}

/**
 * @since 13.0
 */
declare var BGTaskSchedulerErrorDomain: string;
