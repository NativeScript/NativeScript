import { DatePicker as DatePickerDefinition } from "ui/date-picker";
import { View, Property } from "ui/core/view";

export * from "ui/core/view";

export class DatePickerBase extends View implements DatePickerDefinition {
    public year: number;
    public month: number;
    public day: number;
    public maxDate: Date;
    public minDate: Date;
    public date: Date;
}

export const yearProperty = new Property<DatePickerBase, number>({ name: "year", valueConverter: (v) => parseInt(v) });
yearProperty.register(DatePickerBase);

export const monthProperty = new Property<DatePickerBase, number>({ name: "month", valueConverter: (v) => parseInt(v) });
monthProperty.register(DatePickerBase);

export const dayProperty = new Property<DatePickerBase, number>({ name: "day", valueConverter: (v) => parseInt(v) });
dayProperty.register(DatePickerBase);

function dateComparer(x: Date, y: Date): boolean {
    return (x <= y && x >= y) ? true : false;
}

export const maxDateProperty = new Property<DatePickerBase, Date>({ name: "maxDate", equalityComparer: dateComparer, valueConverter: (v) => new Date(v) });
maxDateProperty.register(DatePickerBase);

export const minDateProperty = new Property<DatePickerBase, Date>({ name: "minDate", equalityComparer: dateComparer, valueConverter: (v) => new Date(v) });
minDateProperty.register(DatePickerBase);

export const dateProperty = new Property<DatePickerBase, Date>({ name: "date", equalityComparer: dateComparer, valueConverter: (v) => new Date(v) });
dateProperty.register(DatePickerBase);