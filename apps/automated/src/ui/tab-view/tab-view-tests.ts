import { UITest } from '../../ui-test';
import { Label } from '@nativescript/core/ui/label';
import { StackLayout } from '@nativescript/core/ui/layouts/stack-layout';
import { unsetValue } from '@nativescript/core';
import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as tabViewTestsNative from './tab-view-tests-native';

// Using a TabView requires the "ui/tab-view" module.
// >> article-require-tabview-module
import * as tabViewModule from '@nativescript/core/ui/tab-view';
// << article-require-tabview-module

export class TabViewTest extends UITest<tabViewModule.TabView> {
	public create(): tabViewModule.TabView {
		// >> article-create-tabview
		const tabView = new tabViewModule.TabView();
		// << article-create-tabview
		tabView.id = 'TabView';

		return tabView;
	}

	public test_recycling() {
		const setters = new Map<string, Array<any>>();
		setters.set('items', this._createItems(3));
		helper.nativeView_recycling_test(() => new tabViewModule.TabView(), null, null, setters);
	}

	_createItems(count: number): Array<tabViewModule.TabViewItem> {
		const items = new Array<tabViewModule.TabViewItem>();
		for (let i = 0; i < count; i++) {
			const label = new Label();
			label.text = 'Tab ' + i;
			const tabEntry = new tabViewModule.TabViewItem();
			tabEntry.title = 'Tab ' + i;
			tabEntry.view = label;
			items.push(tabEntry);
		}

		return items;
	}

	public tearDown() {
		if (this.testView && this.testView.items) {
			this.testView.items.length = 0;
		}
		super.tearDown();
	}

	public waitUntilSelectedItemIsFullyLoaded(): boolean {
		const tabView = this.testView;
		if (!tabView.isLoaded) {
			return false;
		}

		const i = tabView.selectedIndex;
		if (i >= 0 && !tabView.items[i].isLoaded) {
			return false;
		}

		if (tabView.android) {
			const viewPager: androidx.viewpager.widget.ViewPager = (<any>tabView)._viewPager;
			if (viewPager.getChildCount() === 0) {
				return false;
			}
		}

		return true;
	}

	public testWhenTabViewIsCreatedItemsAreUndefined = function () {
		TKUnit.assertEqual(this.testView.items, undefined, 'Items should be undefined initally.');
	};

	public testWhenTabViewIsCreatedSelectedIndexIsUndefined = function () {
		TKUnit.assertEqual(this.testView.selectedIndex, -1, 'selectedIndex should be undefined initally.');
	};

	public testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeTabsIsCreated = function () {
		this.testView.items = this._createItems(10);
		this.waitUntilTestElementIsLoaded();

		const expectedValue = this.testView.items.length;
		const actualValue = tabViewTestsNative.getNativeTabCount(this.testView);

		TKUnit.assertEqual(actualValue, expectedValue, 'NativeItems not equal to JS items.');
	};

	public testWhenSettingItemsToEmptyArrayZeroNativeTabsAreCreated = function () {
		const tabView = this.testView;
		tabView.items = [];
		this.waitUntilTestElementIsLoaded();

		const expectedValue = tabView.items.length;
		const actualValue = tabViewTestsNative.getNativeTabCount(tabView);

		TKUnit.assertEqual(actualValue, expectedValue, 'Should have 0 native tabs.');
	};

	public testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
		const tabView = this.testView;
		// >> article-binding-tabview-items
		const items = [];
		const StackLayout0 = new StackLayout();
		const label0 = new Label();
		label0.text = 'Tab 0';
		StackLayout0.addChild(label0);
		const tabEntry0 = new tabViewModule.TabViewItem();
		tabEntry0.title = 'Tab 0';
		tabEntry0.view = StackLayout0;
		items.push(tabEntry0);
		const StackLayout1 = new StackLayout();
		const label1 = new Label();
		label1.text = 'Tab 1';
		StackLayout1.addChild(label1);
		const tabEntry1 = new tabViewModule.TabViewItem();
		tabEntry1.title = 'Tab 1';
		tabEntry1.view = StackLayout1;
		items.push(tabEntry1);
		tabView.items = items;
		// << article-binding-tabview-items

		this.waitUntilTestElementIsLoaded();

		const expectedValue = 0;
		const actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'When bound selectedIndex should be 0.');
	};

	public testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(10);
		this.waitUntilTestElementIsLoaded();

		// >> article-select-tab
		tabView.selectedIndex = 9;
		// << article-select-tab
		tabView.items = [];

		const expectedValue = -1;
		const actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex should be undefined.');
	};

	public testSelectedIndexBecomesUndefinedWhenItemsSetToUndefined = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(10);
		this.waitUntilTestElementIsLoaded();

		tabView.selectedIndex = 9;
		tabView.items = undefined;
		const expectedValue = -1;
		const actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex should be undefined.');
	};

	public testSelectedIndexBecomesNegativeOneWhenItemsSetToNull = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(10);
		tabView.selectedIndex = 9;
		this.waitUntilTestElementIsLoaded();

		tabView.items = null;
		const expectedValue = -1;
		const actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex should be -1.');
	};

	public testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
		const tabView = this.testView;
		const expectedValue = 10;
		tabView.items = this._createItems(expectedValue);
		tabView.selectedIndex = 9;
		this.waitUntilTestElementIsLoaded();

		const actualValue = tabView.items.length;
		TKUnit.assertEqual(actualValue, expectedValue, 'items.length should be 10');
	};

	public testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(10);
		const expectedValue = 9;
		tabView.selectedIndex = expectedValue;
		this.waitUntilTestElementIsLoaded();

		const actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex');
	};

	public testBindingToTabEntryWithUndefinedViewShouldThrow = function () {
		const tabView = this.testView;
		this.waitUntilTestElementIsLoaded();

		TKUnit.assertThrows(() => {
			const item = new tabViewModule.TabViewItem();
			item.title = 'Tab 0';
			item.view = undefined;
			tabView.items = [item];
		}, 'Binding TabView to a TabViewItem with undefined view should throw.');
	};

	public testBindingToTabEntryWithNullViewShouldThrow = function () {
		const tabView = this.testView;
		this.waitUntilTestElementIsLoaded();

		TKUnit.assertThrows(() => {
			const item = new tabViewModule.TabViewItem();
			item.title = 'Tab 0';
			item.view = null;
			tabView.items = [item];
		}, 'Binding TabView to a TabViewItem with null view should throw.');
	};

	public test_SettingTheSameItemsToAnotherTabView_DoesNotThrow = function () {
		const tabView = this.testView;
		const items = this._createItems(2);
		tabView.items = items;
		this.waitUntilTestElementIsLoaded();

		const secondTabView = new tabViewModule.TabView();
		secondTabView.items = items;

		items.forEach((item, i) => TKUnit.assertEqual(item.parent, secondTabView, `Item ${i} should be parented to the TabView it was last assigned to.`));
	};

	public test_SettingTheItemsOfATornDownTabViewToANewOne_DoesNotThrow = function () {
		const tabView = this.testView;
		const items = this._createItems(2);
		tabView.items = items;
		this.waitUntilTestElementIsLoaded();

		// Detaching the TabView tears it down, but its items still point at it.
		this.testPage.content = null;

		const secondTabView = new tabViewModule.TabView();
		secondTabView.items = items;
		this.testPage.content = secondTabView;
		TKUnit.waitUntilReady(() => secondTabView.isLoaded, 1);

		items.forEach((item, i) => TKUnit.assertEqual(item.parent, secondTabView, `Item ${i} should be parented to the TabView it was last assigned to.`));
		TKUnit.assertEqual(tabViewTestsNative.getNativeTabCount(secondTabView), items.length, 'Native tabs should be created for the TabView the items were re-assigned to.');
	};

	public testWhenSelectingATabNativelySelectedIndexIsUpdatedProperly = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(2);
		this.waitUntilTestElementIsLoaded();

		const expectedValue = 1;
		tabViewTestsNative.selectNativeTab(tabView, expectedValue);
		TKUnit.waitUntilReady(function () {
			return tabView.selectedIndex === expectedValue;
		}, helper.ASYNC);

		const actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex');
	};

	public testWhenSelectingATabNativelySelectedIndexChangedEventIsRaised = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(10);
		this.waitUntilTestElementIsLoaded();

		const expectedOldIndex = 3;
		const expectedNewIndex = 5;
		let actualOldIndex;
		let actualNewIndex;

		tabViewTestsNative.selectNativeTab(tabView, expectedOldIndex);
		TKUnit.waitUntilReady(function () {
			return tabView.selectedIndex === expectedOldIndex;
		}, helper.ASYNC);

		// >> article-tabview-selectedIndexChanged
		tabView.on(tabViewModule.TabView.selectedIndexChangedEvent, (args: tabViewModule.SelectedIndexChangedEventData) => {
			actualOldIndex = args.oldIndex;
			actualNewIndex = args.newIndex;
		});
		// << article-tabview-selectedIndexChanged

		tabViewTestsNative.selectNativeTab(tabView, expectedNewIndex);
		TKUnit.waitUntilReady(function () {
			return tabView.selectedIndex === expectedNewIndex;
		}, helper.ASYNC);

		TKUnit.assertEqual(actualOldIndex, expectedOldIndex, 'expectedOldIndex');
		TKUnit.assertEqual(actualNewIndex, expectedNewIndex, 'expectedNewIndex');
	};

	public testWhenSettingSelectedIndexProgramaticallySelectedIndexChangedEventIsRaised = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(10);
		this.waitUntilTestElementIsLoaded();

		const expectedOldIndex = 2;
		const expectedNewIndex = 6;
		let actualOldIndex;
		let actualNewIndex;

		tabView.selectedIndex = expectedOldIndex;
		TKUnit.waitUntilReady(function () {
			return tabViewTestsNative.getNativeSelectedIndex(tabView) === expectedOldIndex;
		}, helper.ASYNC);

		tabView.on(tabViewModule.TabView.selectedIndexChangedEvent, (args: tabViewModule.SelectedIndexChangedEventData) => {
			actualOldIndex = args.oldIndex;
			actualNewIndex = args.newIndex;
			TKUnit.assertEqual(args.object, tabView, 'args.object should be TabView');
		});

		tabView.selectedIndex = expectedNewIndex;
		TKUnit.waitUntilReady(function () {
			return tabViewTestsNative.getNativeSelectedIndex(tabView) === expectedNewIndex;
		}, helper.ASYNC);

		TKUnit.assertEqual(actualOldIndex, expectedOldIndex, 'expectedOldIndex');
		TKUnit.assertEqual(actualNewIndex, expectedNewIndex, 'expectedNewIndex');
	};

	public test_SearchRoleTabIsProminent = function () {
		const tabView = this.testView;
		const items = this._createItems(3);
		items[2].role = 'search';
		tabView.items = items;
		this.waitUntilTestElementIsLoaded();

		const actual = tabViewTestsNative.getNativeProminentTabIdentifier(tabView);
		if (actual !== undefined) {
			TKUnit.assertEqual(actual, '2', 'search tab should be prominent');
		}
	};

	public test_ProminentRoleTakesPrecedenceOverSearchRole = function () {
		const tabView = this.testView;
		const items = this._createItems(3);
		items[0].role = 'search';
		items[1].role = 'prominent';
		tabView.items = items;
		this.waitUntilTestElementIsLoaded();

		const actual = tabViewTestsNative.getNativeProminentTabIdentifier(tabView);
		if (actual !== undefined) {
			TKUnit.assertEqual(actual, '1', 'prominent tab should win over search tab');
		}
	};

	public test_NoProminentTabWithoutRoles = function () {
		const tabView = this.testView;
		tabView.items = this._createItems(3);
		this.waitUntilTestElementIsLoaded();

		const actual = tabViewTestsNative.getNativeProminentTabIdentifier(tabView);
		if (actual !== undefined) {
			TKUnit.assertNull(actual, 'no tab should be prominent');
		}
	};

	// public test_FontIsReappliedWhenTabItemsChange = function () {
	// 	const assertFontsAreEqual = (actual: any, expected: any, message?: string) => {
	// 		if (this.testView.ios) {
	// 			TKUnit.assertEqual(actual, expected, message);
	// 		} else {
	// 			TKUnit.assertEqual(actual.typeface, expected.typeface, `${message} [typeface]`);
	// 			TKUnit.assertEqual(actual.size, expected.size, `${message} [size]`);
	// 		}
	// 	};

	// 	this.testView.items = this._createItems(1);
	// 	this.waitUntilSelectedItemIsFullyLoaded();

	// 	const originalFont = tabViewTestsNative.getOriginalFont(this.testView);
	// 	TKUnit.assertNotNull(originalFont, 'Original Font should be applied');

	// 	this.testView.style.font = '20 Pacifico';
	// 	let nativeFont = tabViewTestsNative.getNativeFont(this.testView);
	// 	TKUnit.assertNotNull(nativeFont, 'Native Font should not be null');
	// 	TKUnit.assertNotEqual(originalFont, nativeFont, 'Font should be changed');

	// 	this.testView.items = this._createItems(2);
	// 	this.waitUntilSelectedItemIsFullyLoaded();
	// 	assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), nativeFont, 'Font must be 20 Pacifico after rebinding items.');

	// 	this.testView.style.font = 'bold 12 monospace';
	// 	nativeFont = tabViewTestsNative.getNativeFont(this.testView);

	// 	this.testView.items = this._createItems(3);
	// 	this.waitUntilSelectedItemIsFullyLoaded();
	// 	assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), nativeFont, 'Font must be bold 12 monospace after rebinding items.');

	// 	this.testView.style.font = unsetValue;
	// 	assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), originalFont, 'Font must be the original one after resetting the style.');
	// };
}

export function createTestCase(): TabViewTest {
	return new TabViewTest();
}
