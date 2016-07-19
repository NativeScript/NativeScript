
declare function ABCreateStringWithAddressDictionary(address: NSDictionary<any, any>, addCountryName: boolean): string;

declare class ABNewPersonViewController extends UIViewController {

	addressBook: any;

	displayedPerson: any;

	newPersonViewDelegate: ABNewPersonViewControllerDelegate;

	parentGroup: any;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): ABNewPersonViewController; // inherited from NSObjectProtocol
}

interface ABNewPersonViewControllerDelegate extends NSObjectProtocol {

	newPersonViewControllerDidCompleteWithNewPerson(newPersonView: ABNewPersonViewController, person: any): void;
}
declare var ABNewPersonViewControllerDelegate: {

	prototype: ABNewPersonViewControllerDelegate;
};

declare class ABPeoplePickerNavigationController extends UINavigationController {

	addressBook: any;

	displayedProperties: NSArray<number>;

	peoplePickerDelegate: ABPeoplePickerNavigationControllerDelegate;

	predicateForEnablingPerson: NSPredicate;

	predicateForSelectionOfPerson: NSPredicate;

	predicateForSelectionOfProperty: NSPredicate;

	constructor(o: { navigationBarClass: typeof NSObject; toolbarClass: typeof NSObject; }); // inherited from UINavigationController

	constructor(o: { rootViewController: UIViewController; }); // inherited from UINavigationController
}

interface ABPeoplePickerNavigationControllerDelegate extends NSObjectProtocol {

	peoplePickerNavigationControllerDidCancel?(peoplePicker: ABPeoplePickerNavigationController): void;

	peoplePickerNavigationControllerDidSelectPerson?(peoplePicker: ABPeoplePickerNavigationController, person: any): void;

	peoplePickerNavigationControllerDidSelectPersonPropertyIdentifier?(peoplePicker: ABPeoplePickerNavigationController, person: any, property: number, identifier: number): void;

	peoplePickerNavigationControllerShouldContinueAfterSelectingPerson?(peoplePicker: ABPeoplePickerNavigationController, person: any): boolean;

	peoplePickerNavigationControllerShouldContinueAfterSelectingPersonPropertyIdentifier?(peoplePicker: ABPeoplePickerNavigationController, person: any, property: number, identifier: number): boolean;
}
declare var ABPeoplePickerNavigationControllerDelegate: {

	prototype: ABPeoplePickerNavigationControllerDelegate;
};

declare var ABPersonBirthdayProperty: string;

declare var ABPersonDatesProperty: string;

declare var ABPersonDepartmentNameProperty: string;

declare var ABPersonEmailAddressesProperty: string;

declare var ABPersonFamilyNameProperty: string;

declare var ABPersonGivenNameProperty: string;

declare var ABPersonInstantMessageAddressesProperty: string;

declare var ABPersonJobTitleProperty: string;

declare var ABPersonMiddleNameProperty: string;

declare var ABPersonNamePrefixProperty: string;

declare var ABPersonNameSuffixProperty: string;

declare var ABPersonNicknameProperty: string;

declare var ABPersonNoteProperty: string;

declare var ABPersonOrganizationNameProperty: string;

declare var ABPersonPhoneNumbersProperty: string;

declare var ABPersonPhoneticFamilyNameProperty: string;

declare var ABPersonPhoneticGivenNameProperty: string;

declare var ABPersonPhoneticMiddleNameProperty: string;

declare var ABPersonPostalAddressesProperty: string;

declare var ABPersonPreviousFamilyNameProperty: string;

declare var ABPersonRelatedNamesProperty: string;

declare var ABPersonSocialProfilesProperty: string;

declare var ABPersonUrlAddressesProperty: string;

declare class ABPersonViewController extends UIViewController implements UIViewControllerRestoration {

	static viewControllerWithRestorationIdentifierPathCoder(identifierComponents: NSArray<any>, coder: NSCoder): UIViewController; // inherited from UIViewControllerRestoration

	addressBook: any;

	allowsActions: boolean;

	allowsEditing: boolean;

	displayedPerson: any;

	displayedProperties: NSArray<number>;

	personViewDelegate: ABPersonViewControllerDelegate;

	shouldShowLinkedPeople: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): ABPersonViewController; // inherited from NSObjectProtocol

	setHighlightedItemForPropertyWithIdentifier(property: number, identifier: number): void;
}

interface ABPersonViewControllerDelegate extends NSObjectProtocol {

	personViewControllerShouldPerformDefaultActionForPersonPropertyIdentifier(personViewController: ABPersonViewController, person: any, property: number, identifier: number): boolean;
}
declare var ABPersonViewControllerDelegate: {

	prototype: ABPersonViewControllerDelegate;
};

declare class ABUnknownPersonViewController extends UIViewController {

	addressBook: any;

	allowsActions: boolean;

	allowsAddingToAddressBook: boolean;

	alternateName: string;

	displayedPerson: any;

	message: string;

	unknownPersonViewDelegate: ABUnknownPersonViewControllerDelegate;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { nibName: string; bundle: NSBundle; }); // inherited from UIViewController

	self(): ABUnknownPersonViewController; // inherited from NSObjectProtocol
}

interface ABUnknownPersonViewControllerDelegate extends NSObjectProtocol {

	unknownPersonViewControllerDidResolveToPerson(unknownCardViewController: ABUnknownPersonViewController, person: any): void;

	unknownPersonViewControllerShouldPerformDefaultActionForPersonPropertyIdentifier?(personViewController: ABUnknownPersonViewController, person: any, property: number, identifier: number): boolean;
}
declare var ABUnknownPersonViewControllerDelegate: {

	prototype: ABUnknownPersonViewControllerDelegate;
};
