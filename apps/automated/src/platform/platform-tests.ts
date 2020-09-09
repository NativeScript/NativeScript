import * as TKUnit from '../tk-unit';
import { isAndroid, isIOS, Device, Screen, Utils } from '@nativescript/core';

export function test_platform() {
	let expectedPlatform;
	if (isAndroid) {
		expectedPlatform = 'Android';
	} else {
		expectedPlatform = 'iOS';
	}
	TKUnit.assertEqual(Device.os, expectedPlatform);
}

export function test_device_screen() {
	TKUnit.assert(Device.model, 'Device model not initialized.');
	TKUnit.assert(Device.manufacturer, 'Device manufacturer not initialized.');
	TKUnit.assert(Device.deviceType, 'Device type not initialized.');
	TKUnit.assert(Device.uuid, 'Device UUID not initialized.');

	TKUnit.assert(Device.language, 'Preferred language not initialized.');

	// NSLocale.currentLocale.objectForKey(NSLocaleCountryCode) not initialized by default on iOS13 simulator;
	// can be set through Settings -> General -> Language & Region -> Region
	if (isAndroid || Utils.ios.MajorVersion < 13) {
		TKUnit.assert(Device.region, 'Preferred region not initialized.');
	}

	TKUnit.assert(Device.os, 'OS not initialized.');
	TKUnit.assert(Device.osVersion, 'OS version not initialized.');
	TKUnit.assert(Device.sdkVersion, 'SDK version not initialized.');

	TKUnit.assert(Screen.mainScreen.widthPixels, 'Screen width (px) not initialized.');
	TKUnit.assert(Screen.mainScreen.heightPixels, 'Screen height (px) not initialized.');
	TKUnit.assert(Screen.mainScreen.widthDIPs, 'Screen width (DIPs) not initialized.');
	TKUnit.assert(Screen.mainScreen.heightDIPs, 'Screen height (DIPs) not initialized.');
	TKUnit.assert(Screen.mainScreen.scale, 'Screen scale not initialized.');
}

export function test_IsAndroid_IsIOS() {
	if (isIOS) {
		TKUnit.assertTrue(!!NSObject, 'isIOS is true-ish but common iOS APIs are not available.');
	} else if (isAndroid) {
		TKUnit.assertTrue(!!android, "isAndroid is true-ish but common 'android' package is not available.");
	}
}
