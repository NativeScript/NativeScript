import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import {Label} from "ui/label";
import {StackLayout} from "ui/layouts/stack-layout";
import frameModule = require("ui/frame");
import {Page} from "ui/page";
import {ListView, ItemEventData} from "ui/list-view";
import {TabView, TabViewItem} from "ui/tab-view";
import {Button} from "ui/button";
import types = require("utils/types");

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
        tabEntry["index"] = i;
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
            detailsPage.id = "details-page";
            detailsPage.content = detailsLabel;
            return detailsPage;
        };

        helper.navigate(pageFactory);
    }
}

export function testWhenNavigatingBackToANonCachedPageContainingATabViewWithAListViewTheListViewIsThere() {
    var topFrame = frameModule.topmost();

    var oldChache;
    if (topFrame.android) {
        oldChache = topFrame.android.cachePagesOnNavigate;
        topFrame.android.cachePagesOnNavigate = true;
    }

    var tabView;
    var pageFactory = function (): Page {
        tabView = _createTabView();
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

        var tabViewPage = new Page();
        tabViewPage.id = "tab-view-page";
        tabViewPage.content = tabView;

        return tabViewPage;
    }

    helper.navigate(pageFactory);
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "tab-view-page" }, ASYNC);
    TKUnit.waitUntilReady(() => { return tabViewIsFullyLoaded(tabView) }, ASYNC);

    // This will navigate to a details page. The wait is inside the method.
    _clickTheFirstButtonInTheListViewNatively(tabView);
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "details-page" }, ASYNC);

    helper.goBack();
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "tab-view-page" }, ASYNC);
    TKUnit.waitUntilReady(() => { return tabViewIsFullyLoaded(tabView) }, ASYNC);

    helper.goBack();
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "mainPage" }, ASYNC);

    if (topFrame.android) {
        topFrame.android.cachePagesOnNavigate = oldChache;
    }

    TKUnit.assert(tabView.items[0].view instanceof ListView, "ListView should be created when navigating back to the main page.");
}

export function testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack_NoPageCaching() {
    testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack(false);
}

export function testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack_WithPageCaching() {
    testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack(true);
}

function tabViewIsFullyLoaded(tabView: TabView): boolean {
    if (!tabView.isLoaded) {
        return false;
    }

    for (var i = 0; i < tabView.items.length; i++) {
        if (!tabView.items[i].view.isLoaded) {
            return false;
        }
    }

    if (tabView.android) {
        var viewPager: android.support.v4.view.ViewPager = (<any>tabView)._viewPager;
        if (viewPager.getChildCount() === 0) {
            return false;
        }
    }

    return true;
}

function testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack(enablePageCache: boolean) {
    var topFrame = frameModule.topmost();

    var oldChache;
    if (topFrame.android) {
        oldChache = topFrame.android.cachePagesOnNavigate;
        topFrame.android.cachePagesOnNavigate = enablePageCache;
    }

    var i: number;
    var itemCount = 2;
    var loadedEventsCount = [0, 0];
    var unloadedEventsCount = [0, 0];

    var tabView = _createTabView();
    tabView.items = _createItems(itemCount);

    helper.navigate(() => {
        var tabViewPage = new Page();
        tabViewPage.id = "tab-view-page";
        tabViewPage.content = tabView;
        return tabViewPage;
    });
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "tab-view-page" }, ASYNC);
    TKUnit.waitUntilReady(() => { return tabViewIsFullyLoaded(tabView) }, ASYNC);

    function createLoadedFor(tabIndex: number) {
        return function () {
            loadedEventsCount[tabIndex] = loadedEventsCount[tabIndex] + 1;
        }
    }

    function createUnloadedFor(tabIndex: number) {
        return function () {
            unloadedEventsCount[tabIndex] = unloadedEventsCount[tabIndex] + 1;
        }
    }

    for (i = 0; i < itemCount; i++) {
        tabView.items[i].view.on("loaded", createLoadedFor(i));
        tabView.items[i].view.on("unloaded", createUnloadedFor(i));
    }

    helper.navigate(() => {
        var detailsPage = new Page();
        detailsPage.id = "details-page";
        detailsPage.content = new Label();
        return detailsPage;
    });
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "details-page" }, ASYNC);
                
    helper.goBack();
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "tab-view-page" }, ASYNC);
    TKUnit.waitUntilReady(() => { return tabViewIsFullyLoaded(tabView) }, ASYNC);

    for (i = 0; i < itemCount; i++) {
        tabView.items[i].view.off("loaded");
        tabView.items[i].view.off("unloaded");
    }

    helper.goBack();
    TKUnit.waitUntilReady(() => { return topFrame.currentPage.id === "mainPage" }, ASYNC);

    if (topFrame.android) {
        topFrame.android.cachePagesOnNavigate = oldChache;
    }

    TKUnit.arrayAssert(loadedEventsCount, [1, 1]);
    TKUnit.arrayAssert(unloadedEventsCount, [1, 1]);
}

function _clickTheFirstButtonInTheListViewNatively(tabView: TabView) {
    if (tabView.android) {
        var viewPager: android.support.v4.view.ViewPager = (<any>tabView)._viewPager;
        var androidListView = <android.widget.ListView>viewPager.getChildAt(0);
        var stackLayout = <org.nativescript.widgets.StackLayout>androidListView.getChildAt(0);
        var button = <android.widget.Button>stackLayout.getChildAt(0);
        button.performClick();
    }
    else {
        (<UIButton>(<UITableView>tabView.ios.viewControllers[0].view.subviews[0]).cellForRowAtIndexPath(NSIndexPath.indexPathForItemInSection(0, 0)).contentView.subviews[0]).sendActionsForControlEvents(UIControlEvents.UIControlEventTouchUpInside);
    }
}