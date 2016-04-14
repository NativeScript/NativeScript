/* tslint:disable:no-unused-variable */
import app = require("application");
import TKUnit = require("./TKUnit"); 
import commonTests = require("./application-tests-common");

global.moduleMerge(commonTests, exports);

// >> application-app-android
var androidApp = app.android;
// << application-app-android

// >> application-app-android-context
var context = app.android.context;
//// get the Files (Documents) folder (directory)
var dir = context.getFilesDir();
// << application-app-android-context

// >> application-app-android-current
if (androidApp.foregroundActivity === androidApp.startActivity) {
    ////console.log("We are currently in the main (start) activity of the application");
}
// << application-app-android-current

// >> application-app-android-broadcast
//// Register the broadcast receiver
if (app.android) {
    app.android.registerBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED,
        function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
            var level = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
            var scale = intent.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1);
            var percent = (level / scale) * 100.0;
            ////console.log("Battery: " + percent + "%");
        });
}
//// When no longer needed, unregister the broadcast receiver
if (app.android) {
    app.android.unregisterBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED);
}
// << application-app-android-broadcast

export var testAndroidApplicationInitialized = function () {
    TKUnit.assert(app.android, "Android application not initialized.");
    TKUnit.assert(app.android.context, "Android context not initialized.");
    TKUnit.assert(app.android.foregroundActivity, "Android currentActivity not initialized.");
    TKUnit.assert(app.android.startActivity, "Android startActivity not initialized.");
    TKUnit.assert(app.android.nativeApp, "Android nativeApp not initialized.");
    TKUnit.assert(app.android.packageName, "Android packageName not initialized.");
}
