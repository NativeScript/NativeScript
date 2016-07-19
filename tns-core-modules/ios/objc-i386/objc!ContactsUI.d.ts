
interface CNContactPickerDelegate extends NSObjectProtocol {

	contactPickerDidCancel?(picker: CNContactPickerViewController): void;

	contactPickerDidSelectContact?(picker: CNContactPickerViewController, contact: CNContact): void;

	contactPickerDidSelectContactProperties?(picker: CNContactPickerViewController, contactProperties: NSArray<CNContactProperty>): void;

	contactPickerDidSelectContactProperty?(picker: CNContactPickerViewController, contactProperty: CNContactProperty): void;

	contactPickerDidSelectContacts?(picker: CNContactPickerViewController, contacts: NSArray<CNContact>): void;
}
declare var CNContactPickerDelegate: {

	prototype: CNContactPickerDelegate;
};

declare class CNContactPickerViewController extends UIViewController {

	delegate: CNContactPickerDelegate;

	displayedPropertyKeys: NSArray<string>;

	predicateForEnablingContact: NSPredicate;

	predicateForSelectionOfContact: NSPredicate;

	predicateForSelectionOfProperty: NSPredicate;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): CNContactPickerViewController; // inherited from NSObjectProtocol
}

declare class CNContactViewController extends UIViewController {

	static descriptorForRequiredKeys(): CNKeyDescriptor;

	static viewControllerForContact(contact: CNContact): CNContactViewController;

	static viewControllerForNewContact(contact: CNContact): CNContactViewController;

	static viewControllerForUnknownContact(contact: CNContact): CNContactViewController;

	allowsActions: boolean;

	allowsEditing: boolean;

	alternateName: string;

	/* readonly */ contact: CNContact;

	contactStore: CNContactStore;

	delegate: CNContactViewControllerDelegate;

	displayedPropertyKeys: NSArray<any>;

	message: string;

	parentContainer: CNContainer;

	parentGroup: CNGroup;

	shouldShowLinkedContacts: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	highlightPropertyWithKeyIdentifier(key: string, identifier: string): void;

	self(): CNContactViewController; // inherited from NSObjectProtocol
}

interface CNContactViewControllerDelegate extends NSObjectProtocol {

	contactViewControllerDidCompleteWithContact?(viewController: CNContactViewController, contact: CNContact): void;

	contactViewControllerShouldPerformDefaultActionForContactProperty?(viewController: CNContactViewController, property: CNContactProperty): boolean;
}
declare var CNContactViewControllerDelegate: {

	prototype: CNContactViewControllerDelegate;
};
