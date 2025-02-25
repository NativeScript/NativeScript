
/**
 * @since 11.2
 */
declare class HMAccessControl extends NSObject {

	static alloc(): HMAccessControl; // inherited from NSObject

	static new(): HMAccessControl; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare class HMAccessory extends NSObject {

	static alloc(): HMAccessory; // inherited from NSObject

	static new(): HMAccessory; // inherited from NSObject

	readonly blocked: boolean;

	readonly bridged: boolean;

	/**
	 * @since 10.0
	 */
	readonly cameraProfiles: NSArray<HMCameraProfile>;

	/**
	 * @since 9.0
	 */
	readonly category: HMAccessoryCategory;

	delegate: HMAccessoryDelegate;

	/**
	 * @since 11.0
	 */
	readonly firmwareVersion: string;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly identifier: NSUUID;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly identifiersForBridgedAccessories: NSArray<NSUUID>;

	/**
	 * @since 11.0
	 */
	readonly manufacturer: string;

	/**
	 * @since 16.1
	 */
	readonly matterNodeID: number;

	/**
	 * @since 11.0
	 */
	readonly model: string;

	readonly name: string;

	/**
	 * @since 11.0
	 */
	readonly profiles: NSArray<HMAccessoryProfile>;

	readonly reachable: boolean;

	readonly room: HMRoom;

	readonly services: NSArray<HMService>;

	/**
	 * @since 11.3
	 */
	readonly supportsIdentify: boolean;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifiersForBridgedAccessories: NSArray<NSUUID>;

	identifyWithCompletionHandler(completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare class HMAccessoryBrowser extends NSObject {

	static alloc(): HMAccessoryBrowser; // inherited from NSObject

	static new(): HMAccessoryBrowser; // inherited from NSObject

	delegate: HMAccessoryBrowserDelegate;

	readonly discoveredAccessories: NSArray<HMAccessory>;

	startSearchingForNewAccessories(): void;

	stopSearchingForNewAccessories(): void;
}

/**
 * @since 8.0
 */
interface HMAccessoryBrowserDelegate extends NSObjectProtocol {

	accessoryBrowserDidFindNewAccessory?(browser: HMAccessoryBrowser, accessory: HMAccessory): void;

	accessoryBrowserDidRemoveNewAccessory?(browser: HMAccessoryBrowser, accessory: HMAccessory): void;
}
declare var HMAccessoryBrowserDelegate: {

	prototype: HMAccessoryBrowserDelegate;
};

/**
 * @since 9.0
 */
declare class HMAccessoryCategory extends NSObject {

	static alloc(): HMAccessoryCategory; // inherited from NSObject

	static new(): HMAccessoryCategory; // inherited from NSObject

	readonly categoryType: string;

	readonly localizedDescription: string;
}

/**
 * @since 10.2
 */
declare var HMAccessoryCategoryTypeAirConditioner: string;

/**
 * @since 10.2
 */
declare var HMAccessoryCategoryTypeAirDehumidifier: string;

/**
 * @since 10.2
 */
declare var HMAccessoryCategoryTypeAirHeater: string;

/**
 * @since 10.2
 */
declare var HMAccessoryCategoryTypeAirHumidifier: string;

/**
 * @since 18.0
 */
declare var HMAccessoryCategoryTypeAirPort: string;

/**
 * @since 10.2
 */
declare var HMAccessoryCategoryTypeAirPurifier: string;

/**
 * @since 18.0
 */
declare var HMAccessoryCategoryTypeAudioReceiver: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeBridge: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeDoor: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeDoorLock: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeFan: string;

/**
 * @since 11.2
 */
declare var HMAccessoryCategoryTypeFaucet: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeGarageDoorOpener: string;

/**
 * @since 10.0
 */
declare var HMAccessoryCategoryTypeIPCamera: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeLightbulb: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeOther: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeOutlet: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeProgrammableSwitch: string;

/**
 * @since 9.3
 */
declare var HMAccessoryCategoryTypeRangeExtender: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeSecuritySystem: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeSensor: string;

/**
 * @since 11.2
 */
declare var HMAccessoryCategoryTypeShowerHead: string;

/**
 * @since 18.0
 */
declare var HMAccessoryCategoryTypeSpeaker: string;

/**
 * @since 11.2
 */
declare var HMAccessoryCategoryTypeSprinkler: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeSwitch: string;

/**
 * @since 18.0
 */
declare var HMAccessoryCategoryTypeTelevision: string;

/**
 * @since 18.0
 */
declare var HMAccessoryCategoryTypeTelevisionSetTopBox: string;

/**
 * @since 18.0
 */
declare var HMAccessoryCategoryTypeTelevisionStreamingStick: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeThermostat: string;

/**
 * @since 10.0
 */
declare var HMAccessoryCategoryTypeVideoDoorbell: string;

/**
 * @since 18.0
 */
declare var HMAccessoryCategoryTypeWiFiRouter: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeWindow: string;

/**
 * @since 9.0
 */
declare var HMAccessoryCategoryTypeWindowCovering: string;

/**
 * @since 8.0
 */
interface HMAccessoryDelegate extends NSObjectProtocol {

	/**
	 * @since 11.0
	 */
	accessoryDidAddProfile?(accessory: HMAccessory, profile: HMAccessoryProfile): void;

	/**
	 * @since 11.0
	 */
	accessoryDidRemoveProfile?(accessory: HMAccessory, profile: HMAccessoryProfile): void;

	accessoryDidUpdateAssociatedServiceTypeForService?(accessory: HMAccessory, service: HMService): void;

	/**
	 * @since 11.0
	 */
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

/**
 * @since 13.0
 */
declare class HMAccessoryOwnershipToken extends NSObject {

	static alloc(): HMAccessoryOwnershipToken; // inherited from NSObject

	static new(): HMAccessoryOwnershipToken; // inherited from NSObject

	constructor(o: { data: NSData; });

	initWithData(data: NSData): this;
}

/**
 * @since 10.0
 */
declare class HMAccessoryProfile extends NSObject {

	static alloc(): HMAccessoryProfile; // inherited from NSObject

	static new(): HMAccessoryProfile; // inherited from NSObject

	readonly accessory: HMAccessory;

	readonly services: NSArray<HMService>;

	readonly uniqueIdentifier: NSUUID;
}

/**
 * @since 15.0
 */
declare class HMAccessorySetupManager extends NSObject {

	static alloc(): HMAccessorySetupManager; // inherited from NSObject

	static new(): HMAccessorySetupManager; // inherited from NSObject

	/**
	 * @since 15.4
	 */
	performAccessorySetupUsingRequestCompletionHandler(request: HMAccessorySetupRequest, completion: (p1: HMAccessorySetupResult, p2: NSError) => void): void;
}

/**
 * @since 11.3
 */
declare class HMAccessorySetupPayload extends NSObject {

	static alloc(): HMAccessorySetupPayload; // inherited from NSObject

	static new(): HMAccessorySetupPayload; // inherited from NSObject

	constructor(o: { URL: NSURL; });

	/**
	 * @since 13.0
	 */
	constructor(o: { URL: NSURL; ownershipToken: HMAccessoryOwnershipToken; });

	initWithURL(setupPayloadURL: NSURL): this;

	/**
	 * @since 13.0
	 */
	initWithURLOwnershipToken(setupPayloadURL: NSURL, ownershipToken: HMAccessoryOwnershipToken): this;
}

/**
 * @since 15.4
 */
declare class HMAccessorySetupRequest extends NSObject implements NSCopying {

	static alloc(): HMAccessorySetupRequest; // inherited from NSObject

	static new(): HMAccessorySetupRequest; // inherited from NSObject

	homeUniqueIdentifier: NSUUID;

	matterPayload: MTRSetupPayload;

	payload: HMAccessorySetupPayload;

	suggestedAccessoryName: string;

	suggestedRoomUniqueIdentifier: NSUUID;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 15.4
 */
declare class HMAccessorySetupResult extends NSObject implements NSCopying {

	static alloc(): HMAccessorySetupResult; // inherited from NSObject

	static new(): HMAccessorySetupResult; // inherited from NSObject

	readonly accessoryUniqueIdentifiers: NSArray<NSUUID>;

	readonly homeUniqueIdentifier: NSUUID;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
declare class HMAction extends NSObject {

	static alloc(): HMAction; // inherited from NSObject

	static new(): HMAction; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;
}

/**
 * @since 8.0
 */
declare class HMActionSet extends NSObject {

	static alloc(): HMActionSet; // inherited from NSObject

	static new(): HMActionSet; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	readonly actionSetType: string;

	readonly actions: NSSet<HMAction>;

	readonly executing: boolean;

	/**
	 * @since 10.0
	 */
	readonly lastExecutionDate: Date;

	readonly name: string;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	addActionCompletionHandler(action: HMAction, completion: (p1: NSError) => void): void;

	removeActionCompletionHandler(action: HMAction, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare var HMActionSetTypeHomeArrival: string;

/**
 * @since 9.0
 */
declare var HMActionSetTypeHomeDeparture: string;

/**
 * @since 9.0
 */
declare var HMActionSetTypeSleep: string;

/**
 * @since 10.0
 */
declare var HMActionSetTypeTriggerOwned: string;

/**
 * @since 9.0
 */
declare var HMActionSetTypeUserDefined: string;

/**
 * @since 9.0
 */
declare var HMActionSetTypeWakeUp: string;

declare class HMAddAccessoryRequest extends NSObject {

	static alloc(): HMAddAccessoryRequest; // inherited from NSObject

	static new(): HMAddAccessoryRequest; // inherited from NSObject

	readonly accessoryCategory: HMAccessoryCategory;

	readonly accessoryName: string;

	readonly home: HMHome;

	/**
	 * @since 13.0
	 * @deprecated 13.0
	 */
	readonly requiresOwnershipToken: boolean;

	readonly requiresSetupPayloadURL: boolean;

	payloadWithOwnershipToken(ownershipToken: HMAccessoryOwnershipToken): HMAccessorySetupPayload;

	payloadWithURLOwnershipToken(setupPayloadURL: NSURL, ownershipToken: HMAccessoryOwnershipToken): HMAccessorySetupPayload;
}

/**
 * @since 11.0
 */
declare class HMCalendarEvent extends HMTimeEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMCalendarEvent; // inherited from NSObject

	static new(): HMCalendarEvent; // inherited from NSObject

	readonly fireDateComponents: NSDateComponents;

	constructor(o: { fireDateComponents: NSDateComponents; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithFireDateComponents(fireDateComponents: NSDateComponents): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 10.0
 */
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

/**
 * @since 10.0
 */
declare class HMCameraControl extends NSObject {

	static alloc(): HMCameraControl; // inherited from NSObject

	static new(): HMCameraControl; // inherited from NSObject
}

/**
 * @since 10.0
 */
declare class HMCameraProfile extends HMAccessoryProfile {

	static alloc(): HMCameraProfile; // inherited from NSObject

	static new(): HMCameraProfile; // inherited from NSObject

	readonly microphoneControl: HMCameraAudioControl;

	readonly settingsControl: HMCameraSettingsControl;

	readonly snapshotControl: HMCameraSnapshotControl;

	readonly speakerControl: HMCameraAudioControl;

	readonly streamControl: HMCameraStreamControl;
}

/**
 * @since 10.0
 */
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

/**
 * @since 10.0
 */
declare class HMCameraSnapshot extends HMCameraSource {

	static alloc(): HMCameraSnapshot; // inherited from NSObject

	static new(): HMCameraSnapshot; // inherited from NSObject

	readonly captureDate: Date;
}

/**
 * @since 10.0
 */
declare class HMCameraSnapshotControl extends HMCameraControl {

	static alloc(): HMCameraSnapshotControl; // inherited from NSObject

	static new(): HMCameraSnapshotControl; // inherited from NSObject

	delegate: HMCameraSnapshotControlDelegate;

	readonly mostRecentSnapshot: HMCameraSnapshot;

	takeSnapshot(): void;
}

/**
 * @since 10.0
 */
interface HMCameraSnapshotControlDelegate extends NSObjectProtocol {

	cameraSnapshotControlDidTakeSnapshotError?(cameraSnapshotControl: HMCameraSnapshotControl, snapshot: HMCameraSnapshot, error: NSError): void;

	cameraSnapshotControlDidUpdateMostRecentSnapshot?(cameraSnapshotControl: HMCameraSnapshotControl): void;
}
declare var HMCameraSnapshotControlDelegate: {

	prototype: HMCameraSnapshotControlDelegate;
};

/**
 * @since 10.0
 */
declare class HMCameraSource extends NSObject {

	static alloc(): HMCameraSource; // inherited from NSObject

	static new(): HMCameraSource; // inherited from NSObject

	/**
	 * @since 14.5
	 */
	readonly aspectRatio: number;
}

/**
 * @since 10.0
 */
declare class HMCameraStream extends HMCameraSource {

	static alloc(): HMCameraStream; // inherited from NSObject

	static new(): HMCameraStream; // inherited from NSObject

	readonly audioStreamSetting: HMCameraAudioStreamSetting;

	/**
	 * @since 10.0
	 * @deprecated 10.0
	 */
	setAudioStreamSetting(audioStreamSetting: HMCameraAudioStreamSetting): void;

	updateAudioStreamSettingCompletionHandler(audioStreamSetting: HMCameraAudioStreamSetting, completion: (p1: NSError) => void): void;
}

/**
 * @since 10.0
 */
declare class HMCameraStreamControl extends HMCameraControl {

	static alloc(): HMCameraStreamControl; // inherited from NSObject

	static new(): HMCameraStreamControl; // inherited from NSObject

	readonly cameraStream: HMCameraStream;

	delegate: HMCameraStreamControlDelegate;

	readonly streamState: HMCameraStreamState;

	startStream(): void;

	stopStream(): void;
}

/**
 * @since 10.0
 */
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

/**
 * @since 10.0
 */
declare class HMCameraView extends UIView {

	static alloc(): HMCameraView; // inherited from NSObject

	static appearance(): HMCameraView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 */
	static appearanceForTraitCollection(trait: UITraitCollection): HMCameraView; // inherited from UIAppearance

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	static appearanceForTraitCollectionWhenContainedIn(trait: UITraitCollection, ContainerClass: typeof NSObject): HMCameraView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceForTraitCollectionWhenContainedInInstancesOfClasses(trait: UITraitCollection, containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HMCameraView; // inherited from UIAppearance

	/**
	 * @since 5.0
	 * @deprecated 9.0
	 */
	static appearanceWhenContainedIn(ContainerClass: typeof NSObject): HMCameraView; // inherited from UIAppearance

	/**
	 * @since 9.0
	 */
	static appearanceWhenContainedInInstancesOfClasses(containerTypes: NSArray<typeof NSObject> | typeof NSObject[]): HMCameraView; // inherited from UIAppearance

	static new(): HMCameraView; // inherited from NSObject

	cameraSource: HMCameraSource;
}

/**
 * @since 8.0
 */
declare class HMCharacteristic extends NSObject {

	static alloc(): HMCharacteristic; // inherited from NSObject

	static new(): HMCharacteristic; // inherited from NSObject

	readonly characteristicType: string;

	/**
	 * @since 9.0
	 */
	readonly localizedDescription: string;

	readonly metadata: HMCharacteristicMetadata;

	readonly notificationEnabled: boolean;

	readonly properties: NSArray<string>;

	readonly service: HMService;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	readonly value: any;

	enableNotificationCompletionHandler(enable: boolean, completion: (p1: NSError) => void): void;

	readValueWithCompletionHandler(completion: (p1: NSError) => void): void;

	updateAuthorizationDataCompletionHandler(data: NSData, completion: (p1: NSError) => void): void;

	writeValueCompletionHandler(value: any, completion: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare class HMCharacteristicEvent<TriggerValueType> extends HMEvent implements NSCopying, NSMutableCopying {

	static alloc<TriggerValueType>(): HMCharacteristicEvent<TriggerValueType>; // inherited from NSObject

	static new<TriggerValueType>(): HMCharacteristicEvent<TriggerValueType>; // inherited from NSObject

	readonly characteristic: HMCharacteristic;

	readonly triggerValue: any;

	constructor(o: { characteristic: HMCharacteristic; triggerValue: any; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithCharacteristicTriggerValue(characteristic: HMCharacteristic, triggerValue: any): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	updateTriggerValueCompletionHandler(triggerValue: any, completion: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare var HMCharacteristicKeyPath: string;

/**
 * @since 8.0
 */
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

	/**
	 * @since 10.0
	 */
	readonly validValues: NSArray<number>;
}

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatArray: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatBool: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatData: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatDictionary: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatFloat: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatInt: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatString: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatTLV8: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatUInt16: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatUInt32: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatUInt64: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataFormatUInt8: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataUnitsArcDegree: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataUnitsCelsius: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataUnitsFahrenheit: string;

/**
 * @since 9.3
 */
declare var HMCharacteristicMetadataUnitsLux: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicMetadataUnitsMicrogramsPerCubicMeter: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicMetadataUnitsPartsPerMillion: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicMetadataUnitsPercentage: string;

/**
 * @since 8.3
 */
declare var HMCharacteristicMetadataUnitsSeconds: string;

/**
 * @since 9.3
 */
declare var HMCharacteristicPropertyHidden: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicPropertyReadable: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicPropertyRequiresAuthorizationData: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicPropertySupportsEventNotification: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicPropertyWritable: string;

/**
 * @since 11.0
 */
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

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeActive: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeActiveIdentifier: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeAdminOnlyAccess: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeAirParticulateDensity: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeAirParticulateSize: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeAirQuality: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeAudioFeedback: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeBatteryLevel: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeBrightness: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCarbonDioxideDetected: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCarbonDioxideLevel: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCarbonDioxidePeakLevel: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCarbonMonoxideDetected: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCarbonMonoxideLevel: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCarbonMonoxidePeakLevel: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeChargingState: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeClosedCaptions: string;

/**
 * @since 11.0
 */
declare var HMCharacteristicTypeColorTemperature: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeConfiguredName: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeContactState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeCoolingThreshold: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeCurrentAirPurifierState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeCurrentDoorState: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeCurrentFanState: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeCurrentHeaterCoolerState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeCurrentHeatingCooling: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCurrentHorizontalTilt: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeCurrentHumidifierDehumidifierState: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCurrentLightLevel: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeCurrentLockMechanismState: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeCurrentMediaState: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCurrentPosition: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeCurrentRelativeHumidity: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCurrentSecuritySystemState: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeCurrentSlatState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeCurrentTemperature: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeCurrentTilt: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeCurrentVerticalTilt: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeCurrentVisibilityState: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeDehumidifierThreshold: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeDigitalZoom: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeFilterChangeIndication: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeFilterLifeLevel: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeFilterResetChangeIndication: string;

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare var HMCharacteristicTypeFirmwareVersion: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeHardwareVersion: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeHeatingThreshold: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeHoldPosition: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeHue: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeHumidifierThreshold: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeIdentifier: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeIdentify: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeImageMirroring: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeImageRotation: string;

/**
 * @since 11.2
 */
declare var HMCharacteristicTypeInUse: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeInputDeviceType: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeInputEvent: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeInputSourceType: string;

/**
 * @since 11.2
 */
declare var HMCharacteristicTypeIsConfigured: string;

/**
 * @since 10.3
 */
declare var HMCharacteristicTypeLabelIndex: string;

/**
 * @since 10.3
 */
declare var HMCharacteristicTypeLabelNamespace: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeLeakDetected: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeLockManagementAutoSecureTimeout: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeLockManagementControlPoint: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeLockMechanismLastKnownAction: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeLockPhysicalControls: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeLogs: string;

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare var HMCharacteristicTypeManufacturer: string;

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare var HMCharacteristicTypeModel: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeMotionDetected: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeMute: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeName: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeNightVision: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeNitrogenDioxideDensity: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeObstructionDetected: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeOccupancyDetected: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeOpticalZoom: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeOutletInUse: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeOutputState: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeOzoneDensity: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypePM10Density: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypePM2_5Density: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypePictureMode: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypePositionState: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypePowerModeSelection: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypePowerState: string;

/**
 * @since 11.2
 */
declare var HMCharacteristicTypeProgramMode: string;

/**
 * @since 11.2
 */
declare var HMCharacteristicTypeRemainingDuration: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeRemoteKey: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeRotationDirection: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeRotationSpeed: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeRouterStatus: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeSaturation: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeSecuritySystemAlarmType: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeSelectedStreamConfiguration: string;

/**
 * @since 8.0
 * @deprecated 11.0
 */
declare var HMCharacteristicTypeSerialNumber: string;

/**
 * @since 11.2
 */
declare var HMCharacteristicTypeSetDuration: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeSetupStreamEndpoint: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeSlatType: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeSmokeDetected: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeSoftwareVersion: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeStatusActive: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeStatusFault: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeStatusJammed: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeStatusLowBattery: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeStatusTampered: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeStreamingStatus: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeSulphurDioxideDensity: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeSupportedAudioStreamConfiguration: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeSupportedRTPConfiguration: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeSupportedVideoStreamConfiguration: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeSwingMode: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeTargetAirPurifierState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeTargetDoorState: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeTargetFanState: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeTargetHeaterCoolerState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeTargetHeatingCooling: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeTargetHorizontalTilt: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeTargetHumidifierDehumidifierState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeTargetLockMechanismState: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeTargetMediaState: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeTargetPosition: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeTargetRelativeHumidity: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeTargetSecuritySystemState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeTargetTemperature: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeTargetTilt: string;

/**
 * @since 9.0
 */
declare var HMCharacteristicTypeTargetVerticalTilt: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeTargetVisibilityState: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeTemperatureUnits: string;

/**
 * @since 11.2
 */
declare var HMCharacteristicTypeValveType: string;

/**
 * @since 8.0
 */
declare var HMCharacteristicTypeVersion: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeVolatileOrganicCompoundDensity: string;

/**
 * @since 10.0
 */
declare var HMCharacteristicTypeVolume: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeVolumeControlType: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeVolumeSelector: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeWANStatusList: string;

/**
 * @since 10.2
 */
declare var HMCharacteristicTypeWaterLevel: string;

/**
 * @since 18.0
 */
declare var HMCharacteristicTypeWiFiSatelliteStatus: string;

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueActivationState {

	Inactive = 0,

	Active = 1
}

/**
 * @since 9.0
 */
declare const enum HMCharacteristicValueAirParticulateSize {

	Size2_5 = 0,

	Size10 = 1
}

/**
 * @since 9.0
 */
declare const enum HMCharacteristicValueAirQuality {

	Unknown = 0,

	Excellent = 1,

	Good = 2,

	Fair = 3,

	Inferior = 4,

	Poor = 5
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueBatteryStatus {

	Normal = 0,

	Low = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueCarbonDioxideDetectionStatus {

	NotDetected = 0,

	Detected = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueCarbonMonoxideDetectionStatus {

	NotDetected = 0,

	Detected = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueChargingState {

	None = 0,

	InProgress = 1,

	NotChargeable = 2
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueClosedCaptions {

	Disabled = 0,

	Enabled = 1
}

/**
 * @since 11.2
 */
declare const enum HMCharacteristicValueConfigurationState {

	NotConfigured = 0,

	Configured = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueContactState {

	Detected = 0,

	None = 1
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueCurrentAirPurifierState {

	Inactive = 0,

	Idle = 1,

	Active = 2
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueCurrentFanState {

	Inactive = 0,

	Idle = 1,

	Active = 2
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueCurrentHeaterCoolerState {

	Inactive = 0,

	Idle = 1,

	Heating = 2,

	Cooling = 3
}

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueCurrentHeatingCooling {

	Off = 0,

	Heat = 1,

	Cool = 2
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueCurrentHumidifierDehumidifierState {

	Inactive = 0,

	Idle = 1,

	Humidifying = 2,

	Dehumidifying = 3
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueCurrentMediaState {

	Playing = 0,

	Paused = 1,

	Stopped = 2,

	Unknown = 3,

	Loading = 4,

	Interrupted = 5
}

/**
 * @since 9.0
 */
declare const enum HMCharacteristicValueCurrentSecuritySystemState {

	StayArm = 0,

	AwayArm = 1,

	NightArm = 2,

	Disarmed = 3,

	Triggered = 4
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueCurrentSlatState {

	Stationary = 0,

	Jammed = 1,

	Oscillating = 2
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueCurrentVisibilityState {

	Shown = 0,

	Hidden = 1,

	Connected = 2,

	AlwaysShown = 3
}

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueDoorState {

	Open = 0,

	Closed = 1,

	Opening = 2,

	Closing = 3,

	Stopped = 4
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueFilterChange {

	NotNeeded = 0,

	Needed = 1
}

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueHeatingCooling {

	Off = 0,

	Heat = 1,

	Cool = 2,

	Auto = 3
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueInputDeviceType {

	Other = 0,

	TV = 1,

	Recording = 2,

	Tuner = 3,

	Playback = 4,

	AudioSystem = 5,

	None = 6
}

/**
 * @since 10.3
 */
declare const enum HMCharacteristicValueInputEvent {

	SinglePress = 0,

	DoublePress = 1,

	LongPress = 2
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueInputSourceType {

	Other = 0,

	HomeScreen = 1,

	Tuner = 2,

	HDMI = 3,

	CompositeVideo = 4,

	SVideo = 5,

	ComponentVideo = 6,

	DVI = 7,

	AirPlay = 8,

	USB = 9,

	Application = 10
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueJammedStatus {

	None = 0,

	Jammed = 1
}

/**
 * @since 9.0
 */
declare var HMCharacteristicValueKeyPath: string;

/**
 * @since 10.3
 */
declare const enum HMCharacteristicValueLabelNamespace {

	Dot = 0,

	Numeral = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueLeakStatus {

	None = 0,

	Detected = 1
}

/**
 * @since 8.0
 */
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

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueLockMechanismState {

	Unsecured = 0,

	Secured = 1,

	Jammed = 2,

	Unknown = 3
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueLockPhysicalControlsState {

	NotLocked = 0,

	Locked = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueOccupancyStatus {

	NotOccupied = 0,

	Occupied = 1
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValuePictureMode {

	Standard = 0,

	Movie = 1,

	Sport = 2,

	Game = 3,

	Photo = 4,

	Vivid = 5,

	Dark = 6,

	Bright = 7,

	Computer = 8,

	Night = 9,

	Calibrated = 10,

	Custom1 = 11,

	Custom2 = 12,

	Custom3 = 13
}

/**
 * @since 9.0
 */
declare const enum HMCharacteristicValuePositionState {

	Closing = 0,

	Opening = 1,

	Stopped = 2
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValuePowerModeSelection {

	Show = 0,

	Hide = 1
}

/**
 * @since 11.2
 */
declare const enum HMCharacteristicValueProgramMode {

	NotScheduled = 0,

	Scheduled = 1,

	ScheduleOverriddenToManual = 2
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueRemoteKey {

	Rewind = 0,

	FastForward = 1,

	NextTrack = 2,

	PreviousTrack = 3,

	ArrowUp = 4,

	ArrowDown = 5,

	ArrowLeft = 6,

	ArrowRight = 7,

	Select = 8,

	Back = 9,

	Exit = 10,

	PlayPause = 11,

	Play = 12,

	Pause = 13,

	Menu = 14,

	Info = 15,

	Home = 16
}

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueRotationDirection {

	Clockwise = 0,

	CounterClockwise = 1
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueRouterStatus {

	Ready = 0,

	NotReady = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueSecuritySystemAlarmType {

	NoAlarm = 0,

	Unknown = 1
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueSlatType {

	Horizontal = 0,

	Vertical = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueSmokeDetectionStatus {

	None = 0,

	Detected = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueStatusFault {

	NoFault = 0,

	GeneralFault = 1
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueSwingMode {

	Disabled = 0,

	Enabled = 1
}

/**
 * @since 10.0
 */
declare const enum HMCharacteristicValueTamperedStatus {

	None = 0,

	Tampered = 1
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueTargetAirPurifierState {

	Manual = 0,

	Automatic = 1
}

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueTargetDoorState {

	Open = 0,

	Closed = 1
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueTargetFanState {

	Manual = 0,

	Automatic = 1
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueTargetHeaterCoolerState {

	Automatic = 0,

	Heat = 1,

	Cool = 2
}

/**
 * @since 10.2
 */
declare const enum HMCharacteristicValueTargetHumidifierDehumidifierState {

	Automatic = 0,

	Humidify = 1,

	Dehumidify = 2
}

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueTargetLockMechanismState {

	Unsecured = 0,

	Secured = 1
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueTargetMediaState {

	Play = 0,

	Pause = 1,

	Stop = 2
}

/**
 * @since 9.0
 */
declare const enum HMCharacteristicValueTargetSecuritySystemState {

	StayArm = 0,

	AwayArm = 1,

	NightArm = 2,

	Disarm = 3
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueTargetVisibilityState {

	Show = 0,

	Hide = 1
}

/**
 * @since 8.0
 */
declare const enum HMCharacteristicValueTemperatureUnit {

	Celsius = 0,

	Fahrenheit = 1
}

/**
 * @since 11.2
 */
declare const enum HMCharacteristicValueUsageState {

	NotInUse = 0,

	InUse = 1
}

/**
 * @since 11.2
 */
declare const enum HMCharacteristicValueValveType {

	GenericValve = 0,

	Irrigation = 1,

	ShowerHead = 2,

	WaterFaucet = 3
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueVolumeControlType {

	None = 0,

	Relative = 1,

	RelativeWithCurrent = 2,

	Absolute = 3
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueVolumeSelector {

	VolumeIncrement = 0,

	VolumeDecrement = 1
}

/**
 * @since 18.0
 */
declare const enum HMCharacteristicValueWiFiSatelliteStatus {

	Unknown = 0,

	Connected = 1,

	NotConnected = 2
}

/**
 * @since 8.0
 */
declare class HMCharacteristicWriteAction<TargetValueType> extends HMAction {

	static alloc<TargetValueType>(): HMCharacteristicWriteAction<TargetValueType>; // inherited from NSObject

	static new<TargetValueType>(): HMCharacteristicWriteAction<TargetValueType>; // inherited from NSObject

	readonly characteristic: HMCharacteristic;

	readonly targetValue: any;

	constructor(o: { characteristic: HMCharacteristic; targetValue: any; });

	initWithCharacteristicTargetValue(characteristic: HMCharacteristic, targetValue: any): this;

	updateTargetValueCompletionHandler(targetValue: any, completion: (p1: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare class HMDurationEvent extends HMTimeEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMDurationEvent; // inherited from NSObject

	static new(): HMDurationEvent; // inherited from NSObject

	readonly duration: number;

	constructor(o: { duration: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithDuration(duration: number): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

/**
 * @since 8.0
 */
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

	WiFiCredentialGenerationFailed = 98,

	EnterpriseNetworkNotSupported = 99,

	TimedOutWaitingForAccessory = 100,

	AccessoryCommunicationFailure = 101,

	FailedToJoinNetwork = 102,

	AccessoryIsSuspended = 103,

	PartialCommunicationFailure = 104
}

/**
 * @since 8.0
 */
declare var HMErrorDomain: string;

/**
 * @since 9.0
 */
declare class HMEvent extends NSObject {

	static alloc(): HMEvent; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static isSupportedForHome(home: HMHome): boolean;

	static new(): HMEvent; // inherited from NSObject

	readonly uniqueIdentifier: NSUUID;
}

/**
 * @since 9.0
 */
declare class HMEventTrigger extends HMTrigger {

	static alloc(): HMEventTrigger; // inherited from NSObject

	static new(): HMEventTrigger; // inherited from NSObject

	static predicateForEvaluatingTriggerOccurringAfterDateWithComponents(dateComponents: NSDateComponents): NSPredicate;

	/**
	 * @since 11.0
	 */
	static predicateForEvaluatingTriggerOccurringAfterSignificantEvent(significantEvent: HMSignificantTimeEvent): NSPredicate;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	static predicateForEvaluatingTriggerOccurringAfterSignificantEventApplyingOffset(significantEvent: string, offset: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerOccurringBeforeDateWithComponents(dateComponents: NSDateComponents): NSPredicate;

	/**
	 * @since 11.0
	 */
	static predicateForEvaluatingTriggerOccurringBeforeSignificantEvent(significantEvent: HMSignificantTimeEvent): NSPredicate;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	static predicateForEvaluatingTriggerOccurringBeforeSignificantEventApplyingOffset(significantEvent: string, offset: NSDateComponents): NSPredicate;

	/**
	 * @since 11.0
	 */
	static predicateForEvaluatingTriggerOccurringBetweenDateWithComponentsSecondDateWithComponents(firstDateComponents: NSDateComponents, secondDateWithComponents: NSDateComponents): NSPredicate;

	/**
	 * @since 11.0
	 */
	static predicateForEvaluatingTriggerOccurringBetweenSignificantEventSecondSignificantEvent(firstSignificantEvent: HMSignificantTimeEvent, secondSignificantEvent: HMSignificantTimeEvent): NSPredicate;

	static predicateForEvaluatingTriggerOccurringOnDateWithComponents(dateComponents: NSDateComponents): NSPredicate;

	static predicateForEvaluatingTriggerWithCharacteristicRelatedByToValue(characteristic: HMCharacteristic, operatorType: NSPredicateOperatorType, value: any): NSPredicate;

	/**
	 * @since 11.0
	 */
	static predicateForEvaluatingTriggerWithPresence(presenceEvent: HMPresenceEvent): NSPredicate;

	/**
	 * @since 11.0
	 */
	readonly endEvents: NSArray<HMEvent>;

	readonly events: NSArray<HMEvent>;

	/**
	 * @since 11.0
	 */
	readonly executeOnce: boolean;

	readonly predicate: NSPredicate;

	/**
	 * @since 11.0
	 */
	readonly recurrences: NSArray<NSDateComponents>;

	/**
	 * @since 11.0
	 */
	readonly triggerActivationState: HMEventTriggerActivationState;

	/**
	 * @since 11.0
	 */
	constructor(o: { name: string; events: NSArray<HMEvent> | HMEvent[]; endEvents: NSArray<HMEvent> | HMEvent[]; recurrences: NSArray<NSDateComponents> | NSDateComponents[]; predicate: NSPredicate; });

	constructor(o: { name: string; events: NSArray<HMEvent> | HMEvent[]; predicate: NSPredicate; });

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	addEventCompletionHandler(event: HMEvent, completion: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	initWithNameEventsEndEventsRecurrencesPredicate(name: string, events: NSArray<HMEvent> | HMEvent[], endEvents: NSArray<HMEvent> | HMEvent[], recurrences: NSArray<NSDateComponents> | NSDateComponents[], predicate: NSPredicate): this;

	initWithNameEventsPredicate(name: string, events: NSArray<HMEvent> | HMEvent[], predicate: NSPredicate): this;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	removeEventCompletionHandler(event: HMEvent, completion: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	updateEndEventsCompletionHandler(endEvents: NSArray<HMEvent> | HMEvent[], completion: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	updateEventsCompletionHandler(events: NSArray<HMEvent> | HMEvent[], completion: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	updateExecuteOnceCompletionHandler(executeOnce: boolean, completion: (p1: NSError) => void): void;

	updatePredicateCompletionHandler(predicate: NSPredicate, completion: (p1: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	updateRecurrencesCompletionHandler(recurrences: NSArray<NSDateComponents> | NSDateComponents[], completion: (p1: NSError) => void): void;
}

declare const enum HMEventTriggerActivationState {

	Disabled = 0,

	DisabledNoHomeHub = 1,

	DisabledNoCompatibleHomeHub = 2,

	DisabledNoLocationServicesAuthorization = 3,

	Enabled = 4
}

/**
 * @since 8.0
 */
declare class HMHome extends NSObject {

	static alloc(): HMHome; // inherited from NSObject

	static new(): HMHome; // inherited from NSObject

	readonly accessories: NSArray<HMAccessory>;

	readonly actionSets: NSArray<HMActionSet>;

	/**
	 * @since 9.0
	 */
	readonly currentUser: HMUser;

	delegate: HMHomeDelegate;

	/**
	 * @since 11.0
	 */
	readonly homeHubState: HMHomeHubState;

	/**
	 * @since 16.1
	 */
	readonly matterControllerID: string;

	/**
	 * @since 16.1
	 */
	readonly matterControllerXPCConnectBlock: () => NSXPCConnection;

	/**
	 * @since 18.2
	 */
	readonly matterStartupParametersXPCConnectBlock: () => NSXPCConnection;

	readonly name: string;

	readonly primary: boolean;

	readonly rooms: NSArray<HMRoom>;

	readonly serviceGroups: NSArray<HMServiceGroup>;

	/**
	 * @since 13.2
	 */
	readonly supportsAddingNetworkRouter: boolean;

	readonly triggers: NSArray<HMTrigger>;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly users: NSArray<HMUser>;

	readonly zones: NSArray<HMZone>;

	addAccessoryCompletionHandler(accessory: HMAccessory, completion: (p1: NSError) => void): void;

	addActionSetWithNameCompletionHandler(actionSetName: string, completion: (p1: HMActionSet, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 * @deprecated 15.4
	 */
	addAndSetupAccessoriesWithCompletionHandler(completion: (p1: NSError) => void): void;

	/**
	 * @since 11.3
	 * @deprecated 15.0
	 */
	addAndSetupAccessoriesWithPayloadCompletionHandler(payload: HMAccessorySetupPayload, completion: (p1: NSArray<HMAccessory>, p2: NSError) => void): void;

	addRoomWithNameCompletionHandler(roomName: string, completion: (p1: HMRoom, p2: NSError) => void): void;

	addServiceGroupWithNameCompletionHandler(serviceGroupName: string, completion: (p1: HMServiceGroup, p2: NSError) => void): void;

	addTriggerCompletionHandler(trigger: HMTrigger, completion: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	addUserWithCompletionHandler(completion: (p1: HMUser, p2: NSError) => void): void;

	addZoneWithNameCompletionHandler(zoneName: string, completion: (p1: HMZone, p2: NSError) => void): void;

	assignAccessoryToRoomCompletionHandler(accessory: HMAccessory, room: HMRoom, completion: (p1: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	builtinActionSetOfType(actionSetType: string): HMActionSet;

	executeActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	homeAccessControlForUser(user: HMUser): HMHomeAccessControl;

	/**
	 * @since 9.0
	 */
	manageUsersWithCompletionHandler(completion: (p1: NSError) => void): void;

	removeAccessoryCompletionHandler(accessory: HMAccessory, completion: (p1: NSError) => void): void;

	removeActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	removeRoomCompletionHandler(room: HMRoom, completion: (p1: NSError) => void): void;

	removeServiceGroupCompletionHandler(group: HMServiceGroup, completion: (p1: NSError) => void): void;

	removeTriggerCompletionHandler(trigger: HMTrigger, completion: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	removeUserCompletionHandler(user: HMUser, completion: (p1: NSError) => void): void;

	removeZoneCompletionHandler(zone: HMZone, completion: (p1: NSError) => void): void;

	roomForEntireHome(): HMRoom;

	servicesWithTypes(serviceTypes: NSArray<string> | string[]): NSArray<HMService>;

	unblockAccessoryCompletionHandler(accessory: HMAccessory, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

/**
 * @since 9.0
 */
declare class HMHomeAccessControl extends HMAccessControl {

	static alloc(): HMHomeAccessControl; // inherited from NSObject

	static new(): HMHomeAccessControl; // inherited from NSObject

	readonly administrator: boolean;
}

/**
 * @since 8.0
 */
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

	/**
	 * @since 11.0
	 */
	homeDidUpdateAccessControlForCurrentUser?(home: HMHome): void;

	homeDidUpdateActionsForActionSet?(home: HMHome, actionSet: HMActionSet): void;

	/**
	 * @since 11.0
	 */
	homeDidUpdateHomeHubState?(home: HMHome, homeHubState: HMHomeHubState): void;

	homeDidUpdateName?(home: HMHome): void;

	homeDidUpdateNameForActionSet?(home: HMHome, actionSet: HMActionSet): void;

	homeDidUpdateNameForRoom?(home: HMHome, room: HMRoom): void;

	homeDidUpdateNameForServiceGroup?(home: HMHome, group: HMServiceGroup): void;

	homeDidUpdateNameForTrigger?(home: HMHome, trigger: HMTrigger): void;

	homeDidUpdateNameForZone?(home: HMHome, zone: HMZone): void;

	homeDidUpdateRoomForAccessory?(home: HMHome, room: HMRoom, accessory: HMAccessory): void;

	/**
	 * @since 13.2
	 */
	homeDidUpdateSupportedFeatures?(home: HMHome): void;

	homeDidUpdateTrigger?(home: HMHome, trigger: HMTrigger): void;
}
declare var HMHomeDelegate: {

	prototype: HMHomeDelegate;
};

/**
 * @since 11.0
 */
declare const enum HMHomeHubState {

	NotAvailable = 0,

	Connected = 1,

	Disconnected = 2
}

/**
 * @since 8.0
 */
declare class HMHomeManager extends NSObject {

	static alloc(): HMHomeManager; // inherited from NSObject

	static new(): HMHomeManager; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly authorizationStatus: HMHomeManagerAuthorizationStatus;

	delegate: HMHomeManagerDelegate;

	readonly homes: NSArray<HMHome>;

	/**
	 * @since 8.0
	 * @deprecated 16.1
	 */
	readonly primaryHome: HMHome;

	addHomeWithNameCompletionHandler(homeName: string, completion: (p1: HMHome, p2: NSError) => void): void;

	removeHomeCompletionHandler(home: HMHome, completion: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 16.1
	 */
	updatePrimaryHomeCompletionHandler(home: HMHome, completion: (p1: NSError) => void): void;
}

/**
 * @since 13.0
 */
declare const enum HMHomeManagerAuthorizationStatus {

	Determined = 1,

	Restricted = 2,

	Authorized = 4
}

/**
 * @since 8.0
 */
interface HMHomeManagerDelegate extends NSObjectProtocol {

	homeManagerDidAddHome?(manager: HMHomeManager, home: HMHome): void;

	homeManagerDidReceiveAddAccessoryRequest?(manager: HMHomeManager, request: HMAddAccessoryRequest): void;

	homeManagerDidRemoveHome?(manager: HMHomeManager, home: HMHome): void;

	/**
	 * @since 13.0
	 */
	homeManagerDidUpdateAuthorizationStatus?(manager: HMHomeManager, status: HMHomeManagerAuthorizationStatus): void;

	homeManagerDidUpdateHomes?(manager: HMHomeManager): void;

	homeManagerDidUpdatePrimaryHome?(manager: HMHomeManager): void;
}
declare var HMHomeManagerDelegate: {

	prototype: HMHomeManagerDelegate;
};

/**
 * @since 9.0
 */
declare class HMLocationEvent extends HMEvent implements NSCopying, NSMutableCopying {

	static alloc(): HMLocationEvent; // inherited from NSObject

	static new(): HMLocationEvent; // inherited from NSObject

	readonly region: CLRegion;

	constructor(o: { region: CLRegion; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	initWithRegion(region: CLRegion): this;

	mutableCopyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	updateRegionCompletionHandler(region: CLRegion, completion: (p1: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare class HMMutableCalendarEvent extends HMCalendarEvent {

	static alloc(): HMMutableCalendarEvent; // inherited from NSObject

	static new(): HMMutableCalendarEvent; // inherited from NSObject

	fireDateComponents: NSDateComponents;
}

/**
 * @since 11.0
 */
declare class HMMutableCharacteristicEvent<TriggerValueType extends NSObject> extends HMCharacteristicEvent<NSObject> {

	static alloc(): any; // inherited from NSObject

	static new(): any; // inherited from NSObject

	characteristic: HMCharacteristic;

	triggerValue: any;
}

/**
 * @since 11.0
 */
declare class HMMutableCharacteristicThresholdRangeEvent extends HMCharacteristicThresholdRangeEvent {

	static alloc(): HMMutableCharacteristicThresholdRangeEvent; // inherited from NSObject

	static new(): HMMutableCharacteristicThresholdRangeEvent; // inherited from NSObject

	characteristic: HMCharacteristic;

	thresholdRange: HMNumberRange;
}

/**
 * @since 11.0
 */
declare class HMMutableDurationEvent extends HMDurationEvent {

	static alloc(): HMMutableDurationEvent; // inherited from NSObject

	static new(): HMMutableDurationEvent; // inherited from NSObject

	duration: number;
}

/**
 * @since 11.0
 */
declare class HMMutableLocationEvent extends HMLocationEvent {

	static alloc(): HMMutableLocationEvent; // inherited from NSObject

	static new(): HMMutableLocationEvent; // inherited from NSObject

	region: CLRegion;
}

/**
 * @since 11.0
 */
declare class HMMutablePresenceEvent extends HMPresenceEvent {

	static alloc(): HMMutablePresenceEvent; // inherited from NSObject

	static new(): HMMutablePresenceEvent; // inherited from NSObject

	presenceEventType: HMPresenceEventType;

	presenceUserType: HMPresenceEventUserType;
}

/**
 * @since 11.0
 */
declare class HMMutableSignificantTimeEvent extends HMSignificantTimeEvent {

	static alloc(): HMMutableSignificantTimeEvent; // inherited from NSObject

	static new(): HMMutableSignificantTimeEvent; // inherited from NSObject

	offset: NSDateComponents;

	significantEvent: string;
}

/**
 * @since 13.0
 */
declare class HMNetworkConfigurationProfile extends HMAccessoryProfile {

	static alloc(): HMNetworkConfigurationProfile; // inherited from NSObject

	static new(): HMNetworkConfigurationProfile; // inherited from NSObject

	delegate: HMNetworkConfigurationProfileDelegate;

	readonly networkAccessRestricted: boolean;
}

/**
 * @since 13.0
 */
interface HMNetworkConfigurationProfileDelegate extends NSObjectProtocol {

	profileDidUpdateNetworkAccessMode?(profile: HMNetworkConfigurationProfile): void;
}
declare var HMNetworkConfigurationProfileDelegate: {

	prototype: HMNetworkConfigurationProfileDelegate;
};

/**
 * @since 11.0
 */
declare class HMNumberRange extends NSObject {

	static alloc(): HMNumberRange; // inherited from NSObject

	static new(): HMNumberRange; // inherited from NSObject

	static numberRangeWithMaxValue(maxValue: number): HMNumberRange;

	static numberRangeWithMinValue(minValue: number): HMNumberRange;

	static numberRangeWithMinValueMaxValue(minValue: number, maxValue: number): HMNumberRange;

	readonly maxValue: number;

	readonly minValue: number;
}

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
declare var HMPresenceKeyPath: string;

/**
 * @since 8.0
 */
declare class HMRoom extends NSObject {

	static alloc(): HMRoom; // inherited from NSObject

	static new(): HMRoom; // inherited from NSObject

	readonly accessories: NSArray<HMAccessory>;

	readonly name: string;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare class HMService extends NSObject {

	static alloc(): HMService; // inherited from NSObject

	static new(): HMService; // inherited from NSObject

	readonly accessory: HMAccessory;

	readonly associatedServiceType: string;

	readonly characteristics: NSArray<HMCharacteristic>;

	/**
	 * @since 10.0
	 */
	readonly linkedServices: NSArray<HMService>;

	/**
	 * @since 9.0
	 */
	readonly localizedDescription: string;

	/**
	 * @since 18.0
	 */
	readonly matterEndpointID: number;

	readonly name: string;

	/**
	 * @since 10.0
	 */
	readonly primaryService: boolean;

	readonly serviceType: string;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	/**
	 * @since 9.0
	 */
	readonly userInteractive: boolean;

	updateAssociatedServiceTypeCompletionHandler(serviceType: string, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare class HMServiceGroup extends NSObject {

	static alloc(): HMServiceGroup; // inherited from NSObject

	static new(): HMServiceGroup; // inherited from NSObject

	readonly name: string;

	readonly services: NSArray<HMService>;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	addServiceCompletionHandler(service: HMService, completion: (p1: NSError) => void): void;

	removeServiceCompletionHandler(service: HMService, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare var HMServiceTypeAccessoryInformation: string;

/**
 * @since 10.2
 */
declare var HMServiceTypeAirPurifier: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeAirQualitySensor: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeBattery: string;

/**
 * @since 10.0
 */
declare var HMServiceTypeCameraControl: string;

/**
 * @since 10.0
 */
declare var HMServiceTypeCameraRTPStreamManagement: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeCarbonDioxideSensor: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeCarbonMonoxideSensor: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeContactSensor: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeDoor: string;

/**
 * @since 10.0
 */
declare var HMServiceTypeDoorbell: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeFan: string;

/**
 * @since 11.2
 */
declare var HMServiceTypeFaucet: string;

/**
 * @since 10.2
 */
declare var HMServiceTypeFilterMaintenance: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeGarageDoorOpener: string;

/**
 * @since 10.2
 */
declare var HMServiceTypeHeaterCooler: string;

/**
 * @since 10.2
 */
declare var HMServiceTypeHumidifierDehumidifier: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeHumiditySensor: string;

/**
 * @since 18.0
 */
declare var HMServiceTypeInputSource: string;

/**
 * @since 11.2
 */
declare var HMServiceTypeIrrigationSystem: string;

/**
 * @since 10.3
 */
declare var HMServiceTypeLabel: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeLeakSensor: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeLightSensor: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeLightbulb: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeLockManagement: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeLockMechanism: string;

/**
 * @since 10.0
 */
declare var HMServiceTypeMicrophone: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeMotionSensor: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeOccupancySensor: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeOutlet: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeSecuritySystem: string;

/**
 * @since 10.2
 */
declare var HMServiceTypeSlats: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeSmokeSensor: string;

/**
 * @since 10.0
 */
declare var HMServiceTypeSpeaker: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeStatefulProgrammableSwitch: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeStatelessProgrammableSwitch: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeSwitch: string;

/**
 * @since 18.0
 */
declare var HMServiceTypeTelevision: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeTemperatureSensor: string;

/**
 * @since 8.0
 */
declare var HMServiceTypeThermostat: string;

/**
 * @since 11.2
 */
declare var HMServiceTypeValve: string;

/**
 * @since 10.2
 */
declare var HMServiceTypeVentilationFan: string;

/**
 * @since 18.0
 */
declare var HMServiceTypeWiFiRouter: string;

/**
 * @since 18.0
 */
declare var HMServiceTypeWiFiSatellite: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeWindow: string;

/**
 * @since 9.0
 */
declare var HMServiceTypeWindowCovering: string;

/**
 * @since 9.0
 */
declare var HMSignificantEventSunrise: string;

/**
 * @since 9.0
 */
declare var HMSignificantEventSunset: string;

/**
 * @since 11.0
 */
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

/**
 * @since 11.0
 */
declare class HMTimeEvent extends HMEvent {

	static alloc(): HMTimeEvent; // inherited from NSObject

	static new(): HMTimeEvent; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare class HMTimerTrigger extends HMTrigger {

	static alloc(): HMTimerTrigger; // inherited from NSObject

	static new(): HMTimerTrigger; // inherited from NSObject

	readonly fireDate: Date;

	readonly recurrence: NSDateComponents;

	/**
	 * @since 8.0
	 * @deprecated 16.4
	 */
	readonly recurrenceCalendar: NSCalendar;

	/**
	 * @since 8.0
	 * @deprecated 16.4
	 */
	readonly timeZone: NSTimeZone;

	/**
	 * @since 16.4
	 */
	constructor(o: { name: string; fireDate: Date; recurrence: NSDateComponents; });

	/**
	 * @since 8.0
	 * @deprecated 16.4
	 */
	constructor(o: { name: string; fireDate: Date; timeZone: NSTimeZone; recurrence: NSDateComponents; recurrenceCalendar: NSCalendar; });

	/**
	 * @since 16.4
	 */
	initWithNameFireDateRecurrence(name: string, fireDate: Date, recurrence: NSDateComponents): this;

	/**
	 * @since 8.0
	 * @deprecated 16.4
	 */
	initWithNameFireDateTimeZoneRecurrenceRecurrenceCalendar(name: string, fireDate: Date, timeZone: NSTimeZone, recurrence: NSDateComponents, recurrenceCalendar: NSCalendar): this;

	updateFireDateCompletionHandler(fireDate: Date, completion: (p1: NSError) => void): void;

	updateRecurrenceCompletionHandler(recurrence: NSDateComponents, completion: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 * @deprecated 16.4
	 */
	updateTimeZoneCompletionHandler(timeZone: NSTimeZone, completion: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare class HMTrigger extends NSObject {

	static alloc(): HMTrigger; // inherited from NSObject

	static new(): HMTrigger; // inherited from NSObject

	readonly actionSets: NSArray<HMActionSet>;

	readonly enabled: boolean;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	readonly lastFireDate: Date;

	readonly name: string;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	addActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	enableCompletionHandler(enable: boolean, completion: (p1: NSError) => void): void;

	removeActionSetCompletionHandler(actionSet: HMActionSet, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}

/**
 * @since 8.0
 */
declare class HMUser extends NSObject {

	static alloc(): HMUser; // inherited from NSObject

	static new(): HMUser; // inherited from NSObject

	readonly name: string;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;
}

/**
 * @since 8.0
 */
declare var HMUserFailedAccessoriesKey: string;

/**
 * @since 8.0
 */
declare class HMZone extends NSObject {

	static alloc(): HMZone; // inherited from NSObject

	static new(): HMZone; // inherited from NSObject

	readonly name: string;

	readonly rooms: NSArray<HMRoom>;

	/**
	 * @since 9.0
	 */
	readonly uniqueIdentifier: NSUUID;

	addRoomCompletionHandler(room: HMRoom, completion: (p1: NSError) => void): void;

	removeRoomCompletionHandler(room: HMRoom, completion: (p1: NSError) => void): void;

	updateNameCompletionHandler(name: string, completion: (p1: NSError) => void): void;
}
