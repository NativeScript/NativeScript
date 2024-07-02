
/**
 * @since 4
 * @deprecated 9
 */
declare class ALAsset extends NSObject {

	static alloc(): ALAsset; // inherited from NSObject

	static new(): ALAsset; // inherited from NSObject

	/**
	 * @since 5
	 * @deprecated 9
	 */
	readonly editable: boolean;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	readonly originalAsset: ALAsset;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	aspectRatioThumbnail(): any;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	defaultRepresentation(): ALAssetRepresentation;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	representationForUTI(representationUTI: string): ALAssetRepresentation;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	setImageDataMetadataCompletionBlock(imageData: NSData, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	setVideoAtPathCompletionBlock(videoPathURL: NSURL, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	thumbnail(): any;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	valueForProperty(property: string): any;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	writeModifiedImageDataToSavedPhotosAlbumMetadataCompletionBlock(imageData: NSData, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	writeModifiedVideoAtPathToSavedPhotosAlbumCompletionBlock(videoPathURL: NSURL, completionBlock: (p1: NSURL, p2: NSError) => void): void;
}

/**
 * @since 6
 * @deprecated 9
 */
declare var ALAssetLibraryDeletedAssetGroupsKey: string;

/**
 * @since 6
 * @deprecated 9
 */
declare var ALAssetLibraryInsertedAssetGroupsKey: string;

/**
 * @since 6
 * @deprecated 9
 */
declare var ALAssetLibraryUpdatedAssetGroupsKey: string;

/**
 * @since 6
 * @deprecated 9
 */
declare var ALAssetLibraryUpdatedAssetsKey: string;

/**
 * @since 4
 * @deprecated 9
 */
declare const enum ALAssetOrientation {

	Up = 0,

	Down = 1,

	Left = 2,

	Right = 3,

	UpMirrored = 4,

	DownMirrored = 5,

	LeftMirrored = 6,

	RightMirrored = 7
}

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyAssetURL: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyDate: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyDuration: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyLocation: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyOrientation: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyRepresentations: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyType: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetPropertyURLs: string;

/**
 * @since 4
 * @deprecated 9
 */
declare class ALAssetRepresentation extends NSObject {

	static alloc(): ALAssetRepresentation; // inherited from NSObject

	static new(): ALAssetRepresentation; // inherited from NSObject

	/**
	 * @since 4
	 * @deprecated 9
	 */
	CGImageWithOptions(options: NSDictionary<any, any>): any;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	UTI(): string;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	dimensions(): CGSize;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	filename(): string;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	fullResolutionImage(): any;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	fullScreenImage(): any;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	getBytesFromOffsetLengthError(buffer: string | interop.Pointer | interop.Reference<any>, offset: number, length: number): number;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	metadata(): NSDictionary<any, any>;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	orientation(): ALAssetOrientation;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	scale(): number;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	size(): number;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	url(): NSURL;
}

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetTypePhoto: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetTypeUnknown: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetTypeVideo: string;

/**
 * @since 4
 * @deprecated 9
 */
declare class ALAssetsFilter extends NSObject {

	static allAssets(): ALAssetsFilter;

	static allPhotos(): ALAssetsFilter;

	static allVideos(): ALAssetsFilter;

	static alloc(): ALAssetsFilter; // inherited from NSObject

	static new(): ALAssetsFilter; // inherited from NSObject
}

/**
 * @since 4
 * @deprecated 9
 */
declare class ALAssetsGroup extends NSObject {

	static alloc(): ALAssetsGroup; // inherited from NSObject

	static new(): ALAssetsGroup; // inherited from NSObject

	/**
	 * @since 5
	 * @deprecated 9
	 */
	readonly editable: boolean;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	addAsset(asset: ALAsset): boolean;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	enumerateAssetsAtIndexesOptionsUsingBlock(indexSet: NSIndexSet, options: NSEnumerationOptions, enumerationBlock: (p1: ALAsset, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	enumerateAssetsUsingBlock(enumerationBlock: (p1: ALAsset, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	enumerateAssetsWithOptionsUsingBlock(options: NSEnumerationOptions, enumerationBlock: (p1: ALAsset, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	numberOfAssets(): number;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	posterImage(): any;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	setAssetsFilter(filter: ALAssetsFilter): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	valueForProperty(property: string): any;
}

declare const ALAssetsGroupAlbum: number;

declare const ALAssetsGroupAll: number;

declare const ALAssetsGroupEvent: number;

declare const ALAssetsGroupFaces: number;

declare const ALAssetsGroupLibrary: number;

declare const ALAssetsGroupPhotoStream: number;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetsGroupPropertyName: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetsGroupPropertyPersistentID: string;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetsGroupPropertyType: string;

/**
 * @since 5
 * @deprecated 9
 */
declare var ALAssetsGroupPropertyURL: string;

declare const ALAssetsGroupSavedPhotos: number;

/**
 * @since 4
 * @deprecated 9
 */
declare class ALAssetsLibrary extends NSObject {

	static alloc(): ALAssetsLibrary; // inherited from NSObject

	/**
	 * @since 6
	 * @deprecated 9
	 */
	static authorizationStatus(): ALAuthorizationStatus;

	/**
	 * @since 6
	 * @deprecated 9
	 */
	static disableSharedPhotoStreamsSupport(): void;

	static new(): ALAssetsLibrary; // inherited from NSObject

	/**
	 * @since 5
	 * @deprecated 9
	 */
	addAssetsGroupAlbumWithNameResultBlockFailureBlock(name: string, resultBlock: (p1: ALAssetsGroup) => void, failureBlock: (p1: NSError) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	assetForURLResultBlockFailureBlock(assetURL: NSURL, resultBlock: (p1: ALAsset) => void, failureBlock: (p1: NSError) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	enumerateGroupsWithTypesUsingBlockFailureBlock(types: number, enumerationBlock: (p1: ALAssetsGroup, p2: interop.Pointer | interop.Reference<boolean>) => void, failureBlock: (p1: NSError) => void): void;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	groupForURLResultBlockFailureBlock(groupURL: NSURL, resultBlock: (p1: ALAssetsGroup) => void, failureBlock: (p1: NSError) => void): void;

	/**
	 * @since 5
	 * @deprecated 9
	 */
	videoAtPathIsCompatibleWithSavedPhotosAlbum(videoPathURL: NSURL): boolean;

	/**
	 * @since 4.1
	 * @deprecated 9
	 */
	writeImageDataToSavedPhotosAlbumMetadataCompletionBlock(imageData: NSData, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 4.1
	 * @deprecated 9
	 */
	writeImageToSavedPhotosAlbumMetadataCompletionBlock(imageRef: any, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	writeImageToSavedPhotosAlbumOrientationCompletionBlock(imageRef: any, orientation: ALAssetOrientation, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	/**
	 * @since 4
	 * @deprecated 9
	 */
	writeVideoAtPathToSavedPhotosAlbumCompletionBlock(videoPathURL: NSURL, completionBlock: (p1: NSURL, p2: NSError) => void): void;
}

declare const ALAssetsLibraryAccessGloballyDeniedError: number;

declare const ALAssetsLibraryAccessUserDeniedError: number;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetsLibraryChangedNotification: string;

declare const ALAssetsLibraryDataUnavailableError: number;

/**
 * @since 4
 * @deprecated 9
 */
declare var ALAssetsLibraryErrorDomain: string;

declare const ALAssetsLibraryUnknownError: number;

declare const ALAssetsLibraryWriteBusyError: number;

declare const ALAssetsLibraryWriteDataEncodingError: number;

declare const ALAssetsLibraryWriteDiskSpaceError: number;

declare const ALAssetsLibraryWriteFailedError: number;

declare const ALAssetsLibraryWriteIncompatibleDataError: number;

declare const ALAssetsLibraryWriteInvalidDataError: number;

/**
 * @since 6
 * @deprecated 9
 */
declare const enum ALAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

/**
 * @since 4
 * @deprecated 9
 */
declare var ALErrorInvalidProperty: string;
