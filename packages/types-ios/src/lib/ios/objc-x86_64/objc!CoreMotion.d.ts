
interface CMAcceleration {
	x: number;
	y: number;
	z: number;
}
declare var CMAcceleration: interop.StructType<CMAcceleration>;

declare class CMAccelerometerData extends CMLogItem {

	static alloc(): CMAccelerometerData; // inherited from NSObject

	static new(): CMAccelerometerData; // inherited from NSObject

	readonly acceleration: CMAcceleration;
}

declare class CMAltimeter extends NSObject {

	static alloc(): CMAltimeter; // inherited from NSObject

	static authorizationStatus(): CMAuthorizationStatus;

	static isRelativeAltitudeAvailable(): boolean;

	static new(): CMAltimeter; // inherited from NSObject

	startRelativeAltitudeUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMAltitudeData, p2: NSError) => void): void;

	stopRelativeAltitudeUpdates(): void;
}

declare class CMAltitudeData extends CMLogItem {

	static alloc(): CMAltitudeData; // inherited from NSObject

	static new(): CMAltitudeData; // inherited from NSObject

	readonly pressure: number;

	readonly relativeAltitude: number;
}

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

declare const enum CMAuthorizationStatus {

	NotDetermined = 0,

	Restricted = 1,

	Denied = 2,

	Authorized = 3
}

interface CMCalibratedMagneticField {
	field: CMMagneticField;
	accuracy: CMMagneticFieldCalibrationAccuracy;
}
declare var CMCalibratedMagneticField: interop.StructType<CMCalibratedMagneticField>;

declare class CMDeviceMotion extends CMLogItem {

	static alloc(): CMDeviceMotion; // inherited from NSObject

	static new(): CMDeviceMotion; // inherited from NSObject

	readonly attitude: CMAttitude;

	readonly gravity: CMAcceleration;

	readonly heading: number;

	readonly magneticField: CMCalibratedMagneticField;

	readonly rotationRate: CMRotationRate;

	readonly userAcceleration: CMAcceleration;
}

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

	NotAuthorized = 111
}

declare var CMErrorDomain: string;

declare class CMGyroData extends CMLogItem {

	static alloc(): CMGyroData; // inherited from NSObject

	static new(): CMGyroData; // inherited from NSObject

	readonly rotationRate: CMRotationRate;
}

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

declare class CMMagnetometerData extends CMLogItem {

	static alloc(): CMMagnetometerData; // inherited from NSObject

	static new(): CMMagnetometerData; // inherited from NSObject

	readonly magneticField: CMMagneticField;
}

declare class CMMotionActivity extends CMLogItem {

	static alloc(): CMMotionActivity; // inherited from NSObject

	static new(): CMMotionActivity; // inherited from NSObject

	readonly automotive: boolean;

	readonly confidence: CMMotionActivityConfidence;

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

declare class CMMotionActivityManager extends NSObject {

	static alloc(): CMMotionActivityManager; // inherited from NSObject

	static authorizationStatus(): CMAuthorizationStatus;

	static isActivityAvailable(): boolean;

	static new(): CMMotionActivityManager; // inherited from NSObject

	queryActivityStartingFromDateToDateToQueueWithHandler(start: Date, end: Date, queue: NSOperationQueue, handler: (p1: NSArray<CMMotionActivity>, p2: NSError) => void): void;

	startActivityUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMMotionActivity) => void): void;

	stopActivityUpdates(): void;
}

declare class CMMotionManager extends NSObject {

	static alloc(): CMMotionManager; // inherited from NSObject

	static availableAttitudeReferenceFrames(): CMAttitudeReferenceFrame;

	static new(): CMMotionManager; // inherited from NSObject

	readonly accelerometerActive: boolean;

	readonly accelerometerAvailable: boolean;

	readonly accelerometerData: CMAccelerometerData;

	accelerometerUpdateInterval: number;

	readonly attitudeReferenceFrame: CMAttitudeReferenceFrame;

	readonly deviceMotion: CMDeviceMotion;

	readonly deviceMotionActive: boolean;

	readonly deviceMotionAvailable: boolean;

	deviceMotionUpdateInterval: number;

	readonly gyroActive: boolean;

	readonly gyroAvailable: boolean;

	readonly gyroData: CMGyroData;

	gyroUpdateInterval: number;

	readonly magnetometerActive: boolean;

	readonly magnetometerAvailable: boolean;

	readonly magnetometerData: CMMagnetometerData;

	magnetometerUpdateInterval: number;

	showsDeviceMovementDisplay: boolean;

	startAccelerometerUpdates(): void;

	startAccelerometerUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMAccelerometerData, p2: NSError) => void): void;

	startDeviceMotionUpdates(): void;

	startDeviceMotionUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMDeviceMotion, p2: NSError) => void): void;

	startDeviceMotionUpdatesUsingReferenceFrame(referenceFrame: CMAttitudeReferenceFrame): void;

	startDeviceMotionUpdatesUsingReferenceFrameToQueueWithHandler(referenceFrame: CMAttitudeReferenceFrame, queue: NSOperationQueue, handler: (p1: CMDeviceMotion, p2: NSError) => void): void;

	startGyroUpdates(): void;

	startGyroUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMGyroData, p2: NSError) => void): void;

	startMagnetometerUpdates(): void;

	startMagnetometerUpdatesToQueueWithHandler(queue: NSOperationQueue, handler: (p1: CMMagnetometerData, p2: NSError) => void): void;

	stopAccelerometerUpdates(): void;

	stopDeviceMotionUpdates(): void;

	stopGyroUpdates(): void;

	stopMagnetometerUpdates(): void;
}

declare class CMPedometer extends NSObject {

	static alloc(): CMPedometer; // inherited from NSObject

	static authorizationStatus(): CMAuthorizationStatus;

	static isCadenceAvailable(): boolean;

	static isDistanceAvailable(): boolean;

	static isFloorCountingAvailable(): boolean;

	static isPaceAvailable(): boolean;

	static isPedometerEventTrackingAvailable(): boolean;

	static isStepCountingAvailable(): boolean;

	static new(): CMPedometer; // inherited from NSObject

	queryPedometerDataFromDateToDateWithHandler(start: Date, end: Date, handler: (p1: CMPedometerData, p2: NSError) => void): void;

	startPedometerEventUpdatesWithHandler(handler: (p1: CMPedometerEvent, p2: NSError) => void): void;

	startPedometerUpdatesFromDateWithHandler(start: Date, handler: (p1: CMPedometerData, p2: NSError) => void): void;

	stopPedometerEventUpdates(): void;

	stopPedometerUpdates(): void;
}

declare class CMPedometerData extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CMPedometerData; // inherited from NSObject

	static new(): CMPedometerData; // inherited from NSObject

	readonly averageActivePace: number;

	readonly currentCadence: number;

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

declare class CMRecordedAccelerometerData extends CMAccelerometerData {

	static alloc(): CMRecordedAccelerometerData; // inherited from NSObject

	static new(): CMRecordedAccelerometerData; // inherited from NSObject

	readonly identifier: number;

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

declare class CMSensorDataList extends NSObject implements NSFastEnumeration {

	static alloc(): CMSensorDataList; // inherited from NSObject

	static new(): CMSensorDataList; // inherited from NSObject
	[Symbol.iterator](): Iterator<any>;
}

declare class CMSensorRecorder extends NSObject {

	static alloc(): CMSensorRecorder; // inherited from NSObject

	static authorizationStatus(): CMAuthorizationStatus;

	static isAccelerometerRecordingAvailable(): boolean;

	static isAuthorizedForRecording(): boolean;

	static new(): CMSensorRecorder; // inherited from NSObject

	accelerometerDataFromDateToDate(fromDate: Date, toDate: Date): CMSensorDataList;

	recordAccelerometerForDuration(duration: number): void;
}

declare class CMStepCounter extends NSObject {

	static alloc(): CMStepCounter; // inherited from NSObject

	static isStepCountingAvailable(): boolean;

	static new(): CMStepCounter; // inherited from NSObject

	queryStepCountStartingFromToToQueueWithHandler(start: Date, end: Date, queue: NSOperationQueue, handler: (p1: number, p2: NSError) => void): void;

	startStepCountingUpdatesToQueueUpdateOnWithHandler(queue: NSOperationQueue, stepCounts: number, handler: (p1: number, p2: Date, p3: NSError) => void): void;

	stopStepCountingUpdates(): void;
}

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
