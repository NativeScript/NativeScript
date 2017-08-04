import { DatePicker as DatePickerDefinition } from ".";
import { View, Property } from "../core/view";

export * from "../core/view";

const defaultDate = new Date();
const dateComparer = (x: Date, y: Date): boolean => (x <= y && x >= y);

export class DatePickerBase extends View implements DatePickerDefinition {
    public year: number;
    public month: number;
    public day: number;
    public maxDate: Date;
    public minDate: Date;
    public date: Date;
}

DatePickerBase.prototype.recycleNativeView = "auto";

export const yearProperty = new Property<DatePickerBase, number>({
    name: "year",
    defaultValue: defaultDate.getFullYear(),
    valueConverter: v => parseInt(v),
});
yearProperty.register(DatePickerBase);

export const monthProperty = new Property<DatePickerBase, number>({
    name: "month",
    defaultValue: defaultDate.getMonth(),
    valueConverter: v => (parseInt(v) - 1),
});
monthProperty.register(DatePickerBase);

export const dayProperty = new Property<DatePickerBase, number>({
    name: "day",
    defaultValue: defaultDate.getDate(),
    valueConverter: v => parseInt(v),
});
dayProperty.register(DatePickerBase);

// TODO: Make CoercibleProperties
export const maxDateProperty = new Property<DatePickerBase, Date>({
    name: "maxDate",
    equalityComparer: dateComparer,
    valueConverter: v => new Date(v),
});
maxDateProperty.register(DatePickerBase);

export const minDateProperty = new Property<DatePickerBase, Date>({
    name: "minDate",
    equalityComparer: dateComparer,
    valueConverter: v => new Date(v),
});
minDateProperty.register(DatePickerBase);

export const dateProperty = new Property<DatePickerBase, Date>({
    name: "date",
    defaultValue: defaultDate,
    equalityComparer: dateComparer,
    valueConverter: v => new Date(v),
});
dateProperty.register(DatePickerBase);
