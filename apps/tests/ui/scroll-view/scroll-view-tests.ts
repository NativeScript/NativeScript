import TKUnit = require("../../TKUnit");
import app = require("application");
import helper = require("../helper");
import buttonModule = require("ui/button");
import page = require("ui/page");
import button = require("ui/button");
import enums = require("ui/enums");

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

var ASYNC = 5;
var tmp: buttonModule.Button;
var newPage: page.Page;

// <snippet module="ui/scroll-view" title="scroll-view">
// ### Creating a ScrollView
// ``` JavaScript
var scrollView = new scrollViewModule.ScrollView();
// ```
// </snippet>

export function setUpModule() {
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        tmp = new buttonModule.Button();
        tmp.text = "Loading test";
        newPage.content = tmp;
        return newPage;
    };

    helper.navigate(pageFactory);
}

export function tearDownModule() {
    helper.goBack();
    tmp = null;
    newPage = null;
    scrollView = null;
}

export function setUp() {
    scrollView = new scrollViewModule.ScrollView();
    newPage.content = scrollView;
}

export function tearDown() {
    newPage.content = tmp;
}

function waitForLayout() {
    TKUnit.waitUntilReady(function () {
        return scrollView.content.isLayoutValid;
    }, ASYNC);
}

export function test_default_TNS_values() {
    TKUnit.assertEqual(scrollView.orientation, enums.Orientation.vertical, "Default scrollView.orientation");
    TKUnit.assertEqual(scrollView.verticalOffset, 0, "Default scrollView.verticalOffset");
    TKUnit.assertEqual(scrollView.horizontalOffset, 0, "Default scrollView.horizontalOffset");
}

export function test_vertical_orientation_creates_correct_native_view() {
    scrollView.orientation = enums.Orientation.vertical;

    if (app.android) {
        TKUnit.assert(scrollView.android instanceof android.widget.ScrollView, "android property is android.widget.ScrollView");
    }
    else if (app.ios) {
        TKUnit.assert(scrollView.ios instanceof UIScrollView, "ios property is UIScrollView");
    }
}

export function test_horizontal_orientation_creates_correct_native_view() {
    scrollView.orientation = enums.Orientation.horizontal;

    if (app.android) {
        TKUnit.assert(scrollView.android instanceof android.widget.HorizontalScrollView, "android property is android.widget.HorizontalScrollView");
    }
    else if (app.ios) {
        TKUnit.assert(scrollView.ios instanceof UIScrollView, "ios property is UIScrollView");
    }
}

export function test_scrollableHeight_vertical_orientation_when_content_is_small() {
    scrollView.orientation = enums.Orientation.vertical;
    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 100;
    scrollView.content = btn;

    waitForLayout();
    TKUnit.assertEqual(scrollView.scrollableHeight, 0, "scrollView.scrollableHeight");
    TKUnit.assertEqual(scrollView.scrollableWidth, 0, "scrollView.scrollableWidth");
}

export function test_scrollableHeight_vertical_orientation_when_content_is_big() {
    scrollView.orientation = enums.Orientation.vertical;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
    scrollView.content = btn;

    waitForLayout();
    TKUnit.assertAreClose(scrollView.scrollableHeight, 200, 0.4, "scrollView.scrollableHeight");
    TKUnit.assertEqual(scrollView.scrollableWidth, 0, "scrollView.scrollableWidth");

}

export function test_scrollableWidth_horizontal_orientation_when_content_is_small() {
    scrollView.orientation = enums.Orientation.vertical;
    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 100;
    scrollView.content = btn;

    waitForLayout();
    TKUnit.assertEqual(scrollView.scrollableHeight, 0, "scrollView.scrollableHeight");
    TKUnit.assertEqual(scrollView.scrollableWidth, 0, "scrollView.scrollableWidth");
}

export function test_scrollableWidth_horizontal_orientation_when_content_is_big() {
    scrollView.orientation = enums.Orientation.horizontal;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
    scrollView.content = btn;

    waitForLayout();
    TKUnit.assertEqual(scrollView.scrollableHeight, 0, "scrollView.scrollableHeight");
    TKUnit.assertAreClose(scrollView.scrollableWidth, 300, 0.4, "scrollView.scrollableWidth");
}

export function test_scrollToVerticalOffset_no_animation() {
    scrollView.orientation = enums.Orientation.vertical;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
    scrollView.content = btn;
    waitForLayout();

    TKUnit.assertEqual(scrollView.verticalOffset, 0, "scrollView.verticalOffset");
    scrollView.scrollToVerticalOffset(100, false);
    TKUnit.assertAreClose(scrollView.verticalOffset, 100, 0.1, "scrollView.verticalOffset");
}

export function test_scrollToVerticalOffset_with_animation() {
    scrollView.orientation = enums.Orientation.vertical;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
    scrollView.content = btn;
    waitForLayout();

    TKUnit.assertEqual(scrollView.verticalOffset, 0, "scrollView.verticalOffset");
    scrollView.scrollToVerticalOffset(100, true);

    // No synchronous change. 
    TKUnit.assertEqual(scrollView.verticalOffset, 0, "scrollView.verticalOffset");

    TKUnit.waitUntilReady(() => { return scrollView.verticalOffset === 100 }, ASYNC);

    // The scrolling animation should be finished by now
    TKUnit.assertAreClose(scrollView.verticalOffset, 100, 0.1, "scrollView.verticalOffset");
}

export function test_scrollToHorizontalOffset_no_animation() {
    scrollView.orientation = enums.Orientation.horizontal;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
    scrollView.content = btn;
    waitForLayout();

    TKUnit.assertEqual(scrollView.horizontalOffset, 0, "scrollView.horizontalOffset");
    scrollView.scrollToHorizontalOffset(100, false);
    TKUnit.assertAreClose(scrollView.horizontalOffset, 100, 0.1, "scrollView.horizontalOffset");
}

export function test_scrollToHorizontalOffset_with_animation() {
    scrollView.orientation = enums.Orientation.horizontal;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
    scrollView.content = btn;
    waitForLayout();

    TKUnit.assertEqual(scrollView.horizontalOffset, 0, "scrollView.horizontalOffset");
    scrollView.scrollToHorizontalOffset(100, true);

    // No synchronous change. 
    TKUnit.assertEqual(scrollView.horizontalOffset, 0, "scrollView.horizontalOffset");

    TKUnit.waitUntilReady(() => { return scrollView.horizontalOffset === 100 }, ASYNC);

    // The scrolling animation should be finished by now
    TKUnit.assertAreClose(scrollView.horizontalOffset, 100, 0.1, "scrollView.horizontalOffset");
}

export function test_scrollView_persistsState_vertical() {
    scrollView.orientation = enums.Orientation.vertical;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.height = 500;
    scrollView.content = btn;
    waitForLayout();

    scrollView.scrollToVerticalOffset(100, false);

    TKUnit.assertAreClose(scrollView.verticalOffset, 100, 0.1, "scrollView.verticalOffset before navigation");

    helper.do_PageTest_WithButton((t) => {
        // Just navigate forward and back.
    });

    // Wait for the page to reload.
    TKUnit.waitUntilReady(function () {
        return Math.abs(scrollView.verticalOffset - 100) < 0.1;
    }, ASYNC);

    // Check verticalOffset after navigation
    TKUnit.assertAreClose(scrollView.verticalOffset, 100, 0.1, "scrollView.verticalOffset after navigation");
}

export function test_scrollView_persistsState_horizontal() {
    scrollView.orientation = enums.Orientation.horizontal;

    scrollView.width = 200;
    scrollView.height = 300;

    var btn = new button.Button();
    btn.text = "test";
    btn.width = 500;
    scrollView.content = btn;
    waitForLayout();

    scrollView.scrollToHorizontalOffset(100, false);

    TKUnit.assertAreClose(scrollView.horizontalOffset, 100, 0.1, "scrollView.horizontalOffset before navigation");

    helper.do_PageTest_WithButton((t) => {
        // Just navigate forward and back.
    });

    // Wait for the page to reload.
    TKUnit.waitUntilReady(function () {
        return Math.abs(scrollView.horizontalOffset - 100) < 0.1;
    }, ASYNC);

    // Check verticalOffset after navigation
    TKUnit.assertAreClose(scrollView.horizontalOffset, 100, 0.1, "scrollView.horizontalOffset after navigation");
}

export function test_scrollView_addChild_removeChild() {
    scrollView.orientation = enums.Orientation.horizontal;

    scrollView.width = 100;
    scrollView.height = 100;

    var btn = new button.Button();
    btn.text = "test";
    scrollView.addChild(btn);

    TKUnit.assertEqual(scrollView.content, btn, "scrollView.content addChild");

    scrollView.removeChild();
    TKUnit.assertNull(scrollView.content, "scrollView.content removeChild");
}