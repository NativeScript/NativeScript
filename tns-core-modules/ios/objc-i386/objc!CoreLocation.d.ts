
declare const enum CLActivityType {

	Other = 1,

	AutomotiveNavigation = 2,

	Fitness = 3,

	OtherNavigation = 4
}

declare const enum CLAuthorizationStatus {

	kCLAuthorizationStatusNotDetermined = 0,

	kCLAuthorizationStatusRestricted = 1,

	kCLAuthorizationStatusDenied = 2,

	kCLAuthorizationStatusAuthorizedAlways = 3,

	kCLAuthorizationStatusAuthorizedWhenInUse = 4,

	kCLAuthorizationStatusAuthorized = 3
}

declare class CLBeacon extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLBeacon; // inherited from NSObject

	static new(): CLBeacon; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ accuracy: number;

	/* readonly */ major: number;

	/* readonly */ minor: number;

	/* readonly */ proximity: CLProximity;

	/* readonly */ proximityUUID: NSUUID;

	/* readonly */ rssi: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CLBeacon; // inherited from NSObjectProtocol
}

declare class CLBeaconRegion extends CLRegion {

	/* readonly */ major: number;

	/* readonly */ minor: number;

	notifyEntryStateOnDisplay: boolean;

	/* readonly */ proximityUUID: NSUUID;

	constructor(o: { circularRegionWithCenter: CLLocationCoordinate2D; radius: number; identifier: string; }); // inherited from CLRegion

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { proximityUUID: NSUUID; identifier: string; });

	constructor(o: { proximityUUID: NSUUID; major: number; identifier: string; });

	constructor(o: { proximityUUID: NSUUID; major: number; minor: number; identifier: string; });

	peripheralDataWithMeasuredPower(measuredPower: number): NSMutableDictionary<string, any>;
}

declare class CLCircularRegion extends CLRegion {

	constructor(o: { circularRegionWithCenter: CLLocationCoordinate2D; radius: number; identifier: string; }); // inherited from CLRegion

	constructor(o: { center: CLLocationCoordinate2D; radius: number; identifier: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding
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

	kCLErrorRangingFailure = 17
}

declare class CLFloor extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLFloor; // inherited from NSObject

	static new(): CLFloor; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ level: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CLFloor; // inherited from NSObjectProtocol
}

declare class CLGeocoder extends NSObject {

	static alloc(): CLGeocoder; // inherited from NSObject

	static new(): CLGeocoder; // inherited from NSObject

	/* readonly */ geocoding: boolean;

	constructor(); // inherited from NSObject

	cancelGeocode(): void;

	geocodeAddressDictionaryCompletionHandler(addressDictionary: NSDictionary<any, any>, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	geocodeAddressStringCompletionHandler(addressString: string, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	geocodeAddressStringInRegionCompletionHandler(addressString: string, region: CLRegion, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	reverseGeocodeLocationCompletionHandler(location: CLLocation, completionHandler: (p1: NSArray<CLPlacemark>, p2: NSError) => void): void;

	self(): CLGeocoder; // inherited from NSObjectProtocol
}

declare class CLHeading extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLHeading; // inherited from NSObject

	static new(): CLHeading; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ headingAccuracy: number;

	/* readonly */ magneticHeading: number;

	/* readonly */ timestamp: Date;

	/* readonly */ trueHeading: number;

	/* readonly */ x: number;

	/* readonly */ y: number;

	/* readonly */ z: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CLHeading; // inherited from NSObjectProtocol
}

declare class CLLocation extends NSObject implements CKRecordValue, NSCopying, NSSecureCoding {

	static alloc(): CLLocation; // inherited from NSObject

	static new(): CLLocation; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ altitude: number;

	/* readonly */ coordinate: CLLocationCoordinate2D;

	/* readonly */ course: number;

	/* readonly */ floor: CLFloor;

	/* readonly */ horizontalAccuracy: number;

	/* readonly */ speed: number;

	/* readonly */ timestamp: Date;

	/* readonly */ verticalAccuracy: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { coordinate: CLLocationCoordinate2D; altitude: number; horizontalAccuracy: number; verticalAccuracy: number; course: number; speed: number; timestamp: Date; });

	constructor(o: { coordinate: CLLocationCoordinate2D; altitude: number; horizontalAccuracy: number; verticalAccuracy: number; timestamp: Date; });

	constructor(o: { latitude: number; longitude: number; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	distanceFromLocation(location: CLLocation): number;

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	getDistanceFrom(location: CLLocation): number;

	self(): CLLocation; // inherited from NSObjectProtocol
}

interface CLLocationCoordinate2D {
	latitude: number;
	longitude: number;
}
declare var CLLocationCoordinate2D: interop.StructType<CLLocationCoordinate2D>;

declare function CLLocationCoordinate2DIsValid(coord: CLLocationCoordinate2D): boolean;

declare function CLLocationCoordinate2DMake(latitude: number, longitude: number): CLLocationCoordinate2D;

declare var CLLocationDistanceMax: number;

declare class CLLocationManager extends NSObject {

	static alloc(): CLLocationManager; // inherited from NSObject

	static authorizationStatus(): CLAuthorizationStatus;

	static deferredLocationUpdatesAvailable(): boolean;

	static headingAvailable(): boolean;

	static isMonitoringAvailableForClass(regionClass: typeof NSObject): boolean;

	static isRangingAvailable(): boolean;

	static locationServicesEnabled(): boolean;

	static new(): CLLocationManager; // inherited from NSObject

	static regionMonitoringAvailable(): boolean;

	static regionMonitoringEnabled(): boolean;

	static significantLocationChangeMonitoringAvailable(): boolean;

	activityType: CLActivityType;

	allowsBackgroundLocationUpdates: boolean;

	delegate: CLLocationManagerDelegate;

	desiredAccuracy: number;

	distanceFilter: number;

	/* readonly */ heading: CLHeading;

	/* readonly */ headingAvailable: boolean;

	headingFilter: number;

	headingOrientation: CLDeviceOrientation;

	/* readonly */ location: CLLocation;

	/* readonly */ locationServicesEnabled: boolean;

	/* readonly */ maximumRegionMonitoringDistance: number;

	/* readonly */ monitoredRegions: NSSet<CLRegion>;

	pausesLocationUpdatesAutomatically: boolean;

	purpose: string;

	/* readonly */ rangedRegions: NSSet<CLRegion>;

	constructor(); // inherited from NSObject

	allowDeferredLocationUpdatesUntilTraveledTimeout(distance: number, timeout: number): void;

	disallowDeferredLocationUpdates(): void;

	dismissHeadingCalibrationDisplay(): void;

	requestAlwaysAuthorization(): void;

	requestLocation(): void;

	requestStateForRegion(region: CLRegion): void;

	requestWhenInUseAuthorization(): void;

	self(): CLLocationManager; // inherited from NSObjectProtocol

	startMonitoringForRegion(region: CLRegion): void;

	startMonitoringForRegionDesiredAccuracy(region: CLRegion, accuracy: number): void;

	startMonitoringSignificantLocationChanges(): void;

	startMonitoringVisits(): void;

	startRangingBeaconsInRegion(region: CLBeaconRegion): void;

	startUpdatingHeading(): void;

	startUpdatingLocation(): void;

	stopMonitoringForRegion(region: CLRegion): void;

	stopMonitoringSignificantLocationChanges(): void;

	stopMonitoringVisits(): void;

	stopRangingBeaconsInRegion(region: CLBeaconRegion): void;

	stopUpdatingHeading(): void;

	stopUpdatingLocation(): void;
}

interface CLLocationManagerDelegate extends NSObjectProtocol {

	locationManagerDidChangeAuthorizationStatus?(manager: CLLocationManager, status: CLAuthorizationStatus): void;

	locationManagerDidDetermineStateForRegion?(manager: CLLocationManager, state: CLRegionState, region: CLRegion): void;

	locationManagerDidEnterRegion?(manager: CLLocationManager, region: CLRegion): void;

	locationManagerDidExitRegion?(manager: CLLocationManager, region: CLRegion): void;

	locationManagerDidFailWithError?(manager: CLLocationManager, error: NSError): void;

	locationManagerDidFinishDeferredUpdatesWithError?(manager: CLLocationManager, error: NSError): void;

	locationManagerDidPauseLocationUpdates?(manager: CLLocationManager): void;

	locationManagerDidRangeBeaconsInRegion?(manager: CLLocationManager, beacons: NSArray<CLBeacon>, region: CLBeaconRegion): void;

	locationManagerDidResumeLocationUpdates?(manager: CLLocationManager): void;

	locationManagerDidStartMonitoringForRegion?(manager: CLLocationManager, region: CLRegion): void;

	locationManagerDidUpdateHeading?(manager: CLLocationManager, newHeading: CLHeading): void;

	locationManagerDidUpdateLocations?(manager: CLLocationManager, locations: NSArray<CLLocation>): void;

	locationManagerDidUpdateToLocationFromLocation?(manager: CLLocationManager, newLocation: CLLocation, oldLocation: CLLocation): void;

	locationManagerDidVisit?(manager: CLLocationManager, visit: CLVisit): void;

	locationManagerMonitoringDidFailForRegionWithError?(manager: CLLocationManager, region: CLRegion, error: NSError): void;

	locationManagerRangingBeaconsDidFailForRegionWithError?(manager: CLLocationManager, region: CLBeaconRegion, error: NSError): void;

	locationManagerShouldDisplayHeadingCalibration?(manager: CLLocationManager): boolean;
}
declare var CLLocationManagerDelegate: {

	prototype: CLLocationManagerDelegate;
};

declare class CLPlacemark extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLPlacemark; // inherited from NSObject

	static new(): CLPlacemark; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ ISOcountryCode: string;

	/* readonly */ addressDictionary: NSDictionary<any, any>;

	/* readonly */ administrativeArea: string;

	/* readonly */ areasOfInterest: NSArray<string>;

	/* readonly */ country: string;

	/* readonly */ inlandWater: string;

	/* readonly */ locality: string;

	/* readonly */ location: CLLocation;

	/* readonly */ name: string;

	/* readonly */ ocean: string;

	/* readonly */ postalCode: string;

	/* readonly */ region: CLRegion;

	/* readonly */ subAdministrativeArea: string;

	/* readonly */ subLocality: string;

	/* readonly */ subThoroughfare: string;

	/* readonly */ thoroughfare: string;

	/* readonly */ timeZone: NSTimeZone;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	constructor(o: { placemark: CLPlacemark; });

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CLPlacemark; // inherited from NSObjectProtocol
}

declare const enum CLProximity {

	Unknown = 0,

	Immediate = 1,

	Near = 2,

	Far = 3
}

declare class CLRegion extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLRegion; // inherited from NSObject

	static new(): CLRegion; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ center: CLLocationCoordinate2D;

	/* readonly */ identifier: string;

	notifyOnEntry: boolean;

	notifyOnExit: boolean;

	/* readonly */ radius: number;

	constructor(); // inherited from NSObject

	constructor(o: { circularRegionWithCenter: CLLocationCoordinate2D; radius: number; identifier: string; });

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	containsCoordinate(coordinate: CLLocationCoordinate2D): boolean;

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CLRegion; // inherited from NSObjectProtocol
}

declare const enum CLRegionState {

	Unknown = 0,

	Inside = 1,

	Outside = 2
}

declare var CLTimeIntervalMax: number;

declare class CLVisit extends NSObject implements NSCopying, NSSecureCoding {

	static alloc(): CLVisit; // inherited from NSObject

	static new(): CLVisit; // inherited from NSObject

	static supportsSecureCoding(): boolean; // inherited from NSSecureCoding

	/* readonly */ arrivalDate: Date;

	/* readonly */ coordinate: CLLocationCoordinate2D;

	/* readonly */ departureDate: Date;

	/* readonly */ horizontalAccuracy: number;

	constructor(); // inherited from NSObject

	constructor(o: { coder: NSCoder; }); // inherited from NSCoding

	copyWithZone(zone: interop.Pointer): any; // inherited from NSCopying

	encodeWithCoder(aCoder: NSCoder): void; // inherited from NSCoding

	self(): CLVisit; // inherited from NSObjectProtocol
}

declare var kCLDistanceFilterNone: number;

declare var kCLErrorDomain: string;

declare var kCLErrorUserInfoAlternateRegionKey: string;

declare var kCLHeadingFilterNone: number;

declare var kCLLocationAccuracyBest: number;

declare var kCLLocationAccuracyBestForNavigation: number;

declare var kCLLocationAccuracyHundredMeters: number;

declare var kCLLocationAccuracyKilometer: number;

declare var kCLLocationAccuracyNearestTenMeters: number;

declare var kCLLocationAccuracyThreeKilometers: number;

declare var kCLLocationCoordinate2DInvalid: CLLocationCoordinate2D;
