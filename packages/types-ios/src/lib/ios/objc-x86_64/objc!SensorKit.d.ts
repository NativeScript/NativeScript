
declare function SRAbsoluteTimeFromCFAbsoluteTime(cf: number): number;

declare function SRAbsoluteTimeFromContinuousTime(cont: number): number;

declare function SRAbsoluteTimeGetCurrent(): number;

declare function SRAbsoluteTimeToCFAbsoluteTime(sr: number): number;

interface SRAmbientLightChromaticity {
	x: number;
	y: number;
}
declare var SRAmbientLightChromaticity: interop.StructType<SRAmbientLightChromaticity>;

declare class SRAmbientLightSample extends NSObject {

	static alloc(): SRAmbientLightSample; // inherited from NSObject

	static new(): SRAmbientLightSample; // inherited from NSObject

	readonly chromaticity: SRAmbientLightChromaticity;

	readonly lux: NSMeasurement<NSUnitIlluminance>;

	readonly placement: SRAmbientLightSensorPlacement;
}

declare const enum SRAmbientLightSensorPlacement {

	Unknown = 0,

	FrontTop = 1,

	FrontBottom = 2,

	FrontRight = 3,

	FrontLeft = 4,

	FrontTopRight = 5,

	FrontTopLeft = 6,

	FrontBottomRight = 7,

	FrontBottomLeft = 8
}

declare class SRApplicationUsage extends NSObject {

	static alloc(): SRApplicationUsage; // inherited from NSObject

	static new(): SRApplicationUsage; // inherited from NSObject

	readonly bundleIdentifier: string;

	readonly reportApplicationIdentifier: string;

	readonly textInputSessions: NSArray<SRTextInputSession>;

	readonly usageTime: number;
}

declare const enum SRAuthorizationStatus {

	NotDetermined = 0,

	Authorized = 1,

	Denied = 2
}

declare const enum SRCrownOrientation {

	Left = 0,

	Right = 1
}

declare const enum SRDeletionReason {

	UserInitiated = 0,

	LowDiskSpace = 1,

	AgeLimit = 2,

	NoInterestedClients = 3,

	SystemInitiated = 4
}

declare class SRDeletionRecord extends NSObject implements NSSecureCoding {

	static alloc(): SRDeletionRecord; // inherited from NSObject

	static new(): SRDeletionRecord; // inherited from NSObject

	readonly endTime: number;

	readonly reason: SRDeletionReason;

	readonly startTime: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class SRDevice extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): SRDevice; // inherited from NSObject

	static new(): SRDevice; // inherited from NSObject

	readonly model: string;

	readonly name: string;

	readonly systemName: string;

	readonly systemVersion: string;

	static readonly currentDevice: SRDevice;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var SRDeviceUsageCategoryBooks: string;

declare var SRDeviceUsageCategoryBusiness: string;

declare var SRDeviceUsageCategoryCatalogs: string;

declare var SRDeviceUsageCategoryDeveloperTools: string;

declare var SRDeviceUsageCategoryEducation: string;

declare var SRDeviceUsageCategoryEntertainment: string;

declare var SRDeviceUsageCategoryFinance: string;

declare var SRDeviceUsageCategoryFoodAndDrink: string;

declare var SRDeviceUsageCategoryGames: string;

declare var SRDeviceUsageCategoryGraphicsAndDesign: string;

declare var SRDeviceUsageCategoryHealthAndFitness: string;

declare var SRDeviceUsageCategoryKids: string;

declare var SRDeviceUsageCategoryLifestyle: string;

declare var SRDeviceUsageCategoryMedical: string;

declare var SRDeviceUsageCategoryMiscellaneous: string;

declare var SRDeviceUsageCategoryMusic: string;

declare var SRDeviceUsageCategoryNavigation: string;

declare var SRDeviceUsageCategoryNews: string;

declare var SRDeviceUsageCategoryNewsstand: string;

declare var SRDeviceUsageCategoryPhotoAndVideo: string;

declare var SRDeviceUsageCategoryProductivity: string;

declare var SRDeviceUsageCategoryReference: string;

declare var SRDeviceUsageCategoryShopping: string;

declare var SRDeviceUsageCategorySocialNetworking: string;

declare var SRDeviceUsageCategorySports: string;

declare var SRDeviceUsageCategoryStickers: string;

declare var SRDeviceUsageCategoryTravel: string;

declare var SRDeviceUsageCategoryUtilities: string;

declare var SRDeviceUsageCategoryWeather: string;

declare class SRDeviceUsageReport extends NSObject {

	static alloc(): SRDeviceUsageReport; // inherited from NSObject

	static new(): SRDeviceUsageReport; // inherited from NSObject

	readonly applicationUsageByCategory: NSDictionary<string, NSArray<SRApplicationUsage>>;

	readonly duration: number;

	readonly notificationUsageByCategory: NSDictionary<string, NSArray<SRNotificationUsage>>;

	readonly totalScreenWakes: number;

	readonly totalUnlockDuration: number;

	readonly totalUnlocks: number;

	readonly webUsageByCategory: NSDictionary<string, NSArray<SRWebUsage>>;
}

declare const enum SRErrorCode {

	InvalidEntitlement = 0,

	NoAuthorization = 1,

	DataInaccessible = 2,

	FetchRequestInvalid = 3,

	PromptDeclined = 4
}

declare var SRErrorDomain: string;

declare class SRFetchRequest extends NSObject {

	static alloc(): SRFetchRequest; // inherited from NSObject

	static new(): SRFetchRequest; // inherited from NSObject

	device: SRDevice;

	from: number;

	to: number;
}

declare class SRFetchResult<SampleType> extends NSObject implements NSCopying {

	static alloc<SampleType>(): SRFetchResult<SampleType>; // inherited from NSObject

	static new<SampleType>(): SRFetchResult<SampleType>; // inherited from NSObject

	readonly sample: SampleType;

	readonly timestamp: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;
}

declare class SRKeyboardMetrics extends NSObject {

	static alloc(): SRKeyboardMetrics; // inherited from NSObject

	static new(): SRKeyboardMetrics; // inherited from NSObject

	readonly anyTapToCharKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly anyTapToPlaneChangeKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly charKeyToAnyTapKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly charKeyToDelete: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly charKeyToPlaneChangeKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly charKeyToPrediction: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly charKeyToSpaceKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteDownErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly deleteToCharKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteToDelete: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteToDeletes: NSArray<SRKeyboardProbabilityMetric<NSUnitDuration>>;

	readonly deleteToPath: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteToPlaneChangeKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteToShiftKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteToSpaceKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteTouchDownUp: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly deleteUpErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly downErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly duration: number;

	readonly height: NSMeasurement<NSUnitLength>;

	readonly inputModes: NSArray<string>;

	readonly keyboardIdentifier: string;

	readonly longWordDownErrorDistance: NSArray<SRKeyboardProbabilityMetric<NSUnitLength>>;

	readonly longWordTouchDownDown: NSArray<SRKeyboardProbabilityMetric<NSUnitDuration>>;

	readonly longWordTouchDownUp: NSArray<SRKeyboardProbabilityMetric<NSUnitDuration>>;

	readonly longWordUpErrorDistance: NSArray<SRKeyboardProbabilityMetric<NSUnitLength>>;

	readonly pathErrorDistanceRatio: NSArray<number>;

	readonly pathToDelete: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly pathToPath: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly pathToSpace: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly pathTypingSpeed: number;

	readonly planeChangeKeyToCharKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly planeChangeToAnyTap: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly shortWordCharKeyDownErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly shortWordCharKeyToCharKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly shortWordCharKeyTouchDownUp: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly shortWordCharKeyUpErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly spaceDownErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly spaceToCharKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceToDeleteKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceToPath: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceToPlaneChangeKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceToPredictionKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceToShiftKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceToSpaceKey: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceTouchDownUp: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly spaceUpErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly totalAlteredWords: number;

	readonly totalAutoCorrections: number;

	readonly totalDeletes: number;

	readonly totalDrags: number;

	readonly totalEmojis: number;

	readonly totalHitTestCorrections: number;

	readonly totalInsertKeyCorrections: number;

	readonly totalNearKeyCorrections: number;

	readonly totalPathLength: NSMeasurement<NSUnitLength>;

	readonly totalPathPauses: number;

	readonly totalPathTime: number;

	readonly totalPaths: number;

	readonly totalPauses: number;

	readonly totalRetroCorrections: number;

	readonly totalSkipTouchCorrections: number;

	readonly totalSpaceCorrections: number;

	readonly totalSubstitutionCorrections: number;

	readonly totalTaps: number;

	readonly totalTranspositionCorrections: number;

	readonly totalTypingDuration: number;

	readonly totalTypingEpisodes: number;

	readonly totalWords: number;

	readonly touchDownDown: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly touchDownUp: SRKeyboardProbabilityMetric<NSUnitDuration>;

	readonly typingSpeed: number;

	readonly upErrorDistance: SRKeyboardProbabilityMetric<NSUnitLength>;

	readonly version: string;

	readonly width: NSMeasurement<NSUnitLength>;

	emojiCountForSentimentCategory(category: SRKeyboardMetricsSentimentCategory): number;

	wordCountForSentimentCategory(category: SRKeyboardMetricsSentimentCategory): number;
}

declare const enum SRKeyboardMetricsSentimentCategory {

	Absolutist = 0,

	Down = 1,

	Death = 2,

	Anxiety = 3,

	Anger = 4,

	Health = 5,

	Positive = 6,

	Sad = 7,

	LowEnergy = 8,

	Confused = 9
}

declare class SRKeyboardProbabilityMetric<UnitType> extends NSObject {

	static alloc<UnitType>(): SRKeyboardProbabilityMetric<UnitType>; // inherited from NSObject

	static new<UnitType>(): SRKeyboardProbabilityMetric<UnitType>; // inherited from NSObject

	readonly distributionSampleValues: NSArray<NSMeasurement<UnitType>>;
}

declare const enum SRLocationCategory {

	Unknown = 0,

	Home = 1,

	Work = 2,

	School = 3,

	Gym = 4
}

declare class SRMessagesUsageReport extends NSObject {

	static alloc(): SRMessagesUsageReport; // inherited from NSObject

	static new(): SRMessagesUsageReport; // inherited from NSObject

	readonly duration: number;

	readonly totalIncomingMessages: number;

	readonly totalOutgoingMessages: number;

	readonly totalUniqueContacts: number;
}

declare const enum SRNotificationEvent {

	Unknown = 0,

	Received = 1,

	DefaultAction = 2,

	SupplementaryAction = 3,

	Clear = 4,

	NotificationCenterClearAll = 5,

	Removed = 6,

	Hide = 7,

	LongLook = 8,

	Silence = 9,

	AppLaunch = 10,

	Expired = 11,

	BannerPulldown = 12,

	TapCoalesce = 13,

	Deduped = 14,

	DeviceActivated = 15,

	DeviceUnlocked = 16
}

declare class SRNotificationUsage extends NSObject {

	static alloc(): SRNotificationUsage; // inherited from NSObject

	static new(): SRNotificationUsage; // inherited from NSObject

	readonly bundleIdentifier: string;

	readonly event: SRNotificationEvent;
}

declare class SRPhoneUsageReport extends NSObject {

	static alloc(): SRPhoneUsageReport; // inherited from NSObject

	static new(): SRPhoneUsageReport; // inherited from NSObject

	readonly duration: number;

	readonly totalIncomingCalls: number;

	readonly totalOutgoingCalls: number;

	readonly totalPhoneCallDuration: number;

	readonly totalUniqueContacts: number;
}

declare var SRSensorAccelerometer: string;

declare var SRSensorAmbientLightSensor: string;

declare var SRSensorAmbientPressure: string;

declare var SRSensorDeviceUsageReport: string;

declare var SRSensorKeyboardMetrics: string;

declare var SRSensorMessagesUsageReport: string;

declare var SRSensorOnWristState: string;

declare var SRSensorPedometerData: string;

declare var SRSensorPhoneUsageReport: string;

declare class SRSensorReader extends NSObject {

	static alloc(): SRSensorReader; // inherited from NSObject

	static new(): SRSensorReader; // inherited from NSObject

	static requestAuthorizationForSensorsCompletion(sensors: NSSet<string>, completion: (p1: NSError) => void): void;

	readonly authorizationStatus: SRAuthorizationStatus;

	delegate: SRSensorReaderDelegate;

	readonly sensor: string;

	constructor(o: { sensor: string; });

	fetch(request: SRFetchRequest): void;

	fetchDevices(): void;

	initWithSensor(sensor: string): this;

	startRecording(): void;

	stopRecording(): void;
}

interface SRSensorReaderDelegate extends NSObjectProtocol {

	sensorReaderDidChangeAuthorizationStatus?(reader: SRSensorReader, authorizationStatus: SRAuthorizationStatus): void;

	sensorReaderDidCompleteFetch?(reader: SRSensorReader, fetchRequest: SRFetchRequest): void;

	sensorReaderDidFetchDevices?(reader: SRSensorReader, devices: NSArray<SRDevice> | SRDevice[]): void;

	sensorReaderDidStopRecording?(reader: SRSensorReader): void;

	sensorReaderFetchDevicesDidFailWithError?(reader: SRSensorReader, error: NSError): void;

	sensorReaderFetchingRequestDidFetchResult?(reader: SRSensorReader, fetchRequest: SRFetchRequest, result: SRFetchResult<any>): boolean;

	sensorReaderFetchingRequestFailedWithError?(reader: SRSensorReader, fetchRequest: SRFetchRequest, error: NSError): void;

	sensorReaderStartRecordingFailedWithError?(reader: SRSensorReader, error: NSError): void;

	sensorReaderStopRecordingFailedWithError?(reader: SRSensorReader, error: NSError): void;

	sensorReaderWillStartRecording?(reader: SRSensorReader): void;
}
declare var SRSensorReaderDelegate: {

	prototype: SRSensorReaderDelegate;
};

declare var SRSensorRotationRate: string;

declare var SRSensorSiriSpeechMetrics: string;

declare var SRSensorTelephonySpeechMetrics: string;

declare var SRSensorVisits: string;

declare class SRTextInputSession extends NSObject {

	static alloc(): SRTextInputSession; // inherited from NSObject

	static new(): SRTextInputSession; // inherited from NSObject

	readonly duration: number;

	readonly sessionType: SRTextInputSessionType;
}

declare const enum SRTextInputSessionType {

	Keyboard = 1,

	ThirdPartyKeyboard = 2,

	Pencil = 3,

	Dictation = 4
}

declare class SRVisit extends NSObject {

	static alloc(): SRVisit; // inherited from NSObject

	static new(): SRVisit; // inherited from NSObject

	readonly arrivalDateInterval: NSDateInterval;

	readonly departureDateInterval: NSDateInterval;

	readonly distanceFromHome: number;

	readonly identifier: NSUUID;

	readonly locationCategory: SRLocationCategory;
}

declare class SRWebUsage extends NSObject {

	static alloc(): SRWebUsage; // inherited from NSObject

	static new(): SRWebUsage; // inherited from NSObject

	readonly totalUsageTime: number;
}

declare class SRWristDetection extends NSObject {

	static alloc(): SRWristDetection; // inherited from NSObject

	static new(): SRWristDetection; // inherited from NSObject

	readonly crownOrientation: SRCrownOrientation;

	readonly onWrist: boolean;

	readonly wristLocation: SRWristLocation;
}

declare const enum SRWristLocation {

	Left = 0,

	Right = 1
}
