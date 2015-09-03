import appModule = require("application/application-common");
import dts = require("application");
import frame = require("ui/frame");
import types = require("utils/types");
import observable = require("data/observable");
import enums = require("ui/enums");

global.moduleMerge(appModule, exports);

// We are using the exports object for the common events since we merge the appModule with this module's exports, which is what users will receive when require("application") is called;
// TODO: This is kind of hacky and is "pure JS in TypeScript"

var initEvents = function () {
    var androidApp: dts.AndroidApplication = exports.android;
    // TODO: Verify whether the logic for triggerring application-wide events based on Activity callbacks is working properly
    var lifecycleCallbacks = new android.app.Application.ActivityLifecycleCallbacks({
        onActivityCreated: function (activity: any, bundle: any) {
            if (!(activity instanceof (<any>com).tns.NativeScriptActivity)) {
                return;
            }

            if (!androidApp.startActivity) {
                androidApp.startActivity = activity;

                androidApp.notify(<dts.AndroidActivityBundleEventData>{ eventName: "activityCreated", object: androidApp, activity: activity, bundle: bundle });

                if (androidApp.onActivityCreated) {
                    androidApp.onActivityCreated(activity, bundle);
                }
            }

            androidApp.currentContext = activity;
        },

        onActivityDestroyed: function (activity: any) {
            if (!(activity instanceof (<any>com).tns.NativeScriptActivity)) {
                return;
            }

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

            androidApp.notify(<dts.AndroidActivityEventData>{ eventName: "activityDestroyed", object: androidApp, activity: activity });

            if (androidApp.onActivityDestroyed) {
                androidApp.onActivityDestroyed(activity);
            }

            // TODO: This is a temporary workaround to force the V8's Garbage Collector, which will force the related Java Object to be collected.
            gc();
        },

        onActivityPaused: function (activity: any) {
            if (!(activity instanceof (<any>com).tns.NativeScriptActivity)) {
                return;
            }

            if (activity === androidApp.foregroundActivity) {
                if (exports.onSuspend) {
                    exports.onSuspend();
                }

                exports.notify(<dts.ApplicationEventData>{ eventName: dts.suspendEvent, object: androidApp, android: activity });
            }

            androidApp.notify(<dts.AndroidActivityEventData>{ eventName: "activityPaused", object: androidApp, activity: activity });

            if (androidApp.onActivityPaused) {
                androidApp.onActivityPaused(activity);
            }
        },

        onActivityResumed: function (activity: any) {
            if (!(activity instanceof (<any>com).tns.NativeScriptActivity)) {
                return;
            }

            if (activity === androidApp.foregroundActivity) {
                if (exports.onResume) {
                    exports.onResume();
                }

                exports.notify(<dts.ApplicationEventData>{ eventName: dts.resumeEvent, object: androidApp, android: activity });
            }

            androidApp.notify(<dts.AndroidActivityEventData>{ eventName: "activityResumed", object: androidApp, activity: activity });

            if (androidApp.onActivityResumed) {
                androidApp.onActivityResumed(activity);
            }
        },

        onActivitySaveInstanceState: function (activity: any, bundle: any) {
            if (!(activity instanceof (<any>com).tns.NativeScriptActivity)) {
                return;
            }

            androidApp.notify(<dts.AndroidActivityBundleEventData>{ eventName: "saveActivityState", object: androidApp, activity: activity, bundle: bundle });

            if (androidApp.onSaveActivityState) {
                androidApp.onSaveActivityState(activity, bundle);
            }
        },

        onActivityStarted: function (activity: any) {
            if (!(activity instanceof (<any>com).tns.NativeScriptActivity)) {
                return;
            }

            androidApp.foregroundActivity = activity;

            androidApp.notify(<dts.AndroidActivityEventData>{ eventName: "activityStarted", object: androidApp, activity: activity });

            if (androidApp.onActivityStarted) {
                androidApp.onActivityStarted(activity);
            }
        },

        onActivityStopped: function (activity: any) {
            if (!(activity instanceof (<any>com).tns.NativeScriptActivity)) {
                return;
            }

            androidApp.notify(<dts.AndroidActivityEventData>{ eventName: "activityStopped", object: androidApp, activity: activity });

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
        exports.android.init(this);
    }
});

export class AndroidApplication extends observable.Observable implements dts.AndroidApplication {
    public static activityCreatedEvent = "activityCreated";
    public static activityDestroyedEvent = "activityDestroyed";
    public static activityStartedEvent = "activityStarted";
    public static activityPausedEvent = "activityPaused";
    public static activityResumedEvent = "activityResumed";
    public static activityStoppedEvent = "activityStopped";
    public static saveActivityStateEvent = "saveActivityState";
    public static activityResultEvent = "activityResult";
    public static activityBackPressedEvent = "activityBackPressed";

    public nativeApp: android.app.Application;
    public context: android.content.Context;
    public currentContext: android.content.Context;
    public foregroundActivity: android.app.Activity;
    public startActivity: android.app.Activity;
    public packageName: string;
    public hasActionBar: boolean;

    public onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

    public onActivityDestroyed: (activity: android.app.Activity) => void;

    public onActivityStarted: (activity: android.app.Activity) => void;

    public onActivityPaused: (activity: android.app.Activity) => void;

    public onActivityResumed: (activity: android.app.Activity) => void;

    public onActivityStopped: (activity: android.app.Activity) => void;

    public onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

    public onActivityResult: (requestCode: number, resultCode: number, data: android.content.Intent) => void;

    private _eventsToken: any;

    public getActivity(intent: android.content.Intent): Object {
        if (intent && intent.getAction() === android.content.Intent.ACTION_MAIN) {
            // application's main activity
            if (exports.onLaunch) {
                exports.onLaunch(intent);
            }

            exports.notify({ eventName: dts.launchEvent, object: this, android: intent });

            setupOrientationListener(this);

            /* In the onLaunch event we expect the following setup, which ensures a root frame:
            * var frame = require("ui/frame");
            * var rootFrame = new frame.Frame();
            * rootFrame.navigate({ pageModuleName: "mainPage" });
            */
        }

        var topFrame = frame.topmost();
        if (!topFrame) {
            // try to navigate to the mainEntry/Module (if specified)
            var navParam = dts.mainEntry;
            if (!navParam) {
                navParam = dts.mainModule;
            }

            if (navParam) {
                topFrame = new frame.Frame();
                topFrame.navigate(navParam);
            } else {
                // TODO: Throw an exception?
                throw new Error("A Frame must be used to navigate to a Page.");
            }
        }

        return topFrame.android.onActivityRequested(intent);
    }

    public init(nativeApp: any) {
        this.nativeApp = nativeApp;
        this.packageName = nativeApp.getPackageName();
        this.context = nativeApp.getApplicationContext();

        this._eventsToken = initEvents();
        this.nativeApp.registerActivityLifecycleCallbacks(this._eventsToken);
        this._registerPendingReceivers();
    }

    private _registeredReceivers = {};
    private _pendingReceiverRegistrations = new Array<(context: android.content.Context) => void>();
    private _registerPendingReceivers() {
        if (this._pendingReceiverRegistrations) {
            var i = 0;
            var length = this._pendingReceiverRegistrations.length;
            for (; i < length; i++) {
                var registerFunc = this._pendingReceiverRegistrations[i];
                registerFunc(this.context);
            }
            this._pendingReceiverRegistrations = new Array<(context: android.content.Context) => void>();
        }
    }

    public registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void) {
        var that = this;
        var registerFunc = function (context: android.content.Context) {
            var receiver = new BroadcastReceiver(onReceiveCallback);
            context.registerReceiver(receiver, new android.content.IntentFilter(intentFilter));
            that._registeredReceivers[intentFilter] = receiver;
        }

        if (this.context) {
            registerFunc(this.context);
        }
        else {
            this._pendingReceiverRegistrations.push(registerFunc);
        }
    }

    public unregisterBroadcastReceiver(intentFilter: string) {
        var receiver = this._registeredReceivers[intentFilter];
        if (receiver) {
            this.context.unregisterReceiver(receiver);
            this._registeredReceivers[intentFilter] = undefined;
            delete this._registeredReceivers[intentFilter];
        }
    }
}

class BroadcastReceiver extends android.content.BroadcastReceiver {
    private _onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void;

    constructor(onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void) {
        super();
        this._onReceiveCallback = onReceiveCallback;
        return global.__native(this);
    }

    public onReceive(context: android.content.Context, intent: android.content.Intent) {
        if (this._onReceiveCallback) {
            this._onReceiveCallback(context, intent);
        }
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

exports.android = new AndroidApplication();

var currentOrientation: number;
function setupOrientationListener(androidApp: AndroidApplication) {
    androidApp.registerBroadcastReceiver(android.content.Intent.ACTION_CONFIGURATION_CHANGED, onConfigurationChanged);
    currentOrientation = androidApp.context.getResources().getConfiguration().orientation
}
function onConfigurationChanged(context: android.content.Context, intent: android.content.Intent) {
    var orientation = context.getResources().getConfiguration().orientation;

    if (currentOrientation !== orientation) {
        currentOrientation = orientation;

        var newValue;
        switch (orientation) {
            case android.content.res.Configuration.ORIENTATION_LANDSCAPE:
                newValue = enums.DeviceOrientation.landscape;
                break;
            case android.content.res.Configuration.ORIENTATION_PORTRAIT:
                newValue = enums.DeviceOrientation.portrait;
                break;
            default:
                newValue = enums.DeviceOrientation.unknown;
                break;
        }

        exports.notify(<dts.OrientationChangedEventData> {
            eventName: dts.orientationChangedEvent,
            android: context,
            newValue: newValue,
            object: exports.android,
        });
    }
}
