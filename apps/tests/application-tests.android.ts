/* tslint:disable:no-unused-variable */
import app = require("application");
import TKUnit = require("./TKUnit"); 
import commonTests = require("./application-tests-common");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(commonTests, exports);

// <snippet module="application" title="application">
// ### Using the Android-specific implementation
// Accessing the Android-specific object instance (will be undefined if running on iOS)
// ``` JavaScript
var androidApp = app.android;
// ```
// </snippet>
// <snippet module="application" title="application">
// ### Using the Android Application context
// ``` JavaScript
var context = app.android.context;
//// get the Files (Documents) folder (directory)
var dir = context.getFilesDir();
// ```
// </snippet>
// <snippet module="application" title="application">
// ### Tracking the current Activity
// ``` JavaScript
if (androidApp.foregroundActivity === androidApp.startActivity) {
    console.log("We are currently in the main (start) activity of the application");
}
// ```
// </snippet>

export var testAndroidApplicationInitialized = function () {
    TKUnit.assert(app.android, "Android application not initialized.");
    TKUnit.assert(app.android.context, "Android context not initialized.");
    TKUnit.assert(app.android.foregroundActivity, "Android currentActivity not initialized.");
    TKUnit.assert(app.android.startActivity, "Android startActivity not initialized.");
    TKUnit.assert(app.android.nativeApp, "Android nativeApp not initialized.");
    TKUnit.assert(app.android.packageName, "Android packageName not initialized.");
}
