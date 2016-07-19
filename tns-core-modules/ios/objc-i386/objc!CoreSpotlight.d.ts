
declare class CSCustomAttributeKey extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSCustomAttributeKey; // inherited from NSObject

	static new(): CSCustomAttributeKey; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ keyName: string;

	/* readonly */ multiValued: boolean;

	/* readonly */ searchable: boolean;

	/* readonly */ searchableByDefault: boolean;

	/* readonly */ unique: boolean;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { keyName: string; });

	constructor(o: { keyName: string; searchable: boolean; searchableByDefault: boolean; unique: boolean; multiValued: boolean; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CSCustomAttributeKey; // inherited from NSObjectProtocol
}

declare const enum CSIndexErrorCode {

	UnknownError = -1,

	IndexUnavailableError = -1000,

	InvalidItemError = -1001,

	InvalidClientStateError = -1002,

	RemoteConnectionError = -1003,

	QuotaExceeded = -1004,

	IndexingUnsupported = -1005
}

declare var CSIndexErrorDomain: string;

declare class CSIndexExtensionRequestHandler extends NSObject implements CSSearchableIndexDelegate, NSExtensionRequestHandling {

	static alloc(): CSIndexExtensionRequestHandler; // inherited from NSObject

	static new(): CSIndexExtensionRequestHandler; // inherited from NSObject

	constructor(); // inherited from NSObject

	beginRequestWithExtensionContext(context: NSExtensionContext): void; // inherited from NSExtensionRequestHandling

	searchableIndexDidFinishThrottle(searchableIndex: CSSearchableIndex): void; // inherited from CSSearchableIndexDelegate

	searchableIndexDidThrottle(searchableIndex: CSSearchableIndex): void; // inherited from CSSearchableIndexDelegate

	searchableIndexReindexAllSearchableItemsWithAcknowledgementHandler(searchableIndex: CSSearchableIndex, acknowledgementHandler: () => void): void; // inherited from CSSearchableIndexDelegate

	searchableIndexReindexSearchableItemsWithIdentifiersAcknowledgementHandler(searchableIndex: CSSearchableIndex, identifiers: NSArray<string>, acknowledgementHandler: () => void): void; // inherited from CSSearchableIndexDelegate

	self(): CSIndexExtensionRequestHandler; // inherited from NSObjectProtocol
}

declare class CSLocalizedString extends NSString {

	static string(): CSLocalizedString; // inherited from NSString

	static stringWithCStringEncoding(cString: string, enc: number): CSLocalizedString; // inherited from NSString

	static stringWithCharactersLength(characters: interop.Reference<string>, length: number): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfFileEncodingError(path: string, enc: number): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfFileUsedEncodingError(path: string, enc: interop.Reference<number>): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfURLEncodingError(url: NSURL, enc: number): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Reference<number>): CSLocalizedString; // inherited from NSString

	static stringWithString(string: string): CSLocalizedString; // inherited from NSString

	static stringWithUTF8String(nullTerminatedCString: string): CSLocalizedString; // inherited from NSString

	constructor(o: { bytes: interop.Pointer; length: number; encoding: number; }); // inherited from NSString

	constructor(o: { bytesNoCopy: interop.Pointer; length: number; encoding: number; freeWhenDone: boolean; }); // inherited from NSString

	constructor(o: { CString: string; }); // inherited from NSString

	constructor(o: { CString: string; encoding: number; }); // inherited from NSString

	constructor(o: { CString: string; length: number; }); // inherited from NSString

	constructor(o: { CStringNoCopy: string; length: number; freeWhenDone: boolean; }); // inherited from NSString

	constructor(o: { characters: interop.Reference<string>; length: number; }); // inherited from NSString

	constructor(o: { charactersNoCopy: interop.Reference<string>; length: number; freeWhenDone: boolean; }); // inherited from NSString

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { contentsOfFile: string; }); // inherited from NSString

	constructor(o: { contentsOfFile: string; encoding: number; }); // inherited from NSString

	constructor(o: { contentsOfFile: string; usedEncoding: interop.Reference<number>; }); // inherited from NSString

	constructor(o: { contentsOfURL: NSURL; }); // inherited from NSString

	constructor(o: { contentsOfURL: NSURL; encoding: number; }); // inherited from NSString

	constructor(o: { contentsOfURL: NSURL; usedEncoding: interop.Reference<number>; }); // inherited from NSString

	constructor(o: { data: NSData; encoding: number; }); // inherited from NSString

	constructor(o: { localizedStrings: NSDictionary<any, any>; });

	constructor(o: { string: string; }); // inherited from NSString

	constructor(o: { UTF8String: string; }); // inherited from NSString

	localizedString(): string;

	self(): CSLocalizedString; // inherited from NSObjectProtocol
}

declare var CSMailboxArchive: string;

declare var CSMailboxDrafts: string;

declare var CSMailboxInbox: string;

declare var CSMailboxJunk: string;

declare var CSMailboxSent: string;

declare var CSMailboxTrash: string;

declare class CSPerson extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSPerson; // inherited from NSObject

	static new(): CSPerson; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	contactIdentifier: string;

	/* readonly */ displayName: string;

	/* readonly */ handleIdentifier: string;

	/* readonly */ handles: NSArray<string>;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { displayName: string; handles: NSArray<string>; handleIdentifier: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CSPerson; // inherited from NSObjectProtocol
}

declare class CSSearchableIndex extends NSObject {

	static alloc(): CSSearchableIndex; // inherited from NSObject

	static defaultSearchableIndex(): CSSearchableIndex;

	static isIndexingAvailable(): boolean;

	static new(): CSSearchableIndex; // inherited from NSObject

	indexDelegate: CSSearchableIndexDelegate;

	constructor(); // inherited from NSObject

	constructor(o: { name: string; });

	constructor(o: { name: string; protectionClass: string; });

	beginIndexBatch(): void;

	deleteAllSearchableItemsWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	deleteSearchableItemsWithDomainIdentifiersCompletionHandler(domainIdentifiers: NSArray<string>, completionHandler: (p1: NSError) => void): void;

	deleteSearchableItemsWithIdentifiersCompletionHandler(identifiers: NSArray<string>, completionHandler: (p1: NSError) => void): void;

	endIndexBatchWithClientStateCompletionHandler(clientState: NSData, completionHandler: (p1: NSError) => void): void;

	fetchLastClientStateWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	indexSearchableItemsCompletionHandler(items: NSArray<CSSearchableItem>, completionHandler: (p1: NSError) => void): void;

	self(): CSSearchableIndex; // inherited from NSObjectProtocol
}

interface CSSearchableIndexDelegate extends NSObjectProtocol {

	searchableIndexDidFinishThrottle?(searchableIndex: CSSearchableIndex): void;

	searchableIndexDidThrottle?(searchableIndex: CSSearchableIndex): void;

	searchableIndexReindexAllSearchableItemsWithAcknowledgementHandler(searchableIndex: CSSearchableIndex, acknowledgementHandler: () => void): void;

	searchableIndexReindexSearchableItemsWithIdentifiersAcknowledgementHandler(searchableIndex: CSSearchableIndex, identifiers: NSArray<string>, acknowledgementHandler: () => void): void;
}
declare var CSSearchableIndexDelegate: {

	prototype: CSSearchableIndexDelegate;
};

declare class CSSearchableItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSSearchableItem; // inherited from NSObject

	static new(): CSSearchableItem; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	attributeSet: CSSearchableItemAttributeSet;

	domainIdentifier: string;

	expirationDate: Date;

	uniqueIdentifier: string;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { uniqueIdentifier: string; domainIdentifier: string; attributeSet: CSSearchableItemAttributeSet; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CSSearchableItem; // inherited from NSObjectProtocol
}

declare var CSSearchableItemActionType: string;

declare var CSSearchableItemActivityIdentifier: string;

declare class CSSearchableItemAttributeSet extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSSearchableItemAttributeSet; // inherited from NSObject

	static new(): CSSearchableItemAttributeSet; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	EXIFGPSVersion: string;

	EXIFVersion: string;

	GPSAreaInformation: string;

	GPSDOP: number;

	GPSDateStamp: Date;

	GPSDestBearing: number;

	GPSDestDistance: number;

	GPSDestLatitude: number;

	GPSDestLongitude: number;

	GPSDifferental: number;

	GPSMapDatum: string;

	GPSMeasureMode: string;

	GPSProcessingMethod: string;

	GPSStatus: string;

	GPSTrack: number;

	HTMLContentData: NSData;

	ISOSpeed: number;

	URL: NSURL;

	accountHandles: NSArray<string>;

	accountIdentifier: string;

	acquisitionMake: string;

	acquisitionModel: string;

	addedDate: Date;

	additionalRecipients: NSArray<CSPerson>;

	album: string;

	allDay: number;

	alternateNames: NSArray<string>;

	altitude: number;

	aperture: number;

	artist: string;

	audiences: NSArray<string>;

	audioBitRate: number;

	audioChannelCount: number;

	audioEncodingApplication: string;

	audioSampleRate: number;

	audioTrackNumber: number;

	authorAddresses: NSArray<string>;

	authorEmailAddresses: NSArray<string>;

	authorNames: NSArray<string>;

	authors: NSArray<CSPerson>;

	bitsPerSample: number;

	cameraOwner: string;

	city: string;

	codecs: NSArray<string>;

	colorSpace: string;

	comment: string;

	completionDate: Date;

	composer: string;

	contactKeywords: NSArray<string>;

	containerDisplayName: string;

	containerIdentifier: string;

	containerOrder: number;

	containerTitle: string;

	contentCreationDate: Date;

	contentDescription: string;

	contentModificationDate: Date;

	contentRating: number;

	contentSources: NSArray<string>;

	contentType: string;

	contentTypeTree: NSArray<string>;

	contentURL: NSURL;

	contributors: NSArray<string>;

	copyright: string;

	country: string;

	coverage: NSArray<string>;

	creator: string;

	deliveryType: number;

	director: string;

	displayName: string;

	downloadedDate: Date;

	dueDate: Date;

	duration: number;

	editors: NSArray<string>;

	emailAddresses: NSArray<string>;

	emailHeaders: NSDictionary<string, NSArray<any>>;

	encodingApplications: NSArray<string>;

	endDate: Date;

	exposureMode: number;

	exposureProgram: string;

	exposureTime: number;

	exposureTimeString: string;

	fNumber: number;

	fileSize: number;

	flashOn: number;

	focalLength: number;

	focalLength35mm: number;

	fontNames: NSArray<string>;

	generalMIDISequence: number;

	genre: string;

	hasAlphaChannel: number;

	headline: string;

	hiddenAdditionalRecipients: NSArray<CSPerson>;

	identifier: string;

	imageDirection: number;

	importantDates: NSArray<Date>;

	information: string;

	instantMessageAddresses: NSArray<string>;

	instructions: string;

	keySignature: string;

	keywords: NSArray<string>;

	kind: string;

	languages: NSArray<string>;

	lastUsedDate: Date;

	latitude: number;

	layerNames: NSArray<string>;

	lensModel: string;

	likelyJunk: number;

	local: number;

	longitude: number;

	lyricist: string;

	mailboxIdentifiers: NSArray<string>;

	maxAperture: number;

	mediaTypes: NSArray<string>;

	metadataModificationDate: Date;

	meteringMode: string;

	musicalGenre: string;

	musicalInstrumentCategory: string;

	musicalInstrumentName: string;

	namedLocation: string;

	organizations: NSArray<string>;

	orientation: number;

	originalFormat: string;

	originalSource: string;

	pageCount: number;

	pageHeight: number;

	pageWidth: number;

	participants: NSArray<string>;

	path: string;

	performers: NSArray<string>;

	phoneNumbers: NSArray<string>;

	pixelCount: number;

	pixelHeight: number;

	pixelWidth: number;

	playCount: number;

	primaryRecipients: NSArray<CSPerson>;

	producer: string;

	profileName: string;

	projects: NSArray<string>;

	publishers: NSArray<string>;

	rating: number;

	ratingDescription: string;

	recipientAddresses: NSArray<string>;

	recipientEmailAddresses: NSArray<string>;

	recipientNames: NSArray<string>;

	recordingDate: Date;

	redEyeOn: number;

	relatedUniqueIdentifier: string;

	resolutionHeightDPI: number;

	resolutionWidthDPI: number;

	rights: string;

	role: string;

	securityMethod: string;

	speed: number;

	startDate: Date;

	stateOrProvince: string;

	streamable: number;

	subject: string;

	supportsNavigation: number;

	supportsPhoneCall: number;

	tempo: number;

	textContent: string;

	theme: string;

	thumbnailData: NSData;

	thumbnailURL: NSURL;

	timeSignature: string;

	timestamp: Date;

	title: string;

	totalBitRate: number;

	version: string;

	videoBitRate: number;

	whiteBalance: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { itemContentType: string; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CSSearchableItemAttributeSet; // inherited from NSObjectProtocol

	setValueForCustomKey(value: NSSecureCoding, key: CSCustomAttributeKey): void;

	valueForCustomKey(key: CSCustomAttributeKey): NSSecureCoding;
}

declare var CoreSpotlightVersionNumber: number;

declare var CoreSpotlightVersionString: interop.Reference<number>;
