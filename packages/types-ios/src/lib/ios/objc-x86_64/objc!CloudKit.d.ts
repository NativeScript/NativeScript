
/**
 * @since 10.0
 */
declare class CKAcceptSharesOperation extends CKOperation {

	static alloc(): CKAcceptSharesOperation; // inherited from NSObject

	static new(): CKAcceptSharesOperation; // inherited from NSObject

	acceptSharesCompletionBlock: (p1: NSError) => void;

	perShareCompletionBlock: (p1: CKShareMetadata, p2: CKShare, p3: NSError) => void;

	shareMetadatas: NSArray<CKShareMetadata>;

	constructor(o: { shareMetadatas: NSArray<CKShareMetadata> | CKShareMetadata[]; });

	initWithShareMetadatas(shareMetadatas: NSArray<CKShareMetadata> | CKShareMetadata[]): this;
}

/**
 * @since 9.0
 */
declare var CKAccountChangedNotification: string;

/**
 * @since 8.0
 */
declare const enum CKAccountStatus {

	CouldNotDetermine = 0,

	Available = 1,

	Restricted = 2,

	NoAccount = 3,

	TemporarilyUnavailable = 4
}

/**
 * @since 16.0
 */
declare class CKAllowedSharingOptions extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKAllowedSharingOptions; // inherited from NSObject

	static new(): CKAllowedSharingOptions; // inherited from NSObject

	allowedParticipantAccessOptions: CKSharingParticipantAccessOption;

	allowedParticipantPermissionOptions: CKSharingParticipantPermissionOption;

	static readonly standardOptions: CKAllowedSharingOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { allowedParticipantPermissionOptions: CKSharingParticipantPermissionOption; allowedParticipantAccessOptions: CKSharingParticipantAccessOption; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAllowedParticipantPermissionOptionsAllowedParticipantAccessOptions(allowedParticipantPermissionOptions: CKSharingParticipantPermissionOption, allowedParticipantAccessOptions: CKSharingParticipantAccessOption): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 * @deprecated 17.0
 */
declare const enum CKApplicationPermissionStatus {

	InitialState = 0,

	CouldNotComplete = 1,

	Denied = 2,

	Granted = 3
}

/**
 * @since 8.0
 */
declare const enum CKApplicationPermissions {

	UserDiscoverability = 1
}

/**
 * @since 8.0
 */
declare class CKAsset extends NSObject implements CKRecordValue {

	static alloc(): CKAsset; // inherited from NSObject

	static new(): CKAsset; // inherited from NSObject

	readonly fileURL: NSURL;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	constructor(o: { fileURL: NSURL; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	initWithFileURL(fileURL: NSURL): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 8.0
 */
declare class CKContainer extends NSObject {

	static alloc(): CKContainer; // inherited from NSObject

	static containerWithIdentifier(containerIdentifier: string): CKContainer;

	static defaultContainer(): CKContainer;

	static new(): CKContainer; // inherited from NSObject

	readonly containerIdentifier: string;

	readonly privateCloudDatabase: CKDatabase;

	readonly publicCloudDatabase: CKDatabase;

	/**
	 * @since 10.0
	 */
	readonly sharedCloudDatabase: CKDatabase;

	/**
	 * @since 10.0
	 */
	acceptShareMetadataCompletionHandler(metadata: CKShareMetadata, completionHandler: (p1: CKShare, p2: NSError) => void): void;

	accountStatusWithCompletionHandler(completionHandler: (p1: CKAccountStatus, p2: NSError) => void): void;

	addOperation(operation: CKOperation): void;

	/**
	 * @since 10.0
	 */
	databaseWithDatabaseScope(databaseScope: CKDatabaseScope): CKDatabase;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	discoverAllIdentitiesWithCompletionHandler(completionHandler: (p1: NSArray<CKUserIdentity>, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	discoverUserIdentityWithEmailAddressCompletionHandler(email: string, completionHandler: (p1: CKUserIdentity, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	discoverUserIdentityWithPhoneNumberCompletionHandler(phoneNumber: string, completionHandler: (p1: CKUserIdentity, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	discoverUserIdentityWithUserRecordIDCompletionHandler(userRecordID: CKRecordID, completionHandler: (p1: CKUserIdentity, p2: NSError) => void): void;

	/**
	 * @since 9.3
	 */
	fetchAllLongLivedOperationIDsWithCompletionHandler(completionHandler: (p1: NSArray<string>, p2: NSError) => void): void;

	/**
	 * @since 9.3
	 */
	fetchLongLivedOperationWithIDCompletionHandler(operationID: string, completionHandler: (p1: CKOperation, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	fetchShareMetadataWithURLCompletionHandler(url: NSURL, completionHandler: (p1: CKShareMetadata, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	fetchShareParticipantWithEmailAddressCompletionHandler(emailAddress: string, completionHandler: (p1: CKShareParticipant, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	fetchShareParticipantWithPhoneNumberCompletionHandler(phoneNumber: string, completionHandler: (p1: CKShareParticipant, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	fetchShareParticipantWithUserRecordIDCompletionHandler(userRecordID: CKRecordID, completionHandler: (p1: CKShareParticipant, p2: NSError) => void): void;

	fetchUserRecordIDWithCompletionHandler(completionHandler: (p1: CKRecordID, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	requestApplicationPermissionCompletionHandler(applicationPermission: CKApplicationPermissions, completionHandler: (p1: CKApplicationPermissionStatus, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	statusForApplicationPermissionCompletionHandler(applicationPermission: CKApplicationPermissions, completionHandler: (p1: CKApplicationPermissionStatus, p2: NSError) => void): void;
}

/**
 * @since 10.0
 */
declare var CKCurrentUserDefaultName: string;

/**
 * @since 8.0
 */
declare class CKDatabase extends NSObject {

	static alloc(): CKDatabase; // inherited from NSObject

	static new(): CKDatabase; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly databaseScope: CKDatabaseScope;

	addOperation(operation: CKDatabaseOperation): void;

	deleteRecordWithIDCompletionHandler(recordID: CKRecordID, completionHandler: (p1: CKRecordID, p2: NSError) => void): void;

	deleteRecordZoneWithIDCompletionHandler(zoneID: CKRecordZoneID, completionHandler: (p1: CKRecordZoneID, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	deleteSubscriptionWithIDCompletionHandler(subscriptionID: string, completionHandler: (p1: string, p2: NSError) => void): void;

	fetchAllRecordZonesWithCompletionHandler(completionHandler: (p1: NSArray<CKRecordZone>, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	fetchAllSubscriptionsWithCompletionHandler(completionHandler: (p1: NSArray<CKSubscription>, p2: NSError) => void): void;

	fetchRecordWithIDCompletionHandler(recordID: CKRecordID, completionHandler: (p1: CKRecord, p2: NSError) => void): void;

	fetchRecordZoneWithIDCompletionHandler(zoneID: CKRecordZoneID, completionHandler: (p1: CKRecordZone, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	fetchSubscriptionWithIDCompletionHandler(subscriptionID: string, completionHandler: (p1: CKSubscription, p2: NSError) => void): void;

	performQueryInZoneWithIDCompletionHandler(query: CKQuery, zoneID: CKRecordZoneID, completionHandler: (p1: NSArray<CKRecord>, p2: NSError) => void): void;

	saveRecordCompletionHandler(record: CKRecord, completionHandler: (p1: CKRecord, p2: NSError) => void): void;

	saveRecordZoneCompletionHandler(zone: CKRecordZone, completionHandler: (p1: CKRecordZone, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	saveSubscriptionCompletionHandler(subscription: CKSubscription, completionHandler: (p1: CKSubscription, p2: NSError) => void): void;
}

/**
 * @since 10.0
 */
declare class CKDatabaseNotification extends CKNotification {

	static alloc(): CKDatabaseNotification; // inherited from NSObject

	static new(): CKDatabaseNotification; // inherited from NSObject

	static notificationFromRemoteNotificationDictionary(notificationDictionary: NSDictionary<any, any>): CKDatabaseNotification; // inherited from CKNotification

	readonly databaseScope: CKDatabaseScope;
}

/**
 * @since 8.0
 */
declare class CKDatabaseOperation extends CKOperation {

	static alloc(): CKDatabaseOperation; // inherited from NSObject

	static new(): CKDatabaseOperation; // inherited from NSObject

	database: CKDatabase;
}

/**
 * @since 10.0
 */
declare const enum CKDatabaseScope {

	Public = 1,

	Private = 2,

	Shared = 3
}

/**
 * @since 10.0
 */
declare class CKDatabaseSubscription extends CKSubscription implements NSCopying, NSSecureCoding {

	static alloc(): CKDatabaseSubscription; // inherited from NSObject

	static new(): CKDatabaseSubscription; // inherited from NSObject

	recordType: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { subscriptionID: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSubscriptionID(subscriptionID: string): this;
}

/**
 * @since 10.0
 * @deprecated 17.0
 */
declare class CKDiscoverAllUserIdentitiesOperation extends CKOperation {

	static alloc(): CKDiscoverAllUserIdentitiesOperation; // inherited from NSObject

	static new(): CKDiscoverAllUserIdentitiesOperation; // inherited from NSObject

	discoverAllUserIdentitiesCompletionBlock: (p1: NSError) => void;

	userIdentityDiscoveredBlock: (p1: CKUserIdentity) => void;
}

/**
 * @since 10.0
 * @deprecated 17.0
 */
declare class CKDiscoverUserIdentitiesOperation extends CKOperation {

	static alloc(): CKDiscoverUserIdentitiesOperation; // inherited from NSObject

	static new(): CKDiscoverUserIdentitiesOperation; // inherited from NSObject

	discoverUserIdentitiesCompletionBlock: (p1: NSError) => void;

	userIdentityDiscoveredBlock: (p1: CKUserIdentity, p2: CKUserIdentityLookupInfo) => void;

	userIdentityLookupInfos: NSArray<CKUserIdentityLookupInfo>;

	constructor(o: { userIdentityLookupInfos: NSArray<CKUserIdentityLookupInfo> | CKUserIdentityLookupInfo[]; });

	initWithUserIdentityLookupInfos(userIdentityLookupInfos: NSArray<CKUserIdentityLookupInfo> | CKUserIdentityLookupInfo[]): this;
}

/**
 * @since 8.0
 */
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

	UserDeletedZone = 28,

	TooManyParticipants = 29,

	AlreadyShared = 30,

	ReferenceViolation = 31,

	ManagedAccountRestricted = 32,

	ParticipantMayNeedVerification = 33,

	ServerResponseLost = 34,

	AssetNotAvailable = 35,

	AccountTemporarilyUnavailable = 36
}

/**
 * @since 8.0
 */
declare var CKErrorDomain: string;

/**
 * @since 8.0
 */
declare var CKErrorRetryAfterKey: string;

/**
 * @since 15.0
 */
declare var CKErrorUserDidResetEncryptedDataKey: string;

/**
 * @since 10.0
 */
declare class CKFetchDatabaseChangesOperation extends CKDatabaseOperation {

	static alloc(): CKFetchDatabaseChangesOperation; // inherited from NSObject

	static new(): CKFetchDatabaseChangesOperation; // inherited from NSObject

	changeTokenUpdatedBlock: (p1: CKServerChangeToken) => void;

	fetchAllChanges: boolean;

	fetchDatabaseChangesCompletionBlock: (p1: CKServerChangeToken, p2: boolean, p3: NSError) => void;

	previousServerChangeToken: CKServerChangeToken;

	recordZoneWithIDChangedBlock: (p1: CKRecordZoneID) => void;

	recordZoneWithIDWasDeletedBlock: (p1: CKRecordZoneID) => void;

	/**
	 * @since 15.0
	 */
	recordZoneWithIDWasDeletedDueToUserEncryptedDataResetBlock: (p1: CKRecordZoneID) => void;

	/**
	 * @since 11.0
	 */
	recordZoneWithIDWasPurgedBlock: (p1: CKRecordZoneID) => void;

	resultsLimit: number;

	constructor(o: { previousServerChangeToken: CKServerChangeToken; });

	initWithPreviousServerChangeToken(previousServerChangeToken: CKServerChangeToken): this;
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare class CKFetchRecordChangesOperation extends CKDatabaseOperation {

	static alloc(): CKFetchRecordChangesOperation; // inherited from NSObject

	static new(): CKFetchRecordChangesOperation; // inherited from NSObject

	desiredKeys: NSArray<string>;

	fetchRecordChangesCompletionBlock: (p1: CKServerChangeToken, p2: NSData, p3: NSError) => void;

	readonly moreComing: boolean;

	previousServerChangeToken: CKServerChangeToken;

	recordChangedBlock: (p1: CKRecord) => void;

	recordWithIDWasDeletedBlock: (p1: CKRecordID) => void;

	recordZoneID: CKRecordZoneID;

	resultsLimit: number;

	constructor(o: { recordZoneID: CKRecordZoneID; previousServerChangeToken: CKServerChangeToken; });

	initWithRecordZoneIDPreviousServerChangeToken(recordZoneID: CKRecordZoneID, previousServerChangeToken: CKServerChangeToken): this;
}

/**
 * @since 12.0
 */
declare class CKFetchRecordZoneChangesConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKFetchRecordZoneChangesConfiguration; // inherited from NSObject

	static new(): CKFetchRecordZoneChangesConfiguration; // inherited from NSObject

	desiredKeys: NSArray<string>;

	previousServerChangeToken: CKServerChangeToken;

	resultsLimit: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class CKFetchRecordZoneChangesOperation extends CKDatabaseOperation {

	static alloc(): CKFetchRecordZoneChangesOperation; // inherited from NSObject

	static new(): CKFetchRecordZoneChangesOperation; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	configurationsByRecordZoneID: NSDictionary<CKRecordZoneID, CKFetchRecordZoneChangesConfiguration>;

	fetchAllChanges: boolean;

	fetchRecordZoneChangesCompletionBlock: (p1: NSError) => void;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	optionsByRecordZoneID: NSDictionary<CKRecordZoneID, CKFetchRecordZoneChangesOptions>;

	/**
	 * @since 10.0
	 * @deprecated 15.0
	 */
	recordChangedBlock: (p1: CKRecord) => void;

	/**
	 * @since 15.0
	 */
	recordWasChangedBlock: (p1: CKRecordID, p2: CKRecord, p3: NSError) => void;

	recordWithIDWasDeletedBlock: (p1: CKRecordID, p2: string) => void;

	recordZoneChangeTokensUpdatedBlock: (p1: CKRecordZoneID, p2: CKServerChangeToken, p3: NSData) => void;

	recordZoneFetchCompletionBlock: (p1: CKRecordZoneID, p2: CKServerChangeToken, p3: NSData, p4: boolean, p5: NSError) => void;

	recordZoneIDs: NSArray<CKRecordZoneID>;

	/**
	 * @since 12.0
	 */
	constructor(o: { recordZoneIDs: NSArray<CKRecordZoneID> | CKRecordZoneID[]; configurationsByRecordZoneID: NSDictionary<CKRecordZoneID, CKFetchRecordZoneChangesConfiguration>; });

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	constructor(o: { recordZoneIDs: NSArray<CKRecordZoneID> | CKRecordZoneID[]; optionsByRecordZoneID: NSDictionary<CKRecordZoneID, CKFetchRecordZoneChangesOptions>; });

	/**
	 * @since 12.0
	 */
	initWithRecordZoneIDsConfigurationsByRecordZoneID(recordZoneIDs: NSArray<CKRecordZoneID> | CKRecordZoneID[], configurationsByRecordZoneID: NSDictionary<CKRecordZoneID, CKFetchRecordZoneChangesConfiguration>): this;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	initWithRecordZoneIDsOptionsByRecordZoneID(recordZoneIDs: NSArray<CKRecordZoneID> | CKRecordZoneID[], optionsByRecordZoneID: NSDictionary<CKRecordZoneID, CKFetchRecordZoneChangesOptions>): this;
}

/**
 * @since 10.0
 * @deprecated 12.0
 */
declare class CKFetchRecordZoneChangesOptions extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKFetchRecordZoneChangesOptions; // inherited from NSObject

	static new(): CKFetchRecordZoneChangesOptions; // inherited from NSObject

	desiredKeys: NSArray<string>;

	previousServerChangeToken: CKServerChangeToken;

	resultsLimit: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class CKFetchRecordZonesOperation extends CKDatabaseOperation {

	static alloc(): CKFetchRecordZonesOperation; // inherited from NSObject

	static fetchAllRecordZonesOperation(): CKFetchRecordZonesOperation;

	static new(): CKFetchRecordZonesOperation; // inherited from NSObject

	fetchRecordZonesCompletionBlock: (p1: NSDictionary<CKRecordZoneID, CKRecordZone>, p2: NSError) => void;

	/**
	 * @since 15.0
	 */
	perRecordZoneCompletionBlock: (p1: CKRecordZoneID, p2: CKRecordZone, p3: NSError) => void;

	recordZoneIDs: NSArray<CKRecordZoneID>;

	constructor(o: { recordZoneIDs: NSArray<CKRecordZoneID> | CKRecordZoneID[]; });

	initWithRecordZoneIDs(zoneIDs: NSArray<CKRecordZoneID> | CKRecordZoneID[]): this;
}

/**
 * @since 8.0
 */
declare class CKFetchRecordsOperation extends CKDatabaseOperation {

	static alloc(): CKFetchRecordsOperation; // inherited from NSObject

	static fetchCurrentUserRecordOperation(): CKFetchRecordsOperation;

	static new(): CKFetchRecordsOperation; // inherited from NSObject

	desiredKeys: NSArray<string>;

	fetchRecordsCompletionBlock: (p1: NSDictionary<CKRecordID, CKRecord>, p2: NSError) => void;

	perRecordCompletionBlock: (p1: CKRecord, p2: CKRecordID, p3: NSError) => void;

	perRecordProgressBlock: (p1: CKRecordID, p2: number) => void;

	recordIDs: NSArray<CKRecordID>;

	constructor(o: { recordIDs: NSArray<CKRecordID> | CKRecordID[]; });

	initWithRecordIDs(recordIDs: NSArray<CKRecordID> | CKRecordID[]): this;
}

/**
 * @since 10.0
 */
declare class CKFetchShareMetadataOperation extends CKOperation {

	static alloc(): CKFetchShareMetadataOperation; // inherited from NSObject

	static new(): CKFetchShareMetadataOperation; // inherited from NSObject

	fetchShareMetadataCompletionBlock: (p1: NSError) => void;

	perShareMetadataBlock: (p1: NSURL, p2: CKShareMetadata, p3: NSError) => void;

	rootRecordDesiredKeys: NSArray<string>;

	shareURLs: NSArray<NSURL>;

	shouldFetchRootRecord: boolean;

	constructor(o: { shareURLs: NSArray<NSURL> | NSURL[]; });

	initWithShareURLs(shareURLs: NSArray<NSURL> | NSURL[]): this;
}

/**
 * @since 10.0
 */
declare class CKFetchShareParticipantsOperation extends CKOperation {

	static alloc(): CKFetchShareParticipantsOperation; // inherited from NSObject

	static new(): CKFetchShareParticipantsOperation; // inherited from NSObject

	fetchShareParticipantsCompletionBlock: (p1: NSError) => void;

	perShareParticipantCompletionBlock: (p1: CKUserIdentityLookupInfo, p2: CKShareParticipant, p3: NSError) => void;

	/**
	 * @since 10.0
	 * @deprecated 15.0
	 */
	shareParticipantFetchedBlock: (p1: CKShareParticipant) => void;

	userIdentityLookupInfos: NSArray<CKUserIdentityLookupInfo>;

	constructor(o: { userIdentityLookupInfos: NSArray<CKUserIdentityLookupInfo> | CKUserIdentityLookupInfo[]; });

	initWithUserIdentityLookupInfos(userIdentityLookupInfos: NSArray<CKUserIdentityLookupInfo> | CKUserIdentityLookupInfo[]): this;
}

/**
 * @since 8.0
 */
declare class CKFetchSubscriptionsOperation extends CKDatabaseOperation {

	static alloc(): CKFetchSubscriptionsOperation; // inherited from NSObject

	static fetchAllSubscriptionsOperation(): CKFetchSubscriptionsOperation;

	static new(): CKFetchSubscriptionsOperation; // inherited from NSObject

	fetchSubscriptionCompletionBlock: (p1: NSDictionary<string, CKSubscription>, p2: NSError) => void;

	/**
	 * @since 15.0
	 */
	perSubscriptionCompletionBlock: (p1: string, p2: CKSubscription, p3: NSError) => void;

	subscriptionIDs: NSArray<string>;

	constructor(o: { subscriptionIDs: NSArray<string> | string[]; });

	initWithSubscriptionIDs(subscriptionIDs: NSArray<string> | string[]): this;
}

/**
 * @since 9.2
 */
declare class CKFetchWebAuthTokenOperation extends CKDatabaseOperation {

	static alloc(): CKFetchWebAuthTokenOperation; // inherited from NSObject

	static new(): CKFetchWebAuthTokenOperation; // inherited from NSObject

	APIToken: string;

	fetchWebAuthTokenCompletionBlock: (p1: string, p2: NSError) => void;

	constructor(o: { APIToken: string; });

	initWithAPIToken(APIToken: string): this;
}

/**
 * @since 8.0
 */
declare class CKLocationSortDescriptor extends NSSortDescriptor implements NSSecureCoding {

	static alloc(): CKLocationSortDescriptor; // inherited from NSObject

	static new(): CKLocationSortDescriptor; // inherited from NSObject

	/**
	 * @since 4.0
	 */
	static sortDescriptorWithKeyAscending(key: string, ascending: boolean): CKLocationSortDescriptor; // inherited from NSSortDescriptor

	/**
	 * @since 4.0
	 */
	static sortDescriptorWithKeyAscendingComparator(key: string, ascending: boolean, cmptr: (p1: any, p2: any) => NSComparisonResult): CKLocationSortDescriptor; // inherited from NSSortDescriptor

	/**
	 * @since 4.0
	 */
	static sortDescriptorWithKeyAscendingSelector(key: string, ascending: boolean, selector: string): CKLocationSortDescriptor; // inherited from NSSortDescriptor

	readonly relativeLocation: CLLocation;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { key: string; relativeLocation: CLLocation; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithKeyRelativeLocation(key: string, relativeLocation: CLLocation): this;
}

/**
 * @since 8.0
 */
declare class CKModifyRecordZonesOperation extends CKDatabaseOperation {

	static alloc(): CKModifyRecordZonesOperation; // inherited from NSObject

	static new(): CKModifyRecordZonesOperation; // inherited from NSObject

	modifyRecordZonesCompletionBlock: (p1: NSArray<CKRecordZone>, p2: NSArray<CKRecordZoneID>, p3: NSError) => void;

	/**
	 * @since 15.0
	 */
	perRecordZoneDeleteBlock: (p1: CKRecordZoneID, p2: NSError) => void;

	/**
	 * @since 15.0
	 */
	perRecordZoneSaveBlock: (p1: CKRecordZoneID, p2: CKRecordZone, p3: NSError) => void;

	recordZoneIDsToDelete: NSArray<CKRecordZoneID>;

	recordZonesToSave: NSArray<CKRecordZone>;

	constructor(o: { recordZonesToSave: NSArray<CKRecordZone> | CKRecordZone[]; recordZoneIDsToDelete: NSArray<CKRecordZoneID> | CKRecordZoneID[]; });

	initWithRecordZonesToSaveRecordZoneIDsToDelete(recordZonesToSave: NSArray<CKRecordZone> | CKRecordZone[], recordZoneIDsToDelete: NSArray<CKRecordZoneID> | CKRecordZoneID[]): this;
}

/**
 * @since 8.0
 */
declare class CKModifyRecordsOperation extends CKDatabaseOperation {

	static alloc(): CKModifyRecordsOperation; // inherited from NSObject

	static new(): CKModifyRecordsOperation; // inherited from NSObject

	atomic: boolean;

	clientChangeTokenData: NSData;

	modifyRecordsCompletionBlock: (p1: NSArray<CKRecord>, p2: NSArray<CKRecordID>, p3: NSError) => void;

	/**
	 * @since 8.0
	 * @deprecated 15.0
	 */
	perRecordCompletionBlock: (p1: CKRecord, p2: NSError) => void;

	/**
	 * @since 15.0
	 */
	perRecordDeleteBlock: (p1: CKRecordID, p2: NSError) => void;

	perRecordProgressBlock: (p1: CKRecord, p2: number) => void;

	/**
	 * @since 15.0
	 */
	perRecordSaveBlock: (p1: CKRecordID, p2: CKRecord, p3: NSError) => void;

	recordIDsToDelete: NSArray<CKRecordID>;

	recordsToSave: NSArray<CKRecord>;

	savePolicy: CKRecordSavePolicy;

	constructor(o: { recordsToSave: NSArray<CKRecord> | CKRecord[]; recordIDsToDelete: NSArray<CKRecordID> | CKRecordID[]; });

	initWithRecordsToSaveRecordIDsToDelete(records: NSArray<CKRecord> | CKRecord[], recordIDs: NSArray<CKRecordID> | CKRecordID[]): this;
}

/**
 * @since 8.0
 */
declare class CKModifySubscriptionsOperation extends CKDatabaseOperation {

	static alloc(): CKModifySubscriptionsOperation; // inherited from NSObject

	static new(): CKModifySubscriptionsOperation; // inherited from NSObject

	modifySubscriptionsCompletionBlock: (p1: NSArray<CKSubscription>, p2: NSArray<string>, p3: NSError) => void;

	/**
	 * @since 15.0
	 */
	perSubscriptionDeleteBlock: (p1: string, p2: NSError) => void;

	/**
	 * @since 15.0
	 */
	perSubscriptionSaveBlock: (p1: string, p2: CKSubscription, p3: NSError) => void;

	subscriptionIDsToDelete: NSArray<string>;

	subscriptionsToSave: NSArray<CKSubscription>;

	constructor(o: { subscriptionsToSave: NSArray<CKSubscription> | CKSubscription[]; subscriptionIDsToDelete: NSArray<string> | string[]; });

	initWithSubscriptionsToSaveSubscriptionIDsToDelete(subscriptionsToSave: NSArray<CKSubscription> | CKSubscription[], subscriptionIDsToDelete: NSArray<string> | string[]): this;
}

/**
 * @since 8.0
 */
declare class CKNotification extends NSObject {

	static alloc(): CKNotification; // inherited from NSObject

	static new(): CKNotification; // inherited from NSObject

	static notificationFromRemoteNotificationDictionary(notificationDictionary: NSDictionary<any, any>): CKNotification;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly alertActionLocalizationKey: string;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly alertBody: string;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly alertLaunchImage: string;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly alertLocalizationArgs: NSArray<string>;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly alertLocalizationKey: string;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly badge: number;

	/**
	 * @since 9.0
	 */
	readonly category: string;

	readonly containerIdentifier: string;

	readonly isPruned: boolean;

	readonly notificationID: CKNotificationID;

	readonly notificationType: CKNotificationType;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly soundName: string;

	/**
	 * @since 9.0
	 */
	readonly subscriptionID: string;

	/**
	 * @since 13.0
	 */
	readonly subscriptionOwnerUserRecordID: CKRecordID;

	/**
	 * @since 11.0
	 */
	readonly subtitle: string;

	/**
	 * @since 11.0
	 */
	readonly subtitleLocalizationArgs: NSArray<string>;

	/**
	 * @since 11.0
	 */
	readonly subtitleLocalizationKey: string;

	/**
	 * @since 11.0
	 */
	readonly title: string;

	/**
	 * @since 11.0
	 */
	readonly titleLocalizationArgs: NSArray<string>;

	/**
	 * @since 11.0
	 */
	readonly titleLocalizationKey: string;
}

/**
 * @since 8.0
 */
declare class CKNotificationID extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKNotificationID; // inherited from NSObject

	static new(): CKNotificationID; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class CKNotificationInfo extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKNotificationInfo; // inherited from NSObject

	static new(): CKNotificationInfo; // inherited from NSObject

	alertActionLocalizationKey: string;

	alertBody: string;

	alertLaunchImage: string;

	alertLocalizationArgs: NSArray<string>;

	alertLocalizationKey: string;

	/**
	 * @since 9.0
	 */
	category: string;

	/**
	 * @since 11.0
	 */
	collapseIDKey: string;

	desiredKeys: NSArray<string>;

	shouldBadge: boolean;

	shouldSendContentAvailable: boolean;

	/**
	 * @since 11.0
	 */
	shouldSendMutableContent: boolean;

	soundName: string;

	/**
	 * @since 11.0
	 */
	subtitle: string;

	/**
	 * @since 11.0
	 */
	subtitleLocalizationArgs: NSArray<string>;

	/**
	 * @since 11.0
	 */
	subtitleLocalizationKey: string;

	/**
	 * @since 11.0
	 */
	title: string;

	/**
	 * @since 11.0
	 */
	titleLocalizationArgs: NSArray<string>;

	/**
	 * @since 11.0
	 */
	titleLocalizationKey: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare const enum CKNotificationType {

	Query = 1,

	RecordZone = 2,

	ReadNotification = 3,

	Database = 4
}

/**
 * @since 8.0
 */
declare class CKOperation extends NSOperation {

	static alloc(): CKOperation; // inherited from NSObject

	static new(): CKOperation; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	allowsCellularAccess: boolean;

	/**
	 * @since 11.0
	 */
	configuration: CKOperationConfiguration;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	container: CKContainer;

	/**
	 * @since 11.0
	 */
	group: CKOperationGroup;

	/**
	 * @since 9.3
	 * @deprecated 11.0
	 */
	longLived: boolean;

	/**
	 * @since 9.3
	 */
	longLivedOperationWasPersistedBlock: () => void;

	/**
	 * @since 9.3
	 */
	readonly operationID: string;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	timeoutIntervalForRequest: number;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	timeoutIntervalForResource: number;
}

/**
 * @since 11.0
 */
declare class CKOperationConfiguration extends NSObject {

	static alloc(): CKOperationConfiguration; // inherited from NSObject

	static new(): CKOperationConfiguration; // inherited from NSObject

	allowsCellularAccess: boolean;

	container: CKContainer;

	longLived: boolean;

	qualityOfService: NSQualityOfService;

	timeoutIntervalForRequest: number;

	timeoutIntervalForResource: number;
}

/**
 * @since 11.0
 */
declare class CKOperationGroup extends NSObject implements NSSecureCoding {

	static alloc(): CKOperationGroup; // inherited from NSObject

	static new(): CKOperationGroup; // inherited from NSObject

	defaultConfiguration: CKOperationConfiguration;

	expectedReceiveSize: CKOperationGroupTransferSize;

	expectedSendSize: CKOperationGroupTransferSize;

	name: string;

	readonly operationGroupID: string;

	quantity: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare const enum CKOperationGroupTransferSize {

	Unknown = 0,

	Kilobytes = 1,

	Megabytes = 2,

	TensOfMegabytes = 3,

	HundredsOfMegabytes = 4,

	Gigabytes = 5,

	TensOfGigabytes = 6,

	HundredsOfGigabytes = 7
}

/**
 * @since 8.0
 * @deprecated 10.0
 */
declare var CKOwnerDefaultName: string;

/**
 * @since 8.0
 */
declare var CKPartialErrorsByItemIDKey: string;

/**
 * @since 8.0
 */
declare class CKQuery extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKQuery; // inherited from NSObject

	static new(): CKQuery; // inherited from NSObject

	readonly predicate: NSPredicate;

	readonly recordType: string;

	sortDescriptors: NSArray<NSSortDescriptor>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { recordType: string; predicate: NSPredicate; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRecordTypePredicate(recordType: string, predicate: NSPredicate): this;
}

/**
 * @since 8.0
 */
declare class CKQueryCursor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKQueryCursor; // inherited from NSObject

	static new(): CKQueryCursor; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class CKQueryNotification extends CKNotification {

	static alloc(): CKQueryNotification; // inherited from NSObject

	static new(): CKQueryNotification; // inherited from NSObject

	static notificationFromRemoteNotificationDictionary(notificationDictionary: NSDictionary<any, any>): CKQueryNotification; // inherited from CKNotification

	/**
	 * @since 10.0
	 */
	readonly databaseScope: CKDatabaseScope;

	readonly queryNotificationReason: CKQueryNotificationReason;

	readonly recordFields: NSDictionary<string, any>;

	readonly recordID: CKRecordID;
}

/**
 * @since 8.0
 */
declare const enum CKQueryNotificationReason {

	RecordCreated = 1,

	RecordUpdated = 2,

	RecordDeleted = 3
}

/**
 * @since 8.0
 */
declare class CKQueryOperation extends CKDatabaseOperation {

	static alloc(): CKQueryOperation; // inherited from NSObject

	static new(): CKQueryOperation; // inherited from NSObject

	cursor: CKQueryCursor;

	desiredKeys: NSArray<string>;

	query: CKQuery;

	queryCompletionBlock: (p1: CKQueryCursor, p2: NSError) => void;

	/**
	 * @since 8.0
	 * @deprecated 15.0
	 */
	recordFetchedBlock: (p1: CKRecord) => void;

	/**
	 * @since 15.0
	 */
	recordMatchedBlock: (p1: CKRecordID, p2: CKRecord, p3: NSError) => void;

	resultsLimit: number;

	zoneID: CKRecordZoneID;

	constructor(o: { cursor: CKQueryCursor; });

	constructor(o: { query: CKQuery; });

	initWithCursor(cursor: CKQueryCursor): this;

	initWithQuery(query: CKQuery): this;
}

/**
 * @since 8.0
 */
declare var CKQueryOperationMaximumResults: number;

/**
 * @since 10.0
 */
declare class CKQuerySubscription extends CKSubscription implements NSCopying, NSSecureCoding {

	static alloc(): CKQuerySubscription; // inherited from NSObject

	static new(): CKQuerySubscription; // inherited from NSObject

	readonly predicate: NSPredicate;

	readonly querySubscriptionOptions: CKQuerySubscriptionOptions;

	readonly recordType: string;

	zoneID: CKRecordZoneID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	constructor(o: { recordType: string; predicate: NSPredicate; options: CKQuerySubscriptionOptions; });

	constructor(o: { recordType: string; predicate: NSPredicate; subscriptionID: string; options: CKQuerySubscriptionOptions; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	initWithRecordTypePredicateOptions(recordType: string, predicate: NSPredicate, querySubscriptionOptions: CKQuerySubscriptionOptions): this;

	initWithRecordTypePredicateSubscriptionIDOptions(recordType: string, predicate: NSPredicate, subscriptionID: string, querySubscriptionOptions: CKQuerySubscriptionOptions): this;
}

/**
 * @since 10.0
 */
declare const enum CKQuerySubscriptionOptions {

	FiresOnRecordCreation = 1,

	FiresOnRecordUpdate = 2,

	FiresOnRecordDeletion = 4,

	FiresOnce = 8
}

/**
 * @since 8.0
 */
declare class CKRecord extends NSObject implements CKRecordKeyValueSetting, NSCopying, NSSecureCoding {

	static alloc(): CKRecord; // inherited from NSObject

	static new(): CKRecord; // inherited from NSObject

	readonly creationDate: Date;

	readonly creatorUserRecordID: CKRecordID;

	/**
	 * @since 15.0
	 */
	readonly encryptedValues: CKRecordKeyValueSetting;

	readonly lastModifiedUserRecordID: CKRecordID;

	readonly modificationDate: Date;

	/**
	 * @since 10.0
	 */
	parent: CKReference;

	readonly recordChangeTag: string;

	readonly recordID: CKRecordID;

	readonly recordType: string;

	/**
	 * @since 10.0
	 */
	readonly share: CKReference;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { recordType: string; });

	constructor(o: { recordType: string; recordID: CKRecordID; });

	constructor(o: { recordType: string; zoneID: CKRecordZoneID; });

	allKeys(): NSArray<string>;

	allTokens(): NSArray<string>;

	changedKeys(): NSArray<string>;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeSystemFieldsWithCoder(coder: NSCoder): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRecordType(recordType: string): this;

	initWithRecordTypeRecordID(recordType: string, recordID: CKRecordID): this;

	initWithRecordTypeZoneID(recordType: string, zoneID: CKRecordZoneID): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	objectForKey(key: string): CKRecordValue;

	objectForKeyedSubscript(key: string): CKRecordValue;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	setObjectForKey(object: CKRecordValue, key: string): void;

	setObjectForKeyedSubscript(object: CKRecordValue, key: string): void;

	/**
	 * @since 10.0
	 */
	setParentReferenceFromRecord(parentRecord: CKRecord): void;

	/**
	 * @since 10.0
	 */
	setParentReferenceFromRecordID(parentRecordID: CKRecordID): void;
}

/**
 * @since 8.0
 */
declare var CKRecordChangedErrorAncestorRecordKey: string;

/**
 * @since 8.0
 */
declare var CKRecordChangedErrorClientRecordKey: string;

/**
 * @since 8.0
 */
declare var CKRecordChangedErrorServerRecordKey: string;

/**
 * @since 8.0
 */
declare var CKRecordCreationDateKey: string;

/**
 * @since 8.0
 */
declare var CKRecordCreatorUserRecordIDKey: string;

/**
 * @since 8.0
 */
declare class CKRecordID extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKRecordID; // inherited from NSObject

	static new(): CKRecordID; // inherited from NSObject

	readonly recordName: string;

	readonly zoneID: CKRecordZoneID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { recordName: string; });

	constructor(o: { recordName: string; zoneID: CKRecordZoneID; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRecordName(recordName: string): this;

	initWithRecordNameZoneID(recordName: string, zoneID: CKRecordZoneID): this;
}

/**
 * @since 9.0
 */
interface CKRecordKeyValueSetting extends NSObjectProtocol {

	allKeys(): NSArray<string>;

	changedKeys(): NSArray<string>;

	objectForKey(key: string): CKRecordValue;

	objectForKeyedSubscript(key: string): CKRecordValue;

	setObjectForKey(object: CKRecordValue, key: string): void;

	setObjectForKeyedSubscript(object: CKRecordValue, key: string): void;
}
declare var CKRecordKeyValueSetting: {

	prototype: CKRecordKeyValueSetting;
};

/**
 * @since 8.0
 */
declare var CKRecordLastModifiedUserRecordIDKey: string;

/**
 * @since 8.0
 */
declare var CKRecordModificationDateKey: string;

/**
 * @since 15.0
 */
declare var CKRecordNameZoneWideShare: string;

/**
 * @since 10.0
 */
declare var CKRecordParentKey: string;

/**
 * @since 8.0
 */
declare var CKRecordRecordIDKey: string;

/**
 * @since 8.0
 */
declare const enum CKRecordSavePolicy {

	IfServerRecordUnchanged = 0,

	ChangedKeys = 1,

	AllKeys = 2
}

/**
 * @since 10.0
 */
declare var CKRecordShareKey: string;

/**
 * @since 10.0
 */
declare var CKRecordTypeShare: string;

/**
 * @since 8.0
 */
declare var CKRecordTypeUserRecord: string;

interface CKRecordValue extends NSObjectProtocol {
}
declare var CKRecordValue: {

	prototype: CKRecordValue;
};

/**
 * @since 8.0
 */
declare class CKRecordZone extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKRecordZone; // inherited from NSObject

	static defaultRecordZone(): CKRecordZone;

	static new(): CKRecordZone; // inherited from NSObject

	readonly capabilities: CKRecordZoneCapabilities;

	/**
	 * @since 15.0
	 */
	readonly share: CKReference;

	readonly zoneID: CKRecordZoneID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { zoneID: CKRecordZoneID; });

	constructor(o: { zoneName: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithZoneID(zoneID: CKRecordZoneID): this;

	initWithZoneName(zoneName: string): this;
}

/**
 * @since 8.0
 */
declare const enum CKRecordZoneCapabilities {

	CapabilityFetchChanges = 1,

	CapabilityAtomic = 2,

	CapabilitySharing = 4,

	CapabilityZoneWideSharing = 8
}

/**
 * @since 8.0
 */
declare var CKRecordZoneDefaultName: string;

/**
 * @since 8.0
 */
declare class CKRecordZoneID extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKRecordZoneID; // inherited from NSObject

	static new(): CKRecordZoneID; // inherited from NSObject

	readonly ownerName: string;

	readonly zoneName: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { zoneName: string; ownerName: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithZoneNameOwnerName(zoneName: string, ownerName: string): this;
}

/**
 * @since 8.0
 */
declare class CKRecordZoneNotification extends CKNotification {

	static alloc(): CKRecordZoneNotification; // inherited from NSObject

	static new(): CKRecordZoneNotification; // inherited from NSObject

	static notificationFromRemoteNotificationDictionary(notificationDictionary: NSDictionary<any, any>): CKRecordZoneNotification; // inherited from CKNotification

	/**
	 * @since 10.0
	 */
	readonly databaseScope: CKDatabaseScope;

	readonly recordZoneID: CKRecordZoneID;
}

/**
 * @since 10.0
 */
declare class CKRecordZoneSubscription extends CKSubscription implements NSCopying, NSSecureCoding {

	static alloc(): CKRecordZoneSubscription; // inherited from NSObject

	static new(): CKRecordZoneSubscription; // inherited from NSObject

	recordType: string;

	readonly zoneID: CKRecordZoneID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	constructor(o: { zoneID: CKRecordZoneID; });

	constructor(o: { zoneID: CKRecordZoneID; subscriptionID: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	initWithZoneID(zoneID: CKRecordZoneID): this;

	initWithZoneIDSubscriptionID(zoneID: CKRecordZoneID, subscriptionID: string): this;
}

/**
 * @since 8.0
 */
declare class CKReference extends NSObject implements CKRecordValue, NSCopying, NSSecureCoding {

	static alloc(): CKReference; // inherited from NSObject

	static new(): CKReference; // inherited from NSObject

	readonly recordID: CKRecordID;

	readonly referenceAction: CKReferenceAction;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { record: CKRecord; action: CKReferenceAction; });

	constructor(o: { recordID: CKRecordID; action: CKReferenceAction; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithRecordAction(record: CKRecord, action: CKReferenceAction): this;

	initWithRecordIDAction(recordID: CKRecordID, action: CKReferenceAction): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 8.0
 */
declare const enum CKReferenceAction {

	None = 0,

	DeleteSelf = 1
}

/**
 * @since 8.0
 */
declare class CKServerChangeToken extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKServerChangeToken; // inherited from NSObject

	static new(): CKServerChangeToken; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class CKShare extends CKRecord implements NSCopying, NSSecureCoding {

	static alloc(): CKShare; // inherited from NSObject

	static new(): CKShare; // inherited from NSObject

	readonly URL: NSURL;

	readonly currentUserParticipant: CKShareParticipant;

	readonly owner: CKShareParticipant;

	readonly participants: NSArray<CKShareParticipant>;

	publicPermission: CKShareParticipantPermission;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 15.0
	 */
	constructor(o: { recordZoneID: CKRecordZoneID; });

	constructor(o: { rootRecord: CKRecord; });

	constructor(o: { rootRecord: CKRecord; shareID: CKRecordID; });

	addParticipant(participant: CKShareParticipant): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 15.0
	 */
	initWithRecordZoneID(recordZoneID: CKRecordZoneID): this;

	initWithRootRecord(rootRecord: CKRecord): this;

	initWithRootRecordShareID(rootRecord: CKRecord, shareID: CKRecordID): this;

	removeParticipant(participant: CKShareParticipant): void;
}

/**
 * @since 10.0
 */
declare class CKShareMetadata extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKShareMetadata; // inherited from NSObject

	static new(): CKShareMetadata; // inherited from NSObject

	readonly containerIdentifier: string;

	/**
	 * @since 15.0
	 */
	readonly hierarchicalRootRecordID: CKRecordID;

	readonly ownerIdentity: CKUserIdentity;

	readonly participantPermission: CKShareParticipantPermission;

	/**
	 * @since 12.0
	 */
	readonly participantRole: CKShareParticipantRole;

	readonly participantStatus: CKShareParticipantAcceptanceStatus;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	readonly participantType: CKShareParticipantType;

	readonly rootRecord: CKRecord;

	/**
	 * @since 10.0
	 * @deprecated 16.0
	 */
	readonly rootRecordID: CKRecordID;

	readonly share: CKShare;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class CKShareParticipant extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKShareParticipant; // inherited from NSObject

	static new(): CKShareParticipant; // inherited from NSObject

	readonly acceptanceStatus: CKShareParticipantAcceptanceStatus;

	/**
	 * @since 10.0
	 */
	readonly participantID: string;

	permission: CKShareParticipantPermission;

	/**
	 * @since 12.0
	 */
	role: CKShareParticipantRole;

	/**
	 * @since 10.0
	 * @deprecated 12.0
	 */
	type: CKShareParticipantType;

	readonly userIdentity: CKUserIdentity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare const enum CKShareParticipantAcceptanceStatus {

	Unknown = 0,

	Pending = 1,

	Accepted = 2,

	Removed = 3
}

/**
 * @since 10.0
 */
declare const enum CKShareParticipantPermission {

	Unknown = 0,

	None = 1,

	ReadOnly = 2,

	ReadWrite = 3
}

/**
 * @since 12.0
 */
declare const enum CKShareParticipantRole {

	Unknown = 0,

	Owner = 1,

	PrivateUser = 3,

	PublicUser = 4
}

/**
 * @since 10.0
 * @deprecated 12.0
 */
declare const enum CKShareParticipantType {

	Unknown = 0,

	Owner = 1,

	PrivateUser = 3,

	PublicUser = 4
}

/**
 * @since 10.0
 */
declare var CKShareThumbnailImageDataKey: string;

/**
 * @since 10.0
 */
declare var CKShareTitleKey: string;

/**
 * @since 10.0
 */
declare var CKShareTypeKey: string;

/**
 * @since 16.0
 */
declare const enum CKSharingParticipantAccessOption {

	AnyoneWithLink = 1,

	SpecifiedRecipientsOnly = 2,

	Any = 3
}

/**
 * @since 16.0
 */
declare const enum CKSharingParticipantPermissionOption {

	ReadOnly = 1,

	ReadWrite = 2,

	Any = 3
}

/**
 * @since 8.0
 */
declare class CKSubscription extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKSubscription; // inherited from NSObject

	static new(): CKSubscription; // inherited from NSObject

	notificationInfo: CKNotificationInfo;

	readonly subscriptionID: string;

	readonly subscriptionType: CKSubscriptionType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare const enum CKSubscriptionType {

	Query = 1,

	RecordZone = 2,

	Database = 3
}

/**
 * @since 17.0
 */
declare class CKSyncEngine extends NSObject {

	static alloc(): CKSyncEngine; // inherited from NSObject

	static new(): CKSyncEngine; // inherited from NSObject

	readonly database: CKDatabase;

	readonly state: CKSyncEngineState;

	constructor(o: { configuration: CKSyncEngineConfiguration; });

	cancelOperationsWithCompletionHandler(completionHandler: () => void): void;

	fetchChangesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	fetchChangesWithOptionsCompletionHandler(options: CKSyncEngineFetchChangesOptions, completionHandler: (p1: NSError) => void): void;

	initWithConfiguration(configuration: CKSyncEngineConfiguration): this;

	sendChangesWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	sendChangesWithOptionsCompletionHandler(options: CKSyncEngineSendChangesOptions, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineAccountChangeEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineAccountChangeEvent; // inherited from NSObject

	static new(): CKSyncEngineAccountChangeEvent; // inherited from NSObject

	readonly changeType: CKSyncEngineAccountChangeType;

	readonly currentUser: CKRecordID;

	readonly previousUser: CKRecordID;
}

declare const enum CKSyncEngineAccountChangeType {

	SignIn = 0,

	SignOut = 1,

	SwitchAccounts = 2
}

/**
 * @since 17.0
 */
declare class CKSyncEngineConfiguration extends NSObject {

	static alloc(): CKSyncEngineConfiguration; // inherited from NSObject

	static new(): CKSyncEngineConfiguration; // inherited from NSObject

	automaticallySync: boolean;

	database: CKDatabase;

	delegate: CKSyncEngineDelegate;

	stateSerialization: CKSyncEngineStateSerialization;

	subscriptionID: string;

	constructor(o: { database: CKDatabase; stateSerialization: CKSyncEngineStateSerialization; delegate: CKSyncEngineDelegate; });

	initWithDatabaseStateSerializationDelegate(database: CKDatabase, stateSerialization: CKSyncEngineStateSerialization, delegate: CKSyncEngineDelegate): this;
}

/**
 * @since 17.0
 */
interface CKSyncEngineDelegate extends NSObjectProtocol {

	syncEngineHandleEvent(syncEngine: CKSyncEngine, event: CKSyncEngineEvent): void;

	syncEngineNextFetchChangesOptionsForContext?(syncEngine: CKSyncEngine, context: CKSyncEngineFetchChangesContext): CKSyncEngineFetchChangesOptions;

	syncEngineNextRecordZoneChangeBatchForContext(syncEngine: CKSyncEngine, context: CKSyncEngineSendChangesContext): CKSyncEngineRecordZoneChangeBatch;
}
declare var CKSyncEngineDelegate: {

	prototype: CKSyncEngineDelegate;
};

/**
 * @since 17.0
 */
declare class CKSyncEngineDidFetchChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineDidFetchChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineDidFetchChangesEvent; // inherited from NSObject

	/**
	 * @since 17.2
	 */
	readonly context: CKSyncEngineFetchChangesContext;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineDidFetchRecordZoneChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineDidFetchRecordZoneChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineDidFetchRecordZoneChangesEvent; // inherited from NSObject

	readonly error: NSError;

	readonly zoneID: CKRecordZoneID;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineDidSendChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineDidSendChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineDidSendChangesEvent; // inherited from NSObject

	readonly context: CKSyncEngineSendChangesContext;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineEvent extends NSObject {

	static alloc(): CKSyncEngineEvent; // inherited from NSObject

	static new(): CKSyncEngineEvent; // inherited from NSObject

	readonly accountChangeEvent: CKSyncEngineAccountChangeEvent;

	readonly didFetchChangesEvent: CKSyncEngineDidFetchChangesEvent;

	readonly didFetchRecordZoneChangesEvent: CKSyncEngineDidFetchRecordZoneChangesEvent;

	readonly didSendChangesEvent: CKSyncEngineDidSendChangesEvent;

	readonly fetchedDatabaseChangesEvent: CKSyncEngineFetchedDatabaseChangesEvent;

	readonly fetchedRecordZoneChangesEvent: CKSyncEngineFetchedRecordZoneChangesEvent;

	readonly sentDatabaseChangesEvent: CKSyncEngineSentDatabaseChangesEvent;

	readonly sentRecordZoneChangesEvent: CKSyncEngineSentRecordZoneChangesEvent;

	readonly stateUpdateEvent: CKSyncEngineStateUpdateEvent;

	readonly type: CKSyncEngineEventType;

	readonly willFetchChangesEvent: CKSyncEngineWillFetchChangesEvent;

	readonly willFetchRecordZoneChangesEvent: CKSyncEngineWillFetchRecordZoneChangesEvent;

	readonly willSendChangesEvent: CKSyncEngineWillSendChangesEvent;
}

declare const enum CKSyncEngineEventType {

	StateUpdate = 0,

	AccountChange = 1,

	FetchedDatabaseChanges = 2,

	FetchedRecordZoneChanges = 3,

	SentDatabaseChanges = 4,

	SentRecordZoneChanges = 5,

	WillFetchChanges = 6,

	WillFetchRecordZoneChanges = 7,

	DidFetchRecordZoneChanges = 8,

	DidFetchChanges = 9,

	WillSendChanges = 10,

	DidSendChanges = 11
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFailedRecordSave extends NSObject {

	static alloc(): CKSyncEngineFailedRecordSave; // inherited from NSObject

	static new(): CKSyncEngineFailedRecordSave; // inherited from NSObject

	readonly error: NSError;

	readonly record: CKRecord;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFailedZoneSave extends NSObject {

	static alloc(): CKSyncEngineFailedZoneSave; // inherited from NSObject

	static new(): CKSyncEngineFailedZoneSave; // inherited from NSObject

	readonly error: NSError;

	readonly recordZone: CKRecordZone;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFetchChangesContext extends NSObject {

	static alloc(): CKSyncEngineFetchChangesContext; // inherited from NSObject

	static new(): CKSyncEngineFetchChangesContext; // inherited from NSObject

	readonly options: CKSyncEngineFetchChangesOptions;

	readonly reason: CKSyncEngineSyncReason;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFetchChangesOptions extends NSObject implements NSCopying {

	static alloc(): CKSyncEngineFetchChangesOptions; // inherited from NSObject

	static new(): CKSyncEngineFetchChangesOptions; // inherited from NSObject

	operationGroup: CKOperationGroup;

	prioritizedZoneIDs: NSArray<CKRecordZoneID>;

	scope: CKSyncEngineFetchChangesScope;

	constructor(o: { scope: CKSyncEngineFetchChangesScope; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithScope(scope: CKSyncEngineFetchChangesScope): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFetchChangesScope extends NSObject implements NSCopying {

	static alloc(): CKSyncEngineFetchChangesScope; // inherited from NSObject

	static new(): CKSyncEngineFetchChangesScope; // inherited from NSObject

	readonly excludedZoneIDs: NSSet<CKRecordZoneID>;

	readonly zoneIDs: NSSet<CKRecordZoneID>;

	constructor(o: { excludedZoneIDs: NSSet<CKRecordZoneID>; });

	constructor(o: { zoneIDs: NSSet<CKRecordZoneID>; });

	/**
	 * @since 17.2
	 */
	containsZoneID(zoneID: CKRecordZoneID): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithExcludedZoneIDs(zoneIDs: NSSet<CKRecordZoneID>): this;

	initWithZoneIDs(zoneIDs: NSSet<CKRecordZoneID>): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFetchedDatabaseChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineFetchedDatabaseChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineFetchedDatabaseChangesEvent; // inherited from NSObject

	readonly deletions: NSArray<CKSyncEngineFetchedZoneDeletion>;

	readonly modifications: NSArray<CKRecordZone>;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFetchedRecordDeletion extends NSObject {

	static alloc(): CKSyncEngineFetchedRecordDeletion; // inherited from NSObject

	static new(): CKSyncEngineFetchedRecordDeletion; // inherited from NSObject

	readonly recordID: CKRecordID;

	readonly recordType: string;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFetchedRecordZoneChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineFetchedRecordZoneChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineFetchedRecordZoneChangesEvent; // inherited from NSObject

	readonly deletions: NSArray<CKSyncEngineFetchedRecordDeletion>;

	readonly modifications: NSArray<CKRecord>;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineFetchedZoneDeletion extends NSObject {

	static alloc(): CKSyncEngineFetchedZoneDeletion; // inherited from NSObject

	static new(): CKSyncEngineFetchedZoneDeletion; // inherited from NSObject

	readonly reason: CKSyncEngineZoneDeletionReason;

	readonly zoneID: CKRecordZoneID;
}

/**
 * @since 17.0
 */
declare class CKSyncEnginePendingDatabaseChange extends NSObject {

	static alloc(): CKSyncEnginePendingDatabaseChange; // inherited from NSObject

	static new(): CKSyncEnginePendingDatabaseChange; // inherited from NSObject

	readonly type: CKSyncEnginePendingDatabaseChangeType;

	readonly zoneID: CKRecordZoneID;
}

declare const enum CKSyncEnginePendingDatabaseChangeType {

	SaveZone = 0,

	DeleteZone = 1
}

/**
 * @since 17.0
 */
declare class CKSyncEnginePendingRecordZoneChange extends NSObject {

	static alloc(): CKSyncEnginePendingRecordZoneChange; // inherited from NSObject

	static new(): CKSyncEnginePendingRecordZoneChange; // inherited from NSObject

	readonly recordID: CKRecordID;

	readonly type: CKSyncEnginePendingRecordZoneChangeType;

	constructor(o: { recordID: CKRecordID; type: CKSyncEnginePendingRecordZoneChangeType; });

	initWithRecordIDType(recordID: CKRecordID, type: CKSyncEnginePendingRecordZoneChangeType): this;
}

declare const enum CKSyncEnginePendingRecordZoneChangeType {

	SaveRecord = 0,

	DeleteRecord = 1
}

/**
 * @since 17.0
 */
declare class CKSyncEnginePendingZoneDelete extends CKSyncEnginePendingDatabaseChange {

	static alloc(): CKSyncEnginePendingZoneDelete; // inherited from NSObject

	static new(): CKSyncEnginePendingZoneDelete; // inherited from NSObject

	constructor(o: { zoneID: CKRecordZoneID; });

	initWithZoneID(zoneID: CKRecordZoneID): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEnginePendingZoneSave extends CKSyncEnginePendingDatabaseChange {

	static alloc(): CKSyncEnginePendingZoneSave; // inherited from NSObject

	static new(): CKSyncEnginePendingZoneSave; // inherited from NSObject

	readonly 

	constructor(o: { zone: CKRecordZone; });

	initWithZone(zone: CKRecordZone): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineRecordZoneChangeBatch extends NSObject {

	static alloc(): CKSyncEngineRecordZoneChangeBatch; // inherited from NSObject

	static new(): CKSyncEngineRecordZoneChangeBatch; // inherited from NSObject

	atomicByZone: boolean;

	readonly recordIDsToDelete: NSArray<CKRecordID>;

	readonly recordsToSave: NSArray<CKRecord>;

	constructor(o: { pendingChanges: NSArray<CKSyncEnginePendingRecordZoneChange> | CKSyncEnginePendingRecordZoneChange[]; recordProvider: (p1: CKRecordID) => CKRecord; });

	constructor(o: { recordsToSave: NSArray<CKRecord> | CKRecord[]; recordIDsToDelete: NSArray<CKRecordID> | CKRecordID[]; atomicByZone: boolean; });

	initWithPendingChangesRecordProvider(pendingChanges: NSArray<CKSyncEnginePendingRecordZoneChange> | CKSyncEnginePendingRecordZoneChange[], recordProvider: (p1: CKRecordID) => CKRecord): this;

	initWithRecordsToSaveRecordIDsToDeleteAtomicByZone(recordsToSave: NSArray<CKRecord> | CKRecord[], recordIDsToDelete: NSArray<CKRecordID> | CKRecordID[], atomicByZone: boolean): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineSendChangesContext extends NSObject {

	static alloc(): CKSyncEngineSendChangesContext; // inherited from NSObject

	static new(): CKSyncEngineSendChangesContext; // inherited from NSObject

	readonly options: CKSyncEngineSendChangesOptions;

	readonly reason: CKSyncEngineSyncReason;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineSendChangesOptions extends NSObject implements NSCopying {

	static alloc(): CKSyncEngineSendChangesOptions; // inherited from NSObject

	static new(): CKSyncEngineSendChangesOptions; // inherited from NSObject

	operationGroup: CKOperationGroup;

	scope: CKSyncEngineSendChangesScope;

	constructor(o: { scope: CKSyncEngineSendChangesScope; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithScope(scope: CKSyncEngineSendChangesScope): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineSendChangesScope extends NSObject implements NSCopying {

	static alloc(): CKSyncEngineSendChangesScope; // inherited from NSObject

	static new(): CKSyncEngineSendChangesScope; // inherited from NSObject

	readonly excludedZoneIDs: NSSet<CKRecordZoneID>;

	readonly recordIDs: NSSet<CKRecordID>;

	readonly zoneIDs: NSSet<CKRecordZoneID>;

	constructor(o: { excludedZoneIDs: NSSet<CKRecordZoneID>; });

	constructor(o: { recordIDs: NSSet<CKRecordID>; });

	constructor(o: { zoneIDs: NSSet<CKRecordZoneID>; });

	containsPendingRecordZoneChange(pendingRecordZoneChange: CKSyncEnginePendingRecordZoneChange): boolean;

	containsRecordID(recordID: CKRecordID): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithExcludedZoneIDs(excludedZoneIDs: NSSet<CKRecordZoneID>): this;

	initWithRecordIDs(recordIDs: NSSet<CKRecordID>): this;

	initWithZoneIDs(zoneIDs: NSSet<CKRecordZoneID>): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineSentDatabaseChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineSentDatabaseChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineSentDatabaseChangesEvent; // inherited from NSObject

	readonly deletedZoneIDs: NSArray<CKRecordZoneID>;

	readonly failedZoneDeletes: NSDictionary<CKRecordZoneID, NSError>;

	readonly failedZoneSaves: NSArray<CKSyncEngineFailedZoneSave>;

	readonly savedZones: NSArray<CKRecordZone>;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineSentRecordZoneChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineSentRecordZoneChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineSentRecordZoneChangesEvent; // inherited from NSObject

	readonly deletedRecordIDs: NSArray<CKRecordID>;

	readonly failedRecordDeletes: NSDictionary<CKRecordID, NSError>;

	readonly failedRecordSaves: NSArray<CKSyncEngineFailedRecordSave>;

	readonly savedRecords: NSArray<CKRecord>;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineState extends NSObject {

	static alloc(): CKSyncEngineState; // inherited from NSObject

	static new(): CKSyncEngineState; // inherited from NSObject

	hasPendingUntrackedChanges: boolean;

	readonly pendingDatabaseChanges: NSArray<CKSyncEnginePendingDatabaseChange>;

	readonly pendingRecordZoneChanges: NSArray<CKSyncEnginePendingRecordZoneChange>;

	readonly zoneIDsWithUnfetchedServerChanges: NSArray<CKRecordZoneID>;

	addPendingDatabaseChanges(changes: NSArray<CKSyncEnginePendingDatabaseChange> | CKSyncEnginePendingDatabaseChange[]): void;

	addPendingRecordZoneChanges(changes: NSArray<CKSyncEnginePendingRecordZoneChange> | CKSyncEnginePendingRecordZoneChange[]): void;

	removePendingDatabaseChanges(changes: NSArray<CKSyncEnginePendingDatabaseChange> | CKSyncEnginePendingDatabaseChange[]): void;

	removePendingRecordZoneChanges(changes: NSArray<CKSyncEnginePendingRecordZoneChange> | CKSyncEnginePendingRecordZoneChange[]): void;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineStateSerialization extends NSObject implements NSSecureCoding {

	static alloc(): CKSyncEngineStateSerialization; // inherited from NSObject

	static new(): CKSyncEngineStateSerialization; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineStateUpdateEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineStateUpdateEvent; // inherited from NSObject

	static new(): CKSyncEngineStateUpdateEvent; // inherited from NSObject

	readonly stateSerialization: CKSyncEngineStateSerialization;
}

declare const enum CKSyncEngineSyncReason {

	Scheduled = 0,

	Manual = 1
}

/**
 * @since 17.0
 */
declare class CKSyncEngineWillFetchChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineWillFetchChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineWillFetchChangesEvent; // inherited from NSObject

	/**
	 * @since 17.2
	 */
	readonly context: CKSyncEngineFetchChangesContext;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineWillFetchRecordZoneChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineWillFetchRecordZoneChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineWillFetchRecordZoneChangesEvent; // inherited from NSObject

	readonly zoneID: CKRecordZoneID;
}

/**
 * @since 17.0
 */
declare class CKSyncEngineWillSendChangesEvent extends CKSyncEngineEvent {

	static alloc(): CKSyncEngineWillSendChangesEvent; // inherited from NSObject

	static new(): CKSyncEngineWillSendChangesEvent; // inherited from NSObject

	readonly context: CKSyncEngineSendChangesContext;
}

declare const enum CKSyncEngineZoneDeletionReason {

	Deleted = 0,

	Purged = 1,

	EncryptedDataReset = 2
}

/**
 * @since 16.0
 */
declare class CKSystemSharingUIObserver extends NSObject {

	static alloc(): CKSystemSharingUIObserver; // inherited from NSObject

	static new(): CKSystemSharingUIObserver; // inherited from NSObject

	systemSharingUIDidSaveShareBlock: (p1: CKRecordID, p2: CKShare, p3: NSError) => void;

	systemSharingUIDidStopSharingBlock: (p1: CKRecordID, p2: NSError) => void;

	constructor(o: { container: CKContainer; });

	initWithContainer(container: CKContainer): this;
}

/**
 * @since 10.0
 */
declare class CKUserIdentity extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKUserIdentity; // inherited from NSObject

	static new(): CKUserIdentity; // inherited from NSObject

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	readonly contactIdentifiers: NSArray<string>;

	readonly hasiCloudAccount: boolean;

	readonly lookupInfo: CKUserIdentityLookupInfo;

	readonly nameComponents: NSPersonNameComponents;

	readonly userRecordID: CKRecordID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class CKUserIdentityLookupInfo extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CKUserIdentityLookupInfo; // inherited from NSObject

	static lookupInfosWithEmails(emails: NSArray<string> | string[]): NSArray<CKUserIdentityLookupInfo>;

	static lookupInfosWithPhoneNumbers(phoneNumbers: NSArray<string> | string[]): NSArray<CKUserIdentityLookupInfo>;

	static lookupInfosWithRecordIDs(recordIDs: NSArray<CKRecordID> | CKRecordID[]): NSArray<CKUserIdentityLookupInfo>;

	static new(): CKUserIdentityLookupInfo; // inherited from NSObject

	readonly emailAddress: string;

	readonly phoneNumber: string;

	readonly userRecordID: CKRecordID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { emailAddress: string; });

	constructor(o: { phoneNumber: string; });

	constructor(o: { userRecordID: CKRecordID; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithEmailAddress(emailAddress: string): this;

	initWithPhoneNumber(phoneNumber: string): this;

	initWithUserRecordID(userRecordID: CKRecordID): this;
}
