import TKUnit = require("./TKUnit");
import app = require("application");

// <snippet module="platform" title="platform">
// # Platform
// Information about the current device and screen are defined in the platform module
// ### Declaring platform module to be available for further usage.
// ``` JavaScript
import platformModule = require("platform");
// ```
// </snippet>

export function test_setTimeout_isDefined() {
    var expected;
    if (app.android) {
        expected = "Android";
    }
    else {
        expected = "iOS";
    }
    TKUnit.assertEqual(platformModule.device.os, expected, "device.os");
};

export function snippet_print_all() {
    // <snippet module="platform" title="platform">
    // ### Getting information about the current device:
    // ``` JavaScript
    console.log("Device model: " + platformModule.device.model);
    console.log("Device type: " + platformModule.device.deviceType);
    console.log("OS: " + platformModule.device.os);
    console.log("OS version: " + platformModule.device.osVersion);
    console.log("SDK Version: " + platformModule.device.sdkVersion);

    console.log("Screen width: " + platformModule.screen.mainScreen.widthPixels);
    console.log("Screen height: " + platformModule.screen.mainScreen.heightPixels);
    console.log("Screen scale: " + platformModule.screen.mainScreen.scale);
    // ```
    // </snippet>
};
