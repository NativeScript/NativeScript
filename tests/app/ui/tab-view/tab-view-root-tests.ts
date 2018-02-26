import * as helper from "../helper";
import TKUnit = require("../../TKUnit");
import { _resetRootView } from "tns-core-modules/application/";
import { Frame, NavigationEntry } from "tns-core-modules/ui/frame";
import { Page } from "tns-core-modules/ui/page";
import { TabView, TabViewItem } from "tns-core-modules/ui/tab-view";

export function test_whenChangingTabsWithFramesCorrectEventsAreRaised() {
    const actualEventsRaised = [];

    function attachPageEventHandlers(page: Page) {
        page.on(Page.loadedEvent, () => actualEventsRaised.push(`${page.id} loaded`));
        page.on(Page.unloadedEvent, () => actualEventsRaised.push(`${page.id} unloaded`));
        page.on(Page.navigatingToEvent, () => actualEventsRaised.push(`${page.id} navigatingTo`));
        page.on(Page.navigatingFromEvent, () => actualEventsRaised.push(`${page.id} navigatingFrom`));
        page.on(Page.navigatedToEvent, () => actualEventsRaised.push(`${page.id} navigatedTo`));
        page.on(Page.navigatedFromEvent, () => actualEventsRaised.push(`${page.id} navigatedFrom`));
    }

    function attachFrameEventHandlers(frame: Frame) {
        frame.on(Frame.loadedEvent, () => actualEventsRaised.push(`${frame.id} loaded`));
        frame.on(Frame.unloadedEvent, () => actualEventsRaised.push(`${frame.id} unloaded`));
    }

    const page1 = new Page();
    page1.id = "Tab1 Frame1 Page1";
    attachPageEventHandlers(page1);

    const frame1 = new Frame();
    frame1.navigate(() => page1);
    frame1.id = "Tab1 Frame1";
    attachFrameEventHandlers(frame1);

    const page2 = new Page();
    page2.id = "Tab2 Frame2 Page2";
    attachPageEventHandlers(page2);

    const frame2 = new Frame();
    frame2.navigate(() => page2);
    frame2.id = "Tab2 Frame2";
    attachFrameEventHandlers(frame2);

    const tabView = new TabView();
    const tabEntry1 = new TabViewItem();
    tabEntry1.title = "frame1";
    tabEntry1.view = frame1;
    const tabEntry2 = new TabViewItem();
    tabEntry2.title = "frame2";
    tabEntry2.view = frame2;
    tabView.items = [tabEntry1, tabEntry2];

    const entry: NavigationEntry = {
        create: () => tabView
    };

    helper.waitUntilNavigatedTo(page1, () => _resetRootView(entry));
    helper.waitUntilNavigatedTo(page2, () => tabView.selectedIndex = 1);
    tabView.selectedIndex = 0;
    TKUnit.waitUntilReady(() => page1.isLoaded);

    const expectedEventsRaised = [
        "Tab1 Frame1 loaded",
        "Tab1 Frame1 Page1 navigatingTo",
        "Tab1 Frame1 Page1 loaded",
        "Tab1 Frame1 Page1 navigatedTo",
        "Tab1 Frame1 Page1 unloaded",
        "Tab1 Frame1 unloaded",
        "Tab2 Frame2 loaded",
        "Tab2 Frame2 Page2 navigatingTo",
        "Tab2 Frame2 Page2 loaded",
        "Tab2 Frame2 Page2 navigatedTo",
        "Tab2 Frame2 Page2 unloaded",
        "Tab2 Frame2 unloaded",
        "Tab1 Frame1 Page1 loaded",
        "Tab1 Frame1 loaded"
    ];

    TKUnit.arrayAssert(actualEventsRaised, expectedEventsRaised);
}

export function tearDownModule() {
    const page = new Page();
    const frame = new Frame();
    frame.navigate(() => page);

    const entry: NavigationEntry = {
        create: () => frame
    };

    helper.waitUntilNavigatedTo(page, () => _resetRootView(entry));
}
