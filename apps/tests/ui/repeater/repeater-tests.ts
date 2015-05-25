import TKUnit = require("../../TKUnit");
import app = require("application");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import stackLayoutModule = require("ui/layouts/stack-layout");

// <snippet module="ui/repeater" title="repeater">
// # Repeater
// Using a Repeater requires the repeater module.
// ``` JavaScript
import repeaterModule = require("ui/repeater");
// ```
// Other modules which will be used in the code samples in this article:
// ``` JavaScript
import observableArray = require("data/observable-array");
import labelModule = require("ui/label");
// ```

// ### Binding the Repeater items property to collection in the view-model.
//```XML
// <Page>
//   {%raw%}<Repeater items="{{ myItems }}" />{%endraw%}
// </Page>
//```

// ### Define the Repeater itemTemplate property.
//```XML
// <Page>
//  {%raw%}<Repeater items="{{ myItems }}">
//     <Repeater.itemTemplate>
//        <Label text="{{ title || 'Downloading...' }}" textWrap="true" cssClass="title" />
//     </Repeater.itemTemplate>
//  </Repeater>{%endraw%}
// </Page>
//```

// ### Define the Repeater itemsLayout property. Default is <StackLayout orientation="vertical" />.
//```XML
// <Page>
//  {%raw%}<Repeater items="{{ myItems }}">
//     <Repeater.itemsLayout>
//        <StackLayout orientation="horizontal" />
//     </Repeater.itemsLayout>
//  </Repeater>{%endraw%}
// </Page>
//```

// </snippet>

var ASYNC = 0.2;
var FEW_ITEMS = [0, 1, 2];
var MANY_ITEMS = [];
for (var i = 0; i < 100; i++) {
    MANY_ITEMS[i] = i;
}

export function test_set_items_to_array_loads_all_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        // <snippet module="ui/repeater" title="repeater">
        // ### Using Repeater with Array
        // ``` JavaScript
        var colors = ["red", "green", "blue"];
        repeater.items = colors;
        // ```
        // </snippet>

        TKUnit.wait(ASYNC);

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

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_refresh_after_adding_items_to_array_loads_new_items() {

    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        var colors = ["red", "green", "blue"];
        repeater.items = colors;

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), colors.length, "views count.");
        // <snippet module="ui/repeater" title="repeater">
        // > Note, that changing the array after the repeater is shown will not update the UI.
        // You can force-update the UI using the refresh() method.
        // ``` JavaScript
        colors.push("yellow");
        //// Manually trigger the update so that the new color is shown.
        repeater.refresh();
        // ```
        // </snippet>
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

        TKUnit.wait(ASYNC);
        testStarted = true;

        itemsToBind[0] = "red";
        itemsToBind[1] = "green";
        itemsToBind[2] = "blue";

        repeater.refresh();

        TKUnit.wait(ASYNC);

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
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");

        repeater.items = null;
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 0, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmeLayout_accepted() {
    // <snippet module="ui/repeater" title="repeater">
    // ### Using Repeater with different layout.
    // ``` JavaScript
    var repeater = new repeaterModule.Repeater();
    var stackLayout = new stackLayoutModule.StackLayout();
    stackLayout.orientation = "horizontal";
    repeater.itemsLayout = stackLayout;
    // ```
    // </snippet>

    function testAction(views: Array<viewModule.View>) {

        repeater.items = FEW_ITEMS;
        TKUnit.wait(ASYNC);
        TKUnit.assert((<stackLayoutModule.StackLayout>repeater.itemsLayout).orientation === "horizontal", "views count.");
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_undefiend_clears_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.items = FEW_ITEMS;
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), FEW_ITEMS.length, "views count.");

        repeater.items = undefined;
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 0, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_itmes_to_different_source_loads_new_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.items = [1, 2, 3];
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "views count.");

        repeater.items = ["a", "b", "c", "d"];
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 4, "views count.");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_set_items_to_observable_array_loads_all_items() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        // <snippet module="ui/repeater" title="repeater">
        // ### Using Repeater with ObservableArray
        // ``` JavaScript
        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        repeater.items = colors;
        // ```
        // </snippet>

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

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "getChildrenCount");

        // <snippet module="ui/repeater" title="repeater">
        // > When using ObservableArray the repeater will be automatically updated when items are added or removed form the array.
        // ``` JavaScript
        colors.push("yellow");
        //// The Repeater will be updated automatically.
        // ```
        // </snippet>
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 4, "getChildrenCount");

    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_remove_from_observable_array_refreshes_the_Repeater() {
    var repeater = new repeaterModule.Repeater();
    var data = new observableArray.ObservableArray([1, 2, 3]);

    function testAction(views: Array<viewModule.View>) {
        repeater.items = data;

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "getChildrenCount");

        data.pop();
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 2, "getChildrenCount");

    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_splice_observable_array_refreshes_the_Repeater() {
    var repeater = new repeaterModule.Repeater();
    var data = new observableArray.ObservableArray(["a", "b", "c"]);

    function testAction(views: Array<viewModule.View>) {
        repeater.items = data;

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getChildrenCount(repeater), 3, "getChildrenCount");

        // Remove the first 2 elements and add 
        data.splice(0, 2, "d", "e", "f");
        TKUnit.wait(ASYNC);
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

        TKUnit.wait(ASYNC);

        TKUnit.assertEqual(getChildAtText(repeater, 0), dateConverter(new Date(), "DD.MM.YYYY"), "element");
    };

    helper.buildUIAndRunTest(repeater, testAction);
}

export function test_BindingRepeaterToASimpleArray() {
    var repeater = new repeaterModule.Repeater();

    function testAction(views: Array<viewModule.View>) {
        repeater.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value }}\" />";
        repeater.items = [1, 2, 3];

        TKUnit.wait(ASYNC);

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

        TKUnit.wait(ASYNC);

        TKUnit.assertEqual(getChildAtText(repeater, 0), "1 some static text", "first element text");
        TKUnit.assertEqual(getChildAtText(repeater, 1), "2 some static text", "second element text");
        TKUnit.assertEqual(getChildAtText(repeater, 2), "3 some static text", "third element text");
    }

    helper.buildUIAndRunTest(repeater, testAction);
}
/*
export function test_no_memory_leak_when_items_is_regular_array() {
    var createFunc = function (): repeaterModule.Repeater {
        var repeater = new repeaterModule.Repeater();
        repeater.items = FEW_ITEMS;
        return repeater;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc,(list) => {
        TKUnit.assert(list.isLoaded, "Repeater should be loaded here");
    });
}

export function test_no_memory_leak_when_items_is_observable_array() {
    // Keep the reference to the observable array to test the weakEventListener 
    var colors = new observableArray.ObservableArray(["red", "green", "blue"]);

    var createFunc = function (): repeaterModule.Repeater {
        var repeater = new repeaterModule.Repeater();
        repeater.items = colors;
        return repeater;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc,(list) => {
        TKUnit.assert(list.isLoaded, "Repeater should be loaded here");
    });
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

