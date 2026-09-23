
/**
 * @since 4.0
 */
declare class EKAlarm extends EKObject implements NSCopying {

	static alarmWithAbsoluteDate(date: Date): EKAlarm;

	static alarmWithRelativeOffset(offset: number): EKAlarm;

	static alloc(): EKAlarm; // inherited from NSObject

	static new(): EKAlarm; // inherited from NSObject

	absoluteDate: Date | null;

	proximity: EKAlarmProximity;

	relativeOffset: number;

	structuredLocation: EKStructuredLocation | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

declare const enum EKAlarmProximity {

	None = 0,

	Enter = 1,

	Leave = 2
}

declare const enum EKAlarmType {

	Display = 0,

	Audio = 1,

	Procedure = 2,

	Email = 3
}

/**
 * @since 6.0
 */
declare const enum EKAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	FullAccess = 3,

	WriteOnly = 4,

	Authorized = 3
}

/**
 * @since 4.0
 */
declare class EKCalendar extends EKObject {

	static alloc(): EKCalendar; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static calendarForEntityTypeEventStore(entityType: EKEntityType, eventStore: EKEventStore): EKCalendar;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	static calendarWithEventStore(eventStore: EKEventStore): EKCalendar;

	static new(): EKCalendar; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	CGColor: any;

	/**
	 * @since 6.0
	 */
	readonly allowedEntityTypes: EKEntityMask;

	readonly allowsContentModifications: boolean;

	/**
	 * @since 5.0
	 */
	readonly calendarIdentifier: string;

	/**
	 * @since 5.0
	 */
	readonly immutable: boolean;

	source: EKSource;

	/**
	 * @since 5.0
	 */
	readonly subscribed: boolean;

	readonly supportedEventAvailabilities: EKCalendarEventAvailabilityMask;

	title: string;

	readonly type: EKCalendarType;
}

declare const enum EKCalendarEventAvailabilityMask {

	None = 0,

	Busy = 1,

	Free = 2,

	Tentative = 4,

	Unavailable = 8
}

/**
 * @since 5.0
 */
declare class EKCalendarItem extends EKObject {

	static alloc(): EKCalendarItem; // inherited from NSObject

	static new(): EKCalendarItem; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	URL: NSURL | null;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	readonly UUID: string;

	alarms: NSArray<EKAlarm> | null;

	readonly attendees: NSArray<EKParticipant> | null;

	calendar: EKCalendar;

	/**
	 * @since 6.0
	 */
	readonly calendarItemExternalIdentifier: string;

	/**
	 * @since 6.0
	 */
	readonly calendarItemIdentifier: string;

	/**
	 * @since 5.0
	 */
	readonly creationDate: Date | null;

	/**
	 * @since 5.0
	 */
	readonly hasAlarms: boolean;

	/**
	 * @since 5.0
	 */
	readonly hasAttendees: boolean;

	/**
	 * @since 5.0
	 */
	readonly hasNotes: boolean;

	/**
	 * @since 5.0
	 */
	readonly hasRecurrenceRules: boolean;

	readonly lastModifiedDate: Date | null;

	location: string | null;

	notes: string | null;

	/**
	 * @since 5.0
	 */
	recurrenceRules: NSArray<EKRecurrenceRule> | null;

	/**
	 * @since 5.0
	 */
	timeZone: NSTimeZone | null;

	title: string;

	addAlarm(alarm: EKAlarm): void;

	addRecurrenceRule(rule: EKRecurrenceRule): void;

	removeAlarm(alarm: EKAlarm): void;

	removeRecurrenceRule(rule: EKRecurrenceRule): void;
}

declare const enum EKCalendarType {

	Local = 0,

	CalDAV = 1,

	Exchange = 2,

	Subscription = 3,

	Birthday = 4
}

declare const enum EKEntityMask {

	Event = 1,

	Reminder = 2
}

declare const enum EKEntityType {

	Event = 0,

	Reminder = 1
}

declare const enum EKErrorCode {

	EventNotMutable = 0,

	NoCalendar = 1,

	NoStartDate = 2,

	NoEndDate = 3,

	DatesInverted = 4,

	InternalFailure = 5,

	CalendarReadOnly = 6,

	DurationGreaterThanRecurrence = 7,

	AlarmGreaterThanRecurrence = 8,

	StartDateTooFarInFuture = 9,

	StartDateCollidesWithOtherOccurrence = 10,

	ObjectBelongsToDifferentStore = 11,

	InvitesCannotBeMoved = 12,

	InvalidSpan = 13,

	CalendarHasNoSource = 14,

	CalendarSourceCannotBeModified = 15,

	CalendarIsImmutable = 16,

	SourceDoesNotAllowCalendarAddDelete = 17,

	RecurringReminderRequiresDueDate = 18,

	StructuredLocationsNotSupported = 19,

	ReminderLocationsNotSupported = 20,

	AlarmProximityNotSupported = 21,

	CalendarDoesNotAllowEvents = 22,

	CalendarDoesNotAllowReminders = 23,

	SourceDoesNotAllowReminders = 24,

	SourceDoesNotAllowEvents = 25,

	PriorityIsInvalid = 26,

	InvalidEntityType = 27,

	ProcedureAlarmsNotMutable = 28,

	EventStoreNotAuthorized = 29,

	OSNotSupported = 30,

	InvalidInviteReplyCalendar = 31,

	NotificationsCollectionFlagNotSet = 32,

	SourceMismatch = 33,

	NotificationCollectionMismatch = 34,

	NotificationSavedWithoutCollection = 35,

	ReminderAlarmContainsEmailOrUrl = 36,

	Last = 37
}

/**
 * @since 4.0
 */
declare var EKErrorDomain: string;

/**
 * @since 4.0
 */
declare class EKEvent extends EKCalendarItem {

	static alloc(): EKEvent; // inherited from NSObject

	static eventWithEventStore(eventStore: EKEventStore): EKEvent;

	static new(): EKEvent; // inherited from NSObject

	allDay: boolean;

	availability: EKEventAvailability;

	/**
	 * @since 9.0
	 */
	readonly birthdayContactIdentifier: string | null;

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	readonly birthdayPersonID: number;

	endDate: Date;

	readonly eventIdentifier: string;

	readonly isDetached: boolean;

	/**
	 * @since 9.0
	 */
	readonly occurrenceDate: Date;

	readonly organizer: EKParticipant | null;

	startDate: Date;

	readonly status: EKEventStatus;

	/**
	 * @since 9.0
	 */
	structuredLocation: EKStructuredLocation | null;

	compareStartDateWithEvent(other: EKEvent): NSComparisonResult;
}

declare const enum EKEventAvailability {

	NotSupported = -1,

	Busy = 0,

	Free = 1,

	Tentative = 2,

	Unavailable = 3
}

declare const enum EKEventStatus {

	None = 0,

	Confirmed = 1,

	Tentative = 2,

	Canceled = 3
}

/**
 * @since 4.0
 */
declare class EKEventStore extends NSObject {

	static alloc(): EKEventStore; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static authorizationStatusForEntityType(entityType: EKEntityType): EKAuthorizationStatus;

	static new(): EKEventStore; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	readonly calendars: NSArray<EKCalendar>;

	readonly defaultCalendarForNewEvents: EKCalendar | null;

	/**
	 * @since 12.0
	 */
	readonly delegateSources: NSArray<EKSource>;

	readonly eventStoreIdentifier: string;

	/**
	 * @since 5.0
	 */
	readonly sources: NSArray<EKSource>;

	/**
	 * @since 16.0
	 */
	constructor(o: { sources: NSArray<EKSource> | EKSource[]; });

	/**
	 * @since 6.0
	 */
	calendarItemWithIdentifier(identifier: string): EKCalendarItem | null;

	/**
	 * @since 6.0
	 */
	calendarItemsWithExternalIdentifier(externalIdentifier: string): NSArray<EKCalendarItem>;

	/**
	 * @since 5.0
	 */
	calendarWithIdentifier(identifier: string): EKCalendar | null;

	/**
	 * @since 6.0
	 */
	calendarsForEntityType(entityType: EKEntityType): NSArray<EKCalendar>;

	/**
	 * @since 6.0
	 */
	cancelFetchRequest(fetchIdentifier: any): void;

	/**
	 * @since 5.0
	 */
	commit(error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 6.0
	 */
	defaultCalendarForNewReminders(): EKCalendar | null;

	enumerateEventsMatchingPredicateUsingBlock(predicate: NSPredicate, block: (p1: EKEvent, p2: interop.Pointer | interop.Reference<boolean> | null) => void): void;

	eventWithIdentifier(identifier: string): EKEvent | null;

	eventsMatchingPredicate(predicate: NSPredicate): NSArray<EKEvent>;

	/**
	 * @since 6.0
	 */
	fetchRemindersMatchingPredicateCompletion(predicate: NSPredicate, completion: (p1: NSArray<EKReminder> | null) => void): any;

	/**
	 * @since 16.0
	 */
	initWithSources(sources: NSArray<EKSource> | EKSource[]): this;

	/**
	 * @since 6.0
	 */
	predicateForCompletedRemindersWithCompletionDateStartingEndingCalendars(startDate: Date | null, endDate: Date | null, calendars: NSArray<EKCalendar> | EKCalendar[] | null): NSPredicate;

	predicateForEventsWithStartDateEndDateCalendars(startDate: Date, endDate: Date, calendars: NSArray<EKCalendar> | EKCalendar[] | null): NSPredicate;

	/**
	 * @since 6.0
	 */
	predicateForIncompleteRemindersWithDueDateStartingEndingCalendars(startDate: Date | null, endDate: Date | null, calendars: NSArray<EKCalendar> | EKCalendar[] | null): NSPredicate;

	/**
	 * @since 6.0
	 */
	predicateForRemindersInCalendars(calendars: NSArray<EKCalendar> | EKCalendar[] | null): NSPredicate;

	/**
	 * @since 5.0
	 */
	refreshSourcesIfNecessary(): void;

	/**
	 * @since 5.0
	 */
	removeCalendarCommitError(calendar: EKCalendar, commit: boolean, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 5.0
	 */
	removeEventSpanCommitError(event: EKEvent, span: EKSpan, commit: boolean, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 4.0
	 */
	removeEventSpanError(event: EKEvent, span: EKSpan, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 6.0
	 */
	removeReminderCommitError(reminder: EKReminder, commit: boolean, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 6.0
	 * @deprecated 17.0
	 */
	requestAccessToEntityTypeCompletion(entityType: EKEntityType, completion: (p1: boolean, p2: NSError | null) => void): void;

	/**
	 * @since 17.0
	 */
	requestFullAccessToEventsWithCompletion(completion: (p1: boolean, p2: NSError | null) => void): void;

	/**
	 * @since 17.0
	 */
	requestFullAccessToRemindersWithCompletion(completion: (p1: boolean, p2: NSError | null) => void): void;

	/**
	 * @since 17.0
	 */
	requestWriteOnlyAccessToEventsWithCompletion(completion: (p1: boolean, p2: NSError | null) => void): void;

	/**
	 * @since 5.0
	 */
	reset(): void;

	/**
	 * @since 5.0
	 */
	saveCalendarCommitError(calendar: EKCalendar, commit: boolean, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 5.0
	 */
	saveEventSpanCommitError(event: EKEvent, span: EKSpan, commit: boolean, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 4.0
	 */
	saveEventSpanError(event: EKEvent, span: EKSpan, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 6.0
	 */
	saveReminderCommitError(reminder: EKReminder, commit: boolean, error?: interop.Reference<NSError>): boolean;

	/**
	 * @since 5.0
	 */
	sourceWithIdentifier(identifier: string): EKSource | null;
}

/**
 * @since 4.0
 */
declare var EKEventStoreChangedNotification: string;

/**
 * @since 13.0
 */
declare class EKObject extends NSObject {

	static alloc(): EKObject; // inherited from NSObject

	static new(): EKObject; // inherited from NSObject

	readonly hasChanges: boolean;

	readonly new: boolean;

	refresh(): boolean;

	reset(): void;

	rollback(): void;
}

/**
 * @since 4.0
 */
declare class EKParticipant extends EKObject implements NSCopying {

	static alloc(): EKParticipant; // inherited from NSObject

	static new(): EKParticipant; // inherited from NSObject

	readonly URL: NSURL;

	/**
	 * @since 9.0
	 */
	readonly contactPredicate: NSPredicate;

	/**
	 * @since 6.0
	 */
	readonly currentUser: boolean;

	readonly name: string | null;

	readonly participantRole: EKParticipantRole;

	readonly participantStatus: EKParticipantStatus;

	readonly participantType: EKParticipantType;

	/**
	 * @since 4.0
	 */
	ABRecordWithAddressBook(addressBook: any): any | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

declare const enum EKParticipantRole {

	Unknown = 0,

	Required = 1,

	Optional = 2,

	Chair = 3,

	NonParticipant = 4
}

declare const enum EKParticipantScheduleStatus {

	None = 0,

	Pending = 1,

	Sent = 2,

	Delivered = 3,

	RecipientNotRecognized = 4,

	NoPrivileges = 5,

	DeliveryFailed = 6,

	CannotDeliver = 7,

	RecipientNotAllowed = 8
}

declare const enum EKParticipantStatus {

	Unknown = 0,

	Pending = 1,

	Accepted = 2,

	Declined = 3,

	Tentative = 4,

	Delegated = 5,

	Completed = 6,

	InProcess = 7
}

declare const enum EKParticipantType {

	Unknown = 0,

	Person = 1,

	Room = 2,

	Resource = 3,

	Group = 4
}

/**
 * @since 4.0
 */
declare class EKRecurrenceDayOfWeek extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): EKRecurrenceDayOfWeek; // inherited from NSObject

	static dayOfWeek(dayOfTheWeek: EKWeekday): EKRecurrenceDayOfWeek;

	static dayOfWeekWeekNumber(dayOfTheWeek: EKWeekday, weekNumber: number): EKRecurrenceDayOfWeek;

	static new(): EKRecurrenceDayOfWeek; // inherited from NSObject

	readonly dayOfTheWeek: EKWeekday;

	readonly weekNumber: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { dayOfTheWeek: EKWeekday; weekNumber: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDayOfTheWeekWeekNumber(dayOfTheWeek: EKWeekday, weekNumber: number): this;
}

/**
 * @since 4.0
 */
declare class EKRecurrenceEnd extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): EKRecurrenceEnd; // inherited from NSObject

	static new(): EKRecurrenceEnd; // inherited from NSObject

	static recurrenceEndWithEndDate(endDate: Date): EKRecurrenceEnd;

	static recurrenceEndWithOccurrenceCount(occurrenceCount: number): EKRecurrenceEnd;

	readonly endDate: Date | null;

	readonly occurrenceCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum EKRecurrenceFrequency {

	Daily = 0,

	Weekly = 1,

	Monthly = 2,

	Yearly = 3
}

/**
 * @since 4.0
 */
declare class EKRecurrenceRule extends EKObject implements NSCopying {

	static alloc(): EKRecurrenceRule; // inherited from NSObject

	static new(): EKRecurrenceRule; // inherited from NSObject

	readonly calendarIdentifier: string;

	readonly daysOfTheMonth: NSArray<number> | null;

	readonly daysOfTheWeek: NSArray<EKRecurrenceDayOfWeek> | null;

	readonly daysOfTheYear: NSArray<number> | null;

	readonly firstDayOfTheWeek: number;

	readonly frequency: EKRecurrenceFrequency;

	readonly interval: number;

	readonly monthsOfTheYear: NSArray<number> | null;

	recurrenceEnd: EKRecurrenceEnd | null;

	readonly setPositions: NSArray<number> | null;

	readonly weeksOfTheYear: NSArray<number> | null;

	constructor(o: { recurrenceWithFrequency: EKRecurrenceFrequency; interval: number; daysOfTheWeek: NSArray<EKRecurrenceDayOfWeek> | EKRecurrenceDayOfWeek[] | null; daysOfTheMonth: NSArray<number> | number[] | null; monthsOfTheYear: NSArray<number> | number[] | null; weeksOfTheYear: NSArray<number> | number[] | null; daysOfTheYear: NSArray<number> | number[] | null; setPositions: NSArray<number> | number[] | null; end: EKRecurrenceEnd | null; });

	constructor(o: { recurrenceWithFrequency: EKRecurrenceFrequency; interval: number; end: EKRecurrenceEnd | null; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	initRecurrenceWithFrequencyIntervalDaysOfTheWeekDaysOfTheMonthMonthsOfTheYearWeeksOfTheYearDaysOfTheYearSetPositionsEnd(type: EKRecurrenceFrequency, interval: number, days: NSArray<EKRecurrenceDayOfWeek> | EKRecurrenceDayOfWeek[] | null, monthDays: NSArray<number> | number[] | null, months: NSArray<number> | number[] | null, weeksOfTheYear: NSArray<number> | number[] | null, daysOfTheYear: NSArray<number> | number[] | null, setPositions: NSArray<number> | number[] | null, end: EKRecurrenceEnd | null): this;

	initRecurrenceWithFrequencyIntervalEnd(type: EKRecurrenceFrequency, interval: number, end: EKRecurrenceEnd | null): this;
}

/**
 * @since 6.0
 */
declare class EKReminder extends EKCalendarItem {

	static alloc(): EKReminder; // inherited from NSObject

	static new(): EKReminder; // inherited from NSObject

	static reminderWithEventStore(eventStore: EKEventStore): EKReminder;

	completed: boolean;

	completionDate: Date | null;

	dueDateComponents: NSDateComponents | null;

	priority: number;

	startDateComponents: NSDateComponents | null;
}

declare const enum EKReminderPriority {

	None = 0,

	High = 1,

	Medium = 5,

	Low = 9
}

/**
 * @since 5.0
 */
declare class EKSource extends EKObject {

	static alloc(): EKSource; // inherited from NSObject

	static new(): EKSource; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	readonly calendars: NSSet<EKCalendar>;

	/**
	 * @since 16.0
	 */
	readonly isDelegate: boolean;

	readonly sourceIdentifier: string;

	readonly sourceType: EKSourceType;

	readonly title: string;

	/**
	 * @since 6.0
	 */
	calendarsForEntityType(entityType: EKEntityType): NSSet<EKCalendar>;
}

declare const enum EKSourceType {

	Local = 0,

	Exchange = 1,

	CalDAV = 2,

	MobileMe = 3,

	Subscribed = 4,

	Birthdays = 5
}

declare const enum EKSpan {

	ThisEvent = 0,

	FutureEvents = 1
}

/**
 * @since 6.0
 */
declare class EKStructuredLocation extends EKObject implements NSCopying {

	static alloc(): EKStructuredLocation; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	static locationWithMapItem(mapItem: MKMapItem): EKStructuredLocation;

	static locationWithTitle(title: string): EKStructuredLocation;

	static new(): EKStructuredLocation; // inherited from NSObject

	geoLocation: CLLocation | null;

	radius: number;

	title: string | null;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 15.0
 */
declare class EKVirtualConferenceDescriptor extends NSObject {

	static alloc(): EKVirtualConferenceDescriptor; // inherited from NSObject

	static new(): EKVirtualConferenceDescriptor; // inherited from NSObject

	readonly URLDescriptors: NSArray<EKVirtualConferenceURLDescriptor>;

	readonly conferenceDetails: string | null;

	readonly title: string | null;

	constructor(o: { title: string | null; URLDescriptors: NSArray<EKVirtualConferenceURLDescriptor> | EKVirtualConferenceURLDescriptor[]; conferenceDetails: string | null; });

	initWithTitleURLDescriptorsConferenceDetails(title: string | null, URLDescriptors: NSArray<EKVirtualConferenceURLDescriptor> | EKVirtualConferenceURLDescriptor[], conferenceDetails: string | null): this;
}

/**
 * @since 15.0
 */
declare class EKVirtualConferenceProvider extends NSObject implements NSExtensionRequestHandling {

	static alloc(): EKVirtualConferenceProvider; // inherited from NSObject

	static new(): EKVirtualConferenceProvider; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	fetchAvailableRoomTypesWithCompletionHandler(completionHandler: (p1: NSArray<EKVirtualConferenceRoomTypeDescriptor> | null, p2: NSError | null) => void): void;

	fetchVirtualConferenceForIdentifierCompletionHandler(identifier: string, completionHandler: (p1: EKVirtualConferenceDescriptor | null, p2: NSError | null) => void): void;

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
declare class EKVirtualConferenceRoomTypeDescriptor extends NSObject {

	static alloc(): EKVirtualConferenceRoomTypeDescriptor; // inherited from NSObject

	static new(): EKVirtualConferenceRoomTypeDescriptor; // inherited from NSObject

	readonly identifier: string;

	readonly title: string;

	constructor(o: { title: string; identifier: string; });

	initWithTitleIdentifier(title: string, identifier: string): this;
}

/**
 * @since 15.0
 */
declare class EKVirtualConferenceURLDescriptor extends NSObject {

	static alloc(): EKVirtualConferenceURLDescriptor; // inherited from NSObject

	static new(): EKVirtualConferenceURLDescriptor; // inherited from NSObject

	readonly URL: NSURL;

	readonly title: string | null;

	constructor(o: { title: string | null; URL: NSURL; });

	initWithTitleURL(title: string | null, URL: NSURL): this;
}

declare const enum EKWeekday {

	WeekdaySunday = 1,

	WeekdayMonday = 2,

	WeekdayTuesday = 3,

	WeekdayWednesday = 4,

	WeekdayThursday = 5,

	WeekdayFriday = 6,

	WeekdaySaturday = 7,

	Sunday = 1,

	Monday = 2,

	Tuesday = 3,

	Wednesday = 4,

	Thursday = 5,

	Friday = 6,

	Saturday = 7
}
