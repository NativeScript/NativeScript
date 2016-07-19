
declare class PHAdjustmentData extends NSObject {

	static alloc(): PHAdjustmentData; // inherited from NSObject

	static new(): PHAdjustmentData; // inherited from NSObject

	/* readonly */ data: NSData;

	/* readonly */ formatIdentifier: string;

	/* readonly */ formatVersion: string;

	constructor(); // inherited from NSObject

	constructor(o: { formatIdentifier: string; formatVersion: string; data: NSData; });

	self(): PHAdjustmentData; // inherited from NSObjectProtocol
}

declare class PHAsset extends PHObject {

	static fetchAssetsInAssetCollectionOptions(assetCollection: PHAssetCollection, options: PHFetchOptions): PHFetchResult<PHAsset>;

	static fetchAssetsWithALAssetURLsOptions(assetURLs: NSArray<NSURL>, options: PHFetchOptions): PHFetchResult<PHAsset>;

	static fetchAssetsWithBurstIdentifierOptions(burstIdentifier: string, options: PHFetchOptions): PHFetchResult<PHAsset>;

	static fetchAssetsWithLocalIdentifiersOptions(identifiers: NSArray<string>, options: PHFetchOptions): PHFetchResult<PHAsset>;

	static fetchAssetsWithMediaTypeOptions(mediaType: PHAssetMediaType, options: PHFetchOptions): PHFetchResult<PHAsset>;

	static fetchAssetsWithOptions(options: PHFetchOptions): PHFetchResult<PHAsset>;

	static fetchKeyAssetsInAssetCollectionOptions(assetCollection: PHAssetCollection, options: PHFetchOptions): PHFetchResult<PHAsset>;

	/* readonly */ burstIdentifier: string;

	/* readonly */ burstSelectionTypes: PHAssetBurstSelectionType;

	/* readonly */ creationDate: Date;

	/* readonly */ duration: number;

	/* readonly */ favorite: boolean;

	/* readonly */ hidden: boolean;

	/* readonly */ location: CLLocation;

	/* readonly */ mediaSubtypes: PHAssetMediaSubtype;

	/* readonly */ mediaType: PHAssetMediaType;

	/* readonly */ modificationDate: Date;

	/* readonly */ pixelHeight: number;

	/* readonly */ pixelWidth: number;

	/* readonly */ representsBurst: boolean;

	/* readonly */ sourceType: PHAssetSourceType;

	canPerformEditOperation(editOperation: PHAssetEditOperation): boolean;

	cancelContentEditingInputRequest(requestID: number): void;

	requestContentEditingInputWithOptionsCompletionHandler(options: PHContentEditingInputRequestOptions, completionHandler: (p1: PHContentEditingInput, p2: NSDictionary<any, any>) => void): number;
}

declare const enum PHAssetBurstSelectionType {

	None = 0,

	AutoPick = 1,

	UserPick = 2
}

declare class PHAssetChangeRequest extends NSObject {

	static alloc(): PHAssetChangeRequest; // inherited from NSObject

	static changeRequestForAsset(asset: PHAsset): PHAssetChangeRequest;

	static creationRequestForAssetFromImage(image: UIImage): PHAssetChangeRequest;

	static creationRequestForAssetFromImageAtFileURL(fileURL: NSURL): PHAssetChangeRequest;

	static creationRequestForAssetFromVideoAtFileURL(fileURL: NSURL): PHAssetChangeRequest;

	static deleteAssets(assets: NSFastEnumeration): void;

	static new(): PHAssetChangeRequest; // inherited from NSObject

	contentEditingOutput: PHContentEditingOutput;

	creationDate: Date;

	favorite: boolean;

	hidden: boolean;

	location: CLLocation;

	/* readonly */ placeholderForCreatedAsset: PHObjectPlaceholder;

	constructor(); // inherited from NSObject

	revertAssetContentToOriginal(): void;

	self(): PHAssetChangeRequest; // inherited from NSObjectProtocol
}

declare class PHAssetCollection extends PHCollection {

	static fetchAssetCollectionsContainingAssetWithTypeOptions(asset: PHAsset, type: PHAssetCollectionType, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	static fetchAssetCollectionsWithALAssetGroupURLsOptions(assetGroupURLs: NSArray<NSURL>, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	static fetchAssetCollectionsWithLocalIdentifiersOptions(identifiers: NSArray<string>, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	static fetchAssetCollectionsWithTypeSubtypeOptions(type: PHAssetCollectionType, subtype: PHAssetCollectionSubtype, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	static fetchMomentsInMomentListOptions(momentList: PHCollectionList, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	static fetchMomentsWithOptions(options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	static transientAssetCollectionWithAssetFetchResultTitle(fetchResult: PHFetchResult<PHAsset>, title: string): PHAssetCollection;

	static transientAssetCollectionWithAssetsTitle(assets: NSArray<PHAsset>, title: string): PHAssetCollection;

	/* readonly */ approximateLocation: CLLocation;

	/* readonly */ assetCollectionSubtype: PHAssetCollectionSubtype;

	/* readonly */ assetCollectionType: PHAssetCollectionType;

	/* readonly */ endDate: Date;

	/* readonly */ estimatedAssetCount: number;

	/* readonly */ localizedLocationNames: NSArray<string>;

	/* readonly */ startDate: Date;
}

declare class PHAssetCollectionChangeRequest extends NSObject {

	static alloc(): PHAssetCollectionChangeRequest; // inherited from NSObject

	static changeRequestForAssetCollection(assetCollection: PHAssetCollection): PHAssetCollectionChangeRequest;

	static changeRequestForAssetCollectionAssets(assetCollection: PHAssetCollection, assets: PHFetchResult<any>): PHAssetCollectionChangeRequest;

	static creationRequestForAssetCollectionWithTitle(title: string): PHAssetCollectionChangeRequest;

	static deleteAssetCollections(assetCollections: NSFastEnumeration): void;

	static new(): PHAssetCollectionChangeRequest; // inherited from NSObject

	/* readonly */ placeholderForCreatedAssetCollection: PHObjectPlaceholder;

	title: string;

	constructor(); // inherited from NSObject

	addAssets(assets: NSFastEnumeration): void;

	insertAssetsAtIndexes(assets: NSFastEnumeration, indexes: NSIndexSet): void;

	moveAssetsAtIndexesToIndex(fromIndexes: NSIndexSet, toIndex: number): void;

	removeAssets(assets: NSFastEnumeration): void;

	removeAssetsAtIndexes(indexes: NSIndexSet): void;

	replaceAssetsAtIndexesWithAssets(indexes: NSIndexSet, assets: NSFastEnumeration): void;

	self(): PHAssetCollectionChangeRequest; // inherited from NSObjectProtocol
}

declare const enum PHAssetCollectionSubtype {

	AlbumRegular = 2,

	AlbumSyncedEvent = 3,

	AlbumSyncedFaces = 4,

	AlbumSyncedAlbum = 5,

	AlbumImported = 6,

	AlbumMyPhotoStream = 100,

	AlbumCloudShared = 101,

	SmartAlbumGeneric = 200,

	SmartAlbumPanoramas = 201,

	SmartAlbumVideos = 202,

	SmartAlbumFavorites = 203,

	SmartAlbumTimelapses = 204,

	SmartAlbumAllHidden = 205,

	SmartAlbumRecentlyAdded = 206,

	SmartAlbumBursts = 207,

	SmartAlbumSlomoVideos = 208,

	SmartAlbumUserLibrary = 209,

	SmartAlbumSelfPortraits = 210,

	SmartAlbumScreenshots = 211,

	Any = 2147483647
}

declare const enum PHAssetCollectionType {

	Album = 1,

	SmartAlbum = 2,

	Moment = 3
}

declare class PHAssetCreationRequest extends PHAssetChangeRequest {

	static changeRequestForAsset(asset: PHAsset): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	static creationRequestForAsset(): PHAssetCreationRequest;

	static creationRequestForAssetFromImage(image: UIImage): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	static creationRequestForAssetFromImageAtFileURL(fileURL: NSURL): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	static creationRequestForAssetFromVideoAtFileURL(fileURL: NSURL): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	static supportsAssetResourceTypes(types: NSArray<number>): boolean;

	addResourceWithTypeDataOptions(type: PHAssetResourceType, data: NSData, options: PHAssetResourceCreationOptions): void;

	addResourceWithTypeFileURLOptions(type: PHAssetResourceType, fileURL: NSURL, options: PHAssetResourceCreationOptions): void;
}

declare const enum PHAssetEditOperation {

	Delete = 1,

	Content = 2,

	Properties = 3
}

declare const enum PHAssetMediaSubtype {

	None = 0,

	PhotoPanorama = 1,

	PhotoHDR = 2,

	PhotoScreenshot = 4,

	PhotoLive = 8,

	VideoStreamed = 65536,

	VideoHighFrameRate = 131072,

	VideoTimelapse = 262144
}

declare const enum PHAssetMediaType {

	Unknown = 0,

	Image = 1,

	Video = 2,

	Audio = 3
}

declare class PHAssetResource extends NSObject {

	static alloc(): PHAssetResource; // inherited from NSObject

	static assetResourcesForAsset(asset: PHAsset): NSArray<PHAssetResource>;

	static assetResourcesForLivePhoto(livePhoto: PHLivePhoto): NSArray<PHAssetResource>;

	static new(): PHAssetResource; // inherited from NSObject

	/* readonly */ assetLocalIdentifier: string;

	/* readonly */ originalFilename: string;

	/* readonly */ type: PHAssetResourceType;

	/* readonly */ uniformTypeIdentifier: string;

	constructor(); // inherited from NSObject

	self(): PHAssetResource; // inherited from NSObjectProtocol
}

declare class PHAssetResourceCreationOptions extends NSObject implements NSCopying {

	static alloc(): PHAssetResourceCreationOptions; // inherited from NSObject

	static new(): PHAssetResourceCreationOptions; // inherited from NSObject

	originalFilename: string;

	shouldMoveFile: boolean;

	uniformTypeIdentifier: string;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): PHAssetResourceCreationOptions; // inherited from NSObjectProtocol
}

declare class PHAssetResourceManager extends NSObject {

	static alloc(): PHAssetResourceManager; // inherited from NSObject

	static defaultManager(): PHAssetResourceManager;

	static new(): PHAssetResourceManager; // inherited from NSObject

	constructor(); // inherited from NSObject

	cancelDataRequest(requestID: number): void;

	requestDataForAssetResourceOptionsDataReceivedHandlerCompletionHandler(resource: PHAssetResource, options: PHAssetResourceRequestOptions, handler: (p1: NSData) => void, completionHandler: (p1: NSError) => void): number;

	self(): PHAssetResourceManager; // inherited from NSObjectProtocol

	writeDataForAssetResourceToFileOptionsCompletionHandler(resource: PHAssetResource, fileURL: NSURL, options: PHAssetResourceRequestOptions, completionHandler: (p1: NSError) => void): void;
}

declare class PHAssetResourceRequestOptions extends NSObject implements NSCopying {

	static alloc(): PHAssetResourceRequestOptions; // inherited from NSObject

	static new(): PHAssetResourceRequestOptions; // inherited from NSObject

	networkAccessAllowed: boolean;

	progressHandler: (p1: number) => void;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): PHAssetResourceRequestOptions; // inherited from NSObjectProtocol
}

declare const enum PHAssetResourceType {

	Photo = 1,

	Video = 2,

	Audio = 3,

	AlternatePhoto = 4,

	FullSizePhoto = 5,

	FullSizeVideo = 6,

	AdjustmentData = 7,

	AdjustmentBasePhoto = 8,

	PairedVideo = 9
}

declare const enum PHAssetSourceType {

	None = 0,

	UserLibrary = 1,

	CloudShared = 2,

	iTunesSynced = 4
}

declare const enum PHAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare class PHCachingImageManager extends PHImageManager {

	allowsCachingHighQualityImages: boolean;

	startCachingImagesForAssetsTargetSizeContentModeOptions(assets: NSArray<PHAsset>, targetSize: CGSize, contentMode: PHImageContentMode, options: PHImageRequestOptions): void;

	stopCachingImagesForAllAssets(): void;

	stopCachingImagesForAssetsTargetSizeContentModeOptions(assets: NSArray<PHAsset>, targetSize: CGSize, contentMode: PHImageContentMode, options: PHImageRequestOptions): void;
}

declare class PHChange extends NSObject {

	static alloc(): PHChange; // inherited from NSObject

	static new(): PHChange; // inherited from NSObject

	constructor(); // inherited from NSObject

	changeDetailsForFetchResult(object: PHFetchResult<any>): PHFetchResultChangeDetails;

	changeDetailsForObject(object: PHObject): PHObjectChangeDetails;

	self(): PHChange; // inherited from NSObjectProtocol
}

declare class PHCollection extends PHObject {

	static fetchCollectionsInCollectionListOptions(collectionList: PHCollectionList, options: PHFetchOptions): PHFetchResult<PHCollection>;

	static fetchTopLevelUserCollectionsWithOptions(options: PHFetchOptions): PHFetchResult<PHCollection>;

	/* readonly */ canContainAssets: boolean;

	/* readonly */ canContainCollections: boolean;

	/* readonly */ localizedTitle: string;

	canPerformEditOperation(anOperation: PHCollectionEditOperation): boolean;
}

declare const enum PHCollectionEditOperation {

	DeleteContent = 1,

	RemoveContent = 2,

	AddContent = 3,

	CreateContent = 4,

	RearrangeContent = 5,

	Delete = 6,

	Rename = 7
}

declare class PHCollectionList extends PHCollection {

	static fetchCollectionListsContainingCollectionOptions(collection: PHCollection, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	static fetchCollectionListsWithLocalIdentifiersOptions(identifiers: NSArray<string>, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	static fetchCollectionListsWithTypeSubtypeOptions(collectionListType: PHCollectionListType, subtype: PHCollectionListSubtype, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	static fetchMomentListsWithSubtypeContainingMomentOptions(momentListSubtype: PHCollectionListSubtype, moment: PHAssetCollection, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	static fetchMomentListsWithSubtypeOptions(momentListSubtype: PHCollectionListSubtype, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	static transientCollectionListWithCollectionsFetchResultTitle(fetchResult: PHFetchResult<PHCollection>, title: string): PHCollectionList;

	static transientCollectionListWithCollectionsTitle(collections: NSArray<PHCollection>, title: string): PHCollectionList;

	/* readonly */ collectionListSubtype: PHCollectionListSubtype;

	/* readonly */ collectionListType: PHCollectionListType;

	/* readonly */ endDate: Date;

	/* readonly */ localizedLocationNames: NSArray<string>;

	/* readonly */ startDate: Date;
}

declare class PHCollectionListChangeRequest extends NSObject {

	static alloc(): PHCollectionListChangeRequest; // inherited from NSObject

	static changeRequestForCollectionList(collectionList: PHCollectionList): PHCollectionListChangeRequest;

	static changeRequestForCollectionListChildCollections(collectionList: PHCollectionList, childCollections: PHFetchResult<any>): PHCollectionListChangeRequest;

	static creationRequestForCollectionListWithTitle(title: string): PHCollectionListChangeRequest;

	static deleteCollectionLists(collectionLists: NSFastEnumeration): void;

	static new(): PHCollectionListChangeRequest; // inherited from NSObject

	/* readonly */ placeholderForCreatedCollectionList: PHObjectPlaceholder;

	title: string;

	constructor(); // inherited from NSObject

	addChildCollections(collections: NSFastEnumeration): void;

	insertChildCollectionsAtIndexes(collections: NSFastEnumeration, indexes: NSIndexSet): void;

	moveChildCollectionsAtIndexesToIndex(indexes: NSIndexSet, toIndex: number): void;

	removeChildCollections(collections: NSFastEnumeration): void;

	removeChildCollectionsAtIndexes(indexes: NSIndexSet): void;

	replaceChildCollectionsAtIndexesWithChildCollections(indexes: NSIndexSet, collections: NSFastEnumeration): void;

	self(): PHCollectionListChangeRequest; // inherited from NSObjectProtocol
}

declare const enum PHCollectionListSubtype {

	MomentListCluster = 1,

	MomentListYear = 2,

	RegularFolder = 100,

	SmartFolderEvents = 200,

	SmartFolderFaces = 201,

	Any = 2147483647
}

declare const enum PHCollectionListType {

	MomentList = 1,

	Folder = 2,

	SmartFolder = 3
}

declare class PHContentEditingInput extends NSObject {

	static alloc(): PHContentEditingInput; // inherited from NSObject

	static new(): PHContentEditingInput; // inherited from NSObject

	/* readonly */ adjustmentData: PHAdjustmentData;

	/* readonly */ audiovisualAsset: AVAsset;

	/* readonly */ avAsset: AVAsset;

	/* readonly */ creationDate: Date;

	/* readonly */ displaySizeImage: UIImage;

	/* readonly */ fullSizeImageOrientation: number;

	/* readonly */ fullSizeImageURL: NSURL;

	/* readonly */ location: CLLocation;

	/* readonly */ mediaSubtypes: PHAssetMediaSubtype;

	/* readonly */ mediaType: PHAssetMediaType;

	/* readonly */ uniformTypeIdentifier: string;

	constructor(); // inherited from NSObject

	self(): PHContentEditingInput; // inherited from NSObjectProtocol
}

declare var PHContentEditingInputCancelledKey: string;

declare var PHContentEditingInputErrorKey: string;

declare class PHContentEditingInputRequestOptions extends NSObject {

	static alloc(): PHContentEditingInputRequestOptions; // inherited from NSObject

	static new(): PHContentEditingInputRequestOptions; // inherited from NSObject

	canHandleAdjustmentData: (p1: PHAdjustmentData) => boolean;

	networkAccessAllowed: boolean;

	progressHandler: (p1: number, p2: interop.Reference<boolean>) => void;

	constructor(); // inherited from NSObject

	self(): PHContentEditingInputRequestOptions; // inherited from NSObjectProtocol
}

declare var PHContentEditingInputResultIsInCloudKey: string;

declare class PHContentEditingOutput extends NSObject {

	static alloc(): PHContentEditingOutput; // inherited from NSObject

	static new(): PHContentEditingOutput; // inherited from NSObject

	adjustmentData: PHAdjustmentData;

	/* readonly */ renderedContentURL: NSURL;

	constructor(); // inherited from NSObject

	constructor(o: { contentEditingInput: PHContentEditingInput; });

	constructor(o: { placeholderForCreatedAsset: PHObjectPlaceholder; });

	self(): PHContentEditingOutput; // inherited from NSObjectProtocol
}

declare class PHFetchOptions extends NSObject implements NSCopying {

	static alloc(): PHFetchOptions; // inherited from NSObject

	static new(): PHFetchOptions; // inherited from NSObject

	fetchLimit: number;

	includeAllBurstAssets: boolean;

	includeAssetSourceTypes: PHAssetSourceType;

	includeHiddenAssets: boolean;

	predicate: NSPredicate;

	sortDescriptors: NSArray<NSSortDescriptor>;

	wantsIncrementalChangeDetails: boolean;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): PHFetchOptions; // inherited from NSObjectProtocol
}

declare class PHFetchResult<ObjectType> extends NSObject implements NSCopying, NSFastEnumeration {

	static alloc<ObjectType>(): PHFetchResult<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): PHFetchResult<ObjectType>; // inherited from NSObject

	/* readonly */ count: number;

	/* readonly */ firstObject: ObjectType;

	/* readonly */ lastObject: ObjectType;
	[index: number]: ObjectType;
	[Symbol.iterator](): Iterator<any>;

	constructor(); // inherited from NSObject

	containsObject(anObject: ObjectType): boolean;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	countOfAssetsWithMediaType(mediaType: PHAssetMediaType): number;

	enumerateObjectsAtIndexesOptionsUsingBlock(s: NSIndexSet, opts: NSEnumerationOptions, block: (p1: ObjectType, p2: number, p3: interop.Reference<boolean>) => void): void;

	enumerateObjectsUsingBlock(block: (p1: ObjectType, p2: number, p3: interop.Reference<boolean>) => void): void;

	enumerateObjectsWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: ObjectType, p2: number, p3: interop.Reference<boolean>) => void): void;

	indexOfObject(anObject: ObjectType): number;

	indexOfObjectInRange(anObject: ObjectType, range: NSRange): number;

	objectAtIndex(index: number): ObjectType;

	objectAtIndexedSubscript(idx: number): ObjectType;

	objectsAtIndexes(indexes: NSIndexSet): NSArray<ObjectType>;

	self(): PHFetchResult<ObjectType>; // inherited from NSObjectProtocol
}

declare class PHFetchResultChangeDetails extends NSObject {

	static alloc(): PHFetchResultChangeDetails; // inherited from NSObject

	static changeDetailsFromFetchResultToFetchResultChangedObjects(fromResult: PHFetchResult<any>, toResult: PHFetchResult<any>, changedObjects: NSArray<PHObject>): PHFetchResultChangeDetails;

	static new(): PHFetchResultChangeDetails; // inherited from NSObject

	/* readonly */ changedIndexes: NSIndexSet;

	/* readonly */ changedObjects: NSArray<PHObject>;

	/* readonly */ fetchResultAfterChanges: PHFetchResult<any>;

	/* readonly */ fetchResultBeforeChanges: PHFetchResult<any>;

	/* readonly */ hasIncrementalChanges: boolean;

	/* readonly */ hasMoves: boolean;

	/* readonly */ insertedIndexes: NSIndexSet;

	/* readonly */ insertedObjects: NSArray<PHObject>;

	/* readonly */ removedIndexes: NSIndexSet;

	/* readonly */ removedObjects: NSArray<PHObject>;

	constructor(); // inherited from NSObject

	enumerateMovesWithBlock(handler: (p1: number, p2: number) => void): void;

	self(): PHFetchResultChangeDetails; // inherited from NSObjectProtocol
}

declare var PHImageCancelledKey: string;

declare const enum PHImageContentMode {

	AspectFit = 0,

	AspectFill = 1,

	Default = 0
}

declare var PHImageErrorKey: string;

declare class PHImageManager extends NSObject {

	static alloc(): PHImageManager; // inherited from NSObject

	static defaultManager(): PHImageManager;

	static new(): PHImageManager; // inherited from NSObject

	constructor(); // inherited from NSObject

	cancelImageRequest(requestID: number): void;

	requestAVAssetForVideoOptionsResultHandler(asset: PHAsset, options: PHVideoRequestOptions, resultHandler: (p1: AVAsset, p2: AVAudioMix, p3: NSDictionary<any, any>) => void): number;

	requestExportSessionForVideoOptionsExportPresetResultHandler(asset: PHAsset, options: PHVideoRequestOptions, exportPreset: string, resultHandler: (p1: AVAssetExportSession, p2: NSDictionary<any, any>) => void): number;

	requestImageDataForAssetOptionsResultHandler(asset: PHAsset, options: PHImageRequestOptions, resultHandler: (p1: NSData, p2: string, p3: UIImageOrientation, p4: NSDictionary<any, any>) => void): number;

	requestImageForAssetTargetSizeContentModeOptionsResultHandler(asset: PHAsset, targetSize: CGSize, contentMode: PHImageContentMode, options: PHImageRequestOptions, resultHandler: (p1: UIImage, p2: NSDictionary<any, any>) => void): number;

	requestLivePhotoForAssetTargetSizeContentModeOptionsResultHandler(asset: PHAsset, targetSize: CGSize, contentMode: PHImageContentMode, options: PHLivePhotoRequestOptions, resultHandler: (p1: PHLivePhoto, p2: NSDictionary<any, any>) => void): number;

	requestPlayerItemForVideoOptionsResultHandler(asset: PHAsset, options: PHVideoRequestOptions, resultHandler: (p1: AVPlayerItem, p2: NSDictionary<any, any>) => void): number;

	self(): PHImageManager; // inherited from NSObjectProtocol
}

declare var PHImageManagerMaximumSize: CGSize;

declare class PHImageRequestOptions extends NSObject implements NSCopying {

	static alloc(): PHImageRequestOptions; // inherited from NSObject

	static new(): PHImageRequestOptions; // inherited from NSObject

	deliveryMode: PHImageRequestOptionsDeliveryMode;

	networkAccessAllowed: boolean;

	normalizedCropRect: CGRect;

	progressHandler: (p1: number, p2: NSError, p3: interop.Reference<boolean>, p4: NSDictionary<any, any>) => void;

	resizeMode: PHImageRequestOptionsResizeMode;

	synchronous: boolean;

	version: PHImageRequestOptionsVersion;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): PHImageRequestOptions; // inherited from NSObjectProtocol
}

declare const enum PHImageRequestOptionsDeliveryMode {

	Opportunistic = 0,

	HighQualityFormat = 1,

	FastFormat = 2
}

declare const enum PHImageRequestOptionsResizeMode {

	None = 0,

	Fast = 1,

	Exact = 2
}

declare const enum PHImageRequestOptionsVersion {

	Current = 0,

	Unadjusted = 1,

	Original = 2
}

declare var PHImageResultIsDegradedKey: string;

declare var PHImageResultIsInCloudKey: string;

declare var PHImageResultRequestIDKey: string;

declare var PHInvalidAssetResourceDataRequestID: number;

declare var PHInvalidImageRequestID: number;

declare class PHLivePhoto extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): PHLivePhoto; // inherited from NSObject

	static cancelLivePhotoRequestWithRequestID(requestID: number): void;

	static new(): PHLivePhoto; // inherited from NSObject

	static requestLivePhotoWithResourceFileURLsPlaceholderImageTargetSizeContentModeResultHandler(fileURLs: NSArray<NSURL>, image: UIImage, targetSize: CGSize, contentMode: PHImageContentMode, resultHandler: (p1: PHLivePhoto, p2: NSDictionary<any, any>) => void): number;

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ size: CGSize;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): PHLivePhoto; // inherited from NSObjectProtocol
}

declare var PHLivePhotoInfoCancelledKey: string;

declare var PHLivePhotoInfoErrorKey: string;

declare var PHLivePhotoInfoIsDegradedKey: string;

declare var PHLivePhotoRequestIDInvalid: number;

declare class PHLivePhotoRequestOptions extends NSObject implements NSCopying {

	static alloc(): PHLivePhotoRequestOptions; // inherited from NSObject

	static new(): PHLivePhotoRequestOptions; // inherited from NSObject

	deliveryMode: PHImageRequestOptionsDeliveryMode;

	networkAccessAllowed: boolean;

	progressHandler: (p1: number, p2: NSError, p3: interop.Reference<boolean>, p4: NSDictionary<any, any>) => void;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): PHLivePhotoRequestOptions; // inherited from NSObjectProtocol
}

declare class PHObject extends NSObject implements NSCopying {

	static alloc(): PHObject; // inherited from NSObject

	static new(): PHObject; // inherited from NSObject

	/* readonly */ localIdentifier: string;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): PHObject; // inherited from NSObjectProtocol
}

declare class PHObjectChangeDetails extends NSObject {

	static alloc(): PHObjectChangeDetails; // inherited from NSObject

	static new(): PHObjectChangeDetails; // inherited from NSObject

	/* readonly */ assetContentChanged: boolean;

	/* readonly */ objectAfterChanges: PHObject;

	/* readonly */ objectBeforeChanges: PHObject;

	/* readonly */ objectWasDeleted: boolean;

	constructor(); // inherited from NSObject

	self(): PHObjectChangeDetails; // inherited from NSObjectProtocol
}

declare class PHObjectPlaceholder extends PHObject {
}

declare class PHPhotoLibrary extends NSObject {

	static alloc(): PHPhotoLibrary; // inherited from NSObject

	static authorizationStatus(): PHAuthorizationStatus;

	static new(): PHPhotoLibrary; // inherited from NSObject

	static requestAuthorization(handler: (p1: PHAuthorizationStatus) => void): void;

	static sharedPhotoLibrary(): PHPhotoLibrary;

	constructor(); // inherited from NSObject

	performChangesAndWaitError(changeBlock: () => void): boolean;

	performChangesCompletionHandler(changeBlock: () => void, completionHandler: (p1: boolean, p2: NSError) => void): void;

	registerChangeObserver(observer: PHPhotoLibraryChangeObserver): void;

	self(): PHPhotoLibrary; // inherited from NSObjectProtocol

	unregisterChangeObserver(observer: PHPhotoLibraryChangeObserver): void;
}

interface PHPhotoLibraryChangeObserver extends NSObjectProtocol {

	photoLibraryDidChange(changeInstance: PHChange): void;
}
declare var PHPhotoLibraryChangeObserver: {

	prototype: PHPhotoLibraryChangeObserver;
};

declare class PHVideoRequestOptions extends NSObject {

	static alloc(): PHVideoRequestOptions; // inherited from NSObject

	static new(): PHVideoRequestOptions; // inherited from NSObject

	deliveryMode: PHVideoRequestOptionsDeliveryMode;

	networkAccessAllowed: boolean;

	progressHandler: (p1: number, p2: NSError, p3: interop.Reference<boolean>, p4: NSDictionary<any, any>) => void;

	version: PHVideoRequestOptionsVersion;

	constructor(); // inherited from NSObject

	self(): PHVideoRequestOptions; // inherited from NSObjectProtocol
}

declare const enum PHVideoRequestOptionsDeliveryMode {

	Automatic = 0,

	HighQualityFormat = 1,

	MediumQualityFormat = 2,

	FastFormat = 3
}

declare const enum PHVideoRequestOptionsVersion {

	Current = 0,

	Original = 1
}
