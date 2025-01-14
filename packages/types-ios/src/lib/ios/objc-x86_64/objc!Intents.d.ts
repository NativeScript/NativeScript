
/**
 * @since 10.3
 */
declare const enum INAccountType {

	Unknown = 0,

	Checking = 1,

	Credit = 2,

	Debit = 3,

	Investment = 4,

	Mortgage = 5,

	Prepaid = 6,

	Saving = 7
}

/**
 * @since 11.0
 */
declare class INAccountTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INAccountTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithAccountTypeToConfirm(accountTypeToConfirm: INAccountType): INAccountTypeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 11.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INAccountType): INAccountTypeResolutionResult;

	static needsValue(): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INAccountTypeResolutionResult; // inherited from NSObject

	static notRequired(): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedAccountType(resolvedAccountType: INAccountType): INAccountTypeResolutionResult;

	/**
	 * @since 11.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INAccountType): INAccountTypeResolutionResult;

	static unsupported(): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.3
 */
declare class INActivateCarSignalIntent extends INIntent {

	static alloc(): INActivateCarSignalIntent; // inherited from NSObject

	static new(): INActivateCarSignalIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	readonly signals: INCarSignalOptions;

	constructor(o: { carName: INSpeakableString; signals: INCarSignalOptions; });

	initWithCarNameSignals(carName: INSpeakableString, signals: INCarSignalOptions): this;
}

/**
 * @since 10.3
 */
interface INActivateCarSignalIntentHandling extends NSObjectProtocol {

	confirmActivateCarSignalCompletion?(intent: INActivateCarSignalIntent, completion: (p1: INActivateCarSignalIntentResponse) => void): void;

	handleActivateCarSignalCompletion(intent: INActivateCarSignalIntent, completion: (p1: INActivateCarSignalIntentResponse) => void): void;

	resolveCarNameForActivateCarSignalWithCompletion?(intent: INActivateCarSignalIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveSignalsForActivateCarSignalWithCompletion?(intent: INActivateCarSignalIntent, completion: (p1: INCarSignalOptionsResolutionResult) => void): void;
}
declare var INActivateCarSignalIntentHandling: {

	prototype: INActivateCarSignalIntentHandling;
};

/**
 * @since 10.3
 */
declare class INActivateCarSignalIntentResponse extends INIntentResponse {

	static alloc(): INActivateCarSignalIntentResponse; // inherited from NSObject

	static new(): INActivateCarSignalIntentResponse; // inherited from NSObject

	readonly code: INActivateCarSignalIntentResponseCode;

	signals: INCarSignalOptions;

	constructor(o: { code: INActivateCarSignalIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INActivateCarSignalIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.3
 */
declare const enum INActivateCarSignalIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 13.0
 */
declare class INAddMediaIntent extends INIntent {

	static alloc(): INAddMediaIntent; // inherited from NSObject

	static new(): INAddMediaIntent; // inherited from NSObject

	readonly mediaDestination: INMediaDestination;

	readonly mediaItems: NSArray<INMediaItem>;

	readonly mediaSearch: INMediaSearch;

	constructor(o: { mediaItems: NSArray<INMediaItem> | INMediaItem[]; mediaSearch: INMediaSearch; mediaDestination: INMediaDestination; });

	initWithMediaItemsMediaSearchMediaDestination(mediaItems: NSArray<INMediaItem> | INMediaItem[], mediaSearch: INMediaSearch, mediaDestination: INMediaDestination): this;
}

/**
 * @since 13.0
 */
interface INAddMediaIntentHandling extends NSObjectProtocol {

	confirmAddMediaCompletion?(intent: INAddMediaIntent, completion: (p1: INAddMediaIntentResponse) => void): void;

	handleAddMediaCompletion(intent: INAddMediaIntent, completion: (p1: INAddMediaIntentResponse) => void): void;

	resolveMediaDestinationForAddMediaWithCompletion?(intent: INAddMediaIntent, completion: (p1: INAddMediaMediaDestinationResolutionResult) => void): void;

	resolveMediaItemsForAddMediaWithCompletion?(intent: INAddMediaIntent, completion: (p1: NSArray<INAddMediaMediaItemResolutionResult>) => void): void;
}
declare var INAddMediaIntentHandling: {

	prototype: INAddMediaIntentHandling;
};

/**
 * @since 13.0
 */
declare class INAddMediaIntentResponse extends INIntentResponse {

	static alloc(): INAddMediaIntentResponse; // inherited from NSObject

	static new(): INAddMediaIntentResponse; // inherited from NSObject

	readonly code: INAddMediaIntentResponseCode;

	constructor(o: { code: INAddMediaIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INAddMediaIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 */
declare const enum INAddMediaIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	HandleInApp = 4,

	Failure = 5,

	FailureRequiringAppLaunch = 6
}

/**
 * @since 13.0
 */
declare class INAddMediaMediaDestinationResolutionResult extends INMediaDestinationResolutionResult {

	static alloc(): INAddMediaMediaDestinationResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INAddMediaMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaDestinationToConfirm(mediaDestinationToConfirm: INMediaDestination): INAddMediaMediaDestinationResolutionResult; // inherited from INMediaDestinationResolutionResult

	static disambiguationWithMediaDestinationsToDisambiguate(mediaDestinationsToDisambiguate: NSArray<INMediaDestination> | INMediaDestination[]): INAddMediaMediaDestinationResolutionResult; // inherited from INMediaDestinationResolutionResult

	static needsValue(): INAddMediaMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	static new(): INAddMediaMediaDestinationResolutionResult; // inherited from NSObject

	static notRequired(): INAddMediaMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaDestination(resolvedMediaDestination: INMediaDestination): INAddMediaMediaDestinationResolutionResult; // inherited from INMediaDestinationResolutionResult

	static unsupported(): INAddMediaMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INAddMediaMediaDestinationUnsupportedReason): INAddMediaMediaDestinationResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INAddMediaMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { mediaDestinationResolutionResult: INMediaDestinationResolutionResult; });

	initWithMediaDestinationResolutionResult(mediaDestinationResolutionResult: INMediaDestinationResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INAddMediaMediaDestinationUnsupportedReason {

	PlaylistNameNotFound = 1,

	PlaylistNotEditable = 2
}

/**
 * @since 13.0
 */
declare class INAddMediaMediaItemResolutionResult extends INMediaItemResolutionResult {

	static alloc(): INAddMediaMediaItemResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INAddMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaItemToConfirm(mediaItemToConfirm: INMediaItem): INAddMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static disambiguationWithMediaItemsToDisambiguate(mediaItemsToDisambiguate: NSArray<INMediaItem> | INMediaItem[]): INAddMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static needsValue(): INAddMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static new(): INAddMediaMediaItemResolutionResult; // inherited from NSObject

	static notRequired(): INAddMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaItem(resolvedMediaItem: INMediaItem): INAddMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static unsupported(): INAddMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INAddMediaMediaItemUnsupportedReason): INAddMediaMediaItemResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INAddMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { mediaItemResolutionResult: INMediaItemResolutionResult; });

	initWithMediaItemResolutionResult(mediaItemResolutionResult: INMediaItemResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INAddMediaMediaItemUnsupportedReason {

	LoginRequired = 1,

	SubscriptionRequired = 2,

	UnsupportedMediaType = 3,

	ExplicitContentSettings = 4,

	CellularDataSettings = 5,

	RestrictedContent = 6,

	ServiceUnavailable = 7,

	RegionRestriction = 8
}

/**
 * @since 11.0
 */
declare class INAddTasksIntent extends INIntent {

	static alloc(): INAddTasksIntent; // inherited from NSObject

	static new(): INAddTasksIntent; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly priority: INTaskPriority;

	readonly spatialEventTrigger: INSpatialEventTrigger;

	readonly targetTaskList: INTaskList;

	readonly taskTitles: NSArray<INSpeakableString>;

	readonly temporalEventTrigger: INTemporalEventTrigger;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	constructor(o: { targetTaskList: INTaskList; taskTitles: NSArray<INSpeakableString> | INSpeakableString[]; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; });

	/**
	 * @since 13.0
	 */
	constructor(o: { targetTaskList: INTaskList; taskTitles: NSArray<INSpeakableString> | INSpeakableString[]; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; priority: INTaskPriority; });

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	initWithTargetTaskListTaskTitlesSpatialEventTriggerTemporalEventTrigger(targetTaskList: INTaskList, taskTitles: NSArray<INSpeakableString> | INSpeakableString[], spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger): this;

	/**
	 * @since 13.0
	 */
	initWithTargetTaskListTaskTitlesSpatialEventTriggerTemporalEventTriggerPriority(targetTaskList: INTaskList, taskTitles: NSArray<INSpeakableString> | INSpeakableString[], spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger, priority: INTaskPriority): this;
}

/**
 * @since 11.0
 */
interface INAddTasksIntentHandling extends NSObjectProtocol {

	confirmAddTasksCompletion?(intent: INAddTasksIntent, completion: (p1: INAddTasksIntentResponse) => void): void;

	handleAddTasksCompletion(intent: INAddTasksIntent, completion: (p1: INAddTasksIntentResponse) => void): void;

	/**
	 * @since 13.0
	 */
	resolvePriorityForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: INTaskPriorityResolutionResult) => void): void;

	resolveSpatialEventTriggerForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: INSpatialEventTriggerResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolveTargetTaskListForAddTasksCompletion?(intent: INAddTasksIntent, completion: (p1: INAddTasksTargetTaskListResolutionResult) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	resolveTargetTaskListForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: INTaskListResolutionResult) => void): void;

	resolveTaskTitlesForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: NSArray<INSpeakableStringResolutionResult>) => void): void;

	/**
	 * @since 13.0
	 */
	resolveTemporalEventTriggerForAddTasksCompletion?(intent: INAddTasksIntent, completion: (p1: INAddTasksTemporalEventTriggerResolutionResult) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	resolveTemporalEventTriggerForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: INTemporalEventTriggerResolutionResult) => void): void;
}
declare var INAddTasksIntentHandling: {

	prototype: INAddTasksIntentHandling;
};

/**
 * @since 11.0
 */
declare class INAddTasksIntentResponse extends INIntentResponse {

	static alloc(): INAddTasksIntentResponse; // inherited from NSObject

	static new(): INAddTasksIntentResponse; // inherited from NSObject

	addedTasks: NSArray<INTask>;

	readonly code: INAddTasksIntentResponseCode;

	modifiedTaskList: INTaskList;

	constructor(o: { code: INAddTasksIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INAddTasksIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 */
declare const enum INAddTasksIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 13.0
 */
declare const enum INAddTasksTargetTaskListConfirmationReason {

	ListShouldBeCreated = 1
}

/**
 * @since 13.0
 */
declare class INAddTasksTargetTaskListResolutionResult extends INTaskListResolutionResult {

	static alloc(): INAddTasksTargetTaskListResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INAddTasksTargetTaskListResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskListToConfirm(taskListToConfirm: INTaskList): INAddTasksTargetTaskListResolutionResult; // inherited from INTaskListResolutionResult

	static confirmationRequiredWithTaskListToConfirmForReason(taskListToConfirm: INTaskList, reason: INAddTasksTargetTaskListConfirmationReason): INAddTasksTargetTaskListResolutionResult;

	static disambiguationWithTaskListsToDisambiguate(taskListsToDisambiguate: NSArray<INTaskList> | INTaskList[]): INAddTasksTargetTaskListResolutionResult; // inherited from INTaskListResolutionResult

	static needsValue(): INAddTasksTargetTaskListResolutionResult; // inherited from INIntentResolutionResult

	static new(): INAddTasksTargetTaskListResolutionResult; // inherited from NSObject

	static notRequired(): INAddTasksTargetTaskListResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTaskList(resolvedTaskList: INTaskList): INAddTasksTargetTaskListResolutionResult; // inherited from INTaskListResolutionResult

	static unsupported(): INAddTasksTargetTaskListResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INAddTasksTargetTaskListResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { taskListResolutionResult: INTaskListResolutionResult; });

	initWithTaskListResolutionResult(taskListResolutionResult: INTaskListResolutionResult): this;
}

/**
 * @since 13.0
 */
declare class INAddTasksTemporalEventTriggerResolutionResult extends INTemporalEventTriggerResolutionResult {

	static alloc(): INAddTasksTemporalEventTriggerResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTemporalEventTriggerToConfirm(temporalEventTriggerToConfirm: INTemporalEventTrigger): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INTemporalEventTriggerResolutionResult

	static disambiguationWithTemporalEventTriggersToDisambiguate(temporalEventTriggersToDisambiguate: NSArray<INTemporalEventTrigger> | INTemporalEventTrigger[]): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INTemporalEventTriggerResolutionResult

	static needsValue(): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INAddTasksTemporalEventTriggerResolutionResult; // inherited from NSObject

	static notRequired(): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTemporalEventTrigger(resolvedTemporalEventTrigger: INTemporalEventTrigger): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INTemporalEventTriggerResolutionResult

	static unsupported(): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INAddTasksTemporalEventTriggerUnsupportedReason): INAddTasksTemporalEventTriggerResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INAddTasksTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { temporalEventTriggerResolutionResult: INTemporalEventTriggerResolutionResult; });

	initWithTemporalEventTriggerResolutionResult(temporalEventTriggerResolutionResult: INTemporalEventTriggerResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INAddTasksTemporalEventTriggerUnsupportedReason {

	TimeInPast = 1,

	InvalidRecurrence = 2
}

/**
 * @since 13.0
 */
declare class INAirline extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INAirline; // inherited from NSObject

	static new(): INAirline; // inherited from NSObject

	readonly iataCode: string;

	readonly icaoCode: string;

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; iataCode: string; icaoCode: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameIataCodeIcaoCode(name: string, iataCode: string, icaoCode: string): this;
}

/**
 * @since 13.0
 */
declare class INAirport extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INAirport; // inherited from NSObject

	static new(): INAirport; // inherited from NSObject

	readonly iataCode: string;

	readonly icaoCode: string;

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; iataCode: string; icaoCode: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameIataCodeIcaoCode(name: string, iataCode: string, icaoCode: string): this;
}

/**
 * @since 13.0
 */
declare class INAirportGate extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INAirportGate; // inherited from NSObject

	static new(): INAirportGate; // inherited from NSObject

	readonly airport: INAirport;

	readonly gate: string;

	readonly terminal: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { airport: INAirport; terminal: string; gate: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAirportTerminalGate(airport: INAirport, terminal: string, gate: string): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.3
 */
declare const enum INAmountType {

	Unknown = 0,

	MinimumDue = 1,

	AmountDue = 2,

	CurrentBalance = 3,

	MaximumTransferAmount = 4,

	MinimumTransferAmount = 5,

	StatementBalance = 6
}

/**
 * @since 16.2
 */
declare class INAnswerCallIntent extends INIntent {

	static alloc(): INAnswerCallIntent; // inherited from NSObject

	static new(): INAnswerCallIntent; // inherited from NSObject

	readonly audioRoute: INCallAudioRoute;

	readonly callIdentifier: string;

	/**
	 * @since 16.2
	 */
	constructor(o: { audioRoute: INCallAudioRoute; callIdentifier: string; });

	/**
	 * @since 16.2
	 */
	initWithAudioRouteCallIdentifier(audioRoute: INCallAudioRoute, callIdentifier: string): this;
}

/**
 * @since 16.2
 */
interface INAnswerCallIntentHandling extends NSObjectProtocol {

	confirmAnswerCallCompletion?(intent: INAnswerCallIntent, completion: (p1: INAnswerCallIntentResponse) => void): void;

	handleAnswerCallCompletion(intent: INAnswerCallIntent, completion: (p1: INAnswerCallIntentResponse) => void): void;
}
declare var INAnswerCallIntentHandling: {

	prototype: INAnswerCallIntentHandling;
};

/**
 * @since 16.2
 */
declare var INAnswerCallIntentIdentifier: string;

/**
 * @since 16.2
 */
declare class INAnswerCallIntentResponse extends INIntentResponse {

	static alloc(): INAnswerCallIntentResponse; // inherited from NSObject

	static new(): INAnswerCallIntentResponse; // inherited from NSObject

	callRecords: NSArray<INCallRecord>;

	readonly code: INAnswerCallIntentResponseCode;

	constructor(o: { code: INAnswerCallIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INAnswerCallIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 16.2
 */
declare const enum INAnswerCallIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	InProgress = 3,

	Success = 4,

	Failure = 5,

	FailureRequiringAppLaunch = 6
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INAppendToNoteIntent extends INIntent {

	static alloc(): INAppendToNoteIntent; // inherited from NSObject

	static new(): INAppendToNoteIntent; // inherited from NSObject

	readonly content: INNoteContent;

	readonly targetNote: INNote;

	constructor(o: { targetNote: INNote; content: INNoteContent; });

	initWithTargetNoteContent(targetNote: INNote, content: INNoteContent): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
interface INAppendToNoteIntentHandling extends NSObjectProtocol {

	confirmAppendToNoteCompletion?(intent: INAppendToNoteIntent, completion: (p1: INAppendToNoteIntentResponse) => void): void;

	handleAppendToNoteCompletion(intent: INAppendToNoteIntent, completion: (p1: INAppendToNoteIntentResponse) => void): void;

	resolveContentForAppendToNoteWithCompletion?(intent: INAppendToNoteIntent, completion: (p1: INNoteContentResolutionResult) => void): void;

	resolveTargetNoteForAppendToNoteWithCompletion?(intent: INAppendToNoteIntent, completion: (p1: INNoteResolutionResult) => void): void;
}
declare var INAppendToNoteIntentHandling: {

	prototype: INAppendToNoteIntentHandling;
};

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INAppendToNoteIntentResponse extends INIntentResponse {

	static alloc(): INAppendToNoteIntentResponse; // inherited from NSObject

	static new(): INAppendToNoteIntentResponse; // inherited from NSObject

	readonly code: INAppendToNoteIntentResponseCode;

	note: INNote;

	constructor(o: { code: INAppendToNoteIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INAppendToNoteIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare const enum INAppendToNoteIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCannotUpdatePasswordProtectedNote = 6
}

/**
 * @since 11.0
 */
declare class INBalanceAmount extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INBalanceAmount; // inherited from NSObject

	static new(): INBalanceAmount; // inherited from NSObject

	readonly amount: NSDecimalNumber;

	readonly balanceType: INBalanceType;

	readonly currencyCode: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { amount: NSDecimalNumber; balanceType: INBalanceType; });

	constructor(o: { amount: NSDecimalNumber; currencyCode: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAmountBalanceType(amount: NSDecimalNumber, balanceType: INBalanceType): this;

	initWithAmountCurrencyCode(amount: NSDecimalNumber, currencyCode: string): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare const enum INBalanceType {

	Unknown = 0,

	Money = 1,

	Points = 2,

	Miles = 3
}

/**
 * @since 11.0
 */
declare class INBalanceTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INBalanceTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithBalanceTypeToConfirm(balanceTypeToConfirm: INBalanceType): INBalanceTypeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult

	static needsValue(): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBalanceTypeResolutionResult; // inherited from NSObject

	static notRequired(): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedBalanceType(resolvedBalanceType: INBalanceType): INBalanceTypeResolutionResult;

	static unsupported(): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INBillDetails extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INBillDetails; // inherited from NSObject

	static new(): INBillDetails; // inherited from NSObject

	amountDue: INCurrencyAmount;

	billPayee: INBillPayee;

	billType: INBillType;

	dueDate: NSDateComponents;

	lateFee: INCurrencyAmount;

	minimumDue: INCurrencyAmount;

	paymentDate: NSDateComponents;

	paymentStatus: INPaymentStatus;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { billType: INBillType; paymentStatus: INPaymentStatus; billPayee: INBillPayee; amountDue: INCurrencyAmount; minimumDue: INCurrencyAmount; lateFee: INCurrencyAmount; dueDate: NSDateComponents; paymentDate: NSDateComponents; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithBillTypePaymentStatusBillPayeeAmountDueMinimumDueLateFeeDueDatePaymentDate(billType: INBillType, paymentStatus: INPaymentStatus, billPayee: INBillPayee, amountDue: INCurrencyAmount, minimumDue: INCurrencyAmount, lateFee: INCurrencyAmount, dueDate: NSDateComponents, paymentDate: NSDateComponents): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INBillPayee extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INBillPayee; // inherited from NSObject

	static new(): INBillPayee; // inherited from NSObject

	readonly accountNumber: string;

	readonly nickname: INSpeakableString;

	readonly organizationName: INSpeakableString;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nickname: INSpeakableString; number: string; organizationName: INSpeakableString; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNicknameNumberOrganizationName(nickname: INSpeakableString, number: string, organizationName: INSpeakableString): this;
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INBillPayeeResolutionResult extends INIntentResolutionResult {

	static alloc(): INBillPayeeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithBillPayeeToConfirm(billPayeeToConfirm: INBillPayee): INBillPayeeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithBillPayeesToDisambiguate(billPayeesToDisambiguate: NSArray<INBillPayee> | INBillPayee[]): INBillPayeeResolutionResult;

	static needsValue(): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBillPayeeResolutionResult; // inherited from NSObject

	static notRequired(): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedBillPayee(resolvedBillPayee: INBillPayee): INBillPayeeResolutionResult;

	static unsupported(): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare const enum INBillType {

	Unknown = 0,

	AutoInsurance = 1,

	Cable = 2,

	CarLease = 3,

	CarLoan = 4,

	CreditCard = 5,

	Electricity = 6,

	Gas = 7,

	GarbageAndRecycling = 8,

	HealthInsurance = 9,

	HomeInsurance = 10,

	Internet = 11,

	LifeInsurance = 12,

	Mortgage = 13,

	MusicStreaming = 14,

	Phone = 15,

	Rent = 16,

	Sewer = 17,

	StudentLoan = 18,

	TrafficTicket = 19,

	Tuition = 20,

	Utilities = 21,

	Water = 22
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INBillTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INBillTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithBillTypeToConfirm(billTypeToConfirm: INBillType): INBillTypeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INBillTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.3
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INBillType): INBillTypeResolutionResult;

	static needsValue(): INBillTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBillTypeResolutionResult; // inherited from NSObject

	static notRequired(): INBillTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedBillType(resolvedBillType: INBillType): INBillTypeResolutionResult;

	/**
	 * @since 10.3
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INBillType): INBillTypeResolutionResult;

	static unsupported(): INBillTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INBillTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.0
 */
declare class INBoatReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INBoatReservation; // inherited from NSObject

	static new(): INBoatReservation; // inherited from NSObject

	readonly boatTrip: INBoatTrip;

	readonly reservedSeat: INSeat;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; reservedSeat: INSeat; boatTrip: INBoatTrip; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLReservedSeatBoatTrip(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, reservedSeat: INSeat, boatTrip: INBoatTrip): this;
}

/**
 * @since 14.0
 */
declare class INBoatTrip extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INBoatTrip; // inherited from NSObject

	static new(): INBoatTrip; // inherited from NSObject

	readonly arrivalBoatTerminalLocation: CLPlacemark;

	readonly boatName: string;

	readonly boatNumber: string;

	readonly departureBoatTerminalLocation: CLPlacemark;

	readonly provider: string;

	readonly tripDuration: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { provider: string; boatName: string; boatNumber: string; tripDuration: INDateComponentsRange; departureBoatTerminalLocation: CLPlacemark; arrivalBoatTerminalLocation: CLPlacemark; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithProviderBoatNameBoatNumberTripDurationDepartureBoatTerminalLocationArrivalBoatTerminalLocation(provider: string, boatName: string, boatNumber: string, tripDuration: INDateComponentsRange, departureBoatTerminalLocation: CLPlacemark, arrivalBoatTerminalLocation: CLPlacemark): this;
}

/**
 * @since 10.0
 */
declare class INBookRestaurantReservationIntent extends INIntent implements NSCopying {

	static alloc(): INBookRestaurantReservationIntent; // inherited from NSObject

	static new(): INBookRestaurantReservationIntent; // inherited from NSObject

	bookingDateComponents: NSDateComponents;

	bookingIdentifier: string;

	guest: INRestaurantGuest;

	guestProvidedSpecialRequestText: string;

	partySize: number;

	restaurant: INRestaurant;

	selectedOffer: INRestaurantOffer;

	/**
	 * @since 11.0
	 */
	constructor(o: { restaurant: INRestaurant; bookingDateComponents: NSDateComponents; partySize: number; bookingIdentifier: string; guest: INRestaurantGuest; selectedOffer: INRestaurantOffer; guestProvidedSpecialRequestText: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 11.0
	 */
	initWithRestaurantBookingDateComponentsPartySizeBookingIdentifierGuestSelectedOfferGuestProvidedSpecialRequestText(restaurant: INRestaurant, bookingDateComponents: NSDateComponents, partySize: number, bookingIdentifier: string, guest: INRestaurantGuest, selectedOffer: INRestaurantOffer, guestProvidedSpecialRequestText: string): this;
}

declare const enum INBookRestaurantReservationIntentCode {

	Success = 0,

	Denied = 1,

	Failure = 2,

	FailureRequiringAppLaunch = 3,

	FailureRequiringAppLaunchMustVerifyCredentials = 4,

	FailureRequiringAppLaunchServiceTemporarilyUnavailable = 5
}

/**
 * @since 10.0
 */
interface INBookRestaurantReservationIntentHandling extends NSObjectProtocol {

	confirmBookRestaurantReservationCompletion?(intent: INBookRestaurantReservationIntent, completion: (p1: INBookRestaurantReservationIntentResponse) => void): void;

	handleBookRestaurantReservationCompletion(intent: INBookRestaurantReservationIntent, completion: (p1: INBookRestaurantReservationIntentResponse) => void): void;

	resolveBookingDateComponentsForBookRestaurantReservationWithCompletion?(intent: INBookRestaurantReservationIntent, completion: (p1: INDateComponentsResolutionResult) => void): void;

	resolveGuestForBookRestaurantReservationWithCompletion?(intent: INBookRestaurantReservationIntent, completion: (p1: INRestaurantGuestResolutionResult) => void): void;

	resolveGuestProvidedSpecialRequestTextForBookRestaurantReservationWithCompletion?(intent: INBookRestaurantReservationIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolvePartySizeForBookRestaurantReservationWithCompletion?(intent: INBookRestaurantReservationIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolveRestaurantForBookRestaurantReservationWithCompletion?(intent: INBookRestaurantReservationIntent, completion: (p1: INRestaurantResolutionResult) => void): void;
}
declare var INBookRestaurantReservationIntentHandling: {

	prototype: INBookRestaurantReservationIntentHandling;
};

/**
 * @since 10.0
 */
declare class INBookRestaurantReservationIntentResponse extends INIntentResponse {

	static alloc(): INBookRestaurantReservationIntentResponse; // inherited from NSObject

	static new(): INBookRestaurantReservationIntentResponse; // inherited from NSObject

	readonly code: INBookRestaurantReservationIntentCode;

	userBooking: INRestaurantReservationUserBooking;

	constructor(o: { code: INBookRestaurantReservationIntentCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INBookRestaurantReservationIntentCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare class INBooleanResolutionResult extends INIntentResolutionResult {

	static alloc(): INBooleanResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INBooleanResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INBooleanResolutionResult;

	static needsValue(): INBooleanResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBooleanResolutionResult; // inherited from NSObject

	static notRequired(): INBooleanResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: boolean): INBooleanResolutionResult;

	static unsupported(): INBooleanResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INBooleanResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.0
 */
declare class INBusReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INBusReservation; // inherited from NSObject

	static new(): INBusReservation; // inherited from NSObject

	readonly busTrip: INBusTrip;

	readonly reservedSeat: INSeat;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; reservedSeat: INSeat; busTrip: INBusTrip; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLReservedSeatBusTrip(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, reservedSeat: INSeat, busTrip: INBusTrip): this;
}

/**
 * @since 14.0
 */
declare class INBusTrip extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INBusTrip; // inherited from NSObject

	static new(): INBusTrip; // inherited from NSObject

	readonly arrivalBusStopLocation: CLPlacemark;

	readonly arrivalPlatform: string;

	readonly busName: string;

	readonly busNumber: string;

	readonly departureBusStopLocation: CLPlacemark;

	readonly departurePlatform: string;

	readonly provider: string;

	readonly tripDuration: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { provider: string; busName: string; busNumber: string; tripDuration: INDateComponentsRange; departureBusStopLocation: CLPlacemark; departurePlatform: string; arrivalBusStopLocation: CLPlacemark; arrivalPlatform: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithProviderBusNameBusNumberTripDurationDepartureBusStopLocationDeparturePlatformArrivalBusStopLocationArrivalPlatform(provider: string, busName: string, busNumber: string, tripDuration: INDateComponentsRange, departureBusStopLocation: CLPlacemark, departurePlatform: string, arrivalBusStopLocation: CLPlacemark, arrivalPlatform: string): this;
}

/**
 * @since 13.0
 */
declare const enum INCallAudioRoute {

	Unknown = 0,

	SpeakerphoneAudioRoute = 1,

	BluetoothAudioRoute = 2
}

/**
 * @since 10.0
 */
declare const enum INCallCapability {

	Unknown = 0,

	AudioCall = 1,

	VideoCall = 2
}

/**
 * @since 10.0
 */
declare const enum INCallCapabilityOptions {

	AudioCall = 1,

	VideoCall = 2
}

/**
 * @since 13.0
 */
declare class INCallCapabilityResolutionResult extends INIntentResolutionResult {

	static alloc(): INCallCapabilityResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallCapabilityToConfirm(callCapabilityToConfirm: INCallCapability): INCallCapabilityResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	static needsValue(): INCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallCapabilityResolutionResult; // inherited from NSObject

	static notRequired(): INCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallCapability(resolvedCallCapability: INCallCapability): INCallCapabilityResolutionResult;

	static unsupported(): INCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCallCapabilityResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare const enum INCallDestinationType {

	Unknown = 0,

	Normal = 1,

	Emergency = 2,

	Voicemail = 3,

	Redial = 4,

	CallBack = 5,

	NormalDestination = 1,

	EmergencyDestination = 2,

	VoicemailDestination = 3,

	RedialDestination = 4
}

/**
 * @since 11.0
 */
declare class INCallDestinationTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INCallDestinationTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallDestinationTypeToConfirm(callDestinationTypeToConfirm: INCallDestinationType): INCallDestinationTypeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult

	static needsValue(): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallDestinationTypeResolutionResult; // inherited from NSObject

	static notRequired(): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallDestinationType(resolvedCallDestinationType: INCallDestinationType): INCallDestinationTypeResolutionResult;

	static unsupported(): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.5
 */
declare class INCallGroup extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCallGroup; // inherited from NSObject

	static new(): INCallGroup; // inherited from NSObject

	readonly groupId: string;

	readonly groupName: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { groupName: string; groupId: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithGroupNameGroupId(groupName: string, groupId: string): this;
}

/**
 * @since 11.0
 */
declare class INCallRecord extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCallRecord; // inherited from NSObject

	static new(): INCallRecord; // inherited from NSObject

	readonly callCapability: INCallCapability;

	readonly callDuration: number;

	readonly callRecordType: INCallRecordType;

	/**
	 * @since 11.0
	 * @deprecated 14.5
	 */
	readonly caller: INPerson;

	readonly dateCreated: Date;

	readonly identifier: string;

	/**
	 * @since 14.5
	 */
	readonly isCallerIdBlocked: number;

	/**
	 * @since 13.0
	 */
	readonly numberOfCalls: number;

	/**
	 * @since 14.5
	 */
	readonly participants: NSArray<INPerson>;

	readonly unseen: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; dateCreated: Date; callRecordType: INCallRecordType; callCapability: INCallCapability; callDuration: number; unseen: number; });

	/**
	 * @since 13.0
	 */
	constructor(o: { identifier: string; dateCreated: Date; callRecordType: INCallRecordType; callCapability: INCallCapability; callDuration: number; unseen: number; numberOfCalls: number; });

	/**
	 * @since 14.5
	 */
	constructor(o: { identifier: string; dateCreated: Date; callRecordType: INCallRecordType; callCapability: INCallCapability; callDuration: number; unseen: number; participants: NSArray<INPerson> | INPerson[]; numberOfCalls: number; isCallerIdBlocked: number; });

	/**
	 * @since 11.0
	 * @deprecated 14.5
	 */
	constructor(o: { identifier: string; dateCreated: Date; caller: INPerson; callRecordType: INCallRecordType; callCapability: INCallCapability; callDuration: number; unseen: number; });

	/**
	 * @since 13.0
	 * @deprecated 14.5
	 */
	constructor(o: { identifier: string; dateCreated: Date; caller: INPerson; callRecordType: INCallRecordType; callCapability: INCallCapability; callDuration: number; unseen: number; numberOfCalls: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierDateCreatedCallRecordTypeCallCapabilityCallDurationUnseen(identifier: string, dateCreated: Date, callRecordType: INCallRecordType, callCapability: INCallCapability, callDuration: number, unseen: number): this;

	/**
	 * @since 13.0
	 */
	initWithIdentifierDateCreatedCallRecordTypeCallCapabilityCallDurationUnseenNumberOfCalls(identifier: string, dateCreated: Date, callRecordType: INCallRecordType, callCapability: INCallCapability, callDuration: number, unseen: number, numberOfCalls: number): this;

	/**
	 * @since 14.5
	 */
	initWithIdentifierDateCreatedCallRecordTypeCallCapabilityCallDurationUnseenParticipantsNumberOfCallsIsCallerIdBlocked(identifier: string, dateCreated: Date, callRecordType: INCallRecordType, callCapability: INCallCapability, callDuration: number, unseen: number, participants: NSArray<INPerson> | INPerson[], numberOfCalls: number, isCallerIdBlocked: number): this;

	/**
	 * @since 11.0
	 * @deprecated 14.5
	 */
	initWithIdentifierDateCreatedCallerCallRecordTypeCallCapabilityCallDurationUnseen(identifier: string, dateCreated: Date, caller: INPerson, callRecordType: INCallRecordType, callCapability: INCallCapability, callDuration: number, unseen: number): this;

	/**
	 * @since 13.0
	 * @deprecated 14.5
	 */
	initWithIdentifierDateCreatedCallerCallRecordTypeCallCapabilityCallDurationUnseenNumberOfCalls(identifier: string, dateCreated: Date, caller: INPerson, callRecordType: INCallRecordType, callCapability: INCallCapability, callDuration: number, unseen: number, numberOfCalls: number): this;
}

/**
 * @since 14.0
 */
declare class INCallRecordFilter extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCallRecordFilter; // inherited from NSObject

	static new(): INCallRecordFilter; // inherited from NSObject

	readonly callCapability: INCallCapability;

	readonly callTypes: INCallRecordTypeOptions;

	readonly participants: NSArray<INPerson>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { participants: NSArray<INPerson> | INPerson[]; callTypes: INCallRecordTypeOptions; callCapability: INCallCapability; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithParticipantsCallTypesCallCapability(participants: NSArray<INPerson> | INPerson[], callTypes: INCallRecordTypeOptions, callCapability: INCallCapability): this;
}

/**
 * @since 11.0
 */
declare class INCallRecordResolutionResult extends INIntentResolutionResult {

	static alloc(): INCallRecordResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallRecordToConfirm(callRecordToConfirm: INCallRecord): INCallRecordResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCallRecordResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithCallRecordsToDisambiguate(callRecordsToDisambiguate: NSArray<INCallRecord> | INCallRecord[]): INCallRecordResolutionResult;

	static needsValue(): INCallRecordResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallRecordResolutionResult; // inherited from NSObject

	static notRequired(): INCallRecordResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallRecord(resolvedCallRecord: INCallRecord): INCallRecordResolutionResult;

	static unsupported(): INCallRecordResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCallRecordResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare const enum INCallRecordType {

	Unknown = 0,

	Outgoing = 1,

	Missed = 2,

	Received = 3,

	Latest = 4,

	Voicemail = 5,

	Ringing = 6,

	InProgress = 7,

	OnHold = 8
}

/**
 * @since 10.0
 */
declare const enum INCallRecordTypeOptions {

	Outgoing = 1,

	Missed = 2,

	Received = 4,

	Latest = 8,

	Voicemail = 16,

	Ringing = 32,

	InProgress = 64,

	OnHold = 128
}

/**
 * @since 11.0
 */
declare class INCallRecordTypeOptionsResolutionResult extends INIntentResolutionResult {

	static alloc(): INCallRecordTypeOptionsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallRecordTypeOptionsToConfirm(callRecordTypeOptionsToConfirm: INCallRecordTypeOptions): INCallRecordTypeOptionsResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static needsValue(): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallRecordTypeOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallRecordTypeOptions(resolvedCallRecordTypeOptions: INCallRecordTypeOptions): INCallRecordTypeOptionsResolutionResult;

	static unsupported(): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare class INCallRecordTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INCallRecordTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallRecordTypeToConfirm(callRecordTypeToConfirm: INCallRecordType): INCallRecordTypeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	static needsValue(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallRecordTypeResolutionResult; // inherited from NSObject

	static notRequired(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallRecordType(resolvedCallRecordType: INCallRecordType): INCallRecordTypeResolutionResult;

	static unsupported(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 * @deprecated 13.0
 */
interface INCallsDomainHandling extends INSearchCallHistoryIntentHandling, INStartAudioCallIntentHandling, INStartVideoCallIntentHandling {
}
declare var INCallsDomainHandling: {

	prototype: INCallsDomainHandling;
};

/**
 * @since 11.0
 */
declare class INCancelRideIntent extends INIntent {

	static alloc(): INCancelRideIntent; // inherited from NSObject

	static new(): INCancelRideIntent; // inherited from NSObject

	readonly rideIdentifier: string;

	constructor(o: { rideIdentifier: string; });

	initWithRideIdentifier(rideIdentifier: string): this;
}

/**
 * @since 11.0
 */
interface INCancelRideIntentHandling extends NSObjectProtocol {

	confirmCancelRideCompletion?(intent: INCancelRideIntent, completion: (p1: INCancelRideIntentResponse) => void): void;

	handleCancelRideCompletion(intent: INCancelRideIntent, completion: (p1: INCancelRideIntentResponse) => void): void;
}
declare var INCancelRideIntentHandling: {

	prototype: INCancelRideIntentHandling;
};

/**
 * @since 11.0
 */
declare class INCancelRideIntentResponse extends INIntentResponse {

	static alloc(): INCancelRideIntentResponse; // inherited from NSObject

	static new(): INCancelRideIntentResponse; // inherited from NSObject

	cancellationFee: INCurrencyAmount;

	cancellationFeeThreshold: NSDateComponents;

	readonly code: INCancelRideIntentResponseCode;

	constructor(o: { code: INCancelRideIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCancelRideIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 */
declare const enum INCancelRideIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	Success = 2,

	Failure = 3
}

/**
 * @since 10.0
 */
declare class INCancelWorkoutIntent extends INIntent {

	static alloc(): INCancelWorkoutIntent; // inherited from NSObject

	static new(): INCancelWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

/**
 * @since 10.0
 */
interface INCancelWorkoutIntentHandling extends NSObjectProtocol {

	confirmCancelWorkoutCompletion?(intent: INCancelWorkoutIntent, completion: (p1: INCancelWorkoutIntentResponse) => void): void;

	handleCancelWorkoutCompletion(intent: INCancelWorkoutIntent, completion: (p1: INCancelWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForCancelWorkoutWithCompletion?(intent: INCancelWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INCancelWorkoutIntentHandling: {

	prototype: INCancelWorkoutIntentHandling;
};

/**
 * @since 10.0
 */
declare var INCancelWorkoutIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INCancelWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INCancelWorkoutIntentResponse; // inherited from NSObject

	static new(): INCancelWorkoutIntentResponse; // inherited from NSObject

	readonly code: INCancelWorkoutIntentResponseCode;

	constructor(o: { code: INCancelWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCancelWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INCancelWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	HandleInApp = 6,

	Success = 7
}

/**
 * @since 14.0
 */
declare class INCar extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCar; // inherited from NSObject

	static new(): INCar; // inherited from NSObject

	readonly carIdentifier: string;

	readonly color: any;

	readonly displayName: string;

	readonly headUnit: INCarHeadUnit;

	readonly make: string;

	readonly model: string;

	readonly supportedChargingConnectors: NSArray<string>;

	readonly year: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { carIdentifier: string; displayName: string; year: string; make: string; model: string; color: any; headUnit: INCarHeadUnit; supportedChargingConnectors: NSArray<string> | string[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCarIdentifierDisplayNameYearMakeModelColorHeadUnitSupportedChargingConnectors(carIdentifier: string, displayName: string, year: string, make: string, model: string, color: any, headUnit: INCarHeadUnit, supportedChargingConnectors: NSArray<string> | string[]): this;

	initWithCoder(coder: NSCoder): this;

	maximumPowerForChargingConnectorType(chargingConnectorType: string): NSMeasurement<NSUnitPower>;

	setMaximumPowerForChargingConnectorType(power: NSMeasurement<NSUnitPower>, chargingConnectorType: string): void;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INCarAirCirculationMode {

	Unknown = 0,

	FreshAir = 1,

	RecirculateAir = 2
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INCarAirCirculationModeResolutionResult extends INIntentResolutionResult {

	static alloc(): INCarAirCirculationModeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarAirCirculationModeToConfirm(carAirCirculationModeToConfirm: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	static needsValue(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarAirCirculationModeResolutionResult; // inherited from NSObject

	static notRequired(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarAirCirculationMode(resolvedCarAirCirculationMode: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	static unsupported(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INCarAudioSource {

	Unknown = 0,

	CarPlay = 1,

	iPod = 2,

	Radio = 3,

	Bluetooth = 4,

	AUX = 5,

	USB = 6,

	MemoryCard = 7,

	OpticalDrive = 8,

	HardDrive = 9
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INCarAudioSourceResolutionResult extends INIntentResolutionResult {

	static alloc(): INCarAudioSourceResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarAudioSourceToConfirm(carAudioSourceToConfirm: INCarAudioSource): INCarAudioSourceResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarAudioSource): INCarAudioSourceResolutionResult;

	static needsValue(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarAudioSourceResolutionResult; // inherited from NSObject

	static notRequired(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarAudioSource(resolvedCarAudioSource: INCarAudioSource): INCarAudioSourceResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INCarAudioSource): INCarAudioSourceResolutionResult;

	static unsupported(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.0
 */
declare var INCarChargingConnectorTypeCCS1: string;

/**
 * @since 14.0
 */
declare var INCarChargingConnectorTypeCCS2: string;

/**
 * @since 14.0
 */
declare var INCarChargingConnectorTypeCHAdeMO: string;

/**
 * @since 14.0
 */
declare var INCarChargingConnectorTypeGBTAC: string;

/**
 * @since 14.0
 */
declare var INCarChargingConnectorTypeGBTDC: string;

/**
 * @since 14.0
 */
declare var INCarChargingConnectorTypeJ1772: string;

/**
 * @since 14.0
 */
declare var INCarChargingConnectorTypeMennekes: string;

/**
 * @since 17.4
 */
declare var INCarChargingConnectorTypeNACSAC: string;

/**
 * @since 17.4
 */
declare var INCarChargingConnectorTypeNACSDC: string;

/**
 * @since 14.0
 * @deprecated 17.4
 */
declare var INCarChargingConnectorTypeTesla: string;

/**
 * @since 10.3
 * @deprecated 13.0
 */
interface INCarCommandsDomainHandling extends INActivateCarSignalIntentHandling, INGetCarLockStatusIntentHandling, INGetCarPowerLevelStatusIntentHandling, INSetCarLockStatusIntentHandling {
}
declare var INCarCommandsDomainHandling: {

	prototype: INCarCommandsDomainHandling;
};

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INCarDefroster {

	Unknown = 0,

	Front = 1,

	Rear = 2,

	All = 3
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INCarDefrosterResolutionResult extends INIntentResolutionResult {

	static alloc(): INCarDefrosterResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarDefrosterToConfirm(carDefrosterToConfirm: INCarDefroster): INCarDefrosterResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarDefroster): INCarDefrosterResolutionResult;

	static needsValue(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarDefrosterResolutionResult; // inherited from NSObject

	static notRequired(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarDefroster(resolvedCarDefroster: INCarDefroster): INCarDefrosterResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INCarDefroster): INCarDefrosterResolutionResult;

	static unsupported(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.0
 */
declare class INCarHeadUnit extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCarHeadUnit; // inherited from NSObject

	static new(): INCarHeadUnit; // inherited from NSObject

	readonly bluetoothIdentifier: string;

	readonly iAP2Identifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { bluetoothIdentifier: string; iAP2Identifier: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithBluetoothIdentifierIAP2Identifier(bluetoothIdentifier: string, iAP2Identifier: string): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface INCarPlayDomainHandling extends INSaveProfileInCarIntentHandling, INSetAudioSourceInCarIntentHandling, INSetClimateSettingsInCarIntentHandling, INSetDefrosterSettingsInCarIntentHandling, INSetProfileInCarIntentHandling, INSetSeatSettingsInCarIntentHandling {
}
declare var INCarPlayDomainHandling: {

	prototype: INCarPlayDomainHandling;
};

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INCarSeat {

	Unknown = 0,

	Driver = 1,

	Passenger = 2,

	FrontLeft = 3,

	FrontRight = 4,

	Front = 5,

	RearLeft = 6,

	RearRight = 7,

	Rear = 8,

	ThirdRowLeft = 9,

	ThirdRowRight = 10,

	ThirdRow = 11,

	All = 12
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INCarSeatResolutionResult extends INIntentResolutionResult {

	static alloc(): INCarSeatResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarSeatToConfirm(carSeatToConfirm: INCarSeat): INCarSeatResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarSeat): INCarSeatResolutionResult;

	static needsValue(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarSeatResolutionResult; // inherited from NSObject

	static notRequired(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarSeat(resolvedCarSeat: INCarSeat): INCarSeatResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INCarSeat): INCarSeatResolutionResult;

	static unsupported(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCarSeatResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.3
 */
declare const enum INCarSignalOptions {

	Audible = 1,

	Visible = 2
}

/**
 * @since 10.3
 */
declare class INCarSignalOptionsResolutionResult extends INIntentResolutionResult {

	static alloc(): INCarSignalOptionsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarSignalOptionsToConfirm(carSignalOptionsToConfirm: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.3
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	static needsValue(): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarSignalOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarSignalOptions(resolvedCarSignalOptions: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	/**
	 * @since 10.3
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	static unsupported(): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare const enum INConditionalOperator {

	All = 0,

	Any = 1,

	None = 2
}

/**
 * @since 11.0
 */
declare class INCreateNoteIntent extends INIntent {

	static alloc(): INCreateNoteIntent; // inherited from NSObject

	static new(): INCreateNoteIntent; // inherited from NSObject

	readonly content: INNoteContent;

	readonly groupName: INSpeakableString;

	readonly title: INSpeakableString;

	constructor(o: { title: INSpeakableString; content: INNoteContent; groupName: INSpeakableString; });

	initWithTitleContentGroupName(title: INSpeakableString, content: INNoteContent, groupName: INSpeakableString): this;
}

/**
 * @since 11.0
 */
interface INCreateNoteIntentHandling extends NSObjectProtocol {

	confirmCreateNoteCompletion?(intent: INCreateNoteIntent, completion: (p1: INCreateNoteIntentResponse) => void): void;

	handleCreateNoteCompletion(intent: INCreateNoteIntent, completion: (p1: INCreateNoteIntentResponse) => void): void;

	resolveContentForCreateNoteWithCompletion?(intent: INCreateNoteIntent, completion: (p1: INNoteContentResolutionResult) => void): void;

	resolveGroupNameForCreateNoteWithCompletion?(intent: INCreateNoteIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveTitleForCreateNoteWithCompletion?(intent: INCreateNoteIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INCreateNoteIntentHandling: {

	prototype: INCreateNoteIntentHandling;
};

/**
 * @since 11.0
 */
declare class INCreateNoteIntentResponse extends INIntentResponse {

	static alloc(): INCreateNoteIntentResponse; // inherited from NSObject

	static new(): INCreateNoteIntentResponse; // inherited from NSObject

	readonly code: INCreateNoteIntentResponseCode;

	createdNote: INNote;

	constructor(o: { code: INCreateNoteIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCreateNoteIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 */
declare const enum INCreateNoteIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INCreateTaskListIntent extends INIntent {

	static alloc(): INCreateTaskListIntent; // inherited from NSObject

	static new(): INCreateTaskListIntent; // inherited from NSObject

	readonly groupName: INSpeakableString;

	readonly taskTitles: NSArray<INSpeakableString>;

	readonly title: INSpeakableString;

	constructor(o: { title: INSpeakableString; taskTitles: NSArray<INSpeakableString> | INSpeakableString[]; groupName: INSpeakableString; });

	initWithTitleTaskTitlesGroupName(title: INSpeakableString, taskTitles: NSArray<INSpeakableString> | INSpeakableString[], groupName: INSpeakableString): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
interface INCreateTaskListIntentHandling extends NSObjectProtocol {

	confirmCreateTaskListCompletion?(intent: INCreateTaskListIntent, completion: (p1: INCreateTaskListIntentResponse) => void): void;

	handleCreateTaskListCompletion(intent: INCreateTaskListIntent, completion: (p1: INCreateTaskListIntentResponse) => void): void;

	resolveGroupNameForCreateTaskListWithCompletion?(intent: INCreateTaskListIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveTaskTitlesForCreateTaskListWithCompletion?(intent: INCreateTaskListIntent, completion: (p1: NSArray<INSpeakableStringResolutionResult>) => void): void;

	resolveTitleForCreateTaskListWithCompletion?(intent: INCreateTaskListIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INCreateTaskListIntentHandling: {

	prototype: INCreateTaskListIntentHandling;
};

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INCreateTaskListIntentResponse extends INIntentResponse {

	static alloc(): INCreateTaskListIntentResponse; // inherited from NSObject

	static new(): INCreateTaskListIntentResponse; // inherited from NSObject

	readonly code: INCreateTaskListIntentResponseCode;

	createdTaskList: INTaskList;

	constructor(o: { code: INCreateTaskListIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCreateTaskListIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare const enum INCreateTaskListIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 */
declare class INCurrencyAmount extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCurrencyAmount; // inherited from NSObject

	static new(): INCurrencyAmount; // inherited from NSObject

	readonly amount: NSDecimalNumber;

	readonly currencyCode: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { amount: NSDecimalNumber; currencyCode: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAmountCurrencyCode(amount: NSDecimalNumber, currencyCode: string): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class INCurrencyAmountResolutionResult extends INIntentResolutionResult {

	static alloc(): INCurrencyAmountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCurrencyAmountToConfirm(currencyAmountToConfirm: INCurrencyAmount): INCurrencyAmountResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithCurrencyAmountsToDisambiguate(currencyAmountsToDisambiguate: NSArray<INCurrencyAmount> | INCurrencyAmount[]): INCurrencyAmountResolutionResult;

	static needsValue(): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCurrencyAmountResolutionResult; // inherited from NSObject

	static notRequired(): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCurrencyAmount(resolvedCurrencyAmount: INCurrencyAmount): INCurrencyAmountResolutionResult;

	static unsupported(): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 12.0
 */
declare class INDailyRoutineRelevanceProvider extends INRelevanceProvider {

	static alloc(): INDailyRoutineRelevanceProvider; // inherited from NSObject

	static new(): INDailyRoutineRelevanceProvider; // inherited from NSObject

	readonly situation: INDailyRoutineSituation;

	constructor(o: { situation: INDailyRoutineSituation; });

	initWithSituation(situation: INDailyRoutineSituation): this;
}

/**
 * @since 12.0
 */
declare const enum INDailyRoutineSituation {

	Morning = 0,

	Evening = 1,

	Home = 2,

	Work = 3,

	School = 4,

	Gym = 5,

	Commute = 6,

	HeadphonesConnected = 7,

	ActiveWorkout = 8,

	PhysicalActivityIncomplete = 9
}

/**
 * @since 10.0
 */
declare class INDateComponentsRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INDateComponentsRange; // inherited from NSObject

	static new(): INDateComponentsRange; // inherited from NSObject

	readonly endDateComponents: NSDateComponents;

	/**
	 * @since 11.0
	 */
	readonly recurrenceRule: INRecurrenceRule;

	readonly startDateComponents: NSDateComponents;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 11.0
	 */
	constructor(o: { EKRecurrenceRule: EKRecurrenceRule; });

	constructor(o: { startDateComponents: NSDateComponents; endDateComponents: NSDateComponents; });

	/**
	 * @since 11.0
	 */
	constructor(o: { startDateComponents: NSDateComponents; endDateComponents: NSDateComponents; recurrenceRule: INRecurrenceRule; });

	/**
	 * @since 11.0
	 */
	EKRecurrenceRule(): EKRecurrenceRule;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 11.0
	 */
	initWithEKRecurrenceRule(recurrenceRule: EKRecurrenceRule): this;

	initWithStartDateComponentsEndDateComponents(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents): this;

	/**
	 * @since 11.0
	 */
	initWithStartDateComponentsEndDateComponentsRecurrenceRule(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents, recurrenceRule: INRecurrenceRule): this;
}

/**
 * @since 10.0
 */
declare class INDateComponentsRangeResolutionResult extends INIntentResolutionResult {

	static alloc(): INDateComponentsRangeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithDateComponentsRangeToConfirm(dateComponentsRangeToConfirm: INDateComponentsRange): INDateComponentsRangeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithDateComponentsRangesToDisambiguate(dateComponentsRangesToDisambiguate: NSArray<INDateComponentsRange> | INDateComponentsRange[]): INDateComponentsRangeResolutionResult;

	static needsValue(): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDateComponentsRangeResolutionResult; // inherited from NSObject

	static notRequired(): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedDateComponentsRange(resolvedDateComponentsRange: INDateComponentsRange): INDateComponentsRangeResolutionResult;

	static unsupported(): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INDateComponentsResolutionResult extends INIntentResolutionResult {

	static alloc(): INDateComponentsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithDateComponentsToConfirm(dateComponentsToConfirm: NSDateComponents): INDateComponentsResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithDateComponentsToDisambiguate(dateComponentsToDisambiguate: NSArray<NSDateComponents> | NSDateComponents[]): INDateComponentsResolutionResult;

	static needsValue(): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDateComponentsResolutionResult; // inherited from NSObject

	static notRequired(): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedDateComponents(resolvedDateComponents: NSDateComponents): INDateComponentsResolutionResult;

	static unsupported(): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 12.0
 */
declare class INDateRelevanceProvider extends INRelevanceProvider {

	static alloc(): INDateRelevanceProvider; // inherited from NSObject

	static new(): INDateRelevanceProvider; // inherited from NSObject

	readonly endDate: Date;

	readonly startDate: Date;

	constructor(o: { startDate: Date; endDate: Date; });

	initWithStartDateEndDate(startDate: Date, endDate: Date): this;
}

/**
 * @since 11.0
 */
declare const enum INDateSearchType {

	Unknown = 0,

	ByDueDate = 1,

	ByModifiedDate = 2,

	ByCreatedDate = 3
}

/**
 * @since 11.0
 */
declare class INDateSearchTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INDateSearchTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithDateSearchTypeToConfirm(dateSearchTypeToConfirm: INDateSearchType): INDateSearchTypeResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static needsValue(): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDateSearchTypeResolutionResult; // inherited from NSObject

	static notRequired(): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedDateSearchType(resolvedDateSearchType: INDateSearchType): INDateSearchTypeResolutionResult;

	static unsupported(): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.0
 */
declare const enum INDayOfWeekOptions {

	Monday = 1,

	Tuesday = 2,

	Wednesday = 4,

	Thursday = 8,

	Friday = 16,

	Saturday = 32,

	Sunday = 64
}

/**
 * @since 12.0
 */
declare class INDefaultCardTemplate extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INDefaultCardTemplate; // inherited from NSObject

	static new(): INDefaultCardTemplate; // inherited from NSObject

	image: INImage;

	subtitle: string;

	title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitle(title: string): this;
}

/**
 * @since 13.0
 * @deprecated 15.0
 */
declare class INDeleteTasksIntent extends INIntent {

	static alloc(): INDeleteTasksIntent; // inherited from NSObject

	static new(): INDeleteTasksIntent; // inherited from NSObject

	readonly all: number;

	readonly taskList: INTaskList;

	readonly tasks: NSArray<INTask>;

	constructor(o: { taskList: INTaskList; tasks: NSArray<INTask> | INTask[]; all: number; });

	initWithTaskListTasksAll(taskList: INTaskList, tasks: NSArray<INTask> | INTask[], all: number): this;
}

/**
 * @since 13.0
 * @deprecated 15.0
 */
interface INDeleteTasksIntentHandling extends NSObjectProtocol {

	confirmDeleteTasksCompletion?(intent: INDeleteTasksIntent, completion: (p1: INDeleteTasksIntentResponse) => void): void;

	handleDeleteTasksCompletion(intent: INDeleteTasksIntent, completion: (p1: INDeleteTasksIntentResponse) => void): void;

	resolveTaskListForDeleteTasksWithCompletion?(intent: INDeleteTasksIntent, completion: (p1: INDeleteTasksTaskListResolutionResult) => void): void;

	resolveTasksForDeleteTasksWithCompletion?(intent: INDeleteTasksIntent, completion: (p1: NSArray<INDeleteTasksTaskResolutionResult>) => void): void;
}
declare var INDeleteTasksIntentHandling: {

	prototype: INDeleteTasksIntentHandling;
};

/**
 * @since 13.0
 * @deprecated 15.0
 */
declare class INDeleteTasksIntentResponse extends INIntentResponse {

	static alloc(): INDeleteTasksIntentResponse; // inherited from NSObject

	static new(): INDeleteTasksIntentResponse; // inherited from NSObject

	readonly code: INDeleteTasksIntentResponseCode;

	deletedTasks: NSArray<INTask>;

	constructor(o: { code: INDeleteTasksIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INDeleteTasksIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 * @deprecated 15.0
 */
declare const enum INDeleteTasksIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 13.0
 * @deprecated 15.0
 */
declare class INDeleteTasksTaskListResolutionResult extends INTaskListResolutionResult {

	static alloc(): INDeleteTasksTaskListResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INDeleteTasksTaskListResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskListToConfirm(taskListToConfirm: INTaskList): INDeleteTasksTaskListResolutionResult; // inherited from INTaskListResolutionResult

	static disambiguationWithTaskListsToDisambiguate(taskListsToDisambiguate: NSArray<INTaskList> | INTaskList[]): INDeleteTasksTaskListResolutionResult; // inherited from INTaskListResolutionResult

	static needsValue(): INDeleteTasksTaskListResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDeleteTasksTaskListResolutionResult; // inherited from NSObject

	static notRequired(): INDeleteTasksTaskListResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTaskList(resolvedTaskList: INTaskList): INDeleteTasksTaskListResolutionResult; // inherited from INTaskListResolutionResult

	static unsupported(): INDeleteTasksTaskListResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INDeleteTasksTaskListUnsupportedReason): INDeleteTasksTaskListResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INDeleteTasksTaskListResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { taskListResolutionResult: INTaskListResolutionResult; });

	initWithTaskListResolutionResult(taskListResolutionResult: INTaskListResolutionResult): this;
}

/**
 * @since 13.0
 * @deprecated 15.0
 */
declare const enum INDeleteTasksTaskListUnsupportedReason {

	NoTaskListFound = 1
}

/**
 * @since 13.0
 * @deprecated 15.0
 */
declare class INDeleteTasksTaskResolutionResult extends INTaskResolutionResult {

	static alloc(): INDeleteTasksTaskResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INDeleteTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskToConfirm(taskToConfirm: INTask): INDeleteTasksTaskResolutionResult; // inherited from INTaskResolutionResult

	static disambiguationWithTasksToDisambiguate(tasksToDisambiguate: NSArray<INTask> | INTask[]): INDeleteTasksTaskResolutionResult; // inherited from INTaskResolutionResult

	static needsValue(): INDeleteTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDeleteTasksTaskResolutionResult; // inherited from NSObject

	static notRequired(): INDeleteTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTask(resolvedTask: INTask): INDeleteTasksTaskResolutionResult; // inherited from INTaskResolutionResult

	static unsupported(): INDeleteTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INDeleteTasksTaskUnsupportedReason): INDeleteTasksTaskResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INDeleteTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { taskResolutionResult: INTaskResolutionResult; });

	initWithTaskResolutionResult(taskResolutionResult: INTaskResolutionResult): this;
}

/**
 * @since 13.0
 * @deprecated 15.0
 */
declare const enum INDeleteTasksTaskUnsupportedReason {

	NoTasksFound = 1,

	NoTasksInApp = 2
}

/**
 * @since 10.0
 */
declare class INDoubleResolutionResult extends INIntentResolutionResult {

	static alloc(): INDoubleResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INDoubleResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INDoubleResolutionResult;

	static needsValue(): INDoubleResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDoubleResolutionResult; // inherited from NSObject

	static notRequired(): INDoubleResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: number): INDoubleResolutionResult;

	static unsupported(): INDoubleResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INDoubleResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 17.0
 */
declare class INEditMessageIntent extends INIntent {

	static alloc(): INEditMessageIntent; // inherited from NSObject

	static new(): INEditMessageIntent; // inherited from NSObject

	readonly editedContent: string;

	readonly messageIdentifier: string;

	constructor(o: { messageIdentifier: string; editedContent: string; });

	initWithMessageIdentifierEditedContent(messageIdentifier: string, editedContent: string): this;
}

/**
 * @since 17.0
 */
interface INEditMessageIntentHandling extends NSObjectProtocol {

	confirmEditMessageCompletion?(intent: INEditMessageIntent, completion: (p1: INEditMessageIntentResponse) => void): void;

	handleEditMessageCompletion(intent: INEditMessageIntent, completion: (p1: INEditMessageIntentResponse) => void): void;

	resolveEditedContentForEditMessageWithCompletion?(intent: INEditMessageIntent, completion: (p1: INStringResolutionResult) => void): void;
}
declare var INEditMessageIntentHandling: {

	prototype: INEditMessageIntentHandling;
};

/**
 * @since 17.0
 */
declare class INEditMessageIntentResponse extends INIntentResponse {

	static alloc(): INEditMessageIntentResponse; // inherited from NSObject

	static new(): INEditMessageIntentResponse; // inherited from NSObject

	readonly code: INEditMessageIntentResponseCode;

	constructor(o: { code: INEditMessageIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INEditMessageIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 17.0
 */
declare const enum INEditMessageIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureMessageNotFound = 6,

	FailurePastEditTimeLimit = 7,

	FailureMessageTypeUnsupported = 8,

	FailureUnsupportedOnService = 9,

	FailureMessageServiceNotAvailable = 10,

	FailureRequiringInAppAuthentication = 11
}

/**
 * @since 10.0
 */
declare class INEndWorkoutIntent extends INIntent {

	static alloc(): INEndWorkoutIntent; // inherited from NSObject

	static new(): INEndWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

/**
 * @since 10.0
 */
interface INEndWorkoutIntentHandling extends NSObjectProtocol {

	confirmEndWorkoutCompletion?(intent: INEndWorkoutIntent, completion: (p1: INEndWorkoutIntentResponse) => void): void;

	handleEndWorkoutCompletion(intent: INEndWorkoutIntent, completion: (p1: INEndWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForEndWorkoutWithCompletion?(intent: INEndWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INEndWorkoutIntentHandling: {

	prototype: INEndWorkoutIntentHandling;
};

/**
 * @since 10.0
 */
declare var INEndWorkoutIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INEndWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INEndWorkoutIntentResponse; // inherited from NSObject

	static new(): INEndWorkoutIntentResponse; // inherited from NSObject

	readonly code: INEndWorkoutIntentResponseCode;

	constructor(o: { code: INEndWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INEndWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INEndWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	HandleInApp = 6,

	Success = 7
}

/**
 * @since 13.0
 */
declare class INEnergyResolutionResult extends INIntentResolutionResult {

	static alloc(): INEnergyResolutionResult; // inherited from NSObject

	static confirmationRequiredWithEnergyToConfirm(energyToConfirm: NSMeasurement<NSUnitEnergy>): INEnergyResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INEnergyResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithEnergyToDisambiguate(energyToDisambiguate: NSArray<NSMeasurement<NSUnitEnergy>> | NSMeasurement<NSUnitEnergy>[]): INEnergyResolutionResult;

	static needsValue(): INEnergyResolutionResult; // inherited from INIntentResolutionResult

	static new(): INEnergyResolutionResult; // inherited from NSObject

	static notRequired(): INEnergyResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedEnergy(resolvedEnergy: NSMeasurement<NSUnitEnergy>): INEnergyResolutionResult;

	static unsupported(): INEnergyResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INEnergyResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare class INEnumResolutionResult extends INIntentResolutionResult {

	static alloc(): INEnumResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INEnumResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INEnumResolutionResult;

	static needsValue(): INEnumResolutionResult; // inherited from INIntentResolutionResult

	static new(): INEnumResolutionResult; // inherited from NSObject

	static notRequired(): INEnumResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: number): INEnumResolutionResult;

	static unsupported(): INEnumResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INEnumResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INExtension extends NSObject implements INIntentHandlerProviding {

	static alloc(): INExtension; // inherited from NSObject

	static new(): INExtension; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	handlerForIntent(intent: INIntent): any;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 13.0
 */
declare class INFile extends NSObject implements NSSecureCoding {

	static alloc(): INFile; // inherited from NSObject

	static fileWithDataFilenameTypeIdentifier(data: NSData, filename: string, typeIdentifier: string): INFile;

	static fileWithFileURLFilenameTypeIdentifier(fileURL: NSURL, filename: string, typeIdentifier: string): INFile;

	static new(): INFile; // inherited from NSObject

	readonly data: NSData;

	readonly fileURL: NSURL;

	filename: string;

	/**
	 * @since 15.1
	 */
	removedOnCompletion: boolean;

	readonly typeIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class INFileResolutionResult extends INIntentResolutionResult {

	static alloc(): INFileResolutionResult; // inherited from NSObject

	static confirmationRequiredWithFileToConfirm(fileToConfirm: INFile): INFileResolutionResult;

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INFileResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithFilesToDisambiguate(filesToDisambiguate: NSArray<INFile> | INFile[]): INFileResolutionResult;

	static needsValue(): INFileResolutionResult; // inherited from INIntentResolutionResult

	static new(): INFileResolutionResult; // inherited from NSObject

	static notRequired(): INFileResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedFile(resolvedFile: INFile): INFileResolutionResult;

	static unsupported(): INFileResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INFileResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare class INFlight extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INFlight; // inherited from NSObject

	static new(): INFlight; // inherited from NSObject

	readonly airline: INAirline;

	readonly arrivalAirportGate: INAirportGate;

	readonly boardingTime: INDateComponentsRange;

	readonly departureAirportGate: INAirportGate;

	readonly flightDuration: INDateComponentsRange;

	readonly flightNumber: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { airline: INAirline; flightNumber: string; boardingTime: INDateComponentsRange; flightDuration: INDateComponentsRange; departureAirportGate: INAirportGate; arrivalAirportGate: INAirportGate; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAirlineFlightNumberBoardingTimeFlightDurationDepartureAirportGateArrivalAirportGate(airline: INAirline, flightNumber: string, boardingTime: INDateComponentsRange, flightDuration: INDateComponentsRange, departureAirportGate: INAirportGate, arrivalAirportGate: INAirportGate): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class INFlightReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INFlightReservation; // inherited from NSObject

	static new(): INFlightReservation; // inherited from NSObject

	readonly flight: INFlight;

	readonly reservedSeat: INSeat;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; reservedSeat: INSeat; flight: INFlight; });

	/**
	 * @since 14.0
	 */
	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; reservedSeat: INSeat; flight: INFlight; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsReservedSeatFlight(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], reservedSeat: INSeat, flight: INFlight): this;

	/**
	 * @since 14.0
	 */
	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLReservedSeatFlight(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, reservedSeat: INSeat, flight: INFlight): this;
}

/**
 * @since 15.0
 */
declare class INFocusStatus extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INFocusStatus; // inherited from NSObject

	static new(): INFocusStatus; // inherited from NSObject

	readonly isFocused: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { isFocused: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIsFocused(isFocused: number): this;
}

/**
 * @since 15.0
 */
declare const enum INFocusStatusAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

/**
 * @since 15.0
 */
declare class INFocusStatusCenter extends NSObject {

	static alloc(): INFocusStatusCenter; // inherited from NSObject

	static new(): INFocusStatusCenter; // inherited from NSObject

	readonly authorizationStatus: INFocusStatusAuthorizationStatus;

	readonly focusStatus: INFocusStatus;

	static readonly defaultCenter: INFocusStatusCenter;

	requestAuthorizationWithCompletionHandler(completionHandler: (p1: INFocusStatusAuthorizationStatus) => void): void;
}

/**
 * @since 10.0
 */
declare class INGetAvailableRestaurantReservationBookingDefaultsIntent extends INIntent {

	static alloc(): INGetAvailableRestaurantReservationBookingDefaultsIntent; // inherited from NSObject

	static new(): INGetAvailableRestaurantReservationBookingDefaultsIntent; // inherited from NSObject

	restaurant: INRestaurant;

	/**
	 * @since 11.0
	 */
	constructor(o: { restaurant: INRestaurant; });

	/**
	 * @since 11.0
	 */
	initWithRestaurant(restaurant: INRestaurant): this;
}

/**
 * @since 10.0
 */
interface INGetAvailableRestaurantReservationBookingDefaultsIntentHandling extends NSObjectProtocol {

	confirmGetAvailableRestaurantReservationBookingDefaultsCompletion?(intent: INGetAvailableRestaurantReservationBookingDefaultsIntent, completion: (p1: INGetAvailableRestaurantReservationBookingDefaultsIntentResponse) => void): void;

	handleGetAvailableRestaurantReservationBookingDefaultsCompletion(intent: INGetAvailableRestaurantReservationBookingDefaultsIntent, completion: (p1: INGetAvailableRestaurantReservationBookingDefaultsIntentResponse) => void): void;

	resolveRestaurantForGetAvailableRestaurantReservationBookingDefaultsWithCompletion?(intent: INGetAvailableRestaurantReservationBookingDefaultsIntent, completion: (p1: INRestaurantResolutionResult) => void): void;
}
declare var INGetAvailableRestaurantReservationBookingDefaultsIntentHandling: {

	prototype: INGetAvailableRestaurantReservationBookingDefaultsIntentHandling;
};

/**
 * @since 10.0
 */
declare class INGetAvailableRestaurantReservationBookingDefaultsIntentResponse extends INIntentResponse {

	static alloc(): INGetAvailableRestaurantReservationBookingDefaultsIntentResponse; // inherited from NSObject

	static new(): INGetAvailableRestaurantReservationBookingDefaultsIntentResponse; // inherited from NSObject

	readonly code: INGetAvailableRestaurantReservationBookingDefaultsIntentResponseCode;

	readonly defaultBookingDate: Date;

	readonly defaultPartySize: number;

	maximumPartySize: number;

	minimumPartySize: number;

	providerImage: INImage;

	constructor(o: { defaultPartySize: number; defaultBookingDate: Date; code: INGetAvailableRestaurantReservationBookingDefaultsIntentResponseCode; userActivity: NSUserActivity; });

	initWithDefaultPartySizeDefaultBookingDateCodeUserActivity(defaultPartySize: number, defaultBookingDate: Date, code: INGetAvailableRestaurantReservationBookingDefaultsIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INGetAvailableRestaurantReservationBookingDefaultsIntentResponseCode {

	Success = 0,

	Failure = 1,

	Unspecified = 2
}

/**
 * @since 10.0
 */
declare class INGetAvailableRestaurantReservationBookingsIntent extends INIntent implements NSCopying {

	static alloc(): INGetAvailableRestaurantReservationBookingsIntent; // inherited from NSObject

	static new(): INGetAvailableRestaurantReservationBookingsIntent; // inherited from NSObject

	earliestBookingDateForResults: Date;

	latestBookingDateForResults: Date;

	maximumNumberOfResults: number;

	partySize: number;

	preferredBookingDateComponents: NSDateComponents;

	restaurant: INRestaurant;

	/**
	 * @since 11.0
	 */
	constructor(o: { restaurant: INRestaurant; partySize: number; preferredBookingDateComponents: NSDateComponents; maximumNumberOfResults: number; earliestBookingDateForResults: Date; latestBookingDateForResults: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 11.0
	 */
	initWithRestaurantPartySizePreferredBookingDateComponentsMaximumNumberOfResultsEarliestBookingDateForResultsLatestBookingDateForResults(restaurant: INRestaurant, partySize: number, preferredBookingDateComponents: NSDateComponents, maximumNumberOfResults: number, earliestBookingDateForResults: Date, latestBookingDateForResults: Date): this;
}

declare const enum INGetAvailableRestaurantReservationBookingsIntentCode {

	Success = 0,

	Failure = 1,

	FailureRequestUnsatisfiable = 2,

	FailureRequestUnspecified = 3
}

/**
 * @since 10.0
 */
interface INGetAvailableRestaurantReservationBookingsIntentHandling extends NSObjectProtocol {

	confirmGetAvailableRestaurantReservationBookingsCompletion?(intent: INGetAvailableRestaurantReservationBookingsIntent, completion: (p1: INGetAvailableRestaurantReservationBookingsIntentResponse) => void): void;

	handleGetAvailableRestaurantReservationBookingsCompletion(intent: INGetAvailableRestaurantReservationBookingsIntent, completion: (p1: INGetAvailableRestaurantReservationBookingsIntentResponse) => void): void;

	resolvePartySizeForGetAvailableRestaurantReservationBookingsWithCompletion?(intent: INGetAvailableRestaurantReservationBookingsIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolvePreferredBookingDateComponentsForGetAvailableRestaurantReservationBookingsWithCompletion?(intent: INGetAvailableRestaurantReservationBookingsIntent, completion: (p1: INDateComponentsResolutionResult) => void): void;

	resolveRestaurantForGetAvailableRestaurantReservationBookingsWithCompletion?(intent: INGetAvailableRestaurantReservationBookingsIntent, completion: (p1: INRestaurantResolutionResult) => void): void;
}
declare var INGetAvailableRestaurantReservationBookingsIntentHandling: {

	prototype: INGetAvailableRestaurantReservationBookingsIntentHandling;
};

/**
 * @since 10.0
 */
declare class INGetAvailableRestaurantReservationBookingsIntentResponse extends INIntentResponse {

	static alloc(): INGetAvailableRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	static new(): INGetAvailableRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	readonly availableBookings: NSArray<INRestaurantReservationBooking>;

	readonly code: INGetAvailableRestaurantReservationBookingsIntentCode;

	localizedBookingAdvisementText: string;

	localizedRestaurantDescriptionText: string;

	termsAndConditions: INTermsAndConditions;

	constructor(o: { availableBookings: NSArray<INRestaurantReservationBooking> | INRestaurantReservationBooking[]; code: INGetAvailableRestaurantReservationBookingsIntentCode; userActivity: NSUserActivity; });

	initWithAvailableBookingsCodeUserActivity(availableBookings: NSArray<INRestaurantReservationBooking> | INRestaurantReservationBooking[], code: INGetAvailableRestaurantReservationBookingsIntentCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.3
 */
declare class INGetCarLockStatusIntent extends INIntent {

	static alloc(): INGetCarLockStatusIntent; // inherited from NSObject

	static new(): INGetCarLockStatusIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	constructor(o: { carName: INSpeakableString; });

	initWithCarName(carName: INSpeakableString): this;
}

/**
 * @since 10.3
 */
interface INGetCarLockStatusIntentHandling extends NSObjectProtocol {

	confirmGetCarLockStatusCompletion?(intent: INGetCarLockStatusIntent, completion: (p1: INGetCarLockStatusIntentResponse) => void): void;

	handleGetCarLockStatusCompletion(intent: INGetCarLockStatusIntent, completion: (p1: INGetCarLockStatusIntentResponse) => void): void;

	resolveCarNameForGetCarLockStatusWithCompletion?(intent: INGetCarLockStatusIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INGetCarLockStatusIntentHandling: {

	prototype: INGetCarLockStatusIntentHandling;
};

/**
 * @since 10.3
 */
declare class INGetCarLockStatusIntentResponse extends INIntentResponse {

	static alloc(): INGetCarLockStatusIntentResponse; // inherited from NSObject

	static new(): INGetCarLockStatusIntentResponse; // inherited from NSObject

	readonly code: INGetCarLockStatusIntentResponseCode;

	locked: number;

	constructor(o: { code: INGetCarLockStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetCarLockStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.3
 */
declare const enum INGetCarLockStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.3
 */
declare class INGetCarPowerLevelStatusIntent extends INIntent {

	static alloc(): INGetCarPowerLevelStatusIntent; // inherited from NSObject

	static new(): INGetCarPowerLevelStatusIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	constructor(o: { carName: INSpeakableString; });

	initWithCarName(carName: INSpeakableString): this;
}

/**
 * @since 10.3
 */
interface INGetCarPowerLevelStatusIntentHandling extends NSObjectProtocol {

	confirmGetCarPowerLevelStatusCompletion?(intent: INGetCarPowerLevelStatusIntent, completion: (p1: INGetCarPowerLevelStatusIntentResponse) => void): void;

	handleGetCarPowerLevelStatusCompletion(intent: INGetCarPowerLevelStatusIntent, completion: (p1: INGetCarPowerLevelStatusIntentResponse) => void): void;

	resolveCarNameForGetCarPowerLevelStatusWithCompletion?(intent: INGetCarPowerLevelStatusIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	/**
	 * @since 14.0
	 */
	startSendingUpdatesForGetCarPowerLevelStatusToObserver?(intent: INGetCarPowerLevelStatusIntent, observer: INGetCarPowerLevelStatusIntentResponseObserver): void;

	/**
	 * @since 14.0
	 */
	stopSendingUpdatesForGetCarPowerLevelStatus?(intent: INGetCarPowerLevelStatusIntent): void;
}
declare var INGetCarPowerLevelStatusIntentHandling: {

	prototype: INGetCarPowerLevelStatusIntentHandling;
};

/**
 * @since 10.3
 */
declare class INGetCarPowerLevelStatusIntentResponse extends INIntentResponse {

	static alloc(): INGetCarPowerLevelStatusIntentResponse; // inherited from NSObject

	static new(): INGetCarPowerLevelStatusIntentResponse; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	activeConnector: string;

	/**
	 * @since 14.0
	 */
	carIdentifier: string;

	chargePercentRemaining: number;

	/**
	 * @since 12.0
	 */
	charging: number;

	/**
	 * @since 14.0
	 */
	chargingFormulaArguments: NSDictionary<string, any>;

	readonly code: INGetCarPowerLevelStatusIntentResponseCode;

	/**
	 * @since 14.0
	 */
	consumptionFormulaArguments: NSDictionary<string, any>;

	/**
	 * @since 14.0
	 */
	currentBatteryCapacity: NSMeasurement<NSUnitEnergy>;

	/**
	 * @since 14.0
	 */
	dateOfLastStateUpdate: NSDateComponents;

	distanceRemaining: NSMeasurement<NSUnitLength>;

	/**
	 * @since 14.0
	 */
	distanceRemainingElectric: NSMeasurement<NSUnitLength>;

	/**
	 * @since 14.0
	 */
	distanceRemainingFuel: NSMeasurement<NSUnitLength>;

	fuelPercentRemaining: number;

	/**
	 * @since 14.0
	 */
	maximumBatteryCapacity: NSMeasurement<NSUnitEnergy>;

	/**
	 * @since 14.0
	 */
	maximumDistance: NSMeasurement<NSUnitLength>;

	/**
	 * @since 14.0
	 */
	maximumDistanceElectric: NSMeasurement<NSUnitLength>;

	/**
	 * @since 14.0
	 */
	maximumDistanceFuel: NSMeasurement<NSUnitLength>;

	/**
	 * @since 14.0
	 */
	minimumBatteryCapacity: NSMeasurement<NSUnitEnergy>;

	/**
	 * @since 12.0
	 */
	minutesToFull: number;

	constructor(o: { code: INGetCarPowerLevelStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetCarPowerLevelStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.3
 */
declare const enum INGetCarPowerLevelStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 14.0
 */
interface INGetCarPowerLevelStatusIntentResponseObserver extends NSObjectProtocol {

	getCarPowerLevelStatusResponseDidUpdate(response: INGetCarPowerLevelStatusIntentResponse): void;
}
declare var INGetCarPowerLevelStatusIntentResponseObserver: {

	prototype: INGetCarPowerLevelStatusIntentResponseObserver;
};

/**
 * @since 13.0
 */
declare class INGetReservationDetailsIntent extends INIntent {

	static alloc(): INGetReservationDetailsIntent; // inherited from NSObject

	static new(): INGetReservationDetailsIntent; // inherited from NSObject

	readonly reservationContainerReference: INSpeakableString;

	readonly reservationItemReferences: NSArray<INSpeakableString>;

	constructor(o: { reservationContainerReference: INSpeakableString; reservationItemReferences: NSArray<INSpeakableString> | INSpeakableString[]; });

	initWithReservationContainerReferenceReservationItemReferences(reservationContainerReference: INSpeakableString, reservationItemReferences: NSArray<INSpeakableString> | INSpeakableString[]): this;
}

/**
 * @since 13.0
 */
declare class INGetReservationDetailsIntentResponse extends INIntentResponse {

	static alloc(): INGetReservationDetailsIntentResponse; // inherited from NSObject

	static new(): INGetReservationDetailsIntentResponse; // inherited from NSObject

	readonly code: INGetReservationDetailsIntentResponseCode;

	reservations: NSArray<INReservation>;

	constructor(o: { code: INGetReservationDetailsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetReservationDetailsIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 */
declare const enum INGetReservationDetailsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 */
declare class INGetRestaurantGuestIntent extends INIntent {

	static alloc(): INGetRestaurantGuestIntent; // inherited from NSObject

	static new(): INGetRestaurantGuestIntent; // inherited from NSObject
}

/**
 * @since 10.0
 */
interface INGetRestaurantGuestIntentHandling extends NSObjectProtocol {

	confirmGetRestaurantGuestCompletion?(guestIntent: INGetRestaurantGuestIntent, completion: (p1: INGetRestaurantGuestIntentResponse) => void): void;

	handleGetRestaurantGuestCompletion(intent: INGetRestaurantGuestIntent, completion: (p1: INGetRestaurantGuestIntentResponse) => void): void;
}
declare var INGetRestaurantGuestIntentHandling: {

	prototype: INGetRestaurantGuestIntentHandling;
};

/**
 * @since 10.0
 */
declare class INGetRestaurantGuestIntentResponse extends INIntentResponse {

	static alloc(): INGetRestaurantGuestIntentResponse; // inherited from NSObject

	static new(): INGetRestaurantGuestIntentResponse; // inherited from NSObject

	readonly code: INGetRestaurantGuestIntentResponseCode;

	guest: INRestaurantGuest;

	guestDisplayPreferences: INRestaurantGuestDisplayPreferences;

	constructor(o: { code: INGetRestaurantGuestIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetRestaurantGuestIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INGetRestaurantGuestIntentResponseCode {

	Success = 0,

	Failure = 1
}

/**
 * @since 10.0
 */
declare class INGetRideStatusIntent extends INIntent {

	static alloc(): INGetRideStatusIntent; // inherited from NSObject

	static new(): INGetRideStatusIntent; // inherited from NSObject
}

/**
 * @since 10.0
 */
interface INGetRideStatusIntentHandling extends NSObjectProtocol {

	confirmGetRideStatusCompletion?(intent: INGetRideStatusIntent, completion: (p1: INGetRideStatusIntentResponse) => void): void;

	handleGetRideStatusCompletion(intent: INGetRideStatusIntent, completion: (p1: INGetRideStatusIntentResponse) => void): void;

	startSendingUpdatesForGetRideStatusToObserver(intent: INGetRideStatusIntent, observer: INGetRideStatusIntentResponseObserver): void;

	stopSendingUpdatesForGetRideStatus(intent: INGetRideStatusIntent): void;
}
declare var INGetRideStatusIntentHandling: {

	prototype: INGetRideStatusIntentHandling;
};

/**
 * @since 10.0
 */
declare var INGetRideStatusIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INGetRideStatusIntentResponse extends INIntentResponse {

	static alloc(): INGetRideStatusIntentResponse; // inherited from NSObject

	static new(): INGetRideStatusIntentResponse; // inherited from NSObject

	readonly code: INGetRideStatusIntentResponseCode;

	rideStatus: INRideStatus;

	constructor(o: { code: INGetRideStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetRideStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INGetRideStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureRequiringAppLaunchMustVerifyCredentials = 6,

	FailureRequiringAppLaunchServiceTemporarilyUnavailable = 7
}

/**
 * @since 10.0
 */
interface INGetRideStatusIntentResponseObserver extends NSObjectProtocol {

	getRideStatusResponseDidUpdate(response: INGetRideStatusIntentResponse): void;
}
declare var INGetRideStatusIntentResponseObserver: {

	prototype: INGetRideStatusIntentResponseObserver;
};

/**
 * @since 10.0
 */
declare class INGetUserCurrentRestaurantReservationBookingsIntent extends INIntent implements NSCopying {

	static alloc(): INGetUserCurrentRestaurantReservationBookingsIntent; // inherited from NSObject

	static new(): INGetUserCurrentRestaurantReservationBookingsIntent; // inherited from NSObject

	earliestBookingDateForResults: Date;

	maximumNumberOfResults: number;

	reservationIdentifier: string;

	restaurant: INRestaurant;

	/**
	 * @since 11.0
	 */
	constructor(o: { restaurant: INRestaurant; reservationIdentifier: string; maximumNumberOfResults: number; earliestBookingDateForResults: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 11.0
	 */
	initWithRestaurantReservationIdentifierMaximumNumberOfResultsEarliestBookingDateForResults(restaurant: INRestaurant, reservationIdentifier: string, maximumNumberOfResults: number, earliestBookingDateForResults: Date): this;
}

/**
 * @since 10.0
 */
interface INGetUserCurrentRestaurantReservationBookingsIntentHandling extends NSObjectProtocol {

	confirmGetUserCurrentRestaurantReservationBookingsCompletion?(intent: INGetUserCurrentRestaurantReservationBookingsIntent, completion: (p1: INGetUserCurrentRestaurantReservationBookingsIntentResponse) => void): void;

	handleGetUserCurrentRestaurantReservationBookingsCompletion(intent: INGetUserCurrentRestaurantReservationBookingsIntent, completion: (p1: INGetUserCurrentRestaurantReservationBookingsIntentResponse) => void): void;

	resolveRestaurantForGetUserCurrentRestaurantReservationBookingsWithCompletion?(intent: INGetUserCurrentRestaurantReservationBookingsIntent, completion: (p1: INRestaurantResolutionResult) => void): void;
}
declare var INGetUserCurrentRestaurantReservationBookingsIntentHandling: {

	prototype: INGetUserCurrentRestaurantReservationBookingsIntentHandling;
};

/**
 * @since 10.0
 */
declare class INGetUserCurrentRestaurantReservationBookingsIntentResponse extends INIntentResponse {

	static alloc(): INGetUserCurrentRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	static new(): INGetUserCurrentRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	readonly code: INGetUserCurrentRestaurantReservationBookingsIntentResponseCode;

	userCurrentBookings: NSArray<INRestaurantReservationUserBooking>;

	constructor(o: { userCurrentBookings: NSArray<INRestaurantReservationUserBooking> | INRestaurantReservationUserBooking[]; code: INGetUserCurrentRestaurantReservationBookingsIntentResponseCode; userActivity: NSUserActivity; });

	initWithUserCurrentBookingsCodeUserActivity(userCurrentBookings: NSArray<INRestaurantReservationUserBooking> | INRestaurantReservationUserBooking[], code: INGetUserCurrentRestaurantReservationBookingsIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INGetUserCurrentRestaurantReservationBookingsIntentResponseCode {

	Success = 0,

	Failure = 1,

	FailureRequestUnsatisfiable = 2,

	Unspecified = 3
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INGetVisualCodeIntent extends INIntent {

	static alloc(): INGetVisualCodeIntent; // inherited from NSObject

	static new(): INGetVisualCodeIntent; // inherited from NSObject

	readonly visualCodeType: INVisualCodeType;

	constructor(o: { visualCodeType: INVisualCodeType; });

	initWithVisualCodeType(visualCodeType: INVisualCodeType): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
interface INGetVisualCodeIntentHandling extends NSObjectProtocol {

	confirmGetVisualCodeCompletion?(intent: INGetVisualCodeIntent, completion: (p1: INGetVisualCodeIntentResponse) => void): void;

	handleGetVisualCodeCompletion(intent: INGetVisualCodeIntent, completion: (p1: INGetVisualCodeIntentResponse) => void): void;

	resolveVisualCodeTypeForGetVisualCodeWithCompletion?(intent: INGetVisualCodeIntent, completion: (p1: INVisualCodeTypeResolutionResult) => void): void;
}
declare var INGetVisualCodeIntentHandling: {

	prototype: INGetVisualCodeIntentHandling;
};

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INGetVisualCodeIntentResponse extends INIntentResponse {

	static alloc(): INGetVisualCodeIntentResponse; // inherited from NSObject

	static new(): INGetVisualCodeIntentResponse; // inherited from NSObject

	readonly code: INGetVisualCodeIntentResponseCode;

	visualCodeImage: INImage;

	constructor(o: { code: INGetVisualCodeIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetVisualCodeIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare const enum INGetVisualCodeIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	InProgress = 3,

	Success = 4,

	Failure = 5,

	FailureRequiringAppLaunch = 6,

	FailureAppConfigurationRequired = 7
}

/**
 * @since 16.2
 */
declare class INHangUpCallIntent extends INIntent {

	static alloc(): INHangUpCallIntent; // inherited from NSObject

	static new(): INHangUpCallIntent; // inherited from NSObject

	readonly callIdentifier: string;

	/**
	 * @since 16.2
	 */
	constructor(o: { callIdentifier: string; });

	/**
	 * @since 16.2
	 */
	initWithCallIdentifier(callIdentifier: string): this;
}

/**
 * @since 16.2
 */
interface INHangUpCallIntentHandling extends NSObjectProtocol {

	confirmHangUpCallCompletion?(intent: INHangUpCallIntent, completion: (p1: INHangUpCallIntentResponse) => void): void;

	handleHangUpCallCompletion(intent: INHangUpCallIntent, completion: (p1: INHangUpCallIntentResponse) => void): void;
}
declare var INHangUpCallIntentHandling: {

	prototype: INHangUpCallIntentHandling;
};

/**
 * @since 16.2
 */
declare var INHangUpCallIntentIdentifier: string;

/**
 * @since 16.2
 */
declare class INHangUpCallIntentResponse extends INIntentResponse {

	static alloc(): INHangUpCallIntentResponse; // inherited from NSObject

	static new(): INHangUpCallIntentResponse; // inherited from NSObject

	readonly code: INHangUpCallIntentResponseCode;

	constructor(o: { code: INHangUpCallIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INHangUpCallIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 16.2
 */
declare const enum INHangUpCallIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureNoCallToHangUp = 6
}

/**
 * @since 10.0
 */
declare class INImage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INImage; // inherited from NSObject

	static imageNamed(name: string): INImage;

	/**
	 * @since 10.0
	 */
	static imageSizeForIntentResponse(response: INIntentResponse): CGSize;

	/**
	 * @since 10.0
	 */
	static imageWithCGImage(imageRef: any): INImage;

	static imageWithImageData(imageData: NSData): INImage;

	/**
	 * @since 10.0
	 */
	static imageWithUIImage(image: UIImage): INImage;

	static imageWithURL(URL: NSURL): INImage;

	/**
	 * @since 11.0
	 */
	static imageWithURLWidthHeight(URL: NSURL, width: number, height: number): INImage;

	static new(): INImage; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	static systemImageNamed(systemImageName: string): INImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 11.0
	 */
	fetchUIImageWithCompletion(completion: (p1: UIImage) => void): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class INImageNoteContent extends INNoteContent implements NSCopying, NSSecureCoding {

	static alloc(): INImageNoteContent; // inherited from NSObject

	static new(): INImageNoteContent; // inherited from NSObject

	readonly image: INImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { image: INImage; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithImage(image: INImage): this;
}

/**
 * @since 10.0
 */
declare class INIntegerResolutionResult extends INIntentResolutionResult {

	static alloc(): INIntegerResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INIntegerResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INIntegerResolutionResult;

	static needsValue(): INIntegerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INIntegerResolutionResult; // inherited from NSObject

	static notRequired(): INIntegerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: number): INIntegerResolutionResult;

	static unsupported(): INIntegerResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INIntegerResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INIntent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INIntent; // inherited from NSObject

	static new(): INIntent; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	donationMetadata: INIntentDonationMetadata;

	readonly identifier: string;

	/**
	 * @since 11.0
	 */
	readonly intentDescription: string;

	/**
	 * @since 14.0
	 */
	shortcutAvailability: INShortcutAvailabilityOptions;

	/**
	 * @since 12.0
	 */
	suggestedInvocationPhrase: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 12.0
	 */
	imageForParameterNamed(parameterName: string): INImage;

	initWithCoder(coder: NSCoder): this;

	keyImage(): INImage;

	/**
	 * @since 12.0
	 */
	setImageForParameterNamed(image: INImage, parameterName: string): void;
}

/**
 * @since 15.0
 */
declare class INIntentDonationMetadata extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INIntentDonationMetadata; // inherited from NSObject

	static new(): INIntentDonationMetadata; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare const enum INIntentErrorCode {

	InteractionOperationNotSupported = 1900,

	DonatingInteraction = 1901,

	DeletingAllInteractions = 1902,

	DeletingInteractionWithIdentifiers = 1903,

	DeletingInteractionWithGroupIdentifier = 1904,

	IntentSupportedByMultipleExtension = 2001,

	RestrictedIntentsNotSupportedByExtension = 2002,

	NoHandlerProvidedForIntent = 2003,

	InvalidIntentName = 2004,

	NoAppAvailable = 2005,

	RequestTimedOut = 3001,

	MissingInformation = 3002,

	InvalidUserVocabularyFileLocation = 4000,

	ExtensionLaunchingTimeout = 5000,

	ExtensionBringUpFailed = 5001,

	ImageGeneric = 6000,

	ImageNoServiceAvailable = 6001,

	ImageStorageFailed = 6002,

	ImageLoadingFailed = 6003,

	ImageRetrievalFailed = 6004,

	ImageProxyLoop = 6005,

	ImageProxyInvalid = 6006,

	ImageProxyTimeout = 6007,

	ImageServiceFailure = 6008,

	ImageScalingFailed = 6009,

	PermissionDenied = 6010,

	VoiceShortcutCreationFailed = 7000,

	VoiceShortcutGetFailed = 7001,

	VoiceShortcutDeleteFailed = 7002,

	EncodingGeneric = 8000,

	EncodingFailed = 8001,

	DecodingGeneric = 9000,

	UnableToCreateAppIntentRepresentation = 10000,

	NoAppIntent = 10001
}

/**
 * @since 10.0
 */
declare var INIntentErrorDomain: string;

/**
 * @since 10.0
 */
interface INIntentHandlerProviding extends NSObjectProtocol {

	handlerForIntent(intent: INIntent): any;
}
declare var INIntentHandlerProviding: {

	prototype: INIntentHandlerProviding;
};

/**
 * @since 10.0
 */
declare const enum INIntentHandlingStatus {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	DeferredToApplication = 5,

	UserConfirmationRequired = 6
}

/**
 * @since 10.0
 */
declare class INIntentResolutionResult extends NSObject {

	static alloc(): INIntentResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INIntentResolutionResult;

	static needsValue(): INIntentResolutionResult;

	static new(): INIntentResolutionResult; // inherited from NSObject

	static notRequired(): INIntentResolutionResult;

	static unsupported(): INIntentResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INIntentResolutionResult;
}

/**
 * @since 10.0
 */
declare class INIntentResponse extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INIntentResponse; // inherited from NSObject

	static new(): INIntentResponse; // inherited from NSObject

	userActivity: NSUserActivity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class INInteraction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INInteraction; // inherited from NSObject

	static deleteAllInteractionsWithCompletion(completion: (p1: NSError) => void): void;

	static deleteInteractionsWithGroupIdentifierCompletion(groupIdentifier: string, completion: (p1: NSError) => void): void;

	static deleteInteractionsWithIdentifiersCompletion(identifiers: NSArray<string> | string[], completion: (p1: NSError) => void): void;

	static new(): INInteraction; // inherited from NSObject

	dateInterval: NSDateInterval;

	direction: INInteractionDirection;

	groupIdentifier: string;

	identifier: string;

	readonly intent: INIntent;

	readonly intentHandlingStatus: INIntentHandlingStatus;

	readonly intentResponse: INIntentResponse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { intent: INIntent; response: INIntentResponse; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	donateInteractionWithCompletion(completion: (p1: NSError) => void): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIntentResponse(intent: INIntent, response: INIntentResponse): this;

	/**
	 * @since 11.0
	 */
	parameterValueForParameter(parameter: INParameter): any;
}

/**
 * @since 10.0
 */
declare const enum INInteractionDirection {

	Unspecified = 0,

	Outgoing = 1,

	Incoming = 2
}

/**
 * @since 13.0
 */
declare class INLengthResolutionResult extends INIntentResolutionResult {

	static alloc(): INLengthResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INLengthResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithLengthToConfirm(lengthToConfirm: NSMeasurement<NSUnitLength>): INLengthResolutionResult;

	static disambiguationWithLengthsToDisambiguate(lengthsToDisambiguate: NSArray<NSMeasurement<NSUnitLength>> | NSMeasurement<NSUnitLength>[]): INLengthResolutionResult;

	static needsValue(): INLengthResolutionResult; // inherited from INIntentResolutionResult

	static new(): INLengthResolutionResult; // inherited from NSObject

	static notRequired(): INLengthResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedLength(resolvedLength: NSMeasurement<NSUnitLength>): INLengthResolutionResult;

	static unsupported(): INLengthResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INLengthResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.0
 */
declare class INListCarsIntent extends INIntent {

	static alloc(): INListCarsIntent; // inherited from NSObject

	static new(): INListCarsIntent; // inherited from NSObject
}

/**
 * @since 14.0
 */
interface INListCarsIntentHandling extends NSObjectProtocol {

	confirmListCarsCompletion?(intent: INListCarsIntent, completion: (p1: INListCarsIntentResponse) => void): void;

	handleListCarsCompletion(intent: INListCarsIntent, completion: (p1: INListCarsIntentResponse) => void): void;
}
declare var INListCarsIntentHandling: {

	prototype: INListCarsIntentHandling;
};

/**
 * @since 14.0
 */
declare class INListCarsIntentResponse extends INIntentResponse {

	static alloc(): INListCarsIntentResponse; // inherited from NSObject

	static new(): INListCarsIntentResponse; // inherited from NSObject

	cars: NSArray<INCar>;

	readonly code: INListCarsIntentResponseCode;

	constructor(o: { code: INListCarsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INListCarsIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 14.0
 */
declare const enum INListCarsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 */
declare class INListRideOptionsIntent extends INIntent {

	static alloc(): INListRideOptionsIntent; // inherited from NSObject

	static new(): INListRideOptionsIntent; // inherited from NSObject

	readonly dropOffLocation: CLPlacemark;

	readonly pickupLocation: CLPlacemark;

	constructor(o: { pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; });

	initWithPickupLocationDropOffLocation(pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark): this;
}

/**
 * @since 10.0
 */
interface INListRideOptionsIntentHandling extends NSObjectProtocol {

	confirmListRideOptionsCompletion?(intent: INListRideOptionsIntent, completion: (p1: INListRideOptionsIntentResponse) => void): void;

	handleListRideOptionsCompletion(intent: INListRideOptionsIntent, completion: (p1: INListRideOptionsIntentResponse) => void): void;

	resolveDropOffLocationForListRideOptionsWithCompletion?(intent: INListRideOptionsIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePickupLocationForListRideOptionsWithCompletion?(intent: INListRideOptionsIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;
}
declare var INListRideOptionsIntentHandling: {

	prototype: INListRideOptionsIntentHandling;
};

/**
 * @since 10.0
 */
declare var INListRideOptionsIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INListRideOptionsIntentResponse extends INIntentResponse {

	static alloc(): INListRideOptionsIntentResponse; // inherited from NSObject

	static new(): INListRideOptionsIntentResponse; // inherited from NSObject

	readonly code: INListRideOptionsIntentResponseCode;

	expirationDate: Date;

	paymentMethods: NSArray<INPaymentMethod>;

	rideOptions: NSArray<INRideOption>;

	constructor(o: { code: INListRideOptionsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INListRideOptionsIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INListRideOptionsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureRequiringAppLaunchMustVerifyCredentials = 6,

	FailureRequiringAppLaunchNoServiceInArea = 7,

	FailureRequiringAppLaunchServiceTemporarilyUnavailable = 8,

	FailureRequiringAppLaunchPreviousRideNeedsCompletion = 9,

	FailurePreviousRideNeedsFeedback = 10
}

/**
 * @since 12.0
 */
declare class INLocationRelevanceProvider extends INRelevanceProvider {

	static alloc(): INLocationRelevanceProvider; // inherited from NSObject

	static new(): INLocationRelevanceProvider; // inherited from NSObject

	readonly region: CLRegion;

	constructor(o: { region: CLRegion; });

	initWithRegion(region: CLRegion): this;
}

/**
 * @since 11.0
 */
declare const enum INLocationSearchType {

	Unknown = 0,

	ByLocationTrigger = 1
}

/**
 * @since 11.0
 */
declare class INLocationSearchTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INLocationSearchTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithLocationSearchTypeToConfirm(locationSearchTypeToConfirm: INLocationSearchType): INLocationSearchTypeResolutionResult;

	static needsValue(): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INLocationSearchTypeResolutionResult; // inherited from NSObject

	static notRequired(): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedLocationSearchType(resolvedLocationSearchType: INLocationSearchType): INLocationSearchTypeResolutionResult;

	static unsupported(): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare class INLodgingReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INLodgingReservation; // inherited from NSObject

	static new(): INLodgingReservation; // inherited from NSObject

	readonly lodgingBusinessLocation: CLPlacemark;

	readonly numberOfAdults: number;

	readonly numberOfChildren: number;

	readonly reservationDuration: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; lodgingBusinessLocation: CLPlacemark; reservationDuration: INDateComponentsRange; numberOfAdults: number; numberOfChildren: number; });

	/**
	 * @since 14.0
	 */
	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; lodgingBusinessLocation: CLPlacemark; reservationDuration: INDateComponentsRange; numberOfAdults: number; numberOfChildren: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsLodgingBusinessLocationReservationDurationNumberOfAdultsNumberOfChildren(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], lodgingBusinessLocation: CLPlacemark, reservationDuration: INDateComponentsRange, numberOfAdults: number, numberOfChildren: number): this;

	/**
	 * @since 14.0
	 */
	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLLodgingBusinessLocationReservationDurationNumberOfAdultsNumberOfChildren(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, lodgingBusinessLocation: CLPlacemark, reservationDuration: INDateComponentsRange, numberOfAdults: number, numberOfChildren: number): this;
}

/**
 * @since 13.0
 */
declare class INMassResolutionResult extends INIntentResolutionResult {

	static alloc(): INMassResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INMassResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMassToConfirm(massToConfirm: NSMeasurement<NSUnitMass>): INMassResolutionResult;

	static disambiguationWithMassToDisambiguate(massToDisambiguate: NSArray<NSMeasurement<NSUnitMass>> | NSMeasurement<NSUnitMass>[]): INMassResolutionResult;

	static needsValue(): INMassResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMassResolutionResult; // inherited from NSObject

	static notRequired(): INMassResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMass(resolvedMass: NSMeasurement<NSUnitMass>): INMassResolutionResult;

	static unsupported(): INMassResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INMassResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare const enum INMediaAffinityType {

	Unknown = 0,

	Like = 1,

	Dislike = 2
}

/**
 * @since 13.0
 */
declare class INMediaAffinityTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INMediaAffinityTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INMediaAffinityTypeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaAffinityTypeToConfirm(mediaAffinityTypeToConfirm: INMediaAffinityType): INMediaAffinityTypeResolutionResult;

	static needsValue(): INMediaAffinityTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMediaAffinityTypeResolutionResult; // inherited from NSObject

	static notRequired(): INMediaAffinityTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaAffinityType(resolvedMediaAffinityType: INMediaAffinityType): INMediaAffinityTypeResolutionResult;

	static unsupported(): INMediaAffinityTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INMediaAffinityTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare class INMediaDestination extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMediaDestination; // inherited from NSObject

	static libraryDestination(): INMediaDestination;

	static new(): INMediaDestination; // inherited from NSObject

	static playlistDestinationWithName(playlistName: string): INMediaDestination;

	readonly mediaDestinationType: INMediaDestinationType;

	readonly playlistName: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class INMediaDestinationResolutionResult extends INIntentResolutionResult {

	static alloc(): INMediaDestinationResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaDestinationToConfirm(mediaDestinationToConfirm: INMediaDestination): INMediaDestinationResolutionResult;

	static disambiguationWithMediaDestinationsToDisambiguate(mediaDestinationsToDisambiguate: NSArray<INMediaDestination> | INMediaDestination[]): INMediaDestinationResolutionResult;

	static needsValue(): INMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMediaDestinationResolutionResult; // inherited from NSObject

	static notRequired(): INMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaDestination(resolvedMediaDestination: INMediaDestination): INMediaDestinationResolutionResult;

	static unsupported(): INMediaDestinationResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INMediaDestinationResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare const enum INMediaDestinationType {

	Unknown = 0,

	Library = 1,

	Playlist = 2
}

/**
 * @since 12.0
 */
declare class INMediaItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMediaItem; // inherited from NSObject

	static new(): INMediaItem; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly artist: string;

	readonly artwork: INImage;

	readonly identifier: string;

	readonly title: string;

	readonly type: INMediaItemType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; title: string; type: INMediaItemType; artwork: INImage; });

	/**
	 * @since 13.0
	 */
	constructor(o: { identifier: string; title: string; type: INMediaItemType; artwork: INImage; artist: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierTitleTypeArtwork(identifier: string, title: string, type: INMediaItemType, artwork: INImage): this;

	/**
	 * @since 13.0
	 */
	initWithIdentifierTitleTypeArtworkArtist(identifier: string, title: string, type: INMediaItemType, artwork: INImage, artist: string): this;
}

/**
 * @since 12.0
 */
declare class INMediaItemResolutionResult extends INIntentResolutionResult {

	static alloc(): INMediaItemResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaItemToConfirm(mediaItemToConfirm: INMediaItem): INMediaItemResolutionResult;

	static disambiguationWithMediaItemsToDisambiguate(mediaItemsToDisambiguate: NSArray<INMediaItem> | INMediaItem[]): INMediaItemResolutionResult;

	static needsValue(): INMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMediaItemResolutionResult; // inherited from NSObject

	static notRequired(): INMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaItem(resolvedMediaItem: INMediaItem): INMediaItemResolutionResult;

	static successesWithResolvedMediaItems(resolvedMediaItems: NSArray<INMediaItem> | INMediaItem[]): NSArray<INMediaItemResolutionResult>;

	static unsupported(): INMediaItemResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INMediaItemResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 12.0
 */
declare const enum INMediaItemType {

	Unknown = 0,

	Song = 1,

	Album = 2,

	Artist = 3,

	Genre = 4,

	Playlist = 5,

	PodcastShow = 6,

	PodcastEpisode = 7,

	PodcastPlaylist = 8,

	MusicStation = 9,

	AudioBook = 10,

	Movie = 11,

	TVShow = 12,

	TVShowEpisode = 13,

	MusicVideo = 14,

	PodcastStation = 15,

	RadioStation = 16,

	Station = 17,

	Music = 18,

	AlgorithmicRadioStation = 19,

	News = 20
}

/**
 * @since 13.0
 */
declare const enum INMediaReference {

	Unknown = 0,

	CurrentlyPlaying = 1,

	My = 2
}

/**
 * @since 13.0
 */
declare class INMediaSearch extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMediaSearch; // inherited from NSObject

	static new(): INMediaSearch; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 13.0
	 */
	readonly activityNames: NSArray<string>;

	readonly albumName: string;

	readonly artistName: string;

	readonly genreNames: NSArray<string>;

	readonly mediaIdentifier: string;

	readonly mediaName: string;

	readonly mediaType: INMediaItemType;

	readonly moodNames: NSArray<string>;

	readonly reference: INMediaReference;

	readonly releaseDate: INDateComponentsRange;

	readonly sortOrder: INMediaSortOrder;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { mediaType: INMediaItemType; sortOrder: INMediaSortOrder; mediaName: string; artistName: string; albumName: string; genreNames: NSArray<string> | string[]; moodNames: NSArray<string> | string[]; releaseDate: INDateComponentsRange; reference: INMediaReference; mediaIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithMediaTypeSortOrderMediaNameArtistNameAlbumNameGenreNamesMoodNamesReleaseDateReferenceMediaIdentifier(mediaType: INMediaItemType, sortOrder: INMediaSortOrder, mediaName: string, artistName: string, albumName: string, genreNames: NSArray<string> | string[], moodNames: NSArray<string> | string[], releaseDate: INDateComponentsRange, reference: INMediaReference, mediaIdentifier: string): this;
}

/**
 * @since 13.0
 */
declare const enum INMediaSortOrder {

	Unknown = 0,

	Newest = 1,

	Oldest = 2,

	Best = 3,

	Worst = 4,

	Popular = 5,

	Unpopular = 6,

	Trending = 7,

	Recommended = 8
}

/**
 * @since 13.0
 */
declare class INMediaUserContext extends INUserContext {

	static alloc(): INMediaUserContext; // inherited from NSObject

	static new(): INMediaUserContext; // inherited from NSObject

	numberOfLibraryItems: number;

	subscriptionStatus: INMediaUserContextSubscriptionStatus;
}

/**
 * @since 13.0
 */
declare const enum INMediaUserContextSubscriptionStatus {

	Unknown = 0,

	NotSubscribed = 1,

	Subscribed = 2
}

/**
 * @since 10.0
 */
declare class INMessage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMessage; // inherited from NSObject

	static new(): INMessage; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	readonly attachmentFiles: NSArray<INFile>;

	/**
	 * @since 16.0
	 * @deprecated 17.0
	 */
	readonly audioMessageFile: INFile;

	readonly content: string;

	/**
	 * @since 11.0
	 */
	readonly conversationIdentifier: string;

	readonly dateSent: Date;

	/**
	 * @since 11.0
	 */
	readonly groupName: INSpeakableString;

	readonly identifier: string;

	/**
	 * @since 17.0
	 */
	readonly linkMetadata: INMessageLinkMetadata;

	/**
	 * @since 11.0
	 */
	readonly messageType: INMessageType;

	/**
	 * @since 17.0
	 */
	readonly numberOfAttachments: number;

	/**
	 * @since 18.0
	 */
	reaction: INMessageReaction;

	readonly recipients: NSArray<INPerson>;

	readonly sender: INPerson;

	/**
	 * @since 13.2
	 */
	readonly serviceName: string;

	/**
	 * @since 18.0
	 */
	sticker: INSticker;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; });

	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; messageType: INMessageType; });

	/**
	 * @since 13.2
	 */
	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; messageType: INMessageType; serviceName: string; });

	/**
	 * @since 17.0
	 */
	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; messageType: INMessageType; serviceName: string; attachmentFiles: NSArray<INFile> | INFile[]; });

	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; messageType: INMessageType; serviceName: string; audioMessageFile: INFile; });

	/**
	 * @since 17.0
	 */
	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; serviceName: string; linkMetadata: INMessageLinkMetadata; });

	/**
	 * @since 17.0
	 */
	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; serviceName: string; messageType: INMessageType; numberOfAttachments: number; });

	/**
	 * @since 18.0
	 */
	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; serviceName: string; messageType: INMessageType; referencedMessage: INMessage; reaction: INMessageReaction; });

	/**
	 * @since 18.0
	 */
	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; groupName: INSpeakableString; serviceName: string; messageType: INMessageType; referencedMessage: INMessage; sticker: INSticker; reaction: INMessageReaction; });

	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson> | INPerson[]; messageType: INMessageType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierContentDateSentSenderRecipients(identifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[]): this;

	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameMessageType(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, messageType: INMessageType): this;

	/**
	 * @since 13.2
	 */
	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameMessageTypeServiceName(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, messageType: INMessageType, serviceName: string): this;

	/**
	 * @since 17.0
	 */
	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameMessageTypeServiceNameAttachmentFiles(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, messageType: INMessageType, serviceName: string, attachmentFiles: NSArray<INFile> | INFile[]): this;

	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameMessageTypeServiceNameAudioMessageFile(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, messageType: INMessageType, serviceName: string, audioMessageFile: INFile): this;

	/**
	 * @since 17.0
	 */
	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameServiceNameLinkMetadata(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, serviceName: string, linkMetadata: INMessageLinkMetadata): this;

	/**
	 * @since 17.0
	 */
	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameServiceNameMessageTypeNumberOfAttachments(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, serviceName: string, messageType: INMessageType, numberOfAttachments: number): this;

	/**
	 * @since 18.0
	 */
	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameServiceNameMessageTypeReferencedMessageReaction(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, serviceName: string, messageType: INMessageType, referencedMessage: INMessage, reaction: INMessageReaction): this;

	/**
	 * @since 18.0
	 */
	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameServiceNameMessageTypeReferencedMessageStickerReaction(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], groupName: INSpeakableString, serviceName: string, messageType: INMessageType, referencedMessage: INMessage, sticker: INSticker, reaction: INMessageReaction): this;

	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsMessageType(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson> | INPerson[], messageType: INMessageType): this;
}

/**
 * @since 10.0
 */
declare const enum INMessageAttribute {

	Unknown = 0,

	Read = 1,

	Unread = 2,

	Flagged = 3,

	Unflagged = 4,

	Played = 5
}

/**
 * @since 10.0
 */
declare const enum INMessageAttributeOptions {

	Read = 1,

	Unread = 2,

	Flagged = 4,

	Unflagged = 8,

	Played = 16
}

/**
 * @since 10.0
 */
declare class INMessageAttributeOptionsResolutionResult extends INIntentResolutionResult {

	static alloc(): INMessageAttributeOptionsResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMessageAttributeOptionsToConfirm(messageAttributeOptionsToConfirm: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static needsValue(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMessageAttributeOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMessageAttributeOptions(resolvedMessageAttributeOptions: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static unsupported(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INMessageAttributeResolutionResult extends INIntentResolutionResult {

	static alloc(): INMessageAttributeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMessageAttributeToConfirm(messageAttributeToConfirm: INMessageAttribute): INMessageAttributeResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INMessageAttribute): INMessageAttributeResolutionResult;

	static needsValue(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMessageAttributeResolutionResult; // inherited from NSObject

	static notRequired(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMessageAttribute(resolvedMessageAttribute: INMessageAttribute): INMessageAttributeResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INMessageAttribute): INMessageAttributeResolutionResult;

	static unsupported(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 17.0
 */
declare class INMessageLinkMetadata extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMessageLinkMetadata; // inherited from NSObject

	static new(): INMessageLinkMetadata; // inherited from NSObject

	linkURL: NSURL;

	openGraphType: string;

	siteName: string;

	summary: string;

	title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { siteName: string; summary: string; title: string; openGraphType: string; linkURL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSiteNameSummaryTitleOpenGraphTypeLinkURL(siteName: string, summary: string, title: string, openGraphType: string, linkURL: NSURL): this;
}

/**
 * @since 18.0
 */
declare class INMessageReaction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMessageReaction; // inherited from NSObject

	static new(): INMessageReaction; // inherited from NSObject

	readonly emoji: string;

	readonly reactionDescription: string;

	readonly reactionType: INMessageReactionType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { reactionType: INMessageReactionType; reactionDescription: string; emoji: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithReactionTypeReactionDescriptionEmoji(reactionType: INMessageReactionType, reactionDescription: string, emoji: string): this;
}

/**
 * @since 18.0
 */
declare const enum INMessageReactionType {

	Unknown = 0,

	Emoji = 1,

	Generic = 2
}

/**
 * @since 11.0
 */
declare const enum INMessageType {

	Unspecified = 0,

	Text = 1,

	Audio = 2,

	DigitalTouch = 3,

	Handwriting = 4,

	Sticker = 5,

	TapbackLiked = 6,

	TapbackDisliked = 7,

	TapbackEmphasized = 8,

	TapbackLoved = 9,

	TapbackQuestioned = 10,

	TapbackLaughed = 11,

	MediaCalendar = 12,

	MediaLocation = 13,

	MediaAddressCard = 14,

	MediaImage = 15,

	MediaVideo = 16,

	MediaPass = 17,

	MediaAudio = 18,

	PaymentSent = 19,

	PaymentRequest = 20,

	PaymentNote = 21,

	Animoji = 22,

	ActivitySnippet = 23,

	File = 24,

	Link = 25,

	Reaction = 26,

	MediaAnimatedImage = 27,

	ThirdPartyAttachment = 28
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface INMessagesDomainHandling extends INSearchForMessagesIntentHandling, INSendMessageIntentHandling, INSetMessageAttributeIntentHandling {
}
declare var INMessagesDomainHandling: {

	prototype: INMessagesDomainHandling;
};

/**
 * @since 11.0
 */
declare class INNote extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INNote; // inherited from NSObject

	static new(): INNote; // inherited from NSObject

	readonly contents: NSArray<INNoteContent>;

	readonly createdDateComponents: NSDateComponents;

	readonly groupName: INSpeakableString;

	readonly identifier: string;

	readonly modifiedDateComponents: NSDateComponents;

	readonly title: INSpeakableString;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: INSpeakableString; contents: NSArray<INNoteContent> | INNoteContent[]; groupName: INSpeakableString; createdDateComponents: NSDateComponents; modifiedDateComponents: NSDateComponents; identifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleContentsGroupNameCreatedDateComponentsModifiedDateComponentsIdentifier(title: INSpeakableString, contents: NSArray<INNoteContent> | INNoteContent[], groupName: INSpeakableString, createdDateComponents: NSDateComponents, modifiedDateComponents: NSDateComponents, identifier: string): this;
}

/**
 * @since 11.0
 */
declare class INNoteContent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INNoteContent; // inherited from NSObject

	static new(): INNoteContent; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare class INNoteContentResolutionResult extends INIntentResolutionResult {

	static alloc(): INNoteContentResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INNoteContentResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithNoteContentToConfirm(noteContentToConfirm: INNoteContent): INNoteContentResolutionResult;

	static disambiguationWithNoteContentsToDisambiguate(noteContentsToDisambiguate: NSArray<INNoteContent> | INNoteContent[]): INNoteContentResolutionResult;

	static needsValue(): INNoteContentResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNoteContentResolutionResult; // inherited from NSObject

	static notRequired(): INNoteContentResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNoteContent(resolvedNoteContent: INNoteContent): INNoteContentResolutionResult;

	static unsupported(): INNoteContentResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INNoteContentResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 * @deprecated 12.0
 */
declare const enum INNoteContentType {

	Unknown = 0,

	Text = 1,

	Image = 2
}

/**
 * @since 11.0
 * @deprecated 13.0
 */
declare class INNoteContentTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INNoteContentTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithNoteContentTypeToConfirm(noteContentTypeToConfirm: INNoteContentType): INNoteContentTypeResolutionResult;

	static needsValue(): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNoteContentTypeResolutionResult; // inherited from NSObject

	static notRequired(): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNoteContentType(resolvedNoteContentType: INNoteContentType): INNoteContentTypeResolutionResult;

	static unsupported(): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare class INNoteResolutionResult extends INIntentResolutionResult {

	static alloc(): INNoteResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INNoteResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithNoteToConfirm(noteToConfirm: INNote): INNoteResolutionResult;

	static disambiguationWithNotesToDisambiguate(notesToDisambiguate: NSArray<INNote> | INNote[]): INNoteResolutionResult;

	static needsValue(): INNoteResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNoteResolutionResult; // inherited from NSObject

	static notRequired(): INNoteResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNote(resolvedNote: INNote): INNoteResolutionResult;

	static unsupported(): INNoteResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INNoteResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 * @deprecated 13.0
 */
interface INNotebookDomainHandling extends INAddTasksIntentHandling, INAppendToNoteIntentHandling, INCreateNoteIntentHandling, INCreateTaskListIntentHandling, INSearchForNotebookItemsIntentHandling, INSetTaskAttributeIntentHandling {
}
declare var INNotebookDomainHandling: {

	prototype: INNotebookDomainHandling;
};

/**
 * @since 11.0
 */
declare const enum INNotebookItemType {

	Unknown = 0,

	Note = 1,

	TaskList = 2,

	Task = 3
}

/**
 * @since 11.0
 */
declare class INNotebookItemTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INNotebookItemTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithNotebookItemTypeToConfirm(notebookItemTypeToConfirm: INNotebookItemType): INNotebookItemTypeResolutionResult;

	static disambiguationWithNotebookItemTypesToDisambiguate(notebookItemTypesToDisambiguate: NSArray<number> | number[]): INNotebookItemTypeResolutionResult;

	static needsValue(): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNotebookItemTypeResolutionResult; // inherited from NSObject

	static notRequired(): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNotebookItemType(resolvedNotebookItemType: INNotebookItemType): INNotebookItemTypeResolutionResult;

	static unsupported(): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 12.0
 */
declare class INObject extends NSObject implements INSpeakable, NSCopying, NSSecureCoding {

	static alloc(): INObject; // inherited from NSObject

	static new(): INObject; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	alternativeSpeakableMatches: NSArray<INSpeakableString>;

	/**
	 * @since 14.0
	 */
	displayImage: INImage;

	readonly displayString: string;

	/**
	 * @since 14.0
	 */
	subtitleString: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	readonly identifier: string; // inherited from INSpeakable

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly pronunciationHint: string; // inherited from INSpeakable

	readonly spokenPhrase: string; // inherited from INSpeakable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly vocabularyIdentifier: string; // inherited from INSpeakable

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; displayString: string; });

	constructor(o: { identifier: string; displayString: string; pronunciationHint: string; });

	/**
	 * @since 14.0
	 */
	constructor(o: { identifier: string; displayString: string; pronunciationHint: string; subtitleString: string; displayImage: INImage; });

	/**
	 * @since 14.0
	 */
	constructor(o: { identifier: string; displayString: string; subtitleString: string; displayImage: INImage; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIdentifierDisplayString(identifier: string, displayString: string): this;

	initWithIdentifierDisplayStringPronunciationHint(identifier: string, displayString: string, pronunciationHint: string): this;

	/**
	 * @since 14.0
	 */
	initWithIdentifierDisplayStringPronunciationHintSubtitleStringDisplayImage(identifier: string, displayString: string, pronunciationHint: string, subtitleString: string, displayImage: INImage): this;

	/**
	 * @since 14.0
	 */
	initWithIdentifierDisplayStringSubtitleStringDisplayImage(identifier: string, displayString: string, subtitleString: string, displayImage: INImage): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 14.0
 */
declare class INObjectCollection<ObjectType> extends NSObject implements NSCopying, NSSecureCoding {

	static alloc<ObjectType>(): INObjectCollection<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): INObjectCollection<ObjectType>; // inherited from NSObject

	readonly allItems: NSArray<any>;

	readonly sections: NSArray<INObjectSection<any>>;

	usesIndexedCollation: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { items: NSArray<any> | any[]; });

	constructor(o: { sections: NSArray<INObjectSection<any>> | INObjectSection<any>[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItems(items: NSArray<any> | any[]): this;

	initWithSections(sections: NSArray<INObjectSection<any>> | INObjectSection<any>[]): this;
}

/**
 * @since 13.0
 */
declare class INObjectResolutionResult extends INIntentResolutionResult {

	static alloc(): INObjectResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INObjectResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithObjectToConfirm(objectToConfirm: INObject): INObjectResolutionResult;

	static disambiguationWithObjectsToDisambiguate(objectsToDisambiguate: NSArray<INObject> | INObject[]): INObjectResolutionResult;

	static needsValue(): INObjectResolutionResult; // inherited from INIntentResolutionResult

	static new(): INObjectResolutionResult; // inherited from NSObject

	static notRequired(): INObjectResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedObject(resolvedObject: INObject): INObjectResolutionResult;

	static unsupported(): INObjectResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INObjectResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 14.0
 */
declare class INObjectSection<ObjectType> extends NSObject implements NSCopying, NSSecureCoding {

	static alloc<ObjectType>(): INObjectSection<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): INObjectSection<ObjectType>; // inherited from NSObject

	readonly items: NSArray<any>;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; items: NSArray<any> | any[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleItems(title: string, items: NSArray<any> | any[]): this;
}

/**
 * @since 14.0
 */
declare const enum INOutgoingMessageType {

	Unknown = 0,

	OutgoingMessageText = 1,

	OutgoingMessageAudio = 2
}

/**
 * @since 14.0
 */
declare class INOutgoingMessageTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INOutgoingMessageTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INOutgoingMessageTypeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithOutgoingMessageTypeToConfirm(outgoingMessageTypeToConfirm: INOutgoingMessageType): INOutgoingMessageTypeResolutionResult;

	static needsValue(): INOutgoingMessageTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INOutgoingMessageTypeResolutionResult; // inherited from NSObject

	static notRequired(): INOutgoingMessageTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedOutgoingMessageType(resolvedOutgoingMessageType: INOutgoingMessageType): INOutgoingMessageTypeResolutionResult;

	static unsupported(): INOutgoingMessageTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INOutgoingMessageTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare class INParameter extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INParameter; // inherited from NSObject

	static new(): INParameter; // inherited from NSObject

	static parameterForClassKeyPath(aClass: typeof NSObject, keyPath: string): INParameter;

	readonly parameterClass: typeof NSObject;

	readonly parameterKeyPath: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	indexForSubKeyPath(subKeyPath: string): number;

	initWithCoder(coder: NSCoder): this;

	isEqualToParameter(parameter: INParameter): boolean;

	setIndexForSubKeyPath(index: number, subKeyPath: string): void;
}

/**
 * @since 10.0
 */
declare class INPauseWorkoutIntent extends INIntent {

	static alloc(): INPauseWorkoutIntent; // inherited from NSObject

	static new(): INPauseWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

/**
 * @since 10.0
 */
interface INPauseWorkoutIntentHandling extends NSObjectProtocol {

	confirmPauseWorkoutCompletion?(intent: INPauseWorkoutIntent, completion: (p1: INPauseWorkoutIntentResponse) => void): void;

	handlePauseWorkoutCompletion(intent: INPauseWorkoutIntent, completion: (p1: INPauseWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForPauseWorkoutWithCompletion?(intent: INPauseWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INPauseWorkoutIntentHandling: {

	prototype: INPauseWorkoutIntentHandling;
};

/**
 * @since 10.0
 */
declare var INPauseWorkoutIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INPauseWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INPauseWorkoutIntentResponse; // inherited from NSObject

	static new(): INPauseWorkoutIntentResponse; // inherited from NSObject

	readonly code: INPauseWorkoutIntentResponseCode;

	constructor(o: { code: INPauseWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INPauseWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INPauseWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	HandleInApp = 6,

	Success = 7
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INPayBillIntent extends INIntent {

	static alloc(): INPayBillIntent; // inherited from NSObject

	static new(): INPayBillIntent; // inherited from NSObject

	readonly billPayee: INBillPayee;

	readonly billType: INBillType;

	readonly dueDate: INDateComponentsRange;

	readonly fromAccount: INPaymentAccount;

	readonly transactionAmount: INPaymentAmount;

	readonly transactionNote: string;

	readonly transactionScheduledDate: INDateComponentsRange;

	constructor(o: { billPayee: INBillPayee; fromAccount: INPaymentAccount; transactionAmount: INPaymentAmount; transactionScheduledDate: INDateComponentsRange; transactionNote: string; billType: INBillType; dueDate: INDateComponentsRange; });

	initWithBillPayeeFromAccountTransactionAmountTransactionScheduledDateTransactionNoteBillTypeDueDate(billPayee: INBillPayee, fromAccount: INPaymentAccount, transactionAmount: INPaymentAmount, transactionScheduledDate: INDateComponentsRange, transactionNote: string, billType: INBillType, dueDate: INDateComponentsRange): this;
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
interface INPayBillIntentHandling extends NSObjectProtocol {

	confirmPayBillCompletion?(intent: INPayBillIntent, completion: (p1: INPayBillIntentResponse) => void): void;

	handlePayBillCompletion(intent: INPayBillIntent, completion: (p1: INPayBillIntentResponse) => void): void;

	resolveBillPayeeForPayBillWithCompletion?(intent: INPayBillIntent, completion: (p1: INBillPayeeResolutionResult) => void): void;

	resolveBillTypeForPayBillWithCompletion?(intent: INPayBillIntent, completion: (p1: INBillTypeResolutionResult) => void): void;

	resolveDueDateForPayBillWithCompletion?(intent: INPayBillIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveFromAccountForPayBillWithCompletion?(intent: INPayBillIntent, completion: (p1: INPaymentAccountResolutionResult) => void): void;

	resolveTransactionAmountForPayBillWithCompletion?(intent: INPayBillIntent, completion: (p1: INPaymentAmountResolutionResult) => void): void;

	resolveTransactionNoteForPayBillWithCompletion?(intent: INPayBillIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveTransactionScheduledDateForPayBillWithCompletion?(intent: INPayBillIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;
}
declare var INPayBillIntentHandling: {

	prototype: INPayBillIntentHandling;
};

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INPayBillIntentResponse extends INIntentResponse {

	static alloc(): INPayBillIntentResponse; // inherited from NSObject

	static new(): INPayBillIntentResponse; // inherited from NSObject

	billDetails: INBillDetails;

	readonly code: INPayBillIntentResponseCode;

	fromAccount: INPaymentAccount;

	transactionAmount: INPaymentAmount;

	transactionNote: string;

	transactionScheduledDate: INDateComponentsRange;

	constructor(o: { code: INPayBillIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INPayBillIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare const enum INPayBillIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCredentialsUnverified = 6,

	FailureInsufficientFunds = 7
}

/**
 * @since 10.3
 */
declare class INPaymentAccount extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPaymentAccount; // inherited from NSObject

	static new(): INPaymentAccount; // inherited from NSObject

	readonly accountNumber: string;

	readonly accountType: INAccountType;

	/**
	 * @since 11.0
	 */
	readonly balance: INBalanceAmount;

	readonly nickname: INSpeakableString;

	readonly organizationName: INSpeakableString;

	/**
	 * @since 11.0
	 */
	readonly secondaryBalance: INBalanceAmount;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.3
	 * @deprecated 11.0
	 */
	constructor(o: { nickname: INSpeakableString; number: string; accountType: INAccountType; organizationName: INSpeakableString; });

	/**
	 * @since 11.0
	 */
	constructor(o: { nickname: INSpeakableString; number: string; accountType: INAccountType; organizationName: INSpeakableString; balance: INBalanceAmount; secondaryBalance: INBalanceAmount; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.3
	 * @deprecated 11.0
	 */
	initWithNicknameNumberAccountTypeOrganizationName(nickname: INSpeakableString, number: string, accountType: INAccountType, organizationName: INSpeakableString): this;

	/**
	 * @since 11.0
	 */
	initWithNicknameNumberAccountTypeOrganizationNameBalanceSecondaryBalance(nickname: INSpeakableString, number: string, accountType: INAccountType, organizationName: INSpeakableString, balance: INBalanceAmount, secondaryBalance: INBalanceAmount): this;
}

/**
 * @since 10.3
 */
declare class INPaymentAccountResolutionResult extends INIntentResolutionResult {

	static alloc(): INPaymentAccountResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPaymentAccountToConfirm(paymentAccountToConfirm: INPaymentAccount): INPaymentAccountResolutionResult;

	static disambiguationWithPaymentAccountsToDisambiguate(paymentAccountsToDisambiguate: NSArray<INPaymentAccount> | INPaymentAccount[]): INPaymentAccountResolutionResult;

	static needsValue(): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPaymentAccountResolutionResult; // inherited from NSObject

	static notRequired(): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPaymentAccount(resolvedPaymentAccount: INPaymentAccount): INPaymentAccountResolutionResult;

	static unsupported(): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.3
 */
declare class INPaymentAmount extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPaymentAmount; // inherited from NSObject

	static new(): INPaymentAmount; // inherited from NSObject

	readonly amount: INCurrencyAmount;

	readonly amountType: INAmountType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { amountType: INAmountType; amount: INCurrencyAmount; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAmountTypeAmount(amountType: INAmountType, amount: INCurrencyAmount): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.3
 */
declare class INPaymentAmountResolutionResult extends INIntentResolutionResult {

	static alloc(): INPaymentAmountResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPaymentAmountToConfirm(paymentAmountToConfirm: INPaymentAmount): INPaymentAmountResolutionResult;

	static disambiguationWithPaymentAmountsToDisambiguate(paymentAmountsToDisambiguate: NSArray<INPaymentAmount> | INPaymentAmount[]): INPaymentAmountResolutionResult;

	static needsValue(): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPaymentAmountResolutionResult; // inherited from NSObject

	static notRequired(): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPaymentAmount(resolvedPaymentAmount: INPaymentAmount): INPaymentAmountResolutionResult;

	static unsupported(): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INPaymentMethod extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPaymentMethod; // inherited from NSObject

	static applePayPaymentMethod(): INPaymentMethod;

	static new(): INPaymentMethod; // inherited from NSObject

	readonly icon: INImage;

	readonly identificationHint: string;

	readonly name: string;

	readonly type: INPaymentMethodType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { type: INPaymentMethodType; name: string; identificationHint: string; icon: INImage; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTypeNameIdentificationHintIcon(type: INPaymentMethodType, name: string, identificationHint: string, icon: INImage): this;
}

/**
 * @since 13.0
 */
declare class INPaymentMethodResolutionResult extends INIntentResolutionResult {

	static alloc(): INPaymentMethodResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPaymentMethodResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPaymentMethodToConfirm(paymentMethodToConfirm: INPaymentMethod): INPaymentMethodResolutionResult;

	static disambiguationWithPaymentMethodsToDisambiguate(paymentMethodsToDisambiguate: NSArray<INPaymentMethod> | INPaymentMethod[]): INPaymentMethodResolutionResult;

	static needsValue(): INPaymentMethodResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPaymentMethodResolutionResult; // inherited from NSObject

	static notRequired(): INPaymentMethodResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPaymentMethod(resolvedPaymentMethod: INPaymentMethod): INPaymentMethodResolutionResult;

	static unsupported(): INPaymentMethodResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPaymentMethodResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare const enum INPaymentMethodType {

	Unknown = 0,

	Checking = 1,

	Savings = 2,

	Brokerage = 3,

	Debit = 4,

	Credit = 5,

	Prepaid = 6,

	Store = 7,

	ApplePay = 8
}

/**
 * @since 10.0
 */
declare class INPaymentRecord extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPaymentRecord; // inherited from NSObject

	static new(): INPaymentRecord; // inherited from NSObject

	readonly currencyAmount: INCurrencyAmount;

	readonly feeAmount: INCurrencyAmount;

	readonly note: string;

	readonly payee: INPerson;

	readonly payer: INPerson;

	readonly paymentMethod: INPaymentMethod;

	readonly status: INPaymentStatus;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { payee: INPerson; payer: INPerson; currencyAmount: INCurrencyAmount; paymentMethod: INPaymentMethod; note: string; status: INPaymentStatus; });

	constructor(o: { payee: INPerson; payer: INPerson; currencyAmount: INCurrencyAmount; paymentMethod: INPaymentMethod; note: string; status: INPaymentStatus; feeAmount: INCurrencyAmount; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPayeePayerCurrencyAmountPaymentMethodNoteStatus(payee: INPerson, payer: INPerson, currencyAmount: INCurrencyAmount, paymentMethod: INPaymentMethod, note: string, status: INPaymentStatus): this;

	initWithPayeePayerCurrencyAmountPaymentMethodNoteStatusFeeAmount(payee: INPerson, payer: INPerson, currencyAmount: INCurrencyAmount, paymentMethod: INPaymentMethod, note: string, status: INPaymentStatus, feeAmount: INCurrencyAmount): this;
}

/**
 * @since 10.0
 */
declare const enum INPaymentStatus {

	Unknown = 0,

	Pending = 1,

	Completed = 2,

	Canceled = 3,

	Failed = 4,

	Unpaid = 5
}

/**
 * @since 10.0
 */
declare class INPaymentStatusResolutionResult extends INIntentResolutionResult {

	static alloc(): INPaymentStatusResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPaymentStatusToConfirm(paymentStatusToConfirm: INPaymentStatus): INPaymentStatusResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INPaymentStatus): INPaymentStatusResolutionResult;

	static needsValue(): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPaymentStatusResolutionResult; // inherited from NSObject

	static notRequired(): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPaymentStatus(resolvedPaymentStatus: INPaymentStatus): INPaymentStatusResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INPaymentStatus): INPaymentStatusResolutionResult;

	static unsupported(): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 * @deprecated 13.0
 */
interface INPaymentsDomainHandling extends INPayBillIntentHandling, INRequestPaymentIntentHandling, INSearchForAccountsIntentHandling, INSearchForBillsIntentHandling, INSendPaymentIntentHandling, INTransferMoneyIntentHandling {
}
declare var INPaymentsDomainHandling: {

	prototype: INPaymentsDomainHandling;
};

/**
 * @since 10.0
 */
declare class INPerson extends NSObject implements INSpeakable, NSCopying, NSSecureCoding {

	static alloc(): INPerson; // inherited from NSObject

	static new(): INPerson; // inherited from NSObject

	readonly aliases: NSArray<INPersonHandle>;

	readonly contactIdentifier: string;

	/**
	 * @since 15.0
	 */
	readonly contactSuggestion: boolean;

	readonly customIdentifier: string;

	readonly displayName: string;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	readonly handle: string;

	readonly image: INImage;

	/**
	 * @since 11.0
	 */
	readonly isMe: boolean;

	readonly nameComponents: NSPersonNameComponents;

	readonly personHandle: INPersonHandle;

	/**
	 * @since 10.2
	 */
	readonly relationship: string;

	/**
	 * @since 10.3
	 */
	readonly siriMatches: NSArray<INPerson>;

	readonly suggestionType: INPersonSuggestionType;

	readonly alternativeSpeakableMatches: NSArray<INSpeakable>; // inherited from INSpeakable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	readonly identifier: string; // inherited from INSpeakable

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly pronunciationHint: string; // inherited from INSpeakable

	readonly spokenPhrase: string; // inherited from INSpeakable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly vocabularyIdentifier: string; // inherited from INSpeakable

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	constructor(o: { handle: string; displayName: string; contactIdentifier: string; });

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	constructor(o: { handle: string; nameComponents: NSPersonNameComponents; contactIdentifier: string; });

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	constructor(o: { handle: string; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; });

	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; });

	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; aliases: NSArray<INPersonHandle> | INPersonHandle[]; suggestionType: INPersonSuggestionType; });

	/**
	 * @since 15.0
	 */
	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; isContactSuggestion: boolean; suggestionType: INPersonSuggestionType; });

	/**
	 * @since 12.0
	 */
	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; isMe: boolean; });

	/**
	 * @since 15.0
	 */
	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; isMe: boolean; suggestionType: INPersonSuggestionType; });

	/**
	 * @since 14.0
	 */
	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; relationship: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	initWithHandleDisplayNameContactIdentifier(handle: string, displayName: string, contactIdentifier: string): this;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	initWithHandleNameComponentsContactIdentifier(handle: string, nameComponents: NSPersonNameComponents, contactIdentifier: string): this;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	initWithHandleNameComponentsDisplayNameImageContactIdentifier(handle: string, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string): this;

	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifier(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string): this;

	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifierAliasesSuggestionType(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string, aliases: NSArray<INPersonHandle> | INPersonHandle[], suggestionType: INPersonSuggestionType): this;

	/**
	 * @since 15.0
	 */
	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifierIsContactSuggestionSuggestionType(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string, isContactSuggestion: boolean, suggestionType: INPersonSuggestionType): this;

	/**
	 * @since 12.0
	 */
	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifierIsMe(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string, isMe: boolean): this;

	/**
	 * @since 15.0
	 */
	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifierIsMeSuggestionType(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string, isMe: boolean, suggestionType: INPersonSuggestionType): this;

	/**
	 * @since 14.0
	 */
	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifierRelationship(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string, relationship: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 10.0
 */
declare class INPersonHandle extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPersonHandle; // inherited from NSObject

	static new(): INPersonHandle; // inherited from NSObject

	/**
	 * @since 10.2
	 */
	readonly label: string;

	readonly type: INPersonHandleType;

	readonly value: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { value: string; type: INPersonHandleType; });

	/**
	 * @since 10.2
	 */
	constructor(o: { value: string; type: INPersonHandleType; label: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithValueType(value: string, type: INPersonHandleType): this;

	/**
	 * @since 10.2
	 */
	initWithValueTypeLabel(value: string, type: INPersonHandleType, label: string): this;
}

/**
 * @since 10.2
 */
declare var INPersonHandleLabelHome: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabelHomeFax: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabelMain: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabelMobile: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabelOther: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabelPager: string;

/**
 * @since 14.0
 */
declare var INPersonHandleLabelSchool: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabelWork: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabelWorkFax: string;

/**
 * @since 10.2
 */
declare var INPersonHandleLabeliPhone: string;

/**
 * @since 10.0
 */
declare const enum INPersonHandleType {

	Unknown = 0,

	EmailAddress = 1,

	PhoneNumber = 2
}

/**
 * @since 10.2
 */
declare var INPersonRelationshipAssistant: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipBrother: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipChild: string;

/**
 * @since 13.0
 */
declare var INPersonRelationshipDaughter: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipFather: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipFriend: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipManager: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipMother: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipParent: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipPartner: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipSister: string;

/**
 * @since 13.0
 */
declare var INPersonRelationshipSon: string;

/**
 * @since 10.2
 */
declare var INPersonRelationshipSpouse: string;

/**
 * @since 10.0
 */
declare class INPersonResolutionResult extends INIntentResolutionResult {

	static alloc(): INPersonResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPersonResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INPersonResolutionResult;

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson> | INPerson[]): INPersonResolutionResult;

	static needsValue(): INPersonResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPersonResolutionResult; // inherited from NSObject

	static notRequired(): INPersonResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INPersonResolutionResult;

	static unsupported(): INPersonResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPersonResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare const enum INPersonSuggestionType {

	None = 0,

	SocialProfile = 1,

	InstantMessageAddress = 2
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INPhotoAttributeOptions {

	Photo = 1,

	Video = 2,

	GIF = 4,

	Flash = 8,

	LandscapeOrientation = 16,

	PortraitOrientation = 32,

	Favorite = 64,

	Selfie = 128,

	FrontFacingCamera = 256,

	Screenshot = 512,

	BurstPhoto = 1024,

	HDRPhoto = 2048,

	SquarePhoto = 4096,

	PanoramaPhoto = 8192,

	TimeLapseVideo = 16384,

	SlowMotionVideo = 32768,

	NoirFilter = 65536,

	ChromeFilter = 131072,

	InstantFilter = 262144,

	TonalFilter = 524288,

	TransferFilter = 1048576,

	MonoFilter = 2097152,

	FadeFilter = 4194304,

	ProcessFilter = 8388608,

	PortraitPhoto = 16777216,

	LivePhoto = 33554432,

	LoopPhoto = 67108864,

	BouncePhoto = 134217728,

	LongExposurePhoto = 268435456
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface INPhotosDomainHandling extends INSearchForPhotosIntentHandling, INStartPhotoPlaybackIntentHandling {
}
declare var INPhotosDomainHandling: {

	prototype: INPhotosDomainHandling;
};

/**
 * @since 10.0
 */
declare class INPlacemarkResolutionResult extends INIntentResolutionResult {

	static alloc(): INPlacemarkResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPlacemarkToConfirm(placemarkToConfirm: CLPlacemark): INPlacemarkResolutionResult;

	static disambiguationWithPlacemarksToDisambiguate(placemarksToDisambiguate: NSArray<CLPlacemark> | CLPlacemark[]): INPlacemarkResolutionResult;

	static needsValue(): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPlacemarkResolutionResult; // inherited from NSObject

	static notRequired(): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPlacemark(resolvedPlacemark: CLPlacemark): INPlacemarkResolutionResult;

	static unsupported(): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 12.0
 */
declare class INPlayMediaIntent extends INIntent {

	static alloc(): INPlayMediaIntent; // inherited from NSObject

	static new(): INPlayMediaIntent; // inherited from NSObject

	readonly mediaContainer: INMediaItem;

	readonly mediaItems: NSArray<INMediaItem>;

	/**
	 * @since 13.0
	 */
	readonly mediaSearch: INMediaSearch;

	readonly playShuffled: number;

	/**
	 * @since 13.0
	 */
	readonly playbackQueueLocation: INPlaybackQueueLocation;

	readonly playbackRepeatMode: INPlaybackRepeatMode;

	/**
	 * @since 13.0
	 */
	readonly playbackSpeed: number;

	readonly resumePlayback: number;

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	constructor(o: { mediaItems: NSArray<INMediaItem> | INMediaItem[]; mediaContainer: INMediaItem; playShuffled: number; playbackRepeatMode: INPlaybackRepeatMode; resumePlayback: number; });

	/**
	 * @since 13.0
	 */
	constructor(o: { mediaItems: NSArray<INMediaItem> | INMediaItem[]; mediaContainer: INMediaItem; playShuffled: number; playbackRepeatMode: INPlaybackRepeatMode; resumePlayback: number; playbackQueueLocation: INPlaybackQueueLocation; playbackSpeed: number; mediaSearch: INMediaSearch; });

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	initWithMediaItemsMediaContainerPlayShuffledPlaybackRepeatModeResumePlayback(mediaItems: NSArray<INMediaItem> | INMediaItem[], mediaContainer: INMediaItem, playShuffled: number, playbackRepeatMode: INPlaybackRepeatMode, resumePlayback: number): this;

	/**
	 * @since 13.0
	 */
	initWithMediaItemsMediaContainerPlayShuffledPlaybackRepeatModeResumePlaybackPlaybackQueueLocationPlaybackSpeedMediaSearch(mediaItems: NSArray<INMediaItem> | INMediaItem[], mediaContainer: INMediaItem, playShuffled: number, playbackRepeatMode: INPlaybackRepeatMode, resumePlayback: number, playbackQueueLocation: INPlaybackQueueLocation, playbackSpeed: number, mediaSearch: INMediaSearch): this;
}

/**
 * @since 12.0
 */
interface INPlayMediaIntentHandling extends NSObjectProtocol {

	confirmPlayMediaCompletion?(intent: INPlayMediaIntent, completion: (p1: INPlayMediaIntentResponse) => void): void;

	handlePlayMediaCompletion(intent: INPlayMediaIntent, completion: (p1: INPlayMediaIntentResponse) => void): void;

	/**
	 * @since 13.0
	 */
	resolveMediaItemsForPlayMediaWithCompletion?(intent: INPlayMediaIntent, completion: (p1: NSArray<INPlayMediaMediaItemResolutionResult>) => void): void;

	/**
	 * @since 13.0
	 */
	resolvePlayShuffledForPlayMediaWithCompletion?(intent: INPlayMediaIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolvePlaybackQueueLocationForPlayMediaWithCompletion?(intent: INPlayMediaIntent, completion: (p1: INPlaybackQueueLocationResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolvePlaybackRepeatModeForPlayMediaWithCompletion?(intent: INPlayMediaIntent, completion: (p1: INPlaybackRepeatModeResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolvePlaybackSpeedForPlayMediaWithCompletion?(intent: INPlayMediaIntent, completion: (p1: INPlayMediaPlaybackSpeedResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolveResumePlaybackForPlayMediaWithCompletion?(intent: INPlayMediaIntent, completion: (p1: INBooleanResolutionResult) => void): void;
}
declare var INPlayMediaIntentHandling: {

	prototype: INPlayMediaIntentHandling;
};

/**
 * @since 12.0
 */
declare class INPlayMediaIntentResponse extends INIntentResponse {

	static alloc(): INPlayMediaIntentResponse; // inherited from NSObject

	static new(): INPlayMediaIntentResponse; // inherited from NSObject

	readonly code: INPlayMediaIntentResponseCode;

	nowPlayingInfo: NSDictionary<string, any>;

	constructor(o: { code: INPlayMediaIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INPlayMediaIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 12.0
 */
declare const enum INPlayMediaIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	InProgress = 3,

	Success = 4,

	HandleInApp = 5,

	Failure = 6,

	FailureRequiringAppLaunch = 7,

	FailureUnknownMediaType = 8,

	FailureNoUnplayedContent = 9,

	FailureRestrictedContent = 10,

	FailureMaxStreamLimitReached = 11
}

/**
 * @since 13.0
 */
declare class INPlayMediaMediaItemResolutionResult extends INMediaItemResolutionResult {

	static alloc(): INPlayMediaMediaItemResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPlayMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaItemToConfirm(mediaItemToConfirm: INMediaItem): INPlayMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static disambiguationWithMediaItemsToDisambiguate(mediaItemsToDisambiguate: NSArray<INMediaItem> | INMediaItem[]): INPlayMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static needsValue(): INPlayMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPlayMediaMediaItemResolutionResult; // inherited from NSObject

	static notRequired(): INPlayMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaItem(resolvedMediaItem: INMediaItem): INPlayMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static unsupported(): INPlayMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INPlayMediaMediaItemUnsupportedReason): INPlayMediaMediaItemResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPlayMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { mediaItemResolutionResult: INMediaItemResolutionResult; });

	initWithMediaItemResolutionResult(mediaItemResolutionResult: INMediaItemResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INPlayMediaMediaItemUnsupportedReason {

	LoginRequired = 1,

	SubscriptionRequired = 2,

	UnsupportedMediaType = 3,

	ExplicitContentSettings = 4,

	CellularDataSettings = 5,

	RestrictedContent = 6,

	ServiceUnavailable = 7,

	RegionRestriction = 8
}

/**
 * @since 13.0
 */
declare class INPlayMediaPlaybackSpeedResolutionResult extends INDoubleResolutionResult {

	static alloc(): INPlayMediaPlaybackSpeedResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPlayMediaPlaybackSpeedResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INPlayMediaPlaybackSpeedResolutionResult; // inherited from INDoubleResolutionResult

	static needsValue(): INPlayMediaPlaybackSpeedResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPlayMediaPlaybackSpeedResolutionResult; // inherited from NSObject

	static notRequired(): INPlayMediaPlaybackSpeedResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: number): INPlayMediaPlaybackSpeedResolutionResult; // inherited from INDoubleResolutionResult

	static unsupported(): INPlayMediaPlaybackSpeedResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INPlayMediaPlaybackSpeedUnsupportedReason): INPlayMediaPlaybackSpeedResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPlayMediaPlaybackSpeedResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { doubleResolutionResult: INDoubleResolutionResult; });

	initWithDoubleResolutionResult(doubleResolutionResult: INDoubleResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INPlayMediaPlaybackSpeedUnsupportedReason {

	BelowMinimum = 1,

	AboveMaximum = 2
}

/**
 * @since 13.0
 */
declare const enum INPlaybackQueueLocation {

	Unknown = 0,

	Now = 1,

	Next = 2,

	Later = 3
}

/**
 * @since 13.0
 */
declare class INPlaybackQueueLocationResolutionResult extends INIntentResolutionResult {

	static alloc(): INPlaybackQueueLocationResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPlaybackQueueLocationResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPlaybackQueueLocationToConfirm(playbackQueueLocationToConfirm: INPlaybackQueueLocation): INPlaybackQueueLocationResolutionResult;

	static needsValue(): INPlaybackQueueLocationResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPlaybackQueueLocationResolutionResult; // inherited from NSObject

	static notRequired(): INPlaybackQueueLocationResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPlaybackQueueLocation(resolvedPlaybackQueueLocation: INPlaybackQueueLocation): INPlaybackQueueLocationResolutionResult;

	static unsupported(): INPlaybackQueueLocationResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPlaybackQueueLocationResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 12.0
 */
declare const enum INPlaybackRepeatMode {

	Unknown = 0,

	None = 1,

	All = 2,

	One = 3
}

/**
 * @since 12.0
 */
declare class INPlaybackRepeatModeResolutionResult extends INIntentResolutionResult {

	static alloc(): INPlaybackRepeatModeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INPlaybackRepeatModeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPlaybackRepeatModeToConfirm(playbackRepeatModeToConfirm: INPlaybackRepeatMode): INPlaybackRepeatModeResolutionResult;

	static needsValue(): INPlaybackRepeatModeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPlaybackRepeatModeResolutionResult; // inherited from NSObject

	static notRequired(): INPlaybackRepeatModeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPlaybackRepeatMode(resolvedPlaybackRepeatMode: INPlaybackRepeatMode): INPlaybackRepeatModeResolutionResult;

	static unsupported(): INPlaybackRepeatModeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INPlaybackRepeatModeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INPreferences extends NSObject {

	static alloc(): INPreferences; // inherited from NSObject

	static new(): INPreferences; // inherited from NSObject

	static requestSiriAuthorization(handler: (p1: INSiriAuthorizationStatus) => void): void;

	static siriAuthorizationStatus(): INSiriAuthorizationStatus;

	static siriLanguageCode(): string;
}

/**
 * @since 10.0
 */
declare class INPriceRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPriceRange; // inherited from NSObject

	static new(): INPriceRange; // inherited from NSObject

	readonly currencyCode: string;

	readonly maximumPrice: NSDecimalNumber;

	readonly minimumPrice: NSDecimalNumber;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { maximumPrice: NSDecimalNumber; currencyCode: string; });

	constructor(o: { minimumPrice: NSDecimalNumber; currencyCode: string; });

	constructor(o: { price: NSDecimalNumber; currencyCode: string; });

	constructor(o: { rangeBetweenPrice: NSDecimalNumber; andPrice: NSDecimalNumber; currencyCode: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithMaximumPriceCurrencyCode(maximumPrice: NSDecimalNumber, currencyCode: string): this;

	initWithMinimumPriceCurrencyCode(minimumPrice: NSDecimalNumber, currencyCode: string): this;

	initWithPriceCurrencyCode(price: NSDecimalNumber, currencyCode: string): this;

	initWithRangeBetweenPriceAndPriceCurrencyCode(firstPrice: NSDecimalNumber, secondPrice: NSDecimalNumber, currencyCode: string): this;
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface INRadioDomainHandling extends INSetRadioStationIntentHandling {
}
declare var INRadioDomainHandling: {

	prototype: INRadioDomainHandling;
};

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INRadioType {

	Unknown = 0,

	AM = 1,

	FM = 2,

	HD = 3,

	Satellite = 4,

	DAB = 5
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INRadioTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INRadioTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithRadioTypeToConfirm(radioTypeToConfirm: INRadioType): INRadioTypeResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRadioType): INRadioTypeResolutionResult;

	static needsValue(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRadioTypeResolutionResult; // inherited from NSObject

	static notRequired(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRadioType(resolvedRadioType: INRadioType): INRadioTypeResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INRadioType): INRadioTypeResolutionResult;

	static unsupported(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare const enum INRecurrenceFrequency {

	Unknown = 0,

	Minute = 1,

	Hourly = 2,

	Daily = 3,

	Weekly = 4,

	Monthly = 5,

	Yearly = 6
}

/**
 * @since 11.0
 */
declare class INRecurrenceRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRecurrenceRule; // inherited from NSObject

	static new(): INRecurrenceRule; // inherited from NSObject

	readonly frequency: INRecurrenceFrequency;

	readonly interval: number;

	/**
	 * @since 14.0
	 */
	readonly weeklyRecurrenceDays: INDayOfWeekOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { interval: number; frequency: INRecurrenceFrequency; });

	/**
	 * @since 14.0
	 */
	constructor(o: { interval: number; frequency: INRecurrenceFrequency; weeklyRecurrenceDays: INDayOfWeekOptions; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIntervalFrequency(interval: number, frequency: INRecurrenceFrequency): this;

	/**
	 * @since 14.0
	 */
	initWithIntervalFrequencyWeeklyRecurrenceDays(interval: number, frequency: INRecurrenceFrequency, weeklyRecurrenceDays: INDayOfWeekOptions): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INRelativeReference {

	Unknown = 0,

	Next = 1,

	Previous = 2
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INRelativeReferenceResolutionResult extends INIntentResolutionResult {

	static alloc(): INRelativeReferenceResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithRelativeReferenceToConfirm(relativeReferenceToConfirm: INRelativeReference): INRelativeReferenceResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRelativeReference): INRelativeReferenceResolutionResult;

	static needsValue(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRelativeReferenceResolutionResult; // inherited from NSObject

	static notRequired(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRelativeReference(resolvedRelativeReference: INRelativeReference): INRelativeReferenceResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INRelativeReference): INRelativeReferenceResolutionResult;

	static unsupported(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INRelativeSetting {

	Unknown = 0,

	Lowest = 1,

	Lower = 2,

	Higher = 3,

	Highest = 4
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INRelativeSettingResolutionResult extends INIntentResolutionResult {

	static alloc(): INRelativeSettingResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithRelativeSettingToConfirm(relativeSettingToConfirm: INRelativeSetting): INRelativeSettingResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRelativeSetting): INRelativeSettingResolutionResult;

	static needsValue(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRelativeSettingResolutionResult; // inherited from NSObject

	static notRequired(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRelativeSetting(resolvedRelativeSetting: INRelativeSetting): INRelativeSettingResolutionResult;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INRelativeSetting): INRelativeSettingResolutionResult;

	static unsupported(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 12.0
 */
declare class INRelevanceProvider extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRelevanceProvider; // inherited from NSObject

	static new(): INRelevanceProvider; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare class INRelevantShortcut extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRelevantShortcut; // inherited from NSObject

	static new(): INRelevantShortcut; // inherited from NSObject

	relevanceProviders: NSArray<INRelevanceProvider>;

	readonly shortcut: INShortcut;

	shortcutRole: INRelevantShortcutRole;

	watchTemplate: INDefaultCardTemplate;

	/**
	 * @since 15.0
	 */
	widgetKind: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { shortcut: INShortcut; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithShortcut(shortcut: INShortcut): this;
}

/**
 * @since 12.0
 */
declare const enum INRelevantShortcutRole {

	Action = 0,

	Information = 1
}

/**
 * @since 12.0
 */
declare class INRelevantShortcutStore extends NSObject {

	static alloc(): INRelevantShortcutStore; // inherited from NSObject

	static new(): INRelevantShortcutStore; // inherited from NSObject

	static readonly defaultStore: INRelevantShortcutStore;

	setRelevantShortcutsCompletionHandler(shortcuts: NSArray<INRelevantShortcut> | INRelevantShortcut[], completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 13.0
 */
declare class INRentalCar extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRentalCar; // inherited from NSObject

	static new(): INRentalCar; // inherited from NSObject

	readonly make: string;

	readonly model: string;

	readonly rentalCarDescription: string;

	readonly rentalCompanyName: string;

	readonly type: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { rentalCompanyName: string; type: string; make: string; model: string; rentalCarDescription: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRentalCompanyNameTypeMakeModelRentalCarDescription(rentalCompanyName: string, type: string, make: string, model: string, rentalCarDescription: string): this;
}

/**
 * @since 13.0
 */
declare class INRentalCarReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INRentalCarReservation; // inherited from NSObject

	static new(): INRentalCarReservation; // inherited from NSObject

	readonly dropOffLocation: CLPlacemark;

	readonly pickupLocation: CLPlacemark;

	readonly rentalCar: INRentalCar;

	readonly rentalDuration: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; rentalCar: INRentalCar; rentalDuration: INDateComponentsRange; pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; });

	/**
	 * @since 14.0
	 */
	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; rentalCar: INRentalCar; rentalDuration: INDateComponentsRange; pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsRentalCarRentalDurationPickupLocationDropOffLocation(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], rentalCar: INRentalCar, rentalDuration: INDateComponentsRange, pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark): this;

	/**
	 * @since 14.0
	 */
	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLRentalCarRentalDurationPickupLocationDropOffLocation(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, rentalCar: INRentalCar, rentalDuration: INDateComponentsRange, pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark): this;
}

/**
 * @since 11.0
 */
declare class INRequestPaymentCurrencyAmountResolutionResult extends INCurrencyAmountResolutionResult {

	static alloc(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCurrencyAmountToConfirm(currencyAmountToConfirm: INCurrencyAmount): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithCurrencyAmountsToDisambiguate(currencyAmountsToDisambiguate: NSArray<INCurrencyAmount> | INCurrencyAmount[]): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static needsValue(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static notRequired(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCurrencyAmount(resolvedCurrencyAmount: INCurrencyAmount): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static unsupported(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INRequestPaymentCurrencyAmountUnsupportedReason): INRequestPaymentCurrencyAmountResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { currencyAmountResolutionResult: INCurrencyAmountResolutionResult; });

	initWithCurrencyAmountResolutionResult(currencyAmountResolutionResult: INCurrencyAmountResolutionResult): this;
}

/**
 * @since 11.0
 */
declare const enum INRequestPaymentCurrencyAmountUnsupportedReason {

	PaymentsAmountBelowMinimum = 1,

	PaymentsAmountAboveMaximum = 2,

	PaymentsCurrencyUnsupported = 3
}

/**
 * @since 10.0
 */
declare class INRequestPaymentIntent extends INIntent {

	static alloc(): INRequestPaymentIntent; // inherited from NSObject

	static new(): INRequestPaymentIntent; // inherited from NSObject

	readonly currencyAmount: INCurrencyAmount;

	readonly note: string;

	readonly payer: INPerson;

	constructor(o: { payer: INPerson; currencyAmount: INCurrencyAmount; note: string; });

	initWithPayerCurrencyAmountNote(payer: INPerson, currencyAmount: INCurrencyAmount, note: string): this;
}

/**
 * @since 10.0
 */
interface INRequestPaymentIntentHandling extends NSObjectProtocol {

	confirmRequestPaymentCompletion?(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentIntentResponse) => void): void;

	handleRequestPaymentCompletion(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentIntentResponse) => void): void;

	/**
	 * @since 11.0
	 */
	resolveCurrencyAmountForRequestPaymentCompletion?(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentCurrencyAmountResolutionResult) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolveCurrencyAmountForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INCurrencyAmountResolutionResult) => void): void;

	resolveNoteForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INStringResolutionResult) => void): void;

	/**
	 * @since 11.0
	 */
	resolvePayerForRequestPaymentCompletion?(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentPayerResolutionResult) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolvePayerForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INPersonResolutionResult) => void): void;
}
declare var INRequestPaymentIntentHandling: {

	prototype: INRequestPaymentIntentHandling;
};

/**
 * @since 10.0
 */
declare var INRequestPaymentIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INRequestPaymentIntentResponse extends INIntentResponse {

	static alloc(): INRequestPaymentIntentResponse; // inherited from NSObject

	static new(): INRequestPaymentIntentResponse; // inherited from NSObject

	readonly code: INRequestPaymentIntentResponseCode;

	paymentRecord: INPaymentRecord;

	constructor(o: { code: INRequestPaymentIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INRequestPaymentIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INRequestPaymentIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCredentialsUnverified = 6,

	FailurePaymentsAmountBelowMinimum = 7,

	FailurePaymentsAmountAboveMaximum = 8,

	FailurePaymentsCurrencyUnsupported = 9,

	FailureNoBankAccount = 10,

	FailureNotEligible = 11,

	FailureTermsAndConditionsAcceptanceRequired = 12
}

/**
 * @since 11.0
 */
declare class INRequestPaymentPayerResolutionResult extends INPersonResolutionResult {

	static alloc(): INRequestPaymentPayerResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INRequestPaymentPayerResolutionResult; // inherited from INPersonResolutionResult

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson> | INPerson[]): INRequestPaymentPayerResolutionResult; // inherited from INPersonResolutionResult

	static needsValue(): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRequestPaymentPayerResolutionResult; // inherited from NSObject

	static notRequired(): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INRequestPaymentPayerResolutionResult; // inherited from INPersonResolutionResult

	static unsupported(): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INRequestPaymentPayerUnsupportedReason): INRequestPaymentPayerResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { personResolutionResult: INPersonResolutionResult; });

	initWithPersonResolutionResult(personResolutionResult: INPersonResolutionResult): this;
}

/**
 * @since 11.0
 */
declare const enum INRequestPaymentPayerUnsupportedReason {

	CredentialsUnverified = 1,

	NoAccount = 2,

	NoValidHandle = 3
}

/**
 * @since 10.0
 */
declare class INRequestRideIntent extends INIntent {

	static alloc(): INRequestRideIntent; // inherited from NSObject

	static new(): INRequestRideIntent; // inherited from NSObject

	readonly dropOffLocation: CLPlacemark;

	readonly partySize: number;

	readonly paymentMethod: INPaymentMethod;

	readonly pickupLocation: CLPlacemark;

	readonly rideOptionName: INSpeakableString;

	/**
	 * @since 10.3
	 */
	readonly scheduledPickupTime: INDateComponentsRange;

	/**
	 * @since 10.0
	 * @deprecated 10.3
	 */
	constructor(o: { pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; rideOptionName: INSpeakableString; partySize: number; paymentMethod: INPaymentMethod; });

	/**
	 * @since 10.3
	 */
	constructor(o: { pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; rideOptionName: INSpeakableString; partySize: number; paymentMethod: INPaymentMethod; scheduledPickupTime: INDateComponentsRange; });

	/**
	 * @since 10.0
	 * @deprecated 10.3
	 */
	initWithPickupLocationDropOffLocationRideOptionNamePartySizePaymentMethod(pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark, rideOptionName: INSpeakableString, partySize: number, paymentMethod: INPaymentMethod): this;

	/**
	 * @since 10.3
	 */
	initWithPickupLocationDropOffLocationRideOptionNamePartySizePaymentMethodScheduledPickupTime(pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark, rideOptionName: INSpeakableString, partySize: number, paymentMethod: INPaymentMethod, scheduledPickupTime: INDateComponentsRange): this;
}

/**
 * @since 10.0
 */
interface INRequestRideIntentHandling extends NSObjectProtocol {

	confirmRequestRideCompletion?(intent: INRequestRideIntent, completion: (p1: INRequestRideIntentResponse) => void): void;

	handleRequestRideCompletion(intent: INRequestRideIntent, completion: (p1: INRequestRideIntentResponse) => void): void;

	resolveDropOffLocationForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePartySizeForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolvePickupLocationForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolveRideOptionNameForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	/**
	 * @since 10.3
	 */
	resolveScheduledPickupTimeForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;
}
declare var INRequestRideIntentHandling: {

	prototype: INRequestRideIntentHandling;
};

/**
 * @since 10.0
 */
declare var INRequestRideIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INRequestRideIntentResponse extends INIntentResponse {

	static alloc(): INRequestRideIntentResponse; // inherited from NSObject

	static new(): INRequestRideIntentResponse; // inherited from NSObject

	readonly code: INRequestRideIntentResponseCode;

	rideStatus: INRideStatus;

	constructor(o: { code: INRequestRideIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INRequestRideIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INRequestRideIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureRequiringAppLaunchMustVerifyCredentials = 6,

	FailureRequiringAppLaunchNoServiceInArea = 7,

	FailureRequiringAppLaunchServiceTemporarilyUnavailable = 8,

	FailureRequiringAppLaunchPreviousRideNeedsCompletion = 9,

	FailureRequiringAppLaunchRideScheduledTooFar = 10
}

/**
 * @since 13.0
 */
declare class INReservation extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INReservation; // inherited from NSObject

	static new(): INReservation; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly URL: NSURL;

	readonly actions: NSArray<INReservationAction>;

	readonly bookingTime: Date;

	readonly itemReference: INSpeakableString;

	readonly reservationHolderName: string;

	readonly reservationNumber: string;

	readonly reservationStatus: INReservationStatus;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class INReservationAction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INReservationAction; // inherited from NSObject

	static new(): INReservationAction; // inherited from NSObject

	readonly type: INReservationActionType;

	readonly userActivity: NSUserActivity;

	readonly validDuration: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { type: INReservationActionType; validDuration: INDateComponentsRange; userActivity: NSUserActivity; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTypeValidDurationUserActivity(type: INReservationActionType, validDuration: INDateComponentsRange, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 */
declare const enum INReservationActionType {

	Unknown = 0,

	CheckIn = 1
}

/**
 * @since 13.0
 */
declare const enum INReservationStatus {

	Unknown = 0,

	Canceled = 1,

	Pending = 2,

	Hold = 3,

	Confirmed = 4
}

/**
 * @since 10.0
 */
declare class INRestaurant extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRestaurant; // inherited from NSObject

	static new(): INRestaurant; // inherited from NSObject

	location: CLLocation;

	name: string;

	restaurantIdentifier: string;

	vendorIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { location: CLLocation; name: string; vendorIdentifier: string; restaurantIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocationNameVendorIdentifierRestaurantIdentifier(location: CLLocation, name: string, vendorIdentifier: string, restaurantIdentifier: string): this;
}

/**
 * @since 10.0
 */
declare class INRestaurantGuest extends INPerson {

	static alloc(): INRestaurantGuest; // inherited from NSObject

	static new(): INRestaurantGuest; // inherited from NSObject

	emailAddress: string;

	phoneNumber: string;

	constructor(o: { nameComponents: NSPersonNameComponents; phoneNumber: string; emailAddress: string; });

	initWithNameComponentsPhoneNumberEmailAddress(nameComponents: NSPersonNameComponents, phoneNumber: string, emailAddress: string): this;
}

/**
 * @since 10.0
 */
declare class INRestaurantGuestDisplayPreferences extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRestaurantGuestDisplayPreferences; // inherited from NSObject

	static new(): INRestaurantGuestDisplayPreferences; // inherited from NSObject

	emailAddressEditable: boolean;

	emailAddressFieldShouldBeDisplayed: boolean;

	nameEditable: boolean;

	nameFieldFirstNameOptional: boolean;

	nameFieldLastNameOptional: boolean;

	nameFieldShouldBeDisplayed: boolean;

	phoneNumberEditable: boolean;

	phoneNumberFieldShouldBeDisplayed: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class INRestaurantGuestResolutionResult extends INIntentResolutionResult {

	static alloc(): INRestaurantGuestResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithRestaurantGuestToConfirm(restaurantGuestToConfirm: INRestaurantGuest): INRestaurantGuestResolutionResult;

	static disambiguationWithRestaurantGuestsToDisambiguate(restaurantGuestsToDisambiguate: NSArray<INRestaurantGuest> | INRestaurantGuest[]): INRestaurantGuestResolutionResult;

	static needsValue(): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRestaurantGuestResolutionResult; // inherited from NSObject

	static notRequired(): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRestaurantGuest(resolvedRestaurantGuest: INRestaurantGuest): INRestaurantGuestResolutionResult;

	static unsupported(): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INRestaurantOffer extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRestaurantOffer; // inherited from NSObject

	static new(): INRestaurantOffer; // inherited from NSObject

	offerDetailText: string;

	offerIdentifier: string;

	offerTitleText: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class INRestaurantReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INRestaurantReservation; // inherited from NSObject

	static new(): INRestaurantReservation; // inherited from NSObject

	readonly partySize: number;

	readonly reservationDuration: INDateComponentsRange;

	readonly restaurantLocation: CLPlacemark;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; reservationDuration: INDateComponentsRange; partySize: number; restaurantLocation: CLPlacemark; });

	/**
	 * @since 14.0
	 */
	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; reservationDuration: INDateComponentsRange; partySize: number; restaurantLocation: CLPlacemark; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsReservationDurationPartySizeRestaurantLocation(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], reservationDuration: INDateComponentsRange, partySize: number, restaurantLocation: CLPlacemark): this;

	/**
	 * @since 14.0
	 */
	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLReservationDurationPartySizeRestaurantLocation(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, reservationDuration: INDateComponentsRange, partySize: number, restaurantLocation: CLPlacemark): this;
}

/**
 * @since 10.0
 */
declare class INRestaurantReservationBooking extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRestaurantReservationBooking; // inherited from NSObject

	static new(): INRestaurantReservationBooking; // inherited from NSObject

	bookingAvailable: boolean;

	bookingDate: Date;

	bookingDescription: string;

	bookingIdentifier: string;

	offers: NSArray<INRestaurantOffer>;

	partySize: number;

	requiresEmailAddress: boolean;

	requiresManualRequest: boolean;

	requiresName: boolean;

	requiresPhoneNumber: boolean;

	restaurant: INRestaurant;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { restaurant: INRestaurant; bookingDate: Date; partySize: number; bookingIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRestaurantBookingDatePartySizeBookingIdentifier(restaurant: INRestaurant, bookingDate: Date, partySize: number, bookingIdentifier: string): this;
}

/**
 * @since 10.0
 */
declare class INRestaurantReservationUserBooking extends INRestaurantReservationBooking implements NSCopying {

	static alloc(): INRestaurantReservationUserBooking; // inherited from NSObject

	static new(): INRestaurantReservationUserBooking; // inherited from NSObject

	advisementText: string;

	dateStatusModified: Date;

	guest: INRestaurantGuest;

	guestProvidedSpecialRequestText: string;

	selectedOffer: INRestaurantOffer;

	status: INRestaurantReservationUserBookingStatus;

	constructor(o: { restaurant: INRestaurant; bookingDate: Date; partySize: number; bookingIdentifier: string; guest: INRestaurantGuest; status: INRestaurantReservationUserBookingStatus; dateStatusModified: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithRestaurantBookingDatePartySizeBookingIdentifierGuestStatusDateStatusModified(restaurant: INRestaurant, bookingDate: Date, partySize: number, bookingIdentifier: string, guest: INRestaurantGuest, status: INRestaurantReservationUserBookingStatus, dateStatusModified: Date): this;
}

declare const enum INRestaurantReservationUserBookingStatus {

	Pending = 0,

	Confirmed = 1,

	Denied = 2
}

/**
 * @since 10.0
 */
declare class INRestaurantResolutionResult extends INIntentResolutionResult {

	static alloc(): INRestaurantResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INRestaurantResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithRestaurantToConfirm(restaurantToConfirm: INRestaurant): INRestaurantResolutionResult;

	static disambiguationWithRestaurantsToDisambiguate(restaurantsToDisambiguate: NSArray<INRestaurant> | INRestaurant[]): INRestaurantResolutionResult;

	static needsValue(): INRestaurantResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRestaurantResolutionResult; // inherited from NSObject

	static notRequired(): INRestaurantResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRestaurant(resolvedRestaurant: INRestaurant): INRestaurantResolutionResult;

	static unsupported(): INRestaurantResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INRestaurantResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INResumeWorkoutIntent extends INIntent {

	static alloc(): INResumeWorkoutIntent; // inherited from NSObject

	static new(): INResumeWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

/**
 * @since 10.0
 */
interface INResumeWorkoutIntentHandling extends NSObjectProtocol {

	confirmResumeWorkoutCompletion?(intent: INResumeWorkoutIntent, completion: (p1: INResumeWorkoutIntentResponse) => void): void;

	handleResumeWorkoutCompletion(intent: INResumeWorkoutIntent, completion: (p1: INResumeWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForResumeWorkoutWithCompletion?(intent: INResumeWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INResumeWorkoutIntentHandling: {

	prototype: INResumeWorkoutIntentHandling;
};

/**
 * @since 10.0
 */
declare var INResumeWorkoutIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INResumeWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INResumeWorkoutIntentResponse; // inherited from NSObject

	static new(): INResumeWorkoutIntentResponse; // inherited from NSObject

	readonly code: INResumeWorkoutIntentResponseCode;

	constructor(o: { code: INResumeWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INResumeWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INResumeWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	HandleInApp = 6,

	Success = 7
}

/**
 * @since 10.0
 */
declare class INRideCompletionStatus extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRideCompletionStatus; // inherited from NSObject

	static canceledByService(): INRideCompletionStatus;

	static canceledByUser(): INRideCompletionStatus;

	static canceledMissedPickup(): INRideCompletionStatus;

	static completed(): INRideCompletionStatus;

	/**
	 * @since 11.0
	 */
	static completedWithOutstandingFeedbackType(feedbackType: INRideFeedbackTypeOptions): INRideCompletionStatus;

	static completedWithOutstandingPaymentAmount(outstandingPaymentAmount: INCurrencyAmount): INRideCompletionStatus;

	static completedWithSettledPaymentAmount(settledPaymentAmount: INCurrencyAmount): INRideCompletionStatus;

	static new(): INRideCompletionStatus; // inherited from NSObject

	readonly canceled: boolean;

	readonly completed: boolean;

	completionUserActivity: NSUserActivity;

	/**
	 * @since 11.0
	 */
	defaultTippingOptions: NSSet<INCurrencyAmount>;

	/**
	 * @since 11.0
	 */
	readonly feedbackType: INRideFeedbackTypeOptions;

	readonly missedPickup: boolean;

	readonly outstanding: boolean;

	readonly paymentAmount: INCurrencyAmount;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class INRideDriver extends INPerson implements NSCopying, NSSecureCoding {

	static alloc(): INRideDriver; // inherited from NSObject

	static new(): INRideDriver; // inherited from NSObject

	readonly phoneNumber: string;

	readonly rating: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	constructor(o: { handle: string; displayName: string; image: INImage; rating: string; phoneNumber: string; });

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	constructor(o: { handle: string; nameComponents: NSPersonNameComponents; image: INImage; rating: string; phoneNumber: string; });

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; rating: string; phoneNumber: string; });

	/**
	 * @since 10.2
	 */
	constructor(o: { phoneNumber: string; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; rating: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	initWithHandleDisplayNameImageRatingPhoneNumber(handle: string, displayName: string, image: INImage, rating: string, phoneNumber: string): this;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	initWithHandleNameComponentsImageRatingPhoneNumber(handle: string, nameComponents: NSPersonNameComponents, image: INImage, rating: string, phoneNumber: string): this;

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	initWithPersonHandleNameComponentsDisplayNameImageRatingPhoneNumber(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, rating: string, phoneNumber: string): this;

	/**
	 * @since 10.2
	 */
	initWithPhoneNumberNameComponentsDisplayNameImageRating(phoneNumber: string, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, rating: string): this;
}

/**
 * @since 10.0
 */
declare class INRideFareLineItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRideFareLineItem; // inherited from NSObject

	static new(): INRideFareLineItem; // inherited from NSObject

	readonly currencyCode: string;

	readonly price: NSDecimalNumber;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: string; price: NSDecimalNumber; currencyCode: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitlePriceCurrencyCode(title: string, price: NSDecimalNumber, currencyCode: string): this;
}

/**
 * @since 11.0
 */
declare const enum INRideFeedbackTypeOptions {

	Rate = 1,

	Tip = 2
}

/**
 * @since 10.0
 */
declare class INRideOption extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRideOption; // inherited from NSObject

	static new(): INRideOption; // inherited from NSObject

	availablePartySizeOptions: NSArray<INRidePartySizeOption>;

	availablePartySizeOptionsSelectionPrompt: string;

	disclaimerMessage: string;

	estimatedPickupDate: Date;

	fareLineItems: NSArray<INRideFareLineItem>;

	identifier: string;

	name: string;

	priceRange: INPriceRange;

	specialPricing: string;

	specialPricingBadgeImage: INImage;

	userActivityForBookingInApplication: NSUserActivity;

	usesMeteredFare: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; estimatedPickupDate: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameEstimatedPickupDate(name: string, estimatedPickupDate: Date): this;
}

/**
 * @since 10.0
 */
declare class INRidePartySizeOption extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRidePartySizeOption; // inherited from NSObject

	static new(): INRidePartySizeOption; // inherited from NSObject

	readonly partySizeRange: NSRange;

	readonly priceRange: INPriceRange;

	readonly sizeDescription: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { partySizeRange: NSRange; sizeDescription: string; priceRange: INPriceRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPartySizeRangeSizeDescriptionPriceRange(partySizeRange: NSRange, sizeDescription: string, priceRange: INPriceRange): this;
}

/**
 * @since 10.0
 */
declare const enum INRidePhase {

	Unknown = 0,

	Received = 1,

	Confirmed = 2,

	Ongoing = 3,

	Completed = 4,

	ApproachingPickup = 5,

	Pickup = 6
}

/**
 * @since 10.0
 */
declare class INRideStatus extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRideStatus; // inherited from NSObject

	static new(): INRideStatus; // inherited from NSObject

	additionalActionActivities: NSArray<NSUserActivity>;

	completionStatus: INRideCompletionStatus;

	driver: INRideDriver;

	dropOffLocation: CLPlacemark;

	estimatedDropOffDate: Date;

	estimatedPickupDate: Date;

	estimatedPickupEndDate: Date;

	phase: INRidePhase;

	pickupLocation: CLPlacemark;

	rideIdentifier: string;

	rideOption: INRideOption;

	/**
	 * @since 10.3
	 */
	scheduledPickupTime: INDateComponentsRange;

	userActivityForCancelingInApplication: NSUserActivity;

	vehicle: INRideVehicle;

	waypoints: NSArray<CLPlacemark>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class INRideVehicle extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRideVehicle; // inherited from NSObject

	static new(): INRideVehicle; // inherited from NSObject

	location: CLLocation;

	manufacturer: string;

	mapAnnotationImage: INImage;

	model: string;

	registrationPlate: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 * @deprecated 13.0
 */
interface INRidesharingDomainHandling extends INCancelRideIntentHandling, INGetRideStatusIntentHandling, INListRideOptionsIntentHandling, INRequestRideIntentHandling, INSendRideFeedbackIntentHandling {
}
declare var INRidesharingDomainHandling: {

	prototype: INRidesharingDomainHandling;
};

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSaveProfileInCarIntent extends INIntent {

	static alloc(): INSaveProfileInCarIntent; // inherited from NSObject

	static new(): INSaveProfileInCarIntent; // inherited from NSObject

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	readonly profileLabel: string;

	/**
	 * @since 10.2
	 */
	readonly profileName: string;

	readonly profileNumber: number;

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	constructor(o: { profileNumber: number; profileLabel: string; });

	/**
	 * @since 10.2
	 */
	constructor(o: { profileNumber: number; profileName: string; });

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	initWithProfileNumberProfileLabel(profileNumber: number, profileLabel: string): this;

	/**
	 * @since 10.2
	 */
	initWithProfileNumberProfileName(profileNumber: number, profileName: string): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSaveProfileInCarIntentHandling extends NSObjectProtocol {

	confirmSaveProfileInCarCompletion?(intent: INSaveProfileInCarIntent, completion: (p1: INSaveProfileInCarIntentResponse) => void): void;

	handleSaveProfileInCarCompletion(intent: INSaveProfileInCarIntent, completion: (p1: INSaveProfileInCarIntentResponse) => void): void;

	/**
	 * @since 10.2
	 */
	resolveProfileNameForSaveProfileInCarWithCompletion?(intent: INSaveProfileInCarIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveProfileNumberForSaveProfileInCarWithCompletion?(intent: INSaveProfileInCarIntent, completion: (p1: INIntegerResolutionResult) => void): void;
}
declare var INSaveProfileInCarIntentHandling: {

	prototype: INSaveProfileInCarIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSaveProfileInCarIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSaveProfileInCarIntentResponse extends INIntentResponse {

	static alloc(): INSaveProfileInCarIntentResponse; // inherited from NSObject

	static new(): INSaveProfileInCarIntentResponse; // inherited from NSObject

	readonly code: INSaveProfileInCarIntentResponseCode;

	constructor(o: { code: INSaveProfileInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSaveProfileInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSaveProfileInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSearchCallHistoryIntent extends INIntent {

	static alloc(): INSearchCallHistoryIntent; // inherited from NSObject

	static new(): INSearchCallHistoryIntent; // inherited from NSObject

	readonly callCapabilities: INCallCapabilityOptions;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	readonly callType: INCallRecordType;

	/**
	 * @since 11.0
	 */
	readonly callTypes: INCallRecordTypeOptions;

	readonly dateCreated: INDateComponentsRange;

	readonly recipient: INPerson;

	/**
	 * @since 11.0
	 */
	readonly unseen: number;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	constructor(o: { callType: INCallRecordType; dateCreated: INDateComponentsRange; recipient: INPerson; callCapabilities: INCallCapabilityOptions; });

	/**
	 * @since 11.0
	 */
	constructor(o: { dateCreated: INDateComponentsRange; recipient: INPerson; callCapabilities: INCallCapabilityOptions; callTypes: INCallRecordTypeOptions; unseen: number; });

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	initWithCallTypeDateCreatedRecipientCallCapabilities(callType: INCallRecordType, dateCreated: INDateComponentsRange, recipient: INPerson, callCapabilities: INCallCapabilityOptions): this;

	/**
	 * @since 11.0
	 */
	initWithDateCreatedRecipientCallCapabilitiesCallTypesUnseen(dateCreated: INDateComponentsRange, recipient: INPerson, callCapabilities: INCallCapabilityOptions, callTypes: INCallRecordTypeOptions, unseen: number): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSearchCallHistoryIntentHandling extends NSObjectProtocol {

	confirmSearchCallHistoryCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INSearchCallHistoryIntentResponse) => void): void;

	handleSearchCallHistoryCompletion(intent: INSearchCallHistoryIntent, completion: (p1: INSearchCallHistoryIntentResponse) => void): void;

	resolveCallTypeForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INCallRecordTypeResolutionResult) => void): void;

	/**
	 * @since 11.0
	 */
	resolveCallTypesForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INCallRecordTypeOptionsResolutionResult) => void): void;

	resolveDateCreatedForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveRecipientForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INPersonResolutionResult) => void): void;

	/**
	 * @since 11.0
	 */
	resolveUnseenForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INBooleanResolutionResult) => void): void;
}
declare var INSearchCallHistoryIntentHandling: {

	prototype: INSearchCallHistoryIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSearchCallHistoryIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSearchCallHistoryIntentResponse extends INIntentResponse {

	static alloc(): INSearchCallHistoryIntentResponse; // inherited from NSObject

	static new(): INSearchCallHistoryIntentResponse; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	callRecords: NSArray<INCallRecord>;

	readonly code: INSearchCallHistoryIntentResponseCode;

	constructor(o: { code: INSearchCallHistoryIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchCallHistoryIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSearchCallHistoryIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureAppConfigurationRequired = 5,

	InProgress = 6,

	Success = 7
}

/**
 * @since 11.0
 */
declare class INSearchForAccountsIntent extends INIntent {

	static alloc(): INSearchForAccountsIntent; // inherited from NSObject

	static new(): INSearchForAccountsIntent; // inherited from NSObject

	readonly accountNickname: INSpeakableString;

	readonly accountType: INAccountType;

	readonly organizationName: INSpeakableString;

	readonly requestedBalanceType: INBalanceType;

	constructor(o: { accountNickname: INSpeakableString; accountType: INAccountType; organizationName: INSpeakableString; requestedBalanceType: INBalanceType; });

	initWithAccountNicknameAccountTypeOrganizationNameRequestedBalanceType(accountNickname: INSpeakableString, accountType: INAccountType, organizationName: INSpeakableString, requestedBalanceType: INBalanceType): this;
}

/**
 * @since 11.0
 */
interface INSearchForAccountsIntentHandling extends NSObjectProtocol {

	confirmSearchForAccountsCompletion?(intent: INSearchForAccountsIntent, completion: (p1: INSearchForAccountsIntentResponse) => void): void;

	handleSearchForAccountsCompletion(intent: INSearchForAccountsIntent, completion: (p1: INSearchForAccountsIntentResponse) => void): void;

	resolveAccountNicknameForSearchForAccountsWithCompletion?(intent: INSearchForAccountsIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveAccountTypeForSearchForAccountsWithCompletion?(intent: INSearchForAccountsIntent, completion: (p1: INAccountTypeResolutionResult) => void): void;

	resolveOrganizationNameForSearchForAccountsWithCompletion?(intent: INSearchForAccountsIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveRequestedBalanceTypeForSearchForAccountsWithCompletion?(intent: INSearchForAccountsIntent, completion: (p1: INBalanceTypeResolutionResult) => void): void;
}
declare var INSearchForAccountsIntentHandling: {

	prototype: INSearchForAccountsIntentHandling;
};

/**
 * @since 11.0
 */
declare class INSearchForAccountsIntentResponse extends INIntentResponse {

	static alloc(): INSearchForAccountsIntentResponse; // inherited from NSObject

	static new(): INSearchForAccountsIntentResponse; // inherited from NSObject

	accounts: NSArray<INPaymentAccount>;

	readonly code: INSearchForAccountsIntentResponseCode;

	constructor(o: { code: INSearchForAccountsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForAccountsIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 */
declare const enum INSearchForAccountsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCredentialsUnverified = 6,

	FailureAccountNotFound = 7,

	FailureTermsAndConditionsAcceptanceRequired = 8,

	FailureNotEligible = 9
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INSearchForBillsIntent extends INIntent {

	static alloc(): INSearchForBillsIntent; // inherited from NSObject

	static new(): INSearchForBillsIntent; // inherited from NSObject

	readonly billPayee: INBillPayee;

	readonly billType: INBillType;

	readonly dueDateRange: INDateComponentsRange;

	readonly paymentDateRange: INDateComponentsRange;

	readonly status: INPaymentStatus;

	constructor(o: { billPayee: INBillPayee; paymentDateRange: INDateComponentsRange; billType: INBillType; status: INPaymentStatus; dueDateRange: INDateComponentsRange; });

	initWithBillPayeePaymentDateRangeBillTypeStatusDueDateRange(billPayee: INBillPayee, paymentDateRange: INDateComponentsRange, billType: INBillType, status: INPaymentStatus, dueDateRange: INDateComponentsRange): this;
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
interface INSearchForBillsIntentHandling extends NSObjectProtocol {

	confirmSearchForBillsCompletion?(intent: INSearchForBillsIntent, completion: (p1: INSearchForBillsIntentResponse) => void): void;

	handleSearchForBillsCompletion(intent: INSearchForBillsIntent, completion: (p1: INSearchForBillsIntentResponse) => void): void;

	resolveBillPayeeForSearchForBillsWithCompletion?(intent: INSearchForBillsIntent, completion: (p1: INBillPayeeResolutionResult) => void): void;

	resolveBillTypeForSearchForBillsWithCompletion?(intent: INSearchForBillsIntent, completion: (p1: INBillTypeResolutionResult) => void): void;

	resolveDueDateRangeForSearchForBillsWithCompletion?(intent: INSearchForBillsIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolvePaymentDateRangeForSearchForBillsWithCompletion?(intent: INSearchForBillsIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveStatusForSearchForBillsWithCompletion?(intent: INSearchForBillsIntent, completion: (p1: INPaymentStatusResolutionResult) => void): void;
}
declare var INSearchForBillsIntentHandling: {

	prototype: INSearchForBillsIntentHandling;
};

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare class INSearchForBillsIntentResponse extends INIntentResponse {

	static alloc(): INSearchForBillsIntentResponse; // inherited from NSObject

	static new(): INSearchForBillsIntentResponse; // inherited from NSObject

	bills: NSArray<INBillDetails>;

	readonly code: INSearchForBillsIntentResponseCode;

	constructor(o: { code: INSearchForBillsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForBillsIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.3
 * @deprecated 15.0
 */
declare const enum INSearchForBillsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCredentialsUnverified = 6,

	FailureBillNotFound = 7
}

/**
 * @since 13.0
 */
declare class INSearchForMediaIntent extends INIntent {

	static alloc(): INSearchForMediaIntent; // inherited from NSObject

	static new(): INSearchForMediaIntent; // inherited from NSObject

	readonly mediaItems: NSArray<INMediaItem>;

	readonly mediaSearch: INMediaSearch;

	constructor(o: { mediaItems: NSArray<INMediaItem> | INMediaItem[]; mediaSearch: INMediaSearch; });

	initWithMediaItemsMediaSearch(mediaItems: NSArray<INMediaItem> | INMediaItem[], mediaSearch: INMediaSearch): this;
}

/**
 * @since 13.0
 */
interface INSearchForMediaIntentHandling extends NSObjectProtocol {

	confirmSearchForMediaCompletion?(intent: INSearchForMediaIntent, completion: (p1: INSearchForMediaIntentResponse) => void): void;

	handleSearchForMediaCompletion(intent: INSearchForMediaIntent, completion: (p1: INSearchForMediaIntentResponse) => void): void;

	resolveMediaItemsForSearchForMediaWithCompletion?(intent: INSearchForMediaIntent, completion: (p1: NSArray<INSearchForMediaMediaItemResolutionResult>) => void): void;
}
declare var INSearchForMediaIntentHandling: {

	prototype: INSearchForMediaIntentHandling;
};

/**
 * @since 13.0
 */
declare class INSearchForMediaIntentResponse extends INIntentResponse {

	static alloc(): INSearchForMediaIntentResponse; // inherited from NSObject

	static new(): INSearchForMediaIntentResponse; // inherited from NSObject

	readonly code: INSearchForMediaIntentResponseCode;

	mediaItems: NSArray<INMediaItem>;

	constructor(o: { code: INSearchForMediaIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForMediaIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 */
declare const enum INSearchForMediaIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	InProgress = 3,

	Success = 4,

	Failure = 5,

	FailureRequiringAppLaunch = 6
}

/**
 * @since 13.0
 */
declare class INSearchForMediaMediaItemResolutionResult extends INMediaItemResolutionResult {

	static alloc(): INSearchForMediaMediaItemResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSearchForMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaItemToConfirm(mediaItemToConfirm: INMediaItem): INSearchForMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static disambiguationWithMediaItemsToDisambiguate(mediaItemsToDisambiguate: NSArray<INMediaItem> | INMediaItem[]): INSearchForMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static needsValue(): INSearchForMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSearchForMediaMediaItemResolutionResult; // inherited from NSObject

	static notRequired(): INSearchForMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaItem(resolvedMediaItem: INMediaItem): INSearchForMediaMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static unsupported(): INSearchForMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSearchForMediaMediaItemUnsupportedReason): INSearchForMediaMediaItemResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSearchForMediaMediaItemResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { mediaItemResolutionResult: INMediaItemResolutionResult; });

	initWithMediaItemResolutionResult(mediaItemResolutionResult: INMediaItemResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INSearchForMediaMediaItemUnsupportedReason {

	LoginRequired = 1,

	SubscriptionRequired = 2,

	UnsupportedMediaType = 3,

	ExplicitContentSettings = 4,

	CellularDataSettings = 5,

	RestrictedContent = 6,

	ServiceUnavailable = 7,

	RegionRestriction = 8
}

/**
 * @since 10.0
 */
declare class INSearchForMessagesIntent extends INIntent {

	static alloc(): INSearchForMessagesIntent; // inherited from NSObject

	static new(): INSearchForMessagesIntent; // inherited from NSObject

	readonly attributes: INMessageAttributeOptions;

	/**
	 * @since 12.0
	 */
	readonly conversationIdentifiers: NSArray<string>;

	/**
	 * @since 12.0
	 */
	readonly conversationIdentifiersOperator: INConditionalOperator;

	readonly dateTimeRange: INDateComponentsRange;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	readonly groupNames: NSArray<string>;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	readonly groupNamesOperator: INConditionalOperator;

	readonly identifiers: NSArray<string>;

	readonly identifiersOperator: INConditionalOperator;

	readonly notificationIdentifiers: NSArray<string>;

	readonly notificationIdentifiersOperator: INConditionalOperator;

	readonly recipients: NSArray<INPerson>;

	readonly recipientsOperator: INConditionalOperator;

	readonly searchTerms: NSArray<string>;

	readonly searchTermsOperator: INConditionalOperator;

	readonly senders: NSArray<INPerson>;

	readonly sendersOperator: INConditionalOperator;

	/**
	 * @since 11.0
	 */
	readonly speakableGroupNames: NSArray<INSpeakableString>;

	/**
	 * @since 11.0
	 */
	readonly speakableGroupNamesOperator: INConditionalOperator;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	constructor(o: { recipients: NSArray<INPerson> | INPerson[]; senders: NSArray<INPerson> | INPerson[]; searchTerms: NSArray<string> | string[]; attributes: INMessageAttributeOptions; dateTimeRange: INDateComponentsRange; identifiers: NSArray<string> | string[]; notificationIdentifiers: NSArray<string> | string[]; groupNames: NSArray<string> | string[]; });

	/**
	 * @since 11.0
	 * @deprecated 12.0
	 */
	constructor(o: { recipients: NSArray<INPerson> | INPerson[]; senders: NSArray<INPerson> | INPerson[]; searchTerms: NSArray<string> | string[]; attributes: INMessageAttributeOptions; dateTimeRange: INDateComponentsRange; identifiers: NSArray<string> | string[]; notificationIdentifiers: NSArray<string> | string[]; speakableGroupNames: NSArray<INSpeakableString> | INSpeakableString[]; });

	/**
	 * @since 12.0
	 */
	constructor(o: { recipients: NSArray<INPerson> | INPerson[]; senders: NSArray<INPerson> | INPerson[]; searchTerms: NSArray<string> | string[]; attributes: INMessageAttributeOptions; dateTimeRange: INDateComponentsRange; identifiers: NSArray<string> | string[]; notificationIdentifiers: NSArray<string> | string[]; speakableGroupNames: NSArray<INSpeakableString> | INSpeakableString[]; conversationIdentifiers: NSArray<string> | string[]; });

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	initWithRecipientsSendersSearchTermsAttributesDateTimeRangeIdentifiersNotificationIdentifiersGroupNames(recipients: NSArray<INPerson> | INPerson[], senders: NSArray<INPerson> | INPerson[], searchTerms: NSArray<string> | string[], attributes: INMessageAttributeOptions, dateTimeRange: INDateComponentsRange, identifiers: NSArray<string> | string[], notificationIdentifiers: NSArray<string> | string[], groupNames: NSArray<string> | string[]): this;

	/**
	 * @since 11.0
	 * @deprecated 12.0
	 */
	initWithRecipientsSendersSearchTermsAttributesDateTimeRangeIdentifiersNotificationIdentifiersSpeakableGroupNames(recipients: NSArray<INPerson> | INPerson[], senders: NSArray<INPerson> | INPerson[], searchTerms: NSArray<string> | string[], attributes: INMessageAttributeOptions, dateTimeRange: INDateComponentsRange, identifiers: NSArray<string> | string[], notificationIdentifiers: NSArray<string> | string[], speakableGroupNames: NSArray<INSpeakableString> | INSpeakableString[]): this;

	/**
	 * @since 12.0
	 */
	initWithRecipientsSendersSearchTermsAttributesDateTimeRangeIdentifiersNotificationIdentifiersSpeakableGroupNamesConversationIdentifiers(recipients: NSArray<INPerson> | INPerson[], senders: NSArray<INPerson> | INPerson[], searchTerms: NSArray<string> | string[], attributes: INMessageAttributeOptions, dateTimeRange: INDateComponentsRange, identifiers: NSArray<string> | string[], notificationIdentifiers: NSArray<string> | string[], speakableGroupNames: NSArray<INSpeakableString> | INSpeakableString[], conversationIdentifiers: NSArray<string> | string[]): this;
}

/**
 * @since 10.0
 */
interface INSearchForMessagesIntentHandling extends NSObjectProtocol {

	confirmSearchForMessagesCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INSearchForMessagesIntentResponse) => void): void;

	handleSearchForMessagesCompletion(intent: INSearchForMessagesIntent, completion: (p1: INSearchForMessagesIntentResponse) => void): void;

	resolveAttributesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INMessageAttributeOptionsResolutionResult) => void): void;

	resolveDateTimeRangeForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolveGroupNamesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INStringResolutionResult>) => void): void;

	resolveRecipientsForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	resolveSendersForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	/**
	 * @since 11.0
	 */
	resolveSpeakableGroupNamesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INSpeakableStringResolutionResult>) => void): void;
}
declare var INSearchForMessagesIntentHandling: {

	prototype: INSearchForMessagesIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSearchForMessagesIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INSearchForMessagesIntentResponse extends INIntentResponse {

	static alloc(): INSearchForMessagesIntentResponse; // inherited from NSObject

	static new(): INSearchForMessagesIntentResponse; // inherited from NSObject

	readonly code: INSearchForMessagesIntentResponseCode;

	messages: NSArray<INMessage>;

	constructor(o: { code: INSearchForMessagesIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForMessagesIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INSearchForMessagesIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureMessageServiceNotAvailable = 6,

	FailureMessageTooManyResults = 7,

	FailureRequiringInAppAuthentication = 8
}

/**
 * @since 11.0
 */
declare class INSearchForNotebookItemsIntent extends INIntent {

	static alloc(): INSearchForNotebookItemsIntent; // inherited from NSObject

	static new(): INSearchForNotebookItemsIntent; // inherited from NSObject

	readonly content: string;

	readonly dateSearchType: INDateSearchType;

	readonly dateTime: INDateComponentsRange;

	readonly itemType: INNotebookItemType;

	readonly location: CLPlacemark;

	readonly locationSearchType: INLocationSearchType;

	/**
	 * @since 11.2
	 */
	readonly notebookItemIdentifier: string;

	readonly status: INTaskStatus;

	/**
	 * @since 13.0
	 */
	readonly taskPriority: INTaskPriority;

	/**
	 * @since 13.0
	 */
	readonly temporalEventTriggerTypes: INTemporalEventTriggerTypeOptions;

	readonly title: INSpeakableString;

	/**
	 * @since 11.0
	 * @deprecated 11.2
	 */
	constructor(o: { title: INSpeakableString; content: string; itemType: INNotebookItemType; status: INTaskStatus; location: CLPlacemark; locationSearchType: INLocationSearchType; dateTime: INDateComponentsRange; dateSearchType: INDateSearchType; });

	/**
	 * @since 11.2
	 * @deprecated 13.0
	 */
	constructor(o: { title: INSpeakableString; content: string; itemType: INNotebookItemType; status: INTaskStatus; location: CLPlacemark; locationSearchType: INLocationSearchType; dateTime: INDateComponentsRange; dateSearchType: INDateSearchType; notebookItemIdentifier: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { title: INSpeakableString; content: string; itemType: INNotebookItemType; status: INTaskStatus; location: CLPlacemark; locationSearchType: INLocationSearchType; dateTime: INDateComponentsRange; dateSearchType: INDateSearchType; temporalEventTriggerTypes: INTemporalEventTriggerTypeOptions; taskPriority: INTaskPriority; notebookItemIdentifier: string; });

	/**
	 * @since 11.0
	 * @deprecated 11.2
	 */
	initWithTitleContentItemTypeStatusLocationLocationSearchTypeDateTimeDateSearchType(title: INSpeakableString, content: string, itemType: INNotebookItemType, status: INTaskStatus, location: CLPlacemark, locationSearchType: INLocationSearchType, dateTime: INDateComponentsRange, dateSearchType: INDateSearchType): this;

	/**
	 * @since 11.2
	 * @deprecated 13.0
	 */
	initWithTitleContentItemTypeStatusLocationLocationSearchTypeDateTimeDateSearchTypeNotebookItemIdentifier(title: INSpeakableString, content: string, itemType: INNotebookItemType, status: INTaskStatus, location: CLPlacemark, locationSearchType: INLocationSearchType, dateTime: INDateComponentsRange, dateSearchType: INDateSearchType, notebookItemIdentifier: string): this;

	/**
	 * @since 13.0
	 */
	initWithTitleContentItemTypeStatusLocationLocationSearchTypeDateTimeDateSearchTypeTemporalEventTriggerTypesTaskPriorityNotebookItemIdentifier(title: INSpeakableString, content: string, itemType: INNotebookItemType, status: INTaskStatus, location: CLPlacemark, locationSearchType: INLocationSearchType, dateTime: INDateComponentsRange, dateSearchType: INDateSearchType, temporalEventTriggerTypes: INTemporalEventTriggerTypeOptions, taskPriority: INTaskPriority, notebookItemIdentifier: string): this;
}

/**
 * @since 11.0
 */
interface INSearchForNotebookItemsIntentHandling extends NSObjectProtocol {

	confirmSearchForNotebookItemsCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INSearchForNotebookItemsIntentResponse) => void): void;

	handleSearchForNotebookItemsCompletion(intent: INSearchForNotebookItemsIntent, completion: (p1: INSearchForNotebookItemsIntentResponse) => void): void;

	resolveContentForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveDateSearchTypeForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INDateSearchTypeResolutionResult) => void): void;

	resolveDateTimeForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveItemTypeForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INNotebookItemTypeResolutionResult) => void): void;

	resolveLocationForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolveLocationSearchTypeForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INLocationSearchTypeResolutionResult) => void): void;

	resolveStatusForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INTaskStatusResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolveTaskPriorityForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INTaskPriorityResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolveTemporalEventTriggerTypesForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INTemporalEventTriggerTypeOptionsResolutionResult) => void): void;

	resolveTitleForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INSearchForNotebookItemsIntentHandling: {

	prototype: INSearchForNotebookItemsIntentHandling;
};

/**
 * @since 11.0
 */
declare class INSearchForNotebookItemsIntentResponse extends INIntentResponse {

	static alloc(): INSearchForNotebookItemsIntentResponse; // inherited from NSObject

	static new(): INSearchForNotebookItemsIntentResponse; // inherited from NSObject

	readonly code: INSearchForNotebookItemsIntentResponseCode;

	notes: NSArray<INNote>;

	sortType: INSortType;

	taskLists: NSArray<INTaskList>;

	tasks: NSArray<INTask>;

	constructor(o: { code: INSearchForNotebookItemsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForNotebookItemsIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 */
declare const enum INSearchForNotebookItemsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSearchForPhotosIntent extends INIntent {

	static alloc(): INSearchForPhotosIntent; // inherited from NSObject

	static new(): INSearchForPhotosIntent; // inherited from NSObject

	readonly albumName: string;

	readonly dateCreated: INDateComponentsRange;

	readonly excludedAttributes: INPhotoAttributeOptions;

	readonly includedAttributes: INPhotoAttributeOptions;

	readonly locationCreated: CLPlacemark;

	readonly peopleInPhoto: NSArray<INPerson>;

	readonly peopleInPhotoOperator: INConditionalOperator;

	readonly searchTerms: NSArray<string>;

	readonly searchTermsOperator: INConditionalOperator;

	constructor(o: { dateCreated: INDateComponentsRange; locationCreated: CLPlacemark; albumName: string; searchTerms: NSArray<string> | string[]; includedAttributes: INPhotoAttributeOptions; excludedAttributes: INPhotoAttributeOptions; peopleInPhoto: NSArray<INPerson> | INPerson[]; });

	initWithDateCreatedLocationCreatedAlbumNameSearchTermsIncludedAttributesExcludedAttributesPeopleInPhoto(dateCreated: INDateComponentsRange, locationCreated: CLPlacemark, albumName: string, searchTerms: NSArray<string> | string[], includedAttributes: INPhotoAttributeOptions, excludedAttributes: INPhotoAttributeOptions, peopleInPhoto: NSArray<INPerson> | INPerson[]): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSearchForPhotosIntentHandling extends NSObjectProtocol {

	confirmSearchForPhotosCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INSearchForPhotosIntentResponse) => void): void;

	handleSearchForPhotosCompletion(intent: INSearchForPhotosIntent, completion: (p1: INSearchForPhotosIntentResponse) => void): void;

	resolveAlbumNameForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveDateCreatedForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveLocationCreatedForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePeopleInPhotoForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 15.0
	 */
	resolveSearchTermsForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: NSArray<INStringResolutionResult>) => void): void;
}
declare var INSearchForPhotosIntentHandling: {

	prototype: INSearchForPhotosIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSearchForPhotosIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSearchForPhotosIntentResponse extends INIntentResponse {

	static alloc(): INSearchForPhotosIntentResponse; // inherited from NSObject

	static new(): INSearchForPhotosIntentResponse; // inherited from NSObject

	readonly code: INSearchForPhotosIntentResponseCode;

	searchResultsCount: number;

	constructor(o: { code: INSearchForPhotosIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForPhotosIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSearchForPhotosIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureAppConfigurationRequired = 5
}

/**
 * @since 13.0
 */
declare class INSeat extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INSeat; // inherited from NSObject

	static new(): INSeat; // inherited from NSObject

	readonly seatNumber: string;

	readonly seatRow: string;

	readonly seatSection: string;

	readonly seatingType: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { seatSection: string; seatRow: string; seatNumber: string; seatingType: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSeatSectionSeatRowSeatNumberSeatingType(seatSection: string, seatRow: string, seatNumber: string, seatingType: string): this;
}

/**
 * @since 14.0
 */
declare class INSendMessageAttachment extends NSObject {

	static alloc(): INSendMessageAttachment; // inherited from NSObject

	static attachmentWithAudioMessageFile(audioMessageFile: INFile): INSendMessageAttachment;

	static new(): INSendMessageAttachment; // inherited from NSObject

	readonly audioMessageFile: INFile;
}

/**
 * @since 10.0
 */
declare class INSendMessageIntent extends INIntent implements UNNotificationContentProviding {

	static alloc(): INSendMessageIntent; // inherited from NSObject

	static new(): INSendMessageIntent; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly attachments: NSArray<INSendMessageAttachment>;

	readonly content: string;

	/**
	 * @since 11.0
	 */
	readonly conversationIdentifier: string;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	readonly groupName: string;

	/**
	 * @since 14.0
	 */
	readonly outgoingMessageType: INOutgoingMessageType;

	readonly recipients: NSArray<INPerson>;

	readonly sender: INPerson;

	readonly serviceName: string;

	/**
	 * @since 11.0
	 */
	readonly speakableGroupName: INSpeakableString;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	constructor(o: { recipients: NSArray<INPerson> | INPerson[]; content: string; groupName: string; serviceName: string; sender: INPerson; });

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	constructor(o: { recipients: NSArray<INPerson> | INPerson[]; content: string; speakableGroupName: INSpeakableString; conversationIdentifier: string; serviceName: string; sender: INPerson; });

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	constructor(o: { recipients: NSArray<INPerson> | INPerson[]; outgoingMessageType: INOutgoingMessageType; content: string; speakableGroupName: INSpeakableString; conversationIdentifier: string; serviceName: string; sender: INPerson; });

	/**
	 * @since 14.0
	 */
	constructor(o: { recipients: NSArray<INPerson> | INPerson[]; outgoingMessageType: INOutgoingMessageType; content: string; speakableGroupName: INSpeakableString; conversationIdentifier: string; serviceName: string; sender: INPerson; attachments: NSArray<INSendMessageAttachment> | INSendMessageAttachment[]; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	initWithRecipientsContentGroupNameServiceNameSender(recipients: NSArray<INPerson> | INPerson[], content: string, groupName: string, serviceName: string, sender: INPerson): this;

	/**
	 * @since 11.0
	 * @deprecated 14.0
	 */
	initWithRecipientsContentSpeakableGroupNameConversationIdentifierServiceNameSender(recipients: NSArray<INPerson> | INPerson[], content: string, speakableGroupName: INSpeakableString, conversationIdentifier: string, serviceName: string, sender: INPerson): this;

	/**
	 * @since 14.0
	 * @deprecated 14.0
	 */
	initWithRecipientsOutgoingMessageTypeContentSpeakableGroupNameConversationIdentifierServiceNameSender(recipients: NSArray<INPerson> | INPerson[], outgoingMessageType: INOutgoingMessageType, content: string, speakableGroupName: INSpeakableString, conversationIdentifier: string, serviceName: string, sender: INPerson): this;

	/**
	 * @since 14.0
	 */
	initWithRecipientsOutgoingMessageTypeContentSpeakableGroupNameConversationIdentifierServiceNameSenderAttachments(recipients: NSArray<INPerson> | INPerson[], outgoingMessageType: INOutgoingMessageType, content: string, speakableGroupName: INSpeakableString, conversationIdentifier: string, serviceName: string, sender: INPerson, attachments: NSArray<INSendMessageAttachment> | INSendMessageAttachment[]): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 15.0
 */
declare class INSendMessageIntentDonationMetadata extends INIntentDonationMetadata {

	static alloc(): INSendMessageIntentDonationMetadata; // inherited from NSObject

	static new(): INSendMessageIntentDonationMetadata; // inherited from NSObject

	mentionsCurrentUser: boolean;

	notifyRecipientAnyway: boolean;

	recipientCount: number;

	replyToCurrentUser: boolean;
}

/**
 * @since 10.0
 */
interface INSendMessageIntentHandling extends NSObjectProtocol {

	confirmSendMessageCompletion?(intent: INSendMessageIntent, completion: (p1: INSendMessageIntentResponse) => void): void;

	handleSendMessageCompletion(intent: INSendMessageIntent, completion: (p1: INSendMessageIntentResponse) => void): void;

	resolveContentForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INStringResolutionResult) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolveGroupNameForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INStringResolutionResult) => void): void;

	/**
	 * @since 14.0
	 */
	resolveOutgoingMessageTypeForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INOutgoingMessageTypeResolutionResult) => void): void;

	/**
	 * @since 11.0
	 */
	resolveRecipientsForSendMessageCompletion?(intent: INSendMessageIntent, completion: (p1: NSArray<INSendMessageRecipientResolutionResult>) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolveRecipientsForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	/**
	 * @since 11.0
	 */
	resolveSpeakableGroupNameForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INSendMessageIntentHandling: {

	prototype: INSendMessageIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSendMessageIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INSendMessageIntentResponse extends INIntentResponse {

	static alloc(): INSendMessageIntentResponse; // inherited from NSObject

	static new(): INSendMessageIntentResponse; // inherited from NSObject

	readonly code: INSendMessageIntentResponseCode;

	/**
	 * @since 10.3
	 * @deprecated 16.0
	 */
	sentMessage: INMessage;

	/**
	 * @since 16.0
	 */
	sentMessages: NSArray<INMessage>;

	constructor(o: { code: INSendMessageIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSendMessageIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INSendMessageIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureMessageServiceNotAvailable = 6,

	FailureRequiringInAppAuthentication = 7
}

/**
 * @since 11.0
 */
declare class INSendMessageRecipientResolutionResult extends INPersonResolutionResult {

	static alloc(): INSendMessageRecipientResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INSendMessageRecipientResolutionResult; // inherited from INPersonResolutionResult

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson> | INPerson[]): INSendMessageRecipientResolutionResult; // inherited from INPersonResolutionResult

	static needsValue(): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSendMessageRecipientResolutionResult; // inherited from NSObject

	static notRequired(): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INSendMessageRecipientResolutionResult; // inherited from INPersonResolutionResult

	static unsupported(): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSendMessageRecipientUnsupportedReason): INSendMessageRecipientResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { personResolutionResult: INPersonResolutionResult; });

	initWithPersonResolutionResult(personResolutionResult: INPersonResolutionResult): this;
}

/**
 * @since 11.0
 */
declare const enum INSendMessageRecipientUnsupportedReason {

	NoAccount = 1,

	Offline = 2,

	MessagingServiceNotEnabledForRecipient = 3,

	NoValidHandle = 4,

	RequestedHandleInvalid = 5,

	NoHandleForLabel = 6,

	RequiringInAppAuthentication = 7
}

/**
 * @since 11.0
 */
declare class INSendPaymentCurrencyAmountResolutionResult extends INCurrencyAmountResolutionResult {

	static alloc(): INSendPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCurrencyAmountToConfirm(currencyAmountToConfirm: INCurrencyAmount): INSendPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithCurrencyAmountsToDisambiguate(currencyAmountsToDisambiguate: NSArray<INCurrencyAmount> | INCurrencyAmount[]): INSendPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static needsValue(): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSendPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static notRequired(): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCurrencyAmount(resolvedCurrencyAmount: INCurrencyAmount): INSendPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static unsupported(): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSendPaymentCurrencyAmountUnsupportedReason): INSendPaymentCurrencyAmountResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { currencyAmountResolutionResult: INCurrencyAmountResolutionResult; });

	initWithCurrencyAmountResolutionResult(currencyAmountResolutionResult: INCurrencyAmountResolutionResult): this;
}

/**
 * @since 11.0
 */
declare const enum INSendPaymentCurrencyAmountUnsupportedReason {

	PaymentsAmountBelowMinimum = 1,

	PaymentsAmountAboveMaximum = 2,

	PaymentsCurrencyUnsupported = 3
}

/**
 * @since 10.0
 */
declare class INSendPaymentIntent extends INIntent {

	static alloc(): INSendPaymentIntent; // inherited from NSObject

	static new(): INSendPaymentIntent; // inherited from NSObject

	readonly currencyAmount: INCurrencyAmount;

	readonly note: string;

	readonly payee: INPerson;

	constructor(o: { payee: INPerson; currencyAmount: INCurrencyAmount; note: string; });

	initWithPayeeCurrencyAmountNote(payee: INPerson, currencyAmount: INCurrencyAmount, note: string): this;
}

/**
 * @since 10.0
 */
interface INSendPaymentIntentHandling extends NSObjectProtocol {

	confirmSendPaymentCompletion?(intent: INSendPaymentIntent, completion: (p1: INSendPaymentIntentResponse) => void): void;

	handleSendPaymentCompletion(intent: INSendPaymentIntent, completion: (p1: INSendPaymentIntentResponse) => void): void;

	/**
	 * @since 11.0
	 */
	resolveCurrencyAmountForSendPaymentCompletion?(intent: INSendPaymentIntent, completion: (p1: INSendPaymentCurrencyAmountResolutionResult) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolveCurrencyAmountForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INCurrencyAmountResolutionResult) => void): void;

	resolveNoteForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INStringResolutionResult) => void): void;

	/**
	 * @since 11.0
	 */
	resolvePayeeForSendPaymentCompletion?(intent: INSendPaymentIntent, completion: (p1: INSendPaymentPayeeResolutionResult) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolvePayeeForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INPersonResolutionResult) => void): void;
}
declare var INSendPaymentIntentHandling: {

	prototype: INSendPaymentIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSendPaymentIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INSendPaymentIntentResponse extends INIntentResponse {

	static alloc(): INSendPaymentIntentResponse; // inherited from NSObject

	static new(): INSendPaymentIntentResponse; // inherited from NSObject

	readonly code: INSendPaymentIntentResponseCode;

	paymentRecord: INPaymentRecord;

	constructor(o: { code: INSendPaymentIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSendPaymentIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INSendPaymentIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCredentialsUnverified = 6,

	FailurePaymentsAmountBelowMinimum = 7,

	FailurePaymentsAmountAboveMaximum = 8,

	FailurePaymentsCurrencyUnsupported = 9,

	FailureInsufficientFunds = 10,

	FailureNoBankAccount = 11,

	FailureNotEligible = 12,

	FailureTermsAndConditionsAcceptanceRequired = 13
}

/**
 * @since 11.0
 */
declare class INSendPaymentPayeeResolutionResult extends INPersonResolutionResult {

	static alloc(): INSendPaymentPayeeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INSendPaymentPayeeResolutionResult; // inherited from INPersonResolutionResult

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson> | INPerson[]): INSendPaymentPayeeResolutionResult; // inherited from INPersonResolutionResult

	static needsValue(): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSendPaymentPayeeResolutionResult; // inherited from NSObject

	static notRequired(): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INSendPaymentPayeeResolutionResult; // inherited from INPersonResolutionResult

	static unsupported(): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSendPaymentPayeeUnsupportedReason): INSendPaymentPayeeResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { personResolutionResult: INPersonResolutionResult; });

	initWithPersonResolutionResult(personResolutionResult: INPersonResolutionResult): this;
}

/**
 * @since 11.0
 */
declare const enum INSendPaymentPayeeUnsupportedReason {

	CredentialsUnverified = 1,

	InsufficientFunds = 2,

	NoAccount = 3,

	NoValidHandle = 4
}

/**
 * @since 11.0
 */
declare class INSendRideFeedbackIntent extends INIntent {

	static alloc(): INSendRideFeedbackIntent; // inherited from NSObject

	static new(): INSendRideFeedbackIntent; // inherited from NSObject

	rating: number;

	readonly rideIdentifier: string;

	tip: INCurrencyAmount;

	constructor(o: { rideIdentifier: string; });

	initWithRideIdentifier(rideIdentifier: string): this;
}

/**
 * @since 11.0
 */
interface INSendRideFeedbackIntentHandling extends NSObjectProtocol {

	confirmSendRideFeedbackCompletion?(sendRideFeedbackIntent: INSendRideFeedbackIntent, completion: (p1: INSendRideFeedbackIntentResponse) => void): void;

	handleSendRideFeedbackCompletion(sendRideFeedbackintent: INSendRideFeedbackIntent, completion: (p1: INSendRideFeedbackIntentResponse) => void): void;
}
declare var INSendRideFeedbackIntentHandling: {

	prototype: INSendRideFeedbackIntentHandling;
};

/**
 * @since 11.0
 */
declare class INSendRideFeedbackIntentResponse extends INIntentResponse {

	static alloc(): INSendRideFeedbackIntentResponse; // inherited from NSObject

	static new(): INSendRideFeedbackIntentResponse; // inherited from NSObject

	readonly code: INSendRideFeedbackIntentResponseCode;

	constructor(o: { code: INSendRideFeedbackIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSendRideFeedbackIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 */
declare const enum INSendRideFeedbackIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	Success = 2,

	Failure = 3
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetAudioSourceInCarIntent extends INIntent {

	static alloc(): INSetAudioSourceInCarIntent; // inherited from NSObject

	static new(): INSetAudioSourceInCarIntent; // inherited from NSObject

	readonly audioSource: INCarAudioSource;

	readonly relativeAudioSourceReference: INRelativeReference;

	constructor(o: { audioSource: INCarAudioSource; relativeAudioSourceReference: INRelativeReference; });

	initWithAudioSourceRelativeAudioSourceReference(audioSource: INCarAudioSource, relativeAudioSourceReference: INRelativeReference): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSetAudioSourceInCarIntentHandling extends NSObjectProtocol {

	confirmSetAudioSourceInCarCompletion?(intent: INSetAudioSourceInCarIntent, completion: (p1: INSetAudioSourceInCarIntentResponse) => void): void;

	handleSetAudioSourceInCarCompletion(intent: INSetAudioSourceInCarIntent, completion: (p1: INSetAudioSourceInCarIntentResponse) => void): void;

	resolveAudioSourceForSetAudioSourceInCarWithCompletion?(intent: INSetAudioSourceInCarIntent, completion: (p1: INCarAudioSourceResolutionResult) => void): void;

	resolveRelativeAudioSourceReferenceForSetAudioSourceInCarWithCompletion?(intent: INSetAudioSourceInCarIntent, completion: (p1: INRelativeReferenceResolutionResult) => void): void;
}
declare var INSetAudioSourceInCarIntentHandling: {

	prototype: INSetAudioSourceInCarIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSetAudioSourceInCarIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetAudioSourceInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetAudioSourceInCarIntentResponse; // inherited from NSObject

	static new(): INSetAudioSourceInCarIntentResponse; // inherited from NSObject

	readonly code: INSetAudioSourceInCarIntentResponseCode;

	constructor(o: { code: INSetAudioSourceInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetAudioSourceInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSetAudioSourceInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.3
 */
declare class INSetCarLockStatusIntent extends INIntent {

	static alloc(): INSetCarLockStatusIntent; // inherited from NSObject

	static new(): INSetCarLockStatusIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	readonly locked: number;

	constructor(o: { locked: number; carName: INSpeakableString; });

	initWithLockedCarName(locked: number, carName: INSpeakableString): this;
}

/**
 * @since 10.3
 */
interface INSetCarLockStatusIntentHandling extends NSObjectProtocol {

	confirmSetCarLockStatusCompletion?(intent: INSetCarLockStatusIntent, completion: (p1: INSetCarLockStatusIntentResponse) => void): void;

	handleSetCarLockStatusCompletion(intent: INSetCarLockStatusIntent, completion: (p1: INSetCarLockStatusIntentResponse) => void): void;

	resolveCarNameForSetCarLockStatusWithCompletion?(intent: INSetCarLockStatusIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveLockedForSetCarLockStatusWithCompletion?(intent: INSetCarLockStatusIntent, completion: (p1: INBooleanResolutionResult) => void): void;
}
declare var INSetCarLockStatusIntentHandling: {

	prototype: INSetCarLockStatusIntentHandling;
};

/**
 * @since 10.3
 */
declare class INSetCarLockStatusIntentResponse extends INIntentResponse {

	static alloc(): INSetCarLockStatusIntentResponse; // inherited from NSObject

	static new(): INSetCarLockStatusIntentResponse; // inherited from NSObject

	readonly code: INSetCarLockStatusIntentResponseCode;

	constructor(o: { code: INSetCarLockStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetCarLockStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.3
 */
declare const enum INSetCarLockStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetClimateSettingsInCarIntent extends INIntent {

	static alloc(): INSetClimateSettingsInCarIntent; // inherited from NSObject

	static new(): INSetClimateSettingsInCarIntent; // inherited from NSObject

	readonly airCirculationMode: INCarAirCirculationMode;

	/**
	 * @since 12.0
	 */
	readonly carName: INSpeakableString;

	readonly climateZone: INCarSeat;

	readonly enableAirConditioner: number;

	readonly enableAutoMode: number;

	readonly enableClimateControl: number;

	readonly enableFan: number;

	readonly fanSpeedIndex: number;

	readonly fanSpeedPercentage: number;

	readonly relativeFanSpeedSetting: INRelativeSetting;

	readonly relativeTemperatureSetting: INRelativeSetting;

	readonly temperature: NSMeasurement<NSUnitTemperature>;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	constructor(o: { enableFan: number; enableAirConditioner: number; enableClimateControl: number; enableAutoMode: number; airCirculationMode: INCarAirCirculationMode; fanSpeedIndex: number; fanSpeedPercentage: number; relativeFanSpeedSetting: INRelativeSetting; temperature: NSMeasurement<NSUnitTemperature>; relativeTemperatureSetting: INRelativeSetting; climateZone: INCarSeat; });

	/**
	 * @since 12.0
	 */
	constructor(o: { enableFan: number; enableAirConditioner: number; enableClimateControl: number; enableAutoMode: number; airCirculationMode: INCarAirCirculationMode; fanSpeedIndex: number; fanSpeedPercentage: number; relativeFanSpeedSetting: INRelativeSetting; temperature: NSMeasurement<NSUnitTemperature>; relativeTemperatureSetting: INRelativeSetting; climateZone: INCarSeat; carName: INSpeakableString; });

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	initWithEnableFanEnableAirConditionerEnableClimateControlEnableAutoModeAirCirculationModeFanSpeedIndexFanSpeedPercentageRelativeFanSpeedSettingTemperatureRelativeTemperatureSettingClimateZone(enableFan: number, enableAirConditioner: number, enableClimateControl: number, enableAutoMode: number, airCirculationMode: INCarAirCirculationMode, fanSpeedIndex: number, fanSpeedPercentage: number, relativeFanSpeedSetting: INRelativeSetting, temperature: NSMeasurement<NSUnitTemperature>, relativeTemperatureSetting: INRelativeSetting, climateZone: INCarSeat): this;

	/**
	 * @since 12.0
	 */
	initWithEnableFanEnableAirConditionerEnableClimateControlEnableAutoModeAirCirculationModeFanSpeedIndexFanSpeedPercentageRelativeFanSpeedSettingTemperatureRelativeTemperatureSettingClimateZoneCarName(enableFan: number, enableAirConditioner: number, enableClimateControl: number, enableAutoMode: number, airCirculationMode: INCarAirCirculationMode, fanSpeedIndex: number, fanSpeedPercentage: number, relativeFanSpeedSetting: INRelativeSetting, temperature: NSMeasurement<NSUnitTemperature>, relativeTemperatureSetting: INRelativeSetting, climateZone: INCarSeat, carName: INSpeakableString): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSetClimateSettingsInCarIntentHandling extends NSObjectProtocol {

	confirmSetClimateSettingsInCarCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INSetClimateSettingsInCarIntentResponse) => void): void;

	handleSetClimateSettingsInCarCompletion(intent: INSetClimateSettingsInCarIntent, completion: (p1: INSetClimateSettingsInCarIntentResponse) => void): void;

	resolveAirCirculationModeForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INCarAirCirculationModeResolutionResult) => void): void;

	/**
	 * @since 12.0
	 */
	resolveCarNameForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveClimateZoneForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INCarSeatResolutionResult) => void): void;

	resolveEnableAirConditionerForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveEnableAutoModeForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveEnableClimateControlForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveEnableFanForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveFanSpeedIndexForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolveFanSpeedPercentageForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INDoubleResolutionResult) => void): void;

	resolveRelativeFanSpeedSettingForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INRelativeSettingResolutionResult) => void): void;

	resolveRelativeTemperatureSettingForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INRelativeSettingResolutionResult) => void): void;

	resolveTemperatureForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INTemperatureResolutionResult) => void): void;
}
declare var INSetClimateSettingsInCarIntentHandling: {

	prototype: INSetClimateSettingsInCarIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSetClimateSettingsInCarIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetClimateSettingsInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetClimateSettingsInCarIntentResponse; // inherited from NSObject

	static new(): INSetClimateSettingsInCarIntentResponse; // inherited from NSObject

	readonly code: INSetClimateSettingsInCarIntentResponseCode;

	constructor(o: { code: INSetClimateSettingsInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetClimateSettingsInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSetClimateSettingsInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetDefrosterSettingsInCarIntent extends INIntent {

	static alloc(): INSetDefrosterSettingsInCarIntent; // inherited from NSObject

	static new(): INSetDefrosterSettingsInCarIntent; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	readonly carName: INSpeakableString;

	readonly defroster: INCarDefroster;

	readonly enable: number;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	constructor(o: { enable: number; defroster: INCarDefroster; });

	/**
	 * @since 12.0
	 */
	constructor(o: { enable: number; defroster: INCarDefroster; carName: INSpeakableString; });

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	initWithEnableDefroster(enable: number, defroster: INCarDefroster): this;

	/**
	 * @since 12.0
	 */
	initWithEnableDefrosterCarName(enable: number, defroster: INCarDefroster, carName: INSpeakableString): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSetDefrosterSettingsInCarIntentHandling extends NSObjectProtocol {

	confirmSetDefrosterSettingsInCarCompletion?(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INSetDefrosterSettingsInCarIntentResponse) => void): void;

	handleSetDefrosterSettingsInCarCompletion(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INSetDefrosterSettingsInCarIntentResponse) => void): void;

	/**
	 * @since 12.0
	 */
	resolveCarNameForSetDefrosterSettingsInCarWithCompletion?(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveDefrosterForSetDefrosterSettingsInCarWithCompletion?(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INCarDefrosterResolutionResult) => void): void;

	resolveEnableForSetDefrosterSettingsInCarWithCompletion?(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;
}
declare var INSetDefrosterSettingsInCarIntentHandling: {

	prototype: INSetDefrosterSettingsInCarIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSetDefrosterSettingsInCarIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetDefrosterSettingsInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetDefrosterSettingsInCarIntentResponse; // inherited from NSObject

	static new(): INSetDefrosterSettingsInCarIntentResponse; // inherited from NSObject

	readonly code: INSetDefrosterSettingsInCarIntentResponseCode;

	constructor(o: { code: INSetDefrosterSettingsInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetDefrosterSettingsInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSetDefrosterSettingsInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 */
declare class INSetMessageAttributeIntent extends INIntent {

	static alloc(): INSetMessageAttributeIntent; // inherited from NSObject

	static new(): INSetMessageAttributeIntent; // inherited from NSObject

	readonly attribute: INMessageAttribute;

	readonly identifiers: NSArray<string>;

	constructor(o: { identifiers: NSArray<string> | string[]; attribute: INMessageAttribute; });

	initWithIdentifiersAttribute(identifiers: NSArray<string> | string[], attribute: INMessageAttribute): this;
}

/**
 * @since 10.0
 */
interface INSetMessageAttributeIntentHandling extends NSObjectProtocol {

	confirmSetMessageAttributeCompletion?(intent: INSetMessageAttributeIntent, completion: (p1: INSetMessageAttributeIntentResponse) => void): void;

	handleSetMessageAttributeCompletion(intent: INSetMessageAttributeIntent, completion: (p1: INSetMessageAttributeIntentResponse) => void): void;

	resolveAttributeForSetMessageAttributeWithCompletion?(intent: INSetMessageAttributeIntent, completion: (p1: INMessageAttributeResolutionResult) => void): void;
}
declare var INSetMessageAttributeIntentHandling: {

	prototype: INSetMessageAttributeIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSetMessageAttributeIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INSetMessageAttributeIntentResponse extends INIntentResponse {

	static alloc(): INSetMessageAttributeIntentResponse; // inherited from NSObject

	static new(): INSetMessageAttributeIntentResponse; // inherited from NSObject

	readonly code: INSetMessageAttributeIntentResponseCode;

	constructor(o: { code: INSetMessageAttributeIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetMessageAttributeIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INSetMessageAttributeIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureMessageNotFound = 6,

	FailureMessageAttributeNotSet = 7
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetProfileInCarIntent extends INIntent {

	static alloc(): INSetProfileInCarIntent; // inherited from NSObject

	static new(): INSetProfileInCarIntent; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	readonly carName: INSpeakableString;

	readonly defaultProfile: number;

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	readonly profileLabel: string;

	/**
	 * @since 10.2
	 */
	readonly profileName: string;

	readonly profileNumber: number;

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	constructor(o: { profileNumber: number; profileLabel: string; defaultProfile: number; });

	/**
	 * @since 10.2
	 * @deprecated 12.0
	 */
	constructor(o: { profileNumber: number; profileName: string; defaultProfile: number; });

	/**
	 * @since 12.0
	 */
	constructor(o: { profileNumber: number; profileName: string; defaultProfile: number; carName: INSpeakableString; });

	/**
	 * @since 10.0
	 * @deprecated 10.2
	 */
	initWithProfileNumberProfileLabelDefaultProfile(profileNumber: number, profileLabel: string, defaultProfile: number): this;

	/**
	 * @since 10.2
	 * @deprecated 12.0
	 */
	initWithProfileNumberProfileNameDefaultProfile(profileNumber: number, profileName: string, defaultProfile: number): this;

	/**
	 * @since 12.0
	 */
	initWithProfileNumberProfileNameDefaultProfileCarName(profileNumber: number, profileName: string, defaultProfile: number, carName: INSpeakableString): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSetProfileInCarIntentHandling extends NSObjectProtocol {

	confirmSetProfileInCarCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INSetProfileInCarIntentResponse) => void): void;

	handleSetProfileInCarCompletion(intent: INSetProfileInCarIntent, completion: (p1: INSetProfileInCarIntentResponse) => void): void;

	/**
	 * @since 12.0
	 */
	resolveCarNameForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	resolveDefaultProfileForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	/**
	 * @since 10.2
	 */
	resolveProfileNameForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveProfileNumberForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INIntegerResolutionResult) => void): void;
}
declare var INSetProfileInCarIntentHandling: {

	prototype: INSetProfileInCarIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSetProfileInCarIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetProfileInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetProfileInCarIntentResponse; // inherited from NSObject

	static new(): INSetProfileInCarIntentResponse; // inherited from NSObject

	readonly code: INSetProfileInCarIntentResponseCode;

	constructor(o: { code: INSetProfileInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetProfileInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSetProfileInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetRadioStationIntent extends INIntent {

	static alloc(): INSetRadioStationIntent; // inherited from NSObject

	static new(): INSetRadioStationIntent; // inherited from NSObject

	readonly channel: string;

	readonly frequency: number;

	readonly presetNumber: number;

	readonly radioType: INRadioType;

	readonly stationName: string;

	constructor(o: { radioType: INRadioType; frequency: number; stationName: string; channel: string; presetNumber: number; });

	initWithRadioTypeFrequencyStationNameChannelPresetNumber(radioType: INRadioType, frequency: number, stationName: string, channel: string, presetNumber: number): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSetRadioStationIntentHandling extends NSObjectProtocol {

	confirmSetRadioStationCompletion?(intent: INSetRadioStationIntent, completion: (p1: INSetRadioStationIntentResponse) => void): void;

	handleSetRadioStationCompletion(intent: INSetRadioStationIntent, completion: (p1: INSetRadioStationIntentResponse) => void): void;

	resolveChannelForSetRadioStationWithCompletion?(intent: INSetRadioStationIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveFrequencyForSetRadioStationWithCompletion?(intent: INSetRadioStationIntent, completion: (p1: INDoubleResolutionResult) => void): void;

	resolvePresetNumberForSetRadioStationWithCompletion?(intent: INSetRadioStationIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolveRadioTypeForSetRadioStationWithCompletion?(intent: INSetRadioStationIntent, completion: (p1: INRadioTypeResolutionResult) => void): void;

	resolveStationNameForSetRadioStationWithCompletion?(intent: INSetRadioStationIntent, completion: (p1: INStringResolutionResult) => void): void;
}
declare var INSetRadioStationIntentHandling: {

	prototype: INSetRadioStationIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSetRadioStationIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetRadioStationIntentResponse extends INIntentResponse {

	static alloc(): INSetRadioStationIntentResponse; // inherited from NSObject

	static new(): INSetRadioStationIntentResponse; // inherited from NSObject

	readonly code: INSetRadioStationIntentResponseCode;

	constructor(o: { code: INSetRadioStationIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetRadioStationIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSetRadioStationIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureNotSubscribed = 6
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetSeatSettingsInCarIntent extends INIntent {

	static alloc(): INSetSeatSettingsInCarIntent; // inherited from NSObject

	static new(): INSetSeatSettingsInCarIntent; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	readonly carName: INSpeakableString;

	readonly enableCooling: number;

	readonly enableHeating: number;

	readonly enableMassage: number;

	readonly level: number;

	readonly relativeLevelSetting: INRelativeSetting;

	readonly seat: INCarSeat;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	constructor(o: { enableHeating: number; enableCooling: number; enableMassage: number; seat: INCarSeat; level: number; relativeLevelSetting: INRelativeSetting; });

	/**
	 * @since 12.0
	 */
	constructor(o: { enableHeating: number; enableCooling: number; enableMassage: number; seat: INCarSeat; level: number; relativeLevelSetting: INRelativeSetting; carName: INSpeakableString; });

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	initWithEnableHeatingEnableCoolingEnableMassageSeatLevelRelativeLevelSetting(enableHeating: number, enableCooling: number, enableMassage: number, seat: INCarSeat, level: number, relativeLevelSetting: INRelativeSetting): this;

	/**
	 * @since 12.0
	 */
	initWithEnableHeatingEnableCoolingEnableMassageSeatLevelRelativeLevelSettingCarName(enableHeating: number, enableCooling: number, enableMassage: number, seat: INCarSeat, level: number, relativeLevelSetting: INRelativeSetting, carName: INSpeakableString): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INSetSeatSettingsInCarIntentHandling extends NSObjectProtocol {

	confirmSetSeatSettingsInCarCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INSetSeatSettingsInCarIntentResponse) => void): void;

	handleSetSeatSettingsInCarCompletion(intent: INSetSeatSettingsInCarIntent, completion: (p1: INSetSeatSettingsInCarIntentResponse) => void): void;

	/**
	 * @since 12.0
	 */
	resolveCarNameForSetSeatSettingsInCarWithCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveEnableCoolingForSetSeatSettingsInCarWithCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveEnableHeatingForSetSeatSettingsInCarWithCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveEnableMassageForSetSeatSettingsInCarWithCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveLevelForSetSeatSettingsInCarWithCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolveRelativeLevelSettingForSetSeatSettingsInCarWithCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INRelativeSettingResolutionResult) => void): void;

	resolveSeatForSetSeatSettingsInCarWithCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INCarSeatResolutionResult) => void): void;
}
declare var INSetSeatSettingsInCarIntentHandling: {

	prototype: INSetSeatSettingsInCarIntentHandling;
};

/**
 * @since 10.0
 */
declare var INSetSeatSettingsInCarIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INSetSeatSettingsInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetSeatSettingsInCarIntentResponse; // inherited from NSObject

	static new(): INSetSeatSettingsInCarIntentResponse; // inherited from NSObject

	readonly code: INSetSeatSettingsInCarIntentResponseCode;

	constructor(o: { code: INSetSeatSettingsInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetSeatSettingsInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INSetSeatSettingsInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 11.0
 */
declare class INSetTaskAttributeIntent extends INIntent {

	static alloc(): INSetTaskAttributeIntent; // inherited from NSObject

	static new(): INSetTaskAttributeIntent; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly priority: INTaskPriority;

	readonly spatialEventTrigger: INSpatialEventTrigger;

	readonly status: INTaskStatus;

	readonly targetTask: INTask;

	/**
	 * @since 13.0
	 */
	readonly taskTitle: INSpeakableString;

	readonly temporalEventTrigger: INTemporalEventTrigger;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	constructor(o: { targetTask: INTask; status: INTaskStatus; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; });

	/**
	 * @since 13.0
	 */
	constructor(o: { targetTask: INTask; taskTitle: INSpeakableString; status: INTaskStatus; priority: INTaskPriority; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; });

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	initWithTargetTaskStatusSpatialEventTriggerTemporalEventTrigger(targetTask: INTask, status: INTaskStatus, spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger): this;

	/**
	 * @since 13.0
	 */
	initWithTargetTaskTaskTitleStatusPrioritySpatialEventTriggerTemporalEventTrigger(targetTask: INTask, taskTitle: INSpeakableString, status: INTaskStatus, priority: INTaskPriority, spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger): this;
}

/**
 * @since 11.0
 */
interface INSetTaskAttributeIntentHandling extends NSObjectProtocol {

	confirmSetTaskAttributeCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INSetTaskAttributeIntentResponse) => void): void;

	handleSetTaskAttributeCompletion(intent: INSetTaskAttributeIntent, completion: (p1: INSetTaskAttributeIntentResponse) => void): void;

	/**
	 * @since 13.0
	 */
	resolvePriorityForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INTaskPriorityResolutionResult) => void): void;

	resolveSpatialEventTriggerForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INSpatialEventTriggerResolutionResult) => void): void;

	resolveStatusForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INTaskStatusResolutionResult) => void): void;

	resolveTargetTaskForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INTaskResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolveTaskTitleForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	/**
	 * @since 13.0
	 */
	resolveTemporalEventTriggerForSetTaskAttributeCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INSetTaskAttributeTemporalEventTriggerResolutionResult) => void): void;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	resolveTemporalEventTriggerForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INTemporalEventTriggerResolutionResult) => void): void;
}
declare var INSetTaskAttributeIntentHandling: {

	prototype: INSetTaskAttributeIntentHandling;
};

/**
 * @since 11.0
 */
declare class INSetTaskAttributeIntentResponse extends INIntentResponse {

	static alloc(): INSetTaskAttributeIntentResponse; // inherited from NSObject

	static new(): INSetTaskAttributeIntentResponse; // inherited from NSObject

	readonly code: INSetTaskAttributeIntentResponseCode;

	modifiedTask: INTask;

	constructor(o: { code: INSetTaskAttributeIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetTaskAttributeIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 */
declare const enum INSetTaskAttributeIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 13.0
 */
declare class INSetTaskAttributeTemporalEventTriggerResolutionResult extends INTemporalEventTriggerResolutionResult {

	static alloc(): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTemporalEventTriggerToConfirm(temporalEventTriggerToConfirm: INTemporalEventTrigger): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INTemporalEventTriggerResolutionResult

	static disambiguationWithTemporalEventTriggersToDisambiguate(temporalEventTriggersToDisambiguate: NSArray<INTemporalEventTrigger> | INTemporalEventTrigger[]): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INTemporalEventTriggerResolutionResult

	static needsValue(): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from NSObject

	static notRequired(): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTemporalEventTrigger(resolvedTemporalEventTrigger: INTemporalEventTrigger): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INTemporalEventTriggerResolutionResult

	static unsupported(): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSetTaskAttributeTemporalEventTriggerUnsupportedReason): INSetTaskAttributeTemporalEventTriggerResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSetTaskAttributeTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { temporalEventTriggerResolutionResult: INTemporalEventTriggerResolutionResult; });

	initWithTemporalEventTriggerResolutionResult(temporalEventTriggerResolutionResult: INTemporalEventTriggerResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INSetTaskAttributeTemporalEventTriggerUnsupportedReason {

	TimeInPast = 1,

	InvalidRecurrence = 2
}

/**
 * @since 15.0
 */
declare class INShareFocusStatusIntent extends INIntent {

	static alloc(): INShareFocusStatusIntent; // inherited from NSObject

	static new(): INShareFocusStatusIntent; // inherited from NSObject

	readonly focusStatus: INFocusStatus;

	constructor(o: { focusStatus: INFocusStatus; });

	initWithFocusStatus(focusStatus: INFocusStatus): this;
}

/**
 * @since 15.0
 */
interface INShareFocusStatusIntentHandling extends NSObjectProtocol {

	confirmShareFocusStatusCompletion?(intent: INShareFocusStatusIntent, completion: (p1: INShareFocusStatusIntentResponse) => void): void;

	handleShareFocusStatusCompletion(intent: INShareFocusStatusIntent, completion: (p1: INShareFocusStatusIntentResponse) => void): void;
}
declare var INShareFocusStatusIntentHandling: {

	prototype: INShareFocusStatusIntentHandling;
};

/**
 * @since 15.0
 */
declare class INShareFocusStatusIntentResponse extends INIntentResponse {

	static alloc(): INShareFocusStatusIntentResponse; // inherited from NSObject

	static new(): INShareFocusStatusIntentResponse; // inherited from NSObject

	readonly code: INShareFocusStatusIntentResponseCode;

	constructor(o: { code: INShareFocusStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INShareFocusStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 15.0
 */
declare const enum INShareFocusStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 12.0
 */
declare class INShortcut extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INShortcut; // inherited from NSObject

	static new(): INShortcut; // inherited from NSObject

	readonly intent: INIntent;

	readonly userActivity: NSUserActivity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { intent: INIntent; });

	constructor(o: { userActivity: NSUserActivity; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithIntent(intent: INIntent): this;

	initWithUserActivity(userActivity: NSUserActivity): this;
}

/**
 * @since 14.0
 */
declare const enum INShortcutAvailabilityOptions {

	SleepMindfulness = 1,

	SleepJournaling = 2,

	SleepMusic = 4,

	SleepPodcasts = 8,

	SleepReading = 16,

	SleepWrapUpYourDay = 32,

	SleepYogaAndStretching = 64
}

/**
 * @since 10.0
 */
declare const enum INSiriAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

/**
 * @since 13.0
 */
declare class INSnoozeTasksIntent extends INIntent {

	static alloc(): INSnoozeTasksIntent; // inherited from NSObject

	static new(): INSnoozeTasksIntent; // inherited from NSObject

	readonly all: number;

	readonly nextTriggerTime: INDateComponentsRange;

	readonly tasks: NSArray<INTask>;

	constructor(o: { tasks: NSArray<INTask> | INTask[]; nextTriggerTime: INDateComponentsRange; all: number; });

	initWithTasksNextTriggerTimeAll(tasks: NSArray<INTask> | INTask[], nextTriggerTime: INDateComponentsRange, all: number): this;
}

/**
 * @since 13.0
 */
interface INSnoozeTasksIntentHandling extends NSObjectProtocol {

	confirmSnoozeTasksCompletion?(intent: INSnoozeTasksIntent, completion: (p1: INSnoozeTasksIntentResponse) => void): void;

	handleSnoozeTasksCompletion(intent: INSnoozeTasksIntent, completion: (p1: INSnoozeTasksIntentResponse) => void): void;

	resolveNextTriggerTimeForSnoozeTasksWithCompletion?(intent: INSnoozeTasksIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveTasksForSnoozeTasksWithCompletion?(intent: INSnoozeTasksIntent, completion: (p1: NSArray<INSnoozeTasksTaskResolutionResult>) => void): void;
}
declare var INSnoozeTasksIntentHandling: {

	prototype: INSnoozeTasksIntentHandling;
};

/**
 * @since 13.0
 */
declare class INSnoozeTasksIntentResponse extends INIntentResponse {

	static alloc(): INSnoozeTasksIntentResponse; // inherited from NSObject

	static new(): INSnoozeTasksIntentResponse; // inherited from NSObject

	readonly code: INSnoozeTasksIntentResponseCode;

	snoozedTasks: NSArray<INTask>;

	constructor(o: { code: INSnoozeTasksIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSnoozeTasksIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 */
declare const enum INSnoozeTasksIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 13.0
 */
declare class INSnoozeTasksTaskResolutionResult extends INTaskResolutionResult {

	static alloc(): INSnoozeTasksTaskResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSnoozeTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskToConfirm(taskToConfirm: INTask): INSnoozeTasksTaskResolutionResult; // inherited from INTaskResolutionResult

	static disambiguationWithTasksToDisambiguate(tasksToDisambiguate: NSArray<INTask> | INTask[]): INSnoozeTasksTaskResolutionResult; // inherited from INTaskResolutionResult

	static needsValue(): INSnoozeTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSnoozeTasksTaskResolutionResult; // inherited from NSObject

	static notRequired(): INSnoozeTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTask(resolvedTask: INTask): INSnoozeTasksTaskResolutionResult; // inherited from INTaskResolutionResult

	static unsupported(): INSnoozeTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSnoozeTasksTaskUnsupportedReason): INSnoozeTasksTaskResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSnoozeTasksTaskResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { taskResolutionResult: INTaskResolutionResult; });

	initWithTaskResolutionResult(taskResolutionResult: INTaskResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INSnoozeTasksTaskUnsupportedReason {

	NoTasksFound = 1
}

/**
 * @since 11.0
 */
declare const enum INSortType {

	Unknown = 0,

	AsIs = 1,

	ByDate = 2
}

/**
 * @since 11.0
 */
declare const enum INSpatialEvent {

	Unknown = 0,

	Arrive = 1,

	Depart = 2
}

/**
 * @since 11.0
 */
declare class INSpatialEventTrigger extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INSpatialEventTrigger; // inherited from NSObject

	static new(): INSpatialEventTrigger; // inherited from NSObject

	readonly event: INSpatialEvent;

	readonly placemark: CLPlacemark;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { placemark: CLPlacemark; event: INSpatialEvent; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPlacemarkEvent(placemark: CLPlacemark, event: INSpatialEvent): this;
}

/**
 * @since 11.0
 */
declare class INSpatialEventTriggerResolutionResult extends INIntentResolutionResult {

	static alloc(): INSpatialEventTriggerResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithSpatialEventTriggerToConfirm(spatialEventTriggerToConfirm: INSpatialEventTrigger): INSpatialEventTriggerResolutionResult;

	static disambiguationWithSpatialEventTriggersToDisambiguate(spatialEventTriggersToDisambiguate: NSArray<INSpatialEventTrigger> | INSpatialEventTrigger[]): INSpatialEventTriggerResolutionResult;

	static needsValue(): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSpatialEventTriggerResolutionResult; // inherited from NSObject

	static notRequired(): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedSpatialEventTrigger(resolvedSpatialEventTrigger: INSpatialEventTrigger): INSpatialEventTriggerResolutionResult;

	static unsupported(): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
interface INSpeakable extends NSObjectProtocol {

	alternativeSpeakableMatches: NSArray<INSpeakable>;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	identifier?: string;

	pronunciationHint: string;

	spokenPhrase: string;

	vocabularyIdentifier: string;
}
declare var INSpeakable: {

	prototype: INSpeakable;
};

/**
 * @since 10.0
 */
declare class INSpeakableString extends NSObject implements INSpeakable, NSCopying, NSSecureCoding {

	static alloc(): INSpeakableString; // inherited from NSObject

	static new(): INSpeakableString; // inherited from NSObject

	readonly alternativeSpeakableMatches: NSArray<INSpeakable>; // inherited from INSpeakable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	readonly identifier: string; // inherited from INSpeakable

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly pronunciationHint: string; // inherited from INSpeakable

	readonly spokenPhrase: string; // inherited from INSpeakable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly vocabularyIdentifier: string; // inherited from INSpeakable

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	constructor(o: { identifier: string; spokenPhrase: string; pronunciationHint: string; });

	/**
	 * @since 10.2
	 */
	constructor(o: { spokenPhrase: string; });

	constructor(o: { vocabularyIdentifier: string; spokenPhrase: string; pronunciationHint: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	initWithIdentifierSpokenPhrasePronunciationHint(identifier: string, spokenPhrase: string, pronunciationHint: string): this;

	/**
	 * @since 10.2
	 */
	initWithSpokenPhrase(spokenPhrase: string): this;

	initWithVocabularyIdentifierSpokenPhrasePronunciationHint(vocabularyIdentifier: string, spokenPhrase: string, pronunciationHint: string): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 10.0
 */
declare class INSpeakableStringResolutionResult extends INIntentResolutionResult {

	static alloc(): INSpeakableStringResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithStringToConfirm(stringToConfirm: INSpeakableString): INSpeakableStringResolutionResult;

	static disambiguationWithStringsToDisambiguate(stringsToDisambiguate: NSArray<INSpeakableString> | INSpeakableString[]): INSpeakableStringResolutionResult;

	static needsValue(): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSpeakableStringResolutionResult; // inherited from NSObject

	static notRequired(): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedString(resolvedString: INSpeakableString): INSpeakableStringResolutionResult;

	static unsupported(): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare class INSpeedResolutionResult extends INIntentResolutionResult {

	static alloc(): INSpeedResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INSpeedResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithSpeedToConfirm(speedToConfirm: NSMeasurement<NSUnitSpeed>): INSpeedResolutionResult;

	static disambiguationWithSpeedToDisambiguate(speedToDisambiguate: NSArray<NSMeasurement<NSUnitSpeed>> | NSMeasurement<NSUnitSpeed>[]): INSpeedResolutionResult;

	static needsValue(): INSpeedResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSpeedResolutionResult; // inherited from NSObject

	static notRequired(): INSpeedResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedSpeed(resolvedSpeed: NSMeasurement<NSUnitSpeed>): INSpeedResolutionResult;

	static unsupported(): INSpeedResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INSpeedResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare class INStartAudioCallIntent extends INIntent {

	static alloc(): INStartAudioCallIntent; // inherited from NSObject

	static new(): INStartAudioCallIntent; // inherited from NSObject

	readonly contacts: NSArray<INPerson>;

	/**
	 * @since 11.0
	 */
	readonly destinationType: INCallDestinationType;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	constructor(o: { contacts: NSArray<INPerson> | INPerson[]; });

	/**
	 * @since 11.0
	 */
	constructor(o: { destinationType: INCallDestinationType; contacts: NSArray<INPerson> | INPerson[]; });

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	initWithContacts(contacts: NSArray<INPerson> | INPerson[]): this;

	/**
	 * @since 11.0
	 */
	initWithDestinationTypeContacts(destinationType: INCallDestinationType, contacts: NSArray<INPerson> | INPerson[]): this;
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface INStartAudioCallIntentHandling extends NSObjectProtocol {

	confirmStartAudioCallCompletion?(intent: INStartAudioCallIntent, completion: (p1: INStartAudioCallIntentResponse) => void): void;

	handleStartAudioCallCompletion(intent: INStartAudioCallIntent, completion: (p1: INStartAudioCallIntentResponse) => void): void;

	resolveContactsForStartAudioCallWithCompletion?(intent: INStartAudioCallIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	/**
	 * @since 11.0
	 */
	resolveDestinationTypeForStartAudioCallWithCompletion?(intent: INStartAudioCallIntent, completion: (p1: INCallDestinationTypeResolutionResult) => void): void;
}
declare var INStartAudioCallIntentHandling: {

	prototype: INStartAudioCallIntentHandling;
};

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare var INStartAudioCallIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare class INStartAudioCallIntentResponse extends INIntentResponse {

	static alloc(): INStartAudioCallIntentResponse; // inherited from NSObject

	static new(): INStartAudioCallIntentResponse; // inherited from NSObject

	readonly code: INStartAudioCallIntentResponseCode;

	constructor(o: { code: INStartAudioCallIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartAudioCallIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare const enum INStartAudioCallIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureAppConfigurationRequired = 5,

	FailureCallingServiceNotAvailable = 6,

	FailureContactNotSupportedByApp = 7,

	FailureNoValidNumber = 8
}

/**
 * @since 13.0
 */
declare class INStartCallCallCapabilityResolutionResult extends INCallCapabilityResolutionResult {

	static alloc(): INStartCallCallCapabilityResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallCapabilityToConfirm(callCapabilityToConfirm: INCallCapability): INStartCallCallCapabilityResolutionResult; // inherited from INCallCapabilityResolutionResult

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INStartCallCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	static needsValue(): INStartCallCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	static new(): INStartCallCallCapabilityResolutionResult; // inherited from NSObject

	static notRequired(): INStartCallCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallCapability(resolvedCallCapability: INCallCapability): INStartCallCallCapabilityResolutionResult; // inherited from INCallCapabilityResolutionResult

	static unsupported(): INStartCallCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INStartCallCallCapabilityUnsupportedReason): INStartCallCallCapabilityResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INStartCallCallCapabilityResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { callCapabilityResolutionResult: INCallCapabilityResolutionResult; });

	initWithCallCapabilityResolutionResult(callCapabilityResolutionResult: INCallCapabilityResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INStartCallCallCapabilityUnsupportedReason {

	VideoCallUnsupported = 1,

	MicrophoneNotAccessible = 2,

	CameraNotAccessible = 3
}

/**
 * @since 14.0
 */
declare class INStartCallCallRecordToCallBackResolutionResult extends INCallRecordResolutionResult {

	static alloc(): INStartCallCallRecordToCallBackResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallRecordToConfirm(callRecordToConfirm: INCallRecord): INStartCallCallRecordToCallBackResolutionResult; // inherited from INCallRecordResolutionResult

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INStartCallCallRecordToCallBackResolutionResult; // inherited from INIntentResolutionResult

	static disambiguationWithCallRecordsToDisambiguate(callRecordsToDisambiguate: NSArray<INCallRecord> | INCallRecord[]): INStartCallCallRecordToCallBackResolutionResult; // inherited from INCallRecordResolutionResult

	static needsValue(): INStartCallCallRecordToCallBackResolutionResult; // inherited from INIntentResolutionResult

	static new(): INStartCallCallRecordToCallBackResolutionResult; // inherited from NSObject

	static notRequired(): INStartCallCallRecordToCallBackResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallRecord(resolvedCallRecord: INCallRecord): INStartCallCallRecordToCallBackResolutionResult; // inherited from INCallRecordResolutionResult

	static unsupported(): INStartCallCallRecordToCallBackResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INStartCallCallRecordToCallBackUnsupportedReason): INStartCallCallRecordToCallBackResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INStartCallCallRecordToCallBackResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { callRecordResolutionResult: INCallRecordResolutionResult; });

	initWithCallRecordResolutionResult(callRecordResolutionResult: INCallRecordResolutionResult): this;
}

/**
 * @since 14.0
 */
declare const enum INStartCallCallRecordToCallBackUnsupportedReason {

	NoMatchingCall = 1
}

/**
 * @since 13.0
 */
declare class INStartCallContactResolutionResult extends INPersonResolutionResult {

	static alloc(): INStartCallContactResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INStartCallContactResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INStartCallContactResolutionResult; // inherited from INPersonResolutionResult

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson> | INPerson[]): INStartCallContactResolutionResult; // inherited from INPersonResolutionResult

	static needsValue(): INStartCallContactResolutionResult; // inherited from INIntentResolutionResult

	static new(): INStartCallContactResolutionResult; // inherited from NSObject

	static notRequired(): INStartCallContactResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INStartCallContactResolutionResult; // inherited from INPersonResolutionResult

	static unsupported(): INStartCallContactResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INStartCallContactUnsupportedReason): INStartCallContactResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INStartCallContactResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { personResolutionResult: INPersonResolutionResult; });

	initWithPersonResolutionResult(personResolutionResult: INPersonResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INStartCallContactUnsupportedReason {

	NoContactFound = 1,

	MultipleContactsUnsupported = 2,

	NoHandleForLabel = 3,

	InvalidHandle = 4,

	UnsupportedMmiUssd = 5,

	NoCallHistoryForRedial = 6,

	NoUsableHandleForRedial = 7,

	RequiringInAppAuthentication = 8
}

/**
 * @since 13.0
 */
declare class INStartCallIntent extends INIntent implements UNNotificationContentProviding {

	static alloc(): INStartCallIntent; // inherited from NSObject

	static new(): INStartCallIntent; // inherited from NSObject

	readonly audioRoute: INCallAudioRoute;

	readonly callCapability: INCallCapability;

	/**
	 * @since 14.0
	 */
	readonly callRecordFilter: INCallRecordFilter;

	/**
	 * @since 14.0
	 */
	readonly callRecordToCallBack: INCallRecord;

	readonly contacts: NSArray<INPerson>;

	readonly destinationType: INCallDestinationType;

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	readonly recordTypeForRedialing: INCallRecordType;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	constructor(o: { audioRoute: INCallAudioRoute; destinationType: INCallDestinationType; contacts: NSArray<INPerson> | INPerson[]; recordTypeForRedialing: INCallRecordType; callCapability: INCallCapability; });

	/**
	 * @since 14.0
	 */
	constructor(o: { callRecordFilter: INCallRecordFilter; callRecordToCallBack: INCallRecord; audioRoute: INCallAudioRoute; destinationType: INCallDestinationType; contacts: NSArray<INPerson> | INPerson[]; callCapability: INCallCapability; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	initWithAudioRouteDestinationTypeContactsRecordTypeForRedialingCallCapability(audioRoute: INCallAudioRoute, destinationType: INCallDestinationType, contacts: NSArray<INPerson> | INPerson[], recordTypeForRedialing: INCallRecordType, callCapability: INCallCapability): this;

	/**
	 * @since 14.0
	 */
	initWithCallRecordFilterCallRecordToCallBackAudioRouteDestinationTypeContactsCallCapability(callRecordFilter: INCallRecordFilter, callRecordToCallBack: INCallRecord, audioRoute: INCallAudioRoute, destinationType: INCallDestinationType, contacts: NSArray<INPerson> | INPerson[], callCapability: INCallCapability): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 13.0
 */
interface INStartCallIntentHandling extends NSObjectProtocol {

	confirmStartCallCompletion?(intent: INStartCallIntent, completion: (p1: INStartCallIntentResponse) => void): void;

	handleStartCallCompletion(intent: INStartCallIntent, completion: (p1: INStartCallIntentResponse) => void): void;

	resolveCallCapabilityForStartCallWithCompletion?(intent: INStartCallIntent, completion: (p1: INStartCallCallCapabilityResolutionResult) => void): void;

	/**
	 * @since 14.0
	 */
	resolveCallRecordToCallBackForStartCallWithCompletion?(intent: INStartCallIntent, completion: (p1: INCallRecordResolutionResult) => void): void;

	resolveContactsForStartCallWithCompletion?(intent: INStartCallIntent, completion: (p1: NSArray<INStartCallContactResolutionResult>) => void): void;

	resolveDestinationTypeForStartCallWithCompletion?(intent: INStartCallIntent, completion: (p1: INCallDestinationTypeResolutionResult) => void): void;
}
declare var INStartCallIntentHandling: {

	prototype: INStartCallIntentHandling;
};

/**
 * @since 13.0
 */
declare var INStartCallIntentIdentifier: string;

/**
 * @since 13.0
 */
declare class INStartCallIntentResponse extends INIntentResponse {

	static alloc(): INStartCallIntentResponse; // inherited from NSObject

	static new(): INStartCallIntentResponse; // inherited from NSObject

	readonly code: INStartCallIntentResponseCode;

	constructor(o: { code: INStartCallIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartCallIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 */
declare const enum INStartCallIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	UserConfirmationRequired = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCallingServiceNotAvailable = 6,

	FailureContactNotSupportedByApp = 7,

	FailureAirplaneModeEnabled = 8,

	FailureUnableToHandOff = 9,

	FailureAppConfigurationRequired = 10,

	FailureCallInProgress = 11,

	FailureCallRinging = 12,

	FailureRequiringInAppAuthentication = 13
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INStartPhotoPlaybackIntent extends INIntent {

	static alloc(): INStartPhotoPlaybackIntent; // inherited from NSObject

	static new(): INStartPhotoPlaybackIntent; // inherited from NSObject

	readonly albumName: string;

	readonly dateCreated: INDateComponentsRange;

	readonly excludedAttributes: INPhotoAttributeOptions;

	readonly includedAttributes: INPhotoAttributeOptions;

	readonly locationCreated: CLPlacemark;

	readonly peopleInPhoto: NSArray<INPerson>;

	readonly peopleInPhotoOperator: INConditionalOperator;

	readonly searchTerms: NSArray<string>;

	readonly searchTermsOperator: INConditionalOperator;

	constructor(o: { dateCreated: INDateComponentsRange; locationCreated: CLPlacemark; albumName: string; searchTerms: NSArray<string> | string[]; includedAttributes: INPhotoAttributeOptions; excludedAttributes: INPhotoAttributeOptions; peopleInPhoto: NSArray<INPerson> | INPerson[]; });

	initWithDateCreatedLocationCreatedAlbumNameSearchTermsIncludedAttributesExcludedAttributesPeopleInPhoto(dateCreated: INDateComponentsRange, locationCreated: CLPlacemark, albumName: string, searchTerms: NSArray<string> | string[], includedAttributes: INPhotoAttributeOptions, excludedAttributes: INPhotoAttributeOptions, peopleInPhoto: NSArray<INPerson> | INPerson[]): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
interface INStartPhotoPlaybackIntentHandling extends NSObjectProtocol {

	confirmStartPhotoPlaybackCompletion?(intent: INStartPhotoPlaybackIntent, completion: (p1: INStartPhotoPlaybackIntentResponse) => void): void;

	handleStartPhotoPlaybackCompletion(intent: INStartPhotoPlaybackIntent, completion: (p1: INStartPhotoPlaybackIntentResponse) => void): void;

	resolveAlbumNameForStartPhotoPlaybackWithCompletion?(intent: INStartPhotoPlaybackIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveDateCreatedForStartPhotoPlaybackWithCompletion?(intent: INStartPhotoPlaybackIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveLocationCreatedForStartPhotoPlaybackWithCompletion?(intent: INStartPhotoPlaybackIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePeopleInPhotoForStartPhotoPlaybackWithCompletion?(intent: INStartPhotoPlaybackIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;
}
declare var INStartPhotoPlaybackIntentHandling: {

	prototype: INStartPhotoPlaybackIntentHandling;
};

/**
 * @since 10.0
 */
declare var INStartPhotoPlaybackIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare class INStartPhotoPlaybackIntentResponse extends INIntentResponse {

	static alloc(): INStartPhotoPlaybackIntentResponse; // inherited from NSObject

	static new(): INStartPhotoPlaybackIntentResponse; // inherited from NSObject

	readonly code: INStartPhotoPlaybackIntentResponseCode;

	searchResultsCount: number;

	constructor(o: { code: INStartPhotoPlaybackIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartPhotoPlaybackIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 15.0
 */
declare const enum INStartPhotoPlaybackIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureAppConfigurationRequired = 5
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare class INStartVideoCallIntent extends INIntent {

	static alloc(): INStartVideoCallIntent; // inherited from NSObject

	static new(): INStartVideoCallIntent; // inherited from NSObject

	readonly contacts: NSArray<INPerson>;

	constructor(o: { contacts: NSArray<INPerson> | INPerson[]; });

	initWithContacts(contacts: NSArray<INPerson> | INPerson[]): this;
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface INStartVideoCallIntentHandling extends NSObjectProtocol {

	confirmStartVideoCallCompletion?(intent: INStartVideoCallIntent, completion: (p1: INStartVideoCallIntentResponse) => void): void;

	handleStartVideoCallCompletion(intent: INStartVideoCallIntent, completion: (p1: INStartVideoCallIntentResponse) => void): void;

	resolveContactsForStartVideoCallWithCompletion?(intent: INStartVideoCallIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;
}
declare var INStartVideoCallIntentHandling: {

	prototype: INStartVideoCallIntentHandling;
};

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare var INStartVideoCallIntentIdentifier: string;

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare class INStartVideoCallIntentResponse extends INIntentResponse {

	static alloc(): INStartVideoCallIntentResponse; // inherited from NSObject

	static new(): INStartVideoCallIntentResponse; // inherited from NSObject

	readonly code: INStartVideoCallIntentResponseCode;

	constructor(o: { code: INStartVideoCallIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartVideoCallIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 * @deprecated 13.0
 */
declare const enum INStartVideoCallIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureAppConfigurationRequired = 5,

	FailureCallingServiceNotAvailable = 6,

	FailureContactNotSupportedByApp = 7,

	FailureInvalidNumber = 8
}

/**
 * @since 10.0
 */
declare class INStartWorkoutIntent extends INIntent {

	static alloc(): INStartWorkoutIntent; // inherited from NSObject

	static new(): INStartWorkoutIntent; // inherited from NSObject

	readonly goalValue: number;

	readonly isOpenEnded: number;

	readonly workoutGoalUnitType: INWorkoutGoalUnitType;

	readonly workoutLocationType: INWorkoutLocationType;

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; goalValue: number; workoutGoalUnitType: INWorkoutGoalUnitType; workoutLocationType: INWorkoutLocationType; isOpenEnded: number; });

	initWithWorkoutNameGoalValueWorkoutGoalUnitTypeWorkoutLocationTypeIsOpenEnded(workoutName: INSpeakableString, goalValue: number, workoutGoalUnitType: INWorkoutGoalUnitType, workoutLocationType: INWorkoutLocationType, isOpenEnded: number): this;
}

/**
 * @since 10.0
 */
interface INStartWorkoutIntentHandling extends NSObjectProtocol {

	confirmStartWorkoutCompletion?(intent: INStartWorkoutIntent, completion: (p1: INStartWorkoutIntentResponse) => void): void;

	handleStartWorkoutCompletion(intent: INStartWorkoutIntent, completion: (p1: INStartWorkoutIntentResponse) => void): void;

	resolveGoalValueForStartWorkoutWithCompletion?(intent: INStartWorkoutIntent, completion: (p1: INDoubleResolutionResult) => void): void;

	resolveIsOpenEndedForStartWorkoutWithCompletion?(intent: INStartWorkoutIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveWorkoutGoalUnitTypeForStartWorkoutWithCompletion?(intent: INStartWorkoutIntent, completion: (p1: INWorkoutGoalUnitTypeResolutionResult) => void): void;

	resolveWorkoutLocationTypeForStartWorkoutWithCompletion?(intent: INStartWorkoutIntent, completion: (p1: INWorkoutLocationTypeResolutionResult) => void): void;

	resolveWorkoutNameForStartWorkoutWithCompletion?(intent: INStartWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INStartWorkoutIntentHandling: {

	prototype: INStartWorkoutIntentHandling;
};

/**
 * @since 10.0
 */
declare var INStartWorkoutIntentIdentifier: string;

/**
 * @since 10.0
 */
declare class INStartWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INStartWorkoutIntentResponse; // inherited from NSObject

	static new(): INStartWorkoutIntentResponse; // inherited from NSObject

	readonly code: INStartWorkoutIntentResponseCode;

	constructor(o: { code: INStartWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 10.0
 */
declare const enum INStartWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureOngoingWorkout = 5,

	FailureNoMatchingWorkout = 6,

	HandleInApp = 7,

	Success = 8
}

/**
 * @since 18.0
 */
declare class INSticker extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INSticker; // inherited from NSObject

	static new(): INSticker; // inherited from NSObject

	readonly emoji: string;

	readonly type: INStickerType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { type: INStickerType; emoji: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTypeEmoji(type: INStickerType, emoji: string): this;
}

/**
 * @since 18.0
 */
declare const enum INStickerType {

	Unknown = 0,

	Emoji = 1,

	Generic = 2
}

/**
 * @since 10.0
 */
declare class INStringResolutionResult extends INIntentResolutionResult {

	static alloc(): INStringResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INStringResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithStringToConfirm(stringToConfirm: string): INStringResolutionResult;

	static disambiguationWithStringsToDisambiguate(stringsToDisambiguate: NSArray<string> | string[]): INStringResolutionResult;

	static needsValue(): INStringResolutionResult; // inherited from INIntentResolutionResult

	static new(): INStringResolutionResult; // inherited from NSObject

	static notRequired(): INStringResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedString(resolvedString: string): INStringResolutionResult;

	static unsupported(): INStringResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INStringResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare class INTask extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTask; // inherited from NSObject

	static new(): INTask; // inherited from NSObject

	readonly createdDateComponents: NSDateComponents;

	readonly identifier: string;

	readonly modifiedDateComponents: NSDateComponents;

	/**
	 * @since 13.0
	 */
	readonly priority: INTaskPriority;

	readonly spatialEventTrigger: INSpatialEventTrigger;

	readonly status: INTaskStatus;

	readonly taskType: INTaskType;

	readonly temporalEventTrigger: INTemporalEventTrigger;

	readonly title: INSpeakableString;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: INSpeakableString; status: INTaskStatus; taskType: INTaskType; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; createdDateComponents: NSDateComponents; modifiedDateComponents: NSDateComponents; identifier: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { title: INSpeakableString; status: INTaskStatus; taskType: INTaskType; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; createdDateComponents: NSDateComponents; modifiedDateComponents: NSDateComponents; identifier: string; priority: INTaskPriority; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleStatusTaskTypeSpatialEventTriggerTemporalEventTriggerCreatedDateComponentsModifiedDateComponentsIdentifier(title: INSpeakableString, status: INTaskStatus, taskType: INTaskType, spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger, createdDateComponents: NSDateComponents, modifiedDateComponents: NSDateComponents, identifier: string): this;

	/**
	 * @since 13.0
	 */
	initWithTitleStatusTaskTypeSpatialEventTriggerTemporalEventTriggerCreatedDateComponentsModifiedDateComponentsIdentifierPriority(title: INSpeakableString, status: INTaskStatus, taskType: INTaskType, spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger, createdDateComponents: NSDateComponents, modifiedDateComponents: NSDateComponents, identifier: string, priority: INTaskPriority): this;
}

/**
 * @since 11.0
 */
declare class INTaskList extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTaskList; // inherited from NSObject

	static new(): INTaskList; // inherited from NSObject

	readonly createdDateComponents: NSDateComponents;

	readonly groupName: INSpeakableString;

	readonly identifier: string;

	readonly modifiedDateComponents: NSDateComponents;

	readonly tasks: NSArray<INTask>;

	readonly title: INSpeakableString;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: INSpeakableString; tasks: NSArray<INTask> | INTask[]; groupName: INSpeakableString; createdDateComponents: NSDateComponents; modifiedDateComponents: NSDateComponents; identifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTitleTasksGroupNameCreatedDateComponentsModifiedDateComponentsIdentifier(title: INSpeakableString, tasks: NSArray<INTask> | INTask[], groupName: INSpeakableString, createdDateComponents: NSDateComponents, modifiedDateComponents: NSDateComponents, identifier: string): this;
}

/**
 * @since 11.0
 */
declare class INTaskListResolutionResult extends INIntentResolutionResult {

	static alloc(): INTaskListResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTaskListResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskListToConfirm(taskListToConfirm: INTaskList): INTaskListResolutionResult;

	static disambiguationWithTaskListsToDisambiguate(taskListsToDisambiguate: NSArray<INTaskList> | INTaskList[]): INTaskListResolutionResult;

	static needsValue(): INTaskListResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTaskListResolutionResult; // inherited from NSObject

	static notRequired(): INTaskListResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTaskList(resolvedTaskList: INTaskList): INTaskListResolutionResult;

	static unsupported(): INTaskListResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTaskListResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare const enum INTaskPriority {

	Unknown = 0,

	NotFlagged = 1,

	Flagged = 2
}

/**
 * @since 13.0
 */
declare class INTaskPriorityResolutionResult extends INIntentResolutionResult {

	static alloc(): INTaskPriorityResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTaskPriorityResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskPriorityToConfirm(taskPriorityToConfirm: INTaskPriority): INTaskPriorityResolutionResult;

	static needsValue(): INTaskPriorityResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTaskPriorityResolutionResult; // inherited from NSObject

	static notRequired(): INTaskPriorityResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTaskPriority(resolvedTaskPriority: INTaskPriority): INTaskPriorityResolutionResult;

	static unsupported(): INTaskPriorityResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTaskPriorityResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare class INTaskResolutionResult extends INIntentResolutionResult {

	static alloc(): INTaskResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTaskResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskToConfirm(taskToConfirm: INTask): INTaskResolutionResult;

	static disambiguationWithTasksToDisambiguate(tasksToDisambiguate: NSArray<INTask> | INTask[]): INTaskResolutionResult;

	static needsValue(): INTaskResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTaskResolutionResult; // inherited from NSObject

	static notRequired(): INTaskResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTask(resolvedTask: INTask): INTaskResolutionResult;

	static unsupported(): INTaskResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTaskResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare const enum INTaskStatus {

	Unknown = 0,

	NotCompleted = 1,

	Completed = 2
}

/**
 * @since 11.0
 */
declare class INTaskStatusResolutionResult extends INIntentResolutionResult {

	static alloc(): INTaskStatusResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTaskStatusToConfirm(taskStatusToConfirm: INTaskStatus): INTaskStatusResolutionResult;

	static needsValue(): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTaskStatusResolutionResult; // inherited from NSObject

	static notRequired(): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTaskStatus(resolvedTaskStatus: INTaskStatus): INTaskStatusResolutionResult;

	static unsupported(): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare const enum INTaskType {

	Unknown = 0,

	NotCompletable = 1,

	Completable = 2
}

/**
 * @since 10.0
 */
declare class INTemperatureResolutionResult extends INIntentResolutionResult {

	static alloc(): INTemperatureResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTemperatureResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTemperatureToConfirm(temperatureToConfirm: NSMeasurement<NSUnitTemperature>): INTemperatureResolutionResult;

	static disambiguationWithTemperaturesToDisambiguate(temperaturesToDisambiguate: NSArray<NSMeasurement<NSUnitTemperature>> | NSMeasurement<NSUnitTemperature>[]): INTemperatureResolutionResult;

	static needsValue(): INTemperatureResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTemperatureResolutionResult; // inherited from NSObject

	static notRequired(): INTemperatureResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTemperature(resolvedTemperature: NSMeasurement<NSUnitTemperature>): INTemperatureResolutionResult;

	static unsupported(): INTemperatureResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTemperatureResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 11.0
 */
declare class INTemporalEventTrigger extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTemporalEventTrigger; // inherited from NSObject

	static new(): INTemporalEventTrigger; // inherited from NSObject

	readonly dateComponentsRange: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { dateComponentsRange: INDateComponentsRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDateComponentsRange(dateComponentsRange: INDateComponentsRange): this;
}

/**
 * @since 11.0
 */
declare class INTemporalEventTriggerResolutionResult extends INIntentResolutionResult {

	static alloc(): INTemporalEventTriggerResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTemporalEventTriggerToConfirm(temporalEventTriggerToConfirm: INTemporalEventTrigger): INTemporalEventTriggerResolutionResult;

	static disambiguationWithTemporalEventTriggersToDisambiguate(temporalEventTriggersToDisambiguate: NSArray<INTemporalEventTrigger> | INTemporalEventTrigger[]): INTemporalEventTriggerResolutionResult;

	static needsValue(): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTemporalEventTriggerResolutionResult; // inherited from NSObject

	static notRequired(): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTemporalEventTrigger(resolvedTemporalEventTrigger: INTemporalEventTrigger): INTemporalEventTriggerResolutionResult;

	static unsupported(): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare const enum INTemporalEventTriggerTypeOptions {

	NotScheduled = 1,

	ScheduledNonRecurring = 2,

	ScheduledRecurring = 4
}

/**
 * @since 13.0
 */
declare class INTemporalEventTriggerTypeOptionsResolutionResult extends INIntentResolutionResult {

	static alloc(): INTemporalEventTriggerTypeOptionsResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTemporalEventTriggerTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTemporalEventTriggerTypeOptionsToConfirm(temporalEventTriggerTypeOptionsToConfirm: INTemporalEventTriggerTypeOptions): INTemporalEventTriggerTypeOptionsResolutionResult;

	static needsValue(): INTemporalEventTriggerTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTemporalEventTriggerTypeOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INTemporalEventTriggerTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTemporalEventTriggerTypeOptions(resolvedTemporalEventTriggerTypeOptions: INTemporalEventTriggerTypeOptions): INTemporalEventTriggerTypeOptionsResolutionResult;

	static unsupported(): INTemporalEventTriggerTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTemporalEventTriggerTypeOptionsResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INTermsAndConditions extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTermsAndConditions; // inherited from NSObject

	static new(): INTermsAndConditions; // inherited from NSObject

	readonly localizedTermsAndConditionsText: string;

	readonly privacyPolicyURL: NSURL;

	readonly termsAndConditionsURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { localizedTermsAndConditionsText: string; privacyPolicyURL: NSURL; termsAndConditionsURL: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLocalizedTermsAndConditionsTextPrivacyPolicyURLTermsAndConditionsURL(localizedTermsAndConditionsText: string, privacyPolicyURL: NSURL, termsAndConditionsURL: NSURL): this;
}

/**
 * @since 11.0
 */
declare class INTextNoteContent extends INNoteContent implements NSCopying, NSSecureCoding {

	static alloc(): INTextNoteContent; // inherited from NSObject

	static new(): INTextNoteContent; // inherited from NSObject

	readonly text: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { text: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithText(text: string): this;
}

/**
 * @since 13.0
 */
declare class INTicketedEvent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTicketedEvent; // inherited from NSObject

	static new(): INTicketedEvent; // inherited from NSObject

	readonly category: INTicketedEventCategory;

	readonly eventDuration: INDateComponentsRange;

	readonly location: CLPlacemark;

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { category: INTicketedEventCategory; name: string; eventDuration: INDateComponentsRange; location: CLPlacemark; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCategoryNameEventDurationLocation(category: INTicketedEventCategory, name: string, eventDuration: INDateComponentsRange, location: CLPlacemark): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare const enum INTicketedEventCategory {

	Unknown = 0,

	Movie = 1
}

/**
 * @since 13.0
 */
declare class INTicketedEventReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INTicketedEventReservation; // inherited from NSObject

	static new(): INTicketedEventReservation; // inherited from NSObject

	readonly event: INTicketedEvent;

	readonly reservedSeat: INSeat;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; reservedSeat: INSeat; event: INTicketedEvent; });

	/**
	 * @since 14.0
	 */
	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; reservedSeat: INSeat; event: INTicketedEvent; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsReservedSeatEvent(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], reservedSeat: INSeat, event: INTicketedEvent): this;

	/**
	 * @since 14.0
	 */
	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLReservedSeatEvent(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, reservedSeat: INSeat, event: INTicketedEvent): this;
}

/**
 * @since 13.0
 */
declare class INTimeIntervalResolutionResult extends INIntentResolutionResult {

	static alloc(): INTimeIntervalResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INTimeIntervalResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithTimeIntervalToConfirm(timeIntervalToConfirm: number): INTimeIntervalResolutionResult;

	static needsValue(): INTimeIntervalResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTimeIntervalResolutionResult; // inherited from NSObject

	static notRequired(): INTimeIntervalResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTimeInterval(resolvedTimeInterval: number): INTimeIntervalResolutionResult;

	static unsupported(): INTimeIntervalResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INTimeIntervalResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 13.0
 */
declare class INTrainReservation extends INReservation implements NSCopying, NSSecureCoding {

	static alloc(): INTrainReservation; // inherited from NSObject

	static new(): INTrainReservation; // inherited from NSObject

	readonly reservedSeat: INSeat;

	readonly trainTrip: INTrainTrip;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; reservedSeat: INSeat; trainTrip: INTrainTrip; });

	/**
	 * @since 14.0
	 */
	constructor(o: { itemReference: INSpeakableString; reservationNumber: string; bookingTime: Date; reservationStatus: INReservationStatus; reservationHolderName: string; actions: NSArray<INReservationAction> | INReservationAction[]; URL: NSURL; reservedSeat: INSeat; trainTrip: INTrainTrip; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsReservedSeatTrainTrip(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], reservedSeat: INSeat, trainTrip: INTrainTrip): this;

	/**
	 * @since 14.0
	 */
	initWithItemReferenceReservationNumberBookingTimeReservationStatusReservationHolderNameActionsURLReservedSeatTrainTrip(itemReference: INSpeakableString, reservationNumber: string, bookingTime: Date, reservationStatus: INReservationStatus, reservationHolderName: string, actions: NSArray<INReservationAction> | INReservationAction[], URL: NSURL, reservedSeat: INSeat, trainTrip: INTrainTrip): this;
}

/**
 * @since 13.0
 */
declare class INTrainTrip extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTrainTrip; // inherited from NSObject

	static new(): INTrainTrip; // inherited from NSObject

	readonly arrivalPlatform: string;

	readonly arrivalStationLocation: CLPlacemark;

	readonly departurePlatform: string;

	readonly departureStationLocation: CLPlacemark;

	readonly provider: string;

	readonly trainName: string;

	readonly trainNumber: string;

	readonly tripDuration: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { provider: string; trainName: string; trainNumber: string; tripDuration: INDateComponentsRange; departureStationLocation: CLPlacemark; departurePlatform: string; arrivalStationLocation: CLPlacemark; arrivalPlatform: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithProviderTrainNameTrainNumberTripDurationDepartureStationLocationDeparturePlatformArrivalStationLocationArrivalPlatform(provider: string, trainName: string, trainNumber: string, tripDuration: INDateComponentsRange, departureStationLocation: CLPlacemark, departurePlatform: string, arrivalStationLocation: CLPlacemark, arrivalPlatform: string): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INTransferMoneyIntent extends INIntent {

	static alloc(): INTransferMoneyIntent; // inherited from NSObject

	static new(): INTransferMoneyIntent; // inherited from NSObject

	readonly fromAccount: INPaymentAccount;

	readonly toAccount: INPaymentAccount;

	readonly transactionAmount: INPaymentAmount;

	readonly transactionNote: string;

	readonly transactionScheduledDate: INDateComponentsRange;

	constructor(o: { fromAccount: INPaymentAccount; toAccount: INPaymentAccount; transactionAmount: INPaymentAmount; transactionScheduledDate: INDateComponentsRange; transactionNote: string; });

	initWithFromAccountToAccountTransactionAmountTransactionScheduledDateTransactionNote(fromAccount: INPaymentAccount, toAccount: INPaymentAccount, transactionAmount: INPaymentAmount, transactionScheduledDate: INDateComponentsRange, transactionNote: string): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
interface INTransferMoneyIntentHandling extends NSObjectProtocol {

	confirmTransferMoneyCompletion?(intent: INTransferMoneyIntent, completion: (p1: INTransferMoneyIntentResponse) => void): void;

	handleTransferMoneyCompletion(intent: INTransferMoneyIntent, completion: (p1: INTransferMoneyIntentResponse) => void): void;

	resolveFromAccountForTransferMoneyWithCompletion?(intent: INTransferMoneyIntent, completion: (p1: INPaymentAccountResolutionResult) => void): void;

	resolveToAccountForTransferMoneyWithCompletion?(intent: INTransferMoneyIntent, completion: (p1: INPaymentAccountResolutionResult) => void): void;

	resolveTransactionAmountForTransferMoneyWithCompletion?(intent: INTransferMoneyIntent, completion: (p1: INPaymentAmountResolutionResult) => void): void;

	resolveTransactionNoteForTransferMoneyWithCompletion?(intent: INTransferMoneyIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveTransactionScheduledDateForTransferMoneyWithCompletion?(intent: INTransferMoneyIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;
}
declare var INTransferMoneyIntentHandling: {

	prototype: INTransferMoneyIntentHandling;
};

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INTransferMoneyIntentResponse extends INIntentResponse {

	static alloc(): INTransferMoneyIntentResponse; // inherited from NSObject

	static new(): INTransferMoneyIntentResponse; // inherited from NSObject

	readonly code: INTransferMoneyIntentResponseCode;

	fromAccount: INPaymentAccount;

	toAccount: INPaymentAccount;

	transactionAmount: INPaymentAmount;

	transactionNote: string;

	transactionScheduledDate: INDateComponentsRange;

	transferFee: INCurrencyAmount;

	constructor(o: { code: INTransferMoneyIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INTransferMoneyIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare const enum INTransferMoneyIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCredentialsUnverified = 6,

	FailureInsufficientFunds = 7
}

/**
 * @since 13.0
 */
declare class INURLResolutionResult extends INIntentResolutionResult {

	static alloc(): INURLResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INURLResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithURLToConfirm(urlToConfirm: NSURL): INURLResolutionResult;

	static disambiguationWithURLsToDisambiguate(urlsToDisambiguate: NSArray<NSURL> | NSURL[]): INURLResolutionResult;

	static needsValue(): INURLResolutionResult; // inherited from INIntentResolutionResult

	static new(): INURLResolutionResult; // inherited from NSObject

	static notRequired(): INURLResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedURL(resolvedURL: NSURL): INURLResolutionResult;

	static unsupported(): INURLResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INURLResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 17.0
 */
declare class INUnsendMessagesIntent extends INIntent {

	static alloc(): INUnsendMessagesIntent; // inherited from NSObject

	static new(): INUnsendMessagesIntent; // inherited from NSObject

	readonly messageIdentifiers: NSArray<string>;

	constructor(o: { messageIdentifiers: NSArray<string> | string[]; });

	initWithMessageIdentifiers(messageIdentifiers: NSArray<string> | string[]): this;
}

/**
 * @since 17.0
 */
interface INUnsendMessagesIntentHandling extends NSObjectProtocol {

	confirmUnsendMessagesCompletion?(intent: INUnsendMessagesIntent, completion: (p1: INUnsendMessagesIntentResponse) => void): void;

	handleUnsendMessagesCompletion(intent: INUnsendMessagesIntent, completion: (p1: INUnsendMessagesIntentResponse) => void): void;
}
declare var INUnsendMessagesIntentHandling: {

	prototype: INUnsendMessagesIntentHandling;
};

/**
 * @since 17.0
 */
declare class INUnsendMessagesIntentResponse extends INIntentResponse {

	static alloc(): INUnsendMessagesIntentResponse; // inherited from NSObject

	static new(): INUnsendMessagesIntentResponse; // inherited from NSObject

	readonly code: INUnsendMessagesIntentResponseCode;

	constructor(o: { code: INUnsendMessagesIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INUnsendMessagesIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 17.0
 */
declare const enum INUnsendMessagesIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureMessageNotFound = 6,

	FailurePastUnsendTimeLimit = 7,

	FailureMessageTypeUnsupported = 8,

	FailureUnsupportedOnService = 9,

	FailureMessageServiceNotAvailable = 10,

	FailureRequiringInAppAuthentication = 11
}

/**
 * @since 12.0
 */
declare class INUpcomingMediaManager extends NSObject {

	static alloc(): INUpcomingMediaManager; // inherited from NSObject

	static new(): INUpcomingMediaManager; // inherited from NSObject

	static readonly sharedManager: INUpcomingMediaManager;

	setPredictionModeForType(mode: INUpcomingMediaPredictionMode, type: INMediaItemType): void;

	setSuggestedMediaIntents(intents: NSOrderedSet<INPlayMediaIntent>): void;
}

/**
 * @since 12.0
 */
declare const enum INUpcomingMediaPredictionMode {

	Default = 0,

	OnlyPredictSuggestedIntents = 1
}

/**
 * @since 13.0
 */
declare class INUpdateMediaAffinityIntent extends INIntent {

	static alloc(): INUpdateMediaAffinityIntent; // inherited from NSObject

	static new(): INUpdateMediaAffinityIntent; // inherited from NSObject

	readonly affinityType: INMediaAffinityType;

	readonly mediaItems: NSArray<INMediaItem>;

	readonly mediaSearch: INMediaSearch;

	constructor(o: { mediaItems: NSArray<INMediaItem> | INMediaItem[]; mediaSearch: INMediaSearch; affinityType: INMediaAffinityType; });

	initWithMediaItemsMediaSearchAffinityType(mediaItems: NSArray<INMediaItem> | INMediaItem[], mediaSearch: INMediaSearch, affinityType: INMediaAffinityType): this;
}

/**
 * @since 13.0
 */
interface INUpdateMediaAffinityIntentHandling extends NSObjectProtocol {

	confirmUpdateMediaAffinityCompletion?(intent: INUpdateMediaAffinityIntent, completion: (p1: INUpdateMediaAffinityIntentResponse) => void): void;

	handleUpdateMediaAffinityCompletion(intent: INUpdateMediaAffinityIntent, completion: (p1: INUpdateMediaAffinityIntentResponse) => void): void;

	resolveAffinityTypeForUpdateMediaAffinityWithCompletion?(intent: INUpdateMediaAffinityIntent, completion: (p1: INMediaAffinityTypeResolutionResult) => void): void;

	resolveMediaItemsForUpdateMediaAffinityWithCompletion?(intent: INUpdateMediaAffinityIntent, completion: (p1: NSArray<INUpdateMediaAffinityMediaItemResolutionResult>) => void): void;
}
declare var INUpdateMediaAffinityIntentHandling: {

	prototype: INUpdateMediaAffinityIntentHandling;
};

/**
 * @since 13.0
 */
declare class INUpdateMediaAffinityIntentResponse extends INIntentResponse {

	static alloc(): INUpdateMediaAffinityIntentResponse; // inherited from NSObject

	static new(): INUpdateMediaAffinityIntentResponse; // inherited from NSObject

	readonly code: INUpdateMediaAffinityIntentResponseCode;

	constructor(o: { code: INUpdateMediaAffinityIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INUpdateMediaAffinityIntentResponseCode, userActivity: NSUserActivity): this;
}

/**
 * @since 13.0
 */
declare const enum INUpdateMediaAffinityIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

/**
 * @since 13.0
 */
declare class INUpdateMediaAffinityMediaItemResolutionResult extends INMediaItemResolutionResult {

	static alloc(): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithMediaItemToConfirm(mediaItemToConfirm: INMediaItem): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static disambiguationWithMediaItemsToDisambiguate(mediaItemsToDisambiguate: NSArray<INMediaItem> | INMediaItem[]): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static needsValue(): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static new(): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from NSObject

	static notRequired(): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMediaItem(resolvedMediaItem: INMediaItem): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INMediaItemResolutionResult

	static unsupported(): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INUpdateMediaAffinityMediaItemUnsupportedReason): INUpdateMediaAffinityMediaItemResolutionResult;

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INUpdateMediaAffinityMediaItemResolutionResult; // inherited from INIntentResolutionResult

	constructor(o: { mediaItemResolutionResult: INMediaItemResolutionResult; });

	initWithMediaItemResolutionResult(mediaItemResolutionResult: INMediaItemResolutionResult): this;
}

/**
 * @since 13.0
 */
declare const enum INUpdateMediaAffinityMediaItemUnsupportedReason {

	LoginRequired = 1,

	SubscriptionRequired = 2,

	UnsupportedMediaType = 3,

	ExplicitContentSettings = 4,

	CellularDataSettings = 5,

	RestrictedContent = 6,

	ServiceUnavailable = 7,

	RegionRestriction = 8
}

/**
 * @since 13.0
 */
declare class INUserContext extends NSObject implements NSSecureCoding {

	static alloc(): INUserContext; // inherited from NSObject

	static new(): INUserContext; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	becomeCurrent(): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 * @deprecated 13.0
 */
interface INVisualCodeDomainHandling extends INGetVisualCodeIntentHandling {
}
declare var INVisualCodeDomainHandling: {

	prototype: INVisualCodeDomainHandling;
};

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare const enum INVisualCodeType {

	Unknown = 0,

	Contact = 1,

	RequestPayment = 2,

	SendPayment = 3,

	Transit = 4,

	Bus = 5,

	Subway = 6
}

/**
 * @since 11.0
 * @deprecated 15.0
 */
declare class INVisualCodeTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INVisualCodeTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithVisualCodeTypeToConfirm(visualCodeTypeToConfirm: INVisualCodeType): INVisualCodeTypeResolutionResult;

	static needsValue(): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INVisualCodeTypeResolutionResult; // inherited from NSObject

	static notRequired(): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedVisualCodeType(resolvedVisualCodeType: INVisualCodeType): INVisualCodeTypeResolutionResult;

	static unsupported(): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare class INVocabulary extends NSObject {

	static alloc(): INVocabulary; // inherited from NSObject

	static new(): INVocabulary; // inherited from NSObject

	static sharedVocabulary(): INVocabulary;

	removeAllVocabularyStrings(): void;

	/**
	 * @since 11.0
	 */
	setVocabularyOfType(vocabulary: NSOrderedSet<INSpeakable>, type: INVocabularyStringType): void;

	setVocabularyStringsOfType(vocabulary: NSOrderedSet<string>, type: INVocabularyStringType): void;
}

/**
 * @since 10.0
 */
declare const enum INVocabularyStringType {

	ContactName = 1,

	ContactGroupName = 2,

	PhotoTag = 100,

	PhotoAlbumName = 101,

	WorkoutActivityName = 200,

	CarProfileName = 300,

	CarName = 301,

	PaymentsOrganizationName = 400,

	PaymentsAccountNickname = 401,

	NotebookItemTitle = 500,

	NotebookItemGroupName = 501,

	MediaPlaylistTitle = 700,

	MediaMusicArtistName = 701,

	MediaAudiobookTitle = 702,

	MediaAudiobookAuthorName = 703,

	MediaShowTitle = 704
}

/**
 * @since 12.0
 */
declare class INVoiceShortcut extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INVoiceShortcut; // inherited from NSObject

	static new(): INVoiceShortcut; // inherited from NSObject

	readonly identifier: NSUUID;

	readonly invocationPhrase: string;

	readonly shortcut: INShortcut;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare class INVoiceShortcutCenter extends NSObject {

	static alloc(): INVoiceShortcutCenter; // inherited from NSObject

	static new(): INVoiceShortcutCenter; // inherited from NSObject

	static readonly sharedCenter: INVoiceShortcutCenter;

	getAllVoiceShortcutsWithCompletion(completionHandler: (p1: NSArray<INVoiceShortcut>, p2: NSError) => void): void;

	getVoiceShortcutWithIdentifierCompletion(identifier: NSUUID, completionHandler: (p1: INVoiceShortcut, p2: NSError) => void): void;

	setShortcutSuggestions(suggestions: NSArray<INShortcut> | INShortcut[]): void;
}

/**
 * @since 13.0
 */
declare class INVolumeResolutionResult extends INIntentResolutionResult {

	static alloc(): INVolumeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INVolumeResolutionResult; // inherited from INIntentResolutionResult

	static confirmationRequiredWithVolumeToConfirm(volumeToConfirm: NSMeasurement<NSUnitVolume>): INVolumeResolutionResult;

	static disambiguationWithVolumeToDisambiguate(volumeToDisambiguate: NSArray<NSMeasurement<NSUnitVolume>> | NSMeasurement<NSUnitVolume>[]): INVolumeResolutionResult;

	static needsValue(): INVolumeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INVolumeResolutionResult; // inherited from NSObject

	static notRequired(): INVolumeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedVolume(resolvedVolume: NSMeasurement<NSUnitVolume>): INVolumeResolutionResult;

	static unsupported(): INVolumeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INVolumeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare const enum INWorkoutGoalUnitType {

	Unknown = 0,

	Inch = 1,

	Meter = 2,

	Foot = 3,

	Mile = 4,

	Yard = 5,

	Second = 6,

	Minute = 7,

	Hour = 8,

	Joule = 9,

	KiloCalorie = 10
}

/**
 * @since 10.0
 */
declare class INWorkoutGoalUnitTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INWorkoutGoalUnitTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static confirmationRequiredWithWorkoutGoalUnitTypeToConfirm(workoutGoalUnitTypeToConfirm: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static needsValue(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INWorkoutGoalUnitTypeResolutionResult; // inherited from NSObject

	static notRequired(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static successWithResolvedWorkoutGoalUnitType(resolvedWorkoutGoalUnitType: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static unsupported(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.0
 */
declare const enum INWorkoutLocationType {

	Unknown = 0,

	Outdoor = 1,

	Indoor = 2
}

/**
 * @since 10.0
 */
declare class INWorkoutLocationTypeResolutionResult extends INIntentResolutionResult {

	static alloc(): INWorkoutLocationTypeResolutionResult; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static confirmationRequiredWithItemToConfirmForReason(itemToConfirm: any, reason: number): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static confirmationRequiredWithValueToConfirm(valueToConfirm: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static confirmationRequiredWithWorkoutLocationTypeToConfirm(workoutLocationTypeToConfirm: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static needsValue(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INWorkoutLocationTypeResolutionResult; // inherited from NSObject

	static notRequired(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static successWithResolvedValue(resolvedValue: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static successWithResolvedWorkoutLocationType(resolvedWorkoutLocationType: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static unsupported(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	/**
	 * @since 13.0
	 */
	static unsupportedWithReason(reason: number): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult
}

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierCrosstraining: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierCycle: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierDance: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierElliptical: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierExercise: string;

/**
 * @since 12.0
 */
declare var INWorkoutNameIdentifierHighIntensityIntervalTraining: string;

/**
 * @since 12.0
 */
declare var INWorkoutNameIdentifierHike: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierIndoorcycle: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierIndoorrun: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierIndoorwalk: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierMove: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierOther: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierRower: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierRun: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierSit: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierStairs: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierStand: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierSteps: string;

/**
 * @since 12.0
 */
declare var INWorkoutNameIdentifierSwim: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierWalk: string;

/**
 * @since 10.2
 */
declare var INWorkoutNameIdentifierYoga: string;

/**
 * @since 10.0
 * @deprecated 13.0
 */
interface INWorkoutsDomainHandling extends INCancelWorkoutIntentHandling, INEndWorkoutIntentHandling, INPauseWorkoutIntentHandling, INResumeWorkoutIntentHandling, INStartWorkoutIntentHandling {
}
declare var INWorkoutsDomainHandling: {

	prototype: INWorkoutsDomainHandling;
};

declare var IntentsVersionNumber: number;

declare var IntentsVersionString: interop.Reference<number>;
