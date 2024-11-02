
declare const enum CLAccuracyAuthorization {

	FullAccuracy = 0,

	ReducedAccuracy = 1
}

declare const enum CLActivityType {

	Other = 1,

	AutomotiveNavigation = 2,

	Fitness = 3,

	OtherNavigation = 4,

	Airborne = 5
}

declare const enum CLAuthorizationStatus {

	kCLAuthorizationStatusNotDetermined = 0,

	kCLAuthorizationStatusRestricted = 1,

	kCLAuthorizationStatusDenied = 2,

	kCLAuthorizationStatusAuthorizedAlways = 3,

	kCLAuthorizationStatusAuthorizedWhenInUse = 4,

	kCLAuthorizationStatusAuthorized = 3
}

/**
 * @since 17.0
 */
declare class CLBackgroundActivitySession extends NSObject {

	static alloc(): CLBackgroundActivitySession; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static backgroundActivitySession(): CLBackgroundActivitySession;

	/**
	 * @since 18.0
	 */
	static backgroundActivitySessionWithQueueHandler(queue: NSObject & OS_dispatch_queue, handler: (p1: CLBackgroundActivitySessionDiagnostic) => void): CLBackgroundActivitySession;

	static new(): CLBackgroundActivitySession; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	invalidate(): void;
}

/**
 * @since 18.0
 */
declare class CLBackgroundActivitySessionDiagnostic extends NSObject {

	static alloc(): CLBackgroundActivitySessionDiagnostic; // inherited from NSObject

	static new(): CLBackgroundActivitySessionDiagnostic; // inherited from NSObject

	readonly authorizationDenied: boolean;

	readonly authorizationDeniedGlobally: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationRequestInProgress: boolean;

	readonly authorizationRestricted: boolean;

	readonly insufficientlyInUse: boolean;

	/**
	 * @since 18.0
	 */
	readonly serviceSessionRequired: boolean;
}

/**
 * @since 7.0
 */
declare class CLBeacon extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLBeacon; // inherited from NSObject

	static new(): CLBeacon; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly UUID: NSUUID;

	readonly accuracy: number;

	readonly major: number;

	readonly minor: number;

	readonly proximity: CLProximity;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	readonly proximityUUID: NSUUID;

	readonly rssi: number;

	/**
	 * @since 13.0
	 */
	readonly timestamp: Date;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class CLBeaconIdentityCondition extends CLCondition implements NSCopying, NSSecureCoding {

	static alloc(): CLBeaconIdentityCondition; // inherited from NSObject

	static new(): CLBeaconIdentityCondition; // inherited from NSObject

	readonly UUID: NSUUID;

	readonly major: number;

	readonly minor: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { UUID: NSUUID; });

	constructor(o: { UUID: NSUUID; major: number; });

	constructor(o: { UUID: NSUUID; major: number; minor: number; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithUUID(uuid: NSUUID): this;

	initWithUUIDMajor(uuid: NSUUID, major: number): this;

	initWithUUIDMajorMinor(uuid: NSUUID, major: number, minor: number): this;
}

/**
 * @since 13.0
 * @deprecated 100000
 */
declare class CLBeaconIdentityConstraint extends CLBeaconIdentityCondition implements NSCopying, NSSecureCoding {

	static alloc(): CLBeaconIdentityConstraint; // inherited from NSObject

	static new(): CLBeaconIdentityConstraint; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 7.0
 * @deprecated 100000
 */
declare class CLBeaconRegion extends CLRegion {

	static alloc(): CLBeaconRegion; // inherited from NSObject

	static new(): CLBeaconRegion; // inherited from NSObject

	/**
	 * @since 13.0
	 */
	readonly UUID: NSUUID;

	/**
	 * @since 13.0
	 */
	readonly beaconIdentityConstraint: CLBeaconIdentityConstraint;

	readonly major: number;

	readonly minor: number;

	notifyEntryStateOnDisplay: boolean;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	readonly proximityUUID: NSUUID;

	/**
	 * @since 13.0
	 */
	constructor(o: { beaconIdentityConstraint: CLBeaconIdentityConstraint; identifier: string; });

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	constructor(o: { proximityUUID: NSUUID; identifier: string; });

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	constructor(o: { proximityUUID: NSUUID; major: number; identifier: string; });

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	constructor(o: { proximityUUID: NSUUID; major: number; minor: number; identifier: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { UUID: NSUUID; identifier: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { UUID: NSUUID; major: number; identifier: string; });

	/**
	 * @since 13.0
	 */
	constructor(o: { UUID: NSUUID; major: number; minor: number; identifier: string; });

	/**
	 * @since 13.0
	 */
	initWithBeaconIdentityConstraintIdentifier(beaconIdentityConstraint: CLBeaconIdentityConstraint, identifier: string): this;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	initWithProximityUUIDIdentifier(proximityUUID: NSUUID, identifier: string): this;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	initWithProximityUUIDMajorIdentifier(proximityUUID: NSUUID, major: number, identifier: string): this;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	initWithProximityUUIDMajorMinorIdentifier(proximityUUID: NSUUID, major: number, minor: number, identifier: string): this;

	/**
	 * @since 13.0
	 */
	initWithUUIDIdentifier(uuid: NSUUID, identifier: string): this;

	/**
	 * @since 13.0
	 */
	initWithUUIDMajorIdentifier(uuid: NSUUID, major: number, identifier: string): this;

	/**
	 * @since 13.0
	 */
	initWithUUIDMajorMinorIdentifier(uuid: NSUUID, major: number, minor: number, identifier: string): this;

	peripheralDataWithMeasuredPower(measuredPower: number): NSMutableDictionary<string, any>;
}

/**
 * @since 17.0
 */
declare class CLCircularGeographicCondition extends CLCondition implements NSSecureCoding {

	static alloc(): CLCircularGeographicCondition; // inherited from NSObject

	static new(): CLCircularGeographicCondition; // inherited from NSObject

	readonly center: CLLocationCoordinate2D;

	readonly radius: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { center: CLLocationCoordinate2D; radius: number; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCenterRadius(center: CLLocationCoordinate2D, radius: number): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 7.0
 * @deprecated 100000
 */
declare class CLCircularRegion extends CLRegion {

	static alloc(): CLCircularRegion; // inherited from NSObject

	static new(): CLCircularRegion; // inherited from NSObject

	constructor(o: { center: CLLocationCoordinate2D; radius: number; identifier: string; });

	initWithCenterRadiusIdentifier(center: CLLocationCoordinate2D, radius: number, identifier: string): this;
}

/**
 * @since 17.0
 */
declare class CLCondition extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLCondition; // inherited from NSObject

	static new(): CLCondition; // inherited from NSObject

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CLDeviceOrientation {

	Unknown = 0,

	Portrait = 1,

	PortraitUpsideDown = 2,

	LandscapeLeft = 3,

	LandscapeRight = 4,

	FaceUp = 5,

	FaceDown = 6
}

declare const enum CLError {

	kCLErrorLocationUnknown = 0,

	kCLErrorDenied = 1,

	kCLErrorNetwork = 2,

	kCLErrorHeadingFailure = 3,

	kCLErrorRegionMonitoringDenied = 4,

	kCLErrorRegionMonitoringFailure = 5,

	kCLErrorRegionMonitoringSetupDelayed = 6,

	kCLErrorRegionMonitoringResponseDelayed = 7,

	kCLErrorGeocodeFoundNoResult = 8,

	kCLErrorGeocodeFoundPartialResult = 9,

	kCLErrorGeocodeCanceled = 10,

	kCLErrorDeferredFailed = 11,

	kCLErrorDeferredNotUpdatingLocation = 12,

	kCLErrorDeferredAccuracyTooLow = 13,

	kCLErrorDeferredDistanceFiltered = 14,

	kCLErrorDeferredCanceled = 15,

	kCLErrorRangingUnavailable = 16,

	kCLErrorRangingFailure = 17,

	kCLErrorPromptDeclined = 18,

	kCLErrorHistoricalLocationError = 19
}

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
 * @since 5.0
 */
declare class CLGeocoder extends NSObject {

	static alloc(): CLGeocoder; // inherited from NSObject

	static new(): CLGeocoder; // inherited from NSObject

	readonly geocoding: boolean;

	cancelGeocode(): void;

	/**
	 * @since 5.0
	 * @deprecated 11.0
	 */
	geocodeAddressDictionaryCompletionHandler(addressDictionary: NSDictionary<any, any>, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	geocodeAddressStringCompletionHandler(addressString: string, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	geocodeAddressStringInRegionCompletionHandler(addressString: string, region: CLRegion, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	geocodeAddressStringInRegionPreferredLocaleCompletionHandler(addressString: string, region: CLRegion, locale: NSLocale, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	geocodePostalAddressCompletionHandler(postalAddress: CNPostalAddress, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	geocodePostalAddressPreferredLocaleCompletionHandler(postalAddress: CNPostalAddress, locale: NSLocale, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	reverseGeocodeLocationCompletionHandler(location: CLLocation, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	/**
	 * @since 11.0
	 */
	reverseGeocodeLocationPreferredLocaleCompletionHandler(location: CLLocation, locale: NSLocale, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;
}

/**
 * @since 3.0
 */
declare class CLHeading extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLHeading; // inherited from NSObject

	static new(): CLHeading; // inherited from NSObject

	readonly headingAccuracy: number;

	readonly magneticHeading: number;

	readonly timestamp: Date;

	readonly trueHeading: number;

	readonly x: number;

	readonly y: number;

	readonly z: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CLLiveUpdateConfiguration {

	Default = 0,

	AutomotiveNavigation = 1,

	OtherNavigation = 2,

	Fitness = 3,

	Airborne = 4
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
 * @since 2.0
 */
declare class CLLocationManager extends NSObject {

	static alloc(): CLLocationManager; // inherited from NSObject

	/**
	 * @since 4.2
	 * @deprecated 14.0
	 */
	static authorizationStatus(): CLAuthorizationStatus;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	static deferredLocationUpdatesAvailable(): boolean;

	/**
	 * @since 4.0
	 */
	static headingAvailable(): boolean;

	/**
	 * @since 7.0
	 */
	static isMonitoringAvailableForClass(regionClass: typeof NSObject): boolean;

	/**
	 * @since 7.0
	 */
	static isRangingAvailable(): boolean;

	/**
	 * @since 4.0
	 */
	static locationServicesEnabled(): boolean;

	static new(): CLLocationManager; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	static regionMonitoringAvailable(): boolean;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	static regionMonitoringEnabled(): boolean;

	/**
	 * @since 4.0
	 */
	static significantLocationChangeMonitoringAvailable(): boolean;

	/**
	 * @since 14.0
	 */
	readonly accuracyAuthorization: CLAccuracyAuthorization;

	/**
	 * @since 6.0
	 */
	activityType: CLActivityType;

	/**
	 * @since 9.0
	 */
	allowsBackgroundLocationUpdates: boolean;

	/**
	 * @since 14.0
	 */
	readonly authorizationStatus: CLAuthorizationStatus;

	/**
	 * @since 14.0
	 */
	readonly authorizedForWidgetUpdates: boolean;

	delegate: CLLocationManagerDelegate;

	desiredAccuracy: number;

	distanceFilter: number;

	/**
	 * @since 4.0
	 */
	readonly heading: CLHeading;

	/**
	 * @since 3.0
	 * @deprecated 4.0
	 */
	readonly headingAvailable: boolean;

	/**
	 * @since 3.0
	 */
	headingFilter: number;

	/**
	 * @since 4.0
	 */
	headingOrientation: CLDeviceOrientation;

	readonly location: CLLocation;

	/**
	 * @since 2.0
	 * @deprecated 4.0
	 */
	readonly locationServicesEnabled: boolean;

	/**
	 * @since 4.0
	 */
	readonly maximumRegionMonitoringDistance: number;

	/**
	 * @since 4.0
	 */
	readonly monitoredRegions: NSSet<CLRegion>;

	/**
	 * @since 6.0
	 */
	pausesLocationUpdatesAutomatically: boolean;

	/**
	 * @since 3.2
	 * @deprecated 6.0
	 */
	purpose: string;

	/**
	 * @since 13.0
	 */
	readonly rangedBeaconConstraints: NSSet<CLBeaconIdentityConstraint>;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	readonly rangedRegions: NSSet<CLRegion>;

	/**
	 * @since 11.0
	 */
	showsBackgroundLocationIndicator: boolean;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	allowDeferredLocationUpdatesUntilTraveledTimeout(distance: number, timeout: number): void;

	/**
	 * @since 6.0
	 * @deprecated 13.0
	 */
	disallowDeferredLocationUpdates(): void;

	/**
	 * @since 3.0
	 */
	dismissHeadingCalibrationDisplay(): void;

	/**
	 * @since 8.0
	 */
	requestAlwaysAuthorization(): void;

	/**
	 * @since 9.0
	 */
	requestLocation(): void;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	requestStateForRegion(region: CLRegion): void;

	/**
	 * @since 14.0
	 */
	requestTemporaryFullAccuracyAuthorizationWithPurposeKey(purposeKey: string): void;

	/**
	 * @since 14.0
	 */
	requestTemporaryFullAccuracyAuthorizationWithPurposeKeyCompletion(purposeKey: string, completion: (p1: NSError) => void): void;

	/**
	 * @since 8.0
	 */
	requestWhenInUseAuthorization(): void;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	startMonitoringForRegion(region: CLRegion): void;

	/**
	 * @since 4.0
	 * @deprecated 6.0
	 */
	startMonitoringForRegionDesiredAccuracy(region: CLRegion, accuracy: number): void;

	/**
	 * @since 15.0
	 */
	startMonitoringLocationPushesWithCompletion(completion: (p1: NSData, p2: NSError) => void): void;

	/**
	 * @since 4.0
	 */
	startMonitoringSignificantLocationChanges(): void;

	/**
	 * @since 8.0
	 */
	startMonitoringVisits(): void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	startRangingBeaconsInRegion(region: CLBeaconRegion): void;

	/**
	 * @since 13.0
	 */
	startRangingBeaconsSatisfyingConstraint(constraint: CLBeaconIdentityConstraint): void;

	/**
	 * @since 3.0
	 */
	startUpdatingHeading(): void;

	startUpdatingLocation(): void;

	/**
	 * @since 5.0
	 * @deprecated 100000
	 */
	stopMonitoringForRegion(region: CLRegion): void;

	/**
	 * @since 15.0
	 */
	stopMonitoringLocationPushes(): void;

	/**
	 * @since 4.0
	 */
	stopMonitoringSignificantLocationChanges(): void;

	/**
	 * @since 8.0
	 */
	stopMonitoringVisits(): void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	stopRangingBeaconsInRegion(region: CLBeaconRegion): void;

	/**
	 * @since 13.0
	 */
	stopRangingBeaconsSatisfyingConstraint(constraint: CLBeaconIdentityConstraint): void;

	/**
	 * @since 3.0
	 */
	stopUpdatingHeading(): void;

	stopUpdatingLocation(): void;
}

interface CLLocationManagerDelegate extends NSObjectProtocol {

	/**
	 * @since 14.0
	 */
	locationManagerDidChangeAuthorization?(manager: CLLocationManager): void;

	/**
	 * @since 4.2
	 * @deprecated 14.0
	 */
	locationManagerDidChangeAuthorizationStatus?(manager: CLLocationManager, status: CLAuthorizationStatus): void;

	/**
	 * @since 7.0
	 */
	locationManagerDidDetermineStateForRegion?(manager: CLLocationManager, state: CLRegionState, region: CLRegion): void;

	/**
	 * @since 4.0
	 */
	locationManagerDidEnterRegion?(manager: CLLocationManager, region: CLRegion): void;

	/**
	 * @since 4.0
	 */
	locationManagerDidExitRegion?(manager: CLLocationManager, region: CLRegion): void;

	/**
	 * @since 13.0
	 */
	locationManagerDidFailRangingBeaconsForConstraintError?(manager: CLLocationManager, beaconConstraint: CLBeaconIdentityConstraint, error: NSError): void;

	locationManagerDidFailWithError?(manager: CLLocationManager, error: NSError): void;

	/**
	 * @since 6.0
	 */
	locationManagerDidFinishDeferredUpdatesWithError?(manager: CLLocationManager, error: NSError): void;

	/**
	 * @since 6.0
	 */
	locationManagerDidPauseLocationUpdates?(manager: CLLocationManager): void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	locationManagerDidRangeBeaconsInRegion?(manager: CLLocationManager, beacons: NSArray<CLBeacon> | CLBeacon[], region: CLBeaconRegion): void;

	/**
	 * @since 13.0
	 */
	locationManagerDidRangeBeaconsSatisfyingConstraint?(manager: CLLocationManager, beacons: NSArray<CLBeacon> | CLBeacon[], beaconConstraint: CLBeaconIdentityConstraint): void;

	/**
	 * @since 6.0
	 */
	locationManagerDidResumeLocationUpdates?(manager: CLLocationManager): void;

	/**
	 * @since 5.0
	 */
	locationManagerDidStartMonitoringForRegion?(manager: CLLocationManager, region: CLRegion): void;

	/**
	 * @since 3.0
	 */
	locationManagerDidUpdateHeading?(manager: CLLocationManager, newHeading: CLHeading): void;

	/**
	 * @since 6.0
	 */
	locationManagerDidUpdateLocations?(manager: CLLocationManager, locations: NSArray<CLLocation> | CLLocation[]): void;

	/**
	 * @since 2.0
	 * @deprecated 6.0
	 */
	locationManagerDidUpdateToLocationFromLocation?(manager: CLLocationManager, newLocation: CLLocation, oldLocation: CLLocation): void;

	/**
	 * @since 8.0
	 */
	locationManagerDidVisit?(manager: CLLocationManager, visit: CLVisit): void;

	/**
	 * @since 4.0
	 */
	locationManagerMonitoringDidFailForRegionWithError?(manager: CLLocationManager, region: CLRegion, error: NSError): void;

	/**
	 * @since 7.0
	 * @deprecated 13.0
	 */
	locationManagerRangingBeaconsDidFailForRegionWithError?(manager: CLLocationManager, region: CLBeaconRegion, error: NSError): void;

	/**
	 * @since 3.0
	 */
	locationManagerShouldDisplayHeadingCalibration?(manager: CLLocationManager): boolean;
}
declare var CLLocationManagerDelegate: {

	prototype: CLLocationManagerDelegate;
};

/**
 * @since 15.0
 */
declare const enum CLLocationPushServiceError {

	Unknown = 0,

	MissingPushExtension = 1,

	MissingPushServerEnvironment = 2,

	MissingEntitlement = 3,

	UnsupportedPlatform = 4
}

/**
 * @since 15.0
 */
declare var CLLocationPushServiceErrorDomain: string;

/**
 * @since 15.0
 */
interface CLLocationPushServiceExtension extends NSObjectProtocol {

	didReceiveLocationPushPayloadCompletion(payload: NSDictionary<string, any>, completion: () => void): void;

	serviceExtensionWillTerminate?(): void;
}
declare var CLLocationPushServiceExtension: {

	prototype: CLLocationPushServiceExtension;
};

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
 * @since 17.0
 */
declare class CLLocationUpdater extends NSObject {

	static alloc(): CLLocationUpdater; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	static liveUpdaterWithConfigurationQueueHandler(configuration: CLLiveUpdateConfiguration, queue: NSObject & OS_dispatch_queue, handler: (p1: CLUpdate) => void): CLLocationUpdater;

	/**
	 * @since 17.0
	 */
	static liveUpdaterWithQueueHandler(queue: NSObject & OS_dispatch_queue, handler: (p1: CLUpdate) => void): CLLocationUpdater;

	static new(): CLLocationUpdater; // inherited from NSObject

	/**
	 * @since 17.0
	 */
	invalidate(): void;

	/**
	 * @since 17.0
	 */
	pause(): void;

	/**
	 * @since 17.0
	 */
	resume(): void;
}

/**
 * @since 17.0
 */
declare class CLMonitor extends NSObject {

	static alloc(): CLMonitor; // inherited from NSObject

	static new(): CLMonitor; // inherited from NSObject

	static requestMonitorWithConfigurationCompletion(config: CLMonitorConfiguration, completionHandler: (p1: CLMonitor) => void): void;

	readonly monitoredIdentifiers: NSArray<string>;

	readonly name: string;

	addConditionForMonitoringIdentifier(condition: CLCondition, identifier: string): void;

	addConditionForMonitoringIdentifierAssumedState(condition: CLCondition, identifier: string, state: CLMonitoringState): void;

	monitoringRecordForIdentifier(identifier: string): CLMonitoringRecord;

	removeConditionFromMonitoringWithIdentifier(identifier: string): void;
}

/**
 * @since 17.0
 */
declare class CLMonitorConfiguration extends NSObject {

	static alloc(): CLMonitorConfiguration; // inherited from NSObject

	static configWithMonitorNameQueueEventHandler(name: string, queue: NSObject & OS_dispatch_queue, eventHandler: (p1: CLMonitor, p2: CLMonitoringEvent) => void): CLMonitorConfiguration;

	static new(): CLMonitorConfiguration; // inherited from NSObject

	readonly eventHandler: (p1: CLMonitor, p2: CLMonitoringEvent) => void;

	readonly name: string;

	readonly queue: NSObject & OS_dispatch_queue;
}

/**
 * @since 17.0
 */
declare class CLMonitoringEvent extends NSObject implements NSSecureCoding {

	static alloc(): CLMonitoringEvent; // inherited from NSObject

	static new(): CLMonitoringEvent; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	readonly accuracyLimited: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationDenied: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationDeniedGlobally: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationRequestInProgress: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationRestricted: boolean;

	/**
	 * @since 18.0
	 */
	readonly conditionLimitExceeded: boolean;

	/**
	 * @since 18.0
	 */
	readonly conditionUnsupported: boolean;

	readonly date: Date;

	readonly identifier: string;

	/**
	 * @since 18.0
	 */
	readonly insufficientlyInUse: boolean;

	/**
	 * @since 18.0
	 */
	readonly persistenceUnavailable: boolean;

	readonly refinement: CLCondition;

	/**
	 * @since 18.0
	 */
	readonly serviceSessionRequired: boolean;

	readonly state: CLMonitoringState;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 17.0
 */
declare class CLMonitoringRecord extends NSObject implements NSSecureCoding {

	static alloc(): CLMonitoringRecord; // inherited from NSObject

	static new(): CLMonitoringRecord; // inherited from NSObject

	readonly condition: CLCondition;

	readonly lastEvent: CLMonitoringEvent;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare const enum CLMonitoringState {

	Unknown = 0,

	Satisfied = 1,

	Unsatisfied = 2,

	Unmonitored = 3
}

/**
 * @since 5.0
 */
declare class CLPlacemark extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLPlacemark; // inherited from NSObject

	static new(): CLPlacemark; // inherited from NSObject

	/**
	 * @since 10.0
	 */
	static placemarkWithLocationNamePostalAddress(location: CLLocation, name: string, postalAddress: CNPostalAddress): CLPlacemark;

	readonly ISOcountryCode: string;

	/**
	 * @since 5.0
	 * @deprecated 11.0
	 */
	readonly addressDictionary: NSDictionary<any, any>;

	readonly administrativeArea: string;

	readonly areasOfInterest: NSArray<string>;

	readonly country: string;

	readonly inlandWater: string;

	readonly locality: string;

	readonly location: CLLocation;

	readonly name: string;

	readonly ocean: string;

	/**
	 * @since 11.0
	 */
	readonly postalAddress: CNPostalAddress;

	readonly postalCode: string;

	readonly region: CLRegion;

	readonly subAdministrativeArea: string;

	readonly subLocality: string;

	readonly subThoroughfare: string;

	readonly thoroughfare: string;

	/**
	 * @since 9.0
	 */
	readonly timeZone: NSTimeZone;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { placemark: CLPlacemark; });

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;

	initWithPlacemark(placemark: CLPlacemark): this;
}

/**
 * @since 7.0
 */
declare const enum CLProximity {

	Unknown = 0,

	Immediate = 1,

	Near = 2,

	Far = 3
}

/**
 * @since 4.0
 */
declare class CLRegion extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLRegion; // inherited from NSObject

	static new(): CLRegion; // inherited from NSObject

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	readonly center: CLLocationCoordinate2D;

	/**
	 * @since 4.0
	 */
	readonly identifier: string;

	/**
	 * @since 7.0
	 */
	notifyOnEntry: boolean;

	/**
	 * @since 7.0
	 */
	notifyOnExit: boolean;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	readonly radius: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	constructor(o: { circularRegionWithCenter: CLLocationCoordinate2D; radius: number; identifier: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	containsCoordinate(coordinate: CLLocationCoordinate2D): boolean;

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	/**
	 * @since 4.0
	 * @deprecated 7.0
	 */
	initCircularRegionWithCenterRadiusIdentifier(center: CLLocationCoordinate2D, radius: number, identifier: string): this;

	initWithCoder(coder: NSCoder): this;
}

/**
 * @since 7.0
 */
declare const enum CLRegionState {

	Unknown = 0,

	Inside = 1,

	Outside = 2
}

/**
 * @since 18.0
 */
declare class CLServiceSession extends NSObject {

	static alloc(): CLServiceSession; // inherited from NSObject

	static new(): CLServiceSession; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	static sessionRequiringAuthorization(authorizationRequirement: CLServiceSessionAuthorizationRequirement): CLServiceSession;

	/**
	 * @since 18.0
	 */
	static sessionRequiringAuthorizationFullAccuracyPurposeKey(authorizationRequirement: CLServiceSessionAuthorizationRequirement, purposeKey: string): CLServiceSession;

	/**
	 * @since 18.0
	 */
	static sessionRequiringAuthorizationFullAccuracyPurposeKeyQueueHandler(authorizationRequirement: CLServiceSessionAuthorizationRequirement, purposeKey: string, queue: NSObject & OS_dispatch_queue, handler: (p1: CLServiceSessionDiagnostic) => void): CLServiceSession;

	/**
	 * @since 18.0
	 */
	static sessionRequiringAuthorizationQueueHandler(authorizationRequirement: CLServiceSessionAuthorizationRequirement, queue: NSObject & OS_dispatch_queue, handler: (p1: CLServiceSessionDiagnostic) => void): CLServiceSession;

	/**
	 * @since 18.0
	 */
	invalidate(): void;
}

declare const enum CLServiceSessionAuthorizationRequirement {

	None = 0,

	WhenInUse = 1,

	Always = 2
}

/**
 * @since 18.0
 */
declare class CLServiceSessionDiagnostic extends NSObject {

	static alloc(): CLServiceSessionDiagnostic; // inherited from NSObject

	static new(): CLServiceSessionDiagnostic; // inherited from NSObject

	readonly alwaysAuthorizationDenied: boolean;

	readonly authorizationDenied: boolean;

	readonly authorizationDeniedGlobally: boolean;

	readonly authorizationRequestInProgress: boolean;

	readonly authorizationRestricted: boolean;

	readonly fullAccuracyDenied: boolean;

	readonly insufficientlyInUse: boolean;

	readonly serviceSessionRequired: boolean;
}

/**
 * @since 6.0
 */
declare var CLTimeIntervalMax: number;

/**
 * @since 17.0
 */
declare class CLUpdate extends NSObject {

	static alloc(): CLUpdate; // inherited from NSObject

	static new(): CLUpdate; // inherited from NSObject

	/**
	 * @since 18.0
	 */
	readonly accuracyLimited: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationDenied: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationDeniedGlobally: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationRequestInProgress: boolean;

	/**
	 * @since 18.0
	 */
	readonly authorizationRestricted: boolean;

	/**
	 * @since 18.0
	 */
	readonly insufficientlyInUse: boolean;

	/**
	 * @since 17.0
	 * @deprecated 17.0
	 */
	readonly isStationary: boolean;

	/**
	 * @since 17.0
	 */
	readonly location: CLLocation;

	/**
	 * @since 18.0
	 */
	readonly locationUnavailable: boolean;

	/**
	 * @since 18.0
	 */
	readonly serviceSessionRequired: boolean;

	/**
	 * @since 18.0
	 */
	readonly stationary: boolean;
}

/**
 * @since 8.0
 */
declare class CLVisit extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLVisit; // inherited from NSObject

	static new(): CLVisit; // inherited from NSObject

	readonly arrivalDate: Date;

	readonly coordinate: CLLocationCoordinate2D;

	readonly departureDate: Date;

	readonly horizontalAccuracy: number;

	static readonly supportsSecureCoding: boolean; // inherited from NSSecureCoding

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer | interop.Reference<any>): any;

	encodeWithCoder(coder: NSCoder): void;

	initWithCoder(coder: NSCoder): this;
}

declare var kCLDistanceFilterNone: number;

declare var kCLErrorDomain: string;

/**
 * @since 5.0
 */
declare var kCLErrorUserInfoAlternateRegionKey: string;

declare var kCLHeadingFilterNone: number;

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
