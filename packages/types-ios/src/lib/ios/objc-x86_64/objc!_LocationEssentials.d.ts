
/**
 * @since 8.0
 */
declare class CLFloor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLFloor; // inherited from NSObject

	static new(): CLFloor; // inherited from NSObject

	readonly level: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 2.0
 */
declare class CLLocation extends NSObject implements CKRecordValue, NSCopying, NSSecureCoding {

	static alloc(): CLLocation; // inherited from NSObject

	static new(): CLLocation; // inherited from NSObject

	readonly altitude: number;

	readonly coordinate: CLLocationCoordinate2D;

	/**
	 * @since 2.2
	 */
	readonly course: number;

	/**
	 * @since 13.4
	 */
	readonly courseAccuracy: number;

	/**
	 * @since 15
	 */
	readonly ellipsoidalAltitude: number;

	/**
	 * @since 8.0
	 */
	readonly floor: CLFloor;

	readonly horizontalAccuracy: number;

	/**
	 * @since 15.0
	 */
	readonly sourceInformation: CLLocationSourceInformation;

	/**
	 * @since 2.2
	 */
	readonly speed: number;

	/**
	 * @since 10.0
	 */
	readonly speedAccuracy: number;

	readonly timestamp: Date;

	readonly verticalAccuracy: number;

	readonly debugDescription: string; // inherited from NSObjectProtocol

	readonly description: string; // inherited from NSObjectProtocol

	readonly hash: number; // inherited from NSObjectProtocol

	readonly isProxy: boolean; // inherited from NSObjectProtocol

	readonly superclass: typeof NSObject; // inherited from NSObjectProtocol

	readonly  // inherited from NSObjectProtocol

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 13.4
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; altitude: number; horizontalAccuracy: number; verticalAccuracy: number; course: number; courseAccuracy: number; speed: number; speedAccuracy: number; timestamp: Date; });

	/**
	 * @since 15.0
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; altitude: number; horizontalAccuracy: number; verticalAccuracy: number; course: number; courseAccuracy: number; speed: number; speedAccuracy: number; timestamp: Date; sourceInfo: CLLocationSourceInformation; });

	/**
	 * @since 4.2
	 */
	constructor(o: { coordinate: CLLocationCoordinate2D; altitude: number; horizontalAccuracy: number; verticalAccuracy: number; course: number; speed: number; timestamp: Date; });

	constructor(o: { coordinate: CLLocationCoordinate2D; altitude: number; horizontalAccuracy: number; verticalAccuracy: number; timestamp: Date; });

	constructor(o: { latitude: number; longitude: number; });

	class(): typeof NSObject;

	conformsToProtocol(aProtocol: any /* Protocol */): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	/**
	 * @since 3.2
	 */
	distanceFromLocation(location: CLLocation): number;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 2.0
	 * @deprecated 3.2
	 */
	getDistanceFrom(location: CLLocation): number;

	initWithCoder(coder: NSCoder): this;

	/**
	 * @since 13.4
	 */
	initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseCourseAccuracySpeedSpeedAccuracyTimestamp(coordinate: CLLocationCoordinate2D, altitude: number, hAccuracy: number, vAccuracy: number, course: number, courseAccuracy: number, speed: number, speedAccuracy: number, timestamp: Date): this;

	/**
	 * @since 15.0
	 */
	initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseCourseAccuracySpeedSpeedAccuracyTimestampSourceInfo(coordinate: CLLocationCoordinate2D, altitude: number, hAccuracy: number, vAccuracy: number, course: number, courseAccuracy: number, speed: number, speedAccuracy: number, timestamp: Date, sourceInfo: CLLocationSourceInformation): this;

	/**
	 * @since 4.2
	 */
	initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseSpeedTimestamp(coordinate: CLLocationCoordinate2D, altitude: number, hAccuracy: number, vAccuracy: number, course: number, speed: number, timestamp: Date): this;

	initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyTimestamp(coordinate: CLLocationCoordinate2D, altitude: number, hAccuracy: number, vAccuracy: number, timestamp: Date): this;

	initWithLatitudeLongitude(latitude: number, longitude: number): this;

	isEqual(object: any): boolean;

	isKindOfClass(aClass: typeof NSObject): boolean;

	isMemberOfClass(aClass: typeof NSObject): boolean;

	performSelector(aSelector: string): any;

	performSelectorWithObject(aSelector: string, object: any): any;

	performSelectorWithObjectWithObject(aSelector: string, object1: any, object2: any): any;

	respondsToSelector(aSelector: string): boolean;

	retainCount(): number;

	self(): this;
}

interface CLLocationCoordinate2D {
	latitude: number;
	longitude: number;
}
declare var CLLocationCoordinate2D: interop.StructType<CLLocationCoordinate2D>;

/**
 * @since 4.0
 */
declare function CLLocationCoordinate2DIsValid(coord: CLLocationCoordinate2D): boolean;

/**
 * @since 4.0
 */
declare function CLLocationCoordinate2DMake(latitude: number, longitude: number): CLLocationCoordinate2D;

/**
 * @since 6.0
 */
declare var CLLocationDistanceMax: number;

/**
 * @since 15.0
 */
declare class CLLocationSourceInformation extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLLocationSourceInformation; // inherited from NSObject

	static new(): CLLocationSourceInformation; // inherited from NSObject

	readonly isProducedByAccessory: boolean;

	readonly isSimulatedBySoftware: boolean;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { softwareSimulationState: boolean; andExternalAccessoryState: boolean; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithSoftwareSimulationStateAndExternalAccessoryState(isSoftware: boolean, isAccessory: boolean): this;
}

/**
 * @since 6.0
 */
declare var CLTimeIntervalMax: number;

declare var kCLDistanceFilterNone: number;

declare var kCLLocationAccuracyBest: number;

/**
 * @since 4.0
 */
declare var kCLLocationAccuracyBestForNavigation: number;

declare var kCLLocationAccuracyHundredMeters: number;

declare var kCLLocationAccuracyKilometer: number;

declare var kCLLocationAccuracyNearestTenMeters: number;

/**
 * @since 14.0
 */
declare var kCLLocationAccuracyReduced: number;

declare var kCLLocationAccuracyThreeKilometers: number;

/**
 * @since 4.0
 */
declare var kCLLocationCoordinate2DInvalid: CLLocationCoordinate2D;
