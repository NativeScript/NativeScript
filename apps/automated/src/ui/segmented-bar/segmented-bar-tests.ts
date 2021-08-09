import * as TKUnit from '../../tk-unit';
import * as segmentedBarTestsNative from './segmented-bar-tests-native';
import { buildUIAndRunTest } from '../../ui-helper';
import { View } from '@nativescript/core/ui/core/view';
import { BindingOptions } from '@nativescript/core/ui/core/bindable';
import { Observable } from '@nativescript/core/data/observable';
import { Color } from '@nativescript/core/color';
import * as helper from '../../ui-helper';

// >> article-require-segmentedbar-module
import * as segmentedBarModule from '@nativescript/core/ui/segmented-bar';
// << article-require-segmentedbar-module

function _createSegmentedBar(): segmentedBarModule.SegmentedBar {
	// >> article-create-segmentedbar
	var segmentedBar = new segmentedBarModule.SegmentedBar();
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
	var items = new Array<segmentedBarModule.SegmentedBarItem>();
	for (var i = 0; i < count; i++) {
		let bar = new segmentedBarModule.SegmentedBarItem();
		bar.title = i + '';
		items.push(bar);
	}

	return items;
}

export var testWhenSegmentedBarIsCreatedItemsAreUndefined = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		var expectedValue = undefined;
		var actualValue = segmentedBar.items;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testWhenSegmentedBarIsCreatedSelectedIndexIsUndefined = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		var expectedValue = -1;
		var actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeItemsIsCreated = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		var expectedValue = segmentedBar.items.length;
		var actualValue = segmentedBarTestsNative.getNativeItemsCount(segmentedBar);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testWhenItemsAreBoundTheTextColorIsPreserved = function () {
	var segmentedBar = _createSegmentedBar();
	segmentedBar.color = new Color('red');

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		segmentedBar.color = new Color('red');

		var model = new Observable();
		let firstSegmentedBarItem = new segmentedBarModule.SegmentedBarItem();
		firstSegmentedBarItem.title = 'One';
		let secondSegmentedBarItem = new segmentedBarModule.SegmentedBarItem();
		secondSegmentedBarItem.title = 'Two';
		let thirdSegmentedBarItem = new segmentedBarModule.SegmentedBarItem();
		thirdSegmentedBarItem.title = 'Three';
		model.set('items', [firstSegmentedBarItem, secondSegmentedBarItem, thirdSegmentedBarItem]);
		var options: BindingOptions = {
			sourceProperty: 'items',
			targetProperty: 'items',
		};

		segmentedBar.bind(options, model);

		TKUnit.assert(segmentedBarTestsNative.checkNativeItemsTextColor(segmentedBar), 'Items text color not preserved' + '; Expected: ' + segmentedBar.color);
	});
};

export var testWhenSettingItemsToEmptyArrayZeroNativeItemsAreCreated = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = [];
		var expectedValue = segmentedBar.items.length;
		var actualValue = segmentedBarTestsNative.getNativeItemsCount(segmentedBar);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		// >> article-creating-segmentedbar-items
		var items = [];
		var item1 = new segmentedBarModule.SegmentedBarItem();
		item1.title = 'Item1';
		items.push(item1);
		var item2 = new segmentedBarModule.SegmentedBarItem();
		item2.title = 'Item2';
		items.push(item2);
		var item3 = new segmentedBarModule.SegmentedBarItem();
		item3.title = 'Item3';
		items.push(item3);
		segmentedBar.items = items;
		// << article-creating-segmentedbar-items
		var expectedValue = 0;
		var actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		// >> artcile-selecting-item
		segmentedBar.selectedIndex = 9;
		// << artcile-selecting-item
		segmentedBar.items = [];
		var expectedValue = -1;
		var actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToUndefined = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		segmentedBar.selectedIndex = 9;
		segmentedBar.items = undefined;
		var expectedValue = -1;
		var actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToNull = function () {
	buildUIAndRunTest(_createSegmentedBar(), function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		segmentedBar.items = _createItems(10);
		segmentedBar.selectedIndex = 9;
		segmentedBar.items = null;
		var expectedValue = -1;
		var actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
	var segmentedBar = _createSegmentedBar();
	var expectedValue = 10;
	segmentedBar.items = _createItems(expectedValue);
	segmentedBar.selectedIndex = 9;
	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		var actualValue = segmentedBar.items.length;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
	var segmentedBar = _createSegmentedBar();
	segmentedBar.items = _createItems(10);
	var expectedValue = 9;
	segmentedBar.selectedIndex = expectedValue;
	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];
		var actualValue = segmentedBar.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexChangedIsReisedCorrectlyIfSelectedIndexIsSet = function () {
	var oldIndex;
	var newIndex;
	var segmentedBar = _createSegmentedBar();

	segmentedBar.on(segmentedBarModule.SegmentedBar.selectedIndexChangedEvent, (args: segmentedBarModule.SelectedIndexChangedEventData) => {
		oldIndex = args.oldIndex;
		newIndex = args.newIndex;
	});

	segmentedBar.items = _createItems(10);

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];

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

export var testSelectedIndexChangedIsReisedCorrectlyIfSelectedIndexIsSetNative = function () {
	var oldIndex;
	var newIndex;
	var segmentedBar = _createSegmentedBar();

	segmentedBar.on(segmentedBarModule.SegmentedBar.selectedIndexChangedEvent, (args: segmentedBarModule.SelectedIndexChangedEventData) => {
		oldIndex = args.oldIndex;
		newIndex = args.newIndex;
	});

	segmentedBar.items = _createItems(10);

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		var segmentedBar = <segmentedBarModule.SegmentedBar>views[0];

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

export var testSelectedIndexChangedIsRaisedCorrectlyIfItemsNotBound = function () {
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
	let segmentedBar = new segmentedBarModule.SegmentedBar();
	let item = new segmentedBarModule.SegmentedBarItem();
	(<any>item).title = 1;
	segmentedBar.items = [item];

	buildUIAndRunTest(segmentedBar, function (views: Array<View>) {
		TKUnit.assertEqual(item.title, '1');
	});
}
