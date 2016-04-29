import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import listPickerTestsNative = require("./list-picker-tests-native");
import application = require("application");

// >> article-require-module
import listPickerModule = require("ui/list-picker");
// << article-require-module

function _createListPicker(): listPickerModule.ListPicker {
    // >> article-create-listpicker
    var listPicker = new listPickerModule.ListPicker();
    // << article-create-listpicker
    listPicker.id = "ListPicker";
    return listPicker;
}

function _createItems(count: number): Array<number> {
    var items = new Array<number>();
    for (var i = 0; i < count; i++) {
        items.push(i);
    }
    return items;
}

export var testWhenlistPickerIsCreatedItemsAreUndefined = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        var expectedValue = undefined;
        var actualValue = listPicker.items;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenlistPickerIsCreatedSelectedIndexIsUndefined = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        var expectedValue = undefined;
        var actualValue = listPicker.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeItemsIsCreated = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = _createItems(10);
        var expectedValue = listPicker.items.length;
        var actualValue = listPickerTestsNative.getNativeItemsCount(listPicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenSettingItemsToEmptyArrayZeroNativeItemsAreCreated = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = [];
        var expectedValue = listPicker.items.length;
        var actualValue = listPickerTestsNative.getNativeItemsCount(listPicker);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        // >> article-binding-listpickeritems
        listPicker.items = [1, 2, 3];
        // << article-binding-listpickeritems
        var expectedValue = 0;
        var actualValue = listPicker.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = _createItems(10);
        // >> article-selecting-item
        listPicker.selectedIndex = 9;
        // << article-selecting-item
        listPicker.items = [];
        var expectedValue = undefined;
        var actualValue = listPicker.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToUndefined = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = _createItems(10);
        listPicker.selectedIndex = 9;
        listPicker.items = undefined;
        var expectedValue = undefined;
        var actualValue = listPicker.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToNull = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = _createItems(10);
        listPicker.selectedIndex = 9;
        listPicker.items = null;
        var expectedValue = undefined;
        var actualValue = listPicker.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
    var listPicker = _createListPicker();
    var expectedValue = 10;
    listPicker.items = _createItems(expectedValue);
    listPicker.selectedIndex = 9;
    helper.buildUIAndRunTest(listPicker, function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        var actualValue = listPicker.items.length;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
    var listPicker = _createListPicker();
    listPicker.items = _createItems(10);
    var expectedValue = 9;
    listPicker.selectedIndex = expectedValue;
    helper.buildUIAndRunTest(listPicker, function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        var actualValue = listPicker.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSettingNegativeSelectedIndexShouldThrow = function () {
    var listPicker = _createListPicker();
    helper.buildUIAndRunTest(listPicker, function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = _createItems(10);

        TKUnit.assertThrows(function () {
            listPicker.selectedIndex = -1;
        }, "Setting selectedIndex to a negative number should throw.");
    });
}

export var testSettingSelectedIndexLargerThanCountShouldThrow = function () {
    var listPicker = _createListPicker();
    helper.buildUIAndRunTest(listPicker, function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = _createItems(10);
        TKUnit.assertThrows(function () {
            listPicker.selectedIndex = 10;
        }, "Setting selectedIndex to a number larger than item count should throw.");
    });
}

export var testWhenSelectingAnItemNativelySelectedIndexIsUpdatedProperly = function () {
    let listPicker = _createListPicker();
    let mainPage = helper.getCurrentPage();
    listPicker.items = _createItems(2);
    mainPage.content = listPicker;

    let expectedValue = 1;
    listPickerTestsNative.selectNativeItem(listPicker, expectedValue);
    TKUnit.waitUntilReady(() => listPicker.selectedIndex === 1);

    let actualValue = listPicker.selectedIndex;
    TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
}

export var test_Android_MaxValueIsOneLessThanItemsCount = function () {
    if (!application.android) {
        return;
    }

    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = ["One", "Two", "Three"];
        var expectedValue = listPicker.items.length - 1;
        var actualValue = (<any>listPicker).android.getMaxValue();
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var test_Android_WhenItemsAreEmptyNativeControlDoesNotShowZero = function () {
    if (!application.android) {
        return;
    }

    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        var expectedValue = " ";
        var actualValue = (<any>listPicker)._editText.getText().toString();
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var test_Android_WhenBoundToSingleElementArrayEditTextIsUpdatedProperly = function () {
    if (!application.android) {
        return;
    }

    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = ["One"];
        var expectedValue = "One";
        var actualValue = (<any>listPicker)._editText.getText().toString();
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var test_Android_WhenSelectedIndexChangesEditTextIsUpdatedProperly = function () {
    if (!application.android) {
        return;
    }

    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = ["One", "Two"];
        listPicker.selectedIndex = 1;
        var expectedValue = "Two";
        var actualValue = (<any>listPicker)._editText.getText().toString();
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}