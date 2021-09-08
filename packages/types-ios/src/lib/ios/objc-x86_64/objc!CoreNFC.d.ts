
declare var NFCErrorDomain: string;

declare const enum NFCFeliCaEncryptionId {

	NFCFeliCaEncryptionIdAES = 79,

	NFCFeliCaEncryptionIdAES_DES = 65,

	EncryptionIdAES = 79,

	EncryptionIdAES_DES = 65
}

declare const enum NFCFeliCaPollingRequestCode {

	NFCFeliCaPollingRequestCodeNoRequest = 0,

	NFCFeliCaPollingRequestCodeSystemCode = 1,

	NFCFeliCaPollingRequestCodeCommunicationPerformance = 2,

	PollingRequestCodeNoRequest = 0,

	PollingRequestCodeSystemCode = 1,

	PollingRequestCodeCommunicationPerformance = 2
}

declare const enum NFCFeliCaPollingTimeSlot {

	NFCFeliCaPollingTimeSlotMax1 = 0,

	NFCFeliCaPollingTimeSlotMax2 = 1,

	NFCFeliCaPollingTimeSlotMax4 = 3,

	NFCFeliCaPollingTimeSlotMax8 = 7,

	NFCFeliCaPollingTimeSlotMax16 = 15,

	PollingTimeSlotMax1 = 0,

	PollingTimeSlotMax2 = 1,

	PollingTimeSlotMax4 = 3,

	PollingTimeSlotMax8 = 7,

	PollingTimeSlotMax16 = 15
}

interface NFCFeliCaTag extends NFCNDEFTag, NFCTag {

	currentIDm: NSData;

	currentSystemCode: NSData;

	pollingWithSystemCodeRequestCodeTimeSlotCompletionHandler(systemCode: NSData, requestCode: NFCFeliCaPollingRequestCode, timeSlot: NFCFeliCaPollingTimeSlot, completionHandler: (p1: NSData, p2: NSData, p3: NSError) => void): void;

	readWithoutEncryptionWithServiceCodeListBlockListCompletionHandler(serviceCodeList: NSArray<NSData> | NSData[], blockList: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: NSArray<NSData>, p4: NSError) => void): void;

	requestResponseWithCompletionHandler(completionHandler: (p1: number, p2: NSError) => void): void;

	requestServiceV2WithNodeCodeListCompletionHandler(nodeCodeList: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: NFCFeliCaEncryptionId, p4: NSArray<NSData>, p5: NSArray<NSData>, p6: NSError) => void): void;

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

declare const enum NFCISO15693RequestFlag {

	NFCISO15693RequestFlagDualSubCarriers = 1,

	NFCISO15693RequestFlagHighDataRate = 2,

	NFCISO15693RequestFlagProtocolExtension = 8,

	NFCISO15693RequestFlagSelect = 16,

	NFCISO15693RequestFlagAddress = 32,

	NFCISO15693RequestFlagOption = 64,

	NFCISO15693RequestFlagCommandSpecificBit8 = 128,

	RequestFlagDualSubCarriers = 1,

	RequestFlagHighDataRate = 2,

	RequestFlagProtocolExtension = 8,

	RequestFlagSelect = 16,

	RequestFlagAddress = 32,

	RequestFlagOption = 64
}

declare const enum NFCISO15693ResponseFlag {

	Error = 1,

	ResponseBufferValid = 2,

	FinalResponse = 4,

	ProtocolExtension = 8,

	BlockSecurityStatusBit5 = 16,

	BlockSecurityStatusBit6 = 32,

	WaitTimeExtension = 64
}

interface NFCISO15693Tag extends NFCNDEFTag, NFCTag {

	icManufacturerCode: number;

	icSerialNumber: NSData;

	identifier: NSData;

	authenticateWithRequestFlagsCryptoSuiteIdentifierMessageCompletionHandler(flags: NFCISO15693RequestFlag, cryptoSuiteIdentifier: number, message: NSData, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData, p3: NSError) => void): void;

	challengeWithRequestFlagsCryptoSuiteIdentifierMessageCompletionHandler(flags: NFCISO15693RequestFlag, cryptoSuiteIdentifier: number, message: NSData, completionHandler: (p1: NSError) => void): void;

	customCommandWithRequestFlagCustomCommandCodeCustomRequestParametersCompletionHandler(flags: NFCISO15693RequestFlag, customCommandCode: number, customRequestParameters: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	extendedFastReadMultipleBlocksWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	extendedGetMultipleBlockSecurityStatusWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<number>, p2: NSError) => void): void;

	extendedLockBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSError) => void): void;

	extendedReadMultipleBlocksWithRequestFlagsBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	extendedReadSingleBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSData, p2: NSError) => void): void;

	extendedWriteMultipleBlocksWithRequestFlagsBlockRangeDataBlocksCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, dataBlocks: NSArray<NSData> | NSData[], completionHandler: (p1: NSError) => void): void;

	extendedWriteSingleBlockWithRequestFlagsBlockNumberDataBlockCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, dataBlock: NSData, completionHandler: (p1: NSError) => void): void;

	fastReadMultipleBlocksWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	getMultipleBlockSecurityStatusWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<number>, p2: NSError) => void): void;

	getSystemInfoAndUIDWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSData, p2: number, p3: number, p4: number, p5: number, p6: number, p7: NSError) => void): void;

	getSystemInfoWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: number, p2: number, p3: number, p4: number, p5: number, p6: NSError) => void): void;

	keyUpdateWithRequestFlagsKeyIdentifierMessageCompletionHandler(flags: NFCISO15693RequestFlag, keyIdentifier: number, message: NSData, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData, p3: NSError) => void): void;

	lockAFIWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	lockBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSError) => void): void;

	lockDFSIDWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	lockDSFIDWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	readBufferWithRequestFlagsCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData, p3: NSError) => void): void;

	readMultipleBlocksWithConfigurationCompletionHandler(readConfiguration: NFCISO15693ReadMultipleBlocksConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	readMultipleBlocksWithRequestFlagsBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	readSingleBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSData, p2: NSError) => void): void;

	resetToReadyWithRequestFlagsCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	selectWithRequestFlagsCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	sendCustomCommandWithConfigurationCompletionHandler(commandConfiguration: NFCISO15693CustomCommandConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	sendRequestWithFlagCommandCodeDataCompletionHandler(flags: number, commandCode: number, data: NSData, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData) => void): void;

	stayQuietWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	writeAFIWithRequestFlagAfiCompletionHandler(flags: NFCISO15693RequestFlag, afi: number, completionHandler: (p1: NSError) => void): void;

	writeDSFIDWithRequestFlagDsfidCompletionHandler(flags: NFCISO15693RequestFlag, dsfid: number, completionHandler: (p1: NSError) => void): void;

	writeMultipleBlocksWithRequestFlagsBlockRangeDataBlocksCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, dataBlocks: NSArray<NSData> | NSData[], completionHandler: (p1: NSError) => void): void;

	writeSingleBlockWithRequestFlagsBlockNumberDataBlockCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, dataBlock: NSData, completionHandler: (p1: NSError) => void): void;
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

	ReaderErrorRadioDisabled = 6,

	ReaderTransceiveErrorTagConnectionLost = 100,

	ReaderTransceiveErrorRetryExceeded = 101,

	ReaderTransceiveErrorTagResponseError = 102,

	ReaderTransceiveErrorSessionInvalidated = 103,

	ReaderTransceiveErrorTagNotConnected = 104,

	ReaderTransceiveErrorPacketTooLong = 105,

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

	mode: NFCVASMode;

	passTypeIdentifier: string;

	url: NSURL;

	constructor(o: { VASMode: NFCVASMode; passTypeIdentifier: string; url: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithVASModePassTypeIdentifierUrl(mode: NFCVASMode, passTypeIdentifier: string, url: NSURL): this;
}

declare const enum NFCVASErrorCode {

	NFCVASErrorCodeSuccess = 36864,

	NFCVASErrorCodeDataNotFound = 27267,

	NFCVASErrorCodeDataNotActivated = 25223,

	NFCVASErrorCodeWrongParameters = 27392,

	NFCVASErrorCodeWrongLCField = 26368,

	NFCVASErrorCodeUserIntervention = 27012,

	NFCVASErrorCodeIncorrectData = 27264,

	NFCVASErrorCodeUnsupportedApplicationVersion = 25408,

	VASErrorCodeSuccess = 36864,

	VASErrorCodeDataNotFound = 27267,

	VASErrorCodeDataNotActivated = 25223,

	VASErrorCodeWrongParameters = 27392,

	VASErrorCodeWrongLCField = 26368,

	VASErrorCodeUserIntervention = 27012,

	VASErrorCodeIncorrectData = 27264,

	VASErrorCodeUnsupportedApplicationVersion = 25408
}

declare const enum NFCVASMode {

	NFCVASModeURLOnly = 0,

	NFCVASModeNormal = 1,

	VASModeURLOnly = 0,

	VASModeNormal = 1
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

	readonly status: NFCVASErrorCode;

	readonly vasData: NSData;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}
