import * as TKUnit from '../../tk-unit';
import * as testModule from '../../ui-test';
import * as datePickerTestsNative from './date-picker-tests-native';
import * as color from '@nativescript/core/color';
import * as platform from '@nativescript/core/platform';

// >> date-picker-require
import * as datePickerModule from '@nativescript/core/ui/date-picker';
// << date-picker-require

import * as helper from '../../ui-helper';

export function test_recycling() {
	helper.nativeView_recycling_test(() => new datePickerModule.DatePicker());
}
const currentDate = new Date();

function assertDate(datePicker: datePickerModule.DatePicker, expectedYear: number, expectedMonth: number, expectedDay: number) {
	TKUnit.assertEqual(datePicker.year, expectedYear, 'datePicker.year');
	TKUnit.assertEqual(datePicker.month, expectedMonth, 'datePicker.month');
	TKUnit.assertEqual(datePicker.day, expectedDay, 'datePicker.day');

	TKUnit.assertEqual(datePickerTestsNative.getNativeYear(datePicker), expectedYear, 'Native datePicker.year');
	TKUnit.assertEqual(datePickerTestsNative.getNativeMonth(datePicker), expectedMonth, 'Native datePicker.month');
	TKUnit.assertEqual(datePickerTestsNative.getNativeDay(datePicker), expectedDay, 'Native datePicker.day');
}

//export function testWTF() {
//    var picker = new UIDatePicker();
//    picker.datePickerMode = UIDatePickerMode.Date;
//    var jsDate = new Date(1980, 1, 9);
//    var nsDate = NSDate.dateWithTimeIntervalSince1970(jsDate.getTime() / 1000);
//    console.log("nsDate: " + nsDate);
//    console.log("nsDate.timeIntervalSince1970: " + nsDate.timeIntervalSince1970);
//    console.log("------------------");
//    picker.maximumDate = nsDate;
//    console.log("------------------");
//    console.log("(picker.ios.maximumDate === nsDate): " + (picker.maximumDate === nsDate));
//    console.log("nsDate: " + nsDate);
//    console.log("nsDate.timeIntervalSince1970: " + nsDate.timeIntervalSince1970);
//    console.log("picker.ios.maximumDate: " + picker.maximumDate);
//    console.log("picker.ios.maximumDate.timeIntervalSince1970: " + picker.maximumDate.timeIntervalSince1970);
//}

export class DatePickerTest extends testModule.UITest<datePickerModule.DatePicker> {
	public create() {
		const datePicker = new datePickerModule.DatePicker();
		datePicker.id = 'DatePicker';

		return datePicker;
	}

	private setUpDatePicker(year?: number, month?: number, day?: number) {
		if (year) {
			this.testView.year = year;
		}

		if (month) {
			this.testView.month = month;
		}

		if (day) {
			this.testView.day = day;
		}
	}

	public test_DummyForCodeSnippet() {
		const datePicker = new datePickerModule.DatePicker();
		// >> date-picker-configure
		datePicker.year = 1980;
		datePicker.month = 2;
		datePicker.day = 9;
		datePicker.minDate = new Date(1975, 0, 29);
		datePicker.maxDate = new Date(2045, 4, 12);
		// << date-picker-configure
	}

	public test_set_color() {
		if (platform.Device.os === platform.platformNames.ios) {
			this.testView.color = new color.Color('red');
			TKUnit.assertEqual(this.testView.color.ios.CGColor, this.testView.ios.valueForKey('textColor').CGColor, 'datePicker.color');
		}
	}

	public test_WhenCreated_YearIsCurrentYear() {
		const actualValue = this.testView.year;
		const expectedValue = currentDate.getFullYear();
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_MonthIsCurrentMonth() {
		const actualValue = this.testView.month;
		const expectedValue = currentDate.getMonth() + 1;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_DayIsCurrentDay() {
		const actualValue = this.testView.day;
		const expectedValue = currentDate.getDate();
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_NativeYearIsCurrentYear() {
		const actualValue = datePickerTestsNative.getNativeYear(this.testView);
		const expectedValue = currentDate.getFullYear();
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_NativeMonthIsCurrentMonth() {
		const actualValue = datePickerTestsNative.getNativeMonth(this.testView);
		const expectedValue = currentDate.getMonth() + 1;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_NativeDayIsCurrentDay() {
		const actualValue = datePickerTestsNative.getNativeDay(this.testView);
		const expectedValue = currentDate.getDate();
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testYearFromLocalToNative() {
		const expectedValue = 1980;
		this.testView.year = expectedValue;
		const actualValue = datePickerTestsNative.getNativeYear(this.testView);
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testMonthFromLocalToNative() {
		const expectedValue = 5;
		this.testView.month = expectedValue;
		const actualValue = datePickerTestsNative.getNativeMonth(this.testView);
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testDayFromLocalToNative() {
		const expectedValue = 19;
		this.testView.day = expectedValue;
		const actualValue = datePickerTestsNative.getNativeDay(this.testView);
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_DateIsSetCorrectlyWhenDayIsSet() {
		const today = new Date(2016, 3, 15);
		this.testView.year = today.getFullYear();
		this.testView.month = today.getMonth();
		const expectedValue = today.getDate();
		this.testView.day = expectedValue;

		const expectedDate = new Date(today.getFullYear(), today.getMonth() - 1, expectedValue);
		TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), 'Getting Day from date property failed.');
		TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), 'Getting Month from date property failed.');
		TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), 'Getting Year from date property failed.');
	}

	public test_DateIsSetCorrectlyWhenMonthIsSet() {
		const today = new Date(2016, 3, 15);
		this.testView.year = today.getFullYear();
		this.testView.day = today.getDate();

		const expectedValue = today.getMonth();
		this.testView.month = expectedValue;
		const expectedDate = new Date(today.getFullYear(), expectedValue - 1, today.getDate());

		TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), 'Getting Day from date property failed.');
		TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), 'Getting Month from date property failed.');
		TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), 'Getting Year from date property failed.');
	}

	public test_DateIsSetCorrectlyWhenYearIsSet() {
		const current = new Date(2016, 3, 15);
		this.testView.month = current.getMonth();
		this.testView.day = current.getDate();

		const expectedValue = 1980;
		this.testView.year = expectedValue;
		const expectedDate = new Date(1980, current.getMonth() - 1, current.getDate());

		TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), 'Getting Day from date property failed.');
		TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), 'Getting Month from date property failed.');
		TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), 'Getting Year from date property failed.');
	}

	public testMaxDateFromLocalToNative() {
		const expectedValue = new Date(1980, 1, 9);
		this.testView.maxDate = expectedValue;
		const actualValue = datePickerTestsNative.getNativeMaxDate(this.testView);
		TKUnit.assertEqual(actualValue.getTime(), expectedValue.getTime());
	}

	public testMinDateFromLocalToNative() {
		const expectedValue = new Date(1980, 1, 9);
		this.testView.minDate = expectedValue;
		const actualValue = datePickerTestsNative.getNativeMinDate(this.testView);
		TKUnit.assertEqual(actualValue.getTime(), expectedValue.getTime());
	}

	public testYearFromNativeToLocal() {
		const expectedValue = 1981;
		datePickerTestsNative.setNativeYear(this.testView, expectedValue);
		const actualValue = this.testView.year;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testMonthFromNativeToLocal() {
		// Use July as it has 31 days
		const expectedValue = 7;
		datePickerTestsNative.setNativeMonth(this.testView, expectedValue);
		const actualValue = this.testView.month;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testYearMonthDayFromNativeToLocal() {
		const testYear = 2000;
		const testMonth = 3;
		const testDay = 24;

		datePickerTestsNative.setNativeDate(this.testView, testYear, testMonth, testDay);
		assertDate(this.testView, testYear, testMonth, testDay);
	}

	public testDayFromNativeToLocal() {
		const expectedValue = 20;
		datePickerTestsNative.setNativeDay(this.testView, expectedValue);
		const actualValue = this.testView.day;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	}

	public test_DateFromNativeToLocalWithDay() {
		const today = new Date();
		const expectedValue = 20;

		datePickerTestsNative.setNativeDate(this.testView, today.getFullYear(), today.getMonth(), expectedValue);

		const expectedDate = new Date(today.getFullYear(), today.getMonth() - 1, expectedValue);
		TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), 'Getting Day from date property failed.');
		TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), 'Getting Month from date property failed.');
		TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), 'Getting Year from date property failed.');
	}

	public test_DateFromNativeToLocalWithMonth() {
		const today = new Date();
		const expectedValue = 7;

		datePickerTestsNative.setNativeDate(this.testView, today.getFullYear(), expectedValue, today.getDate());

		const expectedDate = new Date(today.getFullYear(), expectedValue - 1, today.getDate());
		TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), 'Getting Day from date property failed.');
		TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), 'Getting Month from date property failed.');
		TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), 'Getting Year from date property failed.');
	}

	public test_DateFromNativeToLocalWithYear() {
		const today = new Date();

		const expectedValue = 1981;
		datePickerTestsNative.setNativeDate(this.testView, expectedValue, today.getMonth(), today.getDate());

		const expectedDate = new Date(expectedValue, today.getMonth() - 1, today.getDate());
		TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), 'Getting Day from date property failed.');
		TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), 'Getting Month from date property failed.');
		TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), 'Getting Year from date property failed.');
	}

	public test_DateFromNativeToLocalWithAll() {
		const testYear = 2000;
		const testMonth = 3;
		const testDay = 24;

		datePickerTestsNative.setNativeDate(this.testView, testYear, testMonth, testDay);
		const expectedDate = new Date(testYear, testMonth - 1, testDay);
		TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), 'Getting Day from date property failed.');
		TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), 'Getting Month from date property failed.');
		TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), 'Getting Year from date property failed.');
	}

	public testSetYearMonthDay_BeforeLoaded() {
		const testYear = 2000;
		const testMonth = 3;
		const testDay = 24;

		this.setUpDatePicker(testYear, testMonth, testDay);

		TKUnit.assertEqual(this.testView.year, testYear, 'datePicker.year');
		TKUnit.assertEqual(this.testView.month, testMonth, 'datePicker.month');
		TKUnit.assertEqual(this.testView.day, testDay, 'datePicker.day');

		TKUnit.assertEqual(datePickerTestsNative.getNativeYear(this.testView), testYear, 'Native datePicker.year');
		TKUnit.assertEqual(datePickerTestsNative.getNativeMonth(this.testView), testMonth, 'Native datePicker.month');
		TKUnit.assertEqual(datePickerTestsNative.getNativeDay(this.testView), testDay, 'Native datePicker.day');
	}

	public testSetYearMonthDay_AfterLoaded() {
		const testYear = 2000;
		const testMonth = 3;
		const testDay = 24;

		this.testView.year = testYear;
		this.testView.month = testMonth;
		this.testView.day = testDay;

		this.waitUntilTestElementIsLoaded();
		assertDate(this.testView, testYear, testMonth, testDay);
	}
}

export function createTestCase(): DatePickerTest {
	return new DatePickerTest();
}
