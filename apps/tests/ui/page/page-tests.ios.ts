import PageTestCommon = require("./page-tests-common");
import PageModule = require("ui/page");
import TKUnit = require("../../TKUnit");
import LabelModule = require("ui/label");
import helper = require("../helper");

declare var exports;
require("utils/module-merge").merge(PageTestCommon, exports);

export var test_NavigateToNewPage_InnerControl = function () {
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
