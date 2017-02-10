import * as PageTestCommon from "./page-tests-common";
import {Page} from "ui/page";
import * as TKUnit from "../../TKUnit";
import {Label} from "ui/label";
import * as helper from "../helper";
import {View} from "ui/core/view";
import {EventData} from "data/observable";
import * as uiUtils from "ui/utils";
import * as frame from "ui/frame";

global.moduleMerge(PageTestCommon, exports);

export function test_NavigateToNewPage_InnerControl() {
    var testPage: Page;
    var pageFactory = function (): Page {
        testPage = new Page();
        PageTestCommon.addLabelToPage(testPage);
        return testPage;
    };

    helper.navigateWithHistory(pageFactory);
    var label = <Label>testPage.content;

    helper.goBack();

    TKUnit.assertEqual(label._context, null, "label._context should be undefined after navigate back.");
    TKUnit.assertEqual(label.android, undefined, "label.android should be undefined after navigate back.");
    TKUnit.assertFalse(label.isLoaded, "label.isLoaded should become false after navigating back");
}

export function test_WhenShowingModalPageUnloadedIsNotFiredForTheMasterPage() {
    let masterPage: Page;
    let masterPageUnloaded = false;
    let modalPage: Page;

    let modalUnloaded = 0;
    let onModalUnloaded = function (args: EventData) {
        modalUnloaded++;
        modalPage.off(Page.unloadedEvent, onModalUnloaded);
        TKUnit.assertNull(masterPage.modal, "currentPage.modal should be undefined when no modal page is shown!");
    }

    var navigatedToEventHandler = function (args) {
        var basePath = "ui/page/";
        modalPage = masterPage.showModal(basePath + "modal-page", null, null, false);
        modalPage.on(Page.unloadedEvent, onModalUnloaded);
    };

    var unloadedEventHandler = function (args) {
        masterPageUnloaded = true;
    };

    var masterPageFactory = function (): Page {
        masterPage = new Page();
        masterPage.id = "master-page";
        masterPage.on(Page.navigatedToEvent, navigatedToEventHandler);
        masterPage.on(View.unloadedEvent, unloadedEventHandler);
        var label = new Label();
        label.text = "Modal Page";
        masterPage.content = label;
        return masterPage;
    };

    helper.navigate(masterPageFactory);
    TKUnit.waitUntilReady(() => { return modalUnloaded > 0; });
    TKUnit.assert(!masterPageUnloaded, "Master page should not raise 'unloaded' when showing modal!");
    masterPage.off(View.loadedEvent, navigatedToEventHandler);
    masterPage.off(View.unloadedEvent, unloadedEventHandler);
}

export function test_page_no_anctionBar_measure_no_spanUnderBackground_measure_layout_size_isCorrect() {
    let page = new Page();
    page.backgroundSpanUnderStatusBar = true;
    page.actionBarHidden = true;
    let lbl = new Label();
    page.content = lbl;

    helper.navigate(() => page);
    TKUnit.waitUntilReady(() => page.isLayoutValid);
    TKUnit.assertTrue(page.isLoaded, "page NOT loaded!");

    let bounds = page._getCurrentLayoutBounds();
    let pageHeight = bounds.bottom - bounds.top;
    let frameBounds = page.frame._getCurrentLayoutBounds();
    let frameHeight = frameBounds.bottom - frameBounds.top;
    TKUnit.assertEqual(pageHeight, frameHeight, "Page height should match Frame height.");

    let contentHeight = lbl._getCurrentLayoutBounds().bottom - lbl._getCurrentLayoutBounds().top;
    let statusBarHeight = uiUtils.ios.getStatusBarHeight();
    TKUnit.assertEqual(contentHeight, frameHeight - statusBarHeight, "Page.content height should match Frame height - statusBar height.");

    page.backgroundSpanUnderStatusBar = false;
    TKUnit.waitUntilReady(() => page.isLayoutValid);
    pageHeight = page._getCurrentLayoutBounds().bottom - page._getCurrentLayoutBounds().top;
    TKUnit.assertEqual(pageHeight, frameHeight - statusBarHeight, "Page should be given Frame height - statusBar height.");

    contentHeight = lbl._getCurrentLayoutBounds().bottom - lbl._getCurrentLayoutBounds().top;
    TKUnit.assertEqual(contentHeight, pageHeight, "Page.content height should match Page height.");

    page.actionBarHidden = false;
    TKUnit.waitUntilReady(() => page.isLayoutValid);

    pageHeight = page._getCurrentLayoutBounds().bottom - page._getCurrentLayoutBounds().top;
    TKUnit.assertEqual(pageHeight, frameHeight - statusBarHeight, "Page should be given Frame height - statusBar height.");

    contentHeight = lbl._getCurrentLayoutBounds().bottom - lbl._getCurrentLayoutBounds().top;
    TKUnit.assertTrue(contentHeight < pageHeight, "Page.content be given less space than Page when ActionBar is shown.");
}

export function test_showing_native_viewcontroller_doesnt_throw_exception() {
    let testPage = new Page();
    let loaded = 0;
    let unloaded = 0;
    let navigatingTo = 0;
    let navigatedTo = 0;
    let navigatingFrom = 0;
    let navigatedFrom = 0;

    testPage.on(Page.loadedEvent, () => loaded++);
    testPage.on(Page.unloadedEvent, () => unloaded++);
    testPage.on(Page.navigatingToEvent, () => navigatingTo++);
    testPage.on(Page.navigatedToEvent, () => navigatedTo++);
    testPage.on(Page.navigatingFromEvent, () => navigatingFrom++);
    testPage.on(Page.navigatedFromEvent, () => navigatedFrom++);

    helper.navigate(() => { return testPage; });

    TKUnit.assertEqual(1, navigatingTo, "navigatingTo");
    TKUnit.assertEqual(1, loaded, "navigatingTo");
    TKUnit.assertEqual(1, navigatedTo, "navigatingTo");
    TKUnit.assertEqual(0, navigatingFrom, "navigatingTo");
    TKUnit.assertEqual(0, unloaded, "navigatingTo");
    TKUnit.assertEqual(0, navigatedFrom, "navigatingTo");

    let page = new Page();
    let navcontroller = <UINavigationController>frame.topmost().ios.controller;

    let completed = false;
    navcontroller.presentViewControllerAnimatedCompletion(page.ios, false, () => completed = true);
    TKUnit.waitUntilReady(() => completed);

    TKUnit.assertEqual(testPage.modal, undefined, "testPage.modal should be null");

    TKUnit.assertEqual(1, navigatingTo, "navigatingTo");
    TKUnit.assertEqual(1, loaded, "navigatingTo");
    TKUnit.assertEqual(1, navigatedTo, "navigatingTo");
    TKUnit.assertEqual(0, navigatingFrom, "navigatingTo");
    TKUnit.assertEqual(0, unloaded, "navigatingTo");
    TKUnit.assertEqual(0, navigatedFrom, "navigatingTo");

    completed = false;
    let controller = <UIViewController>page.ios;
    controller.dismissViewControllerAnimatedCompletion(false, () => completed = true);
    TKUnit.waitUntilReady(() => completed);

    TKUnit.assertEqual(1, navigatingTo, "navigatingTo");
    TKUnit.assertEqual(1, loaded, "navigatingTo");
    TKUnit.assertEqual(1, navigatedTo, "navigatingTo");
    TKUnit.assertEqual(0, navigatingFrom, "navigatingTo");
    TKUnit.assertEqual(0, unloaded, "navigatingTo");
    TKUnit.assertEqual(0, navigatedFrom, "navigatingTo");
}