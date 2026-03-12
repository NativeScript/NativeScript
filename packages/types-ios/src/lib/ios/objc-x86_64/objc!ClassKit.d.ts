
/**
 * @since 11.3
 */
declare class CLSActivity extends CLSObject {

	static alloc(): CLSActivity; // inherited from NSObject

	static new(): CLSActivity; // inherited from NSObject

	readonly additionalActivityItems: NSArray<CLSActivityItem>;

	readonly duration: number;

	primaryActivityItem: CLSActivityItem;

	progress: number;

	readonly started: boolean;

	addAdditionalActivityItem(activityItem: CLSActivityItem): void;

	addProgressRangeFromStartToEnd(start: number, end: number): void;

	/**
	 * @since 14.5
	 */
	removeAllActivityItems(): void;

	start(): void;

	stop(): void;
}

/**
 * @since 11.3
 */
declare class CLSActivityItem extends CLSObject {

	static alloc(): CLSActivityItem; // inherited from NSObject

	static new(): CLSActivityItem; // inherited from NSObject

	readonly identifier: string;

	title: string;
}

/**
 * @since 11.3
 */
declare class CLSBinaryItem extends CLSActivityItem {

	static alloc(): CLSBinaryItem; // inherited from NSObject

	static new(): CLSBinaryItem; // inherited from NSObject

	value: boolean;

	readonly valueType: CLSBinaryValueType;

	constructor(o: { identifier: string; title: string; type: CLSBinaryValueType; });

	initWithIdentifierTitleType(identifier: string, title: string, valueType: CLSBinaryValueType): this;
}

/**
 * @since 11.3
 */
declare const enum CLSBinaryValueType {

	TrueFalse = 0,

	PassFail = 1,

	YesNo = 2,

	CorrectIncorrect = 3
}

/**
 * @since 11.3
 */
declare class CLSContext extends CLSObject {

	static alloc(): CLSContext; // inherited from NSObject

	static new(): CLSContext; // inherited from NSObject

	readonly active: boolean;

	/**
	 * @since 14
	 */
	assignable: boolean;

	readonly currentActivity: CLSActivity;

	/**
	 * @since 13.4
	 */
	customTypeName: string;

	displayOrder: number;

	readonly identifier: string;

	/**
	 * @since 13.4
	 */
	readonly identifierPath: NSArray<string>;

	/**
	 * @since 14.5
	 */
	readonly navigationChildContexts: NSArray<CLSContext>;

	readonly parent: CLSContext;

	/**
	 * @since 14
	 */
	readonly progressReportingCapabilities: NSSet<CLSProgressReportingCapability>;

	/**
	 * @since 14
	 */
	suggestedAge: NSRange;

	/**
	 * @since 14
	 */
	suggestedCompletionTime: NSRange;

	/**
	 * @since 13.4
	 */
	summary: string;

	/**
	 * @since 13.4
	 */
	thumbnail: any;

	title: string;

	topic: string;

	readonly type: CLSContextType;

	/**
	 * @since 11.4
	 */
	universalLinkURL: NSURL;

	constructor(o: { type: CLSContextType; identifier: string; title: string; });

	addChildContext(child: CLSContext): void;

	/**
	 * @since 14.5
	 */
	addNavigationChildContext(child: CLSContext): void;

	/**
	 * @since 14
	 */
	addProgressReportingCapabilities(capabilities: NSSet<CLSProgressReportingCapability>): void;

	becomeActive(): void;

	createNewActivity(): CLSActivity;

	descendantMatchingIdentifierPathCompletion(identifierPath: NSArray<string> | string[], completion: (p1: CLSContext, p2: NSError) => void): void;

	initWithTypeIdentifierTitle(type: CLSContextType, identifier: string, title: string): this;

	removeFromParent(): void;

	/**
	 * @since 14.5
	 */
	removeNavigationChildContext(child: CLSContext): void;

	/**
	 * @since 14
	 */
	resetProgressReportingCapabilities(): void;

	resignActive(): void;

	/**
	 * @since 14
	 */
	setType(type: CLSContextType): void;
}

/**
 * @since 12.2
 */
interface CLSContextProvider {

	updateDescendantsOfContextCompletion(context: CLSContext, completion: (p1: NSError) => void): void;
}
declare var CLSContextProvider: {

	prototype: CLSContextProvider;
};

/**
 * @since 11.3
 */
declare var CLSContextTopicArtsAndMusic: string;

/**
 * @since 11.3
 */
declare var CLSContextTopicComputerScienceAndEngineering: string;

/**
 * @since 11.3
 */
declare var CLSContextTopicHealthAndFitness: string;

/**
 * @since 11.3
 */
declare var CLSContextTopicLiteracyAndWriting: string;

/**
 * @since 11.3
 */
declare var CLSContextTopicMath: string;

/**
 * @since 11.3
 */
declare var CLSContextTopicScience: string;

/**
 * @since 11.3
 */
declare var CLSContextTopicSocialScience: string;

/**
 * @since 11.3
 */
declare var CLSContextTopicWorldLanguage: string;

/**
 * @since 11.3
 */
declare const enum CLSContextType {

	None = 0,

	App = 1,

	Chapter = 2,

	Section = 3,

	Level = 4,

	Page = 5,

	Task = 6,

	Challenge = 7,

	Quiz = 8,

	Exercise = 9,

	Lesson = 10,

	Book = 11,

	Game = 12,

	Document = 13,

	Audio = 14,

	Video = 15,

	Course = 16,

	Custom = 17
}

/**
 * @since 11.3
 */
declare class CLSDataStore extends NSObject {

	static alloc(): CLSDataStore; // inherited from NSObject

	static new(): CLSDataStore; // inherited from NSObject

	readonly activeContext: CLSContext;

	delegate: CLSDataStoreDelegate;

	readonly mainAppContext: CLSContext;

	readonly runningActivity: CLSActivity;

	static readonly shared: CLSDataStore;

	/**
	 * @since 12.2
	 */
	completeAllAssignedActivitiesMatching(contextPath: NSArray<string> | string[]): void;

	contextsMatchingIdentifierPathCompletion(identifierPath: NSArray<string> | string[], completion: (p1: NSArray<CLSContext>, p2: NSError) => void): void;

	contextsMatchingPredicateCompletion(predicate: NSPredicate, completion: (p1: NSArray<CLSContext>, p2: NSError) => void): void;

	/**
	 * @since 14.5
	 */
	fetchActivityForURLCompletion(url: NSURL, completion: (p1: CLSActivity, p2: NSError) => void): void;

	removeContext(context: CLSContext): void;

	saveWithCompletion(completion: (p1: NSError) => void): void;
}

/**
 * @since 11.3
 */
interface CLSDataStoreDelegate extends NSObjectProtocol {

	createContextForIdentifierParentContextParentIdentifierPath(identifier: string, parentContext: CLSContext, parentIdentifierPath: NSArray<string> | string[]): CLSContext;
}
declare var CLSDataStoreDelegate: {

	prototype: CLSDataStoreDelegate;
};

/**
 * @since 11.3
 */
declare const enum CLSErrorCode {

	None = 0,

	ClassKitUnavailable = 1,

	InvalidArgument = 2,

	InvalidModification = 3,

	AuthorizationDenied = 4,

	DatabaseInaccessible = 5,

	Limits = 6,

	InvalidCreate = 7,

	InvalidUpdate = 8,

	PartialFailure = 9,

	InvalidAccountCredentials = 10
}

/**
 * @since 11.3
 */
declare var CLSErrorCodeDomain: string;

/**
 * @since 11.3
 */
declare var CLSErrorObjectKey: string;

/**
 * @since 15.0
 */
declare var CLSErrorSuccessfulObjectsKey: string;

/**
 * @since 11.3
 */
declare var CLSErrorUnderlyingErrorsKey: string;

/**
 * @since 11.3
 */
declare class CLSObject extends NSObject implements NSSecureCoding {

	static alloc(): CLSObject; // inherited from NSObject

	static new(): CLSObject; // inherited from NSObject

	readonly dateCreated: Date;

	readonly dateLastModified: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.3
 */
declare var CLSPredicateKeyPathDateCreated: string;

/**
 * @since 11.3
 */
declare var CLSPredicateKeyPathIdentifier: string;

/**
 * @since 11.3
 */
declare var CLSPredicateKeyPathParent: string;

/**
 * @since 11.3
 */
declare var CLSPredicateKeyPathTitle: string;

/**
 * @since 11.3
 */
declare var CLSPredicateKeyPathTopic: string;

/**
 * @since 11.3
 */
declare var CLSPredicateKeyPathUniversalLinkURL: string;

/**
 * @since 14
 */
declare class CLSProgressReportingCapability extends CLSObject {

	static alloc(): CLSProgressReportingCapability; // inherited from NSObject

	static new(): CLSProgressReportingCapability; // inherited from NSObject

	readonly details: string;

	readonly kind: CLSProgressReportingCapabilityKind;

	constructor(o: { kind: CLSProgressReportingCapabilityKind; details: string; });

	initWithKindDetails(kind: CLSProgressReportingCapabilityKind, details: string): this;
}

/**
 * @since 14
 */
declare const enum CLSProgressReportingCapabilityKind {

	Duration = 0,

	Percent = 1,

	Binary = 2,

	Quantity = 3,

	Score = 4
}

/**
 * @since 11.3
 */
declare class CLSQuantityItem extends CLSActivityItem {

	static alloc(): CLSQuantityItem; // inherited from NSObject

	static new(): CLSQuantityItem; // inherited from NSObject

	quantity: number;

	constructor(o: { identifier: string; title: string; });

	initWithIdentifierTitle(identifier: string, title: string): this;
}

/**
 * @since 11.3
 */
declare class CLSScoreItem extends CLSActivityItem {

	static alloc(): CLSScoreItem; // inherited from NSObject

	static new(): CLSScoreItem; // inherited from NSObject

	maxScore: number;

	score: number;

	constructor(o: { identifier: string; title: string; score: number; maxScore: number; });

	initWithIdentifierTitleScoreMaxScore(identifier: string, title: string, score: number, maxScore: number): this;
}
