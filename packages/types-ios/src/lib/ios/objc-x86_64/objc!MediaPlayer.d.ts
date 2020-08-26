
declare class MPChangeLanguageOptionCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangeLanguageOptionCommandEvent; // inherited from NSObject

	static new(): MPChangeLanguageOptionCommandEvent; // inherited from NSObject

	readonly languageOption: MPNowPlayingInfoLanguageOption;

	readonly setting: MPChangeLanguageOptionSetting;
}

declare const enum MPChangeLanguageOptionSetting {

	None = 0,

	NowPlayingItemOnly = 1,

	Permanent = 2
}

declare class MPChangePlaybackPositionCommand extends MPRemoteCommand {

	static alloc(): MPChangePlaybackPositionCommand; // inherited from NSObject

	static new(): MPChangePlaybackPositionCommand; // inherited from NSObject
}

declare class MPChangePlaybackPositionCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangePlaybackPositionCommandEvent; // inherited from NSObject

	static new(): MPChangePlaybackPositionCommandEvent; // inherited from NSObject

	readonly positionTime: number;
}

declare class MPChangePlaybackRateCommand extends MPRemoteCommand {

	static alloc(): MPChangePlaybackRateCommand; // inherited from NSObject

	static new(): MPChangePlaybackRateCommand; // inherited from NSObject

	supportedPlaybackRates: NSArray<number>;
}

declare class MPChangePlaybackRateCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangePlaybackRateCommandEvent; // inherited from NSObject

	static new(): MPChangePlaybackRateCommandEvent; // inherited from NSObject

	readonly playbackRate: number;
}

declare class MPChangeRepeatModeCommand extends MPRemoteCommand {

	static alloc(): MPChangeRepeatModeCommand; // inherited from NSObject

	static new(): MPChangeRepeatModeCommand; // inherited from NSObject

	currentRepeatType: MPRepeatType;
}

declare class MPChangeRepeatModeCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangeRepeatModeCommandEvent; // inherited from NSObject

	static new(): MPChangeRepeatModeCommandEvent; // inherited from NSObject

	readonly preservesRepeatMode: boolean;

	readonly repeatType: MPRepeatType;
}

declare class MPChangeShuffleModeCommand extends MPRemoteCommand {

	static alloc(): MPChangeShuffleModeCommand; // inherited from NSObject

	static new(): MPChangeShuffleModeCommand; // inherited from NSObject

	currentShuffleType: MPShuffleType;
}

declare class MPChangeShuffleModeCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangeShuffleModeCommandEvent; // inherited from NSObject

	static new(): MPChangeShuffleModeCommandEvent; // inherited from NSObject

	readonly preservesShuffleMode: boolean;

	readonly shuffleType: MPShuffleType;
}

declare class MPContentItem extends NSObject {

	static alloc(): MPContentItem; // inherited from NSObject

	static new(): MPContentItem; // inherited from NSObject

	artwork: MPMediaItemArtwork;

	container: boolean;

	explicitContent: boolean;

	readonly identifier: string;

	playable: boolean;

	playbackProgress: number;

	streamingContent: boolean;

	subtitle: string;

	title: string;

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

declare const enum MPErrorCode {

	Unknown = 0,

	PermissionDenied = 1,

	CloudServiceCapabilityMissing = 2,

	NetworkConnectionFailed = 3,

	NotFound = 4,

	NotSupported = 5,

	Cancelled = 6,

	RequestTimedOut = 7
}

declare var MPErrorDomain: string;

declare class MPFeedbackCommand extends MPRemoteCommand {

	static alloc(): MPFeedbackCommand; // inherited from NSObject

	static new(): MPFeedbackCommand; // inherited from NSObject

	active: boolean;

	localizedShortTitle: string;

	localizedTitle: string;
}

declare class MPFeedbackCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPFeedbackCommandEvent; // inherited from NSObject

	static new(): MPFeedbackCommandEvent; // inherited from NSObject

	readonly negative: boolean;
}

declare var MPLanguageOptionCharacteristicContainsOnlyForcedSubtitles: string;

declare var MPLanguageOptionCharacteristicDescribesMusicAndSound: string;

declare var MPLanguageOptionCharacteristicDescribesVideo: string;

declare var MPLanguageOptionCharacteristicDubbedTranslation: string;

declare var MPLanguageOptionCharacteristicEasyToRead: string;

declare var MPLanguageOptionCharacteristicIsAuxiliaryContent: string;

declare var MPLanguageOptionCharacteristicIsMainProgramContent: string;

declare var MPLanguageOptionCharacteristicLanguageTranslation: string;

declare var MPLanguageOptionCharacteristicTranscribesSpokenDialog: string;

declare var MPLanguageOptionCharacteristicVoiceOverTranslation: string;

declare class MPMediaEntity extends NSObject implements NSSecureCoding {

	static alloc(): MPMediaEntity; // inherited from NSObject

	static canFilterByProperty(property: string): boolean;

	static new(): MPMediaEntity; // inherited from NSObject

	readonly persistentID: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	enumerateValuesForPropertiesUsingBlock(properties: NSSet<string>, block: (p1: string, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	initWithCoder(coder: NSCoder): this;

	objectForKeyedSubscript(key: any): any;

	valueForProperty(property: string): any;
}

declare var MPMediaEntityPropertyPersistentID: string;

declare const enum MPMediaGrouping {

	Title = 0,

	Album = 1,

	Artist = 2,

	AlbumArtist = 3,

	Composer = 4,

	Genre = 5,

	Playlist = 6,

	PodcastTitle = 7
}

declare class MPMediaItem extends MPMediaEntity {

	static alloc(): MPMediaItem; // inherited from NSObject

	static new(): MPMediaItem; // inherited from NSObject

	static persistentIDPropertyForGroupingType(groupingType: MPMediaGrouping): string;

	static titlePropertyForGroupingType(groupingType: MPMediaGrouping): string;

	readonly albumArtist: string;

	readonly albumArtistPersistentID: number;

	readonly albumPersistentID: number;

	readonly albumTitle: string;

	readonly albumTrackCount: number;

	readonly albumTrackNumber: number;

	readonly artist: string;

	readonly artistPersistentID: number;

	readonly artwork: MPMediaItemArtwork;

	readonly assetURL: NSURL;

	readonly beatsPerMinute: number;

	readonly bookmarkTime: number;

	readonly cloudItem: boolean;

	readonly comments: string;

	readonly compilation: boolean;

	readonly composer: string;

	readonly composerPersistentID: number;

	readonly dateAdded: Date;

	readonly discCount: number;

	readonly discNumber: number;

	readonly explicitItem: boolean;

	readonly genre: string;

	readonly genrePersistentID: number;

	readonly lastPlayedDate: Date;

	readonly lyrics: string;

	readonly mediaType: MPMediaType;

	readonly playCount: number;

	readonly playbackDuration: number;

	readonly playbackStoreID: string;

	readonly podcastPersistentID: number;

	readonly podcastTitle: string;

	readonly protectedAsset: boolean;

	readonly rating: number;

	readonly releaseDate: Date;

	readonly skipCount: number;

	readonly title: string;

	readonly userGrouping: string;
}

declare class MPMediaItemArtwork extends NSObject {

	static alloc(): MPMediaItemArtwork; // inherited from NSObject

	static new(): MPMediaItemArtwork; // inherited from NSObject

	readonly bounds: CGRect;

	readonly imageCropRect: CGRect;

	constructor(o: { boundsSize: CGSize; requestHandler: (p1: CGSize) => UIImage; });

	constructor(o: { image: UIImage; });

	imageWithSize(size: CGSize): UIImage;

	initWithBoundsSizeRequestHandler(boundsSize: CGSize, requestHandler: (p1: CGSize) => UIImage): this;

	initWithImage(image: UIImage): this;
}

declare class MPMediaItemCollection extends MPMediaEntity {

	static alloc(): MPMediaItemCollection; // inherited from NSObject

	static collectionWithItems(items: NSArray<MPMediaItem> | MPMediaItem[]): MPMediaItemCollection;

	static new(): MPMediaItemCollection; // inherited from NSObject

	readonly count: number;

	readonly items: NSArray<MPMediaItem>;

	readonly mediaTypes: MPMediaType;

	readonly representativeItem: MPMediaItem;

	constructor(o: { items: NSArray<MPMediaItem> | MPMediaItem[]; });

	initWithItems(items: NSArray<MPMediaItem> | MPMediaItem[]): this;
}

declare var MPMediaItemPropertyAlbumArtist: string;

declare var MPMediaItemPropertyAlbumArtistPersistentID: string;

declare var MPMediaItemPropertyAlbumPersistentID: string;

declare var MPMediaItemPropertyAlbumTitle: string;

declare var MPMediaItemPropertyAlbumTrackCount: string;

declare var MPMediaItemPropertyAlbumTrackNumber: string;

declare var MPMediaItemPropertyArtist: string;

declare var MPMediaItemPropertyArtistPersistentID: string;

declare var MPMediaItemPropertyArtwork: string;

declare var MPMediaItemPropertyAssetURL: string;

declare var MPMediaItemPropertyBeatsPerMinute: string;

declare var MPMediaItemPropertyBookmarkTime: string;

declare var MPMediaItemPropertyComments: string;

declare var MPMediaItemPropertyComposer: string;

declare var MPMediaItemPropertyComposerPersistentID: string;

declare var MPMediaItemPropertyDateAdded: string;

declare var MPMediaItemPropertyDiscCount: string;

declare var MPMediaItemPropertyDiscNumber: string;

declare var MPMediaItemPropertyGenre: string;

declare var MPMediaItemPropertyGenrePersistentID: string;

declare var MPMediaItemPropertyHasProtectedAsset: string;

declare var MPMediaItemPropertyIsCloudItem: string;

declare var MPMediaItemPropertyIsCompilation: string;

declare var MPMediaItemPropertyIsExplicit: string;

declare var MPMediaItemPropertyLastPlayedDate: string;

declare var MPMediaItemPropertyLyrics: string;

declare var MPMediaItemPropertyMediaType: string;

declare var MPMediaItemPropertyPersistentID: string;

declare var MPMediaItemPropertyPlayCount: string;

declare var MPMediaItemPropertyPlaybackDuration: string;

declare var MPMediaItemPropertyPlaybackStoreID: string;

declare var MPMediaItemPropertyPodcastPersistentID: string;

declare var MPMediaItemPropertyPodcastTitle: string;

declare var MPMediaItemPropertyRating: string;

declare var MPMediaItemPropertyReleaseDate: string;

declare var MPMediaItemPropertySkipCount: string;

declare var MPMediaItemPropertyTitle: string;

declare var MPMediaItemPropertyUserGrouping: string;

declare class MPMediaLibrary extends NSObject implements NSSecureCoding {

	static alloc(): MPMediaLibrary; // inherited from NSObject

	static authorizationStatus(): MPMediaLibraryAuthorizationStatus;

	static defaultMediaLibrary(): MPMediaLibrary;

	static new(): MPMediaLibrary; // inherited from NSObject

	static requestAuthorization(handler: (p1: MPMediaLibraryAuthorizationStatus) => void): void;

	readonly lastModifiedDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addItemWithProductIDCompletionHandler(productID: string, completionHandler: (p1: NSArray<MPMediaEntity>, p2: NSError) => void): void;

	beginGeneratingLibraryChangeNotifications(): void;

	encodeWithCoder(coder: NSCoder): void;

	endGeneratingLibraryChangeNotifications(): void;

	getPlaylistWithUUIDCreationMetadataCompletionHandler(uuid: NSUUID, creationMetadata: MPMediaPlaylistCreationMetadata, completionHandler: (p1: MPMediaPlaylist, p2: NSError) => void): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum MPMediaLibraryAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Restricted = 2,

	Authorized = 3
}

declare var MPMediaLibraryDidChangeNotification: string;

declare class MPMediaPickerController extends UIViewController {

	static alloc(): MPMediaPickerController; // inherited from NSObject

	static new(): MPMediaPickerController; // inherited from NSObject

	allowsPickingMultipleItems: boolean;

	delegate: MPMediaPickerControllerDelegate;

	readonly mediaTypes: MPMediaType;

	prompt: string;

	showsCloudItems: boolean;

	showsItemsWithProtectedAssets: boolean;

	constructor(o: { mediaTypes: MPMediaType; });

	initWithMediaTypes(mediaTypes: MPMediaType): this;
}

interface MPMediaPickerControllerDelegate extends NSObjectProtocol {

	mediaPickerDidCancel?(mediaPicker: MPMediaPickerController): void;

	mediaPickerDidPickMediaItems?(mediaPicker: MPMediaPickerController, mediaItemCollection: MPMediaItemCollection): void;
}
declare var MPMediaPickerControllerDelegate: {

	prototype: MPMediaPickerControllerDelegate;
};

interface MPMediaPlayback {

	currentPlaybackRate: number;

	currentPlaybackTime: number;

	isPreparedToPlay: boolean;

	beginSeekingBackward(): void;

	beginSeekingForward(): void;

	endSeeking(): void;

	pause(): void;

	play(): void;

	prepareToPlay(): void;

	stop(): void;
}
declare var MPMediaPlayback: {

	prototype: MPMediaPlayback;
};

declare var MPMediaPlaybackIsPreparedToPlayDidChangeNotification: string;

declare class MPMediaPlaylist extends MPMediaItemCollection {

	static alloc(): MPMediaPlaylist; // inherited from NSObject

	static new(): MPMediaPlaylist; // inherited from NSObject

	readonly authorDisplayName: string;

	readonly descriptionText: string;

	readonly name: string;

	readonly playlistAttributes: MPMediaPlaylistAttribute;

	readonly seedItems: NSArray<MPMediaItem>;

	addItemWithProductIDCompletionHandler(productID: string, completionHandler: (p1: NSError) => void): void;

	addMediaItemsCompletionHandler(mediaItems: NSArray<MPMediaItem> | MPMediaItem[], completionHandler: (p1: NSError) => void): void;
}

declare const enum MPMediaPlaylistAttribute {

	None = 0,

	OnTheGo = 1,

	Smart = 2,

	Genius = 4
}

declare class MPMediaPlaylistCreationMetadata extends NSObject {

	static alloc(): MPMediaPlaylistCreationMetadata; // inherited from NSObject

	static new(): MPMediaPlaylistCreationMetadata; // inherited from NSObject

	authorDisplayName: string;

	descriptionText: string;

	readonly name: string;

	constructor(o: { name: string; });

	initWithName(name: string): this;
}

declare var MPMediaPlaylistPropertyAuthorDisplayName: string;

declare var MPMediaPlaylistPropertyDescriptionText: string;

declare var MPMediaPlaylistPropertyName: string;

declare var MPMediaPlaylistPropertyPersistentID: string;

declare var MPMediaPlaylistPropertyPlaylistAttributes: string;

declare var MPMediaPlaylistPropertySeedItems: string;

declare class MPMediaPredicate extends NSObject implements NSSecureCoding {

	static alloc(): MPMediaPredicate; // inherited from NSObject

	static new(): MPMediaPredicate; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum MPMediaPredicateComparison {

	EqualTo = 0,

	Contains = 1
}

declare class MPMediaPropertyPredicate extends MPMediaPredicate {

	static alloc(): MPMediaPropertyPredicate; // inherited from NSObject

	static new(): MPMediaPropertyPredicate; // inherited from NSObject

	static predicateWithValueForProperty(value: any, property: string): MPMediaPropertyPredicate;

	static predicateWithValueForPropertyComparisonType(value: any, property: string, comparisonType: MPMediaPredicateComparison): MPMediaPropertyPredicate;

	readonly comparisonType: MPMediaPredicateComparison;

	readonly property: string;

	readonly value: any;
}

declare class MPMediaQuery extends NSObject implements NSCopying, NSSecureCoding {

	static albumsQuery(): MPMediaQuery;

	static alloc(): MPMediaQuery; // inherited from NSObject

	static artistsQuery(): MPMediaQuery;

	static audiobooksQuery(): MPMediaQuery;

	static compilationsQuery(): MPMediaQuery;

	static composersQuery(): MPMediaQuery;

	static genresQuery(): MPMediaQuery;

	static new(): MPMediaQuery; // inherited from NSObject

	static playlistsQuery(): MPMediaQuery;

	static podcastsQuery(): MPMediaQuery;

	static songsQuery(): MPMediaQuery;

	readonly collectionSections: NSArray<MPMediaQuerySection>;

	readonly collections: NSArray<MPMediaItemCollection>;

	filterPredicates: NSSet<MPMediaPredicate>;

	groupingType: MPMediaGrouping;

	readonly itemSections: NSArray<MPMediaQuerySection>;

	readonly items: NSArray<MPMediaItem>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { filterPredicates: NSSet<MPMediaPredicate>; });

	addFilterPredicate(predicate: MPMediaPredicate): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithFilterPredicates(filterPredicates: NSSet<MPMediaPredicate>): this;

	removeFilterPredicate(predicate: MPMediaPredicate): void;
}

declare class MPMediaQuerySection extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): MPMediaQuerySection; // inherited from NSObject

	static new(): MPMediaQuerySection; // inherited from NSObject

	readonly range: NSRange;

	readonly title: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum MPMediaType {

	Music = 1,

	Podcast = 2,

	AudioBook = 4,

	AudioITunesU = 8,

	AnyAudio = 255,

	Movie = 256,

	TVShow = 512,

	VideoPodcast = 1024,

	MusicVideo = 2048,

	VideoITunesU = 4096,

	HomeVideo = 8192,

	AnyVideo = 65280,

	Any = -1
}

declare class MPMovieAccessLog extends NSObject implements NSCopying {

	static alloc(): MPMovieAccessLog; // inherited from NSObject

	static new(): MPMovieAccessLog; // inherited from NSObject

	readonly events: NSArray<any>;

	readonly extendedLogData: NSData;

	readonly extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class MPMovieAccessLogEvent extends NSObject implements NSCopying {

	static alloc(): MPMovieAccessLogEvent; // inherited from NSObject

	static new(): MPMovieAccessLogEvent; // inherited from NSObject

	readonly URI: string;

	readonly durationWatched: number;

	readonly indicatedBitrate: number;

	readonly numberOfBytesTransferred: number;

	readonly numberOfDroppedVideoFrames: number;

	readonly numberOfSegmentsDownloaded: number;

	readonly numberOfServerAddressChanges: number;

	readonly numberOfStalls: number;

	readonly observedBitrate: number;

	readonly playbackSessionID: string;

	readonly playbackStartDate: Date;

	readonly playbackStartOffset: number;

	readonly segmentsDownloadedDuration: number;

	readonly serverAddress: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum MPMovieControlStyle {

	None = 0,

	Embedded = 1,

	Fullscreen = 2,

	Default = 1
}

declare var MPMovieDurationAvailableNotification: string;

declare class MPMovieErrorLog extends NSObject implements NSCopying {

	static alloc(): MPMovieErrorLog; // inherited from NSObject

	static new(): MPMovieErrorLog; // inherited from NSObject

	readonly events: NSArray<any>;

	readonly extendedLogData: NSData;

	readonly extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class MPMovieErrorLogEvent extends NSObject implements NSCopying {

	static alloc(): MPMovieErrorLogEvent; // inherited from NSObject

	static new(): MPMovieErrorLogEvent; // inherited from NSObject

	readonly URI: string;

	readonly date: Date;

	readonly errorComment: string;

	readonly errorDomain: string;

	readonly errorStatusCode: number;

	readonly playbackSessionID: string;

	readonly serverAddress: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum MPMovieFinishReason {

	PlaybackEnded = 0,

	PlaybackError = 1,

	UserExited = 2
}

declare const enum MPMovieLoadState {

	Unknown = 0,

	Playable = 1,

	PlaythroughOK = 2,

	Stalled = 4
}

declare const enum MPMovieMediaTypeMask {

	None = 0,

	Video = 1,

	Audio = 2
}

declare var MPMovieMediaTypesAvailableNotification: string;

declare var MPMovieNaturalSizeAvailableNotification: string;

declare const enum MPMoviePlaybackState {

	Stopped = 0,

	Playing = 1,

	Paused = 2,

	Interrupted = 3,

	SeekingForward = 4,

	SeekingBackward = 5
}

declare class MPMoviePlayerController extends NSObject implements MPMediaPlayback {

	static alloc(): MPMoviePlayerController; // inherited from NSObject

	static new(): MPMoviePlayerController; // inherited from NSObject

	readonly accessLog: MPMovieAccessLog;

	readonly airPlayVideoActive: boolean;

	allowsAirPlay: boolean;

	readonly backgroundView: UIView;

	contentURL: NSURL;

	controlStyle: MPMovieControlStyle;

	readonly duration: number;

	endPlaybackTime: number;

	readonly errorLog: MPMovieErrorLog;

	fullscreen: boolean;

	initialPlaybackTime: number;

	readonly loadState: MPMovieLoadState;

	readonly movieMediaTypes: MPMovieMediaTypeMask;

	movieSourceType: MPMovieSourceType;

	readonly naturalSize: CGSize;

	readonly playableDuration: number;

	readonly playbackState: MPMoviePlaybackState;

	readonly readyForDisplay: boolean;

	repeatMode: MPMovieRepeatMode;

	scalingMode: MPMovieScalingMode;

	shouldAutoplay: boolean;

	readonly timedMetadata: NSArray<any>;

	useApplicationAudioSession: boolean;

	readonly view: UIView;

	currentPlaybackRate: number; // inherited from MPMediaPlayback

	currentPlaybackTime: number; // inherited from MPMediaPlayback

	readonly isPreparedToPlay: boolean; // inherited from MPMediaPlayback

	constructor(o: { contentURL: NSURL; });

	beginSeekingBackward(): void;

	beginSeekingForward(): void;

	cancelAllThumbnailImageRequests(): void;

	endSeeking(): void;

	initWithContentURL(url: NSURL): this;

	pause(): void;

	play(): void;

	prepareToPlay(): void;

	requestThumbnailImagesAtTimesTimeOption(playbackTimes: NSArray<any> | any[], option: MPMovieTimeOption): void;

	setFullscreenAnimated(fullscreen: boolean, animated: boolean): void;

	stop(): void;

	thumbnailImageAtTimeTimeOption(playbackTime: number, option: MPMovieTimeOption): UIImage;
}

declare var MPMoviePlayerDidEnterFullscreenNotification: string;

declare var MPMoviePlayerDidExitFullscreenNotification: string;

declare var MPMoviePlayerFullscreenAnimationCurveUserInfoKey: string;

declare var MPMoviePlayerFullscreenAnimationDurationUserInfoKey: string;

declare var MPMoviePlayerIsAirPlayVideoActiveDidChangeNotification: string;

declare var MPMoviePlayerLoadStateDidChangeNotification: string;

declare var MPMoviePlayerNowPlayingMovieDidChangeNotification: string;

declare var MPMoviePlayerPlaybackDidFinishNotification: string;

declare var MPMoviePlayerPlaybackDidFinishReasonUserInfoKey: string;

declare var MPMoviePlayerPlaybackStateDidChangeNotification: string;

declare var MPMoviePlayerReadyForDisplayDidChangeNotification: string;

declare var MPMoviePlayerScalingModeDidChangeNotification: string;

declare var MPMoviePlayerThumbnailErrorKey: string;

declare var MPMoviePlayerThumbnailImageKey: string;

declare var MPMoviePlayerThumbnailImageRequestDidFinishNotification: string;

declare var MPMoviePlayerThumbnailTimeKey: string;

declare var MPMoviePlayerTimedMetadataKeyDataType: string;

declare var MPMoviePlayerTimedMetadataKeyInfo: string;

declare var MPMoviePlayerTimedMetadataKeyLanguageCode: string;

declare var MPMoviePlayerTimedMetadataKeyMIMEType: string;

declare var MPMoviePlayerTimedMetadataKeyName: string;

declare var MPMoviePlayerTimedMetadataUpdatedNotification: string;

declare var MPMoviePlayerTimedMetadataUserInfoKey: string;

declare class MPMoviePlayerViewController extends UIViewController {

	static alloc(): MPMoviePlayerViewController; // inherited from NSObject

	static new(): MPMoviePlayerViewController; // inherited from NSObject

	readonly moviePlayer: MPMoviePlayerController;

	constructor(o: { contentURL: NSURL; });

	initWithContentURL(contentURL: NSURL): this;
}

declare var MPMoviePlayerWillEnterFullscreenNotification: string;

declare var MPMoviePlayerWillExitFullscreenNotification: string;

declare const enum MPMovieRepeatMode {

	None = 0,

	One = 1
}

declare const enum MPMovieScalingMode {

	None = 0,

	AspectFit = 1,

	AspectFill = 2,

	Fill = 3
}

declare const enum MPMovieSourceType {

	Unknown = 0,

	File = 1,

	Streaming = 2
}

declare var MPMovieSourceTypeAvailableNotification: string;

declare const enum MPMovieTimeOption {

	NearestKeyFrame = 0,

	Exact = 1
}

declare const enum MPMusicPlaybackState {

	Stopped = 0,

	Playing = 1,

	Paused = 2,

	Interrupted = 3,

	SeekingForward = 4,

	SeekingBackward = 5
}

declare class MPMusicPlayerApplicationController extends MPMusicPlayerController {

	static alloc(): MPMusicPlayerApplicationController; // inherited from NSObject

	static new(): MPMusicPlayerApplicationController; // inherited from NSObject

	performQueueTransactionCompletionHandler(queueTransaction: (p1: MPMusicPlayerControllerMutableQueue) => void, completionHandler: (p1: MPMusicPlayerControllerQueue, p2: NSError) => void): void;
}

declare class MPMusicPlayerController extends NSObject implements MPMediaPlayback {

	static alloc(): MPMusicPlayerController; // inherited from NSObject

	static new(): MPMusicPlayerController; // inherited from NSObject

	readonly indexOfNowPlayingItem: number;

	nowPlayingItem: MPMediaItem;

	readonly playbackState: MPMusicPlaybackState;

	repeatMode: MPMusicRepeatMode;

	shuffleMode: MPMusicShuffleMode;

	volume: number;

	static readonly applicationMusicPlayer: MPMusicPlayerController;

	static readonly applicationQueuePlayer: MPMusicPlayerApplicationController;

	static readonly iPodMusicPlayer: MPMusicPlayerController;

	static readonly systemMusicPlayer: MPMusicPlayerController;

	currentPlaybackRate: number; // inherited from MPMediaPlayback

	currentPlaybackTime: number; // inherited from MPMediaPlayback

	readonly isPreparedToPlay: boolean; // inherited from MPMediaPlayback

	appendQueueDescriptor(descriptor: MPMusicPlayerQueueDescriptor): void;

	beginGeneratingPlaybackNotifications(): void;

	beginSeekingBackward(): void;

	beginSeekingForward(): void;

	endGeneratingPlaybackNotifications(): void;

	endSeeking(): void;

	pause(): void;

	play(): void;

	prepareToPlay(): void;

	prepareToPlayWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	prependQueueDescriptor(descriptor: MPMusicPlayerQueueDescriptor): void;

	setQueueWithDescriptor(descriptor: MPMusicPlayerQueueDescriptor): void;

	setQueueWithItemCollection(itemCollection: MPMediaItemCollection): void;

	setQueueWithQuery(query: MPMediaQuery): void;

	setQueueWithStoreIDs(storeIDs: NSArray<string> | string[]): void;

	skipToBeginning(): void;

	skipToNextItem(): void;

	skipToPreviousItem(): void;

	stop(): void;
}

declare class MPMusicPlayerControllerMutableQueue extends MPMusicPlayerControllerQueue {

	static alloc(): MPMusicPlayerControllerMutableQueue; // inherited from NSObject

	static new(): MPMusicPlayerControllerMutableQueue; // inherited from NSObject

	insertQueueDescriptorAfterItem(queueDescriptor: MPMusicPlayerQueueDescriptor, afterItem: MPMediaItem): void;

	removeItem(item: MPMediaItem): void;
}

declare var MPMusicPlayerControllerNowPlayingItemDidChangeNotification: string;

declare var MPMusicPlayerControllerPlaybackStateDidChangeNotification: string;

declare class MPMusicPlayerControllerQueue extends NSObject {

	static alloc(): MPMusicPlayerControllerQueue; // inherited from NSObject

	static new(): MPMusicPlayerControllerQueue; // inherited from NSObject

	readonly items: NSArray<MPMediaItem>;
}

declare var MPMusicPlayerControllerQueueDidChangeNotification: string;

declare var MPMusicPlayerControllerVolumeDidChangeNotification: string;

declare class MPMusicPlayerMediaItemQueueDescriptor extends MPMusicPlayerQueueDescriptor {

	static alloc(): MPMusicPlayerMediaItemQueueDescriptor; // inherited from NSObject

	static new(): MPMusicPlayerMediaItemQueueDescriptor; // inherited from NSObject

	readonly itemCollection: MPMediaItemCollection;

	readonly query: MPMediaQuery;

	startItem: MPMediaItem;

	constructor(o: { itemCollection: MPMediaItemCollection; });

	constructor(o: { query: MPMediaQuery; });

	initWithItemCollection(itemCollection: MPMediaItemCollection): this;

	initWithQuery(query: MPMediaQuery): this;

	setEndTimeForItem(endTime: number, mediaItem: MPMediaItem): void;

	setStartTimeForItem(startTime: number, mediaItem: MPMediaItem): void;
}

declare class MPMusicPlayerPlayParameters extends NSObject {

	static alloc(): MPMusicPlayerPlayParameters; // inherited from NSObject

	static new(): MPMusicPlayerPlayParameters; // inherited from NSObject

	readonly dictionary: NSDictionary<string, any>;

	constructor(o: { dictionary: NSDictionary<string, any>; });

	initWithDictionary(dictionary: NSDictionary<string, any>): this;
}

declare class MPMusicPlayerPlayParametersQueueDescriptor extends MPMusicPlayerQueueDescriptor {

	static alloc(): MPMusicPlayerPlayParametersQueueDescriptor; // inherited from NSObject

	static new(): MPMusicPlayerPlayParametersQueueDescriptor; // inherited from NSObject

	playParametersQueue: NSArray<MPMusicPlayerPlayParameters>;

	startItemPlayParameters: MPMusicPlayerPlayParameters;

	constructor(o: { playParametersQueue: NSArray<MPMusicPlayerPlayParameters> | MPMusicPlayerPlayParameters[]; });

	initWithPlayParametersQueue(playParametersQueue: NSArray<MPMusicPlayerPlayParameters> | MPMusicPlayerPlayParameters[]): this;

	setEndTimeForItemWithPlayParameters(endTime: number, playParameters: MPMusicPlayerPlayParameters): void;

	setStartTimeForItemWithPlayParameters(startTime: number, playParameters: MPMusicPlayerPlayParameters): void;
}

declare class MPMusicPlayerQueueDescriptor extends NSObject {

	static alloc(): MPMusicPlayerQueueDescriptor; // inherited from NSObject

	static new(): MPMusicPlayerQueueDescriptor; // inherited from NSObject
}

declare class MPMusicPlayerStoreQueueDescriptor extends MPMusicPlayerQueueDescriptor {

	static alloc(): MPMusicPlayerStoreQueueDescriptor; // inherited from NSObject

	static new(): MPMusicPlayerStoreQueueDescriptor; // inherited from NSObject

	startItemID: string;

	storeIDs: NSArray<string>;

	constructor(o: { storeIDs: NSArray<string> | string[]; });

	initWithStoreIDs(storeIDs: NSArray<string> | string[]): this;

	setEndTimeForItemWithStoreID(endTime: number, storeID: string): void;

	setStartTimeForItemWithStoreID(startTime: number, storeID: string): void;
}

declare const enum MPMusicRepeatMode {

	Default = 0,

	None = 1,

	One = 2,

	All = 3
}

declare const enum MPMusicShuffleMode {

	Default = 0,

	Off = 1,

	Songs = 2,

	Albums = 3
}

declare class MPNowPlayingInfoCenter extends NSObject {

	static alloc(): MPNowPlayingInfoCenter; // inherited from NSObject

	static defaultCenter(): MPNowPlayingInfoCenter;

	static new(): MPNowPlayingInfoCenter; // inherited from NSObject

	nowPlayingInfo: NSDictionary<string, any>;

	playbackState: MPNowPlayingPlaybackState;
}

declare var MPNowPlayingInfoCollectionIdentifier: string;

declare class MPNowPlayingInfoLanguageOption extends NSObject {

	static alloc(): MPNowPlayingInfoLanguageOption; // inherited from NSObject

	static new(): MPNowPlayingInfoLanguageOption; // inherited from NSObject

	readonly displayName: string;

	readonly identifier: string;

	readonly languageOptionCharacteristics: NSArray<string>;

	readonly languageOptionType: MPNowPlayingInfoLanguageOptionType;

	readonly languageTag: string;

	constructor(o: { type: MPNowPlayingInfoLanguageOptionType; languageTag: string; characteristics: NSArray<string> | string[]; displayName: string; identifier: string; });

	initWithTypeLanguageTagCharacteristicsDisplayNameIdentifier(languageOptionType: MPNowPlayingInfoLanguageOptionType, languageTag: string, languageOptionCharacteristics: NSArray<string> | string[], displayName: string, identifier: string): this;

	isAutomaticAudibleLanguageOption(): boolean;

	isAutomaticLegibleLanguageOption(): boolean;
}

declare class MPNowPlayingInfoLanguageOptionGroup extends NSObject {

	static alloc(): MPNowPlayingInfoLanguageOptionGroup; // inherited from NSObject

	static new(): MPNowPlayingInfoLanguageOptionGroup; // inherited from NSObject

	readonly allowEmptySelection: boolean;

	readonly defaultLanguageOption: MPNowPlayingInfoLanguageOption;

	readonly languageOptions: NSArray<MPNowPlayingInfoLanguageOption>;

	constructor(o: { languageOptions: NSArray<MPNowPlayingInfoLanguageOption> | MPNowPlayingInfoLanguageOption[]; defaultLanguageOption: MPNowPlayingInfoLanguageOption; allowEmptySelection: boolean; });

	initWithLanguageOptionsDefaultLanguageOptionAllowEmptySelection(languageOptions: NSArray<MPNowPlayingInfoLanguageOption> | MPNowPlayingInfoLanguageOption[], defaultLanguageOption: MPNowPlayingInfoLanguageOption, allowEmptySelection: boolean): this;
}

declare const enum MPNowPlayingInfoLanguageOptionType {

	Audible = 0,

	Legible = 1
}

declare const enum MPNowPlayingInfoMediaType {

	None = 0,

	Audio = 1,

	Video = 2
}

declare var MPNowPlayingInfoPropertyAssetURL: string;

declare var MPNowPlayingInfoPropertyAvailableLanguageOptions: string;

declare var MPNowPlayingInfoPropertyChapterCount: string;

declare var MPNowPlayingInfoPropertyChapterNumber: string;

declare var MPNowPlayingInfoPropertyCurrentLanguageOptions: string;

declare var MPNowPlayingInfoPropertyCurrentPlaybackDate: string;

declare var MPNowPlayingInfoPropertyDefaultPlaybackRate: string;

declare var MPNowPlayingInfoPropertyElapsedPlaybackTime: string;

declare var MPNowPlayingInfoPropertyExternalContentIdentifier: string;

declare var MPNowPlayingInfoPropertyExternalUserProfileIdentifier: string;

declare var MPNowPlayingInfoPropertyIsLiveStream: string;

declare var MPNowPlayingInfoPropertyMediaType: string;

declare var MPNowPlayingInfoPropertyPlaybackProgress: string;

declare var MPNowPlayingInfoPropertyPlaybackQueueCount: string;

declare var MPNowPlayingInfoPropertyPlaybackQueueIndex: string;

declare var MPNowPlayingInfoPropertyPlaybackRate: string;

declare var MPNowPlayingInfoPropertyServiceIdentifier: string;

declare const enum MPNowPlayingPlaybackState {

	Unknown = 0,

	Playing = 1,

	Paused = 2,

	Stopped = 3,

	Interrupted = 4
}

interface MPPlayableContentDataSource extends NSObjectProtocol {

	beginLoadingChildItemsAtIndexPathCompletionHandler?(indexPath: NSIndexPath, completionHandler: (p1: NSError) => void): void;

	childItemsDisplayPlaybackProgressAtIndexPath?(indexPath: NSIndexPath): boolean;

	contentItemAtIndexPath(indexPath: NSIndexPath): MPContentItem;

	contentItemForIdentifierCompletionHandler?(identifier: string, completionHandler: (p1: MPContentItem, p2: NSError) => void): void;

	numberOfChildItemsAtIndexPath(indexPath: NSIndexPath): number;
}
declare var MPPlayableContentDataSource: {

	prototype: MPPlayableContentDataSource;
};

interface MPPlayableContentDelegate extends NSObjectProtocol {

	playableContentManagerDidUpdateContext?(contentManager: MPPlayableContentManager, context: MPPlayableContentManagerContext): void;

	playableContentManagerInitializePlaybackQueueWithCompletionHandler?(contentManager: MPPlayableContentManager, completionHandler: (p1: NSError) => void): void;

	playableContentManagerInitializePlaybackQueueWithContentItemsCompletionHandler?(contentManager: MPPlayableContentManager, contentItems: NSArray<any> | any[], completionHandler: (p1: NSError) => void): void;

	playableContentManagerInitiatePlaybackOfContentItemAtIndexPathCompletionHandler?(contentManager: MPPlayableContentManager, indexPath: NSIndexPath, completionHandler: (p1: NSError) => void): void;
}
declare var MPPlayableContentDelegate: {

	prototype: MPPlayableContentDelegate;
};

declare class MPPlayableContentManager extends NSObject {

	static alloc(): MPPlayableContentManager; // inherited from NSObject

	static new(): MPPlayableContentManager; // inherited from NSObject

	static sharedContentManager(): MPPlayableContentManager;

	readonly context: MPPlayableContentManagerContext;

	dataSource: MPPlayableContentDataSource;

	delegate: MPPlayableContentDelegate;

	nowPlayingIdentifiers: NSArray<string>;

	beginUpdates(): void;

	endUpdates(): void;

	reloadData(): void;
}

declare class MPPlayableContentManagerContext extends NSObject {

	static alloc(): MPPlayableContentManagerContext; // inherited from NSObject

	static new(): MPPlayableContentManagerContext; // inherited from NSObject

	readonly contentLimitsEnabled: boolean;

	readonly contentLimitsEnforced: boolean;

	readonly endpointAvailable: boolean;

	readonly enforcedContentItemsCount: number;

	readonly enforcedContentTreeDepth: number;
}

declare class MPRatingCommand extends MPRemoteCommand {

	static alloc(): MPRatingCommand; // inherited from NSObject

	static new(): MPRatingCommand; // inherited from NSObject

	maximumRating: number;

	minimumRating: number;
}

declare class MPRatingCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPRatingCommandEvent; // inherited from NSObject

	static new(): MPRatingCommandEvent; // inherited from NSObject

	readonly rating: number;
}

declare class MPRemoteCommand extends NSObject {

	static alloc(): MPRemoteCommand; // inherited from NSObject

	static new(): MPRemoteCommand; // inherited from NSObject

	enabled: boolean;

	addTargetAction(target: any, action: string): void;

	addTargetWithHandler(handler: (p1: MPRemoteCommandEvent) => MPRemoteCommandHandlerStatus): any;

	removeTarget(target: any): void;

	removeTargetAction(target: any, action: string): void;
}

declare class MPRemoteCommandCenter extends NSObject {

	static alloc(): MPRemoteCommandCenter; // inherited from NSObject

	static new(): MPRemoteCommandCenter; // inherited from NSObject

	static sharedCommandCenter(): MPRemoteCommandCenter;

	readonly bookmarkCommand: MPFeedbackCommand;

	readonly changePlaybackPositionCommand: MPChangePlaybackPositionCommand;

	readonly changePlaybackRateCommand: MPChangePlaybackRateCommand;

	readonly changeRepeatModeCommand: MPChangeRepeatModeCommand;

	readonly changeShuffleModeCommand: MPChangeShuffleModeCommand;

	readonly disableLanguageOptionCommand: MPRemoteCommand;

	readonly dislikeCommand: MPFeedbackCommand;

	readonly enableLanguageOptionCommand: MPRemoteCommand;

	readonly likeCommand: MPFeedbackCommand;

	readonly nextTrackCommand: MPRemoteCommand;

	readonly pauseCommand: MPRemoteCommand;

	readonly playCommand: MPRemoteCommand;

	readonly previousTrackCommand: MPRemoteCommand;

	readonly ratingCommand: MPRatingCommand;

	readonly seekBackwardCommand: MPRemoteCommand;

	readonly seekForwardCommand: MPRemoteCommand;

	readonly skipBackwardCommand: MPSkipIntervalCommand;

	readonly skipForwardCommand: MPSkipIntervalCommand;

	readonly stopCommand: MPRemoteCommand;

	readonly togglePlayPauseCommand: MPRemoteCommand;
}

declare class MPRemoteCommandEvent extends NSObject {

	static alloc(): MPRemoteCommandEvent; // inherited from NSObject

	static new(): MPRemoteCommandEvent; // inherited from NSObject

	readonly command: MPRemoteCommand;

	readonly timestamp: number;
}

declare const enum MPRemoteCommandHandlerStatus {

	Success = 0,

	NoSuchContent = 100,

	NoActionableNowPlayingItem = 110,

	DeviceNotFound = 120,

	CommandFailed = 200
}

declare const enum MPRepeatType {

	Off = 0,

	One = 1,

	All = 2
}

declare class MPSeekCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPSeekCommandEvent; // inherited from NSObject

	static new(): MPSeekCommandEvent; // inherited from NSObject

	readonly type: MPSeekCommandEventType;
}

declare const enum MPSeekCommandEventType {

	BeginSeeking = 0,

	EndSeeking = 1
}

declare const enum MPShuffleType {

	Off = 0,

	Items = 1,

	Collections = 2
}

declare class MPSkipIntervalCommand extends MPRemoteCommand {

	static alloc(): MPSkipIntervalCommand; // inherited from NSObject

	static new(): MPSkipIntervalCommand; // inherited from NSObject

	preferredIntervals: NSArray<number>;
}

declare class MPSkipIntervalCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPSkipIntervalCommandEvent; // inherited from NSObject

	static new(): MPSkipIntervalCommandEvent; // inherited from NSObject

	readonly interval: number;
}

interface MPSystemMusicPlayerController extends NSObjectProtocol {

	openToPlayQueueDescriptor(queueDescriptor: MPMusicPlayerQueueDescriptor): void;
}
declare var MPSystemMusicPlayerController: {

	prototype: MPSystemMusicPlayerController;
};

declare class MPTimedMetadata extends NSObject {

	static alloc(): MPTimedMetadata; // inherited from NSObject

	static new(): MPTimedMetadata; // inherited from NSObject

	readonly allMetadata: NSDictionary<any, any>;

	readonly key: string;

	readonly keyspace: string;

	readonly timestamp: number;

	readonly value: any;
}

declare function MPVolumeSettingsAlertHide(): void;

declare function MPVolumeSettingsAlertIsVisible(): boolean;

declare function MPVolumeSettingsAlertShow(): void;

declare class MPVolumeView extends UIView implements NSCoding {

	static alloc(): MPVolumeView; // inherited from NSObject

	static appearance(): MPVolumeView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): MPVolumeView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MPVolumeView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MPVolumeView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MPVolumeView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MPVolumeView; // inherited from UIAppearance

	static new(): MPVolumeView; // inherited from NSObject

	showsRouteButton: boolean;

	showsVolumeSlider: boolean;

	volumeWarningSliderImage: UIImage;

	readonly wirelessRouteActive: boolean;

	readonly wirelessRoutesAvailable: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	maximumVolumeSliderImageForState(state: UIControlState): UIImage;

	minimumVolumeSliderImageForState(state: UIControlState): UIImage;

	routeButtonImageForState(state: UIControlState): UIImage;

	routeButtonRectForBounds(bounds: CGRect): CGRect;

	setMaximumVolumeSliderImageForState(image: UIImage, state: UIControlState): void;

	setMinimumVolumeSliderImageForState(image: UIImage, state: UIControlState): void;

	setRouteButtonImageForState(image: UIImage, state: UIControlState): void;

	setVolumeThumbImageForState(image: UIImage, state: UIControlState): void;

	volumeSliderRectForBounds(bounds: CGRect): CGRect;

	volumeThumbImageForState(state: UIControlState): UIImage;

	volumeThumbRectForBoundsVolumeSliderRectValue(bounds: CGRect, rect: CGRect, value: number): CGRect;
}

declare var MPVolumeViewWirelessRouteActiveDidChangeNotification: string;

declare var MPVolumeViewWirelessRoutesAvailableDidChangeNotification: string;
