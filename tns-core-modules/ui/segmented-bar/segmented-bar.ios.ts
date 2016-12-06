import {
    SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty,
    colorProperty, fontInternalProperty, Color, Font
} from "./segmented-bar-common";

import { ios } from "utils/utils";

export * from "./segmented-bar-common";

export class SegmentedBarItem extends SegmentedBarItemBase {
    public _update() {
        if (this._parent) {
            let tabIndex = this._parent.items.indexOf(this);
            this._parent.ios.setTitleForSegmentAtIndex(this.title || "", tabIndex);
        }
    }
}

export class SegmentedBar extends SegmentedBarBase {
    private _ios: UISegmentedControl;
    private _selectionHandler: NSObject;

    constructor() {
        super();
        this._ios = UISegmentedControl.new();

        this._selectionHandler = SelectionHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._selectionHandler, "selected", UIControlEvents.ValueChanged);
    }

    get ios(): UISegmentedControl {
        return this._ios;
    }

    public insertTab(tabItem: SegmentedBarItem, index?: number): void {
        tabItem._parent = this;
        this.ios.insertSegmentWithTitleAtIndexAnimated(tabItem.title, this.getValidIndex(index), false);
    }

    get [selectedIndexProperty.native](): number {
        return -1;
    }
    set [selectedIndexProperty.native](value: number) {
        let items = this.items;
        if (!items) {
            return;
        }

        if (value >= 0 && value <= (items.length - 1)) {
            this._ios.selectedSegmentIndex = value;
            this.notify({ eventName: SegmentedBar.selectedIndexChangedEvent, object: this, oldIndex: this.previousSelectedIndex, newIndex: value });
        }
    }

    private previousItems: SegmentedBarItem[];
    get [itemsProperty.native](): SegmentedBarItem[] {
        return null;
    }
    set [itemsProperty.native](value: SegmentedBarItem[]) {
        const oldItems = this.previousItems;
        if (oldItems) {
            for (let i = 0, length = oldItems.length; i < length; i++) {
                oldItems[i]._parent = null;
            }
        }

        let segmentedControl = this._ios;
        segmentedControl.removeAllSegments();
        const newItems = value;
        this._adjustSelectedIndex(newItems);

        if (newItems && newItems.length) {
            for (let i = 0; i < newItems.length; i++) {
                this.insertTab(newItems[i], i);
            }

            if (segmentedControl.selectedSegmentIndex !== this.selectedIndex) {
                segmentedControl.selectedSegmentIndex = this.selectedIndex;
            }
        }
    }

    get [selectedBackgroundColorProperty.native](): UIColor {
        return this._ios.tintColor;
    }
    set [selectedBackgroundColorProperty.native](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this._ios.tintColor = color;
    }

    get [colorProperty.native](): UIColor {
        return null;
    }
    set [colorProperty.native](value: Color | UIColor) {
        let color = value instanceof Color ? value.ios : value;
        let bar = this._ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.Normal);
        let attrs = currentAttrs ? currentAttrs.mutableCopy() : NSMutableDictionary.new();
        attrs.setValueForKey(color, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.Normal);
    }

    get [fontInternalProperty.native](): Font {
        return null
    }
    set [fontInternalProperty.native](value: Font) {
        let font: UIFont = value ? value.getUIFont(UIFont.systemFontOfSize(ios.getter(UIFont, UIFont.labelFontSize))) : null;
        let bar = this._ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.Normal);
        let attrs = currentAttrs ? currentAttrs.mutableCopy() : NSMutableDictionary.new();
        attrs.setValueForKey(font, NSFontAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.Normal);
    }
}

class SelectionHandlerImpl extends NSObject {

    private _owner: WeakRef<SegmentedBar>;

    public static initWithOwner(owner: WeakRef<SegmentedBar>): SelectionHandlerImpl {
        let handler = <SelectionHandlerImpl>SelectionHandlerImpl.new();
        handler._owner = owner;
        return handler;
    }

    public selected(sender: UISegmentedControl) {
        let owner = this._owner.get();
        if (owner) {
            owner.selectedIndex = sender.selectedSegmentIndex;
        }
    }

    public static ObjCExposedMethods = {
        "selected": { returns: interop.types.void, params: [UISegmentedControl] }
    };
}
