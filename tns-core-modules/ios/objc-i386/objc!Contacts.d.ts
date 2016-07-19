
declare const enum CNAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare class CNContact extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): CNContact; // inherited from NSObject

	static comparatorForNameSortOrder(sortOrder: CNContactSortOrder): (p1: any, p2: any) => NSComparisonResult;

	static descriptorForAllComparatorKeys(): CNKeyDescriptor;

	static localizedStringForKey(key: string): string;

	static new(): CNContact; // inherited from NSObject

	static predicateForContactsInContainerWithIdentifier(containerIdentifier: string): NSPredicate;

	static predicateForContactsInGroupWithIdentifier(groupIdentifier: string): NSPredicate;

	static predicateForContactsMatchingName(name: string): NSPredicate;

	static predicateForContactsWithIdentifiers(identifiers: NSArray<string>): NSPredicate;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ birthday: NSDateComponents;

	/* readonly */ contactRelations: NSArray<CNLabeledValue<CNContactRelation>>;

	/* readonly */ contactType: CNContactType;

	/* readonly */ dates: NSArray<CNLabeledValue<NSDateComponents>>;

	/* readonly */ departmentName: string;

	/* readonly */ emailAddresses: NSArray<CNLabeledValue<string>>;

	/* readonly */ familyName: string;

	/* readonly */ givenName: string;

	/* readonly */ identifier: string;

	/* readonly */ imageData: NSData;

	/* readonly */ imageDataAvailable: boolean;

	/* readonly */ instantMessageAddresses: NSArray<CNLabeledValue<CNInstantMessageAddress>>;

	/* readonly */ jobTitle: string;

	/* readonly */ middleName: string;

	/* readonly */ namePrefix: string;

	/* readonly */ nameSuffix: string;

	/* readonly */ nickname: string;

	/* readonly */ nonGregorianBirthday: NSDateComponents;

	/* readonly */ note: string;

	/* readonly */ organizationName: string;

	/* readonly */ phoneNumbers: NSArray<CNLabeledValue<CNPhoneNumber>>;

	/* readonly */ phoneticFamilyName: string;

	/* readonly */ phoneticGivenName: string;

	/* readonly */ phoneticMiddleName: string;

	/* readonly */ postalAddresses: NSArray<CNLabeledValue<CNPostalAddress>>;

	/* readonly */ previousFamilyName: string;

	/* readonly */ socialProfiles: NSArray<CNLabeledValue<CNSocialProfile>>;

	/* readonly */ thumbnailImageData: NSData;

	/* readonly */ urlAddresses: NSArray<CNLabeledValue<string>>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	areKeysAvailable(keyDescriptors: NSArray<CNKeyDescriptor>): boolean;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	isKeyAvailable(key: string): boolean;

	isUnifiedWithContactWithIdentifier(contactIdentifier: string): boolean;

	mutableCopyWithZone(zone: interop.Pointer): any; // inherited from NSMutableCopying

	self(): CNContact; // inherited from NSObjectProtocol
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

declare class CNContactFetchRequest extends NSObject {

	static alloc(): CNContactFetchRequest; // inherited from NSObject

	static new(): CNContactFetchRequest; // inherited from NSObject

	keysToFetch: NSArray<CNKeyDescriptor>;

	mutableObjects: boolean;

	predicate: NSPredicate;

	sortOrder: CNContactSortOrder;

	unifyResults: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { keysToFetch: NSArray<CNKeyDescriptor>; });

	self(): CNContactFetchRequest; // inherited from NSObjectProtocol
}

declare class CNContactFormatter extends NSFormatter {

	static attributedStringFromContactStyleDefaultAttributes(contact: CNContact, style: CNContactFormatterStyle, attributes: NSDictionary<any, any>): NSAttributedString;

	static delimiterForContact(contact: CNContact): string;

	static descriptorForRequiredKeysForStyle(style: CNContactFormatterStyle): CNKeyDescriptor;

	static nameOrderForContact(contact: CNContact): CNContactDisplayNameOrder;

	static stringFromContactStyle(contact: CNContact, style: CNContactFormatterStyle): string;

	style: CNContactFormatterStyle;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	attributedStringFromContactDefaultAttributes(contact: CNContact, attributes: NSDictionary<any, any>): NSAttributedString;

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

declare var CNContactPostalAddressesKey: string;

declare var CNContactPreviousFamilyNameKey: string;

declare class CNContactProperty extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNContactProperty; // inherited from NSObject

	static new(): CNContactProperty; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ contact: CNContact;

	/* readonly */ identifier: string;

	/* readonly */ key: string;

	/* readonly */ label: string;

	/* readonly */ value: any;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CNContactProperty; // inherited from NSObjectProtocol
}

declare var CNContactPropertyAttribute: string;

declare var CNContactPropertyNotFetchedExceptionName: string;

declare class CNContactRelation extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNContactRelation; // inherited from NSObject

	static contactRelationWithName(name: string): CNContactRelation;

	static new(): CNContactRelation; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ name: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CNContactRelation; // inherited from NSObjectProtocol
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

	constructor(); // inherited from NSObject

	containersMatchingPredicateError(predicate: NSPredicate): NSArray<CNContainer>;

	defaultContainerIdentifier(): string;

	enumerateContactsWithFetchRequestErrorUsingBlock(fetchRequest: CNContactFetchRequest, error: interop.Reference<NSError>, block: (p1: CNContact, p2: interop.Reference<boolean>) => void): boolean;

	executeSaveRequestError(saveRequest: CNSaveRequest): boolean;

	groupsMatchingPredicateError(predicate: NSPredicate): NSArray<CNGroup>;

	requestAccessForEntityTypeCompletionHandler(entityType: CNEntityType, completionHandler: (p1: boolean, p2: NSError) => void): void;

	self(): CNContactStore; // inherited from NSObjectProtocol

	unifiedContactWithIdentifierKeysToFetchError(identifier: string, keys: NSArray<CNKeyDescriptor>): CNContact;

	unifiedContactsMatchingPredicateKeysToFetchError(predicate: NSPredicate, keys: NSArray<CNKeyDescriptor>): NSArray<CNContact>;
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

	static contactsWithDataError(data: NSData): NSArray<any>;

	static dataWithContactsError(contacts: NSArray<any>): NSData;

	static descriptorForRequiredKeys(): CNKeyDescriptor;

	static new(): CNContactVCardSerialization; // inherited from NSObject

	constructor(); // inherited from NSObject

	self(): CNContactVCardSerialization; // inherited from NSObjectProtocol
}

declare class CNContactsUserDefaults extends NSObject {

	static alloc(): CNContactsUserDefaults; // inherited from NSObject

	static new(): CNContactsUserDefaults; // inherited from NSObject

	static sharedDefaults(): CNContactsUserDefaults;

	/* readonly */ countryCode: string;

	/* readonly */ sortOrder: CNContactSortOrder;

	constructor(); // inherited from NSObject

	self(): CNContactsUserDefaults; // inherited from NSObjectProtocol
}

declare class CNContainer extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNContainer; // inherited from NSObject

	static new(): CNContainer; // inherited from NSObject

	static predicateForContainerOfContactWithIdentifier(contactIdentifier: string): NSPredicate;

	static predicateForContainerOfGroupWithIdentifier(groupIdentifier: string): NSPredicate;

	static predicateForContainersWithIdentifiers(identifiers: NSArray<string>): NSPredicate;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ identifier: string;

	/* readonly */ name: string;

	/* readonly */ type: CNContainerType;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CNContainer; // inherited from NSObjectProtocol
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

	RecordDoesNotExist = 200,

	InsertedRecordAlreadyExists = 201,

	ContainmentCycle = 202,

	ContainmentScope = 203,

	ParentRecordDoesNotExist = 204,

	ValidationMultipleErrors = 300,

	ValidationTypeMismatch = 301,

	ValidationConfigurationError = 302,

	PredicateInvalid = 400,

	PolicyViolation = 500
}

declare var CNErrorDomain: string;

declare var CNErrorUserInfoAffectedRecordIdentifiersKey: string;

declare var CNErrorUserInfoAffectedRecordsKey: string;

declare var CNErrorUserInfoKeyPathsKey: string;

declare var CNErrorUserInfoValidationErrorsKey: string;

declare class CNGroup extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): CNGroup; // inherited from NSObject

	static new(): CNGroup; // inherited from NSObject

	static predicateForGroupsInContainerWithIdentifier(containerIdentifier: string): NSPredicate;

	static predicateForGroupsWithIdentifiers(identifiers: NSArray<string>): NSPredicate;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ identifier: string;

	/* readonly */ name: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	mutableCopyWithZone(zone: interop.Pointer): any; // inherited from NSMutableCopying

	self(): CNGroup; // inherited from NSObjectProtocol
}

declare var CNGroupIdentifierKey: string;

declare var CNGroupNameKey: string;

declare class CNInstantMessageAddress extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNInstantMessageAddress; // inherited from NSObject

	static localizedStringForKey(key: string): string;

	static localizedStringForService(service: string): string;

	static new(): CNInstantMessageAddress; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ service: string;

	/* readonly */ username: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { username: string; service: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CNInstantMessageAddress; // inherited from NSObjectProtocol
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

	supportsSecureCoding(): boolean; // inherited from NSSecureCoding
};

declare var CNLabelContactRelationAssistant: string;

declare var CNLabelContactRelationBrother: string;

declare var CNLabelContactRelationChild: string;

declare var CNLabelContactRelationFather: string;

declare var CNLabelContactRelationFriend: string;

declare var CNLabelContactRelationManager: string;

declare var CNLabelContactRelationMother: string;

declare var CNLabelContactRelationParent: string;

declare var CNLabelContactRelationPartner: string;

declare var CNLabelContactRelationSister: string;

declare var CNLabelContactRelationSpouse: string;

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

declare var CNLabelURLAddressHomePage: string;

declare var CNLabelWork: string;

declare class CNLabeledValue<ValueType> extends NSObject implements NSCopying, NSSecureCoding {

	static alloc<ValueType>(): CNLabeledValue<ValueType>; // inherited from NSObject

	static labeledValueWithLabelValue<ValueType>(label: string, value: ValueType): CNLabeledValue<ValueType>;

	static localizedStringForLabel(label: string): string;

	static new<ValueType>(): CNLabeledValue<ValueType>; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ identifier: string;

	/* readonly */ label: string;

	/* readonly */ value: ValueType;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { label: string; value: ValueType; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	labeledValueBySettingLabel(label: string): CNLabeledValue<ValueType>;

	labeledValueBySettingLabelValue(label: string, value: ValueType): CNLabeledValue<ValueType>;

	labeledValueBySettingValue(value: ValueType): CNLabeledValue<ValueType>;

	self(): CNLabeledValue<ValueType>; // inherited from NSObjectProtocol
}

declare class CNMutableContact extends CNContact {

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

	postalAddresses: NSArray<CNLabeledValue<CNPostalAddress>>;

	previousFamilyName: string;

	socialProfiles: NSArray<CNLabeledValue<CNSocialProfile>>;

	urlAddresses: NSArray<CNLabeledValue<string>>;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class CNMutableGroup extends CNGroup {

	name: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class CNMutablePostalAddress extends CNPostalAddress {

	ISOCountryCode: string;

	city: string;

	country: string;

	postalCode: string;

	state: string;

	street: string;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
}

declare class CNPhoneNumber extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNPhoneNumber; // inherited from NSObject

	static new(): CNPhoneNumber; // inherited from NSObject

	static phoneNumberWithStringValue(stringValue: string): CNPhoneNumber;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ stringValue: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { stringValue: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CNPhoneNumber; // inherited from NSObjectProtocol
}

declare class CNPostalAddress extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): CNPostalAddress; // inherited from NSObject

	static localizedStringForKey(key: string): string;

	static new(): CNPostalAddress; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ ISOCountryCode: string;

	/* readonly */ city: string;

	/* readonly */ country: string;

	/* readonly */ postalCode: string;

	/* readonly */ state: string;

	/* readonly */ street: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	mutableCopyWithZone(zone: interop.Pointer): any; // inherited from NSMutableCopying

	self(): CNPostalAddress; // inherited from NSObjectProtocol
}

declare var CNPostalAddressCityKey: string;

declare var CNPostalAddressCountryKey: string;

declare class CNPostalAddressFormatter extends NSFormatter {

	static attributedStringFromPostalAddressStyleWithDefaultAttributes(postalAddress: CNPostalAddress, style: CNPostalAddressFormatterStyle, attributes: NSDictionary<any, any>): NSAttributedString;

	static stringFromPostalAddressStyle(postalAddress: CNPostalAddress, style: CNPostalAddressFormatterStyle): string;

	style: CNPostalAddressFormatterStyle;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

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

declare class CNSaveRequest extends NSObject {

	static alloc(): CNSaveRequest; // inherited from NSObject

	static new(): CNSaveRequest; // inherited from NSObject

	constructor(); // inherited from NSObject

	addContactToContainerWithIdentifier(contact: CNMutableContact, identifier: string): void;

	addGroupToContainerWithIdentifier(group: CNMutableGroup, identifier: string): void;

	addMemberToGroup(contact: CNContact, group: CNGroup): void;

	deleteContact(contact: CNMutableContact): void;

	deleteGroup(group: CNMutableGroup): void;

	removeMemberFromGroup(contact: CNContact, group: CNGroup): void;

	self(): CNSaveRequest; // inherited from NSObjectProtocol

	updateContact(contact: CNMutableContact): void;

	updateGroup(group: CNMutableGroup): void;
}

declare class CNSocialProfile extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CNSocialProfile; // inherited from NSObject

	static localizedStringForKey(key: string): string;

	static localizedStringForService(service: string): string;

	static new(): CNSocialProfile; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ service: string;

	/* readonly */ urlString: string;

	/* readonly */ userIdentifier: string;

	/* readonly */ username: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { urlString: string; username: string; userIdentifier: string; service: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CNSocialProfile; // inherited from NSObjectProtocol
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
