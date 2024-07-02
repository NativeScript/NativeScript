
/**
 * @since 12.5
 */
declare const enum ENActivityFlags {

	Reserved1 = 1,

	Reserved2 = 2,

	PeriodicRun = 4,

	PreAuthorizedKeyReleaseNotificationTapped = 8
}

declare const ENAttenuationMax: number;

declare const ENAttenuationMin: number;

/**
 * @since 12.5
 */
declare const enum ENAuthorizationStatus {

	Unknown = 0,

	Restricted = 1,

	NotAuthorized = 2,

	Authorized = 3
}

/**
 * @since 12.5
 */
declare const enum ENCalibrationConfidence {

	Lowest = 0,

	Low = 1,

	Medium = 2,

	High = 3
}

/**
 * @since 14.0
 * @deprecated 14.2
 */
declare var ENDaysSinceOnsetOfSymptomsUnknown: number;

/**
 * @since 12.5
 */
declare const enum ENDiagnosisReportType {

	Unknown = 0,

	ConfirmedTest = 1,

	ConfirmedClinicalDiagnosis = 2,

	SelfReported = 3,

	Recursive = 4,

	Revoked = 5
}

/**
 * @since 12.5
 */
declare const enum ENErrorCode {

	Unknown = 1,

	BadParameter = 2,

	NotEntitled = 3,

	NotAuthorized = 4,

	Unsupported = 5,

	Invalidated = 6,

	BluetoothOff = 7,

	InsufficientStorage = 8,

	NotEnabled = 9,

	APIMisuse = 10,

	Internal = 11,

	InsufficientMemory = 12,

	RateLimited = 13,

	Restricted = 14,

	BadFormat = 15,

	DataInaccessible = 16,

	TravelStatusNotAvailable = 17
}

/**
 * @since 12.5
 */
declare var ENErrorDomain: string;

/**
 * @since 12.5
 */
declare class ENExposureConfiguration extends NSObject {

	static alloc(): ENExposureConfiguration; // inherited from NSObject

	static new(): ENExposureConfiguration; // inherited from NSObject

	attenuationDurationThresholds: NSArray<number>;

	attenuationLevelValues: NSArray<number>;

	attenuationWeight: number;

	daysSinceLastExposureLevelValues: NSArray<number>;

	/**
	 * @since 12.5
	 */
	daysSinceLastExposureThreshold: number;

	daysSinceLastExposureWeight: number;

	durationLevelValues: NSArray<number>;

	durationWeight: number;

	/**
	 * @since 12.5
	 */
	immediateDurationWeight: number;

	/**
	 * @since 12.5
	 */
	infectiousnessForDaysSinceOnsetOfSymptoms: NSDictionary<number, number>;

	/**
	 * @since 12.5
	 */
	infectiousnessHighWeight: number;

	/**
	 * @since 12.5
	 */
	infectiousnessStandardWeight: number;

	/**
	 * @since 12.5
	 */
	mediumDurationWeight: number;

	metadata: NSDictionary<any, any>;

	minimumRiskScore: number;

	minimumRiskScoreFullRange: number;

	/**
	 * @since 12.5
	 */
	nearDurationWeight: number;

	/**
	 * @since 12.5
	 */
	otherDurationWeight: number;

	/**
	 * @since 12.5
	 */
	reportTypeConfirmedClinicalDiagnosisWeight: number;

	/**
	 * @since 12.5
	 */
	reportTypeConfirmedTestWeight: number;

	/**
	 * @since 12.5
	 */
	reportTypeNoneMap: ENDiagnosisReportType;

	/**
	 * @since 12.5
	 */
	reportTypeRecursiveWeight: number;

	/**
	 * @since 12.5
	 */
	reportTypeSelfReportedWeight: number;

	transmissionRiskLevelValues: NSArray<number>;

	transmissionRiskWeight: number;
}

/**
 * @since 12.5
 */
declare class ENExposureDaySummary extends NSObject {

	static alloc(): ENExposureDaySummary; // inherited from NSObject

	static new(): ENExposureDaySummary; // inherited from NSObject

	readonly confirmedClinicalDiagnosisSummary: ENExposureSummaryItem;

	readonly confirmedTestSummary: ENExposureSummaryItem;

	readonly date: Date;

	readonly daySummary: ENExposureSummaryItem;

	readonly recursiveSummary: ENExposureSummaryItem;

	readonly selfReportedSummary: ENExposureSummaryItem;
}

/**
 * @since 12.5
 */
declare class ENExposureDetectionSummary extends NSObject {

	static alloc(): ENExposureDetectionSummary; // inherited from NSObject

	static new(): ENExposureDetectionSummary; // inherited from NSObject

	readonly attenuationDurations: NSArray<number>;

	/**
	 * @since 12.5
	 */
	readonly daySummaries: NSArray<ENExposureDaySummary>;

	readonly daysSinceLastExposure: number;

	readonly matchedKeyCount: number;

	readonly maximumRiskScore: number;

	readonly maximumRiskScoreFullRange: number;

	readonly metadata: NSDictionary<any, any>;

	readonly riskScoreSumFullRange: number;
}

/**
 * @since 12.5
 */
declare class ENExposureInfo extends NSObject {

	static alloc(): ENExposureInfo; // inherited from NSObject

	static new(): ENExposureInfo; // inherited from NSObject

	readonly attenuationDurations: NSArray<number>;

	readonly attenuationValue: number;

	readonly date: Date;

	/**
	 * @since 12.5
	 */
	readonly daysSinceOnsetOfSymptoms: number;

	/**
	 * @since 12.5
	 */
	readonly diagnosisReportType: ENDiagnosisReportType;

	readonly duration: number;

	readonly metadata: NSDictionary<any, any>;

	readonly totalRiskScore: number;

	readonly totalRiskScoreFullRange: number;

	readonly transmissionRiskLevel: number;
}

/**
 * @since 12.5
 */
declare class ENExposureSummaryItem extends NSObject {

	static alloc(): ENExposureSummaryItem; // inherited from NSObject

	static new(): ENExposureSummaryItem; // inherited from NSObject

	readonly maximumScore: number;

	readonly scoreSum: number;

	readonly weightedDurationSum: number;
}

/**
 * @since 12.5
 */
declare class ENExposureWindow extends NSObject {

	static alloc(): ENExposureWindow; // inherited from NSObject

	static new(): ENExposureWindow; // inherited from NSObject

	readonly calibrationConfidence: ENCalibrationConfidence;

	readonly date: Date;

	readonly diagnosisReportType: ENDiagnosisReportType;

	readonly infectiousness: ENInfectiousness;

	readonly scanInstances: NSArray<ENScanInstance>;

	/**
	 * @since 15.2
	 */
	readonly variantOfConcernType: ENVariantOfConcernType;
}

/**
 * @since 12.5
 */
declare const enum ENInfectiousness {

	None = 0,

	Standard = 1,

	High = 2
}

/**
 * @since 12.5
 */
declare class ENManager extends NSObject {

	static alloc(): ENManager; // inherited from NSObject

	static new(): ENManager; // inherited from NSObject

	/**
	 * @since 12.5
	 */
	activityHandler: (p1: ENActivityFlags) => void;

	/**
	 * @since 14.4
	 */
	diagnosisKeysAvailableHandler: (p1: NSArray<ENTemporaryExposureKey>) => void;

	dispatchQueue: NSObject & OS_dispatch_queue;

	readonly exposureNotificationEnabled: boolean;

	readonly exposureNotificationStatus: ENStatus;

	invalidationHandler: () => void;

	static readonly authorizationStatus: ENAuthorizationStatus;

	activateWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 12.5
	 */
	detectExposuresWithConfigurationCompletionHandler(configuration: ENExposureConfiguration, completionHandler: (p1: ENExposureDetectionSummary, p2: NSError) => void): NSProgress;

	detectExposuresWithConfigurationDiagnosisKeyURLsCompletionHandler(configuration: ENExposureConfiguration, diagnosisKeyURLs: NSArray<NSURL> | NSURL[], completionHandler: (p1: ENExposureDetectionSummary, p2: NSError) => void): NSProgress;

	getDiagnosisKeysWithCompletionHandler(completionHandler: (p1: NSArray<ENTemporaryExposureKey>, p2: NSError) => void): void;

	/**
	 * @since 13.5
	 * @deprecated 13.6
	 */
	getExposureInfoFromSummaryUserExplanationCompletionHandler(summary: ENExposureDetectionSummary, userExplanation: string, completionHandler: (p1: NSArray<ENExposureInfo>, p2: NSError) => void): NSProgress;

	/**
	 * @since 12.5
	 */
	getExposureWindowsFromSummaryCompletionHandler(summary: ENExposureDetectionSummary, completionHandler: (p1: NSArray<ENExposureWindow>, p2: NSError) => void): NSProgress;

	getTestDiagnosisKeysWithCompletionHandler(completionHandler: (p1: NSArray<ENTemporaryExposureKey>, p2: NSError) => void): void;

	/**
	 * @since 12.5
	 */
	getUserTraveledWithCompletionHandler(completionHandler: (p1: boolean, p2: NSError) => void): void;

	invalidate(): void;

	/**
	 * @since 14.4
	 */
	preAuthorizeDiagnosisKeysWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	/**
	 * @since 14.4
	 */
	requestPreAuthorizedDiagnosisKeysWithCompletionHandler(completionHandler: (p1: NSError) => void): void;

	setExposureNotificationEnabledCompletionHandler(enabled: boolean, completionHandler: (p1: NSError) => void): void;
}

declare const ENRiskLevelMax: number;

declare const ENRiskLevelMin: number;

declare const ENRiskLevelValueMax: number;

declare const ENRiskLevelValueMin: number;

declare const ENRiskScoreMax: number;

declare const ENRiskScoreMin: number;

declare const ENRiskWeightDefault: number;

declare const ENRiskWeightDefaultV2: number;

declare const ENRiskWeightMax: number;

declare const ENRiskWeightMaxV2: number;

declare const ENRiskWeightMin: number;

/**
 * @since 12.5
 */
declare class ENScanInstance extends NSObject {

	static alloc(): ENScanInstance; // inherited from NSObject

	static new(): ENScanInstance; // inherited from NSObject

	readonly minimumAttenuation: number;

	readonly secondsSinceLastScan: number;

	readonly typicalAttenuation: number;
}

/**
 * @since 12.5
 */
declare const enum ENStatus {

	Unknown = 0,

	Active = 1,

	Disabled = 2,

	BluetoothOff = 3,

	Restricted = 4,

	Paused = 5,

	Unauthorized = 6
}

/**
 * @since 12.5
 */
declare class ENTemporaryExposureKey extends NSObject {

	static alloc(): ENTemporaryExposureKey; // inherited from NSObject

	static new(): ENTemporaryExposureKey; // inherited from NSObject

	keyData: NSData;

	rollingPeriod: number;

	rollingStartNumber: number;

	transmissionRiskLevel: number;
}

/**
 * @since 15.2
 */
declare const enum ENVariantOfConcernType {

	TypeUnknown = 0,

	Type1 = 1,

	Type2 = 2,

	Type3 = 3,

	Type4 = 4
}
