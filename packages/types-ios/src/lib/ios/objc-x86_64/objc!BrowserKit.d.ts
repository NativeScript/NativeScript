
/**
 * @since 18.4
 */
declare class BEAvailability extends NSObject {

	static alloc(): BEAvailability; // inherited from NSObject

	static isEligibleForContextCompletionHandler(context: BEEligibilityContext, completionHandler: (p1: boolean, p2: NSError | null) => void): void;

	static new(): BEAvailability; // inherited from NSObject
}

/**
 * @since 26.4
 */
declare class BEBrowserData extends NSObject implements NSSecureCoding {

	static alloc(): BEBrowserData; // inherited from NSObject

	static new(): BEBrowserData; // inherited from NSObject

	readonly sourceApplicationBundleIdentifier: string | null;

	readonly sourceApplicationLocalizedName: string | null;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { sourceApplicationBundleIdentifier: string | null; sourceApplicationLocalizedName: string | null; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSourceApplicationBundleIdentifierSourceApplicationLocalizedName(sourceApplicationBundleIdentifier: string | null, sourceApplicationLocalizedName: string | null): this;
}

/**
 * @since 26.4
 */
declare class BEBrowserDataBookmark extends BEBrowserData {

	static alloc(): BEBrowserDataBookmark; // inherited from NSObject

	static new(): BEBrowserDataBookmark; // inherited from NSObject

	readonly identifier: string;

	readonly isFolder: boolean;

	readonly parentIdentifier: string | null;

	readonly title: string;

	readonly url: NSURL | null;

	constructor(o: { asFolder: boolean; title: string; identifier: string; url: NSURL | null; parentIdentifier: string | null; });

	initAsFolderTitleIdentifierUrlParentIdentifier(isFolder: boolean, title: string, identifier: string, url: NSURL | null, parentIdentifier: string | null): this;
}

/**
 * @since 26.4
 */
declare const enum BEBrowserDataExchangeError {

	DataExchangeErrorUnknown = 0,

	DataExchangeErrorExport = 1,

	DataExchangeErrorImport = 2
}

declare var BEBrowserDataExchangeErrorDomain: string;

/**
 * @since 26.4
 */
declare var BEBrowserDataExchangeExportActivity: string;

/**
 * @since 26.4
 */
declare var BEBrowserDataExchangeExportToken: string;

/**
 * @since 26.4
 */
declare var BEBrowserDataExchangeImportActivity: string;

/**
 * @since 26.4
 */
declare var BEBrowserDataExchangeImportToken: string;

/**
 * @since 26.4
 */
declare class BEBrowserDataExportManager extends NSObject {

	static alloc(): BEBrowserDataExportManager; // inherited from NSObject

	static new(): BEBrowserDataExportManager; // inherited from NSObject

	constructor(o: { scene: UIWindowScene; });

	exportBrowserDataCompletionHandler(browserData: BEBrowserData, completionHandler: (p1: NSError | null) => void): void;

	exportFinishedWithCompletionHandler(completionHandler: (p1: NSError | null) => void): void;

	initWithScene(scene: UIWindowScene): this;

	requestExportForMetadataTokenCompletionHandler(metadata: BEExportMetadata, token: NSUUID | null, completionHandler: (p1: BEExportOptions | null, p2: NSError | null) => void): void;
}

/**
 * @since 26.4
 */
declare class BEBrowserDataExtension extends BEBrowserData {

	static alloc(): BEBrowserDataExtension; // inherited from NSObject

	static new(): BEBrowserDataExtension; // inherited from NSObject

	readonly developerName: string;

	readonly displayName: string;

	readonly identifier: string;

	readonly storeIdentifier: string;

	constructor(o: { displayName: string; developerName: string; identifier: string; storeIdentifier: string; });

	initWithDisplayNameDeveloperNameIdentifierStoreIdentifier(displayName: string, developerName: string, identifier: string, storeIdentifier: string): this;
}

/**
 * @since 26.4
 */
declare class BEBrowserDataHistoryVisit extends BEBrowserData {

	static alloc(): BEBrowserDataHistoryVisit; // inherited from NSObject

	static new(): BEBrowserDataHistoryVisit; // inherited from NSObject

	readonly dateOfLastVisit: Date;

	readonly httpGet: boolean;

	readonly loadedSuccessfully: boolean;

	readonly redirectDestinationDateOfVisit: Date | null;

	readonly redirectDestinationURL: NSURL | null;

	readonly redirectSourceDateOfVisit: Date | null;

	readonly redirectSourceURL: NSURL | null;

	readonly title: string | null;

	readonly url: NSURL;

	readonly visitCount: number;

	constructor(o: { URL: NSURL; dateOfLastVisit: Date; title: string | null; loadedSuccessfully: boolean; httpGet: boolean; redirectSourceURL: NSURL | null; redirectSourceDateOfVisit: Date | null; redirectDestinationURL: NSURL | null; redirectDestinationDateOfVisit: Date | null; visitCount: number; });

	initWithURLDateOfLastVisitTitleLoadedSuccessfullyHttpGetRedirectSourceURLRedirectSourceDateOfVisitRedirectDestinationURLRedirectDestinationDateOfVisitVisitCount(url: NSURL, dateOfLastVisit: Date, title: string | null, loadedSuccessfully: boolean, httpGet: boolean, redirectSourceURL: NSURL | null, redirectSourceDateOfVisit: Date | null, redirectDestinationURL: NSURL | null, redirectDestinationDateOfVisit: Date | null, visitCount: number): this;
}

/**
 * @since 26.4
 */
declare class BEBrowserDataImportManager extends NSObject {

	static alloc(): BEBrowserDataImportManager; // inherited from NSObject

	static new(): BEBrowserDataImportManager; // inherited from NSObject

	constructor(o: { scene: UIWindowScene | null; });

	importBrowserDataWithTokenImportBlock(token: NSUUID, importBlock: (p1: BEBrowserData | null, p2: boolean, p3: NSError | null) => void): void;

	initWithScene(scene: UIWindowScene | null): this;

	requestImportForMetadataCompletionHandler(metadata: BEImportMetadata, completionHandler: (p1: BEImportOptions | null, p2: NSError | null) => void): void;
}

/**
 * @since 26.4
 */
declare class BEBrowserDataReadingListItem extends BEBrowserData {

	static alloc(): BEBrowserDataReadingListItem; // inherited from NSObject

	static new(): BEBrowserDataReadingListItem; // inherited from NSObject

	readonly dateOfLastVisit: Date | null;

	readonly title: string;

	readonly url: NSURL;

	constructor(o: { title: string; url: NSURL; dateOfLastVisit: Date | null; });

	initWithTitleUrlDateOfLastVisit(title: string, url: NSURL, dateOfLastVisit: Date | null): this;
}

/**
 * @since 18.4
 */
declare const enum BEEligibilityContext {

	WebBrowser = 0
}

/**
 * @since 26.4
 */
declare const enum BEExportDataTypes {

	None = 0,

	Bookmarks = 1,

	ReadingList = 2,

	History = 4,

	Extensions = 8
}

/**
 * @since 26.4
 */
declare class BEExportMetadata extends NSObject implements NSSecureCoding {

	static alloc(): BEExportMetadata; // inherited from NSObject

	static new(): BEExportMetadata; // inherited from NSObject

	readonly bookmarksCount: number;

	readonly extensionsCount: number;

	readonly historyCount: number;

	readonly readingListCount: number;

	readonly supportExportToFiles: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { supportForExportToFiles: boolean; bookmarksCount: number; readingListCount: number; historyCount: number; extensionsCount: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSupportForExportToFilesBookmarksCountReadingListCountHistoryCountExtensionsCount(supportExportToFiles: boolean, bookmarksCount: number, readingListCount: number, historyCount: number, extensionsCount: number): this;
}

/**
 * @since 26.4
 */
declare class BEExportOptions extends NSObject implements NSSecureCoding {

	static alloc(): BEExportOptions; // inherited from NSObject

	static new(): BEExportOptions; // inherited from NSObject

	readonly dataTypes: BEExportDataTypes;

	readonly exportToFiles: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { exportToFiles: boolean; dataTypes: BEExportDataTypes; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithExportToFilesDataTypes(exportToFiles: boolean, dataTypes: BEExportDataTypes): this;
}

/**
 * @since 26.4
 */
declare class BEImportMetadata extends NSObject implements NSSecureCoding {

	static alloc(): BEImportMetadata; // inherited from NSObject

	static new(): BEImportMetadata; // inherited from NSObject

	readonly supportImportFromFiles: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { supportForImportFromFiles: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSupportForImportFromFiles(supportImportFromFiles: boolean): this;
}

/**
 * @since 26.4
 */
declare class BEImportOptions extends NSObject implements NSSecureCoding {

	static alloc(): BEImportOptions; // inherited from NSObject

	static new(): BEImportOptions; // inherited from NSObject

	readonly importFromFiles: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { importFromFiles: boolean; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithImportFromFiles(importFromFiles: boolean): this;
}
