import TKUnit = require("./TKUnit");
import pageModule = require("ui/page");
import frame = require("ui/frame");
import { Page } from "ui/page";

export var test_backstackVisible = function() {
    var pageFactory = function(): pageModule.Page {
        return new pageModule.Page();
    };

    var mainTestPage = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== mainTestPage; });

    // page1 should not be added to the backstack
    var page0 = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory, backstackVisible: false });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== page0; });

    var page1 = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== page1; });

    var page2 = frame.topmost().currentPage;
    frame.topmost().goBack();
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== page2; });

    // From page2 we have to go directly to page0, skipping page1.
    TKUnit.assert(frame.topmost().currentPage === page0, "Page 1 should be skipped when going back.");

    frame.topmost().goBack();
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage === mainTestPage; });
}

export var test_backToEntry = function() {
    let page = (tag) => () => {
        var p = new Page();
        p["tag"] = tag;
        return p;
    }
    let topmost = frame.topmost();
    let wait = tag => TKUnit.waitUntilReady(() => topmost.currentPage["tag"] === tag, 1);
    let navigate = tag => {
        topmost.navigate({ create: page(tag) });
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

// Clearing the history messes up the tests app.
export var test_ClearHistory = function () {
    var pageFactory = function(): pageModule.Page {
        return new pageModule.Page();
    };

    var mainTestPage = frame.topmost().currentPage;
    var mainPageFactory = function(): pageModule.Page {
        return mainTestPage;
    };

    var currentPage: pageModule.Page;

    currentPage = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== currentPage; });

    currentPage = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== currentPage; });

    currentPage = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== currentPage; });

    TKUnit.assert(frame.topmost().canGoBack(), "Frame should be able to go back.");
    TKUnit.assert(frame.topmost().backStack.length === 3, "Back stack should have 3 entries.");

    // Navigate with clear history.
    currentPage = frame.topmost().currentPage;
    frame.topmost().navigate({ create: pageFactory, clearHistory: true });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage !== currentPage; });

    TKUnit.assert(!frame.topmost().canGoBack(), "Frame should NOT be able to go back.");
    TKUnit.assert(frame.topmost().backStack.length === 0, "Back stack should have 0 entries.");

    frame.topmost().navigate({ create: mainPageFactory });
    TKUnit.waitUntilReady(() => { return frame.topmost().currentPage === mainTestPage; });
}