import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import segmentedBarTestsNative = require("./segmented-bar-tests-native");

// <snippet module="ui/segmented-bar" title="SegmentedBar">
// # SegmentedBar

// Using a SegmentedBar requires the "ui/segmented-bar" module.
// ``` JavaScript
import segmentedBarModule = require("ui/segmented-bar");

function _createSegmentedBar(): segmentedBarModule.SegmentedBar {
    // <snippet module="ui/segmented-bar" title="SegmentedBar">
    // ## Creating a SegmentedBar
    // ``` JavaScript
    var segmentedBar = new segmentedBarModule.SegmentedBar();
    // ```
    // </snippet>
    segmentedBar.id = "SegmentedBar";
    return segmentedBar;
}

function _createItems(count: number): Array<segmentedBarModule.SegmentedBarItem> {
    var items = new Array<segmentedBarModule.SegmentedBarItem>();
    for (var i = 0; i < count; i++) {
        items.push({ title: i + "" });
    }
    return items;
}

export var testWhenSegmentedBarIsCreatedItemsAreUndefined = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        var expectedValue = undefined;
        var actualValue = segmentedBar.items;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenSegmentedBarIsCreatedSelectedIndexIsUndefined = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        var expectedValue = undefined;
        var actualValue = segmentedBar.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeItemsIsCreated = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.items = _createItems(10);
        var expectedValue = segmentedBar.items.length;
        var actualValue = segmentedBarTestsNative.getNativeItemsCount(segmentedBar);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenSettingItemsToEmptyArrayZeroNativeItemsAreCreated = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.items = [];
        var expectedValue = segmentedBar.items.length;
        var actualValue = segmentedBarTestsNative.getNativeItemsCount(segmentedBar);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        // <snippet module="ui/segmented-bar" title="SegmentedBar">
        // ### Binding segmentedBar.items
        // ``` JavaScript
        segmentedBar.items = _createItems(3);
        // ```
        // </snippet>
        var expectedValue = 0;
        var actualValue = segmentedBar.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.items = _createItems(10);
        // <snippet module="ui/segmented-bar" title="SegmentedBar">
        // ### Selecting an item programmatically
        // ``` JavaScript
        segmentedBar.selectedIndex = 9;
        // ```
        // </snippet>
        segmentedBar.items = [];
        var expectedValue = undefined;
        var actualValue = segmentedBar.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToUndefined = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.items = _createItems(10);
        segmentedBar.selectedIndex = 9;
        segmentedBar.items = undefined;
        var expectedValue = undefined;
        var actualValue = segmentedBar.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToNull = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.items = _createItems(10);
        segmentedBar.selectedIndex = 9;
        segmentedBar.items = null;
        var expectedValue = undefined;
        var actualValue = segmentedBar.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
    var segmentedBar = _createSegmentedBar();
    var expectedValue = 10;
    segmentedBar.items = _createItems(expectedValue);
    segmentedBar.selectedIndex = 9;
    helper.buildUIAndRunTest(segmentedBar, function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        var actualValue = segmentedBar.items.length;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
    var segmentedBar = _createSegmentedBar();
    segmentedBar.items = _createItems(10);
    var expectedValue = 9;
    segmentedBar.selectedIndex = expectedValue;
    helper.buildUIAndRunTest(segmentedBar, function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        var actualValue = segmentedBar.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSettingNegativeSelectedIndexShouldThrow = function () {
    var segmentedBar = _createSegmentedBar();
    helper.buildUIAndRunTest(segmentedBar, function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.items = _createItems(10);

        TKUnit.assertThrows(function () {
            segmentedBar.selectedIndex = -1;
        }, "Setting selectedIndex to a negative number should throw.");
    });
}

export var testSettingSelectedIndexLargerThanCountShouldThrow = function () {
    var segmentedBar = _createSegmentedBar();
    helper.buildUIAndRunTest(segmentedBar, function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.items = _createItems(10);
        TKUnit.assertThrows(function () {
            segmentedBar.selectedIndex = 10;
        }, "Setting selectedIndex to a larger number should throw.");
    });
}