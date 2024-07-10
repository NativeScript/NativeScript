
/**
 * @since 16.0
 */
declare class MPAdTimeRange extends NSObject implements NSCopying {

	static alloc(): MPAdTimeRange; // inherited from NSObject

	static new(): MPAdTimeRange; // inherited from NSObject

	timeRange: CMTimeRange;

	constructor(o: { timeRange: CMTimeRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithTimeRange(timeRange: CMTimeRange): this;
}

/**
 * @since 9.0
 */
declare class MPChangeLanguageOptionCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangeLanguageOptionCommandEvent; // inherited from NSObject

	static new(): MPChangeLanguageOptionCommandEvent; // inherited from NSObject

	readonly languageOption: MPNowPlayingInfoLanguageOption;

	readonly setting: MPChangeLanguageOptionSetting;
}

/**
 * @since 9.3
 */
declare const enum MPChangeLanguageOptionSetting {

	None = 0,

	NowPlayingItemOnly = 1,

	Permanent = 2
}

/**
 * @since 9.0
 */
declare class MPChangePlaybackPositionCommand extends MPRemoteCommand {

	static alloc(): MPChangePlaybackPositionCommand; // inherited from NSObject

	static new(): MPChangePlaybackPositionCommand; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare class MPChangePlaybackPositionCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangePlaybackPositionCommandEvent; // inherited from NSObject

	static new(): MPChangePlaybackPositionCommandEvent; // inherited from NSObject

	readonly positionTime: number;
}

/**
 * @since 7.1
 */
declare class MPChangePlaybackRateCommand extends MPRemoteCommand {

	static alloc(): MPChangePlaybackRateCommand; // inherited from NSObject

	static new(): MPChangePlaybackRateCommand; // inherited from NSObject

	supportedPlaybackRates: NSArray<number>;
}

/**
 * @since 7.1
 */
declare class MPChangePlaybackRateCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangePlaybackRateCommandEvent; // inherited from NSObject

	static new(): MPChangePlaybackRateCommandEvent; // inherited from NSObject

	readonly playbackRate: number;
}

/**
 * @since 8.0
 */
declare class MPChangeRepeatModeCommand extends MPRemoteCommand {

	static alloc(): MPChangeRepeatModeCommand; // inherited from NSObject

	static new(): MPChangeRepeatModeCommand; // inherited from NSObject

	currentRepeatType: MPRepeatType;
}

/**
 * @since 8.0
 */
declare class MPChangeRepeatModeCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangeRepeatModeCommandEvent; // inherited from NSObject

	static new(): MPChangeRepeatModeCommandEvent; // inherited from NSObject

	readonly preservesRepeatMode: boolean;

	readonly repeatType: MPRepeatType;
}

/**
 * @since 8.0
 */
declare class MPChangeShuffleModeCommand extends MPRemoteCommand {

	static alloc(): MPChangeShuffleModeCommand; // inherited from NSObject

	static new(): MPChangeShuffleModeCommand; // inherited from NSObject

	currentShuffleType: MPShuffleType;
}

/**
 * @since 8.0
 */
declare class MPChangeShuffleModeCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPChangeShuffleModeCommandEvent; // inherited from NSObject

	static new(): MPChangeShuffleModeCommandEvent; // inherited from NSObject

	readonly preservesShuffleMode: boolean;

	readonly shuffleType: MPShuffleType;
}

/**
 * @since 7.1
 */
declare class MPContentItem extends NSObject {

	static alloc(): MPContentItem; // inherited from NSObject

	static new(): MPContentItem; // inherited from NSObject

	artwork: MPMediaItemArtwork;

	container: boolean;

	/**
	 * @since 10.0
	 */
	explicitContent: boolean;

	readonly identifier: string;

	playable: boolean;

	playbackProgress: number;

	/**
	 * @since 10.0
	 */
	streamingContent: boolean;

	subtitle: string;

	title: string;

	constructor(o: { identifier: string; });

	initWithIdentifier(identifier: string): this;
}

/**
 * @since 9.3
 */
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

/**
 * @since 9.3
 */
declare var MPErrorDomain: string;

/**
 * @since 7.1
 */
declare class MPFeedbackCommand extends MPRemoteCommand {

	static alloc(): MPFeedbackCommand; // inherited from NSObject

	static new(): MPFeedbackCommand; // inherited from NSObject

	active: boolean;

	/**
	 * @since 8.0
	 */
	localizedShortTitle: string;

	localizedTitle: string;
}

/**
 * @since 7.1
 */
declare class MPFeedbackCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPFeedbackCommandEvent; // inherited from NSObject

	static new(): MPFeedbackCommandEvent; // inherited from NSObject

	readonly negative: boolean;
}

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicContainsOnlyForcedSubtitles: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicDescribesMusicAndSound: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicDescribesVideo: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicDubbedTranslation: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicEasyToRead: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicIsAuxiliaryContent: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicIsMainProgramContent: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicLanguageTranslation: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicTranscribesSpokenDialog: string;

/**
 * @since 9.0
 */
declare var MPLanguageOptionCharacteristicVoiceOverTranslation: string;

/**
 * @since 4.2
 */
declare class MPMediaEntity extends NSObject implements NSSecureCoding {

	static alloc(): MPMediaEntity; // inherited from NSObject

	static canFilterByProperty(property: string): boolean;

	static new(): MPMediaEntity; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly persistentID: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 */
	enumerateValuesForPropertiesUsingBlock(properties: NSSet<string>, block: (p1: string, p2: any, p3: interop.Pointer | interop.Reference<boolean>) => void): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 8.0
	 */
	objectForKeyedSubscript(key: any): any;

	valueForProperty(property: string): any;
}

/**
 * @since 4.2
 */
declare var MPMediaEntityPropertyPersistentID: string;

/**
 * @since 3.0
 */
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

/**
 * @since 3.0
 */
declare class MPMediaItem extends MPMediaEntity {

	static alloc(): MPMediaItem; // inherited from NSObject

	static new(): MPMediaItem; // inherited from NSObject

	/**
	 * @since 4.2
	 */
	static persistentIDPropertyForGroupingType(groupingType: MPMediaGrouping): string;

	/**
	 * @since 4.2
	 */
	static titlePropertyForGroupingType(groupingType: MPMediaGrouping): string;

	/**
	 * @since 7.0
	 */
	readonly albumArtist: string;

	/**
	 * @since 8.0
	 */
	readonly albumArtistPersistentID: number;

	/**
	 * @since 8.0
	 */
	readonly albumPersistentID: number;

	/**
	 * @since 7.0
	 */
	readonly albumTitle: string;

	/**
	 * @since 8.0
	 */
	readonly albumTrackCount: number;

	/**
	 * @since 7.0
	 */
	readonly albumTrackNumber: number;

	/**
	 * @since 7.0
	 */
	readonly artist: string;

	/**
	 * @since 8.0
	 */
	readonly artistPersistentID: number;

	/**
	 * @since 7.0
	 */
	readonly artwork: MPMediaItemArtwork;

	/**
	 * @since 8.0
	 */
	readonly assetURL: NSURL;

	/**
	 * @since 8.0
	 */
	readonly beatsPerMinute: number;

	/**
	 * @since 7.0
	 */
	readonly bookmarkTime: number;

	/**
	 * @since 8.0
	 */
	readonly cloudItem: boolean;

	/**
	 * @since 8.0
	 */
	readonly comments: string;

	/**
	 * @since 8.0
	 */
	readonly compilation: boolean;

	/**
	 * @since 7.0
	 */
	readonly composer: string;

	/**
	 * @since 8.0
	 */
	readonly composerPersistentID: number;

	/**
	 * @since 10.0
	 */
	readonly dateAdded: Date;

	/**
	 * @since 8.0
	 */
	readonly discCount: number;

	/**
	 * @since 7.0
	 */
	readonly discNumber: number;

	/**
	 * @since 10.0
	 */
	readonly explicitItem: boolean;

	/**
	 * @since 7.0
	 */
	readonly genre: string;

	/**
	 * @since 8.0
	 */
	readonly genrePersistentID: number;

	/**
	 * @since 7.0
	 */
	readonly lastPlayedDate: Date;

	/**
	 * @since 8.0
	 */
	readonly lyrics: string;

	/**
	 * @since 7.0
	 */
	readonly mediaType: MPMediaType;

	/**
	 * @since 7.0
	 */
	readonly playCount: number;

	/**
	 * @since 7.0
	 */
	readonly playbackDuration: number;

	/**
	 * @since 10.3
	 */
	readonly playbackStoreID: string;

	/**
	 * @since 8.0
	 */
	readonly podcastPersistentID: number;

	/**
	 * @since 7.0
	 */
	readonly podcastTitle: string;

	/**
	 * @since 10.3
	 */
	readonly preorder: boolean;

	/**
	 * @since 9.2
	 */
	readonly protectedAsset: boolean;

	/**
	 * @since 7.0
	 */
	readonly rating: number;

	/**
	 * @since 7.0
	 */
	readonly releaseDate: Date;

	/**
	 * @since 7.0
	 */
	readonly skipCount: number;

	/**
	 * @since 7.0
	 */
	readonly title: string;

	/**
	 * @since 8.0
	 */
	readonly userGrouping: string;
}

/**
 * @since 3.0
 */
declare class MPMediaItemArtwork extends NSObject {

	static alloc(): MPMediaItemArtwork; // inherited from NSObject

	static new(): MPMediaItemArtwork; // inherited from NSObject

	readonly bounds: CGRect;

	/**
	 * @since 3.0
	 * @deprecated 10.0
	 */
	readonly imageCropRect: CGRect;

	/**
	 * @since 10.0
	 */
	constructor(o: { boundsSize: CGSize; requestHandler: (p1: CGSize) => UIImage; });

	/**
	 * @since 5.0
	 * @deprecated 10.0
	 */
	constructor(o: { image: UIImage; });

	imageWithSize(size: CGSize): UIImage;

	/**
	 * @since 10.0
	 */
	initWithBoundsSizeRequestHandler(boundsSize: CGSize, requestHandler: (p1: CGSize) => UIImage): this;

	/**
	 * @since 5.0
	 * @deprecated 10.0
	 */
	initWithImage(image: UIImage): this;
}

/**
 * @since 3.0
 */
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

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyAlbumArtist: string;

/**
 * @since 4.2
 */
declare var MPMediaItemPropertyAlbumArtistPersistentID: string;

/**
 * @since 4.2
 */
declare var MPMediaItemPropertyAlbumPersistentID: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyAlbumTitle: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyAlbumTrackCount: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyAlbumTrackNumber: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyArtist: string;

/**
 * @since 4.2
 */
declare var MPMediaItemPropertyArtistPersistentID: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyArtwork: string;

/**
 * @since 4.0
 */
declare var MPMediaItemPropertyAssetURL: string;

/**
 * @since 4.0
 */
declare var MPMediaItemPropertyBeatsPerMinute: string;

/**
 * @since 6.0
 */
declare var MPMediaItemPropertyBookmarkTime: string;

/**
 * @since 4.0
 */
declare var MPMediaItemPropertyComments: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyComposer: string;

/**
 * @since 4.2
 */
declare var MPMediaItemPropertyComposerPersistentID: string;

/**
 * @since 10.0
 */
declare var MPMediaItemPropertyDateAdded: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyDiscCount: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyDiscNumber: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyGenre: string;

/**
 * @since 4.2
 */
declare var MPMediaItemPropertyGenrePersistentID: string;

/**
 * @since 9.2
 */
declare var MPMediaItemPropertyHasProtectedAsset: string;

/**
 * @since 6.0
 */
declare var MPMediaItemPropertyIsCloudItem: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyIsCompilation: string;

/**
 * @since 7.0
 */
declare var MPMediaItemPropertyIsExplicit: string;

/**
 * @since 14.5
 */
declare var MPMediaItemPropertyIsPreorder: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyLastPlayedDate: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyLyrics: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyMediaType: string;

/**
 * @since 4.2
 */
declare var MPMediaItemPropertyPersistentID: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyPlayCount: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyPlaybackDuration: string;

/**
 * @since 10.3
 */
declare var MPMediaItemPropertyPlaybackStoreID: string;

/**
 * @since 4.2
 */
declare var MPMediaItemPropertyPodcastPersistentID: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyPodcastTitle: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyRating: string;

/**
 * @since 4.0
 */
declare var MPMediaItemPropertyReleaseDate: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertySkipCount: string;

/**
 * @since 3.0
 */
declare var MPMediaItemPropertyTitle: string;

/**
 * @since 4.0
 */
declare var MPMediaItemPropertyUserGrouping: string;

/**
 * @since 3.0
 */
declare class MPMediaLibrary extends NSObject implements NSSecureCoding {

	static alloc(): MPMediaLibrary; // inherited from NSObject

	/**
	 * @since 9.3
	 */
	static authorizationStatus(): MPMediaLibraryAuthorizationStatus;

	static defaultMediaLibrary(): MPMediaLibrary;

	static new(): MPMediaLibrary; // inherited from NSObject

	/**
	 * @since 9.3
	 */
	static requestAuthorization(completionHandler: (p1: MPMediaLibraryAuthorizationStatus) => void): void;

	readonly lastModifiedDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 9.3
	 */
	addItemWithProductIDCompletionHandler(productID: string, completionHandler: (p1: NSArray<MPMediaEntity>, p2: NSError) => void): void;

	beginGeneratingLibraryChangeNotifications(): void;

	encodeWithCoder(coder: NSCoder): void;

	endGeneratingLibraryChangeNotifications(): void;

	/**
	 * @since 9.3
	 */
	getPlaylistWithUUIDCreationMetadataCompletionHandler(uuid: NSUUID, creationMetadata: MPMediaPlaylistCreationMetadata, completionHandler: (p1: MPMediaPlaylist, p2: NSError) => void): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.3
 */
declare const enum MPMediaLibraryAuthorizationStatus {

	NotDetermined = 0,

	Denied = 1,

	Restricted = 2,

	Authorized = 3
}

declare var MPMediaLibraryDidChangeNotification: string;

/**
 * @since 3.0
 */
declare class MPMediaPickerController extends UIViewController {

	static alloc(): MPMediaPickerController; // inherited from NSObject

	static new(): MPMediaPickerController; // inherited from NSObject

	allowsPickingMultipleItems: boolean;

	delegate: MPMediaPickerControllerDelegate;

	readonly mediaTypes: MPMediaType;

	prompt: string;

	/**
	 * @since 6.0
	 */
	showsCloudItems: boolean;

	/**
	 * @since 9.2
	 */
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

/**
 * @since 3.0
 */
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

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMediaPlaybackIsPreparedToPlayDidChangeNotification: string;

/**
 * @since 3.0
 */
declare class MPMediaPlaylist extends MPMediaItemCollection {

	static alloc(): MPMediaPlaylist; // inherited from NSObject

	static new(): MPMediaPlaylist; // inherited from NSObject

	/**
	 * @since 9.3
	 */
	readonly authorDisplayName: string;

	/**
	 * @since 14.0
	 */
	readonly cloudGlobalID: string;

	/**
	 * @since 9.3
	 */
	readonly descriptionText: string;

	/**
	 * @since 7.0
	 */
	readonly name: string;

	/**
	 * @since 7.0
	 */
	readonly playlistAttributes: MPMediaPlaylistAttribute;

	/**
	 * @since 8.0
	 */
	readonly seedItems: NSArray<MPMediaItem>;

	/**
	 * @since 9.3
	 */
	addItemWithProductIDCompletionHandler(productID: string, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 9.3
	 */
	addMediaItemsCompletionHandler(mediaItems: NSArray<MPMediaItem> | MPMediaItem[], completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 3.0
 */
declare const enum MPMediaPlaylistAttribute {

	None = 0,

	OnTheGo = 1,

	Smart = 2,

	Genius = 4
}

/**
 * @since 9.3
 */
declare class MPMediaPlaylistCreationMetadata extends NSObject {

	static alloc(): MPMediaPlaylistCreationMetadata; // inherited from NSObject

	static new(): MPMediaPlaylistCreationMetadata; // inherited from NSObject

	authorDisplayName: string;

	descriptionText: string;

	readonly name: string;

	constructor(o: { name: string; });

	initWithName(name: string): this;
}

/**
 * @since 9.3
 */
declare var MPMediaPlaylistPropertyAuthorDisplayName: string;

/**
 * @since 9.0
 */
declare var MPMediaPlaylistPropertyCloudGlobalID: string;

/**
 * @since 9.3
 */
declare var MPMediaPlaylistPropertyDescriptionText: string;

declare var MPMediaPlaylistPropertyName: string;

declare var MPMediaPlaylistPropertyPersistentID: string;

declare var MPMediaPlaylistPropertyPlaylistAttributes: string;

declare var MPMediaPlaylistPropertySeedItems: string;

/**
 * @since 3.0
 */
declare class MPMediaPredicate extends NSObject implements NSSecureCoding {

	static alloc(): MPMediaPredicate; // inherited from NSObject

	static new(): MPMediaPredicate; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 3.0
 */
declare const enum MPMediaPredicateComparison {

	EqualTo = 0,

	Contains = 1
}

/**
 * @since 3.0
 */
declare class MPMediaPropertyPredicate extends MPMediaPredicate {

	static alloc(): MPMediaPropertyPredicate; // inherited from NSObject

	static new(): MPMediaPropertyPredicate; // inherited from NSObject

	static predicateWithValueForProperty(value: any, property: string): MPMediaPropertyPredicate;

	static predicateWithValueForPropertyComparisonType(value: any, property: string, comparisonType: MPMediaPredicateComparison): MPMediaPropertyPredicate;

	readonly comparisonType: MPMediaPredicateComparison;

	readonly property: string;

	readonly value: any;
}

/**
 * @since 3.0
 */
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

	/**
	 * @since 4.2
	 */
	readonly collectionSections: NSArray<MPMediaQuerySection>;

	readonly collections: NSArray<MPMediaItemCollection>;

	filterPredicates: NSSet<MPMediaPredicate>;

	groupingType: MPMediaGrouping;

	/**
	 * @since 4.2
	 */
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

/**
 * @since 4.2
 */
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

/**
 * @since 3.0
 */
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

/**
 * @since 4.3
 * @deprecated 9.0
 */
declare class MPMovieAccessLog extends NSObject implements NSCopying {

	static alloc(): MPMovieAccessLog; // inherited from NSObject

	static new(): MPMovieAccessLog; // inherited from NSObject

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly events: NSArray<any>;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly extendedLogData: NSData;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.3
 * @deprecated 9.0
 */
declare class MPMovieAccessLogEvent extends NSObject implements NSCopying {

	static alloc(): MPMovieAccessLogEvent; // inherited from NSObject

	static new(): MPMovieAccessLogEvent; // inherited from NSObject

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly URI: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly durationWatched: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly indicatedBitrate: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly numberOfBytesTransferred: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly numberOfDroppedVideoFrames: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly numberOfSegmentsDownloaded: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly numberOfServerAddressChanges: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly numberOfStalls: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly observedBitrate: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly playbackSessionID: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly playbackStartDate: Date;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly playbackStartOffset: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly segmentsDownloadedDuration: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly serverAddress: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieControlStyle {

	None = 0,

	Embedded = 1,

	Fullscreen = 2,

	Default = 1
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMovieDurationAvailableNotification: string;

/**
 * @since 4.3
 * @deprecated 9.0
 */
declare class MPMovieErrorLog extends NSObject implements NSCopying {

	static alloc(): MPMovieErrorLog; // inherited from NSObject

	static new(): MPMovieErrorLog; // inherited from NSObject

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly events: NSArray<any>;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly extendedLogData: NSData;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly extendedLogDataStringEncoding: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 4.3
 * @deprecated 9.0
 */
declare class MPMovieErrorLogEvent extends NSObject implements NSCopying {

	static alloc(): MPMovieErrorLogEvent; // inherited from NSObject

	static new(): MPMovieErrorLogEvent; // inherited from NSObject

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly URI: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly date: Date;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly errorComment: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly errorDomain: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly errorStatusCode: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly playbackSessionID: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly serverAddress: string;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieFinishReason {

	PlaybackEnded = 0,

	PlaybackError = 1,

	UserExited = 2
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieLoadState {

	Unknown = 0,

	Playable = 1,

	PlaythroughOK = 2,

	Stalled = 4
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieMediaTypeMask {

	None = 0,

	Video = 1,

	Audio = 2
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMovieMediaTypesAvailableNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMovieNaturalSizeAvailableNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMoviePlaybackState {

	Stopped = 0,

	Playing = 1,

	Paused = 2,

	Interrupted = 3,

	SeekingForward = 4,

	SeekingBackward = 5
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare class MPMoviePlayerController extends NSObject implements MPMediaPlayback {

	static alloc(): MPMoviePlayerController; // inherited from NSObject

	static new(): MPMoviePlayerController; // inherited from NSObject

	/**
	 * @since 4.3
	 * @deprecated 9.0
	 */
	readonly accessLog: MPMovieAccessLog;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly airPlayVideoActive: boolean;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	allowsAirPlay: boolean;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly backgroundView: UIView;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	contentURL: NSURL;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	controlStyle: MPMovieControlStyle;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly duration: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	endPlaybackTime: number;

	/**
	 * @since 4.3
	 * @deprecated 9.0
	 */
	readonly errorLog: MPMovieErrorLog;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	fullscreen: boolean;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	initialPlaybackTime: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly loadState: MPMovieLoadState;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly movieMediaTypes: MPMovieMediaTypeMask;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	movieSourceType: MPMovieSourceType;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly naturalSize: CGSize;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly playableDuration: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly playbackState: MPMoviePlaybackState;

	/**
	 * @since 6.0
	 */
	readonly readyForDisplay: boolean;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	repeatMode: MPMovieRepeatMode;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	scalingMode: MPMovieScalingMode;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	shouldAutoplay: boolean;

	/**
	 * @since 4.0
	 * @deprecated 9.0
	 */
	readonly timedMetadata: NSArray<any>;

	/**
	 * @since 6.0
	 * @deprecated 9.0
	 */
	useApplicationAudioSession: boolean;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly view: UIView;

	currentPlaybackRate: number; // inherited from MPMediaPlayback

	currentPlaybackTime: number; // inherited from MPMediaPlayback

	readonly isPreparedToPlay: boolean; // inherited from MPMediaPlayback

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	constructor(o: { contentURL: NSURL; });

	beginSeekingBackward(): void;

	beginSeekingForward(): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	cancelAllThumbnailImageRequests(): void;

	endSeeking(): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	initWithContentURL(url: NSURL): this;

	pause(): void;

	play(): void;

	prepareToPlay(): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	requestThumbnailImagesAtTimesTimeOption(playbackTimes: NSArray<any> | any[], option: MPMovieTimeOption): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	setFullscreenAnimated(fullscreen: boolean, animated: boolean): void;

	stop(): void;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	thumbnailImageAtTimeTimeOption(playbackTime: number, option: MPMovieTimeOption): UIImage;
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerDidEnterFullscreenNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerDidExitFullscreenNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerFullscreenAnimationCurveUserInfoKey: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerFullscreenAnimationDurationUserInfoKey: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerIsAirPlayVideoActiveDidChangeNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerLoadStateDidChangeNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerNowPlayingMovieDidChangeNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerPlaybackDidFinishNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerPlaybackDidFinishReasonUserInfoKey: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerPlaybackStateDidChangeNotification: string;

/**
 * @since 6.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerReadyForDisplayDidChangeNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerScalingModeDidChangeNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerThumbnailErrorKey: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerThumbnailImageKey: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerThumbnailImageRequestDidFinishNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerThumbnailTimeKey: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerTimedMetadataKeyDataType: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerTimedMetadataKeyInfo: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerTimedMetadataKeyLanguageCode: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerTimedMetadataKeyMIMEType: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerTimedMetadataKeyName: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerTimedMetadataUpdatedNotification: string;

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare var MPMoviePlayerTimedMetadataUserInfoKey: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare class MPMoviePlayerViewController extends UIViewController {

	static alloc(): MPMoviePlayerViewController; // inherited from NSObject

	static new(): MPMoviePlayerViewController; // inherited from NSObject

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly moviePlayer: MPMoviePlayerController;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	constructor(o: { contentURL: NSURL; });

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	initWithContentURL(contentURL: NSURL): this;
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerWillEnterFullscreenNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMoviePlayerWillExitFullscreenNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieRepeatMode {

	None = 0,

	One = 1
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieScalingMode {

	None = 0,

	AspectFit = 1,

	AspectFill = 2,

	Fill = 3
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieSourceType {

	Unknown = 0,

	File = 1,

	Streaming = 2
}

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare var MPMovieSourceTypeAvailableNotification: string;

/**
 * @since 3.2
 * @deprecated 9.0
 */
declare const enum MPMovieTimeOption {

	NearestKeyFrame = 0,

	Exact = 1
}

/**
 * @since 3.0
 */
declare const enum MPMusicPlaybackState {

	Stopped = 0,

	Playing = 1,

	Paused = 2,

	Interrupted = 3,

	SeekingForward = 4,

	SeekingBackward = 5
}

/**
 * @since 10.3
 */
declare class MPMusicPlayerApplicationController extends MPMusicPlayerController {

	static alloc(): MPMusicPlayerApplicationController; // inherited from NSObject

	static new(): MPMusicPlayerApplicationController; // inherited from NSObject

	performQueueTransactionCompletionHandler(queueTransaction: (p1: MPMusicPlayerControllerMutableQueue) => void, completionHandler: (p1: MPMusicPlayerControllerQueue, p2: NSError) => void): void;
}

/**
 * @since 3.0
 */
declare class MPMusicPlayerController extends NSObject implements MPMediaPlayback {

	static alloc(): MPMusicPlayerController; // inherited from NSObject

	static new(): MPMusicPlayerController; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	readonly indexOfNowPlayingItem: number;

	nowPlayingItem: MPMediaItem;

	readonly playbackState: MPMusicPlaybackState;

	repeatMode: MPMusicRepeatMode;

	shuffleMode: MPMusicShuffleMode;

	/**
	 * @since 3.0
	 * @deprecated 7.0
	 */
	volume: number;

	static readonly applicationMusicPlayer: MPMusicPlayerController;

	/**
	 * @since 10.3
	 */
	static readonly applicationQueuePlayer: MPMusicPlayerApplicationController;

	/**
	 * @since 3.0
	 * @deprecated 8.0
	 */
	static readonly iPodMusicPlayer: MPMusicPlayerController;

	static readonly systemMusicPlayer: MPMusicPlayerController & MPSystemMusicPlayerController;

	currentPlaybackRate: number; // inherited from MPMediaPlayback

	currentPlaybackTime: number; // inherited from MPMediaPlayback

	readonly isPreparedToPlay: boolean; // inherited from MPMediaPlayback

	/**
	 * @since 10.3
	 */
	appendQueueDescriptor(descriptor: MPMusicPlayerQueueDescriptor): void;

	beginGeneratingPlaybackNotifications(): void;

	beginSeekingBackward(): void;

	beginSeekingForward(): void;

	endGeneratingPlaybackNotifications(): void;

	endSeeking(): void;

	pause(): void;

	play(): void;

	prepareToPlay(): void;

	/**
	 * @since 10.1
	 */
	prepareToPlayWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 10.3
	 */
	prependQueueDescriptor(descriptor: MPMusicPlayerQueueDescriptor): void;

	/**
	 * @since 10.1
	 */
	setQueueWithDescriptor(descriptor: MPMusicPlayerQueueDescriptor): void;

	setQueueWithItemCollection(itemCollection: MPMediaItemCollection): void;

	setQueueWithQuery(query: MPMediaQuery): void;

	/**
	 * @since 9.3
	 */
	setQueueWithStoreIDs(storeIDs: NSArray<string> | string[]): void;

	skipToBeginning(): void;

	skipToNextItem(): void;

	skipToPreviousItem(): void;

	stop(): void;
}

/**
 * @since 10.3
 */
declare class MPMusicPlayerControllerMutableQueue extends MPMusicPlayerControllerQueue {

	static alloc(): MPMusicPlayerControllerMutableQueue; // inherited from NSObject

	static new(): MPMusicPlayerControllerMutableQueue; // inherited from NSObject

	insertQueueDescriptorAfterItem(queueDescriptor: MPMusicPlayerQueueDescriptor, afterItem: MPMediaItem): void;

	removeItem(item: MPMediaItem): void;
}

/**
 * @since 3.0
 */
declare var MPMusicPlayerControllerNowPlayingItemDidChangeNotification: string;

/**
 * @since 3.0
 */
declare var MPMusicPlayerControllerPlaybackStateDidChangeNotification: string;

/**
 * @since 10.3
 */
declare class MPMusicPlayerControllerQueue extends NSObject {

	static alloc(): MPMusicPlayerControllerQueue; // inherited from NSObject

	static new(): MPMusicPlayerControllerQueue; // inherited from NSObject

	readonly items: NSArray<MPMediaItem>;
}

/**
 * @since 10.3
 */
declare var MPMusicPlayerControllerQueueDidChangeNotification: string;

/**
 * @since 3.0
 */
declare var MPMusicPlayerControllerVolumeDidChangeNotification: string;

/**
 * @since 10.1
 */
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

/**
 * @since 11.0
 */
declare class MPMusicPlayerPlayParameters extends NSObject {

	static alloc(): MPMusicPlayerPlayParameters; // inherited from NSObject

	static new(): MPMusicPlayerPlayParameters; // inherited from NSObject

	readonly dictionary: NSDictionary<string, any>;

	constructor(o: { dictionary: NSDictionary<string, any>; });

	initWithDictionary(dictionary: NSDictionary<string, any>): this;
}

/**
 * @since 11.0
 */
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

/**
 * @since 10.1
 */
declare class MPMusicPlayerQueueDescriptor extends NSObject {

	static alloc(): MPMusicPlayerQueueDescriptor; // inherited from NSObject

	static new(): MPMusicPlayerQueueDescriptor; // inherited from NSObject
}

/**
 * @since 10.1
 */
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

/**
 * @since 3.0
 */
declare const enum MPMusicRepeatMode {

	Default = 0,

	None = 1,

	One = 2,

	All = 3
}

/**
 * @since 3.0
 */
declare const enum MPMusicShuffleMode {

	Default = 0,

	Off = 1,

	Songs = 2,

	Albums = 3
}

/**
 * @since 5.0
 */
declare class MPNowPlayingInfoCenter extends NSObject {

	static alloc(): MPNowPlayingInfoCenter; // inherited from NSObject

	static defaultCenter(): MPNowPlayingInfoCenter;

	static new(): MPNowPlayingInfoCenter; // inherited from NSObject

	nowPlayingInfo: NSDictionary<string, any>;

	/**
	 * @since 13.0
	 */
	playbackState: MPNowPlayingPlaybackState;
}

/**
 * @since 9.3
 */
declare var MPNowPlayingInfoCollectionIdentifier: string;

/**
 * @since 9.0
 */
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

/**
 * @since 9.0
 */
declare class MPNowPlayingInfoLanguageOptionGroup extends NSObject {

	static alloc(): MPNowPlayingInfoLanguageOptionGroup; // inherited from NSObject

	static new(): MPNowPlayingInfoLanguageOptionGroup; // inherited from NSObject

	readonly allowEmptySelection: boolean;

	readonly defaultLanguageOption: MPNowPlayingInfoLanguageOption;

	readonly languageOptions: NSArray<MPNowPlayingInfoLanguageOption>;

	constructor(o: { languageOptions: NSArray<MPNowPlayingInfoLanguageOption> | MPNowPlayingInfoLanguageOption[]; defaultLanguageOption: MPNowPlayingInfoLanguageOption; allowEmptySelection: boolean; });

	initWithLanguageOptionsDefaultLanguageOptionAllowEmptySelection(languageOptions: NSArray<MPNowPlayingInfoLanguageOption> | MPNowPlayingInfoLanguageOption[], defaultLanguageOption: MPNowPlayingInfoLanguageOption, allowEmptySelection: boolean): this;
}

/**
 * @since 9.0
 */
declare const enum MPNowPlayingInfoLanguageOptionType {

	Audible = 0,

	Legible = 1
}

/**
 * @since 10.0
 */
declare const enum MPNowPlayingInfoMediaType {

	None = 0,

	Audio = 1,

	Video = 2
}

/**
 * @since 16.0
 */
declare var MPNowPlayingInfoPropertyAdTimeRanges: string;

/**
 * @since 10.3
 */
declare var MPNowPlayingInfoPropertyAssetURL: string;

/**
 * @since 9.0
 */
declare var MPNowPlayingInfoPropertyAvailableLanguageOptions: string;

/**
 * @since 5.0
 */
declare var MPNowPlayingInfoPropertyChapterCount: string;

/**
 * @since 5.0
 */
declare var MPNowPlayingInfoPropertyChapterNumber: string;

/**
 * @since 16.0
 */
declare var MPNowPlayingInfoPropertyCreditsStartTime: string;

/**
 * @since 9.0
 */
declare var MPNowPlayingInfoPropertyCurrentLanguageOptions: string;

/**
 * @since 11.1
 */
declare var MPNowPlayingInfoPropertyCurrentPlaybackDate: string;

/**
 * @since 8.0
 */
declare var MPNowPlayingInfoPropertyDefaultPlaybackRate: string;

/**
 * @since 5.0
 */
declare var MPNowPlayingInfoPropertyElapsedPlaybackTime: string;

/**
 * @since 18.0
 */
declare var MPNowPlayingInfoPropertyExcludeFromSuggestions: string;

/**
 * @since 10.0
 */
declare var MPNowPlayingInfoPropertyExternalContentIdentifier: string;

/**
 * @since 10.0
 */
declare var MPNowPlayingInfoPropertyExternalUserProfileIdentifier: string;

/**
 * @since 18.0
 */
declare var MPNowPlayingInfoPropertyInternationalStandardRecordingCode: string;

/**
 * @since 10.0
 */
declare var MPNowPlayingInfoPropertyIsLiveStream: string;

/**
 * @since 10.0
 */
declare var MPNowPlayingInfoPropertyMediaType: string;

/**
 * @since 10.0
 */
declare var MPNowPlayingInfoPropertyPlaybackProgress: string;

/**
 * @since 5.0
 */
declare var MPNowPlayingInfoPropertyPlaybackQueueCount: string;

/**
 * @since 5.0
 */
declare var MPNowPlayingInfoPropertyPlaybackQueueIndex: string;

/**
 * @since 5.0
 */
declare var MPNowPlayingInfoPropertyPlaybackRate: string;

/**
 * @since 11.0
 */
declare var MPNowPlayingInfoPropertyServiceIdentifier: string;

/**
 * @since 11.0
 */
declare const enum MPNowPlayingPlaybackState {

	Unknown = 0,

	Playing = 1,

	Paused = 2,

	Stopped = 3,

	Interrupted = 4
}

/**
 * @since 16.0
 */
declare class MPNowPlayingSession extends NSObject {

	static alloc(): MPNowPlayingSession; // inherited from NSObject

	static new(): MPNowPlayingSession; // inherited from NSObject

	readonly active: boolean;

	/**
	 * @since 16.0
	 */
	automaticallyPublishesNowPlayingInfo: boolean;

	readonly canBecomeActive: boolean;

	delegate: MPNowPlayingSessionDelegate;

	readonly nowPlayingInfoCenter: MPNowPlayingInfoCenter;

	readonly players: NSArray<AVPlayer>;

	readonly remoteCommandCenter: MPRemoteCommandCenter;

	constructor(o: { players: NSArray<AVPlayer> | AVPlayer[]; });

	addPlayer(player: AVPlayer): void;

	becomeActiveIfPossibleWithCompletion(completion: (p1: boolean) => void): void;

	initWithPlayers(players: NSArray<AVPlayer> | AVPlayer[]): this;

	removePlayer(player: AVPlayer): void;
}

/**
 * @since 16.0
 */
interface MPNowPlayingSessionDelegate extends NSObjectProtocol {

	nowPlayingSessionDidChangeActive?(nowPlayingSession: MPNowPlayingSession): void;

	nowPlayingSessionDidChangeCanBecomeActive?(nowPlayingSession: MPNowPlayingSession): void;
}
declare var MPNowPlayingSessionDelegate: {

	prototype: MPNowPlayingSessionDelegate;
};

/**
 * @since 7.1
 * @deprecated 14.0
 */
interface MPPlayableContentDataSource extends NSObjectProtocol {

	beginLoadingChildItemsAtIndexPathCompletionHandler?(indexPath: NSIndexPath, completionHandler: (p1: NSError) => void): void;

	childItemsDisplayPlaybackProgressAtIndexPath?(indexPath: NSIndexPath): boolean;

	contentItemAtIndexPath(indexPath: NSIndexPath): MPContentItem;

	/**
	 * @since 10.0
	 * @deprecated 14.0
	 */
	contentItemForIdentifierCompletionHandler?(identifier: string, completionHandler: (p1: MPContentItem, p2: NSError) => void): void;

	numberOfChildItemsAtIndexPath(indexPath: NSIndexPath): number;
}
declare var MPPlayableContentDataSource: {

	prototype: MPPlayableContentDataSource;
};

/**
 * @since 7.1
 * @deprecated 14.0
 */
interface MPPlayableContentDelegate extends NSObjectProtocol {

	/**
	 * @since 8.4
	 * @deprecated 14.0
	 */
	playableContentManagerDidUpdateContext?(contentManager: MPPlayableContentManager, context: MPPlayableContentManagerContext): void;

	/**
	 * @since 9.0
	 * @deprecated 9.3
	 */
	playableContentManagerInitializePlaybackQueueWithCompletionHandler?(contentManager: MPPlayableContentManager, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 9.3
	 * @deprecated 12.0
	 */
	playableContentManagerInitializePlaybackQueueWithContentItemsCompletionHandler?(contentManager: MPPlayableContentManager, contentItems: NSArray<any> | any[], completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 7.1
	 * @deprecated 14.0
	 */
	playableContentManagerInitiatePlaybackOfContentItemAtIndexPathCompletionHandler?(contentManager: MPPlayableContentManager, indexPath: NSIndexPath, completionHandler: (p1: NSError) => void): void;
}
declare var MPPlayableContentDelegate: {

	prototype: MPPlayableContentDelegate;
};

/**
 * @since 7.1
 * @deprecated 14.0
 */
declare class MPPlayableContentManager extends NSObject {

	static alloc(): MPPlayableContentManager; // inherited from NSObject

	static new(): MPPlayableContentManager; // inherited from NSObject

	static sharedContentManager(): MPPlayableContentManager;

	/**
	 * @since 8.4
	 * @deprecated 14.0
	 */
	readonly context: MPPlayableContentManagerContext;

	dataSource: MPPlayableContentDataSource;

	delegate: MPPlayableContentDelegate;

	/**
	 * @since 10.0
	 * @deprecated 14.0
	 */
	nowPlayingIdentifiers: NSArray<string>;

	beginUpdates(): void;

	endUpdates(): void;

	reloadData(): void;
}

/**
 * @since 8.4
 * @deprecated 14.0
 */
declare class MPPlayableContentManagerContext extends NSObject {

	static alloc(): MPPlayableContentManagerContext; // inherited from NSObject

	static new(): MPPlayableContentManagerContext; // inherited from NSObject

	/**
	 * @since 8.4
	 * @deprecated 9.0
	 */
	readonly contentLimitsEnabled: boolean;

	readonly contentLimitsEnforced: boolean;

	readonly endpointAvailable: boolean;

	readonly enforcedContentItemsCount: number;

	readonly enforcedContentTreeDepth: number;
}

/**
 * @since 7.1
 */
declare class MPRatingCommand extends MPRemoteCommand {

	static alloc(): MPRatingCommand; // inherited from NSObject

	static new(): MPRatingCommand; // inherited from NSObject

	maximumRating: number;

	minimumRating: number;
}

/**
 * @since 7.1
 */
declare class MPRatingCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPRatingCommandEvent; // inherited from NSObject

	static new(): MPRatingCommandEvent; // inherited from NSObject

	readonly rating: number;
}

/**
 * @since 7.1
 */
declare class MPRemoteCommand extends NSObject {

	static alloc(): MPRemoteCommand; // inherited from NSObject

	static new(): MPRemoteCommand; // inherited from NSObject

	enabled: boolean;

	addTargetAction(target: any, action: string): void;

	addTargetWithHandler(handler: (p1: MPRemoteCommandEvent) => MPRemoteCommandHandlerStatus): any;

	removeTarget(target: any): void;

	removeTargetAction(target: any, action: string): void;
}

/**
 * @since 7.1
 */
declare class MPRemoteCommandCenter extends NSObject {

	static alloc(): MPRemoteCommandCenter; // inherited from NSObject

	static new(): MPRemoteCommandCenter; // inherited from NSObject

	static sharedCommandCenter(): MPRemoteCommandCenter;

	readonly bookmarkCommand: MPFeedbackCommand;

	/**
	 * @since 9.1
	 */
	readonly changePlaybackPositionCommand: MPChangePlaybackPositionCommand;

	readonly changePlaybackRateCommand: MPChangePlaybackRateCommand;

	readonly changeRepeatModeCommand: MPChangeRepeatModeCommand;

	readonly changeShuffleModeCommand: MPChangeShuffleModeCommand;

	/**
	 * @since 9.0
	 */
	readonly disableLanguageOptionCommand: MPRemoteCommand;

	readonly dislikeCommand: MPFeedbackCommand;

	/**
	 * @since 9.0
	 */
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

/**
 * @since 7.1
 */
declare class MPRemoteCommandEvent extends NSObject {

	static alloc(): MPRemoteCommandEvent; // inherited from NSObject

	static new(): MPRemoteCommandEvent; // inherited from NSObject

	readonly command: MPRemoteCommand;

	readonly timestamp: number;
}

/**
 * @since 7.1
 */
declare const enum MPRemoteCommandHandlerStatus {

	Success = 0,

	NoSuchContent = 100,

	NoActionableNowPlayingItem = 110,

	DeviceNotFound = 120,

	CommandFailed = 200
}

/**
 * @since 3.0
 */
declare const enum MPRepeatType {

	Off = 0,

	One = 1,

	All = 2
}

/**
 * @since 7.1
 */
declare class MPSeekCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPSeekCommandEvent; // inherited from NSObject

	static new(): MPSeekCommandEvent; // inherited from NSObject

	readonly type: MPSeekCommandEventType;
}

/**
 * @since 7.1
 */
declare const enum MPSeekCommandEventType {

	BeginSeeking = 0,

	EndSeeking = 1
}

/**
 * @since 3.0
 */
declare const enum MPShuffleType {

	Off = 0,

	Items = 1,

	Collections = 2
}

/**
 * @since 7.1
 */
declare class MPSkipIntervalCommand extends MPRemoteCommand {

	static alloc(): MPSkipIntervalCommand; // inherited from NSObject

	static new(): MPSkipIntervalCommand; // inherited from NSObject

	preferredIntervals: NSArray<number>;
}

/**
 * @since 7.1
 */
declare class MPSkipIntervalCommandEvent extends MPRemoteCommandEvent {

	static alloc(): MPSkipIntervalCommandEvent; // inherited from NSObject

	static new(): MPSkipIntervalCommandEvent; // inherited from NSObject

	readonly interval: number;
}

interface MPSystemMusicPlayerController extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	openToPlayQueueDescriptor(queueDescriptor: MPMusicPlayerQueueDescriptor): void;
}
declare var MPSystemMusicPlayerController: {

	prototype: MPSystemMusicPlayerController;
};

/**
 * @since 4.0
 * @deprecated 9.0
 */
declare class MPTimedMetadata extends NSObject {

	static alloc(): MPTimedMetadata; // inherited from NSObject

	static new(): MPTimedMetadata; // inherited from NSObject

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly allMetadata: NSDictionary<any, any>;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly key: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly keyspace: string;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly timestamp: number;

	/**
	 * @since 3.2
	 * @deprecated 9.0
	 */
	readonly value: any;
}

/**
 * @since 2.0
 * @deprecated 11.3
 */
declare function MPVolumeSettingsAlertHide(): void;

/**
 * @since 2.0
 * @deprecated 11.3
 */
declare function MPVolumeSettingsAlertIsVisible(): boolean;

/**
 * @since 2.0
 * @deprecated 11.3
 */
declare function MPVolumeSettingsAlertShow(): void;

/**
 * @since 2.0
 */
declare class MPVolumeView extends UIView implements NSCoding {

	static alloc(): MPVolumeView; // inherited from NSObject

	static appearance(): MPVolumeView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): MPVolumeView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): MPVolumeView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MPVolumeView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): MPVolumeView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): MPVolumeView; // inherited from UIAppearance

	static new(): MPVolumeView; // inherited from NSObject

	/**
	 * @since 4.2
	 * @deprecated 13.0
	 */
	showsRouteButton: boolean;

	/**
	 * @since 4.2
	 */
	showsVolumeSlider: boolean;

	/**
	 * @since 7.0
	 * @deprecated 17.0
	 */
	volumeWarningSliderImage: UIImage;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	readonly wirelessRouteActive: boolean;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	readonly wirelessRoutesAvailable: boolean;

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 6.0
	 */
	maximumVolumeSliderImageForState(state: UIControlState): UIImage;

	/**
	 * @since 6.0
	 */
	minimumVolumeSliderImageForState(state: UIControlState): UIImage;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	routeButtonImageForState(state: UIControlState): UIImage;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	routeButtonRectForBounds(bounds: CGRect): CGRect;

	/**
	 * @since 6.0
	 */
	setMaximumVolumeSliderImageForState(image: UIImage, state: UIControlState): void;

	/**
	 * @since 6.0
	 */
	setMinimumVolumeSliderImageForState(image: UIImage, state: UIControlState): void;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	setRouteButtonImageForState(image: UIImage, state: UIControlState): void;

	/**
	 * @since 6.0
	 */
	setVolumeThumbImageForState(image: UIImage, state: UIControlState): void;

	/**
	 * @since 6.0
	 */
	volumeSliderRectForBounds(bounds: CGRect): CGRect;

	/**
	 * @since 6.0
	 */
	volumeThumbImageForState(state: UIControlState): UIImage;

	/**
	 * @since 6.0
	 */
	volumeThumbRectForBoundsVolumeSliderRectValue(bounds: CGRect, rect: CGRect, value: number): CGRect;
}

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare var MPVolumeViewWirelessRouteActiveDidChangeNotification: string;

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare var MPVolumeViewWirelessRoutesAvailableDidChangeNotification: string;
