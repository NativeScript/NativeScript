import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import timePickerTestsNative = require("./time-picker-tests-native");

// <snippet module="ui/time-picker" title="TimePicker">
// # TimePicker
// Using a TimePicker requires the "ui/time-picker" module.
// ``` JavaScript
import timePickerModule = require("ui/time-picker");
// ```
// </snippet>

function _createTimePicker(): timePickerModule.TimePicker {
    // <snippet module="ui/time-picker" title="TimePicker">
    // ## Creating a TimePicker
    // ``` JavaScript
    var timePicker = new timePickerModule.TimePicker();
    // ```
    // </snippet>
    timePicker.id = "timePicker";
    return timePicker;
}

export var test_DummyForCodeSnippet = function () {
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

export var test_WhenCreated_HourIsUndefined = function () {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.hour;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var test_WhenCreated_MinuteIsUndefined = function () {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var actualValue = timePicker.minute;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testHourFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 13;
        timePicker.hour = expectedValue;
        var actualValue = timePickerTestsNative.getNativeHour(timePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testMinuteFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 59;
        timePicker.minute = expectedValue;
        var actualValue = timePickerTestsNative.getNativeMinute(timePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testHourFromNativeToLocal = function () {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 14;
        timePickerTestsNative.setNativeHour(timePicker, expectedValue);
        var actualValue = timePicker.hour;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testMinuteFromNativeToLocal = function () {
    helper.buildUIAndRunTest(_createTimePicker(), function (views: Array<viewModule.View>) {
        var timePicker = <timePickerModule.TimePicker>views[0];
        var expectedValue = 33;
        timePickerTestsNative.setNativeMinute(timePicker, expectedValue);
        var actualValue = timePicker.minute;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}