
declare function MIDIClientCreate(name: string, notifyProc: interop.FunctionReference<(p1: interop.Reference<MIDINotification>, p2: interop.Pointer) => void>, notifyRefCon: interop.Pointer, outClient: interop.Reference<number>): number;

declare function MIDIClientCreateWithBlock(name: string, outClient: interop.Reference<number>, notifyBlock: (p1: interop.Reference<MIDINotification>) => void): number;

declare function MIDIClientDispose(client: number): number;

interface MIDIControlTransform {
	controlType: MIDITransformControlType;
	remappedControlType: MIDITransformControlType;
	controlNumber: number;
	transform: MIDITransformType;
	param: number;
}
declare var MIDIControlTransform: interop.StructType<MIDIControlTransform>;

declare function MIDIDestinationCreate(client: number, name: string, readProc: interop.FunctionReference<(p1: interop.Reference<MIDIPacketList>, p2: interop.Pointer, p3: interop.Pointer) => void>, refCon: interop.Pointer, outDest: interop.Reference<number>): number;

declare function MIDIDestinationCreateWithBlock(client: number, name: string, outDest: interop.Reference<number>, readBlock: (p1: interop.Reference<MIDIPacketList>, p2: interop.Pointer) => void): number;

declare function MIDIDeviceAddEntity(device: number, name: string, embedded: boolean, numSourceEndpoints: number, numDestinationEndpoints: number, newEntity: interop.Reference<number>): number;

declare function MIDIDeviceCreate(owner: interop.Reference<interop.Reference<MIDIDriverInterface>>, name: string, manufacturer: string, model: string, outDevice: interop.Reference<number>): number;

declare function MIDIDeviceDispose(device: number): number;

declare function MIDIDeviceGetEntity(device: number, entityIndex0: number): number;

declare function MIDIDeviceGetNumberOfEntities(device: number): number;

declare function MIDIDeviceListAddDevice(devList: number, dev: number): number;

declare function MIDIDeviceListDispose(devList: number): number;

declare function MIDIDeviceListGetDevice(devList: number, index0: number): number;

declare function MIDIDeviceListGetNumberOfDevices(devList: number): number;

declare function MIDIDeviceRemoveEntity(device: number, entity: number): number;

interface MIDIDriverInterface {
	_reserved: interop.Pointer;
	QueryInterface: interop.FunctionReference<(p1: interop.Pointer, p2: CFUUIDBytes, p3: interop.Reference<interop.Pointer>) => number>;
	AddRef: interop.FunctionReference<(p1: interop.Pointer) => number>;
	Release: interop.FunctionReference<(p1: interop.Pointer) => number>;
	FindDevices: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>, p2: number) => number>;
	Start: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>, p2: number) => number>;
	Stop: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>) => number>;
	Configure: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>, p2: number) => number>;
	Send: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>, p2: interop.Reference<MIDIPacketList>, p3: interop.Pointer, p4: interop.Pointer) => number>;
	EnableSource: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>, p2: number, p3: boolean) => number>;
	Flush: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>, p2: number, p3: interop.Pointer, p4: interop.Pointer) => number>;
	Monitor: interop.FunctionReference<(p1: interop.Reference<interop.Reference<MIDIDriverInterface>>, p2: number, p3: interop.Reference<MIDIPacketList>) => number>;
}
declare var MIDIDriverInterface: interop.StructType<MIDIDriverInterface>;

declare function MIDIEndpointDispose(endpt: number): number;

declare function MIDIEndpointGetEntity(inEndpoint: number, outEntity: interop.Reference<number>): number;

declare function MIDIEndpointGetRefCons(endpt: number, ref1: interop.Reference<interop.Pointer>, ref2: interop.Reference<interop.Pointer>): number;

declare function MIDIEndpointSetRefCons(endpt: number, ref1: interop.Pointer, ref2: interop.Pointer): number;

declare function MIDIEntityAddOrRemoveEndpoints(entity: number, numSourceEndpoints: number, numDestinationEndpoints: number): number;

declare function MIDIEntityGetDestination(entity: number, destIndex0: number): number;

declare function MIDIEntityGetDevice(inEntity: number, outDevice: interop.Reference<number>): number;

declare function MIDIEntityGetNumberOfDestinations(entity: number): number;

declare function MIDIEntityGetNumberOfSources(entity: number): number;

declare function MIDIEntityGetSource(entity: number, sourceIndex0: number): number;

declare function MIDIExternalDeviceCreate(name: string, manufacturer: string, model: string, outDevice: interop.Reference<number>): number;

declare function MIDIFlushOutput(dest: number): number;

declare function MIDIGetDestination(destIndex0: number): number;

declare function MIDIGetDevice(deviceIndex0: number): number;

declare function MIDIGetDriverDeviceList(driver: interop.Reference<interop.Reference<MIDIDriverInterface>>): number;

declare function MIDIGetDriverIORunLoop(): interop.Unmanaged<any>;

declare function MIDIGetExternalDevice(deviceIndex0: number): number;

declare function MIDIGetNumberOfDestinations(): number;

declare function MIDIGetNumberOfDevices(): number;

declare function MIDIGetNumberOfExternalDevices(): number;

declare function MIDIGetNumberOfSources(): number;

declare function MIDIGetSource(sourceIndex0: number): number;

interface MIDIIOErrorNotification {
	messageID: MIDINotificationMessageID;
	messageSize: number;
	driverDevice: number;
	errorCode: number;
}
declare var MIDIIOErrorNotification: interop.StructType<MIDIIOErrorNotification>;

declare function MIDIInputPortCreate(client: number, portName: string, readProc: interop.FunctionReference<(p1: interop.Reference<MIDIPacketList>, p2: interop.Pointer, p3: interop.Pointer) => void>, refCon: interop.Pointer, outPort: interop.Reference<number>): number;

declare function MIDIInputPortCreateWithBlock(client: number, portName: string, outPort: interop.Reference<number>, readBlock: (p1: interop.Reference<MIDIPacketList>, p2: interop.Pointer) => void): number;

declare var MIDINetworkBonjourServiceType: string;

declare class MIDINetworkConnection extends NSObject {

	static alloc(): MIDINetworkConnection; // inherited from NSObject

	static connectionWithHost(host: MIDINetworkHost): MIDINetworkConnection;

	static new(): MIDINetworkConnection; // inherited from NSObject

	/* readonly */ host: MIDINetworkHost;

	constructor(); // inherited from NSObject

	self(): MIDINetworkConnection; // inherited from NSObjectProtocol
}

declare const enum MIDINetworkConnectionPolicy {

	NoOne = 0,

	HostsInContactList = 1,

	Anyone = 2
}

declare class MIDINetworkHost extends NSObject {

	static alloc(): MIDINetworkHost; // inherited from NSObject

	static hostWithNameAddressPort(name: string, address: string, port: number): MIDINetworkHost;

	static hostWithNameNetService(name: string, netService: NSNetService): MIDINetworkHost;

	static hostWithNameNetServiceNameNetServiceDomain(name: string, netServiceName: string, netServiceDomain: string): MIDINetworkHost;

	static new(): MIDINetworkHost; // inherited from NSObject

	/* readonly */ address: string;

	/* readonly */ name: string;

	/* readonly */ netServiceDomain: string;

	/* readonly */ netServiceName: string;

	/* readonly */ port: number;

	constructor(); // inherited from NSObject

	hasSameAddressAs(other: MIDINetworkHost): boolean;

	self(): MIDINetworkHost; // inherited from NSObjectProtocol
}

declare var MIDINetworkNotificationContactsDidChange: string;

declare var MIDINetworkNotificationSessionDidChange: string;

declare class MIDINetworkSession extends NSObject {

	static alloc(): MIDINetworkSession; // inherited from NSObject

	static defaultSession(): MIDINetworkSession;

	static new(): MIDINetworkSession; // inherited from NSObject

	connectionPolicy: MIDINetworkConnectionPolicy;

	enabled: boolean;

	/* readonly */ localName: string;

	/* readonly */ networkName: string;

	/* readonly */ networkPort: number;

	constructor(); // inherited from NSObject

	addConnection(connection: MIDINetworkConnection): boolean;

	addContact(contact: MIDINetworkHost): boolean;

	connections(): NSSet<MIDINetworkConnection>;

	contacts(): NSSet<MIDINetworkHost>;

	destinationEndpoint(): number;

	removeConnection(connection: MIDINetworkConnection): boolean;

	removeContact(contact: MIDINetworkHost): boolean;

	self(): MIDINetworkSession; // inherited from NSObjectProtocol

	sourceEndpoint(): number;
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

	kMIDIMsgIOError = 7
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

declare function MIDIObjectFindByUniqueID(inUniqueID: number, outObject: interop.Reference<number>, outObjectType: interop.Reference<MIDIObjectType>): number;

declare function MIDIObjectGetDataProperty(obj: number, propertyID: string, outData: interop.Reference<NSData>): number;

declare function MIDIObjectGetDictionaryProperty(obj: number, propertyID: string, outDict: interop.Reference<NSDictionary<any, any>>): number;

declare function MIDIObjectGetIntegerProperty(obj: number, propertyID: string, outValue: interop.Reference<number>): number;

declare function MIDIObjectGetProperties(obj: number, outProperties: interop.Reference<any>, deep: boolean): number;

declare function MIDIObjectGetStringProperty(obj: number, propertyID: string, str: interop.Reference<string>): number;

interface MIDIObjectPropertyChangeNotification {
	messageID: MIDINotificationMessageID;
	messageSize: number;
	object: number;
	objectType: MIDIObjectType;
	propertyName: string;
}
declare var MIDIObjectPropertyChangeNotification: interop.StructType<MIDIObjectPropertyChangeNotification>;

declare function MIDIObjectRemoveProperty(obj: number, propertyID: string): number;

declare function MIDIObjectSetDataProperty(obj: number, propertyID: string, data: NSData): number;

declare function MIDIObjectSetDictionaryProperty(obj: number, propertyID: string, dict: NSDictionary<any, any>): number;

declare function MIDIObjectSetIntegerProperty(obj: number, propertyID: string, value: number): number;

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

declare function MIDIOutputPortCreate(client: number, portName: string, outPort: interop.Reference<number>): number;

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

declare function MIDIPacketListAdd(pktlist: interop.Reference<MIDIPacketList>, listSize: number, curPacket: interop.Reference<MIDIPacket>, time: number, nData: number, data: string): interop.Reference<MIDIPacket>;

declare function MIDIPacketListInit(pktlist: interop.Reference<MIDIPacketList>): interop.Reference<MIDIPacket>;

declare function MIDIPortConnectSource(port: number, source: number, connRefCon: interop.Pointer): number;

declare function MIDIPortDisconnectSource(port: number, source: number): number;

declare function MIDIPortDispose(port: number): number;

declare function MIDIReceived(src: number, pktlist: interop.Reference<MIDIPacketList>): number;

declare function MIDIRestart(): number;

declare function MIDISend(port: number, dest: number, pktlist: interop.Reference<MIDIPacketList>): number;

declare function MIDISendSysex(request: interop.Reference<MIDISysexSendRequest>): number;

declare function MIDISetupAddDevice(device: number): number;

declare function MIDISetupAddExternalDevice(device: number): number;

declare function MIDISetupRemoveDevice(device: number): number;

declare function MIDISetupRemoveExternalDevice(device: number): number;

declare function MIDISourceCreate(client: number, name: string, outSrc: interop.Reference<number>): number;

interface MIDISysexSendRequest {
	destination: number;
	data: string;
	bytesToSend: number;
	complete: boolean;
	reserved: interop.Reference<number>;
	completionProc: interop.FunctionReference<(p1: interop.Reference<MIDISysexSendRequest>) => void>;
	completionRefCon: interop.Pointer;
}
declare var MIDISysexSendRequest: interop.StructType<MIDISysexSendRequest>;

declare function MIDIThruConnectionCreate(inPersistentOwnerID: string, inConnectionParams: NSData, outConnection: interop.Reference<number>): number;

declare function MIDIThruConnectionDispose(connection: number): number;

interface MIDIThruConnectionEndpoint {
	endpointRef: number;
	uniqueID: number;
}
declare var MIDIThruConnectionEndpoint: interop.StructType<MIDIThruConnectionEndpoint>;

declare function MIDIThruConnectionFind(inPersistentOwnerID: string, outConnectionList: interop.Reference<NSData>): number;

declare function MIDIThruConnectionGetParams(connection: number, outConnectionParams: interop.Reference<NSData>): number;

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

declare function MIDIThruConnectionParamsInitialize(inConnectionParams: interop.Reference<MIDIThruConnectionParams>): void;

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

interface MIDIValueMap {
	value: interop.Reference<number>;
}
declare var MIDIValueMap: interop.StructType<MIDIValueMap>;

declare var kMIDIObjectType_ExternalMask: MIDIObjectType;

declare var kMIDIPropertyAdvanceScheduleTimeMuSec: string;

declare var kMIDIPropertyCanRoute: string;

declare var kMIDIPropertyConnectionUniqueID: string;

declare var kMIDIPropertyDeviceID: string;

declare var kMIDIPropertyDisplayName: string;

declare var kMIDIPropertyDriverDeviceEditorApp: string;

declare var kMIDIPropertyDriverOwner: string;

declare var kMIDIPropertyDriverVersion: string;

declare var kMIDIPropertyImage: string;

declare var kMIDIPropertyIsBroadcast: string;

declare var kMIDIPropertyIsDrumMachine: string;

declare var kMIDIPropertyIsEffectUnit: string;

declare var kMIDIPropertyIsEmbeddedEntity: string;

declare var kMIDIPropertyIsMixer: string;

declare var kMIDIPropertyIsSampler: string;

declare var kMIDIPropertyManufacturer: string;

declare var kMIDIPropertyMaxReceiveChannels: string;

declare var kMIDIPropertyMaxSysExSpeed: string;

declare var kMIDIPropertyMaxTransmitChannels: string;

declare var kMIDIPropertyModel: string;

declare var kMIDIPropertyName: string;

declare var kMIDIPropertyNameConfiguration: string;

declare var kMIDIPropertyOffline: string;

declare var kMIDIPropertyPanDisruptsStereo: string;

declare var kMIDIPropertyPrivate: string;

declare var kMIDIPropertyReceiveChannels: string;

declare var kMIDIPropertyReceivesBankSelectLSB: string;

declare var kMIDIPropertyReceivesBankSelectMSB: string;

declare var kMIDIPropertyReceivesClock: string;

declare var kMIDIPropertyReceivesMTC: string;

declare var kMIDIPropertyReceivesNotes: string;

declare var kMIDIPropertyReceivesProgramChanges: string;

declare var kMIDIPropertySingleRealtimeEntity: string;

declare var kMIDIPropertySupportsGeneralMIDI: string;

declare var kMIDIPropertySupportsMMC: string;

declare var kMIDIPropertySupportsShowControl: string;

declare var kMIDIPropertyTransmitChannels: string;

declare var kMIDIPropertyTransmitsBankSelectLSB: string;

declare var kMIDIPropertyTransmitsBankSelectMSB: string;

declare var kMIDIPropertyTransmitsClock: string;

declare var kMIDIPropertyTransmitsMTC: string;

declare var kMIDIPropertyTransmitsNotes: string;

declare var kMIDIPropertyTransmitsProgramChanges: string;

declare var kMIDIPropertyUniqueID: string;
