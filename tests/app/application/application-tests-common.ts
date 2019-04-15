// >> application-require
import * as app from "tns-core-modules/application";
import * as platform from "tns-core-modules/platform";
// << application-require

// >> application-app-check
if (app.android) {
    console.log("We are running on Android device!");
} else if (app.ios) {
    console.log("We are running on iOS device");
}
// << application-app-check

import * as TKUnit from "../TKUnit";

export function testInitialized() {
    if (platform.device.os === platform.platformNames.android) {
        // we have the android defined
        TKUnit.assert(app.android, "Application module not properly intialized");
    } else if (platform.device.os === platform.platformNames.ios) {
        TKUnit.assert(app.ios, "Application module not properly intialized");
    }
}

export function testDisplayedEvent() {
    // global.isDisplayedEventFired flag is set in app.ts application.displayedEvent handler
    TKUnit.assert((<any>global).isDisplayedEventFired, "application.displayedEvent not fired");
}
