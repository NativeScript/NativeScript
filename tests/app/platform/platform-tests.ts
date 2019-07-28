import * as TKUnit from "../tk-unit";
import * as app from "tns-core-modules/application";
import * as platformModule from "tns-core-modules/platform";

export function test_platform() {
    let expectedPlatform;
    if (app.android) {
        expectedPlatform = "Android";
    } else {
        expectedPlatform = "iOS";
    }
    TKUnit.assertEqual(platformModule.device.os, expectedPlatform);
}

export function test_device_screen() {
    console.log("Device model: " + platformModule.device.model);
    console.log("Device manufacturer: " + platformModule.device.manufacturer);
    console.log("Device orientation: " + platformModule.device.orientation);
    console.log("Device type: " + platformModule.device.deviceType);
    console.log("Device UUID: " + platformModule.device.uuid);

    console.log("Preferred language: " + platformModule.device.language);
    console.log("Preferred region: " + platformModule.device.region);

    console.log("OS: " + platformModule.device.os);
    console.log("OS version: " + platformModule.device.osVersion);
    console.log("SDK version: " + platformModule.device.sdkVersion);

    console.log("Screen width (px): " + platformModule.screen.mainScreen.widthPixels);
    console.log("Screen height (px): " + platformModule.screen.mainScreen.heightPixels);
    console.log("Screen width (DIPs): " + platformModule.screen.mainScreen.widthDIPs);
    console.log("Screen height (DIPs): " + platformModule.screen.mainScreen.heightDIPs);
    console.log("Screen scale: " + platformModule.screen.mainScreen.scale);
}

export function test_IsAndroid_IsIOS() {
    if (platformModule.isIOS) {
        TKUnit.assertTrue(!!NSObject, "isIOS is true-ish but common iOS APIs are not available.");
    } else if (platformModule.isAndroid) {
        TKUnit.assertTrue(!!android, "isAndroid is true-ish but common 'android' package is not available.");
    }
}
