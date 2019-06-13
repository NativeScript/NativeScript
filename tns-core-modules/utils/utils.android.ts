import {
    write as traceWrite,
    categories as traceCategories,
    messageType as traceMessageType,
} from "../trace";

export * from "./utils-common";

import { getNativeApplication, android as androidApp } from "../application";
import { device } from "../platform";
import { FileSystemAccess } from "../file-system/file-system-access";

const MIN_URI_SHARE_RESTRICTED_APK_VERSION = 24;

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

    export function measureNativeView(nativeView: any /* android.view.View */, width: number, widthMode: number, height: number, heightMode: number): { width: number, height: number } {
        const view = <android.view.View>nativeView;
        view.measure(makeMeasureSpec(width, widthMode), makeMeasureSpec(height, heightMode));
        return {
            width: view.getMeasuredWidth(),
            height: view.getMeasuredHeight()
        };
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

    export function dismissSoftInput(nativeView?: android.view.View): void {
        const inputManager = getInputMethodManager();
        let windowToken: android.os.IBinder;

        if (nativeView instanceof android.view.View) {
            windowToken = nativeView.getWindowToken()
        } else if (androidApp.foregroundActivity instanceof androidx.appcompat.app.AppCompatActivity) {
            const decorView = androidApp.foregroundActivity.getWindow().getDecorView();
            windowToken = decorView ? decorView.getWindowToken() : null;
        }

        if (inputManager && windowToken) {
            inputManager.hideSoftInputFromWindow(windowToken, 0);
        }
    }

    export module collections {
        export function stringArrayToStringSet(str: string[]): java.util.HashSet<string> {
            const hashSet = new java.util.HashSet<string>();
            if (str !== undefined) {
                for (let element in str) {
                    hashSet.add("" + str[element]);
                }
            }
            return hashSet;
        }

        export function stringSetToStringArray(stringSet: any): string[] {
            const arr = [];
            if (stringSet !== undefined) {
                const it = stringSet.iterator();
                while (it.hasNext()) {
                    const element = "" + it.next();
                    arr.push(element);
                }
            }

            return arr;
        }
    }

    export module resources {
        let attr;
        const attrCache = new Map<string, number>();

        export function getDrawableId(name) {
            return getId(":drawable/" + name);
        }

        export function getStringId(name) {
            return getId(":string/" + name);
        }

        export function getId(name: string): number {
            const resources = getResources();
            const packageName = getPackageName();
            const uri = packageName + name;
            return resources.getIdentifier(uri, null, null);
        }
        export function getPalleteColor(name: string, context: android.content.Context): number {
            return getPaletteColor(name, context);
        }
        export function getPaletteColor(name: string, context: android.content.Context): number {
            if (attrCache.has(name)) {
                return attrCache.get(name);
            }

            let result = 0;
            try {
                if (!attr) {
                    attr = java.lang.Class.forName("androidx.appcompat.R$attr")
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

export function releaseNativeObject(object: java.lang.Object) {
    __releaseNativeCounterpart(object);
}

export function openUrl(location: string): boolean {
    const context = ad.getApplicationContext();
    try {
        const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(location.trim()));
        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

        context.startActivity(intent);
    } catch (e) {
        // We Don't do anything with an error.  We just output it
        traceWrite("Error in OpenURL", traceCategories.Error, traceMessageType.error);
        return false;
    }
    return true;
}

/**
 * Check whether external storage is read only
 *
 * @returns {boolean} whether the external storage is read only
 */
function isExternalStorageReadOnly(): boolean {
    const extStorageState = android.os.Environment.getExternalStorageState();
    if (android.os.Environment.MEDIA_MOUNTED_READ_ONLY === extStorageState) {
        return true;
    }
    return false;
}

/**
 * Checks whether external storage is available
 *
 * @returns {boolean} whether external storage is available
 */
function isExternalStorageAvailable(): boolean {
    const extStorageState = android.os.Environment.getExternalStorageState();
    if (android.os.Environment.MEDIA_MOUNTED === extStorageState) {
        return true;
    }
    return false;
}

/**
 * Detect the mimetype of a file at a given path
 *
 * @param {string} filePath
 * @returns {string} mimetype
 */
function getMimeTypeNameFromExtension(filePath: string): string {
    const mimeTypeMap = android.webkit.MimeTypeMap.getSingleton();
    const extension = new FileSystemAccess()
        .getFileExtension(filePath)
        .replace(".", "")
        .toLowerCase();

    return mimeTypeMap.getMimeTypeFromExtension(extension);
}

/**
 * Open a file
 *
 * @param {string} filePath
 * @returns {boolean} whether opening the file succeeded or not
 */
export function openFile(filePath: string): boolean {
    const context = ad.getApplicationContext();
    try {
        // Ensure external storage is available
        if (!isExternalStorageAvailable()) {
            traceWrite(
                `
External storage is unavailable (please check app permissions).
Applications cannot access internal storage of other application on Android (see: https://developer.android.com/guide/topics/data/data-storage).
`,
                traceCategories.Error,
                traceMessageType.error,
            );

            return false;
        }

        // Ensure external storage is available
        if (isExternalStorageReadOnly()) {
            traceWrite("External storage is read only", traceCategories.Error, traceMessageType.error);
            return false;
        }

        // Determine file mimetype & start creating intent
        const mimeType = getMimeTypeNameFromExtension(filePath);
        const intent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
        const chooserIntent = android.content.Intent.createChooser(intent, "Open File...");

        intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
        chooserIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);

        // Android SDK <28 only requires starting the chooser Intent straight forwardly
        const sdkVersion = parseInt(device.sdkVersion, 10);
        if (sdkVersion && sdkVersion < MIN_URI_SHARE_RESTRICTED_APK_VERSION) {
            traceWrite(
                `detected sdk version ${sdkVersion} (< ${MIN_URI_SHARE_RESTRICTED_APK_VERSION}), using simple openFile`,
                traceCategories.Debug
            );
            intent.setDataAndType(android.net.Uri.fromFile(new java.io.File(filePath)), mimeType);
            context.startActivity(chooserIntent);
            return true;
        }

        traceWrite(
            `detected sdk version ${sdkVersion} (>= ${MIN_URI_SHARE_RESTRICTED_APK_VERSION}), using URI openFile`,
            traceCategories.Debug
        );

        // Android SDK 24+ introduced file system permissions changes that disallow
        // exposing URIs between applications
        //
        // see: https://developer.android.com/reference/android/os/FileUriExposedException
        // see: https://github.com/NativeScript/NativeScript/issues/5661#issuecomment-456405380
        const providerName = `${context.getPackageName()}.provider`;
        traceWrite(`fully-qualified provider name [${providerName}]`, traceCategories.Debug);

        const apkURI = 	androidx.core.content.FileProvider.getUriForFile(
            context,
            providerName,
            new java.io.File(filePath),
        );

        // Set flags & URI as data type on the view action
        intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        chooserIntent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);

        // Finish intent setup
        intent.setDataAndType(apkURI, mimeType);

        context.startActivity(chooserIntent);

        return true;
    } catch (err) {
        const msg = err.message ? `: ${err.message}` : "";
        traceWrite(`Error in openFile${msg}`, traceCategories.Error, traceMessageType.error);

        if (msg &&
            msg.includes("Attempt to invoke virtual method") &&
            msg.includes("android.content.pm.ProviderInfo.loadXmlMetaData") &&
            msg.includes("on a null object reference")) {
            // Alert user to possible fix
            traceWrite(
                `
Please ensure you have your manifest correctly configured with the FileProvider.
(see: https://developer.android.com/reference/android/support/v4/content/FileProvider#ProviderDefinition)
`,
                traceCategories.Error,
            );
        }

        return false;
    }
}
