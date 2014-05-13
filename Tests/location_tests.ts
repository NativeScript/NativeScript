import TKUnit = require("Tests/TKUnit");
import locationModule = require("location/location");

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
            console.log('Location error received: ' + error);
            locationReceived = error;
        }
    );

    var timeoutAfter = 50; // 5 seconds timeout
    while (typeof locationReceived == 'undefined') {
        if (0 >= --timeoutAfter) {
            locationReceived = 'Location search timed out!';
            break;
        }
        TKUnit.wait(100);
    }

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
 