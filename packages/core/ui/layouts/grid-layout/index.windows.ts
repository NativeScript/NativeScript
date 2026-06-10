export * from './grid-layout-common';

import { GridLayoutBase, ItemSpec as ItemSpecBase, rowProperty, columnProperty, rowSpanProperty, columnSpanProperty, GridUnitType } from './grid-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

(View.prototype as any)[rowProperty.setNative] = function (value: number) {
    const native = this.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
    if (native) {
        Microsoft.UI.Xaml.Controls.Grid.SetRow(native, value);
    }
};

(View.prototype as any)[columnProperty.setNative] = function (value: number) {
    const native = this.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
    if (native) {
        Microsoft.UI.Xaml.Controls.Grid.SetColumn(native, value);
    }
};

(View.prototype as any)[rowSpanProperty.setNative] = function (value: number) {
    const native = this.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
    if (native) {
        Microsoft.UI.Xaml.Controls.Grid.SetRowSpan(native, value);
    }
};

(View.prototype as any)[columnSpanProperty.setNative] = function (value: number) {
    const native = this.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
    if (native) {
        Microsoft.UI.Xaml.Controls.Grid.SetColumnSpan(native, value);
    }
};

export class GridLayout extends GridLayoutBase {
    nativeViewProtected: Microsoft.UI.Xaml.Controls.Grid;
    private _windows: Microsoft.UI.Xaml.Controls.Grid;

    constructor() {
        super();
        // WinRT deferred to createNativeView() — keeps constructor pure-JS.
    }

    public createNativeView() {
        this._windows = new Microsoft.UI.Xaml.Controls.Grid();
        return this._windows;
    }

    public initNativeView(): void {
        super.initNativeView && super.initNativeView();
        this._updateRowAndColumnDefinitions();
    }

    public resetNativeView(): void {
        if (this._windows) {
            this._windows.RowDefinitions.Clear();
            this._windows.ColumnDefinitions.Clear();
        }
        super.resetNativeView && super.resetNativeView();
    }

    // GridLength is a plain value struct {Value: f64, GridUnitType: i32} in WinRT ABI.
    // Pass as a plain JS object via the bridge's append_struct_object_bytes path — same
    // technique as Windows.UI.Color / Thickness. Skips the GridLengthHelper static WinRT
    // call that was previously required (constructing GridLength via `new` silently fails).
    // WinUI GridUnitType enum: Auto=0, Pixel=1, Star=2.
    private _toGridLength(itemSpec: ItemSpecBase): Microsoft.UI.Xaml.GridLength {
        if (itemSpec.gridUnitType === GridUnitType.AUTO) {
            return { Value: 1, GridUnitType: 0 } as any;
        } else if (itemSpec.gridUnitType === GridUnitType.STAR) {
            return { Value: itemSpec.value || 1, GridUnitType: 2 } as any;
        }
        return { Value: layout.toDeviceIndependentPixels(itemSpec.value), GridUnitType: 1 } as any;
    }

    private _createRowDefinition(itemSpec: ItemSpecBase): Microsoft.UI.Xaml.Controls.RowDefinition {
        const rd = new Microsoft.UI.Xaml.Controls.RowDefinition();
        rd.Height = this._toGridLength(itemSpec);
        return rd;
    }

    private _createColumnDefinition(itemSpec: ItemSpecBase): Microsoft.UI.Xaml.Controls.ColumnDefinition {
        const cd = new Microsoft.UI.Xaml.Controls.ColumnDefinition();
        cd.Width = this._toGridLength(itemSpec);
        return cd;
    }

    private _updateRowAndColumnDefinitions(): void {
        const native = this._windows;
        if (!native) return;

        const rowDefs: Microsoft.UI.Xaml.Controls.RowDefinition[] = [];
        for (let i = 0; i < this.rowsInternal.length; i++) {
            rowDefs.push(this._createRowDefinition(this.rowsInternal[i]));
        }
        // ReplaceAll crosses the WinRT IVector bridge and can throw on some
        // projections; fall back to Clear + per-item Append when it does.
        try {
            native.RowDefinitions.ReplaceAll(rowDefs);
        } catch (_e) {
            native.RowDefinitions.Clear();
            for (const rd of rowDefs) {
                native.RowDefinitions.Append(rd);
            }
        }

        const colDefs: Microsoft.UI.Xaml.Controls.ColumnDefinition[] = [];
        for (let i = 0; i < this.columnsInternal.length; i++) {
            colDefs.push(this._createColumnDefinition(this.columnsInternal[i]));
        }
        try {
            native.ColumnDefinitions.ReplaceAll(colDefs);
        } catch (_e) {
            native.ColumnDefinitions.Clear();
            for (const cd of colDefs) {
                native.ColumnDefinitions.Append(cd);
            }
        }
    }

    public _onRowAdded(itemSpec: ItemSpecBase) {
        this._updateRowAndColumnDefinitions();
    }

    public _onColumnAdded(itemSpec: ItemSpecBase) {
        this._updateRowAndColumnDefinitions();
    }

    public _onRowRemoved(itemSpec: ItemSpecBase, index: number) {
        this._updateRowAndColumnDefinitions();
    }

    public _onColumnRemoved(itemSpec: ItemSpecBase, index: number) {
        this._updateRowAndColumnDefinitions();
    }

    public _addViewToNativeVisualTree(child: View, atIndex: number = Number.MAX_SAFE_INTEGER): boolean {
        const res = super._addViewToNativeVisualTree(child, atIndex);

        const nativeChild = child.nativeViewProtected as Microsoft.UI.Xaml.FrameworkElement;
        if (res && nativeChild && this._windows) {
            Microsoft.UI.Xaml.Controls.Grid.SetRow(nativeChild, GridLayout.getRow(child));
            Microsoft.UI.Xaml.Controls.Grid.SetColumn(nativeChild, GridLayout.getColumn(child));
            Microsoft.UI.Xaml.Controls.Grid.SetRowSpan(nativeChild, GridLayout.getRowSpan(child));
            Microsoft.UI.Xaml.Controls.Grid.SetColumnSpan(nativeChild, GridLayout.getColumnSpan(child));
        }

        return res;
    }
}
