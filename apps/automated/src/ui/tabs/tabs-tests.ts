import { UITest } from '../../ui-test';
import { Label } from '@nativescript/core/ui/label';
import * as TKUnit from '../../tk-unit';
import * as helper from '../../ui-helper';
import * as tabViewTestsNative from './tabs-tests-native';

import { Tabs, TabContentItem, TabStrip, TabStripItem, SelectedIndexChangedEventData } from '@nativescript/core/ui/tabs';

export class TabsTest extends UITest<Tabs> {
	public create(): Tabs {
		var tabView = new Tabs();
		tabView.id = 'TabView';

		return tabView;
	}

	// public test_recycling() {
	//     const setters = new Map<string, Array<any>>();
	//     setters.set("items", this._createItems(3));
	//     helper.nativeView_recycling_test(() => new BottomNavigation(), null, null, setters);
	// }

	_createContentItems(count: number): Array<TabContentItem> {
		const items = new Array<TabContentItem>();
		for (let i = 0; i < count; i++) {
			const label = new Label();
			label.text = 'Tab ' + i;
			const tabEntry = new TabContentItem();
			tabEntry.content = label;
			items.push(tabEntry);
		}

		return items;
	}

	_createTabStrip(count: number): TabStrip {
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
			const bottomNavigationBar = <org.nativescript.widgets.BottomNavigationBar>(<any>tabView)._bottomNavigationBar;
			if (bottomNavigationBar.getItemCount() === 0) {
				return false;
			}
		}

		return true;
	}

	public test_when_created_items_are_undefined = function () {
		TKUnit.assertEqual(this.testView.items, undefined, 'Items should be undefined initally.');
	};

	public test_when_created_selected_index_is_undefined = function () {
		TKUnit.assertEqual(this.testView.selectedIndex, -1, 'selectedIndex should be undefined initally.');
	};

	// TODO: Do we need this test? The number of tabs is dynamic and isn't kept in the native implementation.
	// TODO: Maybe test if all native tabBarItems are created.
	public test_when_setting_items_to_non_empty_array_the_same_amount_of_native_tabs_is_created = function () {
		this.testView.items = this._createContentItems(5);
		this.waitUntilTestElementIsLoaded();

		let expectedValue = this.testView.items.length;
		let actualValue = tabViewTestsNative.getNativeTabCount(this.testView);

		TKUnit.assertEqual(actualValue, expectedValue, 'NativeItems not equal to JS items.');
	};

	// TODO: Do we need this test? The number of tabs is dynamic and isn't kept in the native implementation.
	// TODO: Maybe test if all native tabBarItems are created.
	public test_when_setting_items_to_empty_array_zero_native_tabs_are_created = function () {
		var tabView = this.testView;
		tabView.items = [];
		this.waitUntilTestElementIsLoaded();

		var expectedValue = tabView.items.length;
		var actualValue = tabViewTestsNative.getNativeTabCount(tabView);

		TKUnit.assertEqual(actualValue, expectedValue, 'Should have 0 native tabs.');
	};

	public test_selected_index_becomes_zero_when_items_bound_to_non_empty_array = function () {
		var tabView = this.testView;
		// var items = [];

		// var StackLayout0 = new StackLayout();
		// var label0 = new Label();
		// label0.text = "Tab 0";
		// StackLayout0.addChild(label0);
		// var tabEntry0 = new TabContentItem();
		// // tabEntry0.title = "Tab 0";
		// tabEntry0.view = StackLayout0;
		// items.push(tabEntry0);

		// var StackLayout1 = new StackLayout();
		// var label1 = new Label();
		// label1.text = "Tab 1";
		// StackLayout1.addChild(label1);
		// var tabEntry1 = new TabContentItem();
		// // tabEntry1.title = "Tab 1";
		// tabEntry1.view = StackLayout1;
		// items.push(tabEntry1);

		tabView.items = this._createContentItems(5);

		this.waitUntilTestElementIsLoaded();

		var expectedValue = 0;
		var actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'When bound selectedIndex should be 0.');
	};

	public test_selected_index_becomes_undefined_when_items_bound_to_empty_array = function () {
		var tabView = this.testView;
		tabView.items = this._createContentItems(5);
		this.waitUntilTestElementIsLoaded();

		tabView.selectedIndex = 4;

		tabView.items = [];

		var expectedValue = -1;
		var actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex should be undefined.');
	};

	public test_selected_index_becomes_undefined_when_items_set_to_undefined = function () {
		var tabView = this.testView;
		tabView.items = this._createContentItems(5);
		this.waitUntilTestElementIsLoaded();

		// tabView.selectedIndex = 4;

		tabView.items = undefined;

		var expectedValue = -1;
		var actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex should be undefined.');
	};

	public test_selected_index_becomes_undefined_when_items_set_to_null = function () {
		var tabView = this.testView;
		tabView.items = this._createContentItems(5);
		tabView.selectedIndex = 4;
		this.waitUntilTestElementIsLoaded();

		tabView.items = null;

		var expectedValue = -1;
		var actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex should be undefined.');
	};

	public test_items_is_resolved_correctly_if_set_before_view_is_loaded = function () {
		var tabView = this.testView;
		var expectedValue = 5;
		tabView.items = this._createContentItems(expectedValue);
		tabView.selectedIndex = 4;
		this.waitUntilTestElementIsLoaded();

		var actualValue = tabView.items.length;
		TKUnit.assertEqual(actualValue, expectedValue, 'items.length should be 5');
	};

	public test_selected_index_is_resolved_correctly_if_set_before_view_is_loaded = function () {
		var tabView = this.testView;
		tabView.items = this._createContentItems(5);
		var expectedValue = 4;
		tabView.selectedIndex = expectedValue;
		this.waitUntilTestElementIsLoaded();

		var actualValue = tabView.selectedIndex;
		TKUnit.assertEqual(actualValue, expectedValue, 'selectedIndex');
	};

	public test_binding_to_tabitem_with_undefined_view_should_throw = function () {
		var tabView = this.testView;
		this.waitUntilTestElementIsLoaded();

		TKUnit.assertThrows(() => {
			let item = new TabContentItem();
			// item.title = "Tab 0";
			item.content = undefined;
			tabView.items = [item];
		}, 'Binding TabNavigation to a TabItem with undefined view should throw.');
	};

	public test_binding_to_tabitem_with_null_view_should_throw = function () {
		var tabView = this.testView;
		this.waitUntilTestElementIsLoaded();

		TKUnit.assertThrows(() => {
			let item = new TabContentItem();
			// item.title = "Tab 0";
			item.content = null;
			tabView.items = [item];
		}, 'Binding TabNavigation to a TabItem with null view should throw.');
	};

	// TODO: times out
	// public test_when_selecting_tab_natively_selectedIndex_is_updated_properly = function () {
	//     var tabView = this.testView;
	//     tabView.items = this._createContentItems(2);
	//     this.waitUntilTestElementIsLoaded();

	//     var expectedValue = 1;
	//     tabViewTestsNative.selectNativeTab(tabView, expectedValue);
	//     TKUnit.waitUntilReady(function () {
	//         return tabView.selectedIndex === expectedValue;
	//     }, helper.ASYNC);

	//     var actualValue = tabView.selectedIndex;
	//     TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex");

	// }

	// TODO: times out
	// public test_when_selecting_tab_natively_selectedIndexChangedEvent_is_raised = function () {
	//     var tabView = this.testView;
	//     tabView.items = this._createContentItems(5);
	//     this.waitUntilTestElementIsLoaded();

	//     var expectedOldIndex = 3;
	//     var expectedNewIndex = 4;
	//     var actualOldIndex;
	//     var actualNewIndex;

	//     tabViewTestsNative.selectNativeTab(tabView, expectedOldIndex);
	//     TKUnit.waitUntilReady(function () {
	//         return tabView.selectedIndex === expectedOldIndex;
	//     }, 10);

	//     tabView.on(Tabs.selectedIndexChangedEvent, (args: SelectedIndexChangedEventData) => {
	//         actualOldIndex = args.oldIndex;
	//         actualNewIndex = args.newIndex;
	//     });

	//     tabViewTestsNative.selectNativeTab(tabView, expectedNewIndex);
	//     TKUnit.waitUntilReady(function () {
	//         return tabView.selectedIndex === expectedNewIndex;
	//     }, helper.ASYNC);

	//     TKUnit.assertEqual(actualOldIndex, expectedOldIndex, "expectedOldIndex");
	//     TKUnit.assertEqual(actualNewIndex, expectedNewIndex, "expectedNewIndex");
	// }

	// TODO: Do we need this test?
	public test_when_setting_selectedIndex_programatically_selectedIndexChangedEvent_is_raised = function () {
		var tabView = this.testView;
		tabView.items = this._createContentItems(5);
		this.waitUntilTestElementIsLoaded();

		var expectedOldIndex = 2;
		var expectedNewIndex = 4;
		var actualOldIndex;
		var actualNewIndex;

		tabView.selectedIndex = expectedOldIndex;
		TKUnit.waitUntilReady(function () {
			return tabViewTestsNative.getNativeSelectedIndex(tabView) === expectedOldIndex;
		}, helper.ASYNC);

		tabView.on(Tabs.selectedIndexChangedEvent, (args: SelectedIndexChangedEventData) => {
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

	//TODO: Font styling is not ready
	// public test_font_is_reapplied_when_tab_items_change = function () {
	//     const assertFontsAreEqual = (actual: any, expected: any, message?: string) => {
	//         if (this.testView.ios) {
	//             TKUnit.assertEqual(actual, expected, message);
	//         } else {
	//             TKUnit.assertEqual(actual.typeface, expected.typeface, `${message} [typeface]`);
	//             TKUnit.assertEqual(actual.size, expected.size, `${message} [size]`);
	//         }
	//     }

	//     this.testView.items = this._createContentItems(1);
	//     this.testView.tabStrip = this._createTabStrip(1);
	//     this.waitUntilSelectedItemIsFullyLoaded();

	//     const originalFont = tabViewTestsNative.getOriginalFont(this.testView);
	//     TKUnit.assertNotNull(originalFont, "Original Font should be applied");

	//     this.testView.style.font = "20 Pacifico";
	//     let nativeFont = tabViewTestsNative.getNativeFont(this.testView);
	//     TKUnit.assertNotNull(nativeFont, "Native Font should not be null");
	//     TKUnit.assertNotEqual(originalFont, nativeFont, "Font should be changed");

	//     this.testView.items = this._createContentItems(2);
	//     this.testView.tabStrip = this._createTabStrip(2);
	//     this.waitUntilSelectedItemIsFullyLoaded();
	//     assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), nativeFont, "Font must be 20 Pacifico after rebinding items.");

	//     this.testView.style.font = "bold 12 monospace";
	//     nativeFont = tabViewTestsNative.getNativeFont(this.testView);

	//     this.testView.items = this._createContentItems(3);
	//     this.testView.tabStrip = this._createTabStrip(3);
	//     this.waitUntilSelectedItemIsFullyLoaded();
	//     assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), nativeFont, "Font must be bold 12 monospace after rebinding items.");

	//     this.testView.style.font = unsetValue;
	//     assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), originalFont, "Font must be the original one after resetting the style.");
	// }
}

export function createTestCase(): TabsTest {
	return new TabsTest();
}
