import TKUnit = require("../../TKUnit");
import testModule = require("../../ui-test");
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

export class DatePickerTest extends testModule.UITest<datePickerModule.DatePicker> {
    public create() {
        let datePicker = new datePickerModule.DatePicker();
        datePicker.id = "DatePicker";
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
        let datePicker = new datePickerModule.DatePicker();
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
    }
    
    public test_set_color() {
        if (platform.device.os === platform.platformNames.ios) {
            this.testView.color = new color.Color("red");
            TKUnit.assertEqual(this.testView.color.ios.CGColor, this.testView.ios.valueForKey("textColor").CGColor, "datePicker.color");
        }
    }
    
    public test_WhenCreated_YearIsUndefined() {
        let actualValue = this.testView.year;
        let expectedValue = undefined;
        TKUnit.assertEqual(actualValue, expectedValue);
    }

    public test_WhenCreated_MonthIsUndefined() {
        let actualValue = this.testView.month;
        let expectedValue = undefined;
        TKUnit.assertEqual(actualValue, expectedValue);
    }

    public test_WhenCreated_DayIsUndefined() {
        let actualValue = this.testView.day;
        let expectedValue = undefined;
        TKUnit.assertEqual(actualValue, expectedValue);
    }

    public test_WhenCreated_DateIsUndefined() {
        let actualValue = this.testView.date;
        let expectedValue = undefined;
        TKUnit.assertEqual(actualValue, expectedValue);
    }

    public testYearFromLocalToNative() {
        let expectedValue = 1980;
        this.testView.year = expectedValue;
        let actualValue = datePickerTestsNative.getNativeYear(this.testView);
        TKUnit.assertEqual(actualValue, expectedValue);
    }

    public testMonthFromLocalToNative() {
        let expectedValue = 5;
        this.testView.month = expectedValue;
        let actualValue = datePickerTestsNative.getNativeMonth(this.testView);
        TKUnit.assertEqual(actualValue, expectedValue);
    }

    public testDayFromLocalToNative() {
        let expectedValue = 19;
        this.testView.day = expectedValue;
        let actualValue = datePickerTestsNative.getNativeDay(this.testView);
        TKUnit.assertEqual(actualValue, expectedValue);
    }
    
    public test_DateIsSetCorrectlyWhenDayIsSet() {
        let today = new Date();
        this.testView.year = today.getFullYear();
        this.testView.month = today.getMonth();
        let expectedValue = today.getDate() === 19 ? 18 : 19;
        this.testView.day = expectedValue;
        
        let expectedDate = new Date(today.getFullYear(), today.getMonth() - 1, expectedValue);
        TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), "Getting Day from date property failed.");
        TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), "Getting Month from date property failed.");
        TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), "Getting Year from date property failed.");
    }
    
    public test_DateIsSetCorrectlyWhenMonthIsSet() {
        let today = new Date();
        this.testView.year = today.getFullYear();
        this.testView.day = today.getDate();
        
        let expectedValue = today.getMonth() === 5 ? 4 : 5;
        this.testView.month = expectedValue;
        let expectedDate = new Date(today.getFullYear(), expectedValue - 1, today.getDate());
        
        TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), "Getting Day from date property failed.");
        TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), "Getting Month from date property failed.");
        TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), "Getting Year from date property failed.");
    }
    
    public test_DateIsSetCorrectlyWhenYearIsSet() {
        let current = new Date(2016, 3, 15);
        this.testView.month = current.getMonth();
        this.testView.day = current.getDate();
        
        let expectedValue = 1980;
        this.testView.year = expectedValue;
        let expectedDate = new Date(1980, current.getMonth() - 1, current.getDate());
        
        TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), "Getting Day from date property failed.");
        TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), "Getting Month from date property failed.");
        TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), "Getting Year from date property failed.");
    }
    
    public testMaxDateFromLocalToNative() {
        let expectedValue = new Date(1980, 1, 9);
        this.testView.maxDate = expectedValue;
        let actualValue = datePickerTestsNative.getNativeMaxDate(this.testView);
        TKUnit.assertEqual(actualValue.getTime(), expectedValue.getTime());
    }
    
    public testMinDateFromLocalToNative() {
        let expectedValue = new Date(1980, 1, 9);
        this.testView.minDate = expectedValue;
        let actualValue = datePickerTestsNative.getNativeMinDate(this.testView);
        TKUnit.assertEqual(actualValue.getTime(), expectedValue.getTime());
    }
    
    public testYearFromNativeToLocal() {
        let expectedValue = 1981;
        datePickerTestsNative.setNativeYear(this.testView, expectedValue);
        let actualValue = this.testView.year;
        TKUnit.assertEqual(actualValue, expectedValue);
    }
    
    public testMonthFromNativeToLocal() {
        //Use July as it has 31 days
        var expectedValue = 7;
        datePickerTestsNative.setNativeMonth(this.testView, expectedValue);
        var actualValue = this.testView.month;
        TKUnit.assertEqual(actualValue, expectedValue);
    }
    
    public testYearMonthDayFromNativeToLocal() {
        var testYear = 2000;
        var testMonth = 3;
        var testDay = 24;

        datePickerTestsNative.setNativeDate(this.testView, testYear, testMonth, testDay);
        assertDate(this.testView, testYear, testMonth, testDay);
    }
    
    public testDayFromNativeToLocal() {
        let expectedValue = 20;
        datePickerTestsNative.setNativeDay(this.testView, expectedValue);
        let actualValue = this.testView.day;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    }
    
    public test_DateFromNativeToLocalWithDay() {
        let today = new Date();
        let expectedValue = 20;
        
        datePickerTestsNative.setNativeDate(this.testView, today.getFullYear(), today.getMonth(), expectedValue);
        
        let expectedDate = new Date(today.getFullYear(), today.getMonth() - 1, expectedValue);
        TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), "Getting Day from date property failed.");
        TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), "Getting Month from date property failed.");
        TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), "Getting Year from date property failed.");
    }
    
    public test_DateFromNativeToLocalWithMonth() {
        let today = new Date();
        let expectedValue = 7;
        
        datePickerTestsNative.setNativeDate(this.testView, today.getFullYear(), expectedValue, today.getDate());
        
        let expectedDate = new Date(today.getFullYear(), expectedValue - 1, today.getDate());
        TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), "Getting Day from date property failed.");
        TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), "Getting Month from date property failed.");
        TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), "Getting Year from date property failed.");
    }
    
    public test_DateFromNativeToLocalWithYear() {
        let today = new Date();
            
        var expectedValue = 1981;
        datePickerTestsNative.setNativeDate(this.testView, expectedValue, today.getMonth(), today.getDate());
        
        let expectedDate = new Date(expectedValue, today.getMonth() - 1, today.getDate());
        TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), "Getting Day from date property failed.");
        TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), "Getting Month from date property failed.");
        TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), "Getting Year from date property failed.");
    }
    
    public test_DateFromNativeToLocalWithAll() {
        var testYear = 2000;
        var testMonth = 3;
        var testDay = 24;
        
        datePickerTestsNative.setNativeDate(this.testView, testYear, testMonth, testDay);
        let expectedDate = new Date(testYear, testMonth - 1, testDay);
        TKUnit.assertEqual(this.testView.date.getDate(), expectedDate.getDate(), "Getting Day from date property failed.");
        TKUnit.assertEqual(this.testView.date.getMonth(), expectedDate.getMonth(), "Getting Month from date property failed.");
        TKUnit.assertEqual(this.testView.date.getFullYear(), expectedDate.getFullYear(), "Getting Year from date property failed.");
    }
    
    public testSetYearMonthDay_BeforeLoaded() {
        var testYear = 2000;
        var testMonth = 3;
        var testDay = 24;
        
        this.setUpDatePicker(testYear, testMonth, testDay);

        TKUnit.assertEqual(this.testView.year, testYear, "datePicker.year");
        TKUnit.assertEqual(this.testView.month, testMonth, "datePicker.month");
        TKUnit.assertEqual(this.testView.day, testDay, "datePicker.day");

        TKUnit.assertEqual(datePickerTestsNative.getNativeYear(this.testView), testYear, "Native datePicker.year");
        TKUnit.assertEqual(datePickerTestsNative.getNativeMonth(this.testView), testMonth, "Native datePicker.month");
        TKUnit.assertEqual(datePickerTestsNative.getNativeDay(this.testView), testDay, "Native datePicker.day");
    }
    
    public testSetYearMonthDay_AfterLoaded() {
        var testYear = 2000;
        var testMonth = 3;
        var testDay = 24;
        
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
