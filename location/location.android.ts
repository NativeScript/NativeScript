import enums = require("ui/enums");
import locationModule = require("location");
import common = require("./location-common");
import utils = require("utils/utils");

global.moduleMerge(common, exports);

export class LocationManager implements locationModule.LocationManager {
	get android(): locationModule.AndroidLocationManager {
		return this.androidLocationManager;
	}

	get ios(): locationModule.iOSLocationManager {
		return undefined;
	}

	public isStarted: boolean;
    // in meters
    public desiredAccuracy: number;

    // The minimum distance (measured in meters) a device must move horizontally before an update event is generated.
    public updateDistance: number;

    private androidLocationManager: locationModule.AndroidLocationManager;

    private _locationListener: any;

    get locationListener(): any {
        if (!this._locationListener) {
            this._locationListener = <any>new android.location.LocationListener({
                onLocationChanged: function (location1: android.location.Location) {
                    if (this._onLocation) {
                        var location = LocationManager.locationFromAndroidLocation(location1);
                        if (this.maximumAge) {
                            if (location.timestamp.valueOf() + this.maximumAge > new Date().valueOf()) {
                                this._onLocation(location);
                            }
                        }
                        else {
                            this._onLocation(location);
                        }
                    }
                },

                onProviderDisabled: function (provider: string) {
                    //
                },

                onProviderEnabled: function (provider: string) {
                    //
                },

                onStatusChanged: function (arg1: string, arg2: number, arg3: android.os.Bundle): void {
                    //
                }
            });
        }
        return this._locationListener;
    }

    private static locationFromAndroidLocation(androidLocation: android.location.Location): locationModule.Location {
        var location = new locationModule.Location();
        location.latitude = androidLocation.getLatitude();
        location.longitude = androidLocation.getLongitude();
        location.altitude = androidLocation.getAltitude();
        location.horizontalAccuracy = androidLocation.getAccuracy();
        location.verticalAccuracy = androidLocation.getAccuracy();
        location.speed = androidLocation.getSpeed();
        location.direction = androidLocation.getBearing();
        location.timestamp = new Date(androidLocation.getTime());
        location.android = androidLocation;
        return location;
    }

    private static androidLocationFromLocation(location: locationModule.Location): android.location.Location {
        var androidLocation = new android.location.Location('custom');
        androidLocation.setLatitude(location.latitude);
        androidLocation.setLongitude(location.longitude);
        if (location.altitude) {
            androidLocation.setAltitude(location.altitude);
        }
        if (location.speed) {
            androidLocation.setSpeed(float(location.speed));
        }
        if (location.direction) {
            androidLocation.setBearing(float(location.direction));
        }
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

    public static isEnabled(): boolean {
        var criteria = new android.location.Criteria();
        criteria.setAccuracy(android.location.Criteria.ACCURACY_COARSE);
        var lm = utils.ad.getApplicationContext().getSystemService(android.content.Context.LOCATION_SERVICE);
        // due to bug in android API getProviders() with criteria parameter overload should be called (so most loose acuracy is used).
        var enabledProviders = lm.getProviders(criteria, true);
        return (enabledProviders.size() > 0) ? true : false;
    }

    public static distance(loc1: locationModule.Location, loc2: locationModule.Location): number {
        if (!loc1.android) {
            loc1.android = LocationManager.androidLocationFromLocation(loc1);
        }
        if (!loc2.android) {
            loc2.android = LocationManager.androidLocationFromLocation(loc2);
        }
        return loc1.android.distanceTo(loc2.android);
    }

    constructor() {
		//super();
        this.desiredAccuracy = enums.Accuracy.any;
        this.updateDistance = 0; 
        
		//this.androidLocationManager = utils.ad.getApplicationContext().getSystemService(android.content.Context.LOCATION_SERVICE);
        var alm = utils.ad.getApplicationContext().getSystemService(android.content.Context.LOCATION_SERVICE);
		this.androidLocationManager = new AndroidLocationManager(alm);
		this.androidLocationManager.minimumUpdateTime = 200;
    }

    public startLocationMonitoring(onLocation: (location: locationModule.Location) => any, onError?: (error: Error) => any, options?: locationModule.Options) {
        var criteria = new android.location.Criteria();
        if (options) {
            if (options.desiredAccuracy) {
                this.desiredAccuracy = options.desiredAccuracy;
            }
            if (options.updateDistance) {
                this.updateDistance = options.updateDistance;
            }
            if (options.minimumUpdateTime) {
                this.androidLocationManager.minimumUpdateTime = options.minimumUpdateTime;
            }
        }
		criteria.setAccuracy((this.desiredAccuracy === enums.Accuracy.high) ? android.location.Criteria.ACCURACY_FINE : android.location.Criteria.ACCURACY_COARSE);

        this.locationListener._onLocation = onLocation;
        this.locationListener._onError = onError;
        this.locationListener.maximumAge = (options && ("number" === typeof options.maximumAge)) ? options.maximumAge : undefined;
        try {
            this.androidLocationManager.manager.requestLocationUpdates(this.androidLocationManager.minimumUpdateTime, this.updateDistance, criteria, this.locationListener, null);
			this.isStarted = true;
        }
        catch (e) {
            if (onError) {
                onError(e);
            }
        }
    }

    public stopLocationMonitoring() {
        this.androidLocationManager.manager.removeUpdates(this.locationListener);
		this.isStarted = false;
    }

    get lastKnownLocation(): locationModule.Location {
        var criteria = new android.location.Criteria();
        criteria.setAccuracy((this.desiredAccuracy === enums.Accuracy.high) ? android.location.Criteria.ACCURACY_FINE : android.location.Criteria.ACCURACY_COARSE);
        try {
            var providers = this.androidLocationManager.manager.getProviders(criteria, false);
            var it = providers.iterator();
            var location: android.location.Location;
            var tempLocation: android.location.Location;
            while (it.hasNext()) {
                var element = it.next();
                //console.log('found provider: ' + element);
                tempLocation = this.androidLocationManager.manager.getLastKnownLocation(element);
                if (!location) {
                    location = tempLocation;
                }
                else {
                    if (tempLocation.getTime() < location.getTime()) {
                        location = tempLocation;
                    }
                }
            }
            if (location) {
                return LocationManager.locationFromAndroidLocation(location);
            }
        }
        catch (e) {
            console.error(e.message);
        }

        return null;
    }
}

export class AndroidLocationManager implements locationModule.AndroidLocationManager {
	private _manager: android.location.LocationManager;
	private _minimumUpdateTime: number;

	public set minimumUpdateTime(value: number) {
		this._minimumUpdateTime = value;
	}

	public get minimumUpdateTime(): number {
		return this._minimumUpdateTime;
	}

	public get manager(): android.location.LocationManager {
		return this._manager;
	}

	constructor(manager: android.location.LocationManager) {
		this._manager = manager;
	}
}
