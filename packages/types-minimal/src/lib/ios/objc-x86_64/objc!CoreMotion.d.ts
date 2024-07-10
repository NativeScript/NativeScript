
/**
 * @since 15.0
 */
declare class CMAbsoluteAltitudeData extends CMLogItem {

	static alloc(): CMAbsoluteAltitudeData; // inherited from NSObject

	static new(): CMAbsoluteAltitudeData; // inherited from NSObject

	readonly accuracy: number;

	readonly altitude: number;

	readonly precision: number;
}

interface CMAcceleration {
	x: number;
	y: number;
	z: number;
}
declare var CMAcceleration: interop.StructType<CMAcceleration>;

/**
 * @since 4.0
 */
declare class CMAccelerometerData extends CMLogItem {

	static alloc(): CMAccelerometerData; // inherited from NSObject

	static new(): CMAccelerometerData; // inherited from NSObject

	readonly acceleration: CMAcceleration;
}

/**
 * @since 8.0
 */
declare class CMAltimeter extends NSObject {

	static alloc(): CMAltimeter; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static authorizationStatus(): CMAuthorizationStatus;

	/**
	 * @since 15.0
	 */
	static isAbsoluteAltitudeAvailable(): boolean;

	static isRelativeAltitudeAvailable(): boolean;

	static new(): CMAltimeter; // inherited from NSObject

	/**
	 * @since 15.0
	 */
	startAbsoluteAltitudeUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMAbsoluteAltitudeData, p2: NSError) => void): void;

	startRelativeAltitudeUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMAltitudeData, p2: NSError) => void): void;

	/**
	 * @since 15.0
	 */
	stopAbsoluteAltitudeUpdates(): void;

	stopRelativeAltitudeUpdates(): void;
}

/**
 * @since 8.0
 */
declare class CMAltitudeData extends CMLogItem {

	static alloc(): CMAltitudeData; // inherited from NSObject

	static new(): CMAltitudeData; // inherited from NSObject

	readonly pressure: number;

	readonly relativeAltitude: number;
}

/**
 * @since 10.0
 */
declare class CMAmbientPressureData extends CMLogItem {

	static alloc(): CMAmbientPressureData; // inherited from NSObject

	static new(): CMAmbientPressureData; // inherited from NSObject

	readonly pressure: NSMeasurement<NSUnitPressure>;

	readonly temperature: NSMeasurement<NSUnitTemperature>;
}

/**
 * @since 4.0
 */
declare class CMAttitude extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMAttitude; // inherited from NSObject

	static new(): CMAttitude; // inherited from NSObject

	readonly pitch: number;

	readonly quaternion: CMQuaternion;

	readonly roll: number;

	readonly rotationMatrix: CMRotationMatrix;

	readonly yaw: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	multiplyByInverseOfAttitude(attitude: CMAttitude): void;
}

declare const enum CMAttitudeReferenceFrame {

	XArbitraryZVertical = 1,

	XArbitraryCorrectedZVertical = 2,

	XMagneticNorthZVertical = 4,

	XTrueNorthZVertical = 8
}

/**
 * @since 11.0
 */
declare const enum CMAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

declare class CMBatchedSensorManager extends NSObject {

	static alloc(): CMBatchedSensorManager; // inherited from NSObject

	static new(): CMBatchedSensorManager; // inherited from NSObject

	readonly accelerometerActive: boolean;

	readonly accelerometerBatch: NSArray<CMAccelerometerData>;

	readonly accelerometerDataFrequency: number;

	readonly deviceMotionActive: boolean;

	readonly deviceMotionBatch: NSArray<CMDeviceMotion>;

	readonly deviceMotionDataFrequency: number;

	static readonly accelerometerSupported: boolean;

	static readonly authorizationStatus: CMAuthorizationStatus;

	static readonly deviceMotionSupported: boolean;

	startAccelerometerUpdates(): void;

	startAccelerometerUpdatesWithHandler(handler: (p1: NSArray<CMAccelerometerData>, p2: NSError) => void): void;

	startDeviceMotionUpdates(): void;

	startDeviceMotionUpdatesWithHandler(handler: (p1: NSArray<CMDeviceMotion>, p2: NSError) => void): void;

	stopAccelerometerUpdates(): void;

	stopDeviceMotionUpdates(): void;
}

interface CMCalibratedMagneticField {
	field: CMMagneticField;
	accuracy: CMMagneticFieldCalibrationAccuracy;
}
declare var CMCalibratedMagneticField: interop.StructType<CMCalibratedMagneticField>;

/**
 * @since 4.0
 */
declare class CMDeviceMotion extends CMLogItem {

	static alloc(): CMDeviceMotion; // inherited from NSObject

	static new(): CMDeviceMotion; // inherited from NSObject

	readonly attitude: CMAttitude;

	readonly gravity: CMAcceleration;

	/**
	 * @since 11.0
	 */
	readonly heading: number;

	/**
	 * @since 5.0
	 */
	readonly magneticField: CMCalibratedMagneticField;

	readonly rotationRate: CMRotationRate;

	/**
	 * @since 14.0
	 */
	readonly sensorLocation: CMDeviceMotionSensorLocation;

	readonly userAcceleration: CMAcceleration;
}

declare const enum CMDeviceMotionSensorLocation {

	Default = 0,

	HeadphoneLeft = 1,

	HeadphoneRight = 2
}

/**
 * @since 12.0
 */
declare class CMDyskineticSymptomResult extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMDyskineticSymptomResult; // inherited from NSObject

	static new(): CMDyskineticSymptomResult; // inherited from NSObject

	readonly endDate: Date;

	readonly percentLikely: number;

	readonly percentUnlikely: number;

	readonly startDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CMError {

	NULL = 100,

	DeviceRequiresMovement = 101,

	TrueNorthNotAvailable = 102,

	Unknown = 103,

	MotionActivityNotAvailable = 104,

	MotionActivityNotAuthorized = 105,

	MotionActivityNotEntitled = 106,

	InvalidParameter = 107,

	InvalidAction = 108,

	NotAvailable = 109,

	NotEntitled = 110,

	NotAuthorized = 111,

	NilData = 112,

	Size = 113
}

/**
 * @since 4.0
 */
declare var CMErrorDomain: string;

declare const enum CMFallDetectionEventUserResolution {

	Confirmed = 0,

	Dismissed = 1,

	Rejected = 2,

	Unresponsive = 3
}

/**
 * @since 4.0
 */
declare class CMGyroData extends CMLogItem {

	static alloc(): CMGyroData; // inherited from NSObject

	static new(): CMGyroData; // inherited from NSObject

	readonly rotationRate: CMRotationRate;
}

/**
 * @since 18.0
 */
declare class CMHeadphoneActivityManager extends NSObject {

	static alloc(): CMHeadphoneActivityManager; // inherited from NSObject

	static authorizationStatus(): CMAuthorizationStatus;

	static new(): CMHeadphoneActivityManager; // inherited from NSObject

	readonly activityActive: boolean;

	readonly activityAvailable: boolean;

	readonly statusActive: boolean;

	readonly statusAvailable: boolean;

	startActivityUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMMotionActivity, p2: NSError) => void): void;

	startStatusUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMHeadphoneActivityStatus, p2: NSError) => void): void;

	stopActivityUpdates(): void;

	stopStatusUpdates(): void;
}

declare const enum CMHeadphoneActivityStatus {

	Disconnected = 0,

	Connected = 1
}

/**
 * @since 14.0
 */
declare class CMHeadphoneMotionManager extends NSObject {

	static alloc(): CMHeadphoneMotionManager; // inherited from NSObject

	static authorizationStatus(): CMAuthorizationStatus;

	static new(): CMHeadphoneMotionManager; // inherited from NSObject

	readonly connectionStatusActive: boolean;

	delegate: CMHeadphoneMotionManagerDelegate;

	readonly deviceMotion: CMDeviceMotion;

	readonly deviceMotionActive: boolean;

	readonly deviceMotionAvailable: boolean;

	startConnectionStatusUpdates(): void;

	startDeviceMotionUpdates(): void;

	startDeviceMotionUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMDeviceMotion, p2: NSError) => void): void;

	stopConnectionStatusUpdates(): void;

	stopDeviceMotionUpdates(): void;
}

/**
 * @since 14.0
 */
interface CMHeadphoneMotionManagerDelegate extends NSObjectProtocol {

	headphoneMotionManagerDidConnect?(manager: CMHeadphoneMotionManager): void;

	headphoneMotionManagerDidDisconnect?(manager: CMHeadphoneMotionManager): void;
}
declare var CMHeadphoneMotionManagerDelegate: {

	prototype: CMHeadphoneMotionManagerDelegate;
};

/**
 * @since 17.0
 */
declare class CMHighFrequencyHeartRateData extends CMLogItem {

	static alloc(): CMHighFrequencyHeartRateData; // inherited from NSObject

	static new(): CMHighFrequencyHeartRateData; // inherited from NSObject

	readonly confidence: CMHighFrequencyHeartRateDataConfidence;

	readonly date: Date;

	readonly heartRate: number;
}

/**
 * @since 17.0
 */
declare const enum CMHighFrequencyHeartRateDataConfidence {

	Low = 0,

	Medium = 1,

	High = 2,

	Highest = 3
}

/**
 * @since 4.0
 */
declare class CMLogItem extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMLogItem; // inherited from NSObject

	static new(): CMLogItem; // inherited from NSObject

	readonly timestamp: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

interface CMMagneticField {
	x: number;
	y: number;
	z: number;
}
declare var CMMagneticField: interop.StructType<CMMagneticField>;

declare const enum CMMagneticFieldCalibrationAccuracy {

	Uncalibrated = -1,

	Low = 0,

	Medium = 1,

	High = 2
}

/**
 * @since 5.0
 */
declare class CMMagnetometerData extends CMLogItem {

	static alloc(): CMMagnetometerData; // inherited from NSObject

	static new(): CMMagnetometerData; // inherited from NSObject

	readonly magneticField: CMMagneticField;
}

/**
 * @since 7.0
 */
declare class CMMotionActivity extends CMLogItem {

	static alloc(): CMMotionActivity; // inherited from NSObject

	static new(): CMMotionActivity; // inherited from NSObject

	readonly automotive: boolean;

	readonly confidence: CMMotionActivityConfidence;

	/**
	 * @since 8.0
	 */
	readonly cycling: boolean;

	readonly running: boolean;

	readonly startDate: Date;

	readonly stationary: boolean;

	readonly unknown: boolean;

	readonly walking: boolean;
}

declare const enum CMMotionActivityConfidence {

	Low = 0,

	Medium = 1,

	High = 2
}

/**
 * @since 7.0
 */
declare class CMMotionActivityManager extends NSObject {

	static alloc(): CMMotionActivityManager; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static authorizationStatus(): CMAuthorizationStatus;

	static isActivityAvailable(): boolean;

	static new(): CMMotionActivityManager; // inherited from NSObject

	queryActivityStartingFromDateToDateToQueueWithHandler(start: Date, end: Date, queue: NSOperationQueue, handler: (p1: NSArray<CMMotionActivity>, p2: NSError) => void): void;

	startActivityUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMMotionActivity) => void): void;

	stopActivityUpdates(): void;
}

/**
 * @since 4.0
 */
declare class CMMotionManager extends NSObject {

	static alloc(): CMMotionManager; // inherited from NSObject

	/**
	 * @since 5.0
	 */
	static availableAttitudeReferenceFrames(): CMAttitudeReferenceFrame;

	static new(): CMMotionManager; // inherited from NSObject

	readonly accelerometerActive: boolean;

	readonly accelerometerAvailable: boolean;

	readonly accelerometerData: CMAccelerometerData;

	accelerometerUpdateInterval: number;

	/**
	 * @since 5.0
	 */
	readonly attitudeReferenceFrame: CMAttitudeReferenceFrame;

	readonly deviceMotion: CMDeviceMotion;

	readonly deviceMotionActive: boolean;

	readonly deviceMotionAvailable: boolean;

	deviceMotionUpdateInterval: number;

	readonly gyroActive: boolean;

	readonly gyroAvailable: boolean;

	readonly gyroData: CMGyroData;

	gyroUpdateInterval: number;

	/**
	 * @since 5.0
	 */
	readonly magnetometerActive: boolean;

	/**
	 * @since 5.0
	 */
	readonly magnetometerAvailable: boolean;

	/**
	 * @since 5.0
	 */
	readonly magnetometerData: CMMagnetometerData;

	/**
	 * @since 5.0
	 */
	magnetometerUpdateInterval: number;

	/**
	 * @since 5.0
	 */
	showsDeviceMovementDisplay: boolean;

	startAccelerometerUpdates(): void;

	startAccelerometerUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMAccelerometerData, p2: NSError) => void): void;

	startDeviceMotionUpdates(): void;

	startDeviceMotionUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMDeviceMotion, p2: NSError) => void): void;

	/**
	 * @since 5.0
	 */
	startDeviceMotionUpdatesUsingReferenceFrame(referenceFrame: CMAttitudeReferenceFrame): void;

	/**
	 * @since 5.0
	 */
	startDeviceMotionUpdatesUsingReferenceFrameToQueueWithHandler(referenceFrame: CMAttitudeReferenceFrame, queue: NSOperationQueue, handler: (p1: CMDeviceMotion, p2: NSError) => void): void;

	startGyroUpdates(): void;

	startGyroUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMGyroData, p2: NSError) => void): void;

	/**
	 * @since 5.0
	 */
	startMagnetometerUpdates(): void;

	/**
	 * @since 5.0
	 */
	startMagnetometerUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMMagnetometerData, p2: NSError) => void): void;

	stopAccelerometerUpdates(): void;

	stopDeviceMotionUpdates(): void;

	stopGyroUpdates(): void;

	/**
	 * @since 5.0
	 */
	stopMagnetometerUpdates(): void;
}

/**
 * @since 8.0
 */
declare class CMOdometerData extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMOdometerData; // inherited from NSObject

	static new(): CMOdometerData; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	readonly deltaAltitude: number;

	/**
	 * @since 17.0
	 */
	readonly deltaDistance: number;

	/**
	 * @since 17.0
	 */
	readonly deltaDistanceAccuracy: number;

	readonly endDate: Date;

	/**
	 * @since 17.0
	 */
	readonly gpsDate: Date;

	/**
	 * @since 15.4
	 */
	readonly maxAbsSlope: number;

	/**
	 * @since 15.4
	 */
	readonly originDevice: CMOdometerOriginDevice;

	/**
	 * @since 15.4
	 */
	readonly slope: number;

	/**
	 * @since 17.0
	 */
	readonly speed: number;

	/**
	 * @since 17.0
	 */
	readonly speedAccuracy: number;

	readonly startDate: Date;

	/**
	 * @since 17.0
	 */
	readonly verticalAccuracy: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 15.4
 */
declare const enum CMOdometerOriginDevice {

	Unknown = 0,

	Local = 1,

	Remote = 2
}

/**
 * @since 8.0
 */
declare class CMPedometer extends NSObject {

	static alloc(): CMPedometer; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static authorizationStatus(): CMAuthorizationStatus;

	/**
	 * @since 9.0
	 */
	static isCadenceAvailable(): boolean;

	static isDistanceAvailable(): boolean;

	static isFloorCountingAvailable(): boolean;

	/**
	 * @since 9.0
	 */
	static isPaceAvailable(): boolean;

	/**
	 * @since 10.0
	 */
	static isPedometerEventTrackingAvailable(): boolean;

	static isStepCountingAvailable(): boolean;

	static new(): CMPedometer; // inherited from NSObject

	queryPedometerDataFromDateToDateWithHandler(start: Date, end: Date, handler: (p1: CMPedometerData, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	startPedometerEventUpdatesWithHandler(handler: (p1: CMPedometerEvent, p2: NSError) => void): void;

	startPedometerUpdatesFromDateWithHandler(start: Date, handler: (p1: CMPedometerData, p2: NSError) => void): void;

	/**
	 * @since 10.0
	 */
	stopPedometerEventUpdates(): void;

	stopPedometerUpdates(): void;
}

/**
 * @since 8.0
 */
declare class CMPedometerData extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMPedometerData; // inherited from NSObject

	static new(): CMPedometerData; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	readonly averageActivePace: number;

	/**
	 * @since 9.0
	 */
	readonly currentCadence: number;

	/**
	 * @since 9.0
	 */
	readonly currentPace: number;

	readonly distance: number;

	readonly endDate: Date;

	readonly floorsAscended: number;

	readonly floorsDescended: number;

	readonly numberOfSteps: number;

	readonly startDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare class CMPedometerEvent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMPedometerEvent; // inherited from NSObject

	static new(): CMPedometerEvent; // inherited from NSObject

	readonly date: Date;

	readonly type: CMPedometerEventType;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 10.0
 */
declare const enum CMPedometerEventType {

	Pause = 0,

	Resume = 1
}

interface CMQuaternion {
	x: number;
	y: number;
	z: number;
	w: number;
}
declare var CMQuaternion: interop.StructType<CMQuaternion>;

/**
 * @since 9.0
 */
declare class CMRecordedAccelerometerData extends CMAccelerometerData {

	static alloc(): CMRecordedAccelerometerData; // inherited from NSObject

	static new(): CMRecordedAccelerometerData; // inherited from NSObject

	readonly identifier: number;

	readonly startDate: Date;
}

/**
 * @since 12.0
 */
declare class CMRecordedPressureData extends CMAmbientPressureData {

	static alloc(): CMRecordedPressureData; // inherited from NSObject

	static new(): CMRecordedPressureData; // inherited from NSObject

	readonly identifier: number;

	readonly startDate: Date;
}

/**
 * @since 14.0
 */
declare class CMRecordedRotationRateData extends CMRotationRateData {

	static alloc(): CMRecordedRotationRateData; // inherited from NSObject

	static new(): CMRecordedRotationRateData; // inherited from NSObject

	readonly startDate: Date;
}

interface CMRotationMatrix {
	m11: number;
	m12: number;
	m13: number;
	m21: number;
	m22: number;
	m23: number;
	m31: number;
	m32: number;
	m33: number;
}
declare var CMRotationMatrix: interop.StructType<CMRotationMatrix>;

interface CMRotationRate {
	x: number;
	y: number;
	z: number;
}
declare var CMRotationRate: interop.StructType<CMRotationRate>;

/**
 * @since 14.0
 */
declare class CMRotationRateData extends CMLogItem {

	static alloc(): CMRotationRateData; // inherited from NSObject

	static new(): CMRotationRateData; // inherited from NSObject

	readonly rotationRate: CMRotationRate;
}

/**
 * @since 9.0
 */
declare class CMSensorDataList extends NSObject implements NSFastEnumeration {

	static alloc(): CMSensorDataList; // inherited from NSObject

	static new(): CMSensorDataList; // inherited from NSObject
	[Symbol.iterator](): Iterator<any>;
}

/**
 * @since 9.0
 */
declare class CMSensorRecorder extends NSObject {

	static alloc(): CMSensorRecorder; // inherited from NSObject

	/**
	 * @since 11.0
	 */
	static authorizationStatus(): CMAuthorizationStatus;

	static isAccelerometerRecordingAvailable(): boolean;

	/**
	 * @since 9.0
	 * @deprecated 11.0
	 */
	static isAuthorizedForRecording(): boolean;

	static new(): CMSensorRecorder; // inherited from NSObject

	accelerometerDataFromDateToDate(fromDate: Date, toDate: Date): CMSensorDataList;

	recordAccelerometerForDuration(duration: number): void;
}

/**
 * @since 7.0
 * @deprecated 8.0
 */
declare class CMStepCounter extends NSObject {

	static alloc(): CMStepCounter; // inherited from NSObject

	static isStepCountingAvailable(): boolean;

	static new(): CMStepCounter; // inherited from NSObject

	queryStepCountStartingFromToToQueueWithHandler(start: Date, end: Date, queue: NSOperationQueue, handler: (p1: number, p2: NSError) => void): void;

	startStepCountingUpdatesToQueueUpdateOnWithHandler(queue: NSOperationQueue, stepCounts: number, handler: (p1: number, p2: Date, p3: NSError) => void): void;

	stopStepCountingUpdates(): void;
}

/**
 * @since 12.0
 */
declare class CMTremorResult extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMTremorResult; // inherited from NSObject

	static new(): CMTremorResult; // inherited from NSObject

	readonly endDate: Date;

	readonly percentMild: number;

	readonly percentModerate: number;

	readonly percentNone: number;

	readonly percentSlight: number;

	readonly percentStrong: number;

	readonly percentUnknown: number;

	readonly startDate: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CMWaterSubmersionDepthState {

	Unknown = 0,

	NotSubmerged = 100,

	SubmergedShallow = 200,

	SubmergedDeep = 300,

	ApproachingMaxDepth = 400,

	PastMaxDepth = 500,

	SensorDepthError = 600
}

/**
 * @since 16.0
 */
declare class CMWaterSubmersionEvent extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMWaterSubmersionEvent; // inherited from NSObject

	static new(): CMWaterSubmersionEvent; // inherited from NSObject

	readonly date: Date;

	readonly state: CMWaterSubmersionState;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 16.0
 */
declare class CMWaterSubmersionManager extends NSObject {

	static alloc(): CMWaterSubmersionManager; // inherited from NSObject

	static new(): CMWaterSubmersionManager; // inherited from NSObject

	delegate: CMWaterSubmersionManagerDelegate;

	readonly maximumDepth: NSMeasurement<NSUnitLength>;

	static readonly authorizationStatus: CMAuthorizationStatus;

	static readonly waterSubmersionAvailable: boolean;
}

/**
 * @since 16.0
 */
interface CMWaterSubmersionManagerDelegate extends NSObjectProtocol {

	managerDidUpdateEvent(manager: CMWaterSubmersionManager, event: CMWaterSubmersionEvent): void;

	managerDidUpdateMeasurement(manager: CMWaterSubmersionManager, measurement: CMWaterSubmersionMeasurement): void;

	managerDidUpdateTemperature(manager: CMWaterSubmersionManager, measurement: CMWaterTemperature): void;

	managerErrorOccurred(manager: CMWaterSubmersionManager, error: NSError): void;
}
declare var CMWaterSubmersionManagerDelegate: {

	prototype: CMWaterSubmersionManagerDelegate;
};

/**
 * @since 16.0
 */
declare class CMWaterSubmersionMeasurement extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMWaterSubmersionMeasurement; // inherited from NSObject

	static new(): CMWaterSubmersionMeasurement; // inherited from NSObject

	readonly date: Date;

	readonly depth: NSMeasurement<NSUnitLength>;

	readonly pressure: NSMeasurement<NSUnitPressure>;

	readonly submersionState: CMWaterSubmersionDepthState;

	readonly surfacePressure: NSMeasurement<NSUnitPressure>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CMWaterSubmersionState {

	Unknown = 0,

	NotSubmerged = 1,

	Submerged = 2
}

/**
 * @since 16.0
 */
declare class CMWaterTemperature extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMWaterTemperature; // inherited from NSObject

	static new(): CMWaterTemperature; // inherited from NSObject

	readonly date: Date;

	readonly temperature: NSMeasurement<NSUnitTemperature>;

	readonly temperatureUncertainty: NSMeasurement<NSUnitTemperature>;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}
