export * from './activity-indicator-common';

import { ActivityIndicatorBase, busyProperty } from './activity-indicator-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { setWidgetCss } from '../styling/gtk-style.linux';

/** GtkSpinner, visible while busy. */
export class ActivityIndicator extends ActivityIndicatorBase {
	createNativeView() {
		const spinner: any = gtk_spinner_new();
		gtk_widget_set_size_request(spinner, 24, 24);
		return spinner;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	[busyProperty.setNative](value: boolean) {
		const spinner = this.nativeViewProtected;
		if (value) {
			gtk_spinner_start(spinner);
		} else {
			gtk_spinner_stop(spinner);
		}
		gtk_widget_set_opacity(spinner, value ? 1 : 0);
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}
}
