// >> article-require-page-module
import { Page, ShownModallyData, NavigatedData } from "tns-core-modules/ui/page";
// FrameModule is needed in order to have an option to navigate to the new page.
import { topmost, NavigationEntry } from "tns-core-modules/ui/frame";
// << article-require-page-module

import { resolvePageFromEntry } from "tns-core-modules/ui/frame";

// >> article-set-bindingcontext
function pageLoaded(args) {
    const page = args.object;
    page.bindingContext = { name: "Some name" };
}
exports.pageLoaded = pageLoaded;
// << article-set-bindingcontext
import * as TKUnit from "../../TKUnit";
import * as helper from "../helper";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { View, PercentLength, Observable, unsetValue, EventData, isIOS } from "tns-core-modules/ui/core/view";
import { Label } from "tns-core-modules/ui/label";
import { Color } from "tns-core-modules/color";

export function addLabelToPage(page: Page, text?: string) {
    const label = new Label();
    label.text = text || "The quick brown fox jumps over the lazy dog.";
    page.content = label;
}

export function test_recycling() {
    helper.nativeView_recycling_test(() => new Page());
}

export function test_AfterPageLoaded_is_called_NativeInstance_is_created() {
    let page: Page;
    let label: Label;
    let nativeInstanceCreated = false;

    const handler = (data) => nativeInstanceCreated = !!label.nativeViewProtected;
    const pageFactory = () => {
        page = new Page();
        page.id = `page_test_AfterPageLoaded_is_called_NativeInstance_is_created`;
        page.on(Label.loadedEvent, handler);

        label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    TKUnit.assertTrue(nativeInstanceCreated, "nativeInstanceCreated");
    page.off(Label.loadedEvent, handler);
}

export function test_PageLoaded_is_called_once() {

    let page1: Page;
    let page2: Page;

    let loaded = 0;
    const handler = function (data) {
        loaded++;
    }

    const pageFactory = function (): Page {
        page1 = new Page();
        page1.id = `page1_test_PageLoaded_is_called_once`;
        addLabelToPage(page1, "Page 1");
        return page1;
    };

    helper.navigate(pageFactory);
    TKUnit.assertEqual(loaded, 0);

    const pageFactory2 = function (): Page {
        page2 = new Page();
        page2.id = `page2_test_PageLoaded_is_called_once`;
        addLabelToPage(page2, "Page 2");
        page2.on(Label.loadedEvent, handler);
        return page2;
    };

    helper.navigate(pageFactory2);

    TKUnit.assertEqual(loaded, 1);
    page2.off(Label.loadedEvent, handler);
}

export function test_NavigateToNewPage() {
    // >> article-create-navigate-to-page

    const topFrame = topmost();
    const currentPage = topFrame.currentPage;

    let testPage: Page;
    const pageFactory = function (): Page {
        testPage = new Page();
        const label = new Label();
        label.text = "The quick brown fox jumps over the lazy dog.";
        testPage.content = label;
        return testPage;
    };

    const navEntry = {
        create: pageFactory,
        animated: false
    };
    topFrame.navigate(navEntry);
    // << article-create-navigate-to-page

    TKUnit.waitUntilReady(() => testPage.isLayoutValid);

    // >> article-navigating-backward
    topFrame.goBack();
    // << article-navigating-backward

    TKUnit.waitUntilReady(() => topFrame.navigationQueueIsEmpty());
    TKUnit.assertNull(testPage.parent, "Page.parent should become undefined after navigating back");
    TKUnit.assertNull(testPage._context, "Page._context should become undefined after navigating back");
    TKUnit.assertFalse(testPage.isLoaded, "Page.isLoaded should become false after navigating back");
    TKUnit.assertNull(testPage.frame, "Page.frame should become undefined after navigating back");
    TKUnit.assertFalse(testPage._isAddedToNativeVisualTree, "Page._isAddedToNativeVisualTree should become false after navigating back");
}

export function test_PageNavigation_EventSequence_WithTransition() {
    _test_PageNavigation_EventSequence(true);
}

export function test_PageNavigation_EventSequence_WithoutTransition() {
    _test_PageNavigation_EventSequence(false);
}

function _test_PageNavigation_EventSequence(withTransition: boolean) {
    const context = { property: "this is the context" };
    const eventSequence = [];

    let testPage: Page;
    const pageFactory = () => {
        testPage = new Page();
        testPage.id = "testPage_test_PageNavigation_EventSequence";
        addLabelToPage(testPage);

        testPage.on(Page.navigatingToEvent, function (data: NavigatedData) {
            eventSequence.push("navigatingTo");
            TKUnit.assertEqual(data.context, context, "navigatingTo: navigationContext");
        });

        testPage.on(Page.loadedEvent, function (data: EventData) {
            eventSequence.push("loaded");
            TKUnit.assertNotEqual(topmost().currentPage, data.object);
        });

        testPage.on(Page.navigatedToEvent, function (data: NavigatedData) {
            eventSequence.push("navigatedTo");
            TKUnit.assertEqual(data.context, context, "navigatedTo : navigationContext");
            TKUnit.assertEqual(topmost().currentPage, data.object);
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

    const navigationEntry: NavigationEntry = {
        create: pageFactory,
        context: context,
        animated: withTransition,
        transition: withTransition ? {
            name: "slide",
            duration: 10,
        } : undefined
    }

    helper.navigateWithEntry(navigationEntry);
    helper.goBack();

    const expectedEventSequence = ["navigatingTo", "loaded", "navigatedTo", "navigatingFrom", "unloaded", "navigatedFrom"];
    TKUnit.arrayAssert(eventSequence, expectedEventSequence, "Actual event sequence is not equal to expected. Actual: " + eventSequence + "; Expected: " + expectedEventSequence);
}

export function test_NavigateTo_WithContext() {
    const currentPage = topmost().currentPage;
    // >> article-pass-data
    let testPage: Page;
    const pageFactory = function (): Page {
        testPage = new Page();
        testPage.on(Page.navigatedToEvent, function () {
            //console.log(JSON.stringify(context));
        });
        return testPage;
    };

    const navEntry = {
        create: pageFactory,
        context: "myContext",
        animated: false
    };

    const topFrame = topmost();
    topFrame.navigate(navEntry);
    // << article-pass-data
    TKUnit.waitUntilReady(() => topFrame.navigationQueueIsEmpty());

    const actualContextValue = testPage.navigationContext;
    TKUnit.assertEqual(actualContextValue, "myContext");

    helper.goBack();
    TKUnit.assertNull(testPage.navigationContext, "Navigation context should be cleared on navigating back");
}

//https://github.com/NativeScript/NativeScript/issues/731
export function test_NavigateTo_WithBindingContext() {
    const currentPage = topmost().currentPage;
    let testPage: Page;
    let bindingContext;
    const pageFactory = function (): Page {
        testPage = new Page();
        testPage.on(Page.navigatingToEvent, function (args: NavigatedData) {
            bindingContext = (<Page>args.object).bindingContext;
        });
        return testPage;
    };

    const navEntry = {
        create: pageFactory,
        bindingContext: "bindng context",
        animated: false
    };

    const topFrame = topmost();
    topFrame.navigate(navEntry);
    TKUnit.waitUntilReady(() => topFrame.navigationQueueIsEmpty());
    helper.goBack();

    TKUnit.assertEqual(bindingContext, navEntry.bindingContext, "The Page's bindingContext should be equal to the NavigationEntry.bindingContext property when navigating to.");
}

export function test_FrameBackStack_WhenNavigatingForwardAndBack() {
    helper.navigate(() => new Page());
    let testPage: Page;
    const pageFactory = function () {
        testPage = new Page();
        testPage.id = "testPage_test_FrameBackStack_WhenNavigatingForwardAndBack";
        addLabelToPage(testPage);
        return testPage;
    };

    helper.navigateWithHistory(pageFactory);

    const topFrame = topmost();
    TKUnit.assertEqual(topFrame.backStack.length, 1);
    TKUnit.assertTrue(topFrame.canGoBack(), "topFrame.canGoBack() should be true");

    helper.goBack();

    TKUnit.assertEqual(topFrame.backStack.length, 0);
    TKUnit.assertFalse(topFrame.canGoBack(), "topFrame.canGoBack() should be false");
}

export function test_LoadPageFromModule() {
    const topFrame = topmost();
    helper.navigateToModule("ui/page/test-page-module");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module.");
    const testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page module.");
}

export function test_LoadPageFromDeclarativeWithCSS() {
    const topFrame = topmost();
    helper.navigateToModule("ui/page/test-page-declarative-css");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module-css.");
    const testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page declarative file with css.");
    TKUnit.assertEqual(testLabel.style.backgroundColor.hex, "#00FF00");
}

export function test_LoadPageFromModuleWithCSS() {
    const topFrame = topmost();
    helper.navigateToModule("ui/page/test-page-module-css");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module-css.");
    const testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page module css.");
    TKUnit.assertEqual(testLabel.style.backgroundColor.hex, "#00FF00");
}

export function test_NavigateToPageCreatedWithNavigationEntry() {
    const expectedText = "Label created with a NavigationEntry";
    let testPage: Page;
    const pageFactory = function () {
        testPage = new Page();
        testPage.id = "testPage_test_NavigateToPageCreatedWithNavigationEntry";
        addLabelToPage(testPage, expectedText);
        return testPage;
    };

    helper.navigate(pageFactory);

    const actualContent = <Label>testPage.content;
    TKUnit.assertEqual(actualContent.text, expectedText);
}

export function test_cssShouldBeAppliedToAllNestedElements() {
    const expectedText = "Some text";
    const testPage = new Page();
    testPage.id = "testPage_test_cssShouldBeAppliedToAllNestedElements";
    const label = new Label();
    label.text = expectedText;

    const stackLayout = new StackLayout();
    stackLayout.addChild(label);
    testPage.content = stackLayout;
    testPage.css = "stackLayout {background-color: #FFFF0000;} label {background-color: #FF00FF00;}";

    const pageFactory = function () {
        return testPage;
    };

    helper.navigate(pageFactory);

    TKUnit.assertEqual(label.style.backgroundColor.hex, "#00FF00");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#FF0000");
}

export function test_cssShouldBeAppliedAfterChangeToAllNestedElements() {
    const expectedText = "Some text";
    const testPage = new Page();
    testPage.id = "testPage_test_cssShouldBeAppliedAfterChangeToAllNestedElements";
    const label = new Label();
    label.text = expectedText;

    const stackLayout = new StackLayout();
    stackLayout.addChild(label);
    testPage.content = stackLayout;
    testPage.css = "stackLayout {background-color: #FFFF0000;} label {background-color: #FF00FF00;}";

    const pageFactory = function () {
        return testPage;
    };

    helper.navigate(pageFactory);

    TKUnit.assertEqual(label.style.backgroundColor.hex, "#00FF00");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#FF0000");

    testPage.css = "stackLayout {background-color: #FF0000FF;} label {background-color: #FFFF0000;}";
    TKUnit.assertEqual(label.style.backgroundColor.hex, "#FF0000");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#0000FF");
}

export function test_page_backgroundColor_is_white() {
    const page = new Page();
    page.id = "page_test_page_backgroundColor_is_white";
    const factory = () => page;
    helper.navigate(factory);
    const whiteColor = new Color("white");
    if (isIOS) {
        TKUnit.assertTrue(whiteColor.ios.CGColor.isEqual(page.nativeViewProtected.backgroundColor.CGColor), "page default backgroundColor should be white");
    } else {
        TKUnit.assertEqual(page.nativeViewProtected.getBackground().getColor(), whiteColor.android, "page default backgroundColor should be white");
    }
}

export function test_WhenPageIsLoadedFrameCurrentPageIsNotYetTheSameAsThePage() {
    let page: Page;
    const loadedEventHandler = function (args) {
        TKUnit.assertNotEqual(topmost().currentPage, args.object, "When a page is loaded it should not yet be the current page.");
    }

    const pageFactory = function (): Page {
        page = new Page();
        page.id = "page_test_WhenPageIsLoadedFrameCurrentPageIsNotYetTheSameAsThePage";
        page.on(Label.loadedEvent, loadedEventHandler);
        const label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(Label.loadedEvent, loadedEventHandler);
}

export function test_WhenPageIsNavigatedToFrameCurrentPageIsNowTheSameAsThePage() {
    let page: Page;
    const navigatedEventHandler = function (args) {
        TKUnit.assertEqual(topmost().currentPage, args.object, `frame.topmost().currentPage should be equal to args.object page instance in the page.navigatedTo event handler. Expected: ${args.object.id}; Actual: ${topmost().currentPage.id};`);
    }

    const pageFactory = function (): Page {
        page = new Page();
        page.id = "page_test_WhenPageIsNavigatedToFrameCurrentPageIsNowTheSameAsThePage";
        page.on(Page.navigatedToEvent, navigatedEventHandler);
        const label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(Label.loadedEvent, navigatedEventHandler);
}

export function test_WhenNavigatingForwardAndBack_IsBackNavigationIsCorrect() {
    let page1;
    let page2;
    let forwardCounter = 0;
    let backCounter = 0;

    const navigatedEventHandler = (args: NavigatedData) => {
        if (args.isBackNavigation) {
            backCounter++;
        } else {
            forwardCounter++;
        }
    }

    const pageFactory1 = function (): Page {
        page1 = new Page();
        page1.id = "page1_test_WhenNavigatingForwardAndBack_IsBackNavigationIsCorrect";
        page1.on(Page.navigatedToEvent, navigatedEventHandler);
        return page1;
    };

    const pageFactory2 = function (): Page {
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
    // if (platform.device.os === platform.platformNames.android
    //     && android.os.Build.VERSION.SDK_INT === android.os.Build.VERSION_CODES.JELLY_BEAN_MR1
    //     && android.os.Build.CPU_ABI.indexOf("x86") !== -1) {
    //     // Skip this test on x68 Android with API Level 17
    //     return;
    // }

    const ctx = {
        shownModally: false
    };

    let masterPage;
    let modalClosed = false;

    const modalCloseCallback = function (returnValue: any) {
        TKUnit.assertTrue(ctx.shownModally, "Modal-page must be shown!");
        TKUnit.assertEqual(returnValue, "return value", "Modal-page must return value!");
        modalClosed = true;
    }

    let modalPage: Page;
    let shownModally = 0;

    const onShownModal = function (args: ShownModallyData) {
        shownModally++;
        modalPage.off(Page.shownModallyEvent, onShownModal);
    }

    let modalLoaded = 0;
    const onModalLoaded = function (args: EventData) {
        modalLoaded++;
        modalPage.off(Page.loadedEvent, onModalLoaded);
    }

    let modalUnloaded = 0;
    const onModalUnloaded = function (args: EventData) {
        modalUnloaded++;
        modalPage.off(Page.unloadedEvent, onModalUnloaded);
        TKUnit.assertNull(masterPage.modal, "currentPage.modal should be undefined when no modal page is shown!");
    }

    const navigatedToEventHandler = function (args) {
        const page = <Page>args.object;
        TKUnit.assertNull(page.modal, "currentPage.modal should be undefined when no modal page is shown!");
        const basePath = "ui/page/";
        const entry: NavigationEntry = {
            moduleName: basePath + "modal-page"
        };

        modalPage = <Page>resolvePageFromEntry(entry);
        modalPage.on(Page.shownModallyEvent, onShownModal);
        modalPage.on(Page.loadedEvent, onModalLoaded);
        modalPage.on(Page.unloadedEvent, onModalUnloaded);

        page.showModal(modalPage, ctx, modalCloseCallback, false);
        TKUnit.assertTrue((<any>modalPage).showingModally, "showingModally");
    };

    const masterPageFactory = function (): Page {
        masterPage = new Page();
        masterPage.id = "masterPage_test_WhenPageIsNavigatedToItCanShowAnotherPageAsModal";
        masterPage.on(Page.navigatedToEvent, navigatedToEventHandler);
        const label = new Label();
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

export function test_percent_width_and_height_support() {
    const testPage = new Page();
    testPage.id = "test_percent_width_and_height_support";

    const stackLayout = new StackLayout();
    (<any>stackLayout).width = "50%";
    (<any>stackLayout).height = "50%";

    testPage.content = stackLayout;

    const pageWidth = testPage.getMeasuredWidth();
    const pageHeight = testPage.getMeasuredHeight()

    TKUnit.assertEqual(pageWidth, Math.round(pageWidth / 2), "Current page MeasuredWidth incorrect");
    TKUnit.assertEqual(pageHeight, Math.round(pageHeight / 2), "Current page MeasuredHeight incorrect");

    //reset values.
    testPage.style.height = unsetValue;
    testPage.style.width = unsetValue;

    TKUnit.assertTrue(PercentLength.equals(testPage.width, "auto"));
    TKUnit.assertTrue(PercentLength.equals(testPage.height, "auto"));
}

export function test_percent_margin_support() {
    const testPage = new Page();
    const gridLayout = new GridLayout();
    const stackLayout = new StackLayout();
    stackLayout.margin = "10%";
    gridLayout.addChild(stackLayout);
    testPage.content = gridLayout;

    helper.navigate(() => testPage);

    const parentBounds = gridLayout._getCurrentLayoutBounds();
    const parentWidth = parentBounds.right - parentBounds.left;
    const parentHeight = parentBounds.bottom - parentBounds.top;

    const marginLeft = Math.round(parentWidth * 0.1);
    const marginTop = Math.round(parentHeight * 0.1);

    let bounds = stackLayout._getCurrentLayoutBounds();
    TKUnit.assertEqual(Math.round(bounds.left), marginLeft, "Stack LEFT position incorrect");
    TKUnit.assertEqual(Math.round(bounds.top), marginTop, "Stack TOP position incorrect");
    TKUnit.assertEqual(Math.round(bounds.bottom - bounds.top), parentHeight - (2 * marginTop), "Stack HEIGHT incorrect");
    TKUnit.assertEqual(Math.round(bounds.right - bounds.left), parentWidth - (2 * marginLeft), "Stack WIDTH incorrect");
    TKUnit.assertEqual(Math.round(bounds.right), parentWidth - marginLeft, "Stack RIGHT position incorrect");
    TKUnit.assertEqual(Math.round(bounds.bottom), parentHeight - marginTop, "Stack BOTTOM position incorrect");

    //reset values.
    stackLayout.margin = "0";
    TKUnit.waitUntilReady(() => stackLayout.isLayoutValid);

    bounds = stackLayout._getCurrentLayoutBounds();
    TKUnit.assertEqual(bounds.left, 0, "Stack LEFT position incorrect");
    TKUnit.assertEqual(bounds.top, 0, "Stack TOP position incorrect");
    TKUnit.assertEqual(bounds.bottom - bounds.top, parentHeight, "Stack HEIGHT incorrect");
    TKUnit.assertEqual(bounds.right - bounds.left, parentWidth, "Stack WIDTH incorrect");
    TKUnit.assertEqual(bounds.right, parentWidth, "Stack RIGHT position incorrect");
    TKUnit.assertEqual(bounds.bottom, parentHeight, "Stack BOTTOM position incorrect");
}

//export function test_ModalPage_Layout_is_Correct() {
//    const testPage: Page;
//    const label: Label;
//    const pageFactory = function () {
//        testPage = new Page();
//        label = new Label();
//        label.text = "Will Show modal page";
//        testPage.content = label;
//        return testPage;
//    };

//    helper.navigate(pageFactory);
//    const basePath = "ui/page/";
//    testPage.showModal(basePath + "page21", testPage, () => { }, false);

//    // TODO: Remove this once navigate and showModal returns Promise<Page>.
//    TKUnit.wait(0.350);
//    const childPage = (<any>testPage).childPage;
//    const closeCallback: Function = (<any>testPage).close;

//    try {
//        const layout = <StackLayout>childPage.content;
//        const repeater = layout.getChildAt(1);
//        TKUnit.assertTrue(repeater.isLayoutValid, "layout should be valid.");
//        const bounds = repeater._getCurrentLayoutBounds();
//        const height = bounds.bottom - bounds.top;
//        TKUnit.assertTrue(height > 0, "Layout should be >0.");

//        closeCallback();
//        TKUnit.wait(0.150);
//    }
//    finally {
//        helper.goBack
//        helper.goBack();
//    }
//}