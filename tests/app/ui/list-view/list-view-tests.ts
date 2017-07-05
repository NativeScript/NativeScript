import * as testModule from "../../ui-test";
import * as TKUnit from "../../TKUnit";
import * as app from "tns-core-modules/application";
import * as observable from "tns-core-modules/data/observable";
import * as types from "tns-core-modules/utils/types";
import * as platform from "tns-core-modules/platform";
import * as utils from "tns-core-modules/utils/utils";
import { Label } from "tns-core-modules/ui/label";
import * as helper from "../helper";
import { Page } from "tns-core-modules/ui/page";
import { View, KeyedTemplate, isIOS } from "tns-core-modules/ui/core/view";

// >> article-require-listview-module
import * as listViewModule from "tns-core-modules/ui/list-view";
// << article-require-listview-module

// >> article-require-modules-listview
import * as observableArray from "tns-core-modules/data/observable-array";
import * as labelModule from "tns-core-modules/ui/label";
// << article-require-modules-listview

// >> article-item-tap
function listViewItemTap(args) {
    var itemIndex = args.index;
    // >> (hide)
    console.log(itemIndex);
    // << (hide)
}
exports.listViewItemTap = listViewItemTap;
// << article-item-tap

// >> article-load-items
function listViewLoadMoreItems(args) {
    // Expand your collection bound to the ListView with more items here!
}
// << article-load-items
listViewLoadMoreItems("test");
// function loaded(args) {
//   args.object.bindingContext = { items: [1,2,3,4,5] };
// }
// exports.loaded = loaded;

var FEW_ITEMS = [0, 1, 2];
var MANY_ITEMS = new Array<number>(100);
for (var i = 0; i < 100; i++) {
    MANY_ITEMS.push(i);
}

export class ListViewTest extends testModule.UITest<listViewModule.ListView> {

    public create(): listViewModule.ListView {
        return new listViewModule.ListView();
    }

    public test_recycling() {
        helper.nativeView_recycling_test(() => new listViewModule.ListView());
    }

    public test_default_TNS_values() {
        // >> article-create-listview
        var listView = new listViewModule.ListView();
        // << article-create-listview

        TKUnit.assert(types.isUndefined(listView.items), "Default listView.items should be undefined");
    }

    public test_set_items_to_array_loads_all_items(done) {
        var listView = this.testView;

        var indexes = {};
        // >> article-listview-array
        var colors = ["red", "green", "blue"];
        listView.items = colors;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (!args.view) {
                // Create label if it is not already created.
                args.view = new labelModule.Label();
            }
            (<labelModule.Label>args.view).text = colors[args.index];

            // >> (hide)
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
            // << (hide)
        });
        // << article-listview-array
    }

    public test_set_native_item_exposed() {
        const listView = this.testView;

        const indexes = [];
        const colors = ["red", "green", "blue"];
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            indexes[args.index] = isIOS ? args.ios : args.android;
        });
        listView.items = colors;
        TKUnit.waitUntilReady(() => indexes.length === 3);

        for (var item in indexes) {
            if (isIOS) {
                TKUnit.assertTrue(indexes[item] instanceof UITableViewCell, "itemLoading not called for index " + item);
            } else if (platform.device.os === platform.platformNames.android) {
                TKUnit.assertTrue(indexes[item] instanceof android.view.ViewGroup, "itemLoading not called for index " + item);
            }
        }
    }

    public test_cell_selection_ios() {
        if (isIOS) {
            const listView = this.testView;

            const indexes = [];
            const colors = ["red", "green", "blue"];
            listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
                indexes[args.index] = isIOS ? args.ios : args.android;
            });
            listView.items = colors;
            TKUnit.waitUntilReady(() => indexes.length === 3);

            const index = 1;
            this.performNativeItemTap(listView, index);
            const uiTableView = <UITableView>listView.ios;
            const cellIndexPath = NSIndexPath.indexPathForItemInSection(index, 0);
            const cell = uiTableView.cellForRowAtIndexPath(cellIndexPath);
            uiTableView.selectRowAtIndexPathAnimatedScrollPosition(cellIndexPath, false, 0);

            TKUnit.assertTrue(cell.selected, "cell is selected");
        }
    }

    public test_set_items_to_array_creates_native_views() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);
        listView.items = FEW_ITEMS;
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");
    }

    public test_refresh_after_adding_items_to_array_loads_new_items() {

        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        var colors = ["red", "green", "blue"];
        listView.items = colors;
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), colors.length, "Native views count.");

        // >> article-change-refresh-listview
        colors.push("yellow");
        // Manually trigger the update so that the new color is shown.
        listView.refresh();
        // << article-change-refresh-listview
        this.waitUntilListViewReady();
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
        TKUnit.waitUntilReady(() => completed);
        TKUnit.assertEqual(indexes[0], expected, "itemLoading called more than once");
        TKUnit.assertEqual(indexes[1], expected, "itemLoading called more than once");
        TKUnit.assertEqual(indexes[2], expected, "itemLoading called more than once");

        completed = false;
        listView.refresh();

        // again calling refresh will generate itemLoading twice per item.
        expected += expected;
        TKUnit.waitUntilReady(() => completed);
        TKUnit.assertEqual(indexes[0], expected, "itemLoading not called for index 0");
        TKUnit.assertEqual(indexes[1], expected, "itemLoading not called for index 1");
        TKUnit.assertEqual(indexes[2], expected, "itemLoading not called for index 2");
    }

    public test_set_itmes_to_null_clears_native_items() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        listView.items = FEW_ITEMS;
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");

        listView.items = null;
        TKUnit.waitUntilReady(() => this.getNativeViewCount(listView) === 0);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 0, "Native views count.");
    }

    public test_set_itmes_to_undefiend_clears_native_items() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        listView.items = FEW_ITEMS;
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), FEW_ITEMS.length, "Native views count.");

        listView.items = undefined;
        TKUnit.waitUntilReady(() => this.getNativeViewCount(listView) === 0);
        TKUnit.assertEqual(this.getNativeViewCount(listView), 0, "Native views count.");
    }

    public test_set_itmes_to_different_source_loads_new_items() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        listView.items = [1, 2, 3];
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "Native views count.");

        listView.items = ["a", "b", "c", "d"];
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 4, "Native views count.");
    }

    public test_set_items_to_observable_array_loads_all_items() {
        var listView = this.testView;

        var indexes = {};
        // >> article-listview-observablearray
        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        listView.items = colors;
        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            if (!args.view) {
                // Create label if it is not already created.
                args.view = new labelModule.Label();
            }
            (<labelModule.Label>args.view).text = colors.getItem(args.index);

            indexes[args.index] = true;
        });
        // << article-listview-observablearray

        this.waitUntilListViewReady();
        TKUnit.assert(indexes[0], "itemLoading not called for index 0");
        TKUnit.assert(indexes[1], "itemLoading not called for index 1");
        TKUnit.assert(indexes[2], "itemLoading not called for index 2");
    }

    public test_add_to_observable_array_refreshes_the_listview() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        var colors = new observableArray.ObservableArray(["red", "green", "blue"]);
        listView.items = colors;

        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "getNativeViewCount");

        // >> article-push-in-observablearray
        colors.push("yellow");
        // The ListView will be updated automatically.
        // << article-push-in-observablearray
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 4, "getNativeViewCount");
    }

    public test_remove_from_observable_array_refreshes_the_listview() {
        var listView = this.testView;
        var data = new observableArray.ObservableArray([1, 2, 3]);

        listView.items = data;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "getNativeViewCount");

        data.pop();
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 2, "getNativeViewCount");
    }

    public test_splice_observable_array_refreshes_the_listview() {
        var listView = this.testView;
        var data = new observableArray.ObservableArray(["a", "b", "c"]);

        listView.items = data;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);

        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 3, "getNativeViewCount");

        // Remove the first 2 elements and add 
        data.splice(0, 2, "d", "e", "f");
        this.waitUntilListViewReady();
        TKUnit.assertEqual(this.getNativeViewCount(listView), 4, "getNativeViewCount");
    }

    public test_nativeTap_is_raised() {
        var listView = this.testView;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);
        listView.items = FEW_ITEMS;

        var nativeTapRaised = false;
        var itemIndex = -1;
        /* tslint:disable:no-unused-variable */
        // >> article-itemtap-event
        listView.on(listViewModule.ListView.itemTapEvent, function (args: listViewModule.ItemEventData) {
            var tappedItemIndex = args.index;
            var tappedItemView = args.view;
            // Do someting
            // >> (hide)
            nativeTapRaised = true;
            itemIndex = args.index;
            // << (hide)
        });
        // << article-itemtap-event
        /* tslint:enable:no-unused-variable */
        this.waitUntilListViewReady();
        this.performNativeItemTap(listView, 1);

        TKUnit.assert(nativeTapRaised, "itemTap not raised.");
        TKUnit.assertEqual(itemIndex, 1, "tappedItemIndex");
    }

    public test_loadMoreItems_raised_when_showing_few_items() {
        var listView = this.testView;

        var loadMoreItemsCount = 0;
        listView.items = FEW_ITEMS;
        listView.on(listViewModule.ListView.itemLoadingEvent, this.loadViewWithItemNumber);
        // >> article-loadmoreitems-event
        listView.on(listViewModule.ListView.loadMoreItemsEvent, function (data: observable.EventData) {
            // Do something.
            // >> (hide)
            loadMoreItemsCount++;
            // << (hide)
        });
        // ```
        // << article-loadmoreitems-event
        this.waitUntilListViewReady();
        TKUnit.assertEqual(loadMoreItemsCount, 1, "loadMoreItemsCount");
    }

    public test_loadMoreItems_not_raised_when_showing_many_items() {
        if (platform.isIOS) {
            return;
        }
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
            TKUnit.wait(0.2);
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
            TKUnit.wait(0.2);
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

        app.getResources()["dateConverter"] = dateConverter;

        var data = new observableArray.ObservableArray();
        data.push({ date: new Date(2020, 2, 7) });

        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ date, date | dateConverter('DD.MM.YYYY') }}\" />";
        listView.items = data;

        this.waitUntilListViewReady();
        var nativeElementText = this.getTextFromNativeElementAt(listView, 0);

        TKUnit.assertEqual(nativeElementText, "07.03.2020", "native element text");
    }

    public test_BindingListViewToASimpleArray() {
        var listView = this.testView;

        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value }}\" />";
        listView.items = [1, 2, 3];

        this.waitUntilListViewReady();
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

        this.waitUntilListViewReady();

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

        this.waitUntilListViewReady();

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

        this.waitUntilListViewReady();

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

        this.waitUntilListViewReady();
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

        app.getResources()["testConverter"] = testConverter;

        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listView.bindingContext = listViewModel;

        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<Label id=\"testLabel\" text=\"{{ $value, $value | testConverter }}\" />";

        this.waitUntilListViewReady();

        if (utils.ios && utils.ios.MajorVersion < 8) {
            TKUnit.assertEqual(converterCalledCounter, listViewModel.get("items").length * 2, "Converter should be called once for every item.");
        }
        else {
            TKUnit.assertEqual(converterCalledCounter, listViewModel.get("items").length, "Converter should be called once for every item.");
        }
    }

    public test_RemovingChildViewsBeforeListView() {
        var listView = this.testView;
        var converterCalledCounter = 0;

        var testConverter = function (value) {
            converterCalledCounter++;
            return value;
        }

        app.getResources()["testConverter"] = testConverter;

        var listViewModel = new observable.Observable();
        listViewModel.set("items", [1, 2, 3]);
        listView.bindingContext = listViewModel;

        listView.bind({ sourceProperty: "items", targetProperty: "items" });
        listView.itemTemplate = "<StackLayout><Label id=\"testLabel\" text=\"{{ $value, $value | testConverter }}\" /></StackLayout>";

        this.waitUntilListViewReady();

        if (platform.isAndroid) {
            // simulates Angular way of removing views
            (<any>listView)._realizedItems.forEach((view, nativeView, map) => {
                //console.log("view: " + view);
                listView._removeView(view);
            });
            this.tearDown();
            // should not crash
            TKUnit.assertTrue(true);
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

    public test_call_refresh_when_items_is_simple_array_is_respcted_in_the_UI() {
        let source = [{ text: "0" }, { text: "1" }, { text: "2" }];
        let listView = this.testView;
        listView.itemTemplate = "<Label text='{{ text }}' />";
        listView.items = source;
        this.waitUntilListViewReady();

        TKUnit.assertEqual(this.getTextFromNativeElementAt(listView, 0), "0", "first text");
        TKUnit.assertEqual(this.getTextFromNativeElementAt(listView, 1), "1", "second text");
        TKUnit.assertEqual(this.getTextFromNativeElementAt(listView, 2), "2", "third text");

        source[0].text = "4";
        source[1] = { text: "5" };
        listView.refresh();

        TKUnit.waitUntilReady(() => this.getTextFromNativeElementAt(listView, 1) === "5");

        TKUnit.assertEqual(this.getTextFromNativeElementAt(listView, 0), "4", "first text after refresh");
        TKUnit.assertEqual(this.getTextFromNativeElementAt(listView, 1), "5", "second text after refresh");
        TKUnit.assertEqual(this.getTextFromNativeElementAt(listView, 2), "2", "third text after refresh");
    }

    public test_LoadedUnloaded() {
        const listView = this.testView;
        const count = 10;

        let items = new observableArray.ObservableArray<Item>();
        for (let i = 0; i < count; i++) {
            items.push({
                text: "Item " + i,
                age: i,
                loadedCount: 0,
                unloadedCount: 0,
                onViewLoaded: function onViewLoaded(args) {
                    this.loadedCount++;
                },
                onViewUnloaded: function onViewUnloaded(args) {
                    this.unloadedCount++;
                }
            });
        }

        listView.itemTemplate = "<Label text='{{ text }}' loaded='{{ onViewLoaded }}' unloaded='{{ onViewUnloaded }}'/>";
        listView.items = items;
        this.waitUntilListViewReady();

        helper.navigateWithHistory(() => new Page());
        for (let i = 0; i < count; i++) {
            TKUnit.assertEqual(items.getItem(i).loadedCount, 1, "Loaded Count");
            TKUnit.assertEqual(items.getItem(i).unloadedCount, 1, "Unloaded Count");
        }

        helper.goBack();

        for (let i = 0; i < count; i++) {
            TKUnit.assertEqual(items.getItem(i).loadedCount, 2, "Loaded Count");
            TKUnit.assertEqual(items.getItem(i).unloadedCount, 1, "Unloaded Count");
        }
    }

    public test_view_in_itemLoading_is_not_collected_prematurely() {
        let weakRef: WeakRef<Label>;

        let handler = function (args: listViewModule.ItemEventData) {
            let lbl = new Label();
            lbl.text = args.index.toString();
            weakRef = new WeakRef(lbl);
            args.view = lbl;
            let listView: listViewModule.ListView = <listViewModule.ListView>args.object;
            listView.off("itemLoading", handler);
        };

        this.testView.on("itemLoading", handler);
        this.testView.items = [1];
        this.waitUntilListViewReady();

        if (platform.device.os === platform.platformNames.ios) {
            //Could cause GC on the next call.
            //    NOTE: Don't replace this with forceGC();
            let array = new ArrayBuffer(4 * 1024 * 1024);
            if (!array) {
                ///
            };
        }

        utils.GC();
        TKUnit.assert(weakRef.get(), weakRef.get() + " died prematurely!");
    }

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

    private waitUntilListViewReady(): void {
        TKUnit.waitUntilReady(() => this.getNativeViewCount(this.testView) === this.testView.items.length);
    }

    // Multiple item templates tests
    public test_ItemTemplateSelector_WhenWrongTemplateKeyIsSpecified_TheDefaultTemplateIsUsed() {
        let listView = this.testView;
        listView.height = 200;

        listView.itemTemplate = "<Label text='default' minHeight='100' maxHeight='100'/>";
        listView.itemTemplates = this._itemTemplatesString;
        listView.itemTemplateSelector = "age % 2 === 0 ? 'wrong' : 'green'";
        listView.items = ListViewTest.generateItemsForMultipleTemplatesTests(2);
        TKUnit.wait(0.1);

        let firstNativeElementText = this.getTextFromNativeElementAt(listView, 0);

        TKUnit.assertEqual(firstNativeElementText, "default", "first element text");
    }

    public test_ItemTemplateSelector_IsCorrectlyParsedFromString() {
        let listView = this.testView;
        listView.itemTemplateSelector = "age % 2 === 0 ? 'red' : 'green'";
        let items = ListViewTest.generateItemsForMultipleTemplatesTests(2);
        let itemTemplateSelectorFunction = <any>listView.itemTemplateSelector;
        TKUnit.wait(0.1);

        let templateKey0 = itemTemplateSelectorFunction(items[0], 0, items);
        TKUnit.assertEqual(templateKey0, "red", "itemTemplateSelector result for first item");

        let templateKey1 = itemTemplateSelectorFunction(items[1], 1, items);
        TKUnit.assertEqual(templateKey1, "green", "itemTemplateSelector result for second item");
    }

    public test_ItemTemplateSelector_IsCorrectlyUsedAsAFunction() {
        let listView = this.testView;
        listView.itemTemplateSelector = selectItemTemplate;
        let items = ListViewTest.generateItemsForMultipleTemplatesTests(2);
        let itemTemplateSelectorFunction = <any>listView.itemTemplateSelector;
        TKUnit.wait(0.1);

        let templateKey0 = itemTemplateSelectorFunction(items[0], 0, items);
        TKUnit.assertEqual(templateKey0, "red", "itemTemplateSelector result for first item");

        let templateKey1 = itemTemplateSelectorFunction(items[1], 1, items);
        TKUnit.assertEqual(templateKey1, "green", "itemTemplateSelector result for second item");
    }

    public test_ItemTemplateSelector_ItemTemplatesAreCorrectlyParsedFromString() {
        let listView = this.testView;
        listView.itemTemplates = this._itemTemplatesString;

        let itemTemplatesArray = <any>listView.itemTemplates;

        TKUnit.assertEqual(itemTemplatesArray.length, 3, "itemTemplates array length");

        let template0 = <KeyedTemplate>itemTemplatesArray[0];
        TKUnit.assertEqual(template0.key, "red", "template0.key");
        TKUnit.assertEqual((<Label>template0.createView()).text, "red", "template0 created view text");

        let template1 = <KeyedTemplate>itemTemplatesArray[1];
        TKUnit.assertEqual(template1.key, "green", "template1.key");
        TKUnit.assertEqual((<Label>template1.createView()).text, "green", "template1 created view text");

        let template2 = <KeyedTemplate>itemTemplatesArray[2];
        TKUnit.assertEqual(template2.key, "blue", "template2.key");
        TKUnit.assertEqual((<Label>template2.createView()).text, "blue", "template2 created view text");
    }

    public test_ItemTemplateSelector_CorrectTemplateIsUsed() {
        let listView = this.testView;
        listView.height = 200;

        listView.itemTemplates = this._itemTemplatesString;
        listView.itemTemplateSelector = "age % 2 === 0 ? 'red' : 'green'";
        listView.items = ListViewTest.generateItemsForMultipleTemplatesTests(4);
        TKUnit.wait(0.1);

        let firstNativeElementText = this.getTextFromNativeElementAt(listView, 0);
        let secondNativeElementText = this.getTextFromNativeElementAt(listView, 1);

        TKUnit.assertEqual(firstNativeElementText, "red", "first element text");
        TKUnit.assertEqual(secondNativeElementText, "green", "second element text");
    }

    public test_ItemTemplateSelector_TestVirtualization() {
        let listView = this.testView;
        listView.height = 300;

        listView.itemTemplates = this._itemTemplatesString;
        listView.itemTemplateSelector = "age % 2 === 0 ? 'red' : (age % 3 === 0 ? 'blue' : 'green')";
        listView.items = ListViewTest.generateItemsForMultipleTemplatesTests(10);
        TKUnit.wait(0.01);

        // Forward
        listView.items.forEach((item, i, arr) => {
            listView.scrollToIndex(i);
            TKUnit.wait(0.01);
        });

        // Back
        const count = listView.items.length - 1;
        listView.items.forEach((item, i, arr) => {
            listView.scrollToIndex(count - i);
            TKUnit.wait(0.01);
        });

        if (listView.android) {
            //(<any>listView)._dumpRealizedTemplates();
            let realizedItems = <Map<android.view.View, View>>(<any>listView)._realizedItems;
            TKUnit.assertTrue(realizedItems.size <= 6, 'Realized items must be 6 or less');

            let realizedTemplates = <Map<string, Map<android.view.View, View>>>(<any>listView)._realizedTemplates;
            TKUnit.assertEqual(realizedTemplates.size, 3, 'Realized templates');
            TKUnit.assertTrue(realizedTemplates.get("red").size <= 2, 'Red realized items must be 2 or less');
            TKUnit.assertTrue(realizedTemplates.get("green").size <= 2, 'Green realized items must be 2 or less');
            TKUnit.assertTrue(realizedTemplates.get("blue").size <= 2, 'Blue realized items must be 2 or less');
        }
    }

    private _itemTemplatesString = `
        <template key="red">
            <Label text='red' style.backgroundColor='red' minHeight='100' maxHeight='100'/>
        </template>
        <template key='green'>
            <Label text='green' style.backgroundColor='green' minHeight='100' maxHeight='100'/>
        </template>
        <template key='blue'>
            <Label text='blue' style.backgroundColor='blue' minHeight='100' maxHeight='100'/>
        </template>
        `;

    private static generateItemsForMultipleTemplatesTests(count: number): Array<Item> {
        let items = new Array<Item>();
        for (let i = 0; i < count; i++) {
            items.push({
                text: "Item " + i,
                age: i,
                loadedCount: 0,
                unloadedCount: 0,
                onViewLoaded: function onViewLoaded(args) {
                    this.loadedCount++;
                },
                onViewUnloaded: function onViewUnloaded(args) {
                    this.unloadedCount++;
                }
            });
        }
        return items;
    }
}

interface Item {
    text: string;
    age: number;
    loadedCount: number;
    unloadedCount: number;
    onViewLoaded: (args) => void;
    onViewUnloaded: (args) => void;
}

export function createTestCase(): ListViewTest {
    return new ListViewTest();
}

// >> article-item-template-selector-function
export function selectItemTemplate(item: Item, index: number, items: Array<Item>) {
    return item.age % 2 === 0 ? "red" : "green";
}
// << article-item-template-selector-function
