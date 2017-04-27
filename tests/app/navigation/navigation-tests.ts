import * as TKUnit from "../TKUnit";
import { Page, NavigatedData } from "tns-core-modules/ui/page";
import { topmost as topmostFrame, NavigationTransition } from "tns-core-modules/ui/frame";
import { Color } from "tns-core-modules/color";
import * as helper from "../ui/helper";

// Creates a random colorful page full of meaningless stuff.
let id = 0;
let pageFactory = function (): Page {
    const page = new Page();
    page.actionBarHidden = true;
    page.id = `NavTestPage${id++}`;
    page.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
    return page;
};

function androidGC() {
    // let topmost = topmostFrame();
    // if (topmost.android) {
    //     gc();
    //     java.lang.System.gc();
    // }
}

function attachEventListeners(page: Page, events: Array<string>) {
    let argsToString = (args: NavigatedData) => {
        return `${(<Page>args.object).id} ${args.eventName} ${(args.isBackNavigation ? "back" : "forward")}`;
    };

    page.on(Page.navigatingFromEvent, (args: NavigatedData) => { events.push(argsToString(args)); });
    page.on(Page.navigatedFromEvent, (args: NavigatedData) => { events.push(argsToString(args)); });
    page.on(Page.navigatingToEvent, (args: NavigatedData) => { events.push(argsToString(args)); });
    page.on(Page.navigatedToEvent, (args: NavigatedData) => { events.push(argsToString(args)); });
}

function _test_backstackVisible(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let mainTestPage = topmost.currentPage;
    helper.navigateWithEntry({ create: pageFactory, transition: transition, animated: true });
    TKUnit.wait(0.2);
    // page1 should not be added to the backstack
    let page0 = topmost.currentPage;
    helper.navigateWithEntry({ create: pageFactory, backstackVisible: false, transition: transition, animated: true });
    TKUnit.wait(0.2);
    helper.navigateWithEntry({ create: pageFactory, transition: transition, animated: true });
    TKUnit.wait(0.2);
    helper.goBack();
    TKUnit.wait(0.2);
    // From page2 we have to go directly to page0, skipping page1.
    TKUnit.assert(topmost.currentPage === page0, "Page 1 should be skipped when going back.");

    helper.goBack();
    TKUnit.wait(0.2);
    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
}

export function test_backstackVisible() {
    androidGC();
    _test_backstackVisible();
}

export function test_backstackVisible_WithTransition() {
    androidGC();
    _test_backstackVisible({ name: "fade" });
}

function _test_backToEntry(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let page = (tag) => () => {
        const p = new Page();
        p.actionBarHidden = true;
        p.id = `NavTestPage${id++}`;
        p["tag"] = tag;
        return p;
    };

    let mainTestPage = topmost.currentPage;
    let waitFunc = tag => {
        TKUnit.waitUntilReady(() => topmost.currentPage["tag"] === tag, 1);
        TKUnit.wait(0.21);
    };

    let navigate = tag => {
        topmost.navigate({ create: page(tag), transition: transition, animated: true });
        waitFunc(tag);

    };

    let back = pages => {
        topmost.goBack(topmost.backStack[topmost.backStack.length - pages]);
        TKUnit.wait(0.21);
    };

    let currentPageMustBe = tag => {
        waitFunc(tag); // TODO: Add a timeout...
        TKUnit.assert(topmost.currentPage["tag"] === tag, "Expected current page to be " + tag + " it was " + topmost.currentPage["tag"] + " instead.");
    };

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
    helper.waitUntilNavigatedFrom(page1);
    TKUnit.wait(0.21);
    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
}

export function test_backToEntry() {
    androidGC();
    _test_backToEntry();
}

export function test_backToEntry_WithTransition() {
    androidGC();
    _test_backToEntry({ name: "flip" });
}

function _test_ClearHistory(transition?: NavigationTransition) {
    let topmost = topmostFrame();
    let x = 0;
    console.log(`=========== NAV: ${x++}`);
    helper.navigateWithEntry({ create: pageFactory, clearHistory: true, transition: transition, animated: true });
    TKUnit.assertEqual(topmost.backStack.length, 0, "1.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), false, "1.topmost.canGoBack().");

    console.log(`=========== NAV: ${x++}`);
    helper.navigateWithEntry({ create: pageFactory, transition: transition, animated: true });
    TKUnit.assertEqual(topmost.backStack.length, 1, "2.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), true, "2.topmost.canGoBack().");

    console.log(`=========== NAV: ${x++}`);
    helper.navigateWithEntry({ create: pageFactory, transition: transition, animated: true });
    TKUnit.assertEqual(topmost.backStack.length, 2, "3.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), true, "3.topmost.canGoBack().");

    console.log(`=========== NAV: ${x++}`);
    TKUnit.wait(0.5);
    helper.navigateWithEntry({ create: pageFactory, clearHistory: true, transition: transition, animated: true });
    TKUnit.assertEqual(topmost.backStack.length, 0, "4.topmost.backStack.length");
    TKUnit.assertEqual(topmost.canGoBack(), false, "4.topmost.canGoBack().");
}

// Clearing the history messes up the tests app.
export function test_ClearHistory() {
    androidGC();
    _test_ClearHistory();
}

export function test_ClearHistory_WithTransition() {
    androidGC();
    _test_ClearHistory({ name: "fade" });
}

// export function test_ClearHistory_WithTransition_WithCachePagesOnNavigate() {
//     androidGC();
//     let topmost = topmostFrame();
//     if (!topmost.android) {
//         return;
//     }

//     let originalCachePagesOnNavigate = topmost.android.cachePagesOnNavigate;
//     topmostFrame().android.cachePagesOnNavigate = true;
//     _test_ClearHistory({ name: "fade" });
//     topmostFrame().android.cachePagesOnNavigate = originalCachePagesOnNavigate;
// }

// Test case for https://github.com/NativeScript/NativeScript/issues/1948
export function test_ClearHistoryWithTransitionDoesNotBreakNavigation() {
    androidGC();
    let topmost = topmostFrame();
    let mainTestPage = topmost.currentPage;
    let mainPageFactory = function (): Page {
        return mainTestPage;
    };

    // Go to details-page
    helper.navigateWithEntry({ create: pageFactory, clearHistory: false, animated: true });

    // Go back to main-page with clearHistory
    topmost.transition = { name: "fade" };
    helper.navigateWithEntry({ create: mainPageFactory, clearHistory: true, animated: true });

    // Go to details-page AGAIN
    helper.navigateWithEntry({ create: pageFactory, clearHistory: false, animated: true });

    // Go back to main-page with clearHistory
    topmost.transition = { name: "fade" };
    helper.navigateWithEntry({ create: mainPageFactory, clearHistory: true, animated: true });

    // Clean up
    topmost.transition = undefined;

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
    TKUnit.assertEqual(topmost.backStack.length, 0, "Back stack should be empty at the end of the test.");
}

export function test_ClearHistoryWithTransitionDoesNotBreakNavigation_WithLocalTransition() {
    androidGC();
    const topmost = topmostFrame();

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
    helper.navigateWithEntry({ create: pageFactory, clearHistory: false, transition: { name: "fade" }, animated: true });

    // Go to 2nd page
    helper.navigateWithEntry({ create: pageFactory, clearHistory: false, transition: { name: "fade" }, animated: true });

    // Go to 3rd page with clearHistory
    helper.navigateWithEntry({ create: pageFactory, clearHistory: true, transition: { name: "fade" }, animated: true });

    // Go back to main
    helper.navigateWithEntry({ create: mainPageFactory, clearHistory: true, transition: { name: "fade" }, animated: true });

    if (topmost.android) {
        topmostFrame().android.cachePagesOnNavigate = originalCachePagesOnNavigate;
    }

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
    TKUnit.assertEqual(topmost.backStack.length, 0, "Back stack should be empty at the end of the test.");
}

function _test_NavigationEvents(transition?: NavigationTransition) {
    const topmost = topmostFrame();
    const mainTestPage = topmost.currentPage;
    const originalMainPageId = mainTestPage.id;

    mainTestPage.id = "main-page";
    let actualMainPageEvents = new Array<string>();
    attachEventListeners(mainTestPage, actualMainPageEvents);

    let actualSecondPageEvents = new Array<string>();
    let secondPageFactory = function (): Page {
        const secondPage = new Page();
        secondPage.actionBarHidden = true;
        secondPage.id = "second-page";
        attachEventListeners(secondPage, actualSecondPageEvents);
        secondPage.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return secondPage;
    };

    // Go to other page
    helper.navigateWithEntry({ create: secondPageFactory, transition: transition, animated: true });

    // Go back to main
    helper.goBack();

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

export function test_NavigationEvents() {
    androidGC();
    _test_NavigationEvents();
}

export function test_NavigationEvents_WithTransition() {
    androidGC();
    _test_NavigationEvents({ name: "fade" });
}

function _test_NavigationEvents_WithBackstackVisibile_False_Forward_Back(transition?: NavigationTransition) {
    const topmost = topmostFrame();
    const mainTestPage = topmost.currentPage;

    let actualSecondPageEvents = new Array<string>();
    let secondPageFactory = function (): Page {
        const secondPage = new Page();
        secondPage.actionBarHidden = true;
        secondPage.id = "second-page";
        attachEventListeners(secondPage, actualSecondPageEvents);
        secondPage.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return secondPage;
    };

    // Go to other page
    helper.navigateWithEntry({ create: secondPageFactory, transition: transition, animated: true, backstackVisible: false });

    // Go back to main
    helper.goBack();

    let expectedSecondPageEvents = [
        "second-page navigatingTo forward",
        "second-page navigatedTo forward",
        "second-page navigatingFrom back",
        "second-page navigatedFrom back"
    ];
    TKUnit.arrayAssert(actualSecondPageEvents, expectedSecondPageEvents, "Actual second-page events are different from expected.");

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
}

export function test_NavigationEvents_WithBackstackVisibile_False_Forward_Back() {
    androidGC();
    _test_NavigationEvents_WithBackstackVisibile_False_Forward_Back();
}

export function test_NavigationEvents_WithBackstackVisibile_False_Forward_Back_WithTransition() {
    androidGC();
    _test_NavigationEvents_WithBackstackVisibile_False_Forward_Back({ name: "fade" });
}

function _test_NavigationEvents_WithBackstackVisibile_False_Forward_Forward(transition?: NavigationTransition) {
    const topmost = topmostFrame();
    const mainTestPage = topmost.currentPage;

    let actualSecondPageEvents = new Array<string>();
    let secondPageFactory = function (): Page {
        const secondPage = new Page();
        secondPage.actionBarHidden = true;
        secondPage.id = "second-page";
        attachEventListeners(secondPage, actualSecondPageEvents);
        secondPage.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return secondPage;
    };

    // Go to other page
    helper.navigateWithEntry({ create: secondPageFactory, transition: transition, animated: true, backstackVisible: false });

    // Go forward to third page
    helper.navigateWithEntry({ create: pageFactory, transition: transition, animated: true });

    // Go back to main
    helper.goBack();

    let expectedSecondPageEvents = [
        "second-page navigatingTo forward",
        "second-page navigatedTo forward",
        "second-page navigatingFrom forward",
        "second-page navigatedFrom forward"
    ];
    TKUnit.arrayAssert(actualSecondPageEvents, expectedSecondPageEvents, "Actual second-page events are different from expected.");

    TKUnit.assertEqual(topmost.currentPage, mainTestPage, "We should be on the main test page at the end of the test.");
}

export function test_NavigationEvents_WithBackstackVisibile_False_Forward_Forward() {
    androidGC();
    _test_NavigationEvents_WithBackstackVisibile_False_Forward_Forward();
}

export function test_NavigationEvents_WithBackstackVisibile_False_Forward_Forward_WithTransition() {
    androidGC();
    _test_NavigationEvents_WithBackstackVisibile_False_Forward_Forward({ name: "fade" });
}

function _test_NavigationEvents_WithClearHistory(transition?: NavigationTransition) {
    const topmost = topmostFrame();
    const mainTestPage = topmost.currentPage;

    mainTestPage.id = "main-page";
    let actualMainPageEvents = new Array<string>();
    attachEventListeners(mainTestPage, actualMainPageEvents);

    let actualSecondPageEvents = new Array<string>();
    const secondPage = new Page();
    let secondPageFactory = function (): Page {
        secondPage.actionBarHidden = true;
        secondPage.id = "second-page";
        attachEventListeners(secondPage, actualSecondPageEvents);
        secondPage.style.backgroundColor = new Color(255, Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        return secondPage;
    };

    // Go to second page
    helper.navigateWithEntry({ create: secondPageFactory, transition: transition, animated: true, clearHistory: true });

    let expectedMainPageEvents = [
        "main-page navigatingFrom forward",
        "main-page navigatedFrom forward"
    ];
    TKUnit.arrayAssert(actualMainPageEvents, expectedMainPageEvents, "Actual main-page events are different from expected.");

    let expectedSecondPageEvents = [
        "second-page navigatingTo forward",
        "second-page navigatedTo forward",
    ];
    TKUnit.arrayAssert(actualSecondPageEvents, expectedSecondPageEvents, "Actual main-page events are different from expected.");

    TKUnit.assertEqual(topmost.currentPage, secondPage, "We should be on the second page at the end of the test.");
}

export function test_NavigationEvents_WithClearHistory() {
    androidGC();
    _test_NavigationEvents_WithClearHistory();
}

export function test_NavigationEvents_WithClearHistory_WithTransition() {
    androidGC();
    _test_NavigationEvents_WithClearHistory({ name: "fade" });
}
