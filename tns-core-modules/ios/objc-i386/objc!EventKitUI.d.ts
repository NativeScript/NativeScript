
declare class EKCalendarChooser extends UIViewController {

	delegate: EKCalendarChooserDelegate;

	selectedCalendars: NSSet<EKCalendar>;

	/* readonly */ selectionStyle: EKCalendarChooserSelectionStyle;

	showsCancelButton: boolean;

	showsDoneButton: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	constructor(o: { selectionStyle: EKCalendarChooserSelectionStyle; displayStyle: EKCalendarChooserDisplayStyle; entityType: EKEntityType; eventStore: EKEventStore; });

	constructor(o: { selectionStyle: EKCalendarChooserSelectionStyle; displayStyle: EKCalendarChooserDisplayStyle; eventStore: EKEventStore; });

	self(): EKCalendarChooser; // inherited from NSObjectProtocol
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

	editViewDelegate: EKEventEditViewDelegate;

	event: EKEvent;

	eventStore: EKEventStore;

	constructor(o: { navigationBarClass: typeof NSObject; toolbarClass: typeof NSObject; }); // inherited from UINavigationController

	constructor(o: { rootViewController: UIViewController; }); // inherited from UINavigationController

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

	allowsCalendarPreview: boolean;

	allowsEditing: boolean;

	delegate: EKEventViewDelegate;

	event: EKEvent;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): EKEventViewController; // inherited from NSObjectProtocol
}

interface EKEventViewDelegate extends NSObjectProtocol {

	eventViewControllerDidCompleteWithAction(controller: EKEventViewController, action: EKEventViewAction): void;
}
declare var EKEventViewDelegate: {

	prototype: EKEventViewDelegate;
};
