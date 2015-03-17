import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import timePickerTestsNative = require("./time-picker-tests-native");

// <snippet module="ui/time-picker" title="timePicker">
// # timePicker

// Using a timePicker requires the "ui/time-picker" module.
// ``` JavaScript
import timePickerModule = require("ui/time-picker");

function _createtimePicker(): timePickerModule.TimePicker {
    // <snippet module="ui/time-picker" title="timePicker">
    // ## Creating a timePicker
    // ``` JavaScript
    var timePicker = new timePickerModule.TimePicker();
    // ```
    // </snippet>
    timePicker.id = "timePicker";
    return timePicker;
}

export var test_WhenCreated_HourIsUndefined = function () {
    helper.buildUIAndRunTest(_createtimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.hour;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var test_WhenCreated_MinuteIsUndefined = function () {
    helper.buildUIAndRunTest(_createtimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.minute;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testHourFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createtimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 13;
        timePicker.hour = expectedValue;
        var actualValue = timePickerTestsNative.getNativeHour(timePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testMinuteFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createtimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 59;
        timePicker.minute = expectedValue;
        var actualValue = timePickerTestsNative.getNativeMinute(timePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testHourFromNativeToLocal = function () {
    helper.buildUIAndRunTest(_createtimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 14;
        timePickerTestsNative.setNativeHour(timePicker, expectedValue);
        var actualValue = timePicker.hour;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testMinuteFromNativeToLocal = function () {
    helper.buildUIAndRunTest(_createtimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 33;
        timePickerTestsNative.setNativeMinute(timePicker, expectedValue);
        var actualValue = timePicker.minute;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}