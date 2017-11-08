import { TabView, TabViewItem } from "tns-core-modules/ui/tab-view";
import { Page, layout, View, EventData } from "tns-core-modules/ui/page";
import { ios as iosView } from "tns-core-modules/ui/core/view";
import { Label } from "tns-core-modules/ui/label";
import { topmost } from "tns-core-modules/ui/frame";
import * as uiUtils from "tns-core-modules/ui/utils";
import * as TKUnit from "../../TKUnit";
import * as helper from "../helper";
import * as PageTestCommon from "./page-tests-common";

global.moduleMerge(PageTestCommon, exports);

export function test_NavigateToNewPage_InnerControl() {
    var testPage: Page;
    var pageFactory = function (): Page {
        testPage = new Page();
        PageTestCommon.addLabelToPage(testPage);
        return testPage;
    };

    helper.navigateWithHistory(pageFactory);
    var label = <Label>testPage.content;

    helper.goBack();

    TKUnit.assertNull(label._context, "label._context should be undefined after navigate back.");
    TKUnit.assertNull(label.android, "label.android should be undefined after navigate back.");
    TKUnit.assertFalse(label.isLoaded, "label.isLoaded should become false after navigating back");
}

export function test_WhenShowingModalPageUnloadedIsNotFiredForTheMasterPage() {
    let masterPage: Page;
    let masterPageUnloaded = false;
    let modalPage: Page;

    let modalUnloaded = 0;
    let onModalUnloaded = function (args: EventData) {
        modalUnloaded++;
        modalPage.off(Page.unloadedEvent, onModalUnloaded);
        TKUnit.assertNull(masterPage.modal, "currentPage.modal should be undefined when no modal page is shown!");
    }

    var navigatedToEventHandler = function (args) {
        var basePath = "ui/page/";
        modalPage = masterPage.showModal(basePath + "modal-page", null, null, false);
        modalPage.on(Page.unloadedEvent, onModalUnloaded);
    };

    var unloadedEventHandler = function (args) {
        masterPageUnloaded = true;
    };

    var masterPageFactory = function (): Page {
        masterPage = new Page();
        masterPage.id = "master-page";
        masterPage.on(Page.navigatedToEvent, navigatedToEventHandler);
        masterPage.on(View.unloadedEvent, unloadedEventHandler);
        var label = new Label();
        label.text = "Modal Page";
        masterPage.content = label;
        return masterPage;
    };

    helper.navigate(masterPageFactory);
    TKUnit.waitUntilReady(() => { return modalUnloaded > 0; });
    TKUnit.assert(!masterPageUnloaded, "Master page should not raise 'unloaded' when showing modal!");
    masterPage.off(View.loadedEvent, navigatedToEventHandler);
    masterPage.off(View.unloadedEvent, unloadedEventHandler);
}

function getHeight(view: View): number {
    const bounds = view._getCurrentLayoutBounds();
    return bounds.bottom - bounds.top;
}

function getNativeHeight(view: View): number {
    const bounds = view.nativeViewProtected.frame;
    return layout.toDevicePixels(bounds.size.height);
}

export function test_correct_layout_scrollable_content_false() {
    const page = new Page();
    (<any>page).scrollableContent = false;
    page.actionBar.title = "ActionBar";
    page.actionBarHidden = true;

    const tabView = new TabView();
    const tabItem = new TabViewItem();
    tabItem.title = "Item";
    const lbl = new Label();
    (<any>lbl).scrollableContent = false;
    tabItem.view = lbl;
    tabView.items = [tabItem];

    page.content = tabView;
    helper.navigate(() => page);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

    const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
    const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
    const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);

    let pageHeight = getHeight(page);
    let expectedPageHeight = screenHeight;
    TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

    let contentHeight = getHeight(lbl);
    let contentNativeHeight = getNativeHeight(lbl);
    let expectedLabelHeight = screenHeight - statusBarHeight - tabBarHeight;
    TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar - tabBar");
    TKUnit.assertEqual(contentNativeHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar - tabBar");

    page.actionBarHidden = false;
    TKUnit.waitUntilReady(() => page.isLayoutValid);

    pageHeight = getHeight(page);
    const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);
    expectedPageHeight = screenHeight;
    TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

    contentHeight = getHeight(lbl);
    contentNativeHeight = getNativeHeight(lbl);
    expectedLabelHeight = screenHeight - statusBarHeight - tabBarHeight - navBarHeight;
    TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBarHeight - tabBarHeight - navBarHeight");
    TKUnit.assertEqual(contentNativeHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBarHeight - tabBarHeight - navBarHeight");
}

export function test_correct_layout_scrollable_content_true() {
    const page = new Page();
    (<any>page).scrollableContent = true;
    page.actionBar.title = "ActionBar";
    page.actionBarHidden = true;

    const tabView = new TabView();
    const tabItem = new TabViewItem();
    tabItem.title = "Item";
    const lbl = new Label();
    (<any>lbl).scrollableContent = true;
    tabItem.view = lbl;
    tabView.items = [tabItem];

    page.content = tabView;
    helper.navigate(() => page);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

    const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
    const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
    const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);

    let pageHeight = getHeight(page);
    let expectedPageHeight = screenHeight;
    TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

    let contentHeight = getHeight(lbl);
    let expectedLabelHeight = screenHeight - statusBarHeight;
    TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar");

    page.actionBarHidden = false;
    TKUnit.waitUntilReady(() => page.isLayoutValid);

    pageHeight = getHeight(page);
    const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);
    expectedPageHeight = screenHeight;
    TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

    contentHeight = getHeight(lbl);
    TKUnit.assertEqual(contentHeight, screenHeight, "lbl.height !== screenHeight");
}

export function test_correct_layout_scrollable_content_true_flat_action_bar() {
    const page = new Page();
    (<any>page).scrollableContent = true;
    page.actionBar.title = "ActionBar";
    page.actionBar.flat = true;

    const tabView = new TabView();
    const tabItem = new TabViewItem();
    tabItem.title = "Item";
    const lbl = new Label();
    tabItem.view = lbl;
    tabView.items = [tabItem];

    page.content = tabView;
    helper.navigate(() => page);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

    const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
    const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
    const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
    const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

    const pageHeight = getHeight(page);
    const expectedPageHeight = screenHeight - statusBarHeight - navBarHeight;
    TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight - statusBar - navBarHeight");

    const contentHeight = getHeight(lbl);
    const expectedLabelHeight = screenHeight - statusBarHeight - navBarHeight - tabBarHeight;
    TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar - navBarHeight - tabBarHeight");
}

export function test_correct_layout_scrollable_content_true_flat_action_bar_edges_span_under_opaque_bars() {
    const page = new Page();
    (<any>page).scrollableContent = true;
    page.viewController.extendedLayoutIncludesOpaqueBars = true;
    page.actionBar.title = "ActionBar";
    page.actionBar.flat = true;

    const tabView = new TabView();
    tabView.viewController.tabBar.translucent = false;

    const tabItem = new TabViewItem();
    tabItem.title = "Item";
    const lbl = new Label();
    (<any>lbl).scrollableContent = true;
    tabItem.view = lbl;
    tabView.items = [tabItem];

    page.content = tabView;
    helper.navigate(() => page);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

    lbl.viewController.extendedLayoutIncludesOpaqueBars = true;
    lbl.requestLayout();
    (<UIView>lbl.nativeViewProtected).setNeedsLayout();
    (<UIView>lbl.nativeViewProtected).layoutIfNeeded();
    helper.waitUntilLayoutReady(lbl);

    const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
    const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
    const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
    const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

    const pageHeight = getHeight(page);
    TKUnit.assertEqual(pageHeight, screenHeight, "page.height !== screenHeight");

    const contentHeight = getHeight(lbl);
    TKUnit.assertEqual(contentHeight, screenHeight, "lbl.height !== screenHeight");
}

export function test_correct_layout_scrollable_content_true_top_edge_does_not_span() {
    const page = new Page();
    (<any>page).scrollableContent = true;
    page.actionBar.title = "ActionBar";
    (<UIViewController>page.viewController).edgesForExtendedLayout = UIRectEdge.Bottom | UIRectEdge.Left | UIRectEdge.Right;

    const tabView = new TabView();
    const tabItem = new TabViewItem();
    tabItem.title = "Item";
    const lbl = new Label();
    (<any>lbl).scrollableContent = true;
    tabItem.view = lbl;
    tabView.items = [tabItem];

    page.content = tabView;
    helper.navigate(() => page);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

    const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
    const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
    const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
    const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

    const pageHeight = getHeight(page);
    const expectedPageHeight = screenHeight - statusBarHeight - navBarHeight;
    TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight - statusBar - navBarHeight");

    const contentHeight = getHeight(lbl);
    TKUnit.assertEqual(contentHeight, expectedPageHeight, "lbl.height !== screenHeight - statusBar - navBarHeight");
}

export function test_correct_layout_scrollable_content_true_bottom_edge_does_not_span() {
    const page = new Page();
    (<any>page).scrollableContent = true;
    page.actionBar.title = "ActionBar";

    const tabView = new TabView();
    const tabItem = new TabViewItem();
    tabItem.title = "Item";
    const lbl = new Label();
    (<any>lbl).scrollableContent = true;
    tabItem.view = lbl;
    tabView.items = [tabItem];
    page.content = tabView;
    
    helper.navigate(() => page);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");
    TKUnit.assertNotNull(lbl.viewController);
    (<UIViewController>lbl.viewController).edgesForExtendedLayout = UIRectEdge.Top | UIRectEdge.Left | UIRectEdge.Right;
    lbl.requestLayout();
    (<UIView>lbl.nativeViewProtected).setNeedsLayout();
    (<UIView>lbl.nativeViewProtected).layoutIfNeeded();
    TKUnit.waitUntilReady(() => lbl.isLayoutValid);
    const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
    const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);

    const pageHeight = getHeight(page);
    TKUnit.assertEqual(pageHeight, screenHeight, "page.height !== screenHeight");

    const contentHeight = getHeight(lbl);
    TKUnit.assertEqual(contentHeight, screenHeight - tabBarHeight, "lbl.height !== screenHeight - tabBarHeight");
}

export function test_correct_layout_top_bottom_edges_does_not_span() {
    const page = new Page();
    page.actionBar.flat = false;
    (<any>page).scrollableContent = false;
    page.actionBar.title = "ActionBar";
    (<UIViewController>page.viewController).edgesForExtendedLayout = UIRectEdge.Left | UIRectEdge.Right;

    const tabView = new TabView();
    (<UIViewController>tabView.viewController).edgesForExtendedLayout = UIRectEdge.Left | UIRectEdge.Right;
    const tabItem = new TabViewItem();
    tabItem.title = "Item";
    const lbl = new Label();
    tabItem.view = lbl;
    tabView.items = [tabItem];

    page.content = tabView;
    helper.navigate(() => page);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

    (<UIViewController>lbl.viewController).edgesForExtendedLayout = UIRectEdge.Left | UIRectEdge.Right;
    lbl.requestLayout();
    (<UIView>lbl.nativeViewProtected).setNeedsLayout();
    (<UIView>lbl.nativeViewProtected).layoutIfNeeded();
    TKUnit.waitUntilReady(() => lbl.isLayoutValid);

    const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
    const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
    const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
    const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

    const assert = (scrollable: boolean, flat: boolean) => {
        page.actionBar.flat = flat;
        (<any>page).scrollableContent = scrollable;
        (<any>lbl).scrollableContent = scrollable;

        lbl.requestLayout();
        TKUnit.waitUntilReady(() => lbl.isLayoutValid);

        const pageHeight = getHeight(page);
        TKUnit.assertEqual(pageHeight, screenHeight - statusBarHeight - navBarHeight, "page.height !== screenHeight - statusBarHeight - navBarHeight");
        const contentHeight = getHeight(lbl);
        TKUnit.assertEqual(contentHeight, screenHeight - statusBarHeight - navBarHeight - tabBarHeight, "lbl.height !== screenHeight - statusBarHeight - navBarHeight - tabBarHeight");
    };

    // scrollable: false, flat: false;
    assert(false, false);
    // scrollable: true, flat: false;
    assert(true, false);
    // scrollable: true, flat: true;
    assert(true, true);
    // scrollable: false, flat: true;
    assert(false, true);
}

export function test_showing_native_viewcontroller_doesnt_throw_exception() {
    let testPage = new Page();
    let loaded = 0;
    let unloaded = 0;
    let navigatingTo = 0;
    let navigatedTo = 0;
    let navigatingFrom = 0;
    let navigatedFrom = 0;

    testPage.on(Page.loadedEvent, () => loaded++);
    testPage.on(Page.unloadedEvent, () => unloaded++);
    testPage.on(Page.navigatingToEvent, () => navigatingTo++);
    testPage.on(Page.navigatedToEvent, () => navigatedTo++);
    testPage.on(Page.navigatingFromEvent, () => navigatingFrom++);
    testPage.on(Page.navigatedFromEvent, () => navigatedFrom++);

    helper.navigate(() => { return testPage; });

    TKUnit.assertEqual(1, navigatingTo, "navigatingTo");
    TKUnit.assertEqual(1, loaded, "navigatingTo");
    TKUnit.assertEqual(1, navigatedTo, "navigatingTo");
    TKUnit.assertEqual(0, navigatingFrom, "navigatingTo");
    TKUnit.assertEqual(0, unloaded, "navigatingTo");
    TKUnit.assertEqual(0, navigatedFrom, "navigatingTo");

    let page = new Page();
    let navcontroller = <UINavigationController>topmost().ios.controller;

    let completed = false;
    navcontroller.presentViewControllerAnimatedCompletion(page.ios, false, () => completed = true);
    TKUnit.waitUntilReady(() => completed);

    TKUnit.assertEqual(testPage.modal, undefined, "testPage.modal should be null");

    TKUnit.assertEqual(1, navigatingTo, "navigatingTo");
    TKUnit.assertEqual(1, loaded, "navigatingTo");
    TKUnit.assertEqual(1, navigatedTo, "navigatingTo");
    TKUnit.assertEqual(0, navigatingFrom, "navigatingTo");
    TKUnit.assertEqual(0, unloaded, "navigatingTo");
    TKUnit.assertEqual(0, navigatedFrom, "navigatingTo");

    completed = false;
    let controller = <UIViewController>page.ios;
    controller.dismissViewControllerAnimatedCompletion(false, () => completed = true);
    TKUnit.waitUntilReady(() => completed);

    TKUnit.assertEqual(1, navigatingTo, "navigatingTo");
    TKUnit.assertEqual(1, loaded, "navigatingTo");
    TKUnit.assertEqual(1, navigatedTo, "navigatingTo");
    TKUnit.assertEqual(0, navigatingFrom, "navigatingTo");
    TKUnit.assertEqual(0, unloaded, "navigatingTo");
    TKUnit.assertEqual(0, navigatedFrom, "navigatingTo");
}