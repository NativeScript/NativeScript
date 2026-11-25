import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import { View, Application, Utils } from '@nativescript/core';
import * as listPickerTestsNative from './list-picker-tests-native';

// >> article-require-listpicker-module
import * as listPickerModule from '@nativescript/core/ui/list-picker';
// << article-require-listpicker-module

function _createListPicker(): listPickerModule.ListPicker {
	// >> article-create-listpicker
	const listPicker = new listPickerModule.ListPicker();
	// << article-create-listpicker
	listPicker.id = 'ListPicker';

	return listPicker;
}

function _createItems(count: number): Array<number> {
	const items = new Array<number>();
	for (let i = 0; i < count; i++) {
		items.push(i);
	}

	return items;
}

export function test_recycling() {
	helper.nativeView_recycling_test(() => new listPickerModule.ListPicker());
}

export var testWhenlistPickerIsCreatedItemsAreUndefined = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		const expectedValue = undefined;
		const actualValue = listPicker.items;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testWhenlistPickerIsCreatedSelectedIndexIsUndefined = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		const expectedValue = -1;
		const actualValue = listPicker.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeItemsIsCreated = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = _createItems(10);
		const expectedValue = listPicker.items.length;
		const actualValue = listPickerTestsNative.getNativeItemsCount(listPicker);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testWhenSettingItemsToEmptyArrayZeroNativeItemsAreCreated = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = [];
		const expectedValue = listPicker.items.length;
		const actualValue = listPickerTestsNative.getNativeItemsCount(listPicker);
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		// >> article-binding-listpickeritems
		listPicker.items = [1, 2, 3];
		// << article-binding-listpickeritems
		const expectedValue = 0;
		const actualValue = listPicker.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = _createItems(10);
		// >> article-selecting-item
		listPicker.selectedIndex = 9;
		// << article-selecting-item
		listPicker.items = [];
		const expectedValue = -1;
		const actualValue = listPicker.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToUndefined = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = _createItems(10);
		listPicker.selectedIndex = 9;
		listPicker.items = undefined;
		const expectedValue = -1;
		const actualValue = listPicker.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexBecomesUndefinedWhenItemsBoundToNull = function () {
	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = _createItems(10);
		listPicker.selectedIndex = 9;
		listPicker.items = null;
		const expectedValue = -1;
		const actualValue = listPicker.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
	const listPicker = _createListPicker();
	const expectedValue = 10;
	listPicker.items = _createItems(expectedValue);
	listPicker.selectedIndex = 9;
	helper.buildUIAndRunTest(listPicker, function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		const actualValue = listPicker.items.length;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

export var testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
	const listPicker = _createListPicker();
	listPicker.items = _createItems(10);
	const expectedValue = 9;
	listPicker.selectedIndex = expectedValue;
	helper.buildUIAndRunTest(listPicker, function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		const actualValue = listPicker.selectedIndex;
		TKUnit.assert(actualValue === expectedValue, 'Actual: ' + actualValue + '; Expected: ' + expectedValue);
	});
};

// export var testSettingNegativeSelectedIndexShouldThrow = function () {
//     var listPicker = _createListPicker();
//     helper.buildUIAndRunTest(listPicker, function (views: Array<View>) {
//         var listPicker = <listPickerModule.ListPicker>views[0];
//         listPicker.items = _createItems(10);

//         TKUnit.assertThrows(function () {
//             listPicker.selectedIndex = -1;
//         }, "Setting selectedIndex to a negative number should throw.");
//     });
// }

// export var testSettingSelectedIndexLargerThanCountShouldThrow = function () {
//     var listPicker = _createListPicker();
//     helper.buildUIAndRunTest(listPicker, function (views: Array<View>) {
//         var listPicker = <listPickerModule.ListPicker>views[0];
//         listPicker.items = _createItems(10);
//         TKUnit.assertThrows(function () {
//             listPicker.selectedIndex = 10;
//         }, "Setting selectedIndex to a number larger than item count should throw.");
//     });
// }

export var testWhenSelectingAnItemNativelySelectedIndexIsUpdatedProperly = function () {
	const listPicker = _createListPicker();
	const mainPage = helper.getCurrentPage();
	listPicker.items = _createItems(2);
	mainPage.content = listPicker;

	const expectedValue = 1;
	listPickerTestsNative.selectNativeItem(listPicker, expectedValue);
	TKUnit.waitUntilReady(() => listPicker.selectedIndex === 1);

	const actualValue = listPicker.selectedIndex;
	TKUnit.assertEqual(actualValue, expectedValue);
};

export var test_Android_MaxValueIsOneLessThanItemsCount = function () {
	if (!Application.android) {
		return;
	}

	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = ['One', 'Two', 'Three'];
		const expectedValue = listPicker.items.length - 1;
		const actualValue = (listPicker.nativeViewProtected as any).getMaxValue();
		TKUnit.assertEqual(actualValue, expectedValue);
	});
};

export var test_Android_WhenItemsAreEmptyNativeControlDoesNotShowZero = function () {
	if (!Application.android) {
		return;
	}

	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		const expectedValue = ' ';
		const actualValue = (listPicker as any)._editText.getText().toString();
		TKUnit.assertEqual(actualValue, expectedValue);
	});
};

export var test_Android_WhenBoundToSingleElementArrayEditTextIsUpdatedProperly = function () {
	if (!Application.android) {
		return;
	}

	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = ['One'];
		const expectedValue = 'One';
		const actualValue = (listPicker as any)._editText.getText().toString();
		TKUnit.assertEqual(actualValue, expectedValue);
	});
};

export function test_Android_EditTextIsUpdatedAfterGarbageCollection() {
	if (!Application.android) {
		return;
	}

	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = ['One', 'Two'];
		for (let i = 0; i < 3; i++) {
			Utils.GC();
			java.lang.System.gc();
			java.lang.System.runFinalization();
			TKUnit.wait(0.05);
		}
		listPicker.selectedIndex = 1;
		TKUnit.assertEqual((listPicker as any)._editText.getText().toString(), 'Two');
	});
}

export var test_Android_WhenSelectedIndexChangesEditTextIsUpdatedProperly = function () {
	if (!Application.android) {
		return;
	}

	helper.buildUIAndRunTest(_createListPicker(), function (views: Array<View>) {
		const listPicker = <listPickerModule.ListPicker>views[0];
		listPicker.items = ['One', 'Two'];
		listPicker.selectedIndex = 1;
		const expectedValue = 'Two';
		const actualValue = (listPicker as any)._editText.getText().toString();
		TKUnit.assertEqual(actualValue, expectedValue);
	});
};
