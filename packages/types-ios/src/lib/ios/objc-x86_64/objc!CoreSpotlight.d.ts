
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

	updateAttributesForFileAtURLError(attributes: CSSearchableItemAttributeSet, contentURL: NSURL): boolean;
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
	dataForSearchableIndexItemIdentifierTypeIdentifierError(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string): NSData;

	/**
	 * @since 11.0
	 */
	fileURLForSearchableIndexItemIdentifierTypeIdentifierInPlaceError(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string, inPlace: boolean): NSURL;

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

	self(): this;
}

/**
 * @since 9.0
 */
declare class CSLocalizedString extends NSString {

	static alloc(): CSLocalizedString; // inherited from NSObject

	static new(): CSLocalizedString; // inherited from NSObject

	static objectWithItemProviderDataTypeIdentifierError(data: NSData, typeIdentifier: string): CSLocalizedString; // inherited from NSItemProviderReading

	static string(): CSLocalizedString; // inherited from NSString

	static stringWithCStringEncoding(cString: string | interop.Pointer | interop.Reference<any>, enc: number): CSLocalizedString; // inherited from NSString

	static stringWithCharactersLength(characters: interop.Pointer | interop.Reference<string>, length: number): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfFileEncodingError(path: string, enc: number): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfFileUsedEncodingError(path: string, enc: interop.Pointer | interop.Reference<number>): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfURLEncodingError(url: NSURL, enc: number): CSLocalizedString; // inherited from NSString

	static stringWithContentsOfURLUsedEncodingError(url: NSURL, enc: interop.Pointer | interop.Reference<number>): CSLocalizedString; // inherited from NSString

	static stringWithString(string: string): CSLocalizedString; // inherited from NSString

	static stringWithUTF8String(nullTerminatedCString: string | interop.Pointer | interop.Reference<any>): CSLocalizedString; // inherited from NSString

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

	contactIdentifier: string;

	readonly displayName: string;

	readonly handleIdentifier: string;

	readonly handles: NSArray<string>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { displayName: string; handles: NSArray<string> | string[]; handleIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDisplayNameHandlesHandleIdentifier(displayName: string, handles: NSArray<string> | string[], handleIdentifier: string): this;
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

	completionHandler: (p1: NSError) => void;

	readonly foundItemCount: number;

	foundItemsHandler: (p1: NSArray<CSSearchableItem>) => void;

	protectionClasses: NSArray<string>;

	/**
	 * @since 10.0
	 * @deprecated 16.0
	 */
	constructor(o: { queryString: string; attributes: NSArray<string> | string[]; });

	/**
	 * @since 16.0
	 */
	constructor(o: { queryString: string; queryContext: CSSearchQueryContext; });

	cancel(): void;

	/**
	 * @since 10.0
	 * @deprecated 16.0
	 */
	initWithQueryStringAttributes(queryString: string, attributes: NSArray<string> | string[]): this;

	/**
	 * @since 16.0
	 */
	initWithQueryStringQueryContext(queryString: string, queryContext: CSSearchQueryContext): this;

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

	keyboardLanguage: string;

	sourceOptions: CSSearchQuerySourceOptions;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

	indexDelegate: CSSearchableIndexDelegate;

	constructor(o: { name: string; });

	constructor(o: { name: string; protectionClass: string; });

	beginIndexBatch(): void;

	deleteAllSearchableItemsWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	deleteSearchableItemsWithDomainIdentifiersCompletionHandler(domainIdentifiers: NSArray<string> | string[], completionHandler: (p1: NSError) => void): void;

	deleteSearchableItemsWithIdentifiersCompletionHandler(identifiers: NSArray<string> | string[], completionHandler: (p1: NSError) => void): void;

	endIndexBatchWithClientStateCompletionHandler(clientState: NSData, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 18.0
	 */
	endIndexBatchWithExpectedClientStateNewClientStateCompletionHandler(expectedClientState: NSData, newClientState: NSData, completionHandler: (p1: NSError) => void): void;

	fetchDataForBundleIdentifierItemIdentifierContentTypeCompletionHandler(bundleIdentifier: string, itemIdentifier: string, contentType: UTType, completionHandler: (p1: NSData, p2: NSError) => void): void;

	fetchLastClientStateWithCompletionHandler(completionHandler: (p1: NSData, p2: NSError) => void): void;

	indexSearchableItemsCompletionHandler(items: NSArray<CSSearchableItem> | CSSearchableItem[], completionHandler: (p1: NSError) => void): void;

	initWithName(name: string): this;

	initWithNameProtectionClass(name: string, protectionClass: string): this;
}

/**
 * @since 9.0
 */
interface CSSearchableIndexDelegate extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	dataForSearchableIndexItemIdentifierTypeIdentifierError?(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string): NSData;

	/**
	 * @since 11.0
	 */
	fileURLForSearchableIndexItemIdentifierTypeIdentifierInPlaceError?(searchableIndex: CSSearchableIndex, itemIdentifier: string, typeIdentifier: string, inPlace: boolean): NSURL;

	searchableIndexDidFinishThrottle?(searchableIndex: CSSearchableIndex): void;

	searchableIndexDidThrottle?(searchableIndex: CSSearchableIndex): void;

	searchableIndexReindexAllSearchableItemsWithAcknowledgementHandler(searchableIndex: CSSearchableIndex, acknowledgementHandler: () => void): void;

	searchableIndexReindexSearchableItemsWithIdentifiersAcknowledgementHandler(searchableIndex: CSSearchableIndex, identifiers: NSArray<string> | string[], acknowledgementHandler: () => void): void;
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

	domainIdentifier: string;

	expirationDate: Date;

	/**
	 * @since 9.0
	 */
	isUpdate: boolean;

	uniqueIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { uniqueIdentifier: string; domainIdentifier: string; attributeSet: CSSearchableItemAttributeSet; });

	/**
	 * @since 16.0
	 */
	compareByRank(other: CSSearchableItem): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithUniqueIdentifierDomainIdentifierAttributeSet(uniqueIdentifier: string, domainIdentifier: string, attributeSet: CSSearchableItemAttributeSet): this;
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

	/**
	 * @since 15.0
	 */
	actionIdentifiers: NSArray<string>;

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

	darkThumbnailURL: NSURL;

	deliveryType: number;

	director: string;

	displayName: string;

	/**
	 * @since 10.0
	 */
	domainIdentifier: string;

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

	fullyFormattedAddress: string;

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

	postalCode: string;

	primaryRecipients: NSArray<CSPerson>;

	producer: string;

	profileName: string;

	projects: NSArray<string>;

	/**
	 * @since 11.0
	 */
	providerDataTypeIdentifiers: NSArray<string>;

	/**
	 * @since 11.0
	 */
	providerFileTypeIdentifiers: NSArray<string>;

	/**
	 * @since 11.0
	 */
	providerInPlaceFileTypeIdentifiers: NSArray<string>;

	publishers: NSArray<string>;

	/**
	 * @since 11.0
	 */
	rankingHint: number;

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

	/**
	 * @since 15.0
	 */
	sharedItemContentType: UTType;

	speed: number;

	startDate: Date;

	stateOrProvince: string;

	streamable: number;

	subThoroughfare: string;

	subject: string;

	supportsNavigation: number;

	supportsPhoneCall: number;

	tempo: number;

	textContent: string;

	theme: string;

	thoroughfare: string;

	thumbnailData: NSData;

	thumbnailURL: NSURL;

	timeSignature: string;

	timestamp: Date;

	title: string;

	totalBitRate: number;

	/**
	 * @since 11.0
	 */
	userCreated: number;

	/**
	 * @since 11.0
	 */
	userCurated: number;

	/**
	 * @since 11.0
	 */
	userOwned: number;

	version: string;

	videoBitRate: number;

	/**
	 * @since 10.0
	 */
	weakRelatedUniqueIdentifier: string;

	whiteBalance: number;

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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

	setValueForCustomKey(value: NSSecureCoding, key: CSCustomAttributeKey): void;

	valueForCustomKey(key: CSCustomAttributeKey): NSSecureCoding;
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

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

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

	foundSuggestionsHandler: (p1: NSArray<CSSuggestion>) => void;

	constructor(o: { userQueryString: string; userQueryContext: CSUserQueryContext; });

	initWithUserQueryStringUserQueryContext(userQueryString: string, userQueryContext: CSUserQueryContext): this;

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

	static userQueryContextWithCurrentSuggestion(currentSuggestion: CSSuggestion): CSUserQueryContext;

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
