import promises = require("promises");
import timer = require("timer/timer");
import types = require("location/location-types");
import locationManagerModule = require("location/location-manager");

// merge the exports of the types module with the exports of this file
import merger = require("utils/module-merge");
declare var exports;
merger.merge(types, exports);
merger.merge(locationManagerModule, exports);

export var getLocation = function (options?: types.Options): promises.Promise<types.Location> {
    var d = promises.defer<types.Location>();

    var timerId;
    var locationManager = new locationManagerModule.LocationManager();

    if (options && (0 === options.timeout)) {
        var location = locationManager.lastKnownLocation;
        if (location) {
            if (options && ("number" === typeof options.maximumAge)) {
                if (location.timestamp.valueOf() + options.maximumAge > new Date().valueOf()) {
                    d.resolve(location);
                }
                else {
                    d.reject(new Error("timeout is 0 and last known location is older than maximumAge"));
                }
            }
            else {
                d.resolve(location);
            }
        }
        else {
            d.reject(new Error("timeout is 0 and no known location found"));
        }
        return d.promise();
    }

    locationManager.startLocationMonitoring(function (location: types.Location) {
            if (options && ("number" === typeof options.maximumAge)) {
                if (location.timestamp.valueOf() + options.maximumAge > new Date().valueOf()) {
                    locationManager.stopLocationMonitoring();
                    if ("undefined" !== typeof timerId) {
                        timer.clearTimeout(timerId);
                    }
                    d.resolve(location);
                }
            }
            else {
                locationManager.stopLocationMonitoring();
                if ("undefined" !== typeof timerId) {
                    timer.clearTimeout(timerId);
                }
                d.resolve(location);
            }
        }, function (error: Error) {
            console.error('Location error received: ' + error);
            locationManager.stopLocationMonitoring();
            if ("undefined" !== typeof timerId) {
                timer.clearTimeout(timerId);
            }
            d.reject(error);
        },
        options
    );

    if (options && ("number" === typeof options.timeout)) {
        timerId = timer.setTimeout(function () {
            locationManager.stopLocationMonitoring();
            d.reject(new Error("timeout searching for location"));
        }, options.timeout);
    }

    return d.promise();
}

//export class LocationManager {
//    private nativeManager: locationManagerModule.LocationManager;

//    public static isEnabled(): boolean {
//        return locationManagerModule.LocationManager.isEnabled();
//    }

//    public static distance(loc1: types.Location, loc2: types.Location): number {
//        return locationManagerModule.LocationManager.distance(loc1, loc2);
//    }

//    constructor() {
//        this.nativeManager = new locationManagerModule.LocationManager();
//    }

//    // monitoring
//    public startLocationMonitoring(onLocation: (location: types.Location) => any, onError?: (error: Error) => any, options?: types.Options) {
//        this.nativeManager.startLocationMonitoring(onLocation, onError, options);
//    }

//    public stopLocationMonitoring() {
//        this.nativeManager.stopLocationMonitoring();
//    }

//    // other

//    get lastKnownLocation(): types.Location {
//        return this.nativeManager.lastKnownLocation;
//    }
//}
