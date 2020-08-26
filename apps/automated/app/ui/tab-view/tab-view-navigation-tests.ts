import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { isIOS, isAndroid } from '@nativescript/core/platform';
import { Label } from '@nativescript/core/ui/label';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { Frame } from '@nativescript/core/ui/frame';
import { Page } from '@nativescript/core/ui/page';
import { ListView, ItemEventData } from '@nativescript/core/ui/list-view';
import { TabView, TabViewItem } from '@nativescript/core/ui/tab-view';
import { Button } from '@nativescript/core/ui/button';

var ASYNC = 2;

function _createTabView(): TabView {
	var tabView = new TabView();
	tabView.id = 'TabView';

	return tabView;
}

function _createItems(count: number): Array<TabViewItem> {
	var items = new Array<TabViewItem>();
	for (var i = 0; i < count; i++) {
		var label = new Label();
		label.text = 'Tab ' + i;
		var tabEntry = new TabViewItem();
		tabEntry.title = 'Tab ' + i;
		tabEntry.view = label;
		tabEntry['index'] = i;
		items.push(tabEntry);
	}

	return items;
}

function _createListView(): ListView {
	var listView = new ListView();
	listView.id = 'ListView';
	var items = Array.apply(null, Array(10)).map(function (_, i) {
		return i;
	});

	listView.on(ListView.itemLoadingEvent, function (args: ItemEventData) {
		var button = <Button>args.view;
		if (!button) {
			button = new Button();
			button.on(Button.tapEvent, _clickHandlerFactory(args.index));
			args.view = button;
		}

		button.text = 'Button' + args.index;
		button.id = button.text;
	});

	listView.items = items;

	return listView;
}

function _clickHandlerFactory(index: number) {
	return function () {
		var pageFactory = function (): Page {
			var detailsLabel = new Label();
			detailsLabel.text = 'Details Page ' + index;
			var detailsPage = new Page();
			detailsPage.id = 'details-page';
			detailsPage.content = detailsLabel;

			return detailsPage;
		};

		helper.navigateWithHistory(pageFactory);
	};
}

function _createFrameView(): Frame {
	const frame = new Frame();
	frame.navigate({ create: () => new Page() });

	return frame;
}

export function testBackNavigationToTabViewWithNestedFramesShouldWork() {
	// https://github.com/NativeScript/NativeScript/issues/6490
	const topFrame = Frame.topmost();

	let tabViewPage: Page;
	let tabView: TabView;

	const pageFactory = function (): Page {
		tabView = _createTabView();
		let items = Array<TabViewItem>();
		let tabViewitem = new TabViewItem();
		tabViewitem.title = 'Item1';
		tabViewitem.view = _createFrameView();
		items.push(tabViewitem);

		let tabViewitem2 = new TabViewItem();
		tabViewitem2.title = 'Item2';
		tabViewitem2.view = _createFrameView();
		items.push(tabViewitem2);

		tabView.items = items;

		tabViewPage = new Page();
		tabViewPage.id = 'tab-view-page';
		tabViewPage.content = tabView;

		return tabViewPage;
	};

	helper.waitUntilNavigatedFrom(() => topFrame.navigate(pageFactory), topFrame);

	TKUnit.waitUntilReady(() => topFrame.currentPage === tabViewPage);
	TKUnit.waitUntilReady(() => tabViewIsFullyLoaded(tabView));

	// navigate to a different page
	helper.waitUntilNavigatedFrom(() => topFrame.navigate({ create: () => new Page(), animated: false }), topFrame);

	// navigate back to the page that hold the tabview with nested frames
	topFrame.goBack();

	// make sure the app did not crash
	TKUnit.waitUntilReady(() => topFrame.navigationQueueIsEmpty());
}

export function testWhenNavigatingBackToANonCachedPageContainingATabViewWithAListViewTheListViewIsThere() {
	var topFrame = Frame.topmost();

	let tabViewPage: Page;
	let tabView: TabView;

	let pageFactory = function (): Page {
		tabView = _createTabView();
		let items = Array<TabViewItem>();
		let tabViewitem = new TabViewItem();
		tabViewitem.title = 'List';
		tabViewitem.view = _createListView();
		items.push(tabViewitem);

		let label = new Label();
		label.text = 'About';
		let aboutLayout = new StackLayout();
		aboutLayout.id = 'AboutLayout';
		aboutLayout.addChild(label);
		tabViewitem = new TabViewItem();
		tabViewitem.title = 'About';
		tabViewitem.view = aboutLayout;
		items.push(tabViewitem);

		tabView.items = items;

		tabViewPage = new Page();
		tabViewPage.id = 'tab-view-page';
		tabViewPage.content = tabView;

		return tabViewPage;
	};

	let rootPage = helper.getCurrentPage();

	helper.navigateWithHistory(pageFactory);
	TKUnit.waitUntilReady(() => topFrame.currentPage === tabViewPage);
	TKUnit.waitUntilReady(() => tabViewIsFullyLoaded(tabView));

	// This will navigate to a details page. The wait is inside the method.
	_clickTheFirstButtonInTheListViewNatively(tabView);

	Frame.goBack();
	TKUnit.waitUntilReady(() => topFrame.navigationQueueIsEmpty()); //() => topFrame.currentPage === tabViewPage);

	Frame.goBack();

	TKUnit.waitUntilReady(() => topFrame.currentPage === rootPage);

	TKUnit.assert(tabView.items[0].view instanceof ListView, 'ListView should be created when navigating back to the main page.');
}

function tabViewIsFullyLoaded(tabView: TabView): boolean {
	if (!tabView.isLoaded) {
		return false;
	}

	const i = tabView.selectedIndex;
	if (i >= 0 && !tabView.items[i].isLoaded) {
		return false;
	}

	if (tabView.android) {
		var viewPager: androidx.viewpager.widget.ViewPager = (<any>tabView)._viewPager;
		if (viewPager.getChildCount() === 0) {
			return false;
		}
	}

	return true;
}

export function testLoadedAndUnloadedAreFired_WhenNavigatingAwayAndBack() {
	let topFrame = Frame.topmost();
	let rootPage = helper.getCurrentPage();

	let itemCount = 2;
	let loadedEventsCount = [0, 0];
	let unloadedEventsCount = [0, 0];

	const tabView = _createTabView();
	tabView.items = _createItems(itemCount);

	function createLoadedFor(tabIndex: number) {
		return function () {
			loadedEventsCount[tabIndex] = loadedEventsCount[tabIndex] + 1;
		};
	}

	function createUnloadedFor(tabIndex: number) {
		return function () {
			unloadedEventsCount[tabIndex] = unloadedEventsCount[tabIndex] + 1;
		};
	}

	tabView.items.forEach((item, i) => {
		item.view.on('loaded', createLoadedFor(i));
		item.view.on('unloaded', createUnloadedFor(i));
	});

	const tabViewPage = new Page();
	helper.navigateWithHistory(() => {
		tabViewPage.content = tabView;

		return tabViewPage;
	});
	TKUnit.waitUntilReady(() => tabViewIsFullyLoaded(tabView), ASYNC);

	const detailsPage = new Page();
	helper.navigateWithHistory(() => detailsPage);
	TKUnit.assertEqual(topFrame.currentPage, detailsPage);

	helper.goBack();
	TKUnit.assertEqual(topFrame.currentPage, tabViewPage);

	for (let i = 0; i < itemCount; i++) {
		tabView.items[i].view.off('loaded');
		tabView.items[i].view.off('unloaded');
	}

	helper.goBack();
	TKUnit.assertEqual(topFrame.currentPage, rootPage);

	topFrame.currentPage.id = null;

	if (isIOS) {
		TKUnit.arrayAssert(loadedEventsCount, [2, 0]);
		TKUnit.arrayAssert(unloadedEventsCount, [1, 0]);
	}

	if (isAndroid) {
		TKUnit.arrayAssert(loadedEventsCount, [2, 2]);
		TKUnit.arrayAssert(unloadedEventsCount, [1, 1]);
	}
}

function _clickTheFirstButtonInTheListViewNatively(tabView: TabView) {
	if (tabView.android) {
		var viewPager: androidx.viewpager.widget.ViewPager = (<any>tabView)._viewPager;
		var androidListView = <android.widget.ListView>viewPager.getChildAt(0);
		var stackLayout = <org.nativescript.widgets.StackLayout>androidListView.getChildAt(0);
		var button = <android.widget.Button>stackLayout.getChildAt(0);
		button.performClick();
	} else {
		const tableView = <UITableView>tabView.ios.selectedViewController.view.subviews[0];
		const cell = <UITableViewCell>tableView.cellForRowAtIndexPath(NSIndexPath.indexPathForItemInSection(0, 0));
		const btn = <UIButton>cell.contentView.subviews[0];
		btn.sendActionsForControlEvents(UIControlEvents.TouchUpInside);
	}
}
