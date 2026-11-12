export * from './slider-common';

import { SliderBase, valueProperty, minValueProperty, maxValueProperty } from './slider-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { connect } from '../../utils/gtk.linux';
import { setWidgetScopedCss } from '../styling/gtk-style.linux';

/** Horizontal GtkScale; color tints the filled part. */
export class Slider extends SliderBase {
	private _disconnect: () => void;
	private _changeFromCode = false;

	createNativeView() {
		return gtk_scale_new_with_range(GtkOrientation.HORIZONTAL, 0, 100, 1);
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		this._disconnect = connect(this.nativeViewProtected, 'value-changed', (range: any) => {
			const view = owner.deref();
			if (view && !view._changeFromCode) {
				valueProperty.nativeValueChange(view, gtk_range_get_value(range));
			}
		});
	}

	disposeNativeView(): void {
		this._disconnect?.();
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

	[valueProperty.setNative](value: number) {
		this._set(() => gtk_range_set_value(this.nativeViewProtected, value));
	}

	[minValueProperty.setNative](value: number) {
		this._set(() => gtk_range_set_range(this.nativeViewProtected, value, Math.max(value, this.maxValue)));
	}

	[maxValueProperty.setNative](value: number) {
		this._set(() => gtk_range_set_range(this.nativeViewProtected, Math.min(this.minValue, value), value));
	}

	[colorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'color', value instanceof Color ? `& highlight{background-color:${value.linux};background-image:none;border-color:${value.linux};}& slider{background-color:${value.linux};}` : '');
	}
}
