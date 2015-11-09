import testModule = require("../../ui-test");
import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");
import labelModule = require("ui/label");
import stackLayoutModule = require("ui/layouts/stack-layout");
import tabViewTestsNative = require("./tab-view-tests-native");
import frameModule = require("ui/frame");
import pageModule = require("ui/page");
import listViewModule = require("ui/list-view");
import buttonModule = require("ui/button");
import observable = require("data/observable");
import builder = require("ui/builder");

// <snippet module="ui/tab-view" title="TabView">
// # TabView

// ### Declaring the TabView in xml.
//```XML
// <Page>
//  <TabView>
//    <TabView.items>
//      <TabViewItem title="Tab 1">
//        <TabViewItem.view>
//           <Label text="Label in Tab1" />
//        </TabViewItem.view>
//      </TabViewItem>
//      <TabViewItem title="Tab 2">
//        <TabViewItem.view>
//           <Label text="Label in Tab2" />
//        </TabViewItem.view>
//      </TabViewItem>
//    </TabView.items>
//  </TabView>
// </Page>
//```

// Using a TabView requires the "ui/tab-view" module.
// ``` JavaScript
import tabViewModule = require("ui/tab-view");
// ```
// </snippet>

var ASYNC = 2;

export class TabViewTest extends testModule.UITest<tabViewModule.TabView> {

    public create(): tabViewModule.TabView {
        // <snippet module="ui/tab-view" title="TabView">
        // ## Creating a TabView
        // ``` JavaScript
        var tabView = new tabViewModule.TabView();
        // ```
        // </snippet>
        tabView.id = "TabView";
        return tabView;
    }

    private _createItems(count: number): Array<tabViewModule.TabViewItem> {
        var items = new Array<tabViewModule.TabViewItem>();
        for (var i = 0; i < count; i++) {
            var label = new labelModule.Label();
            label.text = "Tab " + i;
            var tabEntry = new tabViewModule.TabViewItem({
                title: "Tab " + i,
                view: label
            });
            items.push(tabEntry);
        }
        return items;
    }

    private _createListView(): listViewModule.ListView {
        var listView = new listViewModule.ListView();
        listView.id = "ListView";
        var items = Array.apply(null, Array(10)).map(function (_, i) { return i; });

        listView.on(listViewModule.ListView.itemLoadingEvent, function (args: listViewModule.ItemEventData) {
            var button = <buttonModule.Button>args.view;
            if (!button) {
                button = new buttonModule.Button();
                args.view = button;
            }

            button.text = "Button" + args.index;
            button.id = button.text;
            button.on(buttonModule.Button.tapEvent, this._clickHandlerFactory(args.index));
        });

        listView.items = items;

        return listView;
    }

    private _clickHandlerFactory = function (index: number) {
        return function () {
            var pageFactory = function (): pageModule.Page {
                var detailsLabel = new labelModule.Label();
                detailsLabel.text = "Details Page " + index;
                var detailsPage = new pageModule.Page();
                detailsPage.content = detailsLabel;
                return detailsPage;
            };

            helper.navigate(pageFactory);
        }
    }

    public testWhenTabViewIsCreatedItemsAreUndefined = function () {
        TKUnit.assertEqual(this.testView.items, undefined, "Items should be undefined initally.");
    }

    public testWhenTabViewIsCreatedSelectedIndexIsUndefined = function () {
        TKUnit.assertEqual(this.testView.selectedIndex, undefined, "selectedIndex should be undefined initally.");
    }

    public testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeTabsIsCreated = function () {
        this.testView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        let expectedValue = this.testView.items.length;
        let actualValue = tabViewTestsNative.getNativeTabCount(this.testView);
        
        TKUnit.assertEqual(actualValue, expectedValue, "NativeItems not equal to JS items.");
    }

    public testWhenSettingItemsToEmptyArrayZeroNativeTabsAreCreated = function () {
        var tabView = this.testView;
        tabView.items = [];
        this.waitUntilTestElementIsLoaded();

        var expectedValue = tabView.items.length;
        var actualValue = tabViewTestsNative.getNativeTabCount(tabView);

        TKUnit.assertEqual(actualValue, expectedValue, "Should have 0 native tabs.");
    }

    public testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
        var tabView = this.testView;
        // <snippet module="ui/tab-view" title="TabView">
        // ### Binding TabView.items
        // ``` JavaScript
        var items = [];
        var StackLayout0 = new stackLayoutModule.StackLayout();
        var label0 = new labelModule.Label();
        label0.text = "Tab 0";
        StackLayout0.addChild(label0);
        var tabEntry0 = {
            title: "Tab 0",
            view: StackLayout0
        };
        items.push(tabEntry0);
        var StackLayout1 = new stackLayoutModule.StackLayout();
        var label1 = new labelModule.Label();
        label1.text = "Tab 1";
        StackLayout1.addChild(label1);
        var tabEntry1 = {
            title: "Tab 1",
            view: StackLayout1
        };
        items.push(tabEntry1);
        tabView.items = items;
        // ```
        // </snippet>

        this.waitUntilTestElementIsLoaded();

        var expectedValue = 0;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "When bound selectedIndex should be 0.");
    }

    public testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {

        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        // <snippet module="ui/tab-view" title="TabView">
        // ### Selecting a tab programmatically
        // ``` JavaScript
        tabView.selectedIndex = 9;
        // ```
        // </snippet>
        tabView.items = [];

        var expectedValue = undefined;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex should be undefined.");
    }

    public testSelectedIndexBecomesUndefinedWhenItemsSetToUndefined = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        tabView.selectedIndex = 9;
        tabView.items = undefined;
        var expectedValue = undefined;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex should be undefined.");
    }

    public testSelectedIndexBecomesUndefinedWhenItemsSetToNull = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        tabView.selectedIndex = 9;
        this.waitUntilTestElementIsLoaded();

        tabView.items = null;
        var expectedValue = undefined;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex should be undefined.");
    }

    public testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
        var tabView = this.testView;
        var expectedValue = 10;
        tabView.items = this._createItems(expectedValue);
        tabView.selectedIndex = 9;
        this.waitUntilTestElementIsLoaded();

        var actualValue = tabView.items.length;
        TKUnit.assertEqual(actualValue, expectedValue, "items.length should be 10");
    }

    public testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        var expectedValue = 9;
        tabView.selectedIndex = expectedValue;
        this.waitUntilTestElementIsLoaded();

        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex");
    }

    public testSettingNegativeSelectedIndexShouldThrow = function () {
        var tabView = this.testView;
        this.waitUntilTestElementIsLoaded();
        tabView.items = this._createItems(10);

        TKUnit.assertThrows(function () {
            tabView.selectedIndex = -1;
        }, "Setting selectedIndex to a negative number should throw.");
    }

    public testSettingSelectedIndexLargerThanCountShouldThrow = function () {
        var tabView = this.testView;
        this.waitUntilTestElementIsLoaded();
        tabView.items = this._createItems(10);
        TKUnit.assertThrows(function () {
            tabView.selectedIndex = 10;
        }, "Setting selectedIndex to a negative number should throw.");
    }

    public testBindingToTabEntryWithUndefinedViewShouldThrow = function () {
        var tabView = this.testView;
        this.waitUntilTestElementIsLoaded();

        TKUnit.assertThrows(function () {
            tabView.items = [new tabViewModule.TabViewItem({ title: "Tab 0", view: undefined })];
        }, "Binding TabView to a TabViewItem with undefined view should throw.");
    }

    public testBindingToTabEntryWithNullViewShouldThrow = function () {
        var tabView = this.testView;
        this.waitUntilTestElementIsLoaded();

        TKUnit.assertThrows(function () {
            tabView.items = [new tabViewModule.TabViewItem({ title: "Tab 0", view: null })];
        }, "Binding TabView to a TabViewItem with null view should throw.");
    }

    public testWhenSelectingATabNativelySelectedIndexIsUpdatedProperly = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(2);
        this.waitUntilTestElementIsLoaded();

        var expectedValue = 1;
        tabViewTestsNative.selectNativeTab(tabView, expectedValue);
        TKUnit.waitUntilReady(function () {
            return tabView.selectedIndex === expectedValue;
        }, helper.ASYNC);

        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex");
    }

    public testWhenSelectingATabNativelySelectedIndexChangedEventIsRaised = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        var expectedOldIndex = 3;
        var expectedNewIndex = 5;
        var actualOldIndex;
        var actualNewIndex;

        tabViewTestsNative.selectNativeTab(tabView, expectedOldIndex);
        TKUnit.waitUntilReady(function () {
            return tabView.selectedIndex === expectedOldIndex;
        }, helper.ASYNC);

        tabView.on(tabViewModule.TabView.selectedIndexChangedEvent, (args: tabViewModule.SelectedIndexChangedEventData) => {
            actualOldIndex = args.oldIndex;
            actualNewIndex = args.newIndex;
        });

        tabViewTestsNative.selectNativeTab(tabView, expectedNewIndex);
        TKUnit.waitUntilReady(function () {
            return tabView.selectedIndex === expectedNewIndex;
        }, helper.ASYNC);

        TKUnit.assertEqual(actualOldIndex, expectedOldIndex, "expectedOldIndex");
        TKUnit.assertEqual(actualNewIndex, expectedNewIndex, "expectedNewIndex");
    }

    public testWhenSettingSelectedIndexProgramaticallySelectedIndexChangedEventIsRaised = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        var expectedOldIndex = 2;
        var expectedNewIndex = 6;
        var actualOldIndex;
        var actualNewIndex;

        tabView.selectedIndex = expectedOldIndex;
        TKUnit.waitUntilReady(function () {
            return tabViewTestsNative.getNativeSelectedIndex(tabView) === expectedOldIndex;
        }, helper.ASYNC);

        tabView.on(tabViewModule.TabView.selectedIndexChangedEvent, (args: tabViewModule.SelectedIndexChangedEventData) => {
            actualOldIndex = args.oldIndex;
            actualNewIndex = args.newIndex;
        });

        tabView.selectedIndex = expectedNewIndex;
        TKUnit.waitUntilReady(function () {
            return tabViewTestsNative.getNativeSelectedIndex(tabView) === expectedNewIndex;
        }, helper.ASYNC);

        TKUnit.assertEqual(actualOldIndex, expectedOldIndex, "expectedOldIndex");
        TKUnit.assertEqual(actualNewIndex, expectedNewIndex, "expectedNewIndex");
    }
    /*
    public testBindingIsRefreshedWhenTabViewItemIsUnselectedAndThenSelectedAgain() {

        var viewModel = new observable.Observable();
        viewModel.set("counter", 0);
        this.testPage.bindingContext = viewModel;

        var tabView = this.testView;
        var items = this._createItems(10);

        var StackLayout0 = new stackLayoutModule.StackLayout();
        var label0 = new labelModule.Label();
        label0.text = "Tab 0";
        label0.id = "testLabel";
        label0.bind({ sourceProperty: "counter", targetProperty: "text", twoWay: true });
        StackLayout0.addChild(label0);
        var tabEntry0 = new tabViewModule.TabViewItem({
            title: "Tab 0",
            view: StackLayout0
        });
        items.push(tabEntry0);

        tabView.items = items;
        tabView.selectedIndex = 10;
        TKUnit.waitUntilReady(function () {
            return tabViewTestsNative.getNativeSelectedIndex(tabView) === tabView.selectedIndex;
        }, helper.ASYNC);

        TKUnit.assertEqual(label0.text, 0, "binding is not working!");

        tabView.selectedIndex = 0;
        TKUnit.waitUntilReady(function () {
            return tabViewTestsNative.getNativeSelectedIndex(tabView) === tabView.selectedIndex;
        }, helper.ASYNC);

        tabView.selectedIndex = 10;
        TKUnit.waitUntilReady(function () {
            return tabViewTestsNative.getNativeSelectedIndex(tabView) === tabView.selectedIndex;
        }, helper.ASYNC);

        var expectedValue = 5;
        viewModel.set("counter", expectedValue);
        TKUnit.assertEqual(label0.text, expectedValue, "binding is not working!");
    }*/
}

export function createTestCase(): TabViewTest {
    return new TabViewTest();
}

export function test__tabview_selectedindex_will_work_from_xml() {
    var p = <pageModule.Page>builder.parse(
        '<Page>' +
          '<TabView selectedIndex= "1">' +
            '<TabView.items>'+
              '<TabViewItem title="First">' +
                 '<TabViewItem.view>' +
                    '<Label text="First View" />' +
                 '</TabViewItem.view>' +
              '</TabViewItem>' +
              '<TabViewItem title= "Second">' +
                '<TabViewItem.view>' +
                  '<Label text="Second View" />' +
                '</TabViewItem.view>' +
              '</TabViewItem>' +
            '</TabView.items>' +
         '</TabView>' +
        '</Page>');

    function testAction(views: Array<viewModule.View>) {
        var tab: tabViewModule.TabView = <tabViewModule.TabView>p.content;

        TKUnit.wait(0.2);

        TKUnit.assertEqual(tab.selectedIndex, 1);
    };

    helper.navigate(function () { return p; });

    try {
        testAction([p.content, p]);
    }
    finally {
        helper.goBack();
    }
}