import * as TKUnit from "../TKUnit";
import {Page} from "ui/page";
import {topmost as topmostFrame, NavigationTransition} from "ui/frame";
import {Color} from "color";

// Creates a random colorful page full of meaningless stuff.
var pageFactory = function(): Page {
    var page = new Page();
    page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
    return page;
};

function _test_backstackVisible(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let mainTestPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== mainTestPage; });

    // page1 should not be added to the backstack
    let page0 = topmost.currentPage;
    topmost.navigate({ create: pageFactory, backstackVisible: false, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== page0; });

    let page1 = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== page1; });

    let page2 = topmost.currentPage;
    topmost.goBack();
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== page2; });

    // From page2 we have to go directly to page0, skipping page1.
    TKUnit.assert(topmost.currentPage === page0, "Page 1 should be skipped when going back.");

    topmost.goBack();
    TKUnit.waitUntilReady(() => { return topmost.currentPage === mainTestPage; });
}

export var test_backstackVisible = function () {
    _test_backstackVisible();
}

export var test_backstackVisible_WithTransition = function () {
    _test_backstackVisible({name: "fade"});
}

function _test_backToEntry(transition?: NavigationTransition) {
    let page = (tag) => () => {
        var p = new Page();
        p["tag"] = tag;
        return p;
    }
    let topmost = topmostFrame();
    let wait = tag => TKUnit.waitUntilReady(() => topmost.currentPage["tag"] === tag, 1);
    let navigate = tag => {
        topmost.navigate({ create: page(tag), transition: transition });
        wait(tag)
    }
    let back = pages => {
        topmost.goBack(topmost.backStack[topmost.backStack.length - pages]);
    }
    let currentPageMustBe = tag => {
        wait(tag); // TODO: Add a timeout...
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
    back(1);
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
    topmost.navigate({ create: pageFactory, clearHistory: true, transition: transition});
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== currentPage; });

    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== currentPage; });

    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== currentPage; });

    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== currentPage; });

    TKUnit.assert(topmost.canGoBack(), "Frame should be able to go back.");
    TKUnit.assert(topmost.backStack.length === 3, "Back stack should have 3 entries.");

    // Navigate with clear history.
    currentPage = topmost.currentPage;
    topmost.navigate({ create: pageFactory, clearHistory: true, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== currentPage; });

    TKUnit.assert(!topmost.canGoBack(), "Frame should NOT be able to go back.");
    TKUnit.assert(topmost.backStack.length === 0, "Back stack should have 0 entries.");

    topmost.navigate({ create: mainPageFactory, transition: transition });
    TKUnit.waitUntilReady(() => { return topmost.currentPage === mainTestPage; });
}

// Clearing the history messes up the tests app.
export var test_ClearHistory = function () {
    _test_ClearHistory();
}

export var test_ClearHistory_WithTransition = function () {
    _test_ClearHistory({ name: "slide" });
}

// Test case for https://github.com/NativeScript/NativeScript/issues/1948
export var test_ClearHistoryWithTransitionDoesNotBreakNavigation = function () {
    let topmost = topmostFrame();

    let mainTestPage = topmost.currentPage;
    let mainPageFactory = function (): Page {
        return mainTestPage;
    };

    // Go to details-page
    topmost.navigate({ create: pageFactory, clearHistory: false });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== mainTestPage; });

    // Go back to main-page with clearHistory
    var detailsPage: Page;
    detailsPage = topmost.currentPage;
    topmost.transition = { name: "fade" };
    topmost.navigate({ create: mainPageFactory, clearHistory: true });
    TKUnit.waitUntilReady(() => { return topmost.currentPage === mainTestPage; });

    // Go to details-page AGAIN
    topmost.navigate({ create: pageFactory, clearHistory: false });
    TKUnit.waitUntilReady(() => { return topmost.currentPage !== mainTestPage; });
    
    // Go back to main-page with clearHistory
    detailsPage = topmost.currentPage;
    topmost.transition = { name: "fade" };
    topmost.navigate({ create: mainPageFactory, clearHistory: true });
    TKUnit.waitUntilReady(() => { return topmost.currentPage === mainTestPage; });

    // Clean up
    topmost.transition = undefined;
}
