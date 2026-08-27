
/**
 * @since 9.0
 */
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

/**
 * @since 9.0
 */
declare class CNContactPickerViewController extends UIViewController {

	static alloc(): CNContactPickerViewController; // inherited from NSObject

	static new(): CNContactPickerViewController; // inherited from NSObject

	delegate: CNContactPickerDelegate | null;

	displayedPropertyKeys: NSArray<string> | null;

	predicateForEnablingContact: NSPredicate | null;

	predicateForSelectionOfContact: NSPredicate | null;

	predicateForSelectionOfProperty: NSPredicate | null;
}

/**
 * @since 9.0
 */
declare class CNContactViewController extends UIViewController {

	static alloc(): CNContactViewController; // inherited from NSObject

	static descriptorForRequiredKeys(): CNKeyDescriptor;

	static new(): CNContactViewController; // inherited from NSObject

	static viewControllerForContact(contact: CNContact): CNContactViewController;

	static viewControllerForNewContact(contact: CNContact | null): CNContactViewController;

	static viewControllerForUnknownContact(contact: CNContact): CNContactViewController;

	allowsActions: boolean;

	allowsEditing: boolean;

	alternateName: string | null;

	readonly contact: CNContact;

	contactStore: CNContactStore | null;

	delegate: CNContactViewControllerDelegate | null;

	displayedPropertyKeys: NSArray<any> | null;

	message: string | null;

	parentContainer: CNContainer | null;

	parentGroup: CNGroup | null;

	shouldShowLinkedContacts: boolean;

	highlightPropertyWithKeyIdentifier(key: string, identifier: string | null): void;
}

/**
 * @since 9.0
 */
interface CNContactViewControllerDelegate extends NSObjectProtocol {

	contactViewControllerDidCompleteWithContact?(viewController: CNContactViewController, contact: CNContact | null): void;

	contactViewControllerShouldPerformDefaultActionForContactProperty?(viewController: CNContactViewController, property: CNContactProperty): boolean;
}
declare var CNContactViewControllerDelegate: {

	prototype: CNContactViewControllerDelegate;
};
