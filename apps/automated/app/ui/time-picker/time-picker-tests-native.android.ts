import * as timePickerModule from '@nativescript/core/ui/time-picker';

export function getNativeHour(timePicker: timePickerModule.TimePicker): number {
	return timePicker.android.getCurrentHour().intValue();
}

export function getNativeMinute(timePicker: timePickerModule.TimePicker): number {
	return timePicker.android.getCurrentMinute().intValue();
}

export function setNativeHour(timePicker: timePickerModule.TimePicker, value: number): void {
	timePicker.android.setCurrentHour(new java.lang.Integer(value));
}

export function setNativeMinute(timePicker: timePickerModule.TimePicker, value: number): void {
	timePicker.android.setCurrentMinute(new java.lang.Integer(value));
}

export function setNativeTime(timePicker: timePickerModule.TimePicker, hour: number, minute: number): void {
	timePicker.android.setCurrentHour(new java.lang.Integer(hour));
	timePicker.android.setCurrentMinute(new java.lang.Integer(minute));
}
