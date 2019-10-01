
interface NSFileProviderChangeObserver extends NSObjectProtocol {

	didDeleteItemsWithIdentifiers(deletedItemIdentifiers: NSArray<string> | string[]): void;

	didUpdateItems(updatedItems: NSArray<NSFileProviderItem> | NSFileProviderItem[]): void;

	finishEnumeratingChangesUpToSyncAnchorMoreComing(anchor: NSData, moreComing: boolean): void;

	finishEnumeratingWithError(error: NSError): void;
}
declare var NSFileProviderChangeObserver: {

	prototype: NSFileProviderChangeObserver;
};

declare class NSFileProviderDomain extends NSObject {

	static alloc(): NSFileProviderDomain; // inherited from NSObject

	static new(): NSFileProviderDomain; // inherited from NSObject

	readonly displayName: string;

	readonly identifier: string;

	readonly pathRelativeToDocumentStorage: string;

	constructor(o: { identifier: string; displayName: string; pathRelativeToDocumentStorage: string; });

	initWithIdentifierDisplayNamePathRelativeToDocumentStorage(identifier: string, displayName: string, pathRelativeToDocumentStorage: string): this;
}

interface NSFileProviderEnumerationObserver extends NSObjectProtocol {

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

	VersionOutOfDate = -1006,

	DirectoryNotEmpty = -1007
}

declare var NSFileProviderErrorCollidingItemKey: string;

declare var NSFileProviderErrorDomain: string;

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

declare var NSFileProviderInitialPageSortedByDate: NSData;

declare var NSFileProviderInitialPageSortedByName: NSData;

interface NSFileProviderItem extends NSObjectProtocol {

	capabilities?: NSFileProviderItemCapabilities;

	childItemCount?: number;

	contentModificationDate?: Date;

	creationDate?: Date;

	documentSize?: number;

	downloaded?: boolean;

	downloading?: boolean;

	downloadingError?: NSError;

	favoriteRank?: number;

	filename: string;

	itemIdentifier: string;

	lastUsedDate?: Date;

	mostRecentEditorNameComponents?: NSPersonNameComponents;

	mostRecentVersionDownloaded?: boolean;

	ownerNameComponents?: NSPersonNameComponents;

	parentItemIdentifier: string;

	shared?: boolean;

	sharedByCurrentUser?: boolean;

	tagData?: NSData;

	trashed?: boolean;

	typeIdentifier: string;

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

	AllowsAddingSubItems = 2,

	AllowsContentEnumerating = 1,

	AllowsAll = 63
}

interface NSFileProviderItemDecorating extends NSFileProviderItem {
}
declare var NSFileProviderItemDecorating: {

	prototype: NSFileProviderItemDecorating;
};

interface NSFileProviderItemFlags extends NSObjectProtocol {

	hidden: boolean;

	pathExtensionHidden: boolean;

	userExecutable: boolean;

	userReadable: boolean;

	userWritable: boolean;
}
declare var NSFileProviderItemFlags: {

	prototype: NSFileProviderItemFlags;
};

declare class NSFileProviderManager extends NSObject {

	static addDomainCompletionHandler(domain: NSFileProviderDomain, completionHandler: (p1: NSError) => void): void;

	static alloc(): NSFileProviderManager; // inherited from NSObject

	static getDomainsWithCompletionHandler(completionHandler: (p1: NSArray<NSFileProviderDomain>, p2: NSError) => void): void;

	static managerForDomain(domain: NSFileProviderDomain): NSFileProviderManager;

	static new(): NSFileProviderManager; // inherited from NSObject

	static placeholderURLForURL(url: NSURL): NSURL;

	static removeAllDomainsWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	static removeDomainCompletionHandler(domain: NSFileProviderDomain, completionHandler: (p1: NSError) => void): void;

	static writePlaceholderAtURLWithMetadataError(placeholderURL: NSURL, metadata: NSFileProviderItem): boolean;

	readonly documentStorageURL: NSURL;

	readonly providerIdentifier: string;

	static readonly defaultManager: NSFileProviderManager;

	registerURLSessionTaskForItemWithIdentifierCompletionHandler(task: NSURLSessionTask, identifier: string, completion: (p1: NSError) => void): void;

	signalEnumeratorForContainerItemIdentifierCompletionHandler(containerItemIdentifier: string, completion: (p1: NSError) => void): void;
}

declare var NSFileProviderRootContainerItemIdentifier: string;

interface NSFileProviderServiceSource {

	serviceName: string;

	makeListenerEndpointAndReturnError(): NSXPCListenerEndpoint;
}
declare var NSFileProviderServiceSource: {

	prototype: NSFileProviderServiceSource;
};

declare var NSFileProviderWorkingSetContainerItemIdentifier: string;
