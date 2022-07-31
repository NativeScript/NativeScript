
declare class DDDevice extends NSObject {

	static alloc(): DDDevice; // inherited from NSObject

	static new(): DDDevice; // inherited from NSObject

	bluetoothIdentifier: NSUUID;

	category: DDDeviceCategory;

	displayName: string;

	identifier: string;

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

declare class DDDeviceEvent extends DDEvent {

	static alloc(): DDDeviceEvent; // inherited from NSObject

	static new(): DDDeviceEvent; // inherited from NSObject

	readonly device: DDDevice;

	constructor(o: { eventType: DDEventType; device: DDDevice; });

	initWithEventTypeDevice(type: DDEventType, device: DDDevice): this;
}

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

	reportEvent(inEvent: DDEvent): void;
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

declare class DDEvent extends NSObject {

	static alloc(): DDEvent; // inherited from NSObject

	static new(): DDEvent; // inherited from NSObject

	readonly eventType: DDEventType;
}

declare class DDEventDevicesPresent extends DDEvent {

	static alloc(): DDEventDevicesPresent; // inherited from NSObject

	static new(): DDEventDevicesPresent; // inherited from NSObject

	readonly devicesPresent: boolean;
}

declare const enum DDEventType {

	Unknown = 0,

	DeviceFound = 40,

	DeviceLost = 41,

	DeviceChanged = 42,

	DevicesPresentChanged = 50
}

declare function DDEventTypeToString(inValue: DDEventType): string;
