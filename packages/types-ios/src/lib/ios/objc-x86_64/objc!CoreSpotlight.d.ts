
/**
 * @since 15.0
 */
declare var CSActionIdentifier: string;

/**
 * @since 9.0
 */
declare class CSCustomAttributeKey extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSCustomAttributeKey; // inherited from NSObject

	static new(): CSCustomAttributeKey; // inherited from NSObject

	readonly keyName: string;

	readonly multiValued: boolean;

	readonly searchable: boolean;

	readonly searchableByDefault: boolean;

	readonly unique: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { keyName: string; });

	constructor(o: { keyName: string; searchable: boolean; searchableByDefault: boolean; unique: boolean; multiValued: boolean; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithKeyName(keyName: string): this;

	initWithKeyNameSearchableSearchableByDefaultUniqueMultiValued(keyName: string, searchable: boolean, searchableByDefault: boolean, unique: boolean, multiValued: boolean): this;
}

/**
 * @since 15.0
 */
declare class CSImportExtension extends NSObject implements NSExtensionRequestHandling {

	static alloc(): CSImportExtension; // inherited from NSObject

	static new(): CSImportExtension; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;

	updateAttributesForFileAtURLError(attributes: CSSearchableItemAttributeSet, contentURL: NSURL, error?: interop.Reference<NSError>): boolean;
}

/**
 * @since 9.0
 */
declare const enum CSIndexErrorCode {

	UnknownError = -1,

	IndexUnavailableError = -1000,

	InvalidItemError = -1001,

	InvalidClientStateError = -1002,

	RemoteConnectionError = -1003,

	QuotaExceeded = -1004,

	IndexingUnsupported = -1005,

	MismatchedClientState = -1006
}

/**
 * @since 9.0
 */
declare var CSIndexErrorDomain: string;

/**
 * @since 9.0
 */
declare class CSIndexExtensionRequestHandler extends NSObject implements CSSearchableIndexDelegate, NSExtensionRequestHandling {

	static alloc(): CSIndexExtensionRequestHandler; // inherited from NSObject

	static new(): CSIndexExtensionRequestHandler; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginRequestWithExtensionContext(context: NSExtensionContext): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 11.0
	 */
	dataForSearchableIndexItemIdentifierTypeIdentifierError(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string, error?: interop.Reference<NSError>): NSData | null;

	/**
	 * @since 11.0
	 */
	fileURLForSearchableIndexItemIdentifierTypeIdentifierInPlaceError(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string, inPlace: boolean, error?: interop.Reference<NSError>): NSURL | null;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	searchableIndexDidFinishThrottle(searchableIndex: CSSearchableIndex): void;

	searchableIndexDidThrottle(searchableIndex: CSSearchableIndex): void;

	searchableIndexReindexAllSearchableItemsWithAcknowledgementHandler(searchableIndex: CSSearchableIndex, acknowledgementHandler: () => void): void;

	searchableIndexReindexSearchableItemsWithIdentifiersAcknowledgementHandler(searchableIndex: CSSearchableIndex, identifiers: NSArray<string> | string[], acknowledgementHandler: () => void): void;

	/**
	 * @since 18.4
	 */
	searchableItemsDidUpdate(items: NSArray<CSSearchableItem> | CSSearchableItem[]): void;

	/**
	 * @since 18.4
	 */
	searchableItemsForIdentifiersSearchableItemsHandler(identifiers: NSArray<string> | string[], searchableItemsHandler: (p1: NSArray<CSSearchableItem>) => void): void;

	self(): this;
}

/**
 * @since 9.0
 */
declare class CSLocalizedString extends NSString {

	static alloc(): CSLocalizedString; // inherited from NSObject

	static new(): CSLocalizedString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string, error?: interop.Reference<NSError>): CSLocalizedString; // inherited from NSItemProviderReading

	static string(): CSLocalizedString; // inherited from NSString

	static stringWithCStringEncoding(cString: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null, enc: number): CSLocalizedString; // inherited from NSString

	static stringWithCharactersLength(characters: interop.Pointer | interop.Reference<string> | ArrayBufferLike | ArrayBufferView, length: number): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfFileEncodingError(path: string, enc: number, error?: interop.Reference<NSError>): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfFileUsedEncodingError(path: string, enc: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, error?: interop.Reference<NSError>): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfURLEncodingError(url: NSURL, enc: number, error?: interop.Reference<NSError>): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView | null, error?: interop.Reference<NSError>): CSLocalizedString; // inherited from NSString

	static stringWithString(string: string): CSLocalizedString; // inherited from NSString

	static stringWithUTF8String(nullTerminatedCString: string | interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): CSLocalizedString; // inherited from NSString

	constructor(o: { localizedStrings: NSDictionary<any, any>; });

	initWithLocalizedStrings(localizedStrings: NSDictionary<any, any>): this;

	localizedString(): string;
}

/**
 * @since 9.0
 */
declare var CSMailboxArchive: string;

/**
 * @since 9.0
 */
declare var CSMailboxDrafts: string;

/**
 * @since 9.0
 */
declare var CSMailboxInbox: string;

/**
 * @since 9.0
 */
declare var CSMailboxJunk: string;

/**
 * @since 9.0
 */
declare var CSMailboxSent: string;

/**
 * @since 9.0
 */
declare var CSMailboxTrash: string;

/**
 * @since 9.0
 */
declare class CSPerson extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSPerson; // inherited from NSObject

	static new(): CSPerson; // inherited from NSObject

	contactIdentifier: string | null;

	readonly displayName: string | null;

	readonly handleIdentifier: string;

	readonly handles: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { displayName: string | null; handles: NSArray<string> | string[]; handleIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDisplayNameHandlesHandleIdentifier(displayName: string | null, handles: NSArray<string> | string[], handleIdentifier: string): this;
}

/**
 * @since 10.0
 */
declare var CSQueryContinuationActionType: string;

/**
 * @since 10.0
 */
declare class CSSearchQuery extends NSObject {

	static alloc(): CSSearchQuery; // inherited from NSObject

	static new(): CSSearchQuery; // inherited from NSObject

	readonly cancelled: boolean;

	completionHandler: (p1: NSError | null) => void | null;

	readonly foundItemCount: number;

	foundItemsHandler: (p1: NSArray<CSSearchableItem>) => void | null;

	protectionClasses: NSArray<string>;

	/**
	 * @since 10.0
	 * @deprecated 16.0
	 */
	constructor(o: { queryString: string; attributes: NSArray<string> | string[] | null; });

	/**
	 * @since 16.0
	 */
	constructor(o: { queryString: string; queryContext: CSSearchQueryContext | null; });

	cancel(): void;

	/**
	 * @since 10.0
	 * @deprecated 16.0
	 */
	initWithQueryStringAttributes(queryString: string, attributes: NSArray<string> | string[] | null): this;

	/**
	 * @since 16.0
	 */
	initWithQueryStringQueryContext(queryString: string, queryContext: CSSearchQueryContext | null): this;

	start(): void;
}

/**
 * @since 10.0
 */
declare class CSSearchQueryContext extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSSearchQueryContext; // inherited from NSObject

	static new(): CSSearchQueryContext; // inherited from NSObject

	fetchAttributes: NSArray<string>;

	filterQueries: NSArray<string>;

	keyboardLanguage: string | null;

	sourceOptions: CSSearchQuerySourceOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare const enum CSSearchQueryErrorCode {

	Unknown = -2000,

	IndexUnreachable = -2001,

	InvalidQuery = -2002,

	Cancelled = -2003
}

/**
 * @since 10.0
 */
declare var CSSearchQueryErrorDomain: string;

declare const enum CSSearchQuerySourceOptions {

	Default = 0,

	AllowMail = 1
}

/**
 * @since 10.0
 */
declare var CSSearchQueryString: string;

/**
 * @since 9.0
 */
declare class CSSearchableIndex extends NSObject {

	static alloc(): CSSearchableIndex; // inherited from NSObject

	static defaultSearchableIndex(): CSSearchableIndex;

	static isIndexingAvailable(): boolean;

	static new(): CSSearchableIndex; // inherited from NSObject

	indexDelegate: CSSearchableIndexDelegate | null;

	constructor(o: { name: string; });

	constructor(o: { name: string; protectionClass: string | null; });

	beginIndexBatch(): void;

	deleteAllSearchableItemsWithCompletionHandler(completionHandler: (p1: NSError | null) => void | null): void;

	deleteSearchableItemsWithDomainIdentifiersCompletionHandler(domainIdentifiers: NSArray<string> | string[], completionHandler: (p1: NSError | null) => void | null): void;

	deleteSearchableItemsWithIdentifiersCompletionHandler(identifiers: NSArray<string> | string[], completionHandler: (p1: NSError | null) => void | null): void;

	endIndexBatchWithClientStateCompletionHandler(clientState: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	/**
	 * @since 18.0
	 */
	endIndexBatchWithExpectedClientStateNewClientStateCompletionHandler(expectedClientState: NSData | null, newClientState: NSData, completionHandler: (p1: NSError | null) => void | null): void;

	fetchDataForBundleIdentifierItemIdentifierContentTypeCompletionHandler(bundleIdentifier: string, itemIdentifier: string, contentType: UTType, completionHandler: (p1: NSData | null, p2: NSError | null) => void): void;

	fetchLastClientStateWithCompletionHandler(completionHandler: (p1: NSData | null, p2: NSError | null) => void): void;

	indexSearchableItemsCompletionHandler(items: NSArray<CSSearchableItem> | CSSearchableItem[], completionHandler: (p1: NSError | null) => void | null): void;

	initWithName(name: string): this;

	initWithNameProtectionClass(name: string, protectionClass: string | null): this;
}

/**
 * @since 9.0
 */
interface CSSearchableIndexDelegate extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	dataForSearchableIndexItemIdentifierTypeIdentifierError?(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string, error?: interop.Reference<NSError>): NSData | null;

	/**
	 * @since 11.0
	 */
	fileURLForSearchableIndexItemIdentifierTypeIdentifierInPlaceError?(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string, inPlace: boolean, error?: interop.Reference<NSError>): NSURL | null;

	searchableIndexDidFinishThrottle?(searchableIndex: CSSearchableIndex): void;

	searchableIndexDidThrottle?(searchableIndex: CSSearchableIndex): void;

	searchableIndexReindexAllSearchableItemsWithAcknowledgementHandler(searchableIndex: CSSearchableIndex, acknowledgementHandler: () => void): void;

	searchableIndexReindexSearchableItemsWithIdentifiersAcknowledgementHandler(searchableIndex: CSSearchableIndex, identifiers: NSArray<string> | string[], acknowledgementHandler: () => void): void;

	/**
	 * @since 18.4
	 */
	searchableItemsDidUpdate?(items: NSArray<CSSearchableItem> | CSSearchableItem[]): void;

	/**
	 * @since 18.4
	 */
	searchableItemsForIdentifiersSearchableItemsHandler?(identifiers: NSArray<string> | string[], searchableItemsHandler: (p1: NSArray<CSSearchableItem>) => void): void;
}
declare var CSSearchableIndexDelegate: {

	prototype: CSSearchableIndexDelegate;
};

/**
 * @since 9.0
 */
declare class CSSearchableItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSSearchableItem; // inherited from NSObject

	static new(): CSSearchableItem; // inherited from NSObject

	attributeSet: CSSearchableItemAttributeSet;

	domainIdentifier: string | null;

	expirationDate: Date;

	/**
	 * @since 9.0
	 */
	isUpdate: boolean;

	uniqueIdentifier: string;

	/**
	 * @since 18.4
	 */
	updateListenerOptions: CSSearchableItemUpdateListenerOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { uniqueIdentifier: string | null; domainIdentifier: string | null; attributeSet: CSSearchableItemAttributeSet; });

	/**
	 * @since 16.0
	 */
	compareByRank(other: CSSearchableItem): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithUniqueIdentifierDomainIdentifierAttributeSet(uniqueIdentifier: string | null, domainIdentifier: string | null, attributeSet: CSSearchableItemAttributeSet): this;
}

/**
 * @since 9.0
 */
declare var CSSearchableItemActionType: string;

/**
 * @since 9.0
 */
declare var CSSearchableItemActivityIdentifier: string;

/**
 * @since 9.0
 */
declare class CSSearchableItemAttributeSet extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSSearchableItemAttributeSet; // inherited from NSObject

	static new(): CSSearchableItemAttributeSet; // inherited from NSObject

	EXIFGPSVersion: string | null;

	EXIFVersion: string | null;

	GPSAreaInformation: string | null;

	GPSDOP: number | null;

	GPSDateStamp: Date | null;

	GPSDestBearing: number | null;

	GPSDestDistance: number | null;

	GPSDestLatitude: number | null;

	GPSDestLongitude: number | null;

	GPSDifferental: number | null;

	GPSMapDatum: string | null;

	GPSMeasureMode: string | null;

	GPSProcessingMethod: string | null;

	GPSStatus: string | null;

	GPSTrack: number | null;

	HTMLContentData: NSData | null;

	ISOSpeed: number | null;

	URL: NSURL | null;

	accountHandles: NSArray<string> | null;

	accountIdentifier: string | null;

	acquisitionMake: string | null;

	acquisitionModel: string | null;

	/**
	 * @since 15.0
	 */
	actionIdentifiers: NSArray<string>;

	addedDate: Date | null;

	additionalRecipients: NSArray<CSPerson> | null;

	album: string | null;

	allDay: number | null;

	alternateNames: NSArray<string> | null;

	altitude: number | null;

	aperture: number | null;

	artist: string | null;

	audiences: NSArray<string> | null;

	audioBitRate: number | null;

	audioChannelCount: number | null;

	audioEncodingApplication: string | null;

	audioSampleRate: number | null;

	audioTrackNumber: number | null;

	authorAddresses: NSArray<string> | null;

	authorEmailAddresses: NSArray<string> | null;

	authorNames: NSArray<string> | null;

	authors: NSArray<CSPerson> | null;

	bitsPerSample: number | null;

	cameraOwner: string | null;

	city: string | null;

	codecs: NSArray<string> | null;

	colorSpace: string | null;

	comment: string | null;

	completionDate: Date | null;

	composer: string | null;

	contactKeywords: NSArray<string> | null;

	containerDisplayName: string | null;

	containerIdentifier: string | null;

	containerOrder: number | null;

	containerTitle: string | null;

	contentCreationDate: Date | null;

	contentDescription: string | null;

	contentModificationDate: Date | null;

	contentRating: number | null;

	contentSources: NSArray<string> | null;

	contentType: string | null;

	contentTypeTree: NSArray<string> | null;

	contentURL: NSURL | null;

	contributors: NSArray<string> | null;

	copyright: string | null;

	country: string | null;

	coverage: NSArray<string> | null;

	creator: string | null;

	darkThumbnailURL: NSURL | null;

	deliveryType: number | null;

	director: string | null;

	displayName: string | null;

	/**
	 * @since 10.0
	 */
	domainIdentifier: string | null;

	downloadedDate: Date | null;

	dueDate: Date | null;

	duration: number | null;

	editors: NSArray<string> | null;

	emailAddresses: NSArray<string> | null;

	emailHeaders: NSDictionary<string, NSArray<any>> | null;

	encodingApplications: NSArray<string> | null;

	endDate: Date | null;

	exposureMode: number | null;

	exposureProgram: string | null;

	exposureTime: number | null;

	exposureTimeString: string | null;

	fNumber: number | null;

	fileSize: number | null;

	flashOn: number | null;

	focalLength: number | null;

	focalLength35mm: number | null;

	fontNames: NSArray<string> | null;

	fullyFormattedAddress: string | null;

	generalMIDISequence: number | null;

	genre: string | null;

	hasAlphaChannel: number | null;

	headline: string | null;

	hiddenAdditionalRecipients: NSArray<CSPerson> | null;

	identifier: string | null;

	imageDirection: number | null;

	importantDates: NSArray<Date> | null;

	information: string | null;

	instantMessageAddresses: NSArray<string> | null;

	instructions: string | null;

	/**
	 * @since 18.4
	 */
	readonly isPriority: number | null;

	keySignature: string | null;

	keywords: NSArray<string> | null;

	kind: string | null;

	languages: NSArray<string> | null;

	lastUsedDate: Date | null;

	latitude: number | null;

	layerNames: NSArray<string> | null;

	lensModel: string | null;

	likelyJunk: number;

	local: number | null;

	longitude: number | null;

	lyricist: string | null;

	mailboxIdentifiers: NSArray<string> | null;

	maxAperture: number | null;

	mediaTypes: NSArray<string> | null;

	metadataModificationDate: Date | null;

	meteringMode: string | null;

	musicalGenre: string | null;

	musicalInstrumentCategory: string | null;

	musicalInstrumentName: string | null;

	namedLocation: string | null;

	organizations: NSArray<string> | null;

	orientation: number | null;

	originalFormat: string | null;

	originalSource: string | null;

	pageCount: number | null;

	pageHeight: number | null;

	pageWidth: number | null;

	participants: NSArray<string> | null;

	path: string | null;

	performers: NSArray<string> | null;

	phoneNumbers: NSArray<string> | null;

	pixelCount: number | null;

	pixelHeight: number | null;

	pixelWidth: number | null;

	playCount: number | null;

	postalCode: string | null;

	primaryRecipients: NSArray<CSPerson> | null;

	producer: string | null;

	profileName: string | null;

	projects: NSArray<string> | null;

	/**
	 * @since 11.0
	 */
	providerDataTypeIdentifiers: NSArray<string> | null;

	/**
	 * @since 11.0
	 */
	providerFileTypeIdentifiers: NSArray<string> | null;

	/**
	 * @since 11.0
	 */
	providerInPlaceFileTypeIdentifiers: NSArray<string> | null;

	publishers: NSArray<string> | null;

	/**
	 * @since 11.0
	 */
	rankingHint: number | null;

	rating: number | null;

	ratingDescription: string | null;

	recipientAddresses: NSArray<string> | null;

	recipientEmailAddresses: NSArray<string> | null;

	recipientNames: NSArray<string> | null;

	recordingDate: Date | null;

	redEyeOn: number | null;

	relatedUniqueIdentifier: string | null;

	resolutionHeightDPI: number | null;

	resolutionWidthDPI: number | null;

	rights: string | null;

	role: string | null;

	securityMethod: string | null;

	/**
	 * @since 15.0
	 */
	sharedItemContentType: UTType | null;

	speed: number | null;

	startDate: Date | null;

	stateOrProvince: string | null;

	streamable: number | null;

	subThoroughfare: string | null;

	subject: string | null;

	supportsNavigation: number | null;

	supportsPhoneCall: number | null;

	tempo: number | null;

	textContent: string | null;

	/**
	 * @since 18.4
	 */
	readonly textContentSummary: string | null;

	theme: string | null;

	thoroughfare: string | null;

	thumbnailData: NSData | null;

	thumbnailURL: NSURL | null;

	timeSignature: string | null;

	timestamp: Date | null;

	title: string | null;

	totalBitRate: number | null;

	/**
	 * @since 18.4
	 */
	transcribedTextContent: string | null;

	/**
	 * @since 11.0
	 */
	userCreated: number | null;

	/**
	 * @since 11.0
	 */
	userCurated: number | null;

	/**
	 * @since 11.0
	 */
	userOwned: number | null;

	version: string | null;

	videoBitRate: number | null;

	/**
	 * @since 10.0
	 */
	weakRelatedUniqueIdentifier: string | null;

	whiteBalance: number | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 14.0
	 */
	constructor(o: { contentType: UTType; });

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	constructor(o: { itemContentType: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 14.0
	 */
	initWithContentType(contentType: UTType): this;

	/**
	 * @since 9.0
	 * @deprecated 100000
	 */
	initWithItemContentType(itemContentType: string): this;

	setValueForCustomKey(value: NSSecureCoding | null, key: CSCustomAttributeKey): void;

	valueForCustomKey(key: CSCustomAttributeKey): NSSecureCoding | null;
}

/**
 * @since 18.4
 */
declare const enum CSSearchableItemUpdateListenerOptions {

	Default = 0,

	Summarization = 2,

	Priority = 4
}

/**
 * @since 16.0
 */
declare class CSSuggestion extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CSSuggestion; // inherited from NSObject

	static new(): CSSuggestion; // inherited from NSObject

	readonly localizedAttributedSuggestion: NSAttributedString;

	readonly suggestionKind: CSSuggestionKind;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	compare(other: CSSuggestion): NSComparisonResult;

	compareByRank(other: CSSuggestion): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any> | ArrayBufferLike | ArrayBufferView | null): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare var CSSuggestionHighlightAttributeName: string;

declare const enum CSSuggestionKind {

	None = 0,

	Custom = 1,

	Default = 2
}

declare const enum CSUserInteraction {

	Select = 0,

	Default = 0,

	Focus = 1
}

/**
 * @since 16.0
 */
declare class CSUserQuery extends CSSearchQuery {

	static alloc(): CSUserQuery; // inherited from NSObject

	static new(): CSUserQuery; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static prepare(): void;

	/**
	 * @since 18.0
	 */
	static prepareProtectionClasses(protectionClasses: NSArray<string> | string[]): void;

	readonly foundSuggestionCount: number;

	foundSuggestionsHandler: (p1: NSArray<CSSuggestion>) => void | null;

	constructor(o: { userQueryString: string | null; userQueryContext: CSUserQueryContext | null; });

	initWithUserQueryStringUserQueryContext(userQueryString: string | null, userQueryContext: CSUserQueryContext | null): this;

	/**
	 * @since 18.0
	 */
	userEngagedWithItemVisibleItemsUserInteractionType(item: CSSearchableItem, visibleItems: NSArray<CSSearchableItem> | CSSearchableItem[], userInteractionType: CSUserInteraction): void;

	/**
	 * @since 18.0
	 */
	userEngagedWithSuggestionVisibleSuggestionsUserInteractionType(suggestion: CSSuggestion, visibleSuggestions: NSArray<CSSuggestion> | CSSuggestion[], userInteractionType: CSUserInteraction): void;
}

/**
 * @since 16.0
 */
declare class CSUserQueryContext extends CSSearchQueryContext {

	static alloc(): CSUserQueryContext; // inherited from NSObject

	static new(): CSUserQueryContext; // inherited from NSObject

	static userQueryContext(): CSUserQueryContext;

	static userQueryContextWithCurrentSuggestion(currentSuggestion: CSSuggestion | null): CSUserQueryContext;

	/**
	 * @since 18.0
	 */
	disableSemanticSearch: boolean;

	enableRankedResults: boolean;

	/**
	 * @since 18.0
	 */
	maxRankedResultCount: number;

	maxResultCount: number;

	maxSuggestionCount: number;
}

declare var CoreSpotlightVersionNumber: number;

declare var CoreSpotlightVersionString: interop.Reference<number>;
