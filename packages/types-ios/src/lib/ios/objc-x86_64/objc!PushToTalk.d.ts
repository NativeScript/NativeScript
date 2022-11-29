
declare class PTChannelDescriptor extends NSObject {

	static alloc(): PTChannelDescriptor; // inherited from NSObject

	static new(): PTChannelDescriptor; // inherited from NSObject

	readonly image: UIImage;

	readonly name: string;

	constructor(o: { name: string; image: UIImage; });

	initWithNameImage(name: string, image: UIImage): this;
}

declare const enum PTChannelError {

	Unknown = 0,

	ChannelNotFound = 1,

	ChannelLimitReached = 2,

	CallActive = 3,

	TransmissionInProgress = 4,

	TransmissionNotFound = 5,

	AppNotForeground = 6,

	DeviceManagementRestriction = 7,

	ScreenTimeRestriction = 8,

	TransmissionNotAllowed = 9
}

declare var PTChannelErrorDomain: string;

declare const enum PTChannelJoinReason {

	DeveloperRequest = 0,

	ChannelRestoration = 1
}

declare const enum PTChannelLeaveReason {

	Unknown = 0,

	UserRequest = 1,

	DeveloperRequest = 2,

	SystemPolicy = 3
}

declare class PTChannelManager extends NSObject {

	static alloc(): PTChannelManager; // inherited from NSObject

	static channelManagerWithDelegateRestorationDelegateCompletionHandler(delegate: PTChannelManagerDelegate, restorationDelegate: PTChannelRestorationDelegate, completionHandler: (p1: PTChannelManager, p2: NSError) => void): void;

	static new(): PTChannelManager; // inherited from NSObject

	readonly activeChannelUUID: NSUUID;

	leaveChannelWithUUID(channelUUID: NSUUID): void;

	requestBeginTransmittingWithChannelUUID(channelUUID: NSUUID): void;

	requestJoinChannelWithUUIDDescriptor(channelUUID: NSUUID, descriptor: PTChannelDescriptor): void;

	setActiveRemoteParticipantForChannelUUIDCompletionHandler(participant: PTParticipant, channelUUID: NSUUID, completionHandler: (p1: NSError) => void): void;

	setChannelDescriptorForChannelUUIDCompletionHandler(channelDescriptor: PTChannelDescriptor, channelUUID: NSUUID, completionHandler: (p1: NSError) => void): void;

	setServiceStatusForChannelUUIDCompletionHandler(status: PTServiceStatus, channelUUID: NSUUID, completionHandler: (p1: NSError) => void): void;

	setTransmissionModeForChannelUUIDCompletionHandler(transmissionMode: PTTransmissionMode, channelUUID: NSUUID, completionHandler: (p1: NSError) => void): void;

	stopTransmittingWithChannelUUID(channelUUID: NSUUID): void;
}

interface PTChannelManagerDelegate extends NSObjectProtocol {

	channelManagerChannelUUIDDidBeginTransmittingFromSource(channelManager: PTChannelManager, channelUUID: NSUUID, source: PTChannelTransmitRequestSource): void;

	channelManagerChannelUUIDDidEndTransmittingFromSource(channelManager: PTChannelManager, channelUUID: NSUUID, source: PTChannelTransmitRequestSource): void;

	channelManagerDidActivateAudioSession(channelManager: PTChannelManager, audioSession: AVAudioSession): void;

	channelManagerDidDeactivateAudioSession(channelManager: PTChannelManager, audioSession: AVAudioSession): void;

	channelManagerDidJoinChannelWithUUIDReason(channelManager: PTChannelManager, channelUUID: NSUUID, reason: PTChannelJoinReason): void;

	channelManagerDidLeaveChannelWithUUIDReason(channelManager: PTChannelManager, channelUUID: NSUUID, reason: PTChannelLeaveReason): void;

	channelManagerFailedToBeginTransmittingInChannelWithUUIDError?(channelManager: PTChannelManager, channelUUID: NSUUID, error: NSError): void;

	channelManagerFailedToJoinChannelWithUUIDError?(channelManager: PTChannelManager, channelUUID: NSUUID, error: NSError): void;

	channelManagerFailedToLeaveChannelWithUUIDError?(channelManager: PTChannelManager, channelUUID: NSUUID, error: NSError): void;

	channelManagerFailedToStopTransmittingInChannelWithUUIDError?(channelManager: PTChannelManager, channelUUID: NSUUID, error: NSError): void;

	channelManagerReceivedEphemeralPushToken(channelManager: PTChannelManager, pushToken: NSData): void;

	incomingPushResultForChannelManagerChannelUUIDPushPayload(channelManager: PTChannelManager, channelUUID: NSUUID, pushPayload: NSDictionary<string, any>): PTPushResult;
}
declare var PTChannelManagerDelegate: {

	prototype: PTChannelManagerDelegate;
};

interface PTChannelRestorationDelegate extends NSObjectProtocol {

	channelDescriptorForRestoredChannelUUID(channelUUID: NSUUID): PTChannelDescriptor;
}
declare var PTChannelRestorationDelegate: {

	prototype: PTChannelRestorationDelegate;
};

declare const enum PTChannelTransmitRequestSource {

	Unknown = 0,

	UserRequest = 1,

	DeveloperRequest = 2,

	HandsfreeButton = 3
}

declare const enum PTInstantiationError {

	Unknown = 0,

	InvalidPlatform = 1,

	MissingBackgroundMode = 2,

	MissingPushServerEnvironment = 3,

	MissingEntitlement = 4,

	InstantiationAlreadyInProgress = 5
}

declare var PTInstantiationErrorDomain: string;

declare class PTParticipant extends NSObject {

	static alloc(): PTParticipant; // inherited from NSObject

	static new(): PTParticipant; // inherited from NSObject

	readonly image: UIImage;

	readonly name: string;

	constructor(o: { name: string; image: UIImage; });

	initWithNameImage(name: string, image: UIImage): this;
}

declare class PTPushResult extends NSObject {

	static alloc(): PTPushResult; // inherited from NSObject

	static new(): PTPushResult; // inherited from NSObject

	static pushResultForActiveRemoteParticipant(participant: PTParticipant): PTPushResult;

	static readonly leaveChannelPushResult: PTPushResult;
}

declare const enum PTServiceStatus {

	Ready = 0,

	Connecting = 1,

	Unavailable = 2
}

declare const enum PTTransmissionMode {

	FullDuplex = 0,

	HalfDuplex = 1,

	ListenOnly = 2
}
