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
