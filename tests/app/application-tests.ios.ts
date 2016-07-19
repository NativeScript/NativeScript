/* tslint:disable:no-unused-variable */
import app = require("application");
import TKUnit = require("./TKUnit");
import commonTests = require("./application-tests-common");

global.moduleMerge(commonTests, exports);

// >> application-ios-observer
//// Add the notification observer
if (app.ios) {
    var observer = app.ios.addNotificationObserver(UIDeviceBatteryLevelDidChangeNotification,
        function onReceiveCallback(notification: NSNotification) {
            var percent = UIDevice.currentDevice().batteryLevel * 100;
            var message = "Battery: " + percent + "%";
            ////console.log(message);
        });
}
//// When no longer needed, remove the notification observer
if (app.ios) {
    app.ios.removeNotificationObserver(observer, UIDeviceBatteryLevelDidChangeNotification);
}
// << application-ios-observer

// >> application-ios-delegate
//// Add custom application delegate
if (app.ios) {
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

    app.ios.delegate = MyDelegate;
}

// << application-ios-delegate