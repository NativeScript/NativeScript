import { UITest } from "../../ui-test";
import { Label } from "tns-core-modules/ui/label";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { unsetValue } from "tns-core-modules/ui/core/view";
import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import tabViewTestsNative = require("./tab-view-tests-native");

// Using a TabView requires the "ui/tab-view" module.
// >> article-require-tabview-module
import * as tabViewModule from "tns-core-modules/ui/tab-view";
// << article-require-tabview-module

export class TabViewTest extends UITest<tabViewModule.TabView> {

    public create(): tabViewModule.TabView {
        // >> article-create-tabview
        var tabView = new tabViewModule.TabView();
        // << article-create-tabview
        tabView.id = "TabView";
        return tabView;
    }

    public test_recycling() {
        const setters = new Map<string, Array<any>>();
        setters.set('items', this._createItems(3));
        helper.nativeView_recycling_test(() => new tabViewModule.TabView(), null, null, setters);
    }

    _createItems(count: number): Array<tabViewModule.TabViewItem> {
        var items = new Array<tabViewModule.TabViewItem>();
        for (var i = 0; i < count; i++) {
            var label = new Label();
            label.text = "Tab " + i;
            var tabEntry = new tabViewModule.TabViewItem();
            tabEntry.title = "Tab " + i;
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

    public testWhenTabViewIsCreatedItemsAreUndefined = function () {
        TKUnit.assertEqual(this.testView.items, undefined, "Items should be undefined initally.");
    }

    public testWhenTabViewIsCreatedSelectedIndexIsUndefined = function () {
        TKUnit.assertEqual(this.testView.selectedIndex, -1, "selectedIndex should be undefined initally.");
    }

    public testWhenSettingItemsToNonEmptyArrayTheSameAmountOfNativeTabsIsCreated = function () {
        this.testView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        let expectedValue = this.testView.items.length;
        let actualValue = tabViewTestsNative.getNativeTabCount(this.testView);

        TKUnit.assertEqual(actualValue, expectedValue, "NativeItems not equal to JS items.");
    }

    public testWhenSettingItemsToEmptyArrayZeroNativeTabsAreCreated = function () {
        var tabView = this.testView;
        tabView.items = [];
        this.waitUntilTestElementIsLoaded();

        var expectedValue = tabView.items.length;
        var actualValue = tabViewTestsNative.getNativeTabCount(tabView);

        TKUnit.assertEqual(actualValue, expectedValue, "Should have 0 native tabs.");
    }

    public testSelectedIndexBecomesZeroWhenItemsBoundToNonEmptyArray = function () {
        var tabView = this.testView;
        // >> article-binding-tabview-items
        var items = [];
        var StackLayout0 = new StackLayout();
        var label0 = new Label();
        label0.text = "Tab 0";
        StackLayout0.addChild(label0);
        var tabEntry0 = new tabViewModule.TabViewItem();
        tabEntry0.title = "Tab 0";
        tabEntry0.view = StackLayout0;
        items.push(tabEntry0);
        var StackLayout1 = new StackLayout();
        var label1 = new Label();
        label1.text = "Tab 1";
        StackLayout1.addChild(label1);
        var tabEntry1 = new tabViewModule.TabViewItem();
        tabEntry1.title = "Tab 1";
        tabEntry1.view = StackLayout1;
        items.push(tabEntry1);
        tabView.items = items;
        // << article-binding-tabview-items

        this.waitUntilTestElementIsLoaded();

        var expectedValue = 0;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "When bound selectedIndex should be 0.");
    }

    public testSelectedIndexBecomesUndefinedWhenItemsBoundToEmptyArray = function () {

        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        // >> article-select-tab
        tabView.selectedIndex = 9;
        // << article-select-tab
        tabView.items = [];

        var expectedValue = -1;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex should be undefined.");
    }

    public testSelectedIndexBecomesUndefinedWhenItemsSetToUndefined = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        tabView.selectedIndex = 9;
        tabView.items = undefined;
        var expectedValue = -1;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex should be undefined.");
    }

    public testSelectedIndexBecomesUndefinedWhenItemsSetToNull = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        tabView.selectedIndex = 9;
        this.waitUntilTestElementIsLoaded();

        tabView.items = null;
        var expectedValue = -1;
        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex should be undefined.");
    }

    public testItemsIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
        var tabView = this.testView;
        var expectedValue = 10;
        tabView.items = this._createItems(expectedValue);
        tabView.selectedIndex = 9;
        this.waitUntilTestElementIsLoaded();

        var actualValue = tabView.items.length;
        TKUnit.assertEqual(actualValue, expectedValue, "items.length should be 10");
    }

    public testSelectedIndexIsResolvedCorrectlyIfSetBeforeViewIsLoaded = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        var expectedValue = 9;
        tabView.selectedIndex = expectedValue;
        this.waitUntilTestElementIsLoaded();

        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex");
    }

    public testBindingToTabEntryWithUndefinedViewShouldThrow = function () {
        var tabView = this.testView;
        this.waitUntilTestElementIsLoaded();

        TKUnit.assertThrows(() => {
            let item = new tabViewModule.TabViewItem();
            item.title = "Tab 0";
            item.view = undefined;
            tabView.items = [item];

        }, "Binding TabView to a TabViewItem with undefined view should throw.");
    }

    public testBindingToTabEntryWithNullViewShouldThrow = function () {
        var tabView = this.testView;
        this.waitUntilTestElementIsLoaded();

        TKUnit.assertThrows(() => {
            let item = new tabViewModule.TabViewItem();
            item.title = "Tab 0";
            item.view = null;
            tabView.items = [item];

        }, "Binding TabView to a TabViewItem with null view should throw.");
    }

    public testWhenSelectingATabNativelySelectedIndexIsUpdatedProperly = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(2);
        this.waitUntilTestElementIsLoaded();

        var expectedValue = 1;
        tabViewTestsNative.selectNativeTab(tabView, expectedValue);
        TKUnit.waitUntilReady(function () {
            return tabView.selectedIndex === expectedValue;
        }, helper.ASYNC);

        var actualValue = tabView.selectedIndex;
        TKUnit.assertEqual(actualValue, expectedValue, "selectedIndex");
    }

    public testWhenSelectingATabNativelySelectedIndexChangedEventIsRaised = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        var expectedOldIndex = 3;
        var expectedNewIndex = 5;
        var actualOldIndex;
        var actualNewIndex;

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

        TKUnit.assertEqual(actualOldIndex, expectedOldIndex, "expectedOldIndex");
        TKUnit.assertEqual(actualNewIndex, expectedNewIndex, "expectedNewIndex");
    }

    public testWhenSettingSelectedIndexProgramaticallySelectedIndexChangedEventIsRaised = function () {
        var tabView = this.testView;
        tabView.items = this._createItems(10);
        this.waitUntilTestElementIsLoaded();

        var expectedOldIndex = 2;
        var expectedNewIndex = 6;
        var actualOldIndex;
        var actualNewIndex;

        tabView.selectedIndex = expectedOldIndex;
        TKUnit.waitUntilReady(function () {
            return tabViewTestsNative.getNativeSelectedIndex(tabView) === expectedOldIndex;
        }, helper.ASYNC);

        tabView.on(tabViewModule.TabView.selectedIndexChangedEvent, (args: tabViewModule.SelectedIndexChangedEventData) => {
            actualOldIndex = args.oldIndex;
            actualNewIndex = args.newIndex;
            TKUnit.assertEqual(args.object, tabView, "args.object should be TabView")
        });

        tabView.selectedIndex = expectedNewIndex;
        TKUnit.waitUntilReady(function () {
            return tabViewTestsNative.getNativeSelectedIndex(tabView) === expectedNewIndex;
        }, helper.ASYNC);

        TKUnit.assertEqual(actualOldIndex, expectedOldIndex, "expectedOldIndex");
        TKUnit.assertEqual(actualNewIndex, expectedNewIndex, "expectedNewIndex");
    }

    public test_FontIsReappliedWhenTabItemsChange = function () {
        const assertFontsAreEqual = (actual: any, expected: any, message?: string) => {
            if (this.testView.ios) {
                TKUnit.assertEqual(actual, expected, message);
            } else {
                TKUnit.assertEqual(actual.typeface, expected.typeface, `${message} [typeface]`);
                TKUnit.assertEqual(actual.size, expected.size, `${message} [size]`);
            }
        }

        this.testView.items = this._createItems(1);
        this.waitUntilTestElementIsLoaded();

        const originalFont = tabViewTestsNative.getOriginalFont(this.testView);
        TKUnit.assertNotNull(originalFont, "Original Font should be applied");

        this.testView.style.font = "20 Pacifico";
        let nativeFont = tabViewTestsNative.getNativeFont(this.testView);
        TKUnit.assertNotNull(nativeFont, "Native Font should not be null");
        TKUnit.assertNotEqual(originalFont, nativeFont, "Font should be changed");

        this.testView.items = this._createItems(2);
        assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), nativeFont, "Font must be 20 Pacifico after rebinding items.");

        this.testView.style.font = "bold 12 monospace";
        nativeFont = tabViewTestsNative.getNativeFont(this.testView);

        this.testView.items = this._createItems(3);
        assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), nativeFont, "Font must be bold 12 monospace after rebinding items.");

        this.testView.style.font = unsetValue;
        assertFontsAreEqual(tabViewTestsNative.getNativeFont(this.testView), originalFont, "Font must be the original one after resetting the style.");
    }
}

export function createTestCase(): TabViewTest {
    return new TabViewTest();
}
