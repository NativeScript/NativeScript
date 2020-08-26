import * as TKUnit from '../../tk-unit';
import { isAndroid } from '@nativescript/core/platform';
import { _resetRootView } from '@nativescript/core/application/';
import { Frame, NavigationEntry } from '@nativescript/core/ui/frame';
import { Page } from '@nativescript/core/ui/page';
// import { TabView, TabViewItem } from "@nativescript/core/ui/tab-view";
import { BottomNavigation, TabContentItem, TabStrip, TabStripItem } from '@nativescript/core';

function waitUntilNavigatedToMaxTimeout(pages: Page[], action: Function) {
	const maxTimeout = 8;
	let completed = 0;
	function navigatedTo(args) {
		args.object.page.off('navigatedTo', navigatedTo);
		completed++;
	}

	pages.forEach((page) => page.on('navigatedTo', navigatedTo));
	action();
	TKUnit.waitUntilReady(() => completed === pages.length, maxTimeout);
}

function waitUntilTabViewReady(page: Page, action: Function) {
	action();

	if (isAndroid) {
		TKUnit.waitUntilReady(() => page.frame._currentEntry.fragment.isAdded());
	} else {
		TKUnit.waitUntilReady(() => page.isLoaded);
	}
}

function createPage(i: number) {
	const page = new Page();
	page.id = `Tab${i} Frame${i} Page${i}`;

	return page;
}

function createFrame(i: number, page: Page) {
	const frame = new Frame();
	frame.navigate(() => page);
	frame.id = `Tab${i} Frame${i}`;

	return frame;
}

function createTabItem(i: number, frame: Frame) {
	const tabEntry = new TabContentItem();
	// tabEntry.title = "Tab " + i;
	tabEntry.content = frame;
	tabEntry['index'] = i;

	return tabEntry;
}

function createTabItemsWithFrames(count: number) {
	const items = [];

	for (var i = 0; i < count; i++) {
		const page = createPage(i);
		const frame = createFrame(i, page);
		const tabItem = createTabItem(i, frame);

		items.push({ page, frame, tabItem });
	}

	return items;
}

function createTabStrip(count: number): TabStrip {
	const items = new Array<TabStripItem>();
	for (let i = 0; i < count; i++) {
		let tabStripEntry = new TabStripItem();
		tabStripEntry.title = 'Tab ' + i;
		items.push(tabStripEntry);
	}

	const tabStrip = new TabStrip();
	tabStrip.items = items;

	return tabStrip;
}

export function test_frame_topmost_matches_selectedIndex() {
	const items = createTabItemsWithFrames(3);
	const tabView = new BottomNavigation();
	tabView.items = items.map((item) => item.tabItem);
	tabView.tabStrip = createTabStrip(3);

	// iOS cannot preload tab items
	// Android preloads 1 tab item to the sides by default
	// set this to 0, so that both platforms behave the same.
	// tabView.androidOffscreenTabLimit = 0;

	const entry: NavigationEntry = {
		create: () => tabView,
	};

	waitUntilNavigatedToMaxTimeout([items[0].page], () => _resetRootView(entry));
	TKUnit.assertEqual(Frame.topmost().id, 'Tab0 Frame0');

	waitUntilNavigatedToMaxTimeout([items[1].page], () => (tabView.selectedIndex = 1));
	TKUnit.assertEqual(Frame.topmost().id, 'Tab1 Frame1');
}

export function test_no_preloading_on_index_change() {
	let actualEventsRaised = [];

	function resetActualEventsRaised() {
		for (var i = 0; i < actualEventsRaised.length; i++) {
			actualEventsRaised[i] = [];
		}
	}

	function attachEventHandlers(i: number, item) {
		actualEventsRaised.push([]);

		const page = item.page;
		page.on(Page.loadedEvent, () => actualEventsRaised[i].push(`${page.id} loaded`));
		page.on(Page.unloadedEvent, () => actualEventsRaised[i].push(`${page.id} unloaded`));
		page.on(Page.navigatingToEvent, () => actualEventsRaised[i].push(`${page.id} navigatingTo`));
		page.on(Page.navigatingFromEvent, () => actualEventsRaised[i].push(`${page.id} navigatingFrom`));
		page.on(Page.navigatedToEvent, () => actualEventsRaised[i].push(`${page.id} navigatedTo`));
		page.on(Page.navigatedFromEvent, () => actualEventsRaised[i].push(`${page.id} navigatedFrom`));

		const frame = item.frame;
		frame.on(Frame.loadedEvent, () => actualEventsRaised[i].push(`${frame.id} loaded`));
		frame.on(Frame.unloadedEvent, () => actualEventsRaised[i].push(`${frame.id} unloaded`));
	}

	const items = createTabItemsWithFrames(3);

	items.forEach((item, i) => {
		attachEventHandlers(i, item);
	});

	const tabView = new BottomNavigation();
	tabView.items = items.map((item) => item.tabItem);
	tabView.tabStrip = createTabStrip(3);

	const entry: NavigationEntry = {
		create: () => tabView,
	};

	waitUntilNavigatedToMaxTimeout([items[0].page], () => _resetRootView(entry));

	const expectedEventsRaisedAfterTabCreated = [['Tab0 Frame0 loaded', 'Tab0 Frame0 Page0 navigatingTo', 'Tab0 Frame0 Page0 loaded', 'Tab0 Frame0 Page0 navigatedTo'], [], []];

	TKUnit.assertDeepEqual(actualEventsRaised, expectedEventsRaisedAfterTabCreated);

	resetActualEventsRaised();
	waitUntilNavigatedToMaxTimeout([items[2].page], () => (tabView.selectedIndex = 2));

	const expectedEventsRaisedAfterSelectThirdTab = [['Tab0 Frame0 Page0 unloaded', 'Tab0 Frame0 unloaded'], [], ['Tab2 Frame2 loaded', 'Tab2 Frame2 Page2 navigatingTo', 'Tab2 Frame2 Page2 loaded', 'Tab2 Frame2 Page2 navigatedTo']];

	TKUnit.assertDeepEqual(actualEventsRaised, expectedEventsRaisedAfterSelectThirdTab);

	resetActualEventsRaised();

	waitUntilTabViewReady(items[0].page, () => (tabView.selectedIndex = 0));

	const expectedEventsRaisedAfterReturnToFirstTab = [['Tab0 Frame0 Page0 loaded', 'Tab0 Frame0 loaded'], [], ['Tab2 Frame2 Page2 unloaded', 'Tab2 Frame2 unloaded']];

	TKUnit.assertDeepEqual(actualEventsRaised, expectedEventsRaisedAfterReturnToFirstTab);
}

export function tearDownModule() {
	const page = new Page();
	const frame = new Frame();
	frame.navigate(() => page);

	const entry: NavigationEntry = {
		create: () => frame,
	};

	waitUntilNavigatedToMaxTimeout([page], () => _resetRootView(entry));
}
