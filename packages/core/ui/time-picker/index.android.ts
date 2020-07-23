import { TimePickerBase, getValidTime, timeProperty, hourProperty, minuteProperty } from './time-picker-common';

export * from './time-picker-common';

interface TimeChangedListener {
	new (owner: TimePicker): android.widget.TimePicker.OnTimeChangedListener;
}

let TimeChangedListener: TimeChangedListener;

function initializeTimeChangedListener(): void {
	if (TimeChangedListener) {
		return;
	}

	apiLevel = android.os.Build.VERSION.SDK_INT;

	@NativeClass
	@Interfaces([android.widget.TimePicker.OnTimeChangedListener])
	class TimeChangedListenerImpl extends java.lang.Object implements android.widget.TimePicker.OnTimeChangedListener {
		constructor(public owner: TimePicker) {
			super();

			return global.__native(this);
		}

		onTimeChanged(picker: android.widget.TimePicker, hour: number, minute: number): void {
			const timePicker = this.owner;
			if (timePicker.updatingNativeValue) {
				return;
			}

			const validTime = getValidTime(timePicker, hour, minute);
			timeProperty.nativeValueChange(timePicker, new Date(0, 0, 0, validTime.hour, validTime.minute));
		}
	}

	TimeChangedListener = TimeChangedListenerImpl;
}

let apiLevel: number;

export class TimePicker extends TimePickerBase {
	nativeViewProtected: android.widget.TimePicker;
	updatingNativeValue: boolean;

	public createNativeView() {
		return new android.widget.TimePicker(this._context);
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		initializeTimeChangedListener();
		const listener = new TimeChangedListener(this);
		nativeView.setOnTimeChangedListener(listener);
		(<any>nativeView).listener = listener;
		const calendar = ((<any>nativeView).calendar = java.util.Calendar.getInstance());

		const hour = hourProperty.isSet(this) ? this.hour : calendar.get(java.util.Calendar.HOUR_OF_DAY);
		const minute = minuteProperty.isSet(this) ? this.minute : calendar.get(java.util.Calendar.MINUTE);

		const validTime = getValidTime(this, hour, minute);
		if (!timeProperty.isSet(this)) {
			this.time = new Date(0, 0, 0, validTime.hour, validTime.minute);
		}
	}

	[minuteProperty.setNative](value: number) {
		this.updatingNativeValue = true;
		try {
			if (apiLevel >= 23) {
				(<any>this.nativeViewProtected).setMinute(value);
			} else {
				this.nativeViewProtected.setCurrentMinute(new java.lang.Integer(value));
			}
		} finally {
			this.updatingNativeValue = false;
		}
	}

	[hourProperty.setNative](value: number) {
		this.updatingNativeValue = true;
		try {
			if (apiLevel >= 23) {
				(<any>this.nativeViewProtected).setHour(value);
			} else {
				this.nativeViewProtected.setCurrentHour(new java.lang.Integer(value));
			}
		} finally {
			this.updatingNativeValue = false;
		}
	}
}
