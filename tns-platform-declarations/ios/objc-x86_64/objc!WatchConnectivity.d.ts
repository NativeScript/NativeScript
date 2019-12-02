
declare const enum WCErrorCode {

	GenericError = 7001,

	SessionNotSupported = 7002,

	SessionMissingDelegate = 7003,

	SessionNotActivated = 7004,

	DeviceNotPaired = 7005,

	WatchAppNotInstalled = 7006,

	NotReachable = 7007,

	InvalidParameter = 7008,

	PayloadTooLarge = 7009,

	PayloadUnsupportedTypes = 7010,

	MessageReplyFailed = 7011,

	MessageReplyTimedOut = 7012,

	FileAccessDenied = 7013,

	DeliveryFailed = 7014,

	InsufficientSpace = 7015,

	SessionInactive = 7016,

	TransferTimedOut = 7017,

	CompanionAppNotInstalled = 7018,

	WatchOnlyApp = 7019
}

declare var WCErrorDomain: string;

declare class WCSession extends NSObject {

	static alloc(): WCSession; // inherited from NSObject

	static isSupported(): boolean;

	static new(): WCSession; // inherited from NSObject

	readonly activationState: WCSessionActivationState;

	readonly applicationContext: NSDictionary<string, any>;

	readonly complicationEnabled: boolean;

	delegate: WCSessionDelegate;

	readonly hasContentPending: boolean;

	readonly outstandingFileTransfers: NSArray<WCSessionFileTransfer>;

	readonly outstandingUserInfoTransfers: NSArray<WCSessionUserInfoTransfer>;

	readonly paired: boolean;

	readonly reachable: boolean;

	readonly receivedApplicationContext: NSDictionary<string, any>;

	readonly remainingComplicationUserInfoTransfers: number;

	readonly watchAppInstalled: boolean;

	readonly watchDirectoryURL: NSURL;

	static readonly defaultSession: WCSession;

	activateSession(): void;

	sendMessageDataReplyHandlerErrorHandler(data: NSData, replyHandler: (p1: NSData) => void, errorHandler: (p1: NSError) => void): void;

	sendMessageReplyHandlerErrorHandler(message: NSDictionary<string, any>, replyHandler: (p1: NSDictionary<string, any>) => void, errorHandler: (p1: NSError) => void): void;

	transferCurrentComplicationUserInfo(userInfo: NSDictionary<string, any>): WCSessionUserInfoTransfer;

	transferFileMetadata(file: NSURL, metadata: NSDictionary<string, any>): WCSessionFileTransfer;

	transferUserInfo(userInfo: NSDictionary<string, any>): WCSessionUserInfoTransfer;

	updateApplicationContextError(applicationContext: NSDictionary<string, any>): boolean;
}

declare const enum WCSessionActivationState {

	NotActivated = 0,

	Inactive = 1,

	Activated = 2
}

interface WCSessionDelegate extends NSObjectProtocol {

	sessionActivationDidCompleteWithStateError(session: WCSession, activationState: WCSessionActivationState, error: NSError): void;

	sessionDidBecomeInactive(session: WCSession): void;

	sessionDidDeactivate(session: WCSession): void;

	sessionDidFinishFileTransferError?(session: WCSession, fileTransfer: WCSessionFileTransfer, error: NSError): void;

	sessionDidFinishUserInfoTransferError?(session: WCSession, userInfoTransfer: WCSessionUserInfoTransfer, error: NSError): void;

	sessionDidReceiveApplicationContext?(session: WCSession, applicationContext: NSDictionary<string, any>): void;

	sessionDidReceiveFile?(session: WCSession, file: WCSessionFile): void;

	sessionDidReceiveMessage?(session: WCSession, message: NSDictionary<string, any>): void;

	sessionDidReceiveMessageData?(session: WCSession, messageData: NSData): void;

	sessionDidReceiveMessageDataReplyHandler?(session: WCSession, messageData: NSData, replyHandler: (p1: NSData) => void): void;

	sessionDidReceiveMessageReplyHandler?(session: WCSession, message: NSDictionary<string, any>, replyHandler: (p1: NSDictionary<string, any>) => void): void;

	sessionDidReceiveUserInfo?(session: WCSession, userInfo: NSDictionary<string, any>): void;

	sessionReachabilityDidChange?(session: WCSession): void;

	sessionWatchStateDidChange?(session: WCSession): void;
}
declare var WCSessionDelegate: {

	prototype: WCSessionDelegate;
};

declare class WCSessionFile extends NSObject {

	static alloc(): WCSessionFile; // inherited from NSObject

	static new(): WCSessionFile; // inherited from NSObject

	readonly fileURL: NSURL;

	readonly metadata: NSDictionary<string, any>;
}

declare class WCSessionFileTransfer extends NSObject {

	static alloc(): WCSessionFileTransfer; // inherited from NSObject

	static new(): WCSessionFileTransfer; // inherited from NSObject

	readonly file: WCSessionFile;

	readonly progress: NSProgress;

	readonly transferring: boolean;

	cancel(): void;
}

declare class WCSessionUserInfoTransfer extends NSObject implements NSSecureCoding {

	static alloc(): WCSessionUserInfoTransfer; // inherited from NSObject

	static new(): WCSessionUserInfoTransfer; // inherited from NSObject

	readonly currentComplicationInfo: boolean;

	readonly transferring: boolean;

	readonly userInfo: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	cancel(): void;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}
