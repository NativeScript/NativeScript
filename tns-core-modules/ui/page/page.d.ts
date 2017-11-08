/**
 * Contains the Page class, which represents a logical unit for navigation inside a Frame.
 * @module "ui/page"
 */ /** */

///<reference path="../../tns-core-modules.d.ts" /> Include global typings
import { ContentView, EventData, Property, Color, CssProperty, Style } from "../content-view";
import { Frame } from "../frame";
import { ActionBar } from "../action-bar";
import { KeyframeAnimationInfo } from "../animation/keyframe-animation";

//@private
import * as styleScope from "../styling/style-scope";
//@endprivate

export * from "../content-view";

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
 * Defines the data for the Page.shownModally event.
 */
export interface ShownModallyData extends EventData {
    /**
     * The context (optional, may be undefined) passed to the page when shown modally.
     */
    context: any;

    /**
     * A callback to call when you want to close the modally shown page. Pass in any kind of arguments and you will receive when the callback parameter of Page.showModal is executed.
     */
    closeCallback: Function;
}

export module knownCollections {
    export var actionItems: string;
}

/**
 * Represents a logical unit for navigation (inside Frame).
 */
export class Page extends ContentView {
    /**
     * String value used when hooking to showingModally event.
     */
    public static showingModallyEvent: string;

    /**
     * String value used when hooking to shownModally event.
     */
    public static shownModallyEvent: string;

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
    public statusBarStyle: "light" | "dark";

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
     * A valid css string which will be applied for all nested UI components (based on css rules).
     */
    public css: string;

    /**
     * Adds a new values to current css.
     * @param cssString - A valid css which will be added to current css. 
     */
    public addCss(cssString: string): void;

    /**
     * Adds the content of the file to the current css.
     * @param cssFileName - A valid file name (from the application root) which contains a valid css.
     */
    public addCssFile(cssFileName: string): void;

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
    public on(event: "navigatingTo", callback: (args: NavigatedData) => void, thisArg?: any): void;

    /**
     * Raised when navigation to the page has finished.
     */
    public on(event: "navigatedTo", callback: (args: NavigatedData) => void, thisArg?: any): void;

    /**
     * Raised when navigation from the page has started.
     */
    public on(event: "navigatingFrom", callback: (args: NavigatedData) => void, thisArg?: any): void;

    /**
     * Raised when navigation from the page has finished.
     */
    public on(event: "navigatedFrom", callback: (args: NavigatedData) => void, thisArg?: any): void;

    /**
     * Raised before the page is shown as a modal dialog.
     */
    public on(event: "showingModally", callback: (args: ShownModallyData) => void, thisArg?: any): void;

    /**
     * Raised after the page is shown as a modal dialog.
     */
    public on(event: "shownModally", callback: (args: ShownModallyData) => void, thisArg?: any);

    /**
     * Shows the page contained in moduleName as a modal view.
     * @param moduleName - The name of the page module to load starting from the application root.
     * @param context - Any context you want to pass to the modally shown page. This same context will be available in the arguments of the Page.shownModally event handler.
     * @param closeCallback - A function that will be called when the page is closed. Any arguments provided when calling ShownModallyData.closeCallback will be available here.
     * @param fullscreen - An optional parameter specifying whether to show the modal page in full-screen mode.
     */
    public showModal(moduleName: string, context: any, closeCallback: Function, fullscreen?: boolean): Page;

    /**
     * Shows the page passed as parameter as a modal view.
     * @param page - Page instance to be shown modally.
     * @param context - Any context you want to pass to the modally shown page. This same context will be available in the arguments of the Page.shownModally event handler.
     * @param closeCallback - A function that will be called when the page is closed. Any arguments provided when calling ShownModallyData.closeCallback will be available here.
     * @param fullscreen - An optional parameter specifying whether to show the modal page in full-screen mode.
     */
    public showModal(page: Page, context: any, closeCallback: Function, fullscreen?: boolean): Page;

    /**
     * Shows the page as a modal view.
     */
    public showModal(): Page;

    /**
     * Closes the current modal view that this page is showing.
     */
    public closeModal(): void;

    /**
     * Returns the current modal view that this page is showing (is parent of), if any.
     */
    public modal: Page;

    //@private

    /**
     * identifier for the fragment that shows this page.
     * Android only.
     * @private
     */
    public _fragmentTag: string;
    /**
     * @private
     */
    public _frame: Frame;

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
export const statusBarStyleProperty: CssProperty<Style, "light" | "dark">;

/**
 * Property backing androidStatusBarBackground.
 */
export const androidStatusBarBackgroundProperty: CssProperty<Style, Color>;
