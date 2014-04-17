import app_common_module = require("Application/application_common");
var currentApp = app_common_module.Application.current;

// merge the exports of the application_common file with the exports of this file
declare var exports;
exports.TargetOS = app_common_module.TargetOS;
exports.Application = app_common_module.Application;

var callbacks = android.app.Application.ActivityLifecycleCallbacks;

var initEvents = function () {
    var androidApp = app_common_module.Application.current.android;
    var lifecycleCallbacks = new callbacks({
        onActivityCreated: function (activity: any, bundle: any) {
            if (!androidApp.startActivity) {
                androidApp.startActivity = activity;

                //if (UI.Application.current.onLaunch) {
                //    UI.Application.current.onLaunch();
                //}

                if (androidApp.onActivityCreated) {
                    androidApp.onActivityCreated(activity, bundle);
                }
            }
        },
        onActivityDestroyed: function (activity: any) {
            // Clear the current activity reference to prevent leak
            if (activity === androidApp.currentActivity) {
                androidApp.currentActivity = undefined;
            }

            //if (activity === UI.Application.android.startActivity) {
            //    UI.Application.android.currentActivity = undefined;
            //    if (UI.Application.current.onExit) {
            //        UI.Application.current.onExit();
            //    }
            //}

            if (androidApp.onActivityDestroyed) {
                androidApp.onActivityDestroyed(activity);
            }
        },
        onActivityPaused: function (activity: any) {
            //if (UI.Application.android.currentActivity === activity) {
            //    if (UI.Application.current.onSuspend) {
            //        UI.Application.current.onSuspend();
            //    }
            //}

            if (androidApp.onActivityPaused) {
                androidApp.onActivityPaused(activity);
            }
        },
        onActivityResumed: function (activity: any) {
            //if (UI.Application.android.currentActivity === activity) {
            //    if (UI.Application.current.onResume) {
            //        UI.Application.current.onResume();
            //    }
            //}

            if (androidApp.onActivityResumed) {
                androidApp.onActivityResumed(activity);
            }
        },
        onActivitySaveInstanceState: function (activity: any, bundle: any) {
            if (androidApp.onSaveActivityState) {
                androidApp.onSaveActivityState(activity, bundle);
            }
        },
        onActivityStarted: function (activity: any) {
            androidApp.currentActivity = activity;

            //if (activity === UI.Application.android.startActivity) {
            //    if (UI.Application.current.onStart) {
            //        UI.Application.current.onStart();
            //    }
            //}

            if (androidApp.onActivityStarted) {
                androidApp.onActivityStarted(activity);
            }
        },
        onActivityStopped: function (activity: any) {
            if (androidApp.onActivityStopped) {
                androidApp.onActivityStopped(activity);
            }
        }
    });

    return lifecycleCallbacks;
}

export var init = function (nativeApp: android.app.Application) {
    var app = new AndroidApplication(nativeApp);
    currentApp.os = app_common_module.TargetOS.Android;
    currentApp.android = app;
    app.init();
}

class AndroidApplication {
    public nativeApp: android.app.Application;
    public context: android.content.Context;
    public currentActivity: android.app.Activity;
    public startActivity: android.app.Activity;
    public packageName: string;

    public onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => any;
    public onActivityDestroyed: (activity: android.app.Activity) => any;
    public onActivityStarted: (activity: android.app.Activity) => any;
    public onActivityPaused: (activity: android.app.Activity) => any;
    public onActivityResumed: (activity: android.app.Activity) => any;
    public onActivityStopped: (activity: android.app.Activity) => any;
    public onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => any;

    private _eventsToken: any;

    constructor(nativeApp: any) {
        this.nativeApp = nativeApp;
        this.packageName = nativeApp.getPackageName();
        this.context = nativeApp.getApplicationContext();
    }

    public init() {
        this._eventsToken = initEvents();
        this.nativeApp.registerActivityLifecycleCallbacks(this._eventsToken);
        this.context = this.nativeApp.getApplicationContext();
    }
}