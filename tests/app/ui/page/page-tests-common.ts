// >> article-require-page-module
import pageModule = require("ui/page");
// FrameModule is needed in order to have an option to navigate to the new page.
import frameModule = require("ui/frame");
// << article-require-page-module

// >> article-set-bindingcontext
function pageLoaded(args) {
  let page = args.object;
  page.bindingContext = { name : "Some name" };
}
exports.pageLoaded = pageLoaded;
// << article-set-bindingcontext
import TKUnit = require("../../TKUnit");
import labelModule = require("ui/label");
import {StackLayout} from "ui/layouts/stack-layout";
import helper = require("../helper");
import view = require("ui/core/view");
import observable = require("data/observable");
import {Page, ShownModallyData, NavigatedData} from "ui/page";
import {Label} from "ui/label";
import {EventData} from "data/observable";
import {widthProperty} from "ui/styling/style"
import platform = require("platform");

export function addLabelToPage(page: Page, text?: string) {
    let label = new Label();
    label.text = text || "The quick brown fox jumps over the lazy dog.";
    page.content = label;
}

export function test_AfterPageLoaded_is_called_NativeInstance_is_created() {
    let page: Page;
    let label: Label;
    let nativeInstanceCreated = false;

    let handler = function (data) {
        if (label.ios || label.android) {
            nativeInstanceCreated = true;
        }
    }

    let pageFactory = function (): Page {
        page = new Page();
        page.id = `page_test_AfterPageLoaded_is_called_NativeInstance_is_created`;
        page.on(view.View.loadedEvent, handler);

        label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    TKUnit.assertTrue(nativeInstanceCreated, "nativeInstanceCreated");
    page.off(view.View.loadedEvent, handler);
}

export function test_PageLoaded_is_called_once() {

    let page1: Page;
    let page2: Page;

    let loaded = 0;
    let handler = function (data) {
        loaded++;
    }

    let pageFactory = function (): Page {
        page1 = new Page();
        page1.id = `page1_test_PageLoaded_is_called_once`;
        addLabelToPage(page1, "Page 1");
        return page1;
    };

    helper.navigate(pageFactory);
    TKUnit.assertEqual(loaded, 0);

    let pageFactory2 = function (): Page {
        page2 = new Page();
        page2.id = `page2_test_PageLoaded_is_called_once`;
        addLabelToPage(page2, "Page 2");
        page2.on(view.View.loadedEvent, handler);
        return page2;
    };

    helper.navigate(pageFactory2);

    TKUnit.assertEqual(loaded, 1);
    page2.off(view.View.loadedEvent, handler);
}

export function test_NavigateToNewPage() {
    // >> artivle-create-navigate-to-page
    let currentPage;
    let topFrame = frameModule.topmost();
    currentPage = topFrame.currentPage;
    
    let testPage: Page;
    let pageFactory = function (): Page {
        testPage = new pageModule.Page();
        let label = new labelModule.Label();
        label.text = "The quick brown fox jumps over the lazy dog.";
        testPage.content = label;
        return testPage;
    };

    let navEntry = {
        create: pageFactory,
        animated: false
    };
    topFrame.navigate(navEntry);
    // << artivle-create-navigate-to-page

    TKUnit.waitUntilReady(() => { return testPage.isLayoutValid });

    // >> article-navigating-backward
    topFrame.goBack();
    // << article-navigating-backward

    TKUnit.waitUntilReady(() => { return topFrame.currentPage !== null && topFrame.currentPage === currentPage });
    TKUnit.assert(testPage.parent === undefined, "Page.parent should become undefined after navigating back");
    TKUnit.assert(testPage._context === undefined, "Page._context should become undefined after navigating back");
    TKUnit.assert(testPage.isLoaded === false, "Page.isLoaded should become false after navigating back");
    TKUnit.assert(testPage.frame === undefined, "Page.frame should become undefined after navigating back");
    TKUnit.assert(testPage._isAddedToNativeVisualTree === false, "Page._isAddedToNativeVisualTree should become false after navigating back");
}

export function test_PageNavigation_EventSequence_WithTransition() {
    _test_PageNavigation_EventSequence(true);
}

export function test_PageNavigation_EventSequence_WithoutTransition() {
    _test_PageNavigation_EventSequence(false);
}

function _test_PageNavigation_EventSequence(withTransition: boolean) {
    let testPage: Page;
    let context = { property: "this is the context" };
    let eventSequence = [];
    let pageFactory = function () {
        testPage = new Page();
        testPage.id = "testPage_test_PageNavigation_EventSequence";
        addLabelToPage(testPage);

        testPage.on(Page.navigatingToEvent, function (data: NavigatedData) {
            eventSequence.push("navigatingTo");
            TKUnit.assertEqual(data.context, context, "navigatingTo: navigationContext");
        });

        testPage.on(Page.loadedEvent, function (data: observable.EventData) {
            eventSequence.push("loaded");
            TKUnit.assertNotEqual(frameModule.topmost().currentPage, data.object);
        });

        testPage.on(Page.navigatedToEvent, function (data: NavigatedData) {
            eventSequence.push("navigatedTo");
            TKUnit.assertEqual(data.context, context, "navigatedTo : navigationContext");
            TKUnit.assertEqual(frameModule.topmost().currentPage, data.object);
        });

        testPage.on(Page.navigatingFromEvent, function (data: NavigatedData) {
            eventSequence.push("navigatingFrom");
            TKUnit.assertEqual(data.context, context, "navigatingFrom: navigationContext");
        });

        testPage.on(Page.navigatedFromEvent, function (data: NavigatedData) {
            eventSequence.push("navigatedFrom");
            TKUnit.assertEqual(data.context, context, "navigatedFrom: navigationContext");
        });

        testPage.on(Page.unloadedEvent, function (data) {
            eventSequence.push("unloaded");
        });

        return testPage;
    };

    let navigationEntry: frameModule.NavigationEntry;
    if (withTransition) {
        navigationEntry = {
            create: pageFactory,
            context: context,
            animated: true,
            transition: {
                name: "slide",
                duration: 100,
            }
        }
    }
    else {
        navigationEntry = {
            create: pageFactory,
            context: context,
            animated: false
        }
    }
    helper.navigateWithEntry(navigationEntry);
    helper.goBack();

    let expectedEventSequence = ["navigatingTo", "loaded", "navigatedTo", "navigatingFrom", "unloaded", "navigatedFrom"];
    TKUnit.arrayAssert(eventSequence, expectedEventSequence, "Actual event sequence is not equal to expected. Actual: " + eventSequence + "; Expected: " + expectedEventSequence);
}

export function test_NavigateTo_WithContext() {
    let currentPage = frameModule.topmost().currentPage;
    // >> article-pass-data
    let testPage: pageModule.Page;
    let pageFactory = function (): pageModule.Page {
        testPage = new pageModule.Page();
        testPage.on(pageModule.Page.navigatedToEvent, function () {
            //console.log(JSON.stringify(context));
        });
        return testPage;
    };
    let navEntry = {
        create: pageFactory,
        context: "myContext",
        animated: false
    };
    let topFrame = frameModule.topmost();
    topFrame.navigate(navEntry);
    // << article-pass-data
    TKUnit.waitUntilReady(() => topFrame.currentPage !== null && topFrame.currentPage !== currentPage && testPage.isLayoutValid);

    let actualContextValue = testPage.navigationContext;
    TKUnit.assertEqual(actualContextValue, "myContext");

    helper.goBack();
    TKUnit.assertNull(testPage.navigationContext, "Navigation context should be cleared on navigating back");
}

//https://github.com/NativeScript/NativeScript/issues/731
export function test_NavigateTo_WithBindingContext() {
    let currentPage = frameModule.topmost().currentPage;
    let testPage: Page;
    let bindingContext;
    let pageFactory = function (): Page {
        testPage = new Page();
        testPage.on(pageModule.Page.navigatingToEvent, function (args: NavigatedData) {
            bindingContext = (<Page>args.object).bindingContext; 
        });
        return testPage;
    };
    let navEntry = {
        create: pageFactory,
        bindingContext: "bindng context",
        animated: false
    };
    let topFrame = frameModule.topmost();
    topFrame.navigate(navEntry);
    TKUnit.waitUntilReady(() => topFrame.currentPage !== null && topFrame.currentPage !== currentPage && testPage.isLayoutValid);
    helper.goBack();
    
    TKUnit.assertEqual(bindingContext, navEntry.bindingContext, "The Page's bindingContext should be equal to the NavigationEntry.bindingContext property when navigating to.");
}

export function test_FrameBackStack_WhenNavigatingForwardAndBack() {
    let testPage: Page;
    let pageFactory = function () {
        testPage = new Page();
        testPage.id = "testPage_test_FrameBackStack_WhenNavigatingForwardAndBack";
        addLabelToPage(testPage);
        return testPage;
    };

    helper.navigateWithHistory(pageFactory);

    let topFrame = frameModule.topmost();
    TKUnit.assertEqual(topFrame.backStack.length, 1);
    TKUnit.assertTrue(topFrame.canGoBack(), "topFrame.canGoBack() should be true");

    helper.goBack();

    TKUnit.assertEqual(topFrame.backStack.length, 0);
    TKUnit.assertFalse(topFrame.canGoBack(), "topFrame.canGoBack() should be false");
}

export function test_LoadPageFromModule() {
    let topFrame = frameModule.topmost();
    helper.navigateToModule("ui/page/test-page-module");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module.");
    let testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page module.");
}

export function test_LoadPageFromDeclarativeWithCSS() {
    let topFrame = frameModule.topmost();
    helper.navigateToModule("ui/page/test-page-declarative-css");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module-css.");
    let testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page declarative file with css.");
    TKUnit.assertEqual(testLabel.style.backgroundColor.hex, "#ff00ff00");
}

export function test_LoadPageFromModuleWithCSS() {
    let topFrame = frameModule.topmost();
    helper.navigateToModule("ui/page/test-page-module-css");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module-css.");
    let testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page module css.");
    TKUnit.assertEqual(testLabel.style.backgroundColor.hex, "#ff00ff00");
}

export function test_NavigateToPageCreatedWithNavigationEntry() {
    let expectedText = "Label created with a NavigationEntry";
    let testPage: Page;
    let pageFactory = function () {
        testPage = new Page();
        testPage.id = "testPage_test_NavigateToPageCreatedWithNavigationEntry";
        addLabelToPage(testPage, expectedText);
        return testPage;
    };

    helper.navigate(pageFactory);

    let actualContent = <Label>testPage.content;
    TKUnit.assertEqual(actualContent.text, expectedText);
}

export function test_cssShouldBeAppliedToAllNestedElements() {
    let expectedText = "Some text";
    let testPage = new Page();
    testPage.id = "testPage_test_cssShouldBeAppliedToAllNestedElements";
    let label = new Label();
    label.text = expectedText;

    let stackLayout = new StackLayout();
    stackLayout.addChild(label);
    testPage.content = stackLayout;
    testPage.css = "stackLayout {background-color: #ffff0000;} label {background-color: #ff00ff00;}";

    let pageFactory = function () {
        return testPage;
    };

    helper.navigate(pageFactory);
    
    TKUnit.assertEqual(label.style.backgroundColor.hex, "#ff00ff00");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#ffff0000");
}

export function test_cssShouldBeAppliedAfterChangeToAllNestedElements() {
    let expectedText = "Some text";
    let testPage = new Page();
    testPage.id = "testPage_test_cssShouldBeAppliedAfterChangeToAllNestedElements";
    let label = new Label();
    label.text = expectedText;

    let stackLayout = new StackLayout();
    stackLayout.addChild(label);
    testPage.content = stackLayout;
    testPage.css = "stackLayout {background-color: #ffff0000;} label {background-color: #ff00ff00;}";

    let pageFactory = function () {
        return testPage;
    };

    helper.navigate(pageFactory);

    TKUnit.assertEqual(label.style.backgroundColor.hex, "#ff00ff00");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#ffff0000");

    testPage.css = "stackLayout {background-color: #ff0000ff;} label {background-color: #ffff0000;}";
    TKUnit.assertEqual(label.style.backgroundColor.hex, "#ffff0000");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#ff0000ff");
}

export function test_page_backgroundColor_is_white() {
    let page = new Page();
    page.id = "page_test_page_backgroundColor_is_white";
    let factory = () => page;
    helper.navigate(factory);
    TKUnit.assertEqual(page.style.backgroundColor.hex.toLowerCase(), "#ffffff", "page background-color");
}

export function test_WhenPageIsLoadedFrameCurrentPageIsNotYetTheSameAsThePage() {
    let page;
    let loadedEventHandler = function (args) {
        TKUnit.assertNotEqual(frameModule.topmost().currentPage, args.object, "When a page is loaded it should not yet be the current page.");
    }

    let pageFactory = function (): Page {
        page = new Page();
        page.id = "page_test_WhenPageIsLoadedFrameCurrentPageIsNotYetTheSameAsThePage";
        page.on(view.View.loadedEvent, loadedEventHandler);
        let label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(view.View.loadedEvent, loadedEventHandler);
}

export function test_WhenPageIsNavigatedToFrameCurrentPageIsNowTheSameAsThePage() {
    let page;
    let navigatedEventHandler = function (args) {
        TKUnit.assertEqual(frameModule.topmost().currentPage, args.object, `frame.topmost().currentPage should be equal to args.object page instance in the page.navigatedTo event handler. Expected: ${args.object.id}; Actual: ${frameModule.topmost().currentPage.id};`);
    }

    let pageFactory = function (): Page {
        page = new Page();
        page.id = "page_test_WhenPageIsNavigatedToFrameCurrentPageIsNowTheSameAsThePage";
        page.on(Page.navigatedToEvent, navigatedEventHandler);
        let label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(view.View.loadedEvent, navigatedEventHandler);
}

export function test_WhenNavigatingForwardAndBack_IsBackNavigationIsCorrect() {
    let page1;
    let page2;
    let forwardCounter = 0;
    let backCounter = 0;
    let navigatedEventHandler = function (args: NavigatedData) {
        if (args.isBackNavigation) {
            backCounter++;
        }
        else {
            forwardCounter++;
        }
    }

    let pageFactory1 = function (): Page {
        page1 = new Page();
        page1.id = "page1_test_WhenNavigatingForwardAndBack_IsBackNavigationIsCorrect";
        page1.on(Page.navigatedToEvent, navigatedEventHandler);
        return page1;
    };

    let pageFactory2 = function (): Page {
        page2 = new Page();
        page2.id = "page2_test_WhenNavigatingForwardAndBack_IsBackNavigationIsCorrect";
        page2.on(Page.navigatedToEvent, navigatedEventHandler);
        return page2;
    };

    helper.navigateWithHistory(pageFactory1);
    helper.navigateWithHistory(pageFactory2);

    helper.goBack();

    TKUnit.assertEqual(forwardCounter, 2, "Forward navigation counter should be 2");
    TKUnit.assertEqual(backCounter, 1, "Backward navigation counter should be 1");
    page1.off(Page.navigatedToEvent, navigatedEventHandler);
    page2.off(Page.navigatedToEvent, navigatedEventHandler);

    helper.goBack();
}

export function test_WhenPageIsNavigatedToItCanShowAnotherPageAsModal() {
    if (platform.device.os === platform.platformNames.android
        && android.os.Build.VERSION.SDK_INT === android.os.Build.VERSION_CODES.JELLY_BEAN_MR1
        && android.os.Build.CPU_ABI.indexOf("x86") !== -1) {
        // Skip this test on x68 Android with API Level 17
        return;
    }

    let masterPage;
    let ctx = {
        shownModally: false
    };

    let modalClosed = false;
    let modalCloseCallback = function (returnValue: any) {
        TKUnit.assertTrue(ctx.shownModally, "Modal-page must be shown!");
        TKUnit.assertEqual(returnValue, "return value", "Modal-page must return value!");
        modalClosed = true;
    }

    let modalPage: Page;

    let shownModally = 0;
    let onShownModal = function (args: ShownModallyData) {
        shownModally++;
        modalPage.off(Page.shownModallyEvent, onShownModal);
    }

    let modalLoaded = 0;
    let onModalLoaded = function (args: EventData) {
        modalLoaded++;
        modalPage.off(Page.loadedEvent, onModalLoaded);
    }

    let modalUnloaded = 0;
    let onModalUnloaded = function (args: EventData) {
        modalUnloaded++;
        modalPage.off(Page.unloadedEvent, onModalUnloaded);
        TKUnit.assertNull(masterPage.modal, "currentPage.modal should be undefined when no modal page is shown!");
    }

    let navigatedToEventHandler = function (args) {
        let page = <Page>args.object;
        TKUnit.assertNull(page.modal, "currentPage.modal should be undefined when no modal page is shown!");
        let basePath = "ui/page/";
        let entry: frameModule.NavigationEntry = {
            moduleName: basePath + "modal-page"
        };

        modalPage = <Page>frameModule.resolvePageFromEntry(entry);
        modalPage.on(Page.shownModallyEvent, onShownModal);
        modalPage.on(Page.loadedEvent, onModalLoaded);
        modalPage.on(Page.unloadedEvent, onModalUnloaded);

        page.showModal(modalPage, ctx, modalCloseCallback, false);
        TKUnit.assertTrue((<any>modalPage).showingModally, "showingModally");
    };

    let masterPageFactory = function (): Page {
        masterPage = new Page();
        masterPage.id = "masterPage_test_WhenPageIsNavigatedToItCanShowAnotherPageAsModal";
        masterPage.on(Page.navigatedToEvent, navigatedToEventHandler);
        let label = new Label();
        label.text = "Text";
        masterPage.content = label;
        return masterPage;
    };

    helper.navigate(masterPageFactory);

    TKUnit.waitUntilReady(() => { return modalUnloaded > 0; });
    TKUnit.assertEqual(shownModally, 1, "shownModally");
    TKUnit.assertEqual(modalLoaded, 1, "modalLoaded");
    TKUnit.assertEqual(modalUnloaded, 1, "modalUnloaded");

    masterPage.off(Page.navigatedToEvent, navigatedToEventHandler);
}

export function  test_percent_width_and_height_support() {
    let testPage = new Page();
    testPage.id = "test_percent_width_and_height_support";

    let stackLayout = new StackLayout();
    (<any>stackLayout).width = "50%";
    (<any>stackLayout).height = "50%";

    testPage.content = stackLayout; 

    let pageWidth = testPage.getMeasuredWidth();
    let pageHeight = testPage.getMeasuredHeight()

    TKUnit.assertEqual(pageWidth, Math.round(pageWidth / 2), "Current page MeasuredWidth incorrect");
    TKUnit.assertEqual(pageHeight, Math.round(pageHeight / 2), "Current page MeasuredHeight incorrect");

    //reset values.
    testPage.height = Number.NaN;
    (<any>testPage.style)._resetValue(widthProperty);
    
    testPage.height = Number.NaN;

    TKUnit.assert(isNaN(testPage.width), "width");
    TKUnit.assert(isNaN(testPage.height), "height");
}

export function  test_percent_margin_support() {
    let testPage = new Page();
    testPage.id = "ttest_percent_margin_support";

    let stackLayout = new StackLayout();
    stackLayout.margin = "10%";
    testPage.content = stackLayout;

    let pageWidth = testPage.getMeasuredWidth();
    let pageHeight = testPage.getMeasuredHeight()

    let marginLeft = pageWidth * 0.1;
    let marginTop = pageHeight * 0.1;

    let bounds = stackLayout._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, Math.round(marginLeft), "Page's content LEFT position incorrect");
    TKUnit.assertEqual(bounds.top, Math.round(marginTop), "Page's content  TOP position incorrect");
    TKUnit.assertEqual(bounds.right, Math.round(marginLeft + pageWidth), "Page's content  RIGHT position incorrect");
    TKUnit.assertEqual(bounds.bottom, Math.round(marginTop + pageHeight), "Page's content  BOTTOM position incorrect");

    //reset values.
    testPage.margin = "0";

    TKUnit.assertEqual(testPage.marginLeft, 0, "marginLeft");
    TKUnit.assertEqual(testPage.marginTop, 0, "marginTop");
    TKUnit.assertEqual(testPage.marginRight, 0, "marginRight");
    TKUnit.assertEqual(testPage.marginBottom, 0, "marginBottom");
}

//export function test_ModalPage_Layout_is_Correct() {
//    let testPage: Page;
//    let label: Label;
//    let pageFactory = function () {
//        testPage = new Page();
//        label = new Label();
//        label.text = "Will Show modal page";
//        testPage.content = label;
//        return testPage;
//    };

//    helper.navigate(pageFactory);
//    let basePath = "ui/page/";
//    testPage.showModal(basePath + "page21", testPage, () => { }, false);

//    // TODO: Remove this once navigate and showModal returns Promise<Page>.
//    TKUnit.wait(0.350);
//    let childPage = (<any>testPage).childPage;
//    let closeCallback: Function = (<any>testPage).close;

//    try {
//        let layout = <StackLayout>childPage.content;
//        let repeater = layout.getChildAt(1);
//        TKUnit.assertTrue(repeater.isLayoutValid, "layout should be valid.");
//        let bounds = repeater._getCurrentLayoutBounds();
//        let height = bounds.bottom - bounds.top;
//        TKUnit.assertTrue(height > 0, "Layout should be >0.");

//        closeCallback();
//        TKUnit.wait(0.150);
//    }
//    finally {
//        helper.goBack
//        helper.goBack();
//    }
//}
