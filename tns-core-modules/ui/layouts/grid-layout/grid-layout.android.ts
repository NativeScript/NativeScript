import {
    GridLayoutBase, ItemSpec as ItemSpecBase, View, layout,
    rowProperty, columnProperty, rowSpanProperty, columnSpanProperty, GridUnitType
} from "./grid-layout-common";

export * from "./grid-layout-common";

function setNativeProperty(view: View, setter: (lp: org.nativescript.widgets.CommonLayoutParams) => void) {
    const nativeView: android.view.View = view._nativeView;
    const lp = nativeView.getLayoutParams() || new org.nativescript.widgets.CommonLayoutParams();
    if (lp instanceof org.nativescript.widgets.CommonLayoutParams) {
        setter(lp);
        nativeView.setLayoutParams(lp);
    }
}

// define native getter and setter for rowProperty.
let rowDescriptor: TypedPropertyDescriptor<number> = {
    enumerable: true,
    configurable: true,
    get: () => 0,
    set: function (this: View, value: number) {
        setNativeProperty(this, (lp) => lp.row = value);
    }
}

// define native getter and setter for columnProperty.
let colDescriptor: TypedPropertyDescriptor<number> = {
    enumerable: true,
    configurable: true,
    get: () => 0,
    set: function (this: View, value: number) {
        setNativeProperty(this, (lp) => lp.column = value);
    }
}

// define native getter and setter for rowSpanProperty.
let rowSpanDescriptor: TypedPropertyDescriptor<number> = {
    enumerable: true,
    configurable: true,
    get: () => 1,
    set: function (this: View, value: number) {
        setNativeProperty(this, (lp) => lp.rowSpan = value);
    }
}

// define native getter and setter for columnSpanProperty.
let colSpanDescriptor: TypedPropertyDescriptor<number> = {
    enumerable: true,
    configurable: true,
    get: () => 1,
    set: function (this: View, value: number) {
        setNativeProperty(this, (lp) => lp.columnSpan = value);
    }
}

// register native properties on View type.
Object.defineProperties(View.prototype, {
    [rowProperty.native]: rowDescriptor,
    [columnProperty.native]: colDescriptor,
    [rowSpanProperty.native]: rowSpanDescriptor,
    [columnSpanProperty.native]: colSpanDescriptor
});

function createNativeSpec(itemSpec: ItemSpec): org.nativescript.widgets.ItemSpec {
    switch (itemSpec.gridUnitType) {
        case GridUnitType.AUTO:
            return new org.nativescript.widgets.ItemSpec(itemSpec.value, org.nativescript.widgets.GridUnitType.auto);

        case GridUnitType.STAR:
            return new org.nativescript.widgets.ItemSpec(itemSpec.value, org.nativescript.widgets.GridUnitType.star);

        case GridUnitType.PIXEL:
            return new org.nativescript.widgets.ItemSpec(itemSpec.value * layout.getDisplayDensity(), org.nativescript.widgets.GridUnitType.pixel);

        default:
            throw new Error("Invalid gridUnitType: " + itemSpec.gridUnitType);
    }
}

export class ItemSpec extends ItemSpecBase {
    nativeSpec: org.nativescript.widgets.ItemSpec;

    public get actualLength(): number {
        if (this.nativeSpec) {
            return Math.round(this.nativeSpec.getActualLength() / layout.getDisplayDensity());
        }

        return 0;
    }
}

export class GridLayout extends GridLayoutBase {

    private _layout: org.nativescript.widgets.GridLayout;

    get android(): org.nativescript.widgets.GridLayout {
        return this._layout;
    }

    get _nativeView(): org.nativescript.widgets.GridLayout {
        return this._layout;
    }

    public _createNativeView() {
        this._layout = new org.nativescript.widgets.GridLayout(this._context);

        // Update native GridLayout
        this.getRows().forEach((itemSpec: ItemSpec, index, rows) => { this._onRowAdded(itemSpec); }, this);
        this.getColumns().forEach((itemSpec: ItemSpec, index, rows) => { this._onColumnAdded(itemSpec); }, this);
    }

    public _onRowAdded(itemSpec: ItemSpec) {
        if (this._layout) {
            const nativeSpec = createNativeSpec(itemSpec);
            itemSpec.nativeSpec = nativeSpec;
            this._layout.addRow(nativeSpec);
        }
    }

    public _onColumnAdded(itemSpec: ItemSpec) {
        if (this._layout) {
            const nativeSpec = createNativeSpec(itemSpec);
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