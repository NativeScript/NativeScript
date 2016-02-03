// <snippet module="ui/page" title="Page">
// # Page
// Using a page requires the Page module.
// ``` JavaScript
import PageModule = require("ui/page");
//// FrameModule is needed in order to have an option to navigate to the new page.
import FrameModule = require("ui/frame");
// ```

// ### Attaching event handler for the Page loaded event to set bindingContext.
//``` XML
// <Page loaded="pageLoaded">
//   {%raw%}<Label text="{{ name }}" />{%endraw%}
// </Page>
//```
//``` JavaScript
// function pageLoaded(args) {
//   var page = args.object;
//   page.bindingContext = { name : "Some name" };
// }
// exports.pageLoaded = pageLoaded;
//```

// </snippet>
import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import stackLayoutModule = require("ui/layouts/stack-layout");
import helper = require("../helper");
import view = require("ui/core/view");
import platform = require("platform");
import observable = require("data/observable");

export function addLabelToPage(page: PageModule.Page, text?: string) {
    var label = new LabelModule.Label();
    label.text = text || "The quick brown fox jumps over the lazy dog.";
    page.content = label;
}

export function test_AfterPageLoaded_is_called_NativeInstance_is_created() {

    var page: PageModule.Page;
    var label: LabelModule.Label;
    var nativeInstanceCreated = false;

    var handler = function (data) {
        if (label.ios || label.android) {
            nativeInstanceCreated = true;
        }
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.on(view.View.loadedEvent, handler);

        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    TKUnit.assert(nativeInstanceCreated, "Expected: true, Actual: " + nativeInstanceCreated);
    page.off(view.View.loadedEvent, handler);
    helper.goBack();
}

export function test_PageLoaded_is_called_once() {

    var page1: PageModule.Page;
    var page2: PageModule.Page;

    var loaded = 0;
    var handler = function (data) {
        loaded++;
    }

    var pageFactory = function (): PageModule.Page {
        page1 = new PageModule.Page();
        addLabelToPage(page1, "Page 1");
        return page1;
    };

    helper.navigate(pageFactory);
    TKUnit.assert(loaded === 0, "Expected: 0, Actual: " + loaded);

    var pageFactory2 = function (): PageModule.Page {
        page2 = new PageModule.Page();
        addLabelToPage(page2, "Page 2");
        page2.on(view.View.loadedEvent, handler);
        return page2;
    };

    helper.navigate(pageFactory2);

    TKUnit.assert(loaded === 1, "Expected: 1, Actual: " + loaded);
    page2.off(view.View.loadedEvent, handler);
    helper.goBack();
    helper.goBack();
}

export function test_NavigateToNewPage() {
    var currentPage;
    currentPage = FrameModule.topmost().currentPage;
    // <snippet module="ui/page" title="Page">
    // ### Creating and navigating to the created page.
    // ``` JavaScript
    var testPage: PageModule.Page;
    var pageFactory = function (): PageModule.Page {
        testPage = new PageModule.Page();
        var label = new LabelModule.Label();
        label.text = "The quick brown fox jumps over the lazy dog.";
        testPage.content = label;
        return testPage;
    };
    var navEntry = {
        create: pageFactory,
        animated: false
    };
    var topFrame = FrameModule.topmost();
    topFrame.navigate(navEntry);
    // ```
    // </snippet>

    TKUnit.waitUntilReady(() => { return topFrame.currentPage !== currentPage });
    currentPage = topFrame.currentPage;

    // <snippet module="ui/page" title="Page">
    // ### Navigating backward is as simple as calling a single method.
    // ``` JavaScript
    topFrame.goBack();
    // ```
    // </snippet>

    TKUnit.waitUntilReady(() => { return topFrame.currentPage !== currentPage });
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
    var testPage: PageModule.Page;
    var context = { property: "this is the context" };
    var eventSequence = [];
    var pageFactory = function () {
        testPage = new PageModule.Page();
        addLabelToPage(testPage);

        testPage.on(PageModule.Page.navigatingToEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("navigatingTo");
            TKUnit.assertEqual(data.context, context, "navigatingTo: navigationContext");
        });

        testPage.on(PageModule.Page.loadedEvent, function (data: observable.EventData) {
            eventSequence.push("loaded");
            TKUnit.assertNotEqual(FrameModule.topmost().currentPage, data.object);
        });

        testPage.on(PageModule.Page.navigatedToEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("navigatedTo");
            TKUnit.assertEqual(data.context, context, "navigatedTo : navigationContext");
            TKUnit.assertEqual(FrameModule.topmost().currentPage, data.object);
        });

        testPage.on(PageModule.Page.navigatingFromEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("navigatingFrom");
            TKUnit.assertEqual(data.context, context, "navigatingFrom: navigationContext");
        });

        testPage.on(PageModule.Page.navigatedFromEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("navigatedFrom");
            TKUnit.assertEqual(data.context, context, "navigatedFrom: navigationContext");
        });

        testPage.on(PageModule.Page.unloadedEvent, function (data) {
            eventSequence.push("unloaded");
        });

        return testPage;
    };

    if (withTransition) {
        var navigationTransition: FrameModule.NavigationTransition = {
            transition: "slide",
            duration: 1000,
        };
        var navigationEntry: FrameModule.NavigationEntry = {
            create: pageFactory,
            context: context,
            animated: true,
            navigationTransition: navigationTransition
        }
        helper.navigateWithEntry(navigationEntry);
    }
    else {
        helper.navigate(pageFactory, context);
    }

    helper.goBack();

    var expectedEventSequence = ["navigatingTo", "loaded", "navigatedTo", "navigatingFrom", "navigatedFrom", "unloaded"];
    TKUnit.arrayAssert(eventSequence, expectedEventSequence, "Actual event sequence is not equal to expected. Actual: " + eventSequence + "; Expected: " + expectedEventSequence);
}

export function test_NavigateTo_WithContext() {
    var currentPage;
    currentPage = FrameModule.topmost().currentPage;
    // <snippet module="ui/page" title="Page">
    // ### Pass data to the new page.
    // ``` JavaScript
    var testPage: PageModule.Page;
    var pageFactory = function (): PageModule.Page {
        testPage = new PageModule.Page();
        testPage.on(PageModule.Page.navigatedToEvent, function () {
            ////console.log(JSON.stringify(context));
        });
        return testPage;
    };
    var navEntry = {
        create: pageFactory,
        context: "myContext",
        animated: false
    };
    var topFrame = FrameModule.topmost();
    topFrame.navigate(navEntry);
    // ```
    // </snippet>
    TKUnit.waitUntilReady(() => { return topFrame.currentPage !== currentPage });

    var actualContextValue = testPage.navigationContext;
    TKUnit.assert(actualContextValue === "myContext", "Expected: myContext" + ", Actual: " + actualContextValue);
    helper.goBack();

    TKUnit.assert(testPage.navigationContext === undefined, "Navigation context should be cleared on navigating back");
}

export function test_FrameBackStack_WhenNavigatingForwardAndBack() {
    var pageFactory = function () {
        var testPage = new PageModule.Page();
        addLabelToPage(testPage);
        return testPage;
    };

    helper.navigate(pageFactory);

    var topFrame = FrameModule.topmost();
    TKUnit.assert(topFrame.backStack.length === 1, "Expected: 1, Actual: " + topFrame.backStack.length);
    TKUnit.assert(topFrame.canGoBack(), "We should can go back.");
    helper.goBack();

    TKUnit.assert(topFrame.backStack.length === 0, "Expected: 0, Actual: " + topFrame.backStack.length);
    TKUnit.assert(topFrame.canGoBack() === false, "canGoBack should return false.");
}

export function test_LoadPageFromModule() {
    helper.navigateToModule("ui/page/test-page-module");
    var topFrame = FrameModule.topmost();
    TKUnit.assert(topFrame.currentPage.content instanceof LabelModule.Label, "Content of the test page should be a Label created within test-page-module.");
    var testLabel = <LabelModule.Label>topFrame.currentPage.content;
    TKUnit.assert(testLabel.text === "Label created within a page module.");
    helper.goBack();
}

export function test_LoadPageFromDeclarativeWithCSS() {
    helper.navigateToModule("ui/page/test-page-declarative-css");
    var topFrame = FrameModule.topmost();
    TKUnit.assert(topFrame.currentPage.content instanceof LabelModule.Label, "Content of the test page should be a Label created within test-page-module-css.");
    var testLabel = <LabelModule.Label>topFrame.currentPage.content;
    TKUnit.assert(testLabel.text === "Label created within a page declarative file with css.");
    TKUnit.assert(testLabel.style.backgroundColor.hex === "#ff00ff00", "Expected: #ff00ff00, Actual: " + testLabel.style.backgroundColor.hex);
    helper.goBack();
}

export function test_LoadPageFromModuleWithCSS() {
    helper.navigateToModule("ui/page/test-page-module-css");
    var topFrame = FrameModule.topmost();
    TKUnit.assert(topFrame.currentPage.content instanceof LabelModule.Label, "Content of the test page should be a Label created within test-page-module-css.");
    var testLabel = <LabelModule.Label>topFrame.currentPage.content;
    TKUnit.assert(testLabel.text === "Label created within a page module css.");
    TKUnit.assert(testLabel.style.backgroundColor.hex === "#ff00ff00", "Expected: #ff00ff00, Actual: " + testLabel.style.backgroundColor.hex);
    helper.goBack();
}

export function test_NavigateToPageCreatedWithNavigationEntry() {
    var expectedText = "Label created with a NavigationEntry";
    var testPage: PageModule.Page;
    var pageFactory = function () {
        testPage = new PageModule.Page();
        addLabelToPage(testPage, expectedText);
        return testPage;
    };

    helper.navigate(pageFactory);

    var actualContent = <LabelModule.Label>testPage.content;
    TKUnit.assert(actualContent.text === expectedText, "Expected: " + expectedText + ", Actual: " + actualContent.text);
    helper.goBack();
}

export function test_cssShouldBeAppliedToAllNestedElements() {
    var label: LabelModule.Label;
    var StackLayout: stackLayoutModule.StackLayout;
    var pageFactory = function () {
        var testPage = new PageModule.Page();
        label = new LabelModule.Label();
        label.text = expectedText;
        StackLayout = new stackLayoutModule.StackLayout();
        StackLayout.addChild(label);
        testPage.content = StackLayout;
        testPage.css = "stackLayout {background-color: #ffff0000;} label {background-color: #ff00ff00;}";
        return testPage;
    };

    helper.navigate(pageFactory);

    var expectedText = "Some text";
    TKUnit.assert(label.style.backgroundColor.hex === "#ff00ff00", "Expected: #ff00ff00, Actual: " + label.style.backgroundColor.hex);
    TKUnit.assert(StackLayout.style.backgroundColor.hex === "#ffff0000", "Expected: #ffff0000, Actual: " + StackLayout.style.backgroundColor.hex);
    helper.goBack();
}

export function test_cssShouldBeAppliedAfterChangeToAllNestedElements() {
    var testPage: PageModule.Page;
    var label: LabelModule.Label;
    var StackLayout: stackLayoutModule.StackLayout;
    var pageFactory = function () {
        testPage = new PageModule.Page();
        label = new LabelModule.Label();
        label.text = expectedText;
        StackLayout = new stackLayoutModule.StackLayout();
        StackLayout.addChild(label);
        testPage.content = StackLayout;
        testPage.css = "stackLayout {background-color: #ffff0000;} label {background-color: #ff00ff00;}";
        return testPage;
    };

    helper.navigate(pageFactory);

    var expectedText = "Some text";
    TKUnit.assert(label.style.backgroundColor.hex === "#ff00ff00", "Expected: #ff00ff00, Actual: " + label.style.backgroundColor.hex);
    TKUnit.assert(StackLayout.style.backgroundColor.hex === "#ffff0000", "Expected: #ffff0000, Actual: " + StackLayout.style.backgroundColor.hex);

    testPage.css = "stackLayout {background-color: #ff0000ff;} label {background-color: #ffff0000;}";
    TKUnit.assert(label.style.backgroundColor.hex === "#ffff0000", "Expected: #ffff0000, Actual: " + label.style.backgroundColor.hex);
    TKUnit.assert(StackLayout.style.backgroundColor.hex === "#ff0000ff", "Expected: #ff0000ff, Actual: " + StackLayout.style.backgroundColor.hex);
    helper.goBack();
}

export function test_page_backgroundColor_is_white() {
    helper.do_PageTest_WithButton(function testBackground(views: Array<view.View>) {
        var page = <PageModule.Page>views[0];
        TKUnit.assertEqual(page.style.backgroundColor.hex.toLowerCase(), "#ffffff", "page background-color");
    });
}

export function test_WhenPageIsLoadedFrameCurrentPageIsNotYetTheSameAsThePage() {
    var page;
    var loadedEventHandler = function (args) {
        TKUnit.assert(FrameModule.topmost().currentPage !== args.object, `When a page is loaded it should not yet be the current page. Loaded: ${args.object.id}; Current: ${FrameModule.topmost().currentPage.id};`);
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.id = "newPage";
        page.on(view.View.loadedEvent, loadedEventHandler);
        var label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(view.View.loadedEvent, loadedEventHandler);
    helper.goBack();
}

export function test_WhenPageIsNavigatedToFrameCurrentPageIsNowTheSameAsThePage() {
    var page;
    var navigatedEventHandler = function (args) {
        TKUnit.assert(FrameModule.topmost().currentPage === args.object, `frame.topmost().currentPage should be equal to args.object page instance in the page.navigatedTo event handler. Expected: ${args.object.id}; Actual: ${FrameModule.topmost().currentPage.id};`);
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.id = "newPage";
        page.on(PageModule.Page.navigatedToEvent, navigatedEventHandler);
        var label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(view.View.loadedEvent, navigatedEventHandler);
    helper.goBack();
}

export function test_WhenNavigatingForwardAndBack_IsBackNavigationIsCorrect() {
    var page1;
    var page2;
    var forwardCounter = 0;
    var backCounter = 0;
    var navigatedEventHandler = function (args: PageModule.NavigatedData) {
        if (args.isBackNavigation) {
            backCounter++;
        }
        else {
            forwardCounter++;
        }
    }

    var pageFactory1 = function (): PageModule.Page {
        page1 = new PageModule.Page();
        page1.on(PageModule.Page.navigatedToEvent, navigatedEventHandler);
        return page1;
    };

    var pageFactory2 = function (): PageModule.Page {
        page2 = new PageModule.Page();
        page2.on(PageModule.Page.navigatedToEvent, navigatedEventHandler);
        return page2;
    };

    helper.navigate(pageFactory1);
    helper.navigate(pageFactory2);
    helper.goBack();
    TKUnit.assertEqual(forwardCounter, 2, "Forward navigation counter should be 1");
    TKUnit.assertEqual(backCounter, 1, "Backward navigation counter should be 1");
    page1.off(PageModule.Page.navigatedToEvent, navigatedEventHandler);
    page2.off(PageModule.Page.navigatedToEvent, navigatedEventHandler);
    helper.goBack();
}

//export function test_ModalPage_Layout_is_Correct() {
//    var testPage: PageModule.Page;
//    var label: LabelModule.Label;
//    var pageFactory = function () {
//        testPage = new PageModule.Page();
//        label = new LabelModule.Label();
//        label.text = "Will Show modal page";
//        testPage.content = label;
//        return testPage;
//    };

//    helper.navigate(pageFactory);
//    var basePath = "ui/page/";
//    testPage.showModal(basePath + "page21", testPage, () => { }, false);

//    // TODO: Remove this once navigate and showModal returns Promise<Page>.
//    TKUnit.wait(0.350);
//    var childPage = (<any>testPage).childPage;
//    var closeCallback: Function = (<any>testPage).close;

//    try {
//        var layout = <stackLayoutModule.StackLayout>childPage.content;
//        var repeater = layout.getChildAt(1);
//        TKUnit.assertTrue(repeater.isLayoutValid, "layout should be valid.");
//        var bounds = repeater._getCurrentLayoutBounds();
//        var height = bounds.bottom - bounds.top;
//        TKUnit.assertTrue(height > 0, "Layout should be >0.");

//        closeCallback();
//        TKUnit.wait(0.150);
//    }
//    finally {
//        helper.goBack
//        helper.goBack();
//    }
//}