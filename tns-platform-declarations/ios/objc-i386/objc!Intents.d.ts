
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
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

declare const enum INCallCapabilityOptions {

	AudioCall = 1,

	VideoCall = 2
}

declare const enum INCallRecordType {

	Unknown = 0,

	Outgoing = 1,

	Missed = 2,

	Received = 3
}

declare class INCallRecordTypeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCallRecordTypeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCallRecordType): INCallRecordTypeResolutionResult;

	static needsValue(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCallRecordTypeResolutionResult; // inherited from NSObject

	static notRequired(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INCallRecordType): INCallRecordTypeResolutionResult;

	static unsupported(): INCallRecordTypeResolutionResult; // inherited from INIntentResolutionResult
}

interface INCallsDomainHandling extends INSearchCallHistoryIntentHandling, INStartAudioCallIntentHandling, INStartVideoCallIntentHandling {
}
declare var INCallsDomainHandling: {

	prototype: INCallsDomainHandling;
};

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

	FailureNoMatchingWorkout = 5
}

declare const enum INCarAirCirculationMode {

	Unknown = 0,

	FreshAir = 1,

	RecirculateAir = 2
}

declare class INCarAirCirculationModeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarAirCirculationModeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarAirCirculationMode): INCarAirCirculationModeResolutionResult;

	static needsValue(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarAirCirculationModeResolutionResult; // inherited from NSObject

	static notRequired(): INCarAirCirculationModeResolutionResult; // inherited from INIntentResolutionResult

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

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarAudioSource): INCarAudioSourceResolutionResult;

	static needsValue(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarAudioSourceResolutionResult; // inherited from NSObject

	static notRequired(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INCarAudioSource): INCarAudioSourceResolutionResult;

	static unsupported(): INCarAudioSourceResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INCarDefroster {

	Unknown = 0,

	Front = 1,

	Rear = 2
}

declare class INCarDefrosterResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarDefrosterResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarDefroster): INCarDefrosterResolutionResult;

	static needsValue(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarDefrosterResolutionResult; // inherited from NSObject

	static notRequired(): INCarDefrosterResolutionResult; // inherited from INIntentResolutionResult

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

	ThirdRow = 11
}

declare class INCarSeatResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INCarSeatResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INCarSeat): INCarSeatResolutionResult;

	static needsValue(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	static new(): INCarSeatResolutionResult; // inherited from NSObject

	static notRequired(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INCarSeat): INCarSeatResolutionResult;

	static unsupported(): INCarSeatResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INConditionalOperator {

	All = 0,

	Any = 1,

	None = 2
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

	readonly startDateComponents: NSDateComponents;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { startDateComponents: NSDateComponents; endDateComponents: NSDateComponents; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithStartDateComponentsEndDateComponents(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents): this;
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

	FailureNoMatchingWorkout = 5
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
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

declare class INImage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INImage; // inherited from NSObject

	static imageNamed(name: string): INImage;

	static imageSizeForIntentResponse(response: INIntentResponse): CGSize;

	static imageWithCGImage(imageRef: any): INImage;

	static imageWithImageData(imageData: NSData): INImage;

	static imageWithUIImage(image: UIImage): INImage;

	static imageWithURL(URL: NSURL): INImage;

	static new(): INImage; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
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

	InvalidUserVocabularyFileLocation = 4000
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

	FailureRequiringAppLaunchPreviousRideNeedsCompletion = 9
}

declare class INMessage extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INMessage; // inherited from NSObject

	static new(): INMessage; // inherited from NSObject

	readonly content: string;

	readonly dateSent: Date;

	readonly identifier: string;

	readonly recipients: NSArray<INPerson>;

	readonly sender: INPerson;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { identifier: string; content: string; dateSent: Date; sender: INPerson; recipients: NSArray<INPerson>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithIdentifierContentDateSentSenderRecipients(identifier: string, content: string, dateSent: Date, sender: INPerson, recipients: NSArray<INPerson>): this;
}

declare const enum INMessageAttribute {

	Unknown = 0,

	Read = 1,

	Unread = 2,

	Flagged = 3,

	Unflagged = 4
}

declare const enum INMessageAttributeOptions {

	Read = 1,

	Unread = 2,

	Flagged = 4,

	Unflagged = 8
}

declare class INMessageAttributeOptionsResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INMessageAttributeOptionsResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static needsValue(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMessageAttributeOptionsResolutionResult; // inherited from NSObject

	static notRequired(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INMessageAttributeOptions): INMessageAttributeOptionsResolutionResult;

	static unsupported(): INMessageAttributeOptionsResolutionResult; // inherited from INIntentResolutionResult
}

declare class INMessageAttributeResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INMessageAttributeResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INMessageAttribute): INMessageAttributeResolutionResult;

	static needsValue(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INMessageAttributeResolutionResult; // inherited from NSObject

	static notRequired(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INMessageAttribute): INMessageAttributeResolutionResult;

	static unsupported(): INMessageAttributeResolutionResult; // inherited from INIntentResolutionResult
}

interface INMessagesDomainHandling extends INSearchForMessagesIntentHandling, INSendMessageIntentHandling, INSetMessageAttributeIntentHandling {
}
declare var INMessagesDomainHandling: {

	prototype: INMessagesDomainHandling;
};

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

	FailureNoMatchingWorkout = 5
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

	Failed = 4
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

	readonly nameComponents: NSPersonNameComponents;

	readonly personHandle: INPersonHandle;

	readonly suggestionType: INPersonSuggestionType;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly identifier: string; // inherited from INSpeakable

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly pronunciationHint: string; // inherited from INSpeakable

	readonly spokenPhrase: string; // inherited from INSpeakable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

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

	readonly type: INPersonHandleType;

	readonly value: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { value: string; type: INPersonHandleType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithValueType(value: string, type: INPersonHandleType): this;
}

declare const enum INPersonHandleType {

	Unknown = 0,

	EmailAddress = 1,

	PhoneNumber = 2
}

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

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRadioType): INRadioTypeResolutionResult;

	static needsValue(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRadioTypeResolutionResult; // inherited from NSObject

	static notRequired(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INRadioType): INRadioTypeResolutionResult;

	static unsupported(): INRadioTypeResolutionResult; // inherited from INIntentResolutionResult
}

declare const enum INRelativeReference {

	Unknown = 0,

	Next = 1,

	Previous = 2
}

declare class INRelativeReferenceResolutionResult extends INIntentResolutionResult<NSObject> {

	static alloc(): INRelativeReferenceResolutionResult; // inherited from NSObject

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRelativeReference): INRelativeReferenceResolutionResult;

	static needsValue(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRelativeReferenceResolutionResult; // inherited from NSObject

	static notRequired(): INRelativeReferenceResolutionResult; // inherited from INIntentResolutionResult

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

	static confirmationRequiredWithValueToConfirm(valueToConfirm: INRelativeSetting): INRelativeSettingResolutionResult;

	static needsValue(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	static new(): INRelativeSettingResolutionResult; // inherited from NSObject

	static notRequired(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INRelativeSetting): INRelativeSettingResolutionResult;

	static unsupported(): INRelativeSettingResolutionResult; // inherited from INIntentResolutionResult
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

	resolveCurrencyAmountForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INCurrencyAmountResolutionResult) => void): void;

	resolveNoteForRequestPaymentWithCompletion?(intent: INRequestPaymentIntent, completion: (p1: INStringResolutionResult) => void): void;

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

	FailureNoBankAccount = 10
}

declare class INRequestRideIntent extends INIntent {

	static alloc(): INRequestRideIntent; // inherited from NSObject

	static new(): INRequestRideIntent; // inherited from NSObject

	readonly dropOffLocation: CLPlacemark;

	readonly partySize: number;

	readonly paymentMethod: INPaymentMethod;

	readonly pickupLocation: CLPlacemark;

	readonly rideOptionName: INSpeakableString;

	constructor(o: { pickupLocation: CLPlacemark; dropOffLocation: CLPlacemark; rideOptionName: INSpeakableString; partySize: number; paymentMethod: INPaymentMethod; });

	initWithPickupLocationDropOffLocationRideOptionNamePartySizePaymentMethod(pickupLocation: CLPlacemark, dropOffLocation: CLPlacemark, rideOptionName: INSpeakableString, partySize: number, paymentMethod: INPaymentMethod): this;
}

interface INRequestRideIntentHandling extends NSObjectProtocol {

	confirmRequestRideCompletion?(intent: INRequestRideIntent, completion: (p1: INRequestRideIntentResponse) => void): void;

	handleRequestRideCompletion(intent: INRequestRideIntent, completion: (p1: INRequestRideIntentResponse) => void): void;

	resolveDropOffLocationForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolvePartySizeForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INIntegerResolutionResult) => void): void;

	resolvePickupLocationForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INPlacemarkResolutionResult) => void): void;

	resolveRideOptionNameForRequestRideWithCompletion?(intent: INRequestRideIntent, completion: (p1: INSpeakableStringResolutionResult) => void): void;
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

	FailureNoMatchingWorkout = 5
}

declare class INRideCompletionStatus extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): INRideCompletionStatus; // inherited from NSObject

	static canceledByService(): INRideCompletionStatus;

	static canceledByUser(): INRideCompletionStatus;

	static canceledMissedPickup(): INRideCompletionStatus;

	static completed(): INRideCompletionStatus;

	static completedWithOutstandingPaymentAmount(outstandingPaymentAmount: INCurrencyAmount): INRideCompletionStatus;

	static completedWithSettledPaymentAmount(settledPaymentAmount: INCurrencyAmount): INRideCompletionStatus;

	static new(): INRideCompletionStatus; // inherited from NSObject

	readonly canceled: boolean;

	readonly completed: boolean;

	completionUserActivity: NSUserActivity;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithHandleDisplayNameImageRatingPhoneNumber(handle: string, displayName: string, image: INImage, rating: string, phoneNumber: string): this;

	initWithHandleNameComponentsImageRatingPhoneNumber(handle: string, nameComponents: NSPersonNameComponents, image: INImage, rating: string, phoneNumber: string): this;

	initWithPersonHandleNameComponentsDisplayNameImageRatingPhoneNumber(personHandle: INPersonHandle, nameComponents: NSPersonNameComponents, displayName: string, image: INImage, rating: string, phoneNumber: string): this;
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

	readonly profileNumber: number;

	constructor(o: { profileNumber: number; profileLabel: string; });

	initWithProfileNumberProfileLabel(profileNumber: number, profileLabel: string): this;
}

interface INSaveProfileInCarIntentHandling extends NSObjectProtocol {

	confirmSaveProfileInCarCompletion?(intent: INSaveProfileInCarIntent, completion: (p1: INSaveProfileInCarIntentResponse) => void): void;

	handleSaveProfileInCarCompletion(intent: INSaveProfileInCarIntent, completion: (p1: INSaveProfileInCarIntentResponse) => void): void;

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

	readonly dateCreated: INDateComponentsRange;

	readonly recipient: INPerson;

	constructor(o: { callType: INCallRecordType; dateCreated: INDateComponentsRange; recipient: INPerson; callCapabilities: INCallCapabilityOptions; });

	initWithCallTypeDateCreatedRecipientCallCapabilities(callType: INCallRecordType, dateCreated: INDateComponentsRange, recipient: INPerson, callCapabilities: INCallCapabilityOptions): this;
}

interface INSearchCallHistoryIntentHandling extends NSObjectProtocol {

	confirmSearchCallHistoryCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INSearchCallHistoryIntentResponse) => void): void;

	handleSearchCallHistoryCompletion(intent: INSearchCallHistoryIntent, completion: (p1: INSearchCallHistoryIntentResponse) => void): void;

	resolveCallTypeForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INCallRecordTypeResolutionResult) => void): void;

	resolveDateCreatedForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveRecipientForSearchCallHistoryWithCompletion?(intent: INSearchCallHistoryIntent, completion: (p1: INPersonResolutionResult) => void): void;
}
declare var INSearchCallHistoryIntentHandling: {

	prototype: INSearchCallHistoryIntentHandling;
};

declare var INSearchCallHistoryIntentIdentifier: string;

declare class INSearchCallHistoryIntentResponse extends INIntentResponse {

	static alloc(): INSearchCallHistoryIntentResponse; // inherited from NSObject

	static new(): INSearchCallHistoryIntentResponse; // inherited from NSObject

	readonly code: INSearchCallHistoryIntentResponseCode;

	constructor(o: { code: INSearchCallHistoryIntentResponseCode; userActivity: NSUserActivity; });

	initWithCodeUserActivity(code: INSearchCallHistoryIntentResponseCode, userActivity: NSUserActivity): this;
}

declare const enum INSearchCallHistoryIntentResponseCode {

	Unspecified = 0,

	Ready = 1,

	ContinueInApp = 2,

	Failure = 3,

	FailureRequiringAppLaunch = 4
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

	constructor(o: { recipients: NSArray<INPerson>; senders: NSArray<INPerson>; searchTerms: NSArray<string>; attributes: INMessageAttributeOptions; dateTimeRange: INDateComponentsRange; identifiers: NSArray<string>; notificationIdentifiers: NSArray<string>; groupNames: NSArray<string>; });

	initWithRecipientsSendersSearchTermsAttributesDateTimeRangeIdentifiersNotificationIdentifiersGroupNames(recipients: NSArray<INPerson>, senders: NSArray<INPerson>, searchTerms: NSArray<string>, attributes: INMessageAttributeOptions, dateTimeRange: INDateComponentsRange, identifiers: NSArray<string>, notificationIdentifiers: NSArray<string>, groupNames: NSArray<string>): this;
}

interface INSearchForMessagesIntentHandling extends NSObjectProtocol {

	confirmSearchForMessagesCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INSearchForMessagesIntentResponse) => void): void;

	handleSearchForMessagesCompletion(intent: INSearchForMessagesIntent, completion: (p1: INSearchForMessagesIntentResponse) => void): void;

	resolveAttributesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INMessageAttributeOptionsResolutionResult) => void): void;

	resolveDateTimeRangeForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: INDateComponentsRangeResolutionResult) => void): void;

	resolveGroupNamesForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INStringResolutionResult>) => void): void;

	resolveRecipientsForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;

	resolveSendersForSearchForMessagesWithCompletion?(intent: INSearchForMessagesIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;
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

	FailureMessageServiceNotAvailable = 6
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

	FailureRequiringAppLaunch = 4
}

declare class INSendMessageIntent extends INIntent {

	static alloc(): INSendMessageIntent; // inherited from NSObject

	static new(): INSendMessageIntent; // inherited from NSObject

	readonly content: string;

	readonly groupName: string;

	readonly recipients: NSArray<INPerson>;

	readonly sender: INPerson;

	readonly serviceName: string;

	constructor(o: { recipients: NSArray<INPerson>; content: string; groupName: string; serviceName: string; sender: INPerson; });

	initWithRecipientsContentGroupNameServiceNameSender(recipients: NSArray<INPerson>, content: string, groupName: string, serviceName: string, sender: INPerson): this;
}

interface INSendMessageIntentHandling extends NSObjectProtocol {

	confirmSendMessageCompletion?(intent: INSendMessageIntent, completion: (p1: INSendMessageIntentResponse) => void): void;

	handleSendMessageCompletion(intent: INSendMessageIntent, completion: (p1: INSendMessageIntentResponse) => void): void;

	resolveContentForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveGroupNameForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: INStringResolutionResult) => void): void;

	resolveRecipientsForSendMessageWithCompletion?(intent: INSendMessageIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;
}
declare var INSendMessageIntentHandling: {

	prototype: INSendMessageIntentHandling;
};

declare var INSendMessageIntentIdentifier: string;

declare class INSendMessageIntentResponse extends INIntentResponse {

	static alloc(): INSendMessageIntentResponse; // inherited from NSObject

	static new(): INSendMessageIntentResponse; // inherited from NSObject

	readonly code: INSendMessageIntentResponseCode;

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

	resolveCurrencyAmountForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INCurrencyAmountResolutionResult) => void): void;

	resolveNoteForSendPaymentWithCompletion?(intent: INSendPaymentIntent, completion: (p1: INStringResolutionResult) => void): void;

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

	FailureNoBankAccount = 11
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

	readonly profileNumber: number;

	constructor(o: { profileNumber: number; profileLabel: string; defaultProfile: number; });

	initWithProfileNumberProfileLabelDefaultProfile(profileNumber: number, profileLabel: string, defaultProfile: number): this;
}

interface INSetProfileInCarIntentHandling extends NSObjectProtocol {

	confirmSetProfileInCarCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INSetProfileInCarIntentResponse) => void): void;

	handleSetProfileInCarCompletion(intent: INSetProfileInCarIntent, completion: (p1: INSetProfileInCarIntentResponse) => void): void;

	resolveDefaultProfileForSetProfileInCarWithCompletion?(intent: INSetProfileInCarIntent, completion: (p1: INBooleanResolutionResult) => void): void;

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

declare const enum INSiriAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

interface INSpeakable extends NSObjectProtocol {

	identifier: string;

	pronunciationHint: string;

	spokenPhrase: string;
}
declare var INSpeakable: {

	prototype: INSpeakable;
};

declare class INSpeakableString extends NSObject implements INSpeakable {

	static alloc(): INSpeakableString; // inherited from NSObject

	static new(): INSpeakableString; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly identifier: string; // inherited from INSpeakable

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly pronunciationHint: string; // inherited from INSpeakable

	readonly spokenPhrase: string; // inherited from INSpeakable

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { identifier: string; spokenPhrase: string; pronunciationHint: string; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithIdentifierSpokenPhrasePronunciationHint(identifier: string, spokenPhrase: string, pronunciationHint: string): this;

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

	constructor(o: { contacts: NSArray<INPerson>; });

	initWithContacts(contacts: NSArray<INPerson>): this;
}

interface INStartAudioCallIntentHandling extends NSObjectProtocol {

	confirmStartAudioCallCompletion?(intent: INStartAudioCallIntent, completion: (p1: INStartAudioCallIntentResponse) => void): void;

	handleStartAudioCallCompletion(intent: INStartAudioCallIntent, completion: (p1: INStartAudioCallIntentResponse) => void): void;

	resolveContactsForStartAudioCallWithCompletion?(intent: INStartAudioCallIntent, completion: (p1: NSArray<INPersonResolutionResult>) => void): void;
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

	FailureRequiringAppLaunch = 4
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

	FailureRequiringAppLaunch = 4
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

	FailureRequiringAppLaunch = 4
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

	FailureNoMatchingWorkout = 6
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

declare class INVocabulary extends NSObject {

	static alloc(): INVocabulary; // inherited from NSObject

	static new(): INVocabulary; // inherited from NSObject

	static sharedVocabulary(): INVocabulary;

	removeAllVocabularyStrings(): void;

	setVocabularyStringsOfType(vocabulary: NSOrderedSet<string>, type: INVocabularyStringType): void;
}

declare const enum INVocabularyStringType {

	ContactName = 1,

	ContactGroupName = 2,

	PhotoTag = 100,

	PhotoAlbumName = 101,

	WorkoutActivityName = 200,

	CarProfileName = 300
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

	static needsValue(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INWorkoutGoalUnitTypeResolutionResult; // inherited from NSObject

	static notRequired(): INWorkoutGoalUnitTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INWorkoutGoalUnitType): INWorkoutGoalUnitTypeResolutionResult;

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

	static needsValue(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	static new(): INWorkoutLocationTypeResolutionResult; // inherited from NSObject

	static notRequired(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult

	static successWithResolvedValue(resolvedValue: INWorkoutLocationType): INWorkoutLocationTypeResolutionResult;

	static unsupported(): INWorkoutLocationTypeResolutionResult; // inherited from INIntentResolutionResult
}

interface INWorkoutsDomainHandling extends INCancelWorkoutIntentHandling, INEndWorkoutIntentHandling, INPauseWorkoutIntentHandling, INResumeWorkoutIntentHandling, INStartWorkoutIntentHandling {
}
declare var INWorkoutsDomainHandling: {

	prototype: INWorkoutsDomainHandling;
};

declare var IntentsVersionNumber: number;

declare var IntentsVersionString: interop.Reference<number>;
