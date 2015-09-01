import application = require("application");
import observable = require("data/observable");
import pages = require("ui/page");
import labelModule = require("ui/label");

var batteryLabel: labelModule.Label;
var registered = false;
var batteryObserver: any;

application.on(application.exitEvent, () => {
    if (application.android) {
        application.android.unregisterBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED);
    }
    else {
        application.ios.removeNotificationObserver(batteryObserver, UIDeviceBatteryLevelDidChangeNotification);
    }
});

export function onPageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    batteryLabel = page.getViewById<labelModule.Label>("batteryLabel");

    if (registered) {
        return;
    }

    if (application.android) {
        application.android.registerBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED,
            function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
                var level = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
                var scale = intent.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1);
                var percent = (level / scale) * 100.0;
                var message = "Battery: " + percent + "%";
                console.log(message);
                batteryLabel.text = message;
            });
    }
    else {
        var onReceiveCallback = function onReceiveCallback(notification: NSNotification) {
            var percent = UIDevice.currentDevice().batteryLevel * 100;
            var message = "Battery: " + percent + "%";
            console.log(message);
            batteryLabel.text = message;
        }
        UIDevice.currentDevice().batteryMonitoringEnabled = true;
        onReceiveCallback(null);
        batteryObserver = application.ios.addNotificationObserver(UIDeviceBatteryLevelDidChangeNotification, onReceiveCallback);
    }
    registered = true;
}
