import { Application, Utils, isIOS } from '@nativescript/core';
import * as TKUnit from '../tk-unit';

export * from './application-tests-common';

// >> application-ios-observer
//// Add the notification observer
if (Application.ios) {
	var observer = Application.ios.addNotificationObserver(UIDeviceBatteryLevelDidChangeNotification, function onReceiveCallback(notification: NSNotification) {
		var percent = UIDevice.currentDevice.batteryLevel * 100;
		var message = 'Battery: ' + percent + '%';
		////console.log(message);
	});
}
//// When no longer needed, remove the notification observer
if (isIOS) {
	Application.ios.removeNotificationObserver(observer, UIDeviceBatteryLevelDidChangeNotification);
}
// << application-ios-observer

// >> application-ios-delegate
//// Add custom application delegate
if (isIOS) {
	@NativeClass
	class MyDelegate extends UIResponder implements UIApplicationDelegate {
		public static ObjCProtocols = [UIApplicationDelegate];

		applicationDidFinishLaunchingWithOptions(application: UIApplication, launchOptions: NSDictionary<any, any>): boolean {
			return true;
		}

		applicationDidBecomeActive(application: UIApplication): void {
			// Get reference to the application window.
			//console.log("keyWindow: " + application.keyWindow);
		}
	}

	Application.ios.delegate = MyDelegate;
}

// << application-ios-delegate

export function testIOSApplicationInitialized() {
	TKUnit.assert(Application.ios, 'iOS application not initialized.');
	TKUnit.assert(Application.ios.delegate, 'iOS delegate not initialized.');
	TKUnit.assert(Application.ios.nativeApp, 'iOS nativeApp not initialized.');
	TKUnit.assert(Application.ios.orientation, 'iOS orientation not initialized.');

	if (Utils.ios.MajorVersion <= 11) {
		TKUnit.assertNull(Application.ios.systemAppearance, 'iOS system appearance should be `null` on iOS <= 11.');
	} else {
		TKUnit.assert(Application.ios.systemAppearance, 'iOS system appearance not initialized.');
	}

	TKUnit.assert(Application.ios.window, 'iOS window not initialized.');
	TKUnit.assert(Application.ios.rootController, 'iOS root controller not initialized.');
}

export function testSystemAppearance() {
	if (Utils.ios.MajorVersion <= 11) {
		TKUnit.assertNull(Application.ios.systemAppearance, 'System appearance should be `null` on iOS <= 11.');
	} else {
		TKUnit.assert(Application.ios.systemAppearance, 'System appearance not initialized.');
	}
}
