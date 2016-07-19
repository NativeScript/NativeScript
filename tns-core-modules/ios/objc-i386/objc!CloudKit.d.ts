
declare var CKAccountChangedNotification: string;

declare const enum CKAccountStatus {

	CouldNotDetermine = 0,

	Available = 1,

	Restricted = 2,

	NoAccount = 3
}

declare const enum CKApplicationPermissionStatus {

	InitialState = 0,

	CouldNotComplete = 1,

	Denied = 2,

	Granted = 3
}

declare const enum CKApplicationPermissions {

	UserDiscoverability = 1
}

declare class CKAsset extends NSObject implements CKRecordValue {

	static alloc(): CKAsset; // inherited from NSObject

	static new(): CKAsset; // inherited from NSObject

	/* readonly */ fileURL: NSURL;

	constructor(); // inherited from NSObject

	constructor(o: { fileURL: NSURL; });

	self(): CKAsset; // inherited from NSObjectProtocol
}

declare class CKContainer extends NSObject {

	static alloc(): CKContainer; // inherited from NSObject

	static containerWithIdentifier(containerIdentifier: string): CKContainer;

	static defaultContainer(): CKContainer;

	static new(): CKContainer; // inherited from NSObject

	/* readonly */ containerIdentifier: string;

	/* readonly */ privateCloudDatabase: CKDatabase;

	/* readonly */ publicCloudDatabase: CKDatabase;

	constructor(); // inherited from NSObject

	accountStatusWithCompletionHandler(completionHandler: (p1: CKAccountStatus, p2: NSError) => void): void;

	addOperation(operation: CKOperation): void;

	discoverAllContactUserInfosWithCompletionHandler(completionHandler: (p1: NSArray<CKDiscoveredUserInfo>, p2: NSError) => void): void;

	discoverUserInfoWithEmailAddressCompletionHandler(email: string, completionHandler: (p1: CKDiscoveredUserInfo, p2: NSError) => void): void;

	discoverUserInfoWithUserRecordIDCompletionHandler(userRecordID: CKRecordID, completionHandler: (p1: CKDiscoveredUserInfo, p2: NSError) => void): void;

	fetchAllLongLivedOperationIDsWithCompletionHandler(completionHandler: (p1: NSArray<string>, p2: NSError) => void): void;

	fetchLongLivedOperationWithIDCompletionHandler(operationID: string, completionHandler: (p1: CKOperation, p2: NSError) => void): void;

	fetchUserRecordIDWithCompletionHandler(completionHandler: (p1: CKRecordID, p2: NSError) => void): void;

	requestApplicationPermissionCompletionHandler(applicationPermission: CKApplicationPermissions, completionHandler: (p1: CKApplicationPermissionStatus, p2: NSError) => void): void;

	self(): CKContainer; // inherited from NSObjectProtocol

	statusForApplicationPermissionCompletionHandler(applicationPermission: CKApplicationPermissions, completionHandler: (p1: CKApplicationPermissionStatus, p2: NSError) => void): void;
}

declare class CKDatabase extends NSObject {

	static alloc(): CKDatabase; // inherited from NSObject

	static new(): CKDatabase; // inherited from NSObject

	constructor(); // inherited from NSObject

	addOperation(operation: CKDatabaseOperation): void;

	deleteRecordWithIDCompletionHandler(recordID: CKRecordID, completionHandler: (p1: CKRecordID, p2: NSError) => void): void;

	deleteRecordZoneWithIDCompletionHandler(zoneID: CKRecordZoneID, completionHandler: (p1: CKRecordZoneID, p2: NSError) => void): void;

	deleteSubscriptionWithIDCompletionHandler(subscriptionID: string, completionHandler: (p1: string, p2: NSError) => void): void;

	fetchAllRecordZonesWithCompletionHandler(completionHandler: (p1: NSArray<CKRecordZone>, p2: NSError) => void): void;

	fetchAllSubscriptionsWithCompletionHandler(completionHandler: (p1: NSArray<CKSubscription>, p2: NSError) => void): void;

	fetchRecordWithIDCompletionHandler(recordID: CKRecordID, completionHandler: (p1: CKRecord, p2: NSError) => void): void;

	fetchRecordZoneWithIDCompletionHandler(zoneID: CKRecordZoneID, completionHandler: (p1: CKRecordZone, p2: NSError) => void): void;

	fetchSubscriptionWithIDCompletionHandler(subscriptionID: string, completionHandler: (p1: CKSubscription, p2: NSError) => void): void;

	performQueryInZoneWithIDCompletionHandler(query: CKQuery, zoneID: CKRecordZoneID, completionHandler: (p1: NSArray<CKRecord>, p2: NSError) => void): void;

	saveRecordCompletionHandler(record: CKRecord, completionHandler: (p1: CKRecord, p2: NSError) => void): void;

	saveRecordZoneCompletionHandler(zone: CKRecordZone, completionHandler: (p1: CKRecordZone, p2: NSError) => void): void;

	saveSubscriptionCompletionHandler(subscription: CKSubscription, completionHandler: (p1: CKSubscription, p2: NSError) => void): void;

	self(): CKDatabase; // inherited from NSObjectProtocol
}

declare class CKDatabaseOperation extends CKOperation {

	database: CKDatabase;
}

declare class CKDiscoverAllContactsOperation extends CKOperation {

	discoverAllContactsCompletionBlock: (p1: NSArray<CKDiscoveredUserInfo>, p2: NSError) => void;
}

declare class CKDiscoverUserInfosOperation extends CKOperation {

	discoverUserInfosCompletionBlock: (p1: NSDictionary<string, CKDiscoveredUserInfo>, p2: NSDictionary<CKRecordID, CKDiscoveredUserInfo>, p3: NSError) => void;

	emailAddresses: NSArray<string>;

	userRecordIDs: NSArray<CKRecordID>;

	constructor(o: { emailAddresses: NSArray<string>; userRecordIDs: NSArray<CKRecordID>; });
}

declare class CKDiscoveredUserInfo extends NSObject {

	static alloc(): CKDiscoveredUserInfo; // inherited from NSObject

	static new(): CKDiscoveredUserInfo; // inherited from NSObject

	/* readonly */ displayContact: CNContact;

	/* readonly */ firstName: string;

	/* readonly */ lastName: string;

	/* readonly */ userRecordID: CKRecordID;

	constructor(); // inherited from NSObject

	self(): CKDiscoveredUserInfo; // inherited from NSObjectProtocol
}

declare const enum CKErrorCode {

	InternalError = 1,

	PartialFailure = 2,

	NetworkUnavailable = 3,

	NetworkFailure = 4,

	BadContainer = 5,

	ServiceUnavailable = 6,

	RequestRateLimited = 7,

	MissingEntitlement = 8,

	NotAuthenticated = 9,

	PermissionFailure = 10,

	UnknownItem = 11,

	InvalidArguments = 12,

	ResultsTruncated = 13,

	ServerRecordChanged = 14,

	ServerRejectedRequest = 15,

	AssetFileNotFound = 16,

	AssetFileModified = 17,

	IncompatibleVersion = 18,

	ConstraintViolation = 19,

	OperationCancelled = 20,

	ChangeTokenExpired = 21,

	BatchRequestFailed = 22,

	ZoneBusy = 23,

	BadDatabase = 24,

	QuotaExceeded = 25,

	ZoneNotFound = 26,

	LimitExceeded = 27,

	UserDeletedZone = 28
}

declare var CKErrorDomain: string;

declare var CKErrorRetryAfterKey: string;

declare class CKFetchNotificationChangesOperation extends CKOperation {

	fetchNotificationChangesCompletionBlock: (p1: CKServerChangeToken, p2: NSError) => void;

	/* readonly */ moreComing: boolean;

	notificationChangedBlock: (p1: CKNotification) => void;

	previousServerChangeToken: CKServerChangeToken;

	resultsLimit: number;

	constructor(o: { previousServerChangeToken: CKServerChangeToken; });
}

declare class CKFetchRecordChangesOperation extends CKDatabaseOperation {

	desiredKeys: NSArray<string>;

	fetchRecordChangesCompletionBlock: (p1: CKServerChangeToken, p2: NSData, p3: NSError) => void;

	/* readonly */ moreComing: boolean;

	previousServerChangeToken: CKServerChangeToken;

	recordChangedBlock: (p1: CKRecord) => void;

	recordWithIDWasDeletedBlock: (p1: CKRecordID) => void;

	recordZoneID: CKRecordZoneID;

	resultsLimit: number;

	constructor(o: { recordZoneID: CKRecordZoneID; previousServerChangeToken: CKServerChangeToken; });
}

declare class CKFetchRecordZonesOperation extends CKDatabaseOperation {

	static fetchAllRecordZonesOperation(): CKFetchRecordZonesOperation;

	fetchRecordZonesCompletionBlock: (p1: NSDictionary<CKRecordZoneID, CKRecordZone>, p2: NSError) => void;

	recordZoneIDs: NSArray<CKRecordZoneID>;

	constructor(o: { recordZoneIDs: NSArray<CKRecordZoneID>; });
}

declare class CKFetchRecordsOperation extends CKDatabaseOperation {

	static fetchCurrentUserRecordOperation(): CKFetchRecordsOperation;

	desiredKeys: NSArray<string>;

	fetchRecordsCompletionBlock: (p1: NSDictionary<CKRecordID, CKRecord>, p2: NSError) => void;

	perRecordCompletionBlock: (p1: CKRecord, p2: CKRecordID, p3: NSError) => void;

	perRecordProgressBlock: (p1: CKRecordID, p2: number) => void;

	recordIDs: NSArray<CKRecordID>;

	constructor(o: { recordIDs: NSArray<CKRecordID>; });
}

declare class CKFetchSubscriptionsOperation extends CKDatabaseOperation {

	static fetchAllSubscriptionsOperation(): CKFetchSubscriptionsOperation;

	fetchSubscriptionCompletionBlock: (p1: NSDictionary<string, CKSubscription>, p2: NSError) => void;

	subscriptionIDs: NSArray<string>;

	constructor(o: { subscriptionIDs: NSArray<string>; });
}

declare class CKFetchWebAuthTokenOperation extends CKDatabaseOperation {

	APIToken: string;

	fetchWebAuthTokenCompletionBlock: (p1: string, p2: NSError) => void;

	constructor(o: { APIToken: string; });
}

declare class CKLocationSortDescriptor extends NSSortDescriptor implements NSSecureCoding {

	static sortDescriptorWithKeyAscending(key: string, ascending: boolean): CKLocationSortDescriptor; // inherited from NSSortDescriptor

	static sortDescriptorWithKeyAscendingComparator(key: string, ascending: boolean, cmptr: (p1: any, p2: any) => NSComparisonResult): CKLocationSortDescriptor; // inherited from NSSortDescriptor

	static sortDescriptorWithKeyAscendingSelector(key: string, ascending: boolean, selector: string): CKLocationSortDescriptor; // inherited from NSSortDescriptor

	/* readonly */ relativeLocation: CLLocation;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { key: string; ascending: boolean; }); // inherited from NSSortDescriptor

	constructor(o: { key: string; ascending: boolean; comparator: (p1: any, p2: any) => NSComparisonResult; }); // inherited from NSSortDescriptor

	constructor(o: { key: string; ascending: boolean; selector: string; }); // inherited from NSSortDescriptor

	constructor(o: { key: string; relativeLocation: CLLocation; });
}

declare class CKMarkNotificationsReadOperation extends CKOperation {

	markNotificationsReadCompletionBlock: (p1: NSArray<CKNotificationID>, p2: NSError) => void;

	notificationIDs: NSArray<CKNotificationID>;

	constructor(o: { notificationIDsToMarkRead: NSArray<CKNotificationID>; });
}

declare class CKModifyBadgeOperation extends CKOperation {

	badgeValue: number;

	modifyBadgeCompletionBlock: (p1: NSError) => void;

	constructor(o: { badgeValue: number; });
}

declare class CKModifyRecordZonesOperation extends CKDatabaseOperation {

	modifyRecordZonesCompletionBlock: (p1: NSArray<CKRecordZone>, p2: NSArray<CKRecordZoneID>, p3: NSError) => void;

	recordZoneIDsToDelete: NSArray<CKRecordZoneID>;

	recordZonesToSave: NSArray<CKRecordZone>;

	constructor(o: { recordZonesToSave: NSArray<CKRecordZone>; recordZoneIDsToDelete: NSArray<CKRecordZoneID>; });
}

declare class CKModifyRecordsOperation extends CKDatabaseOperation {

	atomic: boolean;

	clientChangeTokenData: NSData;

	modifyRecordsCompletionBlock: (p1: NSArray<CKRecord>, p2: NSArray<CKRecordID>, p3: NSError) => void;

	perRecordCompletionBlock: (p1: CKRecord, p2: NSError) => void;

	perRecordProgressBlock: (p1: CKRecord, p2: number) => void;

	recordIDsToDelete: NSArray<CKRecordID>;

	recordsToSave: NSArray<CKRecord>;

	savePolicy: CKRecordSavePolicy;

	constructor(o: { recordsToSave: NSArray<CKRecord>; recordIDsToDelete: NSArray<CKRecordID>; });
}

declare class CKModifySubscriptionsOperation extends CKDatabaseOperation {

	modifySubscriptionsCompletionBlock: (p1: NSArray<CKSubscription>, p2: NSArray<string>, p3: NSError) => void;

	subscriptionIDsToDelete: NSArray<string>;

	subscriptionsToSave: NSArray<CKSubscription>;

	constructor(o: { subscriptionsToSave: NSArray<CKSubscription>; subscriptionIDsToDelete: NSArray<string>; });
}

declare class CKNotification extends NSObject {

	static alloc(): CKNotification; // inherited from NSObject

	static new(): CKNotification; // inherited from NSObject

	static notificationFromRemoteNotificationDictionary(notificationDictionary: NSDictionary<string, NSObject>): CKNotification;

	/* readonly */ alertActionLocalizationKey: string;

	/* readonly */ alertBody: string;

	/* readonly */ alertLaunchImage: string;

	/* readonly */ alertLocalizationArgs: NSArray<string>;

	/* readonly */ alertLocalizationKey: string;

	/* readonly */ badge: number;

	/* readonly */ category: string;

	/* readonly */ containerIdentifier: string;

	/* readonly */ isPruned: boolean;

	/* readonly */ notificationID: CKNotificationID;

	/* readonly */ notificationType: CKNotificationType;

	/* readonly */ soundName: string;

	/* readonly */ subscriptionID: string;

	constructor(); // inherited from NSObject

	self(): CKNotification; // inherited from NSObjectProtocol
}

declare class CKNotificationID extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKNotificationID; // inherited from NSObject

	static new(): CKNotificationID; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKNotificationID; // inherited from NSObjectProtocol
}

declare class CKNotificationInfo extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKNotificationInfo; // inherited from NSObject

	static new(): CKNotificationInfo; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	alertActionLocalizationKey: string;

	alertBody: string;

	alertLaunchImage: string;

	alertLocalizationArgs: NSArray<string>;

	alertLocalizationKey: string;

	category: string;

	desiredKeys: NSArray<string>;

	shouldBadge: boolean;

	shouldSendContentAvailable: boolean;

	soundName: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKNotificationInfo; // inherited from NSObjectProtocol
}

declare const enum CKNotificationType {

	Query = 1,

	RecordZone = 2,

	ReadNotification = 3
}

declare class CKOperation extends NSOperation {

	allowsCellularAccess: boolean;

	container: CKContainer;

	longLived: boolean;

	longLivedOperationWasPersistedBlock: () => void;

	/* readonly */ operationID: string;

	usesBackgroundSession: boolean;
}

declare var CKOwnerDefaultName: string;

declare var CKPartialErrorsByItemIDKey: string;

declare class CKQuery extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKQuery; // inherited from NSObject

	static new(): CKQuery; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ predicate: NSPredicate;

	/* readonly */ recordType: string;

	sortDescriptors: NSArray<NSSortDescriptor>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { recordType: string; predicate: NSPredicate; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKQuery; // inherited from NSObjectProtocol
}

declare class CKQueryCursor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKQueryCursor; // inherited from NSObject

	static new(): CKQueryCursor; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKQueryCursor; // inherited from NSObjectProtocol
}

declare class CKQueryNotification extends CKNotification {

	static notificationFromRemoteNotificationDictionary(notificationDictionary: NSDictionary<string, NSObject>): CKQueryNotification; // inherited from CKNotification

	/* readonly */ isPublicDatabase: boolean;

	/* readonly */ queryNotificationReason: CKQueryNotificationReason;

	/* readonly */ recordFields: NSDictionary<string, CKRecordValue>;

	/* readonly */ recordID: CKRecordID;
}

declare const enum CKQueryNotificationReason {

	RecordCreated = 1,

	RecordUpdated = 2,

	RecordDeleted = 3
}

declare class CKQueryOperation extends CKDatabaseOperation {

	cursor: CKQueryCursor;

	desiredKeys: NSArray<string>;

	query: CKQuery;

	queryCompletionBlock: (p1: CKQueryCursor, p2: NSError) => void;

	recordFetchedBlock: (p1: CKRecord) => void;

	resultsLimit: number;

	zoneID: CKRecordZoneID;

	constructor(o: { cursor: CKQueryCursor; });

	constructor(o: { query: CKQuery; });
}

declare var CKQueryOperationMaximumResults: number;

declare class CKRecord extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKRecord; // inherited from NSObject

	static new(): CKRecord; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ creationDate: Date;

	/* readonly */ creatorUserRecordID: CKRecordID;

	/* readonly */ lastModifiedUserRecordID: CKRecordID;

	/* readonly */ modificationDate: Date;

	/* readonly */ recordChangeTag: string;

	/* readonly */ recordID: CKRecordID;

	/* readonly */ recordType: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { recordType: string; });

	constructor(o: { recordType: string; recordID: CKRecordID; });

	constructor(o: { recordType: string; zoneID: CKRecordZoneID; });

	allKeys(): NSArray<string>;

	allTokens(): NSArray<string>;

	changedKeys(): NSArray<string>;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeSystemFieldsWithCoder(coder: NSCoder): void;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	objectForKey(key: string): CKRecordValue;

	objectForKeyedSubscript(key: string): CKRecordValue;

	self(): CKRecord; // inherited from NSObjectProtocol

	setObjectForKey(object: CKRecordValue, key: string): void;

	setObjectForKeyedSubscript(object: CKRecordValue, key: string): void;
}

declare var CKRecordChangedErrorAncestorRecordKey: string;

declare var CKRecordChangedErrorClientRecordKey: string;

declare var CKRecordChangedErrorServerRecordKey: string;

declare class CKRecordID extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKRecordID; // inherited from NSObject

	static new(): CKRecordID; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ recordName: string;

	/* readonly */ zoneID: CKRecordZoneID;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { recordName: string; });

	constructor(o: { recordName: string; zoneID: CKRecordZoneID; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKRecordID; // inherited from NSObjectProtocol
}

declare const enum CKRecordSavePolicy {

	IfServerRecordUnchanged = 0,

	ChangedKeys = 1,

	AllKeys = 2
}

declare var CKRecordTypeUserRecord: string;

interface CKRecordValue extends NSObjectProtocol {
}
declare var CKRecordValue: {

	prototype: CKRecordValue;
};

declare class CKRecordZone extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKRecordZone; // inherited from NSObject

	static defaultRecordZone(): CKRecordZone;

	static new(): CKRecordZone; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ capabilities: CKRecordZoneCapabilities;

	/* readonly */ zoneID: CKRecordZoneID;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { zoneID: CKRecordZoneID; });

	constructor(o: { zoneName: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKRecordZone; // inherited from NSObjectProtocol
}

declare const enum CKRecordZoneCapabilities {

	CapabilityFetchChanges = 1,

	CapabilityAtomic = 2
}

declare var CKRecordZoneDefaultName: string;

declare class CKRecordZoneID extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKRecordZoneID; // inherited from NSObject

	static new(): CKRecordZoneID; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ ownerName: string;

	/* readonly */ zoneName: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { zoneName: string; ownerName: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKRecordZoneID; // inherited from NSObjectProtocol
}

declare class CKRecordZoneNotification extends CKNotification {

	static notificationFromRemoteNotificationDictionary(notificationDictionary: NSDictionary<string, NSObject>): CKRecordZoneNotification; // inherited from CKNotification

	/* readonly */ recordZoneID: CKRecordZoneID;
}

declare class CKReference extends NSObject implements CKRecordValue, NSCopying, NSSecureCoding {

	static alloc(): CKReference; // inherited from NSObject

	static new(): CKReference; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ recordID: CKRecordID;

	/* readonly */ referenceAction: CKReferenceAction;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { record: CKRecord; action: CKReferenceAction; });

	constructor(o: { recordID: CKRecordID; action: CKReferenceAction; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKReference; // inherited from NSObjectProtocol
}

declare const enum CKReferenceAction {

	None = 0,

	DeleteSelf = 1
}

declare class CKServerChangeToken extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKServerChangeToken; // inherited from NSObject

	static new(): CKServerChangeToken; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKServerChangeToken; // inherited from NSObjectProtocol
}

declare class CKSubscription extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKSubscription; // inherited from NSObject

	static new(): CKSubscription; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	notificationInfo: CKNotificationInfo;

	/* readonly */ predicate: NSPredicate;

	/* readonly */ recordType: string;

	/* readonly */ subscriptionID: string;

	/* readonly */ subscriptionOptions: CKSubscriptionOptions;

	/* readonly */ subscriptionType: CKSubscriptionType;

	zoneID: CKRecordZoneID;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { recordType: string; predicate: NSPredicate; options: CKSubscriptionOptions; });

	constructor(o: { recordType: string; predicate: NSPredicate; subscriptionID: string; options: CKSubscriptionOptions; });

	constructor(o: { zoneID: CKRecordZoneID; options: CKSubscriptionOptions; });

	constructor(o: { zoneID: CKRecordZoneID; subscriptionID: string; options: CKSubscriptionOptions; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CKSubscription; // inherited from NSObjectProtocol
}

declare const enum CKSubscriptionOptions {

	FiresOnRecordCreation = 1,

	FiresOnRecordUpdate = 2,

	FiresOnRecordDeletion = 4,

	FiresOnce = 8
}

declare const enum CKSubscriptionType {

	Query = 1,

	RecordZone = 2
}
