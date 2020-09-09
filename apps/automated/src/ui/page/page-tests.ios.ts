import { Page, View, EventData, Label, Frame } from '@nativescript/core';
import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { addLabelToPage } from './page-tests-common';

export * from './page-tests-common';

export function test_NavigateToNewPage_InnerControl() {
	var testPage: Page;
	var pageFactory = function (): Page {
		testPage = new Page();
		addLabelToPage(testPage);

		return testPage;
	};

	helper.navigateWithHistory(pageFactory);
	var label = <Label>testPage.content;

	helper.goBack();

	TKUnit.assertNull(label._context, 'label._context should be undefined after navigate back.');
	TKUnit.assertNull(label.android, 'label.android should be undefined after navigate back.');
	TKUnit.assertFalse(label.isLoaded, 'label.isLoaded should become false after navigating back');
}

export function test_WhenShowingModalPageUnloadedIsNotFiredForTheMasterPage() {
	let masterPage: Page;
	let masterPageUnloaded = false;
	let modalPage: Page;

	let modalUnloaded = 0;
	let onModalUnloaded = function (args: EventData) {
		modalUnloaded++;
		modalPage.off(Page.unloadedEvent, onModalUnloaded);
	};

	var navigatedToEventHandler = function (args) {
		modalPage = masterPage.showModal('ui/page/modal-page', { context: null, closeCallback: null, fullscreen: false }) as Page;
		modalPage.on(Page.unloadedEvent, onModalUnloaded);
	};

	var unloadedEventHandler = function (args) {
		masterPageUnloaded = true;
	};

	var masterPageFactory = function (): Page {
		masterPage = new Page();
		masterPage.id = 'master-page';
		masterPage.on(Page.navigatedToEvent, navigatedToEventHandler);
		masterPage.on(View.unloadedEvent, unloadedEventHandler);
		var label = new Label();
		label.text = 'Modal Page';
		masterPage.content = label;

		return masterPage;
	};

	helper.navigate(masterPageFactory);
	TKUnit.waitUntilReady(() => modalUnloaded > 0);
	TKUnit.assert(!masterPageUnloaded, "Master page should not raise 'unloaded' when showing modal!");
	masterPage.off(View.loadedEvent, navigatedToEventHandler);
	masterPage.off(View.unloadedEvent, unloadedEventHandler);
}

// function getHeight(view: View): number {
//     const bounds = view._getCurrentLayoutBounds();
//     return bounds.bottom - bounds.top;
// }

// function getNativeHeight(view: View): number {
//     const bounds = view.nativeViewProtected.frame;
//     return layout.toDevicePixels(bounds.size.height);
// }

// export function test_correct_layout_top_bottom_edges_does_not_span_not_scrollable_not_flat() {
//     test_correct_layout_top_bottom_edges_does_not_span_options(false, false);
// }

// export function test_correct_layout_top_bottom_edges_does_not_span_scrollable_not_flat() {
//     test_correct_layout_top_bottom_edges_does_not_span_options(true, false);
// }

// export function test_correct_layout_top_bottom_edges_does_not_span_not_scrollable_flat() {
//     test_correct_layout_top_bottom_edges_does_not_span_options(false, true);
// }

// export function test_correct_layout_top_bottom_edges_does_not_span_scrollable_flat() {
//     test_correct_layout_top_bottom_edges_does_not_span_options(true, true);
// }

// export function test_correct_layout_scrollable_content_false() {
//     const page = new Page();
//     topmost().viewController.navigationBar.translucent = true;
//     (<any>page).scrollableContent = false;
//     page.actionBar.title = "ActionBar";
//     page.actionBarHidden = true;

//     const tabView = new TabView();
//     const tabItem = new TabViewItem();
//     tabItem.title = "Item";
//     const lbl = new Label();
//     (<any>lbl).scrollableContent = false;
//     tabItem.view = lbl;
//     tabView.items = [tabItem];

//     page.content = tabView;
//     helper.navigate(() => page);
//     TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

//     const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
//     const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
//     const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);

//     let pageHeight = getHeight(page);
//     let expectedPageHeight = screenHeight;
//     TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

//     let contentHeight = getHeight(lbl);
//     let contentNativeHeight = getNativeHeight(lbl);
//     let expectedLabelHeight = screenHeight - statusBarHeight - tabBarHeight;
//     TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar - tabBar");
//     TKUnit.assertEqual(contentNativeHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar - tabBar");

//     page.actionBarHidden = false;
//     TKUnit.waitUntilReady(() => page.isLayoutValid);

//     pageHeight = getHeight(page);
//     const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);
//     expectedPageHeight = screenHeight;
//     TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

//     contentHeight = getHeight(lbl);
//     contentNativeHeight = getNativeHeight(lbl);
//     expectedLabelHeight = screenHeight - statusBarHeight - tabBarHeight - navBarHeight;
//     TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBarHeight - tabBarHeight - navBarHeight");
//     TKUnit.assertEqual(contentNativeHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBarHeight - tabBarHeight - navBarHeight");
// }

// export function test_correct_layout_scrollable_content_true() {
//     const page = new Page();
//     topmost().viewController.navigationBar.translucent = true;
//     (<any>page).scrollableContent = true;
//     page.actionBar.title = "ActionBar";
//     page.actionBarHidden = true;

//     const tabView = new TabView();
//     const tabItem = new TabViewItem();
//     tabItem.title = "Item";
//     const lbl = new Label();
//     (<any>lbl).scrollableContent = true;
//     tabItem.view = lbl;
//     tabView.items = [tabItem];

//     page.content = tabView;
//     helper.navigate(() => page);
//     TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

//     const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
//     const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
//     const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);

//     let pageHeight = getHeight(page);
//     let expectedPageHeight = screenHeight;
//     TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

//     let contentHeight = getHeight(lbl);
//     let expectedLabelHeight = screenHeight - statusBarHeight;
//     TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar");

//     page.actionBarHidden = false;
//     TKUnit.waitUntilReady(() => page.isLayoutValid);

//     pageHeight = getHeight(page);
//     const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);
//     expectedPageHeight = screenHeight;
//     TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight");

//     contentHeight = getHeight(lbl);
//     TKUnit.assertEqual(contentHeight, screenHeight, "lbl.height !== screenHeight");
// }

// export function test_correct_layout_scrollable_content_true_flat_action_bar() {
//     const page = new Page();
//     (<any>page).scrollableContent = true;
//     page.actionBar.title = "ActionBar";
//     page.actionBar.flat = true;

//     const tabView = new TabView();
//     const tabItem = new TabViewItem();
//     tabItem.title = "Item";
//     const lbl = new Label();
//     tabItem.view = lbl;
//     tabView.items = [tabItem];

//     page.content = tabView;
//     helper.navigate(() => page);
//     TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

//     const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
//     const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
//     const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
//     const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

//     const pageHeight = getHeight(page);
//     const expectedPageHeight = screenHeight - statusBarHeight - navBarHeight;
//     TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight - statusBar - navBarHeight");

//     const contentHeight = getHeight(lbl);
//     const expectedLabelHeight = screenHeight - statusBarHeight - navBarHeight - tabBarHeight;
//     TKUnit.assertEqual(contentHeight, expectedLabelHeight, "lbl.height !== screenHeight - statusBar - navBarHeight - tabBarHeight");
//     page.actionBar.flat = false;
// }

// export function test_correct_layout_scrollable_content_true_flat_action_bar_edges_span_under_opaque_bars() {
//     const page = new Page();
//     (<any>page).scrollableContent = true;
//     page.viewController.extendedLayoutIncludesOpaqueBars = true;
//     page.actionBar.title = "ActionBar";
//     page.actionBar.flat = true;

//     const tabView = new TabView();
//     tabView.viewController.tabBar.translucent = false;

//     const tabItem = new TabViewItem();
//     tabItem.title = "Item";
//     const lbl = new Label();
//     (<any>lbl).scrollableContent = true;
//     tabItem.view = lbl;
//     tabView.items = [tabItem];

//     page.content = tabView;
//     helper.navigate(() => page);
//     TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

//     lbl.viewController.extendedLayoutIncludesOpaqueBars = true;
//     lbl.requestLayout();
//     (<UIView>lbl.nativeViewProtected).setNeedsLayout();
//     (<UIView>lbl.nativeViewProtected).layoutIfNeeded();
//     helper.waitUntilLayoutReady(lbl);

//     const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
//     const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
//     const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
//     const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

//     const pageHeight = getHeight(page);
//     TKUnit.assertEqual(pageHeight, screenHeight, "page.height !== screenHeight");

//     const contentHeight = getHeight(lbl);
//     TKUnit.assertEqual(contentHeight, screenHeight, "lbl.height !== screenHeight");
//     page.actionBar.flat = false;
// }

// export function test_correct_layout_scrollable_content_true_top_edge_does_not_span() {
//     const page = new Page();
//     (<any>page).scrollableContent = true;
//     page.actionBar.title = "ActionBar";
//     (<UIViewController>page.viewController).edgesForExtendedLayout = UIRectEdge.Bottom | UIRectEdge.Left | UIRectEdge.Right;

//     const tabView = new TabView();
//     const tabItem = new TabViewItem();
//     tabItem.title = "Item";
//     const lbl = new Label();
//     lbl.viewController = iosView.UILayoutViewController.initWithOwner(new WeakRef(lbl));
//     lbl.viewController.edgesForExtendedLayout = UIRectEdge.Bottom | UIRectEdge.Left | UIRectEdge.Right;
//     (<any>lbl).scrollableContent = true;
//     tabItem.view = lbl;
//     tabView.items = [tabItem];

//     page.content = tabView;
//     helper.navigate(() => page);
//     TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

//     const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
//     const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
//     const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
//     const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

//     const pageHeight = getHeight(page);
//     const expectedPageHeight = screenHeight - statusBarHeight - navBarHeight;
//     TKUnit.assertEqual(pageHeight, expectedPageHeight, "page.height !== screenHeight - statusBar - navBarHeight");

//     const contentHeight = getHeight(lbl);
//     TKUnit.assertEqual(contentHeight, expectedPageHeight, "lbl.height !== screenHeight - statusBar - navBarHeight");
//     (<UIViewController>page.viewController).edgesForExtendedLayout = UIRectEdge.All;
// }

// export function test_correct_layout_scrollable_content_true_bottom_edge_does_not_span() {
//     const page = new Page();
//     (<any>page).scrollableContent = true;
//     page.actionBar.title = "ActionBar";
//     page.viewController.automaticallyAdjustsScrollViewInsets = false;
//     (<UIViewController>page.viewController).edgesForExtendedLayout = UIRectEdge.All;

//     const tabView = new TabView();
//     const tabItem = new TabViewItem();
//     tabItem.title = "Item";
//     const lbl = new Label();
//     lbl.viewController = iosView.UILayoutViewController.initWithOwner(new WeakRef(lbl));
//     lbl.viewController.edgesForExtendedLayout = UIRectEdge.Top | UIRectEdge.Left | UIRectEdge.Right;
//     (<any>lbl).scrollableContent = true;
//     tabItem.view = lbl;
//     tabView.items = [tabItem];
//     page.content = tabView;

//     helper.navigate(() => page);
//     TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");
//     TKUnit.assertNotNull(lbl.viewController);

//     const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
//     const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);

//     const pageHeight = getHeight(page);
//     TKUnit.assertEqual(pageHeight, screenHeight, "page.height !== screenHeight");

//     const contentHeight = getHeight(lbl);
//     TKUnit.assertEqual(contentHeight, screenHeight - tabBarHeight, "lbl.height !== screenHeight - tabBarHeight");
// }

// function test_correct_layout_top_bottom_edges_does_not_span_options(scrollable: boolean, flat: boolean) {
//     const page = new Page();
//     page.actionBar.title = "ActionBar";

//     const tabView = new TabView();
//     const tabItem = new TabViewItem();
//     tabItem.title = "Item";
//     const lbl = new Label();
//     lbl.viewController = iosView.UILayoutViewController.initWithOwner(new WeakRef(lbl));
//     lbl.viewController.edgesForExtendedLayout = UIRectEdge.Left | UIRectEdge.Right;
//     tabItem.view = lbl;
//     tabView.items = [tabItem];

//     page.content = tabView;

//     page.actionBar.flat = flat;
//     (<any>page).scrollableContent = scrollable;
//     (<any>lbl).scrollableContent = scrollable;

//     helper.navigate(() => page);
//     TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

//     const statusBarHeight = uiUtils.ios.getStatusBarHeight(page.viewController);
//     const tabBarHeight = uiUtils.ios.getActualHeight(tabView.viewController.tabBar);
//     const screenHeight = layout.toDevicePixels(UIScreen.mainScreen.bounds.size.height);
//     const navBarHeight = uiUtils.ios.getActualHeight(page.frame.ios.controller.navigationBar);

//     const contentHeight = getHeight(lbl);
//     TKUnit.assertEqual(contentHeight, screenHeight - statusBarHeight - navBarHeight - tabBarHeight, "lbl.height !== screenHeight - statusBarHeight - navBarHeight - tabBarHeight");
// }

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

	helper.navigate(() => testPage);

	TKUnit.assertEqual(1, navigatingTo, 'navigatingTo');
	TKUnit.assertEqual(1, loaded, 'navigatingTo');
	TKUnit.assertEqual(1, navigatedTo, 'navigatingTo');
	TKUnit.assertEqual(0, navigatingFrom, 'navigatingTo');
	TKUnit.assertEqual(0, unloaded, 'navigatingTo');
	TKUnit.assertEqual(0, navigatedFrom, 'navigatingTo');

	let page = new Page();
	let navcontroller = <UINavigationController>Frame.topmost().ios.controller;

	let completed = false;
	navcontroller.presentViewControllerAnimatedCompletion(page.ios, false, () => (completed = true));
	TKUnit.waitUntilReady(() => completed);

	TKUnit.assertEqual(testPage.modal, undefined, 'testPage.modal should be null');

	TKUnit.assertEqual(1, navigatingTo, 'navigatingTo');
	TKUnit.assertEqual(1, loaded, 'navigatingTo');
	TKUnit.assertEqual(1, navigatedTo, 'navigatingTo');
	TKUnit.assertEqual(0, navigatingFrom, 'navigatingTo');
	TKUnit.assertEqual(0, unloaded, 'navigatingTo');
	TKUnit.assertEqual(0, navigatedFrom, 'navigatingTo');

	completed = false;
	let controller = <UIViewController>page.ios;
	controller.dismissViewControllerAnimatedCompletion(false, () => (completed = true));
	TKUnit.waitUntilReady(() => completed);

	TKUnit.assertEqual(1, navigatingTo, 'navigatingTo');
	TKUnit.assertEqual(1, loaded, 'navigatingTo');
	TKUnit.assertEqual(1, navigatedTo, 'navigatingTo');
	TKUnit.assertEqual(0, navigatingFrom, 'navigatingTo');
	TKUnit.assertEqual(0, unloaded, 'navigatingTo');
	TKUnit.assertEqual(0, navigatedFrom, 'navigatingTo');
}
