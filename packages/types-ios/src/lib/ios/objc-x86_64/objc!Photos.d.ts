
/**
 * @since 14
 */
declare const enum PHAccessLevel {

	AddOnly = 1,

	ReadWrite = 2
}

/**
 * @since 8
 */
declare class PHAdjustmentData extends NSObject {

	static alloc(): PHAdjustmentData; // inherited from NSObject

	static new(): PHAdjustmentData; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly data: NSData;

	/**
	 * @since 8
	 */
	readonly formatIdentifier: string;

	/**
	 * @since 8
	 */
	readonly formatVersion: string;

	/**
	 * @since 8
	 */
	constructor(o: { formatIdentifier: string; formatVersion: string; data: NSData; });

	/**
	 * @since 8
	 */
	initWithFormatIdentifierFormatVersionData(formatIdentifier: string, formatVersion: string, data: NSData): this;
}

/**
 * @since 8
 */
declare class PHAsset extends PHObject {

	static alloc(): PHAsset; // inherited from NSObject

	/**
	 * @since 8
	 */
	static fetchAssetsInAssetCollectionOptions(assetCollection: PHAssetCollection, options: PHFetchOptions): PHFetchResult<PHAsset>;

	/**
	 * @since 8
	 * @deprecated 11
	 */
	static fetchAssetsWithALAssetURLsOptions(assetURLs: NSArray<NSURL> | NSURL[], options: PHFetchOptions): PHFetchResult<PHAsset>;

	/**
	 * @since 8
	 */
	static fetchAssetsWithBurstIdentifierOptions(burstIdentifier: string, options: PHFetchOptions): PHFetchResult<PHAsset>;

	/**
	 * @since 8
	 */
	static fetchAssetsWithLocalIdentifiersOptions(identifiers: NSArray<string> | string[], options: PHFetchOptions): PHFetchResult<PHAsset>;

	/**
	 * @since 8
	 */
	static fetchAssetsWithMediaTypeOptions(mediaType: PHAssetMediaType, options: PHFetchOptions): PHFetchResult<PHAsset>;

	/**
	 * @since 8
	 */
	static fetchAssetsWithOptions(options: PHFetchOptions): PHFetchResult<PHAsset>;

	/**
	 * @since 8
	 */
	static fetchKeyAssetsInAssetCollectionOptions(assetCollection: PHAssetCollection, options: PHFetchOptions): PHFetchResult<PHAsset>;

	static new(): PHAsset; // inherited from NSObject

	/**
	 * @since 15
	 */
	readonly adjustmentFormatIdentifier: string;

	/**
	 * @since 8
	 */
	readonly burstIdentifier: string;

	/**
	 * @since 8
	 */
	readonly burstSelectionTypes: PHAssetBurstSelectionType;

	/**
	 * @since 8
	 */
	readonly creationDate: Date;

	/**
	 * @since 8
	 */
	readonly duration: number;

	/**
	 * @since 8
	 */
	readonly favorite: boolean;

	/**
	 * @since 15
	 */
	readonly hasAdjustments: boolean;

	/**
	 * @since 8
	 */
	readonly hidden: boolean;

	/**
	 * @since 8
	 */
	readonly location: CLLocation;

	/**
	 * @since 8
	 */
	readonly mediaSubtypes: PHAssetMediaSubtype;

	/**
	 * @since 8
	 */
	readonly mediaType: PHAssetMediaType;

	/**
	 * @since 8
	 */
	readonly modificationDate: Date;

	/**
	 * @since 8
	 */
	readonly pixelHeight: number;

	/**
	 * @since 8
	 */
	readonly pixelWidth: number;

	/**
	 * @since 11
	 */
	readonly playbackStyle: PHAssetPlaybackStyle;

	/**
	 * @since 8
	 */
	readonly representsBurst: boolean;

	/**
	 * @since 9
	 */
	readonly sourceType: PHAssetSourceType;

	/**
	 * @since 8
	 */
	canPerformEditOperation(editOperation: PHAssetEditOperation): boolean;

	/**
	 * @since 8
	 */
	cancelContentEditingInputRequest(requestID: number): void;

	/**
	 * @since 8
	 */
	requestContentEditingInputWithOptionsCompletionHandler(options: PHContentEditingInputRequestOptions, completionHandler: (p1: PHContentEditingInput, p2: NSDictionary<any, any>) => void): number;
}

/**
 * @since 8
 */
declare const enum PHAssetBurstSelectionType {

	None = 0,

	AutoPick = 1,

	UserPick = 2
}

/**
 * @since 8
 */
declare class PHAssetChangeRequest extends PHChangeRequest {

	static alloc(): PHAssetChangeRequest; // inherited from NSObject

	/**
	 * @since 8
	 */
	static changeRequestForAsset(asset: PHAsset): PHAssetChangeRequest;

	/**
	 * @since 8
	 */
	static creationRequestForAssetFromImage(image: UIImage): PHAssetChangeRequest;

	/**
	 * @since 8
	 */
	static creationRequestForAssetFromImageAtFileURL(fileURL: NSURL): PHAssetChangeRequest;

	/**
	 * @since 8
	 */
	static creationRequestForAssetFromVideoAtFileURL(fileURL: NSURL): PHAssetChangeRequest;

	/**
	 * @since 8
	 */
	static deleteAssets(assets: NSFastEnumeration): void;

	static new(): PHAssetChangeRequest; // inherited from NSObject

	/**
	 * @since 8
	 */
	contentEditingOutput: PHContentEditingOutput;

	/**
	 * @since 8
	 */
	creationDate: Date;

	/**
	 * @since 8
	 */
	favorite: boolean;

	/**
	 * @since 8
	 */
	hidden: boolean;

	/**
	 * @since 8
	 */
	location: CLLocation;

	/**
	 * @since 8
	 */
	readonly placeholderForCreatedAsset: PHObjectPlaceholder;

	/**
	 * @since 8
	 */
	revertAssetContentToOriginal(): void;
}

/**
 * @since 8
 */
declare class PHAssetCollection extends PHCollection {

	static alloc(): PHAssetCollection; // inherited from NSObject

	/**
	 * @since 8
	 */
	static fetchAssetCollectionsContainingAssetWithTypeOptions(asset: PHAsset, type: PHAssetCollectionType, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	/**
	 * @since 8
	 * @deprecated 16
	 */
	static fetchAssetCollectionsWithALAssetGroupURLsOptions(assetGroupURLs: NSArray<NSURL> | NSURL[], options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	/**
	 * @since 8
	 */
	static fetchAssetCollectionsWithLocalIdentifiersOptions(identifiers: NSArray<string> | string[], options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	/**
	 * @since 8
	 */
	static fetchAssetCollectionsWithTypeSubtypeOptions(type: PHAssetCollectionType, subtype: PHAssetCollectionSubtype, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	/**
	 * @since 8
	 * @deprecated 13
	 */
	static fetchMomentsInMomentListOptions(momentList: PHCollectionList, options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	/**
	 * @since 8
	 * @deprecated 13
	 */
	static fetchMomentsWithOptions(options: PHFetchOptions): PHFetchResult<PHAssetCollection>;

	static new(): PHAssetCollection; // inherited from NSObject

	/**
	 * @since 8
	 */
	static transientAssetCollectionWithAssetFetchResultTitle(fetchResult: PHFetchResult<PHAsset>, title: string): PHAssetCollection;

	/**
	 * @since 8
	 */
	static transientAssetCollectionWithAssetsTitle(assets: NSArray<PHAsset> | PHAsset[], title: string): PHAssetCollection;

	/**
	 * @since 8
	 */
	readonly approximateLocation: CLLocation;

	/**
	 * @since 8
	 */
	readonly assetCollectionSubtype: PHAssetCollectionSubtype;

	/**
	 * @since 8
	 */
	readonly assetCollectionType: PHAssetCollectionType;

	/**
	 * @since 8
	 */
	readonly endDate: Date;

	/**
	 * @since 8
	 */
	readonly estimatedAssetCount: number;

	/**
	 * @since 8
	 */
	readonly localizedLocationNames: NSArray<string>;

	/**
	 * @since 8
	 */
	readonly startDate: Date;
}

/**
 * @since 8
 */
declare class PHAssetCollectionChangeRequest extends PHChangeRequest {

	static alloc(): PHAssetCollectionChangeRequest; // inherited from NSObject

	/**
	 * @since 8
	 */
	static changeRequestForAssetCollection(assetCollection: PHAssetCollection): PHAssetCollectionChangeRequest;

	/**
	 * @since 8
	 */
	static changeRequestForAssetCollectionAssets(assetCollection: PHAssetCollection, assets: PHFetchResult<PHAsset>): PHAssetCollectionChangeRequest;

	/**
	 * @since 8
	 */
	static creationRequestForAssetCollectionWithTitle(title: string): PHAssetCollectionChangeRequest;

	/**
	 * @since 8
	 */
	static deleteAssetCollections(assetCollections: NSFastEnumeration): void;

	static new(): PHAssetCollectionChangeRequest; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly placeholderForCreatedAssetCollection: PHObjectPlaceholder;

	/**
	 * @since 8
	 */
	title: string;

	/**
	 * @since 8
	 */
	addAssets(assets: NSFastEnumeration): void;

	/**
	 * @since 8
	 */
	insertAssetsAtIndexes(assets: NSFastEnumeration, indexes: NSIndexSet): void;

	/**
	 * @since 8
	 */
	moveAssetsAtIndexesToIndex(fromIndexes: NSIndexSet, toIndex: number): void;

	/**
	 * @since 8
	 */
	removeAssets(assets: NSFastEnumeration): void;

	/**
	 * @since 8
	 */
	removeAssetsAtIndexes(indexes: NSIndexSet): void;

	/**
	 * @since 8
	 */
	replaceAssetsAtIndexesWithAssets(indexes: NSIndexSet, assets: NSFastEnumeration): void;
}

/**
 * @since 8
 */
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

	SmartAlbumDepthEffect = 212,

	SmartAlbumLivePhotos = 213,

	SmartAlbumAnimated = 214,

	SmartAlbumLongExposures = 215,

	SmartAlbumUnableToUpload = 216,

	SmartAlbumRAW = 217,

	SmartAlbumCinematic = 218,

	SmartAlbumSpatial = 219,

	Any = 9223372036854775807
}

/**
 * @since 8
 */
declare const enum PHAssetCollectionType {

	Album = 1,

	SmartAlbum = 2,

	Moment = 3
}

/**
 * @since 9
 */
declare class PHAssetCreationRequest extends PHAssetChangeRequest {

	static alloc(): PHAssetCreationRequest; // inherited from NSObject

	/**
	 * @since 8
	 */
	static changeRequestForAsset(asset: PHAsset): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	/**
	 * @since 9
	 */
	static creationRequestForAsset(): PHAssetCreationRequest;

	/**
	 * @since 8
	 */
	static creationRequestForAssetFromImage(image: UIImage): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	/**
	 * @since 8
	 */
	static creationRequestForAssetFromImageAtFileURL(fileURL: NSURL): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	/**
	 * @since 8
	 */
	static creationRequestForAssetFromVideoAtFileURL(fileURL: NSURL): PHAssetCreationRequest; // inherited from PHAssetChangeRequest

	static new(): PHAssetCreationRequest; // inherited from NSObject

	/**
	 * @since 9
	 */
	static supportsAssetResourceTypes(types: NSArray<number> | number[]): boolean;

	/**
	 * @since 9
	 */
	addResourceWithTypeDataOptions(type: PHAssetResourceType, data: NSData, options: PHAssetResourceCreationOptions): void;

	/**
	 * @since 9
	 */
	addResourceWithTypeFileURLOptions(type: PHAssetResourceType, fileURL: NSURL, options: PHAssetResourceCreationOptions): void;
}

/**
 * @since 8
 */
declare const enum PHAssetEditOperation {

	Delete = 1,

	Content = 2,

	Properties = 3
}

/**
 * @since 8
 */
declare const enum PHAssetMediaSubtype {

	None = 0,

	PhotoPanorama = 1,

	PhotoHDR = 2,

	PhotoScreenshot = 4,

	PhotoLive = 8,

	PhotoDepthEffect = 16,

	SpatialMedia = 1024,

	VideoStreamed = 65536,

	VideoHighFrameRate = 131072,

	VideoTimelapse = 262144,

	VideoCinematic = 2097152
}

/**
 * @since 8
 */
declare const enum PHAssetMediaType {

	Unknown = 0,

	Image = 1,

	Video = 2,

	Audio = 3
}

/**
 * @since 11
 */
declare const enum PHAssetPlaybackStyle {

	Unsupported = 0,

	Image = 1,

	ImageAnimated = 2,

	LivePhoto = 3,

	Video = 4,

	VideoLooping = 5
}

/**
 * @since 9
 */
declare class PHAssetResource extends NSObject {

	static alloc(): PHAssetResource; // inherited from NSObject

	/**
	 * @since 9
	 */
	static assetResourcesForAsset(asset: PHAsset): NSArray<PHAssetResource>;

	/**
	 * @since 9.1
	 */
	static assetResourcesForLivePhoto(livePhoto: PHLivePhoto): NSArray<PHAssetResource>;

	static new(): PHAssetResource; // inherited from NSObject

	/**
	 * @since 9
	 */
	readonly assetLocalIdentifier: string;

	/**
	 * @since 9
	 */
	readonly originalFilename: string;

	/**
	 * @since 16
	 */
	readonly pixelHeight: number;

	/**
	 * @since 16
	 */
	readonly pixelWidth: number;

	/**
	 * @since 9
	 */
	readonly type: PHAssetResourceType;

	/**
	 * @since 9
	 */
	readonly uniformTypeIdentifier: string;
}

/**
 * @since 9
 */
declare class PHAssetResourceCreationOptions extends NSObject implements NSCopying {

	static alloc(): PHAssetResourceCreationOptions; // inherited from NSObject

	static new(): PHAssetResourceCreationOptions; // inherited from NSObject

	/**
	 * @since 9
	 */
	originalFilename: string;

	/**
	 * @since 9
	 */
	shouldMoveFile: boolean;

	/**
	 * @since 9
	 */
	uniformTypeIdentifier: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9
 */
declare class PHAssetResourceManager extends NSObject {

	static alloc(): PHAssetResourceManager; // inherited from NSObject

	/**
	 * @since 9
	 */
	static defaultManager(): PHAssetResourceManager;

	static new(): PHAssetResourceManager; // inherited from NSObject

	/**
	 * @since 9
	 */
	cancelDataRequest(requestID: number): void;

	/**
	 * @since 9
	 */
	requestDataForAssetResourceOptionsDataReceivedHandlerCompletionHandler(resource: PHAssetResource, options: PHAssetResourceRequestOptions, handler: (p1: NSData) => void, completionHandler: (p1: NSError) => void): number;

	/**
	 * @since 9
	 */
	writeDataForAssetResourceToFileOptionsCompletionHandler(resource: PHAssetResource, fileURL: NSURL, options: PHAssetResourceRequestOptions, completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 9
 */
declare class PHAssetResourceRequestOptions extends NSObject implements NSCopying {

	static alloc(): PHAssetResourceRequestOptions; // inherited from NSObject

	static new(): PHAssetResourceRequestOptions; // inherited from NSObject

	/**
	 * @since 9
	 */
	networkAccessAllowed: boolean;

	/**
	 * @since 9
	 */
	progressHandler: (p1: number) => void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9
 */
declare const enum PHAssetResourceType {

	Photo = 1,

	Video = 2,

	Audio = 3,

	AlternatePhoto = 4,

	FullSizePhoto = 5,

	FullSizeVideo = 6,

	AdjustmentData = 7,

	AdjustmentBasePhoto = 8,

	PairedVideo = 9,

	FullSizePairedVideo = 10,

	AdjustmentBasePairedVideo = 11,

	AdjustmentBaseVideo = 12,

	PhotoProxy = 19
}

/**
 * @since 9
 */
declare const enum PHAssetSourceType {

	None = 0,

	UserLibrary = 1,

	CloudShared = 2,

	iTunesSynced = 4
}

/**
 * @since 8
 */
declare const enum PHAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3,

	Limited = 4
}

/**
 * @since 8
 */
declare class PHCachingImageManager extends PHImageManager {

	static alloc(): PHCachingImageManager; // inherited from NSObject

	static new(): PHCachingImageManager; // inherited from NSObject

	/**
	 * @since 8
	 */
	allowsCachingHighQualityImages: boolean;

	/**
	 * @since 8
	 */
	startCachingImagesForAssetsTargetSizeContentModeOptions(assets: NSArray<PHAsset> | PHAsset[], targetSize: CGSize, contentMode: PHImageContentMode, options: PHImageRequestOptions): void;

	/**
	 * @since 8
	 */
	stopCachingImagesForAllAssets(): void;

	/**
	 * @since 8
	 */
	stopCachingImagesForAssetsTargetSizeContentModeOptions(assets: NSArray<PHAsset> | PHAsset[], targetSize: CGSize, contentMode: PHImageContentMode, options: PHImageRequestOptions): void;
}

/**
 * @since 8
 */
declare class PHChange extends NSObject {

	static alloc(): PHChange; // inherited from NSObject

	static new(): PHChange; // inherited from NSObject

	/**
	 * @since 8
	 */
	changeDetailsForFetchResult(object: PHFetchResult<any>): PHFetchResultChangeDetails<any>;

	/**
	 * @since 8
	 */
	changeDetailsForObject(object: PHObject): PHObjectChangeDetails<any>;
}

/**
 * @since 13
 */
declare class PHChangeRequest extends NSObject {

	static alloc(): PHChangeRequest; // inherited from NSObject

	static new(): PHChangeRequest; // inherited from NSObject
}

/**
 * @since 15
 */
declare class PHCloudIdentifier extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): PHCloudIdentifier; // inherited from NSObject

	static new(): PHCloudIdentifier; // inherited from NSObject

	/**
	 * @since 15
	 */
	readonly stringValue: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 15
	 */
	constructor(o: { stringValue: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 15
	 */
	initWithStringValue(stringValue: string): this;
}

/**
 * @since 15
 */
declare class PHCloudIdentifierMapping extends NSObject {

	static alloc(): PHCloudIdentifierMapping; // inherited from NSObject

	static new(): PHCloudIdentifierMapping; // inherited from NSObject

	/**
	 * @since 15
	 */
	readonly cloudIdentifier: PHCloudIdentifier;

	/**
	 * @since 15
	 */
	readonly error: NSError;
}

/**
 * @since 8
 */
declare class PHCollection extends PHObject {

	static alloc(): PHCollection; // inherited from NSObject

	/**
	 * @since 8
	 */
	static fetchCollectionsInCollectionListOptions(collectionList: PHCollectionList, options: PHFetchOptions): PHFetchResult<PHCollection>;

	/**
	 * @since 8
	 */
	static fetchTopLevelUserCollectionsWithOptions(options: PHFetchOptions): PHFetchResult<PHCollection>;

	static new(): PHCollection; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly canContainAssets: boolean;

	/**
	 * @since 8
	 */
	readonly canContainCollections: boolean;

	/**
	 * @since 8
	 */
	readonly localizedTitle: string;

	/**
	 * @since 8
	 */
	canPerformEditOperation(anOperation: PHCollectionEditOperation): boolean;
}

/**
 * @since 8
 */
declare const enum PHCollectionEditOperation {

	DeleteContent = 1,

	RemoveContent = 2,

	AddContent = 3,

	CreateContent = 4,

	RearrangeContent = 5,

	Delete = 6,

	Rename = 7
}

/**
 * @since 8
 */
declare class PHCollectionList extends PHCollection {

	static alloc(): PHCollectionList; // inherited from NSObject

	/**
	 * @since 8
	 */
	static fetchCollectionListsContainingCollectionOptions(collection: PHCollection, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	/**
	 * @since 8
	 */
	static fetchCollectionListsWithLocalIdentifiersOptions(identifiers: NSArray<string> | string[], options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	/**
	 * @since 8
	 */
	static fetchCollectionListsWithTypeSubtypeOptions(collectionListType: PHCollectionListType, subtype: PHCollectionListSubtype, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	/**
	 * @since 8
	 * @deprecated 13
	 */
	static fetchMomentListsWithSubtypeContainingMomentOptions(momentListSubtype: PHCollectionListSubtype, moment: PHAssetCollection, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	/**
	 * @since 8
	 * @deprecated 13
	 */
	static fetchMomentListsWithSubtypeOptions(momentListSubtype: PHCollectionListSubtype, options: PHFetchOptions): PHFetchResult<PHCollectionList>;

	static new(): PHCollectionList; // inherited from NSObject

	/**
	 * @since 8
	 */
	static transientCollectionListWithCollectionsFetchResultTitle(fetchResult: PHFetchResult<PHCollection>, title: string): PHCollectionList;

	/**
	 * @since 8
	 */
	static transientCollectionListWithCollectionsTitle(collections: NSArray<PHCollection> | PHCollection[], title: string): PHCollectionList;

	/**
	 * @since 8
	 */
	readonly collectionListSubtype: PHCollectionListSubtype;

	/**
	 * @since 8
	 */
	readonly collectionListType: PHCollectionListType;

	/**
	 * @since 8
	 */
	readonly endDate: Date;

	/**
	 * @since 8
	 */
	readonly localizedLocationNames: NSArray<string>;

	/**
	 * @since 8
	 */
	readonly startDate: Date;
}

/**
 * @since 8
 */
declare class PHCollectionListChangeRequest extends PHChangeRequest {

	static alloc(): PHCollectionListChangeRequest; // inherited from NSObject

	/**
	 * @since 8
	 */
	static changeRequestForCollectionList(collectionList: PHCollectionList): PHCollectionListChangeRequest;

	/**
	 * @since 8
	 */
	static changeRequestForCollectionListChildCollections(collectionList: PHCollectionList, childCollections: PHFetchResult<PHCollection>): PHCollectionListChangeRequest;

	/**
	 * @since 14.2
	 */
	static changeRequestForTopLevelCollectionListUserCollections(childCollections: PHFetchResult<PHCollection>): PHCollectionListChangeRequest;

	/**
	 * @since 8
	 */
	static creationRequestForCollectionListWithTitle(title: string): PHCollectionListChangeRequest;

	/**
	 * @since 8
	 */
	static deleteCollectionLists(collectionLists: NSFastEnumeration): void;

	static new(): PHCollectionListChangeRequest; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly placeholderForCreatedCollectionList: PHObjectPlaceholder;

	/**
	 * @since 8
	 */
	title: string;

	/**
	 * @since 8
	 */
	addChildCollections(collections: NSFastEnumeration): void;

	/**
	 * @since 8
	 */
	insertChildCollectionsAtIndexes(collections: NSFastEnumeration, indexes: NSIndexSet): void;

	/**
	 * @since 8
	 */
	moveChildCollectionsAtIndexesToIndex(indexes: NSIndexSet, toIndex: number): void;

	/**
	 * @since 8
	 */
	removeChildCollections(collections: NSFastEnumeration): void;

	/**
	 * @since 8
	 */
	removeChildCollectionsAtIndexes(indexes: NSIndexSet): void;

	/**
	 * @since 8
	 */
	replaceChildCollectionsAtIndexesWithChildCollections(indexes: NSIndexSet, collections: NSFastEnumeration): void;
}

/**
 * @since 8
 */
declare const enum PHCollectionListSubtype {

	MomentListCluster = 1,

	MomentListYear = 2,

	RegularFolder = 100,

	SmartFolderEvents = 200,

	SmartFolderFaces = 201,

	Any = 9223372036854775807
}

/**
 * @since 8
 */
declare const enum PHCollectionListType {

	MomentList = 1,

	Folder = 2,

	SmartFolder = 3
}

/**
 * @since 8
 */
declare class PHContentEditingInput extends NSObject {

	static alloc(): PHContentEditingInput; // inherited from NSObject

	static new(): PHContentEditingInput; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly adjustmentData: PHAdjustmentData;

	/**
	 * @since 9
	 */
	readonly audiovisualAsset: AVAsset;

	/**
	 * @since 8
	 * @deprecated 9
	 */
	readonly avAsset: AVAsset;

	/**
	 * @since 8
	 */
	readonly creationDate: Date;

	/**
	 * @since 8
	 */
	readonly displaySizeImage: UIImage;

	/**
	 * @since 8
	 */
	readonly fullSizeImageOrientation: number;

	/**
	 * @since 8
	 */
	readonly fullSizeImageURL: NSURL;

	/**
	 * @since 10
	 */
	readonly livePhoto: PHLivePhoto;

	/**
	 * @since 8
	 */
	readonly location: CLLocation;

	/**
	 * @since 8
	 */
	readonly mediaSubtypes: PHAssetMediaSubtype;

	/**
	 * @since 8
	 */
	readonly mediaType: PHAssetMediaType;

	/**
	 * @since 11
	 */
	readonly playbackStyle: PHAssetPlaybackStyle;

	/**
	 * @since 8
	 */
	readonly uniformTypeIdentifier: string;
}

/**
 * @since 8
 */
declare var PHContentEditingInputCancelledKey: string;

/**
 * @since 8
 */
declare var PHContentEditingInputErrorKey: string;

/**
 * @since 8
 */
declare class PHContentEditingInputRequestOptions extends NSObject {

	static alloc(): PHContentEditingInputRequestOptions; // inherited from NSObject

	static new(): PHContentEditingInputRequestOptions; // inherited from NSObject

	/**
	 * @since 8
	 */
	canHandleAdjustmentData: (p1: PHAdjustmentData) => boolean;

	/**
	 * @since 8
	 */
	networkAccessAllowed: boolean;

	/**
	 * @since 8
	 */
	progressHandler: (p1: number, p2: interop.Pointer | interop.Reference<boolean>) => void;
}

/**
 * @since 8
 */
declare var PHContentEditingInputResultIsInCloudKey: string;

/**
 * @since 8
 */
declare class PHContentEditingOutput extends NSObject {

	static alloc(): PHContentEditingOutput; // inherited from NSObject

	static new(): PHContentEditingOutput; // inherited from NSObject

	/**
	 * @since 8
	 */
	adjustmentData: PHAdjustmentData;

	/**
	 * @since 17
	 */
	readonly defaultRenderedContentType: UTType;

	/**
	 * @since 8
	 */
	readonly renderedContentURL: NSURL;

	/**
	 * @since 17
	 */
	readonly supportedRenderedContentTypes: NSArray<UTType>;

	/**
	 * @since 8
	 */
	constructor(o: { contentEditingInput: PHContentEditingInput; });

	/**
	 * @since 8
	 */
	constructor(o: { placeholderForCreatedAsset: PHObjectPlaceholder; });

	/**
	 * @since 8
	 */
	initWithContentEditingInput(contentEditingInput: PHContentEditingInput): this;

	/**
	 * @since 8
	 */
	initWithPlaceholderForCreatedAsset(placeholderForCreatedAsset: PHObjectPlaceholder): this;

	/**
	 * @since 17
	 */
	renderedContentURLForTypeError(type: UTType): NSURL;
}

/**
 * @since 8
 */
declare class PHFetchOptions extends NSObject implements NSCopying {

	static alloc(): PHFetchOptions; // inherited from NSObject

	static new(): PHFetchOptions; // inherited from NSObject

	/**
	 * @since 9
	 */
	fetchLimit: number;

	/**
	 * @since 8
	 */
	includeAllBurstAssets: boolean;

	/**
	 * @since 9
	 */
	includeAssetSourceTypes: PHAssetSourceType;

	/**
	 * @since 8
	 */
	includeHiddenAssets: boolean;

	/**
	 * @since 8
	 */
	predicate: NSPredicate;

	/**
	 * @since 8
	 */
	sortDescriptors: NSArray<NSSortDescriptor>;

	/**
	 * @since 8
	 */
	wantsIncrementalChangeDetails: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8
 */
declare class PHFetchResult<ObjectType> extends NSObject implements NSCopying, NSFastEnumeration {

	static alloc<ObjectType>(): PHFetchResult<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): PHFetchResult<ObjectType>; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly count: number;

	/**
	 * @since 8
	 */
	readonly firstObject: any;

	/**
	 * @since 8
	 */
	readonly lastObject: any;
	[index: number]: any;
	[Symbol.iterator](): Iterator<any>;

	/**
	 * @since 8
	 */
	containsObject(anObject: any): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 8
	 */
	countOfAssetsWithMediaType(mediaType: PHAssetMediaType): number;

	/**
	 * @since 8
	 */
	enumerateObjectsAtIndexesOptionsUsingBlock(s: NSIndexSet, opts: NSEnumerationOptions, block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 8
	 */
	enumerateObjectsUsingBlock(block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 8
	 */
	enumerateObjectsWithOptionsUsingBlock(opts: NSEnumerationOptions, block: (p1: any, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 8
	 */
	indexOfObject(anObject: any): number;

	/**
	 * @since 8
	 */
	indexOfObjectInRange(anObject: any, range: NSRange): number;

	/**
	 * @since 8
	 */
	objectAtIndex(index: number): any;

	/**
	 * @since 8
	 */
	objectAtIndexedSubscript(idx: number): any;

	/**
	 * @since 8
	 */
	objectsAtIndexes(indexes: NSIndexSet): NSArray<any>;
}

/**
 * @since 8
 */
declare class PHFetchResultChangeDetails<ObjectType> extends NSObject {

	static alloc<ObjectType>(): PHFetchResultChangeDetails<ObjectType>; // inherited from NSObject

	/**
	 * @since 8
	 */
	static changeDetailsFromFetchResultToFetchResultChangedObjects<ObjectType>(fromResult: PHFetchResult<PHObject>, toResult: PHFetchResult<PHObject>, changedObjects: NSArray<PHObject> | PHObject[]): PHFetchResultChangeDetails<ObjectType>;

	static new<ObjectType>(): PHFetchResultChangeDetails<ObjectType>; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly changedIndexes: NSIndexSet;

	/**
	 * @since 8
	 */
	readonly changedObjects: NSArray<PHObject>;

	/**
	 * @since 8
	 */
	readonly fetchResultAfterChanges: PHFetchResult<PHObject>;

	/**
	 * @since 8
	 */
	readonly fetchResultBeforeChanges: PHFetchResult<PHObject>;

	/**
	 * @since 8
	 */
	readonly hasIncrementalChanges: boolean;

	/**
	 * @since 8
	 */
	readonly hasMoves: boolean;

	/**
	 * @since 8
	 */
	readonly insertedIndexes: NSIndexSet;

	/**
	 * @since 8
	 */
	readonly insertedObjects: NSArray<PHObject>;

	/**
	 * @since 8
	 */
	readonly removedIndexes: NSIndexSet;

	/**
	 * @since 8
	 */
	readonly removedObjects: NSArray<PHObject>;

	/**
	 * @since 8
	 */
	enumerateMovesWithBlock(handler: (p1: number, p2: number) => void): void;
}

/**
 * @since 8
 */
declare var PHImageCancelledKey: string;

/**
 * @since 8
 */
declare const enum PHImageContentMode {

	AspectFit = 0,

	AspectFill = 1,

	Default = 0
}

/**
 * @since 8
 */
declare var PHImageErrorKey: string;

/**
 * @since 8
 */
declare class PHImageManager extends NSObject {

	static alloc(): PHImageManager; // inherited from NSObject

	/**
	 * @since 8
	 */
	static defaultManager(): PHImageManager;

	static new(): PHImageManager; // inherited from NSObject

	/**
	 * @since 8
	 */
	cancelImageRequest(requestID: number): void;

	/**
	 * @since 8
	 */
	requestAVAssetForVideoOptionsResultHandler(asset: PHAsset, options: PHVideoRequestOptions, resultHandler: (p1: AVAsset, p2: AVAudioMix, p3: NSDictionary<any, any>) => void): number;

	/**
	 * @since 8
	 */
	requestExportSessionForVideoOptionsExportPresetResultHandler(asset: PHAsset, options: PHVideoRequestOptions, exportPreset: string, resultHandler: (p1: AVAssetExportSession, p2: NSDictionary<any, any>) => void): number;

	/**
	 * @since 13
	 */
	requestImageDataAndOrientationForAssetOptionsResultHandler(asset: PHAsset, options: PHImageRequestOptions, resultHandler: (p1: NSData, p2: string, p3: CGImagePropertyOrientation, p4: NSDictionary<any, any>) => void): number;

	/**
	 * @since 8
	 * @deprecated 13
	 */
	requestImageDataForAssetOptionsResultHandler(asset: PHAsset, options: PHImageRequestOptions, resultHandler: (p1: NSData, p2: string, p3: UIImageOrientation, p4: NSDictionary<any, any>) => void): number;

	/**
	 * @since 8
	 */
	requestImageForAssetTargetSizeContentModeOptionsResultHandler(asset: PHAsset, targetSize: CGSize, contentMode: PHImageContentMode, options: PHImageRequestOptions, resultHandler: (p1: UIImage, p2: NSDictionary<any, any>) => void): number;

	/**
	 * @since 9.1
	 */
	requestLivePhotoForAssetTargetSizeContentModeOptionsResultHandler(asset: PHAsset, targetSize: CGSize, contentMode: PHImageContentMode, options: PHLivePhotoRequestOptions, resultHandler: (p1: PHLivePhoto, p2: NSDictionary<any, any>) => void): number;

	/**
	 * @since 8
	 */
	requestPlayerItemForVideoOptionsResultHandler(asset: PHAsset, options: PHVideoRequestOptions, resultHandler: (p1: AVPlayerItem, p2: NSDictionary<any, any>) => void): number;
}

/**
 * @since 8
 */
declare var PHImageManagerMaximumSize: CGSize;

/**
 * @since 8
 */
declare class PHImageRequestOptions extends NSObject implements NSCopying {

	static alloc(): PHImageRequestOptions; // inherited from NSObject

	static new(): PHImageRequestOptions; // inherited from NSObject

	/**
	 * @since 17
	 */
	allowSecondaryDegradedImage: boolean;

	/**
	 * @since 8
	 */
	deliveryMode: PHImageRequestOptionsDeliveryMode;

	/**
	 * @since 8
	 */
	networkAccessAllowed: boolean;

	/**
	 * @since 8
	 */
	normalizedCropRect: CGRect;

	/**
	 * @since 8
	 */
	progressHandler: (p1: number, p2: NSError, p3: interop.Pointer | interop.Reference<boolean>, p4: NSDictionary<any, any>) => void;

	/**
	 * @since 8
	 */
	resizeMode: PHImageRequestOptionsResizeMode;

	/**
	 * @since 8
	 */
	synchronous: boolean;

	/**
	 * @since 8
	 */
	version: PHImageRequestOptionsVersion;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8
 */
declare const enum PHImageRequestOptionsDeliveryMode {

	Opportunistic = 0,

	HighQualityFormat = 1,

	FastFormat = 2
}

/**
 * @since 8
 */
declare const enum PHImageRequestOptionsResizeMode {

	None = 0,

	Fast = 1,

	Exact = 2
}

/**
 * @since 8
 */
declare const enum PHImageRequestOptionsVersion {

	Current = 0,

	Unadjusted = 1,

	Original = 2
}

/**
 * @since 8
 */
declare var PHImageResultIsDegradedKey: string;

/**
 * @since 8
 */
declare var PHImageResultIsInCloudKey: string;

/**
 * @since 8
 */
declare var PHImageResultRequestIDKey: string;

/**
 * @since 9
 */
declare var PHInvalidAssetResourceDataRequestID: number;

/**
 * @since 8
 */
declare var PHInvalidImageRequestID: number;

/**
 * @since 9.1
 */
declare class PHLivePhoto extends NSObject implements NSCopying, NSItemProviderReading, NSSecureCoding {

	static alloc(): PHLivePhoto; // inherited from NSObject

	/**
	 * @since 9.1
	 */
	static cancelLivePhotoRequestWithRequestID(requestID: number): void;

	static new(): PHLivePhoto; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): PHLivePhoto;

	/**
	 * @since 9.1
	 */
	static requestLivePhotoWithResourceFileURLsPlaceholderImageTargetSizeContentModeResultHandler(fileURLs: NSArray<NSURL> | NSURL[], image: UIImage, targetSize: CGSize, contentMode: PHImageContentMode, resultHandler: (p1: PHLivePhoto, p2: NSDictionary<any, any>) => void): number;

	/**
	 * @since 9.1
	 */
	readonly size: CGSize;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

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
 * @since 10
 */
declare class PHLivePhotoEditingContext extends NSObject {

	static alloc(): PHLivePhotoEditingContext; // inherited from NSObject

	static new(): PHLivePhotoEditingContext; // inherited from NSObject

	/**
	 * @since 10
	 */
	audioVolume: number;

	/**
	 * @since 10
	 */
	readonly duration: CMTime;

	/**
	 * @since 10
	 */
	frameProcessor: (p1: PHLivePhotoFrame, p2: interop.Pointer | interop.Reference<NSError>) => CIImage;

	/**
	 * @since 10
	 */
	readonly fullSizeImage: CIImage;

	/**
	 * @since 10
	 */
	readonly orientation: CGImagePropertyOrientation;

	/**
	 * @since 10
	 */
	readonly photoTime: CMTime;

	/**
	 * @since 10
	 */
	constructor(o: { livePhotoEditingInput: PHContentEditingInput; });

	/**
	 * @since 10
	 */
	cancel(): void;

	/**
	 * @since 10
	 */
	initWithLivePhotoEditingInput(livePhotoInput: PHContentEditingInput): this;

	/**
	 * @since 10
	 */
	prepareLivePhotoForPlaybackWithTargetSizeOptionsCompletionHandler(targetSize: CGSize, options: NSDictionary<string, any>, handler: (p1: PHLivePhoto, p2: NSError) => void): void;

	/**
	 * @since 10
	 */
	saveLivePhotoToOutputOptionsCompletionHandler(output: PHContentEditingOutput, options: NSDictionary<string, any>, handler: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 10
 */
interface PHLivePhotoFrame {

	/**
	 * @since 10
	 */
	image: CIImage;

	/**
	 * @since 10
	 */
	renderScale: number;

	/**
	 * @since 10
	 */
	time: CMTime;

	/**
	 * @since 10
	 */
	type: PHLivePhotoFrameType;
}
declare var PHLivePhotoFrame: {

	prototype: PHLivePhotoFrame;
};

/**
 * @since 10
 */
declare const enum PHLivePhotoFrameType {

	Photo = 0,

	Video = 1
}

/**
 * @since 9.1
 */
declare var PHLivePhotoInfoCancelledKey: string;

/**
 * @since 9.1
 */
declare var PHLivePhotoInfoErrorKey: string;

/**
 * @since 9.1
 */
declare var PHLivePhotoInfoIsDegradedKey: string;

/**
 * @since 9.1
 */
declare var PHLivePhotoRequestIDInvalid: number;

/**
 * @since 9.1
 */
declare class PHLivePhotoRequestOptions extends NSObject implements NSCopying {

	static alloc(): PHLivePhotoRequestOptions; // inherited from NSObject

	static new(): PHLivePhotoRequestOptions; // inherited from NSObject

	/**
	 * @since 9.1
	 */
	deliveryMode: PHImageRequestOptionsDeliveryMode;

	/**
	 * @since 9.1
	 */
	networkAccessAllowed: boolean;

	/**
	 * @since 9.1
	 */
	progressHandler: (p1: number, p2: NSError, p3: interop.Pointer | interop.Reference<boolean>, p4: NSDictionary<any, any>) => void;

	/**
	 * @since 9.1
	 */
	version: PHImageRequestOptionsVersion;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11
 */
declare var PHLivePhotoShouldRenderAtPlaybackTime: string;

/**
 * @since 15
 */
declare class PHLocalIdentifierMapping extends NSObject {

	static alloc(): PHLocalIdentifierMapping; // inherited from NSObject

	static new(): PHLocalIdentifierMapping; // inherited from NSObject

	/**
	 * @since 15
	 */
	readonly error: NSError;

	/**
	 * @since 15
	 */
	readonly localIdentifier: string;
}

/**
 * @since 15
 */
declare var PHLocalIdentifiersErrorKey: string;

/**
 * @since 8
 */
declare class PHObject extends NSObject implements NSCopying {

	static alloc(): PHObject; // inherited from NSObject

	static new(): PHObject; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly localIdentifier: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8
 */
declare class PHObjectChangeDetails<ObjectType> extends NSObject {

	static alloc<ObjectType>(): PHObjectChangeDetails<ObjectType>; // inherited from NSObject

	static new<ObjectType>(): PHObjectChangeDetails<ObjectType>; // inherited from NSObject

	/**
	 * @since 8
	 */
	readonly assetContentChanged: boolean;

	/**
	 * @since 8
	 */
	readonly objectAfterChanges: PHObject;

	/**
	 * @since 8
	 */
	readonly objectBeforeChanges: PHObject;

	/**
	 * @since 8
	 */
	readonly objectWasDeleted: boolean;
}

/**
 * @since 8
 */
declare class PHObjectPlaceholder extends PHObject {

	static alloc(): PHObjectPlaceholder; // inherited from NSObject

	static new(): PHObjectPlaceholder; // inherited from NSObject
}

/**
 * @since 16
 */
declare const enum PHObjectType {

	Asset = 1,

	AssetCollection = 2,

	CollectionList = 3
}

/**
 * @since 16
 */
declare class PHPersistentChange extends NSObject {

	static alloc(): PHPersistentChange; // inherited from NSObject

	static new(): PHPersistentChange; // inherited from NSObject

	readonly changeToken: PHPersistentChangeToken;

	changeDetailsForObjectTypeError(objectType: PHObjectType): PHPersistentObjectChangeDetails;
}

/**
 * @since 16
 */
declare class PHPersistentChangeFetchResult extends NSObject {

	static alloc(): PHPersistentChangeFetchResult; // inherited from NSObject

	static new(): PHPersistentChangeFetchResult; // inherited from NSObject

	enumerateChangesWithBlock(block: (p1: PHPersistentChange, p2: interop.Pointer | interop.Reference<boolean>) => void): void;
}

/**
 * @since 16
 */
declare class PHPersistentChangeToken extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): PHPersistentChangeToken; // inherited from NSObject

	static new(): PHPersistentChangeToken; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16
 */
declare class PHPersistentObjectChangeDetails extends NSObject {

	static alloc(): PHPersistentObjectChangeDetails; // inherited from NSObject

	static new(): PHPersistentObjectChangeDetails; // inherited from NSObject

	readonly deletedLocalIdentifiers: NSSet<string>;

	readonly insertedLocalIdentifiers: NSSet<string>;

	readonly objectType: PHObjectType;

	readonly updatedLocalIdentifiers: NSSet<string>;
}

/**
 * @since 8
 */
declare class PHPhotoLibrary extends NSObject {

	static alloc(): PHPhotoLibrary; // inherited from NSObject

	/**
	 * @since 8
	 * @deprecated 100000
	 */
	static authorizationStatus(): PHAuthorizationStatus;

	/**
	 * @since 14
	 */
	static authorizationStatusForAccessLevel(accessLevel: PHAccessLevel): PHAuthorizationStatus;

	static new(): PHPhotoLibrary; // inherited from NSObject

	/**
	 * @since 8
	 * @deprecated 100000
	 */
	static requestAuthorization(handler: (p1: PHAuthorizationStatus) => void): void;

	/**
	 * @since 14
	 */
	static requestAuthorizationForAccessLevelHandler(accessLevel: PHAccessLevel, handler: (p1: PHAuthorizationStatus) => void): void;

	/**
	 * @since 8
	 */
	static sharedPhotoLibrary(): PHPhotoLibrary;

	/**
	 * @since 16
	 */
	readonly currentChangeToken: PHPersistentChangeToken;

	/**
	 * @since 13
	 */
	readonly unavailabilityReason: NSError;

	/**
	 * @since 15
	 */
	cloudIdentifierMappingsForLocalIdentifiers(localIdentifiers: NSArray<string> | string[]): NSDictionary<string, PHCloudIdentifierMapping>;

	/**
	 * @since 16
	 */
	fetchPersistentChangesSinceTokenError(token: PHPersistentChangeToken): PHPersistentChangeFetchResult;

	/**
	 * @since 15
	 */
	localIdentifierMappingsForCloudIdentifiers(cloudIdentifiers: NSArray<PHCloudIdentifier> | PHCloudIdentifier[]): NSDictionary<PHCloudIdentifier, PHLocalIdentifierMapping>;

	/**
	 * @since 8
	 */
	performChangesAndWaitError(changeBlock: () => void): boolean;

	/**
	 * @since 8
	 */
	performChangesCompletionHandler(changeBlock: () => void, completionHandler: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 14
	 */
	presentLimitedLibraryPickerFromViewController(controller: UIViewController): void;

	/**
	 * @since 15
	 */
	presentLimitedLibraryPickerFromViewControllerCompletionHandler(controller: UIViewController, completionHandler: (p1: NSArray<string>) => void): void;

	/**
	 * @since 13
	 */
	registerAvailabilityObserver(observer: PHPhotoLibraryAvailabilityObserver): void;

	/**
	 * @since 8
	 */
	registerChangeObserver(observer: PHPhotoLibraryChangeObserver): void;

	/**
	 * @since 13
	 */
	unregisterAvailabilityObserver(observer: PHPhotoLibraryAvailabilityObserver): void;

	/**
	 * @since 8
	 */
	unregisterChangeObserver(observer: PHPhotoLibraryChangeObserver): void;
}

/**
 * @since 13
 */
interface PHPhotoLibraryAvailabilityObserver extends NSObjectProtocol {

	/**
	 * @since 13
	 */
	photoLibraryDidBecomeUnavailable(photoLibrary: PHPhotoLibrary): void;
}
declare var PHPhotoLibraryAvailabilityObserver: {

	prototype: PHPhotoLibraryAvailabilityObserver;
};

/**
 * @since 8
 */
interface PHPhotoLibraryChangeObserver extends NSObjectProtocol {

	/**
	 * @since 8
	 */
	photoLibraryDidChange(changeInstance: PHChange): void;
}
declare var PHPhotoLibraryChangeObserver: {

	prototype: PHPhotoLibraryChangeObserver;
};

/**
 * @since 13
 */
declare const enum PHPhotosError {

	InternalError = -1,

	UserCancelled = 3072,

	LibraryVolumeOffline = 3114,

	RelinquishingLibraryBundleToWriter = 3142,

	SwitchingSystemPhotoLibrary = 3143,

	NetworkAccessRequired = 3164,

	NetworkError = 3169,

	IdentifierNotFound = 3201,

	MultipleIdentifiersFound = 3202,

	ChangeNotSupported = 3300,

	OperationInterrupted = 3301,

	InvalidResource = 3302,

	MissingResource = 3303,

	NotEnoughSpace = 3305,

	RequestNotSupportedForAsset = 3306,

	AccessRestricted = 3310,

	AccessUserDenied = 3311,

	LibraryInFileProviderSyncRoot = 5423,

	PersistentChangeTokenExpired = 3105,

	PersistentChangeDetailsUnavailable = 3210,

	Invalid = -1
}

/**
 * @since 13
 */
declare var PHPhotosErrorDomain: string;

/**
 * @since 8
 */
declare class PHVideoRequestOptions extends NSObject implements NSCopying {

	static alloc(): PHVideoRequestOptions; // inherited from NSObject

	static new(): PHVideoRequestOptions; // inherited from NSObject

	/**
	 * @since 8
	 */
	deliveryMode: PHVideoRequestOptionsDeliveryMode;

	/**
	 * @since 8
	 */
	networkAccessAllowed: boolean;

	/**
	 * @since 8
	 */
	progressHandler: (p1: number, p2: NSError, p3: interop.Pointer | interop.Reference<boolean>, p4: NSDictionary<any, any>) => void;

	/**
	 * @since 8
	 */
	version: PHVideoRequestOptionsVersion;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8
 */
declare const enum PHVideoRequestOptionsDeliveryMode {

	Automatic = 0,

	HighQualityFormat = 1,

	MediumQualityFormat = 2,

	FastFormat = 3
}

/**
 * @since 8
 */
declare const enum PHVideoRequestOptionsVersion {

	Current = 0,

	Original = 1
}
