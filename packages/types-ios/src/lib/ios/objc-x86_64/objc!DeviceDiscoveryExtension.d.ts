
declare class DDDevice extends NSObject {

	static alloc(): DDDevice; // inherited from NSObject

	static new(): DDDevice; // inherited from NSObject

	bluetoothIdentifier: NSUUID;

	category: DDDeviceCategory;

	displayName: string;

	identifier: string;

	mediaContentSubtitle: string;

	mediaContentTitle: string;

	mediaPlaybackState: DDDeviceMediaPlaybackState;

	networkEndpoint: NSObject;

	protocol: DDDeviceProtocol;

	protocolType: UTType;

	state: DDDeviceState;

	txtRecordData: NSData;

	url: NSURL;

	constructor(o: { displayName: string; category: DDDeviceCategory; protocolType: UTType; identifier: string; });

	initWithDisplayNameCategoryProtocolTypeIdentifier(displayName: string, category: DDDeviceCategory, protocolType: UTType, identifier: string): this;
}

declare const enum DDDeviceCategory {

	HiFiSpeaker = 0,

	HiFiSpeakerMultiple = 1,

	TVWithMediaBox = 2,

	TV = 3,

	LaptopComputer = 4,

	DesktopComputer = 5
}

declare function DDDeviceCategoryToString(inValue: DDDeviceCategory): string;

declare class DDDeviceEvent extends NSObject {

	static alloc(): DDDeviceEvent; // inherited from NSObject

	static new(): DDDeviceEvent; // inherited from NSObject

	readonly device: DDDevice;

	readonly eventType: DDEventType;

	constructor(o: { eventType: DDEventType; device: DDDevice; });

	initWithEventTypeDevice(type: DDEventType, device: DDDevice): this;
}

declare const enum DDDeviceMediaPlaybackState {

	NoContent = 0,

	Paused = 1,

	Playing = 2
}

declare function DDDeviceMediaPlaybackStateToString(inValue: DDDeviceMediaPlaybackState): string;

declare const enum DDDeviceProtocol {

	Invalid = 0,

	DIAL = 1
}

declare var DDDeviceProtocolStringDIAL: string;

declare var DDDeviceProtocolStringInvalid: string;

declare function DDDeviceProtocolToString(inValue: DDDeviceProtocol): string;

declare const enum DDDeviceState {

	Invalid = 0,

	Activating = 10,

	Activated = 20,

	Authorized = 25,

	Invalidating = 30
}

declare function DDDeviceStateToString(inValue: DDDeviceState): string;

declare class DDDiscoverySession extends NSObject {

	static alloc(): DDDiscoverySession; // inherited from NSObject

	static new(): DDDiscoverySession; // inherited from NSObject

	reportEvent(inEvent: DDDeviceEvent): void;
}

declare const enum DDErrorCode {

	Success = 0,

	Unknown = 350000,

	BadParameter = 350001,

	Unsupported = 350002,

	Timeout = 350003,

	Internal = 350004,

	MissingEntitlement = 350005,

	Permission = 350006,

	Next = 350007
}

declare var DDErrorDomain: string;

declare const enum DDEventType {

	Unknown = 0,

	DeviceFound = 40,

	DeviceLost = 41,

	DeviceChanged = 42
}

declare function DDEventTypeToString(inValue: DDEventType): string;
