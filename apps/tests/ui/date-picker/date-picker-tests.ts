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
        datePicker.minDate = new Date(1975, 0, 29);
        datePicker.maxDate = new Date(2045, 4, 12);
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

export var testMaxDateFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = new Date(1980, 1, 9);
        datePicker.maxDate = expectedValue;
        var actualValue = datePickerTestsNative.getNativeMaxDate(datePicker);
        TKUnit.assert(actualValue.getTime() === expectedValue.getTime(), "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testMinDateFromLocalToNative = function () {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = new Date(1980, 1, 9);
        datePicker.minDate = expectedValue;
        var actualValue = datePickerTestsNative.getNativeMinDate(datePicker);
        TKUnit.assert(actualValue.getTime() === expectedValue.getTime(), "Actual: " + actualValue + "; Expected: " + expectedValue);
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

//export var testWTF = function () {
//    var picker = new UIDatePicker();
//    picker.datePickerMode = UIDatePickerMode.UIDatePickerModeDate;
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