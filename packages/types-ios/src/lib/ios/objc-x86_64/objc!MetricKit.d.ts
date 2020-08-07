
declare class MXAppLaunchMetric extends MXMetric {

	static alloc(): MXAppLaunchMetric; // inherited from NSObject

	static new(): MXAppLaunchMetric; // inherited from NSObject

	readonly histogrammedApplicationResumeTime: MXHistogram<NSUnitDuration>;

	readonly histogrammedTimeToFirstDraw: MXHistogram<NSUnitDuration>;
}

declare class MXAppResponsivenessMetric extends MXMetric {

	static alloc(): MXAppResponsivenessMetric; // inherited from NSObject

	static new(): MXAppResponsivenessMetric; // inherited from NSObject

	readonly histogrammedApplicationHangTime: MXHistogram<NSUnitDuration>;
}

declare class MXAppRunTimeMetric extends MXMetric {

	static alloc(): MXAppRunTimeMetric; // inherited from NSObject

	static new(): MXAppRunTimeMetric; // inherited from NSObject

	readonly cumulativeBackgroundAudioTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeBackgroundLocationTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeBackgroundTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeForegroundTime: NSMeasurement<NSUnitDuration>;
}

declare class MXAverage<UnitType> extends NSObject implements NSSecureCoding {

	static alloc<UnitType>(): MXAverage<UnitType>; // inherited from NSObject

	static new<UnitType>(): MXAverage<UnitType>; // inherited from NSObject

	readonly averageMeasurement: NSMeasurement<UnitType>;

	readonly sampleCount: number;

	readonly standardDeviation: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MXCPUMetric extends MXMetric {

	static alloc(): MXCPUMetric; // inherited from NSObject

	static new(): MXCPUMetric; // inherited from NSObject

	readonly cumulativeCPUTime: NSMeasurement<NSUnitDuration>;
}

declare class MXCellularConditionMetric extends MXMetric {

	static alloc(): MXCellularConditionMetric; // inherited from NSObject

	static new(): MXCellularConditionMetric; // inherited from NSObject

	readonly histogrammedCellularConditionTime: MXHistogram<MXUnitSignalBars>;
}

declare class MXDiskIOMetric extends MXMetric {

	static alloc(): MXDiskIOMetric; // inherited from NSObject

	static new(): MXDiskIOMetric; // inherited from NSObject

	readonly cumulativeLogicalWrites: NSMeasurement<NSUnitInformationStorage>;
}

declare class MXDisplayMetric extends MXMetric {

	static alloc(): MXDisplayMetric; // inherited from NSObject

	static new(): MXDisplayMetric; // inherited from NSObject

	readonly averagePixelLuminance: MXAverage<MXUnitAveragePixelLuminance>;
}

declare class MXGPUMetric extends MXMetric {

	static alloc(): MXGPUMetric; // inherited from NSObject

	static new(): MXGPUMetric; // inherited from NSObject

	readonly cumulativeGPUTime: NSMeasurement<NSUnitDuration>;
}

declare class MXHistogram<UnitType> extends NSObject implements NSSecureCoding {

	static alloc<UnitType>(): MXHistogram<UnitType>; // inherited from NSObject

	static new<UnitType>(): MXHistogram<UnitType>; // inherited from NSObject

	readonly bucketEnumerator: NSEnumerator<MXHistogramBucket<UnitType>>;

	readonly totalBucketCount: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MXHistogramBucket<UnitType> extends NSObject implements NSSecureCoding {

	static alloc<UnitType>(): MXHistogramBucket<UnitType>; // inherited from NSObject

	static new<UnitType>(): MXHistogramBucket<UnitType>; // inherited from NSObject

	readonly bucketCount: number;

	readonly bucketEnd: NSMeasurement<UnitType>;

	readonly bucketStart: NSMeasurement<UnitType>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

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

declare class MXMemoryMetric extends MXMetric {

	static alloc(): MXMemoryMetric; // inherited from NSObject

	static new(): MXMemoryMetric; // inherited from NSObject

	readonly averageSuspendedMemory: MXAverage<NSUnitInformationStorage>;

	readonly peakMemoryUsage: NSMeasurement<NSUnitInformationStorage>;
}

declare class MXMetaData extends NSObject implements NSSecureCoding {

	static alloc(): MXMetaData; // inherited from NSObject

	static new(): MXMetaData; // inherited from NSObject

	readonly applicationBuildVersion: string;

	readonly deviceType: string;

	readonly osVersion: string;

	readonly regionFormat: string;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	DictionaryRepresentation(): NSDictionary<any, any>;

	JSONRepresentation(): NSData;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MXMetric extends NSObject implements NSSecureCoding {

	static alloc(): MXMetric; // inherited from NSObject

	static new(): MXMetric; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	DictionaryRepresentation(): NSDictionary<any, any>;

	JSONRepresentation(): NSData;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MXMetricManager extends NSObject {

	static alloc(): MXMetricManager; // inherited from NSObject

	static makeLogHandleWithCategory(category: string): NSObject;

	static new(): MXMetricManager; // inherited from NSObject

	readonly pastPayloads: NSArray<MXMetricPayload>;

	static readonly sharedManager: MXMetricManager;

	addSubscriber(subscriber: MXMetricManagerSubscriber): void;

	removeSubscriber(subscriber: MXMetricManagerSubscriber): void;
}

interface MXMetricManagerSubscriber extends NSObjectProtocol {

	didReceiveMetricPayloads(payloads: NSArray<MXMetricPayload> | MXMetricPayload[]): void;
}
declare var MXMetricManagerSubscriber: {

	prototype: MXMetricManagerSubscriber;
};

declare class MXMetricPayload extends NSObject implements NSSecureCoding {

	static alloc(): MXMetricPayload; // inherited from NSObject

	static new(): MXMetricPayload; // inherited from NSObject

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

	DictionaryRepresentation(): NSDictionary<any, any>;

	JSONRepresentation(): NSData;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MXNetworkTransferMetric extends MXMetric {

	static alloc(): MXNetworkTransferMetric; // inherited from NSObject

	static new(): MXNetworkTransferMetric; // inherited from NSObject

	readonly cumulativeCellularDownload: NSMeasurement<NSUnitInformationStorage>;

	readonly cumulativeCellularUpload: NSMeasurement<NSUnitInformationStorage>;

	readonly cumulativeWifiDownload: NSMeasurement<NSUnitInformationStorage>;

	readonly cumulativeWifiUpload: NSMeasurement<NSUnitInformationStorage>;
}

declare class MXSignpostIntervalData extends NSObject implements NSSecureCoding {

	static alloc(): MXSignpostIntervalData; // inherited from NSObject

	static new(): MXSignpostIntervalData; // inherited from NSObject

	readonly averageMemory: MXAverage<NSUnitInformationStorage>;

	readonly cumulativeCPUTime: NSMeasurement<NSUnitDuration>;

	readonly cumulativeLogicalWrites: NSMeasurement<NSUnitInformationStorage>;

	readonly histogrammedSignpostDuration: MXHistogram<NSUnitDuration>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare class MXSignpostMetric extends MXMetric {

	static alloc(): MXSignpostMetric; // inherited from NSObject

	static new(): MXSignpostMetric; // inherited from NSObject

	readonly signpostCategory: string;

	readonly signpostIntervalData: MXSignpostIntervalData;

	readonly signpostName: string;

	readonly totalCount: number;
}

declare class MXUnitAveragePixelLuminance extends NSDimension {

	static alloc(): MXUnitAveragePixelLuminance; // inherited from NSObject

	static baseUnit(): MXUnitAveragePixelLuminance; // inherited from NSDimension

	static new(): MXUnitAveragePixelLuminance; // inherited from NSObject

	static readonly apl: MXUnitAveragePixelLuminance;
}

declare class MXUnitSignalBars extends NSDimension {

	static alloc(): MXUnitSignalBars; // inherited from NSObject

	static baseUnit(): MXUnitSignalBars; // inherited from NSDimension

	static new(): MXUnitSignalBars; // inherited from NSObject

	static readonly bars: MXUnitSignalBars;
}
