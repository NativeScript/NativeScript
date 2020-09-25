import { DatePickerBase, yearProperty, monthProperty, dayProperty, dateProperty, maxDateProperty, minDateProperty } from './date-picker-common';
import { colorProperty } from '../styling/style-properties';
import { Color } from '../../color';
import { Device } from '../../platform';

export * from './date-picker-common';

const SUPPORT_DATE_PICKER_STYLE = parseFloat(Device.osVersion) >= 13.4;
const SUPPORT_TEXT_COLOR = parseFloat(Device.osVersion) < 14.0;

export class DatePicker extends DatePickerBase {
	private _changeHandler: NSObject;
	public nativeViewProtected: UIDatePicker;

	public createNativeView() {
		const picker = UIDatePicker.new();
		picker.datePickerMode = UIDatePickerMode.Date;
		if (SUPPORT_DATE_PICKER_STYLE) {
			picker.preferredDatePickerStyle = this.iosPreferredDatePickerStyle;
		}
		return picker;
	}

	public initNativeView(): void {
		super.initNativeView();
		const nativeView = this.nativeViewProtected;
		this._changeHandler = UIDatePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
		nativeView.addTargetActionForControlEvents(this._changeHandler, 'valueChanged', UIControlEvents.ValueChanged);
	}

	public disposeNativeView() {
		this._changeHandler = null;
		super.disposeNativeView();
	}

	get ios(): UIDatePicker {
		return this.nativeViewProtected;
	}

	[yearProperty.setNative](value: number) {
		this.date = new Date(value, this.month - 1, this.day);
	}

	[monthProperty.setNative](value: number) {
		this.date = new Date(this.year, value - 1, this.day);
	}

	[dayProperty.setNative](value: number) {
		this.date = new Date(this.year, this.month - 1, value);
	}

	[dateProperty.setNative](value: Date) {
		const picker = this.nativeViewProtected;
		const comps = NSCalendar.currentCalendar.componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, picker.date);
		comps.year = value.getFullYear();
		comps.month = value.getMonth() + 1;
		comps.day = value.getDate();
		this.year = comps.year;
		this.month = comps.month;
		this.day = comps.day;
		picker.setDateAnimated(NSCalendar.currentCalendar.dateFromComponents(comps), false);
	}

	[maxDateProperty.getDefault](): Date {
		return this.nativeViewProtected.maximumDate;
	}
	[maxDateProperty.setNative](value: Date) {
		const picker = this.nativeViewProtected;
		const nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
		picker.maximumDate = <any>nsDate;
	}

	[minDateProperty.getDefault](): Date {
		return this.nativeViewProtected.minimumDate;
	}
	[minDateProperty.setNative](value: Date) {
		const picker = this.nativeViewProtected;
		const nsDate = NSDate.dateWithTimeIntervalSince1970(value.getTime() / 1000);
		picker.minimumDate = <any>nsDate;
	}

	[colorProperty.getDefault](): UIColor {
		return SUPPORT_TEXT_COLOR ? this.nativeViewProtected.valueForKey('textColor') : UIColor.new();
	}
	[colorProperty.setNative](value: Color | UIColor) {
		if (SUPPORT_TEXT_COLOR) {
			const picker = this.nativeViewProtected;
			picker.setValueForKey(value instanceof Color ? value.ios : value, 'textColor');
		}
	}
}

@NativeClass
class UIDatePickerChangeHandlerImpl extends NSObject {
	private _owner: WeakRef<DatePicker>;

	public static initWithOwner(owner: WeakRef<DatePicker>): UIDatePickerChangeHandlerImpl {
		const impl = <UIDatePickerChangeHandlerImpl>UIDatePickerChangeHandlerImpl.new();
		impl._owner = owner;

		return impl;
	}

	public valueChanged(sender: UIDatePicker) {
		const comps = NSCalendar.currentCalendar.componentsFromDate(NSCalendarUnit.CalendarUnitYear | NSCalendarUnit.CalendarUnitMonth | NSCalendarUnit.CalendarUnitDay, sender.date);

		const owner = this._owner.get();
		if (!owner) {
			return;
		}

		let dateChanged = false;
		if (comps.year !== owner.year) {
			yearProperty.nativeValueChange(owner, comps.year);
			dateChanged = true;
		}

		if (comps.month !== owner.month) {
			monthProperty.nativeValueChange(owner, comps.month);
			dateChanged = true;
		}

		if (comps.day !== owner.day) {
			dayProperty.nativeValueChange(owner, comps.day);
			dateChanged = true;
		}

		if (dateChanged) {
			dateProperty.nativeValueChange(owner, new Date(comps.year, comps.month - 1, comps.day));
		}
	}

	public static ObjCExposedMethods = {
		valueChanged: { returns: interop.types.void, params: [UIDatePicker] },
	};
}
