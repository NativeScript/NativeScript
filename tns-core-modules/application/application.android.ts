import {
    AndroidActivityBundleEventData, AndroidActivityEventData, ApplicationEventData, OrientationChangedEventData,
    AndroidApplication as AndroidApplicationDefinition
} from "application";

import {
    notify, lowMemoryEvent, orientationChangedEvent, suspendEvent, resumeEvent,
    setApplication, livesync, Observable
} from "./application-common";

// First reexport so that app module is initialized.
export * from "./application-common";

import { NavigationEntry } from "ui/frame";

const ActivityCreated = "activityCreated";
const ActivityDestroyed = "activityDestroyed";
const ActivityStarted = "activityStarted";
const ActivityPaused = "activityPaused";
const ActivityResumed = "activityResumed";
const ActivityStopped = "activityStopped";
const SaveActivityState = "saveActivityState";
const ActivityResult = "activityResult";
const ActivityBackPressed = "activityBackPressed";
const ActivityRequestPermissions = "activityRequestPermissions";

export class AndroidApplication extends Observable implements AndroidApplicationDefinition {
    public static activityCreatedEvent = ActivityCreated;
    public static activityDestroyedEvent = ActivityDestroyed;
    public static activityStartedEvent = ActivityStarted;
    public static activityPausedEvent = ActivityPaused;
    public static activityResumedEvent = ActivityResumed;
    public static activityStoppedEvent = ActivityStopped;
    public static saveActivityStateEvent = SaveActivityState;
    public static activityResultEvent = ActivityResult;
    public static activityBackPressedEvent = ActivityBackPressed;
    public static activityRequestPermissionsEvent = ActivityRequestPermissions;

    public paused: boolean;
    public nativeApp: android.app.Application;
    public context: android.content.Context;
    public foregroundActivity: android.app.Activity;
    public startActivity: android.app.Activity;
    public packageName: string;

    public get currentContext(): android.content.Context {
        return this.foregroundActivity;
    }

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
        this._pendingReceiverRegistrations.forEach(func => func(this.context));
        this._pendingReceiverRegistrations.length = 0;
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

const androidApp = new AndroidApplication();
// use the exports object instead of 'export var' due to global namespace collision
exports.android = androidApp;
setApplication(androidApp);

let started = false;
export function start(entry?: NavigationEntry) {
    if (started) {
        throw new Error("Application is already started.");
    }

    if (!androidApp.nativeApp) {
        const nativeApp = getNativeApplication();
        androidApp.init(nativeApp);
    }

    started = true;
    if (entry) {
        exports.mainEntry = entry;
    }
}

export function getNativeApplication(): android.app.Application {
    // Try getting it from module - check whether application.android.init has been explicitly called
    let nativeApp = androidApp.nativeApp;
    if (!nativeApp) {
        // check whether the com.tns.NativeScriptApplication type exists
        if (!nativeApp && com.tns.NativeScriptApplication) {
            nativeApp = com.tns.NativeScriptApplication.getInstance();
        }

        // the getInstance might return null if com.tns.NativeScriptApplication exists but is  not the starting app type
        if (!nativeApp) {
            // TODO: Should we handle the case when a custom application type is provided and the user has not explicitly initialized the application module? 
            const clazz = java.lang.Class.forName("android.app.ActivityThread");
            if (clazz) {
                const method = clazz.getMethod("currentApplication", null);
                if (method) {
                    nativeApp = method.invoke(null, null);
                }
            }
        }

        // we cannot work without having the app instance
        if (!nativeApp) {
            throw new Error("Failed to retrieve native Android Application object. If you have a custom android.app.Application type implemented make sure that you've called the '<application-module>.android.init' method.")
        }
    }

    return nativeApp;
}

global.__onLiveSync = function () {
    if (androidApp && androidApp.paused) {
        return;
    }

    livesync();
};

function initLifecycleCallbacks() {
    // TODO: Verify whether the logic for triggerring application-wide events based on Activity callbacks is working properly
    const lifecycleCallbacks = new android.app.Application.ActivityLifecycleCallbacks({
        onActivityCreated: function (activity: android.app.Activity, savedInstanceState: android.os.Bundle) {
            // Set app theme after launch screen was used during startup
            const activityInfo = activity.getPackageManager().getActivityInfo(activity.getComponentName(), android.content.pm.PackageManager.GET_META_DATA);
            if (activityInfo.metaData) {
                const setThemeOnLaunch = activityInfo.metaData.getInt("SET_THEME_ON_LAUNCH", -1);
                if (setThemeOnLaunch !== -1) {
                    activity.setTheme(setThemeOnLaunch);
                }
            }

            if (!androidApp.startActivity) {
                androidApp.startActivity = activity;
            }

            androidApp.notify(<AndroidActivityBundleEventData>{ eventName: ActivityCreated, object: androidApp, activity: activity, bundle: savedInstanceState });
        },

        onActivityDestroyed: function (activity: android.app.Activity) {
            if (activity === androidApp.foregroundActivity) {
                androidApp.foregroundActivity = undefined;
            }

            if (activity === androidApp.startActivity) {
                androidApp.startActivity = undefined;
            }

            androidApp.notify(<AndroidActivityEventData>{ eventName: ActivityDestroyed, object: androidApp, activity: activity });
            // TODO: This is a temporary workaround to force the V8's Garbage Collector, which will force the related Java Object to be collected.
            gc();
        },

        onActivityPaused: function (activity: android.app.Activity) {
            if ((<any>activity).isNativeScriptActivity) {
                androidApp.paused = true;
                notify(<ApplicationEventData>{ eventName: suspendEvent, object: androidApp, android: activity });
            }

            androidApp.notify(<AndroidActivityEventData>{ eventName: ActivityPaused, object: androidApp, activity: activity });
        },

        onActivityResumed: function (activity: android.app.Activity) {
            androidApp.foregroundActivity = activity;

            if ((<any>activity).isNativeScriptActivity) {
                notify(<ApplicationEventData>{ eventName: resumeEvent, object: androidApp, android: activity });
                androidApp.paused = false;
            }

            androidApp.notify(<AndroidActivityEventData>{ eventName: ActivityResumed, object: androidApp, activity: activity });
        },

        onActivitySaveInstanceState: function (activity: android.app.Activity, outState: android.os.Bundle) {
            androidApp.notify(<AndroidActivityBundleEventData>{ eventName: SaveActivityState, object: androidApp, activity: activity, bundle: outState });
        },

        onActivityStarted: function (activity: android.app.Activity) {
            androidApp.notify(<AndroidActivityEventData>{ eventName: ActivityStarted, object: androidApp, activity: activity });
        },

        onActivityStopped: function (activity: android.app.Activity) {
            androidApp.notify(<AndroidActivityEventData>{ eventName: ActivityStopped, object: androidApp, activity: activity });
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
            notify(<ApplicationEventData>{ eventName: lowMemoryEvent, object: this, android: this });
        },

        onTrimMemory: function (level: number) {
            // TODO: This is skipped for now, test carefully for OutOfMemory exceptions
        },

        onConfigurationChanged: function (newConfig: android.content.res.Configuration) {
            let newOrientation = newConfig.orientation;
            if (newOrientation === currentOrientation) {
                return;
            }

            currentOrientation = newOrientation;
            let newValue;

            switch (newOrientation) {
                case android.content.res.Configuration.ORIENTATION_LANDSCAPE:
                    newValue = "landscape";
                    break;
                case android.content.res.Configuration.ORIENTATION_PORTRAIT:
                    newValue = "portrait";
                    break;
                default:
                    newValue = "unknown";
                    break;
            }

            notify(<OrientationChangedEventData>{
                eventName: orientationChangedEvent,
                android: androidApp.nativeApp,
                newValue: newValue,
                object: androidApp
            });
        }
    });

    return componentCallbacks;
}

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

declare namespace com {
    namespace tns {
        class NativeScriptApplication extends android.app.Application {
            static getInstance(): NativeScriptApplication;
        }
    }
}