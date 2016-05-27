import TKUnit = require("./TKUnit");
import app = require("application");

// >> platform-require
import platformModule = require("platform");
// << platform-require

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
    // >> platform-current
    console.log("Device model: " + platformModule.device.model);
    console.log("Device type: " + platformModule.device.deviceType);
    console.log("OS: " + platformModule.device.os);
    console.log("OS version: " + platformModule.device.osVersion);
    console.log("SDK Version: " + platformModule.device.sdkVersion);

    console.log("Screen width: " + platformModule.screen.mainScreen.widthPixels);
    console.log("Screen height: " + platformModule.screen.mainScreen.heightPixels);
    console.log("Screen scale: " + platformModule.screen.mainScreen.scale);
    // << platform-current
};
