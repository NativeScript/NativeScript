
/**
 * @since 11.0
 * @deprecated 100000
 */
declare class AVAggregateAssetDownloadTask extends NSURLSessionTask {

	static alloc(): AVAggregateAssetDownloadTask; // inherited from NSObject

	static new(): AVAggregateAssetDownloadTask; // inherited from NSObject

	readonly URLAsset: AVURLAsset;
}

/**
 * @since 4.0
 */
declare class AVAsset extends NSObject implements AVAsynchronousKeyValueLoading, NSCopying {

	static alloc(): AVAsset; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVAsset;

	static new(): AVAsset; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly allMediaSelections: NSArray<AVMediaSelection>;

	/**
	 * @since 4.3
	 */
	readonly availableChapterLocales: NSArray<NSLocale>;

	/**
	 * @since 5.0
	 */
	readonly availableMediaCharacteristicsWithMediaSelectionOptions: NSArray<string>;

	readonly availableMetadataFormats: NSArray<string>;

	/**
	 * @since 9.0
	 */
	readonly canContainFragments: boolean;

	readonly commonMetadata: NSArray<AVMetadataItem>;

	/**
	 * @since 9.0
	 */
	readonly compatibleWithAirPlayVideo: boolean;

	/**
	 * @since 5.0
	 */
	readonly compatibleWithSavedPhotosAlbum: boolean;

	/**
	 * @since 4.3
	 */
	readonly composable: boolean;

	/**
	 * @since 9.0
	 */
	readonly containsFragments: boolean;

	/**
	 * @since 5.0
	 */
	readonly creationDate: AVMetadataItem;

	readonly duration: CMTime;

	/**
	 * @since 4.3
	 */
	readonly exportable: boolean;

	/**
	 * @since 4.2
	 */
	readonly hasProtectedContent: boolean;

	readonly lyrics: string;

	/**
	 * @since 8.0
	 */
	readonly metadata: NSArray<AVMetadataItem>;

	/**
	 * @since 13.0
	 */
	readonly minimumTimeOffsetFromLive: CMTime;

	/**
	 * @since 4.0
	 * @deprecated 5.0
	 */
	readonly naturalSize: CGSize;

	/**
	 * @since 10.2
	 */
	readonly overallDurationHint: CMTime;

	/**
	 * @since 4.3
	 */
	readonly playable: boolean;

	/**
	 * @since 9.0
	 */
	readonly preferredMediaSelection: AVMediaSelection;

	readonly preferredRate: number;

	readonly preferredTransform: CGAffineTransform;

	readonly preferredVolume: number;

	readonly providesPreciseDurationAndTiming: boolean;

	/**
	 * @since 4.3
	 */
	readonly readable: boolean;

	/**
	 * @since 5.0
	 */
	readonly referenceRestrictions: AVAssetReferenceRestrictions;

	/**
	 * @since 7.0
	 */
	readonly trackGroups: NSArray<AVAssetTrackGroup>;

	readonly tracks: NSArray<AVAssetTrack>;

	cancelLoading(): void;

	/**
	 * @since 6.0
	 * @deprecated 18.0
	 */
	chapterMetadataGroupsBestMatchingPreferredLanguages(preferredLanguages: NSArray<string> | string[]): NSArray<AVTimedMetadataGroup>;

	/**
	 * @since 4.3
	 * @deprecated 18.0
	 */
	chapterMetadataGroupsWithTitleLocaleContainingItemsWithCommonKeys(locale: NSLocale, commonKeys: NSArray<string> | string[]): NSArray<AVTimedMetadataGroup>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 15.0
	 */
	findUnusedTrackIDWithCompletionHandler(completionHandler: (p1: number, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadChapterMetadataGroupsBestMatchingPreferredLanguagesCompletionHandler(preferredLanguages: NSArray<string> | string[], completionHandler: (p1: NSArray<AVTimedMetadataGroup>, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadChapterMetadataGroupsWithTitleLocaleContainingItemsWithCommonKeysCompletionHandler(locale: NSLocale, commonKeys: NSArray<string> | string[], completionHandler: (p1: NSArray<AVTimedMetadataGroup>, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadMediaSelectionGroupForMediaCharacteristicCompletionHandler(mediaCharacteristic: string, completionHandler: (p1: AVMediaSelectionGroup, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadMetadataForFormatCompletionHandler(format: string, completionHandler: (p1: NSArray<AVMetadataItem>, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadTrackWithTrackIDCompletionHandler(trackID: number, completionHandler: (p1: AVAssetTrack, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadTracksWithMediaCharacteristicCompletionHandler(mediaCharacteristic: string, completionHandler: (p1: NSArray<AVAssetTrack>, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadTracksWithMediaTypeCompletionHandler(mediaType: string, completionHandler: (p1: NSArray<AVAssetTrack>, p2: NSError) => void): void;

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string> | string[], handler: () => void): void;

	/**
	 * @since 5.0
	 * @deprecated 18.0
	 */
	mediaSelectionGroupForMediaCharacteristic(mediaCharacteristic: string): AVMediaSelectionGroup;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	metadataForFormat(format: string): NSArray<AVMetadataItem>;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	trackWithTrackID(trackID: number): AVAssetTrack;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	tracksWithMediaCharacteristic(mediaCharacteristic: string): NSArray<AVAssetTrack>;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	tracksWithMediaType(mediaType: string): NSArray<AVAssetTrack>;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	unusedTrackID(): number;
}

/**
 * @since 10.0
 */
declare class AVAssetCache extends NSObject {

	static alloc(): AVAssetCache; // inherited from NSObject

	static new(): AVAssetCache; // inherited from NSObject

	readonly playableOffline: boolean;

	mediaSelectionOptionsInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): NSArray<AVMediaSelectionOption>;
}

/**
 * @since 9.0
 */
declare var AVAssetChapterMetadataGroupsDidChangeNotification: string;

/**
 * @since 12.0
 */
declare var AVAssetContainsFragmentsDidChangeNotification: string;

/**
 * @since 15.0
 */
declare class AVAssetDownloadConfiguration extends NSObject {

	static alloc(): AVAssetDownloadConfiguration; // inherited from NSObject

	static downloadConfigurationWithAssetTitle(asset: AVURLAsset, title: string): AVAssetDownloadConfiguration;

	static new(): AVAssetDownloadConfiguration; // inherited from NSObject

	artworkData: NSData;

	auxiliaryContentConfigurations: NSArray<AVAssetDownloadContentConfiguration>;

	optimizesAuxiliaryContentConfigurations: boolean;

	readonly primaryContentConfiguration: AVAssetDownloadContentConfiguration;
}

/**
 * @since 15.0
 */
declare class AVAssetDownloadContentConfiguration extends NSObject implements NSCopying {

	static alloc(): AVAssetDownloadContentConfiguration; // inherited from NSObject

	static new(): AVAssetDownloadContentConfiguration; // inherited from NSObject

	mediaSelections: NSArray<AVMediaSelection>;

	variantQualifiers: NSArray<AVAssetVariantQualifier>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 9.0
 */
interface AVAssetDownloadDelegate extends NSURLSessionTaskDelegate {

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	URLSessionAggregateAssetDownloadTaskDidCompleteForMediaSelection?(session: NSURLSession, aggregateAssetDownloadTask: AVAggregateAssetDownloadTask, mediaSelection: AVMediaSelection): void;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	URLSessionAggregateAssetDownloadTaskDidLoadTimeRangeTotalTimeRangesLoadedTimeRangeExpectedToLoadForMediaSelection?(session: NSURLSession, aggregateAssetDownloadTask: AVAggregateAssetDownloadTask, timeRange: CMTimeRange, loadedTimeRanges: NSArray<NSValue> | NSValue[], timeRangeExpectedToLoad: CMTimeRange, mediaSelection: AVMediaSelection): void;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	URLSessionAggregateAssetDownloadTaskWillDownloadToURL?(session: NSURLSession, aggregateAssetDownloadTask: AVAggregateAssetDownloadTask, location: NSURL): void;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	URLSessionAssetDownloadTaskDidFinishDownloadingToURL?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, location: NSURL): void;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	URLSessionAssetDownloadTaskDidLoadTimeRangeTotalTimeRangesLoadedTimeRangeExpectedToLoad?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, timeRange: CMTimeRange, loadedTimeRanges: NSArray<NSValue> | NSValue[], timeRangeExpectedToLoad: CMTimeRange): void;

	/**
	 * @since 9.0
	 */
	URLSessionAssetDownloadTaskDidResolveMediaSelection?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, resolvedMediaSelection: AVMediaSelection): void;

	/**
	 * @since 18.0
	 */
	URLSessionAssetDownloadTaskWillDownloadToURL?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, location: NSURL): void;

	/**
	 * @since 15.0
	 */
	URLSessionAssetDownloadTaskWillDownloadVariants?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, variants: NSArray<AVAssetVariant> | AVAssetVariant[]): void;
}
declare var AVAssetDownloadDelegate: {

	prototype: AVAssetDownloadDelegate;
};

/**
 * @since 11.0
 */
declare class AVAssetDownloadStorageManagementPolicy extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAssetDownloadStorageManagementPolicy; // inherited from NSObject

	static new(): AVAssetDownloadStorageManagementPolicy; // inherited from NSObject

	readonly expirationDate: Date;

	readonly priority: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 11.0
 */
declare class AVAssetDownloadStorageManager extends NSObject {

	static alloc(): AVAssetDownloadStorageManager; // inherited from NSObject

	static new(): AVAssetDownloadStorageManager; // inherited from NSObject

	static sharedDownloadStorageManager(): AVAssetDownloadStorageManager;

	setStorageManagementPolicyForURL(storageManagementPolicy: AVAssetDownloadStorageManagementPolicy, downloadStorageURL: NSURL): void;

	storageManagementPolicyForURL(downloadStorageURL: NSURL): AVAssetDownloadStorageManagementPolicy;
}

/**
 * @since 9.0
 */
declare class AVAssetDownloadTask extends NSURLSessionTask {

	static alloc(): AVAssetDownloadTask; // inherited from NSObject

	static new(): AVAssetDownloadTask; // inherited from NSObject

	readonly URLAsset: AVURLAsset;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	readonly destinationURL: NSURL;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	readonly loadedTimeRanges: NSArray<NSValue>;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	readonly options: NSDictionary<string, any>;
}

/**
 * @since 9.0
 * @deprecated 100000
 */
declare var AVAssetDownloadTaskMediaSelectionKey: string;

/**
 * @since 13.0
 * @deprecated 100000
 */
declare var AVAssetDownloadTaskMediaSelectionPrefersMultichannelKey: string;

/**
 * @since 9.0
 * @deprecated 100000
 */
declare var AVAssetDownloadTaskMinimumRequiredMediaBitrateKey: string;

/**
 * @since 14.0
 * @deprecated 100000
 */
declare var AVAssetDownloadTaskMinimumRequiredPresentationSizeKey: string;

/**
 * @since 14.0
 * @deprecated 100000
 */
declare var AVAssetDownloadTaskPrefersHDRKey: string;

/**
 * @since 14.5
 * @deprecated 100000
 */
declare var AVAssetDownloadTaskPrefersLosslessAudioKey: string;

/**
 * @since 9.0
 */
declare class AVAssetDownloadURLSession extends NSURLSession {

	static alloc(): AVAssetDownloadURLSession; // inherited from NSObject

	static new(): AVAssetDownloadURLSession; // inherited from NSObject

	static sessionWithConfigurationAssetDownloadDelegateDelegateQueue(configuration: NSURLSessionConfiguration, delegate: AVAssetDownloadDelegate, delegateQueue: NSOperationQueue): AVAssetDownloadURLSession;

	/**
	 * @since 11.0
	 * @deprecated 100000
	 */
	aggregateAssetDownloadTaskWithURLAssetMediaSelectionsAssetTitleAssetArtworkDataOptions(URLAsset: AVURLAsset, mediaSelections: NSArray<AVMediaSelection> | AVMediaSelection[], title: string, artworkData: NSData, options: NSDictionary<string, any>): AVAggregateAssetDownloadTask;

	/**
	 * @since 15.0
	 */
	assetDownloadTaskWithConfiguration(downloadConfiguration: AVAssetDownloadConfiguration): AVAssetDownloadTask;

	/**
	 * @since 10.0
	 * @deprecated 100000
	 */
	assetDownloadTaskWithURLAssetAssetTitleAssetArtworkDataOptions(URLAsset: AVURLAsset, title: string, artworkData: NSData, options: NSDictionary<string, any>): AVAssetDownloadTask;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	assetDownloadTaskWithURLAssetDestinationURLOptions(URLAsset: AVURLAsset, destinationURL: NSURL, options: NSDictionary<string, any>): AVAssetDownloadTask;
}

/**
 * @since 11.0
 */
declare var AVAssetDownloadedAssetEvictionPriorityDefault: string;

/**
 * @since 11.0
 */
declare var AVAssetDownloadedAssetEvictionPriorityImportant: string;

/**
 * @since 9.0
 */
declare var AVAssetDurationDidChangeNotification: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPreset1280x720: string;

/**
 * @since 5.0
 */
declare var AVAssetExportPreset1920x1080: string;

/**
 * @since 9.0
 */
declare var AVAssetExportPreset3840x2160: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPreset640x480: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPreset960x540: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPresetAppleM4A: string;

/**
 * @since 15.0
 */
declare var AVAssetExportPresetAppleProRes422LPCM: string;

/**
 * @since 15.0
 */
declare var AVAssetExportPresetAppleProRes4444LPCM: string;

/**
 * @since 11.0
 */
declare var AVAssetExportPresetHEVC1920x1080: string;

/**
 * @since 13.0
 */
declare var AVAssetExportPresetHEVC1920x1080WithAlpha: string;

/**
 * @since 11.0
 */
declare var AVAssetExportPresetHEVC3840x2160: string;

/**
 * @since 13.0
 */
declare var AVAssetExportPresetHEVC3840x2160WithAlpha: string;

/**
 * @since 11.0
 */
declare var AVAssetExportPresetHEVCHighestQuality: string;

/**
 * @since 13.0
 */
declare var AVAssetExportPresetHEVCHighestQualityWithAlpha: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPresetHighestQuality: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPresetLowQuality: string;

/**
 * @since 17.0
 */
declare var AVAssetExportPresetMVHEVC1440x1440: string;

/**
 * @since 17.0
 */
declare var AVAssetExportPresetMVHEVC960x960: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPresetMediumQuality: string;

/**
 * @since 4.0
 */
declare var AVAssetExportPresetPassthrough: string;

/**
 * @since 4.0
 */
declare class AVAssetExportSession extends NSObject {

	static allExportPresets(): NSArray<string>;

	static alloc(): AVAssetExportSession; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static determineCompatibilityOfExportPresetWithAssetOutputFileTypeCompletionHandler(presetName: string, asset: AVAsset, outputFileType: string, handler: (p1: boolean) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 16.0
	 */
	static exportPresetsCompatibleWithAsset(asset: AVAsset): NSArray<string>;

	/**
	 * @since 4.1
	 */
	static exportSessionWithAssetPresetName(asset: AVAsset, presetName: string): AVAssetExportSession;

	static new(): AVAssetExportSession; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	readonly asset: AVAsset;

	audioMix: AVAudioMix;

	/**
	 * @since 7.0
	 */
	audioTimePitchAlgorithm: string;

	/**
	 * @since 16.0
	 */
	audioTrackGroupHandling: AVAssetTrackGroupOutputHandling;

	/**
	 * @since 8.0
	 */
	canPerformMultiplePassesOverSourceMediaData: boolean;

	/**
	 * @since 7.0
	 */
	readonly customVideoCompositor: AVVideoCompositing;

	/**
	 * @since 8.0
	 */
	directoryForTemporaryFiles: NSURL;

	readonly error: NSError;

	/**
	 * @since 5.0
	 * @deprecated 18.0
	 */
	readonly estimatedOutputFileLength: number;

	/**
	 * @since 4.0
	 */
	fileLengthLimit: number;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	readonly maxDuration: CMTime;

	metadata: NSArray<AVMetadataItem>;

	/**
	 * @since 7.0
	 */
	metadataItemFilter: AVMetadataItemFilter;

	outputFileType: string;

	outputURL: NSURL;

	readonly presetName: string;

	readonly progress: number;

	shouldOptimizeForNetworkUse: boolean;

	readonly status: AVAssetExportSessionStatus;

	readonly supportedFileTypes: NSArray<string>;

	timeRange: CMTimeRange;

	videoComposition: AVVideoComposition;

	constructor(o: { asset: AVAsset; presetName: string; });

	cancelExport(): void;

	/**
	 * @since 6.0
	 */
	determineCompatibleFileTypesWithCompletionHandler(handler: (p1: NSArray<string>) => void): void;

	/**
	 * @since 13.0
	 */
	estimateMaximumDurationWithCompletionHandler(handler: (p1: CMTime, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	estimateOutputFileLengthWithCompletionHandler(handler: (p1: number, p2: NSError) => void): void;

	exportAsynchronouslyWithCompletionHandler(handler: () => void): void;

	initWithAssetPresetName(asset: AVAsset, presetName: string): this;
}

declare const enum AVAssetExportSessionStatus {

	Unknown = 0,

	Waiting = 1,

	Exporting = 2,

	Completed = 3,

	Failed = 4,

	Cancelled = 5
}

/**
 * @since 4.0
 */
declare class AVAssetImageGenerator extends NSObject {

	static alloc(): AVAssetImageGenerator; // inherited from NSObject

	static assetImageGeneratorWithAsset(asset: AVAsset): AVAssetImageGenerator;

	static new(): AVAssetImageGenerator; // inherited from NSObject

	apertureMode: string;

	appliesPreferredTrackTransform: boolean;

	/**
	 * @since 6.0
	 */
	readonly asset: AVAsset;

	/**
	 * @since 7.0
	 */
	readonly customVideoCompositor: AVVideoCompositing;

	/**
	 * @since 18.0
	 */
	dynamicRangePolicy: string;

	maximumSize: CGSize;

	/**
	 * @since 5.0
	 */
	requestedTimeToleranceAfter: CMTime;

	/**
	 * @since 5.0
	 */
	requestedTimeToleranceBefore: CMTime;

	videoComposition: AVVideoComposition;

	constructor(o: { asset: AVAsset; });

	cancelAllCGImageGeneration(): void;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	copyCGImageAtTimeActualTimeError(requestedTime: CMTime, actualTime: interop.Pointer | interop.Reference<CMTime>): any;

	/**
	 * @since 16.0
	 */
	generateCGImageAsynchronouslyForTimeCompletionHandler(requestedTime: CMTime, handler: (p1: any, p2: CMTime, p3: NSError) => void): void;

	generateCGImagesAsynchronouslyForTimesCompletionHandler(requestedTimes: NSArray<NSValue> | NSValue[], handler: (p1: CMTime, p2: any, p3: CMTime, p4: AVAssetImageGeneratorResult, p5: NSError) => void): void;

	initWithAsset(asset: AVAsset): this;
}

/**
 * @since 4.0
 */
declare var AVAssetImageGeneratorApertureModeCleanAperture: string;

/**
 * @since 4.0
 */
declare var AVAssetImageGeneratorApertureModeEncodedPixels: string;

/**
 * @since 4.0
 */
declare var AVAssetImageGeneratorApertureModeProductionAperture: string;

/**
 * @since 18.0
 */
declare var AVAssetImageGeneratorDynamicRangePolicyForceSDR: string;

/**
 * @since 18.0
 */
declare var AVAssetImageGeneratorDynamicRangePolicyMatchSource: string;

declare const enum AVAssetImageGeneratorResult {

	Succeeded = 0,

	Failed = 1,

	Cancelled = 2
}

/**
 * @since 9.0
 */
declare var AVAssetMediaSelectionGroupsDidChangeNotification: string;

/**
 * @since 16.0
 */
declare class AVAssetPlaybackAssistant extends NSObject {

	static alloc(): AVAssetPlaybackAssistant; // inherited from NSObject

	static assetPlaybackAssistantWithAsset(asset: AVAsset): AVAssetPlaybackAssistant;

	static new(): AVAssetPlaybackAssistant; // inherited from NSObject

	loadPlaybackConfigurationOptionsWithCompletionHandler(completionHandler: (p1: NSArray<string>) => void): void;
}

/**
 * @since 18.0
 */
declare var AVAssetPlaybackConfigurationOptionSpatialVideo: string;

/**
 * @since 16.0
 */
declare var AVAssetPlaybackConfigurationOptionStereoMultiviewVideo: string;

/**
 * @since 16.0
 */
declare var AVAssetPlaybackConfigurationOptionStereoVideo: string;

/**
 * @since 4.1
 */
declare class AVAssetReader extends NSObject {

	static alloc(): AVAssetReader; // inherited from NSObject

	static assetReaderWithAssetError(asset: AVAsset): AVAssetReader;

	static new(): AVAssetReader; // inherited from NSObject

	readonly asset: AVAsset;

	readonly error: NSError;

	readonly outputs: NSArray<AVAssetReaderOutput>;

	readonly status: AVAssetReaderStatus;

	timeRange: CMTimeRange;

	constructor(o: { asset: AVAsset; });

	addOutput(output: AVAssetReaderOutput): void;

	canAddOutput(output: AVAssetReaderOutput): boolean;

	cancelReading(): void;

	initWithAssetError(asset: AVAsset): this;

	startReading(): boolean;
}

/**
 * @since 4.1
 */
declare class AVAssetReaderAudioMixOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderAudioMixOutput; // inherited from NSObject

	static assetReaderAudioMixOutputWithAudioTracksAudioSettings(audioTracks: NSArray<AVAssetTrack> | AVAssetTrack[], audioSettings: NSDictionary<string, any>): AVAssetReaderAudioMixOutput;

	static new(): AVAssetReaderAudioMixOutput; // inherited from NSObject

	audioMix: AVAudioMix;

	readonly audioSettings: NSDictionary<string, any>;

	/**
	 * @since 7.0
	 */
	audioTimePitchAlgorithm: string;

	readonly audioTracks: NSArray<AVAssetTrack>;

	constructor(o: { audioTracks: NSArray<AVAssetTrack> | AVAssetTrack[]; audioSettings: NSDictionary<string, any>; });

	initWithAudioTracksAudioSettings(audioTracks: NSArray<AVAssetTrack> | AVAssetTrack[], audioSettings: NSDictionary<string, any>): this;
}

/**
 * @since 18.0
 */
interface AVAssetReaderCaptionValidationHandling extends NSObjectProtocol {

	captionAdaptorDidVendCaptionSkippingUnsupportedSourceSyntaxElements?(adaptor: AVAssetReaderOutputCaptionAdaptor, caption: AVCaption, syntaxElements: NSArray<string> | string[]): void;
}
declare var AVAssetReaderCaptionValidationHandling: {

	prototype: AVAssetReaderCaptionValidationHandling;
};

/**
 * @since 4.1
 */
declare class AVAssetReaderOutput extends NSObject {

	static alloc(): AVAssetReaderOutput; // inherited from NSObject

	static new(): AVAssetReaderOutput; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	alwaysCopiesSampleData: boolean;

	readonly mediaType: string;

	/**
	 * @since 8.0
	 */
	supportsRandomAccess: boolean;

	copyNextSampleBuffer(): any;

	/**
	 * @since 8.0
	 */
	markConfigurationAsFinal(): void;

	/**
	 * @since 8.0
	 */
	resetForReadingTimeRanges(timeRanges: NSArray<NSValue> | NSValue[]): void;
}

/**
 * @since 18.0
 */
declare class AVAssetReaderOutputCaptionAdaptor extends NSObject {

	static alloc(): AVAssetReaderOutputCaptionAdaptor; // inherited from NSObject

	static assetReaderOutputCaptionAdaptorWithAssetReaderTrackOutput(trackOutput: AVAssetReaderTrackOutput): AVAssetReaderOutputCaptionAdaptor;

	static new(): AVAssetReaderOutputCaptionAdaptor; // inherited from NSObject

	readonly assetReaderTrackOutput: AVAssetReaderTrackOutput;

	validationDelegate: AVAssetReaderCaptionValidationHandling;

	constructor(o: { assetReaderTrackOutput: AVAssetReaderTrackOutput; });

	captionsNotPresentInPreviousGroupsInCaptionGroup(captionGroup: AVCaptionGroup): NSArray<AVCaption>;

	initWithAssetReaderTrackOutput(trackOutput: AVAssetReaderTrackOutput): this;

	nextCaptionGroup(): AVCaptionGroup;
}

/**
 * @since 8.0
 */
declare class AVAssetReaderOutputMetadataAdaptor extends NSObject {

	static alloc(): AVAssetReaderOutputMetadataAdaptor; // inherited from NSObject

	static assetReaderOutputMetadataAdaptorWithAssetReaderTrackOutput(trackOutput: AVAssetReaderTrackOutput): AVAssetReaderOutputMetadataAdaptor;

	static new(): AVAssetReaderOutputMetadataAdaptor; // inherited from NSObject

	readonly assetReaderTrackOutput: AVAssetReaderTrackOutput;

	constructor(o: { assetReaderTrackOutput: AVAssetReaderTrackOutput; });

	initWithAssetReaderTrackOutput(trackOutput: AVAssetReaderTrackOutput): this;

	nextTimedMetadataGroup(): AVTimedMetadataGroup;
}

/**
 * @since 8.0
 */
declare class AVAssetReaderSampleReferenceOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderSampleReferenceOutput; // inherited from NSObject

	static assetReaderSampleReferenceOutputWithTrack(track: AVAssetTrack): AVAssetReaderSampleReferenceOutput;

	static new(): AVAssetReaderSampleReferenceOutput; // inherited from NSObject

	readonly track: AVAssetTrack;

	constructor(o: { track: AVAssetTrack; });

	initWithTrack(track: AVAssetTrack): this;
}

declare const enum AVAssetReaderStatus {

	Unknown = 0,

	Reading = 1,

	Completed = 2,

	Failed = 3,

	Cancelled = 4
}

/**
 * @since 4.1
 */
declare class AVAssetReaderTrackOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderTrackOutput; // inherited from NSObject

	static assetReaderTrackOutputWithTrackOutputSettings(track: AVAssetTrack, outputSettings: NSDictionary<string, any>): AVAssetReaderTrackOutput;

	static new(): AVAssetReaderTrackOutput; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	audioTimePitchAlgorithm: string;

	readonly outputSettings: NSDictionary<string, any>;

	readonly track: AVAssetTrack;

	constructor(o: { track: AVAssetTrack; outputSettings: NSDictionary<string, any>; });

	initWithTrackOutputSettings(track: AVAssetTrack, outputSettings: NSDictionary<string, any>): this;
}

/**
 * @since 4.1
 */
declare class AVAssetReaderVideoCompositionOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderVideoCompositionOutput; // inherited from NSObject

	static assetReaderVideoCompositionOutputWithVideoTracksVideoSettings(videoTracks: NSArray<AVAssetTrack> | AVAssetTrack[], videoSettings: NSDictionary<string, any>): AVAssetReaderVideoCompositionOutput;

	static new(): AVAssetReaderVideoCompositionOutput; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly customVideoCompositor: AVVideoCompositing;

	videoComposition: AVVideoComposition;

	readonly videoSettings: NSDictionary<string, any>;

	readonly videoTracks: NSArray<AVAssetTrack>;

	constructor(o: { videoTracks: NSArray<AVAssetTrack> | AVAssetTrack[]; videoSettings: NSDictionary<string, any>; });

	initWithVideoTracksVideoSettings(videoTracks: NSArray<AVAssetTrack> | AVAssetTrack[], videoSettings: NSDictionary<string, any>): this;
}

declare const enum AVAssetReferenceRestrictions {

	ForbidNone = 0,

	ForbidRemoteReferenceToLocal = 1,

	ForbidLocalReferenceToRemote = 2,

	ForbidCrossSiteReference = 4,

	ForbidLocalReferenceToLocal = 8,

	ForbidAll = 65535,

	DefaultPolicy = 2
}

/**
 * @since 6.0
 */
declare class AVAssetResourceLoader extends NSObject {

	static alloc(): AVAssetResourceLoader; // inherited from NSObject

	static new(): AVAssetResourceLoader; // inherited from NSObject

	readonly delegate: AVAssetResourceLoaderDelegate;

	readonly delegateQueue: NSObject & OS_dispatch_queue;

	/**
	 * @since 9.0
	 */
	preloadsEligibleContentKeys: boolean;

	sendsCommonMediaClientDataAsHTTPHeaders: boolean;

	setDelegateQueue(delegate: AVAssetResourceLoaderDelegate, delegateQueue: NSObject & OS_dispatch_queue): void;
}

interface AVAssetResourceLoaderDelegate extends NSObjectProtocol {

	/**
	 * @since 8.0
	 */
	resourceLoaderDidCancelAuthenticationChallenge?(resourceLoader: AVAssetResourceLoader, authenticationChallenge: NSURLAuthenticationChallenge): void;

	/**
	 * @since 7.0
	 */
	resourceLoaderDidCancelLoadingRequest?(resourceLoader: AVAssetResourceLoader, loadingRequest: AVAssetResourceLoadingRequest): void;

	/**
	 * @since 6.0
	 */
	resourceLoaderShouldWaitForLoadingOfRequestedResource?(resourceLoader: AVAssetResourceLoader, loadingRequest: AVAssetResourceLoadingRequest): boolean;

	/**
	 * @since 8.0
	 */
	resourceLoaderShouldWaitForRenewalOfRequestedResource?(resourceLoader: AVAssetResourceLoader, renewalRequest: AVAssetResourceRenewalRequest): boolean;

	/**
	 * @since 8.0
	 */
	resourceLoaderShouldWaitForResponseToAuthenticationChallenge?(resourceLoader: AVAssetResourceLoader, authenticationChallenge: NSURLAuthenticationChallenge): boolean;
}
declare var AVAssetResourceLoaderDelegate: {

	prototype: AVAssetResourceLoaderDelegate;
};

/**
 * @since 7.0
 */
declare class AVAssetResourceLoadingContentInformationRequest extends NSObject {

	static alloc(): AVAssetResourceLoadingContentInformationRequest; // inherited from NSObject

	static new(): AVAssetResourceLoadingContentInformationRequest; // inherited from NSObject

	/**
	 * @since 11.2
	 */
	readonly allowedContentTypes: NSArray<string>;

	byteRangeAccessSupported: boolean;

	contentLength: number;

	contentType: string;

	/**
	 * @since 16.0
	 */
	entireLengthAvailableOnDemand: boolean;

	/**
	 * @since 8.0
	 */
	renewalDate: Date;
}

/**
 * @since 7.0
 */
declare class AVAssetResourceLoadingDataRequest extends NSObject {

	static alloc(): AVAssetResourceLoadingDataRequest; // inherited from NSObject

	static new(): AVAssetResourceLoadingDataRequest; // inherited from NSObject

	readonly currentOffset: number;

	readonly requestedLength: number;

	readonly requestedOffset: number;

	/**
	 * @since 9.0
	 */
	readonly requestsAllDataToEndOfResource: boolean;

	respondWithData(data: NSData): void;
}

/**
 * @since 6.0
 */
declare class AVAssetResourceLoadingRequest extends NSObject {

	static alloc(): AVAssetResourceLoadingRequest; // inherited from NSObject

	static new(): AVAssetResourceLoadingRequest; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly cancelled: boolean;

	/**
	 * @since 7.0
	 */
	readonly contentInformationRequest: AVAssetResourceLoadingContentInformationRequest;

	/**
	 * @since 7.0
	 */
	readonly dataRequest: AVAssetResourceLoadingDataRequest;

	readonly finished: boolean;

	/**
	 * @since 7.0
	 */
	redirect: NSURLRequest;

	readonly request: NSURLRequest;

	/**
	 * @since 12.0
	 */
	readonly requestor: AVAssetResourceLoadingRequestor;

	/**
	 * @since 7.0
	 */
	response: NSURLResponse;

	/**
	 * @since 7.0
	 */
	finishLoading(): void;

	finishLoadingWithError(error: NSError): void;

	/**
	 * @since 6.0
	 * @deprecated 7.0
	 */
	finishLoadingWithResponseDataRedirect(response: NSURLResponse, data: NSData, redirect: NSURLRequest): void;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	persistentContentKeyFromKeyVendorResponseOptionsError(keyVendorResponse: NSData, options: NSDictionary<string, any>): NSData;

	/**
	 * @since 7.0
	 * @deprecated 18.0
	 */
	streamingContentKeyRequestDataForAppContentIdentifierOptionsError(appIdentifier: NSData, contentIdentifier: NSData, options: NSDictionary<string, any>): NSData;
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare var AVAssetResourceLoadingRequestStreamingContentKeyRequestRequiresPersistentKey: string;

/**
 * @since 12.0
 */
declare class AVAssetResourceLoadingRequestor extends NSObject {

	static alloc(): AVAssetResourceLoadingRequestor; // inherited from NSObject

	static new(): AVAssetResourceLoadingRequestor; // inherited from NSObject

	readonly providesExpiredSessionReports: boolean;
}

/**
 * @since 8.0
 */
declare class AVAssetResourceRenewalRequest extends AVAssetResourceLoadingRequest {

	static alloc(): AVAssetResourceRenewalRequest; // inherited from NSObject

	static new(): AVAssetResourceRenewalRequest; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class AVAssetSegmentReport extends NSObject {

	static alloc(): AVAssetSegmentReport; // inherited from NSObject

	static new(): AVAssetSegmentReport; // inherited from NSObject

	readonly segmentType: AVAssetSegmentType;

	readonly trackReports: NSArray<AVAssetSegmentTrackReport>;
}

/**
 * @since 14.0
 */
declare class AVAssetSegmentReportSampleInformation extends NSObject {

	static alloc(): AVAssetSegmentReportSampleInformation; // inherited from NSObject

	static new(): AVAssetSegmentReportSampleInformation; // inherited from NSObject

	readonly isSyncSample: boolean;

	readonly length: number;

	readonly offset: number;

	readonly presentationTimeStamp: CMTime;
}

/**
 * @since 14.0
 */
declare class AVAssetSegmentTrackReport extends NSObject {

	static alloc(): AVAssetSegmentTrackReport; // inherited from NSObject

	static new(): AVAssetSegmentTrackReport; // inherited from NSObject

	readonly duration: CMTime;

	readonly earliestPresentationTimeStamp: CMTime;

	readonly firstVideoSampleInformation: AVAssetSegmentReportSampleInformation;

	readonly mediaType: string;

	readonly trackID: number;
}

/**
 * @since 14.0
 */
declare const enum AVAssetSegmentType {

	Initialization = 1,

	Separable = 2
}

/**
 * @since 4.0
 */
declare class AVAssetTrack extends NSObject implements AVAsynchronousKeyValueLoading, NSCopying {

	static alloc(): AVAssetTrack; // inherited from NSObject

	static new(): AVAssetTrack; // inherited from NSObject

	readonly asset: AVAsset;

	readonly availableMetadataFormats: NSArray<string>;

	/**
	 * @since 7.0
	 */
	readonly availableTrackAssociationTypes: NSArray<string>;

	/**
	 * @since 16.0
	 */
	readonly canProvideSampleCursors: boolean;

	readonly commonMetadata: NSArray<AVMetadataItem>;

	/**
	 * @since 11.0
	 */
	readonly decodable: boolean;

	readonly enabled: boolean;

	readonly estimatedDataRate: number;

	readonly extendedLanguageTag: string;

	readonly formatDescriptions: NSArray<any>;

	/**
	 * @since 13.0
	 */
	readonly hasAudioSampleDependencies: boolean;

	readonly languageCode: string;

	readonly mediaType: string;

	/**
	 * @since 8.0
	 */
	readonly metadata: NSArray<AVMetadataItem>;

	/**
	 * @since 7.0
	 */
	readonly minFrameDuration: CMTime;

	readonly naturalSize: CGSize;

	readonly naturalTimeScale: number;

	readonly nominalFrameRate: number;

	/**
	 * @since 5.0
	 */
	readonly playable: boolean;

	readonly preferredTransform: CGAffineTransform;

	readonly preferredVolume: number;

	/**
	 * @since 8.0
	 */
	readonly requiresFrameReordering: boolean;

	readonly segments: NSArray<AVAssetTrackSegment>;

	readonly selfContained: boolean;

	readonly timeRange: CMTimeRange;

	readonly totalSampleDataLength: number;

	readonly trackID: number;

	/**
	 * @since 7.0
	 * @deprecated 18.0
	 */
	associatedTracksOfType(trackAssociationType: string): NSArray<AVAssetTrack>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	hasMediaCharacteristic(mediaCharacteristic: string): boolean;

	/**
	 * @since 15.0
	 */
	loadAssociatedTracksOfTypeCompletionHandler(trackAssociationType: string, completionHandler: (p1: NSArray<AVAssetTrack>, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadMetadataForFormatCompletionHandler(format: string, completionHandler: (p1: NSArray<AVMetadataItem>, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadSamplePresentationTimeForTrackTimeCompletionHandler(trackTime: CMTime, completionHandler: (p1: CMTime, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	loadSegmentForTrackTimeCompletionHandler(trackTime: CMTime, completionHandler: (p1: AVAssetTrackSegment, p2: NSError) => void): void;

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string> | string[], handler: () => void): void;

	/**
	 * @since 16.0
	 */
	makeSampleCursorAtFirstSampleInDecodeOrder(): AVSampleCursor;

	/**
	 * @since 16.0
	 */
	makeSampleCursorAtLastSampleInDecodeOrder(): AVSampleCursor;

	/**
	 * @since 16.0
	 */
	makeSampleCursorWithPresentationTimeStamp(presentationTimeStamp: CMTime): AVSampleCursor;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	metadataForFormat(format: string): NSArray<AVMetadataItem>;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	samplePresentationTimeForTrackTime(trackTime: CMTime): CMTime;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	segmentForTrackTime(trackTime: CMTime): AVAssetTrackSegment;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;
}

/**
 * @since 7.0
 */
declare class AVAssetTrackGroup extends NSObject implements NSCopying {

	static alloc(): AVAssetTrackGroup; // inherited from NSObject

	static new(): AVAssetTrackGroup; // inherited from NSObject

	readonly trackIDs: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.0
 */
declare const enum AVAssetTrackGroupOutputHandling {

	None = 0,

	PreserveAlternateTracks = 1,

	DefaultPolicy = 0
}

/**
 * @since 4.0
 */
declare class AVAssetTrackSegment extends NSObject {

	static alloc(): AVAssetTrackSegment; // inherited from NSObject

	static new(): AVAssetTrackSegment; // inherited from NSObject

	readonly empty: boolean;

	readonly timeMapping: CMTimeMapping;
}

/**
 * @since 9.0
 */
declare var AVAssetTrackSegmentsDidChangeNotification: string;

/**
 * @since 9.0
 */
declare var AVAssetTrackTimeRangeDidChangeNotification: string;

/**
 * @since 9.0
 */
declare var AVAssetTrackTrackAssociationsDidChangeNotification: string;

/**
 * @since 15.0
 */
declare class AVAssetVariant extends NSObject {

	static alloc(): AVAssetVariant; // inherited from NSObject

	static new(): AVAssetVariant; // inherited from NSObject

	readonly audioAttributes: AVAssetVariantAudioAttributes;

	readonly averageBitRate: number;

	readonly peakBitRate: number;

	readonly videoAttributes: AVAssetVariantVideoAttributes;
}

/**
 * @since 15.0
 */
declare class AVAssetVariantAudioAttributes extends NSObject {

	static alloc(): AVAssetVariantAudioAttributes; // inherited from NSObject

	static new(): AVAssetVariantAudioAttributes; // inherited from NSObject

	readonly formatIDs: NSArray<number>;

	renditionSpecificAttributesForMediaOption(mediaSelectionOption: AVMediaSelectionOption): AVAssetVariantAudioRenditionSpecificAttributes;
}

/**
 * @since 15.0
 */
declare class AVAssetVariantAudioRenditionSpecificAttributes extends NSObject {

	static alloc(): AVAssetVariantAudioRenditionSpecificAttributes; // inherited from NSObject

	static new(): AVAssetVariantAudioRenditionSpecificAttributes; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly binaural: boolean;

	readonly channelCount: number;

	/**
	 * @since 16.0
	 */
	readonly downmix: boolean;

	/**
	 * @since 17.0
	 */
	readonly immersive: boolean;
}

/**
 * @since 15.0
 */
declare class AVAssetVariantQualifier extends NSObject implements NSCopying {

	static alloc(): AVAssetVariantQualifier; // inherited from NSObject

	static assetVariantQualifierWithPredicate(predicate: NSPredicate): AVAssetVariantQualifier;

	static assetVariantQualifierWithVariant(variant: AVAssetVariant): AVAssetVariantQualifier;

	static new(): AVAssetVariantQualifier; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static predicateForAudioSampleRateMediaSelectionOptionOperatorType(sampleRate: number, mediaSelectionOption: AVMediaSelectionOption, operatorType: NSPredicateOperatorType): NSPredicate;

	/**
	 * @since 17.0
	 */
	static predicateForBinauralAudioMediaSelectionOption(isBinauralAudio: boolean, mediaSelectionOption: AVMediaSelectionOption): NSPredicate;

	static predicateForChannelCountMediaSelectionOptionOperatorType(channelCount: number, mediaSelectionOption: AVMediaSelectionOption, operatorType: NSPredicateOperatorType): NSPredicate;

	/**
	 * @since 17.0
	 */
	static predicateForDownmixAudioMediaSelectionOption(isDownmixAudio: boolean, mediaSelectionOption: AVMediaSelectionOption): NSPredicate;

	/**
	 * @since 17.0
	 */
	static predicateForImmersiveAudioMediaSelectionOption(isImmersiveAudio: boolean, mediaSelectionOption: AVMediaSelectionOption): NSPredicate;

	static predicateForPresentationHeightOperatorType(height: number, operatorType: NSPredicateOperatorType): NSPredicate;

	static predicateForPresentationWidthOperatorType(width: number, operatorType: NSPredicateOperatorType): NSPredicate;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.0
 */
declare class AVAssetVariantVideoAttributes extends NSObject {

	static alloc(): AVAssetVariantVideoAttributes; // inherited from NSObject

	static new(): AVAssetVariantVideoAttributes; // inherited from NSObject

	readonly codecTypes: NSArray<number>;

	readonly nominalFrameRate: number;

	readonly presentationSize: CGSize;

	/**
	 * @since 17.0
	 */
	readonly videoLayoutAttributes: NSArray<AVAssetVariantVideoLayoutAttributes>;

	readonly videoRange: string;
}

/**
 * @since 17.0
 */
declare class AVAssetVariantVideoLayoutAttributes extends NSObject {

	static alloc(): AVAssetVariantVideoLayoutAttributes; // inherited from NSObject

	static new(): AVAssetVariantVideoLayoutAttributes; // inherited from NSObject

	readonly stereoViewComponents: CMStereoViewComponents;
}

/**
 * @since 12.0
 */
declare var AVAssetWasDefragmentedNotification: string;

/**
 * @since 4.1
 */
declare class AVAssetWriter extends NSObject {

	static alloc(): AVAssetWriter; // inherited from NSObject

	static assetWriterWithURLFileTypeError(outputURL: NSURL, outputFileType: string): AVAssetWriter;

	static new(): AVAssetWriter; // inherited from NSObject

	readonly availableMediaTypes: NSArray<string>;

	/**
	 * @since 14.0
	 */
	delegate: AVAssetWriterDelegate;

	/**
	 * @since 8.0
	 */
	directoryForTemporaryFiles: NSURL;

	readonly error: NSError;

	/**
	 * @since 17.0
	 */
	initialMovieFragmentInterval: CMTime;

	/**
	 * @since 14.0
	 */
	initialMovieFragmentSequenceNumber: number;

	/**
	 * @since 14.0
	 */
	initialSegmentStartTime: CMTime;

	/**
	 * @since 7.0
	 */
	readonly inputGroups: NSArray<AVAssetWriterInputGroup>;

	readonly inputs: NSArray<AVAssetWriterInput>;

	metadata: NSArray<AVMetadataItem>;

	movieFragmentInterval: CMTime;

	/**
	 * @since 4.3
	 */
	movieTimeScale: number;

	readonly outputFileType: string;

	/**
	 * @since 14.0
	 */
	outputFileTypeProfile: string;

	readonly outputURL: NSURL;

	overallDurationHint: CMTime;

	/**
	 * @since 14.0
	 */
	preferredOutputSegmentInterval: CMTime;

	/**
	 * @since 14.0
	 */
	producesCombinableFragments: boolean;

	shouldOptimizeForNetworkUse: boolean;

	readonly status: AVAssetWriterStatus;

	/**
	 * @since 14.0
	 */
	constructor(o: { contentType: UTType; });

	constructor(o: { URL: NSURL; fileType: string; });

	addInput(input: AVAssetWriterInput): void;

	/**
	 * @since 7.0
	 */
	addInputGroup(inputGroup: AVAssetWriterInputGroup): void;

	canAddInput(input: AVAssetWriterInput): boolean;

	/**
	 * @since 7.0
	 */
	canAddInputGroup(inputGroup: AVAssetWriterInputGroup): boolean;

	canApplyOutputSettingsForMediaType(outputSettings: NSDictionary<string, any>, mediaType: string): boolean;

	cancelWriting(): void;

	endSessionAtSourceTime(endTime: CMTime): void;

	/**
	 * @since 4.1
	 * @deprecated 6.0
	 */
	finishWriting(): boolean;

	/**
	 * @since 6.0
	 */
	finishWritingWithCompletionHandler(handler: () => void): void;

	/**
	 * @since 14.0
	 */
	flushSegment(): void;

	/**
	 * @since 14.0
	 */
	initWithContentType(outputContentType: UTType): this;

	initWithURLFileTypeError(outputURL: NSURL, outputFileType: string): this;

	startSessionAtSourceTime(startTime: CMTime): void;

	startWriting(): boolean;
}

/**
 * @since 14.0
 */
interface AVAssetWriterDelegate extends NSObjectProtocol {

	assetWriterDidOutputSegmentDataSegmentType?(writer: AVAssetWriter, segmentData: NSData, segmentType: AVAssetSegmentType): void;

	assetWriterDidOutputSegmentDataSegmentTypeSegmentReport?(writer: AVAssetWriter, segmentData: NSData, segmentType: AVAssetSegmentType, segmentReport: AVAssetSegmentReport): void;
}
declare var AVAssetWriterDelegate: {

	prototype: AVAssetWriterDelegate;
};

/**
 * @since 4.1
 */
declare class AVAssetWriterInput extends NSObject {

	static alloc(): AVAssetWriterInput; // inherited from NSObject

	static assetWriterInputWithMediaTypeOutputSettings(mediaType: string, outputSettings: NSDictionary<string, any>): AVAssetWriterInput;

	/**
	 * @since 6.0
	 */
	static assetWriterInputWithMediaTypeOutputSettingsSourceFormatHint(mediaType: string, outputSettings: NSDictionary<string, any>, sourceFormatHint: any): AVAssetWriterInput;

	static new(): AVAssetWriterInput; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	readonly canPerformMultiplePasses: boolean;

	/**
	 * @since 8.0
	 */
	readonly currentPassDescription: AVAssetWriterInputPassDescription;

	expectsMediaDataInRealTime: boolean;

	/**
	 * @since 7.0
	 */
	extendedLanguageTag: string;

	/**
	 * @since 7.0
	 */
	languageCode: string;

	/**
	 * @since 7.0
	 */
	marksOutputTrackAsEnabled: boolean;

	/**
	 * @since 11.0
	 */
	mediaDataLocation: string;

	/**
	 * @since 4.3
	 */
	mediaTimeScale: number;

	readonly mediaType: string;

	metadata: NSArray<AVMetadataItem>;

	/**
	 * @since 7.0
	 */
	naturalSize: CGSize;

	readonly outputSettings: NSDictionary<string, any>;

	/**
	 * @since 8.0
	 */
	performsMultiPassEncodingIfSupported: boolean;

	/**
	 * @since 8.0
	 */
	preferredMediaChunkAlignment: number;

	/**
	 * @since 8.0
	 */
	preferredMediaChunkDuration: CMTime;

	/**
	 * @since 7.0
	 */
	preferredVolume: number;

	readonly readyForMoreMediaData: boolean;

	/**
	 * @since 8.0
	 */
	sampleReferenceBaseURL: NSURL;

	/**
	 * @since 6.0
	 */
	readonly sourceFormatHint: any;

	transform: CGAffineTransform;

	constructor(o: { mediaType: string; outputSettings: NSDictionary<string, any>; });

	/**
	 * @since 6.0
	 */
	constructor(o: { mediaType: string; outputSettings: NSDictionary<string, any>; sourceFormatHint: any; });

	/**
	 * @since 7.0
	 */
	addTrackAssociationWithTrackOfInputType(input: AVAssetWriterInput, trackAssociationType: string): void;

	appendSampleBuffer(sampleBuffer: any): boolean;

	/**
	 * @since 7.0
	 */
	canAddTrackAssociationWithTrackOfInputType(input: AVAssetWriterInput, trackAssociationType: string): boolean;

	initWithMediaTypeOutputSettings(mediaType: string, outputSettings: NSDictionary<string, any>): this;

	/**
	 * @since 6.0
	 */
	initWithMediaTypeOutputSettingsSourceFormatHint(mediaType: string, outputSettings: NSDictionary<string, any>, sourceFormatHint: any): this;

	markAsFinished(): void;

	/**
	 * @since 8.0
	 */
	markCurrentPassAsFinished(): void;

	requestMediaDataWhenReadyOnQueueUsingBlock(queue: NSObject & OS_dispatch_queue, block: () => void): void;

	/**
	 * @since 8.0
	 */
	respondToEachPassDescriptionOnQueueUsingBlock(queue: NSObject & OS_dispatch_queue, block: () => void): void;
}

/**
 * @since 18.0
 */
declare class AVAssetWriterInputCaptionAdaptor extends NSObject {

	static alloc(): AVAssetWriterInputCaptionAdaptor; // inherited from NSObject

	static assetWriterInputCaptionAdaptorWithAssetWriterInput(input: AVAssetWriterInput): AVAssetWriterInputCaptionAdaptor;

	static new(): AVAssetWriterInputCaptionAdaptor; // inherited from NSObject

	readonly assetWriterInput: AVAssetWriterInput;

	constructor(o: { assetWriterInput: AVAssetWriterInput; });

	appendCaption(caption: AVCaption): boolean;

	appendCaptionGroup(captionGroup: AVCaptionGroup): boolean;

	initWithAssetWriterInput(input: AVAssetWriterInput): this;
}

/**
 * @since 7.0
 */
declare class AVAssetWriterInputGroup extends AVMediaSelectionGroup {

	static alloc(): AVAssetWriterInputGroup; // inherited from NSObject

	static assetWriterInputGroupWithInputsDefaultInput(inputs: NSArray<AVAssetWriterInput> | AVAssetWriterInput[], defaultInput: AVAssetWriterInput): AVAssetWriterInputGroup;

	static new(): AVAssetWriterInputGroup; // inherited from NSObject

	readonly defaultInput: AVAssetWriterInput;

	readonly inputs: NSArray<AVAssetWriterInput>;

	constructor(o: { inputs: NSArray<AVAssetWriterInput> | AVAssetWriterInput[]; defaultInput: AVAssetWriterInput; });

	initWithInputsDefaultInput(inputs: NSArray<AVAssetWriterInput> | AVAssetWriterInput[], defaultInput: AVAssetWriterInput): this;
}

/**
 * @since 11.0
 */
declare var AVAssetWriterInputMediaDataLocationBeforeMainMediaDataNotInterleaved: string;

/**
 * @since 11.0
 */
declare var AVAssetWriterInputMediaDataLocationInterleavedWithMainMediaData: string;

/**
 * @since 8.0
 */
declare class AVAssetWriterInputMetadataAdaptor extends NSObject {

	static alloc(): AVAssetWriterInputMetadataAdaptor; // inherited from NSObject

	static assetWriterInputMetadataAdaptorWithAssetWriterInput(input: AVAssetWriterInput): AVAssetWriterInputMetadataAdaptor;

	static new(): AVAssetWriterInputMetadataAdaptor; // inherited from NSObject

	readonly assetWriterInput: AVAssetWriterInput;

	constructor(o: { assetWriterInput: AVAssetWriterInput; });

	appendTimedMetadataGroup(timedMetadataGroup: AVTimedMetadataGroup): boolean;

	initWithAssetWriterInput(input: AVAssetWriterInput): this;
}

/**
 * @since 8.0
 */
declare class AVAssetWriterInputPassDescription extends NSObject {

	static alloc(): AVAssetWriterInputPassDescription; // inherited from NSObject

	static new(): AVAssetWriterInputPassDescription; // inherited from NSObject

	readonly sourceTimeRanges: NSArray<NSValue>;
}

/**
 * @since 4.1
 */
declare class AVAssetWriterInputPixelBufferAdaptor extends NSObject {

	static alloc(): AVAssetWriterInputPixelBufferAdaptor; // inherited from NSObject

	static assetWriterInputPixelBufferAdaptorWithAssetWriterInputSourcePixelBufferAttributes(input: AVAssetWriterInput, sourcePixelBufferAttributes: NSDictionary<string, any>): AVAssetWriterInputPixelBufferAdaptor;

	static new(): AVAssetWriterInputPixelBufferAdaptor; // inherited from NSObject

	readonly assetWriterInput: AVAssetWriterInput;

	readonly pixelBufferPool: any;

	readonly sourcePixelBufferAttributes: NSDictionary<string, any>;

	constructor(o: { assetWriterInput: AVAssetWriterInput; sourcePixelBufferAttributes: NSDictionary<string, any>; });

	appendPixelBufferWithPresentationTime(pixelBuffer: any, presentationTime: CMTime): boolean;

	initWithAssetWriterInputSourcePixelBufferAttributes(input: AVAssetWriterInput, sourcePixelBufferAttributes: NSDictionary<string, any>): this;
}

/**
 * @since 17.0
 */
declare class AVAssetWriterInputTaggedPixelBufferGroupAdaptor extends NSObject {

	static alloc(): AVAssetWriterInputTaggedPixelBufferGroupAdaptor; // inherited from NSObject

	static assetWriterInputTaggedPixelBufferGroupAdaptorWithAssetWriterInputSourcePixelBufferAttributes(input: AVAssetWriterInput, sourcePixelBufferAttributes: NSDictionary<string, any>): AVAssetWriterInputTaggedPixelBufferGroupAdaptor;

	static new(): AVAssetWriterInputTaggedPixelBufferGroupAdaptor; // inherited from NSObject

	readonly assetWriterInput: AVAssetWriterInput;

	readonly pixelBufferPool: any;

	readonly sourcePixelBufferAttributes: NSDictionary<string, any>;

	constructor(o: { assetWriterInput: AVAssetWriterInput; sourcePixelBufferAttributes: NSDictionary<string, any>; });

	appendTaggedPixelBufferGroupWithPresentationTime(taggedPixelBufferGroup: any, presentationTime: CMTime): boolean;

	initWithAssetWriterInputSourcePixelBufferAttributes(input: AVAssetWriterInput, sourcePixelBufferAttributes: NSDictionary<string, any>): this;
}

declare const enum AVAssetWriterStatus {

	Unknown = 0,

	Writing = 1,

	Completed = 2,

	Failed = 3,

	Cancelled = 4
}

/**
 * @since 9.0
 */
declare class AVAsynchronousCIImageFilteringRequest extends NSObject implements NSCopying {

	static alloc(): AVAsynchronousCIImageFilteringRequest; // inherited from NSObject

	static new(): AVAsynchronousCIImageFilteringRequest; // inherited from NSObject

	readonly compositionTime: CMTime;

	readonly renderSize: CGSize;

	readonly sourceImage: CIImage;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	finishWithError(error: NSError): void;

	finishWithImageContext(filteredImage: CIImage, context: CIContext): void;
}

interface AVAsynchronousKeyValueLoading {

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string> | string[], handler: () => void): void;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;
}
declare var AVAsynchronousKeyValueLoading: {

	prototype: AVAsynchronousKeyValueLoading;
};

/**
 * @since 7.0
 */
declare class AVAsynchronousVideoCompositionRequest extends NSObject implements NSCopying {

	static alloc(): AVAsynchronousVideoCompositionRequest; // inherited from NSObject

	static new(): AVAsynchronousVideoCompositionRequest; // inherited from NSObject

	readonly compositionTime: CMTime;

	readonly renderContext: AVVideoCompositionRenderContext;

	/**
	 * @since 15.0
	 */
	readonly sourceSampleDataTrackIDs: NSArray<number>;

	readonly sourceTrackIDs: NSArray<number>;

	readonly videoCompositionInstruction: AVVideoCompositionInstructionProtocol;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	finishCancelledRequest(): void;

	finishWithComposedVideoFrame(composedVideoFrame: any): void;

	finishWithError(error: NSError): void;

	sourceFrameByTrackID(trackID: number): any;

	/**
	 * @since 15.0
	 */
	sourceSampleBufferByTrackID(trackID: number): any;

	/**
	 * @since 15.0
	 */
	sourceTimedMetadataByTrackID(trackID: number): AVTimedMetadataGroup;
}

/**
 * @since 4.0
 */
declare class AVAudioMix extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAudioMix; // inherited from NSObject

	static new(): AVAudioMix; // inherited from NSObject

	readonly inputParameters: NSArray<AVAudioMixInputParameters>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.0
 */
declare class AVAudioMixInputParameters extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAudioMixInputParameters; // inherited from NSObject

	static new(): AVAudioMixInputParameters; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	readonly audioTapProcessor: any;

	/**
	 * @since 7.0
	 */
	readonly audioTimePitchAlgorithm: string;

	readonly trackID: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	getVolumeRampForTimeStartVolumeEndVolumeTimeRange(time: CMTime, startVolume: interop.Pointer | interop.Reference<number>, endVolume: interop.Pointer | interop.Reference<number>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum AVAudioSpatializationFormats {

	None = 0,

	MonoAndStereo = 3,

	Multichannel = 4,

	MonoStereoAndMultichannel = 7
}

/**
 * @since 7.0
 * @deprecated 15.0
 */
declare var AVAudioTimePitchAlgorithmLowQualityZeroLatency: string;

/**
 * @since 7.0
 */
declare var AVAudioTimePitchAlgorithmSpectral: string;

/**
 * @since 7.0
 */
declare var AVAudioTimePitchAlgorithmTimeDomain: string;

/**
 * @since 7.0
 */
declare var AVAudioTimePitchAlgorithmVarispeed: string;

/**
 * @since 7.0
 */
declare const enum AVAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

/**
 * @since 11.0
 */
declare class AVCameraCalibrationData extends NSObject {

	static alloc(): AVCameraCalibrationData; // inherited from NSObject

	static new(): AVCameraCalibrationData; // inherited from NSObject

	readonly extrinsicMatrix: simd_float4x3;

	readonly intrinsicMatrix: simd_float3x3;

	readonly intrinsicMatrixReferenceDimensions: CGSize;

	readonly inverseLensDistortionLookupTable: NSData;

	readonly lensDistortionCenter: CGPoint;

	readonly lensDistortionLookupTable: NSData;

	readonly pixelSize: number;
}

/**
 * @since 18.0
 */
declare class AVCaption extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): AVCaption; // inherited from NSObject

	static new(): AVCaption; // inherited from NSObject

	readonly animation: AVCaptionAnimation;

	readonly region: AVCaptionRegion;

	readonly text: string;

	readonly textAlignment: AVCaptionTextAlignment;

	readonly timeRange: CMTimeRange;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { text: string; timeRange: CMTimeRange; });

	backgroundColorAtIndexRange(index: number, outRange: interop.Pointer | interop.Reference<NSRange>): any;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	decorationAtIndexRange(index: number, outRange: interop.Pointer | interop.Reference<NSRange>): AVCaptionDecoration;

	encodeWithCoder(coder: NSCoder): void;

	fontStyleAtIndexRange(index: number, outRange: interop.Pointer | interop.Reference<NSRange>): AVCaptionFontStyle;

	fontWeightAtIndexRange(index: number, outRange: interop.Pointer | interop.Reference<NSRange>): AVCaptionFontWeight;

	initWithCoder(coder: NSCoder): this;

	initWithTextTimeRange(text: string, timeRange: CMTimeRange): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	rubyAtIndexRange(index: number, outRange: interop.Pointer | interop.Reference<NSRange>): AVCaptionRuby;

	textColorAtIndexRange(index: number, outRange: interop.Pointer | interop.Reference<NSRange>): any;

	textCombineAtIndexRange(index: number, outRange: interop.Pointer | interop.Reference<NSRange>): AVCaptionTextCombine;
}

/**
 * @since 18.0
 */
declare const enum AVCaptionAnimation {

	None = 0,

	CharacterReveal = 1
}

/**
 * @since 18.0
 */
declare class AVCaptionConversionAdjustment extends NSObject {

	static alloc(): AVCaptionConversionAdjustment; // inherited from NSObject

	static new(): AVCaptionConversionAdjustment; // inherited from NSObject

	readonly adjustmentType: string;
}

/**
 * @since 18.0
 */
declare var AVCaptionConversionAdjustmentTypeTimeRange: string;

/**
 * @since 18.0
 */
declare class AVCaptionConversionTimeRangeAdjustment extends AVCaptionConversionAdjustment {

	static alloc(): AVCaptionConversionTimeRangeAdjustment; // inherited from NSObject

	static new(): AVCaptionConversionTimeRangeAdjustment; // inherited from NSObject

	readonly durationOffset: CMTime;

	readonly startTimeOffset: CMTime;
}

/**
 * @since 18.0
 */
declare class AVCaptionConversionValidator extends NSObject {

	static alloc(): AVCaptionConversionValidator; // inherited from NSObject

	static captionConversionValidatorWithCaptionsTimeRangeConversionSettings(captions: NSArray<AVCaption> | AVCaption[], timeRange: CMTimeRange, conversionSettings: NSDictionary<string, any>): AVCaptionConversionValidator;

	static new(): AVCaptionConversionValidator; // inherited from NSObject

	readonly captions: NSArray<AVCaption>;

	readonly status: AVCaptionConversionValidatorStatus;

	readonly timeRange: CMTimeRange;

	readonly warnings: NSArray<AVCaptionConversionWarning>;

	constructor(o: { captions: NSArray<AVCaption> | AVCaption[]; timeRange: CMTimeRange; conversionSettings: NSDictionary<string, any>; });

	initWithCaptionsTimeRangeConversionSettings(captions: NSArray<AVCaption> | AVCaption[], timeRange: CMTimeRange, conversionSettings: NSDictionary<string, any>): this;

	stopValidating(): void;

	validateCaptionConversionWithWarningHandler(handler: (p1: AVCaptionConversionWarning) => void): void;
}

/**
 * @since 18.0
 */
declare const enum AVCaptionConversionValidatorStatus {

	Unknown = 0,

	Validating = 1,

	Completed = 2,

	Stopped = 3
}

/**
 * @since 18.0
 */
declare class AVCaptionConversionWarning extends NSObject {

	static alloc(): AVCaptionConversionWarning; // inherited from NSObject

	static new(): AVCaptionConversionWarning; // inherited from NSObject

	readonly adjustment: AVCaptionConversionAdjustment;

	readonly rangeOfCaptions: NSRange;

	readonly warningType: string;
}

/**
 * @since 18.0
 */
declare var AVCaptionConversionWarningTypeExcessMediaData: string;

/**
 * @since 18.0
 */
declare const enum AVCaptionDecoration {

	None = 0,

	Underline = 1,

	LineThrough = 2,

	Overline = 4
}

interface AVCaptionDimension {
	value: number;
	units: AVCaptionUnitsType;
}
declare var AVCaptionDimension: interop.StructType<AVCaptionDimension>;

/**
 * @since 18.0
 */
declare function AVCaptionDimensionMake(value: number, units: AVCaptionUnitsType): AVCaptionDimension;

/**
 * @since 18.0
 */
declare const enum AVCaptionFontStyle {

	Unknown = 0,

	Normal = 1,

	Italic = 2
}

/**
 * @since 18.0
 */
declare const enum AVCaptionFontWeight {

	Unknown = 0,

	Normal = 1,

	Bold = 2
}

/**
 * @since 18.0
 */
declare class AVCaptionFormatConformer extends NSObject {

	static alloc(): AVCaptionFormatConformer; // inherited from NSObject

	static captionFormatConformerWithConversionSettings(conversionSettings: NSDictionary<string, any>): AVCaptionFormatConformer;

	static new(): AVCaptionFormatConformer; // inherited from NSObject

	conformsCaptionsToTimeRange: boolean;

	constructor(o: { conversionSettings: NSDictionary<string, any>; });

	conformedCaptionForCaptionError(caption: AVCaption): AVCaption;

	initWithConversionSettings(conversionSettings: NSDictionary<string, any>): this;
}

/**
 * @since 18.0
 */
declare class AVCaptionGroup extends NSObject {

	static alloc(): AVCaptionGroup; // inherited from NSObject

	static new(): AVCaptionGroup; // inherited from NSObject

	readonly captions: NSArray<AVCaption>;

	readonly timeRange: CMTimeRange;

	constructor(o: { captions: NSArray<AVCaption> | AVCaption[]; timeRange: CMTimeRange; });

	constructor(o: { timeRange: CMTimeRange; });

	initWithCaptionsTimeRange(captions: NSArray<AVCaption> | AVCaption[], timeRange: CMTimeRange): this;

	initWithTimeRange(timeRange: CMTimeRange): this;
}

/**
 * @since 18.0
 */
declare class AVCaptionGrouper extends NSObject {

	static alloc(): AVCaptionGrouper; // inherited from NSObject

	static new(): AVCaptionGrouper; // inherited from NSObject

	addCaption(input: AVCaption): void;

	flushAddedCaptionsIntoGroupsUpToTime(upToTime: CMTime): NSArray<AVCaptionGroup>;
}

/**
 * @since 18.0
 */
declare var AVCaptionMediaSubTypeKey: string;

/**
 * @since 18.0
 */
declare var AVCaptionMediaTypeKey: string;

interface AVCaptionPoint {
	x: AVCaptionDimension;
	y: AVCaptionDimension;
}
declare var AVCaptionPoint: interop.StructType<AVCaptionPoint>;

/**
 * @since 18.0
 */
declare function AVCaptionPointMake(x: AVCaptionDimension, y: AVCaptionDimension): AVCaptionPoint;

/**
 * @since 18.0
 */
declare class AVCaptionRegion extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): AVCaptionRegion; // inherited from NSObject

	static new(): AVCaptionRegion; // inherited from NSObject

	readonly displayAlignment: AVCaptionRegionDisplayAlignment;

	readonly identifier: string;

	readonly origin: AVCaptionPoint;

	readonly scroll: AVCaptionRegionScroll;

	readonly size: AVCaptionSize;

	readonly writingMode: AVCaptionRegionWritingMode;

	static readonly appleITTBottomRegion: AVCaptionRegion;

	static readonly appleITTLeftRegion: AVCaptionRegion;

	static readonly appleITTRightRegion: AVCaptionRegion;

	static readonly appleITTTopRegion: AVCaptionRegion;

	static readonly subRipTextBottomRegion: AVCaptionRegion;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 18.0
 */
declare const enum AVCaptionRegionDisplayAlignment {

	Before = 0,

	Center = 1,

	After = 2
}

/**
 * @since 18.0
 */
declare const enum AVCaptionRegionScroll {

	None = 0,

	RollUp = 1
}

/**
 * @since 18.0
 */
declare const enum AVCaptionRegionWritingMode {

	LeftToRightAndTopToBottom = 0,

	TopToBottomAndRightToLeft = 2
}

/**
 * @since 18.0
 */
declare class AVCaptionRenderer extends NSObject {

	static alloc(): AVCaptionRenderer; // inherited from NSObject

	static new(): AVCaptionRenderer; // inherited from NSObject

	bounds: CGRect;

	captions: NSArray<AVCaption>;

	captionSceneChangesInRange(consideredTimeRange: CMTimeRange): NSArray<AVCaptionRendererScene>;

	renderInContextForTime(ctx: any, time: CMTime): void;
}

/**
 * @since 18.0
 */
declare class AVCaptionRendererScene extends NSObject implements NSCopying {

	static alloc(): AVCaptionRendererScene; // inherited from NSObject

	static new(): AVCaptionRendererScene; // inherited from NSObject

	readonly hasActiveCaptions: boolean;

	readonly needsPeriodicRefresh: boolean;

	readonly timeRange: CMTimeRange;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 18.0
 */
declare class AVCaptionRuby extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVCaptionRuby; // inherited from NSObject

	static new(): AVCaptionRuby; // inherited from NSObject

	readonly alignment: AVCaptionRubyAlignment;

	readonly position: AVCaptionRubyPosition;

	readonly text: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { text: string; });

	constructor(o: { text: string; position: AVCaptionRubyPosition; alignment: AVCaptionRubyAlignment; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithText(text: string): this;

	initWithTextPositionAlignment(text: string, position: AVCaptionRubyPosition, alignment: AVCaptionRubyAlignment): this;
}

/**
 * @since 18.0
 */
declare const enum AVCaptionRubyAlignment {

	Start = 0,

	Center = 1,

	DistributeSpaceBetween = 2,

	DistributeSpaceAround = 3
}

/**
 * @since 18.0
 */
declare const enum AVCaptionRubyPosition {

	Before = 0,

	After = 1
}

interface AVCaptionSize {
	width: AVCaptionDimension;
	height: AVCaptionDimension;
}
declare var AVCaptionSize: interop.StructType<AVCaptionSize>;

/**
 * @since 18.0
 */
declare function AVCaptionSizeMake(width: AVCaptionDimension, height: AVCaptionDimension): AVCaptionSize;

/**
 * @since 18.0
 */
declare const enum AVCaptionTextAlignment {

	Start = 0,

	End = 1,

	Center = 2,

	Left = 3,

	Right = 4
}

/**
 * @since 18.0
 */
declare const enum AVCaptionTextCombine {

	All = -1,

	None = 0,

	OneDigit = 1,

	TwoDigits = 2,

	ThreeDigits = 3,

	FourDigits = 4
}

/**
 * @since 18.0
 */
declare var AVCaptionTimeCodeFrameDurationKey: string;

declare const enum AVCaptionUnitsType {

	Unspecified = 0,

	Cells = 1,

	Percent = 2
}

/**
 * @since 18.0
 */
declare var AVCaptionUseDropFrameTimeCodeKey: string;

/**
 * @since 4.0
 */
declare class AVCaptureAudioChannel extends NSObject {

	static alloc(): AVCaptureAudioChannel; // inherited from NSObject

	static new(): AVCaptureAudioChannel; // inherited from NSObject

	readonly averagePowerLevel: number;

	readonly peakHoldLevel: number;
}

/**
 * @since 4.0
 */
declare class AVCaptureAudioDataOutput extends AVCaptureOutput {

	static alloc(): AVCaptureAudioDataOutput; // inherited from NSObject

	static new(): AVCaptureAudioDataOutput; // inherited from NSObject

	readonly sampleBufferCallbackQueue: NSObject & OS_dispatch_queue;

	readonly sampleBufferDelegate: AVCaptureAudioDataOutputSampleBufferDelegate;

	/**
	 * @since 7.0
	 */
	recommendedAudioSettingsForAssetWriterWithOutputFileType(outputFileType: string): NSDictionary<string, any>;

	setSampleBufferDelegateQueue(sampleBufferDelegate: AVCaptureAudioDataOutputSampleBufferDelegate, sampleBufferCallbackQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 4.0
 */
interface AVCaptureAudioDataOutputSampleBufferDelegate extends NSObjectProtocol {

	captureOutputDidOutputSampleBufferFromConnection?(output: AVCaptureOutput, sampleBuffer: any, connection: AVCaptureConnection): void;
}
declare var AVCaptureAudioDataOutputSampleBufferDelegate: {

	prototype: AVCaptureAudioDataOutputSampleBufferDelegate;
};

/**
 * @since 8.0
 */
declare class AVCaptureAutoExposureBracketedStillImageSettings extends AVCaptureBracketedStillImageSettings {

	static alloc(): AVCaptureAutoExposureBracketedStillImageSettings; // inherited from NSObject

	static autoExposureSettingsWithExposureTargetBias(exposureTargetBias: number): AVCaptureAutoExposureBracketedStillImageSettings;

	static new(): AVCaptureAutoExposureBracketedStillImageSettings; // inherited from NSObject

	readonly exposureTargetBias: number;
}

/**
 * @since 7.0
 */
declare const enum AVCaptureAutoFocusRangeRestriction {

	None = 0,

	Near = 1,

	Far = 2
}

/**
 * @since 8.0
 */
declare const enum AVCaptureAutoFocusSystem {

	None = 0,

	ContrastDetection = 1,

	PhaseDetection = 2
}

/**
 * @since 8.0
 */
declare class AVCaptureBracketedStillImageSettings extends NSObject {

	static alloc(): AVCaptureBracketedStillImageSettings; // inherited from NSObject

	static new(): AVCaptureBracketedStillImageSettings; // inherited from NSObject
}

/**
 * @since 14.5
 */
declare const enum AVCaptureCenterStageControlMode {

	User = 0,

	App = 1,

	Cooperative = 2
}

/**
 * @since 10.0
 */
declare const enum AVCaptureColorSpace {

	sRGB = 0,

	P3_D65 = 1,

	HLG_BT2020 = 2,

	AppleLog = 3
}

/**
 * @since 4.0
 */
declare class AVCaptureConnection extends NSObject {

	static alloc(): AVCaptureConnection; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	static connectionWithInputPortVideoPreviewLayer(port: AVCaptureInputPort, layer: AVCaptureVideoPreviewLayer): AVCaptureConnection;

	/**
	 * @since 8.0
	 */
	static connectionWithInputPortsOutput(ports: NSArray<AVCaptureInputPort> | AVCaptureInputPort[], output: AVCaptureOutput): AVCaptureConnection;

	static new(): AVCaptureConnection; // inherited from NSObject

	readonly active: boolean;

	/**
	 * @since 8.0
	 */
	readonly activeVideoStabilizationMode: AVCaptureVideoStabilizationMode;

	readonly audioChannels: NSArray<AVCaptureAudioChannel>;

	/**
	 * @since 6.0
	 */
	automaticallyAdjustsVideoMirroring: boolean;

	/**
	 * @since 11.0
	 */
	cameraIntrinsicMatrixDeliveryEnabled: boolean;

	/**
	 * @since 11.0
	 */
	readonly cameraIntrinsicMatrixDeliverySupported: boolean;

	enabled: boolean;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	enablesVideoStabilizationWhenAvailable: boolean;

	readonly inputPorts: NSArray<AVCaptureInputPort>;

	readonly output: AVCaptureOutput;

	/**
	 * @since 8.0
	 */
	preferredVideoStabilizationMode: AVCaptureVideoStabilizationMode;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	readonly supportsVideoMaxFrameDuration: boolean;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	readonly supportsVideoMinFrameDuration: boolean;

	readonly supportsVideoMirroring: boolean;

	/**
	 * @since 4.0
	 * @deprecated 17.0
	 */
	readonly supportsVideoOrientation: boolean;

	/**
	 * @since 6.0
	 */
	readonly supportsVideoStabilization: boolean;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	videoMaxFrameDuration: CMTime;

	/**
	 * @since 5.0
	 */
	readonly videoMaxScaleAndCropFactor: number;

	/**
	 * @since 5.0
	 * @deprecated 7.0
	 */
	videoMinFrameDuration: CMTime;

	videoMirrored: boolean;

	/**
	 * @since 4.0
	 * @deprecated 17.0
	 */
	videoOrientation: AVCaptureVideoOrientation;

	/**
	 * @since 6.0
	 */
	readonly videoPreviewLayer: AVCaptureVideoPreviewLayer;

	/**
	 * @since 17.0
	 */
	videoRotationAngle: number;

	/**
	 * @since 5.0
	 */
	videoScaleAndCropFactor: number;

	/**
	 * @since 6.0
	 * @deprecated 8.0
	 */
	readonly videoStabilizationEnabled: boolean;

	/**
	 * @since 8.0
	 */
	constructor(o: { inputPort: AVCaptureInputPort; videoPreviewLayer: AVCaptureVideoPreviewLayer; });

	/**
	 * @since 8.0
	 */
	constructor(o: { inputPorts: NSArray<AVCaptureInputPort> | AVCaptureInputPort[]; output: AVCaptureOutput; });

	/**
	 * @since 8.0
	 */
	initWithInputPortVideoPreviewLayer(port: AVCaptureInputPort, layer: AVCaptureVideoPreviewLayer): this;

	/**
	 * @since 8.0
	 */
	initWithInputPortsOutput(ports: NSArray<AVCaptureInputPort> | AVCaptureInputPort[], output: AVCaptureOutput): this;

	isVideoRotationAngleSupported(videoRotationAngle: number): boolean;
}

/**
 * @since 11.0
 */
declare class AVCaptureDataOutputSynchronizer extends NSObject {

	static alloc(): AVCaptureDataOutputSynchronizer; // inherited from NSObject

	static new(): AVCaptureDataOutputSynchronizer; // inherited from NSObject

	readonly dataOutputs: NSArray<AVCaptureOutput>;

	readonly delegate: AVCaptureDataOutputSynchronizerDelegate;

	readonly delegateCallbackQueue: NSObject & OS_dispatch_queue;

	constructor(o: { dataOutputs: NSArray<AVCaptureOutput> | AVCaptureOutput[]; });

	initWithDataOutputs(dataOutputs: NSArray<AVCaptureOutput> | AVCaptureOutput[]): this;

	setDelegateQueue(delegate: AVCaptureDataOutputSynchronizerDelegate, delegateCallbackQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 11.0
 */
interface AVCaptureDataOutputSynchronizerDelegate extends NSObjectProtocol {

	dataOutputSynchronizerDidOutputSynchronizedDataCollection(synchronizer: AVCaptureDataOutputSynchronizer, synchronizedDataCollection: AVCaptureSynchronizedDataCollection): void;
}
declare var AVCaptureDataOutputSynchronizerDelegate: {

	prototype: AVCaptureDataOutputSynchronizerDelegate;
};

/**
 * @since 17.0
 */
declare class AVCaptureDeferredPhotoProxy extends AVCapturePhoto {

	static alloc(): AVCaptureDeferredPhotoProxy; // inherited from NSObject

	static new(): AVCaptureDeferredPhotoProxy; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class AVCaptureDepthDataOutput extends AVCaptureOutput {

	static alloc(): AVCaptureDepthDataOutput; // inherited from NSObject

	static new(): AVCaptureDepthDataOutput; // inherited from NSObject

	alwaysDiscardsLateDepthData: boolean;

	readonly delegate: AVCaptureDepthDataOutputDelegate;

	readonly delegateCallbackQueue: NSObject & OS_dispatch_queue;

	filteringEnabled: boolean;

	setDelegateCallbackQueue(delegate: AVCaptureDepthDataOutputDelegate, callbackQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 11.0
 */
interface AVCaptureDepthDataOutputDelegate extends NSObjectProtocol {

	depthDataOutputDidDropDepthDataTimestampConnectionReason?(output: AVCaptureDepthDataOutput, depthData: AVDepthData, timestamp: CMTime, connection: AVCaptureConnection, reason: AVCaptureOutputDataDroppedReason): void;

	depthDataOutputDidOutputDepthDataTimestampConnection?(output: AVCaptureDepthDataOutput, depthData: AVDepthData, timestamp: CMTime, connection: AVCaptureConnection): void;
}
declare var AVCaptureDepthDataOutputDelegate: {

	prototype: AVCaptureDepthDataOutputDelegate;
};

/**
 * @since 4.0
 */
declare class AVCaptureDevice extends NSObject {

	static alloc(): AVCaptureDevice; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static authorizationStatusForMediaType(mediaType: string): AVAuthorizationStatus;

	/**
	 * @since 10.0
	 */
	static defaultDeviceWithDeviceTypeMediaTypePosition(deviceType: string, mediaType: string, position: AVCaptureDevicePosition): AVCaptureDevice;

	static defaultDeviceWithMediaType(mediaType: string): AVCaptureDevice;

	static deviceWithUniqueID(deviceUniqueID: string): AVCaptureDevice;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	static devices(): NSArray<AVCaptureDevice>;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	static devicesWithMediaType(mediaType: string): NSArray<AVCaptureDevice>;

	/**
	 * @since 13.0
	 */
	static extrinsicMatrixFromDeviceToDevice(fromDevice: AVCaptureDevice, toDevice: AVCaptureDevice): NSData;

	static new(): AVCaptureDevice; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static requestAccessForMediaTypeCompletionHandler(mediaType: string, handler: (p1: boolean) => void): void;

	/**
	 * @since 15.0
	 */
	static showSystemUserInterface(systemUserInterface: AVCaptureSystemUserInterface): void;

	/**
	 * @since 8.0
	 */
	readonly ISO: number;

	/**
	 * @since 10.0
	 */
	activeColorSpace: AVCaptureColorSpace;

	/**
	 * @since 11.0
	 */
	activeDepthDataFormat: AVCaptureDeviceFormat;

	/**
	 * @since 12.0
	 */
	activeDepthDataMinFrameDuration: CMTime;

	/**
	 * @since 7.0
	 */
	activeFormat: AVCaptureDeviceFormat;

	/**
	 * @since 12.0
	 */
	activeMaxExposureDuration: CMTime;

	/**
	 * @since 15.0
	 */
	readonly activePrimaryConstituentDevice: AVCaptureDevice;

	/**
	 * @since 15.0
	 */
	readonly activePrimaryConstituentDeviceRestrictedSwitchingBehaviorConditions: AVCapturePrimaryConstituentDeviceRestrictedSwitchingBehaviorConditions;

	/**
	 * @since 15.0
	 */
	readonly activePrimaryConstituentDeviceSwitchingBehavior: AVCapturePrimaryConstituentDeviceSwitchingBehavior;

	/**
	 * @since 7.0
	 */
	activeVideoMaxFrameDuration: CMTime;

	/**
	 * @since 7.0
	 */
	activeVideoMinFrameDuration: CMTime;

	readonly adjustingExposure: boolean;

	readonly adjustingFocus: boolean;

	readonly adjustingWhiteBalance: boolean;

	/**
	 * @since 7.0
	 */
	autoFocusRangeRestriction: AVCaptureAutoFocusRangeRestriction;

	/**
	 * @since 7.0
	 */
	readonly autoFocusRangeRestrictionSupported: boolean;

	/**
	 * @since 18.0
	 */
	autoVideoFrameRateEnabled: boolean;

	/**
	 * @since 15.4
	 */
	automaticallyAdjustsFaceDrivenAutoExposureEnabled: boolean;

	/**
	 * @since 15.4
	 */
	automaticallyAdjustsFaceDrivenAutoFocusEnabled: boolean;

	/**
	 * @since 8.0
	 */
	automaticallyAdjustsVideoHDREnabled: boolean;

	/**
	 * @since 6.0
	 */
	automaticallyEnablesLowLightBoostWhenAvailable: boolean;

	/**
	 * @since 17.0
	 */
	readonly availableReactionTypes: NSSet<string>;

	/**
	 * @since 18.0
	 */
	readonly backgroundReplacementActive: boolean;

	/**
	 * @since 17.0
	 */
	readonly canPerformReactionEffects: boolean;

	/**
	 * @since 14.5
	 */
	readonly centerStageActive: boolean;

	/**
	 * @since 16.4
	 */
	centerStageRectOfInterest: CGRect;

	/**
	 * @since 16.0
	 */
	readonly companionDeskViewCamera: AVCaptureDevice;

	readonly connected: boolean;

	/**
	 * @since 13.0
	 */
	readonly constituentDevices: NSArray<AVCaptureDevice>;

	/**
	 * @since 16.0
	 */
	readonly continuityCamera: boolean;

	/**
	 * @since 10.0
	 */
	readonly deviceType: string;

	/**
	 * @since 8.0
	 */
	readonly deviceWhiteBalanceGains: AVCaptureWhiteBalanceGains;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	readonly dualCameraSwitchOverVideoZoomFactor: number;

	/**
	 * @since 8.0
	 */
	readonly exposureDuration: CMTime;

	exposureMode: AVCaptureExposureMode;

	exposurePointOfInterest: CGPoint;

	readonly exposurePointOfInterestSupported: boolean;

	/**
	 * @since 8.0
	 */
	readonly exposureTargetBias: number;

	/**
	 * @since 8.0
	 */
	readonly exposureTargetOffset: number;

	/**
	 * @since 15.4
	 */
	faceDrivenAutoExposureEnabled: boolean;

	/**
	 * @since 15.4
	 */
	faceDrivenAutoFocusEnabled: boolean;

	/**
	 * @since 15.0
	 */
	fallbackPrimaryConstituentDevices: NSArray<AVCaptureDevice>;

	/**
	 * @since 5.0
	 * @deprecated 10.0
	 */
	readonly flashActive: boolean;

	/**
	 * @since 5.0
	 */
	readonly flashAvailable: boolean;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	flashMode: AVCaptureFlashMode;

	focusMode: AVCaptureFocusMode;

	focusPointOfInterest: CGPoint;

	readonly focusPointOfInterestSupported: boolean;

	/**
	 * @since 7.0
	 */
	readonly formats: NSArray<AVCaptureDeviceFormat>;

	/**
	 * @since 13.0
	 */
	geometricDistortionCorrectionEnabled: boolean;

	/**
	 * @since 13.0
	 */
	readonly geometricDistortionCorrectionSupported: boolean;

	/**
	 * @since 13.0
	 */
	globalToneMappingEnabled: boolean;

	/**
	 * @since 8.0
	 */
	readonly grayWorldDeviceWhiteBalanceGains: AVCaptureWhiteBalanceGains;

	readonly hasFlash: boolean;

	readonly hasTorch: boolean;

	/**
	 * @since 8.0
	 */
	readonly lensAperture: number;

	/**
	 * @since 8.0
	 */
	readonly lensPosition: number;

	readonly localizedName: string;

	/**
	 * @since 10.0
	 */
	readonly lockingFocusWithCustomLensPositionSupported: boolean;

	/**
	 * @since 10.0
	 */
	readonly lockingWhiteBalanceWithCustomDeviceGainsSupported: boolean;

	/**
	 * @since 6.0
	 */
	readonly lowLightBoostEnabled: boolean;

	/**
	 * @since 6.0
	 */
	readonly lowLightBoostSupported: boolean;

	/**
	 * @since 14.0
	 */
	readonly manufacturer: string;

	/**
	 * @since 11.0
	 */
	readonly maxAvailableVideoZoomFactor: number;

	/**
	 * @since 8.0
	 */
	readonly maxExposureTargetBias: number;

	/**
	 * @since 8.0
	 */
	readonly maxWhiteBalanceGain: number;

	/**
	 * @since 11.0
	 */
	readonly minAvailableVideoZoomFactor: number;

	/**
	 * @since 8.0
	 */
	readonly minExposureTargetBias: number;

	/**
	 * @since 15.0
	 */
	readonly minimumFocusDistance: number;

	readonly modelID: string;

	/**
	 * @since 15.0
	 */
	readonly portraitEffectActive: boolean;

	readonly position: AVCaptureDevicePosition;

	/**
	 * @since 15.0
	 */
	readonly primaryConstituentDeviceRestrictedSwitchingBehaviorConditions: AVCapturePrimaryConstituentDeviceRestrictedSwitchingBehaviorConditions;

	/**
	 * @since 15.0
	 */
	readonly primaryConstituentDeviceSwitchingBehavior: AVCapturePrimaryConstituentDeviceSwitchingBehavior;

	/**
	 * @since 7.0
	 */
	readonly rampingVideoZoom: boolean;

	/**
	 * @since 17.0
	 */
	readonly reactionEffectsInProgress: NSArray<AVCaptureReactionEffectState>;

	/**
	 * @since 7.0
	 */
	smoothAutoFocusEnabled: boolean;

	/**
	 * @since 7.0
	 */
	readonly smoothAutoFocusSupported: boolean;

	/**
	 * @since 18.0
	 */
	readonly spatialCaptureDiscomfortReasons: NSSet<string>;

	/**
	 * @since 16.0
	 */
	readonly studioLightActive: boolean;

	/**
	 * @since 5.0
	 */
	subjectAreaChangeMonitoringEnabled: boolean;

	/**
	 * @since 15.0
	 */
	readonly supportedFallbackPrimaryConstituentDevices: NSArray<AVCaptureDevice>;

	/**
	 * @since 14.0
	 */
	readonly suspended: boolean;

	/**
	 * @since 11.1
	 */
	readonly systemPressureState: AVCaptureSystemPressureState;

	/**
	 * @since 6.0
	 */
	readonly torchActive: boolean;

	/**
	 * @since 5.0
	 */
	readonly torchAvailable: boolean;

	/**
	 * @since 5.0
	 */
	readonly torchLevel: number;

	torchMode: AVCaptureTorchMode;

	readonly uniqueID: string;

	/**
	 * @since 8.0
	 */
	videoHDREnabled: boolean;

	/**
	 * @since 7.0
	 */
	videoZoomFactor: number;

	/**
	 * @since 13.0
	 */
	readonly virtualDevice: boolean;

	/**
	 * @since 13.0
	 */
	readonly virtualDeviceSwitchOverVideoZoomFactors: NSArray<number>;

	whiteBalanceMode: AVCaptureWhiteBalanceMode;

	/**
	 * @since 15.0
	 */
	static readonly activeMicrophoneMode: AVCaptureMicrophoneMode;

	/**
	 * @since 18.0
	 */
	static readonly backgroundReplacementEnabled: boolean;

	/**
	 * @since 14.5
	 */
	static centerStageControlMode: AVCaptureCenterStageControlMode;

	/**
	 * @since 14.5
	 */
	static centerStageEnabled: boolean;

	/**
	 * @since 15.0
	 */
	static readonly portraitEffectEnabled: boolean;

	/**
	 * @since 15.0
	 */
	static readonly preferredMicrophoneMode: AVCaptureMicrophoneMode;

	/**
	 * @since 17.0
	 */
	static readonly reactionEffectGesturesEnabled: boolean;

	/**
	 * @since 17.0
	 */
	static readonly reactionEffectsEnabled: boolean;

	/**
	 * @since 16.0
	 */
	static readonly studioLightEnabled: boolean;

	/**
	 * @since 17.0
	 */
	static readonly systemPreferredCamera: AVCaptureDevice;

	/**
	 * @since 17.0
	 */
	static userPreferredCamera: AVCaptureDevice;

	/**
	 * @since 7.0
	 */
	cancelVideoZoomRamp(): void;

	/**
	 * @since 8.0
	 */
	chromaticityValuesForDeviceWhiteBalanceGains(whiteBalanceGains: AVCaptureWhiteBalanceGains): AVCaptureWhiteBalanceChromaticityValues;

	/**
	 * @since 8.0
	 */
	deviceWhiteBalanceGainsForChromaticityValues(chromaticityValues: AVCaptureWhiteBalanceChromaticityValues): AVCaptureWhiteBalanceGains;

	/**
	 * @since 8.0
	 */
	deviceWhiteBalanceGainsForTemperatureAndTintValues(tempAndTintValues: AVCaptureWhiteBalanceTemperatureAndTintValues): AVCaptureWhiteBalanceGains;

	hasMediaType(mediaType: string): boolean;

	isExposureModeSupported(exposureMode: AVCaptureExposureMode): boolean;

	/**
	 * @since 4.0
	 * @deprecated 10.0
	 */
	isFlashModeSupported(flashMode: AVCaptureFlashMode): boolean;

	isFocusModeSupported(focusMode: AVCaptureFocusMode): boolean;

	isTorchModeSupported(torchMode: AVCaptureTorchMode): boolean;

	isWhiteBalanceModeSupported(whiteBalanceMode: AVCaptureWhiteBalanceMode): boolean;

	lockForConfiguration(): boolean;

	/**
	 * @since 17.0
	 */
	performEffectForReaction(reactionType: string): void;

	/**
	 * @since 7.0
	 */
	rampToVideoZoomFactorWithRate(factor: number, rate: number): void;

	/**
	 * @since 8.0
	 */
	setExposureModeCustomWithDurationISOCompletionHandler(duration: CMTime, ISO: number, handler: (p1: CMTime) => void): void;

	/**
	 * @since 8.0
	 */
	setExposureTargetBiasCompletionHandler(bias: number, handler: (p1: CMTime) => void): void;

	/**
	 * @since 8.0
	 */
	setFocusModeLockedWithLensPositionCompletionHandler(lensPosition: number, handler: (p1: CMTime) => void): void;

	/**
	 * @since 15.0
	 */
	setPrimaryConstituentDeviceSwitchingBehaviorRestrictedSwitchingBehaviorConditions(switchingBehavior: AVCapturePrimaryConstituentDeviceSwitchingBehavior, restrictedSwitchingBehaviorConditions: AVCapturePrimaryConstituentDeviceRestrictedSwitchingBehaviorConditions): void;

	/**
	 * @since 6.0
	 */
	setTorchModeOnWithLevelError(torchLevel: number): boolean;

	/**
	 * @since 8.0
	 */
	setWhiteBalanceModeLockedWithDeviceWhiteBalanceGainsCompletionHandler(whiteBalanceGains: AVCaptureWhiteBalanceGains, handler: (p1: CMTime) => void): void;

	supportsAVCaptureSessionPreset(preset: string): boolean;

	/**
	 * @since 8.0
	 */
	temperatureAndTintValuesForDeviceWhiteBalanceGains(whiteBalanceGains: AVCaptureWhiteBalanceGains): AVCaptureWhiteBalanceTemperatureAndTintValues;

	unlockForConfiguration(): void;
}

/**
 * @since 10.0
 */
declare class AVCaptureDeviceDiscoverySession extends NSObject {

	static alloc(): AVCaptureDeviceDiscoverySession; // inherited from NSObject

	static discoverySessionWithDeviceTypesMediaTypePosition(deviceTypes: NSArray<string> | string[], mediaType: string, position: AVCaptureDevicePosition): AVCaptureDeviceDiscoverySession;

	static new(): AVCaptureDeviceDiscoverySession; // inherited from NSObject

	readonly devices: NSArray<AVCaptureDevice>;

	/**
	 * @since 13.0
	 */
	readonly supportedMultiCamDeviceSets: NSArray<NSSet<AVCaptureDevice>>;
}

/**
 * @since 7.0
 */
declare class AVCaptureDeviceFormat extends NSObject {

	static alloc(): AVCaptureDeviceFormat; // inherited from NSObject

	static new(): AVCaptureDeviceFormat; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	readonly autoFocusSystem: AVCaptureAutoFocusSystem;

	/**
	 * @since 18.0
	 */
	readonly autoVideoFrameRateSupported: boolean;

	/**
	 * @since 18.0
	 */
	readonly backgroundReplacementSupported: boolean;

	/**
	 * @since 14.5
	 */
	readonly centerStageSupported: boolean;

	readonly formatDescription: any;

	/**
	 * @since 13.0
	 */
	readonly geometricDistortionCorrectedVideoFieldOfView: number;

	/**
	 * @since 13.0
	 */
	readonly globalToneMappingSupported: boolean;

	/**
	 * @since 15.0
	 */
	readonly highPhotoQualitySupported: boolean;

	/**
	 * @since 8.0
	 * @deprecated 16.0
	 */
	readonly highResolutionStillImageDimensions: CMVideoDimensions;

	/**
	 * @since 13.0
	 */
	readonly highestPhotoQualitySupported: boolean;

	/**
	 * @since 8.0
	 */
	readonly maxExposureDuration: CMTime;

	/**
	 * @since 8.0
	 */
	readonly maxISO: number;

	readonly mediaType: string;

	/**
	 * @since 8.0
	 */
	readonly minExposureDuration: CMTime;

	/**
	 * @since 8.0
	 */
	readonly minISO: number;

	/**
	 * @since 13.0
	 */
	readonly multiCamSupported: boolean;

	/**
	 * @since 15.0
	 */
	readonly portraitEffectSupported: boolean;

	/**
	 * @since 12.0
	 */
	readonly portraitEffectsMatteStillImageDeliverySupported: boolean;

	/**
	 * @since 17.0
	 */
	readonly reactionEffectsSupported: boolean;

	/**
	 * @since 16.0
	 */
	readonly secondaryNativeResolutionZoomFactors: NSArray<number>;

	readonly spatialVideoCaptureSupported: boolean;

	/**
	 * @since 16.0
	 */
	readonly studioLightSupported: boolean;

	/**
	 * @since 10.0
	 */
	readonly supportedColorSpaces: NSArray<number>;

	/**
	 * @since 11.0
	 */
	readonly supportedDepthDataFormats: NSArray<AVCaptureDeviceFormat>;

	/**
	 * @since 16.0
	 */
	readonly supportedMaxPhotoDimensions: NSArray<NSValue>;

	/**
	 * @since 16.0
	 * @deprecated 17.2
	 */
	readonly supportedVideoZoomFactorsForDepthDataDelivery: NSArray<number>;

	/**
	 * @since 17.2
	 */
	readonly supportedVideoZoomRangesForDepthDataDelivery: NSArray<AVZoomRange>;

	/**
	 * @since 11.0
	 */
	readonly unsupportedCaptureOutputClasses: NSArray<typeof NSObject>;

	readonly videoBinned: boolean;

	readonly videoFieldOfView: number;

	/**
	 * @since 18.0
	 */
	readonly videoFrameRateRangeForBackgroundReplacement: AVFrameRateRange;

	/**
	 * @since 14.5
	 */
	readonly videoFrameRateRangeForCenterStage: AVFrameRateRange;

	/**
	 * @since 15.0
	 */
	readonly videoFrameRateRangeForPortraitEffect: AVFrameRateRange;

	/**
	 * @since 17.0
	 */
	readonly videoFrameRateRangeForReactionEffectsInProgress: AVFrameRateRange;

	/**
	 * @since 16.0
	 */
	readonly videoFrameRateRangeForStudioLight: AVFrameRateRange;

	/**
	 * @since 8.0
	 */
	readonly videoHDRSupported: boolean;

	readonly videoMaxZoomFactor: number;

	/**
	 * @since 14.5
	 */
	readonly videoMaxZoomFactorForCenterStage: number;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	readonly videoMaxZoomFactorForDepthDataDelivery: number;

	/**
	 * @since 14.5
	 */
	readonly videoMinZoomFactorForCenterStage: number;

	/**
	 * @since 11.0
	 * @deprecated 16.0
	 */
	readonly videoMinZoomFactorForDepthDataDelivery: number;

	/**
	 * @since 7.0
	 * @deprecated 8.0
	 */
	readonly videoStabilizationSupported: boolean;

	readonly videoSupportedFrameRateRanges: NSArray<AVFrameRateRange>;

	readonly videoZoomFactorUpscaleThreshold: number;

	/**
	 * @since 17.2
	 */
	readonly zoomFactorsOutsideOfVideoZoomRangesForDepthDeliverySupported: boolean;

	/**
	 * @since 8.0
	 */
	isVideoStabilizationModeSupported(videoStabilizationMode: AVCaptureVideoStabilizationMode): boolean;
}

/**
 * @since 4.0
 */
declare class AVCaptureDeviceInput extends AVCaptureInput {

	static alloc(): AVCaptureDeviceInput; // inherited from NSObject

	static deviceInputWithDeviceError(device: AVCaptureDevice): AVCaptureDeviceInput;

	static new(): AVCaptureDeviceInput; // inherited from NSObject

	readonly device: AVCaptureDevice;

	/**
	 * @since 18.0
	 */
	multichannelAudioMode: AVCaptureMultichannelAudioMode;

	/**
	 * @since 12.0
	 */
	unifiedAutoExposureDefaultsEnabled: boolean;

	/**
	 * @since 13.0
	 */
	videoMinFrameDurationOverride: CMTime;

	constructor(o: { device: AVCaptureDevice; });

	initWithDeviceError(device: AVCaptureDevice): this;

	/**
	 * @since 18.0
	 */
	isMultichannelAudioModeSupported(multichannelAudioMode: AVCaptureMultichannelAudioMode): boolean;

	/**
	 * @since 13.0
	 */
	portsWithMediaTypeSourceDeviceTypeSourceDevicePosition(mediaType: string, sourceDeviceType: string, sourceDevicePosition: AVCaptureDevicePosition): NSArray<AVCaptureInputPort>;
}

/**
 * @since 4.0
 */
declare const enum AVCaptureDevicePosition {

	Unspecified = 0,

	Back = 1,

	Front = 2
}

/**
 * @since 17.0
 */
declare class AVCaptureDeviceRotationCoordinator extends NSObject {

	static alloc(): AVCaptureDeviceRotationCoordinator; // inherited from NSObject

	static new(): AVCaptureDeviceRotationCoordinator; // inherited from NSObject

	readonly device: AVCaptureDevice;

	readonly previewLayer: CALayer;

	readonly videoRotationAngleForHorizonLevelCapture: number;

	readonly videoRotationAngleForHorizonLevelPreview: number;

	constructor(o: { device: AVCaptureDevice; previewLayer: CALayer; });

	initWithDevicePreviewLayer(device: AVCaptureDevice, previewLayer: CALayer): this;
}

/**
 * @since 5.0
 */
declare var AVCaptureDeviceSubjectAreaDidChangeNotification: string;

/**
 * @since 10.2
 */
declare var AVCaptureDeviceTypeBuiltInDualCamera: string;

/**
 * @since 13.0
 */
declare var AVCaptureDeviceTypeBuiltInDualWideCamera: string;

/**
 * @since 10.0
 * @deprecated 10.2
 */
declare var AVCaptureDeviceTypeBuiltInDuoCamera: string;

/**
 * @since 15.4
 */
declare var AVCaptureDeviceTypeBuiltInLiDARDepthCamera: string;

/**
 * @since 10.0
 * @deprecated 17.0
 */
declare var AVCaptureDeviceTypeBuiltInMicrophone: string;

/**
 * @since 10.0
 */
declare var AVCaptureDeviceTypeBuiltInTelephotoCamera: string;

/**
 * @since 13.0
 */
declare var AVCaptureDeviceTypeBuiltInTripleCamera: string;

/**
 * @since 11.1
 */
declare var AVCaptureDeviceTypeBuiltInTrueDepthCamera: string;

/**
 * @since 13.0
 */
declare var AVCaptureDeviceTypeBuiltInUltraWideCamera: string;

/**
 * @since 10.0
 */
declare var AVCaptureDeviceTypeBuiltInWideAngleCamera: string;

/**
 * @since 17.0
 */
declare var AVCaptureDeviceTypeContinuityCamera: string;

/**
 * @since 17.0
 */
declare var AVCaptureDeviceTypeExternal: string;

/**
 * @since 17.0
 */
declare var AVCaptureDeviceTypeMicrophone: string;

/**
 * @since 4.0
 */
declare var AVCaptureDeviceWasConnectedNotification: string;

/**
 * @since 4.0
 */
declare var AVCaptureDeviceWasDisconnectedNotification: string;

/**
 * @since 8.0
 */
declare var AVCaptureExposureDurationCurrent: CMTime;

/**
 * @since 4.0
 */
declare const enum AVCaptureExposureMode {

	Locked = 0,

	AutoExpose = 1,

	ContinuousAutoExposure = 2,

	Custom = 3
}

/**
 * @since 8.0
 */
declare var AVCaptureExposureTargetBiasCurrent: number;

/**
 * @since 4.0
 */
declare class AVCaptureFileOutput extends AVCaptureOutput {

	static alloc(): AVCaptureFileOutput; // inherited from NSObject

	static new(): AVCaptureFileOutput; // inherited from NSObject

	maxRecordedDuration: CMTime;

	maxRecordedFileSize: number;

	minFreeDiskSpaceLimit: number;

	readonly outputFileURL: NSURL;

	readonly recordedDuration: CMTime;

	readonly recordedFileSize: number;

	readonly recording: boolean;

	startRecordingToOutputFileURLRecordingDelegate(outputFileURL: NSURL, delegate: AVCaptureFileOutputRecordingDelegate): void;

	stopRecording(): void;
}

/**
 * @since 4.0
 */
interface AVCaptureFileOutputRecordingDelegate extends NSObjectProtocol {

	captureOutputDidFinishRecordingToOutputFileAtURLFromConnectionsError(output: AVCaptureFileOutput, outputFileURL: NSURL, connections: NSArray<AVCaptureConnection> | AVCaptureConnection[], error: NSError): void;

	captureOutputDidStartRecordingToOutputFileAtURLFromConnections?(output: AVCaptureFileOutput, fileURL: NSURL, connections: NSArray<AVCaptureConnection> | AVCaptureConnection[]): void;
}
declare var AVCaptureFileOutputRecordingDelegate: {

	prototype: AVCaptureFileOutputRecordingDelegate;
};

/**
 * @since 4.0
 */
declare const enum AVCaptureFlashMode {

	Off = 0,

	On = 1,

	Auto = 2
}

/**
 * @since 4.0
 */
declare const enum AVCaptureFocusMode {

	Locked = 0,

	AutoFocus = 1,

	ContinuousAutoFocus = 2
}

/**
 * @since 8.0
 */
declare var AVCaptureISOCurrent: number;

/**
 * @since 4.0
 */
declare class AVCaptureInput extends NSObject {

	static alloc(): AVCaptureInput; // inherited from NSObject

	static new(): AVCaptureInput; // inherited from NSObject

	readonly ports: NSArray<AVCaptureInputPort>;
}

/**
 * @since 4.0
 */
declare class AVCaptureInputPort extends NSObject {

	static alloc(): AVCaptureInputPort; // inherited from NSObject

	static new(): AVCaptureInputPort; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly clock: any;

	enabled: boolean;

	readonly formatDescription: any;

	readonly input: AVCaptureInput;

	readonly mediaType: string;

	/**
	 * @since 13.0
	 */
	readonly sourceDevicePosition: AVCaptureDevicePosition;

	/**
	 * @since 13.0
	 */
	readonly sourceDeviceType: string;
}

/**
 * @since 4.0
 */
declare var AVCaptureInputPortFormatDescriptionDidChangeNotification: string;

/**
 * @since 8.0
 */
declare var AVCaptureLensPositionCurrent: number;

/**
 * @since 11.0
 */
declare const enum AVCaptureLensStabilizationStatus {

	Unsupported = 0,

	Off = 1,

	Active = 2,

	OutOfRange = 3,

	Unavailable = 4
}

/**
 * @since 8.0
 */
declare class AVCaptureManualExposureBracketedStillImageSettings extends AVCaptureBracketedStillImageSettings {

	static alloc(): AVCaptureManualExposureBracketedStillImageSettings; // inherited from NSObject

	static manualExposureSettingsWithExposureDurationISO(duration: CMTime, ISO: number): AVCaptureManualExposureBracketedStillImageSettings;

	static new(): AVCaptureManualExposureBracketedStillImageSettings; // inherited from NSObject

	readonly ISO: number;

	readonly exposureDuration: CMTime;
}

/**
 * @since 6.0
 */
declare var AVCaptureMaxAvailableTorchLevel: number;

/**
 * @since 9.0
 */
declare class AVCaptureMetadataInput extends AVCaptureInput {

	static alloc(): AVCaptureMetadataInput; // inherited from NSObject

	static metadataInputWithFormatDescriptionClock(desc: any, clock: any): AVCaptureMetadataInput;

	static new(): AVCaptureMetadataInput; // inherited from NSObject

	constructor(o: { formatDescription: any; clock: any; });

	appendTimedMetadataGroupError(metadata: AVTimedMetadataGroup): boolean;

	initWithFormatDescriptionClock(desc: any, clock: any): this;
}

/**
 * @since 6.0
 */
declare class AVCaptureMetadataOutput extends AVCaptureOutput {

	static alloc(): AVCaptureMetadataOutput; // inherited from NSObject

	static new(): AVCaptureMetadataOutput; // inherited from NSObject

	readonly availableMetadataObjectTypes: NSArray<string>;

	metadataObjectTypes: NSArray<string>;

	readonly metadataObjectsCallbackQueue: NSObject & OS_dispatch_queue;

	readonly metadataObjectsDelegate: AVCaptureMetadataOutputObjectsDelegate;

	/**
	 * @since 7.0
	 */
	rectOfInterest: CGRect;

	setMetadataObjectsDelegateQueue(objectsDelegate: AVCaptureMetadataOutputObjectsDelegate, objectsCallbackQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 6.0
 */
interface AVCaptureMetadataOutputObjectsDelegate extends NSObjectProtocol {

	captureOutputDidOutputMetadataObjectsFromConnection?(output: AVCaptureOutput, metadataObjects: NSArray<AVMetadataObject> | AVMetadataObject[], connection: AVCaptureConnection): void;
}
declare var AVCaptureMetadataOutputObjectsDelegate: {

	prototype: AVCaptureMetadataOutputObjectsDelegate;
};

/**
 * @since 15.0
 */
declare const enum AVCaptureMicrophoneMode {

	Standard = 0,

	WideSpectrum = 1,

	VoiceIsolation = 2
}

/**
 * @since 4.0
 */
declare class AVCaptureMovieFileOutput extends AVCaptureFileOutput {

	static alloc(): AVCaptureMovieFileOutput; // inherited from NSObject

	static new(): AVCaptureMovieFileOutput; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly availableVideoCodecTypes: NSArray<string>;

	metadata: NSArray<AVMetadataItem>;

	movieFragmentInterval: CMTime;

	/**
	 * @since 15.0
	 */
	readonly primaryConstituentDeviceRestrictedSwitchingBehaviorConditionsForRecording: AVCapturePrimaryConstituentDeviceRestrictedSwitchingBehaviorConditions;

	/**
	 * @since 15.0
	 */
	readonly primaryConstituentDeviceSwitchingBehaviorForRecording: AVCapturePrimaryConstituentDeviceSwitchingBehavior;

	/**
	 * @since 15.0
	 */
	primaryConstituentDeviceSwitchingBehaviorForRecordingEnabled: boolean;

	/**
	 * @since 18.0
	 */
	spatialVideoCaptureEnabled: boolean;

	/**
	 * @since 18.0
	 */
	readonly spatialVideoCaptureSupported: boolean;

	/**
	 * @since 10.0
	 */
	outputSettingsForConnection(connection: AVCaptureConnection): NSDictionary<string, any>;

	/**
	 * @since 9.0
	 */
	recordsVideoOrientationAndMirroringChangesAsMetadataTrackForConnection(connection: AVCaptureConnection): boolean;

	/**
	 * @since 10.0
	 */
	setOutputSettingsForConnection(outputSettings: NSDictionary<string, any>, connection: AVCaptureConnection): void;

	/**
	 * @since 15.0
	 */
	setPrimaryConstituentDeviceSwitchingBehaviorForRecordingRestrictedSwitchingBehaviorConditions(switchingBehavior: AVCapturePrimaryConstituentDeviceSwitchingBehavior, restrictedSwitchingBehaviorConditions: AVCapturePrimaryConstituentDeviceRestrictedSwitchingBehaviorConditions): void;

	/**
	 * @since 9.0
	 */
	setRecordsVideoOrientationAndMirroringChangesAsMetadataTrackForConnection(doRecordChanges: boolean, connection: AVCaptureConnection): void;

	/**
	 * @since 12.0
	 */
	supportedOutputSettingsKeysForConnection(connection: AVCaptureConnection): NSArray<string>;
}

/**
 * @since 13.0
 */
declare class AVCaptureMultiCamSession extends AVCaptureSession {

	static alloc(): AVCaptureMultiCamSession; // inherited from NSObject

	static new(): AVCaptureMultiCamSession; // inherited from NSObject

	readonly systemPressureCost: number;

	static readonly multiCamSupported: boolean;
}

/**
 * @since 18.0
 */
declare const enum AVCaptureMultichannelAudioMode {

	None = 0,

	Stereo = 1
}

/**
 * @since 4.0
 */
declare class AVCaptureOutput extends NSObject {

	static alloc(): AVCaptureOutput; // inherited from NSObject

	static new(): AVCaptureOutput; // inherited from NSObject

	readonly connections: NSArray<AVCaptureConnection>;

	/**
	 * @since 5.0
	 */
	connectionWithMediaType(mediaType: string): AVCaptureConnection;

	/**
	 * @since 7.0
	 */
	metadataOutputRectOfInterestForRect(rectInOutputCoordinates: CGRect): CGRect;

	/**
	 * @since 7.0
	 */
	rectForMetadataOutputRectOfInterest(rectInMetadataOutputCoordinates: CGRect): CGRect;

	/**
	 * @since 6.0
	 */
	transformedMetadataObjectForMetadataObjectConnection(metadataObject: AVMetadataObject, connection: AVCaptureConnection): AVMetadataObject;
}

/**
 * @since 11.0
 */
declare const enum AVCaptureOutputDataDroppedReason {

	None = 0,

	LateData = 1,

	OutOfBuffers = 2,

	Discontinuity = 3
}

/**
 * @since 11.0
 */
declare class AVCapturePhoto extends NSObject {

	static alloc(): AVCapturePhoto; // inherited from NSObject

	static new(): AVCapturePhoto; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly bracketSettings: AVCaptureBracketedStillImageSettings;

	readonly cameraCalibrationData: AVCameraCalibrationData;

	/**
	 * @since 18.0
	 */
	readonly constantColorCenterWeightedMeanConfidenceLevel: number;

	/**
	 * @since 18.0
	 */
	readonly constantColorConfidenceMap: any;

	/**
	 * @since 18.0
	 */
	readonly constantColorFallbackPhoto: boolean;

	readonly depthData: AVDepthData;

	readonly embeddedThumbnailPhotoFormat: NSDictionary<string, any>;

	/**
	 * @since 11.0
	 */
	readonly lensStabilizationStatus: AVCaptureLensStabilizationStatus;

	readonly metadata: NSDictionary<string, any>;

	readonly photoCount: number;

	readonly pixelBuffer: any;

	/**
	 * @since 12.0
	 */
	readonly portraitEffectsMatte: AVPortraitEffectsMatte;

	readonly previewPixelBuffer: any;

	readonly rawPhoto: boolean;

	readonly resolvedSettings: AVCaptureResolvedPhotoSettings;

	/**
	 * @since 11.0
	 */
	readonly sequenceCount: number;

	readonly sourceDeviceType: string;

	readonly timestamp: CMTime;

	/**
	 * @since 11.0
	 */
	CGImageRepresentation(): any;

	/**
	 * @since 11.0
	 */
	fileDataRepresentation(): NSData;

	/**
	 * @since 12.0
	 */
	fileDataRepresentationWithCustomizer(customizer: AVCapturePhotoFileDataRepresentationCustomizer): NSData;

	/**
	 * @since 11.0
	 * @deprecated 12.0
	 */
	fileDataRepresentationWithReplacementMetadataReplacementEmbeddedThumbnailPhotoFormatReplacementEmbeddedThumbnailPixelBufferReplacementDepthData(replacementMetadata: NSDictionary<string, any>, replacementEmbeddedThumbnailPhotoFormat: NSDictionary<string, any>, replacementEmbeddedThumbnailPixelBuffer: any, replacementDepthData: AVDepthData): NSData;

	/**
	 * @since 11.0
	 */
	previewCGImageRepresentation(): any;

	/**
	 * @since 13.0
	 */
	semanticSegmentationMatteForType(semanticSegmentationMatteType: string): AVSemanticSegmentationMatte;
}

/**
 * @since 10.0
 */
declare class AVCapturePhotoBracketSettings extends AVCapturePhotoSettings {

	static alloc(): AVCapturePhotoBracketSettings; // inherited from NSObject

	static new(): AVCapturePhotoBracketSettings; // inherited from NSObject

	static photoBracketSettingsWithRawPixelFormatTypeProcessedFormatBracketedSettings(rawPixelFormatType: number, processedFormat: NSDictionary<string, any>, bracketedSettings: NSArray<AVCaptureBracketedStillImageSettings> | AVCaptureBracketedStillImageSettings[]): AVCapturePhotoBracketSettings;

	/**
	 * @since 11.0
	 */
	static photoBracketSettingsWithRawPixelFormatTypeRawFileTypeProcessedFormatProcessedFileTypeBracketedSettings(rawPixelFormatType: number, rawFileType: string, processedFormat: NSDictionary<string, any>, processedFileType: string, bracketedSettings: NSArray<AVCaptureBracketedStillImageSettings> | AVCaptureBracketedStillImageSettings[]): AVCapturePhotoBracketSettings;

	static photoSettings(): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsFromPhotoSettings(photoSettings: AVCapturePhotoSettings): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsWithFormat(format: NSDictionary<string, any>): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsWithRawPixelFormatType(rawPixelFormatType: number): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsWithRawPixelFormatTypeProcessedFormat(rawPixelFormatType: number, processedFormat: NSDictionary<string, any>): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	/**
	 * @since 11.0
	 */
	static photoSettingsWithRawPixelFormatTypeRawFileTypeProcessedFormatProcessedFileType(rawPixelFormatType: number, rawFileType: string, processedFormat: NSDictionary<string, any>, processedFileType: string): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	readonly bracketedSettings: NSArray<AVCaptureBracketedStillImageSettings>;

	lensStabilizationEnabled: boolean;
}

/**
 * @since 10.0
 */
interface AVCapturePhotoCaptureDelegate extends NSObjectProtocol {

	captureOutputDidCapturePhotoForResolvedSettings?(output: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings): void;

	captureOutputDidFinishCaptureForResolvedSettingsError?(output: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings, error: NSError): void;

	/**
	 * @since 17.0
	 */
	captureOutputDidFinishCapturingDeferredPhotoProxyError?(output: AVCapturePhotoOutput, deferredPhotoProxy: AVCaptureDeferredPhotoProxy, error: NSError): void;

	captureOutputDidFinishProcessingLivePhotoToMovieFileAtURLDurationPhotoDisplayTimeResolvedSettingsError?(output: AVCapturePhotoOutput, outputFileURL: NSURL, duration: CMTime, photoDisplayTime: CMTime, resolvedSettings: AVCaptureResolvedPhotoSettings, error: NSError): void;

	/**
	 * @since 11.0
	 */
	captureOutputDidFinishProcessingPhotoError?(output: AVCapturePhotoOutput, photo: AVCapturePhoto, error: NSError): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	captureOutputDidFinishProcessingPhotoSampleBufferPreviewPhotoSampleBufferResolvedSettingsBracketSettingsError?(output: AVCapturePhotoOutput, photoSampleBuffer: any, previewPhotoSampleBuffer: any, resolvedSettings: AVCaptureResolvedPhotoSettings, bracketSettings: AVCaptureBracketedStillImageSettings, error: NSError): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	captureOutputDidFinishProcessingRawPhotoSampleBufferPreviewPhotoSampleBufferResolvedSettingsBracketSettingsError?(output: AVCapturePhotoOutput, rawSampleBuffer: any, previewPhotoSampleBuffer: any, resolvedSettings: AVCaptureResolvedPhotoSettings, bracketSettings: AVCaptureBracketedStillImageSettings, error: NSError): void;

	captureOutputDidFinishRecordingLivePhotoMovieForEventualFileAtURLResolvedSettings?(output: AVCapturePhotoOutput, outputFileURL: NSURL, resolvedSettings: AVCaptureResolvedPhotoSettings): void;

	captureOutputWillBeginCaptureForResolvedSettings?(output: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings): void;

	captureOutputWillCapturePhotoForResolvedSettings?(output: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings): void;
}
declare var AVCapturePhotoCaptureDelegate: {

	prototype: AVCapturePhotoCaptureDelegate;
};

/**
 * @since 12.0
 */
interface AVCapturePhotoFileDataRepresentationCustomizer extends NSObjectProtocol {

	/**
	 * @since 14.3
	 */
	replacementAppleProRAWCompressionSettingsForPhotoDefaultSettingsMaximumBitDepth?(photo: AVCapturePhoto, defaultSettings: NSDictionary<string, any>, maximumBitDepth: number): NSDictionary<string, any>;

	replacementDepthDataForPhoto?(photo: AVCapturePhoto): AVDepthData;

	replacementEmbeddedThumbnailPixelBufferWithPhotoFormatForPhoto?(replacementEmbeddedThumbnailPhotoFormatOut: interop.Pointer | interop.Reference<NSDictionary<string, any>>, photo: AVCapturePhoto): any;

	replacementMetadataForPhoto?(photo: AVCapturePhoto): NSDictionary<string, any>;

	replacementPortraitEffectsMatteForPhoto?(photo: AVCapturePhoto): AVPortraitEffectsMatte;

	/**
	 * @since 13.0
	 */
	replacementSemanticSegmentationMatteOfTypeForPhoto?(semanticSegmentationMatteType: string, photo: AVCapturePhoto): AVSemanticSegmentationMatte;
}
declare var AVCapturePhotoFileDataRepresentationCustomizer: {

	prototype: AVCapturePhotoFileDataRepresentationCustomizer;
};

/**
 * @since 10.0
 */
declare class AVCapturePhotoOutput extends AVCaptureOutput {

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static DNGPhotoDataRepresentationForRawSampleBufferPreviewPhotoSampleBuffer(rawSampleBuffer: any, previewPhotoSampleBuffer: any): NSData;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static JPEGPhotoDataRepresentationForJPEGSampleBufferPreviewPhotoSampleBuffer(JPEGSampleBuffer: any, previewPhotoSampleBuffer: any): NSData;

	static alloc(): AVCapturePhotoOutput; // inherited from NSObject

	/**
	 * @since 14.3
	 */
	static isAppleProRAWPixelFormat(pixelFormat: number): boolean;

	/**
	 * @since 14.3
	 */
	static isBayerRAWPixelFormat(pixelFormat: number): boolean;

	static new(): AVCapturePhotoOutput; // inherited from NSObject

	/**
	 * @since 14.3
	 */
	appleProRAWEnabled: boolean;

	/**
	 * @since 14.3
	 */
	readonly appleProRAWSupported: boolean;

	/**
	 * @since 17.0
	 */
	autoDeferredPhotoDeliveryEnabled: boolean;

	/**
	 * @since 17.0
	 */
	readonly autoDeferredPhotoDeliverySupported: boolean;

	/**
	 * @since 12.0
	 */
	readonly autoRedEyeReductionSupported: boolean;

	/**
	 * @since 11.0
	 */
	readonly availableLivePhotoVideoCodecTypes: NSArray<string>;

	readonly availablePhotoCodecTypes: NSArray<string>;

	/**
	 * @since 11.0
	 */
	readonly availablePhotoFileTypes: NSArray<string>;

	readonly availablePhotoPixelFormatTypes: NSArray<number>;

	/**
	 * @since 11.0
	 */
	readonly availableRawPhotoFileTypes: NSArray<string>;

	readonly availableRawPhotoPixelFormatTypes: NSArray<number>;

	/**
	 * @since 13.0
	 */
	readonly availableSemanticSegmentationMatteTypes: NSArray<string>;

	/**
	 * @since 11.0
	 */
	readonly cameraCalibrationDataDeliverySupported: boolean;

	/**
	 * @since 17.0
	 */
	readonly captureReadiness: AVCapturePhotoOutputCaptureReadiness;

	/**
	 * @since 18.0
	 */
	constantColorEnabled: boolean;

	/**
	 * @since 18.0
	 */
	readonly constantColorSupported: boolean;

	/**
	 * @since 14.1
	 */
	contentAwareDistortionCorrectionEnabled: boolean;

	/**
	 * @since 14.1
	 */
	readonly contentAwareDistortionCorrectionSupported: boolean;

	/**
	 * @since 11.0
	 */
	depthDataDeliveryEnabled: boolean;

	/**
	 * @since 11.0
	 */
	readonly depthDataDeliverySupported: boolean;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	dualCameraDualPhotoDeliveryEnabled: boolean;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	readonly dualCameraDualPhotoDeliverySupported: boolean;

	/**
	 * @since 10.2
	 * @deprecated 13.0
	 */
	readonly dualCameraFusionSupported: boolean;

	/**
	 * @since 13.0
	 */
	enabledSemanticSegmentationMatteTypes: NSArray<string>;

	/**
	 * @since 17.0
	 */
	fastCapturePrioritizationEnabled: boolean;

	/**
	 * @since 17.0
	 */
	fastCapturePrioritizationSupported: boolean;

	/**
	 * @since 10.0
	 * @deprecated 16.0
	 */
	highResolutionCaptureEnabled: boolean;

	readonly isFlashScene: boolean;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	readonly isStillImageStabilizationScene: boolean;

	readonly lensStabilizationDuringBracketedCaptureSupported: boolean;

	livePhotoAutoTrimmingEnabled: boolean;

	livePhotoCaptureEnabled: boolean;

	readonly livePhotoCaptureSupported: boolean;

	livePhotoCaptureSuspended: boolean;

	readonly maxBracketedCapturePhotoCount: number;

	/**
	 * @since 16.0
	 */
	maxPhotoDimensions: CMVideoDimensions;

	/**
	 * @since 13.0
	 */
	maxPhotoQualityPrioritization: AVCapturePhotoQualityPrioritization;

	photoSettingsForSceneMonitoring: AVCapturePhotoSettings;

	/**
	 * @since 12.0
	 */
	portraitEffectsMatteDeliveryEnabled: boolean;

	/**
	 * @since 12.0
	 */
	readonly portraitEffectsMatteDeliverySupported: boolean;

	readonly preparedPhotoSettingsArray: NSArray<AVCapturePhotoSettings>;

	/**
	 * @since 16.0
	 */
	preservesLivePhotoCaptureSuspendedOnSessionStop: boolean;

	/**
	 * @since 17.0
	 */
	responsiveCaptureEnabled: boolean;

	/**
	 * @since 17.0
	 */
	readonly responsiveCaptureSupported: boolean;

	/**
	 * @since 18.0
	 */
	readonly shutterSoundSuppressionSupported: boolean;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	readonly stillImageStabilizationSupported: boolean;

	readonly supportedFlashModes: NSArray<number>;

	/**
	 * @since 13.0
	 */
	virtualDeviceConstituentPhotoDeliveryEnabled: boolean;

	/**
	 * @since 13.0
	 */
	readonly virtualDeviceConstituentPhotoDeliverySupported: boolean;

	/**
	 * @since 13.0
	 */
	readonly virtualDeviceFusionSupported: boolean;

	/**
	 * @since 17.0
	 */
	zeroShutterLagEnabled: boolean;

	/**
	 * @since 17.0
	 */
	readonly zeroShutterLagSupported: boolean;

	capturePhotoWithSettingsDelegate(settings: AVCapturePhotoSettings, delegate: AVCapturePhotoCaptureDelegate): void;

	setPreparedPhotoSettingsArrayCompletionHandler(preparedPhotoSettingsArray: NSArray<AVCapturePhotoSettings> | AVCapturePhotoSettings[], completionHandler: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	supportedPhotoCodecTypesForFileType(fileType: string): NSArray<string>;

	/**
	 * @since 11.0
	 */
	supportedPhotoPixelFormatTypesForFileType(fileType: string): NSArray<number>;

	/**
	 * @since 11.0
	 */
	supportedRawPhotoPixelFormatTypesForFileType(fileType: string): NSArray<number>;
}

/**
 * @since 17.0
 */
declare const enum AVCapturePhotoOutputCaptureReadiness {

	SessionNotRunning = 0,

	Ready = 1,

	NotReadyMomentarily = 2,

	NotReadyWaitingForCapture = 3,

	NotReadyWaitingForProcessing = 4
}

/**
 * @since 17.0
 */
declare class AVCapturePhotoOutputReadinessCoordinator extends NSObject {

	static alloc(): AVCapturePhotoOutputReadinessCoordinator; // inherited from NSObject

	static new(): AVCapturePhotoOutputReadinessCoordinator; // inherited from NSObject

	readonly captureReadiness: AVCapturePhotoOutputCaptureReadiness;

	delegate: AVCapturePhotoOutputReadinessCoordinatorDelegate;

	constructor(o: { photoOutput: AVCapturePhotoOutput; });

	initWithPhotoOutput(photoOutput: AVCapturePhotoOutput): this;

	startTrackingCaptureRequestUsingPhotoSettings(settings: AVCapturePhotoSettings): void;

	stopTrackingCaptureRequestUsingPhotoSettingsUniqueID(settingsUniqueID: number): void;
}

/**
 * @since 17.0
 */
interface AVCapturePhotoOutputReadinessCoordinatorDelegate extends NSObjectProtocol {

	readinessCoordinatorCaptureReadinessDidChange?(coordinator: AVCapturePhotoOutputReadinessCoordinator, captureReadiness: AVCapturePhotoOutputCaptureReadiness): void;
}
declare var AVCapturePhotoOutputReadinessCoordinatorDelegate: {

	prototype: AVCapturePhotoOutputReadinessCoordinatorDelegate;
};

/**
 * @since 13.0
 */
declare const enum AVCapturePhotoQualityPrioritization {

	Speed = 1,

	Balanced = 2,

	Quality = 3
}

/**
 * @since 10.0
 */
declare class AVCapturePhotoSettings extends NSObject implements NSCopying {

	static alloc(): AVCapturePhotoSettings; // inherited from NSObject

	static new(): AVCapturePhotoSettings; // inherited from NSObject

	static photoSettings(): AVCapturePhotoSettings;

	static photoSettingsFromPhotoSettings(photoSettings: AVCapturePhotoSettings): AVCapturePhotoSettings;

	static photoSettingsWithFormat(format: NSDictionary<string, any>): AVCapturePhotoSettings;

	static photoSettingsWithRawPixelFormatType(rawPixelFormatType: number): AVCapturePhotoSettings;

	static photoSettingsWithRawPixelFormatTypeProcessedFormat(rawPixelFormatType: number, processedFormat: NSDictionary<string, any>): AVCapturePhotoSettings;

	/**
	 * @since 11.0
	 */
	static photoSettingsWithRawPixelFormatTypeRawFileTypeProcessedFormatProcessedFileType(rawPixelFormatType: number, rawFileType: string, processedFormat: NSDictionary<string, any>, processedFileType: string): AVCapturePhotoSettings;

	/**
	 * @since 14.1
	 */
	autoContentAwareDistortionCorrectionEnabled: boolean;

	/**
	 * @since 10.2
	 * @deprecated 13.0
	 */
	autoDualCameraFusionEnabled: boolean;

	/**
	 * @since 12.0
	 */
	autoRedEyeReductionEnabled: boolean;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	autoStillImageStabilizationEnabled: boolean;

	/**
	 * @since 13.0
	 */
	autoVirtualDeviceFusionEnabled: boolean;

	/**
	 * @since 11.0
	 */
	readonly availableEmbeddedThumbnailPhotoCodecTypes: NSArray<string>;

	readonly availablePreviewPhotoPixelFormatTypes: NSArray<number>;

	/**
	 * @since 12.0
	 */
	readonly availableRawEmbeddedThumbnailPhotoCodecTypes: NSArray<string>;

	/**
	 * @since 11.0
	 */
	cameraCalibrationDataDeliveryEnabled: boolean;

	/**
	 * @since 18.0
	 */
	constantColorEnabled: boolean;

	/**
	 * @since 18.0
	 */
	constantColorFallbackPhotoDeliveryEnabled: boolean;

	/**
	 * @since 11.0
	 */
	depthDataDeliveryEnabled: boolean;

	/**
	 * @since 11.0
	 */
	depthDataFiltered: boolean;

	/**
	 * @since 11.0
	 * @deprecated 13.0
	 */
	dualCameraDualPhotoDeliveryEnabled: boolean;

	/**
	 * @since 11.0
	 */
	embeddedThumbnailPhotoFormat: NSDictionary<string, any>;

	/**
	 * @since 11.0
	 */
	embedsDepthDataInPhoto: boolean;

	/**
	 * @since 12.0
	 */
	embedsPortraitEffectsMatteInPhoto: boolean;

	/**
	 * @since 13.0
	 */
	embedsSemanticSegmentationMattesInPhoto: boolean;

	/**
	 * @since 13.0
	 */
	enabledSemanticSegmentationMatteTypes: NSArray<string>;

	flashMode: AVCaptureFlashMode;

	readonly format: NSDictionary<string, any>;

	/**
	 * @since 10.0
	 * @deprecated 16.0
	 */
	highResolutionPhotoEnabled: boolean;

	livePhotoMovieFileURL: NSURL;

	livePhotoMovieMetadata: NSArray<AVMetadataItem>;

	/**
	 * @since 11.0
	 */
	livePhotoVideoCodecType: string;

	/**
	 * @since 16.0
	 */
	maxPhotoDimensions: CMVideoDimensions;

	/**
	 * @since 11.0
	 */
	metadata: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	photoQualityPrioritization: AVCapturePhotoQualityPrioritization;

	/**
	 * @since 12.0
	 */
	portraitEffectsMatteDeliveryEnabled: boolean;

	previewPhotoFormat: NSDictionary<string, any>;

	/**
	 * @since 11.0
	 */
	readonly processedFileType: string;

	/**
	 * @since 12.0
	 */
	rawEmbeddedThumbnailPhotoFormat: NSDictionary<string, any>;

	/**
	 * @since 11.0
	 */
	readonly rawFileType: string;

	readonly rawPhotoPixelFormatType: number;

	/**
	 * @since 18.0
	 */
	shutterSoundSuppressionEnabled: boolean;

	readonly uniqueID: number;

	/**
	 * @since 13.0
	 */
	virtualDeviceConstituentPhotoDeliveryEnabledDevices: NSArray<AVCaptureDevice>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.0
 */
declare const enum AVCapturePrimaryConstituentDeviceRestrictedSwitchingBehaviorConditions {

	None = 0,

	VideoZoomChanged = 1,

	FocusModeChanged = 2,

	ExposureModeChanged = 4
}

/**
 * @since 15.0
 */
declare const enum AVCapturePrimaryConstituentDeviceSwitchingBehavior {

	Unsupported = 0,

	Auto = 1,

	Restricted = 2,

	Locked = 3
}

/**
 * @since 17.0
 */
declare class AVCaptureReactionEffectState extends NSObject {

	static alloc(): AVCaptureReactionEffectState; // inherited from NSObject

	static new(): AVCaptureReactionEffectState; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	readonly endTime: CMTime;

	/**
	 * @since 17.0
	 */
	readonly reactionType: string;

	/**
	 * @since 17.0
	 */
	readonly startTime: CMTime;
}

/**
 * @since 17.0
 */
declare function AVCaptureReactionSystemImageNameForType(reactionType: string): string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeBalloons: string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeConfetti: string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeFireworks: string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeHeart: string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeLasers: string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeRain: string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeThumbsDown: string;

/**
 * @since 17.0
 */
declare var AVCaptureReactionTypeThumbsUp: string;

/**
 * @since 10.0
 */
declare class AVCaptureResolvedPhotoSettings extends NSObject {

	static alloc(): AVCaptureResolvedPhotoSettings; // inherited from NSObject

	static new(): AVCaptureResolvedPhotoSettings; // inherited from NSObject

	/**
	 * @since 14.1
	 */
	readonly contentAwareDistortionCorrectionEnabled: boolean;

	/**
	 * @since 17.0
	 */
	readonly deferredPhotoProxyDimensions: CMVideoDimensions;

	/**
	 * @since 10.2
	 * @deprecated 13.0
	 */
	readonly dualCameraFusionEnabled: boolean;

	/**
	 * @since 11.0
	 */
	readonly embeddedThumbnailDimensions: CMVideoDimensions;

	/**
	 * @since 11.0
	 */
	readonly expectedPhotoCount: number;

	/**
	 * @since 17.0
	 */
	readonly fastCapturePrioritizationEnabled: boolean;

	readonly flashEnabled: boolean;

	readonly livePhotoMovieDimensions: CMVideoDimensions;

	readonly photoDimensions: CMVideoDimensions;

	/**
	 * @since 13.0
	 */
	readonly photoProcessingTimeRange: CMTimeRange;

	/**
	 * @since 12.0
	 */
	readonly portraitEffectsMatteDimensions: CMVideoDimensions;

	readonly previewDimensions: CMVideoDimensions;

	/**
	 * @since 12.0
	 */
	readonly rawEmbeddedThumbnailDimensions: CMVideoDimensions;

	readonly rawPhotoDimensions: CMVideoDimensions;

	/**
	 * @since 12.0
	 */
	readonly redEyeReductionEnabled: boolean;

	/**
	 * @since 10.0
	 * @deprecated 13.0
	 */
	readonly stillImageStabilizationEnabled: boolean;

	readonly uniqueID: number;

	/**
	 * @since 13.0
	 */
	readonly virtualDeviceFusionEnabled: boolean;

	/**
	 * @since 13.0
	 */
	dimensionsForSemanticSegmentationMatteOfType(semanticSegmentationMatteType: string): CMVideoDimensions;
}

/**
 * @since 4.0
 */
declare class AVCaptureSession extends NSObject {

	static alloc(): AVCaptureSession; // inherited from NSObject

	static new(): AVCaptureSession; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	automaticallyConfiguresApplicationAudioSession: boolean;

	/**
	 * @since 10.0
	 */
	automaticallyConfiguresCaptureDeviceForWideColor: boolean;

	/**
	 * @since 18.0
	 */
	configuresApplicationAudioSessionToMixWithOthers: boolean;

	/**
	 * @since 13.0
	 */
	readonly connections: NSArray<AVCaptureConnection>;

	/**
	 * @since 16.0
	 */
	readonly hardwareCost: number;

	readonly inputs: NSArray<AVCaptureInput>;

	/**
	 * @since 4.0
	 */
	readonly interrupted: boolean;

	/**
	 * @since 7.0
	 * @deprecated 15.4
	 */
	readonly masterClock: any;

	/**
	 * @since 16.0
	 */
	multitaskingCameraAccessEnabled: boolean;

	/**
	 * @since 16.0
	 */
	readonly multitaskingCameraAccessSupported: boolean;

	readonly outputs: NSArray<AVCaptureOutput>;

	readonly running: boolean;

	sessionPreset: string;

	/**
	 * @since 15.4
	 */
	readonly synchronizationClock: any;

	/**
	 * @since 7.0
	 */
	usesApplicationAudioSession: boolean;

	/**
	 * @since 8.0
	 */
	addConnection(connection: AVCaptureConnection): void;

	addInput(input: AVCaptureInput): void;

	/**
	 * @since 8.0
	 */
	addInputWithNoConnections(input: AVCaptureInput): void;

	addOutput(output: AVCaptureOutput): void;

	/**
	 * @since 8.0
	 */
	addOutputWithNoConnections(output: AVCaptureOutput): void;

	beginConfiguration(): void;

	/**
	 * @since 8.0
	 */
	canAddConnection(connection: AVCaptureConnection): boolean;

	canAddInput(input: AVCaptureInput): boolean;

	canAddOutput(output: AVCaptureOutput): boolean;

	canSetSessionPreset(preset: string): boolean;

	commitConfiguration(): void;

	/**
	 * @since 8.0
	 */
	removeConnection(connection: AVCaptureConnection): void;

	removeInput(input: AVCaptureInput): void;

	removeOutput(output: AVCaptureOutput): void;

	startRunning(): void;

	stopRunning(): void;
}

/**
 * @since 4.0
 */
declare var AVCaptureSessionDidStartRunningNotification: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionDidStopRunningNotification: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionErrorKey: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionInterruptionEndedNotification: string;

/**
 * @since 9.0
 */
declare const enum AVCaptureSessionInterruptionReason {

	VideoDeviceNotAvailableInBackground = 1,

	AudioDeviceInUseByAnotherClient = 2,

	VideoDeviceInUseByAnotherClient = 3,

	VideoDeviceNotAvailableWithMultipleForegroundApps = 4,

	VideoDeviceNotAvailableDueToSystemPressure = 5
}

/**
 * @since 9.0
 */
declare var AVCaptureSessionInterruptionReasonKey: string;

/**
 * @since 11.1
 */
declare var AVCaptureSessionInterruptionSystemPressureStateKey: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionPreset1280x720: string;

/**
 * @since 5.0
 */
declare var AVCaptureSessionPreset1920x1080: string;

/**
 * @since 5.0
 */
declare var AVCaptureSessionPreset352x288: string;

/**
 * @since 9.0
 */
declare var AVCaptureSessionPreset3840x2160: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionPreset640x480: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionPresetHigh: string;

/**
 * @since 7.0
 */
declare var AVCaptureSessionPresetInputPriority: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionPresetLow: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionPresetMedium: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionPresetPhoto: string;

/**
 * @since 5.0
 */
declare var AVCaptureSessionPresetiFrame1280x720: string;

/**
 * @since 5.0
 */
declare var AVCaptureSessionPresetiFrame960x540: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionRuntimeErrorNotification: string;

/**
 * @since 4.0
 */
declare var AVCaptureSessionWasInterruptedNotification: string;

/**
 * @since 4.0
 * @deprecated 10.0
 */
declare class AVCaptureStillImageOutput extends AVCaptureOutput {

	static alloc(): AVCaptureStillImageOutput; // inherited from NSObject

	static jpegStillImageNSDataRepresentation(jpegSampleBuffer: any): NSData;

	static new(): AVCaptureStillImageOutput; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	automaticallyEnablesStillImageStabilizationWhenAvailable: boolean;

	readonly availableImageDataCVPixelFormatTypes: NSArray<number>;

	readonly availableImageDataCodecTypes: NSArray<string>;

	/**
	 * @since 5.0
	 */
	readonly capturingStillImage: boolean;

	/**
	 * @since 8.0
	 */
	highResolutionStillImageOutputEnabled: boolean;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	lensStabilizationDuringBracketedCaptureEnabled: boolean;

	/**
	 * @since 9.0
	 * @deprecated 10.0
	 */
	readonly lensStabilizationDuringBracketedCaptureSupported: boolean;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	readonly maxBracketedCaptureStillImageCount: number;

	outputSettings: NSDictionary<string, any>;

	/**
	 * @since 7.0
	 */
	readonly stillImageStabilizationActive: boolean;

	/**
	 * @since 7.0
	 */
	readonly stillImageStabilizationSupported: boolean;

	captureStillImageAsynchronouslyFromConnectionCompletionHandler(connection: AVCaptureConnection, handler: (p1: any, p2: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	captureStillImageBracketAsynchronouslyFromConnectionWithSettingsArrayCompletionHandler(connection: AVCaptureConnection, settings: NSArray<AVCaptureBracketedStillImageSettings> | AVCaptureBracketedStillImageSettings[], handler: (p1: any, p2: AVCaptureBracketedStillImageSettings, p3: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	prepareToCaptureStillImageBracketFromConnectionWithSettingsArrayCompletionHandler(connection: AVCaptureConnection, settings: NSArray<AVCaptureBracketedStillImageSettings> | AVCaptureBracketedStillImageSettings[], handler: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare class AVCaptureSynchronizedData extends NSObject {

	static alloc(): AVCaptureSynchronizedData; // inherited from NSObject

	static new(): AVCaptureSynchronizedData; // inherited from NSObject

	readonly timestamp: CMTime;
}

/**
 * @since 11.0
 */
declare class AVCaptureSynchronizedDataCollection extends NSObject implements NSFastEnumeration {

	static alloc(): AVCaptureSynchronizedDataCollection; // inherited from NSObject

	static new(): AVCaptureSynchronizedDataCollection; // inherited from NSObject

	readonly count: number;
	[Symbol.iterator](): Iterator<any>;

	objectForKeyedSubscript(key: AVCaptureOutput): AVCaptureSynchronizedData;

	synchronizedDataForCaptureOutput(captureOutput: AVCaptureOutput): AVCaptureSynchronizedData;
}

/**
 * @since 11.0
 */
declare class AVCaptureSynchronizedDepthData extends AVCaptureSynchronizedData {

	static alloc(): AVCaptureSynchronizedDepthData; // inherited from NSObject

	static new(): AVCaptureSynchronizedDepthData; // inherited from NSObject

	readonly depthData: AVDepthData;

	readonly depthDataWasDropped: boolean;

	readonly droppedReason: AVCaptureOutputDataDroppedReason;
}

/**
 * @since 11.0
 */
declare class AVCaptureSynchronizedMetadataObjectData extends AVCaptureSynchronizedData {

	static alloc(): AVCaptureSynchronizedMetadataObjectData; // inherited from NSObject

	static new(): AVCaptureSynchronizedMetadataObjectData; // inherited from NSObject

	readonly metadataObjects: NSArray<AVMetadataObject>;
}

/**
 * @since 11.0
 */
declare class AVCaptureSynchronizedSampleBufferData extends AVCaptureSynchronizedData {

	static alloc(): AVCaptureSynchronizedSampleBufferData; // inherited from NSObject

	static new(): AVCaptureSynchronizedSampleBufferData; // inherited from NSObject

	readonly droppedReason: AVCaptureOutputDataDroppedReason;

	readonly sampleBuffer: any;

	readonly sampleBufferWasDropped: boolean;
}

/**
 * @since 11.1
 */
declare const enum AVCaptureSystemPressureFactors {

	None = 0,

	SystemTemperature = 1,

	PeakPower = 2,

	DepthModuleTemperature = 4,

	CameraTemperature = 8
}

/**
 * @since 11.1
 */
declare var AVCaptureSystemPressureLevelCritical: string;

/**
 * @since 11.1
 */
declare var AVCaptureSystemPressureLevelFair: string;

/**
 * @since 11.1
 */
declare var AVCaptureSystemPressureLevelNominal: string;

/**
 * @since 11.1
 */
declare var AVCaptureSystemPressureLevelSerious: string;

/**
 * @since 11.1
 */
declare var AVCaptureSystemPressureLevelShutdown: string;

/**
 * @since 11.1
 */
declare class AVCaptureSystemPressureState extends NSObject {

	static alloc(): AVCaptureSystemPressureState; // inherited from NSObject

	static new(): AVCaptureSystemPressureState; // inherited from NSObject

	readonly factors: AVCaptureSystemPressureFactors;

	readonly level: string;
}

/**
 * @since 15.0
 */
declare const enum AVCaptureSystemUserInterface {

	VideoEffects = 1,

	MicrophoneModes = 2
}

/**
 * @since 4.0
 */
declare const enum AVCaptureTorchMode {

	Off = 0,

	On = 1,

	Auto = 2
}

/**
 * @since 4.0
 */
declare class AVCaptureVideoDataOutput extends AVCaptureOutput {

	static alloc(): AVCaptureVideoDataOutput; // inherited from NSObject

	static new(): AVCaptureVideoDataOutput; // inherited from NSObject

	alwaysDiscardsLateVideoFrames: boolean;

	/**
	 * @since 13.0
	 */
	automaticallyConfiguresOutputBufferDimensions: boolean;

	/**
	 * @since 5.0
	 */
	readonly availableVideoCVPixelFormatTypes: NSArray<number>;

	/**
	 * @since 5.0
	 */
	readonly availableVideoCodecTypes: NSArray<string>;

	/**
	 * @since 13.0
	 */
	deliversPreviewSizedOutputBuffers: boolean;

	/**
	 * @since 4.0
	 * @deprecated 5.0
	 */
	minFrameDuration: CMTime;

	readonly sampleBufferCallbackQueue: NSObject & OS_dispatch_queue;

	readonly sampleBufferDelegate: AVCaptureVideoDataOutputSampleBufferDelegate;

	videoSettings: NSDictionary<string, any>;

	/**
	 * @since 11.0
	 */
	availableVideoCodecTypesForAssetWriterWithOutputFileType(outputFileType: string): NSArray<string>;

	/**
	 * @since 7.0
	 */
	recommendedVideoSettingsForAssetWriterWithOutputFileType(outputFileType: string): NSDictionary<string, any>;

	/**
	 * @since 11.0
	 */
	recommendedVideoSettingsForVideoCodecTypeAssetWriterOutputFileType(videoCodecType: string, outputFileType: string): NSDictionary<string, any>;

	/**
	 * @since 17.0
	 */
	recommendedVideoSettingsForVideoCodecTypeAssetWriterOutputFileTypeOutputFileURL(videoCodecType: string, outputFileType: string, outputFileURL: NSURL): NSDictionary<string, any>;

	setSampleBufferDelegateQueue(sampleBufferDelegate: AVCaptureVideoDataOutputSampleBufferDelegate, sampleBufferCallbackQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 4.0
 */
interface AVCaptureVideoDataOutputSampleBufferDelegate extends NSObjectProtocol {

	/**
	 * @since 6.0
	 */
	captureOutputDidDropSampleBufferFromConnection?(output: AVCaptureOutput, sampleBuffer: any, connection: AVCaptureConnection): void;

	captureOutputDidOutputSampleBufferFromConnection?(output: AVCaptureOutput, sampleBuffer: any, connection: AVCaptureConnection): void;
}
declare var AVCaptureVideoDataOutputSampleBufferDelegate: {

	prototype: AVCaptureVideoDataOutputSampleBufferDelegate;
};

/**
 * @since 4.0
 * @deprecated 17.0
 */
declare const enum AVCaptureVideoOrientation {

	Portrait = 1,

	PortraitUpsideDown = 2,

	LandscapeRight = 3,

	LandscapeLeft = 4
}

/**
 * @since 4.0
 */
declare class AVCaptureVideoPreviewLayer extends CALayer {

	static alloc(): AVCaptureVideoPreviewLayer; // inherited from NSObject

	static layer(): AVCaptureVideoPreviewLayer; // inherited from CALayer

	static layerWithSession(session: AVCaptureSession): AVCaptureVideoPreviewLayer;

	/**
	 * @since 8.0
	 */
	static layerWithSessionWithNoConnection(session: AVCaptureSession): AVCaptureVideoPreviewLayer;

	static new(): AVCaptureVideoPreviewLayer; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	automaticallyAdjustsMirroring: boolean;

	/**
	 * @since 6.0
	 */
	readonly connection: AVCaptureConnection;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	mirrored: boolean;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	readonly mirroringSupported: boolean;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	orientation: AVCaptureVideoOrientation;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	readonly orientationSupported: boolean;

	/**
	 * @since 13.0
	 */
	readonly previewing: boolean;

	session: AVCaptureSession;

	videoGravity: string;

	constructor(o: { session: AVCaptureSession; });

	/**
	 * @since 8.0
	 */
	constructor(o: { sessionWithNoConnection: AVCaptureSession; });

	/**
	 * @since 6.0
	 */
	captureDevicePointOfInterestForPoint(pointInLayer: CGPoint): CGPoint;

	initWithSession(session: AVCaptureSession): this;

	/**
	 * @since 8.0
	 */
	initWithSessionWithNoConnection(session: AVCaptureSession): this;

	/**
	 * @since 7.0
	 */
	metadataOutputRectOfInterestForRect(rectInLayerCoordinates: CGRect): CGRect;

	/**
	 * @since 6.0
	 */
	pointForCaptureDevicePointOfInterest(captureDevicePointOfInterest: CGPoint): CGPoint;

	/**
	 * @since 7.0
	 */
	rectForMetadataOutputRectOfInterest(rectInMetadataOutputCoordinates: CGRect): CGRect;

	/**
	 * @since 8.0
	 */
	setSessionWithNoConnection(session: AVCaptureSession): void;

	/**
	 * @since 6.0
	 */
	transformedMetadataObjectForMetadataObject(metadataObject: AVMetadataObject): AVMetadataObject;
}

/**
 * @since 8.0
 */
declare const enum AVCaptureVideoStabilizationMode {

	Off = 0,

	Standard = 1,

	Cinematic = 2,

	CinematicExtended = 3,

	PreviewOptimized = 4,

	CinematicExtendedEnhanced = 5,

	Auto = -1
}

interface AVCaptureWhiteBalanceChromaticityValues {
	x: number;
	y: number;
}
declare var AVCaptureWhiteBalanceChromaticityValues: interop.StructType<AVCaptureWhiteBalanceChromaticityValues>;

interface AVCaptureWhiteBalanceGains {
	redGain: number;
	greenGain: number;
	blueGain: number;
}
declare var AVCaptureWhiteBalanceGains: interop.StructType<AVCaptureWhiteBalanceGains>;

/**
 * @since 8.0
 */
declare var AVCaptureWhiteBalanceGainsCurrent: AVCaptureWhiteBalanceGains;

/**
 * @since 4.0
 */
declare const enum AVCaptureWhiteBalanceMode {

	Locked = 0,

	AutoWhiteBalance = 1,

	ContinuousAutoWhiteBalance = 2
}

interface AVCaptureWhiteBalanceTemperatureAndTintValues {
	temperature: number;
	tint: number;
}
declare var AVCaptureWhiteBalanceTemperatureAndTintValues: interop.StructType<AVCaptureWhiteBalanceTemperatureAndTintValues>;

/**
 * @since 4.0
 */
declare class AVComposition extends AVAsset implements NSMutableCopying {

	static alloc(): AVComposition; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVComposition; // inherited from AVAsset

	static new(): AVComposition; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly URLAssetInitializationOptions: NSDictionary<string, any>;

	/**
	 * @since 15.0
	 */
	loadTrackWithTrackIDCompletionHandler(trackID: number, completionHandler: (p1: AVCompositionTrack, p2: NSError) => void): void;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	trackWithTrackID(trackID: number): AVCompositionTrack;
}

/**
 * @since 4.0
 */
declare class AVCompositionTrack extends AVAssetTrack {

	static alloc(): AVCompositionTrack; // inherited from NSObject

	static new(): AVCompositionTrack; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly formatDescriptionReplacements: NSArray<AVCompositionTrackFormatDescriptionReplacement>;

	segmentForTrackTime(trackTime: CMTime): AVCompositionTrackSegment;
}

/**
 * @since 13.0
 */
declare class AVCompositionTrackFormatDescriptionReplacement extends NSObject implements NSSecureCoding {

	static alloc(): AVCompositionTrackFormatDescriptionReplacement; // inherited from NSObject

	static new(): AVCompositionTrackFormatDescriptionReplacement; // inherited from NSObject

	readonly originalFormatDescription: any;

	readonly replacementFormatDescription: any;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 4.0
 */
declare class AVCompositionTrackSegment extends AVAssetTrackSegment {

	static alloc(): AVCompositionTrackSegment; // inherited from NSObject

	static compositionTrackSegmentWithTimeRange(timeRange: CMTimeRange): AVCompositionTrackSegment;

	static compositionTrackSegmentWithURLTrackIDSourceTimeRangeTargetTimeRange(URL: NSURL, trackID: number, sourceTimeRange: CMTimeRange, targetTimeRange: CMTimeRange): AVCompositionTrackSegment;

	static new(): AVCompositionTrackSegment; // inherited from NSObject

	readonly sourceTrackID: number;

	readonly sourceURL: NSURL;

	constructor(o: { timeRange: CMTimeRange; });

	constructor(o: { URL: NSURL; trackID: number; sourceTimeRange: CMTimeRange; targetTimeRange: CMTimeRange; });

	initWithTimeRange(timeRange: CMTimeRange): this;

	initWithURLTrackIDSourceTimeRangeTargetTimeRange(URL: NSURL, trackID: number, sourceTimeRange: CMTimeRange, targetTimeRange: CMTimeRange): this;
}

/**
 * @since 14.5
 */
declare class AVContentKey extends NSObject {

	static alloc(): AVContentKey; // inherited from NSObject

	static new(): AVContentKey; // inherited from NSObject

	readonly contentKeySpecifier: AVContentKeySpecifier;

	/**
	 * @since 17.4
	 */
	readonly externalContentProtectionStatus: AVExternalContentProtectionStatus;

	/**
	 * @since 17.4
	 */
	revoke(): void;
}

/**
 * @since 10.3
 */
interface AVContentKeyRecipient {

	mayRequireContentKeysForMediaDataProcessing: boolean;

	/**
	 * @since 14.5
	 */
	contentKeySessionDidProvideContentKey?(contentKeySession: AVContentKeySession, contentKey: AVContentKey): void;
}
declare var AVContentKeyRecipient: {

	prototype: AVContentKeyRecipient;
};

/**
 * @since 10.3
 */
declare class AVContentKeyRequest extends NSObject {

	static alloc(): AVContentKeyRequest; // inherited from NSObject

	static new(): AVContentKeyRequest; // inherited from NSObject

	readonly canProvidePersistableContentKey: boolean;

	/**
	 * @since 14.5
	 */
	readonly contentKey: AVContentKey;

	/**
	 * @since 14.5
	 */
	readonly contentKeySpecifier: AVContentKeySpecifier;

	readonly error: NSError;

	readonly identifier: any;

	readonly initializationData: NSData;

	/**
	 * @since 12.2
	 */
	readonly options: NSDictionary<string, any>;

	readonly renewsExpiringResponseData: boolean;

	readonly status: AVContentKeyRequestStatus;

	makeStreamingContentKeyRequestDataForAppContentIdentifierOptionsCompletionHandler(appIdentifier: NSData, contentIdentifier: NSData, options: NSDictionary<string, any>, handler: (p1: NSData, p2: NSError) => void): void;

	processContentKeyResponse(keyResponse: AVContentKeyResponse): void;

	processContentKeyResponseError(error: NSError): void;

	/**
	 * @since 10.3
	 * @deprecated 11.2
	 */
	respondByRequestingPersistableContentKeyRequest(): void;

	/**
	 * @since 11.2
	 */
	respondByRequestingPersistableContentKeyRequestAndReturnError(): boolean;
}

/**
 * @since 10.3
 */
declare var AVContentKeyRequestProtocolVersionsKey: string;

/**
 * @since 13.0
 */
declare var AVContentKeyRequestRequiresValidationDataInSecureTokenKey: string;

/**
 * @since 10.3
 */
declare var AVContentKeyRequestRetryReasonReceivedObsoleteContentKey: string;

/**
 * @since 10.3
 */
declare var AVContentKeyRequestRetryReasonReceivedResponseWithExpiredLease: string;

/**
 * @since 10.3
 */
declare var AVContentKeyRequestRetryReasonTimedOut: string;

/**
 * @since 10.3
 */
declare const enum AVContentKeyRequestStatus {

	RequestingResponse = 0,

	ReceivedResponse = 1,

	Renewed = 2,

	Retried = 3,

	Cancelled = 4,

	Failed = 5
}

/**
 * @since 10.3
 */
declare class AVContentKeyResponse extends NSObject {

	static alloc(): AVContentKeyResponse; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static contentKeyResponseWithAuthorizationTokenData(authorizationTokenData: NSData): AVContentKeyResponse;

	/**
	 * @since 11.0
	 */
	static contentKeyResponseWithClearKeyDataInitializationVector(keyData: NSData, initializationVector: NSData): AVContentKeyResponse;

	static contentKeyResponseWithFairPlayStreamingKeyResponseData(keyResponseData: NSData): AVContentKeyResponse;

	static new(): AVContentKeyResponse; // inherited from NSObject
}

/**
 * @since 10.3
 */
declare class AVContentKeySession extends NSObject {

	static alloc(): AVContentKeySession; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static contentKeySessionWithKeySystem(keySystem: string): AVContentKeySession;

	static contentKeySessionWithKeySystemStorageDirectoryAtURL(keySystem: string, storageURL: NSURL): AVContentKeySession;

	static new(): AVContentKeySession; // inherited from NSObject

	static pendingExpiredSessionReportsWithAppIdentifierStorageDirectoryAtURL(appIdentifier: NSData, storageURL: NSURL): NSArray<NSData>;

	static removePendingExpiredSessionReportsWithAppIdentifierStorageDirectoryAtURL(expiredSessionReports: NSArray<NSData> | NSData[], appIdentifier: NSData, storageURL: NSURL): void;

	readonly contentKeyRecipients: NSArray<AVContentKeyRecipient>;

	readonly contentProtectionSessionIdentifier: NSData;

	readonly delegate: AVContentKeySessionDelegate;

	readonly delegateQueue: NSObject & OS_dispatch_queue;

	readonly keySystem: string;

	readonly storageURL: NSURL;

	addContentKeyRecipient(recipient: AVContentKeyRecipient): void;

	expire(): void;

	/**
	 * @since 12.2
	 */
	invalidateAllPersistableContentKeysForAppOptionsCompletionHandler(appIdentifier: NSData, options: NSDictionary<string, any>, handler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 12.2
	 */
	invalidatePersistableContentKeyOptionsCompletionHandler(persistableContentKeyData: NSData, options: NSDictionary<string, any>, handler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	makeSecureTokenForExpirationDateOfPersistableContentKeyCompletionHandler(persistableContentKeyData: NSData, handler: (p1: NSData, p2: NSError) => void): void;

	processContentKeyRequestWithIdentifierInitializationDataOptions(identifier: any, initializationData: NSData, options: NSDictionary<string, any>): void;

	removeContentKeyRecipient(recipient: AVContentKeyRecipient): void;

	renewExpiringResponseDataForContentKeyRequest(contentKeyRequest: AVContentKeyRequest): void;

	setDelegateQueue(delegate: AVContentKeySessionDelegate, delegateQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 10.3
 */
interface AVContentKeySessionDelegate extends NSObjectProtocol {

	contentKeySessionContentKeyRequestDidFailWithError?(session: AVContentKeySession, keyRequest: AVContentKeyRequest, err: NSError): void;

	/**
	 * @since 12.0
	 */
	contentKeySessionContentKeyRequestDidSucceed?(session: AVContentKeySession, keyRequest: AVContentKeyRequest): void;

	contentKeySessionContentProtectionSessionIdentifierDidChange?(session: AVContentKeySession): void;

	/**
	 * @since 12.0
	 */
	contentKeySessionDidGenerateExpiredSessionReport?(session: AVContentKeySession): void;

	contentKeySessionDidProvideContentKeyRequest(session: AVContentKeySession, keyRequest: AVContentKeyRequest): void;

	/**
	 * @since 17.4
	 */
	contentKeySessionDidProvideContentKeyRequestsForInitializationData?(session: AVContentKeySession, keyRequests: NSArray<AVContentKeyRequest> | AVContentKeyRequest[], initializationData: NSData): void;

	contentKeySessionDidProvidePersistableContentKeyRequest?(session: AVContentKeySession, keyRequest: AVPersistableContentKeyRequest): void;

	contentKeySessionDidProvideRenewingContentKeyRequest?(session: AVContentKeySession, keyRequest: AVContentKeyRequest): void;

	/**
	 * @since 11.0
	 */
	contentKeySessionDidUpdatePersistableContentKeyForContentKeyIdentifier?(session: AVContentKeySession, persistableContentKey: NSData, keyIdentifier: any): void;

	/**
	 * @since 17.4
	 */
	contentKeySessionExternalProtectionStatusDidChangeForContentKey?(session: AVContentKeySession, contentKey: AVContentKey): void;

	contentKeySessionShouldRetryContentKeyRequestReason?(session: AVContentKeySession, keyRequest: AVContentKeyRequest, retryReason: string): boolean;
}
declare var AVContentKeySessionDelegate: {

	prototype: AVContentKeySessionDelegate;
};

/**
 * @since 12.2
 */
declare var AVContentKeySessionServerPlaybackContextOptionProtocolVersions: string;

/**
 * @since 12.2
 */
declare var AVContentKeySessionServerPlaybackContextOptionServerChallenge: string;

/**
 * @since 14.5
 */
declare class AVContentKeySpecifier extends NSObject {

	static alloc(): AVContentKeySpecifier; // inherited from NSObject

	static contentKeySpecifierForKeySystemIdentifierOptions(keySystem: string, contentKeyIdentifier: any, options: NSDictionary<string, any>): AVContentKeySpecifier;

	static new(): AVContentKeySpecifier; // inherited from NSObject

	readonly identifier: any;

	readonly keySystem: string;

	readonly options: NSDictionary<string, any>;

	constructor(o: { forKeySystem: string; identifier: any; options: NSDictionary<string, any>; });

	initForKeySystemIdentifierOptions(keySystem: string, contentKeyIdentifier: any, options: NSDictionary<string, any>): this;
}

/**
 * @since 13.0
 */
declare var AVContentKeySystemAuthorizationToken: string;

/**
 * @since 11.0
 */
declare var AVContentKeySystemClearKey: string;

/**
 * @since 10.3
 */
declare var AVContentKeySystemFairPlayStreaming: string;

/**
 * @since 15.0
 */
declare class AVCoordinatedPlaybackParticipant extends NSObject {

	static alloc(): AVCoordinatedPlaybackParticipant; // inherited from NSObject

	static new(): AVCoordinatedPlaybackParticipant; // inherited from NSObject

	readonly identifier: NSUUID;

	readonly readyToPlay: boolean;

	readonly suspensionReasons: NSArray<string>;
}

/**
 * @since 15.0
 */
declare class AVCoordinatedPlaybackSuspension extends NSObject {

	static alloc(): AVCoordinatedPlaybackSuspension; // inherited from NSObject

	static new(): AVCoordinatedPlaybackSuspension; // inherited from NSObject

	readonly beginDate: Date;

	readonly reason: string;

	end(): void;

	endProposingNewTime(time: CMTime): void;
}

/**
 * @since 15.0
 */
declare var AVCoordinatedPlaybackSuspensionReasonAudioSessionInterrupted: string;

/**
 * @since 15.0
 */
declare var AVCoordinatedPlaybackSuspensionReasonCoordinatedPlaybackNotPossible: string;

/**
 * @since 15.0
 */
declare var AVCoordinatedPlaybackSuspensionReasonPlayingInterstitial: string;

/**
 * @since 15.0
 */
declare var AVCoordinatedPlaybackSuspensionReasonStallRecovery: string;

/**
 * @since 15.0
 */
declare var AVCoordinatedPlaybackSuspensionReasonUserActionRequired: string;

/**
 * @since 15.0
 */
declare var AVCoordinatedPlaybackSuspensionReasonUserIsChangingCurrentTime: string;

/**
 * @since 4.0
 */
declare var AVCoreAnimationBeginTimeAtZero: number;

/**
 * @since 9.0
 */
declare class AVDateRangeMetadataGroup extends AVMetadataGroup implements NSCopying, NSMutableCopying {

	static alloc(): AVDateRangeMetadataGroup; // inherited from NSObject

	static new(): AVDateRangeMetadataGroup; // inherited from NSObject

	readonly endDate: Date;

	readonly startDate: Date;

	constructor(o: { items: NSArray<AVMetadataItem> | AVMetadataItem[]; startDate: Date; endDate: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithItemsStartDateEndDate(items: NSArray<AVMetadataItem> | AVMetadataItem[], startDate: Date, endDate: Date): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.0
 */
declare class AVDelegatingPlaybackCoordinator extends AVPlaybackCoordinator {

	static alloc(): AVDelegatingPlaybackCoordinator; // inherited from NSObject

	static new(): AVDelegatingPlaybackCoordinator; // inherited from NSObject

	readonly currentItemIdentifier: string;

	readonly playbackControlDelegate: AVPlaybackCoordinatorPlaybackControlDelegate;

	constructor(o: { playbackControlDelegate: AVPlaybackCoordinatorPlaybackControlDelegate; });

	coordinateRateChangeToRateOptions(rate: number, options: AVDelegatingPlaybackCoordinatorRateChangeOptions): void;

	coordinateSeekToTimeOptions(time: CMTime, options: AVDelegatingPlaybackCoordinatorSeekOptions): void;

	initWithPlaybackControlDelegate(playbackControlDelegate: AVPlaybackCoordinatorPlaybackControlDelegate): this;

	reapplyCurrentItemStateToPlaybackControlDelegate(): void;

	transitionToItemWithIdentifierProposingInitialTimingBasedOnTimebase(itemIdentifier: string, snapshotTimebase: any): void;
}

/**
 * @since 15.0
 */
declare class AVDelegatingPlaybackCoordinatorBufferingCommand extends AVDelegatingPlaybackCoordinatorPlaybackControlCommand {

	static alloc(): AVDelegatingPlaybackCoordinatorBufferingCommand; // inherited from NSObject

	static new(): AVDelegatingPlaybackCoordinatorBufferingCommand; // inherited from NSObject

	readonly anticipatedPlaybackRate: number;

	readonly completionDueDate: Date;
}

/**
 * @since 15.0
 */
declare class AVDelegatingPlaybackCoordinatorPauseCommand extends AVDelegatingPlaybackCoordinatorPlaybackControlCommand {

	static alloc(): AVDelegatingPlaybackCoordinatorPauseCommand; // inherited from NSObject

	static new(): AVDelegatingPlaybackCoordinatorPauseCommand; // inherited from NSObject

	readonly anticipatedPlaybackRate: number;

	readonly shouldBufferInAnticipationOfPlayback: boolean;
}

/**
 * @since 15.0
 */
declare class AVDelegatingPlaybackCoordinatorPlayCommand extends AVDelegatingPlaybackCoordinatorPlaybackControlCommand {

	static alloc(): AVDelegatingPlaybackCoordinatorPlayCommand; // inherited from NSObject

	static new(): AVDelegatingPlaybackCoordinatorPlayCommand; // inherited from NSObject

	readonly hostClockTime: CMTime;

	readonly itemTime: CMTime;

	readonly rate: number;
}

/**
 * @since 15.0
 */
declare class AVDelegatingPlaybackCoordinatorPlaybackControlCommand extends NSObject {

	static alloc(): AVDelegatingPlaybackCoordinatorPlaybackControlCommand; // inherited from NSObject

	static new(): AVDelegatingPlaybackCoordinatorPlaybackControlCommand; // inherited from NSObject

	readonly expectedCurrentItemIdentifier: string;

	readonly originator: AVCoordinatedPlaybackParticipant;
}

declare const enum AVDelegatingPlaybackCoordinatorRateChangeOptions {

	PlayImmediately = 1
}

/**
 * @since 15.0
 */
declare class AVDelegatingPlaybackCoordinatorSeekCommand extends AVDelegatingPlaybackCoordinatorPlaybackControlCommand {

	static alloc(): AVDelegatingPlaybackCoordinatorSeekCommand; // inherited from NSObject

	static new(): AVDelegatingPlaybackCoordinatorSeekCommand; // inherited from NSObject

	readonly anticipatedPlaybackRate: number;

	readonly completionDueDate: Date;

	readonly itemTime: CMTime;

	readonly shouldBufferInAnticipationOfPlayback: boolean;
}

declare const enum AVDelegatingPlaybackCoordinatorSeekOptions {

	ResumeImmediately = 1
}

/**
 * @since 11.0
 */
declare class AVDepthData extends NSObject {

	static alloc(): AVDepthData; // inherited from NSObject

	static depthDataFromDictionaryRepresentationError(imageSourceAuxDataInfoDictionary: NSDictionary<any, any>): AVDepthData;

	static new(): AVDepthData; // inherited from NSObject

	readonly availableDepthDataTypes: NSArray<number>;

	readonly cameraCalibrationData: AVCameraCalibrationData;

	readonly depthDataAccuracy: AVDepthDataAccuracy;

	readonly depthDataFiltered: boolean;

	readonly depthDataMap: any;

	readonly depthDataQuality: AVDepthDataQuality;

	readonly depthDataType: number;

	depthDataByApplyingExifOrientation(exifOrientation: CGImagePropertyOrientation): this;

	depthDataByConvertingToDepthDataType(depthDataType: number): this;

	depthDataByReplacingDepthDataMapWithPixelBufferError(pixelBuffer: any): this;

	dictionaryRepresentationForAuxiliaryDataType(outAuxDataType: interop.Pointer | interop.Reference<string>): NSDictionary<any, any>;
}

/**
 * @since 11.0
 */
declare const enum AVDepthDataAccuracy {

	Relative = 0,

	Absolute = 1
}

/**
 * @since 11.0
 */
declare const enum AVDepthDataQuality {

	Low = 0,

	High = 1
}

interface AVEdgeWidths {
	left: number;
	top: number;
	right: number;
	bottom: number;
}
declare var AVEdgeWidths: interop.StructType<AVEdgeWidths>;

declare const enum AVError {

	Unknown = -11800,

	OutOfMemory = -11801,

	SessionNotRunning = -11803,

	DeviceAlreadyUsedByAnotherSession = -11804,

	NoDataCaptured = -11805,

	SessionConfigurationChanged = -11806,

	DiskFull = -11807,

	DeviceWasDisconnected = -11808,

	MediaChanged = -11809,

	MaximumDurationReached = -11810,

	MaximumFileSizeReached = -11811,

	MediaDiscontinuity = -11812,

	MaximumNumberOfSamplesForFileFormatReached = -11813,

	DeviceNotConnected = -11814,

	DeviceInUseByAnotherApplication = -11815,

	DeviceLockedForConfigurationByAnotherProcess = -11817,

	SessionWasInterrupted = -11818,

	MediaServicesWereReset = -11819,

	ExportFailed = -11820,

	DecodeFailed = -11821,

	InvalidSourceMedia = -11822,

	FileAlreadyExists = -11823,

	CompositionTrackSegmentsNotContiguous = -11824,

	InvalidCompositionTrackSegmentDuration = -11825,

	InvalidCompositionTrackSegmentSourceStartTime = -11826,

	InvalidCompositionTrackSegmentSourceDuration = -11827,

	FileFormatNotRecognized = -11828,

	FileFailedToParse = -11829,

	MaximumStillImageCaptureRequestsExceeded = -11830,

	ContentIsProtected = -11831,

	NoImageAtTime = -11832,

	DecoderNotFound = -11833,

	EncoderNotFound = -11834,

	ContentIsNotAuthorized = -11835,

	ApplicationIsNotAuthorized = -11836,

	DeviceIsNotAvailableInBackground = -11837,

	OperationNotSupportedForAsset = -11838,

	DecoderTemporarilyUnavailable = -11839,

	EncoderTemporarilyUnavailable = -11840,

	InvalidVideoComposition = -11841,

	ReferenceForbiddenByReferencePolicy = -11842,

	InvalidOutputURLPathExtension = -11843,

	ScreenCaptureFailed = -11844,

	DisplayWasDisabled = -11845,

	TorchLevelUnavailable = -11846,

	OperationInterrupted = -11847,

	IncompatibleAsset = -11848,

	FailedToLoadMediaData = -11849,

	ServerIncorrectlyConfigured = -11850,

	ApplicationIsNotAuthorizedToUseDevice = -11852,

	FailedToParse = -11853,

	FileTypeDoesNotSupportSampleReferences = -11854,

	UndecodableMediaData = -11855,

	AirPlayControllerRequiresInternet = -11856,

	AirPlayReceiverRequiresInternet = -11857,

	VideoCompositorFailed = -11858,

	RecordingAlreadyInProgress = -11859,

	CreateContentKeyRequestFailed = -11860,

	UnsupportedOutputSettings = -11861,

	OperationNotAllowed = -11862,

	ContentIsUnavailable = -11863,

	FormatUnsupported = -11864,

	MalformedDepth = -11865,

	ContentNotUpdated = -11866,

	NoLongerPlayable = -11867,

	NoCompatibleAlternatesForExternalDisplay = -11868,

	NoSourceTrack = -11869,

	ExternalPlaybackNotSupportedForAsset = -11870,

	OperationNotSupportedForPreset = -11871,

	SessionHardwareCostOverage = -11872,

	UnsupportedDeviceActiveFormat = -11873,

	IncorrectlyConfigured = -11875,

	SegmentStartedWithNonSyncSample = -11876,

	RosettaNotInstalled = -11877,

	OperationCancelled = -11878,

	ContentKeyRequestCancelled = -11879,

	InvalidSampleCursor = -11880,

	FailedToLoadSampleData = -11881,

	AirPlayReceiverTemporarilyUnavailable = -11882,

	EncodeFailed = -11883,

	SandboxExtensionDenied = -11884,

	ToneMappingFailed = -11885
}

/**
 * @since 4.0
 */
declare var AVErrorDeviceKey: string;

/**
 * @since 4.0
 */
declare var AVErrorFileSizeKey: string;

/**
 * @since 8.0
 */
declare var AVErrorFileTypeKey: string;

/**
 * @since 4.3
 */
declare var AVErrorMediaSubTypeKey: string;

/**
 * @since 4.3
 */
declare var AVErrorMediaTypeKey: string;

/**
 * @since 4.0
 */
declare var AVErrorPIDKey: string;

/**
 * @since 8.0
 */
declare var AVErrorPersistentTrackIDKey: string;

/**
 * @since 8.0
 */
declare var AVErrorPresentationTimeStampKey: string;

/**
 * @since 4.0
 */
declare var AVErrorRecordingSuccessfullyFinishedKey: string;

/**
 * @since 4.0
 */
declare var AVErrorTimeKey: string;

/**
 * @since 17.4
 */
declare const enum AVExternalContentProtectionStatus {

	Pending = 0,

	Sufficient = 1,

	Insufficient = 2
}

/**
 * @since 17.0
 */
declare class AVExternalStorageDevice extends NSObject {

	static alloc(): AVExternalStorageDevice; // inherited from NSObject

	static new(): AVExternalStorageDevice; // inherited from NSObject

	static requestAccessWithCompletionHandler(handler: (p1: boolean) => void): void;

	readonly connected: boolean;

	readonly displayName: string;

	readonly freeSize: number;

	readonly notRecommendedForCaptureUse: boolean;

	readonly totalSize: number;

	readonly uuid: NSUUID;

	static readonly authorizationStatus: AVAuthorizationStatus;

	nextAvailableURLsWithPathExtensionsError(extensionArray: NSArray<string> | string[]): NSArray<NSURL>;
}

/**
 * @since 17.0
 */
declare class AVExternalStorageDeviceDiscoverySession extends NSObject {

	static alloc(): AVExternalStorageDeviceDiscoverySession; // inherited from NSObject

	static new(): AVExternalStorageDeviceDiscoverySession; // inherited from NSObject

	readonly externalStorageDevices: NSArray<AVExternalStorageDevice>;

	static readonly sharedSession: AVExternalStorageDeviceDiscoverySession;

	static readonly supported: boolean;
}

/**
 * @since 4.0
 */
declare var AVFileType3GPP: string;

/**
 * @since 4.0
 */
declare var AVFileType3GPP2: string;

/**
 * @since 7.0
 */
declare var AVFileTypeAC3: string;

/**
 * @since 17.0
 */
declare var AVFileTypeAHAP: string;

/**
 * @since 4.0
 */
declare var AVFileTypeAIFC: string;

/**
 * @since 4.0
 */
declare var AVFileTypeAIFF: string;

/**
 * @since 4.0
 */
declare var AVFileTypeAMR: string;

/**
 * @since 11.0
 */
declare var AVFileTypeAVCI: string;

/**
 * @since 4.0
 */
declare var AVFileTypeAppleM4A: string;

/**
 * @since 4.0
 */
declare var AVFileTypeAppleM4V: string;

/**
 * @since 18.0
 */
declare var AVFileTypeAppleiTT: string;

/**
 * @since 4.0
 */
declare var AVFileTypeCoreAudioFormat: string;

/**
 * @since 11.0
 */
declare var AVFileTypeDNG: string;

/**
 * @since 9.0
 */
declare var AVFileTypeEnhancedAC3: string;

/**
 * @since 11.0
 */
declare var AVFileTypeHEIC: string;

/**
 * @since 11.0
 */
declare var AVFileTypeHEIF: string;

/**
 * @since 11.0
 */
declare var AVFileTypeJPEG: string;

/**
 * @since 4.0
 */
declare var AVFileTypeMPEG4: string;

/**
 * @since 7.0
 */
declare var AVFileTypeMPEGLayer3: string;

/**
 * @since 14.0
 */
declare var AVFileTypeProfileMPEG4AppleHLS: string;

/**
 * @since 14.0
 */
declare var AVFileTypeProfileMPEG4CMAFCompliant: string;

/**
 * @since 4.0
 */
declare var AVFileTypeQuickTimeMovie: string;

/**
 * @since 18.0
 */
declare var AVFileTypeSCC: string;

/**
 * @since 7.0
 */
declare var AVFileTypeSunAU: string;

/**
 * @since 11.0
 */
declare var AVFileTypeTIFF: string;

/**
 * @since 4.0
 */
declare var AVFileTypeWAVE: string;

/**
 * @since 4.0
 */
declare var AVFoundationErrorDomain: string;

interface AVFragmentMinding {

	/**
	 * @since 12.0
	 */
	associatedWithFragmentMinder: boolean;
}
declare var AVFragmentMinding: {

	prototype: AVFragmentMinding;
};

/**
 * @since 12.0
 */
declare class AVFragmentedAsset extends AVURLAsset implements AVFragmentMinding {

	static URLAssetWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): AVFragmentedAsset; // inherited from AVURLAsset

	static alloc(): AVFragmentedAsset; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVFragmentedAsset; // inherited from AVAsset

	static fragmentedAssetWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): AVFragmentedAsset;

	static new(): AVFragmentedAsset; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): AVFragmentedAsset; // inherited from NSItemProviderReading

	/**
	 * @since 12.0
	 */
	readonly associatedWithFragmentMinder: boolean; // inherited from AVFragmentMinding

	/**
	 * @since 15.0
	 */
	loadTrackWithTrackIDCompletionHandler(trackID: number, completionHandler: (p1: AVFragmentedAssetTrack, p2: NSError) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	trackWithTrackID(trackID: number): AVFragmentedAssetTrack;
}

/**
 * @since 12.0
 */
declare class AVFragmentedAssetMinder extends NSObject {

	static alloc(): AVFragmentedAssetMinder; // inherited from NSObject

	static fragmentedAssetMinderWithAssetMindingInterval(asset: AVAsset & AVFragmentMinding, mindingInterval: number): AVFragmentedAssetMinder;

	static new(): AVFragmentedAssetMinder; // inherited from NSObject

	readonly assets: NSArray<AVAsset & AVFragmentMinding>;

	mindingInterval: number;

	constructor(o: { asset: AVAsset & AVFragmentMinding; mindingInterval: number; });

	addFragmentedAsset(asset: AVAsset & AVFragmentMinding): void;

	initWithAssetMindingInterval(asset: AVAsset & AVFragmentMinding, mindingInterval: number): this;

	removeFragmentedAsset(asset: AVAsset & AVFragmentMinding): void;
}

/**
 * @since 12.0
 */
declare class AVFragmentedAssetTrack extends AVAssetTrack {

	static alloc(): AVFragmentedAssetTrack; // inherited from NSObject

	static new(): AVFragmentedAssetTrack; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare class AVFragmentedMovie extends AVMovie implements AVFragmentMinding {

	static alloc(): AVFragmentedMovie; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVFragmentedMovie; // inherited from AVAsset

	/**
	 * @since 13.0
	 */
	static movieWithDataOptions(data: NSData, options: NSDictionary<string, any>): AVFragmentedMovie; // inherited from AVMovie

	static movieWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): AVFragmentedMovie; // inherited from AVMovie

	static new(): AVFragmentedMovie; // inherited from NSObject

	/**
	 * @since 12.0
	 */
	readonly associatedWithFragmentMinder: boolean; // inherited from AVFragmentMinding

	/**
	 * @since 15.0
	 */
	loadTrackWithTrackIDCompletionHandler(trackID: number, completionHandler: (p1: AVFragmentedMovieTrack, p2: NSError) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	trackWithTrackID(trackID: number): AVFragmentedMovieTrack;
}

/**
 * @since 13.0
 */
declare var AVFragmentedMovieContainsMovieFragmentsDidChangeNotification: string;

/**
 * @since 13.0
 */
declare var AVFragmentedMovieDurationDidChangeNotification: string;

/**
 * @since 13.0
 */
declare class AVFragmentedMovieMinder extends AVFragmentedAssetMinder {

	static alloc(): AVFragmentedMovieMinder; // inherited from NSObject

	static fragmentedAssetMinderWithAssetMindingInterval(asset: AVAsset & AVFragmentMinding, mindingInterval: number): AVFragmentedMovieMinder; // inherited from AVFragmentedAssetMinder

	static fragmentedMovieMinderWithMovieMindingInterval(movie: AVFragmentedMovie, mindingInterval: number): AVFragmentedMovieMinder;

	static new(): AVFragmentedMovieMinder; // inherited from NSObject

	readonly movies: NSArray<AVFragmentedMovie>;

	constructor(o: { movie: AVFragmentedMovie; mindingInterval: number; });

	addFragmentedMovie(movie: AVFragmentedMovie): void;

	initWithMovieMindingInterval(movie: AVFragmentedMovie, mindingInterval: number): this;

	removeFragmentedMovie(movie: AVFragmentedMovie): void;
}

/**
 * @since 13.0
 */
declare class AVFragmentedMovieTrack extends AVMovieTrack {

	static alloc(): AVFragmentedMovieTrack; // inherited from NSObject

	static new(): AVFragmentedMovieTrack; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare var AVFragmentedMovieTrackSegmentsDidChangeNotification: string;

/**
 * @since 13.0
 */
declare var AVFragmentedMovieTrackTimeRangeDidChangeNotification: string;

/**
 * @since 13.0
 */
declare var AVFragmentedMovieWasDefragmentedNotification: string;

/**
 * @since 7.0
 */
declare class AVFrameRateRange extends NSObject {

	static alloc(): AVFrameRateRange; // inherited from NSObject

	static new(): AVFrameRateRange; // inherited from NSObject

	readonly maxFrameDuration: CMTime;

	readonly maxFrameRate: number;

	readonly minFrameDuration: CMTime;

	readonly minFrameRate: number;
}

declare const enum AVKeyValueStatus {

	Unknown = 0,

	Loading = 1,

	Loaded = 2,

	Failed = 3,

	Cancelled = 4
}

/**
 * @since 4.0
 */
declare var AVLayerVideoGravityResize: string;

/**
 * @since 4.0
 */
declare var AVLayerVideoGravityResizeAspect: string;

/**
 * @since 4.0
 */
declare var AVLayerVideoGravityResizeAspectFill: string;

/**
 * @since 4.0
 */
declare function AVMakeRectWithAspectRatioInsideRect(aspectRatio: CGSize, boundingRect: CGRect): CGRect;

/**
 * @since 4.0
 */
declare var AVMediaCharacteristicAudible: string;

/**
 * @since 17.0
 */
declare var AVMediaCharacteristicCarriesVideoStereoMetadata: string;

/**
 * @since 13.0
 */
declare var AVMediaCharacteristicContainsAlphaChannel: string;

/**
 * @since 14.0
 */
declare var AVMediaCharacteristicContainsHDRVideo: string;

/**
 * @since 5.0
 */
declare var AVMediaCharacteristicContainsOnlyForcedSubtitles: string;

/**
 * @since 17.0
 */
declare var AVMediaCharacteristicContainsStereoMultiviewVideo: string;

/**
 * @since 5.0
 */
declare var AVMediaCharacteristicDescribesMusicAndSoundForAccessibility: string;

/**
 * @since 5.0
 */
declare var AVMediaCharacteristicDescribesVideoForAccessibility: string;

/**
 * @since 9.0
 */
declare var AVMediaCharacteristicDubbedTranslation: string;

/**
 * @since 6.0
 */
declare var AVMediaCharacteristicEasyToRead: string;

/**
 * @since 17.0
 */
declare var AVMediaCharacteristicEnhancesSpeechIntelligibility: string;

/**
 * @since 4.0
 */
declare var AVMediaCharacteristicFrameBased: string;

/**
 * @since 17.0
 */
declare var AVMediaCharacteristicIndicatesHorizontalFieldOfView: string;

/**
 * @since 5.0
 */
declare var AVMediaCharacteristicIsAuxiliaryContent: string;

/**
 * @since 5.0
 */
declare var AVMediaCharacteristicIsMainProgramContent: string;

/**
 * @since 12.0
 */
declare var AVMediaCharacteristicIsOriginalContent: string;

/**
 * @since 9.0
 */
declare var AVMediaCharacteristicLanguageTranslation: string;

/**
 * @since 4.0
 */
declare var AVMediaCharacteristicLegible: string;

/**
 * @since 17.0
 */
declare var AVMediaCharacteristicTactileMinimal: string;

/**
 * @since 5.0
 */
declare var AVMediaCharacteristicTranscribesSpokenDialogForAccessibility: string;

/**
 * @since 10.0
 */
declare var AVMediaCharacteristicUsesWideGamutColorSpace: string;

/**
 * @since 4.0
 */
declare var AVMediaCharacteristicVisual: string;

/**
 * @since 9.0
 */
declare var AVMediaCharacteristicVoiceOverTranslation: string;

/**
 * @since 13.0
 */
declare class AVMediaDataStorage extends NSObject {

	static alloc(): AVMediaDataStorage; // inherited from NSObject

	static new(): AVMediaDataStorage; // inherited from NSObject

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	URL(): NSURL;

	initWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): this;
}

/**
 * @since 9.0
 */
declare class AVMediaSelection extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVMediaSelection; // inherited from NSObject

	static new(): AVMediaSelection; // inherited from NSObject

	readonly asset: AVAsset;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mediaSelectionCriteriaCanBeAppliedAutomaticallyToMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	selectedMediaOptionInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): AVMediaSelectionOption;
}

/**
 * @since 5.0
 */
declare class AVMediaSelectionGroup extends NSObject implements NSCopying {

	static alloc(): AVMediaSelectionGroup; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	static mediaSelectionOptionsFromArrayFilteredAndSortedAccordingToPreferredLanguages(mediaSelectionOptions: NSArray<AVMediaSelectionOption> | AVMediaSelectionOption[], preferredLanguages: NSArray<string> | string[]): NSArray<AVMediaSelectionOption>;

	static mediaSelectionOptionsFromArrayWithLocale(mediaSelectionOptions: NSArray<AVMediaSelectionOption> | AVMediaSelectionOption[], locale: NSLocale): NSArray<AVMediaSelectionOption>;

	static mediaSelectionOptionsFromArrayWithMediaCharacteristics(mediaSelectionOptions: NSArray<AVMediaSelectionOption> | AVMediaSelectionOption[], mediaCharacteristics: NSArray<string> | string[]): NSArray<AVMediaSelectionOption>;

	static mediaSelectionOptionsFromArrayWithoutMediaCharacteristics(mediaSelectionOptions: NSArray<AVMediaSelectionOption> | AVMediaSelectionOption[], mediaCharacteristics: NSArray<string> | string[]): NSArray<AVMediaSelectionOption>;

	static new(): AVMediaSelectionGroup; // inherited from NSObject

	static playableMediaSelectionOptionsFromArray(mediaSelectionOptions: NSArray<AVMediaSelectionOption> | AVMediaSelectionOption[]): NSArray<AVMediaSelectionOption>;

	readonly allowsEmptySelection: boolean;

	/**
	 * @since 8.0
	 */
	readonly defaultOption: AVMediaSelectionOption;

	readonly options: NSArray<AVMediaSelectionOption>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	makeNowPlayingInfoLanguageOptionGroup(): MPNowPlayingInfoLanguageOptionGroup;

	mediaSelectionOptionWithPropertyList(plist: any): AVMediaSelectionOption;
}

/**
 * @since 5.0
 */
declare class AVMediaSelectionOption extends NSObject implements NSCopying {

	static alloc(): AVMediaSelectionOption; // inherited from NSObject

	static new(): AVMediaSelectionOption; // inherited from NSObject

	readonly availableMetadataFormats: NSArray<string>;

	readonly commonMetadata: NSArray<AVMetadataItem>;

	/**
	 * @since 7.0
	 */
	readonly displayName: string;

	/**
	 * @since 7.0
	 */
	readonly extendedLanguageTag: string;

	readonly locale: NSLocale;

	readonly mediaSubTypes: NSArray<number>;

	readonly mediaType: string;

	readonly playable: boolean;

	associatedMediaSelectionOptionInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): AVMediaSelectionOption;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 7.0
	 */
	displayNameWithLocale(locale: NSLocale): string;

	hasMediaCharacteristic(mediaCharacteristic: string): boolean;

	makeNowPlayingInfoLanguageOption(): MPNowPlayingInfoLanguageOption;

	metadataForFormat(format: string): NSArray<AVMetadataItem>;

	propertyList(): any;
}

/**
 * @since 4.0
 */
declare var AVMediaTypeAudio: string;

/**
 * @since 14.0
 */
declare var AVMediaTypeAuxiliaryPicture: string;

/**
 * @since 4.0
 */
declare var AVMediaTypeClosedCaption: string;

/**
 * @since 11.0
 */
declare var AVMediaTypeDepthData: string;

/**
 * @since 10.0
 */
declare var AVMediaTypeHaptic: string;

/**
 * @since 6.0
 */
declare var AVMediaTypeMetadata: string;

/**
 * @since 9.0
 */
declare var AVMediaTypeMetadataObject: string;

/**
 * @since 4.0
 */
declare var AVMediaTypeMuxed: string;

/**
 * @since 4.0
 */
declare var AVMediaTypeSubtitle: string;

/**
 * @since 4.0
 */
declare var AVMediaTypeText: string;

/**
 * @since 4.0
 */
declare var AVMediaTypeTimecode: string;

/**
 * @since 4.0
 */
declare var AVMediaTypeVideo: string;

/**
 * @since 7.0
 */
declare var AVMetadata3GPUserDataKeyAlbumAndTrack: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyAuthor: string;

/**
 * @since 7.0
 */
declare var AVMetadata3GPUserDataKeyCollection: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyCopyright: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyGenre: string;

/**
 * @since 7.0
 */
declare var AVMetadata3GPUserDataKeyKeywordList: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyLocation: string;

/**
 * @since 7.0
 */
declare var AVMetadata3GPUserDataKeyMediaClassification: string;

/**
 * @since 7.0
 */
declare var AVMetadata3GPUserDataKeyMediaRating: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyPerformer: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyRecordingYear: string;

/**
 * @since 7.0
 */
declare var AVMetadata3GPUserDataKeyThumbnail: string;

/**
 * @since 4.0
 */
declare var AVMetadata3GPUserDataKeyTitle: string;

/**
 * @since 7.0
 */
declare var AVMetadata3GPUserDataKeyUserRating: string;

/**
 * @since 13.0
 */
declare class AVMetadataBodyObject extends AVMetadataObject implements NSCopying {

	static alloc(): AVMetadataBodyObject; // inherited from NSObject

	static new(): AVMetadataBodyObject; // inherited from NSObject

	readonly bodyID: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class AVMetadataCatBodyObject extends AVMetadataBodyObject implements NSCopying {

	static alloc(): AVMetadataCatBodyObject; // inherited from NSObject

	static new(): AVMetadataCatBodyObject; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 14.0
 */
declare var AVMetadataCommonIdentifierAccessibilityDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierAlbumName: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierArtwork: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierAssetIdentifier: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierAuthor: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierContributor: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierCopyrights: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierCreationDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierCreator: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierFormat: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierLanguage: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierLastModifiedDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierLocation: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierMake: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierModel: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierPublisher: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierRelation: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierSoftware: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierSource: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierSubject: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataCommonIdentifierType: string;

/**
 * @since 14.0
 */
declare var AVMetadataCommonKeyAccessibilityDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyAlbumName: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyArtwork: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyAuthor: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyContributor: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyCopyrights: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyCreationDate: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyCreator: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyFormat: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyIdentifier: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyLanguage: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyLastModifiedDate: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyLocation: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyMake: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyModel: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyPublisher: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyRelation: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeySoftware: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeySource: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeySubject: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyTitle: string;

/**
 * @since 4.0
 */
declare var AVMetadataCommonKeyType: string;

/**
 * @since 13.0
 */
declare class AVMetadataDogBodyObject extends AVMetadataBodyObject implements NSCopying {

	static alloc(): AVMetadataDogBodyObject; // inherited from NSObject

	static new(): AVMetadataDogBodyObject; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare var AVMetadataExtraAttributeBaseURIKey: string;

/**
 * @since 9.0
 */
declare var AVMetadataExtraAttributeInfoKey: string;

/**
 * @since 8.0
 */
declare var AVMetadataExtraAttributeValueURIKey: string;

/**
 * @since 6.0
 */
declare class AVMetadataFaceObject extends AVMetadataObject implements NSCopying {

	static alloc(): AVMetadataFaceObject; // inherited from NSObject

	static new(): AVMetadataFaceObject; // inherited from NSObject

	readonly faceID: number;

	readonly hasRollAngle: boolean;

	readonly hasYawAngle: boolean;

	readonly rollAngle: number;

	readonly yawAngle: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare var AVMetadataFormatHLSMetadata: string;

/**
 * @since 4.0
 */
declare var AVMetadataFormatID3Metadata: string;

/**
 * @since 7.0
 */
declare var AVMetadataFormatISOUserData: string;

/**
 * @since 4.0
 */
declare var AVMetadataFormatQuickTimeMetadata: string;

/**
 * @since 4.0
 */
declare var AVMetadataFormatQuickTimeUserData: string;

/**
 * @since 11.0
 */
declare var AVMetadataFormatUnknown: string;

/**
 * @since 4.0
 */
declare var AVMetadataFormatiTunesMetadata: string;

/**
 * @since 9.0
 */
declare class AVMetadataGroup extends NSObject {

	static alloc(): AVMetadataGroup; // inherited from NSObject

	static new(): AVMetadataGroup; // inherited from NSObject

	/**
	 * @since 9.3
	 */
	readonly classifyingLabel: string;

	readonly items: NSArray<AVMetadataItem>;

	/**
	 * @since 9.3
	 */
	readonly uniqueID: string;
}

/**
 * @since 13.0
 */
declare class AVMetadataHumanBodyObject extends AVMetadataBodyObject implements NSCopying {

	static alloc(): AVMetadataHumanBodyObject; // inherited from NSObject

	static new(): AVMetadataHumanBodyObject; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 17.0
 */
declare class AVMetadataHumanFullBodyObject extends AVMetadataBodyObject implements NSCopying {

	static alloc(): AVMetadataHumanFullBodyObject; // inherited from NSObject

	static new(): AVMetadataHumanFullBodyObject; // inherited from NSObject

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyAlbumSortOrder: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyAlbumTitle: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyAttachedPicture: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyAudioEncryption: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyAudioSeekPointIndex: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyBand: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyBeatsPerMinute: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyComments: string;

/**
 * @since 9.0
 */
declare var AVMetadataID3MetadataKeyCommercial: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyCommercialInformation: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var AVMetadataID3MetadataKeyCommerical: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyComposer: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyConductor: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyContentGroupDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyContentType: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyCopyright: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyCopyrightInformation: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyDate: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyEncodedBy: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyEncodedWith: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyEncodingTime: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyEncryption: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyEqualization: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyEqualization2: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyEventTimingCodes: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyFileOwner: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyFileType: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyGeneralEncapsulatedObject: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyGroupIdentifier: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyInitialKey: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyInternationalStandardRecordingCode: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyInternetRadioStationName: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyInternetRadioStationOwner: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyInvolvedPeopleList_v23: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyInvolvedPeopleList_v24: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyLanguage: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyLeadPerformer: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyLength: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyLink: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyLyricist: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyMPEGLocationLookupTable: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyMediaType: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyModifiedBy: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyMood: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyMusicCDIdentifier: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyMusicianCreditsList: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOfficialArtistWebpage: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOfficialAudioFileWebpage: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOfficialAudioSourceWebpage: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOfficialInternetRadioStationHomepage: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOfficialPublisherWebpage: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOriginalAlbumTitle: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOriginalArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOriginalFilename: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOriginalLyricist: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOriginalReleaseTime: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOriginalReleaseYear: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyOwnership: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPartOfASet: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPayment: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPerformerSortOrder: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPlayCounter: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPlaylistDelay: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPopularimeter: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPositionSynchronization: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPrivate: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyProducedNotice: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyPublisher: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyRecommendedBufferSize: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyRecordingDates: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyRecordingTime: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyRelativeVolumeAdjustment: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyRelativeVolumeAdjustment2: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyReleaseTime: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyReverb: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeySeek: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeySetSubtitle: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeySignature: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeySize: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeySubTitle: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeySynchronizedLyric: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeySynchronizedTempoCodes: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyTaggingTime: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyTermsOfUse: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyTime: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyTitleDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyTitleSortOrder: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyTrackNumber: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyUniqueFileIdentifier: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyUnsynchronizedLyric: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyUserText: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyUserURL: string;

/**
 * @since 4.0
 */
declare var AVMetadataID3MetadataKeyYear: string;

/**
 * @since 14.0
 */
declare var AVMetadataISOUserDataKeyAccessibilityDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataISOUserDataKeyCopyright: string;

/**
 * @since 10.0
 */
declare var AVMetadataISOUserDataKeyDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataISOUserDataKeyTaggedCharacteristic: string;

/**
 * @since 8.0
 */
declare var AVMetadataIcyMetadataKeyStreamTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIcyMetadataKeyStreamURL: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataAlbumAndTrack: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataAuthor: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataCollection: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataCopyright: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataGenre: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataKeywordList: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataLocation: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataMediaClassification: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataMediaRating: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataPerformer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataRecordingYear: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataThumbnail: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifier3GPUserDataUserRating: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataAlbumSortOrder: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataAlbumTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataAttachedPicture: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataAudioEncryption: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataAudioSeekPointIndex: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataBand: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataBeatsPerMinute: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataComments: string;

/**
 * @since 9.0
 */
declare var AVMetadataIdentifierID3MetadataCommercial: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataCommercialInformation: string;

/**
 * @since 8.0
 * @deprecated 9.0
 */
declare var AVMetadataIdentifierID3MetadataCommerical: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataComposer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataConductor: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataContentGroupDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataContentType: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataCopyright: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataCopyrightInformation: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataEncodedBy: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataEncodedWith: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataEncodingTime: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataEncryption: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataEqualization: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataEqualization2: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataEventTimingCodes: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataFileOwner: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataFileType: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataGeneralEncapsulatedObject: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataGroupIdentifier: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataInitialKey: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataInternationalStandardRecordingCode: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataInternetRadioStationName: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataInternetRadioStationOwner: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataInvolvedPeopleList_v23: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataInvolvedPeopleList_v24: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataLanguage: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataLeadPerformer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataLength: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataLink: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataLyricist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataMPEGLocationLookupTable: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataMediaType: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataModifiedBy: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataMood: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataMusicCDIdentifier: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataMusicianCreditsList: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOfficialArtistWebpage: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOfficialAudioFileWebpage: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOfficialAudioSourceWebpage: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOfficialInternetRadioStationHomepage: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOfficialPublisherWebpage: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOriginalAlbumTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOriginalArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOriginalFilename: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOriginalLyricist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOriginalReleaseTime: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOriginalReleaseYear: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataOwnership: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPartOfASet: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPayment: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPerformerSortOrder: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPlayCounter: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPlaylistDelay: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPopularimeter: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPositionSynchronization: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPrivate: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataProducedNotice: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataPublisher: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataRecommendedBufferSize: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataRecordingDates: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataRecordingTime: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataRelativeVolumeAdjustment: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataRelativeVolumeAdjustment2: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataReleaseTime: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataReverb: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataSeek: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataSetSubtitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataSignature: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataSize: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataSubTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataSynchronizedLyric: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataSynchronizedTempoCodes: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataTaggingTime: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataTermsOfUse: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataTime: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataTitleDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataTitleSortOrder: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataTrackNumber: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataUniqueFileIdentifier: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataUnsynchronizedLyric: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataUserText: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataUserURL: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierID3MetadataYear: string;

/**
 * @since 14.0
 */
declare var AVMetadataIdentifierISOUserDataAccessibilityDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierISOUserDataCopyright: string;

/**
 * @since 10.0
 */
declare var AVMetadataIdentifierISOUserDataDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierISOUserDataTaggedCharacteristic: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierIcyMetadataStreamTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierIcyMetadataStreamURL: string;

/**
 * @since 14.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataAccessibilityDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataAlbum: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataArranger: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataArtwork: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataAuthor: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataAutoLivePhoto: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataCameraFrameReadoutTime: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataCameraIdentifier: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataCollectionUser: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataComment: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataComposer: string;

/**
 * @since 9.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataContentIdentifier: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataCopyright: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataCreationDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataCredits: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDescription: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDetectedCatBody: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDetectedDogBody: string;

/**
 * @since 9.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDetectedFace: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDetectedHumanBody: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDetectedSalientObject: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDirectionFacing: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDirectionMotion: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDirector: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataDisplayName: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataEncodedBy: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataGenre: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataInformation: string;

/**
 * @since 15.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataIsMontage: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataKeywords: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLivePhotoVitalityScore: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLivePhotoVitalityScoringVersion: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLocationBody: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLocationDate: string;

/**
 * @since 14.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLocationHorizontalAccuracyInMeters: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLocationISO6709: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLocationName: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLocationNote: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataLocationRole: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataMake: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataModel: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataOriginalArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataPerformer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataPhonogramRights: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataPreferredAffineTransform: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataProducer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataPublisher: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataRatingUser: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataSoftware: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataSpatialOverCaptureQualityScore: string;

/**
 * @since 13.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataSpatialOverCaptureQualityScoringVersion: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataTitle: string;

/**
 * @since 9.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataVideoOrientation: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataYear: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeMetadataiXML: string;

/**
 * @since 14.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataAccessibilityDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataAlbum: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataArranger: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataAuthor: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataChapter: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataComment: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataComposer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataCopyright: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataCreationDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataCredits: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataDirector: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataDisclaimer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataEncodedBy: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataFullName: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataGenre: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataHostComputer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataInformation: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataKeywords: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataLocationISO6709: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataMake: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataModel: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataOriginalArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataOriginalFormat: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataOriginalSource: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataPerformers: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataPhonogramRights: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataProducer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataProduct: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataPublisher: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataSoftware: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataSpecialPlaybackRequirements: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataTaggedCharacteristic: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataTrack: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataTrackName: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataURLLink: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataWarning: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifierQuickTimeUserDataWriter: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataAccountKind: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataAcknowledgement: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataAlbum: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataAlbumArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataAppleID: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataArranger: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataArtDirector: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataArtistID: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataAuthor: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataBeatsPerMin: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataComposer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataConductor: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataContentRating: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataCopyright: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataCoverArt: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataCredits: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataDescription: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataDirector: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataDiscCompilation: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataDiscNumber: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataEQ: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataEncodedBy: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataEncodingTool: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataExecProducer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataGenreID: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataGrouping: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataLinerNotes: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataLyrics: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataOnlineExtras: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataOriginalArtist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataPerformer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataPhonogramRights: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataPlaylistID: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataPredefinedGenre: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataProducer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataPublisher: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataRecordCompany: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataReleaseDate: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataSoloist: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataSongID: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataSongName: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataSoundEngineer: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataThanks: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataTrackNumber: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataTrackSubTitle: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataUserComment: string;

/**
 * @since 8.0
 */
declare var AVMetadataIdentifieriTunesMetadataUserGenre: string;

/**
 * @since 4.0
 */
declare class AVMetadataItem extends NSObject implements AVAsynchronousKeyValueLoading, NSCopying, NSMutableCopying {

	static alloc(): AVMetadataItem; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	static identifierForKeyKeySpace(key: any, keySpace: string): string;

	/**
	 * @since 8.0
	 */
	static keyForIdentifier(identifier: string): any;

	/**
	 * @since 8.0
	 */
	static keySpaceForIdentifier(identifier: string): string;

	/**
	 * @since 9.0
	 */
	static metadataItemWithPropertiesOfMetadataItemValueLoadingHandler(metadataItem: AVMetadataItem, handler: (p1: AVMetadataItemValueRequest) => void): AVMetadataItem;

	/**
	 * @since 6.0
	 */
	static metadataItemsFromArrayFilteredAndSortedAccordingToPreferredLanguages(metadataItems: NSArray<AVMetadataItem> | AVMetadataItem[], preferredLanguages: NSArray<string> | string[]): NSArray<AVMetadataItem>;

	/**
	 * @since 8.0
	 */
	static metadataItemsFromArrayFilteredByIdentifier(metadataItems: NSArray<AVMetadataItem> | AVMetadataItem[], identifier: string): NSArray<AVMetadataItem>;

	/**
	 * @since 7.0
	 */
	static metadataItemsFromArrayFilteredByMetadataItemFilter(metadataItems: NSArray<AVMetadataItem> | AVMetadataItem[], metadataItemFilter: AVMetadataItemFilter): NSArray<AVMetadataItem>;

	static metadataItemsFromArrayWithKeyKeySpace(metadataItems: NSArray<AVMetadataItem> | AVMetadataItem[], key: any, keySpace: string): NSArray<AVMetadataItem>;

	static metadataItemsFromArrayWithLocale(metadataItems: NSArray<AVMetadataItem> | AVMetadataItem[], locale: NSLocale): NSArray<AVMetadataItem>;

	static new(): AVMetadataItem; // inherited from NSObject

	readonly commonKey: string;

	/**
	 * @since 8.0
	 */
	readonly dataType: string;

	readonly dataValue: NSData;

	readonly dateValue: Date;

	/**
	 * @since 4.2
	 */
	readonly duration: CMTime;

	/**
	 * @since 8.0
	 */
	readonly extendedLanguageTag: string;

	readonly extraAttributes: NSDictionary<string, any>;

	/**
	 * @since 8.0
	 */
	readonly identifier: string;

	readonly key: any;

	readonly keySpace: string;

	readonly locale: NSLocale;

	readonly numberValue: number;

	/**
	 * @since 9.0
	 */
	readonly startDate: Date;

	readonly stringValue: string;

	readonly time: CMTime;

	readonly value: any;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string> | string[], handler: () => void): void;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;
}

/**
 * @since 7.0
 */
declare class AVMetadataItemFilter extends NSObject {

	static alloc(): AVMetadataItemFilter; // inherited from NSObject

	static metadataItemFilterForSharing(): AVMetadataItemFilter;

	static new(): AVMetadataItemFilter; // inherited from NSObject
}

/**
 * @since 9.0
 */
declare class AVMetadataItemValueRequest extends NSObject {

	static alloc(): AVMetadataItemValueRequest; // inherited from NSObject

	static new(): AVMetadataItemValueRequest; // inherited from NSObject

	readonly metadataItem: AVMetadataItem;

	respondWithError(error: NSError): void;

	respondWithValue(value: any): void;
}

/**
 * @since 11.0
 */
declare var AVMetadataKeySpaceAudioFile: string;

/**
 * @since 4.0
 */
declare var AVMetadataKeySpaceCommon: string;

/**
 * @since 9.3
 */
declare var AVMetadataKeySpaceHLSDateRange: string;

/**
 * @since 4.0
 */
declare var AVMetadataKeySpaceID3: string;

/**
 * @since 7.0
 */
declare var AVMetadataKeySpaceISOUserData: string;

/**
 * @since 8.0
 */
declare var AVMetadataKeySpaceIcy: string;

/**
 * @since 4.0
 */
declare var AVMetadataKeySpaceQuickTimeMetadata: string;

/**
 * @since 4.0
 */
declare var AVMetadataKeySpaceQuickTimeUserData: string;

/**
 * @since 4.0
 */
declare var AVMetadataKeySpaceiTunes: string;

/**
 * @since 7.0
 */
declare class AVMetadataMachineReadableCodeObject extends AVMetadataObject {

	static alloc(): AVMetadataMachineReadableCodeObject; // inherited from NSObject

	static new(): AVMetadataMachineReadableCodeObject; // inherited from NSObject

	readonly corners: NSArray<NSDictionary<any, any>>;

	/**
	 * @since 11.0
	 */
	readonly descriptor: CIBarcodeDescriptor;

	readonly stringValue: string;
}

/**
 * @since 6.0
 */
declare class AVMetadataObject extends NSObject {

	static alloc(): AVMetadataObject; // inherited from NSObject

	static new(): AVMetadataObject; // inherited from NSObject

	readonly bounds: CGRect;

	readonly duration: CMTime;

	readonly time: CMTime;

	readonly type: string;
}

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeAztecCode: string;

/**
 * @since 13.0
 */
declare var AVMetadataObjectTypeCatBody: string;

/**
 * @since 15.4
 */
declare var AVMetadataObjectTypeCodabarCode: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeCode128Code: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeCode39Code: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeCode39Mod43Code: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeCode93Code: string;

/**
 * @since 8.0
 */
declare var AVMetadataObjectTypeDataMatrixCode: string;

/**
 * @since 13.0
 */
declare var AVMetadataObjectTypeDogBody: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeEAN13Code: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeEAN8Code: string;

/**
 * @since 6.0
 */
declare var AVMetadataObjectTypeFace: string;

/**
 * @since 15.4
 */
declare var AVMetadataObjectTypeGS1DataBarCode: string;

/**
 * @since 15.4
 */
declare var AVMetadataObjectTypeGS1DataBarExpandedCode: string;

/**
 * @since 15.4
 */
declare var AVMetadataObjectTypeGS1DataBarLimitedCode: string;

/**
 * @since 13.0
 */
declare var AVMetadataObjectTypeHumanBody: string;

/**
 * @since 17.0
 */
declare var AVMetadataObjectTypeHumanFullBody: string;

/**
 * @since 8.0
 */
declare var AVMetadataObjectTypeITF14Code: string;

/**
 * @since 8.0
 */
declare var AVMetadataObjectTypeInterleaved2of5Code: string;

/**
 * @since 15.4
 */
declare var AVMetadataObjectTypeMicroPDF417Code: string;

/**
 * @since 15.4
 */
declare var AVMetadataObjectTypeMicroQRCode: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypePDF417Code: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeQRCode: string;

/**
 * @since 13.0
 */
declare var AVMetadataObjectTypeSalientObject: string;

/**
 * @since 7.0
 */
declare var AVMetadataObjectTypeUPCECode: string;

/**
 * @since 14.0
 */
declare var AVMetadataQuickTimeMetadataKeyAccessibilityDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyAlbum: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyArranger: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyArtwork: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyAuthor: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyCameraFrameReadoutTime: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyCameraIdentifier: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyCollectionUser: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyComment: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyComposer: string;

/**
 * @since 9.0
 */
declare var AVMetadataQuickTimeMetadataKeyContentIdentifier: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyCopyright: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyCreationDate: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyCredits: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyDescription: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyDirectionFacing: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyDirectionMotion: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyDirector: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyDisplayName: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyEncodedBy: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyGenre: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyInformation: string;

/**
 * @since 15.0
 */
declare var AVMetadataQuickTimeMetadataKeyIsMontage: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyKeywords: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyLocationBody: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyLocationDate: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyLocationISO6709: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyLocationName: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyLocationNote: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyLocationRole: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyMake: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyModel: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyOriginalArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyPerformer: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyPhonogramRights: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyProducer: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyPublisher: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyRatingUser: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeySoftware: string;

/**
 * @since 4.3
 */
declare var AVMetadataQuickTimeMetadataKeyTitle: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyYear: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeMetadataKeyiXML: string;

/**
 * @since 14.0
 */
declare var AVMetadataQuickTimeUserDataKeyAccessibilityDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyAlbum: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyArranger: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyAuthor: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyChapter: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyComment: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyComposer: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyCopyright: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyCreationDate: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyCredits: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyDirector: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyDisclaimer: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyEncodedBy: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyFullName: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyGenre: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyHostComputer: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyInformation: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyKeywords: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyLocationISO6709: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyMake: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyModel: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyOriginalArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyOriginalFormat: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyOriginalSource: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyPerformers: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyPhonogramRights: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyProducer: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyProduct: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyPublisher: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeySoftware: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeySpecialPlaybackRequirements: string;

/**
 * @since 5.0
 */
declare var AVMetadataQuickTimeUserDataKeyTaggedCharacteristic: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyTrack: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyTrackName: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyURLLink: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyWarning: string;

/**
 * @since 4.0
 */
declare var AVMetadataQuickTimeUserDataKeyWriter: string;

/**
 * @since 13.0
 */
declare class AVMetadataSalientObject extends AVMetadataObject implements NSCopying {

	static alloc(): AVMetadataSalientObject; // inherited from NSObject

	static new(): AVMetadataSalientObject; // inherited from NSObject

	readonly objectID: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyAccountKind: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyAcknowledgement: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyAlbum: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyAlbumArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyAppleID: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyArranger: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyArtDirector: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyArtistID: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyAuthor: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyBeatsPerMin: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyComposer: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyConductor: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyContentRating: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyCopyright: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyCoverArt: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyCredits: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyDescription: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyDirector: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyDiscCompilation: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyDiscNumber: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyEQ: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyEncodedBy: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyEncodingTool: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyExecProducer: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyGenreID: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyGrouping: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyLinerNotes: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyLyrics: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyOnlineExtras: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyOriginalArtist: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyPerformer: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyPhonogramRights: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyPlaylistID: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyPredefinedGenre: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyProducer: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyPublisher: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyRecordCompany: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyReleaseDate: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeySoloist: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeySongID: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeySongName: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeySoundEngineer: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyThanks: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyTrackNumber: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyTrackSubTitle: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyUserComment: string;

/**
 * @since 4.0
 */
declare var AVMetadataiTunesMetadataKeyUserGenre: string;

/**
 * @since 18
 */
declare class AVMetricContentKeyRequestEvent extends AVMetricEvent {

	static alloc(): AVMetricContentKeyRequestEvent; // inherited from NSObject

	static new(): AVMetricContentKeyRequestEvent; // inherited from NSObject

	readonly contentKeySpecifier: AVContentKeySpecifier;

	readonly isClientInitiated: boolean;

	readonly mediaResourceRequestEvent: AVMetricMediaResourceRequestEvent;

	readonly mediaType: string;
}

/**
 * @since 18
 */
declare class AVMetricErrorEvent extends AVMetricEvent {

	static alloc(): AVMetricErrorEvent; // inherited from NSObject

	static new(): AVMetricErrorEvent; // inherited from NSObject

	readonly didRecover: boolean;

	readonly error: NSError;
}

/**
 * @since 18
 */
declare class AVMetricEvent extends NSObject implements NSSecureCoding {

	static alloc(): AVMetricEvent; // inherited from NSObject

	static new(): AVMetricEvent; // inherited from NSObject

	readonly date: Date;

	readonly mediaTime: CMTime;

	readonly sessionID: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18
 */
declare class AVMetricEventStream extends NSObject {

	static alloc(): AVMetricEventStream; // inherited from NSObject

	static eventStream(): AVMetricEventStream;

	static new(): AVMetricEventStream; // inherited from NSObject

	addPublisher(publisher: AVMetricEventStreamPublisher): boolean;

	setSubscriberQueue(subscriber: AVMetricEventStreamSubscriber, queue: NSObject & OS_dispatch_queue): boolean;

	subscribeToAllMetricEvents(): void;

	subscribeToMetricEvent(metricEventClass: typeof NSObject): void;

	subscribeToMetricEvents(metricEventClasses: NSArray<typeof NSObject> | typeof NSObject[]): void;
}

/**
 * @since 18
 */
interface AVMetricEventStreamPublisher {
}
declare var AVMetricEventStreamPublisher: {

	prototype: AVMetricEventStreamPublisher;
};

/**
 * @since 18
 */
interface AVMetricEventStreamSubscriber {

	publisherDidReceiveEvent(publisher: AVMetricEventStreamPublisher, event: AVMetricEvent): void;
}
declare var AVMetricEventStreamSubscriber: {

	prototype: AVMetricEventStreamSubscriber;
};

/**
 * @since 18
 */
declare class AVMetricHLSMediaSegmentRequestEvent extends AVMetricEvent {

	static alloc(): AVMetricHLSMediaSegmentRequestEvent; // inherited from NSObject

	static new(): AVMetricHLSMediaSegmentRequestEvent; // inherited from NSObject

	readonly byteRange: NSRange;

	readonly indexFileURL: NSURL;

	readonly isMapSegment: boolean;

	readonly mediaResourceRequestEvent: AVMetricMediaResourceRequestEvent;

	readonly mediaType: string;

	readonly url: NSURL;
}

/**
 * @since 18
 */
declare class AVMetricHLSPlaylistRequestEvent extends AVMetricEvent {

	static alloc(): AVMetricHLSPlaylistRequestEvent; // inherited from NSObject

	static new(): AVMetricHLSPlaylistRequestEvent; // inherited from NSObject

	readonly isMultivariantPlaylist: boolean;

	readonly mediaResourceRequestEvent: AVMetricMediaResourceRequestEvent;

	readonly mediaType: string;

	readonly url: NSURL;
}

/**
 * @since 18
 */
declare class AVMetricMediaResourceRequestEvent extends AVMetricEvent {

	static alloc(): AVMetricMediaResourceRequestEvent; // inherited from NSObject

	static new(): AVMetricMediaResourceRequestEvent; // inherited from NSObject

	readonly byteRange: NSRange;

	readonly errorEvent: AVMetricErrorEvent;

	readonly networkTransactionMetrics: NSURLSessionTaskMetrics;

	readonly readFromCache: boolean;

	readonly requestEndTime: Date;

	readonly requestStartTime: Date;

	readonly responseEndTime: Date;

	readonly responseStartTime: Date;

	readonly serverAddress: string;

	readonly url: NSURL;
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemInitialLikelyToKeepUpEvent extends AVMetricPlayerItemLikelyToKeepUpEvent {

	static alloc(): AVMetricPlayerItemInitialLikelyToKeepUpEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemInitialLikelyToKeepUpEvent; // inherited from NSObject

	readonly contentKeyRequestEvents: NSArray<AVMetricContentKeyRequestEvent>;

	readonly mediaSegmentRequestEvents: NSArray<AVMetricHLSMediaSegmentRequestEvent>;

	readonly playlistRequestEvents: NSArray<AVMetricHLSPlaylistRequestEvent>;
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemLikelyToKeepUpEvent extends AVMetricEvent {

	static alloc(): AVMetricPlayerItemLikelyToKeepUpEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemLikelyToKeepUpEvent; // inherited from NSObject

	readonly loadedTimeRanges: NSArray<NSValue>;

	readonly timeTaken: number;

	readonly variant: AVAssetVariant;
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemPlaybackSummaryEvent extends AVMetricEvent {

	static alloc(): AVMetricPlayerItemPlaybackSummaryEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemPlaybackSummaryEvent; // inherited from NSObject

	readonly errorEvent: AVMetricErrorEvent;

	readonly mediaResourceRequestCount: number;

	readonly playbackDuration: number;

	readonly recoverableErrorCount: number;

	readonly stallCount: number;

	readonly timeSpentInInitialStartup: number;

	readonly timeSpentRecoveringFromStall: number;

	readonly timeWeightedAverageBitrate: number;

	readonly timeWeightedPeakBitrate: number;

	readonly variantSwitchCount: number;
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemRateChangeEvent extends AVMetricEvent {

	static alloc(): AVMetricPlayerItemRateChangeEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemRateChangeEvent; // inherited from NSObject

	readonly previousRate: number;

	readonly rate: number;

	readonly variant: AVAssetVariant;
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemSeekDidCompleteEvent extends AVMetricPlayerItemRateChangeEvent {

	static alloc(): AVMetricPlayerItemSeekDidCompleteEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemSeekDidCompleteEvent; // inherited from NSObject

	readonly didSeekInBuffer: boolean;
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemSeekEvent extends AVMetricPlayerItemRateChangeEvent {

	static alloc(): AVMetricPlayerItemSeekEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemSeekEvent; // inherited from NSObject
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemStallEvent extends AVMetricPlayerItemRateChangeEvent {

	static alloc(): AVMetricPlayerItemStallEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemStallEvent; // inherited from NSObject
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemVariantSwitchEvent extends AVMetricEvent {

	static alloc(): AVMetricPlayerItemVariantSwitchEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemVariantSwitchEvent; // inherited from NSObject

	readonly didSucceed: boolean;

	readonly fromVariant: AVAssetVariant;

	readonly loadedTimeRanges: NSArray<NSValue>;

	readonly toVariant: AVAssetVariant;
}

/**
 * @since 18
 */
declare class AVMetricPlayerItemVariantSwitchStartEvent extends AVMetricEvent {

	static alloc(): AVMetricPlayerItemVariantSwitchStartEvent; // inherited from NSObject

	static new(): AVMetricPlayerItemVariantSwitchStartEvent; // inherited from NSObject

	readonly fromVariant: AVAssetVariant;

	readonly loadedTimeRanges: NSArray<NSValue>;

	readonly toVariant: AVAssetVariant;
}

/**
 * @since 13.0
 */
declare class AVMovie extends AVAsset implements NSCopying, NSMutableCopying {

	static alloc(): AVMovie; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVMovie; // inherited from AVAsset

	static movieTypes(): NSArray<string>;

	/**
	 * @since 13.0
	 */
	static movieWithDataOptions(data: NSData, options: NSDictionary<string, any>): AVMovie;

	static movieWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): AVMovie;

	static new(): AVMovie; // inherited from NSObject

	readonly URL: NSURL;

	readonly canContainMovieFragments: boolean;

	/**
	 * @since 13.0
	 */
	readonly containsMovieFragments: boolean;

	/**
	 * @since 13.0
	 */
	readonly data: NSData;

	/**
	 * @since 13.0
	 */
	readonly defaultMediaDataStorage: AVMediaDataStorage;

	/**
	 * @since 13.0
	 */
	constructor(o: { data: NSData; options: NSDictionary<string, any>; });

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 13.0
	 */
	initWithDataOptions(data: NSData, options: NSDictionary<string, any>): this;

	initWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): this;

	/**
	 * @since 13.0
	 */
	isCompatibleWithFileType(fileType: string): boolean;

	/**
	 * @since 15.0
	 */
	loadTrackWithTrackIDCompletionHandler(trackID: number, completionHandler: (p1: AVMovieTrack, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	movieHeaderWithFileTypeError(fileType: string): NSData;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	trackWithTrackID(trackID: number): AVMovieTrack;

	/**
	 * @since 13.0
	 */
	writeMovieHeaderToURLFileTypeOptionsError(URL: NSURL, fileType: string, options: AVMovieWritingOptions): boolean;
}

/**
 * @since 13.0
 */
declare var AVMovieReferenceRestrictionsKey: string;

/**
 * @since 13.0
 */
declare var AVMovieShouldSupportAliasDataReferencesKey: string;

/**
 * @since 13.0
 */
declare class AVMovieTrack extends AVAssetTrack {

	static alloc(): AVMovieTrack; // inherited from NSObject

	static new(): AVMovieTrack; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly alternateGroupID: number;

	/**
	 * @since 13.0
	 */
	readonly mediaDataStorage: AVMediaDataStorage;

	/**
	 * @since 13.0
	 */
	readonly mediaDecodeTimeRange: CMTimeRange;

	/**
	 * @since 13.0
	 */
	readonly mediaPresentationTimeRange: CMTimeRange;
}

/**
 * @since 13.0
 */
declare const enum AVMovieWritingOptions {

	AddMovieHeaderToDestination = 0,

	TruncateDestinationToMovieHeaderOnly = 1
}

/**
 * @since 11.0
 */
declare class AVMutableAssetDownloadStorageManagementPolicy extends AVAssetDownloadStorageManagementPolicy {

	static alloc(): AVMutableAssetDownloadStorageManagementPolicy; // inherited from NSObject

	static new(): AVMutableAssetDownloadStorageManagementPolicy; // inherited from NSObject

	expirationDate: Date;

	priority: string;
}

/**
 * @since 4.0
 */
declare class AVMutableAudioMix extends AVAudioMix {

	static alloc(): AVMutableAudioMix; // inherited from NSObject

	static audioMix(): AVMutableAudioMix;

	static new(): AVMutableAudioMix; // inherited from NSObject

	inputParameters: NSArray<AVAudioMixInputParameters>;
}

/**
 * @since 4.0
 */
declare class AVMutableAudioMixInputParameters extends AVAudioMixInputParameters {

	static alloc(): AVMutableAudioMixInputParameters; // inherited from NSObject

	static audioMixInputParameters(): AVMutableAudioMixInputParameters;

	static audioMixInputParametersWithTrack(track: AVAssetTrack): AVMutableAudioMixInputParameters;

	static new(): AVMutableAudioMixInputParameters; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	audioTapProcessor: any;

	/**
	 * @since 7.0
	 */
	audioTimePitchAlgorithm: string;

	trackID: number;

	setVolumeAtTime(volume: number, time: CMTime): void;

	setVolumeRampFromStartVolumeToEndVolumeTimeRange(startVolume: number, endVolume: number, timeRange: CMTimeRange): void;
}

/**
 * @since 18.0
 */
declare class AVMutableCaption extends AVCaption {

	static alloc(): AVMutableCaption; // inherited from NSObject

	static new(): AVMutableCaption; // inherited from NSObject

	animation: AVCaptionAnimation;

	region: AVCaptionRegion;

	text: string;

	textAlignment: AVCaptionTextAlignment;

	timeRange: CMTimeRange;

	removeBackgroundColorInRange(range: NSRange): void;

	removeDecorationInRange(range: NSRange): void;

	removeFontStyleInRange(range: NSRange): void;

	removeFontWeightInRange(range: NSRange): void;

	removeRubyInRange(range: NSRange): void;

	removeTextColorInRange(range: NSRange): void;

	removeTextCombineInRange(range: NSRange): void;

	setBackgroundColorInRange(color: any, range: NSRange): void;

	setDecorationInRange(decoration: AVCaptionDecoration, range: NSRange): void;

	setFontStyleInRange(fontStyle: AVCaptionFontStyle, range: NSRange): void;

	setFontWeightInRange(fontWeight: AVCaptionFontWeight, range: NSRange): void;

	setRubyInRange(ruby: AVCaptionRuby, range: NSRange): void;

	setTextColorInRange(color: any, range: NSRange): void;

	setTextCombineInRange(textCombine: AVCaptionTextCombine, range: NSRange): void;
}

/**
 * @since 18.0
 */
declare class AVMutableCaptionRegion extends AVCaptionRegion {

	static alloc(): AVMutableCaptionRegion; // inherited from NSObject

	static new(): AVMutableCaptionRegion; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	displayAlignment: AVCaptionRegionDisplayAlignment;

	origin: AVCaptionPoint;

	scroll: AVCaptionRegionScroll;

	size: AVCaptionSize;

	/**
	 * @since 18.0
	 */
	writingMode: AVCaptionRegionWritingMode;

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

/**
 * @since 4.0
 */
declare class AVMutableComposition extends AVComposition {

	static alloc(): AVMutableComposition; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVMutableComposition; // inherited from AVAsset

	static composition(): AVMutableComposition;

	/**
	 * @since 9.0
	 */
	static compositionWithURLAssetInitializationOptions(URLAssetInitializationOptions: NSDictionary<string, any>): AVMutableComposition;

	static new(): AVMutableComposition; // inherited from NSObject

	naturalSize: CGSize;

	addMutableTrackWithMediaTypePreferredTrackID(mediaType: string, preferredTrackID: number): AVMutableCompositionTrack;

	insertEmptyTimeRange(timeRange: CMTimeRange): void;

	/**
	 * @since 16.0
	 * @deprecated 18.0
	 */
	insertTimeRangeOfAssetAtTimeCompletionHandler(timeRange: CMTimeRange, asset: AVAsset, startTime: CMTime, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	insertTimeRangeOfAssetAtTimeError(timeRange: CMTimeRange, asset: AVAsset, startTime: CMTime): boolean;

	/**
	 * @since 18.0
	 */
	insertTimeRangeOfTracksAtTimeError(timeRange: CMTimeRange, tracks: NSArray<AVAssetTrack> | AVAssetTrack[], startTime: CMTime): boolean;

	/**
	 * @since 15.0
	 */
	loadTrackWithTrackIDCompletionHandler(trackID: number, completionHandler: (p1: AVMutableCompositionTrack, p2: NSError) => void): void;

	mutableTrackCompatibleWithTrack(track: AVAssetTrack): AVMutableCompositionTrack;

	removeTimeRange(timeRange: CMTimeRange): void;

	removeTrack(track: AVCompositionTrack): void;

	scaleTimeRangeToDuration(timeRange: CMTimeRange, duration: CMTime): void;

	trackWithTrackID(trackID: number): AVMutableCompositionTrack;
}

/**
 * @since 4.0
 */
declare class AVMutableCompositionTrack extends AVCompositionTrack {

	static alloc(): AVMutableCompositionTrack; // inherited from NSObject

	static new(): AVMutableCompositionTrack; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	enabled: boolean;

	extendedLanguageTag: string;

	languageCode: string;

	naturalTimeScale: number;

	preferredTransform: CGAffineTransform;

	preferredVolume: number;

	segments: NSArray<AVCompositionTrackSegment>;

	/**
	 * @since 12.0
	 */
	addTrackAssociationToTrackType(compositionTrack: AVCompositionTrack, trackAssociationType: string): void;

	insertEmptyTimeRange(timeRange: CMTimeRange): void;

	insertTimeRangeOfTrackAtTimeError(timeRange: CMTimeRange, track: AVAssetTrack, startTime: CMTime): boolean;

	/**
	 * @since 5.0
	 */
	insertTimeRangesOfTracksAtTimeError(timeRanges: NSArray<NSValue> | NSValue[], tracks: NSArray<AVAssetTrack> | AVAssetTrack[], startTime: CMTime): boolean;

	removeTimeRange(timeRange: CMTimeRange): void;

	/**
	 * @since 12.0
	 */
	removeTrackAssociationToTrackType(compositionTrack: AVCompositionTrack, trackAssociationType: string): void;

	/**
	 * @since 13.0
	 */
	replaceFormatDescriptionWithFormatDescription(originalFormatDescription: any, replacementFormatDescription: any): void;

	scaleTimeRangeToDuration(timeRange: CMTimeRange, duration: CMTime): void;

	validateTrackSegmentsError(trackSegments: NSArray<AVCompositionTrackSegment> | AVCompositionTrackSegment[]): boolean;
}

/**
 * @since 9.0
 */
declare class AVMutableDateRangeMetadataGroup extends AVDateRangeMetadataGroup {

	static alloc(): AVMutableDateRangeMetadataGroup; // inherited from NSObject

	static new(): AVMutableDateRangeMetadataGroup; // inherited from NSObject

	endDate: Date;

	items: NSArray<AVMetadataItem>;

	startDate: Date;
}

/**
 * @since 9.0
 */
declare class AVMutableMediaSelection extends AVMediaSelection {

	static alloc(): AVMutableMediaSelection; // inherited from NSObject

	static new(): AVMutableMediaSelection; // inherited from NSObject

	selectMediaOptionInMediaSelectionGroup(mediaSelectionOption: AVMediaSelectionOption, mediaSelectionGroup: AVMediaSelectionGroup): void;
}

/**
 * @since 4.0
 */
declare class AVMutableMetadataItem extends AVMetadataItem {

	static alloc(): AVMutableMetadataItem; // inherited from NSObject

	static metadataItem(): AVMutableMetadataItem;

	static new(): AVMutableMetadataItem; // inherited from NSObject

	/**
	 * @since 8.0
	 */
	dataType: string;

	/**
	 * @since 4.2
	 */
	duration: CMTime;

	/**
	 * @since 8.0
	 */
	extendedLanguageTag: string;

	extraAttributes: NSDictionary<string, any>;

	/**
	 * @since 8.0
	 */
	identifier: string;

	key: any;

	keySpace: string;

	locale: NSLocale;

	/**
	 * @since 9.0
	 */
	startDate: Date;

	time: CMTime;

	value: any;
}

/**
 * @since 13.0
 */
declare class AVMutableMovie extends AVMovie {

	static alloc(): AVMutableMovie; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVMutableMovie; // inherited from AVAsset

	/**
	 * @since 13.0
	 */
	static movieWithDataOptions(data: NSData, options: NSDictionary<string, any>): AVMutableMovie; // inherited from AVMovie

	/**
	 * @since 13.0
	 */
	static movieWithDataOptionsError(data: NSData, options: NSDictionary<string, any>): AVMutableMovie;

	static movieWithSettingsFromMovieOptionsError(movie: AVMovie, options: NSDictionary<string, any>): AVMutableMovie;

	static movieWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): AVMutableMovie; // inherited from AVMovie

	static movieWithURLOptionsError(URL: NSURL, options: NSDictionary<string, any>): AVMutableMovie;

	static new(): AVMutableMovie; // inherited from NSObject

	defaultMediaDataStorage: AVMediaDataStorage;

	interleavingPeriod: CMTime;

	metadata: NSArray<AVMetadataItem>;

	modified: boolean;

	preferredRate: number;

	preferredTransform: CGAffineTransform;

	preferredVolume: number;

	timescale: number;

	constructor(o: { data: NSData; options: NSDictionary<string, any>; });

	constructor(o: { settingsFromMovie: AVMovie; options: NSDictionary<string, any>; });

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	addMutableTrackWithMediaTypeCopySettingsFromTrackOptions(mediaType: string, track: AVAssetTrack, options: NSDictionary<string, any>): AVMutableMovieTrack;

	addMutableTracksCopyingSettingsFromTracksOptions(existingTracks: NSArray<AVAssetTrack> | AVAssetTrack[], options: NSDictionary<string, any>): NSArray<AVMutableMovieTrack>;

	initWithDataOptionsError(data: NSData, options: NSDictionary<string, any>): this;

	initWithSettingsFromMovieOptionsError(movie: AVMovie, options: NSDictionary<string, any>): this;

	initWithURLOptionsError(URL: NSURL, options: NSDictionary<string, any>): this;

	insertEmptyTimeRange(timeRange: CMTimeRange): void;

	insertTimeRangeOfAssetAtTimeCopySampleDataError(timeRange: CMTimeRange, asset: AVAsset, startTime: CMTime, copySampleData: boolean): boolean;

	/**
	 * @since 15.0
	 */
	loadTrackWithTrackIDCompletionHandler(trackID: number, completionHandler: (p1: AVMutableMovieTrack, p2: NSError) => void): void;

	mutableTrackCompatibleWithTrack(track: AVAssetTrack): AVMutableMovieTrack;

	removeTimeRange(timeRange: CMTimeRange): void;

	removeTrack(track: AVMovieTrack): void;

	scaleTimeRangeToDuration(timeRange: CMTimeRange, duration: CMTime): void;

	trackWithTrackID(trackID: number): AVMutableMovieTrack;
}

/**
 * @since 13.0
 */
declare class AVMutableMovieTrack extends AVMovieTrack {

	static alloc(): AVMutableMovieTrack; // inherited from NSObject

	static new(): AVMutableMovieTrack; // inherited from NSObject

	alternateGroupID: number;

	cleanApertureDimensions: CGSize;

	enabled: boolean;

	encodedPixelsDimensions: CGSize;

	extendedLanguageTag: string;

	readonly hasProtectedContent: boolean;

	languageCode: string;

	layer: number;

	mediaDataStorage: AVMediaDataStorage;

	metadata: NSArray<AVMetadataItem>;

	modified: boolean;

	naturalSize: CGSize;

	preferredMediaChunkAlignment: number;

	preferredMediaChunkDuration: CMTime;

	preferredMediaChunkSize: number;

	preferredTransform: CGAffineTransform;

	preferredVolume: number;

	productionApertureDimensions: CGSize;

	sampleReferenceBaseURL: NSURL;

	timescale: number;

	addTrackAssociationToTrackType(movieTrack: AVMovieTrack, trackAssociationType: string): void;

	/**
	 * @since 13.0
	 */
	appendSampleBufferDecodeTimePresentationTimeError(sampleBuffer: any, outDecodeTime: interop.Pointer | interop.Reference<CMTime>, outPresentationTime: interop.Pointer | interop.Reference<CMTime>): boolean;

	insertEmptyTimeRange(timeRange: CMTimeRange): void;

	/**
	 * @since 13.0
	 */
	insertMediaTimeRangeIntoTimeRange(mediaTimeRange: CMTimeRange, trackTimeRange: CMTimeRange): boolean;

	insertTimeRangeOfTrackAtTimeCopySampleDataError(timeRange: CMTimeRange, track: AVAssetTrack, startTime: CMTime, copySampleData: boolean): boolean;

	removeTimeRange(timeRange: CMTimeRange): void;

	removeTrackAssociationToTrackType(movieTrack: AVMovieTrack, trackAssociationType: string): void;

	/**
	 * @since 13.0
	 */
	replaceFormatDescriptionWithFormatDescription(formatDescription: any, newFormatDescription: any): void;

	scaleTimeRangeToDuration(timeRange: CMTimeRange, duration: CMTime): void;
}

/**
 * @since 4.3
 */
declare class AVMutableTimedMetadataGroup extends AVTimedMetadataGroup {

	static alloc(): AVMutableTimedMetadataGroup; // inherited from NSObject

	static new(): AVMutableTimedMetadataGroup; // inherited from NSObject

	items: NSArray<AVMetadataItem>;

	timeRange: CMTimeRange;
}

/**
 * @since 4.0
 */
declare class AVMutableVideoComposition extends AVVideoComposition {

	static alloc(): AVMutableVideoComposition; // inherited from NSObject

	static new(): AVMutableVideoComposition; // inherited from NSObject

	static videoComposition(): AVMutableVideoComposition;

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	static videoCompositionWithAssetApplyingCIFiltersWithHandler(asset: AVAsset, applier: (p1: AVAsynchronousCIImageFilteringRequest) => void): AVMutableVideoComposition;

	/**
	 * @since 16.0
	 */
	static videoCompositionWithAssetApplyingCIFiltersWithHandlerCompletionHandler(asset: AVAsset, applier: (p1: AVAsynchronousCIImageFilteringRequest) => void, completionHandler: (p1: AVMutableVideoComposition, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	static videoCompositionWithPropertiesOfAssetPrototypeInstruction(asset: AVAsset, prototypeInstruction: AVVideoCompositionInstruction): AVMutableVideoComposition;

	/**
	 * @since 16.0
	 */
	static videoCompositionWithPropertiesOfAssetPrototypeInstructionCompletionHandler(asset: AVAsset, prototypeInstruction: AVVideoCompositionInstruction, completionHandler: (p1: AVMutableVideoComposition, p2: NSError) => void): void;

	animationTool: AVVideoCompositionCoreAnimationTool;

	/**
	 * @since 10.0
	 */
	colorPrimaries: string;

	/**
	 * @since 10.0
	 */
	colorTransferFunction: string;

	/**
	 * @since 10.0
	 */
	colorYCbCrMatrix: string;

	/**
	 * @since 7.0
	 */
	customVideoCompositorClass: typeof NSObject;

	frameDuration: CMTime;

	instructions: NSArray<AVVideoCompositionInstructionProtocol>;

	/**
	 * @since 17.0
	 */
	perFrameHDRDisplayMetadataPolicy: string;

	/**
	 * @since 4.0
	 */
	renderScale: number;

	renderSize: CGSize;

	/**
	 * @since 15.0
	 */
	sourceSampleDataTrackIDs: NSArray<number>;

	/**
	 * @since 11.0
	 */
	sourceTrackIDForFrameTiming: number;
}

/**
 * @since 4.0
 */
declare class AVMutableVideoCompositionInstruction extends AVVideoCompositionInstruction {

	static alloc(): AVMutableVideoCompositionInstruction; // inherited from NSObject

	static new(): AVMutableVideoCompositionInstruction; // inherited from NSObject

	static videoCompositionInstruction(): AVMutableVideoCompositionInstruction;

	backgroundColor: any;

	enablePostProcessing: boolean;

	layerInstructions: NSArray<AVVideoCompositionLayerInstruction>;

	/**
	 * @since 15.0
	 */
	requiredSourceSampleDataTrackIDs: NSArray<number>;

	timeRange: CMTimeRange;
}

/**
 * @since 4.0
 */
declare class AVMutableVideoCompositionLayerInstruction extends AVVideoCompositionLayerInstruction {

	static alloc(): AVMutableVideoCompositionLayerInstruction; // inherited from NSObject

	static new(): AVMutableVideoCompositionLayerInstruction; // inherited from NSObject

	static videoCompositionLayerInstruction(): AVMutableVideoCompositionLayerInstruction;

	static videoCompositionLayerInstructionWithAssetTrack(track: AVAssetTrack): AVMutableVideoCompositionLayerInstruction;

	trackID: number;

	/**
	 * @since 7.0
	 */
	setCropRectangleAtTime(cropRectangle: CGRect, time: CMTime): void;

	/**
	 * @since 7.0
	 */
	setCropRectangleRampFromStartCropRectangleToEndCropRectangleTimeRange(startCropRectangle: CGRect, endCropRectangle: CGRect, timeRange: CMTimeRange): void;

	setOpacityAtTime(opacity: number, time: CMTime): void;

	setOpacityRampFromStartOpacityToEndOpacityTimeRange(startOpacity: number, endOpacity: number, timeRange: CMTimeRange): void;

	setTransformAtTime(transform: CGAffineTransform, time: CMTime): void;

	setTransformRampFromStartTransformToEndTransformTimeRange(startTransform: CGAffineTransform, endTransform: CGAffineTransform, timeRange: CMTimeRange): void;
}

/**
 * @since 7.0
 */
declare class AVOutputSettingsAssistant extends NSObject {

	static alloc(): AVOutputSettingsAssistant; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	static availableOutputSettingsPresets(): NSArray<string>;

	static new(): AVOutputSettingsAssistant; // inherited from NSObject

	static outputSettingsAssistantWithPreset(presetIdentifier: string): AVOutputSettingsAssistant;

	readonly audioSettings: NSDictionary<string, any>;

	readonly outputFileType: string;

	sourceAudioFormat: any;

	sourceVideoAverageFrameDuration: CMTime;

	sourceVideoFormat: any;

	/**
	 * @since 7.0
	 */
	sourceVideoMinFrameDuration: CMTime;

	readonly videoSettings: NSDictionary<string, any>;
}

/**
 * @since 7.0
 */
declare var AVOutputSettingsPreset1280x720: string;

/**
 * @since 7.0
 */
declare var AVOutputSettingsPreset1920x1080: string;

/**
 * @since 9.0
 */
declare var AVOutputSettingsPreset3840x2160: string;

/**
 * @since 7.0
 */
declare var AVOutputSettingsPreset640x480: string;

/**
 * @since 7.0
 */
declare var AVOutputSettingsPreset960x540: string;

/**
 * @since 11.0
 */
declare var AVOutputSettingsPresetHEVC1920x1080: string;

/**
 * @since 13.0
 */
declare var AVOutputSettingsPresetHEVC1920x1080WithAlpha: string;

/**
 * @since 11.0
 */
declare var AVOutputSettingsPresetHEVC3840x2160: string;

/**
 * @since 13.0
 */
declare var AVOutputSettingsPresetHEVC3840x2160WithAlpha: string;

/**
 * @since 17.0
 */
declare var AVOutputSettingsPresetMVHEVC1440x1440: string;

/**
 * @since 17.0
 */
declare var AVOutputSettingsPresetMVHEVC960x960: string;

/**
 * @since 10.3
 */
declare class AVPersistableContentKeyRequest extends AVContentKeyRequest {

	static alloc(): AVPersistableContentKeyRequest; // inherited from NSObject

	static new(): AVPersistableContentKeyRequest; // inherited from NSObject

	persistableContentKeyFromKeyVendorResponseOptionsError(keyVendorResponse: NSData, options: NSDictionary<string, any>): NSData;
}

interface AVPixelAspectRatio {
	horizontalSpacing: number;
	verticalSpacing: number;
}
declare var AVPixelAspectRatio: interop.StructType<AVPixelAspectRatio>;

/**
 * @since 15.0
 */
declare class AVPlaybackCoordinator extends NSObject {

	static alloc(): AVPlaybackCoordinator; // inherited from NSObject

	static new(): AVPlaybackCoordinator; // inherited from NSObject

	readonly otherParticipants: NSArray<AVCoordinatedPlaybackParticipant>;

	pauseSnapsToMediaTimeOfOriginator: boolean;

	readonly suspensionReasons: NSArray<string>;

	suspensionReasonsThatTriggerWaiting: NSArray<string>;

	beginSuspensionForReason(suspensionReason: string): AVCoordinatedPlaybackSuspension;

	expectedItemTimeAtHostTime(hostClockTime: CMTime): CMTime;

	participantLimitForWaitingOutSuspensionsWithReason(reason: string): number;

	setParticipantLimitForWaitingOutSuspensionsWithReason(participantLimit: number, reason: string): void;
}

/**
 * @since 15.0
 */
declare var AVPlaybackCoordinatorOtherParticipantsDidChangeNotification: string;

/**
 * @since 15.0
 */
interface AVPlaybackCoordinatorPlaybackControlDelegate extends NSObjectProtocol {

	playbackCoordinatorDidIssueBufferingCommandCompletionHandler(coordinator: AVDelegatingPlaybackCoordinator, bufferingCommand: AVDelegatingPlaybackCoordinatorBufferingCommand, completionHandler: () => void): void;

	playbackCoordinatorDidIssuePauseCommandCompletionHandler(coordinator: AVDelegatingPlaybackCoordinator, pauseCommand: AVDelegatingPlaybackCoordinatorPauseCommand, completionHandler: () => void): void;

	playbackCoordinatorDidIssuePlayCommandCompletionHandler(coordinator: AVDelegatingPlaybackCoordinator, playCommand: AVDelegatingPlaybackCoordinatorPlayCommand, completionHandler: () => void): void;

	playbackCoordinatorDidIssueSeekCommandCompletionHandler(coordinator: AVDelegatingPlaybackCoordinator, seekCommand: AVDelegatingPlaybackCoordinatorSeekCommand, completionHandler: () => void): void;
}
declare var AVPlaybackCoordinatorPlaybackControlDelegate: {

	prototype: AVPlaybackCoordinatorPlaybackControlDelegate;
};

/**
 * @since 15.0
 */
declare var AVPlaybackCoordinatorSuspensionReasonsDidChangeNotification: string;

/**
 * @since 4.0
 */
declare class AVPlayer extends NSObject {

	static alloc(): AVPlayer; // inherited from NSObject

	static new(): AVPlayer; // inherited from NSObject

	static playerWithPlayerItem(item: AVPlayerItem): AVPlayer;

	static playerWithURL(URL: NSURL): AVPlayer;

	actionAtItemEnd: AVPlayerActionAtItemEnd;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	readonly airPlayVideoActive: boolean;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	allowsAirPlayVideo: boolean;

	/**
	 * @since 6.0
	 */
	allowsExternalPlayback: boolean;

	/**
	 * @since 7.0
	 */
	appliesMediaSelectionCriteriaAutomatically: boolean;

	/**
	 * @since 15.0
	 */
	audiovisualBackgroundPlaybackPolicy: AVPlayerAudiovisualBackgroundPlaybackPolicy;

	/**
	 * @since 10.0
	 */
	automaticallyWaitsToMinimizeStalling: boolean;

	/**
	 * @since 4.0
	 * @deprecated 11.0
	 */
	closedCaptionDisplayEnabled: boolean;

	readonly currentItem: AVPlayerItem;

	/**
	 * @since 16.0
	 */
	defaultRate: number;

	readonly error: NSError;

	/**
	 * @since 6.0
	 */
	readonly externalPlaybackActive: boolean;

	/**
	 * @since 6.0
	 */
	externalPlaybackVideoGravity: string;

	/**
	 * @since 6.0
	 * @deprecated 18.0
	 */
	masterClock: any;

	/**
	 * @since 7.0
	 */
	muted: boolean;

	/**
	 * @since 6.0
	 */
	readonly outputObscuredDueToInsufficientExternalProtection: boolean;

	/**
	 * @since 15.0
	 */
	readonly playbackCoordinator: AVPlayerPlaybackCoordinator;

	/**
	 * @since 12.0
	 */
	preventsDisplaySleepDuringVideoPlayback: boolean;

	rate: number;

	/**
	 * @since 10.0
	 */
	readonly reasonForWaitingToPlay: string;

	/**
	 * @since 15.0
	 */
	sourceClock: any;

	readonly status: AVPlayerStatus;

	/**
	 * @since 10.0
	 */
	readonly timeControlStatus: AVPlayerTimeControlStatus;

	/**
	 * @since 5.0
	 * @deprecated 6.0
	 */
	usesAirPlayVideoWhileAirPlayScreenIsActive: boolean;

	/**
	 * @since 6.0
	 */
	usesExternalPlaybackWhileExternalScreenIsActive: boolean;

	videoOutput: AVPlayerVideoOutput;

	/**
	 * @since 7.0
	 */
	volume: number;

	/**
	 * @since 11.2
	 * @deprecated 100000
	 */
	static readonly availableHDRModes: AVPlayerHDRMode;

	/**
	 * @since 13.4
	 */
	static readonly eligibleForHDRPlayback: boolean;

	constructor(o: { playerItem: AVPlayerItem; });

	constructor(o: { URL: NSURL; });

	addBoundaryTimeObserverForTimesQueueUsingBlock(times: NSArray<NSValue> | NSValue[], queue: NSObject & OS_dispatch_queue, block: () => void): any;

	addPeriodicTimeObserverForIntervalQueueUsingBlock(interval: CMTime, queue: NSObject & OS_dispatch_queue, block: (p1: CMTime) => void): any;

	/**
	 * @since 6.0
	 */
	cancelPendingPrerolls(): void;

	currentTime(): CMTime;

	initWithPlayerItem(item: AVPlayerItem): this;

	initWithURL(URL: NSURL): this;

	/**
	 * @since 7.0
	 */
	mediaSelectionCriteriaForMediaCharacteristic(mediaCharacteristic: string): AVPlayerMediaSelectionCriteria;

	pause(): void;

	play(): void;

	/**
	 * @since 10.0
	 */
	playImmediatelyAtRate(rate: number): void;

	/**
	 * @since 6.0
	 */
	prerollAtRateCompletionHandler(rate: number, completionHandler: (p1: boolean) => void): void;

	removeTimeObserver(observer: any): void;

	replaceCurrentItemWithPlayerItem(item: AVPlayerItem): void;

	seekToDate(date: Date): void;

	/**
	 * @since 5.0
	 */
	seekToDateCompletionHandler(date: Date, completionHandler: (p1: boolean) => void): void;

	seekToTime(time: CMTime): void;

	/**
	 * @since 5.0
	 */
	seekToTimeCompletionHandler(time: CMTime, completionHandler: (p1: boolean) => void): void;

	seekToTimeToleranceBeforeToleranceAfter(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime): void;

	/**
	 * @since 5.0
	 */
	seekToTimeToleranceBeforeToleranceAfterCompletionHandler(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 7.0
	 */
	setMediaSelectionCriteriaForMediaCharacteristic(criteria: AVPlayerMediaSelectionCriteria, mediaCharacteristic: string): void;

	/**
	 * @since 6.0
	 */
	setRateTimeAtHostTime(rate: number, itemTime: CMTime, hostClockTime: CMTime): void;
}

declare const enum AVPlayerActionAtItemEnd {

	Advance = 0,

	Pause = 1,

	None = 2
}

/**
 * @since 15.0
 */
declare const enum AVPlayerAudiovisualBackgroundPlaybackPolicy {

	Automatic = 1,

	Pauses = 2,

	ContinuesIfPossible = 3
}

/**
 * @since 11.2
 * @deprecated 100000
 */
declare var AVPlayerAvailableHDRModesDidChangeNotification: string;

/**
 * @since 13.4
 */
declare var AVPlayerEligibleForHDRPlaybackDidChangeNotification: string;

/**
 * @since 11.2
 * @deprecated 100000
 */
declare const enum AVPlayerHDRMode {

	HLG = 1,

	HDR10 = 2,

	DolbyVision = 4
}

/**
 * @since 18.0
 */
declare var AVPlayerIntegratedTimelineSnapshotsOutOfSyncNotification: string;

/**
 * @since 18.0
 */
declare var AVPlayerIntegratedTimelineSnapshotsOutOfSyncReasonCurrentSegmentChanged: string;

/**
 * @since 18.0
 */
declare var AVPlayerIntegratedTimelineSnapshotsOutOfSyncReasonKey: string;

/**
 * @since 18.0
 */
declare var AVPlayerIntegratedTimelineSnapshotsOutOfSyncReasonLoadedTimeRangesChanged: string;

/**
 * @since 18.0
 */
declare var AVPlayerIntegratedTimelineSnapshotsOutOfSyncReasonSegmentsChanged: string;

/**
 * @since 15.0
 */
declare class AVPlayerInterstitialEvent extends NSObject implements NSCopying {

	static alloc(): AVPlayerInterstitialEvent; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static interstitialEventWithPrimaryItemDate(primaryItem: AVPlayerItem, date: Date): AVPlayerInterstitialEvent;

	/**
	 * @since 15.0
	 * @deprecated 18.0
	 */
	static interstitialEventWithPrimaryItemIdentifierDateTemplateItemsRestrictionsResumptionOffsetPlayoutLimitUserDefinedAttributes(primaryItem: AVPlayerItem, identifier: string, date: Date, templateItems: NSArray<AVPlayerItem> | AVPlayerItem[], restrictions: AVPlayerInterstitialEventRestrictions, resumptionOffset: CMTime, playoutLimit: CMTime, userDefinedAttributes: NSDictionary<any, any>): AVPlayerInterstitialEvent;

	/**
	 * @since 15.0
	 * @deprecated 18.0
	 */
	static interstitialEventWithPrimaryItemIdentifierTimeTemplateItemsRestrictionsResumptionOffsetPlayoutLimitUserDefinedAttributes(primaryItem: AVPlayerItem, identifier: string, time: CMTime, templateItems: NSArray<AVPlayerItem> | AVPlayerItem[], restrictions: AVPlayerInterstitialEventRestrictions, resumptionOffset: CMTime, playoutLimit: CMTime, userDefinedAttributes: NSDictionary<any, any>): AVPlayerInterstitialEvent;

	/**
	 * @since 16.0
	 */
	static interstitialEventWithPrimaryItemTime(primaryItem: AVPlayerItem, time: CMTime): AVPlayerInterstitialEvent;

	static new(): AVPlayerInterstitialEvent; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	alignsResumptionWithPrimarySegmentBoundary: boolean;

	/**
	 * @since 16.0
	 */
	alignsStartWithPrimarySegmentBoundary: boolean;

	/**
	 * @since 16.4
	 */
	readonly assetListResponse: NSDictionary<any, any>;

	/**
	 * @since 18.0
	 */
	contentMayVary: boolean;

	/**
	 * @since 16.0
	 */
	cue: string;

	/**
	 * @since 16.0
	 */
	date: Date;

	/**
	 * @since 16.0
	 */
	identifier: string;

	/**
	 * @since 18.0
	 */
	plannedDuration: CMTime;

	/**
	 * @since 16.0
	 */
	playoutLimit: CMTime;

	/**
	 * @since 16.0
	 */
	primaryItem: AVPlayerItem;

	/**
	 * @since 16.0
	 */
	restrictions: AVPlayerInterstitialEventRestrictions;

	/**
	 * @since 16.0
	 */
	resumptionOffset: CMTime;

	/**
	 * @since 18.0
	 */
	supplementsPrimaryContent: boolean;

	/**
	 * @since 16.0
	 */
	templateItems: NSArray<AVPlayerItem>;

	/**
	 * @since 16.0
	 */
	time: CMTime;

	/**
	 * @since 18.0
	 */
	timelineOccupancy: AVPlayerInterstitialEventTimelineOccupancy;

	/**
	 * @since 16.0
	 */
	userDefinedAttributes: NSDictionary<any, any>;

	/**
	 * @since 16.0
	 */
	willPlayOnce: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 16.4
 */
declare const enum AVPlayerInterstitialEventAssetListResponseStatus {

	Available = 0,

	Cleared = 1,

	Unavailable = 2
}

/**
 * @since 15.0
 */
declare class AVPlayerInterstitialEventController extends AVPlayerInterstitialEventMonitor {

	static alloc(): AVPlayerInterstitialEventController; // inherited from NSObject

	static interstitialEventControllerWithPrimaryPlayer(primaryPlayer: AVPlayer): AVPlayerInterstitialEventController;

	static interstitialEventMonitorWithPrimaryPlayer(primaryPlayer: AVPlayer): AVPlayerInterstitialEventController; // inherited from AVPlayerInterstitialEventMonitor

	static new(): AVPlayerInterstitialEventController; // inherited from NSObject

	events: NSArray<AVPlayerInterstitialEvent>;

	cancelCurrentEventWithResumptionOffset(resumptionOffset: CMTime): void;
}

/**
 * @since 16.0
 */
declare var AVPlayerInterstitialEventJoinCue: string;

/**
 * @since 16.0
 */
declare var AVPlayerInterstitialEventLeaveCue: string;

/**
 * @since 15.0
 */
declare class AVPlayerInterstitialEventMonitor extends NSObject {

	static alloc(): AVPlayerInterstitialEventMonitor; // inherited from NSObject

	static interstitialEventMonitorWithPrimaryPlayer(primaryPlayer: AVPlayer): AVPlayerInterstitialEventMonitor;

	static new(): AVPlayerInterstitialEventMonitor; // inherited from NSObject

	readonly currentEvent: AVPlayerInterstitialEvent;

	readonly events: NSArray<AVPlayerInterstitialEvent>;

	readonly interstitialPlayer: AVQueuePlayer;

	readonly primaryPlayer: AVPlayer;

	constructor(o: { primaryPlayer: AVPlayer; });

	initWithPrimaryPlayer(primaryPlayer: AVPlayer): this;
}

/**
 * @since 16.4
 */
declare var AVPlayerInterstitialEventMonitorAssetListResponseStatusDidChangeErrorKey: string;

/**
 * @since 16.4
 */
declare var AVPlayerInterstitialEventMonitorAssetListResponseStatusDidChangeEventKey: string;

/**
 * @since 16.4
 */
declare var AVPlayerInterstitialEventMonitorAssetListResponseStatusDidChangeNotification: string;

/**
 * @since 16.4
 */
declare var AVPlayerInterstitialEventMonitorAssetListResponseStatusDidChangeStatusKey: string;

/**
 * @since 15.0
 */
declare var AVPlayerInterstitialEventMonitorCurrentEventDidChangeNotification: string;

/**
 * @since 15.0
 */
declare var AVPlayerInterstitialEventMonitorEventsDidChangeNotification: string;

/**
 * @since 16.0
 */
declare var AVPlayerInterstitialEventNoCue: string;

/**
 * @since 15.0
 */
declare const enum AVPlayerInterstitialEventRestrictions {

	None = 0,

	ConstrainsSeekingForwardInPrimaryContent = 1,

	RequiresPlaybackAtPreferredRateForAdvancement = 4,

	DefaultPolicy = 0
}

/**
 * @since 18.0
 */
declare const enum AVPlayerInterstitialEventTimelineOccupancy {

	SinglePoint = 0,

	Fill = 1
}

/**
 * @since 4.0
 */
declare class AVPlayerItem extends NSObject implements AVMetricEventStreamPublisher, NSCopying {

	static alloc(): AVPlayerItem; // inherited from NSObject

	static new(): AVPlayerItem; // inherited from NSObject

	static playerItemWithAsset(asset: AVAsset): AVPlayerItem;

	/**
	 * @since 7.0
	 */
	static playerItemWithAssetAutomaticallyLoadedAssetKeys(asset: AVAsset, automaticallyLoadedAssetKeys: NSArray<string> | string[]): AVPlayerItem;

	static playerItemWithURL(URL: NSURL): AVPlayerItem;

	/**
	 * @since 14.0
	 */
	allowedAudioSpatializationFormats: AVAudioSpatializationFormats;

	/**
	 * @since 14.0
	 */
	appliesPerFrameHDRDisplayMetadata: boolean;

	readonly asset: AVAsset;

	audioMix: AVAudioMix;

	/**
	 * @since 13.0
	 * @deprecated 18.0
	 */
	audioSpatializationAllowed: boolean;

	/**
	 * @since 7.0
	 */
	audioTimePitchAlgorithm: string;

	/**
	 * @since 15.0
	 */
	automaticallyHandlesInterstitialEvents: boolean;

	/**
	 * @since 7.0
	 */
	readonly automaticallyLoadedAssetKeys: NSArray<string>;

	/**
	 * @since 13.0
	 */
	automaticallyPreservesTimeOffsetFromLive: boolean;

	/**
	 * @since 5.0
	 */
	readonly canPlayFastForward: boolean;

	/**
	 * @since 5.0
	 */
	readonly canPlayFastReverse: boolean;

	/**
	 * @since 6.0
	 */
	readonly canPlayReverse: boolean;

	/**
	 * @since 6.0
	 */
	readonly canPlaySlowForward: boolean;

	/**
	 * @since 6.0
	 */
	readonly canPlaySlowReverse: boolean;

	/**
	 * @since 6.0
	 */
	readonly canStepBackward: boolean;

	/**
	 * @since 6.0
	 */
	readonly canStepForward: boolean;

	/**
	 * @since 9.0
	 */
	canUseNetworkResourcesForLiveStreamingWhilePaused: boolean;

	/**
	 * @since 13.0
	 */
	configuredTimeOffsetFromLive: CMTime;

	/**
	 * @since 9.0
	 */
	readonly currentMediaSelection: AVMediaSelection;

	/**
	 * @since 7.0
	 */
	readonly customVideoCompositor: AVVideoCompositing;

	/**
	 * @since 4.3
	 */
	readonly duration: CMTime;

	readonly error: NSError;

	/**
	 * @since 12.2
	 */
	externalMetadata: NSArray<AVMetadataItem>;

	forwardPlaybackEndTime: CMTime;

	/**
	 * @since 18.0
	 */
	readonly integratedTimeline: AVPlayerItemIntegratedTimeline;

	/**
	 * @since 16.0
	 */
	readonly interstitialTimeRanges: NSArray<AVInterstitialTimeRange>;

	readonly loadedTimeRanges: NSArray<NSValue>;

	/**
	 * @since 9.3
	 */
	readonly mediaDataCollectors: NSArray<AVPlayerItemMediaDataCollector>;

	/**
	 * @since 16.0
	 */
	nowPlayingInfo: NSDictionary<string, any>;

	/**
	 * @since 6.0
	 */
	readonly outputs: NSArray<AVPlayerItemOutput>;

	readonly playbackBufferEmpty: boolean;

	readonly playbackBufferFull: boolean;

	readonly playbackLikelyToKeepUp: boolean;

	/**
	 * @since 10.0
	 */
	preferredForwardBufferDuration: number;

	/**
	 * @since 11.0
	 */
	preferredMaximumResolution: CGSize;

	/**
	 * @since 15.0
	 */
	preferredMaximumResolutionForExpensiveNetworks: CGSize;

	/**
	 * @since 8.0
	 */
	preferredPeakBitRate: number;

	/**
	 * @since 15.0
	 */
	preferredPeakBitRateForExpensiveNetworks: number;

	readonly presentationSize: CGSize;

	/**
	 * @since 13.0
	 */
	readonly recommendedTimeOffsetFromLive: CMTime;

	reversePlaybackEndTime: CMTime;

	readonly seekableTimeRanges: NSArray<NSValue>;

	/**
	 * @since 6.0
	 */
	seekingWaitsForVideoCompositionRendering: boolean;

	/**
	 * @since 14.0
	 */
	startsOnFirstEligibleVariant: boolean;

	readonly status: AVPlayerItemStatus;

	/**
	 * @since 15.0
	 */
	readonly templatePlayerItem: AVPlayerItem;

	/**
	 * @since 6.0
	 */
	textStyleRules: NSArray<AVTextStyleRule>;

	/**
	 * @since 6.0
	 */
	readonly timebase: any;

	/**
	 * @since 4.0
	 * @deprecated 13.0
	 */
	readonly timedMetadata: NSArray<AVMetadataItem>;

	readonly tracks: NSArray<AVPlayerItemTrack>;

	/**
	 * @since 14.5
	 */
	variantPreferences: AVVariantPreferences;

	/**
	 * @since 11.0
	 */
	videoApertureMode: string;

	/**
	 * @since 4.0
	 */
	videoComposition: AVVideoComposition;

	constructor(o: { asset: AVAsset; });

	/**
	 * @since 7.0
	 */
	constructor(o: { asset: AVAsset; automaticallyLoadedAssetKeys: NSArray<string> | string[]; });

	constructor(o: { URL: NSURL; });

	/**
	 * @since 4.3
	 */
	accessLog(): AVPlayerItemAccessLog;

	/**
	 * @since 9.3
	 */
	addMediaDataCollector(collector: AVPlayerItemMediaDataCollector): void;

	/**
	 * @since 6.0
	 */
	addOutput(output: AVPlayerItemOutput): void;

	/**
	 * @since 5.0
	 */
	cancelPendingSeeks(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	currentDate(): Date;

	currentTime(): CMTime;

	/**
	 * @since 4.3
	 */
	errorLog(): AVPlayerItemErrorLog;

	initWithAsset(asset: AVAsset): this;

	/**
	 * @since 7.0
	 */
	initWithAssetAutomaticallyLoadedAssetKeys(asset: AVAsset, automaticallyLoadedAssetKeys: NSArray<string> | string[]): this;

	initWithURL(URL: NSURL): this;

	/**
	 * @since 9.3
	 */
	removeMediaDataCollector(collector: AVPlayerItemMediaDataCollector): void;

	/**
	 * @since 6.0
	 */
	removeOutput(output: AVPlayerItemOutput): void;

	/**
	 * @since 4.0
	 * @deprecated 11.0
	 */
	seekToDate(date: Date): boolean;

	/**
	 * @since 6.0
	 */
	seekToDateCompletionHandler(date: Date, completionHandler: (p1: boolean) => void): boolean;

	/**
	 * @since 4.0
	 * @deprecated 11.0
	 */
	seekToTime(time: CMTime): void;

	/**
	 * @since 5.0
	 */
	seekToTimeCompletionHandler(time: CMTime, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 4.0
	 * @deprecated 11.0
	 */
	seekToTimeToleranceBeforeToleranceAfter(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime): void;

	/**
	 * @since 5.0
	 */
	seekToTimeToleranceBeforeToleranceAfterCompletionHandler(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime, completionHandler: (p1: boolean) => void): void;

	/**
	 * @since 7.0
	 */
	selectMediaOptionAutomaticallyInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): void;

	/**
	 * @since 5.0
	 */
	selectMediaOptionInMediaSelectionGroup(mediaSelectionOption: AVMediaSelectionOption, mediaSelectionGroup: AVMediaSelectionGroup): void;

	/**
	 * @since 5.0
	 * @deprecated 11.0
	 */
	selectedMediaOptionInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): AVMediaSelectionOption;

	stepByCount(stepCount: number): void;
}

/**
 * @since 4.3
 */
declare class AVPlayerItemAccessLog extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemAccessLog; // inherited from NSObject

	static new(): AVPlayerItemAccessLog; // inherited from NSObject

	readonly events: NSArray<AVPlayerItemAccessLogEvent>;

	readonly extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	extendedLogData(): NSData;
}

/**
 * @since 4.3
 */
declare class AVPlayerItemAccessLogEvent extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemAccessLogEvent; // inherited from NSObject

	static new(): AVPlayerItemAccessLogEvent; // inherited from NSObject

	readonly URI: string;

	/**
	 * @since 10.0
	 */
	readonly averageAudioBitrate: number;

	/**
	 * @since 10.0
	 */
	readonly averageVideoBitrate: number;

	/**
	 * @since 7.0
	 */
	readonly downloadOverdue: number;

	readonly durationWatched: number;

	/**
	 * @since 10.0
	 */
	readonly indicatedAverageBitrate: number;

	readonly indicatedBitrate: number;

	/**
	 * @since 7.0
	 */
	readonly mediaRequestsWWAN: number;

	readonly numberOfBytesTransferred: number;

	readonly numberOfDroppedVideoFrames: number;

	/**
	 * @since 6.0
	 */
	readonly numberOfMediaRequests: number;

	/**
	 * @since 4.3
	 * @deprecated 7.0
	 */
	readonly numberOfSegmentsDownloaded: number;

	readonly numberOfServerAddressChanges: number;

	readonly numberOfStalls: number;

	readonly observedBitrate: number;

	/**
	 * @since 7.0
	 */
	readonly observedBitrateStandardDeviation: number;

	/**
	 * @since 7.0
	 * @deprecated 15.0
	 */
	readonly observedMaxBitrate: number;

	/**
	 * @since 7.0
	 * @deprecated 15.0
	 */
	readonly observedMinBitrate: number;

	readonly playbackSessionID: string;

	readonly playbackStartDate: Date;

	readonly playbackStartOffset: number;

	/**
	 * @since 7.0
	 */
	readonly playbackType: string;

	readonly segmentsDownloadedDuration: number;

	readonly serverAddress: string;

	/**
	 * @since 7.0
	 */
	readonly startupTime: number;

	/**
	 * @since 7.0
	 */
	readonly switchBitrate: number;

	/**
	 * @since 7.0
	 */
	readonly transferDuration: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.0
 */
declare var AVPlayerItemDidPlayToEndTimeNotification: string;

/**
 * @since 4.3
 */
declare class AVPlayerItemErrorLog extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemErrorLog; // inherited from NSObject

	static new(): AVPlayerItemErrorLog; // inherited from NSObject

	readonly events: NSArray<AVPlayerItemErrorLogEvent>;

	readonly extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	extendedLogData(): NSData;
}

/**
 * @since 4.3
 */
declare class AVPlayerItemErrorLogEvent extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemErrorLogEvent; // inherited from NSObject

	static new(): AVPlayerItemErrorLogEvent; // inherited from NSObject

	readonly URI: string;

	/**
	 * @since 17.5
	 */
	readonly allHTTPResponseHeaderFields: NSDictionary<string, string>;

	readonly date: Date;

	readonly errorComment: string;

	readonly errorDomain: string;

	readonly errorStatusCode: number;

	readonly playbackSessionID: string;

	readonly serverAddress: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.3
 */
declare var AVPlayerItemFailedToPlayToEndTimeErrorKey: string;

/**
 * @since 4.3
 */
declare var AVPlayerItemFailedToPlayToEndTimeNotification: string;

/**
 * @since 18.0
 */
declare class AVPlayerItemIntegratedTimeline extends NSObject {

	static alloc(): AVPlayerItemIntegratedTimeline; // inherited from NSObject

	static new(): AVPlayerItemIntegratedTimeline; // inherited from NSObject

	readonly currentDate: Date;

	readonly currentSnapshot: AVPlayerItemIntegratedTimelineSnapshot;

	readonly currentTime: CMTime;

	addBoundaryTimeObserverForSegmentOffsetsIntoSegmentQueueUsingBlock(segment: AVPlayerItemSegment, offsetsIntoSegment: NSArray<any> | any[], queue: NSObject & OS_dispatch_queue, block: (p1: boolean) => void): AVPlayerItemIntegratedTimelineObserver;

	addPeriodicTimeObserverForIntervalQueueUsingBlock(interval: CMTime, queue: NSObject & OS_dispatch_queue, block: (p1: CMTime) => void): AVPlayerItemIntegratedTimelineObserver;

	removeTimeObserver(observer: AVPlayerItemIntegratedTimelineObserver): void;

	seekToDateCompletionHandler(date: Date, completionHandler: (p1: boolean) => void): void;

	seekToTimeToleranceBeforeToleranceAfterCompletionHandler(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime, completionHandler: (p1: boolean) => void): void;
}

interface AVPlayerItemIntegratedTimelineObserver extends NSObjectProtocol {
}
declare var AVPlayerItemIntegratedTimelineObserver: {

	prototype: AVPlayerItemIntegratedTimelineObserver;
};

/**
 * @since 18.0
 */
declare class AVPlayerItemIntegratedTimelineSnapshot extends NSObject {

	static alloc(): AVPlayerItemIntegratedTimelineSnapshot; // inherited from NSObject

	static new(): AVPlayerItemIntegratedTimelineSnapshot; // inherited from NSObject

	readonly currentDate: Date;

	readonly currentSegment: AVPlayerItemSegment;

	readonly currentTime: CMTime;

	readonly duration: CMTime;

	readonly segments: NSArray<AVPlayerItemSegment>;

	mapTimeToSegmentAtSegmentOffset(time: CMTime, timeSegmentOut: interop.Pointer | interop.Reference<AVPlayerItemSegment>, segmentOffsetOut: interop.Pointer | interop.Reference<CMTime>): void;
}

/**
 * @since 7.0
 */
declare class AVPlayerItemLegibleOutput extends AVPlayerItemOutput {

	static alloc(): AVPlayerItemLegibleOutput; // inherited from NSObject

	static new(): AVPlayerItemLegibleOutput; // inherited from NSObject

	advanceIntervalForDelegateInvocation: number;

	readonly delegate: AVPlayerItemLegibleOutputPushDelegate;

	readonly delegateQueue: NSObject & OS_dispatch_queue;

	textStylingResolution: string;

	constructor(o: { mediaSubtypesForNativeRepresentation: NSArray<number> | number[]; });

	initWithMediaSubtypesForNativeRepresentation(subtypes: NSArray<number> | number[]): this;

	setDelegateQueue(delegate: AVPlayerItemLegibleOutputPushDelegate, delegateQueue: NSObject & OS_dispatch_queue): void;
}

interface AVPlayerItemLegibleOutputPushDelegate extends AVPlayerItemOutputPushDelegate {

	/**
	 * @since 7.0
	 */
	legibleOutputDidOutputAttributedStringsNativeSampleBuffersForItemTime?(output: AVPlayerItemLegibleOutput, strings: NSArray<NSAttributedString> | NSAttributedString[], nativeSamples: NSArray<any> | any[], itemTime: CMTime): void;
}
declare var AVPlayerItemLegibleOutputPushDelegate: {

	prototype: AVPlayerItemLegibleOutputPushDelegate;
};

/**
 * @since 7.0
 */
declare var AVPlayerItemLegibleOutputTextStylingResolutionDefault: string;

/**
 * @since 7.0
 */
declare var AVPlayerItemLegibleOutputTextStylingResolutionSourceAndRulesOnly: string;

/**
 * @since 9.3
 */
declare class AVPlayerItemMediaDataCollector extends NSObject {

	static alloc(): AVPlayerItemMediaDataCollector; // inherited from NSObject

	static new(): AVPlayerItemMediaDataCollector; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare var AVPlayerItemMediaSelectionDidChangeNotification: string;

/**
 * @since 9.3
 */
declare class AVPlayerItemMetadataCollector extends AVPlayerItemMediaDataCollector {

	static alloc(): AVPlayerItemMetadataCollector; // inherited from NSObject

	static new(): AVPlayerItemMetadataCollector; // inherited from NSObject

	readonly delegate: AVPlayerItemMetadataCollectorPushDelegate;

	readonly delegateQueue: NSObject & OS_dispatch_queue;

	constructor(o: { identifiers: NSArray<string> | string[]; classifyingLabels: NSArray<string> | string[]; });

	initWithIdentifiersClassifyingLabels(identifiers: NSArray<string> | string[], classifyingLabels: NSArray<string> | string[]): this;

	setDelegateQueue(delegate: AVPlayerItemMetadataCollectorPushDelegate, delegateQueue: NSObject & OS_dispatch_queue): void;
}

interface AVPlayerItemMetadataCollectorPushDelegate extends NSObjectProtocol {

	metadataCollectorDidCollectDateRangeMetadataGroupsIndexesOfNewGroupsIndexesOfModifiedGroups(metadataCollector: AVPlayerItemMetadataCollector, metadataGroups: NSArray<AVDateRangeMetadataGroup> | AVDateRangeMetadataGroup[], indexesOfNewGroups: NSIndexSet, indexesOfModifiedGroups: NSIndexSet): void;
}
declare var AVPlayerItemMetadataCollectorPushDelegate: {

	prototype: AVPlayerItemMetadataCollectorPushDelegate;
};

/**
 * @since 8.0
 */
declare class AVPlayerItemMetadataOutput extends AVPlayerItemOutput {

	static alloc(): AVPlayerItemMetadataOutput; // inherited from NSObject

	static new(): AVPlayerItemMetadataOutput; // inherited from NSObject

	advanceIntervalForDelegateInvocation: number;

	readonly delegate: AVPlayerItemMetadataOutputPushDelegate;

	readonly delegateQueue: NSObject & OS_dispatch_queue;

	constructor(o: { identifiers: NSArray<string> | string[]; });

	initWithIdentifiers(identifiers: NSArray<string> | string[]): this;

	setDelegateQueue(delegate: AVPlayerItemMetadataOutputPushDelegate, delegateQueue: NSObject & OS_dispatch_queue): void;
}

interface AVPlayerItemMetadataOutputPushDelegate extends AVPlayerItemOutputPushDelegate {

	/**
	 * @since 8.0
	 */
	metadataOutputDidOutputTimedMetadataGroupsFromPlayerItemTrack?(output: AVPlayerItemMetadataOutput, groups: NSArray<AVTimedMetadataGroup> | AVTimedMetadataGroup[], track: AVPlayerItemTrack): void;
}
declare var AVPlayerItemMetadataOutputPushDelegate: {

	prototype: AVPlayerItemMetadataOutputPushDelegate;
};

/**
 * @since 6.0
 */
declare var AVPlayerItemNewAccessLogEntryNotification: string;

/**
 * @since 6.0
 */
declare var AVPlayerItemNewErrorLogEntryNotification: string;

/**
 * @since 6.0
 */
declare class AVPlayerItemOutput extends NSObject {

	static alloc(): AVPlayerItemOutput; // inherited from NSObject

	static new(): AVPlayerItemOutput; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	suppressesPlayerRendering: boolean;

	itemTimeForHostTime(hostTimeInSeconds: number): CMTime;

	itemTimeForMachAbsoluteTime(machAbsoluteTime: number): CMTime;
}

interface AVPlayerItemOutputPullDelegate extends NSObjectProtocol {

	/**
	 * @since 6.0
	 */
	outputMediaDataWillChange?(sender: AVPlayerItemOutput): void;

	/**
	 * @since 6.0
	 */
	outputSequenceWasFlushed?(output: AVPlayerItemOutput): void;
}
declare var AVPlayerItemOutputPullDelegate: {

	prototype: AVPlayerItemOutputPullDelegate;
};

interface AVPlayerItemOutputPushDelegate extends NSObjectProtocol {

	outputSequenceWasFlushed?(output: AVPlayerItemOutput): void;
}
declare var AVPlayerItemOutputPushDelegate: {

	prototype: AVPlayerItemOutputPushDelegate;
};

/**
 * @since 6.0
 */
declare var AVPlayerItemPlaybackStalledNotification: string;

/**
 * @since 13.0
 */
declare var AVPlayerItemRecommendedTimeOffsetFromLiveDidChangeNotification: string;

/**
 * @since 18.0
 */
declare class AVPlayerItemRenderedLegibleOutput extends AVPlayerItemOutput {

	static alloc(): AVPlayerItemRenderedLegibleOutput; // inherited from NSObject

	static new(): AVPlayerItemRenderedLegibleOutput; // inherited from NSObject

	advanceIntervalForDelegateInvocation: number;

	readonly delegate: AVPlayerItemRenderedLegibleOutputPushDelegate;

	readonly delegateQueue: NSObject & OS_dispatch_queue;

	videoDisplaySize: CGSize;

	constructor(o: { videoDisplaySize: CGSize; });

	initWithVideoDisplaySize(videoDisplaySize: CGSize): this;

	setDelegateQueue(delegate: AVPlayerItemRenderedLegibleOutputPushDelegate, delegateQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 18.0
 */
interface AVPlayerItemRenderedLegibleOutputPushDelegate extends AVPlayerItemOutputPushDelegate {

	/**
	 * @since 18.0
	 */
	renderedLegibleOutputDidOutputRenderedCaptionImagesForItemTime?(output: AVPlayerItemRenderedLegibleOutput, captionImages: NSArray<AVRenderedCaptionImage> | AVRenderedCaptionImage[], itemTime: CMTime): void;
}
declare var AVPlayerItemRenderedLegibleOutputPushDelegate: {

	prototype: AVPlayerItemRenderedLegibleOutputPushDelegate;
};

/**
 * @since 18.0
 */
declare class AVPlayerItemSegment extends NSObject {

	static alloc(): AVPlayerItemSegment; // inherited from NSObject

	static new(): AVPlayerItemSegment; // inherited from NSObject

	readonly interstitialEvent: AVPlayerInterstitialEvent;

	readonly loadedTimeRanges: NSArray<NSValue>;

	readonly segmentType: AVPlayerItemSegmentType;

	readonly startDate: Date;

	readonly timeMapping: CMTimeMapping;
}

/**
 * @since 18.0
 */
declare const enum AVPlayerItemSegmentType {

	Primary = 0,

	Interstitial = 1
}

declare const enum AVPlayerItemStatus {

	Unknown = 0,

	ReadyToPlay = 1,

	Failed = 2
}

/**
 * @since 5.0
 */
declare var AVPlayerItemTimeJumpedNotification: string;

/**
 * @since 15.0
 */
declare var AVPlayerItemTimeJumpedOriginatingParticipantKey: string;

/**
 * @since 4.0
 */
declare class AVPlayerItemTrack extends NSObject {

	static alloc(): AVPlayerItemTrack; // inherited from NSObject

	static new(): AVPlayerItemTrack; // inherited from NSObject

	readonly assetTrack: AVAssetTrack;

	/**
	 * @since 7.0
	 */
	readonly currentVideoFrameRate: number;

	enabled: boolean;
}

/**
 * @since 6.0
 */
declare class AVPlayerItemVideoOutput extends AVPlayerItemOutput {

	static alloc(): AVPlayerItemVideoOutput; // inherited from NSObject

	static new(): AVPlayerItemVideoOutput; // inherited from NSObject

	readonly delegate: AVPlayerItemOutputPullDelegate;

	readonly delegateQueue: NSObject & OS_dispatch_queue;

	/**
	 * @since 10.0
	 */
	constructor(o: { outputSettings: NSDictionary<string, any>; });

	constructor(o: { pixelBufferAttributes: NSDictionary<string, any>; });

	copyPixelBufferForItemTimeItemTimeForDisplay(itemTime: CMTime, outItemTimeForDisplay: interop.Pointer | interop.Reference<CMTime>): any;

	hasNewPixelBufferForItemTime(itemTime: CMTime): boolean;

	/**
	 * @since 10.0
	 */
	initWithOutputSettings(outputSettings: NSDictionary<string, any>): this;

	initWithPixelBufferAttributes(pixelBufferAttributes: NSDictionary<string, any>): this;

	requestNotificationOfMediaDataChangeWithAdvanceInterval(interval: number): void;

	setDelegateQueue(delegate: AVPlayerItemOutputPullDelegate, delegateQueue: NSObject & OS_dispatch_queue): void;
}

/**
 * @since 4.0
 */
declare class AVPlayerLayer extends CALayer {

	static alloc(): AVPlayerLayer; // inherited from NSObject

	static layer(): AVPlayerLayer; // inherited from CALayer

	static new(): AVPlayerLayer; // inherited from NSObject

	static playerLayerWithPlayer(player: AVPlayer): AVPlayerLayer;

	/**
	 * @since 9.0
	 */
	pixelBufferAttributes: NSDictionary<string, any>;

	player: AVPlayer;

	readonly readyForDisplay: boolean;

	videoGravity: string;

	/**
	 * @since 7.0
	 */
	readonly videoRect: CGRect;

	/**
	 * @since 16.0
	 */
	copyDisplayedPixelBuffer(): any;
}

/**
 * @since 10.0
 */
declare class AVPlayerLooper extends NSObject {

	static alloc(): AVPlayerLooper; // inherited from NSObject

	static new(): AVPlayerLooper; // inherited from NSObject

	static playerLooperWithPlayerTemplateItem(player: AVQueuePlayer, itemToLoop: AVPlayerItem): AVPlayerLooper;

	static playerLooperWithPlayerTemplateItemTimeRange(player: AVQueuePlayer, itemToLoop: AVPlayerItem, loopRange: CMTimeRange): AVPlayerLooper;

	readonly error: NSError;

	readonly loopCount: number;

	readonly loopingPlayerItems: NSArray<AVPlayerItem>;

	readonly status: AVPlayerLooperStatus;

	constructor(o: { player: AVQueuePlayer; templateItem: AVPlayerItem; timeRange: CMTimeRange; });

	/**
	 * @since 17.0
	 */
	constructor(o: { player: AVQueuePlayer; templateItem: AVPlayerItem; timeRange: CMTimeRange; existingItemsOrdering: AVPlayerLooperItemOrdering; });

	disableLooping(): void;

	initWithPlayerTemplateItemTimeRange(player: AVQueuePlayer, itemToLoop: AVPlayerItem, loopRange: CMTimeRange): this;

	/**
	 * @since 17.0
	 */
	initWithPlayerTemplateItemTimeRangeExistingItemsOrdering(player: AVQueuePlayer, itemToLoop: AVPlayerItem, loopRange: CMTimeRange, itemOrdering: AVPlayerLooperItemOrdering): this;
}

/**
 * @since 17.0
 */
declare const enum AVPlayerLooperItemOrdering {

	LoopingItemsPrecedeExistingItems = 0,

	LoopingItemsFollowExistingItems = 1
}

declare const enum AVPlayerLooperStatus {

	Unknown = 0,

	Ready = 1,

	Failed = 2,

	Cancelled = 3
}

/**
 * @since 7.0
 */
declare class AVPlayerMediaSelectionCriteria extends NSObject {

	static alloc(): AVPlayerMediaSelectionCriteria; // inherited from NSObject

	static new(): AVPlayerMediaSelectionCriteria; // inherited from NSObject

	readonly preferredLanguages: NSArray<string>;

	readonly preferredMediaCharacteristics: NSArray<string>;

	/**
	 * @since 12.0
	 */
	readonly principalMediaCharacteristics: NSArray<string>;

	constructor(o: { preferredLanguages: NSArray<string> | string[]; preferredMediaCharacteristics: NSArray<string> | string[]; });

	/**
	 * @since 12.0
	 */
	constructor(o: { principalMediaCharacteristics: NSArray<string> | string[]; preferredLanguages: NSArray<string> | string[]; preferredMediaCharacteristics: NSArray<string> | string[]; });

	initWithPreferredLanguagesPreferredMediaCharacteristics(preferredLanguages: NSArray<string> | string[], preferredMediaCharacteristics: NSArray<string> | string[]): this;

	/**
	 * @since 12.0
	 */
	initWithPrincipalMediaCharacteristicsPreferredLanguagesPreferredMediaCharacteristics(principalMediaCharacteristics: NSArray<string> | string[], preferredLanguages: NSArray<string> | string[], preferredMediaCharacteristics: NSArray<string> | string[]): this;
}

/**
 * @since 15.0
 */
declare class AVPlayerPlaybackCoordinator extends AVPlaybackCoordinator {

	static alloc(): AVPlayerPlaybackCoordinator; // inherited from NSObject

	static new(): AVPlayerPlaybackCoordinator; // inherited from NSObject

	delegate: AVPlayerPlaybackCoordinatorDelegate;

	readonly player: AVPlayer;
}

/**
 * @since 15.0
 */
interface AVPlayerPlaybackCoordinatorDelegate extends NSObjectProtocol {

	playbackCoordinatorIdentifierForPlayerItem?(coordinator: AVPlayerPlaybackCoordinator, playerItem: AVPlayerItem): string;

	/**
	 * @since 15.4
	 */
	playbackCoordinatorInterstitialTimeRangesForPlayerItem?(coordinator: AVPlayerPlaybackCoordinator, playerItem: AVPlayerItem): NSArray<NSValue>;
}
declare var AVPlayerPlaybackCoordinatorDelegate: {

	prototype: AVPlayerPlaybackCoordinatorDelegate;
};

/**
 * @since 15.0
 */
declare var AVPlayerRateDidChangeNotification: string;

/**
 * @since 15.0
 */
declare var AVPlayerRateDidChangeOriginatingParticipantKey: string;

/**
 * @since 15.0
 */
declare var AVPlayerRateDidChangeReasonAppBackgrounded: string;

/**
 * @since 15.0
 */
declare var AVPlayerRateDidChangeReasonAudioSessionInterrupted: string;

/**
 * @since 15.0
 */
declare var AVPlayerRateDidChangeReasonKey: string;

/**
 * @since 15.0
 */
declare var AVPlayerRateDidChangeReasonSetRateCalled: string;

/**
 * @since 15.0
 */
declare var AVPlayerRateDidChangeReasonSetRateFailed: string;

declare const enum AVPlayerStatus {

	Unknown = 0,

	ReadyToPlay = 1,

	Failed = 2
}

/**
 * @since 10.0
 */
declare const enum AVPlayerTimeControlStatus {

	Paused = 0,

	WaitingToPlayAtSpecifiedRate = 1,

	Playing = 2
}

/**
 * @since 17.2
 */
declare class AVPlayerVideoOutput extends NSObject {

	static alloc(): AVPlayerVideoOutput; // inherited from NSObject

	static new(): AVPlayerVideoOutput; // inherited from NSObject

	constructor(o: { specification: AVVideoOutputSpecification; });

	copyTaggedBufferGroupForHostTimePresentationTimeStampActiveConfiguration(hostTime: CMTime, presentationTimeStampOut: interop.Pointer | interop.Reference<CMTime>, activeConfigurationOut: interop.Pointer | interop.Reference<AVPlayerVideoOutputConfiguration>): any;

	initWithSpecification(specification: AVVideoOutputSpecification): this;
}

/**
 * @since 17.2
 */
declare class AVPlayerVideoOutputConfiguration extends NSObject {

	static alloc(): AVPlayerVideoOutputConfiguration; // inherited from NSObject

	static new(): AVPlayerVideoOutputConfiguration; // inherited from NSObject

	readonly activationTime: CMTime;

	readonly dataChannelDescriptions: NSArray<any>;

	/**
	 * @since 18.0
	 */
	readonly preferredTransform: CGAffineTransform;

	readonly sourcePlayerItem: AVPlayerItem;
}

/**
 * @since 15.0
 */
declare var AVPlayerWaitingDuringInterstitialEventReason: string;

/**
 * @since 15.0
 */
declare var AVPlayerWaitingForCoordinatedPlaybackReason: string;

/**
 * @since 10.0
 */
declare var AVPlayerWaitingToMinimizeStallsReason: string;

/**
 * @since 10.0
 */
declare var AVPlayerWaitingWhileEvaluatingBufferingRateReason: string;

/**
 * @since 10.0
 */
declare var AVPlayerWaitingWithNoItemToPlayReason: string;

/**
 * @since 12.0
 */
declare class AVPortraitEffectsMatte extends NSObject {

	static alloc(): AVPortraitEffectsMatte; // inherited from NSObject

	static new(): AVPortraitEffectsMatte; // inherited from NSObject

	static portraitEffectsMatteFromDictionaryRepresentationError(imageSourceAuxDataInfoDictionary: NSDictionary<any, any>): AVPortraitEffectsMatte;

	readonly mattingImage: any;

	readonly pixelFormatType: number;

	dictionaryRepresentationForAuxiliaryDataType(outAuxDataType: interop.Pointer | interop.Reference<string>): NSDictionary<any, any>;

	portraitEffectsMatteByApplyingExifOrientation(exifOrientation: CGImagePropertyOrientation): this;

	portraitEffectsMatteByReplacingPortraitEffectsMatteWithPixelBufferError(pixelBuffer: any): this;
}

/**
 * @since 4.1
 */
declare class AVQueuePlayer extends AVPlayer {

	static alloc(): AVQueuePlayer; // inherited from NSObject

	static new(): AVQueuePlayer; // inherited from NSObject

	static playerWithPlayerItem(item: AVPlayerItem): AVQueuePlayer; // inherited from AVPlayer

	static playerWithURL(URL: NSURL): AVQueuePlayer; // inherited from AVPlayer

	static queuePlayerWithItems(items: NSArray<AVPlayerItem> | AVPlayerItem[]): AVQueuePlayer;

	constructor(o: { items: NSArray<AVPlayerItem> | AVPlayerItem[]; });

	advanceToNextItem(): void;

	canInsertItemAfterItem(item: AVPlayerItem, afterItem: AVPlayerItem): boolean;

	initWithItems(items: NSArray<AVPlayerItem> | AVPlayerItem[]): this;

	insertItemAfterItem(item: AVPlayerItem, afterItem: AVPlayerItem): void;

	items(): NSArray<AVPlayerItem>;

	removeAllItems(): void;

	removeItem(item: AVPlayerItem): void;
}

/**
 * @since 11.0
 */
interface AVQueuedSampleBufferRendering extends NSObjectProtocol {

	/**
	 * @since 14.5
	 */
	hasSufficientMediaDataForReliablePlaybackStart: boolean;

	readyForMoreMediaData: boolean;

	timebase: any;

	enqueueSampleBuffer(sampleBuffer: any): void;

	flush(): void;

	requestMediaDataWhenReadyOnQueueUsingBlock(queue: NSObject & OS_dispatch_queue, block: () => void): void;

	stopRequestingMediaData(): void;
}
declare var AVQueuedSampleBufferRendering: {

	prototype: AVQueuedSampleBufferRendering;
};

/**
 * @since 8.0
 */
declare const enum AVQueuedSampleBufferRenderingStatus {

	Unknown = 0,

	Rendering = 1,

	Failed = 2
}

/**
 * @since 18.0
 */
declare class AVRenderedCaptionImage extends NSObject {

	static alloc(): AVRenderedCaptionImage; // inherited from NSObject

	static new(): AVRenderedCaptionImage; // inherited from NSObject

	readonly pixelBuffer: any;

	readonly position: CGPoint;
}

/**
 * @since 11.0
 */
declare class AVRouteDetector extends NSObject {

	static alloc(): AVRouteDetector; // inherited from NSObject

	static new(): AVRouteDetector; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	detectsCustomRoutes: boolean;

	readonly multipleRoutesDetected: boolean;

	routeDetectionEnabled: boolean;
}

/**
 * @since 11.0
 */
declare var AVRouteDetectorMultipleRoutesDetectedDidChangeNotification: string;

/**
 * @since 14.5
 */
declare function AVSampleBufferAttachContentKey(sbuf: any, contentKey: AVContentKey, outError: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 11.0
 */
declare class AVSampleBufferAudioRenderer extends NSObject implements AVQueuedSampleBufferRendering {

	static alloc(): AVSampleBufferAudioRenderer; // inherited from NSObject

	static new(): AVSampleBufferAudioRenderer; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	allowedAudioSpatializationFormats: AVAudioSpatializationFormats;

	audioTimePitchAlgorithm: string;

	readonly error: NSError;

	muted: boolean;

	readonly status: AVQueuedSampleBufferRenderingStatus;

	volume: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 14.5
	 */
	readonly hasSufficientMediaDataForReliablePlaybackStart: boolean; // inherited from AVQueuedSampleBufferRendering

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly readyForMoreMediaData: boolean; // inherited from AVQueuedSampleBufferRendering

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly timebase: any; // inherited from AVQueuedSampleBufferRendering

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	enqueueSampleBuffer(sampleBuffer: any): void;

	flush(): void;

	flushFromSourceTimeCompletionHandler(time: CMTime, completionHandler: (p1: boolean) => void): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	requestMediaDataWhenReadyOnQueueUsingBlock(queue: NSObject & OS_dispatch_queue, block: () => void): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	stopRequestingMediaData(): void;
}

/**
 * @since 11.0
 */
declare var AVSampleBufferAudioRendererFlushTimeKey: string;

/**
 * @since 15.0
 */
declare var AVSampleBufferAudioRendererOutputConfigurationDidChangeNotification: string;

/**
 * @since 11.0
 */
declare var AVSampleBufferAudioRendererWasFlushedAutomaticallyNotification: string;

/**
 * @since 8.0
 */
declare class AVSampleBufferDisplayLayer extends CALayer implements AVQueuedSampleBufferRendering {

	static alloc(): AVSampleBufferDisplayLayer; // inherited from NSObject

	static layer(): AVSampleBufferDisplayLayer; // inherited from CALayer

	static new(): AVSampleBufferDisplayLayer; // inherited from NSObject

	controlTimebase: any;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	readonly error: NSError;

	/**
	 * @since 14.5
	 */
	readonly outputObscuredDueToInsufficientExternalProtection: boolean;

	/**
	 * @since 13.0
	 */
	preventsCapture: boolean;

	/**
	 * @since 13.0
	 */
	preventsDisplaySleepDuringVideoPlayback: boolean;

	/**
	 * @since 17.4
	 */
	readonly readyForDisplay: boolean;

	/**
	 * @since 14.0
	 * @deprecated 18.0
	 */
	readonly requiresFlushToResumeDecoding: boolean;

	/**
	 * @since 17.0
	 */
	readonly sampleBufferRenderer: AVSampleBufferVideoRenderer;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	readonly status: AVQueuedSampleBufferRenderingStatus;

	videoGravity: string;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 14.5
	 */
	readonly hasSufficientMediaDataForReliablePlaybackStart: boolean; // inherited from AVQueuedSampleBufferRendering

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly readyForMoreMediaData: boolean; // inherited from AVQueuedSampleBufferRendering

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly timebase: any; // inherited from AVQueuedSampleBufferRendering

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	enqueueSampleBuffer(sampleBuffer: any): void;

	flush(): void;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	flushAndRemoveImage(): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	requestMediaDataWhenReadyOnQueueUsingBlock(queue: NSObject & OS_dispatch_queue, block: () => void): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	stopRequestingMediaData(): void;
}

/**
 * @since 8.0
 */
declare var AVSampleBufferDisplayLayerFailedToDecodeNotification: string;

/**
 * @since 8.0
 */
declare var AVSampleBufferDisplayLayerFailedToDecodeNotificationErrorKey: string;

/**
 * @since 14.5
 */
declare var AVSampleBufferDisplayLayerOutputObscuredDueToInsufficientExternalProtectionDidChangeNotification: string;

/**
 * @since 17.4
 */
declare var AVSampleBufferDisplayLayerReadyForDisplayDidChangeNotification: string;

/**
 * @since 14.0
 */
declare var AVSampleBufferDisplayLayerRequiresFlushToResumeDecodingDidChangeNotification: string;

/**
 * @since 16.0
 */
declare class AVSampleBufferGenerator extends NSObject {

	static alloc(): AVSampleBufferGenerator; // inherited from NSObject

	static new(): AVSampleBufferGenerator; // inherited from NSObject

	static notifyOfDataReadyForSampleBufferCompletionHandler(sbuf: any, completionHandler: (p1: boolean, p2: NSError) => void): void;

	constructor(o: { asset: AVAsset; timebase: any; });

	/**
	 * @since 16.0
	 */
	createSampleBufferForRequestAddingToBatchError(request: AVSampleBufferRequest, batch: AVSampleBufferGeneratorBatch): any;

	/**
	 * @since 16.0
	 */
	createSampleBufferForRequestError(request: AVSampleBufferRequest): any;

	initWithAssetTimebase(asset: AVAsset, timebase: any): this;

	/**
	 * @since 16.0
	 */
	makeBatch(): AVSampleBufferGeneratorBatch;
}

/**
 * @since 16.0
 */
declare class AVSampleBufferGeneratorBatch extends NSObject {

	static alloc(): AVSampleBufferGeneratorBatch; // inherited from NSObject

	static new(): AVSampleBufferGeneratorBatch; // inherited from NSObject

	cancel(): void;

	makeDataReadyWithCompletionHandler(completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare class AVSampleBufferRenderSynchronizer extends NSObject {

	static alloc(): AVSampleBufferRenderSynchronizer; // inherited from NSObject

	static new(): AVSampleBufferRenderSynchronizer; // inherited from NSObject

	/**
	 * @since 14.5
	 */
	delaysRateChangeUntilHasSufficientMediaData: boolean;

	rate: number;

	readonly renderers: NSArray<AVQueuedSampleBufferRendering>;

	readonly timebase: any;

	addBoundaryTimeObserverForTimesQueueUsingBlock(times: NSArray<NSValue> | NSValue[], queue: NSObject & OS_dispatch_queue, block: () => void): any;

	addPeriodicTimeObserverForIntervalQueueUsingBlock(interval: CMTime, queue: NSObject & OS_dispatch_queue, block: (p1: CMTime) => void): any;

	addRenderer(renderer: AVQueuedSampleBufferRendering): void;

	/**
	 * @since 12.0
	 */
	currentTime(): CMTime;

	removeRendererAtTimeCompletionHandler(renderer: AVQueuedSampleBufferRendering, time: CMTime, completionHandler: (p1: boolean) => void): void;

	removeTimeObserver(observer: any): void;

	setRateTime(rate: number, time: CMTime): void;

	/**
	 * @since 14.5
	 */
	setRateTimeAtHostTime(rate: number, time: CMTime, hostTime: CMTime): void;
}

/**
 * @since 12.0
 */
declare var AVSampleBufferRenderSynchronizerRateDidChangeNotification: string;

/**
 * @since 16.0
 */
declare class AVSampleBufferRequest extends NSObject {

	static alloc(): AVSampleBufferRequest; // inherited from NSObject

	static new(): AVSampleBufferRequest; // inherited from NSObject

	direction: AVSampleBufferRequestDirection;

	limitCursor: AVSampleCursor;

	maxSampleCount: number;

	mode: AVSampleBufferRequestMode;

	overrideTime: CMTime;

	preferredMinSampleCount: number;

	readonly startCursor: AVSampleCursor;

	constructor(o: { startCursor: AVSampleCursor; });

	initWithStartCursor(startCursor: AVSampleCursor): this;
}

declare const enum AVSampleBufferRequestDirection {

	Forward = 1,

	None = 0,

	Reverse = -1
}

declare const enum AVSampleBufferRequestMode {

	Immediate = 0,

	Scheduled = 1,

	Opportunistic = 2
}

/**
 * @since 17.0
 */
declare class AVSampleBufferVideoRenderer extends NSObject implements AVQueuedSampleBufferRendering {

	static alloc(): AVSampleBufferVideoRenderer; // inherited from NSObject

	static new(): AVSampleBufferVideoRenderer; // inherited from NSObject

	readonly error: NSError;

	readonly requiresFlushToResumeDecoding: boolean;

	readonly status: AVQueuedSampleBufferRenderingStatus;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	/**
	 * @since 14.5
	 */
	readonly hasSufficientMediaDataForReliablePlaybackStart: boolean; // inherited from AVQueuedSampleBufferRendering

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly readyForMoreMediaData: boolean; // inherited from AVQueuedSampleBufferRendering

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly timebase: any; // inherited from AVQueuedSampleBufferRendering

	readonly  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 17.4
	 */
	copyDisplayedPixelBuffer(): any;

	enqueueSampleBuffer(sampleBuffer: any): void;

	/**
	 * @since 17.4
	 */
	expectMinimumUpcomingSampleBufferPresentationTime(minimumUpcomingPresentationTime: CMTime): void;

	/**
	 * @since 17.4
	 */
	expectMonotonicallyIncreasingUpcomingSampleBufferPresentationTimes(): void;

	flush(): void;

	flushWithRemovalOfDisplayedImageCompletionHandler(removeDisplayedImage: boolean, handler: () => void): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	/**
	 * @since 17.4
	 */
	loadVideoPerformanceMetricsWithCompletionHandler(completionHandler: (p1: AVVideoPerformanceMetrics) => void): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	requestMediaDataWhenReadyOnQueueUsingBlock(queue: NSObject & OS_dispatch_queue, block: () => void): void;

	/**
	 * @since 17.4
	 */
	resetUpcomingSampleBufferPresentationTimeExpectations(): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	stopRequestingMediaData(): void;
}

/**
 * @since 17.0
 */
declare var AVSampleBufferVideoRendererDidFailToDecodeNotification: string;

/**
 * @since 17.0
 */
declare var AVSampleBufferVideoRendererDidFailToDecodeNotificationErrorKey: string;

/**
 * @since 17.0
 */
declare var AVSampleBufferVideoRendererRequiresFlushToResumeDecodingDidChangeNotification: string;

/**
 * @since 16.0
 */
declare class AVSampleCursor extends NSObject implements NSCopying {

	static alloc(): AVSampleCursor; // inherited from NSObject

	static new(): AVSampleCursor; // inherited from NSObject

	readonly currentChunkInfo: AVSampleCursorChunkInfo;

	readonly currentChunkStorageRange: AVSampleCursorStorageRange;

	readonly currentChunkStorageURL: NSURL;

	/**
	 * @since 16.0
	 */
	readonly currentSampleAudioDependencyInfo: AVSampleCursorAudioDependencyInfo;

	/**
	 * @since 16.0
	 */
	readonly currentSampleDependencyAttachments: NSDictionary<any, any>;

	readonly currentSampleDependencyInfo: AVSampleCursorDependencyInfo;

	readonly currentSampleDuration: CMTime;

	readonly currentSampleIndexInChunk: number;

	readonly currentSampleStorageRange: AVSampleCursorStorageRange;

	readonly currentSampleSyncInfo: AVSampleCursorSyncInfo;

	readonly decodeTimeStamp: CMTime;

	readonly presentationTimeStamp: CMTime;

	/**
	 * @since 16.0
	 */
	readonly samplesRequiredForDecoderRefresh: number;

	comparePositionInDecodeOrderWithPositionOfCursor(cursor: AVSampleCursor): NSComparisonResult;

	copyCurrentSampleFormatDescription(): any;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	samplesWithEarlierDecodeTimeStampsMayHaveLaterPresentationTimeStampsThanCursor(cursor: AVSampleCursor): boolean;

	samplesWithLaterDecodeTimeStampsMayHaveEarlierPresentationTimeStampsThanCursor(cursor: AVSampleCursor): boolean;

	stepByDecodeTimeWasPinned(deltaDecodeTime: CMTime, outWasPinned: interop.Pointer | interop.Reference<boolean>): CMTime;

	stepByPresentationTimeWasPinned(deltaPresentationTime: CMTime, outWasPinned: interop.Pointer | interop.Reference<boolean>): CMTime;

	stepInDecodeOrderByCount(stepCount: number): number;

	stepInPresentationOrderByCount(stepCount: number): number;
}

interface AVSampleCursorAudioDependencyInfo {
	audioSampleIsIndependentlyDecodable: boolean;
	audioSamplePacketRefreshCount: number;
}
declare var AVSampleCursorAudioDependencyInfo: interop.StructType<AVSampleCursorAudioDependencyInfo>;

interface AVSampleCursorChunkInfo {
	chunkSampleCount: number;
	chunkHasUniformSampleSizes: boolean;
	chunkHasUniformSampleDurations: boolean;
	chunkHasUniformFormatDescriptions: boolean;
}
declare var AVSampleCursorChunkInfo: interop.StructType<AVSampleCursorChunkInfo>;

interface AVSampleCursorDependencyInfo {
	sampleIndicatesWhetherItHasDependentSamples: boolean;
	sampleHasDependentSamples: boolean;
	sampleIndicatesWhetherItDependsOnOthers: boolean;
	sampleDependsOnOthers: boolean;
	sampleIndicatesWhetherItHasRedundantCoding: boolean;
	sampleHasRedundantCoding: boolean;
}
declare var AVSampleCursorDependencyInfo: interop.StructType<AVSampleCursorDependencyInfo>;

interface AVSampleCursorStorageRange {
	offset: number;
	length: number;
}
declare var AVSampleCursorStorageRange: interop.StructType<AVSampleCursorStorageRange>;

interface AVSampleCursorSyncInfo {
	sampleIsFullSync: boolean;
	sampleIsPartialSync: boolean;
	sampleIsDroppable: boolean;
}
declare var AVSampleCursorSyncInfo: interop.StructType<AVSampleCursorSyncInfo>;

/**
 * @since 13.0
 */
declare class AVSemanticSegmentationMatte extends NSObject {

	static alloc(): AVSemanticSegmentationMatte; // inherited from NSObject

	static new(): AVSemanticSegmentationMatte; // inherited from NSObject

	static semanticSegmentationMatteFromImageSourceAuxiliaryDataTypeDictionaryRepresentationError(imageSourceAuxiliaryDataType: string, imageSourceAuxiliaryDataInfoDictionary: NSDictionary<any, any>): AVSemanticSegmentationMatte;

	readonly matteType: string;

	readonly mattingImage: any;

	readonly pixelFormatType: number;

	dictionaryRepresentationForAuxiliaryDataType(outAuxDataType: interop.Pointer | interop.Reference<string>): NSDictionary<any, any>;

	semanticSegmentationMatteByApplyingExifOrientation(exifOrientation: CGImagePropertyOrientation): this;

	semanticSegmentationMatteByReplacingSemanticSegmentationMatteWithPixelBufferError(pixelBuffer: any): this;
}

/**
 * @since 14.1
 */
declare var AVSemanticSegmentationMatteTypeGlasses: string;

/**
 * @since 13.0
 */
declare var AVSemanticSegmentationMatteTypeHair: string;

/**
 * @since 13.0
 */
declare var AVSemanticSegmentationMatteTypeSkin: string;

/**
 * @since 13.0
 */
declare var AVSemanticSegmentationMatteTypeTeeth: string;

/**
 * @since 18.0
 */
declare var AVSpatialCaptureDiscomfortReasonNotEnoughLight: string;

/**
 * @since 18.0
 */
declare var AVSpatialCaptureDiscomfortReasonSubjectTooClose: string;

/**
 * @since 9.0
 */
declare var AVStreamingKeyDeliveryContentKeyType: string;

/**
 * @since 9.0
 */
declare var AVStreamingKeyDeliveryPersistentContentKeyType: string;

/**
 * @since 4.0
 */
declare class AVSynchronizedLayer extends CALayer {

	static alloc(): AVSynchronizedLayer; // inherited from NSObject

	static layer(): AVSynchronizedLayer; // inherited from CALayer

	static new(): AVSynchronizedLayer; // inherited from NSObject

	static synchronizedLayerWithPlayerItem(playerItem: AVPlayerItem): AVSynchronizedLayer;

	playerItem: AVPlayerItem;
}

/**
 * @since 6.0
 */
declare class AVTextStyleRule extends NSObject implements NSCopying {

	static alloc(): AVTextStyleRule; // inherited from NSObject

	static new(): AVTextStyleRule; // inherited from NSObject

	static propertyListForTextStyleRules(textStyleRules: NSArray<AVTextStyleRule> | AVTextStyleRule[]): any;

	static textStyleRuleWithTextMarkupAttributes(textMarkupAttributes: NSDictionary<string, any>): AVTextStyleRule;

	static textStyleRuleWithTextMarkupAttributesTextSelector(textMarkupAttributes: NSDictionary<string, any>, textSelector: string): AVTextStyleRule;

	static textStyleRulesFromPropertyList(plist: any): NSArray<AVTextStyleRule>;

	readonly textMarkupAttributes: NSDictionary<string, any>;

	readonly textSelector: string;

	constructor(o: { textMarkupAttributes: NSDictionary<string, any>; });

	constructor(o: { textMarkupAttributes: NSDictionary<string, any>; textSelector: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTextMarkupAttributes(textMarkupAttributes: NSDictionary<string, any>): this;

	initWithTextMarkupAttributesTextSelector(textMarkupAttributes: NSDictionary<string, any>, textSelector: string): this;
}

/**
 * @since 4.3
 */
declare class AVTimedMetadataGroup extends AVMetadataGroup implements NSCopying, NSMutableCopying {

	static alloc(): AVTimedMetadataGroup; // inherited from NSObject

	static new(): AVTimedMetadataGroup; // inherited from NSObject

	readonly timeRange: CMTimeRange;

	constructor(o: { items: NSArray<AVMetadataItem> | AVMetadataItem[]; timeRange: CMTimeRange; });

	/**
	 * @since 8.0
	 */
	constructor(o: { sampleBuffer: any; });

	/**
	 * @since 8.0
	 */
	copyFormatDescription(): any;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithItemsTimeRange(items: NSArray<AVMetadataItem> | AVMetadataItem[], timeRange: CMTimeRange): this;

	/**
	 * @since 8.0
	 */
	initWithSampleBuffer(sampleBuffer: any): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 7.0
 */
declare var AVTrackAssociationTypeAudioFallback: string;

/**
 * @since 7.0
 */
declare var AVTrackAssociationTypeChapterList: string;

/**
 * @since 7.0
 */
declare var AVTrackAssociationTypeForcedSubtitlesOnly: string;

/**
 * @since 8.0
 */
declare var AVTrackAssociationTypeMetadataReferent: string;

/**
 * @since 7.0
 */
declare var AVTrackAssociationTypeSelectionFollower: string;

/**
 * @since 7.0
 */
declare var AVTrackAssociationTypeTimecode: string;

/**
 * @since 4.0
 */
declare class AVURLAsset extends AVAsset implements AVContentKeyRecipient, NSItemProviderReading, NSItemProviderWriting {

	static URLAssetWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): AVURLAsset;

	static alloc(): AVURLAsset; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVURLAsset; // inherited from AVAsset

	/**
	 * @since 5.0
	 */
	static audiovisualMIMETypes(): NSArray<string>;

	/**
	 * @since 5.0
	 */
	static audiovisualTypes(): NSArray<string>;

	/**
	 * @since 5.0
	 */
	static isPlayableExtendedMIMEType(extendedMIMEType: string): boolean;

	static itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	static new(): AVURLAsset; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): AVURLAsset;

	readonly URL: NSURL;

	/**
	 * @since 10.0
	 */
	readonly assetCache: AVAssetCache;

	/**
	 * @since 16.0
	 */
	readonly httpSessionIdentifier: NSUUID;

	/**
	 * @since 6.0
	 */
	readonly resourceLoader: AVAssetResourceLoader;

	/**
	 * @since 15.0
	 */
	readonly variants: NSArray<AVAssetVariant>;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly mayRequireContentKeysForMediaDataProcessing: boolean; // inherited from AVContentKeyRecipient

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	readonly  // inherited from NSObjectProtocol

	static readonly readableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderReading

	static readonly writableTypeIdentifiersForItemProvider: NSArray<string>; // inherited from NSItemProviderWriting

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	class(): typeof NSObject;

	/**
	 * @since 4.0
	 * @deprecated 18.0
	 */
	compatibleTrackForCompositionTrack(compositionTrack: AVCompositionTrack): AVAssetTrack;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 14.5
	 */
	contentKeySessionDidProvideContentKey(contentKeySession: AVContentKeySession, contentKey: AVContentKey): void;

	/**
	 * @since 15.0
	 */
	findCompatibleTrackForCompositionTrackCompletionHandler(compositionTrack: AVCompositionTrack, completionHandler: (p1: AVAssetTrack, p2: NSError) => void): void;

	initWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	itemProviderVisibilityForRepresentationWithTypeIdentifier(typeIdentifier: string): NSItemProviderRepresentationVisibility;

	loadDataWithTypeIdentifierForItemProviderCompletionHandler(typeIdentifier: string, completionHandler: (p1: NSData, p2: NSError) => void): NSProgress;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 10.0
 */
declare var AVURLAssetAllowsCellularAccessKey: string;

/**
 * @since 13.0
 */
declare var AVURLAssetAllowsConstrainedNetworkAccessKey: string;

/**
 * @since 13.0
 */
declare var AVURLAssetAllowsExpensiveNetworkAccessKey: string;

/**
 * @since 8.0
 */
declare var AVURLAssetHTTPCookiesKey: string;

/**
 * @since 16.0
 */
declare var AVURLAssetHTTPUserAgentKey: string;

/**
 * @since 17.0
 */
declare var AVURLAssetOverrideMIMETypeKey: string;

/**
 * @since 4.0
 */
declare var AVURLAssetPreferPreciseDurationAndTimingKey: string;

/**
 * @since 16.0
 */
declare var AVURLAssetPrimarySessionIdentifierKey: string;

/**
 * @since 5.0
 */
declare var AVURLAssetReferenceRestrictionsKey: string;

/**
 * @since 15.0
 */
declare var AVURLAssetURLRequestAttributionKey: string;

/**
 * @since 14.5
 */
declare const enum AVVariantPreferences {

	None = 0,

	ScalabilityToLosslessAudio = 1
}

/**
 * @since 7.0
 */
declare var AVVideoAllowFrameReorderingKey: string;

/**
 * @since 10.0
 */
declare var AVVideoAllowWideColorKey: string;

/**
 * @since 11.0
 */
declare var AVVideoApertureModeCleanAperture: string;

/**
 * @since 11.0
 */
declare var AVVideoApertureModeEncodedPixels: string;

/**
 * @since 11.0
 */
declare var AVVideoApertureModeProductionAperture: string;

/**
 * @since 14.3
 */
declare var AVVideoAppleProRAWBitDepthKey: string;

/**
 * @since 4.0
 */
declare var AVVideoAverageBitRateKey: string;

/**
 * @since 7.0
 */
declare var AVVideoAverageNonDroppableFrameRateKey: string;

/**
 * @since 4.0
 */
declare var AVVideoCleanApertureHeightKey: string;

/**
 * @since 4.0
 */
declare var AVVideoCleanApertureHorizontalOffsetKey: string;

/**
 * @since 4.0
 */
declare var AVVideoCleanApertureKey: string;

/**
 * @since 4.0
 */
declare var AVVideoCleanApertureVerticalOffsetKey: string;

/**
 * @since 4.0
 */
declare var AVVideoCleanApertureWidthKey: string;

/**
 * @since 4.0
 * @deprecated 11.0
 */
declare var AVVideoCodecH264: string;

/**
 * @since 11.0
 * @deprecated 11.0
 */
declare var AVVideoCodecHEVC: string;

/**
 * @since 4.0
 * @deprecated 11.0
 */
declare var AVVideoCodecJPEG: string;

/**
 * @since 4.0
 */
declare var AVVideoCodecKey: string;

/**
 * @since 11.0
 */
declare var AVVideoCodecTypeAppleProRes422: string;

/**
 * @since 13.0
 */
declare var AVVideoCodecTypeAppleProRes422HQ: string;

/**
 * @since 13.0
 */
declare var AVVideoCodecTypeAppleProRes422LT: string;

/**
 * @since 13.0
 */
declare var AVVideoCodecTypeAppleProRes422Proxy: string;

/**
 * @since 11.0
 */
declare var AVVideoCodecTypeAppleProRes4444: string;

/**
 * @since 18.0
 */
declare var AVVideoCodecTypeAppleProRes4444XQ: string;

/**
 * @since 11.0
 */
declare var AVVideoCodecTypeH264: string;

/**
 * @since 11.0
 */
declare var AVVideoCodecTypeHEVC: string;

/**
 * @since 13.0
 */
declare var AVVideoCodecTypeHEVCWithAlpha: string;

/**
 * @since 11.0
 */
declare var AVVideoCodecTypeJPEG: string;

/**
 * @since 10.0
 */
declare var AVVideoColorPrimariesKey: string;

/**
 * @since 11.0
 */
declare var AVVideoColorPrimaries_ITU_R_2020: string;

/**
 * @since 10.0
 */
declare var AVVideoColorPrimaries_ITU_R_709_2: string;

/**
 * @since 10.0
 */
declare var AVVideoColorPrimaries_P3_D65: string;

/**
 * @since 10.0
 */
declare var AVVideoColorPrimaries_SMPTE_C: string;

/**
 * @since 10.0
 */
declare var AVVideoColorPropertiesKey: string;

/**
 * @since 7.0
 */
interface AVVideoCompositing extends NSObjectProtocol {

	/**
	 * @since 15.0
	 */
	canConformColorOfSourceFrames?: boolean;

	requiredPixelBufferAttributesForRenderContext: NSDictionary<string, any>;

	sourcePixelBufferAttributes: NSDictionary<string, any>;

	/**
	 * @since 14.0
	 */
	supportsHDRSourceFrames?: boolean;

	/**
	 * @since 10.0
	 */
	supportsWideColorSourceFrames?: boolean;

	/**
	 * @since 13.0
	 */
	anticipateRenderingUsingHint?(renderHint: AVVideoCompositionRenderHint): void;

	cancelAllPendingVideoCompositionRequests?(): void;

	/**
	 * @since 13.0
	 */
	prerollForRenderingUsingHint?(renderHint: AVVideoCompositionRenderHint): void;

	renderContextChanged(newRenderContext: AVVideoCompositionRenderContext): void;

	startVideoCompositionRequest(asyncVideoCompositionRequest: AVAsynchronousVideoCompositionRequest): void;
}
declare var AVVideoCompositing: {

	prototype: AVVideoCompositing;
};

/**
 * @since 4.0
 */
declare class AVVideoComposition extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVVideoComposition; // inherited from NSObject

	static new(): AVVideoComposition; // inherited from NSObject

	/**
	 * @since 9.0
	 * @deprecated 18.0
	 */
	static videoCompositionWithAssetApplyingCIFiltersWithHandler(asset: AVAsset, applier: (p1: AVAsynchronousCIImageFilteringRequest) => void): AVVideoComposition;

	/**
	 * @since 16.0
	 */
	static videoCompositionWithAssetApplyingCIFiltersWithHandlerCompletionHandler(asset: AVAsset, applier: (p1: AVAsynchronousCIImageFilteringRequest) => void, completionHandler: (p1: AVVideoComposition, p2: NSError) => void): void;

	/**
	 * @since 6.0
	 * @deprecated 18.0
	 */
	static videoCompositionWithPropertiesOfAsset(asset: AVAsset): AVVideoComposition;

	/**
	 * @since 16.0
	 */
	static videoCompositionWithPropertiesOfAssetCompletionHandler(asset: AVAsset, completionHandler: (p1: AVVideoComposition, p2: NSError) => void): void;

	readonly animationTool: AVVideoCompositionCoreAnimationTool;

	/**
	 * @since 10.0
	 */
	readonly colorPrimaries: string;

	/**
	 * @since 10.0
	 */
	readonly colorTransferFunction: string;

	/**
	 * @since 10.0
	 */
	readonly colorYCbCrMatrix: string;

	/**
	 * @since 7.0
	 */
	readonly customVideoCompositorClass: typeof NSObject;

	readonly frameDuration: CMTime;

	readonly instructions: NSArray<AVVideoCompositionInstructionProtocol>;

	/**
	 * @since 17.0
	 */
	readonly perFrameHDRDisplayMetadataPolicy: string;

	/**
	 * @since 4.0
	 */
	readonly renderScale: number;

	readonly renderSize: CGSize;

	/**
	 * @since 15.0
	 */
	readonly sourceSampleDataTrackIDs: NSArray<number>;

	/**
	 * @since 11.0
	 */
	readonly sourceTrackIDForFrameTiming: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 16.0
	 * @deprecated 18.0
	 */
	determineValidityForAssetTimeRangeValidationDelegateCompletionHandler(asset: AVAsset, timeRange: CMTimeRange, validationDelegate: AVVideoCompositionValidationHandling, completionHandler: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 5.0
	 * @deprecated 18.0
	 */
	isValidForAssetTimeRangeValidationDelegate(asset: AVAsset, timeRange: CMTimeRange, validationDelegate: AVVideoCompositionValidationHandling): boolean;

	/**
	 * @since 18.0
	 */
	isValidForTracksAssetDurationTimeRangeValidationDelegate(tracks: NSArray<AVAssetTrack> | AVAssetTrack[], duration: CMTime, timeRange: CMTimeRange, validationDelegate: AVVideoCompositionValidationHandling): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.0
 */
declare class AVVideoCompositionCoreAnimationTool extends NSObject {

	static alloc(): AVVideoCompositionCoreAnimationTool; // inherited from NSObject

	static new(): AVVideoCompositionCoreAnimationTool; // inherited from NSObject

	static videoCompositionCoreAnimationToolWithAdditionalLayerAsTrackID(layer: CALayer, trackID: number): AVVideoCompositionCoreAnimationTool;

	static videoCompositionCoreAnimationToolWithPostProcessingAsVideoLayerInLayer(videoLayer: CALayer, animationLayer: CALayer): AVVideoCompositionCoreAnimationTool;

	/**
	 * @since 7.0
	 */
	static videoCompositionCoreAnimationToolWithPostProcessingAsVideoLayersInLayer(videoLayers: NSArray<CALayer> | CALayer[], animationLayer: CALayer): AVVideoCompositionCoreAnimationTool;
}

/**
 * @since 4.0
 */
declare class AVVideoCompositionInstruction extends NSObject implements AVVideoCompositionInstructionProtocol, NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): AVVideoCompositionInstruction; // inherited from NSObject

	static new(): AVVideoCompositionInstruction; // inherited from NSObject

	readonly backgroundColor: any;

	readonly layerInstructions: NSArray<AVVideoCompositionLayerInstruction>;

	readonly containsTweening: boolean; // inherited from AVVideoCompositionInstructionProtocol

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly enablePostProcessing: boolean; // inherited from AVVideoCompositionInstructionProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly passthroughTrackID: number; // inherited from AVVideoCompositionInstructionProtocol

	/**
	 * @since 15.0
	 */
	readonly requiredSourceSampleDataTrackIDs: NSArray<number>; // inherited from AVVideoCompositionInstructionProtocol

	readonly requiredSourceTrackIDs: NSArray<NSValue>; // inherited from AVVideoCompositionInstructionProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly timeRange: CMTimeRange; // inherited from AVVideoCompositionInstructionProtocol

	readonly  // inherited from NSObjectProtocol

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

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

/**
 * @since 7.0
 */
interface AVVideoCompositionInstructionProtocol extends NSObjectProtocol {

	containsTweening: boolean;

	enablePostProcessing: boolean;

	passthroughTrackID: number;

	/**
	 * @since 15.0
	 */
	requiredSourceSampleDataTrackIDs?: NSArray<number>;

	requiredSourceTrackIDs: NSArray<NSValue>;

	timeRange: CMTimeRange;
}
declare var AVVideoCompositionInstructionProtocol: {

	prototype: AVVideoCompositionInstructionProtocol;
};

/**
 * @since 4.0
 */
declare class AVVideoCompositionLayerInstruction extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): AVVideoCompositionLayerInstruction; // inherited from NSObject

	static new(): AVVideoCompositionLayerInstruction; // inherited from NSObject

	readonly trackID: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 7.0
	 */
	getCropRectangleRampForTimeStartCropRectangleEndCropRectangleTimeRange(time: CMTime, startCropRectangle: interop.Pointer | interop.Reference<CGRect>, endCropRectangle: interop.Pointer | interop.Reference<CGRect>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	getOpacityRampForTimeStartOpacityEndOpacityTimeRange(time: CMTime, startOpacity: interop.Pointer | interop.Reference<number>, endOpacity: interop.Pointer | interop.Reference<number>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	getTransformRampForTimeStartTransformEndTransformTimeRange(time: CMTime, startTransform: interop.Pointer | interop.Reference<CGAffineTransform>, endTransform: interop.Pointer | interop.Reference<CGAffineTransform>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	initWithCoder(coder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 17.0
 */
declare var AVVideoCompositionPerFrameHDRDisplayMetadataPolicyGenerate: string;

/**
 * @since 17.0
 */
declare var AVVideoCompositionPerFrameHDRDisplayMetadataPolicyPropagate: string;

/**
 * @since 7.0
 */
declare class AVVideoCompositionRenderContext extends NSObject {

	static alloc(): AVVideoCompositionRenderContext; // inherited from NSObject

	static new(): AVVideoCompositionRenderContext; // inherited from NSObject

	readonly edgeWidths: AVEdgeWidths;

	readonly highQualityRendering: boolean;

	readonly pixelAspectRatio: AVPixelAspectRatio;

	readonly renderScale: number;

	readonly renderTransform: CGAffineTransform;

	readonly size: CGSize;

	readonly videoComposition: AVVideoComposition;

	newPixelBuffer(): any;
}

/**
 * @since 13.0
 */
declare class AVVideoCompositionRenderHint extends NSObject {

	static alloc(): AVVideoCompositionRenderHint; // inherited from NSObject

	static new(): AVVideoCompositionRenderHint; // inherited from NSObject

	readonly endCompositionTime: CMTime;

	readonly startCompositionTime: CMTime;
}

/**
 * @since 5.0
 */
interface AVVideoCompositionValidationHandling extends NSObjectProtocol {

	/**
	 * @since 5.0
	 */
	videoCompositionShouldContinueValidatingAfterFindingEmptyTimeRange?(videoComposition: AVVideoComposition, timeRange: CMTimeRange): boolean;

	/**
	 * @since 5.0
	 */
	videoCompositionShouldContinueValidatingAfterFindingInvalidTimeRangeInInstruction?(videoComposition: AVVideoComposition, videoCompositionInstruction: AVVideoCompositionInstructionProtocol): boolean;

	/**
	 * @since 5.0
	 */
	videoCompositionShouldContinueValidatingAfterFindingInvalidTrackIDInInstructionLayerInstructionAsset?(videoComposition: AVVideoComposition, videoCompositionInstruction: AVVideoCompositionInstructionProtocol, layerInstruction: AVVideoCompositionLayerInstruction, asset: AVAsset): boolean;

	/**
	 * @since 5.0
	 */
	videoCompositionShouldContinueValidatingAfterFindingInvalidValueForKey?(videoComposition: AVVideoComposition, key: string): boolean;
}
declare var AVVideoCompositionValidationHandling: {

	prototype: AVVideoCompositionValidationHandling;
};

/**
 * @since 4.0
 */
declare var AVVideoCompressionPropertiesKey: string;

/**
 * @since 17.0
 */
declare var AVVideoDecompressionPropertiesKey: string;

/**
 * @since 7.0
 */
declare var AVVideoExpectedSourceFrameRateKey: string;

/**
 * @since 7.0
 */
declare var AVVideoH264EntropyModeCABAC: string;

/**
 * @since 7.0
 */
declare var AVVideoH264EntropyModeCAVLC: string;

/**
 * @since 7.0
 */
declare var AVVideoH264EntropyModeKey: string;

/**
 * @since 4.0
 */
declare var AVVideoHeightKey: string;

/**
 * @since 7.0
 */
declare var AVVideoMaxKeyFrameIntervalDurationKey: string;

/**
 * @since 4.0
 */
declare var AVVideoMaxKeyFrameIntervalKey: string;

/**
 * @since 17.2
 */
declare class AVVideoOutputSpecification extends NSObject implements NSCopying {

	static alloc(): AVVideoOutputSpecification; // inherited from NSObject

	static new(): AVVideoOutputSpecification; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	defaultOutputSettings: NSDictionary<string, any>;

	/**
	 * @since 17.2
	 * @deprecated 100000
	 */
	defaultPixelBufferAttributes: NSDictionary<string, any>;

	readonly preferredTagCollections: NSArray<any>;

	constructor(o: { tagCollections: NSArray<any> | any[]; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTagCollections(tagCollections: NSArray<any> | any[]): this;

	/**
	 * @since 17.2
	 * @deprecated 100000
	 */
	setOutputPixelBufferAttributesForTagCollection(pixelBufferAttributes: NSDictionary<string, any>, tagCollection: any): void;

	/**
	 * @since 18.0
	 */
	setOutputSettingsForTagCollection(outputSettings: NSDictionary<string, any>, tagCollection: any): void;
}

/**
 * @since 17.4
 */
declare class AVVideoPerformanceMetrics extends NSObject {

	static alloc(): AVVideoPerformanceMetrics; // inherited from NSObject

	static new(): AVVideoPerformanceMetrics; // inherited from NSObject

	readonly numberOfCorruptedFrames: number;

	readonly numberOfDroppedFrames: number;

	readonly numberOfFramesDisplayedUsingOptimizedCompositing: number;

	readonly totalAccumulatedFrameDelay: number;

	readonly totalNumberOfFrames: number;
}

/**
 * @since 4.0
 */
declare var AVVideoPixelAspectRatioHorizontalSpacingKey: string;

/**
 * @since 4.0
 */
declare var AVVideoPixelAspectRatioKey: string;

/**
 * @since 4.0
 */
declare var AVVideoPixelAspectRatioVerticalSpacingKey: string;

/**
 * @since 4.0
 */
declare var AVVideoProfileLevelH264Baseline30: string;

/**
 * @since 4.0
 */
declare var AVVideoProfileLevelH264Baseline31: string;

/**
 * @since 5.0
 */
declare var AVVideoProfileLevelH264Baseline41: string;

/**
 * @since 7.0
 */
declare var AVVideoProfileLevelH264BaselineAutoLevel: string;

/**
 * @since 6.0
 */
declare var AVVideoProfileLevelH264High40: string;

/**
 * @since 6.0
 */
declare var AVVideoProfileLevelH264High41: string;

/**
 * @since 7.0
 */
declare var AVVideoProfileLevelH264HighAutoLevel: string;

/**
 * @since 4.0
 */
declare var AVVideoProfileLevelH264Main30: string;

/**
 * @since 4.0
 */
declare var AVVideoProfileLevelH264Main31: string;

/**
 * @since 5.0
 */
declare var AVVideoProfileLevelH264Main32: string;

/**
 * @since 5.0
 */
declare var AVVideoProfileLevelH264Main41: string;

/**
 * @since 7.0
 */
declare var AVVideoProfileLevelH264MainAutoLevel: string;

/**
 * @since 4.0
 */
declare var AVVideoProfileLevelKey: string;

/**
 * @since 5.0
 */
declare var AVVideoQualityKey: string;

/**
 * @since 15.0
 */
declare var AVVideoRangeHLG: string;

/**
 * @since 15.0
 */
declare var AVVideoRangePQ: string;

/**
 * @since 15.0
 */
declare var AVVideoRangeSDR: string;

/**
 * @since 5.0
 */
declare var AVVideoScalingModeFit: string;

/**
 * @since 5.0
 */
declare var AVVideoScalingModeKey: string;

/**
 * @since 5.0
 */
declare var AVVideoScalingModeResize: string;

/**
 * @since 5.0
 */
declare var AVVideoScalingModeResizeAspect: string;

/**
 * @since 5.0
 */
declare var AVVideoScalingModeResizeAspectFill: string;

/**
 * @since 10.0
 */
declare var AVVideoTransferFunctionKey: string;

/**
 * @since 18.0
 */
declare var AVVideoTransferFunction_IEC_sRGB: string;

/**
 * @since 11.0
 */
declare var AVVideoTransferFunction_ITU_R_2100_HLG: string;

/**
 * @since 10.0
 */
declare var AVVideoTransferFunction_ITU_R_709_2: string;

/**
 * @since 16.0
 */
declare var AVVideoTransferFunction_Linear: string;

/**
 * @since 11.0
 */
declare var AVVideoTransferFunction_SMPTE_ST_2084_PQ: string;

/**
 * @since 4.0
 */
declare var AVVideoWidthKey: string;

/**
 * @since 10.0
 */
declare var AVVideoYCbCrMatrixKey: string;

/**
 * @since 11.0
 */
declare var AVVideoYCbCrMatrix_ITU_R_2020: string;

/**
 * @since 10.0
 */
declare var AVVideoYCbCrMatrix_ITU_R_601_4: string;

/**
 * @since 10.0
 */
declare var AVVideoYCbCrMatrix_ITU_R_709_2: string;

/**
 * @since 17.2
 */
declare class AVZoomRange extends NSObject {

	static alloc(): AVZoomRange; // inherited from NSObject

	static new(): AVZoomRange; // inherited from NSObject

	readonly maxZoomFactor: number;

	readonly minZoomFactor: number;

	containsZoomFactor(zoomFactor: number): boolean;
}

/**
 * @since 17.2
 */
declare function CMTagCollectionCreateWithVideoOutputPreset(allocator: any, preset: CMTagCollectionVideoOutputPreset, newCollectionOut: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 17.2
 */
declare const enum CMTagCollectionVideoOutputPreset {

	kCMTagCollectionVideoOutputPreset_Monoscopic = 0,

	kCMTagCollectionVideoOutputPreset_Stereoscopic = 1
}
