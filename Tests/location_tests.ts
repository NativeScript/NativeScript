import TKUnit = require("Tests/TKUnit");
import locationModule = require("location/location");
import types = require("location/location_types");

var LocationManager = locationModule.LocationManager;
var Location = locationModule.Location;

export var testIsEnabled = function () {
    TKUnit.assert(LocationManager.isEnabled());
};

export var testLocation = function () {
    var locationReceived;

    var locationManager = new LocationManager();

    locationManager.startLocationMonitoring(function(location) {
            locationReceived = true;
        }, function(error) {
            //console.log('Location error received: ' + error);
            locationReceived = error;
        }
    );

    var isReady = function () {
        return locationReceived;
    }

    TKUnit.waitUntilReady(isReady, 10);

    locationManager.stopLocationMonitoring();

    TKUnit.assert(true === locationReceived, locationReceived);
};

export var testDistance = function () {
    var locSofia = new Location();
    locSofia.longitude = 42.696552;
    locSofia.latitude = 23.32601;
    var locNewYork = new Location();
    locNewYork.longitude = 40.71448;
    locNewYork.latitude = -74.00598;
    var distance = LocationManager.distance(locSofia, locNewYork);
    TKUnit.assert((distance > 10780000) && (distance < 10860000), "invalid distance " + distance);
};

export var testLastKnownLocation = function () {
    var locationManager = new LocationManager();
    var lastKnownLocation = locationManager.lastKnownLocation;
    TKUnit.assert((lastKnownLocation != null), "There is no last known location");
};

function doOnce(options: locationModule.Options) {
    var locationReceived;
    locationModule.getLocation(options).then(function (location) {
        locationReceived = true;
    }).fail(function (error) {
        //console.log('Location error received: ' + error);
        locationReceived = error;
    });

    var isReady = function () {
        return locationReceived;
    }

    TKUnit.waitUntilReady(isReady, 10);

    TKUnit.assert(true === locationReceived, locationReceived);
}

export var testLocationOnce = function () {
    doOnce(undefined);
};

export var testLocationOnceTimeout0 = function () {
    doOnce({timeout: 0});
};

export var testLocationOnceMaximumAge = function () {
    TKUnit.waitUntilReady(function () { return false; }, 2);
    doOnce({ maximumAge: 3000, timeout: 0 }); // this should pass
    try {
        doOnce({ maximumAge: 1000, timeout: 0 });
        TKUnit.assert(false, "maximumAge check failed");
    }
    catch (e) {
    }
};

export var testLocationOnceTimeout1000 = function () {
    doOnce({ timeout: 1000 });
};
