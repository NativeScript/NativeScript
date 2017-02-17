import {
    write as traceWrite, categories as traceCategories, messageType as traceMessageType
} from "trace";

export * from "./utils-common";

import { getNativeApplication } from "application";

export module layout {
    let density: number;

    // cache the MeasureSpec constants here, to prevent extensive marshaling calls to and from Java
    // TODO: While this boosts the performance it is error-prone in case Google changes these constants
    const MODE_SHIFT = 30;
    const MODE_MASK = 0x3 << MODE_SHIFT;
    let sdkVersion: number;
    let useOldMeasureSpec = false;

    export function makeMeasureSpec(size: number, mode: number): number {
        if (sdkVersion === undefined) {
            // check whether the old layout is needed
            sdkVersion = ad.getApplicationContext().getApplicationInfo().targetSdkVersion;
            useOldMeasureSpec = sdkVersion <= android.os.Build.VERSION_CODES.JELLY_BEAN_MR1;
        }

        if (useOldMeasureSpec) {
            return size + mode;
        }

        return (size & ~MODE_MASK) | (mode & MODE_MASK);
    }

    export function getDisplayDensity(): number {
        if (density === undefined) {
            density = ad.getResources().getDisplayMetrics().density;
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

    let application: android.app.Application;
    let applicationContext: android.content.Context;
    let contextResources: android.content.res.Resources;
    let packageName: string;
    export function getApplicationContext() {
        if (!applicationContext) {
            applicationContext = getApplication().getApplicationContext();
        }

        return applicationContext;
    }
    export function getApplication() {
        if (!application) {
            application = (<android.app.Application>getNativeApplication());
        }

        return application;
    }
    export function getResources() {
        if (!contextResources) {
            contextResources = getApplication().getResources();
        }

        return contextResources;
    }
    function getPackageName() {
        if (!packageName) {
            packageName = getApplicationContext().getPackageName();
        }

        return packageName;
    }

    let inputMethodManager: android.view.inputmethod.InputMethodManager;
    export function getInputMethodManager(): android.view.inputmethod.InputMethodManager {
        if (!inputMethodManager) {
            inputMethodManager = <android.view.inputmethod.InputMethodManager>getApplicationContext().getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
        }
        return inputMethodManager;
    }

    export function showSoftInput(nativeView: android.view.View): void {
        const inputManager = getInputMethodManager();
        if (inputManager && nativeView instanceof android.view.View) {
            inputManager.showSoftInput(nativeView, android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT);
        }
    }

    export function dismissSoftInput(nativeView: android.view.View): void {
        const inputManager = getInputMethodManager();
        if (inputManager && nativeView instanceof android.view.View && inputManager.isActive(nativeView)) {
            inputManager.hideSoftInputFromWindow(nativeView.getWindowToken(), 0);
        }
    }

    export module collections {
        export function stringArrayToStringSet(str: string[]): java.util.HashSet<string> {
            var hashSet = new java.util.HashSet<string>();
            if (str !== undefined) {
                for (var element in str) {
                    hashSet.add('' + str[element]);
                }
            }
            return hashSet;
        }

        export function stringSetToStringArray(stringSet: any): string[] {
            var arr = [];
            if (stringSet !== undefined) {
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
            var resources = getResources();
            var packageName = getPackageName();
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
    const context = ad.getApplicationContext();
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