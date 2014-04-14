import types = require("Location/location_types");

export class LocationManager {

    private isStarted: boolean;
    private locationManager: CoreLocation.CLLocationManager;

    public isLocationEnabled(): boolean {
        return CoreLocation.CLLocationManager.locationServicesEnabled();
    }

    constructor() {
        this.isStarted = false;
        this.desiredAccuracy = types.DesiredAccuracy.HIGH;
        this.updateDistance = -1; // kCLDistanceFilterNone
        this.locationManager = new CoreLocation.CLLocationManager();
    }

    // in meters
    // we might need some predefined values here like 'any' and 'high'
    public desiredAccuracy: number;

    // The minimum distance (measured in meters) a device must move horizontally before an update event is generated.
    public updateDistance: number;

    // listeners
    //public locationChangeListener: types.LocationChangeListener;

    // monitoring

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
        console.dump(location);
        return location;
    }

    public startLocationMonitoring(onLocation: (location: types.Location) => any, onError?: (error: string) => any) {
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
                        console.log('location error received ' + error.localizedDescription());
                        if (this.onError) {
                            this.onError(error.localizedDescription());
                        }
                    }
                }
            });

            var listener = new LocationListener();
            listener.setupWithFunctions(onLocation, onError);
            this.locationManager.delegate = listener;
            this.locationManager.desiredAccuracy = this.desiredAccuracy;
            this.locationManager.distanceFilter = this.updateDistance;
            this.locationManager.startUpdatingLocation();
        }
        else if (onError) {
            onError('location monitoring already started');
        }
    }

    public stopLocationMonitoring() {
        if (this.isStarted) {
            this.locationManager.stopUpdatingLocation();
            this.isStarted = false;
        }
    }

    // other

    public getLastKnownLocation(): types.Location {
        var clLocation = this.locationManager.location;
        if (null != clLocation) {
            return LocationManager.locationFromCLLocation(clLocation);
        }
        return null;
    }

    public distanceInMeters(loc1: types.Location, loc2: types.Location): number {
        // TODO
        return 0;
    }
}
