export * from './date-picker-common';

import { DatePickerBase } from './date-picker-common';

// TODO(linux): placeholder until the GTK implementation lands
export class DatePicker extends DatePickerBase {
	createNativeView() {
		return gtk_label_new('DatePicker');
	}
}
