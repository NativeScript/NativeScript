import TKUnit = require("../../TKUnit");
import app = require("application");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import stackLayoutModule = require("ui/layouts/stack-layout");
import wrapLayoutModule = require("ui/layouts/wrap-layout");
import layoutBaseModule = require("ui/layouts/layout-base");
import fs = require("file-system");
import pageModule = require("ui/page");
import gestureModule = require("ui/gestures");
import { Label } from "ui/label";

// >> article-require-repeater-module
import repeaterModule = require("ui/repeater");
// << article-require-repeater-module

// >> article-require-modules-repeater
import observableArray = require("data/observable-array");
import labelModule = require("ui/label");
// << article-require-modules-repeater

var ASYNC = 0.2;
var FEW_ITEMS = [0, 1, 2];
var MANY_ITEMS = [];
for (var i = 0; i < 100; i++) {
    MANY_ITEMS[i] = i;
}

export function test_set_items_to_array_loads_all_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        // >> article-repeater-with-array
        var colors = ["red", "green", "blue"];
        repeater.items = colors;
        // << article-repeater-with-array

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);

        TKUnit.assert(getChildAtText(repeater, 0) === "red", "Item not created for index 0");
        TKUnit.assert(getChildAtText(repeater, 1) === "green", "Item not created for index 1");
        TKUnit.assert(getChildAtText(repeater, 2) === "blue", "Item not created for index 2");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_items_to_array_creates_views() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.items = FEW_ITEMS;

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_refresh_after_adding_items_to_array_loads_new_items() {

    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        var colors = ["red", "green", "blue"];
        repeater.items = colors;

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), colors.length, "views count.");
        // >> artcle-array-push-element
        colors.push("yellow");
        // Manually trigger the update so that the new color is shown.
        repeater.refresh();
        // << artcle-array-push-element
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), colors.length, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_refresh_reloads_all_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        var testStarted = false;

        var itemsToBind = <Array<any>>FEW_ITEMS;

        repeater.items = itemsToBind;

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        testStarted = true;

        itemsToBind[0] = "red";
        itemsToBind[1] = "green";
        itemsToBind[2] = "blue";

        repeater.refresh();

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);

        TKUnit.assert(getChildAtText(repeater, 0) === "red", "Item not created for index 0");
        TKUnit.assert(getChildAtText(repeater, 1) === "green", "Item not created for index 1");
        TKUnit.assert(getChildAtText(repeater, 2) === "blue", "Item not created for index 2");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_null_clears_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.items = FEW_ITEMS;
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");

        repeater.items = null;
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 0, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itemsLayout_accepted() {
    // >> article-repeater-layout
    var repeater = new repeaterModule.Repeater();
    var stackLayout = new stackLayoutModule.StackLayout();
    stackLayout.orientation = "horizontal";
    repeater.itemsLayout = stackLayout;
    // << article-repeater-layout

    function testAction(views: Array<viewModule.View>) {

        repeater.items = FEW_ITEMS;
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assert((<stackLayoutModule.StackLayout>repeater.itemsLayout).orientation === "horizontal", "views count.");
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_undefiend_clears_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.items = FEW_ITEMS;
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");

        repeater.items = undefined;
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 0, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_different_source_loads_new_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.items = [1, 2, 3];
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "views count.");

        repeater.items = ["a", "b", "c", "d"];
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 4, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_items_to_observable_array_loads_all_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        // >> article-repeater-observablearray
        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        repeater.items = colors;
        // << article-repeater-observablearray

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assert(getChildAtText(repeater, 0) === "red", "Item not created for index 0");
        TKUnit.assert(getChildAtText(repeater, 1) === "green", "Item not created for index 1");
        TKUnit.assert(getChildAtText(repeater, 2) === "blue", "Item not created for index 2");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_add_to_observable_array_refreshes_the_Repeater() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        repeater.items = colors;

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "getChildrenCount");

        // >> article-push-to-observablearray
        colors.push("yellow");
        // The Repeater will be updated automatically.
        // << article-push-to-observablearray
        TKUnit.wait(ASYNC);
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 4, "getChildrenCount");

    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_remove_from_observable_array_refreshes_the_Repeater() {
    var repeater = new repeaterModule.Repeater();
    var data = new observableArray.ObservableArray([1, 2, 3]);

    function testAction(views: Array<viewModule.View>) {
        repeater.items = data;

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "getChildrenCount");

        data.pop();
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 2, "getChildrenCount");

    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_splice_observable_array_refreshes_the_Repeater() {
    var repeater = new repeaterModule.Repeater();
    var data = new observableArray.ObservableArray(["a", "b", "c"]);

    function testAction(views: Array<viewModule.View>) {
        repeater.items = data;

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "getChildrenCount");

        // Remove the first 2 elements and add 
        data.splice(0, 2, "d", "e", "f");
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 4, "getChildrenCount");

    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_usingAppLevelConvertersInRepeaterItems() {
    var repeater = new repeaterModule.Repeater();

    var dateConverter = function (value, format) {
        var result = format;
        var day = value.getDate();
        result = result.replace("DD", month < 10 ? "0" + day : day);
        var month = value.getMonth() + 1;
        result = result.replace("MM", month < 10 ? "0" + month : month);
        result = result.replace("YYYY", value.getFullYear());
        return result;
    };

    app.resources["dateConverter"] = dateConverter;

    var data = new observableArray.ObservableArray();

    data.push({ date: new Date() });

    function testAction(views: Array<viewModule.View>) {
        repeater.itemTemplate = "<Label id=\"testLabel\" text=\"{{ date, date | dateConverter('DD.MM.YYYY') }}\" />";
        repeater.items = data;

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);

        TKUnit.assertEqual(getChildAtText(repeater, 0), dateConverter(new Date(), "DD.MM.YYYY"), "element");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_BindingRepeaterToASimpleArray() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value }}\" />";
        repeater.items = [1, 2, 3];

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);

        TKUnit.assertEqual(getChildAtText(repeater, 0), "1", "first element text");
        TKUnit.assertEqual(getChildAtText(repeater, 1), "2", "second element text");
        TKUnit.assertEqual(getChildAtText(repeater, 2), "3", "third element text");
    }

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_ItemTemplateFactoryFunction() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.itemTemplate = () => {
            var label = new Label();
            label.id = "testLabel";
            label.bind({ sourceProperty: "$value", targetProperty: "text", twoWay: false });
            return label;
        }
        repeater.items = [1, 2, 3];

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);

        TKUnit.assertEqual(getChildAtText(repeater, 0), "1", "first element text");
        TKUnit.assertEqual(getChildAtText(repeater, 1), "2", "second element text");
        TKUnit.assertEqual(getChildAtText(repeater, 2), "3", "third element text");
    }

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_BindingRepeaterToASimpleArrayWithExpression() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value, $value + ' some static text' }}\" />";
        repeater.items = [1, 2, 3];

        TKUnit.waitUntilReady(() => repeater.isLayoutValid);

        TKUnit.assertEqual(getChildAtText(repeater, 0), "1 some static text", "first element text");
        TKUnit.assertEqual(getChildAtText(repeater, 1), "2 some static text", "second element text");
        TKUnit.assertEqual(getChildAtText(repeater, 2), "3 some static text", "third element text");
    }

    helper.buildUIAndRunTest(repeater, testAction);
}

export var test_RepeaterItemsGestureBindings = function () {
    var testFunc = function (page: pageModule.Page) {
        var repeater = <repeaterModule.Repeater>(page.getViewById("repeater"));
        var hasObservers = false;
        var eachChildCallback = function (childItem: viewModule.View) {
            if (childItem instanceof labelModule.Label) {
                var gestureObservers = childItem.getGestureObservers(gestureModule.GestureTypes.tap);
                hasObservers = gestureObservers ? gestureObservers.length > 0 : false;
            }
            else if (childItem instanceof layoutBaseModule.LayoutBase) {
                childItem._eachChildView(eachChildCallback);
            }
            return true;
        }

        repeater._eachChildView(eachChildCallback);

        TKUnit.assertEqual(hasObservers, true, "Every item should have tap observer!");
    }

    var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);
    helper.navigateToModuleAndRunTest(("." + moduleName + "/repeaterItems-bindingToGestures"), null, testFunc);
}

export var test_RepeaterItemsParentBindingsShouldWork = function () {
    var testFunc = function (page: pageModule.Page) {
        var repeater = <repeaterModule.Repeater>(page.getViewById("repeater"));
        var expectedText = page.bindingContext["parentViewProperty"];
        var testPass = false;
        var eachChildCallback = function (childItem: viewModule.View) {
            if (childItem instanceof labelModule.Label) {
                testPass = (<labelModule.Label>childItem).text === expectedText;
                if (testPass === false) {
                    return false;
                }
            }
            else if (childItem instanceof layoutBaseModule.LayoutBase) {
                childItem._eachChildView(eachChildCallback);
            }
            return true;
        }

        repeater._eachChildView(eachChildCallback);

        TKUnit.assertEqual(testPass, true, "Every item should have text bound to Page binding context!");
    }

    var moduleName = __dirname.substr(fs.knownFolders.currentApp().path.length);
    helper.navigateToModuleAndRunTest(("." + moduleName + "/repeaterItems-bindingToGestures"), null, testFunc);
}

export function test_ChildrenAreNotCreatedUntilTheRepeaterIsLoaded() {
    var repeater = new repeaterModule.Repeater();

    repeater.itemsLayout = new wrapLayoutModule.WrapLayout();
    TKUnit.assertEqual(getChildrenCount(repeater), 0, "Repeater should not create its children until loaded.");

    repeater.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value, $value + ' some static text' }}\" />";
    TKUnit.assertEqual(getChildrenCount(repeater), 0, "Repeater should not create its children until loaded.");

    repeater.items = [1, 2, 3];
    TKUnit.assertEqual(getChildrenCount(repeater), 0, "Repeater should not create its children until loaded.");

    function testAction(views: Array<viewModule.View>) {
        TKUnit.waitUntilReady(() => repeater.isLayoutValid);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "Repeater should have created its children when loaded.");
    }

    helper.buildUIAndRunTest(repeater, testAction);
}

/*
export function test_no_memory_leak_when_items_is_regular_array(done) {
    var createFunc = function (): repeaterModule.Repeater {
        var repeater = new repeaterModule.Repeater();
        repeater.items = FEW_ITEMS;
        return repeater;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc,(list) => {
        TKUnit.assert(list.isLoaded, "Repeater should be loaded here");
    }, done);
}

export function test_no_memory_leak_when_items_is_observable_array(done) {
    // Keep the reference to the observable array to test the weakEventListener 
    var colors = new observableArray.ObservableArray(["red", "green", "blue"]);

    var createFunc = function (): repeaterModule.Repeater {
        var repeater = new repeaterModule.Repeater();
        repeater.items = colors;
        return repeater;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc,(list) => {
        TKUnit.assert(list.isLoaded, "Repeater should be loaded here");
    }, done);
}
*/
function getChildrenCount(repeater: repeaterModule.Repeater): number {
    return repeater.itemsLayout.getChildrenCount();
}

function getChildAt(repeater: repeaterModule.Repeater, index: number): viewModule.View {
    return repeater.itemsLayout.getChildAt(index);
}

function getChildAtText(repeater: repeaterModule.Repeater, index: number): string {
    return (<labelModule.Label>getChildAt(repeater, index)).text + "";
}

