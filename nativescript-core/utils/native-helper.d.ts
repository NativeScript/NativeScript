/**
 * Module with android specific utilities.
 */
export module ad {
    /**
     * Gets the native Android application instance.
     */
    export function getApplication(): any /* android.app.Application */;

    /**
     * Gets the native Android application resources.
     */
    export function getResources(): any /* android.content.res.Resources */;

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

    /**
     * 
     * @param transform Applies a rotation transform over X,Y and Z axis
     * @param x Rotation over X axis in degrees
     * @param y Rotation over Y axis in degrees
     * @param z Rotation over Z axis in degrees
     */
    export function applyRotateTransform(transform: any /* CATransform3D*/, x: number, y: number, z: number): any /* CATransform3D*/;

    export class UIDocumentInteractionControllerDelegateImpl { }
}
