
declare class HMAccessControl extends NSObject {

	static alloc(): HMAccessControl; // inherited from NSObject

	static new(): HMAccessControl; // inherited from NSObject
}

declare class HMAccessory extends NSObject {

	static alloc(): HMAccessory; // inherited from NSObject

	static new(): HMAccessory; // inherited from NSObject

	readonly blocked: boolean;

	readonly bridged: boolean;

	readonly cameraProfiles: NSArray<HMCameraProfile>;

	readonly category: HMAccessoryCategory;

	delegate: HMAccessoryDelegate;

	readonly firmwareVersion: string;

	readonly identifier: NSUUID;

	readonly identifiersForBridgedAccessories: NSArray<NSUUID>;

	readonly manufacturer: string;

	readonly model: string;

	readonly name: string;

	readonly profiles: NSArray<HMAccessoryProfile>;

	readonly reachable: boolean;

	readonly room: HMRoom;

	readonly services: NSArray<HMService>;

	readonly supportsIdentify: boolean;

	readonly uniqueIdentifier: NSUUID;

	readonly uniqueIdentifiersForBridgedAccessories: NSArray<NSUUID>;

	identifyWithCompletionHandler(completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

declare class HMAccessoryBrowser extends NSObject {

	static alloc(): HMAccessoryBrowser; // inherited from NSObject

	static new(): HMAccessoryBrowser; // inherited from NSObject

	delegate: HMAccessoryBrowserDelegate;

	readonly discoveredAccessories: NSArray<HMAccessory>;

	startSearchingForNewAccessories(): void;

	stopSearchingForNewAccessories(): void;
}

interface HMAccessoryBrowserDelegate extends NSObjectProtocol {

	accessoryBrowserDidFindNewAccessory?(browser: HMAccessoryBrowser, accessory: HMAccessory): void;

	accessoryBrowserDidRemoveNewAccessory?(browser: HMAccessoryBrowser, accessory: HMAccessory): void;
}
declare var HMAccessoryBrowserDelegate: {

	prototype: HMAccessoryBrowserDelegate;
};

declare class HMAccessoryCategory extends NSObject {

	static alloc(): HMAccessoryCategory; // inherited from NSObject

	static new(): HMAccessoryCategory; // inherited from NSObject

	readonly categoryType: string;

	readonly localizedDescription: string;
}

declare var HMAccessoryCategoryTypeAirConditioner: string;

declare var HMAccessoryCategoryTypeAirDehumidifier: string;

declare var HMAccessoryCategoryTypeAirHeater: string;

declare var HMAccessoryCategoryTypeAirHumidifier: string;

declare var HMAccessoryCategoryTypeAirPurifier: string;

declare var HMAccessoryCategoryTypeBridge: string;

declare var HMAccessoryCategoryTypeDoor: string;

declare var HMAccessoryCategoryTypeDoorLock: string;

declare var HMAccessoryCategoryTypeFan: string;

declare var HMAccessoryCategoryTypeFaucet: string;

declare var HMAccessoryCategoryTypeGarageDoorOpener: string;

declare var HMAccessoryCategoryTypeIPCamera: string;

declare var HMAccessoryCategoryTypeLightbulb: string;

declare var HMAccessoryCategoryTypeOther: string;

declare var HMAccessoryCategoryTypeOutlet: string;

declare var HMAccessoryCategoryTypeProgrammableSwitch: string;

declare var HMAccessoryCategoryTypeRangeExtender: string;

declare var HMAccessoryCategoryTypeSecuritySystem: string;

declare var HMAccessoryCategoryTypeSensor: string;

declare var HMAccessoryCategoryTypeShowerHead: string;

declare var HMAccessoryCategoryTypeSprinkler: string;

declare var HMAccessoryCategoryTypeSwitch: string;

declare var HMAccessoryCategoryTypeThermostat: string;

declare var HMAccessoryCategoryTypeVideoDoorbell: string;

declare var HMAccessoryCategoryTypeWindow: string;

declare var HMAccessoryCategoryTypeWindowCovering: string;

interface HMAccessoryDelegate extends NSObjectProtocol {

	accessoryDidAddProfile?(accessory: HMAccessory, profile: HMAccessoryProfile): void;

	accessoryDidRemoveProfile?(accessory: HMAccessory, profile: HMAccessoryProfile): void;

	accessoryDidUpdateAssociatedServiceTypeForService?(accessory: HMAccessory, service: HMService): void;

	accessoryDidUpdateFirmwareVersion?(accessory: HMAccessory, firmwareVersion: string): void;

	accessoryDidUpdateName?(accessory: HMAccessory): void;

	accessoryDidUpdateNameForService?(accessory: HMAccessory, service: HMService): void;

	accessoryDidUpdateReachability?(accessory: HMAccessory): void;

	accessoryDidUpdateServices?(accessory: HMAccessory): void;

	accessoryServiceDidUpdateValueForCharacteristic?(accessory: HMAccessory, service: HMService, characteristic: HMCharacteristic): void;
}
declare var HMAccessoryDelegate: {

	prototype: HMAccessoryDelegate;
};

declare class HMAccessoryOwnershipToken extends NSObject {

	static alloc(): HMAccessoryOwnershipToken; // inherited from NSObject

	static new(): HMAccessoryOwnershipToken; // inherited from NSObject

	constructor(o: { data: NSData; });

	initWithData(data: NSData): this;
}

declare class HMAccessoryProfile extends NSObject {

	static alloc(): HMAccessoryProfile; // inherited from NSObject

	static new(): HMAccessoryProfile; // inherited from NSObject

	readonly accessory: HMAccessory;

	readonly services: NSArray<HMService>;

	readonly uniqueIdentifier: NSUUID;
}

declare class HMAccessorySetupPayload extends NSObject {

	static alloc(): HMAccessorySetupPayload; // inherited from NSObject

	static new(): HMAccessorySetupPayload; // inherited from NSObject

	constructor(o: { URL: NSURL; });

	constructor(o: { URL: NSURL; ownershipToken: HMAccessoryOwnershipToken; });

	initWithURL(setupPayloadURL: NSURL): this;

	initWithURLOwnershipToken(setupPayloadURL: NSURL, ownershipToken: HMAccessoryOwnershipToken): this;
}

declare class HMAction extends NSObject {

	static alloc(): HMAction; // inherited from NSObject

	static new(): HMAction; // inherited from NSObject

	readonly uniqueIdentifier: NSUUID;
}

declare class HMActionSet extends NSObject {

	static alloc(): HMActionSet; // inherited from NSObject

	static new(): HMActionSet; // inherited from NSObject

	readonly actionSetType: string;

	readonly actions: NSSet<HMAction>;

	readonly executing: boolean;

	readonly lastExecutionDate: Date;

	readonly name: string;

	readonly uniqueIdentifier: NSUUID;

	addActionCompletionHandler(action: HMAction, completion: (p1: NSError) => void): void;

	removeActionCompletionHandler(action: HMAction, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

declare var HMActionSetTypeHomeArrival: string;

declare var HMActionSetTypeHomeDeparture: string;

declare var HMActionSetTypeSleep: string;

declare var HMActionSetTypeTriggerOwned: string;

declare var HMActionSetTypeUserDefined: string;

declare var HMActionSetTypeWakeUp: string;

declare class HMAddAccessoryRequest extends NSObject {

	static alloc(): HMAddAccessoryRequest; // inherited from NSObject

	static new(): HMAddAccessoryRequest; // inherited from NSObject

	readonly accessoryCategory: HMAccessoryCategory;

	readonly accessoryName: string;

	readonly home: HMHome;

	readonly requiresOwnershipToken: boolean;

	readonly requiresSetupPayloadURL: boolean;

	payloadWithOwnershipToken(ownershipToken: HMAccessoryOwnershipToken): HMAccessorySetupPayload;

	payloadWithURLOwnershipToken(setupPayloadURL: NSURL, ownershipToken: HMAccessoryOwnershipToken): HMAccessorySetupPayload;
}

declare class HMCalendarEvent extends HMTimeEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMCalendarEvent; // inherited from NSObject

	static new(): HMCalendarEvent; // inherited from NSObject

	readonly fireDateComponents: NSDateComponents;

	constructor(o: { fireDateComponents: NSDateComponents; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithFireDateComponents(fireDateComponents: NSDateComponents): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class HMCameraAudioControl extends HMCameraControl {

	static alloc(): HMCameraAudioControl; // inherited from NSObject

	static new(): HMCameraAudioControl; // inherited from NSObject

	readonly mute: HMCharacteristic;

	readonly volume: HMCharacteristic;
}

declare const enum HMCameraAudioStreamSetting {

	Muted = 1,

	IncomingAudioAllowed = 2,

	BidirectionalAudioAllowed = 3
}

declare class HMCameraControl extends NSObject {

	static alloc(): HMCameraControl; // inherited from NSObject

	static new(): HMCameraControl; // inherited from NSObject
}

declare class HMCameraProfile extends HMAccessoryProfile {

	static alloc(): HMCameraProfile; // inherited from NSObject

	static new(): HMCameraProfile; // inherited from NSObject

	readonly microphoneControl: HMCameraAudioControl;

	readonly settingsControl: HMCameraSettingsControl;

	readonly snapshotControl: HMCameraSnapshotControl;

	readonly speakerControl: HMCameraAudioControl;

	readonly streamControl: HMCameraStreamControl;
}

declare class HMCameraSettingsControl extends HMCameraControl {

	static alloc(): HMCameraSettingsControl; // inherited from NSObject

	static new(): HMCameraSettingsControl; // inherited from NSObject

	readonly currentHorizontalTilt: HMCharacteristic;

	readonly currentVerticalTilt: HMCharacteristic;

	readonly digitalZoom: HMCharacteristic;

	readonly imageMirroring: HMCharacteristic;

	readonly imageRotation: HMCharacteristic;

	readonly nightVision: HMCharacteristic;

	readonly opticalZoom: HMCharacteristic;

	readonly targetHorizontalTilt: HMCharacteristic;

	readonly targetVerticalTilt: HMCharacteristic;
}

declare class HMCameraSnapshot extends HMCameraSource {

	static alloc(): HMCameraSnapshot; // inherited from NSObject

	static new(): HMCameraSnapshot; // inherited from NSObject

	readonly captureDate: Date;
}

declare class HMCameraSnapshotControl extends HMCameraControl {

	static alloc(): HMCameraSnapshotControl; // inherited from NSObject

	static new(): HMCameraSnapshotControl; // inherited from NSObject

	delegate: HMCameraSnapshotControlDelegate;

	readonly mostRecentSnapshot: HMCameraSnapshot;

	takeSnapshot(): void;
}

interface HMCameraSnapshotControlDelegate extends NSObjectProtocol {

	cameraSnapshotControlDidTakeSnapshotError?(cameraSnapshotControl: HMCameraSnapshotControl, snapshot: HMCameraSnapshot, error: NSError): void;

	cameraSnapshotControlDidUpdateMostRecentSnapshot?(cameraSnapshotControl: HMCameraSnapshotControl): void;
}
declare var HMCameraSnapshotControlDelegate: {

	prototype: HMCameraSnapshotControlDelegate;
};

declare class HMCameraSource extends NSObject {

	static alloc(): HMCameraSource; // inherited from NSObject

	static new(): HMCameraSource; // inherited from NSObject
}

declare class HMCameraStream extends HMCameraSource {

	static alloc(): HMCameraStream; // inherited from NSObject

	static new(): HMCameraStream; // inherited from NSObject

	readonly audioStreamSetting: HMCameraAudioStreamSetting;

	setAudioStreamSetting(audioStreamSetting: HMCameraAudioStreamSetting): void;

	updateAudioStreamSettingCompletionHandler(audioStreamSetting: HMCameraAudioStreamSetting, completion: (p1: NSError) => void): void;
}

declare class HMCameraStreamControl extends HMCameraControl {

	static alloc(): HMCameraStreamControl; // inherited from NSObject

	static new(): HMCameraStreamControl; // inherited from NSObject

	readonly cameraStream: HMCameraStream;

	delegate: HMCameraStreamControlDelegate;

	readonly streamState: HMCameraStreamState;

	startStream(): void;

	stopStream(): void;
}

interface HMCameraStreamControlDelegate extends NSObjectProtocol {

	cameraStreamControlDidStartStream?(cameraStreamControl: HMCameraStreamControl): void;

	cameraStreamControlDidStopStreamWithError?(cameraStreamControl: HMCameraStreamControl, error: NSError): void;
}
declare var HMCameraStreamControlDelegate: {

	prototype: HMCameraStreamControlDelegate;
};

declare const enum HMCameraStreamState {

	Starting = 1,

	Streaming = 2,

	Stopping = 3,

	NotStreaming = 4
}

declare class HMCameraView extends UIView {

	static alloc(): HMCameraView; // inherited from NSObject

	static appearance(): HMCameraView; // inherited from UIAppearance

	static appearanceForTraitCollection(trait: UITraitCollection): HMCameraView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): HMCameraView; // inherited from UIAppearance

	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HMCameraView; // inherited from UIAppearance

	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): HMCameraView; // inherited from UIAppearance

	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HMCameraView; // inherited from UIAppearance

	static new(): HMCameraView; // inherited from NSObject

	cameraSource: HMCameraSource;
}

declare class HMCharacteristic extends NSObject {

	static alloc(): HMCharacteristic; // inherited from NSObject

	static new(): HMCharacteristic; // inherited from NSObject

	readonly characteristicType: string;

	readonly localizedDescription: string;

	readonly metadata: HMCharacteristicMetadata;

	readonly notificationEnabled: boolean;

	readonly properties: NSArray<string>;

	readonly service: HMService;

	readonly uniqueIdentifier: NSUUID;

	readonly value: any;

	enableNotificationCompletionHandler(enable: boolean, completion: (p1: NSError) => void): void;

	readValueWithCompletionHandler(completion: (p1: NSError) => void): void;

	updateAuthorizationDataCompletionHandler(data: NSData, completion: (p1: NSError) => void): void;

	writeValueCompletionHandler(value: any, completion: (p1: NSError) => void): void;
}

declare class HMCharacteristicEvent<TriggerValueType> extends HMEvent implements NSCopying, NSMutableCopying {

	static alloc<TriggerValueType>(): HMCharacteristicEvent<TriggerValueType>; // inherited from NSObject

	static new<TriggerValueType>(): HMCharacteristicEvent<TriggerValueType>; // inherited from NSObject

	readonly characteristic: HMCharacteristic;

	readonly triggerValue: TriggerValueType;

	constructor(o: { characteristic: HMCharacteristic; triggerValue: TriggerValueType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCharacteristicTriggerValue(characteristic: HMCharacteristic, triggerValue: TriggerValueType): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	updateTriggerValueCompletionHandler(triggerValue: TriggerValueType, completion: (p1: NSError) => void): void;
}

declare var HMCharacteristicKeyPath: string;

declare class HMCharacteristicMetadata extends NSObject {

	static alloc(): HMCharacteristicMetadata; // inherited from NSObject

	static new(): HMCharacteristicMetadata; // inherited from NSObject

	readonly format: string;

	readonly manufacturerDescription: string;

	readonly maxLength: number;

	readonly maximumValue: number;

	readonly minimumValue: number;

	readonly stepValue: number;

	readonly units: string;

	readonly validValues: NSArray<number>;
}

declare var HMCharacteristicMetadataFormatArray: string;

declare var HMCharacteristicMetadataFormatBool: string;

declare var HMCharacteristicMetadataFormatData: string;

declare var HMCharacteristicMetadataFormatDictionary: string;

declare var HMCharacteristicMetadataFormatFloat: string;

declare var HMCharacteristicMetadataFormatInt: string;

declare var HMCharacteristicMetadataFormatString: string;

declare var HMCharacteristicMetadataFormatTLV8: string;

declare var HMCharacteristicMetadataFormatUInt16: string;

declare var HMCharacteristicMetadataFormatUInt32: string;

declare var HMCharacteristicMetadataFormatUInt64: string;

declare var HMCharacteristicMetadataFormatUInt8: string;

declare var HMCharacteristicMetadataUnitsArcDegree: string;

declare var HMCharacteristicMetadataUnitsCelsius: string;

declare var HMCharacteristicMetadataUnitsFahrenheit: string;

declare var HMCharacteristicMetadataUnitsLux: string;

declare var HMCharacteristicMetadataUnitsMicrogramsPerCubicMeter: string;

declare var HMCharacteristicMetadataUnitsPartsPerMillion: string;

declare var HMCharacteristicMetadataUnitsPercentage: string;

declare var HMCharacteristicMetadataUnitsSeconds: string;

declare var HMCharacteristicPropertyHidden: string;

declare var HMCharacteristicPropertyReadable: string;

declare var HMCharacteristicPropertySupportsEventNotification: string;

declare var HMCharacteristicPropertyWritable: string;

declare class HMCharacteristicThresholdRangeEvent extends HMEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMCharacteristicThresholdRangeEvent; // inherited from NSObject

	static new(): HMCharacteristicThresholdRangeEvent; // inherited from NSObject

	readonly characteristic: HMCharacteristic;

	readonly thresholdRange: HMNumberRange;

	constructor(o: { characteristic: HMCharacteristic; thresholdRange: HMNumberRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCharacteristicThresholdRange(characteristic: HMCharacteristic, thresholdRange: HMNumberRange): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare var HMCharacteristicTypeActive: string;

declare var HMCharacteristicTypeAdminOnlyAccess: string;

declare var HMCharacteristicTypeAirParticulateDensity: string;

declare var HMCharacteristicTypeAirParticulateSize: string;

declare var HMCharacteristicTypeAirQuality: string;

declare var HMCharacteristicTypeAudioFeedback: string;

declare var HMCharacteristicTypeBatteryLevel: string;

declare var HMCharacteristicTypeBrightness: string;

declare var HMCharacteristicTypeCarbonDioxideDetected: string;

declare var HMCharacteristicTypeCarbonDioxideLevel: string;

declare var HMCharacteristicTypeCarbonDioxidePeakLevel: string;

declare var HMCharacteristicTypeCarbonMonoxideDetected: string;

declare var HMCharacteristicTypeCarbonMonoxideLevel: string;

declare var HMCharacteristicTypeCarbonMonoxidePeakLevel: string;

declare var HMCharacteristicTypeChargingState: string;

declare var HMCharacteristicTypeColorTemperature: string;

declare var HMCharacteristicTypeContactState: string;

declare var HMCharacteristicTypeCoolingThreshold: string;

declare var HMCharacteristicTypeCurrentAirPurifierState: string;

declare var HMCharacteristicTypeCurrentDoorState: string;

declare var HMCharacteristicTypeCurrentFanState: string;

declare var HMCharacteristicTypeCurrentHeaterCoolerState: string;

declare var HMCharacteristicTypeCurrentHeatingCooling: string;

declare var HMCharacteristicTypeCurrentHorizontalTilt: string;

declare var HMCharacteristicTypeCurrentHumidifierDehumidifierState: string;

declare var HMCharacteristicTypeCurrentLightLevel: string;

declare var HMCharacteristicTypeCurrentLockMechanismState: string;

declare var HMCharacteristicTypeCurrentPosition: string;

declare var HMCharacteristicTypeCurrentRelativeHumidity: string;

declare var HMCharacteristicTypeCurrentSecuritySystemState: string;

declare var HMCharacteristicTypeCurrentSlatState: string;

declare var HMCharacteristicTypeCurrentTemperature: string;

declare var HMCharacteristicTypeCurrentTilt: string;

declare var HMCharacteristicTypeCurrentVerticalTilt: string;

declare var HMCharacteristicTypeDehumidifierThreshold: string;

declare var HMCharacteristicTypeDigitalZoom: string;

declare var HMCharacteristicTypeFilterChangeIndication: string;

declare var HMCharacteristicTypeFilterLifeLevel: string;

declare var HMCharacteristicTypeFilterResetChangeIndication: string;

declare var HMCharacteristicTypeFirmwareVersion: string;

declare var HMCharacteristicTypeHardwareVersion: string;

declare var HMCharacteristicTypeHeatingThreshold: string;

declare var HMCharacteristicTypeHoldPosition: string;

declare var HMCharacteristicTypeHue: string;

declare var HMCharacteristicTypeHumidifierThreshold: string;

declare var HMCharacteristicTypeIdentify: string;

declare var HMCharacteristicTypeImageMirroring: string;

declare var HMCharacteristicTypeImageRotation: string;

declare var HMCharacteristicTypeInUse: string;

declare var HMCharacteristicTypeInputEvent: string;

declare var HMCharacteristicTypeIsConfigured: string;

declare var HMCharacteristicTypeLabelIndex: string;

declare var HMCharacteristicTypeLabelNamespace: string;

declare var HMCharacteristicTypeLeakDetected: string;

declare var HMCharacteristicTypeLockManagementAutoSecureTimeout: string;

declare var HMCharacteristicTypeLockManagementControlPoint: string;

declare var HMCharacteristicTypeLockMechanismLastKnownAction: string;

declare var HMCharacteristicTypeLockPhysicalControls: string;

declare var HMCharacteristicTypeLogs: string;

declare var HMCharacteristicTypeManufacturer: string;

declare var HMCharacteristicTypeModel: string;

declare var HMCharacteristicTypeMotionDetected: string;

declare var HMCharacteristicTypeMute: string;

declare var HMCharacteristicTypeName: string;

declare var HMCharacteristicTypeNightVision: string;

declare var HMCharacteristicTypeNitrogenDioxideDensity: string;

declare var HMCharacteristicTypeObstructionDetected: string;

declare var HMCharacteristicTypeOccupancyDetected: string;

declare var HMCharacteristicTypeOpticalZoom: string;

declare var HMCharacteristicTypeOutletInUse: string;

declare var HMCharacteristicTypeOutputState: string;

declare var HMCharacteristicTypeOzoneDensity: string;

declare var HMCharacteristicTypePM10Density: string;

declare var HMCharacteristicTypePM2_5Density: string;

declare var HMCharacteristicTypePositionState: string;

declare var HMCharacteristicTypePowerState: string;

declare var HMCharacteristicTypeProgramMode: string;

declare var HMCharacteristicTypeRemainingDuration: string;

declare var HMCharacteristicTypeRotationDirection: string;

declare var HMCharacteristicTypeRotationSpeed: string;

declare var HMCharacteristicTypeSaturation: string;

declare var HMCharacteristicTypeSecuritySystemAlarmType: string;

declare var HMCharacteristicTypeSelectedStreamConfiguration: string;

declare var HMCharacteristicTypeSerialNumber: string;

declare var HMCharacteristicTypeSetDuration: string;

declare var HMCharacteristicTypeSetupStreamEndpoint: string;

declare var HMCharacteristicTypeSlatType: string;

declare var HMCharacteristicTypeSmokeDetected: string;

declare var HMCharacteristicTypeSoftwareVersion: string;

declare var HMCharacteristicTypeStatusActive: string;

declare var HMCharacteristicTypeStatusFault: string;

declare var HMCharacteristicTypeStatusJammed: string;

declare var HMCharacteristicTypeStatusLowBattery: string;

declare var HMCharacteristicTypeStatusTampered: string;

declare var HMCharacteristicTypeStreamingStatus: string;

declare var HMCharacteristicTypeSulphurDioxideDensity: string;

declare var HMCharacteristicTypeSupportedAudioStreamConfiguration: string;

declare var HMCharacteristicTypeSupportedRTPConfiguration: string;

declare var HMCharacteristicTypeSupportedVideoStreamConfiguration: string;

declare var HMCharacteristicTypeSwingMode: string;

declare var HMCharacteristicTypeTargetAirPurifierState: string;

declare var HMCharacteristicTypeTargetDoorState: string;

declare var HMCharacteristicTypeTargetFanState: string;

declare var HMCharacteristicTypeTargetHeaterCoolerState: string;

declare var HMCharacteristicTypeTargetHeatingCooling: string;

declare var HMCharacteristicTypeTargetHorizontalTilt: string;

declare var HMCharacteristicTypeTargetHumidifierDehumidifierState: string;

declare var HMCharacteristicTypeTargetLockMechanismState: string;

declare var HMCharacteristicTypeTargetPosition: string;

declare var HMCharacteristicTypeTargetRelativeHumidity: string;

declare var HMCharacteristicTypeTargetSecuritySystemState: string;

declare var HMCharacteristicTypeTargetTemperature: string;

declare var HMCharacteristicTypeTargetTilt: string;

declare var HMCharacteristicTypeTargetVerticalTilt: string;

declare var HMCharacteristicTypeTemperatureUnits: string;

declare var HMCharacteristicTypeValveType: string;

declare var HMCharacteristicTypeVersion: string;

declare var HMCharacteristicTypeVolatileOrganicCompoundDensity: string;

declare var HMCharacteristicTypeVolume: string;

declare var HMCharacteristicTypeWaterLevel: string;

declare const enum HMCharacteristicValueActivationState {

	Inactive = 0,

	Active = 1
}

declare const enum HMCharacteristicValueAirParticulateSize {

	Size2_5 = 0,

	Size10 = 1
}

declare const enum HMCharacteristicValueAirQuality {

	Unknown = 0,

	Excellent = 1,

	Good = 2,

	Fair = 3,

	Inferior = 4,

	Poor = 5
}

declare const enum HMCharacteristicValueBatteryStatus {

	Normal = 0,

	Low = 1
}

declare const enum HMCharacteristicValueCarbonDioxideDetectionStatus {

	NotDetected = 0,

	Detected = 1
}

declare const enum HMCharacteristicValueCarbonMonoxideDetectionStatus {

	NotDetected = 0,

	Detected = 1
}

declare const enum HMCharacteristicValueChargingState {

	None = 0,

	InProgress = 1,

	NotChargeable = 2
}

declare const enum HMCharacteristicValueConfigurationState {

	NotConfigured = 0,

	Configured = 1
}

declare const enum HMCharacteristicValueContactState {

	Detected = 0,

	None = 1
}

declare const enum HMCharacteristicValueCurrentAirPurifierState {

	Inactive = 0,

	Idle = 1,

	Active = 2
}

declare const enum HMCharacteristicValueCurrentFanState {

	Inactive = 0,

	Idle = 1,

	Active = 2
}

declare const enum HMCharacteristicValueCurrentHeaterCoolerState {

	Inactive = 0,

	Idle = 1,

	Heating = 2,

	Cooling = 3
}

declare const enum HMCharacteristicValueCurrentHumidifierDehumidifierState {

	Inactive = 0,

	Idle = 1,

	Humidifying = 2,

	Dehumidifying = 3
}

declare const enum HMCharacteristicValueCurrentSecuritySystemState {

	StayArm = 0,

	AwayArm = 1,

	NightArm = 2,

	Disarmed = 3,

	Triggered = 4
}

declare const enum HMCharacteristicValueCurrentSlatState {

	Stationary = 0,

	Jammed = 1,

	Oscillating = 2
}

declare const enum HMCharacteristicValueDoorState {

	Open = 0,

	Closed = 1,

	Opening = 2,

	Closing = 3,

	Stopped = 4
}

declare const enum HMCharacteristicValueFilterChange {

	NotNeeded = 0,

	Needed = 1
}

declare const enum HMCharacteristicValueHeatingCooling {

	Off = 0,

	Heat = 1,

	Cool = 2,

	Auto = 3
}

declare const enum HMCharacteristicValueInputEvent {

	SinglePress = 0,

	DoublePress = 1,

	LongPress = 2
}

declare const enum HMCharacteristicValueJammedStatus {

	None = 0,

	Jammed = 1
}

declare var HMCharacteristicValueKeyPath: string;

declare const enum HMCharacteristicValueLabelNamespace {

	Dot = 0,

	Numeral = 1
}

declare const enum HMCharacteristicValueLeakStatus {

	None = 0,

	Detected = 1
}

declare const enum HMCharacteristicValueLockMechanismLastKnownAction {

	SecuredUsingPhysicalMovementInterior = 0,

	UnsecuredUsingPhysicalMovementInterior = 1,

	SecuredUsingPhysicalMovementExterior = 2,

	UnsecuredUsingPhysicalMovementExterior = 3,

	SecuredWithKeypad = 4,

	UnsecuredWithKeypad = 5,

	SecuredRemotely = 6,

	UnsecuredRemotely = 7,

	SecuredWithAutomaticSecureTimeout = 8,

	SecuredUsingPhysicalMovement = 9,

	UnsecuredUsingPhysicalMovement = 10
}

declare const enum HMCharacteristicValueLockMechanismState {

	Unsecured = 0,

	Secured = 1,

	Jammed = 2,

	Unknown = 3
}

declare const enum HMCharacteristicValueLockPhysicalControlsState {

	NotLocked = 0,

	Locked = 1
}

declare const enum HMCharacteristicValueOccupancyStatus {

	NotOccupied = 0,

	Occupied = 1
}

declare const enum HMCharacteristicValuePositionState {

	Closing = 0,

	Opening = 1,

	Stopped = 2
}

declare const enum HMCharacteristicValueProgramMode {

	NotScheduled = 0,

	Scheduled = 1,

	ScheduleOverriddenToManual = 2
}

declare const enum HMCharacteristicValueRotationDirection {

	Clockwise = 0,

	CounterClockwise = 1
}

declare const enum HMCharacteristicValueSecuritySystemAlarmType {

	NoAlarm = 0,

	Unknown = 1
}

declare const enum HMCharacteristicValueSlatType {

	Horizontal = 0,

	Vertical = 1
}

declare const enum HMCharacteristicValueSmokeDetectionStatus {

	None = 0,

	Detected = 1
}

declare const enum HMCharacteristicValueStatusFault {

	NoFault = 0,

	GeneralFault = 1
}

declare const enum HMCharacteristicValueSwingMode {

	Disabled = 0,

	Enabled = 1
}

declare const enum HMCharacteristicValueTamperedStatus {

	None = 0,

	Tampered = 1
}

declare const enum HMCharacteristicValueTargetAirPurifierState {

	Manual = 0,

	Automatic = 1
}

declare const enum HMCharacteristicValueTargetFanState {

	Manual = 0,

	Automatic = 1
}

declare const enum HMCharacteristicValueTargetHeaterCoolerState {

	Automatic = 0,

	Heat = 1,

	Cool = 2
}

declare const enum HMCharacteristicValueTargetHumidifierDehumidifierState {

	Automatic = 0,

	Humidify = 1,

	Dehumidify = 2
}

declare const enum HMCharacteristicValueTargetSecuritySystemState {

	StayArm = 0,

	AwayArm = 1,

	NightArm = 2,

	Disarm = 3
}

declare const enum HMCharacteristicValueTemperatureUnit {

	Celsius = 0,

	Fahrenheit = 1
}

declare const enum HMCharacteristicValueUsageState {

	NotInUse = 0,

	InUse = 1
}

declare const enum HMCharacteristicValueValveType {

	GenericValve = 0,

	Irrigation = 1,

	ShowerHead = 2,

	WaterFaucet = 3
}

declare class HMCharacteristicWriteAction<TargetValueType> extends HMAction {

	static alloc<TargetValueType>(): HMCharacteristicWriteAction<TargetValueType>; // inherited from NSObject

	static new<TargetValueType>(): HMCharacteristicWriteAction<TargetValueType>; // inherited from NSObject

	readonly characteristic: HMCharacteristic;

	readonly targetValue: TargetValueType;

	constructor(o: { characteristic: HMCharacteristic; targetValue: TargetValueType; });

	initWithCharacteristicTargetValue(characteristic: HMCharacteristic, targetValue: TargetValueType): this;

	updateTargetValueCompletionHandler(targetValue: TargetValueType, completion: (p1: NSError) => void): void;
}

declare class HMDurationEvent extends HMTimeEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMDurationEvent; // inherited from NSObject

	static new(): HMDurationEvent; // inherited from NSObject

	readonly duration: number;

	constructor(o: { duration: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithDuration(duration: number): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum HMErrorCode {

	UnexpectedError = -1,

	AlreadyExists = 1,

	NotFound = 2,

	InvalidParameter = 3,

	AccessoryNotReachable = 4,

	ReadOnlyCharacteristic = 5,

	WriteOnlyCharacteristic = 6,

	NotificationNotSupported = 7,

	OperationTimedOut = 8,

	AccessoryPoweredOff = 9,

	AccessDenied = 10,

	ObjectAssociatedToAnotherHome = 11,

	ObjectNotAssociatedToAnyHome = 12,

	ObjectAlreadyAssociatedToHome = 13,

	AccessoryIsBusy = 14,

	OperationInProgress = 15,

	AccessoryOutOfResources = 16,

	InsufficientPrivileges = 17,

	AccessoryPairingFailed = 18,

	InvalidDataFormatSpecified = 19,

	NilParameter = 20,

	UnconfiguredParameter = 21,

	InvalidClass = 22,

	OperationCancelled = 23,

	RoomForHomeCannotBeInZone = 24,

	NoActionsInActionSet = 25,

	NoRegisteredActionSets = 26,

	MissingParameter = 27,

	FireDateInPast = 28,

	RoomForHomeCannotBeUpdated = 29,

	ActionInAnotherActionSet = 30,

	ObjectWithSimilarNameExistsInHome = 31,

	HomeWithSimilarNameExists = 32,

	RenameWithSimilarName = 33,

	CannotRemoveNonBridgeAccessory = 34,

	NameContainsProhibitedCharacters = 35,

	NameDoesNotStartWithValidCharacters = 36,

	UserIDNotEmailAddress = 37,

	UserDeclinedAddingUser = 38,

	UserDeclinedRemovingUser = 39,

	UserDeclinedInvite = 40,

	UserManagementFailed = 41,

	RecurrenceTooSmall = 42,

	InvalidValueType = 43,

	ValueLowerThanMinimum = 44,

	ValueHigherThanMaximum = 45,

	StringLongerThanMaximum = 46,

	HomeAccessNotAuthorized = 47,

	OperationNotSupported = 48,

	MaximumObjectLimitReached = 49,

	AccessorySentInvalidResponse = 50,

	StringShorterThanMinimum = 51,

	GenericError = 52,

	SecurityFailure = 53,

	CommunicationFailure = 54,

	MessageAuthenticationFailed = 55,

	InvalidMessageSize = 56,

	AccessoryDiscoveryFailed = 57,

	ClientRequestError = 58,

	AccessoryResponseError = 59,

	NameDoesNotEndWithValidCharacters = 60,

	AccessoryIsBlocked = 61,

	InvalidAssociatedServiceType = 62,

	ActionSetExecutionFailed = 63,

	ActionSetExecutionPartialSuccess = 64,

	ActionSetExecutionInProgress = 65,

	AccessoryOutOfCompliance = 66,

	DataResetFailure = 67,

	NotificationAlreadyEnabled = 68,

	RecurrenceMustBeOnSpecifiedBoundaries = 69,

	DateMustBeOnSpecifiedBoundaries = 70,

	CannotActivateTriggerTooFarInFuture = 71,

	RecurrenceTooLarge = 72,

	ReadWritePartialSuccess = 73,

	ReadWriteFailure = 74,

	NotSignedIntoiCloud = 75,

	KeychainSyncNotEnabled = 76,

	CloudDataSyncInProgress = 77,

	NetworkUnavailable = 78,

	AddAccessoryFailed = 79,

	MissingEntitlement = 80,

	CannotUnblockNonBridgeAccessory = 81,

	DeviceLocked = 82,

	CannotRemoveBuiltinActionSet = 83,

	LocationForHomeDisabled = 84,

	NotAuthorizedForLocationServices = 85,

	ReferToUserManual = 86,

	InvalidOrMissingAuthorizationData = 87,

	BridgedAccessoryNotReachable = 88,

	NotAuthorizedForMicrophoneAccess = 89,

	IncompatibleNetwork = 90,

	NoHomeHub = 91,

	NoCompatibleHomeHub = 92,

	IncompatibleAccessory = 93,

	IncompatibleHomeHub = 92,

	ObjectWithSimilarNameExists = 95,

	OwnershipFailure = 96,

	MaximumAccessoriesOfTypeInHome = 97,

	WiFiCredentialGenerationFailed = 98
}

declare var HMErrorDomain: string;

declare class HMEvent extends NSObject {

	static alloc(): HMEvent; // inherited from NSObject

	static isSupportedForHome(home: HMHome): boolean;

	static new(): HMEvent; // inherited from NSObject

	readonly uniqueIdentifier: NSUUID;
}

declare class HMEventTrigger extends HMTrigger {

	static alloc(): HMEventTrigger; // inherited from NSObject

	static new(): HMEventTrigger; // inherited from NSObject

	static predicateForEvaluatingTriggerOccurringAfterDateWithComponents(dateComponents: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerOccurringAfterSignificantEvent(significantEvent: HMSignificantTimeEvent): NSPredicate;

	static predicateForEvaluatingTriggerOccurringAfterSignificantEventApplyingOffset(significantEvent: string, offset: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerOccurringBeforeDateWithComponents(dateComponents: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerOccurringBeforeSignificantEvent(significantEvent: HMSignificantTimeEvent): NSPredicate;

	static predicateForEvaluatingTriggerOccurringBeforeSignificantEventApplyingOffset(significantEvent: string, offset: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerOccurringBetweenDateWithComponentsSecondDateWithComponents(firstDateComponents: NSDateComponents, secondDateWithComponents: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerOccurringBetweenSignificantEventSecondSignificantEvent(firstSignificantEvent: HMSignificantTimeEvent, secondSignificantEvent: HMSignificantTimeEvent): NSPredicate;

	static predicateForEvaluatingTriggerOccurringOnDateWithComponents(dateComponents: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerWithCharacteristicRelatedByToValue(characteristic: HMCharacteristic, operatorType: NSPredicateOperatorType, value: any): NSPredicate;

	static predicateForEvaluatingTriggerWithPresence(presenceEvent: HMPresenceEvent): NSPredicate;

	readonly endEvents: NSArray<HMEvent>;

	readonly events: NSArray<HMEvent>;

	readonly executeOnce: boolean;

	readonly predicate: NSPredicate;

	readonly recurrences: NSArray<NSDateComponents>;

	readonly triggerActivationState: HMEventTriggerActivationState;

	constructor(o: { name: string; events: NSArray<HMEvent> | HMEvent[]; endEvents: NSArray<HMEvent> | HMEvent[]; recurrences: NSArray<NSDateComponents> | NSDateComponents[]; predicate: NSPredicate; });

	constructor(o: { name: string; events: NSArray<HMEvent> | HMEvent[]; predicate: NSPredicate; });

	addEventCompletionHandler(event: HMEvent, completion: (p1: NSError) => void): void;

	initWithNameEventsEndEventsRecurrencesPredicate(name: string, events: NSArray<HMEvent> | HMEvent[], endEvents: NSArray<HMEvent> | HMEvent[], recurrences: NSArray<NSDateComponents> | NSDateComponents[], predicate: NSPredicate): this;

	initWithNameEventsPredicate(name: string, events: NSArray<HMEvent> | HMEvent[], predicate: NSPredicate): this;

	removeEventCompletionHandler(event: HMEvent, completion: (p1: NSError) => void): void;

	updateEndEventsCompletionHandler(endEvents: NSArray<HMEvent> | HMEvent[], completion: (p1: NSError) => void): void;

	updateEventsCompletionHandler(events: NSArray<HMEvent> | HMEvent[], completion: (p1: NSError) => void): void;

	updateExecuteOnceCompletionHandler(executeOnce: boolean, completion: (p1: NSError) => void): void;

	updatePredicateCompletionHandler(predicate: NSPredicate, completion: (p1: NSError) => void): void;

	updateRecurrencesCompletionHandler(recurrences: NSArray<NSDateComponents> | NSDateComponents[], completion: (p1: NSError) => void): void;
}

declare const enum HMEventTriggerActivationState {

	Disabled = 0,

	DisabledNoHomeHub = 1,

	DisabledNoCompatibleHomeHub = 2,

	DisabledNoLocationServicesAuthorization = 3,

	Enabled = 4
}

declare class HMHome extends NSObject {

	static alloc(): HMHome; // inherited from NSObject

	static new(): HMHome; // inherited from NSObject

	readonly accessories: NSArray<HMAccessory>;

	readonly actionSets: NSArray<HMActionSet>;

	readonly currentUser: HMUser;

	delegate: HMHomeDelegate;

	readonly homeHubState: HMHomeHubState;

	readonly name: string;

	readonly primary: boolean;

	readonly rooms: NSArray<HMRoom>;

	readonly serviceGroups: NSArray<HMServiceGroup>;

	readonly supportsAddingNetworkRouter: boolean;

	readonly triggers: NSArray<HMTrigger>;

	readonly uniqueIdentifier: NSUUID;

	readonly users: NSArray<HMUser>;

	readonly zones: NSArray<HMZone>;

	addAccessoryCompletionHandler(accessory: HMAccessory, completion: (p1: NSError) => void): void;

	addActionSetWithNameCompletionHandler(actionSetName: string, completion: (p1: HMActionSet, p2: NSError) => void): void;

	addAndSetupAccessoriesWithCompletionHandler(completion: (p1: NSError) => void): void;

	addAndSetupAccessoriesWithPayloadCompletionHandler(payload: HMAccessorySetupPayload, completion: (p1: NSArray<HMAccessory>, p2: NSError) => void): void;

	addRoomWithNameCompletionHandler(roomName: string, completion: (p1: HMRoom, p2: NSError) => void): void;

	addServiceGroupWithNameCompletionHandler(serviceGroupName: string, completion: (p1: HMServiceGroup, p2: NSError) => void): void;

	addTriggerCompletionHandler(trigger: HMTrigger, completion: (p1: NSError) => void): void;

	addUserWithCompletionHandler(completion: (p1: HMUser, p2: NSError) => void): void;

	addZoneWithNameCompletionHandler(zoneName: string, completion: (p1: HMZone, p2: NSError) => void): void;

	assignAccessoryToRoomCompletionHandler(accessory: HMAccessory, room: HMRoom, completion: (p1: NSError) => void): void;

	builtinActionSetOfType(actionSetType: string): HMActionSet;

	executeActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	homeAccessControlForUser(user: HMUser): HMHomeAccessControl;

	manageUsersWithCompletionHandler(completion: (p1: NSError) => void): void;

	removeAccessoryCompletionHandler(accessory: HMAccessory, completion: (p1: NSError) => void): void;

	removeActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	removeRoomCompletionHandler(room: HMRoom, completion: (p1: NSError) => void): void;

	removeServiceGroupCompletionHandler(group: HMServiceGroup, completion: (p1: NSError) => void): void;

	removeTriggerCompletionHandler(trigger: HMTrigger, completion: (p1: NSError) => void): void;

	removeUserCompletionHandler(user: HMUser, completion: (p1: NSError) => void): void;

	removeZoneCompletionHandler(zone: HMZone, completion: (p1: NSError) => void): void;

	roomForEntireHome(): HMRoom;

	servicesWithTypes(serviceTypes: NSArray<string> | string[]): NSArray<HMService>;

	unblockAccessoryCompletionHandler(accessory: HMAccessory, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

declare class HMHomeAccessControl extends HMAccessControl {

	static alloc(): HMHomeAccessControl; // inherited from NSObject

	static new(): HMHomeAccessControl; // inherited from NSObject

	readonly administrator: boolean;
}

interface HMHomeDelegate extends NSObjectProtocol {

	homeDidAddAccessory?(home: HMHome, accessory: HMAccessory): void;

	homeDidAddActionSet?(home: HMHome, actionSet: HMActionSet): void;

	homeDidAddRoom?(home: HMHome, room: HMRoom): void;

	homeDidAddRoomToZone?(home: HMHome, room: HMRoom, zone: HMZone): void;

	homeDidAddServiceGroup?(home: HMHome, group: HMServiceGroup): void;

	homeDidAddServiceToServiceGroup?(home: HMHome, service: HMService, group: HMServiceGroup): void;

	homeDidAddTrigger?(home: HMHome, trigger: HMTrigger): void;

	homeDidAddUser?(home: HMHome, user: HMUser): void;

	homeDidAddZone?(home: HMHome, zone: HMZone): void;

	homeDidEncounterErrorForAccessory?(home: HMHome, error: NSError, accessory: HMAccessory): void;

	homeDidRemoveAccessory?(home: HMHome, accessory: HMAccessory): void;

	homeDidRemoveActionSet?(home: HMHome, actionSet: HMActionSet): void;

	homeDidRemoveRoom?(home: HMHome, room: HMRoom): void;

	homeDidRemoveRoomFromZone?(home: HMHome, room: HMRoom, zone: HMZone): void;

	homeDidRemoveServiceFromServiceGroup?(home: HMHome, service: HMService, group: HMServiceGroup): void;

	homeDidRemoveServiceGroup?(home: HMHome, group: HMServiceGroup): void;

	homeDidRemoveTrigger?(home: HMHome, trigger: HMTrigger): void;

	homeDidRemoveUser?(home: HMHome, user: HMUser): void;

	homeDidRemoveZone?(home: HMHome, zone: HMZone): void;

	homeDidUnblockAccessory?(home: HMHome, accessory: HMAccessory): void;

	homeDidUpdateAccessControlForCurrentUser?(home: HMHome): void;

	homeDidUpdateActionsForActionSet?(home: HMHome, actionSet: HMActionSet): void;

	homeDidUpdateHomeHubState?(home: HMHome, homeHubState: HMHomeHubState): void;

	homeDidUpdateName?(home: HMHome): void;

	homeDidUpdateNameForActionSet?(home: HMHome, actionSet: HMActionSet): void;

	homeDidUpdateNameForRoom?(home: HMHome, room: HMRoom): void;

	homeDidUpdateNameForServiceGroup?(home: HMHome, group: HMServiceGroup): void;

	homeDidUpdateNameForTrigger?(home: HMHome, trigger: HMTrigger): void;

	homeDidUpdateNameForZone?(home: HMHome, zone: HMZone): void;

	homeDidUpdateRoomForAccessory?(home: HMHome, room: HMRoom, accessory: HMAccessory): void;

	homeDidUpdateSupportedFeatures?(home: HMHome): void;

	homeDidUpdateTrigger?(home: HMHome, trigger: HMTrigger): void;
}
declare var HMHomeDelegate: {

	prototype: HMHomeDelegate;
};

declare const enum HMHomeHubState {

	NotAvailable = 0,

	Connected = 1,

	Disconnected = 2
}

declare class HMHomeManager extends NSObject {

	static alloc(): HMHomeManager; // inherited from NSObject

	static new(): HMHomeManager; // inherited from NSObject

	readonly authorizationStatus: HMHomeManagerAuthorizationStatus;

	delegate: HMHomeManagerDelegate;

	readonly homes: NSArray<HMHome>;

	readonly primaryHome: HMHome;

	addHomeWithNameCompletionHandler(homeName: string, completion: (p1: HMHome, p2: NSError) => void): void;

	removeHomeCompletionHandler(home: HMHome, completion: (p1: NSError) => void): void;

	updatePrimaryHomeCompletionHandler(home: HMHome, completion: (p1: NSError) => void): void;
}

declare const enum HMHomeManagerAuthorizationStatus {

	Determined = 1,

	Restricted = 2,

	Authorized = 4
}

interface HMHomeManagerDelegate extends NSObjectProtocol {

	homeManagerDidAddHome?(manager: HMHomeManager, home: HMHome): void;

	homeManagerDidReceiveAddAccessoryRequest?(manager: HMHomeManager, request: HMAddAccessoryRequest): void;

	homeManagerDidRemoveHome?(manager: HMHomeManager, home: HMHome): void;

	homeManagerDidUpdateAuthorizationStatus?(manager: HMHomeManager, status: HMHomeManagerAuthorizationStatus): void;

	homeManagerDidUpdateHomes?(manager: HMHomeManager): void;

	homeManagerDidUpdatePrimaryHome?(manager: HMHomeManager): void;
}
declare var HMHomeManagerDelegate: {

	prototype: HMHomeManagerDelegate;
};

declare class HMLocationEvent extends HMEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMLocationEvent; // inherited from NSObject

	static new(): HMLocationEvent; // inherited from NSObject

	readonly region: CLRegion;

	constructor(o: { region: CLRegion; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithRegion(region: CLRegion): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	updateRegionCompletionHandler(region: CLRegion, completion: (p1: NSError) => void): void;
}

declare class HMMutableCalendarEvent extends HMCalendarEvent {

	static alloc(): HMMutableCalendarEvent; // inherited from NSObject

	static new(): HMMutableCalendarEvent; // inherited from NSObject

	fireDateComponents: NSDateComponents;
}

declare class HMMutableCharacteristicEvent<TriggerValueType extends NSObject> extends HMCharacteristicEvent<NSObject> {

	static alloc(): any; // inherited from NSObject

	static new(): any; // inherited from NSObject

	characteristic: HMCharacteristic;

	triggerValue: TriggerValueType;
}

declare class HMMutableCharacteristicThresholdRangeEvent extends HMCharacteristicThresholdRangeEvent {

	static alloc(): HMMutableCharacteristicThresholdRangeEvent; // inherited from NSObject

	static new(): HMMutableCharacteristicThresholdRangeEvent; // inherited from NSObject

	characteristic: HMCharacteristic;

	thresholdRange: HMNumberRange;
}

declare class HMMutableDurationEvent extends HMDurationEvent {

	static alloc(): HMMutableDurationEvent; // inherited from NSObject

	static new(): HMMutableDurationEvent; // inherited from NSObject

	duration: number;
}

declare class HMMutableLocationEvent extends HMLocationEvent {

	static alloc(): HMMutableLocationEvent; // inherited from NSObject

	static new(): HMMutableLocationEvent; // inherited from NSObject

	region: CLRegion;
}

declare class HMMutablePresenceEvent extends HMPresenceEvent {

	static alloc(): HMMutablePresenceEvent; // inherited from NSObject

	static new(): HMMutablePresenceEvent; // inherited from NSObject

	presenceEventType: HMPresenceEventType;

	presenceUserType: HMPresenceEventUserType;
}

declare class HMMutableSignificantTimeEvent extends HMSignificantTimeEvent {

	static alloc(): HMMutableSignificantTimeEvent; // inherited from NSObject

	static new(): HMMutableSignificantTimeEvent; // inherited from NSObject

	offset: NSDateComponents;

	significantEvent: string;
}

declare class HMNetworkConfigurationProfile extends HMAccessoryProfile {

	static alloc(): HMNetworkConfigurationProfile; // inherited from NSObject

	static new(): HMNetworkConfigurationProfile; // inherited from NSObject

	delegate: HMNetworkConfigurationProfileDelegate;

	readonly networkAccessRestricted: boolean;
}

interface HMNetworkConfigurationProfileDelegate extends NSObjectProtocol {

	profileDidUpdateNetworkAccessMode?(profile: HMNetworkConfigurationProfile): void;
}
declare var HMNetworkConfigurationProfileDelegate: {

	prototype: HMNetworkConfigurationProfileDelegate;
};

declare class HMNumberRange extends NSObject {

	static alloc(): HMNumberRange; // inherited from NSObject

	static new(): HMNumberRange; // inherited from NSObject

	static numberRangeWithMaxValue(maxValue: number): HMNumberRange;

	static numberRangeWithMinValue(minValue: number): HMNumberRange;

	static numberRangeWithMinValueMaxValue(minValue: number, maxValue: number): HMNumberRange;

	readonly maxValue: number;

	readonly minValue: number;
}

declare class HMPresenceEvent extends HMEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMPresenceEvent; // inherited from NSObject

	static new(): HMPresenceEvent; // inherited from NSObject

	readonly presenceEventType: HMPresenceEventType;

	readonly presenceUserType: HMPresenceEventUserType;

	constructor(o: { presenceEventType: HMPresenceEventType; presenceUserType: HMPresenceEventUserType; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithPresenceEventTypePresenceUserType(presenceEventType: HMPresenceEventType, presenceUserType: HMPresenceEventUserType): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare const enum HMPresenceEventType {

	EveryEntry = 1,

	EveryExit = 2,

	FirstEntry = 3,

	LastExit = 4,

	AtHome = 3,

	NotAtHome = 4
}

declare const enum HMPresenceEventUserType {

	CurrentUser = 1,

	HomeUsers = 2,

	CustomUsers = 3
}

declare var HMPresenceKeyPath: string;

declare class HMRoom extends NSObject {

	static alloc(): HMRoom; // inherited from NSObject

	static new(): HMRoom; // inherited from NSObject

	readonly accessories: NSArray<HMAccessory>;

	readonly name: string;

	readonly uniqueIdentifier: NSUUID;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

declare class HMService extends NSObject {

	static alloc(): HMService; // inherited from NSObject

	static new(): HMService; // inherited from NSObject

	readonly accessory: HMAccessory;

	readonly associatedServiceType: string;

	readonly characteristics: NSArray<HMCharacteristic>;

	readonly linkedServices: NSArray<HMService>;

	readonly localizedDescription: string;

	readonly name: string;

	readonly primaryService: boolean;

	readonly serviceType: string;

	readonly uniqueIdentifier: NSUUID;

	readonly userInteractive: boolean;

	updateAssociatedServiceTypeCompletionHandler(serviceType: string, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

declare class HMServiceGroup extends NSObject {

	static alloc(): HMServiceGroup; // inherited from NSObject

	static new(): HMServiceGroup; // inherited from NSObject

	readonly name: string;

	readonly services: NSArray<HMService>;

	readonly uniqueIdentifier: NSUUID;

	addServiceCompletionHandler(service: HMService, completion: (p1: NSError) => void): void;

	removeServiceCompletionHandler(service: HMService, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

declare var HMServiceTypeAccessoryInformation: string;

declare var HMServiceTypeAirPurifier: string;

declare var HMServiceTypeAirQualitySensor: string;

declare var HMServiceTypeBattery: string;

declare var HMServiceTypeCameraControl: string;

declare var HMServiceTypeCameraRTPStreamManagement: string;

declare var HMServiceTypeCarbonDioxideSensor: string;

declare var HMServiceTypeCarbonMonoxideSensor: string;

declare var HMServiceTypeContactSensor: string;

declare var HMServiceTypeDoor: string;

declare var HMServiceTypeDoorbell: string;

declare var HMServiceTypeFan: string;

declare var HMServiceTypeFaucet: string;

declare var HMServiceTypeFilterMaintenance: string;

declare var HMServiceTypeGarageDoorOpener: string;

declare var HMServiceTypeHeaterCooler: string;

declare var HMServiceTypeHumidifierDehumidifier: string;

declare var HMServiceTypeHumiditySensor: string;

declare var HMServiceTypeIrrigationSystem: string;

declare var HMServiceTypeLabel: string;

declare var HMServiceTypeLeakSensor: string;

declare var HMServiceTypeLightSensor: string;

declare var HMServiceTypeLightbulb: string;

declare var HMServiceTypeLockManagement: string;

declare var HMServiceTypeLockMechanism: string;

declare var HMServiceTypeMicrophone: string;

declare var HMServiceTypeMotionSensor: string;

declare var HMServiceTypeOccupancySensor: string;

declare var HMServiceTypeOutlet: string;

declare var HMServiceTypeSecuritySystem: string;

declare var HMServiceTypeSlats: string;

declare var HMServiceTypeSmokeSensor: string;

declare var HMServiceTypeSpeaker: string;

declare var HMServiceTypeStatefulProgrammableSwitch: string;

declare var HMServiceTypeStatelessProgrammableSwitch: string;

declare var HMServiceTypeSwitch: string;

declare var HMServiceTypeTemperatureSensor: string;

declare var HMServiceTypeThermostat: string;

declare var HMServiceTypeValve: string;

declare var HMServiceTypeVentilationFan: string;

declare var HMServiceTypeWindow: string;

declare var HMServiceTypeWindowCovering: string;

declare var HMSignificantEventSunrise: string;

declare var HMSignificantEventSunset: string;

declare class HMSignificantTimeEvent extends HMTimeEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMSignificantTimeEvent; // inherited from NSObject

	static new(): HMSignificantTimeEvent; // inherited from NSObject

	readonly offset: NSDateComponents;

	readonly significantEvent: string;

	constructor(o: { significantEvent: string; offset: NSDateComponents; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithSignificantEventOffset(significantEvent: string, offset: NSDateComponents): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class HMTimeEvent extends HMEvent {

	static alloc(): HMTimeEvent; // inherited from NSObject

	static new(): HMTimeEvent; // inherited from NSObject
}

declare class HMTimerTrigger extends HMTrigger {

	static alloc(): HMTimerTrigger; // inherited from NSObject

	static new(): HMTimerTrigger; // inherited from NSObject

	readonly fireDate: Date;

	readonly recurrence: NSDateComponents;

	readonly recurrenceCalendar: NSCalendar;

	readonly timeZone: NSTimeZone;

	constructor(o: { name: string; fireDate: Date; timeZone: NSTimeZone; recurrence: NSDateComponents; recurrenceCalendar: NSCalendar; });

	initWithNameFireDateTimeZoneRecurrenceRecurrenceCalendar(name: string, fireDate: Date, timeZone: NSTimeZone, recurrence: NSDateComponents, recurrenceCalendar: NSCalendar): this;

	updateFireDateCompletionHandler(fireDate: Date, completion: (p1: NSError) => void): void;

	updateRecurrenceCompletionHandler(recurrence: NSDateComponents, completion: (p1: NSError) => void): void;

	updateTimeZoneCompletionHandler(timeZone: NSTimeZone, completion: (p1: NSError) => void): void;
}

declare class HMTrigger extends NSObject {

	static alloc(): HMTrigger; // inherited from NSObject

	static new(): HMTrigger; // inherited from NSObject

	readonly actionSets: NSArray<HMActionSet>;

	readonly enabled: boolean;

	readonly lastFireDate: Date;

	readonly name: string;

	readonly uniqueIdentifier: NSUUID;

	addActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	enableCompletionHandler(enable: boolean, completion: (p1: NSError) => void): void;

	removeActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

declare class HMUser extends NSObject {

	static alloc(): HMUser; // inherited from NSObject

	static new(): HMUser; // inherited from NSObject

	readonly name: string;

	readonly uniqueIdentifier: NSUUID;
}

declare var HMUserFailedAccessoriesKey: string;

declare class HMZone extends NSObject {

	static alloc(): HMZone; // inherited from NSObject

	static new(): HMZone; // inherited from NSObject

	readonly name: string;

	readonly rooms: NSArray<HMRoom>;

	readonly uniqueIdentifier: NSUUID;

	addRoomCompletionHandler(room: HMRoom, completion: (p1: NSError) => void): void;

	removeRoomCompletionHandler(room: HMRoom, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}
