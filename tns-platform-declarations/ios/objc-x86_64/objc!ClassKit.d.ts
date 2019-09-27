
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

	start(): void;

	stop(): void;
}

declare class CLSActivityItem extends CLSObject {

	static alloc(): CLSActivityItem; // inherited from NSObject

	static new(): CLSActivityItem; // inherited from NSObject

	readonly identifier: string;

	title: string;
}

declare class CLSBinaryItem extends CLSActivityItem {

	static alloc(): CLSBinaryItem; // inherited from NSObject

	static new(): CLSBinaryItem; // inherited from NSObject

	value: boolean;

	readonly valueType: CLSBinaryValueType;

	constructor(o: { identifier: string; title: string; type: CLSBinaryValueType; });

	initWithIdentifierTitleType(identifier: string, title: string, valueType: CLSBinaryValueType): this;
}

declare const enum CLSBinaryValueType {

	TrueFalse = 0,

	PassFail = 1,

	YesNo = 2,

	CorrectIncorrect = 3
}

declare class CLSContext extends CLSObject {

	static alloc(): CLSContext; // inherited from NSObject

	static new(): CLSContext; // inherited from NSObject

	readonly active: boolean;

	readonly currentActivity: CLSActivity;

	displayOrder: number;

	readonly identifier: string;

	readonly parent: CLSContext;

	title: string;

	topic: string;

	readonly type: CLSContextType;

	universalLinkURL: NSURL;

	constructor(o: { type: CLSContextType; identifier: string; title: string; });

	addChildContext(child: CLSContext): void;

	becomeActive(): void;

	createNewActivity(): CLSActivity;

	descendantMatchingIdentifierPathCompletion(identifierPath: NSArray<string> | string[], completion: (p1: CLSContext, p2: NSError) => void): void;

	initWithTypeIdentifierTitle(type: CLSContextType, identifier: string, title: string): this;

	removeFromParent(): void;

	resignActive(): void;
}

interface CLSContextProvider {

	updateDescendantsOfContextCompletion(context: CLSContext, completion: (p1: NSError) => void): void;
}
declare var CLSContextProvider: {

	prototype: CLSContextProvider;
};

declare var CLSContextTopicArtsAndMusic: string;

declare var CLSContextTopicComputerScienceAndEngineering: string;

declare var CLSContextTopicHealthAndFitness: string;

declare var CLSContextTopicLiteracyAndWriting: string;

declare var CLSContextTopicMath: string;

declare var CLSContextTopicScience: string;

declare var CLSContextTopicSocialScience: string;

declare var CLSContextTopicWorldLanguage: string;

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

	Video = 15
}

declare class CLSDataStore extends NSObject {

	static alloc(): CLSDataStore; // inherited from NSObject

	static new(): CLSDataStore; // inherited from NSObject

	readonly activeContext: CLSContext;

	delegate: CLSDataStoreDelegate;

	readonly mainAppContext: CLSContext;

	readonly runningActivity: CLSActivity;

	static readonly shared: CLSDataStore;

	completeAllAssignedActivitiesMatching(contextPath: NSArray<string> | string[]): void;

	contextsMatchingIdentifierPathCompletion(identifierPath: NSArray<string> | string[], completion: (p1: NSArray<CLSContext>, p2: NSError) => void): void;

	contextsMatchingPredicateCompletion(predicate: NSPredicate, completion: (p1: NSArray<CLSContext>, p2: NSError) => void): void;

	removeContext(context: CLSContext): void;

	saveWithCompletion(completion: (p1: NSError) => void): void;
}

interface CLSDataStoreDelegate extends NSObjectProtocol {

	createContextForIdentifierParentContextParentIdentifierPath(identifier: string, parentContext: CLSContext, parentIdentifierPath: NSArray<string> | string[]): CLSContext;
}
declare var CLSDataStoreDelegate: {

	prototype: CLSDataStoreDelegate;
};

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

	PartialFailure = 9
}

declare var CLSErrorCodeDomain: string;

declare var CLSErrorObjectKey: string;

declare var CLSErrorUnderlyingErrorsKey: string;

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

declare var CLSPredicateKeyPathDateCreated: string;

declare var CLSPredicateKeyPathIdentifier: string;

declare var CLSPredicateKeyPathParent: string;

declare var CLSPredicateKeyPathTitle: string;

declare var CLSPredicateKeyPathTopic: string;

declare var CLSPredicateKeyPathUniversalLinkURL: string;

declare class CLSQuantityItem extends CLSActivityItem {

	static alloc(): CLSQuantityItem; // inherited from NSObject

	static new(): CLSQuantityItem; // inherited from NSObject

	quantity: number;

	constructor(o: { identifier: string; title: string; });

	initWithIdentifierTitle(identifier: string, title: string): this;
}

declare class CLSScoreItem extends CLSActivityItem {

	static alloc(): CLSScoreItem; // inherited from NSObject

	static new(): CLSScoreItem; // inherited from NSObject

	maxScore: number;

	score: number;

	constructor(o: { identifier: string; title: string; score: number; maxScore: number; });

	initWithIdentifierTitleScoreMaxScore(identifier: string, title: string, score: number, maxScore: number): this;
}
