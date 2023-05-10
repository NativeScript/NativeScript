import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import {
	Page,
	isAndroid,
	Frame,
	NavigationEntry,
	Application,
	TabView,
	TabViewItem,
} from '@nativescript/core';

function waitUntilTabViewReady(page: Page, action: Function) {
	helper.waitUntilNavigatedTo(page, action);

	if (isAndroid) {
		TKUnit.waitUntilReady(() => page.frame._currentEntry.fragment.isAdded());
	}
}

function createTestFrameRootEntry() {
	const page = new Page();
	const frameRoot = new Frame();
	frameRoot.navigate(() => page);

	const entry: NavigationEntry = {
		create: () => frameRoot,
	};

	return {
		entry: entry,
		root: frameRoot,
		page: page,
	};
}

function createTestTabRootEntry() {
	const testFrameRoot1 = createTestFrameRootEntry();
	const testFrameRoot2 = createTestFrameRootEntry();

	const tabView = new TabView();
	const tabEntry1 = new TabViewItem();
	tabEntry1.title = 'frameRoot1';
	tabEntry1.view = testFrameRoot1.root;
	const tabEntry2 = new TabViewItem();
	tabEntry2.title = 'frameRoot2';
	tabEntry2.view = testFrameRoot2.root;
	tabView.items = [tabEntry1, tabEntry2];

	const entry: NavigationEntry = {
		create: () => tabView,
	};

	return {
		entry: entry,
		root: tabView,
		page: testFrameRoot1.page,
	};
}

export function test_reset_frame_to_frame() {
	const testFrameRoot1 = createTestFrameRootEntry();

	helper.waitUntilNavigatedTo(testFrameRoot1.page, () =>
		Application.resetRootView(testFrameRoot1.entry)
	);

	const rootView1 = Application.getRootView();
	const frameStack1 = Frame._stack();
	TKUnit.assertEqual(rootView1, testFrameRoot1.root);
	TKUnit.assertEqual(frameStack1.length, 1);

	const testFrameRoot2 = createTestFrameRootEntry();

	helper.waitUntilNavigatedTo(testFrameRoot2.page, () =>
		Application.resetRootView(testFrameRoot2.entry)
	);

	const rootView2 = Application.getRootView();
	const frameStack2 = Frame._stack();
	TKUnit.assertEqual(rootView2, testFrameRoot2.root);
	TKUnit.assertEqual(frameStack2.length, 1);
}

export function test_reset_frame_to_tab() {
	const testFrameRoot = createTestFrameRootEntry();

	helper.waitUntilNavigatedTo(testFrameRoot.page, () =>
		Application.resetRootView(testFrameRoot.entry)
	);

	const rootView1 = Application.getRootView();
	const frameStack1 = Frame._stack();
	TKUnit.assertEqual(rootView1, testFrameRoot.root);
	TKUnit.assertEqual(frameStack1.length, 1);

	const testTabRoot = createTestTabRootEntry();

	waitUntilTabViewReady(testTabRoot.page, () =>
		Application.resetRootView(testTabRoot.entry)
	);

	const rootView2 = Application.getRootView();
	const frameStack2 = Frame._stack();
	TKUnit.assertEqual(rootView2, testTabRoot.root);
	TKUnit.assertEqual(frameStack2.length, 2);
}

export function test_reset_tab_to_frame() {
	const testTabRoot = createTestTabRootEntry();

	waitUntilTabViewReady(testTabRoot.page, () =>
		Application.resetRootView(testTabRoot.entry)
	);

	const rootView2 = Application.getRootView();
	const frameStack2 = Frame._stack();
	TKUnit.assertEqual(rootView2, testTabRoot.root);
	TKUnit.assertEqual(frameStack2.length, 2);

	const testFrameRoot = createTestFrameRootEntry();

	helper.waitUntilNavigatedTo(testFrameRoot.page, () =>
		Application.resetRootView(testFrameRoot.entry)
	);

	const rootView1 = Application.getRootView();
	const frameStack1 = Frame._stack();
	TKUnit.assertEqual(rootView1, testFrameRoot.root);
	TKUnit.assertEqual(frameStack1.length, 1);
}

export function test_reset_tab_to_tab() {
	const testTabRoot1 = createTestTabRootEntry();

	waitUntilTabViewReady(testTabRoot1.page, () =>
		Application.resetRootView(testTabRoot1.entry)
	);

	const rootView1 = Application.getRootView();
	const frameStack1 = Frame._stack();
	TKUnit.assertEqual(rootView1, testTabRoot1.root);
	TKUnit.assertEqual(frameStack1.length, 2);

	const testTabRoot2 = createTestTabRootEntry();

	waitUntilTabViewReady(testTabRoot2.page, () =>
		Application.resetRootView(testTabRoot2.entry)
	);

	const rootView2 = Application.getRootView();
	const frameStack2 = Frame._stack();
	TKUnit.assertEqual(rootView2, testTabRoot2.root);
	TKUnit.assertEqual(frameStack2.length, 2);
}

export function test_reset_during_tab_index_change() {
	const testTabRoot = createTestTabRootEntry();

	waitUntilTabViewReady(testTabRoot.page, () =>
		Application.resetRootView(testTabRoot.entry)
	);

	testTabRoot.root.selectedIndex = 1;

	const testFrameRoot = createTestFrameRootEntry();

	helper.waitUntilNavigatedTo(testFrameRoot.page, () =>
		Application.resetRootView(testFrameRoot.entry)
	);

	TKUnit.assertTrue(true);
}

export function tearDownModule() {
	// reset the root to frame for other tests
	const resetFrameRoot = createTestFrameRootEntry();

	Application.resetRootView(resetFrameRoot.entry);
	TKUnit.waitUntilReady(() => resetFrameRoot.page.isLoaded);
}
