import * as gridModule from '@nativescript/core/ui/layouts/grid-layout';
import * as pages from '@nativescript/core/ui/page';
import * as buttons from '@nativescript/core/ui/button';
import * as app from '@nativescript/core/application';
import * as platform from '@nativescript/core/platform';

function printDeviceInfoAndroid() {
	console.log('android.os.Build.DEVICE = ' + android.os.Build.DEVICE); //android.os.Build.DEVICE = hammerhead
	console.log('android.os.Build.VERSION.SDK = ' + android.os.Build.VERSION.SDK); //android.os.Build.VERSION.SDK = 19
	console.log('android.os.Build.VERSION.SDK_INT = ' + android.os.Build.VERSION.SDK_INT); //android.os.Build.VERSION.SDK_INT = 19
	console.log('android.os.Build.VERSION.CODENAME = ' + android.os.Build.VERSION.CODENAME); //android.os.Build.VERSION.CODENAME = REL
	console.log('android.os.Build.VERSION.RELEASE = ' + android.os.Build.VERSION.RELEASE); //android.os.Build.VERSION.RELEASE = 4.4.4
	var metrics: android.util.DisplayMetrics = app.android.context.getResources().getDisplayMetrics();
	console.log('metrics.density = ' + metrics.density); //metrics.density = 3
	console.log('metrics.scaledDensity = ' + metrics.scaledDensity); //metrics.scaledDensity = 3
	console.log('metrics.densityDpi = ' + metrics.densityDpi); //metrics.densityDpi = 480
	console.log('metrics.xdpi = ' + metrics.xdpi); //metrics.xdpi = 442.45098876953125
	console.log('metrics.yxdpi = ' + metrics.ydpi); //metrics.yxdpi = 443.3450012207031
	console.log('metrics.widthPixels = ' + metrics.widthPixels); //metrics.widthPixels = 1080
	console.log('metrics.heightPixels = ' + metrics.heightPixels); //metrics.heightPixels = 1776

	var config = app.android.context.getResources().getConfiguration();
	console.log('config.screenWidthDp = ' + config.screenWidthDp);
	console.log('config.screenHeightDp = ' + config.screenHeightDp);
	console.log('config.smallestScreenWidthDp = ' + config.smallestScreenWidthDp);
	console.log('config.orientation = ' + (config.orientation === android.content.res.Configuration.ORIENTATION_PORTRAIT ? 'portrait' : 'ladscape'));
}

function printDeviceInfoIOS() {
	var device = UIDevice.currentDevice;
	console.log('device.name = ' + device.name); //device.name = iPhone Simulator
	console.log('device.systemName = ' + device.systemName); //device.systemName = iPhone OS
	console.log('device.systemVersion = ' + device.systemVersion); //device.systemVersion = 8.1
	console.log('device.model = ' + device.model); //device.model = iPhone Simulator
	console.log('device.localizedModel = ' + device.localizedModel); //device.localizedModel = iPhone Simulator
	console.log('device.userInterfaceIdiom = ' + device.userInterfaceIdiom); //device.userInterfaceIdiom = 0
	console.log('device.batteryLevel = ' + device.batteryLevel); //device.batteryLevel = -1
	var screen = UIScreen.mainScreen;
	console.log('screen = ' + screen);
	console.log('screen.nativeBounds = ' + screen.nativeBounds.size.width + ', ' + screen.nativeBounds.size.height); //screen.nativeBounds = 640, 1136
	console.log('screen.scale = ' + screen.scale); //screen.scale = 2
	console.log('screen.nativeScale = ' + screen.nativeScale); //screen.nativeScale = 2
}

function printTNSInfo() {
	console.log('platform.Device.model = ' + platform.Device.model);
	console.log('platform.Device.os = ' + platform.Device.os);
	console.log('platform.Device.osVersion = ' + platform.Device.osVersion);
	console.log('platform.Device.sdkVersion = ' + platform.Device.sdkVersion);
	console.log('platform.Device.deviceType = ' + platform.Device.deviceType);

	console.log('platform.Screen.mainScreen.widthDIPs = ' + platform.Screen.mainScreen.widthDIPs);
	console.log('platform.Screen.mainScreen.heightDIPs = ' + platform.Screen.mainScreen.heightDIPs);
	console.log('platform.Screen.mainScreen.scale = ' + platform.Screen.mainScreen.scale);
	console.log('platform.Screen.mainScreen.widthPixels = ' + platform.Screen.mainScreen.widthPixels);
	console.log('platform.Screen.mainScreen.heightPixels = ' + platform.Screen.mainScreen.heightPixels);
}

function print() {
	if (app.android) {
		printDeviceInfoAndroid();
	} else {
		printDeviceInfoIOS();
	}
	printTNSInfo();
}
//print();

export function createPage() {
	var page = new pages.Page();
	var grid = new gridModule.GridLayout();

	var btn = new buttons.Button();
	btn.text = 'print';
	btn.on('tap', (d) => {
		print();
	});

	grid.addChild(btn);

	page.content = grid;

	return page;
}
//export var Page = page;
