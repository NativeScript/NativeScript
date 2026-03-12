
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

/**
 * @since 6.0
 */
declare class CBATTRequest extends NSObject {

	static alloc(): CBATTRequest; // inherited from NSObject

	static new(): CBATTRequest; // inherited from NSObject

	readonly central: CBCentral;

	readonly characteristic: CBCharacteristic;

	readonly offset: number;

	value: NSData;
}

/**
 * @since 7.0
 */
declare var CBAdvertisementDataIsConnectable: string;

declare var CBAdvertisementDataLocalNameKey: string;

declare var CBAdvertisementDataManufacturerDataKey: string;

/**
 * @since 6.0
 */
declare var CBAdvertisementDataOverflowServiceUUIDsKey: string;

declare var CBAdvertisementDataServiceDataKey: string;

declare var CBAdvertisementDataServiceUUIDsKey: string;

/**
 * @since 7.0
 */
declare var CBAdvertisementDataSolicitedServiceUUIDsKey: string;

declare var CBAdvertisementDataTxPowerLevelKey: string;

/**
 * @since 8.0
 */
declare class CBAttribute extends NSObject {

	static alloc(): CBAttribute; // inherited from NSObject

	static new(): CBAttribute; // inherited from NSObject

	readonly UUID: CBUUID;
}

/**
 * @since 6.0
 */
declare const enum CBAttributePermissions {

	Readable = 1,

	Writeable = 2,

	ReadEncryptionRequired = 4,

	WriteEncryptionRequired = 8
}

/**
 * @since 6.0
 */
declare class CBCentral extends CBPeer {

	static alloc(): CBCentral; // inherited from NSObject

	static new(): CBCentral; // inherited from NSObject

	readonly maximumUpdateValueLength: number;
}

/**
 * @since 5.0
 */
declare class CBCentralManager extends CBManager {

	static alloc(): CBCentralManager; // inherited from NSObject

	static new(): CBCentralManager; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static supportsFeatures(features: CBCentralManagerFeature): boolean;

	delegate: CBCentralManagerDelegate;

	/**
	 * @since 9.0
	 */
	readonly isScanning: boolean;

	constructor(o: { delegate: CBCentralManagerDelegate; queue: NSObject & OS_dispatch_queue; });

	/**
	 * @since 7.0
	 */
	constructor(o: { delegate: CBCentralManagerDelegate; queue: NSObject & OS_dispatch_queue; options: NSDictionary<string, any>; });

	cancelPeripheralConnection(peripheral: CBPeripheral): void;

	connectPeripheralOptions(peripheral: CBPeripheral, options: NSDictionary<string, any>): void;

	initWithDelegateQueue(delegate: CBCentralManagerDelegate, queue: NSObject & OS_dispatch_queue): this;

	/**
	 * @since 7.0
	 */
	initWithDelegateQueueOptions(delegate: CBCentralManagerDelegate, queue: NSObject & OS_dispatch_queue, options: NSDictionary<string, any>): this;

	/**
	 * @since 13.0
	 */
	registerForConnectionEventsWithOptions(options: NSDictionary<string, any>): void;

	/**
	 * @since 7.0
	 */
	retrieveConnectedPeripheralsWithServices(serviceUUIDs: NSArray<CBUUID> | CBUUID[]): NSArray<CBPeripheral>;

	/**
	 * @since 7.0
	 */
	retrievePeripheralsWithIdentifiers(identifiers: NSArray<NSUUID> | NSUUID[]): NSArray<CBPeripheral>;

	scanForPeripheralsWithServicesOptions(serviceUUIDs: NSArray<CBUUID> | CBUUID[], options: NSDictionary<string, any>): void;

	stopScan(): void;
}

interface CBCentralManagerDelegate extends NSObjectProtocol {

	/**
	 * @since 13.0
	 */
	centralManagerConnectionEventDidOccurForPeripheral?(central: CBCentralManager, event: CBConnectionEvent, peripheral: CBPeripheral): void;

	centralManagerDidConnectPeripheral?(central: CBCentralManager, peripheral: CBPeripheral): void;

	centralManagerDidDisconnectPeripheralError?(central: CBCentralManager, peripheral: CBPeripheral, error: NSError): void;

	centralManagerDidDisconnectPeripheralTimestampIsReconnectingError?(central: CBCentralManager, peripheral: CBPeripheral, timestamp: number, isReconnecting: boolean, error: NSError): void;

	centralManagerDidDiscoverPeripheralAdvertisementDataRSSI?(central: CBCentralManager, peripheral: CBPeripheral, advertisementData: NSDictionary<string, any>, RSSI: number): void;

	centralManagerDidFailToConnectPeripheralError?(central: CBCentralManager, peripheral: CBPeripheral, error: NSError): void;

	/**
	 * @since 13.0
	 */
	centralManagerDidUpdateANCSAuthorizationForPeripheral?(central: CBCentralManager, peripheral: CBPeripheral): void;

	centralManagerDidUpdateState(central: CBCentralManager): void;

	centralManagerWillRestoreState?(central: CBCentralManager, dict: NSDictionary<string, any>): void;
}
declare var CBCentralManagerDelegate: {

	prototype: CBCentralManagerDelegate;
};

declare const enum CBCentralManagerFeature {

	ExtendedScanAndConnect = 1
}

/**
 * @since 16.0
 */
declare var CBCentralManagerOptionDeviceAccessForMedia: string;

/**
 * @since 7.0
 */
declare var CBCentralManagerOptionRestoreIdentifierKey: string;

/**
 * @since 7.0
 */
declare var CBCentralManagerOptionShowPowerAlertKey: string;

/**
 * @since 7.0
 */
declare var CBCentralManagerRestoredStatePeripheralsKey: string;

/**
 * @since 7.0
 */
declare var CBCentralManagerRestoredStateScanOptionsKey: string;

/**
 * @since 7.0
 */
declare var CBCentralManagerRestoredStateScanServicesKey: string;

declare var CBCentralManagerScanOptionAllowDuplicatesKey: string;

/**
 * @since 7.0
 */
declare var CBCentralManagerScanOptionSolicitedServiceUUIDsKey: string;

/**
 * @since 5.0
 * @deprecated 10.0
 */
declare const enum CBCentralManagerState {

	Unknown = 0,

	Resetting = 1,

	Unsupported = 2,

	Unauthorized = 3,

	PoweredOff = 4,

	PoweredOn = 5
}

/**
 * @since 5.0
 */
declare class CBCharacteristic extends CBAttribute {

	static alloc(): CBCharacteristic; // inherited from NSObject

	static new(): CBCharacteristic; // inherited from NSObject

	readonly descriptors: NSArray<CBDescriptor>;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	readonly isBroadcasted: boolean;

	readonly isNotifying: boolean;

	readonly properties: CBCharacteristicProperties;

	readonly service: CBService;

	readonly value: NSData;
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

/**
 * @since 17.0
 */
declare var CBConnectPeripheralOptionEnableAutoReconnect: string;

/**
 * @since 13.0
 */
declare var CBConnectPeripheralOptionEnableTransportBridgingKey: string;

/**
 * @since 6.0
 */
declare var CBConnectPeripheralOptionNotifyOnConnectionKey: string;

declare var CBConnectPeripheralOptionNotifyOnDisconnectionKey: string;

/**
 * @since 6.0
 */
declare var CBConnectPeripheralOptionNotifyOnNotificationKey: string;

/**
 * @since 13.0
 */
declare var CBConnectPeripheralOptionRequiresANCS: string;

/**
 * @since 6.0
 */
declare var CBConnectPeripheralOptionStartDelayKey: string;

declare const enum CBConnectionEvent {

	PeerDisconnected = 0,

	PeerConnected = 1
}

/**
 * @since 13.0
 */
declare var CBConnectionEventMatchingOptionPeripheralUUIDs: string;

/**
 * @since 13.0
 */
declare var CBConnectionEventMatchingOptionServiceUUIDs: string;

/**
 * @since 5.0
 */
declare class CBDescriptor extends CBAttribute {

	static alloc(): CBDescriptor; // inherited from NSObject

	static new(): CBDescriptor; // inherited from NSObject

	readonly characteristic: CBCharacteristic;

	readonly value: any;
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

	ConnectionLimitReached = 11,

	UnkownDevice = 12,

	UnknownDevice = 12,

	OperationNotSupported = 13,

	PeerRemovedPairingInformation = 14,

	EncryptionTimedOut = 15,

	TooManyLEPairedDevices = 16,

	LeGattExceededBackgroundNotificationLimit = 17,

	LeGattNearBackgroundNotificationLimit = 18
}

declare var CBErrorDomain: string;

/**
 * @since 11.0
 */
declare class CBL2CAPChannel extends NSObject {

	static alloc(): CBL2CAPChannel; // inherited from NSObject

	static new(): CBL2CAPChannel; // inherited from NSObject

	readonly PSM: number;

	readonly inputStream: NSInputStream;

	readonly outputStream: NSOutputStream;

	readonly peer: CBPeer;
}

/**
 * @since 10.0
 */
declare class CBManager extends NSObject {

	static alloc(): CBManager; // inherited from NSObject

	static new(): CBManager; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 13.1
	 */
	readonly authorization: CBManagerAuthorization;

	readonly state: CBManagerState;

	/**
	 * @since 13.1
	 */
	static readonly authorization: CBManagerAuthorization;
}

/**
 * @since 13.0
 */
declare const enum CBManagerAuthorization {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	AllowedAlways = 3
}

/**
 * @since 10.0
 */
declare const enum CBManagerState {

	Unknown = 0,

	Resetting = 1,

	Unsupported = 2,

	Unauthorized = 3,

	PoweredOff = 4,

	PoweredOn = 5
}

/**
 * @since 6.0
 */
declare class CBMutableCharacteristic extends CBCharacteristic {

	static alloc(): CBMutableCharacteristic; // inherited from NSObject

	static new(): CBMutableCharacteristic; // inherited from NSObject

	descriptors: NSArray<CBDescriptor>;

	permissions: CBAttributePermissions;

	properties: CBCharacteristicProperties;

	/**
	 * @since 7.0
	 */
	readonly subscribedCentrals: NSArray<CBCentral>;

	value: NSData;

	/**
	 * @since 6.0
	 */
	constructor(o: { type: CBUUID; properties: CBCharacteristicProperties; value: NSData; permissions: CBAttributePermissions; });

	/**
	 * @since 6.0
	 */
	initWithTypePropertiesValuePermissions(UUID: CBUUID, properties: CBCharacteristicProperties, value: NSData, permissions: CBAttributePermissions): this;
}

/**
 * @since 6.0
 */
declare class CBMutableDescriptor extends CBDescriptor {

	static alloc(): CBMutableDescriptor; // inherited from NSObject

	static new(): CBMutableDescriptor; // inherited from NSObject

	/**
	 * @since 6.0
	 */
	constructor(o: { type: CBUUID; value: any; });

	/**
	 * @since 6.0
	 */
	initWithTypeValue(UUID: CBUUID, value: any): this;
}

/**
 * @since 6.0
 */
declare class CBMutableService extends CBService {

	static alloc(): CBMutableService; // inherited from NSObject

	static new(): CBMutableService; // inherited from NSObject

	characteristics: NSArray<CBCharacteristic>;

	includedServices: NSArray<CBService>;

	/**
	 * @since 6.0
	 */
	constructor(o: { type: CBUUID; primary: boolean; });

	/**
	 * @since 6.0
	 */
	initWithTypePrimary(UUID: CBUUID, isPrimary: boolean): this;
}

/**
 * @since 8.0
 */
declare class CBPeer extends NSObject implements NSCopying {

	static alloc(): CBPeer; // inherited from NSObject

	static new(): CBPeer; // inherited from NSObject

	/**
	 * @since 7.0
	 */
	readonly identifier: NSUUID;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 5.0
 */
declare class CBPeripheral extends CBPeer {

	static alloc(): CBPeripheral; // inherited from NSObject

	static new(): CBPeripheral; // inherited from NSObject

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	readonly RSSI: number;

	/**
	 * @since 13.0
	 */
	readonly ancsAuthorized: boolean;

	/**
	 * @since 11.0
	 */
	readonly canSendWriteWithoutResponse: boolean;

	delegate: CBPeripheralDelegate;

	readonly name: string;

	readonly services: NSArray<CBService>;

	readonly state: CBPeripheralState;

	discoverCharacteristicsForService(characteristicUUIDs: NSArray<CBUUID> | CBUUID[], service: CBService): void;

	discoverDescriptorsForCharacteristic(characteristic: CBCharacteristic): void;

	discoverIncludedServicesForService(includedServiceUUIDs: NSArray<CBUUID> | CBUUID[], service: CBService): void;

	discoverServices(serviceUUIDs: NSArray<CBUUID> | CBUUID[]): void;

	/**
	 * @since 9.0
	 */
	maximumWriteValueLengthForType(type: CBCharacteristicWriteType): number;

	/**
	 * @since 11.0
	 */
	openL2CAPChannel(PSM: number): void;

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

	/**
	 * @since 7.0
	 */
	peripheralDidModifyServices?(peripheral: CBPeripheral, invalidatedServices: NSArray<CBService> | CBService[]): void;

	peripheralDidOpenL2CAPChannelError?(peripheral: CBPeripheral, channel: CBL2CAPChannel, error: NSError): void;

	/**
	 * @since 8.0
	 */
	peripheralDidReadRSSIError?(peripheral: CBPeripheral, RSSI: number, error: NSError): void;

	/**
	 * @since 6.0
	 */
	peripheralDidUpdateName?(peripheral: CBPeripheral): void;

	peripheralDidUpdateNotificationStateForCharacteristicError?(peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError): void;

	/**
	 * @since 5.0
	 * @deprecated 8.0
	 */
	peripheralDidUpdateRSSIError?(peripheral: CBPeripheral, error: NSError): void;

	peripheralDidUpdateValueForCharacteristicError?(peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError): void;

	peripheralDidUpdateValueForDescriptorError?(peripheral: CBPeripheral, descriptor: CBDescriptor, error: NSError): void;

	peripheralDidWriteValueForCharacteristicError?(peripheral: CBPeripheral, characteristic: CBCharacteristic, error: NSError): void;

	peripheralDidWriteValueForDescriptorError?(peripheral: CBPeripheral, descriptor: CBDescriptor, error: NSError): void;

	peripheralIsReadyToSendWriteWithoutResponse?(peripheral: CBPeripheral): void;
}
declare var CBPeripheralDelegate: {

	prototype: CBPeripheralDelegate;
};

/**
 * @since 6.0
 */
declare class CBPeripheralManager extends CBManager {

	static alloc(): CBPeripheralManager; // inherited from NSObject

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	static authorizationStatus(): CBPeripheralManagerAuthorizationStatus;

	static new(): CBPeripheralManager; // inherited from NSObject

	delegate: CBPeripheralManagerDelegate;

	readonly isAdvertising: boolean;

	/**
	 * @since 6.0
	 */
	constructor(o: { delegate: CBPeripheralManagerDelegate; queue: NSObject & OS_dispatch_queue; });

	/**
	 * @since 7.0
	 */
	constructor(o: { delegate: CBPeripheralManagerDelegate; queue: NSObject & OS_dispatch_queue; options: NSDictionary<string, any>; });

	addService(service: CBMutableService): void;

	/**
	 * @since 6.0
	 */
	initWithDelegateQueue(delegate: CBPeripheralManagerDelegate, queue: NSObject & OS_dispatch_queue): this;

	/**
	 * @since 7.0
	 */
	initWithDelegateQueueOptions(delegate: CBPeripheralManagerDelegate, queue: NSObject & OS_dispatch_queue, options: NSDictionary<string, any>): this;

	/**
	 * @since 11.0
	 */
	publishL2CAPChannelWithEncryption(encryptionRequired: boolean): void;

	removeAllServices(): void;

	removeService(service: CBMutableService): void;

	respondToRequestWithResult(request: CBATTRequest, result: CBATTError): void;

	setDesiredConnectionLatencyForCentral(latency: CBPeripheralManagerConnectionLatency, central: CBCentral): void;

	startAdvertising(advertisementData: NSDictionary<string, any>): void;

	stopAdvertising(): void;

	/**
	 * @since 11.0
	 */
	unpublishL2CAPChannel(PSM: number): void;

	updateValueForCharacteristicOnSubscribedCentrals(value: NSData, characteristic: CBMutableCharacteristic, centrals: NSArray<CBCentral> | CBCentral[]): boolean;
}

/**
 * @since 7.0
 * @deprecated 13.0
 */
declare const enum CBPeripheralManagerAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

/**
 * @since 6.0
 */
declare const enum CBPeripheralManagerConnectionLatency {

	Low = 0,

	Medium = 1,

	High = 2
}

interface CBPeripheralManagerDelegate extends NSObjectProtocol {

	peripheralManagerCentralDidSubscribeToCharacteristic?(peripheral: CBPeripheralManager, central: CBCentral, characteristic: CBCharacteristic): void;

	peripheralManagerCentralDidUnsubscribeFromCharacteristic?(peripheral: CBPeripheralManager, central: CBCentral, characteristic: CBCharacteristic): void;

	peripheralManagerDidAddServiceError?(peripheral: CBPeripheralManager, service: CBService, error: NSError): void;

	peripheralManagerDidOpenL2CAPChannelError?(peripheral: CBPeripheralManager, channel: CBL2CAPChannel, error: NSError): void;

	peripheralManagerDidPublishL2CAPChannelError?(peripheral: CBPeripheralManager, PSM: number, error: NSError): void;

	peripheralManagerDidReceiveReadRequest?(peripheral: CBPeripheralManager, request: CBATTRequest): void;

	peripheralManagerDidReceiveWriteRequests?(peripheral: CBPeripheralManager, requests: NSArray<CBATTRequest> | CBATTRequest[]): void;

	peripheralManagerDidStartAdvertisingError?(peripheral: CBPeripheralManager, error: NSError): void;

	peripheralManagerDidUnpublishL2CAPChannelError?(peripheral: CBPeripheralManager, PSM: number, error: NSError): void;

	peripheralManagerDidUpdateState(peripheral: CBPeripheralManager): void;

	peripheralManagerIsReadyToUpdateSubscribers?(peripheral: CBPeripheralManager): void;

	peripheralManagerWillRestoreState?(peripheral: CBPeripheralManager, dict: NSDictionary<string, any>): void;
}
declare var CBPeripheralManagerDelegate: {

	prototype: CBPeripheralManagerDelegate;
};

/**
 * @since 7.0
 */
declare var CBPeripheralManagerOptionRestoreIdentifierKey: string;

/**
 * @since 7.0
 */
declare var CBPeripheralManagerOptionShowPowerAlertKey: string;

/**
 * @since 7.0
 */
declare var CBPeripheralManagerRestoredStateAdvertisementDataKey: string;

/**
 * @since 7.0
 */
declare var CBPeripheralManagerRestoredStateServicesKey: string;

/**
 * @since 6.0
 * @deprecated 10.0
 */
declare const enum CBPeripheralManagerState {

	Unknown = 0,

	Resetting = 1,

	Unsupported = 2,

	Unauthorized = 3,

	PoweredOff = 4,

	PoweredOn = 5
}

/**
 * @since 7.0
 */
declare const enum CBPeripheralState {

	Disconnected = 0,

	Connecting = 1,

	Connected = 2,

	Disconnecting = 3
}

/**
 * @since 5.0
 */
declare class CBService extends CBAttribute {

	static alloc(): CBService; // inherited from NSObject

	static new(): CBService; // inherited from NSObject

	readonly characteristics: NSArray<CBCharacteristic>;

	readonly includedServices: NSArray<CBService>;

	readonly isPrimary: boolean;

	readonly peripheral: CBPeripheral;
}

/**
 * @since 5.0
 */
declare class CBUUID extends NSObject implements NSCopying {

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static UUIDWithCFUUID(theUUID: any): CBUUID;

	static UUIDWithData(theData: NSData): CBUUID;

	/**
	 * @since 7.0
	 */
	static UUIDWithNSUUID(theUUID: NSUUID): CBUUID;

	static UUIDWithString(theString: string): CBUUID;

	static alloc(): CBUUID; // inherited from NSObject

	static new(): CBUUID; // inherited from NSObject

	/**
	 * @since 7.1
	 */
	readonly UUIDString: string;

	readonly data: NSData;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var CBUUIDCharacteristicAggregateFormatString: string;

declare var CBUUIDCharacteristicExtendedPropertiesString: string;

declare var CBUUIDCharacteristicFormatString: string;

declare var CBUUIDCharacteristicObservationScheduleString: string;

declare var CBUUIDCharacteristicUserDescriptionString: string;

declare var CBUUIDCharacteristicValidRangeString: string;

declare var CBUUIDClientCharacteristicConfigurationString: string;

/**
 * @since 11.0
 */
declare var CBUUIDL2CAPPSMCharacteristicString: string;

declare var CBUUIDServerCharacteristicConfigurationString: string;
