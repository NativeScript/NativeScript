import * as TKUnit from "../tk-unit";
import * as app from "@nativescript/core/application";
import * as platformModule from "@nativescript/core/platform";

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
    TKUnit.assert(platformModule.device.model, "Device model not initialized.");
    TKUnit.assert(platformModule.device.manufacturer, "Device manufacturer not initialized.");
    TKUnit.assert(platformModule.device.deviceType, "Device type not initialized.");
    TKUnit.assert(platformModule.device.uuid, "Device UUID not initialized.");

    TKUnit.assert(platformModule.device.language, "Preferred language not initialized.");
    TKUnit.assert(platformModule.device.region, "Preferred region not initialized.");

    TKUnit.assert(platformModule.device.os, "OS not initialized.");
    TKUnit.assert(platformModule.device.osVersion, "OS version not initialized.");
    TKUnit.assert(platformModule.device.sdkVersion, "SDK version not initialized.");

    TKUnit.assert(platformModule.screen.mainScreen.widthPixels, "Screen width (px) not initialized.");
    TKUnit.assert(platformModule.screen.mainScreen.heightPixels, "Screen height (px) not initialized.");
    TKUnit.assert(platformModule.screen.mainScreen.widthDIPs, "Screen width (DIPs) not initialized.");
    TKUnit.assert(platformModule.screen.mainScreen.heightDIPs, "Screen height (DIPs) not initialized.");
    TKUnit.assert(platformModule.screen.mainScreen.scale, "Screen scale not initialized.");
}

export function test_IsAndroid_IsIOS() {
    if (platformModule.isIOS) {
        TKUnit.assertTrue(!!NSObject, "isIOS is true-ish but common iOS APIs are not available.");
    } else if (platformModule.isAndroid) {
        TKUnit.assertTrue(!!android, "isAndroid is true-ish but common 'android' package is not available.");
    }
}
