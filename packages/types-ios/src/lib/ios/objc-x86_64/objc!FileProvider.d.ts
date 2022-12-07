
interface NSFileProviderChangeObserver extends NSObjectProtocol {

	suggestedBatchSize?: number;

	didDeleteItemsWithIdentifiers(deletedItemIdentifiers: NSArray<string> | string[]): void;

	didUpdateItems(updatedItems: NSArray<NSFileProviderItem> | NSFileProviderItem[]): void;

	finishEnumeratingChangesUpToSyncAnchorMoreComing(anchor: NSData, moreComing: boolean): void;

	finishEnumeratingWithError(error: NSError): void;
}
declare var NSFileProviderChangeObserver: {

	prototype: NSFileProviderChangeObserver;
};

declare const enum NSFileProviderContentPolicy {

	Inherited = 0,

	DownloadLazily = 1,

	DownloadLazilyAndEvictOnRemoteUpdate = 2,

	DownloadEagerlyAndKeepDownloaded = 3
}

declare const enum NSFileProviderCreateItemOptions {

	MayAlreadyExist = 1,

	DeletionConflicted = 2
}

interface NSFileProviderCustomAction extends NSObjectProtocol {

	performActionWithIdentifierOnItemsWithIdentifiersCompletionHandler(actionIdentifier: string, itemIdentifiers: NSArray<string> | string[], completionHandler: (p1: NSError) => void): NSProgress;
}
declare var NSFileProviderCustomAction: {

	prototype: NSFileProviderCustomAction;
};

declare const enum NSFileProviderDeleteItemOptions {

	Recursive = 1
}

declare class NSFileProviderDomain extends NSObject {

	static alloc(): NSFileProviderDomain; // inherited from NSObject

	static new(): NSFileProviderDomain; // inherited from NSObject

	readonly backingStoreIdentity: NSData;

	readonly displayName: string;

	readonly identifier: string;

	readonly pathRelativeToDocumentStorage: string;

	readonly replicated: boolean;

	testingModes: NSFileProviderDomainTestingModes;

	readonly userEnabled: boolean;

	constructor(o: { identifier: string; displayName: string; });

	constructor(o: { identifier: string; displayName: string; pathRelativeToDocumentStorage: string; });

	initWithIdentifierDisplayName(identifier: string, displayName: string): this;

	initWithIdentifierDisplayNamePathRelativeToDocumentStorage(identifier: string, displayName: string, pathRelativeToDocumentStorage: string): this;
}

declare var NSFileProviderDomainDidChange: string;

declare const enum NSFileProviderDomainRemovalMode {

	RemoveAll = 0,

	PreserveDirtyUserData = 1,

	PreserveDownloadedUserData = 2
}

interface NSFileProviderDomainState extends NSObjectProtocol {

	domainVersion: NSFileProviderDomainVersion;

	userInfo: NSDictionary<any, any>;
}
declare var NSFileProviderDomainState: {

	prototype: NSFileProviderDomainState;
};

declare const enum NSFileProviderDomainTestingModes {

	AlwaysEnabled = 1,

	Interactive = 2
}

declare class NSFileProviderDomainVersion extends NSObject implements NSSecureCoding {

	static alloc(): NSFileProviderDomainVersion; // inherited from NSObject

	static new(): NSFileProviderDomainVersion; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	compare(otherVersion: NSFileProviderDomainVersion): NSComparisonResult;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	next(): NSFileProviderDomainVersion;
}

interface NSFileProviderEnumerating extends NSObjectProtocol {

	enumeratorForContainerItemIdentifierRequestError(containerItemIdentifier: string, request: NSFileProviderRequest): NSFileProviderEnumerator;
}
declare var NSFileProviderEnumerating: {

	prototype: NSFileProviderEnumerating;
};

interface NSFileProviderEnumerationObserver extends NSObjectProtocol {

	suggestedPageSize?: number;

	didEnumerateItems(updatedItems: NSArray<NSFileProviderItem> | NSFileProviderItem[]): void;

	finishEnumeratingUpToPage(nextPage: NSData): void;

	finishEnumeratingWithError(error: NSError): void;
}
declare var NSFileProviderEnumerationObserver: {

	prototype: NSFileProviderEnumerationObserver;
};

interface NSFileProviderEnumerator extends NSObjectProtocol {

	currentSyncAnchorWithCompletionHandler?(completionHandler: (p1: NSData) => void): void;

	enumerateChangesForObserverFromSyncAnchor?(observer: NSFileProviderChangeObserver, syncAnchor: NSData): void;

	enumerateItemsForObserverStartingAtPage(observer: NSFileProviderEnumerationObserver, page: NSData): void;

	invalidate(): void;
}
declare var NSFileProviderEnumerator: {

	prototype: NSFileProviderEnumerator;
};

declare const enum NSFileProviderErrorCode {

	NotAuthenticated = -1000,

	FilenameCollision = -1001,

	SyncAnchorExpired = -1002,

	PageExpired = -1002,

	InsufficientQuota = -1003,

	ServerUnreachable = -1004,

	NoSuchItem = -1005,

	DeletionRejected = -1006,

	DirectoryNotEmpty = -1007,

	ProviderNotFound = -2001,

	ProviderTranslocated = -2002,

	OlderExtensionVersionRunning = -2003,

	NewerExtensionVersionFound = -2004,

	CannotSynchronize = -2005,

	NonEvictableChildren = -2006,

	UnsyncedEdits = -2007,

	NonEvictable = -2008,

	VersionNoLongerAvailable = -2009,

	ExcludedFromSync = -2010,

	DomainDisabled = -2011
}

declare var NSFileProviderErrorCollidingItemKey: string;

declare var NSFileProviderErrorDomain: string;

declare var NSFileProviderErrorItemKey: string;

declare var NSFileProviderErrorNonExistentItemIdentifierKey: string;

declare class NSFileProviderExtension extends NSObject {

	static alloc(): NSFileProviderExtension; // inherited from NSObject

	static new(): NSFileProviderExtension; // inherited from NSObject

	static placeholderURLForURL(url: NSURL): NSURL;

	static writePlaceholderAtURLWithMetadataError(placeholderURL: NSURL, metadata: NSDictionary<string, any>): boolean;

	readonly documentStorageURL: NSURL;

	readonly domain: NSFileProviderDomain;

	readonly providerIdentifier: string;

	URLForItemWithPersistentIdentifier(identifier: string): NSURL;

	createDirectoryWithNameInParentItemIdentifierCompletionHandler(directoryName: string, parentItemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	deleteItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	enumeratorForContainerItemIdentifierError(containerItemIdentifier: string): NSFileProviderEnumerator;

	fetchThumbnailsForItemIdentifiersRequestedSizePerThumbnailCompletionHandlerCompletionHandler(itemIdentifiers: NSArray<string> | string[], size: CGSize, perThumbnailCompletionHandler: (p1: string, p2: NSData, p3: NSError) => void, completionHandler: (p1: NSError) => void): NSProgress;

	importDocumentAtURLToParentItemIdentifierCompletionHandler(fileURL: NSURL, parentItemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	itemChangedAtURL(url: NSURL): void;

	itemForIdentifierError(identifier: string): NSFileProviderItem;

	persistentIdentifierForItemAtURL(url: NSURL): string;

	providePlaceholderAtURLCompletionHandler(url: NSURL, completionHandler: (p1: NSError) => void): void;

	renameItemWithIdentifierToNameCompletionHandler(itemIdentifier: string, itemName: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	reparentItemWithIdentifierToParentItemWithIdentifierNewNameCompletionHandler(itemIdentifier: string, parentItemIdentifier: string, newName: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	setFavoriteRankForItemIdentifierCompletionHandler(favoriteRank: number, itemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	setLastUsedDateForItemIdentifierCompletionHandler(lastUsedDate: Date, itemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	setTagDataForItemIdentifierCompletionHandler(tagData: NSData, itemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	startProvidingItemAtURLCompletionHandler(url: NSURL, completionHandler: (p1: NSError) => void): void;

	stopProvidingItemAtURL(url: NSURL): void;

	supportedServiceSourcesForItemIdentifierError(itemIdentifier: string): NSArray<NSFileProviderServiceSource>;

	trashItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	untrashItemWithIdentifierToParentItemIdentifierCompletionHandler(itemIdentifier: string, parentItemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;
}

declare var NSFileProviderFavoriteRankUnranked: number;

declare const enum NSFileProviderFileSystemFlags {

	UserExecutable = 1,

	UserReadable = 2,

	UserWritable = 4,

	Hidden = 8,

	PathExtensionHidden = 16
}

interface NSFileProviderIncrementalContentFetching extends NSObjectProtocol {

	fetchContentsForItemWithIdentifierVersionUsingExistingContentsAtURLExistingVersionRequestCompletionHandler(itemIdentifier: string, requestedVersion: NSFileProviderItemVersion, existingContents: NSURL, existingVersion: NSFileProviderItemVersion, request: NSFileProviderRequest, completionHandler: (p1: NSURL, p2: NSFileProviderItem, p3: NSError) => void): NSProgress;
}
declare var NSFileProviderIncrementalContentFetching: {

	prototype: NSFileProviderIncrementalContentFetching;
};

declare var NSFileProviderInitialPageSortedByDate: NSData;

declare var NSFileProviderInitialPageSortedByName: NSData;

interface NSFileProviderItem extends NSObjectProtocol {

	capabilities?: NSFileProviderItemCapabilities;

	childItemCount?: number;

	contentModificationDate?: Date;

	contentPolicy?: NSFileProviderContentPolicy;

	contentType?: UTType;

	creationDate?: Date;

	documentSize?: number;

	downloaded?: boolean;

	downloading?: boolean;

	downloadingError?: NSError;

	extendedAttributes?: NSDictionary<string, NSData>;

	favoriteRank?: number;

	fileSystemFlags?: NSFileProviderFileSystemFlags;

	filename: string;

	itemIdentifier: string;

	itemVersion?: NSFileProviderItemVersion;

	lastUsedDate?: Date;

	mostRecentEditorNameComponents?: NSPersonNameComponents;

	mostRecentVersionDownloaded?: boolean;

	ownerNameComponents?: NSPersonNameComponents;

	parentItemIdentifier: string;

	shared?: boolean;

	sharedByCurrentUser?: boolean;

	symlinkTargetPath?: string;

	tagData?: NSData;

	trashed?: boolean;

	typeAndCreator?: NSFileProviderTypeAndCreator;

	typeIdentifier?: string;

	uploaded?: boolean;

	uploading?: boolean;

	uploadingError?: NSError;

	userInfo?: NSDictionary<any, any>;

	versionIdentifier?: NSData;
}
declare var NSFileProviderItem: {

	prototype: NSFileProviderItem;
};

declare const enum NSFileProviderItemCapabilities {

	AllowsReading = 1,

	AllowsWriting = 2,

	AllowsReparenting = 4,

	AllowsRenaming = 8,

	AllowsTrashing = 16,

	AllowsDeleting = 32,

	AllowsEvicting = 64,

	AllowsExcludingFromSync = 128,

	AllowsAddingSubItems = 2,

	AllowsContentEnumerating = 1,

	AllowsAll = 63
}

interface NSFileProviderItemDecorating extends NSFileProviderItem {

	decorations: NSArray<string>;
}
declare var NSFileProviderItemDecorating: {

	prototype: NSFileProviderItemDecorating;
};

declare const enum NSFileProviderItemFields {

	Contents = 1,

	Filename = 2,

	ParentItemIdentifier = 4,

	LastUsedDate = 8,

	TagData = 16,

	FavoriteRank = 32,

	CreationDate = 64,

	ContentModificationDate = 128,

	FileSystemFlags = 256,

	ExtendedAttributes = 512,

	TypeAndCreator = 1024
}

declare class NSFileProviderItemVersion extends NSObject {

	static alloc(): NSFileProviderItemVersion; // inherited from NSObject

	static new(): NSFileProviderItemVersion; // inherited from NSObject

	readonly contentVersion: NSData;

	readonly metadataVersion: NSData;

	static readonly beforeFirstSyncComponent: NSData;

	constructor(o: { contentVersion: NSData; metadataVersion: NSData; });

	initWithContentVersionMetadataVersion(contentVersion: NSData, metadataVersion: NSData): this;
}

declare class NSFileProviderManager extends NSObject {

	static addDomainCompletionHandler(domain: NSFileProviderDomain, completionHandler: (p1: NSError) => void): void;

	static alloc(): NSFileProviderManager; // inherited from NSObject

	static getDomainsWithCompletionHandler(completionHandler: (p1: NSArray<NSFileProviderDomain>, p2: NSError) => void): void;

	static getIdentifierForUserVisibleFileAtURLCompletionHandler(url: NSURL, completionHandler: (p1: string, p2: string, p3: NSError) => void): void;

	static importDomainFromDirectoryAtURLCompletionHandler(domain: NSFileProviderDomain, url: NSURL, completionHandler: (p1: NSError) => void): void;

	static managerForDomain(domain: NSFileProviderDomain): NSFileProviderManager;

	static new(): NSFileProviderManager; // inherited from NSObject

	static placeholderURLForURL(url: NSURL): NSURL;

	static removeAllDomainsWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	static removeDomainCompletionHandler(domain: NSFileProviderDomain, completionHandler: (p1: NSError) => void): void;

	static removeDomainModeCompletionHandler(domain: NSFileProviderDomain, mode: NSFileProviderDomainRemovalMode, completionHandler: (p1: NSURL, p2: NSError) => void): void;

	static writePlaceholderAtURLWithMetadataError(placeholderURL: NSURL, metadata: NSFileProviderItem): boolean;

	readonly documentStorageURL: NSURL;

	readonly providerIdentifier: string;

	static readonly defaultManager: NSFileProviderManager;

	enumeratorForMaterializedItems(): NSFileProviderEnumerator;

	enumeratorForPendingItems(): NSFileProviderPendingSetEnumerator;

	evictItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	getServiceWithNameItemIdentifierCompletionHandler(serviceName: string, itemIdentifier: string, completionHandler: (p1: NSFileProviderService, p2: NSError) => void): void;

	getUserVisibleURLForItemIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSURL, p2: NSError) => void): void;

	globalProgressForKind(kind: string): NSProgress;

	listAvailableTestingOperationsWithError(): NSArray<NSFileProviderTestingOperation>;

	registerURLSessionTaskForItemWithIdentifierCompletionHandler(task: NSURLSessionTask, identifier: string, completion: (p1: NSError) => void): void;

	reimportItemsBelowItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	requestModificationOfFieldsForItemWithIdentifierOptionsCompletionHandler(fields: NSFileProviderItemFields, itemIdentifier: string, options: NSFileProviderModifyItemOptions, completionHandler: (p1: NSError) => void): void;

	runTestingOperationsError(operations: NSArray<NSFileProviderTestingOperation> | NSFileProviderTestingOperation[]): NSDictionary<NSFileProviderTestingOperation, NSError>;

	signalEnumeratorForContainerItemIdentifierCompletionHandler(containerItemIdentifier: string, completion: (p1: NSError) => void): void;

	signalErrorResolvedCompletionHandler(error: NSError, completionHandler: (p1: NSError) => void): void;

	temporaryDirectoryURLWithError(): NSURL;

	waitForChangesOnItemsBelowItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	waitForStabilizationWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

declare var NSFileProviderMaterializedSetDidChange: string;

declare const enum NSFileProviderModifyItemOptions {

	MayAlreadyExist = 1
}

declare var NSFileProviderPendingSetDidChange: string;

interface NSFileProviderPendingSetEnumerator extends NSFileProviderEnumerator {

	domainVersion: NSFileProviderDomainVersion;

	maximumSizeReached: boolean;

	refreshInterval: number;
}
declare var NSFileProviderPendingSetEnumerator: {

	prototype: NSFileProviderPendingSetEnumerator;
};

interface NSFileProviderReplicatedExtension extends NSFileProviderEnumerating, NSObjectProtocol {

	createItemBasedOnTemplateFieldsContentsOptionsRequestCompletionHandler(itemTemplate: NSFileProviderItem, fields: NSFileProviderItemFields, url: NSURL, options: NSFileProviderCreateItemOptions, request: NSFileProviderRequest, completionHandler: (p1: NSFileProviderItem, p2: NSFileProviderItemFields, p3: boolean, p4: NSError) => void): NSProgress;

	deleteItemWithIdentifierBaseVersionOptionsRequestCompletionHandler(identifier: string, version: NSFileProviderItemVersion, options: NSFileProviderDeleteItemOptions, request: NSFileProviderRequest, completionHandler: (p1: NSError) => void): NSProgress;

	fetchContentsForItemWithIdentifierVersionRequestCompletionHandler(itemIdentifier: string, requestedVersion: NSFileProviderItemVersion, request: NSFileProviderRequest, completionHandler: (p1: NSURL, p2: NSFileProviderItem, p3: NSError) => void): NSProgress;

	importDidFinishWithCompletionHandler?(completionHandler: () => void): void;

	initWithDomain?(domain: NSFileProviderDomain): NSFileProviderReplicatedExtension;

	invalidate(): void;

	itemForIdentifierRequestCompletionHandler(identifier: string, request: NSFileProviderRequest, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): NSProgress;

	materializedItemsDidChangeWithCompletionHandler?(completionHandler: () => void): void;

	modifyItemBaseVersionChangedFieldsContentsOptionsRequestCompletionHandler(item: NSFileProviderItem, version: NSFileProviderItemVersion, changedFields: NSFileProviderItemFields, newContents: NSURL, options: NSFileProviderModifyItemOptions, request: NSFileProviderRequest, completionHandler: (p1: NSFileProviderItem, p2: NSFileProviderItemFields, p3: boolean, p4: NSError) => void): NSProgress;

	pendingItemsDidChangeWithCompletionHandler?(completionHandler: () => void): void;
}
declare var NSFileProviderReplicatedExtension: {

	prototype: NSFileProviderReplicatedExtension;
};

declare class NSFileProviderRequest extends NSObject {

	static alloc(): NSFileProviderRequest; // inherited from NSObject

	static new(): NSFileProviderRequest; // inherited from NSObject

	readonly domainVersion: NSFileProviderDomainVersion;

	readonly isFileViewerRequest: boolean;

	readonly isSystemRequest: boolean;
}

declare var NSFileProviderRootContainerItemIdentifier: string;

interface NSFileProviderServiceSource {

	restricted?: boolean;

	serviceName: string;

	makeListenerEndpointAndReturnError(): NSXPCListenerEndpoint;
}
declare var NSFileProviderServiceSource: {

	prototype: NSFileProviderServiceSource;
};

interface NSFileProviderServicing extends NSObjectProtocol {

	supportedServiceSourcesForItemIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSArray<NSFileProviderServiceSource>, p2: NSError) => void): NSProgress;
}
declare var NSFileProviderServicing: {

	prototype: NSFileProviderServicing;
};

interface NSFileProviderTestingChildrenEnumeration extends NSFileProviderTestingOperation {

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingChildrenEnumeration: {

	prototype: NSFileProviderTestingChildrenEnumeration;
};

interface NSFileProviderTestingCollisionResolution extends NSFileProviderTestingOperation {

	renamedItem: NSFileProviderItem;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingCollisionResolution: {

	prototype: NSFileProviderTestingCollisionResolution;
};

interface NSFileProviderTestingContentFetch extends NSFileProviderTestingOperation {

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingContentFetch: {

	prototype: NSFileProviderTestingContentFetch;
};

interface NSFileProviderTestingCreation extends NSFileProviderTestingOperation {

	domainVersion: NSFileProviderDomainVersion;

	sourceItem: NSFileProviderItem;

	targetSide: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingCreation: {

	prototype: NSFileProviderTestingCreation;
};

interface NSFileProviderTestingDeletion extends NSFileProviderTestingOperation {

	domainVersion: NSFileProviderDomainVersion;

	sourceItemIdentifier: string;

	targetItemBaseVersion: NSFileProviderItemVersion;

	targetItemIdentifier: string;

	targetSide: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingDeletion: {

	prototype: NSFileProviderTestingDeletion;
};

interface NSFileProviderTestingIngestion extends NSFileProviderTestingOperation {

	item: NSFileProviderItem;

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingIngestion: {

	prototype: NSFileProviderTestingIngestion;
};

interface NSFileProviderTestingLookup extends NSFileProviderTestingOperation {

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingLookup: {

	prototype: NSFileProviderTestingLookup;
};

interface NSFileProviderTestingModification extends NSFileProviderTestingOperation {

	changedFields: NSFileProviderItemFields;

	domainVersion: NSFileProviderDomainVersion;

	sourceItem: NSFileProviderItem;

	targetItemBaseVersion: NSFileProviderItemVersion;

	targetItemIdentifier: string;

	targetSide: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingModification: {

	prototype: NSFileProviderTestingModification;
};

interface NSFileProviderTestingOperation extends NSObjectProtocol {

	type: NSFileProviderTestingOperationType;

	asChildrenEnumeration(): NSFileProviderTestingChildrenEnumeration;

	asCollisionResolution(): NSFileProviderTestingCollisionResolution;

	asContentFetch(): NSFileProviderTestingContentFetch;

	asCreation(): NSFileProviderTestingCreation;

	asDeletion(): NSFileProviderTestingDeletion;

	asIngestion(): NSFileProviderTestingIngestion;

	asLookup(): NSFileProviderTestingLookup;

	asModification(): NSFileProviderTestingModification;
}
declare var NSFileProviderTestingOperation: {

	prototype: NSFileProviderTestingOperation;
};

declare const enum NSFileProviderTestingOperationSide {

	Disk = 0,

	FileProvider = 1
}

declare const enum NSFileProviderTestingOperationType {

	Ingestion = 0,

	Lookup = 1,

	Creation = 2,

	Modification = 3,

	Deletion = 4,

	ContentFetch = 5,

	ChildrenEnumeration = 6,

	CollisionResolution = 7
}

interface NSFileProviderThumbnailing extends NSObjectProtocol {

	fetchThumbnailsForItemIdentifiersRequestedSizePerThumbnailCompletionHandlerCompletionHandler(itemIdentifiers: NSArray<string> | string[], size: CGSize, perThumbnailCompletionHandler: (p1: string, p2: NSData, p3: NSError) => void, completionHandler: (p1: NSError) => void): NSProgress;
}
declare var NSFileProviderThumbnailing: {

	prototype: NSFileProviderThumbnailing;
};

declare var NSFileProviderTrashContainerItemIdentifier: string;

interface NSFileProviderTypeAndCreator {
	type: number;
	creator: number;
}
declare var NSFileProviderTypeAndCreator: interop.StructType<NSFileProviderTypeAndCreator>;

declare var NSFileProviderWorkingSetContainerItemIdentifier: string;
