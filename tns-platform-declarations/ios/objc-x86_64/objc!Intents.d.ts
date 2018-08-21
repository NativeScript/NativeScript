
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

declare class INAccountTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INAccountTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithAccountTypeToConfirm(accountTypeToConfirm: INAccountType): INAccountTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INAccountType): INAccountTypeResolutionResult;

	static needsValue(): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INAccountTypeResolutionResult; // inherited from NSObject

	static notRequired(): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedAccountType(resolvedAccountType: INAccountType): INAccountTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INAccountType): INAccountTypeResolutionResult;

	static unsupported(): INAccountTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INActivateCarSignalIntent extends INIntent {

	static alloc(): INActivateCarSignalIntent; // inherited from NSObject

	static new(): INActivateCarSignalIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	readonly signals: INCarSignalOptions;

	constructor(o: { carName: INSpeakableString; signals: INCarSignalOptions; });

	initWithCarNameSignals(carName: INSpeakableString, signals: INCarSignalOptions): this;
}

interface INActivateCarSignalIntentHandling extends NSObjectProtocol {

	confirmActivateCarSignalCompletion?(intent: INActivateCarSignalIntent, completion: (p1: INActivateCarSignalIntentResponse) => void): void;

	handleActivateCarSignalCompletion(intent: INActivateCarSignalIntent, completion: (p1: INActivateCarSignalIntentResponse) => void): void;

	resolveCarNameForActivateCarSignalWithCompletion?(intent: INActivateCarSignalIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveSignalsForActivateCarSignalWithCompletion?(intent: INActivateCarSignalIntent, completion: (p1: INCarSignalOptionsResolutionResult) => void): void;
}
declare var INActivateCarSignalIntentHandling: {

	prototype: INActivateCarSignalIntentHandling;
};

declare class INActivateCarSignalIntentResponse extends INIntentResponse {

	static alloc(): INActivateCarSignalIntentResponse; // inherited from NSObject

	static new(): INActivateCarSignalIntentResponse; // inherited from NSObject

	readonly code: INActivateCarSignalIntentResponseCode;

	signals: INCarSignalOptions;

	constructor(o: { code: INActivateCarSignalIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INActivateCarSignalIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INActivateCarSignalIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INAddTasksIntent extends INIntent {

	static alloc(): INAddTasksIntent; // inherited from NSObject

	static new(): INAddTasksIntent; // inherited from NSObject

	readonly spatialEventTrigger: INSpatialEventTrigger;

	readonly targetTaskList: INTaskList;

	readonly taskTitles: NSArray<INSpeakableString>;

	readonly temporalEventTrigger: INTemporalEventTrigger;

	constructor(o: { targetTaskList: INTaskList; taskTitles: NSArray<INSpeakableString>; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; });

	initWithTargetTaskListTaskTitlesSpatialEventTriggerTemporalEventTrigger(targetTaskList: INTaskList, taskTitles: NSArray<INSpeakableString>, spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger): this;
}

interface INAddTasksIntentHandling extends NSObjectProtocol {

	confirmAddTasksCompletion?(intent: INAddTasksIntent, completion: (p1: INAddTasksIntentResponse) => void): void;

	handleAddTasksCompletion(intent: INAddTasksIntent, completion: (p1: INAddTasksIntentResponse) => void): void;

	resolveSpatialEventTriggerForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: INSpatialEventTriggerResolutionResult) => void): void;

	resolveTargetTaskListForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: INTaskListResolutionResult) => void): void;

	resolveTaskTitlesForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: NSArray<INSpeakableStringResolutionResult>) => void): void;

	resolveTemporalEventTriggerForAddTasksWithCompletion?(intent: INAddTasksIntent, completion: (p1: INTemporalEventTriggerResolutionResult) => void): void;
}
declare var INAddTasksIntentHandling: {

	prototype: INAddTasksIntentHandling;
};

declare class INAddTasksIntentResponse extends INIntentResponse {

	static alloc(): INAddTasksIntentResponse; // inherited from NSObject

	static new(): INAddTasksIntentResponse; // inherited from NSObject

	addedTasks: NSArray<INTask>;

	readonly code: INAddTasksIntentResponseCode;

	modifiedTaskList: INTaskList;

	constructor(o: { code: INAddTasksIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INAddTasksIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INAddTasksIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare const enum INAmountType {

	Unknown = 0,

	MinimumDue = 1,

	AmountDue = 2,

	CurrentBalance = 3,

	MaximumTransferAmount = 4,

	MinimumTransferAmount = 5,

	StatementBalance = 6
}

declare class INAppendToNoteIntent extends INIntent {

	static alloc(): INAppendToNoteIntent; // inherited from NSObject

	static new(): INAppendToNoteIntent; // inherited from NSObject

	readonly content: INNoteContent;

	readonly targetNote: INNote;

	constructor(o: { targetNote: INNote; content: INNoteContent; });

	initWithTargetNoteContent(targetNote: INNote, content: INNoteContent): this;
}

interface INAppendToNoteIntentHandling extends NSObjectProtocol {

	confirmAppendToNoteCompletion?(intent: INAppendToNoteIntent, completion: (p1: INAppendToNoteIntentResponse) => void): void;

	handleAppendToNoteCompletion(intent: INAppendToNoteIntent, completion: (p1: INAppendToNoteIntentResponse) => void): void;

	resolveContentForAppendToNoteWithCompletion?(intent: INAppendToNoteIntent, completion: (p1: INNoteContentResolutionResult) => void): void;

	resolveTargetNoteForAppendToNoteWithCompletion?(intent: INAppendToNoteIntent, completion: (p1: INNoteResolutionResult) => void): void;
}
declare var INAppendToNoteIntentHandling: {

	prototype: INAppendToNoteIntentHandling;
};

declare class INAppendToNoteIntentResponse extends INIntentResponse {

	static alloc(): INAppendToNoteIntentResponse; // inherited from NSObject

	static new(): INAppendToNoteIntentResponse; // inherited from NSObject

	readonly code: INAppendToNoteIntentResponseCode;

	note: INNote;

	constructor(o: { code: INAppendToNoteIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INAppendToNoteIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INAppendToNoteIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCannotUpdatePasswordProtectedNote = 6
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithAmountBalanceType(amount: NSDecimalNumber, balanceType: INBalanceType): this;

	initWithAmountCurrencyCode(amount: NSDecimalNumber, currencyCode: string): this;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum INBalanceType {

	Unknown = 0,

	Money = 1,

	Points = 2,

	Miles = 3
}

declare class INBalanceTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INBalanceTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithBalanceTypeToConfirm(balanceTypeToConfirm: INBalanceType): INBalanceTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INBalanceType): INBalanceTypeResolutionResult;

	static needsValue(): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBalanceTypeResolutionResult; // inherited from NSObject

	static notRequired(): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedBalanceType(resolvedBalanceType: INBalanceType): INBalanceTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INBalanceType): INBalanceTypeResolutionResult;

	static unsupported(): INBalanceTypeResolutionResult; // inherited from INIntentResolutionResult
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithBillTypePaymentStatusBillPayeeAmountDueMinimumDueLateFeeDueDatePaymentDate(billType: INBillType, paymentStatus: INPaymentStatus, billPayee: INBillPayee, amountDue: INCurrencyAmount, minimumDue: INCurrencyAmount, lateFee: INCurrencyAmount, dueDate: NSDateComponents, paymentDate: NSDateComponents): this;

	initWithCoder(aDecoder: NSCoder): this;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithNicknameNumberOrganizationName(nickname: INSpeakableString, accountNumber: string, organizationName: INSpeakableString): this;
}

declare class INBillPayeeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INBillPayeeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithBillPayeeToConfirm(billPayeeToConfirm: INBillPayee): INBillPayeeResolutionResult;

	static disambiguationWithBillPayeesToDisambiguate(billPayeesToDisambiguate: NSArray<INBillPayee>): INBillPayeeResolutionResult;

	static needsValue(): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBillPayeeResolutionResult; // inherited from NSObject

	static notRequired(): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedBillPayee(resolvedBillPayee: INBillPayee): INBillPayeeResolutionResult;

	static unsupported(): INBillPayeeResolutionResult; // inherited from INIntentResolutionResult
}

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

declare class INBillTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INBillTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithBillTypeToConfirm(billTypeToConfirm: INBillType): INBillTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INBillType): INBillTypeResolutionResult;

	static needsValue(): INBillTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBillTypeResolutionResult; // inherited from NSObject

	static notRequired(): INBillTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedBillType(resolvedBillType: INBillType): INBillTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INBillType): INBillTypeResolutionResult;

	static unsupported(): INBillTypeResolutionResult; // inherited from INIntentResolutionResult
}

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

	constructor(o: { restaurant: INRestaurant; bookingDateComponents: NSDateComponents; partySize: number; bookingIdentifier: string; guest: INRestaurantGuest; selectedOffer: INRestaurantOffer; guestProvidedSpecialRequestText: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

declare class INBookRestaurantReservationIntentResponse extends INIntentResponse {

	static alloc(): INBookRestaurantReservationIntentResponse; // inherited from NSObject

	static new(): INBookRestaurantReservationIntentResponse; // inherited from NSObject

	readonly code: INBookRestaurantReservationIntentCode;

	userBooking: INRestaurantReservationUserBooking;

	constructor(o: { code: INBookRestaurantReservationIntentCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INBookRestaurantReservationIntentCode, userActivity: NSUserActivity): this;
}

declare class INBooleanResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INBooleanResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INBooleanResolutionResult;

	static needsValue(): INBooleanResolutionResult; // inherited from INIntentResolutionResult

	static new(): INBooleanResolutionResult; // inherited from NSObject

	static notRequired(): INBooleanResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: boolean): INBooleanResolutionResult;

	static unsupported(): INBooleanResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INCallCapability {

	Unknown = 0,

	AudioCall = 1,

	VideoCall = 2
}

declare const enum INCallCapabilityOptions {

	AudioCall = 1,

	VideoCall = 2
}

declare const enum INCallDestinationType {

	Unknown = 0,

	Normal = 1,

	Emergency = 2,

	Voicemail = 3,

	Redial = 4,

	NormalDestination = 1,

	EmergencyDestination = 2,

	VoicemailDestination = 3,

	RedialDestination = 4
}

declare class INCallDestinationTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCallDestinationTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallDestinationTypeToConfirm(callDestinationTypeToConfirm: INCallDestinationType): INCallDestinationTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCallDestinationType): INCallDestinationTypeResolutionResult;

	static needsValue(): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallDestinationTypeResolutionResult; // inherited from NSObject

	static notRequired(): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallDestinationType(resolvedCallDestinationType: INCallDestinationType): INCallDestinationTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INCallDestinationType): INCallDestinationTypeResolutionResult;

	static unsupported(): INCallDestinationTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INCallRecord extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCallRecord; // inherited from NSObject

	static new(): INCallRecord; // inherited from NSObject

	readonly callCapability: INCallCapability;

	readonly callDuration: number;

	readonly callRecordType: INCallRecordType;

	readonly caller: INPerson;

	readonly dateCreated: Date;

	readonly identifier: string;

	readonly unseen: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; dateCreated: Date; caller: INPerson; callRecordType: INCallRecordType; callCapability: INCallCapability; callDuration: number; unseen: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithIdentifierDateCreatedCallerCallRecordTypeCallCapabilityCallDurationUnseen(identifier: string, dateCreated: Date, caller: INPerson, callRecordType: INCallRecordType, callCapability: INCallCapability, callDuration: number, unseen: number): this;
}

declare const enum INCallRecordType {

	Unknown = 0,

	Outgoing = 1,

	Missed = 2,

	Received = 3,

	Latest = 4,

	Voicemail = 5
}

declare const enum INCallRecordTypeOptions {

	Outgoing = 1,

	Missed = 2,

	Received = 4,

	Latest = 8,

	Voicemail = 16
}

declare class INCallRecordTypeOptionsResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCallRecordTypeOptionsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallRecordTypeOptionsToConfirm(callRecordTypeOptionsToConfirm: INCallRecordTypeOptions): INCallRecordTypeOptionsResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCallRecordTypeOptions): INCallRecordTypeOptionsResolutionResult;

	static needsValue(): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallRecordTypeOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallRecordTypeOptions(resolvedCallRecordTypeOptions: INCallRecordTypeOptions): INCallRecordTypeOptionsResolutionResult;

	static successWithResolvedValue(resolvedValue: INCallRecordTypeOptions): INCallRecordTypeOptionsResolutionResult;

	static unsupported(): INCallRecordTypeOptionsResolutionResult; // inherited from INIntentResolutionResult
}

declare class INCallRecordTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCallRecordTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCallRecordTypeToConfirm(callRecordTypeToConfirm: INCallRecordType): INCallRecordTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCallRecordType): INCallRecordTypeResolutionResult;

	static needsValue(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallRecordTypeResolutionResult; // inherited from NSObject

	static notRequired(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCallRecordType(resolvedCallRecordType: INCallRecordType): INCallRecordTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INCallRecordType): INCallRecordTypeResolutionResult;

	static unsupported(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult
}

interface INCallsDomainHandling extends INSearchCallHistoryIntentHandling, INStartAudioCallIntentHandling, INStartVideoCallIntentHandling {
}
declare var INCallsDomainHandling: {

	prototype: INCallsDomainHandling;
};

declare class INCancelRideIntent extends INIntent {

	static alloc(): INCancelRideIntent; // inherited from NSObject

	static new(): INCancelRideIntent; // inherited from NSObject

	readonly rideIdentifier: string;

	constructor(o: { rideIdentifier: string; });

	initWithRideIdentifier(rideIdentifier: string): this;
}

interface INCancelRideIntentHandling extends NSObjectProtocol {

	confirmCancelRideCompletion?(intent: INCancelRideIntent, completion: (p1: INCancelRideIntentResponse) => void): void;

	handleCancelRideCompletion(intent: INCancelRideIntent, completion: (p1: INCancelRideIntentResponse) => void): void;
}
declare var INCancelRideIntentHandling: {

	prototype: INCancelRideIntentHandling;
};

declare class INCancelRideIntentResponse extends INIntentResponse {

	static alloc(): INCancelRideIntentResponse; // inherited from NSObject

	static new(): INCancelRideIntentResponse; // inherited from NSObject

	cancellationFee: INCurrencyAmount;

	cancellationFeeThreshold: NSDateComponents;

	readonly code: INCancelRideIntentResponseCode;

	constructor(o: { code: INCancelRideIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCancelRideIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INCancelRideIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	Success = 2,

	Failure = 3
}

declare class INCancelWorkoutIntent extends INIntent {

	static alloc(): INCancelWorkoutIntent; // inherited from NSObject

	static new(): INCancelWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

interface INCancelWorkoutIntentHandling extends NSObjectProtocol {

	confirmCancelWorkoutCompletion?(intent: INCancelWorkoutIntent, completion: (p1: INCancelWorkoutIntentResponse) => void): void;

	handleCancelWorkoutCompletion(intent: INCancelWorkoutIntent, completion: (p1: INCancelWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForCancelWorkoutWithCompletion?(intent: INCancelWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INCancelWorkoutIntentHandling: {

	prototype: INCancelWorkoutIntentHandling;
};

declare var INCancelWorkoutIntentIdentifier: string;

declare class INCancelWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INCancelWorkoutIntentResponse; // inherited from NSObject

	static new(): INCancelWorkoutIntentResponse; // inherited from NSObject

	readonly code: INCancelWorkoutIntentResponseCode;

	constructor(o: { code: INCancelWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCancelWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INCancelWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	Success = 6,

	HandleInApp = 7
}

declare const enum INCarAirCirculationMode {

	Unknown = 0,

	FreshAir = 1,

	RecirculateAir = 2
}

declare class INCarAirCirculationModeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarAirCirculationModeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarAirCirculationModeToConfirm(carAirCirculationModeToConfirm: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	static needsValue(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarAirCirculationModeResolutionResult; // inherited from NSObject

	static notRequired(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarAirCirculationMode(resolvedCarAirCirculationMode: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	static successWithResolvedValue(resolvedValue: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	static unsupported(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult
}

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

declare class INCarAudioSourceResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarAudioSourceResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarAudioSourceToConfirm(carAudioSourceToConfirm: INCarAudioSource): INCarAudioSourceResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarAudioSource): INCarAudioSourceResolutionResult;

	static needsValue(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarAudioSourceResolutionResult; // inherited from NSObject

	static notRequired(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarAudioSource(resolvedCarAudioSource: INCarAudioSource): INCarAudioSourceResolutionResult;

	static successWithResolvedValue(resolvedValue: INCarAudioSource): INCarAudioSourceResolutionResult;

	static unsupported(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult
}

interface INCarCommandsDomainHandling extends INActivateCarSignalIntentHandling, INGetCarLockStatusIntentHandling, INGetCarPowerLevelStatusIntentHandling, INSetCarLockStatusIntentHandling {
}
declare var INCarCommandsDomainHandling: {

	prototype: INCarCommandsDomainHandling;
};

declare const enum INCarDefroster {

	Unknown = 0,

	Front = 1,

	Rear = 2,

	All = 3
}

declare class INCarDefrosterResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarDefrosterResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarDefrosterToConfirm(carDefrosterToConfirm: INCarDefroster): INCarDefrosterResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarDefroster): INCarDefrosterResolutionResult;

	static needsValue(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarDefrosterResolutionResult; // inherited from NSObject

	static notRequired(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarDefroster(resolvedCarDefroster: INCarDefroster): INCarDefrosterResolutionResult;

	static successWithResolvedValue(resolvedValue: INCarDefroster): INCarDefrosterResolutionResult;

	static unsupported(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult
}

interface INCarPlayDomainHandling extends INSaveProfileInCarIntentHandling, INSetAudioSourceInCarIntentHandling, INSetClimateSettingsInCarIntentHandling, INSetDefrosterSettingsInCarIntentHandling, INSetProfileInCarIntentHandling, INSetSeatSettingsInCarIntentHandling {
}
declare var INCarPlayDomainHandling: {

	prototype: INCarPlayDomainHandling;
};

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

declare class INCarSeatResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarSeatResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarSeatToConfirm(carSeatToConfirm: INCarSeat): INCarSeatResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarSeat): INCarSeatResolutionResult;

	static needsValue(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarSeatResolutionResult; // inherited from NSObject

	static notRequired(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarSeat(resolvedCarSeat: INCarSeat): INCarSeatResolutionResult;

	static successWithResolvedValue(resolvedValue: INCarSeat): INCarSeatResolutionResult;

	static unsupported(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INCarSignalOptions {

	Audible = 1,

	Visible = 2
}

declare class INCarSignalOptionsResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarSignalOptionsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCarSignalOptionsToConfirm(carSignalOptionsToConfirm: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	static needsValue(): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarSignalOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCarSignalOptions(resolvedCarSignalOptions: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	static successWithResolvedValue(resolvedValue: INCarSignalOptions): INCarSignalOptionsResolutionResult;

	static unsupported(): INCarSignalOptionsResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INConditionalOperator {

	All = 0,

	Any = 1,

	None = 2
}

declare class INCreateNoteIntent extends INIntent {

	static alloc(): INCreateNoteIntent; // inherited from NSObject

	static new(): INCreateNoteIntent; // inherited from NSObject

	readonly content: INNoteContent;

	readonly groupName: INSpeakableString;

	readonly title: INSpeakableString;

	constructor(o: { title: INSpeakableString; content: INNoteContent; groupName: INSpeakableString; });

	initWithTitleContentGroupName(title: INSpeakableString, content: INNoteContent, groupName: INSpeakableString): this;
}

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

declare class INCreateNoteIntentResponse extends INIntentResponse {

	static alloc(): INCreateNoteIntentResponse; // inherited from NSObject

	static new(): INCreateNoteIntentResponse; // inherited from NSObject

	readonly code: INCreateNoteIntentResponseCode;

	createdNote: INNote;

	constructor(o: { code: INCreateNoteIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCreateNoteIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INCreateNoteIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INCreateTaskListIntent extends INIntent {

	static alloc(): INCreateTaskListIntent; // inherited from NSObject

	static new(): INCreateTaskListIntent; // inherited from NSObject

	readonly groupName: INSpeakableString;

	readonly taskTitles: NSArray<INSpeakableString>;

	readonly title: INSpeakableString;

	constructor(o: { title: INSpeakableString; taskTitles: NSArray<INSpeakableString>; groupName: INSpeakableString; });

	initWithTitleTaskTitlesGroupName(title: INSpeakableString, taskTitles: NSArray<INSpeakableString>, groupName: INSpeakableString): this;
}

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

declare class INCreateTaskListIntentResponse extends INIntentResponse {

	static alloc(): INCreateTaskListIntentResponse; // inherited from NSObject

	static new(): INCreateTaskListIntentResponse; // inherited from NSObject

	readonly code: INCreateTaskListIntentResponseCode;

	createdTaskList: INTaskList;

	constructor(o: { code: INCreateTaskListIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INCreateTaskListIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INCreateTaskListIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INCurrencyAmount extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INCurrencyAmount; // inherited from NSObject

	static new(): INCurrencyAmount; // inherited from NSObject

	readonly amount: NSDecimalNumber;

	readonly currencyCode: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { amount: NSDecimalNumber; currencyCode: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithAmountCurrencyCode(amount: NSDecimalNumber, currencyCode: string): this;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class INCurrencyAmountResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCurrencyAmountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCurrencyAmountToConfirm(currencyAmountToConfirm: INCurrencyAmount): INCurrencyAmountResolutionResult;

	static disambiguationWithCurrencyAmountsToDisambiguate(currencyAmountsToDisambiguate: NSArray<INCurrencyAmount>): INCurrencyAmountResolutionResult;

	static needsValue(): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCurrencyAmountResolutionResult; // inherited from NSObject

	static notRequired(): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCurrencyAmount(resolvedCurrencyAmount: INCurrencyAmount): INCurrencyAmountResolutionResult;

	static unsupported(): INCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult
}

declare class INDateComponentsRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INDateComponentsRange; // inherited from NSObject

	static new(): INDateComponentsRange; // inherited from NSObject

	readonly endDateComponents: NSDateComponents;

	readonly recurrenceRule: INRecurrenceRule;

	readonly startDateComponents: NSDateComponents;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { EKRecurrenceRule: EKRecurrenceRule; });

	constructor(o: { startDateComponents: NSDateComponents; endDateComponents: NSDateComponents; });

	constructor(o: { startDateComponents: NSDateComponents; endDateComponents: NSDateComponents; recurrenceRule: INRecurrenceRule; });

	EKRecurrenceRule(): EKRecurrenceRule;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithEKRecurrenceRule(recurrenceRule: EKRecurrenceRule): this;

	initWithStartDateComponentsEndDateComponents(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents): this;

	initWithStartDateComponentsEndDateComponentsRecurrenceRule(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents, recurrenceRule: INRecurrenceRule): this;
}

declare class INDateComponentsRangeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INDateComponentsRangeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithDateComponentsRangeToConfirm(dateComponentsRangeToConfirm: INDateComponentsRange): INDateComponentsRangeResolutionResult;

	static disambiguationWithDateComponentsRangesToDisambiguate(dateComponentsRangesToDisambiguate: NSArray<INDateComponentsRange>): INDateComponentsRangeResolutionResult;

	static needsValue(): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDateComponentsRangeResolutionResult; // inherited from NSObject

	static notRequired(): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedDateComponentsRange(resolvedDateComponentsRange: INDateComponentsRange): INDateComponentsRangeResolutionResult;

	static unsupported(): INDateComponentsRangeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INDateComponentsResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INDateComponentsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithDateComponentsToConfirm(dateComponentsToConfirm: NSDateComponents): INDateComponentsResolutionResult;

	static disambiguationWithDateComponentsToDisambiguate(dateComponentsToDisambiguate: NSArray<NSDateComponents>): INDateComponentsResolutionResult;

	static needsValue(): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDateComponentsResolutionResult; // inherited from NSObject

	static notRequired(): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedDateComponents(resolvedDateComponents: NSDateComponents): INDateComponentsResolutionResult;

	static unsupported(): INDateComponentsResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INDateSearchType {

	Unknown = 0,

	ByDueDate = 1,

	ByModifiedDate = 2,

	ByCreatedDate = 3
}

declare class INDateSearchTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INDateSearchTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithDateSearchTypeToConfirm(dateSearchTypeToConfirm: INDateSearchType): INDateSearchTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INDateSearchType): INDateSearchTypeResolutionResult;

	static needsValue(): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDateSearchTypeResolutionResult; // inherited from NSObject

	static notRequired(): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedDateSearchType(resolvedDateSearchType: INDateSearchType): INDateSearchTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INDateSearchType): INDateSearchTypeResolutionResult;

	static unsupported(): INDateSearchTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INDoubleResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INDoubleResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INDoubleResolutionResult;

	static needsValue(): INDoubleResolutionResult; // inherited from INIntentResolutionResult

	static new(): INDoubleResolutionResult; // inherited from NSObject

	static notRequired(): INDoubleResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: number): INDoubleResolutionResult;

	static unsupported(): INDoubleResolutionResult; // inherited from INIntentResolutionResult
}

declare class INEndWorkoutIntent extends INIntent {

	static alloc(): INEndWorkoutIntent; // inherited from NSObject

	static new(): INEndWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

interface INEndWorkoutIntentHandling extends NSObjectProtocol {

	confirmEndWorkoutCompletion?(intent: INEndWorkoutIntent, completion: (p1: INEndWorkoutIntentResponse) => void): void;

	handleEndWorkoutCompletion(intent: INEndWorkoutIntent, completion: (p1: INEndWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForEndWorkoutWithCompletion?(intent: INEndWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INEndWorkoutIntentHandling: {

	prototype: INEndWorkoutIntentHandling;
};

declare var INEndWorkoutIntentIdentifier: string;

declare class INEndWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INEndWorkoutIntentResponse; // inherited from NSObject

	static new(): INEndWorkoutIntentResponse; // inherited from NSObject

	readonly code: INEndWorkoutIntentResponseCode;

	constructor(o: { code: INEndWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INEndWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INEndWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	Success = 6,

	HandleInApp = 7
}

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

declare class INGetAvailableRestaurantReservationBookingDefaultsIntent extends INIntent {

	static alloc(): INGetAvailableRestaurantReservationBookingDefaultsIntent; // inherited from NSObject

	static new(): INGetAvailableRestaurantReservationBookingDefaultsIntent; // inherited from NSObject

	restaurant: INRestaurant;

	constructor(o: { restaurant: INRestaurant; });

	initWithRestaurant(restaurant: INRestaurant): this;
}

interface INGetAvailableRestaurantReservationBookingDefaultsIntentHandling extends NSObjectProtocol {

	confirmGetAvailableRestaurantReservationBookingDefaultsCompletion?(intent: INGetAvailableRestaurantReservationBookingDefaultsIntent, completion: (p1: INGetAvailableRestaurantReservationBookingDefaultsIntentResponse) => void): void;

	handleGetAvailableRestaurantReservationBookingDefaultsCompletion(intent: INGetAvailableRestaurantReservationBookingDefaultsIntent, completion: (p1: INGetAvailableRestaurantReservationBookingDefaultsIntentResponse) => void): void;

	resolveRestaurantForGetAvailableRestaurantReservationBookingDefaultsWithCompletion?(intent: INGetAvailableRestaurantReservationBookingDefaultsIntent, completion: (p1: INRestaurantResolutionResult) => void): void;
}
declare var INGetAvailableRestaurantReservationBookingDefaultsIntentHandling: {

	prototype: INGetAvailableRestaurantReservationBookingDefaultsIntentHandling;
};

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

declare class INGetAvailableRestaurantReservationBookingsIntent extends INIntent implements NSCopying {

	static alloc(): INGetAvailableRestaurantReservationBookingsIntent; // inherited from NSObject

	static new(): INGetAvailableRestaurantReservationBookingsIntent; // inherited from NSObject

	earliestBookingDateForResults: Date;

	latestBookingDateForResults: Date;

	maximumNumberOfResults: number;

	partySize: number;

	preferredBookingDateComponents: NSDateComponents;

	restaurant: INRestaurant;

	constructor(o: { restaurant: INRestaurant; partySize: number; preferredBookingDateComponents: NSDateComponents; maximumNumberOfResults: number; earliestBookingDateForResults: Date; latestBookingDateForResults: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithRestaurantPartySizePreferredBookingDateComponentsMaximumNumberOfResultsEarliestBookingDateForResultsLatestBookingDateForResults(restaurant: INRestaurant, partySize: number, preferredBookingDateComponents: NSDateComponents, maximumNumberOfResults: number, earliestBookingDateForResults: Date, latestBookingDateForResults: Date): this;
}

declare const enum INGetAvailableRestaurantReservationBookingsIntentCode {

	Success = 0,

	Failure = 1,

	FailureRequestUnsatisfiable = 2,

	FailureRequestUnspecified = 3
}

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

declare class INGetAvailableRestaurantReservationBookingsIntentResponse extends INIntentResponse {

	static alloc(): INGetAvailableRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	static new(): INGetAvailableRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	readonly availableBookings: NSArray<INRestaurantReservationBooking>;

	readonly code: INGetAvailableRestaurantReservationBookingsIntentCode;

	localizedBookingAdvisementText: string;

	localizedRestaurantDescriptionText: string;

	termsAndConditions: INTermsAndConditions;

	constructor(o: { availableBookings: NSArray<INRestaurantReservationBooking>; code: INGetAvailableRestaurantReservationBookingsIntentCode; userActivity: NSUserActivity; });

	initWithAvailableBookingsCodeUserActivity(availableBookings: NSArray<INRestaurantReservationBooking>, code: INGetAvailableRestaurantReservationBookingsIntentCode, userActivity: NSUserActivity): this;
}

declare class INGetCarLockStatusIntent extends INIntent {

	static alloc(): INGetCarLockStatusIntent; // inherited from NSObject

	static new(): INGetCarLockStatusIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	constructor(o: { carName: INSpeakableString; });

	initWithCarName(carName: INSpeakableString): this;
}

interface INGetCarLockStatusIntentHandling extends NSObjectProtocol {

	confirmGetCarLockStatusCompletion?(intent: INGetCarLockStatusIntent, completion: (p1: INGetCarLockStatusIntentResponse) => void): void;

	handleGetCarLockStatusCompletion(intent: INGetCarLockStatusIntent, completion: (p1: INGetCarLockStatusIntentResponse) => void): void;

	resolveCarNameForGetCarLockStatusWithCompletion?(intent: INGetCarLockStatusIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INGetCarLockStatusIntentHandling: {

	prototype: INGetCarLockStatusIntentHandling;
};

declare class INGetCarLockStatusIntentResponse extends INIntentResponse {

	static alloc(): INGetCarLockStatusIntentResponse; // inherited from NSObject

	static new(): INGetCarLockStatusIntentResponse; // inherited from NSObject

	readonly code: INGetCarLockStatusIntentResponseCode;

	locked: number;

	constructor(o: { code: INGetCarLockStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetCarLockStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INGetCarLockStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INGetCarPowerLevelStatusIntent extends INIntent {

	static alloc(): INGetCarPowerLevelStatusIntent; // inherited from NSObject

	static new(): INGetCarPowerLevelStatusIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	constructor(o: { carName: INSpeakableString; });

	initWithCarName(carName: INSpeakableString): this;
}

interface INGetCarPowerLevelStatusIntentHandling extends NSObjectProtocol {

	confirmGetCarPowerLevelStatusCompletion?(intent: INGetCarPowerLevelStatusIntent, completion: (p1: INGetCarPowerLevelStatusIntentResponse) => void): void;

	handleGetCarPowerLevelStatusCompletion(intent: INGetCarPowerLevelStatusIntent, completion: (p1: INGetCarPowerLevelStatusIntentResponse) => void): void;

	resolveCarNameForGetCarPowerLevelStatusWithCompletion?(intent: INGetCarPowerLevelStatusIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INGetCarPowerLevelStatusIntentHandling: {

	prototype: INGetCarPowerLevelStatusIntentHandling;
};

declare class INGetCarPowerLevelStatusIntentResponse extends INIntentResponse {

	static alloc(): INGetCarPowerLevelStatusIntentResponse; // inherited from NSObject

	static new(): INGetCarPowerLevelStatusIntentResponse; // inherited from NSObject

	chargePercentRemaining: number;

	readonly code: INGetCarPowerLevelStatusIntentResponseCode;

	distanceRemaining: NSMeasurement<NSUnitLength>;

	fuelPercentRemaining: number;

	constructor(o: { code: INGetCarPowerLevelStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetCarPowerLevelStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INGetCarPowerLevelStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INGetRestaurantGuestIntent extends INIntent {

	static alloc(): INGetRestaurantGuestIntent; // inherited from NSObject

	static new(): INGetRestaurantGuestIntent; // inherited from NSObject
}

interface INGetRestaurantGuestIntentHandling extends NSObjectProtocol {

	confirmGetRestaurantGuestCompletion?(guestIntent: INGetRestaurantGuestIntent, completion: (p1: INGetRestaurantGuestIntentResponse) => void): void;

	handleGetRestaurantGuestCompletion(intent: INGetRestaurantGuestIntent, completion: (p1: INGetRestaurantGuestIntentResponse) => void): void;
}
declare var INGetRestaurantGuestIntentHandling: {

	prototype: INGetRestaurantGuestIntentHandling;
};

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

declare class INGetRideStatusIntent extends INIntent {

	static alloc(): INGetRideStatusIntent; // inherited from NSObject

	static new(): INGetRideStatusIntent; // inherited from NSObject
}

interface INGetRideStatusIntentHandling extends NSObjectProtocol {

	confirmGetRideStatusCompletion?(intent: INGetRideStatusIntent, completion: (p1: INGetRideStatusIntentResponse) => void): void;

	handleGetRideStatusCompletion(intent: INGetRideStatusIntent, completion: (p1: INGetRideStatusIntentResponse) => void): void;

	startSendingUpdatesForGetRideStatusToObserver(intent: INGetRideStatusIntent, observer: INGetRideStatusIntentResponseObserver): void;

	stopSendingUpdatesForGetRideStatus(intent: INGetRideStatusIntent): void;
}
declare var INGetRideStatusIntentHandling: {

	prototype: INGetRideStatusIntentHandling;
};

declare var INGetRideStatusIntentIdentifier: string;

declare class INGetRideStatusIntentResponse extends INIntentResponse {

	static alloc(): INGetRideStatusIntentResponse; // inherited from NSObject

	static new(): INGetRideStatusIntentResponse; // inherited from NSObject

	readonly code: INGetRideStatusIntentResponseCode;

	rideStatus: INRideStatus;

	constructor(o: { code: INGetRideStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetRideStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

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

interface INGetRideStatusIntentResponseObserver extends NSObjectProtocol {

	getRideStatusResponseDidUpdate(response: INGetRideStatusIntentResponse): void;
}
declare var INGetRideStatusIntentResponseObserver: {

	prototype: INGetRideStatusIntentResponseObserver;
};

declare class INGetUserCurrentRestaurantReservationBookingsIntent extends INIntent implements NSCopying {

	static alloc(): INGetUserCurrentRestaurantReservationBookingsIntent; // inherited from NSObject

	static new(): INGetUserCurrentRestaurantReservationBookingsIntent; // inherited from NSObject

	earliestBookingDateForResults: Date;

	maximumNumberOfResults: number;

	reservationIdentifier: string;

	restaurant: INRestaurant;

	constructor(o: { restaurant: INRestaurant; reservationIdentifier: string; maximumNumberOfResults: number; earliestBookingDateForResults: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithRestaurantReservationIdentifierMaximumNumberOfResultsEarliestBookingDateForResults(restaurant: INRestaurant, reservationIdentifier: string, maximumNumberOfResults: number, earliestBookingDateForResults: Date): this;
}

interface INGetUserCurrentRestaurantReservationBookingsIntentHandling extends NSObjectProtocol {

	confirmGetUserCurrentRestaurantReservationBookingsCompletion?(intent: INGetUserCurrentRestaurantReservationBookingsIntent, completion: (p1: INGetUserCurrentRestaurantReservationBookingsIntentResponse) => void): void;

	handleGetUserCurrentRestaurantReservationBookingsCompletion(intent: INGetUserCurrentRestaurantReservationBookingsIntent, completion: (p1: INGetUserCurrentRestaurantReservationBookingsIntentResponse) => void): void;

	resolveRestaurantForGetUserCurrentRestaurantReservationBookingsWithCompletion?(intent: INGetUserCurrentRestaurantReservationBookingsIntent, completion: (p1: INRestaurantResolutionResult) => void): void;
}
declare var INGetUserCurrentRestaurantReservationBookingsIntentHandling: {

	prototype: INGetUserCurrentRestaurantReservationBookingsIntentHandling;
};

declare class INGetUserCurrentRestaurantReservationBookingsIntentResponse extends INIntentResponse {

	static alloc(): INGetUserCurrentRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	static new(): INGetUserCurrentRestaurantReservationBookingsIntentResponse; // inherited from NSObject

	readonly code: INGetUserCurrentRestaurantReservationBookingsIntentResponseCode;

	userCurrentBookings: NSArray<INRestaurantReservationUserBooking>;

	constructor(o: { userCurrentBookings: NSArray<INRestaurantReservationUserBooking>; code: INGetUserCurrentRestaurantReservationBookingsIntentResponseCode; userActivity: NSUserActivity; });

	initWithUserCurrentBookingsCodeUserActivity(userCurrentBookings: NSArray<INRestaurantReservationUserBooking>, code: INGetUserCurrentRestaurantReservationBookingsIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INGetUserCurrentRestaurantReservationBookingsIntentResponseCode {

	Success = 0,

	Failure = 1,

	FailureRequestUnsatisfiable = 2,

	Unspecified = 3
}

declare class INGetVisualCodeIntent extends INIntent {

	static alloc(): INGetVisualCodeIntent; // inherited from NSObject

	static new(): INGetVisualCodeIntent; // inherited from NSObject

	readonly visualCodeType: INVisualCodeType;

	constructor(o: { visualCodeType: INVisualCodeType; });

	initWithVisualCodeType(visualCodeType: INVisualCodeType): this;
}

interface INGetVisualCodeIntentHandling extends NSObjectProtocol {

	confirmGetVisualCodeCompletion?(intent: INGetVisualCodeIntent, completion: (p1: INGetVisualCodeIntentResponse) => void): void;

	handleGetVisualCodeCompletion(intent: INGetVisualCodeIntent, completion: (p1: INGetVisualCodeIntentResponse) => void): void;

	resolveVisualCodeTypeForGetVisualCodeWithCompletion?(intent: INGetVisualCodeIntent, completion: (p1: INVisualCodeTypeResolutionResult) => void): void;
}
declare var INGetVisualCodeIntentHandling: {

	prototype: INGetVisualCodeIntentHandling;
};

declare class INGetVisualCodeIntentResponse extends INIntentResponse {

	static alloc(): INGetVisualCodeIntentResponse; // inherited from NSObject

	static new(): INGetVisualCodeIntentResponse; // inherited from NSObject

	readonly code: INGetVisualCodeIntentResponseCode;

	visualCodeImage: INImage;

	constructor(o: { code: INGetVisualCodeIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INGetVisualCodeIntentResponseCode, userActivity: NSUserActivity): this;
}

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

declare class INImage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INImage; // inherited from NSObject

	static imageNamed(name: string): INImage;

	static imageSizeForIntentResponse(response: INIntentResponse): CGSize;

	static imageWithCGImage(imageRef: any): INImage;

	static imageWithImageData(imageData: NSData): INImage;

	static imageWithUIImage(image: UIImage): INImage;

	static imageWithURL(URL: NSURL): INImage;

	static imageWithURLWidthHeight(URL: NSURL, width: number, height: number): INImage;

	static new(): INImage; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	fetchUIImageWithCompletion(completion: (p1: UIImage) => void): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class INImageNoteContent extends INNoteContent implements NSCopying, NSSecureCoding {

	static alloc(): INImageNoteContent; // inherited from NSObject

	static new(): INImageNoteContent; // inherited from NSObject

	readonly image: INImage;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { image: INImage; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithImage(image: INImage): this;
}

declare class INIntegerResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INIntegerResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: number): INIntegerResolutionResult;

	static needsValue(): INIntegerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INIntegerResolutionResult; // inherited from NSObject

	static notRequired(): INIntegerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: number): INIntegerResolutionResult;

	static unsupported(): INIntegerResolutionResult; // inherited from INIntentResolutionResult
}

declare class INIntent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INIntent; // inherited from NSObject

	static new(): INIntent; // inherited from NSObject

	readonly identifier: string;

	readonly intentDescription: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

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

	RequestTimedOut = 3001,

	InvalidUserVocabularyFileLocation = 4000,

	ExtensionLaunchingTimeout = 5000,

	ExtensionBringUpFailed = 5001
}

declare var INIntentErrorDomain: string;

interface INIntentHandlerProviding extends NSObjectProtocol {

	handlerForIntent(intent: INIntent): any;
}
declare var INIntentHandlerProviding: {

	prototype: INIntentHandlerProviding;
};

declare const enum INIntentHandlingStatus {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	DeferredToApplication = 5
}

declare class INIntentResolutionResult<ObjectType> extends NSObject {

	static alloc<ObjectType>(): INIntentResolutionResult<ObjectType>; // inherited from NSObject

	static needsValue<ObjectType>(): INIntentResolutionResult<ObjectType>;

	static new<ObjectType>(): INIntentResolutionResult<ObjectType>; // inherited from NSObject

	static notRequired<ObjectType>(): INIntentResolutionResult<ObjectType>;

	static unsupported<ObjectType>(): INIntentResolutionResult<ObjectType>;
}

declare class INIntentResponse extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INIntentResponse; // inherited from NSObject

	static new(): INIntentResponse; // inherited from NSObject

	readonly userActivity: NSUserActivity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class INInteraction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INInteraction; // inherited from NSObject

	static deleteAllInteractionsWithCompletion(completion: (p1: NSError) => void): void;

	static deleteInteractionsWithGroupIdentifierCompletion(groupIdentifier: string, completion: (p1: NSError) => void): void;

	static deleteInteractionsWithIdentifiersCompletion(identifiers: NSArray<string>, completion: (p1: NSError) => void): void;

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithIntentResponse(intent: INIntent, response: INIntentResponse): this;

	parameterValueForParameter(parameter: INParameter): any;
}

declare const enum INInteractionDirection {

	Unspecified = 0,

	Outgoing = 1,

	Incoming = 2
}

declare class INListRideOptionsIntent extends INIntent {

	static alloc(): INListRideOptionsIntent; // inherited from NSObject

	static new(): INListRideOptionsIntent; // inherited from NSObject

	readonly dropOffLocation: CLPlacemark;

	readonly pickupLocation: CLPlacemark;

	constructor(o: { pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; });

	initWithPickupLocationDropOffLocation(pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark): this;
}

interface INListRideOptionsIntentHandling extends NSObjectProtocol {

	confirmListRideOptionsCompletion?(intent: INListRideOptionsIntent, completion: (p1: INListRideOptionsIntentResponse) => void): void;

	handleListRideOptionsCompletion(intent: INListRideOptionsIntent, completion: (p1: INListRideOptionsIntentResponse) => void): void;

	resolveDropOffLocationForListRideOptionsWithCompletion?(intent: INListRideOptionsIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePickupLocationForListRideOptionsWithCompletion?(intent: INListRideOptionsIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;
}
declare var INListRideOptionsIntentHandling: {

	prototype: INListRideOptionsIntentHandling;
};

declare var INListRideOptionsIntentIdentifier: string;

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

declare const enum INLocationSearchType {

	Unknown = 0,

	ByLocationTrigger = 1
}

declare class INLocationSearchTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INLocationSearchTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithLocationSearchTypeToConfirm(locationSearchTypeToConfirm: INLocationSearchType): INLocationSearchTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INLocationSearchType): INLocationSearchTypeResolutionResult;

	static needsValue(): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INLocationSearchTypeResolutionResult; // inherited from NSObject

	static notRequired(): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedLocationSearchType(resolvedLocationSearchType: INLocationSearchType): INLocationSearchTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INLocationSearchType): INLocationSearchTypeResolutionResult;

	static unsupported(): INLocationSearchTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INMessage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMessage; // inherited from NSObject

	static new(): INMessage; // inherited from NSObject

	readonly content: string;

	readonly conversationIdentifier: string;

	readonly dateSent: Date;

	readonly groupName: INSpeakableString;

	readonly identifier: string;

	readonly messageType: INMessageType;

	readonly recipients: NSArray<INPerson>;

	readonly sender: INPerson;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson>; });

	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson>; groupName: INSpeakableString; messageType: INMessageType; });

	constructor(o: { identifier: string; conversationIdentifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson>; messageType: INMessageType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithIdentifierContentDateSentSenderRecipients(identifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson>): this;

	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsGroupNameMessageType(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson>, groupName: INSpeakableString, messageType: INMessageType): this;

	initWithIdentifierConversationIdentifierContentDateSentSenderRecipientsMessageType(identifier: string, conversationIdentifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson>, messageType: INMessageType): this;
}

declare const enum INMessageAttribute {

	Unknown = 0,

	Read = 1,

	Unread = 2,

	Flagged = 3,

	Unflagged = 4,

	Played = 5
}

declare const enum INMessageAttributeOptions {

	Read = 1,

	Unread = 2,

	Flagged = 4,

	Unflagged = 8,

	Played = 16
}

declare class INMessageAttributeOptionsResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INMessageAttributeOptionsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithMessageAttributeOptionsToConfirm(messageAttributeOptionsToConfirm: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static needsValue(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMessageAttributeOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMessageAttributeOptions(resolvedMessageAttributeOptions: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static successWithResolvedValue(resolvedValue: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static unsupported(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult
}

declare class INMessageAttributeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INMessageAttributeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithMessageAttributeToConfirm(messageAttributeToConfirm: INMessageAttribute): INMessageAttributeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INMessageAttribute): INMessageAttributeResolutionResult;

	static needsValue(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMessageAttributeResolutionResult; // inherited from NSObject

	static notRequired(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedMessageAttribute(resolvedMessageAttribute: INMessageAttribute): INMessageAttributeResolutionResult;

	static successWithResolvedValue(resolvedValue: INMessageAttribute): INMessageAttributeResolutionResult;

	static unsupported(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult
}

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

	MediaAudio = 18
}

interface INMessagesDomainHandling extends INSearchForMessagesIntentHandling, INSendMessageIntentHandling, INSetMessageAttributeIntentHandling {
}
declare var INMessagesDomainHandling: {

	prototype: INMessagesDomainHandling;
};

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

	constructor(o: { title: INSpeakableString; contents: NSArray<INNoteContent>; groupName: INSpeakableString; createdDateComponents: NSDateComponents; modifiedDateComponents: NSDateComponents; identifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithTitleContentsGroupNameCreatedDateComponentsModifiedDateComponentsIdentifier(title: INSpeakableString, contents: NSArray<INNoteContent>, groupName: INSpeakableString, createdDateComponents: NSDateComponents, modifiedDateComponents: NSDateComponents, identifier: string): this;
}

declare class INNoteContent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INNoteContent; // inherited from NSObject

	static new(): INNoteContent; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class INNoteContentResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INNoteContentResolutionResult; // inherited from NSObject

	static confirmationRequiredWithNoteContentToConfirm(noteContentToConfirm: INNoteContent): INNoteContentResolutionResult;

	static disambiguationWithNoteContentsToDisambiguate(noteContentsToDisambiguate: NSArray<INNoteContent>): INNoteContentResolutionResult;

	static needsValue(): INNoteContentResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNoteContentResolutionResult; // inherited from NSObject

	static notRequired(): INNoteContentResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNoteContent(resolvedNoteContent: INNoteContent): INNoteContentResolutionResult;

	static unsupported(): INNoteContentResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INNoteContentType {

	Unknown = 0,

	Text = 1,

	Image = 2
}

declare class INNoteContentTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INNoteContentTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithNoteContentTypeToConfirm(noteContentTypeToConfirm: INNoteContentType): INNoteContentTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INNoteContentType): INNoteContentTypeResolutionResult;

	static needsValue(): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNoteContentTypeResolutionResult; // inherited from NSObject

	static notRequired(): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNoteContentType(resolvedNoteContentType: INNoteContentType): INNoteContentTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INNoteContentType): INNoteContentTypeResolutionResult;

	static unsupported(): INNoteContentTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INNoteResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INNoteResolutionResult; // inherited from NSObject

	static confirmationRequiredWithNoteToConfirm(noteToConfirm: INNote): INNoteResolutionResult;

	static disambiguationWithNotesToDisambiguate(notesToDisambiguate: NSArray<INNote>): INNoteResolutionResult;

	static needsValue(): INNoteResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNoteResolutionResult; // inherited from NSObject

	static notRequired(): INNoteResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNote(resolvedNote: INNote): INNoteResolutionResult;

	static unsupported(): INNoteResolutionResult; // inherited from INIntentResolutionResult
}

interface INNotebookDomainHandling extends INAddTasksIntentHandling, INAppendToNoteIntentHandling, INCreateNoteIntentHandling, INCreateTaskListIntentHandling, INSearchForNotebookItemsIntentHandling, INSetTaskAttributeIntentHandling {
}
declare var INNotebookDomainHandling: {

	prototype: INNotebookDomainHandling;
};

declare const enum INNotebookItemType {

	Unknown = 0,

	Note = 1,

	TaskList = 2,

	Task = 3
}

declare class INNotebookItemTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INNotebookItemTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithNotebookItemTypeToConfirm(notebookItemTypeToConfirm: INNotebookItemType): INNotebookItemTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INNotebookItemType): INNotebookItemTypeResolutionResult;

	static disambiguationWithNotebookItemTypesToDisambiguate(notebookItemTypesToDisambiguate: NSArray<number>): INNotebookItemTypeResolutionResult;

	static disambiguationWithValuesToDisambiguate(valuesToDisambiguate: NSArray<number>): INNotebookItemTypeResolutionResult;

	static needsValue(): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INNotebookItemTypeResolutionResult; // inherited from NSObject

	static notRequired(): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedNotebookItemType(resolvedNotebookItemType: INNotebookItemType): INNotebookItemTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INNotebookItemType): INNotebookItemTypeResolutionResult;

	static unsupported(): INNotebookItemTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INParameter extends NSObject implements NSSecureCoding {

	static alloc(): INParameter; // inherited from NSObject

	static new(): INParameter; // inherited from NSObject

	static parameterForClassKeyPath(aClass: typeof NSObject, keyPath: string): INParameter;

	readonly parameterClass: typeof NSObject;

	readonly parameterKeyPath: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	indexForSubKeyPath(subKeyPath: string): number;

	initWithCoder(aDecoder: NSCoder): this;

	isEqualToParameter(parameter: INParameter): boolean;

	setIndexForSubKeyPath(index: number, subKeyPath: string): void;
}

declare class INPauseWorkoutIntent extends INIntent {

	static alloc(): INPauseWorkoutIntent; // inherited from NSObject

	static new(): INPauseWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

interface INPauseWorkoutIntentHandling extends NSObjectProtocol {

	confirmPauseWorkoutCompletion?(intent: INPauseWorkoutIntent, completion: (p1: INPauseWorkoutIntentResponse) => void): void;

	handlePauseWorkoutCompletion(intent: INPauseWorkoutIntent, completion: (p1: INPauseWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForPauseWorkoutWithCompletion?(intent: INPauseWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INPauseWorkoutIntentHandling: {

	prototype: INPauseWorkoutIntentHandling;
};

declare var INPauseWorkoutIntentIdentifier: string;

declare class INPauseWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INPauseWorkoutIntentResponse; // inherited from NSObject

	static new(): INPauseWorkoutIntentResponse; // inherited from NSObject

	readonly code: INPauseWorkoutIntentResponseCode;

	constructor(o: { code: INPauseWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INPauseWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INPauseWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	Success = 6,

	HandleInApp = 7
}

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

declare class INPaymentAccount extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPaymentAccount; // inherited from NSObject

	static new(): INPaymentAccount; // inherited from NSObject

	readonly accountNumber: string;

	readonly accountType: INAccountType;

	readonly balance: INBalanceAmount;

	readonly nickname: INSpeakableString;

	readonly organizationName: INSpeakableString;

	readonly secondaryBalance: INBalanceAmount;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nickname: INSpeakableString; number: string; accountType: INAccountType; organizationName: INSpeakableString; });

	constructor(o: { nickname: INSpeakableString; number: string; accountType: INAccountType; organizationName: INSpeakableString; balance: INBalanceAmount; secondaryBalance: INBalanceAmount; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithNicknameNumberAccountTypeOrganizationName(nickname: INSpeakableString, accountNumber: string, accountType: INAccountType, organizationName: INSpeakableString): this;

	initWithNicknameNumberAccountTypeOrganizationNameBalanceSecondaryBalance(nickname: INSpeakableString, accountNumber: string, accountType: INAccountType, organizationName: INSpeakableString, balance: INBalanceAmount, secondaryBalance: INBalanceAmount): this;
}

declare class INPaymentAccountResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INPaymentAccountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPaymentAccountToConfirm(paymentAccountToConfirm: INPaymentAccount): INPaymentAccountResolutionResult;

	static disambiguationWithPaymentAccountsToDisambiguate(paymentAccountsToDisambiguate: NSArray<INPaymentAccount>): INPaymentAccountResolutionResult;

	static needsValue(): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPaymentAccountResolutionResult; // inherited from NSObject

	static notRequired(): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPaymentAccount(resolvedPaymentAccount: INPaymentAccount): INPaymentAccountResolutionResult;

	static unsupported(): INPaymentAccountResolutionResult; // inherited from INIntentResolutionResult
}

declare class INPaymentAmount extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPaymentAmount; // inherited from NSObject

	static new(): INPaymentAmount; // inherited from NSObject

	readonly amount: INCurrencyAmount;

	readonly amountType: INAmountType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { amountType: INAmountType; amount: INCurrencyAmount; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithAmountTypeAmount(amountType: INAmountType, amount: INCurrencyAmount): this;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class INPaymentAmountResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INPaymentAmountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPaymentAmountToConfirm(paymentAmountToConfirm: INPaymentAmount): INPaymentAmountResolutionResult;

	static disambiguationWithPaymentAmountsToDisambiguate(paymentAmountsToDisambiguate: NSArray<INPaymentAmount>): INPaymentAmountResolutionResult;

	static needsValue(): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPaymentAmountResolutionResult; // inherited from NSObject

	static notRequired(): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPaymentAmount(resolvedPaymentAmount: INPaymentAmount): INPaymentAmountResolutionResult;

	static unsupported(): INPaymentAmountResolutionResult; // inherited from INIntentResolutionResult
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithTypeNameIdentificationHintIcon(type: INPaymentMethodType, name: string, identificationHint: string, icon: INImage): this;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithPayeePayerCurrencyAmountPaymentMethodNoteStatus(payee: INPerson, payer: INPerson, currencyAmount: INCurrencyAmount, paymentMethod: INPaymentMethod, note: string, status: INPaymentStatus): this;

	initWithPayeePayerCurrencyAmountPaymentMethodNoteStatusFeeAmount(payee: INPerson, payer: INPerson, currencyAmount: INCurrencyAmount, paymentMethod: INPaymentMethod, note: string, status: INPaymentStatus, feeAmount: INCurrencyAmount): this;
}

declare const enum INPaymentStatus {

	Unknown = 0,

	Pending = 1,

	Completed = 2,

	Canceled = 3,

	Failed = 4,

	Unpaid = 5
}

declare class INPaymentStatusResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INPaymentStatusResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPaymentStatusToConfirm(paymentStatusToConfirm: INPaymentStatus): INPaymentStatusResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INPaymentStatus): INPaymentStatusResolutionResult;

	static needsValue(): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPaymentStatusResolutionResult; // inherited from NSObject

	static notRequired(): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPaymentStatus(resolvedPaymentStatus: INPaymentStatus): INPaymentStatusResolutionResult;

	static successWithResolvedValue(resolvedValue: INPaymentStatus): INPaymentStatusResolutionResult;

	static unsupported(): INPaymentStatusResolutionResult; // inherited from INIntentResolutionResult
}

interface INPaymentsDomainHandling extends INRequestPaymentIntentHandling, INSendPaymentIntentHandling {
}
declare var INPaymentsDomainHandling: {

	prototype: INPaymentsDomainHandling;
};

declare class INPerson extends NSObject implements INSpeakable, NSCopying, NSSecureCoding {

	static alloc(): INPerson; // inherited from NSObject

	static new(): INPerson; // inherited from NSObject

	readonly aliases: NSArray<INPersonHandle>;

	readonly contactIdentifier: string;

	readonly customIdentifier: string;

	readonly displayName: string;

	readonly handle: string;

	readonly image: INImage;

	readonly isMe: boolean;

	readonly nameComponents: NSPersonNameComponents;

	readonly personHandle: INPersonHandle;

	readonly relationship: string;

	readonly siriMatches: NSArray<INPerson>;

	readonly suggestionType: INPersonSuggestionType;

	readonly alternativeSpeakableMatches: NSArray<INSpeakable>; // inherited from INSpeakable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly identifier: string; // inherited from INSpeakable

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly pronunciationHint: string; // inherited from INSpeakable

	readonly spokenPhrase: string; // inherited from INSpeakable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly vocabularyIdentifier: string; // inherited from INSpeakable

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { handle: string; displayName: string; contactIdentifier: string; });

	constructor(o: { handle: string; nameComponents: NSPersonNameComponents; contactIdentifier: string; });

	constructor(o: { handle: string; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; });

	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; });

	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; contactIdentifier: string; customIdentifier: string; aliases: NSArray<INPersonHandle>; suggestionType: INPersonSuggestionType; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithHandleDisplayNameContactIdentifier(handle: string, displayName: string, contactIdentifier: string): this;

	initWithHandleNameComponentsContactIdentifier(handle: string, nameComponents: NSPersonNameComponents, contactIdentifier: string): this;

	initWithHandleNameComponentsDisplayNameImageContactIdentifier(handle: string, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string): this;

	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifier(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string): this;

	initWithPersonHandleNameComponentsDisplayNameImageContactIdentifierCustomIdentifierAliasesSuggestionType(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, contactIdentifier: string, customIdentifier: string, aliases: NSArray<INPersonHandle>, suggestionType: INPersonSuggestionType): this;

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

declare class INPersonHandle extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INPersonHandle; // inherited from NSObject

	static new(): INPersonHandle; // inherited from NSObject

	readonly label: string;

	readonly type: INPersonHandleType;

	readonly value: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { value: string; type: INPersonHandleType; });

	constructor(o: { value: string; type: INPersonHandleType; label: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithValueType(value: string, type: INPersonHandleType): this;

	initWithValueTypeLabel(value: string, type: INPersonHandleType, label: string): this;
}

declare var INPersonHandleLabelHome: string;

declare var INPersonHandleLabelHomeFax: string;

declare var INPersonHandleLabelMain: string;

declare var INPersonHandleLabelMobile: string;

declare var INPersonHandleLabelOther: string;

declare var INPersonHandleLabelPager: string;

declare var INPersonHandleLabelWork: string;

declare var INPersonHandleLabelWorkFax: string;

declare var INPersonHandleLabeliPhone: string;

declare const enum INPersonHandleType {

	Unknown = 0,

	EmailAddress = 1,

	PhoneNumber = 2
}

declare var INPersonRelationshipAssistant: string;

declare var INPersonRelationshipBrother: string;

declare var INPersonRelationshipChild: string;

declare var INPersonRelationshipFather: string;

declare var INPersonRelationshipFriend: string;

declare var INPersonRelationshipManager: string;

declare var INPersonRelationshipMother: string;

declare var INPersonRelationshipParent: string;

declare var INPersonRelationshipPartner: string;

declare var INPersonRelationshipSister: string;

declare var INPersonRelationshipSpouse: string;

declare class INPersonResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INPersonResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INPersonResolutionResult;

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson>): INPersonResolutionResult;

	static needsValue(): INPersonResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPersonResolutionResult; // inherited from NSObject

	static notRequired(): INPersonResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INPersonResolutionResult;

	static unsupported(): INPersonResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INPersonSuggestionType {

	SocialProfile = 1,

	InstantMessageAddress = 2
}

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

	ProcessFilter = 8388608
}

interface INPhotosDomainHandling extends INSearchForPhotosIntentHandling, INStartPhotoPlaybackIntentHandling {
}
declare var INPhotosDomainHandling: {

	prototype: INPhotosDomainHandling;
};

declare class INPlacemarkResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INPlacemarkResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPlacemarkToConfirm(placemarkToConfirm: CLPlacemark): INPlacemarkResolutionResult;

	static disambiguationWithPlacemarksToDisambiguate(placemarksToDisambiguate: NSArray<CLPlacemark>): INPlacemarkResolutionResult;

	static needsValue(): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult

	static new(): INPlacemarkResolutionResult; // inherited from NSObject

	static notRequired(): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPlacemark(resolvedPlacemark: CLPlacemark): INPlacemarkResolutionResult;

	static unsupported(): INPlacemarkResolutionResult; // inherited from INIntentResolutionResult
}

declare class INPreferences extends NSObject {

	static alloc(): INPreferences; // inherited from NSObject

	static new(): INPreferences; // inherited from NSObject

	static requestSiriAuthorization(handler: (p1: INSiriAuthorizationStatus) => void): void;

	static siriAuthorizationStatus(): INSiriAuthorizationStatus;

	static siriLanguageCode(): string;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithMaximumPriceCurrencyCode(maximumPrice: NSDecimalNumber, currencyCode: string): this;

	initWithMinimumPriceCurrencyCode(minimumPrice: NSDecimalNumber, currencyCode: string): this;

	initWithPriceCurrencyCode(price: NSDecimalNumber, currencyCode: string): this;

	initWithRangeBetweenPriceAndPriceCurrencyCode(firstPrice: NSDecimalNumber, secondPrice: NSDecimalNumber, currencyCode: string): this;
}

interface INRadioDomainHandling extends INSetRadioStationIntentHandling {
}
declare var INRadioDomainHandling: {

	prototype: INRadioDomainHandling;
};

declare const enum INRadioType {

	Unknown = 0,

	AM = 1,

	FM = 2,

	HD = 3,

	Satellite = 4,

	DAB = 5
}

declare class INRadioTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INRadioTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithRadioTypeToConfirm(radioTypeToConfirm: INRadioType): INRadioTypeResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRadioType): INRadioTypeResolutionResult;

	static needsValue(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRadioTypeResolutionResult; // inherited from NSObject

	static notRequired(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRadioType(resolvedRadioType: INRadioType): INRadioTypeResolutionResult;

	static successWithResolvedValue(resolvedValue: INRadioType): INRadioTypeResolutionResult;

	static unsupported(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INRecurrenceFrequency {

	Unknown = 0,

	Minute = 1,

	Hourly = 2,

	Daily = 3,

	Weekly = 4,

	Monthly = 5,

	Yearly = 6
}

declare class INRecurrenceRule extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRecurrenceRule; // inherited from NSObject

	static new(): INRecurrenceRule; // inherited from NSObject

	readonly frequency: INRecurrenceFrequency;

	readonly interval: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { interval: number; frequency: INRecurrenceFrequency; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithIntervalFrequency(interval: number, frequency: INRecurrenceFrequency): this;
}

declare const enum INRelativeReference {

	Unknown = 0,

	Next = 1,

	Previous = 2
}

declare class INRelativeReferenceResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INRelativeReferenceResolutionResult; // inherited from NSObject

	static confirmationRequiredWithRelativeReferenceToConfirm(relativeReferenceToConfirm: INRelativeReference): INRelativeReferenceResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRelativeReference): INRelativeReferenceResolutionResult;

	static needsValue(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRelativeReferenceResolutionResult; // inherited from NSObject

	static notRequired(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRelativeReference(resolvedRelativeReference: INRelativeReference): INRelativeReferenceResolutionResult;

	static successWithResolvedValue(resolvedValue: INRelativeReference): INRelativeReferenceResolutionResult;

	static unsupported(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INRelativeSetting {

	Unknown = 0,

	Lowest = 1,

	Lower = 2,

	Higher = 3,

	Highest = 4
}

declare class INRelativeSettingResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INRelativeSettingResolutionResult; // inherited from NSObject

	static confirmationRequiredWithRelativeSettingToConfirm(relativeSettingToConfirm: INRelativeSetting): INRelativeSettingResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRelativeSetting): INRelativeSettingResolutionResult;

	static needsValue(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRelativeSettingResolutionResult; // inherited from NSObject

	static notRequired(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRelativeSetting(resolvedRelativeSetting: INRelativeSetting): INRelativeSettingResolutionResult;

	static successWithResolvedValue(resolvedValue: INRelativeSetting): INRelativeSettingResolutionResult;

	static unsupported(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult
}

declare class INRequestPaymentCurrencyAmountResolutionResult extends INCurrencyAmountResolutionResult {

	static alloc(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCurrencyAmountToConfirm(currencyAmountToConfirm: INCurrencyAmount): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static disambiguationWithCurrencyAmountsToDisambiguate(currencyAmountsToDisambiguate: NSArray<INCurrencyAmount>): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static needsValue(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static notRequired(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCurrencyAmount(resolvedCurrencyAmount: INCurrencyAmount): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static unsupported(): INRequestPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INRequestPaymentCurrencyAmountUnsupportedReason): INRequestPaymentCurrencyAmountResolutionResult;

	constructor(o: { currencyAmountResolutionResult: INCurrencyAmountResolutionResult; });

	initWithCurrencyAmountResolutionResult(currencyAmountResolutionResult: INCurrencyAmountResolutionResult): this;
}

declare const enum INRequestPaymentCurrencyAmountUnsupportedReason {

	PaymentsAmountBelowMinimum = 1,

	PaymentsAmountAboveMaximum = 2,

	PaymentsCurrencyUnsupported = 3
}

declare class INRequestPaymentIntent extends INIntent {

	static alloc(): INRequestPaymentIntent; // inherited from NSObject

	static new(): INRequestPaymentIntent; // inherited from NSObject

	readonly currencyAmount: INCurrencyAmount;

	readonly note: string;

	readonly payer: INPerson;

	constructor(o: { payer: INPerson; currencyAmount: INCurrencyAmount; note: string; });

	initWithPayerCurrencyAmountNote(payer: INPerson, currencyAmount: INCurrencyAmount, note: string): this;
}

interface INRequestPaymentIntentHandling extends NSObjectProtocol {

	confirmRequestPaymentCompletion?(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentIntentResponse) => void): void;

	handleRequestPaymentCompletion(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentIntentResponse) => void): void;

	resolveCurrencyAmountForRequestPaymentCompletion?(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentCurrencyAmountResolutionResult) => void): void;

	resolveCurrencyAmountForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INCurrencyAmountResolutionResult) => void): void;

	resolveNoteForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolvePayerForRequestPaymentCompletion?(intent: INRequestPaymentIntent, completion: (p1: INRequestPaymentPayerResolutionResult) => void): void;

	resolvePayerForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INPersonResolutionResult) => void): void;
}
declare var INRequestPaymentIntentHandling: {

	prototype: INRequestPaymentIntentHandling;
};

declare var INRequestPaymentIntentIdentifier: string;

declare class INRequestPaymentIntentResponse extends INIntentResponse {

	static alloc(): INRequestPaymentIntentResponse; // inherited from NSObject

	static new(): INRequestPaymentIntentResponse; // inherited from NSObject

	readonly code: INRequestPaymentIntentResponseCode;

	paymentRecord: INPaymentRecord;

	constructor(o: { code: INRequestPaymentIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INRequestPaymentIntentResponseCode, userActivity: NSUserActivity): this;
}

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

	FailureNotEligible = 11
}

declare class INRequestPaymentPayerResolutionResult extends INPersonResolutionResult {

	static alloc(): INRequestPaymentPayerResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INRequestPaymentPayerResolutionResult; // inherited from INPersonResolutionResult

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson>): INRequestPaymentPayerResolutionResult; // inherited from INPersonResolutionResult

	static needsValue(): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRequestPaymentPayerResolutionResult; // inherited from NSObject

	static notRequired(): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INRequestPaymentPayerResolutionResult; // inherited from INPersonResolutionResult

	static unsupported(): INRequestPaymentPayerResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INRequestPaymentPayerUnsupportedReason): INRequestPaymentPayerResolutionResult;

	constructor(o: { personResolutionResult: INPersonResolutionResult; });

	initWithPersonResolutionResult(personResolutionResult: INPersonResolutionResult): this;
}

declare const enum INRequestPaymentPayerUnsupportedReason {

	CredentialsUnverified = 1,

	NoAccount = 2
}

declare class INRequestRideIntent extends INIntent {

	static alloc(): INRequestRideIntent; // inherited from NSObject

	static new(): INRequestRideIntent; // inherited from NSObject

	readonly dropOffLocation: CLPlacemark;

	readonly partySize: number;

	readonly paymentMethod: INPaymentMethod;

	readonly pickupLocation: CLPlacemark;

	readonly rideOptionName: INSpeakableString;

	readonly scheduledPickupTime: INDateComponentsRange;

	constructor(o: { pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; rideOptionName: INSpeakableString; partySize: number; paymentMethod: INPaymentMethod; });

	constructor(o: { pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; rideOptionName: INSpeakableString; partySize: number; paymentMethod: INPaymentMethod; scheduledPickupTime: INDateComponentsRange; });

	initWithPickupLocationDropOffLocationRideOptionNamePartySizePaymentMethod(pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark, rideOptionName: INSpeakableString, partySize: number, paymentMethod: INPaymentMethod): this;

	initWithPickupLocationDropOffLocationRideOptionNamePartySizePaymentMethodScheduledPickupTime(pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark, rideOptionName: INSpeakableString, partySize: number, paymentMethod: INPaymentMethod, scheduledPickupTime: INDateComponentsRange): this;
}

interface INRequestRideIntentHandling extends NSObjectProtocol {

	confirmRequestRideCompletion?(intent: INRequestRideIntent, completion: (p1: INRequestRideIntentResponse) => void): void;

	handleRequestRideCompletion(intent: INRequestRideIntent, completion: (p1: INRequestRideIntentResponse) => void): void;

	resolveDropOffLocationForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePartySizeForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolvePickupLocationForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolveRideOptionNameForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveScheduledPickupTimeForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;
}
declare var INRequestRideIntentHandling: {

	prototype: INRequestRideIntentHandling;
};

declare var INRequestRideIntentIdentifier: string;

declare class INRequestRideIntentResponse extends INIntentResponse {

	static alloc(): INRequestRideIntentResponse; // inherited from NSObject

	static new(): INRequestRideIntentResponse; // inherited from NSObject

	readonly code: INRequestRideIntentResponseCode;

	rideStatus: INRideStatus;

	constructor(o: { code: INRequestRideIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INRequestRideIntentResponseCode, userActivity: NSUserActivity): this;
}

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

	FailureRequiringAppLaunchPreviousRideNeedsCompletion = 9
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithLocationNameVendorIdentifierRestaurantIdentifier(location: CLLocation, name: string, vendorIdentifier: string, restaurantIdentifier: string): this;
}

declare class INRestaurantGuest extends INPerson {

	static alloc(): INRestaurantGuest; // inherited from NSObject

	static new(): INRestaurantGuest; // inherited from NSObject

	emailAddress: string;

	phoneNumber: string;

	constructor(o: { nameComponents: NSPersonNameComponents; phoneNumber: string; emailAddress: string; });

	initWithNameComponentsPhoneNumberEmailAddress(nameComponents: NSPersonNameComponents, phoneNumber: string, emailAddress: string): this;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class INRestaurantGuestResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INRestaurantGuestResolutionResult; // inherited from NSObject

	static confirmationRequiredWithRestaurantGuestToConfirm(restaurantGuestToConfirm: INRestaurantGuest): INRestaurantGuestResolutionResult;

	static disambiguationWithRestaurantGuestsToDisambiguate(restaurantGuestsToDisambiguate: NSArray<INRestaurantGuest>): INRestaurantGuestResolutionResult;

	static needsValue(): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRestaurantGuestResolutionResult; // inherited from NSObject

	static notRequired(): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRestaurantGuest(resolvedRestaurantGuest: INRestaurantGuest): INRestaurantGuestResolutionResult;

	static unsupported(): INRestaurantGuestResolutionResult; // inherited from INIntentResolutionResult
}

declare class INRestaurantOffer extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRestaurantOffer; // inherited from NSObject

	static new(): INRestaurantOffer; // inherited from NSObject

	offerDetailText: string;

	offerIdentifier: string;

	offerTitleText: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithRestaurantBookingDatePartySizeBookingIdentifier(restaurant: INRestaurant, bookingDate: Date, partySize: number, bookingIdentifier: string): this;
}

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

declare class INRestaurantResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INRestaurantResolutionResult; // inherited from NSObject

	static confirmationRequiredWithRestaurantToConfirm(restaurantToConfirm: INRestaurant): INRestaurantResolutionResult;

	static disambiguationWithRestaurantsToDisambiguate(restaurantsToDisambiguate: NSArray<INRestaurant>): INRestaurantResolutionResult;

	static needsValue(): INRestaurantResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRestaurantResolutionResult; // inherited from NSObject

	static notRequired(): INRestaurantResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedRestaurant(resolvedRestaurant: INRestaurant): INRestaurantResolutionResult;

	static unsupported(): INRestaurantResolutionResult; // inherited from INIntentResolutionResult
}

declare class INResumeWorkoutIntent extends INIntent {

	static alloc(): INResumeWorkoutIntent; // inherited from NSObject

	static new(): INResumeWorkoutIntent; // inherited from NSObject

	readonly workoutName: INSpeakableString;

	constructor(o: { workoutName: INSpeakableString; });

	initWithWorkoutName(workoutName: INSpeakableString): this;
}

interface INResumeWorkoutIntentHandling extends NSObjectProtocol {

	confirmResumeWorkoutCompletion?(intent: INResumeWorkoutIntent, completion: (p1: INResumeWorkoutIntentResponse) => void): void;

	handleResumeWorkoutCompletion(intent: INResumeWorkoutIntent, completion: (p1: INResumeWorkoutIntentResponse) => void): void;

	resolveWorkoutNameForResumeWorkoutWithCompletion?(intent: INResumeWorkoutIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INResumeWorkoutIntentHandling: {

	prototype: INResumeWorkoutIntentHandling;
};

declare var INResumeWorkoutIntentIdentifier: string;

declare class INResumeWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INResumeWorkoutIntentResponse; // inherited from NSObject

	static new(): INResumeWorkoutIntentResponse; // inherited from NSObject

	readonly code: INResumeWorkoutIntentResponseCode;

	constructor(o: { code: INResumeWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INResumeWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INResumeWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureNoMatchingWorkout = 5,

	Success = 6,

	HandleInApp = 7
}

declare class INRideCompletionStatus extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRideCompletionStatus; // inherited from NSObject

	static canceledByService(): INRideCompletionStatus;

	static canceledByUser(): INRideCompletionStatus;

	static canceledMissedPickup(): INRideCompletionStatus;

	static completed(): INRideCompletionStatus;

	static completedWithOutstandingFeedbackType(feedbackType: INRideFeedbackTypeOptions): INRideCompletionStatus;

	static completedWithOutstandingPaymentAmount(outstandingPaymentAmount: INCurrencyAmount): INRideCompletionStatus;

	static completedWithSettledPaymentAmount(settledPaymentAmount: INCurrencyAmount): INRideCompletionStatus;

	static new(): INRideCompletionStatus; // inherited from NSObject

	readonly canceled: boolean;

	readonly completed: boolean;

	completionUserActivity: NSUserActivity;

	defaultTippingOptions: NSSet<INCurrencyAmount>;

	readonly feedbackType: INRideFeedbackTypeOptions;

	readonly missedPickup: boolean;

	readonly outstanding: boolean;

	readonly paymentAmount: INCurrencyAmount;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class INRideDriver extends INPerson implements NSCopying, NSSecureCoding {

	static alloc(): INRideDriver; // inherited from NSObject

	static new(): INRideDriver; // inherited from NSObject

	readonly phoneNumber: string;

	readonly rating: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { handle: string; displayName: string; image: INImage; rating: string; phoneNumber: string; });

	constructor(o: { handle: string; nameComponents: NSPersonNameComponents; image: INImage; rating: string; phoneNumber: string; });

	constructor(o: { personHandle: INPersonHandle; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; rating: string; phoneNumber: string; });

	constructor(o: { phoneNumber: string; nameComponents: NSPersonNameComponents; displayName: string; image: INImage; rating: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithHandleDisplayNameImageRatingPhoneNumber(handle: string, displayName: string, image: INImage, rating: string, phoneNumber: string): this;

	initWithHandleNameComponentsImageRatingPhoneNumber(handle: string, nameComponents: NSPersonNameComponents, image: INImage, rating: string, phoneNumber: string): this;

	initWithPersonHandleNameComponentsDisplayNameImageRatingPhoneNumber(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, rating: string, phoneNumber: string): this;

	initWithPhoneNumberNameComponentsDisplayNameImageRating(phoneNumber: string, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, rating: string): this;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithTitlePriceCurrencyCode(title: string, price: NSDecimalNumber, currencyCode: string): this;
}

declare const enum INRideFeedbackTypeOptions {

	Rate = 1,

	Tip = 2
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithNameEstimatedPickupDate(name: string, estimatedPickupDate: Date): this;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithPartySizeRangeSizeDescriptionPriceRange(partySizeRange: NSRange, sizeDescription: string, priceRange: INPriceRange): this;
}

declare const enum INRidePhase {

	Unknown = 0,

	Received = 1,

	Confirmed = 2,

	Ongoing = 3,

	Completed = 4,

	ApproachingPickup = 5,

	Pickup = 6
}

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

	scheduledPickupTime: INDateComponentsRange;

	userActivityForCancelingInApplication: NSUserActivity;

	vehicle: INRideVehicle;

	waypoints: NSArray<CLPlacemark>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

interface INRidesharingDomainHandling extends INGetRideStatusIntentHandling, INListRideOptionsIntentHandling, INRequestRideIntentHandling {
}
declare var INRidesharingDomainHandling: {

	prototype: INRidesharingDomainHandling;
};

declare class INSaveProfileInCarIntent extends INIntent {

	static alloc(): INSaveProfileInCarIntent; // inherited from NSObject

	static new(): INSaveProfileInCarIntent; // inherited from NSObject

	readonly profileLabel: string;

	readonly profileName: string;

	readonly profileNumber: number;

	constructor(o: { profileNumber: number; profileLabel: string; });

	constructor(o: { profileNumber: number; profileName: string; });

	initWithProfileNumberProfileLabel(profileNumber: number, profileLabel: string): this;

	initWithProfileNumberProfileName(profileNumber: number, profileName: string): this;
}

interface INSaveProfileInCarIntentHandling extends NSObjectProtocol {

	confirmSaveProfileInCarCompletion?(intent: INSaveProfileInCarIntent, completion: (p1: INSaveProfileInCarIntentResponse) => void): void;

	handleSaveProfileInCarCompletion(intent: INSaveProfileInCarIntent, completion: (p1: INSaveProfileInCarIntentResponse) => void): void;

	resolveProfileNameForSaveProfileInCarWithCompletion?(intent: INSaveProfileInCarIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveProfileNumberForSaveProfileInCarWithCompletion?(intent: INSaveProfileInCarIntent, completion: (p1: INIntegerResolutionResult) => void): void;
}
declare var INSaveProfileInCarIntentHandling: {

	prototype: INSaveProfileInCarIntentHandling;
};

declare var INSaveProfileInCarIntentIdentifier: string;

declare class INSaveProfileInCarIntentResponse extends INIntentResponse {

	static alloc(): INSaveProfileInCarIntentResponse; // inherited from NSObject

	static new(): INSaveProfileInCarIntentResponse; // inherited from NSObject

	readonly code: INSaveProfileInCarIntentResponseCode;

	constructor(o: { code: INSaveProfileInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSaveProfileInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSaveProfileInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INSearchCallHistoryIntent extends INIntent {

	static alloc(): INSearchCallHistoryIntent; // inherited from NSObject

	static new(): INSearchCallHistoryIntent; // inherited from NSObject

	readonly callCapabilities: INCallCapabilityOptions;

	readonly callType: INCallRecordType;

	readonly callTypes: INCallRecordTypeOptions;

	readonly dateCreated: INDateComponentsRange;

	readonly recipient: INPerson;

	readonly unseen: number;

	constructor(o: { callType: INCallRecordType; dateCreated: INDateComponentsRange; recipient: INPerson; callCapabilities: INCallCapabilityOptions; });

	constructor(o: { dateCreated: INDateComponentsRange; recipient: INPerson; callCapabilities: INCallCapabilityOptions; callTypes: INCallRecordTypeOptions; unseen: number; });

	initWithCallTypeDateCreatedRecipientCallCapabilities(callType: INCallRecordType, dateCreated: INDateComponentsRange, recipient: INPerson, callCapabilities: INCallCapabilityOptions): this;

	initWithDateCreatedRecipientCallCapabilitiesCallTypesUnseen(dateCreated: INDateComponentsRange, recipient: INPerson, callCapabilities: INCallCapabilityOptions, callTypes: INCallRecordTypeOptions, unseen: number): this;
}

interface INSearchCallHistoryIntentHandling extends NSObjectProtocol {

	confirmSearchCallHistoryCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INSearchCallHistoryIntentResponse) => void): void;

	handleSearchCallHistoryCompletion(intent: INSearchCallHistoryIntent, completion: (p1: INSearchCallHistoryIntentResponse) => void): void;

	resolveCallTypeForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INCallRecordTypeResolutionResult) => void): void;

	resolveCallTypesForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INCallRecordTypeOptionsResolutionResult) => void): void;

	resolveDateCreatedForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveRecipientForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INPersonResolutionResult) => void): void;

	resolveUnseenForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INBooleanResolutionResult) => void): void;
}
declare var INSearchCallHistoryIntentHandling: {

	prototype: INSearchCallHistoryIntentHandling;
};

declare var INSearchCallHistoryIntentIdentifier: string;

declare class INSearchCallHistoryIntentResponse extends INIntentResponse {

	static alloc(): INSearchCallHistoryIntentResponse; // inherited from NSObject

	static new(): INSearchCallHistoryIntentResponse; // inherited from NSObject

	callRecords: NSArray<INCallRecord>;

	readonly code: INSearchCallHistoryIntentResponseCode;

	constructor(o: { code: INSearchCallHistoryIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchCallHistoryIntentResponseCode, userActivity: NSUserActivity): this;
}

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

declare class INSearchForAccountsIntentResponse extends INIntentResponse {

	static alloc(): INSearchForAccountsIntentResponse; // inherited from NSObject

	static new(): INSearchForAccountsIntentResponse; // inherited from NSObject

	accounts: NSArray<INPaymentAccount>;

	readonly code: INSearchForAccountsIntentResponseCode;

	constructor(o: { code: INSearchForAccountsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForAccountsIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSearchForAccountsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureCredentialsUnverified = 6,

	FailureAccountNotFound = 7
}

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

declare class INSearchForBillsIntentResponse extends INIntentResponse {

	static alloc(): INSearchForBillsIntentResponse; // inherited from NSObject

	static new(): INSearchForBillsIntentResponse; // inherited from NSObject

	bills: NSArray<INBillDetails>;

	readonly code: INSearchForBillsIntentResponseCode;

	constructor(o: { code: INSearchForBillsIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForBillsIntentResponseCode, userActivity: NSUserActivity): this;
}

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

declare class INSearchForMessagesIntent extends INIntent {

	static alloc(): INSearchForMessagesIntent; // inherited from NSObject

	static new(): INSearchForMessagesIntent; // inherited from NSObject

	readonly attributes: INMessageAttributeOptions;

	readonly dateTimeRange: INDateComponentsRange;

	readonly groupNames: NSArray<string>;

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

	readonly speakableGroupNames: NSArray<INSpeakableString>;

	readonly speakableGroupNamesOperator: INConditionalOperator;

	constructor(o: { recipients: NSArray<INPerson>; senders: NSArray<INPerson>; searchTerms: NSArray<string>; attributes: INMessageAttributeOptions; dateTimeRange: INDateComponentsRange; identifiers: NSArray<string>; notificationIdentifiers: NSArray<string>; groupNames: NSArray<string>; });

	constructor(o: { recipients: NSArray<INPerson>; senders: NSArray<INPerson>; searchTerms: NSArray<string>; attributes: INMessageAttributeOptions; dateTimeRange: INDateComponentsRange; identifiers: NSArray<string>; notificationIdentifiers: NSArray<string>; speakableGroupNames: NSArray<INSpeakableString>; });

	initWithRecipientsSendersSearchTermsAttributesDateTimeRangeIdentifiersNotificationIdentifiersGroupNames(recipients: NSArray<INPerson>, senders: NSArray<INPerson>, searchTerms: NSArray<string>, attributes: INMessageAttributeOptions, dateTimeRange: INDateComponentsRange, identifiers: NSArray<string>, notificationIdentifiers: NSArray<string>, groupNames: NSArray<string>): this;

	initWithRecipientsSendersSearchTermsAttributesDateTimeRangeIdentifiersNotificationIdentifiersSpeakableGroupNames(recipients: NSArray<INPerson>, senders: NSArray<INPerson>, searchTerms: NSArray<string>, attributes: INMessageAttributeOptions, dateTimeRange: INDateComponentsRange, identifiers: NSArray<string>, notificationIdentifiers: NSArray<string>, speakableGroupNames: NSArray<INSpeakableString>): this;
}

interface INSearchForMessagesIntentHandling extends NSObjectProtocol {

	confirmSearchForMessagesCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INSearchForMessagesIntentResponse) => void): void;

	handleSearchForMessagesCompletion(intent: INSearchForMessagesIntent, completion: (p1: INSearchForMessagesIntentResponse) => void): void;

	resolveAttributesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INMessageAttributeOptionsResolutionResult) => void): void;

	resolveDateTimeRangeForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveGroupNamesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INStringResolutionResult>) => void): void;

	resolveRecipientsForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	resolveSendersForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	resolveSpeakableGroupNamesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INSpeakableStringResolutionResult>) => void): void;
}
declare var INSearchForMessagesIntentHandling: {

	prototype: INSearchForMessagesIntentHandling;
};

declare var INSearchForMessagesIntentIdentifier: string;

declare class INSearchForMessagesIntentResponse extends INIntentResponse {

	static alloc(): INSearchForMessagesIntentResponse; // inherited from NSObject

	static new(): INSearchForMessagesIntentResponse; // inherited from NSObject

	readonly code: INSearchForMessagesIntentResponseCode;

	messages: NSArray<INMessage>;

	constructor(o: { code: INSearchForMessagesIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForMessagesIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSearchForMessagesIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureMessageServiceNotAvailable = 6,

	FailureMessageTooManyResults = 7
}

declare class INSearchForNotebookItemsIntent extends INIntent {

	static alloc(): INSearchForNotebookItemsIntent; // inherited from NSObject

	static new(): INSearchForNotebookItemsIntent; // inherited from NSObject

	readonly content: string;

	readonly dateSearchType: INDateSearchType;

	readonly dateTime: INDateComponentsRange;

	readonly itemType: INNotebookItemType;

	readonly location: CLPlacemark;

	readonly locationSearchType: INLocationSearchType;

	readonly status: INTaskStatus;

	readonly title: INSpeakableString;

	constructor(o: { title: INSpeakableString; content: string; itemType: INNotebookItemType; status: INTaskStatus; location: CLPlacemark; locationSearchType: INLocationSearchType; dateTime: INDateComponentsRange; dateSearchType: INDateSearchType; });

	initWithTitleContentItemTypeStatusLocationLocationSearchTypeDateTimeDateSearchType(title: INSpeakableString, content: string, itemType: INNotebookItemType, status: INTaskStatus, location: CLPlacemark, locationSearchType: INLocationSearchType, dateTime: INDateComponentsRange, dateSearchType: INDateSearchType): this;
}

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

	resolveTitleForSearchForNotebookItemsWithCompletion?(intent: INSearchForNotebookItemsIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INSearchForNotebookItemsIntentHandling: {

	prototype: INSearchForNotebookItemsIntentHandling;
};

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

declare const enum INSearchForNotebookItemsIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

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

	constructor(o: { dateCreated: INDateComponentsRange; locationCreated: CLPlacemark; albumName: string; searchTerms: NSArray<string>; includedAttributes: INPhotoAttributeOptions; excludedAttributes: INPhotoAttributeOptions; peopleInPhoto: NSArray<INPerson>; });

	initWithDateCreatedLocationCreatedAlbumNameSearchTermsIncludedAttributesExcludedAttributesPeopleInPhoto(dateCreated: INDateComponentsRange, locationCreated: CLPlacemark, albumName: string, searchTerms: NSArray<string>, includedAttributes: INPhotoAttributeOptions, excludedAttributes: INPhotoAttributeOptions, peopleInPhoto: NSArray<INPerson>): this;
}

interface INSearchForPhotosIntentHandling extends NSObjectProtocol {

	confirmSearchForPhotosCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INSearchForPhotosIntentResponse) => void): void;

	handleSearchForPhotosCompletion(intent: INSearchForPhotosIntent, completion: (p1: INSearchForPhotosIntentResponse) => void): void;

	resolveAlbumNameForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveDateCreatedForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveLocationCreatedForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePeopleInPhotoForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	resolveSearchTermsForSearchForPhotosWithCompletion?(intent: INSearchForPhotosIntent, completion: (p1: NSArray<INStringResolutionResult>) => void): void;
}
declare var INSearchForPhotosIntentHandling: {

	prototype: INSearchForPhotosIntentHandling;
};

declare var INSearchForPhotosIntentIdentifier: string;

declare class INSearchForPhotosIntentResponse extends INIntentResponse {

	static alloc(): INSearchForPhotosIntentResponse; // inherited from NSObject

	static new(): INSearchForPhotosIntentResponse; // inherited from NSObject

	readonly code: INSearchForPhotosIntentResponseCode;

	searchResultsCount: number;

	constructor(o: { code: INSearchForPhotosIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchForPhotosIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSearchForPhotosIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureAppConfigurationRequired = 5
}

declare class INSendMessageIntent extends INIntent {

	static alloc(): INSendMessageIntent; // inherited from NSObject

	static new(): INSendMessageIntent; // inherited from NSObject

	readonly content: string;

	readonly conversationIdentifier: string;

	readonly groupName: string;

	readonly recipients: NSArray<INPerson>;

	readonly sender: INPerson;

	readonly serviceName: string;

	readonly speakableGroupName: INSpeakableString;

	constructor(o: { recipients: NSArray<INPerson>; content: string; groupName: string; serviceName: string; sender: INPerson; });

	constructor(o: { recipients: NSArray<INPerson>; content: string; speakableGroupName: INSpeakableString; conversationIdentifier: string; serviceName: string; sender: INPerson; });

	initWithRecipientsContentGroupNameServiceNameSender(recipients: NSArray<INPerson>, content: string, groupName: string, serviceName: string, sender: INPerson): this;

	initWithRecipientsContentSpeakableGroupNameConversationIdentifierServiceNameSender(recipients: NSArray<INPerson>, content: string, speakableGroupName: INSpeakableString, conversationIdentifier: string, serviceName: string, sender: INPerson): this;
}

interface INSendMessageIntentHandling extends NSObjectProtocol {

	confirmSendMessageCompletion?(intent: INSendMessageIntent, completion: (p1: INSendMessageIntentResponse) => void): void;

	handleSendMessageCompletion(intent: INSendMessageIntent, completion: (p1: INSendMessageIntentResponse) => void): void;

	resolveContentForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveGroupNameForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveRecipientsForSendMessageCompletion?(intent: INSendMessageIntent, completion: (p1: NSArray<INSendMessageRecipientResolutionResult>) => void): void;

	resolveRecipientsForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	resolveSpeakableGroupNameForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
}
declare var INSendMessageIntentHandling: {

	prototype: INSendMessageIntentHandling;
};

declare var INSendMessageIntentIdentifier: string;

declare class INSendMessageIntentResponse extends INIntentResponse {

	static alloc(): INSendMessageIntentResponse; // inherited from NSObject

	static new(): INSendMessageIntentResponse; // inherited from NSObject

	readonly code: INSendMessageIntentResponseCode;

	sentMessage: INMessage;

	constructor(o: { code: INSendMessageIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSendMessageIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSendMessageIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureMessageServiceNotAvailable = 6
}

declare class INSendMessageRecipientResolutionResult extends INPersonResolutionResult {

	static alloc(): INSendMessageRecipientResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INSendMessageRecipientResolutionResult; // inherited from INPersonResolutionResult

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson>): INSendMessageRecipientResolutionResult; // inherited from INPersonResolutionResult

	static needsValue(): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSendMessageRecipientResolutionResult; // inherited from NSObject

	static notRequired(): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INSendMessageRecipientResolutionResult; // inherited from INPersonResolutionResult

	static unsupported(): INSendMessageRecipientResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSendMessageRecipientUnsupportedReason): INSendMessageRecipientResolutionResult;

	constructor(o: { personResolutionResult: INPersonResolutionResult; });

	initWithPersonResolutionResult(personResolutionResult: INPersonResolutionResult): this;
}

declare const enum INSendMessageRecipientUnsupportedReason {

	NoAccount = 1,

	Offline = 2,

	MessagingServiceNotEnabledForRecipient = 3
}

declare class INSendPaymentCurrencyAmountResolutionResult extends INCurrencyAmountResolutionResult {

	static alloc(): INSendPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static confirmationRequiredWithCurrencyAmountToConfirm(currencyAmountToConfirm: INCurrencyAmount): INSendPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static disambiguationWithCurrencyAmountsToDisambiguate(currencyAmountsToDisambiguate: NSArray<INCurrencyAmount>): INSendPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static needsValue(): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSendPaymentCurrencyAmountResolutionResult; // inherited from NSObject

	static notRequired(): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedCurrencyAmount(resolvedCurrencyAmount: INCurrencyAmount): INSendPaymentCurrencyAmountResolutionResult; // inherited from INCurrencyAmountResolutionResult

	static unsupported(): INSendPaymentCurrencyAmountResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSendPaymentCurrencyAmountUnsupportedReason): INSendPaymentCurrencyAmountResolutionResult;

	constructor(o: { currencyAmountResolutionResult: INCurrencyAmountResolutionResult; });

	initWithCurrencyAmountResolutionResult(currencyAmountResolutionResult: INCurrencyAmountResolutionResult): this;
}

declare const enum INSendPaymentCurrencyAmountUnsupportedReason {

	PaymentsAmountBelowMinimum = 1,

	PaymentsAmountAboveMaximum = 2,

	PaymentsCurrencyUnsupported = 3
}

declare class INSendPaymentIntent extends INIntent {

	static alloc(): INSendPaymentIntent; // inherited from NSObject

	static new(): INSendPaymentIntent; // inherited from NSObject

	readonly currencyAmount: INCurrencyAmount;

	readonly note: string;

	readonly payee: INPerson;

	constructor(o: { payee: INPerson; currencyAmount: INCurrencyAmount; note: string; });

	initWithPayeeCurrencyAmountNote(payee: INPerson, currencyAmount: INCurrencyAmount, note: string): this;
}

interface INSendPaymentIntentHandling extends NSObjectProtocol {

	confirmSendPaymentCompletion?(intent: INSendPaymentIntent, completion: (p1: INSendPaymentIntentResponse) => void): void;

	handleSendPaymentCompletion(intent: INSendPaymentIntent, completion: (p1: INSendPaymentIntentResponse) => void): void;

	resolveCurrencyAmountForSendPaymentCompletion?(intent: INSendPaymentIntent, completion: (p1: INSendPaymentCurrencyAmountResolutionResult) => void): void;

	resolveCurrencyAmountForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INCurrencyAmountResolutionResult) => void): void;

	resolveNoteForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolvePayeeForSendPaymentCompletion?(intent: INSendPaymentIntent, completion: (p1: INSendPaymentPayeeResolutionResult) => void): void;

	resolvePayeeForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INPersonResolutionResult) => void): void;
}
declare var INSendPaymentIntentHandling: {

	prototype: INSendPaymentIntentHandling;
};

declare var INSendPaymentIntentIdentifier: string;

declare class INSendPaymentIntentResponse extends INIntentResponse {

	static alloc(): INSendPaymentIntentResponse; // inherited from NSObject

	static new(): INSendPaymentIntentResponse; // inherited from NSObject

	readonly code: INSendPaymentIntentResponseCode;

	paymentRecord: INPaymentRecord;

	constructor(o: { code: INSendPaymentIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSendPaymentIntentResponseCode, userActivity: NSUserActivity): this;
}

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

	FailureNotEligible = 12
}

declare class INSendPaymentPayeeResolutionResult extends INPersonResolutionResult {

	static alloc(): INSendPaymentPayeeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithPersonToConfirm(personToConfirm: INPerson): INSendPaymentPayeeResolutionResult; // inherited from INPersonResolutionResult

	static disambiguationWithPeopleToDisambiguate(peopleToDisambiguate: NSArray<INPerson>): INSendPaymentPayeeResolutionResult; // inherited from INPersonResolutionResult

	static needsValue(): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSendPaymentPayeeResolutionResult; // inherited from NSObject

	static notRequired(): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedPerson(resolvedPerson: INPerson): INSendPaymentPayeeResolutionResult; // inherited from INPersonResolutionResult

	static unsupported(): INSendPaymentPayeeResolutionResult; // inherited from INIntentResolutionResult

	static unsupportedForReason(reason: INSendPaymentPayeeUnsupportedReason): INSendPaymentPayeeResolutionResult;

	constructor(o: { personResolutionResult: INPersonResolutionResult; });

	initWithPersonResolutionResult(personResolutionResult: INPersonResolutionResult): this;
}

declare const enum INSendPaymentPayeeUnsupportedReason {

	CredentialsUnverified = 1,

	InsufficientFunds = 2,

	NoAccount = 3
}

declare class INSendRideFeedbackIntent extends INIntent {

	static alloc(): INSendRideFeedbackIntent; // inherited from NSObject

	static new(): INSendRideFeedbackIntent; // inherited from NSObject

	rating: number;

	readonly rideIdentifier: string;

	tip: INCurrencyAmount;

	constructor(o: { rideIdentifier: string; });

	initWithRideIdentifier(rideIdentifier: string): this;
}

interface INSendRideFeedbackIntentHandling extends NSObjectProtocol {

	confirmSendRideFeedbackCompletion?(sendRideFeedbackIntent: INSendRideFeedbackIntent, completion: (p1: INSendRideFeedbackIntentResponse) => void): void;

	handleSendRideFeedbackCompletion(sendRideFeedbackintent: INSendRideFeedbackIntent, completion: (p1: INSendRideFeedbackIntentResponse) => void): void;
}
declare var INSendRideFeedbackIntentHandling: {

	prototype: INSendRideFeedbackIntentHandling;
};

declare class INSendRideFeedbackIntentResponse extends INIntentResponse {

	static alloc(): INSendRideFeedbackIntentResponse; // inherited from NSObject

	static new(): INSendRideFeedbackIntentResponse; // inherited from NSObject

	readonly code: INSendRideFeedbackIntentResponseCode;

	constructor(o: { code: INSendRideFeedbackIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSendRideFeedbackIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSendRideFeedbackIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	Success = 2,

	Failure = 3
}

declare class INSetAudioSourceInCarIntent extends INIntent {

	static alloc(): INSetAudioSourceInCarIntent; // inherited from NSObject

	static new(): INSetAudioSourceInCarIntent; // inherited from NSObject

	readonly audioSource: INCarAudioSource;

	readonly relativeAudioSourceReference: INRelativeReference;

	constructor(o: { audioSource: INCarAudioSource; relativeAudioSourceReference: INRelativeReference; });

	initWithAudioSourceRelativeAudioSourceReference(audioSource: INCarAudioSource, relativeAudioSourceReference: INRelativeReference): this;
}

interface INSetAudioSourceInCarIntentHandling extends NSObjectProtocol {

	confirmSetAudioSourceInCarCompletion?(intent: INSetAudioSourceInCarIntent, completion: (p1: INSetAudioSourceInCarIntentResponse) => void): void;

	handleSetAudioSourceInCarCompletion(intent: INSetAudioSourceInCarIntent, completion: (p1: INSetAudioSourceInCarIntentResponse) => void): void;

	resolveAudioSourceForSetAudioSourceInCarWithCompletion?(intent: INSetAudioSourceInCarIntent, completion: (p1: INCarAudioSourceResolutionResult) => void): void;

	resolveRelativeAudioSourceReferenceForSetAudioSourceInCarWithCompletion?(intent: INSetAudioSourceInCarIntent, completion: (p1: INRelativeReferenceResolutionResult) => void): void;
}
declare var INSetAudioSourceInCarIntentHandling: {

	prototype: INSetAudioSourceInCarIntentHandling;
};

declare var INSetAudioSourceInCarIntentIdentifier: string;

declare class INSetAudioSourceInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetAudioSourceInCarIntentResponse; // inherited from NSObject

	static new(): INSetAudioSourceInCarIntentResponse; // inherited from NSObject

	readonly code: INSetAudioSourceInCarIntentResponseCode;

	constructor(o: { code: INSetAudioSourceInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetAudioSourceInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetAudioSourceInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INSetCarLockStatusIntent extends INIntent {

	static alloc(): INSetCarLockStatusIntent; // inherited from NSObject

	static new(): INSetCarLockStatusIntent; // inherited from NSObject

	readonly carName: INSpeakableString;

	readonly locked: number;

	constructor(o: { locked: number; carName: INSpeakableString; });

	initWithLockedCarName(locked: number, carName: INSpeakableString): this;
}

interface INSetCarLockStatusIntentHandling extends NSObjectProtocol {

	confirmSetCarLockStatusCompletion?(intent: INSetCarLockStatusIntent, completion: (p1: INSetCarLockStatusIntentResponse) => void): void;

	handleSetCarLockStatusCompletion(intent: INSetCarLockStatusIntent, completion: (p1: INSetCarLockStatusIntentResponse) => void): void;

	resolveCarNameForSetCarLockStatusWithCompletion?(intent: INSetCarLockStatusIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;

	resolveLockedForSetCarLockStatusWithCompletion?(intent: INSetCarLockStatusIntent, completion: (p1: INBooleanResolutionResult) => void): void;
}
declare var INSetCarLockStatusIntentHandling: {

	prototype: INSetCarLockStatusIntentHandling;
};

declare class INSetCarLockStatusIntentResponse extends INIntentResponse {

	static alloc(): INSetCarLockStatusIntentResponse; // inherited from NSObject

	static new(): INSetCarLockStatusIntentResponse; // inherited from NSObject

	readonly code: INSetCarLockStatusIntentResponseCode;

	constructor(o: { code: INSetCarLockStatusIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetCarLockStatusIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetCarLockStatusIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INSetClimateSettingsInCarIntent extends INIntent {

	static alloc(): INSetClimateSettingsInCarIntent; // inherited from NSObject

	static new(): INSetClimateSettingsInCarIntent; // inherited from NSObject

	readonly airCirculationMode: INCarAirCirculationMode;

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

	constructor(o: { enableFan: number; enableAirConditioner: number; enableClimateControl: number; enableAutoMode: number; airCirculationMode: INCarAirCirculationMode; fanSpeedIndex: number; fanSpeedPercentage: number; relativeFanSpeedSetting: INRelativeSetting; temperature: NSMeasurement<NSUnitTemperature>; relativeTemperatureSetting: INRelativeSetting; climateZone: INCarSeat; });

	initWithEnableFanEnableAirConditionerEnableClimateControlEnableAutoModeAirCirculationModeFanSpeedIndexFanSpeedPercentageRelativeFanSpeedSettingTemperatureRelativeTemperatureSettingClimateZone(enableFan: number, enableAirConditioner: number, enableClimateControl: number, enableAutoMode: number, airCirculationMode: INCarAirCirculationMode, fanSpeedIndex: number, fanSpeedPercentage: number, relativeFanSpeedSetting: INRelativeSetting, temperature: NSMeasurement<NSUnitTemperature>, relativeTemperatureSetting: INRelativeSetting, climateZone: INCarSeat): this;
}

interface INSetClimateSettingsInCarIntentHandling extends NSObjectProtocol {

	confirmSetClimateSettingsInCarCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INSetClimateSettingsInCarIntentResponse) => void): void;

	handleSetClimateSettingsInCarCompletion(intent: INSetClimateSettingsInCarIntent, completion: (p1: INSetClimateSettingsInCarIntentResponse) => void): void;

	resolveAirCirculationModeForSetClimateSettingsInCarWithCompletion?(intent: INSetClimateSettingsInCarIntent, completion: (p1: INCarAirCirculationModeResolutionResult) => void): void;

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

declare var INSetClimateSettingsInCarIntentIdentifier: string;

declare class INSetClimateSettingsInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetClimateSettingsInCarIntentResponse; // inherited from NSObject

	static new(): INSetClimateSettingsInCarIntentResponse; // inherited from NSObject

	readonly code: INSetClimateSettingsInCarIntentResponseCode;

	constructor(o: { code: INSetClimateSettingsInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetClimateSettingsInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetClimateSettingsInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INSetDefrosterSettingsInCarIntent extends INIntent {

	static alloc(): INSetDefrosterSettingsInCarIntent; // inherited from NSObject

	static new(): INSetDefrosterSettingsInCarIntent; // inherited from NSObject

	readonly defroster: INCarDefroster;

	readonly enable: number;

	constructor(o: { enable: number; defroster: INCarDefroster; });

	initWithEnableDefroster(enable: number, defroster: INCarDefroster): this;
}

interface INSetDefrosterSettingsInCarIntentHandling extends NSObjectProtocol {

	confirmSetDefrosterSettingsInCarCompletion?(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INSetDefrosterSettingsInCarIntentResponse) => void): void;

	handleSetDefrosterSettingsInCarCompletion(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INSetDefrosterSettingsInCarIntentResponse) => void): void;

	resolveDefrosterForSetDefrosterSettingsInCarWithCompletion?(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INCarDefrosterResolutionResult) => void): void;

	resolveEnableForSetDefrosterSettingsInCarWithCompletion?(intent: INSetDefrosterSettingsInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;
}
declare var INSetDefrosterSettingsInCarIntentHandling: {

	prototype: INSetDefrosterSettingsInCarIntentHandling;
};

declare var INSetDefrosterSettingsInCarIntentIdentifier: string;

declare class INSetDefrosterSettingsInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetDefrosterSettingsInCarIntentResponse; // inherited from NSObject

	static new(): INSetDefrosterSettingsInCarIntentResponse; // inherited from NSObject

	readonly code: INSetDefrosterSettingsInCarIntentResponseCode;

	constructor(o: { code: INSetDefrosterSettingsInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetDefrosterSettingsInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetDefrosterSettingsInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INSetMessageAttributeIntent extends INIntent {

	static alloc(): INSetMessageAttributeIntent; // inherited from NSObject

	static new(): INSetMessageAttributeIntent; // inherited from NSObject

	readonly attribute: INMessageAttribute;

	readonly identifiers: NSArray<string>;

	constructor(o: { identifiers: NSArray<string>; attribute: INMessageAttribute; });

	initWithIdentifiersAttribute(identifiers: NSArray<string>, attribute: INMessageAttribute): this;
}

interface INSetMessageAttributeIntentHandling extends NSObjectProtocol {

	confirmSetMessageAttributeCompletion?(intent: INSetMessageAttributeIntent, completion: (p1: INSetMessageAttributeIntentResponse) => void): void;

	handleSetMessageAttributeCompletion(intent: INSetMessageAttributeIntent, completion: (p1: INSetMessageAttributeIntentResponse) => void): void;

	resolveAttributeForSetMessageAttributeWithCompletion?(intent: INSetMessageAttributeIntent, completion: (p1: INMessageAttributeResolutionResult) => void): void;
}
declare var INSetMessageAttributeIntentHandling: {

	prototype: INSetMessageAttributeIntentHandling;
};

declare var INSetMessageAttributeIntentIdentifier: string;

declare class INSetMessageAttributeIntentResponse extends INIntentResponse {

	static alloc(): INSetMessageAttributeIntentResponse; // inherited from NSObject

	static new(): INSetMessageAttributeIntentResponse; // inherited from NSObject

	readonly code: INSetMessageAttributeIntentResponseCode;

	constructor(o: { code: INSetMessageAttributeIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetMessageAttributeIntentResponseCode, userActivity: NSUserActivity): this;
}

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

declare class INSetProfileInCarIntent extends INIntent {

	static alloc(): INSetProfileInCarIntent; // inherited from NSObject

	static new(): INSetProfileInCarIntent; // inherited from NSObject

	readonly defaultProfile: number;

	readonly profileLabel: string;

	readonly profileName: string;

	readonly profileNumber: number;

	constructor(o: { profileNumber: number; profileLabel: string; defaultProfile: number; });

	constructor(o: { profileNumber: number; profileName: string; defaultProfile: number; });

	initWithProfileNumberProfileLabelDefaultProfile(profileNumber: number, profileLabel: string, defaultProfile: number): this;

	initWithProfileNumberProfileNameDefaultProfile(profileNumber: number, profileName: string, defaultProfile: number): this;
}

interface INSetProfileInCarIntentHandling extends NSObjectProtocol {

	confirmSetProfileInCarCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INSetProfileInCarIntentResponse) => void): void;

	handleSetProfileInCarCompletion(intent: INSetProfileInCarIntent, completion: (p1: INSetProfileInCarIntentResponse) => void): void;

	resolveDefaultProfileForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

	resolveProfileNameForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveProfileNumberForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INIntegerResolutionResult) => void): void;
}
declare var INSetProfileInCarIntentHandling: {

	prototype: INSetProfileInCarIntentHandling;
};

declare var INSetProfileInCarIntentIdentifier: string;

declare class INSetProfileInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetProfileInCarIntentResponse; // inherited from NSObject

	static new(): INSetProfileInCarIntentResponse; // inherited from NSObject

	readonly code: INSetProfileInCarIntentResponseCode;

	constructor(o: { code: INSetProfileInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetProfileInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetProfileInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

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

declare var INSetRadioStationIntentIdentifier: string;

declare class INSetRadioStationIntentResponse extends INIntentResponse {

	static alloc(): INSetRadioStationIntentResponse; // inherited from NSObject

	static new(): INSetRadioStationIntentResponse; // inherited from NSObject

	readonly code: INSetRadioStationIntentResponseCode;

	constructor(o: { code: INSetRadioStationIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetRadioStationIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetRadioStationIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5,

	FailureNotSubscribed = 6
}

declare class INSetSeatSettingsInCarIntent extends INIntent {

	static alloc(): INSetSeatSettingsInCarIntent; // inherited from NSObject

	static new(): INSetSeatSettingsInCarIntent; // inherited from NSObject

	readonly enableCooling: number;

	readonly enableHeating: number;

	readonly enableMassage: number;

	readonly level: number;

	readonly relativeLevelSetting: INRelativeSetting;

	readonly seat: INCarSeat;

	constructor(o: { enableHeating: number; enableCooling: number; enableMassage: number; seat: INCarSeat; level: number; relativeLevelSetting: INRelativeSetting; });

	initWithEnableHeatingEnableCoolingEnableMassageSeatLevelRelativeLevelSetting(enableHeating: number, enableCooling: number, enableMassage: number, seat: INCarSeat, level: number, relativeLevelSetting: INRelativeSetting): this;
}

interface INSetSeatSettingsInCarIntentHandling extends NSObjectProtocol {

	confirmSetSeatSettingsInCarCompletion?(intent: INSetSeatSettingsInCarIntent, completion: (p1: INSetSeatSettingsInCarIntentResponse) => void): void;

	handleSetSeatSettingsInCarCompletion(intent: INSetSeatSettingsInCarIntent, completion: (p1: INSetSeatSettingsInCarIntentResponse) => void): void;

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

declare var INSetSeatSettingsInCarIntentIdentifier: string;

declare class INSetSeatSettingsInCarIntentResponse extends INIntentResponse {

	static alloc(): INSetSeatSettingsInCarIntentResponse; // inherited from NSObject

	static new(): INSetSeatSettingsInCarIntentResponse; // inherited from NSObject

	readonly code: INSetSeatSettingsInCarIntentResponseCode;

	constructor(o: { code: INSetSeatSettingsInCarIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetSeatSettingsInCarIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetSeatSettingsInCarIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare class INSetTaskAttributeIntent extends INIntent {

	static alloc(): INSetTaskAttributeIntent; // inherited from NSObject

	static new(): INSetTaskAttributeIntent; // inherited from NSObject

	readonly spatialEventTrigger: INSpatialEventTrigger;

	readonly status: INTaskStatus;

	readonly targetTask: INTask;

	readonly temporalEventTrigger: INTemporalEventTrigger;

	constructor(o: { targetTask: INTask; status: INTaskStatus; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; });

	initWithTargetTaskStatusSpatialEventTriggerTemporalEventTrigger(targetTask: INTask, status: INTaskStatus, spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger): this;
}

interface INSetTaskAttributeIntentHandling extends NSObjectProtocol {

	confirmSetTaskAttributeCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INSetTaskAttributeIntentResponse) => void): void;

	handleSetTaskAttributeCompletion(intent: INSetTaskAttributeIntent, completion: (p1: INSetTaskAttributeIntentResponse) => void): void;

	resolveSpatialEventTriggerForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INSpatialEventTriggerResolutionResult) => void): void;

	resolveStatusForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INTaskStatusResolutionResult) => void): void;

	resolveTargetTaskForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INTaskResolutionResult) => void): void;

	resolveTemporalEventTriggerForSetTaskAttributeWithCompletion?(intent: INSetTaskAttributeIntent, completion: (p1: INTemporalEventTriggerResolutionResult) => void): void;
}
declare var INSetTaskAttributeIntentHandling: {

	prototype: INSetTaskAttributeIntentHandling;
};

declare class INSetTaskAttributeIntentResponse extends INIntentResponse {

	static alloc(): INSetTaskAttributeIntentResponse; // inherited from NSObject

	static new(): INSetTaskAttributeIntentResponse; // inherited from NSObject

	readonly code: INSetTaskAttributeIntentResponseCode;

	modifiedTask: INTask;

	constructor(o: { code: INSetTaskAttributeIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSetTaskAttributeIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSetTaskAttributeIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	InProgress = 2,

	Success = 3,

	Failure = 4,

	FailureRequiringAppLaunch = 5
}

declare const enum INSiriAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare const enum INSortType {

	Unknown = 0,

	AsIs = 1,

	ByDate = 2
}

declare const enum INSpatialEvent {

	Unknown = 0,

	Arrive = 1,

	Depart = 2
}

declare class INSpatialEventTrigger extends NSObject {

	static alloc(): INSpatialEventTrigger; // inherited from NSObject

	static new(): INSpatialEventTrigger; // inherited from NSObject

	readonly event: INSpatialEvent;

	readonly placemark: CLPlacemark;

	constructor(o: { placemark: CLPlacemark; event: INSpatialEvent; });

	initWithPlacemarkEvent(placemark: CLPlacemark, event: INSpatialEvent): this;
}

declare class INSpatialEventTriggerResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INSpatialEventTriggerResolutionResult; // inherited from NSObject

	static confirmationRequiredWithSpatialEventTriggerToConfirm(spatialEventTriggerToConfirm: INSpatialEventTrigger): INSpatialEventTriggerResolutionResult;

	static disambiguationWithSpatialEventTriggersToDisambiguate(spatialEventTriggersToDisambiguate: NSArray<INSpatialEventTrigger>): INSpatialEventTriggerResolutionResult;

	static needsValue(): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSpatialEventTriggerResolutionResult; // inherited from NSObject

	static notRequired(): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedSpatialEventTrigger(resolvedSpatialEventTrigger: INSpatialEventTrigger): INSpatialEventTriggerResolutionResult;

	static unsupported(): INSpatialEventTriggerResolutionResult; // inherited from INIntentResolutionResult
}

interface INSpeakable extends NSObjectProtocol {

	alternativeSpeakableMatches: NSArray<INSpeakable>;

	identifier?: string;

	pronunciationHint: string;

	spokenPhrase: string;

	vocabularyIdentifier: string;
}
declare var INSpeakable: {

	prototype: INSpeakable;
};

declare class INSpeakableString extends NSObject implements INSpeakable {

	static alloc(): INSpeakableString; // inherited from NSObject

	static new(): INSpeakableString; // inherited from NSObject

	readonly alternativeSpeakableMatches: NSArray<INSpeakable>; // inherited from INSpeakable

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly identifier: string; // inherited from INSpeakable

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly pronunciationHint: string; // inherited from INSpeakable

	readonly spokenPhrase: string; // inherited from INSpeakable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly vocabularyIdentifier: string; // inherited from INSpeakable

	readonly  // inherited from NSObjectProtocol

	constructor(o: { identifier: string; spokenPhrase: string; pronunciationHint: string; });

	constructor(o: { spokenPhrase: string; });

	constructor(o: { vocabularyIdentifier: string; spokenPhrase: string; pronunciationHint: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithIdentifierSpokenPhrasePronunciationHint(identifier: string, spokenPhrase: string, pronunciationHint: string): this;

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

declare class INSpeakableStringResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INSpeakableStringResolutionResult; // inherited from NSObject

	static confirmationRequiredWithStringToConfirm(stringToConfirm: INSpeakableString): INSpeakableStringResolutionResult;

	static disambiguationWithStringsToDisambiguate(stringsToDisambiguate: NSArray<INSpeakableString>): INSpeakableStringResolutionResult;

	static needsValue(): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult

	static new(): INSpeakableStringResolutionResult; // inherited from NSObject

	static notRequired(): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedString(resolvedString: INSpeakableString): INSpeakableStringResolutionResult;

	static unsupported(): INSpeakableStringResolutionResult; // inherited from INIntentResolutionResult
}

declare class INStartAudioCallIntent extends INIntent {

	static alloc(): INStartAudioCallIntent; // inherited from NSObject

	static new(): INStartAudioCallIntent; // inherited from NSObject

	readonly contacts: NSArray<INPerson>;

	readonly destinationType: INCallDestinationType;

	constructor(o: { contacts: NSArray<INPerson>; });

	constructor(o: { destinationType: INCallDestinationType; contacts: NSArray<INPerson>; });

	initWithContacts(contacts: NSArray<INPerson>): this;

	initWithDestinationTypeContacts(destinationType: INCallDestinationType, contacts: NSArray<INPerson>): this;
}

interface INStartAudioCallIntentHandling extends NSObjectProtocol {

	confirmStartAudioCallCompletion?(intent: INStartAudioCallIntent, completion: (p1: INStartAudioCallIntentResponse) => void): void;

	handleStartAudioCallCompletion(intent: INStartAudioCallIntent, completion: (p1: INStartAudioCallIntentResponse) => void): void;

	resolveContactsForStartAudioCallWithCompletion?(intent: INStartAudioCallIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	resolveDestinationTypeForStartAudioCallWithCompletion?(intent: INStartAudioCallIntent, completion: (p1: INCallDestinationTypeResolutionResult) => void): void;
}
declare var INStartAudioCallIntentHandling: {

	prototype: INStartAudioCallIntentHandling;
};

declare var INStartAudioCallIntentIdentifier: string;

declare class INStartAudioCallIntentResponse extends INIntentResponse {

	static alloc(): INStartAudioCallIntentResponse; // inherited from NSObject

	static new(): INStartAudioCallIntentResponse; // inherited from NSObject

	readonly code: INStartAudioCallIntentResponseCode;

	constructor(o: { code: INStartAudioCallIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartAudioCallIntentResponseCode, userActivity: NSUserActivity): this;
}

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

	constructor(o: { dateCreated: INDateComponentsRange; locationCreated: CLPlacemark; albumName: string; searchTerms: NSArray<string>; includedAttributes: INPhotoAttributeOptions; excludedAttributes: INPhotoAttributeOptions; peopleInPhoto: NSArray<INPerson>; });

	initWithDateCreatedLocationCreatedAlbumNameSearchTermsIncludedAttributesExcludedAttributesPeopleInPhoto(dateCreated: INDateComponentsRange, locationCreated: CLPlacemark, albumName: string, searchTerms: NSArray<string>, includedAttributes: INPhotoAttributeOptions, excludedAttributes: INPhotoAttributeOptions, peopleInPhoto: NSArray<INPerson>): this;
}

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

declare var INStartPhotoPlaybackIntentIdentifier: string;

declare class INStartPhotoPlaybackIntentResponse extends INIntentResponse {

	static alloc(): INStartPhotoPlaybackIntentResponse; // inherited from NSObject

	static new(): INStartPhotoPlaybackIntentResponse; // inherited from NSObject

	readonly code: INStartPhotoPlaybackIntentResponseCode;

	searchResultsCount: number;

	constructor(o: { code: INStartPhotoPlaybackIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartPhotoPlaybackIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INStartPhotoPlaybackIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureAppConfigurationRequired = 5
}

declare class INStartVideoCallIntent extends INIntent {

	static alloc(): INStartVideoCallIntent; // inherited from NSObject

	static new(): INStartVideoCallIntent; // inherited from NSObject

	readonly contacts: NSArray<INPerson>;

	constructor(o: { contacts: NSArray<INPerson>; });

	initWithContacts(contacts: NSArray<INPerson>): this;
}

interface INStartVideoCallIntentHandling extends NSObjectProtocol {

	confirmStartVideoCallCompletion?(intent: INStartVideoCallIntent, completion: (p1: INStartVideoCallIntentResponse) => void): void;

	handleStartVideoCallCompletion(intent: INStartVideoCallIntent, completion: (p1: INStartVideoCallIntentResponse) => void): void;

	resolveContactsForStartVideoCallWithCompletion?(intent: INStartVideoCallIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;
}
declare var INStartVideoCallIntentHandling: {

	prototype: INStartVideoCallIntentHandling;
};

declare var INStartVideoCallIntentIdentifier: string;

declare class INStartVideoCallIntentResponse extends INIntentResponse {

	static alloc(): INStartVideoCallIntentResponse; // inherited from NSObject

	static new(): INStartVideoCallIntentResponse; // inherited from NSObject

	readonly code: INStartVideoCallIntentResponseCode;

	constructor(o: { code: INStartVideoCallIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartVideoCallIntentResponseCode, userActivity: NSUserActivity): this;
}

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

declare var INStartWorkoutIntentIdentifier: string;

declare class INStartWorkoutIntentResponse extends INIntentResponse {

	static alloc(): INStartWorkoutIntentResponse; // inherited from NSObject

	static new(): INStartWorkoutIntentResponse; // inherited from NSObject

	readonly code: INStartWorkoutIntentResponseCode;

	constructor(o: { code: INStartWorkoutIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INStartWorkoutIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INStartWorkoutIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4,

	FailureOngoingWorkout = 5,

	FailureNoMatchingWorkout = 6,

	Success = 7,

	HandleInApp = 8
}

declare class INStringResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INStringResolutionResult; // inherited from NSObject

	static confirmationRequiredWithStringToConfirm(stringToConfirm: string): INStringResolutionResult;

	static disambiguationWithStringsToDisambiguate(stringsToDisambiguate: NSArray<string>): INStringResolutionResult;

	static needsValue(): INStringResolutionResult; // inherited from INIntentResolutionResult

	static new(): INStringResolutionResult; // inherited from NSObject

	static notRequired(): INStringResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedString(resolvedString: string): INStringResolutionResult;

	static unsupported(): INStringResolutionResult; // inherited from INIntentResolutionResult
}

declare class INTask extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTask; // inherited from NSObject

	static new(): INTask; // inherited from NSObject

	readonly createdDateComponents: NSDateComponents;

	readonly identifier: string;

	readonly modifiedDateComponents: NSDateComponents;

	readonly spatialEventTrigger: INSpatialEventTrigger;

	readonly status: INTaskStatus;

	readonly taskType: INTaskType;

	readonly temporalEventTrigger: INTemporalEventTrigger;

	readonly title: INSpeakableString;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { title: INSpeakableString; status: INTaskStatus; taskType: INTaskType; spatialEventTrigger: INSpatialEventTrigger; temporalEventTrigger: INTemporalEventTrigger; createdDateComponents: NSDateComponents; modifiedDateComponents: NSDateComponents; identifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithTitleStatusTaskTypeSpatialEventTriggerTemporalEventTriggerCreatedDateComponentsModifiedDateComponentsIdentifier(title: INSpeakableString, status: INTaskStatus, taskType: INTaskType, spatialEventTrigger: INSpatialEventTrigger, temporalEventTrigger: INTemporalEventTrigger, createdDateComponents: NSDateComponents, modifiedDateComponents: NSDateComponents, identifier: string): this;
}

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

	constructor(o: { title: INSpeakableString; tasks: NSArray<INTask>; groupName: INSpeakableString; createdDateComponents: NSDateComponents; modifiedDateComponents: NSDateComponents; identifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithTitleTasksGroupNameCreatedDateComponentsModifiedDateComponentsIdentifier(title: INSpeakableString, tasks: NSArray<INTask>, groupName: INSpeakableString, createdDateComponents: NSDateComponents, modifiedDateComponents: NSDateComponents, identifier: string): this;
}

declare class INTaskListResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INTaskListResolutionResult; // inherited from NSObject

	static confirmationRequiredWithTaskListToConfirm(taskListToConfirm: INTaskList): INTaskListResolutionResult;

	static disambiguationWithTaskListsToDisambiguate(taskListsToDisambiguate: NSArray<INTaskList>): INTaskListResolutionResult;

	static needsValue(): INTaskListResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTaskListResolutionResult; // inherited from NSObject

	static notRequired(): INTaskListResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTaskList(resolvedTaskList: INTaskList): INTaskListResolutionResult;

	static unsupported(): INTaskListResolutionResult; // inherited from INIntentResolutionResult
}

declare class INTaskResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INTaskResolutionResult; // inherited from NSObject

	static confirmationRequiredWithTaskToConfirm(taskToConfirm: INTask): INTaskResolutionResult;

	static disambiguationWithTasksToDisambiguate(tasksToDisambiguate: NSArray<INTask>): INTaskResolutionResult;

	static needsValue(): INTaskResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTaskResolutionResult; // inherited from NSObject

	static notRequired(): INTaskResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTask(resolvedTask: INTask): INTaskResolutionResult;

	static unsupported(): INTaskResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INTaskStatus {

	Unknown = 0,

	NotCompleted = 1,

	Completed = 2
}

declare class INTaskStatusResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INTaskStatusResolutionResult; // inherited from NSObject

	static confirmationRequiredWithTaskStatusToConfirm(taskStatusToConfirm: INTaskStatus): INTaskStatusResolutionResult;

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INTaskStatus): INTaskStatusResolutionResult;

	static needsValue(): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTaskStatusResolutionResult; // inherited from NSObject

	static notRequired(): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTaskStatus(resolvedTaskStatus: INTaskStatus): INTaskStatusResolutionResult;

	static successWithResolvedValue(resolvedValue: INTaskStatus): INTaskStatusResolutionResult;

	static unsupported(): INTaskStatusResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INTaskType {

	Unknown = 0,

	NotCompletable = 1,

	Completable = 2
}

declare class INTemperatureResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INTemperatureResolutionResult; // inherited from NSObject

	static confirmationRequiredWithTemperatureToConfirm(temperatureToConfirm: NSMeasurement<NSUnitTemperature>): INTemperatureResolutionResult;

	static disambiguationWithTemperaturesToDisambiguate(temperaturesToDisambiguate: NSArray<NSMeasurement<NSUnitTemperature>>): INTemperatureResolutionResult;

	static needsValue(): INTemperatureResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTemperatureResolutionResult; // inherited from NSObject

	static notRequired(): INTemperatureResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTemperature(resolvedTemperature: NSMeasurement<NSUnitTemperature>): INTemperatureResolutionResult;

	static unsupported(): INTemperatureResolutionResult; // inherited from INIntentResolutionResult
}

declare class INTemporalEventTrigger extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INTemporalEventTrigger; // inherited from NSObject

	static new(): INTemporalEventTrigger; // inherited from NSObject

	readonly dateComponentsRange: INDateComponentsRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { dateComponentsRange: INDateComponentsRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithDateComponentsRange(dateComponentsRange: INDateComponentsRange): this;
}

declare class INTemporalEventTriggerResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INTemporalEventTriggerResolutionResult; // inherited from NSObject

	static confirmationRequiredWithTemporalEventTriggerToConfirm(temporalEventTriggerToConfirm: INTemporalEventTrigger): INTemporalEventTriggerResolutionResult;

	static disambiguationWithTemporalEventTriggersToDisambiguate(temporalEventTriggersToDisambiguate: NSArray<INTemporalEventTrigger>): INTemporalEventTriggerResolutionResult;

	static needsValue(): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static new(): INTemporalEventTriggerResolutionResult; // inherited from NSObject

	static notRequired(): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedTemporalEventTrigger(resolvedTemporalEventTrigger: INTemporalEventTrigger): INTemporalEventTriggerResolutionResult;

	static unsupported(): INTemporalEventTriggerResolutionResult; // inherited from INIntentResolutionResult
}

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

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithLocalizedTermsAndConditionsTextPrivacyPolicyURLTermsAndConditionsURL(localizedTermsAndConditionsText: string, privacyPolicyURL: NSURL, termsAndConditionsURL: NSURL): this;
}

declare class INTextNoteContent extends INNoteContent implements NSCopying, NSSecureCoding {

	static alloc(): INTextNoteContent; // inherited from NSObject

	static new(): INTextNoteContent; // inherited from NSObject

	readonly text: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { text: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithText(text: string): this;
}

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

interface INVisualCodeDomainHandling extends INGetVisualCodeIntentHandling {
}
declare var INVisualCodeDomainHandling: {

	prototype: INVisualCodeDomainHandling;
};

declare const enum INVisualCodeType {

	Unknown = 0,

	Contact = 1,

	RequestPayment = 2,

	SendPayment = 3
}

declare class INVisualCodeTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INVisualCodeTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INVisualCodeType): INVisualCodeTypeResolutionResult;

	static confirmationRequiredWithVisualCodeTypeToConfirm(visualCodeTypeToConfirm: INVisualCodeType): INVisualCodeTypeResolutionResult;

	static needsValue(): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INVisualCodeTypeResolutionResult; // inherited from NSObject

	static notRequired(): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INVisualCodeType): INVisualCodeTypeResolutionResult;

	static successWithResolvedVisualCodeType(resolvedVisualCodeType: INVisualCodeType): INVisualCodeTypeResolutionResult;

	static unsupported(): INVisualCodeTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare class INVocabulary extends NSObject {

	static alloc(): INVocabulary; // inherited from NSObject

	static new(): INVocabulary; // inherited from NSObject

	static sharedVocabulary(): INVocabulary;

	removeAllVocabularyStrings(): void;

	setVocabularyOfType(vocabulary: NSOrderedSet<INSpeakable>, type: INVocabularyStringType): void;

	setVocabularyStringsOfType(vocabulary: NSOrderedSet<string>, type: INVocabularyStringType): void;
}

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

	NotebookItemGroupName = 501
}

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

declare class INWorkoutGoalUnitTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INWorkoutGoalUnitTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static confirmationRequiredWithWorkoutGoalUnitTypeToConfirm(workoutGoalUnitTypeToConfirm: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static needsValue(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INWorkoutGoalUnitTypeResolutionResult; // inherited from NSObject

	static notRequired(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static successWithResolvedWorkoutGoalUnitType(resolvedWorkoutGoalUnitType: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

	static unsupported(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INWorkoutLocationType {

	Unknown = 0,

	Outdoor = 1,

	Indoor = 2
}

declare class INWorkoutLocationTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INWorkoutLocationTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static confirmationRequiredWithWorkoutLocationTypeToConfirm(workoutLocationTypeToConfirm: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static needsValue(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INWorkoutLocationTypeResolutionResult; // inherited from NSObject

	static notRequired(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static successWithResolvedWorkoutLocationType(resolvedWorkoutLocationType: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static unsupported(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare var INWorkoutNameIdentifierCrosstraining: string;

declare var INWorkoutNameIdentifierCycle: string;

declare var INWorkoutNameIdentifierDance: string;

declare var INWorkoutNameIdentifierElliptical: string;

declare var INWorkoutNameIdentifierExercise: string;

declare var INWorkoutNameIdentifierIndoorcycle: string;

declare var INWorkoutNameIdentifierIndoorrun: string;

declare var INWorkoutNameIdentifierIndoorwalk: string;

declare var INWorkoutNameIdentifierMove: string;

declare var INWorkoutNameIdentifierOther: string;

declare var INWorkoutNameIdentifierRower: string;

declare var INWorkoutNameIdentifierRun: string;

declare var INWorkoutNameIdentifierSit: string;

declare var INWorkoutNameIdentifierStairs: string;

declare var INWorkoutNameIdentifierStand: string;

declare var INWorkoutNameIdentifierSteps: string;

declare var INWorkoutNameIdentifierWalk: string;

declare var INWorkoutNameIdentifierYoga: string;

interface INWorkoutsDomainHandling extends INCancelWorkoutIntentHandling, INEndWorkoutIntentHandling, INPauseWorkoutIntentHandling, INResumeWorkoutIntentHandling, INStartWorkoutIntentHandling {
}
declare var INWorkoutsDomainHandling: {

	prototype: INWorkoutsDomainHandling;
};

declare var IntentsVersionNumber: number;

declare var IntentsVersionString: interop.Reference<number>;
