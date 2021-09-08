
declare class SHCatalog extends NSObject {

	static alloc(): SHCatalog; // inherited from NSObject

	static new(): SHCatalog; // inherited from NSObject

	readonly maximumQuerySignatureDuration: number;

	readonly minimumQuerySignatureDuration: number;
}

declare class SHCustomCatalog extends SHCatalog {

	static alloc(): SHCustomCatalog; // inherited from NSObject

	static new(): SHCustomCatalog; // inherited from NSObject

	addCustomCatalogFromURLError(customCatalogURL: NSURL): boolean;

	addReferenceSignatureRepresentingMediaItemsError(signature: SHSignature, mediaItems: NSArray<SHMediaItem> | SHMediaItem[]): boolean;

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

	MediaLibrarySyncFailed = 400
}

declare var SHErrorDomain: string;

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

declare class SHMediaItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SHMediaItem; // inherited from NSObject

	static fetchMediaItemWithShazamIDCompletionHandler(shazamID: string, completionHandler: (p1: SHMediaItem, p2: NSError) => void): void;

	static mediaItemWithProperties(properties: NSDictionary<string, any>): SHMediaItem;

	static new(): SHMediaItem; // inherited from NSObject

	readonly appleMusicID: string;

	readonly appleMusicURL: NSURL;

	readonly artist: string;

	readonly artworkURL: NSURL;

	readonly explicitContent: boolean;

	readonly genres: NSArray<string>;

	readonly isrc: string;

	readonly shazamID: string;

	readonly subtitle: string;

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

declare var SHMediaItemAppleMusicID: string;

declare var SHMediaItemAppleMusicURL: string;

declare var SHMediaItemArtist: string;

declare var SHMediaItemArtworkURL: string;

declare var SHMediaItemExplicitContent: string;

declare var SHMediaItemFrequencySkew: string;

declare var SHMediaItemGenres: string;

declare var SHMediaItemISRC: string;

declare var SHMediaItemMatchOffset: string;

declare var SHMediaItemShazamID: string;

declare var SHMediaItemSubtitle: string;

declare var SHMediaItemTitle: string;

declare var SHMediaItemVideoURL: string;

declare var SHMediaItemWebURL: string;

declare class SHMediaLibrary extends NSObject {

	static alloc(): SHMediaLibrary; // inherited from NSObject

	static new(): SHMediaLibrary; // inherited from NSObject

	static readonly defaultLibrary: SHMediaLibrary;

	addMediaItemsCompletionHandler(mediaItems: NSArray<SHMediaItem> | SHMediaItem[], completionHandler: (p1: NSError) => void): void;
}

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

interface SHSessionDelegate extends NSObjectProtocol {

	sessionDidFindMatch?(session: SHSession, match: SHMatch): void;

	sessionDidNotFindMatchForSignatureError?(session: SHSession, signature: SHSignature, error: NSError): void;
}
declare var SHSessionDelegate: {

	prototype: SHSessionDelegate;
};

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

declare class SHSignatureGenerator extends NSObject {

	static alloc(): SHSignatureGenerator; // inherited from NSObject

	static new(): SHSignatureGenerator; // inherited from NSObject

	appendBufferAtTimeError(buffer: AVAudioPCMBuffer, time: AVAudioTime): boolean;

	signature(): SHSignature;
}
