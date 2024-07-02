
/**
 * @since 16.1
 */
declare class BAAppExtensionInfo extends NSObject implements NSSecureCoding {

	static alloc(): BAAppExtensionInfo; // inherited from NSObject

	static new(): BAAppExtensionInfo; // inherited from NSObject

	readonly restrictedDownloadSizeRemaining: number;

	/**
	 * @since 16.4
	 */
	readonly restrictedEssentialDownloadSizeRemaining: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum BAContentRequest {

	Install = 1,

	Update = 2,

	Periodic = 3
}

/**
 * @since 16.1
 */
declare class BADownload extends NSObject implements NSCoding, NSCopying, NSSecureCoding {

	static alloc(): BADownload; // inherited from NSObject

	static new(): BADownload; // inherited from NSObject

	/**
	 * @since 16.1
	 */
	readonly identifier: string;

	/**
	 * @since 16.4
	 */
	readonly isEssential: boolean;

	/**
	 * @since 16.1
	 */
	readonly priority: number;

	/**
	 * @since 16.1
	 */
	readonly state: BADownloadState;

	/**
	 * @since 16.1
	 */
	readonly uniqueIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 16.4
	 */
	copyAsNonEssential(): this;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.1
 */
declare class BADownloadManager extends NSObject {

	static alloc(): BADownloadManager; // inherited from NSObject

	static new(): BADownloadManager; // inherited from NSObject

	/**
	 * @since 16.1
	 */
	delegate: BADownloadManagerDelegate;

	/**
	 * @since 16.1
	 */
	static readonly sharedManager: BADownloadManager;

	/**
	 * @since 16.1
	 */
	cancelDownloadError(download: BADownload): boolean;

	/**
	 * @since 16.4
	 */
	fetchCurrentDownloads(): NSArray<BADownload>;

	/**
	 * @since 16.1
	 */
	fetchCurrentDownloadsWithCompletionHandler(completionHandler: (p1: NSArray<BADownload>, p2: NSError) => void): void;

	/**
	 * @since 16.1
	 */
	performWithExclusiveControl(performHandler: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 16.1
	 */
	performWithExclusiveControlBeforeDatePerformHandler(date: Date, performHandler: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 16.1
	 */
	scheduleDownloadError(download: BADownload): boolean;

	/**
	 * @since 16.1
	 */
	startForegroundDownloadError(download: BADownload): boolean;
}

/**
 * @since 16.1
 */
interface BADownloadManagerDelegate extends NSObjectProtocol {

	downloadDidBegin?(download: BADownload): void;

	downloadDidPause?(download: BADownload): void;

	downloadDidReceiveChallengeCompletionHandler?(download: BADownload, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	downloadDidWriteBytesTotalBytesWrittenTotalBytesExpectedToWrite?(download: BADownload, bytesWritten: number, totalBytesWritten: number, totalExpectedBytes: number): void;

	downloadFailedWithError?(download: BADownload, error: NSError): void;

	downloadFinishedWithFileURL?(download: BADownload, fileURL: NSURL): void;
}
declare var BADownloadManagerDelegate: {

	prototype: BADownloadManagerDelegate;
};

declare const enum BADownloadState {

	Failed = -1,

	Created = 0,

	Waiting = 1,

	Downloading = 2,

	Finished = 3
}

/**
 * @since 16.1
 */
interface BADownloaderExtension extends NSObjectProtocol {

	backgroundDownloadDidReceiveChallengeCompletionHandler?(download: BADownload, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	backgroundDownloadFailedWithError?(download: BADownload, error: NSError): void;

	backgroundDownloadFinishedWithFileURL?(download: BADownload, fileURL: NSURL): void;

	downloadsForRequestManifestURLExtensionInfo?(contentRequest: BAContentRequest, manifestURL: NSURL, extensionInfo: BAAppExtensionInfo): NSSet<BADownload>;

	/**
	 * @since 16.1
	 * @deprecated 16.4
	 */
	extensionWillTerminate?(): void;
}
declare var BADownloaderExtension: {

	prototype: BADownloaderExtension;
};

/**
 * @since 16.1
 */
declare var BADownloaderPriorityDefault: number;

/**
 * @since 16.1
 */
declare var BADownloaderPriorityMax: number;

/**
 * @since 16.1
 */
declare var BADownloaderPriorityMin: number;

/**
 * @since 17.0
 */
declare const enum BAErrorCode {

	DownloadInvalid = 0,

	CallFromExtensionNotAllowed = 50,

	CallFromInactiveProcessNotAllowed = 51,

	CallerConnectionNotAccepted = 55,

	CallerConnectionInvalid = 56,

	DownloadAlreadyScheduled = 100,

	DownloadNotScheduled = 101,

	DownloadFailedToStart = 102,

	DownloadAlreadyFailed = 103,

	DownloadEssentialDownloadNotPermitted = 109,

	DownloadBackgroundActivityProhibited = 111,

	DownloadWouldExceedAllowance = 112,

	SessionDownloadDisallowedByDomain = 202,

	SessionDownloadDisallowedByAllowance = 203,

	SessionDownloadAllowanceExceeded = 204,

	SessionDownloadNotPermittedBeforeAppLaunch = 206
}

/**
 * @since 17.0
 */
declare var BAErrorDomain: string;

/**
 * @since 16.1
 */
declare class BAURLDownload extends BADownload implements NSCopying {

	static alloc(): BAURLDownload; // inherited from NSObject

	static new(): BAURLDownload; // inherited from NSObject

	/**
	 * @since 16.1
	 * @deprecated 16.4
	 */
	constructor(o: { identifier: string; request: NSURLRequest; applicationGroupIdentifier: string; });

	/**
	 * @since 16.1
	 * @deprecated 16.4
	 */
	constructor(o: { identifier: string; request: NSURLRequest; applicationGroupIdentifier: string; priority: number; });

	/**
	 * @since 16.4
	 */
	constructor(o: { identifier: string; request: NSURLRequest; essential: boolean; fileSize: number; applicationGroupIdentifier: string; priority: number; });

	/**
	 * @since 16.4
	 */
	constructor(o: { identifier: string; request: NSURLRequest; fileSize: number; applicationGroupIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 16.1
	 * @deprecated 16.4
	 */
	initWithIdentifierRequestApplicationGroupIdentifier(identifier: string, request: NSURLRequest, applicationGroupIdentifier: string): this;

	/**
	 * @since 16.1
	 * @deprecated 16.4
	 */
	initWithIdentifierRequestApplicationGroupIdentifierPriority(identifier: string, request: NSURLRequest, applicationGroupIdentifier: string, priority: number): this;

	/**
	 * @since 16.4
	 */
	initWithIdentifierRequestEssentialFileSizeApplicationGroupIdentifierPriority(identifier: string, request: NSURLRequest, essential: boolean, fileSize: number, applicationGroupIdentifier: string, priority: number): this;

	/**
	 * @since 16.4
	 */
	initWithIdentifierRequestFileSizeApplicationGroupIdentifier(identifier: string, request: NSURLRequest, fileSize: number, applicationGroupIdentifier: string): this;
}
