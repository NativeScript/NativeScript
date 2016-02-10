import TKUnit = require("../TKUnit");
import platform = require("platform");
import transitionModule = require("ui/transition");
import {Frame, Page, topmost as topmostFrame, NavigationEntry, NavigationTransition, AnimationCurve, WrapLayout, Button} from "ui";
import color = require("color");
import helper = require("../ui/helper");
import utils = require("utils/utils");
import trace = require("trace");

// Creates a random colorful page full of meaningless stuff.
var pageFactory = function(): Page {
    var page = new Page();
    page.style.backgroundColor = new color.Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
    return page;
};

function _testTransition(navigationTransition: NavigationTransition) {
    var testId = `Transition[${JSON.stringify(navigationTransition)}]`;
    trace.write(`Testing ${testId}`, trace.categories.Test);
    var navigationEntry: NavigationEntry = {
        create: function (): Page {
            var page = new Page();
            page.id = testId;
            page.style.backgroundColor = new color.Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
            return page;
        },
        animated: true,
        transition: navigationTransition
    }

    helper.navigateWithEntry(navigationEntry);
    TKUnit.wait(0.100);
    helper.goBack();
    TKUnit.wait(0.100);
    utils.GC();
}

// Extremely slow. Run only if needed.
export var test_Transitions = function () {
    helper.navigate(() => {
        var page = new Page();
        page.id = "TransitionsTestPage_MAIN"
        page.style.backgroundColor = new color.Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return page;
    });

    var transitions;
    if (platform.device.os === platform.platformNames.ios) {
        transitions = ["curl"];
    }
    else {
        var _sdkVersion = parseInt(platform.device.sdkVersion);
        transitions = _sdkVersion >= 21 ? ["explode"] : [];
    }
    transitions = transitions.concat(["fade", "flip", "slide"]);
    var durations = [undefined, 500];
    var curves = [undefined, AnimationCurve.easeIn];

    // Built-in transitions
    var t, d, c;
    var tlen = transitions.length;
    var dlen = durations.length;
    var clen = curves.length;
    for (t = 0; t < tlen; t++) {
        for (d = 0; d < dlen; d++) {
            for (c = 0; c < clen; c++) {
                _testTransition({
                    name: transitions[t],
                    duration: durations[d],
                    curve: curves[c]
                });
            }
        }
    }

    // Custom transition
    var customTransitionModule = require("./custom-transition");
    var customTransition = new customTransitionModule.CustomTransition();
    _testTransition({ instance: customTransition });

    helper.goBack();
}

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