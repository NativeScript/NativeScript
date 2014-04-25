import types = require("Location/location_types");
import app_module = require("Application/application");

export class LocationManager {
    // in meters
    // we might need some predefined values here like 'any' and 'high'
    public desiredAccuracy: number;

    // The minimum distance (measured in meters) a device must move horizontally before an update event is generated.
    public updateDistance: number;

    // minimum time interval between location updates, in milliseconds (android only)
    public minimumUpdateTime: number;

    public isStarted: boolean;
    private androidLocationManager: any;

    private _locationListener: any;

    private static locationFromAndroidLocation(androidLocation: android.location.Location): types.Location {
        var location = new types.Location();
        location.latitude = androidLocation.getLatitude();
        location.longitude = androidLocation.getLongitude();
        location.altitude = androidLocation.getAltitude();
        location.horizontalAccuracy = androidLocation.getAccuracy();
        location.verticalAccuracy = androidLocation.getAccuracy();
        location.speed = androidLocation.getSpeed();
        location.direction = androidLocation.getBearing();
        location.timestamp = new Date(androidLocation.getTime());
        location.androidNative = androidLocation;
        //console.dump(location);
        return location;
    }

    private static androidLocationFromLocation(location: types.Location): android.location.Location {
        var androidLocation = new android.location.Location('custom');
        androidLocation.setLatitude(location.latitude);
        androidLocation.setLongitude(location.longitude);
        if (location.altitude)
            androidLocation.setAltitude(location.altitude);
        if (location.speed)
            androidLocation.setSpeed(float(location.speed));
        if (location.direction)
            androidLocation.setBearing(float(location.direction));
        if (location.timestamp) {
            try {
                androidLocation.setTime(long(location.timestamp.getTime()));
            }
            catch (e) {
                console.error('invalid location timestamp');
            }
        }
        return androidLocation;
    }

    public static isLocationEnabled(): boolean {
        var criteria = new android.location.Criteria();
        criteria.setAccuracy(1); // low ? fine ? who knows what 1 means (bug in android docs?)
        var lm = app_module.Application.current.android.context.getSystemService('location');
        return (lm.getBestProvider(criteria, true) != null) ? true : false;
    }

    public static distanceInMeters(loc1: types.Location, loc2: types.Location): number {
        if (!loc1.androidNative) {
            loc1.androidNative = LocationManager.androidLocationFromLocation(loc1);
        }
        if (!loc2.androidNative) {
            loc2.androidNative = LocationManager.androidLocationFromLocation(loc2);
        }
        return loc1.androidNative.distanceTo(loc2.androidNative);
    }

    constructor() {
        // put some defaults
        this.desiredAccuracy = types.DesiredAccuracy.HIGH;
        this.updateDistance = 0; 
        this.minimumUpdateTime = 200;
        this.isStarted = false;

        this.androidLocationManager = app_module.Application.current.android.context.getSystemService('location');
    }

    ////////////////////////
    // monitoring
    ////////////////////////

    public startLocationMonitoring(onLocation: (location: types.Location) => any, onError?: (error: Error) => any) {
        if (!this.isStarted) {
            var criteria = new android.location.Criteria();
            criteria.setAccuracy((this.desiredAccuracy === types.DesiredAccuracy.HIGH) ? 1 : 2);
            this._locationListener = <any>new android.location.LocationListener({
                onLocationChanged: function (location: android.location.Location) {
                    if (this._onLocation) {
                        this._onLocation(LocationManager.locationFromAndroidLocation(location));
                    }
                },

                onProviderDisabled: function (provider: string) {
                },

                onProviderEnabled: function (provider: string) {
                },

                onStatusChanged: function (arg1: string, arg2: number, arg3: android.os.Bundle): void {
                }
            });
            this._locationListener._onLocation = onLocation;
            this._locationListener._onError = onError;
            try {
                this.androidLocationManager.requestLocationUpdates(long(this.minimumUpdateTime), float(this.updateDistance), criteria, this._locationListener, null);
                this.isStarted = true;
            }
            catch (e) {
                if (onError) {
                    onError(e);
                }
            }
        }
        else if (onError) {
            onError(new Error('location monitoring already started'));
        }

    }

    public stopLocationMonitoring() {
        if (this.isStarted) {
            this.androidLocationManager.removeUpdates(this._locationListener);
            this.isStarted = false;
        }
    }

    ////////////////////////
    // other
    ////////////////////////

    public getLastKnownLocation(): types.Location {
        var criteria = new android.location.Criteria();
        criteria.setAccuracy((this.desiredAccuracy === types.DesiredAccuracy.HIGH) ? 1 : 2);
        try {
            var providers = this.androidLocationManager.getProviders(criteria, false);
            var it = providers.iterator();
            while (it.hasNext()) {
                var element = it.next();
                console.log('found provider: ' + element);
                var location = this.androidLocationManager.getLastKnownLocation(element);
                if (location) {
                    return LocationManager.locationFromAndroidLocation(location);
                }
            }
        }
        catch (e) {
            console.error(e.message);
        }

        return null;
    }

}