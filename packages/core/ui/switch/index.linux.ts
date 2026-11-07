export * from './switch-common';

import { SwitchBase, checkedProperty, offBackgroundColorProperty } from './switch-common';
import { colorProperty, backgroundColorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { connect } from '../../utils/gtk.linux';
import { setWidgetCss, setWidgetScopedCss } from '../styling/gtk-style.linux';

/** GtkSwitch; color is the thumb (slider node), backgroundColor the "on" track. */
export class Switch extends SwitchBase {
	private _disconnect: () => void;

	createNativeView() {
		const widget: any = gtk_switch_new();
		gtk_widget_set_halign(widget, GtkAlign.START);
		return widget;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		this._disconnect = connect(
			this.nativeViewProtected,
			'notify::active',
			(widget: any) => {
				const view = owner.deref();
				if (view) checkedProperty.nativeValueChange(view, !!gtk_switch_get_active(widget));
			},
			{ args: 1 },
		);
	}

	disposeNativeView(): void {
		this._disconnect?.();
		super.disposeNativeView();
	}

	[checkedProperty.setNative](value: boolean) {
		gtk_switch_set_active(this.nativeViewProtected, value ? 1 : 0);
	}

	private _colors() {
		const on = this.style.backgroundColor instanceof Color ? this.style.backgroundColor : null;
		const off = this.offBackgroundColor instanceof Color ? this.offBackgroundColor : null;
		const thumb = this.color instanceof Color ? this.color : null;
		let css = '';
		if (off) css += `background-color:${off.linux};background-image:none;`;
		setWidgetCss(this.nativeViewProtected, 'track', css);
		setWidgetScopedCss(this.nativeViewProtected, 'states', (on ? `&:checked{background-color:${on.linux};background-image:none;}` : '') + (thumb ? `& slider{background-color:${thumb.linux};background-image:none;}` : ''));
	}

	[colorProperty.setNative](value: Color) {
		this._colors();
	}

	[backgroundColorProperty.setNative](value: Color) {
		this._colors();
	}

	[offBackgroundColorProperty.setNative](value: Color) {
		this._colors();
	}
}
