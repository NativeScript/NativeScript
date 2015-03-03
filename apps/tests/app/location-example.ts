import pages = require("ui/page");
import gridLayoutModule = require("ui/layouts/grid-layout");
import bm = require("ui/button");
import locationModule = require("location");
import dialogsModule = require("ui/dialogs");
import trace = require("trace");
import platformModule = require("platform");
import textViewModule = require("ui/text-view");

export function createPage() {
    function printLocation(location: locationModule.Location) {
        return "longitude: " + location.longitude + ", " +
            "latitude: " + location.latitude + ", " +
            "timeStamp: " + location.timestamp + ", " +
            "horizontalAccuracy: " + location.horizontalAccuracy + ", " +
            "verticalAccuracy: " + location.verticalAccuracy;
    }

    var locationManager = new locationModule.LocationManager();

    var textView = new textViewModule.TextView();
    textView.editable = false;
    textView.style.fontSize = 8;

    var startButton = new bm.Button();
    startButton.text = "Start";
    startButton.on(bm.knownEvents.tap, function (eventData) {
        locationManager.startLocationMonitoring(function (location) {
            trace.write("location: " + printLocation(location), trace.categories.Test, trace.messageType.info);
            textView.text = printLocation(location) + "\r\n" + textView.text;
        }, null, {desiredAccuracy: 3, maximumAge: 20000, minimumUpdateTime: 5000, updateDistance: 0});
    });

    var stopButton = new bm.Button();
    stopButton.text = "Stop";
    stopButton.on(bm.knownEvents.tap, function (eventData) {
        locationManager.stopLocationMonitoring();
    });

    var grid = new gridLayoutModule.GridLayout();

    grid.addRow(new gridLayoutModule.ItemSpec(1, gridLayoutModule.GridUnitType.auto));
    grid.addRow(new gridLayoutModule.ItemSpec());
    
    grid.addColumn(new gridLayoutModule.ItemSpec(100, gridLayoutModule.GridUnitType.pixel));
    grid.addColumn(new gridLayoutModule.ItemSpec());

    gridLayoutModule.GridLayout.setColumn(startButton, 0);
    gridLayoutModule.GridLayout.setColumn(stopButton, 1);
    gridLayoutModule.GridLayout.setRow(textView, 1);
    gridLayoutModule.GridLayout.setColumnSpan(textView, 2);

    grid.addChild(startButton);
    grid.addChild(stopButton);
    grid.addChild(textView);

    var checkLocationService = function (page: pages.Page) {
        if (locationModule.LocationManager.isEnabled()) {
            trace.write("LocationManager.isEnabled", trace.categories.Test, trace.messageType.info);
        }
        else {
            trace.write("LocationManager.is not Enabled", trace.categories.Test, trace.messageType.info);
            if (page.android) {
                dialogsModule.confirm({
                    message: "Location service is not enabled!",
                    okButtonText: "Open location settings ...",
                    cancelButtonText: "Cancel", title: "Confirm"
                }).then((r) => {
                        if (r) {
                            (<android.app.Activity>page._context).startActivityForResult(new android.content.Intent(android.provider.Settings.ACTION_LOCATION_SOURCE_SETTINGS), 0);
                        }
                    }, null);
            }
            else if (page.ios) {
                if (platformModule.device.osVersion.indexOf("8") === 0) {
                    var iosLocationManager = CLLocationManager.alloc().init();
                    iosLocationManager.requestWhenInUseAuthorization();
                }
            }
        }
    }

    var page = new pages.Page();

    page.on("loaded", function () {
        checkLocationService(page);
        page.frame.on("loaded", function () {
            checkLocationService(page);            
        });
    });

    page.content = grid;
    return page;
}