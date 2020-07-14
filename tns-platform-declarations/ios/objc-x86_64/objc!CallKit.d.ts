
declare class CXAction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CXAction; // inherited from NSObject

	static new(): CXAction; // inherited from NSObject

	readonly UUID: NSUUID;

	readonly complete: boolean;

	readonly timeoutDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	fail(): void;

	fulfill(): void;

	initWithCoder(coder: NSCoder): this;
}

declare class CXAnswerCallAction extends CXCallAction {

	static alloc(): CXAnswerCallAction; // inherited from NSObject

	static new(): CXAnswerCallAction; // inherited from NSObject

	fulfillWithDateConnected(dateConnected: Date): void;
}

declare class CXCall extends NSObject {

	static alloc(): CXCall; // inherited from NSObject

	static new(): CXCall; // inherited from NSObject

	readonly UUID: NSUUID;

	readonly hasConnected: boolean;

	readonly hasEnded: boolean;

	readonly onHold: boolean;

	readonly outgoing: boolean;

	isEqualToCall(call: CXCall): boolean;
}

declare class CXCallAction extends CXAction {

	static alloc(): CXCallAction; // inherited from NSObject

	static new(): CXCallAction; // inherited from NSObject

	readonly callUUID: NSUUID;

	constructor(o: { callUUID: NSUUID; });

	initWithCallUUID(callUUID: NSUUID): this;
}

declare class CXCallController extends NSObject {

	static alloc(): CXCallController; // inherited from NSObject

	static new(): CXCallController; // inherited from NSObject

	readonly callObserver: CXCallObserver;

	constructor(o: { queue: NSObject; });

	initWithQueue(queue: NSObject): this;

	requestTransactionCompletion(transaction: CXTransaction, completion: (p1: NSError) => void): void;

	requestTransactionWithActionCompletion(action: CXAction, completion: (p1: NSError) => void): void;

	requestTransactionWithActionsCompletion(actions: NSArray<CXAction> | CXAction[], completion: (p1: NSError) => void): void;
}

declare const enum CXCallDirectoryEnabledStatus {

	Unknown = 0,

	Disabled = 1,

	Enabled = 2
}

declare class CXCallDirectoryExtensionContext extends NSExtensionContext {

	static alloc(): CXCallDirectoryExtensionContext; // inherited from NSObject

	static new(): CXCallDirectoryExtensionContext; // inherited from NSObject

	delegate: CXCallDirectoryExtensionContextDelegate;

	readonly incremental: boolean;

	addBlockingEntryWithNextSequentialPhoneNumber(phoneNumber: number): void;

	addIdentificationEntryWithNextSequentialPhoneNumberLabel(phoneNumber: number, label: string): void;

	completeRequestWithCompletionHandler(completion: (p1: boolean) => void): void;

	removeAllBlockingEntries(): void;

	removeAllIdentificationEntries(): void;

	removeBlockingEntryWithPhoneNumber(phoneNumber: number): void;

	removeIdentificationEntryWithPhoneNumber(phoneNumber: number): void;
}

interface CXCallDirectoryExtensionContextDelegate extends NSObjectProtocol {

	requestFailedForExtensionContextWithError(extensionContext: CXCallDirectoryExtensionContext, error: NSError): void;
}
declare var CXCallDirectoryExtensionContextDelegate: {

	prototype: CXCallDirectoryExtensionContextDelegate;
};

declare class CXCallDirectoryManager extends NSObject {

	static alloc(): CXCallDirectoryManager; // inherited from NSObject

	static new(): CXCallDirectoryManager; // inherited from NSObject

	static readonly sharedInstance: CXCallDirectoryManager;

	getEnabledStatusForExtensionWithIdentifierCompletionHandler(identifier: string, completion: (p1: CXCallDirectoryEnabledStatus, p2: NSError) => void): void;

	reloadExtensionWithIdentifierCompletionHandler(identifier: string, completion: (p1: NSError) => void): void;
}

declare var CXCallDirectoryPhoneNumberMax: number;

declare class CXCallDirectoryProvider extends NSObject implements NSExtensionRequestHandling {

	static alloc(): CXCallDirectoryProvider; // inherited from NSObject

	static new(): CXCallDirectoryProvider; // inherited from NSObject

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	beginRequestWithExtensionContext(context: CXCallDirectoryExtensionContext): void;

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

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

declare const enum CXCallEndedReason {

	Failed = 1,

	RemoteEnded = 2,

	Unanswered = 3,

	AnsweredElsewhere = 4,

	DeclinedElsewhere = 5
}

declare class CXCallObserver extends NSObject {

	static alloc(): CXCallObserver; // inherited from NSObject

	static new(): CXCallObserver; // inherited from NSObject

	readonly calls: NSArray<CXCall>;

	setDelegateQueue(delegate: CXCallObserverDelegate, queue: NSObject): void;
}

interface CXCallObserverDelegate extends NSObjectProtocol {

	callObserverCallChanged(callObserver: CXCallObserver, call: CXCall): void;
}
declare var CXCallObserverDelegate: {

	prototype: CXCallObserverDelegate;
};

declare class CXCallUpdate extends NSObject implements NSCopying {

	static alloc(): CXCallUpdate; // inherited from NSObject

	static new(): CXCallUpdate; // inherited from NSObject

	hasVideo: boolean;

	localizedCallerName: string;

	remoteHandle: CXHandle;

	supportsDTMF: boolean;

	supportsGrouping: boolean;

	supportsHolding: boolean;

	supportsUngrouping: boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class CXEndCallAction extends CXCallAction {

	static alloc(): CXEndCallAction; // inherited from NSObject

	static new(): CXEndCallAction; // inherited from NSObject

	fulfillWithDateEnded(dateEnded: Date): void;
}

declare const enum CXErrorCode {

	UnknownError = 0,

	Unentitled = 1,

	InvalidArgument = 2
}

declare const enum CXErrorCodeCallDirectoryManagerError {

	Unknown = 0,

	NoExtensionFound = 1,

	LoadingInterrupted = 2,

	EntriesOutOfOrder = 3,

	DuplicateEntries = 4,

	MaximumEntriesExceeded = 5,

	ExtensionDisabled = 6,

	CurrentlyLoading = 7,

	UnexpectedIncrementalRemoval = 8
}

declare const enum CXErrorCodeIncomingCallError {

	Unknown = 0,

	Unentitled = 1,

	CallUUIDAlreadyExists = 2,

	FilteredByDoNotDisturb = 3,

	FilteredByBlockList = 4
}

declare const enum CXErrorCodeRequestTransactionError {

	Unknown = 0,

	Unentitled = 1,

	UnknownCallProvider = 2,

	EmptyTransaction = 3,

	UnknownCallUUID = 4,

	CallUUIDAlreadyExists = 5,

	InvalidAction = 6,

	MaximumCallGroupsReached = 7
}

declare var CXErrorDomain: string;

declare var CXErrorDomainCallDirectoryManager: string;

declare var CXErrorDomainIncomingCall: string;

declare var CXErrorDomainRequestTransaction: string;

declare class CXHandle extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CXHandle; // inherited from NSObject

	static new(): CXHandle; // inherited from NSObject

	readonly type: CXHandleType;

	readonly value: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { type: CXHandleType; value: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithTypeValue(type: CXHandleType, value: string): this;

	isEqualToHandle(handle: CXHandle): boolean;
}

declare const enum CXHandleType {

	Generic = 1,

	PhoneNumber = 2,

	EmailAddress = 3
}

declare class CXPlayDTMFCallAction extends CXCallAction {

	static alloc(): CXPlayDTMFCallAction; // inherited from NSObject

	static new(): CXPlayDTMFCallAction; // inherited from NSObject

	digits: string;

	type: CXPlayDTMFCallActionType;

	constructor(o: { callUUID: NSUUID; digits: string; type: CXPlayDTMFCallActionType; });

	initWithCallUUIDDigitsType(callUUID: NSUUID, digits: string, type: CXPlayDTMFCallActionType): this;
}

declare const enum CXPlayDTMFCallActionType {

	SingleTone = 1,

	SoftPause = 2,

	HardPause = 3
}

declare class CXProvider extends NSObject {

	static alloc(): CXProvider; // inherited from NSObject

	static new(): CXProvider; // inherited from NSObject

	configuration: CXProviderConfiguration;

	readonly pendingTransactions: NSArray<CXTransaction>;

	constructor(o: { configuration: CXProviderConfiguration; });

	initWithConfiguration(configuration: CXProviderConfiguration): this;

	invalidate(): void;

	pendingCallActionsOfClassWithCallUUID(callActionClass: typeof NSObject, callUUID: NSUUID): NSArray<CXCallAction>;

	reportCallWithUUIDEndedAtDateReason(UUID: NSUUID, dateEnded: Date, endedReason: CXCallEndedReason): void;

	reportCallWithUUIDUpdated(UUID: NSUUID, update: CXCallUpdate): void;

	reportNewIncomingCallWithUUIDUpdateCompletion(UUID: NSUUID, update: CXCallUpdate, completion: (p1: NSError) => void): void;

	reportOutgoingCallWithUUIDConnectedAtDate(UUID: NSUUID, dateConnected: Date): void;

	reportOutgoingCallWithUUIDStartedConnectingAtDate(UUID: NSUUID, dateStartedConnecting: Date): void;

	setDelegateQueue(delegate: CXProviderDelegate, queue: NSObject): void;
}

declare class CXProviderConfiguration extends NSObject implements NSCopying {

	static alloc(): CXProviderConfiguration; // inherited from NSObject

	static new(): CXProviderConfiguration; // inherited from NSObject

	iconTemplateImageData: NSData;

	includesCallsInRecents: boolean;

	readonly localizedName: string;

	maximumCallGroups: number;

	maximumCallsPerCallGroup: number;

	ringtoneSound: string;

	supportedHandleTypes: NSSet<number>;

	supportsVideo: boolean;

	constructor(o: { localizedName: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithLocalizedName(localizedName: string): this;
}

interface CXProviderDelegate extends NSObjectProtocol {

	providerDidActivateAudioSession?(provider: CXProvider, audioSession: AVAudioSession): void;

	providerDidBegin?(provider: CXProvider): void;

	providerDidDeactivateAudioSession?(provider: CXProvider, audioSession: AVAudioSession): void;

	providerDidReset(provider: CXProvider): void;

	providerExecuteTransaction?(provider: CXProvider, transaction: CXTransaction): boolean;

	providerPerformAnswerCallAction?(provider: CXProvider, action: CXAnswerCallAction): void;

	providerPerformEndCallAction?(provider: CXProvider, action: CXEndCallAction): void;

	providerPerformPlayDTMFCallAction?(provider: CXProvider, action: CXPlayDTMFCallAction): void;

	providerPerformSetGroupCallAction?(provider: CXProvider, action: CXSetGroupCallAction): void;

	providerPerformSetHeldCallAction?(provider: CXProvider, action: CXSetHeldCallAction): void;

	providerPerformSetMutedCallAction?(provider: CXProvider, action: CXSetMutedCallAction): void;

	providerPerformStartCallAction?(provider: CXProvider, action: CXStartCallAction): void;

	providerTimedOutPerformingAction?(provider: CXProvider, action: CXAction): void;
}
declare var CXProviderDelegate: {

	prototype: CXProviderDelegate;
};

declare class CXSetGroupCallAction extends CXCallAction {

	static alloc(): CXSetGroupCallAction; // inherited from NSObject

	static new(): CXSetGroupCallAction; // inherited from NSObject

	callUUIDToGroupWith: NSUUID;

	constructor(o: { callUUID: NSUUID; callUUIDToGroupWith: NSUUID; });

	initWithCallUUIDCallUUIDToGroupWith(callUUID: NSUUID, callUUIDToGroupWith: NSUUID): this;
}

declare class CXSetHeldCallAction extends CXCallAction {

	static alloc(): CXSetHeldCallAction; // inherited from NSObject

	static new(): CXSetHeldCallAction; // inherited from NSObject

	onHold: boolean;

	constructor(o: { callUUID: NSUUID; onHold: boolean; });

	initWithCallUUIDOnHold(callUUID: NSUUID, onHold: boolean): this;
}

declare class CXSetMutedCallAction extends CXCallAction {

	static alloc(): CXSetMutedCallAction; // inherited from NSObject

	static new(): CXSetMutedCallAction; // inherited from NSObject

	muted: boolean;

	constructor(o: { callUUID: NSUUID; muted: boolean; });

	initWithCallUUIDMuted(callUUID: NSUUID, muted: boolean): this;
}

declare class CXStartCallAction extends CXCallAction {

	static alloc(): CXStartCallAction; // inherited from NSObject

	static new(): CXStartCallAction; // inherited from NSObject

	contactIdentifier: string;

	handle: CXHandle;

	video: boolean;

	constructor(o: { callUUID: NSUUID; handle: CXHandle; });

	fulfillWithDateStarted(dateStarted: Date): void;

	initWithCallUUIDHandle(callUUID: NSUUID, handle: CXHandle): this;
}

declare class CXTransaction extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CXTransaction; // inherited from NSObject

	static new(): CXTransaction; // inherited from NSObject

	readonly UUID: NSUUID;

	readonly actions: NSArray<CXAction>;

	readonly complete: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { action: CXAction; });

	constructor(o: { actions: NSArray<CXAction> | CXAction[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	addAction(action: CXAction): void;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAction(action: CXAction): this;

	initWithActions(actions: NSArray<CXAction> | CXAction[]): this;

	initWithCoder(coder: NSCoder): this;
}
