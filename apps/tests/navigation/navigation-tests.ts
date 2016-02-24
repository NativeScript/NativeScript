import * as TKUnit from "../TKUnit";
import {Page} from "ui/page";
import {topmost as topmostFrame} from "ui/frame";
import {Color} from "color";

// Creates a random colorful page full of meaningless stuff.
var pageFactory = function(): Page {
    var page = new Page();
    page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
    return page;
};

export var test_backstackVisible = function () {
    var mainTestPage = topmostFrame().currentPage;
    topmostFrame().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== mainTestPage; });

    // page1 should not be added to the backstack
    var page0 = topmostFrame().currentPage;
    topmostFrame().navigate({ create: pageFactory, backstackVisible: false });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== page0; });

    var page1 = topmostFrame().currentPage;
    topmostFrame().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== page1; });

    var page2 = topmostFrame().currentPage;
    topmostFrame().goBack();
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== page2; });

    // From page2 we have to go directly to page0, skipping page1.
    TKUnit.assert(topmostFrame().currentPage === page0, "Page 1 should be skipped when going back.");

    topmostFrame().goBack();
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage === mainTestPage; });
}

export var test_backToEntry = function () {
    let page = (tag) => () => {
        var p = new Page();
        p["tag"] = tag;
        return p;
    }
    let topmost = topmostFrame();
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
    var mainTestPage = topmostFrame().currentPage;
    var mainPageFactory = function (): Page {
        return mainTestPage;
    };

    var currentPage: Page;

    currentPage = topmostFrame().currentPage;
    topmostFrame().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== currentPage; });

    currentPage = topmostFrame().currentPage;
    topmostFrame().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== currentPage; });

    currentPage = topmostFrame().currentPage;
    topmostFrame().navigate({ create: pageFactory });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== currentPage; });

    TKUnit.assert(topmostFrame().canGoBack(), "Frame should be able to go back.");
    TKUnit.assert(topmostFrame().backStack.length === 3, "Back stack should have 3 entries.");

    // Navigate with clear history.
    currentPage = topmostFrame().currentPage;
    topmostFrame().navigate({ create: pageFactory, clearHistory: true });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage !== currentPage; });

    TKUnit.assert(!topmostFrame().canGoBack(), "Frame should NOT be able to go back.");
    TKUnit.assert(topmostFrame().backStack.length === 0, "Back stack should have 0 entries.");

    topmostFrame().navigate({ create: mainPageFactory });
    TKUnit.waitUntilReady(() => { return topmostFrame().currentPage === mainTestPage; });
}
