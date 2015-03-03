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

// <snippet module="ui/tab-view" title="TabView">
// # TabView

// ### Declaring the TabView in xml.
//```XML
// <Page>
//  <TabView>
//    <TabView.items>
//      <TabEntry title="Tab 1">
//        <TabEntry.view>
//           <Label text="Label in Tab1" />
//        </TabEntry.view>
//      </TabEntry>
//      <TabEntry title="Tab 2">
//        <TabEntry.view>
//           <Label text="Label in Tab2" />
//        </TabEntry.view>
//      </TabEntry>
//    </TabView.items>
//  </TabView>
// </Page>
//```

// Using a TabView requires the "ui/tab-view" module.
// ``` JavaScript
import tabViewModule = require("ui/tab-view");

function _createTabView(): tabViewModule.TabView {
    // <snippet module="ui/tab-view" title="TabView">
    // ## Creating a TabView
    // ``` JavaScript
    var tabView = new tabViewModule.TabView();
    // ```
    // </snippet>
    tabView.id = "TabView";
    return tabView;
}

function _createItems(count: number): Array<tabViewModule.TabEntry> {
    var items = new Array<tabViewModule.TabEntry>();
    for (var i = 0; i < count; i++) {
        var label = new labelModule.Label();
        label.text = "Tab " + i;
        var tabEntry = {
            title: "Tab " + i,
            view: label
        };
        items.push(tabEntry);
    }
    return items;
}

function _createListView(): listViewModule.ListView {
    var listView = new listViewModule.ListView();
    listView.id = "ListView";
    var items = Array.apply(null, Array(10)).map(function (_, i) { return i; });

    listView.on(listViewModule.knownEvents.itemLoading, function (args: listViewModule.ItemEventData) {
        var button = <buttonModule.Button>args.view;
        if (!button) {
            button = new buttonModule.Button();
            args.view = button;
        }

        button.text = "Button" + args.index;
        button.id = button.text;
        button.on(buttonModule.knownEvents.tap, _clickHandlerFactory(args.index));
    });

    listView.items = items;

    return listView;
}

var _clickHandlerFactory = function (index: number) {
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

export var testWhenTabViewIsCreatedItemsAreUndefined = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        var expectedValue = undefined;
        var actualValue = tabView.items;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenTabViewIsCreatedSelectedIndexIsUndefined = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        var expectedValue = undefined;
        var actualValue = tabView.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeTabsIsCreated = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        tabView.items = _createItems(10);
        var expectedValue = tabView.items.length;
        var actualValue = tabViewTestsNative.getNativeTabCount(tabView);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testWhenSettingItemsToEmptyArrayZeroNativeTabsAreCreated = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        tabView.items = [];
        var expectedValue = tabView.items.length;
        var actualValue = tabViewTestsNative.getNativeTabCount(tabView);
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
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
        var expectedValue = 0;
        var actualValue = tabView.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        tabView.items = _createItems(10);
        // <snippet module="ui/tab-view" title="TabView">
        // ### Selecting a tab programmatically
        // ``` JavaScript
        tabView.selectedIndex = 9;
        // ```
        // </snippet>
        tabView.items = [];
        var expectedValue = undefined;
        var actualValue = tabView.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToUndefined = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        tabView.items = _createItems(10);
        tabView.selectedIndex = 9;
        tabView.items = undefined;
        var expectedValue = undefined;
        var actualValue = tabView.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToNull = function () {
    helper.buildUIAndRunTest(_createTabView(), function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        tabView.items = _createItems(10);
        tabView.selectedIndex = 9;
        tabView.items = null;
        var expectedValue = undefined;
        var actualValue = tabView.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
    var tabView = _createTabView();
    var expectedValue = 10;
    tabView.items = _createItems(expectedValue);
    tabView.selectedIndex = 9;
    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        var actualValue = tabView.items.length;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
    var tabView = _createTabView();
    tabView.items = _createItems(10);
    var expectedValue = 9;
    tabView.selectedIndex = expectedValue;
    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        var actualValue = tabView.selectedIndex;
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    });
}

export var testSettingNegativeSelectedIndexShouldThrow = function () {
    var tabView = _createTabView();
    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        tabView.items = _createItems(10);

        TKUnit.assertThrows(function () {
            tabView.selectedIndex = -1;
        }, "Setting selectedIndex to a negative number should throw.");
    });
}

export var testSettingSelectedIndexLargerThanCountShouldThrow = function () {
    var tabView = _createTabView();
    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        tabView.items = _createItems(10);
        TKUnit.assertThrows(function () {
            tabView.selectedIndex = 10;
        }, "Setting selectedIndex to a negative number should throw.");
    });
}

export var testBindingToTabEntryWithUndefinedViewShouldThrow = function () {
    var tabView = _createTabView();
    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        TKUnit.assertThrows(function () {
            tabView.items = [{ title: "Tab 0", view: undefined }];
        }, "Binding TabView to a TabEntry with undefined view should throw.");
    });
}

export var testBindingToTabEntryWithNullViewShouldThrow = function () {
    var tabView = _createTabView();
    helper.buildUIAndRunTest(tabView, function (views: Array<viewModule.View>) {
        var tabView = <tabViewModule.TabView>views[0];
        TKUnit.assertThrows(function () {
            tabView.items = [{ title: "Tab 0", view: null }];
        }, "Binding TabView to a TabEntry with null view should throw.");
    });
}

export var testWhenSelectingATabNativelySelectedIndexIsUpdatedProperly = function () {
    var tabView: tabViewModule.TabView;
    var mainPage: pageModule.Page;
    var pageFactory = function (): pageModule.Page {
        tabView = _createTabView();
        tabView.items = _createItems(2);
        mainPage = new pageModule.Page();
        mainPage.content = tabView;
        return mainPage;
    };

    helper.navigate(pageFactory);

    var expectedValue = 1;
    tabViewTestsNative.selectNativeTab(tabView, expectedValue);
    TKUnit.wait(helper.ASYNC);

    var actualValue = tabView.selectedIndex;
    try {
        TKUnit.assert(actualValue === expectedValue, "Actual: " + actualValue + "; Expected: " + expectedValue);
    }
    finally {
        helper.goBack();
    }
}

export var testWhenNavigatingBackToANonCachedPageContainingATabViewWithAListViewTheListViewIsThere = function () {
    return;

    var topFrame = frameModule.topmost();
    var oldChache;

    if (topFrame.android) {
        oldChache = topFrame.android.cachePagesOnNavigate;
        topFrame.android.cachePagesOnNavigate = true;
    }

    try {

        var mainPage: pageModule.Page;
        var pageFactory = function(): pageModule.Page {
            var tabView = _createTabView();
            var items = [];
            items.push({
                title: "List",
                view: _createListView()
            });
            var label = new labelModule.Label();
            label.text = "About";
            var aboutLayout = new stackLayoutModule.StackLayout();
            aboutLayout.id = "AboutLayout";
            aboutLayout.addChild(label);
            items.push({
                title: "About",
                view: aboutLayout
            });
            tabView.items = items;

            mainPage = new pageModule.Page();
            mainPage.content = tabView;

            return mainPage;
        }

        helper.navigate(pageFactory);

        var tabView = mainPage.getViewById<tabViewModule.TabView>("TabView");
        
        // This will navigate to a details page. The wait is inside the method.
        _clickTheFirstButtonInTheListViewNatively(tabView);

        // Go back to the main page containing the TabView.
        helper.goBack();
        
        // Go back to the root tests page.
        helper.goBack();
    }
    finally {
        if (topFrame.android) {
            topFrame.android.cachePagesOnNavigate = oldChache;
        }
    }

    var listView = mainPage.getViewById<listViewModule.ListView>("ListView");

    TKUnit.assert(listView !== undefined, "ListView should be created when navigating back to the main page.");
}

function _clickTheFirstButtonInTheListViewNatively(tabView: tabViewModule.TabView) {
    if (tabView.android) {
        var androidListView = <android.widget.ListView>tabView.android.getChildAt(0);
        (<android.widget.Button>androidListView.getChildAt(0)).performClick();
    }
    else {
        (<UIButton>(<UITableView>tabView.ios.viewControllers[0].view.subviews[0]).cellForRowAtIndexPath(NSIndexPath.indexPathForItemInSection(0, 0)).contentView.subviews[0]).sendActionsForControlEvents(UIControlEvents.UIControlEventTouchUpInside);
    }
}
