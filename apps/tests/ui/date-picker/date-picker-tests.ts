import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import datePickerTestsNative = require("./date-picker-tests-native");

// <snippet module="ui/date-picker" title="DatePicker">
// # DatePicker

// Using a DatePicker requires the "ui/date-picker" module.
// ``` JavaScript
import datePickerModule = require("ui/date-picker");
// ```
// </snippet>

function _createDatePicker(): datePickerModule.DatePicker {
    // <snippet module="ui/date-picker" title="DatePicker">
    // ## Creating a DatePicker
    // ``` JavaScript
    var datePicker = new datePickerModule.DatePicker();
    // ```
    // </snippet>
    datePicker.id = "DatePicker";
    return datePicker;
}

export var test_DummyForCodeSnippet = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        // <snippet module="ui/date-picker" title="DatePicker">
        // ## Configuring a DatePicker
        // ``` JavaScript
        datePicker.year = 1980;
        datePicker.month = 2;
        datePicker.day = 9;
        // ```
        // </snippet>
    });
}

export var test_WhenCreated_YearIsUndefined = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var actualValue = datePicker.year;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var test_WhenCreated_MonthIsUndefined = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var actualValue = datePicker.month;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var test_WhenCreated_DayIsUndefined = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var actualValue = datePicker.day;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testYearFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 1980;
        datePicker.year = expectedValue;
        var actualValue = datePickerTestsNative.getNativeYear(datePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testMonthFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 5;
        datePicker.month = expectedValue;
        var actualValue = datePickerTestsNative.getNativeMonth(datePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testDayFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 19;
        datePicker.day = expectedValue;
        var actualValue = datePickerTestsNative.getNativeDay(datePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testYearFromNativeToLocal = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 1981;
        datePickerTestsNative.setNativeYear(datePicker, expectedValue);
        var actualValue = datePicker.year;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testMonthFromNativeToLocal = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 6;
        datePickerTestsNative.setNativeMonth(datePicker, expectedValue);
        var actualValue = datePicker.month;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testDayFromNativeToLocal = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 20;
        datePickerTestsNative.setNativeDay(datePicker, expectedValue);
        var actualValue = datePicker.day;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}