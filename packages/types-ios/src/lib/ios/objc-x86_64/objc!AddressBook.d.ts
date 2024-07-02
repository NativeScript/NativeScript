
/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookAddRecord(addressBook: any, record: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyArrayOfAllGroups(addressBook: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyArrayOfAllGroupsInSource(addressBook: any, source: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyArrayOfAllPeople(addressBook: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyArrayOfAllPeopleInSource(addressBook: any, source: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyArrayOfAllPeopleInSourceWithSortOrdering(addressBook: any, source: any, sortOrdering: number): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyArrayOfAllSources(addressBook: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyDefaultSource(addressBook: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyLocalizedLabel(label: string): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCopyPeopleWithName(addressBook: any, name: string): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCreate(): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookCreateWithOptions(options: NSDictionary<any, any>, error: interop.Pointer | interop.Reference<NSError>): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var ABAddressBookErrorDomain: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookGetAuthorizationStatus(): ABAuthorizationStatus;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookGetGroupCount(addressBook: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookGetGroupWithRecordID(addressBook: any, recordID: number): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookGetPersonCount(addressBook: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookGetPersonWithRecordID(addressBook: any, recordID: number): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookGetSourceWithRecordID(addressBook: any, sourceID: number): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookHasUnsavedChanges(addressBook: any): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookRegisterExternalChangeCallback(addressBook: any, callback: interop.FunctionReference<(p1: any, p2: NSDictionary<any, any>, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookRemoveRecord(addressBook: any, record: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookRequestAccessWithCompletion(addressBook: any, completion: (p1: boolean, p2: NSError) => void): void;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookRevert(addressBook: any): void;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookSave(addressBook: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABAddressBookUnregisterExternalChangeCallback(addressBook: any, callback: interop.FunctionReference<(p1: any, p2: NSDictionary<any, any>, p3: interop.Pointer | interop.Reference<any>) => void>, context: interop.Pointer | interop.Reference<any>): void;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare const enum ABAuthorizationStatus {

	kABAuthorizationStatusNotDetermined = 0,

	kABAuthorizationStatusRestricted = 1,

	kABAuthorizationStatusDenied = 2,

	kABAuthorizationStatusAuthorized = 3
}

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABGroupAddMember(group: any, person: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABGroupCopyArrayOfAllMembers(group: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABGroupCopyArrayOfAllMembersWithSortOrdering(group: any, sortOrdering: number): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABGroupCopySource(group: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABGroupCreate(): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABGroupCreateInSource(source: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABGroupRemoveMember(group: any, member: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueAddValueAndLabel(multiValue: any, value: any, label: string, outIdentifier: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueCopyArrayOfAllValues(multiValue: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueCopyLabelAtIndex(multiValue: any, index: number): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueCopyValueAtIndex(multiValue: any, index: number): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueCreateMutable(type: number): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueCreateMutableCopy(multiValue: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueGetCount(multiValue: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueGetFirstIndexOfValue(multiValue: any, value: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueGetIdentifierAtIndex(multiValue: any, index: number): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueGetIndexForIdentifier(multiValue: any, identifier: number): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueGetPropertyType(multiValue: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueInsertValueAndLabelAtIndex(multiValue: any, value: any, label: string, index: number, outIdentifier: interop.Pointer | interop.Reference<number>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueRemoveValueAndLabelAtIndex(multiValue: any, index: number): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueReplaceLabelAtIndex(multiValue: any, label: string, index: number): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABMultiValueReplaceValueAtIndex(multiValue: any, value: any, index: number): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonComparePeopleByName(person1: any, person2: any, ordering: number): CFComparisonResult;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCopyArrayOfAllLinkedPeople(person: any): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCopyCompositeNameDelimiterForRecord(record: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCopyImageData(person: any): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCopyImageDataWithFormat(person: any, format: ABPersonImageFormat): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCopyLocalizedPropertyName(property: number): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCopySource(person: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCreate(): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCreateInSource(source: any): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCreatePeopleInSourceWithVCardRepresentation(source: any, vCardData: NSData): interop.Unmanaged<NSArray<any>>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonCreateVCardRepresentationWithPeople(people: NSArray<any> | any[]): interop.Unmanaged<NSData>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonGetCompositeNameFormat(): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonGetCompositeNameFormatForRecord(record: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonGetSortOrdering(): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonGetTypeOfProperty(property: number): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonHasImageData(person: any): boolean;

declare const enum ABPersonImageFormat {

	kABPersonImageFormatThumbnail = 0,

	kABPersonImageFormatOriginalSize = 2
}

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonRemoveImageData(person: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABPersonSetImageData(person: any, imageData: NSData, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABRecordCopyCompositeName(record: any): interop.Unmanaged<string>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABRecordCopyValue(record: any, property: number): interop.Unmanaged<any>;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABRecordGetRecordID(record: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABRecordGetRecordType(record: any): number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABRecordRemoveValue(record: any, property: number, error: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare function ABRecordSetValue(record: any, property: number, value: any, error: interop.Pointer | interop.Reference<NSError>): boolean;

declare const kABDateTimePropertyType: number;

declare const kABDictionaryPropertyType: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABGroupNameProperty: number;

declare const kABGroupType: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABHomeLabel: string;

declare const kABIntegerPropertyType: number;

declare const kABInvalidPropertyType: number;

declare const kABMultiDateTimePropertyType: number;

declare const kABMultiDictionaryPropertyType: number;

declare const kABMultiIntegerPropertyType: number;

declare const kABMultiRealPropertyType: number;

declare const kABMultiStringPropertyType: number;

declare const kABOperationNotPermittedByStoreError: number;

declare const kABOperationNotPermittedByUserError: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABOtherLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAddressCityKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAddressCountryCodeKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAddressCountryKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAddressProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAddressStateKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAddressStreetKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAddressZIPKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAlternateBirthdayCalendarIdentifierKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAlternateBirthdayDayKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAlternateBirthdayEraKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAlternateBirthdayIsLeapMonthKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAlternateBirthdayMonthKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAlternateBirthdayProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAlternateBirthdayYearKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAnniversaryLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonAssistantLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonBirthdayProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonBrotherLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonChildLabel: string;

declare const kABPersonCompositeNameFormatFirstNameFirst: number;

declare const kABPersonCompositeNameFormatLastNameFirst: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonCreationDateProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonDateProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonDepartmentProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonEmailProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonFatherLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonFirstNamePhoneticProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonFirstNameProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonFriendLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonHomePageLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceAIM: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceFacebook: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceGaduGadu: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceGoogleTalk: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceICQ: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceJabber: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceMSN: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceQQ: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceSkype: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageServiceYahoo: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonInstantMessageUsernameKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonJobTitleProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonKindOrganization: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonKindPerson: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonKindProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonLastNamePhoneticProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonLastNameProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonManagerLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonMiddleNamePhoneticProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonMiddleNameProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonModificationDateProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonMotherLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonNicknameProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonNoteProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonOrganizationProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonParentLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPartnerLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhoneHomeFAXLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhoneIPhoneLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhoneMainLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhoneMobileLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhoneOtherFAXLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhonePagerLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhoneProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPhoneWorkFAXLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonPrefixProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonRelatedNamesProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSisterLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileProperty: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceFacebook: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceFlickr: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceGameCenter: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceLinkedIn: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceMyspace: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceSinaWeibo: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileServiceTwitter: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileURLKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileUserIdentifierKey: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSocialProfileUsernameKey: string;

declare const kABPersonSortByFirstName: number;

declare const kABPersonSortByLastName: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSpouseLabel: string;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonSuffixProperty: number;

declare const kABPersonType: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABPersonURLProperty: number;

declare const kABRealPropertyType: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABSourceNameProperty: number;

declare const kABSourceType: number;

declare const kABSourceTypeCardDAV: number;

declare const kABSourceTypeCardDAVSearch: number;

declare const kABSourceTypeExchange: number;

declare const kABSourceTypeExchangeGAL: number;

declare const kABSourceTypeLDAP: number;

declare const kABSourceTypeLocal: number;

declare const kABSourceTypeMobileMe: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABSourceTypeProperty: number;

declare const kABStringPropertyType: number;

/**
 * @since 2.0
 * @deprecated 9.0
 */
declare var kABWorkLabel: string;
