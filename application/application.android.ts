import appModule = require("application/application-common");

// merge the exports of the application_common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(appModule, exports);

var callbacks = android.app.Application.ActivityLifecycleCallbacks;

// We are using the exports object for the common events since we merge the appModule with this module's exports, which is what users will receive when require("application") is called;
// TODO: This is kind of hacky and is "pure JS in TypeScript"

var initEvents = function () {
    var androidApp: AndroidApplication = exports.android;
    // TODO: Verify whether the logic for triggerring application-wide events based on Activity callbacks is working properly
    var lifecycleCallbacks = new callbacks({
        onActivityCreated: function (activity: any, bundle: any) {
            if (!androidApp.startActivity) {
                androidApp.startActivity = activity;

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

            if (activity === androidApp.startActivity) {
                if (exports.onExit) {
                    exports.onExit();
                }
            }

            if (androidApp.onActivityDestroyed) {
                androidApp.onActivityDestroyed(activity);
            }

            // TODO: This is a temporary workaround to force the V8's Garbage Collector, which will force the related Java Object to be collected.
            gc();
        },
        onActivityPaused: function (activity: any) {
            if (activity === androidApp.currentActivity) {
                if (exports.onSuspend) {
                    exports.onSuspend();
                }
            }

            if (androidApp.onActivityPaused) {
                androidApp.onActivityPaused(activity);
            }
        },
        onActivityResumed: function (activity: any) {
            if (activity === androidApp.currentActivity) {
                if (exports.onResume) {
                    exports.onResume();
                }
            }

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

var initialized;
export var init = function (nativeApp: android.app.Application) {
    if (initialized) {
        return;
    }

    var app = new AndroidApplication(nativeApp);
    exports.android = app;
    app.init();

    initialized = true;
}

class AndroidApplication {
    public nativeApp: android.app.Application;
    public context: android.content.Context;
    public currentActivity: android.app.Activity;
    public startActivity: android.app.Activity;
    public packageName: string;

    public onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => void;
    public onActivityDestroyed: (activity: android.app.Activity) => void;
    public onActivityStarted: (activity: android.app.Activity) => void;
    public onActivityPaused: (activity: android.app.Activity) => void;
    public onActivityResumed: (activity: android.app.Activity) => void;
    public onActivityStopped: (activity: android.app.Activity) => void;
    public onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

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