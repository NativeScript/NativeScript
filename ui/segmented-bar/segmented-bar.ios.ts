import common = require("ui/segmented-bar/segmented-bar-common");
import dependencyObservable = require("ui/core/dependency-observable");
import proxy = require("ui/core/proxy");
import types = require("utils/types");
import color = require("color");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

function onSelectedIndexPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.ios || !view.items) {
        return;
    }

    var index = <number>data.newValue;
    if (types.isNumber(index) && index >= 0 && index <= view.items.length - 1) {
        view.ios.selectedSegmentIndex = index;
    }
}
(<proxy.PropertyMetadata>common.SegmentedBar.selectedIndexProperty.metadata).onSetNativeValue = onSelectedIndexPropertyChanged;

function onItemsPropertyChanged(data: dependencyObservable.PropertyChangeData) {
    var view = <SegmentedBar>data.object;
    if (!view.ios) {
        return;
    }

    view.ios.removeAllSegments();

    for (var i = 0; i < view.items.length; i++) {
        view.ios.insertSegmentWithTitleAtIndexAnimated(view.items[i].title, i, false);
    }

    view._adjustSelectedIndex();

    if (view.ios.selectedSegmentIndex !== view.selectedIndex) {
        view.ios.selectedSegmentIndex = view.selectedIndex;
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