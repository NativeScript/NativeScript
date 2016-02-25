import testModule = require("../../ui-test");
import TKUnit = require("../../TKUnit");
import app = require("application");
import observable = require("data/observable");
import types = require("utils/types");
import platform = require("platform");
import utils = require("utils/utils");
import { Label } from "ui/label";

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
//``` XML
// <Page>
//   {%raw%}<ListView items="{{ myItems }}" />{%endraw%}
// </Page>
//```

// ### Attaching event handler for the ListView itemTap event.
//``` XML
// <Page>
//   {%raw%}<ListView items="{{ myItems }}" itemTap="listViewItemTap" />{%endraw%}
// </Page>
//```
//``` JavaScript
// function listViewItemTap(args) {
//   var itemIndex = args.index;
// }
// exports.listViewItemTap = listViewItemTap;
//```

// ### Attaching event handler for the ListView loadMoreItems event.
//``` XML
// <Page>
//  {%raw%}<ListView items="{{ myItems }}" loadMoreItems="listViewLoadMoreItems" />{%endraw%}
// </Page>
//```
//``` JavaScript
// function listViewLoadMoreItems(args) {
//   // Expand your collection bound to the ListView with more items here!
// }
// exports.listViewLoadMoreItems = listViewLoadMoreItems;
//```

// ### Define the ListView itemTemplate property.
//``` XML
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
var MANY_ITEMS = new Array<number>(100);
for (var i = 0; i < 100; i++) {
    MANY_ITEMS.push(i);
}

export class ListViewTest extends testModule.UITest<listViewModule.ListView> {

    public create(): listViewModule.ListView {
        return new listViewModule.ListView();
    }

    public test_default_TNS_values() {
        // <snippet module="ui/list-view" title="list-view">
        // ### Creating a ListView
        // ``` JavaScript
        var listView = new listViewModule.ListView();
        // ```
        // </snippet>

        TKUnit.assertEqual(listView.isScrolling, false, "Default listView.isScrolling");
        TKUnit.assert(types.isUndefined(listView.items), "Default listView.items should be undefined");
    }

    public test_set_items_to_array_loads_all_items(done) {
        var listView = this.testView;

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
            if (args.index === (colors.length - 1)) {
                try {
                    if (app.android) {
                        TKUnit.assert(listView.android instanceof android.widget.ListView, "android property is android.widget.ListView");
                    }
                    else if (app.ios) {
                        TKUnit.assert(listView.ios instanceof UITableView, "ios property is UITableView");
                    }

                    TKUnit.assert(indexes[0], "itemLoading not called for index 0");
                    TKUnit.assert(indexes[1], "itemLoading not called for index 1");
                    TKUnit.assert(indexes[2], "itemLoading not called for index 2");
                    done(null);
                }
                catch (e) {
                    done(e);
                }
            }
            //</hide>
        });
        // ```
        // </snippet>
    }

    public test_set_native_item_exposed() {
        let listView = this.testView;

        let indexes = {};
        let colors = ["red", "green", "blue"];
        listView.items = colors;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (platform.device.os === platform.platformNames.ios) {
                indexes[args.index] = args.ios;
            } else if (platform.device.os === platform.platformNames.android) {
                indexes[args.index] = args.android;
            }
        });

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);

        for (var item in indexes) {
            if (platform.device.os === platform.platformNames.ios) {
                TKUnit.assert(indexes[item] instanceof UITableViewCell, "itemLoading not called for index " + item);
            } else if (platform.device.os === platform.platformNames.android) {
                TKUnit.assert(indexes[item] instanceof android.view.ViewGroup, "itemLoading not called for index " + item);
            }
        }
    }

    public test_cell_selection_ios() {
        if (platform.device.os === platform.platformNames.ios) {
            let listView = this.testView;

            let colors = ["red", "green", "blue"];
            listView.items = colors;

            TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);

            var index = 1;
            this.performNativeItemTap(listView, index);
            var uiTableView = <UITableView>listView.ios;
            var cellIndexPath = NSIndexPath.indexPathForItemInSection(index, 0);
            var cell = uiTableView.cellForRowAtIndexPath(cellIndexPath);
            uiTableView.selectRowAtIndexPathAnimatedScrollPosition(cellIndexPath, false, 0);

            TKUnit.assertTrue(cell.selected, "cell is selected");
        }
    }

    public test_set_items_to_array_creates_native_views() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);
        listView.items = FEW_ITEMS;

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");
    }

    public test_refresh_after_adding_items_to_array_loads_new_items() {

        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        var colors = ["red", "green", "blue"];
        listView.items = colors;
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), colors.length, "Native views count.");

        // <snippet module="ui/list-view" title="list-view">
        // > Note, that changing the array after the list view is shown will not update the UI.
        // You can force-update the UI using the refresh() method.
        // ``` JavaScript
        colors.push("yellow");
        //// Manually trigger the update so that the new color is shown.
        listView.refresh();
        // ```
        // </snippet>
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), colors.length, "Native views count.");
    }

    public test_refresh_reloads_all_items() {
        let listView = this.testView;
        let indexes = {};
        let completed = false;
        listView.items = FEW_ITEMS;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (!args.view) {
                args.view = new labelModule.Label();
            }
            (<labelModule.Label>args.view).text = "item " + args.index;

            indexes[args.index] = indexes[args.index] ? indexes[args.index] + 1 : 1;
            completed = args.index === (listView.items.length - 1);
        });

        // iOS7 needs to know the size of the cell before it is generated so we first measure them using fake cell
        // then we generate the real cells. This cause itemLoading to be called twice per index.
        let expected = (platform.device.os === platform.platformNames.ios && utils.ios.MajorVersion === 7) ? 2 : 1;
        TKUnit.waitUntilReady(() => { return completed; }, ASYNC);
        TKUnit.assertEqual(indexes[0], expected, "itemLoading called more than once");
        TKUnit.assertEqual(indexes[1], expected, "itemLoading called more than once");
        TKUnit.assertEqual(indexes[2], expected, "itemLoading called more than once");

        completed = false;
        listView.refresh();

        // again calling refresh will generate itemLoading twice per item.
        expected += expected;
        TKUnit.waitUntilReady(() => { return completed; }, ASYNC);
        TKUnit.assertEqual(indexes[0], expected, "itemLoading not called for index 0");
        TKUnit.assertEqual(indexes[1], expected, "itemLoading not called for index 1");
        TKUnit.assertEqual(indexes[2], expected, "itemLoading not called for index 2");
    }

    public test_set_itmes_to_null_clears_native_items() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        listView.items = FEW_ITEMS;
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");

        listView.items = null;
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === 0; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 0, "Native views count.");
    }

    public test_set_itmes_to_undefiend_clears_native_items() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        listView.items = FEW_ITEMS;
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");

        listView.items = undefined;
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === 0; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 0, "Native views count.");
    }

    public test_set_itmes_to_different_source_loads_new_items() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        listView.items = [1, 2, 3];
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "Native views count.");

        listView.items = ["a", "b", "c", "d"];
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 4, "Native views count.");
    }

    public test_set_items_to_observable_array_loads_all_items() {
        var listView = this.testView;

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

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assert(indexes[0], "itemLoading not called for index 0");
        TKUnit.assert(indexes[1], "itemLoading not called for index 1");
        TKUnit.assert(indexes[2], "itemLoading not called for index 2");
    }

    public test_add_to_observable_array_refreshes_the_listview() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        listView.items = colors;

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "getNativeViewCount");

        // <snippet module="ui/list-view" title="list-view">
        // > When using ObservableArray the list view will be automatically updated when items are added or removed form the array.
        // ``` JavaScript
        colors.push("yellow");
        //// The ListView will be updated automatically.
        // ```
        // </snippet>
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 4, "getNativeViewCount");
    }

    public test_remove_from_observable_array_refreshes_the_listview() {
        var listView = this.testView;
        var data = new observableArray.ObservableArray([1, 2, 3]);

        listView.items = data;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "getNativeViewCount");

        data.pop();
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 2, "getNativeViewCount");
    }

    public test_splice_observable_array_refreshes_the_listview() {
        var listView = this.testView;
        var data = new observableArray.ObservableArray(["a", "b", "c"]);

        listView.items = data;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "getNativeViewCount");

        // Remove the first 2 elements and add 
        data.splice(0, 2, "d", "e", "f");
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 4, "getNativeViewCount");
    }

    public test_nativeTap_is_raised() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);
        listView.items = FEW_ITEMS;

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
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        this.performNativeItemTap(listView, 1);

        TKUnit.assert(nativeTapRaised, "itemTap not raised.");
        TKUnit.assertEqual(itemIndex, 1, "tappedItemIndex");
    }

    public test_loadMoreItems_raised_when_showing_few_items() {
        var listView = this.testView;

        var loadMoreItemsCount = 0;
        listView.items = FEW_ITEMS;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);
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
        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        TKUnit.assertEqual(loadMoreItemsCount, 1, "loadMoreItemsCount");
    }

    public test_loadMoreItems_not_raised_when_showing_many_items() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        var loadMoreItemsCount = 0;
        listView.items = MANY_ITEMS;
        listView.on(listViewModule.ListView.loadMoreItemsEvent, function (data: observable.EventData) {
            loadMoreItemsCount++;
        });

        // We can't use waitUntilReady because we don't know what to wait for.
        if (platform.device.os === platform.platformNames.android) {
            this.waitUntilTestElementLayoutIsValid();
        }
        else {
            TKUnit.wait(ASYNC);
        }

        TKUnit.assertEqual(loadMoreItemsCount, 0, "loadMoreItemsCount");
    }

    public test_loadMoreItems_is_raised_when_scroll_to_last_item() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        var loadMoreItemsCount = 0;
        listView.items = MANY_ITEMS;
        listView.on(listViewModule.ListView.loadMoreItemsEvent, function (data: observable.EventData) {
            loadMoreItemsCount++;
        });

        listView.scrollToIndex(MANY_ITEMS.length - 1);

        // We can't use waitUntilReady because we don't know what to wait for.
        if (platform.device.os === platform.platformNames.android) {
            this.waitUntilTestElementLayoutIsValid();
        }
        else {
            TKUnit.wait(ASYNC);
        }

        TKUnit.assert(loadMoreItemsCount > 0, "loadMoreItemsCount");
    }

    public test_usingAppLevelConvertersInListViewItems() {
        var listView = this.testView;

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

        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ date, date | dateConverter('DD.MM.YYYY') }}\" />";
        listView.items = data;

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        var nativeElementText = this.getTextFromNativeElementAt(listView, 0);

        TKUnit.assertEqual(nativeElementText, "07.03.2020", "native element text");
    }

    public test_BindingListViewToASimpleArray() {
        var listView = this.testView;

        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value }}\" />";
        listView.items = [1, 2, 3];

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);

        var firstNativeElementText = this.getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = this.getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = this.getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, "1", "first element text");
        TKUnit.assertEqual(secondNativeElementText, "2", "second element text");
        TKUnit.assertEqual(thirdNativeElementText, "3", "third element text");
    }

    public test_ItemTemplateFactoryFunction() {
        var listView = this.testView;

        listView.itemTemplate = () => {
            var label = new Label();
            label.id = "testLabel";
            label.bind({ sourceProperty: "$value", targetProperty: "text", twoWay: false });
            return label;
        }
        listView.items = [1, 2, 3];

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);

        var firstNativeElementText = this.getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = this.getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = this.getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, "1", "first element text");
        TKUnit.assertEqual(secondNativeElementText, "2", "second element text");
        TKUnit.assertEqual(thirdNativeElementText, "3", "third element text");
    }

    public test_BindingListViewToASimpleArrayWithExpression() {
        var listView = this.testView;

        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value, $value + ' some static text' }}\" />";
        listView.items = [1, 2, 3];

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);

        var firstNativeElementText = this.getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = this.getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = this.getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, "1 some static text", "first element text");
        TKUnit.assertEqual(secondNativeElementText, "2 some static text", "second element text");
        TKUnit.assertEqual(thirdNativeElementText, "3 some static text", "third element text");
    }

    public test_bindingToParentObject() {
        var listView = this.testView;
        var expectedValue = "parentTestValue";

        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listViewModel.set("parentTestProp", expectedValue);
        listView.bindingContext = listViewModel;
        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $parents[ListView].parentTestProp }}\" />";

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);

        var firstNativeElementText = this.getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = this.getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = this.getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, expectedValue, "first element text");
        TKUnit.assertEqual(secondNativeElementText, expectedValue, "second element text");
        TKUnit.assertEqual(thirdNativeElementText, expectedValue, "third element text");
    }

    public test_bindingToParentObjectWithSpacesInIndexer() {
        var listView = this.testView;
        var expectedValue = "parentTestValue";

        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listViewModel.set("parentTestProp", expectedValue);
        listView.bindingContext = listViewModel;
        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $parents[ ListView ].parentTestProp }}\" />";

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);
        var firstNativeElementText = this.getTextFromNativeElementAt(listView, 0);
        var secondNativeElementText = this.getTextFromNativeElementAt(listView, 1);
        var thirdNativeElementText = this.getTextFromNativeElementAt(listView, 2);

        TKUnit.assertEqual(firstNativeElementText, expectedValue, "first element text");
        TKUnit.assertEqual(secondNativeElementText, expectedValue, "second element text");
        TKUnit.assertEqual(thirdNativeElementText, expectedValue, "third element text");
    }

    public test_ConverterIsCalledJustOnce_onAddingItemsToListView() {
        var listView = this.testView;
        var converterCalledCounter = 0;

        var testConverter = function (value) {
            converterCalledCounter++;
            return value;
        }

        app.resources["testConverter"] = testConverter;

        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listView.bindingContext = listViewModel;

        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value, $value | testConverter }}\" />";

        TKUnit.waitUntilReady(() => { return this.getNativeViewCount(listView) === listView.items.length; }, ASYNC);

        if (utils.ios && utils.ios.MajorVersion < 8) {
            TKUnit.assertEqual(converterCalledCounter, listViewModel.get("items").length * 2, "Converter should be called once for every item.");
        }
        else {
            TKUnit.assertEqual(converterCalledCounter, listViewModel.get("items").length, "Converter should be called once for every item.");
        }
    }

    public test_no_memory_leak_when_items_is_regular_array() {
        let weakRef = new WeakRef<listViewModule.ListView>(this.testView);
        weakRef.get().items = FEW_ITEMS;
        this.waitUntilTestElementIsLoaded();
        TKUnit.assertTrue(weakRef.get().isLoaded, "ListView should be loaded here");
        this.assertNoMemoryLeak(weakRef);
    }

    public test_no_memory_leak_when_items_is_observable_array() {
        // Keep the reference to the observable array to test the weakEventListener 
        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);

        let weakRef = new WeakRef<listViewModule.ListView>(this.testView);
        weakRef.get().items = colors;
        this.waitUntilTestElementIsLoaded();
        TKUnit.assertTrue(weakRef.get().isLoaded, "ListView should be loaded here");
        this.assertNoMemoryLeak(weakRef);
    }

    //private test_view_in_itemLoading_is_not_collected_prematurely() {
        //let weakRef: WeakRef<labelModule.Label>;

        //let handler = function (args: listViewModule.ItemEventData) {
            //let lbl = new labelModule.Label();
            //lbl.text = args.index.toString();
            //weakRef = new WeakRef(lbl);
            //args.view = lbl;
            //let listView: listViewModule.ListView = <listViewModule.ListView>args.object;
            //listView.off("itemLoading", handler);
        //};

        //this.testView.on("itemLoading", handler);
        //this.testView.items = [1];
        //TKUnit.waitUntilReady(() => { return this.getNativeViewCount(this.testView) === this.testView.items.length; }, ASYNC);

        //if (platform.device.os === platform.platformNames.ios) {
            //// Could cause GC on the next call.
            //// NOTE: Don't replace this with forceGC();
            //new ArrayBuffer(4 * 1024 * 1024);
        //}
        //utils.GC();

        //TKUnit.assert(weakRef.get(), weakRef.get() + " died prematurely!");
    //}

    private assertNoMemoryLeak(weakRef: WeakRef<listViewModule.ListView>) {
        this.tearDown();
        TKUnit.waitUntilReady(() => {
            if (platform.device.os === platform.platformNames.ios) {
                /* tslint:disable:no-unused-expression */
                // Could cause GC on the next call.
                // NOTE: Don't replace this with forceGC();
                new ArrayBuffer(4 * 1024 * 1024);
            }
            utils.GC();
            return !weakRef.get();
        });

        TKUnit.assert(!weakRef.get(), weakRef.get() + " leaked!");
    }

    private loadViewWithItemNumber(args: listViewModule.ItemEventData) {
        if (!args.view) {
            args.view = new labelModule.Label();
        }
        (<labelModule.Label>args.view).text = "item " + args.index;
    }

    private getTextFromNativeElementAt(listView: listViewModule.ListView, index: number): string {
        if (listView.android) {
            var nativeElement = listView.android.getChildAt(index);
            if (nativeElement instanceof android.view.ViewGroup) {
                return (<android.widget.TextView>((<any>nativeElement).getChildAt(0))).getText() + "";
            }
            return (<android.widget.TextView>nativeElement).getText() + "";
        }
        else if (listView.ios) {
            if (types.isFunction(listView.ios.visibleCells)) {
                return listView.ios.visibleCells()[index].contentView.subviews[0].text + "";
            }
            else {
                return listView.ios.visibleCells[index].contentView.subviews[0].text + "";
            }
        }
    }

    private getNativeViewCount(listView: listViewModule.ListView): number {
        if (listView.android) {
            return listView.android.getChildCount();
        }
        else if (listView.ios) {
            if (types.isFunction(listView.ios.visibleCells)) {
                return listView.ios.visibleCells().count;
            }
            else {
                return (<any>listView.ios.visibleCells).count;
            }
        }
        else {
            throw new Error("Cannot get native view count");
        }
    }

    private performNativeItemTap(listView: listViewModule.ListView, index: number): void {
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

    //public test_LoadedUnloaded() {
    //    var listView = this.testView;
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

}

export function createTestCase(): ListViewTest {
    return new ListViewTest();
}
