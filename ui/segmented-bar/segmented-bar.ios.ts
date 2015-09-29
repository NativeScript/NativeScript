import definition = require("ui/segmented-bar");
import common = require("./segmented-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");
import color = require("color");

global.moduleMerge(common, exports);

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

    if (data.newValue instanceof color.Color) {
        view.ios.tintColor = (<color.Color>data.newValue).ios;
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

        this._selectionHandler = SelectionHandlerImpl.new().initWithOwner(this);
        this._ios.addTargetActionForControlEvents(this._selectionHandler, "selected", UIControlEvents.UIControlEventValueChanged);
    }

    get ios(): UISegmentedControl {
        return this._ios;
    }
}

class SelectionHandlerImpl extends NSObject {
    static new(): SelectionHandlerImpl {
        return <SelectionHandlerImpl>super.new();
    }

    private _owner: SegmentedBar;

    public initWithOwner(owner: SegmentedBar): SelectionHandlerImpl {
        this._owner = owner;
        return this;
    }

    public selected(sender: UISegmentedControl) {
        this._owner.selectedIndex = sender.selectedSegmentIndex;
    }

    public static ObjCExposedMethods = {
        "selected": { returns: interop.types.void, params: [UISegmentedControl] }
    };
}
