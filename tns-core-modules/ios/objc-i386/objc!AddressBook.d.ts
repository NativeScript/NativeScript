
declare function ABAddressBookAddRecord(addressBook: any, record: any, error: interop.Reference<NSError>): boolean;

declare function ABAddressBookCopyArrayOfAllGroups(addressBook: any): interop.Unmanaged<NSArray<any>>;

declare function ABAddressBookCopyArrayOfAllGroupsInSource(addressBook: any, source: any): interop.Unmanaged<NSArray<any>>;

declare function ABAddressBookCopyArrayOfAllPeople(addressBook: any): interop.Unmanaged<NSArray<any>>;

declare function ABAddressBookCopyArrayOfAllPeopleInSource(addressBook: any, source: any): interop.Unmanaged<NSArray<any>>;

declare function ABAddressBookCopyArrayOfAllPeopleInSourceWithSortOrdering(addressBook: any, source: any, sortOrdering: number): interop.Unmanaged<NSArray<any>>;

declare function ABAddressBookCopyArrayOfAllSources(addressBook: any): interop.Unmanaged<NSArray<any>>;

declare function ABAddressBookCopyDefaultSource(addressBook: any): interop.Unmanaged<any>;

declare function ABAddressBookCopyLocalizedLabel(label: string): interop.Unmanaged<string>;

declare function ABAddressBookCopyPeopleWithName(addressBook: any, name: string): interop.Unmanaged<NSArray<any>>;

declare function ABAddressBookCreate(): interop.Unmanaged<any>;

declare function ABAddressBookCreateWithOptions(options: NSDictionary<any, any>, error: interop.Reference<NSError>): interop.Unmanaged<any>;

declare var ABAddressBookErrorDomain: string;

declare function ABAddressBookGetAuthorizationStatus(): ABAuthorizationStatus;

declare function ABAddressBookGetGroupCount(addressBook: any): number;

declare function ABAddressBookGetGroupWithRecordID(addressBook: any, recordID: number): interop.Unmanaged<any>;

declare function ABAddressBookGetPersonCount(addressBook: any): number;

declare function ABAddressBookGetPersonWithRecordID(addressBook: any, recordID: number): interop.Unmanaged<any>;

declare function ABAddressBookGetSourceWithRecordID(addressBook: any, sourceID: number): interop.Unmanaged<any>;

declare function ABAddressBookHasUnsavedChanges(addressBook: any): boolean;

declare function ABAddressBookRegisterExternalChangeCallback(addressBook: any, callback: interop.FunctionReference<(p1: any, p2: NSDictionary<any, any>, p3: interop.Pointer) => void>, context: interop.Pointer): void;

declare function ABAddressBookRemoveRecord(addressBook: any, record: any, error: interop.Reference<NSError>): boolean;

declare function ABAddressBookRequestAccessWithCompletion(addressBook: any, completion: (p1: boolean, p2: NSError) => void): void;

declare function ABAddressBookRevert(addressBook: any): void;

declare function ABAddressBookSave(addressBook: any, error: interop.Reference<NSError>): boolean;

declare function ABAddressBookUnregisterExternalChangeCallback(addressBook: any, callback: interop.FunctionReference<(p1: any, p2: NSDictionary<any, any>, p3: interop.Pointer) => void>, context: interop.Pointer): void;

declare const enum ABAuthorizationStatus {

	kABAuthorizationStatusNotDetermined = 0,

	kABAuthorizationStatusRestricted = 1,

	kABAuthorizationStatusDenied = 2,

	kABAuthorizationStatusAuthorized = 3
}

declare function ABGroupAddMember(group: any, person: any, error: interop.Reference<NSError>): boolean;

declare function ABGroupCopyArrayOfAllMembers(group: any): interop.Unmanaged<NSArray<any>>;

declare function ABGroupCopyArrayOfAllMembersWithSortOrdering(group: any, sortOrdering: number): interop.Unmanaged<NSArray<any>>;

declare function ABGroupCopySource(group: any): interop.Unmanaged<any>;

declare function ABGroupCreate(): interop.Unmanaged<any>;

declare function ABGroupCreateInSource(source: any): interop.Unmanaged<any>;

declare function ABGroupRemoveMember(group: any, member: any, error: interop.Reference<NSError>): boolean;

declare function ABMultiValueAddValueAndLabel(multiValue: any, value: any, label: string, outIdentifier: interop.Reference<number>): boolean;

declare function ABMultiValueCopyArrayOfAllValues(multiValue: any): interop.Unmanaged<NSArray<any>>;

declare function ABMultiValueCopyLabelAtIndex(multiValue: any, index: number): interop.Unmanaged<string>;

declare function ABMultiValueCopyValueAtIndex(multiValue: any, index: number): interop.Unmanaged<any>;

declare function ABMultiValueCreateMutable(type: number): interop.Unmanaged<any>;

declare function ABMultiValueCreateMutableCopy(multiValue: any): interop.Unmanaged<any>;

declare function ABMultiValueGetCount(multiValue: any): number;

declare function ABMultiValueGetFirstIndexOfValue(multiValue: any, value: any): number;

declare function ABMultiValueGetIdentifierAtIndex(multiValue: any, index: number): number;

declare function ABMultiValueGetIndexForIdentifier(multiValue: any, identifier: number): number;

declare function ABMultiValueGetPropertyType(multiValue: any): number;

declare function ABMultiValueInsertValueAndLabelAtIndex(multiValue: any, value: any, label: string, index: number, outIdentifier: interop.Reference<number>): boolean;

declare function ABMultiValueRemoveValueAndLabelAtIndex(multiValue: any, index: number): boolean;

declare function ABMultiValueReplaceLabelAtIndex(multiValue: any, label: string, index: number): boolean;

declare function ABMultiValueReplaceValueAtIndex(multiValue: any, value: any, index: number): boolean;

declare function ABPersonComparePeopleByName(person1: any, person2: any, ordering: number): CFComparisonResult;

declare function ABPersonCopyArrayOfAllLinkedPeople(person: any): interop.Unmanaged<NSArray<any>>;

declare function ABPersonCopyCompositeNameDelimiterForRecord(record: any): interop.Unmanaged<string>;

declare function ABPersonCopyImageData(person: any): interop.Unmanaged<NSData>;

declare function ABPersonCopyImageDataWithFormat(person: any, format: ABPersonImageFormat): interop.Unmanaged<NSData>;

declare function ABPersonCopyLocalizedPropertyName(property: number): interop.Unmanaged<string>;

declare function ABPersonCopySource(person: any): interop.Unmanaged<any>;

declare function ABPersonCreate(): interop.Unmanaged<any>;

declare function ABPersonCreateInSource(source: any): interop.Unmanaged<any>;

declare function ABPersonCreatePeopleInSourceWithVCardRepresentation(source: any, vCardData: NSData): interop.Unmanaged<NSArray<any>>;

declare function ABPersonCreateVCardRepresentationWithPeople(people: NSArray<any>): interop.Unmanaged<NSData>;

declare function ABPersonGetCompositeNameFormat(): number;

declare function ABPersonGetCompositeNameFormatForRecord(record: any): number;

declare function ABPersonGetSortOrdering(): number;

declare function ABPersonGetTypeOfProperty(property: number): number;

declare function ABPersonHasImageData(person: any): boolean;

declare const enum ABPersonImageFormat {

	kABPersonImageFormatThumbnail = 0,

	kABPersonImageFormatOriginalSize = 2
}

declare function ABPersonRemoveImageData(person: any, error: interop.Reference<NSError>): boolean;

declare function ABPersonSetImageData(person: any, imageData: NSData, error: interop.Reference<NSError>): boolean;

declare function ABRecordCopyCompositeName(record: any): interop.Unmanaged<string>;

declare function ABRecordCopyValue(record: any, property: number): interop.Unmanaged<any>;

declare function ABRecordGetRecordID(record: any): number;

declare function ABRecordGetRecordType(record: any): number;

declare function ABRecordRemoveValue(record: any, property: number, error: interop.Reference<NSError>): boolean;

declare function ABRecordSetValue(record: any, property: number, value: any, error: interop.Reference<NSError>): boolean;

declare var kABGroupNameProperty: number;

declare var kABHomeLabel: string;

declare var kABOtherLabel: string;

declare var kABPersonAddressCityKey: string;

declare var kABPersonAddressCountryCodeKey: string;

declare var kABPersonAddressCountryKey: string;

declare var kABPersonAddressProperty: number;

declare var kABPersonAddressStateKey: string;

declare var kABPersonAddressStreetKey: string;

declare var kABPersonAddressZIPKey: string;

declare var kABPersonAlternateBirthdayCalendarIdentifierKey: string;

declare var kABPersonAlternateBirthdayDayKey: string;

declare var kABPersonAlternateBirthdayEraKey: string;

declare var kABPersonAlternateBirthdayIsLeapMonthKey: string;

declare var kABPersonAlternateBirthdayMonthKey: string;

declare var kABPersonAlternateBirthdayProperty: number;

declare var kABPersonAlternateBirthdayYearKey: string;

declare var kABPersonAnniversaryLabel: string;

declare var kABPersonAssistantLabel: string;

declare var kABPersonBirthdayProperty: number;

declare var kABPersonBrotherLabel: string;

declare var kABPersonChildLabel: string;

declare var kABPersonCreationDateProperty: number;

declare var kABPersonDateProperty: number;

declare var kABPersonDepartmentProperty: number;

declare var kABPersonEmailProperty: number;

declare var kABPersonFatherLabel: string;

declare var kABPersonFirstNamePhoneticProperty: number;

declare var kABPersonFirstNameProperty: number;

declare var kABPersonFriendLabel: string;

declare var kABPersonHomePageLabel: string;

declare var kABPersonInstantMessageProperty: number;

declare var kABPersonInstantMessageServiceAIM: string;

declare var kABPersonInstantMessageServiceFacebook: string;

declare var kABPersonInstantMessageServiceGaduGadu: string;

declare var kABPersonInstantMessageServiceGoogleTalk: string;

declare var kABPersonInstantMessageServiceICQ: string;

declare var kABPersonInstantMessageServiceJabber: string;

declare var kABPersonInstantMessageServiceKey: string;

declare var kABPersonInstantMessageServiceMSN: string;

declare var kABPersonInstantMessageServiceQQ: string;

declare var kABPersonInstantMessageServiceSkype: string;

declare var kABPersonInstantMessageServiceYahoo: string;

declare var kABPersonInstantMessageUsernameKey: string;

declare var kABPersonJobTitleProperty: number;

declare var kABPersonKindOrganization: number;

declare var kABPersonKindPerson: number;

declare var kABPersonKindProperty: number;

declare var kABPersonLastNamePhoneticProperty: number;

declare var kABPersonLastNameProperty: number;

declare var kABPersonManagerLabel: string;

declare var kABPersonMiddleNamePhoneticProperty: number;

declare var kABPersonMiddleNameProperty: number;

declare var kABPersonModificationDateProperty: number;

declare var kABPersonMotherLabel: string;

declare var kABPersonNicknameProperty: number;

declare var kABPersonNoteProperty: number;

declare var kABPersonOrganizationProperty: number;

declare var kABPersonParentLabel: string;

declare var kABPersonPartnerLabel: string;

declare var kABPersonPhoneHomeFAXLabel: string;

declare var kABPersonPhoneIPhoneLabel: string;

declare var kABPersonPhoneMainLabel: string;

declare var kABPersonPhoneMobileLabel: string;

declare var kABPersonPhoneOtherFAXLabel: string;

declare var kABPersonPhonePagerLabel: string;

declare var kABPersonPhoneProperty: number;

declare var kABPersonPhoneWorkFAXLabel: string;

declare var kABPersonPrefixProperty: number;

declare var kABPersonRelatedNamesProperty: number;

declare var kABPersonSisterLabel: string;

declare var kABPersonSocialProfileProperty: number;

declare var kABPersonSocialProfileServiceFacebook: string;

declare var kABPersonSocialProfileServiceFlickr: string;

declare var kABPersonSocialProfileServiceGameCenter: string;

declare var kABPersonSocialProfileServiceKey: string;

declare var kABPersonSocialProfileServiceLinkedIn: string;

declare var kABPersonSocialProfileServiceMyspace: string;

declare var kABPersonSocialProfileServiceSinaWeibo: string;

declare var kABPersonSocialProfileServiceTwitter: string;

declare var kABPersonSocialProfileURLKey: string;

declare var kABPersonSocialProfileUserIdentifierKey: string;

declare var kABPersonSocialProfileUsernameKey: string;

declare var kABPersonSpouseLabel: string;

declare var kABPersonSuffixProperty: number;

declare var kABPersonURLProperty: number;

declare var kABSourceNameProperty: number;

declare var kABSourceTypeProperty: number;

declare var kABWorkLabel: string;
