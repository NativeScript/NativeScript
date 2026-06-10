export * from './date-picker-common';

import { DatePickerBase, dateProperty, yearProperty, monthProperty, dayProperty, minDateProperty, maxDateProperty } from './date-picker-common';

export class DatePicker extends DatePickerBase {
	nativeViewProtected: Microsoft.UI.Xaml.Controls.DatePicker;
	private _windows: Microsoft.UI.Xaml.Controls.DatePicker;
	private _dateChangedHandler: any = null;

	public createNativeView(): Microsoft.UI.Xaml.Controls.DatePicker {
		this._windows = new Microsoft.UI.Xaml.Controls.DatePicker();
		return this._windows;
	}

	get windows(): Microsoft.UI.Xaml.Controls.DatePicker {
		return this._windows;
	}

	public initNativeView(): void {
		super.initNativeView();
		const that = new WeakRef(this);
		const handler = (_sender: Microsoft.UI.Xaml.Controls.DatePicker, args: Microsoft.UI.Xaml.Controls.DatePickerSelectedValueChangedEventArgs) => {
			const owner = that.deref();
			if (!owner) return;
			const raw = args.NewDate as any; // IReference<DateTime>
			if (!raw) return;
			const jsDate = NSWinRT.interop.fromWinRTDateTimeTicks(raw);
			dateProperty.nativeValueChange(owner, jsDate);
			yearProperty.nativeValueChange(owner, jsDate.getFullYear());
			monthProperty.nativeValueChange(owner, jsDate.getMonth() + 1);
			dayProperty.nativeValueChange(owner, jsDate.getDate());
			owner.notify({
				eventName: DatePickerBase.dateChangeEvent,
				object: owner,
				value: { year: jsDate.getFullYear(), month: jsDate.getMonth() + 1, day: jsDate.getDate() },
			});
		};
		this._dateChangedHandler = NSWinRT.asDelegate(
			'Windows.Foundation.TypedEventHandler`2<Microsoft.UI.Xaml.Controls.DatePicker,Microsoft.UI.Xaml.Controls.DatePickerSelectedValueChangedEventArgs>',
			handler
		);
		this._windows.SelectedDateChanged = this._dateChangedHandler;
	}

	public disposeNativeView(): void {
		if (this._windows && this._dateChangedHandler) {
			this._windows.SelectedDateChanged = null;
			this._dateChangedHandler = null;
		}
		super.disposeNativeView();
	}

	[dateProperty.getDefault](): Date {
		return new Date();
	}

	// Build a Date from the current year/month/day JS properties so that each individual
	// setNative sees the full combined value, regardless of XML attribute order.
	private _fromYMD(): Date {
		return new Date(this.year, this.month - 1, this.day);
	}

	private _setDate(value: Date): void {
		const dt = NSWinRT.interop.dateTime(value);
		this._windows.Date = dt;
		// SelectedDate (IReference<DateTime>) makes the picker show the date as selected rather
		// than showing placeholder dashes. Pass the original Date; the runtime handles boxing.
		this._windows.SelectedDate = NSWinRT.interop.reference('Windows.Foundation.DateTime', value);
	}

	[dateProperty.setNative](value: Date) {
		this._setDate(value);
	}

	//@ts-ignore
	[yearProperty.setNative](value: number) {
		this._setDate(this._fromYMD());
	}

	//@ts-ignore
	[monthProperty.setNative](value: number) {
		this._setDate(this._fromYMD());
	}

	//@ts-ignore
	[dayProperty.setNative](value: number) {
		this._setDate(this._fromYMD());
	}

	//@ts-ignore
	[minDateProperty.setNative](value: Date) {
		this._windows.MinYear = NSWinRT.interop.dateTime(value);
	}

	//@ts-ignore
	[maxDateProperty.setNative](value: Date) {
		this._windows.MaxYear = NSWinRT.interop.dateTime(value);
	}
}
