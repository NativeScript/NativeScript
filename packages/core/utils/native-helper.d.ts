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

/**
 * Checks whether the application is running on real device and not on emulator.
 */
export function isRealDevice(): boolean;

type NativeWindow = android.view.Window | UIWindow;
/**
 * Get the UIWindow or android.view.Window of the app
 */
export function getWindow<T extends NativeWindow>(): T;

/**
 * Utilities related to Android.
 */
export const android: {
	/**
	 * Utilities related to Android resources.
	 */
	resources: {
		/**
		 * Gets the drawable id from a given name.
		 * @param name - Name of the resource.
		 */
		getDrawableId: (name) => number;
		/**
		 * Gets the string id from a given name.
		 * @param name - Name of the resource.
		 */
		getStringId: (name) => number;
		/**
		 * Gets the id from a given name.
		 * @param name - Name of the resource.
		 */
		getId: (name: string) => number;
		/**
		 * Gets the id from a given name with optional type.
		 * This sets an explicit package name.
		 * https://developer.android.com/reference/android/content/res/Resources#getIdentifier(java.lang.String,%20java.lang.String,%20java.lang.String)
		 * @param name - Name of the resource.
		 * @param type - (Optional) type
		 */
		getResource: (name: string, type?: string) => number;
		/**
		 * Gets a color from the current theme.
		 * @param name - Name of the color resource.
		 * @param context - Context to resolve the color.
		 */
		getPaletteColor: (name: string, context: android.content.Context) => number;
	};
	/**
	 * Utilities related to Android collections.
	 */
	collections: {
		/**
		 * Converts string array into a String [hash set](http://developer.android.com/reference/java/util/HashSet.html).
		 * @param str - An array of strings to convert.
		 */
		stringArrayToStringSet(str: string[]): java.util.HashSet<string>;
		/**
		 * Converts string hash set into array of strings.
		 * @param stringSet - A string hash set to convert.
		 */
		stringSetToStringArray(stringSet: any): string[];
	};
	/**
	 * @deprecated Use `Utils.getWindow<android.view.Window>()` instead.
	 * @returns application window.
	 */
	getWindow: () => android.view.Window;
	/**
	 * Gets the native Android application instance.
	 */
	getApplication: () => android.app.Application;
	/**
	 * Get the current native Android activity.
	 */
	getCurrentActivity: () => androidx.appcompat.app.AppCompatActivity | android.app.Activity | null;
	/**
	 * Gets the Android application context.
	 */
	getApplicationContext: () => android.content.Context;
	/**
	 * Gets the native Android application resources.
	 */
	getResources: () => android.content.res.Resources;
	getPackageName: () => string;
	/**
	 * Gets the native Android input method manager.
	 */
	getInputMethodManager: () => android.view.inputmethod.InputMethodManager;
	/**
	 * Shows the soft input method, usually a soft keyboard.
	 */
	showSoftInput: (nativeView: android.view.View) => void;
	/**
	 * Hides the soft input method, usually a soft keyboard.
	 */
	dismissSoftInput: (nativeView?: android.view.View) => void;
	/**
	 * Sets the dark mode handler for the application.
	 * @param options Options to set dark mode handler.
	 */
	setDarkModeHandler(options?: { activity?: androidx.appcompat.app.AppCompatActivity; handler: (bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean }): void;
	/**
	 * Sets the navigation bar color for the application.
	 * @param options Options to set navigation bar color.
	 */
	setNavigationBarColor(options?: { activity?: androidx.appcompat.app.AppCompatActivity; lightColor?: Color; darkColor?: Color }): void;
	/**
	 * Sets the status bar color for the application.
	 * @param options Options to set status bar color.
	 */
	setStatusBarColor(options?: { activity?: androidx.appcompat.app.AppCompatActivity; lightColor?: Color; darkColor?: Color }): void;
	/**
	 * Enables edge-to-edge navigation for the provided activity.
	 * @param activity The activity to enable edge-to-edge navigation for.
	 * @param options Optional configuration for status and navigation bar colors.
	 */
	enableEdgeToEdge(
		activityOrWindow: androidx.activity.ComponentActivity,
		options?: {
			statusBarLightColor?: Color;
			statusBarDarkColor?: Color;
			navigationBarLightColor?: Color;
			navigationBarDarkColor?: Color;
			handleDarkMode?: (bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean;
		},
	): void;

	/**
	 * Enables edge-to-edge navigation for the provided Window.
	 * @param activity The activity to enable edge-to-edge navigation for.
	 * @param options Optional configuration for status and navigation bar colors.
	 */
	enableEdgeToEdge(
		activity: androidx.activity.ComponentActivity,
		window: android.view.Window,
		options?: {
			statusBarLightColor?: Color;
			statusBarDarkColor?: Color;
			navigationBarLightColor?: Color;
			navigationBarDarkColor?: Color;
			handleDarkMode?: (bar: 'status' | 'navigation', resources: android.content.res.Resources) => boolean;
		},
	): void;

	/**
	 * Gets whether edge-to-edge is ignored on older devices (API 34 an older).
	 */
	getIgnoreEdgeToEdgeOnOlderDevices(): boolean;

	/**
	 * Sets whether to ignore edge-to-edge on older devices (API 34 an older).
	 */
	setIgnoreEdgeToEdgeOnOlderDevices(value: boolean): void;
};

/**
 * @deprecated use Utils.android instead.
 */
export const ad = android;

/**
 * Utilities related to iOS.
 */
export const ios: {
	/**
	 * Utilities related to iOS collections.
	 */
	collections: {
		/**
		 * Converts JavaScript array to [NSArray](https://developer.apple.com/library/ios/documentation/Cocoa/Reference/Foundation/Classes/NSArray_Class/).
		 * @param str - JavaScript string array to convert.
		 */
		jsArrayToNSArray<T>(str: T[]): NSArray<T>;
		/**
		 * Converts NSArray to JavaScript array.
		 * @param a - NSArray to convert.
		 */
		nsArrayToJSArray<T>(a: NSArray<T>): Array<T>;
	};
	/**
	 * Create a UIDocumentInteractionControllerDelegate implementation for use with UIDocumentInteractionController
	 */
	createUIDocumentInteractionControllerDelegate: () => NSObject;
	/**
	 * @deprecated Use `Utils.getWindow<UIWindow>()` instead.
	 * @returns application window.
	 */
	getWindow: () => UIWindow;
	/**
	 * Gets the root folder for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 * iOS - this folder is read-only and contains the app and all its resources.
	 */
	getCurrentAppPath: () => string;
	/**
	 * Get the root UIViewController of the app
	 */
	getRootViewController: () => UIViewController;
	/**
	 * Gets the currently visible(topmost) UIViewController.
	 * @param rootViewController The root UIViewController instance to start searching from (normally window.rootViewController).
	 * Returns the visible UIViewController.
	 */
	getVisibleViewController: (rootViewController: UIViewController) => UIViewController;
	getMainScreen: () => UIScreen;
	/**
	 * Set the window background color of base view of the app.
	 * Often this is the view shown behind opening a modal, eg: a modal scales down revealing the window color.
	 * @param value color (hex, rgb, rgba, etc.)
	 */
	setWindowBackgroundColor: (value: string) => void;
	/**
	 * @deprecated use Application.orientation instead
	 *
	 * Gets an information about if current mode is Landscape.
	 */
	isLandscape: () => boolean;
	/**
	 * Take a snapshot of a View on screen.
	 * @param view view to snapshot
	 * @param scale screen scale
	 */
	snapshotView: (view: UIView, scale: number) => UIImage;
	/**
	 * Applies a rotation transform over X,Y and Z axis
	 * @param transform Applies a rotation transform over X,Y and Z axis
	 * @param x Rotation over X axis in degrees
	 * @param y Rotation over Y axis in degrees
	 * @param z Rotation over Z axis in degrees
	 */
	applyRotateTransform: (transform: CATransform3D, x: number, y: number, z: number) => CATransform3D;
	/**
	 * Debug utility to insert CGRect values into logging output.
	 * Note: when printing a CGRect directly it will print blank so this helps show the values.
	 * @param rect CGRect
	 */
	printCGRect: (rect: CGRect) => void;
	/**
	 * Copy layer properties from one view to another.
	 * @param view a view to copy layer properties to
	 * @param toView a view to copy later properties from
	 * @param (optional) custom properties to copy between both views
	 */
	copyLayerProperties: (view: UIView, toView: UIView, customProperties?: { view?: Array<keyof UIView>; layer?: Array<keyof CALayer> }) => void;
	/**
	 * Animate views with a configurable spring effect
	 * @param options various animation settings for the spring
	 * - tension: number
	 * - friction: number
	 * - mass: number
	 * - delay: number
	 * - velocity: number
	 * - animateOptions: UIViewAnimationOptions
	 * - animations: () => void, Callback containing the property changes you want animated
	 * - completion: (finished: boolean) => void, Callback when animation is finished
	 */
	animateWithSpring: (options?: { tension?: number; friction?: number; mass?: number; delay?: number; velocity?: number; animateOptions?: UIViewAnimationOptions; animations?: () => void; completion?: (finished?: boolean) => void }) => void;
	/**
	 * Joins an array of file paths.
	 * @param paths An array of paths.
	 * Returns the joined path.
	 */
	joinPaths: (...paths: string[]) => string;
	/**
	 * @deprecated use Utils.SDK_VERSION instead which is a float of the {major}.{minor} verison
	 */
	MajorVersion: number;
};

/**
 * @deprecated use Utils.ios instead.
 */
export const iOSNativeHelper = ios;
