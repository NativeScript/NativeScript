import PageTestCommon = require("./page-tests-common");
import PageModule = require("ui/page");
import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");
import view = require("ui/core/view");
import frame = require("ui/frame");
import uiUtils = require("ui/utils");

global.moduleMerge(PageTestCommon, exports);

export function test_NavigateToNewPage_InnerControl() {
    var testPage: PageModule.Page;
    var pageFactory = function (): PageModule.Page {
        testPage = new PageModule.Page();
        PageTestCommon.addLabelToPage(testPage);
        return testPage;
    };

    helper.navigate(pageFactory);
    helper.goBack();

    var label = <LabelModule.Label>testPage.content;

    TKUnit.assert(label._context === undefined, "InnerControl._context should be undefined after navigate back.");
    TKUnit.assert(label.android === undefined, "InnerControl.android should be undefined after navigate back.");
    TKUnit.assert(label.isLoaded === false, "InnerControl.isLoaded should become false after navigating back");
}

export function test_WhenPageIsNavigatedToItCanShowAnotherPageAsModal() {
    var masterPage;
    var ctx = {
        shownModally: false
    };

    var modalClosed = false;
    var modalCloseCallback = function (returnValue: any) {
        TKUnit.assert(ctx.shownModally, "Modal-page must be shown!");
        TKUnit.assert(returnValue === "return value", "Modal-page must return value!");
        TKUnit.assert(!frame.topmost().currentPage.modal, "frame.topmost().currentPage.modal should be undefined when no modal page is shown!");
        TKUnit.wait(0.100);
        modalClosed = true;
    }

    var navigatedToEventHandler = function (args) {
        TKUnit.assert(!frame.topmost().currentPage.modal, "frame.topmost().currentPage.modal should be undefined when no modal page is shown!");
        var basePath = "ui/page/";
        args.object.showModal(basePath + "modal-page", ctx, modalCloseCallback, false);
    };

    var masterPageFactory = function (): PageModule.Page {
        masterPage = new PageModule.Page();
        masterPage.id = "newPage";
        masterPage.on(PageModule.Page.navigatedToEvent, navigatedToEventHandler);
        var label = new LabelModule.Label();
        label.text = "Text";
        masterPage.content = label;
        return masterPage;
    };

    try {
        helper.navigate(masterPageFactory);
        TKUnit.waitUntilReady(() => { return modalClosed; });
        masterPage.off(view.View.loadedEvent, navigatedToEventHandler);
    }
    finally {
        helper.goBack();
    }
}

export function test_WhenShowingModalPageUnloadedIsNotFiredForTheMasterPage() {
    var masterPage;
    var masterPageUnloaded = false;
    var modalClosed = false;
    var modalCloseCallback = function (returnValue: any) {
        TKUnit.wait(0.100);
        modalClosed = true;
    }

    var navigatedToEventHandler = function (args) {
        var basePath = "ui/page/";
        args.object.showModal(basePath + "modal-page", null, modalCloseCallback, false);
    };

    var unloadedEventHandler = function (args) {
        masterPageUnloaded = true;
    };

    var masterPageFactory = function (): PageModule.Page {
        masterPage = new PageModule.Page();
        masterPage.id = "master-page";
        masterPage.on(PageModule.Page.navigatedToEvent, navigatedToEventHandler);
        masterPage.on(view.View.unloadedEvent, unloadedEventHandler);
        var label = new LabelModule.Label();
        label.text = "Modal Page";
        masterPage.content = label;
        return masterPage;
    };

    try {
        helper.navigate(masterPageFactory);
        TKUnit.waitUntilReady(() => { return modalClosed; });
        TKUnit.assert(!masterPageUnloaded, "Master page should not raise 'unloaded' when showing modal!");
        masterPage.off(view.View.loadedEvent, navigatedToEventHandler);
        masterPage.off(view.View.unloadedEvent, unloadedEventHandler);
    }
    finally {
        helper.goBack();
    }
}

export function test_page_no_anctionBar_measure_no_spanUnderBackground_measure_layout_size_isCorrect() {
    let page = new PageModule.Page();
    page.backgroundSpanUnderStatusBar = true;
    page.actionBarHidden = true;
    let lbl = new LabelModule.Label();
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