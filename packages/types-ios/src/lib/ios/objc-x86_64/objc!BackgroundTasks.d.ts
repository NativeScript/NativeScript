
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
 * @since 26.0
 */
declare class BGContinuedProcessingTask extends BGTask implements NSProgressReporting {

	static alloc(): BGContinuedProcessingTask; // inherited from NSObject

	static new(): BGContinuedProcessingTask; // inherited from NSObject

	readonly subtitle: string;

	readonly title: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly progress: NSProgress; // inherited from NSProgressReporting

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updateTitleSubtitle(title: string, subtitle: string): void;
}

/**
 * @since 26.0
 */
declare class BGContinuedProcessingTaskRequest extends BGTaskRequest {

	static alloc(): BGContinuedProcessingTaskRequest; // inherited from NSObject

	static new(): BGContinuedProcessingTaskRequest; // inherited from NSObject

	requiredResources: BGContinuedProcessingTaskRequestResources;

	strategy: BGContinuedProcessingTaskRequestSubmissionStrategy;

	subtitle: string;

	title: string;

	constructor(o: { identifier: string; title: string; subtitle: string; });

	initWithIdentifierTitleSubtitle(identifier: string, title: string, subtitle: string): this;
}

/**
 * @since 26.0
 */
declare const enum BGContinuedProcessingTaskRequestResources {

	Default = 0,

	GPU = 1
}

/**
 * @since 26.0
 */
declare const enum BGContinuedProcessingTaskRequestSubmissionStrategy {

	Fail = 0,

	Queue = 1
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

	/**
	 * @since 26.0
	 */
	static readonly supportedResources: BGContinuedProcessingTaskRequestResources;

	cancelAllTaskRequests(): void;

	cancelTaskRequestWithIdentifier(identifier: string): void;

	getPendingTaskRequestsWithCompletionHandler(completionHandler: (p1: NSArray<BGTaskRequest>) => void): void;

	registerForTaskWithIdentifierUsingQueueLaunchHandler(identifier: string, queue: NSObject & OS_dispatch_queue, launchHandler: (p1: BGTask) => void): boolean;

	submitTaskRequestError(taskRequest: BGTaskRequest, error?: interop.Reference<NSError>): boolean;
}

/**
 * @since 13.0
 */
declare const enum BGTaskSchedulerErrorCode {

	Unavailable = 1,

	TooManyPendingTaskRequests = 2,

	NotPermitted = 3,

	ImmediateRunIneligible = 4
}

/**
 * @since 13.0
 */
declare var BGTaskSchedulerErrorDomain: string;
