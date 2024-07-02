
/**
 * @since 15.0
 */
declare class SHCatalog extends NSObject {

	static alloc(): SHCatalog; // inherited from NSObject

	static new(): SHCatalog; // inherited from NSObject

	readonly maximumQuerySignatureDuration: number;

	readonly minimumQuerySignatureDuration: number;
}

/**
 * @since 15.0
 */
declare class SHCustomCatalog extends SHCatalog {

	static alloc(): SHCustomCatalog; // inherited from NSObject

	static new(): SHCustomCatalog; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	readonly dataRepresentation: NSData;

	/**
	 * @since 18.0
	 */
	constructor(o: { dataRepresentation: NSData; });

	addCustomCatalogFromURLError(customCatalogURL: NSURL): boolean;

	addReferenceSignatureRepresentingMediaItemsError(signature: SHSignature, mediaItems: NSArray<SHMediaItem> | SHMediaItem[]): boolean;

	/**
	 * @since 18.0
	 */
	initWithDataRepresentationError(dataRepresentation: NSData): this;

	/**
	 * @since 15.0
	 * @deprecated 18.0
	 */
	writeToURLError(destinationURL: NSURL): boolean;
}

declare const enum SHErrorCode {

	InvalidAudioFormat = 100,

	AudioDiscontinuity = 101,

	SignatureInvalid = 200,

	SignatureDurationInvalid = 201,

	MatchAttemptFailed = 202,

	CustomCatalogInvalid = 300,

	CustomCatalogInvalidURL = 301,

	MediaLibrarySyncFailed = 400,

	InternalError = 500,

	MediaItemFetchFailed = 600
}

/**
 * @since 15.0
 */
declare var SHErrorDomain: string;

/**
 * @since 15.0
 */
declare class SHMatch extends NSObject implements NSSecureCoding {

	static alloc(): SHMatch; // inherited from NSObject

	static new(): SHMatch; // inherited from NSObject

	readonly mediaItems: NSArray<SHMatchedMediaItem>;

	readonly querySignature: SHSignature;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
declare class SHMatchedMediaItem extends SHMediaItem implements NSSecureCoding {

	static alloc(): SHMatchedMediaItem; // inherited from NSObject

	static mediaItemWithProperties(properties: NSDictionary<string, any>): SHMatchedMediaItem; // inherited from SHMediaItem

	static new(): SHMatchedMediaItem; // inherited from NSObject

	readonly frequencySkew: number;

	readonly matchOffset: number;

	readonly predictedCurrentMatchOffset: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
declare class SHMediaItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SHMediaItem; // inherited from NSObject

	static fetchMediaItemWithShazamIDCompletionHandler(shazamID: string, completionHandler: (p1: SHMediaItem, p2: NSError) => void): void;

	static mediaItemWithProperties(properties: NSDictionary<string, any>): SHMediaItem;

	static new(): SHMediaItem; // inherited from NSObject

	readonly appleMusicID: string;

	readonly appleMusicURL: NSURL;

	readonly artist: string;

	readonly artworkURL: NSURL;

	/**
	 * @since 17.0
	 */
	readonly creationDate: Date;

	readonly explicitContent: boolean;

	/**
	 * @since 16.0
	 */
	readonly frequencySkewRanges: NSArray<SHRange>;

	readonly genres: NSArray<string>;

	readonly isrc: string;

	readonly shazamID: string;

	readonly subtitle: string;

	/**
	 * @since 16.0
	 */
	readonly timeRanges: NSArray<SHRange>;

	readonly title: string;

	readonly videoURL: NSURL;

	readonly webURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	objectForKeyedSubscript(key: string): any;

	valueForProperty(property: string): any;
}

/**
 * @since 15.0
 */
declare var SHMediaItemAppleMusicID: string;

/**
 * @since 15.0
 */
declare var SHMediaItemAppleMusicURL: string;

/**
 * @since 15.0
 */
declare var SHMediaItemArtist: string;

/**
 * @since 15.0
 */
declare var SHMediaItemArtworkURL: string;

/**
 * @since 17.0
 */
declare var SHMediaItemCreationDate: string;

/**
 * @since 15.0
 */
declare var SHMediaItemExplicitContent: string;

/**
 * @since 15.0
 */
declare var SHMediaItemFrequencySkew: string;

/**
 * @since 16.0
 */
declare var SHMediaItemFrequencySkewRanges: string;

/**
 * @since 15.0
 */
declare var SHMediaItemGenres: string;

/**
 * @since 15.0
 */
declare var SHMediaItemISRC: string;

/**
 * @since 15.0
 */
declare var SHMediaItemMatchOffset: string;

/**
 * @since 15.0
 */
declare var SHMediaItemShazamID: string;

/**
 * @since 15.0
 */
declare var SHMediaItemSubtitle: string;

/**
 * @since 16.0
 */
declare var SHMediaItemTimeRanges: string;

/**
 * @since 15.0
 */
declare var SHMediaItemTitle: string;

/**
 * @since 15.0
 */
declare var SHMediaItemVideoURL: string;

/**
 * @since 15.0
 */
declare var SHMediaItemWebURL: string;

/**
 * @since 15.0
 * @deprecated 18.0
 */
declare class SHMediaLibrary extends NSObject {

	static alloc(): SHMediaLibrary; // inherited from NSObject

	static new(): SHMediaLibrary; // inherited from NSObject

	static readonly defaultLibrary: SHMediaLibrary;

	addMediaItemsCompletionHandler(mediaItems: NSArray<SHMediaItem> | SHMediaItem[], completionHandler: (p1: NSError) => void): void;
}

/**
 * @since 16.0
 */
declare class SHRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SHRange; // inherited from NSObject

	static new(): SHRange; // inherited from NSObject

	static rangeWithLowerBoundUpperBound(lowerBound: number, upperBound: number): SHRange;

	readonly lowerBound: number;

	readonly upperBound: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { lowerBound: number; upperBound: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithLowerBoundUpperBound(lowerBound: number, upperBound: number): this;
}

/**
 * @since 15.0
 */
declare class SHSession extends NSObject {

	static alloc(): SHSession; // inherited from NSObject

	static new(): SHSession; // inherited from NSObject

	readonly catalog: SHCatalog;

	delegate: SHSessionDelegate;

	constructor(o: { catalog: SHCatalog; });

	initWithCatalog(catalog: SHCatalog): this;

	matchSignature(signature: SHSignature): void;

	matchStreamingBufferAtTime(buffer: AVAudioPCMBuffer, time: AVAudioTime): void;
}

/**
 * @since 15.0
 */
interface SHSessionDelegate extends NSObjectProtocol {

	sessionDidFindMatch?(session: SHSession, match: SHMatch): void;

	sessionDidNotFindMatchForSignatureError?(session: SHSession, signature: SHSignature, error: NSError): void;
}
declare var SHSessionDelegate: {

	prototype: SHSessionDelegate;
};

/**
 * @since 15.0
 */
declare class SHSignature extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SHSignature; // inherited from NSObject

	static new(): SHSignature; // inherited from NSObject

	static signatureWithDataRepresentationError(dataRepresentation: NSData): SHSignature;

	readonly dataRepresentation: NSData;

	readonly duration: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { dataRepresentation: NSData; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDataRepresentationError(dataRepresentation: NSData): this;
}

/**
 * @since 15.0
 */
declare class SHSignatureGenerator extends NSObject {

	static alloc(): SHSignatureGenerator; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static generateSignatureFromAssetCompletionHandler(asset: AVAsset, completionHandler: (p1: SHSignature, p2: NSError) => void): void;

	static new(): SHSignatureGenerator; // inherited from NSObject

	appendBufferAtTimeError(buffer: AVAudioPCMBuffer, time: AVAudioTime): boolean;

	signature(): SHSignature;
}
