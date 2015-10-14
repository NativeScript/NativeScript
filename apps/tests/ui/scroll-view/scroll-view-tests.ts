import TKUnit = require("../../TKUnit");
import app = require("application");
import helper = require("../helper");
import buttonModule = require("ui/button");
import page = require("ui/page");
import button = require("ui/button");
import enums = require("ui/enums");
import testModule = require("../../ui-test");

// <snippet module="ui/scroll-view" title="scroll-view">
// # ScrollView
// Using a ScrollView requires the ScrollView module.
// ``` JavaScript
import scrollViewModule = require("ui/scroll-view");
// ```

// ### Declaring the ScrollView.
//```XML
// <Page>
//  <ScrollView>
//    {%raw%}<Image src="{{ someBigImageUrl }}" />{%endraw%}
//  </ScrollView>
// </Page>
//```

// </snippet>

var ASYNC = 0.3;
var tmp: buttonModule.Button;
var newPage: page.Page;

    public create(): scrollViewModule.ScrollView {
        return new scrollViewModule.ScrollView();
    }

    public test_snippets() {
// <snippet module="ui/scroll-view" title="scroll-view">
// ### Creating a ScrollView
// ``` JavaScript
var scrollView = new scrollViewModule.ScrollView();
// ```
// </snippet>
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

    public test_scrollabeHeight_vertical_orientation_when_content_is_small() {
        this.testView.orientation = enums.Orientation.vertical;
        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 100;
        this.testView.content = btn;

        this.waitUntilTestElementLayoutIsValid();
        TKUnit.assertEqual(this.testView.scrollableHeight, 0, "this.testView.scrollableHeight");
        TKUnit.assertEqual(this.testView.scrollableWidth, 0, "this.testView.scrollableWidth");
}

    public test_scrollabeHeight_vertical_orientation_when_content_is_big() {
        this.testView.orientation = enums.Orientation.vertical;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
        this.testView.content = btn;

        this.waitUntilTestElementLayoutIsValid();
        TKUnit.assertAreClose(this.testView.scrollableHeight, 200, 0.4, "this.testView.scrollableHeight");
        TKUnit.assertEqual(this.testView.scrollableWidth, 0, "this.testView.scrollableWidth");

}

    public test_scrollabeWidth_horizontal_orientation_when_content_is_small() {
        this.testView.orientation = enums.Orientation.vertical;
        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 100;
        this.testView.content = btn;

        this.waitUntilTestElementLayoutIsValid();
        TKUnit.assertEqual(this.testView.scrollableHeight, 0, "this.testView.scrollableHeight");
        TKUnit.assertEqual(this.testView.scrollableWidth, 0, "this.testView.scrollableWidth");
}

    public test_scrollabeWidth_horizontal_orientation_when_content_is_big() {
        this.testView.orientation = enums.Orientation.horizontal;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
        this.testView.content = btn;

        this.waitUntilTestElementLayoutIsValid();
        TKUnit.assertEqual(this.testView.scrollableHeight, 0, "this.testView.scrollableHeight");
        TKUnit.assertAreClose(this.testView.scrollableWidth, 300, 0.4, "this.testView.scrollableWidth");
}

    public test_scrollToVerticalOffset_no_animation() {
        this.testView.orientation = enums.Orientation.vertical;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
        this.testView.content = btn;
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.verticalOffset, 0, "this.testView.verticalOffset");
        this.testView.scrollToVerticalOffset(100, false);
        TKUnit.assertAreClose(this.testView.verticalOffset, 100, 0.1, "this.testView.verticalOffset");
}

    public test_scrollToVerticalOffset_with_animation() {
        this.testView.orientation = enums.Orientation.vertical;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
        this.testView.content = btn;
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.verticalOffset, 0, "this.testView.verticalOffset");
        this.testView.scrollToVerticalOffset(100, true);

    // No synchronous change. 
        TKUnit.assertEqual(this.testView.verticalOffset, 0, "this.testView.verticalOffset");

        TKUnit.waitUntilReady(() => { return TKUnit.areClose(this.testView.verticalOffset, 100, 0.1); });

    // The scrolling animation should be finished by now
        TKUnit.assertAreClose(this.testView.verticalOffset, 100, 0.1, "this.testView.verticalOffset");
}

    public test_scrollToHorizontalOffset_no_animation() {
        this.testView.orientation = enums.Orientation.horizontal;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
        this.testView.content = btn;
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.horizontalOffset, 0, "this.testView.horizontalOffset");
        this.testView.scrollToHorizontalOffset(100, false);
        TKUnit.assertAreClose(this.testView.horizontalOffset, 100, 0.1, "this.testView.horizontalOffset");
}

    public test_scrollToHorizontalOffset_with_animation() {
        this.testView.orientation = enums.Orientation.horizontal;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
        this.testView.content = btn;
        this.waitUntilTestElementLayoutIsValid();

        TKUnit.assertEqual(this.testView.horizontalOffset, 0, "this.testView.horizontalOffset");
        this.testView.scrollToHorizontalOffset(100, true);

    // No synchronous change. 
        TKUnit.assertEqual(this.testView.horizontalOffset, 0, "this.testView.horizontalOffset");

        TKUnit.waitUntilReady(() => { return TKUnit.areClose(this.testView.horizontalOffset, 100, 0.1); });

    // The scrolling animation should be finished by now
        TKUnit.assertAreClose(this.testView.horizontalOffset, 100, 0.1, "this.testView.horizontalOffset");
}

    public test_scrollView_persistsState_vertical() {
        this.testView.orientation = enums.Orientation.vertical;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
        this.testView.content = btn;
        this.waitUntilTestElementLayoutIsValid();

        this.testView.scrollToVerticalOffset(100, false);

        TKUnit.assertAreClose(this.testView.verticalOffset, 100, 0.1, "this.testView.verticalOffset before navigation");

    helper.do_PageTest_WithButton((t) => {
        // Just navigate forward and back.
    });

    // Wait for the page to reload.
        TKUnit.waitUntilReady(() => { return TKUnit.areClose(this.testView.verticalOffset, 100, 0.1); });

    // Check verticalOffset after navigation
        TKUnit.assertAreClose(this.testView.verticalOffset, 100, 0.1, "this.testView.verticalOffset after navigation");
}

    public test_scrollView_persistsState_horizontal() {
        this.testView.orientation = enums.Orientation.horizontal;

        this.testView.width = 200;
        this.testView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
        this.testView.content = btn;
        this.waitUntilTestElementLayoutIsValid();

        this.testView.scrollToHorizontalOffset(100, false);

        TKUnit.assertAreClose(this.testView.horizontalOffset, 100, 0.1, "this.testView.horizontalOffset before navigation");

    helper.do_PageTest_WithButton((t) => {
        // Just navigate forward and back.
    });

    // Wait for the page to reload.
        TKUnit.waitUntilReady(() => { return TKUnit.areClose(this.testView.horizontalOffset, 100, 0.1); });

    // Check verticalOffset after navigation
        TKUnit.assertAreClose(this.testView.horizontalOffset, 100, 0.1, "this.testView.horizontalOffset after navigation");
    }
}

export function createTestCase(): ScrollLayoutTest {
    return new ScrollLayoutTest();
}
