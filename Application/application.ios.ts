
/*
Current launch sequence for iOS looks like:

var app = require("Application/application");

app.tk.ui.Application.current.onLaunch = function() {
    log("tk.ui.Application.current.onLaunch");
    var myViewController = new MyViewController();
    var navController = new UIKit.UINavigationController(myViewController);
    
    return navController;
}

log("JavaScript loading started.");
app.tk.ui.ios.initApp(null);
log("JavaScript loading ended.");

log("JavaScript loading ended.");

*/

import app_common_module = require("Application/application_common");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("Utils/module_merge").merge(app_common_module, exports);

var currentApp = app_common_module.Application.current;

// TODO: Declarations
export var init = function (nativeApp: any) {
    var app = new iOSApplication(nativeApp);
    currentApp.os = app_common_module.TargetOS.iOS;
    currentApp.ios = app;
    app.init();
}

class iOSApplication {
    public nativeApp: any;
    public rootController: any;

    constructor(nativeApp: any) {
        this.nativeApp = nativeApp;
    }

    public init() {
        UIKit.UIResponder.extends({/*TODO: Empty parameter here, needs API improvement*/}, {
            name: "TNSAppDelegate",
        }).implements({
                protocol: "UIApplicationDelegate",
                implementation: {
                    applicationDidFinishLaunchingWithOptions: function () {
                        log("Application launched: applicationDidFinishLaunchingWithOptions.");

                        this.window = new UIKit.UIWindow(UIKit.UIScreen.mainScreen().bounds);
                        this.window.backgroundColor = UIKit.UIColor.whiteColor();
                        this.window.makeKeyAndVisible();

                        var iosApp = currentApp.ios;

                        if (currentApp.onLaunch) {
                            this.window.rootViewController = currentApp.onLaunch();
                        } else {
                            log("Missing TK.UI.Application.current.onLaunch");
                        }

                        log("applicationDidFinishLaunchingWithOptions finished.");
                        return true;
                    },

                    applicationDidBecomeActive: function (application) {
                        log("applicationDidBecomeActive: " + application);
                        if (currentApp.onResume) {
                            currentApp.onResume();
                        }
                    },

                    applicationWillResignActive: function (application) {
                        log("applicationWillResignActive: " + application);
                    },

                    applicationDidEnterBackground: function (application) {
                        log("applicationDidEnterBackground: " + application);
                        if (currentApp.onSuspend) {
                            currentApp.onSuspend();
                        }
                    },

                    applicationWillEnterForeground: function (application) {
                        log("applicationWillEnterForeground: " + application);
                    },

                    applicationWillTerminate: function (application) {
                        log("applicationWillTerminate: " + application);
                        if (currentApp.onExit) {
                            currentApp.onExit();
                        }
                    },

                    applicationDidReceiveMemoryWarning: function (application) {
                        log("applicationDidReceiveMemoryWarning: " + application);
                        if (currentApp.onLowMemory) {
                            currentApp.onLowMemory();
                        }
                    }
                }
            });
    }
}