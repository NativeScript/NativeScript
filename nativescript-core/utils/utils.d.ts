/**
 * @module "utils/utils"
 */ /** */

import { dip, px } from "../ui/core/view";

export * from "./mainthread-helper"

export const RESOURCE_PREFIX: string;
export const FILE_PREFIX: string;

//@private
/**
 * Used by various android event listener implementations.
 * @private
 */
interface Owned {
    owner: any;
}
//@endprivate

/**
 * Utility module related to layout.
 */
export module layout {
    /**
     * Bits that provide the actual measured size.
     */
    export const MEASURED_HEIGHT_STATE_SHIFT: number;
    export const MEASURED_SIZE_MASK: number;
    export const MEASURED_STATE_MASK: number;
    export const MEASURED_STATE_TOO_SMALL: number;
    export const UNSPECIFIED: number;
    export const EXACTLY: number;
    export const AT_MOST: number;

    /**
     * Gets layout mode from a given specification as string.
     * @param mode - The measure specification mode.
     */
    export function getMode(mode: number): string;

    /**
     * Gets measure specification mode from a given specification.
     * @param spec - The measure specification.
     */
    export function getMeasureSpecMode(spec: number): number;

    /**
     * Gets measure specification size from a given specification.
     * @param spec - The measure specification.
     */
    export function getMeasureSpecSize(spec: number): number;

    /**
     * Creates measure specification size from size and mode.
     * @param size - The size component of measure specification.
     * @param mode - The mode component of measure specification.
     */
    export function makeMeasureSpec(px: number, mode: number): number;

    /**
     * Gets display density for the current device.
     */
    export function getDisplayDensity(): number;

    /**
     * Convert device independent pixels to device pixels - dip to px.
     * @param value - The pixel to convert.
     */
    export function toDevicePixels(value: dip): px;

    /**
     * Convert device pixels to device independent pixels - px to dip.
     * @param value - The pixel to convert.
     */
    export function toDeviceIndependentPixels(value: px): dip;

    /**
     * Rounds value used in layout.
     * @param px to round.
     */
    export function round(px: px): px;

    /**
     * Converts device pixels to device independent pixes and measure the nativeView.
     * Returns the desired size of the nativeView in device pixels.
     * @param nativeView the nativeView to measure (UIView or android.view.View)
     * @param width the available width
     * @param widthMode width mode - UNSPECIFIED, EXACTLY or AT_MOST
     * @param height the available hegiht
     * @param heightMode height mode - UNSPECIFIED, EXACTLY or AT_MOST
     */
    export function measureNativeView(nativeView: any /* UIView or android.view.View */, width: number, widthMode: number, height: number, heightMode: number): { width: number, height: number };

    /**
     * Prints user friendly version of the measureSpec.
     * @param measureSpec the spec to print
     */
    export function measureSpecToString(measureSpec: number): string;
}

/**
 * Module with android specific utilities.
 */
export module ad {
    /**
     * Gets the native Android application instance.
     */
    export function getApplication(): any /* android.app.Application */;

    /**
     * Gets the Android application context.
     */
    export function getApplicationContext(): any /* android.content.Context */;

    /**
     * Gets the native Android input method manager.
     */
    export function getInputMethodManager(): any /* android.view.inputmethod.InputMethodManager */;

    /**
     * Hides the soft input method, usually a soft keyboard.
     */
    export function dismissSoftInput(nativeView?: any /* android.view.View */): void;

    /**
     * Shows the soft input method, usually a soft keyboard.
     */
    export function showSoftInput(nativeView: any /* android.view.View */): void;

    /**
     * Utility module dealing with some android collections.
     */
    module collections {
        /**
         * Converts string array into a String [hash set](http://developer.android.com/reference/java/util/HashSet.html).
         * @param str - An array of strings to convert.
         */
        export function stringArrayToStringSet(str: string[]): any;

        /**
         * Converts string hash set into array of strings.
         * @param stringSet - A string hash set to convert.
         */
        export function stringSetToStringArray(stringSet: any): string[];
    }

    /**
     * Utility module related to android resources.
     */
    export module resources {
        /**
         * Gets the drawable id from a given name.
         * @param name - Name of the resource.
         */
        export function getDrawableId(name);

        /**
         * Gets the string id from a given name.
         * @param name - Name of the resource.
         */
        export function getStringId(name)

        /**
         * Gets the id from a given name.
         * @param name - Name of the resource.
         */
        export function getId(name: string): number;

        /**
         * [Obsolete - please use getPaletteColor] Gets a color from current theme.
         * @param name - Name of the color
         */
        export function getPalleteColor();

        /**
         * Gets a color from the current theme.
         * @param name - Name of the color resource.
         */
        export function getPaletteColor(name: string, context: any /* android.content.Context */): number;
    }
}
/**
 * Module with ios specific utilities.
 */
export module ios {

    // Common properties between UILabel, UITextView and UITextField
    export interface TextUIView {
        font: any;
        textAlignment: number;
        textColor: any;
        text: string;
        attributedText: any;
        lineBreakMode: number;
        numberOfLines: number;
    }

    /**
     * Utility module dealing with some iOS collections.
     */
    module collections {
        /**
         * Converts JavaScript array to [NSArray](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSArray_Class/).
         * @param str - JavaScript string array to convert.
         */
        export function jsArrayToNSArray(str: string[]): any;

        /**
         * Converts NSArray to JavaScript array.
         * @param a - NSArray to convert.
         */
        export function nsArrayToJSArray(a: any): string[];
    }

    /**
     * @deprecated use application.orientation instead
     *
     * Gets an information about if current mode is Landscape.
     */
    export function isLandscape(): boolean;

    /**
     * Gets the iOS device major version (for 8.1 will return 8).
     */
    export const MajorVersion: number;

    /**
     * Opens file with associated application.
     * @param filePath The file path.
     */
    export function openFile(filePath: string): boolean;

    /**
     * Joins an array of file paths.
     * @param paths An array of paths.
     * Returns the joined path.
     */
    export function joinPaths(...paths: string[]): string;

    /**
     * Gets the root folder for the current application. This Folder is private for the application and not accessible from Users/External apps.
     * iOS - this folder is read-only and contains the app and all its resources.
     */
    export function getCurrentAppPath(): string;

    /**
     * Gets the currently visible(topmost) UIViewController.
     * @param rootViewController The root UIViewController instance to start searching from (normally window.rootViewController).
     * Returns the visible UIViewController.
     */
    export function getVisibleViewController(rootViewController: any/* UIViewController*/): any/* UIViewController*/;

}

/**
 * An utility function that invokes garbage collection on the JavaScript side.
 */
export function GC();

/**
 * Releases the reference to the wrapped native object
 * @param object The Java/Objective-C object to release.
 */
export function releaseNativeObject(object: any /*java.lang.Object | NSObject*/);

/**
 * Checks if the current thread is the main thread. Directly calls the passed function
 * if it is, or dispatches it to the main thread otherwise.
 * @param func The function to execute on the main thread.
 */
export function executeOnMainThread(func: Function);

/**
 * Returns a function wrapper which executes the supplied function on the main thread.
 * The wrapper behaves like the original function and passes all of its arguments BUT
 * discards its return value.
 * @param func The function to execute on the main thread
 * @returns The wrapper function which schedules execution to the main thread
 */
export function mainThreadify(func: Function): (...args: any[]) => void

/**
 * Returns true if the specified URI is a font icon URI like "fontIcon://&#xf1e0".
 * @param uri The URI.
 */
export function isFontIconURI(uri: string): boolean

/**
 * Returns true if the specified path points to a resource or local file.
 * @param path The path.
 */
export function isFileOrResourcePath(path: string): boolean

/**
 * Returns true if the specified URI is data URI (http://en.wikipedia.org/wiki/Data_URI_scheme).
 * @param uri The URI.
 */
export function isDataURI(uri: string): boolean

/**
 * Opens url.
 * @param url The url.
 */
export function openUrl(url: string): boolean

/**
 * Opens file.
 * @param filePath The file.
 */
export function openFile(filePath: string): boolean

/**
 * Escapes special regex symbols (., *, ^, $ and so on) in string in order to create a valid regex from it.
 * @param source The original value.
 */
export function escapeRegexSymbols(source: string): string

/**
 * Converts string value to number or boolean.
 * @param value The original value.
 */
export function convertString(value: any): any

/**
 * Gets module name from path.
 * @param path The module path.
 */
export function getModuleName(path: string): string

/**
 * Sorts an array by using merge sort algorithm (which ensures stable sort since the built-in Array.sort() does not promise a stable sort).
 * @param arr - array to be sorted
 * @param compareFunc - function that will be used to compare two elements of the array
 */
export function mergeSort(arr: Array<any>, compareFunc: (a: any, b: any) => number): Array<any>

/**
 * Checks if array has any duplicate elements.
 * @param arr - The array to be checked.
 */
export function hasDuplicates(arr: Array<any>): boolean;

/**
 * Removes duplicate elements from array.
 * @param arr - The array.
 */
export function eliminateDuplicates(arr: Array<any>): Array<any>;
