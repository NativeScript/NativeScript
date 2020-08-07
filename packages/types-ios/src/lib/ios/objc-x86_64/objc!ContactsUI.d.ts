
interface CNContactPickerDelegate extends NSObjectProtocol {

	contactPickerDidCancel?(picker: CNContactPickerViewController): void;

	contactPickerDidSelectContact?(picker: CNContactPickerViewController, contact: CNContact): void;

	contactPickerDidSelectContactProperties?(picker: CNContactPickerViewController, contactProperties: NSArray<CNContactProperty> | CNContactProperty[]): void;

	contactPickerDidSelectContactProperty?(picker: CNContactPickerViewController, contactProperty: CNContactProperty): void;

	contactPickerDidSelectContacts?(picker: CNContactPickerViewController, contacts: NSArray<CNContact> | CNContact[]): void;
}
declare var CNContactPickerDelegate: {

	prototype: CNContactPickerDelegate;
};

declare class CNContactPickerViewController extends UIViewController {

	static alloc(): CNContactPickerViewController; // inherited from NSObject

	static new(): CNContactPickerViewController; // inherited from NSObject

	delegate: CNContactPickerDelegate;

	displayedPropertyKeys: NSArray<string>;

	predicateForEnablingContact: NSPredicate;

	predicateForSelectionOfContact: NSPredicate;

	predicateForSelectionOfProperty: NSPredicate;
}

declare class CNContactViewController extends UIViewController {

	static alloc(): CNContactViewController; // inherited from NSObject

	static descriptorForRequiredKeys(): CNKeyDescriptor;

	static new(): CNContactViewController; // inherited from NSObject

	static viewControllerForContact(contact: CNContact): CNContactViewController;

	static viewControllerForNewContact(contact: CNContact): CNContactViewController;

	static viewControllerForUnknownContact(contact: CNContact): CNContactViewController;

	allowsActions: boolean;

	allowsEditing: boolean;

	alternateName: string;

	readonly contact: CNContact;

	contactStore: CNContactStore;

	delegate: CNContactViewControllerDelegate;

	displayedPropertyKeys: NSArray<any>;

	message: string;

	parentContainer: CNContainer;

	parentGroup: CNGroup;

	shouldShowLinkedContacts: boolean;

	highlightPropertyWithKeyIdentifier(key: string, identifier: string): void;
}

interface CNContactViewControllerDelegate extends NSObjectProtocol {

	contactViewControllerDidCompleteWithContact?(viewController: CNContactViewController, contact: CNContact): void;

	contactViewControllerShouldPerformDefaultActionForContactProperty?(viewController: CNContactViewController, property: CNContactProperty): boolean;
}
declare var CNContactViewControllerDelegate: {

	prototype: CNContactViewControllerDelegate;
};
