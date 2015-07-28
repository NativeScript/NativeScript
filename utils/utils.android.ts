import common = require("utils/utils-common");

global.moduleMerge(common, exports);

export module layout {
    var density = -1;
    var metrics: android.util.DisplayMetrics;

    // cache the MeasureSpec constants here, to prevent extensive marshaling calls to and from Java
    // TODO: While this boosts the performance it is error-prone in case Google changes these constants
    var MODE_SHIFT = 30;
    var MODE_MASK = 0x3 << MODE_SHIFT;
    var sdkVersion = -1;
    var useOldMeasureSpec = false;

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

    export function getDisplayDensity(): number {
        if (density === -1) {
            density = getDisplayMetrics().density;
        }

        return density;
    }

    function getDisplayMetrics(): android.util.DisplayMetrics {
        if (!metrics) {
            metrics = ad.getApplicationContext().getResources().getDisplayMetrics();
        }

        return metrics;
    }
}

// We are using "ad" here to avoid namespace collision with the global android object
export module ad {

    export function getApplication() { return <android.app.Application>(<any>com.tns).NativeScriptApplication.getInstance(); }
    export function getApplicationContext() { return <android.content.Context>getApplication().getApplicationContext(); }

    export module collections {
        export function stringArrayToStringSet(str: string[]): any {
            var hashSet = new java.util.HashSet();
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
    }
}

export function GC() {
    gc();
}