import app = require("application/application");
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