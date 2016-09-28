
declare class HKActivitySummary extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKActivitySummary; // inherited from NSObject

	static new(): HKActivitySummary; // inherited from NSObject

	activeEnergyBurned: HKQuantity;

	activeEnergyBurnedGoal: HKQuantity;

	appleExerciseTime: HKQuantity;

	appleExerciseTimeGoal: HKQuantity;

	appleStandHours: HKQuantity;

	appleStandHoursGoal: HKQuantity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dateComponentsForCalendar(calendar: NSCalendar): NSDateComponents;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class HKActivitySummaryQuery extends HKQuery {

	static alloc(): HKActivitySummaryQuery; // inherited from NSObject

	static new(): HKActivitySummaryQuery; // inherited from NSObject

	updateHandler: (p1: HKActivitySummaryQuery, p2: NSArray<HKActivitySummary>, p3: NSError) => void;

	constructor(o: { predicate: NSPredicate; resultsHandler: (p1: HKActivitySummaryQuery, p2: NSArray<HKActivitySummary>, p3: NSError) => void; });

	initWithPredicateResultsHandler(predicate: NSPredicate, handler: (p1: HKActivitySummaryQuery, p2: NSArray<HKActivitySummary>, p3: NSError) => void): this;
}

declare class HKActivitySummaryType extends HKObjectType {

	static alloc(): HKActivitySummaryType; // inherited from NSObject

	static new(): HKActivitySummaryType; // inherited from NSObject
}

declare class HKAnchoredObjectQuery extends HKQuery {

	static alloc(): HKAnchoredObjectQuery; // inherited from NSObject

	static new(): HKAnchoredObjectQuery; // inherited from NSObject

	updateHandler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void;

	constructor(o: { type: HKSampleType; predicate: NSPredicate; anchor: number; limit: number; completionHandler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: number, p4: NSError) => void; });

	constructor(o: { type: HKSampleType; predicate: NSPredicate; anchor: HKQueryAnchor; limit: number; resultsHandler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void; });

	initWithTypePredicateAnchorLimitCompletionHandler(type: HKSampleType, predicate: NSPredicate, anchor: number, limit: number, handler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: number, p4: NSError) => void): this;

	initWithTypePredicateAnchorLimitResultsHandler(type: HKSampleType, predicate: NSPredicate, anchor: HKQueryAnchor, limit: number, handler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void): this;
}

declare const enum HKAuthorizationStatus {

	NotDetermined = 0,

	SharingDenied = 1,

	SharingAuthorized = 2
}

declare const enum HKBiologicalSex {

	NotSet = 0,

	Female = 1,

	Male = 2,

	Other = 3
}

declare class HKBiologicalSexObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKBiologicalSexObject; // inherited from NSObject

	static new(): HKBiologicalSexObject; // inherited from NSObject

	readonly biologicalSex: HKBiologicalSex;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum HKBloodType {

	NotSet = 0,

	APositive = 1,

	ANegative = 2,

	BPositive = 3,

	BNegative = 4,

	ABPositive = 5,

	ABNegative = 6,

	OPositive = 7,

	ONegative = 8
}

declare class HKBloodTypeObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKBloodTypeObject; // inherited from NSObject

	static new(): HKBloodTypeObject; // inherited from NSObject

	readonly bloodType: HKBloodType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum HKBodyTemperatureSensorLocation {

	Other = 0,

	Armpit = 1,

	Body = 2,

	Ear = 3,

	Finger = 4,

	GastroIntestinal = 5,

	Mouth = 6,

	Rectum = 7,

	Toe = 8,

	EarDrum = 9,

	TemporalArtery = 10,

	Forehead = 11
}

declare class HKCDADocument extends NSObject {

	static alloc(): HKCDADocument; // inherited from NSObject

	static new(): HKCDADocument; // inherited from NSObject

	readonly authorName: string;

	readonly custodianName: string;

	readonly documentData: NSData;

	readonly patientName: string;

	readonly title: string;
}

declare class HKCDADocumentSample extends HKDocumentSample {

	static CDADocumentSampleWithDataStartDateEndDateMetadataValidationError(documentData: NSData, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKCDADocumentSample;

	static alloc(): HKCDADocumentSample; // inherited from NSObject

	static new(): HKCDADocumentSample; // inherited from NSObject

	readonly document: HKCDADocument;
}

declare class HKCategorySample extends HKSample {

	static alloc(): HKCategorySample; // inherited from NSObject

	static categorySampleWithTypeValueStartDateEndDate(type: HKCategoryType, value: number, startDate: Date, endDate: Date): HKCategorySample;

	static categorySampleWithTypeValueStartDateEndDateDeviceMetadata(type: HKCategoryType, value: number, startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKCategorySample;

	static categorySampleWithTypeValueStartDateEndDateMetadata(type: HKCategoryType, value: number, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKCategorySample;

	static new(): HKCategorySample; // inherited from NSObject

	readonly categoryType: HKCategoryType;

	readonly value: number;
}

declare class HKCategoryType extends HKSampleType {

	static alloc(): HKCategoryType; // inherited from NSObject

	static new(): HKCategoryType; // inherited from NSObject
}

declare var HKCategoryTypeIdentifierAppleStandHour: string;

declare var HKCategoryTypeIdentifierCervicalMucusQuality: string;

declare var HKCategoryTypeIdentifierIntermenstrualBleeding: string;

declare var HKCategoryTypeIdentifierMenstrualFlow: string;

declare var HKCategoryTypeIdentifierMindfulSession: string;

declare var HKCategoryTypeIdentifierOvulationTestResult: string;

declare var HKCategoryTypeIdentifierSexualActivity: string;

declare var HKCategoryTypeIdentifierSleepAnalysis: string;

declare const enum HKCategoryValue {

	NotApplicable = 0
}

declare const enum HKCategoryValueAppleStandHour {

	Stood = 0,

	Idle = 1
}

declare const enum HKCategoryValueCervicalMucusQuality {

	Dry = 1,

	Sticky = 2,

	Creamy = 3,

	Watery = 4,

	EggWhite = 5
}

declare const enum HKCategoryValueMenstrualFlow {

	Unspecified = 1,

	Light = 2,

	Medium = 3,

	Heavy = 4
}

declare const enum HKCategoryValueOvulationTestResult {

	Negative = 1,

	Positive = 2,

	Indeterminate = 3
}

declare const enum HKCategoryValueSleepAnalysis {

	InBed = 0,

	Asleep = 1,

	Awake = 2
}

declare class HKCharacteristicType extends HKObjectType {

	static alloc(): HKCharacteristicType; // inherited from NSObject

	static new(): HKCharacteristicType; // inherited from NSObject
}

declare var HKCharacteristicTypeIdentifierBiologicalSex: string;

declare var HKCharacteristicTypeIdentifierBloodType: string;

declare var HKCharacteristicTypeIdentifierDateOfBirth: string;

declare var HKCharacteristicTypeIdentifierFitzpatrickSkinType: string;

declare var HKCharacteristicTypeIdentifierWheelchairUse: string;

declare class HKCorrelation extends HKSample {

	static alloc(): HKCorrelation; // inherited from NSObject

	static correlationWithTypeStartDateEndDateObjects(correlationType: HKCorrelationType, startDate: Date, endDate: Date, objects: NSSet<HKSample>): HKCorrelation;

	static correlationWithTypeStartDateEndDateObjectsDeviceMetadata(correlationType: HKCorrelationType, startDate: Date, endDate: Date, objects: NSSet<HKSample>, device: HKDevice, metadata: NSDictionary<string, any>): HKCorrelation;

	static correlationWithTypeStartDateEndDateObjectsMetadata(correlationType: HKCorrelationType, startDate: Date, endDate: Date, objects: NSSet<HKSample>, metadata: NSDictionary<string, any>): HKCorrelation;

	static new(): HKCorrelation; // inherited from NSObject

	readonly correlationType: HKCorrelationType;

	readonly objects: NSSet<HKSample>;

	objectsForType(objectType: HKObjectType): NSSet<HKSample>;
}

declare class HKCorrelationQuery extends HKQuery {

	static alloc(): HKCorrelationQuery; // inherited from NSObject

	static new(): HKCorrelationQuery; // inherited from NSObject

	readonly correlationType: HKCorrelationType;

	readonly samplePredicates: NSDictionary<HKSampleType, NSPredicate>;

	constructor(o: { type: HKCorrelationType; predicate: NSPredicate; samplePredicates: NSDictionary<HKSampleType, NSPredicate>; completion: (p1: HKCorrelationQuery, p2: NSArray<HKCorrelation>, p3: NSError) => void; });

	initWithTypePredicateSamplePredicatesCompletion(correlationType: HKCorrelationType, predicate: NSPredicate, samplePredicates: NSDictionary<HKSampleType, NSPredicate>, completion: (p1: HKCorrelationQuery, p2: NSArray<HKCorrelation>, p3: NSError) => void): this;
}

declare class HKCorrelationType extends HKSampleType {

	static alloc(): HKCorrelationType; // inherited from NSObject

	static new(): HKCorrelationType; // inherited from NSObject
}

declare var HKCorrelationTypeIdentifierBloodPressure: string;

declare var HKCorrelationTypeIdentifierFood: string;

declare class HKDeletedObject extends NSObject implements NSSecureCoding {

	static alloc(): HKDeletedObject; // inherited from NSObject

	static new(): HKDeletedObject; // inherited from NSObject

	readonly UUID: NSUUID;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare var HKDetailedCDAValidationErrorKey: string;

declare class HKDevice extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKDevice; // inherited from NSObject

	static localDevice(): HKDevice;

	static new(): HKDevice; // inherited from NSObject

	readonly UDIDeviceIdentifier: string;

	readonly firmwareVersion: string;

	readonly hardwareVersion: string;

	readonly localIdentifier: string;

	readonly manufacturer: string;

	readonly model: string;

	readonly name: string;

	readonly softwareVersion: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { name: string; manufacturer: string; model: string; hardwareVersion: string; firmwareVersion: string; softwareVersion: string; localIdentifier: string; UDIDeviceIdentifier: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithNameManufacturerModelHardwareVersionFirmwareVersionSoftwareVersionLocalIdentifierUDIDeviceIdentifier(name: string, manufacturer: string, model: string, hardwareVersion: string, firmwareVersion: string, softwareVersion: string, localIdentifier: string, UDIDeviceIdentifier: string): this;
}

declare var HKDevicePropertyKeyFirmwareVersion: string;

declare var HKDevicePropertyKeyHardwareVersion: string;

declare var HKDevicePropertyKeyLocalIdentifier: string;

declare var HKDevicePropertyKeyManufacturer: string;

declare var HKDevicePropertyKeyModel: string;

declare var HKDevicePropertyKeyName: string;

declare var HKDevicePropertyKeySoftwareVersion: string;

declare var HKDevicePropertyKeyUDIDeviceIdentifier: string;

declare class HKDocumentQuery extends HKQuery {

	static alloc(): HKDocumentQuery; // inherited from NSObject

	static new(): HKDocumentQuery; // inherited from NSObject

	readonly includeDocumentData: boolean;

	readonly limit: number;

	readonly sortDescriptors: NSArray<NSSortDescriptor>;

	constructor(o: { documentType: HKDocumentType; predicate: NSPredicate; limit: number; sortDescriptors: NSArray<NSSortDescriptor>; includeDocumentData: boolean; resultsHandler: (p1: HKDocumentQuery, p2: NSArray<HKDocumentSample>, p3: boolean, p4: NSError) => void; });

	initWithDocumentTypePredicateLimitSortDescriptorsIncludeDocumentDataResultsHandler(documentType: HKDocumentType, predicate: NSPredicate, limit: number, sortDescriptors: NSArray<NSSortDescriptor>, includeDocumentData: boolean, resultsHandler: (p1: HKDocumentQuery, p2: NSArray<HKDocumentSample>, p3: boolean, p4: NSError) => void): this;
}

declare class HKDocumentSample extends HKSample {

	static alloc(): HKDocumentSample; // inherited from NSObject

	static new(): HKDocumentSample; // inherited from NSObject

	readonly documentType: HKDocumentType;
}

declare class HKDocumentType extends HKSampleType {

	static alloc(): HKDocumentType; // inherited from NSObject

	static new(): HKDocumentType; // inherited from NSObject
}

declare var HKDocumentTypeIdentifierCDA: string;

declare const enum HKErrorCode {

	NoError = 0,

	ErrorHealthDataUnavailable = 1,

	ErrorHealthDataRestricted = 2,

	ErrorInvalidArgument = 3,

	ErrorAuthorizationDenied = 4,

	ErrorAuthorizationNotDetermined = 5,

	ErrorDatabaseInaccessible = 6,

	ErrorUserCanceled = 7,

	ErrorAnotherWorkoutSessionStarted = 8,

	ErrorUserExitedWorkoutSession = 9
}

declare var HKErrorDomain: string;

declare const enum HKFitzpatrickSkinType {

	NotSet = 0,

	I = 1,

	II = 2,

	III = 3,

	IV = 4,

	V = 5,

	VI = 6
}

declare class HKFitzpatrickSkinTypeObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKFitzpatrickSkinTypeObject; // inherited from NSObject

	static new(): HKFitzpatrickSkinTypeObject; // inherited from NSObject

	readonly skinType: HKFitzpatrickSkinType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class HKHealthStore extends NSObject {

	static alloc(): HKHealthStore; // inherited from NSObject

	static isHealthDataAvailable(): boolean;

	static new(): HKHealthStore; // inherited from NSObject

	addSamplesToWorkoutCompletion(samples: NSArray<HKSample>, workout: HKWorkout, completion: (p1: boolean, p2: NSError) => void): void;

	authorizationStatusForType(type: HKObjectType): HKAuthorizationStatus;

	biologicalSexWithError(): HKBiologicalSexObject;

	bloodTypeWithError(): HKBloodTypeObject;

	dateOfBirthComponentsWithError(): NSDateComponents;

	dateOfBirthWithError(): Date;

	deleteObjectWithCompletion(object: HKObject, completion: (p1: boolean, p2: NSError) => void): void;

	deleteObjectsOfTypePredicateWithCompletion(objectType: HKObjectType, predicate: NSPredicate, completion: (p1: boolean, p2: number, p3: NSError) => void): void;

	deleteObjectsWithCompletion(objects: NSArray<HKObject>, completion: (p1: boolean, p2: NSError) => void): void;

	disableAllBackgroundDeliveryWithCompletion(completion: (p1: boolean, p2: NSError) => void): void;

	disableBackgroundDeliveryForTypeWithCompletion(type: HKObjectType, completion: (p1: boolean, p2: NSError) => void): void;

	earliestPermittedSampleDate(): Date;

	enableBackgroundDeliveryForTypeFrequencyWithCompletion(type: HKObjectType, frequency: HKUpdateFrequency, completion: (p1: boolean, p2: NSError) => void): void;

	executeQuery(query: HKQuery): void;

	fitzpatrickSkinTypeWithError(): HKFitzpatrickSkinTypeObject;

	handleAuthorizationForExtensionWithCompletion(completion: (p1: boolean, p2: NSError) => void): void;

	preferredUnitsForQuantityTypesCompletion(quantityTypes: NSSet<HKQuantityType>, completion: (p1: NSDictionary<HKQuantityType, HKUnit>, p2: NSError) => void): void;

	requestAuthorizationToShareTypesReadTypesCompletion(typesToShare: NSSet<HKSampleType>, typesToRead: NSSet<HKObjectType>, completion: (p1: boolean, p2: NSError) => void): void;

	saveObjectWithCompletion(object: HKObject, completion: (p1: boolean, p2: NSError) => void): void;

	saveObjectsWithCompletion(objects: NSArray<HKObject>, completion: (p1: boolean, p2: NSError) => void): void;

	splitTotalEnergyStartDateEndDateResultsHandler(totalEnergy: HKQuantity, startDate: Date, endDate: Date, resultsHandler: (p1: HKQuantity, p2: HKQuantity, p3: NSError) => void): void;

	startWatchAppWithWorkoutConfigurationCompletion(workoutConfiguration: HKWorkoutConfiguration, completion: (p1: boolean, p2: NSError) => void): void;

	stopQuery(query: HKQuery): void;

	wheelchairUseWithError(): HKWheelchairUseObject;
}

declare const enum HKHeartRateSensorLocation {

	Other = 0,

	Chest = 1,

	Wrist = 2,

	Finger = 3,

	Hand = 4,

	EarLobe = 5,

	Foot = 6
}

declare var HKMetadataKeyBodyTemperatureSensorLocation: string;

declare var HKMetadataKeyCoachedWorkout: string;

declare var HKMetadataKeyDeviceManufacturerName: string;

declare var HKMetadataKeyDeviceName: string;

declare var HKMetadataKeyDeviceSerialNumber: string;

declare var HKMetadataKeyDigitalSignature: string;

declare var HKMetadataKeyExternalUUID: string;

declare var HKMetadataKeyFoodType: string;

declare var HKMetadataKeyGroupFitness: string;

declare var HKMetadataKeyHeartRateSensorLocation: string;

declare var HKMetadataKeyIndoorWorkout: string;

declare var HKMetadataKeyLapLength: string;

declare var HKMetadataKeyMenstrualCycleStart: string;

declare var HKMetadataKeyReferenceRangeLowerLimit: string;

declare var HKMetadataKeyReferenceRangeUpperLimit: string;

declare var HKMetadataKeySexualActivityProtectionUsed: string;

declare var HKMetadataKeySwimmingLocationType: string;

declare var HKMetadataKeySwimmingStrokeStyle: string;

declare var HKMetadataKeyTimeZone: string;

declare var HKMetadataKeyUDIDeviceIdentifier: string;

declare var HKMetadataKeyUDIProductionIdentifier: string;

declare var HKMetadataKeyWasTakenInLab: string;

declare var HKMetadataKeyWasUserEntered: string;

declare var HKMetadataKeyWeatherCondition: string;

declare var HKMetadataKeyWeatherHumidity: string;

declare var HKMetadataKeyWeatherTemperature: string;

declare var HKMetadataKeyWorkoutBrandName: string;

declare const enum HKMetricPrefix {

	None = 0,

	Pico = 1,

	Nano = 2,

	Micro = 3,

	Milli = 4,

	Centi = 5,

	Deci = 6,

	Deca = 7,

	Hecto = 8,

	Kilo = 9,

	Mega = 10,

	Giga = 11,

	Tera = 12
}

declare class HKObject extends NSObject implements NSSecureCoding {

	static alloc(): HKObject; // inherited from NSObject

	static new(): HKObject; // inherited from NSObject

	readonly UUID: NSUUID;

	readonly device: HKDevice;

	readonly metadata: NSDictionary<string, any>;

	readonly source: HKSource;

	readonly sourceRevision: HKSourceRevision;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare var HKObjectQueryNoLimit: number;

declare class HKObjectType extends NSObject implements NSCopying, NSSecureCoding {

	static activitySummaryType(): HKActivitySummaryType;

	static alloc(): HKObjectType; // inherited from NSObject

	static categoryTypeForIdentifier(identifier: string): HKCategoryType;

	static characteristicTypeForIdentifier(identifier: string): HKCharacteristicType;

	static correlationTypeForIdentifier(identifier: string): HKCorrelationType;

	static documentTypeForIdentifier(identifier: string): HKDocumentType;

	static new(): HKObjectType; // inherited from NSObject

	static quantityTypeForIdentifier(identifier: string): HKQuantityType;

	static workoutType(): HKWorkoutType;

	readonly identifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class HKObserverQuery extends HKQuery {

	static alloc(): HKObserverQuery; // inherited from NSObject

	static new(): HKObserverQuery; // inherited from NSObject

	constructor(o: { sampleType: HKSampleType; predicate: NSPredicate; updateHandler: (p1: HKObserverQuery, p2: () => void, p3: NSError) => void; });

	initWithSampleTypePredicateUpdateHandler(sampleType: HKSampleType, predicate: NSPredicate, updateHandler: (p1: HKObserverQuery, p2: () => void, p3: NSError) => void): this;
}

declare var HKPredicateKeyPathCDAAuthorName: string;

declare var HKPredicateKeyPathCDACustodianName: string;

declare var HKPredicateKeyPathCDAPatientName: string;

declare var HKPredicateKeyPathCDATitle: string;

declare var HKPredicateKeyPathCategoryValue: string;

declare var HKPredicateKeyPathCorrelation: string;

declare var HKPredicateKeyPathDateComponents: string;

declare var HKPredicateKeyPathDevice: string;

declare var HKPredicateKeyPathEndDate: string;

declare var HKPredicateKeyPathMetadata: string;

declare var HKPredicateKeyPathQuantity: string;

declare var HKPredicateKeyPathSource: string;

declare var HKPredicateKeyPathSourceRevision: string;

declare var HKPredicateKeyPathStartDate: string;

declare var HKPredicateKeyPathUUID: string;

declare var HKPredicateKeyPathWorkout: string;

declare var HKPredicateKeyPathWorkoutDuration: string;

declare var HKPredicateKeyPathWorkoutTotalDistance: string;

declare var HKPredicateKeyPathWorkoutTotalEnergyBurned: string;

declare var HKPredicateKeyPathWorkoutTotalSwimmingStrokeCount: string;

declare var HKPredicateKeyPathWorkoutType: string;

declare class HKQuantity extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKQuantity; // inherited from NSObject

	static new(): HKQuantity; // inherited from NSObject

	static quantityWithUnitDoubleValue(unit: HKUnit, value: number): HKQuantity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	compare(quantity: HKQuantity): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	doubleValueForUnit(unit: HKUnit): number;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	isCompatibleWithUnit(unit: HKUnit): boolean;
}

declare const enum HKQuantityAggregationStyle {

	Cumulative = 0,

	Discrete = 1
}

declare class HKQuantitySample extends HKSample {

	static alloc(): HKQuantitySample; // inherited from NSObject

	static new(): HKQuantitySample; // inherited from NSObject

	static quantitySampleWithTypeQuantityStartDateEndDate(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date): HKQuantitySample;

	static quantitySampleWithTypeQuantityStartDateEndDateDeviceMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKQuantitySample;

	static quantitySampleWithTypeQuantityStartDateEndDateMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKQuantitySample;

	readonly quantity: HKQuantity;

	readonly quantityType: HKQuantityType;
}

declare class HKQuantityType extends HKSampleType {

	static alloc(): HKQuantityType; // inherited from NSObject

	static new(): HKQuantityType; // inherited from NSObject

	readonly aggregationStyle: HKQuantityAggregationStyle;

	isCompatibleWithUnit(unit: HKUnit): boolean;
}

declare var HKQuantityTypeIdentifierActiveEnergyBurned: string;

declare var HKQuantityTypeIdentifierAppleExerciseTime: string;

declare var HKQuantityTypeIdentifierBasalBodyTemperature: string;

declare var HKQuantityTypeIdentifierBasalEnergyBurned: string;

declare var HKQuantityTypeIdentifierBloodAlcoholContent: string;

declare var HKQuantityTypeIdentifierBloodGlucose: string;

declare var HKQuantityTypeIdentifierBloodPressureDiastolic: string;

declare var HKQuantityTypeIdentifierBloodPressureSystolic: string;

declare var HKQuantityTypeIdentifierBodyFatPercentage: string;

declare var HKQuantityTypeIdentifierBodyMass: string;

declare var HKQuantityTypeIdentifierBodyMassIndex: string;

declare var HKQuantityTypeIdentifierBodyTemperature: string;

declare var HKQuantityTypeIdentifierDietaryBiotin: string;

declare var HKQuantityTypeIdentifierDietaryCaffeine: string;

declare var HKQuantityTypeIdentifierDietaryCalcium: string;

declare var HKQuantityTypeIdentifierDietaryCarbohydrates: string;

declare var HKQuantityTypeIdentifierDietaryChloride: string;

declare var HKQuantityTypeIdentifierDietaryCholesterol: string;

declare var HKQuantityTypeIdentifierDietaryChromium: string;

declare var HKQuantityTypeIdentifierDietaryCopper: string;

declare var HKQuantityTypeIdentifierDietaryEnergyConsumed: string;

declare var HKQuantityTypeIdentifierDietaryFatMonounsaturated: string;

declare var HKQuantityTypeIdentifierDietaryFatPolyunsaturated: string;

declare var HKQuantityTypeIdentifierDietaryFatSaturated: string;

declare var HKQuantityTypeIdentifierDietaryFatTotal: string;

declare var HKQuantityTypeIdentifierDietaryFiber: string;

declare var HKQuantityTypeIdentifierDietaryFolate: string;

declare var HKQuantityTypeIdentifierDietaryIodine: string;

declare var HKQuantityTypeIdentifierDietaryIron: string;

declare var HKQuantityTypeIdentifierDietaryMagnesium: string;

declare var HKQuantityTypeIdentifierDietaryManganese: string;

declare var HKQuantityTypeIdentifierDietaryMolybdenum: string;

declare var HKQuantityTypeIdentifierDietaryNiacin: string;

declare var HKQuantityTypeIdentifierDietaryPantothenicAcid: string;

declare var HKQuantityTypeIdentifierDietaryPhosphorus: string;

declare var HKQuantityTypeIdentifierDietaryPotassium: string;

declare var HKQuantityTypeIdentifierDietaryProtein: string;

declare var HKQuantityTypeIdentifierDietaryRiboflavin: string;

declare var HKQuantityTypeIdentifierDietarySelenium: string;

declare var HKQuantityTypeIdentifierDietarySodium: string;

declare var HKQuantityTypeIdentifierDietarySugar: string;

declare var HKQuantityTypeIdentifierDietaryThiamin: string;

declare var HKQuantityTypeIdentifierDietaryVitaminA: string;

declare var HKQuantityTypeIdentifierDietaryVitaminB12: string;

declare var HKQuantityTypeIdentifierDietaryVitaminB6: string;

declare var HKQuantityTypeIdentifierDietaryVitaminC: string;

declare var HKQuantityTypeIdentifierDietaryVitaminD: string;

declare var HKQuantityTypeIdentifierDietaryVitaminE: string;

declare var HKQuantityTypeIdentifierDietaryVitaminK: string;

declare var HKQuantityTypeIdentifierDietaryWater: string;

declare var HKQuantityTypeIdentifierDietaryZinc: string;

declare var HKQuantityTypeIdentifierDistanceCycling: string;

declare var HKQuantityTypeIdentifierDistanceSwimming: string;

declare var HKQuantityTypeIdentifierDistanceWalkingRunning: string;

declare var HKQuantityTypeIdentifierDistanceWheelchair: string;

declare var HKQuantityTypeIdentifierElectrodermalActivity: string;

declare var HKQuantityTypeIdentifierFlightsClimbed: string;

declare var HKQuantityTypeIdentifierForcedExpiratoryVolume1: string;

declare var HKQuantityTypeIdentifierForcedVitalCapacity: string;

declare var HKQuantityTypeIdentifierHeartRate: string;

declare var HKQuantityTypeIdentifierHeight: string;

declare var HKQuantityTypeIdentifierInhalerUsage: string;

declare var HKQuantityTypeIdentifierLeanBodyMass: string;

declare var HKQuantityTypeIdentifierNikeFuel: string;

declare var HKQuantityTypeIdentifierNumberOfTimesFallen: string;

declare var HKQuantityTypeIdentifierOxygenSaturation: string;

declare var HKQuantityTypeIdentifierPeakExpiratoryFlowRate: string;

declare var HKQuantityTypeIdentifierPeripheralPerfusionIndex: string;

declare var HKQuantityTypeIdentifierPushCount: string;

declare var HKQuantityTypeIdentifierRespiratoryRate: string;

declare var HKQuantityTypeIdentifierStepCount: string;

declare var HKQuantityTypeIdentifierSwimmingStrokeCount: string;

declare var HKQuantityTypeIdentifierUVExposure: string;

declare class HKQuery extends NSObject {

	static alloc(): HKQuery; // inherited from NSObject

	static new(): HKQuery; // inherited from NSObject

	static predicateForActivitySummariesBetweenStartDateComponentsEndDateComponents(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents): NSPredicate;

	static predicateForActivitySummaryWithDateComponents(dateComponents: NSDateComponents): NSPredicate;

	static predicateForCategorySamplesWithOperatorTypeValue(operatorType: NSPredicateOperatorType, value: number): NSPredicate;

	static predicateForObjectWithUUID(UUID: NSUUID): NSPredicate;

	static predicateForObjectsFromDevices(devices: NSSet<HKDevice>): NSPredicate;

	static predicateForObjectsFromSource(source: HKSource): NSPredicate;

	static predicateForObjectsFromSourceRevisions(sourceRevisions: NSSet<HKSourceRevision>): NSPredicate;

	static predicateForObjectsFromSources(sources: NSSet<HKSource>): NSPredicate;

	static predicateForObjectsFromWorkout(workout: HKWorkout): NSPredicate;

	static predicateForObjectsWithDevicePropertyAllowedValues(key: string, allowedValues: NSSet<string>): NSPredicate;

	static predicateForObjectsWithMetadataKey(key: string): NSPredicate;

	static predicateForObjectsWithMetadataKeyAllowedValues(key: string, allowedValues: NSArray<any>): NSPredicate;

	static predicateForObjectsWithMetadataKeyOperatorTypeValue(key: string, operatorType: NSPredicateOperatorType, value: any): NSPredicate;

	static predicateForObjectsWithNoCorrelation(): NSPredicate;

	static predicateForObjectsWithUUIDs(UUIDs: NSSet<NSUUID>): NSPredicate;

	static predicateForQuantitySamplesWithOperatorTypeQuantity(operatorType: NSPredicateOperatorType, quantity: HKQuantity): NSPredicate;

	static predicateForSamplesWithStartDateEndDateOptions(startDate: Date, endDate: Date, options: HKQueryOptions): NSPredicate;

	static predicateForWorkoutsWithOperatorTypeDuration(operatorType: NSPredicateOperatorType, duration: number): NSPredicate;

	static predicateForWorkoutsWithOperatorTypeTotalDistance(operatorType: NSPredicateOperatorType, totalDistance: HKQuantity): NSPredicate;

	static predicateForWorkoutsWithOperatorTypeTotalEnergyBurned(operatorType: NSPredicateOperatorType, totalEnergyBurned: HKQuantity): NSPredicate;

	static predicateForWorkoutsWithOperatorTypeTotalSwimmingStrokeCount(operatorType: NSPredicateOperatorType, totalSwimmingStrokeCount: HKQuantity): NSPredicate;

	static predicateForWorkoutsWithWorkoutActivityType(workoutActivityType: HKWorkoutActivityType): NSPredicate;

	readonly objectType: HKObjectType;

	readonly predicate: NSPredicate;

	readonly sampleType: HKSampleType;
}

declare class HKQueryAnchor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKQueryAnchor; // inherited from NSObject

	static anchorFromValue(value: number): HKQueryAnchor;

	static new(): HKQueryAnchor; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum HKQueryOptions {

	None = 0,

	StrictStartDate = 1,

	StrictEndDate = 2
}

declare class HKSample extends HKObject {

	static alloc(): HKSample; // inherited from NSObject

	static new(): HKSample; // inherited from NSObject

	readonly endDate: Date;

	readonly sampleType: HKSampleType;

	readonly startDate: Date;
}

declare class HKSampleQuery extends HKQuery {

	static alloc(): HKSampleQuery; // inherited from NSObject

	static new(): HKSampleQuery; // inherited from NSObject

	readonly limit: number;

	readonly sortDescriptors: NSArray<NSSortDescriptor>;

	constructor(o: { sampleType: HKSampleType; predicate: NSPredicate; limit: number; sortDescriptors: NSArray<NSSortDescriptor>; resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void; });

	initWithSampleTypePredicateLimitSortDescriptorsResultsHandler(sampleType: HKSampleType, predicate: NSPredicate, limit: number, sortDescriptors: NSArray<NSSortDescriptor>, resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void): this;
}

declare var HKSampleSortIdentifierEndDate: string;

declare var HKSampleSortIdentifierStartDate: string;

declare class HKSampleType extends HKObjectType {

	static alloc(): HKSampleType; // inherited from NSObject

	static new(): HKSampleType; // inherited from NSObject
}

declare class HKSource extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKSource; // inherited from NSObject

	static defaultSource(): HKSource;

	static new(): HKSource; // inherited from NSObject

	readonly bundleIdentifier: string;

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class HKSourceQuery extends HKQuery {

	static alloc(): HKSourceQuery; // inherited from NSObject

	static new(): HKSourceQuery; // inherited from NSObject

	constructor(o: { sampleType: HKSampleType; samplePredicate: NSPredicate; completionHandler: (p1: HKSourceQuery, p2: NSSet<HKSource>, p3: NSError) => void; });

	initWithSampleTypeSamplePredicateCompletionHandler(sampleType: HKSampleType, objectPredicate: NSPredicate, completionHandler: (p1: HKSourceQuery, p2: NSSet<HKSource>, p3: NSError) => void): this;
}

declare class HKSourceRevision extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKSourceRevision; // inherited from NSObject

	static new(): HKSourceRevision; // inherited from NSObject

	readonly source: HKSource;

	readonly version: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { source: HKSource; version: string; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	initWithSourceVersion(source: HKSource, version: string): this;
}

declare class HKStatistics extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKStatistics; // inherited from NSObject

	static new(): HKStatistics; // inherited from NSObject

	readonly endDate: Date;

	readonly quantityType: HKQuantityType;

	readonly sources: NSArray<HKSource>;

	readonly startDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	averageQuantity(): HKQuantity;

	averageQuantityForSource(source: HKSource): HKQuantity;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	maximumQuantity(): HKQuantity;

	maximumQuantityForSource(source: HKSource): HKQuantity;

	minimumQuantity(): HKQuantity;

	minimumQuantityForSource(source: HKSource): HKQuantity;

	sumQuantity(): HKQuantity;

	sumQuantityForSource(source: HKSource): HKQuantity;
}

declare class HKStatisticsCollection extends NSObject {

	static alloc(): HKStatisticsCollection; // inherited from NSObject

	static new(): HKStatisticsCollection; // inherited from NSObject

	enumerateStatisticsFromDateToDateWithBlock(startDate: Date, endDate: Date, block: (p1: HKStatistics, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	sources(): NSSet<HKSource>;

	statistics(): NSArray<HKStatistics>;

	statisticsForDate(date: Date): HKStatistics;
}

declare class HKStatisticsCollectionQuery extends HKQuery {

	static alloc(): HKStatisticsCollectionQuery; // inherited from NSObject

	static new(): HKStatisticsCollectionQuery; // inherited from NSObject

	readonly anchorDate: Date;

	initialResultsHandler: (p1: HKStatisticsCollectionQuery, p2: HKStatisticsCollection, p3: NSError) => void;

	readonly intervalComponents: NSDateComponents;

	readonly options: HKStatisticsOptions;

	statisticsUpdateHandler: (p1: HKStatisticsCollectionQuery, p2: HKStatistics, p3: HKStatisticsCollection, p4: NSError) => void;

	constructor(o: { quantityType: HKQuantityType; quantitySamplePredicate: NSPredicate; options: HKStatisticsOptions; anchorDate: Date; intervalComponents: NSDateComponents; });

	initWithQuantityTypeQuantitySamplePredicateOptionsAnchorDateIntervalComponents(quantityType: HKQuantityType, quantitySamplePredicate: NSPredicate, options: HKStatisticsOptions, anchorDate: Date, intervalComponents: NSDateComponents): this;
}

declare const enum HKStatisticsOptions {

	None = 0,

	SeparateBySource = 1,

	DiscreteAverage = 2,

	DiscreteMin = 4,

	DiscreteMax = 8,

	CumulativeSum = 16
}

declare class HKStatisticsQuery extends HKQuery {

	static alloc(): HKStatisticsQuery; // inherited from NSObject

	static new(): HKStatisticsQuery; // inherited from NSObject

	constructor(o: { quantityType: HKQuantityType; quantitySamplePredicate: NSPredicate; options: HKStatisticsOptions; completionHandler: (p1: HKStatisticsQuery, p2: HKStatistics, p3: NSError) => void; });

	initWithQuantityTypeQuantitySamplePredicateOptionsCompletionHandler(quantityType: HKQuantityType, quantitySamplePredicate: NSPredicate, options: HKStatisticsOptions, handler: (p1: HKStatisticsQuery, p2: HKStatistics, p3: NSError) => void): this;
}

declare const enum HKSwimmingStrokeStyle {

	Unknown = 0,

	Mixed = 1,

	Freestyle = 2,

	Backstroke = 3,

	Breaststroke = 4,

	Butterfly = 5
}

declare class HKUnit extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKUnit; // inherited from NSObject

	static atmosphereUnit(): HKUnit;

	static calorieUnit(): HKUnit;

	static centimeterOfWaterUnit(): HKUnit;

	static countUnit(): HKUnit;

	static cupImperialUnit(): HKUnit;

	static cupUSUnit(): HKUnit;

	static dayUnit(): HKUnit;

	static degreeCelsiusUnit(): HKUnit;

	static degreeFahrenheitUnit(): HKUnit;

	static energyFormatterUnitFromUnit(unit: HKUnit): NSEnergyFormatterUnit;

	static fluidOunceImperialUnit(): HKUnit;

	static fluidOunceUSUnit(): HKUnit;

	static footUnit(): HKUnit;

	static gramUnit(): HKUnit;

	static gramUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static hourUnit(): HKUnit;

	static inchUnit(): HKUnit;

	static jouleUnit(): HKUnit;

	static jouleUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static kelvinUnit(): HKUnit;

	static kilocalorieUnit(): HKUnit;

	static lengthFormatterUnitFromUnit(unit: HKUnit): NSLengthFormatterUnit;

	static literUnit(): HKUnit;

	static literUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static massFormatterUnitFromUnit(unit: HKUnit): NSMassFormatterUnit;

	static meterUnit(): HKUnit;

	static meterUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static mileUnit(): HKUnit;

	static millimeterOfMercuryUnit(): HKUnit;

	static minuteUnit(): HKUnit;

	static moleUnitWithMetricPrefixMolarMass(prefix: HKMetricPrefix, gramsPerMole: number): HKUnit;

	static moleUnitWithMolarMass(gramsPerMole: number): HKUnit;

	static new(): HKUnit; // inherited from NSObject

	static ounceUnit(): HKUnit;

	static pascalUnit(): HKUnit;

	static pascalUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static percentUnit(): HKUnit;

	static pintImperialUnit(): HKUnit;

	static pintUSUnit(): HKUnit;

	static poundUnit(): HKUnit;

	static secondUnit(): HKUnit;

	static secondUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static siemenUnit(): HKUnit;

	static siemenUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static stoneUnit(): HKUnit;

	static unitFromEnergyFormatterUnit(energyFormatterUnit: NSEnergyFormatterUnit): HKUnit;

	static unitFromLengthFormatterUnit(lengthFormatterUnit: NSLengthFormatterUnit): HKUnit;

	static unitFromMassFormatterUnit(massFormatterUnit: NSMassFormatterUnit): HKUnit;

	static unitFromString(string: string): HKUnit;

	static yardUnit(): HKUnit;

	readonly unitString: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;

	isNull(): boolean;

	reciprocalUnit(): HKUnit;

	unitDividedByUnit(unit: HKUnit): HKUnit;

	unitMultipliedByUnit(unit: HKUnit): HKUnit;

	unitRaisedToPower(power: number): HKUnit;
}

declare const enum HKUpdateFrequency {

	Immediate = 1,

	Hourly = 2,

	Daily = 3,

	Weekly = 4
}

declare var HKUserPreferencesDidChangeNotification: string;

declare const enum HKWeatherCondition {

	None = 0,

	Clear = 1,

	Fair = 2,

	PartlyCloudy = 3,

	MostlyCloudy = 4,

	Cloudy = 5,

	Foggy = 6,

	Haze = 7,

	Windy = 8,

	Blustery = 9,

	Smoky = 10,

	Dust = 11,

	Snow = 12,

	Hail = 13,

	Sleet = 14,

	FreezingDrizzle = 15,

	FreezingRain = 16,

	MixedRainAndHail = 17,

	MixedRainAndSnow = 18,

	MixedRainAndSleet = 19,

	MixedSnowAndSleet = 20,

	Drizzle = 21,

	ScatteredShowers = 22,

	Showers = 23,

	Thunderstorms = 24,

	TropicalStorm = 25,

	Hurricane = 26,

	Tornado = 27
}

declare const enum HKWheelchairUse {

	NotSet = 0,

	No = 1,

	Yes = 2
}

declare class HKWheelchairUseObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKWheelchairUseObject; // inherited from NSObject

	static new(): HKWheelchairUseObject; // inherited from NSObject

	readonly wheelchairUse: HKWheelchairUse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class HKWorkout extends HKSample {

	static alloc(): HKWorkout; // inherited from NSObject

	static new(): HKWorkout; // inherited from NSObject

	static workoutWithActivityTypeStartDateEndDate(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date): HKWorkout;

	static workoutWithActivityTypeStartDateEndDateDurationTotalEnergyBurnedTotalDistanceDeviceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, duration: number, totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, device: HKDevice, metadata: NSDictionary<string, any>): HKWorkout;

	static workoutWithActivityTypeStartDateEndDateDurationTotalEnergyBurnedTotalDistanceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, duration: number, totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, metadata: NSDictionary<string, any>): HKWorkout;

	static workoutWithActivityTypeStartDateEndDateWorkoutEventsTotalEnergyBurnedTotalDistanceDeviceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, workoutEvents: NSArray<HKWorkoutEvent>, totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, device: HKDevice, metadata: NSDictionary<string, any>): HKWorkout;

	static workoutWithActivityTypeStartDateEndDateWorkoutEventsTotalEnergyBurnedTotalDistanceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, workoutEvents: NSArray<HKWorkoutEvent>, totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, metadata: NSDictionary<string, any>): HKWorkout;

	static workoutWithActivityTypeStartDateEndDateWorkoutEventsTotalEnergyBurnedTotalDistanceTotalSwimmingStrokeCountDeviceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, workoutEvents: NSArray<HKWorkoutEvent>, totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, totalSwimmingStrokeCount: HKQuantity, device: HKDevice, metadata: NSDictionary<string, any>): HKWorkout;

	readonly duration: number;

	readonly totalDistance: HKQuantity;

	readonly totalEnergyBurned: HKQuantity;

	readonly totalSwimmingStrokeCount: HKQuantity;

	readonly workoutActivityType: HKWorkoutActivityType;

	readonly workoutEvents: NSArray<HKWorkoutEvent>;
}

declare const enum HKWorkoutActivityType {

	AmericanFootball = 1,

	Archery = 2,

	AustralianFootball = 3,

	Badminton = 4,

	Baseball = 5,

	Basketball = 6,

	Bowling = 7,

	Boxing = 8,

	Climbing = 9,

	Cricket = 10,

	CrossTraining = 11,

	Curling = 12,

	Cycling = 13,

	Dance = 14,

	DanceInspiredTraining = 15,

	Elliptical = 16,

	EquestrianSports = 17,

	Fencing = 18,

	Fishing = 19,

	FunctionalStrengthTraining = 20,

	Golf = 21,

	Gymnastics = 22,

	Handball = 23,

	Hiking = 24,

	Hockey = 25,

	Hunting = 26,

	Lacrosse = 27,

	MartialArts = 28,

	MindAndBody = 29,

	MixedMetabolicCardioTraining = 30,

	PaddleSports = 31,

	Play = 32,

	PreparationAndRecovery = 33,

	Racquetball = 34,

	Rowing = 35,

	Rugby = 36,

	Running = 37,

	Sailing = 38,

	SkatingSports = 39,

	SnowSports = 40,

	Soccer = 41,

	Softball = 42,

	Squash = 43,

	StairClimbing = 44,

	SurfingSports = 45,

	Swimming = 46,

	TableTennis = 47,

	Tennis = 48,

	TrackAndField = 49,

	TraditionalStrengthTraining = 50,

	Volleyball = 51,

	Walking = 52,

	WaterFitness = 53,

	WaterPolo = 54,

	WaterSports = 55,

	Wrestling = 56,

	Yoga = 57,

	Barre = 58,

	CoreTraining = 59,

	CrossCountrySkiing = 60,

	DownhillSkiing = 61,

	Flexibility = 62,

	HighIntensityIntervalTraining = 63,

	JumpRope = 64,

	Kickboxing = 65,

	Pilates = 66,

	Snowboarding = 67,

	Stairs = 68,

	StepTraining = 69,

	WheelchairWalkPace = 70,

	WheelchairRunPace = 71,

	Other = 3000
}

declare class HKWorkoutConfiguration extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKWorkoutConfiguration; // inherited from NSObject

	static new(): HKWorkoutConfiguration; // inherited from NSObject

	activityType: HKWorkoutActivityType;

	lapLength: HKQuantity;

	locationType: HKWorkoutSessionLocationType;

	swimmingLocationType: HKWorkoutSwimmingLocationType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare class HKWorkoutEvent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKWorkoutEvent; // inherited from NSObject

	static new(): HKWorkoutEvent; // inherited from NSObject

	static workoutEventWithTypeDate(type: HKWorkoutEventType, date: Date): HKWorkoutEvent;

	static workoutEventWithTypeDateMetadata(type: HKWorkoutEventType, date: Date, metadata: NSDictionary<string, any>): HKWorkoutEvent;

	readonly date: Date;

	readonly metadata: NSDictionary<string, any>;

	readonly type: HKWorkoutEventType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(aCoder: NSCoder): void;

	initWithCoder(aDecoder: NSCoder): this;
}

declare const enum HKWorkoutEventType {

	Pause = 1,

	Resume = 2,

	Lap = 3,

	Marker = 4,

	MotionPaused = 5,

	MotionResumed = 6
}

declare const enum HKWorkoutSessionLocationType {

	Unknown = 1,

	Indoor = 2,

	Outdoor = 3
}

declare var HKWorkoutSortIdentifierDuration: string;

declare var HKWorkoutSortIdentifierTotalDistance: string;

declare var HKWorkoutSortIdentifierTotalEnergyBurned: string;

declare var HKWorkoutSortIdentifierTotalSwimmingStrokeCount: string;

declare const enum HKWorkoutSwimmingLocationType {

	Unknown = 0,

	Pool = 1,

	OpenWater = 2
}

declare class HKWorkoutType extends HKSampleType {

	static alloc(): HKWorkoutType; // inherited from NSObject

	static new(): HKWorkoutType; // inherited from NSObject
}

declare var HKWorkoutTypeIdentifier: string;
