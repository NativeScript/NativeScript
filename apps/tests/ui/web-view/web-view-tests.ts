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

// ### Declaring a WebView.
//```XML
//  <Page>
//      <WebView url="{{ someUrl }}" />
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
    webView.on(webViewModule.knownEvents.loadFinished, function (args: webViewModule.LoadEventData) {
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
        //console.log(message);
    });
    webView.url = "https://httpbin.org/html";

    TKUnit.wait(2);

    helper.goBack();

    if (testFinished) {
        TKUnit.assert(actualUrl === "https://httpbin.org/html", "args.url should equal https://httpbin.org/html");
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

    webView.on(webViewModule.knownEvents.loadFinished, function (args: webViewModule.LoadEventData) {
        testFinished = true;
        actualError = args.error;
    });
    webView.url = "kofti://mnogokofti";

    TKUnit.wait(2);

    helper.goBack();

    if (testFinished) {
        TKUnit.assert(actualError !== undefined, "There should be an error.");
    }
    else {
        TKUnit.assert(false, "TIMEOUT");
    }
}