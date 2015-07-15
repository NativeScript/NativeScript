import utils = require("utils/utils");
import dependencyObservable = require("ui/core/dependency-observable");
import view = require("ui/core/view");
import proxy = require("ui/core/proxy");
import common = require("ui/layouts/grid-layout/grid-layout-common");

// merge the exports of the common file with the exports of this file
declare var exports;
require("utils/module-merge").merge(common, exports);

function setNativeProperty(data: dependencyObservable.PropertyChangeData, setter: (lp: org.nativescript.widgets.CommonLayoutParams) => void) {

    var uiView = data.object;
    if (uiView instanceof view.View) {
        var nativeView: android.view.View = uiView._nativeView;

        var lp = <org.nativescript.widgets.CommonLayoutParams>nativeView.getLayoutParams();
        if (!(lp instanceof org.nativescript.widgets.CommonLayoutParams)) {
            lp = new org.nativescript.widgets.CommonLayoutParams();
        }
        setter(lp);
        nativeView.setLayoutParams(lp);
    }
}

function setNativeRowProperty(data: dependencyObservable.PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.row = data.newValue; });
}

function setNativeRowSpanProperty(data: dependencyObservable.PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.rowSpan = data.newValue; });
}

function setNativeColumnProperty(data: dependencyObservable.PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.column = data.newValue; });
}

function setNativeColumnSpanProperty(data: dependencyObservable.PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.columnSpan = data.newValue; });
}

(<proxy.PropertyMetadata>common.GridLayout.rowProperty.metadata).onSetNativeValue = setNativeRowProperty;
(<proxy.PropertyMetadata>common.GridLayout.rowSpanProperty.metadata).onSetNativeValue = setNativeRowSpanProperty;
(<proxy.PropertyMetadata>common.GridLayout.columnProperty.metadata).onSetNativeValue = setNativeColumnProperty;
(<proxy.PropertyMetadata>common.GridLayout.columnSpanProperty.metadata).onSetNativeValue = setNativeColumnSpanProperty;

function createNativeSpec(itemSpec: common.ItemSpec): org.nativescript.widgets.ItemSpec {
    switch (itemSpec.gridUnitType) {
        case common.GridUnitType.auto:
            return new org.nativescript.widgets.ItemSpec(itemSpec.value, org.nativescript.widgets.GridUnitType.auto);

        case common.GridUnitType.star:
            return new org.nativescript.widgets.ItemSpec(itemSpec.value, org.nativescript.widgets.GridUnitType.star);

        case common.GridUnitType.pixel:
            return new org.nativescript.widgets.ItemSpec(itemSpec.value * utils.layout.getDisplayDensity(), org.nativescript.widgets.GridUnitType.pixel);

        default:
            throw new Error("Invalid gridUnitType: " + itemSpec.gridUnitType);
    }
}

export class GridLayout extends common.GridLayout {

    private _layout: org.nativescript.widgets.GridLayout;

    get android(): org.nativescript.widgets.GridLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.GridLayout {
        return this._layout;
    }

    public _createUI() {
        this._layout = new org.nativescript.widgets.GridLayout(this._context);
        
        // Update native GridLayout
        this.getRows().forEach((itemSpec, index, rows) => { this.onRowAdded(itemSpec); }, this);
        this.getColumns().forEach((itemSpec, index, rows) => { this.onColumnAdded(itemSpec); }, this);
    }

    protected onRowAdded(itemSpec: common.ItemSpec) {
        if (this._layout) {
            this._layout.addRow(createNativeSpec(itemSpec));
        }
    }

    protected onColumnAdded(itemSpec: common.ItemSpec) {
        if (this._layout) {
            this._layout.addColumn(createNativeSpec(itemSpec));
        }
    }

    protected onRowRemoved(itemSpec: common.ItemSpec, index: number) {
        if (this._layout) {
            this._layout.removeRowAt(index);
        }
    }

    protected onColumnRemoved(itemSpec: common.ItemSpec, index: number) {
        if (this._layout) {
            this._layout.removeColumnAt(index);
        }
    }
}