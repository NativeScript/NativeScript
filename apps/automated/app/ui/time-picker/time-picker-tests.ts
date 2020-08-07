import * as TKUnit from '../../tk-unit';
import * as testModule from '../../ui-test';
import * as timePickerTestsNative from './time-picker-tests-native';
import * as color from '@nativescript/core/color';
import * as platform from '@nativescript/core/platform';
import * as helper from '../../ui-helper';

// >> require-time-picker
import * as timePickerModule from '@nativescript/core/ui/time-picker';
// << require-time-picker

function assertTime(timePicker: timePickerModule.TimePicker, expectedHour: number, expectedMinute) {
	TKUnit.assertEqual(timePicker.hour, expectedHour, 'timePicker.hour');
	TKUnit.assertEqual(timePicker.minute, expectedMinute, 'timePicker.minute');

	TKUnit.assertEqual(timePickerTestsNative.getNativeHour(timePicker), expectedHour, 'Native timePicker.hour');
	TKUnit.assertEqual(timePickerTestsNative.getNativeMinute(timePicker), expectedMinute, 'Native timePicker.minute');
}

export class TimePickerTest extends testModule.UITest<timePickerModule.TimePicker> {
	public create() {
		let timePicker = new timePickerModule.TimePicker();
		timePicker.id = 'TimePicker';

		return timePicker;
	}

	public test_recycling() {
		helper.nativeView_recycling_test(this.create);
	}

	public test_DummyForCodeSnippet() {
		// >> declare-time-picker
		var timePicker = new timePickerModule.TimePicker();
		timePicker.hour = 9;
		timePicker.minute = 25;
		// << declare-time-picker
	}

	private setUpTimePicker(hour?: number, minute?: number) {
		if (hour) {
			this.testView.hour = hour;
		}

		if (minute) {
			this.testView.minute = minute;
		}
	}

	// Supported in iOS only.
	public test_set_color() {
		if (platform.Device.os === platform.platformNames.ios) {
			this.testView.color = new color.Color('red');
			TKUnit.assertEqual(this.testView.color.ios.CGColor, this.testView.ios.valueForKey('textColor').CGColor, 'timePicker.color');
		}
	}

	public test_WhenCreated_MinuteIntervalIs1() {
		let actualValue = this.testView.minuteInterval;
		let expectedValue = 1;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_HourIsCurrentHour() {
		let actualValue = this.testView.hour;
		let expectedValue = timePickerTestsNative.getNativeHour(this.testView);
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_MinHourIs0() {
		let actualValue = this.testView.minHour;
		let expectedValue = 0;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_MaxHourIs23() {
		let actualValue = this.testView.maxHour;
		let expectedValue = 23;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_MinuteIsCurrentMinute() {
		let actualValue = this.testView.minute;
		let expectedValue = timePickerTestsNative.getNativeMinute(this.testView);
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_MinMinuteIs0() {
		let actualValue = this.testView.minMinute;
		let expectedValue = 0;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public test_WhenCreated_MaxMinuteIs59() {
		let actualValue = this.testView.maxMinute;
		let expectedValue = 59;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testMinuteIntervalThrowExceptionWhenLessThan1() {
		TKUnit.assertThrows(() => {
			this.testView.minuteInterval = 0;
		}, 'Setting minuteInterval property to a value less than 1 should throw.');
	}

	public testMinuteIntervalThrowExceptionWhenGreaterThan30() {
		TKUnit.assertThrows(() => {
			this.testView.minuteInterval = 31;
		}, 'Setting minuteInterval property to a value greater than 30 should throw.');
	}

	public testMinuteIntervalThrowExceptionWhenNotFold60() {
		TKUnit.assertThrows(() => {
			this.testView.minuteInterval = 7;
		}, 'Setting minuteInterval property to a value not fold 60 should throw.');
	}

	public testHourThrowExceptionWhenLessThanMinHour() {
		this.testView.hour = 14;
		this.testView.minHour = this.testView.hour - 1;
		TKUnit.assertThrows(() => {
			this.testView.hour = this.testView.minHour - 1;
		}, 'Setting hour property to a value less than minHour property value should throw.');
	}

	public testMinHourThrowExceptionWhenHourLessThanMinHour() {
		this.testView.hour = 14;
		TKUnit.assertThrows(() => {
			this.testView.minHour = this.testView.hour + 1;
		}, 'Setting minHour property to a greater than hour property value should throw.');
	}

	public testHourThrowExceptionWhenGreaterThanMaxHour() {
		this.testView.hour = 14;
		this.testView.maxHour = this.testView.hour + 1;
		TKUnit.assertThrows(() => {
			this.testView.hour = this.testView.maxHour + 1;
		}, 'Setting hour property to a value greater than maxHour property value should throw.');
	}

	public testMaxHourThrowExceptionWhenHourGreaterThanMaxHour() {
		this.testView.hour = 14;
		TKUnit.assertThrows(() => {
			this.testView.maxHour = this.testView.hour - 1;
		}, 'Setting maxHour property to a value less than hour property value should throw.');
	}

	public testMinuteThrowExceptionWhenLessThanMinMinute() {
		this.testView.hour = 14;
		this.testView.minute = 13;

		this.testView.minHour = this.testView.hour;
		this.testView.minMinute = this.testView.minute;
		TKUnit.assertThrows(() => {
			this.testView.minute = this.testView.minMinute - 1;
		}, 'Setting minute property to a value less than minMinute property value should throw.');
	}

	public testMinMinuteThrowExceptionWhenMinuteLessThanMinMinute() {
		this.testView.hour = 14;
		this.testView.minute = 13;

		this.testView.minHour = this.testView.hour;
		TKUnit.assertThrows(() => {
			this.testView.minMinute = this.testView.minute + 1;
		}, 'Setting minMinute property to a value greater than minute property value should throw.');
	}

	public testMinuteThrowExceptionWhenGreaterThanMaxMinute() {
		this.testView.hour = 14;
		this.testView.minute = 13;

		this.testView.maxHour = this.testView.hour;
		this.testView.maxMinute = this.testView.minute;
		TKUnit.assertThrows(() => {
			this.testView.minute = this.testView.maxMinute + 1;
		}, 'Setting minute property to a value greater than maxMinute property value should throw.');
	}

	public testMaxMinuteThrowExceptionWhenMinuteGreaterThanMaxMinute() {
		this.testView.hour = 14;
		this.testView.minute = 13;

		this.testView.maxHour = this.testView.hour;
		TKUnit.assertThrows(() => {
			this.testView.maxMinute = this.testView.minute - 1;
		}, 'Setting maxMinute property to a value less than minute property value should throw.');
	}

	public testHourFromLocalToNative() {
		let expectedValue = 13;
		this.testView.hour = expectedValue;
		let actualValue = timePickerTestsNative.getNativeHour(this.testView);
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testMinuteFromLocalToNative() {
		let expectedValue = 59;
		this.testView.minute = expectedValue;
		let actualValue = timePickerTestsNative.getNativeMinute(this.testView);
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testHourFromNativeToLocal() {
		let expectedValue = 14;
		timePickerTestsNative.setNativeHour(this.testView, expectedValue);
		let actualValue = this.testView.hour;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testMinuteFromNativeToLocal() {
		let expectedValue = 33;
		timePickerTestsNative.setNativeMinute(this.testView, expectedValue);
		let actualValue = this.testView.minute;
		TKUnit.assertEqual(actualValue, expectedValue);
	}

	public testHourAndMinuteFromNativeToLocal() {
		let expectedHour = 12;
		let expectedMinute = 34;

		timePickerTestsNative.setNativeTime(this.testView, expectedHour, expectedMinute);
		assertTime(this.testView, expectedHour, expectedMinute);
	}

	public testSetHourMinute_BeforeLoaded() {
		let expectedHour = 12;
		let expectedMinute = 34;

		this.setUpTimePicker(expectedHour, expectedMinute);

		assertTime(this.testView, expectedHour, expectedMinute);
	}

	public testTimeSetHourMinute_BeforeLoaded() {
		let expectedHour = 12;
		let expectedMinute = 34;

		this.setUpTimePicker(expectedHour, expectedMinute);

		TKUnit.assertEqual(this.testView.time.getHours(), expectedHour);
		TKUnit.assertEqual(this.testView.time.getMinutes(), expectedMinute);
	}

	public testSetHourMinute_AfterLoaded() {
		let expectedHour = 12;
		let expectedMinute = 34;

		this.testView.hour = expectedHour;
		this.testView.minute = expectedMinute;

		TKUnit.assertEqual(this.testView.time.getHours(), expectedHour);
		TKUnit.assertEqual(this.testView.time.getMinutes(), expectedMinute);
	}

	public testTimeSetHourMinute_AfterLoaded() {
		let expectedHour = 12;
		let expectedMinute = 34;

		this.testView.hour = expectedHour;
		this.testView.minute = expectedMinute;

		TKUnit.assertEqual(this.testView.time.getHours(), expectedHour);
		TKUnit.assertEqual(this.testView.time.getMinutes(), expectedMinute);
	}

	public testSetTimeChangesHourAndMinute() {
		let expectedHour = 12;
		let expectedMinute = 34;

		this.testView.time = new Date(0, 0, 0, expectedHour, expectedMinute);
		assertTime(this.testView, expectedHour, expectedMinute);
	}
}

export function createTestCase(): TimePickerTest {
	return new TimePickerTest();
}
