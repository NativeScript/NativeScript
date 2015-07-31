declare module "utils/utils" {
    import native_api = require("native-api");
    import colorModule = require("color");
    import view = require("ui/core/view");

    export var RESOURCE_PREFIX: string;

    /**
     * Utility module related to layout.
     */
    module layout {
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
    }

    /**
     * Module with android specific utilities.
     */
    module ad {
        /**
         * Gets the native Android application instance.
         */
        export function getApplication(): native_api.android.app.Application;

        /**
         * Gets the Android application context.
         */
        export function getApplicationContext(): native_api.android.content.Context;

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
        }

        export function async<T>(doInBackground: () => T, callback: (result: T) => void);
    }
    /**
     * Module with ios specific utilities.
     */
    module ios {
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
         * Gets NativeScript color from [UIColor](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIColor_Class/).
         * @param uiColor - UIColor instance used to create a NativeScript color.
         */
        export function getColor(uiColor: native_api.UIColor): colorModule.Color;
        /**
         * Gets actual height of a [UIView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIView_Class/) widget.
         * @param uiView - An instance of UIView.
         */
        export function getActualHeight(uiView: native_api.UIView): number;
        /**
         * Gets an information about if current mode is Landscape.
         */
        export function isLandscape(): boolean;
        /**
         * Gets the iOS device major version (for 8.1 will return 8).
         */
        export var MajorVersion: number;

        export function _layoutRootView(rootView: view.View, parentBounds: native_api.CGRect): void;
    }
    /**
     * An utility function that copies properties from source object to target object.
     * @param source - The source object.
     * @param target - The target object.
     */
    export function copyFrom(source: any, target: any);
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
}
