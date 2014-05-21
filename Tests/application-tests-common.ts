// <snippet name="application">
// # Application
// The Application module provides abstraction over the platform-specific Application implementations.
// It is the main BCL module and is required for other BCL modules to work properly.
// The default bootstrap.js implementation for each platform loads and initializes this module.
// ``` JavaScript
import app = require("application");
// ```
// The pre-required `app` module is used throughout the following code snippets.
// </snippet>

// <snippet name="application">
// ### Initialization
// ``` JavaScript
//// The native app instance depends on the target platform
var nativeAppInstance;
app.init(nativeAppInstance);
// ```
// </snippet>

// <snippet name="application">
// ### Checking the target platform
// Use the following code in case you need to check somewhere in your code the platform you are running against:
// ``` JavaScript
if (app.android) {
    //// we are running on Android device
} else if (app.ios) {
    //// we are running on iOS device
}
// ```
// </snippet>

import TKUnit = require("Tests/TKUnit");

export var testInitDefined = function () {
    TKUnit.assert(app.init, "init function not defined.");
} 

export var testInitialized = function () {
    if (android) {
        // we have the android defined
        TKUnit.assert(app.android, "Application module not properly intialized");
    } else if (Foundation) {
        TKUnit.assert(app.ios, "Application module not properly intialized");
    }
} 