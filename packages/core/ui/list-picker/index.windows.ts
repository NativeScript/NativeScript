export * from './list-picker-common';

import { ListPickerBase, selectedIndexProperty, itemsProperty, ItemsSource } from './list-picker-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';

export class ListPicker extends ListPickerBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.ComboBox;
	private _windows: Microsoft.UI.Xaml.Controls.ComboBox;
	private _selectionHandler: any = null;

	public createNativeView(): Microsoft.UI.Xaml.Controls.ComboBox {
		this._windows = new Microsoft.UI.Xaml.Controls.ComboBox();
		return this._windows;
	}

	get windows(): Microsoft.UI.Xaml.Controls.ComboBox {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const that = new WeakRef(this);
		this._selectionHandler = NSWinRT.asDelegate('Microsoft.UI.Xaml.Controls.SelectionChangedEventHandler', () => {
			const owner = that.deref();
			if (!owner) return;
			const idx = owner.nativeViewProtected.SelectedIndex;
			selectedIndexProperty.nativeValueChange(owner, idx);
			owner.updateSelectedValue(idx);
		});
		this.nativeViewProtected.SelectionChanged = this._selectionHandler as never;
	}

	public disposeNativeView(): void {
		if (this._selectionHandler) {
			this.nativeViewProtected.SelectionChanged = null as never;
			this._selectionHandler = null;
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
		try { native.Items.Clear(); } catch (_e) {}
		// `_getItemAsString` (base) resolves arrays, ItemsSource and textField to a display string.
		const length = value ? (Array.isArray(value) ? value.length : (value as ItemsSource).length) : 0;
		for (let i = 0; i < length; i++) {
			try { native.Items.Append(this._getItemAsString(i)); } catch (_e) {}
		}
		selectedIndexProperty.coerce(this);
	}

	[colorProperty.getDefault](): number {
		return -1;
	}
	[colorProperty.setNative](value: Color | number) {
		if (value instanceof Color) {
			this.nativeViewProtected.Foreground = new Microsoft.UI.Xaml.Media.SolidColorBrush(value.windows) as never;
		}
	}
}
