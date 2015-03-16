import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import listPickerTestsNative = require("./list-picker-tests-native");
import pageModule = require("ui/page");

// <snippet module="ui/list-picker" title="ListPicker">
// # ListPicker

// Using a ListPicker requires the "ui/list-picker" module.
// ``` JavaScript
import listPickerModule = require("ui/list-picker");

function _createListPicker(): listPickerModule.ListPicker {
    // <snippet module="ui/list-picker" title="ListPicker">
    // ## Creating a ListPicker
    // ``` JavaScript
    var listPicker = new listPickerModule.ListPicker();
    // ```
    // </snippet>
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
        // <snippet module="ui/list-picker" title="listPicker">
        // ### Binding listPicker.items
        // ``` JavaScript
        listPicker.items = [1, 2, 3];
        // ```
        // </snippet>
        var expectedValue = 0;
        var actualValue = listPicker.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
    helper.buildUIAndRunTest(_createListPicker(), function (views: Array<viewModule.View>) {
        var listPicker = <listPickerModule.ListPicker>views[0];
        listPicker.items = _createItems(10);
        // <snippet module="ui/list-picker" title="listPicker">
        // ### Selecting an item programmatically
        // ``` JavaScript
        listPicker.selectedIndex = 9;
        // ```
        // </snippet>
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
        }, "Setting selectedIndex to a negative number should throw.");
    });
}

export var testWhenSelectingAnItemNativelySelectedIndexIsUpdatedProperly = function () {
    var listPicker: listPickerModule.ListPicker;
    var mainPage: pageModule.Page;
    var pageFactory = function (): pageModule.Page {
        listPicker = _createListPicker();
        listPicker.items = _createItems(2);
        mainPage = new pageModule.Page();
        mainPage.content = listPicker;
        return mainPage;
    };

    helper.navigate(pageFactory);

    var expectedValue = 1;
    listPickerTestsNative.selectNativeItem(listPicker, expectedValue);
    TKUnit.wait(helper.ASYNC);

    var actualValue = listPicker.selectedIndex;
    try {
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    }
    finally {
        helper.goBack();
    }
}