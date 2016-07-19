
declare class EKAlarm extends EKObject implements NSCopying {

	static alarmWithAbsoluteDate(date: Date): EKAlarm;

	static alarmWithRelativeOffset(offset: number): EKAlarm;

	absoluteDate: Date;

	proximity: EKAlarmProximity;

	relativeOffset: number;

	structuredLocation: EKStructuredLocation;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying
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

declare const enum EKAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare class EKCalendar extends EKObject {

	static calendarForEntityTypeEventStore(entityType: EKEntityType, eventStore: EKEventStore): EKCalendar;

	static calendarWithEventStore(eventStore: EKEventStore): EKCalendar;

	CGColor: any;

	/* readonly */ allowedEntityTypes: EKEntityMask;

	/* readonly */ allowsContentModifications: boolean;

	/* readonly */ calendarIdentifier: string;

	/* readonly */ immutable: boolean;

	source: EKSource;

	/* readonly */ subscribed: boolean;

	/* readonly */ supportedEventAvailabilities: EKCalendarEventAvailabilityMask;

	title: string;

	/* readonly */ type: EKCalendarType;
}

declare const enum EKCalendarEventAvailabilityMask {

	None = 0,

	Busy = 1,

	Free = 2,

	Tentative = 4,

	Unavailable = 8
}

declare class EKCalendarItem extends EKObject {

	URL: NSURL;

	/* readonly */ UUID: string;

	alarms: NSArray<EKAlarm>;

	/* readonly */ attendees: NSArray<EKParticipant>;

	calendar: EKCalendar;

	/* readonly */ calendarItemExternalIdentifier: string;

	/* readonly */ calendarItemIdentifier: string;

	/* readonly */ creationDate: Date;

	/* readonly */ hasAlarms: boolean;

	/* readonly */ hasAttendees: boolean;

	/* readonly */ hasNotes: boolean;

	/* readonly */ hasRecurrenceRules: boolean;

	/* readonly */ lastModifiedDate: Date;

	location: string;

	notes: string;

	recurrenceRules: NSArray<EKRecurrenceRule>;

	timeZone: NSTimeZone;

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

	Last = 31
}

declare var EKErrorDomain: string;

declare class EKEvent extends EKCalendarItem {

	static eventWithEventStore(eventStore: EKEventStore): EKEvent;

	allDay: boolean;

	availability: EKEventAvailability;

	/* readonly */ birthdayContactIdentifier: string;

	/* readonly */ birthdayPersonID: number;

	endDate: Date;

	/* readonly */ eventIdentifier: string;

	/* readonly */ isDetached: boolean;

	/* readonly */ occurrenceDate: Date;

	/* readonly */ organizer: EKParticipant;

	startDate: Date;

	/* readonly */ status: EKEventStatus;

	structuredLocation: EKStructuredLocation;

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

declare class EKEventStore extends NSObject {

	static alloc(): EKEventStore; // inherited from NSObject

	static authorizationStatusForEntityType(entityType: EKEntityType): EKAuthorizationStatus;

	static new(): EKEventStore; // inherited from NSObject

	/* readonly */ calendars: NSArray<EKCalendar>;

	/* readonly */ defaultCalendarForNewEvents: EKCalendar;

	/* readonly */ eventStoreIdentifier: string;

	/* readonly */ sources: NSArray<EKSource>;

	constructor(); // inherited from NSObject

	calendarItemWithIdentifier(identifier: string): EKCalendarItem;

	calendarItemsWithExternalIdentifier(externalIdentifier: string): NSArray<EKCalendarItem>;

	calendarWithIdentifier(identifier: string): EKCalendar;

	calendarsForEntityType(entityType: EKEntityType): NSArray<EKCalendar>;

	cancelFetchRequest(fetchIdentifier: any): void;

	commit(): boolean;

	defaultCalendarForNewReminders(): EKCalendar;

	enumerateEventsMatchingPredicateUsingBlock(predicate: NSPredicate, block: (p1: EKEvent, p2: interop.Reference<boolean>) => void): void;

	eventWithIdentifier(identifier: string): EKEvent;

	eventsMatchingPredicate(predicate: NSPredicate): NSArray<EKEvent>;

	fetchRemindersMatchingPredicateCompletion(predicate: NSPredicate, completion: (p1: NSArray<EKReminder>) => void): any;

	predicateForCompletedRemindersWithCompletionDateStartingEndingCalendars(startDate: Date, endDate: Date, calendars: NSArray<EKCalendar>): NSPredicate;

	predicateForEventsWithStartDateEndDateCalendars(startDate: Date, endDate: Date, calendars: NSArray<EKCalendar>): NSPredicate;

	predicateForIncompleteRemindersWithDueDateStartingEndingCalendars(startDate: Date, endDate: Date, calendars: NSArray<EKCalendar>): NSPredicate;

	predicateForRemindersInCalendars(calendars: NSArray<EKCalendar>): NSPredicate;

	refreshSourcesIfNecessary(): void;

	removeCalendarCommitError(calendar: EKCalendar, commit: boolean): boolean;

	removeEventSpanCommitError(event: EKEvent, span: EKSpan, commit: boolean): boolean;

	removeEventSpanError(event: EKEvent, span: EKSpan): boolean;

	removeReminderCommitError(reminder: EKReminder, commit: boolean): boolean;

	requestAccessToEntityTypeCompletion(entityType: EKEntityType, completion: (p1: boolean, p2: NSError) => void): void;

	reset(): void;

	saveCalendarCommitError(calendar: EKCalendar, commit: boolean): boolean;

	saveEventSpanCommitError(event: EKEvent, span: EKSpan, commit: boolean): boolean;

	saveEventSpanError(event: EKEvent, span: EKSpan): boolean;

	saveReminderCommitError(reminder: EKReminder, commit: boolean): boolean;

	self(): EKEventStore; // inherited from NSObjectProtocol

	sourceWithIdentifier(identifier: string): EKSource;
}

declare var EKEventStoreChangedNotification: string;

declare class EKObject extends NSObject {

	static alloc(): EKObject; // inherited from NSObject

	static new(): EKObject; // inherited from NSObject

	/* readonly */ hasChanges: boolean;

	/* readonly */ new: boolean;

	constructor(); // inherited from NSObject

	refresh(): boolean;

	reset(): void;

	rollback(): void;

	self(): EKObject; // inherited from NSObjectProtocol
}

declare class EKParticipant extends EKObject implements NSCopying {

	/* readonly */ URL: NSURL;

	/* readonly */ contactPredicate: NSPredicate;

	/* readonly */ currentUser: boolean;

	/* readonly */ name: string;

	/* readonly */ participantRole: EKParticipantRole;

	/* readonly */ participantStatus: EKParticipantStatus;

	/* readonly */ participantType: EKParticipantType;

	ABRecordWithAddressBook(addressBook: any): any;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying
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

declare class EKRecurrenceDayOfWeek extends NSObject implements NSCopying {

	static alloc(): EKRecurrenceDayOfWeek; // inherited from NSObject

	static dayOfWeek(dayOfTheWeek: EKWeekday): EKRecurrenceDayOfWeek;

	static dayOfWeekWeekNumber(dayOfTheWeek: EKWeekday, weekNumber: number): EKRecurrenceDayOfWeek;

	static new(): EKRecurrenceDayOfWeek; // inherited from NSObject

	/* readonly */ dayOfTheWeek: EKWeekday;

	/* readonly */ weekNumber: number;

	constructor(); // inherited from NSObject

	constructor(o: { dayOfTheWeek: EKWeekday; weekNumber: number; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): EKRecurrenceDayOfWeek; // inherited from NSObjectProtocol
}

declare class EKRecurrenceEnd extends NSObject implements NSCopying {

	static alloc(): EKRecurrenceEnd; // inherited from NSObject

	static new(): EKRecurrenceEnd; // inherited from NSObject

	static recurrenceEndWithEndDate(endDate: Date): EKRecurrenceEnd;

	static recurrenceEndWithOccurrenceCount(occurrenceCount: number): EKRecurrenceEnd;

	/* readonly */ endDate: Date;

	/* readonly */ occurrenceCount: number;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): EKRecurrenceEnd; // inherited from NSObjectProtocol
}

declare const enum EKRecurrenceFrequency {

	Daily = 0,

	Weekly = 1,

	Monthly = 2,

	Yearly = 3
}

declare class EKRecurrenceRule extends EKObject implements NSCopying {

	/* readonly */ calendarIdentifier: string;

	/* readonly */ daysOfTheMonth: NSArray<number>;

	/* readonly */ daysOfTheWeek: NSArray<EKRecurrenceDayOfWeek>;

	/* readonly */ daysOfTheYear: NSArray<number>;

	/* readonly */ firstDayOfTheWeek: number;

	/* readonly */ frequency: EKRecurrenceFrequency;

	/* readonly */ interval: number;

	/* readonly */ monthsOfTheYear: NSArray<number>;

	recurrenceEnd: EKRecurrenceEnd;

	/* readonly */ setPositions: NSArray<number>;

	/* readonly */ weeksOfTheYear: NSArray<number>;

	constructor(o: { recurrenceWithFrequency: EKRecurrenceFrequency; interval: number; daysOfTheWeek: NSArray<EKRecurrenceDayOfWeek>; daysOfTheMonth: NSArray<number>; monthsOfTheYear: NSArray<number>; weeksOfTheYear: NSArray<number>; daysOfTheYear: NSArray<number>; setPositions: NSArray<number>; end: EKRecurrenceEnd; });

	constructor(o: { recurrenceWithFrequency: EKRecurrenceFrequency; interval: number; end: EKRecurrenceEnd; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying
}

declare class EKReminder extends EKCalendarItem {

	static reminderWithEventStore(eventStore: EKEventStore): EKReminder;

	completed: boolean;

	completionDate: Date;

	dueDateComponents: NSDateComponents;

	priority: number;

	startDateComponents: NSDateComponents;
}

declare const enum EKReminderPriority {

	None = 0,

	High = 1,

	Medium = 5,

	Low = 9
}

declare class EKSource extends EKObject {

	/* readonly */ calendars: NSSet<EKCalendar>;

	/* readonly */ sourceIdentifier: string;

	/* readonly */ sourceType: EKSourceType;

	/* readonly */ title: string;

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

declare class EKStructuredLocation extends EKObject implements NSCopying {

	static locationWithMapItem(mapItem: MKMapItem): EKStructuredLocation;

	static locationWithTitle(title: string): EKStructuredLocation;

	geoLocation: CLLocation;

	radius: number;

	title: string;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying
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
