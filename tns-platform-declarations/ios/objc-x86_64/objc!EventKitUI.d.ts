
declare class EKCalendarChooser extends UIViewController {

	static alloc(): EKCalendarChooser; // inherited from NSObject

	static new(): EKCalendarChooser; // inherited from NSObject

	delegate: EKCalendarChooserDelegate;

	selectedCalendars: NSSet<EKCalendar>;

	readonly selectionStyle: EKCalendarChooserSelectionStyle;

	showsCancelButton: boolean;

	showsDoneButton: boolean;

	constructor(o: { selectionStyle: EKCalendarChooserSelectionStyle; displayStyle: EKCalendarChooserDisplayStyle; entityType: EKEntityType; eventStore: EKEventStore; });

	constructor(o: { selectionStyle: EKCalendarChooserSelectionStyle; displayStyle: EKCalendarChooserDisplayStyle; eventStore: EKEventStore; });

	initWithSelectionStyleDisplayStyleEntityTypeEventStore(style: EKCalendarChooserSelectionStyle, displayStyle: EKCalendarChooserDisplayStyle, entityType: EKEntityType, eventStore: EKEventStore): this;

	initWithSelectionStyleDisplayStyleEventStore(selectionStyle: EKCalendarChooserSelectionStyle, displayStyle: EKCalendarChooserDisplayStyle, eventStore: EKEventStore): this;
}

interface EKCalendarChooserDelegate extends NSObjectProtocol {

	calendarChooserDidCancel?(calendarChooser: EKCalendarChooser): void;

	calendarChooserDidFinish?(calendarChooser: EKCalendarChooser): void;

	calendarChooserSelectionDidChange?(calendarChooser: EKCalendarChooser): void;
}
declare var EKCalendarChooserDelegate: {

	prototype: EKCalendarChooserDelegate;
};

declare const enum EKCalendarChooserDisplayStyle {

	AllCalendars = 0,

	WritableCalendarsOnly = 1
}

declare const enum EKCalendarChooserSelectionStyle {

	Single = 0,

	Multiple = 1
}

declare const enum EKEventEditViewAction {

	Canceled = 0,

	Saved = 1,

	Deleted = 2,

	Cancelled = 0
}

declare class EKEventEditViewController extends UINavigationController {

	static alloc(): EKEventEditViewController; // inherited from NSObject

	static new(): EKEventEditViewController; // inherited from NSObject

	editViewDelegate: EKEventEditViewDelegate;

	event: EKEvent;

	eventStore: EKEventStore;

	cancelEditing(): void;
}

interface EKEventEditViewDelegate extends NSObjectProtocol {

	eventEditViewControllerDefaultCalendarForNewEvents?(controller: EKEventEditViewController): EKCalendar;

	eventEditViewControllerDidCompleteWithAction(controller: EKEventEditViewController, action: EKEventEditViewAction): void;
}
declare var EKEventEditViewDelegate: {

	prototype: EKEventEditViewDelegate;
};

declare const enum EKEventViewAction {

	Done = 0,

	Responded = 1,

	Deleted = 2
}

declare class EKEventViewController extends UIViewController {

	static alloc(): EKEventViewController; // inherited from NSObject

	static new(): EKEventViewController; // inherited from NSObject

	allowsCalendarPreview: boolean;

	allowsEditing: boolean;

	delegate: EKEventViewDelegate;

	event: EKEvent;
}

interface EKEventViewDelegate extends NSObjectProtocol {

	eventViewControllerDidCompleteWithAction(controller: EKEventViewController, action: EKEventViewAction): void;
}
declare var EKEventViewDelegate: {

	prototype: EKEventViewDelegate;
};

declare function EventKitUIBundle(): NSBundle;
