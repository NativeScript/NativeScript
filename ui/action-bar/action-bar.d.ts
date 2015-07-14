declare module "ui/action-bar" {
    import observable = require("data/observable");
    import view = require("ui/core/view");
    import dependencyObservable = require("ui/core/dependency-observable");
    import bindable = require("ui/core/bindable");
    import pages = require("ui/page");

    export class ActionBar extends view.View implements view.AddArrayFromBuilder, view.AddChildFromBuilder {
        title: string;
        icon: string;
        androidIconVisibility: string;

        navigationButton: NavigationButton;
        actionItems: ActionItems;
        titleView: view.View;

        page: pages.Page;

        shouldShow(): boolean

        updateActionBar();

        //@private
        _updateAndroidActionBar(menu: android.view.IMenu);
        _onAndroidItemSelected(itemId: number): boolean

        _addArrayFromBuilder(name: string, value: Array<any>): void;
        _addChildFromBuilder(name: string, value: any): void;

        //@endprivate
    }

    export class ActionItems {
        addItem(item: ActionItem): void;
        removeItem(item: ActionItem): void;
        getItems(): Array<ActionItem>;
        getItemAt(index: number): ActionItem;
    }

    export class ActionItemBase extends bindable.Bindable {
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

        text: string;
        icon: string;

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
    }

    export class ActionItem extends ActionItemBase {
        androidPosition: string;
        iosPosition: string;
    }

    export class NavigationButton extends ActionItemBase {

    }
}