// >> location-require
import locationModule = require("location");
// << location-require

import TKUnit = require("./TKUnit");

var LocationManager = locationModule.LocationManager;
var Location = locationModule.Location;

var locationIsEnabled: boolean;

export function setUp() {
    locationIsEnabled = LocationManager.isEnabled();
}

export function tearDown() {
    locationIsEnabled = undefined;
}

export var testIsEnabled = function () {
    if (!locationIsEnabled) {
		console.log("Location service is not enabled!!!");
        return;
    }
    // >> location-funcs
    //var LocationManager = require("location").LocationManager;
    var isEnabled = LocationManager.isEnabled();
    // << location-funcs
    TKUnit.assert(isEnabled);
};

export var testDistance = function () {
    // >> location-distance
    //var Location = require("location").Location;
    var locSofia = new Location();
    locSofia.longitude = 42.696552;
    locSofia.latitude = 23.32601;
    var locNewYork = new Location();
    locNewYork.longitude = 40.71448;
    locNewYork.latitude = -74.00598;
    var distance = LocationManager.distance(locSofia, locNewYork);
    // << location-distance
    TKUnit.assert((distance > 10780000) && (distance < 10860000), "invalid distance " + distance);
};

export var testLocation = function (done) {
    if (!locationIsEnabled) {
        done(null);
    }

    var locationReceived;

    // >> location-updates 
    //var LocationManager = require("location").LocationManager;
    var locationManager = new LocationManager();

    locationManager.startLocationMonitoring(function (location) {
        //console.log('Location received: ' + JSON.stringify(location));
        // >> (hide)
        locationReceived = true;
        locationManager.stopLocationMonitoring();
        try {
            TKUnit.assert(true === locationReceived, locationReceived);
            done(null);
        }
        catch (e) {
            done(e);
        }
        // << (hide)
    }, function (error) {
            //console.log('Location error received: ' + error);
            // >> (hide)
        locationReceived = error;
        locationManager.stopLocationMonitoring();
        done(error);
            // << (hide)
        }
        );

    // << location-updates
    //var isReady = function () {
    //    return locationReceived;
    //}

    //TKUnit.waitUntilReady(isReady, 10);

    

    //TKUnit.assert(true === locationReceived, locationReceived);
};

export var testLastKnownLocation = function () {
    if (!locationIsEnabled) {
        return;
    }

    TKUnit.waitUntilReady(function () { return false; }, 1); // give it some time after the last test
    // >> location-last-known
    // var LocationManager = require("location").LocationManager;
    var locationManager = new LocationManager();
    var lastKnownLocation = locationManager.lastKnownLocation;
    // << location-last-known
    TKUnit.assert((lastKnownLocation != null), "There is no last known location");
};

function doOnce(options: locationModule.Options, done) {
    if (!locationIsEnabled) {
        return done(null);
    }
    var locationReceived;
    locationModule.getLocation(options).then(function (location) {
        locationReceived = true;
        try {
            TKUnit.assert(true === locationReceived, locationReceived);
            done(null);
        }
        catch (e) {
            done(e);
        }
    }, function (error) {
        locationReceived = error;
        done(error);
    });
}

export var testLocationOnce = function (done) {
    doOnce(undefined, done);
};

export var testLocationOnceTimeout0 = function (done) {
    doOnce({ timeout: 0 }, done);
};

export var testLocationOnceMaximumAge = function (done) {
    if (!locationIsEnabled) {
        return done(null);
    }
    TKUnit.waitUntilReady(function () { return false; }, 2);
    doOnce({ maximumAge: 86400000, timeout: 0 }, done); // this should pass max age denotes that Real location is taken today.
    doOnce({ maximumAge: 1000, timeout: 0 }, (err) => {
        if (err && err.message === "timeout is 0 and last known location is older than maximumAge") {
            // since last known location is taken before 1 sec (what is the meaning of the maximumAge: 1000 value)
            // we consider this as a successful test since we test that maxAge check is working
            done(null);
        }
        else {
            done(new Error("maximumAge check failed"));
        }
    });
};

export var testLocationOnceTimeout10000 = function (done) {
    doOnce({ timeout: 10000 }, done);
};

export var testSnippet = function (done) {
    if (!locationIsEnabled) {
        return done(null);
    }
    var locationReceived;
    // >> location-timeour
    // var locationModule = require("location");
    //// options can also look like { maximumAge: 2000, timeout: 20 * 1000 }
    locationModule.getLocation({ maximumAge: 30000, timeout: 5000 }).then(function (location) {
        //console.log('Location received: ' + location);
        // >> (hide)
        locationReceived = true;
        done(null);
        // << (hide)
    }, function (error) {
            //console.log('Location error received: ' + error);
            // >> (hide)
        locationReceived = error;
        done(error);
            // << (hide)
        });
    // << location-timeour
};
