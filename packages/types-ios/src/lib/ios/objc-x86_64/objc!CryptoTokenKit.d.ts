
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

declare var TKErrorDomain: string;

declare class TKSimpleTLVRecord extends TKTLVRecord {

	static alloc(): TKSimpleTLVRecord; // inherited from NSObject

	static new(): TKSimpleTLVRecord; // inherited from NSObject

	static recordFromData(data: NSData): TKSimpleTLVRecord; // inherited from TKTLVRecord

	constructor(o: { tag: number; value: NSData; });

	initWithTagValue(tag: number, value: NSData): this;
}

declare class TKSmartCard extends NSObject {

	static alloc(): TKSmartCard; // inherited from NSObject

	static new(): TKSmartCard; // inherited from NSObject

	allowedProtocols: TKSmartCardProtocol;

	cla: number;

	context: any;

	readonly currentProtocol: TKSmartCardProtocol;

	sensitive: boolean;

	readonly slot: TKSmartCardSlot;

	useCommandChaining: boolean;

	useExtendedLength: boolean;

	readonly valid: boolean;

	beginSessionWithReply(reply: (p1: boolean, p2: NSError) => void): void;

	endSession(): void;

	inSessionWithErrorExecuteBlock(error: interop.Pointer | interop.Reference<NSError>, block: (p1: interop.Pointer | interop.Reference<NSError>) => boolean): boolean;

	sendInsP1P2DataLeReply(ins: number, p1: number, p2: number, requestData: NSData, le: number, reply: (p1: NSData, p2: number, p3: NSError) => void): void;

	sendInsP1P2DataLeSwError(ins: number, p1: number, p2: number, requestData: NSData, le: number, sw: interop.Pointer | interop.Reference<number>): NSData;

	transmitRequestReply(request: NSData, reply: (p1: NSData, p2: NSError) => void): void;

	userInteractionForSecurePINChangeWithPINFormatAPDUCurrentPINByteOffsetNewPINByteOffset(PINFormat: TKSmartCardPINFormat, APDU: NSData, currentPINByteOffset: number, newPINByteOffset: number): TKSmartCardUserInteractionForSecurePINChange;

	userInteractionForSecurePINVerificationWithPINFormatAPDUPINByteOffset(PINFormat: TKSmartCardPINFormat, APDU: NSData, PINByteOffset: number): TKSmartCardUserInteractionForSecurePINVerification;
}

declare class TKSmartCardATR extends NSObject {

	static alloc(): TKSmartCardATR; // inherited from NSObject

	static new(): TKSmartCardATR; // inherited from NSObject

	readonly bytes: NSData;

	readonly historicalBytes: NSData;

	readonly historicalRecords: NSArray<TKCompactTLVRecord>;

	readonly protocols: NSArray<number>;

	constructor(o: { bytes: NSData; });

	constructor(o: { source: () => number; });

	initWithBytes(bytes: NSData): this;

	initWithSource(source: () => number): this;

	interfaceGroupAtIndex(index: number): TKSmartCardATRInterfaceGroup;

	interfaceGroupForProtocol(protocol: TKSmartCardProtocol): TKSmartCardATRInterfaceGroup;
}

declare class TKSmartCardATRInterfaceGroup extends NSObject {

	static alloc(): TKSmartCardATRInterfaceGroup; // inherited from NSObject

	static new(): TKSmartCardATRInterfaceGroup; // inherited from NSObject

	readonly TA: number;

	readonly TB: number;

	readonly TC: number;

	readonly protocol: number;
}

declare const enum TKSmartCardPINCharset {

	Numeric = 0,

	Alphanumeric = 1,

	UpperAlphanumeric = 2
}

declare const enum TKSmartCardPINCompletion {

	MaxLength = 1,

	Key = 2,

	Timeout = 4
}

declare const enum TKSmartCardPINConfirmation {

	None = 0,

	New = 1,

	Current = 2
}

declare const enum TKSmartCardPINEncoding {

	Binary = 0,

	ASCII = 1,

	BCD = 2
}

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

declare const enum TKSmartCardPINJustification {

	Left = 0,

	Right = 1
}

declare const enum TKSmartCardProtocol {

	None = 0,

	T0 = 1,

	T1 = 2,

	T15 = 32768,

	Any = 65535
}

declare class TKSmartCardSlot extends NSObject {

	static alloc(): TKSmartCardSlot; // inherited from NSObject

	static new(): TKSmartCardSlot; // inherited from NSObject

	readonly ATR: TKSmartCardATR;

	readonly maxInputLength: number;

	readonly maxOutputLength: number;

	readonly name: string;

	readonly state: TKSmartCardSlotState;

	makeSmartCard(): TKSmartCard;
}

declare class TKSmartCardSlotManager extends NSObject {

	static alloc(): TKSmartCardSlotManager; // inherited from NSObject

	static new(): TKSmartCardSlotManager; // inherited from NSObject

	readonly slotNames: NSArray<string>;

	static readonly defaultManager: TKSmartCardSlotManager;

	getSlotWithNameReply(name: string, reply: (p1: TKSmartCardSlot) => void): void;

	slotNamed(name: string): TKSmartCardSlot;
}

declare const enum TKSmartCardSlotState {

	Missing = 0,

	Empty = 1,

	Probing = 2,

	MuteCard = 3,

	ValidCard = 4
}

declare class TKSmartCardToken extends TKToken {

	static alloc(): TKSmartCardToken; // inherited from NSObject

	static new(): TKSmartCardToken; // inherited from NSObject

	readonly AID: NSData;

	constructor(o: { smartCard: TKSmartCard; AID: NSData; instanceID: string; tokenDriver: TKSmartCardTokenDriver; });

	initWithSmartCardAIDInstanceIDTokenDriver(smartCard: TKSmartCard, AID: NSData, instanceID: string, tokenDriver: TKSmartCardTokenDriver): this;
}

declare class TKSmartCardTokenDriver extends TKTokenDriver {

	static alloc(): TKSmartCardTokenDriver; // inherited from NSObject

	static new(): TKSmartCardTokenDriver; // inherited from NSObject
}

interface TKSmartCardTokenDriverDelegate extends TKTokenDriverDelegate {

	tokenDriverCreateTokenForSmartCardAIDError(driver: TKSmartCardTokenDriver, smartCard: TKSmartCard, AID: NSData): TKSmartCardToken;
}
declare var TKSmartCardTokenDriverDelegate: {

	prototype: TKSmartCardTokenDriverDelegate;
};

declare class TKSmartCardTokenSession extends TKTokenSession {

	static alloc(): TKSmartCardTokenSession; // inherited from NSObject

	static new(): TKSmartCardTokenSession; // inherited from NSObject

	readonly smartCard: TKSmartCard;
}

declare class TKSmartCardUserInteraction extends NSObject {

	static alloc(): TKSmartCardUserInteraction; // inherited from NSObject

	static new(): TKSmartCardUserInteraction; // inherited from NSObject

	delegate: TKSmartCardUserInteractionDelegate;

	initialTimeout: number;

	interactionTimeout: number;

	cancel(): boolean;

	runWithReply(reply: (p1: boolean, p2: NSError) => void): void;
}

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

declare class TKSmartCardUserInteractionForPINOperation extends TKSmartCardUserInteraction {

	static alloc(): TKSmartCardUserInteractionForPINOperation; // inherited from NSObject

	static new(): TKSmartCardUserInteractionForPINOperation; // inherited from NSObject

	PINCompletion: TKSmartCardPINCompletion;

	PINMessageIndices: NSArray<number>;

	locale: NSLocale;

	resultData: NSData;

	resultSW: number;
}

declare class TKSmartCardUserInteractionForSecurePINChange extends TKSmartCardUserInteractionForPINOperation {

	static alloc(): TKSmartCardUserInteractionForSecurePINChange; // inherited from NSObject

	static new(): TKSmartCardUserInteractionForSecurePINChange; // inherited from NSObject

	PINConfirmation: TKSmartCardPINConfirmation;
}

declare class TKSmartCardUserInteractionForSecurePINVerification extends TKSmartCardUserInteractionForPINOperation {

	static alloc(): TKSmartCardUserInteractionForSecurePINVerification; // inherited from NSObject

	static new(): TKSmartCardUserInteractionForSecurePINVerification; // inherited from NSObject
}

declare class TKTLVRecord extends NSObject {

	static alloc(): TKTLVRecord; // inherited from NSObject

	static new(): TKTLVRecord; // inherited from NSObject

	static recordFromData(data: NSData): TKTLVRecord;

	static sequenceOfRecordsFromData(data: NSData): NSArray<TKTLVRecord>;

	readonly data: NSData;

	readonly tag: number;

	readonly value: NSData;
}

declare class TKToken extends NSObject {

	static alloc(): TKToken; // inherited from NSObject

	static new(): TKToken; // inherited from NSObject

	readonly configuration: TKTokenConfiguration;

	delegate: TKTokenDelegate;

	readonly keychainContents: TKTokenKeychainContents;

	readonly tokenDriver: TKTokenDriver;

	constructor(o: { tokenDriver: TKTokenDriver; instanceID: string; });

	initWithTokenDriverInstanceID(tokenDriver: TKTokenDriver, instanceID: string): this;
}

declare class TKTokenAuthOperation extends NSObject implements NSSecureCoding {

	static alloc(): TKTokenAuthOperation; // inherited from NSObject

	static new(): TKTokenAuthOperation; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	finishWithError(): boolean;

	initWithCoder(coder: NSCoder): this;
}

declare class TKTokenConfiguration extends NSObject {

	static alloc(): TKTokenConfiguration; // inherited from NSObject

	static new(): TKTokenConfiguration; // inherited from NSObject

	configurationData: NSData;

	readonly instanceID: string;

	keychainItems: NSArray<TKTokenKeychainItem>;

	certificateForObjectIDError(objectID: any): TKTokenKeychainCertificate;

	keyForObjectIDError(objectID: any): TKTokenKeychainKey;
}

interface TKTokenDelegate extends NSObjectProtocol {

	tokenCreateSessionWithError(token: TKToken): TKTokenSession;

	tokenTerminateSession?(token: TKToken, session: TKTokenSession): void;
}
declare var TKTokenDelegate: {

	prototype: TKTokenDelegate;
};

declare class TKTokenDriver extends NSObject {

	static alloc(): TKTokenDriver; // inherited from NSObject

	static new(): TKTokenDriver; // inherited from NSObject

	delegate: TKTokenDriverDelegate;
}

declare class TKTokenDriverConfiguration extends NSObject {

	static alloc(): TKTokenDriverConfiguration; // inherited from NSObject

	static new(): TKTokenDriverConfiguration; // inherited from NSObject

	readonly classID: string;

	readonly tokenConfigurations: NSDictionary<string, TKTokenConfiguration>;

	static readonly driverConfigurations: NSDictionary<string, TKTokenDriverConfiguration>;

	addTokenConfigurationForTokenInstanceID(instanceID: string): TKTokenConfiguration;

	removeTokenConfigurationForTokenInstanceID(instanceID: string): void;
}

interface TKTokenDriverDelegate extends NSObjectProtocol {

	tokenDriverTerminateToken?(driver: TKTokenDriver, token: TKToken): void;

	tokenDriverTokenForConfigurationError?(driver: TKTokenDriver, configuration: TKTokenConfiguration): TKToken;
}
declare var TKTokenDriverDelegate: {

	prototype: TKTokenDriverDelegate;
};

declare class TKTokenKeyAlgorithm extends NSObject {

	static alloc(): TKTokenKeyAlgorithm; // inherited from NSObject

	static new(): TKTokenKeyAlgorithm; // inherited from NSObject

	isAlgorithm(algorithm: any): boolean;

	supportsAlgorithm(algorithm: any): boolean;
}

declare class TKTokenKeyExchangeParameters extends NSObject {

	static alloc(): TKTokenKeyExchangeParameters; // inherited from NSObject

	static new(): TKTokenKeyExchangeParameters; // inherited from NSObject

	readonly requestedSize: number;

	readonly sharedInfo: NSData;
}

declare class TKTokenKeychainCertificate extends TKTokenKeychainItem {

	static alloc(): TKTokenKeychainCertificate; // inherited from NSObject

	static new(): TKTokenKeychainCertificate; // inherited from NSObject

	readonly data: NSData;

	constructor(o: { certificate: any; objectID: any; });

	initWithCertificateObjectID(certificateRef: any, objectID: any): this;
}

declare class TKTokenKeychainContents extends NSObject {

	static alloc(): TKTokenKeychainContents; // inherited from NSObject

	static new(): TKTokenKeychainContents; // inherited from NSObject

	readonly items: NSArray<TKTokenKeychainItem>;

	certificateForObjectIDError(objectID: any): TKTokenKeychainCertificate;

	fillWithItems(items: NSArray<TKTokenKeychainItem> | TKTokenKeychainItem[]): void;

	keyForObjectIDError(objectID: any): TKTokenKeychainKey;
}

declare class TKTokenKeychainItem extends NSObject {

	static alloc(): TKTokenKeychainItem; // inherited from NSObject

	static new(): TKTokenKeychainItem; // inherited from NSObject

	constraints: NSDictionary<number, any>;

	label: string;

	readonly objectID: any;

	constructor(o: { objectID: any; });

	initWithObjectID(objectID: any): this;
}

declare class TKTokenKeychainKey extends TKTokenKeychainItem {

	static alloc(): TKTokenKeychainKey; // inherited from NSObject

	static new(): TKTokenKeychainKey; // inherited from NSObject

	applicationTag: NSData;

	canDecrypt: boolean;

	canPerformKeyExchange: boolean;

	canSign: boolean;

	keySizeInBits: number;

	keyType: string;

	publicKeyData: NSData;

	publicKeyHash: NSData;

	suitableForLogin: boolean;

	constructor(o: { certificate: any; objectID: any; });

	initWithCertificateObjectID(certificateRef: any, objectID: any): this;
}

declare const enum TKTokenOperation {

	None = 0,

	ReadData = 1,

	SignData = 2,

	DecryptData = 3,

	PerformKeyExchange = 4
}

declare class TKTokenPasswordAuthOperation extends TKTokenAuthOperation {

	static alloc(): TKTokenPasswordAuthOperation; // inherited from NSObject

	static new(): TKTokenPasswordAuthOperation; // inherited from NSObject

	password: string;
}

declare class TKTokenSession extends NSObject {

	static alloc(): TKTokenSession; // inherited from NSObject

	static new(): TKTokenSession; // inherited from NSObject

	delegate: TKTokenSessionDelegate;

	readonly token: TKToken;

	constructor(o: { token: TKToken; });

	initWithToken(token: TKToken): this;
}

interface TKTokenSessionDelegate extends NSObjectProtocol {

	tokenSessionBeginAuthForOperationConstraintError?(session: TKTokenSession, operation: TKTokenOperation, constraint: any): TKTokenAuthOperation;

	tokenSessionDecryptDataUsingKeyAlgorithmError?(session: TKTokenSession, ciphertext: NSData, keyObjectID: any, algorithm: TKTokenKeyAlgorithm): NSData;

	tokenSessionPerformKeyExchangeWithPublicKeyUsingKeyAlgorithmParametersError?(session: TKTokenSession, otherPartyPublicKeyData: NSData, objectID: any, algorithm: TKTokenKeyAlgorithm, parameters: TKTokenKeyExchangeParameters): NSData;

	tokenSessionSignDataUsingKeyAlgorithmError?(session: TKTokenSession, dataToSign: NSData, keyObjectID: any, algorithm: TKTokenKeyAlgorithm): NSData;

	tokenSessionSupportsOperationUsingKeyAlgorithm?(session: TKTokenSession, operation: TKTokenOperation, keyObjectID: any, algorithm: TKTokenKeyAlgorithm): boolean;
}
declare var TKTokenSessionDelegate: {

	prototype: TKTokenSessionDelegate;
};

declare class TKTokenSmartCardPINAuthOperation extends TKTokenAuthOperation {

	static alloc(): TKTokenSmartCardPINAuthOperation; // inherited from NSObject

	static new(): TKTokenSmartCardPINAuthOperation; // inherited from NSObject

	APDUTemplate: NSData;

	PIN: string;

	PINByteOffset: number;

	PINFormat: TKSmartCardPINFormat;

	smartCard: TKSmartCard;
}

declare class TKTokenWatcher extends NSObject {

	static alloc(): TKTokenWatcher; // inherited from NSObject

	static new(): TKTokenWatcher; // inherited from NSObject

	readonly tokenIDs: NSArray<string>;

	constructor(o: { insertionHandler: (p1: string) => void; });

	addRemovalHandlerForTokenID(removalHandler: (p1: string) => void, tokenID: string): void;

	initWithInsertionHandler(insertionHandler: (p1: string) => void): this;

	setInsertionHandler(insertionHandler: (p1: string) => void): void;
}
