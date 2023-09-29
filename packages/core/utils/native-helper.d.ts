/**
 * Data serialization from JS > Native
 * @param wrapPrimitives Optionally wrap primitive types (Some APIs may require this)
 */
export function dataSerialize(data?: any, wrapPrimitives?: boolean): any;
/**
 * Data deserialization from Native > JS
 * @param nativeData Native platform data
 */
export function dataDeserialize(nativeData?: any): any;

// /**
//  * Module with android specific utilities.
//  */
// declare namespace AndroidUtils {
// 	/**
// 	 * Gets the native Android application instance.
// 	 */
// 	export function getApplication(): any; /* android.app.Application */

// 	/**
// 	 * Get the current native Android activity.
// 	 */
// 	export function getCurrentActivity(): any; /* android.app.Activity */
// 	/**
// 	 * Gets the native Android application resources.
// 	 */
// 	export function getResources(): any; /* android.content.res.Resources */

// 	/**
// 	 * Gets the Android application context.
// 	 */
// 	export function getApplicationContext(): any; /* android.content.Context */

// 	/**
// 	 * Gets the native Android input method manager.
// 	 */
// 	export function getInputMethodManager(): any; /* android.view.inputmethod.InputMethodManager */

// 	/**
// 	 * Hides the soft input method, usually a soft keyboard.
// 	 */
// 	export function dismissSoftInput(nativeView?: any /* android.view.View */): void;

// 	/**
// 	 * Shows the soft input method, usually a soft keyboard.
// 	 */
// 	export function showSoftInput(nativeView: any /* android.view.View */): void;

// 	/**
// 	 * Utility module dealing with some android collections.
// 	 */
// 	namespace collections {
// 		/**
// 		 * Converts string array into a String [hash set](http://developer.android.com/reference/java/util/HashSet.html).
// 		 * @param str - An array of strings to convert.
// 		 */
// 		export function stringArrayToStringSet(str: string[]): any;

// 		/**
// 		 * Converts string hash set into array of strings.
// 		 * @param stringSet - A string hash set to convert.
// 		 */
// 		export function stringSetToStringArray(stringSet: any): string[];
// 	}

// 	/**
// 	 * Utility module related to android resources.
// 	 */
// 	export namespace resources {
// 		/**
// 		 * Gets the drawable id from a given name.
// 		 * @param name - Name of the resource.
// 		 */
// 		export function getDrawableId(name);

// 		/**
// 		 * Gets the string id from a given name.
// 		 * @param name - Name of the resource.
// 		 */
// 		export function getStringId(name);

// 		/**
// 		 * Gets the id from a given name.
// 		 * @param name - Name of the resource.
// 		 */
// 		export function getId(name: string): number;

// 		/**
// 		 * Gets the id from a given name with optional type.
// 		 * This sets an explicit package name.
// 		 * https://developer.android.com/reference/android/content/res/Resources#getIdentifier(java.lang.String,%20java.lang.String,%20java.lang.String)
// 		 * @param name - Name of the resource.
// 		 * @param type - (Optional) type
// 		 */
// 		export function getResource(name: string, type?: string): number;

// 		/**
// 		 * [Obsolete - please use getPaletteColor] Gets a color from current theme.
// 		 * @param name - Name of the color
// 		 */
// 		export function getPalleteColor();

// 		/**
// 		 * Gets a color from the current theme.
// 		 * @param name - Name of the color resource.
// 		 */
// 		export function getPaletteColor(name: string, context: any /* android.content.Context */): number;
// 	}

// 	/**
// 	 * Checks whether the application is running on real device and not on emulator.
// 	 */
// 	export function isRealDevice(): boolean;
// }

// /**
//  * Module with ios specific utilities.
//  */
// declare namespace iOSUtils {
// 	// Common properties between UILabel, UITextView and UITextField
// 	export interface TextUIView {
// 		font: any;
// 		textAlignment: number;
// 		textColor: any;
// 		text: string;
// 		attributedText: any;
// 		lineBreakMode: number;
// 		numberOfLines: number;
// 	}

// 	/**
// 	 * Utility module dealing with some iOS collections.
// 	 */
// 	export namespace collections {
// 		/**
// 		 * Converts JavaScript array to [NSArray](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSArray_Class/).
// 		 * @param str - JavaScript string array to convert.
// 		 */
// 		export function jsArrayToNSArray<T>(str: T[]): NSArray<T>;

// 		/**
// 		 * Converts NSArray to JavaScript array.
// 		 * @param a - NSArray to convert.
// 		 */
// 		export function nsArrayToJSArray<T>(a: NSArray<T>): T[];
// 	}

// 	/**
// 	 * Get the root UIViewController of the app
// 	 */
// 	export function getRootViewController(): any; /* UIViewController */

// 	/**
// 	 * Get the UIWindow of the app
// 	 */
// 	export function getWindow(): any; /* UIWindow */

// 	/**
// 	 * Set the window background color of base view of the app.
// 	 * Often this is shown when opening a modal as the view underneath scales down revealing the window color.
// 	 * @param value color (hex, rgb, rgba, etc.)
// 	 */
// 	export function setWindowBackgroundColor(value: string): void;

// 	/**
// 	 * Data serialize and deserialize helpers
// 	 */
// 	export function dataSerialize(data?: any): any;
// 	export function dataDeserialize(nativeData?: any): any;

// 	/**
// 	 * @deprecated use application.orientation instead
// 	 *
// 	 * Gets an information about if current mode is Landscape.
// 	 */
// 	export function isLandscape(): boolean;

// 	/**
// 	 * Gets the iOS device major version (for 8.1 will return 8).
// 	 */
// 	export const MajorVersion: number;

// 	/**
// 	 * Opens file with associated application.
// 	 * @param filePath The file path.
// 	 */
// 	export function openFile(filePath: string): boolean;

// 	/**
// 	 * Joins an array of file paths.
// 	 * @param paths An array of paths.
// 	 * Returns the joined path.
// 	 */
// 	export function joinPaths(...paths: string[]): string;

// 	/**
// 	 * Gets the root folder for the current application. This Folder is private for the application and not accessible from Users/External apps.
// 	 * iOS - this folder is read-only and contains the app and all its resources.
// 	 */
// 	export function getCurrentAppPath(): string;

// 	/**
// 	 * Gets the currently visible(topmost) UIViewController.
// 	 * @param rootViewController The root UIViewController instance to start searching from (normally window.rootViewController).
// 	 * Returns the visible UIViewController.
// 	 */
// 	export function getVisibleViewController(rootViewController: any /* UIViewController*/): any; /* UIViewController*/

// 	/**
// 	 *
// 	 * @param transform Applies a rotation transform over X,Y and Z axis
// 	 * @param x Rotation over X axis in degrees
// 	 * @param y Rotation over Y axis in degrees
// 	 * @param z Rotation over Z axis in degrees
// 	 */
// 	export function applyRotateTransform(transform: any /* CATransform3D*/, x: number, y: number, z: number): any; /* CATransform3D*/

// 	/**
// 	 * Create a UIDocumentInteractionControllerDelegate implementation for use with UIDocumentInteractionController
// 	 */
// 	export function createUIDocumentInteractionControllerDelegate(): any;

// 	/**
// 	 * Checks whether the application is running on real device and not on simulator.
// 	 */
// 	export function isRealDevice(): boolean;

// 	/**
// 	 * Debug utility to insert CGRect values into logging output.
// 	 * Note: when printing a CGRect directly it will print blank so this helps show the values.
// 	 * @param rect CGRect
// 	 */
// 	export function printCGRect(rect: CGRect): void;

// 	/**
// 	 * Take a snapshot of a View on screen.
// 	 * @param view view to snapshot
// 	 * @param scale screen scale
// 	 */
// 	export function snapshotView(view: UIView, scale: number): UIImage;

// 	/**
// 	 * Copy layer properties from one view to another.
// 	 * @param view a view to copy layer properties to
// 	 * @param toView a view to copy later properties from
// 	 * @param (optional) custom properties to copy between both views
// 	 */
// 	export function copyLayerProperties(view: UIView, toView: UIView, customProperties?: { view?: Array<string> /* Array<keyof UIView> */; layer?: Array<string> /* Array<keyof CALayer> */ }): void;

// 	/**
// 	 * Animate views with a configurable spring effect
// 	 * @param options various animation settings for the spring
// 	 * - tension: number
// 	 * - friction: number
// 	 * - mass: number
// 	 * - delay: number
// 	 * - velocity: number
// 	 * - animateOptions: UIViewAnimationOptions
// 	 * - animations: () => void, Callback containing the property changes you want animated
// 	 * - completion: (finished: boolean) => void, Callback when animation is finished
// 	 */
// 	export function animateWithSpring(options?: { tension?: number; friction?: number; mass?: number; delay?: number; velocity?: number; animateOptions?: UIViewAnimationOptions; animations?: () => void; completion?: (finished?: boolean) => void });
// }

import * as AndroidUtils from './android';
export import android = AndroidUtils;

/**
 * @deprecated use Utils.android instead.
 */
export import ad = AndroidUtils;

import * as iOSUtils from './ios';
export import ios = iOSUtils;

/**
 * @deprecated use Utils.ios instead.
 */
export import iOSNativeHelper = iOSUtils;
