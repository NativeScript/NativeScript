export * from './list-picker-common';

import { ListPickerBase, selectedIndexProperty, itemsProperty } from './list-picker-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { connect } from '../../utils/gtk.linux';
import { setWidgetCss } from '../styling/gtk-style.linux';

/** GtkDropDown over a GtkStringList. */
export class ListPicker extends ListPickerBase {
	private _list: any;
	private _disconnect: () => void;
	private _changeFromCode = false;

	createNativeView() {
		this._list = gtk_string_list_new(null);
		return gtk_drop_down_new(this._list, null);
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		this._disconnect = connect(
			this.nativeViewProtected,
			'notify::selected',
			(dropDown: any) => {
				const view = owner.deref();
				if (view && !view._changeFromCode) {
					const selected = gtk_drop_down_get_selected(dropDown);
					// GTK_INVALID_LIST_POSITION
					selectedIndexProperty.nativeValueChange(view, selected === 0xffffffff ? -1 : selected);
				}
			},
			{ args: 1 },
		);
	}

	disposeNativeView(): void {
		this._disconnect?.();
		this._list = null;
		super.disposeNativeView();
	}

	private _set(fn: () => void) {
		this._changeFromCode = true;
		try {
			fn();
		} finally {
			this._changeFromCode = false;
		}
	}

	[itemsProperty.setNative](value: any) {
		const count = !value ? 0 : this.isItemsSource ? value.length : value.length;
		this._set(() => {
			const strings: string[] = [];
			for (let i = 0; i < count; i++) {
				strings.push(`${this._getItemAsString(i)}`);
			}
			const old = g_list_model_get_n_items(this._list);
			gtk_string_list_splice(this._list, 0, old, null);
			for (const s of strings) {
				gtk_string_list_append(this._list, s);
			}
		});
		selectedIndexProperty.coerce(this);
		this.requestLayout();
	}

	[selectedIndexProperty.setNative](value: number) {
		this._set(() => gtk_drop_down_set_selected(this.nativeViewProtected, value >= 0 ? value : 0xffffffff));
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}
}
