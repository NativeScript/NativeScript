import * as TKUnit from '../../tk-unit';
import * as segmentedBarTestsNative from './segmented-bar-tests-native';
import { buildUIAndRunTest } from '../../ui-helper';
import { Color, Observable, BindingOptions, View, Utils } from '@nativescript/core';
import * as helper from '../../ui-helper';

// >> article-require-segmentedbar-module
import * as segmentedBarModule from '@nativescript/core/ui/segmented-bar';
// << article-require-segmentedbar-module

function _createSegmentedBar(): segmentedBarModule.SegmentedBar {
	// >> article-create-segmentedbar
	const segmentedBar = new segmentedBarModule.SegmentedBar();
	// << article-create-segmentedbar
	segmentedBar.id = 'SegmentedBar';

	return segmentedBar;
}

export function test_recycling() {
	const setters = new Map<string, Array<any>>();
	setters.set('items', _createItems(3));
	helper.nativeView_recycling_test(() => new segmentedBarModule.SegmentedBar(), null, null, setters);
}

function _createItems(count: number): Array<segmentedBarModule.SegmentedBarItem> {
	const items = new Array<segmentedBarModule.SegmentedBarItem>();
	for (let i = 0; i < count; i++) {
		const bar = new segmentedBarModule.SegmentedBarItem();
		bar.title = i + '';
		items.push(bar);
	}

	return items;
}

function collectJsAndJavaGarbage() {
	for (let i = 0; i < 3; i++) {
		Utils.GC();
		if (__ANDROID__) {
			java.lang.System.gc();
			java.lang.System.runFinalization();
		}
		TKUnit.wait(0.05);
	}
}

export function test_SelectingTabsAfterGarbageCollection_CreatesTheirContent() {
	const segmentedBar = _createSegmentedBar();
	segmentedBar.items = _createItems(3);
	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		const bar = <segmentedBarModule.SegmentedBar>views[0];
		collectJsAndJavaGarbage();
		bar.selectedIndex = 2;
		collectJsAndJavaGarbage();
		bar.selectedIndex = 1;
		TKUnit.assertEqual(bar.selectedIndex, 1, 'selectedIndex');
		TKUnit.assertEqual(segmentedBarTestsNative.getNativeItemsCount(bar), 3, 'native items');
	});
}

export const testWhenSegmentedBarIsCreatedItemsAreUndefined = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		const expectedValue = undefined;
		const actualValue = segmentedBar.items;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testWhenSegmentedBarIsCreatedSelectedIndexIsUndefined = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		const expectedValue = -1;
		const actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeItemsIsCreated = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		const expectedValue = segmentedBar.items.length;
		const actualValue = segmentedBarTestsNative.getNativeItemsCount(segmentedBar);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testWhenItemsAreBoundTheTextColorIsPreserved = function () {
	const segmentedBar = _createSegmentedBar();
	segmentedBar.color = new Color('red');

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		segmentedBar.color = new Color('red');

		const model = new Observable();
		const firstSegmentedBarItem = new segmentedBarModule.SegmentedBarItem();
		firstSegmentedBarItem.title = 'One';
		const secondSegmentedBarItem = new segmentedBarModule.SegmentedBarItem();
		secondSegmentedBarItem.title = 'Two';
		const thirdSegmentedBarItem = new segmentedBarModule.SegmentedBarItem();
		thirdSegmentedBarItem.title = 'Three';
		model.set('items', [firstSegmentedBarItem, secondSegmentedBarItem, thirdSegmentedBarItem]);
		const options: BindingOptions = {
			sourceProperty: 'items',
			targetProperty: 'items',
		};

		segmentedBar.bind(options, model);

		TKUnit.assert(segmentedBarTestsNative.checkNativeItemsTextColor(segmentedBar), 'Items text color not preserved' + '; Expected: ' + segmentedBar.color);
	});
};

export const testWhenSettingItemsToEmptyArrayZeroNativeItemsAreCreated = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = [];
		const expectedValue = segmentedBar.items.length;
		const actualValue = segmentedBarTestsNative.getNativeItemsCount(segmentedBar);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		// >> article-creating-segmentedbar-items
		const items = [];
		const item1 = new segmentedBarModule.SegmentedBarItem();
		item1.title = 'Item1';
		items.push(item1);
		const item2 = new segmentedBarModule.SegmentedBarItem();
		item2.title = 'Item2';
		items.push(item2);
		const item3 = new segmentedBarModule.SegmentedBarItem();
		item3.title = 'Item3';
		items.push(item3);
		segmentedBar.items = items;
		// << article-creating-segmentedbar-items
		const expectedValue = 0;
		const actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		// >> artcile-selecting-item
		segmentedBar.selectedIndex = 9;
		// << artcile-selecting-item
		segmentedBar.items = [];
		const expectedValue = -1;
		const actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testSelectedIndexBecomesUndefinedWhenItemsBoundToUndefined = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		segmentedBar.selectedIndex = 9;
		segmentedBar.items = undefined;
		const expectedValue = -1;
		const actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testSelectedIndexBecomesUndefinedWhenItemsBoundToNull = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		segmentedBar.selectedIndex = 9;
		segmentedBar.items = null;
		const expectedValue = -1;
		const actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
	const segmentedBar = _createSegmentedBar();
	const expectedValue = 10;
	segmentedBar.items = _createItems(expectedValue);
	segmentedBar.selectedIndex = 9;
	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		const actualValue = segmentedBar.items.length;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
	const segmentedBar = _createSegmentedBar();
	segmentedBar.items = _createItems(10);
	const expectedValue = 9;
	segmentedBar.selectedIndex = expectedValue;
	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		const actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export const testSelectedIndexChangedIsReisedCorrectlyIfSelectedIndexIsSet = function () {
	let oldIndex;
	let newIndex;
	const segmentedBar = _createSegmentedBar();

	segmentedBar.on(segmentedBarModule.SegmentedBar.selectedIndexChangedEvent, (args: segmentedBarModule.SelectedIndexChangedEventData) => {
		oldIndex = args.oldIndex;
		newIndex = args.newIndex;
	});

	segmentedBar.items = _createItems(10);

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];

		segmentedBar.selectedIndex = 6;
		TKUnit.assertEqual(oldIndex, 0);
		TKUnit.assertEqual(newIndex, 6);

		segmentedBar.selectedIndex = 3;
		TKUnit.assertEqual(oldIndex, 6);
		TKUnit.assertEqual(newIndex, 3);

		segmentedBar.selectedIndex = 9;
		TKUnit.assertEqual(oldIndex, 3);
		TKUnit.assertEqual(newIndex, 9);
	});
};

export const testSelectedIndexChangedIsReisedCorrectlyIfSelectedIndexIsSetNative = function () {
	let oldIndex;
	let newIndex;
	const segmentedBar = _createSegmentedBar();

	segmentedBar.on(segmentedBarModule.SegmentedBar.selectedIndexChangedEvent, (args: segmentedBarModule.SelectedIndexChangedEventData) => {
		oldIndex = args.oldIndex;
		newIndex = args.newIndex;
	});

	segmentedBar.items = _createItems(10);

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		const segmentedBar = <segmentedBarModule.SegmentedBar>views[0];

		segmentedBarTestsNative.setNativeSelectedIndex(segmentedBar, 6);
		TKUnit.assertEqual(oldIndex, 0);
		TKUnit.assertEqual(newIndex, 6);

		segmentedBarTestsNative.setNativeSelectedIndex(segmentedBar, 3);
		TKUnit.assertEqual(oldIndex, 6);
		TKUnit.assertEqual(newIndex, 3);

		segmentedBarTestsNative.setNativeSelectedIndex(segmentedBar, 9);
		TKUnit.assertEqual(oldIndex, 3);
		TKUnit.assertEqual(newIndex, 9);
	});
};

export const testSelectedIndexChangedIsRaisedCorrectlyIfItemsNotBound = function () {
	const segmentedBar = _createSegmentedBar();
	let newSelectedIndex = 0;
	segmentedBar.on(segmentedBarModule.SegmentedBar.selectedIndexChangedEvent, () => {
		newSelectedIndex = segmentedBar.selectedIndex;
	});

	const item0 = new segmentedBarModule.SegmentedBarItem();
	item0.title = 'item 0';
	segmentedBar._addChildFromBuilder('SegmentedBarItem', item0);

	const item1 = new segmentedBarModule.SegmentedBarItem();
	item1.title = 'item 1';
	segmentedBar._addChildFromBuilder('SegmentedBarItem', item1);

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		TKUnit.assertEqual(segmentedBar.items.length, 2);

		segmentedBarTestsNative.setNativeSelectedIndex(segmentedBar, 1);
		TKUnit.assertEqual(newSelectedIndex, 1);
	});
};

export function test_SettingNumberAsTitleFromXML_DoesNotThrow() {
	const segmentedBar = new segmentedBarModule.SegmentedBar();
	const item = new segmentedBarModule.SegmentedBarItem();
	(<any>item).title = 1;
	segmentedBar.items = [item];

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		TKUnit.assertEqual(item.title, '1');
	});
}

export function test_SettingTheSameItemsToAnotherSegmentedBar_DoesNotThrow() {
	const items = _createItems(3);
	const firstBar = _createSegmentedBar();

	buildUIAndRunTest(firstBar, function (views: Array<View>) {
		firstBar.items = items;

		const secondBar = _createSegmentedBar();
		secondBar.items = items;

		items.forEach((item, i) => TKUnit.assertEqual(item.parent, secondBar, `Item ${i} should be parented to the SegmentedBar it was last assigned to.`));
	});
}

export function test_SettingTheItemsOfATornDownSegmentedBarToANewOne_DoesNotThrow() {
	const items = _createItems(3);
	const firstBar = _createSegmentedBar();

	buildUIAndRunTest(firstBar, function (views: Array<View>) {
		firstBar.items = items;
	});

	// The test above leaves the page without content, so firstBar is torn down while its items still point at it.
	const secondBar = _createSegmentedBar();

	buildUIAndRunTest(secondBar, function (views: Array<View>) {
		secondBar.items = items;

		items.forEach((item, i) => TKUnit.assertEqual(item.parent, secondBar, `Item ${i} should be parented to the SegmentedBar it was last assigned to.`));
		TKUnit.assertEqual(segmentedBarTestsNative.getNativeItemsCount(secondBar), items.length, 'Native items should be created for the SegmentedBar the items were re-assigned to.');
	});
}

/*export function testBackgroundColorUpdatedAfterItemSelected() {
    let segmentedBar = new segmentedBarModule.SegmentedBar();
	let item1 = new segmentedBarModule.SegmentedBarItem();
	(<any>item1).title = 1;
	let item2 = new segmentedBarModule.SegmentedBarItem();
	(<any>item2).title = 2;
	let item3 = new segmentedBarModule.SegmentedBarItem();
	(<any>item3).title = 3;
	let item4 = new segmentedBarModule.SegmentedBarItem();
	(<any>item4).title = 4;

	segmentedBar.items = [item1, item2, item3, item4];

    buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		TKUnit.assertTrue(segmentedBarTestsNative.checkBackgroundColorUpdatedAfterItemSelected(segmentedBar));
	});
}*/
