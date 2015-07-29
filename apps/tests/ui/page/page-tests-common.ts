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

    try {
        TKUnit.assert(nativeInstanceCreated, "Expected: true, Actual: " + nativeInstanceCreated);
    }
    finally {
        page.off(view.View.loadedEvent, handler);
        helper.goBack();
    }
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

    try {
        TKUnit.assert(loaded === 1, "Expected: 1, Actual: " + loaded);
    }
    finally {
        page2.off(view.View.loadedEvent, handler);
        helper.goBack();
        helper.goBack();
    }
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

export function test_PageNavigation_EventSequence() {
    var testPage: PageModule.Page;
    var context = { property: "this is the context" };
    var eventSequence = [];
    var pageFactory = function () {
        testPage = new PageModule.Page();
        addLabelToPage(testPage);

        testPage.on(PageModule.Page.navigatingToEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("onNavigatingTo");
            TKUnit.assertEqual(data.context, context, "onNavigatingTo: navigationContext");
        });

        testPage.on(PageModule.Page.navigatedToEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("onNavigatedTo");
            TKUnit.assertEqual(data.context, context, "onNavigatedTo : navigationContext");
        });

        testPage.on(PageModule.Page.navigatingFromEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("onNavigatingFrom");
            TKUnit.assertEqual(data.context, context, "onNavigatingFrom: navigationContext");
        });

        testPage.on(PageModule.Page.navigatedFromEvent, function (data: PageModule.NavigatedData) {
            eventSequence.push("onNavigatedFrom");
            TKUnit.assertEqual(data.context, context, "onNavigatedFrom: navigationContext");
        });

        return testPage;
    };

    helper.navigate(pageFactory, context);
    helper.goBack();

    var expectedEventSequence = ["onNavigatingTo", "onNavigatedTo", "onNavigatingFrom", "onNavigatedFrom"];
    TKUnit.arrayAssert(eventSequence, expectedEventSequence, "Actual event sequence is not equal to expected.");
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

    try {
        var actualContextValue = testPage.navigationContext;
        TKUnit.assert(actualContextValue === "myContext", "Expected: myContext" + ", Actual: " + actualContextValue);
    }
    finally {
        helper.goBack();
    }

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
    try {
        TKUnit.assert(topFrame.backStack.length === 1, "Expected: 1, Actual: " + topFrame.backStack.length);
        TKUnit.assert(topFrame.canGoBack(), "We should can go back.");
    }
    finally {
        helper.goBack();
    }

    TKUnit.assert(topFrame.backStack.length === 0, "Expected: 0, Actual: " + topFrame.backStack.length);
    TKUnit.assert(topFrame.canGoBack() === false, "canGoBack should return false.");
}

export function test_LoadPageFromModule() {
    helper.navigateToModule("ui/page/test-page-module");
    try {
        var topFrame = FrameModule.topmost();
        TKUnit.assert(topFrame.currentPage.content instanceof LabelModule.Label, "Content of the test page should be a Label created within test-page-module.");
        var testLabel = <LabelModule.Label>topFrame.currentPage.content
        TKUnit.assert(testLabel.text === "Label created within a page module.");
    }
    finally {
        helper.goBack();
    }
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
    try {
        TKUnit.assert(actualContent.text === expectedText, "Expected: " + expectedText + ", Actual: " + actualContent.text);
    }
    finally {
        helper.goBack();
    }
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
    try {
        TKUnit.assert(label.style.backgroundColor.hex === "#ff00ff00", "Expected: #ff00ff00, Actual: " + label.style.backgroundColor.hex);
        TKUnit.assert(StackLayout.style.backgroundColor.hex === "#ffff0000", "Expected: #ffff0000, Actual: " + StackLayout.style.backgroundColor.hex);
    }
    finally {
        helper.goBack();
    }
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
    try {
        TKUnit.assert(label.style.backgroundColor.hex === "#ff00ff00", "Expected: #ff00ff00, Actual: " + label.style.backgroundColor.hex);
        TKUnit.assert(StackLayout.style.backgroundColor.hex === "#ffff0000", "Expected: #ffff0000, Actual: " + StackLayout.style.backgroundColor.hex);

        testPage.css = "stackLayout {background-color: #ff0000ff;} label {background-color: #ffff0000;}";
        TKUnit.assert(label.style.backgroundColor.hex === "#ffff0000", "Expected: #ffff0000, Actual: " + label.style.backgroundColor.hex);
        TKUnit.assert(StackLayout.style.backgroundColor.hex === "#ff0000ff", "Expected: #ff0000ff, Actual: " + StackLayout.style.backgroundColor.hex);
    }
    finally {
        helper.goBack();
    }
}

export function test_page_backgroundColor_is_white() {
    helper.do_PageTest_WithButton(function testBackground(views: Array<view.View>) {
        var page = <PageModule.Page>views[0];
        TKUnit.assertEqual(page.style.backgroundColor.hex.toLowerCase(), "#ffffff", "page background-color");
    });
}