import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import datePickerTestsNative = require("./date-picker-tests-native");
import color = require("color");
import platform = require("platform");

// <snippet module="ui/date-picker" title="DatePicker">
// # DatePicker
// Using a DatePicker requires the "ui/date-picker" module.
// ``` JavaScript
import datePickerModule = require("ui/date-picker");
// ```
// </snippet>

function _createDatePicker(year?: number, month?: number, day?: number): datePickerModule.DatePicker {
    // <snippet module="ui/date-picker" title="DatePicker">
    // ## Creating a DatePicker
    // ``` JavaScript
    var datePicker = new datePickerModule.DatePicker();
    // ```
    // </snippet>
    datePicker.id = "DatePicker";

    if (year) {
        datePicker.year = year;
    }

    if (month) {
        datePicker.month = month;
    }

    if (day) {
        datePicker.day = day;
    }

    return datePicker;
}

export function test_DummyForCodeSnippet() {
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

// Supported in iOS only.
if (platform.device.os === platform.platformNames.ios) {
    exports.test_set_color = function () {
        helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
            var datePicker = <datePickerModule.DatePicker>views[0];
            datePicker.color = new color.Color("red");
            TKUnit.assertEqual(datePicker.color.ios.CGColor, datePicker.ios.valueForKey("textColor").CGColor, "datePicker.color");
        });

    }
}

export function test_WhenCreated_YearIsUndefined() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var actualValue = datePicker.year;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function test_WhenCreated_MonthIsUndefined() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var actualValue = datePicker.month;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function test_WhenCreated_DayIsUndefined() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var actualValue = datePicker.day;
        var expectedValue = undefined;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testYearFromLocalToNative() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 1980;
        datePicker.year = expectedValue;
        var actualValue = datePickerTestsNative.getNativeYear(datePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testMonthFromLocalToNative() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 5;
        datePicker.month = expectedValue;
        var actualValue = datePickerTestsNative.getNativeMonth(datePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testDayFromLocalToNative() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 19;
        datePicker.day = expectedValue;
        var actualValue = datePickerTestsNative.getNativeDay(datePicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testMaxDateFromLocalToNative() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = new Date(1980, 1, 9);
        datePicker.maxDate = expectedValue;
        var actualValue = datePickerTestsNative.getNativeMaxDate(datePicker);
        TKUnit.assert(actualValue.getTime() === expectedValue.getTime(), "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testMinDateFromLocalToNative() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = new Date(1980, 1, 9);
        datePicker.minDate = expectedValue;
        var actualValue = datePickerTestsNative.getNativeMinDate(datePicker);
        TKUnit.assert(actualValue.getTime() === expectedValue.getTime(), "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testYearFromNativeToLocal() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 1981;
        datePickerTestsNative.setNativeYear(datePicker, expectedValue);
        var actualValue = datePicker.year;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testMonthFromNativeToLocal() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];

        //Use July as it has 31 days
        var expectedValue = 7; 
        datePickerTestsNative.setNativeMonth(datePicker, expectedValue);
        var actualValue = datePicker.month;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testYearMonthDayFromNativeToLocal() {
    var testYear = 2000;
    var testMonth = 3;
    var testDay = 24;

    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        datePickerTestsNative.setNativeDate(datePicker, testYear, testMonth, testDay);
        assertDate(datePicker, testYear, testMonth, testDay);
    });
}

export function testDayFromNativeToLocal() {
    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        var expectedValue = 20;
        datePickerTestsNative.setNativeDay(datePicker, expectedValue);
        var actualValue = datePicker.day;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export function testSetYearMonthDay_BeforeLoaded() {
    var testYear = 2000;
    var testMonth = 3;
    var testDay = 24;

    helper.buildUIAndRunTest(_createDatePicker(testYear, testMonth, testDay), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];

        TKUnit.assertEqual(datePicker.year, testYear, "datePicker.year");
        TKUnit.assertEqual(datePicker.month, testMonth, "datePicker.month");
        TKUnit.assertEqual(datePicker.day, testDay, "datePicker.day");

        TKUnit.assertEqual(datePickerTestsNative.getNativeYear(datePicker), testYear, "Native datePicker.year");
        TKUnit.assertEqual(datePickerTestsNative.getNativeMonth(datePicker), testMonth, "Native datePicker.month");
        TKUnit.assertEqual(datePickerTestsNative.getNativeDay(datePicker), testDay, "Native datePicker.day");
    });
}

export function testSetYearMonthDay_AfterLoaded() {
    var testYear = 2000;
    var testMonth = 3;
    var testDay = 24;

    helper.buildUIAndRunTest(_createDatePicker(), function (views: Array<viewModule.View>) {
        var datePicker = <datePickerModule.DatePicker>views[0];
        datePicker.year = testYear;
        datePicker.month = testMonth;
        datePicker.day = testDay;        

        assertDate(datePicker, testYear, testMonth, testDay);
    });
}

function assertDate(datePicker: datePickerModule.DatePicker, expectedYear: number, expectedMonth: number, expectedDay: number) {
    TKUnit.assertEqual(datePicker.year, expectedYear, "datePicker.year");
    TKUnit.assertEqual(datePicker.month, expectedMonth, "datePicker.month");
    TKUnit.assertEqual(datePicker.day, expectedDay, "datePicker.day");

    TKUnit.assertEqual(datePickerTestsNative.getNativeYear(datePicker), expectedYear, "Native datePicker.year");
    TKUnit.assertEqual(datePickerTestsNative.getNativeMonth(datePicker), expectedMonth, "Native datePicker.month");
    TKUnit.assertEqual(datePickerTestsNative.getNativeDay(datePicker), expectedDay, "Native datePicker.day");
}

//export function testWTF() {
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