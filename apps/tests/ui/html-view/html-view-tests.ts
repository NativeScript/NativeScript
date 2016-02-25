import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import page = require("ui/page");
import types = require("utils/types");

// <snippet module="ui/html-view" title="HtmlView">
// # HtmlView
// Using a HtmlView requires the html-view module.
// ``` JavaScript
import htmlViewModule = require("ui/html-view");
// ```
// </snippet>

// <snippet module="ui/html-view" title="HtmlView">
// ### Declaring a HtmlView.
//``` XML
//  <Page>
//       {%raw%}<HtmlView html="{{ htmlString }}" />{%endraw%}
//  </Page>
//```

// </snippet>

var _createHtmlViewFunc = function (): htmlViewModule.HtmlView {
    // <snippet module="ui/html-view" title="HtmlView">
    // ### Creating a HtmlView
    // ``` JavaScript
    var htmlView = new htmlViewModule.HtmlView();
    // ```
    // </snippet>
    return htmlView;
}

export var testLoadHTMLString = function () {
    var newPage: page.Page;
    var htmlView = _createHtmlViewFunc();
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        newPage.content = htmlView;
        return newPage;
    };

    helper.navigate(pageFactory);

    // <snippet module="ui/html-view" title="HtmlView">
    // ### Using HtmlView
    // ``` JavaScript
    htmlView.html = '<span><font color="#ff0000">Test</font></span>';
    // ```
    // </snippet>

    helper.goBack();

    if (htmlView.ios) {
        TKUnit.assert(!types.isNullOrUndefined(htmlView.ios.attributedText), "HTML string not loaded properly. Actual: " + htmlView.ios.attributedText);
    } else if (htmlView.android) {
        TKUnit.assert(htmlView.android.getText(), "HTML string not loaded properly. Actual: " + htmlView.android.getText());
    }
}
