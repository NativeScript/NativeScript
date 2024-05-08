import { PageBase } from './page-common';
import { CssProperty, Property } from '../core/properties';
import { Style } from '../styling/style';
import { EventData } from '../../data/observable';
import { Frame } from '../frame';
import { ActionBar } from '../action-bar';
import { KeyframeAnimationInfo } from '../animation/keyframe-animation';
import { Color } from '../../color';

export * from './page-common';

/**
 * Defines the data for the page navigation events.
 */
export interface NavigatedData extends EventData {
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
 * Represents a logical unit for navigation (inside Frame).
 */
export declare class Page extends PageBase {
	/**
	 * String value used when hooking to navigatingTo event.
	 */
	public static readonly navigatingToEvent = 'navigatingTo';

	/**
	 * String value used when hooking to navigatedTo event.
	 */
	public static readonly navigatedToEvent = 'navigatedTo';

	/**
	 * String value used when hooking to navigatingFrom event.
	 */
	public static readonly navigatingFromEvent = 'navigatingFrom';

	/**
	 * String value used when hooking to navigatedFrom event.
	 */
	public static readonly navigatedFromEvent = 'navigatedFrom';

	/**
	 * Gets or sets whether page background spans under status bar.
	 */
	public backgroundSpanUnderStatusBar: boolean;

	/**
	 * Gets or sets the style of the status bar.
	 */
	// @ts-ignore
	public statusBarStyle: 'light' | 'dark';

	/**
	 * Gets or sets the color of the status bar in Android.
	 */
	// @ts-ignore
	public androidStatusBarBackground: Color;

	/**
	 * Used to hide the Navigation Bar in iOS and the Action Bar in Android.
	 */
	// @ts-ignore
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
	// @ts-ignore
	public navigationContext: any;

	/**
	 * Gets the Frame object controlling this instance.
	 */
	// @ts-ignore
	public frame: Frame;

	/**
	 * Gets the ActionBar for this page.
	 */
	// @ts-ignore
	public actionBar: ActionBar;

	/**
	 * iOS Only
	 * Perform an action when user performans the "escape" gesture
	 */
	public onAccessibilityPerformEscape?: () => boolean;

	/**
	 * Should page changed be annnounced to the screen reader.
	 */
	public accessibilityAnnouncePageEnabled: boolean;

	/**
	 * Adds a listener for the specified event name.
	 *
	 * @param eventName The name of the event.
	 * @param callback The event listener to add. Will be called when an event of
	 * the given name is raised.
	 * @param thisArg An optional parameter which, when set, will be bound as the
	 * `this` context when the callback is called. Falsy values will be not be
	 * bound.
	 */
	public on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void;

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

	/**
	 * Announce screen changed
	 */
	public accessibilityScreenChanged(refocus?: boolean): void;
}

/**
 * Dependency property that specify if page background should span under status bar.
 */
export const backgroundSpanUnderStatusBarProperty: Property<Page, boolean>;

/**
 * Dependency property used to hide the Navigation Bar in iOS and the Action Bar in Android.
 */
export const actionBarHiddenProperty: Property<Page, boolean>;

/**
 * Dependency property used to control if swipe back navigation in iOS is enabled.
 * This property is iOS specific. Default value: true
 */
export const enableSwipeBackNavigationProperty: Property<Page, boolean>;

/**
 * Property backing statusBarStyle.
 */
export const statusBarStyleProperty: CssProperty<Style, 'light' | 'dark'>;

/**
 * Property backing androidStatusBarBackground.
 */
export const androidStatusBarBackgroundProperty: CssProperty<Style, Color>;
