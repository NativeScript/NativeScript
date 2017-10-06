
declare var NFCErrorDomain: string;

declare class NFCISO15693CustomCommandConfiguration extends NFCTagCommandConfiguration {

	static alloc(): NFCISO15693CustomCommandConfiguration; // inherited from NSObject

	static new(): NFCISO15693CustomCommandConfiguration; // inherited from NSObject

	customCommandCode: number;

	manufacturerCode: number;

	requestParameters: NSData;

	constructor(o: { manufacturerCode: number; customCommandCode: number; requestParameters: NSData; });

	constructor(o: { manufacturerCode: number; customCommandCode: number; requestParameters: NSData; maximumRetries: number; retryInterval: number; });

	initWithManufacturerCodeCustomCommandCodeRequestParameters(manufacturerCode: number, customCommandCode: number, requestParameters: NSData): this;

	initWithManufacturerCodeCustomCommandCodeRequestParametersMaximumRetriesRetryInterval(manufacturerCode: number, customCommandCode: number, requestParameters: NSData, maximumRetries: number, retryInterval: number): this;
}

declare class NFCISO15693ReadMultipleBlocksConfiguration extends NFCTagCommandConfiguration {

	static alloc(): NFCISO15693ReadMultipleBlocksConfiguration; // inherited from NSObject

	static new(): NFCISO15693ReadMultipleBlocksConfiguration; // inherited from NSObject

	chunkSize: number;

	range: NSRange;

	constructor(o: { range: NSRange; chunkSize: number; });

	constructor(o: { range: NSRange; chunkSize: number; maximumRetries: number; retryInterval: number; });

	initWithRangeChunkSize(range: NSRange, chunkSize: number): this;

	initWithRangeChunkSizeMaximumRetriesRetryInterval(range: NSRange, chunkSize: number, maximumRetries: number, retryInterval: number): this;
}

declare class NFCISO15693ReaderSession extends NFCReaderSession {

	static alloc(): NFCISO15693ReaderSession; // inherited from NSObject

	static new(): NFCISO15693ReaderSession; // inherited from NSObject

	static readonly readingAvailable: boolean;

	constructor(o: { delegate: NFCReaderSessionDelegate; queue: NSObject; });

	initWithDelegateQueue(delegate: NFCReaderSessionDelegate, queue: NSObject): this;

	restartPolling(): void;
}

interface NFCISO15693Tag extends NFCTag {

	icManufacturerCode: number;

	icSerialNumber: NSData;

	identifier: NSData;

	readMultipleBlocksWithConfigurationCompletionHandler(readConfiguration: NFCISO15693ReadMultipleBlocksConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	sendCustomCommandWithConfigurationCompletionHandler(commandConfiguration: NFCISO15693CustomCommandConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;
}
declare var NFCISO15693Tag: {

	prototype: NFCISO15693Tag;
};

declare var NFCISO15693TagResponseErrorKey: string;

declare class NFCNDEFMessage extends NSObject implements NSSecureCoding {

	static alloc(): NFCNDEFMessage; // inherited from NSObject

	static new(): NFCNDEFMessage; // inherited from NSObject

	records: NSArray<NFCNDEFPayload>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class NFCNDEFPayload extends NSObject implements NSSecureCoding {

	static alloc(): NFCNDEFPayload; // inherited from NSObject

	static new(): NFCNDEFPayload; // inherited from NSObject

	identifier: NSData;

	payload: NSData;

	type: NSData;

	typeNameFormat: NFCTypeNameFormat;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class NFCNDEFReaderSession extends NFCReaderSession {

	static alloc(): NFCNDEFReaderSession; // inherited from NSObject

	static new(): NFCNDEFReaderSession; // inherited from NSObject

	static readonly readingAvailable: boolean;

	constructor(o: { delegate: NFCNDEFReaderSessionDelegate; queue: NSObject; invalidateAfterFirstRead: boolean; });

	initWithDelegateQueueInvalidateAfterFirstRead(delegate: NFCNDEFReaderSessionDelegate, queue: NSObject, invalidateAfterFirstRead: boolean): this;
}

interface NFCNDEFReaderSessionDelegate extends NSObjectProtocol {

	readerSessionDidDetectNDEFs(session: NFCNDEFReaderSession, messages: NSArray<NFCNDEFMessage>): void;

	readerSessionDidInvalidateWithError(session: NFCNDEFReaderSession, error: NSError): void;
}
declare var NFCNDEFReaderSessionDelegate: {

	prototype: NFCNDEFReaderSessionDelegate;
};

declare const enum NFCReaderError {

	ReaderErrorUnsupportedFeature = 1,

	ReaderErrorSecurityViolation = 2,

	ReaderTransceiveErrorTagConnectionLost = 100,

	ReaderTransceiveErrorRetryExceeded = 101,

	ReaderTransceiveErrorTagResponseError = 102,

	ReaderSessionInvalidationErrorUserCanceled = 200,

	ReaderSessionInvalidationErrorSessionTimeout = 201,

	ReaderSessionInvalidationErrorSessionTerminatedUnexpectedly = 202,

	ReaderSessionInvalidationErrorSystemIsBusy = 203,

	ReaderSessionInvalidationErrorFirstNDEFTagRead = 204,

	TagCommandConfigurationErrorInvalidParameters = 300
}

declare class NFCReaderSession extends NSObject implements NFCReaderSessionProtocol {

	static alloc(): NFCReaderSession; // inherited from NSObject

	static new(): NFCReaderSession; // inherited from NSObject

	readonly delegate: any;

	readonly sessionQueue: NSObject;

	alertMessage: string; // inherited from NFCReaderSessionProtocol

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly ready: boolean; // inherited from NFCReaderSessionProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginSession(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	invalidateSession(): void;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface NFCReaderSessionDelegate extends NSObjectProtocol {

	readerSessionDidBecomeActive(session: NFCReaderSession): void;

	readerSessionDidDetectTags(session: NFCReaderSession, tags: NSArray<NFCTag>): void;

	readerSessionDidInvalidateWithError(session: NFCReaderSession, error: NSError): void;
}
declare var NFCReaderSessionDelegate: {

	prototype: NFCReaderSessionDelegate;
};

interface NFCReaderSessionProtocol extends NSObjectProtocol {

	alertMessage: string;

	ready: boolean;

	beginSession(): void;

	invalidateSession(): void;
}
declare var NFCReaderSessionProtocol: {

	prototype: NFCReaderSessionProtocol;
};

interface NFCTag extends NSCopying, NSObjectProtocol, NSSecureCoding {

	available: boolean;

	session: NFCReaderSessionProtocol;

	type: NFCTagType;
}
declare var NFCTag: {

	prototype: NFCTag;
};

declare class NFCTagCommandConfiguration extends NSObject implements NSCopying {

	static alloc(): NFCTagCommandConfiguration; // inherited from NSObject

	static new(): NFCTagCommandConfiguration; // inherited from NSObject

	maximumRetries: number;

	retryInterval: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum NFCTagType {

	ISO15693 = 1
}

declare const enum NFCTypeNameFormat {

	Empty = 0,

	NFCWellKnown = 1,

	Media = 2,

	AbsoluteURI = 3,

	NFCExternal = 4,

	Unknown = 5,

	Unchanged = 6
}
