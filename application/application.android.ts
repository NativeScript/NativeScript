import appModule = require("application/application-common");
import dts = require("application");
import frame = require("ui/frame");
import types = require("utils/types");
import observable = require("data/observable");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(appModule, exports);

var callbacks = android.app.Application.ActivityLifecycleCallbacks;

export var mainModule: string;

export var androidActivityCreatedEvent = "androidActivityCreated";
export var androidActivityDestroyedEvent = "androidActivityDestroyed";
export var androidActivityStartedEvent = "androidActivityStarted";
export var androidActivityPausedEvent = "androidActivityPaused";
export var androidActivityResumedEvent = "androidActivityResumed";
export var androidActivityStoppedEvent = "androidActivityStopped";
export var androidSaveActivityStateEvent = "androidSaveActivityState";
export var androidActivityResultEvent = "androidActivityResult";

// We are using the exports object for the common events since we merge the appModule with this module's exports, which is what users will receive when require("application") is called;
// TODO: This is kind of hacky and is "pure JS in TypeScript"

var initEvents = function () {
    var androidApp: dts.AndroidApplication = exports.android;
    // TODO: Verify whether the logic for triggerring application-wide events based on Activity callbacks is working properly
    var lifecycleCallbacks = new callbacks({
        onActivityCreated: function (activity: any, bundle: any) {
            if (!androidApp.startActivity) {
                androidApp.startActivity = activity;

                exports.notify(<dts.AndroidActivityBundleEventData>{ eventName: androidActivityCreatedEvent, object: androidApp, activity: activity, bundle: bundle });

                if (androidApp.onActivityCreated) {
                    androidApp.onActivityCreated(activity, bundle);
                }
            }

            androidApp.currentContext = activity;
        },

        onActivityDestroyed: function (activity: any) {
            // Clear the current activity reference to prevent leak
            if (activity === androidApp.foregroundActivity) {
                androidApp.foregroundActivity = undefined;
            }

            if (activity === androidApp.currentContext) {
                androidApp.currentContext = undefined;
            }

            if (activity === androidApp.startActivity) {
                if (exports.onExit) {
                    exports.onExit();
                }

                exports.notify(<dts.ApplicationEventData>{ eventName: dts.exitEvent, object: androidApp, android: activity });

                androidApp.startActivity = undefined;
            }

            exports.notify(<dts.AndroidActivityEventData>{ eventName: androidActivityDestroyedEvent, object: androidApp, activity: activity });

            if (androidApp.onActivityDestroyed) {
                androidApp.onActivityDestroyed(activity);
            }

            // TODO: This is a temporary workaround to force the V8's Garbage Collector, which will force the related Java Object to be collected.
            gc();
        },

        onActivityPaused: function (activity: any) {
            if (activity === androidApp.foregroundActivity) {
                if (exports.onSuspend) {
                    exports.onSuspend();
                }

                exports.notify(<dts.ApplicationEventData>{ eventName: dts.suspendEvent, object: androidApp, android: activity });
            }

            exports.notify(<dts.AndroidActivityEventData>{ eventName: androidActivityPausedEvent, object: androidApp, activity: activity });

            if (androidApp.onActivityPaused) {
                androidApp.onActivityPaused(activity);
            }
        },

        onActivityResumed: function (activity: any) {
            if (activity === androidApp.foregroundActivity) {
                if (exports.onResume) {
                    exports.onResume();
                }

                exports.notify(<dts.ApplicationEventData>{ eventName: dts.resumeEvent, object: androidApp, android: activity });
            }

            exports.notify(<dts.AndroidActivityEventData>{ eventName: androidActivityResumedEvent, object: androidApp, activity: activity });

            if (androidApp.onActivityResumed) {
                androidApp.onActivityResumed(activity);
            }
        },

        onActivitySaveInstanceState: function (activity: any, bundle: any) {
            exports.notify(<dts.AndroidActivityBundleEventData>{ eventName: androidSaveActivityStateEvent, object: androidApp, activity: activity, bundle: bundle });

            if (androidApp.onSaveActivityState) {
                androidApp.onSaveActivityState(activity, bundle);
            }
        },

        onActivityStarted: function (activity: any) {
            androidApp.foregroundActivity = activity;

            exports.notify(<dts.AndroidActivityEventData>{ eventName: androidActivityStartedEvent, object: androidApp, activity: activity });

            if (androidApp.onActivityStarted) {
                androidApp.onActivityStarted(activity);
            }
        },

        onActivityStopped: function (activity: any) {
            exports.notify(<dts.AndroidActivityEventData>{ eventName: androidActivityStoppedEvent, object: androidApp, activity: activity });

            if (androidApp.onActivityStopped) {
                androidApp.onActivityStopped(activity);
            }
        }
    });

    return lifecycleCallbacks;
}

app.init({
    getActivity: function (activity: android.app.Activity) {
        var intent = activity.getIntent()
        return exports.android.getActivity(intent);
    },

    onCreate: function () {
        var androidApp = new AndroidApplication(this);
        exports.android = androidApp;
        androidApp.init();
    }
});

class AndroidApplication implements dts.AndroidApplication {
    public nativeApp: android.app.Application;
    public context: android.content.Context;
    public currentContext: android.content.Context;
    public foregroundActivity: android.app.Activity;
    public startActivity: android.app.Activity;
    public packageName: string;
    public hasActionBar: boolean;
    // public getActivity: (intent: android.content.Intent) => any;

    public onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => void;
    public onActivityDestroyed: (activity: android.app.Activity) => void;
    public onActivityStarted: (activity: android.app.Activity) => void;
    public onActivityPaused: (activity: android.app.Activity) => void;
    public onActivityResumed: (activity: android.app.Activity) => void;
    public onActivityStopped: (activity: android.app.Activity) => void;
    public onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

    public onActivityResult: (requestCode: number, resultCode: number, data: android.content.Intent) => void;

    private _eventsToken: any;

    //private _initialized: boolean;
    
    constructor(nativeApp: any) {
        this.nativeApp = nativeApp;
        this.packageName = nativeApp.getPackageName();
        this.context = nativeApp.getApplicationContext();
    }

    //private setupUI() {
    //    // TODO: We probably don't need this flag if onCreate is going to be called once.
    //    if (!this._initialized) {
    //        this._initialized = true;
    //        if (mainModule && mainModule !== "") {
    //            var mainPage = require(mainModule).Page;

    //            if (mainPage instanceof page.Page) {
    //                this._rootView.addView(<android.view.View>mainPage.android);
    //                // TODO: We need to show ActionBar if there are any toolBar items
    //                // or if navigation page - showNavigationBar is true

    //                var showActionBar = false;
    //                if (mainPage instanceof page.TabbedPage) {
    //                    showActionBar = true;
    //                    this.startActivity.getActionBar().NavigationMode = android.app.ActionBar.NAVIGATION_MODE_TABS;
    //                }
    //                else if (mainPage instanceof page.NavigationPage) {
    //                    showActionBar = (<page.NavigationPage>mainPage).showActionBar;
    //                    this.startActivity.getActionBar().NavigationMode = android.app.ActionBar.NAVIGATION_MODE_STANDARD;
    //                }

    //                if (showActionBar) {
    //                    this.startActivity.getActionBar().show();
    //                }
    //                else {
    //                    this.startActivity.getActionBar().hide();
    //                }
    //            }
    //            else {
    //                // TODO: Throw exception when/if we remove Page/Frame support.
    //            }
    //        }
    //    }
    //}

    public getActivity(intent: android.content.Intent): Object {
        if (intent && intent.getAction() === android.content.Intent.ACTION_MAIN) {
            // application's main activity
            if (exports.onLaunch) {
                exports.onLaunch(intent);
            }

            exports.notify({ eventName: dts.launchEvent, object: this, android: intent });

            /* In the onLaunch event we expect the following setup, which ensures a root frame:
            * var frame = require("ui/frame");
            * var rootFrame = new frame.Frame();
            * rootFrame.navigate({ pageModuleName: "mainPage" });
            */
        }

        var topFrame = frame.topmost();
        if (!topFrame) {
            // try to navigate to the mainModule (if specified)
            if (mainModule) {
                topFrame = new frame.Frame();
                topFrame.navigate(mainModule);
            } else {
                // TODO: Throw an exception?
                throw new Error("A Frame must be used to navigate to a Page.");
            }
        }

        return topFrame.android.onActivityRequested(intent);
    }

    public init() {
        this._eventsToken = initEvents();
        this.nativeApp.registerActivityLifecycleCallbacks(this._eventsToken);
        this.context = this.nativeApp.getApplicationContext();
    }
}

global.__onUncaughtError = function (error: Error) {
    if (!types.isFunction(exports.onUncaughtError)) {
        return;
    }

    var nsError = {
        message: error.message,
        name: error.name,
        nativeError: (<any>error).nativeException
    }

    exports.onUncaughtError(nsError);

    exports.notify({ eventName: dts.uncaughtErrorEvent, object: appModule.android, android: nsError });
}

exports.start = function () {
    dts.loadCss();
}
