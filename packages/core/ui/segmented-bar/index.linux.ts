export * from './segmented-bar-common';

import { SegmentedBarItemBase, SegmentedBarBase, selectedIndexProperty, itemsProperty, selectedBackgroundColorProperty } from './segmented-bar-common';
import { colorProperty, fontInternalProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Font } from '../styling/font';
import { connect } from '../../utils/gtk.linux';
import { setWidgetCss, setWidgetScopedCss } from '../styling/gtk-style.linux';

export class SegmentedBarItem extends SegmentedBarItemBase {
	public _update() {
		const parent = this.parent as SegmentedBar;
		parent?._updateItem(this);
	}
}

/** Linked GtkToggleButtons in one group. */
export class SegmentedBar extends SegmentedBarBase {
	private _buttons: any[] = [];
	private _disconnect: (() => void)[] = [];
	private _changeFromCode = false;

	createNativeView() {
		const box: any = gtk_box_new(GtkOrientation.HORIZONTAL, 0);
		gtk_widget_add_css_class(box, 'linked');
		gtk_box_set_homogeneous(box, 1);
		return box;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	disposeNativeView(): void {
		this._clear();
		super.disposeNativeView();
	}

	private _clear(): void {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		for (const button of this._buttons.splice(0)) {
			gtk_box_remove(this.nativeViewProtected, button);
		}
	}

	_updateItem(item: SegmentedBarItemBase): void {
		const index = this.items?.indexOf(item) ?? -1;
		const button = this._buttons[index];
		if (button) {
			gtk_button_set_label(button, item.title ?? '');
		}
	}

	[itemsProperty.setNative](value: SegmentedBarItemBase[]) {
		this._clear();
		const owner = new WeakRef(this);
		(value || []).forEach((item, index) => {
			const button: any = gtk_toggle_button_new_with_label(item.title ?? '');
			if (this._buttons.length) {
				gtk_toggle_button_set_group(button, this._buttons[0]);
			}
			this._disconnect.push(
				connect(button, 'toggled', (b: any) => {
					const view = owner.deref();
					if (view && !view._changeFromCode && gtk_toggle_button_get_active(b)) {
						selectedIndexProperty.nativeValueChange(view, index);
					}
				}),
			);
			gtk_box_append(this.nativeViewProtected, button);
			this._buttons.push(button);
		});
		selectedIndexProperty.coerce(this);
		this._select(this.selectedIndex);
		this.requestLayout();
	}

	[selectedIndexProperty.setNative](value: number) {
		this._select(value);
	}

	private _select(value: number) {
		const button = this._buttons[value];
		if (button) {
			this._changeFromCode = true;
			gtk_toggle_button_set_active(button, 1);
			this._changeFromCode = false;
		}
	}

	[selectedBackgroundColorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'selected', value instanceof Color ? `& button:checked{background-color:${value.linux};background-image:none;}` : '');
	}

	[colorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'color', value instanceof Color ? `& button{color:${value.linux};}` : '');
	}

	[fontInternalProperty.setNative](value: Font) {
		setWidgetCss(this.nativeViewProtected, 'font', value instanceof Font ? (value as any).linuxCss : '');
	}
}
