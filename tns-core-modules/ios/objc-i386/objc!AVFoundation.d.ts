
declare class AVAsset extends NSObject implements AVAsynchronousKeyValueLoading, NSCopying {

	static alloc(): AVAsset; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVAsset;

	static new(): AVAsset; // inherited from NSObject

	/* readonly */ availableChapterLocales: NSArray<NSLocale>;

	/* readonly */ availableMediaCharacteristicsWithMediaSelectionOptions: NSArray<string>;

	/* readonly */ availableMetadataFormats: NSArray<string>;

	/* readonly */ canContainFragments: boolean;

	/* readonly */ commonMetadata: NSArray<AVMetadataItem>;

	/* readonly */ compatibleWithAirPlayVideo: boolean;

	/* readonly */ compatibleWithSavedPhotosAlbum: boolean;

	/* readonly */ composable: boolean;

	/* readonly */ containsFragments: boolean;

	/* readonly */ creationDate: AVMetadataItem;

	/* readonly */ duration: CMTime;

	/* readonly */ exportable: boolean;

	/* readonly */ hasProtectedContent: boolean;

	/* readonly */ lyrics: string;

	/* readonly */ metadata: NSArray<AVMetadataItem>;

	/* readonly */ naturalSize: CGSize;

	/* readonly */ playable: boolean;

	/* readonly */ preferredMediaSelection: AVMediaSelection;

	/* readonly */ preferredRate: number;

	/* readonly */ preferredTransform: CGAffineTransform;

	/* readonly */ preferredVolume: number;

	/* readonly */ providesPreciseDurationAndTiming: boolean;

	/* readonly */ readable: boolean;

	/* readonly */ referenceRestrictions: AVAssetReferenceRestrictions;

	/* readonly */ trackGroups: NSArray<AVAssetTrackGroup>;

	/* readonly */ tracks: NSArray<AVAssetTrack>;

	cancelLoading(): void;

	chapterMetadataGroupsBestMatchingPreferredLanguages(preferredLanguages: NSArray<string>): NSArray<AVTimedMetadataGroup>;

	chapterMetadataGroupsWithTitleLocaleContainingItemsWithCommonKeys(locale: NSLocale, commonKeys: NSArray<string>): NSArray<AVTimedMetadataGroup>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string>, handler: () => void): void;

	mediaSelectionGroupForMediaCharacteristic(mediaCharacteristic: string): AVMediaSelectionGroup;

	metadataForFormat(format: string): NSArray<AVMetadataItem>;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;

	trackWithTrackID(trackID: number): AVAssetTrack;

	tracksWithMediaCharacteristic(mediaCharacteristic: string): NSArray<AVAssetTrack>;

	tracksWithMediaType(mediaType: string): NSArray<AVAssetTrack>;

	unusedTrackID(): number;
}

declare class AVAssetCache extends NSObject {

	static alloc(): AVAssetCache; // inherited from NSObject

	static new(): AVAssetCache; // inherited from NSObject

	/* readonly */ playableOffline: boolean;

	mediaSelectionOptionsInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): NSArray<AVMediaSelectionOption>;
}

declare var AVAssetChapterMetadataGroupsDidChangeNotification: string;

interface AVAssetDownloadDelegate extends NSURLSessionTaskDelegate {

	URLSessionAssetDownloadTaskDidFinishDownloadingToURL?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, location: NSURL): void;

	URLSessionAssetDownloadTaskDidLoadTimeRangeTotalTimeRangesLoadedTimeRangeExpectedToLoad?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, timeRange: CMTimeRange, loadedTimeRanges: NSArray<NSValue>, timeRangeExpectedToLoad: CMTimeRange): void;

	URLSessionAssetDownloadTaskDidResolveMediaSelection?(session: NSURLSession, assetDownloadTask: AVAssetDownloadTask, resolvedMediaSelection: AVMediaSelection): void;
}
declare var AVAssetDownloadDelegate: {

	prototype: AVAssetDownloadDelegate;
};

declare class AVAssetDownloadTask extends NSURLSessionTask {

	static alloc(): AVAssetDownloadTask; // inherited from NSObject

	static new(): AVAssetDownloadTask; // inherited from NSObject

	/* readonly */ URLAsset: AVURLAsset;

	/* readonly */ destinationURL: NSURL;

	/* readonly */ loadedTimeRanges: NSArray<NSValue>;

	/* readonly */ options: NSDictionary<string, any>;
}

declare var AVAssetDownloadTaskMediaSelectionKey: string;

declare var AVAssetDownloadTaskMinimumRequiredMediaBitrateKey: string;

declare class AVAssetDownloadURLSession extends NSURLSession {

	static alloc(): AVAssetDownloadURLSession; // inherited from NSObject

	static new(): AVAssetDownloadURLSession; // inherited from NSObject

	static sessionWithConfigurationAssetDownloadDelegateDelegateQueue(configuration: NSURLSessionConfiguration, delegate: AVAssetDownloadDelegate, delegateQueue: NSOperationQueue): AVAssetDownloadURLSession;

	assetDownloadTaskWithURLAssetAssetTitleAssetArtworkDataOptions(URLAsset: AVURLAsset, title: string, artworkData: NSData, options: NSDictionary<string, any>): AVAssetDownloadTask;

	assetDownloadTaskWithURLAssetDestinationURLOptions(URLAsset: AVURLAsset, destinationURL: NSURL, options: NSDictionary<string, any>): AVAssetDownloadTask;
}

declare var AVAssetDurationDidChangeNotification: string;

declare var AVAssetExportPreset1280x720: string;

declare var AVAssetExportPreset1920x1080: string;

declare var AVAssetExportPreset3840x2160: string;

declare var AVAssetExportPreset640x480: string;

declare var AVAssetExportPreset960x540: string;

declare var AVAssetExportPresetAppleM4A: string;

declare var AVAssetExportPresetHighestQuality: string;

declare var AVAssetExportPresetLowQuality: string;

declare var AVAssetExportPresetMediumQuality: string;

declare var AVAssetExportPresetPassthrough: string;

declare class AVAssetExportSession extends NSObject {

	static allExportPresets(): NSArray<string>;

	static alloc(): AVAssetExportSession; // inherited from NSObject

	static determineCompatibilityOfExportPresetWithAssetOutputFileTypeCompletionHandler(presetName: string, asset: AVAsset, outputFileType: string, handler: (p1: boolean) => void): void;

	static exportPresetsCompatibleWithAsset(asset: AVAsset): NSArray<string>;

	static exportSessionWithAssetPresetName(asset: AVAsset, presetName: string): AVAssetExportSession;

	static new(): AVAssetExportSession; // inherited from NSObject

	/* readonly */ asset: AVAsset;

	audioMix: AVAudioMix;

	audioTimePitchAlgorithm: string;

	canPerformMultiplePassesOverSourceMediaData: boolean;

	/* readonly */ customVideoCompositor: AVVideoCompositing;

	directoryForTemporaryFiles: NSURL;

	/* readonly */ error: NSError;

	/* readonly */ estimatedOutputFileLength: number;

	fileLengthLimit: number;

	/* readonly */ maxDuration: CMTime;

	metadata: NSArray<AVMetadataItem>;

	metadataItemFilter: AVMetadataItemFilter;

	outputFileType: string;

	outputURL: NSURL;

	/* readonly */ presetName: string;

	/* readonly */ progress: number;

	shouldOptimizeForNetworkUse: boolean;

	/* readonly */ status: AVAssetExportSessionStatus;

	/* readonly */ supportedFileTypes: NSArray<string>;

	timeRange: CMTimeRange;

	videoComposition: AVVideoComposition;

	constructor(o: { asset: AVAsset; presetName: string; });

	cancelExport(): void;

	determineCompatibleFileTypesWithCompletionHandler(handler: (p1: NSArray<string>) => void): void;

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

declare class AVAssetImageGenerator extends NSObject {

	static alloc(): AVAssetImageGenerator; // inherited from NSObject

	static assetImageGeneratorWithAsset(asset: AVAsset): AVAssetImageGenerator;

	static new(): AVAssetImageGenerator; // inherited from NSObject

	apertureMode: string;

	appliesPreferredTrackTransform: boolean;

	/* readonly */ asset: AVAsset;

	/* readonly */ customVideoCompositor: AVVideoCompositing;

	maximumSize: CGSize;

	requestedTimeToleranceAfter: CMTime;

	requestedTimeToleranceBefore: CMTime;

	videoComposition: AVVideoComposition;

	constructor(o: { asset: AVAsset; });

	cancelAllCGImageGeneration(): void;

	copyCGImageAtTimeActualTimeError(requestedTime: CMTime, actualTime: interop.Pointer | interop.Reference<CMTime>): any;

	generateCGImagesAsynchronouslyForTimesCompletionHandler(requestedTimes: NSArray<NSValue>, handler: (p1: CMTime, p2: any, p3: CMTime, p4: AVAssetImageGeneratorResult, p5: NSError) => void): void;

	initWithAsset(asset: AVAsset): this;
}

declare var AVAssetImageGeneratorApertureModeCleanAperture: string;

declare var AVAssetImageGeneratorApertureModeEncodedPixels: string;

declare var AVAssetImageGeneratorApertureModeProductionAperture: string;

declare const enum AVAssetImageGeneratorResult {

	Succeeded = 0,

	Failed = 1,

	Cancelled = 2
}

declare var AVAssetMediaSelectionGroupsDidChangeNotification: string;

declare class AVAssetReader extends NSObject {

	static alloc(): AVAssetReader; // inherited from NSObject

	static assetReaderWithAssetError(asset: AVAsset): AVAssetReader;

	static new(): AVAssetReader; // inherited from NSObject

	/* readonly */ asset: AVAsset;

	/* readonly */ error: NSError;

	/* readonly */ outputs: NSArray<AVAssetReaderOutput>;

	/* readonly */ status: AVAssetReaderStatus;

	timeRange: CMTimeRange;

	constructor(o: { asset: AVAsset; });

	addOutput(output: AVAssetReaderOutput): void;

	canAddOutput(output: AVAssetReaderOutput): boolean;

	cancelReading(): void;

	initWithAssetError(asset: AVAsset): this;

	startReading(): boolean;
}

declare class AVAssetReaderAudioMixOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderAudioMixOutput; // inherited from NSObject

	static assetReaderAudioMixOutputWithAudioTracksAudioSettings(audioTracks: NSArray<AVAssetTrack>, audioSettings: NSDictionary<string, any>): AVAssetReaderAudioMixOutput;

	static new(): AVAssetReaderAudioMixOutput; // inherited from NSObject

	audioMix: AVAudioMix;

	/* readonly */ audioSettings: NSDictionary<string, any>;

	audioTimePitchAlgorithm: string;

	/* readonly */ audioTracks: NSArray<AVAssetTrack>;

	constructor(o: { audioTracks: NSArray<AVAssetTrack>; audioSettings: NSDictionary<string, any>; });

	initWithAudioTracksAudioSettings(audioTracks: NSArray<AVAssetTrack>, audioSettings: NSDictionary<string, any>): this;
}

declare class AVAssetReaderOutput extends NSObject {

	static alloc(): AVAssetReaderOutput; // inherited from NSObject

	static new(): AVAssetReaderOutput; // inherited from NSObject

	alwaysCopiesSampleData: boolean;

	/* readonly */ mediaType: string;

	supportsRandomAccess: boolean;

	copyNextSampleBuffer(): any;

	markConfigurationAsFinal(): void;

	resetForReadingTimeRanges(timeRanges: NSArray<NSValue>): void;
}

declare class AVAssetReaderOutputMetadataAdaptor extends NSObject {

	static alloc(): AVAssetReaderOutputMetadataAdaptor; // inherited from NSObject

	static assetReaderOutputMetadataAdaptorWithAssetReaderTrackOutput(trackOutput: AVAssetReaderTrackOutput): AVAssetReaderOutputMetadataAdaptor;

	static new(): AVAssetReaderOutputMetadataAdaptor; // inherited from NSObject

	/* readonly */ assetReaderTrackOutput: AVAssetReaderTrackOutput;

	constructor(o: { assetReaderTrackOutput: AVAssetReaderTrackOutput; });

	initWithAssetReaderTrackOutput(trackOutput: AVAssetReaderTrackOutput): this;

	nextTimedMetadataGroup(): AVTimedMetadataGroup;
}

declare class AVAssetReaderSampleReferenceOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderSampleReferenceOutput; // inherited from NSObject

	static assetReaderSampleReferenceOutputWithTrack(track: AVAssetTrack): AVAssetReaderSampleReferenceOutput;

	static new(): AVAssetReaderSampleReferenceOutput; // inherited from NSObject

	/* readonly */ track: AVAssetTrack;

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

declare class AVAssetReaderTrackOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderTrackOutput; // inherited from NSObject

	static assetReaderTrackOutputWithTrackOutputSettings(track: AVAssetTrack, outputSettings: NSDictionary<string, any>): AVAssetReaderTrackOutput;

	static new(): AVAssetReaderTrackOutput; // inherited from NSObject

	audioTimePitchAlgorithm: string;

	/* readonly */ outputSettings: NSDictionary<string, any>;

	/* readonly */ track: AVAssetTrack;

	constructor(o: { track: AVAssetTrack; outputSettings: NSDictionary<string, any>; });

	initWithTrackOutputSettings(track: AVAssetTrack, outputSettings: NSDictionary<string, any>): this;
}

declare class AVAssetReaderVideoCompositionOutput extends AVAssetReaderOutput {

	static alloc(): AVAssetReaderVideoCompositionOutput; // inherited from NSObject

	static assetReaderVideoCompositionOutputWithVideoTracksVideoSettings(videoTracks: NSArray<AVAssetTrack>, videoSettings: NSDictionary<string, any>): AVAssetReaderVideoCompositionOutput;

	static new(): AVAssetReaderVideoCompositionOutput; // inherited from NSObject

	/* readonly */ customVideoCompositor: AVVideoCompositing;

	videoComposition: AVVideoComposition;

	/* readonly */ videoSettings: NSDictionary<string, any>;

	/* readonly */ videoTracks: NSArray<AVAssetTrack>;

	constructor(o: { videoTracks: NSArray<AVAssetTrack>; videoSettings: NSDictionary<string, any>; });

	initWithVideoTracksVideoSettings(videoTracks: NSArray<AVAssetTrack>, videoSettings: NSDictionary<string, any>): this;
}

declare const enum AVAssetReferenceRestrictions {

	ForbidNone = 0,

	ForbidRemoteReferenceToLocal = 1,

	ForbidLocalReferenceToRemote = 2,

	ForbidCrossSiteReference = 4,

	ForbidLocalReferenceToLocal = 8,

	ForbidAll = 65535
}

declare class AVAssetResourceLoader extends NSObject {

	static alloc(): AVAssetResourceLoader; // inherited from NSObject

	static new(): AVAssetResourceLoader; // inherited from NSObject

	/* readonly */ delegate: AVAssetResourceLoaderDelegate;

	/* readonly */ delegateQueue: NSObject;

	preloadsEligibleContentKeys: boolean;

	setDelegateQueue(delegate: AVAssetResourceLoaderDelegate, delegateQueue: NSObject): void;
}

interface AVAssetResourceLoaderDelegate extends NSObjectProtocol {

	resourceLoaderDidCancelAuthenticationChallenge?(resourceLoader: AVAssetResourceLoader, authenticationChallenge: NSURLAuthenticationChallenge): void;

	resourceLoaderDidCancelLoadingRequest?(resourceLoader: AVAssetResourceLoader, loadingRequest: AVAssetResourceLoadingRequest): void;

	resourceLoaderShouldWaitForLoadingOfRequestedResource?(resourceLoader: AVAssetResourceLoader, loadingRequest: AVAssetResourceLoadingRequest): boolean;

	resourceLoaderShouldWaitForRenewalOfRequestedResource?(resourceLoader: AVAssetResourceLoader, renewalRequest: AVAssetResourceRenewalRequest): boolean;

	resourceLoaderShouldWaitForResponseToAuthenticationChallenge?(resourceLoader: AVAssetResourceLoader, authenticationChallenge: NSURLAuthenticationChallenge): boolean;
}
declare var AVAssetResourceLoaderDelegate: {

	prototype: AVAssetResourceLoaderDelegate;
};

declare class AVAssetResourceLoadingContentInformationRequest extends NSObject {

	static alloc(): AVAssetResourceLoadingContentInformationRequest; // inherited from NSObject

	static new(): AVAssetResourceLoadingContentInformationRequest; // inherited from NSObject

	byteRangeAccessSupported: boolean;

	contentLength: number;

	contentType: string;

	renewalDate: Date;
}

declare class AVAssetResourceLoadingDataRequest extends NSObject {

	static alloc(): AVAssetResourceLoadingDataRequest; // inherited from NSObject

	static new(): AVAssetResourceLoadingDataRequest; // inherited from NSObject

	/* readonly */ currentOffset: number;

	/* readonly */ requestedLength: number;

	/* readonly */ requestedOffset: number;

	/* readonly */ requestsAllDataToEndOfResource: boolean;

	respondWithData(data: NSData): void;
}

declare class AVAssetResourceLoadingRequest extends NSObject {

	static alloc(): AVAssetResourceLoadingRequest; // inherited from NSObject

	static new(): AVAssetResourceLoadingRequest; // inherited from NSObject

	/* readonly */ cancelled: boolean;

	/* readonly */ contentInformationRequest: AVAssetResourceLoadingContentInformationRequest;

	/* readonly */ dataRequest: AVAssetResourceLoadingDataRequest;

	/* readonly */ finished: boolean;

	redirect: NSURLRequest;

	/* readonly */ request: NSURLRequest;

	response: NSURLResponse;

	finishLoading(): void;

	finishLoadingWithError(error: NSError): void;

	finishLoadingWithResponseDataRedirect(response: NSURLResponse, data: NSData, redirect: NSURLRequest): void;

	persistentContentKeyFromKeyVendorResponseOptionsError(keyVendorResponse: NSData, options: NSDictionary<string, any>): NSData;

	streamingContentKeyRequestDataForAppContentIdentifierOptionsError(appIdentifier: NSData, contentIdentifier: NSData, options: NSDictionary<string, any>): NSData;
}

declare var AVAssetResourceLoadingRequestStreamingContentKeyRequestRequiresPersistentKey: string;

declare class AVAssetResourceRenewalRequest extends AVAssetResourceLoadingRequest {

	static alloc(): AVAssetResourceRenewalRequest; // inherited from NSObject

	static new(): AVAssetResourceRenewalRequest; // inherited from NSObject
}

declare class AVAssetTrack extends NSObject implements AVAsynchronousKeyValueLoading, NSCopying {

	static alloc(): AVAssetTrack; // inherited from NSObject

	static new(): AVAssetTrack; // inherited from NSObject

	/* readonly */ asset: AVAsset;

	/* readonly */ availableMetadataFormats: NSArray<string>;

	/* readonly */ availableTrackAssociationTypes: NSArray<string>;

	/* readonly */ commonMetadata: NSArray<AVMetadataItem>;

	/* readonly */ enabled: boolean;

	/* readonly */ estimatedDataRate: number;

	/* readonly */ extendedLanguageTag: string;

	/* readonly */ formatDescriptions: NSArray<any>;

	/* readonly */ languageCode: string;

	/* readonly */ mediaType: string;

	/* readonly */ metadata: NSArray<AVMetadataItem>;

	/* readonly */ minFrameDuration: CMTime;

	/* readonly */ naturalSize: CGSize;

	/* readonly */ naturalTimeScale: number;

	/* readonly */ nominalFrameRate: number;

	/* readonly */ playable: boolean;

	/* readonly */ preferredTransform: CGAffineTransform;

	/* readonly */ preferredVolume: number;

	/* readonly */ requiresFrameReordering: boolean;

	/* readonly */ segments: NSArray<AVAssetTrackSegment>;

	/* readonly */ selfContained: boolean;

	/* readonly */ timeRange: CMTimeRange;

	/* readonly */ totalSampleDataLength: number;

	/* readonly */ trackID: number;

	associatedTracksOfType(trackAssociationType: string): NSArray<AVAssetTrack>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	hasMediaCharacteristic(mediaCharacteristic: string): boolean;

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string>, handler: () => void): void;

	metadataForFormat(format: string): NSArray<AVMetadataItem>;

	samplePresentationTimeForTrackTime(trackTime: CMTime): CMTime;

	segmentForTrackTime(trackTime: CMTime): AVAssetTrackSegment;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;
}

declare class AVAssetTrackGroup extends NSObject implements NSCopying {

	static alloc(): AVAssetTrackGroup; // inherited from NSObject

	static new(): AVAssetTrackGroup; // inherited from NSObject

	/* readonly */ trackIDs: NSArray<number>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class AVAssetTrackSegment extends NSObject {

	static alloc(): AVAssetTrackSegment; // inherited from NSObject

	static new(): AVAssetTrackSegment; // inherited from NSObject

	/* readonly */ empty: boolean;

	/* readonly */ timeMapping: CMTimeMapping;
}

declare var AVAssetTrackSegmentsDidChangeNotification: string;

declare var AVAssetTrackTimeRangeDidChangeNotification: string;

declare var AVAssetTrackTrackAssociationsDidChangeNotification: string;

declare class AVAssetWriter extends NSObject {

	static alloc(): AVAssetWriter; // inherited from NSObject

	static assetWriterWithURLFileTypeError(outputURL: NSURL, outputFileType: string): AVAssetWriter;

	static new(): AVAssetWriter; // inherited from NSObject

	/* readonly */ availableMediaTypes: NSArray<string>;

	directoryForTemporaryFiles: NSURL;

	/* readonly */ error: NSError;

	/* readonly */ inputGroups: NSArray<AVAssetWriterInputGroup>;

	/* readonly */ inputs: NSArray<AVAssetWriterInput>;

	metadata: NSArray<AVMetadataItem>;

	movieFragmentInterval: CMTime;

	movieTimeScale: number;

	/* readonly */ outputFileType: string;

	/* readonly */ outputURL: NSURL;

	overallDurationHint: CMTime;

	shouldOptimizeForNetworkUse: boolean;

	/* readonly */ status: AVAssetWriterStatus;

	constructor(o: { URL: NSURL; fileType: string; });

	addInput(input: AVAssetWriterInput): void;

	addInputGroup(inputGroup: AVAssetWriterInputGroup): void;

	canAddInput(input: AVAssetWriterInput): boolean;

	canAddInputGroup(inputGroup: AVAssetWriterInputGroup): boolean;

	canApplyOutputSettingsForMediaType(outputSettings: NSDictionary<string, any>, mediaType: string): boolean;

	cancelWriting(): void;

	endSessionAtSourceTime(endTime: CMTime): void;

	finishWriting(): boolean;

	finishWritingWithCompletionHandler(handler: () => void): void;

	initWithURLFileTypeError(outputURL: NSURL, outputFileType: string): this;

	startSessionAtSourceTime(startTime: CMTime): void;

	startWriting(): boolean;
}

declare class AVAssetWriterInput extends NSObject {

	static alloc(): AVAssetWriterInput; // inherited from NSObject

	static assetWriterInputWithMediaTypeOutputSettings(mediaType: string, outputSettings: NSDictionary<string, any>): AVAssetWriterInput;

	static assetWriterInputWithMediaTypeOutputSettingsSourceFormatHint(mediaType: string, outputSettings: NSDictionary<string, any>, sourceFormatHint: any): AVAssetWriterInput;

	static new(): AVAssetWriterInput; // inherited from NSObject

	/* readonly */ canPerformMultiplePasses: boolean;

	/* readonly */ currentPassDescription: AVAssetWriterInputPassDescription;

	expectsMediaDataInRealTime: boolean;

	extendedLanguageTag: string;

	languageCode: string;

	marksOutputTrackAsEnabled: boolean;

	mediaTimeScale: number;

	/* readonly */ mediaType: string;

	metadata: NSArray<AVMetadataItem>;

	naturalSize: CGSize;

	/* readonly */ outputSettings: NSDictionary<string, any>;

	performsMultiPassEncodingIfSupported: boolean;

	preferredMediaChunkAlignment: number;

	preferredMediaChunkDuration: CMTime;

	preferredVolume: number;

	/* readonly */ readyForMoreMediaData: boolean;

	sampleReferenceBaseURL: NSURL;

	/* readonly */ sourceFormatHint: any;

	transform: CGAffineTransform;

	constructor(o: { mediaType: string; outputSettings: NSDictionary<string, any>; });

	constructor(o: { mediaType: string; outputSettings: NSDictionary<string, any>; sourceFormatHint: any; });

	addTrackAssociationWithTrackOfInputType(input: AVAssetWriterInput, trackAssociationType: string): void;

	appendSampleBuffer(sampleBuffer: any): boolean;

	canAddTrackAssociationWithTrackOfInputType(input: AVAssetWriterInput, trackAssociationType: string): boolean;

	initWithMediaTypeOutputSettings(mediaType: string, outputSettings: NSDictionary<string, any>): this;

	initWithMediaTypeOutputSettingsSourceFormatHint(mediaType: string, outputSettings: NSDictionary<string, any>, sourceFormatHint: any): this;

	markAsFinished(): void;

	markCurrentPassAsFinished(): void;

	requestMediaDataWhenReadyOnQueueUsingBlock(queue: NSObject, block: () => void): void;

	respondToEachPassDescriptionOnQueueUsingBlock(queue: NSObject, block: () => void): void;
}

declare class AVAssetWriterInputGroup extends AVMediaSelectionGroup {

	static alloc(): AVAssetWriterInputGroup; // inherited from NSObject

	static assetWriterInputGroupWithInputsDefaultInput(inputs: NSArray<AVAssetWriterInput>, defaultInput: AVAssetWriterInput): AVAssetWriterInputGroup;

	static new(): AVAssetWriterInputGroup; // inherited from NSObject

	/* readonly */ defaultInput: AVAssetWriterInput;

	/* readonly */ inputs: NSArray<AVAssetWriterInput>;

	constructor(o: { inputs: NSArray<AVAssetWriterInput>; defaultInput: AVAssetWriterInput; });

	initWithInputsDefaultInput(inputs: NSArray<AVAssetWriterInput>, defaultInput: AVAssetWriterInput): this;
}

declare class AVAssetWriterInputMetadataAdaptor extends NSObject {

	static alloc(): AVAssetWriterInputMetadataAdaptor; // inherited from NSObject

	static assetWriterInputMetadataAdaptorWithAssetWriterInput(input: AVAssetWriterInput): AVAssetWriterInputMetadataAdaptor;

	static new(): AVAssetWriterInputMetadataAdaptor; // inherited from NSObject

	/* readonly */ assetWriterInput: AVAssetWriterInput;

	constructor(o: { assetWriterInput: AVAssetWriterInput; });

	appendTimedMetadataGroup(timedMetadataGroup: AVTimedMetadataGroup): boolean;

	initWithAssetWriterInput(input: AVAssetWriterInput): this;
}

declare class AVAssetWriterInputPassDescription extends NSObject {

	static alloc(): AVAssetWriterInputPassDescription; // inherited from NSObject

	static new(): AVAssetWriterInputPassDescription; // inherited from NSObject

	/* readonly */ sourceTimeRanges: NSArray<NSValue>;
}

declare class AVAssetWriterInputPixelBufferAdaptor extends NSObject {

	static alloc(): AVAssetWriterInputPixelBufferAdaptor; // inherited from NSObject

	static assetWriterInputPixelBufferAdaptorWithAssetWriterInputSourcePixelBufferAttributes(input: AVAssetWriterInput, sourcePixelBufferAttributes: NSDictionary<string, any>): AVAssetWriterInputPixelBufferAdaptor;

	static new(): AVAssetWriterInputPixelBufferAdaptor; // inherited from NSObject

	/* readonly */ assetWriterInput: AVAssetWriterInput;

	/* readonly */ pixelBufferPool: any;

	/* readonly */ sourcePixelBufferAttributes: NSDictionary<string, any>;

	constructor(o: { assetWriterInput: AVAssetWriterInput; sourcePixelBufferAttributes: NSDictionary<string, any>; });

	appendPixelBufferWithPresentationTime(pixelBuffer: any, presentationTime: CMTime): boolean;

	initWithAssetWriterInputSourcePixelBufferAttributes(input: AVAssetWriterInput, sourcePixelBufferAttributes: NSDictionary<string, any>): this;
}

declare const enum AVAssetWriterStatus {

	Unknown = 0,

	Writing = 1,

	Completed = 2,

	Failed = 3,

	Cancelled = 4
}

declare class AVAsynchronousCIImageFilteringRequest extends NSObject implements NSCopying {

	static alloc(): AVAsynchronousCIImageFilteringRequest; // inherited from NSObject

	static new(): AVAsynchronousCIImageFilteringRequest; // inherited from NSObject

	/* readonly */ compositionTime: CMTime;

	/* readonly */ renderSize: CGSize;

	/* readonly */ sourceImage: CIImage;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	finishWithError(error: NSError): void;

	finishWithImageContext(filteredImage: CIImage, context: CIContext): void;
}

interface AVAsynchronousKeyValueLoading {

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string>, handler: () => void): void;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;
}
declare var AVAsynchronousKeyValueLoading: {

	prototype: AVAsynchronousKeyValueLoading;
};

declare class AVAsynchronousVideoCompositionRequest extends NSObject implements NSCopying {

	static alloc(): AVAsynchronousVideoCompositionRequest; // inherited from NSObject

	static new(): AVAsynchronousVideoCompositionRequest; // inherited from NSObject

	/* readonly */ compositionTime: CMTime;

	/* readonly */ renderContext: AVVideoCompositionRenderContext;

	/* readonly */ sourceTrackIDs: NSArray<number>;

	/* readonly */ videoCompositionInstruction: AVVideoCompositionInstructionProtocol;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	finishCancelledRequest(): void;

	finishWithComposedVideoFrame(composedVideoFrame: any): void;

	finishWithError(error: NSError): void;

	sourceFrameByTrackID(trackID: number): any;
}

interface AVAudio3DAngularOrientation {
	yaw: number;
	pitch: number;
	roll: number;
}
declare var AVAudio3DAngularOrientation: interop.StructType<AVAudio3DAngularOrientation>;

interface AVAudio3DMixing extends NSObjectProtocol {

	obstruction: number;

	occlusion: number;

	position: AVAudio3DPoint;

	rate: number;

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm;

	reverbBlend: number;
}
declare var AVAudio3DMixing: {

	prototype: AVAudio3DMixing;
};

declare const enum AVAudio3DMixingRenderingAlgorithm {

	EqualPowerPanning = 0,

	SphericalHead = 1,

	HRTF = 2,

	SoundField = 3,

	StereoPassThrough = 5
}

interface AVAudio3DPoint {
	x: number;
	y: number;
	z: number;
}
declare var AVAudio3DPoint: interop.StructType<AVAudio3DPoint>;

interface AVAudio3DVectorOrientation {
	forward: AVAudio3DPoint;
	up: AVAudio3DPoint;
}
declare var AVAudio3DVectorOrientation: interop.StructType<AVAudio3DVectorOrientation>;

declare var AVAudioBitRateStrategy_Constant: string;

declare var AVAudioBitRateStrategy_LongTermAverage: string;

declare var AVAudioBitRateStrategy_Variable: string;

declare var AVAudioBitRateStrategy_VariableConstrained: string;

declare class AVAudioBuffer extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAudioBuffer; // inherited from NSObject

	static new(): AVAudioBuffer; // inherited from NSObject

	/* readonly */ audioBufferList: interop.Pointer | interop.Reference<AudioBufferList>;

	/* readonly */ format: AVAudioFormat;

	/* readonly */ mutableAudioBufferList: interop.Pointer | interop.Reference<AudioBufferList>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class AVAudioChannelLayout extends NSObject implements NSSecureCoding {

	static alloc(): AVAudioChannelLayout; // inherited from NSObject

	static layoutWithLayout(layout: interop.Pointer | interop.Reference<AudioChannelLayout>): AVAudioChannelLayout;

	static layoutWithLayoutTag(layoutTag: number): AVAudioChannelLayout;

	static new(): AVAudioChannelLayout; // inherited from NSObject

	/* readonly */ channelCount: number;

	/* readonly */ layout: interop.Pointer | interop.Reference<AudioChannelLayout>;

	/* readonly */ layoutTag: number;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { layout: interop.Pointer | interop.Reference<AudioChannelLayout>; });

	constructor(o: { layoutTag: number; });

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithLayout(layout: interop.Pointer | interop.Reference<AudioChannelLayout>): this;

	initWithLayoutTag(layoutTag: number): this;
}

declare const enum AVAudioCommonFormat {

	OtherFormat = 0,

	PCMFormatFloat32 = 1,

	PCMFormatFloat64 = 2,

	PCMFormatInt16 = 3,

	PCMFormatInt32 = 4
}

declare class AVAudioCompressedBuffer extends AVAudioBuffer {

	static alloc(): AVAudioCompressedBuffer; // inherited from NSObject

	static new(): AVAudioCompressedBuffer; // inherited from NSObject

	/* readonly */ data: interop.Pointer | interop.Reference<any>;

	/* readonly */ maximumPacketSize: number;

	/* readonly */ packetCapacity: number;

	packetCount: number;

	/* readonly */ packetDescriptions: interop.Pointer | interop.Reference<AudioStreamPacketDescription>;

	constructor(o: { format: AVAudioFormat; packetCapacity: number; });

	constructor(o: { format: AVAudioFormat; packetCapacity: number; maximumPacketSize: number; });

	initWithFormatPacketCapacity(format: AVAudioFormat, packetCapacity: number): this;

	initWithFormatPacketCapacityMaximumPacketSize(format: AVAudioFormat, packetCapacity: number, maximumPacketSize: number): this;
}

declare class AVAudioConnectionPoint extends NSObject {

	static alloc(): AVAudioConnectionPoint; // inherited from NSObject

	static new(): AVAudioConnectionPoint; // inherited from NSObject

	/* readonly */ bus: number;

	/* readonly */ node: AVAudioNode;

	constructor(o: { node: AVAudioNode; bus: number; });

	initWithNodeBus(node: AVAudioNode, bus: number): this;
}

declare class AVAudioConverter extends NSObject {

	static alloc(): AVAudioConverter; // inherited from NSObject

	static new(): AVAudioConverter; // inherited from NSObject

	/* readonly */ applicableEncodeBitRates: NSArray<number>;

	/* readonly */ applicableEncodeSampleRates: NSArray<number>;

	/* readonly */ availableEncodeBitRates: NSArray<number>;

	/* readonly */ availableEncodeChannelLayoutTags: NSArray<number>;

	/* readonly */ availableEncodeSampleRates: NSArray<number>;

	bitRate: number;

	bitRateStrategy: string;

	channelMap: NSArray<number>;

	dither: boolean;

	downmix: boolean;

	/* readonly */ inputFormat: AVAudioFormat;

	magicCookie: NSData;

	/* readonly */ maximumOutputPacketSize: number;

	/* readonly */ outputFormat: AVAudioFormat;

	primeInfo: AVAudioConverterPrimeInfo;

	primeMethod: AVAudioConverterPrimeMethod;

	sampleRateConverterAlgorithm: string;

	sampleRateConverterQuality: number;

	constructor(o: { fromFormat: AVAudioFormat; toFormat: AVAudioFormat; });

	convertToBufferErrorWithInputFromBlock(outputBuffer: AVAudioBuffer, outError: interop.Pointer | interop.Reference<NSError>, inputBlock: (p1: number, p2: interop.Pointer | interop.Reference<AVAudioConverterInputStatus>) => AVAudioBuffer): AVAudioConverterOutputStatus;

	convertToBufferFromBufferError(outputBuffer: AVAudioPCMBuffer, inputBuffer: AVAudioPCMBuffer): boolean;

	initFromFormatToFormat(fromFormat: AVAudioFormat, toFormat: AVAudioFormat): this;

	reset(): void;
}

declare const enum AVAudioConverterInputStatus {

	HaveData = 0,

	NoDataNow = 1,

	EndOfStream = 2
}

declare const enum AVAudioConverterOutputStatus {

	HaveData = 0,

	InputRanDry = 1,

	EndOfStream = 2,

	Error = 3
}

interface AVAudioConverterPrimeInfo {
	leadingFrames: number;
	trailingFrames: number;
}
declare var AVAudioConverterPrimeInfo: interop.StructType<AVAudioConverterPrimeInfo>;

declare const enum AVAudioConverterPrimeMethod {

	Pre = 0,

	Normal = 1,

	None = 2
}

declare class AVAudioEngine extends NSObject {

	static alloc(): AVAudioEngine; // inherited from NSObject

	static new(): AVAudioEngine; // inherited from NSObject

	/* readonly */ inputNode: AVAudioInputNode;

	/* readonly */ mainMixerNode: AVAudioMixerNode;

	musicSequence: interop.Pointer | interop.Reference<any>;

	/* readonly */ outputNode: AVAudioOutputNode;

	/* readonly */ running: boolean;

	attachNode(node: AVAudioNode): void;

	connectToConnectionPointsFromBusFormat(sourceNode: AVAudioNode, destNodes: NSArray<AVAudioConnectionPoint>, sourceBus: number, format: AVAudioFormat): void;

	connectToFormat(node1: AVAudioNode, node2: AVAudioNode, format: AVAudioFormat): void;

	connectToFromBusToBusFormat(node1: AVAudioNode, node2: AVAudioNode, bus1: number, bus2: number, format: AVAudioFormat): void;

	detachNode(node: AVAudioNode): void;

	disconnectNodeInput(node: AVAudioNode): void;

	disconnectNodeInputBus(node: AVAudioNode, bus: number): void;

	disconnectNodeOutput(node: AVAudioNode): void;

	disconnectNodeOutputBus(node: AVAudioNode, bus: number): void;

	inputConnectionPointForNodeInputBus(node: AVAudioNode, bus: number): AVAudioConnectionPoint;

	outputConnectionPointsForNodeOutputBus(node: AVAudioNode, bus: number): NSArray<AVAudioConnectionPoint>;

	pause(): void;

	prepare(): void;

	reset(): void;

	startAndReturnError(): boolean;

	stop(): void;
}

declare var AVAudioEngineConfigurationChangeNotification: string;

declare const enum AVAudioEnvironmentDistanceAttenuationModel {

	Exponential = 1,

	Inverse = 2,

	Linear = 3
}

declare class AVAudioEnvironmentDistanceAttenuationParameters extends NSObject {

	static alloc(): AVAudioEnvironmentDistanceAttenuationParameters; // inherited from NSObject

	static new(): AVAudioEnvironmentDistanceAttenuationParameters; // inherited from NSObject

	distanceAttenuationModel: AVAudioEnvironmentDistanceAttenuationModel;

	maximumDistance: number;

	referenceDistance: number;

	rolloffFactor: number;
}

declare class AVAudioEnvironmentNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioEnvironmentNode; // inherited from NSObject

	static new(): AVAudioEnvironmentNode; // inherited from NSObject

	/* readonly */ applicableRenderingAlgorithms: NSArray<number>;

	/* readonly */ distanceAttenuationParameters: AVAudioEnvironmentDistanceAttenuationParameters;

	listenerAngularOrientation: AVAudio3DAngularOrientation;

	listenerPosition: AVAudio3DPoint;

	listenerVectorOrientation: AVAudio3DVectorOrientation;

	/* readonly */ nextAvailableInputBus: number;

	outputVolume: number;

	/* readonly */ reverbParameters: AVAudioEnvironmentReverbParameters;

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	/* readonly */  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

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

declare class AVAudioEnvironmentReverbParameters extends NSObject {

	static alloc(): AVAudioEnvironmentReverbParameters; // inherited from NSObject

	static new(): AVAudioEnvironmentReverbParameters; // inherited from NSObject

	enable: boolean;

	/* readonly */ filterParameters: AVAudioUnitEQFilterParameters;

	level: number;

	loadFactoryReverbPreset(preset: AVAudioUnitReverbPreset): void;
}

declare class AVAudioFile extends NSObject {

	static alloc(): AVAudioFile; // inherited from NSObject

	static new(): AVAudioFile; // inherited from NSObject

	/* readonly */ fileFormat: AVAudioFormat;

	framePosition: number;

	/* readonly */ length: number;

	/* readonly */ processingFormat: AVAudioFormat;

	/* readonly */ url: NSURL;

	constructor(o: { forReading: NSURL; commonFormat: AVAudioCommonFormat; interleaved: boolean; });

	constructor(o: { forReading: NSURL; });

	constructor(o: { forWriting: NSURL; settings: NSDictionary<string, any>; commonFormat: AVAudioCommonFormat; interleaved: boolean; });

	constructor(o: { forWriting: NSURL; settings: NSDictionary<string, any>; });

	initForReadingCommonFormatInterleavedError(fileURL: NSURL, format: AVAudioCommonFormat, interleaved: boolean): this;

	initForReadingError(fileURL: NSURL): this;

	initForWritingSettingsCommonFormatInterleavedError(fileURL: NSURL, settings: NSDictionary<string, any>, format: AVAudioCommonFormat, interleaved: boolean): this;

	initForWritingSettingsError(fileURL: NSURL, settings: NSDictionary<string, any>): this;

	readIntoBufferError(buffer: AVAudioPCMBuffer): boolean;

	readIntoBufferFrameCountError(buffer: AVAudioPCMBuffer, frames: number): boolean;

	writeFromBufferError(buffer: AVAudioPCMBuffer): boolean;
}

declare class AVAudioFormat extends NSObject implements NSSecureCoding {

	static alloc(): AVAudioFormat; // inherited from NSObject

	static new(): AVAudioFormat; // inherited from NSObject

	/* readonly */ channelCount: number;

	/* readonly */ channelLayout: AVAudioChannelLayout;

	/* readonly */ commonFormat: AVAudioCommonFormat;

	/* readonly */ formatDescription: any;

	/* readonly */ interleaved: boolean;

	magicCookie: NSData;

	/* readonly */ sampleRate: number;

	/* readonly */ settings: NSDictionary<string, any>;

	/* readonly */ standard: boolean;

	/* readonly */ streamDescription: interop.Pointer | interop.Reference<AudioStreamBasicDescription>;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { standardFormatWithSampleRate: number; channelLayout: AVAudioChannelLayout; });

	constructor(o: { standardFormatWithSampleRate: number; channels: number; });

	constructor(o: { CMAudioFormatDescription: any; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { commonFormat: AVAudioCommonFormat; sampleRate: number; channels: number; interleaved: boolean; });

	constructor(o: { commonFormat: AVAudioCommonFormat; sampleRate: number; interleaved: boolean; channelLayout: AVAudioChannelLayout; });

	constructor(o: { settings: NSDictionary<string, any>; });

	constructor(o: { streamDescription: interop.Pointer | interop.Reference<AudioStreamBasicDescription>; });

	constructor(o: { streamDescription: interop.Pointer | interop.Reference<AudioStreamBasicDescription>; channelLayout: AVAudioChannelLayout; });

	encodeWithCoder(aCoder: NSCoder): void;

	initStandardFormatWithSampleRateChannelLayout(sampleRate: number, layout: AVAudioChannelLayout): this;

	initStandardFormatWithSampleRateChannels(sampleRate: number, channels: number): this;

	initWithCMAudioFormatDescription(formatDescription: any): this;

	initWithCoder(aDecoder: NSCoder): this;

	initWithCommonFormatSampleRateChannelsInterleaved(format: AVAudioCommonFormat, sampleRate: number, channels: number, interleaved: boolean): this;

	initWithCommonFormatSampleRateInterleavedChannelLayout(format: AVAudioCommonFormat, sampleRate: number, interleaved: boolean, layout: AVAudioChannelLayout): this;

	initWithSettings(settings: NSDictionary<string, any>): this;

	initWithStreamDescription(asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>): this;

	initWithStreamDescriptionChannelLayout(asbd: interop.Pointer | interop.Reference<AudioStreamBasicDescription>, layout: AVAudioChannelLayout): this;
}

declare class AVAudioIONode extends AVAudioNode {

	static alloc(): AVAudioIONode; // inherited from NSObject

	static new(): AVAudioIONode; // inherited from NSObject

	/* readonly */ audioUnit: interop.Pointer | interop.Reference<any>;

	/* readonly */ presentationLatency: number;
}

declare class AVAudioInputNode extends AVAudioIONode implements AVAudioMixing {

	static alloc(): AVAudioInputNode; // inherited from NSObject

	static new(): AVAudioInputNode; // inherited from NSObject

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	/* readonly */  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

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

declare class AVAudioMix extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAudioMix; // inherited from NSObject

	static new(): AVAudioMix; // inherited from NSObject

	/* readonly */ inputParameters: NSArray<AVAudioMixInputParameters>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class AVAudioMixInputParameters extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVAudioMixInputParameters; // inherited from NSObject

	static new(): AVAudioMixInputParameters; // inherited from NSObject

	/* readonly */ audioTapProcessor: any;

	/* readonly */ audioTimePitchAlgorithm: string;

	/* readonly */ trackID: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	getVolumeRampForTimeStartVolumeEndVolumeTimeRange(time: CMTime, startVolume: interop.Pointer | interop.Reference<number>, endVolume: interop.Pointer | interop.Reference<number>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class AVAudioMixerNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioMixerNode; // inherited from NSObject

	static new(): AVAudioMixerNode; // inherited from NSObject

	/* readonly */ nextAvailableInputBus: number;

	outputVolume: number;

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	/* readonly */  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

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

interface AVAudioMixing extends AVAudio3DMixing, AVAudioStereoMixing {

	volume: number;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;
}
declare var AVAudioMixing: {

	prototype: AVAudioMixing;
};

declare class AVAudioMixingDestination extends NSObject implements AVAudioMixing {

	static alloc(): AVAudioMixingDestination; // inherited from NSObject

	static new(): AVAudioMixingDestination; // inherited from NSObject

	/* readonly */ connectionPoint: AVAudioConnectionPoint;

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	/* readonly */  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

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

declare class AVAudioNode extends NSObject {

	static alloc(): AVAudioNode; // inherited from NSObject

	static new(): AVAudioNode; // inherited from NSObject

	/* readonly */ engine: AVAudioEngine;

	/* readonly */ lastRenderTime: AVAudioTime;

	/* readonly */ numberOfInputs: number;

	/* readonly */ numberOfOutputs: number;

	inputFormatForBus(bus: number): AVAudioFormat;

	installTapOnBusBufferSizeFormatBlock(bus: number, bufferSize: number, format: AVAudioFormat, tapBlock: (p1: AVAudioPCMBuffer, p2: AVAudioTime) => void): void;

	nameForInputBus(bus: number): string;

	nameForOutputBus(bus: number): string;

	outputFormatForBus(bus: number): AVAudioFormat;

	removeTapOnBus(bus: number): void;

	reset(): void;
}

declare class AVAudioOutputNode extends AVAudioIONode {

	static alloc(): AVAudioOutputNode; // inherited from NSObject

	static new(): AVAudioOutputNode; // inherited from NSObject
}

declare class AVAudioPCMBuffer extends AVAudioBuffer {

	static alloc(): AVAudioPCMBuffer; // inherited from NSObject

	static new(): AVAudioPCMBuffer; // inherited from NSObject

	/* readonly */ floatChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	/* readonly */ frameCapacity: number;

	frameLength: number;

	/* readonly */ int16ChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	/* readonly */ int32ChannelData: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<number>>;

	/* readonly */ stride: number;

	constructor(o: { PCMFormat: AVAudioFormat; frameCapacity: number; });

	initWithPCMFormatFrameCapacity(format: AVAudioFormat, frameCapacity: number): this;
}

declare class AVAudioPlayer extends NSObject {

	static alloc(): AVAudioPlayer; // inherited from NSObject

	static new(): AVAudioPlayer; // inherited from NSObject

	channelAssignments: NSArray<AVAudioSessionChannelDescription>;

	currentTime: number;

	/* readonly */ data: NSData;

	delegate: AVAudioPlayerDelegate;

	/* readonly */ deviceCurrentTime: number;

	/* readonly */ duration: number;

	enableRate: boolean;

	/* readonly */ format: AVAudioFormat;

	meteringEnabled: boolean;

	/* readonly */ numberOfChannels: number;

	numberOfLoops: number;

	pan: number;

	/* readonly */ playing: boolean;

	rate: number;

	/* readonly */ settings: NSDictionary<string, any>;

	/* readonly */ url: NSURL;

	volume: number;

	constructor(o: { contentsOfURL: NSURL; });

	constructor(o: { contentsOfURL: NSURL; fileTypeHint: string; });

	constructor(o: { data: NSData; });

	constructor(o: { data: NSData; fileTypeHint: string; });

	averagePowerForChannel(channelNumber: number): number;

	initWithContentsOfURLError(url: NSURL): this;

	initWithContentsOfURLFileTypeHintError(url: NSURL, utiString: string): this;

	initWithDataError(data: NSData): this;

	initWithDataFileTypeHintError(data: NSData, utiString: string): this;

	pause(): void;

	peakPowerForChannel(channelNumber: number): number;

	play(): boolean;

	playAtTime(time: number): boolean;

	prepareToPlay(): boolean;

	setVolumeFadeDuration(volume: number, duration: number): void;

	stop(): void;

	updateMeters(): void;
}

interface AVAudioPlayerDelegate extends NSObjectProtocol {

	audioPlayerBeginInterruption?(player: AVAudioPlayer): void;

	audioPlayerDecodeErrorDidOccurError?(player: AVAudioPlayer, error: NSError): void;

	audioPlayerDidFinishPlayingSuccessfully?(player: AVAudioPlayer, flag: boolean): void;

	audioPlayerEndInterruption?(player: AVAudioPlayer): void;

	audioPlayerEndInterruptionWithFlags?(player: AVAudioPlayer, flags: number): void;

	audioPlayerEndInterruptionWithOptions?(player: AVAudioPlayer, flags: number): void;
}
declare var AVAudioPlayerDelegate: {

	prototype: AVAudioPlayerDelegate;
};

declare class AVAudioPlayerNode extends AVAudioNode implements AVAudioMixing {

	static alloc(): AVAudioPlayerNode; // inherited from NSObject

	static new(): AVAudioPlayerNode; // inherited from NSObject

	/* readonly */ playing: boolean;

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	/* readonly */  // inherited from NSObjectProtocol

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	nodeTimeForPlayerTime(playerTime: AVAudioTime): AVAudioTime;

	pause(): void;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	play(): void;

	playAtTime(when: AVAudioTime): void;

	playerTimeForNodeTime(nodeTime: AVAudioTime): AVAudioTime;

	prepareWithFrameCount(frameCount: number): void;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	scheduleBufferAtTimeOptionsCompletionHandler(buffer: AVAudioPCMBuffer, when: AVAudioTime, options: AVAudioPlayerNodeBufferOptions, completionHandler: () => void): void;

	scheduleBufferCompletionHandler(buffer: AVAudioPCMBuffer, completionHandler: () => void): void;

	scheduleFileAtTimeCompletionHandler(file: AVAudioFile, when: AVAudioTime, completionHandler: () => void): void;

	scheduleSegmentStartingFrameFrameCountAtTimeCompletionHandler(file: AVAudioFile, startFrame: number, numberFrames: number, when: AVAudioTime, completionHandler: () => void): void;

	self(): this;

	stop(): void;
}

declare const enum AVAudioPlayerNodeBufferOptions {

	Loops = 1,

	Interrupts = 2,

	InterruptsAtLoop = 4
}

declare const enum AVAudioQuality {

	Min = 0,

	Low = 32,

	Medium = 64,

	High = 96,

	Max = 127
}

declare class AVAudioRecorder extends NSObject {

	static alloc(): AVAudioRecorder; // inherited from NSObject

	static new(): AVAudioRecorder; // inherited from NSObject

	channelAssignments: NSArray<number>;

	/* readonly */ currentTime: number;

	delegate: AVAudioRecorderDelegate;

	/* readonly */ deviceCurrentTime: number;

	/* readonly */ format: AVAudioFormat;

	meteringEnabled: boolean;

	/* readonly */ recording: boolean;

	/* readonly */ settings: NSDictionary<string, any>;

	/* readonly */ url: NSURL;

	constructor(o: { URL: NSURL; format: AVAudioFormat; });

	constructor(o: { URL: NSURL; settings: NSDictionary<string, any>; });

	averagePowerForChannel(channelNumber: number): number;

	deleteRecording(): boolean;

	initWithURLFormatError(url: NSURL, format: AVAudioFormat): this;

	initWithURLSettingsError(url: NSURL, settings: NSDictionary<string, any>): this;

	pause(): void;

	peakPowerForChannel(channelNumber: number): number;

	prepareToRecord(): boolean;

	record(): boolean;

	recordAtTime(time: number): boolean;

	recordAtTimeForDuration(time: number, duration: number): boolean;

	recordForDuration(duration: number): boolean;

	stop(): void;

	updateMeters(): void;
}

interface AVAudioRecorderDelegate extends NSObjectProtocol {

	audioRecorderBeginInterruption?(recorder: AVAudioRecorder): void;

	audioRecorderDidFinishRecordingSuccessfully?(recorder: AVAudioRecorder, flag: boolean): void;

	audioRecorderEncodeErrorDidOccurError?(recorder: AVAudioRecorder, error: NSError): void;

	audioRecorderEndInterruption?(recorder: AVAudioRecorder): void;

	audioRecorderEndInterruptionWithFlags?(recorder: AVAudioRecorder, flags: number): void;

	audioRecorderEndInterruptionWithOptions?(recorder: AVAudioRecorder, flags: number): void;
}
declare var AVAudioRecorderDelegate: {

	prototype: AVAudioRecorderDelegate;
};

declare class AVAudioSequencer extends NSObject {

	static alloc(): AVAudioSequencer; // inherited from NSObject

	static new(): AVAudioSequencer; // inherited from NSObject

	currentPositionInBeats: number;

	currentPositionInSeconds: number;

	/* readonly */ playing: boolean;

	rate: number;

	/* readonly */ tempoTrack: AVMusicTrack;

	/* readonly */ tracks: NSArray<AVMusicTrack>;

	/* readonly */ userInfo: NSDictionary<string, any>;

	constructor(o: { audioEngine: AVAudioEngine; });

	beatsForHostTimeError(inHostTime: number): number;

	beatsForSeconds(seconds: number): number;

	dataWithSMPTEResolutionError(SMPTEResolution: number): NSData;

	hostTimeForBeatsError(inBeats: number): number;

	initWithAudioEngine(engine: AVAudioEngine): this;

	loadFromDataOptionsError(data: NSData, options: AVMusicSequenceLoadOptions): boolean;

	loadFromURLOptionsError(fileURL: NSURL, options: AVMusicSequenceLoadOptions): boolean;

	prepareToPlay(): void;

	secondsForBeats(beats: number): number;

	startAndReturnError(): boolean;

	stop(): void;

	writeToURLSMPTEResolutionReplaceExistingError(fileURL: NSURL, resolution: number, replace: boolean): boolean;
}

declare class AVAudioSession extends NSObject {

	static alloc(): AVAudioSession; // inherited from NSObject

	static new(): AVAudioSession; // inherited from NSObject

	static sharedInstance(): AVAudioSession;

	/* readonly */ IOBufferDuration: number;

	/* readonly */ availableCategories: NSArray<string>;

	/* readonly */ availableInputs: NSArray<AVAudioSessionPortDescription>;

	/* readonly */ availableModes: NSArray<string>;

	/* readonly */ category: string;

	/* readonly */ categoryOptions: AVAudioSessionCategoryOptions;

	/* readonly */ currentHardwareInputNumberOfChannels: number;

	/* readonly */ currentHardwareOutputNumberOfChannels: number;

	/* readonly */ currentHardwareSampleRate: number;

	/* readonly */ currentRoute: AVAudioSessionRouteDescription;

	delegate: AVAudioSessionDelegate;

	/* readonly */ inputAvailable: boolean;

	/* readonly */ inputDataSource: AVAudioSessionDataSourceDescription;

	/* readonly */ inputDataSources: NSArray<AVAudioSessionDataSourceDescription>;

	/* readonly */ inputGain: number;

	/* readonly */ inputGainSettable: boolean;

	/* readonly */ inputIsAvailable: boolean;

	/* readonly */ inputLatency: number;

	/* readonly */ inputNumberOfChannels: number;

	/* readonly */ maximumInputNumberOfChannels: number;

	/* readonly */ maximumOutputNumberOfChannels: number;

	/* readonly */ mode: string;

	/* readonly */ otherAudioPlaying: boolean;

	/* readonly */ outputDataSource: AVAudioSessionDataSourceDescription;

	/* readonly */ outputDataSources: NSArray<AVAudioSessionDataSourceDescription>;

	/* readonly */ outputLatency: number;

	/* readonly */ outputNumberOfChannels: number;

	/* readonly */ outputVolume: number;

	/* readonly */ preferredHardwareSampleRate: number;

	/* readonly */ preferredIOBufferDuration: number;

	/* readonly */ preferredInput: AVAudioSessionPortDescription;

	/* readonly */ preferredInputNumberOfChannels: number;

	/* readonly */ preferredOutputNumberOfChannels: number;

	/* readonly */ preferredSampleRate: number;

	/* readonly */ sampleRate: number;

	/* readonly */ secondaryAudioShouldBeSilencedHint: boolean;

	overrideOutputAudioPortError(portOverride: AVAudioSessionPortOverride): boolean;

	recordPermission(): AVAudioSessionRecordPermission;

	requestRecordPermission(response: (p1: boolean) => void): void;

	setActiveError(active: boolean): boolean;

	setActiveWithFlagsError(active: boolean, flags: number): boolean;

	setActiveWithOptionsError(active: boolean, options: AVAudioSessionSetActiveOptions): boolean;

	setAggregatedIOPreferenceError(inIOType: AVAudioSessionIOType): boolean;

	setCategoryError(category: string): boolean;

	setCategoryModeOptionsError(category: string, mode: string, options: AVAudioSessionCategoryOptions): boolean;

	setCategoryWithOptionsError(category: string, options: AVAudioSessionCategoryOptions): boolean;

	setInputDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;

	setInputGainError(gain: number): boolean;

	setModeError(mode: string): boolean;

	setOutputDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;

	setPreferredHardwareSampleRateError(sampleRate: number): boolean;

	setPreferredIOBufferDurationError(duration: number): boolean;

	setPreferredInputError(inPort: AVAudioSessionPortDescription): boolean;

	setPreferredInputNumberOfChannelsError(count: number): boolean;

	setPreferredOutputNumberOfChannelsError(count: number): boolean;

	setPreferredSampleRateError(sampleRate: number): boolean;
}

declare var AVAudioSessionCategoryAmbient: string;

declare var AVAudioSessionCategoryAudioProcessing: string;

declare var AVAudioSessionCategoryMultiRoute: string;

declare const enum AVAudioSessionCategoryOptions {

	MixWithOthers = 1,

	DuckOthers = 2,

	AllowBluetooth = 4,

	DefaultToSpeaker = 8,

	InterruptSpokenAudioAndMixWithOthers = 17,

	AllowBluetoothA2DP = 32,

	AllowAirPlay = 64
}

declare var AVAudioSessionCategoryPlayAndRecord: string;

declare var AVAudioSessionCategoryPlayback: string;

declare var AVAudioSessionCategoryRecord: string;

declare var AVAudioSessionCategorySoloAmbient: string;

declare class AVAudioSessionChannelDescription extends NSObject {

	static alloc(): AVAudioSessionChannelDescription; // inherited from NSObject

	static new(): AVAudioSessionChannelDescription; // inherited from NSObject

	/* readonly */ channelLabel: number;

	/* readonly */ channelName: string;

	/* readonly */ channelNumber: number;

	/* readonly */ owningPortUID: string;
}

declare class AVAudioSessionDataSourceDescription extends NSObject {

	static alloc(): AVAudioSessionDataSourceDescription; // inherited from NSObject

	static new(): AVAudioSessionDataSourceDescription; // inherited from NSObject

	/* readonly */ dataSourceID: number;

	/* readonly */ dataSourceName: string;

	/* readonly */ location: string;

	/* readonly */ orientation: string;

	/* readonly */ preferredPolarPattern: string;

	/* readonly */ selectedPolarPattern: string;

	/* readonly */ supportedPolarPatterns: NSArray<string>;

	setPreferredPolarPatternError(pattern: string): boolean;
}

interface AVAudioSessionDelegate extends NSObjectProtocol {

	beginInterruption?(): void;

	endInterruption?(): void;

	endInterruptionWithFlags?(flags: number): void;

	inputIsAvailableChanged?(isInputAvailable: boolean): void;
}
declare var AVAudioSessionDelegate: {

	prototype: AVAudioSessionDelegate;
};

declare const enum AVAudioSessionErrorCode {

	CodeNone = 0,

	CodeMediaServicesFailed = 1836282486,

	CodeIsBusy = 560030580,

	CodeIncompatibleCategory = 560161140,

	CodeCannotInterruptOthers = 560557684,

	CodeMissingEntitlement = 1701737535,

	CodeSiriIsRecording = 1936290409,

	CodeCannotStartPlaying = 561015905,

	CodeCannotStartRecording = 561145187,

	CodeBadParam = -50,

	InsufficientPriority = 561017449,

	CodeResourceNotAvailable = 561145203,

	CodeUnspecified = 2003329396
}

declare const enum AVAudioSessionIOType {

	NotSpecified = 0,

	Aggregated = 1
}

declare var AVAudioSessionInterruptionNotification: string;

declare var AVAudioSessionInterruptionOptionKey: string;

declare const enum AVAudioSessionInterruptionOptions {

	ShouldResume = 1
}

declare const enum AVAudioSessionInterruptionType {

	Began = 1,

	Ended = 0
}

declare var AVAudioSessionInterruptionTypeKey: string;

declare var AVAudioSessionLocationLower: string;

declare var AVAudioSessionLocationUpper: string;

declare var AVAudioSessionMediaServicesWereLostNotification: string;

declare var AVAudioSessionMediaServicesWereResetNotification: string;

declare var AVAudioSessionModeDefault: string;

declare var AVAudioSessionModeGameChat: string;

declare var AVAudioSessionModeMeasurement: string;

declare var AVAudioSessionModeMoviePlayback: string;

declare var AVAudioSessionModeSpokenAudio: string;

declare var AVAudioSessionModeVideoChat: string;

declare var AVAudioSessionModeVideoRecording: string;

declare var AVAudioSessionModeVoiceChat: string;

declare var AVAudioSessionOrientationBack: string;

declare var AVAudioSessionOrientationBottom: string;

declare var AVAudioSessionOrientationFront: string;

declare var AVAudioSessionOrientationLeft: string;

declare var AVAudioSessionOrientationRight: string;

declare var AVAudioSessionOrientationTop: string;

declare var AVAudioSessionPolarPatternCardioid: string;

declare var AVAudioSessionPolarPatternOmnidirectional: string;

declare var AVAudioSessionPolarPatternSubcardioid: string;

declare var AVAudioSessionPortAirPlay: string;

declare var AVAudioSessionPortBluetoothA2DP: string;

declare var AVAudioSessionPortBluetoothHFP: string;

declare var AVAudioSessionPortBluetoothLE: string;

declare var AVAudioSessionPortBuiltInMic: string;

declare var AVAudioSessionPortBuiltInReceiver: string;

declare var AVAudioSessionPortBuiltInSpeaker: string;

declare var AVAudioSessionPortCarAudio: string;

declare class AVAudioSessionPortDescription extends NSObject {

	static alloc(): AVAudioSessionPortDescription; // inherited from NSObject

	static new(): AVAudioSessionPortDescription; // inherited from NSObject

	/* readonly */ UID: string;

	/* readonly */ channels: NSArray<AVAudioSessionChannelDescription>;

	/* readonly */ dataSources: NSArray<AVAudioSessionDataSourceDescription>;

	/* readonly */ hasHardwareVoiceCallProcessing: boolean;

	/* readonly */ portName: string;

	/* readonly */ portType: string;

	/* readonly */ preferredDataSource: AVAudioSessionDataSourceDescription;

	/* readonly */ selectedDataSource: AVAudioSessionDataSourceDescription;

	setPreferredDataSourceError(dataSource: AVAudioSessionDataSourceDescription): boolean;
}

declare var AVAudioSessionPortHDMI: string;

declare var AVAudioSessionPortHeadphones: string;

declare var AVAudioSessionPortHeadsetMic: string;

declare var AVAudioSessionPortLineIn: string;

declare var AVAudioSessionPortLineOut: string;

declare const enum AVAudioSessionPortOverride {

	None = 0,

	Speaker = 1936747378
}

declare var AVAudioSessionPortUSBAudio: string;

declare const enum AVAudioSessionRecordPermission {

	Undetermined = 1970168948,

	Denied = 1684369017,

	Granted = 1735552628
}

declare var AVAudioSessionRouteChangeNotification: string;

declare var AVAudioSessionRouteChangePreviousRouteKey: string;

declare const enum AVAudioSessionRouteChangeReason {

	Unknown = 0,

	NewDeviceAvailable = 1,

	OldDeviceUnavailable = 2,

	CategoryChange = 3,

	Override = 4,

	WakeFromSleep = 6,

	NoSuitableRouteForCategory = 7,

	RouteConfigurationChange = 8
}

declare var AVAudioSessionRouteChangeReasonKey: string;

declare class AVAudioSessionRouteDescription extends NSObject {

	static alloc(): AVAudioSessionRouteDescription; // inherited from NSObject

	static new(): AVAudioSessionRouteDescription; // inherited from NSObject

	/* readonly */ inputs: NSArray<AVAudioSessionPortDescription>;

	/* readonly */ outputs: NSArray<AVAudioSessionPortDescription>;
}

declare const enum AVAudioSessionSetActiveOptions {

	NotifyOthersOnDeactivation = 1
}

declare var AVAudioSessionSilenceSecondaryAudioHintNotification: string;

declare const enum AVAudioSessionSilenceSecondaryAudioHintType {

	Begin = 1,

	End = 0
}

declare var AVAudioSessionSilenceSecondaryAudioHintTypeKey: string;

interface AVAudioStereoMixing extends NSObjectProtocol {

	pan: number;
}
declare var AVAudioStereoMixing: {

	prototype: AVAudioStereoMixing;
};

declare class AVAudioTime extends NSObject {

	static alloc(): AVAudioTime; // inherited from NSObject

	static hostTimeForSeconds(seconds: number): number;

	static new(): AVAudioTime; // inherited from NSObject

	static secondsForHostTime(hostTime: number): number;

	static timeWithAudioTimeStampSampleRate(ts: interop.Pointer | interop.Reference<AudioTimeStamp>, sampleRate: number): AVAudioTime;

	static timeWithHostTime(hostTime: number): AVAudioTime;

	static timeWithHostTimeSampleTimeAtRate(hostTime: number, sampleTime: number, sampleRate: number): AVAudioTime;

	static timeWithSampleTimeAtRate(sampleTime: number, sampleRate: number): AVAudioTime;

	/* readonly */ audioTimeStamp: AudioTimeStamp;

	/* readonly */ hostTime: number;

	/* readonly */ hostTimeValid: boolean;

	/* readonly */ sampleRate: number;

	/* readonly */ sampleTime: number;

	/* readonly */ sampleTimeValid: boolean;

	constructor(o: { audioTimeStamp: interop.Pointer | interop.Reference<AudioTimeStamp>; sampleRate: number; });

	constructor(o: { hostTime: number; });

	constructor(o: { hostTime: number; sampleTime: number; atRate: number; });

	constructor(o: { sampleTime: number; atRate: number; });

	extrapolateTimeFromAnchor(anchorTime: AVAudioTime): AVAudioTime;

	initWithAudioTimeStampSampleRate(ts: interop.Pointer | interop.Reference<AudioTimeStamp>, sampleRate: number): this;

	initWithHostTime(hostTime: number): this;

	initWithHostTimeSampleTimeAtRate(hostTime: number, sampleTime: number, sampleRate: number): this;

	initWithSampleTimeAtRate(sampleTime: number, sampleRate: number): this;
}

declare var AVAudioTimePitchAlgorithmLowQualityZeroLatency: string;

declare var AVAudioTimePitchAlgorithmSpectral: string;

declare var AVAudioTimePitchAlgorithmTimeDomain: string;

declare var AVAudioTimePitchAlgorithmVarispeed: string;

declare class AVAudioUnit extends AVAudioNode {

	static alloc(): AVAudioUnit; // inherited from NSObject

	static instantiateWithComponentDescriptionOptionsCompletionHandler(audioComponentDescription: AudioComponentDescription, options: AudioComponentInstantiationOptions, completionHandler: (p1: AVAudioUnit, p2: NSError) => void): void;

	static new(): AVAudioUnit; // inherited from NSObject

	/* readonly */ AUAudioUnit: AUAudioUnit;

	/* readonly */ audioComponentDescription: AudioComponentDescription;

	/* readonly */ audioUnit: interop.Pointer | interop.Reference<any>;

	/* readonly */ manufacturerName: string;

	/* readonly */ name: string;

	/* readonly */ version: number;

	loadAudioUnitPresetAtURLError(url: NSURL): boolean;
}

declare class AVAudioUnitComponent extends NSObject {

	static alloc(): AVAudioUnitComponent; // inherited from NSObject

	static new(): AVAudioUnitComponent; // inherited from NSObject

	/* readonly */ allTagNames: NSArray<string>;

	/* readonly */ audioComponent: interop.Pointer | interop.Reference<any>;

	/* readonly */ audioComponentDescription: AudioComponentDescription;

	/* readonly */ hasMIDIInput: boolean;

	/* readonly */ hasMIDIOutput: boolean;

	/* readonly */ localizedTypeName: string;

	/* readonly */ manufacturerName: string;

	/* readonly */ name: string;

	/* readonly */ sandboxSafe: boolean;

	/* readonly */ typeName: string;

	/* readonly */ version: number;

	/* readonly */ versionString: string;
}

declare class AVAudioUnitComponentManager extends NSObject {

	static alloc(): AVAudioUnitComponentManager; // inherited from NSObject

	static new(): AVAudioUnitComponentManager; // inherited from NSObject

	static sharedAudioUnitComponentManager(): AVAudioUnitComponentManager;

	/* readonly */ standardLocalizedTagNames: NSArray<string>;

	/* readonly */ tagNames: NSArray<string>;

	componentsMatchingDescription(desc: AudioComponentDescription): NSArray<AVAudioUnitComponent>;

	componentsMatchingPredicate(predicate: NSPredicate): NSArray<AVAudioUnitComponent>;

	componentsPassingTest(testHandler: (p1: AVAudioUnitComponent, p2: interop.Pointer | interop.Reference<boolean>) => boolean): NSArray<AVAudioUnitComponent>;
}

declare var AVAudioUnitComponentTagsDidChangeNotification: string;

declare class AVAudioUnitDelay extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitDelay; // inherited from NSObject

	static new(): AVAudioUnitDelay; // inherited from NSObject

	delayTime: number;

	feedback: number;

	lowPassCutoff: number;

	wetDryMix: number;
}

declare class AVAudioUnitDistortion extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitDistortion; // inherited from NSObject

	static new(): AVAudioUnitDistortion; // inherited from NSObject

	preGain: number;

	wetDryMix: number;

	loadFactoryPreset(preset: AVAudioUnitDistortionPreset): void;
}

declare const enum AVAudioUnitDistortionPreset {

	DrumsBitBrush = 0,

	DrumsBufferBeats = 1,

	DrumsLoFi = 2,

	MultiBrokenSpeaker = 3,

	MultiCellphoneConcert = 4,

	MultiDecimated1 = 5,

	MultiDecimated2 = 6,

	MultiDecimated3 = 7,

	MultiDecimated4 = 8,

	MultiDistortedFunk = 9,

	MultiDistortedCubed = 10,

	MultiDistortedSquared = 11,

	MultiEcho1 = 12,

	MultiEcho2 = 13,

	MultiEchoTight1 = 14,

	MultiEchoTight2 = 15,

	MultiEverythingIsBroken = 16,

	SpeechAlienChatter = 17,

	SpeechCosmicInterference = 18,

	SpeechGoldenPi = 19,

	SpeechRadioTower = 20,

	SpeechWaves = 21
}

declare class AVAudioUnitEQ extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitEQ; // inherited from NSObject

	static new(): AVAudioUnitEQ; // inherited from NSObject

	/* readonly */ bands: NSArray<AVAudioUnitEQFilterParameters>;

	globalGain: number;

	constructor(o: { numberOfBands: number; });

	initWithNumberOfBands(numberOfBands: number): this;
}

declare class AVAudioUnitEQFilterParameters extends NSObject {

	static alloc(): AVAudioUnitEQFilterParameters; // inherited from NSObject

	static new(): AVAudioUnitEQFilterParameters; // inherited from NSObject

	bandwidth: number;

	bypass: boolean;

	filterType: AVAudioUnitEQFilterType;

	frequency: number;

	gain: number;
}

declare const enum AVAudioUnitEQFilterType {

	Parametric = 0,

	LowPass = 1,

	HighPass = 2,

	ResonantLowPass = 3,

	ResonantHighPass = 4,

	BandPass = 5,

	BandStop = 6,

	LowShelf = 7,

	HighShelf = 8,

	ResonantLowShelf = 9,

	ResonantHighShelf = 10
}

declare class AVAudioUnitEffect extends AVAudioUnit {

	static alloc(): AVAudioUnitEffect; // inherited from NSObject

	static new(): AVAudioUnitEffect; // inherited from NSObject

	bypass: boolean;

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;
}

declare class AVAudioUnitGenerator extends AVAudioUnit implements AVAudioMixing {

	static alloc(): AVAudioUnitGenerator; // inherited from NSObject

	static new(): AVAudioUnitGenerator; // inherited from NSObject

	bypass: boolean;

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	obstruction: number; // inherited from AVAudio3DMixing

	occlusion: number; // inherited from AVAudio3DMixing

	pan: number; // inherited from AVAudioStereoMixing

	position: AVAudio3DPoint; // inherited from AVAudio3DMixing

	rate: number; // inherited from AVAudio3DMixing

	renderingAlgorithm: AVAudio3DMixingRenderingAlgorithm; // inherited from AVAudio3DMixing

	reverbBlend: number; // inherited from AVAudio3DMixing

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	volume: number; // inherited from AVAudioMixing

	/* readonly */  // inherited from NSObjectProtocol

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	destinationForMixerBus(mixer: AVAudioNode, bus: number): AVAudioMixingDestination;

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;

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

declare class AVAudioUnitMIDIInstrument extends AVAudioUnit {

	static alloc(): AVAudioUnitMIDIInstrument; // inherited from NSObject

	static new(): AVAudioUnitMIDIInstrument; // inherited from NSObject

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	initWithAudioComponentDescription(description: AudioComponentDescription): this;

	sendControllerWithValueOnChannel(controller: number, value: number, channel: number): void;

	sendMIDIEventData1(midiStatus: number, data1: number): void;

	sendMIDIEventData1Data2(midiStatus: number, data1: number, data2: number): void;

	sendMIDISysExEvent(midiData: NSData): void;

	sendPitchBendOnChannel(pitchbend: number, channel: number): void;

	sendPressureForKeyWithValueOnChannel(key: number, value: number, channel: number): void;

	sendPressureOnChannel(pressure: number, channel: number): void;

	sendProgramChangeBankMSBBankLSBOnChannel(program: number, bankMSB: number, bankLSB: number, channel: number): void;

	sendProgramChangeOnChannel(program: number, channel: number): void;

	startNoteWithVelocityOnChannel(note: number, velocity: number, channel: number): void;

	stopNoteOnChannel(note: number, channel: number): void;
}

declare var AVAudioUnitManufacturerNameApple: string;

declare class AVAudioUnitReverb extends AVAudioUnitEffect {

	static alloc(): AVAudioUnitReverb; // inherited from NSObject

	static new(): AVAudioUnitReverb; // inherited from NSObject

	wetDryMix: number;

	loadFactoryPreset(preset: AVAudioUnitReverbPreset): void;
}

declare const enum AVAudioUnitReverbPreset {

	SmallRoom = 0,

	MediumRoom = 1,

	LargeRoom = 2,

	MediumHall = 3,

	LargeHall = 4,

	Plate = 5,

	MediumChamber = 6,

	LargeChamber = 7,

	Cathedral = 8,

	LargeRoom2 = 9,

	MediumHall2 = 10,

	MediumHall3 = 11,

	LargeHall2 = 12
}

declare class AVAudioUnitSampler extends AVAudioUnitMIDIInstrument {

	static alloc(): AVAudioUnitSampler; // inherited from NSObject

	static new(): AVAudioUnitSampler; // inherited from NSObject

	globalTuning: number;

	masterGain: number;

	stereoPan: number;

	loadAudioFilesAtURLsError(audioFiles: NSArray<NSURL>): boolean;

	loadInstrumentAtURLError(instrumentURL: NSURL): boolean;

	loadSoundBankInstrumentAtURLProgramBankMSBBankLSBError(bankURL: NSURL, program: number, bankMSB: number, bankLSB: number): boolean;
}

declare class AVAudioUnitTimeEffect extends AVAudioUnit {

	static alloc(): AVAudioUnitTimeEffect; // inherited from NSObject

	static new(): AVAudioUnitTimeEffect; // inherited from NSObject

	bypass: boolean;

	constructor(o: { audioComponentDescription: AudioComponentDescription; });

	initWithAudioComponentDescription(audioComponentDescription: AudioComponentDescription): this;
}

declare class AVAudioUnitTimePitch extends AVAudioUnitTimeEffect {

	static alloc(): AVAudioUnitTimePitch; // inherited from NSObject

	static new(): AVAudioUnitTimePitch; // inherited from NSObject

	overlap: number;

	pitch: number;

	rate: number;
}

declare var AVAudioUnitTypeEffect: string;

declare var AVAudioUnitTypeFormatConverter: string;

declare var AVAudioUnitTypeGenerator: string;

declare var AVAudioUnitTypeMIDIProcessor: string;

declare var AVAudioUnitTypeMixer: string;

declare var AVAudioUnitTypeMusicDevice: string;

declare var AVAudioUnitTypeMusicEffect: string;

declare var AVAudioUnitTypeOfflineEffect: string;

declare var AVAudioUnitTypeOutput: string;

declare var AVAudioUnitTypePanner: string;

declare class AVAudioUnitVarispeed extends AVAudioUnitTimeEffect {

	static alloc(): AVAudioUnitVarispeed; // inherited from NSObject

	static new(): AVAudioUnitVarispeed; // inherited from NSObject

	rate: number;
}

declare const enum AVAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

interface AVBeatRange {
	start: number;
	length: number;
}
declare var AVBeatRange: interop.StructType<AVBeatRange>;

declare class AVCaptureAudioChannel extends NSObject {

	static alloc(): AVCaptureAudioChannel; // inherited from NSObject

	static new(): AVCaptureAudioChannel; // inherited from NSObject

	/* readonly */ averagePowerLevel: number;

	/* readonly */ peakHoldLevel: number;
}

declare class AVCaptureAudioDataOutput extends AVCaptureOutput {

	static alloc(): AVCaptureAudioDataOutput; // inherited from NSObject

	static new(): AVCaptureAudioDataOutput; // inherited from NSObject

	/* readonly */ sampleBufferCallbackQueue: NSObject;

	/* readonly */ sampleBufferDelegate: AVCaptureAudioDataOutputSampleBufferDelegate;

	recommendedAudioSettingsForAssetWriterWithOutputFileType(outputFileType: string): NSDictionary<any, any>;

	setSampleBufferDelegateQueue(sampleBufferDelegate: AVCaptureAudioDataOutputSampleBufferDelegate, sampleBufferCallbackQueue: NSObject): void;
}

interface AVCaptureAudioDataOutputSampleBufferDelegate extends NSObjectProtocol {

	captureOutputDidOutputSampleBufferFromConnection?(captureOutput: AVCaptureOutput, sampleBuffer: any, connection: AVCaptureConnection): void;
}
declare var AVCaptureAudioDataOutputSampleBufferDelegate: {

	prototype: AVCaptureAudioDataOutputSampleBufferDelegate;
};

declare class AVCaptureAutoExposureBracketedStillImageSettings extends AVCaptureBracketedStillImageSettings {

	static alloc(): AVCaptureAutoExposureBracketedStillImageSettings; // inherited from NSObject

	static autoExposureSettingsWithExposureTargetBias(exposureTargetBias: number): AVCaptureAutoExposureBracketedStillImageSettings;

	static new(): AVCaptureAutoExposureBracketedStillImageSettings; // inherited from NSObject

	/* readonly */ exposureTargetBias: number;
}

declare const enum AVCaptureAutoFocusRangeRestriction {

	None = 0,

	Near = 1,

	Far = 2
}

declare const enum AVCaptureAutoFocusSystem {

	None = 0,

	ContrastDetection = 1,

	PhaseDetection = 2
}

declare class AVCaptureBracketedStillImageSettings extends NSObject {

	static alloc(): AVCaptureBracketedStillImageSettings; // inherited from NSObject

	static new(): AVCaptureBracketedStillImageSettings; // inherited from NSObject
}

declare const enum AVCaptureColorSpace {

	sRGB = 0,

	P3_D65 = 1
}

declare class AVCaptureConnection extends NSObject {

	static alloc(): AVCaptureConnection; // inherited from NSObject

	static connectionWithInputPortVideoPreviewLayer(port: AVCaptureInputPort, layer: AVCaptureVideoPreviewLayer): AVCaptureConnection;

	static connectionWithInputPortsOutput(ports: NSArray<any>, output: AVCaptureOutput): AVCaptureConnection;

	static new(): AVCaptureConnection; // inherited from NSObject

	/* readonly */ active: boolean;

	/* readonly */ activeVideoStabilizationMode: AVCaptureVideoStabilizationMode;

	/* readonly */ audioChannels: NSArray<any>;

	automaticallyAdjustsVideoMirroring: boolean;

	enabled: boolean;

	enablesVideoStabilizationWhenAvailable: boolean;

	/* readonly */ inputPorts: NSArray<any>;

	/* readonly */ output: AVCaptureOutput;

	preferredVideoStabilizationMode: AVCaptureVideoStabilizationMode;

	/* readonly */ supportsVideoMaxFrameDuration: boolean;

	/* readonly */ supportsVideoMinFrameDuration: boolean;

	/* readonly */ supportsVideoMirroring: boolean;

	/* readonly */ supportsVideoOrientation: boolean;

	/* readonly */ supportsVideoStabilization: boolean;

	videoMaxFrameDuration: CMTime;

	/* readonly */ videoMaxScaleAndCropFactor: number;

	videoMinFrameDuration: CMTime;

	videoMirrored: boolean;

	videoOrientation: AVCaptureVideoOrientation;

	/* readonly */ videoPreviewLayer: AVCaptureVideoPreviewLayer;

	videoScaleAndCropFactor: number;

	/* readonly */ videoStabilizationEnabled: boolean;

	constructor(o: { inputPort: AVCaptureInputPort; videoPreviewLayer: AVCaptureVideoPreviewLayer; });

	constructor(o: { inputPorts: NSArray<any>; output: AVCaptureOutput; });

	initWithInputPortVideoPreviewLayer(port: AVCaptureInputPort, layer: AVCaptureVideoPreviewLayer): this;

	initWithInputPortsOutput(ports: NSArray<any>, output: AVCaptureOutput): this;
}

declare class AVCaptureDevice extends NSObject {

	static alloc(): AVCaptureDevice; // inherited from NSObject

	static authorizationStatusForMediaType(mediaType: string): AVAuthorizationStatus;

	static defaultDeviceWithMediaType(mediaType: string): AVCaptureDevice;

	static deviceWithUniqueID(deviceUniqueID: string): AVCaptureDevice;

	static devices(): NSArray<any>;

	static devicesWithMediaType(mediaType: string): NSArray<any>;

	static new(): AVCaptureDevice; // inherited from NSObject

	static requestAccessForMediaTypeCompletionHandler(mediaType: string, handler: (p1: boolean) => void): void;

	/* readonly */ ISO: number;

	activeColorSpace: AVCaptureColorSpace;

	activeFormat: AVCaptureDeviceFormat;

	activeVideoMaxFrameDuration: CMTime;

	activeVideoMinFrameDuration: CMTime;

	/* readonly */ adjustingExposure: boolean;

	/* readonly */ adjustingFocus: boolean;

	/* readonly */ adjustingWhiteBalance: boolean;

	autoFocusRangeRestriction: AVCaptureAutoFocusRangeRestriction;

	/* readonly */ autoFocusRangeRestrictionSupported: boolean;

	automaticallyAdjustsVideoHDREnabled: boolean;

	automaticallyEnablesLowLightBoostWhenAvailable: boolean;

	/* readonly */ connected: boolean;

	/* readonly */ deviceWhiteBalanceGains: AVCaptureWhiteBalanceGains;

	/* readonly */ exposureDuration: CMTime;

	exposureMode: AVCaptureExposureMode;

	exposurePointOfInterest: CGPoint;

	/* readonly */ exposurePointOfInterestSupported: boolean;

	/* readonly */ exposureTargetBias: number;

	/* readonly */ exposureTargetOffset: number;

	/* readonly */ flashActive: boolean;

	/* readonly */ flashAvailable: boolean;

	flashMode: AVCaptureFlashMode;

	focusMode: AVCaptureFocusMode;

	focusPointOfInterest: CGPoint;

	/* readonly */ focusPointOfInterestSupported: boolean;

	/* readonly */ formats: NSArray<any>;

	/* readonly */ grayWorldDeviceWhiteBalanceGains: AVCaptureWhiteBalanceGains;

	/* readonly */ hasFlash: boolean;

	/* readonly */ hasTorch: boolean;

	/* readonly */ lensAperture: number;

	/* readonly */ lensPosition: number;

	/* readonly */ localizedName: string;

	/* readonly */ lowLightBoostEnabled: boolean;

	/* readonly */ lowLightBoostSupported: boolean;

	/* readonly */ maxExposureTargetBias: number;

	/* readonly */ maxWhiteBalanceGain: number;

	/* readonly */ minExposureTargetBias: number;

	/* readonly */ modelID: string;

	/* readonly */ position: AVCaptureDevicePosition;

	/* readonly */ rampingVideoZoom: boolean;

	smoothAutoFocusEnabled: boolean;

	/* readonly */ smoothAutoFocusSupported: boolean;

	subjectAreaChangeMonitoringEnabled: boolean;

	/* readonly */ torchActive: boolean;

	/* readonly */ torchAvailable: boolean;

	/* readonly */ torchLevel: number;

	torchMode: AVCaptureTorchMode;

	/* readonly */ uniqueID: string;

	videoHDREnabled: boolean;

	videoZoomFactor: number;

	whiteBalanceMode: AVCaptureWhiteBalanceMode;

	cancelVideoZoomRamp(): void;

	chromaticityValuesForDeviceWhiteBalanceGains(whiteBalanceGains: AVCaptureWhiteBalanceGains): AVCaptureWhiteBalanceChromaticityValues;

	deviceWhiteBalanceGainsForChromaticityValues(chromaticityValues: AVCaptureWhiteBalanceChromaticityValues): AVCaptureWhiteBalanceGains;

	deviceWhiteBalanceGainsForTemperatureAndTintValues(tempAndTintValues: AVCaptureWhiteBalanceTemperatureAndTintValues): AVCaptureWhiteBalanceGains;

	hasMediaType(mediaType: string): boolean;

	isExposureModeSupported(exposureMode: AVCaptureExposureMode): boolean;

	isFlashModeSupported(flashMode: AVCaptureFlashMode): boolean;

	isFocusModeSupported(focusMode: AVCaptureFocusMode): boolean;

	isTorchModeSupported(torchMode: AVCaptureTorchMode): boolean;

	isWhiteBalanceModeSupported(whiteBalanceMode: AVCaptureWhiteBalanceMode): boolean;

	lockForConfiguration(): boolean;

	rampToVideoZoomFactorWithRate(factor: number, rate: number): void;

	setExposureModeCustomWithDurationISOCompletionHandler(duration: CMTime, ISO: number, handler: (p1: CMTime) => void): void;

	setExposureTargetBiasCompletionHandler(bias: number, handler: (p1: CMTime) => void): void;

	setFocusModeLockedWithLensPositionCompletionHandler(lensPosition: number, handler: (p1: CMTime) => void): void;

	setTorchModeOnWithLevelError(torchLevel: number): boolean;

	setWhiteBalanceModeLockedWithDeviceWhiteBalanceGainsCompletionHandler(whiteBalanceGains: AVCaptureWhiteBalanceGains, handler: (p1: CMTime) => void): void;

	supportsAVCaptureSessionPreset(preset: string): boolean;

	temperatureAndTintValuesForDeviceWhiteBalanceGains(whiteBalanceGains: AVCaptureWhiteBalanceGains): AVCaptureWhiteBalanceTemperatureAndTintValues;

	unlockForConfiguration(): void;
}

declare class AVCaptureDeviceFormat extends NSObject {

	static alloc(): AVCaptureDeviceFormat; // inherited from NSObject

	static new(): AVCaptureDeviceFormat; // inherited from NSObject

	/* readonly */ autoFocusSystem: AVCaptureAutoFocusSystem;

	/* readonly */ formatDescription: any;

	/* readonly */ highResolutionStillImageDimensions: CMVideoDimensions;

	/* readonly */ maxExposureDuration: CMTime;

	/* readonly */ maxISO: number;

	/* readonly */ mediaType: string;

	/* readonly */ minExposureDuration: CMTime;

	/* readonly */ minISO: number;

	/* readonly */ supportedColorSpaces: NSArray<number>;

	/* readonly */ videoBinned: boolean;

	/* readonly */ videoFieldOfView: number;

	/* readonly */ videoHDRSupported: boolean;

	/* readonly */ videoMaxZoomFactor: number;

	/* readonly */ videoStabilizationSupported: boolean;

	/* readonly */ videoSupportedFrameRateRanges: NSArray<any>;

	/* readonly */ videoZoomFactorUpscaleThreshold: number;

	isVideoStabilizationModeSupported(videoStabilizationMode: AVCaptureVideoStabilizationMode): boolean;
}

declare class AVCaptureDeviceInput extends AVCaptureInput {

	static alloc(): AVCaptureDeviceInput; // inherited from NSObject

	static deviceInputWithDeviceError(device: AVCaptureDevice): AVCaptureDeviceInput;

	static new(): AVCaptureDeviceInput; // inherited from NSObject

	/* readonly */ device: AVCaptureDevice;

	constructor(o: { device: AVCaptureDevice; });

	initWithDeviceError(device: AVCaptureDevice): this;
}

declare const enum AVCaptureDevicePosition {

	Unspecified = 0,

	Back = 1,

	Front = 2
}

declare var AVCaptureDeviceSubjectAreaDidChangeNotification: string;

declare var AVCaptureDeviceWasConnectedNotification: string;

declare var AVCaptureDeviceWasDisconnectedNotification: string;

declare var AVCaptureExposureDurationCurrent: CMTime;

declare const enum AVCaptureExposureMode {

	Locked = 0,

	AutoExpose = 1,

	ContinuousAutoExposure = 2,

	Custom = 3
}

declare var AVCaptureExposureTargetBiasCurrent: number;

declare class AVCaptureFileOutput extends AVCaptureOutput {

	static alloc(): AVCaptureFileOutput; // inherited from NSObject

	static new(): AVCaptureFileOutput; // inherited from NSObject

	maxRecordedDuration: CMTime;

	maxRecordedFileSize: number;

	minFreeDiskSpaceLimit: number;

	/* readonly */ outputFileURL: NSURL;

	/* readonly */ recordedDuration: CMTime;

	/* readonly */ recordedFileSize: number;

	/* readonly */ recording: boolean;

	startRecordingToOutputFileURLRecordingDelegate(outputFileURL: NSURL, delegate: AVCaptureFileOutputRecordingDelegate): void;

	stopRecording(): void;
}

interface AVCaptureFileOutputRecordingDelegate extends NSObjectProtocol {

	captureOutputDidFinishRecordingToOutputFileAtURLFromConnectionsError(captureOutput: AVCaptureFileOutput, outputFileURL: NSURL, connections: NSArray<any>, error: NSError): void;

	captureOutputDidStartRecordingToOutputFileAtURLFromConnections?(captureOutput: AVCaptureFileOutput, fileURL: NSURL, connections: NSArray<any>): void;
}
declare var AVCaptureFileOutputRecordingDelegate: {

	prototype: AVCaptureFileOutputRecordingDelegate;
};

declare const enum AVCaptureFlashMode {

	Off = 0,

	On = 1,

	Auto = 2
}

declare const enum AVCaptureFocusMode {

	Locked = 0,

	AutoFocus = 1,

	ContinuousAutoFocus = 2
}

declare var AVCaptureISOCurrent: number;

declare class AVCaptureInput extends NSObject {

	static alloc(): AVCaptureInput; // inherited from NSObject

	static new(): AVCaptureInput; // inherited from NSObject

	/* readonly */ ports: NSArray<any>;
}

declare class AVCaptureInputPort extends NSObject {

	static alloc(): AVCaptureInputPort; // inherited from NSObject

	static new(): AVCaptureInputPort; // inherited from NSObject

	/* readonly */ clock: any;

	enabled: boolean;

	/* readonly */ formatDescription: any;

	/* readonly */ input: AVCaptureInput;

	/* readonly */ mediaType: string;
}

declare var AVCaptureInputPortFormatDescriptionDidChangeNotification: string;

declare var AVCaptureLensPositionCurrent: number;

declare class AVCaptureManualExposureBracketedStillImageSettings extends AVCaptureBracketedStillImageSettings {

	static alloc(): AVCaptureManualExposureBracketedStillImageSettings; // inherited from NSObject

	static manualExposureSettingsWithExposureDurationISO(duration: CMTime, ISO: number): AVCaptureManualExposureBracketedStillImageSettings;

	static new(): AVCaptureManualExposureBracketedStillImageSettings; // inherited from NSObject

	/* readonly */ ISO: number;

	/* readonly */ exposureDuration: CMTime;
}

declare var AVCaptureMaxAvailableTorchLevel: number;

declare class AVCaptureMetadataInput extends AVCaptureInput {

	static alloc(): AVCaptureMetadataInput; // inherited from NSObject

	static metadataInputWithFormatDescriptionClock(desc: any, clock: any): AVCaptureMetadataInput;

	static new(): AVCaptureMetadataInput; // inherited from NSObject

	constructor(o: { formatDescription: any; clock: any; });

	appendTimedMetadataGroupError(metadata: AVTimedMetadataGroup): boolean;

	initWithFormatDescriptionClock(desc: any, clock: any): this;
}

declare class AVCaptureMetadataOutput extends AVCaptureOutput {

	static alloc(): AVCaptureMetadataOutput; // inherited from NSObject

	static new(): AVCaptureMetadataOutput; // inherited from NSObject

	/* readonly */ availableMetadataObjectTypes: NSArray<any>;

	metadataObjectTypes: NSArray<any>;

	/* readonly */ metadataObjectsCallbackQueue: NSObject;

	/* readonly */ metadataObjectsDelegate: AVCaptureMetadataOutputObjectsDelegate;

	rectOfInterest: CGRect;

	setMetadataObjectsDelegateQueue(objectsDelegate: AVCaptureMetadataOutputObjectsDelegate, objectsCallbackQueue: NSObject): void;
}

interface AVCaptureMetadataOutputObjectsDelegate extends NSObjectProtocol {

	captureOutputDidOutputMetadataObjectsFromConnection?(captureOutput: AVCaptureOutput, metadataObjects: NSArray<any>, connection: AVCaptureConnection): void;
}
declare var AVCaptureMetadataOutputObjectsDelegate: {

	prototype: AVCaptureMetadataOutputObjectsDelegate;
};

declare class AVCaptureMovieFileOutput extends AVCaptureFileOutput {

	static alloc(): AVCaptureMovieFileOutput; // inherited from NSObject

	static new(): AVCaptureMovieFileOutput; // inherited from NSObject

	/* readonly */ availableVideoCodecTypes: NSArray<any>;

	metadata: NSArray<any>;

	movieFragmentInterval: CMTime;

	outputSettingsForConnection(connection: AVCaptureConnection): NSDictionary<any, any>;

	recordsVideoOrientationAndMirroringChangesAsMetadataTrackForConnection(connection: AVCaptureConnection): boolean;

	setOutputSettingsForConnection(outputSettings: NSDictionary<any, any>, connection: AVCaptureConnection): void;

	setRecordsVideoOrientationAndMirroringChangesAsMetadataTrackForConnection(doRecordChanges: boolean, connection: AVCaptureConnection): void;
}

declare class AVCaptureOutput extends NSObject {

	static alloc(): AVCaptureOutput; // inherited from NSObject

	static new(): AVCaptureOutput; // inherited from NSObject

	/* readonly */ connections: NSArray<any>;

	connectionWithMediaType(mediaType: string): AVCaptureConnection;

	metadataOutputRectOfInterestForRect(rectInOutputCoordinates: CGRect): CGRect;

	rectForMetadataOutputRectOfInterest(rectInMetadataOutputCoordinates: CGRect): CGRect;

	transformedMetadataObjectForMetadataObjectConnection(metadataObject: AVMetadataObject, connection: AVCaptureConnection): AVMetadataObject;
}

declare class AVCapturePhotoBracketSettings extends AVCapturePhotoSettings {

	static alloc(): AVCapturePhotoBracketSettings; // inherited from NSObject

	static new(): AVCapturePhotoBracketSettings; // inherited from NSObject

	static photoBracketSettingsWithRawPixelFormatTypeProcessedFormatBracketedSettings(rawPixelFormatType: number, processedFormat: NSDictionary<string, any>, bracketedSettings: NSArray<AVCaptureBracketedStillImageSettings>): AVCapturePhotoBracketSettings;

	static photoSettings(): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsFromPhotoSettings(photoSettings: AVCapturePhotoSettings): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsWithFormat(format: NSDictionary<string, any>): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsWithRawPixelFormatType(rawPixelFormatType: number): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	static photoSettingsWithRawPixelFormatTypeProcessedFormat(rawPixelFormatType: number, processedFormat: NSDictionary<string, any>): AVCapturePhotoBracketSettings; // inherited from AVCapturePhotoSettings

	/* readonly */ bracketedSettings: NSArray<AVCaptureBracketedStillImageSettings>;

	lensStabilizationEnabled: boolean;
}

interface AVCapturePhotoCaptureDelegate extends NSObjectProtocol {

	captureOutputDidCapturePhotoForResolvedSettings?(captureOutput: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings): void;

	captureOutputDidFinishCaptureForResolvedSettingsError?(captureOutput: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings, error: NSError): void;

	captureOutputDidFinishProcessingLivePhotoToMovieFileAtURLDurationPhotoDisplayTimeResolvedSettingsError?(captureOutput: AVCapturePhotoOutput, outputFileURL: NSURL, duration: CMTime, photoDisplayTime: CMTime, resolvedSettings: AVCaptureResolvedPhotoSettings, error: NSError): void;

	captureOutputDidFinishProcessingPhotoSampleBufferPreviewPhotoSampleBufferResolvedSettingsBracketSettingsError?(captureOutput: AVCapturePhotoOutput, photoSampleBuffer: any, previewPhotoSampleBuffer: any, resolvedSettings: AVCaptureResolvedPhotoSettings, bracketSettings: AVCaptureBracketedStillImageSettings, error: NSError): void;

	captureOutputDidFinishProcessingRawPhotoSampleBufferPreviewPhotoSampleBufferResolvedSettingsBracketSettingsError?(captureOutput: AVCapturePhotoOutput, rawSampleBuffer: any, previewPhotoSampleBuffer: any, resolvedSettings: AVCaptureResolvedPhotoSettings, bracketSettings: AVCaptureBracketedStillImageSettings, error: NSError): void;

	captureOutputDidFinishRecordingLivePhotoMovieForEventualFileAtURLResolvedSettings?(captureOutput: AVCapturePhotoOutput, outputFileURL: NSURL, resolvedSettings: AVCaptureResolvedPhotoSettings): void;

	captureOutputWillBeginCaptureForResolvedSettings?(captureOutput: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings): void;

	captureOutputWillCapturePhotoForResolvedSettings?(captureOutput: AVCapturePhotoOutput, resolvedSettings: AVCaptureResolvedPhotoSettings): void;
}
declare var AVCapturePhotoCaptureDelegate: {

	prototype: AVCapturePhotoCaptureDelegate;
};

declare class AVCapturePhotoOutput extends AVCaptureOutput {

	static DNGPhotoDataRepresentationForRawSampleBufferPreviewPhotoSampleBuffer(rawSampleBuffer: any, previewPhotoSampleBuffer: any): NSData;

	static JPEGPhotoDataRepresentationForJPEGSampleBufferPreviewPhotoSampleBuffer(JPEGSampleBuffer: any, previewPhotoSampleBuffer: any): NSData;

	static alloc(): AVCapturePhotoOutput; // inherited from NSObject

	static new(): AVCapturePhotoOutput; // inherited from NSObject

	/* readonly */ availablePhotoCodecTypes: NSArray<string>;

	/* readonly */ availablePhotoPixelFormatTypes: NSArray<number>;

	/* readonly */ availableRawPhotoPixelFormatTypes: NSArray<number>;

	highResolutionCaptureEnabled: boolean;

	/* readonly */ isFlashScene: boolean;

	/* readonly */ isStillImageStabilizationScene: boolean;

	/* readonly */ lensStabilizationDuringBracketedCaptureSupported: boolean;

	livePhotoAutoTrimmingEnabled: boolean;

	livePhotoCaptureEnabled: boolean;

	/* readonly */ livePhotoCaptureSupported: boolean;

	livePhotoCaptureSuspended: boolean;

	/* readonly */ maxBracketedCapturePhotoCount: number;

	photoSettingsForSceneMonitoring: AVCapturePhotoSettings;

	/* readonly */ preparedPhotoSettingsArray: NSArray<AVCapturePhotoSettings>;

	/* readonly */ stillImageStabilizationSupported: boolean;

	/* readonly */ supportedFlashModes: NSArray<number>;

	capturePhotoWithSettingsDelegate(settings: AVCapturePhotoSettings, delegate: AVCapturePhotoCaptureDelegate): void;

	setPreparedPhotoSettingsArrayCompletionHandler(preparedPhotoSettingsArray: NSArray<AVCapturePhotoSettings>, completionHandler: (p1: boolean, p2: NSError) => void): void;
}

declare class AVCapturePhotoSettings extends NSObject implements NSCopying {

	static alloc(): AVCapturePhotoSettings; // inherited from NSObject

	static new(): AVCapturePhotoSettings; // inherited from NSObject

	static photoSettings(): AVCapturePhotoSettings;

	static photoSettingsFromPhotoSettings(photoSettings: AVCapturePhotoSettings): AVCapturePhotoSettings;

	static photoSettingsWithFormat(format: NSDictionary<string, any>): AVCapturePhotoSettings;

	static photoSettingsWithRawPixelFormatType(rawPixelFormatType: number): AVCapturePhotoSettings;

	static photoSettingsWithRawPixelFormatTypeProcessedFormat(rawPixelFormatType: number, processedFormat: NSDictionary<string, any>): AVCapturePhotoSettings;

	autoStillImageStabilizationEnabled: boolean;

	/* readonly */ availablePreviewPhotoPixelFormatTypes: NSArray<number>;

	flashMode: AVCaptureFlashMode;

	/* readonly */ format: NSDictionary<string, any>;

	highResolutionPhotoEnabled: boolean;

	livePhotoMovieFileURL: NSURL;

	livePhotoMovieMetadata: NSArray<AVMetadataItem>;

	previewPhotoFormat: NSDictionary<string, any>;

	/* readonly */ rawPhotoPixelFormatType: number;

	/* readonly */ uniqueID: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class AVCaptureResolvedPhotoSettings extends NSObject {

	static alloc(): AVCaptureResolvedPhotoSettings; // inherited from NSObject

	static new(): AVCaptureResolvedPhotoSettings; // inherited from NSObject

	/* readonly */ flashEnabled: boolean;

	/* readonly */ livePhotoMovieDimensions: CMVideoDimensions;

	/* readonly */ photoDimensions: CMVideoDimensions;

	/* readonly */ previewDimensions: CMVideoDimensions;

	/* readonly */ rawPhotoDimensions: CMVideoDimensions;

	/* readonly */ stillImageStabilizationEnabled: boolean;

	/* readonly */ uniqueID: number;
}

declare class AVCaptureSession extends NSObject {

	static alloc(): AVCaptureSession; // inherited from NSObject

	static new(): AVCaptureSession; // inherited from NSObject

	automaticallyConfiguresApplicationAudioSession: boolean;

	automaticallyConfiguresCaptureDeviceForWideColor: boolean;

	/* readonly */ inputs: NSArray<any>;

	/* readonly */ interrupted: boolean;

	/* readonly */ masterClock: any;

	/* readonly */ outputs: NSArray<any>;

	/* readonly */ running: boolean;

	sessionPreset: string;

	usesApplicationAudioSession: boolean;

	addConnection(connection: AVCaptureConnection): void;

	addInput(input: AVCaptureInput): void;

	addInputWithNoConnections(input: AVCaptureInput): void;

	addOutput(output: AVCaptureOutput): void;

	addOutputWithNoConnections(output: AVCaptureOutput): void;

	beginConfiguration(): void;

	canAddConnection(connection: AVCaptureConnection): boolean;

	canAddInput(input: AVCaptureInput): boolean;

	canAddOutput(output: AVCaptureOutput): boolean;

	canSetSessionPreset(preset: string): boolean;

	commitConfiguration(): void;

	removeConnection(connection: AVCaptureConnection): void;

	removeInput(input: AVCaptureInput): void;

	removeOutput(output: AVCaptureOutput): void;

	startRunning(): void;

	stopRunning(): void;
}

declare var AVCaptureSessionDidStartRunningNotification: string;

declare var AVCaptureSessionDidStopRunningNotification: string;

declare var AVCaptureSessionErrorKey: string;

declare var AVCaptureSessionInterruptionEndedNotification: string;

declare const enum AVCaptureSessionInterruptionReason {

	VideoDeviceNotAvailableInBackground = 1,

	AudioDeviceInUseByAnotherClient = 2,

	VideoDeviceInUseByAnotherClient = 3,

	VideoDeviceNotAvailableWithMultipleForegroundApps = 4
}

declare var AVCaptureSessionInterruptionReasonKey: string;

declare var AVCaptureSessionPreset1280x720: string;

declare var AVCaptureSessionPreset1920x1080: string;

declare var AVCaptureSessionPreset352x288: string;

declare var AVCaptureSessionPreset3840x2160: string;

declare var AVCaptureSessionPreset640x480: string;

declare var AVCaptureSessionPresetHigh: string;

declare var AVCaptureSessionPresetInputPriority: string;

declare var AVCaptureSessionPresetLow: string;

declare var AVCaptureSessionPresetMedium: string;

declare var AVCaptureSessionPresetPhoto: string;

declare var AVCaptureSessionPresetiFrame1280x720: string;

declare var AVCaptureSessionPresetiFrame960x540: string;

declare var AVCaptureSessionRuntimeErrorNotification: string;

declare var AVCaptureSessionWasInterruptedNotification: string;

declare class AVCaptureStillImageOutput extends AVCaptureOutput {

	static alloc(): AVCaptureStillImageOutput; // inherited from NSObject

	static jpegStillImageNSDataRepresentation(jpegSampleBuffer: any): NSData;

	static new(): AVCaptureStillImageOutput; // inherited from NSObject

	automaticallyEnablesStillImageStabilizationWhenAvailable: boolean;

	/* readonly */ availableImageDataCVPixelFormatTypes: NSArray<any>;

	/* readonly */ availableImageDataCodecTypes: NSArray<any>;

	/* readonly */ capturingStillImage: boolean;

	highResolutionStillImageOutputEnabled: boolean;

	lensStabilizationDuringBracketedCaptureEnabled: boolean;

	/* readonly */ lensStabilizationDuringBracketedCaptureSupported: boolean;

	/* readonly */ maxBracketedCaptureStillImageCount: number;

	outputSettings: NSDictionary<any, any>;

	/* readonly */ stillImageStabilizationActive: boolean;

	/* readonly */ stillImageStabilizationSupported: boolean;

	captureStillImageAsynchronouslyFromConnectionCompletionHandler(connection: AVCaptureConnection, handler: (p1: any, p2: NSError) => void): void;

	captureStillImageBracketAsynchronouslyFromConnectionWithSettingsArrayCompletionHandler(connection: AVCaptureConnection, settings: NSArray<any>, handler: (p1: any, p2: AVCaptureBracketedStillImageSettings, p3: NSError) => void): void;

	prepareToCaptureStillImageBracketFromConnectionWithSettingsArrayCompletionHandler(connection: AVCaptureConnection, settings: NSArray<any>, handler: (p1: boolean, p2: NSError) => void): void;
}

declare const enum AVCaptureTorchMode {

	Off = 0,

	On = 1,

	Auto = 2
}

declare class AVCaptureVideoDataOutput extends AVCaptureOutput {

	static alloc(): AVCaptureVideoDataOutput; // inherited from NSObject

	static new(): AVCaptureVideoDataOutput; // inherited from NSObject

	alwaysDiscardsLateVideoFrames: boolean;

	/* readonly */ availableVideoCVPixelFormatTypes: NSArray<any>;

	/* readonly */ availableVideoCodecTypes: NSArray<any>;

	minFrameDuration: CMTime;

	/* readonly */ sampleBufferCallbackQueue: NSObject;

	/* readonly */ sampleBufferDelegate: AVCaptureVideoDataOutputSampleBufferDelegate;

	videoSettings: NSDictionary<any, any>;

	recommendedVideoSettingsForAssetWriterWithOutputFileType(outputFileType: string): NSDictionary<any, any>;

	setSampleBufferDelegateQueue(sampleBufferDelegate: AVCaptureVideoDataOutputSampleBufferDelegate, sampleBufferCallbackQueue: NSObject): void;
}

interface AVCaptureVideoDataOutputSampleBufferDelegate extends NSObjectProtocol {

	captureOutputDidDropSampleBufferFromConnection?(captureOutput: AVCaptureOutput, sampleBuffer: any, connection: AVCaptureConnection): void;

	captureOutputDidOutputSampleBufferFromConnection?(captureOutput: AVCaptureOutput, sampleBuffer: any, connection: AVCaptureConnection): void;
}
declare var AVCaptureVideoDataOutputSampleBufferDelegate: {

	prototype: AVCaptureVideoDataOutputSampleBufferDelegate;
};

declare const enum AVCaptureVideoOrientation {

	Portrait = 1,

	PortraitUpsideDown = 2,

	LandscapeRight = 3,

	LandscapeLeft = 4
}

declare class AVCaptureVideoPreviewLayer extends CALayer {

	static alloc(): AVCaptureVideoPreviewLayer; // inherited from NSObject

	static layer(): AVCaptureVideoPreviewLayer; // inherited from CALayer

	static layerWithSession(session: AVCaptureSession): AVCaptureVideoPreviewLayer;

	static layerWithSessionWithNoConnection(session: AVCaptureSession): AVCaptureVideoPreviewLayer;

	static new(): AVCaptureVideoPreviewLayer; // inherited from NSObject

	automaticallyAdjustsMirroring: boolean;

	/* readonly */ connection: AVCaptureConnection;

	mirrored: boolean;

	/* readonly */ mirroringSupported: boolean;

	orientation: AVCaptureVideoOrientation;

	/* readonly */ orientationSupported: boolean;

	session: AVCaptureSession;

	videoGravity: string;

	constructor(o: { session: AVCaptureSession; });

	constructor(o: { sessionWithNoConnection: AVCaptureSession; });

	captureDevicePointOfInterestForPoint(pointInLayer: CGPoint): CGPoint;

	initWithSession(session: AVCaptureSession): this;

	initWithSessionWithNoConnection(session: AVCaptureSession): this;

	metadataOutputRectOfInterestForRect(rectInLayerCoordinates: CGRect): CGRect;

	pointForCaptureDevicePointOfInterest(captureDevicePointOfInterest: CGPoint): CGPoint;

	rectForMetadataOutputRectOfInterest(rectInMetadataOutputCoordinates: CGRect): CGRect;

	setSessionWithNoConnection(session: AVCaptureSession): void;

	transformedMetadataObjectForMetadataObject(metadataObject: AVMetadataObject): AVMetadataObject;
}

declare const enum AVCaptureVideoStabilizationMode {

	Off = 0,

	Standard = 1,

	Cinematic = 2,

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

declare var AVCaptureWhiteBalanceGainsCurrent: AVCaptureWhiteBalanceGains;

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

declare var AVChannelLayoutKey: string;

declare class AVComposition extends AVAsset implements NSMutableCopying {

	static alloc(): AVComposition; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVComposition; // inherited from AVAsset

	static new(): AVComposition; // inherited from NSObject

	/* readonly */ URLAssetInitializationOptions: NSDictionary<string, any>;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	trackWithTrackID(trackID: number): AVCompositionTrack;
}

declare class AVCompositionTrack extends AVAssetTrack {

	static alloc(): AVCompositionTrack; // inherited from NSObject

	static new(): AVCompositionTrack; // inherited from NSObject
}

declare class AVCompositionTrackSegment extends AVAssetTrackSegment {

	static alloc(): AVCompositionTrackSegment; // inherited from NSObject

	static compositionTrackSegmentWithTimeRange(timeRange: CMTimeRange): AVCompositionTrackSegment;

	static compositionTrackSegmentWithURLTrackIDSourceTimeRangeTargetTimeRange(URL: NSURL, trackID: number, sourceTimeRange: CMTimeRange, targetTimeRange: CMTimeRange): AVCompositionTrackSegment;

	static new(): AVCompositionTrackSegment; // inherited from NSObject

	/* readonly */ sourceTrackID: number;

	/* readonly */ sourceURL: NSURL;

	constructor(o: { timeRange: CMTimeRange; });

	constructor(o: { URL: NSURL; trackID: number; sourceTimeRange: CMTimeRange; targetTimeRange: CMTimeRange; });

	initWithTimeRange(timeRange: CMTimeRange): this;

	initWithURLTrackIDSourceTimeRangeTargetTimeRange(URL: NSURL, trackID: number, sourceTimeRange: CMTimeRange, targetTimeRange: CMTimeRange): this;
}

declare var AVCoreAnimationBeginTimeAtZero: number;

declare class AVDateRangeMetadataGroup extends AVMetadataGroup implements NSCopying, NSMutableCopying {

	static alloc(): AVDateRangeMetadataGroup; // inherited from NSObject

	static new(): AVDateRangeMetadataGroup; // inherited from NSObject

	/* readonly */ endDate: Date;

	/* readonly */ startDate: Date;

	constructor(o: { items: NSArray<AVMetadataItem>; startDate: Date; endDate: Date; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithItemsStartDateEndDate(items: NSArray<AVMetadataItem>, startDate: Date, endDate: Date): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

interface AVEdgeWidths {
	left: number;
	top: number;
	right: number;
	bottom: number;
}
declare var AVEdgeWidths: interop.StructType<AVEdgeWidths>;

declare var AVEncoderAudioQualityForVBRKey: string;

declare var AVEncoderAudioQualityKey: string;

declare var AVEncoderBitDepthHintKey: string;

declare var AVEncoderBitRateKey: string;

declare var AVEncoderBitRatePerChannelKey: string;

declare var AVEncoderBitRateStrategyKey: string;

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

	UnsupportedOutputSettings = -11861,

	OperationNotAllowed = -11862
}

declare var AVErrorDeviceKey: string;

declare var AVErrorFileSizeKey: string;

declare var AVErrorFileTypeKey: string;

declare var AVErrorMediaSubTypeKey: string;

declare var AVErrorMediaTypeKey: string;

declare var AVErrorPIDKey: string;

declare var AVErrorPersistentTrackIDKey: string;

declare var AVErrorPresentationTimeStampKey: string;

declare var AVErrorRecordingSuccessfullyFinishedKey: string;

declare var AVErrorTimeKey: string;

declare var AVFileType3GPP: string;

declare var AVFileType3GPP2: string;

declare var AVFileTypeAC3: string;

declare var AVFileTypeAIFC: string;

declare var AVFileTypeAIFF: string;

declare var AVFileTypeAMR: string;

declare var AVFileTypeAppleM4A: string;

declare var AVFileTypeAppleM4V: string;

declare var AVFileTypeCoreAudioFormat: string;

declare var AVFileTypeEnhancedAC3: string;

declare var AVFileTypeMPEG4: string;

declare var AVFileTypeMPEGLayer3: string;

declare var AVFileTypeQuickTimeMovie: string;

declare var AVFileTypeSunAU: string;

declare var AVFileTypeWAVE: string;

declare var AVFormatIDKey: string;

declare var AVFoundationErrorDomain: string;

interface AVFragmentMinding {
}
declare var AVFragmentMinding: {

	prototype: AVFragmentMinding;
};

declare class AVFrameRateRange extends NSObject {

	static alloc(): AVFrameRateRange; // inherited from NSObject

	static new(): AVFrameRateRange; // inherited from NSObject

	/* readonly */ maxFrameDuration: CMTime;

	/* readonly */ maxFrameRate: number;

	/* readonly */ minFrameDuration: CMTime;

	/* readonly */ minFrameRate: number;
}

declare const enum AVKeyValueStatus {

	Unknown = 0,

	Loading = 1,

	Loaded = 2,

	Failed = 3,

	Cancelled = 4
}

declare var AVLayerVideoGravityResize: string;

declare var AVLayerVideoGravityResizeAspect: string;

declare var AVLayerVideoGravityResizeAspectFill: string;

declare var AVLinearPCMBitDepthKey: string;

declare var AVLinearPCMIsBigEndianKey: string;

declare var AVLinearPCMIsFloatKey: string;

declare var AVLinearPCMIsNonInterleaved: string;

declare class AVMIDIPlayer extends NSObject {

	static alloc(): AVMIDIPlayer; // inherited from NSObject

	static new(): AVMIDIPlayer; // inherited from NSObject

	currentPosition: number;

	/* readonly */ duration: number;

	/* readonly */ playing: boolean;

	rate: number;

	constructor(o: { contentsOfURL: NSURL; soundBankURL: NSURL; });

	constructor(o: { data: NSData; soundBankURL: NSURL; });

	initWithContentsOfURLSoundBankURLError(inURL: NSURL, bankURL: NSURL): this;

	initWithDataSoundBankURLError(data: NSData, bankURL: NSURL): this;

	play(completionHandler: () => void): void;

	prepareToPlay(): void;

	stop(): void;
}

declare function AVMakeRectWithAspectRatioInsideRect(aspectRatio: CGSize, boundingRect: CGRect): CGRect;

declare var AVMediaCharacteristicAudible: string;

declare var AVMediaCharacteristicContainsOnlyForcedSubtitles: string;

declare var AVMediaCharacteristicDescribesMusicAndSoundForAccessibility: string;

declare var AVMediaCharacteristicDescribesVideoForAccessibility: string;

declare var AVMediaCharacteristicDubbedTranslation: string;

declare var AVMediaCharacteristicEasyToRead: string;

declare var AVMediaCharacteristicFrameBased: string;

declare var AVMediaCharacteristicIsAuxiliaryContent: string;

declare var AVMediaCharacteristicIsMainProgramContent: string;

declare var AVMediaCharacteristicLanguageTranslation: string;

declare var AVMediaCharacteristicLegible: string;

declare var AVMediaCharacteristicTranscribesSpokenDialogForAccessibility: string;

declare var AVMediaCharacteristicUsesWideGamutColorSpace: string;

declare var AVMediaCharacteristicVisual: string;

declare var AVMediaCharacteristicVoiceOverTranslation: string;

declare class AVMediaSelection extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVMediaSelection; // inherited from NSObject

	static new(): AVMediaSelection; // inherited from NSObject

	/* readonly */ asset: AVAsset;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	mediaSelectionCriteriaCanBeAppliedAutomaticallyToMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	selectedMediaOptionInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): AVMediaSelectionOption;
}

declare class AVMediaSelectionGroup extends NSObject implements NSCopying {

	static alloc(): AVMediaSelectionGroup; // inherited from NSObject

	static mediaSelectionOptionsFromArrayFilteredAndSortedAccordingToPreferredLanguages(mediaSelectionOptions: NSArray<AVMediaSelectionOption>, preferredLanguages: NSArray<string>): NSArray<AVMediaSelectionOption>;

	static mediaSelectionOptionsFromArrayWithLocale(mediaSelectionOptions: NSArray<AVMediaSelectionOption>, locale: NSLocale): NSArray<AVMediaSelectionOption>;

	static mediaSelectionOptionsFromArrayWithMediaCharacteristics(mediaSelectionOptions: NSArray<AVMediaSelectionOption>, mediaCharacteristics: NSArray<string>): NSArray<AVMediaSelectionOption>;

	static mediaSelectionOptionsFromArrayWithoutMediaCharacteristics(mediaSelectionOptions: NSArray<AVMediaSelectionOption>, mediaCharacteristics: NSArray<string>): NSArray<AVMediaSelectionOption>;

	static new(): AVMediaSelectionGroup; // inherited from NSObject

	static playableMediaSelectionOptionsFromArray(mediaSelectionOptions: NSArray<AVMediaSelectionOption>): NSArray<AVMediaSelectionOption>;

	/* readonly */ allowsEmptySelection: boolean;

	/* readonly */ defaultOption: AVMediaSelectionOption;

	/* readonly */ options: NSArray<AVMediaSelectionOption>;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	makeNowPlayingInfoLanguageOptionGroup(): MPNowPlayingInfoLanguageOptionGroup;

	mediaSelectionOptionWithPropertyList(plist: any): AVMediaSelectionOption;
}

declare class AVMediaSelectionOption extends NSObject implements NSCopying {

	static alloc(): AVMediaSelectionOption; // inherited from NSObject

	static new(): AVMediaSelectionOption; // inherited from NSObject

	/* readonly */ availableMetadataFormats: NSArray<string>;

	/* readonly */ commonMetadata: NSArray<AVMetadataItem>;

	/* readonly */ displayName: string;

	/* readonly */ extendedLanguageTag: string;

	/* readonly */ locale: NSLocale;

	/* readonly */ mediaSubTypes: NSArray<number>;

	/* readonly */ mediaType: string;

	/* readonly */ playable: boolean;

	associatedMediaSelectionOptionInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): AVMediaSelectionOption;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	displayNameWithLocale(locale: NSLocale): string;

	hasMediaCharacteristic(mediaCharacteristic: string): boolean;

	makeNowPlayingInfoLanguageOption(): MPNowPlayingInfoLanguageOption;

	metadataForFormat(format: string): NSArray<AVMetadataItem>;

	propertyList(): any;
}

declare var AVMediaTypeAudio: string;

declare var AVMediaTypeClosedCaption: string;

declare var AVMediaTypeMetadata: string;

declare var AVMediaTypeMetadataObject: string;

declare var AVMediaTypeMuxed: string;

declare var AVMediaTypeSubtitle: string;

declare var AVMediaTypeText: string;

declare var AVMediaTypeTimecode: string;

declare var AVMediaTypeVideo: string;

declare var AVMetadata3GPUserDataKeyAlbumAndTrack: string;

declare var AVMetadata3GPUserDataKeyAuthor: string;

declare var AVMetadata3GPUserDataKeyCollection: string;

declare var AVMetadata3GPUserDataKeyCopyright: string;

declare var AVMetadata3GPUserDataKeyDescription: string;

declare var AVMetadata3GPUserDataKeyGenre: string;

declare var AVMetadata3GPUserDataKeyKeywordList: string;

declare var AVMetadata3GPUserDataKeyLocation: string;

declare var AVMetadata3GPUserDataKeyMediaClassification: string;

declare var AVMetadata3GPUserDataKeyMediaRating: string;

declare var AVMetadata3GPUserDataKeyPerformer: string;

declare var AVMetadata3GPUserDataKeyRecordingYear: string;

declare var AVMetadata3GPUserDataKeyThumbnail: string;

declare var AVMetadata3GPUserDataKeyTitle: string;

declare var AVMetadata3GPUserDataKeyUserRating: string;

declare var AVMetadataCommonIdentifierAlbumName: string;

declare var AVMetadataCommonIdentifierArtist: string;

declare var AVMetadataCommonIdentifierArtwork: string;

declare var AVMetadataCommonIdentifierAssetIdentifier: string;

declare var AVMetadataCommonIdentifierAuthor: string;

declare var AVMetadataCommonIdentifierContributor: string;

declare var AVMetadataCommonIdentifierCopyrights: string;

declare var AVMetadataCommonIdentifierCreationDate: string;

declare var AVMetadataCommonIdentifierCreator: string;

declare var AVMetadataCommonIdentifierDescription: string;

declare var AVMetadataCommonIdentifierFormat: string;

declare var AVMetadataCommonIdentifierLanguage: string;

declare var AVMetadataCommonIdentifierLastModifiedDate: string;

declare var AVMetadataCommonIdentifierLocation: string;

declare var AVMetadataCommonIdentifierMake: string;

declare var AVMetadataCommonIdentifierModel: string;

declare var AVMetadataCommonIdentifierPublisher: string;

declare var AVMetadataCommonIdentifierRelation: string;

declare var AVMetadataCommonIdentifierSoftware: string;

declare var AVMetadataCommonIdentifierSource: string;

declare var AVMetadataCommonIdentifierSubject: string;

declare var AVMetadataCommonIdentifierTitle: string;

declare var AVMetadataCommonIdentifierType: string;

declare var AVMetadataCommonKeyAlbumName: string;

declare var AVMetadataCommonKeyArtist: string;

declare var AVMetadataCommonKeyArtwork: string;

declare var AVMetadataCommonKeyAuthor: string;

declare var AVMetadataCommonKeyContributor: string;

declare var AVMetadataCommonKeyCopyrights: string;

declare var AVMetadataCommonKeyCreationDate: string;

declare var AVMetadataCommonKeyCreator: string;

declare var AVMetadataCommonKeyDescription: string;

declare var AVMetadataCommonKeyFormat: string;

declare var AVMetadataCommonKeyIdentifier: string;

declare var AVMetadataCommonKeyLanguage: string;

declare var AVMetadataCommonKeyLastModifiedDate: string;

declare var AVMetadataCommonKeyLocation: string;

declare var AVMetadataCommonKeyMake: string;

declare var AVMetadataCommonKeyModel: string;

declare var AVMetadataCommonKeyPublisher: string;

declare var AVMetadataCommonKeyRelation: string;

declare var AVMetadataCommonKeySoftware: string;

declare var AVMetadataCommonKeySource: string;

declare var AVMetadataCommonKeySubject: string;

declare var AVMetadataCommonKeyTitle: string;

declare var AVMetadataCommonKeyType: string;

declare var AVMetadataExtraAttributeBaseURIKey: string;

declare var AVMetadataExtraAttributeInfoKey: string;

declare var AVMetadataExtraAttributeValueURIKey: string;

declare class AVMetadataFaceObject extends AVMetadataObject implements NSCopying {

	static alloc(): AVMetadataFaceObject; // inherited from NSObject

	static new(): AVMetadataFaceObject; // inherited from NSObject

	/* readonly */ faceID: number;

	/* readonly */ hasRollAngle: boolean;

	/* readonly */ hasYawAngle: boolean;

	/* readonly */ rollAngle: number;

	/* readonly */ yawAngle: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var AVMetadataFormatHLSMetadata: string;

declare var AVMetadataFormatID3Metadata: string;

declare var AVMetadataFormatISOUserData: string;

declare var AVMetadataFormatQuickTimeMetadata: string;

declare var AVMetadataFormatQuickTimeUserData: string;

declare var AVMetadataFormatiTunesMetadata: string;

declare class AVMetadataGroup extends NSObject {

	static alloc(): AVMetadataGroup; // inherited from NSObject

	static new(): AVMetadataGroup; // inherited from NSObject

	/* readonly */ classifyingLabel: string;

	/* readonly */ items: NSArray<AVMetadataItem>;

	/* readonly */ uniqueID: string;
}

declare var AVMetadataID3MetadataKeyAlbumSortOrder: string;

declare var AVMetadataID3MetadataKeyAlbumTitle: string;

declare var AVMetadataID3MetadataKeyAttachedPicture: string;

declare var AVMetadataID3MetadataKeyAudioEncryption: string;

declare var AVMetadataID3MetadataKeyAudioSeekPointIndex: string;

declare var AVMetadataID3MetadataKeyBand: string;

declare var AVMetadataID3MetadataKeyBeatsPerMinute: string;

declare var AVMetadataID3MetadataKeyComments: string;

declare var AVMetadataID3MetadataKeyCommercial: string;

declare var AVMetadataID3MetadataKeyCommercialInformation: string;

declare var AVMetadataID3MetadataKeyCommerical: string;

declare var AVMetadataID3MetadataKeyComposer: string;

declare var AVMetadataID3MetadataKeyConductor: string;

declare var AVMetadataID3MetadataKeyContentGroupDescription: string;

declare var AVMetadataID3MetadataKeyContentType: string;

declare var AVMetadataID3MetadataKeyCopyright: string;

declare var AVMetadataID3MetadataKeyCopyrightInformation: string;

declare var AVMetadataID3MetadataKeyDate: string;

declare var AVMetadataID3MetadataKeyEncodedBy: string;

declare var AVMetadataID3MetadataKeyEncodedWith: string;

declare var AVMetadataID3MetadataKeyEncodingTime: string;

declare var AVMetadataID3MetadataKeyEncryption: string;

declare var AVMetadataID3MetadataKeyEqualization: string;

declare var AVMetadataID3MetadataKeyEqualization2: string;

declare var AVMetadataID3MetadataKeyEventTimingCodes: string;

declare var AVMetadataID3MetadataKeyFileOwner: string;

declare var AVMetadataID3MetadataKeyFileType: string;

declare var AVMetadataID3MetadataKeyGeneralEncapsulatedObject: string;

declare var AVMetadataID3MetadataKeyGroupIdentifier: string;

declare var AVMetadataID3MetadataKeyInitialKey: string;

declare var AVMetadataID3MetadataKeyInternationalStandardRecordingCode: string;

declare var AVMetadataID3MetadataKeyInternetRadioStationName: string;

declare var AVMetadataID3MetadataKeyInternetRadioStationOwner: string;

declare var AVMetadataID3MetadataKeyInvolvedPeopleList_v23: string;

declare var AVMetadataID3MetadataKeyInvolvedPeopleList_v24: string;

declare var AVMetadataID3MetadataKeyLanguage: string;

declare var AVMetadataID3MetadataKeyLeadPerformer: string;

declare var AVMetadataID3MetadataKeyLength: string;

declare var AVMetadataID3MetadataKeyLink: string;

declare var AVMetadataID3MetadataKeyLyricist: string;

declare var AVMetadataID3MetadataKeyMPEGLocationLookupTable: string;

declare var AVMetadataID3MetadataKeyMediaType: string;

declare var AVMetadataID3MetadataKeyModifiedBy: string;

declare var AVMetadataID3MetadataKeyMood: string;

declare var AVMetadataID3MetadataKeyMusicCDIdentifier: string;

declare var AVMetadataID3MetadataKeyMusicianCreditsList: string;

declare var AVMetadataID3MetadataKeyOfficialArtistWebpage: string;

declare var AVMetadataID3MetadataKeyOfficialAudioFileWebpage: string;

declare var AVMetadataID3MetadataKeyOfficialAudioSourceWebpage: string;

declare var AVMetadataID3MetadataKeyOfficialInternetRadioStationHomepage: string;

declare var AVMetadataID3MetadataKeyOfficialPublisherWebpage: string;

declare var AVMetadataID3MetadataKeyOriginalAlbumTitle: string;

declare var AVMetadataID3MetadataKeyOriginalArtist: string;

declare var AVMetadataID3MetadataKeyOriginalFilename: string;

declare var AVMetadataID3MetadataKeyOriginalLyricist: string;

declare var AVMetadataID3MetadataKeyOriginalReleaseTime: string;

declare var AVMetadataID3MetadataKeyOriginalReleaseYear: string;

declare var AVMetadataID3MetadataKeyOwnership: string;

declare var AVMetadataID3MetadataKeyPartOfASet: string;

declare var AVMetadataID3MetadataKeyPayment: string;

declare var AVMetadataID3MetadataKeyPerformerSortOrder: string;

declare var AVMetadataID3MetadataKeyPlayCounter: string;

declare var AVMetadataID3MetadataKeyPlaylistDelay: string;

declare var AVMetadataID3MetadataKeyPopularimeter: string;

declare var AVMetadataID3MetadataKeyPositionSynchronization: string;

declare var AVMetadataID3MetadataKeyPrivate: string;

declare var AVMetadataID3MetadataKeyProducedNotice: string;

declare var AVMetadataID3MetadataKeyPublisher: string;

declare var AVMetadataID3MetadataKeyRecommendedBufferSize: string;

declare var AVMetadataID3MetadataKeyRecordingDates: string;

declare var AVMetadataID3MetadataKeyRecordingTime: string;

declare var AVMetadataID3MetadataKeyRelativeVolumeAdjustment: string;

declare var AVMetadataID3MetadataKeyRelativeVolumeAdjustment2: string;

declare var AVMetadataID3MetadataKeyReleaseTime: string;

declare var AVMetadataID3MetadataKeyReverb: string;

declare var AVMetadataID3MetadataKeySeek: string;

declare var AVMetadataID3MetadataKeySetSubtitle: string;

declare var AVMetadataID3MetadataKeySignature: string;

declare var AVMetadataID3MetadataKeySize: string;

declare var AVMetadataID3MetadataKeySubTitle: string;

declare var AVMetadataID3MetadataKeySynchronizedLyric: string;

declare var AVMetadataID3MetadataKeySynchronizedTempoCodes: string;

declare var AVMetadataID3MetadataKeyTaggingTime: string;

declare var AVMetadataID3MetadataKeyTermsOfUse: string;

declare var AVMetadataID3MetadataKeyTime: string;

declare var AVMetadataID3MetadataKeyTitleDescription: string;

declare var AVMetadataID3MetadataKeyTitleSortOrder: string;

declare var AVMetadataID3MetadataKeyTrackNumber: string;

declare var AVMetadataID3MetadataKeyUniqueFileIdentifier: string;

declare var AVMetadataID3MetadataKeyUnsynchronizedLyric: string;

declare var AVMetadataID3MetadataKeyUserText: string;

declare var AVMetadataID3MetadataKeyUserURL: string;

declare var AVMetadataID3MetadataKeyYear: string;

declare var AVMetadataISOUserDataKeyCopyright: string;

declare var AVMetadataISOUserDataKeyDate: string;

declare var AVMetadataISOUserDataKeyTaggedCharacteristic: string;

declare var AVMetadataIcyMetadataKeyStreamTitle: string;

declare var AVMetadataIcyMetadataKeyStreamURL: string;

declare var AVMetadataIdentifier3GPUserDataAlbumAndTrack: string;

declare var AVMetadataIdentifier3GPUserDataAuthor: string;

declare var AVMetadataIdentifier3GPUserDataCollection: string;

declare var AVMetadataIdentifier3GPUserDataCopyright: string;

declare var AVMetadataIdentifier3GPUserDataDescription: string;

declare var AVMetadataIdentifier3GPUserDataGenre: string;

declare var AVMetadataIdentifier3GPUserDataKeywordList: string;

declare var AVMetadataIdentifier3GPUserDataLocation: string;

declare var AVMetadataIdentifier3GPUserDataMediaClassification: string;

declare var AVMetadataIdentifier3GPUserDataMediaRating: string;

declare var AVMetadataIdentifier3GPUserDataPerformer: string;

declare var AVMetadataIdentifier3GPUserDataRecordingYear: string;

declare var AVMetadataIdentifier3GPUserDataThumbnail: string;

declare var AVMetadataIdentifier3GPUserDataTitle: string;

declare var AVMetadataIdentifier3GPUserDataUserRating: string;

declare var AVMetadataIdentifierID3MetadataAlbumSortOrder: string;

declare var AVMetadataIdentifierID3MetadataAlbumTitle: string;

declare var AVMetadataIdentifierID3MetadataAttachedPicture: string;

declare var AVMetadataIdentifierID3MetadataAudioEncryption: string;

declare var AVMetadataIdentifierID3MetadataAudioSeekPointIndex: string;

declare var AVMetadataIdentifierID3MetadataBand: string;

declare var AVMetadataIdentifierID3MetadataBeatsPerMinute: string;

declare var AVMetadataIdentifierID3MetadataComments: string;

declare var AVMetadataIdentifierID3MetadataCommercial: string;

declare var AVMetadataIdentifierID3MetadataCommercialInformation: string;

declare var AVMetadataIdentifierID3MetadataCommerical: string;

declare var AVMetadataIdentifierID3MetadataComposer: string;

declare var AVMetadataIdentifierID3MetadataConductor: string;

declare var AVMetadataIdentifierID3MetadataContentGroupDescription: string;

declare var AVMetadataIdentifierID3MetadataContentType: string;

declare var AVMetadataIdentifierID3MetadataCopyright: string;

declare var AVMetadataIdentifierID3MetadataCopyrightInformation: string;

declare var AVMetadataIdentifierID3MetadataDate: string;

declare var AVMetadataIdentifierID3MetadataEncodedBy: string;

declare var AVMetadataIdentifierID3MetadataEncodedWith: string;

declare var AVMetadataIdentifierID3MetadataEncodingTime: string;

declare var AVMetadataIdentifierID3MetadataEncryption: string;

declare var AVMetadataIdentifierID3MetadataEqualization: string;

declare var AVMetadataIdentifierID3MetadataEqualization2: string;

declare var AVMetadataIdentifierID3MetadataEventTimingCodes: string;

declare var AVMetadataIdentifierID3MetadataFileOwner: string;

declare var AVMetadataIdentifierID3MetadataFileType: string;

declare var AVMetadataIdentifierID3MetadataGeneralEncapsulatedObject: string;

declare var AVMetadataIdentifierID3MetadataGroupIdentifier: string;

declare var AVMetadataIdentifierID3MetadataInitialKey: string;

declare var AVMetadataIdentifierID3MetadataInternationalStandardRecordingCode: string;

declare var AVMetadataIdentifierID3MetadataInternetRadioStationName: string;

declare var AVMetadataIdentifierID3MetadataInternetRadioStationOwner: string;

declare var AVMetadataIdentifierID3MetadataInvolvedPeopleList_v23: string;

declare var AVMetadataIdentifierID3MetadataInvolvedPeopleList_v24: string;

declare var AVMetadataIdentifierID3MetadataLanguage: string;

declare var AVMetadataIdentifierID3MetadataLeadPerformer: string;

declare var AVMetadataIdentifierID3MetadataLength: string;

declare var AVMetadataIdentifierID3MetadataLink: string;

declare var AVMetadataIdentifierID3MetadataLyricist: string;

declare var AVMetadataIdentifierID3MetadataMPEGLocationLookupTable: string;

declare var AVMetadataIdentifierID3MetadataMediaType: string;

declare var AVMetadataIdentifierID3MetadataModifiedBy: string;

declare var AVMetadataIdentifierID3MetadataMood: string;

declare var AVMetadataIdentifierID3MetadataMusicCDIdentifier: string;

declare var AVMetadataIdentifierID3MetadataMusicianCreditsList: string;

declare var AVMetadataIdentifierID3MetadataOfficialArtistWebpage: string;

declare var AVMetadataIdentifierID3MetadataOfficialAudioFileWebpage: string;

declare var AVMetadataIdentifierID3MetadataOfficialAudioSourceWebpage: string;

declare var AVMetadataIdentifierID3MetadataOfficialInternetRadioStationHomepage: string;

declare var AVMetadataIdentifierID3MetadataOfficialPublisherWebpage: string;

declare var AVMetadataIdentifierID3MetadataOriginalAlbumTitle: string;

declare var AVMetadataIdentifierID3MetadataOriginalArtist: string;

declare var AVMetadataIdentifierID3MetadataOriginalFilename: string;

declare var AVMetadataIdentifierID3MetadataOriginalLyricist: string;

declare var AVMetadataIdentifierID3MetadataOriginalReleaseTime: string;

declare var AVMetadataIdentifierID3MetadataOriginalReleaseYear: string;

declare var AVMetadataIdentifierID3MetadataOwnership: string;

declare var AVMetadataIdentifierID3MetadataPartOfASet: string;

declare var AVMetadataIdentifierID3MetadataPayment: string;

declare var AVMetadataIdentifierID3MetadataPerformerSortOrder: string;

declare var AVMetadataIdentifierID3MetadataPlayCounter: string;

declare var AVMetadataIdentifierID3MetadataPlaylistDelay: string;

declare var AVMetadataIdentifierID3MetadataPopularimeter: string;

declare var AVMetadataIdentifierID3MetadataPositionSynchronization: string;

declare var AVMetadataIdentifierID3MetadataPrivate: string;

declare var AVMetadataIdentifierID3MetadataProducedNotice: string;

declare var AVMetadataIdentifierID3MetadataPublisher: string;

declare var AVMetadataIdentifierID3MetadataRecommendedBufferSize: string;

declare var AVMetadataIdentifierID3MetadataRecordingDates: string;

declare var AVMetadataIdentifierID3MetadataRecordingTime: string;

declare var AVMetadataIdentifierID3MetadataRelativeVolumeAdjustment: string;

declare var AVMetadataIdentifierID3MetadataRelativeVolumeAdjustment2: string;

declare var AVMetadataIdentifierID3MetadataReleaseTime: string;

declare var AVMetadataIdentifierID3MetadataReverb: string;

declare var AVMetadataIdentifierID3MetadataSeek: string;

declare var AVMetadataIdentifierID3MetadataSetSubtitle: string;

declare var AVMetadataIdentifierID3MetadataSignature: string;

declare var AVMetadataIdentifierID3MetadataSize: string;

declare var AVMetadataIdentifierID3MetadataSubTitle: string;

declare var AVMetadataIdentifierID3MetadataSynchronizedLyric: string;

declare var AVMetadataIdentifierID3MetadataSynchronizedTempoCodes: string;

declare var AVMetadataIdentifierID3MetadataTaggingTime: string;

declare var AVMetadataIdentifierID3MetadataTermsOfUse: string;

declare var AVMetadataIdentifierID3MetadataTime: string;

declare var AVMetadataIdentifierID3MetadataTitleDescription: string;

declare var AVMetadataIdentifierID3MetadataTitleSortOrder: string;

declare var AVMetadataIdentifierID3MetadataTrackNumber: string;

declare var AVMetadataIdentifierID3MetadataUniqueFileIdentifier: string;

declare var AVMetadataIdentifierID3MetadataUnsynchronizedLyric: string;

declare var AVMetadataIdentifierID3MetadataUserText: string;

declare var AVMetadataIdentifierID3MetadataUserURL: string;

declare var AVMetadataIdentifierID3MetadataYear: string;

declare var AVMetadataIdentifierISOUserDataCopyright: string;

declare var AVMetadataIdentifierISOUserDataDate: string;

declare var AVMetadataIdentifierISOUserDataTaggedCharacteristic: string;

declare var AVMetadataIdentifierIcyMetadataStreamTitle: string;

declare var AVMetadataIdentifierIcyMetadataStreamURL: string;

declare var AVMetadataIdentifierQuickTimeMetadataAlbum: string;

declare var AVMetadataIdentifierQuickTimeMetadataArranger: string;

declare var AVMetadataIdentifierQuickTimeMetadataArtist: string;

declare var AVMetadataIdentifierQuickTimeMetadataArtwork: string;

declare var AVMetadataIdentifierQuickTimeMetadataAuthor: string;

declare var AVMetadataIdentifierQuickTimeMetadataCameraFrameReadoutTime: string;

declare var AVMetadataIdentifierQuickTimeMetadataCameraIdentifier: string;

declare var AVMetadataIdentifierQuickTimeMetadataCollectionUser: string;

declare var AVMetadataIdentifierQuickTimeMetadataComment: string;

declare var AVMetadataIdentifierQuickTimeMetadataComposer: string;

declare var AVMetadataIdentifierQuickTimeMetadataContentIdentifier: string;

declare var AVMetadataIdentifierQuickTimeMetadataCopyright: string;

declare var AVMetadataIdentifierQuickTimeMetadataCreationDate: string;

declare var AVMetadataIdentifierQuickTimeMetadataCredits: string;

declare var AVMetadataIdentifierQuickTimeMetadataDescription: string;

declare var AVMetadataIdentifierQuickTimeMetadataDetectedFace: string;

declare var AVMetadataIdentifierQuickTimeMetadataDirectionFacing: string;

declare var AVMetadataIdentifierQuickTimeMetadataDirectionMotion: string;

declare var AVMetadataIdentifierQuickTimeMetadataDirector: string;

declare var AVMetadataIdentifierQuickTimeMetadataDisplayName: string;

declare var AVMetadataIdentifierQuickTimeMetadataEncodedBy: string;

declare var AVMetadataIdentifierQuickTimeMetadataGenre: string;

declare var AVMetadataIdentifierQuickTimeMetadataInformation: string;

declare var AVMetadataIdentifierQuickTimeMetadataKeywords: string;

declare var AVMetadataIdentifierQuickTimeMetadataLocationBody: string;

declare var AVMetadataIdentifierQuickTimeMetadataLocationDate: string;

declare var AVMetadataIdentifierQuickTimeMetadataLocationISO6709: string;

declare var AVMetadataIdentifierQuickTimeMetadataLocationName: string;

declare var AVMetadataIdentifierQuickTimeMetadataLocationNote: string;

declare var AVMetadataIdentifierQuickTimeMetadataLocationRole: string;

declare var AVMetadataIdentifierQuickTimeMetadataMake: string;

declare var AVMetadataIdentifierQuickTimeMetadataModel: string;

declare var AVMetadataIdentifierQuickTimeMetadataOriginalArtist: string;

declare var AVMetadataIdentifierQuickTimeMetadataPerformer: string;

declare var AVMetadataIdentifierQuickTimeMetadataPhonogramRights: string;

declare var AVMetadataIdentifierQuickTimeMetadataPreferredAffineTransform: string;

declare var AVMetadataIdentifierQuickTimeMetadataProducer: string;

declare var AVMetadataIdentifierQuickTimeMetadataPublisher: string;

declare var AVMetadataIdentifierQuickTimeMetadataRatingUser: string;

declare var AVMetadataIdentifierQuickTimeMetadataSoftware: string;

declare var AVMetadataIdentifierQuickTimeMetadataTitle: string;

declare var AVMetadataIdentifierQuickTimeMetadataVideoOrientation: string;

declare var AVMetadataIdentifierQuickTimeMetadataYear: string;

declare var AVMetadataIdentifierQuickTimeMetadataiXML: string;

declare var AVMetadataIdentifierQuickTimeUserDataAlbum: string;

declare var AVMetadataIdentifierQuickTimeUserDataArranger: string;

declare var AVMetadataIdentifierQuickTimeUserDataArtist: string;

declare var AVMetadataIdentifierQuickTimeUserDataAuthor: string;

declare var AVMetadataIdentifierQuickTimeUserDataChapter: string;

declare var AVMetadataIdentifierQuickTimeUserDataComment: string;

declare var AVMetadataIdentifierQuickTimeUserDataComposer: string;

declare var AVMetadataIdentifierQuickTimeUserDataCopyright: string;

declare var AVMetadataIdentifierQuickTimeUserDataCreationDate: string;

declare var AVMetadataIdentifierQuickTimeUserDataCredits: string;

declare var AVMetadataIdentifierQuickTimeUserDataDescription: string;

declare var AVMetadataIdentifierQuickTimeUserDataDirector: string;

declare var AVMetadataIdentifierQuickTimeUserDataDisclaimer: string;

declare var AVMetadataIdentifierQuickTimeUserDataEncodedBy: string;

declare var AVMetadataIdentifierQuickTimeUserDataFullName: string;

declare var AVMetadataIdentifierQuickTimeUserDataGenre: string;

declare var AVMetadataIdentifierQuickTimeUserDataHostComputer: string;

declare var AVMetadataIdentifierQuickTimeUserDataInformation: string;

declare var AVMetadataIdentifierQuickTimeUserDataKeywords: string;

declare var AVMetadataIdentifierQuickTimeUserDataLocationISO6709: string;

declare var AVMetadataIdentifierQuickTimeUserDataMake: string;

declare var AVMetadataIdentifierQuickTimeUserDataModel: string;

declare var AVMetadataIdentifierQuickTimeUserDataOriginalArtist: string;

declare var AVMetadataIdentifierQuickTimeUserDataOriginalFormat: string;

declare var AVMetadataIdentifierQuickTimeUserDataOriginalSource: string;

declare var AVMetadataIdentifierQuickTimeUserDataPerformers: string;

declare var AVMetadataIdentifierQuickTimeUserDataPhonogramRights: string;

declare var AVMetadataIdentifierQuickTimeUserDataProducer: string;

declare var AVMetadataIdentifierQuickTimeUserDataProduct: string;

declare var AVMetadataIdentifierQuickTimeUserDataPublisher: string;

declare var AVMetadataIdentifierQuickTimeUserDataSoftware: string;

declare var AVMetadataIdentifierQuickTimeUserDataSpecialPlaybackRequirements: string;

declare var AVMetadataIdentifierQuickTimeUserDataTaggedCharacteristic: string;

declare var AVMetadataIdentifierQuickTimeUserDataTrack: string;

declare var AVMetadataIdentifierQuickTimeUserDataTrackName: string;

declare var AVMetadataIdentifierQuickTimeUserDataURLLink: string;

declare var AVMetadataIdentifierQuickTimeUserDataWarning: string;

declare var AVMetadataIdentifierQuickTimeUserDataWriter: string;

declare var AVMetadataIdentifieriTunesMetadataAccountKind: string;

declare var AVMetadataIdentifieriTunesMetadataAcknowledgement: string;

declare var AVMetadataIdentifieriTunesMetadataAlbum: string;

declare var AVMetadataIdentifieriTunesMetadataAlbumArtist: string;

declare var AVMetadataIdentifieriTunesMetadataAppleID: string;

declare var AVMetadataIdentifieriTunesMetadataArranger: string;

declare var AVMetadataIdentifieriTunesMetadataArtDirector: string;

declare var AVMetadataIdentifieriTunesMetadataArtist: string;

declare var AVMetadataIdentifieriTunesMetadataArtistID: string;

declare var AVMetadataIdentifieriTunesMetadataAuthor: string;

declare var AVMetadataIdentifieriTunesMetadataBeatsPerMin: string;

declare var AVMetadataIdentifieriTunesMetadataComposer: string;

declare var AVMetadataIdentifieriTunesMetadataConductor: string;

declare var AVMetadataIdentifieriTunesMetadataContentRating: string;

declare var AVMetadataIdentifieriTunesMetadataCopyright: string;

declare var AVMetadataIdentifieriTunesMetadataCoverArt: string;

declare var AVMetadataIdentifieriTunesMetadataCredits: string;

declare var AVMetadataIdentifieriTunesMetadataDescription: string;

declare var AVMetadataIdentifieriTunesMetadataDirector: string;

declare var AVMetadataIdentifieriTunesMetadataDiscCompilation: string;

declare var AVMetadataIdentifieriTunesMetadataDiscNumber: string;

declare var AVMetadataIdentifieriTunesMetadataEQ: string;

declare var AVMetadataIdentifieriTunesMetadataEncodedBy: string;

declare var AVMetadataIdentifieriTunesMetadataEncodingTool: string;

declare var AVMetadataIdentifieriTunesMetadataExecProducer: string;

declare var AVMetadataIdentifieriTunesMetadataGenreID: string;

declare var AVMetadataIdentifieriTunesMetadataGrouping: string;

declare var AVMetadataIdentifieriTunesMetadataLinerNotes: string;

declare var AVMetadataIdentifieriTunesMetadataLyrics: string;

declare var AVMetadataIdentifieriTunesMetadataOnlineExtras: string;

declare var AVMetadataIdentifieriTunesMetadataOriginalArtist: string;

declare var AVMetadataIdentifieriTunesMetadataPerformer: string;

declare var AVMetadataIdentifieriTunesMetadataPhonogramRights: string;

declare var AVMetadataIdentifieriTunesMetadataPlaylistID: string;

declare var AVMetadataIdentifieriTunesMetadataPredefinedGenre: string;

declare var AVMetadataIdentifieriTunesMetadataProducer: string;

declare var AVMetadataIdentifieriTunesMetadataPublisher: string;

declare var AVMetadataIdentifieriTunesMetadataRecordCompany: string;

declare var AVMetadataIdentifieriTunesMetadataReleaseDate: string;

declare var AVMetadataIdentifieriTunesMetadataSoloist: string;

declare var AVMetadataIdentifieriTunesMetadataSongID: string;

declare var AVMetadataIdentifieriTunesMetadataSongName: string;

declare var AVMetadataIdentifieriTunesMetadataSoundEngineer: string;

declare var AVMetadataIdentifieriTunesMetadataThanks: string;

declare var AVMetadataIdentifieriTunesMetadataTrackNumber: string;

declare var AVMetadataIdentifieriTunesMetadataTrackSubTitle: string;

declare var AVMetadataIdentifieriTunesMetadataUserComment: string;

declare var AVMetadataIdentifieriTunesMetadataUserGenre: string;

declare class AVMetadataItem extends NSObject implements AVAsynchronousKeyValueLoading, NSCopying, NSMutableCopying {

	static alloc(): AVMetadataItem; // inherited from NSObject

	static identifierForKeyKeySpace(key: any, keySpace: string): string;

	static keyForIdentifier(identifier: string): any;

	static keySpaceForIdentifier(identifier: string): string;

	static metadataItemWithPropertiesOfMetadataItemValueLoadingHandler(metadataItem: AVMetadataItem, handler: (p1: AVMetadataItemValueRequest) => void): AVMetadataItem;

	static metadataItemsFromArrayFilteredAndSortedAccordingToPreferredLanguages(metadataItems: NSArray<AVMetadataItem>, preferredLanguages: NSArray<string>): NSArray<AVMetadataItem>;

	static metadataItemsFromArrayFilteredByIdentifier(metadataItems: NSArray<AVMetadataItem>, identifier: string): NSArray<AVMetadataItem>;

	static metadataItemsFromArrayFilteredByMetadataItemFilter(metadataItems: NSArray<AVMetadataItem>, metadataItemFilter: AVMetadataItemFilter): NSArray<AVMetadataItem>;

	static metadataItemsFromArrayWithKeyKeySpace(metadataItems: NSArray<AVMetadataItem>, key: any, keySpace: string): NSArray<AVMetadataItem>;

	static metadataItemsFromArrayWithLocale(metadataItems: NSArray<AVMetadataItem>, locale: NSLocale): NSArray<AVMetadataItem>;

	static new(): AVMetadataItem; // inherited from NSObject

	/* readonly */ commonKey: string;

	/* readonly */ dataType: string;

	/* readonly */ dataValue: NSData;

	/* readonly */ dateValue: Date;

	/* readonly */ duration: CMTime;

	/* readonly */ extendedLanguageTag: string;

	/* readonly */ extraAttributes: NSDictionary<string, any>;

	/* readonly */ identifier: string;

	/* readonly */ key: any;

	/* readonly */ keySpace: string;

	/* readonly */ locale: NSLocale;

	/* readonly */ numberValue: number;

	/* readonly */ startDate: Date;

	/* readonly */ stringValue: string;

	/* readonly */ time: CMTime;

	/* readonly */ value: any;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	loadValuesAsynchronouslyForKeysCompletionHandler(keys: NSArray<string>, handler: () => void): void;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	statusOfValueForKeyError(key: string): AVKeyValueStatus;
}

declare class AVMetadataItemFilter extends NSObject {

	static alloc(): AVMetadataItemFilter; // inherited from NSObject

	static metadataItemFilterForSharing(): AVMetadataItemFilter;

	static new(): AVMetadataItemFilter; // inherited from NSObject
}

declare class AVMetadataItemValueRequest extends NSObject {

	static alloc(): AVMetadataItemValueRequest; // inherited from NSObject

	static new(): AVMetadataItemValueRequest; // inherited from NSObject

	/* readonly */ metadataItem: AVMetadataItem;

	respondWithError(error: NSError): void;

	respondWithValue(value: any): void;
}

declare var AVMetadataKeySpaceCommon: string;

declare var AVMetadataKeySpaceHLSDateRange: string;

declare var AVMetadataKeySpaceID3: string;

declare var AVMetadataKeySpaceISOUserData: string;

declare var AVMetadataKeySpaceIcy: string;

declare var AVMetadataKeySpaceQuickTimeMetadata: string;

declare var AVMetadataKeySpaceQuickTimeUserData: string;

declare var AVMetadataKeySpaceiTunes: string;

declare class AVMetadataMachineReadableCodeObject extends AVMetadataObject {

	static alloc(): AVMetadataMachineReadableCodeObject; // inherited from NSObject

	static new(): AVMetadataMachineReadableCodeObject; // inherited from NSObject

	/* readonly */ corners: NSArray<any>;

	/* readonly */ stringValue: string;
}

declare class AVMetadataObject extends NSObject {

	static alloc(): AVMetadataObject; // inherited from NSObject

	static new(): AVMetadataObject; // inherited from NSObject

	/* readonly */ bounds: CGRect;

	/* readonly */ duration: CMTime;

	/* readonly */ time: CMTime;

	/* readonly */ type: string;
}

declare var AVMetadataObjectTypeAztecCode: string;

declare var AVMetadataObjectTypeCode128Code: string;

declare var AVMetadataObjectTypeCode39Code: string;

declare var AVMetadataObjectTypeCode39Mod43Code: string;

declare var AVMetadataObjectTypeCode93Code: string;

declare var AVMetadataObjectTypeDataMatrixCode: string;

declare var AVMetadataObjectTypeEAN13Code: string;

declare var AVMetadataObjectTypeEAN8Code: string;

declare var AVMetadataObjectTypeFace: string;

declare var AVMetadataObjectTypeITF14Code: string;

declare var AVMetadataObjectTypeInterleaved2of5Code: string;

declare var AVMetadataObjectTypePDF417Code: string;

declare var AVMetadataObjectTypeQRCode: string;

declare var AVMetadataObjectTypeUPCECode: string;

declare var AVMetadataQuickTimeMetadataKeyAlbum: string;

declare var AVMetadataQuickTimeMetadataKeyArranger: string;

declare var AVMetadataQuickTimeMetadataKeyArtist: string;

declare var AVMetadataQuickTimeMetadataKeyArtwork: string;

declare var AVMetadataQuickTimeMetadataKeyAuthor: string;

declare var AVMetadataQuickTimeMetadataKeyCameraFrameReadoutTime: string;

declare var AVMetadataQuickTimeMetadataKeyCameraIdentifier: string;

declare var AVMetadataQuickTimeMetadataKeyCollectionUser: string;

declare var AVMetadataQuickTimeMetadataKeyComment: string;

declare var AVMetadataQuickTimeMetadataKeyComposer: string;

declare var AVMetadataQuickTimeMetadataKeyContentIdentifier: string;

declare var AVMetadataQuickTimeMetadataKeyCopyright: string;

declare var AVMetadataQuickTimeMetadataKeyCreationDate: string;

declare var AVMetadataQuickTimeMetadataKeyCredits: string;

declare var AVMetadataQuickTimeMetadataKeyDescription: string;

declare var AVMetadataQuickTimeMetadataKeyDirectionFacing: string;

declare var AVMetadataQuickTimeMetadataKeyDirectionMotion: string;

declare var AVMetadataQuickTimeMetadataKeyDirector: string;

declare var AVMetadataQuickTimeMetadataKeyDisplayName: string;

declare var AVMetadataQuickTimeMetadataKeyEncodedBy: string;

declare var AVMetadataQuickTimeMetadataKeyGenre: string;

declare var AVMetadataQuickTimeMetadataKeyInformation: string;

declare var AVMetadataQuickTimeMetadataKeyKeywords: string;

declare var AVMetadataQuickTimeMetadataKeyLocationBody: string;

declare var AVMetadataQuickTimeMetadataKeyLocationDate: string;

declare var AVMetadataQuickTimeMetadataKeyLocationISO6709: string;

declare var AVMetadataQuickTimeMetadataKeyLocationName: string;

declare var AVMetadataQuickTimeMetadataKeyLocationNote: string;

declare var AVMetadataQuickTimeMetadataKeyLocationRole: string;

declare var AVMetadataQuickTimeMetadataKeyMake: string;

declare var AVMetadataQuickTimeMetadataKeyModel: string;

declare var AVMetadataQuickTimeMetadataKeyOriginalArtist: string;

declare var AVMetadataQuickTimeMetadataKeyPerformer: string;

declare var AVMetadataQuickTimeMetadataKeyPhonogramRights: string;

declare var AVMetadataQuickTimeMetadataKeyProducer: string;

declare var AVMetadataQuickTimeMetadataKeyPublisher: string;

declare var AVMetadataQuickTimeMetadataKeyRatingUser: string;

declare var AVMetadataQuickTimeMetadataKeySoftware: string;

declare var AVMetadataQuickTimeMetadataKeyTitle: string;

declare var AVMetadataQuickTimeMetadataKeyYear: string;

declare var AVMetadataQuickTimeMetadataKeyiXML: string;

declare var AVMetadataQuickTimeUserDataKeyAlbum: string;

declare var AVMetadataQuickTimeUserDataKeyArranger: string;

declare var AVMetadataQuickTimeUserDataKeyArtist: string;

declare var AVMetadataQuickTimeUserDataKeyAuthor: string;

declare var AVMetadataQuickTimeUserDataKeyChapter: string;

declare var AVMetadataQuickTimeUserDataKeyComment: string;

declare var AVMetadataQuickTimeUserDataKeyComposer: string;

declare var AVMetadataQuickTimeUserDataKeyCopyright: string;

declare var AVMetadataQuickTimeUserDataKeyCreationDate: string;

declare var AVMetadataQuickTimeUserDataKeyCredits: string;

declare var AVMetadataQuickTimeUserDataKeyDescription: string;

declare var AVMetadataQuickTimeUserDataKeyDirector: string;

declare var AVMetadataQuickTimeUserDataKeyDisclaimer: string;

declare var AVMetadataQuickTimeUserDataKeyEncodedBy: string;

declare var AVMetadataQuickTimeUserDataKeyFullName: string;

declare var AVMetadataQuickTimeUserDataKeyGenre: string;

declare var AVMetadataQuickTimeUserDataKeyHostComputer: string;

declare var AVMetadataQuickTimeUserDataKeyInformation: string;

declare var AVMetadataQuickTimeUserDataKeyKeywords: string;

declare var AVMetadataQuickTimeUserDataKeyLocationISO6709: string;

declare var AVMetadataQuickTimeUserDataKeyMake: string;

declare var AVMetadataQuickTimeUserDataKeyModel: string;

declare var AVMetadataQuickTimeUserDataKeyOriginalArtist: string;

declare var AVMetadataQuickTimeUserDataKeyOriginalFormat: string;

declare var AVMetadataQuickTimeUserDataKeyOriginalSource: string;

declare var AVMetadataQuickTimeUserDataKeyPerformers: string;

declare var AVMetadataQuickTimeUserDataKeyPhonogramRights: string;

declare var AVMetadataQuickTimeUserDataKeyProducer: string;

declare var AVMetadataQuickTimeUserDataKeyProduct: string;

declare var AVMetadataQuickTimeUserDataKeyPublisher: string;

declare var AVMetadataQuickTimeUserDataKeySoftware: string;

declare var AVMetadataQuickTimeUserDataKeySpecialPlaybackRequirements: string;

declare var AVMetadataQuickTimeUserDataKeyTaggedCharacteristic: string;

declare var AVMetadataQuickTimeUserDataKeyTrack: string;

declare var AVMetadataQuickTimeUserDataKeyTrackName: string;

declare var AVMetadataQuickTimeUserDataKeyURLLink: string;

declare var AVMetadataQuickTimeUserDataKeyWarning: string;

declare var AVMetadataQuickTimeUserDataKeyWriter: string;

declare var AVMetadataiTunesMetadataKeyAccountKind: string;

declare var AVMetadataiTunesMetadataKeyAcknowledgement: string;

declare var AVMetadataiTunesMetadataKeyAlbum: string;

declare var AVMetadataiTunesMetadataKeyAlbumArtist: string;

declare var AVMetadataiTunesMetadataKeyAppleID: string;

declare var AVMetadataiTunesMetadataKeyArranger: string;

declare var AVMetadataiTunesMetadataKeyArtDirector: string;

declare var AVMetadataiTunesMetadataKeyArtist: string;

declare var AVMetadataiTunesMetadataKeyArtistID: string;

declare var AVMetadataiTunesMetadataKeyAuthor: string;

declare var AVMetadataiTunesMetadataKeyBeatsPerMin: string;

declare var AVMetadataiTunesMetadataKeyComposer: string;

declare var AVMetadataiTunesMetadataKeyConductor: string;

declare var AVMetadataiTunesMetadataKeyContentRating: string;

declare var AVMetadataiTunesMetadataKeyCopyright: string;

declare var AVMetadataiTunesMetadataKeyCoverArt: string;

declare var AVMetadataiTunesMetadataKeyCredits: string;

declare var AVMetadataiTunesMetadataKeyDescription: string;

declare var AVMetadataiTunesMetadataKeyDirector: string;

declare var AVMetadataiTunesMetadataKeyDiscCompilation: string;

declare var AVMetadataiTunesMetadataKeyDiscNumber: string;

declare var AVMetadataiTunesMetadataKeyEQ: string;

declare var AVMetadataiTunesMetadataKeyEncodedBy: string;

declare var AVMetadataiTunesMetadataKeyEncodingTool: string;

declare var AVMetadataiTunesMetadataKeyExecProducer: string;

declare var AVMetadataiTunesMetadataKeyGenreID: string;

declare var AVMetadataiTunesMetadataKeyGrouping: string;

declare var AVMetadataiTunesMetadataKeyLinerNotes: string;

declare var AVMetadataiTunesMetadataKeyLyrics: string;

declare var AVMetadataiTunesMetadataKeyOnlineExtras: string;

declare var AVMetadataiTunesMetadataKeyOriginalArtist: string;

declare var AVMetadataiTunesMetadataKeyPerformer: string;

declare var AVMetadataiTunesMetadataKeyPhonogramRights: string;

declare var AVMetadataiTunesMetadataKeyPlaylistID: string;

declare var AVMetadataiTunesMetadataKeyPredefinedGenre: string;

declare var AVMetadataiTunesMetadataKeyProducer: string;

declare var AVMetadataiTunesMetadataKeyPublisher: string;

declare var AVMetadataiTunesMetadataKeyRecordCompany: string;

declare var AVMetadataiTunesMetadataKeyReleaseDate: string;

declare var AVMetadataiTunesMetadataKeySoloist: string;

declare var AVMetadataiTunesMetadataKeySongID: string;

declare var AVMetadataiTunesMetadataKeySongName: string;

declare var AVMetadataiTunesMetadataKeySoundEngineer: string;

declare var AVMetadataiTunesMetadataKeyThanks: string;

declare var AVMetadataiTunesMetadataKeyTrackNumber: string;

declare var AVMetadataiTunesMetadataKeyTrackSubTitle: string;

declare var AVMetadataiTunesMetadataKeyUserComment: string;

declare var AVMetadataiTunesMetadataKeyUserGenre: string;

declare const enum AVMusicSequenceLoadOptions {

	SMF_PreserveTracks = 0,

	SMF_ChannelsToTracks = 1
}

declare class AVMusicTrack extends NSObject {

	static alloc(): AVMusicTrack; // inherited from NSObject

	static new(): AVMusicTrack; // inherited from NSObject

	destinationAudioUnit: AVAudioUnit;

	destinationMIDIEndpoint: number;

	lengthInBeats: number;

	lengthInSeconds: number;

	loopRange: AVBeatRange;

	loopingEnabled: boolean;

	muted: boolean;

	numberOfLoops: number;

	offsetTime: number;

	soloed: boolean;

	/* readonly */ timeResolution: number;
}

declare const enum AVMusicTrackLoopCount {

	Forever = -1
}

declare class AVMutableAudioMix extends AVAudioMix {

	static alloc(): AVMutableAudioMix; // inherited from NSObject

	static audioMix(): AVMutableAudioMix;

	static new(): AVMutableAudioMix; // inherited from NSObject

	inputParameters: NSArray<AVAudioMixInputParameters>;
}

declare class AVMutableAudioMixInputParameters extends AVAudioMixInputParameters {

	static alloc(): AVMutableAudioMixInputParameters; // inherited from NSObject

	static audioMixInputParameters(): AVMutableAudioMixInputParameters;

	static audioMixInputParametersWithTrack(track: AVAssetTrack): AVMutableAudioMixInputParameters;

	static new(): AVMutableAudioMixInputParameters; // inherited from NSObject

	audioTapProcessor: any;

	audioTimePitchAlgorithm: string;

	trackID: number;

	setVolumeAtTime(volume: number, time: CMTime): void;

	setVolumeRampFromStartVolumeToEndVolumeTimeRange(startVolume: number, endVolume: number, timeRange: CMTimeRange): void;
}

declare class AVMutableComposition extends AVComposition {

	static alloc(): AVMutableComposition; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVMutableComposition; // inherited from AVAsset

	static composition(): AVMutableComposition;

	static compositionWithURLAssetInitializationOptions(URLAssetInitializationOptions: NSDictionary<string, any>): AVMutableComposition;

	static new(): AVMutableComposition; // inherited from NSObject

	naturalSize: CGSize;

	addMutableTrackWithMediaTypePreferredTrackID(mediaType: string, preferredTrackID: number): AVMutableCompositionTrack;

	insertEmptyTimeRange(timeRange: CMTimeRange): void;

	insertTimeRangeOfAssetAtTimeError(timeRange: CMTimeRange, asset: AVAsset, startTime: CMTime): boolean;

	mutableTrackCompatibleWithTrack(track: AVAssetTrack): AVMutableCompositionTrack;

	removeTimeRange(timeRange: CMTimeRange): void;

	removeTrack(track: AVCompositionTrack): void;

	scaleTimeRangeToDuration(timeRange: CMTimeRange, duration: CMTime): void;

	trackWithTrackID(trackID: number): AVMutableCompositionTrack;
}

declare class AVMutableCompositionTrack extends AVCompositionTrack {

	static alloc(): AVMutableCompositionTrack; // inherited from NSObject

	static new(): AVMutableCompositionTrack; // inherited from NSObject

	extendedLanguageTag: string;

	languageCode: string;

	naturalTimeScale: number;

	preferredTransform: CGAffineTransform;

	preferredVolume: number;

	segments: NSArray<AVCompositionTrackSegment>;

	insertEmptyTimeRange(timeRange: CMTimeRange): void;

	insertTimeRangeOfTrackAtTimeError(timeRange: CMTimeRange, track: AVAssetTrack, startTime: CMTime): boolean;

	insertTimeRangesOfTracksAtTimeError(timeRanges: NSArray<NSValue>, tracks: NSArray<AVAssetTrack>, startTime: CMTime): boolean;

	removeTimeRange(timeRange: CMTimeRange): void;

	scaleTimeRangeToDuration(timeRange: CMTimeRange, duration: CMTime): void;

	validateTrackSegmentsError(trackSegments: NSArray<AVCompositionTrackSegment>): boolean;
}

declare class AVMutableDateRangeMetadataGroup extends AVDateRangeMetadataGroup {

	static alloc(): AVMutableDateRangeMetadataGroup; // inherited from NSObject

	static new(): AVMutableDateRangeMetadataGroup; // inherited from NSObject

	endDate: Date;

	items: NSArray<AVMetadataItem>;

	startDate: Date;
}

declare class AVMutableMediaSelection extends AVMediaSelection {

	static alloc(): AVMutableMediaSelection; // inherited from NSObject

	static new(): AVMutableMediaSelection; // inherited from NSObject

	selectMediaOptionInMediaSelectionGroup(mediaSelectionOption: AVMediaSelectionOption, mediaSelectionGroup: AVMediaSelectionGroup): void;
}

declare class AVMutableMetadataItem extends AVMetadataItem {

	static alloc(): AVMutableMetadataItem; // inherited from NSObject

	static metadataItem(): AVMutableMetadataItem;

	static new(): AVMutableMetadataItem; // inherited from NSObject

	dataType: string;

	duration: CMTime;

	extendedLanguageTag: string;

	extraAttributes: NSDictionary<string, any>;

	identifier: string;

	key: any;

	keySpace: string;

	locale: NSLocale;

	startDate: Date;

	time: CMTime;

	value: any;
}

declare class AVMutableTimedMetadataGroup extends AVTimedMetadataGroup {

	static alloc(): AVMutableTimedMetadataGroup; // inherited from NSObject

	static new(): AVMutableTimedMetadataGroup; // inherited from NSObject

	items: NSArray<AVMetadataItem>;

	timeRange: CMTimeRange;
}

declare class AVMutableVideoComposition extends AVVideoComposition {

	static alloc(): AVMutableVideoComposition; // inherited from NSObject

	static new(): AVMutableVideoComposition; // inherited from NSObject

	static videoComposition(): AVMutableVideoComposition;

	static videoCompositionWithAssetApplyingCIFiltersWithHandler(asset: AVAsset, applier: (p1: AVAsynchronousCIImageFilteringRequest) => void): AVMutableVideoComposition;

	animationTool: AVVideoCompositionCoreAnimationTool;

	colorPrimaries: string;

	colorTransferFunction: string;

	colorYCbCrMatrix: string;

	customVideoCompositorClass: typeof NSObject;

	frameDuration: CMTime;

	instructions: NSArray<AVVideoCompositionInstructionProtocol>;

	renderScale: number;

	renderSize: CGSize;
}

declare class AVMutableVideoCompositionInstruction extends AVVideoCompositionInstruction {

	static alloc(): AVMutableVideoCompositionInstruction; // inherited from NSObject

	static new(): AVMutableVideoCompositionInstruction; // inherited from NSObject

	static videoCompositionInstruction(): AVMutableVideoCompositionInstruction;

	backgroundColor: any;

	enablePostProcessing: boolean;

	layerInstructions: NSArray<AVVideoCompositionLayerInstruction>;

	timeRange: CMTimeRange;
}

declare class AVMutableVideoCompositionLayerInstruction extends AVVideoCompositionLayerInstruction {

	static alloc(): AVMutableVideoCompositionLayerInstruction; // inherited from NSObject

	static new(): AVMutableVideoCompositionLayerInstruction; // inherited from NSObject

	static videoCompositionLayerInstruction(): AVMutableVideoCompositionLayerInstruction;

	static videoCompositionLayerInstructionWithAssetTrack(track: AVAssetTrack): AVMutableVideoCompositionLayerInstruction;

	trackID: number;

	setCropRectangleAtTime(cropRectangle: CGRect, time: CMTime): void;

	setCropRectangleRampFromStartCropRectangleToEndCropRectangleTimeRange(startCropRectangle: CGRect, endCropRectangle: CGRect, timeRange: CMTimeRange): void;

	setOpacityAtTime(opacity: number, time: CMTime): void;

	setOpacityRampFromStartOpacityToEndOpacityTimeRange(startOpacity: number, endOpacity: number, timeRange: CMTimeRange): void;

	setTransformAtTime(transform: CGAffineTransform, time: CMTime): void;

	setTransformRampFromStartTransformToEndTransformTimeRange(startTransform: CGAffineTransform, endTransform: CGAffineTransform, timeRange: CMTimeRange): void;
}

declare var AVNumberOfChannelsKey: string;

declare class AVOutputSettingsAssistant extends NSObject {

	static alloc(): AVOutputSettingsAssistant; // inherited from NSObject

	static availableOutputSettingsPresets(): NSArray<string>;

	static new(): AVOutputSettingsAssistant; // inherited from NSObject

	static outputSettingsAssistantWithPreset(presetIdentifier: string): AVOutputSettingsAssistant;

	/* readonly */ audioSettings: NSDictionary<string, any>;

	/* readonly */ outputFileType: string;

	sourceAudioFormat: any;

	sourceVideoAverageFrameDuration: CMTime;

	sourceVideoFormat: any;

	sourceVideoMinFrameDuration: CMTime;

	/* readonly */ videoSettings: NSDictionary<string, any>;
}

declare var AVOutputSettingsPreset1280x720: string;

declare var AVOutputSettingsPreset1920x1080: string;

declare var AVOutputSettingsPreset3840x2160: string;

declare var AVOutputSettingsPreset640x480: string;

declare var AVOutputSettingsPreset960x540: string;

interface AVPixelAspectRatio {
	horizontalSpacing: number;
	verticalSpacing: number;
}
declare var AVPixelAspectRatio: interop.StructType<AVPixelAspectRatio>;

declare class AVPlayer extends NSObject {

	static alloc(): AVPlayer; // inherited from NSObject

	static new(): AVPlayer; // inherited from NSObject

	static playerWithPlayerItem(item: AVPlayerItem): AVPlayer;

	static playerWithURL(URL: NSURL): AVPlayer;

	actionAtItemEnd: AVPlayerActionAtItemEnd;

	/* readonly */ airPlayVideoActive: boolean;

	allowsAirPlayVideo: boolean;

	allowsExternalPlayback: boolean;

	appliesMediaSelectionCriteriaAutomatically: boolean;

	automaticallyWaitsToMinimizeStalling: boolean;

	closedCaptionDisplayEnabled: boolean;

	/* readonly */ currentItem: AVPlayerItem;

	/* readonly */ error: NSError;

	/* readonly */ externalPlaybackActive: boolean;

	externalPlaybackVideoGravity: string;

	masterClock: any;

	muted: boolean;

	/* readonly */ outputObscuredDueToInsufficientExternalProtection: boolean;

	rate: number;

	/* readonly */ reasonForWaitingToPlay: string;

	/* readonly */ status: AVPlayerStatus;

	/* readonly */ timeControlStatus: AVPlayerTimeControlStatus;

	usesAirPlayVideoWhileAirPlayScreenIsActive: boolean;

	usesExternalPlaybackWhileExternalScreenIsActive: boolean;

	volume: number;

	constructor(o: { playerItem: AVPlayerItem; });

	constructor(o: { URL: NSURL; });

	addBoundaryTimeObserverForTimesQueueUsingBlock(times: NSArray<NSValue>, queue: NSObject, block: () => void): any;

	addPeriodicTimeObserverForIntervalQueueUsingBlock(interval: CMTime, queue: NSObject, block: (p1: CMTime) => void): any;

	cancelPendingPrerolls(): void;

	currentTime(): CMTime;

	initWithPlayerItem(item: AVPlayerItem): this;

	initWithURL(URL: NSURL): this;

	mediaSelectionCriteriaForMediaCharacteristic(mediaCharacteristic: string): AVPlayerMediaSelectionCriteria;

	pause(): void;

	play(): void;

	playImmediatelyAtRate(rate: number): void;

	prerollAtRateCompletionHandler(rate: number, completionHandler: (p1: boolean) => void): void;

	removeTimeObserver(observer: any): void;

	replaceCurrentItemWithPlayerItem(item: AVPlayerItem): void;

	seekToDate(date: Date): void;

	seekToDateCompletionHandler(date: Date, completionHandler: (p1: boolean) => void): void;

	seekToTime(time: CMTime): void;

	seekToTimeCompletionHandler(time: CMTime, completionHandler: (p1: boolean) => void): void;

	seekToTimeToleranceBeforeToleranceAfter(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime): void;

	seekToTimeToleranceBeforeToleranceAfterCompletionHandler(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime, completionHandler: (p1: boolean) => void): void;

	setMediaSelectionCriteriaForMediaCharacteristic(criteria: AVPlayerMediaSelectionCriteria, mediaCharacteristic: string): void;

	setRateTimeAtHostTime(rate: number, itemTime: CMTime, hostClockTime: CMTime): void;
}

declare const enum AVPlayerActionAtItemEnd {

	Advance = 0,

	Pause = 1,

	None = 2
}

declare class AVPlayerItem extends NSObject implements NSCopying {

	static alloc(): AVPlayerItem; // inherited from NSObject

	static new(): AVPlayerItem; // inherited from NSObject

	static playerItemWithAsset(asset: AVAsset): AVPlayerItem;

	static playerItemWithAssetAutomaticallyLoadedAssetKeys(asset: AVAsset, automaticallyLoadedAssetKeys: NSArray<string>): AVPlayerItem;

	static playerItemWithURL(URL: NSURL): AVPlayerItem;

	/* readonly */ asset: AVAsset;

	audioMix: AVAudioMix;

	audioTimePitchAlgorithm: string;

	/* readonly */ automaticallyLoadedAssetKeys: NSArray<string>;

	/* readonly */ canPlayFastForward: boolean;

	/* readonly */ canPlayFastReverse: boolean;

	/* readonly */ canPlayReverse: boolean;

	/* readonly */ canPlaySlowForward: boolean;

	/* readonly */ canPlaySlowReverse: boolean;

	/* readonly */ canStepBackward: boolean;

	/* readonly */ canStepForward: boolean;

	canUseNetworkResourcesForLiveStreamingWhilePaused: boolean;

	/* readonly */ currentMediaSelection: AVMediaSelection;

	/* readonly */ customVideoCompositor: AVVideoCompositing;

	/* readonly */ duration: CMTime;

	/* readonly */ error: NSError;

	forwardPlaybackEndTime: CMTime;

	/* readonly */ loadedTimeRanges: NSArray<NSValue>;

	/* readonly */ mediaDataCollectors: NSArray<AVPlayerItemMediaDataCollector>;

	/* readonly */ outputs: NSArray<AVPlayerItemOutput>;

	/* readonly */ playbackBufferEmpty: boolean;

	/* readonly */ playbackBufferFull: boolean;

	/* readonly */ playbackLikelyToKeepUp: boolean;

	preferredForwardBufferDuration: number;

	preferredPeakBitRate: number;

	/* readonly */ presentationSize: CGSize;

	reversePlaybackEndTime: CMTime;

	/* readonly */ seekableTimeRanges: NSArray<NSValue>;

	seekingWaitsForVideoCompositionRendering: boolean;

	/* readonly */ status: AVPlayerItemStatus;

	textStyleRules: NSArray<AVTextStyleRule>;

	/* readonly */ timebase: any;

	/* readonly */ timedMetadata: NSArray<AVMetadataItem>;

	/* readonly */ tracks: NSArray<AVPlayerItemTrack>;

	videoComposition: AVVideoComposition;

	constructor(o: { asset: AVAsset; });

	constructor(o: { asset: AVAsset; automaticallyLoadedAssetKeys: NSArray<string>; });

	constructor(o: { URL: NSURL; });

	accessLog(): AVPlayerItemAccessLog;

	addMediaDataCollector(collector: AVPlayerItemMediaDataCollector): void;

	addOutput(output: AVPlayerItemOutput): void;

	cancelPendingSeeks(): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	currentDate(): Date;

	currentTime(): CMTime;

	errorLog(): AVPlayerItemErrorLog;

	initWithAsset(asset: AVAsset): this;

	initWithAssetAutomaticallyLoadedAssetKeys(asset: AVAsset, automaticallyLoadedAssetKeys: NSArray<string>): this;

	initWithURL(URL: NSURL): this;

	removeMediaDataCollector(collector: AVPlayerItemMediaDataCollector): void;

	removeOutput(output: AVPlayerItemOutput): void;

	seekToDate(date: Date): boolean;

	seekToDateCompletionHandler(date: Date, completionHandler: (p1: boolean) => void): boolean;

	seekToTime(time: CMTime): void;

	seekToTimeCompletionHandler(time: CMTime, completionHandler: (p1: boolean) => void): void;

	seekToTimeToleranceBeforeToleranceAfter(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime): void;

	seekToTimeToleranceBeforeToleranceAfterCompletionHandler(time: CMTime, toleranceBefore: CMTime, toleranceAfter: CMTime, completionHandler: (p1: boolean) => void): void;

	selectMediaOptionAutomaticallyInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): void;

	selectMediaOptionInMediaSelectionGroup(mediaSelectionOption: AVMediaSelectionOption, mediaSelectionGroup: AVMediaSelectionGroup): void;

	selectedMediaOptionInMediaSelectionGroup(mediaSelectionGroup: AVMediaSelectionGroup): AVMediaSelectionOption;

	stepByCount(stepCount: number): void;
}

declare class AVPlayerItemAccessLog extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemAccessLog; // inherited from NSObject

	static new(): AVPlayerItemAccessLog; // inherited from NSObject

	/* readonly */ events: NSArray<AVPlayerItemAccessLogEvent>;

	/* readonly */ extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	extendedLogData(): NSData;
}

declare class AVPlayerItemAccessLogEvent extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemAccessLogEvent; // inherited from NSObject

	static new(): AVPlayerItemAccessLogEvent; // inherited from NSObject

	/* readonly */ URI: string;

	/* readonly */ averageAudioBitrate: number;

	/* readonly */ averageVideoBitrate: number;

	/* readonly */ downloadOverdue: number;

	/* readonly */ durationWatched: number;

	/* readonly */ indicatedAverageBitrate: number;

	/* readonly */ indicatedBitrate: number;

	/* readonly */ mediaRequestsWWAN: number;

	/* readonly */ numberOfBytesTransferred: number;

	/* readonly */ numberOfDroppedVideoFrames: number;

	/* readonly */ numberOfMediaRequests: number;

	/* readonly */ numberOfSegmentsDownloaded: number;

	/* readonly */ numberOfServerAddressChanges: number;

	/* readonly */ numberOfStalls: number;

	/* readonly */ observedBitrate: number;

	/* readonly */ observedBitrateStandardDeviation: number;

	/* readonly */ observedMaxBitrate: number;

	/* readonly */ observedMinBitrate: number;

	/* readonly */ playbackSessionID: string;

	/* readonly */ playbackStartDate: Date;

	/* readonly */ playbackStartOffset: number;

	/* readonly */ playbackType: string;

	/* readonly */ segmentsDownloadedDuration: number;

	/* readonly */ serverAddress: string;

	/* readonly */ startupTime: number;

	/* readonly */ switchBitrate: number;

	/* readonly */ transferDuration: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var AVPlayerItemDidPlayToEndTimeNotification: string;

declare class AVPlayerItemErrorLog extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemErrorLog; // inherited from NSObject

	static new(): AVPlayerItemErrorLog; // inherited from NSObject

	/* readonly */ events: NSArray<AVPlayerItemErrorLogEvent>;

	/* readonly */ extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	extendedLogData(): NSData;
}

declare class AVPlayerItemErrorLogEvent extends NSObject implements NSCopying {

	static alloc(): AVPlayerItemErrorLogEvent; // inherited from NSObject

	static new(): AVPlayerItemErrorLogEvent; // inherited from NSObject

	/* readonly */ URI: string;

	/* readonly */ date: Date;

	/* readonly */ errorComment: string;

	/* readonly */ errorDomain: string;

	/* readonly */ errorStatusCode: number;

	/* readonly */ playbackSessionID: string;

	/* readonly */ serverAddress: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var AVPlayerItemFailedToPlayToEndTimeErrorKey: string;

declare var AVPlayerItemFailedToPlayToEndTimeNotification: string;

declare class AVPlayerItemLegibleOutput extends AVPlayerItemOutput {

	static alloc(): AVPlayerItemLegibleOutput; // inherited from NSObject

	static new(): AVPlayerItemLegibleOutput; // inherited from NSObject

	advanceIntervalForDelegateInvocation: number;

	/* readonly */ delegate: AVPlayerItemLegibleOutputPushDelegate;

	/* readonly */ delegateQueue: NSObject;

	textStylingResolution: string;

	constructor(o: { mediaSubtypesForNativeRepresentation: NSArray<number>; });

	initWithMediaSubtypesForNativeRepresentation(subtypes: NSArray<number>): this;

	setDelegateQueue(delegate: AVPlayerItemLegibleOutputPushDelegate, delegateQueue: NSObject): void;
}

interface AVPlayerItemLegibleOutputPushDelegate extends AVPlayerItemOutputPushDelegate {

	legibleOutputDidOutputAttributedStringsNativeSampleBuffersForItemTime?(output: AVPlayerItemLegibleOutput, strings: NSArray<NSAttributedString>, nativeSamples: NSArray<any>, itemTime: CMTime): void;
}
declare var AVPlayerItemLegibleOutputPushDelegate: {

	prototype: AVPlayerItemLegibleOutputPushDelegate;
};

declare var AVPlayerItemLegibleOutputTextStylingResolutionDefault: string;

declare var AVPlayerItemLegibleOutputTextStylingResolutionSourceAndRulesOnly: string;

declare class AVPlayerItemMediaDataCollector extends NSObject {

	static alloc(): AVPlayerItemMediaDataCollector; // inherited from NSObject

	static new(): AVPlayerItemMediaDataCollector; // inherited from NSObject
}

declare class AVPlayerItemMetadataCollector extends AVPlayerItemMediaDataCollector {

	static alloc(): AVPlayerItemMetadataCollector; // inherited from NSObject

	static new(): AVPlayerItemMetadataCollector; // inherited from NSObject

	/* readonly */ delegate: AVPlayerItemMetadataCollectorPushDelegate;

	/* readonly */ delegateQueue: NSObject;

	constructor(o: { identifiers: NSArray<string>; classifyingLabels: NSArray<string>; });

	initWithIdentifiersClassifyingLabels(identifiers: NSArray<string>, classifyingLabels: NSArray<string>): this;

	setDelegateQueue(delegate: AVPlayerItemMetadataCollectorPushDelegate, delegateQueue: NSObject): void;
}

interface AVPlayerItemMetadataCollectorPushDelegate extends NSObjectProtocol {

	metadataCollectorDidCollectDateRangeMetadataGroupsIndexesOfNewGroupsIndexesOfModifiedGroups(metadataCollector: AVPlayerItemMetadataCollector, metadataGroups: NSArray<AVDateRangeMetadataGroup>, indexesOfNewGroups: NSIndexSet, indexesOfModifiedGroups: NSIndexSet): void;
}
declare var AVPlayerItemMetadataCollectorPushDelegate: {

	prototype: AVPlayerItemMetadataCollectorPushDelegate;
};

declare class AVPlayerItemMetadataOutput extends AVPlayerItemOutput {

	static alloc(): AVPlayerItemMetadataOutput; // inherited from NSObject

	static new(): AVPlayerItemMetadataOutput; // inherited from NSObject

	advanceIntervalForDelegateInvocation: number;

	/* readonly */ delegate: AVPlayerItemMetadataOutputPushDelegate;

	/* readonly */ delegateQueue: NSObject;

	constructor(o: { identifiers: NSArray<string>; });

	initWithIdentifiers(identifiers: NSArray<string>): this;

	setDelegateQueue(delegate: AVPlayerItemMetadataOutputPushDelegate, delegateQueue: NSObject): void;
}

interface AVPlayerItemMetadataOutputPushDelegate extends AVPlayerItemOutputPushDelegate {

	metadataOutputDidOutputTimedMetadataGroupsFromPlayerItemTrack?(output: AVPlayerItemMetadataOutput, groups: NSArray<AVTimedMetadataGroup>, track: AVPlayerItemTrack): void;
}
declare var AVPlayerItemMetadataOutputPushDelegate: {

	prototype: AVPlayerItemMetadataOutputPushDelegate;
};

declare var AVPlayerItemNewAccessLogEntryNotification: string;

declare var AVPlayerItemNewErrorLogEntryNotification: string;

declare class AVPlayerItemOutput extends NSObject {

	static alloc(): AVPlayerItemOutput; // inherited from NSObject

	static new(): AVPlayerItemOutput; // inherited from NSObject

	suppressesPlayerRendering: boolean;

	itemTimeForHostTime(hostTimeInSeconds: number): CMTime;

	itemTimeForMachAbsoluteTime(machAbsoluteTime: number): CMTime;
}

interface AVPlayerItemOutputPullDelegate extends NSObjectProtocol {

	outputMediaDataWillChange?(sender: AVPlayerItemOutput): void;

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

declare var AVPlayerItemPlaybackStalledNotification: string;

declare const enum AVPlayerItemStatus {

	Unknown = 0,

	ReadyToPlay = 1,

	Failed = 2
}

declare var AVPlayerItemTimeJumpedNotification: string;

declare class AVPlayerItemTrack extends NSObject {

	static alloc(): AVPlayerItemTrack; // inherited from NSObject

	static new(): AVPlayerItemTrack; // inherited from NSObject

	/* readonly */ assetTrack: AVAssetTrack;

	/* readonly */ currentVideoFrameRate: number;

	enabled: boolean;
}

declare class AVPlayerItemVideoOutput extends AVPlayerItemOutput {

	static alloc(): AVPlayerItemVideoOutput; // inherited from NSObject

	static new(): AVPlayerItemVideoOutput; // inherited from NSObject

	/* readonly */ delegate: AVPlayerItemOutputPullDelegate;

	/* readonly */ delegateQueue: NSObject;

	constructor(o: { outputSettings: NSDictionary<string, any>; });

	constructor(o: { pixelBufferAttributes: NSDictionary<string, any>; });

	copyPixelBufferForItemTimeItemTimeForDisplay(itemTime: CMTime, outItemTimeForDisplay: interop.Pointer | interop.Reference<CMTime>): any;

	hasNewPixelBufferForItemTime(itemTime: CMTime): boolean;

	initWithOutputSettings(outputSettings: NSDictionary<string, any>): this;

	initWithPixelBufferAttributes(pixelBufferAttributes: NSDictionary<string, any>): this;

	requestNotificationOfMediaDataChangeWithAdvanceInterval(interval: number): void;

	setDelegateQueue(delegate: AVPlayerItemOutputPullDelegate, delegateQueue: NSObject): void;
}

declare class AVPlayerLayer extends CALayer {

	static alloc(): AVPlayerLayer; // inherited from NSObject

	static layer(): AVPlayerLayer; // inherited from CALayer

	static new(): AVPlayerLayer; // inherited from NSObject

	static playerLayerWithPlayer(player: AVPlayer): AVPlayerLayer;

	pixelBufferAttributes: NSDictionary<string, any>;

	player: AVPlayer;

	/* readonly */ readyForDisplay: boolean;

	videoGravity: string;

	/* readonly */ videoRect: CGRect;
}

declare class AVPlayerLooper extends NSObject {

	static alloc(): AVPlayerLooper; // inherited from NSObject

	static new(): AVPlayerLooper; // inherited from NSObject

	static playerLooperWithPlayerTemplateItem(player: AVQueuePlayer, itemToLoop: AVPlayerItem): AVPlayerLooper;

	static playerLooperWithPlayerTemplateItemTimeRange(player: AVQueuePlayer, itemToLoop: AVPlayerItem, loopRange: CMTimeRange): AVPlayerLooper;

	/* readonly */ error: NSError;

	/* readonly */ loopCount: number;

	/* readonly */ loopingPlayerItems: NSArray<AVPlayerItem>;

	/* readonly */ status: AVPlayerLooperStatus;

	constructor(o: { player: AVQueuePlayer; templateItem: AVPlayerItem; timeRange: CMTimeRange; });

	disableLooping(): void;

	initWithPlayerTemplateItemTimeRange(player: AVQueuePlayer, itemToLoop: AVPlayerItem, loopRange: CMTimeRange): this;
}

declare const enum AVPlayerLooperStatus {

	Unknown = 0,

	Ready = 1,

	Failed = 2,

	Cancelled = 3
}

declare class AVPlayerMediaSelectionCriteria extends NSObject {

	static alloc(): AVPlayerMediaSelectionCriteria; // inherited from NSObject

	static new(): AVPlayerMediaSelectionCriteria; // inherited from NSObject

	/* readonly */ preferredLanguages: NSArray<string>;

	/* readonly */ preferredMediaCharacteristics: NSArray<string>;

	constructor(o: { preferredLanguages: NSArray<string>; preferredMediaCharacteristics: NSArray<string>; });

	initWithPreferredLanguagesPreferredMediaCharacteristics(preferredLanguages: NSArray<string>, preferredMediaCharacteristics: NSArray<string>): this;
}

declare const enum AVPlayerStatus {

	Unknown = 0,

	ReadyToPlay = 1,

	Failed = 2
}

declare const enum AVPlayerTimeControlStatus {

	Paused = 0,

	WaitingToPlayAtSpecifiedRate = 1,

	Playing = 2
}

declare var AVPlayerWaitingToMinimizeStallsReason: string;

declare var AVPlayerWaitingWhileEvaluatingBufferingRateReason: string;

declare var AVPlayerWaitingWithNoItemToPlayReason: string;

declare class AVQueuePlayer extends AVPlayer {

	static alloc(): AVQueuePlayer; // inherited from NSObject

	static new(): AVQueuePlayer; // inherited from NSObject

	static playerWithPlayerItem(item: AVPlayerItem): AVQueuePlayer; // inherited from AVPlayer

	static playerWithURL(URL: NSURL): AVQueuePlayer; // inherited from AVPlayer

	static queuePlayerWithItems(items: NSArray<AVPlayerItem>): AVQueuePlayer;

	constructor(o: { items: NSArray<AVPlayerItem>; });

	advanceToNextItem(): void;

	canInsertItemAfterItem(item: AVPlayerItem, afterItem: AVPlayerItem): boolean;

	initWithItems(items: NSArray<AVPlayerItem>): this;

	insertItemAfterItem(item: AVPlayerItem, afterItem: AVPlayerItem): void;

	items(): NSArray<AVPlayerItem>;

	removeAllItems(): void;

	removeItem(item: AVPlayerItem): void;
}

declare const enum AVQueuedSampleBufferRenderingStatus {

	Unknown = 0,

	Rendering = 1,

	Failed = 2
}

declare class AVSampleBufferDisplayLayer extends CALayer {

	static alloc(): AVSampleBufferDisplayLayer; // inherited from NSObject

	static layer(): AVSampleBufferDisplayLayer; // inherited from CALayer

	static new(): AVSampleBufferDisplayLayer; // inherited from NSObject

	controlTimebase: any;

	/* readonly */ error: NSError;

	/* readonly */ readyForMoreMediaData: boolean;

	/* readonly */ status: AVQueuedSampleBufferRenderingStatus;

	videoGravity: string;

	enqueueSampleBuffer(sampleBuffer: any): void;

	flush(): void;

	flushAndRemoveImage(): void;

	requestMediaDataWhenReadyOnQueueUsingBlock(queue: NSObject, block: () => void): void;

	stopRequestingMediaData(): void;
}

declare var AVSampleBufferDisplayLayerFailedToDecodeNotification: string;

declare var AVSampleBufferDisplayLayerFailedToDecodeNotificationErrorKey: string;

declare var AVSampleRateConverterAlgorithmKey: string;

declare var AVSampleRateConverterAlgorithm_Mastering: string;

declare var AVSampleRateConverterAlgorithm_MinimumPhase: string;

declare var AVSampleRateConverterAlgorithm_Normal: string;

declare var AVSampleRateConverterAudioQualityKey: string;

declare var AVSampleRateKey: string;

declare const enum AVSpeechBoundary {

	Immediate = 0,

	Word = 1
}

declare var AVSpeechSynthesisIPANotationAttribute: string;

declare class AVSpeechSynthesisVoice extends NSObject implements NSSecureCoding {

	static alloc(): AVSpeechSynthesisVoice; // inherited from NSObject

	static currentLanguageCode(): string;

	static new(): AVSpeechSynthesisVoice; // inherited from NSObject

	static speechVoices(): NSArray<AVSpeechSynthesisVoice>;

	static voiceWithIdentifier(identifier: string): AVSpeechSynthesisVoice;

	static voiceWithLanguage(languageCode: string): AVSpeechSynthesisVoice;

	/* readonly */ identifier: string;

	/* readonly */ language: string;

	/* readonly */ name: string;

	/* readonly */ quality: AVSpeechSynthesisVoiceQuality;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare var AVSpeechSynthesisVoiceIdentifierAlex: string;

declare const enum AVSpeechSynthesisVoiceQuality {

	Default = 1,

	Enhanced = 2
}

declare class AVSpeechSynthesizer extends NSObject {

	static alloc(): AVSpeechSynthesizer; // inherited from NSObject

	static new(): AVSpeechSynthesizer; // inherited from NSObject

	delegate: AVSpeechSynthesizerDelegate;

	outputChannels: NSArray<AVAudioSessionChannelDescription>;

	/* readonly */ paused: boolean;

	/* readonly */ speaking: boolean;

	continueSpeaking(): boolean;

	pauseSpeakingAtBoundary(boundary: AVSpeechBoundary): boolean;

	speakUtterance(utterance: AVSpeechUtterance): void;

	stopSpeakingAtBoundary(boundary: AVSpeechBoundary): boolean;
}

interface AVSpeechSynthesizerDelegate extends NSObjectProtocol {

	speechSynthesizerDidCancelSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidContinueSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidFinishSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidPauseSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerDidStartSpeechUtterance?(synthesizer: AVSpeechSynthesizer, utterance: AVSpeechUtterance): void;

	speechSynthesizerWillSpeakRangeOfSpeechStringUtterance?(synthesizer: AVSpeechSynthesizer, characterRange: NSRange, utterance: AVSpeechUtterance): void;
}
declare var AVSpeechSynthesizerDelegate: {

	prototype: AVSpeechSynthesizerDelegate;
};

declare class AVSpeechUtterance extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): AVSpeechUtterance; // inherited from NSObject

	static new(): AVSpeechUtterance; // inherited from NSObject

	static speechUtteranceWithAttributedString(string: NSAttributedString): AVSpeechUtterance;

	static speechUtteranceWithString(string: string): AVSpeechUtterance;

	/* readonly */ attributedSpeechString: NSAttributedString;

	pitchMultiplier: number;

	postUtteranceDelay: number;

	preUtteranceDelay: number;

	rate: number;

	/* readonly */ speechString: string;

	voice: AVSpeechSynthesisVoice;

	volume: number;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { attributedString: NSAttributedString; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { string: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithAttributedString(string: NSAttributedString): this;

	initWithCoder(aDecoder: NSCoder): this;

	initWithString(string: string): this;
}

declare var AVSpeechUtteranceDefaultSpeechRate: number;

declare var AVSpeechUtteranceMaximumSpeechRate: number;

declare var AVSpeechUtteranceMinimumSpeechRate: number;

declare var AVStreamingKeyDeliveryContentKeyType: string;

declare var AVStreamingKeyDeliveryPersistentContentKeyType: string;

declare class AVSynchronizedLayer extends CALayer {

	static alloc(): AVSynchronizedLayer; // inherited from NSObject

	static layer(): AVSynchronizedLayer; // inherited from CALayer

	static new(): AVSynchronizedLayer; // inherited from NSObject

	static synchronizedLayerWithPlayerItem(playerItem: AVPlayerItem): AVSynchronizedLayer;

	playerItem: AVPlayerItem;
}

declare class AVTextStyleRule extends NSObject implements NSCopying {

	static alloc(): AVTextStyleRule; // inherited from NSObject

	static new(): AVTextStyleRule; // inherited from NSObject

	static propertyListForTextStyleRules(textStyleRules: NSArray<AVTextStyleRule>): any;

	static textStyleRuleWithTextMarkupAttributes(textMarkupAttributes: NSDictionary<string, any>): AVTextStyleRule;

	static textStyleRuleWithTextMarkupAttributesTextSelector(textMarkupAttributes: NSDictionary<string, any>, textSelector: string): AVTextStyleRule;

	static textStyleRulesFromPropertyList(plist: any): NSArray<AVTextStyleRule>;

	/* readonly */ textMarkupAttributes: NSDictionary<string, any>;

	/* readonly */ textSelector: string;

	constructor(o: { textMarkupAttributes: NSDictionary<string, any>; });

	constructor(o: { textMarkupAttributes: NSDictionary<string, any>; textSelector: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTextMarkupAttributes(textMarkupAttributes: NSDictionary<string, any>): this;

	initWithTextMarkupAttributesTextSelector(textMarkupAttributes: NSDictionary<string, any>, textSelector: string): this;
}

declare class AVTimedMetadataGroup extends AVMetadataGroup implements NSCopying, NSMutableCopying {

	static alloc(): AVTimedMetadataGroup; // inherited from NSObject

	static new(): AVTimedMetadataGroup; // inherited from NSObject

	/* readonly */ timeRange: CMTimeRange;

	constructor(o: { items: NSArray<AVMetadataItem>; timeRange: CMTimeRange; });

	constructor(o: { sampleBuffer: any; });

	copyFormatDescription(): any;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithItemsTimeRange(items: NSArray<AVMetadataItem>, timeRange: CMTimeRange): this;

	initWithSampleBuffer(sampleBuffer: any): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var AVTrackAssociationTypeAudioFallback: string;

declare var AVTrackAssociationTypeChapterList: string;

declare var AVTrackAssociationTypeForcedSubtitlesOnly: string;

declare var AVTrackAssociationTypeMetadataReferent: string;

declare var AVTrackAssociationTypeSelectionFollower: string;

declare var AVTrackAssociationTypeTimecode: string;

declare class AVURLAsset extends AVAsset {

	static URLAssetWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): AVURLAsset;

	static alloc(): AVURLAsset; // inherited from NSObject

	static assetWithURL(URL: NSURL): AVURLAsset; // inherited from AVAsset

	static audiovisualMIMETypes(): NSArray<string>;

	static audiovisualTypes(): NSArray<string>;

	static isPlayableExtendedMIMEType(extendedMIMEType: string): boolean;

	static new(): AVURLAsset; // inherited from NSObject

	/* readonly */ URL: NSURL;

	/* readonly */ assetCache: AVAssetCache;

	/* readonly */ resourceLoader: AVAssetResourceLoader;

	constructor(o: { URL: NSURL; options: NSDictionary<string, any>; });

	compatibleTrackForCompositionTrack(compositionTrack: AVCompositionTrack): AVAssetTrack;

	initWithURLOptions(URL: NSURL, options: NSDictionary<string, any>): this;
}

declare var AVURLAssetAllowsCellularAccessKey: string;

declare var AVURLAssetHTTPCookiesKey: string;

declare var AVURLAssetPreferPreciseDurationAndTimingKey: string;

declare var AVURLAssetReferenceRestrictionsKey: string;

declare var AVVideoAllowFrameReorderingKey: string;

declare var AVVideoAllowWideColorKey: string;

declare var AVVideoAverageBitRateKey: string;

declare var AVVideoAverageNonDroppableFrameRateKey: string;

declare var AVVideoCleanApertureHeightKey: string;

declare var AVVideoCleanApertureHorizontalOffsetKey: string;

declare var AVVideoCleanApertureKey: string;

declare var AVVideoCleanApertureVerticalOffsetKey: string;

declare var AVVideoCleanApertureWidthKey: string;

declare var AVVideoCodecH264: string;

declare var AVVideoCodecJPEG: string;

declare var AVVideoCodecKey: string;

declare var AVVideoColorPrimariesKey: string;

declare var AVVideoColorPrimaries_ITU_R_709_2: string;

declare var AVVideoColorPrimaries_P3_D65: string;

declare var AVVideoColorPrimaries_SMPTE_C: string;

declare var AVVideoColorPropertiesKey: string;

interface AVVideoCompositing extends NSObjectProtocol {

	requiredPixelBufferAttributesForRenderContext: NSDictionary<string, any>;

	sourcePixelBufferAttributes: NSDictionary<string, any>;

	supportsWideColorSourceFrames?: boolean;

	cancelAllPendingVideoCompositionRequests?(): void;

	renderContextChanged(newRenderContext: AVVideoCompositionRenderContext): void;

	startVideoCompositionRequest(asyncVideoCompositionRequest: AVAsynchronousVideoCompositionRequest): void;
}
declare var AVVideoCompositing: {

	prototype: AVVideoCompositing;
};

declare class AVVideoComposition extends NSObject implements NSCopying, NSMutableCopying {

	static alloc(): AVVideoComposition; // inherited from NSObject

	static new(): AVVideoComposition; // inherited from NSObject

	static videoCompositionWithAssetApplyingCIFiltersWithHandler(asset: AVAsset, applier: (p1: AVAsynchronousCIImageFilteringRequest) => void): AVVideoComposition;

	static videoCompositionWithPropertiesOfAsset(asset: AVAsset): AVVideoComposition;

	/* readonly */ animationTool: AVVideoCompositionCoreAnimationTool;

	/* readonly */ colorPrimaries: string;

	/* readonly */ colorTransferFunction: string;

	/* readonly */ colorYCbCrMatrix: string;

	/* readonly */ customVideoCompositorClass: typeof NSObject;

	/* readonly */ frameDuration: CMTime;

	/* readonly */ instructions: NSArray<AVVideoCompositionInstructionProtocol>;

	/* readonly */ renderScale: number;

	/* readonly */ renderSize: CGSize;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	isValidForAssetTimeRangeValidationDelegate(asset: AVAsset, timeRange: CMTimeRange, validationDelegate: AVVideoCompositionValidationHandling): boolean;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class AVVideoCompositionCoreAnimationTool extends NSObject {

	static alloc(): AVVideoCompositionCoreAnimationTool; // inherited from NSObject

	static new(): AVVideoCompositionCoreAnimationTool; // inherited from NSObject

	static videoCompositionCoreAnimationToolWithAdditionalLayerAsTrackID(layer: CALayer, trackID: number): AVVideoCompositionCoreAnimationTool;

	static videoCompositionCoreAnimationToolWithPostProcessingAsVideoLayerInLayer(videoLayer: CALayer, animationLayer: CALayer): AVVideoCompositionCoreAnimationTool;

	static videoCompositionCoreAnimationToolWithPostProcessingAsVideoLayersInLayer(videoLayers: NSArray<CALayer>, animationLayer: CALayer): AVVideoCompositionCoreAnimationTool;
}

declare class AVVideoCompositionInstruction extends NSObject implements AVVideoCompositionInstructionProtocol, NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): AVVideoCompositionInstruction; // inherited from NSObject

	static new(): AVVideoCompositionInstruction; // inherited from NSObject

	/* readonly */ backgroundColor: any;

	/* readonly */ layerInstructions: NSArray<AVVideoCompositionLayerInstruction>;

	/* readonly */ containsTweening: boolean; // inherited from AVVideoCompositionInstructionProtocol

	/* readonly */ debugDescription: string; // inherited from NSObjectProtocol

	/* readonly */ description: string; // inherited from NSObjectProtocol

	/* readonly */ enablePostProcessing: boolean; // inherited from AVVideoCompositionInstructionProtocol

	/* readonly */ hash: number; // inherited from NSObjectProtocol

	/* readonly */ isProxy: boolean; // inherited from NSObjectProtocol

	/* readonly */ passthroughTrackID: number; // inherited from AVVideoCompositionInstructionProtocol

	/* readonly */ requiredSourceTrackIDs: NSArray<NSValue>; // inherited from AVVideoCompositionInstructionProtocol

	/* readonly */ superclass: typeof NSObject; // inherited from NSObjectProtocol

	/* readonly */ timeRange: CMTimeRange; // inherited from AVVideoCompositionInstructionProtocol

	/* readonly */  // inherited from NSObjectProtocol

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

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

interface AVVideoCompositionInstructionProtocol extends NSObjectProtocol {

	containsTweening: boolean;

	enablePostProcessing: boolean;

	passthroughTrackID: number;

	requiredSourceTrackIDs: NSArray<NSValue>;

	timeRange: CMTimeRange;
}
declare var AVVideoCompositionInstructionProtocol: {

	prototype: AVVideoCompositionInstructionProtocol;
};

declare class AVVideoCompositionLayerInstruction extends NSObject implements NSCopying, NSMutableCopying, NSSecureCoding {

	static alloc(): AVVideoCompositionLayerInstruction; // inherited from NSObject

	static new(): AVVideoCompositionLayerInstruction; // inherited from NSObject

	/* readonly */ trackID: number;

	/* readonly */ static supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	getCropRectangleRampForTimeStartCropRectangleEndCropRectangleTimeRange(time: CMTime, startCropRectangle: interop.Pointer | interop.Reference<CGRect>, endCropRectangle: interop.Pointer | interop.Reference<CGRect>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	getOpacityRampForTimeStartOpacityEndOpacityTimeRange(time: CMTime, startOpacity: interop.Pointer | interop.Reference<number>, endOpacity: interop.Pointer | interop.Reference<number>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	getTransformRampForTimeStartTransformEndTransformTimeRange(time: CMTime, startTransform: interop.Pointer | interop.Reference<CGAffineTransform>, endTransform: interop.Pointer | interop.Reference<CGAffineTransform>, timeRange: interop.Pointer | interop.Reference<CMTimeRange>): boolean;

	initWithCoder(aDecoder: NSCoder): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class AVVideoCompositionRenderContext extends NSObject {

	static alloc(): AVVideoCompositionRenderContext; // inherited from NSObject

	static new(): AVVideoCompositionRenderContext; // inherited from NSObject

	/* readonly */ edgeWidths: AVEdgeWidths;

	/* readonly */ highQualityRendering: boolean;

	/* readonly */ pixelAspectRatio: AVPixelAspectRatio;

	/* readonly */ renderScale: number;

	/* readonly */ renderTransform: CGAffineTransform;

	/* readonly */ size: CGSize;

	/* readonly */ videoComposition: AVVideoComposition;

	newPixelBuffer(): any;
}

interface AVVideoCompositionValidationHandling extends NSObjectProtocol {

	videoCompositionShouldContinueValidatingAfterFindingEmptyTimeRange?(videoComposition: AVVideoComposition, timeRange: CMTimeRange): boolean;

	videoCompositionShouldContinueValidatingAfterFindingInvalidTimeRangeInInstruction?(videoComposition: AVVideoComposition, videoCompositionInstruction: AVVideoCompositionInstructionProtocol): boolean;

	videoCompositionShouldContinueValidatingAfterFindingInvalidTrackIDInInstructionLayerInstructionAsset?(videoComposition: AVVideoComposition, videoCompositionInstruction: AVVideoCompositionInstructionProtocol, layerInstruction: AVVideoCompositionLayerInstruction, asset: AVAsset): boolean;

	videoCompositionShouldContinueValidatingAfterFindingInvalidValueForKey?(videoComposition: AVVideoComposition, key: string): boolean;
}
declare var AVVideoCompositionValidationHandling: {

	prototype: AVVideoCompositionValidationHandling;
};

declare var AVVideoCompressionPropertiesKey: string;

declare var AVVideoExpectedSourceFrameRateKey: string;

declare var AVVideoH264EntropyModeCABAC: string;

declare var AVVideoH264EntropyModeCAVLC: string;

declare var AVVideoH264EntropyModeKey: string;

declare var AVVideoHeightKey: string;

declare var AVVideoMaxKeyFrameIntervalDurationKey: string;

declare var AVVideoMaxKeyFrameIntervalKey: string;

declare var AVVideoPixelAspectRatioHorizontalSpacingKey: string;

declare var AVVideoPixelAspectRatioKey: string;

declare var AVVideoPixelAspectRatioVerticalSpacingKey: string;

declare var AVVideoProfileLevelH264Baseline30: string;

declare var AVVideoProfileLevelH264Baseline31: string;

declare var AVVideoProfileLevelH264Baseline41: string;

declare var AVVideoProfileLevelH264BaselineAutoLevel: string;

declare var AVVideoProfileLevelH264High40: string;

declare var AVVideoProfileLevelH264High41: string;

declare var AVVideoProfileLevelH264HighAutoLevel: string;

declare var AVVideoProfileLevelH264Main30: string;

declare var AVVideoProfileLevelH264Main31: string;

declare var AVVideoProfileLevelH264Main32: string;

declare var AVVideoProfileLevelH264Main41: string;

declare var AVVideoProfileLevelH264MainAutoLevel: string;

declare var AVVideoProfileLevelKey: string;

declare var AVVideoQualityKey: string;

declare var AVVideoScalingModeFit: string;

declare var AVVideoScalingModeKey: string;

declare var AVVideoScalingModeResize: string;

declare var AVVideoScalingModeResizeAspect: string;

declare var AVVideoScalingModeResizeAspectFill: string;

declare var AVVideoTransferFunctionKey: string;

declare var AVVideoTransferFunction_ITU_R_709_2: string;

declare var AVVideoWidthKey: string;

declare var AVVideoYCbCrMatrixKey: string;

declare var AVVideoYCbCrMatrix_ITU_R_601_4: string;

declare var AVVideoYCbCrMatrix_ITU_R_709_2: string;
