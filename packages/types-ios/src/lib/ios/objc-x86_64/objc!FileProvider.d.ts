
/**
 * @since 11.0
 */
interface NSFileProviderChangeObserver extends NSObjectProtocol {

	/**
	 * @since 16.0
	 */
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

/**
 * @since 16.0
 */
declare const enum NSFileProviderCreateItemOptions {

	MayAlreadyExist = 1,

	DeletionConflicted = 2
}

/**
 * @since 16.0
 */
interface NSFileProviderCustomAction extends NSObjectProtocol {

	performActionWithIdentifierOnItemsWithIdentifiersCompletionHandler(actionIdentifier: string, itemIdentifiers: NSArray<string> | string[], completionHandler: (p1: NSError) => void): NSProgress;
}
declare var NSFileProviderCustomAction: {

	prototype: NSFileProviderCustomAction;
};

/**
 * @since 16.0
 */
declare const enum NSFileProviderDeleteItemOptions {

	Recursive = 1
}

/**
 * @since 11.0
 */
declare class NSFileProviderDomain extends NSObject {

	static alloc(): NSFileProviderDomain; // inherited from NSObject

	static new(): NSFileProviderDomain; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly backingStoreIdentity: NSData;

	readonly displayName: string;

	readonly identifier: string;

	/**
	 * @since 11.0
	 */
	readonly pathRelativeToDocumentStorage: string;

	/**
	 * @since 16.0
	 */
	readonly replicated: boolean;

	/**
	 * @since 18.0
	 */
	supportsSyncingTrash: boolean;

	/**
	 * @since 16.0
	 */
	testingModes: NSFileProviderDomainTestingModes;

	/**
	 * @since 16.0
	 */
	readonly userEnabled: boolean;

	/**
	 * @since 16.0
	 */
	constructor(o: { identifier: string; displayName: string; });

	/**
	 * @since 11.0
	 */
	constructor(o: { identifier: string; displayName: string; pathRelativeToDocumentStorage: string; });

	/**
	 * @since 16.0
	 */
	initWithIdentifierDisplayName(identifier: string, displayName: string): this;

	/**
	 * @since 11.0
	 */
	initWithIdentifierDisplayNamePathRelativeToDocumentStorage(identifier: string, displayName: string, pathRelativeToDocumentStorage: string): this;
}

/**
 * @since 16.0
 */
declare var NSFileProviderDomainDidChange: string;

/**
 * @since 16.0
 */
declare const enum NSFileProviderDomainRemovalMode {

	RemoveAll = 0,

	PreserveDirtyUserData = 1,

	PreserveDownloadedUserData = 2
}

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
interface NSFileProviderEnumerating extends NSObjectProtocol {

	enumeratorForContainerItemIdentifierRequestError(containerItemIdentifier: string, request: NSFileProviderRequest): NSFileProviderEnumerator;
}
declare var NSFileProviderEnumerating: {

	prototype: NSFileProviderEnumerating;
};

/**
 * @since 11.0
 */
interface NSFileProviderEnumerationObserver extends NSObjectProtocol {

	/**
	 * @since 16.0
	 */
	suggestedPageSize?: number;

	didEnumerateItems(updatedItems: NSArray<NSFileProviderItem> | NSFileProviderItem[]): void;

	finishEnumeratingUpToPage(nextPage: NSData): void;

	finishEnumeratingWithError(error: NSError): void;
}
declare var NSFileProviderEnumerationObserver: {

	prototype: NSFileProviderEnumerationObserver;
};

/**
 * @since 11.0
 */
interface NSFileProviderEnumerator extends NSObjectProtocol {

	currentSyncAnchorWithCompletionHandler?(completionHandler: (p1: NSData) => void): void;

	enumerateChangesForObserverFromSyncAnchor?(observer: NSFileProviderChangeObserver, syncAnchor: NSData): void;

	enumerateItemsForObserverStartingAtPage(observer: NSFileProviderEnumerationObserver, page: NSData): void;

	invalidate(): void;
}
declare var NSFileProviderEnumerator: {

	prototype: NSFileProviderEnumerator;
};

/**
 * @since 11.0
 */
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

	DomainDisabled = -2011,

	ProviderDomainTemporarilyUnavailable = -2012,

	ProviderDomainNotFound = -2013,

	ApplicationExtensionNotFound = -2014
}

/**
 * @since 8.0
 * @deprecated 13.0
 */
declare var NSFileProviderErrorCollidingItemKey: string;

/**
 * @since 11.0
 */
declare var NSFileProviderErrorDomain: string;

/**
 * @since 13.0
 */
declare var NSFileProviderErrorItemKey: string;

/**
 * @since 11.0
 */
declare var NSFileProviderErrorNonExistentItemIdentifierKey: string;

/**
 * @since 8.0
 */
declare class NSFileProviderExtension extends NSObject {

	static alloc(): NSFileProviderExtension; // inherited from NSObject

	static new(): NSFileProviderExtension; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	static placeholderURLForURL(url: NSURL): NSURL;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	static writePlaceholderAtURLWithMetadataError(placeholderURL: NSURL, metadata: NSDictionary<string, any>): boolean;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	readonly documentStorageURL: NSURL;

	readonly domain: NSFileProviderDomain;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	readonly providerIdentifier: string;

	URLForItemWithPersistentIdentifier(identifier: string): NSURL;

	createDirectoryWithNameInParentItemIdentifierCompletionHandler(directoryName: string, parentItemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	deleteItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	enumeratorForContainerItemIdentifierError(containerItemIdentifier: string): NSFileProviderEnumerator;

	/**
	 * @since 11.0
	 */
	fetchThumbnailsForItemIdentifiersRequestedSizePerThumbnailCompletionHandlerCompletionHandler(itemIdentifiers: NSArray<string> | string[], size: CGSize, perThumbnailCompletionHandler: (p1: string, p2: NSData, p3: NSError) => void, completionHandler: (p1: NSError) => void): NSProgress;

	importDocumentAtURLToParentItemIdentifierCompletionHandler(fileURL: NSURL, parentItemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	itemChangedAtURL(url: NSURL): void;

	/**
	 * @since 11.0
	 */
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

	/**
	 * @since 11.0
	 */
	supportedServiceSourcesForItemIdentifierError(itemIdentifier: string): NSArray<NSFileProviderServiceSource>;

	trashItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;

	untrashItemWithIdentifierToParentItemIdentifierCompletionHandler(itemIdentifier: string, parentItemIdentifier: string, completionHandler: (p1: NSFileProviderItem, p2: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare var NSFileProviderFavoriteRankUnranked: number;

declare const enum NSFileProviderFileSystemFlags {

	UserExecutable = 1,

	UserReadable = 2,

	UserWritable = 4,

	Hidden = 8,

	PathExtensionHidden = 16
}

/**
 * @since 16.0
 */
interface NSFileProviderIncrementalContentFetching extends NSObjectProtocol {

	fetchContentsForItemWithIdentifierVersionUsingExistingContentsAtURLExistingVersionRequestCompletionHandler(itemIdentifier: string, requestedVersion: NSFileProviderItemVersion, existingContents: NSURL, existingVersion: NSFileProviderItemVersion, request: NSFileProviderRequest, completionHandler: (p1: NSURL, p2: NSFileProviderItem, p3: NSError) => void): NSProgress;
}
declare var NSFileProviderIncrementalContentFetching: {

	prototype: NSFileProviderIncrementalContentFetching;
};

/**
 * @since 11.0
 */
declare var NSFileProviderInitialPageSortedByDate: NSData;

/**
 * @since 11.0
 */
declare var NSFileProviderInitialPageSortedByName: NSData;

/**
 * @since 11.0
 */
interface NSFileProviderItem extends NSObjectProtocol {

	capabilities?: NSFileProviderItemCapabilities;

	childItemCount?: number;

	contentModificationDate?: Date;

	/**
	 * @since 16.0
	 */
	contentPolicy?: NSFileProviderContentPolicy;

	/**
	 * @since 14.0
	 */
	contentType?: UTType;

	creationDate?: Date;

	documentSize?: number;

	downloaded?: boolean;

	downloading?: boolean;

	downloadingError?: NSError;

	/**
	 * @since 16.0
	 */
	extendedAttributes?: NSDictionary<string, NSData>;

	/**
	 * @since 11.0
	 */
	favoriteRank?: number;

	/**
	 * @since 16.0
	 */
	fileSystemFlags?: NSFileProviderFileSystemFlags;

	filename: string;

	itemIdentifier: string;

	/**
	 * @since 16.0
	 */
	itemVersion?: NSFileProviderItemVersion;

	lastUsedDate?: Date;

	mostRecentEditorNameComponents?: NSPersonNameComponents;

	mostRecentVersionDownloaded?: boolean;

	ownerNameComponents?: NSPersonNameComponents;

	parentItemIdentifier: string;

	shared?: boolean;

	sharedByCurrentUser?: boolean;

	/**
	 * @since 16.0
	 */
	symlinkTargetPath?: string;

	tagData?: NSData;

	/**
	 * @since 11.0
	 */
	trashed?: boolean;

	/**
	 * @since 16.0
	 */
	typeAndCreator?: NSFileProviderTypeAndCreator;

	/**
	 * @since 11.0
	 * @deprecated 15.0
	 */
	typeIdentifier?: string;

	uploaded?: boolean;

	uploading?: boolean;

	uploadingError?: NSError;

	userInfo?: NSDictionary<any, any>;

	/**
	 * @since 11.0
	 */
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

/**
 * @since 16.0
 */
interface NSFileProviderItemDecorating extends NSFileProviderItem {

	decorations: NSArray<string>;
}
declare var NSFileProviderItemDecorating: {

	prototype: NSFileProviderItemDecorating;
};

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
declare class NSFileProviderItemVersion extends NSObject {

	static alloc(): NSFileProviderItemVersion; // inherited from NSObject

	static new(): NSFileProviderItemVersion; // inherited from NSObject

	readonly contentVersion: NSData;

	readonly metadataVersion: NSData;

	/**
	 * @since 16.0
	 */
	static readonly beforeFirstSyncComponent: NSData;

	constructor(o: { contentVersion: NSData; metadataVersion: NSData; });

	initWithContentVersionMetadataVersion(contentVersion: NSData, metadataVersion: NSData): this;
}

declare const enum NSFileProviderKnownFolders {

	Desktop = 1,

	Documents = 2
}

/**
 * @since 11.0
 */
declare class NSFileProviderManager extends NSObject {

	static addDomainCompletionHandler(domain: NSFileProviderDomain, completionHandler: (p1: NSError) => void): void;

	static alloc(): NSFileProviderManager; // inherited from NSObject

	static getDomainsWithCompletionHandler(completionHandler: (p1: NSArray<NSFileProviderDomain>, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	static getIdentifierForUserVisibleFileAtURLCompletionHandler(url: NSURL, completionHandler: (p1: string, p2: string, p3: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	static importDomainFromDirectoryAtURLCompletionHandler(domain: NSFileProviderDomain, url: NSURL, completionHandler: (p1: NSError) => void): void;

	static managerForDomain(domain: NSFileProviderDomain): NSFileProviderManager;

	static new(): NSFileProviderManager; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static placeholderURLForURL(url: NSURL): NSURL;

	static removeAllDomainsWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	static removeDomainCompletionHandler(domain: NSFileProviderDomain, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	static removeDomainModeCompletionHandler(domain: NSFileProviderDomain, mode: NSFileProviderDomainRemovalMode, completionHandler: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	static writePlaceholderAtURLWithMetadataError(placeholderURL: NSURL, metadata: NSFileProviderItem): boolean;

	/**
	 * @since 11.0
	 */
	readonly documentStorageURL: NSURL;

	/**
	 * @since 11.0
	 */
	readonly providerIdentifier: string;

	static readonly defaultManager: NSFileProviderManager;

	/**
	 * @since 16.0
	 */
	enumeratorForMaterializedItems(): NSFileProviderEnumerator;

	/**
	 * @since 16.0
	 */
	enumeratorForPendingItems(): NSFileProviderPendingSetEnumerator;

	/**
	 * @since 16.0
	 */
	evictItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	getServiceWithNameItemIdentifierCompletionHandler(serviceName: string, itemIdentifier: string, completionHandler: (p1: NSFileProviderService, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	getUserVisibleURLForItemIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	globalProgressForKind(kind: string): NSProgress;

	/**
	 * @since 16.0
	 */
	listAvailableTestingOperationsWithError(): NSArray<NSFileProviderTestingOperation>;

	registerURLSessionTaskForItemWithIdentifierCompletionHandler(task: NSURLSessionTask, identifier: string, completion: (p1: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	reimportItemsBelowItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	requestModificationOfFieldsForItemWithIdentifierOptionsCompletionHandler(fields: NSFileProviderItemFields, itemIdentifier: string, options: NSFileProviderModifyItemOptions, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	runTestingOperationsError(operations: NSArray<NSFileProviderTestingOperation> | NSFileProviderTestingOperation[]): NSDictionary<NSFileProviderTestingOperation, NSError>;

	signalEnumeratorForContainerItemIdentifierCompletionHandler(containerItemIdentifier: string, completion: (p1: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	signalErrorResolvedCompletionHandler(error: NSError, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	temporaryDirectoryURLWithError(): NSURL;

	/**
	 * @since 16.0
	 */
	waitForChangesOnItemsBelowItemWithIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	waitForStabilizationWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 16.0
 */
declare var NSFileProviderMaterializedSetDidChange: string;

/**
 * @since 16.0
 */
declare const enum NSFileProviderModifyItemOptions {

	MayAlreadyExist = 1
}

/**
 * @since 16.0
 */
declare var NSFileProviderPendingSetDidChange: string;

/**
 * @since 16.0
 */
interface NSFileProviderPendingSetEnumerator extends NSFileProviderEnumerator {

	domainVersion: NSFileProviderDomainVersion;

	/**
	 * @since 16.0
	 */
	maximumSizeReached: boolean;

	refreshInterval: number;
}
declare var NSFileProviderPendingSetEnumerator: {

	prototype: NSFileProviderPendingSetEnumerator;
};

/**
 * @since 16.0
 */
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

	/**
	 * @since 16.0
	 */
	pendingItemsDidChangeWithCompletionHandler?(completionHandler: () => void): void;
}
declare var NSFileProviderReplicatedExtension: {

	prototype: NSFileProviderReplicatedExtension;
};

/**
 * @since 16.0
 */
declare class NSFileProviderRequest extends NSObject {

	static alloc(): NSFileProviderRequest; // inherited from NSObject

	static new(): NSFileProviderRequest; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly domainVersion: NSFileProviderDomainVersion;

	readonly isFileViewerRequest: boolean;

	readonly isSystemRequest: boolean;
}

/**
 * @since 11.0
 */
declare var NSFileProviderRootContainerItemIdentifier: string;

/**
 * @since 11.0
 */
interface NSFileProviderServiceSource {

	/**
	 * @since 16.0
	 */
	restricted?: boolean;

	serviceName: string;

	makeListenerEndpointAndReturnError(): NSXPCListenerEndpoint;
}
declare var NSFileProviderServiceSource: {

	prototype: NSFileProviderServiceSource;
};

/**
 * @since 16.0
 */
interface NSFileProviderServicing extends NSObjectProtocol {

	supportedServiceSourcesForItemIdentifierCompletionHandler(itemIdentifier: string, completionHandler: (p1: NSArray<NSFileProviderServiceSource>, p2: NSError) => void): NSProgress;
}
declare var NSFileProviderServicing: {

	prototype: NSFileProviderServicing;
};

/**
 * @since 16.0
 */
interface NSFileProviderTestingChildrenEnumeration extends NSFileProviderTestingOperation {

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingChildrenEnumeration: {

	prototype: NSFileProviderTestingChildrenEnumeration;
};

/**
 * @since 16.0
 */
interface NSFileProviderTestingCollisionResolution extends NSFileProviderTestingOperation {

	renamedItem: NSFileProviderItem;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingCollisionResolution: {

	prototype: NSFileProviderTestingCollisionResolution;
};

/**
 * @since 16.0
 */
interface NSFileProviderTestingContentFetch extends NSFileProviderTestingOperation {

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingContentFetch: {

	prototype: NSFileProviderTestingContentFetch;
};

/**
 * @since 16.0
 */
interface NSFileProviderTestingCreation extends NSFileProviderTestingOperation {

	domainVersion: NSFileProviderDomainVersion;

	sourceItem: NSFileProviderItem;

	targetSide: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingCreation: {

	prototype: NSFileProviderTestingCreation;
};

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
interface NSFileProviderTestingIngestion extends NSFileProviderTestingOperation {

	item: NSFileProviderItem;

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingIngestion: {

	prototype: NSFileProviderTestingIngestion;
};

/**
 * @since 16.0
 */
interface NSFileProviderTestingLookup extends NSFileProviderTestingOperation {

	itemIdentifier: string;

	side: NSFileProviderTestingOperationSide;
}
declare var NSFileProviderTestingLookup: {

	prototype: NSFileProviderTestingLookup;
};

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
declare const enum NSFileProviderTestingOperationSide {

	Disk = 0,

	FileProvider = 1
}

/**
 * @since 16.0
 */
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

/**
 * @since 16.0
 */
interface NSFileProviderThumbnailing extends NSObjectProtocol {

	fetchThumbnailsForItemIdentifiersRequestedSizePerThumbnailCompletionHandlerCompletionHandler(itemIdentifiers: NSArray<string> | string[], size: CGSize, perThumbnailCompletionHandler: (p1: string, p2: NSData, p3: NSError) => void, completionHandler: (p1: NSError) => void): NSProgress;
}
declare var NSFileProviderThumbnailing: {

	prototype: NSFileProviderThumbnailing;
};

/**
 * @since 16.0
 */
declare var NSFileProviderTrashContainerItemIdentifier: string;

interface NSFileProviderTypeAndCreator {
	type: number;
	creator: number;
}
declare var NSFileProviderTypeAndCreator: interop.StructType<NSFileProviderTypeAndCreator>;

/**
 * @since 11.0
 */
declare var NSFileProviderWorkingSetContainerItemIdentifier: string;
