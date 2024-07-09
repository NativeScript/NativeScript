
/**
 * @since 14.0
 */
declare class MXAnimationMetric extends MXMetric {

	static alloc(): MXAnimationMetric; // inherited from NSObject

	static new(): MXAnimationMetric; // inherited from NSObject

	readonly scrollHitchTimeRatio: NSMeasurement<NSUnit>;
}

/**
 * @since 14.0
 */
declare class MXAppExitMetric extends MXMetric {

	static alloc(): MXAppExitMetric; // inherited from NSObject

	static new(): MXAppExitMetric; // inherited from NSObject

	readonly backgroundExitData: MXBackgroundExitData;

	readonly foregroundExitData: MXForegroundExitData;
}

/**
 * @since 16.0
 */
declare class MXAppLaunchDiagnostic extends MXDiagnostic {

	static alloc(): MXAppLaunchDiagnostic; // inherited from NSObject

	static new(): MXAppLaunchDiagnostic; // inherited from NSObject

	readonly callStackTree: MXCallStackTree;

	readonly launchDuration: NSMeasurement<NSUnitDuration>;
}

/**
 * @since 13.0
 */
declare class MXAppLaunchMetric extends MXMetric {

	static alloc(): MXAppLaunchMetric; // inherited from NSObject

	static new(): MXAppLaunchMetric; // inherited from NSObject

	readonly histogrammedApplicationResumeTime: MXHistogram<NSUnitDuration>;

	/**
	 * @since 16.0
	 */
	readonly histogrammedExtendedLaunch: MXHistogram<NSUnitDuration>;

	/**
	 * @since 15.2
	 */
	readonly histogrammedOptimizedTimeToFirstDraw: MXHistogram<NSUnitDuration>;

	readonly histogrammedTimeToFirstDraw: MXHistogram<NSUnitDuration>;
}

/**
 * @since 13.0
 */
declare class MXAppResponsivenessMetric extends MXMetric {

	static alloc(): MXAppResponsivenessMetric; // inherited from NSObject

	static new(): MXAppResponsivenessMetric; // inherited from NSObject

	readonly histogrammedApplicationHangTime: MXHistogram<NSUnitDuration>;
}

/**
 * @since 13.0
 */
declare class MXAppRunTimeMetric extends MXMetric {

	static alloc(): MXAppRunTimeMetric; // inherited from NSObject

	static new(): MXAppRunTimeMetric; // inherited from NSObject

	readonly cumulativeBackgroundAudioTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeBackgroundLocationTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeBackgroundTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeForegroundTime: NSMeasurement<NSUnitDuration>;
}

/**
 * @since 13.0
 */
declare class MXAverage<UnitType> extends NSObject implements NSSecureCoding {

	static alloc<UnitType>(): MXAverage<UnitType>; // inherited from NSObject

	static new<UnitType>(): MXAverage<UnitType>; // inherited from NSObject

	readonly averageMeasurement: NSMeasurement<NSUnit>;

	readonly sampleCount: number;

	readonly standardDeviation: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare class MXBackgroundExitData extends NSObject implements NSSecureCoding {

	static alloc(): MXBackgroundExitData; // inherited from NSObject

	static new(): MXBackgroundExitData; // inherited from NSObject

	readonly cumulativeAbnormalExitCount: number;

	readonly cumulativeAppWatchdogExitCount: number;

	readonly cumulativeBackgroundTaskAssertionTimeoutExitCount: number;

	readonly cumulativeBadAccessExitCount: number;

	readonly cumulativeCPUResourceLimitExitCount: number;

	readonly cumulativeIllegalInstructionExitCount: number;

	readonly cumulativeMemoryPressureExitCount: number;

	readonly cumulativeMemoryResourceLimitExitCount: number;

	readonly cumulativeNormalAppExitCount: number;

	readonly cumulativeSuspendedWithLockedFileExitCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare class MXCPUExceptionDiagnostic extends MXDiagnostic {

	static alloc(): MXCPUExceptionDiagnostic; // inherited from NSObject

	static new(): MXCPUExceptionDiagnostic; // inherited from NSObject

	readonly callStackTree: MXCallStackTree;

	readonly totalCPUTime: NSMeasurement<NSUnitDuration>;

	readonly totalSampledTime: NSMeasurement<NSUnitDuration>;
}

/**
 * @since 13.0
 */
declare class MXCPUMetric extends MXMetric {

	static alloc(): MXCPUMetric; // inherited from NSObject

	static new(): MXCPUMetric; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly cumulativeCPUInstructions: NSMeasurement<NSUnit>;

	readonly cumulativeCPUTime: NSMeasurement<NSUnitDuration>;
}

/**
 * @since 14.0
 */
declare class MXCallStackTree extends NSObject implements NSSecureCoding {

	static alloc(): MXCallStackTree; // inherited from NSObject

	static new(): MXCallStackTree; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	JSONRepresentation(): NSData;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXCellularConditionMetric extends MXMetric {

	static alloc(): MXCellularConditionMetric; // inherited from NSObject

	static new(): MXCellularConditionMetric; // inherited from NSObject

	readonly histogrammedCellularConditionTime: MXHistogram<MXUnitSignalBars>;
}

/**
 * @since 14.0
 */
declare class MXCrashDiagnostic extends MXDiagnostic {

	static alloc(): MXCrashDiagnostic; // inherited from NSObject

	static new(): MXCrashDiagnostic; // inherited from NSObject

	readonly callStackTree: MXCallStackTree;

	readonly exceptionCode: number;

	/**
	 * @since 17.0
	 */
	readonly exceptionReason: MXCrashDiagnosticObjectiveCExceptionReason;

	readonly exceptionType: number;

	readonly signal: number;

	readonly terminationReason: string;

	readonly virtualMemoryRegionInfo: string;
}

/**
 * @since 17.0
 */
declare class MXCrashDiagnosticObjectiveCExceptionReason extends NSObject implements NSSecureCoding {

	static alloc(): MXCrashDiagnosticObjectiveCExceptionReason; // inherited from NSObject

	static new(): MXCrashDiagnosticObjectiveCExceptionReason; // inherited from NSObject

	readonly arguments: NSArray<string>;

	readonly className: string;

	readonly composedMessage: string;

	readonly exceptionName: string;

	readonly exceptionType: string;

	readonly formatString: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	JSONRepresentation(): NSData;

	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare class MXDiagnostic extends NSObject implements NSSecureCoding {

	static alloc(): MXDiagnostic; // inherited from NSObject

	static new(): MXDiagnostic; // inherited from NSObject

	readonly applicationVersion: string;

	readonly metaData: MXMetaData;

	/**
	 * @since 17.0
	 */
	readonly signpostData: NSArray<MXSignpostRecord>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	JSONRepresentation(): NSData;

	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 14.0
 */
declare class MXDiagnosticPayload extends NSObject implements NSSecureCoding {

	static alloc(): MXDiagnosticPayload; // inherited from NSObject

	static new(): MXDiagnosticPayload; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	readonly appLaunchDiagnostics: NSArray<MXAppLaunchDiagnostic>;

	readonly cpuExceptionDiagnostics: NSArray<MXCPUExceptionDiagnostic>;

	readonly crashDiagnostics: NSArray<MXCrashDiagnostic>;

	readonly diskWriteExceptionDiagnostics: NSArray<MXDiskWriteExceptionDiagnostic>;

	readonly hangDiagnostics: NSArray<MXHangDiagnostic>;

	readonly timeStampBegin: Date;

	readonly timeStampEnd: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	JSONRepresentation(): NSData;

	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXDiskIOMetric extends MXMetric {

	static alloc(): MXDiskIOMetric; // inherited from NSObject

	static new(): MXDiskIOMetric; // inherited from NSObject

	readonly cumulativeLogicalWrites: NSMeasurement<NSUnitInformationStorage>;
}

/**
 * @since 14.0
 */
declare class MXDiskWriteExceptionDiagnostic extends MXDiagnostic {

	static alloc(): MXDiskWriteExceptionDiagnostic; // inherited from NSObject

	static new(): MXDiskWriteExceptionDiagnostic; // inherited from NSObject

	readonly callStackTree: MXCallStackTree;

	readonly totalWritesCaused: NSMeasurement<NSUnitInformationStorage>;
}

/**
 * @since 13.0
 */
declare class MXDisplayMetric extends MXMetric {

	static alloc(): MXDisplayMetric; // inherited from NSObject

	static new(): MXDisplayMetric; // inherited from NSObject

	readonly averagePixelLuminance: MXAverage<MXUnitAveragePixelLuminance>;
}

/**
 * @since 16.0
 */
declare const enum MXErrorCode {

	LaunchTaskInvalidID = 0,

	LaunchTaskMaxCount = 1,

	LaunchTaskPastDeadline = 2,

	LaunchTaskDuplicated = 3,

	LaunchTaskUnknown = 4,

	LaunchTaskInternalFailure = 5
}

/**
 * @since 16.0
 */
declare var MXErrorDomain: string;

/**
 * @since 14.0
 */
declare class MXForegroundExitData extends NSObject implements NSSecureCoding {

	static alloc(): MXForegroundExitData; // inherited from NSObject

	static new(): MXForegroundExitData; // inherited from NSObject

	readonly cumulativeAbnormalExitCount: number;

	readonly cumulativeAppWatchdogExitCount: number;

	readonly cumulativeBadAccessExitCount: number;

	readonly cumulativeIllegalInstructionExitCount: number;

	readonly cumulativeMemoryResourceLimitExitCount: number;

	readonly cumulativeNormalAppExitCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXGPUMetric extends MXMetric {

	static alloc(): MXGPUMetric; // inherited from NSObject

	static new(): MXGPUMetric; // inherited from NSObject

	readonly cumulativeGPUTime: NSMeasurement<NSUnitDuration>;
}

/**
 * @since 14.0
 */
declare class MXHangDiagnostic extends MXDiagnostic {

	static alloc(): MXHangDiagnostic; // inherited from NSObject

	static new(): MXHangDiagnostic; // inherited from NSObject

	readonly callStackTree: MXCallStackTree;

	readonly hangDuration: NSMeasurement<NSUnitDuration>;
}

/**
 * @since 13.0
 */
declare class MXHistogram<UnitType> extends NSObject implements NSSecureCoding {

	static alloc<UnitType>(): MXHistogram<UnitType>; // inherited from NSObject

	static new<UnitType>(): MXHistogram<UnitType>; // inherited from NSObject

	readonly bucketEnumerator: NSEnumerator<MXHistogramBucket<NSUnit>>;

	readonly totalBucketCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXHistogramBucket<UnitType> extends NSObject implements NSSecureCoding {

	static alloc<UnitType>(): MXHistogramBucket<UnitType>; // inherited from NSObject

	static new<UnitType>(): MXHistogramBucket<UnitType>; // inherited from NSObject

	readonly bucketCount: number;

	readonly bucketEnd: NSMeasurement<NSUnit>;

	readonly bucketStart: NSMeasurement<NSUnit>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXLocationActivityMetric extends MXMetric {

	static alloc(): MXLocationActivityMetric; // inherited from NSObject

	static new(): MXLocationActivityMetric; // inherited from NSObject

	readonly cumulativeBestAccuracyForNavigationTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeBestAccuracyTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeHundredMetersAccuracyTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeKilometerAccuracyTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeNearestTenMetersAccuracyTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeThreeKilometersAccuracyTime: NSMeasurement<NSUnitDuration>;
}

/**
 * @since 13.0
 */
declare class MXMemoryMetric extends MXMetric {

	static alloc(): MXMemoryMetric; // inherited from NSObject

	static new(): MXMemoryMetric; // inherited from NSObject

	readonly averageSuspendedMemory: MXAverage<NSUnitInformationStorage>;

	readonly peakMemoryUsage: NSMeasurement<NSUnitInformationStorage>;
}

/**
 * @since 13.0
 */
declare class MXMetaData extends NSObject implements NSSecureCoding {

	static alloc(): MXMetaData; // inherited from NSObject

	static new(): MXMetaData; // inherited from NSObject

	readonly applicationBuildVersion: string;

	readonly deviceType: string;

	/**
	 * @since 17.0
	 */
	readonly isTestFlightApp: boolean;

	/**
	 * @since 17.0
	 */
	readonly lowPowerModeEnabled: boolean;

	readonly osVersion: string;

	/**
	 * @since 17.0
	 */
	readonly pid: number;

	/**
	 * @since 14.0
	 */
	readonly platformArchitecture: string;

	readonly regionFormat: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	DictionaryRepresentation(): NSDictionary<any, any>;

	JSONRepresentation(): NSData;

	/**
	 * @since 14.0
	 */
	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXMetric extends NSObject implements NSSecureCoding {

	static alloc(): MXMetric; // inherited from NSObject

	static new(): MXMetric; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	DictionaryRepresentation(): NSDictionary<any, any>;

	JSONRepresentation(): NSData;

	/**
	 * @since 14.0
	 */
	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXMetricManager extends NSObject {

	static alloc(): MXMetricManager; // inherited from NSObject

	/**
	 * @since 16.0
	 */
	static extendLaunchMeasurementForTaskIDError(taskID: string): boolean;

	/**
	 * @since 16.0
	 */
	static finishExtendedLaunchMeasurementForTaskIDError(taskID: string): boolean;

	static makeLogHandleWithCategory(category: string): NSObject & OS_os_log;

	static new(): MXMetricManager; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly pastDiagnosticPayloads: NSArray<MXDiagnosticPayload>;

	readonly pastPayloads: NSArray<MXMetricPayload>;

	static readonly sharedManager: MXMetricManager;

	addSubscriber(subscriber: MXMetricManagerSubscriber): void;

	removeSubscriber(subscriber: MXMetricManagerSubscriber): void;
}

/**
 * @since 13.0
 */
interface MXMetricManagerSubscriber extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	didReceiveDiagnosticPayloads?(payloads: NSArray<MXDiagnosticPayload> | MXDiagnosticPayload[]): void;

	didReceiveMetricPayloads?(payloads: NSArray<MXMetricPayload> | MXMetricPayload[]): void;
}
declare var MXMetricManagerSubscriber: {

	prototype: MXMetricManagerSubscriber;
};

/**
 * @since 13.0
 */
declare class MXMetricPayload extends NSObject implements NSSecureCoding {

	static alloc(): MXMetricPayload; // inherited from NSObject

	static new(): MXMetricPayload; // inherited from NSObject

	/**
	 * @since 14.0
	 */
	readonly animationMetrics: MXAnimationMetric;

	/**
	 * @since 14.0
	 */
	readonly applicationExitMetrics: MXAppExitMetric;

	readonly applicationLaunchMetrics: MXAppLaunchMetric;

	readonly applicationResponsivenessMetrics: MXAppResponsivenessMetric;

	readonly applicationTimeMetrics: MXAppRunTimeMetric;

	readonly cellularConditionMetrics: MXCellularConditionMetric;

	readonly cpuMetrics: MXCPUMetric;

	readonly diskIOMetrics: MXDiskIOMetric;

	readonly displayMetrics: MXDisplayMetric;

	readonly gpuMetrics: MXGPUMetric;

	readonly includesMultipleApplicationVersions: boolean;

	readonly latestApplicationVersion: string;

	readonly locationActivityMetrics: MXLocationActivityMetric;

	readonly memoryMetrics: MXMemoryMetric;

	readonly metaData: MXMetaData;

	readonly networkTransferMetrics: MXNetworkTransferMetric;

	readonly signpostMetrics: NSArray<MXSignpostMetric>;

	readonly timeStampBegin: Date;

	readonly timeStampEnd: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 13.0
	 * @deprecated 100000
	 */
	DictionaryRepresentation(): NSDictionary<any, any>;

	JSONRepresentation(): NSData;

	/**
	 * @since 14.0
	 */
	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXNetworkTransferMetric extends MXMetric {

	static alloc(): MXNetworkTransferMetric; // inherited from NSObject

	static new(): MXNetworkTransferMetric; // inherited from NSObject

	readonly cumulativeCellularDownload: NSMeasurement<NSUnitInformationStorage>;

	readonly cumulativeCellularUpload: NSMeasurement<NSUnitInformationStorage>;

	readonly cumulativeWifiDownload: NSMeasurement<NSUnitInformationStorage>;

	readonly cumulativeWifiUpload: NSMeasurement<NSUnitInformationStorage>;
}

/**
 * @since 13.0
 */
declare class MXSignpostIntervalData extends NSObject implements NSSecureCoding {

	static alloc(): MXSignpostIntervalData; // inherited from NSObject

	static new(): MXSignpostIntervalData; // inherited from NSObject

	readonly averageMemory: MXAverage<NSUnitInformationStorage>;

	readonly cumulativeCPUTime: NSMeasurement<NSUnitDuration>;

	/**
	 * @since 15.0
	 */
	readonly cumulativeHitchTimeRatio: NSMeasurement<NSUnit>;

	readonly cumulativeLogicalWrites: NSMeasurement<NSUnitInformationStorage>;

	readonly histogrammedSignpostDuration: MXHistogram<NSUnitDuration>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXSignpostMetric extends MXMetric {

	static alloc(): MXSignpostMetric; // inherited from NSObject

	static new(): MXSignpostMetric; // inherited from NSObject

	readonly signpostCategory: string;

	readonly signpostIntervalData: MXSignpostIntervalData;

	readonly signpostName: string;

	readonly totalCount: number;
}

/**
 * @since 17.0
 */
declare class MXSignpostRecord extends NSObject implements NSSecureCoding {

	static alloc(): MXSignpostRecord; // inherited from NSObject

	static new(): MXSignpostRecord; // inherited from NSObject

	readonly beginTimeStamp: Date;

	readonly category: string;

	readonly duration: NSMeasurement<NSUnitDuration>;

	readonly endTimeStamp: Date;

	readonly isInterval: boolean;

	readonly name: string;

	readonly subsystem: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	JSONRepresentation(): NSData;

	dictionaryRepresentation(): NSDictionary<any, any>;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 13.0
 */
declare class MXUnitAveragePixelLuminance extends NSDimension {

	static alloc(): MXUnitAveragePixelLuminance; // inherited from NSObject

	static baseUnit(): MXUnitAveragePixelLuminance; // inherited from NSDimension

	static new(): MXUnitAveragePixelLuminance; // inherited from NSObject

	static readonly apl: MXUnitAveragePixelLuminance;
}

/**
 * @since 13.0
 */
declare class MXUnitSignalBars extends NSDimension {

	static alloc(): MXUnitSignalBars; // inherited from NSObject

	static baseUnit(): MXUnitSignalBars; // inherited from NSDimension

	static new(): MXUnitSignalBars; // inherited from NSObject

	static readonly bars: MXUnitSignalBars;
}
