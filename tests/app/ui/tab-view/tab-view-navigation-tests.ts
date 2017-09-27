import * as TKUnit from "../../TKUnit";
import * as helper from "../helper";
import {Label} from "tns-core-modules/ui/label";
import {StackLayout} from "tns-core-modules/ui/layouts/stack-layout";
import * as frameModule from "tns-core-modules/ui/frame";
import {Page} from "tns-core-modules/ui/page";
import {ListView, ItemEventData} from "tns-core-modules/ui/list-view";
import {TabView, TabViewItem} from "tns-core-modules/ui/tab-view";
import {Button} from "tns-core-modules/ui/button";

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
        var tabEntry = new TabViewItem();
        tabEntry.title = "Tab " + i;
        tabEntry.view = label;
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
            button.on(Button.tapEvent, _clickHandlerFactory(args.index));
            args.view = button;
        }

        button.text = "Button" + args.index;
        button.id = button.text;
    });

    listView.items = items;

    return listView;
}

function _clickHandlerFactory(index: number) {
    return function () {
        var pageFactory = function (): Page {
            var detailsLabel = new Label();
            detailsLabel.text = "Details Page " + index;
            var detailsPage = new Page();
            detailsPage.id = "details-page";
            detailsPage.content = detailsLabel;
            return detailsPage;
        };

        helper.navigateWithHistory(pageFactory);
    }
}

export function testWhenNavigatingBackToANonCachedPageContainingATabViewWithAListViewTheListViewIsThere() {
    var topFrame = frameModule.topmost();

    let oldChache;
    if (topFrame.android) {
        oldChache = topFrame.android.cachePagesOnNavigate;
        topFrame.android.cachePagesOnNavigate = true;
    }

    let tabViewPage: Page;
    let tabView: TabView;

    let pageFactory = function (): Page {
        tabView = _createTabView();
        let items = Array<TabViewItem>();
        let tabViewitem = new TabViewItem();
        tabViewitem.title = "List";
        tabViewitem.view = _createListView();
        items.push(tabViewitem);

        let label = new Label();
        label.text = "About";
        let aboutLayout = new StackLayout();
        aboutLayout.id = "AboutLayout";
        aboutLayout.addChild(label);
        tabViewitem = new TabViewItem();
        tabViewitem.title = "About";
        tabViewitem.view = aboutLayout;
        items.push(tabViewitem);
        
        tabView.items = items;

        tabViewPage = new Page();
        tabViewPage.id = "tab-view-page";
        tabViewPage.content = tabView;

        return tabViewPage;
    }

    let rootPage = helper.getCurrentPage();

    helper.navigateWithHistory(pageFactory);
    TKUnit.waitUntilReady(() => topFrame.currentPage === tabViewPage);
    TKUnit.waitUntilReady(() => tabViewIsFullyLoaded(tabView));

    // This will navigate to a details page. The wait is inside the method.
    _clickTheFirstButtonInTheListViewNatively(tabView);
    TKUnit.waitUntilReady(() => topFrame.currentPage.id === "details-page");

    frameModule.goBack();
    TKUnit.waitUntilReady(() => topFrame.currentPage === tabViewPage);
    TKUnit.waitUntilReady(() => tabViewIsFullyLoaded(tabView));

    frameModule.goBack();
    TKUnit.waitUntilReady(() => topFrame.currentPage === rootPage);

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
    let topFrame = frameModule.topmost();
    let rootPage = helper.getCurrentPage();

    let oldChache;
    if (topFrame.android) {
        oldChache = topFrame.android.cachePagesOnNavigate;
        topFrame.android.cachePagesOnNavigate = enablePageCache;
    }

    let itemCount = 2;
    let loadedEventsCount = [0, 0];
    let unloadedEventsCount = [0, 0];

    let tabView = _createTabView();
    tabView.items = _createItems(itemCount);

    let tabViewPage: Page;
    helper.navigateWithHistory(() => {
        tabViewPage = new Page();
        tabViewPage.content = tabView;
        return tabViewPage;
    });

    TKUnit.waitUntilReady(() => topFrame.currentPage === tabViewPage, ASYNC);
    TKUnit.waitUntilReady(() => tabViewIsFullyLoaded(tabView), ASYNC);

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

    for (let i = 0; i < itemCount; i++) {
        tabView.items[i].view.on("loaded", createLoadedFor(i));
        tabView.items[i].view.on("unloaded", createUnloadedFor(i));
    }

    let detailsPage = new Page();

    let createFunc = () => {
        return detailsPage;
    };

    let entry: frameModule.NavigationEntry = { create: createFunc, animated: false };
    topFrame.navigate(entry);

    TKUnit.waitUntilReady(() => topFrame.currentPage === detailsPage);

    topFrame.goBack();
    TKUnit.waitUntilReady(() => topFrame.currentPage === tabViewPage);
    TKUnit.waitUntilReady(() => tabViewIsFullyLoaded(tabView));

    for (let i = 0; i < itemCount; i++) {
        tabView.items[i].view.off("loaded");
        tabView.items[i].view.off("unloaded");
    }

    topFrame.goBack();

    TKUnit.waitUntilReady(() => topFrame.currentPage === rootPage);

    if (topFrame.android) {
        topFrame.android.cachePagesOnNavigate = oldChache;
    }

    topFrame.currentPage.id = null;

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
        const tableView = <UITableView>tabView.ios.viewControllers[0].view;
        const cell = <UITableViewCell>tableView.cellForRowAtIndexPath(NSIndexPath.indexPathForItemInSection(0, 0));
        const btn = <UIButton>cell.contentView.subviews[0];
        btn.sendActionsForControlEvents(UIControlEvents.TouchUpInside);
    }
}