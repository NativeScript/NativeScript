
import types = require("location/location-types");
import promises = require("promises/promises");
import locationModule = require("location/location");
import timer = require("timer/timer");

export var getLocation = function (options?: types.Options) : promises.Promise<types.Location> {
    var d = promises.defer<types.Location>();

    var timerId;
    var locationManager = new locationModule.LocationManager();

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
