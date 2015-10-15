import TKUnit = require("../../TKUnit");
import helper = require("../helper");
import page = require("ui/page");
import testModule = require("../../ui-test");

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

export class WebViewTest extends testModule.UITest<webViewModule.WebView> {

    public create(): webViewModule.WebView {
        // <snippet module="ui/web-view" title="WebView">
        // ### Creating a WebView
        // ``` JavaScript
        let webView = new webViewModule.WebView();
        // ```
        // </snippet>
        return webView;
    }

    public testLoadExistingUrl(done) {
        let webView = this.testView;

        // <snippet module="ui/web-view" title="WebView">
        // ### Using WebView
        // ``` JavaScript
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            let message;
            if (!args.error) {
                message = "WebView finished loading " + args.url;
            }
            else {
                message = "Error loading " + args.url + ": " + args.error;
            }

            // <hide>
            try {
                TKUnit.assertEqual(args.url, "http://nsbuild01.telerik.com/docs/", "args.url");
                TKUnit.assertNull(args.error, "args.error");
                done(null);
            }
            catch (e) {
                done(e);
            }

            // </hide>
        });
        webView.url = "http://nsbuild01.telerik.com/docs/";
        // ```
        // </snippet>
    }

    public testLoadLocalFile(done) {
        let webView = this.testView;

        // <snippet module="ui/web-view" title="WebView">
        // ### Using WebView
        // ``` JavaScript
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            // <hide>
            let actual;
            let expectedTitle = 'MyTitle';
            let expectedHtml = '<span style="color:red">Test</span>';

            if (webView.ios) {
                actual = webView.ios.stringByEvaluatingJavaScriptFromString("document.body.innerHTML").trim();
            } else if (webView.android) {
                actual = webView.android.getTitle();
            }

            try {
                TKUnit.assertEqual(actual, webView.ios ? expectedHtml : expectedTitle, "File ~/ui/web-view/test.html not loaded properly.");
                TKUnit.assertNull(args.error, "args.error");
                done(null);
            }
            catch (e) {
                done(e);
            }
            // </hide>

            let message;
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
    }

    public testLoadHTMLString(done) {
        let webView = this.testView;

        // <snippet module="ui/web-view" title="WebView">
        // ### Using WebView
        // ``` JavaScript
        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            // <hide>

            let actual;
            let expected;

            if (webView.ios) {
                actual = webView.ios.stringByEvaluatingJavaScriptFromString("document.body.innerHTML").trim();
                expected = '<span style="color:red">Test</span>';
            } else if (webView.android) {
                actual = webView.android.getTitle();
                expected = 'MyTitle';
            }

            try {
                TKUnit.assertEqual(actual, expected, "HTML string not loaded properly. Actual: ");
                TKUnit.assertNull(args.error, "args.error");
                done(null);
            }
            catch (e) {
                done(e);
            }
            // </hide>

            let message;
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
    }

    public testLoadInvalidUrl(done) {
        let webView = this.testView;
        let actualError;

        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            if (actualError) {
                // Android call this twice -- the second time args.error is undefined.
                return;
            }
            actualError = args.error;
            try {
                TKUnit.assert(actualError !== undefined, "There should be an error.");
                done(null);
            }
            catch (e) {
                done(e);
            }
        });
        webView.url = "kofti://mnogokofti";
    }

    public testLoadUpperCaseSrc(done) {
        let webView = this.testView;
        let targetSrc = "HTTP://nsbuild01.telerik.com/docs/";

        webView.on(webViewModule.WebView.loadFinishedEvent, function (args: webViewModule.LoadEventData) {
            try {
                TKUnit.assertEqual(args.url, targetSrc.toLowerCase(), "args.url");
                TKUnit.assertNull(args.error, "args.error");
                done(null);
            }
            catch (e) {
                done(e);
            }
        });

        webView.src = targetSrc;
    }
}

export function createTestCase(): WebViewTest {
    return new WebViewTest();
}