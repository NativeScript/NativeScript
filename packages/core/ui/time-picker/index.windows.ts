export * from './time-picker-common';

import { TimePickerBase } from './time-picker-common';

export class TimePicker extends TimePickerBase {
	get windows(): undefined {
		return undefined;
	}
}
