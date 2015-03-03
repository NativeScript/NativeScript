import btns = require("ui/button");
import gridModule = require("ui/layouts/grid-layout");
import pages = require("ui/page");
import app = require("application");
import platform = require("platform");

function printDeviceInfoAndroid() {
    console.log("android.os.Build.DEVICE = " + android.os.Build.DEVICE);                     //android.os.Build.DEVICE = hammerhead
    console.log("android.os.Build.VERSION.SDK = " + android.os.Build.VERSION.SDK);         //android.os.Build.VERSION.SDK = 19
    console.log("android.os.Build.VERSION.SDK_INT = " + android.os.Build.VERSION.SDK_INT);   //android.os.Build.VERSION.SDK_INT = 19
    console.log("android.os.Build.VERSION.CODENAME = " + android.os.Build.VERSION.CODENAME); //android.os.Build.VERSION.CODENAME = REL
    console.log("android.os.Build.VERSION.RELEASE = " + android.os.Build.VERSION.RELEASE);   //android.os.Build.VERSION.RELEASE = 4.4.4
    android.os.Build.MANUFACTURER
    var metrics: android.util.DisplayMetrics = app.android.context.getResources().getDisplayMetrics();

    console.log("metrics.density = " + metrics.density);             //metrics.density = 3
    console.log("metrics.scaledDensity = " + metrics.scaledDensity); //metrics.scaledDensity = 3
    console.log("metrics.densityDpi = " + metrics.densityDpi);       //metrics.densityDpi = 480
    console.log("metrics.xdpi = " + metrics.xdpi);                   //metrics.xdpi = 442.45098876953125
    console.log("metrics.yxdpi = " + metrics.ydpi);                  //metrics.yxdpi = 443.3450012207031
    console.log("metrics.widthPixels = " + metrics.widthPixels);     //metrics.widthPixels = 1080
    console.log("metrics.heightPixels = " + metrics.heightPixels);   //metrics.heightPixels = 1776
}

function printDeviceInfoIOS() {
    var device = UIDevice.currentDevice();
    console.log("device.name = " + device.name);                             //device.name = iPhone Simulator
    console.log("device.systemName = " + device.systemName);                 //device.systemName = iPhone OS
    console.log("device.systemVersion = " + device.systemVersion);           //device.systemVersion = 8.1
    console.log("device.model = " + device.model);                           //device.model = iPhone Simulator
    console.log("device.localizedModel = " + device.localizedModel);         //device.localizedModel = iPhone Simulator
    console.log("device.userInterfaceIdiom = " + device.userInterfaceIdiom); //device.userInterfaceIdiom = 0
    console.log("device.batteryLevel = " + device.batteryLevel);             //device.batteryLevel = -1
    var screen = UIScreen.mainScreen();
    console.log("screen = " + screen);
    console.log("screen.nativeBounds = " + screen.nativeBounds.size.width + ", " + screen.nativeBounds.size.height); //screen.nativeBounds = 640, 1136
    console.log("screen.scale = " + screen.scale);                                                                   //screen.scale = 2
    console.log("screen.nativeScale = " + screen.nativeScale);                                                       //screen.nativeScale = 2
}

function printTNSInfo() {
    console.log("platform.device.model = " + platform.device.model);  
    console.log("platform.device.os = " + platform.device.os);  
    console.log("platform.device.osVersion = " + platform.device.osVersion);  
    console.log("platform.device.sdkVersion = " + platform.device.sdkVersion);  
    console.log("platform.device.deviceType = " + platform.device.deviceType);  

    console.log("platform.screen.mainScreen.widthPixels = " + platform.screen.mainScreen.widthPixels); 
    console.log("platform.screen.mainScreen.heightPixels = " + platform.screen.mainScreen.heightPixels);  
    console.log("platform.screen.mainScreen.scale = " + platform.screen.mainScreen.scale);  
}

if (app.android) {
    printDeviceInfoAndroid();
}
else {
    printDeviceInfoIOS();
}
printTNSInfo();

export function createPage() {
    var page = new pages.Page();
    var grid = new gridModule.GridLayout();

    var rows = 100;
    var cols = 3;
    var row;
    var col;

    for (row = 0; row < rows; row++) {
        grid.addRow(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    }

    for (col = 0; col < cols; col++) {
        grid.addColumn(new gridModule.ItemSpec(1, gridModule.GridUnitType.auto));
    }

    for (col = 0; col < cols; col++) {
        for (row = 0; row < rows; row++) {
            var btn = new btns.Button();
            btn.text = "Col: " + col + ", Row: " + row;
            gridModule.GridLayout.setColumn(btn, col);
            gridModule.GridLayout.setRow(btn, row);
            grid.addChild(btn);
        }
    }

    page.content = grid;
    return page;
}
//export var Page = page;