
declare const enum CBATTError {

	Success = 0,

	InvalidHandle = 1,

	ReadNotPermitted = 2,

	WriteNotPermitted = 3,

	InvalidPdu = 4,

	InsufficientAuthentication = 5,

	RequestNotSupported = 6,

	InvalidOffset = 7,

	InsufficientAuthorization = 8,

	PrepareQueueFull = 9,

	AttributeNotFound = 10,

	AttributeNotLong = 11,

	InsufficientEncryptionKeySize = 12,

	InvalidAttributeValueLength = 13,

	UnlikelyError = 14,

	InsufficientEncryption = 15,

	UnsupportedGroupType = 16,

	InsufficientResources = 17
}

declare var CBATTErrorDomain: string;

declare class CBATTRequest extends NSObject {

	static alloc(): CBATTRequest; // inherited from NSObject

	static new(): CBATTRequest; // inherited from NSObject

	/* readonly */ central: CBCentral;

	/* readonly */ characteristic: CBCharacteristic;

	/* readonly */ offset: number;

	value: NSData;

	constructor(); // inherited from NSObject

	self(): CBATTRequest; // inherited from NSObjectProtocol
}

declare var CBAdvertisementDataIsConnectable: string;

declare var CBAdvertisementDataLocalNameKey: string;

declare var CBAdvertisementDataManufacturerDataKey: string;

declare var CBAdvertisementDataOverflowServiceUUIDsKey: string;

declare var CBAdvertisementDataServiceDataKey: string;

declare var CBAdvertisementDataServiceUUIDsKey: string;

declare var CBAdvertisementDataSolicitedServiceUUIDsKey: string;

declare var CBAdvertisementDataTxPowerLevelKey: string;

declare class CBAttribute extends NSObject {

	static alloc(): CBAttribute; // inherited from NSObject

	static new(): CBAttribute; // inherited from NSObject

	/* readonly */ UUID: CBUUID;

	constructor(); // inherited from NSObject

	self(): CBAttribute; // inherited from NSObjectProtocol
}

declare const enum CBAttributePermissions {

	Readable = 1,

	Writeable = 2,

	ReadEncryptionRequired = 4,

	WriteEncryptionRequired = 8
}

declare class CBCentral extends CBPeer {

	/* readonly */ maximumUpdateValueLength: number;
}

declare class CBCentralManager extends NSObject {

	static alloc(): CBCentralManager; // inherited from NSObject

	static new(): CBCentralManager; // inherited from NSObject

	delegate: CBCentralManagerDelegate;

	/* readonly */ isScanning: boolean;

	/* readonly */ state: CBCentralManagerState;

	constructor(); // inherited from NSObject

	constructor(o: { delegate: CBCentralManagerDelegate; queue: NSObject; });

	constructor(o: { delegate: CBCentralManagerDelegate; queue: NSObject; options: NSDictionary<string, any>; });

	cancelPeripheralConnection(peripheral: CBPeripheral): void;

	connectPeripheralOptions(peripheral: CBPeripheral, options: NSDictionary<string, any>): void;

	retrieveConnectedPeripheralsWithServices(serviceUUIDs: NSArray<CBUUID>): NSArray<CBPeripheral>;

	retrievePeripheralsWithIdentifiers(identifiers: NSArray<NSUUID>): NSArray<CBPeripheral>;

	scanForPeripheralsWithServicesOptions(serviceUUIDs: NSArray<CBUUID>, options: NSDictionary<string, any>): void;

	self(): CBCentralManager; // inherited from NSObjectProtocol

	stopScan(): void;
}

interface CBCentralManagerDelegate extends NSObjectProtocol {

	centralManagerDidConnectPeripheral?(central: CBCentralManager, peripheral: CBPeripheral): void;

	centralManagerDidDisconnectPeripheralError?(central: CBCentralManager, peripheral: CBPeripheral, error: NSError): void;

	centralManagerDidDiscoverPeripheralAdvertisementDataRSSI?(central: CBCentralManager, peripheral: CBPeripheral, advertisementData: NSDictionary<string, any>, RSSI: number): void;

	centralManagerDidFailToConnectPeripheralError?(central: CBCentralManager, peripheral: CBPeripheral, error: NSError): void;

	centralManagerDidUpdateState(central: CBCentralManager): void;

	centralManagerWillRestoreState?(central: CBCentralManager, dict: NSDictionary<string, any>): void;
}
declare var CBCentralManagerDelegate: {

	prototype: CBCentralManagerDelegate;
};

declare var CBCentralManagerOptionRestoreIdentifierKey: string;

declare var CBCentralManagerOptionShowPowerAlertKey: string;

declare var CBCentralManagerRestoredStatePeripheralsKey: string;

declare var CBCentralManagerRestoredStateScanOptionsKey: string;

declare var CBCentralManagerRestoredStateScanServicesKey: string;

declare var CBCentralManagerScanOptionAllowDuplicatesKey: string;

declare var CBCentralManagerScanOptionSolicitedServiceUUIDsKey: string;

declare const enum CBCentralManagerState {

	Unknown = 0,

	Resetting = 1,

	Unsupported = 2,

	Unauthorized = 3,

	PoweredOff = 4,

	PoweredOn = 5
}

declare class CBCharacteristic extends CBAttribute {

	/* readonly */ descriptors: NSArray<CBDescriptor>;

	/* readonly */ isBroadcasted: boolean;

	/* readonly */ isNotifying: boolean;

	/* readonly */ properties: CBCharacteristicProperties;

	/* readonly */ service: CBService;

	/* readonly */ value: NSData;
}

declare const enum CBCharacteristicProperties {

	PropertyBroadcast = 1,

	PropertyRead = 2,

	PropertyWriteWithoutResponse = 4,

	PropertyWrite = 8,

	PropertyNotify = 16,

	PropertyIndicate = 32,

	PropertyAuthenticatedSignedWrites = 64,

	PropertyExtendedProperties = 128,

	PropertyNotifyEncryptionRequired = 256,

	PropertyIndicateEncryptionRequired = 512
}

declare const enum CBCharacteristicWriteType {

	WithResponse = 0,

	WithoutResponse = 1
}

declare var CBConnectPeripheralOptionNotifyOnConnectionKey: string;

declare var CBConnectPeripheralOptionNotifyOnDisconnectionKey: string;

declare var CBConnectPeripheralOptionNotifyOnNotificationKey: string;

declare class CBDescriptor extends CBAttribute {

	/* readonly */ characteristic: CBCharacteristic;

	/* readonly */ value: any;
}

declare const enum CBError {

	Unknown = 0,

	InvalidParameters = 1,

	InvalidHandle = 2,

	NotConnected = 3,

	OutOfSpace = 4,

	OperationCancelled = 5,

	ConnectionTimeout = 6,

	PeripheralDisconnected = 7,

	UUIDNotAllowed = 8,

	AlreadyAdvertising = 9,

	ConnectionFailed = 10,

	ConnectionLimitReached = 11
}

declare var CBErrorDomain: string;

declare class CBMutableCharacteristic extends CBCharacteristic {

	descriptors: NSArray<CBDescriptor>;

	permissions: CBAttributePermissions;

	properties: CBCharacteristicProperties;

	/* readonly */ subscribedCentrals: NSArray<CBCentral>;

	value: NSData;

	constructor(o: { type: CBUUID; properties: CBCharacteristicProperties; value: NSData; permissions: CBAttributePermissions; });
}

declare class CBMutableDescriptor extends CBDescriptor {

	constructor(o: { type: CBUUID; value: any; });
}

declare class CBMutableService extends CBService {

	characteristics: NSArray<CBCharacteristic>;

	includedServices: NSArray<CBService>;

	constructor(o: { type: CBUUID; primary: boolean; });
}

declare class CBPeer extends NSObject implements NSCopying {

	static alloc(): CBPeer; // inherited from NSObject

	static new(): CBPeer; // inherited from NSObject

	/* readonly */ identifier: NSUUID;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): CBPeer; // inherited from NSObjectProtocol
}

declare class CBPeripheral extends CBPeer {

	/* readonly */ RSSI: number;

	delegate: CBPeripheralDelegate;

	/* readonly */ name: string;

	/* readonly */ services: NSArray<CBService>;

	/* readonly */ state: CBPeripheralState;

	discoverCharacteristicsForService(characteristicUUIDs: NSArray<CBUUID>, service: CBService): void;

	discoverDescriptorsForCharacteristic(characteristic: CBCharacteristic): void;

	discoverIncludedServicesForService(includedServiceUUIDs: NSArray<CBUUID>, service: CBService): void;

	discoverServices(serviceUUIDs: NSArray<CBUUID>): void;

	maximumWriteValueLengthForType(type: CBCharacteristicWriteType): number;

	readRSSI(): void;

	readValueForCharacteristic(characteristic: CBCharacteristic): void;

	readValueForDescriptor(descriptor: CBDescriptor): void;

	setNotifyValueForCharacteristic(enabled: boolean, characteristic: CBCharacteristic): void;

	writeValueForCharacteristicType(data: NSData, characteristic: CBCharacteristic, type: CBCharacteristicWriteType): void;

	writeValueForDescriptor(data: NSData, descriptor: CBDescriptor): void;
}

interface CBPeripheralDelegate extends NSObjectProtocol {

	peripheralDidDiscoverCharacteristicsForServiceError?(peripheral: CBPeripheral, service: CBService, error: NSError): void;

	peripheralDidDiscoverDescriptorsForCharacteristicError?(peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError): void;

	peripheralDidDiscoverIncludedServicesForServiceError?(peripheral: CBPeripheral, service: CBService, error: NSError): void;

	peripheralDidDiscoverServices?(peripheral: CBPeripheral, error: NSError): void;

	peripheralDidModifyServices?(peripheral: CBPeripheral, invalidatedServices: NSArray<CBService>): void;

	peripheralDidReadRSSIError?(peripheral: CBPeripheral, RSSI: number, error: NSError): void;

	peripheralDidUpdateName?(peripheral: CBPeripheral): void;

	peripheralDidUpdateNotificationStateForCharacteristicError?(peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError): void;

	peripheralDidUpdateRSSIError?(peripheral: CBPeripheral, error: NSError): void;

	peripheralDidUpdateValueForCharacteristicError?(peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError): void;

	peripheralDidUpdateValueForDescriptorError?(peripheral: CBPeripheral, descriptor: CBDescriptor, error: NSError): void;

	peripheralDidWriteValueForCharacteristicError?(peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError): void;

	peripheralDidWriteValueForDescriptorError?(peripheral: CBPeripheral, descriptor: CBDescriptor, error: NSError): void;
}
declare var CBPeripheralDelegate: {

	prototype: CBPeripheralDelegate;
};

declare class CBPeripheralManager extends NSObject {

	static alloc(): CBPeripheralManager; // inherited from NSObject

	static authorizationStatus(): CBPeripheralManagerAuthorizationStatus;

	static new(): CBPeripheralManager; // inherited from NSObject

	delegate: CBPeripheralManagerDelegate;

	/* readonly */ isAdvertising: boolean;

	/* readonly */ state: CBPeripheralManagerState;

	constructor(); // inherited from NSObject

	constructor(o: { delegate: CBPeripheralManagerDelegate; queue: NSObject; });

	constructor(o: { delegate: CBPeripheralManagerDelegate; queue: NSObject; options: NSDictionary<string, any>; });

	addService(service: CBMutableService): void;

	removeAllServices(): void;

	removeService(service: CBMutableService): void;

	respondToRequestWithResult(request: CBATTRequest, result: CBATTError): void;

	self(): CBPeripheralManager; // inherited from NSObjectProtocol

	setDesiredConnectionLatencyForCentral(latency: CBPeripheralManagerConnectionLatency, central: CBCentral): void;

	startAdvertising(advertisementData: NSDictionary<string, any>): void;

	stopAdvertising(): void;

	updateValueForCharacteristicOnSubscribedCentrals(value: NSData, characteristic: CBMutableCharacteristic, centrals: NSArray<CBCentral>): boolean;
}

declare const enum CBPeripheralManagerAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare const enum CBPeripheralManagerConnectionLatency {

	Low = 0,

	Medium = 1,

	High = 2
}

interface CBPeripheralManagerDelegate extends NSObjectProtocol {

	peripheralManagerCentralDidSubscribeToCharacteristic?(peripheral: CBPeripheralManager, central: CBCentral, characteristic: CBCharacteristic): void;

	peripheralManagerCentralDidUnsubscribeFromCharacteristic?(peripheral: CBPeripheralManager, central: CBCentral, characteristic: CBCharacteristic): void;

	peripheralManagerDidAddServiceError?(peripheral: CBPeripheralManager, service: CBService, error: NSError): void;

	peripheralManagerDidReceiveReadRequest?(peripheral: CBPeripheralManager, request: CBATTRequest): void;

	peripheralManagerDidReceiveWriteRequests?(peripheral: CBPeripheralManager, requests: NSArray<CBATTRequest>): void;

	peripheralManagerDidStartAdvertisingError?(peripheral: CBPeripheralManager, error: NSError): void;

	peripheralManagerDidUpdateState(peripheral: CBPeripheralManager): void;

	peripheralManagerIsReadyToUpdateSubscribers?(peripheral: CBPeripheralManager): void;

	peripheralManagerWillRestoreState?(peripheral: CBPeripheralManager, dict: NSDictionary<string, any>): void;
}
declare var CBPeripheralManagerDelegate: {

	prototype: CBPeripheralManagerDelegate;
};

declare var CBPeripheralManagerOptionRestoreIdentifierKey: string;

declare var CBPeripheralManagerOptionShowPowerAlertKey: string;

declare var CBPeripheralManagerRestoredStateAdvertisementDataKey: string;

declare var CBPeripheralManagerRestoredStateServicesKey: string;

declare const enum CBPeripheralManagerState {

	Unknown = 0,

	Resetting = 1,

	Unsupported = 2,

	Unauthorized = 3,

	PoweredOff = 4,

	PoweredOn = 5
}

declare const enum CBPeripheralState {

	Disconnected = 0,

	Connecting = 1,

	Connected = 2,

	Disconnecting = 3
}

declare class CBService extends CBAttribute {

	/* readonly */ characteristics: NSArray<CBCharacteristic>;

	/* readonly */ includedServices: NSArray<CBService>;

	/* readonly */ isPrimary: boolean;

	/* readonly */ peripheral: CBPeripheral;
}

declare class CBUUID extends NSObject implements NSCopying {

	static UUIDWithCFUUID(theUUID: any): CBUUID;

	static UUIDWithData(theData: NSData): CBUUID;

	static UUIDWithNSUUID(theUUID: NSUUID): CBUUID;

	static UUIDWithString(theString: string): CBUUID;

	static alloc(): CBUUID; // inherited from NSObject

	static new(): CBUUID; // inherited from NSObject

	/* readonly */ UUIDString: string;

	/* readonly */ data: NSData;

	constructor(); // inherited from NSObject

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	self(): CBUUID; // inherited from NSObjectProtocol
}

declare var CBUUIDCharacteristicAggregateFormatString: string;

declare var CBUUIDCharacteristicExtendedPropertiesString: string;

declare var CBUUIDCharacteristicFormatString: string;

declare var CBUUIDCharacteristicUserDescriptionString: string;

declare var CBUUIDClientCharacteristicConfigurationString: string;

declare var CBUUIDServerCharacteristicConfigurationString: string;
