
/*
Current launch sequence for iOS looks like:

var app = require("application");

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

import appModule = require("application/application-common");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(appModule, exports);

var initialized;
export var init = function (nativeApp: any) {
    if (initialized) {
        return;
    }

    var app = new iOSApplication(nativeApp);
    exports.ios = app;
    app.init();

    initialized = true;
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

                        if (exports.onLaunch) {
                            this.window.rootViewController = exports.onLaunch();
                        } else {
                            log("Missing Application.onLaunch");
                        }

                        log("applicationDidFinishLaunchingWithOptions finished.");
                        return true;
                    },

                    applicationDidBecomeActive: function (application) {
                        log("applicationDidBecomeActive: " + application);
                        if (exports.onResume) {
                            exports.onResume();
                        }
                    },

                    applicationWillResignActive: function (application) {
                        log("applicationWillResignActive: " + application);
                    },

                    applicationDidEnterBackground: function (application) {
                        log("applicationDidEnterBackground: " + application);
                        if (exports.onSuspend) {
                            exports.onSuspend();
                        }
                    },

                    applicationWillEnterForeground: function (application) {
                        log("applicationWillEnterForeground: " + application);
                    },

                    applicationWillTerminate: function (application) {
                        log("applicationWillTerminate: " + application);
                        if (exports.onExit) {
                            exports.onExit();
                        }
                    },

                    applicationDidReceiveMemoryWarning: function (application) {
                        log("applicationDidReceiveMemoryWarning: " + application);
                        if (exports.onLowMemory) {
                            exports.onLowMemory();
                        }
                    }
                }
            });
    }
}