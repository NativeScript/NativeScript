/* tslint:disable:no-unused-variable */
import { Application } from '@nativescript/core';
import * as TKUnit from '../tk-unit';

export * from './application-tests-common';

// >> application-app-android
let androidApp = Application.android;
// << application-app-android

// >> application-app-android-context
let context = Application.android.context;
//// get the Files (Documents) folder (directory)
let dir = context.getFilesDir();
// << application-app-android-context

// >> application-app-android-current
if (androidApp.foregroundActivity === androidApp.startActivity) {
	////console.log("We are currently in the main (start) activity of the application");
}
// << application-app-android-current

// >> application-app-android-broadcast
//// Register the broadcast receiver
if (androidApp) {
	Application.android.registerBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED, function onReceiveCallback(context: android.content.Context, intent: android.content.Intent) {
		const level = intent.getIntExtra(android.os.BatteryManager.EXTRA_LEVEL, -1);
		const scale = intent.getIntExtra(android.os.BatteryManager.EXTRA_SCALE, -1);
		const percent = (level / scale) * 100.0;
		////console.log("Battery: " + percent + "%");
	});
}
//// When no longer needed, unregister the broadcast receiver
if (androidApp) {
	Application.android.unregisterBroadcastReceiver(android.content.Intent.ACTION_BATTERY_CHANGED);
}
// << application-app-android-broadcast

export function testAndroidApplicationInitialized() {
	TKUnit.assert(Application.android, 'Android application not initialized.');
	TKUnit.assert(Application.android.context, 'Android context not initialized.');
	TKUnit.assert(Application.android.foregroundActivity, 'Android foregroundActivity not initialized.');
	TKUnit.assert(Application.android.foregroundActivity.isNativeScriptActivity, 'Android foregroundActivity.isNativeScriptActivity is false.');
	TKUnit.assert(Application.android.startActivity, 'Android startActivity not initialized.');
	TKUnit.assert(Application.android.nativeApp, 'Android nativeApp not initialized.');
	TKUnit.assert(Application.android.orientation, 'Android orientation not initialized.');
	TKUnit.assert(Application.android.packageName, 'Android packageName not initialized.');
	TKUnit.assert(Application.android.systemAppearance, 'Android system appearance not initialized.');
}

export function testSystemAppearance() {
	TKUnit.assert(Application.android.systemAppearance, 'System appearance not initialized.');
}
