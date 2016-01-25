import definition = require("ui/segmented-bar");
import common = require("./segmented-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");
import * as colorModule from "color";
import style = require("ui/styling/style");
import font = require("ui/styling/font");
import styling = require("ui/styling");
import view = require("ui/core/view");

global.moduleMerge(common, exports);

var color: typeof colorModule;
function ensureColor() {
    if (!color) {
        color = require("color");
    }
}

function onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.ios || !view.items) {
        return;
    }

    var index = <number>data.newValue;
    if (types.isNumber(index)) {
        if (index >= 0 && index <= view.items.length - 1) {
            view.ios.selectedSegmentIndex = index;
        } else {
            view.selectedIndex = undefined;
            throw new Error("selectedIndex should be between [0, items.length - 1]");
        }

        var args = { eventName: SegmentedBar.selectedIndexChangedEvent, object: view, oldIndex: data.oldValue, newIndex: data.newValue };
        view.notify(args);
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.selectedIndexProperty.metadata).onSetNativeValue = onSelectedIndexPropertyChanged;

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.ios) {
        return;
    }

    var oldItems = <Array<definition.SegmentedBarItem>>data.oldValue;
    if (oldItems && oldItems.length) {
        for (var i = 0; i < oldItems.length; i++) {
            (<SegmentedBarItem>oldItems[i])._parent = null;
        }
    }
    view._adjustSelectedIndex(newItems);
    view.ios.removeAllSegments();

    var newItems = <Array<definition.SegmentedBarItem>>data.newValue;
    if (newItems && newItems.length) {
        for (var i = 0; i < newItems.length; i++) {
            view.ios.insertSegmentWithTitleAtIndexAnimated(newItems[i].title || "", i, false);
            (<SegmentedBarItem>newItems[i])._parent = view;
        }

        if (view.ios.selectedSegmentIndex !== view.selectedIndex) {
            view.ios.selectedSegmentIndex = view.selectedIndex;
        }
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.itemsProperty.metadata).onSetNativeValue = onItemsPropertyChanged;

function onSelectedBackgroundColorPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.ios) {
        return;
    }

    ensureColor();

    if (data.newValue instanceof color.Color) {
        view.ios.tintColor = data.newValue.ios;
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.selectedBackgroundColorProperty.metadata).onSetNativeValue = onSelectedBackgroundColorPropertyChanged;

export class SegmentedBarItem extends common.SegmentedBarItem {
    public _update() {
        if (this._parent) {
            var tabIndex = this._parent.items.indexOf(this);
            this._parent.ios.setTitleForSegmentAtIndex(this.title || "", tabIndex);
        }
    }
}

export class SegmentedBar extends common.SegmentedBar {
    private _ios: UISegmentedControl;
    private _selectionHandler: NSObject;

    constructor() {
        super();
        this._ios = UISegmentedControl.new();

        this._selectionHandler = SelectionHandlerImpl.initWithOwner(new WeakRef(this));
        this._ios.addTargetActionForControlEvents(this._selectionHandler, "selected", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UISegmentedControl {
        return this._ios;
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

export class SegmentedBarStyler implements style.Styler {
    //Text color methods
    private static setColorProperty(v: view.View, newValue: any) {
        let bar = <UISegmentedControl>v.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        attrs.setValueForKey(newValue, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    private static resetColorProperty(v: view.View, nativeValue: any) {
        let bar = <UISegmentedControl>v.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        attrs.setValueForKey(nativeValue, NSForegroundColorAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    //Text fonts methods
    private static setFontInternalProperty(v: view.View, newValue: any) {
        let bar = <UISegmentedControl>v.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        let newFont = (<font.Font>newValue).getUIFont(UIFont.systemFontOfSize(UIFont.labelFontSize()));
        attrs.setValueForKey(newFont, NSFontAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    private static resetFontInternalProperty(v: view.View, nativeValue: any) {
        let bar = <UISegmentedControl>v.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let attrs;
        if (currentAttrs) {
            attrs = currentAttrs.mutableCopy();
        }
        else {
            attrs = NSMutableDictionary.new();
        }
        attrs.setValueForKey(nativeValue, NSFontAttributeName);
        bar.setTitleTextAttributesForState(attrs, UIControlState.UIControlStateNormal);
    }

    private static getNativeFontValue(v: view.View) {
        let bar = <UISegmentedControl>v.ios;
        let currentAttrs = bar.titleTextAttributesForState(UIControlState.UIControlStateNormal);
        let currentFont;
        if (currentAttrs) {
            currentFont = currentAttrs.objectForKey(NSFontAttributeName);
        }
        if (!currentFont) {
            currentFont = UIFont.systemFontOfSize(UIFont.labelFontSize());
        }
        return currentFont;
    }

    public static registerHandlers() {
        style.registerHandler(style.colorProperty, new style.StylePropertyChangedHandler(
            SegmentedBarStyler.setColorProperty,
            SegmentedBarStyler.resetColorProperty), "SegmentedBar");
        style.registerHandler(style.fontInternalProperty, new style.StylePropertyChangedHandler(
            SegmentedBarStyler.setFontInternalProperty,
            SegmentedBarStyler.resetFontInternalProperty,
            SegmentedBarStyler.getNativeFontValue), "SegmentedBar");
    }
}

SegmentedBarStyler.registerHandlers();
