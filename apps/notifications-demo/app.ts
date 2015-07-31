import application = require("application");
import native_api = require("native-api");

application.mainModule = "main-page";

application.on(application.exitEvent, () => {
    if (application.android) {
        application.android.unregisterBroadcastReceiver(native_api.android.content.Intent.ACTION_BATTERY_CHANGED);
    }
    else {
        application.ios.removeNotificationObserver(native_api.UIDeviceBatteryLevelDidChangeNotification);
    }
});

application.start();
