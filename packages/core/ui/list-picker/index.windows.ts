export * from './list-picker-common';

import { ListPickerBase, selectedIndexProperty, itemsProperty, ItemsSource } from './list-picker-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';

export class ListPicker extends ListPickerBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.ComboBox;
	private _windows: Windows.UI.Xaml.Controls.ComboBox;
	private _selectionHandler: any = null;
	private _selectionHandlerUsedAddListener: boolean = false;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.ComboBox();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.ComboBox {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const that = new WeakRef(this);
		let usedAdd = false;
		try {
			this._selectionHandler = new Windows.UI.Xaml.Controls.SelectionChangedEventHandler((s, e) => {
				const owner = that.deref();
				if (!owner) {
					return;
				}
				const native = owner.nativeViewProtected as any;
				const idx = native.SelectedIndex;
				selectedIndexProperty.nativeValueChange(owner, idx);
				owner.updateSelectedValue(idx);
			});
			this.nativeViewProtected.SelectionChanged = this._selectionHandler as never;
		} catch (_e) {
			this._selectionHandler = (s: any, e: any) => {
				const owner = that.deref();
				if (!owner) return;
				const native = owner.nativeViewProtected as any;
				const idx = native.SelectedIndex;
				selectedIndexProperty.nativeValueChange(owner, idx);
				owner.updateSelectedValue(idx);
			};
			try {
				this.nativeViewProtected.SelectionChanged = this._selectionHandler as never;
			} catch (_e2) {
				try {
					if (typeof (this.nativeViewProtected as any).addEventListener === 'function') {
						(this.nativeViewProtected as any).addEventListener('selectionchanged', this._selectionHandler);
						usedAdd = true;
					}
				} catch (_e3) {}
			}
		}
		this._selectionHandlerUsedAddListener = usedAdd;
	}

	public disposeNativeView(): void {
		if (this._selectionHandler) {
			try { this.nativeViewProtected.SelectionChanged = null as never; } catch (_e) {}
			if (this._selectionHandlerUsedAddListener) {
				try { (this.nativeViewProtected as any).removeEventListener('selectionchanged', this._selectionHandler); } catch (_e) {}
			}
			this._selectionHandler = null;
			this._selectionHandlerUsedAddListener = false;
		}
		super.disposeNativeView();
	}

	[selectedIndexProperty.getDefault](): number {
		return -1;
	}
	[selectedIndexProperty.setNative](value: number) {
		if (value >= 0 && this.nativeViewProtected) {
			this.nativeViewProtected.SelectedIndex = value;
		}
	}

	[itemsProperty.getDefault](): any[] {
		return null;
	}
	[itemsProperty.setNative](value: any[] | ItemsSource) {
		const native = this.nativeViewProtected;
		if (!native) return;

		try {
			native.Items.Clear();
			if (value && Array.isArray(value)) {
				for (let i = 0; i < value.length; i++) {
					const dataItem = this._getDataItem(i);
					native.Items.Append(dataItem != null ? (dataItem.toString ? dataItem.toString() : String(dataItem)) : '');
				}
			}
		} catch (_e) {
			// best-effort
		}

		// Coerce selected index after updating items.
		selectedIndexProperty.coerce(this);
	}

	[colorProperty.getDefault](): any {
		try {
			return (this.nativeViewProtected.Foreground as any)?.Color;
		} catch (_e) {
			return null;
		}
	}
	[colorProperty.setNative](value: Color | any) {
		try {
			const brush = new Windows.UI.Xaml.Media.SolidColorBrush(value instanceof Color ? value.windows : value);
			this.nativeViewProtected.Foreground = brush as never;
		} catch (_e) {
			// ignore
		}
	}
}

