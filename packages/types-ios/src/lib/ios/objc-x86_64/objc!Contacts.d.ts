
/**
 * @since 9.0
 */
declare const enum CNAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3,

	Limited = 4
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryAddContactEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddContactEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddContactEvent; // inherited from NSObject

	readonly contact: CNContact;

	readonly containerIdentifier: string;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryAddGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddGroupEvent; // inherited from NSObject

	readonly containerIdentifier: string;

	readonly group: CNGroup;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryAddMemberToGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddMemberToGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddMemberToGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly member: CNContact;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryAddSubgroupToGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddSubgroupToGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddSubgroupToGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly subgroup: CNGroup;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryDeleteContactEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryDeleteContactEvent; // inherited from NSObject

	static new(): CNChangeHistoryDeleteContactEvent; // inherited from NSObject

	readonly contactIdentifier: string;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryDeleteGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryDeleteGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryDeleteGroupEvent; // inherited from NSObject

	readonly groupIdentifier: string;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryDropEverythingEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryDropEverythingEvent; // inherited from NSObject

	static new(): CNChangeHistoryDropEverythingEvent; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryEvent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNChangeHistoryEvent; // inherited from NSObject

	static new(): CNChangeHistoryEvent; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	acceptEventVisitor(visitor: CNChangeHistoryEventVisitor): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
interface CNChangeHistoryEventVisitor extends NSObjectProtocol {

	visitAddContactEvent(event: CNChangeHistoryAddContactEvent): void;

	visitAddGroupEvent?(event: CNChangeHistoryAddGroupEvent): void;

	visitAddMemberToGroupEvent?(event: CNChangeHistoryAddMemberToGroupEvent): void;

	visitAddSubgroupToGroupEvent?(event: CNChangeHistoryAddSubgroupToGroupEvent): void;

	visitDeleteContactEvent(event: CNChangeHistoryDeleteContactEvent): void;

	visitDeleteGroupEvent?(event: CNChangeHistoryDeleteGroupEvent): void;

	visitDropEverythingEvent(event: CNChangeHistoryDropEverythingEvent): void;

	visitRemoveMemberFromGroupEvent?(event: CNChangeHistoryRemoveMemberFromGroupEvent): void;

	visitRemoveSubgroupFromGroupEvent?(event: CNChangeHistoryRemoveSubgroupFromGroupEvent): void;

	visitUpdateContactEvent(event: CNChangeHistoryUpdateContactEvent): void;

	visitUpdateGroupEvent?(event: CNChangeHistoryUpdateGroupEvent): void;
}
declare var CNChangeHistoryEventVisitor: {

	prototype: CNChangeHistoryEventVisitor;
};

/**
 * @since 13.0
 */
declare class CNChangeHistoryFetchRequest extends CNFetchRequest implements NSSecureCoding {

	static alloc(): CNChangeHistoryFetchRequest; // inherited from NSObject

	static new(): CNChangeHistoryFetchRequest; // inherited from NSObject

	additionalContactKeyDescriptors: NSArray<CNKeyDescriptor>;

	excludedTransactionAuthors: NSArray<string>;

	includeGroupChanges: boolean;

	mutableObjects: boolean;

	shouldUnifyResults: boolean;

	startingToken: NSData;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryRemoveMemberFromGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryRemoveMemberFromGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryRemoveMemberFromGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly member: CNContact;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryRemoveSubgroupFromGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryRemoveSubgroupFromGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryRemoveSubgroupFromGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly subgroup: CNGroup;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryUpdateContactEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryUpdateContactEvent; // inherited from NSObject

	static new(): CNChangeHistoryUpdateContactEvent; // inherited from NSObject

	readonly contact: CNContact;
}

/**
 * @since 13.0
 */
declare class CNChangeHistoryUpdateGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryUpdateGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryUpdateGroupEvent; // inherited from NSObject

	readonly group: CNGroup;
}

/**
 * @since 9.0
 */
declare class CNContact extends NSObject implements NSCopying, NSItemProviderReading, NSItemProviderWriting, NSMutableCopying, NSSecureCoding {

	static alloc(): CNContact; // inherited from NSObject

	static comparatorForNameSortOrder(sortOrder: CNContactSortOrder): (p1: any, p2: any) => NSComparisonResult;

	static descriptorForAllComparatorKeys(): CNKeyDescriptor;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static localizedStringForKey(key: string): string;

	static new(): CNContact; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): CNContact;

	static predicateForContactsInContainerWithIdentifier(containerIdentifier: string): NSPredicate;

	static predicateForContactsInGroupWithIdentifier(groupIdentifier: string): NSPredicate;

	/**
	 * @since 11.0
	 */
	static predicateForContactsMatchingEmailAddress(emailAddress: string): NSPredicate;

	static predicateForContactsMatchingName(name: string): NSPredicate;

	/**
	 * @since 11.0
	 */
	static predicateForContactsMatchingPhoneNumber(phoneNumber: CNPhoneNumber): NSPredicate;

	static predicateForContactsWithIdentifiers(identifiers: NSArray<string> | string[]): NSPredicate;

	readonly birthday: NSDateComponents;

	readonly contactRelations: NSArray<CNLabeledValue<CNContactRelation>>;

	readonly contactType: CNContactType;

	readonly dates: NSArray<CNLabeledValue<NSDateComponents>>;

	readonly departmentName: string;

	readonly emailAddresses: NSArray<CNLabeledValue<string>>;

	readonly familyName: string;

	readonly givenName: string;

	readonly identifier: string;

	readonly imageData: NSData;

	/**
	 * @since 9.0
	 */
	readonly imageDataAvailable: boolean;

	readonly instantMessageAddresses: NSArray<CNLabeledValue<CNInstantMessageAddress>>;

	readonly jobTitle: string;

	readonly middleName: string;

	readonly namePrefix: string;

	readonly nameSuffix: string;

	readonly nickname: string;

	readonly nonGregorianBirthday: NSDateComponents;

	readonly note: string;

	readonly organizationName: string;

	readonly phoneNumbers: NSArray<CNLabeledValue<CNPhoneNumber>>;

	readonly phoneticFamilyName: string;

	readonly phoneticGivenName: string;

	readonly phoneticMiddleName: string;

	/**
	 * @since 10.0
	 */
	readonly phoneticOrganizationName: string;

	readonly postalAddresses: NSArray<CNLabeledValue<CNPostalAddress>>;

	readonly previousFamilyName: string;

	readonly socialProfiles: NSArray<CNLabeledValue<CNSocialProfile>>;

	readonly thumbnailImageData: NSData;

	readonly urlAddresses: NSArray<CNLabeledValue<string>>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	areKeysAvailable(keyDescriptors: NSArray<CNKeyDescriptor> | CNKeyDescriptor[]): boolean;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isEqual(object: any): boolean;

	isKeyAvailable(key: string): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	isUnifiedWithContactWithIdentifier(contactIdentifier: string): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 9.0
 */
declare var CNContactBirthdayKey: string;

/**
 * @since 9.0
 */
declare var CNContactDatesKey: string;

/**
 * @since 9.0
 */
declare var CNContactDepartmentNameKey: string;

/**
 * @since 9.0
 */
declare const enum CNContactDisplayNameOrder {

	UserDefault = 0,

	GivenNameFirst = 1,

	FamilyNameFirst = 2
}

/**
 * @since 9.0
 */
declare var CNContactEmailAddressesKey: string;

/**
 * @since 9.0
 */
declare var CNContactFamilyNameKey: string;

/**
 * @since 9.0
 */
declare class CNContactFetchRequest extends CNFetchRequest implements NSSecureCoding {

	static alloc(): CNContactFetchRequest; // inherited from NSObject

	static new(): CNContactFetchRequest; // inherited from NSObject

	keysToFetch: NSArray<CNKeyDescriptor>;

	/**
	 * @since 10.0
	 */
	mutableObjects: boolean;

	predicate: NSPredicate;

	sortOrder: CNContactSortOrder;

	unifyResults: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { keysToFetch: NSArray<CNKeyDescriptor> | CNKeyDescriptor[]; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithKeysToFetch(keysToFetch: NSArray<CNKeyDescriptor> | CNKeyDescriptor[]): this;
}

/**
 * @since 9.0
 */
declare class CNContactFormatter extends NSFormatter implements NSSecureCoding {

	static alloc(): CNContactFormatter; // inherited from NSObject

	static attributedStringFromContactStyleDefaultAttributes(contact: CNContact, style: CNContactFormatterStyle, attributes: NSDictionary<any, any>): NSAttributedString;

	static delimiterForContact(contact: CNContact): string;

	static descriptorForRequiredKeysForStyle(style: CNContactFormatterStyle): CNKeyDescriptor;

	static nameOrderForContact(contact: CNContact): CNContactDisplayNameOrder;

	static new(): CNContactFormatter; // inherited from NSObject

	static stringFromContactStyle(contact: CNContact, style: CNContactFormatterStyle): string;

	style: CNContactFormatterStyle;

	static readonly descriptorForRequiredKeysForDelimiter: CNKeyDescriptor;

	static readonly descriptorForRequiredKeysForNameOrder: CNKeyDescriptor;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	attributedStringFromContactDefaultAttributes(contact: CNContact, attributes: NSDictionary<any, any>): NSAttributedString;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	stringFromContact(contact: CNContact): string;
}

/**
 * @since 9.0
 */
declare const enum CNContactFormatterStyle {

	FullName = 0,

	PhoneticFullName = 1
}

/**
 * @since 9.0
 */
declare var CNContactGivenNameKey: string;

/**
 * @since 9.0
 */
declare var CNContactIdentifierKey: string;

/**
 * @since 9.0
 */
declare var CNContactImageDataAvailableKey: string;

/**
 * @since 9.0
 */
declare var CNContactImageDataKey: string;

/**
 * @since 9.0
 */
declare var CNContactInstantMessageAddressesKey: string;

/**
 * @since 9.0
 */
declare var CNContactJobTitleKey: string;

/**
 * @since 9.0
 */
declare var CNContactMiddleNameKey: string;

/**
 * @since 9.0
 */
declare var CNContactNamePrefixKey: string;

/**
 * @since 9.0
 */
declare var CNContactNameSuffixKey: string;

/**
 * @since 9.0
 */
declare var CNContactNicknameKey: string;

/**
 * @since 9.0
 */
declare var CNContactNonGregorianBirthdayKey: string;

/**
 * @since 9.0
 */
declare var CNContactNoteKey: string;

/**
 * @since 9.0
 */
declare var CNContactOrganizationNameKey: string;

/**
 * @since 9.0
 */
declare var CNContactPhoneNumbersKey: string;

/**
 * @since 9.0
 */
declare var CNContactPhoneticFamilyNameKey: string;

/**
 * @since 9.0
 */
declare var CNContactPhoneticGivenNameKey: string;

/**
 * @since 9.0
 */
declare var CNContactPhoneticMiddleNameKey: string;

/**
 * @since 10.0
 */
declare var CNContactPhoneticOrganizationNameKey: string;

/**
 * @since 9.0
 */
declare var CNContactPostalAddressesKey: string;

/**
 * @since 9.0
 */
declare var CNContactPreviousFamilyNameKey: string;

/**
 * @since 9.0
 */
declare class CNContactProperty extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNContactProperty; // inherited from NSObject

	static new(): CNContactProperty; // inherited from NSObject

	readonly contact: CNContact;

	readonly identifier: string;

	readonly key: string;

	readonly label: string;

	readonly value: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var CNContactPropertyAttribute: string;

declare var CNContactPropertyNotFetchedExceptionName: string;

/**
 * @since 9.0
 */
declare class CNContactRelation extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNContactRelation; // inherited from NSObject

	static contactRelationWithName(name: string): CNContactRelation;

	static new(): CNContactRelation; // inherited from NSObject

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithName(name: string): this;
}

/**
 * @since 9.0
 */
declare var CNContactRelationsKey: string;

/**
 * @since 9.0
 */
declare var CNContactSocialProfilesKey: string;

/**
 * @since 9.0
 */
declare const enum CNContactSortOrder {

	None = 0,

	UserDefault = 1,

	GivenName = 2,

	FamilyName = 3
}

/**
 * @since 9.0
 */
declare class CNContactStore extends NSObject {

	static alloc(): CNContactStore; // inherited from NSObject

	static authorizationStatusForEntityType(entityType: CNEntityType): CNAuthorizationStatus;

	static new(): CNContactStore; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly currentHistoryToken: NSData;

	containersMatchingPredicateError(predicate: NSPredicate): NSArray<CNContainer>;

	defaultContainerIdentifier(): string;

	enumerateContactsWithFetchRequestErrorUsingBlock(fetchRequest: CNContactFetchRequest, error: interop.Pointer | interop.Reference<NSError>, block: (p1: CNContact, p2: interop.Pointer | interop.Reference<boolean>) => void): boolean;

	/**
	 * @since 13.0
	 */
	enumeratorForChangeHistoryFetchRequestError(request: CNChangeHistoryFetchRequest): CNFetchResult<NSEnumerator<CNChangeHistoryEvent>>;

	/**
	 * @since 13.0
	 */
	enumeratorForContactFetchRequestError(request: CNContactFetchRequest): CNFetchResult<NSEnumerator<CNContact>>;

	executeSaveRequestError(saveRequest: CNSaveRequest): boolean;

	groupsMatchingPredicateError(predicate: NSPredicate): NSArray<CNGroup>;

	requestAccessForEntityTypeCompletionHandler(entityType: CNEntityType, completionHandler: (p1: boolean, p2: NSError) => void): void;

	unifiedContactWithIdentifierKeysToFetchError(identifier: string, keys: NSArray<CNKeyDescriptor> | CNKeyDescriptor[]): CNContact;

	unifiedContactsMatchingPredicateKeysToFetchError(predicate: NSPredicate, keys: NSArray<CNKeyDescriptor> | CNKeyDescriptor[]): NSArray<CNContact>;
}

/**
 * @since 9.0
 */
declare var CNContactStoreDidChangeNotification: string;

/**
 * @since 9.0
 */
declare var CNContactThumbnailImageDataKey: string;

/**
 * @since 9.0
 */
declare const enum CNContactType {

	Person = 0,

	Organization = 1
}

/**
 * @since 9.0
 */
declare var CNContactTypeKey: string;

/**
 * @since 9.0
 */
declare var CNContactUrlAddressesKey: string;

/**
 * @since 9.0
 */
declare class CNContactVCardSerialization extends NSObject {

	static alloc(): CNContactVCardSerialization; // inherited from NSObject

	static contactsWithDataError(data: NSData): NSArray<CNContact>;

	static dataWithContactsError(contacts: NSArray<CNContact> | CNContact[]): NSData;

	static descriptorForRequiredKeys(): CNKeyDescriptor;

	static new(): CNContactVCardSerialization; // inherited from NSObject
}

/**
 * @since 9.0
 */
declare class CNContactsUserDefaults extends NSObject {

	static alloc(): CNContactsUserDefaults; // inherited from NSObject

	static new(): CNContactsUserDefaults; // inherited from NSObject

	static sharedDefaults(): CNContactsUserDefaults;

	readonly countryCode: string;

	readonly sortOrder: CNContactSortOrder;
}

/**
 * @since 9.0
 */
declare class CNContainer extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNContainer; // inherited from NSObject

	static new(): CNContainer; // inherited from NSObject

	static predicateForContainerOfContactWithIdentifier(contactIdentifier: string): NSPredicate;

	static predicateForContainerOfGroupWithIdentifier(groupIdentifier: string): NSPredicate;

	static predicateForContainersWithIdentifiers(identifiers: NSArray<string> | string[]): NSPredicate;

	readonly identifier: string;

	readonly name: string;

	readonly type: CNContainerType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare var CNContainerIdentifierKey: string;

/**
 * @since 9.0
 */
declare var CNContainerNameKey: string;

/**
 * @since 9.0
 */
declare const enum CNContainerType {

	Unassigned = 0,

	Local = 1,

	Exchange = 2,

	CardDAV = 3
}

/**
 * @since 9.0
 */
declare var CNContainerTypeKey: string;

/**
 * @since 9.0
 */
declare const enum CNEntityType {

	Contacts = 0
}

/**
 * @since 9.0
 */
declare const enum CNErrorCode {

	CommunicationError = 1,

	DataAccessError = 2,

	AuthorizationDenied = 100,

	NoAccessableWritableContainers = 101,

	UnauthorizedKeys = 102,

	FeatureDisabledByUser = 103,

	FeatureNotAvailable = 104,

	RecordDoesNotExist = 200,

	InsertedRecordAlreadyExists = 201,

	ContainmentCycle = 202,

	ContainmentScope = 203,

	ParentRecordDoesNotExist = 204,

	RecordIdentifierInvalid = 205,

	RecordNotWritable = 206,

	ParentContainerNotWritable = 207,

	ValidationMultipleErrors = 300,

	ValidationTypeMismatch = 301,

	ValidationConfigurationError = 302,

	PredicateInvalid = 400,

	PolicyViolation = 500,

	ClientIdentifierInvalid = 600,

	ClientIdentifierDoesNotExist = 601,

	ClientIdentifierCollision = 602,

	ChangeHistoryExpired = 603,

	ChangeHistoryInvalidAnchor = 604,

	ChangeHistoryInvalidFetchRequest = 605,

	VCardMalformed = 700,

	VCardSummarizationError = 701
}

/**
 * @since 9.0
 */
declare var CNErrorDomain: string;

/**
 * @since 9.0
 */
declare var CNErrorUserInfoAffectedRecordIdentifiersKey: string;

/**
 * @since 9.0
 */
declare var CNErrorUserInfoAffectedRecordsKey: string;

/**
 * @since 9.0
 */
declare var CNErrorUserInfoKeyPathsKey: string;

/**
 * @since 9.0
 */
declare var CNErrorUserInfoValidationErrorsKey: string;

/**
 * @since 9.0
 */
declare class CNFetchRequest extends NSObject {

	static alloc(): CNFetchRequest; // inherited from NSObject

	static new(): CNFetchRequest; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare class CNFetchResult<ValueType> extends NSObject {

	static alloc<ValueType>(): CNFetchResult<ValueType>; // inherited from NSObject

	static new<ValueType>(): CNFetchResult<ValueType>; // inherited from NSObject

	readonly currentHistoryToken: NSData;

	readonly value: any;
}

/**
 * @since 9.0
 */
declare class CNGroup extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): CNGroup; // inherited from NSObject

	static new(): CNGroup; // inherited from NSObject

	static predicateForGroupsInContainerWithIdentifier(containerIdentifier: string): NSPredicate;

	static predicateForGroupsWithIdentifiers(identifiers: NSArray<string> | string[]): NSPredicate;

	readonly identifier: string;

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9.0
 */
declare var CNGroupIdentifierKey: string;

/**
 * @since 9.0
 */
declare var CNGroupNameKey: string;

/**
 * @since 9.0
 */
declare class CNInstantMessageAddress extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNInstantMessageAddress; // inherited from NSObject

	static localizedStringForKey(key: string): string;

	static localizedStringForService(service: string): string;

	static new(): CNInstantMessageAddress; // inherited from NSObject

	readonly service: string;

	readonly username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { username: string; service: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithUsernameService(username: string, service: string): this;
}

/**
 * @since 9.0
 */
declare var CNInstantMessageAddressServiceKey: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageAddressUsernameKey: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceAIM: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceFacebook: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceGaduGadu: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceGoogleTalk: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceICQ: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceJabber: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceMSN: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceQQ: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceSkype: string;

/**
 * @since 9.0
 */
declare var CNInstantMessageServiceYahoo: string;

interface CNKeyDescriptor extends NSCopying, NSObjectProtocol, NSSecureCoding {
}
declare var CNKeyDescriptor: {

	prototype: CNKeyDescriptor;
};

/**
 * @since 9.0
 */
declare var CNLabelContactRelationAssistant: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAunt: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntFathersBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntFathersElderBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntFathersElderSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntFathersSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntFathersYoungerBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntFathersYoungerSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntMothersBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntMothersElderSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntMothersSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntMothersYoungerSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntParentsElderSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntParentsSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationAuntParentsYoungerSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBoyfriend: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawElderSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawHusbandsBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawHusbandsSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawSpousesBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawWifesBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawWifesSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationBrotherInLawYoungerSistersHusband: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationChild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationChildInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCoBrotherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCoFatherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCoMotherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCoParentInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCoSiblingInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCoSisterInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationColleague: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousin: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinFathersBrothersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinFathersBrothersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinFathersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinFathersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinGrandparentsSiblingsChild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinGrandparentsSiblingsDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinGrandparentsSiblingsSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinMothersBrothersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinMothersBrothersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinMothersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinMothersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinOrSiblingsChild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinParentsSiblingsChild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinParentsSiblingsDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationCousinParentsSiblingsSon: string;

/**
 * @since 11.0
 */
declare var CNLabelContactRelationDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationDaughterInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationDaughterInLawOrSisterInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationDaughterInLawOrStepdaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderBrotherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousin: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinFathersBrothersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinFathersBrothersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinFathersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinFathersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinMothersBrothersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinMothersBrothersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinMothersSiblingsDaughterOrFathersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinMothersSiblingsSonOrFathersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinMothersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinMothersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinParentsSiblingsDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderCousinParentsSiblingsSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderSiblingInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationElderSisterInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationEldestBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationEldestSister: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationFather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationFatherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationFatherInLawHusbandsFather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationFatherInLawOrStepfather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationFatherInLawWifesFather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationFemaleCousin: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationFemaleFriend: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationFemalePartner: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationFriend: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGirlfriend: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGirlfriendOrBoyfriend: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandaunt: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandchild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandchildOrSiblingsChild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGranddaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGranddaughterDaughtersDaughter: string;

/**
 * @since 14.0
 */
declare var CNLabelContactRelationGranddaughterOrNiece: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGranddaughterSonsDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandfather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandfatherFathersFather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandfatherMothersFather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandmother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandmotherFathersMother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandmotherMothersMother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandnephew: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandnephewBrothersGrandson: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandnephewSistersGrandson: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandniece: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandnieceBrothersGranddaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandnieceSistersGranddaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandparent: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandson: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandsonDaughtersSon: string;

/**
 * @since 14.0
 */
declare var CNLabelContactRelationGrandsonOrNephew: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGrandsonSonsSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGranduncle: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGreatGrandchild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGreatGrandchildOrSiblingsGrandchild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGreatGranddaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGreatGrandfather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGreatGrandmother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGreatGrandparent: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationGreatGrandson: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationMaleCousin: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationMaleFriend: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationMalePartner: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationManager: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationMother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationMotherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationMotherInLawHusbandsMother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationMotherInLawOrStepmother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationMotherInLawWifesMother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNephew: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNephewBrothersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNephewBrothersSonOrHusbandsSiblingsSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNephewOrCousin: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNephewSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNephewSistersSonOrWifesSiblingsSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNiece: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNieceBrothersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNieceBrothersDaughterOrHusbandsSiblingsDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNieceOrCousin: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNieceSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationNieceSistersDaughterOrWifesSiblingsDaughter: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationParent: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsElderSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsSiblingFathersElderSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsSiblingFathersSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsSiblingFathersYoungerSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsSiblingMothersElderSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsSiblingMothersSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsSiblingMothersYoungerSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationParentsYoungerSibling: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationPartner: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSiblingInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSiblingsChild: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawElderBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawHusbandsBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawHusbandsSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawSpousesSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawWifesBrothersWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawWifesSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSisterInLawYoungerBrothersWife: string;

/**
 * @since 11.0
 */
declare var CNLabelContactRelationSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSonInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSonInLawOrBrotherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationSonInLawOrStepson: string;

/**
 * @since 9.0
 */
declare var CNLabelContactRelationSpouse: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepbrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepchild: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepdaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepfather: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepmother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepparent: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepsister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationStepson: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationTeacher: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncle: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleFathersBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleFathersElderBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleFathersElderSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleFathersSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleFathersYoungerBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleFathersYoungerSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleMothersBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleMothersElderBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleMothersSistersHusband: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleMothersYoungerBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleParentsBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleParentsElderBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationUncleParentsYoungerBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationWife: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerBrotherInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousin: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinFathersBrothersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinFathersBrothersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinFathersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinFathersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinMothersBrothersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinMothersBrothersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinMothersSiblingsDaughterOrFathersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinMothersSiblingsSonOrFathersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinMothersSistersDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinMothersSistersSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinParentsSiblingsDaughter: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerCousinParentsSiblingsSon: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerSibling: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerSiblingInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerSister: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungerSisterInLaw: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungestBrother: string;

/**
 * @since 13.0
 */
declare var CNLabelContactRelationYoungestSister: string;

/**
 * @since 9.0
 */
declare var CNLabelDateAnniversary: string;

/**
 * @since 9.0
 */
declare var CNLabelEmailiCloud: string;

/**
 * @since 9.0
 */
declare var CNLabelHome: string;

/**
 * @since 9.0
 */
declare var CNLabelOther: string;

/**
 * @since 14.3
 */
declare var CNLabelPhoneNumberAppleWatch: string;

/**
 * @since 9.0
 */
declare var CNLabelPhoneNumberHomeFax: string;

/**
 * @since 9.0
 */
declare var CNLabelPhoneNumberMain: string;

/**
 * @since 9.0
 */
declare var CNLabelPhoneNumberMobile: string;

/**
 * @since 9.0
 */
declare var CNLabelPhoneNumberOtherFax: string;

/**
 * @since 9.0
 */
declare var CNLabelPhoneNumberPager: string;

/**
 * @since 9.0
 */
declare var CNLabelPhoneNumberWorkFax: string;

/**
 * @since 9.0
 */
declare var CNLabelPhoneNumberiPhone: string;

/**
 * @since 13.0
 */
declare var CNLabelSchool: string;

/**
 * @since 9.0
 */
declare var CNLabelURLAddressHomePage: string;

/**
 * @since 9.0
 */
declare var CNLabelWork: string;

/**
 * @since 9.0
 */
declare class CNLabeledValue<ValueType> extends NSObject implements NSCopying, NSSecureCoding {

	static alloc<ValueType>(): CNLabeledValue<ValueType>; // inherited from NSObject

	static labeledValueWithLabelValue<ValueType>(label: string, value: any): CNLabeledValue<ValueType>;

	static localizedStringForLabel(label: string): string;

	static new<ValueType>(): CNLabeledValue<ValueType>; // inherited from NSObject

	readonly identifier: string;

	readonly label: string;

	readonly value: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { label: string; value: any; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLabelValue(label: string, value: any): this;

	labeledValueBySettingLabel(label: string): this;

	labeledValueBySettingLabelValue(label: string, value: any): this;

	labeledValueBySettingValue(value: any): this;
}

/**
 * @since 9.0
 */
declare class CNMutableContact extends CNContact {

	static alloc(): CNMutableContact; // inherited from NSObject

	static new(): CNMutableContact; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): CNMutableContact; // inherited from NSItemProviderReading

	birthday: NSDateComponents;

	contactRelations: NSArray<CNLabeledValue<CNContactRelation>>;

	contactType: CNContactType;

	dates: NSArray<CNLabeledValue<NSDateComponents>>;

	departmentName: string;

	emailAddresses: NSArray<CNLabeledValue<string>>;

	familyName: string;

	givenName: string;

	imageData: NSData;

	instantMessageAddresses: NSArray<CNLabeledValue<CNInstantMessageAddress>>;

	jobTitle: string;

	middleName: string;

	namePrefix: string;

	nameSuffix: string;

	nickname: string;

	nonGregorianBirthday: NSDateComponents;

	note: string;

	organizationName: string;

	phoneNumbers: NSArray<CNLabeledValue<CNPhoneNumber>>;

	phoneticFamilyName: string;

	phoneticGivenName: string;

	phoneticMiddleName: string;

	phoneticOrganizationName: string;

	postalAddresses: NSArray<CNLabeledValue<CNPostalAddress>>;

	previousFamilyName: string;

	socialProfiles: NSArray<CNLabeledValue<CNSocialProfile>>;

	urlAddresses: NSArray<CNLabeledValue<string>>;
}

/**
 * @since 9.0
 */
declare class CNMutableGroup extends CNGroup {

	static alloc(): CNMutableGroup; // inherited from NSObject

	static new(): CNMutableGroup; // inherited from NSObject

	name: string;
}

/**
 * @since 9.0
 */
declare class CNMutablePostalAddress extends CNPostalAddress {

	static alloc(): CNMutablePostalAddress; // inherited from NSObject

	static new(): CNMutablePostalAddress; // inherited from NSObject

	ISOCountryCode: string;

	city: string;

	country: string;

	postalCode: string;

	state: string;

	street: string;

	/**
	 * @since 10.3
	 */
	subAdministrativeArea: string;

	/**
	 * @since 10.3
	 */
	subLocality: string;
}

/**
 * @since 9.0
 */
declare class CNPhoneNumber extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNPhoneNumber; // inherited from NSObject

	static new(): CNPhoneNumber; // inherited from NSObject

	static phoneNumberWithStringValue(stringValue: string): CNPhoneNumber;

	readonly stringValue: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { stringValue: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithStringValue(string: string): this;
}

/**
 * @since 9.0
 */
declare class CNPostalAddress extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): CNPostalAddress; // inherited from NSObject

	static localizedStringForKey(key: string): string;

	static new(): CNPostalAddress; // inherited from NSObject

	readonly ISOCountryCode: string;

	readonly city: string;

	readonly country: string;

	readonly postalCode: string;

	readonly state: string;

	readonly street: string;

	/**
	 * @since 10.3
	 */
	readonly subAdministrativeArea: string;

	/**
	 * @since 10.3
	 */
	readonly subLocality: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9.0
 */
declare var CNPostalAddressCityKey: string;

/**
 * @since 9.0
 */
declare var CNPostalAddressCountryKey: string;

/**
 * @since 9.0
 */
declare class CNPostalAddressFormatter extends NSFormatter {

	static alloc(): CNPostalAddressFormatter; // inherited from NSObject

	static attributedStringFromPostalAddressStyleWithDefaultAttributes(postalAddress: CNPostalAddress, style: CNPostalAddressFormatterStyle, attributes: NSDictionary<any, any>): NSAttributedString;

	static new(): CNPostalAddressFormatter; // inherited from NSObject

	static stringFromPostalAddressStyle(postalAddress: CNPostalAddress, style: CNPostalAddressFormatterStyle): string;

	style: CNPostalAddressFormatterStyle;

	attributedStringFromPostalAddressWithDefaultAttributes(postalAddress: CNPostalAddress, attributes: NSDictionary<any, any>): NSAttributedString;

	stringFromPostalAddress(postalAddress: CNPostalAddress): string;
}

/**
 * @since 9.0
 */
declare const enum CNPostalAddressFormatterStyle {

	MailingAddress = 0
}

/**
 * @since 9.0
 */
declare var CNPostalAddressISOCountryCodeKey: string;

declare var CNPostalAddressLocalizedPropertyNameAttribute: string;

/**
 * @since 9.0
 */
declare var CNPostalAddressPostalCodeKey: string;

declare var CNPostalAddressPropertyAttribute: string;

/**
 * @since 9.0
 */
declare var CNPostalAddressStateKey: string;

/**
 * @since 9.0
 */
declare var CNPostalAddressStreetKey: string;

/**
 * @since 10.3
 */
declare var CNPostalAddressSubAdministrativeAreaKey: string;

/**
 * @since 10.3
 */
declare var CNPostalAddressSubLocalityKey: string;

/**
 * @since 9
 */
declare class CNSaveRequest extends NSObject {

	static alloc(): CNSaveRequest; // inherited from NSObject

	static new(): CNSaveRequest; // inherited from NSObject

	/**
	 * @since 15.4
	 */
	shouldRefetchContacts: boolean;

	/**
	 * @since 15
	 */
	transactionAuthor: string;

	addContactToContainerWithIdentifier(contact: CNMutableContact, identifier: string): void;

	addGroupToContainerWithIdentifier(group: CNMutableGroup, identifier: string): void;

	addMemberToGroup(contact: CNContact, group: CNGroup): void;

	deleteContact(contact: CNMutableContact): void;

	deleteGroup(group: CNMutableGroup): void;

	removeMemberFromGroup(contact: CNContact, group: CNGroup): void;

	updateContact(contact: CNMutableContact): void;

	updateGroup(group: CNMutableGroup): void;
}

/**
 * @since 9.0
 */
declare class CNSocialProfile extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNSocialProfile; // inherited from NSObject

	static localizedStringForKey(key: string): string;

	static localizedStringForService(service: string): string;

	static new(): CNSocialProfile; // inherited from NSObject

	readonly service: string;

	readonly urlString: string;

	readonly userIdentifier: string;

	readonly username: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { urlString: string; username: string; userIdentifier: string; service: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithUrlStringUsernameUserIdentifierService(urlString: string, username: string, userIdentifier: string, service: string): this;
}

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceFacebook: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceFlickr: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceGameCenter: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceKey: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceLinkedIn: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceMySpace: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceSinaWeibo: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceTencentWeibo: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceTwitter: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileServiceYelp: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileURLStringKey: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileUserIdentifierKey: string;

/**
 * @since 9.0
 */
declare var CNSocialProfileUsernameKey: string;
