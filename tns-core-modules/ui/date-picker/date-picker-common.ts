import { DatePicker as DatePickerDefinition } from "ui/date-picker";
import { View } from "ui/core/view";
import { Property } from "ui/core/properties";

export class DatePickerBase extends View implements DatePickerDefinition {
    public year: number;
    public month: number;
    public day: number;
    public maxDate: Date;
    public minDate: Date;
    public date: Date;
}

export let yearProperty = new Property<DatePickerBase, number>({ name: "year" });
yearProperty.register(DatePickerBase);

export let monthProperty = new Property<DatePickerBase, number>({ name: "month" });
monthProperty.register(DatePickerBase);

export let dayProperty = new Property<DatePickerBase, number>({ name: "day" });
dayProperty.register(DatePickerBase);

export let maxDateProperty = new Property<DatePickerBase, Date>({ name: "maxDate" });
maxDateProperty.register(DatePickerBase);

export let minDateProperty = new Property<DatePickerBase, Date>({ name: "minDate" });
minDateProperty.register(DatePickerBase);

export let dateProperty = new Property<DatePickerBase, Date>({ name: "date" });
dateProperty.register(DatePickerBase);