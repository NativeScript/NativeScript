export * from './grid-layout-common';

import { GridLayoutBase, ItemSpec as ItemSpecBase, rowProperty, columnProperty, rowSpanProperty, columnSpanProperty, GridUnitType } from './grid-layout-common';
import { View } from '../../core/view';
import { layout } from '../../../utils';

function setGridAttachedProperty(setterName: string, native: any, value: number) {
    try {
        const Grid = Windows.UI.Xaml.Controls.Grid as any;
        if (Grid && typeof Grid[setterName] === 'function') {
            Grid[setterName](native, value);
        }
    } catch (_e) {}
}

// Attach native setters on View so Grid layout attached properties apply to native elements
(View.prototype as any)[rowProperty.setNative] = function (value: number) {
    const native = (this as any).nativeViewProtected as any;
    if (native) {
        setGridAttachedProperty('SetRow', native, value);
    }
};

(View.prototype as any)[columnProperty.setNative] = function (value: number) {
    const native = (this as any).nativeViewProtected as any;
    if (native) {
        setGridAttachedProperty('SetColumn', native, value);
    }
};

(View.prototype as any)[rowSpanProperty.setNative] = function (value: number) {
    const native = (this as any).nativeViewProtected as any;
    if (native) {
        setGridAttachedProperty('SetRowSpan', native, value);
    }
};

(View.prototype as any)[columnSpanProperty.setNative] = function (value: number) {
    const native = (this as any).nativeViewProtected as any;
    if (native) {
        setGridAttachedProperty('SetColumnSpan', native, value);
    }
};

export class GridLayout extends GridLayoutBase {
    nativeViewProtected: Windows.UI.Xaml.Controls.Grid;
    private _windows: Windows.UI.Xaml.Controls.Grid;

    constructor() {
        super();
        this._windows = new Windows.UI.Xaml.Controls.Grid();
    }

    public createNativeView() {
        return this._windows;
    }

    public initNativeView(): void {
        super.initNativeView && super.initNativeView();
        this._updateRowAndColumnDefinitions();
    }

    public resetNativeView(): void {
        try {
            if (this._windows) {
                try { this._windows.RowDefinitions.Clear(); } catch (_e) {}
                try { this._windows.ColumnDefinitions.Clear(); } catch (_e) {}
            }
        } catch (_e) {}
        super.resetNativeView && super.resetNativeView();
    }

    private _createRowDefinition(itemSpec: ItemSpecBase) {
        try {
            const rd = new Windows.UI.Xaml.Controls.RowDefinition();
            try {
                if (itemSpec.gridUnitType === GridUnitType.AUTO) {
                    rd.Height = new Windows.UI.Xaml.GridLength(1, Windows.UI.Xaml.GridUnitType.auto);
                } else if (itemSpec.gridUnitType === GridUnitType.STAR) {
                    rd.Height = new Windows.UI.Xaml.GridLength(itemSpec.value, Windows.UI.Xaml.GridUnitType.star);
                } else {
                    // pixel
                    rd.Height = new Windows.UI.Xaml.GridLength(layout.toDeviceIndependentPixels(itemSpec.value), Windows.UI.Xaml.GridUnitType.pixel);
                }
            } catch (_e) {}
            return rd;
        } catch (_e) {
            return null;
        }
    }

    private _createColumnDefinition(itemSpec: ItemSpecBase) {
        try {
            const cd = new Windows.UI.Xaml.Controls.ColumnDefinition();
            try {
                if (itemSpec.gridUnitType === GridUnitType.AUTO) {
                    cd.Width = new Windows.UI.Xaml.GridLength(1, Windows.UI.Xaml.GridUnitType.auto);
                } else if (itemSpec.gridUnitType === GridUnitType.STAR) {
                    cd.Width = new Windows.UI.Xaml.GridLength(itemSpec.value, Windows.UI.Xaml.GridUnitType.star);
                } else {
                    // pixel
                    cd.Width = new Windows.UI.Xaml.GridLength(layout.toDeviceIndependentPixels(itemSpec.value), Windows.UI.Xaml.GridUnitType.pixel);
                }
            } catch (_e) {}
            return cd;
        } catch (_e) {
            return null;
        }
    }

    private _updateRowAndColumnDefinitions(): void {
        const native = this._windows as any;
        if (!native) return;

        try {
            // Build row defs
            const rowDefs = [] as any[];
            for (let i = 0; i < this.rowsInternal.length; i++) {
                const item = this.rowsInternal[i];
                const rd = this._createRowDefinition(item);
                if (rd) rowDefs.push(rd);
            }
            try { native.RowDefinitions.ReplaceAll(rowDefs); } catch (_e) {
                // fallback: append
                try { native.RowDefinitions.Clear(); } catch (_e2) {}
                for (const rd of rowDefs) {
                    try { native.RowDefinitions.Append(rd); } catch (_e3) {}
                }
            }
        } catch (_e) {}

        try {
            // Build column defs
            const colDefs = [] as any[];
            for (let i = 0; i < this.columnsInternal.length; i++) {
                const item = this.columnsInternal[i];
                const cd = this._createColumnDefinition(item);
                if (cd) colDefs.push(cd);
            }
            try { native.ColumnDefinitions.ReplaceAll(colDefs); } catch (_e) {
                try { native.ColumnDefinitions.Clear(); } catch (_e2) {}
                for (const cd of colDefs) {
                    try { native.ColumnDefinitions.Append(cd); } catch (_e3) {}
                }
            }
        } catch (_e) {}
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

        try {
            const nativeChild = (child as any).nativeViewProtected as any;
            if (res && nativeChild && this._windows) {
                const Grid = Windows.UI.Xaml.Controls.Grid as any;
                try { Grid.SetRow(nativeChild, GridLayout.getRow(child)); } catch (_e) {}
                try { Grid.SetColumn(nativeChild, GridLayout.getColumn(child)); } catch (_e) {}
                try { Grid.SetRowSpan(nativeChild, GridLayout.getRowSpan(child)); } catch (_e) {}
                try { Grid.SetColumnSpan(nativeChild, GridLayout.getColumnSpan(child)); } catch (_e) {}
            }
        } catch (_e) {}

        return res;
    }
}
