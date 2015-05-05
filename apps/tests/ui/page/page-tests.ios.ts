import PageTestCommon = require("./page-tests-common");
import PageModule = require("ui/page");
import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");
import view = require("ui/core/view");

declare var exports;
require("utils/module-merge").merge(PageTestCommon, exports);

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

export function test_NavBar_isVisible_when_MenuItems_areSet() {

    var page: PageModule.Page;
    var label: LabelModule.Label;
    var navBarIsVisible = false;

    var handler = function (data) {
        page.off(PageModule.Page.navigatedToEvent, handler);
        navBarIsVisible = (<any>page.frame.ios).showNavigationBar;
    }

    var pageFactory = function (): PageModule.Page {
        page = new PageModule.Page();
        page.on(PageModule.Page.navigatedToEvent, handler);

        var mi = new PageModule.MenuItem();
        mi.text = "B";
        page.optionsMenu.addItem(mi);
        label = new LabelModule.Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    try {
        TKUnit.assert(navBarIsVisible, "Expected: true, Actual: " + navBarIsVisible);
    }
    finally {
        page.off(view.View.loadedEvent, handler);
        helper.goBack();
    }
}