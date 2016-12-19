import {
    ActionBar as ActionBarDefinition,
    ActionItems as ActionItemsDefinition,
    ActionItem as ActionItemDefinition,
    IOSActionItemSettings, AndroidActionItemSettings, AndroidActionBarSettings,
    NavigationButton
} from "ui/action-bar";
import { Page } from "ui/page";
import { View, ViewBase, Bindable, Property, unsetValue, horizontalAlignmentProperty, verticalAlignmentProperty, HorizontalAlignment, VerticalAlignment } from "ui/core/view";

export * from "ui/core/view";

export module knownCollections {
    export var actionItems = "actionItems";
}

export class ActionBarBase extends View implements ActionBarDefinition {
    private _actionItems: ActionItems;
    private _navigationButton: NavigationButton;
    private _page: Page;
    private _titleView: View;

    public title: string;

    get navigationButton(): NavigationButton {
        return this._navigationButton;
    }
    set navigationButton(value: NavigationButton) {
        if (this._navigationButton !== value) {
            if (this._navigationButton) {
                this._navigationButton.actionBar = undefined;
            }

            this._navigationButton = value;

            if (this._navigationButton) {
                this._navigationButton.actionBar = this;
            }

            this.update();
        }
    }

    get actionItems(): ActionItems {
        return this._actionItems;
    }
    set actionItems(value: ActionItems) {
        throw new Error("actionItems property is read-only");
    }

    get titleView(): View {
        return this._titleView;
    }
    set titleView(value: View) {
        if (this._titleView !== value) {
            if (this._titleView) {
                this._removeView(this._titleView);
                this._titleView.style[horizontalAlignmentProperty.cssName] = unsetValue;
                this._titleView.style[verticalAlignmentProperty.cssName] = unsetValue;
            }

            this._titleView = value;

            if (this._titleView) {
                this._titleView.style[horizontalAlignmentProperty.cssName] = HorizontalAlignment.CENTER;
                this._titleView.style[verticalAlignmentProperty.cssName] = VerticalAlignment.MIDDLE;
                this._addView(this._titleView);
            }

            this.update();
        }
    }

    get page(): Page {
        return this._page;
    }
    set page(value: Page) {
        this._page = value;
        // // TODO: Move this in _eachChildView of Page class.
        // this.unbind("bindingContext");
        // this.bind({
        //     sourceProperty: "bindingContext",
        //     targetProperty: "bindingContext"
        // }, this._page);
    }

    get android(): AndroidActionBarSettings {
        return undefined;
    }

    get _childrenCount(): number {
        let actionViewsCount = 0;
        this._actionItems.getItems().forEach((actionItem) => {
            if (actionItem.actionView) {
                actionViewsCount++;
            }
        });

        return actionViewsCount + (this.titleView ? 1 : 0);
    }

    constructor() {
        super();
        this._actionItems = new ActionItems(this);
    }

    public static onTitleChanged

    public update() {
        // 
    }

    public _onTitlePropertyChanged() {
        //
    }

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "actionItems") {
            this.actionItems.setItems(value);
        }
    }

    public _addChildFromBuilder(name: string, value: any) {
        if (value instanceof NavigationButton) {
            this.navigationButton = value;
        }
        else if (value instanceof ActionItemDefinition) {
            this.actionItems.addItem(value);
        }
        else if (value instanceof View) {
            this.titleView = value;
        }
    }

    // public _onBindingContextChanged(oldValue: any, newValue: any) {
    //     super._onBindingContextChanged(oldValue, newValue);
    //     if (this._navigationButton) {
    //         this._navigationButton.bindingContext = newValue;
    //     }

    //     this._actionItems.getItems().forEach((item, i, arr) => { item.bindingContext = newValue; });
    // }

    public _eachChildView(callback: (child: View) => boolean) {
        if (this.titleView) {
            callback(this.titleView);
        }

        this.actionItems.getItems().forEach((actionItem) => {
            if (actionItem.actionView) {
                callback(actionItem.actionView);
            }
        });
    }

    public _isEmpty(): boolean {
        if (this.title ||
            this.titleView ||
            (this.android && this.android.icon) ||
            this.navigationButton ||
            this.actionItems.getItems().length > 0) {

            return false;
        }

        return true;
    }
}

export class ActionItems implements ActionItemsDefinition {
    private _items = new Array<ActionItemDefinition>();
    private _actionBar: ActionBarDefinition;

    constructor(actionBar: ActionBarDefinition) {
        this._actionBar = actionBar;
    }

    public addItem(item: ActionItemDefinition): void {
        if (!item) {
            throw new Error("Cannot add empty item");
        }

        this._items.push(item);
        item.actionBar = this._actionBar;
        this.invalidate();
    }

    public removeItem(item: ActionItemDefinition): void {
        if (!item) {
            throw new Error("Cannot remove empty item");
        }

        var itemIndex = this._items.indexOf(item);
        if (itemIndex < 0) {
            throw new Error("Cannot find item to remove");
        }

        this._items.splice(itemIndex, 1);
        item.actionBar = undefined;
        this.invalidate();
    }

    public getItems(): Array<ActionItemDefinition> {
        return this._items.slice();
    }

    public getVisibleItems(): Array<ActionItemDefinition> {
        var visibleItems = [];
        this._items.forEach((item) => {
            if (isVisible(item)) {
                visibleItems.push(item);
            }
        });

        return visibleItems;
    }

    public getItemAt(index: number): ActionItemDefinition {
        if (index < 0 || index >= this._items.length) {
            return undefined;
        }

        return this._items[index];
    }

    public setItems(items: Array<ActionItemDefinition>) {
        // Remove all existing items
        while (this._items.length > 0) {
            this.removeItem(this._items[this._items.length - 1]);
        }

        // Add new items
        for (var i = 0; i < items.length; i++) {
            this.addItem(items[i]);
        }

        this.invalidate();
    }

    private invalidate() {
        if (this._actionBar) {
            this._actionBar.update();
        }
    }
}

export class ActionItemBase extends ViewBase implements ActionItemDefinition {
    public static tapEvent = "tap";

    private _actionBar: ActionBarDefinition;
    private _actionView: View;

    public ios: IOSActionItemSettings;
    public android: AndroidActionItemSettings;

    public text: string;
    public icon: string;
    public visibility: string;

    get actionView(): View {
        return this._actionView;
    }
    set actionView(value: View) {
        if (this._actionView !== value) {
            if (this._actionView && this._actionBar) {
                this._actionBar._removeView(this._actionView);
                this._actionView.style[horizontalAlignmentProperty.cssName] = unsetValue;
                this._actionView.style[verticalAlignmentProperty.cssName] = unsetValue;
            }

            this._actionView = value;
            this._addActionViewToActionBar();
            if (this._actionBar) {
                this._actionBar.update();
            }
        }
    }

    get actionBar(): ActionBarDefinition {
        return this._actionBar;
    }
    set actionBar(value: ActionBarDefinition) {
        if (value !== this._actionBar) {
            this._actionBar = value;
            if (this._actionBar) {
                // ActionBarBase overrides _eachChildView so bindingContext should work without any manual work.
                // this.bindingContext = this._actionBar.bindingContext;
                this._addActionViewToActionBar();
            }
        }
    }

    get page(): Page {
        return this.actionBar ? this.actionBar.page : undefined;
    }

    public _raiseTap() {
        this._emit(ActionItemBase.tapEvent);
    }

    public _addChildFromBuilder(name: string, value: any) {
        this.actionView = value;
    }

    private _addActionViewToActionBar() {
        if (this._actionView && !this._actionView._isAddedToNativeVisualTree && this._actionBar) {
            this._actionView.style[horizontalAlignmentProperty.cssName] = HorizontalAlignment.CENTER;
            this._actionView.style[verticalAlignmentProperty.cssName] = VerticalAlignment.MIDDLE;
            this._actionBar._addView(this._actionView);
        }
    }
}

export function isVisible(item: ActionItemDefinition) {
    return item.visibility === "visible";
}

function onTitlePropertyChanged(actionBar: ActionBarBase, oldValue: string, newValue: string) {
    actionBar._onTitlePropertyChanged();
}

let titleProperty = new Property<ActionBarBase, string>({ name: "title", valueChanged: onTitlePropertyChanged });
titleProperty.register(ActionBarBase);


function onItemChanged(item: ActionItemBase, oldValue: string, newValue: string) {
    if (item.actionBar) {
        item.actionBar.update();
    }
}

let textProperty = new Property<ActionItemBase, string>({ name: "text", defaultValue: "", valueChanged: onItemChanged });
textProperty.register(ActionItemBase);

let iconProperty = new Property<ActionItemBase, string>({ name: "icon", valueChanged: onItemChanged });
iconProperty.register(ActionItemBase);

let visibilityProperty = new Property({ name: "visibility", defaultValue: "visible", valueChanged: onItemChanged });
visibilityProperty.register(ActionItemBase);