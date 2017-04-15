import { Font } from "../styling/font";
import {
    SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty,
    colorProperty, fontInternalProperty, Color
} from "./segmented-bar-common";

import { ios } from "../../utils/utils";

export * from "./segmented-bar-common";

export class SegmentedBarItem extends SegmentedBarItemBase {
    public _update() {
        const parent = <SegmentedBar>this.parent;
        if (parent) {
            let tabIndex = parent.items.indexOf(this);
            let title = this.title;
            title = (title === null || title === undefined) ? "" : title;
            parent.ios.setTitleForSegmentAtIndex(title, tabIndex);
        }
    }
}

export class SegmentedBar extends SegmentedBarBase {
    private _ios: UISegmentedControl;
    private _selectionHandler: NSObject;

    constructor() {
        super();
        this.nativeView = this._ios = UISegmentedControl.new();

        this._selectionHandler = SelectionHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._selectionHandler, "selected", UIControlEvents.ValueChanged);
    }

    get ios(): UISegmentedControl {
        return this._ios;
    }

    [selectedIndexProperty.getDefault](): number {
        return -1;
    }
    [selectedIndexProperty.setNative](value: number) {
        this._ios.selectedSegmentIndex = value;
    }

    [itemsProperty.getDefault](): SegmentedBarItem[] {
        return null;
    }
    [itemsProperty.setNative](value: SegmentedBarItem[]) {
        const segmentedControl = this._ios;
        segmentedControl.removeAllSegments();
        const newItems = value;

        if (newItems && newItems.length) {
            newItems.forEach((item, index, arr) => {
                let title = item.title;
                title = (title === null || title === undefined) ? "" : title;
                segmentedControl.insertSegmentWithTitleAtIndexAnimated(title, index, false);
            })
        }

        selectedIndexProperty.coerce(this);
    }

    [selectedBackgroundColorProperty.getDefault](): UIColor {
        return this._ios.tintColor;
    }
    [selectedBackgroundColorProperty.setNative](value: UIColor | Color) {
        let color = value instanceof Color ? value.ios : value;
        this._ios.tintColor = color;
    }

    [colorProperty.getDefault](): UIColor {
        return null;
    }
    [colorProperty.setNative](value: Color | UIColor) {
        let color = value instanceof Color ? value.ios : value;
        let bar = this._ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.Normal);
        let attrs = currentAttrs ? currentAttrs.mutableCopy() : NSMutableDictionary.new();
        attrs.setValueForKey(color, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.Normal);
    }

    [fontInternalProperty.getDefault](): Font {
        return null
    }
    [fontInternalProperty.setNative](value: Font) {
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
