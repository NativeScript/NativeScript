
/**
 * @since 14.0
 */
declare const enum HKActivityMoveMode {

	ActiveEnergy = 1,

	AppleMoveTime = 2
}

/**
 * @since 14.0
 */
declare class HKActivityMoveModeObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKActivityMoveModeObject; // inherited from NSObject

	static new(): HKActivityMoveModeObject; // inherited from NSObject

	readonly activityMoveMode: HKActivityMoveMode;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.3
 */
declare class HKActivitySummary extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKActivitySummary; // inherited from NSObject

	static new(): HKActivitySummary; // inherited from NSObject

	activeEnergyBurned: HKQuantity;

	activeEnergyBurnedGoal: HKQuantity;

	/**
	 * @since 14.0
	 */
	activityMoveMode: HKActivityMoveMode;

	appleExerciseTime: HKQuantity;

	/**
	 * @since 9.3
	 * @deprecated 100000
	 */
	appleExerciseTimeGoal: HKQuantity;

	/**
	 * @since 14.0
	 */
	appleMoveTime: HKQuantity;

	/**
	 * @since 14.0
	 */
	appleMoveTimeGoal: HKQuantity;

	appleStandHours: HKQuantity;

	/**
	 * @since 9.3
	 * @deprecated 100000
	 */
	appleStandHoursGoal: HKQuantity;

	/**
	 * @since 16.0
	 */
	exerciseTimeGoal: HKQuantity;

	/**
	 * @since 18.0
	 */
	paused: boolean;

	/**
	 * @since 16.0
	 */
	standHoursGoal: HKQuantity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	dateComponentsForCalendar(calendar: NSCalendar): NSDateComponents;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.3
 */
declare class HKActivitySummaryQuery extends HKQuery {

	static alloc(): HKActivitySummaryQuery; // inherited from NSObject

	static new(): HKActivitySummaryQuery; // inherited from NSObject

	updateHandler: (p1: HKActivitySummaryQuery, p2: NSArray<HKActivitySummary>, p3: NSError) => void;

	constructor(o: { predicate: NSPredicate; resultsHandler: (p1: HKActivitySummaryQuery, p2: NSArray<HKActivitySummary>, p3: NSError) => void; });

	initWithPredicateResultsHandler(predicate: NSPredicate, handler: (p1: HKActivitySummaryQuery, p2: NSArray<HKActivitySummary>, p3: NSError) => void): this;
}

/**
 * @since 9.3
 */
declare class HKActivitySummaryType extends HKObjectType {

	static alloc(): HKActivitySummaryType; // inherited from NSObject

	static new(): HKActivitySummaryType; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare class HKAnchoredObjectQuery extends HKQuery {

	static alloc(): HKAnchoredObjectQuery; // inherited from NSObject

	static new(): HKAnchoredObjectQuery; // inherited from NSObject

	/**
	 * @since 9.0
	 */
	updateHandler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void;

	/**
	 * @since 15.0
	 */
	constructor(o: { queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[]; anchor: HKQueryAnchor; limit: number; resultsHandler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void; });

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	constructor(o: { type: HKSampleType; predicate: NSPredicate; anchor: number; limit: number; completionHandler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: number, p4: NSError) => void; });

	/**
	 * @since 9.0
	 */
	constructor(o: { type: HKSampleType; predicate: NSPredicate; anchor: HKQueryAnchor; limit: number; resultsHandler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void; });

	/**
	 * @since 15.0
	 */
	initWithQueryDescriptorsAnchorLimitResultsHandler(queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[], anchor: HKQueryAnchor, limit: number, handler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void): this;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	initWithTypePredicateAnchorLimitCompletionHandler(type: HKSampleType, predicate: NSPredicate, anchor: number, limit: number, handler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: number, p4: NSError) => void): this;

	/**
	 * @since 9.0
	 */
	initWithTypePredicateAnchorLimitResultsHandler(type: HKSampleType, predicate: NSPredicate, anchor: HKQueryAnchor, limit: number, handler: (p1: HKAnchoredObjectQuery, p2: NSArray<HKSample>, p3: NSArray<HKDeletedObject>, p4: HKQueryAnchor, p5: NSError) => void): this;
}

/**
 * @since 14.0
 */
declare const enum HKAppleECGAlgorithmVersion {

	Version1 = 1,

	Version2 = 2
}

/**
 * @since 18.0
 */
declare const enum HKAppleSleepingBreathingDisturbancesClassification {

	NotElevated = 0,

	Elevated = 1
}

/**
 * @since 18.0
 */
declare function HKAppleSleepingBreathingDisturbancesClassificationForQuantity(value: HKQuantity): number;

/**
 * @since 18.0
 */
declare function HKAppleSleepingBreathingDisturbancesMinimumQuantityForClassification(classification: HKAppleSleepingBreathingDisturbancesClassification): HKQuantity;

/**
 * @since 15.0
 */
declare const enum HKAppleWalkingSteadinessClassification {

	OK = 1,

	Low = 2,

	VeryLow = 3
}

/**
 * @since 15.0
 */
declare function HKAppleWalkingSteadinessClassificationForQuantity(value: HKQuantity, classificationOut: interop.Pointer | interop.Reference<HKAppleWalkingSteadinessClassification>, errorOut: interop.Pointer | interop.Reference<NSError>): boolean;

/**
 * @since 15.0
 */
declare function HKAppleWalkingSteadinessMaximumQuantityForClassification(classification: HKAppleWalkingSteadinessClassification): HKQuantity;

/**
 * @since 15.0
 */
declare function HKAppleWalkingSteadinessMinimumQuantityForClassification(classification: HKAppleWalkingSteadinessClassification): HKQuantity;

/**
 * @since 16.0
 */
declare class HKAttachment extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKAttachment; // inherited from NSObject

	static new(): HKAttachment; // inherited from NSObject

	readonly contentType: UTType;

	readonly creationDate: Date;

	readonly identifier: NSUUID;

	readonly metadata: NSDictionary<string, any>;

	readonly name: string;

	readonly size: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare class HKAttachmentStore extends NSObject {

	static alloc(): HKAttachmentStore; // inherited from NSObject

	static new(): HKAttachmentStore; // inherited from NSObject

	constructor(o: { healthStore: HKHealthStore; });

	addAttachmentToObjectNameContentTypeURLMetadataCompletion(object: HKObject, name: string, contentType: UTType, URL: NSURL, metadata: NSDictionary<string, any>, completion: (p1: HKAttachment, p2: NSError) => void): void;

	getAttachmentsForObjectCompletion(object: HKObject, completion: (p1: NSArray<HKAttachment>, p2: NSError) => void): void;

	getDataForAttachmentCompletion(attachment: HKAttachment, completion: (p1: NSData, p2: NSError) => void): NSProgress;

	initWithHealthStore(healthStore: HKHealthStore): this;

	removeAttachmentFromObjectCompletion(attachment: HKAttachment, object: HKObject, completion: (p1: boolean, p2: NSError) => void): void;

	streamDataForAttachmentDataHandler(attachment: HKAttachment, dataHandler: (p1: NSData, p2: NSError, p3: boolean) => void): NSProgress;
}

/**
 * @since 18.1
 */
declare const enum HKAudiogramConductionType {

	Air = 0
}

/**
 * @since 13.0
 */
declare class HKAudiogramSample extends HKSample {

	static alloc(): HKAudiogramSample; // inherited from NSObject

	/**
	 * @since 18.1
	 */
	static audiogramSampleWithSensitivityPointsStartDateEndDateDeviceMetadata(sensitivityPoints: NSArray<HKAudiogramSensitivityPoint> | HKAudiogramSensitivityPoint[], startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKAudiogramSample;

	/**
	 * @since 13.0
	 * @deprecated 18.1
	 */
	static audiogramSampleWithSensitivityPointsStartDateEndDateMetadata(sensitivityPoints: NSArray<HKAudiogramSensitivityPoint> | HKAudiogramSensitivityPoint[], startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKAudiogramSample;

	static new(): HKAudiogramSample; // inherited from NSObject

	readonly sensitivityPoints: NSArray<HKAudiogramSensitivityPoint>;
}

/**
 * @since 13.0
 */
declare class HKAudiogramSampleType extends HKSampleType {

	static alloc(): HKAudiogramSampleType; // inherited from NSObject

	static new(): HKAudiogramSampleType; // inherited from NSObject
}

/**
 * @since 13.0
 */
declare class HKAudiogramSensitivityPoint extends NSObject implements NSSecureCoding {

	static alloc(): HKAudiogramSensitivityPoint; // inherited from NSObject

	static new(): HKAudiogramSensitivityPoint; // inherited from NSObject

	/**
	 * @since 13.0
	 * @deprecated 18.1
	 */
	static sensitivityPointWithFrequencyLeftEarSensitivityRightEarSensitivityError(frequency: HKQuantity, leftEarSensitivity: HKQuantity, rightEarSensitivity: HKQuantity): HKAudiogramSensitivityPoint;

	/**
	 * @since 18.1
	 */
	static sensitivityPointWithFrequencyTestsError(frequency: HKQuantity, tests: NSArray<HKAudiogramSensitivityTest> | HKAudiogramSensitivityTest[]): HKAudiogramSensitivityPoint;

	readonly frequency: HKQuantity;

	/**
	 * @since 13.0
	 * @deprecated 18.1
	 */
	readonly leftEarSensitivity: HKQuantity;

	/**
	 * @since 13.0
	 * @deprecated 18.1
	 */
	readonly rightEarSensitivity: HKQuantity;

	/**
	 * @since 18.1
	 */
	readonly tests: NSArray<HKAudiogramSensitivityTest>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.1
 */
declare class HKAudiogramSensitivityPointClampingRange extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKAudiogramSensitivityPointClampingRange; // inherited from NSObject

	static clampingRangeWithLowerBoundUpperBoundError(lowerBound: number, upperBound: number): HKAudiogramSensitivityPointClampingRange;

	static new(): HKAudiogramSensitivityPointClampingRange; // inherited from NSObject

	readonly lowerBound: HKQuantity;

	readonly upperBound: HKQuantity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.1
 */
declare class HKAudiogramSensitivityTest extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKAudiogramSensitivityTest; // inherited from NSObject

	static new(): HKAudiogramSensitivityTest; // inherited from NSObject

	readonly clampingRange: HKAudiogramSensitivityPointClampingRange;

	readonly masked: boolean;

	readonly sensitivity: HKQuantity;

	readonly side: HKAudiogramSensitivityTestSide;

	readonly type: HKAudiogramConductionType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { sensitivity: HKQuantity; type: HKAudiogramConductionType; masked: boolean; side: HKAudiogramSensitivityTestSide; clampingRange: HKAudiogramSensitivityPointClampingRange; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSensitivityTypeMaskedSideClampingRangeError(sensitivity: HKQuantity, type: HKAudiogramConductionType, masked: boolean, side: HKAudiogramSensitivityTestSide, clampingRange: HKAudiogramSensitivityPointClampingRange): this;
}

/**
 * @since 18.1
 */
declare const enum HKAudiogramSensitivityTestSide {

	Left = 0,

	Right = 1
}

/**
 * @since 12.0
 */
declare const enum HKAuthorizationRequestStatus {

	Unknown = 0,

	ShouldRequest = 1,

	Unnecessary = 2
}

/**
 * @since 8.0
 */
declare const enum HKAuthorizationStatus {

	NotDetermined = 0,

	SharingDenied = 1,

	SharingAuthorized = 2
}

/**
 * @since 8.0
 */
declare const enum HKBiologicalSex {

	NotSet = 0,

	Female = 1,

	Male = 2,

	Other = 3
}

/**
 * @since 8.0
 */
declare class HKBiologicalSexObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKBiologicalSexObject; // inherited from NSObject

	static new(): HKBiologicalSexObject; // inherited from NSObject

	readonly biologicalSex: HKBiologicalSex;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 11.0
 */
declare const enum HKBloodGlucoseMealTime {

	Preprandial = 1,

	Postprandial = 2
}

/**
 * @since 8.0
 */
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

/**
 * @since 8.0
 */
declare class HKBloodTypeObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKBloodTypeObject; // inherited from NSObject

	static new(): HKBloodTypeObject; // inherited from NSObject

	readonly bloodType: HKBloodType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
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

/**
 * @since 11.0
 */
declare class HKCDADocument extends NSObject {

	static alloc(): HKCDADocument; // inherited from NSObject

	static new(): HKCDADocument; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly authorName: string;

	/**
	 * @since 10.0
	 */
	readonly custodianName: string;

	/**
	 * @since 10.0
	 */
	readonly documentData: NSData;

	/**
	 * @since 10.0
	 */
	readonly patientName: string;

	/**
	 * @since 10.0
	 */
	readonly title: string;
}

/**
 * @since 10.0
 */
declare class HKCDADocumentSample extends HKDocumentSample {

	static CDADocumentSampleWithDataStartDateEndDateMetadataValidationError(documentData: NSData, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKCDADocumentSample;

	static alloc(): HKCDADocumentSample; // inherited from NSObject

	static new(): HKCDADocumentSample; // inherited from NSObject

	readonly document: HKCDADocument;
}

/**
 * @since 8.0
 */
declare class HKCategorySample extends HKSample {

	static alloc(): HKCategorySample; // inherited from NSObject

	static categorySampleWithTypeValueStartDateEndDate(type: HKCategoryType, value: number, startDate: Date, endDate: Date): HKCategorySample;

	/**
	 * @since 9.0
	 */
	static categorySampleWithTypeValueStartDateEndDateDeviceMetadata(type: HKCategoryType, value: number, startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKCategorySample;

	static categorySampleWithTypeValueStartDateEndDateMetadata(type: HKCategoryType, value: number, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKCategorySample;

	static new(): HKCategorySample; // inherited from NSObject

	readonly categoryType: HKCategoryType;

	readonly value: number;
}

/**
 * @since 8.0
 */
declare class HKCategoryType extends HKSampleType {

	static alloc(): HKCategoryType; // inherited from NSObject

	static new(): HKCategoryType; // inherited from NSObject
}

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierAbdominalCramps: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierAcne: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierAppetiteChanges: string;

/**
 * @since 9.0
 */
declare var HKCategoryTypeIdentifierAppleStandHour: string;

/**
 * @since 15.0
 */
declare var HKCategoryTypeIdentifierAppleWalkingSteadinessEvent: string;

/**
 * @since 13.0
 * @deprecated 14.0
 */
declare var HKCategoryTypeIdentifierAudioExposureEvent: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierBladderIncontinence: string;

/**
 * @since 18.0
 */
declare var HKCategoryTypeIdentifierBleedingAfterPregnancy: string;

/**
 * @since 18.0
 */
declare var HKCategoryTypeIdentifierBleedingDuringPregnancy: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierBloating: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierBreastPain: string;

/**
 * @since 9.0
 */
declare var HKCategoryTypeIdentifierCervicalMucusQuality: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierChestTightnessOrPain: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierChills: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierConstipation: string;

/**
 * @since 14.3
 */
declare var HKCategoryTypeIdentifierContraceptive: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierCoughing: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierDiarrhea: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierDizziness: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierDrySkin: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierEnvironmentalAudioExposureEvent: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierFainting: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierFatigue: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierFever: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierGeneralizedBodyAche: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierHairLoss: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierHandwashingEvent: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierHeadache: string;

/**
 * @since 14.2
 */
declare var HKCategoryTypeIdentifierHeadphoneAudioExposureEvent: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierHeartburn: string;

/**
 * @since 12.2
 */
declare var HKCategoryTypeIdentifierHighHeartRateEvent: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierHotFlashes: string;

/**
 * @since 16.0
 */
declare var HKCategoryTypeIdentifierInfrequentMenstrualCycles: string;

/**
 * @since 9.0
 */
declare var HKCategoryTypeIdentifierIntermenstrualBleeding: string;

/**
 * @since 12.2
 */
declare var HKCategoryTypeIdentifierIrregularHeartRhythmEvent: string;

/**
 * @since 16.0
 */
declare var HKCategoryTypeIdentifierIrregularMenstrualCycles: string;

/**
 * @since 14.3
 */
declare var HKCategoryTypeIdentifierLactation: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierLossOfSmell: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierLossOfTaste: string;

/**
 * @since 14.3
 */
declare var HKCategoryTypeIdentifierLowCardioFitnessEvent: string;

/**
 * @since 12.2
 */
declare var HKCategoryTypeIdentifierLowHeartRateEvent: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierLowerBackPain: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierMemoryLapse: string;

/**
 * @since 9.0
 */
declare var HKCategoryTypeIdentifierMenstrualFlow: string;

/**
 * @since 10.0
 */
declare var HKCategoryTypeIdentifierMindfulSession: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierMoodChanges: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierNausea: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierNightSweats: string;

/**
 * @since 9.0
 */
declare var HKCategoryTypeIdentifierOvulationTestResult: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierPelvicPain: string;

/**
 * @since 16.0
 */
declare var HKCategoryTypeIdentifierPersistentIntermenstrualBleeding: string;

/**
 * @since 14.3
 */
declare var HKCategoryTypeIdentifierPregnancy: string;

/**
 * @since 15.0
 */
declare var HKCategoryTypeIdentifierPregnancyTestResult: string;

/**
 * @since 15.0
 */
declare var HKCategoryTypeIdentifierProgesteroneTestResult: string;

/**
 * @since 16.0
 */
declare var HKCategoryTypeIdentifierProlongedMenstrualPeriods: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierRapidPoundingOrFlutteringHeartbeat: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierRunnyNose: string;

/**
 * @since 9.0
 */
declare var HKCategoryTypeIdentifierSexualActivity: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierShortnessOfBreath: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierSinusCongestion: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierSkippedHeartbeat: string;

/**
 * @since 8.0
 */
declare var HKCategoryTypeIdentifierSleepAnalysis: string;

/**
 * @since 18.0
 */
declare var HKCategoryTypeIdentifierSleepApneaEvent: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierSleepChanges: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierSoreThroat: string;

/**
 * @since 13.0
 */
declare var HKCategoryTypeIdentifierToothbrushingEvent: string;

/**
 * @since 14.0
 */
declare var HKCategoryTypeIdentifierVaginalDryness: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierVomiting: string;

/**
 * @since 13.6
 */
declare var HKCategoryTypeIdentifierWheezing: string;

/**
 * @since 9.0
 */
declare const enum HKCategoryValue {

	NotApplicable = 0
}

/**
 * @since 13.6
 */
declare const enum HKCategoryValueAppetiteChanges {

	Unspecified = 0,

	NoChange = 1,

	Decreased = 2,

	Increased = 3
}

/**
 * @since 9.0
 */
declare const enum HKCategoryValueAppleStandHour {

	Stood = 0,

	Idle = 1
}

/**
 * @since 15.0
 */
declare const enum HKCategoryValueAppleWalkingSteadinessEvent {

	InitialLow = 1,

	InitialVeryLow = 2,

	RepeatLow = 3,

	RepeatVeryLow = 4
}

/**
 * @since 13.0
 * @deprecated 14.0
 */
declare const enum HKCategoryValueAudioExposureEvent {

	LoudEnvironment = 1
}

/**
 * @since 9.0
 */
declare const enum HKCategoryValueCervicalMucusQuality {

	Dry = 1,

	Sticky = 2,

	Creamy = 3,

	Watery = 4,

	EggWhite = 5
}

/**
 * @since 14.3
 */
declare const enum HKCategoryValueContraceptive {

	Unspecified = 1,

	Implant = 2,

	Injection = 3,

	IntrauterineDevice = 4,

	IntravaginalRing = 5,

	Oral = 6,

	Patch = 7
}

/**
 * @since 14.0
 */
declare const enum HKCategoryValueEnvironmentalAudioExposureEvent {

	MomentaryLimit = 1
}

/**
 * @since 14.2
 */
declare const enum HKCategoryValueHeadphoneAudioExposureEvent {

	SevenDayLimit = 1
}

/**
 * @since 14.3
 */
declare const enum HKCategoryValueLowCardioFitnessEvent {

	LowFitness = 1
}

/**
 * @since 9.0
 * @deprecated 18.0
 */
declare const enum HKCategoryValueMenstrualFlow {

	Unspecified = 1,

	Light = 2,

	Medium = 3,

	Heavy = 4,

	None = 5
}

/**
 * @since 9.0
 */
declare const enum HKCategoryValueOvulationTestResult {

	Negative = 1,

	LuteinizingHormoneSurge = 2,

	Positive = 2,

	Indeterminate = 3,

	EstrogenSurge = 4
}

/**
 * @since 15.0
 */
declare const enum HKCategoryValuePregnancyTestResult {

	Negative = 1,

	Positive = 2,

	Indeterminate = 3
}

/**
 * @since 13.6
 */
declare const enum HKCategoryValuePresence {

	Present = 0,

	NotPresent = 1
}

/**
 * @since 15.0
 */
declare const enum HKCategoryValueProgesteroneTestResult {

	Negative = 1,

	Positive = 2,

	Indeterminate = 3
}

/**
 * @since 13.6
 */
declare const enum HKCategoryValueSeverity {

	Unspecified = 0,

	NotPresent = 1,

	Mild = 2,

	Moderate = 3,

	Severe = 4
}

/**
 * @since 8.0
 */
declare const enum HKCategoryValueSleepAnalysis {

	InBed = 0,

	AsleepUnspecified = 1,

	Asleep = 1,

	Awake = 2,

	AsleepCore = 3,

	AsleepDeep = 4,

	AsleepREM = 5
}

/**
 * @since 16.0
 */
declare function HKCategoryValueSleepAnalysisAsleepValues(): NSSet<number>;

/**
 * @since 18.0
 */
declare const enum HKCategoryValueVaginalBleeding {

	Unspecified = 1,

	Light = 2,

	Medium = 3,

	Heavy = 4,

	None = 5
}

/**
 * @since 8.0
 */
declare class HKCharacteristicType extends HKObjectType {

	static alloc(): HKCharacteristicType; // inherited from NSObject

	static new(): HKCharacteristicType; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare var HKCharacteristicTypeIdentifierActivityMoveMode: string;

/**
 * @since 8.0
 */
declare var HKCharacteristicTypeIdentifierBiologicalSex: string;

/**
 * @since 8.0
 */
declare var HKCharacteristicTypeIdentifierBloodType: string;

/**
 * @since 8.0
 */
declare var HKCharacteristicTypeIdentifierDateOfBirth: string;

/**
 * @since 9.0
 */
declare var HKCharacteristicTypeIdentifierFitzpatrickSkinType: string;

/**
 * @since 10.0
 */
declare var HKCharacteristicTypeIdentifierWheelchairUse: string;

/**
 * @since 12.0
 */
declare class HKClinicalRecord extends HKSample implements NSCopying, NSSecureCoding {

	static alloc(): HKClinicalRecord; // inherited from NSObject

	static new(): HKClinicalRecord; // inherited from NSObject

	readonly FHIRResource: HKFHIRResource;

	readonly clinicalType: HKClinicalType;

	readonly displayName: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare class HKClinicalType extends HKSampleType {

	static alloc(): HKClinicalType; // inherited from NSObject

	static new(): HKClinicalType; // inherited from NSObject
}

/**
 * @since 12.0
 */
declare var HKClinicalTypeIdentifierAllergyRecord: string;

/**
 * @since 16.4
 */
declare var HKClinicalTypeIdentifierClinicalNoteRecord: string;

/**
 * @since 12.0
 */
declare var HKClinicalTypeIdentifierConditionRecord: string;

/**
 * @since 14.0
 */
declare var HKClinicalTypeIdentifierCoverageRecord: string;

/**
 * @since 12.0
 */
declare var HKClinicalTypeIdentifierImmunizationRecord: string;

/**
 * @since 12.0
 */
declare var HKClinicalTypeIdentifierLabResultRecord: string;

/**
 * @since 12.0
 */
declare var HKClinicalTypeIdentifierMedicationRecord: string;

/**
 * @since 12.0
 */
declare var HKClinicalTypeIdentifierProcedureRecord: string;

/**
 * @since 12.0
 */
declare var HKClinicalTypeIdentifierVitalSignRecord: string;

/**
 * @since 16.0
 */
declare class HKContactsLensSpecification extends HKLensSpecification implements NSCopying, NSSecureCoding {

	static alloc(): HKContactsLensSpecification; // inherited from NSObject

	static new(): HKContactsLensSpecification; // inherited from NSObject

	readonly baseCurve: HKQuantity;

	readonly diameter: HKQuantity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { sphere: HKQuantity; cylinder: HKQuantity; axis: HKQuantity; addPower: HKQuantity; baseCurve: HKQuantity; diameter: HKQuantity; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSphereCylinderAxisAddPowerBaseCurveDiameter(sphere: HKQuantity, cylinder: HKQuantity, axis: HKQuantity, addPower: HKQuantity, baseCurve: HKQuantity, diameter: HKQuantity): this;
}

/**
 * @since 16.0
 */
declare class HKContactsPrescription extends HKVisionPrescription implements NSCopying, NSSecureCoding {

	static alloc(): HKContactsPrescription; // inherited from NSObject

	static new(): HKContactsPrescription; // inherited from NSObject

	static prescriptionWithRightEyeSpecificationLeftEyeSpecificationBrandDateIssuedExpirationDateDeviceMetadata(rightEyeSpecification: HKContactsLensSpecification, leftEyeSpecification: HKContactsLensSpecification, brand: string, dateIssued: Date, expirationDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKContactsPrescription;

	static prescriptionWithTypeDateIssuedExpirationDateDeviceMetadata(type: HKVisionPrescriptionType, dateIssued: Date, expirationDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKContactsPrescription; // inherited from HKVisionPrescription

	readonly brand: string;

	readonly leftEye: HKContactsLensSpecification;

	readonly rightEye: HKContactsLensSpecification;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class HKCorrelation extends HKSample {

	static alloc(): HKCorrelation; // inherited from NSObject

	static correlationWithTypeStartDateEndDateObjects(correlationType: HKCorrelationType, startDate: Date, endDate: Date, objects: NSSet<HKSample>): HKCorrelation;

	/**
	 * @since 9.0
	 */
	static correlationWithTypeStartDateEndDateObjectsDeviceMetadata(correlationType: HKCorrelationType, startDate: Date, endDate: Date, objects: NSSet<HKSample>, device: HKDevice, metadata: NSDictionary<string, any>): HKCorrelation;

	static correlationWithTypeStartDateEndDateObjectsMetadata(correlationType: HKCorrelationType, startDate: Date, endDate: Date, objects: NSSet<HKSample>, metadata: NSDictionary<string, any>): HKCorrelation;

	static new(): HKCorrelation; // inherited from NSObject

	readonly correlationType: HKCorrelationType;

	readonly objects: NSSet<HKSample>;

	objectsForType(objectType: HKObjectType): NSSet<HKSample>;
}

/**
 * @since 8.0
 */
declare class HKCorrelationQuery extends HKQuery {

	static alloc(): HKCorrelationQuery; // inherited from NSObject

	static new(): HKCorrelationQuery; // inherited from NSObject

	readonly correlationType: HKCorrelationType;

	readonly samplePredicates: NSDictionary<HKSampleType, NSPredicate>;

	constructor(o: { type: HKCorrelationType; predicate: NSPredicate; samplePredicates: NSDictionary<HKSampleType, NSPredicate>; completion: (p1: HKCorrelationQuery, p2: NSArray<HKCorrelation>, p3: NSError) => void; });

	initWithTypePredicateSamplePredicatesCompletion(correlationType: HKCorrelationType, predicate: NSPredicate, samplePredicates: NSDictionary<HKSampleType, NSPredicate>, completion: (p1: HKCorrelationQuery, p2: NSArray<HKCorrelation>, p3: NSError) => void): this;
}

/**
 * @since 8.0
 */
declare class HKCorrelationType extends HKSampleType {

	static alloc(): HKCorrelationType; // inherited from NSObject

	static new(): HKCorrelationType; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare var HKCorrelationTypeIdentifierBloodPressure: string;

/**
 * @since 8.0
 */
declare var HKCorrelationTypeIdentifierFood: string;

/**
 * @since 13.0
 */
declare class HKCumulativeQuantitySample extends HKQuantitySample {

	static alloc(): HKCumulativeQuantitySample; // inherited from NSObject

	static new(): HKCumulativeQuantitySample; // inherited from NSObject

	static quantitySampleWithTypeQuantityStartDateEndDate(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date): HKCumulativeQuantitySample; // inherited from HKQuantitySample

	/**
	 * @since 9.0
	 */
	static quantitySampleWithTypeQuantityStartDateEndDateDeviceMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKCumulativeQuantitySample; // inherited from HKQuantitySample

	static quantitySampleWithTypeQuantityStartDateEndDateMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKCumulativeQuantitySample; // inherited from HKQuantitySample

	readonly sumQuantity: HKQuantity;
}

/**
 * @since 12.0
 * @deprecated 13.0
 */
declare class HKCumulativeQuantitySeriesSample extends HKCumulativeQuantitySample {

	static alloc(): HKCumulativeQuantitySeriesSample; // inherited from NSObject

	static new(): HKCumulativeQuantitySeriesSample; // inherited from NSObject

	static quantitySampleWithTypeQuantityStartDateEndDate(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date): HKCumulativeQuantitySeriesSample; // inherited from HKQuantitySample

	/**
	 * @since 9.0
	 */
	static quantitySampleWithTypeQuantityStartDateEndDateDeviceMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKCumulativeQuantitySeriesSample; // inherited from HKQuantitySample

	static quantitySampleWithTypeQuantityStartDateEndDateMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKCumulativeQuantitySeriesSample; // inherited from HKQuantitySample

	readonly sum: HKQuantity;
}

/**
 * @since 17.0
 */
declare const enum HKCyclingFunctionalThresholdPowerTestType {

	MaxExercise60Minute = 1,

	MaxExercise20Minute = 2,

	RampTest = 3,

	PredictionExercise = 4
}

/**
 * @since 13.0
 */
declare var HKDataTypeIdentifierHeartbeatSeries: string;

/**
 * @since 18.0
 */
declare var HKDataTypeIdentifierStateOfMind: string;

/**
 * @since 9.0
 */
declare class HKDeletedObject extends NSObject implements NSSecureCoding {

	static alloc(): HKDeletedObject; // inherited from NSObject

	static new(): HKDeletedObject; // inherited from NSObject

	readonly UUID: NSUUID;

	/**
	 * @since 11.0
	 */
	readonly metadata: NSDictionary<string, any>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare var HKDetailedCDAValidationErrorKey: string;

/**
 * @since 9.0
 */
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

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithNameManufacturerModelHardwareVersionFirmwareVersionSoftwareVersionLocalIdentifierUDIDeviceIdentifier(name: string, manufacturer: string, model: string, hardwareVersion: string, firmwareVersion: string, softwareVersion: string, localIdentifier: string, UDIDeviceIdentifier: string): this;
}

/**
 * @since 14.0
 */
declare const enum HKDevicePlacementSide {

	Unknown = 0,

	Left = 1,

	Right = 2,

	Central = 3
}

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeyFirmwareVersion: string;

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeyHardwareVersion: string;

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeyLocalIdentifier: string;

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeyManufacturer: string;

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeyModel: string;

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeyName: string;

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeySoftwareVersion: string;

/**
 * @since 9.0
 */
declare var HKDevicePropertyKeyUDIDeviceIdentifier: string;

/**
 * @since 13.0
 */
declare class HKDiscreteQuantitySample extends HKQuantitySample {

	static alloc(): HKDiscreteQuantitySample; // inherited from NSObject

	static new(): HKDiscreteQuantitySample; // inherited from NSObject

	static quantitySampleWithTypeQuantityStartDateEndDate(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date): HKDiscreteQuantitySample; // inherited from HKQuantitySample

	/**
	 * @since 9.0
	 */
	static quantitySampleWithTypeQuantityStartDateEndDateDeviceMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKDiscreteQuantitySample; // inherited from HKQuantitySample

	static quantitySampleWithTypeQuantityStartDateEndDateMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKDiscreteQuantitySample; // inherited from HKQuantitySample

	readonly averageQuantity: HKQuantity;

	readonly maximumQuantity: HKQuantity;

	readonly minimumQuantity: HKQuantity;

	readonly mostRecentQuantity: HKQuantity;

	readonly mostRecentQuantityDateInterval: NSDateInterval;
}

/**
 * @since 10.0
 */
declare class HKDocumentQuery extends HKQuery {

	static alloc(): HKDocumentQuery; // inherited from NSObject

	static new(): HKDocumentQuery; // inherited from NSObject

	readonly includeDocumentData: boolean;

	readonly limit: number;

	readonly sortDescriptors: NSArray<NSSortDescriptor>;

	constructor(o: { documentType: HKDocumentType; predicate: NSPredicate; limit: number; sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]; includeDocumentData: boolean; resultsHandler: (p1: HKDocumentQuery, p2: NSArray<HKDocumentSample>, p3: boolean, p4: NSError) => void; });

	initWithDocumentTypePredicateLimitSortDescriptorsIncludeDocumentDataResultsHandler(documentType: HKDocumentType, predicate: NSPredicate, limit: number, sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[], includeDocumentData: boolean, resultsHandler: (p1: HKDocumentQuery, p2: NSArray<HKDocumentSample>, p3: boolean, p4: NSError) => void): this;
}

/**
 * @since 10.0
 */
declare class HKDocumentSample extends HKSample {

	static alloc(): HKDocumentSample; // inherited from NSObject

	static new(): HKDocumentSample; // inherited from NSObject

	readonly documentType: HKDocumentType;
}

/**
 * @since 10.0
 */
declare class HKDocumentType extends HKSampleType {

	static alloc(): HKDocumentType; // inherited from NSObject

	static new(): HKDocumentType; // inherited from NSObject
}

/**
 * @since 10.0
 */
declare var HKDocumentTypeIdentifierCDA: string;

/**
 * @since 14.0
 */
declare class HKElectrocardiogram extends HKSample {

	static alloc(): HKElectrocardiogram; // inherited from NSObject

	static new(): HKElectrocardiogram; // inherited from NSObject

	readonly averageHeartRate: HKQuantity;

	readonly classification: HKElectrocardiogramClassification;

	readonly numberOfVoltageMeasurements: number;

	readonly samplingFrequency: HKQuantity;

	readonly symptomsStatus: HKElectrocardiogramSymptomsStatus;
}

/**
 * @since 14.0
 */
declare const enum HKElectrocardiogramClassification {

	NotSet = 0,

	SinusRhythm = 1,

	AtrialFibrillation = 2,

	InconclusiveLowHeartRate = 3,

	InconclusiveHighHeartRate = 4,

	InconclusivePoorReading = 5,

	InconclusiveOther = 6,

	Unrecognized = 100
}

/**
 * @since 14.0
 */
declare const enum HKElectrocardiogramLead {

	AppleWatchSimilarToLeadI = 1
}

/**
 * @since 14.0
 */
declare class HKElectrocardiogramQuery extends HKQuery {

	static alloc(): HKElectrocardiogramQuery; // inherited from NSObject

	static new(): HKElectrocardiogramQuery; // inherited from NSObject

	constructor(o: { electrocardiogram: HKElectrocardiogram; dataHandler: (p1: HKElectrocardiogramQuery, p2: HKElectrocardiogramVoltageMeasurement, p3: boolean, p4: NSError) => void; });

	initWithElectrocardiogramDataHandler(electrocardiogram: HKElectrocardiogram, dataHandler: (p1: HKElectrocardiogramQuery, p2: HKElectrocardiogramVoltageMeasurement, p3: boolean, p4: NSError) => void): this;
}

/**
 * @since 14.0
 */
declare const enum HKElectrocardiogramSymptomsStatus {

	NotSet = 0,

	None = 1,

	Present = 2
}

/**
 * @since 14.0
 */
declare class HKElectrocardiogramType extends HKSampleType {

	static alloc(): HKElectrocardiogramType; // inherited from NSObject

	static new(): HKElectrocardiogramType; // inherited from NSObject
}

/**
 * @since 14.0
 */
declare class HKElectrocardiogramVoltageMeasurement extends NSObject implements NSCopying {

	static alloc(): HKElectrocardiogramVoltageMeasurement; // inherited from NSObject

	static new(): HKElectrocardiogramVoltageMeasurement; // inherited from NSObject

	readonly timeSinceSampleStart: number;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	quantityForLead(lead: HKElectrocardiogramLead): HKQuantity;
}

/**
 * @since 8.0
 */
declare const enum HKErrorCode {

	UnknownError = 0,

	NoError = 0,

	ErrorHealthDataUnavailable = 1,

	ErrorHealthDataRestricted = 2,

	ErrorInvalidArgument = 3,

	ErrorAuthorizationDenied = 4,

	ErrorAuthorizationNotDetermined = 5,

	ErrorDatabaseInaccessible = 6,

	ErrorUserCanceled = 7,

	ErrorAnotherWorkoutSessionStarted = 8,

	ErrorUserExitedWorkoutSession = 9,

	ErrorRequiredAuthorizationDenied = 10,

	ErrorNoData = 11,

	ErrorWorkoutActivityNotAllowed = 12,

	ErrorDataSizeExceeded = 13,

	ErrorBackgroundWorkoutSessionNotAllowed = 14,

	ErrorNotPermissibleForGuestUserMode = 15
}

/**
 * @since 8.0
 */
declare var HKErrorDomain: string;

/**
 * @since 14.0
 */
declare var HKFHIRReleaseDSTU2: string;

/**
 * @since 14.0
 */
declare var HKFHIRReleaseR4: string;

/**
 * @since 14.0
 */
declare var HKFHIRReleaseUnknown: string;

/**
 * @since 12.0
 */
declare class HKFHIRResource extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKFHIRResource; // inherited from NSObject

	static new(): HKFHIRResource; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly FHIRVersion: HKFHIRVersion;

	readonly data: NSData;

	readonly identifier: string;

	readonly resourceType: string;

	readonly sourceURL: NSURL;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeAllergyIntolerance: string;

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeCondition: string;

/**
 * @since 14.0
 */
declare var HKFHIRResourceTypeCoverage: string;

/**
 * @since 16.4
 */
declare var HKFHIRResourceTypeDiagnosticReport: string;

/**
 * @since 16.4
 */
declare var HKFHIRResourceTypeDocumentReference: string;

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeImmunization: string;

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeMedicationDispense: string;

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeMedicationOrder: string;

/**
 * @since 14.0
 */
declare var HKFHIRResourceTypeMedicationRequest: string;

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeMedicationStatement: string;

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeObservation: string;

/**
 * @since 12.0
 */
declare var HKFHIRResourceTypeProcedure: string;

/**
 * @since 14.0
 */
declare class HKFHIRVersion extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKFHIRVersion; // inherited from NSObject

	static new(): HKFHIRVersion; // inherited from NSObject

	static primaryDSTU2Version(): HKFHIRVersion;

	static primaryR4Version(): HKFHIRVersion;

	static versionFromVersionStringError(versionString: string): HKFHIRVersion;

	readonly FHIRRelease: string;

	readonly majorVersion: number;

	readonly minorVersion: number;

	readonly patchVersion: number;

	readonly stringRepresentation: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 9.0
 */
declare const enum HKFitzpatrickSkinType {

	NotSet = 0,

	I = 1,

	II = 2,

	III = 3,

	IV = 4,

	V = 5,

	VI = 6
}

/**
 * @since 9.0
 */
declare class HKFitzpatrickSkinTypeObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKFitzpatrickSkinTypeObject; // inherited from NSObject

	static new(): HKFitzpatrickSkinTypeObject; // inherited from NSObject

	readonly skinType: HKFitzpatrickSkinType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class HKGAD7Assessment extends HKScoredAssessment {

	static alloc(): HKGAD7Assessment; // inherited from NSObject

	static assessmentWithDateAnswers(date: Date, answers: NSArray<number> | number[]): HKGAD7Assessment;

	static assessmentWithDateAnswersMetadata(date: Date, answers: NSArray<number> | number[], metadata: NSDictionary<string, any>): HKGAD7Assessment;

	static new(): HKGAD7Assessment; // inherited from NSObject

	readonly answers: NSArray<number>;

	readonly risk: HKGAD7AssessmentRisk;
}

/**
 * @since 18.0
 */
declare const enum HKGAD7AssessmentAnswer {

	NotAtAll = 0,

	SeveralDays = 1,

	MoreThanHalfTheDays = 2,

	NearlyEveryDay = 3
}

/**
 * @since 18.0
 */
declare const enum HKGAD7AssessmentRisk {

	NoneToMinimal = 1,

	Mild = 2,

	Moderate = 3,

	Severe = 4
}

/**
 * @since 16.0
 */
declare class HKGlassesLensSpecification extends HKLensSpecification implements NSCopying, NSSecureCoding {

	static alloc(): HKGlassesLensSpecification; // inherited from NSObject

	static new(): HKGlassesLensSpecification; // inherited from NSObject

	readonly farPupillaryDistance: HKQuantity;

	readonly nearPupillaryDistance: HKQuantity;

	readonly prism: HKVisionPrism;

	readonly vertexDistance: HKQuantity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { sphere: HKQuantity; cylinder: HKQuantity; axis: HKQuantity; addPower: HKQuantity; vertexDistance: HKQuantity; prism: HKVisionPrism; farPupillaryDistance: HKQuantity; nearPupillaryDistance: HKQuantity; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSphereCylinderAxisAddPowerVertexDistancePrismFarPupillaryDistanceNearPupillaryDistance(sphere: HKQuantity, cylinder: HKQuantity, axis: HKQuantity, addPower: HKQuantity, vertexDistance: HKQuantity, prism: HKVisionPrism, farPupillaryDistance: HKQuantity, nearPupillaryDistance: HKQuantity): this;
}

/**
 * @since 16.0
 */
declare class HKGlassesPrescription extends HKVisionPrescription implements NSCopying, NSSecureCoding {

	static alloc(): HKGlassesPrescription; // inherited from NSObject

	static new(): HKGlassesPrescription; // inherited from NSObject

	static prescriptionWithRightEyeSpecificationLeftEyeSpecificationDateIssuedExpirationDateDeviceMetadata(rightEyeSpecification: HKGlassesLensSpecification, leftEyeSpecification: HKGlassesLensSpecification, dateIssued: Date, expirationDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKGlassesPrescription;

	static prescriptionWithTypeDateIssuedExpirationDateDeviceMetadata(type: HKVisionPrescriptionType, dateIssued: Date, expirationDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKGlassesPrescription; // inherited from HKVisionPrescription

	readonly leftEye: HKGlassesLensSpecification;

	readonly rightEye: HKGlassesLensSpecification;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class HKHealthStore extends NSObject {

	static alloc(): HKHealthStore; // inherited from NSObject

	static isHealthDataAvailable(): boolean;

	static new(): HKHealthStore; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	authorizationViewControllerPresenter: UIViewController;

	/**
	 * @since 17.0
	 */
	workoutSessionMirroringStartHandler: (p1: HKWorkoutSession) => void;

	/**
	 * @since 14.0
	 */
	activityMoveModeWithError(): HKActivityMoveModeObject;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	addSamplesToWorkoutCompletion(samples: NSArray<HKSample> | HKSample[], workout: HKWorkout, completion: (p1: boolean, p2: NSError) => void): void;

	authorizationStatusForType(type: HKObjectType): HKAuthorizationStatus;

	biologicalSexWithError(): HKBiologicalSexObject;

	bloodTypeWithError(): HKBloodTypeObject;

	/**
	 * @since 10.0
	 */
	dateOfBirthComponentsWithError(): NSDateComponents;

	/**
	 * @since 8.0
	 * @deprecated 10.0
	 */
	dateOfBirthWithError(): Date;

	deleteObjectWithCompletion(object: HKObject, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	deleteObjectsOfTypePredicateWithCompletion(objectType: HKObjectType, predicate: NSPredicate, completion: (p1: boolean, p2: number, p3: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	deleteObjectsWithCompletion(objects: NSArray<HKObject> | HKObject[], completion: (p1: boolean, p2: NSError) => void): void;

	disableAllBackgroundDeliveryWithCompletion(completion: (p1: boolean, p2: NSError) => void): void;

	disableBackgroundDeliveryForTypeWithCompletion(type: HKObjectType, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	earliestPermittedSampleDate(): Date;

	enableBackgroundDeliveryForTypeFrequencyWithCompletion(type: HKObjectType, frequency: HKUpdateFrequency, completion: (p1: boolean, p2: NSError) => void): void;

	executeQuery(query: HKQuery): void;

	/**
	 * @since 9.0
	 */
	fitzpatrickSkinTypeWithError(): HKFitzpatrickSkinTypeObject;

	/**
	 * @since 12.0
	 */
	getRequestStatusForAuthorizationToShareTypesReadTypesCompletion(typesToShare: NSSet<HKSampleType>, typesToRead: NSSet<HKObjectType>, completion: (p1: HKAuthorizationRequestStatus, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 */
	handleAuthorizationForExtensionWithCompletion(completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 8.2
	 */
	preferredUnitsForQuantityTypesCompletion(quantityTypes: NSSet<HKQuantityType>, completion: (p1: NSDictionary<HKQuantityType, HKUnit>, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	recalibrateEstimatesForSampleTypeAtDateCompletion(sampleType: HKSampleType, date: Date, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 18.0
	 */
	relateWorkoutEffortSampleWithWorkoutActivityCompletion(sample: HKSample, workout: HKWorkout, activity: HKWorkoutActivity, completion: (p1: boolean, p2: NSError) => void): void;

	requestAuthorizationToShareTypesReadTypesCompletion(typesToShare: NSSet<HKSampleType>, typesToRead: NSSet<HKObjectType>, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	requestPerObjectReadAuthorizationForTypePredicateCompletion(objectType: HKObjectType, predicate: NSPredicate, completion: (p1: boolean, p2: NSError) => void): void;

	saveObjectWithCompletion(object: HKObject, completion: (p1: boolean, p2: NSError) => void): void;

	saveObjectsWithCompletion(objects: NSArray<HKObject> | HKObject[], completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	splitTotalEnergyStartDateEndDateResultsHandler(totalEnergy: HKQuantity, startDate: Date, endDate: Date, resultsHandler: (p1: HKQuantity, p2: HKQuantity, p3: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	startWatchAppWithWorkoutConfigurationCompletion(workoutConfiguration: HKWorkoutConfiguration, completion: (p1: boolean, p2: NSError) => void): void;

	stopQuery(query: HKQuery): void;

	/**
	 * @since 12.0
	 */
	supportsHealthRecords(): boolean;

	/**
	 * @since 18.0
	 */
	unrelateWorkoutEffortSampleFromWorkoutActivityCompletion(sample: HKSample, workout: HKWorkout, activity: HKWorkoutActivity, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	wheelchairUseWithError(): HKWheelchairUseObject;
}

/**
 * @since 11.0
 */
declare const enum HKHeartRateMotionContext {

	NotSet = 0,

	Sedentary = 1,

	Active = 2
}

/**
 * @since 16.0
 */
declare const enum HKHeartRateRecoveryTestType {

	MaxExercise = 1,

	PredictionSubMaxExercise = 2,

	PredictionNonExercise = 3
}

/**
 * @since 8.0
 */
declare const enum HKHeartRateSensorLocation {

	Other = 0,

	Chest = 1,

	Wrist = 2,

	Finger = 3,

	Hand = 4,

	EarLobe = 5,

	Foot = 6
}

/**
 * @since 13.0
 */
declare class HKHeartbeatSeriesBuilder extends HKSeriesBuilder {

	static alloc(): HKHeartbeatSeriesBuilder; // inherited from NSObject

	static new(): HKHeartbeatSeriesBuilder; // inherited from NSObject

	static readonly maximumCount: number;

	constructor(o: { healthStore: HKHealthStore; device: HKDevice; startDate: Date; });

	addHeartbeatWithTimeIntervalSinceSeriesStartDatePrecededByGapCompletion(timeIntervalSinceStart: number, precededByGap: boolean, completion: (p1: boolean, p2: NSError) => void): void;

	addMetadataCompletion(metadata: NSDictionary<string, any>, completion: (p1: boolean, p2: NSError) => void): void;

	finishSeriesWithCompletion(completion: (p1: HKHeartbeatSeriesSample, p2: NSError) => void): void;

	initWithHealthStoreDeviceStartDate(healthStore: HKHealthStore, device: HKDevice, startDate: Date): this;
}

/**
 * @since 13.0
 */
declare class HKHeartbeatSeriesQuery extends HKQuery {

	static alloc(): HKHeartbeatSeriesQuery; // inherited from NSObject

	static new(): HKHeartbeatSeriesQuery; // inherited from NSObject

	constructor(o: { heartbeatSeries: HKHeartbeatSeriesSample; dataHandler: (p1: HKHeartbeatSeriesQuery, p2: number, p3: boolean, p4: boolean, p5: NSError) => void; });

	initWithHeartbeatSeriesDataHandler(heartbeatSeries: HKHeartbeatSeriesSample, dataHandler: (p1: HKHeartbeatSeriesQuery, p2: number, p3: boolean, p4: boolean, p5: NSError) => void): this;
}

/**
 * @since 13.0
 */
declare class HKHeartbeatSeriesSample extends HKSeriesSample {

	static alloc(): HKHeartbeatSeriesSample; // inherited from NSObject

	static new(): HKHeartbeatSeriesSample; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare const enum HKInsulinDeliveryReason {

	Basal = 1,

	Bolus = 2
}

/**
 * @since 16.0
 */
declare class HKLensSpecification extends NSObject {

	static alloc(): HKLensSpecification; // inherited from NSObject

	static new(): HKLensSpecification; // inherited from NSObject

	readonly addPower: HKQuantity;

	readonly axis: HKQuantity;

	readonly cylinder: HKQuantity;

	readonly sphere: HKQuantity;
}

/**
 * @since 17.0
 */
declare var HKMetadataKeyActivityType: string;

/**
 * @since 15.0
 */
declare var HKMetadataKeyAlgorithmVersion: string;

/**
 * @since 11.2
 */
declare var HKMetadataKeyAlpineSlopeGrade: string;

/**
 * @since 14.0
 */
declare var HKMetadataKeyAppleDeviceCalibrated: string;

/**
 * @since 14.0
 */
declare var HKMetadataKeyAppleECGAlgorithmVersion: string;

/**
 * @since 18.2
 */
declare var HKMetadataKeyAppleFitnessPlusCatalogIdentifier: string;

/**
 * @since 17.0
 */
declare var HKMetadataKeyAppleFitnessPlusSession: string;

/**
 * @since 14.2
 */
declare var HKMetadataKeyAudioExposureDuration: string;

/**
 * @since 13.0
 */
declare var HKMetadataKeyAudioExposureLevel: string;

/**
 * @since 13.0
 */
declare var HKMetadataKeyAverageMETs: string;

/**
 * @since 11.2
 */
declare var HKMetadataKeyAverageSpeed: string;

/**
 * @since 14.0
 */
declare var HKMetadataKeyBarometricPressure: string;

/**
 * @since 11.0
 */
declare var HKMetadataKeyBloodGlucoseMealTime: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyBodyTemperatureSensorLocation: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyCoachedWorkout: string;

/**
 * @since 12.0
 */
declare var HKMetadataKeyCrossTrainerDistance: string;

/**
 * @since 17.0
 */
declare var HKMetadataKeyCyclingFunctionalThresholdPowerTestType: string;

/**
 * @since 15.0
 */
declare var HKMetadataKeyDateOfEarliestDataUsedForEstimate: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyDeviceManufacturerName: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyDeviceName: string;

/**
 * @since 14.0
 */
declare var HKMetadataKeyDevicePlacementSide: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyDeviceSerialNumber: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyDigitalSignature: string;

/**
 * @since 11.2
 */
declare var HKMetadataKeyElevationAscended: string;

/**
 * @since 11.2
 */
declare var HKMetadataKeyElevationDescended: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyExternalUUID: string;

/**
 * @since 12.0
 */
declare var HKMetadataKeyFitnessMachineDuration: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyFoodType: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyGlassesPrescriptionDescription: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyGroupFitness: string;

/**
 * @since 16.4
 */
declare var HKMetadataKeyHeadphoneGain: string;

/**
 * @since 12.2
 */
declare var HKMetadataKeyHeartRateEventThreshold: string;

/**
 * @since 11.0
 */
declare var HKMetadataKeyHeartRateMotionContext: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyHeartRateRecoveryActivityDuration: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyHeartRateRecoveryActivityType: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyHeartRateRecoveryMaxObservedRecoveryHeartRate: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyHeartRateRecoveryTestType: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyHeartRateSensorLocation: string;

/**
 * @since 12.0
 */
declare var HKMetadataKeyIndoorBikeDistance: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyIndoorWorkout: string;

/**
 * @since 11.0
 */
declare var HKMetadataKeyInsulinDeliveryReason: string;

/**
 * @since 10.0
 */
declare var HKMetadataKeyLapLength: string;

/**
 * @since 14.3
 */
declare var HKMetadataKeyLowCardioFitnessEventThreshold: string;

/**
 * @since 17.0
 */
declare var HKMetadataKeyMaximumLightIntensity: string;

/**
 * @since 11.2
 */
declare var HKMetadataKeyMaximumSpeed: string;

/**
 * @since 9.0
 */
declare var HKMetadataKeyMenstrualCycleStart: string;

/**
 * @since 17.0
 */
declare var HKMetadataKeyPhysicalEffortEstimationType: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyQuantityClampedToLowerBound: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyQuantityClampedToUpperBound: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyReferenceRangeLowerLimit: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyReferenceRangeUpperLimit: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeySWOLFScore: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeySessionEstimate: string;

/**
 * @since 9.0
 */
declare var HKMetadataKeySexualActivityProtectionUsed: string;

/**
 * @since 10.0
 */
declare var HKMetadataKeySwimmingLocationType: string;

/**
 * @since 10.0
 */
declare var HKMetadataKeySwimmingStrokeStyle: string;

/**
 * @since 11.0
 */
declare var HKMetadataKeySyncIdentifier: string;

/**
 * @since 11.0
 */
declare var HKMetadataKeySyncVersion: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyTimeZone: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyUDIDeviceIdentifier: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyUDIProductionIdentifier: string;

/**
 * @since 16.0
 */
declare var HKMetadataKeyUserMotionContext: string;

/**
 * @since 11.0
 */
declare var HKMetadataKeyVO2MaxTestType: string;

/**
 * @since 14.3
 */
declare var HKMetadataKeyVO2MaxValue: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyWasTakenInLab: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyWasUserEntered: string;

/**
 * @since 17.0
 */
declare var HKMetadataKeyWaterSalinity: string;

/**
 * @since 10.0
 */
declare var HKMetadataKeyWeatherCondition: string;

/**
 * @since 10.0
 */
declare var HKMetadataKeyWeatherHumidity: string;

/**
 * @since 10.0
 */
declare var HKMetadataKeyWeatherTemperature: string;

/**
 * @since 8.0
 */
declare var HKMetadataKeyWorkoutBrandName: string;

/**
 * @since 8.0
 */
declare const enum HKMetricPrefix {

	None = 0,

	Femto = 13,

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

/**
 * @since 8.0
 */
declare class HKObject extends NSObject implements NSSecureCoding {

	static alloc(): HKObject; // inherited from NSObject

	static new(): HKObject; // inherited from NSObject

	readonly UUID: NSUUID;

	/**
	 * @since 9.0
	 */
	readonly device: HKDevice;

	readonly metadata: NSDictionary<string, any>;

	/**
	 * @since 8.0
	 * @deprecated 9.0
	 */
	readonly source: HKSource;

	/**
	 * @since 9.0
	 */
	readonly sourceRevision: HKSourceRevision;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var HKObjectQueryNoLimit: number;

/**
 * @since 8.0
 */
declare class HKObjectType extends NSObject implements NSCopying, NSSecureCoding {

	/**
	 * @since 9.3
	 */
	static activitySummaryType(): HKActivitySummaryType;

	static alloc(): HKObjectType; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static audiogramSampleType(): HKAudiogramSampleType;

	static categoryTypeForIdentifier(identifier: string): HKCategoryType;

	static characteristicTypeForIdentifier(identifier: string): HKCharacteristicType;

	/**
	 * @since 12.0
	 */
	static clinicalTypeForIdentifier(identifier: string): HKClinicalType;

	static correlationTypeForIdentifier(identifier: string): HKCorrelationType;

	/**
	 * @since 10.0
	 */
	static documentTypeForIdentifier(identifier: string): HKDocumentType;

	/**
	 * @since 14.0
	 */
	static electrocardiogramType(): HKElectrocardiogramType;

	static new(): HKObjectType; // inherited from NSObject

	static quantityTypeForIdentifier(identifier: string): HKQuantityType;

	/**
	 * @since 18.0
	 */
	static scoredAssessmentTypeForIdentifier(identifier: string): HKScoredAssessmentType;

	/**
	 * @since 11.0
	 */
	static seriesTypeForIdentifier(identifier: string): HKSeriesType;

	/**
	 * @since 18.0
	 */
	static stateOfMindType(): HKStateOfMindType;

	/**
	 * @since 16.0
	 */
	static visionPrescriptionType(): HKPrescriptionType;

	static workoutType(): HKWorkoutType;

	readonly identifier: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 16.0
	 */
	requiresPerObjectAuthorization(): boolean;
}

/**
 * @since 8.0
 */
declare class HKObserverQuery extends HKQuery {

	static alloc(): HKObserverQuery; // inherited from NSObject

	static new(): HKObserverQuery; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	constructor(o: { queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[]; updateHandler: (p1: HKObserverQuery, p2: NSSet<HKSampleType>, p3: () => void, p4: NSError) => void; });

	constructor(o: { sampleType: HKSampleType; predicate: NSPredicate; updateHandler: (p1: HKObserverQuery, p2: () => void, p3: NSError) => void; });

	/**
	 * @since 15.0
	 */
	initWithQueryDescriptorsUpdateHandler(queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[], updateHandler: (p1: HKObserverQuery, p2: NSSet<HKSampleType>, p3: () => void, p4: NSError) => void): this;

	initWithSampleTypePredicateUpdateHandler(sampleType: HKSampleType, predicate: NSPredicate, updateHandler: (p1: HKObserverQuery, p2: () => void, p3: NSError) => void): this;
}

/**
 * @since 18.0
 */
declare class HKPHQ9Assessment extends HKScoredAssessment {

	static alloc(): HKPHQ9Assessment; // inherited from NSObject

	static assessmentWithDateAnswers(date: Date, answers: NSArray<number> | number[]): HKPHQ9Assessment;

	static assessmentWithDateAnswersMetadata(date: Date, answers: NSArray<number> | number[], metadata: NSDictionary<string, any>): HKPHQ9Assessment;

	static new(): HKPHQ9Assessment; // inherited from NSObject

	readonly answers: NSArray<number>;

	readonly risk: HKPHQ9AssessmentRisk;
}

/**
 * @since 18.0
 */
declare const enum HKPHQ9AssessmentAnswer {

	NotAtAll = 0,

	SeveralDays = 1,

	MoreThanHalfTheDays = 2,

	NearlyEveryDay = 3,

	PreferNotToAnswer = 4
}

/**
 * @since 18.0
 */
declare const enum HKPHQ9AssessmentRisk {

	NoneToMinimal = 1,

	Mild = 2,

	Moderate = 3,

	ModeratelySevere = 4,

	Severe = 5
}

/**
 * @since 17.0
 */
declare const enum HKPhysicalEffortEstimationType {

	ActivityLookup = 1,

	DeviceSensed = 2
}

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathAverage: string;

/**
 * @since 14.0
 */
declare var HKPredicateKeyPathAverageHeartRate: string;

/**
 * @since 10.0
 */
declare var HKPredicateKeyPathCDAAuthorName: string;

/**
 * @since 10.0
 */
declare var HKPredicateKeyPathCDACustodianName: string;

/**
 * @since 10.0
 */
declare var HKPredicateKeyPathCDAPatientName: string;

/**
 * @since 10.0
 */
declare var HKPredicateKeyPathCDATitle: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathCategoryValue: string;

/**
 * @since 12.0
 */
declare var HKPredicateKeyPathClinicalRecordFHIRResourceIdentifier: string;

/**
 * @since 12.0
 */
declare var HKPredicateKeyPathClinicalRecordFHIRResourceType: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathCorrelation: string;

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathCount: string;

/**
 * @since 9.3
 */
declare var HKPredicateKeyPathDateComponents: string;

/**
 * @since 9.0
 */
declare var HKPredicateKeyPathDevice: string;

/**
 * @since 14.0
 */
declare var HKPredicateKeyPathECGClassification: string;

/**
 * @since 14.0
 */
declare var HKPredicateKeyPathECGSymptomsStatus: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathEndDate: string;

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathMax: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathMetadata: string;

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathMin: string;

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathMostRecent: string;

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathMostRecentDuration: string;

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathMostRecentEndDate: string;

/**
 * @since 13.0
 */
declare var HKPredicateKeyPathMostRecentStartDate: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathQuantity: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathSource: string;

/**
 * @since 9.0
 */
declare var HKPredicateKeyPathSourceRevision: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathStartDate: string;

/**
 * @since 12.0
 */
declare var HKPredicateKeyPathSum: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathUUID: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathWorkout: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivity: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivityAverageQuantity: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivityDuration: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivityEndDate: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivityMaximumQuantity: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivityMinimumQuantity: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivityStartDate: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivitySumQuantity: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutActivityType: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutAverageQuantity: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathWorkoutDuration: string;

/**
 * @since 18.0
 */
declare var HKPredicateKeyPathWorkoutEffortRelationship: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutMaximumQuantity: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutMinimumQuantity: string;

/**
 * @since 16.0
 */
declare var HKPredicateKeyPathWorkoutSumQuantity: string;

/**
 * @since 8.0
 * @deprecated 100000
 */
declare var HKPredicateKeyPathWorkoutTotalDistance: string;

/**
 * @since 8.0
 * @deprecated 18.0
 */
declare var HKPredicateKeyPathWorkoutTotalEnergyBurned: string;

/**
 * @since 11.0
 * @deprecated 18.0
 */
declare var HKPredicateKeyPathWorkoutTotalFlightsClimbed: string;

/**
 * @since 10.0
 * @deprecated 18.0
 */
declare var HKPredicateKeyPathWorkoutTotalSwimmingStrokeCount: string;

/**
 * @since 8.0
 */
declare var HKPredicateKeyPathWorkoutType: string;

/**
 * @since 16.0
 */
declare class HKPrescriptionType extends HKSampleType {

	static alloc(): HKPrescriptionType; // inherited from NSObject

	static new(): HKPrescriptionType; // inherited from NSObject
}

/**
 * @since 16.0
 */
declare const enum HKPrismBase {

	None = 0,

	Up = 1,

	Down = 2,

	In = 3,

	Out = 4
}

/**
 * @since 8.0
 */
declare class HKQuantity extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKQuantity; // inherited from NSObject

	static new(): HKQuantity; // inherited from NSObject

	static quantityWithUnitDoubleValue(unit: HKUnit, value: number): HKQuantity;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	compare(quantity: HKQuantity): NSComparisonResult;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	doubleValueForUnit(unit: HKUnit): number;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isCompatibleWithUnit(unit: HKUnit): boolean;
}

/**
 * @since 8.0
 */
declare const enum HKQuantityAggregationStyle {

	Cumulative = 0,

	DiscreteArithmetic = 1,

	Discrete = 1,

	DiscreteTemporallyWeighted = 2,

	DiscreteEquivalentContinuousLevel = 3
}

/**
 * @since 8.0
 */
declare class HKQuantitySample extends HKSample {

	static alloc(): HKQuantitySample; // inherited from NSObject

	static new(): HKQuantitySample; // inherited from NSObject

	static quantitySampleWithTypeQuantityStartDateEndDate(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date): HKQuantitySample;

	/**
	 * @since 9.0
	 */
	static quantitySampleWithTypeQuantityStartDateEndDateDeviceMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKQuantitySample;

	static quantitySampleWithTypeQuantityStartDateEndDateMetadata(quantityType: HKQuantityType, quantity: HKQuantity, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): HKQuantitySample;

	/**
	 * @since 12.0
	 */
	readonly count: number;

	readonly quantity: HKQuantity;

	readonly quantityType: HKQuantityType;
}

/**
 * @since 12.0
 */
declare class HKQuantitySeriesSampleBuilder extends NSObject {

	static alloc(): HKQuantitySeriesSampleBuilder; // inherited from NSObject

	static new(): HKQuantitySeriesSampleBuilder; // inherited from NSObject

	readonly device: HKDevice;

	readonly quantityType: HKQuantityType;

	readonly startDate: Date;

	constructor(o: { healthStore: HKHealthStore; quantityType: HKQuantityType; startDate: Date; device: HKDevice; });

	discard(): void;

	finishSeriesWithMetadataCompletion(metadata: NSDictionary<string, any>, completion: (p1: NSArray<HKQuantitySample>, p2: NSError) => void): void;

	finishSeriesWithMetadataEndDateCompletion(metadata: NSDictionary<string, any>, endDate: Date, completion: (p1: NSArray<HKQuantitySample>, p2: NSError) => void): void;

	initWithHealthStoreQuantityTypeStartDateDevice(healthStore: HKHealthStore, quantityType: HKQuantityType, startDate: Date, device: HKDevice): this;

	insertQuantityDateError(quantity: HKQuantity, date: Date): boolean;

	/**
	 * @since 13.0
	 */
	insertQuantityDateIntervalError(quantity: HKQuantity, dateInterval: NSDateInterval): boolean;
}

/**
 * @since 12.0
 */
declare class HKQuantitySeriesSampleQuery extends HKQuery {

	static alloc(): HKQuantitySeriesSampleQuery; // inherited from NSObject

	static new(): HKQuantitySeriesSampleQuery; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	includeSample: boolean;

	/**
	 * @since 13.0
	 */
	orderByQuantitySampleStartDate: boolean;

	/**
	 * @since 13.0
	 */
	constructor(o: { quantityType: HKQuantityType; predicate: NSPredicate; quantityHandler: (p1: HKQuantitySeriesSampleQuery, p2: HKQuantity, p3: NSDateInterval, p4: HKQuantitySample, p5: boolean, p6: NSError) => void; });

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	constructor(o: { sample: HKQuantitySample; quantityHandler: (p1: HKQuantitySeriesSampleQuery, p2: HKQuantity, p3: Date, p4: boolean, p5: NSError) => void; });

	/**
	 * @since 13.0
	 */
	initWithQuantityTypePredicateQuantityHandler(quantityType: HKQuantityType, predicate: NSPredicate, quantityHandler: (p1: HKQuantitySeriesSampleQuery, p2: HKQuantity, p3: NSDateInterval, p4: HKQuantitySample, p5: boolean, p6: NSError) => void): this;

	/**
	 * @since 12.0
	 * @deprecated 13.0
	 */
	initWithSampleQuantityHandler(quantitySample: HKQuantitySample, quantityHandler: (p1: HKQuantitySeriesSampleQuery, p2: HKQuantity, p3: Date, p4: boolean, p5: NSError) => void): this;
}

/**
 * @since 8.0
 */
declare class HKQuantityType extends HKSampleType {

	static alloc(): HKQuantityType; // inherited from NSObject

	static new(): HKQuantityType; // inherited from NSObject

	readonly aggregationStyle: HKQuantityAggregationStyle;

	isCompatibleWithUnit(unit: HKUnit): boolean;
}

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierActiveEnergyBurned: string;

/**
 * @since 9.3
 */
declare var HKQuantityTypeIdentifierAppleExerciseTime: string;

/**
 * @since 14.5
 */
declare var HKQuantityTypeIdentifierAppleMoveTime: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierAppleSleepingBreathingDisturbances: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierAppleSleepingWristTemperature: string;

/**
 * @since 13.0
 */
declare var HKQuantityTypeIdentifierAppleStandTime: string;

/**
 * @since 15.0
 */
declare var HKQuantityTypeIdentifierAppleWalkingSteadiness: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierAtrialFibrillationBurden: string;

/**
 * @since 9.0
 */
declare var HKQuantityTypeIdentifierBasalBodyTemperature: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBasalEnergyBurned: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBloodAlcoholContent: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBloodGlucose: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBloodPressureDiastolic: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBloodPressureSystolic: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBodyFatPercentage: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBodyMass: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBodyMassIndex: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierBodyTemperature: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierCrossCountrySkiingSpeed: string;

/**
 * @since 17.0
 */
declare var HKQuantityTypeIdentifierCyclingCadence: string;

/**
 * @since 17.0
 */
declare var HKQuantityTypeIdentifierCyclingFunctionalThresholdPower: string;

/**
 * @since 17.0
 */
declare var HKQuantityTypeIdentifierCyclingPower: string;

/**
 * @since 17.0
 */
declare var HKQuantityTypeIdentifierCyclingSpeed: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryBiotin: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryCaffeine: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryCalcium: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryCarbohydrates: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryChloride: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryCholesterol: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryChromium: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryCopper: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryEnergyConsumed: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryFatMonounsaturated: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryFatPolyunsaturated: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryFatSaturated: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryFatTotal: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryFiber: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryFolate: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryIodine: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryIron: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryMagnesium: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryManganese: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryMolybdenum: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryNiacin: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryPantothenicAcid: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryPhosphorus: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryPotassium: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryProtein: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryRiboflavin: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietarySelenium: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietarySodium: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietarySugar: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryThiamin: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryVitaminA: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryVitaminB12: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryVitaminB6: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryVitaminC: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryVitaminD: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryVitaminE: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryVitaminK: string;

/**
 * @since 9.0
 */
declare var HKQuantityTypeIdentifierDietaryWater: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDietaryZinc: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierDistanceCrossCountrySkiing: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDistanceCycling: string;

/**
 * @since 11.2
 */
declare var HKQuantityTypeIdentifierDistanceDownhillSnowSports: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierDistancePaddleSports: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierDistanceRowing: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierDistanceSkatingSports: string;

/**
 * @since 10.0
 */
declare var HKQuantityTypeIdentifierDistanceSwimming: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierDistanceWalkingRunning: string;

/**
 * @since 10.0
 */
declare var HKQuantityTypeIdentifierDistanceWheelchair: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierElectrodermalActivity: string;

/**
 * @since 13.0
 */
declare var HKQuantityTypeIdentifierEnvironmentalAudioExposure: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierEnvironmentalSoundReduction: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierEstimatedWorkoutEffortScore: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierFlightsClimbed: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierForcedExpiratoryVolume1: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierForcedVitalCapacity: string;

/**
 * @since 13.0
 */
declare var HKQuantityTypeIdentifierHeadphoneAudioExposure: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierHeartRate: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierHeartRateRecoveryOneMinute: string;

/**
 * @since 11.0
 */
declare var HKQuantityTypeIdentifierHeartRateVariabilitySDNN: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierHeight: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierInhalerUsage: string;

/**
 * @since 11.0
 */
declare var HKQuantityTypeIdentifierInsulinDelivery: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierLeanBodyMass: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierNikeFuel: string;

/**
 * @since 15.0
 */
declare var HKQuantityTypeIdentifierNumberOfAlcoholicBeverages: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierNumberOfTimesFallen: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierOxygenSaturation: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierPaddleSportsSpeed: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierPeakExpiratoryFlowRate: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierPeripheralPerfusionIndex: string;

/**
 * @since 17.0
 */
declare var HKQuantityTypeIdentifierPhysicalEffort: string;

/**
 * @since 10.0
 */
declare var HKQuantityTypeIdentifierPushCount: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierRespiratoryRate: string;

/**
 * @since 11.0
 */
declare var HKQuantityTypeIdentifierRestingHeartRate: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierRowingSpeed: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierRunningGroundContactTime: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierRunningPower: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierRunningSpeed: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierRunningStrideLength: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierRunningVerticalOscillation: string;

/**
 * @since 14.0
 */
declare var HKQuantityTypeIdentifierSixMinuteWalkTestDistance: string;

/**
 * @since 14.0
 */
declare var HKQuantityTypeIdentifierStairAscentSpeed: string;

/**
 * @since 14.0
 */
declare var HKQuantityTypeIdentifierStairDescentSpeed: string;

/**
 * @since 8.0
 */
declare var HKQuantityTypeIdentifierStepCount: string;

/**
 * @since 10.0
 */
declare var HKQuantityTypeIdentifierSwimmingStrokeCount: string;

/**
 * @since 17.0
 */
declare var HKQuantityTypeIdentifierTimeInDaylight: string;

/**
 * @since 9.0
 */
declare var HKQuantityTypeIdentifierUVExposure: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierUnderwaterDepth: string;

/**
 * @since 11.0
 */
declare var HKQuantityTypeIdentifierVO2Max: string;

/**
 * @since 11.0
 */
declare var HKQuantityTypeIdentifierWaistCircumference: string;

/**
 * @since 14.0
 */
declare var HKQuantityTypeIdentifierWalkingAsymmetryPercentage: string;

/**
 * @since 14.0
 */
declare var HKQuantityTypeIdentifierWalkingDoubleSupportPercentage: string;

/**
 * @since 11.0
 */
declare var HKQuantityTypeIdentifierWalkingHeartRateAverage: string;

/**
 * @since 14.0
 */
declare var HKQuantityTypeIdentifierWalkingSpeed: string;

/**
 * @since 14.0
 */
declare var HKQuantityTypeIdentifierWalkingStepLength: string;

/**
 * @since 16.0
 */
declare var HKQuantityTypeIdentifierWaterTemperature: string;

/**
 * @since 18.0
 */
declare var HKQuantityTypeIdentifierWorkoutEffortScore: string;

/**
 * @since 8.0
 */
declare class HKQuery extends NSObject {

	static alloc(): HKQuery; // inherited from NSObject

	static new(): HKQuery; // inherited from NSObject

	/**
	 * @since 9.3
	 */
	static predicateForActivitySummariesBetweenStartDateComponentsEndDateComponents(startDateComponents: NSDateComponents, endDateComponents: NSDateComponents): NSPredicate;

	/**
	 * @since 9.3
	 */
	static predicateForActivitySummaryWithDateComponents(dateComponents: NSDateComponents): NSPredicate;

	static predicateForCategorySamplesEqualToValues(values: NSSet<number>): NSPredicate;

	static predicateForCategorySamplesWithOperatorTypeValue(operatorType: NSPredicateOperatorType, value: number): NSPredicate;

	/**
	 * @since 12.0
	 */
	static predicateForClinicalRecordsFromSourceFHIRResourceTypeIdentifier(source: HKSource, resourceType: string, identifier: string): NSPredicate;

	/**
	 * @since 12.0
	 */
	static predicateForClinicalRecordsWithFHIRResourceType(resourceType: string): NSPredicate;

	/**
	 * @since 14.0
	 */
	static predicateForElectrocardiogramsWithClassification(classification: HKElectrocardiogramClassification): NSPredicate;

	/**
	 * @since 14.0
	 */
	static predicateForElectrocardiogramsWithSymptomsStatus(symptomsStatus: HKElectrocardiogramSymptomsStatus): NSPredicate;

	static predicateForObjectWithUUID(UUID: NSUUID): NSPredicate;

	/**
	 * @since 14.0
	 */
	static predicateForObjectsAssociatedWithElectrocardiogram(electrocardiogram: HKElectrocardiogram): NSPredicate;

	/**
	 * @since 9.0
	 */
	static predicateForObjectsFromDevices(devices: NSSet<HKDevice>): NSPredicate;

	static predicateForObjectsFromSource(source: HKSource): NSPredicate;

	/**
	 * @since 9.0
	 */
	static predicateForObjectsFromSourceRevisions(sourceRevisions: NSSet<HKSourceRevision>): NSPredicate;

	static predicateForObjectsFromSources(sources: NSSet<HKSource>): NSPredicate;

	static predicateForObjectsFromWorkout(workout: HKWorkout): NSPredicate;

	/**
	 * @since 9.0
	 */
	static predicateForObjectsWithDevicePropertyAllowedValues(key: string, allowedValues: NSSet<string>): NSPredicate;

	static predicateForObjectsWithMetadataKey(key: string): NSPredicate;

	static predicateForObjectsWithMetadataKeyAllowedValues(key: string, allowedValues: NSArray<any> | any[]): NSPredicate;

	static predicateForObjectsWithMetadataKeyOperatorTypeValue(key: string, operatorType: NSPredicateOperatorType, value: any): NSPredicate;

	static predicateForObjectsWithNoCorrelation(): NSPredicate;

	static predicateForObjectsWithUUIDs(UUIDs: NSSet<NSUUID>): NSPredicate;

	static predicateForQuantitySamplesWithOperatorTypeQuantity(operatorType: NSPredicateOperatorType, quantity: HKQuantity): NSPredicate;

	static predicateForSamplesWithStartDateEndDateOptions(startDate: Date, endDate: Date, options: HKQueryOptions): NSPredicate;

	static predicateForStatesOfMindWithAssociation(association: HKStateOfMindAssociation): NSPredicate;

	static predicateForStatesOfMindWithKind(kind: HKStateOfMindKind): NSPredicate;

	static predicateForStatesOfMindWithLabel(label: HKStateOfMindLabel): NSPredicate;

	static predicateForStatesOfMindWithValenceOperatorType(valence: number, operatorType: NSPredicateOperatorType): NSPredicate;

	/**
	 * @since 15.0
	 */
	static predicateForVerifiableClinicalRecordsWithRelevantDateWithinDateInterval(dateInterval: NSDateInterval): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutActivitiesWithOperatorTypeDuration(operatorType: NSPredicateOperatorType, duration: number): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutActivitiesWithOperatorTypeQuantityTypeAverageQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, averageQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutActivitiesWithOperatorTypeQuantityTypeMaximumQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, maximumQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutActivitiesWithOperatorTypeQuantityTypeMinimumQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, minimumQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutActivitiesWithOperatorTypeQuantityTypeSumQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, sumQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutActivitiesWithStartDateEndDateOptions(startDate: Date, endDate: Date, options: HKQueryOptions): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutActivitiesWithWorkoutActivityType(workoutActivityType: HKWorkoutActivityType): NSPredicate;

	/**
	 * @since 18.0
	 */
	static predicateForWorkoutEffortSamplesRelatedToWorkoutActivity(workout: HKWorkout, activity: HKWorkoutActivity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutsWithActivityPredicate(activityPredicate: NSPredicate): NSPredicate;

	static predicateForWorkoutsWithOperatorTypeDuration(operatorType: NSPredicateOperatorType, duration: number): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutsWithOperatorTypeQuantityTypeAverageQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, averageQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutsWithOperatorTypeQuantityTypeMaximumQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, maximumQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutsWithOperatorTypeQuantityTypeMinimumQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, minimumQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 16.0
	 */
	static predicateForWorkoutsWithOperatorTypeQuantityTypeSumQuantity(operatorType: NSPredicateOperatorType, quantityType: HKQuantityType, sumQuantity: HKQuantity): NSPredicate;

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	static predicateForWorkoutsWithOperatorTypeTotalDistance(operatorType: NSPredicateOperatorType, totalDistance: HKQuantity): NSPredicate;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	static predicateForWorkoutsWithOperatorTypeTotalEnergyBurned(operatorType: NSPredicateOperatorType, totalEnergyBurned: HKQuantity): NSPredicate;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	static predicateForWorkoutsWithOperatorTypeTotalFlightsClimbed(operatorType: NSPredicateOperatorType, totalFlightsClimbed: HKQuantity): NSPredicate;

	/**
	 * @since 10.0
	 * @deprecated 18.0
	 */
	static predicateForWorkoutsWithOperatorTypeTotalSwimmingStrokeCount(operatorType: NSPredicateOperatorType, totalSwimmingStrokeCount: HKQuantity): NSPredicate;

	static predicateForWorkoutsWithWorkoutActivityType(workoutActivityType: HKWorkoutActivityType): NSPredicate;

	/**
	 * @since 9.3
	 */
	readonly objectType: HKObjectType;

	readonly predicate: NSPredicate;

	/**
	 * @since 8.0
	 * @deprecated 9.3
	 */
	readonly sampleType: HKSampleType;
}

/**
 * @since 9.0
 */
declare class HKQueryAnchor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKQueryAnchor; // inherited from NSObject

	static anchorFromValue(value: number): HKQueryAnchor;

	static new(): HKQueryAnchor; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.0
 */
declare class HKQueryDescriptor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKQueryDescriptor; // inherited from NSObject

	static new(): HKQueryDescriptor; // inherited from NSObject

	readonly predicate: NSPredicate;

	readonly sampleType: HKSampleType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { sampleType: HKSampleType; predicate: NSPredicate; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSampleTypePredicate(sampleType: HKSampleType, predicate: NSPredicate): this;
}

/**
 * @since 8.0
 */
declare const enum HKQueryOptions {

	None = 0,

	StrictStartDate = 1,

	StrictEndDate = 2
}

/**
 * @since 8.0
 */
declare class HKSample extends HKObject {

	static alloc(): HKSample; // inherited from NSObject

	static new(): HKSample; // inherited from NSObject

	readonly endDate: Date;

	/**
	 * @since 14.3
	 */
	readonly hasUndeterminedDuration: boolean;

	readonly sampleType: HKSampleType;

	readonly startDate: Date;
}

/**
 * @since 8.0
 */
declare class HKSampleQuery extends HKQuery {

	static alloc(): HKSampleQuery; // inherited from NSObject

	static new(): HKSampleQuery; // inherited from NSObject

	readonly limit: number;

	readonly sortDescriptors: NSArray<NSSortDescriptor>;

	/**
	 * @since 15.0
	 */
	constructor(o: { queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[]; limit: number; resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void; });

	/**
	 * @since 15.0
	 */
	constructor(o: { queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[]; limit: number; sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]; resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void; });

	constructor(o: { sampleType: HKSampleType; predicate: NSPredicate; limit: number; sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[]; resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void; });

	/**
	 * @since 15.0
	 */
	initWithQueryDescriptorsLimitResultsHandler(queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[], limit: number, resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void): this;

	/**
	 * @since 15.0
	 */
	initWithQueryDescriptorsLimitSortDescriptorsResultsHandler(queryDescriptors: NSArray<HKQueryDescriptor> | HKQueryDescriptor[], limit: number, sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[], resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void): this;

	initWithSampleTypePredicateLimitSortDescriptorsResultsHandler(sampleType: HKSampleType, predicate: NSPredicate, limit: number, sortDescriptors: NSArray<NSSortDescriptor> | NSSortDescriptor[], resultsHandler: (p1: HKSampleQuery, p2: NSArray<HKSample>, p3: NSError) => void): this;
}

/**
 * @since 8.0
 */
declare var HKSampleSortIdentifierEndDate: string;

/**
 * @since 8.0
 */
declare var HKSampleSortIdentifierStartDate: string;

/**
 * @since 8.0
 */
declare class HKSampleType extends HKObjectType {

	static alloc(): HKSampleType; // inherited from NSObject

	static new(): HKSampleType; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	readonly allowsRecalibrationForEstimates: boolean;

	/**
	 * @since 13.0
	 */
	readonly isMaximumDurationRestricted: boolean;

	/**
	 * @since 13.0
	 */
	readonly isMinimumDurationRestricted: boolean;

	/**
	 * @since 13.0
	 */
	readonly maximumAllowedDuration: number;

	/**
	 * @since 13.0
	 */
	readonly minimumAllowedDuration: number;
}

/**
 * @since 18.0
 */
declare class HKScoredAssessment extends HKSample implements NSCopying, NSSecureCoding {

	static alloc(): HKScoredAssessment; // inherited from NSObject

	static new(): HKScoredAssessment; // inherited from NSObject

	readonly score: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class HKScoredAssessmentType extends HKSampleType {

	static alloc(): HKScoredAssessmentType; // inherited from NSObject

	static new(): HKScoredAssessmentType; // inherited from NSObject
}

/**
 * @since 18.0
 */
declare var HKScoredAssessmentTypeIdentifierGAD7: string;

/**
 * @since 18.0
 */
declare var HKScoredAssessmentTypeIdentifierPHQ9: string;

declare class HKSeriesBuilder extends NSObject {

	static alloc(): HKSeriesBuilder; // inherited from NSObject

	static new(): HKSeriesBuilder; // inherited from NSObject

	discard(): void;
}

declare class HKSeriesSample extends HKSample {

	static alloc(): HKSeriesSample; // inherited from NSObject

	static new(): HKSeriesSample; // inherited from NSObject

	readonly count: number;
}

/**
 * @since 11.0
 */
declare class HKSeriesType extends HKSampleType {

	static alloc(): HKSeriesType; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	static heartbeatSeriesType(): HKSeriesType;

	static new(): HKSeriesType; // inherited from NSObject

	static workoutRouteType(): HKSeriesType;
}

/**
 * @since 8.0
 */
declare class HKSource extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKSource; // inherited from NSObject

	static defaultSource(): HKSource;

	static new(): HKSource; // inherited from NSObject

	readonly bundleIdentifier: string;

	readonly name: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class HKSourceQuery extends HKQuery {

	static alloc(): HKSourceQuery; // inherited from NSObject

	static new(): HKSourceQuery; // inherited from NSObject

	constructor(o: { sampleType: HKSampleType; samplePredicate: NSPredicate; completionHandler: (p1: HKSourceQuery, p2: NSSet<HKSource>, p3: NSError) => void; });

	initWithSampleTypeSamplePredicateCompletionHandler(sampleType: HKSampleType, objectPredicate: NSPredicate, completionHandler: (p1: HKSourceQuery, p2: NSSet<HKSource>, p3: NSError) => void): this;
}

/**
 * @since 9.0
 */
declare class HKSourceRevision extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKSourceRevision; // inherited from NSObject

	static new(): HKSourceRevision; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	readonly operatingSystemVersion: NSOperatingSystemVersion;

	/**
	 * @since 11.0
	 */
	readonly productType: string;

	readonly source: HKSource;

	readonly version: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { source: HKSource; version: string; });

	/**
	 * @since 11.0
	 */
	constructor(o: { source: HKSource; version: string; productType: string; operatingSystemVersion: NSOperatingSystemVersion; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSourceVersion(source: HKSource, version: string): this;

	/**
	 * @since 11.0
	 */
	initWithSourceVersionProductTypeOperatingSystemVersion(source: HKSource, version: string, productType: string, operatingSystemVersion: NSOperatingSystemVersion): this;
}

/**
 * @since 11.0
 */
declare var HKSourceRevisionAnyOperatingSystem: NSOperatingSystemVersion;

/**
 * @since 11.0
 */
declare var HKSourceRevisionAnyProductType: string;

/**
 * @since 11.0
 */
declare var HKSourceRevisionAnyVersion: string;

/**
 * @since 18.0
 */
declare class HKStateOfMind extends HKSample implements NSCopying, NSSecureCoding {

	static alloc(): HKStateOfMind; // inherited from NSObject

	static new(): HKStateOfMind; // inherited from NSObject

	static stateOfMindWithDateKindValenceLabelsAssociations(date: Date, kind: HKStateOfMindKind, valence: number, labels: NSArray<number> | number[], associations: NSArray<number> | number[]): HKStateOfMind;

	static stateOfMindWithDateKindValenceLabelsAssociationsMetadata(date: Date, kind: HKStateOfMindKind, valence: number, labels: NSArray<number> | number[], associations: NSArray<number> | number[], metadata: NSDictionary<string, any>): HKStateOfMind;

	readonly associations: NSArray<number>;

	readonly kind: HKStateOfMindKind;

	readonly labels: NSArray<number>;

	readonly valence: number;

	readonly valenceClassification: HKStateOfMindValenceClassification;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare const enum HKStateOfMindAssociation {

	Community = 1,

	CurrentEvents = 2,

	Dating = 3,

	Education = 4,

	Family = 5,

	Fitness = 6,

	Friends = 7,

	Health = 8,

	Hobbies = 9,

	Identity = 10,

	Money = 11,

	Partner = 12,

	SelfCare = 13,

	Spirituality = 14,

	Tasks = 15,

	Travel = 16,

	Work = 17,

	Weather = 18
}

/**
 * @since 18.0
 */
declare const enum HKStateOfMindKind {

	MomentaryEmotion = 1,

	DailyMood = 2
}

/**
 * @since 18.0
 */
declare const enum HKStateOfMindLabel {

	Amazed = 1,

	Amused = 2,

	Angry = 3,

	Anxious = 4,

	Ashamed = 5,

	Brave = 6,

	Calm = 7,

	Content = 8,

	Disappointed = 9,

	Discouraged = 10,

	Disgusted = 11,

	Embarrassed = 12,

	Excited = 13,

	Frustrated = 14,

	Grateful = 15,

	Guilty = 16,

	Happy = 17,

	Hopeless = 18,

	Irritated = 19,

	Jealous = 20,

	Joyful = 21,

	Lonely = 22,

	Passionate = 23,

	Peaceful = 24,

	Proud = 25,

	Relieved = 26,

	Sad = 27,

	Scared = 28,

	Stressed = 29,

	Surprised = 30,

	Worried = 31,

	Annoyed = 32,

	Confident = 33,

	Drained = 34,

	Hopeful = 35,

	Indifferent = 36,

	Overwhelmed = 37,

	Satisfied = 38
}

/**
 * @since 18.0
 */
declare class HKStateOfMindType extends HKSampleType {

	static alloc(): HKStateOfMindType; // inherited from NSObject

	static new(): HKStateOfMindType; // inherited from NSObject
}

/**
 * @since 18.0
 */
declare const enum HKStateOfMindValenceClassification {

	VeryUnpleasant = 1,

	Unpleasant = 2,

	SlightlyUnpleasant = 3,

	Neutral = 4,

	SlightlyPleasant = 5,

	Pleasant = 6,

	VeryPleasant = 7
}

declare function HKStateOfMindValenceClassificationForValence(valence: number): number;

/**
 * @since 8.0
 */
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

	/**
	 * @since 13.0
	 */
	duration(): HKQuantity;

	/**
	 * @since 13.0
	 */
	durationForSource(source: HKSource): HKQuantity;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	maximumQuantity(): HKQuantity;

	maximumQuantityForSource(source: HKSource): HKQuantity;

	minimumQuantity(): HKQuantity;

	minimumQuantityForSource(source: HKSource): HKQuantity;

	/**
	 * @since 12.0
	 */
	mostRecentQuantity(): HKQuantity;

	/**
	 * @since 12.0
	 */
	mostRecentQuantityDateInterval(): NSDateInterval;

	/**
	 * @since 12.0
	 */
	mostRecentQuantityDateIntervalForSource(source: HKSource): NSDateInterval;

	/**
	 * @since 12.0
	 */
	mostRecentQuantityForSource(source: HKSource): HKQuantity;

	sumQuantity(): HKQuantity;

	sumQuantityForSource(source: HKSource): HKQuantity;
}

/**
 * @since 8.0
 */
declare class HKStatisticsCollection extends NSObject {

	static alloc(): HKStatisticsCollection; // inherited from NSObject

	static new(): HKStatisticsCollection; // inherited from NSObject

	enumerateStatisticsFromDateToDateWithBlock(startDate: Date, endDate: Date, block: (p1: HKStatistics, p2: interop.Pointer | interop.Reference<boolean>) => void): void;

	sources(): NSSet<HKSource>;

	statistics(): NSArray<HKStatistics>;

	statisticsForDate(date: Date): HKStatistics;
}

/**
 * @since 8.0
 */
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

/**
 * @since 8.0
 */
declare const enum HKStatisticsOptions {

	None = 0,

	SeparateBySource = 1,

	DiscreteAverage = 2,

	DiscreteMin = 4,

	DiscreteMax = 8,

	CumulativeSum = 16,

	MostRecent = 32,

	DiscreteMostRecent = 32,

	Duration = 64
}

/**
 * @since 8.0
 */
declare class HKStatisticsQuery extends HKQuery {

	static alloc(): HKStatisticsQuery; // inherited from NSObject

	static new(): HKStatisticsQuery; // inherited from NSObject

	constructor(o: { quantityType: HKQuantityType; quantitySamplePredicate: NSPredicate; options: HKStatisticsOptions; completionHandler: (p1: HKStatisticsQuery, p2: HKStatistics, p3: NSError) => void; });

	initWithQuantityTypeQuantitySamplePredicateOptionsCompletionHandler(quantityType: HKQuantityType, quantitySamplePredicate: NSPredicate, options: HKStatisticsOptions, handler: (p1: HKStatisticsQuery, p2: HKStatistics, p3: NSError) => void): this;
}

/**
 * @since 10.0
 */
declare const enum HKSwimmingStrokeStyle {

	Unknown = 0,

	Mixed = 1,

	Freestyle = 2,

	Backstroke = 3,

	Breaststroke = 4,

	Butterfly = 5,

	Kickboard = 6
}

/**
 * @since 8.0
 */
declare class HKUnit extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKUnit; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static appleEffortScoreUnit(): HKUnit;

	static atmosphereUnit(): HKUnit;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	static calorieUnit(): HKUnit;

	static centimeterOfWaterUnit(): HKUnit;

	static countUnit(): HKUnit;

	/**
	 * @since 9.0
	 */
	static cupImperialUnit(): HKUnit;

	/**
	 * @since 9.0
	 */
	static cupUSUnit(): HKUnit;

	static dayUnit(): HKUnit;

	/**
	 * @since 13.0
	 */
	static decibelAWeightedSoundPressureLevelUnit(): HKUnit;

	/**
	 * @since 13.0
	 */
	static decibelHearingLevelUnit(): HKUnit;

	/**
	 * @since 16.0
	 */
	static degreeAngleUnit(): HKUnit;

	static degreeCelsiusUnit(): HKUnit;

	static degreeFahrenheitUnit(): HKUnit;

	/**
	 * @since 16.0
	 */
	static diopterUnit(): HKUnit;

	static energyFormatterUnitFromUnit(unit: HKUnit): NSEnergyFormatterUnit;

	static fluidOunceImperialUnit(): HKUnit;

	static fluidOunceUSUnit(): HKUnit;

	static footUnit(): HKUnit;

	static gramUnit(): HKUnit;

	static gramUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	/**
	 * @since 13.0
	 */
	static hertzUnit(): HKUnit;

	/**
	 * @since 13.0
	 */
	static hertzUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static hourUnit(): HKUnit;

	static inchUnit(): HKUnit;

	/**
	 * @since 14.0
	 */
	static inchesOfMercuryUnit(): HKUnit;

	/**
	 * @since 11.0
	 */
	static internationalUnit(): HKUnit;

	static jouleUnit(): HKUnit;

	static jouleUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static kelvinUnit(): HKUnit;

	static kilocalorieUnit(): HKUnit;

	/**
	 * @since 11.0
	 */
	static largeCalorieUnit(): HKUnit;

	static lengthFormatterUnitFromUnit(unit: HKUnit): NSLengthFormatterUnit;

	static literUnit(): HKUnit;

	static literUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	/**
	 * @since 17.0
	 */
	static luxUnit(): HKUnit;

	/**
	 * @since 17.0
	 */
	static luxUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

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

	/**
	 * @since 16.0
	 */
	static prismDiopterUnit(): HKUnit;

	/**
	 * @since 16.0
	 */
	static radianAngleUnit(): HKUnit;

	/**
	 * @since 16.0
	 */
	static radianAngleUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static secondUnit(): HKUnit;

	static secondUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	static siemenUnit(): HKUnit;

	static siemenUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	/**
	 * @since 11.0
	 */
	static smallCalorieUnit(): HKUnit;

	static stoneUnit(): HKUnit;

	static unitFromEnergyFormatterUnit(energyFormatterUnit: NSEnergyFormatterUnit): HKUnit;

	static unitFromLengthFormatterUnit(lengthFormatterUnit: NSLengthFormatterUnit): HKUnit;

	static unitFromMassFormatterUnit(massFormatterUnit: NSMassFormatterUnit): HKUnit;

	static unitFromString(string: string): HKUnit;

	/**
	 * @since 14.0
	 */
	static voltUnit(): HKUnit;

	/**
	 * @since 14.0
	 */
	static voltUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	/**
	 * @since 16.0
	 */
	static wattUnit(): HKUnit;

	/**
	 * @since 16.0
	 */
	static wattUnitWithMetricPrefix(prefix: HKMetricPrefix): HKUnit;

	/**
	 * @since 9.0
	 */
	static yardUnit(): HKUnit;

	readonly unitString: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	isNull(): boolean;

	reciprocalUnit(): HKUnit;

	unitDividedByUnit(unit: HKUnit): HKUnit;

	unitMultipliedByUnit(unit: HKUnit): HKUnit;

	unitRaisedToPower(power: number): HKUnit;
}

/**
 * @since 8.0
 */
declare const enum HKUpdateFrequency {

	Immediate = 1,

	Hourly = 2,

	Daily = 3,

	Weekly = 4
}

/**
 * @since 16.0
 */
declare const enum HKUserMotionContext {

	NotSet = 0,

	Stationary = 1,

	Active = 2
}

/**
 * @since 8.2
 */
declare var HKUserPreferencesDidChangeNotification: string;

/**
 * @since 11.0
 */
declare const enum HKVO2MaxTestType {

	MaxExercise = 1,

	PredictionSubMaxExercise = 2,

	PredictionNonExercise = 3
}

/**
 * @since 15.0
 */
declare class HKVerifiableClinicalRecord extends HKSample {

	static alloc(): HKVerifiableClinicalRecord; // inherited from NSObject

	static new(): HKVerifiableClinicalRecord; // inherited from NSObject

	/**
	 * @since 15.0
	 * @deprecated 15.4
	 */
	readonly JWSRepresentation: NSData;

	/**
	 * @since 15.4
	 */
	readonly dataRepresentation: NSData;

	readonly expirationDate: Date;

	readonly issuedDate: Date;

	readonly issuerIdentifier: string;

	readonly itemNames: NSArray<string>;

	readonly recordTypes: NSArray<string>;

	readonly relevantDate: Date;

	/**
	 * @since 15.4
	 */
	readonly sourceType: string;

	readonly subject: HKVerifiableClinicalRecordSubject;
}

/**
 * @since 15.4
 */
declare var HKVerifiableClinicalRecordCredentialTypeCOVID19: string;

/**
 * @since 15.4
 */
declare var HKVerifiableClinicalRecordCredentialTypeImmunization: string;

/**
 * @since 15.4
 */
declare var HKVerifiableClinicalRecordCredentialTypeLaboratory: string;

/**
 * @since 15.4
 */
declare var HKVerifiableClinicalRecordCredentialTypeRecovery: string;

/**
 * @since 15.0
 */
declare class HKVerifiableClinicalRecordQuery extends HKQuery {

	static alloc(): HKVerifiableClinicalRecordQuery; // inherited from NSObject

	static new(): HKVerifiableClinicalRecordQuery; // inherited from NSObject

	readonly recordTypes: NSArray<string>;

	/**
	 * @since 15.4
	 */
	readonly sourceTypes: NSArray<string>;

	constructor(o: { recordTypes: NSArray<string> | string[]; predicate: NSPredicate; resultsHandler: (p1: HKVerifiableClinicalRecordQuery, p2: NSArray<HKVerifiableClinicalRecord>, p3: NSError) => void; });

	/**
	 * @since 15.4
	 */
	constructor(o: { recordTypes: NSArray<string> | string[]; sourceTypes: NSArray<string> | string[]; predicate: NSPredicate; resultsHandler: (p1: HKVerifiableClinicalRecordQuery, p2: NSArray<HKVerifiableClinicalRecord>, p3: NSError) => void; });

	initWithRecordTypesPredicateResultsHandler(recordTypes: NSArray<string> | string[], predicate: NSPredicate, resultsHandler: (p1: HKVerifiableClinicalRecordQuery, p2: NSArray<HKVerifiableClinicalRecord>, p3: NSError) => void): this;

	/**
	 * @since 15.4
	 */
	initWithRecordTypesSourceTypesPredicateResultsHandler(recordTypes: NSArray<string> | string[], sourceTypes: NSArray<string> | string[], predicate: NSPredicate, resultsHandler: (p1: HKVerifiableClinicalRecordQuery, p2: NSArray<HKVerifiableClinicalRecord>, p3: NSError) => void): this;
}

/**
 * @since 15.4
 */
declare var HKVerifiableClinicalRecordSourceTypeEUDigitalCOVIDCertificate: string;

/**
 * @since 15.4
 */
declare var HKVerifiableClinicalRecordSourceTypeSMARTHealthCard: string;

/**
 * @since 15.0
 */
declare class HKVerifiableClinicalRecordSubject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKVerifiableClinicalRecordSubject; // inherited from NSObject

	static new(): HKVerifiableClinicalRecordSubject; // inherited from NSObject

	readonly dateOfBirthComponents: NSDateComponents;

	readonly fullName: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare const enum HKVisionEye {

	Left = 1,

	Right = 2
}

/**
 * @since 16.0
 */
declare class HKVisionPrescription extends HKSample implements NSCopying, NSSecureCoding {

	static alloc(): HKVisionPrescription; // inherited from NSObject

	static new(): HKVisionPrescription; // inherited from NSObject

	static prescriptionWithTypeDateIssuedExpirationDateDeviceMetadata(type: HKVisionPrescriptionType, dateIssued: Date, expirationDate: Date, device: HKDevice, metadata: NSDictionary<string, any>): HKVisionPrescription;

	readonly dateIssued: Date;

	readonly expirationDate: Date;

	readonly prescriptionType: HKVisionPrescriptionType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare const enum HKVisionPrescriptionType {

	Glasses = 1,

	Contacts = 2
}

/**
 * @since 16.0
 */
declare var HKVisionPrescriptionTypeIdentifier: string;

/**
 * @since 16.0
 */
declare class HKVisionPrism extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKVisionPrism; // inherited from NSObject

	static new(): HKVisionPrism; // inherited from NSObject

	readonly amount: HKQuantity;

	readonly angle: HKQuantity;

	readonly eye: HKVisionEye;

	readonly horizontalAmount: HKQuantity;

	readonly horizontalBase: HKPrismBase;

	readonly verticalAmount: HKQuantity;

	readonly verticalBase: HKPrismBase;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { amount: HKQuantity; angle: HKQuantity; eye: HKVisionEye; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { verticalAmount: HKQuantity; verticalBase: HKPrismBase; horizontalAmount: HKQuantity; horizontalBase: HKPrismBase; eye: HKVisionEye; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithAmountAngleEye(amount: HKQuantity, angle: HKQuantity, eye: HKVisionEye): this;

	initWithCoder(coder: NSCoder): this;

	initWithVerticalAmountVerticalBaseHorizontalAmountHorizontalBaseEye(verticalAmount: HKQuantity, verticalBase: HKPrismBase, horizontalAmount: HKQuantity, horizontalBase: HKPrismBase, eye: HKVisionEye): this;
}

/**
 * @since 17.0
 */
declare const enum HKWaterSalinity {

	FreshWater = 1,

	SaltWater = 2
}

/**
 * @since 10.0
 */
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

/**
 * @since 10.0
 */
declare const enum HKWheelchairUse {

	NotSet = 0,

	No = 1,

	Yes = 2
}

/**
 * @since 10.0
 */
declare class HKWheelchairUseObject extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKWheelchairUseObject; // inherited from NSObject

	static new(): HKWheelchairUseObject; // inherited from NSObject

	readonly wheelchairUse: HKWheelchairUse;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare class HKWorkout extends HKSample {

	static alloc(): HKWorkout; // inherited from NSObject

	static new(): HKWorkout; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	static workoutWithActivityTypeStartDateEndDate(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date): HKWorkout;

	/**
	 * @since 9.0
	 * @deprecated 17.0
	 */
	static workoutWithActivityTypeStartDateEndDateDurationTotalEnergyBurnedTotalDistanceDeviceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, duration: number, totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, device: HKDevice, metadata: NSDictionary<string, any>): HKWorkout;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	static workoutWithActivityTypeStartDateEndDateDurationTotalEnergyBurnedTotalDistanceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, duration: number, totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, metadata: NSDictionary<string, any>): HKWorkout;

	/**
	 * @since 9.0
	 * @deprecated 17.0
	 */
	static workoutWithActivityTypeStartDateEndDateWorkoutEventsTotalEnergyBurnedTotalDistanceDeviceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, workoutEvents: NSArray<HKWorkoutEvent> | HKWorkoutEvent[], totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, device: HKDevice, metadata: NSDictionary<string, any>): HKWorkout;

	/**
	 * @since 8.0
	 * @deprecated 17.0
	 */
	static workoutWithActivityTypeStartDateEndDateWorkoutEventsTotalEnergyBurnedTotalDistanceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, workoutEvents: NSArray<HKWorkoutEvent> | HKWorkoutEvent[], totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, metadata: NSDictionary<string, any>): HKWorkout;

	/**
	 * @since 11.0
	 * @deprecated 17.0
	 */
	static workoutWithActivityTypeStartDateEndDateWorkoutEventsTotalEnergyBurnedTotalDistanceTotalFlightsClimbedDeviceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, workoutEvents: NSArray<HKWorkoutEvent> | HKWorkoutEvent[], totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, totalFlightsClimbed: HKQuantity, device: HKDevice, metadata: NSDictionary<string, any>): HKWorkout;

	/**
	 * @since 10.0
	 * @deprecated 17.0
	 */
	static workoutWithActivityTypeStartDateEndDateWorkoutEventsTotalEnergyBurnedTotalDistanceTotalSwimmingStrokeCountDeviceMetadata(workoutActivityType: HKWorkoutActivityType, startDate: Date, endDate: Date, workoutEvents: NSArray<HKWorkoutEvent> | HKWorkoutEvent[], totalEnergyBurned: HKQuantity, totalDistance: HKQuantity, totalSwimmingStrokeCount: HKQuantity, device: HKDevice, metadata: NSDictionary<string, any>): HKWorkout;

	/**
	 * @since 16.0
	 */
	readonly allStatistics: NSDictionary<HKQuantityType, HKStatistics>;

	readonly duration: number;

	/**
	 * @since 8.0
	 * @deprecated 100000
	 */
	readonly totalDistance: HKQuantity;

	/**
	 * @since 8.0
	 * @deprecated 18.0
	 */
	readonly totalEnergyBurned: HKQuantity;

	/**
	 * @since 11.0
	 * @deprecated 18.0
	 */
	readonly totalFlightsClimbed: HKQuantity;

	/**
	 * @since 10.0
	 * @deprecated 18.0
	 */
	readonly totalSwimmingStrokeCount: HKQuantity;

	/**
	 * @since 16.0
	 */
	readonly workoutActivities: NSArray<HKWorkoutActivity>;

	readonly workoutActivityType: HKWorkoutActivityType;

	readonly workoutEvents: NSArray<HKWorkoutEvent>;

	/**
	 * @since 16.0
	 */
	statisticsForType(quantityType: HKQuantityType): HKStatistics;
}

/**
 * @since 16.0
 */
declare class HKWorkoutActivity extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKWorkoutActivity; // inherited from NSObject

	static new(): HKWorkoutActivity; // inherited from NSObject

	readonly UUID: NSUUID;

	/**
	 * @since 16.0
	 */
	readonly allStatistics: NSDictionary<HKQuantityType, HKStatistics>;

	readonly duration: number;

	readonly endDate: Date;

	readonly metadata: NSDictionary<string, any>;

	readonly startDate: Date;

	readonly workoutConfiguration: HKWorkoutConfiguration;

	readonly workoutEvents: NSArray<HKWorkoutEvent>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { workoutConfiguration: HKWorkoutConfiguration; startDate: Date; endDate: Date; metadata: NSDictionary<string, any>; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithWorkoutConfigurationStartDateEndDateMetadata(workoutConfiguration: HKWorkoutConfiguration, startDate: Date, endDate: Date, metadata: NSDictionary<string, any>): this;

	statisticsForType(quantityType: HKQuantityType): HKStatistics;
}

/**
 * @since 8.0
 */
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

	TaiChi = 72,

	MixedCardio = 73,

	HandCycling = 74,

	DiscSports = 75,

	FitnessGaming = 76,

	CardioDance = 77,

	SocialDance = 78,

	Pickleball = 79,

	Cooldown = 80,

	SwimBikeRun = 82,

	Transition = 83,

	UnderwaterDiving = 84,

	Other = 3000
}

/**
 * @since 12.0
 */
declare class HKWorkoutBuilder extends NSObject {

	static alloc(): HKWorkoutBuilder; // inherited from NSObject

	static new(): HKWorkoutBuilder; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly allStatistics: NSDictionary<HKQuantityType, HKStatistics>;

	readonly device: HKDevice;

	readonly endDate: Date;

	readonly metadata: NSDictionary<string, any>;

	readonly startDate: Date;

	/**
	 * @since 16.0
	 */
	readonly workoutActivities: NSArray<HKWorkoutActivity>;

	readonly workoutConfiguration: HKWorkoutConfiguration;

	readonly workoutEvents: NSArray<HKWorkoutEvent>;

	constructor(o: { healthStore: HKHealthStore; configuration: HKWorkoutConfiguration; device: HKDevice; });

	addMetadataCompletion(metadata: NSDictionary<string, any>, completion: (p1: boolean, p2: NSError) => void): void;

	addSamplesCompletion(samples: NSArray<HKSample> | HKSample[], completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	addWorkoutActivityCompletion(workoutActivity: HKWorkoutActivity, completion: (p1: boolean, p2: NSError) => void): void;

	addWorkoutEventsCompletion(workoutEvents: NSArray<HKWorkoutEvent> | HKWorkoutEvent[], completion: (p1: boolean, p2: NSError) => void): void;

	beginCollectionWithStartDateCompletion(startDate: Date, completion: (p1: boolean, p2: NSError) => void): void;

	discardWorkout(): void;

	elapsedTimeAtDate(date: Date): number;

	endCollectionWithEndDateCompletion(endDate: Date, completion: (p1: boolean, p2: NSError) => void): void;

	finishWorkoutWithCompletion(completion: (p1: HKWorkout, p2: NSError) => void): void;

	initWithHealthStoreConfigurationDevice(healthStore: HKHealthStore, configuration: HKWorkoutConfiguration, device: HKDevice): this;

	seriesBuilderForType(seriesType: HKSeriesType): HKSeriesBuilder;

	statisticsForType(quantityType: HKQuantityType): HKStatistics;

	/**
	 * @since 16.0
	 */
	updateActivityWithUUIDAddMedatataCompletion(UUID: NSUUID, metadata: NSDictionary<string, any>, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 16.0
	 */
	updateActivityWithUUIDEndDateCompletion(UUID: NSUUID, endDate: Date, completion: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 10.0
 */
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

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class HKWorkoutEffortRelationship extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKWorkoutEffortRelationship; // inherited from NSObject

	static new(): HKWorkoutEffortRelationship; // inherited from NSObject

	readonly activity: HKWorkoutActivity;

	readonly samples: NSArray<HKSample>;

	readonly workout: HKWorkout;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 18.0
 */
declare class HKWorkoutEffortRelationshipQuery extends HKQuery {

	static alloc(): HKWorkoutEffortRelationshipQuery; // inherited from NSObject

	static new(): HKWorkoutEffortRelationshipQuery; // inherited from NSObject

	constructor(o: { predicate: NSPredicate; anchor: HKQueryAnchor; options: HKWorkoutEffortRelationshipQueryOptions; resultsHandler: (p1: HKWorkoutEffortRelationshipQuery, p2: NSArray<HKWorkoutEffortRelationship>, p3: HKQueryAnchor, p4: NSError) => void; });

	initWithPredicateAnchorOptionsResultsHandler(predicate: NSPredicate, anchor: HKQueryAnchor, options: HKWorkoutEffortRelationshipQueryOptions, resultsHandler: (p1: HKWorkoutEffortRelationshipQuery, p2: NSArray<HKWorkoutEffortRelationship>, p3: HKQueryAnchor, p4: NSError) => void): this;
}

/**
 * @since 18.0
 */
declare const enum HKWorkoutEffortRelationshipQueryOptions {

	Default = 0,

	MostRelevant = 1
}

/**
 * @since 8.0
 */
declare class HKWorkoutEvent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): HKWorkoutEvent; // inherited from NSObject

	static new(): HKWorkoutEvent; // inherited from NSObject

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	static workoutEventWithTypeDate(type: HKWorkoutEventType, date: Date): HKWorkoutEvent;

	/**
	 * @since 11.0
	 */
	static workoutEventWithTypeDateIntervalMetadata(type: HKWorkoutEventType, dateInterval: NSDateInterval, metadata: NSDictionary<string, any>): HKWorkoutEvent;

	/**
	 * @since 10.0
	 * @deprecated 11.0
	 */
	static workoutEventWithTypeDateMetadata(type: HKWorkoutEventType, date: Date, metadata: NSDictionary<string, any>): HKWorkoutEvent;

	/**
	 * @since 8.0
	 * @deprecated 11.0
	 */
	readonly date: Date;

	/**
	 * @since 11.0
	 */
	readonly dateInterval: NSDateInterval;

	/**
	 * @since 10.0
	 */
	readonly metadata: NSDictionary<string, any>;

	readonly type: HKWorkoutEventType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 8.0
 */
declare const enum HKWorkoutEventType {

	Pause = 1,

	Resume = 2,

	Lap = 3,

	Marker = 4,

	MotionPaused = 5,

	MotionResumed = 6,

	Segment = 7,

	PauseOrResumeRequest = 8
}

/**
 * @since 11.0
 */
declare class HKWorkoutRoute extends HKSeriesSample {

	static alloc(): HKWorkoutRoute; // inherited from NSObject

	static new(): HKWorkoutRoute; // inherited from NSObject
}

/**
 * @since 11.0
 */
declare class HKWorkoutRouteBuilder extends HKSeriesBuilder {

	static alloc(): HKWorkoutRouteBuilder; // inherited from NSObject

	static new(): HKWorkoutRouteBuilder; // inherited from NSObject

	constructor(o: { healthStore: HKHealthStore; device: HKDevice; });

	addMetadataCompletion(metadata: NSDictionary<string, any>, completion: (p1: boolean, p2: NSError) => void): void;

	finishRouteWithWorkoutMetadataCompletion(workout: HKWorkout, metadata: NSDictionary<string, any>, completion: (p1: HKWorkoutRoute, p2: NSError) => void): void;

	initWithHealthStoreDevice(healthStore: HKHealthStore, device: HKDevice): this;

	insertRouteDataCompletion(routeData: NSArray<CLLocation> | CLLocation[], completion: (p1: boolean, p2: NSError) => void): void;
}

/**
 * @since 11.0
 */
declare class HKWorkoutRouteQuery extends HKQuery {

	static alloc(): HKWorkoutRouteQuery; // inherited from NSObject

	static new(): HKWorkoutRouteQuery; // inherited from NSObject

	constructor(o: { route: HKWorkoutRoute; dataHandler: (p1: HKWorkoutRouteQuery, p2: NSArray<CLLocation>, p3: boolean, p4: NSError) => void; });

	/**
	 * @since 16.0
	 */
	constructor(o: { route: HKWorkoutRoute; dateInterval: NSDateInterval; dataHandler: (p1: HKWorkoutRouteQuery, p2: NSArray<CLLocation>, p3: boolean, p4: NSError) => void; });

	initWithRouteDataHandler(workoutRoute: HKWorkoutRoute, dataHandler: (p1: HKWorkoutRouteQuery, p2: NSArray<CLLocation>, p3: boolean, p4: NSError) => void): this;

	/**
	 * @since 16.0
	 */
	initWithRouteDateIntervalDataHandler(workoutRoute: HKWorkoutRoute, dateInterval: NSDateInterval, dataHandler: (p1: HKWorkoutRouteQuery, p2: NSArray<CLLocation>, p3: boolean, p4: NSError) => void): this;
}

/**
 * @since 11.0
 */
declare var HKWorkoutRouteTypeIdentifier: string;

/**
 * @since 17.0
 */
declare class HKWorkoutSession extends NSObject implements NSSecureCoding {

	static alloc(): HKWorkoutSession; // inherited from NSObject

	static new(): HKWorkoutSession; // inherited from NSObject

	readonly activityType: HKWorkoutActivityType;

	/**
	 * @since 17.0
	 */
	readonly currentActivity: HKWorkoutActivity;

	delegate: HKWorkoutSessionDelegate;

	readonly endDate: Date;

	readonly locationType: HKWorkoutSessionLocationType;

	readonly startDate: Date;

	readonly state: HKWorkoutSessionState;

	/**
	 * @since 17.0
	 */
	readonly type: HKWorkoutSessionType;

	/**
	 * @since 17.0
	 */
	readonly workoutConfiguration: HKWorkoutConfiguration;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 17.0
	 */
	beginNewActivityWithConfigurationDateMetadata(workoutConfiguration: HKWorkoutConfiguration, date: Date, metadata: NSDictionary<string, any>): void;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 17.0
	 */
	end(): void;

	/**
	 * @since 17.0
	 */
	endCurrentActivityOnDate(date: Date): void;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 17.0
	 */
	pause(): void;

	/**
	 * @since 17.0
	 */
	prepare(): void;

	/**
	 * @since 17.0
	 */
	resume(): void;

	/**
	 * @since 17.0
	 */
	sendDataToRemoteWorkoutSessionCompletion(data: NSData, completion: (p1: boolean, p2: NSError) => void): void;

	/**
	 * @since 17.0
	 */
	startActivityWithDate(date: Date): void;

	/**
	 * @since 17.0
	 */
	stopActivityWithDate(date: Date): void;
}

/**
 * @since 17.0
 */
interface HKWorkoutSessionDelegate extends NSObjectProtocol {

	/**
	 * @since 17.0
	 */
	workoutSessionDidBeginActivityWithConfigurationDate?(workoutSession: HKWorkoutSession, workoutConfiguration: HKWorkoutConfiguration, date: Date): void;

	workoutSessionDidChangeToStateFromStateDate(workoutSession: HKWorkoutSession, toState: HKWorkoutSessionState, fromState: HKWorkoutSessionState, date: Date): void;

	/**
	 * @since 17.0
	 */
	workoutSessionDidDisconnectFromRemoteDeviceWithError?(workoutSession: HKWorkoutSession, error: NSError): void;

	/**
	 * @since 17.0
	 */
	workoutSessionDidEndActivityWithConfigurationDate?(workoutSession: HKWorkoutSession, workoutConfiguration: HKWorkoutConfiguration, date: Date): void;

	workoutSessionDidFailWithError(workoutSession: HKWorkoutSession, error: NSError): void;

	/**
	 * @since 10.0
	 */
	workoutSessionDidGenerateEvent?(workoutSession: HKWorkoutSession, event: HKWorkoutEvent): void;

	/**
	 * @since 17.0
	 */
	workoutSessionDidReceiveDataFromRemoteWorkoutSession?(workoutSession: HKWorkoutSession, data: NSArray<NSData> | NSData[]): void;
}
declare var HKWorkoutSessionDelegate: {

	prototype: HKWorkoutSessionDelegate;
};

/**
 * @since 10.0
 */
declare const enum HKWorkoutSessionLocationType {

	Unknown = 1,

	Indoor = 2,

	Outdoor = 3
}

/**
 * @since 17.0
 */
declare const enum HKWorkoutSessionState {

	NotStarted = 1,

	Running = 2,

	Ended = 3,

	Paused = 4,

	Prepared = 5,

	Stopped = 6
}

/**
 * @since 17.0
 */
declare const enum HKWorkoutSessionType {

	Primary = 0,

	Mirrored = 1
}

/**
 * @since 8.0
 */
declare var HKWorkoutSortIdentifierDuration: string;

/**
 * @since 8.0
 */
declare var HKWorkoutSortIdentifierTotalDistance: string;

/**
 * @since 8.0
 */
declare var HKWorkoutSortIdentifierTotalEnergyBurned: string;

/**
 * @since 11.0
 */
declare var HKWorkoutSortIdentifierTotalFlightsClimbed: string;

/**
 * @since 10.0
 */
declare var HKWorkoutSortIdentifierTotalSwimmingStrokeCount: string;

/**
 * @since 10.0
 */
declare const enum HKWorkoutSwimmingLocationType {

	Unknown = 0,

	Pool = 1,

	OpenWater = 2
}

/**
 * @since 8.0
 */
declare class HKWorkoutType extends HKSampleType {

	static alloc(): HKWorkoutType; // inherited from NSObject

	static new(): HKWorkoutType; // inherited from NSObject
}

/**
 * @since 8.0
 */
declare var HKWorkoutTypeIdentifier: string;
