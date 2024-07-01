
/**
 * @since 18.0
 */
declare class MIDI2DeviceInfo extends NSObject {

	static alloc(): MIDI2DeviceInfo; // inherited from NSObject

	static new(): MIDI2DeviceInfo; // inherited from NSObject

	readonly family: number;

	readonly manufacturerID: MIDI2DeviceManufacturer;

	readonly modelNumber: number;

	readonly revisionLevel: MIDI2DeviceRevisionLevel;

	constructor(o: { manufacturerID: MIDI2DeviceManufacturer; family: number; modelNumber: number; revisionLevel: MIDI2DeviceRevisionLevel; });

	initWithManufacturerIDFamilyModelNumberRevisionLevel(manufacturerID: MIDI2DeviceManufacturer, family: number, modelNumber: number, revisionLevel: MIDI2DeviceRevisionLevel): this;
}

interface MIDI2DeviceManufacturer {
	sysExIDByte: interop.Reference<number>;
}
declare var MIDI2DeviceManufacturer: interop.StructType<MIDI2DeviceManufacturer>;

interface MIDI2DeviceRevisionLevel {
	revisionLevel: interop.Reference<number>;
}
declare var MIDI2DeviceRevisionLevel: interop.StructType<MIDI2DeviceRevisionLevel>;

/**
 * @since 16.0
 */
declare function MIDIBluetoothDriverActivateAllConnections(): number;

/**
 * @since 16.0
 */
declare function MIDIBluetoothDriverDisconnect(uuid: string): number;

declare const enum MIDICICategoryOptions {

	kMIDICICategoryOptionsProtocolNegotiation = 2,

	kMIDICICategoryOptionsProfileConfigurationSupported = 4,

	kMIDICICategoryOptionsPropertyExchangeSupported = 8,

	kMIDICICategoryOptionsProcessInquirySupported = 16
}

/**
 * @since 18.0
 */
declare class MIDICIDevice extends NSObject {

	static alloc(): MIDICIDevice; // inherited from NSObject

	static new(): MIDICIDevice; // inherited from NSObject

	readonly MUID: number;

	readonly deviceInfo: MIDI2DeviceInfo;

	readonly deviceType: MIDICIDeviceType;

	readonly maxPropertyExchangeRequests: number;

	readonly maxSysExSize: number;

	readonly profiles: NSArray<MIDIUMPCIProfile>;

	readonly supportsProcessInquiry: boolean;

	readonly supportsProfileConfiguration: boolean;

	readonly supportsPropertyExchange: boolean;

	readonly supportsProtocolNegotiation: boolean;
}

interface MIDICIDeviceIdentification {
	manufacturer: interop.Reference<number>;
	family: interop.Reference<number>;
	modelNumber: interop.Reference<number>;
	revisionLevel: interop.Reference<number>;
	reserved: interop.Reference<number>;
}
declare var MIDICIDeviceIdentification: interop.StructType<MIDICIDeviceIdentification>;

/**
 * @since 12.0
 * @deprecated 18.0
 */
declare class MIDICIDeviceInfo extends NSObject implements NSSecureCoding {

	static alloc(): MIDICIDeviceInfo; // inherited from NSObject

	static new(): MIDICIDeviceInfo; // inherited from NSObject

	readonly family: NSData;

	readonly manufacturerID: NSData;

	readonly midiDestination: number;

	readonly modelNumber: NSData;

	readonly revisionLevel: NSData;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { destination: number; manufacturer: NSData; family: NSData; model: NSData; revision: NSData; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithDestinationManufacturerFamilyModelRevision(midiDestination: number, manufacturer: NSData, family: NSData, modelNumber: NSData, revisionLevel: NSData): this;
}

/**
 * @since 18.0
 */
declare class MIDICIDeviceManager extends NSObject {

	static alloc(): MIDICIDeviceManager; // inherited from NSObject

	static new(): MIDICIDeviceManager; // inherited from NSObject

	readonly discoveredCIDevices: NSArray<MIDICIDevice>;

	static readonly sharedInstance: MIDICIDeviceManager;
}

/**
 * @since 18.0
 */
declare var MIDICIDeviceObjectKey: string;

declare const enum MIDICIDeviceType {

	kMIDICIDeviceTypeUnknown = 0,

	kMIDICIDeviceTypeLegacyMIDI1 = 1,

	kMIDICIDeviceTypeVirtual = 2,

	kMIDICIDeviceTypeUSBMIDI = 3
}

/**
 * @since 18.0
 */
declare var MIDICIDeviceWasAddedNotification: string;

/**
 * @since 18.0
 */
declare var MIDICIDeviceWasRemovedNotification: string;

/**
 * @since 14.0
 * @deprecated 18.0
 */
declare class MIDICIDiscoveredNode extends NSObject implements NSSecureCoding {

	static alloc(): MIDICIDiscoveredNode; // inherited from NSObject

	static new(): MIDICIDiscoveredNode; // inherited from NSObject

	readonly destination: number;

	readonly deviceInfo: MIDICIDeviceInfo;

	readonly maximumSysExSize: number;

	readonly supportsProfiles: boolean;

	readonly supportsProperties: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 * @deprecated 18.0
 */
declare class MIDICIDiscoveryManager extends NSObject {

	static alloc(): MIDICIDiscoveryManager; // inherited from NSObject

	static new(): MIDICIDiscoveryManager; // inherited from NSObject

	static sharedInstance(): MIDICIDiscoveryManager;

	discoverWithHandler(completedHandler: (p1: NSArray<MIDICIDiscoveredNode>) => void): void;
}

declare const enum MIDICIManagementMessageType {

	kMIDICIManagementMessageTypeDiscovery = 112,

	kMIDICIManagementMessageTypeReplyToDiscovery = 113,

	kMIDICIManagementMessageTypeInquiryEndpointInformation = 114,

	kMIDICIManagementMessageTypeReplyToEndpointInformation = 115,

	kMIDICIManagementMessageTypeMIDICIACK = 125,

	kMIDICIManagementMessageTypeInvalidateMUID = 126,

	kMIDICIManagementMessageTypeMIDICINAK = 127
}

declare const enum MIDICIProcessInquiryMessageType {

	kMIDICIProcessInquiryMessageTypeInquiryProcessInquiryCapabilities = 64,

	kMIDICIProcessInquiryMessageTypeReplyToProcessInquiryCapabilities = 65,

	kMIDICIProcessInquiryMessageTypeInquiryMIDIMessageReport = 66,

	kMIDICIProcessInquiryMessageTypeReplyToMIDIMessageReport = 67,

	kMIDICIProcessInquiryMessageTypeEndOfMIDIMessageReport = 68
}

/**
 * @since 12.0
 */
declare class MIDICIProfile extends NSObject implements NSSecureCoding {

	static alloc(): MIDICIProfile; // inherited from NSObject

	static new(): MIDICIProfile; // inherited from NSObject

	readonly name: string;

	readonly profileID: NSData;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 14.0
	 */
	constructor(o: { data: NSData; });

	constructor(o: { data: NSData; name: string; });

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 14.0
	 */
	initWithData(data: NSData): this;

	initWithDataName(data: NSData, inName: string): this;
}

interface MIDICIProfileIDManufacturerSpecific {
	sysExID1: number;
	sysExID2: number;
	sysExID3: number;
	info1: number;
	info2: number;
}
declare var MIDICIProfileIDManufacturerSpecific: interop.StructType<MIDICIProfileIDManufacturerSpecific>;

interface MIDICIProfileIDStandard {
	profileIDByte1: number;
	profileBank: number;
	profileNumber: number;
	profileVersion: number;
	profileLevel: number;
}
declare var MIDICIProfileIDStandard: interop.StructType<MIDICIProfileIDStandard>;

declare const enum MIDICIProfileMessageType {

	kMIDICIProfileMessageTypeProfileInquiry = 32,

	kMIDICIProfileMessageTypeReplyToProfileInquiry = 33,

	kMIDICIProfileMessageTypeSetProfileOn = 34,

	kMIDICIProfileMessageTypeSetProfileOff = 35,

	kMIDICIProfileMessageTypeProfileEnabledReport = 36,

	kMIDICIProfileMessageTypeProfileDisabledReport = 37,

	kMIDICIProfileMessageTypeProfileAdded = 38,

	kMIDICIProfileMessageTypeProfileRemoved = 39,

	kMIDICIProfileMessageTypeDetailsInquiry = 40,

	kMIDICIProfileMessageTypeReplyToDetailsInquiry = 41,

	kMIDICIProfileMessageTypeProfileSpecificData = 47
}

/**
 * @since 18.0
 */
declare var MIDICIProfileObjectKey: string;

/**
 * @since 14.0
 * @deprecated 18.0
 */
interface MIDICIProfileResponderDelegate extends NSObjectProtocol {

	connectInitiatorWithDeviceInfo(initiatorMUID: number, deviceInfo: MIDICIDeviceInfo): boolean;

	handleDataForProfileOnChannelData?(aProfile: MIDICIProfile, channel: number, inData: NSData): void;

	initiatorDisconnected(initiatorMUID: number): void;

	willSetProfileOnChannelEnabled?(aProfile: MIDICIProfile, channel: number, shouldEnable: boolean): boolean;
}
declare var MIDICIProfileResponderDelegate: {

	prototype: MIDICIProfileResponderDelegate;
};

/**
 * @since 12.0
 */
declare class MIDICIProfileState extends NSObject implements NSSecureCoding {

	static alloc(): MIDICIProfileState; // inherited from NSObject

	static new(): MIDICIProfileState; // inherited from NSObject

	readonly disabledProfiles: NSArray<MIDICIProfile>;

	readonly enabledProfiles: NSArray<MIDICIProfile>;

	readonly midiChannel: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 12.0
	 * @deprecated 18.0
	 */
	constructor(o: { channel: number; enabledProfiles: NSArray<MIDICIProfile> | MIDICIProfile[]; disabledProfiles: NSArray<MIDICIProfile> | MIDICIProfile[]; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 14.0
	 */
	constructor(o: { enabledProfiles: NSArray<MIDICIProfile> | MIDICIProfile[]; disabledProfiles: NSArray<MIDICIProfile> | MIDICIProfile[]; });

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 12.0
	 * @deprecated 18.0
	 */
	initWithChannelEnabledProfilesDisabledProfiles(midiChannelNum: number, enabled: NSArray<MIDICIProfile> | MIDICIProfile[], disabled: NSArray<MIDICIProfile> | MIDICIProfile[]): this;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 14.0
	 */
	initWithEnabledProfilesDisabledProfiles(enabled: NSArray<MIDICIProfile> | MIDICIProfile[], disabled: NSArray<MIDICIProfile> | MIDICIProfile[]): this;
}

declare const enum MIDICIProfileType {

	kMIDICIProfileTypeSingleChannel = 1,

	kMIDICIProfileTypeGroup = 2,

	kMIDICIProfileTypeFunctionBlock = 3,

	kMIDICIProfileTypeMultichannel = 4
}

/**
 * @since 18.0
 */
declare var MIDICIProfileWasRemovedNotification: string;

/**
 * @since 18.0
 */
declare var MIDICIProfileWasUpdatedNotification: string;

declare const enum MIDICIPropertyExchangeMessageType {

	kMIDICIPropertyExchangeMessageTypeInquiryPropertyExchangeCapabilities = 48,

	kMIDICIPropertyExchangeMessageTypeReplyToPropertyExchangeCapabilities = 49,

	kMIDICIPropertyExchangeMessageTypeInquiryHasPropertyData_Reserved = 50,

	kMIDICIPropertyExchangeMessageTypeInquiryReplyToHasPropertyData_Reserved = 51,

	kMIDICIPropertyExchangeMessageTypeInquiryGetPropertyData = 52,

	kMIDICIPropertyExchangeMessageTypeReplyToGetProperty = 53,

	kMIDICIPropertyExchangeMessageTypeInquirySetPropertyData = 54,

	kMIDICIPropertyExchangeMessageTypeReplyToSetPropertyData = 55,

	kMIDICIPropertyExchangeMessageTypeSubscription = 56,

	kMIDICIPropertyExchangeMessageTypeReplyToSubscription = 57,

	kMIDICIPropertyExchangeMessageTypeNotify = 63
}

/**
 * @since 14.0
 * @deprecated 18.0
 */
declare class MIDICIResponder extends NSObject {

	static alloc(): MIDICIResponder; // inherited from NSObject

	static new(): MIDICIResponder; // inherited from NSObject

	readonly deviceInfo: MIDICIDeviceInfo;

	readonly initiators: NSArray<number>;

	readonly profileDelegate: MIDICIProfileResponderDelegate;

	constructor(o: { deviceInfo: MIDICIDeviceInfo; profileDelegate: MIDICIProfileResponderDelegate; profileStates: NSArray<MIDICIProfileState> | MIDICIProfileState[]; supportProperties: boolean; });

	initWithDeviceInfoProfileDelegateProfileStatesSupportProperties(deviceInfo: MIDICIDeviceInfo, delegate: MIDICIProfileResponderDelegate, profileList: NSArray<MIDICIProfileState> | MIDICIProfileState[], propertiesSupported: boolean): this;

	notifyProfileOnChannelIsEnabled(aProfile: MIDICIProfile, channel: number, enabledState: boolean): boolean;

	sendProfileOnChannelProfileData(aProfile: MIDICIProfile, channel: number, profileSpecificData: NSData): boolean;

	start(): boolean;

	stop(): void;
}

/**
 * @since 12.0
 * @deprecated 18.0
 */
declare class MIDICISession extends NSObject {

	static alloc(): MIDICISession; // inherited from NSObject

	static new(): MIDICISession; // inherited from NSObject

	readonly deviceInfo: MIDICIDeviceInfo;

	readonly maxPropertyRequests: number;

	readonly maxSysExSize: number;

	readonly midiDestination: number;

	profileChangedCallback: (p1: MIDICISession, p2: number, p3: MIDICIProfile, p4: boolean) => void;

	profileSpecificDataHandler: (p1: MIDICISession, p2: number, p3: MIDICIProfile, p4: NSData) => void;

	readonly supportsProfileCapability: boolean;

	readonly supportsPropertyCapability: boolean;

	constructor(o: { discoveredNode: MIDICIDiscoveredNode; dataReadyHandler: () => void; disconnectHandler: (p1: MIDICISession, p2: NSError) => void; });

	disableProfileOnChannelError(profile: MIDICIProfile, channel: number): boolean;

	enableProfileOnChannelError(profile: MIDICIProfile, channel: number): boolean;

	initWithDiscoveredNodeDataReadyHandlerDisconnectHandler(discoveredNode: MIDICIDiscoveredNode, handler: () => void, disconnectHandler: (p1: MIDICISession, p2: NSError) => void): this;

	profileStateForChannel(channel: number): MIDICIProfileState;

	/**
	 * @since 14.0
	 */
	sendProfileOnChannelProfileData(profile: MIDICIProfile, channel: number, profileSpecificData: NSData): boolean;
}

declare const enum MIDICVStatus {

	kMIDICVStatusNoteOff = 8,

	kMIDICVStatusNoteOn = 9,

	kMIDICVStatusPolyPressure = 10,

	kMIDICVStatusControlChange = 11,

	kMIDICVStatusProgramChange = 12,

	kMIDICVStatusChannelPressure = 13,

	kMIDICVStatusPitchBend = 14,

	kMIDICVStatusRegisteredPNC = 0,

	kMIDICVStatusAssignablePNC = 1,

	kMIDICVStatusRegisteredControl = 2,

	kMIDICVStatusAssignableControl = 3,

	kMIDICVStatusRelRegisteredControl = 4,

	kMIDICVStatusRelAssignableControl = 5,

	kMIDICVStatusPerNotePitchBend = 6,

	kMIDICVStatusPerNoteMgmt = 15
}

declare var MIDIChannelsWholePort: number;

/**
 * @since 4.2
 */
declare function MIDIClientCreate(name: string, notifyProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<MIDINotification>, p2: interop.Pointer | interop.Reference<any>) => void>, notifyRefCon: interop.Pointer | interop.Reference<any>, outClient: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 9.0
 */
declare function MIDIClientCreateWithBlock(name: string, outClient: interop.Pointer | interop.Reference<number>, notifyBlock: (p1: interop.Pointer | interop.Reference<MIDINotification>) => void): number;

/**
 * @since 4.2
 */
declare function MIDIClientDispose(client: number): number;

interface MIDIControlTransform {
	controlType: MIDITransformControlType;
	remappedControlType: MIDITransformControlType;
	controlNumber: number;
	transform: MIDITransformType;
	param: number;
}
declare var MIDIControlTransform: interop.StructType<MIDIControlTransform>;

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDIDestinationCreate(client: number, name: string, readProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<MIDIPacketList>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => void>, refCon: interop.Pointer | interop.Reference<any>, outDest: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 9.0
 * @deprecated 100000
 */
declare function MIDIDestinationCreateWithBlock(client: number, name: string, outDest: interop.Pointer | interop.Reference<number>, readBlock: (p1: interop.Pointer | interop.Reference<MIDIPacketList>, p2: interop.Pointer | interop.Reference<any>) => void): number;

/**
 * @since 14.0
 */
declare function MIDIDestinationCreateWithProtocol(client: number, name: string, protocol: MIDIProtocolID, outDest: interop.Pointer | interop.Reference<number>, readBlock: (p1: interop.Pointer | interop.Reference<MIDIEventList>, p2: interop.Pointer | interop.Reference<any>) => void): number;

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDIDeviceAddEntity(device: number, name: string, embedded: boolean, numSourceEndpoints: number, numDestinationEndpoints: number, newEntity: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceCreate(owner: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, name: string, manufacturer: string, model: string, outDevice: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceDispose(device: number): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceGetEntity(device: number, entityIndex0: number): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceGetNumberOfEntities(device: number): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceListAddDevice(devList: number, dev: number): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceListDispose(devList: number): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceListGetDevice(devList: number, index0: number): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceListGetNumberOfDevices(devList: number): number;

/**
 * @since 14.0
 */
declare function MIDIDeviceNewEntity(device: number, name: string, protocol: MIDIProtocolID, embedded: boolean, numSourceEndpoints: number, numDestinationEndpoints: number, newEntity: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIDeviceRemoveEntity(device: number, entity: number): number;

interface MIDIDriverInterface {
	_reserved: interop.Pointer | interop.Reference<any>;
	QueryInterface: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>, p2: CFUUIDBytes, p3: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>) => number>;
	AddRef: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	Release: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<any>) => number>;
	FindDevices: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: number) => number>;
	Start: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: number) => number>;
	Stop: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>) => number>;
	Configure: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: number) => number>;
	Send: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: interop.Pointer | interop.Reference<MIDIPacketList>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => number>;
	EnableSource: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: number, p3: boolean) => number>;
	Flush: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: number, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => number>;
	Monitor: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: number, p3: interop.Pointer | interop.Reference<MIDIPacketList>) => number>;
	SendPackets: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: interop.Pointer | interop.Reference<MIDIEventList>, p3: interop.Pointer | interop.Reference<any>, p4: interop.Pointer | interop.Reference<any>) => number>;
	MonitorEvents: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>, p2: number, p3: interop.Pointer | interop.Reference<MIDIEventList>) => number>;
}
declare var MIDIDriverInterface: interop.StructType<MIDIDriverInterface>;

/**
 * @since 4.2
 */
declare function MIDIEndpointDispose(endpt: number): number;

/**
 * @since 4.2
 */
declare function MIDIEndpointGetEntity(inEndpoint: number, outEntity: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIEndpointGetRefCons(endpt: number, ref1: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>, ref2: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<any>>): number;

/**
 * @since 4.2
 */
declare function MIDIEndpointSetRefCons(endpt: number, ref1: interop.Pointer | interop.Reference<any>, ref2: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.2
 */
declare function MIDIEntityAddOrRemoveEndpoints(entity: number, numSourceEndpoints: number, numDestinationEndpoints: number): number;

/**
 * @since 4.2
 */
declare function MIDIEntityGetDestination(entity: number, destIndex0: number): number;

/**
 * @since 4.2
 */
declare function MIDIEntityGetDevice(inEntity: number, outDevice: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIEntityGetNumberOfDestinations(entity: number): number;

/**
 * @since 4.2
 */
declare function MIDIEntityGetNumberOfSources(entity: number): number;

/**
 * @since 4.2
 */
declare function MIDIEntityGetSource(entity: number, sourceIndex0: number): number;

interface MIDIEventList {
	protocol: MIDIProtocolID;
	numPackets: number;
	packet: interop.Reference<MIDIEventPacket>;
}
declare var MIDIEventList: interop.StructType<MIDIEventList>;

/**
 * @since 14.0
 */
declare function MIDIEventListAdd(evtlist: interop.Pointer | interop.Reference<MIDIEventList>, listSize: number, curPacket: interop.Pointer | interop.Reference<MIDIEventPacket>, time: number, wordCount: number, words: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<MIDIEventPacket>;

/**
 * @since 14.0
 */
declare function MIDIEventListInit(evtlist: interop.Pointer | interop.Reference<MIDIEventList>, protocol: MIDIProtocolID): interop.Pointer | interop.Reference<MIDIEventPacket>;

interface MIDIEventPacket {
	timeStamp: number;
	wordCount: number;
	words: interop.Reference<number>;
}
declare var MIDIEventPacket: interop.StructType<MIDIEventPacket>;

/**
 * @since 17.0
 */
declare function MIDIEventPacketSysexBytesForGroup(pkt: interop.Pointer | interop.Reference<MIDIEventPacket>, groupIndex: number, outData: interop.Pointer | interop.Reference<NSData>): number;

/**
 * @since 4.2
 */
declare function MIDIExternalDeviceCreate(name: string, manufacturer: string, model: string, outDevice: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIFlushOutput(dest: number): number;

/**
 * @since 4.2
 */
declare function MIDIGetDestination(destIndex0: number): number;

/**
 * @since 4.2
 */
declare function MIDIGetDevice(deviceIndex0: number): number;

/**
 * @since 4.2
 */
declare function MIDIGetDriverDeviceList(driver: interop.Pointer | interop.Reference<interop.Pointer | interop.Reference<MIDIDriverInterface>>): number;

/**
 * @since 4.2
 */
declare function MIDIGetDriverIORunLoop(): interop.Unmanaged<any>;

/**
 * @since 4.2
 */
declare function MIDIGetExternalDevice(deviceIndex0: number): number;

/**
 * @since 4.2
 */
declare function MIDIGetNumberOfDestinations(): number;

/**
 * @since 4.2
 */
declare function MIDIGetNumberOfDevices(): number;

/**
 * @since 4.2
 */
declare function MIDIGetNumberOfExternalDevices(): number;

/**
 * @since 4.2
 */
declare function MIDIGetNumberOfSources(): number;

/**
 * @since 4.2
 */
declare function MIDIGetSource(sourceIndex0: number): number;

interface MIDIIOErrorNotification {
	messageID: MIDINotificationMessageID;
	messageSize: number;
	driverDevice: number;
	errorCode: number;
}
declare var MIDIIOErrorNotification: interop.StructType<MIDIIOErrorNotification>;

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDIInputPortCreate(client: number, portName: string, readProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<MIDIPacketList>, p2: interop.Pointer | interop.Reference<any>, p3: interop.Pointer | interop.Reference<any>) => void>, refCon: interop.Pointer | interop.Reference<any>, outPort: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 9.0
 * @deprecated 100000
 */
declare function MIDIInputPortCreateWithBlock(client: number, portName: string, outPort: interop.Pointer | interop.Reference<number>, readBlock: (p1: interop.Pointer | interop.Reference<MIDIPacketList>, p2: interop.Pointer | interop.Reference<any>) => void): number;

/**
 * @since 14.0
 */
declare function MIDIInputPortCreateWithProtocol(client: number, portName: string, protocol: MIDIProtocolID, outPort: interop.Pointer | interop.Reference<number>, receiveBlock: (p1: interop.Pointer | interop.Reference<MIDIEventList>, p2: interop.Pointer | interop.Reference<any>) => void): number;

declare const enum MIDIMessageType {

	kMIDIMessageTypeUtility = 0,

	kMIDIMessageTypeSystem = 1,

	kMIDIMessageTypeChannelVoice1 = 2,

	kMIDIMessageTypeSysEx = 3,

	kMIDIMessageTypeChannelVoice2 = 4,

	kMIDIMessageTypeData128 = 5,

	kMIDIMessageTypeFlexData = 13,

	kMIDIMessageTypeUnknownF = 15,

	kMIDIMessageTypeStream = 15,

	kMIDIMessageTypeInvalid = 255
}

interface MIDIMessage_128 {
	word0: number;
	word1: number;
	word2: number;
	word3: number;
}
declare var MIDIMessage_128: interop.StructType<MIDIMessage_128>;

interface MIDIMessage_64 {
	word0: number;
	word1: number;
}
declare var MIDIMessage_64: interop.StructType<MIDIMessage_64>;

interface MIDIMessage_96 {
	word0: number;
	word1: number;
	word2: number;
}
declare var MIDIMessage_96: interop.StructType<MIDIMessage_96>;

/**
 * @since 4.2
 */
declare var MIDINetworkBonjourServiceType: string;

/**
 * @since 4.2
 */
declare class MIDINetworkConnection extends NSObject {

	static alloc(): MIDINetworkConnection; // inherited from NSObject

	static connectionWithHost(host: MIDINetworkHost): MIDINetworkConnection;

	static new(): MIDINetworkConnection; // inherited from NSObject

	readonly host: MIDINetworkHost;
}

declare const enum MIDINetworkConnectionPolicy {

	NoOne = 0,

	HostsInContactList = 1,

	Anyone = 2
}

/**
 * @since 4.2
 */
declare class MIDINetworkHost extends NSObject {

	static alloc(): MIDINetworkHost; // inherited from NSObject

	static hostWithNameAddressPort(name: string, address: string, port: number): MIDINetworkHost;

	static hostWithNameNetService(name: string, netService: NSNetService): MIDINetworkHost;

	static hostWithNameNetServiceNameNetServiceDomain(name: string, netServiceName: string, netServiceDomain: string): MIDINetworkHost;

	static new(): MIDINetworkHost; // inherited from NSObject

	readonly address: string;

	readonly name: string;

	readonly netServiceDomain: string;

	readonly netServiceName: string;

	readonly port: number;

	hasSameAddressAs(other: MIDINetworkHost): boolean;
}

/**
 * @since 4.2
 */
declare var MIDINetworkNotificationContactsDidChange: string;

/**
 * @since 4.2
 */
declare var MIDINetworkNotificationSessionDidChange: string;

/**
 * @since 4.2
 */
declare class MIDINetworkSession extends NSObject {

	static alloc(): MIDINetworkSession; // inherited from NSObject

	static defaultSession(): MIDINetworkSession;

	static new(): MIDINetworkSession; // inherited from NSObject

	connectionPolicy: MIDINetworkConnectionPolicy;

	enabled: boolean;

	readonly localName: string;

	readonly networkName: string;

	readonly networkPort: number;

	addConnection(connection: MIDINetworkConnection): boolean;

	addContact(contact: MIDINetworkHost): boolean;

	connections(): NSSet<MIDINetworkConnection>;

	contacts(): NSSet<MIDINetworkHost>;

	destinationEndpoint(): number;

	removeConnection(connection: MIDINetworkConnection): boolean;

	removeContact(contact: MIDINetworkHost): boolean;

	sourceEndpoint(): number;
}

declare const enum MIDINoteAttribute {

	kMIDINoteAttributeNone = 0,

	kMIDINoteAttributeManufacturerSpecific = 1,

	kMIDINoteAttributeProfileSpecific = 2,

	kMIDINoteAttributePitch = 3
}

interface MIDINotification {
	messageID: MIDINotificationMessageID;
	messageSize: number;
}
declare var MIDINotification: interop.StructType<MIDINotification>;

declare const enum MIDINotificationMessageID {

	kMIDIMsgSetupChanged = 1,

	kMIDIMsgObjectAdded = 2,

	kMIDIMsgObjectRemoved = 3,

	kMIDIMsgPropertyChanged = 4,

	kMIDIMsgThruConnectionsChanged = 5,

	kMIDIMsgSerialPortOwnerChanged = 6,

	kMIDIMsgIOError = 7,

	kMIDIMsgInternalStart = 4096
}

interface MIDIObjectAddRemoveNotification {
	messageID: MIDINotificationMessageID;
	messageSize: number;
	parent: number;
	parentType: MIDIObjectType;
	child: number;
	childType: MIDIObjectType;
}
declare var MIDIObjectAddRemoveNotification: interop.StructType<MIDIObjectAddRemoveNotification>;

/**
 * @since 4.2
 */
declare function MIDIObjectFindByUniqueID(inUniqueID: number, outObject: interop.Pointer | interop.Reference<number>, outObjectType: interop.Pointer | interop.Reference<MIDIObjectType>): number;

/**
 * @since 4.2
 */
declare function MIDIObjectGetDataProperty(obj: number, propertyID: string, outData: interop.Pointer | interop.Reference<NSData>): number;

/**
 * @since 4.2
 */
declare function MIDIObjectGetDictionaryProperty(obj: number, propertyID: string, outDict: interop.Pointer | interop.Reference<NSDictionary<any, any>>): number;

/**
 * @since 4.2
 */
declare function MIDIObjectGetIntegerProperty(obj: number, propertyID: string, outValue: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIObjectGetProperties(obj: number, outProperties: interop.Pointer | interop.Reference<any>, deep: boolean): number;

/**
 * @since 4.2
 */
declare function MIDIObjectGetStringProperty(obj: number, propertyID: string, str: interop.Pointer | interop.Reference<string>): number;

interface MIDIObjectPropertyChangeNotification {
	messageID: MIDINotificationMessageID;
	messageSize: number;
	object: number;
	objectType: MIDIObjectType;
	propertyName: string;
}
declare var MIDIObjectPropertyChangeNotification: interop.StructType<MIDIObjectPropertyChangeNotification>;

/**
 * @since 4.2
 */
declare function MIDIObjectRemoveProperty(obj: number, propertyID: string): number;

/**
 * @since 4.2
 */
declare function MIDIObjectSetDataProperty(obj: number, propertyID: string, data: NSData): number;

/**
 * @since 4.2
 */
declare function MIDIObjectSetDictionaryProperty(obj: number, propertyID: string, dict: NSDictionary<any, any>): number;

/**
 * @since 4.2
 */
declare function MIDIObjectSetIntegerProperty(obj: number, propertyID: string, value: number): number;

/**
 * @since 4.2
 */
declare function MIDIObjectSetStringProperty(obj: number, propertyID: string, str: string): number;

declare const enum MIDIObjectType {

	kMIDIObjectType_Other = -1,

	kMIDIObjectType_Device = 0,

	kMIDIObjectType_Entity = 1,

	kMIDIObjectType_Source = 2,

	kMIDIObjectType_Destination = 3,

	kMIDIObjectType_ExternalDevice = 16,

	kMIDIObjectType_ExternalEntity = 17,

	kMIDIObjectType_ExternalSource = 18,

	kMIDIObjectType_ExternalDestination = 19
}

/**
 * @since 4.2
 */
declare function MIDIOutputPortCreate(client: number, portName: string, outPort: interop.Pointer | interop.Reference<number>): number;

interface MIDIPacket {
	timeStamp: number;
	length: number;
	data: interop.Reference<number>;
}
declare var MIDIPacket: interop.StructType<MIDIPacket>;

interface MIDIPacketList {
	numPackets: number;
	packet: interop.Reference<MIDIPacket>;
}
declare var MIDIPacketList: interop.StructType<MIDIPacketList>;

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDIPacketListAdd(pktlist: interop.Pointer | interop.Reference<MIDIPacketList>, listSize: number, curPacket: interop.Pointer | interop.Reference<MIDIPacket>, time: number, nData: number, data: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<MIDIPacket>;

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDIPacketListInit(pktlist: interop.Pointer | interop.Reference<MIDIPacketList>): interop.Pointer | interop.Reference<MIDIPacket>;

declare const enum MIDIPerNoteManagementOptions {

	kMIDIPerNoteManagementReset = 1,

	kMIDIPerNoteManagementDetach = 2
}

/**
 * @since 4.2
 */
declare function MIDIPortConnectSource(port: number, source: number, connRefCon: interop.Pointer | interop.Reference<any>): number;

/**
 * @since 4.2
 */
declare function MIDIPortDisconnectSource(port: number, source: number): number;

/**
 * @since 4.2
 */
declare function MIDIPortDispose(port: number): number;

declare const enum MIDIProgramChangeOptions {

	kMIDIProgramChangeBankValid = 1
}

declare const enum MIDIProtocolID {

	kMIDIProtocol_1_0 = 1,

	kMIDIProtocol_2_0 = 2
}

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDIReceived(src: number, pktlist: interop.Pointer | interop.Reference<MIDIPacketList>): number;

/**
 * @since 14.0
 */
declare function MIDIReceivedEventList(src: number, evtlist: interop.Pointer | interop.Reference<MIDIEventList>): number;

/**
 * @since 4.2
 */
declare function MIDIRestart(): number;

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDISend(port: number, dest: number, pktlist: interop.Pointer | interop.Reference<MIDIPacketList>): number;

/**
 * @since 14.0
 */
declare function MIDISendEventList(port: number, dest: number, evtlist: interop.Pointer | interop.Reference<MIDIEventList>): number;

/**
 * @since 4.2
 */
declare function MIDISendSysex(request: interop.Pointer | interop.Reference<MIDISysexSendRequest>): number;

/**
 * @since 17.0
 */
declare function MIDISendUMPSysex(umpRequest: interop.Pointer | interop.Reference<MIDISysexSendRequestUMP>): number;

/**
 * @since 17.0
 */
declare function MIDISendUMPSysex8(umpRequest: interop.Pointer | interop.Reference<MIDISysexSendRequestUMP>): number;

/**
 * @since 4.2
 */
declare function MIDISetupAddDevice(device: number): number;

/**
 * @since 4.2
 */
declare function MIDISetupAddExternalDevice(device: number): number;

/**
 * @since 4.2
 */
declare function MIDISetupRemoveDevice(device: number): number;

/**
 * @since 4.2
 */
declare function MIDISetupRemoveExternalDevice(device: number): number;

/**
 * @since 4.2
 * @deprecated 100000
 */
declare function MIDISourceCreate(client: number, name: string, outSrc: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 14.0
 */
declare function MIDISourceCreateWithProtocol(client: number, name: string, protocol: MIDIProtocolID, outSrc: interop.Pointer | interop.Reference<number>): number;

declare const enum MIDISysExStatus {

	kMIDISysExStatusComplete = 0,

	kMIDISysExStatusStart = 1,

	kMIDISysExStatusContinue = 2,

	kMIDISysExStatusEnd = 3,

	kMIDISysExStatusMixedDataSetHeader = 8,

	kMIDISysExStatusMixedDataSetPayload = 9
}

interface MIDISysexSendRequest {
	destination: number;
	data: interop.Pointer | interop.Reference<any>;
	bytesToSend: number;
	complete: boolean;
	reserved: interop.Reference<number>;
	completionProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<MIDISysexSendRequest>) => void>;
	completionRefCon: interop.Pointer | interop.Reference<any>;
}
declare var MIDISysexSendRequest: interop.StructType<MIDISysexSendRequest>;

interface MIDISysexSendRequestUMP {
	destination: number;
	words: interop.Pointer | interop.Reference<number>;
	wordsToSend: number;
	complete: boolean;
	completionProc: interop.FunctionReference<(p1: interop.Pointer | interop.Reference<MIDISysexSendRequestUMP>) => void>;
	completionRefCon: interop.Pointer | interop.Reference<any>;
}
declare var MIDISysexSendRequestUMP: interop.StructType<MIDISysexSendRequestUMP>;

declare const enum MIDISystemStatus {

	kMIDIStatusStartOfExclusive = 240,

	kMIDIStatusEndOfExclusive = 247,

	kMIDIStatusMTC = 241,

	kMIDIStatusSongPosPointer = 242,

	kMIDIStatusSongSelect = 243,

	kMIDIStatusTuneRequest = 246,

	kMIDIStatusTimingClock = 248,

	kMIDIStatusStart = 250,

	kMIDIStatusContinue = 251,

	kMIDIStatusStop = 252,

	kMIDIStatusActiveSending = 254,

	kMIDIStatusActiveSensing = 254,

	kMIDIStatusSystemReset = 255
}

/**
 * @since 4.2
 */
declare function MIDIThruConnectionCreate(inPersistentOwnerID: string, inConnectionParams: NSData, outConnection: interop.Pointer | interop.Reference<number>): number;

/**
 * @since 4.2
 */
declare function MIDIThruConnectionDispose(connection: number): number;

interface MIDIThruConnectionEndpoint {
	endpointRef: number;
	uniqueID: number;
}
declare var MIDIThruConnectionEndpoint: interop.StructType<MIDIThruConnectionEndpoint>;

/**
 * @since 4.2
 */
declare function MIDIThruConnectionFind(inPersistentOwnerID: string, outConnectionList: interop.Pointer | interop.Reference<NSData>): number;

/**
 * @since 4.2
 */
declare function MIDIThruConnectionGetParams(connection: number, outConnectionParams: interop.Pointer | interop.Reference<NSData>): number;

interface MIDIThruConnectionParams {
	version: number;
	numSources: number;
	sources: interop.Reference<MIDIThruConnectionEndpoint>;
	numDestinations: number;
	destinations: interop.Reference<MIDIThruConnectionEndpoint>;
	channelMap: interop.Reference<number>;
	lowVelocity: number;
	highVelocity: number;
	lowNote: number;
	highNote: number;
	noteNumber: MIDITransform;
	velocity: MIDITransform;
	keyPressure: MIDITransform;
	channelPressure: MIDITransform;
	programChange: MIDITransform;
	pitchBend: MIDITransform;
	filterOutSysEx: number;
	filterOutMTC: number;
	filterOutBeatClock: number;
	filterOutTuneRequest: number;
	reserved2: interop.Reference<number>;
	filterOutAllControls: number;
	numControlTransforms: number;
	numMaps: number;
	reserved3: interop.Reference<number>;
}
declare var MIDIThruConnectionParams: interop.StructType<MIDIThruConnectionParams>;

/**
 * @since 4.2
 */
declare function MIDIThruConnectionParamsInitialize(inConnectionParams: interop.Pointer | interop.Reference<MIDIThruConnectionParams>): void;

/**
 * @since 4.2
 */
declare function MIDIThruConnectionSetParams(connection: number, inConnectionParams: NSData): number;

interface MIDITransform {
	transform: MIDITransformType;
	param: number;
}
declare var MIDITransform: interop.StructType<MIDITransform>;

declare const enum MIDITransformControlType {

	kMIDIControlType_7Bit = 0,

	kMIDIControlType_14Bit = 1,

	kMIDIControlType_7BitRPN = 2,

	kMIDIControlType_14BitRPN = 3,

	kMIDIControlType_7BitNRPN = 4,

	kMIDIControlType_14BitNRPN = 5
}

declare const enum MIDITransformType {

	kMIDITransform_None = 0,

	kMIDITransform_FilterOut = 1,

	kMIDITransform_MapControl = 2,

	kMIDITransform_Add = 8,

	kMIDITransform_Scale = 9,

	kMIDITransform_MinValue = 10,

	kMIDITransform_MaxValue = 11,

	kMIDITransform_MapValue = 12
}

declare const enum MIDIUMPCIObjectBackingType {

	kMIDIUMPCIObjectBackingTypeUnknown = 0,

	kMIDIUMPCIObjectBackingTypeVirtual = 1,

	kMIDIUMPCIObjectBackingTypeDriverDevice = 2,

	kMIDIUMPCIObjectBackingTypeUSBMIDI = 3
}

/**
 * @since 18.0
 */
declare class MIDIUMPCIProfile extends NSObject {

	static alloc(): MIDIUMPCIProfile; // inherited from NSObject

	static new(): MIDIUMPCIProfile; // inherited from NSObject

	readonly enabledChannelCount: number;

	readonly firstChannel: number;

	readonly groupOffset: number;

	readonly isEnabled: boolean;

	readonly name: string;

	readonly profileType: MIDICIProfileType;

	readonly totalChannelCount: number;

	setProfileStateEnabledChannelCountError(isEnabled: boolean, enabledChannelCount: number): boolean;
}

/**
 * @since 18.0
 */
declare class MIDIUMPEndpoint extends NSObject {

	static alloc(): MIDIUMPEndpoint; // inherited from NSObject

	static new(): MIDIUMPEndpoint; // inherited from NSObject

	readonly MIDIDestination: number;

	readonly MIDIProtocol: MIDIProtocolID;

	readonly MIDISource: number;

	readonly deviceInfo: MIDI2DeviceInfo;

	readonly endpointType: MIDIUMPCIObjectBackingType;

	functionBlocks: NSArray<MIDIUMPFunctionBlock>;

	readonly hasJRTSReceiveCapability: boolean;

	readonly hasJRTSTransmitCapability: boolean;

	readonly hasStaticFunctionBlocks: boolean;

	readonly name: string;

	readonly productInstanceID: string;

	readonly supportedMIDIProtocols: MIDIUMPProtocolOptions;
}

/**
 * @since 18.0
 */
declare class MIDIUMPEndpointManager extends NSObject {

	static alloc(): MIDIUMPEndpointManager; // inherited from NSObject

	static new(): MIDIUMPEndpointManager; // inherited from NSObject

	readonly UMPEndpoints: NSArray<MIDIUMPEndpoint>;

	static readonly sharedInstance: MIDIUMPEndpointManager;
}

/**
 * @since 18.0
 */
declare var MIDIUMPEndpointObjectKey: string;

/**
 * @since 18.0
 */
declare var MIDIUMPEndpointWasAddedNotification: string;

/**
 * @since 18.0
 */
declare var MIDIUMPEndpointWasRemovedNotification: string;

/**
 * @since 18.0
 */
declare var MIDIUMPEndpointWasUpdatedNotification: string;

/**
 * @since 18.0
 */
declare class MIDIUMPFunctionBlock extends NSObject {

	static alloc(): MIDIUMPFunctionBlock; // inherited from NSObject

	static new(): MIDIUMPFunctionBlock; // inherited from NSObject

	readonly MIDI1Info: MIDIUMPFunctionBlockMIDI1Info;

	readonly UIHint: MIDIUMPFunctionBlockUIHint;

	readonly UMPEndpoint: MIDIUMPEndpoint;

	readonly direction: MIDIUMPFunctionBlockDirection;

	readonly firstGroup: number;

	readonly functionBlockID: number;

	readonly isEnabled: boolean;

	readonly maxSysEx8Streams: number;

	readonly midiCIDevice: MIDICIDevice;

	readonly name: string;

	readonly totalGroupsSpanned: number;
}

declare const enum MIDIUMPFunctionBlockDirection {

	kMIDIUMPFunctionBlockDirectionUnknown = 0,

	kMIDIUMPFunctionBlockDirectionInput = 1,

	kMIDIUMPFunctionBlockDirectionOutput = 2,

	kMIDIUMPFunctionBlockDirectionBidirectional = 3
}

declare const enum MIDIUMPFunctionBlockMIDI1Info {

	kMIDIUMPFunctionBlockMIDI1InfoNotMIDI1 = 0,

	kMIDIUMPFunctionBlockMIDI1InfoUnrestrictedBandwidth = 1,

	kMIDIUMPFunctionBlockMIDI1InfoRestrictedBandwidth = 2
}

/**
 * @since 18.0
 */
declare var MIDIUMPFunctionBlockObjectKey: string;

declare const enum MIDIUMPFunctionBlockUIHint {

	kMIDIUMPFunctionBlockUIHintUnknown = 0,

	kMIDIUMPFunctionBlockUIHintReceiver = 1,

	kMIDIUMPFunctionBlockUIHintSender = 2,

	kMIDIUMPFunctionBlockUIHintSenderReceiver = 3
}

/**
 * @since 18.0
 */
declare var MIDIUMPFunctionBlockWasUpdatedNotification: string;

/**
 * @since 18.0
 */
declare class MIDIUMPMutableEndpoint extends MIDIUMPEndpoint {

	static alloc(): MIDIUMPMutableEndpoint; // inherited from NSObject

	static new(): MIDIUMPMutableEndpoint; // inherited from NSObject

	readonly isEnabled: boolean;

	mutableFunctionBlocks: NSArray<MIDIUMPMutableFunctionBlock>;

	constructor(o: { name: string; deviceInfo: MIDI2DeviceInfo; productInstanceID: string; MIDIProtocol: MIDIProtocolID; destinationCallback: (p1: interop.Pointer | interop.Reference<MIDIEventList>, p2: interop.Pointer | interop.Reference<any>) => void; });

	initWithNameDeviceInfoProductInstanceIDMIDIProtocolDestinationCallback(name: string, deviceInfo: MIDI2DeviceInfo, productInstanceID: string, MIDIProtocol: MIDIProtocolID, destinationCallback: (p1: interop.Pointer | interop.Reference<MIDIEventList>, p2: interop.Pointer | interop.Reference<any>) => void): this;

	registerFunctionBlocksMarkAsStaticError(functionBlocks: NSArray<MIDIUMPMutableFunctionBlock> | MIDIUMPMutableFunctionBlock[], markAsStatic: boolean): boolean;

	setEnabledError(isEnabled: boolean): boolean;

	setNameError(name: string): boolean;
}

/**
 * @since 18.0
 */
declare class MIDIUMPMutableFunctionBlock extends MIDIUMPFunctionBlock {

	static alloc(): MIDIUMPMutableFunctionBlock; // inherited from NSObject

	static new(): MIDIUMPMutableFunctionBlock; // inherited from NSObject

	readonly UMPEndpoint: MIDIUMPMutableEndpoint;

	constructor(o: { name: string; direction: MIDIUMPFunctionBlockDirection; firstGroup: number; totalGroupsSpanned: number; maxSysEx8Streams: number; MIDI1Info: MIDIUMPFunctionBlockMIDI1Info; UIHint: MIDIUMPFunctionBlockUIHint; isEnabled: boolean; });

	initWithNameDirectionFirstGroupTotalGroupsSpannedMaxSysEx8StreamsMIDI1InfoUIHintIsEnabled(name: string, direction: MIDIUMPFunctionBlockDirection, firstGroup: number, totalGroupsSpanned: number, maxSysEx8Streams: number, MIDI1Info: MIDIUMPFunctionBlockMIDI1Info, UIHint: MIDIUMPFunctionBlockUIHint, isEnabled: boolean): this;

	reconfigureWithFirstGroupDirectionMIDI1InfoUIHintError(firstGroup: number, direction: MIDIUMPFunctionBlockDirection, MIDI1Info: MIDIUMPFunctionBlockMIDI1Info, UIHint: MIDIUMPFunctionBlockUIHint): boolean;

	setEnabledError(isEnabled: boolean): boolean;

	setNameError(name: string): boolean;
}

declare const enum MIDIUMPProtocolOptions {

	kMIDIUMPProtocolOptionsMIDI1 = 1,

	kMIDIUMPProtocolOptionsMIDI2 = 2
}

declare const enum MIDIUtilityStatus {

	kMIDIUtilityStatusNOOP = 0,

	kMIDIUtilityStatusJitterReductionClock = 1,

	kMIDIUtilityStatusJitterReductionTimestamp = 2,

	kMIDIUtilityStatusDeltaClockstampTicksPerQuarterNote = 3,

	kMIDIUtilityStatusTicksSinceLastEvent = 4
}

interface MIDIValueMap {
	value: interop.Reference<number>;
}
declare var MIDIValueMap: interop.StructType<MIDIValueMap>;

declare const enum UMPStreamMessageFormat {

	kUMPStreamMessageFormatComplete = 0,

	kUMPStreamMessageFormatStart = 1,

	kUMPStreamMessageFormatContinuing = 2,

	kUMPStreamMessageFormatEnd = 3
}

declare const enum UMPStreamMessageStatus {

	kUMPStreamMessageStatusEndpointDiscovery = 0,

	kUMPStreamMessageStatusEndpointInfoNotification = 1,

	kUMPStreamMessageStatusDeviceIdentityNotification = 2,

	kUMPStreamMessageStatusEndpointNameNotification = 3,

	kUMPStreamMessageStatusProductInstanceIDNotification = 4,

	kUMPStreamMessageStatusStreamConfigurationRequest = 5,

	kUMPStreamMessageStatusStreamConfigurationNotification = 6,

	kUMPStreamMessageStatusFunctionBlockDiscovery = 16,

	kUMPStreamMessageStatusFunctionBlockInfoNotification = 17,

	kUMPStreamMessageStatusFunctionBlockNameNotification = 18,

	kUMPStreamMessageStatusStartOfClip = 32,

	kUMPStreamMessageStatusEndOfClip = 33
}

declare var kMIDI1UPMaxSysexSize: number;

declare var kMIDICIPropertyExchangeBadRequestID: number;

declare var kMIDIDeviceIDFunctionBlock: number;

declare var kMIDIDeviceIDUMPGroup: number;

declare const kMIDIIDNotUnique: number;

declare const kMIDIInvalidClient: number;

declare const kMIDIInvalidPort: number;

declare const kMIDIInvalidUniqueID: number;

declare const kMIDIMessageSendErr: number;

declare const kMIDINoConnection: number;

declare const kMIDINoCurrentSetup: number;

declare const kMIDINotPermitted: number;

declare const kMIDIObjectNotFound: number;

declare var kMIDIObjectType_ExternalMask: MIDIObjectType;

/**
 * @since 4.2
 */
declare var kMIDIPropertyAdvanceScheduleTimeMuSec: string;

/**
 * @since 18.0
 */
declare var kMIDIPropertyAssociatedEndpoint: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyCanRoute: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyConnectionUniqueID: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyDeviceID: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyDisplayName: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyDriverDeviceEditorApp: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyDriverOwner: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyDriverVersion: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyImage: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyIsBroadcast: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyIsDrumMachine: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyIsEffectUnit: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyIsEmbeddedEntity: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyIsMixer: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyIsSampler: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyManufacturer: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyMaxReceiveChannels: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyMaxSysExSpeed: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyMaxTransmitChannels: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyModel: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyName: string;

/**
 * @since 4.2
 * @deprecated 13.0
 */
declare var kMIDIPropertyNameConfiguration: string;

/**
 * @since 13.0
 */
declare var kMIDIPropertyNameConfigurationDictionary: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyOffline: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyPanDisruptsStereo: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyPrivate: string;

/**
 * @since 14.0
 */
declare var kMIDIPropertyProtocolID: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyReceiveChannels: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyReceivesBankSelectLSB: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyReceivesBankSelectMSB: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyReceivesClock: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyReceivesMTC: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyReceivesNotes: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyReceivesProgramChanges: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertySingleRealtimeEntity: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertySupportsGeneralMIDI: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertySupportsMMC: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertySupportsShowControl: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyTransmitChannels: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyTransmitsBankSelectLSB: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyTransmitsBankSelectMSB: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyTransmitsClock: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyTransmitsMTC: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyTransmitsNotes: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyTransmitsProgramChanges: string;

/**
 * @since 17.0
 */
declare var kMIDIPropertyUMPActiveGroupBitmap: string;

/**
 * @since 17.0
 */
declare var kMIDIPropertyUMPCanTransmitGroupless: string;

/**
 * @since 4.2
 */
declare var kMIDIPropertyUniqueID: string;

declare const kMIDIServerStartErr: number;

declare const kMIDISetupFormatErr: number;

declare const kMIDIThruConnection_MaxEndpoints: number;

declare var kMIDIUInteger14Max: number;

declare var kMIDIUInteger28Max: number;

declare var kMIDIUInteger2Max: number;

declare var kMIDIUInteger4Max: number;

declare var kMIDIUInteger7Max: number;

declare const kMIDIUnknownEndpoint: number;

declare const kMIDIUnknownError: number;

declare const kMIDIUnknownProperty: number;

declare const kMIDIWrongEndpointType: number;

declare const kMIDIWrongPropertyType: number;

declare const kMIDIWrongThread: number;
