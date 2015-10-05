import TKUnit = require("../../TKUnit");
import testRunner = require("../../testRunner");
import app = require("application");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import observable = require("data/observable");
import types = require("utils/types");
import platform = require("platform");
import utils = require("utils/utils");

// <snippet module="ui/list-view" title="list-view">
// # ListView
// Using a ListView requires the ListView module.
// ``` JavaScript
import listViewModule = require("ui/list-view");
// ```
// Other modules which will be used in the code samples in this article:
// ``` JavaScript
import observableArray = require("data/observable-array");
import labelModule = require("ui/label");
// ```

// ### Binding the ListView items property to collection in the view-model.
//```XML
// <Page>
//   {%raw%}<ListView items="{{ myItems }}" />{%endraw%}
// </Page>
//```

// ### Attaching event handler for the ListView itemTap event.
//```XML
// <Page>
//   {%raw%}<ListView items="{{ myItems }}" itemTap="listViewItemTap" />{%endraw%}
// </Page>
//```
//```JS
// function listViewItemTap(args) {
//   var itemIndex = args.index;
// }
// exports.listViewItemTap = listViewItemTap;
//```

// ### Attaching event handler for the ListView loadMoreItems event.
//```XML
// <Page>
//  {%raw%}<ListView items="{{ myItems }}" loadMoreItems="listViewLoadMoreItems" />{%endraw%}
// </Page>
//```
//```JS
// function listViewLoadMoreItems(args) {
//   // Expand your collection bound to the ListView with more items here!
// }
// exports.listViewLoadMoreItems = listViewLoadMoreItems;
//```

// ### Define the ListView itemTemplate property.
//```XML
// <Page>
//  {%raw%}<ListView items="{{ myItems }}">
//     <ListView.itemTemplate>
//        <Label text="{{ title || 'Downloading...' }}" textWrap="true" class="title" />
//     </ListView.itemTemplate>
//  </ListView>{%endraw%}
// </Page>
//```

// </snippet>

var ASYNC = 0.2;
var FEW_ITEMS = [0, 1, 2];
var MANY_ITEMS = [];
for (var i = 0; i < 100; i++) {
    MANY_ITEMS[i] = i;
}

export function test_default_TNS_values() {
    // <snippet module="ui/list-view" title="list-view">
    // ### Creating a ListView
    // ``` JavaScript
    var listView = new listViewModule.ListView();
    // ```
    // </snippet>

    function testAction(views: Array<viewModule.View>) {
        TKUnit.assertEqual(listView.isScrolling, false, "Default listView.isScrolling");
        TKUnit.assert(types.isUndefined(listView.items), "Default listView.items should be undefined");

        if (app.android) {
            TKUnit.assert(listView.android instanceof android.widget.ListView, "android property is android.widget.ListView");
        }
        else if (app.ios) {
            TKUnit.assert(listView.ios instanceof UITableView, "ios property is UITableView");
        }

    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_set_items_to_array_loads_all_items() {
    var listView = new listViewModule.ListView();

    function testAction(views: Array<viewModule.View>) {
        var indexes = {};
        // <snippet module="ui/list-view" title="list-view">
        // ### Using ListView with Array
        // The itemLoading event is used to create the UI for each item that is shown in the ListView.
        // ``` JavaScript
        var colors = ["red", "green", "blue"];
        listView.items = colors;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (!args.view) {
                //// Create label if it is not already created.
                args.view = new labelModule.Label();
            }
            (<labelModule.Label>args.view).text = colors[args.index];

            //<hide>
            indexes[args.index] = true;
            //</hide>
        });
        // ```
        // </snippet>

        TKUnit.wait(ASYNC);
        TKUnit.assert(indexes[0], "itemLoading not called for index 0");
        TKUnit.assert(indexes[1], "itemLoading not called for index 1");
        TKUnit.assert(indexes[2], "itemLoading not called for index 2");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_set_native_item_exposed() {
    var listView = new listViewModule.ListView();

    function testAction(views: Array<viewModule.View>) {
        var indexes = {};
        var colors = ["red", "green", "blue"];
        listView.items = colors;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (platform.device.os === platform.platformNames.ios) {
                indexes[args.index] = args.ios;
            } else if (platform.device.os === platform.platformNames.android) {
                indexes[args.index] = args.android;
            }
        });

        TKUnit.wait(ASYNC);
        for (var item in indexes) {
            if (platform.device.os === platform.platformNames.ios) {
                TKUnit.assert(indexes[item] instanceof UITableViewCell, "itemLoading not called for index " + item);
            } else if (platform.device.os === platform.platformNames.android) {
                TKUnit.assert(indexes[item] instanceof android.view.ViewGroup, "itemLoading not called for index " + item);
            }
        }
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_set_items_to_array_creates_native_views() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        listView.items = FEW_ITEMS;

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_refresh_after_adding_items_to_array_loads_new_items() {

    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        var colors = ["red", "green", "blue"];
        listView.items = colors;

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), colors.length, "Native views count.");
        // <snippet module="ui/list-view" title="list-view">
        // > Note, that changing the array after the list view is shown will not update the UI.
        // You can force-update the UI using the refresh() method.
        // ``` JavaScript
        colors.push("yellow");
        //// Manually trigger the update so that the new color is shown.
        listView.refresh();
        // ```
        // </snippet>
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), colors.length, "Native views count.");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_refresh_reloads_all_items() {
    var listView = new listViewModule.ListView();

    function testAction(views: Array<viewModule.View>) {
        var indexes = {};
        var testStarted = false;
        listView.items = FEW_ITEMS;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (!args.view) {
                args.view = new labelModule.Label();
            }
            (<labelModule.Label>args.view).text = "item " + args.index;

            if (testStarted) {
                indexes[args.index] = true;
            }
        });

        TKUnit.wait(ASYNC);
        testStarted = true;
        listView.refresh();
        TKUnit.wait(ASYNC);

        TKUnit.assert(indexes[0], "itemLoading not called for index 0");
        TKUnit.assert(indexes[1], "itemLoading not called for index 1");
        TKUnit.assert(indexes[2], "itemLoading not called for index 2");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_set_itmes_to_null_clears_native_items() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        listView.items = FEW_ITEMS;
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");

        listView.items = null;
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 0, "Native views count.");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_set_itmes_to_undefiend_clears_native_items() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        listView.items = FEW_ITEMS;
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");

        listView.items = undefined;
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 0, "Native views count.");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_set_itmes_to_different_source_loads_new_items() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        listView.items = [1, 2, 3];
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 3, "Native views count.");

        listView.items = ["a", "b", "c", "d"];
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 4, "Native views count.");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_set_items_to_observable_array_loads_all_items() {
    var listView = new listViewModule.ListView();

    function testAction(views: Array<viewModule.View>) {
        var indexes = {};
        // <snippet module="ui/list-view" title="list-view">
        // ### Using ListView with ObservableArray
        // ``` JavaScript
        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        listView.items = colors;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (!args.view) {
                //// Create label if it is not already created.
                args.view = new labelModule.Label();
            }
            (<labelModule.Label>args.view).text = colors.getItem(args.index);

            indexes[args.index] = true;
        });
        // ```
        // </snippet>

        TKUnit.wait(ASYNC);
        TKUnit.assert(indexes[0], "itemLoading not called for index 0");
        TKUnit.assert(indexes[1], "itemLoading not called for index 1");
        TKUnit.assert(indexes[2], "itemLoading not called for index 2");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_add_to_observable_array_refreshes_the_listview() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        listView.items = colors;

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 3, "getNativeViewCount");

        // <snippet module="ui/list-view" title="list-view">
        // > When using ObservableArray the list view will be automatically updated when items are added or removed form the array.
        // ``` JavaScript
        colors.push("yellow");
        //// The ListView will be updated automatically.
        // ```
        // </snippet>
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 4, "getNativeViewCount");

    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_remove_from_observable_array_refreshes_the_listview() {
    var listView = new listViewModule.ListView();
    var data = new observableArray.ObservableArray([1, 2, 3]);

    function testAction(views: Array<viewModule.View>) {
        listView.items = data;
        listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 3, "getNativeViewCount");

        data.pop();
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 2, "getNativeViewCount");

    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_splice_observable_array_refreshes_the_listview() {
    var listView = new listViewModule.ListView();
    var data = new observableArray.ObservableArray(["a", "b", "c"]);

    function testAction(views: Array<viewModule.View>) {
        listView.items = data;
        listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 3, "getNativeViewCount");

        // Remove the first 2 elements and add 
        data.splice(0, 2, "d", "e", "f");
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(getNativeViewCount(listView), 4, "getNativeViewCount");

    };

    helper.buildUIAndRunTest(listView, testAction);
}
export function test_nativeTap_is_raised() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);
    listView.items = FEW_ITEMS;

    function testAction(views: Array<viewModule.View>) {
        var nativeTapRaised = false;
        var itemIndex = -1;
        /* tslint:disable:no-unused-variable */
        // <snippet module="ui/list-view" title="list-view">
        // ## Responding to other events
        // ### ItemTap event
        // The event will be raise when an item inside the ListView is tapped.
        // ``` JavaScript
        listView.on(listViewModule.ListView.itemTapEvent, function (args: listViewModule.ItemEventData) {
            var tappedItemIndex = args.index;
            var tappedItemView = args.view;
            //// Do someting
            //<hide>
            nativeTapRaised = true;
            itemIndex = args.index;
            //</hide>
        });
        // ```
        // </snippet>
        /* tslint:enable:no-unused-variable */
        TKUnit.wait(ASYNC);
        performNativeItemTap(listView, 1);

        TKUnit.assert(nativeTapRaised, "itemTap not raised.");
        TKUnit.assertEqual(itemIndex, 1, "tappedItemIndex");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_loadMoreItems_raised_when_showing_few_items() {
    var listView = new listViewModule.ListView();

    function testAction(views: Array<viewModule.View>) {
        var loadMoreItemsCount = 0;
        listView.items = FEW_ITEMS;
        listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);
        // <snippet module="ui/list-view" title="list-view">
        // ### LoadMoreItems event
        // The event will be raised when the ListView is scrolled so that the last item is visible.
        // This even is intended to be used to add additional data in the ListView.
        // ``` JavaScript
        listView.on(listViewModule.ListView.loadMoreItemsEvent, function (data: observable.EventData) {
            //// Do something.
            //<hide>
            loadMoreItemsCount++;
            //</hide>
        });
        // ```
        // </snippet>
        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(loadMoreItemsCount, 1, "loadMoreItemsCount");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_loadMoreItems_not_raised_when_showing_many_items() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        var loadMoreItemsCount = 0;
        listView.items = MANY_ITEMS;
        listView.on(listViewModule.ListView.loadMoreItemsEvent, function (data: observable.EventData) {
            loadMoreItemsCount++;
        });

        TKUnit.wait(ASYNC);
        TKUnit.assertEqual(loadMoreItemsCount, 0, "loadMoreItemsCount");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_loadMoreItems_is_raised_when_scroll_to_last_item() {
    var listView = new listViewModule.ListView();
    listView.on(listViewModule.ListView.itemLoadingEvent, loadViewWithItemNumber);

    function testAction(views: Array<viewModule.View>) {
        var loadMoreItemsCount = 0;
        listView.items = MANY_ITEMS;
        listView.on(listViewModule.ListView.loadMoreItemsEvent, function (data: observable.EventData) {
            loadMoreItemsCount++;
        });

        listView.scrollToIndex(MANY_ITEMS.length - 1);

        TKUnit.wait(ASYNC);
        TKUnit.assert(loadMoreItemsCount > 0, "loadMoreItemsCount");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_usingAppLevelConvertersInListViewItems() {
    var listView = new listViewModule.ListView();

    var dateConverter = function (value, format) {
        var result = format;
        var day = value.getDate();
        result = result.replace("DD", day < 10 ? "0" + day : day);
        var month = value.getMonth() + 1;
        result = result.replace("MM", month < 10 ? "0" + month : month);
        result = result.replace("YYYY", value.getFullYear());
        return result;
    };

    app.resources["dateConverter"] = dateConverter;

    var data = new observableArray.ObservableArray();
    data.push({ date: new Date(2020, 2, 7) });

    function testAction(views: Array<viewModule.View>) {
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ date, date | dateConverter('DD.MM.YYYY') }}\" />";
        listView.items = data;

        TKUnit.wait(ASYNC);
        var nativeElementText = getTextFromNativeElementAt(listView, 0);

        TKUnit.assertEqual(nativeElementText, "07.03.2020", "native element text");
    };

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_BindingListViewToASimpleArray() {
    var listView = new listViewModule.ListView();

    function testAction(views: Array<viewModule.View>) {
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value }}\" />";
        listView.items = [1, 2, 3];

        TKUnit.wait(ASYNC);
        var firstNativeElementText = getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, "1", "first element text");
        TKUnit.assertEqual(secondNativeElementText, "2", "second element text");
        TKUnit.assertEqual(thirdNativeElementText, "3", "third element text");
    }

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_BindingListViewToASimpleArrayWithExpression() {
    var listView = new listViewModule.ListView();

    function testAction(views: Array<viewModule.View>) {
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value, $value + ' some static text' }}\" />";
        listView.items = [1, 2, 3];

        TKUnit.wait(ASYNC);
        var firstNativeElementText = getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, "1 some static text", "first element text");
        TKUnit.assertEqual(secondNativeElementText, "2 some static text", "second element text");
        TKUnit.assertEqual(thirdNativeElementText, "3 some static text", "third element text");
    }

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_bindingToParentObject() {
    var listView = new listViewModule.ListView();
    var expectedValue = "parentTestValue";

    function testAction(views: Array<viewModule.View>) {
        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listViewModel.set("parentTestProp", expectedValue);
        listView.bindingContext = listViewModel;
        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ sourceProperty = $parents[ListView].parentTestProp }}\" />";

        TKUnit.wait(ASYNC);
        var firstNativeElementText = getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, expectedValue, "first element text");
        TKUnit.assertEqual(secondNativeElementText, expectedValue, "second element text");
        TKUnit.assertEqual(thirdNativeElementText, expectedValue, "third element text");
    }

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_bindingToParentObjectWithSpacesInIndexer() {
    var listView = new listViewModule.ListView();
    var expectedValue = "parentTestValue";

    function testAction(views: Array<viewModule.View>) {
        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listViewModel.set("parentTestProp", expectedValue);
        listView.bindingContext = listViewModel;
        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ sourceProperty = $parents[ ListView ].parentTestProp }}\" />";

        TKUnit.wait(ASYNC);
        var firstNativeElementText = getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, expectedValue, "first element text");
        TKUnit.assertEqual(secondNativeElementText, expectedValue, "second element text");
        TKUnit.assertEqual(thirdNativeElementText, expectedValue, "third element text");
    }

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_ConverterIsCalledJustOnce_onAddingItemsToListView() {
    var listView = new listViewModule.ListView();
    var converterCalledCounter = 0;

    var testConverter = function (value) {
        converterCalledCounter++;
        return value;
    }

    app.resources["testConverter"] = testConverter;

    function testAction(views: Array<viewModule.View>) {
        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listView.bindingContext = listViewModel;

        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value, $value | testConverter }}\" />";

        TKUnit.wait(ASYNC);

        if (utils.ios && utils.ios.MajorVersion < 8) {
            TKUnit.assertEqual(converterCalledCounter, listViewModel.get("items").length * 2, "Converter should be called once for every item.");
        }
        else {
            TKUnit.assertEqual(converterCalledCounter, listViewModel.get("items").length, "Converter should be called once for every item.");
        }
    }

    helper.buildUIAndRunTest(listView, testAction);
}

export function test_no_memory_leak_when_items_is_regular_array() {
    if (utils.ios) {
        if (testRunner.isRunningOnEmulator() || utils.ios.MajorVersion > 8) {
            return;
        }
    }
    var createFunc = function (): listViewModule.ListView {
        var listView = new listViewModule.ListView();
        listView.items = FEW_ITEMS;
        return listView;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc, (list) => {
        TKUnit.assert(list.isLoaded, "ListView should be loaded here");
    });
}

export function test_no_memory_leak_when_items_is_observable_array() {
    if (utils.ios) {
        if (testRunner.isRunningOnEmulator() || utils.ios.MajorVersion > 8) {
            return;
        }
    }
    // Keep the reference to the observable array to test the weakEventListener 
    var colors = new observableArray.ObservableArray(["red", "green", "blue"]);

    var createFunc = function (): listViewModule.ListView {
        var listView = new listViewModule.ListView();
        listView.items = colors;
        return listView;
    };

    helper.buildUIWithWeakRefAndInteract(createFunc, (list) => {
        TKUnit.assert(list.isLoaded, "ListView should be loaded here");
    });
}

function loadViewWithItemNumber(args: listViewModule.ItemEventData) {
    if (!args.view) {
        args.view = new labelModule.Label();
    }
    (<labelModule.Label>args.view).text = "item " + args.index;
}

function getTextFromNativeElementAt(listView: listViewModule.ListView, index: number): string {
    if (listView.android) {
        var nativeElement = listView.android.getChildAt(index);
        if (nativeElement instanceof android.view.ViewGroup) {
            return (<android.widget.TextView>((<any>nativeElement).getChildAt(0))).getText() + "";
        }
        return (<android.widget.TextView>nativeElement).getText() + "";
    }
    else if (listView.ios) {
        if (utils.ios.MajorVersion <= 8) {
            return listView.ios.visibleCells()[index].contentView.subviews[0].text + "";
        }
        else if (utils.ios.MajorVersion > 8) {
            return listView.ios.visibleCells[index].contentView.subviews[0].text + "";
        }
    }
}

function getNativeViewCount(listView: listViewModule.ListView): number {
    if (listView.android) {
        return listView.android.getChildCount();
    }
    else if (listView.ios) {
        if (utils.ios.MajorVersion <= 8) {
            return listView.ios.visibleCells().count;
        }
        else if (utils.ios.MajorVersion > 8) {
            return (<any>listView.ios.visibleCells).count;
        }
    }
    else {
        throw new Error("Cannot get native view count");
    }
}

function performNativeItemTap(listView: listViewModule.ListView, index: number): void {
    if (listView.android) {
        listView.android.performItemClick(listView.android.getChildAt(index), index, listView.android.getAdapter().getItemId(index));
    }
    else if (listView.ios) {
        // Calling selectRowAtIndexPathAnimatedScrollPosition will not tiger [Will|Did]SelectRowAtIndexPath callbacks.
        listView.ios.delegate.tableViewWillSelectRowAtIndexPath(listView.ios, NSIndexPath.indexPathForItemInSection(index, 0));
    }
    else {
        throw new Error("Cannot perform native item tap");
    }
}

//export function test_LoadedUnloaded() {
//    var listView = new listViewModule.ListView();
//    var vm = {
//        loadedCount: 0,
//        unloadedCount: 0,
//        onViewLoaded: function onViewLoaded(args) {
//            this.loadedCount++;
//            console.log(args.object._domId + " LOADED");
//        },
//        onViewUnloaded: function onViewUnloaded(args) {
//            this.unloadedCount++;
//            console.log(args.object._domId + " UNLOADED");
//        }
//    };
//    listView.itemTemplate = "<Label text=\"{{ $value }}\" loaded=\"{{ onViewLoaded }}\" unloaded=\"{{ onViewUnloaded }}\"/>";
//    listView.bindingContext = vm;

//    var count = 10;
//    var modifier = listView.ios ? 1 : 0; // iOS has one fake measure cell that raises loaded.
//    var generate = function (count: number): observableArray.ObservableArray<string>  {
//        var items = new observableArray.ObservableArray<string>();
//        for (var i = 0; i < count; i++) {
//            items.push("Item " + i);
//        }
//        return items;
//    }

//    function testAction(views: Array<viewModule.View>) {
//        listView.items = generate(count);
//        TKUnit.wait(ASYNC);
//        frame.topmost().navigate("pages/navigation/pageB");
//        TKUnit.wait(ASYNC);
//        frame.topmost().goBack();
//        TKUnit.assertEqual(vm.loadedCount, count + modifier, "Loaded Count");
//        TKUnit.assertEqual(vm.unloadedCount, count, "Unloaded Count");
//    }

//    helper.buildUIAndRunTest(listView, testAction);
//}
