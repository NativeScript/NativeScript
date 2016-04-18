import TKUnit = require("../../TKUnit");
import app = require("application");
import button = require("ui/button");
import enums = require("ui/enums");
import testModule = require("../../ui-test");
import layoutHelper = require("../../layouts/layout-helper");
import {Page} from "ui/page";
import * as frame from "ui/frame";

// >> article-require-module
import scrollViewModule = require("ui/scroll-view");
// << article-require-module

class ScrollLayoutTest extends testModule.UITest<scrollViewModule.ScrollView> {

    public create(): scrollViewModule.ScrollView {
        let scrollView = new scrollViewModule.ScrollView();
        scrollView.orientation = enums.Orientation.vertical;

        scrollView.width = layoutHelper.dp(200);
        scrollView.height = layoutHelper.dp(300);

        let btn = new button.Button();
        btn.text = "test";
        btn.width = layoutHelper.dp(500);
        btn.height = layoutHelper.dp(500);
        scrollView.content = btn;

        return scrollView;
    }

    public test_snippets() {
        // >> article-creating-scrollview
        var scrollView = new scrollViewModule.ScrollView();
        // << article-creating-scrollview
        console.dump(scrollView);
    }

    public test_default_TNS_values() {
        TKUnit.assertEqual(this.testView.orientation, enums.Orientation.vertical, "Default this.testView.orientation");
        TKUnit.assertEqual(this.testView.verticalOffset, 0, "Default this.testView.verticalOffset");
        TKUnit.assertEqual(this.testView.horizontalOffset, 0, "Default this.testView.horizontalOffset");
    }

    public test_vertical_oriantation_creates_correct_native_view() {
        this.testView.orientation = enums.Orientation.vertical;

        if (app.android) {
            TKUnit.assert(this.testView.android instanceof org.nativescript.widgets.VerticalScrollView, "android property should be instanceof org.nativescript.widgets.VerticalScrollView");
        }
        else if (app.ios) {
            TKUnit.assert(this.testView.ios instanceof UIScrollView, "ios property is UIScrollView");
        }
    }

    public test_horizontal_oriantation_creates_correct_native_view() {
        this.testView.orientation = enums.Orientation.horizontal;

        if (app.android) {
            TKUnit.assert(this.testView.android instanceof org.nativescript.widgets.HorizontalScrollView, "android property should be instanceof org.nativescript.widgets.HorizontalScrollView");
        }
        else if (app.ios) {
            TKUnit.assert(this.testView.ios instanceof UIScrollView, "ios property is UIScrollView");
        }
    }

    public test_scrollableHeight_vertical_orientation_when_content_is_small() {
        this.testView.content.width = layoutHelper.dp(100);
        this.testView.content.height = layoutHelper.dp(100);
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.scrollableHeight, 0, "this.testView.scrollableHeight");
        TKUnit.assertEqual(this.testView.scrollableWidth, 0, "this.testView.scrollableWidth");
    }

    public test_scrollableHeight_vertical_orientation_when_content_is_big() {
        this.testView.content.width = layoutHelper.dp(100);
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertAreClose(layoutHelper.dip(this.testView.scrollableHeight), 200, 0.4, "this.testView.scrollableHeight");
        TKUnit.assertEqual(this.testView.scrollableWidth, 0, "this.testView.scrollableWidth");
    }

    public test_scrollableWidth_horizontal_orientation_when_content_is_small() {
        this.testView.orientation = enums.Orientation.horizontal;
        this.testView.content.width = layoutHelper.dp(100);
        this.testView.content.height = layoutHelper.dp(100);
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.scrollableHeight, 0, "this.testView.scrollableHeight");
        TKUnit.assertEqual(this.testView.scrollableWidth, 0, "this.testView.scrollableWidth");
    }

    public test_scrollableWidth_horizontal_orientation_when_content_is_big() {
        this.testView.orientation = enums.Orientation.horizontal;
        this.testView.content.height = layoutHelper.dp(100);
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.scrollableHeight, 0, "this.testView.scrollableHeight");
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.scrollableWidth), 300, 0.4, "this.testView.scrollableWidth");
    }

    public test_scrollToVerticalOffset_no_animation() {
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.verticalOffset, 0, "this.testView.verticalOffset");
        this.testView.scrollToVerticalOffset(layoutHelper.dp(100), false);
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.1, "this.testView.verticalOffset");
    }

    public test_scrollToVerticalOffset_with_animation() {
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.verticalOffset, 0, "this.testView.verticalOffset");
        this.testView.scrollToVerticalOffset(layoutHelper.dp(100), true);

        // No synchronous change. 
        TKUnit.assertEqual(this.testView.verticalOffset, 0, "this.testView.verticalOffset");

        TKUnit.waitUntilReady(() => { return TKUnit.areClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.9); });

        // The scrolling animation should be finished by now
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.9, "this.testView.verticalOffset");
    }

    public test_scrollToHorizontalOffset_no_animation() {
        this.testView.orientation = enums.Orientation.horizontal;
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.horizontalOffset, 0, "this.testView.horizontalOffset");
        this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), false);
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.1, "this.testView.horizontalOffset");
    }

    public test_scrollToHorizontalOffset_with_animation() {
        this.testView.orientation = enums.Orientation.horizontal;
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.horizontalOffset, 0, "this.testView.horizontalOffset");
        this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), true);

        // No synchronous change. 
        TKUnit.assertEqual(this.testView.horizontalOffset, 0, "this.testView.horizontalOffset");

        TKUnit.waitUntilReady(() => { return TKUnit.areClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.9); });

        // The scrolling animation should be finished by now
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.9, "this.testView.horizontalOffset");
    }

    public test_scrollView_persistsState_vertical() {
        this.waitUntilTestElementLayoutIsValid();

        this.testView.scrollToVerticalOffset(layoutHelper.dp(100), false);
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.1, "this.testView.verticalOffset before navigation");

        let page = new Page();
        let createFunc = () => {
            return page;
        };

        let entry: frame.NavigationEntry = { create: createFunc, animated: false };
        frame.topmost().navigate(entry);
        TKUnit.waitUntilReady(() => page.isLayoutValid);
        frame.topmost().goBack();

        // Wait for the page to reload.
        TKUnit.waitUntilReady(() => { return TKUnit.areClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.1); });

        // Check verticalOffset after navigation
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.verticalOffset), 100, 0.1, "this.testView.verticalOffset after navigation");
    }

    public test_scrollView_persistsState_horizontal() {
        this.testView.orientation = enums.Orientation.horizontal;
        this.waitUntilTestElementLayoutIsValid();

        this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), false);

        TKUnit.assertAreClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.1, "this.testView.horizontalOffset before navigation");

        let page = new Page();
        let createFunc = () => {
            return page;
        };

        let entry: frame.NavigationEntry = { create: createFunc, animated: false };
        frame.topmost().navigate(entry);
        TKUnit.waitUntilReady(() => page.isLayoutValid);
        frame.topmost().goBack();

        // Wait for the page to reload.
        TKUnit.waitUntilReady(() => { return TKUnit.areClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.1); });

        // Check verticalOffset after navigation
        TKUnit.assertAreClose(layoutHelper.dip(this.testView.horizontalOffset), 100, 0.1, "this.testView.horizontalOffset after navigation");
    }

    public test_scrollView_vertical_raised_scroll_event() {
        var scrollY: number;
        this.testView.on(scrollViewModule.ScrollView.scrollEvent, (args: scrollViewModule.ScrollEventData) => {
            scrollY = args.scrollY;
        });

        this.waitUntilTestElementLayoutIsValid();

        this.testView.scrollToVerticalOffset(layoutHelper.dp(100), false);
        TKUnit.waitUntilReady(function () { return scrollY > 0; });
        TKUnit.assertEqual(scrollY, this.testView.verticalOffset);
    }

    public test_scrollView_horizontal_raised_scroll_event() {
        this.testView.orientation = enums.Orientation.horizontal;

        var scrollX: number;
        this.testView.on(scrollViewModule.ScrollView.scrollEvent, (args: scrollViewModule.ScrollEventData) => {
            scrollX = args.scrollX;
        });

        this.waitUntilTestElementLayoutIsValid();

        this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), false);
        TKUnit.waitUntilReady(function () { return scrollX > 0; });
        TKUnit.assertEqual(scrollX, this.testView.horizontalOffset);
    }

    public test_scrollView_vertical_raised_scroll_event_after_loaded() {
        this.waitUntilTestElementLayoutIsValid();

        var scrollY: number;
        this.testView.on(scrollViewModule.ScrollView.scrollEvent, (args: scrollViewModule.ScrollEventData) => {
            scrollY = args.scrollY;
        });

        this.testView.scrollToVerticalOffset(layoutHelper.dp(100), false);
        TKUnit.waitUntilReady(function () { return scrollY > 0; });
        TKUnit.assertEqual(scrollY, this.testView.verticalOffset);
        TKUnit.assertEqual(scrollY, layoutHelper.dp(100));
    }

    public test_scrollView_horizontal_raised_scroll_event_after_loaded() {
        this.testView.orientation = enums.Orientation.horizontal;
        this.waitUntilTestElementLayoutIsValid();

        var scrollX: number;
        this.testView.on(scrollViewModule.ScrollView.scrollEvent, (args: scrollViewModule.ScrollEventData) => {
            scrollX = args.scrollX;
        });

        this.waitUntilTestElementLayoutIsValid();

        this.testView.scrollToHorizontalOffset(layoutHelper.dp(100), false);
        TKUnit.waitUntilReady(function () { return scrollX > 0; });
        TKUnit.assertEqual(scrollX, this.testView.horizontalOffset);
        TKUnit.assertEqual(scrollX, layoutHelper.dp(100));
    }
}

export function createTestCase(): ScrollLayoutTest {
    return new ScrollLayoutTest();
}
