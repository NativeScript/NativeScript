import {
    enabled as traceEnabled, write as traceWrite, categories as traceCategories,
    messageType as traceMessageType, notifyEvent as traceNotifyEvent, isCategorySet
} from "trace";

export * from "./utils-common";

export module layout {
    let density = -1;
    let metrics: android.util.DisplayMetrics;

    // cache the MeasureSpec constants here, to prevent extensive marshaling calls to and from Java
    // TODO: While this boosts the performance it is error-prone in case Google changes these constants
    const MODE_SHIFT = 30;
    const MODE_MASK = 0x3 << MODE_SHIFT;
    let sdkVersion = -1;
    let useOldMeasureSpec = false;

    export function makeMeasureSpec(size: number, mode: number): number {
        if (sdkVersion === -1) {
            // check whether the old layout is needed
            sdkVersion = ad.getApplicationContext().getApplicationInfo().targetSdkVersion;
            useOldMeasureSpec = sdkVersion <= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1;
        }

        if (useOldMeasureSpec) {
            return size + mode;
        }

        return (size & ~MODE_MASK) | (mode & MODE_MASK);
    }

    export function getDisplayMetrics(): android.util.DisplayMetrics {
        if (!metrics) {
            metrics = ad.getApplicationContext().getResources().getDisplayMetrics();
        }

        return metrics;
    }

    export function getDisplayDensity(): number {
        if (density === -1) {
            density = getDisplayMetrics().density;
        }

        return density;
    }

    export function toDevicePixels(value: number): number {
        return value * getDisplayDensity();
    }

    export function toDeviceIndependentPixels(value: number): number {
        return value / getDisplayDensity();
    }
}

// We are using "ad" here to avoid namespace collision with the global android object
export module ad {
    let nativeApp: android.app.Application;
    declare var com;
    export function getApplication() {
        if (!nativeApp) {
            // check whether the com.tns.NativeScriptApplication type exists
            if (com.tns.NativeScriptApplication) {
                nativeApp = com.tns.NativeScriptApplication.getInstance();
            }

            // the getInstance might return null if com.tns.NativeScriptApplication exists but is  not the starting app type
            if (!nativeApp) {
                // check whether application.android.init has been explicitly called
                let application = require("application");
                nativeApp = application.android.nativeApp;

                if (!nativeApp) {
                    // TODO: Should we handle the case when a custom application type is provided and the user has not explicitly initialized the application module? 
                    let clazz = java.lang.Class.forName("android.app.ActivityThread");
                    if (clazz) {
                        let method = clazz.getMethod("currentApplication", null);
                        if (method) {
                            nativeApp = method.invoke(null, null);
                        }
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
    export function getApplicationContext() {
        let app = getApplication();
        return app.getApplicationContext();
    }

    var inputMethodManager: android.view.inputmethod.InputMethodManager;
    export function getInputMethodManager() {
        if (!inputMethodManager) {
            inputMethodManager = <android.view.inputmethod.InputMethodManager>getApplicationContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
        }
        return inputMethodManager;
    }

    export function showSoftInput(nativeView: android.view.View): void {
        var imm = getInputMethodManager();
        if (imm && nativeView instanceof android.view.View) {
            imm.showSoftInput(nativeView, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
        }
    }

    export function dismissSoftInput(nativeView: android.view.View): void {
        var imm = getInputMethodManager();
        if (imm && nativeView instanceof android.view.View) {
            imm.hideSoftInputFromWindow(nativeView.getWindowToken(), 0);
        }
    }

    export module collections {
        export function stringArrayToStringSet(str: string[]): java.util.HashSet<string> {
            var hashSet = new java.util.HashSet<string>();
            if ("undefined" !== typeof str) {
                for (var element in str) {
                    hashSet.add('' + str[element]);
                }
            }
            return hashSet;
        }

        export function stringSetToStringArray(stringSet: any): string[] {
            var arr = [];
            if ("undefined" !== typeof stringSet) {
                var it = stringSet.iterator();
                while (it.hasNext()) {
                    var element = '' + it.next();
                    arr.push(element);
                }
            }

            return arr;
        }
    }

    export module resources {
        var attr;
        var attrCache = new Map<string, number>();

        export function getDrawableId(name) {
            return getId(":drawable/" + name);
        }

        export function getStringId(name) {
            return getId(":string/" + name);
        }

        export function getId(name: string): number {
            var resources = getApplicationContext().getResources();
            var packageName = getApplicationContext().getPackageName();
            var uri = packageName + name;
            return resources.getIdentifier(uri, null, null);
        }

        export function getPalleteColor(name: string, context: android.content.Context): number {
            if (attrCache.has(name)) {
                return attrCache.get(name);
            }

            var result = 0;
            try {
                if (!attr) {
                    attr = java.lang.Class.forName("android.support.v7.appcompat.R$attr")
                }

                let colorID = 0;
                let field = attr.getField(name);
                if (field) {
                    colorID = field.getInt(null);
                }

                if (colorID) {
                    let typedValue = new android.util.TypedValue();
                    context.getTheme().resolveAttribute(colorID, typedValue, true);
                    result = typedValue.data;
                }
            }
            catch (ex) {
                traceWrite("Cannot get pallete color: " + name, traceCategories.Error, traceMessageType.error);
            }

            attrCache.set(name, result);
            return result;
        }
    }
}

export function GC() {
    gc();
}

export function openUrl(location: string): boolean {
    var context = ad.getApplicationContext();
    try {
        var intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(location.trim()));
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

        context.startActivity(intent);
    } catch (e) {
        // We Don't do anything with an error.  We just output it
        traceWrite("Error in OpenURL", traceCategories.Error, traceMessageType.error);
        return false;
    }
    return true;
}