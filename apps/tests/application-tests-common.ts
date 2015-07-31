// <snippet module="application" title="application">
// # Application
// The Application module provides abstraction over the platform-specific Application implementations.
// It is the main BCL module and is required for other BCL modules to work properly.
// The default bootstrap.js implementation for each platform loads and initializes this module.
// ``` JavaScript
import app = require("application");
import native_api = require("native-api");
// ```
// The pre-required `app` module is used throughout the following code snippets.
// </snippet>

// <snippet module="application" title="application">
// ### Checking the target platform
// Use the following code in case you need to check somewhere in your code the platform you are running against:
// ``` JavaScript
if (app.android) {
    console.log("We are running on Android device!");
} else if (app.ios) {
    console.log("We are running on iOS device");
}
// ```
// </snippet>

import TKUnit = require("./TKUnit");

export var testInitialized = function () {
    if (global.android) {
        // we have the android defined
        TKUnit.assert(app.android, "Application module not properly intialized");
    } else if (native_api.NSObject) {
        TKUnit.assert(app.ios, "Application module not properly intialized");
    }
} 
