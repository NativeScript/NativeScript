import app_common_module = require("Application/application_common");
var currentApp = app_common_module.tk.ui.Application.current;

export module tk {
    export module ui {
        export module ios {
            // TODO: Declarations
            export var initApp = function (nativeApp: any) {
                var app = new Application(nativeApp);
                currentApp.os = app_common_module.tk.TargetOS.iOS;
                currentApp.ios = app;
                app.init();
            }

            class Application {
                public nativeApp: any;
                public rootController: any; 

                constructor(nativeApp: any) {
                    this.nativeApp = nativeApp;
                }

                public init() {
                    UIKit.UIResponder.extends({/*TODO: Empty parameter here, needs API improvement*/}, {
                            name: "KimeraAppDelegate",
                        }).extends({
                            protocol: "UIApplicationDelegate",
                            implementation: {
                                applicationDidFinishLaunchingWithOptions: function () {
                                    log("Application launched: applicationDidFinishLaunchingWithOptions.");

                                    this.window = new UIKit.UIWindow(UIKit.UIScreen.mainScreen().bounds());
                                    this.window.setBackgroundColor(UIKit.UIColor.whiteColor());

                                    var iosApp = <Application>currentApp.ios;
                                    this.window.setRootViewController(iosApp.rootController);

                                    if (currentApp.onLaunch) {
                                        currentApp.onLaunch();
                                    } else {
                                        log("Missing TK.UI.Application.current.onLaunch");
                                    }

                                    this.window.makeKeyAndVisible();

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
        }
    }
} 