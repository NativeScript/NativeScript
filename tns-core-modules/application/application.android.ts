import appModule = require("./application-common");
import definition = require("application");
import frame = require("ui/frame");
import observable = require("data/observable");
import * as typesModule from "utils/types";
import * as enumsModule from "ui/enums";
let enums: typeof enumsModule;

global.moduleMerge(appModule, exports);
const typedExports: typeof definition = exports;

function initLifecycleCallbacks() {
    // TODO: Verify whether the logic for triggerring application-wide events based on Activity callbacks is working properly
    let lifecycleCallbacks = new android.app.Application.ActivityLifecycleCallbacks({
        onActivityCreated: function (activity: any, bundle: any) {

            console.log("------> onActivityCreated: " + activity + " activity.isNativeScriptActivity: " + activity.isNativeScriptActivity);

            // Set app theme after launch screen was used during startup
            let activityInfo = activity.getPackageManager().getActivityInfo(activity.getComponentName(), android.content.pm.PackageManager.GET_META_DATA);
            if (activityInfo.metaData) {
                let setThemeOnLaunch = activityInfo.metaData.getInt("SET_THEME_ON_LAUNCH", -1);
                if (setThemeOnLaunch !== -1) {
                    activity.setTheme(setThemeOnLaunch);
                }
            }

            if (!androidApp.startActivity) {
                androidApp.startActivity = activity;
            }

            androidApp.notify(<definition.AndroidActivityBundleEventData>{ eventName: "activityCreated", object: androidApp, activity: activity, bundle: bundle });
            if (androidApp.onActivityCreated) {
                androidApp.onActivityCreated(activity, bundle);
            }
        },

        onActivityDestroyed: function (activity: any) {
            if (activity === androidApp.startActivity) {
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
            if (activity === androidApp.foregroundActivity) {
                androidApp.foregroundActivity = undefined;
            }

            if (activity.isNativeScriptActivity) {
                androidApp.paused = true;

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
            androidApp.foregroundActivity = activity;

            if (activity.isNativeScriptActivity) {
                if (typedExports.onResume) {
                    typedExports.onResume();
                }
                typedExports.notify(<definition.ApplicationEventData>{ eventName: typedExports.resumeEvent, object: androidApp, android: activity });

                androidApp.paused = false;
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

let currentOrientation: number;
function initComponentCallbacks() {
    let componentCallbacks = new android.content.ComponentCallbacks2({
        onLowMemory: function () {
            gc();
            java.lang.System.gc();
            typedExports.notify(<definition.ApplicationEventData>{ eventName: typedExports.lowMemoryEvent, object: this, android: this });
        },

        onTrimMemory: function (level: number) {
            // TODO: This is skipped for now, test carefully for OutOfMemory exceptions
        },

        onConfigurationChanged: function (newConfig: android.content.res.Configuration) {
            let newOrientation = newConfig.orientation;
            if (newOrientation === currentOrientation) {
                return;
            }

            if (!enums) {
                enums = require("ui/enums");
            }

            currentOrientation = newOrientation;
            let newValue;

            switch (newOrientation) {
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
                android: androidApp.nativeApp,
                newValue: newValue,
                object: typedExports.android,
            });
        }
    });

    return componentCallbacks;
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
    public static activityRequestPermissionsEvent = "activityRequestPermissions";

    public paused: boolean;
    public nativeApp: android.app.Application;
    public context: android.content.Context;
    public foregroundActivity: android.app.Activity;
    public startActivity: android.app.Activity;
    public packageName: string;
    public hasActionBar: boolean;

    public get currentContext(): android.content.Context {
        return this.foregroundActivity;
    }

    public onActivityCreated: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

    public onActivityDestroyed: (activity: android.app.Activity) => void;

    public onActivityStarted: (activity: android.app.Activity) => void;

    public onActivityPaused: (activity: android.app.Activity) => void;

    public onActivityResumed: (activity: android.app.Activity) => void;

    public onActivityStopped: (activity: android.app.Activity) => void;

    public onSaveActivityState: (activity: android.app.Activity, bundle: android.os.Bundle) => void;

    public onActivityResult: (requestCode: number, resultCode: number, data: android.content.Intent) => void;

    public init(nativeApp: any) {
        if (this.nativeApp) {
            throw new Error("application.android already initialized.");
        }

        this.nativeApp = nativeApp;
        this.packageName = nativeApp.getPackageName();
        this.context = nativeApp.getApplicationContext();

        let lifecycleCallbacks = initLifecycleCallbacks();
        let componentCallbacks = initComponentCallbacks();
        this.nativeApp.registerActivityLifecycleCallbacks(lifecycleCallbacks);
        this.nativeApp.registerComponentCallbacks(componentCallbacks);

        this._registerPendingReceivers();
    }

    private _registeredReceivers = {};
    private _pendingReceiverRegistrations = new Array<(context: android.content.Context) => void>();
    private _registerPendingReceivers() {
        if (this._pendingReceiverRegistrations) {
            let i = 0;
            const length = this._pendingReceiverRegistrations.length;
            for (; i < length; i++) {
                const registerFunc = this._pendingReceiverRegistrations[i];
                registerFunc(this.context);
            }
            this._pendingReceiverRegistrations = new Array<(context: android.content.Context) => void>();
        }
    }

    public registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: android.content.Context, intent: android.content.Intent) => void) {
        ensureBroadCastReceiverClass();
        const that = this;
        const registerFunc = function (context: android.content.Context) {
            const receiver: android.content.BroadcastReceiver = new BroadcastReceiverClass(onReceiveCallback);
            context.registerReceiver(receiver, new android.content.IntentFilter(intentFilter));
            that._registeredReceivers[intentFilter] = receiver;
        };

        if (this.context) {
            registerFunc(this.context);
        }
        else {
            this._pendingReceiverRegistrations.push(registerFunc);
        }
    }

    public unregisterBroadcastReceiver(intentFilter: string) {
        const receiver = this._registeredReceivers[intentFilter];
        if (receiver) {
            this.context.unregisterReceiver(receiver);
            this._registeredReceivers[intentFilter] = undefined;
            delete this._registeredReceivers[intentFilter];
        }
    }
}

let androidApp = new AndroidApplication();
// use the exports object instead of 'export var' due to global namespace collision
typedExports.android = androidApp;

let BroadcastReceiverClass;
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

let started = false;
export function start(entry?: frame.NavigationEntry) {
    if (started) {
        throw new Error("Application is already started.");
    }

    if (!androidApp.nativeApp) {
        // we are still not initialized, this is possible if no 'androidApp.init' call has been made
        let utils = require("utils/utils");
        let nativeApp = utils.ad.getApplication();
        androidApp.init(nativeApp);
    }

    started = true;
    if (entry) {
        typedExports.mainEntry = entry;
    }

    loadCss();
}

function loadCss() {
    //HACK: identical to application.ios.ts
    typedExports.appSelectors = typedExports.loadCss(typedExports.cssFile) || [];
    if (typedExports.appSelectors.length > 0) {
        typedExports.mergeCssSelectors(typedExports);
    }
}

export function addCss(cssText: string) {
    //HACK: identical to application.ios.ts
    const parsed = typedExports.parseCss(cssText);
    if (parsed) {
        typedExports.additionalSelectors.push.apply(typedExports.additionalSelectors, parsed);
        typedExports.mergeCssSelectors(typedExports);
    }
}

global.__onLiveSync = function () {
    if (typedExports.android && typedExports.android.paused) {
        return;
    }

    appModule.__onLiveSync();

    loadCss();
};

global.__onUncaughtError = function (error: definition.NativeScriptError) {
    const types: typeof typesModule = require("utils/types");

    // TODO: Obsolete this
    if (types.isFunction(typedExports.onUncaughtError)) {
        typedExports.onUncaughtError(error);
    }

    typedExports.notify({ eventName: typedExports.uncaughtErrorEvent, object: appModule.android, android: error });
};
