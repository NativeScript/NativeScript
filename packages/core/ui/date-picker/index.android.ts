import { DatePickerBase, yearProperty, monthProperty, dayProperty, dateProperty, maxDateProperty, minDateProperty } from './date-picker-common';
import { TimePicker } from '../time-picker';
import { StackLayout } from '../layouts/stack-layout';

export * from './date-picker-common';

interface DateChangedListener {
	new (owner: DatePicker): android.widget.DatePicker.OnDateChangedListener;
}

let DateChangedListener: DateChangedListener;

function initializeDateChangedListener(): void {
	if (DateChangedListener) {
		return;
	}

	@NativeClass
	@Interfaces([android.widget.DatePicker.OnDateChangedListener])
	class DateChangedListenerImpl extends java.lang.Object implements android.widget.DatePicker.OnDateChangedListener {
		constructor(public owner: DatePicker) {
			super();

			return global.__native(this);
		}

		onDateChanged(picker: android.widget.DatePicker, year: number, month: number, day: number) {
			const owner = this.owner;
			let dateChanged = false;
			if (year !== owner.year) {
				yearProperty.nativeValueChange(owner, year);
				dateChanged = true;
			}

			if (month !== owner.month - 1) {
				monthProperty.nativeValueChange(owner, month + 1);
				dateChanged = true;
			}

			if (day !== owner.day) {
				dayProperty.nativeValueChange(owner, day);
				dateChanged = true;
			}

			if (dateChanged || (owner.showTime && owner.timePicker)) {
				let newDate: Date;
				if (owner.showTime && owner.timePicker) {
					const dateTime = owner.timePicker.time;
					newDate = new Date(year, month, day, dateTime.getHours(), dateTime.getMinutes(), dateTime.getSeconds(), dateTime.getMilliseconds());
				} else {
					newDate = new Date(year, month, day);
				}
				dateProperty.nativeValueChange(owner, newDate);
			}
		}
	}

	DateChangedListener = DateChangedListenerImpl;
}

export class DatePicker extends DatePickerBase {
	nativeViewProtected: android.widget.DatePicker;
	timePicker: TimePicker;

	public createNativeView() {
		const picker = new android.widget.DatePicker(this._context);
		picker.setCalendarViewShown(false);

		return picker;
	}

	public initNativeView(): void {
		super.initNativeView();
		initializeDateChangedListener();
		const nativeView = this.nativeViewProtected;
		const listener = new DateChangedListener(this);
		nativeView.init(this.year, this.month - 1, this.day, listener);
		(<any>nativeView).listener = listener;
		if (this.showTime) {
			this.timePicker = new TimePicker();
			this.timePicker.width = this.width;
			this.timePicker.height = this.height;
			this.timePicker.on('timeChange', (args) => {
				this.updateNativeDate();
			});
			(<StackLayout>this.parent).addChild(this.timePicker);
		}
	}

	public disposeNativeView() {
		if (this.timePicker) {
			this.timePicker.disposeNativeView();
		}
		(<any>this.nativeViewProtected).listener.owner = null;
		super.disposeNativeView();
	}

	private updateNativeDate(): void {
		const nativeView = this.nativeViewProtected;
		const year = typeof this.year === 'number' ? this.year : nativeView.getYear();
		const month = typeof this.month === 'number' ? this.month - 1 : nativeView.getMonth();
		const day = typeof this.day === 'number' ? this.day : nativeView.getDayOfMonth();
		if (this.showTime && this.timePicker) {
			const time = this.timePicker.time || new Date();
			this.date = new Date(year, month, day, time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
		} else {
			this.date = new Date(year, month, day);
		}
	}

	[yearProperty.setNative](value: number) {
		if (this.nativeViewProtected.getYear() !== value) {
			this.updateNativeDate();
		}
	}

	[monthProperty.setNative](value: number) {
		if (this.nativeViewProtected.getMonth() !== value - 1) {
			this.updateNativeDate();
		}
	}

	[dayProperty.setNative](value: number) {
		if (this.nativeViewProtected.getDayOfMonth() !== value) {
			this.updateNativeDate();
		}
	}

	[dateProperty.setNative](value: Date) {
		const nativeView = this.nativeViewProtected;
		if (nativeView.getDayOfMonth() !== value.getDate() || nativeView.getMonth() !== value.getMonth() || nativeView.getYear() !== value.getFullYear()) {
			nativeView.updateDate(value.getFullYear(), value.getMonth(), value.getDate());
		}
	}

	[maxDateProperty.getDefault](): number {
		return this.nativeViewProtected.getMaxDate();
	}
	[maxDateProperty.setNative](value: Date | number) {
		const newValue = value instanceof Date ? value.getTime() : value;
		this.nativeViewProtected.setMaxDate(newValue);
	}

	[minDateProperty.getDefault](): number {
		return this.nativeViewProtected.getMinDate();
	}
	[minDateProperty.setNative](value: Date | number) {
		const newValue = value instanceof Date ? value.getTime() : value;
		this.nativeViewProtected.setMinDate(newValue);
	}
}
