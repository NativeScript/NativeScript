import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import types = require("utils/types");

// >> htmlview-require
import htmlViewModule = require("ui/html-view");
// << htmlview-require

var _createHtmlViewFunc = function (): htmlViewModule.HtmlView {
    // >> htmlview-create
    var htmlView = new htmlViewModule.HtmlView();
    // << htmlview-create
    return htmlView;
}

export var testLoadHTMLString = function () {
    let page = helper.getCurrentPage();
    let htmlView = _createHtmlViewFunc();
    page.content = htmlView;

    // >> htmlview-using
    htmlView.html = '<span><font color="#ff0000">Test</font></span>';
    // << htmlview-using

    if (htmlView.ios) {
        TKUnit.assert(!types.isNullOrUndefined(htmlView.ios.attributedText), "HTML string not loaded properly. Actual: " + htmlView.ios.attributedText);
    } else if (htmlView.android) {
        TKUnit.assert(htmlView.android.getText(), "HTML string not loaded properly. Actual: " + htmlView.android.getText());
    }
}