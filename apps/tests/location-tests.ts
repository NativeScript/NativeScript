// <snippet module="location" title="location">
// # Location
// Using the location requires the Location module.
// ``` JavaScript
import locationModule = require("location");
// ```
// </snippet>

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

// <snippet module="location" title="location">
// ## Other functions
// </snippet>

export var testIsEnabled = function () {
    if (!locationIsEnabled) {
		console.log("Location service is not enabled!!!");
        return;
    }
    // <snippet module="location" title="location">
    // ### Test are location services available for this device
    // ``` JavaScript
    var isEnabled = LocationManager.isEnabled();
    // ```
    // </snippet>
    TKUnit.assert(isEnabled);
};

export var testDistance = function () {
    // <snippet module="location" title="location">
    // ### Get distance between two locations
    // ``` JavaScript
    //var Location = require("location").Location;
    var locSofia = new Location();
    locSofia.longitude = 42.696552;
    locSofia.latitude = 23.32601;
    var locNewYork = new Location();
    locNewYork.longitude = 40.71448;
    locNewYork.latitude = -74.00598;
    var distance = LocationManager.distance(locSofia, locNewYork);
    // ```
    // </snippet>
    TKUnit.assert((distance > 10780000) && (distance < 10860000), "invalid distance " + distance);
};

// <snippet module="location" title="location">
// ## Getting location
// </snippet>

export var testLocation = function (done) {
    if (!locationIsEnabled) {
        done(null);
    }

    var locationReceived;

    // <snippet module="location" title="location">
    // ### Receive continuous location updates
    // ``` JavaScript
    var locationManager = new LocationManager();

    locationManager.startLocationMonitoring(function (location) {
        //console.log('Location received: ' + location);
        // <hide>
        locationReceived = true;
        locationManager.stopLocationMonitoring();
        try {
            TKUnit.assert(true === locationReceived, locationReceived);
            done(null);
        }
        catch (e) {
            done(e);
        }
        // </hide>
    }, function (error) {
            //console.log('Location error received: ' + error);
            // <hide>
        locationReceived = error;
        locationManager.stopLocationMonitoring();
        done(error);
            // </hide>
        }
        );

    // ```
    // </snippet>
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
    // <snippet module="location" title="location">
    // ### Get last known location
    // ``` JavaScript
    var locationManager = new LocationManager();
    var lastKnownLocation = locationManager.lastKnownLocation;
    // ```
    // </snippet>
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
    doOnce({ maximumAge: 20000, timeout: 0 }, done); // this should pass
    try {
        doOnce({ maximumAge: 1000, timeout: 0 }, done);
        TKUnit.assert(false, "maximumAge check failed");
    }
    catch (e) {
        //
    }
};

export var testLocationOnceTimeout10000 = function (done) {
    doOnce({ timeout: 10000 }, done);
};

export var testSnippet = function (done) {
    if (!locationIsEnabled) {
        return done(null);
    }
    var locationReceived;
    // <snippet module="location" title="location">
    // ### Get location once
    // if there is `options.timeout` you will receive error on timeout. If `options.timeout` is 0 then the result is the same as the result from `LocationManager.lastKnownLocation`
    // and there will be no wait. You can use `options.maximumAge` to specify you don't want to receive locations older than specified time in ms.
    //
    // ``` JavaScript
    // var locationModule = require("location");
    //// options can also look like { maximumAge: 2000, timeout: 20 * 1000 }
    locationModule.getLocation({ maximumAge: 30000, timeout: 0 }).then(function (location) {
        //console.log('Location received: ' + location);
        // <hide>
        locationReceived = true;
        done(null);
        // </hide>
    }, function (error) {
            //console.log('Location error received: ' + error);
            // <hide>
        locationReceived = error;
        done(error);
            // </hide>
        });
    // ```
    // </snippet>
};
