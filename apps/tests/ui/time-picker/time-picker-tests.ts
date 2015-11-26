import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import timePickerTestsNative = require("./time-picker-tests-native");
import color = require("color");
import platform = require("platform");

// <snippet module="ui/time-picker" title="TimePicker">
// # TimePicker
// Using a TimePicker requires the "ui/time-picker" module.
// ``` JavaScript
import timePickerModule = require("ui/time-picker");
// ```
// </snippet>

function _createTimePicker(hour?: number, minute?: number): timePickerModule.TimePicker {
    // <snippet module="ui/time-picker" title="TimePicker">
    // ## Creating a TimePicker
    // ``` JavaScript
    var timePicker = new timePickerModule.TimePicker();
    // ```
    // </snippet>
    timePicker.id = "timePicker";

    if (hour) {
        timePicker.hour = hour;
    }

    if (minute) {
        timePicker.minute = minute;
    }

    return timePicker;
}

export function test_DummyForCodeSnippet() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        // <snippet module="ui/time-picker" title="TimePicker">
        // ## Configuring a TimePicker
        // ``` JavaScript
        timePicker.hour = 9;
        timePicker.minute = 25;
        // ```
        // </snippet>
    });
}

// Supported in iOS only.
if (platform.device.os === platform.platformNames.ios) {
    exports.test_set_color = function () {
        helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
            var timePicker = <timePickerModule.TimePicker>views[0];
            timePicker.color = new color.Color("red");
            TKUnit.assertEqual(timePicker.color.ios.CGColor, timePicker.ios.valueForKey("textColor").CGColor, "timePicker.color");
        });

    }
}

export function test_WhenCreated_MinuteIntervalIs1() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.minuteInterval;
        var expectedValue = 1;
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function test_WhenCreated_HourIsCurrentHour() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.hour;
        var expectedValue = timePickerTestsNative.getNativeHour(timePicker);
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function test_WhenCreated_MinHourIs0() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.minHour;
        var expectedValue = 0;
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function test_WhenCreated_MaxHourIs23() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.maxHour;
        var expectedValue = 23;
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function test_WhenCreated_MinuteIsCurrentMinute() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.minute;
        var expectedValue = timePickerTestsNative.getNativeMinute(timePicker);
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function test_WhenCreated_MinMinuteIs0() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.minMinute;
        var expectedValue = 0;
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function test_WhenCreated_MaxMinuteIs59() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.maxMinute;
        var expectedValue = 59;
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function testMinuteIntervalThrowExceptionWhenLessThan1() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        TKUnit.assertThrows(function () {
            timePicker.minuteInterval = 0;
        }, "Setting minuteInterval property to a value less than 1 should throw.");
    });
}

export function testMinuteIntervalThrowExceptionWhenGreaterThan30() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        TKUnit.assertThrows(function () {
            timePicker.minuteInterval = 31;
        }, "Setting minuteInterval property to a value greater than 30 should throw.");
    });
}

export function testMinuteIntervalThrowExceptionWhenNotFold60() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        TKUnit.assertThrows(function () {
            timePicker.minuteInterval = 7;
        }, "Setting minuteInterval property to a value not fold 60 should throw.");
    });
}

export function testHourThrowExceptionWhenLessThanMinHour() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        timePicker.minHour = timePicker.hour - 1;
        TKUnit.assertThrows(function () {
            timePicker.hour = timePicker.minHour - 1;
        }, "Setting hour property to a value less than minHour property value should throw.");
    });
}

export function testMinHourThrowExceptionWhenHourLessThanMinHour() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        TKUnit.assertThrows(function () {
            timePicker.minHour = timePicker.hour + 1;
        }, "Setting minHour property to a greater than hour property value should throw.");
    });
}

export function testHourThrowExceptionWhenGreaterThanMaxHour() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        timePicker.maxHour = timePicker.hour + 1;
        TKUnit.assertThrows(function () {
            timePicker.hour = timePicker.maxHour + 1;;
        }, "Setting hour property to a value greater than maxHour property value should throw.");
    });
}

export function testMaxHourThrowExceptionWhenHourGreaterThanMaxHour() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        TKUnit.assertThrows(function () {
            timePicker.maxHour = timePicker.hour - 1;
        }, "Setting maxHour property to a value less than hour property value should throw.");
    });
}

export function testMinuteThrowExceptionWhenLessThanMinMinute() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        timePicker.minute = 13;

        timePicker.minHour = timePicker.hour;
        timePicker.minMinute = timePicker.minute;
        TKUnit.assertThrows(function () {
            timePicker.minute = timePicker.minMinute - 1;
        }, "Setting minute property to a value less than minMinute property value should throw.");
    });
}

export function testMinMinuteThrowExceptionWhenMinuteLessThanMinMinute() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        timePicker.minute = 13;

        timePicker.minHour = timePicker.hour;
        TKUnit.assertThrows(function () {
            timePicker.minMinute = timePicker.minute + 1;
        }, "Setting minMinute property to a value greater than minute property value should throw.");
    });
}

export function testMinuteThrowExceptionWhenGreaterThanMaxMinute() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        timePicker.minute = 13;

        timePicker.maxHour = timePicker.hour;
        timePicker.maxMinute = timePicker.minute;
        TKUnit.assertThrows(function () {
            timePicker.minute = timePicker.maxMinute + 1;
        }, "Setting minute property to a value greater than maxMinute property value should throw.");
    });
}

export function testMaxMinuteThrowExceptionWhenMinuteGreaterThanMaxMinute() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = 14;
        timePicker.minute = 13;

        timePicker.maxHour = timePicker.hour;
        TKUnit.assertThrows(function () {
            timePicker.maxMinute = timePicker.minute - 1;
        }, "Setting maxMinute property to a value less than minute property value should throw.");
    });
}

export function testHourFromLocalToNative() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 13;
        timePicker.hour = expectedValue;
        var actualValue = timePickerTestsNative.getNativeHour(timePicker);
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function testMinuteFromLocalToNative() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 59;
        timePicker.minute = expectedValue;
        var actualValue = timePickerTestsNative.getNativeMinute(timePicker);
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function testHourFromNativeToLocal() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 14;
        timePickerTestsNative.setNativeHour(timePicker, expectedValue);
        var actualValue = timePicker.hour;
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function testMinuteFromNativeToLocal() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 33;
        timePickerTestsNative.setNativeMinute(timePicker, expectedValue);
        var actualValue = timePicker.minute;
        TKUnit.assertEqual(actualValue, expectedValue);
    });
}

export function testHourAndMinuteFromNativeToLocal() {
    var expectedHour = 12;
    var expectedMinute = 34;

    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePickerTestsNative.setNativeTime(timePicker, expectedHour, expectedMinute);
        assertTime(timePicker, expectedHour, expectedMinute);
    });
}

export function testSetHourMinute_BeforeLoaded() {
    var expectedHour = 12;
    var expectedMinute = 34;

    helper.buildUIAndRunTest(_createTimePicker(expectedHour, expectedMinute), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        assertTime(timePicker, expectedHour, expectedMinute);
    });
}

export function testSetHourMinute_AfterLoaded() {
    var expectedHour = 12;
    var expectedMinute = 34;

    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        timePicker.hour = expectedHour;
        timePicker.minute = expectedMinute;

        assertTime(timePicker, expectedHour, expectedMinute);
    });
}

function assertTime(timePicker: timePickerModule.TimePicker, expectedHour: number, expectedMinute) {
    TKUnit.assertEqual(timePicker.hour, expectedHour, "timePicker.hour");
    TKUnit.assertEqual(timePicker.minute, expectedMinute, "timePicker.minute");

    TKUnit.assertEqual(timePickerTestsNative.getNativeHour(timePicker), expectedHour, "Native timePicker.hour");
    TKUnit.assertEqual(timePickerTestsNative.getNativeMinute(timePicker), expectedMinute, "Native timePicker.minute");
}