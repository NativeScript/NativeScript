import utils = require("utils/utils");
import common = require("./grid-layout-common");
import {View} from "ui/core/view";
import {PropertyMetadata} from "ui/core/proxy";
import {PropertyChangeData} from "ui/core/dependency-observable";

global.moduleMerge(common, exports);

function setNativeProperty(data: PropertyChangeData, setter: (lp: org.nativescript.widgets.CommonLayoutParams) => void) {
    let view = data.object;
    if (view instanceof View) {
        let nativeView: android.view.View = view._nativeView;
        var lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
        if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
            setter(lp);
            nativeView.setLayoutParams(lp);
        }
    }
}

function setNativeRowProperty(data: PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.row = data.newValue; });
}

function setNativeRowSpanProperty(data: PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.rowSpan = data.newValue; });
}

function setNativeColumnProperty(data: PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.column = data.newValue; });
}

function setNativeColumnSpanProperty(data: PropertyChangeData) {
    setNativeProperty(data, (lp) => { lp.columnSpan = data.newValue; });
}

(<PropertyMetadata>common.GridLayout.rowProperty.metadata).onSetNativeValue = setNativeRowProperty;
(<PropertyMetadata>common.GridLayout.rowSpanProperty.metadata).onSetNativeValue = setNativeRowSpanProperty;
(<PropertyMetadata>common.GridLayout.columnProperty.metadata).onSetNativeValue = setNativeColumnProperty;
(<PropertyMetadata>common.GridLayout.columnSpanProperty.metadata).onSetNativeValue = setNativeColumnSpanProperty;

function createNativeSpec(itemSpec: ItemSpec): org.nativescript.widgets.ItemSpec {
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

export class ItemSpec extends common.ItemSpec {
    nativeSpec: org.nativescript.widgets.ItemSpec;

    public get actualLength(): number {
        if (this.nativeSpec) {
            return Math.round(this.nativeSpec.getActualLength() / utils.layout.getDisplayDensity());
        }

        return 0;
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
        this.getRows().forEach((itemSpec: ItemSpec, index, rows) => { this._onRowAdded(itemSpec); }, this);
        this.getColumns().forEach((itemSpec: ItemSpec, index, rows) => { this._onColumnAdded(itemSpec); }, this);
    }

    public _onRowAdded(itemSpec: ItemSpec) {
        if (this._layout) {
            var nativeSpec = createNativeSpec(itemSpec);
            itemSpec.nativeSpec = nativeSpec;
            this._layout.addRow(nativeSpec);
        }
    }

    public _onColumnAdded(itemSpec: ItemSpec) {
        if (this._layout) {
            var nativeSpec = createNativeSpec(itemSpec);
            itemSpec.nativeSpec = nativeSpec;
            this._layout.addColumn(nativeSpec);
        }
    }

    public _onRowRemoved(itemSpec: ItemSpec, index: number) {
        itemSpec.nativeSpec = null;
        if (this._layout) {
            this._layout.removeRowAt(index);
        }
    }

    public _onColumnRemoved(itemSpec: ItemSpec, index: number) {
        itemSpec.nativeSpec = null;
        if (this._layout) {
            this._layout.removeColumnAt(index);
        }
    }

    protected invalidate(): void {
        // No need to request layout for android because it will be done in the native call.
    }
}
