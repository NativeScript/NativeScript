//@private
import * as timePickerModule from '@nativescript/core/ui/time-picker';

export declare function getNativeHour(timePicker: timePickerModule.TimePicker): number;
export declare function getNativeMinute(timePicker: timePickerModule.TimePicker): number;

export declare function setNativeHour(timePicker: timePickerModule.TimePicker, value: number): void;
export declare function setNativeMinute(timePicker: timePickerModule.TimePicker, value: number): void;

export declare function setNativeTime(timePicker: timePickerModule.TimePicker, hour: number, minute: number): void;
