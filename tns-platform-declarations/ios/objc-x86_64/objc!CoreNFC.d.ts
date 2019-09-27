
declare const enum EncryptionId {

	AES = 79,

	AES_DES = 65
}

declare var NFCErrorDomain: string;

interface NFCFeliCaTag extends NFCNDEFTag, NFCTag {

	currentIDm: NSData;

	currentSystemCode: NSData;

	pollingWithSystemCodeRequestCodeTimeSlotCompletionHandler(systemCode: NSData, requestCode: PollingRequestCode, timeSlot: PollingTimeSlot, completionHandler: (p1: NSData, p2: NSData, p3: NSError) => void): void;

	readWithoutEncryptionWithServiceCodeListBlockListCompletionHandler(serviceCodeList: NSArray<NSData> | NSData[], blockList: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: NSArray<NSData>, p4: NSError) => void): void;

	requestResponseWithCompletionHandler(completionHandler: (p1: number, p2: NSError) => void): void;

	requestServiceV2WithNodeCodeListCompletionHandler(nodeCodeList: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: EncryptionId, p4: NSArray<NSData>, p5: NSArray<NSData>, p6: NSError) => void): void;

	requestServiceWithNodeCodeListCompletionHandler(nodeCodeList: NSArray<NSData> | NSData[], completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	requestSpecificationVersionWithCompletionHandler(completionHandler: (p1: number, p2: number, p3: NSData, p4: NSData, p5: NSError) => void): void;

	requestSystemCodeWithCompletionHandler(completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	resetModeWithCompletionHandler(completionHandler: (p1: number, p2: number, p3: NSError) => void): void;

	sendFeliCaCommandPacketCompletionHandler(commandPacket: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	writeWithoutEncryptionWithServiceCodeListBlockListBlockDataCompletionHandler(serviceCodeList: NSArray<NSData> | NSData[], blockList: NSArray<NSData> | NSData[], blockData: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: NSError) => void): void;
}
declare var NFCFeliCaTag: {

	prototype: NFCFeliCaTag;
};

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

	constructor(o: { delegate: NFCReaderSessionDelegate; queue: NSObject; });

	initWithDelegateQueue(delegate: NFCReaderSessionDelegate, queue: NSObject): this;

	restartPolling(): void;
}

interface NFCISO15693Tag extends NFCNDEFTag, NFCTag {

	icManufacturerCode: number;

	icSerialNumber: NSData;

	identifier: NSData;

	customCommandWithRequestFlagCustomCommandCodeCustomRequestParametersCompletionHandler(flags: RequestFlag, customCommandCode: number, customRequestParameters: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	extendedLockBlockWithRequestFlagsBlockNumberCompletionHandler(flags: RequestFlag, blockNumber: number, completionHandler: (p1: NSError) => void): void;

	extendedReadMultipleBlocksWithRequestFlagsBlockRangeCompletionHandler(flags: RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	extendedReadSingleBlockWithRequestFlagsBlockNumberCompletionHandler(flags: RequestFlag, blockNumber: number, completionHandler: (p1: NSData, p2: NSError) => void): void;

	extendedWriteSingleBlockWithRequestFlagsBlockNumberDataBlockCompletionHandler(flags: RequestFlag, blockNumber: number, dataBlock: NSData, completionHandler: (p1: NSError) => void): void;

	getMultipleBlockSecurityStatusWithRequestFlagBlockRangeCompletionHandler(flags: RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<number>, p2: NSError) => void): void;

	getSystemInfoWithRequestFlagCompletionHandler(flags: RequestFlag, completionHandler: (p1: number, p2: number, p3: number, p4: number, p5: number, p6: NSError) => void): void;

	lockAFIWithRequestFlagCompletionHandler(flags: RequestFlag, completionHandler: (p1: NSError) => void): void;

	lockBlockWithRequestFlagsBlockNumberCompletionHandler(flags: RequestFlag, blockNumber: number, completionHandler: (p1: NSError) => void): void;

	lockDFSIDWithRequestFlagCompletionHandler(flags: RequestFlag, completionHandler: (p1: NSError) => void): void;

	readMultipleBlocksWithConfigurationCompletionHandler(readConfiguration: NFCISO15693ReadMultipleBlocksConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	readMultipleBlocksWithRequestFlagsBlockRangeCompletionHandler(flags: RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	readSingleBlockWithRequestFlagsBlockNumberCompletionHandler(flags: RequestFlag, blockNumber: number, completionHandler: (p1: NSData, p2: NSError) => void): void;

	resetToReadyWithRequestFlagsCompletionHandler(flags: RequestFlag, completionHandler: (p1: NSError) => void): void;

	selectWithRequestFlagsCompletionHandler(flags: RequestFlag, completionHandler: (p1: NSError) => void): void;

	sendCustomCommandWithConfigurationCompletionHandler(commandConfiguration: NFCISO15693CustomCommandConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	stayQuietWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	writeAFIWithRequestFlagAfiCompletionHandler(flags: RequestFlag, afi: number, completionHandler: (p1: NSError) => void): void;

	writeDSFIDWithRequestFlagDsfidCompletionHandler(flags: RequestFlag, dsfid: number, completionHandler: (p1: NSError) => void): void;

	writeMultipleBlocksWithRequestFlagsBlockRangeDataBlocksCompletionHandler(flags: RequestFlag, blockRange: NSRange, dataBlocks: NSArray<NSData> | NSData[], completionHandler: (p1: NSError) => void): void;

	writeSingleBlockWithRequestFlagsBlockNumberDataBlockCompletionHandler(flags: RequestFlag, blockNumber: number, dataBlock: NSData, completionHandler: (p1: NSError) => void): void;
}
declare var NFCISO15693Tag: {

	prototype: NFCISO15693Tag;
};

declare var NFCISO15693TagResponseErrorKey: string;

declare class NFCISO7816APDU extends NSObject implements NSCopying {

	static alloc(): NFCISO7816APDU; // inherited from NSObject

	static new(): NFCISO7816APDU; // inherited from NSObject

	readonly data: NSData;

	readonly expectedResponseLength: number;

	readonly instructionClass: number;

	readonly instructionCode: number;

	readonly p1Parameter: number;

	readonly p2Parameter: number;

	constructor(o: { data: NSData; });

	constructor(o: { instructionClass: number; instructionCode: number; p1Parameter: number; p2Parameter: number; data: NSData; expectedResponseLength: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithData(data: NSData): this;

	initWithInstructionClassInstructionCodeP1ParameterP2ParameterDataExpectedResponseLength(instructionClass: number, instructionCode: number, p1Parameter: number, p2Parameter: number, data: NSData, expectedResponseLength: number): this;
}

interface NFCISO7816Tag extends NFCNDEFTag, NFCTag {

	applicationData: NSData;

	historicalBytes: NSData;

	identifier: NSData;

	initialSelectedAID: string;

	proprietaryApplicationDataCoding: boolean;

	sendCommandAPDUCompletionHandler(apdu: NFCISO7816APDU, completionHandler: (p1: NSData, p2: number, p3: number, p4: NSError) => void): void;
}
declare var NFCISO7816Tag: {

	prototype: NFCISO7816Tag;
};

declare const enum NFCMiFareFamily {

	Unknown = 1,

	Ultralight = 2,

	Plus = 3,

	DESFire = 4
}

interface NFCMiFareTag extends NFCNDEFTag, NFCTag {

	historicalBytes: NSData;

	identifier: NSData;

	mifareFamily: NFCMiFareFamily;

	sendMiFareCommandCompletionHandler(command: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	sendMiFareISO7816CommandCompletionHandler(apdu: NFCISO7816APDU, completionHandler: (p1: NSData, p2: number, p3: number, p4: NSError) => void): void;
}
declare var NFCMiFareTag: {

	prototype: NFCMiFareTag;
};

declare class NFCNDEFMessage extends NSObject implements NSSecureCoding {

	static alloc(): NFCNDEFMessage; // inherited from NSObject

	static ndefMessageWithData(data: NSData): NFCNDEFMessage;

	static new(): NFCNDEFMessage; // inherited from NSObject

	readonly length: number;

	records: NSArray<NFCNDEFPayload>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { NDEFRecords: NSArray<NFCNDEFPayload> | NFCNDEFPayload[]; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNDEFRecords(records: NSArray<NFCNDEFPayload> | NFCNDEFPayload[]): this;
}

declare class NFCNDEFPayload extends NSObject implements NSSecureCoding {

	static alloc(): NFCNDEFPayload; // inherited from NSObject

	static new(): NFCNDEFPayload; // inherited from NSObject

	static wellKnowTypeTextPayloadWithStringLocale(text: string, locale: NSLocale): NFCNDEFPayload;

	static wellKnownTypeTextPayloadWithStringLocale(text: string, locale: NSLocale): NFCNDEFPayload;

	static wellKnownTypeURIPayloadWithString(uri: string): NFCNDEFPayload;

	static wellKnownTypeURIPayloadWithURL(url: NSURL): NFCNDEFPayload;

	identifier: NSData;

	payload: NSData;

	type: NSData;

	typeNameFormat: NFCTypeNameFormat;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { format: NFCTypeNameFormat; type: NSData; identifier: NSData; payload: NSData; });

	constructor(o: { format: NFCTypeNameFormat; type: NSData; identifier: NSData; payload: NSData; chunkSize: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithFormatTypeIdentifierPayload(format: NFCTypeNameFormat, type: NSData, identifier: NSData, payload: NSData): this;

	initWithFormatTypeIdentifierPayloadChunkSize(format: NFCTypeNameFormat, type: NSData, identifier: NSData, payload: NSData, chunkSize: number): this;

	wellKnownTypeTextPayloadWithLocale(locale: interop.Pointer | interop.Reference<NSLocale>): string;

	wellKnownTypeURIPayload(): NSURL;
}

declare class NFCNDEFReaderSession extends NFCReaderSession {

	static alloc(): NFCNDEFReaderSession; // inherited from NSObject

	static new(): NFCNDEFReaderSession; // inherited from NSObject

	constructor(o: { delegate: NFCNDEFReaderSessionDelegate; queue: NSObject; invalidateAfterFirstRead: boolean; });

	connectToTagCompletionHandler(tag: NFCNDEFTag, completionHandler: (p1: NSError) => void): void;

	initWithDelegateQueueInvalidateAfterFirstRead(delegate: NFCNDEFReaderSessionDelegate, queue: NSObject, invalidateAfterFirstRead: boolean): this;

	restartPolling(): void;
}

interface NFCNDEFReaderSessionDelegate extends NSObjectProtocol {

	readerSessionDidBecomeActive?(session: NFCNDEFReaderSession): void;

	readerSessionDidDetectNDEFs(session: NFCNDEFReaderSession, messages: NSArray<NFCNDEFMessage> | NFCNDEFMessage[]): void;

	readerSessionDidDetectTags?(session: NFCNDEFReaderSession, tags: NSArray<NFCNDEFTag> | NFCNDEFTag[]): void;

	readerSessionDidInvalidateWithError(session: NFCNDEFReaderSession, error: NSError): void;
}
declare var NFCNDEFReaderSessionDelegate: {

	prototype: NFCNDEFReaderSessionDelegate;
};

declare const enum NFCNDEFStatus {

	NotSupported = 1,

	ReadWrite = 2,

	ReadOnly = 3
}

interface NFCNDEFTag extends NSCopying, NSObjectProtocol, NSSecureCoding {

	available: boolean;

	queryNDEFStatusWithCompletionHandler(completionHandler: (p1: NFCNDEFStatus, p2: number, p3: NSError) => void): void;

	readNDEFWithCompletionHandler(completionHandler: (p1: NFCNDEFMessage, p2: NSError) => void): void;

	writeLockWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	writeNDEFCompletionHandler(ndefMessage: NFCNDEFMessage, completionHandler: (p1: NSError) => void): void;
}
declare var NFCNDEFTag: {

	prototype: NFCNDEFTag;
};

declare const enum NFCPollingOption {

	ISO14443 = 1,

	ISO15693 = 2,

	ISO18092 = 4
}

declare const enum NFCReaderError {

	ReaderErrorUnsupportedFeature = 1,

	ReaderErrorSecurityViolation = 2,

	ReaderErrorInvalidParameter = 3,

	ReaderErrorInvalidParameterLength = 4,

	ReaderErrorParameterOutOfBound = 5,

	ReaderTransceiveErrorTagConnectionLost = 100,

	ReaderTransceiveErrorRetryExceeded = 101,

	ReaderTransceiveErrorTagResponseError = 102,

	ReaderTransceiveErrorSessionInvalidated = 103,

	ReaderTransceiveErrorTagNotConnected = 104,

	ReaderSessionInvalidationErrorUserCanceled = 200,

	ReaderSessionInvalidationErrorSessionTimeout = 201,

	ReaderSessionInvalidationErrorSessionTerminatedUnexpectedly = 202,

	ReaderSessionInvalidationErrorSystemIsBusy = 203,

	ReaderSessionInvalidationErrorFirstNDEFTagRead = 204,

	TagCommandConfigurationErrorInvalidParameters = 300,

	NdefReaderSessionErrorTagNotWritable = 400,

	NdefReaderSessionErrorTagUpdateFailure = 401,

	NdefReaderSessionErrorTagSizeTooSmall = 402,

	NdefReaderSessionErrorZeroLengthMessage = 403
}

declare class NFCReaderSession extends NSObject implements NFCReaderSessionProtocol {

	static alloc(): NFCReaderSession; // inherited from NSObject

	static new(): NFCReaderSession; // inherited from NSObject

	readonly delegate: any;

	readonly sessionQueue: NSObject;

	static readonly readingAvailable: boolean;

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

	invalidateSessionWithErrorMessage(errorMessage: string): void;

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

	readerSessionDidDetectTags?(session: NFCReaderSession, tags: NSArray<NFCTag> | NFCTag[]): void;

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

	invalidateSessionWithErrorMessage(errorMessage: string): void;
}
declare var NFCReaderSessionProtocol: {

	prototype: NFCReaderSessionProtocol;
};

interface NFCTag extends NSCopying, NSObjectProtocol, NSSecureCoding {

	available: boolean;

	session: NFCReaderSessionProtocol;

	type: NFCTagType;

	asNFCFeliCaTag(): NFCFeliCaTag;

	asNFCISO15693Tag(): NFCISO15693Tag;

	asNFCISO7816Tag(): NFCISO7816Tag;

	asNFCMiFareTag(): NFCMiFareTag;
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

declare class NFCTagReaderSession extends NFCReaderSession {

	static alloc(): NFCTagReaderSession; // inherited from NSObject

	static new(): NFCTagReaderSession; // inherited from NSObject

	readonly connectedTag: NFCTag;

	constructor(o: { pollingOption: NFCPollingOption; delegate: NFCTagReaderSessionDelegate; queue: NSObject; });

	connectToTagCompletionHandler(tag: NFCTag, completionHandler: (p1: NSError) => void): void;

	initWithPollingOptionDelegateQueue(pollingOption: NFCPollingOption, delegate: NFCTagReaderSessionDelegate, queue: NSObject): this;

	restartPolling(): void;
}

interface NFCTagReaderSessionDelegate extends NSObjectProtocol {

	tagReaderSessionDidBecomeActive?(session: NFCTagReaderSession): void;

	tagReaderSessionDidDetectTags?(session: NFCTagReaderSession, tags: NSArray<NFCTag> | NFCTag[]): void;

	tagReaderSessionDidInvalidateWithError(session: NFCTagReaderSession, error: NSError): void;
}
declare var NFCTagReaderSessionDelegate: {

	prototype: NFCTagReaderSessionDelegate;
};

declare var NFCTagResponseUnexpectedLengthErrorKey: string;

declare const enum NFCTagType {

	ISO15693 = 1,

	FeliCa = 2,

	ISO7816Compatible = 3,

	MiFare = 4
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

declare class NFCVASCommandConfiguration extends NSObject implements NSCopying {

	static alloc(): NFCVASCommandConfiguration; // inherited from NSObject

	static new(): NFCVASCommandConfiguration; // inherited from NSObject

	mode: VASMode;

	passTypeIdentifier: string;

	url: NSURL;

	constructor(o: { VASMode: VASMode; passTypeIdentifier: string; url: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithVASModePassTypeIdentifierUrl(mode: VASMode, passTypeIdentifier: string, url: NSURL): this;
}

declare class NFCVASReaderSession extends NFCReaderSession {

	static alloc(): NFCVASReaderSession; // inherited from NSObject

	static new(): NFCVASReaderSession; // inherited from NSObject

	constructor(o: { VASCommandConfigurations: NSArray<NFCVASCommandConfiguration> | NFCVASCommandConfiguration[]; delegate: NFCVASReaderSessionDelegate; queue: NSObject; });

	initWithVASCommandConfigurationsDelegateQueue(commandConfigurations: NSArray<NFCVASCommandConfiguration> | NFCVASCommandConfiguration[], delegate: NFCVASReaderSessionDelegate, queue: NSObject): this;
}

interface NFCVASReaderSessionDelegate extends NSObjectProtocol {

	readerSessionDidBecomeActive?(session: NFCVASReaderSession): void;

	readerSessionDidInvalidateWithError(session: NFCVASReaderSession, error: NSError): void;

	readerSessionDidReceiveVASResponses(session: NFCVASReaderSession, responses: NSArray<NFCVASResponse> | NFCVASResponse[]): void;
}
declare var NFCVASReaderSessionDelegate: {

	prototype: NFCVASReaderSessionDelegate;
};

declare class NFCVASResponse extends NSObject implements NSCopying {

	static alloc(): NFCVASResponse; // inherited from NSObject

	static new(): NFCVASResponse; // inherited from NSObject

	readonly mobileToken: NSData;

	readonly status: VASErrorCode;

	readonly vasData: NSData;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum PollingRequestCode {

	NoRequest = 0,

	SystemCode = 1,

	CommunicationPerformance = 2
}

declare const enum PollingTimeSlot {

	Max1 = 0,

	Max2 = 1,

	Max4 = 3,

	Max8 = 7,

	Max16 = 15
}

declare const enum RequestFlag {

	DualSubCarriers = 1,

	HighDataRate = 2,

	ProtocolExtension = 8,

	Select = 16,

	Address = 32,

	Option = 64
}

declare const enum VASErrorCode {

	Success = 36864,

	DataNotFound = 27267,

	DataNotActivated = 25223,

	WrongParameters = 27392,

	WrongLCField = 26368,

	UserIntervention = 27012,

	IncorrectData = 27264,

	UnsupportedApplicationVersion = 25408
}

declare const enum VASMode {

	URLOnly = 0,

	Normal = 1
}
