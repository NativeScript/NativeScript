//import locationManagerModule = require("location/location-manager");
import defModule = require("location");
import * as timerModule from "timer";

var defaultGetLocationTimeout = 20000;

@Deprecated
export class Location implements defModule.Location {
    public latitude: number;
    public longitude: number;

    public altitude: number;

    public horizontalAccuracy: number;
    public verticalAccuracy: number;

    public speed: number; // in m/s ?

    public direction: number; // in degrees

    public timestamp: Date;

    public android: any;  // android Location
    public ios: any;      // iOS native location
}

export var getLocation = function (options?: defModule.Options): Promise<defModule.Location> {
    var timerId;
    var locationManager = new defModule.LocationManager();

    if (options && (0 === options.timeout)) {
        return new Promise<defModule.Location>((resolve, reject) => {
            var location = locationManager.lastKnownLocation;
            if (location) {
                if (options && ("number" === typeof options.maximumAge)) {
                    if (location.timestamp.valueOf() + options.maximumAge > new Date().valueOf()) {
                        resolve(location);
                    }
                    else {
                        reject(new Error("timeout is 0 and last known location is older than maximumAge"));
                    }
                }
                else {
                    resolve(location);
                }
            }
            else {
                reject(new Error("timeout is 0 and no known location found"));
            }
        });
    }

    return new Promise<defModule.Location>((resolve, reject) => {
        if (!defModule.LocationManager.isEnabled()) {
            return reject(new Error("Location service is disabled"));
        }

        var timer: typeof timerModule = require("timer");

        locationManager.startLocationMonitoring(function (location: defModule.Location) {
            if (options && ("number" === typeof options.maximumAge)) {
                if (location.timestamp.valueOf() + options.maximumAge > new Date().valueOf()) {
                    locationManager.stopLocationMonitoring();
                    if ("undefined" !== typeof timerId) {
                        timer.clearTimeout(timerId);
                    }
                    resolve(location);
                }
            }
            else {
                locationManager.stopLocationMonitoring();
                if ("undefined" !== typeof timerId) {
                    timer.clearTimeout(timerId);
                }
                resolve(location);
            }
        }, function (error: Error) {
                console.error('Location error received: ' + error);
                locationManager.stopLocationMonitoring();
                if ("undefined" !== typeof timerId) {
                    timer.clearTimeout(timerId);
                }
                reject(error);
            },
            options
            );

        if (options && ("number" === typeof options.timeout)) {
            timerId = timer.setTimeout(function () {
                locationManager.stopLocationMonitoring();
                reject(new Error("timeout searching for location"));
            }, options.timeout || defaultGetLocationTimeout);
        }
    });
}
