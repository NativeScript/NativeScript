import types = require("Location/location_types");

export class LocationManager {

    // in meters
    // we might need some predefined values here like 'any' and 'high'
    public desiredAccuracy: number;

    // The minimum distance (measured in meters) a device must move horizontally before an update event is generated.
    public updateDistance: number;

    public isStarted: boolean;

    private iosLocationManager: CoreLocation.CLLocationManager;
    private listener: any;

    private static locationFromCLLocation(clLocation: CoreLocation.CLLocation): types.Location {
        var location = new types.Location();
        location.latitude = clLocation.coordinate.latitude;
        location.longitude = clLocation.coordinate.longitude;
        location.altitude = clLocation.altitude;
        location.horizontalAccuracy = clLocation.horizontalAccuracy;
        location.verticalAccuracy = clLocation.verticalAccuracy;
        location.speed = clLocation.speed;
        location.direction = clLocation.course;
        location.timestamp = new Date(clLocation.timestamp.timeIntervalSince1970() * 1000);
        location.iosNative = clLocation;
        //console.dump(location);
        return location;
    }

    private static iosLocationFromLocation(location: types.Location): CoreLocation.CLLocation {
        var hAccuracy = location.horizontalAccuracy ? location.horizontalAccuracy : -1;
        var vAccuracy = location.verticalAccuracy ? location.verticalAccuracy : -1;
        var speed = location.speed ? location.speed : -1;
        var course = location.direction ? location.direction : -1;
        var altitude = location.altitude ? location.altitude : -1;
        var timestamp = location.timestamp ? Foundation.NSDate.dateWithTimeIntervalSince1970(location.timestamp.getTime()) : null;
        var iosLocation = CoreLocation.CLLocation.initWithCoordinateAltitudeHorizontalAccuracyVerticalAccuracyCourseSpeedTimestamp(CoreLocation.CLLocationCoordinate2DMake(location.latitude, location.longitude), altitude, hAccuracy, vAccuracy, course, speed, timestamp);
        return iosLocation;
    }

    public static isLocationEnabled(): boolean {
        return CoreLocation.CLLocationManager.locationServicesEnabled();
    }

    public static distanceInMeters(loc1: types.Location, loc2: types.Location): number {
        if (!loc1.iosNative) {
            loc1.iosNative = LocationManager.iosLocationFromLocation(loc1);
        }
        if (!loc2.iosNative) {
            loc2.iosNative = LocationManager.iosLocationFromLocation(loc2);
        }
        return loc1.iosNative.distanceFromLocation(loc2.iosNative);
    }

    constructor() {
        this.isStarted = false;
        this.desiredAccuracy = types.DesiredAccuracy.HIGH;
        this.updateDistance = -1; // kCLDistanceFilterNone
        this.iosLocationManager = new CoreLocation.CLLocationManager();
    }

    // monitoring
    public startLocationMonitoring(onLocation: (location: types.Location) => any, onError?: (error: Error) => any) {
        if (!this.isStarted) {
            var LocationListener = Foundation.NSObject.extends({
                setupWithFunctions: function (onLocation, onError) {
                    this.onLocation = onLocation;
                    this.onError = onError;
                }

            }, {}).implements({

                protocol: "CLLocationManagerDelegate",

                implementation: {
                    locationManagerDidUpdateLocations: function (manager, locations) {
                        console.log('location received: ' + locations.count());
                        for (var i = 0; i < locations.count(); i++) {
                            this.onLocation(LocationManager.locationFromCLLocation(locations.objectAtIndex(i)));
                        }
                    },

                    locationManagerDidFailWithError: function (manager, error) {
                        console.error('location error received ' + error.localizedDescription());
                        if (this.onError) {
                            this.onError(new Error(error.localizedDescription()));
                        }
                    }
                }
            });

            this.listener = new LocationListener();
            this.listener.setupWithFunctions(onLocation, onError);
            this.iosLocationManager.delegate = this.listener;
            this.iosLocationManager.desiredAccuracy = this.desiredAccuracy;
            this.iosLocationManager.distanceFilter = this.updateDistance;
            this.iosLocationManager.startUpdatingLocation();
        }
        else if (onError) {
            onError(new Error('location monitoring already started'));
        }
    }

    public stopLocationMonitoring() {
        if (this.isStarted) {
            this.iosLocationManager.stopUpdatingLocation();
            this.isStarted = false;
        }
    }

    // other

    public getLastKnownLocation(): types.Location {
        var clLocation = this.iosLocationManager.location;
        if (null != clLocation) {
            return LocationManager.locationFromCLLocation(clLocation);
        }
        return null;
    }
}
