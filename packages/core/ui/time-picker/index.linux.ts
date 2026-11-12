export * from './time-picker-common';

import { TimePickerBase, timeProperty, minuteIntervalProperty, minuteProperty, minMinuteProperty, maxMinuteProperty, hourProperty, minHourProperty, maxHourProperty } from './time-picker-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { connect } from '../../utils/gtk.linux';
import { setWidgetCss } from '../styling/gtk-style.linux';

/** Hour and minute spin buttons. */
export class TimePicker extends TimePickerBase {
	private _hour: any;
	private _minute: any;
	private _disconnect: (() => void)[] = [];
	private _changeFromCode = false;

	createNativeView() {
		const box: any = gtk_box_new(GtkOrientation.HORIZONTAL, 4);
		this._hour = gtk_spin_button_new_with_range(0, 23, 1);
		this._minute = gtk_spin_button_new_with_range(0, 59, 1);
		gtk_spin_button_set_wrap(this._hour, 1);
		gtk_spin_button_set_wrap(this._minute, 1);
		gtk_box_append(box, this._hour);
		gtk_box_append(box, gtk_label_new(':'));
		gtk_box_append(box, this._minute);
		return box;
	}

	get linux(): any {
		return this.nativeViewProtected;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		const changed = () => owner.deref()?._onNativeChange();
		this._disconnect.push(connect(this._hour, 'value-changed', changed), connect(this._minute, 'value-changed', changed));
	}

	disposeNativeView(): void {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		this._hour = this._minute = null;
		super.disposeNativeView();
	}

	_onNativeChange(): void {
		if (this._changeFromCode) {
			return;
		}
		timeProperty.nativeValueChange(this, new Date(0, 0, 0, gtk_spin_button_get_value_as_int(this._hour), gtk_spin_button_get_value_as_int(this._minute)));
	}

	private _set(fn: () => void) {
		this._changeFromCode = true;
		try {
			fn();
		} finally {
			this._changeFromCode = false;
		}
	}

	private _ranges(): void {
		this._set(() => {
			gtk_spin_button_set_range(this._hour, this.minHour ?? 0, this.maxHour ?? 23);
			gtk_spin_button_set_range(this._minute, this.minMinute ?? 0, this.maxMinute ?? 59);
			gtk_spin_button_set_increments(this._minute, this.minuteInterval || 1, (this.minuteInterval || 1) * 5);
		});
	}

	[timeProperty.setNative](value: Date) {
		if (value) {
			this._set(() => {
				gtk_spin_button_set_value(this._hour, value.getHours());
				gtk_spin_button_set_value(this._minute, value.getMinutes());
			});
		}
	}

	[hourProperty.setNative](value: number) {
		this._set(() => gtk_spin_button_set_value(this._hour, value));
	}

	[minuteProperty.setNative](value: number) {
		this._set(() => gtk_spin_button_set_value(this._minute, value));
	}

	[minHourProperty.setNative](value: number) {
		this._ranges();
	}

	[maxHourProperty.setNative](value: number) {
		this._ranges();
	}

	[minMinuteProperty.setNative](value: number) {
		this._ranges();
	}

	[maxMinuteProperty.setNative](value: number) {
		this._ranges();
	}

	[minuteIntervalProperty.setNative](value: number) {
		this._ranges();
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this.nativeViewProtected, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}
}
