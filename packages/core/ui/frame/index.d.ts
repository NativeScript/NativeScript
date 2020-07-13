import { NavigationType, FrameBase } from './frame-common';
import { Page } from '../page';
import { Observable, EventData } from '../../data/observable';
import { View } from '../core/view';
import { Transition } from '../transition';

export * from './frame-interfaces';

/**
 * Represents the logical View unit that is responsible for navigation within an application.
 * Nested frames are supported, enabling hierarchical navigation scenarios.
 */
export class Frame extends FrameBase {
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
 * Sets the extended androidx.fragment.app.Fragment class to the Frame and navigation routine. An instance of this class will be created to represent the Page currently visible on the srceen. This method is available only for the Android platform.
 */
export function setFragmentClass(clazz: any): void;

/**
 * @deprecated Use Frame.getFrameById() instead.
 *
 * Gets a frame by id.
 */
export function getFrameById(id: string): Frame;

/**
 * @deprecated Use Frame.topmost() instead.
 *
 * Gets the topmost frame in the frames stack. An application will typically has one frame instance. Multiple frames handle nested (hierarchical) navigation scenarios.
 */
export function topmost(): Frame;

/**
 * @deprecated Use Frame.goBack() instead.
 *
 * Navigates back using the navigation hierarchy (if any). Updates the Frame stack as needed.
 * This method will start from the topmost Frame and will recursively search for an instance that has the canGoBack operation available.
 */
export function goBack();

//@private
/**
 * @deprecated Use Frame._stack() instead.
 *
 * @private
 */
export function _stack(): Array<Frame>;
//@endprivate

/**
 * Represents an entry to be used to create a view or load it form file
 */
export interface ViewEntry {
	/**
	 * The name of the module containing the View instance to load. Optional.
	 */
	moduleName?: string;

	/**
	 * A function used to create the View instance. Optional.
	 */
	create?: () => View;
}
/**
 * Represents an entry in passed to navigate method.
 */
export interface NavigationEntry extends ViewEntry {
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
 * Represents a context passed to navigation methods.
 */
export interface NavigationContext {
	entry: BackstackEntry;
	isBackNavigation: boolean;
	navigationType: NavigationType;
}

/**
 * Represents an object specifying a page navigation transition.
 */
export interface NavigationTransition {
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

/**
 * Represents an entry in the back stack of a Frame object.
 */
export interface BackstackEntry {
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
 * Represents the Android-specific Frame object, aggregated within the common Frame one.
 * In Android there are two types of navigation - using new Activity instances or using Fragments within the main Activity.
 * To start a new Activity, a new Frame instance should be created and navigated to the desired Page.
 */
export interface AndroidFrame extends Observable {
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

export interface AndroidActivityCallbacks {
	getRootView(): View;
	resetActivityContent(activity: any): void;

	onCreate(activity: any, savedInstanceState: any, intent: any, superFunc: Function): void;
	onSaveInstanceState(activity: any, outState: any, superFunc: Function): void;
	onStart(activity: any, superFunc: Function): void;
	onStop(activity: any, superFunc: Function): void;
	onPostResume(activity: any, superFunc: Function): void;
	onDestroy(activity: any, superFunc: Function): void;
	onBackPressed(activity: any, superFunc: Function): void;
	onRequestPermissionsResult(activity: any, requestCode: number, permissions: Array<String>, grantResults: Array<number>, superFunc: Function): void;
	onActivityResult(activity: any, requestCode: number, resultCode: number, data: any, superFunc: Function);
	onNewIntent(activity: any, intent: any, superSetIntentFunc: Function, superFunc: Function): void;
}

export interface AndroidFragmentCallbacks {
	onHiddenChanged(fragment: any, hidden: boolean, superFunc: Function): void;
	onCreateAnimator(fragment: any, transit: number, enter: boolean, nextAnim: number, superFunc: Function): any;
	onCreate(fragment: any, savedInstanceState: any, superFunc: Function): void;
	onCreateView(fragment: any, inflater: any, container: any, savedInstanceState: any, superFunc: Function): any;
	onSaveInstanceState(fragment: any, outState: any, superFunc: Function): void;
	onDestroyView(fragment: any, superFunc: Function): void;
	onDestroy(fragment: any, superFunc: Function): void;
	onPause(fragment: any, superFunc: Function): void;
	onStop(fragment: any, superFunc: Function): void;
	toStringOverride(fragment: any, superFunc: Function): string;
}

/* tslint:disable */
/**
 * Represents the iOS-specific Frame object, aggregated within the common Frame one.
 * In iOS the native controller, associated with a Frame object is UINavigationController.
 * The navigation controller will automatically hide/show its navigation bar depending on the back stack of the Frame.
 */
export interface iOSFrame {
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

export function setActivityCallbacks(activity: any /*androidx.appcompat.app.AppCompatActivity*/): void;
//@private
/**
 * @deprecated Use Frame.reloadPage() instead.
 *
 * @private
 */
export function reloadPage(context?: ModuleContext): void;
/**
 * @private
 */
export function setFragmentCallbacks(fragment: any /*androidx.fragment.app.Fragment*/): void;
//@endprivate
