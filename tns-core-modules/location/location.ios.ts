import * as locationModule from "location";
import * as common from "./location-common";

global.moduleMerge(common, exports);

class LocationListenerImpl extends NSObject implements CLLocationManagerDelegate {
    public static ObjCProtocols = [CLLocationManagerDelegate];

    static new(): LocationListenerImpl {
        return <LocationListenerImpl>super.new();
    }

    private _onLocation: (location: locationModule.Location) => any;
    private _onError: (error: Error) => any
    private _options: locationModule.Options;
    private _maximumAge: number;

    public initWithLocationErrorOptions(location: (location: locationModule.Location) => any, error?: (error: Error) => any, options?: locationModule.Options): LocationListenerImpl {
        this._onLocation = location;
        
        if (error) {
            this._onError = error;
        }

        if (options) {
            this._options = options;
        }

        this._maximumAge = (this._options && ("number" === typeof this._options.maximumAge)) ? this._options.maximumAge : undefined;

        return this;
    }

    public locationManagerDidUpdateLocations(manager, locations): void {
        for (var i = 0; i < locations.count; i++) {
            var location = LocationManager._locationFromCLLocation(locations.objectAtIndex(i));
            if (this._maximumAge) {
                if (location.timestamp.valueOf() + this._maximumAge > new Date().valueOf()) {
                    this._onLocation(location);
                }
            }
            else {
                this._onLocation(location);
            }
        }
    }

    public locationManagerDidFailWithError(manager, error): void {
        if (this._onError) {
            this._onError(new Error(error.localizedDescription));
        }
    }
}

@Deprecated
export class LocationManager implements locationModule.LocationManager {
	get android(): locationModule.AndroidLocationManager {
		return undefined;
	}

	get ios(): locationModule.iOSLocationManager {
		return this.iosLocationManager;
	}

	public isStarted: boolean;
    // in meters
    // we might need some predefined values here like 'any' and 'high'
    public desiredAccuracy: number;

	// The minimum distance (measured in meters) a device must move horizontally before an update event is generated.
    public updateDistance: number;

    private iosLocationManager: locationModule.iOSLocationManager;
    private listener: any;

    public static _locationFromCLLocation(clLocation: CLLocation): locationModule.Location {
        var location = new locationModule.Location();
        location.latitude = clLocation.coordinate.latitude;
        location.longitude = clLocation.coordinate.longitude;
        location.altitude = clLocation.altitude;
        location.horizontalAccuracy = clLocation.horizontalAccuracy;
        location.verticalAccuracy = clLocation.verticalAccuracy;
        location.speed = clLocation.speed;
        location.direction = clLocation.course;
		var timeIntervalSince1970 = NSDate.dateWithTimeIntervalSinceDate(0, clLocation.timestamp).timeIntervalSince1970;
        location.timestamp = new Date(timeIntervalSince1970 * 1000);
        location.ios = clLocation;
        return location;
    }

    private static iosLocationFromLocation(location: locationModule.Location): CLLocation {
        var hAccuracy = location.horizontalAccuracy ? location.horizontalAccuracy : -1;
        var vAccuracy = location.verticalAccuracy ? location.verticalAccuracy : -1;
        var speed = location.speed ? location.speed : -1;
        var course = location.direction ? location.direction : -1;
        var altitude = location.altitude ? location.altitude : -1;
        var timestamp = location.timestamp ? NSDate.dateWithTimeIntervalSince1970(location.timestamp.getTime() / 1000) : null;
        var iosLocation = CLLocation.alloc().initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseSpeedTimestamp(CLLocationCoordinate2DMake(location.latitude, location.longitude), altitude, hAccuracy, vAccuracy, course, speed, <any>timestamp);
        return iosLocation;
    }

    public static isEnabled(): boolean {
        if (CLLocationManager.locationServicesEnabled()) {
            // CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse and CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways are options that are available in iOS 8.0+
            // while CLAuthorizationStatus.kCLAuthorizationStatusAuthorized is here to support iOS 8.0-.
            return (CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedWhenInUse 
                || CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorizedAlways
                || CLLocationManager.authorizationStatus() === CLAuthorizationStatus.kCLAuthorizationStatusAuthorized);
        }
        return false;
    }

    public static distance(loc1: locationModule.Location, loc2: locationModule.Location): number {
        if (!loc1.ios) {
            loc1.ios = LocationManager.iosLocationFromLocation(loc1);
        }
        if (!loc2.ios) {
            loc2.ios = LocationManager.iosLocationFromLocation(loc2);
        }
        return loc1.ios.distanceFromLocation(loc2.ios);
    }

    constructor() {
		//super();
        var enums = require("ui/enums");

        this.desiredAccuracy = enums.Accuracy.any;
        this.updateDistance = kCLDistanceFilterNone;
		var iosLocManager = new CLLocationManager();
        this.iosLocationManager = new iOSLocationManager(iosLocManager);
    }

    public startLocationMonitoring(onLocation: (location: locationModule.Location) => any, onError?: (error: Error) => any, options?: locationModule.Options) {
        if (!this.listener) {
            if (options) {
                if (options.desiredAccuracy) {
                    this.desiredAccuracy = options.desiredAccuracy;
                }
                if (options.updateDistance) {
                    this.updateDistance = options.updateDistance;
                }
            }

            this.listener = LocationListenerImpl.new().initWithLocationErrorOptions(onLocation, onError, options);
            this.iosLocationManager.manager.delegate = this.listener;
            this.iosLocationManager.manager.desiredAccuracy = this.desiredAccuracy;
            this.iosLocationManager.manager.distanceFilter = this.updateDistance;
            this.iosLocationManager.manager.startUpdatingLocation();
			this.isStarted = true;
        }
    }

    public stopLocationMonitoring() {
        this.iosLocationManager.manager.stopUpdatingLocation();
        this.iosLocationManager.manager.delegate = null;
        this.listener = null;
		this.isStarted = false;
    }

    get lastKnownLocation(): locationModule.Location {
        var clLocation = this.iosLocationManager.manager.location;
        if (clLocation) {
            return LocationManager._locationFromCLLocation(clLocation);
        }
        return null;
    }
}

/* tslint:disable */
@Deprecated
export class iOSLocationManager implements locationModule.iOSLocationManager {
	private _manager: CLLocationManager;

	public get manager(): CLLocationManager {
		return this._manager;
	}

	constructor(manager: CLLocationManager) {
		this._manager = manager;
	}
}
