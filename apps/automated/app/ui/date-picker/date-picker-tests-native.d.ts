//@private
import * as datePickerModule from '@nativescript/core/ui/date-picker';

export declare function getNativeYear(datePicker: datePickerModule.DatePicker): number;
export declare function getNativeMonth(datePicker: datePickerModule.DatePicker): number;
export declare function getNativeDay(datePicker: datePickerModule.DatePicker): number;
export declare function getNativeMaxDate(datePicker: datePickerModule.DatePicker): Date;
export declare function getNativeMinDate(datePicker: datePickerModule.DatePicker): Date;

export declare function setNativeYear(datePicker: datePickerModule.DatePicker, value: number): void;
export declare function setNativeMonth(datePicker: datePickerModule.DatePicker, value: number): void;
export declare function setNativeDay(datePicker: datePickerModule.DatePicker, value: number): void;

export declare function setNativeDate(datePicker: datePickerModule.DatePicker, year: number, month: number, day: number): void;
