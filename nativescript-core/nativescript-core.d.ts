/**
 *  A layout that lets you specify exact locations (left/top coordinates) of its children.
 */
export declare class AbsoluteLayout extends LayoutBase {
	/**
	 * Gets the value of the Left property from a given View.
	 */
	static getLeft(view: View): Length;

	/**
	 * Sets the value of the Left property from a given View.
	 */
	static setLeft(view: View, value: Length): void;

	/**
	 * Gets the value of the Top property from a given View.
	 */
	static getTop(view: View): Length;

	/**
	 * Sets the value of the Top property from a given View.
	 */
	static setTop(view: View, value: Length): void;
}

/**
 * Provides an abstraction over the ActionBar (android) and NavigationBar (iOS).
 */
export declare class ActionBar extends View {
	/**
	 * Gets or sets the action bar title.
	 */
	title: string;

	/**
	 * Gets or sets the title view. When set - replaces the title with a custom view.
	 */
	titleView: View;

	/**
	 * Gets or sets the navigation button (a.k.a. the back button).
	 */
	navigationButton: NavigationButton;

	/**
	 * Removes the shadow/border at the bottom of the ActionBar and removes translucency on iOS.
	 * Default false.
	 */
	flat: boolean;

	/**
	 * Gets the collection of action items.
	 */
	actionItems: ActionItems;

	/**
	 * Gets the android specific options of the action bar.
	 */
	android: AndroidActionBarSettings;

	/**
	 * Gets the native iOS [UINavigationBar](https://developer.apple.com/documentation/uikit/uinavigationbar) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITabBarController */;

	/**
	 * Gets or set the UIImageRenderingMode of the action bar icons in iOS. Defaults to "alwaysOriginal"
	 * Valid values are:
	 *  - automatic
	 *  - alwaysOriginal
	 *  - alwaysTemplate
	 */
	iosIconRenderingMode: 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

	public effectiveContentInsetLeft: number;
	public effectiveContentInsetRight: number;

	/**
	 * Updates the action bar.
	 */
	update();

	//@private
	/**
	 * @private
	 */
	_isEmpty(): boolean;
	/**
	 * @private
	 */
	_getActualSize?: { width: number; height: number };
	//@endprivate
}

/**
 * Represents an action item in the action bar.
 */
export declare class ActionItem extends ViewBase {
	/**
	 * Gets or sets the text of the action item.
	 */
	text: string;

	/**
	 * Gets or sets the icon of the action item.
	 */
	icon: string;

	/**
	 * Gets or sets the custom action view of the action item.
	 */
	actionView: View;

	/**
	 * Gets or sets the visibility of the action item.
	 */
	visibility: string;

	/**
	 * Gets the action bar that contains the action item.
	 */
	actionBar: ActionBar;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void);

	/**
	 * Raised when a tap event occurs.
	 */
	on(event: 'tap', callback: (args: EventData) => void);

	//@private
	/**
	 * @private
	 */
	_raiseTap(): void;
	//@endprivate

	/**
	 * Gets the iOS specific options of the action item.
	 */
	ios: IOSActionItemSettings;

	/**
	 * Gets the Android specific options of the action item.
	 */
	android: AndroidActionItemSettings;
}

/**
 * Represents a collection of ActionItems.
 */
export declare class ActionItems {
	/**
	 * Adds an item to the collection.
	 * @param item - the item to be added
	 */
	addItem(item: ActionItem): void;

	/**
	 * Removes an item to the collection.
	 * @param item - The item to be removed.
	 */
	removeItem(item: ActionItem): void;

	/**
	 * Gets an array of the current action items in the collection.
	 */
	getItems(): Array<ActionItem>;

	/**
	 * Gets an item at a specified index.
	 * @param index - The index.
	 */
	getItemAt(index: number): ActionItem;
}

/**
 * Represents a UI widget which displays a progress indicator hinting the user for some background operation running.
 */
export declare class ActivityIndicator extends View {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/ProgressBar.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.ProgressBar */;

	/**
	 * Gets the native iOS [UIActivityIndicatorView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIActivityIndicatorView_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIActivityIndicatorView */;

	/**
	 * Gets or sets a value indicating whether the widget is currently displaying progress.
	 */
	busy: boolean;
}

/**
 * Module with android specific utilities.
 */
declare module ad {
	/**
	 * Gets the native Android application instance.
	 */
	function getApplication(): any; /* android.app.Application */

	/**
	 * Gets the Android application context.
	 */
	function getApplicationContext(): any; /* android.content.Context */

	/**
	 * Gets the native Android input method manager.
	 */
	function getInputMethodManager(): any; /* android.view.inputmethod.InputMethodManager */

	/**
	 * Hides the soft input method, usually a soft keyboard.
	 */
	function dismissSoftInput(nativeView?: any /* android.view.View */): void;

	/**
	 * Shows the soft input method, usually a soft keyboard.
	 */
	function showSoftInput(nativeView: any /* android.view.View */): void;

	/**
	 * Utility module dealing with some android collections.
	 */
	module collections {
		/**
		 * Converts string array into a String [hash set](http://developer.android.com/reference/java/util/HashSet.html).
		 * @param str - An array of strings to convert.
		 */
		function stringArrayToStringSet(str: string[]): any;

		/**
		 * Converts string hash set into array of strings.
		 * @param stringSet - A string hash set to convert.
		 */
		function stringSetToStringArray(stringSet: any): string[];
	}

	/**
	 * Utility module related to android resources.
	 */
	module resources {
		/**
		 * Gets the drawable id from a given name.
		 * @param name - Name of the resource.
		 */
		function getDrawableId(name);

		/**
		 * Gets the string id from a given name.
		 * @param name - Name of the resource.
		 */
		function getStringId(name);

		/**
		 * Gets the id from a given name.
		 * @param name - Name of the resource.
		 */
		function getId(name: string): number;

		/**
		 * [Obsolete - please use getPaletteColor] Gets a color from current theme.
		 * @param name - Name of the color
		 */
		function getPalleteColor();

		/**
		 * Gets a color from the current theme.
		 * @param name - Name of the color resource.
		 */
		function getPaletteColor(name: string, context: any /* android.content.Context */): number;
	}
}

/**
 * Defines an interface for adding arrays declared in xml.
 */
declare interface AddArrayFromBuilder {
	/**
	 * A function that is called when an array declaration is found in xml.
	 * @param name - Name of the array.
	 * @param value - The actual value of the array.
	 */
	_addArrayFromBuilder(name: string, value: Array<any>): void;
}

/**
 * Adds categories to existing categories the module will trace.
 * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
 */
declare function addCategories(categories: string);

/**
 * Defines an interface for adding a child element declared in xml.
 */
declare interface AddChildFromBuilder {
	/**
	 * Called for every child element declared in xml.
	 * This method will add a child element (value) to current element.
	 * @param name - Name of the element.
	 * @param value - Value of the element.
	 */
	_addChildFromBuilder(name: string, value: any): void;
}

/**
 * Adds new values to the application styles.
 * @param cssText - A valid styles which will be added to the current application styles.
 * @param attributeScoped - Whether the styles are attribute scoped. Adding attribute scoped styles will not perform a full application styling refresh.
 */
declare function addCss(cssText: string, attributeScoped?: boolean): void;

/**
 * Adds a TraceWriter instance to the trace module.
 * @param writer The TraceWriter instance to add.
 */
declare function addWriter(writer: TraceWriter);

declare type AlignContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';

declare type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

declare type AlignSelf = 'auto' | AlignItems;

/**
 * Represents Android specific options of the action bar.
 */
declare interface AndroidActionBarSettings {
	/**
	 * Gets or sets the action bar icon.
	 */
	icon: string;

	/**
	 * Gets or sets the visibility of the action bar icon.
	 * The icon is visible by default in pre-lollipop (API level < 20) versions of android and is hidden in lollipop (API level >= 20)
	 * The possible values are:
	 *  1. auto - the default behavior. This is the default value.
	 *  2. always - the icon is always shown.
	 *  3. never - the icon is always hidden.
	 */
	iconVisibility: string;
}

/**
 * Represents Android specific options of the action item.
 */
declare interface AndroidActionItemSettings {
	/**
	 * Gets or sets the position of the action item in the action bar.
	 *  1. actionBar - item is shown in the action bar.
	 *  2. actionBarIfRoom - item is shown in the action bar if there is room for it. Otherwise it is put in the popup menu.
	 *  3. popup - item is shown in the popup menu.
	 * Note: Property not applicable to NavigationButton
	 */
	position: 'actionBar' | 'actionBarIfRoom' | 'popup';

	/**
	 * Gets or sets the name of the system drawable resource to be displayed.
	 * Use this property instead of ActionItem.icon if you want to diplsay a built-in Android system icon.
	 * The value should be a string such as 'ic_menu_search' if you want to display the built-in Android Menu Search icon for example.
	 * For a full list of Android drawable names, please visit http://androiddrawables.com
	 */
	systemIcon: string;
}

/**
 * Data for the Android activity back pressed event.
 */
export declare interface AndroidActivityBackPressedEventData extends AndroidActivityEventData {
	/**
	 * In the event handler, set this value to true if you want to cancel the back navigation and do something else instead.
	 */
	cancel: boolean;
}

/**
 * Data for the Android activity events with bundle.
 */
export declare interface AndroidActivityBundleEventData extends AndroidActivityEventData {
	/**
	 * The bundle.
	 */
	bundle: any /* android.os.Bundle */;
}

/**
 * Data for the Android activity events.
 */
export declare interface AndroidActivityEventData {
	/**
	 * The activity.
	 */
	activity: any /* androidx.appcompat.app.AppCompatActivity */;

	/**
	 * The name of the event.
	 */
	eventName: string;

	/**
	 * The instance that has raised the event.
	 */
	object: any;
}

/**
 * Data for the Android activity newIntent event.
 */
export declare interface AndroidActivityNewIntentEventData extends AndroidActivityEventData {
	/**
	 * The intent.
	 */
	intent: any /* android.content.Intent */;
}

/**
 * Data for the Android activity onRequestPermissions callback
 */
export declare interface AndroidActivityRequestPermissionsEventData extends AndroidActivityEventData {
	/**
	 * The request code.
	 */
	requestCode: number;

	/**
	 * The Permissions.
	 */
	permissions: Array<string>;

	/**
	 * The Granted.
	 */
	grantResults: Array<number>;
}

/**
 * Data for the Android activity result event.
 */
export declare interface AndroidActivityResultEventData extends AndroidActivityEventData {
	/**
	 * The request code.
	 */
	requestCode: number;

	/**
	 * The result code.
	 */
	resultCode: number;

	/**
	 * The intent.
	 */
	intent: any /* android.content.Intent */;
}

/**
 * The abstraction of an Android-specific application object.
 */
export declare class AndroidApplication extends Observable {
	/**
	 * The [android Application](http://developer.android.com/reference/android/app/Application.html) object instance provided to the init of the module.
	 */
	nativeApp: any /* android.app.Application */;

	/**
	 * The application's [android Context](http://developer.android.com/reference/android/content/Context.html) object instance.
	 */
	context: any /* android.content.Context */;

	/**
	 * The currently active (loaded) [android Activity](http://developer.android.com/reference/android/app/Activity.html). This property is automatically updated upon Activity events.
	 */
	foregroundActivity: any /* androidx.appcompat.app.AppCompatActivity */;

	/**
	 * The main (start) Activity for the application.
	 */
	startActivity: any /* androidx.appcompat.app.AppCompatActivity */;

	/**
	 * Gets the orientation of the application.
	 * Available values: "portrait", "landscape", "unknown".
	 */
	orientation: 'portrait' | 'landscape' | 'unknown';

	/**
	 * Gets the system appearance.
	 * Available values: "dark", "light".
	 */
	systemAppearance: 'dark' | 'light';

	/**
	 * The name of the application package.
	 */
	packageName: string;

	/**
	 * True if the main application activity is not running (suspended), false otherwise.
	 */
	paused: boolean;

	/**
	 * Initialized the android-specific application object with the native android.app.Application instance.
	 * This is useful when creating custom application types.
	 * @param nativeApp - the android.app.Application instance that started the app.
	 */
	init: (nativeApp) => void;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: AndroidActivityEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application ActivityCreated.
	 */
	on(event: 'activityCreated', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application ActivityDestroyed.
	 */
	on(event: 'activityDestroyed', callback: (args: AndroidActivityEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application ActivityStarted.
	 */
	on(event: 'activityStarted', callback: (args: AndroidActivityEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application ActivityPaused.
	 */
	on(event: 'activityPaused', callback: (args: AndroidActivityEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application ActivityResumed.
	 */
	on(event: 'activityResumed', callback: (args: AndroidActivityEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application ActivityStopped.
	 */
	on(event: 'activityStopped', callback: (args: AndroidActivityEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application SaveActivityState.
	 */
	on(event: 'saveActivityState', callback: (args: AndroidActivityBundleEventData) => void, thisArg?: any);

	/**
	 * This event is raised on android application ActivityResult.
	 */
	on(event: 'activityResult', callback: (args: AndroidActivityResultEventData) => void, thisArg?: any);

	/**
	 * This event is raised on the back button is pressed in an android application.
	 */
	on(event: 'activityBackPressed', callback: (args: AndroidActivityBackPressedEventData) => void, thisArg?: any);

	/**
	 * This event is raised when the Android app was launched by an Intent with data.
	 */
	on(event: 'activityNewIntent', callback: (args: AndroidActivityNewIntentEventData) => void, thisArg?: any);

	/**
	 * This event is raised when the Android activity requests permissions.
	 */
	on(event: 'activityRequestPermissions', callback: (args: AndroidActivityRequestPermissionsEventData) => void, thisArg?: any);

	/**
	 * String value used when hooking to activityCreated event.
	 */
	public static activityCreatedEvent: string;

	/**
	 * String value used when hooking to activityDestroyed event.
	 */
	public static activityDestroyedEvent: string;

	/**
	 * String value used when hooking to activityStarted event.
	 */
	public static activityStartedEvent: string;

	/**
	 * String value used when hooking to activityPaused event.
	 */
	public static activityPausedEvent: string;

	/**
	 * String value used when hooking to activityResumed event.
	 */
	public static activityResumedEvent: string;

	/**
	 * String value used when hooking to activityStopped event.
	 */
	public static activityStoppedEvent: string;

	/**
	 * String value used when hooking to saveActivityState event.
	 */
	public static saveActivityStateEvent: string;

	/**
	 * String value used when hooking to activityResult event.
	 */
	public static activityResultEvent: string;

	/**
	 * String value used when hooking to activityBackPressed event.
	 */
	public static activityBackPressedEvent: string;

	/**
	 * String value used when hooking to activityNewIntent event.
	 */
	public static activityNewIntentEvent: string;

	/**
	 * String value used when hooking to requestPermissions event.
	 */
	public static activityRequestPermissionsEvent: string;

	/**
	 * Register a BroadcastReceiver to be run in the main activity thread. The receiver will be called with any broadcast Intent that matches filter, in the main application thread.
	 * For more information, please visit 'http://developer.android.com/reference/android/content/Context.html#registerReceiver%28android.content.BroadcastReceiver,%20android.content.IntentFilter%29'
	 * @param intentFilter A string containing the intent filter.
	 * @param onReceiveCallback A callback function that will be called each time the receiver receives a broadcast.
	 */
	registerBroadcastReceiver(intentFilter: string, onReceiveCallback: (context: any /* android.content.Context */, intent: any /* android.content.Intent */) => void): void;

	/**
	 * Unregister a previously registered BroadcastReceiver.
	 * For more information, please visit 'http://developer.android.com/reference/android/content/Context.html#unregisterReceiver(android.content.BroadcastReceiver)'
	 * @param intentFilter A string containing the intent filter with which the receiver was originally registered.
	 */
	unregisterBroadcastReceiver(intentFilter: string): void;
}

/**
 * Represents the Android-specific Frame object, aggregated within the common Frame one.
 * In Android there are two types of navigation - using new Activity instances or using Fragments within the main Activity.
 * To start a new Activity, a new Frame instance should be created and navigated to the desired Page.
 */
declare interface AndroidFrame extends Observable {
	/**
	 * Gets the native [android ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html) instance that represents the root layout part of the Frame.
	 */
	rootViewGroup: any /* android.view.ViewGroup */;

	/**
	 * Gets the native [android Activity](http://developer.android.com/reference/android/app/Activity.html) instance associated with this Frame. In case of nested Frame objects, this property points to the activity of the root Frame.
	 */
	activity: any /* androidx.appcompat.app.AppCompatActivity */;

	/**
	 * Gets the current (foreground) activity for the application. This property will recursively traverse all existing Frame objects and check for own Activity property.
	 */
	currentActivity: any /* androidx.appcompat.app.AppCompatActivity */;

	/**
	 * Gets the actionBar property of the currentActivity.
	 */
	actionBar: any /* android.app.ActionBar */;

	/**
	 * Determines whether the Activity associated with this Frame will display an action bar or not.
	 */
	showActionBar: boolean;

	/**
	 * Finds the native androidx.fragment.app.Fragment instance created for the specified Page.
	 * @param page The Page instance to search for.
	 */
	fragmentForPage(entry: BackstackEntry): any;
}

/**
 * Defines a animation set.
 */
export declare class Animation {
	constructor(animationDefinitions: Array<AnimationDefinition>, playSequentially?: boolean);
	public play: (resetOnFinish?: boolean) => AnimationPromise;
	public cancel: () => void;
	public isPlaying: boolean;
	public _resolveAnimationCurve(curve: any): any;
}

/**
 * Defines animation options for the View.animate method.
 */
export declare interface AnimationDefinition {
	/**
	 * The view whose property is to be animated.
	 */
	target?: View;

	/**
	 * Animates the opacity of the view. Value should be a number between 0.0 and 1.0
	 */
	opacity?: number;

	/**
	 * Animates the backgroundColor of the view.
	 */
	backgroundColor?: Color;

	/**
	 * Animates the translate affine transform of the view.
	 */
	translate?: Pair;

	/**
	 * Animates the scale affine transform of the view.
	 */
	scale?: Pair;

	/**
	 * Animates the height of a view.
	 */
	height?: PercentLength | string;

	/**
	 * Animates the width of a view.
	 */
	width?: PercentLength | string;

	/**
	 * Animates the rotate affine transform of the view. Value should be a number specifying the rotation amount in degrees.
	 */
	rotate?: number | Point3D;

	/**
	 * The length of the animation in milliseconds. The default duration is 300 milliseconds.
	 */
	duration?: number;

	/**
	 * The amount of time, in milliseconds, to delay starting the animation.
	 */
	delay?: number;

	/**
	 * Specifies how many times the animation should be played. Default is 1.
	 * iOS animations support fractional iterations, i.e. 1.5.
	 * To repeat an animation infinitely, use Number.POSITIVE_INFINITY
	 */
	iterations?: number;

	/**
	 * An optional animation curve. Possible values are contained in the [AnimationCurve enumeration](../modules/_ui_enums_.animationcurve.html).
	 * Alternatively, you can pass an instance of type UIViewAnimationCurve for iOS or android.animation.TimeInterpolator for Android.
	 */
	curve?: any;
}

/**
 * A Promise that can cancel the animation.
 */
declare type AnimationPromise = Promise<void> & Cancelable;

export declare const Application: {
	launchEvent: string;
	displayedEvent: string;
	uncaughtErrorEvent: string;
	discardedErrorEvent: string;
	suspendEvent: string;
	resumeEvent: string;
	exitEvent: string;
	lowMemoryEvent: string;
	orientationChangedEvent: string;
	getMainEntry: typeof getMainEntry;
	getRootView: typeof getRootView;
	setResources: typeof setResources;
	setCssFileName: typeof setCssFileName;
	getCssFileName: typeof getCssFileName;
	loadAppCss: typeof loadAppCss;
	addCss: typeof addCss;
	on: typeof on;
	off: typeof off;
	run: typeof run;
	orientation: typeof orientation;
	getNativeApplication: typeof getNativeApplication;
	hasLaunched: typeof hasLaunched;
	android: import('./application/application').AndroidApplication;
	ios: import('./application/application').iOSApplication;
};

/**
 * Event data containing information for the application events.
 */
export declare interface ApplicationEventData extends EventData {
	/**
	 * Gets the native iOS event arguments. Valid only when running on iOS.
	 */
	ios?: any;

	/**
	 * Gets the native Android event arguments. Valid only when running on Android.
	 */
	android?: any;

	/**
	 * The name of the event.
	 */
	eventName: string;

	/**
	 * The instance that has raised the event.
	 */
	object: any;
}

export declare const ApplicationSettings: {
	clear: typeof clear;
	flush: typeof flush;
	hasKey: typeof hasKey;
	remove: typeof remove;
	setString: typeof setString;
	getString: typeof getString;
	getAllKeys: typeof getAllKeys;
	getBoolean: typeof getBoolean;
	setBoolean: typeof setBoolean;
	getNumber: typeof getNumber;
	setNumber: typeof setNumber;
};

declare type ARGB = number;

declare type AutocapitalizationType = 'none' | 'words' | 'sentences' | 'allcharacters';

declare class Background {
	public static default: Background;
	public color: Color;
	public image: string | LinearGradient;
	public repeat: BackgroundRepeat;
	public position: string;
	public size: string;
	public borderTopColor: Color;
	public borderRightColor: Color;
	public borderBottomColor: Color;
	public borderLeftColor: Color;
	public borderTopWidth: number;
	public borderRightWidth: number;
	public borderBottomWidth: number;
	public borderLeftWidth: number;
	public borderTopLeftRadius: number;
	public borderTopRightRadius: number;
	public borderBottomRightRadius: number;
	public borderBottomLeftRadius: number;
	public clipPath: string;

	public withColor(value: Color): Background;
	public withImage(value: string | LinearGradient): Background;
	public withRepeat(value: BackgroundRepeat): Background;
	public withPosition(value: string): Background;
	public withSize(value: string): Background;
	public withBorderTopColor(value: Color): Background;
	public withBorderRightColor(value: Color): Background;
	public withBorderBottomColor(value: Color): Background;
	public withBorderLeftColor(value: Color): Background;
	public withBorderTopWidth(value: number): Background;
	public withBorderRightWidth(value: number): Background;
	public withBorderBottomWidth(value: number): Background;
	public withBorderLeftWidth(value: number): Background;
	public withBorderTopLeftRadius(value: number): Background;
	public withBorderTopRightRadius(value: number): Background;
	public withBorderBottomRightRadius(value: number): Background;
	public withBorderBottomLeftRadius(value: number): Background;
	public withClipPath(value: string): Background;

	public isEmpty(): boolean;

	public static equals(value1: Background, value2: Background): boolean;

	public hasBorderColor(): boolean;
	public hasBorderWidth(): boolean;
	public hasBorderRadius(): boolean;
	public hasUniformBorderColor(): boolean;
	public hasUniformBorderWidth(): boolean;
	public hasUniformBorderRadius(): boolean;
	public hasUniformBorder(): boolean;
	public getUniformBorderColor(): Color;
	public getUniformBorderWidth(): number;
	public getUniformBorderRadius(): number;
}

declare type BackgroundRepeat = 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';

/**
 * Represents an entry in the back stack of a Frame object.
 */
export declare interface BackstackEntry {
	entry: NavigationEntry;
	resolvedPage: Page;

	//@private
	/**
	 * @private
	 */
	navDepth: number;
	/**
	 * @private
	 */
	fragmentTag: string;
	/**
	 * @private
	 */
	fragment?: any;
	/**
	 * @private
	 */
	viewSavedState?: any;
	/**
	 * @private
	 */
	frameId?: number;
	/**
	 * @private
	 */
	recreated?: boolean;
	//@endprivate
}

/**
 * The options object used in the Bindable.bind method.
 */
declare interface BindingOptions {
	/**
	 * The property name of the source object (typically the ViewModel) to bind to.
	 */
	sourceProperty: string;
	/**
	 * The property name of the target object (that is the Bindable instance) to bind the source property to.
	 */
	targetProperty: string;
	/**
	 * True to establish a two-way binding, false otherwise. A two-way binding will synchronize both the source and the target property values regardless of which one initiated the change.
	 */
	twoWay?: boolean;
	/**
	 * An expression used for calculations (convertions) based on the value of the property.
	 */
	expression?: string;
}

/**
 * Represents a tab navigation widget with static tabs at the bottom.
 */
export declare class BottomNavigation extends TabNavigationBase {
	/**
	 * Gets or sets the items of the BottomNavigation.
	 */
	items: Array<TabContentItem>;

	/**
	 * Gets or sets the tab strip of the BottomNavigation.
	 */
	tabStrip: TabStrip;

	/**
	 * Gets or sets the selectedIndex of the BottomNavigation.
	 */
	selectedIndex: number;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/support/v4/view/ViewPager.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.view.View */; //android.support.v4.view.ViewPager;

	/**
	 * Gets the native iOS [UITabBarController](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarController_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITabBarController */;

	/**
	 * String value used when hooking to the selectedIndexChanged event.
	 */
	public static selectedIndexChangedEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when the selected index changes.
	 */
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any);
}

export declare class Builder {
	/**
	 * Creates view from navigation entry
	 * @param entry NavigationEntry
	 */
	static createViewFromEntry(entry: NavigationEntry): View;

	static parse(value: string | Template, exports?: any): View;

	/**
	 * Creates an array of KeyedTemplates from string
	 * @param value The xml of the template to be parsed
	 * @param exports Current context of the template
	 */
	static parseMultipleTemplates(value: string, exports?: any): Array<KeyedTemplate>;

	/**
	 * Loads component from module with context
	 * @param moduleName the module name
	 * @param exports the context of the component to be loaded
	 */
	static load(moduleName: string, exports?: any): View;

	/**
	 * Loads component from options
	 * @param options Load options
	 */
	static load(options: LoadOptions): View;
}

/**
 * Represents a standard Button widget.
 */
export declare class Button extends TextBase {
	/**
	 * String value used when hooking to tap event.
	 */
	public static tapEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/Button.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.Button */;

	/**
	 * Gets the native [UIButton](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIButton_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIButton */;

	/**
	 * Gets or sets whether the Button wraps text or not.
	 */
	textWrap: boolean;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a tap event occurs.
	 */
	on(event: 'tap', callback: (args: EventData) => void, thisArg?: any);
}

declare interface Cancelable {
	cancel(): void;
}

/**
 * An enum that defines all predefined categories.
 */
declare module categories {
	const VisualTreeEvents: string;
	const Layout: string;
	const Style: string;
	const ViewHierarchy: string;
	const NativeLifecycle: string;
	const Debug: string;
	const Navigation: string;
	const Test: string;
	const Binding: string;
	const Error: string;
	const Animation: string;
	const Transition: string;
	const Livesync: string;
	const ModuleNameResolver: string;

	const separator: string;
	const All: string;

	function concat(...categories: string[]): string;
}

/**
 * Event args for "changed" event.
 */
export declare interface ChangedData<T> extends EventData {
	/**
	 * Change type.
	 */
	action: string;

	/**
	 * Start index.
	 */
	index: number;

	/**
	 * Removed items.
	 */
	removed: Array<T>;

	/**
	 * Number of added items.
	 */
	addedCount: number;
}

/**
 * Change types.
 */
export declare class ChangeType {
	static Add: string;
	static Delete: string;
	static Update: string;
	static Splice: string;
}

/**
 * Removes all values.
 */
declare function clear(): void;

/**
 * Clears all the writers from the trace module.
 */
declare function clearWriters(); /** */

/**
 * Allows creating colors to be used when styling the UI.
 * @module "color"
 */ /**
 * Represents a color object. Stores all color components (alpha (opacity), red, green, blue) in a [0..255] range.
 */
export declare class Color {
	constructor(knownColor: string);
	constructor(hex: string);
	constructor(argb: number);
	constructor(alpha: number, red: number, green: number, blue: number);

	/**
	 * Gets the Alpha component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public a: number;

	/**
	 * Gets the Red component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public r: number;

	/**
	 * Gets the Green component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public g: number;

	/**
	 * Gets the Blue component (in the [0, 255] range) of this color. This is a read-only property.
	 */
	public b: number;

	/**
	 * Gets the Hexadecimal string representation of this color. This is a read-only property.
	 */
	public hex: string;

	/**
	 * Gets the Argb Number representation of this color where each 8 bits represent a single color component. This is a read-only property.
	 */
	public argb: number;

	/**
	 * Gets the known name of this instance. Defined only if it has been constructed from a known color name - e.g. "red". This is a read-only property.
	 */
	public name: string;

	/**
	 * Gets the android-specific integer value representation. Same as the Argb one. This is a read-only property.
	 */
	android: number;

	/**
	 * Gets the iOS-specific UIColor value representation. This is a read-only property.
	 */
	ios: any /* UIColor */;

	/**
	 * Specifies whether this Color is equal to the Color parameter.
	 * @param value The Color to test.
	 */
	public equals(value: Color): boolean;

	/**
	 * Compares two Color instances.
	 * @param value1 A Color to compare.
	 * @param value2 A Color to compare.
	 */
	public static equals(value1: Color, value2: Color): boolean;

	/**
	 * Validates if a value can be converted to color.
	 * @param value Input string.
	 */
	public static isValid(value: any): boolean;

	/**
	 * Creates color from iOS-specific UIColor value representation.
	 */
	public static fromIosColor(value: any /* UIColor */): Color;
}

declare interface ColorStop {
	color: Color;
	offset?: LengthPercentUnit;
}

declare interface ColorStop_2 {
	argb: ARGB;
	offset?: LengthPercentage;
}

export declare interface CommonLayoutParams {
	width: number;
	height: number;

	widthPercent: number;
	heightPercent: number;

	leftMargin: number;
	topMargin: number;
	rightMargin: number;
	bottomMargin: number;

	leftMarginPercent: number;
	topMarginPercent: number;
	rightMarginPercent: number;
	bottomMarginPercent: number;

	horizontalAlignment: HorizontalAlignment;
	verticalAlignment: VerticalAlignment;
}

/**
 * Defines the different connection types.
 */
declare enum connectionType {
	/**
	 * Denotes no connection.
	 */
	none = 0,

	/**
	 * Denotes a WiFi connection.
	 */
	wifi = 1,

	/**
	 * Denotes a mobile connection, i.e. cellular network or WAN.
	 */
	mobile = 2,

	/**
	 * Denotes an ethernet connection
	 */
	ethernet = 3,

	/**
	 * Denotes a bluetooth connection
	 */
	bluetooth = 4,

	/**
	 * Denotes a vpn connection
	 */
	vpn = 5,
}

export declare const Connectivity: {
	connectionType: typeof connectionType;
	getConnectionType: typeof getConnectionType;
	startMonitoring: typeof startMonitoring;
	stopMonitoring: typeof stopMonitoring;
};

/**
 * Base class for all UI components that are containers.
 */
declare class ContainerView extends View {
	/**
	 * Instruct container view to expand beyond the safe area. This property is iOS specific. Default value: true
	 */
	public iosOverflowSafeArea: boolean;
}

/**
 * Represents a View that has a single child - content.
 * The View itself does not have visual representation and serves as a placeholder for its content in the logical tree.
 */
export declare class ContentView extends View implements AddChildFromBuilder {
	/**
	 * Gets or sets the single child of the view.
	 */
	content: View;

	//@private
	/**
	 * Called when the content property has changed.
	 * @private
	 * @param oldView The previous content.
	 * @param newView The new content.
	 */
	_onContentChanged(oldView: View, newView: View);
	//@endprivate

	_addChildFromBuilder(name: string, value: any): void;

	layoutView: View;
}

/**
 * Event data containing information for creating a native view that will be added to the visual tree.
 */
export declare interface CreateViewEventData extends EventData {
	/**
	 * The native view that should be added to the visual tree.
	 */
	view: any;

	/**
	 * An optional context for creating the view.
	 */
	context?: any;
}

declare class CssAnimationProperty<T extends Style, U> {
	constructor(options: CssAnimationPropertyOptions<T, U>);

	public readonly getDefault: symbol;
	public readonly setNative: symbol;

	public readonly name: string;
	public readonly cssName: string;
	public readonly cssLocalName: string;

	readonly keyframe: string;

	public readonly defaultValue: U;

	public register(cls: { prototype: T }): void;
	public isSet(instance: T): boolean;

	/**
	 * @private
	 */
	public _initDefaultNativeValue(target: T): void;
	/**
	 * @private
	 */
	public _valueConverter?: (value: string) => any;
	/**
	 * @private
	 */
	public static _getByCssName(name: string): CssAnimationProperty<any, any>;
	/**
	 * @private
	 */
	public static _getPropertyNames(): string[];
}

declare interface CssAnimationPropertyOptions<T, U> {
	readonly name: string;
	readonly cssName?: string;
	readonly defaultValue?: U;
	readonly equalityComparer?: (x: U, y: U) => boolean;
	readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	readonly valueConverter?: (value: string) => U;
}

/**
 * Event data containing information about application css change.
 */
export declare interface CssChangedEventData extends EventData {
	cssFile?: string;
	cssText?: string;
}

declare interface CSSComputedStyleProperty {
	name: string;
	value: string;
}

declare class CssProperty<T extends Style, U> {
	constructor(options: CssPropertyOptions<T, U>);

	public readonly getDefault: symbol;
	public readonly setNative: symbol;
	public readonly name: string;
	public readonly cssName: string;
	public readonly cssLocalName: string;
	public readonly defaultValue: U;
	public register(cls: { prototype: T }): void;
	public isSet(instance: T): boolean;
}

declare interface CssPropertyOptions<T extends Style, U> extends PropertyOptions<T, U> {
	readonly cssName: string;
}

/**
 * Base class for all UI components that implement custom layouts.
 */
declare class CustomLayoutView extends ContainerView {
	//@private
	/**
	 * @private
	 */
	_updateNativeLayoutParams(child: View): void;
	/**
	 * @private
	 */
	_setChildMinWidthNative(child: View, value: Length): void;
	/**
	 * @private
	 */
	_setChildMinHeightNative(child: View, value: Length): void;
	//@endprivate
}

/**
 * Represents an date picker.
 */
export declare class DatePicker extends View {
	/**
	 * Gets the native [android.widget.DatePicker](http://developer.android.com/reference/android/widget/DatePicker.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.DatePicker */;

	/**
	 * Gets the native iOS [UIDatePicker](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIDatePicker */;

	/**
	 * Gets or sets the year.
	 */
	year: number;

	/**
	 * Gets or sets the month. The months start from 1.
	 */
	month: number;

	/**
	 * Gets or sets the day. The days start from 1.
	 */
	day: number;

	/**
	 * Gets or sets the entire date.
	 */
	date: Date;

	/**
	 * Gets or sets the max date.
	 */
	maxDate: Date;

	/**
	 * Gets or sets the min date.
	 */
	minDate: Date;
}

export declare class DefaultErrorHandler implements ErrorHandler {
	handlerError(error);
}

/**
 * Gets the current device information.
 */
export declare const Device: Device_2;

declare interface Device_2 {
	/**
	 * Gets the manufacturer of the device.
	 * For example: "Apple" or "HTC" or "Samsung".
	 */
	manufacturer: string;

	/**
	 * Gets the model of the device.
	 * For example: "Nexus 5" or "iPhone".
	 */
	model: string;

	/**
	 * Gets the OS of the device.
	 * For example: "Android" or "iOS".
	 */
	os: string;

	/**
	 * Gets the OS version.
	 * For example: 4.4.4(android), 8.1(ios)
	 */
	osVersion: string;

	/**
	 * Gets the SDK version.
	 * For example: 19(android), 8.1(ios).
	 */
	sdkVersion: string;

	/**
	 * Gets the type of the current device.
	 * Available values: "Phone", "Tablet".
	 */
	deviceType: 'Phone' | 'Tablet';

	/**
	 * Gets the uuid.
	 * On iOS this will return a new uuid if the application is re-installed on the device.
	 * If you need to receive the same uuid even after the application has been re-installed on the device,
	 * use this plugin: https://www.npmjs.com/package/nativescript-ios-uuid
	 */
	uuid: string;

	/**
	 * Gets the preferred language. For example "en" or "en-US".
	 */
	language: string;

	/**
	 * Gets the preferred region. For example "US".
	 */
	region: string;
}

/**
 * Denotes a length number that is in device independent pixel units.
 */
declare type dip = number;

/**
 * Disables profiling.
 */
declare function disable(): void;

/**
 * Disables the trace module.
 */
declare function disable_2(): void;

/**
 * Event data containing information about discarded application errors.
 */
export declare interface DiscardedErrorEventData extends ApplicationEventData {
	error: NativeScriptError;
}

/**
 * Dispatches the passed function for execution on the main thread
 * @param func The function to execute on the main thread.
 */
declare function dispatchToMainThread(func: Function);

declare type Dock = 'left' | 'top' | 'right' | 'bottom';

/**
 * A Layout that arranges its children at its outer edges, and allows its last child to take up the remaining space.
 */
export declare class DockLayout extends LayoutBase {
	/**
	 * Gets the value of the Dock property from a given View.
	 */
	static getDock(view: View): Dock;

	/**
	 * Sets the value of the Dock property from a given View.
	 */
	static setDock(view: View, value: Dock): void;

	/**
	 * Gets or sets a value that indicates whether the last child element within a DockLayout stretches to fill the remaining available space.
	 * The default value is true.
	 */
	stretchLastChild: boolean;
}

declare class DOMNode {
	nodeId: any;
	nodeType: any;
	nodeName: any;
	localName: any;
	nodeValue: string;
	attributes: string[];
	viewRef: WeakRef<ViewBase>;
	constructor(view: ViewBase);
	loadAttributes(): void;
	readonly children: DOMNode[];
	onChildAdded(childView: ViewBase): void;
	onChildRemoved(view: ViewBase): void;
	attributeModified(name: string, value: any): void;
	attributeRemoved(name: string): void;
	getComputedProperties(): CSSComputedStyleProperty[];
	dispose(): void;
	toJSON(): string;
}

/**
 * Provides data for downloaded event.
 */
export declare interface DownloadedData extends EventData {
	/**
	 * A string indentifier of the cached image.
	 */
	key: string;
	/**
	 * Gets the cached image.
	 */
	image: ImageSource;
}

/**
 * Provides data for download error.
 */
export declare interface DownloadError extends EventData {
	/**
	 * A string indentifier of the cached image.
	 */
	key: string;
	/**
	 * Gets the error.
	 */
	error: Error;
}

/**
 * Represents a single download request.
 */
export declare interface DownloadRequest {
	/**
	 * The url of the image.
	 */
	url: string;
	/**
	 * The key used to cache the image.
	 */
	key: string;
	/**
	 * An optional function to be called when the download is complete.
	 */
	completed?: (image: any, key: string) => void;
	/**
	 * An optional function to be called if the download errors.
	 */
	error?: (key: string) => void;
}

/**
 * Prints the timer for all methods instrumented with profile decorator.
 */
declare function dumpProfiles(): void;

/**
 * Represents the base class for all editable text views.
 */
export declare class EditableTextBase extends TextBase {
	public static blurEvent: string;
	public static focusEvent: string;
	public static textChangeEvent: string;

	/**
	 * Gets or sets the soft keyboard type.
	 */
	keyboardType: KeyboardType;

	/**
	 * Gets or sets the soft keyboard return key flavor.
	 */
	returnKeyType: ReturnKeyType;

	/**
	 * Gets or sets a value indicating when the text property will be updated.
	 */
	updateTextTrigger: UpdateTextTrigger;

	/**
	 * Gets or sets the autocapitalization type.
	 */
	autocapitalizationType: AutocapitalizationType;

	/**
	 * Gets or sets whether the instance is editable.
	 */
	editable: boolean;

	/**
	 * Enables or disables autocorrection.
	 */
	autocorrect: boolean;

	/**
	 * Gets or sets the placeholder text.
	 */
	hint: string;

	/**
	 * Limits input to a certain number of characters.
	 */
	maxLength: number;

	/**
	 * Hides the soft input method, ususally a soft keyboard.
	 */
	dismissSoftInput(): void;

	//@private
	/**
	 * @private
	 */
	public _setInputType(inputType: number): void;
	//@endprivate
}

/**
 * Enables profiling.
 *
 * Upon loading of the module it will cache the package.json of the app and check if there is a "profiling" key set,
 * its value can be one of the options available for InstrumentationMode, and if set,
 * enable() will be called in pre app start with the value in the package.json.
 *
 * An example for an `app/package.json` enabling the manual instrumentation profiling is:
 * ```
 * {
 *     "main": "main.js",
 *     "profiling": "timeline"
 * }
 * ```
 *
 * @param type Profiling mode to use.
 *  - "counters" - Accumulates method call counts and times until dumpProfiles is called and then prints aggregated statistic in the console. This is the default.
 *  - "timeline" - Outputs method names along start/end timestamps in the console on the go.
 *  - "lifecycle" - Outputs basic non-verbose times for startup, navigation, etc.
 */
declare function enable(type?: InstrumentationMode): void; /** */

/**
 * Allows you to trace and print specific information based on categories.
 * @module "trace"
 */ /**
 * Enables the trace module.
 */
declare function enable_2(): void;

/**
 * Defines the supported character encodings.
 */
export declare module encoding {
	/**
	 * Denotes ISO-8859-1 character encoding.
	 */
	const ISO_8859_1: any;

	/**
	 * Denotes US_ASCII character encoding.
	 */
	const US_ASCII: any;

	/**
	 * Denotes UTF_16 character encoding.
	 */
	const UTF_16: any;

	/**
	 * Denotes UTF_16BE character encoding.
	 */
	const UTF_16BE: any;

	/**
	 * Denotes UTF_16LE character encoding.
	 */
	const UTF_16LE: any;

	/**
	 * Denotes UTF_8 character encoding.
	 */
	const UTF_8: any;
}

/**
 * Passes an error to the registered ErrorHandler
 * @param error The error to be handled.
 */
declare function error(error: string | Error);

/**
 * An interface used to for handling trace error
 */
export declare interface ErrorHandler {
	handlerError(error: Error);
} /** */

/**
 * Contains the Observable class, which represents an observable object, or "data" in the model-view paradigm.
 * @module "data/observable"
 */ /**
 * Base event data.
 */
export declare interface EventData {
	/**
	 * The name of the event.
	 */
	eventName: string;
	/**
	 * The Observable instance that has raised the event.
	 */
	object: Observable;
}

/**
 * Checks if the current thread is the main thread. Directly calls the passed function
 * if it is, or dispatches it to the main thread otherwise.
 * @param func The function to execute on the main thread.
 */
declare function executeOnMainThread(func: Function);

/**
 * Represents a File entity on the file system.
 */
export declare class File extends FileSystemEntity {
	/**
	 * Checks whether a File with the specified path already exists.
	 * @param path The path to check for.
	 */
	static exists(path: string): boolean;

	/**
	 * Gets the extension of the file.
	 */
	extension: string;

	/**
	 * Gets the size in bytes of the file.
	 */
	size: number;

	/**
	 * Gets a value indicating whether the file is currently locked, meaning a background operation associated with this file is running.
	 */
	isLocked: boolean;

	/**
	 * Gets or creates a File entity at the specified path.
	 * @param path The path to get/create the file at.
	 */
	static fromPath(path: string): File;

	/**
	 * Reads the content of the file as a string using the specified encoding (defaults to UTF-8).
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	readText(encoding?: string): Promise<string>;

	/**
	 * Reads the content of the file as a string synchronously, using the specified encoding (defaults to UTF-8).
	 * @param onError An optional function to be called if some IO-error occurs.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	readTextSync(onError?: (error: any) => any, encoding?: string): string;

	/**
	 * Reads the binary content of the file asynchronously.
	 */
	read(): Promise<any>;

	/**
	 * Reads the binary content of the file synchronously.
	 * @param onError An optional function to be called if some IO-error occurs.
	 */
	readSync(onError?: (error: any) => any): any;

	/**
	 * Writes the provided string to the file, using the specified encoding (defaults to UTF-8).
	 * @param content The content to be saved to the file.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	writeText(content: string, encoding?: string): Promise<any>;

	/**
	 * Writes the provided string to the file synchronously, using the specified encoding (defaults to UTF-8).
	 * @param content The content to be saved to the file.
	 * @param onError An optional function to be called if some IO-error occurs.
	 * @param encoding An optional value specifying the preferred encoding (defaults to UTF-8).
	 */
	writeTextSync(content: string, onError?: (error: any) => any, encoding?: string): void;

	/**
	 * Writes the provided binary content to the file.
	 * @param content The binary content to be saved to the file.
	 */
	write(content: any): Promise<void>;

	/**
	 * Writes the provided binary content to the file synchronously.
	 * @param content The binary content to be saved to the file.
	 * @param onError An optional function to be called if some IO-error occurs.
	 */
	writeSync(content: any, onError?: (error: any) => any): void;
} /** */

/**
 * Provides high-level abstractions for file system entities such as files, folders, known folders, paths, separators, etc.
 * @module "file-system"
 */ /**
 * Represents a single entity on the file system.
 */
export declare class FileSystemEntity {
	/**
	 * Gets the Date object specifying the last time this entity was modified.
	 */
	lastModified: Date;

	/**
	 * Gets the name of the entity.
	 */
	name: string;

	/**
	 * Gets the fully-qualified path (including the extension for a File) of the entity.
	 */
	path: string;

	/**
	 * Gets the Folder object representing the parent of this entity.
	 * Will be null for a root folder like Documents or Temporary.
	 * This property is readonly.
	 */
	parent: Folder;

	/**
	 * Removes (deletes) the current Entity from the file system.
	 */
	remove(): Promise<any>;

	/**
	 * Removes (deletes) the current Entity from the file system synchronously.
	 */
	removeSync(onError?: (error: any) => any): void;

	/**
	 * Renames the current entity using the specified name.
	 * @param newName The new name to be applied to the entity.
	 */
	rename(newName: string): Promise<any>;

	/**
	 * Renames the current entity synchronously, using the specified name.
	 * @param newName The new name to be applied to the entity.
	 */
	renameSync(newName: string, onError?: (error: any) => any): void;
}

export declare class FlexboxLayout extends LayoutBase {
	public flexDirection: FlexDirection;
	public flexWrap: FlexWrap;
	public justifyContent: JustifyContent;
	public alignItems: AlignItems;
	public alignContent: AlignContent;

	public static setOrder(view: View, order: number);
	public static getOrder(view: View): number;

	public static setFlexGrow(view: View, grow: number);
	public static getFlexGrow(view: View);

	public static setFlexShrink(view: View, shrink: number);
	public static getFlexShrink(view: View): number;

	public static setAlignSelf(view: View, align: AlignSelf);
	public static getAlignSelf(view: View): AlignSelf;

	public static setFlexWrapBefore(view: View, wrap: boolean);
	public static getFlexWrapBefore(view: View): boolean;
}

declare type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

/**
 * A flex-grow number. Negative values are invalid.
 */
declare type FlexGrow = number;

/**
 * A flex-shrink number. Negative values are invalid.
 */
declare type FlexShrink = number;

declare type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * A flex-wrap-before value. True, false or their string presentations "true" or "false".
 */
declare type FlexWrapBefore = boolean;

/**
 * Flush all changes to disk synchronously.
 * @return boolean flag indicating if changes were saved successfully to disk.
 */
declare function flush(): boolean;

/**
 * Represents a Folder (directory) entity on the file system.
 */
export declare class Folder extends FileSystemEntity {
	/**
	 * Determines whether this instance is a KnownFolder (accessed through the KnownFolders object).
	 */
	isKnown: boolean;

	/**
	 * Gets or creates a Folder entity at the specified path.
	 * @param path The path to get/create the folder at.
	 */
	static fromPath(path: string): Folder;

	/**
	 * Checks whether a Folder with the specified path already exists.
	 * @param path The path to check for.
	 */
	static exists(path: string): boolean;

	/**
	 * Checks whether this Folder contains an Entity with the specified name.
	 * The path of the folder is added to the name to resolve the complete path to check for.
	 * @param name The name of the entity to check for.
	 */
	contains(name: string): boolean;

	/**
	 * Deletes all the files and folders (recursively), contained within this Folder.
	 */
	clear(): Promise<any>;

	/**
	 * Deletes all the files and folders (recursively), contained within this Folder synchronously.
	 * @param onError An optional function to be called if some error occurs.
	 */
	clearSync(onError?: (error: any) => void): void;

	/**
	 * Gets or creates a File entity with the specified name within this Folder.
	 * @param name The name of the file to get/create.
	 */
	getFile(name: string): File;

	/**
	 * Gets or creates a Folder entity with the specified name within this Folder.
	 * @param name The name of the folder to get/create.
	 */
	getFolder(name: string): Folder;

	/**
	 * Gets all the top-level entities residing within this folder.
	 */
	getEntities(): Promise<Array<FileSystemEntity>>;

	/**
	 * Gets all the top-level entities residing within this folder synchronously.
	 * @param onError An optional function to be called if some error occurs.
	 */
	getEntitiesSync(onError?: (error: any) => any): Array<FileSystemEntity>;

	/**
	 * Enumerates all the top-level FileSystem entities residing within this folder.
	 * @param onEntity A callback that receives the current entity. If the callback returns false this will mean for the iteration to stop.
	 */
	eachEntity(onEntity: (entity: FileSystemEntity) => boolean);
} /** */

/**
 * @module "ui/styling/font"
 */ declare class Font {
	public static default: Font;

	public fontFamily: string;
	public fontStyle: FontStyle;
	public fontWeight: FontWeight;
	public fontSize: number;

	public isBold: boolean;
	public isItalic: boolean;

	constructor(family: string, size: number, style: FontStyle, weight: FontWeight);

	public getAndroidTypeface(): any /* android.graphics.Typeface */;
	public getUIFont(defaultFont: any /* UIFont */): any /* UIFont */;

	public withFontFamily(family: string): Font;
	public withFontStyle(style: string): Font;
	public withFontWeight(weight: string): Font;
	public withFontSize(size: number): Font;

	public static equals(value1: Font, value2: Font): boolean;
}

declare type FontStyle = 'normal' | 'italic';

declare namespace FontStyle {
	const NORMAL: 'normal';
	const ITALIC: 'italic';
	function isValid(value: any): boolean;
	function parse(value: string): FontStyle;
}

declare type FontWeight = '100' | '200' | '300' | 'normal' | '400' | '500' | '600' | 'bold' | '700' | '800' | '900';

declare namespace FontWeight {
	const THIN: '100';
	const EXTRA_LIGHT: '200';
	const LIGHT: '300';
	const NORMAL: 'normal';
	const MEDIUM: '500';
	const SEMI_BOLD: '600';
	const BOLD: 'bold';
	const EXTRA_BOLD: '800';
	const BLACK: '900';
	function isValid(value: any): boolean;
	function parse(value: string): FontWeight;
}

/**
 * A class used to create a formatted (rich text) string.
 */
export declare class FormattedString extends ViewBase {
	/**
	 * An observable collection of Span objects used to define common text properties.
	 */
	public spans: ObservableArray<Span>;

	/**
	 * A human readable representation of the formatted string.
	 */
	public toString(): string;

	/**
	 * Gets or sets the font family which will be used for all spans that doesn't have a specific value.
	 */
	public fontFamily: string;

	/**
	 * Gets or sets the font size which will be used for all spans that doesn't have a specific value.
	 */
	public fontSize: number;

	/**
	 * Gets or sets the font style which will be used for all spans that doesn't have a specific value.
	 */
	public fontStyle: FontStyle;

	/**
	 * Gets or sets the font weight which will be used for all spans that doesn't have a specific value.
	 */
	public fontWeight: FontWeight;

	/**
	 * Gets or sets text decorations which will be used for all spans that doesn't have a specific value.
	 */
	public textDecoration: TextDecoration;

	/**
	 * Gets or sets the font foreground color which will be used for all spans that doesn't have a specific value.
	 */
	public color: Color;

	/**
	 * Gets or sets the font background color which will be used for all spans that doesn't have a specific value.
	 */
	public backgroundColor: Color;
}

/**
 * Represents the logical View unit that is responsible for navigation within an application.
 * Nested frames are supported, enabling hierarchical navigation scenarios.
 */
export declare class Frame extends View {
	/**
	 * Gets a frame by id.
	 */
	static getFrameById(id: string): Frame;

	/**
	 * Gets the topmost frame in the frames stack. An application will typically has one frame instance. Multiple frames handle nested (hierarchical) navigation scenarios.
	 */
	static topmost(): Frame;

	/**
	 * Navigates back using the navigation hierarchy (if any). Updates the Frame stack as needed.
	 * This method will start from the topmost Frame and will recursively search for an instance that has the canGoBack operation available.
	 */
	static goBack();

	/**
	 * @private
	 */
	static reloadPage(context?: ModuleContext): void;

	/**
	 * @private
	 */
	static _stack(): Array<Frame>;

	/**
	 * Navigates to the previous entry (if any) in the back stack.
	 * @param to The backstack entry to navigate back to.
	 */
	goBack(to?: BackstackEntry);

	/**
	 * Checks whether the goBack operation is available.
	 */
	canGoBack(): boolean;

	/**
	 * Navigates to a Page instance as described by the module name.
	 * This method will require the module and will check for a Page property in the exports of the module.
	 * @param pageModuleName The name of the module to require starting from the application root.
	 * For example if you want to navigate to page called "myPage.js" in a folder called "subFolder" and your root folder is "app" you can call navigate method like this:
	 * const frames = require("&#64;nativescript/core/ui/frame");
	 * frames.topmost().navigate("app/subFolder/myPage");
	 */
	navigate(pageModuleName: string);

	/**
	 * Creates a new Page instance using the provided callback and navigates to that Page.
	 * @param create The function to be used to create the new Page instance.
	 */
	navigate(create: () => Page);

	/**
	 * Navigates to a Page resolved by the provided NavigationEntry object.
	 * Since there are a couple of  ways to specify a Page instance through an entry, there is a resolution priority:
	 *     1. entry.moduleName
	 *     2. entry.create()
	 * @param entry The NavigationEntry instance.
	 */
	navigate(entry: NavigationEntry);

	/**
	 * Used to control the visibility the Navigation Bar in iOS and the Action Bar in Android.
	 */
	public actionBarVisibility: 'auto' | 'never' | 'always';

	/**
	 * Gets the back stack of this instance.
	 */
	backStack: Array<BackstackEntry>;

	/**
	 * Gets the Page instance the Frame is currently navigated to.
	 */
	currentPage: Page;

	/**
	 * Gets the NavigationEntry instance the Frame is currently navigated to.
	 */
	currentEntry: NavigationEntry;

	/**
	 * Gets or sets if navigation transitions should be animated.
	 */
	animated: boolean;

	/**
	 * Gets or sets the default navigation transition for this frame.
	 */
	transition: NavigationTransition;

	/**
	 * Gets or sets if navigation transitions should be animated globally.
	 */
	static defaultAnimatedNavigation: boolean;

	/**
	 * Gets or sets the default NavigationTransition for all frames across the app.
	 */
	static defaultTransition: NavigationTransition;

	/**
	 * Gets the AndroidFrame object that represents the Android-specific APIs for this Frame. Valid when running on Android OS.
	 */
	android: AndroidFrame;

	/**
	 * Gets the iOSFrame object that represents the iOS-specific APIs for this Frame. Valid when running on iOS.
	 */
	ios: iOSFrame;

	//@private
	/**
	 * @private
	 * @param entry to check
	 */
	isCurrent(entry: BackstackEntry): boolean;

	/**
	 * @private
	 * @param entry to set as current
	 * @param navigationType
	 */
	setCurrent(entry: BackstackEntry, navigationType: NavigationType): void;
	/**
	 * @private
	 */
	navigationQueueIsEmpty(): boolean;
	/**
	 * @private
	 */
	navigationBarHeight: number;
	/**
	 * @private
	 */
	_animationInProgress: boolean;
	/**
	 * @private
	 */
	_currentEntry: BackstackEntry;
	/**
	 * @private
	 */
	_executingContext: NavigationContext;
	/**
	 * @private
	 */
	_processNavigationQueue(page: Page);
	/**
	 * @private
	 */
	_getIsAnimatedNavigation(entry: NavigationEntry): boolean;
	/**
	 * @private
	 */
	_getNavigationTransition(entry: NavigationEntry): NavigationTransition;
	/**
	 * @private
	 */
	_updateActionBar(page?: Page, disableNavBarAnimation?: boolean);
	/**
	 * @private
	 * @param navigationContext
	 */
	public performNavigation(navigationContext: NavigationContext): void;
	/**
	 * @private
	 */
	_getNavBarVisible(page: Page): boolean;
	/**
	 * @private
	 */
	_findEntryForTag(fragmentTag: string): BackstackEntry;
	/**
	 * @private
	 */
	_updateBackstack(entry: BackstackEntry, navigationType: NavigationType): void;
	/**
	 * @private
	 */
	_pushInFrameStack();
	/**
	 * @private
	 */
	_pushInFrameStackRecursive();
	/**
	 * @private
	 */
	_removeFromFrameStack();
	//@endprivate

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (args: EventData) => void, thisArg?: any);
}

/**
 * An utility function that invokes garbage collection on the JavaScript side.
 */
declare function GC();

/**
 * Provides gesture event data.
 */
export declare interface GestureEventData extends EventData {
	/**
	 * Gets the type of the gesture.
	 */
	type: GestureTypes;
	/**
	 * Gets the view which originates the gesture.
	 */
	view: View;
	/**
	 * Gets the underlying native iOS specific [UIGestureRecognizer](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIGestureRecognizer_Class/).
	 */
	ios: any /* UIGestureRecognizer */;
	/**
	 * Gets the underlying native android specific [gesture detector](http://developer.android.com/reference/android/view/GestureDetector.html).
	 */
	android: any;
}

/**
 * Provides gesture event data.
 */
export declare interface GestureEventDataWithState extends GestureEventData {
	state: number;
}

/**
 * Provides options for the GesturesObserver.
 */
export declare class GesturesObserver {
	/**
	 * Creates an instance of GesturesObserver class.
	 * @param target - The view for which the observer is created.
	 * @param callback - A function that will be executed when a gesture is received.
	 * @param context - default this argument for the callbacks.
	 */
	constructor(target: View, callback: (args: GestureEventData) => void, context: any);

	/**
	 * Registers a gesture observer to a view and gesture.
	 * @param type - Type of the gesture.
	 */
	observe(type: GestureTypes);

	/**
	 * Disconnects the gesture observer.
	 */
	disconnect();

	/**
	 * Gesture type attached to the observer.
	 */
	type: GestureTypes;

	/**
	 * A function that will be executed when a gesture is received.
	 */
	callback: (args: GestureEventData) => void;

	/**
	 * A context which will be used as `this` in callback execution.
	 */
	context: any;

	/**
	 * An internal Android specific method used to pass the motion event to the correct gesture observer.
	 */
	androidOnTouchEvent: (motionEvent: any /* android.view.MotionEvent */) => void;
}

/**
 * Defines an enum with supported gesture states.
 */
export declare enum GestureStateTypes {
	/**
	 * Gesture canceled.
	 */
	cancelled,
	/**
	 * Gesture began.
	 */
	began,
	/**
	 * Gesture changed.
	 */
	changed,
	/**
	 * Gesture ended.
	 */
	ended,
}

/**
 * Defines an enum with supported gesture types.
 */
export declare enum GestureTypes {
	/**
	 * Denotes tap (click) gesture.
	 */
	tap,
	/**
	 * Denotes double tap gesture.
	 */
	doubleTap,
	/**
	 * Denotes pinch gesture.
	 */
	pinch,
	/**
	 * Denotes pan gesture.
	 */
	pan,
	/**
	 * Denotes swipe gesture.
	 */
	swipe,
	/**
	 * Denotes rotation gesture.
	 */
	rotation,
	/**
	 * Denotes long press gesture.
	 */
	longPress,
	/**
	 * Denotes touch action.
	 */
	touch,
}

/**
 * Get all stored keys
 * @return Array containing all stored keys
 */
declare function getAllKeys(): Array<string>;

/**
 * Gets a value (if existing) for a key as a Boolean Object. A default value can be provided in case there is no existing value.
 * @param key The key to check for.
 * @param defaultValue An optional value to be returned in case there is no existing value.
 */
declare function getBoolean(key: string, defaultValue?: boolean): boolean; /** */

/**
 * Contains connectivity utility methods.
 * @module "connectivity"
 */ /**
 * Gets the type of connection.
 * Returns a value from the connectivity.connectionType enumeration.
 * To use this method on Android you need to have the android.permission.ACCESS_NETWORK_STATE permission added to the AndroidManifest.xml file.
 */
declare function getConnectionType(): number;

/**
 * Gets css file name for the application.
 */
declare function getCssFileName(): string;

/**
 * Downloads the content from the specified URL and attempts to save it as file.
 * @param url The URL to request from.
 * @param destinationFilePath Optional. The downloaded file path.
 */
declare function getFile(url: string, destinationFilePath?: string): Promise<File>;

/**
 * Downloads the content from the specified URL and attempts to save it as file.
 * @param options An object that specifies various request options.
 * @param destinationFilePath Optional. The downloaded file path.
 */
declare function getFile(options: HttpRequestOptions, destinationFilePath?: string): Promise<File>;

/**
 * Downloads the content from the specified URL and attempts to decode it as an image.
 * @param url The URL to request from.
 */
declare function getImage(url: string): Promise<ImageSource>;

/**
 * Downloads the content from the specified URL and attempts to decode it as an image.
 * @param options An object that specifies various request options.
 */
declare function getImage(options: HttpRequestOptions): Promise<ImageSource>;

/**
 * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
 * @param url The URL to request from.
 */
declare function getJSON<T>(url: string): Promise<T>;

/**
 * Downloads the content from the specified URL as a string and returns its JSON.parse representation.
 * @param options An object that specifies various request options.
 */
declare function getJSON<T>(options: HttpRequestOptions): Promise<T>;

/**
 * Get main entry specified when calling start function.
 */
declare function getMainEntry(): NavigationEntry;

/**
 * Gets module name from path.
 * @param path The module path.
 */
declare function getModuleName(path: string): string;

declare function getNativeApplication(): any;

/**
 * Gets a value (if existing) for a key as a Number Object. A default value can be provided in case there is no existing value.
 * @param key The key to check for.
 * @param defaultValue An optional value to be returned in case there is no existing value.
 */
declare function getNumber(key: string, defaultValue?: number): number;

/**
 * Get current application root view.
 */
declare function getRootView(): View;

/**
 * Gets a value (if existing) for a key as a String Object. A default value can be provided in case there is no existing value.
 * @param key The key to check for.
 * @param defaultValue An optional value to be returned in case there is no existing value.
 */
declare function getString(key: string, defaultValue?: string): string;

/**
 * Downloads the content from the specified URL as a string.
 * @param url The URL to request from.
 */
declare function getString_2(url: string): Promise<string>;

/**
 * Downloads the content from the specified URL as a string.
 * @param options An object that specifies various request options.
 */
declare function getString_2(options: HttpRequestOptions): Promise<string>;

/**
 * Defines a rectangular layout area that consists of columns and rows.
 */
export declare class GridLayout extends LayoutBase {
	/**
	 * Gets the value of the Column attached property from a given View.
	 */
	static getColumn(view: View): number;

	/**
	 * Sets the value of the Column attached property to a given View.
	 */
	static setColumn(view: View, value: number): void;

	/**
	 * Gets the value of the ColumnSpan attached property from a given View.
	 */
	static getColumnSpan(view: View): number;

	/**
	 * Sets the value of the ColumnSpan attached property to a given View.
	 */
	static setColumnSpan(view: View, value: number): void;

	/**
	 * Gets the value of the Row attached property from a given View.
	 */
	static getRow(view: View): number;

	/**
	 * Sets the value of the Row attached property to a given View.
	 */
	static setRow(view: View, value: number): void;

	/**
	 * Gets the value of the RowSpan attached property from a given View.
	 */
	static getRowSpan(view: View): number;

	/**
	 * Sets the value of the RowSpan attached property to a given View.
	 */
	static setRowSpan(view: View, value: number): void;

	/**
	 * Adds a column specification to a GridLayout.
	 */
	public addColumn(itemSpec: ItemSpec): void;

	/**
	 * Adds a row specification to a GridLayout.
	 */
	public addRow(itemSpec: ItemSpec): void;

	/**
	 * Adds a child at specific cell in GridLayout. Optional rowSpan and columnSpan attributes
	 */
	public addChildAtCell(view: View, row: number, column: number, rowSpan?: number, columnSpan?: number): void;

	/**
	 * Removes a column specification from a GridLayout.
	 */
	public removeColumn(itemSpec: ItemSpec): void;

	/**
	 * Removes all column specifications from a GridLayout.
	 */
	public removeColumns(): void;

	/**
	 * Removes a row specification from a GridLayout.
	 */
	public removeRow(itemSpec: ItemSpec): void;

	/**
	 * Removes all row specifications from a GridLayout.
	 */
	public removeRows(): void;

	/**
	 * Gets array of column specifications defined on this instance of GridLayout.
	 */
	public getColumns(): Array<ItemSpec>;

	/**
	 * Gets array of row specifications defined on this instance of GridLayout.
	 */
	public getRows(): Array<ItemSpec>;

	//@private
	/**
	 * @private
	 */
	public _onRowAdded(itemSpec: ItemSpec): void;
	/**
	 * @private
	 */
	public _onColumnAdded(itemSpec: ItemSpec): void;
	/**
	 * @private
	 */
	public _onRowRemoved(itemSpec: ItemSpec, index: number): void;
	/**
	 * @private
	 */
	public _onColumnRemoved(itemSpec: ItemSpec, index: number): void;
	//@endprivate
}

export declare type GridUnitType = 'pixel' | 'star' | 'auto';

export declare namespace GridUnitType {
	const PIXEL: 'pixel';
	const STAR: 'star';
	const AUTO: 'auto';
	export function isValid(value: any): boolean;
	export function parse(value: string): GridUnitType;
} /** */

/**
 * Allows you to save and restore any kind of information related to your application.
 * @module "application-settings"
 */ /**
 * Checks whether such a key exists.
 * @param key The key to check for.
 */
declare function hasKey(key: string): boolean;

/**
 * Indicates if the application is allready launched. See also the `application.on("launch", handler)` event.
 */
declare function hasLaunched(): boolean;

export declare type Headers = { [key: string]: string | string[] };

declare type HorizontalAlignment = 'left' | 'center' | 'right' | 'stretch';

/**
 * Represents a view with html content. Use this component instead WebView when you want to show just static HTML content.
 * [iOS support](https://developer.apple.com/documentation/foundation/nsattributedstring/1524613-initwithdata)
 * [android support](http://developer.android.com/reference/android/text/Html.html)
 */
export declare class HtmlView extends View {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/TextView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.TextView */;

	/**
	 * Gets the native [UITextView](https://developer.apple.com/documentation/uikit/uitextview) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITextView */;

	/**
	 * Gets or sets html string for the HtmlView.
	 */
	html: string;
}

export declare const Http: {
	getFile: typeof getFile;
	getImage: typeof getImage;
	getJSON: typeof getJSON;
	getString: typeof getString_2;
	request: typeof request;
};

/**
 * Encapsulates the content of an HttpResponse.
 */
export declare interface HttpContent {
	/**
	 * Gets the response body as raw data.
	 */
	raw: any;

	/**
	 * Gets the response body as ArrayBuffer
	 */
	toArrayBuffer: () => ArrayBuffer;

	/**
	 * Gets the response body as string.
	 */
	toString: (encoding?: HttpResponseEncoding) => string;

	/**
	 * Gets the response body as JSON object.
	 */
	toJSON: (encoding?: HttpResponseEncoding) => any;

	/**
	 * Gets the response body as ImageSource.
	 */
	toImage: () => Promise<ImageSource>;

	/**
	 * Gets the response body as file.
	 */
	toFile: (destinationFilePath?: string) => File;
}

/**
 * Provides options for the http requests.
 */
export declare interface HttpRequestOptions {
	/**
	 * Gets or sets the request url.
	 */
	url: string;

	/**
	 * Gets or sets the request method.
	 */
	method: string;

	/**
	 * Gets or sets the request headers in JSON format.
	 */
	headers?: any;

	/**
	 * Gets or sets the request body.
	 */
	content?: string | FormData | ArrayBuffer;

	/**
	 * Gets or sets the request timeout in milliseconds.
	 */
	timeout?: number;

	/**
	 * Gets or sets wether to *not* follow server's redirection responses.
	 */
	dontFollowRedirects?: boolean;
}

/**
 * Encapsulates HTTP-response information from an HTTP-request.
 */
export declare interface HttpResponse {
	/**
	 * Gets the response status code.
	 */
	statusCode: number;

	/**
	 * Gets the response headers.
	 */
	headers: Headers;

	/**
	 * Gets the response content.
	 */
	content?: HttpContent;
}

export declare enum HttpResponseEncoding {
	UTF8,
	GBK,
}

/**
 * Represents a class that provides functionality for loading and streching image(s).
 */
export declare class Image extends View {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/ImageView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.ImageView */;

	/**
	 * Gets the native iOS [UIImageView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIImageView_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIImageView */;

	/**
	 * Gets or sets the image source of the image.
	 */
	imageSource: ImageSource;

	/**
	 * Gets or sets the source of the Image. This can be either an URL string or a native image instance.
	 */
	src: any;

	/**
	 * Gets a value indicating if the image is currently loading.
	 */
	readonly isLoading: boolean;

	/**
	 * Gets or sets the image stretch mode.
	 */
	stretch: Stretch;

	/**
	 * Gets or sets the loading strategy for images on the local file system:
	 * - **sync** - blocks the UI if necessary to display immediately, good for small icons.
	 * - **async** *(default)* - will load in the background, may appear with short delay, good for large images.
	 * When loading images from web they are always loaded **async** no matter of loadMode value.
	 */
	loadMode: 'sync' | 'async';

	/**
	 * A color used to tint template images.
	 */
	tintColor: Color;

	/**
	 * Gets or sets the desired decode height of the image.
	 * This property is Android specific.
	 */
	decodeHeight: Length;

	/**
	 * Gets or sets the desired decode width of the image.
	 * This property is Android specific.
	 */
	decodeWidth: Length;
}

export declare class ImageAsset extends Observable {
	constructor(asset: any);
	getImageAsync(callback: (image: any, error: any) => void); //UIImage for iOS and android.graphics.Bitmap for Android
	ios: any; //PHAsset
	nativeImage: any; //UIImage for iOS and android.graphics.Bitmap for Android
	android: any;
	options: ImageAssetOptions;
}

export declare interface ImageAssetOptions {
	width?: number;
	height?: number;
	keepAspectRatio?: boolean;
	autoScaleFactor?: boolean;
}

/**
 * Represents a class that stores handles image download requests and caches the already downloaded images.
 */
export declare class ImageCache extends Observable {
	/**
	 * String value used when hooking to downloaded event.
	 */
	public static downloadedEvent: string;
	/**
	 * String value used when hooking to download error event.
	 */
	public static downloadErrorEvent: string;
	/**
	 * The image to be used to notify for a pending download request - e.g. loading indicator.
	 */
	placeholder: ImageSource;
	/**
	 * The maximum number of simultaneous download requests. Defaults to 5.
	 */
	maxRequests: number;

	/**
	 * Enables previously suspended download requests.
	 */
	enableDownload(): void;
	/**
	 * Temporary disables download requests.
	 */
	disableDownload(): void;

	/**
	 * Adds a new download request at the top of the download queue. This will be the next immediate download to start.
	 */
	push(request: DownloadRequest);
	/**
	 * Adds a new download request at the end of the download queue. This will be the last download to start.
	 */
	enqueue(request: DownloadRequest);

	/**
	 * Gets the image for the specified key. May be undefined if the key is not present in the cache.
	 */
	get(key: string): any;
	/**
	 * Sets the image for the specified key.
	 */
	set(key: string, image: any): void;
	/**
	 * Removes the cache for the specified key.
	 */
	remove(key: string): void;
	/**
	 * Removes all the previously cached images.
	 */
	clear(): void;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when the image has been downloaded.
	 */
	on(event: 'downloaded', callback: (args: DownloadedData) => void, thisArg?: any);

	/**
	 * Raised if the image download errors.
	 */
	on(event: 'downloadError', callback: (args: DownloadError) => void, thisArg?: any);

	//@private
	/**
	 * @private
	 */
	_downloadCore(request: DownloadRequest);
	/**
	 * @private
	 */
	_onDownloadCompleted(key: string, image: any);
	//@endprivate
	/**
	 * @private
	 */
	_onDownloadError(key: string, err: Error);
	//@endprivate
}

/**
 * Encapsulates the common abstraction behind a platform specific object (typically a Bitmap) that is used as a source for images.
 */
export declare class ImageSource {
	/**
	 * Gets the height of this instance. This is a read-only property.
	 */
	height: number;

	/**
	 * Gets the width of this instance. This is a read-only property.
	 */
	width: number;

	/**
	 * Gets or sets the rotation angle that should be applied to the image. (Used in android)
	 */
	rotationAngle: number;

	/**
	 * The iOS-specific [UIImage](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIImage_Class/) instance. Will be undefined when running on Android.
	 */
	ios: any /* UIImage */;

	/**
	 * The Android-specific [image](http://developer.android.com/reference/android/graphics/Bitmap.html) instance. Will be undefined when running on iOS.
	 */
	android: any /* android.graphics.Bitmap */;

	/**
	 * Loads this instance from the specified asset asynchronously.
	 * @param asset The ImageAsset instance used to create ImageSource.
	 */
	static fromAsset(asset: ImageAsset): Promise<ImageSource>;

	/**
	 * Downloads the image from the provided Url and creates a new ImageSource instance from it.
	 * @param url The link to the remote image object. This operation will download and decode the image.
	 */
	static fromUrl(url: string): Promise<ImageSource>;

	/**
	 * Loads this instance from the specified resource name.
	 * @param name The name of the resource (without its extension).
	 */
	static fromResourceSync(name: string): ImageSource;

	/**
	 * Loads this instance from the specified resource name asynchronously.
	 * @param name The name of the resource (without its extension).
	 */
	static fromResource(name: string): Promise<ImageSource>;

	/**
	 * Loads this instance from the specified file.
	 * @param path The location of the file on the file system.
	 */
	static fromFileSync(path: string): ImageSource;

	/**
	 * Loads this instance from the specified file asynchronously.
	 * @param path The location of the file on the file system.
	 */
	static fromFile(path: string): Promise<ImageSource>;

	/**
	 * Creates a new ImageSource instance and loads it from the specified local file or resource (if specified with the "res://" prefix).
	 * @param path The location of the file on the file system.
	 */
	static fromFileOrResourceSync(path: string): ImageSource;

	/**
	 * Loads this instance from the specified native image data.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	static fromDataSync(data: any): ImageSource;

	/**
	 * Loads this instance from the specified native image data asynchronously.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	static fromData(data: any): Promise<ImageSource>;

	/**
	 * Loads this instance from the specified base64 encoded string.
	 * @param source The Base64 string to load the image from.
	 */
	static fromBase64Sync(source: string): ImageSource;

	/**
	 * Loads this instance from the specified base64 encoded string asynchronously.
	 * @param source The Base64 string to load the image from.
	 */
	static fromBase64(source: string): Promise<ImageSource>;

	/**
	 * Creates a new ImageSource instance and loads it from the specified font icon code.
	 * @param source The hex font icon code string
	 * @param font The font for the corresponding font icon code
	 * @param color The color of the generated icon image
	 */
	static fromFontIconCodeSync(source: string, font: Font, color: Color): ImageSource;

	/**
	 * Creates a new ImageSource instance and sets the provided native source object (typically a Bitmap).
	 * The native source object will update either the android or ios properties, depending on the target os.
	 * @param nativeSource The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
	 */
	constructor(nativeSource?: any);

	/**
	 * @deprecated Use ImageSource.fromAsset() instead.
	 * Loads this instance from the specified asset asynchronously.
	 * @param asset The ImageAsset instance used to create ImageSource.
	 */
	fromAsset(asset: ImageAsset): Promise<ImageSource>;

	/**
	 * @deprecated Use ImageSource.fromResourceSync() instead.
	 * Loads this instance from the specified resource name.
	 * @param name The name of the resource (without its extension).
	 */
	loadFromResource(name: string): boolean;

	/**
	 * @deprecated Use ImageSource.fromResource() instead.
	 * Loads this instance from the specified resource name asynchronously.
	 * @param name The name of the resource (without its extension).
	 */
	fromResource(name: string): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromFileSync() instead.
	 * Loads this instance from the specified file.
	 * @param path The location of the file on the file system.
	 */
	loadFromFile(path: string): boolean;

	/**
	 * @deprecated Use ImageSource.fromFile() instead.
	 * Loads this instance from the specified file asynchronously.
	 * @param path The location of the file on the file system.
	 */
	fromFile(path: string): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromDataSync() instead.
	 * Loads this instance from the specified native image data.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	loadFromData(data: any): boolean;

	/**
	 * @deprecated Use ImageSource.fromData() instead.
	 * Loads this instance from the specified native image data asynchronously.
	 * @param data The native data (byte array) to load the image from. This will be either Stream for Android or NSData for iOS.
	 */
	fromData(data: any): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromBase64Sync() instead.
	 * Loads this instance from the specified base64 encoded string.
	 * @param source The Base64 string to load the image from.
	 */
	loadFromBase64(source: string): boolean;

	/**
	 * @deprecated Use ImageSource.fromBase64() instead.
	 * Loads this instance from the specified base64 encoded string asynchronously.
	 * @param source The Base64 string to load the image from.
	 */
	fromBase64(source: string): Promise<boolean>;

	/**
	 * @deprecated Use ImageSource.fromFontIconCode() instead.
	 * Loads this instance from the specified font icon code.
	 * @param source The hex font icon code string
	 * @param font The font for the corresponding font icon code
	 * @param color The color of the generated icon image
	 */
	loadFromFontIconCode(source: string, font: Font, color: Color): boolean;

	/**
	 * Sets the provided native source object (typically a Bitmap or a UIImage).
	 * This will update either the android or ios properties, depending on the target os.
	 * @param nativeSource The native image object. Will be either a Bitmap for Android or a UIImage for iOS.
	 */
	setNativeSource(nativeSource: any): void;

	/**
	 * Saves this instance to the specified file, using the provided image format and quality.
	 * @param path The path of the file on the file system to save to.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	saveToFile(path: string, format: 'png' | 'jpeg' | 'jpg', quality?: number): boolean;

	/**
	 * Converts the image to base64 encoded string, using the provided image format and quality.
	 * @param format The format (encoding) of the image.
	 * @param quality Optional parameter, specifying the quality of the encoding. Defaults to the maximum available quality. Quality varies on a scale of 0 to 100.
	 */
	toBase64String(format: 'png' | 'jpeg' | 'jpg', quality?: number): string;

	/**
	 * Returns a new ImageSource that is a resized version of this image with the same aspect ratio, but the max dimension set to the provided maxSize.
	 * @param maxSize The maximum pixel dimension of the resulting image.
	 * @param options Optional parameter, Only used for android, options.filter is a boolean which
	 *     determines whether or not bilinear filtering should be used when scaling the bitmap.
	 *     If this is true then bilinear filtering will be used when scaling which has
	 *     better image quality at the cost of worse performance. If this is false then
	 *     nearest-neighbor scaling is used instead which will have worse image quality
	 *     but is faster. Recommended default is to set filter to 'true' as the cost of
	 *     bilinear filtering is typically minimal and the improved image quality is significant.
	 */
	resize(maxSize: number, options?: any): ImageSource;
}

/**
 * Profiling mode to use.
 *  - `counters` Accumulates method call counts and times until dumpProfiles is called and then prints aggregated statistic in the console. This is the default.
 *  - `timeline` Outputs method names along start/end timestamps in the console on the go.
 *  - `lifecycle` Outputs basic non-verbose times for startup, navigation, etc.
 */
export declare type InstrumentationMode = 'counters' | 'timeline' | 'lifecycle';

/**
 * Module with ios specific utilities.
 */
declare module ios {
	// Common properties between UILabel, UITextView and UITextField
	interface TextUIView {
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
		function jsArrayToNSArray(str: string[]): any;

		/**
		 * Converts NSArray to JavaScript array.
		 * @param a - NSArray to convert.
		 */
		function nsArrayToJSArray(a: any): string[];
	}

	/**
	 * @deprecated use application.orientation instead
	 *
	 * Gets an information about if current mode is Landscape.
	 */
	function isLandscape(): boolean;

	/**
	 * Gets the iOS device major version (for 8.1 will return 8).
	 */
	const MajorVersion: number;

	/**
	 * Opens file with associated application.
	 * @param filePath The file path.
	 */
	function openFile(filePath: string): boolean;

	/**
	 * Joins an array of file paths.
	 * @param paths An array of paths.
	 * Returns the joined path.
	 */
	function joinPaths(...paths: string[]): string;

	/**
	 * Gets the root folder for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 * iOS - this folder is read-only and contains the app and all its resources.
	 */
	function getCurrentAppPath(): string;

	/**
	 * Gets the currently visible(topmost) UIViewController.
	 * @param rootViewController The root UIViewController instance to start searching from (normally window.rootViewController).
	 * Returns the visible UIViewController.
	 */
	function getVisibleViewController(rootViewController: any /* UIViewController*/): any; /* UIViewController*/
}

/**
 * Represents iOS specific options of the action item.
 */
declare interface IOSActionItemSettings {
	/**
	 * Gets or sets the position of the action item in the action bar.
	 *  1. left - items is shown at the left part of the navigation bar. This is the default value.
	 *  2. right - items is shown at the right part of the navigation bar.
	 * Note: Property not applicable to NavigationButton
	 */
	position: 'left' | 'right';

	/**
	 * Gets or sets a number representing the iOS system item to be displayed.
	 * Use this property instead of ActionItem.icon if you want to diplsay a built-in iOS system icon.
	 * Note: Property not applicable to NavigationButton
	 * The value should be a number from the UIBarButtonSystemItem enumeration
	 * (https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIBarButtonItem_Class/#//apple_ref/c/tdef/UIBarButtonSystemItem)
	 *  0: Done
	 *  1: Cancel
	 *  2: Edit
	 *  3: Save
	 *  4: Add
	 *  5: FlexibleSpace
	 *  6: FixedSpace
	 *  7: Compose
	 *  8: Reply
	 *  9: Action
	 * 10: Organize
	 * 11: Bookmarks
	 * 12: Search
	 * 13: Refresh
	 * 14: Stop
	 * 15: Camera
	 * 16: Trash
	 * 17: Play
	 * 18: Pause
	 * 19: Rewind
	 * 20: FastForward
	 * 21: Undo
	 * 22: Redo
	 * 23: PageCurl
	 */
	systemIcon: number;
}

/**
 * The abstraction of an iOS-specific application object.
 */
export declare class iOSApplication {
	/* tslint:enable */
	/**
	 * The root view controller for the application.
	 */
	rootController: any /* UIViewController */;

	/* tslint:enable */
	/**
	 * The key window.
	 */
	window: any /* UIWindow */;

	/**
	 * The [UIApplicationDelegate](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplicationDelegate_Protocol/index.html) class.
	 */
	delegate: any /* typeof UIApplicationDelegate */;

	/**
	 * Gets or sets the orientation of the application.
	 * Available values: "portrait", "landscape", "unknown".
	 */
	orientation: 'portrait' | 'landscape' | 'unknown';

	/**
	 * Gets the system appearance.
	 * Available values: "dark", "light", null.
	 * Null for iOS <= 11.
	 */
	systemAppearance: 'dark' | 'light' | null;

	/**
	 * The [UIApplication](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html).
	 */
	nativeApp: any /* UIApplication */;

	/**
	 * Adds an observer to the default notification center for the specified notification.
	 * For more information, please visit 'https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSNotificationCenter_Class/#//apple_ref/occ/instm/NSNotificationCenter/addObserver:selector:name:object:'
	 * @param notificationName A string containing the name of the notification.
	 * @param onReceiveCallback A callback function that will be called each time the observer receives a notification.
	 */
	addNotificationObserver(notificationName: string, onReceiveCallback: (notification: any /* NSNotification */) => void): any;

	/**
	 * Removes the observer for the specified notification from the default notification center.
	 * For more information, please visit 'https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSNotificationCenter_Class/#//apple_ref/occ/instm/NSNotificationCenter/addObserver:selector:name:object:'
	 * @param observer The observer that was returned from the addNotificationObserver method.
	 * @param notificationName A string containing the name of the notification.
	 * @param onReceiveCallback A callback function that will be called each time the observer receives a notification.
	 */
	removeNotificationObserver(observer: any, notificationName: string): void;
}

/**
 * Represents the iOS-specific Frame object, aggregated within the common Frame one.
 * In iOS the native controller, associated with a Frame object is UINavigationController.
 * The navigation controller will automatically hide/show its navigation bar depending on the back stack of the Frame.
 */
declare interface iOSFrame {
	/**
	 * Gets the native [UINavigationController](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UINavigationController_Class/index.html) instance associated with this Frame.
	 */
	controller: any /* UINavigationController */;

	/**
	 * Gets or sets the visibility of navigationBar.
	 * Use NavBarVisibility enumeration - auto, never, always
	 */
	navBarVisibility: 'auto' | 'never' | 'always';

	//@private
	/**
	 * @private
	 */
	_disableNavBarAnimation: boolean;
	//@endprivate
}

/**
 * IOS Alignment of the Tabs TabStrip to use.
 *  - `leading` - tab items are aligned to the left
 *  - `justified` - tab strip is split equally to all the tab items
 *  - `center` - tabs items are aligned in the center
 *  - `centerSelected` - tab items move to make the selected tab in the center
 */
export declare type IOSTabBarItemsAlignment = 'leading' | 'justified' | 'center' | 'centerSelected';

/**
 * Gets a value indicating if the app is running on the Android platform.
 */
export declare const isAndroid: boolean;

/**
 * Returns true if the specified URI is data URI (http://en.wikipedia.org/wiki/Data_URI_scheme).
 * @param uri The URI.
 */
declare function isDataURI(uri: string): boolean;

/**
 * A function that returns whether the tracer is enabled and there is a point in writing messages.
 * Check this to avoid writing complex string templates.
 * Send error messages even if tracing is disabled.
 */
declare function isEnabled(): boolean;

/**
 * Returns true if the specified path points to a resource or local file.
 * @param path The path.
 */
declare function isFileOrResourcePath(path: string): boolean;

/**
 * Returns true if the specified URI is a font icon URI like "fontIcon://&#xf1e0".
 * @param uri The URI.
 */
declare function isFontIconURI(uri: string): boolean;

/**
 * Gets a value indicating if the app is running on the iOS platform.
 */
export declare const isIOS: boolean;

/**
 * @returns Boolean value indicating whether the current thread is the main thread
 */
declare function isMainThread(): boolean;

/**
 * Checks whether the application is running on real device and not on simulator/emulator.
 */
declare function isRealDevice(): boolean;

/**
 * Returns true if a timer is currently running.
 * @param name Name of the timer.
 * @returns true is the timer is currently running.
 */
declare function isRunning(name: string): boolean;

/**
 * Event data containing information for the index and the view associated to a list view item.
 */
export declare interface ItemEventData extends EventData {
	/**
	 * The index of the item, for which the event is raised.
	 */
	index: number;

	/**
	 * The view that is associated to the item, for which the event is raised.
	 */
	view: View;

	/**
	 * Gets the native [iOS view](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableViewCell_Class/) that represents the user interface where the view is hosted. Valid only when running on iOS.
	 */
	ios: any /* UITableViewCell */;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/view/ViewGroup.html) that represents the user interface where the view is hosted. Valid only when running on Android OS.
	 */
	android: any /* android.view.ViewGroup */;
}

/**
 * Defines row/column specific properties that apply to GridLayout elements.
 */
declare class ItemSpec {
	constructor();
	constructor(value: number, type: GridUnitType);

	/**
	 * Gets the actual length of an ItemSpec.
	 */
	actualLength: number;

	/**
	 * Returns unit type of this ItemSpec instance.
	 */
	gridUnitType: GridUnitType;

	/**
	 * Returns true if this ItemSpec instance holds
	 * an absolute (pixel) value.
	 */
	isAbsolute: boolean;

	/**
	 * Returns true if this GridLength instance is
	 * automatic (not specified).
	 */
	isAuto: boolean;

	/**
	 * Returns true if this ItemSpec instance holds weighted proportion
	 * of available space.
	 */
	isStar: boolean;

	/**
	 * Returns value part of this ItemSpec instance.
	 */
	value: number;
}

export declare interface ItemsSource {
	length: number;
	getItem(index: number): any;
}

declare interface ItemsSource_2 {
	length: number;
	getItem(index: number): any;
}

declare type JustifyContent = 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';

declare type KeyboardType = 'datetime' | 'phone' | 'number' | 'url' | 'email' | 'integer';

/**
 * Defines an interface for Template with a key.
 */
export declare interface KeyedTemplate {
	/**
	 * The unique key of the template.
	 */
	key: string;

	/**
	 * The function that creates the view.
	 */
	createView: Template;
}

/**
 * Defines animation options for the View.animate method.
 */
declare class KeyframeAnimationInfo {
	/**
	 * Return animation keyframes.
	 */
	keyframes: Array<KeyframeInfo>;

	/**
	 * The animation name.
	 */
	name?: string;

	/**
	 * The length of the animation in milliseconds. The default duration is 300 milliseconds.
	 */
	duration?: number;

	/**
	 * The amount of time, in milliseconds, to delay starting the animation.
	 */
	delay?: number;

	/**
	 * Specifies how many times the animation should be played. Default is 1.
	 * iOS animations support fractional iterations, i.e. 1.5.
	 * To repeat an animation infinitely, use Number.POSITIVE_INFINITY
	 */
	iterations?: number;

	/**
	 * An optional animation curve. Possible values are contained in the [AnimationCurve enumeration](../modules/_ui_enums_.animationcurve.html).
	 * Alternatively, you can pass an instance of type UIViewAnimationCurve for iOS or android.animation.TimeInterpolator for Android.
	 */
	curve?: any;

	/**
	 * Determines whether the animation values will be applied on the animated object after the animation finishes.
	 */
	isForwards: boolean;

	/**
	 * If true the animation will be played backwards.
	 */
	isReverse?: boolean;
}

declare interface KeyframeDeclaration {
	property: string;
	value: any;
}

declare interface KeyframeInfo {
	duration: number;
	declarations: Array<KeyframeDeclaration>;
	curve?: any;
}

/**
 * Provides access to the top-level Folders instances that are accessible from the application. Use these as entry points to access the FileSystem.
 */
export declare module knownFolders {
	/**
	 * Gets the Documents folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 */
	export function documents(): Folder;

	/**
	 * Gets the Temporary (Caches) folder available for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 */
	export function temp(): Folder;

	/**
	 * Gets the root folder for the current application. This Folder is private for the application and not accessible from Users/External apps.
	 * iOS - this folder is read-only and contains the app and all its resources.
	 */
	export function currentApp(): Folder;

	/**
	 * Contains iOS-specific known folders.
	 */
	export module ios {
		/**
		 * Gets the NSLibraryDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function library(): Folder;

		/**
		 * Gets the NSDeveloperDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function developer(): Folder;

		/**
		 * Gets the NSDesktopDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function desktop(): Folder;

		/**
		 * Gets the NSDownloadsDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function downloads(): Folder;

		/**
		 * Gets the NSMoviesDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function movies(): Folder;

		/**
		 * Gets the NSMusicDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function music(): Folder;

		/**
		 * Gets the NSPicturesDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function pictures(): Folder;

		/**
		 * Gets the NSSharedPublicDirectory. Note that the folder will not be created if it did not exist.
		 */
		export function sharedPublic(): Folder;
	}
}

/**
 * Represents a text label.
 */
export declare class Label extends TextBase {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/TextView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.TextView */;

	/**
	 * Gets the native [UILabel](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UILabel_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UILabel */;

	/**
	 * Gets or sets whether the Label wraps text or not.
	 */
	textWrap: boolean;
}

/**
 * Event data containing information for launch event.
 */
export declare interface LaunchEventData extends ApplicationEventData {
	/**
	 * The root view for this Window on iOS or Activity for Android.
	 * If not set a new Frame will be created as a root view in order to maintain backwards compatibility.
	 */
	root?: View;

	savedInstanceState?: any /* android.os.Bundle */;
}

/**
 * Utility module related to layout.
 */
declare module layout {
	/**
	 * Bits that provide the actual measured size.
	 */
	const MEASURED_HEIGHT_STATE_SHIFT: number;
	const MEASURED_SIZE_MASK: number;
	const MEASURED_STATE_MASK: number;
	const MEASURED_STATE_TOO_SMALL: number;
	const UNSPECIFIED: number;
	const EXACTLY: number;
	const AT_MOST: number;

	/**
	 * Gets layout mode from a given specification as string.
	 * @param mode - The measure specification mode.
	 */
	function getMode(mode: number): string;

	/**
	 * Gets measure specification mode from a given specification.
	 * @param spec - The measure specification.
	 */
	function getMeasureSpecMode(spec: number): number;

	/**
	 * Gets measure specification size from a given specification.
	 * @param spec - The measure specification.
	 */
	function getMeasureSpecSize(spec: number): number;

	/**
	 * Creates measure specification size from size and mode.
	 * @param size - The size component of measure specification.
	 * @param mode - The mode component of measure specification.
	 */
	function makeMeasureSpec(px: number, mode: number): number;

	/**
	 * Gets display density for the current device.
	 */
	function getDisplayDensity(): number;

	/**
	 * Convert device independent pixels to device pixels - dip to px.
	 * @param value - The pixel to convert.
	 */
	function toDevicePixels(value: dip): px;

	/**
	 * Convert device pixels to device independent pixels - px to dip.
	 * @param value - The pixel to convert.
	 */
	function toDeviceIndependentPixels(value: px): dip;

	/**
	 * Rounds value used in layout.
	 * @param px to round.
	 */
	function round(px: px): px;

	/**
	 * Converts device pixels to device independent pixes and measure the nativeView.
	 * Returns the desired size of the nativeView in device pixels.
	 * @param nativeView the nativeView to measure (UIView or android.view.View)
	 * @param width the available width
	 * @param widthMode width mode - UNSPECIFIED, EXACTLY or AT_MOST
	 * @param height the available hegiht
	 * @param heightMode height mode - UNSPECIFIED, EXACTLY or AT_MOST
	 */
	function measureNativeView(nativeView: any /* UIView or android.view.View */, width: number, widthMode: number, height: number, heightMode: number): { width: number; height: number };

	/**
	 * Prints user friendly version of the measureSpec.
	 * @param measureSpec the spec to print
	 */
	function measureSpecToString(measureSpec: number): string;
}

/**
 * Base class for all views that supports children positioning.
 */
export declare class LayoutBase extends CustomLayoutView {
	/**
	 * Returns the number of children in this Layout.
	 */
	getChildrenCount(): number;

	/**
	 * Returns the view at the specified position.
	 * @param index The position at which to get the child from.
	 */
	getChildAt(index: number): View;

	/**
	 * Returns the position of the child view
	 * @param child The child view that we are looking for.
	 */
	getChildIndex(child: View): number;

	/**
	 * Adds the view to children array.
	 * @param view The view to be added to the end of the children array.
	 */
	addChild(view: View): void;

	/**
	 * Inserts the view to children array at the specified index.
	 * @param view The view to be added to the end of the children array.
	 * @param atIndex The insertion index.
	 */
	insertChild(child: View, atIndex: number): void;

	/**
	 * Removes the specified view from the children array.
	 * @param view The view to remove from the children array.
	 */
	removeChild(view: View): void;

	/**
	 * Removes all views in this layout.
	 */
	removeChildren(): void;

	/**
	 * INTERNAL. Used by the layout system.
	 */
	_registerLayoutChild(child: View): void;

	/**
	 * INTERNAL. Used by the layout system.
	 */
	_unregisterLayoutChild(child: View): void;

	/**
	 * Calls the callback for each child that should be laid out.
	 * @param callback The callback
	 */
	eachLayoutChild(callback: (child: View, isLast: boolean) => void): void;

	/**
	 * Gets or sets padding style property.
	 */
	padding: string | Length;

	/**
	 * Specify the bottom padding of this layout.
	 */
	paddingBottom: Length;

	/**
	 * Specify the left padding of this layout.
	 */
	paddingLeft: Length;

	/**
	 * Specify the right padding of this layout.
	 */
	paddingRight: Length;

	/**
	 * Specify the top padding of this layout.
	 */
	paddingTop: Length;

	/**
	 * Gets or sets a value indicating whether to clip the content of this layout.
	 */
	clipToBounds: boolean;

	/**
	 * Gets or sets a value indicating whether touch event should pass through to a parent view of the
	 * layout container in case an interactive child view did not handle it.
	 * Default value of this property is false. This does not affect the appearance of the view.
	 */
	isPassThroughParentEnabled: boolean;
}

declare type Length = 'auto' | dip | LengthDipUnit | LengthPxUnit;

declare namespace Length {
	function parse(text: string): Length;
	function equals(a: Length, b: Length): boolean;
	/**
	 * Converts Length unit to device pixels.
	 * @param length The Length to convert.
	 * @param auto Value to use for conversion of "auto". By default is Math.NaN.
	 */
	function toDevicePixels(length: Length, auto?: number): number;
	function convertToString(length: Length): string;
}

declare type Length_2 = Unit<'px' | 'dip'>;

declare type LengthDipUnit = { readonly unit: 'dip'; readonly value: dip };

declare type LengthPercentage = Length_2 | Percentage;

declare type LengthPercentUnit = { readonly unit: '%'; readonly value: percent };

declare type LengthPxUnit = { readonly unit: 'px'; readonly value: px };

declare class LinearGradient {
	public angle: number;
	public colorStops: ColorStop[];

	public static parse(value: LinearGradient_2): LinearGradient_2;

	public static equals(first: LinearGradient_2, second: LinearGradient_2): boolean;
}

declare interface LinearGradient_2 {
	angle: number;
	colors: ColorStop_2[];
}

/**
 * Represents an list picker.
 */
export declare class ListPicker extends View {
	/**
	 * Gets the native [android.widget.NumberPicker](http://developer.android.com/reference/android/widget/NumberPicker.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.NumberPicker */;

	/**
	 * Gets the native iOS [UIPickerView](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIPickerView */;

	/**
	 * Gets or sets the selected index.
	 */
	selectedIndex: number;

	/**
	 * Gets or set the items collection of the ListPicker.
	 * The items property can be set to an array or an object defining length and getItem(index) method.
	 */
	items: any;
}

/**
 * Represents a view that shows items in a vertically scrolling list.
 */
export declare class ListView extends View {
	/**
	 * String value used when hooking to itemLoading event.
	 */
	public static itemLoadingEvent: string;
	/**
	 * String value used when hooking to itemTap event.
	 */
	public static itemTapEvent: string;
	/**
	 * String value used when hooking to loadMoreItems event.
	 */
	public static loadMoreItemsEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/ListView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.ListView */;

	/**
	 * Gets the native [iOS view](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITableView_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITableView */;

	/**
	 * Gets or set the items collection of the ListView.
	 * The items property can be set to an array or an object defining length and getItem(index) method.
	 */
	items: any[] | ItemsSource;

	/**
	 * Gets or set the item template of the ListView.
	 */
	itemTemplate: string | Template;

	/**
	 * Gets or set the list of item templates for the item template selector
	 */
	itemTemplates: string | Array<KeyedTemplate>;

	/**
	 * A function that returns the appropriate ket template based on the data item.
	 */
	itemTemplateSelector: string | ((item: any, index: number, items: any) => string);

	/**
	 * Item id generator
	 */
	itemIdGenerator: (item: any, index: number, items: any) => number;

	/**
	 * Gets or set the items separator line color of the ListView.
	 */
	separatorColor: Color;

	/**
	 * Gets or set row height of the ListView.
	 */
	rowHeight: Length;

	/**
	 * Gets or set the estimated height of rows in the ListView.
	 * The default value is 44px.
	 */
	iosEstimatedRowHeight: Length;

	/**
	 * Forces the ListView to reload all its items.
	 */
	refresh();

	/**
	 * Scrolls the specified item with index into view.
	 * [iOS](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UITableView_Class/#//apple_ref/occ/instm/UITableView/scrollToRowAtIndexPath:atScrollPosition:animated:)
	 * [Android](http://developer.android.com/reference/android/widget/ListView.html#setSelection(int))
	 * @param index - Item index.
	 */
	scrollToIndex(index: number);

	/**
	 * Scrolls the specified item with index into view with animation.
	 * [iOS](https://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UITableView_Class/#//apple_ref/occ/instm/UITableView/scrollToRowAtIndexPath:atScrollPosition:animated:)
	 * [Android](https://developer.android.com/reference/android/widget/ListView.html#smoothScrollToPosition(int))
	 * @param index - Item index.
	 */
	scrollToIndexAnimated(index: number);

	/**
	 * Checks if Specified item with index is visible.
	 * @param index - Item index.
	 */
	isItemAtIndexVisible(index: number): boolean;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a View for the data at the specified index should be created.
	 * The result should be returned trough the view property of the event data.
	 * Note, that the view property of the event data can be pre-initialized with
	 * an old instance of a view, so that it can be reused.
	 */
	on(event: 'itemLoading', callback: (args: ItemEventData) => void, thisArg?: any);

	/**
	 * Raised when an item inside the ListView is tapped.
	 */
	on(event: 'itemTap', callback: (args: ItemEventData) => void, thisArg?: any);

	/**
	 * Raised when the ListView is scrolled so that its last item is visible.
	 */
	on(event: 'loadMoreItems', callback: (args: EventData) => void, thisArg?: any);
}

/**
 * Loads immediately the app.css.
 * By default the app.css file is loaded shortly after "loaded".
 * For the Android snapshot the CSS can be parsed during the snapshot generation,
 * as the CSS does not depend on runtime APIs, and loadAppCss will be called explicitly.
 */
declare function loadAppCss();

export declare interface LoadAppCSSEventData extends EventData {
	cssFile: string;
}

/**
 * Event data containing information for the loading events of a WebView.
 */
declare interface LoadEventData extends EventData {
	/**
	 * Gets the url of the web-view.
	 */
	url: string;

	/**
	 * Gets the navigation type of the web-view.
	 */
	navigationType: NavigationType_2;

	/**
	 * Gets the error (if any).
	 */
	error: string;
}

export declare interface LoadOptions {
	path: string;
	name: string;
	attributes?: any;
	exports?: any;
	page?: Page;
}

/**
 * Returns a function wrapper which executes the supplied function on the main thread.
 * The wrapper behaves like the original function and passes all of its arguments BUT
 * discards its return value.
 * @param func The function to execute on the main thread
 * @returns The wrapper function which schedules execution to the main thread
 */
declare function mainThreadify(func: Function): (...args: any[]) => void;

/**
 * An enum that defines all predefined message types.
 */
declare module messageType {
	const log: number;
	const info: number;
	const warn: number;
	const error: number;
}

/**
 * Defines the data for the page navigation events.
 */
export declare interface NavigatedData extends EventData {
	/**
	 * The navigation context (optional, may be undefined) passed to the page navigation events method.
	 */
	context: any;

	/**
	 * Represents if a navigation is forward or backward.
	 */
	isBackNavigation: boolean;
}

/**
 * Represents the navigation (a.k.a. "back") button.
 */
export declare class NavigationButton extends ActionItem {
	//@private
	/**
	 * @private
	 */
	_navigationItem?: any;
	//@endprivate
}

/**
 * Represents a context passed to navigation methods.
 */
export declare interface NavigationContext {
	entry: BackstackEntry;
	isBackNavigation: boolean;
	navigationType: NavigationType;
}

/**
 * Represents an entry in passed to navigate method.
 */
export declare interface NavigationEntry extends ViewEntry {
	/**
	 * An object passed to the onNavigatedTo callback of the Page. Typically this is used to pass some data among pages. Optional.
	 */
	context?: any;

	/**
	 * An object to become the binding context of the page navigating to. Optional.
	 */
	bindingContext?: any;

	/**
	 * True to navigate to the new Page using animated transitions, false otherwise.
	 */
	animated?: boolean;

	/**
	 * Specifies an optional navigation transition for all platforms. If not specified, the default platform transition will be used.
	 */
	transition?: NavigationTransition;

	/**
	 * Specifies an optional navigation transition for iOS. If not specified, the default platform transition will be used.
	 */
	transitioniOS?: NavigationTransition;

	/**
	 * Specifies an optional navigation transition for Android. If not specified, the default platform transition will be used.
	 */
	transitionAndroid?: NavigationTransition;

	/**
	 * True to record the navigation in the backstack, false otherwise.
	 * If the parameter is set to false then the Page will be displayed but once navigated from it will not be able to be navigated back to.
	 */
	backstackVisible?: boolean;

	/**
	 * True to clear the navigation history, false otherwise. Very useful when navigating away from login pages.
	 */
	clearHistory?: boolean;
}

/**
 * Represents an object specifying a page navigation transition.
 */
export declare interface NavigationTransition {
	/**
	 * Can be one of the built-in transitions:
	 * - curl (same as curlUp) (iOS only)
	 * - curlUp (iOS only)
	 * - curlDown (iOS only)
	 * - explode (Android Lollipop(21) and up only)
	 * - fade
	 * - flip (same as flipRight)
	 * - flipRight
	 * - flipLeft
	 * - slide (same as slideLeft)
	 * - slideLeft
	 * - slideRight
	 * - slideTop
	 * - slideBottom
	 */
	name?: string;

	/**
	 * An user-defined instance of the "ui/transition".Transition class.
	 */
	instance?: Transition;

	/**
	 * The length of the transition in milliseconds. If you do not specify this, the default platform transition duration will be used.
	 */
	duration?: number;

	/**
	 * An optional transition animation curve. Possible values are contained in the [AnimationCurve enumeration](https://docs.nativescript.org/api-reference/modules/_ui_enums_.animationcurve.html).
	 * Alternatively, you can pass an instance of type UIViewAnimationCurve for iOS or android.animation.TimeInterpolator for Android.
	 */
	curve?: any;
}

declare enum NavigationType {
	back,
	forward,
	replace,
}

/**
 * Represents navigation type
 */
declare type NavigationType_2 = 'linkClicked' | 'formSubmitted' | 'backForward' | 'reload' | 'formResubmitted' | 'other' | undefined;

/**
 * Observable is used when you want to be notified when a change occurs. Use on/off methods to add/remove listener.
 */
export declare class Observable {
	/**
	 * Please note that should you be using the `new Observable({})` constructor, it is **obsolete** since v3.0,
	 * and you have to migrate to the "data/observable" `fromObject({})` or the `fromObjectRecursive({})` functions.
	 */
	constructor();

	/**
	 * String value used when hooking to propertyChange event.
	 */
	public static propertyChangeEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a propertyChange occurs.
	 */
	on(event: 'propertyChange', callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Adds one-time listener function for the event named `event`.
	 * @param event Name of the event to attach to.
	 * @param callback A function to be called when the specified event is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 */
	once(event: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Shortcut alias to the removeEventListener method.
	 */
	off(eventNames: string, callback?: any, thisArg?: any);

	/**
	 * Adds a listener for the specified event name.
	 * @param eventNames Comma delimited names of the events to attach the listener to.
	 * @param callback A function to be called when some of the specified event(s) is raised.
	 * @param thisArg An optional parameter which when set will be used as "this" in callback method call.
	 */
	addEventListener(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Removes listener(s) for the specified event name.
	 * @param eventNames Comma delimited names of the events the specified listener is associated with.
	 * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
	 * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
	 */
	removeEventListener(eventNames: string, callback?: any, thisArg?: any);

	/**
	 * Updates the specified property with the provided value.
	 */
	set(name: string, value: any): void;

	/**
	 * Updates the specified property with the provided value and raises a property change event and a specific change event based on the property name.
	 */
	setProperty(name: string, value: any): void;

	/**
	 * Gets the value of the specified property.
	 */
	get(name: string): any;

	/**
	 * Notifies all the registered listeners for the event provided in the data.eventName.
	 * @param data The data associated with the event.
	 */
	notify<T extends EventData>(data: T): void;

	/**
	 * Notifies all the registered listeners for the property change event.
	 */
	notifyPropertyChange(propertyName: string, value: any, oldValue?: any): void;

	/**
	 * Checks whether a listener is registered for the specified event name.
	 * @param eventName The name of the event to check for.
	 */
	hasListeners(eventName: string): boolean;

	//@private
	/**
	 * This method is intended to be overriden by inheritors to provide additional implementation.
	 * @private
	 */
	_createPropertyChangeData(name: string, value: any, oldValue?: any): PropertyChangeData;

	//@private
	/**
	 * Filed to use instead of instanceof ViewBase.
	 * @private
	 */
	public _isViewBase: boolean;

	/**
	 * @private
	 */
	_emit(eventNames: string);
	//@endprivate
}

/**
 * Advanced array like class used when you want to be notified when a change occurs.
 */
export declare class ObservableArray<T> extends Observable {
	/**
	 * String value used when hooking to change event.
	 */
	public static changeEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a change occurs.
	 */
	on(event: 'change', callback: (args: ChangedData<T>) => void, thisArg?: any);

	/**
	 * Create ObservableArray<T> with specified length.
	 */
	constructor(arrayLength?: number);

	/**
	 * Create ObservableArray<T> from source Array<T>.
	 */
	constructor(items: T[]);

	/**
	 * Create ObservableArray<T> from T items.
	 */
	constructor(...items: T[]);

	/**
	 * Returns item at specified index.
	 */
	getItem(index: number): T;
	/**
	 * Sets item at specified index.
	 */
	setItem(index: number, value: T): void;
	/**
	 * Returns a string representation of an array.
	 */
	toString(): string;
	toLocaleString(): string;
	/**
	 * Combines two or more arrays.
	 * @param items Additional items to add to the end of array1.
	 */
	concat<U extends T[]>(...items: U[]): T[];
	/**
	 * Combines two or more arrays.
	 * @param items Additional items to add to the end of array1.
	 */
	concat(...items: T[]): T[];
	/**
	 * Adds all the elements of an array separated by the specified separator string.
	 * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
	 */
	join(separator?: string): string;
	/**
	 * Removes the last element from an array and returns it.
	 */
	pop(): T;
	/**
	 * Appends new elements to an array, and returns the new length of the array.
	 * @param items New elements of the Array.
	 */
	push(items: T[]): number;
	/**
	 * Appends new elements to an array, and returns the new length of the array.
	 * @param items New elements of the Array.
	 */
	push(...items: T[]): number;

	/**
	 * Reverses the elements in an Array.
	 */
	reverse(): T[];
	/**
	 * Removes the first element from an array and returns it.
	 */
	shift(): T;
	/**
	 * Returns a section of an array.
	 * @param start The beginning of the specified portion of the array.
	 * @param end The end of the specified portion of the array.
	 */
	slice(start?: number, end?: number): T[];

	/**
	 * Sorts an array.
	 * @param compareFn The name of the function used to determine the order of the elements. If omitted, the elements are sorted in ascending, ASCII character order.
	 */
	sort(compareFn?: (a: T, b: T) => number): T[];

	/**
	 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
	 * @param start The zero-based location in the array from which to start removing elements.
	 */
	splice(start: number): T[];

	/**
	 * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
	 * @param start The zero-based location in the array from which to start removing elements.
	 * @param deleteCount The number of elements to remove.
	 * @param items Elements to insert into the array in place of the deleted elements.
	 */
	splice(start: number, deleteCount: number, ...items: T[]): T[];

	/**
	 * Inserts new elements at the start of an array.
	 * @param items  Elements to insert at the start of the Array.
	 */
	unshift(...items: T[]): number;

	/**
	 * Returns the index of the first occurrence of a value in an array.
	 * @param searchElement The value to locate in the array.
	 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
	 */
	indexOf(searchElement: T, fromIndex?: number): number;

	/**
	 * Returns the index of the last occurrence of a specified value in an array.
	 * @param searchElement The value to locate in the array.
	 * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
	 */
	lastIndexOf(searchElement: T, fromIndex?: number): number;

	/**
	 * Determines whether all the members of an array satisfy the specified test.
	 * @param callbackfn A function that accepts up to three arguments. The every method calls the callbackfn function for each element in array1 until the callbackfn returns false, or until the end of the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	every(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;

	/**
	 * Determines whether the specified callback function returns true for any element of an array.
	 * @param callbackfn A function that accepts up to three arguments. The some method calls the callbackfn function for each element in array1 until the callbackfn returns true, or until the end of the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	some(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): boolean;

	/**
	 * Performs the specified action for each element in an array.
	 * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
	 * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;

	/**
	 * Calls a defined callback function on each element of an array, and returns an array that contains the results.
	 * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];

	/**
	 * Returns the elements of an array that meet the condition specified in a callback function.
	 * @param callbackfn A function that accepts up to three arguments. The filter method calls the callbackfn function one time for each element in the array.
	 * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	 */
	filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any): T[];

	/**
	 * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T;
	/**
	 * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;

	/**
	 * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): T;
	/**
	 * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	 * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
	 * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	 */
	reduceRight<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;

	/**
	 * Gets or sets the length of the array. This is a number one higher than the highest element defined in an array.
	 */
	length: number;
}

/**
 * Removes listener for the specified event name.
 */
declare function off(eventNames: string, callback?: any, thisArg?: any);

/**
 * Shortcut alias to the removeEventListener method.
 * @param eventNames - String corresponding to events (e.g. "onLaunch").
 * @param callback - Callback function which will be removed.
 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
 */
declare function off(eventNames: string, callback?: any, thisArg?: any);

/**
 * This event is raised when application css is changed.
 */
declare function on(event: 'cssChanged', callback: (args: CssChangedEventData) => void, thisArg?: any);

/**
 * Event raised then livesync operation is performed.
 */
declare function on(event: 'livesync', callback: (args: EventData) => void);

/**
 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
 * @param eventNames - String corresponding to events (e.g. "onLaunch"). Optionally could be used more events separated by `,` (e.g. "onLaunch", "onSuspend").
 * @param callback - Callback function which will be executed when event is raised.
 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
 */
declare function on(eventNames: string, callback: (data: any) => void, thisArg?: any);

/**
 * This event is raised on application launchEvent.
 */
declare function on(event: 'launch', callback: (args: LaunchEventData) => void, thisArg?: any);

/**
 * This event is raised after the application has performed most of its startup actions.
 * Its intent is to be suitable for measuring app startup times.
 * @experimental
 */
declare function on(event: 'displayed', callback: (args: EventData) => void, thisArg?: any);

/**
 * This event is raised when the Application is suspended.
 */
declare function on(event: 'suspend', callback: (args: ApplicationEventData) => void, thisArg?: any);

/**
 * This event is raised when the Application is resumed after it has been suspended.
 */
declare function on(event: 'resume', callback: (args: ApplicationEventData) => void, thisArg?: any);

/**
 * This event is raised when the Application is about to exit.
 */
declare function on(event: 'exit', callback: (args: ApplicationEventData) => void, thisArg?: any);

/**
 * This event is raised when there is low memory on the target device.
 */
declare function on(event: 'lowMemory', callback: (args: ApplicationEventData) => void, thisArg?: any);

/**
 * This event is raised when an uncaught error occurs while the application is running.
 */
declare function on(event: 'uncaughtError', callback: (args: UnhandledErrorEventData) => void, thisArg?: any);

/**
 * This event is raised when an discarded error occurs while the application is running.
 */
declare function on(event: 'discardedError', callback: (args: DiscardedErrorEventData) => void, thisArg?: any);

/**
 * This event is raised when the orientation of the application changes.
 */
declare function on(event: 'orientationChanged', callback: (args: OrientationChangedEventData) => void, thisArg?: any);

/**
 * This event is raised when the operating system appearance changes
 * between light and dark theme (for Android);
 * between light and dark mode (for iOS) and vice versa.
 */
declare function on(event: 'systemAppearanceChanged', callback: (args: SystemAppearanceChangedEventData) => void, thisArg?: any);

/**
 * Opens file.
 * @param filePath The file.
 */
declare function openFile(filePath: string): boolean;

/**
 * Opens url.
 * @param url The url.
 */
declare function openUrl(url: string): boolean;

/**
 * A flex order integer.
 */
declare type Order = number;

declare type Orientation = 'horizontal' | 'vertical';

/**
 * Gets the orientation of the application.
 * Available values: "portrait", "landscape", "unknown".
 */
declare function orientation(): 'portrait' | 'landscape' | 'unknown';

declare type Orientation_2 = 'horizontal' | 'vertical';

declare type Orientation_3 = 'horizontal' | 'vertical';

/**
 * Event data containing information for orientation changed event.
 */
export declare interface OrientationChangedEventData extends ApplicationEventData {
	/**
	 * New orientation value.
	 */
	newValue: 'portrait' | 'landscape' | 'unknown';
}

/**
 * Represents a logical unit for navigation (inside Frame).
 */
export declare class Page extends ContentView {
	/**
	 * String value used when hooking to navigatingTo event.
	 */
	public static navigatingToEvent: string;

	/**
	 * String value used when hooking to navigatedTo event.
	 */
	public static navigatedToEvent: string;

	/**
	 * String value used when hooking to navigatingFrom event.
	 */
	public static navigatingFromEvent: string;

	/**
	 * String value used when hooking to navigatedFrom event.
	 */
	public static navigatedFromEvent: string;

	/**
	 * Gets or sets whether page background spans under status bar.
	 */
	public backgroundSpanUnderStatusBar: boolean;

	/**
	 * Gets or sets the style of the status bar.
	 */
	public statusBarStyle: 'light' | 'dark';

	/**
	 * Gets or sets the color of the status bar in Android.
	 */
	public androidStatusBarBackground: Color;

	/**
	 * Used to hide the Navigation Bar in iOS and the Action Bar in Android.
	 */
	public actionBarHidden: boolean;

	/**
	 * Used to control if swipe back navigation in iOS is enabled. This property is iOS specific. Default value: true
	 */
	public enableSwipeBackNavigation: boolean;

	/**
	 * Returns a CSS keyframe animation with the specified name, if it exists.
	 */
	public getKeyframeAnimationWithName(animationName: string): KeyframeAnimationInfo;

	/**
	 * A property that is used to pass a data from another page (while navigate to).
	 */
	public navigationContext: any;

	/**
	 * Gets the Frame object controlling this instance.
	 */
	public frame: Frame;

	/**
	 * Gets the ActionBar for this page.
	 */
	public actionBar: ActionBar;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	public on(eventNames: string, callback: (data: EventData) => void, thisArg?: any): void;

	/**
	 * Raised when navigation to the page has started.
	 */
	public on(event: 'navigatingTo', callback: (args: NavigatedData) => void, thisArg?: any): void;

	/**
	 * Raised when navigation to the page has finished.
	 */
	public on(event: 'navigatedTo', callback: (args: NavigatedData) => void, thisArg?: any): void;

	/**
	 * Raised when navigation from the page has started.
	 */
	public on(event: 'navigatingFrom', callback: (args: NavigatedData) => void, thisArg?: any): void;

	/**
	 * Raised when navigation from the page has finished.
	 */
	public on(event: 'navigatedFrom', callback: (args: NavigatedData) => void, thisArg?: any): void;
	//@private

	/**
	 * @private
	 */
	hasActionBar: boolean;
	/**
	 * @private
	 */
	_frame: Frame;

	/**
	 * A method called before navigating to the page.
	 * @private
	 * @param context - The data passed to the page through the NavigationEntry.context property.
	 * @param isBackNavigation - True if the Page is being navigated from using the Frame.goBack() method, false otherwise.
	 * @param bindingContext - An object to become the binding context of the page navigating to. Optional.
	 */
	public onNavigatingTo(context: any, isBackNavigation: boolean, bindingContext?: any): void;

	/**
	 * A method called after navigated to the page.
	 * @private
	 * @param isBackNavigation - True if the Page is being navigated from using the Frame.goBack() method, false otherwise.
	 */
	public onNavigatedTo(isBackNavigation: boolean): void;

	/**
	 * A method called before navigating from the page.
	 * @private
	 * @param isBackNavigation - True if the Page is being navigated from using the Frame.goBack() method, false otherwise.
	 */
	public onNavigatingFrom(isBackNavigation: boolean): void;

	/**
	 * A method called after navigated from the page.
	 * @private
	 * @param isBackNavigation - True if the Page is being navigated from using the Frame.goBack() method, false otherwise.
	 */
	public onNavigatedFrom(isBackNavigation: boolean): void;
	//@endprivate
}

/**
 * Defines a pair of values (horizontal and vertical) for translate and scale animations.
 */
declare interface Pair {
	x: number;
	y: number;
}

/**
 * Provides gesture event data for pan gesture.
 */
export declare interface PanGestureEventData extends GestureEventDataWithState {
	deltaX: number;
	deltaY: number;
}

/**
 * Provides information for a parser event.
 */
export declare interface ParserEvent {
	/**
	 * Returns the type of the parser event. This is one of the ParserEventType static members.
	 */
	eventType: string;

	/**
	 * Get the position in the xml string where the event was generated.
	 */
	position: Position;

	/**
	 * If namespace processing is enabled, returns the prefix of the element in case the eventType is ParserEventType.StartElement or ParserEventType.EndElement.
	 */
	prefix?: string;

	/**
	 *  If namespace processing is enabled, returns the namespace of the element in case the eventType is ParserEventType.StartElement or ParserEventType.EndElement.
	 */
	namespace?: string;

	/**
	 * Returns the name of the element in case the eventType is ParserEventType.StartElement or ParserEventType.EndElement.
	 */
	elementName?: string;

	/**
	 * Returns a JSON object with the attributes of an element in case the eventType is ParserEventType.StartElement.
	 */
	attributes?: Object;

	/**
	 * Returns the relevant data in case the eventType is ParserEventType.Text, ParserEventType.CDATA or ParserEventType.Comment.
	 */
	data?: string;

	/**
	 * Returns a JSON string representation of this instance.
	 */
	toString(): string;
} /** */

/**
 * Contains the XmlParser class, which is a SAX parser using the easysax implementation.
 * @module "xml"
 */ /**
 * Specifies the type of parser event.
 */
export declare class ParserEventType {
	/**
	 * Specifies the StartElement event type.
	 */
	static StartElement: string;

	/**
	 * Specifies the EndElement event type.
	 */
	static EndElement: string;

	/**
	 * Specifies the Text event type.
	 */
	static Text: string;

	/**
	 * Specifies the CDATA event type.
	 */
	static CDATA: string;

	/**
	 * Specifies the Comment event type.
	 */
	static Comment: string;
}

/**
 * Enables path-specific operations like join, extension, etc.
 */
export declare module path {
	/**
	 * Normalizes a path, taking care of occurrances like ".." and "//".
	 * @param path The path to be normalized.
	 */
	export function normalize(path: string): string;

	/**
	 * Joins all the provided string components, forming a valid and normalized path.
	 * @param paths An array of string components to be joined.
	 */
	export function join(...paths: string[]): string;

	/**
	 * Gets the string used to separate file paths.
	 */
	const separator: string;
}

/**
 * Denotes a normalized percent number.
 * 0% is represented as 0
 * 50% is represented as 0.5
 * 100% is represented as 1
 */
declare type percent = number;

declare type Percentage = Unit<'%'>;

declare type PercentLength = 'auto' | dip | LengthDipUnit | LengthPxUnit | LengthPercentUnit;

declare namespace PercentLength {
	function parse(text: string): PercentLength;
	function equals(a: PercentLength, b: PercentLength): boolean;
	/**
	 * Converts PercentLength unit to device pixels.
	 * @param length The PercentLength to convert.
	 * @param auto Value to use for conversion of "auto". By default is Math.NaN.
	 * @param parentAvailableWidth Value to use as base when converting percent unit. By default is Math.NaN.
	 */
	function toDevicePixels(length: PercentLength, auto?: number, parentAvailableWidth?: px): number;
	function convertToString(length: PercentLength): string;
}

/**
 * Provides gesture event data for pinch gesture.
 */
export declare interface PinchGestureEventData extends GestureEventDataWithState {
	scale: number;

	getFocusX(): number;
	getFocusY(): number;
}

/**
 * Represents a Placeholder, which is used to add a native view to the visual tree.
 */
export declare class Placeholder extends View {
	/**
	 * String value used when hooking to creatingView event.
	 */
	public static creatingViewEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (args: EventData) => void);

	/**
	 * Raised when a creatingView event occurs.
	 */
	on(event: 'creatingView', callback: (args: CreateViewEventData) => void);
}

/**
 * The Point interface describes a two dimensional location.
 * It has two properties x and y, representing the x and y coordinate of the location.
 */
declare interface Point {
	/**
	 * Represents the x coordinate of the location.
	 */
	x: number;

	/**
	 * Represents the y coordinate of the location.
	 */
	y: number;

	/**
	 * Represents the z coordinate of the location.
	 */
	z?: number;
}

/**
 * Defines a point in 3d space (x, y and z) for rotation in 3d animations.
 */
declare interface Point3D {
	x: number;
	y: number;
	z: number;
}

/**
 * Pointer is an object representing a finger (or other object) that is touching the screen.
 */
declare interface Pointer {
	/**
	 * The id of the pointer.
	 */
	android: any;

	/**
	 * The UITouch object associated to the touch
	 */
	ios: any;

	/**
	 * Gets the X coordinate of the pointer inside the view that triggered the event.
	 */
	getX(): number;

	/**
	 * Gets the Y coordinate of the pointer inside the view that triggered the event.
	 */
	getY(): number;

	/**
	 * Gests the X coordinate of the pointer inside the view that triggered the event.
	 * @returns The X coordinate in _Device Pixels_.
	 */
	getXPixels(): number;

	/**
	 * Gets the X coordinate of the pointer inside the view that triggered the event.
	 * @returns The X coordinate in _Device Independent Pixels_.
	 */
	getXDIP(): number;

	/**
	 * Gests the Y coordinate of the pointer inside the view that triggered the event.
	 * @returns The Y coordinate in _Device Pixels_.
	 */
	getYPixels(): number;

	/**
	 * Gets the Y coordinate of the pointer inside the view that triggered the event.
	 * @returns The Y coordinate in _Device Independent Pixels_.
	 */
	getYDIP(): number;
}

/**
 * Defines a position within string, in line and column form.
 */
declare interface Position {
	/**
	 * The line number. The first line is at index 1.
	 */
	line: number;

	/**
	 * The column number. The first character is at index 1.
	 */
	column: number;
}

/**
 * Method decorator factory. It will intercept the method call and start and pause a timer before and after the method call.
 * Works only if profiling is enabled.
 * @param name Name of the timer which will be used for method calls. If not provided - the name of the method will be used.
 */
declare function profile(name?: string): MethodDecorator;

/**
 * Function factory. It will intercept the function call and start and pause a timer before and after the function call. Works only if profiling is enabled.
 * Works only if profiling is enabled.
 * @param fn The function to wrap. Uses the function name to track the times.
 */
declare function profile<F extends Function>(fn: F): F;

/**
 * Function factory. It will intercept the function call and start and pause a timer before and after the function call. Works only if profiling is enabled.
 * @param name The name used to track calls and times.
 * @param fn The function to wrap.
 */
declare function profile<F extends Function>(name: string, fn: F): F;

/**
 * Method decorator. It will intercept the method calls and start and pause a timer before and after the method call. Works only if profiling is enabled.
 */
declare function profile<T>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;

declare function profile(): any;

export declare const Profiling: {
	enable: typeof enable;
	disable: typeof disable;
	time: typeof time;
	uptime: typeof uptime;
	start: typeof start;
	stop: typeof stop;
	isRunning: typeof isRunning;
	dumpProfiles: typeof dumpProfiles;
	resetProfiles: typeof resetProfiles;
	profile: typeof profile;
	startCPUProfile: typeof startCPUProfile;
	stopCPUProfile: typeof stopCPUProfile;
};

/**
 * Represents a progress component.
 */
export declare class Progress extends View {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/ProgressBar.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.ProgressBar */;

	/**
	 * Gets the native iOS [UIProgressView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIProgressView_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIProgressView */;

	/**
	 * Gets or sets a progress current value.
	 */
	value: number;

	/**
	 * Gets or sets a progress max value.
	 */
	maxValue: number;
}

declare class Property<T extends ViewBase, U> {
	constructor(options: PropertyOptions<T, U>);

	public readonly getDefault: symbol;
	public readonly setNative: symbol;
	public readonly defaultValue: U;
	public register(cls: { prototype: T }): void;
	public nativeValueChange(owner: T, value: U): void;
	public isSet(instance: T): boolean;
}

declare interface Property<T extends ViewBase, U> extends TypedPropertyDescriptor<U> {}

declare interface PropertyBag {
	[property: string]: string;
}

declare interface PropertyBagClass {
	new (): PropertyBag;
	prototype: PropertyBag;
}

/**
 * Data for the "propertyChange" event.
 */
export declare interface PropertyChangeData extends EventData {
	/**
	 * The name of the property that has changed.
	 */
	propertyName: string;
	/**
	 * The new value of the property.
	 */
	value: any;
	/**
	 * The previous value of the property.
	 */
	oldValue?: any;
}

declare interface PropertyOptions<T, U> {
	readonly name: string;
	readonly defaultValue?: U;
	readonly affectsLayout?: boolean;
	readonly equalityComparer?: (x: U, y: U) => boolean;
	readonly valueChanged?: (target: T, oldValue: U, newValue: U) => void;
	readonly valueConverter?: (value: string) => U;
}

export declare class ProxyViewContainer extends LayoutBase {}

/**
 * Denotes a length number that is in physical device pixels.
 */
declare type px = number;

/**
 * Releases the reference to the wrapped native object
 * @param object The Java/Objective-C object to release.
 */
declare function releaseNativeObject(object: any /*java.lang.Object | NSObject*/);

/**
 * Removes a value (if existing) for a key.
 * @param key The key to check for.
 */
declare function remove(key: string): void;

/**
 * Removes a TraceWriter instance from the trace module.
 * @param writer The TraceWriter instance to remove.
 */
declare function removeWriter(writer: TraceWriter);

/**
 * Represents a UI Repeater component.
 */
export declare class Repeater extends CustomLayoutView {
	/**
	 * Gets or set the items collection of the Repeater.
	 * The items property can be set to an array or an object defining length and getItem(index) method.
	 */
	items: any[] | ItemsSource_2;

	/**
	 * Gets or set the item template of the Repeater.
	 */
	itemTemplate: string | Template;

	/**
	 * Gets or set the items layout of the Repeater. Default value is StackLayout with orientation="vertical".
	 */
	itemsLayout: LayoutBase;

	/**
	 * Forces the Repeater to reload all its items.
	 */
	refresh();
}

/**
 * Makes a generic http request using the provided options and returns a HttpResponse Object.
 * @param options An object that specifies various request options.
 */
declare function request(options: HttpRequestOptions): Promise<HttpResponse>;

/**
 * Resets the timers for all methods instrumented with profile decorator.
 */
declare function resetProfiles(): void;

declare type ReturnKeyType = 'done' | 'next' | 'go' | 'search' | 'send';

/**
 * Provides gesture event data for rotation gesture.
 */
export declare interface RotationGestureEventData extends GestureEventDataWithState {
	rotation: number;
}

/**
 * Call this method to run the application. Important: All code after this method call will not be executed!
 * Compared to start this method won't create Frame as root view.
 */
declare function run(entry?: NavigationEntry | string);

/**
 * An object describing general information about a display.
 */
export declare module Screen {
	/**
	 * Gets information about the main screen of the current device.
	 */
	const mainScreen: ScreenMetrics;
}

/**
 * An object containing screen information.
 */
declare interface ScreenMetrics {
	/**
	 * Gets the absolute width of the screen in pixels.
	 */
	widthPixels: number;

	/**
	 * Gets the absolute height of the screen in pixels.
	 */
	heightPixels: number;

	/**
	 * Gets the absolute width of the screen in density independent pixels.
	 */
	widthDIPs: number;

	/**
	 * Gets the absolute height of the screen in density independent pixels.
	 */
	heightDIPs: number;

	/**
	 * The logical density of the display. This is a scaling factor for the Density Independent Pixel unit.
	 */
	scale: number;
}

export declare interface ScrollEventData extends EventData {
	scrollX: number;
	scrollY: number;
}

/**
 * Represents a scrollable area that can have content that is larger than its bounds.
 */
export declare class ScrollView extends ContentView {
	/**
	 * String value used when hooking to scroll event.
	 */
	public static scrollEvent: string;

	/**
	 * Gets or sets a value indicating whether scroll is enabled.
	 */
	isScrollEnabled: boolean;

	/**
	 * Gets a value that contains the vertical offset of the scrolled content.
	 */
	verticalOffset: number;

	/**
	 * Gets a value that contains the horizontal offset of the scrolled content.
	 */
	horizontalOffset: number;

	/**
	 * Gets the maximum value for the verticalOffset.
	 */
	scrollableHeight: number;

	/**
	 * Gets the maximum value for the horizontalOffset.
	 */
	scrollableWidth: number;

	/**
	 * Toggles scrollbar indicator visibility
	 */
	scrollBarIndicatorVisible: boolean;

	/**
	 * Scrolls the content the specified vertical offset position.
	 * @param value The offset value
	 * @param animated true for animated scroll, false for immediate scroll.
	 */
	scrollToVerticalOffset(value: number, animated: boolean);

	/**
	 * Scrolls the content the specified horizontal offset position.
	 * @param value The offset value
	 * @param animated true for animated scroll, false for immediate scroll.
	 */
	scrollToHorizontalOffset(value: number, animated: boolean);

	/**
	 * Gets or sets direction in which the content can be scrolled.
	 */
	orientation: Orientation;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a scroll event occurs.
	 */
	on(event: 'scroll', callback: (args: ScrollEventData) => void, thisArg?: any);

	_onOrientationChanged();
}

/**
 * Represents a search bar component.
 */
export declare class SearchBar extends View {
	/**
	 * String value used when hooking to submit event.
	 */
	public static submitEvent: string;

	/**
	 * String value used when hooking to clear event.
	 */
	public static clearEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/SearchView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.SearchView */;

	/**
	 * Gets the native iOS [UISearchBar](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISearchBar_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UISearchBar */;

	/**
	 * Gets or sets a search bar text.
	 */
	text: string;

	/**
	 * Gets or sets the text of the search bar text field hint/placeholder.
	 */
	hint: string;

	/**
	 * Gets or sets the TextField background color of the SearchBar component.
	 */
	textFieldBackgroundColor: Color;

	/**
	 * Gets or sets the TextField Hint color of the SearchBar component.
	 */
	textFieldHintColor: Color;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a search bar search is submitted.
	 */
	on(event: 'submit', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when a search bar search is closed.
	 */
	on(event: 'close', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Hides the soft input method, usually a soft keyboard.
	 */
	dismissSoftInput(): void;
}

/**
 * Represents a UI SegmentedBar component.
 */
export declare class SegmentedBar extends View implements AddChildFromBuilder, AddArrayFromBuilder {
	/**
	 * Gets or sets the selected index of the SegmentedBar component.
	 */
	selectedIndex: number;

	/**
	 * Gets or sets the selected background color of the SegmentedBar component.
	 */
	selectedBackgroundColor: Color;

	/**
	 * Gets or sets the items of the SegmentedBar.
	 */
	items: Array<SegmentedBarItem>;

	/**
	 * String value used when hooking to the selectedIndexChanged event.
	 */
	public static selectedIndexChangedEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when the selected index changes.
	 */
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData_3) => void, thisArg?: any);

	/**
	 * Called for every child element declared in xml.
	 * @param name - Name of the element.
	 * @param value - Value of the element.
	 */
	public _addChildFromBuilder(name: string, value: any): void;
	public _addArrayFromBuilder(name: string, value: Array<any>): void;
}

/**
 * Represents a SegmentedBar item.
 */
export declare class SegmentedBarItem extends ViewBase {
	/**
	 * Gets or sets the title of the SegmentedBarItem.
	 */
	public title: string;
}

/**
 * Defines the data for the TabView.selectedIndexChanged event.
 */
export declare interface SelectedIndexChangedEventData extends EventData {
	/**
	 * The old selected index.
	 */
	oldIndex: number;

	/**
	 * The new selected index.
	 */
	newIndex: number;
}

/**
 * Defines the data for the tab navigation selectedIndexChanged event.
 */
declare interface SelectedIndexChangedEventData_2 extends EventData {
	/**
	 * The old selected index.
	 */
	oldIndex: number;

	/**
	 * The new selected index.
	 */
	newIndex: number;
}

/**
 * Defines the data for the SegmentedBar.selectedIndexChanged event.
 */
declare interface SelectedIndexChangedEventData_3 extends EventData {
	/**
	 * The old selected index.
	 */
	oldIndex: number;

	/**
	 * The new selected index.
	 */
	newIndex: number;
}

/**
 * Defines the data for the TabView.selectedIndexChanged event.
 */
declare interface SelectedIndexChangedEventData_4 extends EventData {
	/**
	 * The old selected index.
	 */
	oldIndex: number;

	/**
	 * The new selected index.
	 */
	newIndex: number;
}

/**
 * Sets a Boolean Object for a key.
 * @param key The key.
 * @param value The value.
 */
declare function setBoolean(key: string, value: boolean): void;

/**
 * Sets the categories the module will trace.
 * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
 */
declare function setCategories(categories: string);

/**
 * Sets css file name for the application.
 */
declare function setCssFileName(cssFile: string): void;

declare function setErrorHandler(handler: ErrorHandler);

/**
 * Sets a Number Object for a key.
 * @param key The key.
 * @param value The value.
 */
declare function setNumber(key: string, value: number): void;

/**
 * Set application level static resources.
 */
declare function setResources(resources: any): void;

/**
 * Sets a String Object for a key.
 * @param key The key.
 * @param value The value.
 */
declare function setString(key: string, value: string): void;

export declare interface ShowModalOptions {
	/**
	 * Any context you want to pass to the modally shown view. This same context will be available in the arguments of the shownModally event handler.
	 */
	context: any;

	/**
	 * A function that will be called when the view is closed. Any arguments provided when calling ShownModallyData.closeCallback will be available here.
	 */
	closeCallback: Function;

	/**
	 * An optional parameter specifying whether to show the modal view in full-screen mode.
	 */
	fullscreen?: boolean;

	/**
	 * An optional parameter specifying whether to show the modal view with animation.
	 */
	animated?: boolean;

	/**
	 * An optional parameter specifying whether to stretch the modal view when not in full-screen mode.
	 */
	stretched?: boolean;

	/**
	 * An optional parameter that specify options specific to iOS as an object.
	 */
	ios?: {
		/**
		 * The UIModalPresentationStyle to be used when showing the dialog in iOS .
		 */
		presentationStyle?: any /* UIModalPresentationStyle */;
		/**
		 * width of the popup dialog
		 */
		width?: number;
		/**
		 * height of the popup dialog
		 */
		height?: number;
	};
	android?: {
		/**
		 * @deprecated Use ShowModalOptions.cancelable instead.
		 * An optional parameter specifying whether the modal view can be dismissed when not in full-screen mode.
		 */
		cancelable?: boolean;
	};
	/**
	 * An optional parameter specifying whether the modal view can be dismissed when not in full-screen mode.
	 */
	cancelable?: boolean;
}

/**
 * Defines the data for the shownModally event.
 */
export declare interface ShownModallyData extends EventData {
	/**
	 * The context (optional, may be undefined) passed to the view when shown modally.
	 */
	context?: any;

	/**
	 * A callback to call when you want to close the modally shown view.
	 * Pass in any kind of arguments and you will receive when the callback parameter
	 * of View.showModal is executed.
	 */
	closeCallback?: Function;
}

/**
 * The Size interface describes abstract dimensions in two dimensional space.
 * It has two properties width and height, representing the width and height values of the size.
 */
declare interface Size {
	/**
	 * Represents the width of the size.
	 */
	width: number;

	/**
	 * Represents the height of the size.
	 */
	height: number;
}

/**
 * Represents a slider component.
 */
export declare class Slider extends View {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/SeekBar.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.SeekBar */;

	/**
	 * Gets the native iOS [UISlider](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISlider_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UISlider */;

	/**
	 * Gets or sets a slider current value. The default value is 0.
	 */
	value: number;

	/**
	 * Gets or sets a slider min value. The default value is 0.
	 */
	minValue: number;

	/**
	 * Gets or sets a slider max value. The default value is 100.
	 */
	maxValue: number;
}

/**
 * A class used to create a single part of formatted string with a common text properties.
 */
export declare class Span extends ViewBase {
	/**
	 * Gets or sets the font family of the span.
	 */
	public fontFamily: string;

	/**
	 * Gets or sets the font size of the span.
	 */
	public fontSize: number;

	/**
	 * Gets or sets the font style of the span.
	 */
	public fontStyle: FontStyle;

	/**
	 * Gets or sets the font weight of the span.
	 */
	public fontWeight: FontWeight;

	/**
	 * Gets or sets text decorations for the span.
	 */
	public textDecoration: TextDecoration;

	/**
	 * Gets or sets the font foreground color of the span.
	 */
	public color: Color;

	/**
	 * Gets or sets the font background color of the span.
	 */
	public backgroundColor: Color;

	/**
	 * Gets or sets the text for the span.
	 */
	public text: string;
	/**
	 * String value used when hooking to linkTap event.
	 */
	public static linkTapEvent: string;

	/**
	 * Gets if the span is tappable or not.
	 */
	public readonly tappable: boolean;

	//@private
	/**
	 * @private
	 */
	_setTextInternal(value: string): void;
	//@endprivate
}

/**
 * A Layout that arranges its children horizontally or vertically. The direction can be set by orientation property.
 */
export declare class StackLayout extends LayoutBase {
	/**
	 * Gets or sets if layout should be horizontal or vertical.
	 * The default value is vertical.
	 */
	orientation: Orientation_2;
}

/**
 * Starts a timer with a specific name.
 * Works only if profiling is enabled.
 * @param name Name of the timer.
 */
declare function start(name: string): void;

/**
 * Starts android cpu profiling.
 * @param name Name of the cpu profiling session.
 */
declare function startCPUProfile(name: string): void;

/**
 * Starts monitoring the connection type.
 * @param connectionTypeChangedCallback A function that will be called when the connection type changes.
 */
declare function startMonitoring(connectionTypeChangedCallback: (newConnectionType: number) => void): void;

/**
 * Pauses a timer with a specific name. This will increase call count and accumulate time.
 * Works only if profiling is enabled.
 * @param name Name of the timer.
 * @returns TimerInfo for the paused timer.
 */
declare function stop(name: string): TimerInfo;

/**
 * Stops android cpu profiling.
 * @param name Name of the cpu profiling session.
 */
declare function stopCPUProfile(name: string): void;

/**
 * Stops monitoring the connection type.
 */
declare function stopMonitoring(): void;

declare type Stretch = 'none' | 'aspectFill' | 'aspectFit' | 'fill';

export declare class Style extends Observable {
	public fontInternal: Font;
	public backgroundInternal: Background;

	public rotate: number;
	public rotateX: number;
	public rotateY: number;
	public perspective: number;
	public scaleX: number;
	public scaleY: number;
	public translateX: dip;
	public translateY: dip;

	public clipPath: string;
	public color: Color;
	public tintColor: Color;
	public placeholderColor: Color;

	public background: string;
	public backgroundColor: Color;
	public backgroundImage: string | LinearGradient;
	public backgroundRepeat: BackgroundRepeat;
	public backgroundSize: string;
	public backgroundPosition: string;

	public borderColor: string | Color;
	public borderTopColor: Color;
	public borderRightColor: Color;
	public borderBottomColor: Color;
	public borderLeftColor: Color;
	public borderWidth: string | Length;
	public borderTopWidth: Length;
	public borderRightWidth: Length;
	public borderBottomWidth: Length;
	public borderLeftWidth: Length;
	public borderRadius: string | Length;
	public borderTopLeftRadius: Length;
	public borderTopRightRadius: Length;
	public borderBottomRightRadius: Length;
	public borderBottomLeftRadius: Length;

	public fontSize: number;
	public fontFamily: string;
	public fontStyle: FontStyle;
	public fontWeight: FontWeight;
	public font: string;

	public androidElevation: number;
	public androidDynamicElevationOffset: number;
	public zIndex: number;
	public opacity: number;
	public visibility: Visibility;

	public letterSpacing: number;
	public lineHeight: number;
	public textAlignment: TextAlignment;
	public textDecoration: TextDecoration;
	public textTransform: TextTransform;
	public whiteSpace: WhiteSpace;

	public minWidth: Length;
	public minHeight: Length;
	public width: PercentLength;
	public height: PercentLength;
	public margin: string | PercentLength;
	public marginLeft: PercentLength;
	public marginTop: PercentLength;
	public marginRight: PercentLength;
	public marginBottom: PercentLength;
	public padding: string | Length;
	public paddingLeft: Length;
	public paddingTop: Length;
	public paddingRight: Length;
	public paddingBottom: Length;
	public horizontalAlignment: HorizontalAlignment;
	public verticalAlignment: VerticalAlignment;

	// TabView-specific props
	public tabTextFontSize: number;
	public tabTextColor: Color;
	public tabBackgroundColor: Color;
	public selectedTabTextColor: Color;
	public androidSelectedTabHighlightColor: Color;

	// ListView-specific props
	public separatorColor: Color;

	// SegmentedBar-specific props
	public selectedBackgroundColor: Color;

	// Page-specific props
	public statusBarStyle: 'light' | 'dark';
	public androidStatusBarBackground: Color;

	// Android ActionBar specific props

	/**
	 * Gets or sets the content inset for the android actionbar.
	 * The content inset affects the valid area for ActionBar content; insets can be used to effectively align ActionBar content along well-known gridlines.
	 *
	 * This property is effective on Android API level 21 or later.
	 */
	public androidContentInset: string | Length;

	/**
	 * Gets or sets the left content inset for the android actionbar.
	 * The content inset affects the valid area for ActionBar content; insets can be used to effectively align ActionBar content along well-known gridlines.
	 *
	 * This property is effective on Android API level 21 or later.
	 */
	public androidContentInsetLeft: Length;

	/**
	 * Gets or sets the right content inset for the android actionbar.
	 * The content inset affects the valid area for ActionBar content; insets can be used to effectively align ActionBar content along well-known gridlines.
	 *
	 * This property is effective on Android API level 21 or later.
	 */
	public androidContentInsetRight: Length;

	constructor(ownerView: ViewBase | WeakRef<ViewBase>);
	public viewRef: WeakRef<ViewBase>;

	/**
	 * @deprecated use `viewRef` instead.
	 *
	 * The `ViewBase` object associated with the Style!
	 */
	public view: ViewBase;

	//flexbox layout properties
	public flexDirection: FlexDirection;
	public flexWrap: FlexWrap;
	public justifyContent: JustifyContent;
	public alignItems: AlignItems;
	public alignContent: AlignContent;
	public order: Order;
	public flexGrow: FlexGrow;
	public flexShrink: FlexShrink;
	public flexWrapBefore: FlexWrapBefore;
	public alignSelf: AlignSelf;

	/**
	 * The property bag is a simple class that is paired with the Style class.
	 * Setting regular css properties on the PropertyBag should simply preserve their values.
	 * Setting shorthand css properties on the PropertyBag should decompose the provided value, and set each of the shorthand composite properties.
	 * The shorthand properties are defined as non-enumerable so it should be safe to for-in the keys that are set in the bag.
	 */
	public readonly PropertyBag: PropertyBagClass;

	/**
	 * Set a scoped css-value. These are css-variables set from CssState
	 */
	public setScopedCssVariable(varName: string, value: string): void;

	/**
	 * Set a unscoped css-value. These are css-variables set on view.style
	 */
	public setUnscopedCssVariable(varName: string, value: string): void;

	/**
	 * Get value of the css-variable.
	 * If the value is not set on this style-object, try the parent view.
	 */
	public getCssVariable(varName: string): string | null;

	/**
	 * Remove all scoped css-variables
	 */
	public resetScopedCssVariables(): void;

	/**
	 * Remove all unscoped css-variables
	 */
	public resetUnscopedCssVariables(): void;
}

/**
 * Defines an enum for swipe gesture direction.
 */
export declare enum SwipeDirection {
	/**
	 * Denotes right direction for swipe gesture.
	 */
	right,
	/**
	 * Denotes left direction for swipe gesture.
	 */
	left,
	/**
	 * Denotes up direction for swipe gesture.
	 */
	up,
	/**
	 * Denotes down direction for swipe gesture.
	 */
	down,
}

/**
 * Provides gesture event data for swipe gesture.
 */
export declare interface SwipeGestureEventData extends GestureEventData {
	direction: SwipeDirection;
}

/**
 * Represents a switch component.
 */
export declare class Switch extends View {
	public static checkedChangeEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/Switch.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.Switch */;

	/**
	 * Gets the native iOS [UISwitch](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UISwitch_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UISwitch */;

	/**
	 * Gets or sets if a switch is checked or not.
	 */
	checked: boolean;

	/**
	 * Gets or sets the background color of the Switch when it is turned off.
	 */
	offBackgroundColor: Color;
}

/**
 * Event data containing information for system appearance changed event.
 */
declare interface SystemAppearanceChangedEventData extends ApplicationEventData {
	/**
	 * New system appearance value.
	 */
	newValue: 'light' | 'dark';
}

/**
 * Represents a tab navigation content entry.
 */
export declare class TabContentItem extends ContentView {
	/**
	 * @private
	 */
	canBeLoaded?: boolean;
}

/**
 * Serves as a base class for tab navigation.
 */
export declare class TabNavigationBase extends View {
	/**
	 * Gets or sets the items of the tab navigation.
	 */
	items: Array<TabContentItem>;

	/**
	 * Gets or sets the tab strip of the tab navigation.
	 */
	tabStrip: TabStrip;

	/**
	 * Gets or sets the selectedIndex of the tab navigation.
	 */
	selectedIndex: number;

	/**
	 * Gets the native android widget that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.view.View */; //android.support.v4.view.ViewPager;

	/**
	 * Gets the native iOS widget that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITabBarController */;

	/**
	 * String value used when hooking to the selectedIndexChanged event.
	 */
	public static selectedIndexChangedEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when the selected index changes.
	 */
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData_2) => void, thisArg?: any);

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	onItemsChanged(oldItems: TabContentItem[], newItems: TabContentItem[]): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	onSelectedIndexChanged(oldIndex: number, newIndex: number): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarBackgroundColor(): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarBackgroundArgbColor(): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarBackgroundColor(value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarColor(): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarColor(value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarFontInternal(): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarFontInternal(value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarTextTransform(): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarTextTransform(value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarHighlightColor(): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarHighlightColor(value: any);

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarSelectedItemColor(): Color;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarSelectedItemColor(value: Color);

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarUnSelectedItemColor(): Color;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarUnSelectedItemColor(value: Color);

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarItemTitle(tabStripItem: TabStripItem, value: any): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarItemBackgroundColor(tabStripItem: TabStripItem): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarItemBackgroundColor(tabStripItem: TabStripItem, value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarItemColor(tabStripItem: TabStripItem): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarItemColor(tabStripItem: TabStripItem, value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarIconColor(tabStripItem: TabStripItem, value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarIconSource(tabStripItem: TabStripItem, value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarItemFontSize(tabStripItem: TabStripItem): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarItemFontSize(tabStripItem: TabStripItem, value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarItemFontInternal(tabStripItem: TabStripItem): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarItemFontInternal(tabStripItem: TabStripItem, value: any): void;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	getTabBarItemTextTransform(tabStripItem: TabStripItem): any;

	/**
	 * @private
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	setTabBarItemTextTransform(tabStripItem: TabStripItem, value: any): void;
}

/**
 * Represents a swipeable tabs view.
 */
export declare class Tabs extends TabNavigationBase {
	/**
	 * Gets or sets the items of the Tabs.
	 */
	items: Array<TabContentItem>;

	/**
	 * Gets or sets the tab strip of the Tabs.
	 */
	tabStrip: TabStrip;

	/**
	 * Gets or sets the selectedIndex of the Tabs.
	 */
	selectedIndex: number;

	/**
	 * Gets or sets the swipe enabled state of the Tabs.
	 */
	swipeEnabled: boolean;

	/**
	 * Gets or sets the number of offscreen preloaded tabs of the Tabs.
	 */
	offscreenTabLimit: number;

	/**
	 * Gets or sets the position state of the Tabs.
	 */
	tabsPosition: 'top' | 'bottom';

	/**
	 * Gets or set the MDCTabBarAlignment of the tab bar icons in iOS. Defaults to "justified"
	 * Valid values are:
	 *  - leading
	 *  - justified
	 *  - center
	 *  - centerSelected
	 */
	iOSTabBarItemsAlignment: IOSTabBarItemsAlignment;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/support/v4/view/ViewPager.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.view.View */; //android.support.v4.view.ViewPager;

	/**
	 * Gets the native iOS [UITabBarController](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarController_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITabBarController */;

	/**
	 * String value used when hooking to the selectedIndexChanged event.
	 */
	public static selectedIndexChangedEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when the selected index changes.
	 */
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData_2) => void, thisArg?: any);
}

/**
 * Represents a tab strip.
 */
export declare class TabStrip extends View {
	/**
	 * Gets or sets the items of the tab strip.
	 */
	items: Array<TabStripItem>;

	/**
	 * Gets or sets whether icon size should be fixed based on specs or use the actual size. Defaults to true(fixed).
	 */
	isIconSizeFixed: boolean;

	/**
	 * Gets or sets the icon rendering mode on iOS
	 */
	iosIconRenderingMode: 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

	/**
	 * Gets or sets the color that marks the selected tab of the tab strip. Works for Tabs component only.
	 */
	highlightColor: Color;

	/**
	 * Gets or sets the color of the selected item in the tab strip.
	 */
	selectedItemColor: Color;

	/**
	 * Gets or sets the color of the non-selected items in the tab strip.
	 */
	unSelectedItemColor: Color;

	/**
	 * @private
	 */
	_hasImage: boolean;

	/**
	 * @private
	 */
	_hasTitle: boolean;

	/**
	 * String value used when hooking to itemTap event.
	 */
	public static itemTapEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when an TabStripItem is tapped.
	 */
	on(event: 'itemTap', callback: (args: TabStripItemEventData) => void, thisArg?: any);
}

/**
 * Represents a tab strip entry.
 */
export declare class TabStripItem extends View {
	/**
	 * Gets or sets the title of the tab strip entry.
	 */
	title: string;

	/**
	 * Gets or sets the CSS class name of the icon in the tab strip entry.
	 */
	iconClass: string;

	/**
	 * Gets or sets the icon source of the tab strip entry.
	 */
	iconSource: string;

	/**
	 * Gets or sets the label of the tab strip entry.
	 */
	label: Label;

	/**
	 * Gets or sets the image of the tab strip entry.
	 */
	image: Image;

	/**
	 * String value used when hooking to the tap event.
	 */
	public static tapEvent: string;

	//@private

	/**
	 * @private
	 */
	_index: number;

	/**
	 * @private
	 */
	static selectEvent: string;

	/**
	 * @private
	 */
	static unselectEvent: string;
	//@endprivate

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void);

	/**
	 * Raised when a tap event occurs.
	 */
	on(event: 'tap', callback: (args: EventData) => void);
}

/**
 * Event data containing information for the TabStripItem's index.
 */
export declare interface TabStripItemEventData extends EventData {
	/**
	 * The index of the TabStripItem.
	 */
	index: number;
}

/**
 * Represents a tab view.
 */
export declare class TabView extends View {
	/**
	 * Gets or sets the items of the TabView.
	 */
	items: Array<TabViewItem>;

	/**
	 * Gets or sets the selectedIndex of the TabView.
	 */
	selectedIndex: number;

	/**
	 * Gets or sets the font size of the tabs titles.
	 */
	tabTextFontSize: number;

	/**
	 * Gets or sets the text color of the tabs titles.
	 */
	tabTextColor: Color;

	/**
	 * Gets or sets the background color of the tabs.
	 */
	tabBackgroundColor: Color;

	/**
	 * Gets or sets the text color of the selected tab title.
	 */
	selectedTabTextColor: Color;

	/**
	 * Gets or sets the color of the horizontal line drawn below the currently selected tab on Android.
	 */
	androidSelectedTabHighlightColor: Color;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/support/v4/view/ViewPager.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.view.View */; //androidx.core.view.ViewPager;

	/**
	 * Gets the native iOS [UITabBarController](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITabBarController_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITabBarController */;

	/**
	 * Gets or set the UIImageRenderingMode of the tab icons in iOS.  Defaults to "automatic"
	 * Valid values are:
	 *  - automatic
	 *  - alwaysOriginal
	 *  - alwaysTemplate
	 */
	iosIconRenderingMode: 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

	/**
	 * Gets or sets the number of tabs that should be retained to either side of the current tab in the view hierarchy in an idle state.
	 * Tabs beyond this limit will be recreated from the TabView when needed.
	 */
	androidOffscreenTabLimit: number;

	/**
	 * Gets or set the tabs vertical position.
	 * Valid values are:
	 *  - top
	 *  - bottom
	 */
	androidTabsPosition: 'top' | 'bottom';

	/**
	 * Gets or sets a value indicating whether swipe gesture is enabled for Android.
	 */
	androidSwipeEnabled: boolean;

	/**
	 * String value used when hooking to the selectedIndexChanged event.
	 */
	public static selectedIndexChangedEvent: string;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when the selected index changes.
	 */
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData_4) => void, thisArg?: any);
}

/**
 * Represents a tab view entry.
 */
export declare class TabViewItem extends ViewBase {
	/**
	 * Gets or sets the title of the TabViewItem.
	 */
	public title: string;

	/**
	 * Gets or sets the view of the TabViewItem.
	 */
	public view: View;

	/**
	 * Gets or sets the icon source of the TabViewItem. This could either be a a file name or resource id.
	 */
	public iconSource: string;

	/**
	 * Gets or sets the text transform of the tab titles.
	 */
	textTransform: TextTransform;

	/**
	 * @private
	 */
	canBeLoaded?: boolean;
}

/**
 * Provides gesture event data.
 */
export declare interface TapGestureEventData extends GestureEventData {
	/**
	 * Gets the number of pointers in the event.
	 */
	getPointerCount(): number;
	/**
	 * Gets the X coordinate of this event inside the view that triggered the event
	 */
	getX(): number;
	/**
	 * Gets the Y coordinate of the event inside the view that triggered the event.
	 */
	getY(): number;
}

/**
 * Defines an interface for a View factory function.
 * Commonly used to specify the visualization of data objects.
 */
export declare interface Template {
	/**
	 * Call signature of the factory function.
	 * Returns a new View instance.
	 */
	(): View;
}

export declare interface TemplatedItemsView {
	items: any[] | ItemsSource;
	itemTemplate: string | Template;
	itemTemplates?: string | Array<KeyedTemplate>;
	refresh(): void;
	on(event: 'itemLoading', callback: (args: ItemEventData) => void, thisArg?: any);
	off(event: 'itemLoading', callback: (args: EventData) => void, thisArg?: any);
}

declare type TextAlignment = 'initial' | 'left' | 'center' | 'right';

export declare class TextBase extends View implements AddChildFromBuilder {
	/**
	 * Gets of the text widget. In some cases(android TextInputLayout) the TextView is made of 2 views: the layout and the text view
	 * So we need a different getter for the layout and text functions
	 */
	public readonly nativeTextViewProtected: any;

	/**
	 * Gets or sets the text.
	 */
	text: string;

	/**
	 * Gets or sets a formatted string.
	 */
	formattedText: FormattedString;

	/**
	 * Gets or sets font-size style property.
	 */
	fontSize: number;

	/**
	 * Gets or sets letterSpace style property.
	 */
	letterSpacing: number;

	/**
	 * Gets or sets lineHeight style property.
	 */
	lineHeight: number;

	/**
	 * Gets or sets text-alignment style property.
	 */
	textAlignment: TextAlignment;

	/**
	 * Gets or sets text decorations style property.
	 */
	textDecoration: TextDecoration;

	/**
	 * Gets or sets text transform style property.
	 */
	textTransform: TextTransform;

	/**
	 * Gets or sets white space style property.
	 */
	whiteSpace: WhiteSpace;

	/**
	 * Gets or sets padding style property.
	 */
	padding: string | Length;

	/**
	 * Specify the bottom padding of this layout.
	 */
	paddingBottom: Length;

	/**
	 * Specify the left padding of this layout.
	 */
	paddingLeft: Length;

	/**
	 * Specify the right padding of this layout.
	 */
	paddingRight: Length;

	/**
	 * Specify the top padding of this layout.
	 */
	paddingTop: Length;

	/**
	 * Called for every child element declared in xml.
	 * This method will add a child element (value) to current element.
	 * @private
	 * @param name - Name of the element.
	 * @param value - Value of the element.
	 */
	_addChildFromBuilder(name: string, value: any): void;

	//@private
	/**
	 * Called when the text property is changed to request layout.
	 * @private
	 */
	_requestLayoutOnTextChanged(): void;

	/**
	 * @private
	 */
	_setNativeText(reset?: boolean): void;

	/**
	 * @private
	 */
	_isSingleLine: boolean;
	//@endprivate
}

declare type TextDecoration = 'none' | 'underline' | 'line-through' | 'underline line-through';

/**
 * Represents an editable text field.
 */
export declare class TextField extends EditableTextBase {
	public static returnPressEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/EditText.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.EditText */;

	/**
	 * Gets the native iOS [UITextField](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextField_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITextField */;

	/**
	 * Gets or sets if a text field is for password entry.
	 */
	secure: boolean;

	/**
	 * Gets or sets if a text field should dismiss on return.
	 */
	closeOnReturn: boolean;

	/**
	 * iOS only (to avoid 12+ auto suggested strong password handling)
	 */
	secureWithoutAutofill: boolean;
}

declare type TextTransform = 'initial' | 'none' | 'capitalize' | 'uppercase' | 'lowercase';

/**
 * Represents an editable multiline text view.
 */
export declare class TextView extends EditableTextBase {
	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/widget/EditText.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.EditText */;

	/**
	 * Gets the native iOS [UITextView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UITextView_Class/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UITextView */;

	/**
	 * Limits input to a certain number of lines.
	 */
	maxLines: number;
}

/**
 * Gets accurate system timestamp in ms.
 */
declare function time(): number;

/**
 * Represents an time picker.
 */
export declare class TimePicker extends View {
	/**
	 * Gets the native [android.widget.TimePicker](http://developer.android.com/reference/android/widget/TimePicker.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.widget.TimePicker */;

	/**
	 * Gets the native iOS [UIDatePicker](http://developer.apple.com/library/prerelease/ios/documentation/UIKit/Reference/UIDatePicker_Class/index.html) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* UIDatePicker */;

	/**
	 * Gets or sets the time hour.
	 */
	hour: number;

	/**
	 * Gets or sets the time minute.
	 */
	minute: number;

	/**
	 * Gets or sets the time.
	 */
	time: Date;

	/**
	 * Gets or sets the max time hour.
	 */
	maxHour: number;

	/**
	 * Gets or sets the max time minute.
	 */
	maxMinute: number;

	/**
	 * Gets or sets the min time hour.
	 */
	minHour: number;

	/**
	 * Gets or sets the min time minute.
	 */
	minMinute: number;

	/**
	 * Gets or sets the minute interval.
	 */
	minuteInterval: number;
} /** */

/**
 * Contains contains utility methods for profiling.
 * All methods in this module are experimental and may be changed in a non-major version.
 * @module "profiling"
 */ export declare interface TimerInfo {
	totalTime: number;
	count: number;
}

/**
 * Provides gesture event data.
 */
export declare interface TouchGestureEventData extends TapGestureEventData {
	/**
	 * Gets action of the touch. Possible values: 'up', 'move', 'down', 'cancel'
	 */
	action: 'up' | 'move' | 'down' | 'cancel';
	/**
	 * Gets the pointers that triggered the event.
	 * Note: In Android there is aways only one active pointer.
	 */
	getActivePointers(): Array<Pointer>;

	/**
	 * Gets all pointers.
	 */
	getAllPointers(): Array<Pointer>;
}

export declare const Trace: {
	messageType: typeof messageType;
	categories: typeof categories;
	setCategories: typeof setCategories;
	addCategories: typeof addCategories;
	addWriter: typeof addWriter;
	removeWriter: typeof removeWriter;
	clearWriters: typeof clearWriters;
	setErrorHandler: typeof setErrorHandler;
	write: typeof write;
	error: typeof error;
	enable: typeof enable_2;
	disable: typeof disable_2;
	isEnabled: typeof isEnabled;
};

/**
 * An interface used to define a writer used by trace to print (log).
 */
export declare interface TraceWriter {
	write(message: any, category: string, type?: number);
}

export declare class Transition {
	constructor(duration: number, nativeCurve: any);
	public getDuration(): number;
	public getCurve(): any;
	public animateIOSTransition(containerView: any, fromView: any, toView: any, operation: any, completion: (finished: boolean) => void): void;
	public createAndroidAnimator(transitionType: string): any;
	public toString(): string;
}

/**
 * Event data containing information about unhandled application errors.
 */
export declare interface UnhandledErrorEventData extends ApplicationEventData {
	ios?: NativeScriptError;
	android?: NativeScriptError;
	error: NativeScriptError;
}

declare interface Unit<T> {
	value: number;
	unit: string;
}

declare type UpdateTextTrigger = 'focusLost' | 'textChanged';

/**
 * Gets the uptime of the current process in milliseconds.
 */
declare function uptime(): number;

export declare const Utils: {
	GC: typeof GC;
	isFontIconURI: typeof isFontIconURI;
	isDataURI: typeof isDataURI;
	isFileOrResourcePath: typeof isFileOrResourcePath;
	executeOnMainThread: typeof executeOnMainThread;
	mainThreadify: typeof mainThreadify;
	isMainThread: typeof isMainThread;
	dispatchToMainThread: typeof dispatchToMainThread;
	releaseNativeObject: typeof releaseNativeObject;
	getModuleName: typeof getModuleName;
	openFile: typeof openFile;
	openUrl: typeof openUrl;
	isRealDevice: typeof isRealDevice;
	layout: typeof layout;
	android: typeof ad;
	ios: typeof ios;
};

declare type VerticalAlignment = 'top' | 'middle' | 'bottom' | 'stretch';

/**
 * This class is the base class for all UI components.
 * A View occupies a rectangular area on the screen and is responsible for drawing and layouting of all UI components within.
 */
export declare abstract class View extends ViewBase {
	/**
	 * String value used when hooking to layoutChanged event.
	 */
	public static layoutChangedEvent: string;
	/**
	 * String value used when hooking to showingModally event.
	 */
	public static showingModallyEvent: string;

	/**
	 * String value used when hooking to shownModally event.
	 */
	public static shownModallyEvent: string;

	/**
	 * Gets the android-specific native instance that lies behind this proxy. Will be available if running on an Android platform.
	 */
	public android: any;

	/**
	 * Gets the ios-specific native instance that lies behind this proxy. Will be available if running on an iOS platform.
	 */
	public ios: any;

	/**
	 * Gets or sets the binding context of this instance. This object is used as a source for each Binding that does not have a source object specified.
	 */
	bindingContext: any;

	/**
	 * Gets or sets the border color of the view.
	 */
	borderColor: string | Color;

	/**
	 * Gets or sets the top border color of the view.
	 */
	borderTopColor: Color;

	/**
	 * Gets or sets the right border color of the view.
	 */
	borderRightColor: Color;

	/**
	 * Gets or sets the bottom border color of the view.
	 */
	borderBottomColor: Color;

	/**
	 * Gets or sets the left border color of the view.
	 */
	borderLeftColor: Color;

	/**
	 * Gets or sets the border width of the view.
	 */
	borderWidth: string | Length;

	/**
	 * Gets or sets the top border width of the view.
	 */
	borderTopWidth: Length;

	/**
	 * Gets or sets the right border width of the view.
	 */
	borderRightWidth: Length;

	/**
	 * Gets or sets the bottom border width of the view.
	 */
	borderBottomWidth: Length;

	/**
	 * Gets or sets the left border width of the view.
	 */
	borderLeftWidth: Length;

	/**
	 * Gets or sets the border radius of the view.
	 */
	borderRadius: string | Length;

	/**
	 * Gets or sets the top left border radius of the view.
	 */
	borderTopLeftRadius: Length;

	/**
	 * Gets or sets the top right border radius of the view.
	 */
	borderTopRightRadius: Length;

	/**
	 * Gets or sets the bottom right border radius of the view.
	 */
	borderBottomRightRadius: Length;

	/**
	 * Gets or sets the bottom left border radius of the view.
	 */
	borderBottomLeftRadius: Length;

	/**
	 * Gets or sets the color of the view.
	 */
	color: Color;

	/**
	 * Gets or sets the elevation of the android view.
	 */
	androidElevation: number;

	/**
	 * Gets or sets the dynamic elevation offset of the android view.
	 */
	androidDynamicElevationOffset: number;

	/**
	 * Gets or sets the background style property.
	 */
	background: string;

	/**
	 * Gets or sets the background color of the view.
	 */
	backgroundColor: string | Color;

	/**
	 * Gets or sets the background image of the view.
	 */
	backgroundImage: string | LinearGradient;

	/**
	 * Gets or sets the minimum width the view may grow to.
	 */
	minWidth: Length;

	/**
	 * Gets or sets the minimum height the view may grow to.
	 */
	minHeight: Length;

	/**
	 * Gets or sets the desired width of the view.
	 */
	width: PercentLength;

	/**
	 * Gets or sets the desired height of the view.
	 */
	height: PercentLength;

	/**
	 * Gets or sets margin style property.
	 */
	margin: string | PercentLength;

	/**
	 * Specifies extra space on the left side of this view.
	 */
	marginLeft: PercentLength;

	/**
	 * Specifies extra space on the top side of this view.
	 */
	marginTop: PercentLength;

	/**
	 * Specifies extra space on the right side of this view.
	 */
	marginRight: PercentLength;

	/**
	 * Specifies extra space on the bottom side of this view.
	 */
	marginBottom: PercentLength;

	/**
	 * Gets or sets the alignment of this view within its parent along the Horizontal axis.
	 */
	horizontalAlignment: HorizontalAlignment;

	/**
	 * Gets or sets the alignment of this view within its parent along the Vertical axis.
	 */
	verticalAlignment: VerticalAlignment;

	/**
	 * Gets or sets the visibility of the view.
	 */
	visibility: Visibility;

	/**
	 * Gets or sets the opacity style property.
	 */
	opacity: number;

	/**
	 * Gets or sets the rotate affine transform of the view along the Z axis.
	 */
	rotate: number;

	/**
	 * Gets or sets the rotate affine transform of the view along the X axis.
	 */
	rotateX: number;

	/**
	 * Gets or sets the rotate affine transform of the view along the Y axis.
	 */
	rotateY: number;

	/**
	 * Gets or sets the distance of the camera form the view perspective.
	 * Usually needed when rotating the view over the X or Y axis.
	 */
	perspective: number;

	/**
	 * Gets or sets the translateX affine transform of the view in device independent pixels.
	 */
	translateX: dip;

	/**
	 * Gets or sets the translateY affine transform of the view in device independent pixels.
	 */
	translateY: dip;

	/**
	 * Gets or sets the scaleX affine transform of the view.
	 */
	scaleX: number;

	/**
	 * Gets or sets the scaleY affine transform of the view.
	 */
	scaleY: number;

	//END Style property shortcuts

	/**
	 * Gets or sets the automation text of the view.
	 */
	automationText: string;

	/**
	 * Gets or sets the X component of the origin point around which the view will be transformed. The default value is 0.5 representing the center of the view.
	 */
	originX: number;

	/**
	 * Gets or sets the Y component of the origin point around which the view will be transformed. The default value is 0.5 representing the center of the view.
	 */
	originY: number;

	/**
	 * Gets or sets a value indicating whether the the view is enabled. This affects the appearance of the view.
	 */
	isEnabled: boolean;

	/**
	 * Gets or sets a value indicating whether the user can interact with the view. This does not affect the appearance of the view.
	 */
	isUserInteractionEnabled: boolean;

	/**
	 * Instruct container view to expand beyond the safe area. This property is iOS specific. Default value: false
	 */
	iosOverflowSafeArea: boolean;

	/**
	 * Enables or disables the iosOverflowSafeArea property for all children. This property is iOS specific. Default value: true
	 */
	iosOverflowSafeAreaEnabled: boolean;

	/**
	 * Gets is layout is valid. This is a read-only property.
	 */
	isLayoutValid: boolean;

	/**
	 * Gets the CSS fully qualified type name.
	 * Using this as element type should allow for PascalCase and kebap-case selectors, when fully qualified, to match the element.
	 */
	cssType: string;

	cssClasses: Set<string>;
	cssPseudoClasses: Set<string>;

	/**
	 * This is called to find out how big a view should be. The parent supplies constraint information in the width and height parameters.
	 * The actual measurement work of a view is performed in onMeasure(int, int), called by this method. Therefore, only onMeasure(int, int) can and must be overridden by subclasses.
	 * @param widthMeasureSpec    Horizontal space requirements as imposed by the parent
	 * @param heightMeasureSpec    Vertical space requirements as imposed by the parent
	 */
	public measure(widthMeasureSpec: number, heightMeasureSpec: number): void;

	/**
	 * Assign a size and position to a view and all of its descendants
	 * This is the second phase of the layout mechanism. (The first is measuring). In this phase, each parent calls layout on all of its children to position them. This is typically done using the child measurements that were stored in the measure pass().
	 * Derived classes should not override this method. Derived classes with children should override onLayout. In that method, they should call layout on each of their children.
	 * @param l Left position, relative to parent
	 * @param t Top position, relative to parent
	 * @param r Right position, relative to parent
	 * @param b Bottom position, relative to parent
	 */
	public layout(left: number, top: number, right: number, bottom: number, setFrame?: boolean): void;

	/**
	 * Returns the raw width component.
	 */
	public getMeasuredWidth(): number;

	/**
	 * Returns the raw height component.
	 */
	public getMeasuredHeight(): number;

	public getMeasuredState(): number;

	/**
	 * Measure the view and its content to determine the measured width and the measured height. This method is invoked by measure(int, int) and should be overriden by subclasses to provide accurate and efficient measurement of their contents.
	 * When overriding this method, you must call setMeasuredDimension(int, int) to store the measured width and height of this view. Failure to do so will trigger an exception, thrown by measure(int, int).
	 * @param widthMeasureSpec    horizontal space requirements as imposed by the parent. The requirements are encoded with View.MeasureSpec.
	 * @param heightMeasureSpec    vertical space requirements as imposed by the parent. The requirements are encoded with View.MeasureSpec.
	 */
	public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void;

	/**
	 * Called from layout when this view should assign a size and position to each of its children. Derived classes with children should override this method and call layout on each of their children.
	 * @param left      Left position, relative to parent
	 * @param top       Top position, relative to parent
	 * @param right     Right position, relative to parent
	 * @param bottom    Bottom position, relative to parent
	 */
	public onLayout(left: number, top: number, right: number, bottom: number): void;

	/**
	 * This method must be called by onMeasure(int, int) to store the measured width and measured height. Failing to do so will trigger an exception at measurement time.
	 * @param measuredWidth        The measured width of this view. May be a complex bit mask as defined by MEASURED_SIZE_MASK and MEASURED_STATE_TOO_SMALL.
	 * @param measuredHeight    The measured height of this view. May be a complex bit mask as defined by MEASURED_SIZE_MASK and MEASURED_STATE_TOO_SMALL.
	 */
	public setMeasuredDimension(measuredWidth: number, measuredHeight: number): void;

	/**
	 * Called from onLayout when native view position is about to be changed.
	 * @param left      Left position, relative to parent
	 * @param top       Top position, relative to parent
	 * @param right     Right position, relative to parent
	 * @param bottom    Bottom position, relative to parent
	 */
	public layoutNativeView(left: number, top: number, right: number, bottom: number): void;

	/**
	 * Measure a child by taking into account its margins and a given measureSpecs.
	 * @param parent            This parameter is not used. You can pass null.
	 * @param child             The view to be measured.
	 * @param measuredWidth     The measured width that the parent layout specifies for this view.
	 * @param measuredHeight    The measured height that the parent layout specifies for this view.
	 */
	public static measureChild(parent: View, child: View, widthMeasureSpec: number, heightMeasureSpec: number): { measuredWidth: number; measuredHeight: number };

	/**
	 * Layout a child by taking into account its margins, horizontal and vertical alignments and a given bounds.
	 * @param parent    This parameter is not used. You can pass null.
	 * @param left      Left position, relative to parent
	 * @param top       Top position, relative to parent
	 * @param right     Right position, relative to parent
	 * @param bottom    Bottom position, relative to parent
	 */
	public static layoutChild(parent: View, child: View, left: number, top: number, right: number, bottom: number): void;

	/**
	 * Utility to reconcile a desired size and state, with constraints imposed
	 * by a MeasureSpec.  Will take the desired size, unless a different size
	 * is imposed by the constraints.  The returned value is a compound integer,
	 * with the resolved size in the MEASURED_SIZE_MASK bits and
	 * optionally the bit MEASURED_STATE_TOO_SMALL set if the resulting
	 * size is smaller than the size the view wants to be.
	 */
	public static resolveSizeAndState(size: number, specSize: number, specMode: number, childMeasuredState: number): number;

	public static combineMeasuredStates(curState: number, newState): number;

	/**
	 * Tries to focus the view.
	 * Returns a value indicating whether this view or one of its descendants actually took focus.
	 */
	public focus(): boolean;

	public getGestureObservers(type: GestureTypes): Array<GesturesObserver>;

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change") or you can use gesture types.
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string | GestureTypes, callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Removes listener(s) for the specified event name.
	 * @param eventNames Comma delimited names of the events or gesture types the specified listener is associated with.
	 * @param callback An optional parameter pointing to a specific listener. If not defined, all listeners for the event names will be removed.
	 * @param thisArg An optional parameter which when set will be used to refine search of the correct callback which will be removed as event listener.
	 */
	off(eventNames: string | GestureTypes, callback?: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when a loaded event occurs.
	 */
	on(event: 'loaded', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when an unloaded event occurs.
	 */
	on(event: 'unloaded', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised when a back button is pressed.
	 * This event is raised only for android.
	 */
	on(event: 'androidBackPressed', callback: (args: EventData) => void, thisArg?: any);

	/**
	 * Raised before the view is shown as a modal dialog.
	 */
	on(event: 'showingModally', callback: (args: ShownModallyData) => void, thisArg?: any): void;

	/**
	 * Raised after the view is shown as a modal dialog.
	 */
	on(event: 'shownModally', callback: (args: ShownModallyData) => void, thisArg?: any);

	/**
	 * Returns the current modal view that this page is showing (is parent of), if any.
	 */
	modal: View;

	/**
	 * Animates one or more properties of the view based on the supplied options.
	 */
	public animate(options: AnimationDefinition): AnimationPromise;

	/**
	 * Creates an Animation object based on the supplied options.
	 */
	public createAnimation(options: AnimationDefinition): Animation;

	/**
	 * Returns the iOS safe area insets of this view.
	 */
	public getSafeAreaInsets(): { left; top; right; bottom };

	/**
	 * Returns the location of this view in the window coordinate system.
	 */
	public getLocationInWindow(): Point;

	/**
	 * Returns the location of this view in the screen coordinate system.
	 */
	public getLocationOnScreen(): Point;

	/**
	 * Returns the location of this view in the otherView's coordinate system.
	 */
	public getLocationRelativeTo(otherView: View): Point;

	/**
	 * Returns the actual size of the view in device-independent pixels.
	 */
	public getActualSize(): Size;

	/**
	 * Derived classes can override this method to handle Android back button press.
	 */
	onBackPressed(): boolean;

	/**
	 * @private
	 * A valid css string which will be applied for all nested UI components (based on css rules).
	 */
	css: string;

	/**
	 * @private
	 * Adds a new values to current css.
	 * @param cssString - A valid css which will be added to current css.
	 */
	addCss(cssString: string): void;

	/**
	 * @private
	 * Adds the content of the file to the current css.
	 * @param cssFileName - A valid file name (from the application root) which contains a valid css.
	 */
	addCssFile(cssFileName: string): void;

	/**
	 * @private
	 * Changes the current css to the content of the file.
	 * @param cssFileName - A valid file name (from the application root) which contains a valid css.
	 */
	changeCssFile(cssFileName: string): void;

	// Lifecycle events
	_getNativeViewsCount(): number;

	/**
	 * Internal method:
	 * Closes all modal views. Should be used by plugins like `nativescript-angular` which implement their own `modal views` service.
	 */
	_closeAllModalViewsInternal(): boolean;

	/**
	 * Internal method:
	 * Gets all modal views of the current view.
	 */
	_getRootModalViews(): Array<ViewBase>;

	_eachLayoutView(callback: (View) => void): void;

	/**
	 * Iterates over children of type View.
	 * @param callback Called for each child of type View. Iteration stops if this method returns falsy value.
	 */
	public eachChildView(callback: (view: View) => boolean): void;

	//@private
	/**
	 * @private
	 */
	_modalParent?: View;
	/**
	 * @private
	 */
	isLayoutRequired: boolean;
	/**
	 * @private
	 */
	_gestureObservers: any;
	/**
	 * @private
	 * androidx.fragment.app.FragmentManager
	 */
	_manager: any;
	/**
	 * @private
	 */
	_setNativeClipToBounds(): void;
	/**
	 * Called by measure method to cache measureSpecs.
	 * @private
	 */
	_setCurrentMeasureSpecs(widthMeasureSpec: number, heightMeasureSpec: number): boolean;
	/**
	 * Called by layout method to cache view bounds.
	 * @private
	 */
	_setCurrentLayoutBounds(left: number, top: number, right: number, bottom: number): { boundsChanged: boolean; sizeChanged: boolean };
	/**
	 * Return view bounds.
	 * @private
	 */
	_getCurrentLayoutBounds(): { left: number; top: number; right: number; bottom: number };
	/**
	 * @private
	 */
	_goToVisualState(state: string);
	/**
	 * @private
	 */
	_setNativeViewFrame(nativeView: any, frame: any): void;
	// _onStylePropertyChanged(property: dependencyObservable.Property): void;
	/**
	 * @private
	 */
	_updateEffectiveLayoutValues(parentWidthMeasureSize: number, parentWidthMeasureMode: number, parentHeightMeasureSize: number, parentHeightMeasureMode: number): void;
	/**
	 * @private
	 */
	_currentWidthMeasureSpec: number;
	/**
	 * @private
	 */
	_currentHeightMeasureSpec: number;
	/**
	 * @private
	 */
	_setMinWidthNative(value: Length): void;
	/**
	 * @private
	 */
	_setMinHeightNative(value: Length): void;
	/**
	 * @private
	 */
	_redrawNativeBackground(value: any): void;
	/**
	 * @private
	 */
	_removeAnimation(animation: Animation): boolean;
	/**
	 * @private
	 */
	_onLivesync(context?: { type: string; path: string }): boolean;
	/**
	 * @private
	 */
	_getFragmentManager(): any; /* androidx.fragment.app.FragmentManager */
	_handleLivesync(context?: { type: string; path: string }): boolean;

	/**
	 * Updates styleScope or create new styleScope.
	 * @param cssFileName
	 * @param cssString
	 * @param css
	 */
	_updateStyleScope(cssFileName?: string, cssString?: string, css?: string): void;

	/**
	 * Called in android when native view is attached to window.
	 */
	_onAttachedToWindow(): void;

	/**
	 * Called in android when native view is dettached from window.
	 */
	_onDetachedFromWindow(): void;

	/**
	 * Checks whether the current view has specific view for an ancestor.
	 */
	_hasAncestorView(ancestorView: View): boolean;
	//@endprivate

	/**
	 * __Obsolete:__ There is a new property system that does not rely on _getValue.
	 */
	_getValue(property: any): never;

	/**
	 * __Obsolete:__ There is a new property system that does not rely on _setValue.
	 */
	_setValue(property: any, value: any): never;
}

export declare abstract class ViewBase extends Observable {
	// Dynamic properties.
	left: Length;
	top: Length;
	effectiveLeft: number;
	effectiveTop: number;
	dock: 'left' | 'top' | 'right' | 'bottom';
	row: number;
	col: number;
	/**
	 * Setting `column` property is the same as `col`
	 */
	column: number;
	rowSpan: number;
	colSpan: number;
	/**
	 * Setting `columnSpan` property is the same as `colSpan`
	 */
	columnSpan: number;
	domNode: DOMNode;

	order: Order;
	flexGrow: FlexGrow;
	flexShrink: FlexShrink;
	flexWrapBefore: FlexWrapBefore;
	alignSelf: AlignSelf;

	/**
	 * @private
	 * Module name when the view is a module root. Otherwise, it is undefined.
	 */
	_moduleName?: string;

	//@private
	/**
	 * @private
	 */
	_oldLeft: number;
	/**
	 * @private
	 */
	_oldTop: number;
	/**
	 * @private
	 */
	_oldRight: number;
	/**
	 * @private
	 */
	_oldBottom: number;
	/**
	 * @private
	 */
	_defaultPaddingTop: number;
	/**
	 * @private
	 */
	_defaultPaddingRight: number;
	/**
	 * @private
	 */
	_defaultPaddingBottom: number;
	/**
	 * @private
	 */
	_defaultPaddingLeft: number;

	/**
	 * A property bag holding suspended native updates.
	 * Native setters that had to execute while there was no native view,
	 * or the view was detached from the visual tree etc. will accumulate in this object,
	 * and will be applied when all prerequisites are met.
	 * @private
	 */
	_suspendedUpdates: { [propertyName: string]: Property<ViewBase, any> | CssProperty<Style, any> | CssAnimationProperty<Style, any> };
	//@endprivate

	/**
	 * Shows the View contained in moduleName as a modal view.
	 * @param moduleName - The name of the module to load starting from the application root.
	 * @param modalOptions - A ShowModalOptions instance
	 */
	showModal(moduleName: string, modalOptions: ShowModalOptions): ViewBase;

	/**
	 * Shows the view passed as parameter as a modal view.
	 * @param view - View instance to be shown modally.
	 * @param modalOptions - A ShowModalOptions instance
	 */
	showModal(view: ViewBase, modalOptions: ShowModalOptions): ViewBase;

	/**
	 * Closes the current modal view that this page is showing.
	 * @param context - Any context you want to pass back to the host when closing the modal view.
	 */
	closeModal(context?: any): void;

	public effectiveMinWidth: number;
	public effectiveMinHeight: number;
	public effectiveWidth: number;
	public effectiveHeight: number;
	public effectiveMarginTop: number;
	public effectiveMarginRight: number;
	public effectiveMarginBottom: number;
	public effectiveMarginLeft: number;
	public effectivePaddingTop: number;
	public effectivePaddingRight: number;
	public effectivePaddingBottom: number;
	public effectivePaddingLeft: number;
	public effectiveBorderTopWidth: number;
	public effectiveBorderRightWidth: number;
	public effectiveBorderBottomWidth: number;
	public effectiveBorderLeftWidth: number;

	/**
	 * String value used when hooking to loaded event.
	 */
	public static loadedEvent: string;

	/**
	 * String value used when hooking to unloaded event.
	 */
	public static unloadedEvent: string;

	public ios: any;
	public android: any;

	/**
	 * returns the native UIViewController.
	 */
	public viewController: any;

	/**
	 * read-only. If you want to set out-of-band the nativeView use the setNativeView method.
	 */
	public nativeViewProtected: any;
	public nativeView: any;
	public bindingContext: any;

	/**
	 * Gets the name of the constructor function for this instance. E.g. for a Button class this will return "Button".
	 */
	public typeName: string;

	/**
	 * Gets the parent view. This property is read-only.
	 */
	public readonly parent: ViewBase;

	/**
	 * Gets the template parent or the native parent. Sets the template parent.
	 */
	public parentNode: ViewBase;

	/**
	 * Gets or sets the id for this view.
	 */
	public id: string;

	/**
	 * Gets or sets the CSS class name for this view.
	 */
	public className: string;

	/**
	 * Gets owner page. This is a read-only property.
	 */
	public readonly page: Page;

	/**
	 * Gets the style object associated to this view.
	 */
	public readonly style: Style;

	/**
	 * Returns true if visibility is set to 'collapse'.
	 * Readonly property
	 */
	public isCollapsed: boolean;
	public readonly isLoaded: boolean;

	/**
	 * Returns the child view with the specified id.
	 */
	public getViewById<T extends ViewBase>(id: string): T;

	/**
	 * Load view.
	 * @param view to load.
	 */
	public loadView(view: ViewBase): void;

	/**
	 * Unload view.
	 * @param view to unload.
	 */
	public unloadView(view: ViewBase): void;

	public onLoaded(): void;
	public onUnloaded(): void;
	public onResumeNativeUpdates(): void;

	public bind(options: BindingOptions, source?: Object): void;
	public unbind(property: string): void;

	/**
	 * Invalidates the layout of the view and triggers a new layout pass.
	 */
	public requestLayout(): void;

	/**
	 * Iterates over children of type ViewBase.
	 * @param callback Called for each child of type ViewBase. Iteration stops if this method returns falsy value.
	 */
	public eachChild(callback: (child: ViewBase) => boolean): void;

	public _addView(view: ViewBase, atIndex?: number): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _addViewCore(view: ViewBase, atIndex?: number): void;

	public _removeView(view: ViewBase): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _removeViewCore(view: ViewBase): void;
	public _parentChanged(oldParent: ViewBase): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _dialogClosed(): void;
	/**
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	public _onRootViewReset(): void;

	_domId: number;

	_cssState: any /* "ui/styling/style-scope" */;
	/**
	 * @private
	 * Notifies each child's css state for change, recursively.
	 * Either the style scope, className or id properties were changed.
	 */
	_onCssStateChange(): void;

	public cssClasses: Set<string>;
	public cssPseudoClasses: Set<string>;

	public _goToVisualState(state: string): void;

	public setInlineStyle(style: string): void;

	_context: any /* android.content.Context */;

	/**
	 * Setups the UI for ViewBase and all its children recursively.
	 * This method should *not* be overridden by derived views.
	 */
	_setupUI(context: any /* android.content.Context */, atIndex?: number): void;

	/**
	 * Tears down the UI for ViewBase and all its children recursively.
	 * This method should *not* be overridden by derived views.
	 */
	_tearDownUI(force?: boolean): void;

	/**
	 * Creates a native view.
	 * Returns either android.view.View or UIView.
	 */
	createNativeView(): Object;

	/**
	 * Initializes properties/listeners of the native view.
	 */
	initNativeView(): void;

	/**
	 * Clean up references to the native view.
	 */
	disposeNativeView(): void;

	/**
	 * Resets properties/listeners set to the native view.
	 */
	resetNativeView(): void;

	/**
	 * Set the nativeView field performing extra checks and updates to the native properties on the new view.
	 * Use in cases where the createNativeView is not suitable.
	 * As an example use in item controls where the native parent view will create the native views for child items.
	 */
	setNativeView(view: any): void;

	_isAddedToNativeVisualTree: boolean;

	/**
	 * Performs the core logic of adding a child view to the native visual tree. Returns true if the view's native representation has been successfully added, false otherwise.
	 */
	_addViewToNativeVisualTree(view: ViewBase, atIndex?: number): boolean;
	_removeViewFromNativeVisualTree(view: ViewBase): void;
	_childIndexToNativeChildIndex(index?: number): number;

	/**
	 * @protected
	 * @unstable
	 * A widget can call this method to add a matching css pseudo class.
	 */
	public addPseudoClass(name: string): void;

	/**
	 * @protected
	 * @unstable
	 * A widget can call this method to discard matching css pseudo class.
	 */
	public deletePseudoClass(name: string): void;

	/**
	 * @unstable
	 * Ensures a dom-node for this view.
	 */
	public ensureDomNode();

	//@private
	/**
	 * @private
	 */
	public recycleNativeView: 'always' | 'never' | 'auto';

	/**
	 * @private
	 */
	public _isPaddingRelative: boolean;

	/**
	 * @private
	 */
	public _ignoreFlexMinWidthHeightReset: boolean;

	public _styleScope: any;

	/**
	 * @private
	 */
	public _automaticallyAdjustsScrollViewInsets: boolean;
	/**
	 * @private
	 */
	_isStyleScopeHost: boolean;

	/**
	 * @private
	 */
	public _layoutParent(): void;

	/**
	 * Determines the depth of suspended updates.
	 * When the value is 0 the current property updates are not batched nor scoped and must be immediately applied.
	 * If the value is 1 or greater, the current updates are batched and does not have to provide immediate update.
	 * Do not set this field, the _batchUpdate method is responsible to keep the count up to date,
	 * as well as adding/rmoving the view to/from the visual tree.
	 */
	public _suspendNativeUpdatesCount: number;

	/**
	 * Allow multiple updates to be performed on the instance at once.
	 */
	public _batchUpdate<T>(callback: () => T): T;
	/**
	 * @private
	 */
	_setupAsRootView(context: any): void;

	/**
	 * When returning true the callLoaded method will be run in setTimeout
	 * Method is intended to be overridden by inheritors and used as "protected"
	 */
	_shouldDelayLayout(): boolean;

	/**
	 * @private
	 */
	_inheritStyleScope(styleScope: any /* StyleScope */): void;

	/**
	 * @private
	 */
	callLoaded(): void;

	/**
	 * @private
	 */
	callUnloaded(): void;
	//@endprivate
}

/**
 * Represents an entry to be used to create a view or load it form file
 */
export declare interface ViewEntry {
	/**
	 * The name of the module containing the View instance to load. Optional.
	 */
	moduleName?: string;

	/**
	 * A function used to create the View instance. Optional.
	 */
	create?: () => View;
}

declare type Visibility = 'visible' | 'hidden' | 'collapse';

/**
 * Represents a standard WebView widget.
 */
export declare class WebView extends View {
	/**
	 * String value used when hooking to loadStarted event.
	 */
	public static loadStartedEvent: string;

	/**
	 * String value used when hooking to loadFinished event.
	 */
	public static loadFinishedEvent: string;

	/**
	 * Gets the native [android widget](http://developer.android.com/reference/android/webkit/WebView.html) that represents the user interface for this component. Valid only when running on Android OS.
	 */
	android: any /* android.webkit.WebView */;

	/**
	 * Gets the native [WKWebView](https://developer.apple.com/documentation/webkit/wkwebview/) that represents the user interface for this component. Valid only when running on iOS.
	 */
	ios: any /* WKWebView */;

	/**
	 * Gets or sets the url, local file path or HTML string.
	 */
	src: string;

	/**
	 * Gets a value indicating whether the WebView can navigate back.
	 */
	canGoBack: boolean;

	/**
	 * Gets a value indicating whether the WebView can navigate forward.
	 */
	canGoForward: boolean;

	/**
	 * Stops loading the current content (if any).
	 */
	stopLoading(): void;

	/**
	 * Navigates back.
	 */
	goBack();

	/**
	 * Navigates forward.
	 */
	goForward();

	/**
	 * Reloads the current url.
	 */
	reload();

	/**
	 * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
	 * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change").
	 * @param callback - Callback function which will be executed when event is raised.
	 * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
	 */
	on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);

	/**
	 * Raised when a loadFinished event occurs.
	 */
	on(event: 'loadFinished', callback: (args: LoadEventData) => void, thisArg?: any);

	/**
	 * Raised when a loadStarted event occurs.
	 */
	on(event: 'loadStarted', callback: (args: LoadEventData) => void, thisArg?: any);
}

declare type WhiteSpace = 'initial' | 'normal' | 'nowrap';

/**
 * WrapLayout position children in rows or columns depending on orientation property
 * until space is filled and then wraps them on new row or column.
 */
export declare class WrapLayout extends LayoutBase {
	/**
	 * Gets or sets the flow direction. Default value is horizontal.
	 * If orientation is horizontal items are arranged in rows, else items are arranged in columns.
	 */
	orientation: Orientation_3;

	/**
	 * Gets or sets the width used to measure and layout each child.
	 * Default value is Number.NaN which does not restrict children.
	 */
	itemWidth: Length;

	/**
	 * Gets or sets the height used to measure and layout each child.
	 * Default value is Number.NaN which does not restrict children.
	 */
	itemHeight: Length;
}

/**
 * Writes a message using the available writers.
 * @param message The message to be written.
 * @param category The category of the message.
 * @param type Optional, the type of the message - info, warning, error.
 */
declare function write(message: any, category: string, type?: number);

/**
 * A simple non-validating SAX parser based on https://github.com/vflash/easysax version 0.1.14
 */
export declare class XmlParser {
	/**
	 * Creates a new instance of the XmlParser class.
	 * @param onEvent The callback to execute when a parser event occurs. The 'event' parameter contains information about the event.
	 * @param onError The callback to execute when a parser error occurs. The 'error' parameter contains the error.
	 * @param processNamespaces Specifies whether namespaces should be processed.
	 */
	constructor(onEvent: (event: ParserEvent) => void, onError?: (error: Error, position: Position) => void, processNamespaces?: boolean, angularSyntax?: boolean);

	/**
	 * Parses the supplied xml string.
	 * @param xmlString The string containing the xml to parse.
	 */
	parse(xmlString: string): void;
}

export {};
