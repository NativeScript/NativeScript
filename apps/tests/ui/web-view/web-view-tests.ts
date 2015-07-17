import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import page = require("ui/page");

// <snippet module="ui/web-view" title="WebView">
// # WebView
// Using a WebView requires the web-view module.
// ``` JavaScript
import webViewModule = require("ui/web-view");
// ```
// </snippet>

// <snippet module="ui/web-view" title="WebView">
// ### Declaring a WebView.
//```XML
//  <Page>
//       {%raw%}<WebView src="{{ someUrl | pathToLocalFile | htmlString }}" />{%endraw%}
//  </Page>
//```

// </snippet>

var _createWebViewFunc = function (): webViewModule.WebView {
    // <snippet module="ui/web-view" title="WebView">
    // ### Creating a WebView
    // ``` JavaScript
    var webView = new webViewModule.WebView();
    // ```
    // </snippet>
    return webView;
}

export var testLoadExistingUrl = function () {
    var newPage: page.Page;
    var webView = _createWebViewFunc();
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        newPage.content = webView;
        return newPage;
    };

    helper.navigate(pageFactory);

    var testFinished = false;
    var actualUrl;
    var actualError;

    // <snippet module="ui/web-view" title="WebView">
    // ### Using WebView
    // ``` JavaScript
    webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
        // <hide>
        actualUrl = args.url;
        actualError = args.error;
        testFinished = true;
        // </hide>
        var message;
        if (!args.error) {
            message = "WebView finished loading " + args.url;
        }
        else {
            message = "Error loading " + args.url + ": " + args.error;
        }
    });
    webView.url = "http://nsbuild01.telerik.com/docs/";
    // ```
    // </snippet>

    TKUnit.wait(4);

    helper.goBack();

    if (testFinished) {
        TKUnit.assert(actualUrl === "http://nsbuild01.telerik.com/docs/", "args.url should equal http://nsbuild01.telerik.com/docs/");
        TKUnit.assert(actualError === undefined, actualError);
    }
    else {
        TKUnit.assert(false, "TIMEOUT");
    }
}

export var testLoadLocalFile = function () {
    var newPage: page.Page;
    var webView = _createWebViewFunc();
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        newPage.content = webView;
        return newPage;
    };

    helper.navigate(pageFactory);

    var testFinished = false;
    var actualHtml;
    var actualTitle;
    var actualError;

    var expectedTitle = 'MyTitle';
    var expectedHtml = '<span style="color:red">Test</span>';

    // <snippet module="ui/web-view" title="WebView">
    // ### Using WebView
    // ``` JavaScript
    webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
        // <hide>
        if (webView.ios) {
            actualHtml = webView.ios.stringByEvaluatingJavaScriptFromString("document.body.innerHTML").trim();
        } else if (webView.android) {
            actualTitle = webView.android.getTitle()
        }

        actualError = args.error;
        testFinished = true;
        // </hide>
        var message;
        if (!args.error) {
            message = "WebView finished loading " + args.url;
        }
        else {
            message = "Error loading " + args.url + ": " + args.error;
        }
    });
    webView.src = "~/ui/web-view/test.html";
    // ```
    // </snippet>

    TKUnit.wait(4);

    helper.goBack();

    if (testFinished) {
        if (webView.ios) {
            TKUnit.assert(actualHtml === expectedHtml, "File ~/ui/web-view/test.html not loaded properly. Actual: " + actualHtml);
        } else if (webView.android) {
            TKUnit.assert(actualTitle === expectedTitle, "File ~/ui/web-view/test.html not loaded properly. Actual: " + actualTitle);
        }
        TKUnit.assert(actualError === undefined, actualError);
    }
    else {
        TKUnit.assert(false, "TIMEOUT");
    }
}

export var testLoadHTMLString = function () {
    var newPage: page.Page;
    var webView = _createWebViewFunc();
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        newPage.content = webView;
        return newPage;
    };

    helper.navigate(pageFactory);

    var testFinished = false;
    var actualHtml;
    var actualTitle;
    var actualError;

    var expectedTitle = 'MyTitle';
    var expectedHtml = '<span style="color:red">Test</span>';

    // <snippet module="ui/web-view" title="WebView">
    // ### Using WebView
    // ``` JavaScript
    webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
        // <hide>
        if (webView.ios) {
            actualHtml = webView.ios.stringByEvaluatingJavaScriptFromString("document.body.innerHTML").trim();
        } else if (webView.android) {
            actualTitle = webView.android.getTitle()
        }

        actualError = args.error;
        testFinished = true;
        // </hide>
        var message;
        if (!args.error) {
            message = "WebView finished loading " + args.url;
        }
        else {
            message = "Error loading " + args.url + ": " + args.error;
        }
    });
    webView.src = '<!DOCTYPE html><html><head><title>MyTitle</title><meta charset="utf-8" /></head><body><span style="color:red">Test</span></body></html>';
    // ```
    // </snippet>

    TKUnit.wait(4);

    helper.goBack();

    if (testFinished) {
        if (webView.ios) {
            TKUnit.assert(actualHtml === expectedHtml, "HTML string not loaded properly. Actual: " + actualHtml);
        } else if (webView.android) {
            TKUnit.assert(actualTitle === expectedTitle, "HTML string not loaded properly. Actual: " + actualTitle);
        }
        TKUnit.assert(actualError === undefined, actualError);
    }
    else {
        TKUnit.assert(false, "TIMEOUT");
    }
}

export var testLoadInvalidUrl = function () {
    var newPage: page.Page;
    var webView = _createWebViewFunc();
    var pageFactory = function (): page.Page {
        newPage = new page.Page();
        newPage.content = webView;
        return newPage;
    };

    helper.navigate(pageFactory);

    var testFinished = false;
    var actualError;
    webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
        if (actualError) {
            // Android call this twice -- the second time args.error is undefined.
            return;
        }
        actualError = args.error;
        testFinished = true;
    });
    webView.url = "kofti://mnogokofti";

    TKUnit.wait(4);

    helper.goBack();

    if (testFinished) {
        TKUnit.assert(actualError !== undefined, "There should be an error.");
    }
    else {
        TKUnit.assert(false, "TIMEOUT");
    }
}
