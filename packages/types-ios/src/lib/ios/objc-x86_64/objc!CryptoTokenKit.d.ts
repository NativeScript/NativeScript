
/**
 * @since 10.0
 */
declare class TKBERTLVRecord extends TKTLVRecord {

	static alloc(): TKBERTLVRecord; // inherited from NSObject

	static dataForTag(tag: number): NSData;

	static new(): TKBERTLVRecord; // inherited from NSObject

	static recordFromData(data: NSData): TKBERTLVRecord; // inherited from TKTLVRecord

	constructor(o: { tag: number; records: NSArray<TKTLVRecord> | TKTLVRecord[]; });

	constructor(o: { tag: number; value: NSData; });

	initWithTagRecords(tag: number, records: NSArray<TKTLVRecord> | TKTLVRecord[]): this;

	initWithTagValue(tag: number, value: NSData): this;
}

/**
 * @since 10.0
 */
declare class TKCompactTLVRecord extends TKTLVRecord {

	static alloc(): TKCompactTLVRecord; // inherited from NSObject

	static new(): TKCompactTLVRecord; // inherited from NSObject

	static recordFromData(data: NSData): TKCompactTLVRecord; // inherited from TKTLVRecord

	constructor(o: { tag: number; value: NSData; });

	initWithTagValue(tag: number, value: NSData): this;
}

declare const enum TKErrorCode {

	CodeNotImplemented = -1,

	CodeCommunicationError = -2,

	CodeCorruptedData = -3,

	CodeCanceledByUser = -4,

	CodeAuthenticationFailed = -5,

	CodeObjectNotFound = -6,

	CodeTokenNotFound = -7,

	CodeBadParameter = -8,

	CodeAuthenticationNeeded = -9,

	AuthenticationFailed = -5,

	ObjectNotFound = -6,

	TokenNotFound = -7
}

/**
 * @since 9.0
 */
declare var TKErrorDomain: string;

/**
 * @since 10.0
 */
declare class TKSimpleTLVRecord extends TKTLVRecord {

	static alloc(): TKSimpleTLVRecord; // inherited from NSObject

	static new(): TKSimpleTLVRecord; // inherited from NSObject

	static recordFromData(data: NSData): TKSimpleTLVRecord; // inherited from TKTLVRecord

	constructor(o: { tag: number; value: NSData; });

	initWithTagValue(tag: number, value: NSData): this;
}

/**
 * @since 9.0
 */
declare class TKSmartCard extends NSObject {

	static alloc(): TKSmartCard; // inherited from NSObject

	static new(): TKSmartCard; // inherited from NSObject

	allowedProtocols: TKSmartCardProtocol;

	/**
	 * @since 9.0
	 */
	cla: number;

	context: any | null;

	readonly currentProtocol: TKSmartCardProtocol;

	sensitive: boolean;

	readonly slot: TKSmartCardSlot;

	/**
	 * @since 10.0
	 */
	useCommandChaining: boolean;

	/**
	 * @since 9.0
	 */
	useExtendedLength: boolean;

	readonly valid: boolean;

	beginSessionWithReply(reply: (p1: boolean, p2: NSError | null) => void): void;

	endSession(): void;

	/**
	 * @since 10.0
	 */
	inSessionWithErrorExecuteBlock(error: interop.Pointer | interop.Reference<NSError | null> | ArrayBufferLike | ArrayBufferView | null, block: (p1: interop.Pointer | interop.Reference<NSError | null> | null) => boolean): boolean;

	/**
	 * @since 9.0
	 */
	sendInsP1P2DataLeReply(ins: number, p1: number, p2: number, requestData: NSData | null, le: number | null, reply: (p1: NSData | null, p2: number, p3: NSError | null) => void): void;

	/**
	 * @since 10.0
	 */
	sendInsP1P2DataLeSwError(ins: number, p1: number, p2: number, requestData: NSData | null, le: number | null, sw: interop.Pointer | interop.Reference<number> | ArrayBufferLike | ArrayBufferView, error?: interop.Reference<NSError>): NSData | null;

	transmitRequestReply(request: NSData, reply: (p1: NSData | null, p2: NSError | null) => void): void;

	/**
	 * @since 9.0
	 */
	userInteractionForSecurePINChangeWithPINFormatAPDUCurrentPINByteOffsetNewPINByteOffset(PINFormat: TKSmartCardPINFormat, APDU: NSData, currentPINByteOffset: number, newPINByteOffset: number): TKSmartCardUserInteractionForSecurePINChange | null;

	/**
	 * @since 9.0
	 */
	userInteractionForSecurePINVerificationWithPINFormatAPDUPINByteOffset(PINFormat: TKSmartCardPINFormat, APDU: NSData, PINByteOffset: number): TKSmartCardUserInteractionForSecurePINVerification | null;
}

/**
 * @since 9.0
 */
declare class TKSmartCardATR extends NSObject {

	static alloc(): TKSmartCardATR; // inherited from NSObject

	static new(): TKSmartCardATR; // inherited from NSObject

	readonly bytes: NSData;

	readonly historicalBytes: NSData;

	/**
	 * @since 10.0
	 */
	readonly historicalRecords: NSArray<TKCompactTLVRecord> | null;

	readonly protocols: NSArray<number>;

	constructor(o: { bytes: NSData; });

	constructor(o: { source: () => number; });

	initWithBytes(bytes: NSData): this;

	initWithSource(source: () => number): this;

	interfaceGroupAtIndex(index: number): TKSmartCardATRInterfaceGroup | null;

	interfaceGroupForProtocol(protocol: TKSmartCardProtocol): TKSmartCardATRInterfaceGroup | null;
}

/**
 * @since 9.0
 */
declare class TKSmartCardATRInterfaceGroup extends NSObject {

	static alloc(): TKSmartCardATRInterfaceGroup; // inherited from NSObject

	static new(): TKSmartCardATRInterfaceGroup; // inherited from NSObject

	readonly TA: number | null;

	readonly TB: number | null;

	readonly TC: number | null;

	readonly protocol: number | null;
}

/**
 * @since 9.0
 */
declare const enum TKSmartCardPINCharset {

	Numeric = 0,

	Alphanumeric = 1,

	UpperAlphanumeric = 2
}

/**
 * @since 9.0
 */
declare const enum TKSmartCardPINCompletion {

	MaxLength = 1,

	Key = 2,

	Timeout = 4
}

/**
 * @since 9.0
 */
declare const enum TKSmartCardPINConfirmation {

	None = 0,

	New = 1,

	Current = 2
}

/**
 * @since 9.0
 */
declare const enum TKSmartCardPINEncoding {

	Binary = 0,

	ASCII = 1,

	BCD = 2
}

/**
 * @since 9.0
 */
declare class TKSmartCardPINFormat extends NSObject {

	static alloc(): TKSmartCardPINFormat; // inherited from NSObject

	static new(): TKSmartCardPINFormat; // inherited from NSObject

	PINBitOffset: number;

	PINBlockByteLength: number;

	PINJustification: TKSmartCardPINJustification;

	PINLengthBitOffset: number;

	PINLengthBitSize: number;

	charset: TKSmartCardPINCharset;

	encoding: TKSmartCardPINEncoding;

	maxPINLength: number;

	minPINLength: number;
}

/**
 * @since 9.0
 */
declare const enum TKSmartCardPINJustification {

	Left = 0,

	Right = 1
}

/**
 * @since 9.0
 */
declare const enum TKSmartCardProtocol {

	None = 0,

	T0 = 1,

	T1 = 2,

	T15 = 32768,

	Any = 65535
}

/**
 * @since 9.0
 */
declare class TKSmartCardSlot extends NSObject {

	static alloc(): TKSmartCardSlot; // inherited from NSObject

	static new(): TKSmartCardSlot; // inherited from NSObject

	readonly ATR: TKSmartCardATR | null;

	readonly maxInputLength: number;

	readonly maxOutputLength: number;

	readonly name: string;

	readonly state: TKSmartCardSlotState;

	makeSmartCard(): TKSmartCard | null;
}

/**
 * @since 9.0
 */
declare class TKSmartCardSlotManager extends NSObject {

	static alloc(): TKSmartCardSlotManager; // inherited from NSObject

	static new(): TKSmartCardSlotManager; // inherited from NSObject

	readonly slotNames: NSArray<string>;

	static readonly defaultManager: TKSmartCardSlotManager | null;

	/**
	 * @since 26.0
	 */
	createNFCSlotWithMessageCompletion(message: string | null, completion: (p1: TKSmartCardSlotNFCSession | null, p2: NSError | null) => void): void;

	getSlotWithNameReply(name: string, reply: (p1: TKSmartCardSlot | null) => void): void;

	/**
	 * @since 26.0
	 */
	isNFCSupported(): boolean;

	/**
	 * @since 9.0
	 */
	slotNamed(name: string): TKSmartCardSlot | null;
}

/**
 * @since 26.0
 */
declare class TKSmartCardSlotNFCSession extends NSObject {

	static alloc(): TKSmartCardSlotNFCSession; // inherited from NSObject

	static new(): TKSmartCardSlotNFCSession; // inherited from NSObject

	readonly slotName: string | null;

	endSession(): void;

	updateWithMessageError(message: string, error?: interop.Reference<NSError>): boolean;
}

/**
 * @since 9.0
 */
declare const enum TKSmartCardSlotState {

	Missing = 0,

	Empty = 1,

	Probing = 2,

	MuteCard = 3,

	ValidCard = 4
}

/**
 * @since 10.0
 */
declare class TKSmartCardToken extends TKToken {

	static alloc(): TKSmartCardToken; // inherited from NSObject

	static new(): TKSmartCardToken; // inherited from NSObject

	readonly AID: NSData | null;

	constructor(o: { smartCard: TKSmartCard; AID: NSData | null; instanceID: string; tokenDriver: TKSmartCardTokenDriver; });

	initWithSmartCardAIDInstanceIDTokenDriver(smartCard: TKSmartCard, AID: NSData | null, instanceID: string, tokenDriver: TKSmartCardTokenDriver): this;
}

/**
 * @since 10.0
 */
declare class TKSmartCardTokenDriver extends TKTokenDriver {

	static alloc(): TKSmartCardTokenDriver; // inherited from NSObject

	static new(): TKSmartCardTokenDriver; // inherited from NSObject
}

interface TKSmartCardTokenDriverDelegate extends TKTokenDriverDelegate {

	tokenDriverCreateTokenForSmartCardAIDError(driver: TKSmartCardTokenDriver, smartCard: TKSmartCard, AID: NSData | null, error?: interop.Reference<NSError>): TKSmartCardToken | null;
}
declare var TKSmartCardTokenDriverDelegate: {

	prototype: TKSmartCardTokenDriverDelegate;
};

/**
 * @since 26.0
 */
declare class TKSmartCardTokenRegistrationManager extends NSObject {

	static alloc(): TKSmartCardTokenRegistrationManager; // inherited from NSObject

	static new(): TKSmartCardTokenRegistrationManager; // inherited from NSObject

	readonly registeredSmartCardTokens: NSArray<string>;

	static readonly defaultManager: TKSmartCardTokenRegistrationManager;

	registerSmartCardWithTokenIDPromptMessageError(tokenID: string, promptMessage: string, error?: interop.Reference<NSError>): boolean;

	unregisterSmartCardWithTokenIDError(tokenID: string, error?: interop.Reference<NSError>): boolean;
}

/**
 * @since 10.0
 */
declare class TKSmartCardTokenSession extends TKTokenSession {

	static alloc(): TKSmartCardTokenSession; // inherited from NSObject

	static new(): TKSmartCardTokenSession; // inherited from NSObject

	/**
	 * @since 10.0
	 * @deprecated 26.0
	 */
	readonly smartCard: TKSmartCard;

	/**
	 * @since 26.0
	 */
	getSmartCardWithError(error?: interop.Reference<NSError>): TKSmartCard | null;
}

/**
 * @since 9.0
 */
declare class TKSmartCardUserInteraction extends NSObject {

	static alloc(): TKSmartCardUserInteraction; // inherited from NSObject

	static new(): TKSmartCardUserInteraction; // inherited from NSObject

	delegate: TKSmartCardUserInteractionDelegate | null;

	initialTimeout: number;

	interactionTimeout: number;

	cancel(): boolean;

	runWithReply(reply: (p1: boolean, p2: NSError | null) => void): void;
}

/**
 * @since 9.0
 */
interface TKSmartCardUserInteractionDelegate {

	characterEnteredInUserInteraction?(interaction: TKSmartCardUserInteraction): void;

	correctionKeyPressedInUserInteraction?(interaction: TKSmartCardUserInteraction): void;

	invalidCharacterEnteredInUserInteraction?(interaction: TKSmartCardUserInteraction): void;

	newPINConfirmationRequestedInUserInteraction?(interaction: TKSmartCardUserInteraction): void;

	newPINRequestedInUserInteraction?(interaction: TKSmartCardUserInteraction): void;

	oldPINRequestedInUserInteraction?(interaction: TKSmartCardUserInteraction): void;

	validationKeyPressedInUserInteraction?(interaction: TKSmartCardUserInteraction): void;
}
declare var TKSmartCardUserInteractionDelegate: {

	prototype: TKSmartCardUserInteractionDelegate;
};

/**
 * @since 9.0
 */
declare class TKSmartCardUserInteractionForPINOperation extends TKSmartCardUserInteraction {

	static alloc(): TKSmartCardUserInteractionForPINOperation; // inherited from NSObject

	static new(): TKSmartCardUserInteractionForPINOperation; // inherited from NSObject

	PINCompletion: TKSmartCardPINCompletion;

	PINMessageIndices: NSArray<number> | null;

	locale: NSLocale;

	resultData: NSData | null;

	resultSW: number;
}

/**
 * @since 9.0
 */
declare class TKSmartCardUserInteractionForSecurePINChange extends TKSmartCardUserInteractionForPINOperation {

	static alloc(): TKSmartCardUserInteractionForSecurePINChange; // inherited from NSObject

	static new(): TKSmartCardUserInteractionForSecurePINChange; // inherited from NSObject

	PINConfirmation: TKSmartCardPINConfirmation;
}

/**
 * @since 9.0
 */
declare class TKSmartCardUserInteractionForSecurePINVerification extends TKSmartCardUserInteractionForPINOperation {

	static alloc(): TKSmartCardUserInteractionForSecurePINVerification; // inherited from NSObject

	static new(): TKSmartCardUserInteractionForSecurePINVerification; // inherited from NSObject
}

/**
 * @since 10.0
 */
declare class TKTLVRecord extends NSObject {

	static alloc(): TKTLVRecord; // inherited from NSObject

	static new(): TKTLVRecord; // inherited from NSObject

	static recordFromData(data: NSData): TKTLVRecord;

	static sequenceOfRecordsFromData(data: NSData): NSArray<TKTLVRecord> | null;

	readonly data: NSData;

	readonly tag: number;

	readonly value: NSData;
}

/**
 * @since 10.0
 */
declare class TKToken extends NSObject {

	static alloc(): TKToken; // inherited from NSObject

	static new(): TKToken; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly configuration: TKTokenConfiguration;

	delegate: TKTokenDelegate | null;

	readonly keychainContents: TKTokenKeychainContents | null;

	readonly tokenDriver: TKTokenDriver;

	constructor(o: { tokenDriver: TKTokenDriver; instanceID: string; });

	initWithTokenDriverInstanceID(tokenDriver: TKTokenDriver, instanceID: string): this;
}

/**
 * @since 10.0
 */
declare class TKTokenAuthOperation extends NSObject implements NSSecureCoding {

	static alloc(): TKTokenAuthOperation; // inherited from NSObject

	static new(): TKTokenAuthOperation; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	finishWithError(error?: interop.Reference<NSError>): boolean;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare class TKTokenConfiguration extends NSObject {

	static alloc(): TKTokenConfiguration; // inherited from NSObject

	static new(): TKTokenConfiguration; // inherited from NSObject

	configurationData: NSData | null;

	readonly instanceID: string;

	keychainItems: NSArray<TKTokenKeychainItem>;

	certificateForObjectIDError(objectID: any, error?: interop.Reference<NSError>): TKTokenKeychainCertificate | null;

	keyForObjectIDError(objectID: any, error?: interop.Reference<NSError>): TKTokenKeychainKey | null;
}

/**
 * @since 10.0
 */
interface TKTokenDelegate extends NSObjectProtocol {

	tokenCreateSessionWithError(token: TKToken, error?: interop.Reference<NSError>): TKTokenSession | null;

	tokenTerminateSession?(token: TKToken, session: TKTokenSession): void;
}
declare var TKTokenDelegate: {

	prototype: TKTokenDelegate;
};

/**
 * @since 10.0
 */
declare class TKTokenDriver extends NSObject {

	static alloc(): TKTokenDriver; // inherited from NSObject

	static new(): TKTokenDriver; // inherited from NSObject

	delegate: TKTokenDriverDelegate | null;
}

/**
 * @since 14.0
 */
declare class TKTokenDriverConfiguration extends NSObject {

	static alloc(): TKTokenDriverConfiguration; // inherited from NSObject

	static new(): TKTokenDriverConfiguration; // inherited from NSObject

	readonly classID: string;

	readonly tokenConfigurations: NSDictionary<string, TKTokenConfiguration>;

	static readonly driverConfigurations: NSDictionary<string, TKTokenDriverConfiguration>;

	addTokenConfigurationForTokenInstanceID(instanceID: string): TKTokenConfiguration;

	removeTokenConfigurationForTokenInstanceID(instanceID: string): void;
}

/**
 * @since 10.0
 */
interface TKTokenDriverDelegate extends NSObjectProtocol {

	tokenDriverTerminateToken?(driver: TKTokenDriver, token: TKToken): void;

	/**
	 * @since 14.0
	 */
	tokenDriverTokenForConfigurationError?(driver: TKTokenDriver, configuration: TKTokenConfiguration, error?: interop.Reference<NSError>): TKToken | null;
}
declare var TKTokenDriverDelegate: {

	prototype: TKTokenDriverDelegate;
};

/**
 * @since 10.0
 */
declare class TKTokenKeyAlgorithm extends NSObject {

	static alloc(): TKTokenKeyAlgorithm; // inherited from NSObject

	static new(): TKTokenKeyAlgorithm; // inherited from NSObject

	isAlgorithm(algorithm: string): boolean;

	supportsAlgorithm(algorithm: string): boolean;
}

/**
 * @since 10.0
 */
declare class TKTokenKeyExchangeParameters extends NSObject {

	static alloc(): TKTokenKeyExchangeParameters; // inherited from NSObject

	static new(): TKTokenKeyExchangeParameters; // inherited from NSObject

	readonly requestedSize: number;

	readonly sharedInfo: NSData | null;
}

/**
 * @since 10.0
 */
declare class TKTokenKeychainCertificate extends TKTokenKeychainItem {

	static alloc(): TKTokenKeychainCertificate; // inherited from NSObject

	static new(): TKTokenKeychainCertificate; // inherited from NSObject

	readonly data: NSData;

	constructor(o: { certificate: any; objectID: any; });

	initWithCertificateObjectID(certificateRef: any, objectID: any): this;
}

/**
 * @since 10.0
 */
declare class TKTokenKeychainContents extends NSObject {

	static alloc(): TKTokenKeychainContents; // inherited from NSObject

	static new(): TKTokenKeychainContents; // inherited from NSObject

	readonly items: NSArray<TKTokenKeychainItem>;

	certificateForObjectIDError(objectID: any, error?: interop.Reference<NSError>): TKTokenKeychainCertificate | null;

	fillWithItems(items: NSArray<TKTokenKeychainItem> | TKTokenKeychainItem[]): void;

	keyForObjectIDError(objectID: any, error?: interop.Reference<NSError>): TKTokenKeychainKey | null;
}

/**
 * @since 10.0
 */
declare class TKTokenKeychainItem extends NSObject {

	static alloc(): TKTokenKeychainItem; // inherited from NSObject

	static new(): TKTokenKeychainItem; // inherited from NSObject

	constraints: NSDictionary<number, any> | null;

	label: string | null;

	readonly objectID: any;

	constructor(o: { objectID: any; });

	initWithObjectID(objectID: any): this;
}

/**
 * @since 10.0
 */
declare class TKTokenKeychainKey extends TKTokenKeychainItem {

	static alloc(): TKTokenKeychainKey; // inherited from NSObject

	static new(): TKTokenKeychainKey; // inherited from NSObject

	applicationTag: NSData | null;

	canDecrypt: boolean;

	canPerformKeyExchange: boolean;

	canSign: boolean;

	keySizeInBits: number;

	keyType: string;

	publicKeyData: NSData | null;

	publicKeyHash: NSData | null;

	suitableForLogin: boolean;

	constructor(o: { certificate: any | null; objectID: any; });

	initWithCertificateObjectID(certificateRef: any | null, objectID: any): this;
}

/**
 * @since 10.0
 */
declare const enum TKTokenOperation {

	None = 0,

	ReadData = 1,

	SignData = 2,

	DecryptData = 3,

	PerformKeyExchange = 4
}

/**
 * @since 10.0
 */
declare class TKTokenPasswordAuthOperation extends TKTokenAuthOperation {

	static alloc(): TKTokenPasswordAuthOperation; // inherited from NSObject

	static new(): TKTokenPasswordAuthOperation; // inherited from NSObject

	password: string | null;
}

/**
 * @since 10.0
 */
declare class TKTokenSession extends NSObject {

	static alloc(): TKTokenSession; // inherited from NSObject

	static new(): TKTokenSession; // inherited from NSObject

	delegate: TKTokenSessionDelegate | null;

	readonly token: TKToken;

	constructor(o: { token: TKToken; });

	initWithToken(token: TKToken): this;
}

/**
 * @since 10.0
 */
interface TKTokenSessionDelegate extends NSObjectProtocol {

	tokenSessionBeginAuthForOperationConstraintError?(session: TKTokenSession, operation: TKTokenOperation, constraint: any, error?: interop.Reference<NSError>): TKTokenAuthOperation | null;

	tokenSessionDecryptDataUsingKeyAlgorithmError?(session: TKTokenSession, ciphertext: NSData, keyObjectID: any, algorithm: TKTokenKeyAlgorithm, error?: interop.Reference<NSError>): NSData | null;

	tokenSessionPerformKeyExchangeWithPublicKeyUsingKeyAlgorithmParametersError?(session: TKTokenSession, otherPartyPublicKeyData: NSData, objectID: any, algorithm: TKTokenKeyAlgorithm, parameters: TKTokenKeyExchangeParameters, error?: interop.Reference<NSError>): NSData | null;

	tokenSessionSignDataUsingKeyAlgorithmError?(session: TKTokenSession, dataToSign: NSData, keyObjectID: any, algorithm: TKTokenKeyAlgorithm, error?: interop.Reference<NSError>): NSData | null;

	tokenSessionSupportsOperationUsingKeyAlgorithm?(session: TKTokenSession, operation: TKTokenOperation, keyObjectID: any, algorithm: TKTokenKeyAlgorithm): boolean;
}
declare var TKTokenSessionDelegate: {

	prototype: TKTokenSessionDelegate;
};

/**
 * @since 10.0
 */
declare class TKTokenSmartCardPINAuthOperation extends TKTokenAuthOperation {

	static alloc(): TKTokenSmartCardPINAuthOperation; // inherited from NSObject

	static new(): TKTokenSmartCardPINAuthOperation; // inherited from NSObject

	APDUTemplate: NSData | null;

	PIN: string | null;

	PINByteOffset: number;

	PINFormat: TKSmartCardPINFormat;

	smartCard: TKSmartCard | null;
}

/**
 * @since 10.0
 */
declare class TKTokenWatcher extends NSObject {

	static alloc(): TKTokenWatcher; // inherited from NSObject

	static new(): TKTokenWatcher; // inherited from NSObject

	readonly tokenIDs: NSArray<string>;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	constructor(o: { insertionHandler: (p1: string) => void; });

	addRemovalHandlerForTokenID(removalHandler: (p1: string) => void, tokenID: string): void;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	initWithInsertionHandler(insertionHandler: (p1: string) => void): this;

	/**
	 * @since 11.0
	 */
	setInsertionHandler(insertionHandler: (p1: string) => void): void;

	/**
	 * @since 15.0
	 */
	tokenInfoForTokenID(tokenID: string): TKTokenWatcherTokenInfo | null;
}

/**
 * @since 15.0
 */
declare class TKTokenWatcherTokenInfo extends NSObject {

	static alloc(): TKTokenWatcherTokenInfo; // inherited from NSObject

	static new(): TKTokenWatcherTokenInfo; // inherited from NSObject

	readonly driverName: string | null;

	readonly slotName: string | null;

	readonly tokenID: string;
}
