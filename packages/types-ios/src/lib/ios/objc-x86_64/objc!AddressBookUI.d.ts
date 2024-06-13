
/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABCreateStringWithAddressDictionary(address: NSDictionary<any, any>, addCountryName: boolean): string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
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

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare class ABPeoplePickerNavigationController extends UINavigationController {

	static alloc(): ABPeoplePickerNavigationController; // inherited from NSObject

	static new(): ABPeoplePickerNavigationController; // inherited from NSObject

	addressBook: any;

	displayedProperties: NSArray<number>;

	peoplePickerDelegate: ABPeoplePickerNavigationControllerDelegate;

	/**
	 * @since 8.0
	 */
	predicateForEnablingPerson: NSPredicate;

	/**
	 * @since 8.0
	 */
	predicateForSelectionOfPerson: NSPredicate;

	/**
	 * @since 8.0
	 */
	predicateForSelectionOfProperty: NSPredicate;
}

interface ABPeoplePickerNavigationControllerDelegate extends NSObjectProtocol {

	peoplePickerNavigationControllerDidCancel?(peoplePicker: ABPeoplePickerNavigationController): void;

	/**
	 * @since 8.0
	 */
	peoplePickerNavigationControllerDidSelectPerson?(peoplePicker: ABPeoplePickerNavigationController, person: any): void;

	/**
	 * @since 8.0
	 */
	peoplePickerNavigationControllerDidSelectPersonPropertyIdentifier?(peoplePicker: ABPeoplePickerNavigationController, person: any, property: number, identifier: number): void;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	peoplePickerNavigationControllerShouldContinueAfterSelectingPerson?(peoplePicker: ABPeoplePickerNavigationController, person: any): boolean;

	/**
	 * @since 2.0
	 * @deprecated 8.0
	 */
	peoplePickerNavigationControllerShouldContinueAfterSelectingPersonPropertyIdentifier?(peoplePicker: ABPeoplePickerNavigationController, person: any, property: number, identifier: number): boolean;
}
declare var ABPeoplePickerNavigationControllerDelegate: {

	prototype: ABPeoplePickerNavigationControllerDelegate;
};

/**
 * @since 8.0
 */
declare var ABPersonBirthdayProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonDatesProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonDepartmentNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonEmailAddressesProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonFamilyNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonGivenNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonInstantMessageAddressesProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonJobTitleProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonMiddleNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonNamePrefixProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonNameSuffixProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonNicknameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonNoteProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonOrganizationNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonPhoneNumbersProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonPhoneticFamilyNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonPhoneticGivenNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonPhoneticMiddleNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonPostalAddressesProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonPreviousFamilyNameProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonRelatedNamesProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonSocialProfilesProperty: string;

/**
 * @since 8.0
 */
declare var ABPersonUrlAddressesProperty: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare class ABPersonViewController extends UIViewController implements UIViewControllerRestoration {

	static alloc(): ABPersonViewController; // inherited from NSObject

	static new(): ABPersonViewController; // inherited from NSObject

	static viewControllerWithRestorationIdentifierPathCoder(identifierComponents: NSArray<string> | string[], coder: NSCoder): UIViewController;

	addressBook: any;

	/**
	 * @since 4.0
	 */
	allowsActions: boolean;

	allowsEditing: boolean;

	displayedPerson: any;

	displayedProperties: NSArray<number>;

	personViewDelegate: ABPersonViewControllerDelegate;

	/**
	 * @since 4.0
	 */
	shouldShowLinkedPeople: boolean;

	setHighlightedItemForPropertyWithIdentifier(property: number, identifier: number): void;
}

interface ABPersonViewControllerDelegate extends NSObjectProtocol {

	personViewControllerShouldPerformDefaultActionForPersonPropertyIdentifier(personViewController: ABPersonViewController, person: any, property: number, identifier: number): boolean;
}
declare var ABPersonViewControllerDelegate: {

	prototype: ABPersonViewControllerDelegate;
};

/**
 * @since 2.0
 * @deprecated 9.0
 */
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

	/**
	 * @since 3.0
	 */
	unknownPersonViewControllerShouldPerformDefaultActionForPersonPropertyIdentifier?(personViewController: ABUnknownPersonViewController, person: any, property: number, identifier: number): boolean;
}
declare var ABUnknownPersonViewControllerDelegate: {

	prototype: ABUnknownPersonViewControllerDelegate;
};
