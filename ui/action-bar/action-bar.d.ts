/**
 * Contains the action bar related classes.
 */
declare module "ui/action-bar" {
    import observable = require("data/observable");
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import bindable = require("ui/core/bindable");
    import pages = require("ui/page");

    /**
     * Provides an abstraction over the ActionBar (android) and NavigationBar (iOS).
     */
    export class ActionBar extends view.View implements view.AddArrayFromBuilder, view.AddChildFromBuilder {
        
        /**
         * Gets or sets the action bar title.
         */
        title: string;

        /**
         * Gets or sets the title view. When set - replaces the title with a custom view.
         */
        titleView: view.View;
        
        /**
         * Gets or sets the navigation button (a.k.a. the back button).
         */
        navigationButton: NavigationButton;
        
        /**
         * Gets the collection of action items.
         */
        actionItems: ActionItems;
        
        /**
         * Gets the android specific options of the action bar.
         */
        android: AndroidActionBarSettings;

        /**
         * Gets the page that contains the action bar.
         */
        page: pages.Page;

        /**
         * Updates the action bar.
         */
        update();

        //@private
        _isEmpty(): boolean
        //@endprivate

        _addArrayFromBuilder(name: string, value: Array<any>): void;
        _addChildFromBuilder(name: string, value: any): void;
    }

    /**
     * Represents a collection of ActionItems.
     */
    export class ActionItems {
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
     * Represents an action item in the action bar.
     */
    export class ActionItem extends bindable.Bindable {
        /**
         * String value used when hooking to tap event.
         */
        public static tapEvent: string;

        /**
         * Represents the observable property backing the text property.
         */
        public static textProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the icon property.
         */
        public static iconProperty: dependencyObservable.Property;

        /**
         * Represents the observable property backing the visibility property.
         */
        public static visibilityProperty: dependencyObservable.Property;

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
        actionView: view.View;

        /**
         * Gets or sets the visibility of the action item.
         */
        visibility: string;
        
        /**
         * Gets the action bar that contains the action item.
         */
        actionBar: ActionBar;

        /**
         * Gets the page that contains the action item.
         */
        page: pages.Page;

        /**
         * A basic method signature to hook an event listener (shortcut alias to the addEventListener method).
         * @param eventNames - String corresponding to events (e.g. "propertyChange"). Optionally could be used more events separated by `,` (e.g. "propertyChange", "change"). 
         * @param callback - Callback function which will be executed when event is raised.
         * @param thisArg - An optional parameter which will be used as `this` context for callback execution.
         */
        on(eventNames: string, callback: (data: observable.EventData) => void);

        /**
         * Raised when a tap event occurs.
         */
        on(event: "tap", callback: (args: observable.EventData) => void);

        //@private
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
     * Represents Android specific options of the action item.
     */
    export interface AndroidActionItemSettings {
        /**
         * Gets or sets the position of the action item in the action bar.
         *  1. actionBar - item is shown in the action bar.
         *  2. actionBarIfRoom - item is shown in the action bar if there is room for it. Otherwise it is put in the popup menu.
         *  3. popup - item is shown in the popup menu.
         * Note: Property not applicable to NavigationButton
         */
        position: string;
        
        /**
         * Gets or sets the name of the system drawable resource to be displayed.
         * Use this property instead of ActionItem.icon if you want to diplsay a built-in Android system icon.
         * The value should be a string such as 'ic_menu_search' if you want to display the built-in Android Menu Search icon for example.
         * For a full list of Android drawable names, please visit http://androiddrawables.com
         */
        systemIcon: string;
    }
    
    /**
     * Represents iOS specific options of the action item.
     */
    export interface IOSActionItemSettings {
        /**
         * Gets or sets the position of the action item in the action bar.
         *  1. left - items is shown at the left part of the navigation bar. This is the default value.
         *  2. right - items is shown at the right part of the navigation bar.
         * Note: Property not applicable to NavigationButton
         */
        position: string;

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
     * Represents Android specific options of the action bar.
     */
    export interface AndroidActionBarSettings {
        
        /**
         * Gets or sets the action bar icon.
         */
        icon: string;
        
        /**
         * Gets or sets the visibility of the action bar icon.
         * The icon is visible by default in pre-lollipop (API level < 20) versions of android and is hidden in lollipop (API level >= 20)
         * The possible values are:
         *  1. auto - the default behavior. This is the default value.
         *  2. always - the icon is aways shown.
         *  3. never - the icon is aways hidden.
         */
        iconVisibility: string;
    }

    /**
     * Represents the navigation (a.k.a. "back") button.
     */
    export class NavigationButton extends ActionItem {

    }

    //@private
    export function _setNavBarColor(navBar: any /* UINavigationBar */, color: any /* UIColor */);
    export function _setNavBarBackgroundColor(navBar: any /* UINavigationBar */, color: any /* UIColor */);
    //@endprivate
}
