Initializing location:

```
var LocationManager = require("Location").LocationManager;

console.log('is location enabled: ' + LocationManager.isLocationEnabled());

this.locationManager = new LocationManager();

console.dump(this.locationManager.getLastKnownLocation());

this.locationManager.startLocationMonitoring(function(location) {
    console.dump(location);
}, function(error) {
    console.error(error);
});
```

Stopping location:

```
this.locationManager.stopLocationMonitoring();
```