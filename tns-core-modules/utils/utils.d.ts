declare module "utils/utils" {
    export var RESOURCE_PREFIX: string;

    //@private
    /**
     * Used to cache and restore Android views' layer type, i.e. android.view.View.getLayerType and android.view.View.setLayerType. 
     */
    interface CacheLayerType {
        layerType: number;
        setLayerType(layerType: number, paint: any): void;
        getLayerType(): number;    
    }
    //@endprivate

    /**
     * Utility module related to layout.
     */
    module layout {
        /**
         * Bits that provide the actual measured size.
         */
        export var MEASURED_HEIGHT_STATE_SHIFT: number;
        export var MEASURED_SIZE_MASK: number;
        export var MEASURED_STATE_MASK: number;
        export var MEASURED_STATE_TOO_SMALL: number;
        export var UNSPECIFIED: number;
        export var EXACTLY: number;
        export var AT_MOST: number;
        /**
         * Gets measure specification mode from a given specification as string.
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
        export function makeMeasureSpec(size: number, mode: number): number;
        /**
         * Gets display density for the current device.
         */
        export function getDisplayDensity(): number;
        /**
         * Convert value to device pixels.
         * @param value - The pixel to convert.
         */
        export function toDevicePixels(value: number): number;
        /**
         * Convert value to device independent pixels.
         * @param value - The pixel to convert.
         */
        export function toDeviceIndependentPixels(value: number): number;

        export function measureSpecToString(measureSpec: number): string;
    }

    /**
     * Module with android specific utilities.
     */
    module ad {
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
         * Hides the soft input method, ususally a soft keyboard.
         */
        export function dismissSoftInput(nativeView: any /* android.view.View */): void;

        /**
         * Shows the soft input method, ususally a soft keyboard.
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
        module resources {
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
             * Gets a color from the current theme.
             * @param name - Name of the color resource.
             */
            export function getPalleteColor(name: string, context: any /* android.content.Context */): number;
        }
    }
    /**
     * Module with ios specific utilities.
     */
    module ios {
        /**
         * Checks if the property is a function and if it is, calls it on this.
         * Designed to support backward compatibility for methods that became properties.
         * Will not work on delegates since it checks if the propertyValue is a function, and delegates are marshalled as functions.
         * Example: getter(NSRunLoop, NSRunLoop.currentRunLoop).runUntilDate(NSDate.dateWithTimeIntervalSinceNow(waitTime));
         */
        export function getter<T>(_this: any, propertyValue: T | {(): T}): T;

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
             * @param str - NSArray to convert.
             */
            export function nsArrayToJSArray(a: any): string[];
        }

        /**
         * Gets an information about if current mode is Landscape.
         */
        export function isLandscape(): boolean;
        
        /**
         * Gets the iOS device major version (for 8.1 will return 8).
         */
        export var MajorVersion: number;

        /**
         * Opens file with associated application.
         * @param filePath The file path.
         */
        export function openFile(filePath: string): boolean
    }

    /**
     * An utility function that invokes garbage collection on the JavaScript side.
     */
    export function GC();

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
     * Escapes special regex symbols (., *, ^, $ and so on) in string in order to create a valid regex from it.
     * @param source The original value. 
     */
    export function escapeRegexSymbols(source: string): string
    
    /**
     * Converts string value to number or boolean.
     * @param value The original value. 
     */
    export function convertString(value: string): boolean | number;

    /**
     * Sorts an array by using merge sort algoritm (which ensures stable sort since the built-in Array.sort() does not promise a stable sort).
     * @param arr - array to be sorted
     * @param compareFunc - function that will be used to compare two elements of the array
     */
    export function mergeSort(arr: Array<any>, compareFunc: (a: any, b: any) => number): Array<any>
}
