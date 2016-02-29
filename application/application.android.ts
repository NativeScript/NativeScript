import appModule = require("./application-common");
import definition = require("application");
import frame = require("ui/frame");
import observable = require("data/observable");
import * as typesModule from "utils/types";
import * as fileResolverModule  from "file-system/file-name-resolver";

global.moduleMerge(appModule, exports);
var typedExports: typeof definition = exports;

@JavaProxy("com.tns.NativeScriptApplication")
class NativeScriptApplication extends android.app.Application {

    constructor() {
        super();
        return global.__native(this);
    }

    public onCreate(): void {
        androidApp.init(this);
        setupOrientationListener(androidApp);
    }

    public onLowMemory(): void {
        gc();
        java.lang.System.gc();
        super.onLowMemory();

        typedExports.notify(<definition.ApplicationEventData>{ eventName: typedExports.lowMemoryEvent, object: this, android: this });
    }

    public onTrimMemory(level: number): void {
        gc();
        java.lang.System.gc();
        super.onTrimMemory(level);
    }
}

// We are using the exports object for the common events since we merge the appModule with this module's exports, which is what users will receive when require("application") is called;
// TODO: This is kind of hacky and is "pure JS in TypeScript"

function initEvents() {
    // TODO: Verify whether the logic for triggerring application-wide events based on Activity callbacks is working properly
    var lifecycleCallbacks = new android.app.Application.ActivityLifecycleCallbacks({
        onActivityCreated: function (activity: any, bundle: any) {
            if (!androidApp.startActivity) {
                androidApp.startActivity = activity;
                androidApp.notify(<definition.AndroidActivityBundleEventData>{ eventName: "activityCreated", object: androidApp, activity: activity, bundle: bundle });

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
                if (typedExports.onExit) {
                    typedExports.onExit();
                }

                typedExports.notify(<definition.ApplicationEventData>{ eventName: typedExports.exitEvent, object: androidApp, android: activity });

                androidApp.startActivity = undefined;
            }

            androidApp.notify(<definition.AndroidActivityEventData>{ eventName: "activityDestroyed", object: androidApp, activity: activity });

            if (androidApp.onActivityDestroyed) {
                androidApp.onActivityDestroyed(activity);
            }

            // TODO: This is a temporary workaround to force the V8's Garbage Collector, which will force the related Java Object to be collected.
            gc();
        },

        onActivityPaused: function (activity: any) {
            androidApp.paused = true;

            if (activity === androidApp.foregroundActivity) {
                if (typedExports.onSuspend) {
                    typedExports.onSuspend();
                }

                typedExports.notify(<definition.ApplicationEventData>{ eventName: typedExports.suspendEvent, object: androidApp, android: activity });
            }

            androidApp.notify(<definition.AndroidActivityEventData>{ eventName: "activityPaused", object: androidApp, activity: activity });

            if (androidApp.onActivityPaused) {
                androidApp.onActivityPaused(activity);
            }
        },

        onActivityResumed: function (activity: any) {
            androidApp.paused = false;

            if (activity === androidApp.foregroundActivity) {
                if (typedExports.onResume) {
                    typedExports.onResume();
                }

                typedExports.notify(<definition.ApplicationEventData>{ eventName: typedExports.resumeEvent, object: androidApp, android: activity });
            }

            androidApp.notify(<definition.AndroidActivityEventData>{ eventName: "activityResumed", object: androidApp, activity: activity });

            if (androidApp.onActivityResumed) {
                androidApp.onActivityResumed(activity);
            }
        },

        onActivitySaveInstanceState: function (activity: any, bundle: any) {
            androidApp.notify(<definition.AndroidActivityBundleEventData>{ eventName: "saveActivityState", object: androidApp, activity: activity, bundle: bundle });

            if (androidApp.onSaveActivityState) {
                androidApp.onSaveActivityState(activity, bundle);
            }
        },

        onActivityStarted: function (activity: any) {
            androidApp.foregroundActivity = activity;

            androidApp.notify(<definition.AndroidActivityEventData>{ eventName: "activityStarted", object: androidApp, activity: activity });

            if (androidApp.onActivityStarted) {
                androidApp.onActivityStarted(activity);
            }
        },

        onActivityStopped: function (activity: any) {
            androidApp.notify(<definition.AndroidActivityEventData>{ eventName: "activityStopped", object: androidApp, activity: activity });

            if (androidApp.onActivityStopped) {
                androidApp.onActivityStopped(activity);
            }
        }
    });

    return lifecycleCallbacks;
}

export class AndroidApplication extends observable.Observable implements definition.AndroidApplication {
    public static activityCreatedEvent = "activityCreated";
    public static activityDestroyedEvent = "activityDestroyed";
    public static activityStartedEvent = "activityStarted";
    public static activityPausedEvent = "activityPaused";
    public static activityResumedEvent = "activityResumed";
    public static activityStoppedEvent = "activityStopped";
    public static saveActivityStateEvent = "saveActivityState";
    public static activityResultEvent = "activityResult";
    public static activityBackPressedEvent = "activityBackPressed";

    public paused: boolean;
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
        ensureBroadCastReceiverClass();
        var that = this;
        var registerFunc = function (context: android.content.Context) {
            var receiver: android.content.BroadcastReceiver = new BroadcastReceiverClass(onReceiveCallback);
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

var androidApp = new AndroidApplication();
// use the exports object instead of 'export var' due to global namespace collision
typedExports.android = androidApp;

var BroadcastReceiverClass;
function ensureBroadCastReceiverClass() {
    if (BroadcastReceiverClass) {
        return;
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

    BroadcastReceiverClass = BroadcastReceiver;
}

var started = false;
export function start(entry?: frame.NavigationEntry) {
    if (started) {
        throw new Error("Application is already started.");
    }

    started = true;
    if (entry) {
        typedExports.mainEntry = entry;
    }

    loadCss();
}

var currentOrientation: number;
function setupOrientationListener(androidApp: AndroidApplication) {
    androidApp.registerBroadcastReceiver(android.content.Intent.ACTION_CONFIGURATION_CHANGED, onConfigurationChanged);
    currentOrientation = androidApp.context.getResources().getConfiguration().orientation;
}

function onConfigurationChanged(context: android.content.Context, intent: android.content.Intent) {
    var orientation = context.getResources().getConfiguration().orientation;

    if (currentOrientation !== orientation) {
        currentOrientation = orientation;

        var enums = require("ui/enums");

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

        typedExports.notify(<definition.OrientationChangedEventData>{
            eventName: typedExports.orientationChangedEvent,
            android: context,
            newValue: newValue,
            object: typedExports.android,
        });
    }
}

function loadCss() {
    typedExports.cssSelectorsCache = typedExports.loadCss(typedExports.cssFile);
}

global.__onLiveSync = function () {
    if (typedExports.android && typedExports.android.paused) {
        return;
    }

    var fileResolver: typeof fileResolverModule = require("file-system/file-name-resolver");

    // Clear file resolver cache to respect newly added files.
    fileResolver.clearCache();

    // Reload app.css in case it was changed.
    loadCss();

    // Reload current page.
    frame.reloadPage();
}

global.__onUncaughtError = function (error: definition.NativeScriptError) {
    var types: typeof typesModule = require("utils/types");

    // TODO: Obsolete this
    if (types.isFunction(typedExports.onUncaughtError)) {
        typedExports.onUncaughtError(error);
    }

    typedExports.notify({ eventName: typedExports.uncaughtErrorEvent, object: appModule.android, android: error });
}