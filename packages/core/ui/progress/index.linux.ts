export * from './progress-common';

import { ProgressBase, valueProperty, maxValueProperty } from './progress-common';
import { colorProperty, backgroundColorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { setWidgetScopedCss } from '../styling/gtk-style.linux';

/** GtkProgressBar; color is the filled part, backgroundColor the trough. */
export class Progress extends ProgressBase {
	createNativeView() {
		const bar: any = gtk_progress_bar_new();
		gtk_widget_set_valign(bar, GtkAlign.CENTER);
		return bar;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	private _update() {
		const max = this.maxValue || 100;
		gtk_progress_bar_set_fraction(this.nativeViewProtected, Math.max(0, Math.min(1, (this.value || 0) / max)));
	}

	[valueProperty.setNative](value: number) {
		this._update();
	}

	[maxValueProperty.setNative](value: number) {
		this._update();
	}

	[colorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'progress', value instanceof Color ? `& progress{background-color:${value.linux};background-image:none;border-color:${value.linux};}` : '');
	}

	[backgroundColorProperty.setNative](value: Color) {
		setWidgetScopedCss(this.nativeViewProtected, 'trough', value instanceof Color ? `& trough{background-color:${value.linux};background-image:none;}` : '');
	}
}
