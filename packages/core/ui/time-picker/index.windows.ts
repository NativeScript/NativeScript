export * from './time-picker-common';

import { TimePickerBase } from './time-picker-common';

export class TimePicker extends TimePickerBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.TimePicker;
	private _windows: Windows.UI.Xaml.Controls.TimePicker;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.TimePicker();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.TimePicker {
		return this._windows;
	}
}
