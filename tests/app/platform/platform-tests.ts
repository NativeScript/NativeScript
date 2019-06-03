import * as TKUnit from "../tk-unit";
import * as app from "tns-core-modules/application";
import { isIOS, isAndroid } from "tns-core-modules/platform";

// >> platform-require
import * as platformModule from "tns-core-modules/platform";
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
    // >> platform-current
    console.log("Device model: " + platformModule.device.model);
    console.log("Device type: " + platformModule.device.deviceType);
    console.log("Device manufacturer: " + platformModule.device.manufacturer);
    console.log("Preferred language: " + platformModule.device.language);
    console.log("Preferred region: " + platformModule.device.region);
    console.log("OS: " + platformModule.device.os);
    console.log("OS version: " + platformModule.device.osVersion);
    console.log("SDK version: " + platformModule.device.sdkVersion);
    console.log("Device UUID: " + platformModule.device.uuid);

    console.log("Screen width (px): " + platformModule.screen.mainScreen.widthPixels);
    console.log("Screen height (px): " + platformModule.screen.mainScreen.heightPixels);
    console.log("Screen width (DIPs): " + platformModule.screen.mainScreen.widthDIPs);
    console.log("Screen height (DIPs): " + platformModule.screen.mainScreen.heightDIPs);
    console.log("Screen scale: " + platformModule.screen.mainScreen.scale);
    // << platform-current
};

export function testIsIOSandIsAndroid() {
    if (isIOS) {
        TKUnit.assertTrue(!!NSObject, "isIOS is true-ish but common iOS APIs are not available.");
    } else if (isAndroid) {
        TKUnit.assertTrue(!!android, "isAndroid is true but common 'android' package is not available.");
    }
}
