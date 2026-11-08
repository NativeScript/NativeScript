export * from './activity-indicator-common';

import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { setWidgetCss } from '../styling/gtk-style.linux';
import { connect } from '../../utils/gtk.linux';

/** GtkSpinner, visible while busy. */
export class ActivityIndicator extends ActivityIndicatorBase {
	private _busy = false;
	private _disconnectMap: (() => void) | null = null;

	createNativeView() {
		const spinner: any = gtk_spinner_new();
		gtk_widget_set_size_request(spinner, 24, 24);
		return spinner;
	}

	initNativeView(): void {
		super.initNativeView();
		// on the next turn: started from inside `map` it stays still too
		this._disconnectMap = connect(this.nativeViewProtected, 'map', () => setTimeout(() => this._applyBusy()));
	}

	disposeNativeView(): void {
		this._disconnectMap?.();
		this._disconnectMap = null;
		super.disposeNativeView();
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	[busyProperty.setNative](value: boolean) {
		this._busy = value;
		this._applyBusy();
	}

	/**
	 * GtkSpinner spins with a CSS animation, which GTK leaves still when the spinner is started
	 * before it's on screen, until something restyles it (a theme change). So it starts only
	 * once mapped.
	 */
	private _applyBusy() {
		const spinner = this.nativeViewProtected;
		if (!spinner) {
			return;
		}
		if (this._busy && gtk_widget_get_mapped(spinner)) {
			gtk_spinner_start(spinner);
		} else {
			gtk_spinner_stop(spinner);
		}
		gtk_widget_set_opacity(spinner, this._busy ? 1 : 0);
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}
}
