/**
 * Contains the Page class, which represents a logical unit for navigation inside a Frame. 
 */
declare module "ui/page" {
    import observable = require("data/observable");
    import view = require("ui/core/view");
    import contentView = require("ui/content-view");
    import frame = require("ui/frame");
    import dependencyObservable = require("ui/core/dependency-observable");
    import bindable = require("ui/core/bindable");

    //@private
    import styleScope = require("ui/styling/style-scope");
    //@endprivate

    /**
     * Defines the data for the Page.navigatedTo event.
     */
    export interface NavigatedData extends observable.EventData {
        /**
         * The navigation context (optional, may be undefined) passed to the Page.onNavigatedTo method.
         */
        context: any;
    }

    /**
     * Encapsulates the known event names for the page module.
     */
    export module knownEvents {
        /**
         * The event raised when the Page.onNavigatedTo method is called.
         */
        export var navigatedTo: string;
    }

    export module knownCollections {
        export var optionsMenu: string;
    }

    /**
     * Represents a logical unit for navigation (inside Frame).
     */
    export class Page extends contentView.ContentView implements view.AddArrayFromBuilder {

        constructor(options?: Options)

        /**
         * A valid css string which will be applied for all nested UI components (based on css rules).
         */
        css: string;

        /**
         * Adds a new values to current css.
         * @param cssString - A valid css which will be added to current css. 
         */
        addCss(cssString: string): void;

        /**
         * Adds the content of the file to the current css.
         * @param cssFileName - A valid file name (from the application root) which contains a valid css.
         */
        addCssFile(cssFileName: string): void;

        /**
         * A property that is used to pass a data from another page (while navigate to).
         */
        navigationContext: any;

        /**
         * Gets the Frame object controlling this instance.
         */
        frame: frame.Frame;

        /**
         * Gets the OptionsMenu for this page.
         */
        optionsMenu: OptionsMenu;

        /**
         * A method called before navigating to the page.
         * @param context - The data passed to the page through the NavigationEntry.context property.
         */
        onNavigatingTo(context: any): void;

        /**
         * A method called after navigated to the page.
         * @param context - The data passed to the page through the NavigationEntry.context property.
         */
        onNavigatedTo(context: any): void;

        /**
         * A method called before navigating from the page.
         */
        onNavigatingFrom(): void;

        /**
         * A method called after navigated from the page.
         * @param isBackNavigation - True if the Page is being navigated from using the Frame.goBack() method, false otherwise.
         */
        onNavigatedFrom(isBackNavigation: boolean): void;

        /**
         * Raised when navigation to the page is finished.
         */
        on(event: string, callback: (data: observable.EventData) => void);

        /**
         * Raised when navigation to the page is finished.
         */
        on(event: "navigatedTo", callback: (args: NavigatedData) => void);

        //@private
        _getStyleScope(): styleScope.StyleScope;
        _addArrayFromBuilder(name: string, value: Array<any>): void;
        //@endprivate
    }

    /**
     * Provides a set with most common option used to create a page instance.
     */
    export interface Options extends view.Options {
        /**
         * Gets or sets the page module.
         */
        module?: any;

        /**
         * Gets or sets the page module file name.
         */
        filename?: string;

        /**
         * Gets or sets the page module exports.
         */
        exports?: any;
    }

    export class OptionsMenu {
        addItem(item: MenuItem): void;
        removeItem(item: MenuItem): void;
        getItems(): Array<MenuItem>;
        getItemAt(index: number): MenuItem;
    }

    export class MenuItem extends bindable.Bindable {

        /**
         * Represents the observable property backing the text property.
         */
        public static textProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the icon property.
         */
        public static iconProperty: dependencyObservable.Property;

        text: string;
        icon: string;
        android: AndroidMenuItemOptions;
        on(event: string, callback: (data: observable.EventData) => void);
        on(event: "tap", callback: (args: observable.EventData) => void);

        //@private
        _raiseTap(): void;
        //@endprivate
    }

    interface AndroidMenuItemOptions {

        /**
         * Specify if android menuItem should appear in the actionBar or in the popup.
         * Use values from enums MenuItemPosition.
         * Changes after menuItem is created are not supported.
         */
        position: string;
    }
}