
/**
 * @since 15.0
 */
declare class OSLogEntry extends NSObject implements NSSecureCoding {

	static alloc(): OSLogEntry; // inherited from NSObject

	static new(): OSLogEntry; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly composedMessage: string;

	/**
	 * @since 15.0
	 */
	readonly date: Date;

	/**
	 * @since 15.0
	 */
	readonly storeCategory: OSLogEntryStoreCategory;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
declare class OSLogEntryActivity extends OSLogEntry implements OSLogEntryFromProcess {

	static alloc(): OSLogEntryActivity; // inherited from NSObject

	static new(): OSLogEntryActivity; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly parentActivityIdentifier: number;

	/**
	 * @since 15.0
	 */
	readonly activityIdentifier: number; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly process: string; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly processIdentifier: number; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly sender: string; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly threadIdentifier: number; // inherited from OSLogEntryFromProcess
}

/**
 * @since 15.0
 */
declare class OSLogEntryBoundary extends OSLogEntry {

	static alloc(): OSLogEntryBoundary; // inherited from NSObject

	static new(): OSLogEntryBoundary; // inherited from NSObject
}

/**
 * @since 15.0
 */
interface OSLogEntryFromProcess {

	/**
	 * @since 15.0
	 */
	activityIdentifier: number;

	/**
	 * @since 15.0
	 */
	process: string;

	/**
	 * @since 15.0
	 */
	processIdentifier: number;

	/**
	 * @since 15.0
	 */
	sender: string;

	/**
	 * @since 15.0
	 */
	threadIdentifier: number;
}
declare var OSLogEntryFromProcess: {

	prototype: OSLogEntryFromProcess;
};

/**
 * @since 15.0
 */
declare class OSLogEntryLog extends OSLogEntry implements OSLogEntryFromProcess, OSLogEntryWithPayload {

	static alloc(): OSLogEntryLog; // inherited from NSObject

	static new(): OSLogEntryLog; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly level: OSLogEntryLogLevel;

	/**
	 * @since 15.0
	 */
	readonly activityIdentifier: number; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly category: string; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly components: NSArray<OSLogMessageComponent>; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly formatString: string; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly process: string; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly processIdentifier: number; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly sender: string; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly subsystem: string; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly threadIdentifier: number; // inherited from OSLogEntryFromProcess
}

/**
 * @since 15.0
 */
declare const enum OSLogEntryLogLevel {

	Undefined = 0,

	Debug = 1,

	Info = 2,

	Notice = 3,

	Error = 4,

	Fault = 5
}

/**
 * @since 15.0
 */
declare class OSLogEntrySignpost extends OSLogEntry implements OSLogEntryFromProcess, OSLogEntryWithPayload {

	static alloc(): OSLogEntrySignpost; // inherited from NSObject

	static new(): OSLogEntrySignpost; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly signpostIdentifier: number;

	/**
	 * @since 15.0
	 */
	readonly signpostName: string;

	/**
	 * @since 15.0
	 */
	readonly signpostType: OSLogEntrySignpostType;

	/**
	 * @since 15.0
	 */
	readonly activityIdentifier: number; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly category: string; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly components: NSArray<OSLogMessageComponent>; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly formatString: string; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly process: string; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly processIdentifier: number; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly sender: string; // inherited from OSLogEntryFromProcess

	/**
	 * @since 15.0
	 */
	readonly subsystem: string; // inherited from OSLogEntryWithPayload

	/**
	 * @since 15.0
	 */
	readonly threadIdentifier: number; // inherited from OSLogEntryFromProcess
}

/**
 * @since 15.0
 */
declare const enum OSLogEntrySignpostType {

	Undefined = 0,

	IntervalBegin = 1,

	IntervalEnd = 2,

	Event = 3
}

/**
 * @since 15.0
 */
declare const enum OSLogEntryStoreCategory {

	Undefined = 0,

	Metadata = 1,

	ShortTerm = 2,

	LongTermAuto = 3,

	LongTerm1 = 4,

	LongTerm3 = 5,

	LongTerm7 = 6,

	LongTerm14 = 7,

	LongTerm30 = 8
}

/**
 * @since 15.0
 */
interface OSLogEntryWithPayload {

	/**
	 * @since 15.0
	 */
	category: string;

	/**
	 * @since 15.0
	 */
	components: NSArray<OSLogMessageComponent>;

	/**
	 * @since 15.0
	 */
	formatString: string;

	/**
	 * @since 15.0
	 */
	subsystem: string;
}
declare var OSLogEntryWithPayload: {

	prototype: OSLogEntryWithPayload;
};

/**
 * @since 15.0
 */
declare class OSLogEnumerator extends NSEnumerator<NSObject> {

	static alloc(): OSLogEnumerator; // inherited from NSObject

	static new(): OSLogEnumerator; // inherited from NSObject
}

/**
 * @since 15.0
 */
declare const enum OSLogEnumeratorOptions {

	Reverse = 1
}

/**
 * @since 15.0
 */
declare class OSLogMessageComponent extends NSObject implements NSSecureCoding {

	static alloc(): OSLogMessageComponent; // inherited from NSObject

	static new(): OSLogMessageComponent; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly argumentCategory: OSLogMessageComponentArgumentCategory;

	/**
	 * @since 15.0
	 */
	readonly argumentDataValue: NSData;

	/**
	 * @since 15.0
	 */
	readonly argumentDoubleValue: number;

	/**
	 * @since 15.0
	 */
	readonly argumentInt64Value: number;

	/**
	 * @since 15.0
	 */
	readonly argumentNumberValue: number;

	/**
	 * @since 15.0
	 */
	readonly argumentStringValue: string;

	/**
	 * @since 15.0
	 */
	readonly argumentUInt64Value: number;

	/**
	 * @since 15.0
	 */
	readonly formatSubstring: string;

	/**
	 * @since 15.0
	 */
	readonly placeholder: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
declare const enum OSLogMessageComponentArgumentCategory {

	Undefined = 0,

	Data = 1,

	Double = 2,

	Int64 = 3,

	String = 4,

	UInt64 = 5
}

/**
 * @since 15.0
 */
declare class OSLogPosition extends NSObject {

	static alloc(): OSLogPosition; // inherited from NSObject

	static new(): OSLogPosition; // inherited from NSObject
}

/**
 * @since 15.0
 */
declare class OSLogStore extends NSObject {

	static alloc(): OSLogStore; // inherited from NSObject

	static new(): OSLogStore; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	static storeWithScopeError(scope: OSLogStoreScope): OSLogStore;

	/**
	 * @since 15.0
	 */
	static storeWithURLError(url: NSURL): OSLogStore;

	/**
	 * @since 15.0
	 */
	entriesEnumeratorAndReturnError(): OSLogEnumerator;

	/**
	 * @since 15.0
	 */
	entriesEnumeratorWithOptionsPositionPredicateError(options: OSLogEnumeratorOptions, position: OSLogPosition, predicate: NSPredicate): OSLogEnumerator;

	/**
	 * @since 15.0
	 */
	positionWithDate(date: Date): OSLogPosition;

	/**
	 * @since 15.0
	 */
	positionWithTimeIntervalSinceEnd(seconds: number): OSLogPosition;

	/**
	 * @since 15.0
	 */
	positionWithTimeIntervalSinceLatestBoot(seconds: number): OSLogPosition;
}

/**
 * @since 15.0
 */
declare const enum OSLogStoreScope {

	System = 0,

	CurrentProcessIdentifier = 1
}
