import * as TKUnit from "../TKUnit";
import {Page, NavigatedData} from "ui/page";
import {topmost as topmostFrame, NavigationTransition} from "ui/frame";
import {Color} from "color";

// Creates a random colorful page full of meaningless stuff.
var id = 0;
var pageFactory = function (): Page {
    var page = new Page();
    page.actionBarHidden = true;
    page.id = `NavTestPage${id++}`;
    page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
    return page;
};

function waitUntilNavigatedFrom(oldPage: Page) {
    let topmost = topmostFrame();
    TKUnit.waitUntilReady(() => {
        return topmost.currentPage
            && topmost.currentPage !== oldPage
            && topmost.currentPage.isLoaded
            && !oldPage.isLoaded
            ;
    });
}

function _test_backstackVisible(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let mainTestPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition, animated: true });
    waitUntilNavigatedFrom(mainTestPage);    
    
    // page1 should not be added to the backstack
    let page0 = topmost.currentPage;
    topmost.navigate({ create: pageFactory, backstackVisible: false, transition: transition, animated: true });
    waitUntilNavigatedFrom(page0);    

    let page1 = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition, animated: true });
    waitUntilNavigatedFrom(page1);    
    
    let page2 = topmost.currentPage;
    topmost.goBack();
    waitUntilNavigatedFrom(page2);    

    // From page2 we have to go directly to page0, skipping page1.
    TKUnit.assert(topmost.currentPage === page0, "Page 1 should be skipped when going back.");

    topmost.goBack();
    waitUntilNavigatedFrom(page0);
    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
}

export var test_backstackVisible = function () {
    _test_backstackVisible();
}

export var test_backstackVisible_WithTransition = function () {
    _test_backstackVisible({name: "fade"});
}

function _test_backToEntry(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let page = (tag) => () => {
        var p = new Page();
        p.actionBarHidden = true;
        p.id = `NavTestPage${id++}`;
        p["tag"] = tag;
        return p;
    }
    let mainTestPage = topmost.currentPage;
    let waitFunc = tag => TKUnit.waitUntilReady(() => topmost.currentPage["tag"] === tag, 1);
    let navigate = tag => {
        topmost.navigate({ create: page(tag), transition: transition, animated: true });
        waitFunc(tag);
        
    }
    let back = pages => {
        topmost.goBack(topmost.backStack[topmost.backStack.length - pages]);
    }
    let currentPageMustBe = tag => {
        waitFunc(tag); // TODO: Add a timeout...
        TKUnit.assert(topmost.currentPage["tag"] === tag, "Expected current page to be " + tag + " it was " + topmost.currentPage["tag"] + " instead.");
    }

    navigate("page1");
    navigate("page2");
    navigate("page3");
    navigate("page4");

    currentPageMustBe("page4");
    back(2);
    currentPageMustBe("page2");
    back(1);
    currentPageMustBe("page1");
    navigate("page1.1");
    navigate("page1.2");
    currentPageMustBe("page1.2");
    back(1);
    currentPageMustBe("page1.1");
    back(1);
    currentPageMustBe("page1");
    let page1 = topmost.currentPage;
    back(1);
    waitUntilNavigatedFrom(page1);
    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
}

export var test_backToEntry = function () {
    _test_backToEntry();
}

export var test_backToEntry_WithTransition = function () {
    _test_backToEntry({name: "flip"});
}

function _test_ClearHistory(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let mainTestPage = topmost.currentPage;
    let mainPageFactory = function (): Page {
        return mainTestPage;
    };

    var currentPage: Page;

    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, clearHistory: true, transition: transition, animated: true });
    waitUntilNavigatedFrom(currentPage);
    TKUnit.assertEqual(topmost.backStack.length, 0, "1.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), false, "1.topmost.canGoBack().");

    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition, animated: true });
    waitUntilNavigatedFrom(currentPage);
    TKUnit.assertEqual(topmost.backStack.length, 1, "2.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), true, "2.topmost.canGoBack().");

    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition, animated: true });
    waitUntilNavigatedFrom(currentPage);
    TKUnit.assertEqual(topmost.backStack.length, 2, "3.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), true, "3.topmost.canGoBack().");

    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, clearHistory: true, transition: transition, animated: true });
    waitUntilNavigatedFrom(currentPage);
    TKUnit.assertEqual(topmost.backStack.length, 0, "4.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), false, "4.topmost.canGoBack().");

    currentPage = topmost.currentPage;
    topmost.navigate({ create: mainPageFactory, clearHistory: true, animated: false });
    waitUntilNavigatedFrom(currentPage);
    TKUnit.assertEqual(topmost.backStack.length, 0, "5.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), false, "5.topmost.canGoBack().");

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
    TKUnit.assertEqual(topmost.backStack.length, 0, "Back stack should be empty at the end of the test.");
}

// Clearing the history messes up the tests app.
export var test_ClearHistory = function () {
    _test_ClearHistory();
}

export var test_ClearHistory_WithTransition = function () {
    _test_ClearHistory({ name: "fade" });
}

export var test_ClearHistory_WithTransition_WithCachePagesOnNavigate = function () {
    let topmost = topmostFrame();
    if (!topmost.android) {
        return;
    }

    let originalCachePagesOnNavigate = topmost.android.cachePagesOnNavigate;
    topmostFrame().android.cachePagesOnNavigate = true;
    _test_ClearHistory({ name: "fade" });
    topmostFrame().android.cachePagesOnNavigate = originalCachePagesOnNavigate;
}

// Test case for https://github.com/NativeScript/NativeScript/issues/1948
export var test_ClearHistoryWithTransitionDoesNotBreakNavigation = function () {
    let topmost = topmostFrame();
    let mainTestPage = topmost.currentPage;
    let mainPageFactory = function (): Page {
        return mainTestPage;
    };

    // Go to details-page
    topmost.navigate({ create: pageFactory, clearHistory: false, animated: true });
    waitUntilNavigatedFrom(mainTestPage);
    
    // Go back to main-page with clearHistory
    var detailsPage: Page;
    detailsPage = topmost.currentPage;
    topmost.transition = { name: "fade" };
    topmost.navigate({ create: mainPageFactory, clearHistory: true, animated: true });
    waitUntilNavigatedFrom(detailsPage);
    
    // Go to details-page AGAIN
    topmost.navigate({ create: pageFactory, clearHistory: false, animated: true });
    waitUntilNavigatedFrom(mainTestPage);
    
    // Go back to main-page with clearHistory
    detailsPage = topmost.currentPage;
    topmost.transition = { name: "fade" };
    topmost.navigate({ create: mainPageFactory, clearHistory: true, animated: true });
    waitUntilNavigatedFrom(detailsPage);
    
    // Clean up
    topmost.transition = undefined;

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
    TKUnit.assertEqual(topmost.backStack.length, 0, "Back stack should be empty at the end of the test.");
}

export var test_ClearHistoryWithTransitionDoesNotBreakNavigation_WithLocalTransition = function () {
    let topmost = topmostFrame();
    let originalCachePagesOnNavigate: boolean;
    if (topmost.android) {
        originalCachePagesOnNavigate = topmost.android.cachePagesOnNavigate;
        topmostFrame().android.cachePagesOnNavigate = true;
    }

    let mainTestPage = topmost.currentPage;
    let mainPageFactory = function (): Page {
        return mainTestPage;
    };

    // Go to 1st page
    var currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, clearHistory: false, transition: { name: "fade" }, animated: true });
    waitUntilNavigatedFrom(currentPage);
    
    // Go to 2nd page
    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, clearHistory: false, transition: { name: "fade" }, animated: true });
    waitUntilNavigatedFrom(currentPage);
    
    // Go to 3rd page with clearHistory
    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, clearHistory: true, transition: { name: "fade" }, animated: true });
    waitUntilNavigatedFrom(currentPage);
    
    // Go back to main
    currentPage = topmost.currentPage;
    topmost.navigate({ create: mainPageFactory, clearHistory: true, transition: { name: "fade" }, animated: true });
    waitUntilNavigatedFrom(currentPage);
    
    if (topmost.android) {
        topmostFrame().android.cachePagesOnNavigate = originalCachePagesOnNavigate;
    }

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
    TKUnit.assertEqual(topmost.backStack.length, 0, "Back stack should be empty at the end of the test.");
}

function _test_NavigationEvents(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let argsToString = (args: NavigatedData) => {
        return `${(<Page>args.object).id} ${args.eventName} ${(args.isBackNavigation ? "back" : "forward") }`
    };

    let mainTestPage = topmost.currentPage;
    let originalMainPageId = mainTestPage.id;
    mainTestPage.id = "main-page";
    let actualMainPageEvents = new Array<string>();
    mainTestPage.on(Page.navigatingFromEvent, (args: NavigatedData) => { actualMainPageEvents.push(argsToString(args)); });
    mainTestPage.on(Page.navigatedFromEvent, (args: NavigatedData) => { actualMainPageEvents.push(argsToString(args)); });
    mainTestPage.on(Page.navigatingToEvent, (args: NavigatedData) => { actualMainPageEvents.push(argsToString(args)); });
    mainTestPage.on(Page.navigatedToEvent, (args: NavigatedData) => { actualMainPageEvents.push(argsToString(args)); });

    let actualSecondPageEvents = new Array<string>();
    let secondPageFactory = function (): Page {
        var secondPage = new Page();
        secondPage.actionBarHidden = true;        
        secondPage.id = "second-page"
        secondPage.on(Page.navigatingFromEvent, (args: NavigatedData) => { actualSecondPageEvents.push(argsToString(args)); });
        secondPage.on(Page.navigatedFromEvent, (args: NavigatedData) => { actualSecondPageEvents.push(argsToString(args)); });
        secondPage.on(Page.navigatingToEvent, (args: NavigatedData) => { actualSecondPageEvents.push(argsToString(args)); });
        secondPage.on(Page.navigatedToEvent, (args: NavigatedData) => { actualSecondPageEvents.push(argsToString(args)); });
        secondPage.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return secondPage;
    };

    // Go to other page
    topmost.navigate({ create: secondPageFactory, transition: transition, animated: true });
    waitUntilNavigatedFrom(mainTestPage);
    
    // Go back to main
    let currentPage = topmost.currentPage;
    topmost.goBack();
    waitUntilNavigatedFrom(currentPage);
    
    mainTestPage.id = originalMainPageId;

    let expectedMainPageEvents = [
        "main-page navigatingFrom forward",
        "main-page navigatedFrom forward",
        "main-page navigatingTo back",
        "main-page navigatedTo back"
    ];
    TKUnit.arrayAssert(actualMainPageEvents, expectedMainPageEvents, "Actual main-page events are different from expected.");

    let expectedSecondPageEvents = [
        "second-page navigatingTo forward",
        "second-page navigatedTo forward",
        "second-page navigatingFrom back",
        "second-page navigatedFrom back"
    ];
    TKUnit.arrayAssert(actualSecondPageEvents, expectedSecondPageEvents, "Actual second-page events are different from expected.");

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
}

export var test_NavigationEvents = function () {
    _test_NavigationEvents();
}

export var test_NavigationEvents_WithTransition = function () {
    _test_NavigationEvents({ name: "fade" });
}