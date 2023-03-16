
declare class BAAppExtensionInfo extends NSObject implements NSSecureCoding {

	static alloc(): BAAppExtensionInfo; // inherited from NSObject

	static new(): BAAppExtensionInfo; // inherited from NSObject

	readonly restrictedDownloadSizeRemaining: number;

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

declare class BADownload extends NSObject implements NSCoding, NSCopying, NSSecureCoding {

	static alloc(): BADownload; // inherited from NSObject

	static new(): BADownload; // inherited from NSObject

	readonly identifier: string;

	readonly priority: number;

	readonly state: BADownloadState;

	readonly uniqueIdentifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class BADownloadManager extends NSObject {

	static alloc(): BADownloadManager; // inherited from NSObject

	static new(): BADownloadManager; // inherited from NSObject

	delegate: BADownloadManagerDelegate;

	static readonly sharedManager: BADownloadManager;

	cancelDownloadError(download: BADownload): boolean;

	fetchCurrentDownloadsWithCompletionHandler(completionHandler: (p1: NSArray<BADownload>, p2: NSError) => void): void;

	performWithExclusiveControl(performHandler: (p1: boolean, p2: NSError) => void): void;

	performWithExclusiveControlBeforeDatePerformHandler(date: Date, performHandler: (p1: boolean, p2: NSError) => void): void;

	scheduleDownloadError(download: BADownload): boolean;

	startForegroundDownloadError(download: BADownload): boolean;
}

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

interface BADownloaderExtension extends NSObjectProtocol {

	backgroundDownloadDidReceiveChallengeCompletionHandler?(download: BADownload, challenge: NSURLAuthenticationChallenge, completionHandler: (p1: NSURLSessionAuthChallengeDisposition, p2: NSURLCredential) => void): void;

	backgroundDownloadFailedWithError?(download: BADownload, error: NSError): void;

	backgroundDownloadFinishedWithFileURL?(download: BADownload, fileURL: NSURL): void;

	downloadsForRequestManifestURLExtensionInfo?(contentRequest: BAContentRequest, manifestURL: NSURL, extensionInfo: BAAppExtensionInfo): NSSet<BADownload>;

	extensionWillTerminate?(): void;
}
declare var BADownloaderExtension: {

	prototype: BADownloaderExtension;
};

declare var BADownloaderPriorityDefault: number;

declare var BADownloaderPriorityMax: number;

declare var BADownloaderPriorityMin: number;

declare class BAURLDownload extends BADownload {

	static alloc(): BAURLDownload; // inherited from NSObject

	static new(): BAURLDownload; // inherited from NSObject

	constructor(o: { identifier: string; request: NSURLRequest; applicationGroupIdentifier: string; });

	constructor(o: { identifier: string; request: NSURLRequest; applicationGroupIdentifier: string; priority: number; });

	initWithIdentifierRequestApplicationGroupIdentifier(identifier: string, request: NSURLRequest, applicationGroupIdentifier: string): this;

	initWithIdentifierRequestApplicationGroupIdentifierPriority(identifier: string, request: NSURLRequest, applicationGroupIdentifier: string, priority: number): this;
}
