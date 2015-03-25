import pages = require("ui/page");
import locationModule = require("location");
import dialogsModule = require("ui/dialogs");
import platformModule = require("platform");
import textViewModule = require("ui/text-view");
import observable = require("data/observable");
import appModule = require("application");

var locationManager = new locationModule.LocationManager();

export function onStartButtonTap(args: observable.EventData) {
	console.log("Start button tapped");
	var textView = <textViewModule.TextView>(page.getViewById("textView"));
	locationManager.startLocationMonitoring(function (location) {
		console.log("location-example.location: " + printLocation(location));
		textView.text = printLocation(location) + "\r\n" + textView.text;
	}, null, { desiredAccuracy: 300, maximumAge: 20000, minimumUpdateTime: 5000, updateDistance: 20 });
}

function printLocation(location: locationModule.Location) {
	return "longitude: " + location.longitude + ", " +
		"latitude: " + location.latitude + ", " +
		"timeStamp: " + location.timestamp + ", " +
		"horizontalAccuracy: " + location.horizontalAccuracy + ", " +
		"verticalAccuracy: " + location.verticalAccuracy;
}

export function onStopButtonTap(args: observable.EventData) {
	locationManager.stopLocationMonitoring();
}

export function onRequestButtonTap(args: observable.EventData) {
	checkLocationService(page);
}

var page: pages.Page;

export function pageLoaded(args: observable.EventData) {
	page = <pages.Page>(args.object);
}

var checkLocationService = function (page: pages.Page) {
	if (locationModule.LocationManager.isEnabled()) {
		console.log("LocationManager.isEnabled");
	}
	else {
		console.log("LocationManager.is not Enabled");
		if (page.android) {
			dialogsModule.confirm({
				message: "Location service is not enabled!",
				okButtonText: "Open location settings ...",
				cancelButtonText: "Cancel", title: "Confirm"
			}).then((r) => {
				if (r) {
					// do not forget to add android.permission.ACCESS_FINE_LOCATION in your manifest file
					(<android.app.Activity>appModule.android.currentContext).startActivityForResult(new android.content.Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS), 0);
				}
			}, null);
		}
		else if (page.ios) {
			if (platformModule.device.osVersion.indexOf("8") === 0) {
				// we need special handling of iOS 8.0 version, since some breaking changes regarding location
				// do not forget to put NSLocationWhenInUseUsageDescription in app.plist file
				var iosLocationManager = CLLocationManager.alloc().init();
				iosLocationManager.requestWhenInUseAuthorization();
			}
		}
	}
}