import common = require("./utils-common");
import * as traceModule from "trace";
import enums = require("ui/enums");

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

    export function setTextDecoration(view: android.widget.TextView, value: string) {
        var flags = 0;

        var values = (value + "").split(" ");

        if (values.indexOf(enums.TextDecoration.underline) !== -1) {
            flags = flags | android.graphics.Paint.UNDERLINE_TEXT_FLAG;
        }

        if (values.indexOf(enums.TextDecoration.lineThrough) !== -1) {
            flags = flags | android.graphics.Paint.STRIKE_THRU_TEXT_FLAG;
        }

        if (values.indexOf(enums.TextDecoration.none) === -1) {
            view.setPaintFlags(flags);
        } else {
            view.setPaintFlags(0);
        }
    }

    export function setTextTransform(view: android.widget.TextView, value: string) {
        let str = view.getText() + "";
        let result: string;

        switch (value) {
            case enums.TextTransform.none:
            default:
                result = view["originalString"] || str;
                if (view["transformationMethod"]) {
                    view.setTransformationMethod(view["transformationMethod"]);
                }
                break;
            case enums.TextTransform.uppercase:
                view.setTransformationMethod(null);
                result = str.toUpperCase();
                break;
            case enums.TextTransform.lowercase:
                view.setTransformationMethod(null);
                result = str.toLowerCase();
                break;
            case enums.TextTransform.capitalize:
                view.setTransformationMethod(null);
                result = getCapitalizedString(str);
                break;
        }

        if (!view["originalString"]) {
            view["originalString"] = str;
            view["transformationMethod"] = view.getTransformationMethod();
        }

        view.setText(result);
    }

    function getCapitalizedString(str: string): string {
        var words = str.split(" ");
        var newWords = [];
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            newWords.push(word.substr(0, 1).toUpperCase() + word.substring(1));
        }

        return newWords.join(" ");
    }

    export function setWhiteSpace(view: android.widget.TextView, value: string) {
        view.setSingleLine(value === enums.WhiteSpace.nowrap);
        view.setEllipsize(value === enums.WhiteSpace.nowrap ? android.text.TextUtils.TruncateAt.END : null);
    }

    export function getApplication() { return <android.app.Application>(<any>com.tns).NativeScriptApplication.getInstance(); }
    export function getApplicationContext() { return <android.content.Context>getApplication().getApplicationContext(); }

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
                var trace: typeof traceModule = require("trace");

                trace.write("Cannot get pallete color: " + name, trace.categories.Error, trace.messageType.error);
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
        console.error("Error in OpenURL", e);
        return false;
    }
    return true;
}
