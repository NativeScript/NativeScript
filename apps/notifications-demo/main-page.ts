import application = require("application");
import observable = require("data/observable");
import pages = require("ui/page");
import labelModule = require("ui/label");
import native_api = require("native-api");

var batteryLabel: labelModule.Label;
var registered = false;
export function onPageLoaded(args: observable.EventData) {
    var page = <pages.Page>args.object;
    batteryLabel = page.getViewById<labelModule.Label>("batteryLabel");

    if (registered) {
        return;
    }

    if (application.android) {
        application.android.registerBroadcastReceiver(native_api.android.content.Intent.ACTION_BATTERY_CHANGED,
            function onReceiveCallback(context: native_api.android.content.Context, intent: native_api.android.content.Intent) {
                var level = intent.getIntExtra(native_api.android.os.BatteryManager.EXTRA_LEVEL, -1);
                var scale = intent.getIntExtra(native_api.android.os.BatteryManager.EXTRA_SCALE, -1);
                var percent = (level / scale) * 100.0;
                var message = "Battery: " + percent + "%";
                console.log(message);
                batteryLabel.text = message;
            });
    }
    else {
        var onReceiveCallback = function onReceiveCallback(notification: native_api.NSNotification) {
            var percent = native_api.UIDevice.currentDevice().batteryLevel * 100;
            var message = "Battery: " + percent + "%";
            console.log(message);
            batteryLabel.text = message;
        }
        native_api.UIDevice.currentDevice().batteryMonitoringEnabled = true;
        onReceiveCallback(null);
        application.ios.addNotificationObserver(native_api.UIDeviceBatteryLevelDidChangeNotification, onReceiveCallback);
    }
    registered = true;
}
