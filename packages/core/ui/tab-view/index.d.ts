/**
 * Contains the TabView class, which represents a standard content component with tabs.
 */

import { View } from '../core/view';
import { ViewBase } from '../core/view-base';
import { Property, CssProperty } from '../core/properties';
import { EventData } from '../../data/observable';
import { Color } from '../../color';
import { CoreTypes } from '../../core-types';
import { Style } from '../styling/style';
/**
 * Represents a tab view entry.
 *
 * @nsView TabViewItem
 */
export class TabViewItem extends ViewBase {
	/**
	 * Gets or sets the title of the TabViewItem.
	 *
	 * @nsProperty
	 */
	public title: string;

	/**
	 * Gets or sets the view of the TabViewItem.
	 *
	 * @nsProperty
	 */
	public view: View;

	/**
	 * Gets or sets the icon source of the TabViewItem. This could either be a a file name or resource id.
	 *
	 * @nsProperty
	 */
	public iconSource: string;

	/**
	 * Gets or sets the text transform of the tab titles.
	 *
	 * @nsProperty
	 */
	textTransform: CoreTypes.TextTransformType;

	/**
	 * @private
	 */
	canBeLoaded?: boolean;
}

/**
 * Defines the data for the TabView.selectedIndexChanged event.
 */
export interface SelectedIndexChangedEventData extends EventData {
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
 * Represents a tab view.
 *
 * @nsView TabView
 */
export class TabView extends View {
	/**
	 * String value used when hooking to the selectedIndexChanged event.
	 *
	 * @nsEvent {SelectedIndexChangedEventData} selectedIndexChanged
	 */
	public static selectedIndexChangedEvent: string;

	/**
	 * Gets or sets the items of the TabView.
	 *
	 * @nsProperty
	 */
	items: Array<TabViewItem>;

	/**
	 * Gets or sets the selectedIndex of the TabView.
	 *
	 * @nsProperty
	 */
	selectedIndex: number;

	/**
	 * Gets or sets the font size of the tabs titles.
	 *
	 * @nsProperty
	 */
	tabTextFontSize: number;

	/**
	 * Gets or sets the text color of the tabs titles.
	 *
	 * @nsProperty
	 */
	tabTextColor: Color;

	/**
	 * Gets or sets the background color of the tabs.
	 *
	 * @nsProperty
	 */
	tabBackgroundColor: Color;

	/**
	 * Gets or sets the text color of the selected tab title.
	 *
	 * @nsProperty
	 */
	selectedTabTextColor: Color;

	/**
	 * Gets or sets the color of the horizontal line drawn below the currently selected tab on Android.
	 *
	 * @nsProperty
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
	 *
	 * @nsProperty
	 */
	iosIconRenderingMode: 'automatic' | 'alwaysOriginal' | 'alwaysTemplate';

	/**
	 * Gets or sets the rendering mode of tab icons on Android.  Defaults to "original"
	 * Valid values are:
	 *  - alwaysOriginal
	 *  - alwaysTemplate
	 *
	 * @nsProperty
	 */
	androidIconRenderingMode: 'alwaysOriginal' | 'alwaysTemplate';

	/**
	 * Gets or sets the number of tabs that should be retained to either side of the current tab in the view hierarchy in an idle state.
	 * Tabs beyond this limit will be recreated from the TabView when needed.
	 *
	 * @nsProperty
	 */
	androidOffscreenTabLimit: number;

	/**
	 * Gets or set the tabs vertical position.
	 * Valid values are:
	 *  - top
	 *  - bottom
	 *
	 * @nsProperty
	 */
	androidTabsPosition: 'top' | 'bottom';

	/**
	 * Gets or sets a value indicating whether swipe gesture is enabled for Android.
	 *
	 * @nsProperty
	 */
	androidSwipeEnabled: boolean;

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
	on(eventName: string, callback: (data: EventData) => void, thisArg?: any): void;

	/**
	 * Raised when the selected index changes.
	 */
	on(event: 'selectedIndexChanged', callback: (args: SelectedIndexChangedEventData) => void, thisArg?: any): void;
}

export const itemsProperty: Property<TabView, TabViewItem[]>;
export const selectedIndexProperty: Property<TabView, number>;

export const tabTextFontSizeProperty: CssProperty<Style, number>;
export const tabTextColorProperty: CssProperty<Style, Color>;
export const tabBackgroundColorProperty: CssProperty<Style, Color>;
export const selectedTabTextColorProperty: CssProperty<Style, Color>;
export const androidSelectedTabHighlightColorProperty: CssProperty<Style, Color>;
export const androidOffscreenTabLimitProperty: Property<TabView, number>;
export const iosIconRenderingModeProperty: Property<TabView, 'automatic' | 'alwaysOriginal' | 'alwaysTemplate'>;
export const androidIconRenderingModeProperty: Property<TabView, 'alwaysOriginal' | 'alwaysTemplate'>;
