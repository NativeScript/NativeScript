import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import viewModule = require("ui/core/view");

// <snippet module="ui/web-view" title="WebView">
// # WebView
// Using a WebView requires the web-view module.
// ``` JavaScript
import webViewModule = require("ui/web-view");
// ```
// </snippet>

var _createWebViewFunc = function (): webViewModule.WebView {
    // <snippet module="ui/web-view" title="WebView">
    // ### Creating a WebView
    // ``` JavaScript
    var webView = new webViewModule.WebView();
    // ```
    // </snippet>
    return webView;
}

export var testLoadExistingUrl = function (done) {
    helper.buildUIAndRunTest(_createWebViewFunc(), function (views: Array<viewModule.View>) {
        var webView = <webViewModule.WebView>views[0];
        // <snippet module="ui/web-view" title="WebView">
        // ### Using WebView,
        // ``` JavaScript
        webView.on(webViewModule.knownEvents.finished, function (args: webViewModule.FinishedEventData) {
            var message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }
            //console.log(message);
            // <hide>
            TKUnit.assert(args.url === "https://httpbin.org/html", "args.url should equal https://httpbin.org/html");
            TKUnit.assert(args.error === undefined, args.error);
            done();
            // </hide>
        });
        webView.url = "https://httpbin.org/html";
        // ```
        // </snippet>
    });    
}

export var testLoadInvalidUrl = function (done) {
    helper.buildUIAndRunTest(_createWebViewFunc(), function (views: Array<viewModule.View>) {
        var webView = <webViewModule.WebView>views[0];
        
        var errorReceived = false;
        webView.on(webViewModule.knownEvents.finished, function (args: webViewModule.FinishedEventData) {
            if (errorReceived) {
                return;
            }
            
            if (args.error) {
                errorReceived = true;
                done();
            }
        });
        
        webView.url = "kofti://mnogokofti";
    });
}