import application = require("application");

application.mainModule = "main-page";

application.on(application.exitEvent, () => {
    if (application.android) {
        application.android.unregisterBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED);
    }
    else {
        application.ios.removeNotificationObserver(UIDeviceBatteryLevelDidChangeNotification);
    }
});

application.start();
