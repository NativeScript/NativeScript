import * as PageModule from "tns-core-modules/ui/page";
import * as TKUnit from "../../TKUnit";
import * as LabelModule from "tns-core-modules/ui/label";
import * as PageTestCommon from "./page-tests-common";
import * as helper from "../helper";
import * as frame from "tns-core-modules/ui/frame";
import * as types from "tns-core-modules/utils/types";

global.moduleMerge(PageTestCommon, exports);

export function test_NavigateToNewPage_WithAndroidCache() {
    // Clear history if any.
    helper.navigate(() => {
        let launchPage = new PageModule.Page();
        launchPage.id = "launchPage_test_NavigateToNewPage_WithAndroidCache";
        return launchPage;
    });

    TKUnit.assertEqual(frame.topmost().backStack.length, 0, "The backstack should be empty before this test can be run.");

    var testPage: PageModule.Page;
    var label: LabelModule.Label;

    var pageFactory = function (): PageModule.Page {
        testPage = new PageModule.Page();
        testPage.id = "testPage_test_NavigateToNewPage_WithAndroidCache";
        label = new LabelModule.Label();
        label.text = "The quick brown fox jumps over the lazy dog.";
        testPage.content = label;
        return testPage;
    };

    var androidFrame = frame.topmost().android;
    var cachingBefore = androidFrame.cachePagesOnNavigate;
    try {
        androidFrame.cachePagesOnNavigate = true;

        helper.navigateWithHistory(pageFactory);

        helper.goBack();
    }
    finally {
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
    var testPage: PageModule.Page;
    var pageFactory = function () {
        testPage = new PageModule.Page();
        testPage.id = "testPage_test_NavigateToNewPage_InnerControl";
        PageTestCommon.addLabelToPage(testPage);
        return testPage;
    };

    helper.navigateWithHistory(pageFactory);
    helper.goBack();

    var label = <LabelModule.Label>testPage.content;  

    TKUnit.assertNull(label._context, "InnerControl._context should be undefined after navigate back.");
    TKUnit.assertNull(label.android, "InnerControl.android should be undefined after navigate back.");
    TKUnit.assertNull(label.nativeViewProtected, "InnerControl.nativeView should be undefined after navigate back.");
    TKUnit.assertFalse(label.isLoaded, "InnerControl.isLoaded should become false after navigating back");
    TKUnit.assertFalse(label._isAddedToNativeVisualTree, "InnerControl._isAddedToNativeVisualTree should become false after navigating back");
}

export var test_SetPageCaching_ToTheSameValue_AfterNavigated_DoesNotThrow = function () {
    var testPage: PageModule.Page;
    var pageFactory = function () {
        var testPage = new PageModule.Page();
        testPage.id = "testPage_test_SetPageCaching_ToTheSameValue_AfterNavigated_DoesNotThrow";
        testPage.content = new LabelModule.Label();
        return testPage;
    };

    var androidFrame = frame.topmost().android;
    var cachingBefore = androidFrame.cachePagesOnNavigate;
    
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
    var testPage: PageModule.Page;
    var navigatedTo = false;
    
    var pageFactory = function () {
        testPage = new PageModule.Page();
        testPage.content = new LabelModule.Label();
        // use navigatedTo to ensure the fragment is already created
        testPage.on("navigatedTo", function(args) {
            navigatedTo = true;
        });
        return testPage;
    };

    helper.navigate(pageFactory);

    TKUnit.waitUntilReady(() => navigatedTo === true);

    var fragment = frame.topmost().android.fragmentForPage(testPage);
    TKUnit.assertFalse(types.isNullOrUndefined(fragment), "Failed to resolve native fragment for page");
}
