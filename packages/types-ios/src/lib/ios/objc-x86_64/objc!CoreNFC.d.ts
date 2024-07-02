
/**
 * @since 11.0
 */
declare var NFCErrorDomain: string;

/**
 * @since 13.0
 */
declare const enum NFCFeliCaEncryptionId {

	NFCFeliCaEncryptionIdAES = 79,

	NFCFeliCaEncryptionIdAES_DES = 65,

	EncryptionIdAES = 79,

	EncryptionIdAES_DES = 65
}

/**
 * @since 13.0
 */
declare const enum NFCFeliCaPollingRequestCode {

	NFCFeliCaPollingRequestCodeNoRequest = 0,

	NFCFeliCaPollingRequestCodeSystemCode = 1,

	NFCFeliCaPollingRequestCodeCommunicationPerformance = 2,

	PollingRequestCodeNoRequest = 0,

	PollingRequestCodeSystemCode = 1,

	PollingRequestCodeCommunicationPerformance = 2
}

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
interface NFCFeliCaTag extends NFCNDEFTag, NFCTag {

	/**
	 * @since 13.0
	 */
	currentIDm: NSData;

	/**
	 * @since 13.0
	 */
	currentSystemCode: NSData;

	/**
	 * @since 13.0
	 */
	pollingWithSystemCodeRequestCodeTimeSlotCompletionHandler(systemCode: NSData, requestCode: NFCFeliCaPollingRequestCode, timeSlot: NFCFeliCaPollingTimeSlot, completionHandler: (p1: NSData, p2: NSData, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	readWithoutEncryptionWithServiceCodeListBlockListCompletionHandler(serviceCodeList: NSArray<NSData> | NSData[], blockList: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: NSArray<NSData>, p4: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestResponseWithCompletionHandler(completionHandler: (p1: number, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestServiceV2WithNodeCodeListCompletionHandler(nodeCodeList: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: NFCFeliCaEncryptionId, p4: NSArray<NSData>, p5: NSArray<NSData>, p6: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestServiceWithNodeCodeListCompletionHandler(nodeCodeList: NSArray<NSData> | NSData[], completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestSpecificationVersionWithCompletionHandler(completionHandler: (p1: number, p2: number, p3: NSData, p4: NSData, p5: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	requestSystemCodeWithCompletionHandler(completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	resetModeWithCompletionHandler(completionHandler: (p1: number, p2: number, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	sendFeliCaCommandPacketCompletionHandler(commandPacket: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	writeWithoutEncryptionWithServiceCodeListBlockListBlockDataCompletionHandler(serviceCodeList: NSArray<NSData> | NSData[], blockList: NSArray<NSData> | NSData[], blockData: NSArray<NSData> | NSData[], completionHandler: (p1: number, p2: number, p3: NSError) => void): void;
}
declare var NFCFeliCaTag: {

	prototype: NFCFeliCaTag;
};

/**
 * @since 11.0
 */
declare class NFCISO15693CustomCommandConfiguration extends NFCTagCommandConfiguration {

	static alloc(): NFCISO15693CustomCommandConfiguration; // inherited from NSObject

	static new(): NFCISO15693CustomCommandConfiguration; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	customCommandCode: number;

	/**
	 * @since 11.0
	 */
	manufacturerCode: number;

	/**
	 * @since 11.0
	 */
	requestParameters: NSData;

	/**
	 * @since 11.0
	 */
	constructor(o: { manufacturerCode: number; customCommandCode: number; requestParameters: NSData; });

	/**
	 * @since 11.0
	 */
	constructor(o: { manufacturerCode: number; customCommandCode: number; requestParameters: NSData; maximumRetries: number; retryInterval: number; });

	/**
	 * @since 11.0
	 */
	initWithManufacturerCodeCustomCommandCodeRequestParameters(manufacturerCode: number, customCommandCode: number, requestParameters: NSData): this;

	/**
	 * @since 11.0
	 */
	initWithManufacturerCodeCustomCommandCodeRequestParametersMaximumRetriesRetryInterval(manufacturerCode: number, customCommandCode: number, requestParameters: NSData, maximumRetries: number, retryInterval: number): this;
}

/**
 * @since 11.0
 */
declare class NFCISO15693ReadMultipleBlocksConfiguration extends NFCTagCommandConfiguration {

	static alloc(): NFCISO15693ReadMultipleBlocksConfiguration; // inherited from NSObject

	static new(): NFCISO15693ReadMultipleBlocksConfiguration; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	chunkSize: number;

	/**
	 * @since 11.0
	 */
	range: NSRange;

	/**
	 * @since 11.0
	 */
	constructor(o: { range: NSRange; chunkSize: number; });

	/**
	 * @since 11.0
	 */
	constructor(o: { range: NSRange; chunkSize: number; maximumRetries: number; retryInterval: number; });

	/**
	 * @since 11.0
	 */
	initWithRangeChunkSize(range: NSRange, chunkSize: number): this;

	/**
	 * @since 11.0
	 */
	initWithRangeChunkSizeMaximumRetriesRetryInterval(range: NSRange, chunkSize: number, maximumRetries: number, retryInterval: number): this;
}

/**
 * @since 11.0
 * @deprecated 17.0
 */
declare class NFCISO15693ReaderSession extends NFCReaderSession {

	static alloc(): NFCISO15693ReaderSession; // inherited from NSObject

	static new(): NFCISO15693ReaderSession; // inherited from NSObject

	/**
	 * @since 11.0
	 * @deprecated 17.0
	 */
	constructor(o: { delegate: NFCReaderSessionDelegate; queue: NSObject & OS_dispatch_queue; });

	/**
	 * @since 11.0
	 * @deprecated 17.0
	 */
	initWithDelegateQueue(delegate: NFCReaderSessionDelegate, queue: NSObject & OS_dispatch_queue): this;

	/**
	 * @since 11.0
	 * @deprecated 17.0
	 */
	restartPolling(): void;
}

/**
 * @since 11.0
 */
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

/**
 * @since 14.0
 */
declare const enum NFCISO15693ResponseFlag {

	Error = 1,

	ResponseBufferValid = 2,

	FinalResponse = 4,

	ProtocolExtension = 8,

	BlockSecurityStatusBit5 = 16,

	BlockSecurityStatusBit6 = 32,

	WaitTimeExtension = 64
}

/**
 * @since 11.0
 */
interface NFCISO15693Tag extends NFCNDEFTag, NFCTag {

	/**
	 * @since 11.0
	 */
	icManufacturerCode: number;

	/**
	 * @since 11.0
	 */
	icSerialNumber: NSData;

	/**
	 * @since 11.0
	 */
	identifier: NSData;

	/**
	 * @since 14.0
	 */
	authenticateWithRequestFlagsCryptoSuiteIdentifierMessageCompletionHandler(flags: NFCISO15693RequestFlag, cryptoSuiteIdentifier: number, message: NSData, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData, p3: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	challengeWithRequestFlagsCryptoSuiteIdentifierMessageCompletionHandler(flags: NFCISO15693RequestFlag, cryptoSuiteIdentifier: number, message: NSData, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	customCommandWithRequestFlagCustomCommandCodeCustomRequestParametersCompletionHandler(flags: NFCISO15693RequestFlag, customCommandCode: number, customRequestParameters: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	extendedFastReadMultipleBlocksWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	extendedGetMultipleBlockSecurityStatusWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<number>, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	extendedLockBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	extendedReadMultipleBlocksWithRequestFlagsBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	extendedReadSingleBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	extendedWriteMultipleBlocksWithRequestFlagsBlockRangeDataBlocksCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, dataBlocks: NSArray<NSData> | NSData[], completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	extendedWriteSingleBlockWithRequestFlagsBlockNumberDataBlockCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, dataBlock: NSData, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	fastReadMultipleBlocksWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	getMultipleBlockSecurityStatusWithRequestFlagBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<number>, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	getSystemInfoAndUIDWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSData, p2: number, p3: number, p4: number, p5: number, p6: number, p7: NSError) => void): void;

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	getSystemInfoWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: number, p2: number, p3: number, p4: number, p5: number, p6: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	keyUpdateWithRequestFlagsKeyIdentifierMessageCompletionHandler(flags: NFCISO15693RequestFlag, keyIdentifier: number, message: NSData, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	lockAFIWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	lockBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 * @deprecated 14.0
	 */
	lockDFSIDWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	lockDSFIDWithRequestFlagCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	readBufferWithRequestFlagsCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData, p3: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	readMultipleBlocksWithConfigurationCompletionHandler(readConfiguration: NFCISO15693ReadMultipleBlocksConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	readMultipleBlocksWithRequestFlagsBlockRangeCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, completionHandler: (p1: NSArray<NSData>, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	readSingleBlockWithRequestFlagsBlockNumberCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	resetToReadyWithRequestFlagsCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	selectWithRequestFlagsCompletionHandler(flags: NFCISO15693RequestFlag, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	sendCustomCommandWithConfigurationCompletionHandler(commandConfiguration: NFCISO15693CustomCommandConfiguration, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 14.0
	 */
	sendRequestWithFlagCommandCodeDataCompletionHandler(flags: number, commandCode: number, data: NSData, completionHandler: (p1: NFCISO15693ResponseFlag, p2: NSData, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	stayQuietWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	writeAFIWithRequestFlagAfiCompletionHandler(flags: NFCISO15693RequestFlag, afi: number, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	writeDSFIDWithRequestFlagDsfidCompletionHandler(flags: NFCISO15693RequestFlag, dsfid: number, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	writeMultipleBlocksWithRequestFlagsBlockRangeDataBlocksCompletionHandler(flags: NFCISO15693RequestFlag, blockRange: NSRange, dataBlocks: NSArray<NSData> | NSData[], completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	writeSingleBlockWithRequestFlagsBlockNumberDataBlockCompletionHandler(flags: NFCISO15693RequestFlag, blockNumber: number, dataBlock: NSData, completionHandler: (p1: NSError) => void): void;
}
declare var NFCISO15693Tag: {

	prototype: NFCISO15693Tag;
};

/**
 * @since 11.0
 */
declare var NFCISO15693TagResponseErrorKey: string;

/**
 * @since 13.0
 */
declare class NFCISO7816APDU extends NSObject implements NSCopying {

	static alloc(): NFCISO7816APDU; // inherited from NSObject

	static new(): NFCISO7816APDU; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly data: NSData;

	/**
	 * @since 13.0
	 */
	readonly expectedResponseLength: number;

	/**
	 * @since 13.0
	 */
	readonly instructionClass: number;

	/**
	 * @since 13.0
	 */
	readonly instructionCode: number;

	/**
	 * @since 13.0
	 */
	readonly p1Parameter: number;

	/**
	 * @since 13.0
	 */
	readonly p2Parameter: number;

	/**
	 * @since 13.0
	 */
	constructor(o: { data: NSData; });

	/**
	 * @since 13.0
	 */
	constructor(o: { instructionClass: number; instructionCode: number; p1Parameter: number; p2Parameter: number; data: NSData; expectedResponseLength: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 13.0
	 */
	initWithData(data: NSData): this;

	/**
	 * @since 13.0
	 */
	initWithInstructionClassInstructionCodeP1ParameterP2ParameterDataExpectedResponseLength(instructionClass: number, instructionCode: number, p1Parameter: number, p2Parameter: number, data: NSData, expectedResponseLength: number): this;
}

/**
 * @since 13.0
 */
interface NFCISO7816Tag extends NFCNDEFTag, NFCTag {

	/**
	 * @since 13.0
	 */
	applicationData: NSData;

	/**
	 * @since 13.0
	 */
	historicalBytes: NSData;

	/**
	 * @since 13.0
	 */
	identifier: NSData;

	/**
	 * @since 13.0
	 */
	initialSelectedAID: string;

	/**
	 * @since 13.0
	 */
	proprietaryApplicationDataCoding: boolean;

	/**
	 * @since 13.0
	 */
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

/**
 * @since 13.0
 */
interface NFCMiFareTag extends NFCNDEFTag, NFCTag {

	/**
	 * @since 13.0
	 */
	historicalBytes: NSData;

	/**
	 * @since 13.0
	 */
	identifier: NSData;

	/**
	 * @since 13.0
	 */
	mifareFamily: NFCMiFareFamily;

	/**
	 * @since 13.0
	 */
	sendMiFareCommandCompletionHandler(command: NSData, completionHandler: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	sendMiFareISO7816CommandCompletionHandler(apdu: NFCISO7816APDU, completionHandler: (p1: NSData, p2: number, p3: number, p4: NSError) => void): void;
}
declare var NFCMiFareTag: {

	prototype: NFCMiFareTag;
};

/**
 * @since 11.0
 */
declare class NFCNDEFMessage extends NSObject implements NSSecureCoding {

	static alloc(): NFCNDEFMessage; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static ndefMessageWithData(data: NSData): NFCNDEFMessage;

	static new(): NFCNDEFMessage; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly length: number;

	/**
	 * @since 11.0
	 */
	records: NSArray<NFCNDEFPayload>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 13.0
	 */
	constructor(o: { NDEFRecords: NSArray<NFCNDEFPayload> | NFCNDEFPayload[]; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 13.0
	 */
	initWithNDEFRecords(records: NSArray<NFCNDEFPayload> | NFCNDEFPayload[]): this;
}

/**
 * @since 11.0
 */
declare class NFCNDEFPayload extends NSObject implements NSSecureCoding {

	static alloc(): NFCNDEFPayload; // inherited from NSObject

	static new(): NFCNDEFPayload; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 13.0
	 */
	static wellKnowTypeTextPayloadWithStringLocale(text: string, locale: NSLocale): NFCNDEFPayload;

	/**
	 * @since 13.0
	 */
	static wellKnownTypeTextPayloadWithStringLocale(text: string, locale: NSLocale): NFCNDEFPayload;

	/**
	 * @since 13.0
	 */
	static wellKnownTypeURIPayloadWithString(uri: string): NFCNDEFPayload;

	/**
	 * @since 13.0
	 */
	static wellKnownTypeURIPayloadWithURL(url: NSURL): NFCNDEFPayload;

	/**
	 * @since 11.0
	 */
	identifier: NSData;

	/**
	 * @since 11.0
	 */
	payload: NSData;

	/**
	 * @since 11.0
	 */
	type: NSData;

	/**
	 * @since 11.0
	 */
	typeNameFormat: NFCTypeNameFormat;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 13.0
	 */
	constructor(o: { format: NFCTypeNameFormat; type: NSData; identifier: NSData; payload: NSData; });

	/**
	 * @since 13.0
	 */
	constructor(o: { format: NFCTypeNameFormat; type: NSData; identifier: NSData; payload: NSData; chunkSize: number; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 13.0
	 */
	initWithFormatTypeIdentifierPayload(format: NFCTypeNameFormat, type: NSData, identifier: NSData, payload: NSData): this;

	/**
	 * @since 13.0
	 */
	initWithFormatTypeIdentifierPayloadChunkSize(format: NFCTypeNameFormat, type: NSData, identifier: NSData, payload: NSData, chunkSize: number): this;

	/**
	 * @since 13.0
	 */
	wellKnownTypeTextPayloadWithLocale(locale: interop.Pointer | interop.Reference<NSLocale>): string;

	/**
	 * @since 13.0
	 */
	wellKnownTypeURIPayload(): NSURL;
}

/**
 * @since 11.0
 */
declare class NFCNDEFReaderSession extends NFCReaderSession {

	static alloc(): NFCNDEFReaderSession; // inherited from NSObject

	static new(): NFCNDEFReaderSession; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	constructor(o: { delegate: NFCNDEFReaderSessionDelegate; queue: NSObject & OS_dispatch_queue; invalidateAfterFirstRead: boolean; });

	/**
	 * @since 13.0
	 */
	connectToTagCompletionHandler(tag: NFCNDEFTag, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	initWithDelegateQueueInvalidateAfterFirstRead(delegate: NFCNDEFReaderSessionDelegate, queue: NSObject & OS_dispatch_queue, invalidateAfterFirstRead: boolean): this;

	/**
	 * @since 13.0
	 */
	restartPolling(): void;
}

/**
 * @since 11.0
 */
interface NFCNDEFReaderSessionDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	readerSessionDidBecomeActive?(session: NFCNDEFReaderSession): void;

	/**
	 * @since 11.0
	 */
	readerSessionDidDetectNDEFs(session: NFCNDEFReaderSession, messages: NSArray<NFCNDEFMessage> | NFCNDEFMessage[]): void;

	/**
	 * @since 13.0
	 */
	readerSessionDidDetectTags?(session: NFCNDEFReaderSession, tags: NSArray<NFCNDEFTag> | NFCNDEFTag[]): void;

	/**
	 * @since 11.0
	 */
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

/**
 * @since 13.0
 */
interface NFCNDEFTag extends NSCopying, NSObjectProtocol, NSSecureCoding {

	/**
	 * @since 13.0
	 */
	available: boolean;

	/**
	 * @since 13.0
	 */
	queryNDEFStatusWithCompletionHandler(completionHandler: (p1: NFCNDEFStatus, p2: number, p3: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	readNDEFWithCompletionHandler(completionHandler: (p1: NFCNDEFMessage, p2: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	writeLockWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	writeNDEFCompletionHandler(ndefMessage: NFCNDEFMessage, completionHandler: (p1: NSError) => void): void;
}
declare var NFCNDEFTag: {

	prototype: NFCNDEFTag;
};

declare const enum NFCPollingOption {

	ISO14443 = 1,

	ISO15693 = 2,

	ISO18092 = 4,

	PACE = 8
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

/**
 * @since 11.0
 */
declare class NFCReaderSession extends NSObject implements NFCReaderSessionProtocol {

	static alloc(): NFCReaderSession; // inherited from NSObject

	static new(): NFCReaderSession; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly delegate: any;

	/**
	 * @since 11.0
	 */
	readonly sessionQueue: NSObject & OS_dispatch_queue;

	/**
	 * @since 11.0
	 */
	static readonly readingAvailable: boolean;

	/**
	 * @since 11.0
	 */
	alertMessage: string; // inherited from NFCReaderSessionProtocol

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	/**
	 * @since 11.0
	 */
	readonly ready: boolean; // inherited from NFCReaderSessionProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	/**
	 * @since 11.0
	 */
	beginSession(): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	/**
	 * @since 11.0
	 */
	invalidateSession(): void;

	/**
	 * @since 13.0
	 */
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

/**
 * @since 11.0
 */
interface NFCReaderSessionDelegate extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	readerSessionDidBecomeActive(session: NFCReaderSession): void;

	/**
	 * @since 11.0
	 */
	readerSessionDidDetectTags?(session: NFCReaderSession, tags: NSArray<NFCTag> | NFCTag[]): void;

	/**
	 * @since 11.0
	 */
	readerSessionDidInvalidateWithError(session: NFCReaderSession, error: NSError): void;
}
declare var NFCReaderSessionDelegate: {

	prototype: NFCReaderSessionDelegate;
};

/**
 * @since 11.0
 */
interface NFCReaderSessionProtocol extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	alertMessage: string;

	/**
	 * @since 11.0
	 */
	ready: boolean;

	/**
	 * @since 11.0
	 */
	beginSession(): void;

	/**
	 * @since 11.0
	 */
	invalidateSession(): void;

	/**
	 * @since 13.0
	 */
	invalidateSessionWithErrorMessage(errorMessage: string): void;
}
declare var NFCReaderSessionProtocol: {

	prototype: NFCReaderSessionProtocol;
};

/**
 * @since 11.0
 */
interface NFCTag extends NSCopying, NSObjectProtocol, NSSecureCoding {

	/**
	 * @since 11.0
	 */
	available: boolean;

	/**
	 * @since 11.0
	 */
	session: NFCReaderSessionProtocol;

	/**
	 * @since 11.0
	 */
	type: NFCTagType;

	/**
	 * @since 13.0
	 */
	asNFCFeliCaTag(): NFCFeliCaTag;

	/**
	 * @since 13.0
	 */
	asNFCISO15693Tag(): NFCISO15693Tag;

	/**
	 * @since 13.0
	 */
	asNFCISO7816Tag(): NFCISO7816Tag;

	/**
	 * @since 13.0
	 */
	asNFCMiFareTag(): NFCMiFareTag;
}
declare var NFCTag: {

	prototype: NFCTag;
};

/**
 * @since 11.0
 */
declare class NFCTagCommandConfiguration extends NSObject implements NSCopying {

	static alloc(): NFCTagCommandConfiguration; // inherited from NSObject

	static new(): NFCTagCommandConfiguration; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	maximumRetries: number;

	/**
	 * @since 11.0
	 */
	retryInterval: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 13.0
 */
declare class NFCTagReaderSession extends NFCReaderSession {

	static alloc(): NFCTagReaderSession; // inherited from NSObject

	static new(): NFCTagReaderSession; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly connectedTag: NFCTag;

	/**
	 * @since 13.0
	 */
	constructor(o: { pollingOption: NFCPollingOption; delegate: NFCTagReaderSessionDelegate; queue: NSObject & OS_dispatch_queue; });

	/**
	 * @since 13.0
	 */
	connectToTagCompletionHandler(tag: NFCTag, completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 13.0
	 */
	initWithPollingOptionDelegateQueue(pollingOption: NFCPollingOption, delegate: NFCTagReaderSessionDelegate, queue: NSObject & OS_dispatch_queue): this;

	/**
	 * @since 13.0
	 */
	restartPolling(): void;
}

/**
 * @since 13.0
 */
interface NFCTagReaderSessionDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	tagReaderSessionDidBecomeActive?(session: NFCTagReaderSession): void;

	/**
	 * @since 13.0
	 */
	tagReaderSessionDidDetectTags?(session: NFCTagReaderSession, tags: NSArray<NFCTag> | NFCTag[]): void;

	/**
	 * @since 13.0
	 */
	tagReaderSessionDidInvalidateWithError(session: NFCTagReaderSession, error: NSError): void;
}
declare var NFCTagReaderSessionDelegate: {

	prototype: NFCTagReaderSessionDelegate;
};

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare class NFCVASCommandConfiguration extends NSObject implements NSCopying {

	static alloc(): NFCVASCommandConfiguration; // inherited from NSObject

	static new(): NFCVASCommandConfiguration; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	mode: NFCVASMode;

	/**
	 * @since 13.0
	 */
	passTypeIdentifier: string;

	/**
	 * @since 13.0
	 */
	url: NSURL;

	constructor(o: { VASMode: NFCVASMode; passTypeIdentifier: string; url: NSURL; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithVASModePassTypeIdentifierUrl(mode: NFCVASMode, passTypeIdentifier: string, url: NSURL): this;
}

/**
 * @since 13.0
 */
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

/**
 * @since 13.0
 */
declare const enum NFCVASMode {

	NFCVASModeURLOnly = 0,

	NFCVASModeNormal = 1,

	VASModeURLOnly = 0,

	VASModeNormal = 1
}

/**
 * @since 13.0
 */
declare class NFCVASReaderSession extends NFCReaderSession {

	static alloc(): NFCVASReaderSession; // inherited from NSObject

	static new(): NFCVASReaderSession; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	constructor(o: { VASCommandConfigurations: NSArray<NFCVASCommandConfiguration> | NFCVASCommandConfiguration[]; delegate: NFCVASReaderSessionDelegate; queue: NSObject & OS_dispatch_queue; });

	/**
	 * @since 13.0
	 */
	initWithVASCommandConfigurationsDelegateQueue(commandConfigurations: NSArray<NFCVASCommandConfiguration> | NFCVASCommandConfiguration[], delegate: NFCVASReaderSessionDelegate, queue: NSObject & OS_dispatch_queue): this;
}

/**
 * @since 13.0
 */
interface NFCVASReaderSessionDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	readerSessionDidBecomeActive?(session: NFCVASReaderSession): void;

	/**
	 * @since 13.0
	 */
	readerSessionDidInvalidateWithError(session: NFCVASReaderSession, error: NSError): void;

	/**
	 * @since 13.0
	 */
	readerSessionDidReceiveVASResponses(session: NFCVASReaderSession, responses: NSArray<NFCVASResponse> | NFCVASResponse[]): void;
}
declare var NFCVASReaderSessionDelegate: {

	prototype: NFCVASReaderSessionDelegate;
};

/**
 * @since 13.0
 */
declare class NFCVASResponse extends NSObject implements NSCopying {

	static alloc(): NFCVASResponse; // inherited from NSObject

	static new(): NFCVASResponse; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly mobileToken: NSData;

	/**
	 * @since 13.0
	 */
	readonly status: NFCVASErrorCode;

	/**
	 * @since 13.0
	 */
	readonly vasData: NSData;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}
