
/**
 * @since 8
 */
interface PHContentEditingController extends NSObjectProtocol {

	/**
	 * @since 8
	 */
	shouldShowCancelConfirmation: boolean;

	/**
	 * @since 8
	 */
	canHandleAdjustmentData(adjustmentData: PHAdjustmentData): boolean;

	/**
	 * @since 8
	 */
	cancelContentEditing(): void;

	/**
	 * @since 8
	 */
	finishContentEditingWithCompletionHandler(completionHandler: (p1: PHContentEditingOutput | null) => void): void;

	/**
	 * @since 8
	 */
	startContentEditingWithInputPlaceholderImage(contentEditingInput: PHContentEditingInput, placeholderImage: UIImage): void;
}
declare var PHContentEditingController: {

	prototype: PHContentEditingController;
};

/**
 * @since 9.1
 */
declare const enum PHLivePhotoBadgeOptions {

	OverContent = 1,

	LiveOff = 2
}

/**
 * @since 9.1
 */
declare class PHLivePhotoView extends UIView {

	static alloc(): PHLivePhotoView; // inherited from NSObject

	static appearance(): PHLivePhotoView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): PHLivePhotoView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject | null): PHLivePhotoView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PHLivePhotoView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject | null): PHLivePhotoView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): PHLivePhotoView; // inherited from UIAppearance

	/**
	 * @since 9.1
	 */
	static livePhotoBadgeImageWithOptions(badgeOptions: PHLivePhotoBadgeOptions): UIImage;

	static new(): PHLivePhotoView; // inherited from NSObject

	/**
	 * @since 17
	 */
	contentsRect: CGRect;

	/**
	 * @since 9.1
	 */
	delegate: PHLivePhotoViewDelegate | null;

	/**
	 * @since 9.1
	 */
	livePhoto: PHLivePhoto | null;

	/**
	 * @since 9.1
	 */
	muted: boolean;

	/**
	 * @since 9.1
	 */
	readonly playbackGestureRecognizer: UIGestureRecognizer;

	/**
	 * @since 9.1
	 */
	startPlaybackWithStyle(playbackStyle: PHLivePhotoViewPlaybackStyle): void;

	/**
	 * @since 9.1
	 */
	stopPlayback(): void;
}

/**
 * @since 9.1
 */
interface PHLivePhotoViewDelegate extends NSObjectProtocol {

	/**
	 * @since 9.1
	 */
	livePhotoViewCanBeginPlaybackWithStyle?(livePhotoView: PHLivePhotoView, playbackStyle: PHLivePhotoViewPlaybackStyle): boolean;

	/**
	 * @since 9.1
	 */
	livePhotoViewDidEndPlaybackWithStyle?(livePhotoView: PHLivePhotoView, playbackStyle: PHLivePhotoViewPlaybackStyle): void;

	/**
	 * @since 9.1
	 */
	livePhotoViewExtraMinimumTouchDurationForTouchWithStyle?(livePhotoView: PHLivePhotoView, touch: UITouch, playbackStyle: PHLivePhotoViewPlaybackStyle): number;

	/**
	 * @since 9.1
	 */
	livePhotoViewWillBeginPlaybackWithStyle?(livePhotoView: PHLivePhotoView, playbackStyle: PHLivePhotoViewPlaybackStyle): void;
}
declare var PHLivePhotoViewDelegate: {

	prototype: PHLivePhotoViewDelegate;
};

/**
 * @since 9.1
 */
declare const enum PHLivePhotoViewPlaybackStyle {

	Undefined = 0,

	Full = 1,

	Hint = 2
}

/**
 * @since 17
 */
declare const enum PHPickerCapabilities {

	None = 0,

	Search = 1,

	StagingArea = 2,

	CollectionNavigation = 4,

	SelectionActions = 8,

	SensitivityAnalysisIntervention = 16
}

/**
 * @since 14
 */
declare class PHPickerConfiguration extends NSObject implements NSCopying {

	static alloc(): PHPickerConfiguration; // inherited from NSObject

	static new(): PHPickerConfiguration; // inherited from NSObject

	/**
	 * @since 17
	 */
	disabledCapabilities: PHPickerCapabilities;

	/**
	 * @since 17
	 */
	edgesWithoutContentMargins: NSDirectionalRectEdge;

	/**
	 * @since 14
	 */
	filter: PHPickerFilter | null;

	/**
	 * @since 27
	 */
	metadataOptions: PHPickerMetadataOptions;

	/**
	 * @since 17
	 */
	mode: PHPickerMode;

	/**
	 * @since 14
	 */
	preferredAssetRepresentationMode: PHPickerConfigurationAssetRepresentationMode;

	/**
	 * @since 15
	 */
	preselectedAssetIdentifiers: NSArray<string>;

	/**
	 * @since 27
	 */
	searchText: PHPickerSearchText | null;

	/**
	 * @since 15
	 */
	selection: PHPickerConfigurationSelection;

	/**
	 * @since 14
	 */
	selectionLimit: number;

	/**
	 * @since 14
	 */
	constructor(o: { photoLibrary: PHPhotoLibrary; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	/**
	 * @since 14
	 */
	initWithPhotoLibrary(photoLibrary: PHPhotoLibrary): this;
}

/**
 * @since 14
 */
declare const enum PHPickerConfigurationAssetRepresentationMode {

	Automatic = 0,

	Current = 1,

	Compatible = 2
}

/**
 * @since 15
 */
declare const enum PHPickerConfigurationSelection {

	Default = 0,

	Ordered = 1,

	Continuous = 2,

	ContinuousAndOrdered = 3
}

/**
 * @since 14
 */
declare class PHPickerFilter extends NSObject implements NSCopying {

	/**
	 * @since 15
	 */
	static allFilterMatchingSubfilters(subfilters: NSArray<PHPickerFilter> | PHPickerFilter[]): PHPickerFilter;

	static alloc(): PHPickerFilter; // inherited from NSObject

	/**
	 * @since 14
	 */
	static anyFilterMatchingSubfilters(subfilters: NSArray<PHPickerFilter> | PHPickerFilter[]): PHPickerFilter;

	static new(): PHPickerFilter; // inherited from NSObject

	/**
	 * @since 15
	 */
	static notFilterOfSubfilter(subfilter: PHPickerFilter): PHPickerFilter;

	/**
	 * @since 15
	 */
	static playbackStyleFilter(playbackStyle: PHAssetPlaybackStyle): PHPickerFilter;

	/**
	 * @since 16
	 */
	static readonly burstsFilter: PHPickerFilter;

	/**
	 * @since 16
	 */
	static readonly cinematicVideosFilter: PHPickerFilter;

	/**
	 * @since 16
	 */
	static readonly depthEffectPhotosFilter: PHPickerFilter;

	/**
	 * @since 14
	 */
	static readonly imagesFilter: PHPickerFilter;

	/**
	 * @since 14
	 */
	static readonly livePhotosFilter: PHPickerFilter;

	/**
	 * @since 15
	 */
	static readonly panoramasFilter: PHPickerFilter;

	/**
	 * @since 15
	 */
	static readonly screenRecordingsFilter: PHPickerFilter;

	/**
	 * @since 15
	 */
	static readonly screenshotsFilter: PHPickerFilter;

	/**
	 * @since 15
	 */
	static readonly slomoVideosFilter: PHPickerFilter;

	/**
	 * @since 18
	 */
	static readonly spatialMediaFilter: PHPickerFilter;

	/**
	 * @since 15
	 */
	static readonly timelapseVideosFilter: PHPickerFilter;

	/**
	 * @since 14
	 */
	static readonly videosFilter: PHPickerFilter;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 27
 */
declare const enum PHPickerMetadataOptions {

	None = 0,

	RemoveLocation = 1,

	RemoveCaptions = 2
}

/**
 * @since 17
 */
declare const enum PHPickerMode {

	Default = 0,

	Compact = 1
}

/**
 * @since 14
 */
declare class PHPickerResult extends NSObject {

	static alloc(): PHPickerResult; // inherited from NSObject

	static new(): PHPickerResult; // inherited from NSObject

	/**
	 * @since 14
	 */
	readonly assetIdentifier: string | null;

	/**
	 * @since 14
	 */
	readonly itemProvider: NSItemProvider;
}

/**
 * @since 27
 */
declare class PHPickerSearchText extends NSObject implements NSCopying {

	static alloc(): PHPickerSearchText; // inherited from NSObject

	static new(): PHPickerSearchText; // inherited from NSObject

	/**
	 * @since 27
	 */
	constructor(o: { photoSearchSuggestion: UIPhotoSearchSuggestion; });

	/**
	 * @since 27
	 */
	constructor(o: { string: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	/**
	 * @since 27
	 */
	initWithPhotoSearchSuggestion(suggestion: UIPhotoSearchSuggestion): this;

	/**
	 * @since 27
	 */
	initWithString(string: string): this;
}

/**
 * @since 17
 */
declare class PHPickerUpdateConfiguration extends NSObject implements NSCopying {

	static alloc(): PHPickerUpdateConfiguration; // inherited from NSObject

	static new(): PHPickerUpdateConfiguration; // inherited from NSObject

	/**
	 * @since 17
	 */
	edgesWithoutContentMargins: NSDirectionalRectEdge;

	/**
	 * @since 27
	 */
	searchText: PHPickerSearchText | null;

	/**
	 * @since 17
	 */
	selectionLimit: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;
}

/**
 * @since 14
 */
declare class PHPickerViewController extends UIViewController {

	static alloc(): PHPickerViewController; // inherited from NSObject

	static new(): PHPickerViewController; // inherited from NSObject

	/**
	 * @since 14
	 */
	readonly configuration: PHPickerConfiguration;

	/**
	 * @since 14
	 */
	delegate: PHPickerViewControllerDelegate | null;

	/**
	 * @since 14
	 */
	constructor(o: { configuration: PHPickerConfiguration; });

	/**
	 * @since 16
	 */
	deselectAssetsWithIdentifiers(identifiers: NSArray<string> | string[]): void;

	/**
	 * @since 14
	 */
	initWithConfiguration(configuration: PHPickerConfiguration): this;

	/**
	 * @since 16
	 */
	moveAssetWithIdentifierAfterAssetWithIdentifier(identifier: string, afterIdentifier: string | null): void;

	/**
	 * @since 17
	 */
	scrollToInitialPosition(): void;

	/**
	 * @since 17
	 */
	updatePickerUsingConfiguration(configuration: PHPickerUpdateConfiguration): void;

	/**
	 * @since 17
	 */
	zoomIn(): void;

	/**
	 * @since 17
	 */
	zoomOut(): void;
}

/**
 * @since 14
 */
interface PHPickerViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 14
	 */
	pickerDidFinishPicking(picker: PHPickerViewController, results: NSArray<PHPickerResult> | PHPickerResult[]): void;
}
declare var PHPickerViewControllerDelegate: {

	prototype: PHPickerViewControllerDelegate;
};

/**
 * @since 27
 */
declare class PHSharedAlbumCreationConfiguration extends NSObject {

	static alloc(): PHSharedAlbumCreationConfiguration; // inherited from NSObject

	static new(): PHSharedAlbumCreationConfiguration; // inherited from NSObject

	/**
	 * @since 27
	 */
	defaultPolicy: PHSharedAlbumCreationSharingPolicy;

	/**
	 * @since 27
	 */
	defaultTitle: string | null;

	/**
	 * @since 27
	 */
	readonly photoLibrary: PHPhotoLibrary;

	/**
	 * @since 27
	 */
	constructor(o: { photoLibrary: PHPhotoLibrary; });

	/**
	 * @since 27
	 */
	initWithPhotoLibrary(photoLibrary: PHPhotoLibrary): this;
}

/**
 * @since 27
 */
declare class PHSharedAlbumCreationResult extends NSObject {

	static alloc(): PHSharedAlbumCreationResult; // inherited from NSObject

	static new(): PHSharedAlbumCreationResult; // inherited from NSObject

	/**
	 * @since 27
	 */
	readonly albumIdentifier: string;

	/**
	 * @since 27
	 */
	readonly albumURL: NSURL;
}

/**
 * @since 27
 */
declare const enum PHSharedAlbumCreationSharingPolicy {

	Private = 0,

	Public = 1
}

/**
 * @since 27
 */
declare class PHSharedAlbumCreationViewController extends UIViewController {

	static alloc(): PHSharedAlbumCreationViewController; // inherited from NSObject

	static new(): PHSharedAlbumCreationViewController; // inherited from NSObject

	/**
	 * @since 27
	 */
	readonly creationResult: PHSharedAlbumCreationResult | null;

	/**
	 * @since 27
	 */
	delegate: PHSharedAlbumCreationViewControllerDelegate | null;

	/**
	 * @since 27
	 */
	constructor(o: { configuration: PHSharedAlbumCreationConfiguration; });

	/**
	 * @since 27
	 */
	initWithConfiguration(configuration: PHSharedAlbumCreationConfiguration): this;
}

/**
 * @since 27
 */
interface PHSharedAlbumCreationViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 27
	 */
	sharedAlbumCreationViewControllerDidCompleteWithError(creationViewController: PHSharedAlbumCreationViewController, error: NSError | null): void;
}
declare var PHSharedAlbumCreationViewControllerDelegate: {

	prototype: PHSharedAlbumCreationViewControllerDelegate;
};

/**
 * @since 27
 */
declare class PHSharedAlbumCustomizationViewController extends UIViewController {

	static alloc(): PHSharedAlbumCustomizationViewController; // inherited from NSObject

	static new(): PHSharedAlbumCustomizationViewController; // inherited from NSObject

	/**
	 * @since 27
	 */
	readonly albumIdentifier: string;

	/**
	 * @since 27
	 */
	delegate: PHSharedAlbumCustomizationViewControllerDelegate | null;

	/**
	 * @since 27
	 */
	constructor(o: { albumIdentifier: string; photoLibrary: PHPhotoLibrary; });

	/**
	 * @since 27
	 */
	initWithAlbumIdentifierPhotoLibrary(albumIdentifier: string, photoLibrary: PHPhotoLibrary): this;
}

/**
 * @since 27
 */
interface PHSharedAlbumCustomizationViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 27
	 */
	sharedAlbumCustomizationViewControllerDidCompleteWithError(customizationViewController: PHSharedAlbumCustomizationViewController, error: NSError | null): void;
}
declare var PHSharedAlbumCustomizationViewControllerDelegate: {

	prototype: PHSharedAlbumCustomizationViewControllerDelegate;
};

/**
 * @since 27
 */
declare class PHSharedAlbumPostingViewController extends UIViewController {

	static alloc(): PHSharedAlbumPostingViewController; // inherited from NSObject

	static new(): PHSharedAlbumPostingViewController; // inherited from NSObject

	/**
	 * @since 27
	 */
	readonly albumIdentifier: string | null;

	/**
	 * @since 27
	 */
	delegate: PHSharedAlbumPostingViewControllerDelegate | null;

	/**
	 * @since 27
	 */
	constructor(o: { items: NSArray<PHPickerResult> | PHPickerResult[]; defaultAlbumIdentifier: string | null; photoLibrary: PHPhotoLibrary; });

	/**
	 * @since 27
	 */
	initWithItemsDefaultAlbumIdentifierPhotoLibrary(items: NSArray<PHPickerResult> | PHPickerResult[], defaultAlbumIdentifier: string | null, photoLibrary: PHPhotoLibrary): this;
}

/**
 * @since 27
 */
interface PHSharedAlbumPostingViewControllerDelegate extends NSObjectProtocol {

	/**
	 * @since 27
	 */
	sharedAlbumPostingViewControllerDidCompleteWithError(postingViewController: PHSharedAlbumPostingViewController, error: NSError | null): void;
}
declare var PHSharedAlbumPostingViewControllerDelegate: {

	prototype: PHSharedAlbumPostingViewControllerDelegate;
};
