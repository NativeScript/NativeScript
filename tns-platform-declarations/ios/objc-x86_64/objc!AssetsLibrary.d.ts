
declare class ALAsset extends NSObject {

	static alloc(): ALAsset; // inherited from NSObject

	static new(): ALAsset; // inherited from NSObject

	readonly editable: boolean;

	readonly originalAsset: ALAsset;

	aspectRatioThumbnail(): any;

	defaultRepresentation(): ALAssetRepresentation;

	representationForUTI(representationUTI: string): ALAssetRepresentation;

	setImageDataMetadataCompletionBlock(imageData: NSData, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	setVideoAtPathCompletionBlock(videoPathURL: NSURL, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	thumbnail(): any;

	valueForProperty(property: string): any;

	writeModifiedImageDataToSavedPhotosAlbumMetadataCompletionBlock(imageData: NSData, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	writeModifiedVideoAtPathToSavedPhotosAlbumCompletionBlock(videoPathURL: NSURL, completionBlock: (p1: NSURL, p2: NSError) => void): void;
}

declare var ALAssetLibraryDeletedAssetGroupsKey: string;

declare var ALAssetLibraryInsertedAssetGroupsKey: string;

declare var ALAssetLibraryUpdatedAssetGroupsKey: string;

declare var ALAssetLibraryUpdatedAssetsKey: string;

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

declare var ALAssetPropertyAssetURL: string;

declare var ALAssetPropertyDate: string;

declare var ALAssetPropertyDuration: string;

declare var ALAssetPropertyLocation: string;

declare var ALAssetPropertyOrientation: string;

declare var ALAssetPropertyRepresentations: string;

declare var ALAssetPropertyType: string;

declare var ALAssetPropertyURLs: string;

declare class ALAssetRepresentation extends NSObject {

	static alloc(): ALAssetRepresentation; // inherited from NSObject

	static new(): ALAssetRepresentation; // inherited from NSObject

	CGImageWithOptions(options: NSDictionary<any, any>): any;

	UTI(): string;

	dimensions(): CGSize;

	filename(): string;

	fullResolutionImage(): any;

	fullScreenImage(): any;

	getBytesFromOffsetLengthError(buffer: string | interop.Pointer | interop.Reference<any>, offset: number, length: number): number;

	metadata(): NSDictionary<any, any>;

	orientation(): ALAssetOrientation;

	scale(): number;

	size(): number;

	url(): NSURL;
}

declare var ALAssetTypePhoto: string;

declare var ALAssetTypeUnknown: string;

declare var ALAssetTypeVideo: string;

declare class ALAssetsFilter extends NSObject {

	static allAssets(): ALAssetsFilter;

	static allPhotos(): ALAssetsFilter;

	static allVideos(): ALAssetsFilter;

	static alloc(): ALAssetsFilter; // inherited from NSObject

	static new(): ALAssetsFilter; // inherited from NSObject
}

declare class ALAssetsGroup extends NSObject {

	static alloc(): ALAssetsGroup; // inherited from NSObject

	static new(): ALAssetsGroup; // inherited from NSObject

	readonly editable: boolean;

	addAsset(asset: ALAsset): boolean;

	enumerateAssetsAtIndexesOptionsUsingBlock(indexSet: NSIndexSet, options: NSEnumerationOptions, enumerationBlock: (p1: ALAsset, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateAssetsUsingBlock(enumerationBlock: (p1: ALAsset, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	enumerateAssetsWithOptionsUsingBlock(options: NSEnumerationOptions, enumerationBlock: (p1: ALAsset, p2: number, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	numberOfAssets(): number;

	posterImage(): any;

	setAssetsFilter(filter: ALAssetsFilter): void;

	valueForProperty(property: string): any;
}

declare const ALAssetsGroupAlbum: number;

declare const ALAssetsGroupAll: number;

declare const ALAssetsGroupEvent: number;

declare const ALAssetsGroupFaces: number;

declare const ALAssetsGroupLibrary: number;

declare const ALAssetsGroupPhotoStream: number;

declare var ALAssetsGroupPropertyName: string;

declare var ALAssetsGroupPropertyPersistentID: string;

declare var ALAssetsGroupPropertyType: string;

declare var ALAssetsGroupPropertyURL: string;

declare const ALAssetsGroupSavedPhotos: number;

declare class ALAssetsLibrary extends NSObject {

	static alloc(): ALAssetsLibrary; // inherited from NSObject

	static authorizationStatus(): ALAuthorizationStatus;

	static disableSharedPhotoStreamsSupport(): void;

	static new(): ALAssetsLibrary; // inherited from NSObject

	addAssetsGroupAlbumWithNameResultBlockFailureBlock(name: string, resultBlock: (p1: ALAssetsGroup) => void, failureBlock: (p1: NSError) => void): void;

	assetForURLResultBlockFailureBlock(assetURL: NSURL, resultBlock: (p1: ALAsset) => void, failureBlock: (p1: NSError) => void): void;

	enumerateGroupsWithTypesUsingBlockFailureBlock(types: number, enumerationBlock: (p1: ALAssetsGroup, p2: interop.Pointer | interop.Reference<boolean>) => void, failureBlock: (p1: NSError) => void): void;

	groupForURLResultBlockFailureBlock(groupURL: NSURL, resultBlock: (p1: ALAssetsGroup) => void, failureBlock: (p1: NSError) => void): void;

	videoAtPathIsCompatibleWithSavedPhotosAlbum(videoPathURL: NSURL): boolean;

	writeImageDataToSavedPhotosAlbumMetadataCompletionBlock(imageData: NSData, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	writeImageToSavedPhotosAlbumMetadataCompletionBlock(imageRef: any, metadata: NSDictionary<any, any>, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	writeImageToSavedPhotosAlbumOrientationCompletionBlock(imageRef: any, orientation: ALAssetOrientation, completionBlock: (p1: NSURL, p2: NSError) => void): void;

	writeVideoAtPathToSavedPhotosAlbumCompletionBlock(videoPathURL: NSURL, completionBlock: (p1: NSURL, p2: NSError) => void): void;
}

declare const ALAssetsLibraryAccessGloballyDeniedError: number;

declare const ALAssetsLibraryAccessUserDeniedError: number;

declare var ALAssetsLibraryChangedNotification: string;

declare const ALAssetsLibraryDataUnavailableError: number;

declare var ALAssetsLibraryErrorDomain: string;

declare const ALAssetsLibraryUnknownError: number;

declare const ALAssetsLibraryWriteBusyError: number;

declare const ALAssetsLibraryWriteDataEncodingError: number;

declare const ALAssetsLibraryWriteDiskSpaceError: number;

declare const ALAssetsLibraryWriteFailedError: number;

declare const ALAssetsLibraryWriteIncompatibleDataError: number;

declare const ALAssetsLibraryWriteInvalidDataError: number;

declare const enum ALAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare var ALErrorInvalidProperty: string;
