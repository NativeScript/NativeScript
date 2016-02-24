import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import {Label} from "ui/label";
import {StackLayout} from "ui/layouts/stack-layout";
import frameModule = require("ui/frame");
import {Page} from "ui/page";
import {ListView, ItemEventData} from "ui/list-view";
import {TabView, TabViewItem} from "ui/tab-view";
import {Button} from "ui/button";

var ASYNC = 2;

function _createTabView(): TabView {
    var tabView = new TabView();
    tabView.id = "TabView";
    return tabView;
}

function _createItems(count: number): Array<TabViewItem> {
    var items = new Array<TabViewItem>();
    for (var i = 0; i < count; i++) {
        var label = new Label();
        label.text = "Tab " + i;
        var tabEntry = new TabViewItem({
            title: "Tab " + i,
            view: label
        });
        items.push(tabEntry);
    }
    return items;
}

function _createListView(): ListView {
    var listView = new ListView();
    listView.id = "ListView";
    var items = Array.apply(null, Array(10)).map(function (_, i) { return i; });

    listView.on(ListView.itemLoadingEvent, function (args: ItemEventData) {
        var button = <Button>args.view;
        if (!button) {
            button = new Button();
            args.view = button;
        }

        button.text = "Button" + args.index;
        button.id = button.text;
        button.on(Button.tapEvent, _clickHandlerFactory(args.index));
    });

    listView.items = items;

    return listView;
}

var _clickHandlerFactory = function (index: number) {
    return function () {
        var pageFactory = function (): Page {
            var detailsLabel = new Label();
            detailsLabel.text = "Details Page " + index;
            var detailsPage = new Page();
            detailsPage.content = detailsLabel;
            return detailsPage;
        };

        helper.navigate(pageFactory);
    }
}

export function testWhenNavigatingBackToANonCachedPageContainingATabViewWithAListViewTheListViewIsThere() {
    /*
    var topFrame = frameModule.topmost();
    var oldChache;

    if (topFrame.android) {
        oldChache = topFrame.android.cachePagesOnNavigate;
        topFrame.android.cachePagesOnNavigate = true;
    }

    try {

        var mainPage: Page;
        var pageFactory = function (): Page {
            var tabView = _createTabView();
            var items = [];
            items.push({
                title: "List",
                view: _createListView()
            });
            var label = new Label();
            label.text = "About";
            var aboutLayout = new StackLayout();
            aboutLayout.id = "AboutLayout";
            aboutLayout.addChild(label);
            items.push({
                title: "About",
                view: aboutLayout
            });
            tabView.items = items;

            mainPage = new Page();
            mainPage.content = tabView;

            return mainPage;
        }

        helper.navigate(pageFactory);

        var tabView = mainPage.getViewById<TabView>("TabView");

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

    var listView = mainPage.getViewById<ListView>("ListView");

    TKUnit.assert(listView !== undefined, "ListView should be created when navigating back to the main page.");
    */
}
/*
export function testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack_NoPageCaching() {
    testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack(false);
}

export function testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack_WithPageCaching() {
    testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack(true);
}
*/
function testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack(enablePageCache: boolean) {
    var i: number;
    var itemCount = 3;
    var loadedItems = [0, 0, 0];
    var unloadedItems = [0, 0, 0];

    var topFrame = frameModule.topmost();
    var oldChache;

    if (topFrame.android) {
        oldChache = topFrame.android.cachePagesOnNavigate;
        topFrame.android.cachePagesOnNavigate = enablePageCache;
    }

    try {
        var tabView = _createTabView();
        var items = _createItems(itemCount);
        tabView.items = items;

        function createLoadedFor(itemIndex: number) {
            return function () {
                loadedItems[itemIndex] = loadedItems[itemIndex] + 1;
            }
        }

        function createUnloadedFor(itemIndex: number) {
            return function () {
                unloadedItems[itemIndex] = unloadedItems[itemIndex] + 1;
            }
        }

        helper.buildUIAndRunTest(tabView, function () {
            try {
                TKUnit.waitUntilReady(() => { return items[0].view.isLoaded; }, ASYNC);

                // Attach to loaded/unloaded events
                for (i = 0; i < itemCount; i++) {
                    items[i].view.on("loaded", createLoadedFor(i));
                    items[i].view.on("unloaded", createUnloadedFor(i));
                }

                var detailsPageFactory = function (): Page {
                    var detailsPage = new Page();
                    detailsPage.content = new Label();
                    return detailsPage;
                };

                helper.navigate(detailsPageFactory);
            }
            finally {
                // Go back to the test page.
                helper.goBack();
            }

            TKUnit.waitUntilReady(() => { return items[0].view.isLoaded; }, ASYNC);

            //console.log(">>>>>>>>>>>>> loaded items: " + loadedItems.join(", "));
            //console.log(">>>>>>>>>>>>> unloadedItems items: " + unloadedItems.join(", "));

            // Check that at least the first item is loaded and unloaded
            TKUnit.assert(items[0].view.isLoaded, "The content of the first tab should be loaded.");
            TKUnit.assertEqual(loadedItems[0], 1, "loaded count for 1st item");
            TKUnit.assertEqual(unloadedItems[0], 1, "unloaded count for 1st item");

            // Check that loaded/unloaded coutns are equal for all tabs
            for (i = 0; i < itemCount; i++) {
                TKUnit.assert(loadedItems[i] === unloadedItems[i],
                    "Loaded and unloaded calls are not equal for item " + i + " loaded: " + loadedItems[i] + " unloaded: " + unloadedItems[i]);
            }
        });
    }
    finally {
        // Return original page cache value
        if (topFrame.android) {
            topFrame.android.cachePagesOnNavigate = oldChache;
        }
    }
}

function _clickTheFirstButtonInTheListViewNatively(tabView: TabView) {
    if (tabView.android) {
        var viewPager: android.support.v4.view.ViewPager = (<any>tabView)._viewPager;
        var androidListView = <android.widget.ListView>viewPager.getChildAt(0);
        (<android.widget.Button>androidListView.getChildAt(0)).performClick();
    }
    else {
        (<UIButton>(<UITableView>tabView.ios.viewControllers[0].view.subviews[0]).cellForRowAtIndexPath(NSIndexPath.indexPathForItemInSection(0, 0)).contentView.subviews[0]).sendActionsForControlEvents(UIControlEvents.UIControlEventTouchUpInside);
    }
}
