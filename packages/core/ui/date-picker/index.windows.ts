export * from './date-picker-common';

import { DatePickerBase } from './date-picker-common';

export class DatePicker extends DatePickerBase {
	nativeViewProtected: Windows.UI.Xaml.Controls.DatePicker;
	private _windows: Windows.UI.Xaml.Controls.DatePicker;

	constructor() {
		super();
		this._windows = new Windows.UI.Xaml.Controls.DatePicker();
	}

	public createNativeView() {
		return this._windows;
	}

	get windows(): Windows.UI.Xaml.Controls.DatePicker {
		return this._windows;
	}
}

