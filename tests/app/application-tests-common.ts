// >> application-require
import * as app from "application";
import * as platform from "platform";
// << application-require

// >> application-app-check
if (app.android) {
    console.log("We are running on Android device!");
} else if (app.ios) {
    console.log("We are running on iOS device");
}
// << application-app-check

import * as TKUnit from "./TKUnit";

export var testInitialized = function () {
    if (platform.device.os === platform.platformNames.android) {
        // we have the android defined
        TKUnit.assert(app.android, "Application module not properly intialized");
    } else if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assert(app.ios, "Application module not properly intialized");
    }
} 
