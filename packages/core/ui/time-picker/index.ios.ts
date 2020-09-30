import { TimePickerBase, timeProperty, minuteIntervalProperty, minuteProperty, minMinuteProperty, maxMinuteProperty, hourProperty, minHourProperty, maxHourProperty } from './time-picker-common';
import { Color } from '../../color';
import { colorProperty } from '../styling/style-properties';
import { Device } from '../../platform';

export * from './time-picker-common';

const SUPPORT_DATE_PICKER_STYLE = parseFloat(Device.osVersion) >= 13.4;
const SUPPORT_TEXT_COLOR = parseFloat(Device.osVersion) < 14.0;

function getDate(hour: number, minute: number): Date {
	let components = NSDateComponents.alloc().init();
	components.hour = hour;
	components.minute = minute;

	return NSCalendar.currentCalendar.dateFromComponents(<any>components);
}

function getComponents(date: Date | NSDate): NSDateComponents {
	return NSCalendar.currentCalendar.componentsFromDate(NSCalendarUnit.CalendarUnitHour | NSCalendarUnit.CalendarUnitMinute, <any>date);
}

export class TimePicker extends TimePickerBase {
	nativeViewProtected: UIDatePicker;
	private _changeHandler: NSObject;

	constructor() {
		super();
		let components = getComponents(NSDate.date());
		this.hour = components.hour;
		this.minute = components.minute;
	}

	createNativeView() {
		const picker = UIDatePicker.new();
		picker.datePickerMode = UIDatePickerMode.Time;
		if (SUPPORT_DATE_PICKER_STYLE) {
			picker.preferredDatePickerStyle = this.iosPreferredDatePickerStyle;
		}
		return picker;
	}

	initNativeView() {
		super.initNativeView();
		this._changeHandler = UITimePickerChangeHandlerImpl.initWithOwner(new WeakRef(this));
		this.nativeViewProtected.addTargetActionForControlEvents(this._changeHandler, 'valueChanged', UIControlEvents.ValueChanged);
	}

	disposeNativeView() {
		this._changeHandler = null;
		super.initNativeView();
	}

	get ios(): UIDatePicker {
		return this.nativeViewProtected;
	}

	[timeProperty.getDefault](): Date {
		return this.nativeViewProtected.date;
	}
	[timeProperty.setNative](value: Date) {
		this.nativeViewProtected.date = getDate(this.hour, this.minute);
	}

	[minuteProperty.getDefault](): number {
		return this.nativeViewProtected.date.getMinutes();
	}
	[minuteProperty.setNative](value: number) {
		this.nativeViewProtected.date = getDate(this.hour, value);
	}

	[hourProperty.getDefault](): number {
		return this.nativeViewProtected.date.getHours();
	}
	[hourProperty.setNative](value: number) {
		this.nativeViewProtected.date = getDate(value, this.minute);
	}

	[minHourProperty.getDefault](): number {
		return this.nativeViewProtected.minimumDate ? this.nativeViewProtected.minimumDate.getHours() : 0;
	}
	[minHourProperty.setNative](value: number) {
		this.nativeViewProtected.minimumDate = getDate(value, this.minute);
	}

	[maxHourProperty.getDefault](): number {
		return this.nativeViewProtected.maximumDate ? this.nativeViewProtected.maximumDate.getHours() : 24;
	}
	[maxHourProperty.setNative](value: number) {
		this.nativeViewProtected.maximumDate = getDate(value, this.minute);
	}

	[minMinuteProperty.getDefault](): number {
		return this.nativeViewProtected.minimumDate ? this.nativeViewProtected.minimumDate.getMinutes() : 0;
	}
	[minMinuteProperty.setNative](value: number) {
		this.nativeViewProtected.minimumDate = getDate(this.hour, value);
	}

	[maxMinuteProperty.getDefault](): number {
		return this.nativeViewProtected.maximumDate ? this.nativeViewProtected.maximumDate.getMinutes() : 60;
	}
	[maxMinuteProperty.setNative](value: number) {
		this.nativeViewProtected.maximumDate = getDate(this.hour, value);
	}

	[minuteIntervalProperty.getDefault](): number {
		return this.nativeViewProtected.minuteInterval;
	}
	[minuteIntervalProperty.setNative](value: number) {
		this.nativeViewProtected.minuteInterval = value;
	}

	[colorProperty.getDefault](): UIColor {
		return SUPPORT_TEXT_COLOR ? this.nativeViewProtected.valueForKey('textColor') : UIColor.new();
	}
	[colorProperty.setNative](value: Color | UIColor) {
		if (SUPPORT_TEXT_COLOR) {
			const color = value instanceof Color ? value.ios : value;
			this.nativeViewProtected.setValueForKey(color, 'textColor');
		}
	}
}

@NativeClass
class UITimePickerChangeHandlerImpl extends NSObject {
	private _owner: WeakRef<TimePicker>;

	public static initWithOwner(owner: WeakRef<TimePicker>): UITimePickerChangeHandlerImpl {
		let handler = <UITimePickerChangeHandlerImpl>UITimePickerChangeHandlerImpl.new();
		handler._owner = owner;

		return handler;
	}

	public valueChanged(sender: UIDatePicker) {
		let owner = this._owner.get();
		if (!owner) {
			return;
		}

		let components = getComponents(sender.date);

		let timeChanged = false;
		if (components.hour !== owner.hour) {
			hourProperty.nativeValueChange(owner, components.hour);
			timeChanged = true;
		}

		if (components.minute !== owner.minute) {
			minuteProperty.nativeValueChange(owner, components.minute);
			timeChanged = true;
		}

		if (timeChanged) {
			timeProperty.nativeValueChange(owner, new Date(0, 0, 0, components.hour, components.minute));
		}
	}

	public static ObjCExposedMethods = {
		valueChanged: { returns: interop.types.void, params: [UIDatePicker] },
	};
}
