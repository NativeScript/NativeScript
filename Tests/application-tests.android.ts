import app = require("application/application");
import TKUnit = require("Tests/TKUnit"); 
import commonTests = require("Tests/application-tests-common");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(commonTests, exports);

export var testAndroidApplicationInitialized = function () {
    TKUnit.assert(app.android, "Android application not initialized.");
    TKUnit.assert(app.android.context, "Android context not initialized.");
    TKUnit.assert(app.android.currentActivity, "Android currentActivity not initialized.");
    TKUnit.assert(app.android.startActivity, "Android mainActivity not initialized.");
    TKUnit.assert(app.android.nativeApp, "Android nativeApp not initialized.");
    TKUnit.assert(app.android.packageName, "Android packageName not initialized.");
}