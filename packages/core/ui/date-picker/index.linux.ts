export * from './date-picker-common';

import { DatePickerBase, yearProperty, monthProperty, dayProperty, hourProperty, minuteProperty, secondProperty, dateProperty, maxDateProperty, minDateProperty, showTimeProperty } from './date-picker-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { connect } from '../../utils/gtk.linux';
import { setWidgetCss } from '../styling/gtk-style.linux';

/** GtkCalendar, with hour / minute spin buttons when showTime is set. */
export class DatePicker extends DatePickerBase {
	private _calendar: any;
	private _hour: any;
	private _minute: any;
	private _time: any;
	private _disconnect: (() => void)[] = [];
	private _changeFromCode = false;

	createNativeView() {
		const box: any = gtk_box_new(GtkOrientation.VERTICAL, 6);
		this._calendar = gtk_calendar_new();
		this._time = gtk_box_new(GtkOrientation.HORIZONTAL, 4);
		this._hour = gtk_spin_button_new_with_range(0, 23, 1);
		this._minute = gtk_spin_button_new_with_range(0, 59, 1);
		gtk_box_append(this._time, this._hour);
		gtk_box_append(this._time, gtk_label_new(':'));
		gtk_box_append(this._time, this._minute);
		gtk_widget_set_visible(this._time, 0);
		gtk_box_append(box, this._calendar);
		gtk_box_append(box, this._time);
		return box;
	}

	get linux(): any {
		return this._calendar;
	}

	initNativeView(): void {
		super.initNativeView();
		const owner = new WeakRef(this);
		const changed = () => owner.deref()?._onNativeChange();
		this._disconnect.push(connect(this._calendar, 'day-selected', changed), connect(this._hour, 'value-changed', changed), connect(this._minute, 'value-changed', changed));
	}

	disposeNativeView(): void {
		for (const disconnect of this._disconnect.splice(0)) {
			disconnect();
		}
		this._calendar = this._hour = this._minute = this._time = null;
		super.disposeNativeView();
	}

	private _nativeDate(): Date {
		const dt: any = gtk_calendar_get_date(this._calendar);
		const date = new Date(g_date_time_get_year(dt), g_date_time_get_month(dt) - 1, g_date_time_get_day_of_month(dt), this.showTime ? gtk_spin_button_get_value_as_int(this._hour) : 0, this.showTime ? gtk_spin_button_get_value_as_int(this._minute) : 0);
		g_date_time_unref(dt);
		return date;
	}

	_onNativeChange(): void {
		if (this._changeFromCode) {
			return;
		}
		let date = this._nativeDate();
		// keep within min / max
		if (this.minDate && date < this.minDate) {
			date = new Date(this.minDate);
			this._showDate(date);
		} else if (this.maxDate && date > this.maxDate) {
			date = new Date(this.maxDate);
			this._showDate(date);
		}
		dateProperty.nativeValueChange(this, date);
	}

	private _showDate(date: Date): void {
		if (!this._calendar || !date || isNaN(date.getTime())) {
			return;
		}
		this._changeFromCode = true;
		try {
			const dt: any = g_date_time_new_local(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
			gtk_calendar_select_day(this._calendar, dt);
			g_date_time_unref(dt);
			gtk_spin_button_set_value(this._hour, date.getHours());
			gtk_spin_button_set_value(this._minute, date.getMinutes());
		} finally {
			this._changeFromCode = false;
		}
	}

	private _update(): void {
		this._showDate(new Date(this.year, this.month - 1, this.day, this.hour || 0, this.minute || 0, this.second || 0));
	}

	[yearProperty.setNative](value: number) {
		this._update();
	}

	[monthProperty.setNative](value: number) {
		this._update();
	}

	[dayProperty.setNative](value: number) {
		this._update();
	}

	[hourProperty.setNative](value: number) {
		this._update();
	}

	[minuteProperty.setNative](value: number) {
		this._update();
	}

	[secondProperty.setNative](value: number) {
		this._update();
	}

	[dateProperty.setNative](value: Date) {
		this._showDate(value);
	}

	[maxDateProperty.setNative](value: Date) {}

	[minDateProperty.setNative](value: Date) {}

	[showTimeProperty.setNative](value: boolean) {
		gtk_widget_set_visible(this._time, value ? 1 : 0);
		this.requestLayout();
	}

	[colorProperty.setNative](value: Color) {
		setWidgetCss(this._calendar, 'color', value instanceof Color ? `color:${value.linux};` : '');
	}
}
