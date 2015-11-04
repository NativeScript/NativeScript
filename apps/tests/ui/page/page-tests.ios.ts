import PageTestCommon = require("./page-tests-common");
import PageModule = require("ui/page");
import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");
import view = require("ui/core/view");
import frame = require("ui/frame");

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

export function test_WhenPageIsLoadedItCanShowAnotherPageAsModal() {
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

    var loadedEventHandler = function (args) {
        TKUnit.assert(!frame.topmost().currentPage.modal, "frame.topmost().currentPage.modal should be undefined when no modal page is shown!");
        var basePath = "ui/page/";
        args.object.showModal(basePath + "modal-page", ctx, modalCloseCallback, false);
    };

    var masterPageFactory = function (): PageModule.Page {
        masterPage = new PageModule.Page();
        masterPage.id = "newPage";
        masterPage.on(view.View.loadedEvent, loadedEventHandler);
        var label = new LabelModule.Label();
        label.text = "Text";
        masterPage.content = label;
        return masterPage;
    };

    try {
        helper.navigate(masterPageFactory);
        TKUnit.waitUntilReady(() => { return modalClosed; });
        masterPage.off(view.View.loadedEvent, loadedEventHandler);
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

    var loadedEventHandler = function (args) {
        var basePath = "ui/page/";
        args.object.showModal(basePath + "modal-page", null, modalCloseCallback, false);
    };

    var unloadedEventHandler = function (args) {
        masterPageUnloaded = true;
    };

    var masterPageFactory = function (): PageModule.Page {
        masterPage = new PageModule.Page();
        masterPage.id = "master-page";
        masterPage.on(view.View.loadedEvent, loadedEventHandler);
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
        masterPage.off(view.View.loadedEvent, loadedEventHandler);
        masterPage.off(view.View.unloadedEvent, loadedEventHandler);
    }
    finally {
        helper.goBack();
    }
}