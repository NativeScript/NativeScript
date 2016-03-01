import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import segmentedBarTestsNative = require("./segmented-bar-tests-native");
import bindable = require("ui/core/bindable");
import observable = require("data/observable");
import color = require("color");

// <snippet module="ui/segmented-bar" title="SegmentedBar">
// # SegmentedBar

// Using a SegmentedBar requires the "ui/segmented-bar" module.
// ``` JavaScript
import segmentedBarModule = require("ui/segmented-bar");
// ```
// </snippet>

function _createSegmentedBar(): segmentedBarModule.SegmentedBar {
    // <snippet module="ui/segmented-bar" title="SegmentedBar">
    // ## Creating a SegmentedBar
    // ``` JavaScript
    var segmentedBar = new segmentedBarModule.SegmentedBar();
    // ```
    // ``` XML
    // <SegmentedBar>
    //   <SegmentedBar.items>
    //     <SegmentedBarItem title="Item 1" />
    //     <SegmentedBarItem title="Item 2" />
    //     <SegmentedBarItem title="Item 3" />
    //   </SegmentedBar.items>
    // </SegmentedBar>
    // ```
    // </snippet>
    segmentedBar.id = "SegmentedBar";
    return segmentedBar;
}

function _createItems(count: number): Array<segmentedBarModule.SegmentedBarItem> {
    var items = new Array<segmentedBarModule.SegmentedBarItem>();
    for (var i = 0; i < count; i++) {
        items.push(new segmentedBarModule.SegmentedBarItem({ title: i + "" }));
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

export var testWhenItemsAreBoundTheTextColorIsPreserved = function () {
    helper.buildUIAndRunTest(_createSegmentedBar(), function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
        segmentedBar.color = new color.Color("red");

        var model = new observable.Observable();
        model.set("items", [{ title: "One" }, { title: "Two" }, { title: "Three" }]);
        var options: bindable.BindingOptions = {
            sourceProperty: "items",
            targetProperty: "items"
        }

        segmentedBar.bind(options, model);

        TKUnit.assert(segmentedBarTestsNative.checkNativeItemsTextColor(segmentedBar), "Items text color not preserved" + "; Expected: " + segmentedBar.color);
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
        // ### Creating segmentedBar.items
        // It is important that an items array gets created and filled with
        // items first and then assigned to the segmented bar.
        // ``` JavaScript
        var items = [];
        var item1 = new segmentedBarModule.SegmentedBarItem();
        item1.title = "Item1";
        items.push(item1);
        var item2 = new segmentedBarModule.SegmentedBarItem();
        item2.title = "Item2";
        items.push(item2);
        var item3 = new segmentedBarModule.SegmentedBarItem();
        item3.title = "Item3";
        items.push(item3);
        segmentedBar.items = items;
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

export var testSelectedIndexChangedIsReisedCorrectlyIfSelectedIndexIsSet = function () {
    var oldIndex;
    var newIndex;
    var segmentedBar = _createSegmentedBar();

    segmentedBar.on(segmentedBarModule.SegmentedBar.selectedIndexChangedEvent, (args : segmentedBarModule.SelectedIndexChangedEventData) => {
        oldIndex = args.oldIndex;
        newIndex = args.newIndex;
    });

    segmentedBar.items = _createItems(10);
    
    helper.buildUIAndRunTest(segmentedBar, function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];

        segmentedBar.selectedIndex = 6;
        TKUnit.assertEqual(oldIndex, 0);
        TKUnit.assertEqual(newIndex, 6);

        segmentedBar.selectedIndex = 3;
        TKUnit.assertEqual(oldIndex, 6);
        TKUnit.assertEqual(newIndex, 3);

        segmentedBar.selectedIndex = 9;
        TKUnit.assertEqual(oldIndex, 3);
        TKUnit.assertEqual(newIndex, 9);
    });
}

export var testSelectedIndexChangedIsReisedCorrectlyIfSelectedIndexIsSetNative = function () {
    var oldIndex;
    var newIndex;
    var segmentedBar = _createSegmentedBar();

    segmentedBar.on(segmentedBarModule.SegmentedBar.selectedIndexChangedEvent, (args: segmentedBarModule.SelectedIndexChangedEventData) => {
        oldIndex = args.oldIndex;
        newIndex = args.newIndex;
    });

    segmentedBar.items = _createItems(10);

    helper.buildUIAndRunTest(segmentedBar, function (views: Array<viewModule.View>) {
        var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];

        segmentedBarTestsNative.setNativeSelectedIndex(segmentedBar, 6);
        TKUnit.assertEqual(oldIndex, 0);
        TKUnit.assertEqual(newIndex, 6);

        segmentedBarTestsNative.setNativeSelectedIndex(segmentedBar, 3);
        TKUnit.assertEqual(oldIndex, 6);
        TKUnit.assertEqual(newIndex, 3);

        segmentedBarTestsNative.setNativeSelectedIndex(segmentedBar, 9);
        TKUnit.assertEqual(oldIndex, 3);
        TKUnit.assertEqual(newIndex, 9);
    });
}
