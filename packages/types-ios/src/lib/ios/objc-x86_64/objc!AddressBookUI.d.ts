
declare function ABCreateStringWithAddressDictionary(address: NSDictionary<any, any>, addCountryName: boolean): string;

declare class ABNewPersonViewController extends UIViewController {

	static alloc(): ABNewPersonViewController; // inherited from NSObject

	static new(): ABNewPersonViewController; // inherited from NSObject

	addressBook: any;

	displayedPerson: any;

	newPersonViewDelegate: ABNewPersonViewControllerDelegate;

	parentGroup: any;
}

interface ABNewPersonViewControllerDelegate extends NSObjectProtocol {

	newPersonViewControllerDidCompleteWithNewPerson(newPersonView: ABNewPersonViewController, person: any): void;
}
declare var ABNewPersonViewControllerDelegate: {

	prototype: ABNewPersonViewControllerDelegate;
};

declare class ABPeoplePickerNavigationController extends UINavigationController {

	static alloc(): ABPeoplePickerNavigationController; // inherited from NSObject

	static new(): ABPeoplePickerNavigationController; // inherited from NSObject

	addressBook: any;

	displayedProperties: NSArray<number>;

	peoplePickerDelegate: ABPeoplePickerNavigationControllerDelegate;

	predicateForEnablingPerson: NSPredicate;

	predicateForSelectionOfPerson: NSPredicate;

	predicateForSelectionOfProperty: NSPredicate;
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

	static alloc(): ABPersonViewController; // inherited from NSObject

	static new(): ABPersonViewController; // inherited from NSObject

	static viewControllerWithRestorationIdentifierPathCoder(identifierComponents: NSArray<string> | string[], coder: NSCoder): UIViewController;

	addressBook: any;

	allowsActions: boolean;

	allowsEditing: boolean;

	displayedPerson: any;

	displayedProperties: NSArray<number>;

	personViewDelegate: ABPersonViewControllerDelegate;

	shouldShowLinkedPeople: boolean;

	setHighlightedItemForPropertyWithIdentifier(property: number, identifier: number): void;
}

interface ABPersonViewControllerDelegate extends NSObjectProtocol {

	personViewControllerShouldPerformDefaultActionForPersonPropertyIdentifier(personViewController: ABPersonViewController, person: any, property: number, identifier: number): boolean;
}
declare var ABPersonViewControllerDelegate: {

	prototype: ABPersonViewControllerDelegate;
};

declare class ABUnknownPersonViewController extends UIViewController {

	static alloc(): ABUnknownPersonViewController; // inherited from NSObject

	static new(): ABUnknownPersonViewController; // inherited from NSObject

	addressBook: any;

	allowsActions: boolean;

	allowsAddingToAddressBook: boolean;

	alternateName: string;

	displayedPerson: any;

	message: string;

	unknownPersonViewDelegate: ABUnknownPersonViewControllerDelegate;
}

interface ABUnknownPersonViewControllerDelegate extends NSObjectProtocol {

	unknownPersonViewControllerDidResolveToPerson(unknownCardViewController: ABUnknownPersonViewController, person: any): void;

	unknownPersonViewControllerShouldPerformDefaultActionForPersonPropertyIdentifier?(personViewController: ABUnknownPersonViewController, person: any, property: number, identifier: number): boolean;
}
declare var ABUnknownPersonViewControllerDelegate: {

	prototype: ABUnknownPersonViewControllerDelegate;
};
