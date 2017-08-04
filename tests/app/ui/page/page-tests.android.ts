import * as TKUnit from "../../TKUnit";
import * as helper from "../helper";
import * as PageTestCommon from "./page-tests-common";
import { Page } from "tns-core-modules/ui/page";
import { Label } from "tns-core-modules/ui/label";
import { topmost } from "tns-core-modules/ui/frame";

global.moduleMerge(PageTestCommon, exports);

export function test_NavigateToNewPage_WithAndroidCache() {
    // Clear history if any.
    helper.navigate(() => {
        const launchPage = new Page();
        launchPage.id = "launchPage_test_NavigateToNewPage_WithAndroidCache";
        return launchPage;
    });

    TKUnit.assertEqual(topmost().backStack.length, 0, "The backstack should be empty before this test can be run.");

    let testPage: Page;
    let label: Label;

    const pageFactory = function (): Page {
        testPage = new Page();
        testPage.id = "testPage_test_NavigateToNewPage_WithAndroidCache";
        label = new Label();
        label.text = "The quick brown fox jumps over the lazy dog.";
        testPage.content = label;
        return testPage;
    };

    const androidFrame = topmost().android;
    const cachingBefore = androidFrame.cachePagesOnNavigate;
    try {
        androidFrame.cachePagesOnNavigate = true;
        helper.navigateWithHistory(pageFactory);
        helper.goBack();
    } finally {
        androidFrame.cachePagesOnNavigate = cachingBefore;
    }

    TKUnit.assertNull(testPage.parent, "Page.parent should become undefined after navigating back");
    TKUnit.assertFalse(testPage.isLoaded, "Page.isLoaded should become false after navigating back");
    TKUnit.assertNull(testPage.frame, "Page.frame should become undefined after navigating back");
    TKUnit.assertFalse(testPage._isAddedToNativeVisualTree, "Page._isAddedToNativeVisualTree should become false after navigating back");

    TKUnit.assertNull(label._context, "InnerControl._context should not be set after navigate back.");
    TKUnit.assertNull(label.android, "InnerControl.android should not be set after navigate back.");
    TKUnit.assertNull(label.nativeViewProtected, "InnerControl.nativeView hould not be set after navigate back.");
    TKUnit.assertFalse(label.isLoaded, "InnerControl.isLoaded should become false after navigating back");
    TKUnit.assertFalse(label._isAddedToNativeVisualTree, "InnerControl._isAddedToNativeVisualTree should not be true after navigating back");
}

export function test_NavigateToNewPage_InnerControl() {
    let testPage: Page;
    const pageFactory = function () {
        testPage = new Page();
        testPage.id = "testPage_test_NavigateToNewPage_InnerControl";
        PageTestCommon.addLabelToPage(testPage);
        return testPage;
    };

    helper.navigateWithHistory(pageFactory);
    helper.goBack();

    const label = <Label>testPage.content;
    TKUnit.assertNull(label._context, "InnerControl._context should be undefined after navigate back.");
    TKUnit.assertNull(label.android, "InnerControl.android should be undefined after navigate back.");
    TKUnit.assertNull(label.nativeViewProtected, "InnerControl.nativeView should be undefined after navigate back.");
    TKUnit.assertFalse(label.isLoaded, "InnerControl.isLoaded should become false after navigating back");
    TKUnit.assertFalse(label._isAddedToNativeVisualTree, "InnerControl._isAddedToNativeVisualTree should become false after navigating back");
}

export function test_SetPageCaching_ToTheSameValue_AfterNavigated_DoesNotThrow() {
    const pageFactory = function () {
        const testPage = new Page();
        testPage.id = "testPage_test_SetPageCaching_ToTheSameValue_AfterNavigated_DoesNotThrow";
        return testPage;
    };

    const androidFrame = topmost().android;
    const cachingBefore = androidFrame.cachePagesOnNavigate;

    helper.navigate(pageFactory);

    try {
        // Set caching to same value.
        androidFrame.cachePagesOnNavigate = cachingBefore;
    }
    finally {
        androidFrame.cachePagesOnNavigate = cachingBefore;
    }
}

export var test_Resolve_Fragment_ForPage = function () {
    let testPage: Page;
    const pageFactory = () => {
        testPage = new Page();
        return testPage;
    };

    const frame = topmost();
    frame.navigate(pageFactory);
    TKUnit.waitUntilReady(() => frame.navigationQueueIsEmpty());

    const fragment = frame.android.fragmentForPage(testPage);
    TKUnit.assertNotNull(fragment, "Failed to resolve native fragment for page");
}