import PageTestCommon = require("./page-tests-common");
import {Page} from "ui/page";
import TKUnit = require("../../TKUnit");
import {Label} from "ui/label";
import helper = require("../helper");
import {View} from "ui/core/view";
import {EventData} from "data/observable";
import uiUtils = require("ui/utils");

global.moduleMerge(PageTestCommon, exports);

export function test_NavigateToNewPage_InnerControl() {
    var testPage: Page;
    var pageFactory = function (): Page {
        testPage = new Page();
        PageTestCommon.addLabelToPage(testPage);
        return testPage;
    };

    helper.navigate(pageFactory);
    helper.goBack();

    var label = <Label>testPage.content;

    TKUnit.assertEqual(label._context, undefined, "label._context should be undefined after navigate back.");
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

    try {
        helper.navigate(masterPageFactory);
        TKUnit.waitUntilReady(() => { return modalUnloaded > 0; });
        TKUnit.assert(!masterPageUnloaded, "Master page should not raise 'unloaded' when showing modal!");
        masterPage.off(View.loadedEvent, navigatedToEventHandler);
        masterPage.off(View.unloadedEvent, unloadedEventHandler);
    }
    finally {
        helper.goBack();
    }
}

export function test_page_no_anctionBar_measure_no_spanUnderBackground_measure_layout_size_isCorrect() {
    let page = new Page();
    page.backgroundSpanUnderStatusBar = true;
    page.actionBarHidden = true;
    let lbl = new Label();
    page.content = lbl;

    try {
        helper.navigate(() => { return page; });
        TKUnit.waitUntilReady(() => { return page.isLayoutValid; });
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
        TKUnit.waitUntilReady(() => { return page.isLayoutValid; });
        pageHeight = page._getCurrentLayoutBounds().bottom - page._getCurrentLayoutBounds().top;
        TKUnit.assertEqual(pageHeight, frameHeight - statusBarHeight, "Page should be given Frame height - statusBar height.");

        contentHeight = lbl._getCurrentLayoutBounds().bottom - lbl._getCurrentLayoutBounds().top;
        TKUnit.assertEqual(contentHeight, pageHeight, "Page.content height should match Page height.");

        page.actionBarHidden = false;
        TKUnit.waitUntilReady(() => { return page.isLayoutValid; });

        pageHeight = page._getCurrentLayoutBounds().bottom - page._getCurrentLayoutBounds().top;
        TKUnit.assertEqual(pageHeight, frameHeight - statusBarHeight, "Page should be given Frame height - statusBar height.");

        contentHeight = lbl._getCurrentLayoutBounds().bottom - lbl._getCurrentLayoutBounds().top;
        TKUnit.assertTrue(contentHeight < pageHeight, "Page.content be given less space than Page when ActionBar is shown.");
    }
    finally {
        helper.goBack();
    }
}