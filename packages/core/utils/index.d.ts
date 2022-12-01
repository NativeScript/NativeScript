import { CoreTypes } from '../core-types';

export * from './mainthread-helper';
export * from './macrotask-scheduler';
export { Source } from './debug';

export * from './layout-helper';
export * from './native-helper';
export * from './common';

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
 * Module with android specific utilities.
 */
export namespace ad {
	/**
	 * Gets the native Android application instance.
	 */
	export function getApplication(): any; /* android.app.Application */

	/**
	 * Gets the Android application context.
	 */
	export function getApplicationContext(): any; /* android.content.Context */

	/**
	 * Gets the native Android input method manager.
	 */
	export function getInputMethodManager(): any; /* android.view.inputmethod.InputMethodManager */

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
	namespace collections {
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
	export namespace resources {
		/**
		 * Gets the drawable id from a given name.
		 * @param name - Name of the resource.
		 */
		export function getDrawableId(name);

		/**
		 * Gets the string id from a given name.
		 * @param name - Name of the resource.
		 */
		export function getStringId(name);

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
 * An utility function that invokes garbage collection on the JavaScript side.
 */
export function GC();

/**
 * An utility function that queues a garbage collection, multiple calls in quick succession are debounced by default and only one gc will be executed after 900ms.
 * @param delay Customize the delay
 * @param useThrottle Instead of default debounce strategy, use throttling
 */
export function queueGC(delay?: number, useThrottle?: boolean);

/**
 * A simple throttle utility
 * @param fn Function to throttle
 * @param delay Customize the delay (default is 300ms)
 */
export function throttle(fn: any, delay?: number);

/**
 * A simple debounce utility
 * @param fn Function to debounce
 * @param delay Customize the delay (default is 300ms)
 */
export function debounce(fn: any, delay?: number);

/**
 * Releases the reference to the wrapped native object
 * @param object The Java/Objective-C object to release.
 */
export function releaseNativeObject(object: any /*java.lang.Object | NSObject*/);

/**
 * Queues the passed function to be ran in a macroTask
 * @param task the function to execute as a macroTask
 */
export function queueMacrotask(task: () => void): void;

/**
 * Checks if the current thread is the main thread. Directly calls the passed function
 * if it is, or dispatches it to the main thread otherwise.
 * @param func The function to execute on the main thread.
 */
export function executeOnMainThread(func: Function);

/**
 * Runs the passed function on the UI Thread.
 * @param func The function to execute on the UI thread.
 */
export function executeOnUIThread(func: Function);

/**
 * Returns a function wrapper which executes the supplied function on the main thread.
 * The wrapper behaves like the original function and passes all of its arguments BUT
 * discards its return value.
 * @param func The function to execute on the main thread
 * @returns The wrapper function which schedules execution to the main thread
 */
export function mainThreadify(func: Function): (...args: any[]) => void;

/**
 * Returns true if the specified URI is a font icon URI like "fontIcon://&#xf1e0".
 * @param uri The URI.
 */
export function isFontIconURI(uri: string): boolean;

/**
 * Returns true if the specified path points to a resource or local file.
 * @param path The path.
 */
export function isFileOrResourcePath(path: string): boolean;

/**
 * Get file extension from file path
 * @param path file path
 * @returns file extension
 */
export function getFileExtension(path: string): string;

/**
 * Returns true if the specified URI is data URI (http://en.wikipedia.org/wiki/Data_URI_scheme).
 * @param uri The URI.
 */
export function isDataURI(uri: string): boolean;

/**
 * Opens url.
 * @param url The url.
 */
export function openUrl(url: string): boolean;

/**
 * Opens file.
 * @param filePath The file.
 * @param title Optional title for Android. Default is: 'Open File...'
 */
export function openFile(filePath: string, title?: string): boolean;

/**
 * Escapes special regex symbols (., *, ^, $ and so on) in string in order to create a valid regex from it.
 * @param source The original value.
 */
export function escapeRegexSymbols(source: string): string;

/**
 * Converts string value to number or boolean.
 * @param value The original value.
 */
export function convertString(value: any): any;

/**
 * Gets module name from path.
 * @param path The module path.
 */
export function getModuleName(path: string): string;

/**
 * Sorts an array by using merge sort algorithm (which ensures stable sort since the built-in Array.sort() does not promise a stable sort).
 * @param arr - array to be sorted
 * @param compareFunc - function that will be used to compare two elements of the array
 */
export function mergeSort(arr: Array<any>, compareFunc: (a: any, b: any) => number): Array<any>;

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

/**
 * Checks whether the application is running on real device and not on simulator/emulator.
 */
export function isRealDevice(): boolean;

/**
 * Hides the soft input method, usually a soft keyboard.
 */
export function dismissSoftInput(nativeView?: any): void;

/**
 * Dismiss any keyboard visible on the screen.
 */
export function dismissKeyboard(): void;

/**
 * Copy value to device clipboard.
 */
export function copyToClipboard(value: string): void;
