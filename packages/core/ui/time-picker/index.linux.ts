export * from './time-picker-common';

import { TimePickerBase } from './time-picker-common';

// TODO(linux): placeholder until the GTK implementation lands
export class TimePicker extends TimePickerBase {
	createNativeView() {
		return gtk_label_new('TimePicker');
	}
}
