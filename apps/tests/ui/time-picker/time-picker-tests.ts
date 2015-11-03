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

export function test_WhenCreated_HourIsUndefined() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.hour;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function test_WhenCreated_MinuteIsUndefined() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.minute;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testHourFromLocalToNative() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 13;
        timePicker.hour = expectedValue;
        var actualValue = timePickerTestsNative.getNativeHour(timePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testMinuteFromLocalToNative() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 59;
        timePicker.minute = expectedValue;
        var actualValue = timePickerTestsNative.getNativeMinute(timePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testHourFromNativeToLocal() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 14;
        timePickerTestsNative.setNativeHour(timePicker, expectedValue);
        var actualValue = timePicker.hour;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testMinuteFromNativeToLocal() {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 33;
        timePickerTestsNative.setNativeMinute(timePicker, expectedValue);
        var actualValue = timePicker.minute;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
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