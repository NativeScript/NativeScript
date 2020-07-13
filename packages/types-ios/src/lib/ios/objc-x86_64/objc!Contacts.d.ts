
declare const enum CNAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare class CNChangeHistoryAddContactEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddContactEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddContactEvent; // inherited from NSObject

	readonly contact: CNContact;

	readonly containerIdentifier: string;
}

declare class CNChangeHistoryAddGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddGroupEvent; // inherited from NSObject

	readonly containerIdentifier: string;

	readonly group: CNGroup;
}

declare class CNChangeHistoryAddMemberToGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddMemberToGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddMemberToGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly member: CNContact;
}

declare class CNChangeHistoryAddSubgroupToGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryAddSubgroupToGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryAddSubgroupToGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly subgroup: CNGroup;
}

declare class CNChangeHistoryDeleteContactEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryDeleteContactEvent; // inherited from NSObject

	static new(): CNChangeHistoryDeleteContactEvent; // inherited from NSObject

	readonly contactIdentifier: string;
}

declare class CNChangeHistoryDeleteGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryDeleteGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryDeleteGroupEvent; // inherited from NSObject

	readonly groupIdentifier: string;
}

declare class CNChangeHistoryDropEverythingEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryDropEverythingEvent; // inherited from NSObject

	static new(): CNChangeHistoryDropEverythingEvent; // inherited from NSObject
}

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

declare class CNChangeHistoryRemoveMemberFromGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryRemoveMemberFromGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryRemoveMemberFromGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly member: CNContact;
}

declare class CNChangeHistoryRemoveSubgroupFromGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryRemoveSubgroupFromGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryRemoveSubgroupFromGroupEvent; // inherited from NSObject

	readonly group: CNGroup;

	readonly subgroup: CNGroup;
}

declare class CNChangeHistoryUpdateContactEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryUpdateContactEvent; // inherited from NSObject

	static new(): CNChangeHistoryUpdateContactEvent; // inherited from NSObject

	readonly contact: CNContact;
}

declare class CNChangeHistoryUpdateGroupEvent extends CNChangeHistoryEvent {

	static alloc(): CNChangeHistoryUpdateGroupEvent; // inherited from NSObject

	static new(): CNChangeHistoryUpdateGroupEvent; // inherited from NSObject

	readonly group: CNGroup;
}

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

	static predicateForContactsMatchingEmailAddress(emailAddress: string): NSPredicate;

	static predicateForContactsMatchingName(name: string): NSPredicate;

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

declare var CNContactBirthdayKey: string;

declare var CNContactDatesKey: string;

declare var CNContactDepartmentNameKey: string;

declare const enum CNContactDisplayNameOrder {

	UserDefault = 0,

	GivenNameFirst = 1,

	FamilyNameFirst = 2
}

declare var CNContactEmailAddressesKey: string;

declare var CNContactFamilyNameKey: string;

declare class CNContactFetchRequest extends CNFetchRequest implements NSSecureCoding {

	static alloc(): CNContactFetchRequest; // inherited from NSObject

	static new(): CNContactFetchRequest; // inherited from NSObject

	keysToFetch: NSArray<CNKeyDescriptor>;

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

declare class CNContactFormatter extends NSFormatter implements NSSecureCoding {

	static alloc(): CNContactFormatter; // inherited from NSObject

	static attributedStringFromContactStyleDefaultAttributes(contact: CNContact, style: CNContactFormatterStyle, attributes: NSDictionary<any, any>): NSAttributedString;

	static delimiterForContact(contact: CNContact): string;

	static descriptorForRequiredKeysForStyle(style: CNContactFormatterStyle): CNKeyDescriptor;

	static nameOrderForContact(contact: CNContact): CNContactDisplayNameOrder;

	static new(): CNContactFormatter; // inherited from NSObject

	static stringFromContactStyle(contact: CNContact, style: CNContactFormatterStyle): string;

	style: CNContactFormatterStyle;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	attributedStringFromContactDefaultAttributes(contact: CNContact, attributes: NSDictionary<any, any>): NSAttributedString;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	stringFromContact(contact: CNContact): string;
}

declare const enum CNContactFormatterStyle {

	FullName = 0,

	PhoneticFullName = 1
}

declare var CNContactGivenNameKey: string;

declare var CNContactIdentifierKey: string;

declare var CNContactImageDataAvailableKey: string;

declare var CNContactImageDataKey: string;

declare var CNContactInstantMessageAddressesKey: string;

declare var CNContactJobTitleKey: string;

declare var CNContactMiddleNameKey: string;

declare var CNContactNamePrefixKey: string;

declare var CNContactNameSuffixKey: string;

declare var CNContactNicknameKey: string;

declare var CNContactNonGregorianBirthdayKey: string;

declare var CNContactNoteKey: string;

declare var CNContactOrganizationNameKey: string;

declare var CNContactPhoneNumbersKey: string;

declare var CNContactPhoneticFamilyNameKey: string;

declare var CNContactPhoneticGivenNameKey: string;

declare var CNContactPhoneticMiddleNameKey: string;

declare var CNContactPhoneticOrganizationNameKey: string;

declare var CNContactPostalAddressesKey: string;

declare var CNContactPreviousFamilyNameKey: string;

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

declare var CNContactRelationsKey: string;

declare var CNContactSocialProfilesKey: string;

declare const enum CNContactSortOrder {

	None = 0,

	UserDefault = 1,

	GivenName = 2,

	FamilyName = 3
}

declare class CNContactStore extends NSObject {

	static alloc(): CNContactStore; // inherited from NSObject

	static authorizationStatusForEntityType(entityType: CNEntityType): CNAuthorizationStatus;

	static new(): CNContactStore; // inherited from NSObject

	readonly currentHistoryToken: NSData;

	containersMatchingPredicateError(predicate: NSPredicate): NSArray<CNContainer>;

	defaultContainerIdentifier(): string;

	enumerateContactsWithFetchRequestErrorUsingBlock(fetchRequest: CNContactFetchRequest, error: interop.Pointer | interop.Reference<NSError>, block: (p1: CNContact, p2: interop.Pointer | interop.Reference<boolean>) => void): boolean;

	enumeratorForChangeHistoryFetchRequestError(request: CNChangeHistoryFetchRequest): CNFetchResult<NSEnumerator<CNChangeHistoryEvent>>;

	enumeratorForContactFetchRequestError(request: CNContactFetchRequest): CNFetchResult<NSEnumerator<CNContact>>;

	executeSaveRequestError(saveRequest: CNSaveRequest): boolean;

	groupsMatchingPredicateError(predicate: NSPredicate): NSArray<CNGroup>;

	requestAccessForEntityTypeCompletionHandler(entityType: CNEntityType, completionHandler: (p1: boolean, p2: NSError) => void): void;

	unifiedContactWithIdentifierKeysToFetchError(identifier: string, keys: NSArray<CNKeyDescriptor> | CNKeyDescriptor[]): CNContact;

	unifiedContactsMatchingPredicateKeysToFetchError(predicate: NSPredicate, keys: NSArray<CNKeyDescriptor> | CNKeyDescriptor[]): NSArray<CNContact>;
}

declare var CNContactStoreDidChangeNotification: string;

declare var CNContactThumbnailImageDataKey: string;

declare const enum CNContactType {

	Person = 0,

	Organization = 1
}

declare var CNContactTypeKey: string;

declare var CNContactUrlAddressesKey: string;

declare class CNContactVCardSerialization extends NSObject {

	static alloc(): CNContactVCardSerialization; // inherited from NSObject

	static contactsWithDataError(data: NSData): NSArray<CNContact>;

	static dataWithContactsError(contacts: NSArray<CNContact> | CNContact[]): NSData;

	static descriptorForRequiredKeys(): CNKeyDescriptor;

	static new(): CNContactVCardSerialization; // inherited from NSObject
}

declare class CNContactsUserDefaults extends NSObject {

	static alloc(): CNContactsUserDefaults; // inherited from NSObject

	static new(): CNContactsUserDefaults; // inherited from NSObject

	static sharedDefaults(): CNContactsUserDefaults;

	readonly countryCode: string;

	readonly sortOrder: CNContactSortOrder;
}

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

declare var CNContainerIdentifierKey: string;

declare var CNContainerNameKey: string;

declare const enum CNContainerType {

	Unassigned = 0,

	Local = 1,

	Exchange = 2,

	CardDAV = 3
}

declare var CNContainerTypeKey: string;

declare const enum CNEntityType {

	Contacts = 0
}

declare const enum CNErrorCode {

	CommunicationError = 1,

	DataAccessError = 2,

	AuthorizationDenied = 100,

	NoAccessableWritableContainers = 101,

	UnauthorizedKeys = 102,

	FeatureDisabledByUser = 103,

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

	VCardMalformed = 700,

	VCardSummarizationError = 701
}

declare var CNErrorDomain: string;

declare var CNErrorUserInfoAffectedRecordIdentifiersKey: string;

declare var CNErrorUserInfoAffectedRecordsKey: string;

declare var CNErrorUserInfoKeyPathsKey: string;

declare var CNErrorUserInfoValidationErrorsKey: string;

declare class CNFetchRequest extends NSObject {

	static alloc(): CNFetchRequest; // inherited from NSObject

	static new(): CNFetchRequest; // inherited from NSObject
}

declare class CNFetchResult<ValueType> extends NSObject {

	static alloc<ValueType>(): CNFetchResult<ValueType>; // inherited from NSObject

	static new<ValueType>(): CNFetchResult<ValueType>; // inherited from NSObject

	readonly currentHistoryToken: NSData;

	readonly value: ValueType;
}

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

declare var CNGroupIdentifierKey: string;

declare var CNGroupNameKey: string;

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

declare var CNInstantMessageAddressServiceKey: string;

declare var CNInstantMessageAddressUsernameKey: string;

declare var CNInstantMessageServiceAIM: string;

declare var CNInstantMessageServiceFacebook: string;

declare var CNInstantMessageServiceGaduGadu: string;

declare var CNInstantMessageServiceGoogleTalk: string;

declare var CNInstantMessageServiceICQ: string;

declare var CNInstantMessageServiceJabber: string;

declare var CNInstantMessageServiceMSN: string;

declare var CNInstantMessageServiceQQ: string;

declare var CNInstantMessageServiceSkype: string;

declare var CNInstantMessageServiceYahoo: string;

interface CNKeyDescriptor extends NSCopying, NSObjectProtocol, NSSecureCoding {
}
declare var CNKeyDescriptor: {

	prototype: CNKeyDescriptor;
};

declare var CNLabelContactRelationAssistant: string;

declare var CNLabelContactRelationAunt: string;

declare var CNLabelContactRelationAuntFathersBrothersWife: string;

declare var CNLabelContactRelationAuntFathersElderBrothersWife: string;

declare var CNLabelContactRelationAuntFathersElderSister: string;

declare var CNLabelContactRelationAuntFathersSister: string;

declare var CNLabelContactRelationAuntFathersYoungerBrothersWife: string;

declare var CNLabelContactRelationAuntFathersYoungerSister: string;

declare var CNLabelContactRelationAuntMothersBrothersWife: string;

declare var CNLabelContactRelationAuntMothersElderSister: string;

declare var CNLabelContactRelationAuntMothersSister: string;

declare var CNLabelContactRelationAuntMothersYoungerSister: string;

declare var CNLabelContactRelationAuntParentsElderSister: string;

declare var CNLabelContactRelationAuntParentsSister: string;

declare var CNLabelContactRelationAuntParentsYoungerSister: string;

declare var CNLabelContactRelationBoyfriend: string;

declare var CNLabelContactRelationBrother: string;

declare var CNLabelContactRelationBrotherInLaw: string;

declare var CNLabelContactRelationBrotherInLawElderSistersHusband: string;

declare var CNLabelContactRelationBrotherInLawHusbandsBrother: string;

declare var CNLabelContactRelationBrotherInLawHusbandsSistersHusband: string;

declare var CNLabelContactRelationBrotherInLawSistersHusband: string;

declare var CNLabelContactRelationBrotherInLawSpousesBrother: string;

declare var CNLabelContactRelationBrotherInLawWifesBrother: string;

declare var CNLabelContactRelationBrotherInLawWifesSistersHusband: string;

declare var CNLabelContactRelationBrotherInLawYoungerSistersHusband: string;

declare var CNLabelContactRelationChild: string;

declare var CNLabelContactRelationChildInLaw: string;

declare var CNLabelContactRelationCoBrotherInLaw: string;

declare var CNLabelContactRelationCoFatherInLaw: string;

declare var CNLabelContactRelationCoMotherInLaw: string;

declare var CNLabelContactRelationCoParentInLaw: string;

declare var CNLabelContactRelationCoSiblingInLaw: string;

declare var CNLabelContactRelationCoSisterInLaw: string;

declare var CNLabelContactRelationColleague: string;

declare var CNLabelContactRelationCousin: string;

declare var CNLabelContactRelationCousinFathersBrothersDaughter: string;

declare var CNLabelContactRelationCousinFathersBrothersSon: string;

declare var CNLabelContactRelationCousinFathersSistersDaughter: string;

declare var CNLabelContactRelationCousinFathersSistersSon: string;

declare var CNLabelContactRelationCousinGrandparentsSiblingsChild: string;

declare var CNLabelContactRelationCousinGrandparentsSiblingsDaughter: string;

declare var CNLabelContactRelationCousinGrandparentsSiblingsSon: string;

declare var CNLabelContactRelationCousinMothersBrothersDaughter: string;

declare var CNLabelContactRelationCousinMothersBrothersSon: string;

declare var CNLabelContactRelationCousinMothersSistersDaughter: string;

declare var CNLabelContactRelationCousinMothersSistersSon: string;

declare var CNLabelContactRelationCousinOrSiblingsChild: string;

declare var CNLabelContactRelationCousinParentsSiblingsChild: string;

declare var CNLabelContactRelationCousinParentsSiblingsDaughter: string;

declare var CNLabelContactRelationCousinParentsSiblingsSon: string;

declare var CNLabelContactRelationDaughter: string;

declare var CNLabelContactRelationDaughterInLaw: string;

declare var CNLabelContactRelationDaughterInLawOrSisterInLaw: string;

declare var CNLabelContactRelationDaughterInLawOrStepdaughter: string;

declare var CNLabelContactRelationElderBrother: string;

declare var CNLabelContactRelationElderBrotherInLaw: string;

declare var CNLabelContactRelationElderCousin: string;

declare var CNLabelContactRelationElderCousinFathersBrothersDaughter: string;

declare var CNLabelContactRelationElderCousinFathersBrothersSon: string;

declare var CNLabelContactRelationElderCousinFathersSistersDaughter: string;

declare var CNLabelContactRelationElderCousinFathersSistersSon: string;

declare var CNLabelContactRelationElderCousinMothersBrothersDaughter: string;

declare var CNLabelContactRelationElderCousinMothersBrothersSon: string;

declare var CNLabelContactRelationElderCousinMothersSiblingsDaughterOrFathersSistersDaughter: string;

declare var CNLabelContactRelationElderCousinMothersSiblingsSonOrFathersSistersSon: string;

declare var CNLabelContactRelationElderCousinMothersSistersDaughter: string;

declare var CNLabelContactRelationElderCousinMothersSistersSon: string;

declare var CNLabelContactRelationElderCousinParentsSiblingsDaughter: string;

declare var CNLabelContactRelationElderCousinParentsSiblingsSon: string;

declare var CNLabelContactRelationElderSibling: string;

declare var CNLabelContactRelationElderSiblingInLaw: string;

declare var CNLabelContactRelationElderSister: string;

declare var CNLabelContactRelationElderSisterInLaw: string;

declare var CNLabelContactRelationEldestBrother: string;

declare var CNLabelContactRelationEldestSister: string;

declare var CNLabelContactRelationFather: string;

declare var CNLabelContactRelationFatherInLaw: string;

declare var CNLabelContactRelationFatherInLawHusbandsFather: string;

declare var CNLabelContactRelationFatherInLawOrStepfather: string;

declare var CNLabelContactRelationFatherInLawWifesFather: string;

declare var CNLabelContactRelationFemaleCousin: string;

declare var CNLabelContactRelationFemaleFriend: string;

declare var CNLabelContactRelationFemalePartner: string;

declare var CNLabelContactRelationFriend: string;

declare var CNLabelContactRelationGirlfriend: string;

declare var CNLabelContactRelationGirlfriendOrBoyfriend: string;

declare var CNLabelContactRelationGrandaunt: string;

declare var CNLabelContactRelationGrandchild: string;

declare var CNLabelContactRelationGrandchildOrSiblingsChild: string;

declare var CNLabelContactRelationGranddaughter: string;

declare var CNLabelContactRelationGranddaughterDaughtersDaughter: string;

declare var CNLabelContactRelationGranddaughterSonsDaughter: string;

declare var CNLabelContactRelationGrandfather: string;

declare var CNLabelContactRelationGrandfatherFathersFather: string;

declare var CNLabelContactRelationGrandfatherMothersFather: string;

declare var CNLabelContactRelationGrandmother: string;

declare var CNLabelContactRelationGrandmotherFathersMother: string;

declare var CNLabelContactRelationGrandmotherMothersMother: string;

declare var CNLabelContactRelationGrandnephew: string;

declare var CNLabelContactRelationGrandnephewBrothersGrandson: string;

declare var CNLabelContactRelationGrandnephewSistersGrandson: string;

declare var CNLabelContactRelationGrandniece: string;

declare var CNLabelContactRelationGrandnieceBrothersGranddaughter: string;

declare var CNLabelContactRelationGrandnieceSistersGranddaughter: string;

declare var CNLabelContactRelationGrandparent: string;

declare var CNLabelContactRelationGrandson: string;

declare var CNLabelContactRelationGrandsonDaughtersSon: string;

declare var CNLabelContactRelationGrandsonSonsSon: string;

declare var CNLabelContactRelationGranduncle: string;

declare var CNLabelContactRelationGreatGrandchild: string;

declare var CNLabelContactRelationGreatGrandchildOrSiblingsGrandchild: string;

declare var CNLabelContactRelationGreatGranddaughter: string;

declare var CNLabelContactRelationGreatGrandfather: string;

declare var CNLabelContactRelationGreatGrandmother: string;

declare var CNLabelContactRelationGreatGrandparent: string;

declare var CNLabelContactRelationGreatGrandson: string;

declare var CNLabelContactRelationHusband: string;

declare var CNLabelContactRelationMaleCousin: string;

declare var CNLabelContactRelationMaleFriend: string;

declare var CNLabelContactRelationMalePartner: string;

declare var CNLabelContactRelationManager: string;

declare var CNLabelContactRelationMother: string;

declare var CNLabelContactRelationMotherInLaw: string;

declare var CNLabelContactRelationMotherInLawHusbandsMother: string;

declare var CNLabelContactRelationMotherInLawOrStepmother: string;

declare var CNLabelContactRelationMotherInLawWifesMother: string;

declare var CNLabelContactRelationNephew: string;

declare var CNLabelContactRelationNephewBrothersSon: string;

declare var CNLabelContactRelationNephewBrothersSonOrHusbandsSiblingsSon: string;

declare var CNLabelContactRelationNephewOrCousin: string;

declare var CNLabelContactRelationNephewSistersSon: string;

declare var CNLabelContactRelationNephewSistersSonOrWifesSiblingsSon: string;

declare var CNLabelContactRelationNiece: string;

declare var CNLabelContactRelationNieceBrothersDaughter: string;

declare var CNLabelContactRelationNieceBrothersDaughterOrHusbandsSiblingsDaughter: string;

declare var CNLabelContactRelationNieceOrCousin: string;

declare var CNLabelContactRelationNieceSistersDaughter: string;

declare var CNLabelContactRelationNieceSistersDaughterOrWifesSiblingsDaughter: string;

declare var CNLabelContactRelationParent: string;

declare var CNLabelContactRelationParentInLaw: string;

declare var CNLabelContactRelationParentsElderSibling: string;

declare var CNLabelContactRelationParentsSibling: string;

declare var CNLabelContactRelationParentsSiblingFathersElderSibling: string;

declare var CNLabelContactRelationParentsSiblingFathersSibling: string;

declare var CNLabelContactRelationParentsSiblingFathersYoungerSibling: string;

declare var CNLabelContactRelationParentsSiblingMothersElderSibling: string;

declare var CNLabelContactRelationParentsSiblingMothersSibling: string;

declare var CNLabelContactRelationParentsSiblingMothersYoungerSibling: string;

declare var CNLabelContactRelationParentsYoungerSibling: string;

declare var CNLabelContactRelationPartner: string;

declare var CNLabelContactRelationSibling: string;

declare var CNLabelContactRelationSiblingInLaw: string;

declare var CNLabelContactRelationSiblingsChild: string;

declare var CNLabelContactRelationSister: string;

declare var CNLabelContactRelationSisterInLaw: string;

declare var CNLabelContactRelationSisterInLawBrothersWife: string;

declare var CNLabelContactRelationSisterInLawElderBrothersWife: string;

declare var CNLabelContactRelationSisterInLawHusbandsBrothersWife: string;

declare var CNLabelContactRelationSisterInLawHusbandsSister: string;

declare var CNLabelContactRelationSisterInLawSpousesSister: string;

declare var CNLabelContactRelationSisterInLawWifesBrothersWife: string;

declare var CNLabelContactRelationSisterInLawWifesSister: string;

declare var CNLabelContactRelationSisterInLawYoungerBrothersWife: string;

declare var CNLabelContactRelationSon: string;

declare var CNLabelContactRelationSonInLaw: string;

declare var CNLabelContactRelationSonInLawOrBrotherInLaw: string;

declare var CNLabelContactRelationSonInLawOrStepson: string;

declare var CNLabelContactRelationSpouse: string;

declare var CNLabelContactRelationStepbrother: string;

declare var CNLabelContactRelationStepchild: string;

declare var CNLabelContactRelationStepdaughter: string;

declare var CNLabelContactRelationStepfather: string;

declare var CNLabelContactRelationStepmother: string;

declare var CNLabelContactRelationStepparent: string;

declare var CNLabelContactRelationStepsister: string;

declare var CNLabelContactRelationStepson: string;

declare var CNLabelContactRelationTeacher: string;

declare var CNLabelContactRelationUncle: string;

declare var CNLabelContactRelationUncleFathersBrother: string;

declare var CNLabelContactRelationUncleFathersElderBrother: string;

declare var CNLabelContactRelationUncleFathersElderSistersHusband: string;

declare var CNLabelContactRelationUncleFathersSistersHusband: string;

declare var CNLabelContactRelationUncleFathersYoungerBrother: string;

declare var CNLabelContactRelationUncleFathersYoungerSistersHusband: string;

declare var CNLabelContactRelationUncleMothersBrother: string;

declare var CNLabelContactRelationUncleMothersElderBrother: string;

declare var CNLabelContactRelationUncleMothersSistersHusband: string;

declare var CNLabelContactRelationUncleMothersYoungerBrother: string;

declare var CNLabelContactRelationUncleParentsBrother: string;

declare var CNLabelContactRelationUncleParentsElderBrother: string;

declare var CNLabelContactRelationUncleParentsYoungerBrother: string;

declare var CNLabelContactRelationWife: string;

declare var CNLabelContactRelationYoungerBrother: string;

declare var CNLabelContactRelationYoungerBrotherInLaw: string;

declare var CNLabelContactRelationYoungerCousin: string;

declare var CNLabelContactRelationYoungerCousinFathersBrothersDaughter: string;

declare var CNLabelContactRelationYoungerCousinFathersBrothersSon: string;

declare var CNLabelContactRelationYoungerCousinFathersSistersDaughter: string;

declare var CNLabelContactRelationYoungerCousinFathersSistersSon: string;

declare var CNLabelContactRelationYoungerCousinMothersBrothersDaughter: string;

declare var CNLabelContactRelationYoungerCousinMothersBrothersSon: string;

declare var CNLabelContactRelationYoungerCousinMothersSiblingsDaughterOrFathersSistersDaughter: string;

declare var CNLabelContactRelationYoungerCousinMothersSiblingsSonOrFathersSistersSon: string;

declare var CNLabelContactRelationYoungerCousinMothersSistersDaughter: string;

declare var CNLabelContactRelationYoungerCousinMothersSistersSon: string;

declare var CNLabelContactRelationYoungerCousinParentsSiblingsDaughter: string;

declare var CNLabelContactRelationYoungerCousinParentsSiblingsSon: string;

declare var CNLabelContactRelationYoungerSibling: string;

declare var CNLabelContactRelationYoungerSiblingInLaw: string;

declare var CNLabelContactRelationYoungerSister: string;

declare var CNLabelContactRelationYoungerSisterInLaw: string;

declare var CNLabelContactRelationYoungestBrother: string;

declare var CNLabelContactRelationYoungestSister: string;

declare var CNLabelDateAnniversary: string;

declare var CNLabelEmailiCloud: string;

declare var CNLabelHome: string;

declare var CNLabelOther: string;

declare var CNLabelPhoneNumberHomeFax: string;

declare var CNLabelPhoneNumberMain: string;

declare var CNLabelPhoneNumberMobile: string;

declare var CNLabelPhoneNumberOtherFax: string;

declare var CNLabelPhoneNumberPager: string;

declare var CNLabelPhoneNumberWorkFax: string;

declare var CNLabelPhoneNumberiPhone: string;

declare var CNLabelSchool: string;

declare var CNLabelURLAddressHomePage: string;

declare var CNLabelWork: string;

declare class CNLabeledValue<ValueType> extends NSObject implements NSCopying, NSSecureCoding {

	static alloc<ValueType>(): CNLabeledValue<ValueType>; // inherited from NSObject

	static labeledValueWithLabelValue<ValueType>(label: string, value: ValueType): CNLabeledValue<ValueType>;

	static localizedStringForLabel(label: string): string;

	static new<ValueType>(): CNLabeledValue<ValueType>; // inherited from NSObject

	readonly identifier: string;

	readonly label: string;

	readonly value: ValueType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { label: string; value: ValueType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLabelValue(label: string, value: ValueType): this;

	labeledValueBySettingLabel(label: string): this;

	labeledValueBySettingLabelValue(label: string, value: ValueType): this;

	labeledValueBySettingValue(value: ValueType): this;
}

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

declare class CNMutableGroup extends CNGroup {

	static alloc(): CNMutableGroup; // inherited from NSObject

	static new(): CNMutableGroup; // inherited from NSObject

	name: string;
}

declare class CNMutablePostalAddress extends CNPostalAddress {

	static alloc(): CNMutablePostalAddress; // inherited from NSObject

	static new(): CNMutablePostalAddress; // inherited from NSObject

	ISOCountryCode: string;

	city: string;

	country: string;

	postalCode: string;

	state: string;

	street: string;

	subAdministrativeArea: string;

	subLocality: string;
}

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

	readonly subAdministrativeArea: string;

	readonly subLocality: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var CNPostalAddressCityKey: string;

declare var CNPostalAddressCountryKey: string;

declare class CNPostalAddressFormatter extends NSFormatter {

	static alloc(): CNPostalAddressFormatter; // inherited from NSObject

	static attributedStringFromPostalAddressStyleWithDefaultAttributes(postalAddress: CNPostalAddress, style: CNPostalAddressFormatterStyle, attributes: NSDictionary<any, any>): NSAttributedString;

	static new(): CNPostalAddressFormatter; // inherited from NSObject

	static stringFromPostalAddressStyle(postalAddress: CNPostalAddress, style: CNPostalAddressFormatterStyle): string;

	style: CNPostalAddressFormatterStyle;

	attributedStringFromPostalAddressWithDefaultAttributes(postalAddress: CNPostalAddress, attributes: NSDictionary<any, any>): NSAttributedString;

	stringFromPostalAddress(postalAddress: CNPostalAddress): string;
}

declare const enum CNPostalAddressFormatterStyle {

	MailingAddress = 0
}

declare var CNPostalAddressISOCountryCodeKey: string;

declare var CNPostalAddressLocalizedPropertyNameAttribute: string;

declare var CNPostalAddressPostalCodeKey: string;

declare var CNPostalAddressPropertyAttribute: string;

declare var CNPostalAddressStateKey: string;

declare var CNPostalAddressStreetKey: string;

declare var CNPostalAddressSubAdministrativeAreaKey: string;

declare var CNPostalAddressSubLocalityKey: string;

declare class CNSaveRequest extends NSObject {

	static alloc(): CNSaveRequest; // inherited from NSObject

	static new(): CNSaveRequest; // inherited from NSObject

	addContactToContainerWithIdentifier(contact: CNMutableContact, identifier: string): void;

	addGroupToContainerWithIdentifier(group: CNMutableGroup, identifier: string): void;

	addMemberToGroup(contact: CNContact, group: CNGroup): void;

	deleteContact(contact: CNMutableContact): void;

	deleteGroup(group: CNMutableGroup): void;

	removeMemberFromGroup(contact: CNContact, group: CNGroup): void;

	updateContact(contact: CNMutableContact): void;

	updateGroup(group: CNMutableGroup): void;
}

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

declare var CNSocialProfileServiceFacebook: string;

declare var CNSocialProfileServiceFlickr: string;

declare var CNSocialProfileServiceGameCenter: string;

declare var CNSocialProfileServiceKey: string;

declare var CNSocialProfileServiceLinkedIn: string;

declare var CNSocialProfileServiceMySpace: string;

declare var CNSocialProfileServiceSinaWeibo: string;

declare var CNSocialProfileServiceTencentWeibo: string;

declare var CNSocialProfileServiceTwitter: string;

declare var CNSocialProfileServiceYelp: string;

declare var CNSocialProfileURLStringKey: string;

declare var CNSocialProfileUserIdentifierKey: string;

declare var CNSocialProfileUsernameKey: string;
